import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { claimedBy } from "../scope.js";
import type { Answer, Ask } from "../record-client.js";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { claim, createPackage, place, transition, withJsonProject, type JsonProject } from "./helpers/json-workbench.js";

// Drives the real `bin/fusion-claimed-package` against workbenches the kernel wrote: every code of
// its header's exit table, and above all the case a first-match implementation passes silently and
// wrongly — two claims by one checkout is REFUSED, both named, nothing on stdout. The last block drives
// `claimedBy` through an injected `ask`, for the answers no fixture can hold: a store that moves under
// the read, and a blocked recovery reported inside an `ok: true` answer.

const script = join(pluginRoot, "bin", "fusion-claimed-package");
const identity = join(pluginRoot, "bin", "fusion-identity");
const ALPHA = "260910-1000-alpha";
const BETA = "260910-1100-beta";
const LINES = `PACKAGE=work-packages/${ALPHA}/${ALPHA}.md\nCONTAINER=work-packages/${ALPHA}\n`;

/** Git reads none of the developer's own config: a global `user.name` would
 *  make the no-identity case pass for the wrong reason. */
const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };

const sh = (cmd: string, args: string[], cwd: string) =>
  ((r) => ({ status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" }))(spawnSync(cmd, args, { cwd, env, encoding: "utf-8" }));
const run = (cwd: string, ...args: string[]) => sh(script, args, cwd);

/** This checkout's eight hex, through the one helper that mints and prints it. */
function checkout(dir: string): string {
  const m = /^CHECKOUT=(.*)$/m.exec(sh(identity, [], dir).stdout);
  expect(m, "the identity helper printed no CHECKOUT line").not.toBeNull();
  return m![1];
}

/** A git work tree around the project, with a `user.name` unless `named` is false. */
const git = (p: JsonProject, named = true): void => {
  for (const a of [["init", "-q"], ["config", "user.email", "scratch@example.com"], ...(named ? [["config", "user.name", "Scratch Person"]] : [])]) sh("git", a, p.root);
};

/** A work tree with an identity; returns this checkout's hex. */
const mine = (p: JsonProject): string => (git(p), checkout(p.root));

describe("bin/fusion-claimed-package", () => {
  it("prints both lines for the one package this checkout claimed", () => {
    withJsonProject((p) => {
      claim(p, createPackage(p, ALPHA), mine(p));
      createPackage(p, BETA);
      const r = run(p.root);
      expect(r.status, r.stderr).toBe(0);
      expect(r.stdout).toBe(LINES);
    });
  }, CASE_TIMEOUT);

  it("refuses two claims rather than taking the first", () => {
    // The case the whole exit table turns on. A first match would resolve here,
    // and would file this item's work into the other item's container.
    withJsonProject((p) => {
      const me = mine(p);
      claim(p, createPackage(p, ALPHA), me);
      claim(p, createPackage(p, BETA), me);
      const r = run(p.root);
      expect(r.status).toBe(3);
      expect(r.stdout, "nothing is resolved and nothing falls back to the shared store").toBe("");
      expect(r.stderr).toContain(`work-packages/${ALPHA}/${ALPHA}.md`);
      expect(r.stderr).toContain(`work-packages/${BETA}/${BETA}.md`);
      expect(r.stderr).toContain("which one is in scope cannot be determined");
    });
  }, CASE_TIMEOUT);

  it.each([
    ["no package is claimed at all", (p: JsonProject) => void createPackage(p, ALPHA)],
    ["the claim names another checkout", (p: JsonProject) => void claim(p, createPackage(p, ALPHA), "ffffffff")],
    ["the claim sits on a terminal package", (p: JsonProject) => {
      // A terminal record keeps its historical claim (spec 4.2), and `status` decides.
      const pkg = createPackage(p, ALPHA);
      claim(p, pkg, mine(p));
      transition(p, pkg, "dropped", { outcome: { class: "dropped", reason: "a test dropped it", evidence: [] } });
    }],
    ["the container store does not exist yet", () => undefined],
  ])("exit 0 with no output when %s", (_, seed) => {
    withJsonProject((p) => {
      git(p);
      seed(p);
      const r = run(p.root);
      expect(r.status, r.stderr).toBe(0);
      expect(r.stdout).toBe("");
    });
  }, CASE_TIMEOUT);

  it("a tree that is not a git work tree is exit 0, even with a claim naming its minted checkout", () => {
    // Not exit 3: no claim is held where the multi-checkout arrangement does not
    // reach, so the shared store is the TRUE answer and not a degraded one. The
    // cost is stated in the header: this claim is not read, and the codec is not asked.
    withJsonProject((p) => {
      claim(p, createPackage(p, ALPHA), checkout(p.root));
      const r = run(p.root);
      expect(r.status, r.stderr).toBe(0);
      expect(r.stdout).toBe("");
      expect(r.stderr).toContain("not a git work tree");
    });
  }, CASE_TIMEOUT);

  it("exit 3, naming the record, when a package does not read", () => {
    // Its status is unknown, so the claimed set is undetermined; a conflict
    // marker is a state the kernel never writes, so the file is placed by hand.
    withJsonProject((p) => {
      const pkg = createPackage(p, ALPHA);
      claim(p, pkg, mine(p));
      place(p, pkg.path, `<<<<<<< ours\n${readFileSync(resolve(p.workbench, pkg.path), "utf-8")}=======\n>>>>>>> theirs\n`);
      const r = run(p.root);
      expect(r.status).toBe(3);
      expect(r.stdout).toBe("");
      expect(r.stderr).toContain(`${pkg.path} does not read`);
    });
  }, CASE_TIMEOUT);

  it.each([
    ["legacy", { legacy: true }, (): void => undefined, "is legacy"],
    ["unsupported", {}, (p: JsonProject): void => {
      const manifest = JSON.parse(readFileSync(resolve(p.workbench, "workbench.json"), "utf-8")) as { required_features: string[] };
      manifest.required_features.push("json-control-v9");
      place(p, "workbench.json", JSON.stringify(manifest, null, 2) + "\n");
    }, "unknown-feature"],
  ])("exit 3, the state on stderr and nothing on stdout, when the workbench is %s", (state, options, seed, detail) => {
    // Refused by name, and never read as a workbench with nothing claimed in it.
    withJsonProject((p) => {
      git(p);
      seed(p);
      const r = run(p.root);
      expect(r.status).toBe(3);
      expect(r.stdout).toBe("");
      expect(r.stderr).toContain(state);
      expect(r.stderr).toContain(detail);
    }, options);
  }, CASE_TIMEOUT);

  it("exit 3 when the checkout identifier cannot be read inside a git work tree", () => {
    // The other half of the not-a-work-tree pair, and the reason the two must not merge.
    withJsonProject((p) => {
      git(p);
      writeFileSync(resolve(p.workbench, ".checkout-id"), "not-hex\n");
      const r = run(p.root);
      expect(r.status).toBe(3);
      expect(r.stdout).toBe("");
      expect(r.stderr).toContain("item in scope is unknown");
    });
  }, CASE_TIMEOUT);

  it.each([
    ["no workbench above the working directory", (p: JsonProject) => resolve(p.root, ".."), "no fusion workbench"],
    ["git user.name is unset inside a work tree", (p: JsonProject) => (git(p, false), p.root), "bin/fusion-identity stopped"],
  ])("exit 1, the only code that means stop, when %s", (_, cwd, reason) => {
    withJsonProject((p) => {
      const r = run(cwd(p));
      expect(r.status).toBe(1);
      expect(r.stdout).toBe("");
      expect(r.stderr).toContain(reason);
    });
  }, CASE_TIMEOUT);

  it("exit 2 on any argument, with nothing on stdout", () => withJsonProject((p) => expect(run(p.root, "--help")).toMatchObject({ status: 2, stdout: "" })));
});

describe("claimedBy through an injected ask", () => {
  const PATH = `work-packages/${ALPHA}/package.json`;
  const result = (result: unknown): Answer => ({ kind: "result", result, revisions: {} });
  const inspect = result({ state: "json-control", id: "0b1d5f4a-6c1e-4d9a-9f2a-1e0c3b6d8a7f" });
  const shown = (revision: string): Answer =>
    result({ path: PATH, kind: "package", revision, control: { status: "claimed", claim: { checkout_id: "a1b2c3d4" } }, narrative: { path: `work-packages/${ALPHA}/${ALPHA}.md` } });

  /** An ask answering from `byOp`, counting the calls per op. */
  function asking(byOp: Record<string, (n: number) => Answer>): { ask: Ask; calls: Record<string, number> } {
    const calls: Record<string, number> = {};
    return { calls, ask: (_wb, req) => (calls[req.op] = (calls[req.op] ?? 0) + 1, byOp[req.op](calls[req.op])) };
  }

  it("re-reads once when show names another revision than list, and is store-changing the second time", () => {
    const listed = result({ records: [{ path: PATH, kind: "package", status: "claimed", revision: "aaa" }] });
    const { ask, calls } = asking({ inspect: () => inspect, list: () => listed, show: () => shown("bbb") });
    expect(claimedBy("/wb", "a1b2c3d4", ask)).toEqual({ kind: "unknown", cause: "store-changing", path: PATH, listed: "aaa", shown: "bbb" });
    // One bounded re-read, a new observation of both: not a retry of `show` alone, and no third.
    expect(calls).toEqual({ inspect: 1, list: 2, show: 2 });
    // And a store that settled on the re-read resolves.
    const settled = asking({ inspect: () => inspect, list: (n) => (n === 1 ? listed : result({ records: [{ path: PATH, kind: "package", status: "claimed", revision: "bbb" }] })), show: () => shown("bbb") });
    expect(claimedBy("/wb", "a1b2c3d4", settled.ask)).toMatchObject({ kind: "one", container: `work-packages/${ALPHA}` });
  });

  it("stops on a blocked recovery reported inside an ok: true list answer, as the refusal it is", () => {
    const problem = { class: "operation-unknown", reason: "recovery-blocked", detail: "operation x is pending" };
    const { ask, calls } = asking({ inspect: () => inspect, list: () => result({ records: [{ path: PATH, problem }] }), show: () => shown("aaa") });
    expect(claimedBy("/wb", "a1b2c3d4", ask)).toEqual({ kind: "unknown", cause: "refused", op: "list", refusal: problem });
    expect(calls.show, "nothing was read past the finding").toBeUndefined();
  });

  it("hands a typed refusal and an unanswered call on as what they are, never as nothing claimed", () => {
    const refused: Answer = { kind: "refused", class: "conflict", reason: "lock-timeout", detail: "held by 1234" };
    expect(claimedBy("/wb", "a1b2c3d4", asking({ inspect: () => inspect, list: () => refused }).ask))
      .toEqual({ kind: "unknown", cause: "refused", op: "list", refusal: { class: "conflict", reason: "lock-timeout", detail: "held by 1234" } });
    const listed = result({ records: [{ path: PATH, kind: "package", status: "claimed", revision: "aaa" }] });
    const gone: Answer = { kind: "unanswered", cause: "timeout", detail: "stopped" };
    expect(claimedBy("/wb", "a1b2c3d4", asking({ inspect: () => inspect, list: () => listed, show: () => gone }).ask))
      .toEqual({ kind: "unknown", cause: "unanswered", op: "show", how: "timeout", detail: "stopped" });
  });
});

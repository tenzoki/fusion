import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ask, type Answer, type Ask, type CodecRequest } from "../record-client.js";
import { PAYLOAD_FIELDS, parseFlags, write, type Identity, type Outcome } from "../record-write.js";
import { CASE_TIMEOUT, REPO_ROOT } from "./helpers/guard-harness.js";
import { BUNDLE, claim, createPackage, must, withJsonProject, type JsonProject } from "./helpers/json-workbench.js";

// ---------------------------------------------------------------------------
// The write client: the gate, the show, the ownership check of response 22
// (a), one mutation and its rows, against the real bundle. `through` stands in
// for the codec only where a case needs an answer no workbench can give: a
// write landing between the show and the mutation, and an answer that never
// arrives. The plan step's note records each case red against a broken copy.
// ---------------------------------------------------------------------------

const ME = "5e8248d7";
const OTHER = "0b0b0b0b";
const real: Ask = (w, r) => ask(w, r, { bundle: BUNDLE });
const UNANSWERED: Answer = { kind: "unanswered", cause: "timeout", detail: "stopped" };

/** One call as `bin/fusion-write` makes it, and every request it sent. */
function run(p: JsonProject, sub: string, args: string[], identity: Identity = { checkout: ME }, through: Ask = real): { o: Outcome; sent: CodecRequest[] } {
  const sent: CodecRequest[] = [];
  const parsed = parseFlags(sub, args);
  if ("usage" in parsed) return { o: { kind: "usage", detail: parsed.usage }, sent };
  return { o: write({ ...parsed.call, workbench: p.workbench, identity }, (w, r) => (sent.push(r), through(w, r))), sent };
}
const mutations = (sent: CodecRequest[]): string[] => sent.map((r) => r.op).filter((op) => op !== "inspect" && op !== "show");
const rows = (p: JsonProject): Record<string, unknown>[] => {
  const log = resolve(p.workbench, "orchestrator-events.jsonl");
  return existsSync(log) ? readFileSync(log, "utf-8").split("\n").filter((l) => l !== "").map((l) => JSON.parse(l)) : [];
};
const revisionOf = (p: JsonProject, path: string): unknown => must(p, { op: "show", record: { path } }).result.revision;

describe("ownership, response 22 (a)", () => {
  it("the owner releases; another checkout, an unreadable identity and a non-claimed source each take their own branch", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1300-p");
      const on = ["--record", pkg.path, "--actor", "user"];
      const release = (id: Identity) => run(p, "release", [...on, "--reason", "set aside"], id);
      // Not claimed: no claim to check, so the codec refuses; an unreadable identity cannot claim.
      expect(release({}).o).toMatchObject({ kind: "refused", refusal: { class: "conflict", reason: "not-claimed" } });
      expect(run(p, "claim", on, {}).o.kind).toBe("ownership");
      expect(run(p, "claim", on).o).toMatchObject({ kind: "landed", event: "logged" });
      const refused = [release({ checkout: OTHER }), release({}), run(p, "transition", [...on, "--to", "paused", "--reason", "r"], { checkout: OTHER })];
      expect(refused.map((r) => [r.o.kind, /could not be read/.test((r.o as { detail: string }).detail), mutations(r.sent)])).toEqual([["ownership", false, []], ["ownership", true, []], ["ownership", false, []]]);
      expect(release({ checkout: ME, person: "Test Person <t@example.com>" }).o).toMatchObject({ kind: "landed", event: "logged" });
      // Out of `open` there is no claim to hold, so no identity is read.
      expect(run(p, "transition", [...on, "--to", "paused", "--reason", "r"], {}).o.kind).toBe("landed");
      expect(rows(p).map((r) => [r.op, r.checkout, r.change])).toEqual([
        ["claim", ME, { from: "open", to: "claimed" }],
        ["release", ME, { from: "claimed", to: "open" }],
        ["transition", undefined, { from: "open", to: "paused" }],
      ]);
    });
  });
});

describe("one request, and no retry", () => {
  it("a write landed between show and the mutation is revision-mismatch: one request, no row", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1300-p");
      const racing: Ask = (w, r) => (r.op === "set-mode" && claim(p, pkg, OTHER), real(w, r));
      const r = run(p, "set-mode", ["--record", pkg.path, "--actor", "user", "--value", "ordinary"], { checkout: ME }, racing);
      expect(r.o).toMatchObject({ kind: "refused", refusal: { class: "conflict", reason: "revision-mismatch" } });
      expect([mutations(r.sent), rows(p)]).toEqual([["set-mode"], []]);
    });
  });

  it("an unanswered mutation is unknown and not retried; the re-send answers the stored bytes and writes no row", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1300-p");
      const args = ["--record", pkg.path, "--actor", "user"];
      const lost = run(p, "claim", args, { checkout: ME }, (w, r) => (r.op === "claim" ? (real(w, r), UNANSWERED) : real(w, r)));
      expect([lost.o.kind, mutations(lost.sent), rows(p)]).toEqual(["unknown", ["claim"], []]);
      const u = lost.o as Outcome & { kind: "unknown" };
      const again = () => run(p, "claim", [...args, "--operation-id", u.operationId, "--expected-revision", u.expectedRevision, "--claimed-at", u.claimedAt!]).o;
      const expected = { kind: "landed", operationId: u.operationId, revisions: { [pkg.path]: revisionOf(p, pkg.path) }, event: "unlogged" };
      expect([again(), again(), rows(p)]).toMatchObject([expected, expected, []]);
    });
  });
});

describe("what is sent", () => {
  it("a flag outside the subcommand, or a payload field the record's kind does not carry, is a usage error and sends nothing", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, "260930-1300-p");
      const on = ["--record", pkg.path, "--actor", "user"];
      for (const [sub, extra] of [["release", ["--reason", "r", "--force", "x"]], ["set-mode", ["--value", "autonomous"]], ["transition", ["--to", "dropped", "--reason", "r", "--disposition", "null"]]] as const) {
        const r = run(p, sub, [...on, ...extra]);
        expect([r.o.kind, mutations(r.sent)], `${sub} ${extra.join(" ")}`).toEqual(["usage", []]);
      }
    });
  });

  it("PAYLOAD_FIELDS is the transition payload read against each kind's control fields in the codec's schemas", () => {
    const schema = (f: string) => JSON.parse(readFileSync(resolve(REPO_ROOT, "codec", "schemas", f), "utf-8"));
    const payload = schema("protocol.schema.json").oneOf.find((b: { properties: { op: { const?: string } } }) => b.properties.op.const === "transition").properties.payload.properties;
    const kinds: Record<string, object> = { package: schema("package.schema.json").properties };
    for (const k of ["issue", "plan", "decision", "discussion"]) kinds[k] = schema("record.schema.json").$defs[`${k}_control`].properties;
    expect(Object.fromEntries(Object.entries(kinds).map(([k, props]) => [k, Object.keys(payload).filter((f) => f in props)]))).toEqual(PAYLOAD_FIELDS);
  });

  it("legacy with a pending initialize is refused and names Setup: only inspect is sent", () => {
    withJsonProject((p) => {
      cpSync(resolve(REPO_ROOT, "codec", "fixtures", "protocol-session-initialize", "seed", "16-inspect", "pending"), p.workbench, { recursive: true });
      // The seed carries a placeholder for its request's digest; inspect reads the intent and not the request, so any digest serves.
      const intent = resolve(p.workbench, ".json-state", "journal", "1a1e0017-0000-4000-8000-000000000017", "intent.json");
      writeFileSync(intent, readFileSync(intent, "utf-8").replace(/<request-digest:[^>]+>/, `sha256:${"0".repeat(64)}`));
      const r = run(p, "claim", ["--record", "work-packages/x/package.json", "--actor", "user"]);
      expect(r.o).toMatchObject({ kind: "unread", detail: expect.stringContaining("Run /fusion:setup") });
      expect(r.sent.map((q) => q.op)).toEqual(["inspect"]);
    }, { legacy: true });
  });
});

describe("bin/fusion-write", () => {
  it("prints KEY=value lines and exits by the header's table", () => {
    withJsonProject((p) => {
      const env = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null" };
      for (const a of [["init", "-q"], ["config", "user.email", "s@example.com"], ["config", "user.name", "Scratch"]]) spawnSync("git", a, { cwd: p.root, env });
      const [mine, theirs] = [createPackage(p, "260930-1300-a"), createPackage(p, "260930-1301-b")];
      claim(p, theirs, OTHER);
      const cli = (...args: string[]) => spawnSync(resolve(REPO_ROOT, "bin", "fusion-write"), args, { cwd: p.root, env, encoding: "utf-8" });
      const ok = cli("claim", "--record", mine.path, "--actor", "user");
      expect(ok.stdout.split("\n").map((l) => l.split("=")[0])).toEqual(["result", "operation_id", "path", "revision", "event", ""]);
      const codes = [ok, cli("claim", "--record", mine.path, "--actor", "user"), cli("release", "--record", theirs.path, "--actor", "user", "--reason", "r"), cli("claim", "--bogus"), cli("log-repair")];
      expect(codes.map((r) => r.status)).toEqual([0, 6, 5, 2, 0]);
    });
  }, CASE_TIMEOUT);
});

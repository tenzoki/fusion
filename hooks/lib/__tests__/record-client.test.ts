import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { ask, CODEC_WAIT_MS, DEFAULT_TIMEOUT_MS, gate, MAX_RESPONSE_BYTES, POST_WAIT_MARGIN_MS, type Answer } from "../record-client.js";
import { CASE_TIMEOUT, HOOKS_DIR, TEST_DIST } from "./helpers/guard-harness.js";
import { BUNDLE, claim, createPackage, must, place, send, setDependencies, transition, withJsonProject } from "./helpers/json-workbench.js";

// ---------------------------------------------------------------------------
// The record client: three answers, and a gate that refuses by name.
//
// WHAT THESE CASES HOLD APART. A typed refusal and an unanswered call are two
// different failures, and neither is an empty store. Every case below that
// expects one of them asserts `kind` (or the gate's `state`) and the token
// under it, so a client that collapsed the two, or turned either into a result
// with nothing in it, fails here by name.
//
// The bundle is the real one, spawned. Only the three transport cases put a
// stand-in in its place, because a bundle that answers cannot be made to exit
// without output.
// ---------------------------------------------------------------------------

const MANIFEST_ID = (JSON.parse(readFileSync(resolve(HOOKS_DIR, "..", "codec", "fixtures", "workbench", "workbench.json"), "utf-8")) as { id: string }).id;
const FIRST = "260929-1201-first";
const SECOND = "260929-1202-second";

/** A file the client is pointed at in the bundle's place. Removed with its directory. */
function withStandIn<T>(source: string, fn: (path: string) => T): T {
  const dir = realpathSync(mkdtempSync(resolve(tmpdir(), "fusion-standin-")));
  const path = resolve(dir, "stand-in.cjs");
  writeFileSync(path, source, "utf-8");
  try {
    return fn(path);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("the gate names the workbench's state", () => {
  it("admits a JSON-controlled workbench and hands back its id", () => {
    withJsonProject((p) => {
      expect(gate(p.workbench, { bundle: BUNDLE })).toEqual({ state: "json-control", id: MANIFEST_ID });
    });
  }, CASE_TIMEOUT);

  it("refuses a workbench without a manifest as legacy", () => {
    withJsonProject((p) => {
      expect(gate(p.workbench, { bundle: BUNDLE })).toEqual({ state: "legacy" });
    }, { legacy: true });
  }, CASE_TIMEOUT);

  it("refuses a manifest requiring a feature no codec knows as unsupported, with the codec's diagnosis", () => {
    withJsonProject((p) => {
      const manifest = JSON.parse(readFileSync(resolve(p.workbench, "workbench.json"), "utf-8")) as { required_features: string[] };
      manifest.required_features.push("json-control-v9");
      place(p, "workbench.json", JSON.stringify(manifest, null, 2) + "\n");

      const answer = gate(p.workbench, { bundle: BUNDLE });
      expect(answer).toMatchObject({ state: "unsupported", diagnosis: { class: "unsupported-format", reason: "unknown-feature" } });
      // And a read of such a workbench is a refusal carrying that diagnosis, never a list with nothing in it.
      expect(send(p, { op: "list", scope: "work-packages" })).toMatchObject({ kind: "refused", class: "unsupported-format", reason: "unknown-feature" });
    });
  }, CASE_TIMEOUT);

  it("is unanswered, and says bundle-missing, when the bundle path names no file", () => {
    withJsonProject((p) => {
      const absent = resolve(p.root, "no-such", "fusion-record.js");
      expect(gate(p.workbench, { bundle: absent })).toMatchObject({ state: "unanswered", cause: "bundle-missing" });
      expect(existsSync(resolve(p.workbench, ".json-state")), "a call that reached no codec wrote state").toBe(false);
    });
  }, CASE_TIMEOUT);

  it("passes a refusal and an answer it cannot place on as what they are, through an injected ask", () => {
    const refused: Answer = { kind: "refused", class: "unknown-scope", reason: "workbench-missing", detail: "d" };
    expect(gate("/nowhere", { ask: () => refused })).toEqual({ state: "refused", class: "unknown-scope", reason: "workbench-missing", detail: "d" });
    // A state added after this client was written must not pass as one it knows.
    const later: Answer = { kind: "result", result: { state: "json-control-v2", id: MANIFEST_ID }, revisions: {} };
    expect(gate("/nowhere", { ask: () => later })).toMatchObject({ state: "unanswered", cause: "unparseable" });
    // Nor does `json-control` without an id admit anything.
    const noId: Answer = { kind: "result", result: { state: "json-control", id: null }, revisions: {} };
    expect(gate("/nowhere", { ask: () => noId })).toMatchObject({ state: "unanswered", cause: "unparseable" });
  });
});

describe("a refusal and an unanswered call stay two answers", () => {
  it("hands the codec's typed refusal through: show of a record that is not there", () => {
    withJsonProject((p) => {
      const answer = send(p, { op: "show", record: { path: "work-packages/260929-1200-absent/package.json" } });
      expect(answer.kind).toBe("refused");
      expect(answer).toMatchObject({ class: "unresolved-reference", reason: "record-not-found" });
    });
  }, CASE_TIMEOUT);

  it("is unanswered/exit when the child exits non-zero, with its stderr line in the detail, or outgrows the response bound", () => {
    withStandIn('process.stderr.write("the schemas do not load\\n"); process.exit(3);\n', (bundle) => {
      const answer = ask("/nowhere", { op: "inspect" }, { bundle });
      expect(answer).toMatchObject({ kind: "unanswered", cause: "exit" });
      expect((answer as { detail: string }).detail).toContain("exited 3");
      expect((answer as { detail: string }).detail).toContain("the schemas do not load");
    });
    // An answer past MAX_RESPONSE_BYTES is `exit` too, and never a truncated result.
    withStandIn(`process.stdout.write("x".repeat(${MAX_RESPONSE_BYTES + 1}));\n`, (bundle) => {
      expect(ask("/nowhere", { op: "inspect" }, { bundle })).toMatchObject({ kind: "unanswered", cause: "exit", detail: expect.stringContaining("ENOBUFS") });
    });
  }, CASE_TIMEOUT);

  it("waits out every default wait the codec's source states, by the stated margin", () => {
    const source = (file: string): string => readFileSync(resolve(HOOKS_DIR, "..", "codec", "src", file), "utf-8");
    const ms = (text: string | undefined): number => Number((text ?? "NaN").replace(/_/g, ""));
    const stale = ms(/export const LOCK_STALE_MS = ([\d_]+);/.exec(source("store.ts"))?.[1]);
    const waits = ["kernel.ts", "store.ts"].flatMap((f) => [...source(f).matchAll(/waitMs = options\.waitMs \?\? (?:LOCK_STALE_MS \+ ([\d_]+)|[^;]+);/g)].map((m) => stale + ms(m[1])));
    expect([waits, DEFAULT_TIMEOUT_MS]).toEqual([[CODEC_WAIT_MS, CODEC_WAIT_MS], CODEC_WAIT_MS + POST_WAIT_MARGIN_MS]);
  });

  it("is unanswered/timeout when the child does not answer in time, and asks once", () => {
    withStandIn('require("node:fs").appendFileSync(__dirname + "/starts", "x"); setTimeout(() => {}, 60000);\n', (bundle) => {
      expect(ask("/nowhere", { op: "inspect" }, { bundle, timeoutMs: 1500 })).toMatchObject({ kind: "unanswered", cause: "timeout" });
      // No retry: the stand-in was started exactly once.
      expect(readFileSync(resolve(bundle, "..", "starts"), "utf-8")).toBe("x");
    });
  }, CASE_TIMEOUT);

  it("is unanswered/unparseable for output that is not the one-line envelope, none at all included", () => {
    for (const out of ["", '{"ok":true}', '{"ok":true,"result":1}\n{"ok":true,"result":2}\n', "not json\n", '{"ok":false,"error":{"class":"conflict"}}\n']) {
      withStandIn(`process.stdout.write(${JSON.stringify(out)});\n`, (bundle) => {
        expect(ask("/nowhere", { op: "inspect" }, { bundle }), JSON.stringify(out)).toMatchObject({ kind: "unanswered", cause: "unparseable" });
      });
    }
  }, CASE_TIMEOUT);
});

describe("the request reaches the kernel, and a read of a settled store writes nothing", () => {
  it("lands create, claim, set-dependencies and transition, and reads them back", () => {
    withJsonProject((p) => {
      const first = createPackage(p, FIRST);
      const second = createPackage(p, SECOND);
      const claimed = claim(p, first, "a1b2c3d4");
      setDependencies(p, second, [{ target: first, condition: "succeeded" }]);
      transition(p, second, "paused");

      const shown = must(p, { op: "show", record: { path: first.path } }).result as { revision: string; control: { status: string; claim: { checkout_id: string } } };
      expect(shown.control).toMatchObject({ status: "claimed", claim: { checkout_id: "a1b2c3d4" } });
      // The revisions a mutation names are the ones a read then finds.
      expect(claimed.revisions[first.path]).toBe(shown.revision);

      const other = must(p, { op: "show", record: { path: second.path } }).result as { control: { status: string; depends_on: Array<{ target: { record_id: string }; condition: string }> } };
      expect(other.control.status).toBe("paused");
      expect(other.control.depends_on).toMatchObject([{ target: { record_id: first.id }, condition: "succeeded" }]);

      const rows = (must(p, { op: "list", scope: "work-packages" }).result.records as Array<{ path: string; status: string }>).map((r) => [r.path, r.status]);
      expect(rows).toEqual([[first.path, "claimed"], [second.path, "paused"]]);
    });
  }, CASE_TIMEOUT);

  it("leaves no .json-state behind when it reads a workbench that has no journal", () => {
    withJsonProject((p) => {
      const pkg = createPackage(p, FIRST);
      // What a fresh clone holds: the records, and no state directory, which ignores itself.
      rmSync(resolve(p.workbench, ".json-state"), { recursive: true, force: true });

      expect(gate(p.workbench, { bundle: BUNDLE }).state).toBe("json-control");
      for (const request of [{ op: "list", scope: "work-packages" }, { op: "show", record: { path: pkg.path } }, { op: "validate" }, { op: "reconcile" }]) {
        expect(send(p, request).kind, request.op).toBe("result");
      }
      expect(existsSync(resolve(p.workbench, ".json-state")), "a read of a settled store created the state directory").toBe(false);
    });
  }, CASE_TIMEOUT);
});

describe("the default bundle is the one beside the compiled module", () => {
  /** An install's layout in a scratch directory: the compiled client, and the bundle where it looks for it. */
  function withInstall<T>(fn: (plugin: string, run: (workbench: string) => unknown) => T): T {
    const plugin = resolve(realpathSync(mkdtempSync(resolve(tmpdir(), "fusion-install-"))), "plugin");
    mkdirSync(resolve(plugin, "hooks", "dist", "lib"), { recursive: true });
    mkdirSync(resolve(plugin, "codec", "dist"), { recursive: true });
    cpSync(resolve(HOOKS_DIR, "package.json"), resolve(plugin, "hooks", "package.json"));
    cpSync(resolve(TEST_DIST, "lib", "record-client.js"), resolve(plugin, "hooks", "dist", "lib", "record-client.js"));
    cpSync(BUNDLE, resolve(plugin, "codec", "dist", "fusion-record.js"));
    const script = `import { gate } from ${JSON.stringify(resolve(plugin, "hooks", "dist", "lib", "record-client.js"))}; console.log(JSON.stringify(gate(process.argv[1])));`;
    const run = (workbench: string): unknown => {
      const child = spawnSync(process.execPath, ["--input-type=module", "-e", script, workbench], { encoding: "utf-8" });
      if (child.status !== 0) throw new Error(`the compiled client exited ${child.status}: ${child.stderr}`);
      return JSON.parse(child.stdout);
    };
    try {
      return fn(plugin, run);
    } finally {
      rmSync(resolve(plugin, ".."), { recursive: true, force: true });
    }
  }

  it("answers from <plugin>/codec/dist, and says bundle-missing once that file is gone", () => {
    withJsonProject((p) => {
      withInstall((plugin, run) => {
        expect(run(p.workbench)).toEqual({ state: "json-control", id: MANIFEST_ID });
        rmSync(resolve(plugin, "codec"), { recursive: true });
        expect(run(p.workbench)).toMatchObject({ state: "unanswered", cause: "bundle-missing" });
      });
    });
  }, CASE_TIMEOUT);
});

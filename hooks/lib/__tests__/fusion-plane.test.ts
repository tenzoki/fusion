import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, cpSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// fusion-plane dry-run / mock-Plane suite (bounded-bridge plan Step 8).
//
// `bin/fusion-plane` is a bash helper. Like `bin/fusion-paths`, there is no
// unit-testable module, so these tests drive the REAL script through
// child_process against throwaway fixture workbenches — the same seam an agent
// exercises. The plan's design makes this possible: `push --plan` and
// `seed --plan` are pure dry-run seams that emit deterministic JSON and execute
// NO curl. Every network-free assertion below runs against those seams; the two
// deferral tests drive the live path against a guaranteed-unreachable host.
//
// The helper's contract (verified against the committed `bin/fusion-plane`,
// commits 982336f / bd62bf1, not assumed):
//   * `push [--all|--circle <dir>] --plan`  -> {"ops":[ ... ]} on stdout, exit 0,
//     no curl. Each op carries op/kind/natural_key/title/marker/state/
//     state_instance/plane_id/parent_key/attach/embed_key/source.
//   * A fully-reconciled Circle (map states match) yields {"ops":[]} — the
//     idempotency property, observable without a network.
//   * `seed --plan --fixture <json> <seq>` -> the extracted brief as JSON, exit 0.
//   * Deferral (absent key OR unreachable host) -> a `.plane-outbox.jsonl` line
//     and EXIT_DEFERRED (10), never a crash; `seed` prints the manual-paste
//     fallback JSON (board_url + fetch_cmd) and exits 10.
//
// FUSION_PLANE_WORKBENCH points the helper at a fixture workbench, bypassing the
// `.fusion-setup` upward walk. `push --plan` calls `map_ensure` (it writes an
// empty `.plane-map.json`), so EVERY helper invocation gets a FRESH tmp copy of
// the committed fixture tree — runtime writes land in tmp, the committed fixture
// is never mutated.
// ---------------------------------------------------------------------------

const EXIT_DEFERRED = 10;

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, "../../..");
const fusionPlane = join(pluginRoot, "bin", "fusion-plane");
const fixtureRoot = join(here, "fixtures", "plane");
const fixtureWorkbench = join(fixtureRoot, "workbench");

const CIRCLE = "260719-1536-demo-circle";

interface RunResult {
  status: number;
  stdout: string;
  stderr: string;
}

/** Run fusion-plane with a fixture workbench. Never throws (exit 10 is normal). */
function run(workbench: string, ...args: string[]): RunResult {
  try {
    const stdout = execFileSync(fusionPlane, args, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FUSION_PLANE_WORKBENCH: workbench },
    });
    return { status: 0, stdout, stderr: "" };
  } catch (err: any) {
    return {
      status: err.status ?? -1,
      stdout: err.stdout?.toString() ?? "",
      stderr: err.stderr?.toString() ?? "",
    };
  }
}

// --- Throwaway fixture-workbench copies, cleaned up after each test ----------
const scratch: string[] = [];

/** Fresh tmp copy of the committed fixture workbench. Runtime writes go here. */
function freshWorkbench(): string {
  const root = mkdtempSync(join(tmpdir(), "fusion-plane-"));
  const wb = join(root, "workbench");
  cpSync(fixtureWorkbench, wb, { recursive: true });
  scratch.push(root);
  return wb;
}

afterEach(() => {
  while (scratch.length) rmSync(scratch.pop()!, { recursive: true, force: true });
});

/** Parse the {"ops":[...]} dry-run JSON off stdout. */
function plan(stdout: string): { ops: any[] } {
  return JSON.parse(stdout);
}

/** The op for a given natural key, or undefined. */
function opFor(ops: any[], key: string): any {
  return ops.find((o) => o.natural_key === key);
}

const issueKey = (f: string) => `${CIRCLE}::issues/${f}`;
const decisionKey = (f: string) => `${CIRCLE}::decisions/${f}`;

// ===========================================================================
// 1. Mapping + attach — the pure reconcile core (Step 3, agenda items 1–2)
// ===========================================================================
describe("fusion-plane push --plan: artifact→Plane mapping and attach", () => {
  it("emits deterministic JSON and executes no curl (exit 0)", () => {
    const r = run(freshWorkbench(), "push", "--all", "--plan");
    expect(r.status).toBe(0);
    const { ops } = plan(r.stdout);
    // record + 3 issues + 2 decisions (Circle) + 1 shared issue + 1 shared decision.
    expect(ops).toHaveLength(8);
  });

  it("labels each artifact by kind (circle / fusion-issue / decision)", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    expect(opFor(ops, CIRCLE).kind).toBe("circle");
    expect(opFor(ops, issueKey("260719-1600_o_open-issue.md")).kind).toBe("fusion-issue");
    expect(opFor(ops, decisionKey("260719-1603_a_answered.md")).kind).toBe("decision");
    expect(opFor(ops, "shared::issues/260719-1700_o_shared-issue.md").kind).toBe("fusion-issue");
    expect(opFor(ops, "shared::decisions/260719-1701_o_shared-decision.md").kind).toBe("decision");
  });

  it("maps the filename marker to the Plane state by name, per artifact type", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    // Circle _t_ active -> In Progress.
    expect(opFor(ops, CIRCLE)).toMatchObject({ marker: "t", state: "In Progress" });
    // Issue markers: _o_ Todo, _c_ Done, _d_ Cancelled.
    expect(opFor(ops, issueKey("260719-1600_o_open-issue.md"))).toMatchObject({ marker: "o", state: "Todo" });
    expect(opFor(ops, issueKey("260719-1601_c_closed-issue.md"))).toMatchObject({ marker: "c", state: "Done" });
    expect(opFor(ops, issueKey("260719-1602_d_dropped-issue.md"))).toMatchObject({ marker: "d", state: "Cancelled" });
    // Decision markers: _a_ In Progress (answered, unrealised), _i_ Done.
    expect(opFor(ops, decisionKey("260719-1603_a_answered.md"))).toMatchObject({ marker: "a", state: "In Progress" });
    expect(opFor(ops, decisionKey("260719-1604_i_implemented.md"))).toMatchObject({ marker: "i", state: "Done" });
  });

  it("uses the artifact's H1 as the Plane issue title", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    expect(opFor(ops, CIRCLE).title).toBe("Demo Circle Title");
    expect(opFor(ops, issueKey("260719-1600_o_open-issue.md")).title).toBe("Open issue one");
  });

  it("attaches Circle sub-artifacts to their Circle (DR-1 child attach)", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    for (const key of [
      issueKey("260719-1600_o_open-issue.md"),
      issueKey("260719-1601_c_closed-issue.md"),
      decisionKey("260719-1603_a_answered.md"),
      decisionKey("260719-1604_i_implemented.md"),
    ]) {
      const op = opFor(ops, key);
      expect(op.parent_key, `${key} should attach to its Circle`).toBe(CIRCLE);
      expect(op.attach).toBe("sub-issue");
    }
  });

  it("gives the Circle record itself no parent", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    expect(opFor(ops, CIRCLE).parent_key).toBeNull();
    expect(opFor(ops, CIRCLE).attach).toBeNull();
  });

  it("gives shared/ artifacts a null parent — they are top-level Plane issues", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    for (const key of [
      "shared::issues/260719-1700_o_shared-issue.md",
      "shared::decisions/260719-1701_o_shared-decision.md",
    ]) {
      const op = opFor(ops, key);
      expect(op.parent_key, `${key} is shared → no parent`).toBeNull();
      expect(op.attach).toBeNull();
    }
  });

  it("carries the source relpath for each artifact (map-loss rebuild anchor)", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    // The relpath is asserted tolerantly (see the double-slash note reported to
    // the orchestrator): collapse repeated slashes before comparing so the test
    // pins the meaningful path, not the cosmetic join artifact.
    const norm = (s: string) => s.replace(/\/+/g, "/");
    expect(norm(opFor(ops, CIRCLE).source)).toBe(`circles/${CIRCLE}/_t_circle.md`);
    expect(norm(opFor(ops, "shared::issues/260719-1700_o_shared-issue.md").source)).toBe(
      "shared/issues/260719-1700_o_shared-issue.md",
    );
  });

  it("a fresh push (empty map) is all creates", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    expect(ops.every((o) => o.op === "create")).toBe(true);
    expect(ops.every((o) => o.plane_id === null)).toBe(true);
  });
});

// ===========================================================================
// 2. Idempotency — a synced map yields zero creates (Step 3 acceptance)
// ===========================================================================
describe("fusion-plane push --plan: idempotency", () => {
  /** A fresh workbench with the committed in-sync map dropped in. */
  function syncedWorkbench(): string {
    const wb = freshWorkbench();
    cpSync(join(fixtureRoot, "map-synced.json"), join(wb, ".plane-map.json"));
    return wb;
  }

  it("second plan against an in-sync map contains zero create ops", () => {
    const wb = syncedWorkbench();
    // Two runs: --plan mutates nothing that changes the desired state, so both
    // observe the same in-sync map.
    const first = plan(run(wb, "push", "--all", "--plan").stdout);
    const second = plan(run(wb, "push", "--all", "--plan").stdout);
    expect(first.ops).toEqual([]);
    expect(second.ops).toEqual([]);
    // Explicit: no op is a create (a duplicate POST) on the second run.
    expect(second.ops.filter((o: any) => o.op === "create")).toEqual([]);
  });

  it("a drifted map state produces an update (PATCH), not a create", () => {
    const wb = freshWorkbench();
    // Map knows the Circle at a stale state ("Backlog"); the record is _t_ (In
    // Progress) → an update keyed on the existing plane_id, never a create.
    writeFileSync(
      join(wb, ".plane-map.json"),
      JSON.stringify({
        [CIRCLE]: { plane_id: "plane-existing", kind: "circle", last_state: "Backlog", last_pushed: "2026-07-19T00:00:00Z" },
      }),
    );
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    const circleOp = opFor(ops, CIRCLE);
    expect(circleOp.op).toBe("update");
    expect(circleOp.plane_id).toBe("plane-existing");
    expect(circleOp.state).toBe("In Progress");
  });
});

// ===========================================================================
// 3. Seeding read — bounded extraction + origin round-trip (Step 5)
// ===========================================================================
describe("fusion-plane seed --plan: bounded extraction", () => {
  const seedFixture = join(fixtureRoot, "seed-issue.json");

  it("extracts the title + description of the matching sequence_id, no curl", () => {
    const r = run(freshWorkbench(), "seed", "--plan", "--fixture", seedFixture, "42");
    expect(r.status).toBe(0);
    const out = JSON.parse(r.stdout);
    expect(out).toMatchObject({
      op: "seed",
      status: "ok",
      dry_run: true,
      sequence_id: 42,
      origin_plane_id: "origin-uuid-0042",
      title: "Seeded story title",
      description: "The seeded story description body, one read only.",
    });
    // It selected the RIGHT story out of the fixture set (not sequence_id 7).
    expect(out.description).not.toContain("never be selected");
  });

  it("hands the skill the exact record-origin command for the new Circle's key", () => {
    const r = run(freshWorkbench(), "seed", "--plan", "--fixture", seedFixture, "42");
    const out = JSON.parse(r.stdout);
    // The origin UUID is threaded into the command the skill runs AFTER shaper
    // creates the Circle — binding the seeded Circle's future pushes to the
    // origin story under the (not-yet-known) Circle natural key.
    expect(out.record_origin_cmd).toContain("origin-uuid-0042");
    expect(out.record_origin_cmd).toContain("seed --record-origin");
  });

  it("records the origin UUID under the new Circle's natural key (Phase B, no net)", () => {
    const wb = freshWorkbench();
    const newCircle = "260719-9999-seeded-circle";
    const rec = run(wb, "seed", "--record-origin", newCircle, "origin-uuid-0042");
    expect(rec.status).toBe(0);
    // Inspect the map the helper owns: the origin is bound under the Circle key,
    // kind=circle, last_state deliberately empty so the first real push PATCHes
    // the origin to the marker-derived state rather than assuming it is synced.
    const entry = JSON.parse(run(wb, "map", newCircle).stdout);
    expect(entry).toMatchObject({ plane_id: "origin-uuid-0042", kind: "circle", last_state: "" });
  });

  it("absent key / unreachable Plane defers with the manual-paste fallback (exit 10)", () => {
    // The live read path (no --fixture). Whether the key is absent (this CI) or
    // present against the unreachable fixture host, the C4 contract is identical:
    // no crash, EXIT_DEFERRED, and a machine-readable manual-paste fallback with
    // the board URL + the exact fetch command. The `reason` string differs by
    // branch, so it is not asserted — the deferred CONTRACT is.
    const r = run(freshWorkbench(), "seed", "42");
    expect(r.status).toBe(EXIT_DEFERRED);
    const out = JSON.parse(r.stdout);
    expect(out).toMatchObject({ op: "seed", status: "deferred", sequence_id: 42 });
    expect(out.origin_plane_id).toBeNull();
    expect(out.title).toBeNull();
    expect(out.description).toBeNull();
    expect(out.board_url, "manual-paste fallback names the Plane board URL").toContain("http");
    expect(out.fetch_cmd, "manual-paste fallback gives the exact fetch command").toContain("sequence_id==42");
  });
});

// ===========================================================================
// 4. Offline / C4 — never-silent, outbox line, deferred status, no crash
// ===========================================================================
describe("fusion-plane push (live): offline C4 doctrine", () => {
  it("an unreachable Plane defers to the outbox and exits 10, never crashes", () => {
    // The committed fixture config points base_url at the reserved `.test` TLD
    // (RFC 6761 — guaranteed never to resolve). The live push therefore cannot
    // reach Plane. Either branch that gets here (absent key, or key present but
    // host unreachable) must: write an outbox line per artifact, print a
    // "deferred" STATUS, and return EXIT_DEFERRED — not a crash, not a silent
    // success.
    const wb = freshWorkbench();
    const r = run(wb, "push", "--all");
    expect(r.status).toBe(EXIT_DEFERRED);
    expect(r.stderr + r.stdout).toContain("deferred");

    const outbox = join(wb, ".plane-outbox.jsonl");
    const lines = readFileSync(outbox, "utf-8").trim().split("\n").filter(Boolean);
    expect(lines.length, "at least one deferred transition recorded").toBeGreaterThan(0);
    // Every outbox line is valid JSON carrying the human-readable record fields.
    for (const line of lines) {
      const note = JSON.parse(line);
      expect(note).toHaveProperty("natural_key");
      expect(note).toHaveProperty("intended_state");
      expect(note).toHaveProperty("reason");
      expect(note.manual_hint, "the note tells the human the exact manual transition").toContain("Plane");
    }
    // The Circle record's transition is among the deferred notes.
    expect(lines.map((l) => JSON.parse(l).natural_key)).toContain(CIRCLE);
  });

  it("does not throw an uncaught error — the deferred status is a clean exit code", () => {
    // Regression guard for "never crash": exit 10 is a deliberate status, not an
    // unhandled bash error (which `set -eu` would surface as a different code).
    const r = run(freshWorkbench(), "push", "--all");
    expect(r.status).toBe(EXIT_DEFERRED);
    expect(r.status).not.toBe(1); // EXIT_CONFIG
    expect(r.status).not.toBe(2); // EXIT_USAGE
  });
});

// ===========================================================================
// 5. Lint guards — invariants that must fail loudly if broken (Step 8 / plan §Testing)
//    Mirrors the shape of path-literal-lint.test.ts: read the source, assert,
//    and prove the guard fires on an injected violation.
// ===========================================================================
describe("fusion-plane lint guards: no hardcoded state UUID in the helper", () => {
  // A Plane state UUID is the standard 8-4-4-4-12 hex form. The helper resolves
  // every state name→UUID at runtime via GET states/ (Martin's doctrine), so NO
  // UUID literal — state or otherwise — may appear in the source. This one guard
  // covers plan §Testing (a) "no hardcoded state UUID" and (c) "no state ID
  // literal in the helper".
  const UUID = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

  function uuidHits(text: string): { line: number; literal: string }[] {
    const hits: { line: number; literal: string }[] = [];
    text.split("\n").forEach((line, i) => {
      UUID.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = UUID.exec(line)) !== null) hits.push({ line: i + 1, literal: m[0] });
    });
    return hits;
  }

  it("bin/fusion-plane contains no UUID literal", () => {
    const src = readFileSync(fusionPlane, "utf-8");
    const hits = uuidHits(src);
    expect(
      hits,
      `bin/fusion-plane must resolve state UUIDs at runtime, never hardcode one:\n` +
        hits.map((h) => `  bin/fusion-plane:${h.line}  '${h.literal}'`).join("\n"),
    ).toEqual([]);
  });

  it("the guard fires loudly if a state UUID is introduced into the helper", () => {
    const src = readFileSync(fusionPlane, "utf-8").split("\n");
    const injectAt = 60; // a body line
    const copy = [...src];
    copy[injectAt] = 'DONE_STATE="a935e1f0-fc7c-4392-8b93-2f4551e0254f"  # hardcoded — forbidden';
    const hits = uuidHits(copy.join("\n"));
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.find((h) => h.line === injectAt + 1)?.literal).toBe("a935e1f0-fc7c-4392-8b93-2f4551e0254f");
  });
});

describe("fusion-plane lint guards: the config template stores no secret", () => {
  // Plan §Testing (b): the key lives ONLY in $PLANE_API_KEY (env). The config
  // template must expose NO field that would tempt a consumer to write a
  // credential into a file. The guard matches a YAML FIELD, not the word — the
  // template legitimately MENTIONS "api_key / token / secret" in a comment
  // ("Do NOT add an api_key ... field"), which must not trip the guard.
  const templatePath = join(pluginRoot, "templates", "plane.config.yaml");
  const SECRET_FIELD = /^\s*["']?(api[_-]?key|apikey|token|secret|password|access[_-]?token|auth[_-]?token)["']?\s*:/i;

  function secretFieldHits(text: string): { line: number; field: string }[] {
    const hits: { line: number; field: string }[] = [];
    text.split("\n").forEach((line, i) => {
      if (line.trim().startsWith("#")) return; // comments may name the field to forbid it
      const m = line.match(SECRET_FIELD);
      if (m) hits.push({ line: i + 1, field: m[1] });
    });
    return hits;
  }

  it("templates/plane.config.yaml contains no api_key / token / secret field", () => {
    const text = readFileSync(templatePath, "utf-8");
    const hits = secretFieldHits(text);
    expect(
      hits,
      `templates/plane.config.yaml must carry no credential field (key lives in $PLANE_API_KEY):\n` +
        hits.map((h) => `  templates/plane.config.yaml:${h.line}  field '${h.field}'`).join("\n"),
    ).toEqual([]);
  });

  it("a mention of the forbidden field inside a comment does NOT trip the guard", () => {
    // The exact false-positive the shape guard must avoid: the template's own
    // security note names the fields it forbids.
    expect(secretFieldHits("#   Do NOT add an api_key / token / secret field to this file.")).toEqual([]);
  });

  it("the guard fires loudly if a real secret field is introduced", () => {
    const injected = readFileSync(templatePath, "utf-8") + '\napi_key: "plane_api_leaked"\n';
    const hits = secretFieldHits(injected);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.some((h) => h.field.toLowerCase() === "api_key")).toBe(true);
  });

  it("catches the other credential shapes too (token / secret / password)", () => {
    for (const field of ["token", "secret", "password", "access_token", "auth-token"]) {
      expect(secretFieldHits(`${field}: "x"`).length, `${field} must be caught`).toBeGreaterThan(0);
    }
  });
});

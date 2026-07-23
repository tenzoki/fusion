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

  it("plans the configured kind label for every fusion-owned artifact", () => {
    // Issue 260720-0039: the plan's mapping table specifies a kind label per
    // artifact, and the helper used to send none. The dry run must show the label
    // that would be applied, by NAME (a dry run makes no call, so no UUID exists
    // yet — the name→UUID resolution is the live labels/ step).
    //
    // The fixture config deliberately RENAMES all three labels, so these
    // assertions also prove the value comes from the `labels:` rename map rather
    // than from a hardcoded kind string.
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    expect(opFor(ops, CIRCLE).label).toBe("Zirkel");
    expect(opFor(ops, issueKey("260719-1600_o_open-issue.md")).label).toBe("Fusion Issue");
    expect(opFor(ops, decisionKey("260719-1603_a_answered.md")).label).toBe("Entscheidung");
    // shared/ artifacts are top-level but still labelled by kind.
    expect(opFor(ops, "shared::issues/260719-1700_o_shared-issue.md").label).toBe("Fusion Issue");
    expect(opFor(ops, "shared::decisions/260719-1701_o_shared-decision.md").label).toBe("Entscheidung");
  });

  it("gives every artifact a label — no fusion-created artifact goes unlabelled", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    expect(ops).toHaveLength(8);
    expect(ops.every((o) => typeof o.label === "string" && o.label.length > 0)).toBe(true);
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
// 3b. Round-trip write safety — a seed-origin story's body is never overwritten
//     (decision 260719-2313 …round-trip-write-overwrites-origin-story-description,
//     Option 1: push writes STATE ONLY for seed-origin issues).
//
//     The map's `origin` field is the durable discriminator: "seed" (the issue
//     is a human's pre-existing Plane story, bound via `seed --record-origin`)
//     vs "fusion" (fusion POSTed it and owns its body). `last_state: ""` is NOT
//     a discriminator — it disappears after the first push, which is exactly why
//     the explicit field exists.
// ===========================================================================
describe("fusion-plane push --plan: seed-origin write safety", () => {
  /** A workbench whose map binds the demo Circle to `planeId` with `origin`. */
  function workbenchWithCircleEntry(origin: "seed" | "fusion" | null): string {
    const wb = freshWorkbench();
    const entry: Record<string, unknown> = {
      plane_id: "origin-uuid-0042",
      kind: "circle",
      // Stale state so the Circle (_t_ → In Progress) produces an actionable
      // update op rather than a noop — the op is what we assert on.
      last_state: "Backlog",
      last_pushed: "2026-07-19T00:00:00Z",
    };
    if (origin !== null) entry.origin = origin;
    writeFileSync(join(wb, ".plane-map.json"), JSON.stringify({ [CIRCLE]: entry }));
    return wb;
  }

  it("a seed-origin artifact plans a state-only write (no title, no description)", () => {
    const wb = workbenchWithCircleEntry("seed");
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    const op = opFor(ops, CIRCLE);
    expect(op.op).toBe("update");
    expect(op.write_scope, "a human's story must not get fusion's mirror body").toBe("state-only");
    expect(op.writes).toEqual(["state"]);
    // The destructive fields must be absent from the planned PATCH body.
    expect(op.writes).not.toContain("description_html");
    expect(op.writes).not.toContain("name");
    // State still syncs — that is the whole point of the round-trip push.
    expect(op.state).toBe("In Progress");
    expect(op.plane_id).toBe("origin-uuid-0042");
  });

  it("a seed-origin artifact carries NO kind label — labels are not an exception", () => {
    // When kind labels were added (issue 260720-0039) the state-only invariant
    // had to survive: decision 260719-2313 settled that a seed-origin issue gets
    // state writes ONLY, so fusion never modifies a human's story beyond its
    // state. A label is a modification of that story, so it is withheld too —
    // the same write_scope branch governs both.
    const wb = workbenchWithCircleEntry("seed");
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    const op = opFor(ops, CIRCLE);
    expect(op.write_scope).toBe("state-only");
    expect(op.label, "a human's story must not gain a fusion label").toBeNull();
    expect(op.writes).toEqual(["state"]);
  });

  it("a fusion-owned artifact DOES carry the kind label (the contrast case)", () => {
    const wb = workbenchWithCircleEntry("fusion");
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    expect(opFor(ops, CIRCLE).label).toBe("Zirkel");
  });

  it("a fusion-owned artifact keeps the full mirror body", () => {
    const wb = workbenchWithCircleEntry("fusion");
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    const op = opFor(ops, CIRCLE);
    expect(op.write_scope).toBe("full");
    expect(op.writes).toEqual(["name", "description_html", "state"]);
  });

  it("BACKWARD COMPAT: an entry with no `origin` field behaves as fusion-owned", () => {
    // Every map written before this field existed (and every entry produced by
    // `push --rebuild-map`) lacks `origin`. Those maps must keep working exactly
    // as they did — full-body mirroring, unchanged.
    const wb = workbenchWithCircleEntry(null);
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    const op = opFor(ops, CIRCLE);
    expect(op.write_scope).toBe("full");
    expect(op.writes).toEqual(["name", "description_html", "state"]);
  });

  it("a fresh create is full-scope — fusion authors the issue it POSTs", () => {
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    expect(ops.every((o) => o.op === "create")).toBe(true);
    expect(ops.every((o) => o.write_scope === "full")).toBe(true);
  });

  it("`seed --record-origin` stamps origin=seed on the map entry it writes", () => {
    // The write-safety branch is only as good as the flag that drives it: the
    // Phase B map write is where "this is a human's story" becomes durable.
    const wb = freshWorkbench();
    const newCircle = "260719-9999-seeded-circle";
    expect(run(wb, "seed", "--record-origin", newCircle, "origin-uuid-0042").status).toBe(0);
    const entry = JSON.parse(run(wb, "map", newCircle).stdout);
    expect(entry).toMatchObject({ plane_id: "origin-uuid-0042", kind: "circle", origin: "seed" });
  });

  it("the seed flag survives a state sync — it is not consumed by the first push", () => {
    // The regression this guards: if a push relabelled the entry fusion-owned
    // (or if `last_state: ""` were treated as the discriminator), the SECOND
    // push would happily overwrite the human's description. Re-planning after a
    // simulated state sync must still be state-only.
    const wb = freshWorkbench();
    run(wb, "seed", "--record-origin", CIRCLE, "origin-uuid-0042");
    const mapPath = join(wb, ".plane-map.json");
    const map = JSON.parse(readFileSync(mapPath, "utf-8"));
    // Simulate what a completed push records: a real last_state, origin intact.
    map[CIRCLE].last_state = "Backlog";
    writeFileSync(mapPath, JSON.stringify(map));
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    expect(opFor(ops, CIRCLE).write_scope).toBe("state-only");
  });
});

// ===========================================================================
// 3c. Map maintenance — `map --forget` / `map --prune`
//     (issue 260720-0039 …no-map-forget-stale-entries-after-deleting-plane-issues).
//
//     Deleting a mirrored issue in the Plane UI — exactly what the documented
//     first-run cleanup tells the user to do — leaves a dead UUID in the map.
//     The next push PATCHes it, takes a 404 and defers. `--forget` is the clean
//     remedy; without it the only way out was hand-editing JSON.
// ===========================================================================
describe("fusion-plane map --forget / --prune", () => {
  /** A workbench whose map holds two unrelated entries. */
  function workbenchWithTwoEntries(): string {
    const wb = freshWorkbench();
    writeFileSync(
      join(wb, ".plane-map.json"),
      JSON.stringify({
        [CIRCLE]: { plane_id: "plane-deleted-in-ui", kind: "circle", last_state: "In Progress" },
        "shared::issues/260719-1700_o_shared-issue.md": {
          plane_id: "plane-still-alive",
          kind: "fusion-issue",
          last_state: "Todo",
        },
      }),
    );
    return wb;
  }

  const readMap = (wb: string) => JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"));

  it("removes the named entry and leaves the others intact", () => {
    const wb = workbenchWithTwoEntries();
    const r = run(wb, "map", "--forget", CIRCLE);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("forgotten");
    const map = readMap(wb);
    expect(Object.keys(map)).toEqual(["shared::issues/260719-1700_o_shared-issue.md"]);
    // The surviving entry is untouched, not merely present.
    expect(map["shared::issues/260719-1700_o_shared-issue.md"]).toMatchObject({
      plane_id: "plane-still-alive",
      last_state: "Todo",
    });
  });

  it("a forgotten key makes the next push a create, not a PATCH of the dead UUID", () => {
    // The whole point of the subcommand: recover the state where fusion will
    // POST a fresh issue instead of 404-ing against one deleted in the UI.
    const wb = workbenchWithTwoEntries();
    // Before: the map knows the Circle record at its current state → no op for
    // it at all. (Its children are absent from this map, so they plan creates;
    // the Circle record is the one this test is about.)
    expect(opFor(plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout).ops, CIRCLE)).toBeUndefined();
    run(wb, "map", "--forget", CIRCLE);
    const op = opFor(plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout).ops, CIRCLE);
    expect(op.op).toBe("create");
    expect(op.plane_id).toBeNull();
  });

  it("reports an absent key rather than silently succeeding", () => {
    const wb = workbenchWithTwoEntries();
    const r = run(wb, "map", "--forget", "no-such-circle");
    expect(r.status, "a mutation that did not happen is not a success").not.toBe(0);
    expect(r.stderr + r.stdout).toContain("no such key");
    // And it changed nothing.
    expect(Object.keys(readMap(wb))).toHaveLength(2);
  });

  it("--forget with no key is a usage error", () => {
    const r = run(freshWorkbench(), "map", "--forget");
    expect(r.status).toBe(2); // EXIT_USAGE
  });

  it("plain `map` and `map <key>` still work (dispatch regression guard)", () => {
    // `map` used to forward only $1; the flags required forwarding "$@". These
    // two forms must survive that change.
    const wb = workbenchWithTwoEntries();
    expect(Object.keys(JSON.parse(run(wb, "map").stdout))).toHaveLength(2);
    expect(JSON.parse(run(wb, "map", CIRCLE).stdout)).toMatchObject({ plane_id: "plane-deleted-in-ui" });
    expect(JSON.parse(run(wb, "map", "no-such-key").stdout)).toBe("no such key");
  });

  it("C4: --prune deletes NOTHING when Plane cannot be reached (or the key is absent)", () => {
    // The doctrine that makes --prune safe to ship: only a definitive 404 counts
    // as gone. Against the unreachable `.test` fixture host — or with no key at
    // all — every entry must survive and the status must be deferred, never a
    // silent "pruned 2".
    const wb = workbenchWithTwoEntries();
    const before = readMap(wb);
    const r = run(wb, "map", "--prune");
    expect(r.status).toBe(EXIT_DEFERRED);
    expect(r.stdout).toContain("deferred");
    expect(readMap(wb), "an outage must never cost map entries").toEqual(before);
  });

  it("--forget and --prune are mutually exclusive", () => {
    const r = run(workbenchWithTwoEntries(), "map", "--forget", CIRCLE, "--prune");
    expect(r.status).toBe(2); // EXIT_USAGE
    expect(r.stderr).toContain("mutually exclusive");
  });
});

// ===========================================================================
// 3d. rebuild-map field fallback
//     (issue 260720-0039 …rebuild-map-reads-description-but-push-writes-description-html).
//
//     `build_write_body` embeds the natural key in `description_html`, but
//     rebuild used to read `.description` alone. On an instance that does not
//     derive one field from the other, the board looks perfect while the
//     map-loss recovery path silently rebuilds nothing. The extraction must try
//     the same chain the seed path uses.
// ===========================================================================
describe("fusion-plane push --rebuild-map: embedded-key field fallback", () => {
  const rebuildFixture = join(fixtureRoot, "rebuild-issues.json");

  /** Rebuild from the captured issues JSON (no curl), then read the map back. */
  function rebuiltMap(): Record<string, any> {
    const wb = freshWorkbench();
    // The push itself defers (unreachable fixture host); the rebuild runs first
    // and is what we assert on.
    run(wb, "push", "--circle", CIRCLE, "--rebuild-map", "--fixture", rebuildFixture);
    return JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"));
  }

  it("finds the key when it sits in description_html (what push actually writes)", () => {
    // THE regression: this is the field `build_write_body` populates, and the
    // one the old single-field read missed.
    expect(rebuiltMap()["260719-1536-html-circle"]).toMatchObject({ plane_id: "plane-uuid-html" });
  });

  it("finds the key when it sits in the plain description", () => {
    expect(rebuiltMap()["260719-1536-plain-circle"]).toMatchObject({ plane_id: "plane-uuid-plain" });
  });

  it("finds the key when it sits in description_stripped", () => {
    expect(rebuiltMap()["260719-1536-stripped-circle"]).toMatchObject({ plane_id: "plane-uuid-stripped" });
  });

  it("survives a non-string description (ProseMirror doc) and reads the HTML field", () => {
    // Some Plane builds return `description` as a JSON document object. Passing
    // that to jq's `capture` errors, which the caller's 2>/dev/null turned into
    // a bare "could not parse issues" — losing the whole rebuild, not just the
    // one issue. The type guard keeps the rest of the set readable.
    const map = rebuiltMap();
    expect(map["260719-1536-prosemirror-circle"]).toMatchObject({ plane_id: "plane-uuid-prosemirror" });
    expect(Object.keys(map).length, "one odd issue must not abort the whole rebuild").toBe(4);
  });

  it("ignores issues carrying no embedded fusion-key (a human's own story)", () => {
    const map = rebuiltMap();
    expect(Object.values(map).some((e: any) => e.plane_id === "plane-uuid-human")).toBe(false);
  });

  it("rebuilt entries carry the documented placeholder shape", () => {
    expect(rebuiltMap()["260719-1536-html-circle"]).toEqual({
      plane_id: "plane-uuid-html",
      kind: "unknown",
      last_state: "",
      last_pushed: "",
    });
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

describe("fusion-plane lint guards: kind labels resolve at runtime, like states", () => {
  // The UUID guard above already covers label UUIDs (it forbids EVERY UUID
  // literal in the helper). These two assert the positive half of the contract:
  // the names live in config, and the helper reaches the labels/ endpoint to
  // turn them into UUIDs rather than assuming any ID.
  const templatePath = join(pluginRoot, "templates", "plane.config.yaml");

  it("the template ships a `labels:` rename map with the three canonical keys", () => {
    const text = readFileSync(templatePath, "utf-8");
    expect(text).toMatch(/^labels:/m);
    // Canonical keys, in the same left-key/right-value shape as `states:`.
    for (const kind of ["circle", "fusion-issue", "decision"]) {
      expect(text, `labels: must carry the canonical key '${kind}'`).toMatch(
        new RegExp(`^\\s+"${kind}"\\s*:`, "m"),
      );
    }
  });

  it("the helper resolves label names through the labels/ endpoint", () => {
    const src = readFileSync(fusionPlane, "utf-8");
    expect(src, "labels must be fetched, not assumed").toContain("$BASE/labels/");
    // Create-if-missing: the board may legitimately lack a label fusion needs.
    expect(src).toMatch(/plane_curl POST "\$BASE\/labels\/"/);
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

// ===========================================================================
// 6. Opt-in spec-comment (plan 260722-2021, spec 260722-1943).
//
//    With `spec_comment: true` in the workbench config, every Circle push emits
//    a SEPARATE dry-run op `{op:"spec-comment", …}` alongside the create/update
//    op — the Circle record body, HTML-escaped and <pre>-wrapped, keyed on an
//    HTML-comment marker `<!-- fusion-spec-comment:<nk> -->`. The PATCH-vs-POST
//    branch resolves offline from a captured comments list injected through the
//    `--comments-fixture` / FUSION_PLANE_COMMENTS_FIXTURE seam (distinct from the
//    rebuild `--fixture`). Gate OFF ⇒ byte-for-byte the same op stream as before.
//
//    The gate is enabled by APPENDING `spec_comment: true` to the FRESH COPY's
//    config (never the committed fixture) — the same copy-and-mutate discipline
//    the map-based tests above use for `.plane-map.json`.
// ===========================================================================
describe("fusion-plane push --plan: spec-comment", () => {
  const withMarkerFixture = join(fixtureRoot, "comments-with-marker.json");
  const otherKeyFixture = join(fixtureRoot, "comments-other-key.json");
  // Same comments as withMarkerFixture, but shaped as a BARE JSON array rather
  // than a {results:[…]} envelope — the regression guard for the jq
  // `(.results? // .)` fallback. Under the old `(.results // .)` idiom, jq 1.8.1
  // raised "Cannot index array with string \"results\"" on this shape, so
  // comment_id_for_marker printed nothing and the match silently fell through to
  // POST. See shared/issues/260722-2227_p_jq-results-fallback-throws-on-bare-array.
  const bareArrayMarkerFixture = join(fixtureRoot, "comments-with-marker-bare-array.json");

  /** A fresh copy with the opt-in appended to its config. */
  function enabledWorkbench(): string {
    const wb = freshWorkbench();
    const cfg = join(wb, "plane.config.yaml");
    // Top-level scalar appended after the nested `labels:` block — read by
    // `cfg_get spec_comment` exactly as `base_url` is.
    writeFileSync(cfg, readFileSync(cfg, "utf-8") + "\nspec_comment: true\n");
    return wb;
  }

  /** The spec-comment op for a Circle. Distinct from the create/update op, which
   *  carries the SAME natural_key and is emitted first — so `opFor` would return
   *  that one, never this. */
  function specCommentOp(ops: any[], key: string): any {
    return ops.find((o) => o.op === "spec-comment" && o.natural_key === key);
  }

  it("emits a marker-bearing, <pre>-wrapped spec-comment op for the Circle", () => {
    // C5-1, C5-3, C2 marker: gate on, no comments fixture → a spec-comment op
    // exists for the Circle; its comment_html is a string carrying the exact
    // marker for this Circle's key, opening <pre> and closing </pre>.
    const { ops } = plan(run(enabledWorkbench(), "push", "--all", "--plan").stdout);
    const sc = specCommentOp(ops, CIRCLE);
    expect(sc, "an enabled push must emit a spec-comment op for the Circle").toBeDefined();
    expect(sc.kind).toBe("circle");
    expect(typeof sc.comment_html).toBe("string");
    // Exact marker string for the demo Circle's natural key (its directory name).
    expect(sc.comment_html.startsWith(`<!-- fusion-spec-comment:260719-1536-demo-circle -->\n<pre>`)).toBe(true);
    expect(sc.comment_html.endsWith("</pre>")).toBe(true);
    // Marker is derived from the natural key, not hardcoded.
    expect(sc.comment_html).toContain(`<!-- fusion-spec-comment:${CIRCLE} -->`);
  });

  it("HTML-escapes & < > in the record body, single ampersand-first pass", () => {
    // C3, C5-3: overwrite the Circle record IN THE FRESH COPY with a body full of
    // markup-breaking characters; the escaped body must carry the entities, no
    // raw tag, and no double-escaped ampersand.
    const wb = enabledWorkbench();
    writeFileSync(
      join(wb, "circles", CIRCLE, "_t_circle.md"),
      "# Escaping Test Circle\n\nMermaid edge: A --> B\nHTML tag: <tag>\nShell and: a && b\n",
    );
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    const sc = specCommentOp(ops, CIRCLE);
    expect(sc.comment_html).toContain("&amp;");
    expect(sc.comment_html).toContain("&lt;");
    expect(sc.comment_html).toContain("&gt;");
    // The literal tag must appear escaped, never as live markup. (Raw `<` still
    // occurs in the marker and the <pre> wrapper — only `<tag>` must be gone.)
    expect(sc.comment_html).not.toContain("<tag>");
    // Ampersand escaped exactly once — `a && b` → `a &amp;&amp; b`, never `&amp;amp;`.
    expect(sc.comment_html).not.toContain("&amp;amp;");
  });

  it("PATCHes the matched comment when the fixture carries this Circle's marker", () => {
    // C5-2 PATCH: a captured comments list bearing this Circle's marker →
    // method PATCH + the matched comment_id.
    const { ops } = plan(
      run(enabledWorkbench(), "push", "--circle", CIRCLE, "--plan", "--comments-fixture", withMarkerFixture).stdout,
    );
    const sc = specCommentOp(ops, CIRCLE);
    expect(sc.method).toBe("PATCH");
    expect(sc.comment_id).toBe("comment-uuid-1");
  });

  it("PATCHes on a BARE-ARRAY comments fixture (jq .results? fallback regression)", () => {
    // Regression for the `(.results? // .)` fix: comment_id_for_marker must match
    // this Circle's marker whether the injected comments list is a {results:[…]}
    // envelope OR a bare array. Under the pre-fix `(.results // .)` pattern jq
    // errored on the bare array, the id came back empty, and this Circle's own
    // spec-comment was wrongly POSTed as a duplicate instead of PATCHed in place.
    const { ops } = plan(
      run(enabledWorkbench(), "push", "--circle", CIRCLE, "--plan", "--comments-fixture", bareArrayMarkerFixture).stdout,
    );
    const sc = specCommentOp(ops, CIRCLE);
    expect(sc.method).toBe("PATCH");
    expect(sc.comment_id).toBe("comment-uuid-1");
  });

  it("POSTs a new comment when the fixture holds only a different Circle's marker", () => {
    // C2-3, C5-2 POST: the marker match is by exact key — a different Circle's
    // comment is never matched, so the method is POST and no comment_id is set.
    const { ops } = plan(
      run(enabledWorkbench(), "push", "--circle", CIRCLE, "--plan", "--comments-fixture", otherKeyFixture).stdout,
    );
    const sc = specCommentOp(ops, CIRCLE);
    expect(sc.method).toBe("POST");
    expect(sc.comment_id).toBeUndefined();
  });

  it("gate off → no spec-comment op, and the op stream is unchanged (8 ops)", () => {
    // C1-1, C1-2, C5-4: the default fixture config carries no `spec_comment`
    // field, so the gate is off and the op count matches the pre-change baseline
    // asserted in the mapping suite above (record + 3 issues + 2 decisions +
    // 1 shared issue + 1 shared decision = 8).
    const { ops } = plan(run(freshWorkbench(), "push", "--all", "--plan").stdout);
    expect(ops.some((o) => o.op === "spec-comment")).toBe(false);
    expect(ops).toHaveLength(8);
  });

  it("C4: gate on + unreachable host still defers the state and exits 10", () => {
    // C4-1, C4-4: with the opt-in enabled, a live push against the unreachable
    // `.test` host defers the state write first (state_ok stays 0), so the
    // comment is never attempted — the exit code is the state path's 10, never a
    // crash and never a comment-driven change.
    const wb = enabledWorkbench();
    const r = run(wb, "push", "--all");
    expect(r.status).toBe(EXIT_DEFERRED);
    expect(r.stderr + r.stdout).toContain("deferred");
  });
});

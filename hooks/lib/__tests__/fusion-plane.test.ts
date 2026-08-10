import { describe, it, expect, afterEach } from "vitest";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  chmodSync,
  cpSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  existsSync,
} from "node:fs";
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
// `.fusion-setup` upward walk. EVERY helper invocation gets a FRESH tmp copy of
// the committed fixture tree — runtime writes land in tmp, the committed fixture
// is never mutated. (`push --plan` no longer writes anything at all; it used to
// call `map_ensure`, which is the defect section 2c exists for.)
// ---------------------------------------------------------------------------

const EXIT_DEFERRED = 10;
const EXIT_USAGE = 2;

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

/**
 * Run fusion-plane with a fixture workbench. Never throws (exit 10 is normal).
 *
 * `spawnSync`, not `execFileSync`, for one reason: the helper reports on stderr
 * at every severity, including notices from runs that succeed — the map-migration
 * collision report is one. `execFileSync` hands stderr back only on a throw, so a
 * successful run's diagnostics were unobservable and a test could not tell a
 * reported condition from a silent one.
 */
function run(workbench: string, ...args: string[]): RunResult {
  const r = spawnSync(fusionPlane, args, {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FUSION_PLANE_WORKBENCH: workbench },
  });
  return {
    status: r.status ?? -1,
    stdout: r.stdout?.toString() ?? "",
    stderr: r.stderr?.toString() ?? "",
  };
}

// --- Throwaway fixture-workbench copies, cleaned up after each test ----------
const scratch: string[] = [];

/**
 * Fresh tmp copy of the committed fixture workbench. Runtime writes go here.
 *
 * The copy's `project_id` is rewritten to a filled value. The committed fixture
 * still ships the template's all-zero UUID, which `config_valid` now (correctly)
 * rejects as an unfilled field — so without this the LIVE-path tests below would
 * fail on "config unfilled" and never reach the network-outage behaviour they
 * exist to assert. The dry-run tests are unaffected either way: `--plan` never
 * calls `config_valid` and no assertion reads this value.
 *
 * Filed for ontocoder to fix at the fixture itself (the fixture is a .yaml):
 * issues/…_o_der-plane-testfixture-traegt-den-platzhalter-den-config-valid-jetzt-ablehnt.md.
 * When that lands, delete this rewrite.
 */
function freshWorkbench(): string {
  const root = mkdtempSync(join(tmpdir(), "fusion-plane-"));
  const wb = join(root, "workbench");
  cpSync(fixtureWorkbench, wb, { recursive: true });
  const cfgPath = join(wb, "plane.config.yaml");
  writeFileSync(
    cfgPath,
    readFileSync(cfgPath, "utf-8").replace(
      /^project_id:.*$/m,
      'project_id: "11111111-2222-3333-4444-555555555555"',
    ),
  );
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

/**
 * The natural key of a record, built the way `bin/fusion-plane`'s `natural_key`
 * builds it — `<scope>::<subdir>/<basename with the state marker removed>`.
 *
 * Every call site below passes the record's REAL filename, marker and all, so the
 * tests keep naming the files that exist on disk while asserting on the key those
 * files resolve to. That gap is the whole point of issue 260807-1939: the marker
 * is state, the key is identity, and a key that carried the marker changed on
 * every transition — so the map missed and the push created a second Plane issue
 * instead of moving the first.
 */
const stableBasename = (f: string) => f.replace(/^(\d{6}-\d{4})_[a-z]_/, "$1_");
const artifactKey = (scope: string, subdir: "issues" | "decisions", f: string) =>
  `${scope}::${subdir}/${stableBasename(f)}`;
const issueKey = (f: string) => artifactKey(CIRCLE, "issues", f);
const decisionKey = (f: string) => artifactKey(CIRCLE, "decisions", f);
const sharedIssueKey = (f: string) => artifactKey("shared", "issues", f);
const sharedDecisionKey = (f: string) => artifactKey("shared", "decisions", f);

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
    expect(opFor(ops, sharedIssueKey("260719-1700_o_shared-issue.md")).kind).toBe("fusion-issue");
    expect(opFor(ops, sharedDecisionKey("260719-1701_o_shared-decision.md")).kind).toBe("decision");
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
    expect(opFor(ops, sharedIssueKey("260719-1700_o_shared-issue.md")).label).toBe("Fusion Issue");
    expect(opFor(ops, sharedDecisionKey("260719-1701_o_shared-decision.md")).label).toBe("Entscheidung");
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
      sharedIssueKey("260719-1700_o_shared-issue.md"),
      sharedDecisionKey("260719-1701_o_shared-decision.md"),
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
    expect(norm(opFor(ops, sharedIssueKey("260719-1700_o_shared-issue.md")).source)).toBe(
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
  /**
   * A fresh workbench with the committed in-sync map dropped in.
   *
   * That committed map is written in the OLD marker-bearing key form, and is left
   * that way on purpose: it is a real legacy map, so every assertion below also
   * proves the migration in `map_migrate_keys` puts those entries where the
   * reconcile now looks for them. Rewriting the fixture would delete that proof.
   */
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
// 2b. The natural key survives a state transition
//     (issue 260807-1939 …plane-natural-key-carries-the-state-marker-and-breaks-
//      on-every-transition).
//
//     The key used to be the record's full basename, marker included. The marker
//     changes on exactly the event the mirror exists to push, so every transition
//     presented a key the map had never seen: `map_get_id` (an exact string
//     match) missed, the push CREATED A SECOND Plane issue, and the first stayed
//     at its old state forever. `--rebuild-map` could not recover it either — it
//     reads the key back out of the Plane issue's description, where the OLD key
//     was embedded at creation time.
//
//     The record's reproduction, run as a test: push, rename, push again. It
//     asserted `op=create` twice; it must now assert one key and `op=update`.
// ===========================================================================
const OPEN_ISSUE = "260719-1600_o_open-issue.md";
const CLOSED_ISSUE = "260719-1600_c_open-issue.md";

/**
 * A map in the OLD marker-bearing form that recorded one record twice, once per
 * state it was pushed in — i.e. two Plane issues for one record. Folding it onto
 * the stable key must discard one of the two UUIDs, which makes it the exact
 * input on which "who is allowed to write this file" stops being cosmetic.
 * Shared by sections 2b and 2c.
 */
const collidingLegacyMap = {
  [`${CIRCLE}::issues/${OPEN_ISSUE}`]: {
    plane_id: "plane-issue-first",
    kind: "fusion-issue",
    last_state: "Todo",
    last_pushed: "2026-07-19T00:00:00Z",
  },
  [`${CIRCLE}::issues/${CLOSED_ISSUE}`]: {
    plane_id: "plane-issue-duplicate",
    kind: "fusion-issue",
    last_state: "Done",
    last_pushed: "2026-07-20T00:00:00Z",
  },
};

describe("fusion-plane: the natural key does not carry the state marker", () => {
  const issuePath = (wb: string, f: string) => join(wb, "circles", CIRCLE, "issues", f);

  /** The planned op for the demo Circle's first issue, whatever its key is. */
  function issueOp(wb: string, sourceFile: string): any {
    const { ops } = plan(run(wb, "push", "--circle", CIRCLE, "--plan").stdout);
    return ops.find((o: any) => (o.source ?? "").endsWith(sourceFile));
  }

  it("a record keeps ONE key across a state transition", () => {
    // Deliberately keyless assertion: it reads the key the helper itself chose
    // before and after the rename rather than naming a form. What is under test
    // is that the two are equal, not what they spell.
    const wb = freshWorkbench();
    const before = issueOp(wb, OPEN_ISSUE);
    expect(before.marker).toBe("o");
    renameSync(issuePath(wb, OPEN_ISSUE), issuePath(wb, CLOSED_ISSUE));
    const after = issueOp(wb, CLOSED_ISSUE);
    expect(after.marker, "the file's marker did change — that is the transition").toBe("c");
    expect(
      after.natural_key,
      "identity must survive the transition the mirror exists to push",
    ).toBe(before.natural_key);
    // And it is marker-free, so no future marker can move it either.
    expect(after.natural_key).not.toMatch(/_[a-z]_/);
  });

  it("the record's reproduction inverts: the second push is an update, not a create", () => {
    const wb = freshWorkbench();
    // Simulate the first push having landed: record what it would have recorded,
    // under the key the helper itself planned.
    const first = issueOp(wb, OPEN_ISSUE);
    expect(first.op).toBe("create");
    writeFileSync(
      join(wb, ".plane-map.json"),
      JSON.stringify({
        [first.natural_key]: {
          plane_id: "plane-issue-0001",
          kind: "fusion-issue",
          last_state: "Todo",
          last_pushed: "2026-07-19T00:00:00Z",
        },
      }),
    );
    // Close it and push again.
    renameSync(issuePath(wb, OPEN_ISSUE), issuePath(wb, CLOSED_ISSUE));
    const second = issueOp(wb, CLOSED_ISSUE);
    expect(second.op, "a transition must MOVE the issue, never mirror a second one").toBe("update");
    expect(second.plane_id, "the update must target the issue already on the board").toBe(
      "plane-issue-0001",
    );
    expect(second.state).toBe("Done");
  });

  it("a legacy marker-bearing map entry is migrated and still resolves", () => {
    // A map written before this fix. It must not be stranded: the record it names
    // has since moved from _o_ to _c_, and the entry has to follow it rather than
    // leave the push POSTing a duplicate.
    const wb = freshWorkbench();
    const legacyKey = `${CIRCLE}::issues/${OPEN_ISSUE}`;
    writeFileSync(
      join(wb, ".plane-map.json"),
      JSON.stringify({
        [legacyKey]: {
          plane_id: "plane-issue-legacy",
          kind: "fusion-issue",
          last_state: "Todo",
          last_pushed: "2026-07-19T00:00:00Z",
          origin: "seed",
        },
      }),
    );
    renameSync(issuePath(wb, OPEN_ISSUE), issuePath(wb, CLOSED_ISSUE));
    const op = issueOp(wb, CLOSED_ISSUE);
    expect(op.op).toBe("update");
    expect(op.plane_id).toBe("plane-issue-legacy");
    // The lookup resolved through the FOLDED view. The dry run that resolved it
    // wrote nothing (section 2c is why); `map --migrate` is what puts the fold on
    // disk, and the rest of the entry — here origin=seed, which governs whether a
    // human's story body gets overwritten — rides along intact.
    expect(
      Object.keys(JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"))),
      "a dry run resolves through the fold; it does not perform it",
    ).toEqual([legacyKey]);
    run(wb, "map", "--migrate");
    const map = JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"));
    expect(Object.keys(map)).toEqual([issueKey(OPEN_ISSUE)]);
    expect(map[issueKey(OPEN_ISSUE)]).toMatchObject({
      plane_id: "plane-issue-legacy",
      origin: "seed",
    });
  });

  it("a legacy map that mirrored one record twice folds to the newest, and names the loser", () => {
    // The duplicate this defect produced, arriving as input: the same record
    // recorded under two markers, i.e. two Plane issues. The map cannot keep both
    // under one key, so the fold keeps the one pushed most recently — the issue
    // the board has been tracking — and NAMES the loser rather than dropping a
    // UUID in silence. Naming, not counting: that string is the only handle a
    // human has on the stray Plane issue this orphans.
    const wb = freshWorkbench();
    writeFileSync(join(wb, ".plane-map.json"), JSON.stringify(collidingLegacyMap));
    const r = run(wb, "map");
    const map = JSON.parse(r.stdout);
    expect(Object.keys(map)).toEqual([issueKey(OPEN_ISSUE)]);
    expect(map[issueKey(OPEN_ISSUE)].plane_id).toBe("plane-issue-duplicate");
    expect(r.stderr, "a dropped UUID means a stray Plane issue — never silent").toContain(
      "plane-issue-first",
    );
  });

  it("an already-migrated map is left byte-identical (the migration is idempotent)", () => {
    const wb = freshWorkbench();
    const stable = {
      [issueKey(OPEN_ISSUE)]: {
        plane_id: "plane-issue-0001",
        kind: "fusion-issue",
        last_state: "Todo",
        last_pushed: "2026-07-19T00:00:00Z",
        origin: "fusion",
      },
    };
    const mapPath = join(wb, ".plane-map.json");
    writeFileSync(mapPath, JSON.stringify(stable, null, 2) + "\n");
    const before = readFileSync(mapPath, "utf-8");
    run(wb, "map");
    expect(readFileSync(mapPath, "utf-8"), "nothing to migrate → nothing rewritten").toBe(before);
  });

  it("--rebuild-map normalises a key embedded in an issue created before the fix", () => {
    // The reason `--rebuild-map` was no recovery path: the `fusion-key:` sitting
    // in an already-created Plane issue's description is whatever key was current
    // when fusion POSTed it. Read back verbatim, a rebuild restores exactly the
    // mapping the next transition invalidates. It must normalise on the way in.
    const wb = freshWorkbench();
    const legacyKey = `${CIRCLE}::issues/${OPEN_ISSUE}`;
    const fixture = join(wb, "legacy-issues.json");
    writeFileSync(
      fixture,
      JSON.stringify({
        results: [
          {
            id: "plane-uuid-legacy",
            description_html: `<p>Mirrored fusion fusion-issue.<br>fusion-key: ${legacyKey}<br></p>`,
          },
        ],
      }),
    );
    run(wb, "push", "--circle", CIRCLE, "--rebuild-map", "--fixture", fixture);
    const map = JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"));
    expect(Object.keys(map)).toEqual([issueKey(OPEN_ISSUE)]);
    expect(map[issueKey(OPEN_ISSUE)]).toMatchObject({ plane_id: "plane-uuid-legacy" });
  });
});

// ===========================================================================
// 2c. Reading the map never writes it, and no fold loses a UUID unannounced
//     (issues 260810-0456 …dry-run-rewrites-the-map… and
//      260810-0457 …rebuild-map-drops-a-colliding-plane-uuid-silently…).
//
//     The fold introduced in 2b was correct and reached the file from the wrong
//     side. It ran from `map_ensure`, which sat on the READ path, so `map`,
//     `push --plan` and `plan` — the three commands whose documented contract is
//     that they change nothing — rewrote .plane-map.json. Against the legacy
//     duplicate the fold exists to repair, that rewrite discarded a Plane UUID,
//     from a command the user ran to LOOK at something. A discarded UUID is not
//     recoverable from files: it names a Plane issue that goes on existing,
//     unreferenced, for a human to find and close.
//
//     `--rebuild-map` had the second exit of the same defect. It assigned without
//     the fold's collision guard, so of two Plane issues carrying one key the
//     winner was whichever the API happened to return last and the loser vanished
//     unreported.
//
//     Every test below therefore asserts one of two things: a read left the file
//     byte-identical, or a discarded UUID was NAMED. Counting is not enough — the
//     UUID string is the only handle a human has on the stray issue.
// ===========================================================================
describe("fusion-plane: reads never write .plane-map.json", () => {
  const mapPath = (wb: string) => join(wb, ".plane-map.json");

  /** A workbench whose map is the legacy pair that folds down to one entry. */
  function legacyWorkbench(): { wb: string; before: string } {
    const wb = freshWorkbench();
    writeFileSync(mapPath(wb), JSON.stringify(collidingLegacyMap, null, 2) + "\n");
    return { wb, before: readFileSync(mapPath(wb), "utf-8") };
  }

  /**
   * A captured `GET issues/` response that WOULD rewrite this map if a rebuild ran:
   * its one issue carries the embedded key that folds onto the surviving entry, so a
   * rebuild replaces the legacy pair with a single foreign UUID. The fifth spelling
   * below is only evidence of anything if its fixture is destructive like this one.
   */
  function rewritingFixture(wb: string): string {
    const p = join(wb, "rebuild-issues.json");
    writeFileSync(
      p,
      JSON.stringify({
        results: [
          {
            id: "plane-uuid-from-the-rebuild",
            description_html: `<p>fusion-key: ${CIRCLE}::issues/${OPEN_ISSUE}<br></p>`,
          },
        ],
      }),
    );
    return p;
  }

  /** The pending fold is not hidden: the run names what folding the file would cost. */
  const namesTheFold = (r: RunResult) => expect(r.stderr).toContain("plane-issue-first");

  /** The mutation is refused out loud — the only other way a read can stay a read. */
  const refusesTheMutation = (r: RunResult) => {
    expect(r.status, "a refused pair exits with the usage code, not 0").toBe(EXIT_USAGE);
    expect(r.stderr, "and says which flag it refused").toContain("--rebuild-map");
  };

  // The destructive path, driven: each of these ran the fold and wrote the file.
  // The fifth reached the file by another route — the fixture rebuild sat ahead of
  // the dry-run gate, so `--plan` performed a full map replacement (issue
  // 260810-0746). It holds the invariant now because the pair is refused.
  for (const [label, argsFor, saysSo] of [
    ["map", () => ["map"], namesTheFold],
    ["map <key>", () => ["map", CIRCLE], namesTheFold],
    ["push --plan", () => ["push", "--circle", CIRCLE, "--plan"], namesTheFold],
    ["plan", () => ["plan", "--circle", CIRCLE], namesTheFold],
    [
      "push --plan --rebuild-map --fixture",
      (wb: string) => ["push", "--circle", CIRCLE, "--plan", "--rebuild-map", "--fixture", rewritingFixture(wb)],
      refusesTheMutation,
    ],
  ] as [string, (wb: string) => string[], (r: RunResult) => void][]) {
    it(`\`${label}\` leaves the file byte-identical and keeps every UUID`, () => {
      const { wb, before } = legacyWorkbench();
      const r = run(wb, ...argsFor(wb));
      const after = readFileSync(mapPath(wb), "utf-8");
      expect(after, `${label} is inspection, not a mutation`).toBe(before);
      expect(after, "the UUID the fold would discard is still on disk").toContain(
        "plane-issue-first",
      );
      saysSo(r);
    });
  }

  it("`push --plan --rebuild-map` with no fixture is refused, not silently dropped", () => {
    // The other half of the same defect (issue 260810-0747). The live rebuild sits
    // inside the `DRYRUN -eq 0` branch, so under `--plan` the flag was read once at
    // parse time and never again: exit 0, map untouched, nothing on either stream.
    // `map_forget` states this file's own rule for exactly that shape — a mutation
    // the caller asked for and did not get is a reported failure, never a no-op.
    // Both dry-run sources reach the same refusal: the flag, the `plan` alias, and
    // the env twin that forces `--plan` for a command that never typed it.
    const { wb, before } = legacyWorkbench();
    const runs: RunResult[] = [
      run(wb, "push", "--circle", CIRCLE, "--plan", "--rebuild-map"),
      run(wb, "push", "--circle", CIRCLE, "--rebuild-map", "--plan"), // flag order is not a seam
      run(wb, "plan", "--circle", CIRCLE, "--rebuild-map"), // the alias reaches the same gate
      runEnv(wb, { FUSION_PLANE_DRYRUN: "1" }, "push", "--circle", CIRCLE, "--rebuild-map"),
    ];
    for (const r of runs) {
      expect(r.status, "exit 0 having changed nothing, in silence, is the forbidden answer").toBe(
        EXIT_USAGE,
      );
      expect(r.stderr).toContain("--rebuild-map");
      expect(readFileSync(mapPath(wb), "utf-8"), "and it is refused before any write").toBe(before);
    }
    // The env spelling names the env, not a flag the caller never typed.
    expect(runs[3].stderr).toContain("FUSION_PLANE_DRYRUN=1");
  });

  it("a rebuild without a dry run still rebuilds — the refusal costs the working spelling nothing", () => {
    // The refusal must not be a ban on `--rebuild-map`. Same workbench, same
    // fixture, `--plan` dropped: the map IS replaced, which is what the flag means.
    const { wb, before } = legacyWorkbench();
    const r = run(wb, "push", "--circle", CIRCLE, "--rebuild-map", "--fixture", rewritingFixture(wb));
    expect(r.status, "the rebuild ran; the push that follows it may defer").not.toBe(EXIT_USAGE);
    const after = readFileSync(mapPath(wb), "utf-8");
    expect(after).not.toBe(before);
    expect(JSON.parse(after)[issueKey(OPEN_ISSUE)].plane_id).toBe("plane-uuid-from-the-rebuild");
  });

  it("no map file is created by a read (not even an empty one)", () => {
    // `map_ensure` used to `printf '{}' > $MAP` before anything read it. A
    // read that brings a file into existence is a small case of the same defect.
    const wb = freshWorkbench();
    expect(JSON.parse(run(wb, "map").stdout)).toEqual({});
    expect(existsSync(mapPath(wb)), "an inspection must not create the file").toBe(false);
    run(wb, "push", "--circle", CIRCLE, "--plan");
    expect(existsSync(mapPath(wb)), "a dry run must not create the file either").toBe(false);
  });

  it("a read still resolves through the fold, so it agrees with what a push would do", () => {
    // The separation must not cost the correctness the fold was added for: the
    // lookup has to see the folded keys even though the file is untouched.
    const { wb } = legacyWorkbench();
    const shown = JSON.parse(run(wb, "map").stdout);
    expect(Object.keys(shown)).toEqual([issueKey(OPEN_ISSUE)]);
    expect(shown[issueKey(OPEN_ISSUE)].plane_id).toBe("plane-issue-duplicate");
  });

  it("`map --migrate` is the command that performs the fold, and it names the loser", () => {
    const { wb } = legacyWorkbench();
    const r = run(wb, "map", "--migrate");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("migrated");
    const map = JSON.parse(readFileSync(mapPath(wb), "utf-8"));
    expect(Object.keys(map)).toEqual([issueKey(OPEN_ISSUE)]);
    expect(map[issueKey(OPEN_ISSUE)].plane_id).toBe("plane-issue-duplicate");
    expect(
      r.stderr,
      "the dropped UUID is the only handle on the Plane issue this orphans",
    ).toContain("plane-issue-first");
  });

  it("`map --migrate` on an already-folded map writes nothing and still succeeds", () => {
    const wb = freshWorkbench();
    const stable = {
      [issueKey(OPEN_ISSUE)]: {
        plane_id: "plane-issue-0001",
        kind: "fusion-issue",
        last_state: "Todo",
        last_pushed: "2026-07-19T00:00:00Z",
        origin: "fusion",
      },
    };
    writeFileSync(mapPath(wb), JSON.stringify(stable, null, 2) + "\n");
    const before = readFileSync(mapPath(wb), "utf-8");
    const r = run(wb, "map", "--migrate");
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("already marker-free");
    expect(readFileSync(mapPath(wb), "utf-8")).toBe(before);
  });

  it("a command that WAS asked to write folds the file as it writes", () => {
    // The other half of the split: withholding the fold from reads must not
    // strand a legacy map forever. `map --forget` mutates, so it folds — and the
    // entry it was not asked to touch comes out under its stable key.
    const { wb } = legacyWorkbench();
    const r = run(wb, "map", "--forget", issueKey(OPEN_ISSUE));
    expect(r.status).toBe(0);
    expect(JSON.parse(readFileSync(mapPath(wb), "utf-8"))).toEqual({});
    expect(r.stderr).toContain("plane-issue-first");
  });

  it("--forget names the FOLDED key, which is the key everything else reports", () => {
    // Consistency check on the split: the key a user copies out of `map` is the
    // key `--forget` takes. A read showing one form while a mutation demanded
    // another is how a recovery command becomes unusable as documented.
    const { wb } = legacyWorkbench();
    const shownKey = Object.keys(JSON.parse(run(wb, "map").stdout))[0];
    expect(run(wb, "map", "--forget", shownKey).status).toBe(0);
  });

  it("--forget, --prune and --migrate are mutually exclusive", () => {
    const wb = freshWorkbench();
    expect(run(wb, "map", "--migrate", "--prune").status).toBe(2); // EXIT_USAGE
    expect(run(wb, "map", "--migrate", "--forget", CIRCLE).stderr).toContain("mutually exclusive");
  });
});

describe("fusion-plane push --rebuild-map: a collision is decided, not raced", () => {
  const LEGACY_OPEN = `${CIRCLE}::issues/${OPEN_ISSUE}`;
  const LEGACY_CLOSED = `${CIRCLE}::issues/${CLOSED_ISSUE}`;

  /**
   * Two Plane issues whose embedded keys fold onto ONE stable key — the duplicate
   * pair the marker-in-the-key defect produced, which is by construction what a
   * board being rebuilt from carries. `order` swaps only their position in the
   * API response; `updated` sets each issue's own updated_at. Varying the two
   * independently is what separates "the winner is decided" from "the winner is
   * whatever came back last".
   */
  function rebuildFrom(
    opts: { order: "fs" | "sf"; updatedFirst?: string; updatedSecond?: string; current?: object },
  ): { map: Record<string, any>; stderr: string } {
    const wb = freshWorkbench();
    const first = {
      id: "plane-uuid-FIRST",
      updated_at: opts.updatedFirst ?? "",
      description_html: `<p>fusion-key: ${LEGACY_OPEN}<br></p>`,
    };
    const second = {
      id: "plane-uuid-SECOND",
      updated_at: opts.updatedSecond ?? "",
      description_html: `<p>fusion-key: ${LEGACY_CLOSED}<br></p>`,
    };
    const fixture = join(wb, "issues.json");
    writeFileSync(
      fixture,
      JSON.stringify({ results: opts.order === "fs" ? [first, second] : [second, first] }),
    );
    if (opts.current) writeFileSync(join(wb, ".plane-map.json"), JSON.stringify(opts.current));
    const r = run(wb, "push", "--circle", CIRCLE, "--rebuild-map", "--fixture", fixture);
    return {
      map: JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8")),
      stderr: r.stderr,
    };
  }

  const survivor = (m: Record<string, any>) => m[issueKey(OPEN_ISSUE)]?.plane_id;

  /**
   * The collision line the report emits for one key, split into the UUID it kept
   * and the UUIDs it told the operator to close. Read off the operator-facing
   * string rather than the jq structure: the instruction is what a human acts on,
   * so that is the surface the kept-is-never-dropped property has to hold at.
   */
  function collisionLine(stderr: string): { kept: string; dropped: string[] } | undefined {
    const m = /kept ([^,]+), DROPPED ([^.]+)\./.exec(stderr);
    return m ? { kept: m[1], dropped: m[2].split(", ") } : undefined;
  }

  it("the winner does not depend on the order Plane returned the issues in", () => {
    // THE regression. `JQ_REBUILD_MAP` assigned without a guard, so the last
    // write won and reversing the response reversed the surviving UUID.
    for (const updated of [
      { updatedFirst: "", updatedSecond: "" },
      { updatedFirst: "2026-07-19T00:00:00Z", updatedSecond: "2026-07-19T00:00:00Z" },
    ]) {
      const fs = rebuildFrom({ order: "fs", ...updated });
      const sf = rebuildFrom({ order: "sf", ...updated });
      expect(survivor(sf.map), "API result order must not decide which UUID survives").toBe(
        survivor(fs.map),
      );
    }
  });

  it("names the dropped UUID instead of discarding it in silence", () => {
    const { stderr } = rebuildFrom({ order: "fs" });
    expect(stderr, "the surviving UUID alone is not a report").toContain("DROPPED");
    expect(stderr).toContain("plane-uuid-FIRST");
    expect(stderr, "and the key it collided on, so the pair is identifiable").toContain(
      issueKey(OPEN_ISSUE),
    );
    // A genuine collision between two DISTINCT issues reports in full, and keeps
    // reporting in full: the duplicate-suppression below must not be over-applied
    // into silencing this. The loser is a second Plane issue that really is still
    // on the board, and the instruction is the only thing that gets it closed.
    expect(stderr, "the instruction is what makes the UUID actionable").toContain(
      "close it by hand",
    );
    const line = collisionLine(stderr);
    expect(line, "the collision line itself must be there, not just the word DROPPED")
      .toBeDefined();
    expect(line!.dropped).toEqual(["plane-uuid-FIRST"]);
    expect(line!.kept).toBe("plane-uuid-SECOND");
  });

  it("the same issue returned twice is no collision at all", () => {
    // Issue 260810-0748. One Plane issue can appear twice in ONE `GET issues/`
    // response — pagination overlap, a retried page, a fixture assembled from two
    // captures. The group was ranked over ENTRIES rather than over distinct
    // issues, so that UUID landed in both the kept and the dropped position and
    // the report told the operator to close by hand the live issue the rebuild
    // had just bound. A repeated issue is a no-op: no line, no dropped UUID, and
    // not a resolved collision either (reporting the count would be the same
    // wrong statement, quieter).
    const wb = freshWorkbench();
    const issue = {
      id: "plane-uuid-SAME",
      updated_at: "2026-07-19T00:00:00Z",
      description_html: `<p>fusion-key: ${LEGACY_OPEN}<br></p>`,
    };
    const fixture = join(wb, "issues.json");
    writeFileSync(fixture, JSON.stringify({ results: [issue, { ...issue }] }));
    const r = run(wb, "push", "--circle", CIRCLE, "--rebuild-map", "--fixture", fixture);
    const map = JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"));
    expect(survivor(map), "the duplicated issue still binds its key").toBe("plane-uuid-SAME");
    expect(collisionLine(r.stderr), "no collision line for a repeated issue").toBeUndefined();
    expect(r.stderr).not.toContain("DROPPED");
    expect(r.stderr, "nothing may tell a human to close the issue just bound").not.toContain(
      "close it by hand",
    );
  });

  it("a duplicated winner beside a real loser reports the loser and only the loser", () => {
    // Where the two cases above meet: three entries, two of them the same issue.
    // The collision is real (a second Plane issue carries the key), so the line
    // stays — but the UUID the rebuild kept must not appear in it, which is the
    // property the duplicate case and the genuine case share.
    const wb = freshWorkbench();
    const winner = {
      id: "plane-uuid-WIN",
      updated_at: "2026-07-20T00:00:00Z",
      description_html: `<p>fusion-key: ${LEGACY_OPEN}<br></p>`,
    };
    const loser = {
      id: "plane-uuid-LOSER",
      updated_at: "2026-07-19T00:00:00Z",
      description_html: `<p>fusion-key: ${LEGACY_CLOSED}<br></p>`,
    };
    const fixture = join(wb, "issues.json");
    writeFileSync(fixture, JSON.stringify({ results: [winner, { ...winner }, loser] }));
    const r = run(wb, "push", "--circle", CIRCLE, "--rebuild-map", "--fixture", fixture);
    const line = collisionLine(r.stderr);
    expect(line, "a real second issue still collides").toBeDefined();
    expect(line!.kept).toBe("plane-uuid-WIN");
    expect(line!.dropped).toEqual(["plane-uuid-LOSER"]);
    expect(line!.dropped, "the report never names the UUID it kept").not.toContain(line!.kept);
  });

  it("the most recently updated issue wins — the migration's rule, in the data a rebuild has", () => {
    // A rebuilt entry has no `last_pushed`, so the fold's recency tiebreak has
    // nothing to read. `updated_at` is that same question asked of Plane.
    for (const order of ["fs", "sf"] as const) {
      const { map } = rebuildFrom({
        order,
        updatedFirst: "2026-07-19T00:00:00Z",
        updatedSecond: "2026-07-20T00:00:00Z",
      });
      expect(survivor(map)).toBe("plane-uuid-SECOND");
    }
  });

  it("the UUID the current map already tracks outranks recency", () => {
    // Better evidence than the rebuild has of its own: that entry is the issue
    // fusion has been PATCHing, which is what the fold's rule is reaching for.
    const current = {
      [issueKey(OPEN_ISSUE)]: {
        plane_id: "plane-uuid-FIRST",
        kind: "fusion-issue",
        last_state: "Todo",
        last_pushed: "2026-07-21T00:00:00Z",
      },
    };
    for (const order of ["fs", "sf"] as const) {
      const { map } = rebuildFrom({
        order,
        updatedFirst: "2026-07-19T00:00:00Z",
        updatedSecond: "2026-07-20T00:00:00Z",
        current,
      });
      expect(survivor(map)).toBe("plane-uuid-FIRST");
    }
  });

  it("an entry the rebuild cannot see is named as it is dropped, with the way to restore it", () => {
    // A rebuild REPLACES the map. A seed-origin binding is a human's own Plane
    // story, whose body carries no `fusion-key:` at all, so no rebuild can see
    // it — and losing `origin:"seed"` is what lets a later push overwrite that
    // human's title. It is not merged back (a rebuild that kept unverifiable
    // entries would stop being a rebuild), so it is reported instead.
    const wb = freshWorkbench();
    writeFileSync(
      join(wb, ".plane-map.json"),
      JSON.stringify({
        [CIRCLE]: {
          plane_id: "plane-uuid-humans-story",
          kind: "circle",
          last_state: "Todo",
          last_pushed: "2026-07-19T00:00:00Z",
          origin: "seed",
        },
      }),
    );
    const fixture = join(wb, "issues.json");
    writeFileSync(
      fixture,
      JSON.stringify({
        results: [{ id: "plane-uuid-other", description_html: `<p>fusion-key: ${LEGACY_OPEN}<br></p>` }],
      }),
    );
    const r = run(wb, "push", "--circle", CIRCLE, "--rebuild-map", "--fixture", fixture);
    const map = JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"));
    expect(map[CIRCLE], "a rebuild replaces the map; this is the documented cost").toBeUndefined();
    expect(r.stderr).toContain("plane-uuid-humans-story");
    expect(r.stderr, "the report has to carry the way back").toContain("seed --record-origin");
  });

  // -- the id guard (issue 260810-0939 …the-winner-subtraction-silences-a-real-
  //    collision-when-neither-entry-carries-an-id) --------------------------------
  //
  // The winner's id is subtracted from the losers so an issue returned twice is not
  // reported as colliding with itself. That is sound while `.id` is a real UUID —
  // and there was exactly one input where two DISTINCT entries share one: neither
  // carries an id at all. `[null] - [null]` is empty, so the group reported nothing,
  // and the map got `plane_id: null` (which `map_get_id` reads as "no mapping"
  // anyway). Both halves are now closed at extraction.

  it("two distinct entries that both lack an id reach the map as nothing, and are named", () => {
    const wb = freshWorkbench();
    const fixture = join(wb, "issues.json");
    writeFileSync(
      fixture,
      JSON.stringify({
        results: [
          { updated_at: "2026-08-01T00:00:00Z", description_html: `<p>fusion-key: ${LEGACY_OPEN}<br></p>` },
          { updated_at: "2026-08-02T00:00:00Z", description_html: `<p>fusion-key: ${LEGACY_CLOSED}<br></p>` },
        ],
      }),
    );
    const r = run(wb, "map", "--rebuild", "--fixture", fixture);
    const map = JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"));
    expect(map[issueKey(OPEN_ISSUE)], "a plane_id of null is not a mapping").toBeUndefined();
    expect(
      Object.values(map).some((e: any) => e.plane_id === null),
      "no entry may reach the map with a null plane_id",
    ).toBe(false);
    // The silence is the defect: the pre-fix filter at least printed DROPPED null.
    expect(r.stderr, "an input the rebuild threw away is reported").toContain("SKIPPED");
    expect(r.stderr, "and the key it threw away, so it is identifiable").toContain(
      issueKey(OPEN_ISSUE),
    );
    expect(r.stderr, "counted per key, so two entries do not read as one").toContain("2 issue(s)");
  });

  it("an id-less entry never displaces one carrying an id", () => {
    // The over-application guard on the other side: dropping at extraction must
    // cost the usable entry nothing, and must not turn a one-real-issue response
    // into a collision.
    const wb = freshWorkbench();
    const fixture = join(wb, "issues.json");
    writeFileSync(
      fixture,
      JSON.stringify({
        results: [
          { id: "plane-uuid-REAL", updated_at: "2026-08-01T00:00:00Z", description_html: `<p>fusion-key: ${LEGACY_OPEN}<br></p>` },
          { updated_at: "2026-08-02T00:00:00Z", description_html: `<p>fusion-key: ${LEGACY_CLOSED}<br></p>` },
        ],
      }),
    );
    const r = run(wb, "map", "--rebuild", "--fixture", fixture);
    const map = JSON.parse(readFileSync(join(wb, ".plane-map.json"), "utf-8"));
    expect(survivor(map), "the identifiable issue still binds its key").toBe("plane-uuid-REAL");
    expect(collisionLine(r.stderr), "an unidentifiable entry is not a colliding issue").toBeUndefined();
    expect(r.stderr, "but it is still reported").toContain("SKIPPED");
  });

  it("a genuine two-issue collision is untouched by the id guard", () => {
    // The over-application failure for this fix, pinned: both issues carry real
    // UUIDs, so nothing is skipped and the collision reports in full.
    const { stderr } = rebuildFrom({ order: "fs" });
    expect(stderr, "nothing was unidentifiable here").not.toContain("SKIPPED");
    const line = collisionLine(stderr);
    expect(line!.kept).toBe("plane-uuid-SECOND");
    expect(line!.dropped).toEqual(["plane-uuid-FIRST"]);
    expect(stderr).toContain("close it by hand");
  });
});

// ===========================================================================
// 2d. The rebuild as a command of its own
//     (issue 260810-0939 …the-rebuild-map-refusal-tells-the-operator-to-run-a-
//      live-push-to-obtain-a-dry-run).
//
//     The refusal of `push --plan --rebuild-map` is correct and had nowhere
//     honest to send the operator: its remedy was `push --rebuild-map … && plan …`,
//     whose first command is a full live reconcile — config, key, fetch_states,
//     POST and PATCH on the board. Someone who asked for a preview was told to
//     mutate Plane to get one, under a doc heading promising the opposite.
//
//     `map --rebuild` is the rebuild without the reconcile, in the shape
//     `map --migrate` already had: mutate the map, report, stop.
// ===========================================================================
describe("fusion-plane map --rebuild: the rebuild without the reconcile", () => {
  const mapPath = (wb: string) => join(wb, ".plane-map.json");
  const outbox = (wb: string) => join(wb, ".plane-outbox.jsonl");

  /** A captured `GET issues/` response binding the Circle's open issue to one UUID. */
  function fixtureFor(wb: string, id = "plane-uuid-rebuilt"): string {
    const p = join(wb, "rebuild-issues.json");
    writeFileSync(
      p,
      JSON.stringify({
        results: [
          { id, description_html: `<p>fusion-key: ${CIRCLE}::issues/${OPEN_ISSUE}<br></p>` },
        ],
      }),
    );
    return p;
  }

  it("rebuilds the map and stops — no reconcile, no outbox, exit 0", () => {
    // "And stops" is the whole point, so it is measured against the command that
    // does NOT stop: the same rebuild under `push --rebuild-map` walks on into the
    // live branch and defers every artifact to the outbox.
    const wb = freshWorkbench();
    const r = run(wb, "map", "--rebuild", "--fixture", fixtureFor(wb));
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("STATUS: rebuilt");
    expect(JSON.parse(readFileSync(mapPath(wb), "utf-8"))[issueKey(OPEN_ISSUE)].plane_id).toBe(
      "plane-uuid-rebuilt",
    );
    expect(existsSync(outbox(wb)), "a rebuild reconciles nothing, so it defers nothing").toBe(false);

    // The positive control for that last assertion.
    const wb2 = freshWorkbench();
    const push = run(wb2, "push", "--circle", CIRCLE, "--rebuild-map", "--fixture", fixtureFor(wb2));
    expect(push.status, "the push form goes on to reconcile and defers").toBe(EXIT_DEFERRED);
    expect(existsSync(outbox(wb2))).toBe(true);
  });

  it("needs neither the API key nor a valid config — it makes no call", () => {
    // Two proofs in one run. The fixture workbench's base_url is the reserved
    // `.test` TLD (RFC 6761, guaranteed not to resolve), so any call would fail and
    // this exits 0. And the config is put back to the shipped all-zero project_id,
    // which `config_valid` rejects: reaching exit 0 through it proves the fixture
    // path runs ahead of the config+key gate, exactly as `--migrate` needs neither.
    const wb = freshWorkbench();
    const cfg = join(wb, "plane.config.yaml");
    writeFileSync(
      cfg,
      readFileSync(cfg, "utf-8").replace(
        /^project_id:.*$/m,
        'project_id: "00000000-0000-0000-0000-000000000000"',
      ),
    );
    const r = run(wb, "map", "--rebuild", "--fixture", fixtureFor(wb));
    expect(r.status, "no key, no config, no network — and it rebuilt").toBe(0);
    expect(r.stderr, "nothing reached the wire, so nothing reported it unreachable").not.toContain(
      "unreachable",
    );
    expect(Object.keys(JSON.parse(readFileSync(mapPath(wb), "utf-8")))).toEqual([
      issueKey(OPEN_ISSUE),
    ]);
  });

  it("C4: with no key or no reachable Plane it changes NOTHING and exits 10", () => {
    // The live spelling, against the unroutable fixture host. Either branch that
    // gets here — absent key, or key present and the host unreachable — must leave
    // the map exactly as it was. A rebuild from an unanswered request would empty it.
    const wb = freshWorkbench();
    writeFileSync(mapPath(wb), JSON.stringify(collidingLegacyMap, null, 2) + "\n");
    const before = readFileSync(mapPath(wb), "utf-8");
    const r = run(wb, "map", "--rebuild");
    expect(r.status).toBe(EXIT_DEFERRED);
    expect(readFileSync(mapPath(wb), "utf-8"), "an outage must never cost map entries").toBe(before);
    expect(r.stdout + r.stderr).toContain("map not changed");
  });

  it("reads the fixture from FUSION_PLANE_ISSUES_FIXTURE too", () => {
    const wb = freshWorkbench();
    const r = runEnv(wb, { FUSION_PLANE_ISSUES_FIXTURE: fixtureFor(wb) }, "map", "--rebuild");
    expect(r.status).toBe(0);
    expect(JSON.parse(readFileSync(mapPath(wb), "utf-8"))[issueKey(OPEN_ISSUE)].plane_id).toBe(
      "plane-uuid-rebuilt",
    );
  });

  it("the env fixture means nothing to the other map commands", () => {
    // An exported test seam must not turn `map` into a rebuild behind the user.
    const wb = freshWorkbench();
    writeFileSync(mapPath(wb), JSON.stringify(collidingLegacyMap, null, 2) + "\n");
    const before = readFileSync(mapPath(wb), "utf-8");
    const r = runEnv(wb, { FUSION_PLANE_ISSUES_FIXTURE: fixtureFor(wb) }, "map");
    expect(r.status).toBe(0);
    expect(readFileSync(mapPath(wb), "utf-8")).toBe(before);
  });

  it("--fixture without --rebuild is a usage error, not a quiet dump of the map", () => {
    const r = run(freshWorkbench(), "map", "--fixture", "/nonexistent.json");
    expect(r.status).toBe(EXIT_USAGE);
    expect(r.stderr).toContain("--fixture");
  });

  it("--rebuild is mutually exclusive with the other mutators", () => {
    const wb = freshWorkbench();
    expect(run(wb, "map", "--rebuild", "--migrate").status).toBe(EXIT_USAGE);
    expect(run(wb, "map", "--rebuild", "--prune").stderr).toContain("mutually exclusive");
    expect(run(wb, "map", "--rebuild", "--forget", CIRCLE).status).toBe(EXIT_USAGE);
  });

  it("the refusal hands the operator this command, and not an && chain", () => {
    // The defect was in the remedy, not the refusal. What it printed was
    // `push --rebuild-map --circle <dir> && plan --circle <dir>`: a live reconcile
    // offered as the way to obtain a dry run, chained with an `&&` that swallows the
    // plan whenever the first half defers (exit 10, the ordinary offline case).
    const wb = freshWorkbench();
    const r = run(wb, "push", "--circle", CIRCLE, "--plan", "--rebuild-map");
    expect(r.status).toBe(EXIT_USAGE);
    expect(r.stderr, "it names the non-reconciling command").toContain("map --rebuild");
    expect(r.stderr, "and no longer the live push").not.toContain("push --rebuild-map --circle");
    expect(r.stderr, "two commands, so a deferred first step cannot swallow the second").not.toContain(
      "&&",
    );
  });

  it("rebuild, then plan: the remedy runs, and the plan mutates nothing", () => {
    // The refusal's guidance, executed end to end. This is what makes the sentence
    // "rebuild, then plan against the rebuilt map" true: the rebuild happens without
    // a single call to the board, the plan is computed FROM the rebuilt map, and the
    // map is byte-identical afterwards.
    const wb = freshWorkbench();
    expect(run(wb, "map", "--rebuild", "--fixture", fixtureFor(wb)).status).toBe(0);
    const afterRebuild = readFileSync(mapPath(wb), "utf-8");

    const p = run(wb, "plan", "--circle", CIRCLE);
    expect(p.status).toBe(0);
    const op = opFor(plan(p.stdout).ops, issueKey(OPEN_ISSUE));
    expect(op.op, "the rebuilt UUID is what the plan now updates").toBe("update");
    expect(op.plane_id).toBe("plane-uuid-rebuilt");
    expect(readFileSync(mapPath(wb), "utf-8"), "and the plan wrote nothing").toBe(afterRebuild);
    expect(existsSync(outbox(wb)), "neither half touched the board").toBe(false);
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
        [sharedIssueKey("260719-1700_o_shared-issue.md")]: {
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
    expect(Object.keys(map)).toEqual([sharedIssueKey("260719-1700_o_shared-issue.md")]);
    // The surviving entry is untouched, not merely present.
    expect(map[sharedIssueKey("260719-1700_o_shared-issue.md")]).toMatchObject({
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
  //
  // ONE exemption, and it is narrow by construction: the all-zero UUID. It is
  // the value templates/plane.config.yaml ships `project_id` with, and
  // `config_valid` compares against it to catch an unfilled config. It resolves
  // to no project on any instance, so it can never be the hardcoded live
  // identifier this guard exists to forbid. Do not widen the exemption to any
  // other literal — every other UUID names something real somewhere.
  const UUID = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;
  const ZERO_UUID = "00000000-0000-0000-0000-000000000000";

  function uuidHits(text: string): { line: number; literal: string }[] {
    const hits: { line: number; literal: string }[] = [];
    text.split("\n").forEach((line, i) => {
      UUID.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = UUID.exec(line)) !== null) {
        if (m[0] === ZERO_UUID) continue;
        hits.push({ line: i + 1, literal: m[0] });
      }
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

describe("fusion-plane lint guards: the natural key is built in exactly one place", () => {
  // Issue 260807-1939 was not one bad line — it was SIX, each independently
  // composing `<scope>::<subdir>/$(basename …)` and each independently embedding
  // the state marker. Consolidating them into `natural_key()` fixes the six; this
  // guard is what stops a seventh, because a new call site written in the old
  // shape reintroduces the whole defect for whichever artifact kind it walks.
  //
  // The signature it forbids is narrow and exact: composing the `::` key
  // separator together with a `basename` in one line. That is what every one of
  // the six did and what `natural_key` now does once. Comment lines are exempt —
  // the header documents the key form in prose and must stay free to.
  const KEY_COMPOSITION = /::/;

  function compositionSites(text: string): { line: number; text: string }[] {
    return text
      .split("\n")
      .map((text, i) => ({ line: i + 1, text }))
      .filter((l) => !/^\s*#/.test(l.text) && KEY_COMPOSITION.test(l.text) && /basename/.test(l.text));
  }

  it("only natural_key() composes a key out of a basename", () => {
    const src = readFileSync(fusionPlane, "utf-8");
    const sites = compositionSites(src);
    expect(
      sites.length,
      `every natural key must come from natural_key(); these lines build one themselves:\n` +
        sites.map((s) => `  bin/fusion-plane:${s.line}  ${s.text.trim()}`).join("\n"),
    ).toBe(1);
    expect(sites[0].text, "the one site is natural_key's own printf").toContain("stable_basename");
  });

  it("natural_key strips the marker rather than passing the basename through", () => {
    // The consolidation is worth nothing if the single site keeps the marker. The
    // behavioural tests above prove this end to end; this pins the mechanism so a
    // refactor cannot quietly drop it.
    const src = readFileSync(fusionPlane, "utf-8");
    expect(src).toMatch(/^stable_basename\(\) \{/m);
    expect(src, "the marker segment is what stable_basename removes").toMatch(
      /sed -E 's\/\^\(\[0-9\]\{6\}-\[0-9\]\{4\}\)_\[a-z\]_\/\\1_\//,
    );
  });

  it("the guard fires loudly if a seventh site is introduced", () => {
    const src = readFileSync(fusionPlane, "utf-8").split("\n");
    const copy = [...src];
    copy.splice(60, 0, '  process_artifact decision "$f" "$name::decisions/$(basename "$f")" "$name"');
    expect(compositionSites(copy.join("\n")).length).toBe(2);
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
// 5b. An unfilled config must not report itself valid.
//
//     `config_valid` promised "non-placeholder-ish" in its comment and tested
//     only for non-emptiness, so a workbench holding the untouched template
//     reported `config valid: yes` and every live command marched on to a
//     request that could not succeed. The failure it then reported named the
//     network, not the unfilled field.
//
//     The check is an equality test against the three values the template
//     ships, NOT a guess at what looks like a placeholder. That distinction is
//     the point: `http://localhost:9999` and a four-letter workspace slug are a
//     real, working configuration, and reading them as placeholders is the
//     error that once cost a real story its manual walk through Plane's states.
// ===========================================================================
describe("fusion-plane config_valid: the shipped template is not a valid config", () => {
  const templatePath = join(pluginRoot, "templates", "plane.config.yaml");

  /** Value of a top-level scalar in a plane.config.yaml, comments stripped. */
  function scalar(text: string, key: string): string {
    const line = text.split("\n").find((l) => l.startsWith(`${key}:`));
    if (!line) throw new Error(`no top-level '${key}:' in config`);
    const raw = line.slice(key.length + 1).trim();
    const quoted = raw.match(/^"([^"]*)"/);
    return quoted ? quoted[1] : raw.replace(/\s+#.*$/, "").trim();
  }

  /** A workbench whose plane.config.yaml is the pristine shipped template. */
  function pristineWorkbench(): string {
    const root = mkdtempSync(join(tmpdir(), "fusion-plane-pristine-"));
    const wb = join(root, "workbench");
    cpSync(fixtureWorkbench, wb, { recursive: true });
    cpSync(templatePath, join(wb, "plane.config.yaml"));
    scratch.push(root);
    return wb;
  }

  it("the helper's three template constants match what the template actually ships", () => {
    // The one coupling the fix introduces. bin/fusion-plane names the three
    // shipped values as literals; if the template changes one and the helper
    // does not, the check silently stops catching an unfilled field.
    const tpl = readFileSync(templatePath, "utf-8");
    const src = readFileSync(fusionPlane, "utf-8");
    for (const [key, constant] of [
      ["base_url", "TEMPLATE_BASE_URL"],
      ["workspace_slug", "TEMPLATE_WORKSPACE_SLUG"],
      ["project_id", "TEMPLATE_PROJECT_ID"],
    ] as const) {
      const shipped = scalar(tpl, key);
      expect(
        src,
        `bin/fusion-plane's ${constant} must equal what templates/plane.config.yaml ships for ${key} ('${shipped}')`,
      ).toContain(`${constant}="${shipped}"`);
    }
  });

  it("a live command on the untouched template exits EXIT_CONFIG, naming every unfilled field", () => {
    const r = run(pristineWorkbench(), "push", "--all");
    expect(r.status, "an unfilled config is a config error, not a network deferral").toBe(1);
    expect(r.stderr).toContain("base_url is still the template value");
    expect(r.stderr).toContain("workspace_slug is still the template value");
    expect(r.stderr).toContain("project_id is still the template's all-zero UUID");
  });

  it("`doctor` on the untouched template answers NO, not yes", () => {
    // The surface an agent is told to consult instead of reading the file.
    const r = run(pristineWorkbench(), "doctor");
    expect(r.stdout).toContain("config valid:     NO");
    expect(r.stdout).not.toContain("config valid:     yes");
  });

  it("a short, plain, REAL config is not mistaken for a placeholder", () => {
    // The false positive that must never come back: localhost and a short slug
    // are a locally hosted instance, not an unfilled template.
    const wb = freshWorkbench();
    const cfgPath = join(wb, "plane.config.yaml");
    writeFileSync(
      cfgPath,
      readFileSync(cfgPath, "utf-8")
        .replace(/^base_url:.*$/m, 'base_url: "http://localhost:9999"')
        .replace(/^workspace_slug:.*$/m, 'workspace_slug: "fusion-local"'),
    );
    const r = run(wb, "doctor");
    expect(r.stdout).toContain("config valid:     yes");
    expect(r.stdout).toContain("base=http://localhost:9999");
    expect(r.stderr).not.toContain("template value");
  });

  it("one unfilled field among two filled ones is still caught", () => {
    const wb = freshWorkbench();
    const cfgPath = join(wb, "plane.config.yaml");
    writeFileSync(
      cfgPath,
      readFileSync(cfgPath, "utf-8").replace(/^workspace_slug:.*$/m, 'workspace_slug: "your-workspace-slug"'),
    );
    const r = run(wb, "doctor");
    expect(r.stdout).toContain("config valid:     NO");
    expect(r.stderr).toContain("workspace_slug is still the template value");
    expect(r.stderr, "the two filled fields must not be reported").not.toContain("base_url is still");
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

// ===========================================================================
// 7. A failed write is reported as a failure; the read view is built once
//    (issues 260810-0743 and 260810-0744).
//
//    Two defects with one root: an operation whose status nobody read.
//
//    `map_put` is the single place `.plane-map.json` is replaced, and it dropped
//    `mv`'s status — so `map --migrate` printed "STATUS: migrated (1 entries)"
//    and exited 0 over a file it had not touched, and every caller's
//    `|| return "$EXIT_CONFIG"` guard was dead code. On the live push path the
//    same lost write means a created issue's UUID never reaches the map and the
//    next push POSTs a second Plane issue for one record — the defect the whole
//    natural-key line of work exists to close.
//
//    `map_view` cached its fold in shell variables and handed its temp file to an
//    EXIT trap, while every getter that called it ran inside a command
//    substitution. A subshell keeps neither: measured against `c923935`, one
//    `push --plan --all` over a legacy map recomputed the fold 24 times, left 24
//    temp files behind, and printed the once-per-run report 24 times.
//
//    The function's header already named that hazard, for the return value only.
//    The code moved to the header rather than the reverse: building the view is
//    the parent's job (one `map_view` per subcommand) and a getter only reads it.
// ===========================================================================

/** Run fusion-plane with extra environment on top of the fixture workbench. */
function runEnv(
  workbench: string,
  extraEnv: Record<string, string>,
  ...args: string[]
): RunResult {
  const r = spawnSync(fusionPlane, args, {
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FUSION_PLANE_WORKBENCH: workbench, ...extraEnv },
  });
  return {
    status: r.status ?? -1,
    stdout: r.stdout?.toString() ?? "",
    stderr: r.stderr?.toString() ?? "",
  };
}

/** A map still in the legacy marker-bearing form — what the fold exists for. */
const LEGACY_MAP = {
  [`${CIRCLE}::issues/260719-1600_o_open-issue.md`]: {
    plane_id: "UUID-OPEN",
    kind: "fusion-issue",
    last_state: "Todo",
    last_pushed: "2026-08-01T00:00:00Z",
  },
};

describe("fusion-plane: a failed map write is reported as a failure", () => {
  const mapPath = (wb: string) => join(wb, ".plane-map.json");

  /**
   * Make the workbench directory unwritable for the duration of one run, so the
   * `mv` inside `map_put` fails the way it does on a read-only mount or a full
   * disk. The mode is restored before the assertions so `afterEach` can clean up.
   */
  function runUnwritable(wb: string, ...args: string[]): RunResult {
    chmodSync(wb, 0o555);
    try {
      return run(wb, ...args);
    } finally {
      chmodSync(wb, 0o755);
    }
  }

  it("`map --migrate` over an unwritable workbench exits non-zero and claims nothing", () => {
    const wb = freshWorkbench();
    writeFileSync(mapPath(wb), JSON.stringify(LEGACY_MAP));
    const before = readFileSync(mapPath(wb), "utf-8");

    const r = runUnwritable(wb, "map", "--migrate");

    expect(r.status, "a migration that did not happen must not exit 0").not.toBe(0);
    expect(r.stdout).not.toContain("STATUS: migrated");
    expect(r.stderr).toContain("could not replace");
    expect(readFileSync(mapPath(wb), "utf-8")).toBe(before);
  });

  it("`map --forget` over an unwritable workbench does not report the key forgotten", () => {
    // The same chain one function further out: map_forget ends in
    // `map_write … || return "$EXIT_CONFIG"`, a guard that could never fire while
    // map_put returned 0. Its "%s entries remain" count was read back out of the
    // unchanged file, so the report was self-consistent and wrong.
    const wb = freshWorkbench();
    const key = `${CIRCLE}::issues/260719-1600_open-issue.md`;
    writeFileSync(mapPath(wb), JSON.stringify({ [key]: { plane_id: "UUID-OPEN", kind: "fusion-issue", last_state: "Todo", last_pushed: "2026-08-01T00:00:00Z" } }));
    const before = readFileSync(mapPath(wb), "utf-8");

    const r = runUnwritable(wb, "map", "--forget", key);

    expect(r.status).not.toBe(0);
    expect(r.stdout).not.toContain("STATUS: forgotten");
    expect(readFileSync(mapPath(wb), "utf-8")).toBe(before);
  });

  it("the positive control: the same migration on a writable workbench succeeds", () => {
    // Without this the two tests above could pass because the fixture never
    // reaches the write at all. It does: the identical map, one permission bit
    // apart, migrates and reports it.
    const wb = freshWorkbench();
    writeFileSync(mapPath(wb), JSON.stringify(LEGACY_MAP));

    const r = run(wb, "map", "--migrate");

    expect(r.status).toBe(0);
    expect(r.stdout).toContain("STATUS: migrated");
    expect(Object.keys(JSON.parse(readFileSync(mapPath(wb), "utf-8")))).toEqual([
      `${CIRCLE}::issues/260719-1600_open-issue.md`,
    ]);
  });

  it("refuses to replace the map with an empty file when jq read no input", () => {
    // The sibling of the same trap on the other side of the pipe: `jq` exits 0 on
    // EMPTY input and produces nothing, so a zero-status jq does not mean the
    // program ran. Over a truncated (zero-byte) map, `.[$k] = {…}` yields nothing,
    // and the empty result would have been moved over the map — the new entry
    // lost, every existing one with it, exit 0 and "STATUS: origin recorded".
    const wb = freshWorkbench();
    writeFileSync(mapPath(wb), "");

    const r = run(wb, "seed", "--record-origin", CIRCLE, "origin-uuid-1");

    expect(r.status).not.toBe(0);
    expect(r.stdout).not.toContain("STATUS: origin recorded");
    expect(r.stderr).toContain("empty file");
  });
});

describe("fusion-plane: the map view is built once, in the parent shell", () => {
  /**
   * One `push --plan --all` over a legacy map, with TMPDIR pointed at a private
   * empty directory so every temp file the run creates is countable.
   */
  function measure(binary: string): { files: number; foldReports: number } {
    const root = mkdtempSync(join(tmpdir(), "fusion-plane-tmpdir-"));
    scratch.push(root);
    const wb = join(root, "workbench");
    cpSync(fixtureWorkbench, wb, { recursive: true });
    writeFileSync(join(wb, ".plane-map.json"), JSON.stringify(LEGACY_MAP));
    const td = join(root, "tmp");
    mkdirSync(td);

    const r = spawnSync(binary, ["push", "--plan", "--all"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, FUSION_PLANE_WORKBENCH: wb, TMPDIR: td },
    });
    const stderr = r.stderr?.toString() ?? "";
    return {
      files: readdirSync(td).length,
      foldReports: stderr.split("\n").filter((l) => l.includes("still carries the old marker-bearing keys")).length,
    };
  }

  it("leaves no temp file behind and reports the fold once, not once per lookup", () => {
    const { files, foldReports } = measure(fusionPlane);
    expect(files, "every temp file the fold creates must be removed at exit").toBe(0);
    expect(foldReports, "the once-per-run report must arrive once").toBe(1);
  });

  it("the control: the pre-fix binary from git leaks a file and repeats the report", () => {
    // The negative control runs the ACTUAL pre-fix text, read out of git and
    // driven through the identical path — not a re-implementation of the leak.
    // Measured at c923935: 24 temp files, 24 fold reports. The assertions are on
    // the property (more than one of each), not on the constant, because the count
    // is the number of map lookups the fixture happens to make.
    const show = spawnSync("git", ["-C", pluginRoot, "show", "c923935:bin/fusion-plane"], {
      encoding: "utf-8",
    });
    if (show.status !== 0) {
      // An installed copy or a shallow clone has no such commit. Skipping is
      // visible in the reporter; inventing the pre-fix text would not be a control.
      return;
    }
    const root = mkdtempSync(join(tmpdir(), "fusion-plane-prefix-"));
    scratch.push(root);
    const bin = join(root, "fusion-plane-prefix");
    writeFileSync(bin, show.stdout, { mode: 0o755 });

    const { files, foldReports } = measure(bin);
    expect(files, "the pre-fix binary is expected to leak").toBeGreaterThan(1);
    expect(foldReports, "the pre-fix binary is expected to repeat the report").toBeGreaterThan(1);
  });

  it("no map getter builds the view — each one only reads it", () => {
    // The structural half of the same fix. A getter that calls `map_view` is a
    // getter that builds the fold in a subshell, which is how the leak came back
    // into a file whose header had already named the hazard.
    const src = readFileSync(fusionPlane, "utf-8");
    for (const name of ["map_json", "map_get_id", "map_get_state", "map_get_origin"]) {
      const body = bashFunctionBody(src, name);
      expect(body, `${name}() must be defined in bin/fusion-plane`).toBeTruthy();
      expect(body, `${name}() must assert the view, not build it`).toContain("map_view_required");
      // `map_view_required` contains the string `map_view`, so the check is on a
      // call to `map_view` as a whole word followed by a terminator, not a prefix.
      expect(
        /\bmap_view(\s|;|$)/.test(body!),
        `${name}() must not call map_view itself — it runs in a subshell`,
      ).toBe(false);
    }
  });
});

/**
 * The text of a bash function body, from `name() {` to the closing brace.
 * Handles the one-line getters (`f() { …; }`) and the multi-line ones alike.
 * Returns undefined when no such definition exists, so a renamed function fails
 * the assertion above rather than passing over a body it never found.
 */
function bashFunctionBody(src: string, name: string): string | undefined {
  const lines = src.split("\n");
  const open = new RegExp(`^${name}\\(\\)\\s*\\{`);
  const start = lines.findIndex((l) => open.test(l));
  if (start === -1) return undefined;
  if (lines[start].trimEnd().endsWith("}")) return lines[start];
  const out: string[] = [];
  for (let i = start; i < lines.length; i++) {
    out.push(lines[i]);
    if (i > start && lines[i] === "}") return out.join("\n");
  }
  return undefined;
}

describe("fusion-plane: an unreadable record skips the spec-comment", () => {
  it("plans no spec-comment op and says why, instead of planning an empty one", () => {
    // Issue 260810-0750. The body was built through a pipe —
    // `build_comment_body … | jq -r '.comment_html'` — and only the second jq's
    // status survived. Measured against c923935 with this exact scenario, the op
    // came out carrying `<!-- fusion-spec-comment:… -->\n<pre></pre>`: the marker
    // intact and the record body gone, which the live path would have pushed over
    // the Circle brief. (The filed record predicted `comment_html: ""`; the
    // mechanism is the one it names, the surviving string is the marker.)
    // `comment_skip` exists for exactly this outcome and was unreachable here.
    const wb = freshWorkbench();
    const cfg = join(wb, "plane.config.yaml");
    writeFileSync(cfg, readFileSync(cfg, "utf-8") + "\nspec_comment: true\n");
    const record = join(wb, "circles", CIRCLE, "_t_circle.md");
    chmodSync(record, 0o000);

    const r = run(wb, "push", "--circle", CIRCLE, "--plan");
    chmodSync(record, 0o644);

    const ops = plan(r.stdout).ops;
    expect(ops.some((o) => o.op === "spec-comment"), "no comment is better than an empty one").toBe(false);
    expect(r.stderr).toContain("spec-comment unavailable");
    expect(r.stderr).toContain("record unreadable");
    // Auxiliary, so it never costs the state transition: the Circle's own op is
    // still planned and the dry run still exits 0.
    expect(opFor(ops, CIRCLE)).toBeDefined();
    expect(r.status).toBe(0);
  });
});

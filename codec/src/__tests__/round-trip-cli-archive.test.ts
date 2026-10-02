// ---------------------------------------------------------------------------
// The archive revision through `bin/fusion-record`, recorded (the archive
// revision plan's step 9; Prior `b912302` `## 36` and `## 37`, requests 39 to
// 41 of `codec/fixtures/prior/REQUESTS.md` `## The archive revision (the
// contract delta)`).
//
// Fifty-one exchanges, through the wrapper only, over a fresh temp copy of
// this session's own `base/`: a workbench under JSON control whose records
// stand in the states Prior's case list needs. The states between exchanges
// are built by the host: before some exchanges the recorder moves, copies,
// links or removes files, as `HOST` lists them, and the codec moves no file.
//
//   01 inspect      json-control, pending null, maintenance null
//   02 validate     valid, every record of base/
//   03 reconcile    every binding: the chain A -> B -> C, I -> T, C's backup
//                   under archive/migrations/, both evidence groups
//   04 create       H, a shared issue pair with its narrative
//   05 transition   H open -> closed
//   06-10           request 37: a transition carrying a field foreign to the
//                   record's kind, one per kind (package, issue, plan,
//                   decision, discussion): schema-invalid/
//                   payload-field-not-admitted, nothing written
//   11 maintenance  begin over a pending intent recovery cannot land (seeded,
//                   its file diverged by hand): operation-unknown/
//                   recovery-blocked, no fence
//   12 maintenance  11 again after the file was restored (seeded): the intent
//                   rolls forward, then the fence is set
//   13 inspect      maintenance names the fence
//   14 transition   the request the seeded intent was cut from: its stored
//                   answer, under the fence (the replay lookup comes first)
//   15 transition   a fresh mutation: conflict/maintenance-active
//   -- the host moves T, H and the package D whole (its evidence group and
//      its issue inside it) into archive/261001-1200-sweep/, puts an older
//      copy of B's control file into archive/260925-0900-sweep/, and links
//      shared/old to the sweep's shared/issues
//   16 validate     valid, the archived records gone from the count
//   17 reconcile    I -> T record-not-found; A -> B resolved, B's archived
//                   copy no second carrier; C's backup still resolved
//   18 list         unscoped: nothing under archive/
//   19 list         scope archive: unknown-scope/archived-path
//   20 reconcile    scope inside the sweep: unknown-scope/archived-path
//   21 show         T's archived path: unresolved-reference/record-not-found
//   22 validate     D's archived package.json: a record-not-found finding
//   23 show         T through the link shared/old: record-not-found
//   24 list         scope shared/old: unknown-scope/archived-path
//   25 create       04 repeated: 04's bytes, nothing recreated
//   26 maintenance  end naming 12's fence
//   27 inspect      maintenance null
//   28 transition   T's archived path: record-not-found
//   29 create       into D's archived container: unknown-scope/archived-path
//   30-36           failed move 1, control without its narrative (F)
//   37-43           failed move 2, narrative without its control (F)
//   44-50           failed move 3, the package D2 moved, its evidence group
//                   left behind
//                   each: begin, the host's partial move, inspect, validate,
//                   reconcile, a fresh mutation refused, the host's restore,
//                   end, validate
//   51 inspect      .json-state/journal replaced by a file: operation-unknown/
//                   pending-initialize-unreadable, exit 0
//
// ## The recorded session
//
// Every exchange is recorded under `fixtures/protocol-session-archive/` as
// `<nn>-<op>.request.json` and `<nn>-<op>.response.json`, a GOLDEN as the
// other sessions are, rewritten only under `UPDATE_PROTOCOL_SESSION_ARCHIVE=1`.
// `base/` is written from the constants below under that variable and checked
// on every run. Three substitutions:
//
//   - `<workbench>`, the temp workbench's absolute path, as in every session;
//   - `<request-digest:14-transition>` in the seeded intent, the initialize
//     session's rule: the digest of exchange 14's request as sent, which is
//     in sorted key order so its line is its canonical rendering;
//   - `<since:<nn>-maintenance>` for the fence's `since`. The codec takes it
//     from the clock when `begin` lands, and the wrapper passes no clock, so
//     it is the one value of this session a replay cannot fix. Each landed
//     `begin` answers it; every later occurrence (the `begin` answer, the
//     `inspect` answers, a `maintenance-active` detail, the `end` answer) is
//     recorded as the placeholder naming that `begin`, and a case holds every
//     such value to be a timestamp of the run.
//
// Nothing else depends on the clock, the host or a generated id.
//
// ## Reviewed deltas
//
// A recorded response a later revision moves is never rewritten, not even
// under the update variable (`helpers/session.ts`, "reviewed deltas"). FJ04's
// step 5 moves the six successful `inspect` answers, 01, 13, 27, 31, 38 and
// 45, each by `<nn>-inspect.migration-delta.json`: the three migration
// schemas join `schemas`, `migration` joins `operations.implemented` and
// `operations.deferred` becomes empty. Their gate holds the fresh answer equal
// to the recording with exactly that delta applied; every other exchange is
// byte for byte.
// ---------------------------------------------------------------------------

import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import { canonical, requestDigest, type Intent } from "../journal.js";
import { CutReached } from "../kernel.js";
import { revisionOf, serialise } from "../store.js";
import { CODEC_DIR, DELTA_FORMAT, PLACEHOLDER, bytesAt, deltaChain, filesUnder, openSession, parse, readDelta, requestBytes, type PointerDelta } from "./helpers/session.js";

// --- the fixed literals ----------------------------------------------------------

const pad = (n: number): string => String(n).padStart(2, "0");
const WB_ID = "a4c1be00-0000-4000-8000-000000000000";
/** Record ids, by a number of their own. */
const rid = (n: number): string => `a4c1e0${pad(n)}-0000-4000-8000-0000000000${pad(n)}`;
/** Operation ids, by the exchange that first sends them. */
const op = (n: number): string => `a4c100${pad(n)}-0000-4000-8000-0000000000${pad(n)}`;
const PERSON = "Kai Stalmann <ks@qantr.com>";
const ACTOR = { actor: "user", person: PERSON };
/** The clock of the cut that produces the seeded intent. */
const CUT_AT = Date.parse("2026-10-01T11:00:00.000Z");

const SWEEP = "archive/261001-1200-sweep";
const OLDER = "archive/260925-0900-sweep";
const FAILED = "archive/261001-1300-failed";

const issuePaths = (stem: string, dir = "shared/issues"): { control: string; narrative: string } => ({ control: `${dir}/${stem}.record.json`, narrative: `${dir}/${stem}.md` });
const recordPaths = (dir: string, stem: string): { control: string; narrative: string } => ({ control: `${dir}/${stem}.record.json`, narrative: `${dir}/${stem}.md` });

/** A, B and C: the chain. A is live and names B, B names C, C is a legacy-terminal record with its backup under archive/migrations/. */
const A = issuePaths("260920-1000-chain-head-open");
const B = issuePaths("260919-1000-chain-middle");
const C = issuePaths("260918-1000-chain-tail-legacy");
/** T, the terminal issue pair archived; I, a terminal issue naming T. */
const T = issuePaths("260917-1000-terminal-issue");
const I = issuePaths("260921-1000-incoming-reference");
/** F, the unit of the first two failed moves. */
const F = issuePaths("260916-1000-failed-move-unit");
/** H, created in the session and archived after it closed. */
const H = issuePaths("261001-1000-created-then-archived");
/** One live record of every other kind, for request 37. */
const L = recordPaths("shared/plans", "260922-1000-open-plan");
const X = recordPaths("shared/decisions", "260922-1100-open-decision");
const Y = recordPaths("shared/discussions", "260922-1200-open-discussion");
const P_DIR = "work-packages/260922-0900-open-package";
const P = { control: `${P_DIR}/package.json`, narrative: `${P_DIR}/260922-0900-open-package.md` };
/** D, the done package archived whole: its evidence group (report R, evidence E) and a closed issue inside it. */
const D_DIR = "work-packages/260915-0900-done-package";
const D = { control: `${D_DIR}/package.json`, narrative: `${D_DIR}/260915-0900-done-package.md` };
const D_ISSUE = issuePaths("260915-1000-done-package-issue", `${D_DIR}/issues`);
const R = `${D_DIR}/reviews/260915-1500-review.md`;
const E = `${D_DIR}/reviews/260915-1500-review.evidence.json`;
/** D2, the done package of the third failed move, with its own evidence group. */
const D2_DIR = "work-packages/260914-0900-second-done-package";
const D2 = { control: `${D2_DIR}/package.json`, narrative: `${D2_DIR}/260914-0900-second-done-package.md` };
const R2 = `${D2_DIR}/reviews/260914-1500-review.md`;
const E2 = `${D2_DIR}/reviews/260914-1500-review.evidence.json`;
/** C's backup, a migration's hash-bound artefact under archive/. */
const BACKUP = `archive/migrations/migration-20260918-session/backup/${C.narrative}`;

const ID = { A: rid(1), B: rid(2), C: rid(3), T: rid(4), I: rid(5), F: rid(6), H: rid(7), L: rid(8), X: rid(9), Y: rid(10), P: rid(11), D: rid(12), D_ISSUE: rid(13), E: rid(14), D2: rid(15), E2: rid(16) } as const;

const md = (title: string, body: string): Buffer => Buffer.from(`# ${title}\n\n${body}\n`, "utf-8");
const ref = (id: string, display: string) => ({ workbench_id: WB_ID, record_id: id, display });
const created = { source: "created", legacy_fields: {} };

const NARRATIVES = new Map<string, Buffer>([
  [A.narrative, md("The head of the chain", "A live issue. It names B, so B stays, and C with it.")],
  [B.narrative, md("The middle of the chain", "Closed. It names C.")],
  [C.narrative, md("The tail of the chain", "Closed before JSON control; imported as legacy-terminal.")],
  [T.narrative, md("A terminal issue", "Closed, and archived in this session.")],
  [I.narrative, md("An incoming reference", "Closed. It names T, which is archived.")],
  [F.narrative, md("The unit of two failed moves", "Closed, and named by nothing.")],
  [L.narrative, md("An open plan", "Request 37's plan.")],
  [X.narrative, md("An open decision", "Request 37's decision.")],
  [Y.narrative, md("An open discussion", "Request 37's discussion.")],
  [P.narrative, md("An open package", "Request 37's package.")],
  [D.narrative, md("A done package", "Archived whole, its evidence group inside it.")],
  [D_ISSUE.narrative, md("An issue inside the done package", "Closed; it moves with its container.")],
  [D2.narrative, md("A second done package", "The unit of the third failed move.")],
]);
const REPORT = md("Review of the done package", "Accept.");
const REPORT2 = md("Review of the second done package", "Accept.");
const BACKUP_BYTES = md("The tail of the chain", "The Markdown as it stood before the migration.");

const hash = (path: string): string => revisionOf(NARRATIVES.get(path) as Buffer);

function issue(id: string, paths: { narrative: string }, closed: boolean, references: unknown[], provenance: unknown = created): unknown {
  return {
    schema: "fusion.record/v1",
    id,
    workbench_id: WB_ID,
    kind: "issue",
    narrative: { path: paths.narrative },
    filed_by: { actor: "reviewer", person: null },
    references,
    provenance,
    extensions: {},
    control: closed ? { state: "closed", disposition: { kind: "fixed", reason_ref: null } } : { state: "open", disposition: null },
  };
}

function record(kind: string, id: string, paths: { narrative: string }, control: unknown): unknown {
  return { schema: "fusion.record/v1", id, workbench_id: WB_ID, kind, narrative: { path: paths.narrative }, filed_by: ACTOR, references: [], provenance: created, extensions: {}, control };
}

function pkg(id: string, paths: { narrative: string }, rest: Record<string, unknown> = {}): unknown {
  return {
    schema: "fusion.package/v1",
    id,
    workbench_id: WB_ID,
    domain: "code",
    status: "open",
    claim: null,
    mode: { value: "ordinary", source: null },
    origin: { kind: "user-request", ref: null },
    filed_by: ACTOR,
    narrative: { path: paths.narrative },
    depends_on: [],
    active_documents: [],
    references: [],
    evidence: [],
    outcome: null,
    provenance: created,
    extensions: {},
    ...rest,
  };
}

function evidence(id: string, brief: string, report: string, reportBytes: Buffer): unknown {
  return {
    schema: "fusion.evidence/v1",
    id,
    workbench_id: WB_ID,
    subject: { git_tree: "a4c1a4c1a4c1a4c1a4c1a4c1a4c1a4c1a4c1a4c1", git_range: null },
    brief_revision: brief,
    plan_revision: null,
    role: { profile: "reviewer", version: "12.0.0" },
    host: "claude-code",
    execution_policy: "claude-guided",
    verdict: "accept",
    uncertainties: [],
    checks: [{ id: "tests-green", result: "pass", detail: null }],
    report: { path: report, sha256: revisionOf(reportBytes), kind: "review" },
    predecessor: null,
    accepted_at: "2026-09-15T15:20:00Z",
    extensions: {},
  };
}

/** A done package bound to `ev` at its revision, as `done` requires. */
function done(id: string, paths: { narrative: string }, evId: string, evBytes: Buffer): unknown {
  const binding = { ref: { workbench_id: WB_ID, record_id: evId, revision: revisionOf(evBytes) }, policy: "claude-guided" };
  return pkg(id, paths, {
    status: "done",
    claim: { checkout_id: "a4c1c0de", person: PERSON, claimed_at: "2026-09-15T09:00:00+02:00" },
    evidence: [binding],
    outcome: { class: "completed", reason: "The review accepts.", evidence: [binding] },
  });
}

const bytesOf = (value: unknown): Buffer => Buffer.from(serialise(value), "utf-8");
const E_BYTES = bytesOf(evidence(ID.E, hash(D.narrative), R, REPORT));
const E2_BYTES = bytesOf(evidence(ID.E2, hash(D2.narrative), R2, REPORT2));

/** `base/`, workbench-relative path to bytes. */
const BASE_FILES = new Map<string, Buffer>([
  ["workbench.json", bytesOf({ schema: "fusion.workbench/v1", id: WB_ID, required_features: ["json-control-v1"], migration: null, extensions: {} })],
  ...NARRATIVES,
  [A.control, bytesOf(issue(ID.A, A, false, [ref(ID.B, "260919-1000-chain-middle.md")]))],
  [B.control, bytesOf(issue(ID.B, B, true, [ref(ID.C, "260918-1000-chain-tail-legacy.md")]))],
  [C.control, bytesOf(issue(ID.C, C, true, [], { source: "legacy-terminal", legacy_fields: { marker: "_c_" }, backup: { path: BACKUP, sha256: revisionOf(BACKUP_BYTES), kind: "other" } }))],
  [BACKUP, BACKUP_BYTES],
  [T.control, bytesOf(issue(ID.T, T, true, []))],
  [I.control, bytesOf(issue(ID.I, I, true, [ref(ID.T, "260917-1000-terminal-issue.md")]))],
  [F.control, bytesOf(issue(ID.F, F, true, []))],
  [L.control, bytesOf(record("plan", ID.L, L, { state: "open", steps: [{ id: "s1", state: "open" }], criteria: [], acceptance: null }))],
  [X.control, bytesOf(record("decision", ID.X, X, { state: "open", answer_ref: null, implementation_ref: null, superseded_by: null, deferral: null }))],
  [Y.control, bytesOf(record("discussion", ID.Y, Y, { state: "open", participants: [ACTOR], outcome_refs: [] }))],
  [P.control, bytesOf(pkg(ID.P, P))],
  [D.control, bytesOf(done(ID.D, D, ID.E, E_BYTES))],
  [D_ISSUE.control, bytesOf(issue(ID.D_ISSUE, D_ISSUE, true, []))],
  [R, REPORT],
  [E, E_BYTES],
  [D2.control, bytesOf(done(ID.D2, D2, ID.E2, E2_BYTES))],
  [R2, REPORT2],
  [E2, E2_BYTES],
]);

const NAMES = [
  "01-inspect",
  "02-validate",
  "03-reconcile",
  "04-create",
  "05-transition",
  "06-transition",
  "07-transition",
  "08-transition",
  "09-transition",
  "10-transition",
  "11-maintenance",
  "12-maintenance",
  "13-inspect",
  "14-transition",
  "15-transition",
  "16-validate",
  "17-reconcile",
  "18-list",
  "19-list",
  "20-reconcile",
  "21-show",
  "22-validate",
  "23-show",
  "24-list",
  "25-create",
  "26-maintenance",
  "27-inspect",
  "28-transition",
  "29-create",
  "30-maintenance",
  "31-inspect",
  "32-validate",
  "33-reconcile",
  "34-transition",
  "35-maintenance",
  "36-validate",
  "37-maintenance",
  "38-inspect",
  "39-validate",
  "40-reconcile",
  "41-transition",
  "42-maintenance",
  "43-validate",
  "44-maintenance",
  "45-inspect",
  "46-validate",
  "47-reconcile",
  "48-transition",
  "49-maintenance",
  "50-validate",
  "51-inspect",
] as const;
type Name = (typeof NAMES)[number];

/** The exchanges whose recorded response is historical, each with the reviewed delta files that state its current answer, in order. */
const MIGRATION_DELTAS: readonly Name[] = ["01-inspect", "13-inspect", "27-inspect", "31-inspect", "38-inspect", "45-inspect"];
const DELTAS: ReadonlyMap<Name, readonly string[]> = new Map(MIGRATION_DELTAS.map((n): [Name, readonly string[]] => [n, [`${n}.migration-delta.json`]]));
/** FJ04 step 5's change to every successful `inspect` answer of this session: exactly these, in this order. */
const MIGRATION_CHANGES = [
  { op: "add", pointer: "/result/schemas/3", value: "urn:fusion:schema:fusion.migration-plan/v1" },
  { op: "add", pointer: "/result/schemas/4", value: "urn:fusion:schema:fusion.migration-proposal/v1" },
  { op: "add", pointer: "/result/schemas/5", value: "urn:fusion:schema:fusion.migration-receipt/v1" },
  { op: "add", pointer: "/result/operations/implemented/15", value: "migration" },
  { op: "replace", pointer: "/result/operations/deferred", value: [] },
];

// --- the host's actions --------------------------------------------------------------

/**
 * What the host does to the workbench immediately before an exchange, in
 * order, every path workbench-relative. `mv` and `cp` make the destination's
 * directory first; `ln` makes a relative symbolic link; `rm` removes a file or
 * a directory with its content; `write` writes a file.
 */
type HostAction = { mv: [string, string] } | { cp: [string, string] } | { ln: [string, string] } | { rm: string } | { write: [string, string] };

const into = (sweep: string, path: string): string => `${sweep}/${path}`;
const moveUnit = (sweep: string, ...paths: string[]): HostAction[] => paths.map((p): HostAction => ({ mv: [p, into(sweep, p)] }));
const restoreUnit = (sweep: string, ...paths: string[]): HostAction[] => paths.map((p): HostAction => ({ mv: [into(sweep, p), p] }));
const JOURNAL_FILE = "The journal is a file here, not a directory.\n";

const HOST: ReadonlyMap<Name, readonly HostAction[]> = new Map<Name, readonly HostAction[]>([
  [
    "16-validate",
    [
      ...moveUnit(SWEEP, T.control, T.narrative, H.control, H.narrative, D_DIR),
      { cp: [B.control, into(OLDER, B.control)] },
      { ln: [`../${SWEEP}/shared/issues`, "shared/old"] },
    ],
  ],
  ["31-inspect", moveUnit(FAILED, F.control)],
  ["35-maintenance", restoreUnit(FAILED, F.control)],
  ["38-inspect", moveUnit(FAILED, F.narrative)],
  ["42-maintenance", restoreUnit(FAILED, F.narrative)],
  ["45-inspect", moveUnit(FAILED, D2.control, D2.narrative)],
  ["49-maintenance", restoreUnit(FAILED, D2.control, D2.narrative)],
  ["51-inspect", [{ rm: ".json-state/journal" }, { write: [".json-state/journal", JOURNAL_FILE] }]],
]);

// --- the exchange machinery (helpers/session.ts) ----------------------------------------

const BASE = join(CODEC_DIR, "fixtures", "protocol-session-archive", "base");
const session = openSession<Name>({ directory: "protocol-session-archive", updateVariable: "UPDATE_PROTOCOL_SESSION_ARCHIVE", tmpPrefix: "codec-round-trip-archive-", base: BASE });
const { exchanges, expectedSeeds, byName, result, seedBefore } = session;
const SESSION = session.dir;
const SEED = session.seedDir;
const UPDATE = session.update;
const FIX = "UPDATE_PROTOCOL_SESSION_ARCHIVE=1";

if (UPDATE) {
  rmSync(BASE, { recursive: true, force: true });
  for (const [path, bytes] of BASE_FILES) {
    mkdirSync(dirname(join(BASE, path)), { recursive: true });
    writeFileSync(join(BASE, path), bytes);
  }
}

let tmp: string;
let root: string;
const at = (path: string): string => join(root, path);

function host(actions: readonly HostAction[]): void {
  for (const a of actions) {
    if ("mv" in a) {
      mkdirSync(dirname(at(a.mv[1])), { recursive: true });
      renameSync(at(a.mv[0]), at(a.mv[1]));
    } else if ("cp" in a) {
      mkdirSync(dirname(at(a.cp[1])), { recursive: true });
      cpSync(at(a.cp[0]), at(a.cp[1]));
    } else if ("ln" in a) symlinkSync(a.ln[0], at(a.ln[1]));
    else if ("rm" in a) rmSync(at(a.rm), { recursive: true, force: true });
    else writeFileSync(at(a.write[0]), a.write[1]);
  }
}

// --- the third substitution: the fence's since -------------------------------------------

/** Each landed `begin`'s `since`, and the placeholder that records it. */
const sinces: Array<{ value: string; placeholder: string }> = [];
const sincePlaceholder = (name: Name): string => `<since:${name}>`;
/** `text` as it is recorded: the workbench, then every fence's since. */
const recorded = (text: string): string => sinces.reduce((t, s) => t.split(s.value).join(s.placeholder), session.record(text));
/** `text` as it is replayed. */
const replayed = (text: string): string => session.replay(sinces.reduce((t, s) => t.split(s.placeholder).join(s.value), text));

let started: number;
let finished: number;

function exchange(name: Name, request: object): void {
  host(HOST.get(name) ?? []);
  const e = session.exchange(name, request);
  const r = parse(e.stdout);
  if ((request as { op?: string; action?: string }).op === "maintenance" && (request as { action?: string }).action === "begin" && r.ok) {
    sinces.push({ value: (r.result as { since: string }).since, placeholder: sincePlaceholder(name) });
  }
}

// --- the seeded intent ------------------------------------------------------------------

const DIGEST_PLACEHOLDER = "<request-digest:14-transition>";
/** The request the seeded intent was cut from, and which exchange 14 sends: L open -> in_progress, in sorted key order. */
const lMove = (workbench: string) => ({
  actor: ACTOR,
  expected_revision: revisionOf(BASE_FILES.get(L.control) as Buffer),
  op: "transition",
  operation_id: op(14),
  payload: {},
  reason: "Started before the archive move; the host restores the file and the intent lands.",
  record: { path: L.control },
  to: "in_progress",
  workbench,
});
/** L as a hand left it: at neither the intent's pre- nor its post-bytes. */
const L_DIVERGED = Buffer.concat([BASE_FILES.get(L.control) as Buffer, Buffer.from("\n", "utf-8")]);

/** The committed intent of `lMove`, cut after its commit point over a scratch copy of the workbench as it stands: the journal alone, its digest the placeholder. */
async function intentSeed(): Promise<Map<string, Buffer>> {
  const scratch = join(tmp, "cut");
  cpSync(root, scratch, { recursive: true });
  const sent = lMove(scratch);
  let cut: unknown;
  try {
    await dispatch(sent, { kernel: { now: () => CUT_AT, faults: { cutAt: "after-intent" } } });
  } catch (e) {
    cut = e;
  }
  if (!(cut instanceof CutReached)) throw new Error(`the cut of 14-transition was not reached: ${String(cut)}`);
  const journal = ".json-state/journal";
  const files = new Map<string, Buffer>();
  for (const path of filesUnder(join(scratch, journal))) {
    let bytes = bytesAt(scratch, `${journal}/${path}`);
    if (path.endsWith("/intent.json")) {
      const quoted = JSON.stringify(requestDigest(sent));
      const text = bytes.toString("utf-8");
      if (text.split(quoted).length !== 2) throw new Error("the intent does not carry its request's digest exactly once");
      if (text.includes(scratch)) throw new Error("the intent names the scratch path");
      bytes = Buffer.from(text.replace(quoted, JSON.stringify(DIGEST_PLACEHOLDER)), "utf-8");
    }
    files.set(`${journal}/${path}`, bytes);
  }
  rmSync(scratch, { recursive: true, force: true });
  return files;
}

/** What a replayer does after copying the seed: the placeholder becomes the digest of exchange 14's request on this root. */
function resolveDigest(): void {
  for (const path of filesUnder(at(".json-state/journal")).filter((p) => p.endsWith("/intent.json"))) {
    const file = at(`.json-state/journal/${path}`);
    const text = readFileSync(file, "utf-8");
    if (text.includes(DIGEST_PLACEHOLDER)) writeFileSync(file, text.replace(DIGEST_PLACEHOLDER, requestDigest(lMove(root))));
  }
}

/** Every seed directory: the blocked intent with L diverged, then L restored. */
const SEEDED: readonly Name[] = ["11-maintenance", "12-maintenance"];

/** The seeded intent as committed. */
const seededIntent = (): Intent => JSON.parse((expectedSeeds.get("11-maintenance") as Map<string, Buffer>).get(`.json-state/journal/${op(14)}/intent.json`)?.toString("utf-8") ?? "null") as Intent;

// --- what the store holds --------------------------------------------------------------

const isControl = (path: string): boolean => !path.startsWith("archive/") && (path.endsWith(".record.json") || path.endsWith("/package.json") || path.endsWith(".evidence.json"));
/** The control files of base/, in the walk's sorted order. */
const CONTROLS = [...BASE_FILES.keys()].filter(isControl).sort();
/** The control files after the sweep: base/'s and H's, less T, H and everything under D. */
const currentAfterSweep = (): string[] => [...CONTROLS, H.control].filter((p) => p !== T.control && p !== H.control && !p.startsWith(`${D_DIR}/`)).sort();
/** The since a landed begin answered, as recorded. */
const since = (name: Name): string => {
  const s = sinces.find((x) => x.placeholder === sincePlaceholder(name));
  if (s === undefined) throw new Error(`no fence was set by ${name}`);
  return s.value;
};

// --- the session -----------------------------------------------------------------------

/** What the recorder observed between exchanges, by the exchange it follows. */
const observed = new Map<string, unknown>();
const listing = (dir: string): string[] => (existsSync(at(dir)) ? readdirSync(at(dir)).sort() : []);

beforeAll(async () => {
  ({ tmp, root } = session.start());
  started = Date.now();
  const W = (): string => root;
  const inspect = () => ({ op: "inspect", workbench: W() });
  const validate = (path?: string) => ({ op: "validate", workbench: W(), ...(path !== undefined ? { record: { path } } : {}) });
  const reconcile = (scope?: string) => ({ op: "reconcile", workbench: W(), ...(scope !== undefined ? { scope } : {}) });
  const list = (scope?: string) => ({ op: "list", workbench: W(), ...(scope !== undefined ? { scope } : {}) });
  const show = (path: string) => ({ op: "show", workbench: W(), record: { path } });
  const begin = (n: number) => ({ op: "maintenance", workbench: W(), operation_id: op(n), action: "begin" });
  const end = (n: number, fence: number) => ({ op: "maintenance", workbench: W(), operation_id: op(n), action: "end", fence: op(fence) });
  const transition = (n: number, path: string, revision: string, to: string, payload: Record<string, unknown>, reason: string) => ({
    op: "transition",
    workbench: W(),
    operation_id: op(n),
    record: { path },
    expected_revision: revision,
    actor: ACTOR,
    to,
    reason,
    payload,
  });
  const base = (path: string): string => revisionOf(BASE_FILES.get(path) as Buffer);
  /** A fresh mutation the fence refuses: A open -> in_progress. */
  const fresh = (n: number) => transition(n, A.control, base(A.control), "in_progress", {}, "Work on the head of the chain.");

  exchange("01-inspect", inspect());
  exchange("02-validate", validate());
  exchange("03-reconcile", reconcile());
  const createH = {
    op: "create",
    workbench: W(),
    operation_id: op(4),
    id: ID.H,
    kind: "issue",
    filed_by: ACTOR,
    origin: { kind: "user-request", ref: null },
    scope: { container: null, store: "issues" },
    narrative: { path: H.narrative, content: "# Created, closed and archived\n\nThe session's pre-archive create.\n" },
    payload: { state: "open", disposition: null },
  };
  exchange("04-create", createH);
  exchange("05-transition", transition(5, H.control, (result(byName("04-create")) as { revision: string }).revision, "closed", { disposition: { kind: "fixed", reason_ref: null } }, "Fixed before the sweep."));

  // Request 37: a field foreign to the record's kind, one per kind.
  exchange("06-transition", transition(6, P.control, base(P.control), "paused", { disposition: { kind: "fixed", reason_ref: null } }, "A package carries no disposition."));
  exchange("07-transition", transition(7, A.control, base(A.control), "in_progress", { claim: null }, "An issue carries no claim, not even a null one."));
  exchange("08-transition", transition(8, L.control, base(L.control), "in_progress", { answer_ref: "260922-1100-open-decision.md" }, "A plan carries no answer."));
  exchange("09-transition", transition(9, X.control, base(X.control), "answered", { steps: [{ id: "s1", state: "done" }] }, "A decision carries no steps."));
  exchange("10-transition", transition(10, Y.control, base(Y.control), "closed", { outcome: null }, "A discussion's transition admits no field."));
  observed.set("after-10", {
    bytes: Object.fromEntries([P.control, A.control, L.control, X.control, Y.control].map((p) => [p, readFileSync(at(p)).toString("base64")])),
    journal: listing(".json-state/journal"),
    ops: listing(".json-state/ops"),
  });

  // Pending recovery: a committed intent on L, L diverged by hand; then L restored.
  const intent = await intentSeed();
  seedBefore("11-maintenance", new Map([...intent, [L.control, L_DIVERGED]]));
  resolveDigest();
  exchange("11-maintenance", begin(11));
  observed.set("after-11", { journal: listing(".json-state/journal"), fence: existsSync(at(".json-state/maintenance.json")) });
  seedBefore("12-maintenance", new Map([[L.control, BASE_FILES.get(L.control) as Buffer]]));
  exchange("12-maintenance", begin(11));
  observed.set("after-12", { journal: listing(".json-state/journal"), l: revisionOf(readFileSync(at(L.control))) });
  exchange("13-inspect", inspect());
  exchange("14-transition", lMove(W()));
  exchange("15-transition", fresh(15));

  // The host's sweep, under the fence of 12.
  exchange("16-validate", validate());
  observed.set("after-16", { olderCopy: existsSync(at(into(OLDER, B.control))), link: lstatSync(at("shared/old")).isSymbolicLink() ? readlinkSync(at("shared/old")) : null });
  exchange("17-reconcile", reconcile());
  exchange("18-list", list());
  exchange("19-list", list("archive"));
  exchange("20-reconcile", reconcile(`${SWEEP}/work-packages`));
  exchange("21-show", show(into(SWEEP, T.control)));
  exchange("22-validate", validate(into(SWEEP, D.control)));
  exchange("23-show", show(`shared/old/${T.control.slice("shared/issues/".length)}`));
  exchange("24-list", list("shared/old"));
  exchange("25-create", createH);
  observed.set("after-25", {
    control: existsSync(at(H.control)),
    narrative: existsSync(at(H.narrative)),
    archivedControl: existsSync(at(into(SWEEP, H.control))),
    archivedNarrative: existsSync(at(into(SWEEP, H.narrative))),
  });
  exchange("26-maintenance", end(26, 11));
  exchange("27-inspect", inspect());
  exchange("28-transition", transition(28, into(SWEEP, T.control), base(T.control), "closed", {}, "An archived record takes no transition."));
  exchange("29-create", {
    op: "create",
    workbench: W(),
    operation_id: op(29),
    id: rid(29),
    kind: "issue",
    filed_by: ACTOR,
    origin: { kind: "user-request", ref: null },
    scope: { container: into(SWEEP, D_DIR), store: "issues" },
    narrative: { path: into(SWEEP, `${D_DIR}/issues/261001-1400-into-the-archive.md`), content: "# Refused\n" },
    payload: { state: "open", disposition: null },
  });

  // Three failed moves, each under a fence of its own.
  for (const [b, e] of [
    [30, 35],
    [37, 42],
    [44, 49],
  ] as const) {
    exchange(NAMES[b - 1] as Name, begin(b));
    exchange(NAMES[b] as Name, inspect());
    exchange(NAMES[b + 1] as Name, validate());
    exchange(NAMES[b + 2] as Name, reconcile());
    exchange(NAMES[b + 3] as Name, fresh(b + 3));
    exchange(NAMES[e - 1] as Name, end(e, b));
    exchange(NAMES[e] as Name, validate());
  }

  exchange("51-inspect", inspect());
  finished = Date.now();
}, 300_000);

afterAll(() => {
  session.stop();
});

// --- what each exchange answered ---------------------------------------------------------

const answer = (name: Name) => parse(byName(name).stdout);
const refusalOf = (name: Name): { class: string; reason: string; detail: string } => {
  const response = answer(name);
  expect(response.ok, `${name}: ${byName(name).stdout}`).toBe(false);
  if (response.ok) throw new Error("unreachable");
  return response.error as { class: string; reason: string; detail: string };
};

describe("the fifty-one archive exchanges through bin/fusion-record", () => {
  it("every exchange was answered: exit 0, one line on stdout, nothing on stderr", () => {
    expect(exchanges.map((e) => e.name)).toEqual([...NAMES]);
    for (const e of exchanges) {
      expect(e.status, `${e.name}: ${e.stderr}`).toBe(0);
      expect(e.stderr, e.name).toBe("");
      expect(e.stdout.endsWith("\n"), e.name).toBe(true);
      expect(e.stdout.trim().split("\n"), e.name).toHaveLength(1);
    }
  });

  it("01 to 03: the store before any move: json-control, no pending initialize, no fence; valid; reconcile names every binding the hold is computed from", () => {
    expect(result(byName("01-inspect"))).toMatchObject({ workbench: root, state: "json-control", id: WB_ID, pending: null, maintenance: null });
    expect(result(byName("02-validate"))).toEqual({ workbench: root, state: "json-control", checked: CONTROLS.length, valid: true, findings: [] });
    const rec = result(byName("03-reconcile"));
    expect(rec).toMatchObject({ checked: CONTROLS.length, intents: [], records: [], dependencies: [], narratives: [] });
    expect(rec.references).toEqual([
      { path: C.control, at: "/provenance/backup", status: "resolved", target: BACKUP },
      { path: B.control, at: "/references/0", status: "resolved", target: C.control },
      { path: A.control, at: "/references/0", status: "resolved", target: B.control },
      { path: I.control, at: "/references/0", status: "resolved", target: T.control },
      { path: D2.control, at: "/evidence/0/ref", status: "resolved", target: E2 },
      { path: D2.control, at: "/outcome/evidence/0/ref", status: "resolved", target: E2 },
      { path: E2, at: "/report", status: "resolved", target: R2 },
      { path: D.control, at: "/evidence/0/ref", status: "resolved", target: E },
      { path: D.control, at: "/outcome/evidence/0/ref", status: "resolved", target: E },
      { path: E, at: "/report", status: "resolved", target: R },
    ]);
    expect((rec.evidence as Array<{ path: string; status: string }>).map((e) => [e.path, e.status])).toEqual([
      [D2.control, "fresh"],
      [D2.control, "fresh"],
      [D.control, "fresh"],
      [D.control, "fresh"],
    ]);
  });

  it("04 and 05: H lands as a pair and closes", () => {
    expect(result(byName("04-create"))).toMatchObject({ operation_id: op(4), path: H.control, kind: "issue", narrative: { path: H.narrative } });
    expect(result(byName("05-transition"))).toMatchObject({ path: H.control, from: "open", to: "closed" });
  });

  for (const [name, path, kind, field] of [
    ["06-transition", P.control, "package", "disposition"],
    ["07-transition", A.control, "issue", "claim"],
    ["08-transition", L.control, "plan", "answer_ref"],
    ["09-transition", X.control, "decision", "steps"],
    ["10-transition", Y.control, "discussion", "outcome"],
  ] as const) {
    it(`${name}: request 37, a ${kind} carrying ${field} is schema-invalid/payload-field-not-admitted`, () => {
      const e = refusalOf(name);
      expect({ class: e.class, reason: e.reason }).toEqual({ class: "schema-invalid", reason: "payload-field-not-admitted" });
      expect(e.detail).toContain(`${path} is a record of kind ${kind}`);
      expect(e.detail).toContain(`it carries ${field}`);
    });
  }

  it("06 to 10 wrote nothing: the five records at their base bytes, no intent, no stored answer", () => {
    const after = observed.get("after-10") as { bytes: Record<string, string>; journal: string[]; ops: string[] };
    for (const path of [P.control, A.control, L.control, X.control, Y.control]) expect(after.bytes[path], path).toBe((BASE_FILES.get(path) as Buffer).toString("base64"));
    expect(after.journal).toEqual([]);
    for (const n of [6, 7, 8, 9, 10]) expect(after.ops, op(n)).not.toContain(`${op(n)}.json`);
  });

  it("11: begin over the seeded intent recovery cannot land is operation-unknown/recovery-blocked; the intent stands and no fence is set", () => {
    const e = refusalOf("11-maintenance");
    expect({ class: e.class, reason: e.reason }).toEqual({ class: "operation-unknown", reason: "recovery-blocked" });
    expect(e.detail).toContain(`operation ${op(14)} is pending`);
    expect(e.detail).toContain(`${L.control} is at neither the pre- nor the post-bytes`);
    expect(observed.get("after-11")).toEqual({ journal: [op(14)], fence: false });
  });

  it("12 to 14: the same begin after the restore rolls the intent forward and sets the fence; the intent's own request then answers its stored bytes under the fence", () => {
    expect(answer("12-maintenance")).toEqual({ ok: true, result: { operation_id: op(11), action: "begin", since: since("12-maintenance") } });
    const after = observed.get("after-12") as { journal: string[]; l: string };
    expect(after.journal, "the intent landed").toEqual([]);
    const intent = seededIntent();
    expect(after.l).toBe(intent.writes[0]?.after);
    expect(result(byName("13-inspect"))).toMatchObject({ pending: null, maintenance: { operation_id: op(11), since: since("12-maintenance") } });
    expect(byName("14-transition").stdout).toBe(JSON.stringify(intent.response) + "\n");
    expect(result(byName("14-transition"))).toMatchObject({ operation_id: op(14), path: L.control, from: "open", to: "in_progress" });
  });

  for (const [name, fence] of [
    ["15-transition", "12-maintenance"],
    ["34-transition", "30-maintenance"],
    ["41-transition", "37-maintenance"],
    ["48-transition", "44-maintenance"],
  ] as const) {
    it(`${name}: a fresh mutation under the fence of ${fence} is conflict/maintenance-active, the detail naming the fence`, () => {
      const e = refusalOf(name);
      expect({ class: e.class, reason: e.reason }).toEqual({ class: "conflict", reason: "maintenance-active" });
      const begun = result(byName(fence)) as { operation_id: string; since: string };
      expect(e.detail).toContain(`set by operation ${begun.operation_id} since ${begun.since}`);
    });
  }

  it("16 to 18: after the sweep the archived records are gone from validate, reconcile and list; I -> T is record-not-found; B's archived copy is no second carrier; C's backup under archive/ still resolves", () => {
    const current = currentAfterSweep();
    expect(result(byName("16-validate"))).toEqual({ workbench: root, state: "json-control", checked: current.length, valid: true, findings: [] });
    const rec = result(byName("17-reconcile"));
    expect(rec).toMatchObject({ checked: current.length, intents: [], records: [], dependencies: [], narratives: [] });
    expect(rec.references).toEqual([
      { path: C.control, at: "/provenance/backup", status: "resolved", target: BACKUP },
      { path: B.control, at: "/references/0", status: "resolved", target: C.control },
      { path: A.control, at: "/references/0", status: "resolved", target: B.control },
      { path: I.control, at: "/references/0", status: "unresolved", class: "unresolved-reference", reason: "record-not-found" },
      { path: D2.control, at: "/evidence/0/ref", status: "resolved", target: E2 },
      { path: D2.control, at: "/outcome/evidence/0/ref", status: "resolved", target: E2 },
      { path: E2, at: "/report", status: "resolved", target: R2 },
    ]);
    expect((result(byName("18-list")).records as Array<{ path: string }>).map((r) => r.path)).toEqual(current);
    expect((observed.get("after-16") as { olderCopy: boolean; link: string }).olderCopy).toBe(true);
  });

  for (const [name, reason] of [
    ["19-list", "archived-path"],
    ["20-reconcile", "archived-path"],
    ["24-list", "archived-path"],
    ["29-create", "archived-path"],
  ] as const) {
    it(`${name}: unknown-scope/${reason}`, () => {
      expect(refusalOf(name)).toMatchObject({ class: "unknown-scope", reason });
    });
  }

  for (const name of ["21-show", "23-show", "28-transition"] as const) {
    it(`${name}: unresolved-reference/record-not-found`, () => {
      expect(refusalOf(name)).toMatchObject({ class: "unresolved-reference", reason: "record-not-found" });
    });
  }

  it("22: validate of an archived control file is one record-not-found finding", () => {
    expect(result(byName("22-validate"))).toMatchObject({ checked: 1, valid: false, findings: [{ path: into(SWEEP, D.control), class: "unresolved-reference", reason: "record-not-found" }] });
  });

  it("23 and 24 go through shared/old, a link into the sweep", () => {
    expect((observed.get("after-16") as { link: string }).link).toBe(`../${SWEEP}/shared/issues`);
    expect(byName("23-show").request).toMatchObject({ record: { path: `shared/old/${T.control.slice("shared/issues/".length)}` } });
  });

  it("25: 04 replayed after its pair was archived answers 04's bytes and recreates neither file", () => {
    expect(byName("25-create").request).toEqual(byName("04-create").request);
    expect(byName("25-create").stdout).toBe(byName("04-create").stdout);
    expect(observed.get("after-25")).toEqual({ control: false, narrative: false, archivedControl: true, archivedNarrative: true });
  });

  it("26 and 27: end naming 12's fence answers 12's since and removes it", () => {
    expect(answer("26-maintenance")).toEqual({ ok: true, result: { operation_id: op(26), action: "end", since: since("12-maintenance") } });
    expect(result(byName("27-inspect"))).toMatchObject({ pending: null, maintenance: null });
  });

  for (const [b, label] of [
    [30, "failed move 1, F's control file moved without its narrative"],
    [37, "failed move 2, F's narrative moved without its control file"],
    [44, "failed move 3, D2's package.json and narrative moved, its evidence group left behind"],
  ] as const) {
    const n = (k: number): Name => NAMES[b - 1 + k] as Name;
    it(`${n(0)} to ${n(6)}: ${label}: the fence stands, a fresh mutation is refused, and after the restore end reopens a store validate passes`, () => {
      expect(answer(n(0))).toEqual({ ok: true, result: { operation_id: op(b), action: "begin", since: since(n(0)) } });
      expect(result(byName(n(1)))).toMatchObject({ maintenance: { operation_id: op(b), since: since(n(0)) } });
      expect(answer(n(5))).toEqual({ ok: true, result: { operation_id: op(b + 5), action: "end", since: since(n(0)) } });
      expect(result(byName(n(6)))).toEqual({ workbench: root, state: "json-control", checked: currentAfterSweep().length, valid: true, findings: [] });
    });
  }

  it("32 and 33: a control file moved away without its narrative is not seen by validate or reconcile: F is one record fewer and nothing names it", () => {
    const count = currentAfterSweep().length - 1;
    expect(result(byName("32-validate"))).toEqual({ workbench: root, state: "json-control", checked: count, valid: true, findings: [] });
    const rec = result(byName("33-reconcile"));
    expect(rec).toMatchObject({ checked: count, records: [] });
    expect(JSON.stringify(rec)).not.toContain(F.control.replace(".record.json", ""));
    expect(rec.references).toEqual(result(byName("17-reconcile")).references);
  });

  it("39 and 40: a narrative moved away without its control file is narrative-missing in validate and in reconcile's records", () => {
    const finding = { path: F.control, class: "unresolved-reference", reason: "narrative-missing", detail: `${F.narrative} does not exist` };
    expect(result(byName("39-validate"))).toEqual({ workbench: root, state: "json-control", checked: currentAfterSweep().length, valid: false, findings: [finding] });
    expect(result(byName("40-reconcile"))).toMatchObject({ checked: currentAfterSweep().length, records: [finding] });
  });

  it("46 and 47: a container moved without its evidence group is not seen as a break: the evidence record left behind is valid and its report resolves; D2's bindings are simply gone", () => {
    const count = currentAfterSweep().length - 1;
    expect(result(byName("46-validate"))).toEqual({ workbench: root, state: "json-control", checked: count, valid: true, findings: [] });
    const rec = result(byName("47-reconcile"));
    expect(rec).toMatchObject({ checked: count, records: [], evidence: [] });
    const refs = rec.references as Array<{ path: string }>;
    expect(refs.filter((r) => r.path.startsWith(D2_DIR))).toEqual([{ path: E2, at: "/report", status: "resolved", target: R2 }]);
  });

  it("51: a journal that is a file is operation-unknown/pending-initialize-unreadable, exit 0", () => {
    const e = refusalOf("51-inspect");
    expect({ class: e.class, reason: e.reason }).toEqual({ class: "operation-unknown", reason: "pending-initialize-unreadable" });
    expect(e.detail.startsWith(".json-state/journal: the journal cannot be listed (ENOTDIR)"), e.detail).toBe(true);
  });

  it("every landed begin answered a since of this run's clock, each distinct; no recorded response carries one", () => {
    const begins = NAMES.filter((n) => n.endsWith("-maintenance") && (byName(n).request as { action?: string }).action === "begin" && answer(n).ok);
    expect(begins).toEqual(["12-maintenance", "30-maintenance", "37-maintenance", "44-maintenance"]);
    expect(sinces.map((s) => s.placeholder)).toEqual(begins.map(sincePlaceholder));
    expect(new Set(sinces.map((s) => s.value)).size).toBe(sinces.length);
    for (const { value } of sinces) {
      expect(new Date(value).toISOString(), value).toBe(value);
      expect(Date.parse(value)).toBeGreaterThanOrEqual(started);
      expect(Date.parse(value)).toBeLessThanOrEqual(finished);
    }
    for (const e of exchanges) for (const { value } of sinces) expect(recorded(e.stdout), e.name).not.toContain(value);
  });
});

// --- the recorded session ------------------------------------------------------------------

describe(`the recorded session under fixtures/protocol-session-archive/ (${UPDATE ? "REGENERATING" : "golden"})`, () => {
  it("no recorded byte carries the temp path, and the placeholders round-trip", () => {
    for (const e of exchanges) {
      const req = recorded(requestBytes(e.request));
      const res = recorded(e.stdout);
      for (const text of [req, res]) {
        expect(text, e.name).not.toContain(root);
        expect(text, e.name).not.toContain(tmp);
      }
      expect(replayed(req), e.name).toBe(requestBytes(e.request));
      expect(replayed(res), e.name).toBe(e.stdout);
      expect(req, e.name).toContain(PLACEHOLDER);
    }
  });

  it("14's request is sent in sorted key order: its line is its canonical rendering, so a replayer's digest is sha256 over it", () => {
    const request = byName("14-transition").request;
    expect(requestBytes(request)).toBe(canonical(request) + "\n");
    expect(requestDigest(request)).toBe(revisionOf(Buffer.from(canonical(request), "utf-8")));
  });

  for (const name of NAMES.filter((n) => !DELTAS.has(n))) {
    it(`${name}: the recorded request and response equal the fresh exchange`, () => {
      const e = byName(name);
      const requestFile = join(SESSION, `${name}.request.json`);
      const responseFile = join(SESSION, `${name}.response.json`);
      const freshRequest = recorded(requestBytes(e.request));
      const freshResponse = recorded(e.stdout);
      if (UPDATE) {
        writeFileSync(requestFile, freshRequest);
        writeFileSync(responseFile, freshResponse);
      }
      const missing = [requestFile, responseFile].filter((f) => !existsSync(f));
      expect(missing, `recorded session incomplete: ${missing.join(", ")}.\nFIX: run \`${FIX} npm test -- round-trip-cli-archive\` in codec/ and commit fixtures/protocol-session-archive/.`).toEqual([]);
      expect(readFileSync(requestFile, "utf-8"), `${name}.request.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with ${FIX} and commit the files; the Prior side replays them.`).toBe(freshRequest);
      expect(readFileSync(responseFile, "utf-8"), `${name}.response.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with ${FIX} and commit the files; the Prior side replays them.`).toBe(freshResponse);
    });
  }

  // A historical response is never rewritten, so its files are not written under the update variable.
  for (const [name, chain] of DELTAS) {
    describe(`${name}: the recorded response with exactly the reviewed deltas, ${chain.join(" then ")}`, () => {
      const expected = (): string => deltaChain(SESSION, name, chain);
      const fresh = (): string => recorded(byName(name).stdout);
      type Doc = { ok: boolean; error?: Record<string, unknown>; result?: Record<string, unknown> };
      const changed = (change: (doc: Doc) => void): string => {
        const doc = JSON.parse(fresh()) as Doc;
        change(doc);
        return JSON.stringify(doc) + "\n";
      };

      it("the recorded request equals the fresh one", () => {
        expect(readFileSync(join(SESSION, `${name}.request.json`), "utf-8")).toBe(recorded(requestBytes(byName(name).request)));
      });

      it("the fresh answer is the recorded bytes with the deltas applied, byte for byte, and not the recorded bytes alone", () => {
        expect(fresh(), `the answer differs from ${name}.response.json with ${chain.join(" and ")} applied. The recorded response is historical and is not regenerated; a change to the answer is a reviewed change to a delta file, and the Prior side compares it at the re-pin.`).toBe(expected());
        expect(readFileSync(join(SESSION, `${name}.response.json`), "utf-8"), "the recording itself").not.toBe(fresh());
      });

      it("the gate is red against an answer carrying one field less or one field more", () => {
        const part = (doc: Doc): Record<string, unknown> => (doc.ok ? doc.result : doc.error) as Record<string, unknown>;
        expect(changed(() => undefined), "unchanged").toBe(expected());
        expect(changed((doc) => delete part(doc)[Object.keys(part(doc)).at(-1) as string]), "one field less").not.toBe(expected());
        expect(changed((doc) => (part(doc).extra = null)), "one field more").not.toBe(expected());
      });
    });
  }

  it("the migration deltas are every successful inspect of the session, and each changes exactly the schemas, implemented and deferred", () => {
    const inspects = NAMES.filter((n) => n.endsWith("-inspect"));
    const answered = inspects.filter((n) => (JSON.parse(readFileSync(join(SESSION, `${n}.response.json`), "utf-8")) as { ok: boolean }).ok);
    expect([...MIGRATION_DELTAS], "the six successful recorded inspect answers").toEqual(answered);
    for (const name of MIGRATION_DELTAS) {
      const d = readDelta(SESSION, `${name}.migration-delta.json`) as PointerDelta;
      expect(d, name).toMatchObject({ format: DELTA_FORMAT, exchange: name, recorded: `${name}.response.json`, follows: [] });
      expect(d.changes, name).toEqual(MIGRATION_CHANGES);
    }
  });

  it("base/ holds exactly the workbench the constants state", () => {
    expect(filesUnder(BASE), `base/ is not the stated file set. If it changed on purpose, regenerate with ${FIX}.`).toEqual([...BASE_FILES.keys()].sort());
    for (const [path, bytes] of BASE_FILES) expect(bytesAt(BASE, path).equals(bytes), `base/${path}`).toBe(true);
  });

  for (const name of SEEDED) {
    it(`seed/${name}/ holds exactly the computed bytes`, () => {
      const expected = expectedSeeds.get(name) as Map<string, Buffer>;
      expect(expected, `no seed was computed for ${name}`).toBeDefined();
      const dir = join(SEED, name);
      expect(filesUnder(dir), `seed/${name}/ is not the computed file set. If a producer changed on purpose, regenerate with ${FIX}.`).toEqual([...expected.keys()].sort());
      for (const [path, bytes] of expected) expect(bytesAt(dir, path).equals(bytes), `seed/${name}/${path} differs from what produces it. If a producer changed on purpose, regenerate with ${FIX}.`).toBe(true);
    });
  }

  it("seed/11-maintenance/: the intent of 14's request as the cut wrote it, its digest the placeholder, and L at neither of its bytes", () => {
    const intent = JSON.parse(readFileSync(join(SEED, "11-maintenance", ".json-state", "journal", op(14), "intent.json"), "utf-8")) as Intent;
    expect(Object.keys(intent)).toEqual(["operation_id", "op", "request_digest", "writes", "response", "created_at"]);
    expect(intent).toMatchObject({ operation_id: op(14), op: "transition", request_digest: DIGEST_PLACEHOLDER, created_at: new Date(CUT_AT).toISOString() });
    expect(intent.writes).toHaveLength(1);
    expect(intent.writes[0]).toMatchObject({ path: L.control, before: revisionOf(BASE_FILES.get(L.control) as Buffer) });
    const diverged = revisionOf(bytesAt(join(SEED, "11-maintenance"), L.control));
    expect([intent.writes[0]?.before, intent.writes[0]?.after]).not.toContain(diverged);
    expect(bytesAt(join(SEED, "12-maintenance"), L.control).equals(BASE_FILES.get(L.control) as Buffer), "seed/12 restores L's pre-bytes").toBe(true);
  });

  it("every host action stands before an exchange of the session", () => {
    for (const name of HOST.keys()) expect(NAMES).toContain(name);
  });

  it("the recorded set is exactly the fifty-one pairs, the reviewed deltas, a README, base/ and seed/", () => {
    const expected = ["README.md", "base", "seed", ...[...DELTAS.values()].flat(), ...NAMES.flatMap((n) => [`${n}.request.json`, `${n}.response.json`])].sort();
    expect(readdirSync(SESSION).sort()).toEqual(expected);
    expect(readdirSync(SEED).sort()).toEqual([...SEEDED].sort());
  });
});

// ---------------------------------------------------------------------------
// The claim takeover through `bin/fusion-record`, recorded (FJ05 plan step 6;
// request 62 of `codec/fixtures/prior/REQUESTS.md` `## FJ05 (the takeover
// addendum, request 62, …)`, as `### Prior's answer to 62, …` corrects it).
//
// Thirty-seven exchanges, through the wrapper only, over a fresh temp copy of
// this session's own `base/`: a workbench under JSON control whose packages
// stand claimed by checkouts that are gone, with the decision records that
// hold the user's word for each transfer. Prior's eight cases run end to end,
// then the four further refusals, `reconcile` showing every transfer source
// and `validate` answering valid:
//
//   01 inspect      json-control
//   02 validate     valid, every record of base/
//   03 reconcile    no transfer site yet
//   04 claim        P taken over from deadbeef by B, the user's word in X1
//   05 claim        04 replayed: 04's bytes                         case 5
//   06 claim        04's id, another source: operation-id-reused    case 5
//   07 claim        04's takeover, a fresh id, the inspected
//                   revision: revision-mismatch                     case 5
//   08 claim        07 re-read at P's revision now:
//                   takeover-holder-mismatch                        case 5
//   09 claim        Q, the right checkout at another claimed_at     case 2
//   10 claim        Q, another checkout                             case 2
//   11 claim        Q, the user's word in a record that is not
//                   there: record-not-found                         case 1
//   12 claim        Q, a record of another workbench                case 1
//   13 claim        Q, the user's word in an artefact at another
//                   hash: artefact-changed                          case 1
//   14 claim        Q, takeover without source                      case 4
//   15 claim        Q, source null                                  case 4
//   16 claim        Q at a revision that never was                  case 3
//   17 release      P by its new holder B                           case 6
//   18 show         P: open, claim null, its history kept           case 6
//   19 claim        04 replayed after P moved on: 04's bytes        case 5
//   20 claim        Q taken over from A by B (X2)                   case 7
//   21 claim        Q taken over from B by C, a bare record (X3)    case 7
//   22 claim        U taken over from A by B (X4)                   case 7
//   23 release      U by B                                          case 7
//   24 claim        U, an ordinary claim by C                       case 7
//   25 claim        U taken over from C by D, the user's word in
//                   the memo M; the entry starts at C, not B        case 7
//   26 transition   Q to claimed with a foreign claim:
//                   transition-refused                              case 8
//   27 transition   Q, a payload carrying takeover:
//                   schema-invalid/request                          case 8
//   28 claim        Q without takeover: already-claimed             case 8
//   29 claim        O, open: takeover-not-claimed
//   30 claim        Z, paused: takeover-not-claimed
//   31 claim        T, dropped: package-terminal
//   32 claim        the issue I: not-a-package
//   33 claim        Q to the checkout holding it:
//                   takeover-same-checkout
//   34 claim        Q to D without a time: claimed-at-required
//   35 claim        N, an imported claim with no person and no time,
//                   named as stored and taken over (X5)
//   36 reconcile    every transfer source a reference site, resolved
//   37 validate     valid
//
// Case 1 is evidence validation: a source that resolves is the user's
// consent evidence, not an authorisation, and the codec decides no
// authority (Prior's answer to 62, part 2b).
//
// ## The recorded session
//
// Every exchange is recorded under `fixtures/protocol-session-takeover/` as
// `<nn>-<op>.request.json` and `<nn>-<op>.response.json`, a GOLDEN as the
// other sessions are, rewritten only under
// `UPDATE_PROTOCOL_SESSION_TAKEOVER=1`. `base/` is written from the constants
// below under that variable and checked on every run. One substitution, the
// temp workbench's absolute path as `<workbench>`; every time is a literal of
// the requests (`transferred_at` is the request's `claimed_at`), so nothing
// depends on the clock, the host or a generated id.
//
// ## The version boundary (Prior's answer to 62, part 7)
//
// The second half runs the bundle Prior qualified, `c76bbce9…`, extracted from
// git by its blob, over a copy of the workbench this session leaves: it
// refuses each transferred package for direct reading and mutation, and
// rewrites no byte of the tree. And every record the manifest called valid
// at `031645d2`, the commit the addendum was written against, validates in
// the schema set this bundle inlines.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { installInlined } from "../cli/schemas.js";
import { revisionOf, serialise } from "../store.js";
import { strictParse } from "../strict-json.js";
import { CODEC_DIR, bytesAt, filesUnder, openSession, parse, requestBytes } from "./helpers/session.js";

// --- the fixed literals ----------------------------------------------------------

const pad = (n: number): string => String(n).padStart(2, "0");
const WB_ID = "7a6e0000-0000-4000-8000-000000000000";
/** Record ids, by a number of their own. */
const rid = (n: number): string => `7a6ee0${pad(n)}-0000-4000-8000-0000000000${pad(n)}`;
/** Operation ids, by the exchange that first sends them. */
const op = (n: number): string => `7a6e00${pad(n)}-0000-4000-8000-0000000000${pad(n)}`;
const PERSON = "Kai Stalmann <ks@qantr.com>";
const USER = { actor: "user", person: PERSON };
const OPERATOR = { actor: "orchestrator", person: PERSON };
const STALE = "sha256:" + "0".repeat(64);

/** The checkouts: GONE held P and N and is gone; A, B, C and D are live. */
const claim = (checkout_id: string, claimed_at: string | null, person: string | null = PERSON) => ({ checkout_id, person, claimed_at });
const GONE = claim("deadbeef", "2026-09-28T13:41:00+02:00");
const A = claim("aaaa0001", "2026-10-01T09:00:00+02:00");
const B = claim("bbbb0002", "2026-10-09T14:00:00+02:00");
const B_Q = claim("bbbb0002", "2026-10-09T14:10:00+02:00");
const B_U = claim("bbbb0002", "2026-10-09T14:20:00+02:00");
const C = claim("cccc0003", "2026-10-09T15:00:00+02:00");
const C_U = claim("cccc0003", "2026-10-09T15:20:00+02:00");
const D = claim("dddd0004", "2026-10-09T16:20:00+02:00");
const B_N = claim("bbbb0002", "2026-10-09T17:00:00+02:00");
/** N's imported claim: the v12 header named a checkout and nothing else. */
const IMPORTED = claim("deadbeef", null, null);

const pkgDir = (stem: string): string => `work-packages/${stem}`;
const pkgPaths = (stem: string) => ({ dir: pkgDir(stem), control: `${pkgDir(stem)}/package.json`, narrative: `${pkgDir(stem)}/${stem}.md` });
const decisionPaths = (dir: string, stem: string) => ({ control: `${dir}/decisions/${stem}.record.json`, narrative: `${dir}/decisions/${stem}.md` });

/** P, taken over once and released; Q, taken over twice; U, taken over, released, re-claimed and taken over; N, imported and taken over. */
const P = pkgPaths("260928-0900-taken-over-once");
const Q = pkgPaths("260928-1000-taken-over-twice");
const U = pkgPaths("260928-1100-released-between-takeovers");
const N = pkgPaths("260918-0900-imported-claim");
/** O open, Z paused, T dropped: the states a takeover refuses. */
const O = pkgPaths("260928-1200-open-package");
const Z = pkgPaths("260928-1300-paused-package");
const T = pkgPaths("260920-0900-dropped-package");
/** I, an issue: not a package. */
const I = { control: "shared/issues/260928-1400-an-issue.record.json", narrative: "shared/issues/260928-1400-an-issue.md" };
/** X1 to X5: the decision records that hold the user's word, one per transfer the session lands with a record. */
const X1 = decisionPaths(P.dir, "261009-1400-may-b-take-over-p-from-deadbeef");
const X2 = decisionPaths(Q.dir, "261009-1410-may-b-take-over-q-from-a");
const X3 = decisionPaths(Q.dir, "261009-1500-may-c-take-over-q-from-b");
const X4 = decisionPaths(U.dir, "261009-1420-may-b-take-over-u-from-a");
const X5 = decisionPaths(N.dir, "261009-1700-may-b-take-over-n-from-deadbeef");
/** M, a memo holding the user's word for U's second transfer: an artefact source. */
const M = `${U.dir}/memos/261009-1620-take-over-u-from-c.md`;
/** N's backup, a migration's hash-bound artefact under archive/. */
const N_BACKUP = `archive/migrations/migration-20260918-session/backup/${N.narrative}`;

const ID = { P: rid(1), Q: rid(2), U: rid(3), N: rid(4), O: rid(5), Z: rid(6), T: rid(7), I: rid(8), X1: rid(11), X2: rid(12), X3: rid(13), X4: rid(14), X5: rid(15) } as const;

const md = (title: string, body: string): Buffer => Buffer.from(`# ${title}\n\n${body}\n`, "utf-8");
const ref = (id: string) => ({ workbench_id: WB_ID, record_id: id });
const created = { source: "created", legacy_fields: {} };

const NARRATIVES = new Map<string, Buffer>([
  [P.narrative, md("Taken over once", "Claimed by deadbeef, a checkout that is gone.")],
  [Q.narrative, md("Taken over twice", "Claimed by A.")],
  [U.narrative, md("Released between takeovers", "Claimed by A.")],
  [N.narrative, md("An imported claim", "Imported from v12 with a claim that named a checkout and nothing else.")],
  [O.narrative, md("An open package", "Nobody holds it.")],
  [Z.narrative, md("A paused package", "Nobody holds it.")],
  [T.narrative, md("A dropped package", "History.")],
  [I.narrative, md("An issue", "Not a package.")],
  [X1.narrative, md("May B take over P from deadbeef?", 'The user, verbatim: "Take over P from deadbeef for B; deadbeef is gone."')],
  [X2.narrative, md("May B take over Q from A?", 'The user, verbatim: "B takes Q over from A; A has stopped."')],
  [X3.narrative, md("May C take over Q from B?", 'The user, verbatim: "C takes Q over from B; B has stopped."')],
  [X4.narrative, md("May B take over U from A?", 'The user, verbatim: "B takes U over from A; A has stopped."')],
  [X5.narrative, md("May B take over N from deadbeef?", 'The user, verbatim: "B takes N over from deadbeef; deadbeef is gone."')],
]);
const MEMO = md("Take over U from C", 'The user, verbatim: "D takes U over from C; C has stopped."');
const BACKUP_BYTES = md("An imported claim", "**Claim:** deadbeef");

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
    filed_by: USER,
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

function record(kind: string, id: string, paths: { narrative: string }, control: unknown): unknown {
  return { schema: "fusion.record/v1", id, workbench_id: WB_ID, kind, narrative: { path: paths.narrative }, filed_by: USER, references: [], provenance: created, extensions: {}, control };
}
const decision = (id: string, paths: { narrative: string }): unknown => record("decision", id, paths, { state: "open", answer_ref: null, implementation_ref: null, superseded_by: null, deferral: null });

const bytesOf = (value: unknown): Buffer => Buffer.from(serialise(value), "utf-8");

/** `base/`, workbench-relative path to bytes. */
const BASE_FILES = new Map<string, Buffer>([
  ["workbench.json", bytesOf({ schema: "fusion.workbench/v1", id: WB_ID, required_features: ["json-control-v1"], migration: null, extensions: {} })],
  ...NARRATIVES,
  [M, MEMO],
  [N_BACKUP, BACKUP_BYTES],
  [P.control, bytesOf(pkg(ID.P, P, { status: "claimed", claim: GONE }))],
  [Q.control, bytesOf(pkg(ID.Q, Q, { status: "claimed", claim: A }))],
  [U.control, bytesOf(pkg(ID.U, U, { status: "claimed", claim: A }))],
  [N.control, bytesOf(pkg(ID.N, N, { status: "claimed", claim: IMPORTED, provenance: { source: "imported", legacy_fields: { claim: "deadbeef" }, backup: { path: N_BACKUP, sha256: revisionOf(BACKUP_BYTES), kind: "other" } } }))],
  [O.control, bytesOf(pkg(ID.O, O))],
  [Z.control, bytesOf(pkg(ID.Z, Z, { status: "paused" }))],
  [T.control, bytesOf(pkg(ID.T, T, { status: "dropped", outcome: { class: "cancelled", reason: "Superseded before the takeover existed.", evidence: [] } }))],
  [I.control, bytesOf(record("issue", ID.I, I, { state: "open", disposition: null }))],
  [X1.control, bytesOf(decision(ID.X1, X1))],
  [X2.control, bytesOf(decision(ID.X2, X2))],
  [X3.control, bytesOf(decision(ID.X3, X3))],
  [X4.control, bytesOf(decision(ID.X4, X4))],
  [X5.control, bytesOf(decision(ID.X5, X5))],
]);

const NAMES = [
  "01-inspect",
  "02-validate",
  "03-reconcile",
  "04-claim",
  "05-claim",
  "06-claim",
  "07-claim",
  "08-claim",
  "09-claim",
  "10-claim",
  "11-claim",
  "12-claim",
  "13-claim",
  "14-claim",
  "15-claim",
  "16-claim",
  "17-release",
  "18-show",
  "19-claim",
  "20-claim",
  "21-claim",
  "22-claim",
  "23-release",
  "24-claim",
  "25-claim",
  "26-transition",
  "27-transition",
  "28-claim",
  "29-claim",
  "30-claim",
  "31-claim",
  "32-claim",
  "33-claim",
  "34-claim",
  "35-claim",
  "36-reconcile",
  "37-validate",
] as const;
type Name = (typeof NAMES)[number];

// --- the exchange machinery (helpers/session.ts) ----------------------------------------

const BASE = join(CODEC_DIR, "fixtures", "protocol-session-takeover", "base");
const session = openSession<Name>({ directory: "protocol-session-takeover", updateVariable: "UPDATE_PROTOCOL_SESSION_TAKEOVER", tmpPrefix: "codec-round-trip-takeover-", base: BASE });
const { exchanges, byName, result } = session;
const SESSION = session.dir;
const UPDATE = session.update;
const FIX = "UPDATE_PROTOCOL_SESSION_TAKEOVER=1";

if (UPDATE) {
  rmSync(BASE, { recursive: true, force: true });
  for (const [path, bytes] of BASE_FILES) {
    mkdirSync(dirname(join(BASE, path)), { recursive: true });
    writeFileSync(join(BASE, path), bytes);
  }
}

let tmp: string;
let root: string;
/** A copy of the workbench as the session leaves it, for the old bundle. */
let after: string;
/** What the recorder observed between exchanges, by the exchange it follows. */
const observed = new Map<string, unknown>();
const at = (path: string): string => join(root, path);
const controlAt = (path: string): Record<string, unknown> => {
  const p = strictParse(readFileSync(at(path)));
  if (!p.ok) throw new Error(p.detail);
  return p.value as Record<string, unknown>;
};

const word = (id: string) => ({ kind: "user-word", ref: ref(id) });

beforeAll(() => {
  ({ tmp, root } = session.start());
  const W = (): string => root;
  const now = (path: string): string => session.revisionAt(path);
  const base = (path: string): string => revisionOf(BASE_FILES.get(path) as Buffer);
  const takeover = (n: number, path: string, revision: string, previous: unknown, next: unknown, source: unknown) => ({
    op: "claim",
    workbench: W(),
    operation_id: op(n),
    record: { path },
    expected_revision: revision,
    actor: OPERATOR,
    claim: next,
    takeover: { previous_claim: previous, source },
  });
  const release = (n: number, path: string, reason: string) => ({ op: "release", workbench: W(), operation_id: op(n), record: { path }, expected_revision: now(path), actor: OPERATOR, reason });

  session.exchange("01-inspect", { op: "inspect", workbench: W() });
  session.exchange("02-validate", { op: "validate", workbench: W() });
  session.exchange("03-reconcile", { op: "reconcile", workbench: W() });

  // Case 5 around one landed takeover of P.
  const p04 = takeover(4, P.control, base(P.control), GONE, B, word(ID.X1));
  session.exchange("04-claim", p04);
  observed.set("after-04", readFileSync(at(P.control)).toString("base64"));
  session.exchange("05-claim", p04);
  session.exchange("06-claim", { ...p04, takeover: { previous_claim: GONE, source: ref(ID.X1) } });
  session.exchange("07-claim", { ...p04, operation_id: op(7) });
  session.exchange("08-claim", { ...p04, operation_id: op(8), expected_revision: now(P.control) });
  observed.set("after-08", readFileSync(at(P.control)).toString("base64"));

  // Cases 2, 1, 4 and 3 on Q, each refused; Q stays at its base bytes.
  session.exchange("09-claim", takeover(9, Q.control, base(Q.control), { ...A, claimed_at: "2026-10-01T09:00:01+02:00" }, B_Q, word(ID.X2)));
  session.exchange("10-claim", takeover(10, Q.control, base(Q.control), { ...A, checkout_id: "0badf00d" }, B_Q, word(ID.X2)));
  session.exchange("11-claim", takeover(11, Q.control, base(Q.control), A, B_Q, word("7a6eeeee-0000-4000-8000-00000000dead")));
  session.exchange("12-claim", takeover(12, Q.control, base(Q.control), A, B_Q, { kind: "user-word", ref: { workbench_id: "00000000-0000-4000-8000-000000000000", record_id: ID.X2 } }));
  session.exchange("13-claim", takeover(13, Q.control, base(Q.control), A, B_Q, { kind: "user-word", ref: { path: M, sha256: STALE, kind: "memo" } }));
  const q14 = takeover(14, Q.control, base(Q.control), A, B_Q, word(ID.X2));
  session.exchange("14-claim", { ...q14, takeover: { previous_claim: A } });
  session.exchange("15-claim", { ...q14, operation_id: op(15), takeover: { previous_claim: A, source: null } });
  session.exchange("16-claim", takeover(16, Q.control, STALE, A, B_Q, word(ID.X2)));
  observed.set("after-16", readFileSync(at(Q.control)).toString("base64"));

  // Case 6, and case 5 once more after P moved on.
  session.exchange("17-release", release(17, P.control, "B is done with P."));
  session.exchange("18-show", { op: "show", workbench: W(), record: { path: P.control } });
  session.exchange("19-claim", p04);

  // Case 7: A to B to C on Q; A to B, release, an ordinary claim by C, C to D on U.
  session.exchange("20-claim", takeover(20, Q.control, base(Q.control), A, B_Q, word(ID.X2)));
  session.exchange("21-claim", takeover(21, Q.control, now(Q.control), B_Q, C, ref(ID.X3)));
  session.exchange("22-claim", takeover(22, U.control, base(U.control), A, B_U, word(ID.X4)));
  session.exchange("23-release", release(23, U.control, "B hands U back."));
  session.exchange("24-claim", { op: "claim", workbench: W(), operation_id: op(24), record: { path: U.control }, expected_revision: now(U.control), actor: OPERATOR, claim: C_U });
  session.exchange("25-claim", takeover(25, U.control, now(U.control), C_U, D, { kind: "user-word", ref: { path: M, sha256: revisionOf(MEMO), kind: "memo" } }));

  // Case 8: the general-transition bypass on Q, held by C.
  const transition = (n: number, payload: unknown) => ({ op: "transition", workbench: W(), operation_id: op(n), record: { path: Q.control }, expected_revision: now(Q.control), actor: OPERATOR, to: "claimed", reason: "Around the takeover.", payload });
  session.exchange("26-transition", transition(26, { claim: D }));
  session.exchange("27-transition", transition(27, { claim: D, takeover: { previous_claim: C, source: ref(ID.X3) } }));
  session.exchange("28-claim", { op: "claim", workbench: W(), operation_id: op(28), record: { path: Q.control }, expected_revision: now(Q.control), actor: OPERATOR, claim: D });
  observed.set("after-28", readFileSync(at(Q.control)).toString("base64"));

  // The four further refusals.
  session.exchange("29-claim", takeover(29, O.control, base(O.control), GONE, B, word(ID.X1)));
  session.exchange("30-claim", takeover(30, Z.control, base(Z.control), GONE, B, word(ID.X1)));
  session.exchange("31-claim", takeover(31, T.control, base(T.control), GONE, B, word(ID.X1)));
  session.exchange("32-claim", takeover(32, I.control, base(I.control), GONE, B, word(ID.X1)));
  session.exchange("33-claim", takeover(33, Q.control, now(Q.control), C, { ...C, claimed_at: "2026-10-09T18:00:00+02:00" }, ref(ID.X3)));
  session.exchange("34-claim", takeover(34, Q.control, now(Q.control), C, { ...D, claimed_at: null }, ref(ID.X3)));
  observed.set(
    "after-34",
    Object.fromEntries([O.control, Z.control, T.control, I.control, Q.control].map((p) => [p, readFileSync(at(p)).toString("base64")])),
  );

  // An imported claim with no person and no time, named as stored.
  session.exchange("35-claim", takeover(35, N.control, base(N.control), IMPORTED, B_N, word(ID.X5)));

  session.exchange("36-reconcile", { op: "reconcile", workbench: W() });
  session.exchange("37-validate", { op: "validate", workbench: W() });

  after = join(tmp, "after");
  cpSync(root, after, { recursive: true });
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
const reasonOf = (name: Name) => {
  const e = refusalOf(name);
  return { class: e.class, reason: e.reason };
};
const CONTROLS = [...BASE_FILES.keys()].filter((p) => !p.startsWith("archive/") && (p.endsWith(".record.json") || p.endsWith("/package.json"))).sort();
const transfersOf = (control: Record<string, unknown>): Array<Record<string, unknown>> => ((control.provenance as { claim_transfers?: Array<Record<string, unknown>> }).claim_transfers ?? []) as Array<Record<string, unknown>>;
const sent = (name: Name) => byName(name).request as { operation_id: string; expected_revision: string; actor: unknown; claim: { claimed_at: string }; takeover: { previous_claim: unknown; source: unknown } };

describe("the thirty-seven takeover exchanges through bin/fusion-record", () => {
  it("every exchange was answered: exit 0, one line on stdout, nothing on stderr", () => {
    expect(exchanges.map((e) => e.name)).toEqual([...NAMES]);
    for (const e of exchanges) {
      expect(e.status, `${e.name}: ${e.stderr}`).toBe(0);
      expect(e.stderr, e.name).toBe("");
      expect(e.stdout.endsWith("\n"), e.name).toBe(true);
      expect(e.stdout.trim().split("\n"), e.name).toHaveLength(1);
    }
  });

  it("01 to 03: json-control; valid; no transfer site before any takeover", () => {
    expect(result(byName("01-inspect"))).toMatchObject({ state: "json-control", id: WB_ID, pending: null, maintenance: null });
    expect(result(byName("02-validate"))).toEqual({ workbench: root, state: "json-control", checked: CONTROLS.length, valid: true, findings: [] });
    expect(JSON.stringify(result(byName("03-reconcile")).references)).not.toContain("claim_transfers");
  });

  it("04: the takeover of P lands: the claim answer with both checkouts, and P carries B's claim and one entry whose transferred_at is the request's claimed_at", () => {
    const req = sent("04-claim");
    expect(result(byName("04-claim"))).toEqual({
      operation_id: op(4),
      path: P.control,
      from: "claimed",
      to: "claimed",
      revision: revisionOf(Buffer.from(observed.get("after-04") as string, "base64")),
      previous_revision: req.expected_revision,
      previous_checkout_id: GONE.checkout_id,
      checkout_id: B.checkout_id,
    });
    const control = strictParse(Buffer.from(observed.get("after-04") as string, "base64"));
    if (!control.ok) throw new Error(control.detail);
    const c = control.value as Record<string, unknown>;
    expect(c).toMatchObject({ status: "claimed", claim: B });
    expect(transfersOf(c)).toEqual([{ previous_claim: GONE, claim: B, inspected_revision: req.expected_revision, operation_id: op(4), actor: OPERATOR, transferred_at: B.claimed_at, source: word(ID.X1) }]);
  });

  it("case 5, replay: 05 and 19 answer 04's bytes, before and after P moved on; 06 is operation-id-reused; 07, a fresh id on the inspected revision, is revision-mismatch; 08, re-read, is takeover-holder-mismatch; none wrote", () => {
    expect(byName("05-claim").stdout).toBe(byName("04-claim").stdout);
    expect(byName("19-claim").stdout).toBe(byName("04-claim").stdout);
    expect(reasonOf("06-claim")).toEqual({ class: "conflict", reason: "operation-id-reused" });
    expect(reasonOf("07-claim")).toEqual({ class: "conflict", reason: "revision-mismatch" });
    expect(reasonOf("08-claim")).toEqual({ class: "conflict", reason: "takeover-holder-mismatch" });
    expect(observed.get("after-08"), "P after 05 to 08 is P after 04").toBe(observed.get("after-04"));
  });

  it("case 2, wrong holder: 09 (the right checkout, another claimed_at) and 10 (another checkout) are takeover-holder-mismatch", () => {
    expect(reasonOf("09-claim")).toEqual({ class: "conflict", reason: "takeover-holder-mismatch" });
    expect(reasonOf("10-claim")).toEqual({ class: "conflict", reason: "takeover-holder-mismatch" });
  });

  it("case 1, evidence validation: a source in a record that is not there, in another workbench, or in an artefact at another hash is refused; no authority is decided", () => {
    expect(reasonOf("11-claim")).toEqual({ class: "unresolved-reference", reason: "record-not-found" });
    expect(reasonOf("12-claim")).toEqual({ class: "unresolved-reference", reason: "foreign-workbench" });
    expect(reasonOf("13-claim")).toEqual({ class: "missing-evidence", reason: "artefact-changed" });
  });

  it("case 4, missing source: 14 (without source) and 15 (source null) are schema-invalid/request", () => {
    expect(reasonOf("14-claim")).toEqual({ class: "schema-invalid", reason: "request" });
    expect(reasonOf("15-claim")).toEqual({ class: "schema-invalid", reason: "request" });
  });

  it("case 3, stale revision: 16 is revision-mismatch; Q stood at its base bytes through 09 to 16", () => {
    expect(reasonOf("16-claim")).toEqual({ class: "conflict", reason: "revision-mismatch" });
    expect(Buffer.from(observed.get("after-16") as string, "base64").equals(BASE_FILES.get(Q.control) as Buffer)).toBe(true);
  });

  it("case 6, release after transfer: 17 lands open from claimed; 18 shows P open, its claim null and its history as 04 wrote it", () => {
    expect(result(byName("17-release"))).toMatchObject({ path: P.control, from: "claimed", to: "open" });
    const shown = result(byName("18-show")).control as Record<string, unknown>;
    expect(shown).toMatchObject({ status: "open", claim: null });
    const landed = strictParse(Buffer.from(observed.get("after-04") as string, "base64"));
    if (!landed.ok) throw new Error(landed.detail);
    expect(transfersOf(shown)).toEqual(transfersOf(landed.value as Record<string, unknown>));
  });

  it("case 7, A to B to C: 20 and 21 land, Q's two entries in order, the second's previous_claim the claim standing before it", () => {
    expect(result(byName("20-claim"))).toMatchObject({ previous_checkout_id: A.checkout_id, checkout_id: B_Q.checkout_id });
    expect(result(byName("21-claim"))).toMatchObject({ previous_checkout_id: B_Q.checkout_id, checkout_id: C.checkout_id });
    const q = controlAt(Q.control);
    expect(q.claim).toEqual(C);
    expect(transfersOf(q).map((e) => [e.previous_claim, e.claim, e.source, e.transferred_at])).toEqual([
      [A, B_Q, word(ID.X2), B_Q.claimed_at],
      [B_Q, C, ref(ID.X3), C.claimed_at],
    ]);
    expect((q.provenance as Record<string, unknown>).source).toBe("created");
  });

  it("case 7, A to B, release, an ordinary claim by C, C to D: the ordinary claim appends nothing, and U's second entry starts at C's claim, not B's", () => {
    expect(result(byName("22-claim"))).toMatchObject({ checkout_id: B_U.checkout_id });
    expect(result(byName("23-release"))).toMatchObject({ from: "claimed", to: "open" });
    expect(Object.keys(result(byName("24-claim"))), "an ordinary claim's answer").toEqual(["operation_id", "path", "from", "to", "revision", "previous_revision"]);
    expect(result(byName("25-claim"))).toMatchObject({ previous_checkout_id: C_U.checkout_id, checkout_id: D.checkout_id });
    const u = controlAt(U.control);
    expect(u.claim).toEqual(D);
    expect(transfersOf(u).map((e) => [e.previous_claim, e.claim])).toEqual([
      [A, B_U],
      [C_U, D],
    ]);
  });

  it("case 8, the general-transition bypass: 26 is transition-refused, 27 schema-invalid/request, 28 already-claimed; Q unchanged by them", () => {
    expect(reasonOf("26-transition")).toEqual({ class: "conflict", reason: "transition-refused" });
    expect(reasonOf("27-transition")).toEqual({ class: "schema-invalid", reason: "request" });
    expect(reasonOf("28-claim")).toEqual({ class: "conflict", reason: "already-claimed" });
    expect(revisionOf(Buffer.from(observed.get("after-28") as string, "base64"))).toBe(sent("26-transition" as Name).expected_revision);
  });

  it("29 to 34, the further refusals: open and paused takeover-not-claimed, dropped package-terminal, an issue not-a-package, the same checkout takeover-same-checkout, no time claimed-at-required; none wrote", () => {
    expect(reasonOf("29-claim")).toEqual({ class: "conflict", reason: "takeover-not-claimed" });
    expect(reasonOf("30-claim")).toEqual({ class: "conflict", reason: "takeover-not-claimed" });
    expect(reasonOf("31-claim")).toEqual({ class: "conflict", reason: "package-terminal" });
    expect(reasonOf("32-claim")).toEqual({ class: "schema-invalid", reason: "not-a-package" });
    expect(reasonOf("33-claim")).toEqual({ class: "schema-invalid", reason: "takeover-same-checkout" });
    expect(reasonOf("34-claim")).toEqual({ class: "schema-invalid", reason: "claimed-at-required" });
    const bytes = observed.get("after-34") as Record<string, string>;
    for (const path of [O.control, Z.control, T.control, I.control]) expect(Buffer.from(bytes[path] as string, "base64").equals(BASE_FILES.get(path) as Buffer), path).toBe(true);
    expect(revisionOf(Buffer.from(bytes[Q.control] as string, "base64"))).toBe(sent("33-claim").expected_revision);
  });

  it("35: an imported claim with no person and no time is named as stored and taken over; the entry keeps the nulls and the import's provenance stands", () => {
    expect(result(byName("35-claim"))).toMatchObject({ previous_checkout_id: "deadbeef", checkout_id: B_N.checkout_id });
    const n = controlAt(N.control);
    expect(transfersOf(n)).toHaveLength(1);
    expect(transfersOf(n)[0]?.previous_claim).toEqual(IMPORTED);
    expect(n.provenance).toMatchObject({ source: "imported", legacy_fields: { claim: "deadbeef" } });
  });

  it("36: reconcile lists every transfer source as a reference site, spelt as the mode's source is, each resolved", () => {
    const refs = result(byName("36-reconcile")).references as Array<{ path: string; at: string; status: string; target?: string }>;
    expect(refs.filter((r) => r.at.includes("claim_transfers"))).toEqual([
      { path: N.control, at: "/provenance/claim_transfers/0/source/ref", status: "resolved", target: X5.control },
      { path: P.control, at: "/provenance/claim_transfers/0/source/ref", status: "resolved", target: X1.control },
      { path: Q.control, at: "/provenance/claim_transfers/0/source/ref", status: "resolved", target: X2.control },
      { path: Q.control, at: "/provenance/claim_transfers/1/source", status: "resolved", target: X3.control },
      { path: U.control, at: "/provenance/claim_transfers/0/source/ref", status: "resolved", target: X4.control },
      { path: U.control, at: "/provenance/claim_transfers/1/source/ref", status: "resolved", target: M },
    ]);
  });

  it("37: the workbench the session leaves is valid", () => {
    expect(result(byName("37-validate"))).toEqual({ workbench: root, state: "json-control", checked: CONTROLS.length, valid: true, findings: [] });
  });
});

// --- the recorded session ------------------------------------------------------------------

describe(`the recorded session under fixtures/protocol-session-takeover/ (${UPDATE ? "REGENERATING" : "golden"})`, () => {
  it("no recorded byte carries the temp path, and the placeholder round-trips", () => {
    for (const e of exchanges) {
      const req = session.record(requestBytes(e.request));
      const res = session.record(e.stdout);
      for (const text of [req, res]) {
        expect(text, e.name).not.toContain(root);
        expect(text, e.name).not.toContain(tmp);
      }
      expect(session.replay(req), e.name).toBe(requestBytes(e.request));
      expect(session.replay(res), e.name).toBe(e.stdout);
    }
  });

  for (const name of NAMES) {
    it(`${name}: the recorded request and response equal the fresh exchange`, () => {
      const { requestFile, responseFile, freshRequest, freshResponse } = session.fresh(name);
      const missing = [requestFile, responseFile].filter((f) => !existsSync(f));
      expect(missing, `recorded session incomplete: ${missing.join(", ")}.\nFIX: run \`${FIX} npm test -- round-trip-cli-takeover\` in codec/ and commit fixtures/protocol-session-takeover/.`).toEqual([]);
      expect(readFileSync(requestFile, "utf-8"), `${name}.request.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with ${FIX} and commit the files; the Prior side replays them.`).toBe(freshRequest);
      expect(readFileSync(responseFile, "utf-8"), `${name}.response.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with ${FIX} and commit the files; the Prior side replays them.`).toBe(freshResponse);
    });
  }

  it("base/ holds exactly the workbench the constants state", () => {
    expect(filesUnder(BASE), `base/ is not the stated file set. If it changed on purpose, regenerate with ${FIX}.`).toEqual([...BASE_FILES.keys()].sort());
    for (const [path, bytes] of BASE_FILES) expect(bytesAt(BASE, path).equals(bytes), `base/${path}`).toBe(true);
  });

  it("the recorded set is exactly the thirty-seven pairs, a README and base/", () => {
    const expected = ["README.md", "base", ...NAMES.flatMap((n) => [`${n}.request.json`, `${n}.response.json`])].sort();
    expect(readdirSync(SESSION).sort()).toEqual(expected);
  });
});

// --- the version boundary: the qualified bundle before the takeover --------------------------

/**
 * The bundle Prior qualified at `d6abeb8` (requests 59 and 60), by its git
 * blob, committed at `f9ecae78`; the digest is asserted before it is run.
 */
const OLD_BUNDLE_BLOB = "6ecde063e876ad9ca77de7d36370568580ed29d3";
const OLD_BUNDLE_DIGEST = "sha256:c76bbce9cc86634f5e9c227e8496511dc71eb845768704f43e68200ab841e52e";
/** The commit the addendum was written against: its manifest's valid fixtures are the old records. */
const ADDENDUM_BASE = "031645d2";
const REPO_ROOT = resolve(CODEC_DIR, "..");

const git = (args: string[]): Buffer => {
  const r = spawnSync("git", args, { cwd: REPO_ROOT, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr.toString("utf-8")}`);
  return r.stdout;
};

/** Every file under `dir` with its bytes, base64: what "rewrites nothing" is compared on. */
const treeBytes = (dir: string): Record<string, string> => Object.fromEntries(filesUnder(dir).map((p) => [p, bytesAt(dir, p).toString("base64")]));

describe("the version boundary (Prior's answer to 62, part 7): the old qualified bundle refuses a transferred package and rewrites nothing; old records validate in the new bundle", () => {
  let oldDir: string;
  let oldBundle: string;
  beforeAll(() => {
    oldDir = mkdtempSync(join(tmpdir(), "codec-old-bundle-"));
    // Under `dist/`, the name its entry point recognises itself by when the temp path is reached through a link.
    oldBundle = join(oldDir, "dist", "fusion-record.js");
    mkdirSync(dirname(oldBundle));
    writeFileSync(oldBundle, git(["cat-file", "blob", OLD_BUNDLE_BLOB]));
  });
  afterAll(() => {
    rmSync(oldDir, { recursive: true, force: true });
  });

  const oldRun = (request: object): { ok: boolean; result?: Record<string, unknown>; error?: { class: string; reason: string } } => {
    const { FUSION_WORKBENCH: _drop, ...env } = process.env;
    const r = spawnSync(process.execPath, [oldBundle], { input: requestBytes(request), encoding: "utf-8", env });
    expect(r.status, r.stderr).toBe(0);
    return JSON.parse(r.stdout) as { ok: boolean; result?: Record<string, unknown>; error?: { class: string; reason: string } };
  };

  it("the extracted file is the qualified bundle, by digest", () => {
    expect(revisionOf(readFileSync(oldBundle))).toBe(OLD_BUNDLE_DIGEST);
  });

  it("over the workbench the session leaves: validate, release and transition of a transferred package are refused schema-invalid, a takeover request is refused by its protocol, show answers the bytes with the history whole, and not one byte of the tree moves", () => {
    const before = treeBytes(after);
    const transferred = [P.control, Q.control, U.control, N.control];
    for (const path of transferred) {
      // `show` reads a pair by the strict reader and no schema, at this
      // revision as at that one: the old bundle answers the record as stored,
      // its history neither stripped nor refused. The refusal is validate's
      // and every mutation's, below.
      const shown = oldRun({ op: "show", workbench: after, record: { path } });
      expect(shown.ok, `show ${path}`).toBe(true);
      expect(shown.result?.control, `show ${path}: the history as stored`).toEqual(JSON.parse(bytesAt(after, path).toString("utf-8")));
      expect(transfersOf(shown.result?.control as Record<string, unknown>).length, `show ${path}`).toBeGreaterThan(0);
      const checked = oldRun({ op: "validate", workbench: after, record: { path } });
      expect(checked.ok && checked.result?.valid, `validate ${path}`).toBe(false);
      expect((checked.result?.findings as Array<{ class: string }>).map((f) => f.class), `validate ${path}`).toContain("schema-invalid");
    }
    const revisionOfQ = revisionOf(bytesAt(after, Q.control));
    const released = oldRun({ op: "release", workbench: after, operation_id: op(90), record: { path: Q.control }, expected_revision: revisionOfQ, actor: OPERATOR, reason: "an old client" });
    expect({ ok: released.ok, class: released.error?.class }).toEqual({ ok: false, class: "schema-invalid" });
    const moved = oldRun({ op: "transition", workbench: after, operation_id: op(91), record: { path: Q.control }, expected_revision: revisionOfQ, actor: OPERATOR, to: "paused", reason: "an old client", payload: {} });
    expect({ ok: moved.ok, class: moved.error?.class }).toEqual({ ok: false, class: "schema-invalid" });
    const takeover = oldRun({ ...sent("21-claim"), workbench: after, operation_id: op(92), expected_revision: revisionOfQ, takeover: { previous_claim: C, source: ref(ID.X3) } });
    expect({ ok: takeover.ok, class: takeover.error?.class, reason: takeover.error?.reason }).toEqual({ ok: false, class: "schema-invalid", reason: "request" });

    // An aggregate read answers, and names exactly the transferred packages: the workbench is not readable whole by the old client.
    const whole = oldRun({ op: "validate", workbench: after });
    expect(whole.ok).toBe(true);
    expect(whole.result?.valid).toBe(false);
    expect([...new Set((whole.result?.findings as Array<{ path: string }>).map((f) => f.path))].sort()).toEqual([...transferred].sort());

    expect(treeBytes(after), "the old bundle stripped, rewrote or added nothing").toEqual(before);
  });

  it(`every record the manifest at ${ADDENDUM_BASE} expects valid validates in the schema set the new bundle inlines`, () => {
    const set = installInlined();
    const manifest = JSON.parse(git(["show", `${ADDENDUM_BASE}:codec/fixtures/manifest.json`]).toString("utf-8")) as Array<{ path: string; schema: string; expect: string }>;
    const valid = manifest.filter((e) => e.expect === "valid" && e.schema !== "bytes");
    expect(valid, "the valid entries at that commit").toHaveLength(86);
    for (const entry of valid) {
      const parsed = strictParse(git(["show", `${ADDENDUM_BASE}:codec/fixtures/${entry.path}`]));
      expect(parsed.ok, entry.path).toBe(true);
      if (!parsed.ok) continue;
      expect(set.validate(entry.schema, parsed.value), entry.path).toEqual({ ok: true });
    }
  });
});

// ---------------------------------------------------------------------------
// The two FJ02b extensions through `bin/fusion-record`, recorded (FJ02b
// step 5): plan progress through `transition` (Prior's FJ02 response 18) and
// `create` of an evidence record (response 19).
//
// Twenty exchanges, through the wrapper only, over a fresh temp copy of the
// scratch workbench, in the order the plan's step 5 gives. P is the package,
// L its plan, R the one report every evidence exchange names, E1 to E6 the
// evidence records sent:
//
//   01 create      P with its Markdown body
//   02 create      L with its body, into P's container: steps s1, s2, s3 and
//                  criteria c1, c2
//   03 transition  L open -> in_progress, s1 to in_progress
//   04 transition  L in_progress -> in_progress: s1 to done, s2 to
//                  in_progress, c1 to true
//   05 transition  04 repeated: the stored answer, byte-identical to 04's
//   06 show        L: s3 open, c2 null, the stored order kept
//   07 transition  progress only, at 03's revision: conflict/revision-mismatch
//   08 transition  s1 back to open: conflict/transition-refused
//   09 transition  s2 named twice: schema-invalid/duplicate-step-id
//   10 transition  s9, which L lacks: unresolved-reference/unknown-step-id
//   11 create      E1 for P over R, seeded before 11: the first-record path
//   12 create      E2 correcting E1 over the unchanged R: counter 2
//   13 create      E3 correcting E1: counter 3
//   14 create      12 repeated: the stored answer, byte-identical to 12's,
//                  counter 2 although 3 has landed
//   15 show        E1: the revision 11 answered
//   16 create      E4 without a predecessor over R: conflict/record-exists
//   17 create      E5 naming a hash R does not have:
//                  missing-evidence/report-changed
//   18 transition  L in_progress -> closed
//   19 transition  progress only on the closed L: conflict/transition-refused
//   20 create      E6 correcting E1 after R was replaced, seeded before 20,
//                  the payload naming R's new hash:
//                  conflict/predecessor-report-changed
//
// 20 is last because its seed changes the report every earlier evidence
// exchange reads.
//
// ## The recorded session
//
// Every exchange is recorded under `fixtures/protocol-session-fj02b/` as
// `<nn>-<op>.request.json` and `<nn>-<op>.response.json`, a GOLDEN as the
// FJ02 session is (`round-trip-cli-fj02.test.ts`): compared byte for byte on
// an ordinary run, rewritten only under `UPDATE_PROTOCOL_SESSION_FJ02B=1`,
// with the same one substitution, the temp workbench's absolute path as the
// literal `<workbench>`. The machinery is the FJ02 recorder's, shared through
// `helpers/session.ts`.
//
// Two exchanges need a file no operation of the protocol writes, the report:
// a reviewer writes Markdown, and the kernel is the one writer of fusion JSON,
// not of reports. Each set sits under `seed/<nn>-<op>/`, laid out as the
// workbench is, and is copied onto the workbench root immediately before
// exchange <nn>:
//
//   seed/11-create/  R as the reviewer wrote it
//   seed/20-create/  R at the same path with other bytes
//
// Nothing depends on the clock or a generated id: record ids, operation ids
// and times are fixed literals below, every revision is `sha256:` over
// deterministic bytes, and no answer of the twenty echoes the root.
// ---------------------------------------------------------------------------

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { CreateEvidenceRequest, CreateRequest, EvidencePayload, RecordRef, ShowRequest, TransitionPayload, TransitionRequest } from "../cli/protocol.js";
import { revisionOf, serialise } from "../store.js";
import { PLACEHOLDER, bytesAt, filesUnder, openSession, parse, requestBytes } from "./helpers/session.js";

// --- the fixed literals ----------------------------------------------------------

const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";

const PKG_ID = "f02b1001-0000-4000-8000-000000000001";
const PKG_STEM = "260929-1500-fj02b-session";
const PKG_DIR = `work-packages/${PKG_STEM}`;
const PKG = `${PKG_DIR}/package.json`;
const PKG_MD = `${PKG_DIR}/${PKG_STEM}.md`;
const PKG_CONTENT = "# FJ02b session\n\nThe package the FJ02b recorded session files, plans and reviews.\n";

const PLAN_ID = "f02b1002-0000-4000-8000-000000000002";
const PLAN_STEM = "260929-1510-fj02b-session-plan";
const PLAN = `${PKG_DIR}/plans/${PLAN_STEM}.record.json`;
const PLAN_MD = `${PKG_DIR}/plans/${PLAN_STEM}.md`;
const PLAN_CONTENT = "# Plan for the FJ02b session\n\n1. Record plan progress.\n2. Record evidence creation.\n3. Record what each refuses.\n";
const STEPS = [
  { id: "s1", state: "open" },
  { id: "s2", state: "open" },
  { id: "s3", state: "open" },
];
const CRITERIA = [
  { id: "c1", met: null },
  { id: "c2", met: null },
];

const REVIEWS = `${PKG_DIR}/reviews`;
const REPORT_STEM = "260929-1600-fj02b-session-review";
const REPORT = `${REVIEWS}/${REPORT_STEM}.md`;
const REPORT_BYTES = Buffer.from(`# Review of ${PKG_MD}\n\nVerdict: accept. Every check passed.\n`, "utf-8");
const REPORT_CHANGED_BYTES = Buffer.from(`# Review of ${PKG_MD}\n\nVerdict: accept. Every check passed, and the second reading found nothing further.\n`, "utf-8");
const FIRST = `${REVIEWS}/${REPORT_STEM}.evidence.json`;
const correction = (n: number): string => `${REVIEWS}/${REPORT_STEM}.${n}.evidence.json`;

const SUBJECT_TREE = "0566591299a5f2c11f2573973ffc894791d20ee7";

/** Operation ids by exchange number, record ids of the evidence by their number: two ranges that never meet. */
const op = (n: number): string => `f02b00${String(n).padStart(2, "0")}-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;
const evidenceId = (n: number): string => `f02b200${n}-0000-4000-8000-00000000000${n}`;

const PERSON = "Kai Stalmann <ks@qantr.com>";
const ACTOR = { actor: "user", person: PERSON };
const IMPLEMENTER = { actor: "code-implementer", person: null };
const refTo = (record_id: string): { workbench_id: string; record_id: string } => ({ workbench_id: WB_ID, record_id });

const NAMES = [
  "01-create",
  "02-create",
  "03-transition",
  "04-transition",
  "05-transition",
  "06-show",
  "07-transition",
  "08-transition",
  "09-transition",
  "10-transition",
  "11-create",
  "12-create",
  "13-create",
  "14-create",
  "15-show",
  "16-create",
  "17-create",
  "18-transition",
  "19-transition",
  "20-create",
] as const;
type Name = (typeof NAMES)[number];

/** The exchanges a seed directory precedes. */
const SEEDED: readonly Name[] = ["11-create", "20-create"];

/** The exchanges the kernel refuses, each with the one reason it is recorded for. */
const REFUSED: ReadonlyArray<[Name, { class: string; reason: string }]> = [
  ["07-transition", { class: "conflict", reason: "revision-mismatch" }],
  ["08-transition", { class: "conflict", reason: "transition-refused" }],
  ["09-transition", { class: "schema-invalid", reason: "duplicate-step-id" }],
  ["10-transition", { class: "unresolved-reference", reason: "unknown-step-id" }],
  ["16-create", { class: "conflict", reason: "record-exists" }],
  ["17-create", { class: "missing-evidence", reason: "report-changed" }],
  ["19-transition", { class: "conflict", reason: "transition-refused" }],
  ["20-create", { class: "conflict", reason: "predecessor-report-changed" }],
];

// --- the exchange machinery, shared with the FJ02 recorder (helpers/session.ts) ----------

const session = openSession<Name>({ directory: "protocol-session-fj02b", updateVariable: "UPDATE_PROTOCOL_SESSION_FJ02B", tmpPrefix: "codec-round-trip-fj02b-" });
const { exchanges, expectedSeeds, exchange, byName, result, record, replay, revisionAt, seedBefore } = session;
const SESSION = session.dir;
const SEED = session.seedDir;
const UPDATE = session.update;
const FIX = "UPDATE_PROTOCOL_SESSION_FJ02B=1";

let tmp: string;
let root: string;

const refusalOf = (name: Name): { class: string; reason: string; detail: string } => {
  const response = parse(byName(name).stdout);
  expect(response.ok, `${name}: ${byName(name).stdout}`).toBe(false);
  if (response.ok) throw new Error("unreachable");
  return response.error as { class: string; reason: string; detail: string };
};

/** What the workbench held at a point of the session: path to bytes, the state directory left out. */
const snapshot = (): Map<string, Buffer> => new Map(filesUnder(root).filter((p) => !p.startsWith(".json-state/")).map((p) => [p, bytesAt(root, p)]));
/** The workbench as it stood immediately before each refused exchange, and immediately after it. */
const around = new Map<Name, { before: Map<string, Buffer>; after: Map<string, Buffer> }>();

// --- the session -----------------------------------------------------------------------

/** The evidence payloads as sent, by their number. */
const sent = new Map<number, EvidencePayload>();

beforeAll(() => {
  ({ tmp, root } = session.start());

  const send = (name: Name, request: object): void => {
    const refused = REFUSED.some(([n]) => n === name);
    const before = refused ? snapshot() : undefined;
    exchange(name, request);
    if (before !== undefined) around.set(name, { before, after: snapshot() });
  };

  // --- plan progress ---
  send("01-create", {
    op: "create",
    workbench: root,
    operation_id: op(1),
    id: PKG_ID,
    kind: "package",
    filed_by: ACTOR,
    origin: { kind: "user-request", ref: null },
    scope: { container: null, store: "work-packages" },
    narrative: { path: PKG_MD, content: PKG_CONTENT },
    payload: { domain: "code" },
  } satisfies CreateRequest);
  send("02-create", {
    op: "create",
    workbench: root,
    operation_id: op(2),
    id: PLAN_ID,
    kind: "plan",
    filed_by: { actor: "implementation-planner", person: null },
    origin: { kind: "package", ref: refTo(PKG_ID) },
    scope: { container: PKG_DIR, store: "plans" },
    narrative: { path: PLAN_MD, content: PLAN_CONTENT },
    payload: { state: "open", steps: STEPS, criteria: CRITERIA, acceptance: null },
  } satisfies CreateRequest);

  const progress = (n: number, to: string, reason: string, payload: TransitionPayload | undefined, expected_revision = revisionAt(PLAN)): TransitionRequest => ({
    op: "transition",
    workbench: root,
    operation_id: op(n),
    record: { path: PLAN },
    expected_revision,
    actor: IMPLEMENTER,
    to,
    reason,
    ...(payload === undefined ? {} : { payload }),
  });

  send("03-transition", progress(3, "in_progress", "FJ02b: the first step started", { steps: [{ id: "s1", state: "in_progress" }] }));
  const after03 = revisionAt(PLAN);
  const progress04 = progress(4, "in_progress", "FJ02b: the first step done, the second started, the first criterion met", {
    steps: [
      { id: "s1", state: "done" },
      { id: "s2", state: "in_progress" },
    ],
    criteria: [{ id: "c1", met: true }],
  });
  send("04-transition", progress04);
  send("05-transition", progress04);
  send("06-show", { op: "show", workbench: root, record: { path: PLAN } } satisfies ShowRequest);
  send("07-transition", progress(7, "in_progress", "FJ02b: progress against a revision the plan has left", { steps: [{ id: "s3", state: "in_progress" }] }, after03));
  send("08-transition", progress(8, "in_progress", "FJ02b: a done step sent back to open", { steps: [{ id: "s1", state: "open" }] }));
  send("09-transition", progress(9, "in_progress", "FJ02b: one step named twice", {
    steps: [
      { id: "s2", state: "in_progress" },
      { id: "s2", state: "done" },
    ],
  }));
  send("10-transition", progress(10, "in_progress", "FJ02b: a step the plan lacks", { steps: [{ id: "s9", state: "in_progress" }] }));

  // --- evidence creation ---
  /** `create` of evidence record E<n>, sent as exchange `exchangeNumber`, whose operation id it carries. */
  const evidence = (exchangeNumber: number, n: number, accepted_at: string, over: Partial<EvidencePayload> = {}): CreateEvidenceRequest => {
    const payload: EvidencePayload = {
      schema: "fusion.evidence/v1",
      id: evidenceId(n),
      workbench_id: WB_ID,
      subject: { git_tree: SUBJECT_TREE, git_range: null },
      brief_revision: revisionAt(PKG_MD),
      // No plan was adopted on P: L was created in its container and never made the plan in force.
      plan_revision: null,
      role: { profile: "reviewer", version: "12.0.0" },
      host: "claude-code",
      execution_policy: "claude-guided",
      verdict: "accept",
      uncertainties: [],
      checks: [{ id: "tests-green", result: "pass", detail: null }],
      report: { path: REPORT, sha256: revisionOf(REPORT_BYTES), kind: "review" },
      predecessor: null,
      accepted_at,
      extensions: {},
      ...over,
    };
    sent.set(n, payload);
    return { op: "create", workbench: root, operation_id: op(exchangeNumber), id: evidenceId(n), kind: "evidence", scope: { container: PKG_DIR, store: "reviews" }, payload };
  };

  const changed = { path: REPORT, sha256: revisionOf(REPORT_CHANGED_BYTES), kind: "review" };

  seedBefore("11-create", new Map([[REPORT, REPORT_BYTES]]));
  send("11-create", evidence(11, 1, "2026-09-29T16:00:00Z"));
  // E1's revision is computed from the payload and not read from the disk, so a
  // stale seed leaves 11 refused and the session running: the cases below then
  // fail by name. That 11 answered this revision is a case of its own.
  const first: RecordRef = { ...refTo(evidenceId(1)), revision: revisionOf(Buffer.from(serialise(sent.get(1) as EvidencePayload), "utf-8")) };
  const create12 = evidence(12, 2, "2026-09-29T16:10:00Z", { predecessor: first });
  send("12-create", create12);
  send("13-create", evidence(13, 3, "2026-09-29T16:20:00Z", { predecessor: first }));
  send("14-create", create12);
  send("15-show", { op: "show", workbench: root, record: { path: FIRST } } satisfies ShowRequest);
  send("16-create", evidence(16, 4, "2026-09-29T16:30:00Z"));
  send("17-create", evidence(17, 5, "2026-09-29T16:40:00Z", { report: changed }));

  // --- the plan closed ---
  send("18-transition", progress(18, "closed", "FJ02b: the plan closed early, as a plan may be", undefined));
  send("19-transition", progress(19, "closed", "FJ02b: progress written into a closed plan", { steps: [{ id: "s3", state: "in_progress" }] }));

  // --- the report replaced ---
  seedBefore("20-create", new Map([[REPORT, REPORT_CHANGED_BYTES]]));
  send("20-create", evidence(20, 6, "2026-09-29T16:50:00Z", { predecessor: first, report: changed }));
}, 120_000);

afterAll(() => {
  session.stop();
});

// --- what each exchange answered ---------------------------------------------------------

const planControl = (r: Record<string, unknown>): { state: string; steps: unknown; criteria: unknown; acceptance: unknown } =>
  (r.control as { control: { state: string; steps: unknown; criteria: unknown; acceptance: unknown } }).control;

describe("the twenty FJ02b exchanges through bin/fusion-record", () => {
  it("every exchange was answered: exit 0, one line on stdout, nothing on stderr", () => {
    expect(exchanges.map((e) => e.name)).toEqual([...NAMES]);
    for (const e of exchanges) {
      expect(e.status, `${e.name}: ${e.stderr}`).toBe(0);
      expect(e.stderr, e.name).toBe("");
      expect(e.stdout.endsWith("\n"), e.name).toBe(true);
      expect(e.stdout.trim().split("\n"), e.name).toHaveLength(1);
    }
  });

  it("the operation ids follow the exchange numbers, and the two replays carry the id of what they repeat", () => {
    const ids = new Map(exchanges.filter((e) => e.request.operation_id !== undefined).map((e) => [e.name, e.request.operation_id]));
    for (const [name, id] of ids) {
      const n = Number(name.slice(0, 2));
      expect(id, name).toBe(op(name === "05-transition" ? 4 : name === "14-create" ? 12 : n));
    }
    expect([...ids.keys()]).toEqual(NAMES.filter((n) => !n.endsWith("-show")));
  });

  it("01 and 02: the package, then a plan in its container with three open steps and two unevaluated criteria", () => {
    expect(result(byName("01-create"))).toMatchObject({ operation_id: op(1), path: PKG, kind: "package", narrative: { path: PKG_MD, sha256: revisionOf(Buffer.from(PKG_CONTENT, "utf-8")) } });
    expect(result(byName("02-create"))).toMatchObject({ operation_id: op(2), path: PLAN, kind: "plan", narrative: { path: PLAN_MD } });
  });

  it("03: the state change carries progress, open to in_progress with s1 in_progress", () => {
    expect(result(byName("03-transition"))).toMatchObject({ path: PLAN, from: "open", to: "in_progress", previous_revision: result(byName("02-create")).revision });
  });

  it("04: progress only, in_progress to in_progress, against the revision 03 returned", () => {
    const r = result(byName("04-transition"));
    expect(r).toMatchObject({ path: PLAN, from: "in_progress", to: "in_progress", previous_revision: result(byName("03-transition")).revision });
    expect(r.revision).not.toBe(r.previous_revision);
    expect(Object.keys(r)).toEqual(["operation_id", "path", "from", "to", "revision", "previous_revision"]);
  });

  it("05, 04 repeated: the stored answer, byte-identical to 04's", () => {
    expect(byName("05-transition").request).toEqual(byName("04-transition").request);
    expect(byName("05-transition").stdout).toBe(byName("04-transition").stdout);
  });

  it("06 show: the named entries replaced in place, s3 open and c2 null as stored, the order kept, at 04's revision", () => {
    const r = result(byName("06-show"));
    expect(r.revision).toBe(result(byName("04-transition")).revision);
    expect(planControl(r)).toEqual({
      state: "in_progress",
      steps: [
        { id: "s1", state: "done" },
        { id: "s2", state: "in_progress" },
        { id: "s3", state: "open" },
      ],
      criteria: [
        { id: "c1", met: true },
        { id: "c2", met: null },
      ],
      acceptance: null,
    });
  });

  for (const [name, expected] of REFUSED) {
    it(`${name}: ${expected.class}/${expected.reason}, nothing written`, () => {
      expect(refusalOf(name)).toMatchObject(expected);
      const { before, after } = around.get(name) as { before: Map<string, Buffer>; after: Map<string, Buffer> };
      expect([...after.keys()], name).toEqual([...before.keys()]);
      for (const [path, bytes] of before) expect((after.get(path) as Buffer).equals(bytes), `${name}: ${path}`).toBe(true);
      const id = byName(name).request.operation_id as string;
      expect(existsSync(join(root, ".json-state", "ops", `${id}.json`)), `${name}: a refusal stores no answer`).toBe(false);
    });
  }

  it("07 to 10: each refusal names what it refused", () => {
    expect(byName("07-transition").request.expected_revision).toBe(result(byName("03-transition")).revision);
    expect(refusalOf("07-transition").detail).toContain(String(result(byName("04-transition")).revision));
    expect(refusalOf("08-transition").detail).toContain("step s1");
    expect(refusalOf("09-transition").detail).toContain("s2");
    expect(refusalOf("10-transition").detail).toContain("s9");
  });

  it("11 create: the first record beside its report, the bytes the payload serialises to", () => {
    const r = result(byName("11-create"));
    expect(r).toEqual({ operation_id: op(11), path: FIRST, kind: "evidence", revision: revisionOf(Buffer.from(serialise(sent.get(1) as EvidencePayload), "utf-8")), report: { path: REPORT, sha256: revisionOf(REPORT_BYTES) } });
    expect(bytesAt(root, FIRST).toString("utf-8")).toBe(serialise(sent.get(1) as EvidencePayload));
  });

  it("12 and 13: two corrections of E1 over the unchanged report, counters 2 and 3", () => {
    expect(result(byName("12-create"))).toMatchObject({ operation_id: op(12), path: correction(2), kind: "evidence", report: { path: REPORT, sha256: revisionOf(REPORT_BYTES) } });
    expect(result(byName("13-create"))).toMatchObject({ operation_id: op(13), path: correction(3), kind: "evidence", report: { path: REPORT, sha256: revisionOf(REPORT_BYTES) } });
    expect(bytesAt(root, correction(2)).toString("utf-8")).toBe(serialise(sent.get(2) as EvidencePayload));
    expect(bytesAt(root, correction(3)).toString("utf-8")).toBe(serialise(sent.get(3) as EvidencePayload));
  });

  it("14, 12 repeated after 13 landed: the stored answer, byte-identical to 12's, counter 2", () => {
    expect(byName("14-create").request).toEqual(byName("12-create").request);
    expect(byName("14-create").stdout).toBe(byName("12-create").stdout);
    expect(result(byName("14-create")).path).toBe(correction(2));
  });

  it("15 show: E1 at the revision 11 answered, its report named at the recorded hash", () => {
    const r = result(byName("15-show"));
    expect(r).toMatchObject({ path: FIRST, kind: "evidence", revision: result(byName("11-create")).revision });
    expect(r.control).toEqual(sent.get(1));
  });

  it("16 and 17: a record without a predecessor is never read as a correction, and a hash the report does not have is refused before the path is chosen", () => {
    expect(refusalOf("16-create").detail).toContain(FIRST);
    expect((sent.get(5) as EvidencePayload).report.sha256).not.toBe(revisionOf(bytesAt(SEED, `11-create/${REPORT}`)));
  });

  it("18 and 19: the plan closes with its progress as it stood, and a closed plan takes none", () => {
    expect(result(byName("18-transition"))).toMatchObject({ path: PLAN, from: "in_progress", to: "closed", previous_revision: result(byName("04-transition")).revision });
    expect(refusalOf("19-transition").detail).toContain("terminal");
  });

  it("20: the report on disk is at the hash the payload names, and the predecessor recorded the other one", () => {
    const refusal = refusalOf("20-create");
    expect(revisionOf(bytesAt(root, REPORT))).toBe((sent.get(6) as EvidencePayload).report.sha256);
    expect(refusal.detail).toContain(revisionOf(REPORT_BYTES));
    expect(refusal.detail).toContain(revisionOf(REPORT_CHANGED_BYTES));
  });

  it("at the end the reviews store holds the report and the three records that landed, each as it was written", () => {
    expect(readdirSync(join(root, REVIEWS)).sort()).toEqual([FIRST, correction(2), correction(3), REPORT].map((p) => p.slice(REVIEWS.length + 1)).sort());
    expect(revisionAt(FIRST)).toBe(result(byName("11-create")).revision);
    expect(revisionAt(correction(2))).toBe(result(byName("12-create")).revision);
    expect(revisionAt(correction(3))).toBe(result(byName("13-create")).revision);
  });
});

// --- the recorded session ------------------------------------------------------------------

describe(`the recorded session under fixtures/protocol-session-fj02b/ (${UPDATE ? "REGENERATING" : "golden"})`, () => {
  it("no recorded byte carries the temp path, and the placeholder round-trips", () => {
    for (const e of exchanges) {
      const req = record(requestBytes(e.request));
      const res = record(e.stdout);
      expect(req, e.name).not.toContain(root);
      expect(res, e.name).not.toContain(root);
      expect(req, e.name).not.toContain(tmp);
      expect(res, e.name).not.toContain(tmp);
      expect(replay(req), e.name).toBe(requestBytes(e.request));
      expect(replay(res), e.name).toBe(e.stdout);
      // The root stands in every request and in no answer of this session.
      expect(req, e.name).toContain(PLACEHOLDER);
      expect(res, e.name).not.toContain(PLACEHOLDER);
    }
  });

  for (const name of NAMES) {
    it(`${name}: the recorded request and response equal the fresh exchange`, () => {
      const { requestFile, responseFile, freshRequest, freshResponse } = session.fresh(name);
      const missing = [requestFile, responseFile].filter((f) => !existsSync(f));
      expect(missing, `recorded session incomplete: ${missing.join(", ")}.\nFIX: run \`${FIX} npm test -- round-trip-cli-fj02b\` in codec/ and commit fixtures/protocol-session-fj02b/.`).toEqual([]);
      expect(readFileSync(requestFile, "utf-8"), `${name}.request.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with ${FIX} and commit the files; the Prior side replays them.`).toBe(freshRequest);
      expect(readFileSync(responseFile, "utf-8"), `${name}.response.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with ${FIX} and commit the files; the Prior side replays them.`).toBe(freshResponse);
    });
  }

  for (const name of SEEDED) {
    it(`seed/${name}/ holds exactly the report bytes the run produces`, () => {
      const expected = expectedSeeds.get(name);
      expect(expected, `no seed was computed for ${name}`).toBeDefined();
      const dir = join(SEED, name);
      expect(filesUnder(dir), `seed/${name}/ is not the computed file set. If the report changed on purpose, regenerate with ${FIX}.`).toEqual([REPORT]);
      expect([...(expected as Map<string, Buffer>).keys()]).toEqual([REPORT]);
      for (const [path, bytes] of expected as Map<string, Buffer>) {
        expect(bytesAt(dir, path).equals(bytes), `seed/${name}/${path} differs from what the run produces. If the report changed on purpose, regenerate with ${FIX}.`).toBe(true);
      }
    });
  }

  it("the two seeds hold one path at two different contents", () => {
    expect(bytesAt(SEED, `11-create/${REPORT}`).equals(bytesAt(SEED, `20-create/${REPORT}`))).toBe(false);
  });

  it("the recorded set is exactly the twenty pairs, a README and seed/", () => {
    const files = readdirSync(SESSION).sort();
    const expected = ["README.md", "seed", ...NAMES.flatMap((n) => [`${n}.request.json`, `${n}.response.json`])].sort();
    expect(files).toEqual(expected);
    expect(readdirSync(SEED).sort()).toEqual([...SEEDED].sort());
  });
});

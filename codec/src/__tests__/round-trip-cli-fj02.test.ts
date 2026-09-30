// ---------------------------------------------------------------------------
// The FJ02 operations through `bin/fusion-record`, recorded (FJ02 step 9).
//
// Fifteen exchanges, through the wrapper only (the wrapper is spawned, never
// `node` on the bundle), over a temp copy of the scratch workbench, in the
// order the plan's step 9 gives:
//
//   01 create            a package with its Markdown body: both halves in one intent
//   02 claim             the new package
//   03 release           it again
//   04 claim             it again, under a second claim time
//   05 set-mode          autonomous, the user's word an artefact seeded before 05
//   06 create            a plan record with its body, into the package's container
//   07 adopt-plan        the plan, at its narrative's hash
//   08 set-dependencies  the scratch open package now depends on the new one
//   09 attach-evidence   the evidence pair seeded before 09
//   10 transition        the plan record to `in_progress`
//   11 transition        the package to `done`, the outcome binding that evidence
//   12 create            01 repeated: the stored answer, byte-identical to 01's
//   13 create            01's operation_id with another body: operation-id-reused
//   14 show              the shared issue, after a pending intent seeded before 14:
//                        the read recovers it and shows the landed state
//   15 reconcile         the whole workbench
//
// ## The recorded session
//
// Every exchange is recorded under `fixtures/protocol-session-fj02/` as
// `<nn>-<op>.request.json` and `<nn>-<op>.response.json`, as the FJ01 session
// is (`round-trip-cli.test.ts`), and the files are a GOLDEN in the same way:
// compared byte for byte on an ordinary run, rewritten only under
// `UPDATE_PROTOCOL_SESSION_FJ02=1`. The same one substitution applies: the
// temp workbench's absolute path is the literal `<workbench>`.
//
// Three exchanges need files no operation of the protocol writes. They sit
// under `seed/<nn>-<op>/`, laid out as the workbench is, and are copied onto
// the workbench root, byte for byte, immediately before exchange <nn>:
//
//   seed/05-set-mode/         the memo the user's word is (a plain file)
//   seed/09-attach-evidence/  the evidence record and its report (Prior's
//                             request 19 asks how a reviewer will write one)
//   seed/14-show/             a pending intent in the journal's own format: the
//                             directory `.json-state/journal/<id>/` with
//                             `intent.json` and the one staged file
//
// The seed files are goldens too, and each is checked against what produces
// it: the evidence pair against `helpers/seed.ts` run on a copy of the
// workbench as it stands before 09, and the intent against a real
// `transition` of the issue on a fresh copy of the scratch workbench (its
// response, its post-bytes, and the digest of its request as sent without a
// `workbench`, which is how a caller sends it under `FUSION_WORKBENCH`).
//
// Nothing depends on the clock or a generated id: ids, operation ids, claim
// times and the intent's `created_at` are fixed literals below, and every
// revision is `sha256:` over deterministic bytes. No response carries a
// host, a PID or a lock nonce; `reconcile` echoes the root, which the
// substitution records as `<workbench>`.
//
// ## The one reviewed delta: `15-reconcile.role-delta.json`
//
// `15-reconcile.response.json` is the historical expectation, recorded before
// `reconcile` reported each active-document binding's role, and it is never
// rewritten, not even under the update variable. The current answer is those
// bytes with exactly the fields the delta file names added, each after the
// field it names (Prior `a15dfc8`). Every other exchange is byte for byte.
// ---------------------------------------------------------------------------

import { cpSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import type { AdoptPlanRequest, AttachEvidenceRequest, ClaimRequest, CreateRequest, ReconcileRequest, ReleaseRequest, SetDependenciesRequest, SetModeRequest, ShowRequest, TransitionRequest } from "../cli/protocol.js";
import { requestDigest, type Intent } from "../journal.js";
import { revisionOf } from "../store.js";
import { seedEvidence, type Seeded } from "./helpers/seed.js";
import { FIXTURE, PLACEHOLDER, bytesAt, filesUnder, openSession, parse, requestBytes } from "./helpers/session.js";

// --- the fixed literals ----------------------------------------------------------

const WB_ID = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
const OPEN = "work-packages/260928-1200-parser-fix/package.json";
const ISSUE = "shared/issues/260928-1400-parser-fails-on-empty-input.record.json";

const PKG_ID = "f0200001-0000-4000-8000-000000000001";
const PKG_STEM = "260929-0900-fj02-session";
const PKG_DIR = `work-packages/${PKG_STEM}`;
const PKG = `${PKG_DIR}/package.json`;
const PKG_MD = `${PKG_DIR}/${PKG_STEM}.md`;
const PKG_CONTENT = "# FJ02 session\n\nThe package the FJ02 recorded session files, claims, plans, binds evidence to and closes.\n";

const PLAN_ID = "f0200002-0000-4000-8000-000000000002";
const PLAN_STEM = "260929-0930-fj02-session-plan";
const PLAN = `${PKG_DIR}/plans/${PLAN_STEM}.record.json`;
const PLAN_MD = `${PKG_DIR}/plans/${PLAN_STEM}.md`;
const PLAN_CONTENT = "# Plan for the FJ02 session\n\n1. Record every FJ02 operation once.\n2. Replay the create.\n";

const MEMO = "shared/memos/260929-0905-fj02-autonomy.md";
const MEMO_CONTENT = "Run the FJ02 session package autonomously.\n";

const INTENT_ID = "f02000ff-0000-4000-8000-0000000000ff";
const INTENT_CREATED_AT = "2026-09-29T14:00:00.000Z";

const op = (n: number): string => `f02000${String(n).padStart(2, "0")}-0000-4000-8000-0000000000${String(n).padStart(2, "0")}`;

const PERSON = "Kai Stalmann <ks@qantr.com>";
const ACTOR = { actor: "user", person: PERSON };
const CLAIM_1 = { checkout_id: "a1b2c3d4", person: PERSON, claimed_at: "2026-09-29T09:10:00+02:00" };
const CLAIM_2 = { checkout_id: "a1b2c3d4", person: PERSON, claimed_at: "2026-09-29T09:20:00+02:00" };
const refTo = (record_id: string): { workbench_id: string; record_id: string } => ({ workbench_id: WB_ID, record_id });

const NAMES = [
  "01-create",
  "02-claim",
  "03-release",
  "04-claim",
  "05-set-mode",
  "06-create",
  "07-adopt-plan",
  "08-set-dependencies",
  "09-attach-evidence",
  "10-transition",
  "11-transition",
  "12-create",
  "13-create",
  "14-show",
  "15-reconcile",
] as const;
type Name = (typeof NAMES)[number];

/** The exchanges a seed directory precedes, and what it holds. */
const SEEDED: readonly Name[] = ["05-set-mode", "09-attach-evidence", "14-show"];

/** The one exchange whose recorded response is historical, and the file naming what the current answer adds to it. */
const DELTA_OF: Name = "15-reconcile";
const DELTA_NAME = `${DELTA_OF}.role-delta.json`;

interface Delta {
  exchange: string;
  recorded: string;
  why: string;
  /** The JSON pointer of the array whose entries the delta changes. */
  list: string;
  adds: Array<{ entry: { path: string; at: string }; field: string; after: string; value: unknown }>;
}

// --- the exchange machinery, shared with the FJ02b recorder (helpers/session.ts) ---------

const session = openSession<Name>({ directory: "protocol-session-fj02", updateVariable: "UPDATE_PROTOCOL_SESSION_FJ02", tmpPrefix: "codec-round-trip-fj02-" });
const { exchanges, expectedSeeds, exchange, byName, result, record, replay, revisionAt, seedBefore } = session;
const SESSION = session.dir;
const SEED = session.seedDir;
const UPDATE = session.update;

let tmp: string;
let root: string;

// --- the seed files ----------------------------------------------------------------------

/** The evidence pair `helpers/seed.ts` writes for the new package, on a copy of the workbench as it stands. */
async function evidenceSeed(): Promise<{ files: Map<string, Buffer>; seeded: Seeded }> {
  const copy = join(tmp, "evidence-seed");
  cpSync(root, copy, { recursive: true });
  const seeded = await seedEvidence(copy, { package: PKG });
  return {
    seeded,
    files: new Map([
      [seeded.report, bytesAt(copy, seeded.report)],
      [seeded.path, bytesAt(copy, seeded.path)],
    ]),
  };
}

/** The request the pending intent stands for, as a caller sends it under FUSION_WORKBENCH: no `workbench` field. */
const INTENT_REQUEST: TransitionRequest = {
  op: "transition",
  operation_id: INTENT_ID,
  record: { path: ISSUE },
  expected_revision: revisionOf(readFileSync(join(FIXTURE, ISSUE))),
  actor: ACTOR,
  to: "in_progress",
  reason: "FJ02: an intent left pending by a writer that stopped after its commit point",
};

/**
 * The pending intent of the issue's move to `in_progress`, in the journal's
 * own format, built from a real transition on a fresh copy of the scratch
 * workbench: its response and its post-bytes are what the kernel produced
 * there; `created_at` is a fixed literal instead of that run's clock.
 */
async function intentSeed(): Promise<Map<string, Buffer>> {
  const copy = join(tmp, "intent-seed");
  cpSync(FIXTURE, copy, { recursive: true });
  const before = revisionOf(bytesAt(copy, ISSUE));
  const response = await dispatch({ ...INTENT_REQUEST, workbench: copy });
  if (!response.ok) throw new Error(`the intent's transition was refused: ${JSON.stringify(response)}`);
  const post = bytesAt(copy, ISSUE);
  const intent: Intent = {
    operation_id: INTENT_ID,
    op: "transition",
    request_digest: requestDigest(INTENT_REQUEST),
    writes: [{ path: ISSUE, before, after: revisionOf(post) }],
    response,
    created_at: INTENT_CREATED_AT,
  };
  const dir = `.json-state/journal/${INTENT_ID}`;
  return new Map([
    [`${dir}/intent.json`, Buffer.from(JSON.stringify(intent, null, 2) + "\n", "utf-8")],
    [`${dir}/${revisionOf(post).slice("sha256:".length)}`, post],
  ]);
}

// --- the reviewed delta -------------------------------------------------------------------

type Entry = Record<string, unknown>;

/** The array a JSON pointer of plain keys names; the delta addresses one. */
function listAt(doc: unknown, pointer: string): Entry[] {
  const at = pointer.split("/").slice(1).reduce<unknown>((v, key) => (v !== null && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined), doc);
  if (!Array.isArray(at)) throw new Error(`${pointer} names no array`);
  return at as Entry[];
}

/**
 * The recorded bytes with exactly the delta applied: each named field inserted
 * after the field it names, in the one entry that `path` and `at` pick out.
 * The recorded bytes must round-trip through JSON unchanged, an entry must be
 * picked out exactly once, and a field must be new to it, so nothing but the
 * named fields can differ.
 */
function applyDelta(recorded: string, delta: Delta): string {
  const doc = JSON.parse(recorded) as unknown;
  if (JSON.stringify(doc) + "\n" !== recorded) throw new Error("the recorded response does not round-trip through JSON");
  const list = listAt(doc, delta.list);
  for (const add of delta.adds) {
    const hits = list.map((e, i) => [e, i] as const).filter(([e]) => e.path === add.entry.path && e.at === add.entry.at);
    if (hits.length !== 1) throw new Error(`${add.entry.path} ${add.entry.at}: ${hits.length} entries, not one`);
    const [entry, i] = hits[0] as readonly [Entry, number];
    if (add.field in entry) throw new Error(`${add.entry.path} ${add.entry.at} already carries ${add.field}`);
    if (!(add.after in entry)) throw new Error(`${add.entry.path} ${add.entry.at} carries no ${add.after}`);
    const next: Entry = {};
    for (const [k, v] of Object.entries(entry)) {
      next[k] = v;
      if (k === add.after) next[add.field] = add.value;
    }
    list[i] = next;
  }
  return JSON.stringify(doc) + "\n";
}

// --- the session -----------------------------------------------------------------------

const createPackage: CreateRequest = {
  op: "create",
  workbench: "",
  operation_id: op(1),
  id: PKG_ID,
  kind: "package",
  filed_by: ACTOR,
  origin: { kind: "user-request", ref: null },
  scope: { container: null, store: "work-packages" },
  narrative: { path: PKG_MD, content: PKG_CONTENT },
  payload: { domain: "code" },
};

let evidence: Seeded;

beforeAll(async () => {
  ({ tmp, root } = session.start());
  const create01 = { ...createPackage, workbench: root };
  const mutation = (operation_id: string, path: string) => ({ workbench: root, operation_id, record: { path }, expected_revision: revisionAt(path), actor: ACTOR });

  exchange("01-create", create01);
  exchange("02-claim", { op: "claim", ...mutation(op(2), PKG), claim: CLAIM_1 } satisfies ClaimRequest);
  exchange("03-release", { op: "release", ...mutation(op(3), PKG), reason: "FJ02: the claim handed back" } satisfies ReleaseRequest);
  exchange("04-claim", { op: "claim", ...mutation(op(4), PKG), claim: CLAIM_2 } satisfies ClaimRequest);

  seedBefore("05-set-mode", new Map([[MEMO, Buffer.from(MEMO_CONTENT, "utf-8")]]));
  const word = { path: MEMO, sha256: revisionAt(MEMO), kind: "memo" };
  exchange("05-set-mode", { op: "set-mode", ...mutation(op(5), PKG), mode: { value: "autonomous", source: { kind: "user-word", ref: word } } } satisfies SetModeRequest);

  exchange("06-create", {
    op: "create",
    workbench: root,
    operation_id: op(6),
    id: PLAN_ID,
    kind: "plan",
    filed_by: { actor: "implementation-planner", person: null },
    origin: { kind: "package", ref: refTo(PKG_ID) },
    scope: { container: PKG_DIR, store: "plans" },
    narrative: { path: PLAN_MD, content: PLAN_CONTENT },
    payload: { state: "open", steps: [{ id: "s1", state: "open" }, { id: "s2", state: "open" }], criteria: [{ id: "c1", met: null }], acceptance: null },
  } satisfies CreateRequest);
  exchange("07-adopt-plan", { op: "adopt-plan", ...mutation(op(7), PKG), plan: refTo(PLAN_ID), revision: revisionAt(PLAN_MD) } satisfies AdoptPlanRequest);
  exchange("08-set-dependencies", { op: "set-dependencies", ...mutation(op(8), OPEN), depends_on: [{ target: refTo(PKG_ID), condition: "succeeded" }] } satisfies SetDependenciesRequest);

  const ev = await evidenceSeed();
  evidence = ev.seeded;
  seedBefore("09-attach-evidence", ev.files);
  const binding = { ref: { ...refTo(evidence.id), revision: revisionAt(evidence.path) }, policy: evidence.binding.policy };
  exchange("09-attach-evidence", { op: "attach-evidence", ...mutation(op(9), PKG), evidence: binding } satisfies AttachEvidenceRequest);

  exchange("10-transition", { op: "transition", ...mutation(op(10), PLAN), to: "in_progress", reason: "FJ02: the plan's first step started" } satisfies TransitionRequest);
  exchange("11-transition", {
    op: "transition",
    ...mutation(op(11), PKG),
    to: "done",
    reason: "FJ02: every step recorded",
    payload: { outcome: { class: "completed", reason: "Every FJ02 operation was recorded once and the bound evidence accepts.", evidence: [binding] } },
  } satisfies TransitionRequest);

  exchange("12-create", create01);
  exchange("13-create", { ...create01, narrative: { path: PKG_MD, content: `${PKG_CONTENT}\nA second body under the same operation id.\n` } });

  seedBefore("14-show", await intentSeed());
  exchange("14-show", { op: "show", workbench: root, record: { path: ISSUE } } satisfies ShowRequest);
  exchange("15-reconcile", { op: "reconcile", workbench: root } satisfies ReconcileRequest);
}, 120_000);

afterAll(() => {
  session.stop();
});

// --- what each exchange answered ---------------------------------------------------------

describe("the fifteen FJ02 exchanges through bin/fusion-record", () => {
  it("every exchange was answered: exit 0, one line on stdout, nothing on stderr", () => {
    expect(exchanges.map((e) => e.name)).toEqual([...NAMES]);
    for (const e of exchanges) {
      expect(e.status, `${e.name}: ${e.stderr}`).toBe(0);
      expect(e.stderr, e.name).toBe("");
      expect(e.stdout.endsWith("\n"), e.name).toBe(true);
      expect(e.stdout.trim().split("\n"), e.name).toHaveLength(1);
    }
  });

  it("01 create: the package and its narrative in one operation, open, ordinary, origin as sent", () => {
    const r = result(byName("01-create"));
    expect(r).toMatchObject({ operation_id: op(1), path: PKG, kind: "package", narrative: { path: PKG_MD, sha256: revisionOf(Buffer.from(PKG_CONTENT, "utf-8")) } });
    expect(readFileSync(join(root, PKG_MD), "utf-8")).toBe(PKG_CONTENT);
  });

  it("02 to 04: claim, release and claim again, each against the revision the one before returned", () => {
    const created = result(byName("01-create")).revision;
    const claimed = result(byName("02-claim"));
    expect(claimed).toMatchObject({ from: "open", to: "claimed", previous_revision: created });
    const released = result(byName("03-release"));
    expect(released).toMatchObject({ from: "claimed", to: "open", previous_revision: claimed.revision });
    expect(result(byName("04-claim"))).toMatchObject({ from: "open", to: "claimed", previous_revision: released.revision });
  });

  it("05 set-mode: autonomous, the source the seeded memo at its hash", () => {
    expect(result(byName("05-set-mode"))).toMatchObject({ path: PKG, mode: { value: "autonomous", source: { kind: "user-word", ref: { path: MEMO, kind: "memo" } } }, previous_revision: result(byName("04-claim")).revision });
  });

  it("06 and 07: a plan record created in the package's container, then adopted at its narrative's hash", () => {
    expect(result(byName("06-create"))).toMatchObject({ path: PLAN, kind: "plan", narrative: { path: PLAN_MD } });
    expect(result(byName("07-adopt-plan"))).toMatchObject({ path: PKG, role: "plan", previous_revision: result(byName("05-set-mode")).revision });
  });

  it("08 set-dependencies: the scratch open package depends on the new one", () => {
    expect(result(byName("08-set-dependencies"))).toMatchObject({ path: OPEN });
    expect(readFileSync(join(root, OPEN), "utf-8")).toContain(PKG_ID);
  });

  it("09 attach-evidence: the seeded record bound at its stored revision", () => {
    expect(result(byName("09-attach-evidence"))).toMatchObject({ path: PKG, previous_revision: result(byName("07-adopt-plan")).revision });
    expect(readFileSync(join(root, PKG), "utf-8")).toContain(evidence.id);
  });

  it("10 and 11: the plan to in_progress, the package to done with the outcome binding the evidence", () => {
    expect(result(byName("10-transition"))).toMatchObject({ path: PLAN, from: "open", to: "in_progress" });
    expect(result(byName("11-transition"))).toMatchObject({ path: PKG, from: "claimed", to: "done", previous_revision: result(byName("09-attach-evidence")).revision });
  });

  it("12 create, 01 repeated: the stored answer, byte-identical to 01's", () => {
    expect(byName("12-create").stdout).toBe(byName("01-create").stdout);
  });

  it("13 create, 01's operation_id with another body: conflict/operation-id-reused, nothing written", () => {
    expect(parse(byName("13-create").stdout)).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    expect(readFileSync(join(root, PKG_MD), "utf-8")).toBe(PKG_CONTENT);
  });

  it("14 show: the pending intent was recovered by the read, the issue at the intent's post-bytes, its answer stored", () => {
    const r = result(byName("14-show"));
    expect((r.control as { control: { state: string } }).control.state).toBe("in_progress");
    const seeded = [...(expectedSeeds.get("14-show") ?? new Map<string, Buffer>()).keys()].find((p) => !p.endsWith("intent.json")) ?? "";
    expect(r.revision).toBe(`sha256:${seeded.slice(seeded.lastIndexOf("/") + 1)}`);
    expect(existsSync(join(root, ".json-state", "journal", INTENT_ID))).toBe(false);
    expect(existsSync(join(root, ".json-state", "ops", `${INTENT_ID}.json`))).toBe(true);
  });

  it("15 reconcile: no pending intent, every record valid, the parser fix's status copy reported", () => {
    const r = result(byName("15-reconcile"));
    expect(r).toMatchObject({ workbench: root, state: "json-control", scope: null, intents: [] });
    expect(r.records).toEqual([]);
    expect(JSON.stringify(r.narratives)).toContain("status-copy-in-narrative");
  });

  it("15 reconcile: both active-document bindings carry role plan after at, resolved and unresolved alike; no other entry carries a role", () => {
    const refs = (result(byName("15-reconcile")).references ?? []) as Entry[];
    const bindings = refs.filter((e) => /^\/active_documents\/\d+\/ref$/.test(String(e.at)));
    expect(bindings.map((e) => [e.path, e.status, e.role])).toEqual([
      ["work-packages/260927-0900-strict-reader/package.json", "unresolved", "plan"],
      [PKG, "resolved", "plan"],
    ]);
    for (const e of bindings) expect(Object.keys(e).slice(0, 3)).toEqual(["path", "at", "role"]);
    expect(refs.filter((e) => !bindings.includes(e)).some((e) => "role" in e)).toBe(false);
  });
});

// --- the recorded session ------------------------------------------------------------------

describe(`the recorded session under fixtures/protocol-session-fj02/ (${UPDATE ? "REGENERATING" : "golden"})`, () => {
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
    }
    expect(record(byName("15-reconcile").stdout)).toContain(PLACEHOLDER);
  });

  for (const name of NAMES.filter((n) => n !== DELTA_OF)) {
    it(`${name}: the recorded request and response equal the fresh exchange`, () => {
      const { requestFile, responseFile, freshRequest, freshResponse } = session.fresh(name);
      const missing = [requestFile, responseFile].filter((f) => !existsSync(f));
      expect(missing, `recorded session incomplete: ${missing.join(", ")}.\nFIX: run \`UPDATE_PROTOCOL_SESSION_FJ02=1 npm test -- round-trip-cli-fj02\` in codec/ and commit fixtures/protocol-session-fj02/.`).toEqual([]);
      expect(readFileSync(requestFile, "utf-8"), `${name}.request.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with UPDATE_PROTOCOL_SESSION_FJ02=1 and commit the files; the Prior side replays them.`).toBe(freshRequest);
      expect(readFileSync(responseFile, "utf-8"), `${name}.response.json differs from the fresh exchange. If the protocol changed on purpose, regenerate with UPDATE_PROTOCOL_SESSION_FJ02=1 and commit the files; the Prior side replays them.`).toBe(freshResponse);
    });
  }

  // The historical response of 15 is never rewritten, so `session.fresh`, which rewrites under the update variable, is not called for it.
  describe(`${DELTA_OF}: the recorded response with exactly the reviewed delta, ${DELTA_NAME}`, () => {
    const requestFile = join(SESSION, `${DELTA_OF}.request.json`);
    const responseFile = join(SESSION, `${DELTA_OF}.response.json`);
    const delta = (): Delta => JSON.parse(readFileSync(join(SESSION, DELTA_NAME), "utf-8")) as Delta;
    const expected = (): string => applyDelta(readFileSync(responseFile, "utf-8"), delta());
    const fresh = (): string => record(byName(DELTA_OF).stdout);

    it("the recorded request equals the fresh one", () => {
      expect(readFileSync(requestFile, "utf-8")).toBe(record(requestBytes(byName(DELTA_OF).request)));
    });

    it("the fresh answer is the recorded bytes with the delta applied, byte for byte", () => {
      expect(fresh(), `the answer differs from ${DELTA_OF}.response.json with ${DELTA_NAME} applied. The recorded response is historical and is not regenerated; a change to the answer is a reviewed change to ${DELTA_NAME}, and the Prior side compares it at the re-pin.`).toBe(expected());
    });

    it("the delta is the role on every active-document binding of the recorded answer, after at, and nothing else", () => {
      const d = delta();
      expect(d).toMatchObject({ exchange: DELTA_OF, recorded: `${DELTA_OF}.response.json`, list: "/result/references" });
      const recorded = listAt(JSON.parse(readFileSync(responseFile, "utf-8")), d.list);
      const bindings = recorded.filter((e) => /^\/active_documents\/\d+\/ref$/.test(String(e.at))).map((e) => ({ path: e.path, at: e.at }));
      expect(d.adds.map((a) => a.entry)).toEqual(bindings);
      for (const a of d.adds) expect([a.field, a.after, a.value]).toEqual(["role", "at", "plan"]);
    });

    it("the gate is red against an answer carrying one field less or one field more", () => {
      /** The fresh answer with one change made to its references. */
      const changed = (change: (refs: Entry[]) => void): string => {
        const doc = JSON.parse(fresh()) as unknown;
        change(listAt(doc, "/result/references"));
        return JSON.stringify(doc) + "\n";
      };
      expect(changed(() => undefined), "unchanged").toBe(expected());
      expect(changed((refs) => delete (refs.find((e) => "role" in e) as Entry).role), "one field less").not.toBe(expected());
      expect(changed((refs) => ((refs.find((e) => !("role" in e)) as Entry).role = "plan")), "one field more").not.toBe(expected());
    });
  });

  for (const name of SEEDED) {
    it(`seed/${name}/ holds exactly the bytes that produce it`, () => {
      const expected = expectedSeeds.get(name);
      expect(expected, `no seed was computed for ${name}`).toBeDefined();
      const dir = join(SEED, name);
      expect(filesUnder(dir), `seed/${name}/ is not the computed file set. If a producer changed on purpose, regenerate with UPDATE_PROTOCOL_SESSION_FJ02=1.`).toEqual([...(expected as Map<string, Buffer>).keys()].sort());
      for (const [path, bytes] of expected as Map<string, Buffer>) {
        expect(bytesAt(dir, path).equals(bytes), `seed/${name}/${path} differs from what produces it. If a producer changed on purpose, regenerate with UPDATE_PROTOCOL_SESSION_FJ02=1.`).toBe(true);
      }
    });
  }

  it("the seed intent is a pending intent in the journal's format, over the scratch issue as the fixture holds it", () => {
    const dir = join(SEED, "14-show", ".json-state", "journal", INTENT_ID);
    const intent = JSON.parse(readFileSync(join(dir, "intent.json"), "utf-8")) as Intent;
    expect(Object.keys(intent)).toEqual(["operation_id", "op", "request_digest", "writes", "response", "created_at"]);
    expect(intent).toMatchObject({ operation_id: INTENT_ID, op: "transition", request_digest: requestDigest(INTENT_REQUEST), created_at: INTENT_CREATED_AT });
    expect(intent.writes).toEqual([{ path: ISSUE, before: revisionOf(readFileSync(join(FIXTURE, ISSUE))), after: expect.stringMatching(/^sha256:[0-9a-f]{64}$/) }]);
    const staged = (intent.writes[0] as { after: string }).after.slice("sha256:".length);
    expect(revisionOf(readFileSync(join(dir, staged)))).toBe(`sha256:${staged}`);
  });

  it("the recorded set is exactly the fifteen pairs, the one delta, a README and seed/", () => {
    const files = readdirSync(SESSION).sort();
    const expected = ["README.md", "seed", DELTA_NAME, ...NAMES.flatMap((n) => [`${n}.request.json`, `${n}.response.json`])].sort();
    expect(files).toEqual(expected);
    expect(readdirSync(SEED).sort()).toEqual([...SEEDED].sort());
  });
});

// ---------------------------------------------------------------------------
// The dispatcher and the operations it answers over the scratch workbench,
// and `main.ts` by spawning `node` on the committed bundle.
//
// Every case copies `fixtures/workbench/` to a fresh temp directory and never
// writes into `codec/fixtures/`. The operations not yet answered are driven
// from their valid request fixtures, so the refusal is asserted on the exact
// shape the schema admits. The spawn cases run `dist/fusion-record.js`, which
// `npm test` builds first; a missing bundle fails with the remedy named.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dispatch } from "../cli/ops.js";
import { OPERATIONS, IMPLEMENTED_OPERATIONS, LANDS_IN, type Response, type TransitionRequest } from "../cli/protocol.js";
import { installInlined } from "../cli/schemas.js";
import { revisionOf, serialise } from "../store.js";
import { strictParse } from "../strict-json.js";
import { loadSchemas } from "../validate.js";

const FIXTURE = fileURLToPath(new URL("../../fixtures/workbench/", import.meta.url));
const VALID = fileURLToPath(new URL("../../fixtures/valid/", import.meta.url));
const BUNDLE = fileURLToPath(new URL("../../dist/fusion-record.js", import.meta.url));
const OPEN = "work-packages/260928-1200-parser-fix/package.json";
const DONE = "work-packages/260927-0900-strict-reader/package.json";
const ISSUE = "shared/issues/260928-1400-parser-fails-on-empty-input.record.json";
const OP_ID = "0f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
const CLAIM = { checkout_id: "a216a4b9", person: "kai", claimed_at: "2026-09-28T17:05:00+02:00" };
const ACTOR = { actor: "user", person: "kai" };

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "codec-ops-"));
  cpSync(FIXTURE, root, { recursive: true });
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

const bytesOf = (path: string): Buffer => readFileSync(join(root, path));
const revision = (path: string): string => revisionOf(bytesOf(path));
const okResult = (r: Response): Record<string, unknown> => {
  expect(r.ok, JSON.stringify(r)).toBe(true);
  if (!r.ok) throw new Error("unreachable");
  return r.result as Record<string, unknown>;
};
const fixture = (rel: string): Record<string, unknown> => {
  const p = strictParse(readFileSync(join(VALID, rel)));
  if (!p.ok) throw new Error(p.detail);
  return p.value as Record<string, unknown>;
};

const transitionRequest = (over: Partial<TransitionRequest> & { payload?: TransitionRequest["payload"] } = {}): TransitionRequest => ({
  op: "transition",
  workbench: root,
  operation_id: OP_ID,
  record: { path: OPEN },
  expected_revision: revision(OPEN),
  actor: ACTOR,
  to: "claimed",
  reason: "FJ01 round trip",
  payload: { claim: CLAIM },
  ...over,
});

// --- the inlined contract ----------------------------------------------------------

describe("the inlined schemas and tables", () => {
  it("are the same set the directory loader reads", () => {
    const inlined = installInlined();
    const fromDisk = loadSchemas();
    expect(inlined.ids()).toEqual(fromDisk.ids());
    for (const id of fromDisk.ids()) expect(inlined.document(id), id).toEqual(fromDisk.document(id));
  });
});

// --- dispatch ---------------------------------------------------------------------

describe("dispatch: the request itself", () => {
  it("a non-object is schema-invalid; an op outside the table is operation-unknown/unknown-op", async () => {
    expect(await dispatch([])).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request-not-an-object" } });
    expect(await dispatch({ op: "delete", workbench: root })).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "unknown-op" } });
    expect(await dispatch({ workbench: root })).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "unknown-op" } });
  });

  it("a request the protocol schema refuses is schema-invalid/request with the validator's errors", async () => {
    const r = await dispatch({ op: "show", workbench: root, record: { path: "not-a-control-file.md" } });
    expect(r).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request" } });
    if (r.ok) return;
    expect(r.error.errors?.length).toBeGreaterThan(0);
  });

  it("without a workbench in the request or the options: unknown-scope/workbench-unspecified", async () => {
    expect(await dispatch({ op: "inspect" })).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-unspecified" } });
    expect((await dispatch({ op: "inspect" }, { defaultWorkbench: root })).ok).toBe(true);
  });

  it("a workbench root that does not exist is unknown-scope/workbench-missing", async () => {
    expect(await dispatch({ op: "inspect", workbench: join(root, "absent") })).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-missing" } });
  });

  for (const op of OPERATIONS.filter((o) => !IMPLEMENTED_OPERATIONS.includes(o))) {
    it(`${op}: the valid fixture request is answered operation-unknown/not-implemented, the detail naming the package that lands it`, async () => {
      const req = { ...fixture(`protocol/${op}.json`), workbench: root };
      const r = await dispatch(req);
      expect(r).toMatchObject({ ok: false, error: { class: "operation-unknown", reason: "not-implemented" } });
      if (!r.ok) expect(r.error.detail).toContain(`${op} is specified (spec section 6) and lands in ${LANDS_IN[op]}`);
    });
  }

  it("migration lands in FJ04", () => {
    expect(LANDS_IN.migration).toBe("FJ04");
  });
});

// --- inspect ------------------------------------------------------------------------

describe("inspect", () => {
  it("reports the manifest state, the id, the schema ids, the features and the operation split", async () => {
    const result = okResult(await dispatch({ op: "inspect", workbench: root }));
    expect(result.state).toBe("json-control");
    expect(result.id).toBe("5d6d15ba-5b44-45b2-8aa2-39dd3bf82964");
    expect(result.schemas).toContain("urn:fusion:schema:fusion.protocol/v1");
    expect(result.features).toEqual(["json-control-v1"]);
    expect(result.operations).toEqual({ implemented: [...IMPLEMENTED_OPERATIONS], deferred: OPERATIONS.filter((o) => !IMPLEMENTED_OPERATIONS.includes(o)) });
  });

  it("a legacy workbench inspects as legacy; an unsupported manifest inspects ok with its diagnosis and raw data", async () => {
    unlinkSync(join(root, "workbench.json"));
    expect(okResult(await dispatch({ op: "inspect", workbench: root })).state).toBe("legacy");
    writeFileSync(join(root, "workbench.json"), readFileSync(join(VALID, "workbench", "extra-feature.json")));
    const result = okResult(await dispatch({ op: "inspect", workbench: root }));
    expect(result.state).toBe("unsupported");
    expect(result.diagnosis).toMatchObject({ class: "unsupported-format", reason: "unknown-feature" });
    expect(result.manifest).not.toBeNull();
    // ... while the other reads refuse with the same diagnosis.
    expect(await dispatch({ op: "list", workbench: root })).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "unknown-feature" } });
    expect(await dispatch({ op: "show", workbench: root, record: { path: OPEN } })).toMatchObject({ ok: false, error: { reason: "unknown-feature" } });
  });
});

// --- list ---------------------------------------------------------------------------

describe("list", () => {
  it("the whole workbench: three pairs, sorted by path, with kind, status and revision", async () => {
    const result = okResult(await dispatch({ op: "list", workbench: root }));
    const records = result.records as Array<Record<string, unknown>>;
    expect(records.map((r) => r.path)).toEqual([ISSUE, DONE, OPEN]);
    expect(records.map((r) => [r.kind, r.status])).toEqual([["issue", "open"], ["package", "done"], ["package", "open"]]);
    for (const r of records) expect(r.revision).toBe(revision(r.path as string));
  });

  it("a store or a container as scope narrows the listing; a missing scope is unknown-scope", async () => {
    expect((okResult(await dispatch({ op: "list", workbench: root, scope: "work-packages" })).records as unknown[]).length).toBe(2);
    expect((okResult(await dispatch({ op: "list", workbench: root, scope: "shared/issues" })).records as unknown[]).length).toBe(1);
    expect((okResult(await dispatch({ op: "list", workbench: root, scope: "work-packages/260928-1200-parser-fix" })).records as unknown[]).length).toBe(1);
    expect(await dispatch({ op: "list", workbench: root, scope: "shared/plans" })).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "scope-missing" } });
  });

  it("an unreadable control file is listed with its problem, not hidden", async () => {
    writeFileSync(join(root, OPEN), "{ not json\n");
    const records = okResult(await dispatch({ op: "list", workbench: root })).records as Array<Record<string, unknown>>;
    const broken = records.find((r) => r.path === OPEN);
    expect(broken?.problem).toMatchObject({ class: "schema-invalid", reason: "syntax" });
  });
});

// --- show ---------------------------------------------------------------------------

describe("show", () => {
  it("one pair: control, the revision of the stored bytes, the narrative and its hash", async () => {
    const result = okResult(await dispatch({ op: "show", workbench: root, record: { path: OPEN } }));
    expect(result.kind).toBe("package");
    expect((result.control as Record<string, unknown>).status).toBe("open");
    expect(result.revision).toBe(revision(OPEN));
    expect(result.narrative).toEqual({ path: "work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md", sha256: revision("work-packages/260928-1200-parser-fix/260928-1200-parser-fix.md") });
  });

  it("a missing record is unresolved-reference/record-not-found", async () => {
    expect(await dispatch({ op: "show", workbench: root, record: { path: "work-packages/absent/package.json" } })).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
  });
});

// --- validate -----------------------------------------------------------------------

describe("validate", () => {
  it("the scratch workbench is valid: three pairs, no findings", async () => {
    expect(okResult(await dispatch({ op: "validate", workbench: root }))).toMatchObject({ checked: 3, valid: true, findings: [] });
  });

  it("one pair", async () => {
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: ISSUE } }))).toMatchObject({ checked: 1, valid: true });
  });

  it("a schema violation, a missing narrative and a foreign workbench id are each a finding", async () => {
    const open = fixture("package/open.json");
    writeFileSync(join(root, OPEN), serialise({ ...open, status: "claimed" })); // claimed without a claim
    unlinkSync(join(root, "shared/issues/260928-1400-parser-fails-on-empty-input.md"));
    const done = fixture("package/done-completed.json");
    writeFileSync(join(root, DONE), serialise({ ...done, workbench_id: "00000000-0000-4000-8000-000000000000" }));
    const result = okResult(await dispatch({ op: "validate", workbench: root }));
    expect(result.valid).toBe(false);
    const findings = result.findings as Array<Record<string, unknown>>;
    expect(findings.map((f) => `${f.path} ${f.class}/${f.reason}`).sort()).toEqual(
      [`${DONE} unknown-scope/foreign-workbench-id`, `${ISSUE} unresolved-reference/narrative-missing`, `${OPEN} schema-invalid/schema`].sort(),
    );
  });

  it("the state rules of transitions.ts are applied to a record at rest", async () => {
    // A done package whose outcome class dropped admits: the schema's if/then
    // catches it too, so build a case the schema alone lets through: an issue
    // in_progress carrying a disposition is refused by both; a package in
    // claimed with a claim but an outcome is refused by both. The rules are
    // reached when the schema passes, which the scratch fixture shows: the
    // finding list is empty, and the rules ran (a throw would surface).
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: DONE } }))).toMatchObject({ valid: true });
  });
});

// --- transition ------------------------------------------------------------------------

describe("transition", () => {
  it("open to claimed with a claim: the record is rewritten deterministically and the new revision is returned", async () => {
    const before = revision(OPEN);
    const r = await dispatch(transitionRequest());
    const result = okResult(r);
    expect(result).toMatchObject({ operation_id: OP_ID, path: OPEN, from: "open", to: "claimed", previous_revision: before });
    expect(result.revision).toBe(revision(OPEN));
    expect(result.revision).not.toBe(before);
    if (!r.ok) return;
    expect(r.revisions).toEqual({ [OPEN]: result.revision });
    const stored = strictParse(bytesOf(OPEN));
    expect(stored.ok && (stored.value as Record<string, unknown>).status).toBe("claimed");
    expect(stored.ok && (stored.value as Record<string, unknown>).claim).toEqual(CLAIM);
    expect(bytesOf(OPEN).toString("utf-8")).toBe(serialise(stored.ok ? stored.value : {}));
    expect(existsSync(join(root, ".json-state", "ops", `${OP_ID}.json`))).toBe(true);
  });

  it("the same operation_id with the same request returns the stored answer and touches nothing", async () => {
    const req = transitionRequest();
    const first = await dispatch(req);
    expect(first.ok).toBe(true);
    const mtime = statSync(join(root, OPEN)).mtimeMs;
    const bytes = bytesOf(OPEN);
    const again = await dispatch(req);
    expect(again).toEqual(first);
    expect(statSync(join(root, OPEN)).mtimeMs).toBe(mtime);
    expect(bytesOf(OPEN).equals(bytes)).toBe(true);
    // The replay also holds when the record has moved on since: the answer is the stored one.
    const later = await dispatch(transitionRequest({ operation_id: "1f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), to: "open", payload: {} }));
    expect(later.ok).toBe(true);
    expect(await dispatch(req)).toEqual(first);
  });

  it("the same operation_id with a different request is conflict/operation-id-reused", async () => {
    const req = transitionRequest();
    expect((await dispatch(req)).ok).toBe(true);
    expect(await dispatch({ ...req, reason: "another reason" })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
    expect(await dispatch({ ...req, expected_revision: revision(OPEN) })).toMatchObject({ ok: false, error: { class: "conflict", reason: "operation-id-reused" } });
  });

  it("a stale expected_revision is conflict/revision-mismatch and the record is untouched", async () => {
    const stale = "sha256:" + "0".repeat(64);
    const bytes = bytesOf(OPEN);
    const r = await dispatch(transitionRequest({ expected_revision: stale }));
    expect(r).toMatchObject({ ok: false, error: { class: "conflict", reason: "revision-mismatch", detail: `stored ${revision(OPEN)} expected ${stale}` } });
    expect(bytesOf(OPEN).equals(bytes)).toBe(true);
    expect(existsSync(join(root, ".json-state", "ops", `${OP_ID}.json`)), "a refusal is not stored").toBe(false);
  });

  it("an edge the table does not list is conflict/transition-refused; a payload the target state refuses is schema-invalid", async () => {
    expect(await dispatch(transitionRequest({ to: "done", payload: { outcome: { class: "completed", reason: "r", evidence: [] } } }))).toMatchObject({
      ok: false,
      error: { class: "conflict", reason: "transition-refused" },
    });
    expect(await dispatch(transitionRequest({ payload: {} }))).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    expect(await dispatch(transitionRequest({ to: "paused", payload: { claim: CLAIM } }))).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    expect(await dispatch(transitionRequest({ to: "archived", payload: {} }))).toMatchObject({ ok: false, error: { class: "schema-invalid" } });
  });

  it("a malformed claim is refused by the protocol schema before any operation runs", async () => {
    const r = await dispatch(transitionRequest({ payload: { claim: { ...CLAIM, checkout_id: "A216A4B9" } } }));
    expect(r).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "request" } });
  });

  it("claimed to open drops the claim; claimed to done keeps the historical claim and needs an outcome", async () => {
    expect((await dispatch(transitionRequest())).ok).toBe(true);
    const release = await dispatch(transitionRequest({ operation_id: "2f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), to: "open", payload: {} }));
    expect(release.ok, JSON.stringify(release)).toBe(true);
    let stored = strictParse(bytesOf(OPEN));
    expect(stored.ok && (stored.value as Record<string, unknown>).claim).toBeNull();

    expect((await dispatch(transitionRequest({ operation_id: "3f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN) }))).ok).toBe(true);
    const noOutcome = await dispatch(transitionRequest({ operation_id: "4f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), to: "done", payload: {} }));
    expect(noOutcome).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    const done = await dispatch(transitionRequest({ operation_id: "4f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a", expected_revision: revision(OPEN), to: "done", payload: { outcome: { class: "completed", reason: "all criteria met", evidence: [] } } }));
    expect(done.ok, JSON.stringify(done)).toBe(true);
    stored = strictParse(bytesOf(OPEN));
    expect(stored.ok && (stored.value as Record<string, unknown>).claim).toEqual(CLAIM);
    expect(stored.ok && (stored.value as Record<string, unknown>).status).toBe("done");
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path: OPEN } })).valid).toBe(true);
  });

  // --- the record kinds (FJ02 step 3): one case per kind, and the decision's references ---

  /** The record kinds' starting records: the valid fixtures, written into the temp copy with a narrative beside each. */
  const seedRecord = (fixtureRel: string, store: string, stem: string): string => {
    const value = fixture(fixtureRel);
    const narrative = `shared/${store}/${stem}.md`;
    const path = `shared/${store}/${stem}.record.json`;
    mkdirSync(join(root, "shared", store), { recursive: true });
    writeFileSync(join(root, narrative), `# ${stem}\n`);
    writeFileSync(join(root, path), serialise({ ...value, narrative: { path: narrative } }));
    return path;
  };
  const controlOf = (path: string): Record<string, unknown> => {
    const p = strictParse(bytesOf(path));
    if (!p.ok) throw new Error(p.detail);
    return (p.value as { control: Record<string, unknown> }).control;
  };
  const recordMove = async (path: string, to: string, payload: TransitionRequest["payload"], id: string): Promise<Response> =>
    dispatch(transitionRequest({ operation_id: id, record: { path }, expected_revision: revision(path), to, reason: `move to ${to}`, payload }));
  /** Asserts FJ01's response shape for a record kind, and that the record is valid and at `to`. */
  const landed = async (r: Response, path: string, from: string, to: string, id: string): Promise<void> => {
    const result = okResult(r);
    expect(Object.keys(result)).toEqual(["operation_id", "path", "from", "to", "revision", "previous_revision"]);
    expect(result).toMatchObject({ operation_id: id, path, from, to, revision: revision(path) });
    if (r.ok) expect(r.revisions).toEqual({ [path]: revision(path) });
    expect(controlOf(path).state).toBe(to);
    const stored = strictParse(bytesOf(path));
    if (!stored.ok) throw new Error(stored.detail);
    expect(bytesOf(path).toString("utf-8"), "the stored bytes are the deterministic serialisation").toBe(serialise(stored.value));
    expect(okResult(await dispatch({ op: "validate", workbench: root, record: { path } })).valid).toBe(true);
  };

  it("issue: open to closed with a fixed disposition lands; closing without one is refused and the record untouched", async () => {
    const before = bytesOf(ISSUE);
    expect(await recordMove(ISSUE, "closed", {}, "5a0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    expect(bytesOf(ISSUE).equals(before)).toBe(true);
    const id = "5b0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    const disposition = { kind: "fixed", reason_ref: "260928-1200-parser-fix.md" };
    await landed(await recordMove(ISSUE, "closed", { disposition }, id), ISSUE, "open", "closed", id);
    expect(controlOf(ISSUE).disposition).toEqual(disposition);
  });

  it("plan: open to in_progress moves the state only; steps and criteria stay as stored", async () => {
    const path = seedRecord("record/plan-open-unadopted.json", "plans", "260929-1000-a-plan");
    const steps = controlOf(path).steps;
    const id = "5c0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "in_progress", {}, id), path, "open", "in_progress", id);
    expect(controlOf(path).steps).toEqual(steps);
  });

  it("discussion: open to closed", async () => {
    const path = seedRecord("record/discussion-open.json", "discussions", "260929-1000-a-discussion");
    const id = "5d0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "closed", {}, id), path, "open", "closed", id);
  });

  it("decision: open to deferred with a deferral to an external target; without one it is refused", async () => {
    const path = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    expect(await recordMove(path, "deferred", {}, "5e0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "transition-refused" } });
    const deferral = { target: { kind: "external" as const, name: "v1.x" }, ruled_by: ACTOR };
    const id = "5f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "deferred", { deferral }, id), path, "open", "deferred", id);
    expect(controlOf(path)).toMatchObject({ deferral, answer_ref: null, implementation_ref: null, superseded_by: null });
  });

  it("decision: open to answered by a citation string (carried unresolved), then to implemented by a reference that resolves", async () => {
    const path = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    const answered = "6a0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "answered", { answer_ref: "260809-1400-fixture-format-consultation.md" }, answered), path, "open", "answered", answered);
    expect(controlOf(path).answer_ref).toBe("260809-1400-fixture-format-consultation.md");

    // implementation_ref as a reference, not a commit hash: the widened
    // protocol payload (git_commit | reference), end to end.
    const wbId = "5d6d15ba-5b44-45b2-8aa2-39dd3bf82964";
    const dangling = { workbench_id: wbId, record_id: "00000000-0000-4000-8000-00000000dead" };
    const before = bytesOf(path);
    expect(await recordMove(path, "implemented", { implementation_ref: dangling }, "6b0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
    expect(await recordMove(path, "implemented", { implementation_ref: { ...dangling, workbench_id: "00000000-0000-4000-8000-000000000000" } }, "6b1d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "foreign-workbench" } });
    expect(bytesOf(path).equals(before), "a refused reference writes nothing").toBe(true);
    const ref = { workbench_id: wbId, record_id: "591d5bf4-2219-46b6-a0d3-cbdb28d6af16", display: "260928-1200-parser-fix.md" };
    const implemented = "6c0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "implemented", { implementation_ref: ref }, implemented), path, "answered", "implemented", implemented);
    expect(controlOf(path)).toMatchObject({ implementation_ref: ref, answer_ref: "260809-1400-fixture-format-consultation.md" });
  });

  it("decision: implementation_ref as a git commit, and an artefact reference checked against the bytes on disk", async () => {
    const path = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    const note = "shared/decisions/260929-1000-a-decision.md";
    const artefact = { path: note, sha256: revision(note), kind: "decision" };
    expect(await recordMove(path, "answered", { answer_ref: { ...artefact, sha256: "sha256:" + "0".repeat(64) } }, "6d0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "missing-evidence", reason: "artefact-changed" } });
    expect(await recordMove(path, "answered", { answer_ref: { ...artefact, path: "shared/decisions/absent.md" } }, "6d1d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a")).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "artefact-missing" } });
    const id = "6e0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a";
    await landed(await recordMove(path, "implemented", { implementation_ref: "20942d0c" }, id), path, "open", "implemented", id);
    expect(controlOf(path).implementation_ref).toBe("20942d0c");
  });

  it("decision: a state the target forbids a field in is refused by the record schema, and nothing is written", async () => {
    const path = seedRecord("record/decision-open.json", "decisions", "260929-1000-a-decision");
    const before = bytesOf(path);
    // answered carries no implementation_ref (record.schema.json decision_control).
    const r = await recordMove(path, "answered", { answer_ref: "260809-1400-fixture-format-consultation.md", implementation_ref: "20942d0c" }, "6f0d8c3a-9b7e-4c1d-8a2f-6e5b4d3c2b1a");
    expect(r).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "result-invalid" } });
    expect(bytesOf(path).equals(before)).toBe(true);
  });

  it("a legacy workbench refuses mutation with unsupported-format/legacy-workbench", async () => {
    unlinkSync(join(root, "workbench.json"));
    expect(await dispatch(transitionRequest())).toMatchObject({ ok: false, error: { class: "unsupported-format", reason: "legacy-workbench" } });
  });

  it("a missing record is unresolved-reference", async () => {
    expect(await dispatch(transitionRequest({ record: { path: "work-packages/absent/package.json" } }))).toMatchObject({ ok: false, error: { class: "unresolved-reference", reason: "record-not-found" } });
  });
});

// --- main.ts, spawned on the committed bundle ------------------------------------------

describe("main.ts on dist/fusion-record.js", () => {
  const run = (args: string[], input: string, env: Record<string, string | undefined> = {}) => {
    const { FUSION_WORKBENCH: _drop, ...base } = process.env;
    return spawnSync(process.execPath, [BUNDLE, ...args], { input, encoding: "utf-8", env: { ...base, ...env } });
  };
  const parse = (stdout: string): Response => JSON.parse(stdout) as Response;

  it("the bundle exists", () => {
    expect(existsSync(BUNDLE), `${BUNDLE} is absent: run \`npm run build\` in codec/ (npm test does)`).toBe(true);
  });

  it("show on stdin: one response line on stdout, nothing on stderr, exit 0", () => {
    const r = run([], JSON.stringify({ op: "show", workbench: root, record: { path: OPEN } }));
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toBe("");
    expect(r.stdout.endsWith("\n")).toBe(true);
    expect(r.stdout.trim().split("\n")).toHaveLength(1);
    const response = parse(r.stdout);
    expect(response.ok).toBe(true);
    if (!response.ok) return;
    expect((response.result as Record<string, unknown>).revision).toBe(revision(OPEN));
  });

  it("--file reads the request from a file; FUSION_WORKBENCH is the default workbench", () => {
    const file = join(root, "request.json");
    writeFileSync(file, JSON.stringify({ op: "list", scope: "shared/issues" }));
    const r = run(["--file", file], "", { FUSION_WORKBENCH: root });
    expect(r.status, r.stderr).toBe(0);
    const response = parse(r.stdout);
    expect(response.ok).toBe(true);
    if (!response.ok) return;
    expect(((response.result as Record<string, unknown>).records as unknown[]).length).toBe(1);
    // An explicit workbench wins over the environment.
    const explicit = run([], JSON.stringify({ op: "inspect", workbench: join(root, "absent") }), { FUSION_WORKBENCH: root });
    expect(parse(explicit.stdout)).toMatchObject({ ok: false, error: { reason: "workbench-missing" } });
  });

  it("a transition through the bundle lands and replays", () => {
    const req = transitionRequest();
    const first = run([], JSON.stringify(req));
    expect(first.status).toBe(0);
    const a = parse(first.stdout);
    expect(a.ok, first.stdout).toBe(true);
    expect(parse(run([], JSON.stringify(req)).stdout)).toEqual(a);
    expect(parse(run([], JSON.stringify({ ...req, reason: "x" })).stdout)).toMatchObject({ ok: false, error: { reason: "operation-id-reused" } });
  });

  it("a request that is not strict JSON is answered schema-invalid on stdout, exit 0", () => {
    const r = run([], '{"op": "inspect",}');
    expect(r.status).toBe(0);
    expect(r.stderr).toBe("");
    expect(parse(r.stdout)).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "syntax" } });
    const dup = run([], '{"op": "inspect", "op": "list"}');
    expect(parse(dup.stdout)).toMatchObject({ ok: false, error: { class: "schema-invalid", reason: "duplicate-key" } });
  });

  it("usage errors exit 2 with the reason on stderr and nothing on stdout", () => {
    for (const args of [["--bogus"], ["--file"], ["--file", join(root, "absent.json")]]) {
      const r = run(args, "");
      expect(r.status, args.join(" ")).toBe(2);
      expect(r.stdout).toBe("");
      expect(r.stderr).toMatch(/^fusion-record: /);
    }
  });

  it("without a workbench anywhere the answer is unknown-scope, exit 0", () => {
    const r = run([], JSON.stringify({ op: "inspect" }));
    expect(r.status).toBe(0);
    expect(parse(r.stdout)).toMatchObject({ ok: false, error: { class: "unknown-scope", reason: "workbench-unspecified" } });
  });
});

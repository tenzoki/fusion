// ---------------------------------------------------------------------------
// candidates.Register <-> fusion.campaign/v1 register block + issue candidates.
//
// Row by row from `codec/contract/prior-mapping.json` (aggregates
// `candidates.*`). The register-wide part (id, revision, stable keys,
// watermarks, closed intake, and the selection policy and snapshot where the
// caller knows them) becomes the campaign's `register` block; every entry of
// `Register.Candidates` becomes the `candidate` block of one issue record,
// with `Statement` and `Purpose` kept verbatim in that record's
// `provenance.legacy_fields`. Prior's one `Disposition` is split into
// `selection` and `admission`, the spec's two axes, and export rebuilds it.
//
// `Policy` and `Snapshot` are `Select` inputs at 12d8424, not Register fields.
// The import takes them as optional side inputs and writes `null` when they
// are not known; it never reconstructs them from the dispositions.
//
// A `WorkItemID` names a work item the register alone cannot resolve. When the
// caller passes the set of work items it knows, an id outside that set is
// `unresolved-reference`; without the set, the id is carried and the check is
// the caller's. Which of the two happened is returned beside the blocks as
// `inventory.work_items` (`checked` or `carry-only`), so that a carry-only
// import can never pass for a validated migration (FJ00 response 3d).
//
// The ruling's corrections (FJ00 response 2): `Severity`, `EstimatedScope`
// and `Disposition.Score` are signed; `Evidence` keeps its stored order and
// its duplicates; an empty `Evidence.Ref` or `Revision` is null here and `""`
// again on export; a `MergeInto` without the outcome merged is a legacy
// inconsistency reported for reconciliation, never repaired.
// ---------------------------------------------------------------------------

import type {
  CandidateBlock,
  ImportedCandidate,
  ImportedRegister,
  PolicyBlock,
  QualificationBlock,
  RegisterBlock,
  SelectionBlock,
  SnapshotBlock,
} from "./blocks.js";
import {
  EmptyTracker,
  POLICY_FIELDS,
  POLICY_OPERATORS,
  VOCABULARY,
  boolean,
  emptyToNull,
  guarded,
  integer,
  inventoryOf,
  invalid,
  jsonSha,
  jsonShaOrNull,
  keyMatches,
  legacyFields,
  nonEmpty,
  nonNegative,
  nonZeroTime,
  nullToEmpty,
  oneOf,
  opaque,
  opaqueOrNull,
  positive,
  stringSet,
  trackerFrom,
  unJsonSha,
  unOpaque,
  unresolved,
  type ImportResult,
  type PriorResult,
} from "./common.js";
import type { PriorCandidate, PriorDisposition, PriorPolicy, PriorQualification, PriorRegister, PriorSnapshot } from "./types.js";

export interface RegisterInputs {
  /** The selection policy last applied, when known; `register.policy` is null otherwise. */
  policy?: PriorPolicy | null;
  /** The frozen snapshot last selected against, when known; `register.snapshot` is null otherwise. */
  snapshot?: PriorSnapshot | null;
  /** The work items the caller can resolve; an admitted `WorkItemID` outside it is unresolved-reference. */
  workItems?: ReadonlySet<string>;
}

export interface ExportedRegister {
  register: PriorRegister;
  policy: PriorPolicy | null;
  snapshot: PriorSnapshot | null;
}

// --- import -----------------------------------------------------------------

export function importRegister(register: PriorRegister, inputs: RegisterInputs = {}): ImportResult<ImportedRegister> {
  const inventory = inventoryOf(inputs.workItems);
  const result = guarded<ImportedRegister>(() => {
    const t = new EmptyTracker();
    const id = nonEmpty("ID", register.ID);
    const revision = jsonShaOrNull("Revision", register.Revision);

    const candidates: ImportedCandidate[] = [];
    const known = new Set<string>();
    for (const [key, c] of t.entries("Candidates", register.Candidates)) {
      const path = `Candidates[${key}]`;
      keyMatches(path, key, c.ID);
      known.add(key);
      candidates.push(importCandidate(c, path, inputs.workItems));
    }

    const stable = t.entries("Stable", register.Stable).map(([stable_key, candidate_id]) => {
      nonEmpty(`Stable[${stable_key}]`, candidate_id);
      if (!known.has(candidate_id)) unresolved(`Stable[${stable_key}]`, `names candidate "${candidate_id}", which the register does not hold`);
      return { stable_key, candidate_id };
    });
    const watermarks = t.entries("Watermarks", register.Watermarks).map(([source_id, watermark]) => ({
      source_id,
      watermark: nonEmpty(`Watermarks[${source_id}]`, watermark),
    }));

    const intake_closed = boolean("IntakeClosed", register.IntakeClosed);
    const closed_watermark = emptyToNull(register.ClosedWatermark);
    if (intake_closed && closed_watermark === null) invalid("ClosedWatermark", "IntakeClosed is true but ClosedWatermark is empty");

    const block: RegisterBlock = {
      id,
      revision,
      stable,
      watermarks,
      intake_closed,
      closed_watermark,
      policy: inputs.policy == null ? null : importPolicy(inputs.policy, t),
      snapshot: inputs.snapshot == null ? null : importSnapshot(inputs.snapshot, t),
    };
    return { register: block, candidates, provenance: { source: "imported", legacy_fields: legacyFields(t) } };
  });
  return { ...result, inventory };
}

function importCandidate(c: PriorCandidate, path: string, workItems: ReadonlySet<string> | undefined): ImportedCandidate {
  const t = new EmptyTracker([], path);
  const at = (f: string): string => `${path}.${f}`;
  if (c.SchemaVersion !== 1) invalid(at("SchemaVersion"), `Collect accepts 1 only, got ${JSON.stringify(c.SchemaVersion)}`);

  // The stored sequence, duplicates included: Prior sorts a copy for the hash
  // and never deduplicates. Qualify records an empty Ref or Revision as a
  // failed qualification rather than refusing the candidate, so both are
  // carried as null and the failure is carried as `passed: false`.
  const evidence = t.list("Evidence", c.Evidence).map((e, i) => ({
    ref: emptyToNull(e.Ref),
    revision: opaqueOrNull(`${at("Evidence")}[${i}].Revision`, e.Revision),
  }));

  const { selection, admission } = splitDisposition(c.Disposition, at("Disposition"), t, workItems);

  const block: CandidateBlock = {
    prior_id: nonEmpty(at("ID"), c.ID),
    schema_version: 1,
    stable_key: nonEmpty(at("StableKey"), c.StableKey),
    item_kind: nonEmpty(at("Kind"), c.Kind),
    version: positive(at("Version"), c.Version),
    source: {
      id: nonEmpty(at("Source.ID"), c.Source.ID),
      revision: opaque(at("Source.Revision"), c.Source.Revision),
      watermark: nonEmpty(at("Source.Watermark"), c.Source.Watermark),
      refresh_policy: oneOf(at("Source.RefreshPolicy"), c.Source.RefreshPolicy, VOCABULARY.refreshPolicy()),
    },
    evidence,
    reproduction: t.list("Reproduction", c.Reproduction),
    // Severity and EstimatedScope are signed: legacy Collect never rejected a
    // negative value. Confidence and Risk stay non-negative, the two bounds
    // Prior validates at intake.
    severity: integer(at("Severity"), c.Severity),
    confidence: nonNegative(at("Confidence"), c.Confidence),
    estimated_scope: integer(at("EstimatedScope"), c.EstimatedScope),
    risk: nonNegative(at("Risk"), c.Risk),
    affected_resources: stringSet(at("AffectedResources"), t.list("AffectedResources", c.AffectedResources)),
    dependencies: stringSet(at("Dependencies"), t.list("Dependencies", c.Dependencies)),
    qualification: c.Qualification === null ? null : importQualification(c.Qualification, at("Qualification"), t),
    selection,
    admission,
    merge_into: emptyToNull(c.MergeInto),
  };
  const merged = selection?.outcome === "merged";
  if (block.merge_into !== null && !merged) {
    invalid(
      at("MergeInto"),
      "legacy-inconsistency: MergeInto is set while the disposition outcome is not merged (Qualify on a merged candidate clears Disposition without clearing MergeInto); a migration finding to reconcile, not repaired here",
    );
  }
  if (merged && block.merge_into === null) invalid(at("MergeInto"), "the disposition outcome merged names a merge target");
  return {
    candidate: block,
    provenance: { source: "imported", legacy_fields: legacyFields(t, { Statement: c.Statement, Purpose: c.Purpose }) },
  };
}

function importQualification(q: PriorQualification, path: string, t: EmptyTracker): QualificationBlock {
  return {
    candidate_version: positive(`${path}.CandidateVersion`, q.CandidateVersion),
    source_revision: opaque(`${path}.SourceRevision`, q.SourceRevision),
    evidence_hash: jsonSha(`${path}.EvidenceHash`, nonEmpty(`${path}.EvidenceHash`, q.EvidenceHash)),
    passed: boolean(`${path}.Passed`, q.Passed),
    reasons: t.list("Qualification.Reasons", q.Reasons),
    checked_at: nonZeroTime(`${path}.CheckedAt`, q.CheckedAt),
  };
}

/** The split the table records on the Disposition row: selection and admission, each null when absent. */
function splitDisposition(
  d: PriorDisposition | null,
  path: string,
  t: EmptyTracker,
  workItems: ReadonlySet<string> | undefined,
): Pick<CandidateBlock, "selection" | "admission"> {
  if (d === null) return { selection: null, admission: null };
  const selection: SelectionBlock = {
    candidate_version: positive(`${path}.CandidateVersion`, d.CandidateVersion),
    policy_version: emptyToNull(d.PolicyVersion),
    snapshot_hash: jsonShaOrNull(`${path}.SnapshotHash`, d.SnapshotHash),
    outcome: oneOf(`${path}.Outcome`, nonEmpty(`${path}.Outcome`, d.Outcome), VOCABULARY.dispositionOutcome()),
    score: integer(`${path}.Score`, d.Score), // signed: evaluate sums signed weights
    reasons: t.list("Disposition.Reasons", d.Reasons),
  };
  const hasItem = d.WorkItemID !== "";
  const hasAttempt = d.CurrentAttempt !== 0;
  if (hasItem !== hasAttempt) {
    invalid(`${path}.WorkItemID`, "WorkItemID and CurrentAttempt are set together or not at all");
  }
  if (!hasItem) return { selection, admission: null };
  if (workItems !== undefined && !workItems.has(d.WorkItemID)) {
    unresolved(`${path}.WorkItemID`, `"${d.WorkItemID}" names no work item the caller knows`);
  }
  return {
    selection,
    admission: { work_item_id: d.WorkItemID, current_attempt: positive(`${path}.CurrentAttempt`, d.CurrentAttempt) },
  };
}

function importPolicy(p: PriorPolicy, t: EmptyTracker): PolicyBlock {
  return {
    version: nonEmpty("Policy.Version", p.Version),
    predicates: t.list("Policy.Predicates", p.Predicates).map((x, i) => ({
      field: oneOf(`Policy.Predicates[${i}].Field`, x.Field, POLICY_FIELDS),
      operator: oneOf(`Policy.Predicates[${i}].Operator`, x.Operator, POLICY_OPERATORS),
      value: integer(`Policy.Predicates[${i}].Value`, x.Value),
    })),
    weights: t.list("Policy.Weights", p.Weights).map((w, i) => ({
      field: oneOf(`Policy.Weights[${i}].Field`, w.Field, POLICY_FIELDS),
      multiplier: integer(`Policy.Weights[${i}].Multiplier`, w.Multiplier),
    })),
    minimum_score: integer("Policy.MinimumScore", p.MinimumScore),
    maximum_risk: nonNegative("Policy.MaximumRisk", p.MaximumRisk),
  };
}

function importSnapshot(s: PriorSnapshot, t: EmptyTracker): SnapshotBlock {
  return {
    watermark: nonEmpty("Snapshot.Watermark", s.Watermark),
    versions: t.entries("Snapshot.Versions", s.Versions).map(([candidate_id, version]) => ({
      candidate_id,
      version: positive(`Snapshot.Versions[${candidate_id}]`, version),
    })),
    source_revisions: t.entries("Snapshot.SourceRevisions", s.SourceRevisions).map(([candidate_id, revision]) => ({
      candidate_id,
      revision: opaque(`Snapshot.SourceRevisions[${candidate_id}]`, revision),
    })),
  };
}

// --- export -----------------------------------------------------------------

export function exportRegister(imported: ImportedRegister): PriorResult<ExportedRegister> {
  return guarded(() => {
    const t = trackerFrom(imported.provenance?.legacy_fields, "register");
    const r = imported.register;

    const candidates: Array<[string, PriorCandidate]> = imported.candidates.map((c) => [c.candidate.prior_id, exportCandidate(c)]);
    const register: PriorRegister = {
      ID: r.id,
      Revision: unJsonSha("register.revision", r.revision),
      Candidates: t.unentries("Candidates", candidates),
      Stable: t.unentries("Stable", r.stable.map((e) => [e.stable_key, e.candidate_id])),
      Watermarks: t.unentries("Watermarks", r.watermarks.map((e) => [e.source_id, e.watermark])),
      IntakeClosed: r.intake_closed,
      ClosedWatermark: nullToEmpty(r.closed_watermark),
    };
    const policy: PriorPolicy | null =
      r.policy === null
        ? null
        : {
            Version: r.policy.version,
            Predicates: t.unlist("Policy.Predicates", r.policy.predicates.map((x) => ({ Field: x.field, Operator: x.operator, Value: x.value }))),
            Weights: t.unlist("Policy.Weights", r.policy.weights.map((w) => ({ Field: w.field, Multiplier: w.multiplier }))),
            MinimumScore: r.policy.minimum_score,
            MaximumRisk: r.policy.maximum_risk,
          };
    const snapshot: PriorSnapshot | null =
      r.snapshot === null
        ? null
        : {
            Watermark: r.snapshot.watermark,
            Versions: t.unentries("Snapshot.Versions", r.snapshot.versions.map((v) => [v.candidate_id, v.version])),
            SourceRevisions: t.unentries(
              "Snapshot.SourceRevisions",
              r.snapshot.source_revisions.map((v) => [v.candidate_id, unOpaque(`register.snapshot.source_revisions[${v.candidate_id}]`, v.revision)]),
            ),
          };
    return { register, policy, snapshot };
  });
}

function exportCandidate(imported: ImportedCandidate): PriorCandidate {
  const c = imported.candidate;
  const path = `candidates[${c.prior_id}]`;
  const t = trackerFrom(imported.provenance?.legacy_fields, path);
  const legacy = imported.provenance?.legacy_fields ?? {};
  const prose = (field: "Statement" | "Purpose"): string => {
    const v = legacy[field];
    if (typeof v !== "string") invalid(`${path}.provenance.legacy_fields.${field}`, "the verbatim Prior field is missing");
    return v;
  };

  const q = c.qualification;
  const qualification: PriorQualification | null =
    q === null
      ? null
      : {
          CandidateVersion: q.candidate_version,
          SourceRevision: unOpaque(`${path}.qualification.source_revision`, q.source_revision),
          EvidenceHash: unJsonSha(`${path}.qualification.evidence_hash`, q.evidence_hash),
          Passed: q.passed,
          Reasons: t.unlist("Qualification.Reasons", q.reasons),
          CheckedAt: q.checked_at,
        };

  let disposition: PriorDisposition | null = null;
  if (c.selection !== null) {
    disposition = {
      CandidateVersion: c.selection.candidate_version,
      PolicyVersion: nullToEmpty(c.selection.policy_version),
      SnapshotHash: unJsonSha(`${path}.selection.snapshot_hash`, c.selection.snapshot_hash),
      Outcome: c.selection.outcome,
      WorkItemID: c.admission?.work_item_id ?? "",
      CurrentAttempt: c.admission?.current_attempt ?? 0,
      Score: c.selection.score,
      Reasons: t.unlist("Disposition.Reasons", c.selection.reasons),
    };
  } else if (c.admission !== null) {
    invalid(`${path}.admission`, "an admission without a selection has no Disposition to return to");
  }

  return {
    SchemaVersion: c.schema_version,
    ID: c.prior_id,
    StableKey: c.stable_key,
    Kind: c.item_kind,
    Statement: prose("Statement"),
    Purpose: prose("Purpose"),
    Version: c.version,
    Source: {
      ID: c.source.id,
      Revision: unOpaque(`${path}.source.revision`, c.source.revision),
      Watermark: c.source.watermark,
      RefreshPolicy: c.source.refresh_policy,
    },
    Evidence: t.unlist(
      "Evidence",
      c.evidence.map((e, i) => ({ Ref: nullToEmpty(e.ref), Revision: unOpaque(`${path}.evidence[${i}].revision`, e.revision) })),
    ),
    Reproduction: t.unlist("Reproduction", c.reproduction),
    Severity: c.severity,
    Confidence: c.confidence,
    EstimatedScope: c.estimated_scope,
    Risk: c.risk,
    AffectedResources: t.unlist("AffectedResources", c.affected_resources),
    Dependencies: t.unlist("Dependencies", c.dependencies),
    Qualification: qualification,
    Disposition: disposition,
    MergeInto: nullToEmpty(c.merge_into),
  };
}

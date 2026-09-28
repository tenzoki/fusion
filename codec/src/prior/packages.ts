// ---------------------------------------------------------------------------
// packages.Plan <-> fusion.campaign/v1 formation block.
//
// Row by row from `codec/contract/prior-mapping.json` (aggregates
// `packages.*`). The Plan is kept whole: its four maps become arrays of keyed
// entries sorted by key, its `Revision` is typed, and every `Package` is
// carried verbatim with Prior's own state vocabulary. What a Prior package
// state means as a fusion package status is the `state_mapping` proposal in
// the table, applied by no importer while its rows are unconfirmed; here an
// unknown state is a refusal, never a default.
//
// `FormationPolicy` is a `Form` input at 12d8424; only its Version persists.
// The import takes it as an optional side input and writes `null` otherwise.
//
// A work item id (`Admission.Attempts[].ItemID`, an `ActiveItems` key) names
// something the plan alone cannot resolve, as a register's `WorkItemID` does.
// When the caller supplies the inventory it can resolve, an id outside it is
// unresolved-reference; without the set the check is the caller's, and the
// result says so beside the blocks (`inventory.work_items: "carry-only"`) so
// that such an import never passes for a validated migration (FJ00 response 3d).
//
// The ruling's corrections (FJ00 response 2): the three metrics on a
// formation candidate and on a package are signed, and `FailureReason`
// occurs on `stale` as well as on `failed`.
// ---------------------------------------------------------------------------

import type { FormationAdmissionBlock, FormationBlock, FormationCandidateBlock, FormationPackageBlock, ImportedPlan } from "./blocks.js";
import {
  EmptyTracker,
  VOCABULARY,
  boolean,
  distinct,
  emptyToNull,
  guarded,
  integer,
  inventoryOf,
  invalid,
  keyMatches,
  legacyFields,
  nonEmpty,
  nonNegative,
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
  jsonShaOrNull,
  type ImportResult,
  type PriorResult,
} from "./common.js";
import type { PriorAdmission, PriorFormationCandidate, PriorFormationPolicy, PriorPackage, PriorPlan } from "./types.js";

export interface PlanInputs {
  /** The formation policy the plan was formed under, when known; `formation.policy` is null otherwise. */
  policy?: PriorFormationPolicy | null;
  /** The work items the caller can resolve; an attempt's ItemID or an ActiveItems key outside it is unresolved-reference. */
  workItems?: ReadonlySet<string>;
}

export interface ExportedPlan {
  plan: PriorPlan;
  policy: PriorFormationPolicy | null;
}

// --- import -----------------------------------------------------------------

export function importPlan(plan: PriorPlan, inputs: PlanInputs = {}): ImportResult<ImportedPlan> {
  const inventory = inventoryOf(inputs.workItems);
  const result = guarded<ImportedPlan>(() => {
    const t = new EmptyTracker();

    const candidates: FormationCandidateBlock[] = t.entries("Candidates", plan.Candidates).map(([key, c]) => {
      const path = `Candidates[${key}]`;
      keyMatches(path, key, c.ID);
      return importFormationCandidate(c, path, t);
    });
    const candidateIds = new Set(candidates.map((c) => c.id));
    const namesCandidate = (path: string, id: string): string => {
      if (!candidateIds.has(nonEmpty(path, id))) unresolved(path, `names candidate "${id}", which formation.candidates does not hold`);
      return id;
    };

    const packages: FormationPackageBlock[] = t.entries("Packages", plan.Packages).map(([key, p]) => {
      const path = `Packages[${key}]`;
      keyMatches(path, key, p.ID);
      return importPackage(p, path, t);
    });
    const packageIds = new Set(packages.map((p) => p.id));
    const namesPackage = (path: string, id: string): string => {
      if (!packageIds.has(nonEmpty(path, id))) unresolved(path, `names package "${id}", which formation.packages does not hold`);
      return id;
    };
    for (const p of packages) {
      p.members.forEach((m, i) => namesCandidate(`Packages[${p.id}].Members[${i}]`, m));
      p.dependencies.forEach((d, i) => namesPackage(`Packages[${p.id}].Dependencies[${i}]`, d));
    }

    const namesItem = (path: string, id: string): string => {
      if (inputs.workItems !== undefined && !inputs.workItems.has(id)) unresolved(path, `"${id}" names no work item the caller knows`);
      return id;
    };

    const order = stringSet("Order", t.list("Order", plan.Order));
    order.forEach((id, i) => namesPackage(`Order[${i}]`, id));

    const deferred = t.list("Deferred", plan.Deferred).map((d, i) => ({
      candidate: namesCandidate(`Deferred[${i}].Candidate`, d.Candidate),
      reason: nonEmpty(`Deferred[${i}].Reason`, d.Reason),
    }));
    distinct("Deferred", deferred.map((d) => `${d.candidate}\u0000${d.reason}`));

    const admissions: FormationAdmissionBlock[] = t.entries("Admissions", plan.Admissions).map(([key, a]) => {
      const path = `Admissions[${key}]`;
      keyMatches(path, key, a.ID);
      return importAdmission(a, path, t, namesCandidate, namesPackage, namesItem);
    });
    const admissionIds = new Set(admissions.map((a) => a.id));

    const active_items = t.entries("ActiveItems", plan.ActiveItems).map(([item_id, admission_id]) => {
      namesItem(`ActiveItems[${item_id}]`, item_id);
      nonEmpty(`ActiveItems[${item_id}]`, admission_id);
      if (!admissionIds.has(admission_id)) unresolved(`ActiveItems[${item_id}]`, `names admission "${admission_id}", which formation.admissions does not hold`);
      return { item_id, admission_id };
    });

    const formation: FormationBlock = {
      id: nonEmpty("ID", plan.ID),
      revision: jsonShaOrNull("Revision", plan.Revision),
      policy_version: nonEmpty("PolicyVersion", plan.PolicyVersion),
      accepted_revision: opaque("AcceptedRevision", plan.AcceptedRevision),
      remaining_budget: integer("RemainingBudget", plan.RemainingBudget),
      policy: inputs.policy == null ? null : importFormationPolicy(inputs.policy),
      candidates,
      packages,
      order,
      deferred,
      admissions,
      active_items,
    };
    return { formation, provenance: { source: "imported", legacy_fields: legacyFields(t) } };
  });
  return { ...result, inventory };
}

function importFormationCandidate(c: PriorFormationCandidate, path: string, t: EmptyTracker): FormationCandidateBlock {
  const at = (f: string): string => `${path}.${f}`;
  return {
    id: nonEmpty(at("ID"), c.ID),
    purpose: c.Purpose,
    version: positive(at("Version"), c.Version),
    resources: stringSet(at("Resources"), t.list(`${path}.Resources`, c.Resources)),
    dependencies: stringSet(at("Dependencies"), t.list(`${path}.Dependencies`, c.Dependencies)),
    // Signed: the legacy Form path bounds maxima but never rejected a negative metric.
    risk: integer(at("Risk"), c.Risk),
    validation_cost: integer(at("ValidationCost"), c.ValidationCost),
    estimated_size: integer(at("EstimatedSize"), c.EstimatedSize),
    qualified: boolean(at("Qualified"), c.Qualified),
    selected: boolean(at("Selected"), c.Selected),
  };
}

function importPackage(p: PriorPackage, path: string, t: EmptyTracker): FormationPackageBlock {
  const at = (f: string): string => `${path}.${f}`;
  const state = oneOf(at("State"), nonEmpty(at("State"), p.State), VOCABULARY.packageState());
  const failure_reason = emptyToNull(p.FailureReason);
  // `failed` is the one state that requires a reason (Complete(false) writes
  // it). `stale` is the other state that carries one (RefreshCandidate writes
  // "candidate source/evidence changed"), admitted, never required.
  if (state === "failed" && failure_reason === null) invalid(at("FailureReason"), "state failed carries a failure reason");
  return {
    id: nonEmpty(at("ID"), p.ID),
    members: stringSet(at("Members"), t.list(`${path}.Members`, p.Members)),
    dependencies: stringSet(at("Dependencies"), t.list(`${path}.Dependencies`, p.Dependencies)),
    resources: stringSet(at("Resources"), t.list(`${path}.Resources`, p.Resources)),
    reasons: t.list(`${path}.Reasons`, p.Reasons),
    risk: integer(at("Risk"), p.Risk), // signed, as on the formation candidate
    validation_cost: integer(at("ValidationCost"), p.ValidationCost),
    estimated_size: integer(at("EstimatedSize"), p.EstimatedSize),
    state,
    base_revision: opaque(at("BaseRevision"), p.BaseRevision),
    accepted_revision: opaqueOrNull(at("AcceptedRevision"), p.AcceptedRevision),
    baseline_hash: opaqueOrNull(at("BaselineHash"), p.BaselineHash),
    failure_reason,
  };
}

function importAdmission(
  a: PriorAdmission,
  path: string,
  t: EmptyTracker,
  namesCandidate: (path: string, id: string) => string,
  namesPackage: (path: string, id: string) => string,
  namesItem: (path: string, id: string) => string,
): FormationAdmissionBlock {
  const at = (f: string): string => `${path}.${f}`;
  const attempts = t.list(`${path}.Attempts`, a.Attempts).map((x, i) => ({
    candidate: namesCandidate(`${at("Attempts")}[${i}].Candidate`, x.Candidate),
    candidate_version: positive(`${at("Attempts")}[${i}].CandidateVersion`, x.CandidateVersion),
    attempt: positive(`${at("Attempts")}[${i}].Attempt`, x.Attempt),
    item_id: namesItem(`${at("Attempts")}[${i}].ItemID`, nonEmpty(`${at("Attempts")}[${i}].ItemID`, x.ItemID)),
  }));
  distinct(at("Attempts"), attempts.map((x) => JSON.stringify([x.candidate, x.candidate_version, x.attempt, x.item_id])));
  return {
    id: nonEmpty(at("ID"), a.ID),
    package_id: namesPackage(at("PackageID"), a.PackageID),
    status: oneOf(at("Status"), nonEmpty(at("Status"), a.Status), VOCABULARY.admissionStatus()),
    lease_ref: emptyToNull(a.LeaseRef),
    workbench_revision: opaqueOrNull(at("WorkbenchRevision"), a.WorkbenchRevision),
    attempts,
  };
}

function importFormationPolicy(p: PriorFormationPolicy): FormationBlock["policy"] {
  return {
    version: nonEmpty("Policy.Version", p.Version),
    max_risk: positive("Policy.MaxRisk", p.MaxRisk),
    max_validation_cost: positive("Policy.MaxValidationCost", p.MaxValidationCost),
    max_size: positive("Policy.MaxSize", p.MaxSize),
    budget: nonNegative("Policy.Budget", p.Budget),
  };
}

// --- export -----------------------------------------------------------------

export function exportPlan(imported: ImportedPlan): PriorResult<ExportedPlan> {
  return guarded(() => {
    const t = trackerFrom(imported.provenance?.legacy_fields, "formation");
    const f = imported.formation;

    const candidates: Array<[string, PriorFormationCandidate]> = f.candidates.map((c) => {
      const path = `Candidates[${c.id}]`;
      return [
        c.id,
        {
          ID: c.id,
          Purpose: c.purpose,
          Version: c.version,
          Resources: t.unlist(`${path}.Resources`, c.resources),
          Dependencies: t.unlist(`${path}.Dependencies`, c.dependencies),
          Risk: c.risk,
          ValidationCost: c.validation_cost,
          EstimatedSize: c.estimated_size,
          Qualified: c.qualified,
          Selected: c.selected,
        },
      ];
    });
    const packages: Array<[string, PriorPackage]> = f.packages.map((p) => {
      const path = `Packages[${p.id}]`;
      return [
        p.id,
        {
          ID: p.id,
          Members: t.unlist(`${path}.Members`, p.members),
          Dependencies: t.unlist(`${path}.Dependencies`, p.dependencies),
          Resources: t.unlist(`${path}.Resources`, p.resources),
          Reasons: t.unlist(`${path}.Reasons`, p.reasons),
          Risk: p.risk,
          ValidationCost: p.validation_cost,
          EstimatedSize: p.estimated_size,
          State: p.state,
          BaseRevision: unOpaque(`formation.packages[${p.id}].base_revision`, p.base_revision),
          AcceptedRevision: unOpaque(`formation.packages[${p.id}].accepted_revision`, p.accepted_revision),
          BaselineHash: unOpaque(`formation.packages[${p.id}].baseline_hash`, p.baseline_hash),
          FailureReason: nullToEmpty(p.failure_reason),
        },
      ];
    });
    const admissions: Array<[string, PriorAdmission]> = f.admissions.map((a) => {
      const path = `Admissions[${a.id}]`;
      return [
        a.id,
        {
          ID: a.id,
          PackageID: a.package_id,
          Status: a.status,
          LeaseRef: nullToEmpty(a.lease_ref),
          WorkbenchRevision: unOpaque(`formation.admissions[${a.id}].workbench_revision`, a.workbench_revision),
          Attempts: t.unlist(
            `${path}.Attempts`,
            a.attempts.map((x) => ({ Candidate: x.candidate, CandidateVersion: x.candidate_version, Attempt: x.attempt, ItemID: x.item_id })),
          ),
        },
      ];
    });

    const plan: PriorPlan = {
      ID: f.id,
      Revision: unJsonSha("formation.revision", f.revision),
      PolicyVersion: f.policy_version,
      AcceptedRevision: unOpaque("formation.accepted_revision", f.accepted_revision),
      RemainingBudget: f.remaining_budget,
      Candidates: t.unentries("Candidates", candidates),
      Packages: t.unentries("Packages", packages),
      Order: t.unlist("Order", f.order),
      Deferred: t.unlist("Deferred", f.deferred.map((d) => ({ Candidate: d.candidate, Reason: d.reason }))),
      Admissions: t.unentries("Admissions", admissions),
      ActiveItems: t.unentries("ActiveItems", f.active_items.map((e) => [e.item_id, e.admission_id])),
    };
    const policy: PriorFormationPolicy | null =
      f.policy === null
        ? null
        : { Version: f.policy.version, MaxRisk: f.policy.max_risk, MaxValidationCost: f.policy.max_validation_cost, MaxSize: f.policy.max_size, Budget: f.policy.budget };
    return { plan, policy };
  });
}

// Re-exported for callers that check a state's proposal without importing common.
export { proposedPackageStatus } from "./common.js";

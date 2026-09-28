// ---------------------------------------------------------------------------
// campaign.State <-> fusion.campaign/v1 charter and state blocks.
//
// Row by row from `codec/contract/prior-mapping.json` (aggregates
// `campaign.*`). The embedded `Charter` is hoisted to the campaign root and
// the rest of `State` becomes the `state` block with its `Revision` and
// `CharterHash` typed; export embeds the charter again. State values are
// Prior's own vocabulary, carried by value: a campaign is not a package and
// nothing here maps onto a fusion status.
//
// `CompletionEvidence` is a `Finalize` input at 12d8424, not a State field.
// The import takes it as an optional side input and writes `null` otherwise.
//
// The five charter lists keep their stored order and multiplicity (FJ00
// response 2): Prior never deduplicates them and `CharterHash` is computed
// over the original slice, so a repeated entry is carried, not refused.
// `Charter.Validate` still requires `ItemKinds`, `CandidateSources` and
// `WorkflowTemplates` non-empty.
// ---------------------------------------------------------------------------

import type { CampaignStateBlock, CharterBlock, ImportedCampaignState } from "./blocks.js";
import {
  EmptyTracker,
  VOCABULARY,
  atLeastOne,
  boolean,
  emptyToNull,
  guarded,
  invalid,
  jsonSha,
  jsonShaOrNull,
  legacyFields,
  nonEmpty,
  nonNegative,
  nullToEmpty,
  oneOf,
  opaque,
  opaqueOrNull,
  positive,
  trackerFrom,
  unJsonSha,
  unOpaque,
  type PriorResult,
} from "./common.js";
import type { PriorCampaignState, PriorCharter, PriorCompletionEvidence } from "./types.js";

export interface CampaignInputs {
  /** The evidence handed to Finalize, when known; `state.completion_evidence` is null otherwise. */
  completionEvidence?: PriorCompletionEvidence | null;
}

export interface ExportedCampaignState {
  state: PriorCampaignState;
  completionEvidence: PriorCompletionEvidence | null;
}

/** campaign.go `Archive`: the states a campaign leaves for archived. */
const PREVIOUS_TERMINAL: ReadonlySet<string> = new Set(["completed", "bounded", "failed", "cancelled"]);

// --- import -----------------------------------------------------------------

export function importCampaignState(s: PriorCampaignState, inputs: CampaignInputs = {}): PriorResult<ImportedCampaignState> {
  return guarded(() => {
    const t = new EmptyTracker();
    const charter = importCharter(s.Charter, t);

    const campaign_id = nonEmpty("CampaignID", s.CampaignID);
    if (campaign_id !== charter.campaign_id) invalid("CampaignID", `differs from Charter.CampaignID "${charter.campaign_id}"`);

    const state = oneOf("State", nonEmpty("State", s.State), VOCABULARY.campaignState());
    const previous_terminal = emptyToNull(s.PreviousTerminal);
    if (previous_terminal !== null) oneOf("PreviousTerminal", previous_terminal, PREVIOUS_TERMINAL);
    if ((state === "archived") !== (previous_terminal !== null)) {
      invalid("PreviousTerminal", "set exactly when the state is archived");
    }
    const requested_outcome = emptyToNull(s.RequestedOutcome);
    if (requested_outcome !== null) oneOf("RequestedOutcome", requested_outcome, VOCABULARY.requestedOutcome());

    const ce = inputs.completionEvidence;
    const block: CampaignStateBlock = {
      campaign_id,
      revision: jsonShaOrNull("Revision", s.Revision),
      state,
      previous_terminal,
      reason: emptyToNull(s.Reason),
      charter_hash: jsonSha("CharterHash", nonEmpty("CharterHash", s.CharterHash)),
      counters: {
        attempts: nonNegative("Counters.Attempts", s.Counters.Attempts),
        failures: nonNegative("Counters.Failures", s.Counters.Failures),
        consecutive_failures: nonNegative("Counters.ConsecutiveFailures", s.Counters.ConsecutiveFailures),
        reviews: nonNegative("Counters.Reviews", s.Counters.Reviews),
        resource_units: nonNegative("Counters.ResourceUnits", s.Counters.ResourceUnits),
      },
      settlement: {
        owned_runs: nonNegative("Settlement.OwnedRuns", s.Settlement.OwnedRuns),
        open_intents: nonNegative("Settlement.OpenIntents", s.Settlement.OpenIntents),
        unknown_effects: nonNegative("Settlement.UnknownEffects", s.Settlement.UnknownEffects),
        quarantined: nonNegative("Settlement.Quarantined", s.Settlement.Quarantined),
      },
      requested_outcome,
      sessions: t.list("Sessions", s.Sessions),
      runs: t.list("Runs", s.Runs),
      baseline_hash: opaqueOrNull("BaselineHash", s.BaselineHash),
      completion_evidence:
        ce == null
          ? null
          : {
              objective_met: boolean("CompletionEvidence.ObjectiveMet", ce.ObjectiveMet),
              intake_closed: boolean("CompletionEvidence.IntakeClosed", ce.IntakeClosed),
              all_attempts_terminal: boolean("CompletionEvidence.AllAttemptsTerminal", ce.AllAttemptsTerminal),
              final_audit_passed: boolean("CompletionEvidence.FinalAuditPassed", ce.FinalAuditPassed),
              watermark: emptyToNull(ce.Watermark),
              audit_ref: emptyToNull(ce.AuditRef),
            },
    };
    return { charter, state: block, provenance: { source: "imported", legacy_fields: legacyFields(t) } };
  });
}

function importCharter(c: PriorCharter, t: EmptyTracker): CharterBlock {
  const at = (f: string): string => `Charter.${f}`;
  if (c.SchemaVersion !== 1) invalid(at("SchemaVersion"), `Charter.Validate accepts 1 only, got ${JSON.stringify(c.SchemaVersion)}`);
  if (c.Objective.trim() === "") invalid(at("Objective"), "Charter.Validate refuses a whitespace-only objective");
  // At least one entry, each a non-empty string (the schema's string_list_nonempty); order and duplicates as stored.
  const required = (f: string, v: string[] | null): string[] => atLeastOne(at(f), v).map((s) => nonEmpty(at(f), s));
  return {
    schema_version: 1,
    campaign_id: nonEmpty(at("CampaignID"), c.CampaignID),
    revision: opaque(at("Revision"), c.Revision),
    authorisation_ref: nonEmpty(at("AuthorisationRef"), c.AuthorisationRef),
    objective: c.Objective,
    item_kinds: required("ItemKinds", c.ItemKinds),
    candidate_sources: required("CandidateSources", c.CandidateSources),
    workflow_templates: required("WorkflowTemplates", c.WorkflowTemplates),
    stop_conditions: t.list("Charter.StopConditions", c.StopConditions),
    intake_policy: nonEmpty(at("IntakePolicy"), c.IntakePolicy),
    selection_policy: nonEmpty(at("SelectionPolicy"), c.SelectionPolicy),
    package_policy: nonEmpty(at("PackagePolicy"), c.PackagePolicy),
    acceptance_policy: nonEmpty(at("AcceptancePolicy"), c.AcceptancePolicy),
    autonomy_policy: nonEmpty(at("AutonomyPolicy"), c.AutonomyPolicy),
    backend_policy: nonEmpty(at("BackendPolicy"), c.BackendPolicy),
    delivery_policy: nonEmpty(at("DeliveryPolicy"), c.DeliveryPolicy),
    data_boundary: t.list("Charter.DataBoundary", c.DataBoundary),
    capabilities: t.list("Charter.Capabilities", c.Capabilities),
    budget_account: nonEmpty(at("BudgetAccount"), c.BudgetAccount),
    limits: {
      max_attempts: positive(at("Limits.MaxAttempts"), c.Limits.MaxAttempts),
      max_failures: nonNegative(at("Limits.MaxFailures"), c.Limits.MaxFailures),
      max_consecutive_failures: positive(at("Limits.MaxConsecutiveFailures"), c.Limits.MaxConsecutiveFailures),
      max_reviews: positive(at("Limits.MaxReviews"), c.Limits.MaxReviews),
      resource_units: positive(at("Limits.ResourceUnits"), c.Limits.ResourceUnits),
    },
  };
}

// --- export -----------------------------------------------------------------

export function exportCampaignState(imported: ImportedCampaignState): PriorResult<ExportedCampaignState> {
  return guarded(() => {
    const t = trackerFrom(imported.provenance?.legacy_fields, "campaign");
    const c = imported.charter;
    const s = imported.state;
    const charter: PriorCharter = {
      SchemaVersion: c.schema_version,
      CampaignID: c.campaign_id,
      Revision: unOpaque("charter.revision", c.revision),
      AuthorisationRef: c.authorisation_ref,
      Objective: c.objective,
      ItemKinds: [...c.item_kinds],
      CandidateSources: [...c.candidate_sources],
      WorkflowTemplates: [...c.workflow_templates],
      StopConditions: t.unlist("Charter.StopConditions", c.stop_conditions),
      IntakePolicy: c.intake_policy,
      SelectionPolicy: c.selection_policy,
      PackagePolicy: c.package_policy,
      AcceptancePolicy: c.acceptance_policy,
      AutonomyPolicy: c.autonomy_policy,
      BackendPolicy: c.backend_policy,
      DeliveryPolicy: c.delivery_policy,
      DataBoundary: t.unlist("Charter.DataBoundary", c.data_boundary),
      Capabilities: t.unlist("Charter.Capabilities", c.capabilities),
      BudgetAccount: c.budget_account,
      Limits: {
        MaxAttempts: c.limits.max_attempts,
        MaxFailures: c.limits.max_failures,
        MaxConsecutiveFailures: c.limits.max_consecutive_failures,
        MaxReviews: c.limits.max_reviews,
        ResourceUnits: c.limits.resource_units,
      },
    };
    const state: PriorCampaignState = {
      CampaignID: s.campaign_id,
      Revision: unJsonSha("state.revision", s.revision),
      State: s.state,
      PreviousTerminal: nullToEmpty(s.previous_terminal),
      Reason: nullToEmpty(s.reason),
      Charter: charter,
      CharterHash: unJsonSha("state.charter_hash", s.charter_hash),
      Counters: {
        Attempts: s.counters.attempts,
        Failures: s.counters.failures,
        ConsecutiveFailures: s.counters.consecutive_failures,
        Reviews: s.counters.reviews,
        ResourceUnits: s.counters.resource_units,
      },
      Settlement: {
        OwnedRuns: s.settlement.owned_runs,
        OpenIntents: s.settlement.open_intents,
        UnknownEffects: s.settlement.unknown_effects,
        Quarantined: s.settlement.quarantined,
      },
      RequestedOutcome: nullToEmpty(s.requested_outcome),
      Sessions: t.unlist("Sessions", s.sessions),
      Runs: t.unlist("Runs", s.runs),
      BaselineHash: unOpaque("state.baseline_hash", s.baseline_hash),
    };
    const ce = s.completion_evidence;
    const completionEvidence: PriorCompletionEvidence | null =
      ce === null
        ? null
        : {
            ObjectiveMet: ce.objective_met,
            IntakeClosed: ce.intake_closed,
            AllAttemptsTerminal: ce.all_attempts_terminal,
            FinalAuditPassed: ce.final_audit_passed,
            Watermark: nullToEmpty(ce.watermark),
            AuditRef: nullToEmpty(ce.audit_ref),
          };
    return { state, completionEvidence };
  });
}

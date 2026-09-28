// ---------------------------------------------------------------------------
// The fusion-side shapes the Prior mapping produces and consumes.
//
// Each type here is one block of a fusion record as `codec/schemas/` defines
// it: the `candidate` block of an issue's control (`record.schema.json`
// `$defs/candidate`), and the `register`, `formation`, `charter` and `state`
// blocks of a campaign (`campaign.schema.json`). The mapping returns blocks,
// not whole records: the envelope around them (record ids, workbench id,
// narrative path, filer, the provenance backup) belongs to the migration that
// places them, and an import never invents any of it.
// ---------------------------------------------------------------------------

/** `prior-json-sha256:<64 hex>`: a Prior hash over Go's marshalling, typed. */
export type PriorJsonSha256 = `prior-json-sha256:${string}`;

/** `prior-opaque:<raw>`: a Prior revision or label whose encoding fusion does not know. */
export type PriorOpaque = `prior-opaque:${string}`;

/**
 * The provenance fragment every import stamps. `backup` is the migration's
 * to add (`common.schema.json` requires it on an imported record); the
 * mapping cannot know where the original was saved.
 */
export interface ImportProvenance {
  source: "imported";
  legacy_fields: LegacyFields;
}

/**
 * What the mapping removed or split, verbatim, so that export can put it
 * back. `empty_collections` lists the Go paths (relative to the aggregate or
 * the candidate) whose slice or map was empty but not nil on disk: fusion
 * holds both as `[]`, and without this list export could not tell `[]` from
 * `null` again.
 */
export interface LegacyFields {
  empty_collections: string[];
  [field: string]: unknown;
}

// --- fusion.record/v1 candidate block ----------------------------------------

export interface CandidateSourceBlock {
  id: string;
  revision: PriorOpaque;
  watermark: string;
  refresh_policy: string;
}

export interface CandidateEvidenceBlock {
  ref: string;
  revision: PriorOpaque;
}

export interface QualificationBlock {
  candidate_version: number;
  source_revision: PriorOpaque;
  evidence_hash: PriorJsonSha256;
  passed: boolean;
  reasons: string[];
  checked_at: string;
}

export interface SelectionBlock {
  candidate_version: number;
  policy_version: string | null;
  snapshot_hash: PriorJsonSha256 | null;
  outcome: string;
  score: number;
  reasons: string[];
}

export interface AdmissionBlock {
  work_item_id: string;
  current_attempt: number;
}

export interface CandidateBlock {
  prior_id: string;
  schema_version: 1;
  stable_key: string;
  item_kind: string;
  version: number;
  source: CandidateSourceBlock;
  evidence: CandidateEvidenceBlock[];
  reproduction: string[];
  severity: number;
  confidence: number;
  estimated_scope: number;
  risk: number;
  affected_resources: string[];
  dependencies: string[];
  qualification: QualificationBlock | null;
  selection: SelectionBlock | null;
  admission: AdmissionBlock | null;
  merge_into: string | null;
}

/** One issue-to-be: its candidate block and the provenance its record carries. */
export interface ImportedCandidate {
  candidate: CandidateBlock;
  provenance: ImportProvenance;
}

// --- fusion.campaign/v1 register block ---------------------------------------

export interface PolicyBlock {
  version: string;
  predicates: Array<{ field: string; operator: string; value: number }>;
  weights: Array<{ field: string; multiplier: number }>;
  minimum_score: number;
  maximum_risk: number;
}

export interface SnapshotBlock {
  watermark: string;
  versions: Array<{ candidate_id: string; version: number }>;
  source_revisions: Array<{ candidate_id: string; revision: PriorOpaque }>;
}

export interface RegisterBlock {
  id: string;
  revision: PriorJsonSha256 | null;
  stable: Array<{ stable_key: string; candidate_id: string }>;
  watermarks: Array<{ source_id: string; watermark: string }>;
  intake_closed: boolean;
  closed_watermark: string | null;
  policy: PolicyBlock | null;
  snapshot: SnapshotBlock | null;
}

export interface ImportedRegister {
  register: RegisterBlock;
  candidates: ImportedCandidate[];
  provenance: ImportProvenance;
}

// --- fusion.campaign/v1 formation block --------------------------------------

export interface FormationPolicyBlock {
  version: string;
  max_risk: number;
  max_validation_cost: number;
  max_size: number;
  budget: number;
}

export interface FormationCandidateBlock {
  id: string;
  purpose: string;
  version: number;
  resources: string[];
  dependencies: string[];
  risk: number;
  validation_cost: number;
  estimated_size: number;
  qualified: boolean;
  selected: boolean;
}

export interface FormationPackageBlock {
  id: string;
  members: string[];
  dependencies: string[];
  resources: string[];
  reasons: string[];
  risk: number;
  validation_cost: number;
  estimated_size: number;
  state: string;
  base_revision: PriorOpaque;
  accepted_revision: PriorOpaque | null;
  baseline_hash: PriorOpaque | null;
  failure_reason: string | null;
}

export interface AttemptBlock {
  candidate: string;
  candidate_version: number;
  attempt: number;
  item_id: string;
}

export interface FormationAdmissionBlock {
  id: string;
  package_id: string;
  status: string;
  lease_ref: string | null;
  workbench_revision: PriorOpaque | null;
  attempts: AttemptBlock[];
}

export interface FormationBlock {
  id: string;
  revision: PriorJsonSha256 | null;
  policy_version: string;
  accepted_revision: PriorOpaque;
  remaining_budget: number;
  policy: FormationPolicyBlock | null;
  candidates: FormationCandidateBlock[];
  packages: FormationPackageBlock[];
  order: string[];
  deferred: Array<{ candidate: string; reason: string }>;
  admissions: FormationAdmissionBlock[];
  active_items: Array<{ item_id: string; admission_id: string }>;
}

export interface ImportedPlan {
  formation: FormationBlock;
  provenance: ImportProvenance;
}

// --- fusion.campaign/v1 charter and state blocks -----------------------------

export interface LimitsBlock {
  max_attempts: number;
  max_failures: number;
  max_consecutive_failures: number;
  max_reviews: number;
  resource_units: number;
}

export interface CharterBlock {
  schema_version: 1;
  campaign_id: string;
  revision: PriorOpaque;
  authorisation_ref: string;
  objective: string;
  item_kinds: string[];
  candidate_sources: string[];
  workflow_templates: string[];
  stop_conditions: string[];
  intake_policy: string;
  selection_policy: string;
  package_policy: string;
  acceptance_policy: string;
  autonomy_policy: string;
  backend_policy: string;
  delivery_policy: string;
  data_boundary: string[];
  capabilities: string[];
  budget_account: string;
  limits: LimitsBlock;
}

export interface CountersBlock {
  attempts: number;
  failures: number;
  consecutive_failures: number;
  reviews: number;
  resource_units: number;
}

export interface SettlementBlock {
  owned_runs: number;
  open_intents: number;
  unknown_effects: number;
  quarantined: number;
}

export interface CompletionEvidenceBlock {
  objective_met: boolean;
  intake_closed: boolean;
  all_attempts_terminal: boolean;
  final_audit_passed: boolean;
  watermark: string | null;
  audit_ref: string | null;
}

export interface CampaignStateBlock {
  campaign_id: string;
  revision: PriorJsonSha256 | null;
  state: string;
  previous_terminal: string | null;
  reason: string | null;
  charter_hash: PriorJsonSha256;
  counters: CountersBlock;
  settlement: SettlementBlock;
  requested_outcome: string | null;
  sessions: string[];
  runs: string[];
  baseline_hash: PriorOpaque | null;
  completion_evidence: CompletionEvidenceBlock | null;
}

export interface ImportedCampaignState {
  charter: CharterBlock;
  state: CampaignStateBlock;
  provenance: ImportProvenance;
}

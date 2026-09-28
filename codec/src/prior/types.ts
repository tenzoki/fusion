// ---------------------------------------------------------------------------
// Prior's three persisted aggregates in their on-disk shape.
//
// These types mirror the Go structs of Prior `12d8424` verbatim as
// `encoding/json` emits them without tags (`codec/fixtures/prior/source-structs.txt`
// is the checked-in copy): keys are the Go field names in declaration order,
// a nil slice is `null` and an empty one `[]`, a nil map is `null` and an
// empty one `{}`, a nil pointer is `null`, `time.Time` is an RFC 3339 string,
// and every integer is a JSON number. Nothing here is the snake_case input
// contract under Prior's `modules/fusion/schemas/`; that is a different shape.
//
// `GoSlice` and `GoMap` keep the nil/empty distinction visible in the type,
// because a lossless round trip has to reproduce it byte for byte.
// ---------------------------------------------------------------------------

/** A Go slice as encoding/json writes it: `null` when nil, an array otherwise. */
export type GoSlice<T> = T[] | null;

/** A Go `map[string]T` as encoding/json writes it: `null` when nil, an object otherwise. */
export type GoMap<T> = Record<string, T> | null;

/** A Go `time.Time` as encoding/json writes it: RFC 3339 with nanoseconds when present. */
export type GoTime = string;

// --- modules/fusion/candidates/register.go:20-77 ---------------------------

export interface PriorSource {
  ID: string;
  Revision: string;
  Watermark: string;
  RefreshPolicy: string;
}

export interface PriorEvidence {
  Ref: string;
  Revision: string;
}

export interface PriorQualification {
  CandidateVersion: number;
  SourceRevision: string;
  EvidenceHash: string;
  Passed: boolean;
  Reasons: GoSlice<string>;
  CheckedAt: GoTime;
}

export interface PriorDisposition {
  CandidateVersion: number;
  PolicyVersion: string;
  SnapshotHash: string;
  Outcome: string;
  WorkItemID: string;
  CurrentAttempt: number;
  Score: number;
  Reasons: GoSlice<string>;
}

export interface PriorCandidate {
  SchemaVersion: number;
  ID: string;
  StableKey: string;
  Kind: string;
  Statement: string;
  Purpose: string;
  Version: number;
  Source: PriorSource;
  Evidence: GoSlice<PriorEvidence>;
  Reproduction: GoSlice<string>;
  Severity: number;
  Confidence: number;
  EstimatedScope: number;
  Risk: number;
  AffectedResources: GoSlice<string>;
  Dependencies: GoSlice<string>;
  Qualification: PriorQualification | null;
  Disposition: PriorDisposition | null;
  MergeInto: string;
}

export interface PriorRegister {
  ID: string;
  Revision: string;
  Candidates: GoMap<PriorCandidate>;
  Stable: GoMap<string>;
  Watermarks: GoMap<string>;
  IntakeClosed: boolean;
  ClosedWatermark: string;
}

export interface PriorPredicate {
  Field: string;
  Operator: string;
  Value: number;
}

export interface PriorWeight {
  Field: string;
  Multiplier: number;
}

/** A `Select` input at 12d8424, not a Register field; carried beside the register when known. */
export interface PriorPolicy {
  Version: string;
  Predicates: GoSlice<PriorPredicate>;
  Weights: GoSlice<PriorWeight>;
  MinimumScore: number;
  MaximumRisk: number;
}

/** A `Select` input at 12d8424, not a Register field; its hash is `Disposition.SnapshotHash`. */
export interface PriorSnapshot {
  Watermark: string;
  Versions: GoMap<number>;
  SourceRevisions: GoMap<string>;
}

// --- modules/fusion/packages/packages.go:19-56 -----------------------------

export interface PriorFormationCandidate {
  ID: string;
  Purpose: string;
  Version: number;
  Resources: GoSlice<string>;
  Dependencies: GoSlice<string>;
  Risk: number;
  ValidationCost: number;
  EstimatedSize: number;
  Qualified: boolean;
  Selected: boolean;
}

/** A `Form` input at 12d8424; only its Version persists, as `Plan.PolicyVersion`. */
export interface PriorFormationPolicy {
  Version: string;
  MaxRisk: number;
  MaxValidationCost: number;
  MaxSize: number;
  Budget: number;
}

export interface PriorPackage {
  ID: string;
  Members: GoSlice<string>;
  Dependencies: GoSlice<string>;
  Resources: GoSlice<string>;
  Reasons: GoSlice<string>;
  Risk: number;
  ValidationCost: number;
  EstimatedSize: number;
  State: string;
  BaseRevision: string;
  AcceptedRevision: string;
  BaselineHash: string;
  FailureReason: string;
}

export interface PriorDeferred {
  Candidate: string;
  Reason: string;
}

export interface PriorAttempt {
  Candidate: string;
  CandidateVersion: number;
  Attempt: number;
  ItemID: string;
}

export interface PriorAdmission {
  ID: string;
  PackageID: string;
  Status: string;
  LeaseRef: string;
  WorkbenchRevision: string;
  Attempts: GoSlice<PriorAttempt>;
}

export interface PriorPlan {
  ID: string;
  Revision: string;
  PolicyVersion: string;
  AcceptedRevision: string;
  RemainingBudget: number;
  Candidates: GoMap<PriorFormationCandidate>;
  Packages: GoMap<PriorPackage>;
  Order: GoSlice<string>;
  Deferred: GoSlice<PriorDeferred>;
  Admissions: GoMap<PriorAdmission>;
  ActiveItems: GoMap<string>;
}

// --- modules/fusion/campaign/campaign.go:21-53 -----------------------------

export interface PriorLimits {
  MaxAttempts: number;
  MaxFailures: number;
  MaxConsecutiveFailures: number;
  MaxReviews: number;
  ResourceUnits: number;
}

export interface PriorCharter {
  SchemaVersion: number;
  CampaignID: string;
  Revision: string;
  AuthorisationRef: string;
  Objective: string;
  ItemKinds: GoSlice<string>;
  CandidateSources: GoSlice<string>;
  WorkflowTemplates: GoSlice<string>;
  StopConditions: GoSlice<string>;
  IntakePolicy: string;
  SelectionPolicy: string;
  PackagePolicy: string;
  AcceptancePolicy: string;
  AutonomyPolicy: string;
  BackendPolicy: string;
  DeliveryPolicy: string;
  DataBoundary: GoSlice<string>;
  Capabilities: GoSlice<string>;
  BudgetAccount: string;
  Limits: PriorLimits;
}

export interface PriorCounters {
  Attempts: number;
  Failures: number;
  ConsecutiveFailures: number;
  Reviews: number;
  ResourceUnits: number;
}

export interface PriorSettlement {
  OwnedRuns: number;
  OpenIntents: number;
  UnknownEffects: number;
  Quarantined: number;
}

/** A `Finalize` input at 12d8424, not a State field; carried beside the state when known. */
export interface PriorCompletionEvidence {
  ObjectiveMet: boolean;
  IntakeClosed: boolean;
  AllAttemptsTerminal: boolean;
  FinalAuditPassed: boolean;
  Watermark: string;
  AuditRef: string;
}

export interface PriorCampaignState {
  CampaignID: string;
  Revision: string;
  State: string;
  PreviousTerminal: string;
  Reason: string;
  Charter: PriorCharter;
  CharterHash: string;
  Counters: PriorCounters;
  Settlement: PriorSettlement;
  RequestedOutcome: string;
  Sessions: GoSlice<string>;
  Runs: GoSlice<string>;
  BaselineHash: string;
}

/** The three aggregates whose `Revision` Prior computes over the marshalled value. */
export type PriorAggregate = PriorRegister | PriorPlan | PriorCampaignState;

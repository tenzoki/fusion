// ---------------------------------------------------------------------------
// The transition and dependency rules, as code over the two contract tables.
//
// `contract/transitions.json` names, per controlled kind, the state set, the
// terminal subset, every allowed edge, the claim rule per package state and
// the outcome classes a terminal state admits; `contract/dependencies.json`
// names the two conditions a `depends_on` edge may carry. This module reads
// both once at load and answers two questions from them and nothing else:
//
//   allowed(kind, from, to, payload)     may this record move from here to there?
//   dependencySatisfied(condition, target)  does this target satisfy this edge?
//
// Every refusal is one of the spec's typed errors (section 6). For a
// transition: `conflict` when the table lists no such edge (a terminal state
// left, a state re-entered, a step not in the table's order); `schema-invalid`
// when the edge exists but the payload breaks a rule the target state
// imposes (a claim where the table forbids one, no claim where it requires
// one, an outcome on a live state or a class the terminal state does not
// admit, a decision edge without the reference it requires, an issue closed
// without a disposition). For a dependency: `schema-invalid` for a condition
// the table does not know, `conflict` while the target has not reached the
// condition's status, `missing-evidence` when `succeeded` finds no accepted
// evidence at the binding's revision, `unresolved-reference` when a binding
// names an evidence record the caller could not supply.
//
// The package matrix is applied to packages only; the record kinds carry
// their own vocabularies. Nothing here reads a file system beyond the tables,
// and nothing here changes state: it says whether a change would be legal.
// ---------------------------------------------------------------------------

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { strictParse } from "./strict-json.js";

export const CONTRACT_DIR = fileURLToPath(new URL("../contract/", import.meta.url));

// --- the tables -------------------------------------------------------------

export interface Edge {
  from: string;
  to: string;
  operation?: string;
  /** A decision edge names the reference the target state needs. */
  requires?: string;
}

export interface KindTable {
  schema: string;
  field: string;
  states: string[];
  terminal: string[];
  edges: Edge[];
  markers?: Record<string, string>;
  claim?: Record<string, "required" | "forbidden" | "optional">;
  outcome_classes?: Record<string, string[]>;
  step_states?: string[];
  step_edges?: Edge[];
  reopen: string;
  notes: string[];
}

export interface TransitionsTable {
  description: string;
  sources: string[];
  kinds: Record<string, KindTable>;
}

export interface DependencyCondition {
  description: string;
  target_status: string[];
  outcome_class: string[] | null;
  evidence: {
    source: string;
    min_accepted: number;
    accepted_means: { record_schema: string; verdict: string[]; revision_matches: boolean };
  } | null;
  legacy_default: boolean;
}

export interface DependenciesTable {
  description: string;
  sources: string[];
  conditions: Record<string, DependencyCondition>;
  legacy_edge_condition: string;
  refusals: Record<string, string>;
  notes: string[];
}

function readTable<T>(file: string): T {
  const abs = CONTRACT_DIR + file;
  const parsed = strictParse(readFileSync(abs));
  if (!parsed.ok) throw new Error(`${abs}: ${parsed.reason}: ${parsed.detail}`);
  return parsed.value as T;
}

let transitionsTable: TransitionsTable | undefined;
let dependenciesTable: DependenciesTable | undefined;

export const transitions = (): TransitionsTable => (transitionsTable ??= readTable<TransitionsTable>("transitions.json"));
export const dependencies = (): DependenciesTable => (dependenciesTable ??= readTable<DependenciesTable>("dependencies.json"));

/** The kinds the table controls, in the table's order. */
export const kinds = (): string[] => Object.keys(transitions().kinds);

// --- results ----------------------------------------------------------------

export type RefusalClass = "conflict" | "schema-invalid" | "missing-evidence" | "unresolved-reference";

export type RuleResult = { ok: true } | { ok: false; class: RefusalClass; reason: string };

const refuse = (cls: RefusalClass, reason: string): RuleResult => ({ ok: false, class: cls, reason });

// --- allowed ----------------------------------------------------------------

export interface EvidenceBinding {
  ref: { workbench_id: string; record_id: string; revision: string; display?: string };
  policy: string;
}

export interface Outcome {
  class: string;
  reason: string;
  evidence: EvidenceBinding[];
}

/**
 * What a rule may need to look at on the record as it would stand after the
 * change. Only the fields the target state has a rule about are read; the
 * others may be left out.
 */
export interface TransitionPayload {
  /** Package: the claim the record would carry in the target state. */
  claim?: unknown;
  /** Package: the outcome the record would carry in the target state. */
  outcome?: Outcome | null;
  /** Issue: the disposition the record would carry in the target state. */
  disposition?: unknown;
  /** Decision: the references the target state may require. */
  answer_ref?: unknown;
  implementation_ref?: unknown;
  superseded_by?: unknown;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Whether `kind` may move from state `from` to state `to` with `payload`.
 * An unknown kind or state is `schema-invalid`; an edge the table does not
 * list is `conflict`; a listed edge whose target-state rules the payload
 * breaks is `schema-invalid`. A same-state "move" is no edge and a conflict.
 */
export function allowed(kind: string, from: string, to: string, payload: TransitionPayload = {}): RuleResult {
  const table = transitions().kinds[kind];
  if (table === undefined) return refuse("schema-invalid", `unknown kind "${kind}"; the table controls ${kinds().join(", ")}`);
  if (!table.states.includes(from)) return refuse("schema-invalid", `"${from}" is not a ${kind} state`);
  if (!table.states.includes(to)) return refuse("schema-invalid", `"${to}" is not a ${kind} state`);

  const edge = table.edges.find((e) => e.from === from && e.to === to);
  if (edge === undefined) {
    const why = table.terminal.includes(from) ? `${from} is terminal (${table.reopen})` : `no edge ${from} -> ${to} in the table`;
    return refuse("conflict", `${kind}: ${why}`);
  }

  switch (kind) {
    case "package":
      return packageRules(table, to, payload);
    case "issue":
      return issueRules(table, to, payload);
    case "decision":
      return decisionRules(edge, payload);
    default:
      return { ok: true };
  }
}

function packageRules(table: KindTable, to: string, payload: TransitionPayload): RuleResult {
  const claimRule = table.claim?.[to];
  const hasClaim = isObject(payload.claim);
  if (claimRule === "required" && !hasClaim) return refuse("schema-invalid", `package: ${to} requires a claim`);
  if (claimRule === "forbidden" && payload.claim != null) return refuse("schema-invalid", `package: ${to} carries no claim`);

  const terminal = table.terminal.includes(to);
  const outcome = payload.outcome ?? null;
  if (!terminal) {
    if (outcome !== null) return refuse("schema-invalid", `package: outcome is null while ${to}`);
    return { ok: true };
  }
  if (!isObject(outcome)) return refuse("schema-invalid", `package: ${to} requires an outcome`);
  const classes = table.outcome_classes?.[to] ?? [];
  if (!classes.includes(outcome.class)) {
    return refuse("schema-invalid", `package: ${to} admits the outcome classes ${classes.join(", ")}, not "${outcome.class}"`);
  }
  return { ok: true };
}

function issueRules(table: KindTable, to: string, payload: TransitionPayload): RuleResult {
  const terminal = table.terminal.includes(to);
  const hasDisposition = isObject(payload.disposition);
  if (terminal && !hasDisposition) return refuse("schema-invalid", `issue: ${to} requires a disposition`);
  if (!terminal && payload.disposition != null) return refuse("schema-invalid", `issue: disposition is null while ${to}`);
  return { ok: true };
}

function decisionRules(edge: Edge, payload: TransitionPayload): RuleResult {
  if (edge.requires === undefined) return { ok: true };
  const value = (payload as Record<string, unknown>)[edge.requires];
  if (value === undefined || value === null) return refuse("schema-invalid", `decision: ${edge.to} requires ${edge.requires}`);
  return { ok: true };
}

/**
 * A plan step's move (`[OPEN]` -> `[IN PROGRESS]` -> `[DONE]`, or straight to
 * done) against the table's `step_edges`.
 */
export function stepAllowed(from: string, to: string): RuleResult {
  const table = transitions().kinds["plan"];
  if (table === undefined || table.step_states === undefined || table.step_edges === undefined) {
    return refuse("schema-invalid", "the table carries no plan step vocabulary");
  }
  if (!table.step_states.includes(from)) return refuse("schema-invalid", `"${from}" is not a plan step state`);
  if (!table.step_states.includes(to)) return refuse("schema-invalid", `"${to}" is not a plan step state`);
  if (!table.step_edges.some((e) => e.from === from && e.to === to)) return refuse("conflict", `plan step: no edge ${from} -> ${to}`);
  return { ok: true };
}

// --- dependencySatisfied ----------------------------------------------------

/** What a condition reads of the dependency target: its live status and outcome. */
export interface DependencyTarget {
  status: string;
  outcome: Outcome | null;
  /**
   * The evidence records the outcome's bindings name, keyed by record id, as
   * they stand now: their current revision and verdict. `succeeded` needs
   * them; `terminal` does not read them.
   */
  evidence_records?: Record<string, { verdict: string; revision: string }>;
}

/**
 * Whether `target` satisfies a `depends_on` edge with `condition`. An unmet
 * condition is a refusal that blocks the dependant's dispatch and changes
 * nothing on either side.
 */
export function dependencySatisfied(condition: string, target: DependencyTarget): RuleResult {
  const table = dependencies();
  const rule = table.conditions[condition];
  if (rule === undefined) {
    return refuse("schema-invalid", `unknown depends_on condition "${condition}"; the table knows ${Object.keys(table.conditions).join(", ")}`);
  }
  if (!rule.target_status.includes(target.status)) {
    return refuse("conflict", `${condition}: the target is ${target.status}, not ${rule.target_status.join(" or ")}`);
  }
  if (rule.outcome_class !== null) {
    const cls = target.outcome?.class;
    if (cls === undefined || !rule.outcome_class.includes(cls)) {
      return refuse("missing-evidence", `${condition}: the target's outcome class is ${cls ?? "absent"}, not ${rule.outcome_class.join(" or ")}`);
    }
  }
  if (rule.evidence === null) return { ok: true };

  const bindings = target.outcome?.evidence ?? [];
  const means = rule.evidence.accepted_means;
  let accepted = 0;
  for (const b of bindings) {
    const record = target.evidence_records?.[b.ref.record_id];
    if (record === undefined) {
      return refuse("unresolved-reference", `${condition}: the outcome binds evidence ${b.ref.record_id}, which was not supplied`);
    }
    if (!means.verdict.includes(record.verdict)) continue;
    if (means.revision_matches && record.revision !== b.ref.revision) continue; // stale: bound at another revision
    accepted++;
  }
  if (accepted < rule.evidence.min_accepted) {
    return refuse(
      "missing-evidence",
      `${condition}: ${accepted} accepted evidence binding(s) at a current revision, ${rule.evidence.min_accepted} required`,
    );
  }
  return { ok: true };
}

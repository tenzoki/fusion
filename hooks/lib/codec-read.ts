/**
 * What the two codec readers, `lib/scope.ts` and `lib/work-graph.ts`, share:
 * the gate read as a failure, a refusal read off an answer or a row, and the
 * one criterion for whether a package row reads.
 *
 * ## One criterion, because two copies drifted
 *
 * Each reader carried its own copy of these helpers, and the two had already
 * come to disagree on one record: scope resolved a claimed package whose
 * control file the codec's validation refuses, while the order reader named
 * the same package unreadable
 * (`260930-1446_*_scope-resolves-a-package-the-codecs-own-validation-refuses-while-the-order-reader-names-it-unreadable.md`).
 *
 * A package row reads when `list` put no `problem` on it, it names an id, its
 * `status` is one of the five, and the codec's validation reports no finding
 * against its path. The findings are the codec's own: `validate` without a
 * record, or `reconcile`'s `records`, which for a `package.json` are the same
 * set (a placement finding is an evidence file's only). `list` and `show`
 * strict-parse and read `schema` and `kind`, and check nothing further, so
 * they alone cannot say that a row reads. Nothing here re-implements a schema
 * check.
 */

import { basename } from "node:path";
import { gate, type Answer, type Ask, type Refusal, type UnansweredCause } from "./record-client.js";
import { CONTAINER_STORE } from "./stores.js";

/** Why nothing was read, before or while reading. None of them is an empty store or an absent claim. */
export type Unread =
  | { cause: "legacy" }
  | { cause: "unsupported"; diagnosis: Refusal | null }
  | { cause: "unanswered"; op: string; how: UnansweredCause; detail: string }
  /** The codec's typed refusal, `recovery-blocked` among them, on `op`. */
  | { cause: "refused"; op: string; refusal: Refusal };

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The refusal an answer carries, as one value to name. */
export const refusalOf = (answer: Answer & { kind: "refused" }): Refusal => ({
  class: answer.class,
  reason: answer.reason,
  ...(answer.detail !== undefined && { detail: answer.detail }),
});

/** `Refusal` read off a `problem` or a finding the codec reported; anything else is reported as it came. */
export function problemOf(value: unknown): Refusal {
  if (isObject(value) && typeof value.class === "string" && typeof value.reason === "string") {
    return { class: value.class, reason: value.reason, ...(typeof value.detail === "string" && { detail: value.detail }) };
  }
  return { class: "operation-unknown", reason: "problem-unreadable", detail: `the codec reported ${JSON.stringify(value)}` };
}

/** The gate's non-admitting states, each as the `Unread` it is; `null` admits the read. */
export function refusedByGate(workbench: string, ask: Ask): Unread | null {
  const g = gate(workbench, { ask });
  switch (g.state) {
    case "json-control":
      return null;
    case "legacy":
      return { cause: "legacy" };
    case "unsupported":
      return { cause: "unsupported", diagnosis: g.diagnosis };
    case "refused":
      return { cause: "refused", op: "inspect", refusal: { class: g.class, reason: g.reason, ...(g.detail !== undefined && { detail: g.detail }) } };
    case "unanswered":
      return { cause: "unanswered", op: "inspect", how: g.cause, detail: g.detail };
  }
}

/** A row of `list` that is a package of the container store, readable or not. */
export const isPackageRow = (row: Record<string, unknown>): boolean =>
  typeof row.path === "string" && row.path.startsWith(`${CONTAINER_STORE}/`) && basename(row.path) === "package.json";

/** One `op` answer's result object, or the `Unread` that stands in for it. */
export function resultOf(workbench: string, request: { op: string; [field: string]: unknown }, ask: Ask): { result: Record<string, unknown> } | { unread: Unread } {
  const op = request.op;
  const answer = ask(workbench, request);
  if (answer.kind === "unanswered") return { unread: { cause: "unanswered", op, how: answer.cause, detail: answer.detail } };
  if (answer.kind === "refused") return { unread: { cause: "refused", op, refusal: refusalOf(answer) } };
  if (!isObject(answer.result)) return { unread: { cause: "unanswered", op, how: "unparseable", detail: `the result of ${op} is no object` } };
  return { result: answer.result };
}

/** The list `key` of a result, or the `Unread` that it is missing. */
export function listOf(op: string, result: Record<string, unknown>, key: string): { list: unknown[] } | { unread: Unread } {
  return Array.isArray(result[key]) ? { list: result[key] } : { unread: { cause: "unanswered", op, how: "unparseable", detail: `the result of ${op} carries no \`${key}\` list` } };
}

/** What the codec's validation found, per control file: `op` is the operation that reported it. */
export type Findings = Map<string, { op: string; problem: Refusal }>;

/** The findings list of `op` keyed by path. A `recovery-blocked` finding wins over any other on its path. */
export function findingsByPath(op: string, list: unknown[]): Findings {
  const out: Findings = new Map();
  for (const f of list) {
    if (!isObject(f) || typeof f.path !== "string") continue;
    const problem = problemOf(f);
    if (!out.has(f.path) || problem.reason === "recovery-blocked") out.set(f.path, { op, problem });
  }
  return out;
}

/** The five values of `status`, and no sixth. */
const STATUSES: ReadonlySet<unknown> = new Set(["open", "claimed", "paused", "done", "dropped"]);

/**
 * Why a package row does not read, or `null` when it does: the criterion of
 * the header, in one place. `row` is a `list` row, or a shown record's
 * control read into the same fields.
 */
export function unreadRow(row: Record<string, unknown>, findings: Findings): { op: string; problem: Refusal } | null {
  const path = String(row.path);
  if ("problem" in row) return { op: "list", problem: problemOf(row.problem) };
  // A finding outranks the two checks below: it is the codec's, and it names a blocked recovery when there is one.
  const found = findings.get(path);
  if (found !== undefined) return found;
  if (typeof row.id !== "string" || row.id === "") return { op: "list", problem: { class: "schema-invalid", reason: "id-unnamed", detail: `${path} names no id` } };
  // An allowlist, not a denylist: a status outside the five is named, never read as "not claimed".
  if (!STATUSES.has(row.status)) return { op: "list", problem: { class: "schema-invalid", reason: "status-unreadable", detail: `${path} carries status ${JSON.stringify(row.status)}` } };
  return null;
}

/** A blocked recovery is a refusal wherever the protocol reports it, and it ends the read. */
export const blockedRead = (op: string, problem: Refusal): Unread | null =>
  problem.reason === "recovery-blocked" ? { cause: "refused", op, refusal: problem } : null;

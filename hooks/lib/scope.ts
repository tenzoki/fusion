/**
 * Which work package this checkout holds, read from JSON control data through
 * the codec, and whether a named directory is a package at all.
 *
 * ## The criterion
 *
 * A package is in scope for this checkout when its `status` is `claimed` and
 * its `claim.checkout_id` equals the eight hex characters `bin/fusion-identity`
 * prints for this checkout. Nothing here reads a `**Status:**` or `**Claim:**`
 * head line: the record is the `package.json` the codec answers, and the
 * narrative beside it is content, never state. Step 3 of
 * `260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md`,
 * on spec section 7 row 1 ("`status`/`claim` aus JSON, vorhandene
 * Mehrdeutigkeitsfehler erhalten; niemals still nach shared ausweichen").
 *
 * ## The sequence, and what each answer of the codec means here
 *
 *   gate (`inspect`)     anything but `json-control` is `unknown` by name:
 *                        `legacy`, `unsupported`, `refused`, `unanswered`.
 *                        None of them is "nothing claimed".
 *   `list`               every control file of the workbench, without a scope:
 *                        a `list` over the container store is refused
 *                        `unknown-scope/scope-missing` where that directory
 *                        does not exist yet, and reading that refusal as an
 *                        empty store is what this module must not do. The
 *                        package rows are the ones under the container store
 *                        whose control file is `package.json`, the codec's own
 *                        name for one. A package row that is a `problem` stops
 *                        the read: its status is unknown, so the claimed set
 *                        is undetermined. A problem whose reason is
 *                        `recovery-blocked` is the refusal it is, arriving
 *                        inside an `ok: true` answer.
 *   `show`, per claimed  the record at the revision `list` named. A revision
 *                        that differs is a new observation, not a failed one:
 *                        the store moved between the two reads. The read
 *                        starts over from `list` ONCE; a second difference is
 *                        `store-changing` and the answer is unknown. That
 *                        re-read is a bounded second observation and never a
 *                        retry after an uncertain process outcome, which this
 *                        module does not make: an `unanswered` call ends the
 *                        read where it stands.
 *   the comparison       the shown records whose `claim.checkout_id` is this
 *                        checkout's: none, one, or more than one. More is
 *                        `ambiguous` with every container named, and it is
 *                        refused rather than resolved, for the reason the
 *                        header of `bin/fusion-claimed-package` carries.
 *
 * Nothing is written by this module, no intent is deleted and no diverged
 * file is repaired; whatever the codec finds pending it reports, and the
 * report ends the read (Prior's review of the FJ03a plan, `## A.` and `## C.`).
 *
 * ## Who runs it
 *
 * `hooks/scope.ts`, through `bin/fusion-claimed-package` (`claimed`) and
 * `bin/fusion-paths` (`item`), each called from an agent's Setup or by hand.
 * No automatic hook reaches this module or those helpers:
 * `lib/record-client.ts` `## The recovery declaration`, pinned by
 * `lib/__tests__/hook-route-exclusion.test.ts`.
 */

import { basename, dirname } from "node:path";
import { ask as askCodec, gate, type Answer, type Ask, type Refusal, type UnansweredCause } from "./record-client.js";
import { CONTAINER_STORE } from "./stores.js";

/** Why the item in scope could not be determined. Every member names its cause. */
export type Unknown =
  | { cause: "legacy" }
  | { cause: "unsupported"; diagnosis: Refusal | null }
  | { cause: "unanswered"; op: string; how: UnansweredCause; detail: string }
  /** The codec's typed refusal, `recovery-blocked` among them, on `op`. */
  | { cause: "refused"; op: string; refusal: Refusal }
  /** A package row of `list` that did not read, or a shown package naming no narrative. */
  | { cause: "unreadable-package"; path: string; problem: Refusal }
  /** The bounded re-read still found `path` at a revision other than `list` named. */
  | { cause: "store-changing"; path: string; listed: string; shown: string };

/** One claimed package: its narrative (the `PACKAGE=` line) and its container. */
export interface Held {
  package: string;
  container: string;
}

export type Scope =
  | { kind: "none" }
  | ({ kind: "one" } & Held)
  | { kind: "ambiguous"; held: Held[] }
  | ({ kind: "unknown" } & Unknown);

export type Item =
  | ({ kind: "package" } & Held)
  | { kind: "no-package"; detail: string }
  | ({ kind: "unknown" } & Unknown);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const unknown = (u: Unknown): Scope & { kind: "unknown" } => ({ kind: "unknown", ...u });

/** The refusal an answer carries, as one value to name. */
const refusalOf = (answer: Answer & { kind: "refused" }): Refusal => ({
  class: answer.class,
  reason: answer.reason,
  ...(answer.detail !== undefined && { detail: answer.detail }),
});

/** `Refusal` read off a `problem` the codec put in a row; anything else is reported as it came. */
function problemOf(value: unknown): Refusal {
  if (isObject(value) && typeof value.class === "string" && typeof value.reason === "string") {
    return { class: value.class, reason: value.reason, ...(typeof value.detail === "string" && { detail: value.detail }) };
  }
  return { class: "operation-unknown", reason: "problem-unreadable", detail: `the row's problem is ${JSON.stringify(value)}` };
}

/** The gate's non-admitting states, each as the `unknown` it is. */
function refusedByGate(workbench: string, ask: Ask): Unknown | null {
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
const isPackageRow = (row: Record<string, unknown>): boolean =>
  typeof row.path === "string" && row.path.startsWith(`${CONTAINER_STORE}/`) && basename(row.path) === "package.json";

interface Listed {
  path: string;
  revision: string;
}

/** The claimed package rows, or why they cannot be known. */
function listClaimed(workbench: string, ask: Ask): { rows: Listed[] } | { unknown: Unknown } {
  const answer = ask(workbench, { op: "list" });
  if (answer.kind === "unanswered") return { unknown: { cause: "unanswered", op: "list", how: answer.cause, detail: answer.detail } };
  if (answer.kind === "refused") return { unknown: { cause: "refused", op: "list", refusal: refusalOf(answer) } };
  const records = isObject(answer.result) && Array.isArray(answer.result.records) ? answer.result.records : null;
  if (records === null) return { unknown: { cause: "unanswered", op: "list", how: "unparseable", detail: "the result carries no `records` list" } };

  const rows: Listed[] = [];
  for (const row of records) {
    if (!isObject(row) || !isPackageRow(row)) continue;
    const path = row.path as string;
    if ("problem" in row) {
      const problem = problemOf(row.problem);
      // A blocked recovery is a refusal wherever the protocol reports it; a
      // record that does not read is undetermined status.
      if (problem.reason === "recovery-blocked") return { unknown: { cause: "refused", op: "list", refusal: problem } };
      return { unknown: { cause: "unreadable-package", path, problem } };
    }
    if (row.status !== "claimed") continue;
    if (typeof row.revision !== "string") return { unknown: { cause: "unreadable-package", path, problem: { class: "operation-unknown", reason: "revision-unnamed", detail: "the list row names no revision" } } };
    rows.push({ path, revision: row.revision });
  }
  return { rows };
}

interface Shown {
  path: string;
  revision: string;
  status: unknown;
  checkoutId: unknown;
  narrative: string | null;
}

/** One `show`, read into what the comparison needs. */
function show(workbench: string, path: string, ask: Ask): Shown | { unknown: Unknown } {
  const answer = ask(workbench, { op: "show", record: { path } });
  if (answer.kind === "unanswered") return { unknown: { cause: "unanswered", op: "show", how: answer.cause, detail: answer.detail } };
  if (answer.kind === "refused") return { unknown: { cause: "refused", op: "show", refusal: refusalOf(answer) } };
  const r = answer.result;
  if (!isObject(r) || typeof r.revision !== "string" || !isObject(r.control)) {
    return { unknown: { cause: "unanswered", op: "show", how: "unparseable", detail: `the result for ${path} carries no revision and control` } };
  }
  const claim = isObject(r.control.claim) ? r.control.claim : {};
  const narrative = isObject(r.narrative) && typeof r.narrative.path === "string" ? r.narrative.path : null;
  return { path, revision: r.revision, status: r.control.status, checkoutId: claim.checkout_id, narrative };
}

const held = (s: Shown): Held | { unknown: Unknown } =>
  s.narrative === null
    ? { unknown: { cause: "unreadable-package", path: s.path, problem: { class: "schema-invalid", reason: "narrative-unnamed", detail: `${s.path} names no narrative` } } }
    : { package: s.narrative, container: dirname(s.path) };

/**
 * The work package this checkout holds: `none`, `one`, `ambiguous` with every
 * container named, or `unknown` with its cause. `ask` is the record client's
 * by default, and a test's stand-in when injected.
 */
export function claimedBy(workbench: string, checkout: string, ask: Ask = askCodec): Scope {
  const gated = refusedByGate(workbench, ask);
  if (gated !== null) return unknown(gated);

  let reread = false;
  for (;;) {
    const listed = listClaimed(workbench, ask);
    if ("unknown" in listed) return unknown(listed.unknown);
    if (listed.rows.length === 0) return { kind: "none" };

    const shown: Shown[] = [];
    let moved: Listed | null = null;
    let movedTo = "";
    for (const row of listed.rows) {
      const s = show(workbench, row.path, ask);
      if ("unknown" in s) return unknown(s.unknown);
      if (s.revision !== row.revision) {
        moved = row;
        movedTo = s.revision;
        break;
      }
      shown.push(s);
    }
    if (moved !== null) {
      if (reread) return unknown({ cause: "store-changing", path: moved.path, listed: moved.revision, shown: movedTo });
      // The one bounded re-read: a new observation of a store that moved, and
      // not a repeat of a call whose outcome is uncertain.
      reread = true;
      continue;
    }

    const mine = shown.filter((s) => s.status === "claimed" && s.checkoutId === checkout);
    if (mine.length === 0) return { kind: "none" };
    const hs: Held[] = [];
    for (const s of mine) {
      const h = held(s);
      if ("unknown" in h) return unknown(h.unknown);
      hs.push(h);
    }
    return hs.length === 1 ? { kind: "one", ...hs[0] } : { kind: "ambiguous", held: hs };
  }
}

/**
 * Whether `dir` names a package of the container store: the gate first, then
 * `show` of `<store>/<dir>/package.json`. A record the codec does not find is
 * `no-package`; every other refusal, and no answer, is `unknown`.
 */
export function isPackage(workbench: string, dir: string, ask: Ask = askCodec): Item {
  const gated = refusedByGate(workbench, ask);
  if (gated !== null) return { kind: "unknown", ...gated };
  const path = `${CONTAINER_STORE}/${dir}/package.json`;
  const answer = ask(workbench, { op: "show", record: { path } });
  if (answer.kind === "unanswered") return { kind: "unknown", cause: "unanswered", op: "show", how: answer.cause, detail: answer.detail };
  if (answer.kind === "refused") {
    if (answer.reason === "record-not-found") return { kind: "no-package", detail: answer.detail ?? `${path} does not exist` };
    return { kind: "unknown", cause: "refused", op: "show", refusal: refusalOf(answer) };
  }
  const r = answer.result;
  const narrative = isObject(r) && isObject(r.narrative) && typeof r.narrative.path === "string" ? r.narrative.path : null;
  if (!isObject(r) || r.kind !== "package") return { kind: "no-package", detail: `${path} is not a package record` };
  if (narrative === null) return { kind: "unknown", cause: "unreadable-package", path, problem: { class: "schema-invalid", reason: "narrative-unnamed", detail: `${path} names no narrative` } };
  return { kind: "package", package: narrative, container: `${CONTAINER_STORE}/${dir}` };
}

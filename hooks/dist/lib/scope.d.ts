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
import { type Ask, type Refusal, type UnansweredCause } from "./record-client.js";
/** Why the item in scope could not be determined. Every member names its cause. */
export type Unknown = {
    cause: "legacy";
} | {
    cause: "unsupported";
    diagnosis: Refusal | null;
} | {
    cause: "unanswered";
    op: string;
    how: UnansweredCause;
    detail: string;
}
/** The codec's typed refusal, `recovery-blocked` among them, on `op`. */
 | {
    cause: "refused";
    op: string;
    refusal: Refusal;
}
/** A package row of `list` that did not read, or a shown package naming no narrative. */
 | {
    cause: "unreadable-package";
    path: string;
    problem: Refusal;
}
/** The bounded re-read still found `path` at a revision other than `list` named. */
 | {
    cause: "store-changing";
    path: string;
    listed: string;
    shown: string;
};
/** One claimed package: its narrative (the `PACKAGE=` line) and its container. */
export interface Held {
    package: string;
    container: string;
}
export type Scope = {
    kind: "none";
} | ({
    kind: "one";
} & Held) | {
    kind: "ambiguous";
    held: Held[];
} | ({
    kind: "unknown";
} & Unknown);
export type Item = ({
    kind: "package";
} & Held) | {
    kind: "no-package";
    detail: string;
} | ({
    kind: "unknown";
} & Unknown);
/**
 * The work package this checkout holds: `none`, `one`, `ambiguous` with every
 * container named, or `unknown` with its cause. `ask` is the record client's
 * by default, and a test's stand-in when injected.
 */
export declare function claimedBy(workbench: string, checkout: string, ask?: Ask): Scope;
/**
 * Whether `dir` names a package of the container store: the gate first, then
 * `show` of `<store>/<dir>/package.json`. A record the codec does not find is
 * `no-package`; every other refusal, and no answer, is `unknown`.
 */
export declare function isPackage(workbench: string, dir: string, ask?: Ask): Item;

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
import { type Answer, type Ask, type Refusal, type UnansweredCause } from "./record-client.js";
/** Why nothing was read, before or while reading. None of them is an empty store or an absent claim. */
export type Unread = {
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
};
export declare const isObject: (value: unknown) => value is Record<string, unknown>;
/** The refusal an answer carries, as one value to name. */
export declare const refusalOf: (answer: Answer & {
    kind: "refused";
}) => Refusal;
/** `Refusal` read off a `problem` or a finding the codec reported; anything else is reported as it came. */
export declare function problemOf(value: unknown): Refusal;
/** The gate's non-admitting states, each as the `Unread` it is; `null` admits the read. */
export declare function refusedByGate(workbench: string, ask: Ask): Unread | null;
/** A row of `list` that is a package of the container store, readable or not. */
export declare const isPackageRow: (row: Record<string, unknown>) => boolean;
/** One `op` answer's result object, or the `Unread` that stands in for it. */
export declare function resultOf(workbench: string, request: {
    op: string;
    [field: string]: unknown;
}, ask: Ask): {
    result: Record<string, unknown>;
} | {
    unread: Unread;
};
/** The list `key` of a result, or the `Unread` that it is missing. */
export declare function listOf(op: string, result: Record<string, unknown>, key: string): {
    list: unknown[];
} | {
    unread: Unread;
};
/**
 * The rows of an unscoped `list`, once its `state` admits them. The gate stays
 * first and `state` does not waive it (`codec/README.md` `## The CLI`); it
 * closes the window between the two: `legacy` is a manifest lost after the
 * gate, and any other value, an absent one included, is no answer.
 */
export declare function listedRecords(workbench: string, ask: Ask): {
    list: unknown[];
} | {
    unread: Unread;
};
/** What the codec's validation found, per control file: `op` is the operation that reported it. */
export type Findings = Map<string, {
    op: string;
    problem: Refusal;
}>;
/** The findings list of `op` keyed by path. A `recovery-blocked` finding wins over any other on its path. */
export declare function findingsByPath(op: string, list: unknown[]): Findings;
/**
 * Why a package row does not read, or `null` when it does: the criterion of
 * the header, in one place. `row` is a `list` row, or a shown record's
 * control read into the same fields.
 */
export declare function unreadRow(row: Record<string, unknown>, findings: Findings): {
    op: string;
    problem: Refusal;
} | null;
/** A blocked recovery is a refusal wherever the protocol reports it, and it ends the read. */
export declare const blockedRead: (op: string, problem: Refusal) => Unread | null;

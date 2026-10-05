/**
 * The record index the explicit checkers share: every control record of a
 * JSON-controlled workbench, keyed three ways, read through the codec and
 * built in memory on every call.
 *
 * ## What it answers
 *
 * `readRecordIndex(workbench, ask)` answers one of three, as `lib/scope.ts`
 * does:
 *
 *   `json-control`  the index. `byNarrative` maps a narrative path to its
 *                   record, `byId` a record id, `byControl` a control file;
 *                   each entry carries `id`, `kind`, `status`, `live`, the
 *                   control path and the narrative path (`null` for an
 *                   evidence record, which names a report instead).
 *   `legacy`        the workbench has no manifest. The explicit checkers
 *                   refuse it by name with `legacyLine` (FJ03d step 8):
 *                   section 9 of Prior's FJ03 row keeps the old control
 *                   parsers in import and `archive/` read mode only, so a
 *                   legacy workbench is pointed at `/fusion:migrate`.
 *   `unknown`       with its cause: `unsupported`, `refused` (the codec's
 *                   typed refusal, `recovery-blocked` among them wherever the
 *                   protocol reports it), `unanswered`. None of them is an
 *                   empty index.
 *
 * Every path is workbench-relative, as the codec names it. A narrative with
 * no record is in no map: a report, a history entry, a legacy file in the
 * archive. The caller decides what that means for it.
 *
 * ## The sequence
 *
 *   gate (`inspect`)  through `lib/codec-read.ts` `refusedByGate`.
 *   `list`            without a scope, as `lib/scope.ts` sends it; a `legacy`
 *                     `state` after the gate is `legacy` here too.
 *   `reconcile`       without a scope. Its `records` are the codec's findings
 *                     per control file, and a row judged against them by
 *                     `unreadRow` is `unreadable`, named, and in no map. Its
 *                     `references` give `unresolvedRefs`: every record
 *                     reference, a `depends_on` target among them, that
 *                     resolves to no control file (`record-not-found`), and
 *                     `bindings`: per control file, its
 *                     `/active_documents/<i>/ref` entries with the `role`
 *                     the codec copies from the stored binding, whatever
 *                     their status, and the `target` of a resolved one.
 *
 * `unreadRow` is written for a package row, and its status check is the
 * package vocabulary. A record of another kind is held to its own: the states
 * `codec/contract/transitions.json` lists for its kind, and for a kind the
 * contract gives none (evidence) no status at all.
 *
 * ## Liveness is the contract's, never a file name's
 *
 * `live` is a `status` outside the kind's `terminal` set in
 * `codec/contract/transitions.json`, the one source the kernel reads too. A
 * marker in an imported record's basename is history and decides nothing
 * (section 4.4). The contract is resolved relative to the compiled module, as
 * `lib/record-client.ts` resolves the bundle, so an install and a work tree
 * each read their own.
 *
 * ## What it does not do
 *
 * It persists nothing, so the index is deletable by construction and a pull
 * is seen on the next call (section 4.4). It sends no mutation. A read may
 * still finish a committed intent, which is the codec's and is declared in
 * `lib/record-client.ts` `## The recovery declaration`; no automatic hook
 * imports this module.
 */
import { type Ask, type Refusal } from "./record-client.js";
import { type Unread } from "./codec-read.js";
export interface IndexEntry {
    id: string;
    kind: string;
    /** `null` for a kind without a state (evidence). */
    status: string | null;
    live: boolean;
    control: string;
    narrative: string | null;
}
export interface RecordIndex {
    byNarrative: Map<string, IndexEntry>;
    byId: Map<string, IndexEntry>;
    byControl: Map<string, IndexEntry>;
    /** Control files that did not read, each with the codec's finding. */
    unreadable: Array<{
        path: string;
        problem: Refusal;
    }>;
    /** Record references resolving to nothing: the control file, the JSON pointer, the codec's reason. */
    unresolvedRefs: Array<{
        path: string;
        at: string;
        problem: Refusal;
    }>;
    /** A control file's active-document bindings, from `reconcile`: `target` is the control path of a resolved one, else null. */
    bindings: Map<string, Array<{
        role: string | null;
        status: string;
        target: string | null;
    }>>;
}
/** Why no index was read. `legacy` is not among them: it is a format, with a reader of its own. */
export type NotRead = Exclude<Unread, {
    cause: "legacy";
}>;
export type IndexRead = {
    format: "json-control";
    index: RecordIndex;
} | {
    format: "legacy";
} | {
    format: "unknown";
    unread: NotRead;
};
/** dist layout: `<plugin>/hooks/dist/lib/record-index.js` → `<plugin>/codec/contract/transitions.json`. */
export declare function defaultContract(): string;
/**
 * The index of `workbench`, or why there is none. `ask` is the record client's
 * by default and a test's stand-in when injected; `contract` is the
 * transitions file, beside the compiled module by default.
 */
export declare function readRecordIndex(workbench: string, ask?: Ask, contract?: string): IndexRead;
/** One line naming why the workbench was not read, for a checker's stderr. */
export declare function notReadLine(u: NotRead, workbench: string): string;
/** One line refusing a legacy workbench by name, for a checker's stderr. */
export declare const legacyLine: (workbench: string) => string;
/** A missing bundle is the plugin's fault, and a checker names it apart from a workbench it could not read. */
export declare const bundleMissing: (u: NotRead) => boolean;

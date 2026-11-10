/**
 * The steering writes of a campaign: `open`, `lanes`, `pause`, `resume`,
 * `move`, `reassign` and `end`, behind `bin/fusion-campaign`. That script's
 * header is the authoritative documentation of each sub-command's usage, of
 * the output and of the exit table; this header is that of the mechanism
 * (plan step 16b of
 * `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`).
 *
 * ## One sequence serves every write
 *
 * The codec reads a campaign and writes none (`codec/README.md`, "A campaign
 * is read and never written"), so this module is the campaign's writer, and
 * every sub-command goes through the same five steps:
 *
 *   1  the candidate: the stored control with the act applied, or for `open`
 *      the new document, with `state.charter_hash` set to `PLACEHOLDER_HASH`
 *      and `state.revision` to null. The schema admits both, and the codec's
 *      validation compares no hash;
 *   2  `priorRevisions`: THE ONE FUNCTION THAT KNOWS WHERE THE TWO VALUES COME
 *      FROM. It places the candidate in a scratch workbench, a copy of
 *      `workbench.json` and the candidate at its own relative path, asks
 *      `show` through `lib/record-client.ts`, and returns the member `prior`
 *      the codec answers for a campaign: Prior's `charterHash` and
 *      `stateRevision`, computed by `codec/src/prior` inside the bundle
 *      (decision
 *      `261109-1238-by-which-build-route-does-the-claude-side-writer-produce-priors-charter-hash-and-state-revision.md`,
 *      option 1). A `prior.problem` is a refusal;
 *   3  the two values replace the placeholders;
 *   4  the filled candidate replaces the first in the scratch workbench and
 *      `validate` must answer no finding, the three lane rules included;
 *   5  the file is written beside its target and renamed into place.
 *
 * The scratch directory is removed on every way out (`withScratch`). A
 * refusal at 2 or 4 writes nothing. No sub-command branches off the sequence:
 * a write that changes `lanes` alone gets back the two values it had, `lanes`
 * being no part of the export, and the file's own `sha256:` revision moves.
 *
 * ## The claim test comes before any candidate
 *
 * A steering act runs only from a checkout holding no claimed package (spec
 * C3). Every write runs `bin/fusion-claimed-package` before it builds a
 * candidate, after the codec's gate alone (a workbench refused by name is
 * exit 4 under every sub-command, and the claim helper would report it under
 * the code it also uses for two claims): a `PACKAGE=` line
 * is `holds-package`, and so is that helper's refusal over two claimed
 * packages, which it names by the sentence its own test pins. Any other
 * outcome of the helper but an empty exit 0 means the test could not be made,
 * and is a `HelperFailure`: the write does not proceed on a guess.
 *
 * ## Which campaign a write names
 *
 * `open` names its own. Every other act takes `--campaign <id>`, and without
 * it the one live campaign of the workbench, read through `list`: none or
 * several is a refusal naming each. Live is a `state.state` outside the
 * terminal set `TERMINAL_STATES`.
 *
 * ## What is refused here, before the codec is asked
 *
 * The state rules are the helper's own, with the codec's classes: `pause`
 * from `running` alone, `resume` from `paused` alone, `end` from either,
 * `lanes`, `move` and `reassign` on no terminal campaign; a lane or a package
 * that is not there; a proposal file that is not one. Everything the schema
 * and the lane rules decide is left to `validate` at step 4 and reported as
 * the codec reports it.
 *
 * ## The proposal file `lanes --from` reads
 *
 * The file `bin/fusion-campaign cut` writes (plan step 15, `## Data
 * Structures`). This module reads one key of it, `lanes`, an array of
 * `{ "id": <lane id>, "members": [<container name>, ...] }`, and ignores the
 * rest (`checkouts`, `tolerance`, `handoffs`, `no_areas`, `imbalance`). A
 * member is resolved to a `record_ref` through `list`, its `display` the
 * container name; a lane's `checkout_id` comes from `--assign <lane>=<hex>`
 * or is null.
 *
 * ## What it writes and never does
 *
 * One file, `campaigns/<id>/campaign.json`, two-space indented with a final
 * newline, the keys in the order the schema's fixtures hold them. It commits
 * nothing: the steering session commits through the ordinary commit step. It
 * sends the codec no mutation; the codec has none for a campaign. No hook
 * imports this module.
 */
import { type Unread } from "./codec-read.js";
import { type Ask, type Refusal } from "./record-client.js";
/** What `state.charter_hash` holds while the codec is asked for the true value: the schema's pattern, no hash. */
export declare const PLACEHOLDER_HASH: string;
/** The working rule, as request 80 `### Stated and not asked` states it. */
export declare const DELIVERY_POLICY = "commit, then pull with rebase, then read the campaign, then push";
/** `YYMMDD-HHMM-<slug>`, the directory's own name. */
export declare const CAMPAIGN_ID: RegExp;
/** A checkout identifier, as `bin/fusion-identity` prints it. */
export declare const CHECKOUT_HEX: RegExp;
/** The outcomes `end` writes. */
export declare const OUTCOMES: readonly ["completed", "bounded", "failed", "cancelled"];
export type Outcome = (typeof OUTCOMES)[number];
/** The states no steering act moves a campaign out of. */
export declare const TERMINAL_STATES: ReadonlySet<string>;
/** `completion_evidence`, as the user states it on `end --outcome completed`. */
export interface CompletionEvidence {
    objective_met: boolean;
    intake_closed: boolean;
    all_attempts_terminal: boolean;
    final_audit_passed: boolean;
    watermark: string | null;
    audit_ref: string | null;
}
/** One steering act, parsed. `campaign` null means the one live campaign. */
export type Act = {
    act: "open";
    id: string;
    objective: string;
    authorisation: string;
    stops: string[];
} | {
    act: "lanes";
    campaign: string | null;
    from: string;
    assign: Record<string, string>;
} | {
    act: "pause";
    campaign: string | null;
    reason: string;
} | {
    act: "resume";
    campaign: string | null;
} | {
    act: "move";
    campaign: string | null;
    package: string;
    to: string;
} | {
    act: "reassign";
    campaign: string | null;
    lane: string;
    checkout: string;
} | {
    act: "end";
    campaign: string | null;
    outcome: Outcome;
    reason: string | null;
    evidence: CompletionEvidence | null;
};
export type WriteResult = 
/** Written: the file's workbench-relative path and its `sha256:` revision. */
{
    kind: "written";
    path: string;
    revision: string;
}
/** Exit 8: this checkout holds a claimed package, `detail` naming it. */
 | {
    kind: "holds-package";
    detail: string;
}
/** Exit 9: the write did not validate or the act does not apply; nothing written. */
 | {
    kind: "refused";
    refusal: Refusal;
}
/** Exit 1 or 4: the workbench was not read. */
 | ({
    kind: "failed";
} & Unread);
export interface WriteOptions {
    ask?: Ask;
    bin?: string;
}
/**
 * `bin/fusion-claimed-package` from `cwd`: `free` on an empty exit 0, the
 * holding sentence on a `PACKAGE=` line or on the two-claims refusal, and a
 * `HelperFailure` on anything else, the helper's own reason carried.
 */
export declare function claimTest(cwd: string, bin?: string): {
    kind: "free";
} | {
    kind: "holds";
    detail: string;
};
type Doc = Record<string, unknown>;
/** The new document `open` writes: request 80's charter values, `running` with nothing started, every other member null or at zero. */
export declare function openDocument(act: Extract<Act, {
    act: "open";
}>, workbenchId: string): Doc;
/** The `lanes` key of a proposal file, or the reason it is no proposal. */
export declare function readProposal(path: string): {
    lanes: Array<{
        id: string;
        members: string[];
    }>;
} | {
    detail: string;
};
/** The one place the two `prior_revision` values come from: the codec's `show` of the candidate, placed in `scratch`. */
export declare function priorRevisions(candidate: Doc, rel: string, manifest: string, scratch: string, ask: Ask): {
    values: {
        charter_hash: string;
        revision: string;
    };
} | {
    refusal: Refusal;
} | {
    unread: Unread;
};
/** Two-space indent, LF, a final newline: the codec's own shape, in the key order the candidate holds. */
export declare const serialise: (doc: Doc) => string;
/** `sha256:` over the exact bytes, as `codec/src/store.ts` `revisionOf` computes a record's revision. */
export declare const revisionOf: (bytes: string | Buffer) => string;
/**
 * Perform `act` on the workbench at `workbench` (absolute), from `cwd` (the
 * working tree the claim test runs in): the header's `## One sequence serves
 * every write`, the claim test first. Throws `HelperFailure` where a sibling
 * helper failed and no result names the failure.
 */
export declare function write(act: Act, workbench: string, cwd: string, options?: WriteOptions): WriteResult;
export {};

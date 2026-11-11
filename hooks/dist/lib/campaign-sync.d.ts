/**
 * The commit-cycle read, `bin/fusion-campaign sync`: after the orchestrator's
 * commit, fetch, read the campaigns at the fetched head, confirm the read in
 * the event log, settle the log, rebase, push. That script's header is the
 * authoritative documentation of the output and of the exit table; this
 * header is that of the mechanism (plan step 17 of
 * `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`,
 * on decision
 * `261108-2301-how-does-a-working-session-rebase-pull-over-the-log-row-the-lock-just-appended.md`,
 * option 1).
 *
 * ## The sequence, and why the read comes before the pull
 *
 *   1  `fetchRef` of `lib/campaign.ts`: the branch's upstream, the fetch, the
 *      commit the upstream stands at afterwards (the fetched head);
 *   2  `readCampaignsAt`: the manifest, the marker and the campaign store
 *      extracted at the fetched head and read through the codec, `list` for
 *      the set, `reconcile` for the findings (the three lane rules among
 *      them, which `list` does not carry: `codec/README.md`, "The lane
 *      rules"), `show` per readable campaign for its state, reason and lanes.
 *      No second parser reads a campaign;
 *   3  `mineOf`: which of them steers this checkout;
 *   4  one `campaign_read` row per readable campaign appended to the working
 *      tree's event log, while `FUSION_SESSION_ID` is set (the `commit` row's
 *      own rule, `rules/commit-lock.md` `### The lock writes the commit event`);
 *   5  the settling commit, where the log is the one dirty tracked path;
 *   6  `git rebase <upstream>`, aborted on a stop;
 *   7  `git push`, and the commits it landed listed afterwards.
 *
 * The read happens at the fetched ref and not in the working tree, so no
 * pull precedes it: git refuses a rebase on a dirty tree, and the tree is
 * dirty by the event log after every locked commit, by the lock's design.
 * The pull with rebase follows the settling commit instead, which is the one
 * mechanism that makes the tree clean without a stash. Nothing here runs
 * `stash`, `--autostash`, `checkout .`, `reset --hard` or `clean`.
 *
 * ## What the lock's `commit` row is worth after the rebase
 *
 * Where the upstream had moved, the rebase replaces the hash the orchestrator's
 * `commit` row carries, and step 5 has already committed that row: the remote
 * then holds the row's `checkout`, `ts` and subject beside a hash no other
 * clone can resolve, and those three are what `lib/campaign.ts`
 * `commitNamedBy` reads (its `## Which commit a commit row names`). This module
 * writes no row after the push, which would reach the remote one cycle late,
 * and none before step 5 beyond the `campaign_read` rows, which would cost a
 * second settling commit per cycle and go stale again on a rejected push. A
 * commit hash is final once the upstream holds it, which is why the `pushed=`
 * lines are read after the rebase and after the push, and why a record takes a
 * hash from one of them alone (plan step 19).
 *
 * ## Which campaign is mine
 *
 * Over the readable campaigns at the ref that are live (`running` or
 * `paused`; a terminal campaign steers nobody), in this order: the one whose
 * lanes name this checkout's identifier; else the one whose `lanes` is null.
 * Two candidates under either rule are none, with a note naming them, as the
 * join of `lib/campaign.ts` names a commit or names nothing and never picks.
 * The identifier is `FUSION_CHECKOUT` where the SessionStart export set it,
 * else what one run of `bin/fusion-identity` prints as `CHECKOUT=`, the same
 * order `bin/fusion-commit-lock` resolves it in.
 *
 * ## The settling commit, the deferral and the conflict
 *
 * The dirty tracked paths are `git diff --name-only` with `--cached`, asked of
 * the repository and never predicted. Where they are the event log alone, the
 * log is committed under
 * `fusion-commit-lock with campaign -- bash -c 'git add <log> && git commit -F <message>'`,
 * the message file under what `bin/fusion-tmp path` prints; a held region
 * whose only path is the log emits no row, so the tree settles. The message
 * names the checkout and no hash, since the rebase may replace any. Where
 * other tracked paths are dirty (a sibling executor's in-flight edit), nothing
 * is committed, every dirty path is reported as deferred, the rebase is
 * skipped and the push is still attempted, as a fast-forward. A rebase that
 * stops is aborted here, its conflicting paths reported, and the user
 * resolves it: nothing in fusion resolves a conflict for a person.
 *
 * ## What it writes
 *
 * The event log in the working tree (the rows), one commit of that log, the
 * rebased branch, the remote's branch, and a scratch directory removed on
 * every way out. No hook imports this module.
 */
import { LIVE_STATES, readCampaignsAt, type CampaignAtRef, type CampaignsRead, type FetchedRef, type NoRef, type UnreadableCampaign } from "./campaign.js";
import { type Unread } from "./codec-read.js";
import { type Ask } from "./record-client.js";
export { LIVE_STATES, readCampaignsAt, type CampaignAtRef, type CampaignsRead, type UnreadableCampaign };
/** What `sync` extracts at the fetched head: the manifest, the marker and the campaign store. */
export declare const SYNC_ENTRIES: readonly string[];
/** The lock tag of the settling commit. */
export declare const SETTLE_TAG = "campaign";
/** The settling commit's subject: the checkout and no hash, since the rebase may replace any. */
export declare const settleMessage: (checkout: string | null) => string;
/** Who runs the cycle, each half null where nothing resolved it. */
export interface Identity {
    person: string | null;
    checkout: string | null;
}
/** The header's `## Which campaign is mine`: the one campaign, or none with the note that says why two were not picked between. */
export declare function mineOf(campaigns: CampaignAtRef[], checkout: string | null): {
    mine: CampaignAtRef | null;
    note: string[] | null;
};
/** Env-first (the SessionStart export), else one run of `bin/fusion-identity`; an unresolved half is null. */
export declare function identityOf(cwd: string, bin?: string, env?: NodeJS.ProcessEnv): Identity;
/** The `campaign_read` row for one campaign read: the plan's field set, an unresolved value an absent key. */
export declare function campaignReadRow(ts: string, identity: Identity, sessionId: string, campaign: CampaignAtRef): string;
export interface Synced {
    kind: "synced";
    /** `ok` reaches exit 0; the other two are the table's rows 10 and 11. */
    state: "ok" | "conflict" | "rejected";
    ref: string;
    /** The fetched head, before the rebase. */
    head: string;
    campaigns: CampaignAtRef[];
    unreadable: UnreadableCampaign[];
    mine: CampaignAtRef | null;
    /** True when the settling commit landed. */
    settled: boolean;
    /** The dirty tracked paths, toplevel-relative, when the log was not the only one. */
    deferred: string[];
    /** The conflicting paths of an aborted rebase. */
    conflicts: string[];
    /** The commits the push landed, oldest first. */
    pushed: Array<{
        hash: string;
        subject: string;
    }>;
    /** git's stderr on a push that did not land. */
    rejection: string | null;
    notes: string[][];
}
export type SyncResult = Synced | {
    kind: "no-ref";
    at: Extract<FetchedRef, {
        state: NoRef;
    }>;
} | ({
    kind: "failed";
    head: string;
    rel: string;
} & Unread);
export interface SyncOptions {
    ask?: Ask;
    bin?: string;
    env?: NodeJS.ProcessEnv;
    now?: () => number;
}
/**
 * The whole cycle from `cwd`, inside the working tree, with `workbench` the
 * workbench directory found above it: the header's sequence. Throws
 * `HelperFailure` where git or a sibling helper failed and no state names
 * the failure.
 */
export declare function sync(cwd: string, workbench: string, options?: SyncOptions): SyncResult;
/** The `KEY=value` text `bin/fusion-campaign sync` prints once the read has finished; that script's header defines every line. */
export declare function renderSync(s: Synced): string;

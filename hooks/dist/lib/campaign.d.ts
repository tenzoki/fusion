/**
 * The overview above the checkouts, read out of a fetched ref and never out
 * of the working tree: which checkout holds which work package at the commit
 * the remote stood at, when that checkout last pushed, and what the package
 * waits for. Behind `bin/fusion-campaign overview`; `bin/fusion-campaign`'s
 * header is the authoritative documentation of the output, and this header is
 * that of the mechanism.
 *
 * This is the reduced tier, the one that needs no campaign record (spec C1 of
 * `261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md`,
 * plan step 7b). The lane view and the rule checks join it with the full
 * tier; until then a campaign file at the ref is counted and not evaluated,
 * and the output says so.
 *
 * ## The sequence
 *
 *   `fetchRef`      the branch's upstream, or the ref the caller names in its
 *                   place; `git fetch <remote>` with every credential prompt
 *                   turned into a failure; the commit the ref names afterwards.
 *                   The order of the checks, the state vocabulary and the
 *                   reasons for the fetch's shape are `bin/fusion-forum`'s,
 *                   whose header argues each.
 *   `withScratch`   a directory under what `bin/fusion-tmp path` prints,
 *                   removed on every way out of the callback.
 *   `extractAt`     the named entries of the workbench, as the commit holds
 *                   them, written below the scratch directory by `git archive`
 *                   and `tar`. An entry in no tree at the commit is left out
 *                   of the list first, because `git archive` refuses a path it
 *                   does not find.
 *   `readOverview`  `readWorkGraph` over the extract, so the gate, the row
 *                   criterion and the placement of every dependency edge are
 *                   `lib/work-graph.ts`'s and none is restated here; one
 *                   `list` for the open decisions and the campaign files; one
 *                   `show` per claimed package for the checkout its claim
 *                   names; the extracted event log for the last push.
 *
 * Nothing here reads a workbench file from the working tree. The working tree
 * is consulted for two things: where the workbench is, and where its
 * repository's root is, which together give the path the workbench has in a
 * commit.
 *
 * ## Which commit a commit row names
 *
 * `commitNamedBy` answers it. `bin/fusion-commit-lock` writes a `commit` row
 * whose `detail` is `<short hash> <subject>`, and a later rebase replaces that
 * hash: 301 of 3 825 rows in the consuming project the plan measured name no
 * ancestor of the head, and 298 of them no object in the clone (`## Current State` of
 * `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md`;
 * issue
 * `261109-1313-a-commit-row-names-a-hash-a-later-rebase-removes-so-last-push-by-ancestor-test-under-reports.md`).
 * A rebase keeps a commit's subject and its author time, so the join reads
 * those where the hash is gone. Over one listing of the head's ancestors, the
 * cases are tried in this order, and they are disjoint by construction:
 *
 *   1  the one commit of the listing whose hash the row's short hash
 *      abbreviates;
 *   2  else the one commit of the listing that carries the row's subject and
 *      an author time within `REBASE_WINDOW_SECONDS` of the row's `ts`;
 *   3  else none. Two candidates under 1 or under 2 are none: the join names
 *      a commit or it names nothing, and it never picks.
 *
 * The hash is read first because it is exact where it survives: in the same
 * measurement the subject test named the row's own commit for 3 135 of the
 * 3 524 rows whose hash is an ancestor and left the rest unmatched or with
 * two candidates. The subject is compared with control characters removed, as
 * the lock removes them before it writes the row.
 *
 * ## The last push is a lower bound, and its under-report is counted
 *
 * A checkout's last push is the newest committer time among the commits its
 * rows name. It is a lower bound for two reasons, and the output states the
 * first: a row that names nothing and is newer than the row the figure came
 * from is counted per checkout (`unmatched`), so a working checkout is never
 * silently shown as idle; and a row reaches the ref only with the commit that
 * carries the log, so the figure can trail the push by that one commit.
 *
 * Not taken, on the plan's measurement: the ancestor test alone with a note
 * (it shows a working checkout as idle and merely says so); the committer or
 * author identity (one person's checkouts share it); the workbench paths a
 * commit touches (each commit's diff would be read, and a commit touching
 * none stays unattributed).
 *
 * ## What `waits` is built from
 *
 * An `edge:` entry per dependency the graph reads as blocking the package.
 * `lib/work-graph.ts` `## The table one edge entry falls in` places every
 * entry: a `satisfied` one targets a terminal package, an unresolved one
 * targets no package, so an entry of the row's `dependsOn` whose target is a
 * live node is a resolved edge and nothing else, and the `unmet` rows are the
 * blocking edges to a target that is no node. A `decision:` entry per open
 * decision record inside the package's container, named by its narrative's
 * basename, the form a citation takes.
 *
 * ## What it does not do
 *
 * It sends no mutation and writes nothing but its scratch directory. A read
 * through the codec may finish a committed intent
 * (`lib/record-client.ts` `## The recovery declaration`); here that could only
 * happen inside the extract, which is removed. No hook imports this module.
 */
import { type Unread } from "./codec-read.js";
import { type Ask } from "./record-client.js";
/** The `git log` format the join reads: hash, author time, committer time, subject, tab-separated. */
export declare const COMMIT_LISTING_FORMAT = "%H%x09%at%x09%ct%x09%s";
/** How far a row's `ts` may stand from the author time of the commit a rebase made of the row's commit. */
export declare const REBASE_WINDOW_SECONDS = 60;
/** One commit of the listing. Times are seconds since the epoch, as git prints them. */
export interface ListedCommit {
    hash: string;
    authorTime: number;
    committerTime: number;
    subject: string;
}
/** A listing prepared for the join: looked up by hash prefix and by subject. */
export interface CommitListing {
    /** Every hash, ascending, so the commits a prefix abbreviates are adjacent. */
    hashes: string[];
    byHash: Map<string, ListedCommit>;
    bySubject: Map<string, ListedCommit[]>;
}
/** A `commit` row of the event log, as far as the join and the overview read it. */
export interface CommitRow {
    /** `ts` as the log holds it: UTC, with or without a designator. */
    ts: string;
    /** The writing checkout's eight hex characters, or null on a row that carries none. */
    checkout: string | null;
    /** `<short hash> <subject>`. */
    detail: string;
}
/** The output of `git log --format=COMMIT_LISTING_FORMAT <head>`, prepared for `commitNamedBy`. A line that is not four fields is no commit and is left out. */
export declare function commitListing(text: string): CommitListing;
/**
 * The commit of `listing` that `row` names, or null: the header's
 * `## Which commit a commit row names`. Pure over the listing, so a caller
 * that attributes commits to checkouts runs it over every row and reads the
 * answer the other way round.
 */
export declare function commitNamedBy(row: Pick<CommitRow, "ts" | "detail">, listing: CommitListing): ListedCommit | null;
/**
 * The `commit` rows of the event log's text. `parseLog` of
 * `lib/events-query.ts` is not used because it drops `detail`, the one field
 * the join cannot do without. `unreadable` counts the lines that are no JSON
 * object and the `commit` rows without a `detail` or a readable `ts`: a lost
 * row is a possible under-report, so it is counted and never skipped in
 * silence.
 */
export declare function commitRows(text: string): {
    rows: CommitRow[];
    unreadable: number;
};
/** A checkout's last push, read off its rows. Times are milliseconds. */
export interface LastPush {
    /** The newest committer time among the commits the rows name; null where they name none. */
    time: number | null;
    /** The rows that name no commit and are newer than the row `time` came from; every such row where `time` is null. */
    unmatched: number;
    /** The `ts` of the newest of them; null when `unmatched` is 0. */
    newestUnmatched: number | null;
}
/** The header's `## The last push is a lower bound`, over the rows of one checkout. */
export declare function lastPush(rows: CommitRow[], listing: CommitListing): LastPush;
/** The helper itself could not do its work, as opposed to an answer about the project: a sibling program or `git` failed where no state names the failure. */
export declare class HelperFailure extends Error {
    readonly name = "HelperFailure";
}
/** dist layout: `<plugin>/hooks/dist/lib/campaign.js` → `<plugin>/bin`. An install copy and a work tree each run their own siblings. */
export declare function defaultBin(): string;
export interface Ran {
    status: number;
    stdout: string;
    stderr: string;
}
/**
 * One program, to completion. Not `lib/git.ts`: that one carries a hook's
 * ten-second budget and collapses every failure to null, while a fetch has no
 * budget (`bin/fusion-forum` `## Why there is no timeout`) and the states
 * below are told apart by exit status. Exported for `lib/campaign-write.ts`,
 * whose claim test runs a sibling helper the same way.
 */
export declare function run(program: string, args: string[], cwd: string, env?: NodeJS.ProcessEnv): Ran;
/** `git` whose failure has no state of its own. Exported for `lib/campaign-sync.ts`, whose plumbing between the fetch and the push is of that kind. */
export declare function mustGit(cwd: string, ...args: string[]): string;
/**
 * Run `fn` with a fresh directory under what `bin/fusion-tmp path` prints,
 * and remove the directory on every way out. A scratch directory that could
 * not be obtained is a `HelperFailure`, with the helper's own reason: nothing
 * is extracted anywhere else.
 */
export declare function withScratch<T>(cwd: string, fn: (dir: string) => T, bin?: string): T;
/** Why there is nothing to read against. The vocabulary, and each value's exit code, is `bin/fusion-forum`'s. */
export type NoRef = "no-work-tree" | "no-branch" | "no-upstream" | "upstream-unresolved" | "workbench-untracked" | "fetch-failed" | "workbench-outside-repo";
export type FetchedRef = {
    state: "ok";
    /** The ref read, as the branch names its upstream or as the caller named it. */
    ref: string;
    /** The commit the ref names after the fetch. */
    head: string;
    /** The repository's root, physical. */
    gitRoot: string;
    /** The workbench's path in a commit, relative to that root. */
    rel: string;
    /** True when the ref belongs to no remote, so nothing was fetched. */
    local: boolean;
} | {
    state: NoRef;
    branch?: string;
    ref?: string;
};
/**
 * Resolve the ref to read, fetch its remote, and name the commit it stands
 * at. `override` is the ref the caller names in place of the branch's
 * upstream; with it no branch is needed, so a detached HEAD and a branch
 * tracking nothing are both readable. `cwd` is inside the working tree and
 * `workbench` is the workbench directory found above it. git's own stderr
 * passes through on a failed fetch.
 */
export declare function fetchRef(cwd: string, workbench: string, override: string | null): FetchedRef;
/**
 * Write `entries` of the workbench, as `at.head` holds them, below `into`,
 * and return the extracted workbench directory. An entry is a path relative
 * to the workbench; one that is in no tree at the commit is left out. The
 * archive is written to a file and unpacked from it, so nothing of it is held
 * in memory.
 */
export declare function extractAt(at: {
    gitRoot: string;
    head: string;
    rel: string;
}, entries: readonly string[], into: string): string;
/** What the overview extracts: the manifest and the marker, the two root stores, the event log. */
export declare const OVERVIEW_ENTRIES: readonly string[];
/** One claimed package at the ref. */
export interface Held {
    /** The eight hex characters the claim names. */
    checkout: string;
    /** The registry's alias for it at the ref, or null where the registry names none. */
    alias: string | null;
    /** The package's container name. */
    package: string;
    /** Milliseconds, or null where the checkout's rows name no commit. */
    lastPush: number | null;
    /** `edge:<container>` and `decision:<basename>` entries; empty when it waits for nothing. */
    waits: string[];
}
export interface Overview {
    ref: string;
    head: string;
    /** The head's committer time, milliseconds. */
    headTime: number;
    /** The campaign files at the ref, as `list` names them, readable or not. */
    campaigns: number;
    held: Held[];
    /** One entry per degradation: a token, then its fields. */
    notes: string[][];
}
export type OverviewRead = {
    kind: "overview";
    overview: Overview;
} | ({
    kind: "failed";
} & Unread);
/** A row of `list` that is a campaign file, readable or not; by path, because a file the codec could not read comes back with no kind. */
export declare const isCampaignRow: (row: Record<string, unknown>) => boolean;
/**
 * The reduced overview of the workbench extracted at `at.head`. `workbench`
 * is that extract, `cwd` the working tree the registry helper runs in.
 */
export declare function readOverview(at: {
    ref: string;
    head: string;
    gitRoot: string;
    local: boolean;
}, workbench: string, cwd: string, options?: {
    ask?: Ask;
    bin?: string;
}): OverviewRead;
/** Milliseconds as RFC 3339 in UTC at second resolution, the one time format the output carries. */
export declare function rfc3339(ms: number): string;
/** The `KEY=value` text `bin/fusion-campaign overview` prints on `state=ok`; that script's header defines every line. */
export declare function renderOverview(o: Overview, windowHours: number, now: number): string;

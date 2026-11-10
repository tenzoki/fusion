/**
 * The overview above the checkouts, read out of a fetched ref and never out
 * of the working tree: which checkout holds which work package at the commit
 * the remote stood at, when that checkout last pushed, and what the package
 * waits for. Behind `bin/fusion-campaign overview`; `bin/fusion-campaign`'s
 * header is the authoritative documentation of the output, and this header is
 * that of the mechanism.
 *
 * Two tiers in one read (spec C1 of
 * `261108-2135-spec-campaign-the-frame-for-work-spread-over-several-checkouts.md`).
 * The reduced tier needs no campaign record: the held packages, their last
 * push and what each waits for (plan step 7b). The full tier reads the
 * campaign files at the ref through the codec and adds, per live campaign
 * with lanes, the lane view and the seven conditions of plan step 14; a
 * campaign the codec reports a finding against is printed unreadable and
 * evaluated no further, and a terminal campaign steers nobody, so its lanes
 * are not evaluated either (`LIVE_STATES`, the rule `lib/campaign-sync.ts`
 * `mineOf` applies).
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
 *                   `list` for the open decisions and the package rows;
 *                   `readCampaignsAt` for the campaign files (`list` for the
 *                   set, `reconcile` for the findings, the three lane rules
 *                   among them, `show` per readable campaign); one `show` per
 *                   claimed package and per lane member, for the checkout a
 *                   claim names and the areas a package declares; the
 *                   extracted event log for the last push and for the read
 *                   confirmations; `git log` over the ref for the join and for
 *                   the cross-lane check.
 *   `readCutInput`  the input of `lib/campaign-cut.ts` over a WORKING TREE,
 *                   never an extract: `readWorkGraph` for the live nodes, their
 *                   order, depth and `dependsOn`, one `list` for the record ids
 *                   those name, `packageFacts` per node for its declared areas.
 *
 * Nothing here reads a workbench file from the working tree. The working tree
 * is consulted for two things: where the workbench is, and where its
 * repository's root is, which together give the path the workbench has in a
 * commit.
 *
 * ## The lane view and the seven conditions
 *
 * A lane's members are record references; each is resolved to its container
 * through the package rows of `list`, and one that resolves to nothing is a
 * `lane-member-unknown` note. The lane row names the checkout's alias, the
 * packages that checkout holds (anywhere in the workbench, not only in the
 * lane) and `next`, the first member in lane order that is live and unheld,
 * with what it waits for in the vocabulary of `held=`. A paused member is
 * live and unheld, so it can be `next`: the rule is stated as the plan states
 * it, and `paused` is what the package's own status says.
 *
 * Each condition is one row printed only when it holds:
 *
 *   silent            the lane's checkout holds nothing and has no push within
 *                     the window: decided at render time, since the window and
 *                     the clock are the run's and not the read's (`isSilent`);
 *   out-of-lane       a held package stands in a lane and its holder is not
 *                     that lane's checkout; the holder's own lane in the same
 *                     campaign, or `-` where it has none;
 *   in-no-lane        a held package stands in no lane of any live campaign.
 *                     Evaluated, with `out-of-lane`, only while some live
 *                     campaign has lanes: a campaign whose `lanes` is null has
 *                     nothing to be in or out of, and the cut is still owed;
 *   waits-decision    the lane's `next` carries an open decision record;
 *   handoff-possible  an edge whose source is terminal (`done` or `dropped`,
 *                     read off the package row), whose target is live and
 *                     unheld, and whose ends sit in different lanes of one
 *                     campaign. Per edge: a target with two such sources
 *                     prints two rows;
 *   cross-lane        `## The cross-lane check` below;
 *   unconfirmed       no `campaign_read` row by the lane's checkout names the
 *                     campaign file's `sha256:` revision at the ref; the
 *                     newest confirmation of any revision is printed beside
 *                     it, so a stale confirmation is told from none.
 *
 * ## The cross-lane check
 *
 * Over `git log --name-only` from the commit that first added the campaign
 * file (exclusive) to the ref's head: each commit is attributed to a checkout
 * by `commitNamedBy` run the other way round, over every `commit` row of the
 * extracted log that carries a checkout, so a commit a rebase renamed is still
 * its checkout's; two rows of different checkouts naming one commit attribute
 * it to nobody. Each lane's area is the union of its members' `resources`,
 * every member counted, terminal ones included. A path is inside an area when
 * it equals a declared path or lies under it at a `/` boundary, the one
 * spelling `codec/schemas/package.schema.json` admits. A path of a commit by
 * a lane's checkout that lies inside another lane's area and outside the
 * committer lane's own is a row, one per declaring lane. An unattributed
 * commit is a `commit-unattributed` note when one of its paths lies in some
 * lane's area; a commit that touches no declared area could print no row
 * whatever its attribution, so it is not a degradation and gets no note. A
 * commit by a checkout that stands in no lane has no committer lane and
 * prints nothing: the row compares two lanes, and the plan defines no row for
 * it. A file several lanes share by design is declared on none of them
 * (ruling B of 2026-11-09 in
 * `261108-1924-campaign-the-frame-for-work-spread-over-several-checkouts.md`),
 * so a commit into it prints no row: the limit is the ruling's, and the
 * documentation page of plan step 20 states it.
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
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { blockedRead, findingsByPath, isObject, isPackageRow, listedRecords, listOf, problemOf, refusedByGate, resultOf } from "./codec-read.js";
import { parseTs } from "./events-query.js";
import { ask as askCodec } from "./record-client.js";
import { EVENT_LOG } from "./record-change.js";
import { SETUP_MARKER } from "./record-write.js";
import { CAMPAIGN_RECORD, CAMPAIGN_STORE, CONTAINER_STORE, PACKAGE_CONTROL, WORKBENCH_MANIFEST, narrativeOf } from "./stores.js";
import { readWorkGraph } from "./work-graph.js";
/* ------------------------------------------------------------------ *
 * The join: which commit of a listing a `commit` row names
 * ------------------------------------------------------------------ */
/** The `git log` format the join reads: hash, author time, committer time, subject, tab-separated. */
export const COMMIT_LISTING_FORMAT = "%H%x09%at%x09%ct%x09%s";
/** How far a row's `ts` may stand from the author time of the commit a rebase made of the row's commit. */
export const REBASE_WINDOW_SECONDS = 60;
/** As `bin/fusion-commit-lock` `json_escape` flattens a subject before it writes the row. */
const withoutControls = (text) => text.replace(/[\u0000-\u001f]/g, "");
/** Code-unit comparison, so every order here is the same in every locale. */
const ascending = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
/** The output of `git log --format=COMMIT_LISTING_FORMAT <head>`, prepared for `commitNamedBy`. A line that is not four fields is no commit and is left out. */
export function commitListing(text) {
    const byHash = new Map();
    const bySubject = new Map();
    for (const line of text.split("\n")) {
        // The subject is the last field and may hold a tab of its own.
        const [hash, at, ct, ...rest] = line.split("\t");
        if (rest.length === 0 || !/^[0-9a-f]+$/.test(hash) || !/^\d+$/.test(at) || !/^\d+$/.test(ct))
            continue;
        const commit = { hash, authorTime: Number(at), committerTime: Number(ct), subject: withoutControls(rest.join("\t")) };
        byHash.set(hash, commit);
        const same = bySubject.get(commit.subject);
        if (same === undefined)
            bySubject.set(commit.subject, [commit]);
        else
            same.push(commit);
    }
    return { hashes: [...byHash.keys()].sort(ascending), byHash, bySubject };
}
/** The one commit whose hash `prefix` abbreviates, or null when the listing holds none or more than one. */
function abbreviated(prefix, listing) {
    let low = 0;
    let high = listing.hashes.length;
    while (low < high) {
        const mid = (low + high) >> 1;
        if (listing.hashes[mid] < prefix)
            low = mid + 1;
        else
            high = mid;
    }
    const first = listing.hashes[low];
    if (first === undefined || !first.startsWith(prefix))
        return null;
    if (listing.hashes[low + 1]?.startsWith(prefix))
        return null;
    return listing.byHash.get(first) ?? null;
}
/**
 * The commit of `listing` that `row` names, or null: the header's
 * `## Which commit a commit row names`. Pure over the listing, so a caller
 * that attributes commits to checkouts runs it over every row and reads the
 * answer the other way round.
 */
export function commitNamedBy(row, listing) {
    const shape = /^([0-9a-f]{4,64}) ([\s\S]*)$/.exec(row.detail);
    if (shape === null)
        return null;
    const byHash = abbreviated(shape[1], listing);
    if (byHash !== null)
        return byHash;
    const at = parseTs(row.ts);
    if (at === null)
        return null;
    const candidates = (listing.bySubject.get(withoutControls(shape[2])) ?? []).filter((c) => Math.abs(c.authorTime * 1000 - at) <= REBASE_WINDOW_SECONDS * 1000);
    return candidates.length === 1 ? candidates[0] : null;
}
/**
 * The `commit` and `campaign_read` rows of the event log's text. `parseLog`
 * of `lib/events-query.ts` is not used because it drops `detail`, the one
 * field the join cannot do without. `unreadable` counts the lines that are no
 * JSON object, the `commit` rows without a `detail` or a readable `ts`, and
 * the `campaign_read` rows without a `campaign`, a `revision` or a readable
 * `ts`: a lost row is a possible under-report, so it is counted and never
 * skipped in silence.
 */
export function readLog(text) {
    const commits = [];
    const reads = [];
    let unreadable = 0;
    for (const raw of text.split("\n")) {
        if (raw.trim() === "")
            continue;
        let value;
        try {
            value = JSON.parse(raw);
        }
        catch {
            unreadable += 1;
            continue;
        }
        if (!isObject(value)) {
            unreadable += 1;
            continue;
        }
        if (value.event !== "commit" && value.event !== "campaign_read")
            continue;
        const checkout = typeof value.checkout === "string" && value.checkout !== "" ? value.checkout : null;
        if (typeof value.ts !== "string" || parseTs(value.ts) === null) {
            unreadable += 1;
            continue;
        }
        if (value.event === "commit") {
            if (typeof value.detail !== "string") {
                unreadable += 1;
                continue;
            }
            commits.push({ ts: value.ts, checkout, detail: value.detail });
        }
        else {
            if (typeof value.campaign !== "string" || typeof value.revision !== "string") {
                unreadable += 1;
                continue;
            }
            reads.push({ ts: value.ts, checkout, campaign: value.campaign, revision: value.revision });
        }
    }
    return { commits, reads, unreadable };
}
/** The header's `## The last push is a lower bound`, over the rows of one checkout. */
export function lastPush(rows, listing) {
    let named = null;
    const unnamed = [];
    for (const row of rows) {
        const written = parseTs(row.ts) ?? 0;
        const commit = commitNamedBy(row, listing);
        if (commit === null) {
            unnamed.push(written);
            continue;
        }
        const committed = commit.committerTime * 1000;
        if (named === null || committed > named.committed || (committed === named.committed && written > named.written))
            named = { committed, written };
    }
    const from = named === null ? -Infinity : named.written;
    const later = unnamed.filter((written) => written > from);
    return { time: named === null ? null : named.committed, unmatched: later.length, newestUnmatched: later.length === 0 ? null : Math.max(...later) };
}
/* ------------------------------------------------------------------ *
 * git, the sibling helpers and the scratch directory
 * ------------------------------------------------------------------ */
/** The helper itself could not do its work, as opposed to an answer about the project: a sibling program or `git` failed where no state names the failure. */
export class HelperFailure extends Error {
    name = "HelperFailure";
}
/** dist layout: `<plugin>/hooks/dist/lib/campaign.js` → `<plugin>/bin`. An install copy and a work tree each run their own siblings. */
export function defaultBin() {
    return resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "bin");
}
/**
 * One program, to completion. Not `lib/git.ts`: that one carries a hook's
 * ten-second budget and collapses every failure to null, while a fetch has no
 * budget (`bin/fusion-forum` `## Why there is no timeout`) and the states
 * below are told apart by exit status. Exported for `lib/campaign-write.ts`,
 * whose claim test runs a sibling helper the same way.
 */
export function run(program, args, cwd, env = process.env) {
    const r = spawnSync(program, args, { cwd, env, encoding: "utf-8", maxBuffer: 512 * 1024 * 1024 });
    return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.error === undefined ? (r.stderr ?? "") : String(r.error) };
}
const git = (cwd, ...args) => run("git", args, cwd);
/** `git` whose failure has no state of its own. Exported for `lib/campaign-sync.ts`, whose plumbing between the fetch and the push is of that kind. */
export function mustGit(cwd, ...args) {
    const r = git(cwd, ...args);
    if (r.status !== 0)
        throw new HelperFailure(`git ${args.join(" ")} failed (${r.status}): ${r.stderr.trim()}`);
    return r.stdout;
}
/**
 * What `bin/fusion-tmp path` prints: the directory fusion's intermediate
 * files go to. One that could not be obtained is a `HelperFailure`, with the
 * helper's own reason: nothing is written anywhere else.
 */
export function tmpPath(cwd, bin = defaultBin()) {
    const helper = join(bin, "fusion-tmp");
    const answered = run(helper, ["path"], cwd);
    const base = answered.stdout.trim();
    if (answered.status !== 0 || base === "")
        throw new HelperFailure(`${helper} path gave no directory (${answered.status}): ${answered.stderr.trim()}`);
    // What the helper says beside its answer (a minted identifier, a long path) is the user's to read.
    if (answered.stderr !== "")
        process.stderr.write(answered.stderr);
    return base;
}
/**
 * Run `fn` with a fresh directory under what `bin/fusion-tmp path` prints,
 * and remove the directory on every way out.
 */
export function withScratch(cwd, fn, bin = defaultBin()) {
    const dir = mkdtempSync(join(tmpPath(cwd, bin), "campaign-"));
    try {
        return fn(dir);
    }
    finally {
        rmSync(dir, { recursive: true, force: true });
    }
}
/** The remote a short ref name belongs to: the longest configured remote that prefixes it, or null for a local ref. */
function remoteOf(cwd, ref) {
    const short = ref.replace(/^refs\/remotes\//, "");
    const owners = mustGit(cwd, "remote").split("\n").filter((r) => r !== "" && short.startsWith(`${r}/`));
    return owners.sort((a, b) => b.length - a.length)[0] ?? null;
}
/**
 * Resolve the ref to read, fetch its remote, and name the commit it stands
 * at. `override` is the ref the caller names in place of the branch's
 * upstream; with it no branch is needed, so a detached HEAD and a branch
 * tracking nothing are both readable. `cwd` is inside the working tree and
 * `workbench` is the workbench directory found above it. git's own stderr
 * passes through on a failed fetch.
 */
export function fetchRef(cwd, workbench, override) {
    if (git(cwd, "rev-parse", "--is-inside-work-tree").stdout.trim() !== "true")
        return { state: "no-work-tree" };
    let ref;
    let remote;
    let branch;
    if (override !== null) {
        ref = override;
        remote = remoteOf(cwd, override);
    }
    else {
        branch = git(cwd, "symbolic-ref", "-q", "--short", "HEAD").stdout.trim();
        if (branch === "")
            return { state: "no-branch" };
        const [upstream = "", remotename = ""] = mustGit(cwd, "for-each-ref", "--format=%(upstream:short)%09%(upstream:remotename)", `refs/heads/${branch}`).trim().split("\t");
        if (upstream === "")
            return { state: "no-upstream", branch };
        ref = upstream;
        remote = remotename === "" || remotename === "." ? null : remotename;
    }
    if (remote !== null) {
        // Every credential prompt becomes an immediate failure; a slow transfer stays visible and interruptible.
        const fetched = spawnSync("git", ["fetch", "--quiet", remote], { cwd, env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_SSH_COMMAND: "ssh -oBatchMode=yes" }, stdio: ["ignore", "ignore", "inherit"] });
        if (fetched.status !== 0)
            return { state: "fetch-failed", branch, ref };
    }
    // Both sides physical, so a symlinked directory is not read as a workbench outside the repository.
    const gitRoot = realpathSync(mustGit(cwd, "rev-parse", "--show-toplevel").trim());
    const physical = realpathSync(workbench);
    if (!physical.startsWith(`${gitRoot}/`))
        return { state: "workbench-outside-repo", branch, ref };
    const rel = physical.slice(gitRoot.length + 1);
    const resolved = git(cwd, "rev-parse", "-q", "--verify", "--end-of-options", `${ref}^{commit}`);
    if (resolved.status !== 0)
        return { state: "upstream-unresolved", branch, ref };
    const head = resolved.stdout.trim();
    // A workbench in no tree at the ref is nothing to read against, and never an empty overview.
    if (mustGit(gitRoot, "ls-tree", "-d", "--full-tree", head, "--", rel).trim() === "")
        return { state: "workbench-untracked", branch, ref };
    return { state: "ok", ref, head, gitRoot, rel, local: remote === null };
}
/**
 * Write `entries` of the workbench, as `at.head` holds them, below `into`,
 * and return the extracted workbench directory. An entry is a path relative
 * to the workbench; one that is in no tree at the commit is left out. The
 * archive is written to a file and unpacked from it, so nothing of it is held
 * in memory.
 */
export function extractAt(at, entries, into) {
    const wanted = entries.map((e) => `${at.rel}/${e}`);
    const present = mustGit(at.gitRoot, "ls-tree", "-z", "--full-tree", "--name-only", at.head, "--", ...wanted).split("\0").filter((p) => p !== "");
    const tree = join(into, "tree");
    mkdirSync(tree, { recursive: true });
    if (present.length > 0) {
        const archive = join(into, "extract.tar");
        mustGit(at.gitRoot, "archive", "--format=tar", "-o", archive, at.head, "--", ...present);
        const unpacked = run("tar", ["-xf", archive, "-C", tree], at.gitRoot);
        if (unpacked.status !== 0)
            throw new HelperFailure(`tar could not unpack the workbench at ${at.head} (${unpacked.status}): ${unpacked.stderr.trim()}`);
        rmSync(archive, { force: true });
    }
    return join(tree, at.rel);
}
/* ------------------------------------------------------------------ *
 * The campaigns at a ref, through the codec
 * ------------------------------------------------------------------ */
/** The states in which a campaign steers a checkout: its lanes are evaluated here and `sync` reads it as `mine`. */
export const LIVE_STATES = new Set(["running", "paused"]);
/** The campaign path of `list`'s row, read as a `CampaignAtRef` where its `show` answered a state; null where it did not. */
function campaignOf(control, id, revision) {
    const state = isObject(control) && isObject(control.state) ? control.state : null;
    if (state === null || typeof state.state !== "string")
        return null;
    const lanes = isObject(control) && Array.isArray(control.lanes) ? control.lanes : null;
    return {
        id,
        state: state.state,
        revision,
        reason: typeof state.reason === "string" ? state.reason : null,
        lanes: lanes === null
            ? null
            : lanes.filter(isObject).map((lane) => ({
                id: String(lane.id),
                checkout: typeof lane.checkout_id === "string" ? lane.checkout_id : null,
                members: (Array.isArray(lane.members) ? lane.members : []).filter(isObject).map((m) => m.record_id).filter((r) => typeof r === "string"),
            })),
    };
}
/**
 * The campaigns of the workbench at `workbench` (an extract, or a working
 * tree), through the codec: `list` for the set, `reconcile` for the findings
 * (the three lane rules among them, which `list` alone does not carry:
 * `codec/README.md`, "The lane rules"), `show` per readable campaign. No
 * second parser reads a campaign. Shared by the overview and by
 * `lib/campaign-sync.ts`.
 */
export function readCampaignsAt(workbench, ask = askCodec) {
    const failed = (unread) => ({ kind: "failed", ...unread });
    const gated = refusedByGate(workbench, ask);
    if (gated !== null)
        return failed(gated);
    const listed = listedRecords(workbench, ask);
    if ("unread" in listed)
        return failed(listed.unread);
    const reconciled = resultOf(workbench, { op: "reconcile" }, ask);
    if ("unread" in reconciled)
        return failed(reconciled.unread);
    const findings = listOf("reconcile", reconciled.result, "records");
    if ("unread" in findings)
        return failed(findings.unread);
    const found = findingsByPath("reconcile", findings.list);
    const campaigns = [];
    const unreadable = [];
    for (const row of listed.list) {
        if (!isObject(row) || !isCampaignRow(row))
            continue;
        const path = row.path;
        const id = basename(dirname(path));
        const bad = "problem" in row ? { op: "list", problem: problemOf(row.problem) } : (found.get(path) ?? null);
        if (bad !== null) {
            const blocked = blockedRead(bad.op, bad.problem);
            if (blocked !== null)
                return failed(blocked);
            unreadable.push({ id, problem: bad.problem });
            continue;
        }
        const shown = resultOf(workbench, { op: "show", record: { path } }, ask);
        if ("unread" in shown)
            return failed(shown.unread);
        const campaign = typeof row.revision === "string" ? campaignOf(shown.result.control, id, row.revision) : null;
        if (campaign === null)
            return failed({ cause: "unanswered", op: "show", how: "unparseable", detail: `${path} answered no state.state or list named no revision for it` });
        campaigns.push(campaign);
    }
    campaigns.sort((a, b) => ascending(a.id, b.id));
    unreadable.sort((a, b) => ascending(a.id, b.id));
    return { kind: "campaigns", campaigns, unreadable };
}
/* ------------------------------------------------------------------ *
 * The overview
 * ------------------------------------------------------------------ */
/** What the overview extracts: the manifest and the marker, the two root stores, the event log. */
export const OVERVIEW_ENTRIES = [WORKBENCH_MANIFEST, SETUP_MARKER, CONTAINER_STORE, CAMPAIGN_STORE, EVENT_LOG];
/** A row of `list` that is a campaign file, readable or not; by path, because a file the codec could not read comes back with no kind. */
export const isCampaignRow = (row) => typeof row.path === "string" && row.path.startsWith(`${CAMPAIGN_STORE}/`) && basename(row.path) === CAMPAIGN_RECORD;
/** The registry's alias for `checkout` at `head`: the alias or null, and the helper's exit code where it could not look. */
function aliasAt(checkout, head, cwd, bin) {
    if (!/^[0-9a-f]{8}$/.test(checkout))
        return { alias: null, unread: null };
    const r = run(join(bin, "fusion-checkout-name"), ["resolve", checkout, "--at", head], cwd);
    // 0 is an entry, 3 is no entry at that commit; every other code is a lookup that did not happen.
    if (r.status !== 0)
        return { alias: null, unread: r.status === 3 ? null : r.status };
    const line = r.stdout.split("\n").find((l) => l.startsWith("alias="));
    const alias = line === undefined ? "" : line.slice("alias=".length).replace(/[\u0000-\u001f]+/g, " ").trim();
    return { alias: alias === "" ? null : alias, unread: null };
}
/** A path is inside a declared area when it is the area or lies under it at a `/` boundary. */
export const insideArea = (path, areas) => {
    for (const area of areas)
        if (path === area || path.startsWith(`${area}/`))
            return true;
    return false;
};
/** `show` of the package at `dir`, read for `PackageFacts`; the codec's `list` row carries neither. */
export function packageFacts(workbench, dir, ask) {
    const answer = resultOf(workbench, { op: "show", record: { path: `${CONTAINER_STORE}/${dir}/${PACKAGE_CONTROL}` } }, ask);
    if ("unread" in answer)
        return answer;
    const control = isObject(answer.result.control) ? answer.result.control : {};
    const claim = isObject(control.claim) ? control.claim : {};
    return {
        checkout: typeof claim.checkout_id === "string" && claim.checkout_id !== "" ? claim.checkout_id : null,
        resources: Array.isArray(control.resources) ? control.resources.filter((r) => typeof r === "string") : [],
    };
}
/**
 * The input of `lib/campaign-cut.ts` over the workbench at `workbench`, a
 * working tree: `readWorkGraph` for the live nodes in their order, their
 * depth and the resolved edges (a terminal package is no node, so an edge on
 * one is no hand-off), then `packageFacts` per node for its declared areas.
 * The cut reads nothing else.
 */
export function readCutInput(workbench, ask = askCodec) {
    const graph = readWorkGraph(workbench, ask);
    if (graph.kind === "failed")
        return graph;
    const listed = listedRecords(workbench, ask);
    if ("unread" in listed)
        return { kind: "failed", ...listed.unread };
    const containerOf = new Map();
    for (const row of listed.list) {
        if (isObject(row) && isPackageRow(row) && typeof row.id === "string" && typeof row.path === "string")
            containerOf.set(row.id, basename(dirname(row.path)));
    }
    const nodes = [];
    for (const row of graph.report.rows) {
        const facts = packageFacts(workbench, row.dir, ask);
        if ("unread" in facts)
            return { kind: "failed", ...facts.unread };
        nodes.push({ dir: row.dir, areas: facts.resources, depth: row.depth });
    }
    // `dependsOn` names record ids, satisfied and unresolved entries included; an entry whose target is a live node
    // is a resolved edge and nothing else (`lib/work-graph.ts` `## The table one edge entry falls in`).
    const live = new Set(nodes.map((n) => n.dir));
    const edges = [];
    for (const row of graph.report.rows) {
        for (const id of row.dependsOn) {
            const to = containerOf.get(id);
            if (to !== undefined && live.has(to))
                edges.push({ from: row.dir, to });
        }
    }
    return { kind: "input", input: { nodes, edges } };
}
/** The `git log` format of the cross-lane listing: a NUL marks the commit line, so a path can never be read as one. */
const NAME_ONLY_FORMAT = "%x00%H%x09%h";
/** The commits of `git log --format=NAME_ONLY_FORMAT --name-only <range>`, newest first, each with its paths. */
export function touchedCommits(text) {
    const commits = [];
    for (const line of text.split("\n")) {
        if (line.startsWith("\0")) {
            const [hash, short] = line.slice(1).split("\t");
            commits.push({ hash, short: short ?? hash.slice(0, 7), paths: [] });
        }
        else if (line !== "" && commits.length > 0)
            commits[commits.length - 1].paths.push(line);
    }
    return commits;
}
/**
 * The overview of the workbench extracted at `at.head`, both tiers.
 * `workbench` is that extract, `cwd` the working tree the registry helper
 * runs in.
 */
export function readOverview(at, workbench, cwd, options = {}) {
    const ask = options.ask ?? askCodec;
    const bin = options.bin ?? defaultBin();
    const failed = (unread) => ({ kind: "failed", ...unread });
    const notes = [];
    if (at.local)
        notes.push(["local-ref"]);
    const graph = readWorkGraph(workbench, ask);
    if (graph.kind === "failed")
        return graph;
    const { report } = graph;
    const listed = listedRecords(workbench, ask);
    if ("unread" in listed)
        return failed(listed.unread);
    const rows = listed.list.filter(isObject);
    for (const u of report.unreadable)
        notes.push(["package-unreadable", u.dir, `${u.problem.class}/${u.problem.reason}`]);
    const campaignsRead = readCampaignsAt(workbench, ask);
    if (campaignsRead.kind === "failed")
        return campaignsRead;
    const { campaigns, unreadable } = campaignsRead;
    // --- the log, and the listing its rows are joined against -------------------
    const log = join(workbench, EVENT_LOG);
    const read = existsSync(log) ? readLog(readFileSync(log, "utf-8")) : null;
    if (read === null)
        notes.push(["event-log-untracked"]);
    else if (read.unreadable > 0)
        notes.push(["log-lines-unreadable", String(read.unreadable)]);
    const listing = commitListing(mustGit(at.gitRoot, "log", `--format=${COMMIT_LISTING_FORMAT}`, at.head));
    const headTime = (listing.byHash.get(at.head)?.committerTime ?? 0) * 1000;
    // --- the packages: container by id, status by container, what each waits for ---
    const live = new Set(report.rows.map((r) => r.dir));
    const nodeOf = new Map(report.rows.map((r) => [r.dir, r]));
    const containerOf = new Map();
    const statusOf = new Map();
    for (const row of rows) {
        if (!isPackageRow(row) || typeof row.id !== "string" || typeof row.path !== "string")
            continue;
        const dir = basename(dirname(row.path));
        containerOf.set(row.id, dir);
        if (typeof row.status === "string")
            statusOf.set(dir, row.status);
    }
    const waitsOf = (dir, dependsOn) => {
        const edges = new Set();
        for (const id of dependsOn) {
            const target = containerOf.get(id);
            if (target !== undefined && live.has(target))
                edges.add(target);
        }
        for (const u of report.unmetEdges)
            if (u.from === dir)
                edges.add(u.to);
        const decisions = new Set();
        for (const row of rows) {
            if (row.kind !== "decision" || row.status !== "open" || typeof row.path !== "string" || !row.path.startsWith(`${CONTAINER_STORE}/${dir}/`))
                continue;
            decisions.add(basename(narrativeOf(row.path) ?? row.path));
        }
        return [...[...edges].sort(ascending).map((e) => `edge:${e}`), ...[...decisions].sort(ascending).map((d) => `decision:${d}`)];
    };
    // --- `show` per package, once: the claim's checkout and the declared areas ----
    const shown = new Map();
    const showPackage = (dir) => {
        const cached = shown.get(dir);
        if (cached !== undefined)
            return cached;
        const facts = packageFacts(workbench, dir, ask);
        if (!("unread" in facts))
            shown.set(dir, facts);
        return facts;
    };
    // --- per checkout, once: the last push and the alias, each with its notes -------
    const facts = new Map();
    const factsOf = (checkout) => {
        const cached = facts.get(checkout);
        if (cached !== undefined)
            return cached;
        const own = (read?.commits ?? []).filter((r) => r.checkout === checkout);
        const push = lastPush(own, listing);
        if (read !== null && own.length === 0)
            notes.push(["no-commit-rows", checkout]);
        if (push.unmatched > 0)
            notes.push(["commit-rows-unmatched", checkout, String(push.unmatched), rfc3339(push.newestUnmatched)]);
        const named = aliasAt(checkout, at.head, cwd, bin);
        if (named.unread !== null)
            notes.push(["registry-unreadable", checkout, String(named.unread)]);
        const found = { push, alias: named.alias };
        facts.set(checkout, found);
        return found;
    };
    // --- one row per claimed package ----------------------------------------------
    const held = [];
    const holderOf = new Map();
    for (const row of report.rows) {
        if (row.status !== "claimed")
            continue;
        const s = showPackage(row.dir);
        if ("unread" in s)
            return failed(s.unread);
        if (s.checkout === null)
            return failed({ cause: "unanswered", op: "show", how: "unparseable", detail: `${CONTAINER_STORE}/${row.dir}/${PACKAGE_CONTROL} reads claimed and its claim names no checkout` });
        holderOf.set(row.dir, s.checkout);
        const f = factsOf(s.checkout);
        held.push({ checkout: s.checkout, alias: f.alias, package: row.dir, lastPush: f.push.time, waits: waitsOf(row.dir, row.dependsOn) });
    }
    held.sort((a, b) => ascending(a.checkout, b.checkout) || ascending(a.package, b.package));
    // --- the lanes of each live campaign, and the conditions ------------------------
    const lanes = [];
    const conditions = { outOfLane: [], inNoLane: [], waitsDecision: [], handoff: [], crossLane: [], unconfirmed: [] };
    /** Which commit of the listing each `commit` row names, the other way round: the committing checkout per hash, null where two checkouts' rows name one commit. */
    let attributed = null;
    const checkoutOfCommit = () => {
        if (attributed !== null)
            return attributed;
        attributed = new Map();
        for (const row of read?.commits ?? []) {
            if (row.checkout === null)
                continue;
            const commit = commitNamedBy(row, listing);
            if (commit === null)
                continue;
            const before = attributed.get(commit.hash);
            attributed.set(commit.hash, before === undefined || before === row.checkout ? row.checkout : null);
        }
        return attributed;
    };
    /** Container to its lane, over every live campaign: what `in-no-lane` and `out-of-lane` read. */
    const laneOf = new Map();
    const laneOfCheckout = new Map();
    let anyLanes = false;
    for (const c of campaigns) {
        if (!LIVE_STATES.has(c.state) || c.lanes === null)
            continue;
        anyLanes = true;
        const byCheckout = new Map();
        laneOfCheckout.set(c.id, byCheckout);
        const laneHere = new Map();
        const resolved = [];
        for (const lane of c.lanes) {
            const containers = [];
            for (const id of lane.members) {
                const dir = containerOf.get(id);
                if (dir === undefined)
                    notes.push(["lane-member-unknown", c.id, lane.id, id]);
                else
                    containers.push(dir);
            }
            const area = new Set();
            for (const dir of containers) {
                const s = showPackage(dir);
                if ("unread" in s)
                    return failed(s.unread);
                for (const r of s.resources)
                    area.add(r);
            }
            resolved.push({ ...lane, containers, area });
            if (lane.checkout !== null)
                byCheckout.set(lane.checkout, lane.id);
            for (const dir of containers) {
                laneHere.set(dir, lane.id);
                if (!laneOf.has(dir))
                    laneOf.set(dir, { campaign: c.id, lane: lane.id });
            }
        }
        for (const lane of resolved) {
            const f = lane.checkout === null ? null : factsOf(lane.checkout);
            const heldHere = lane.checkout === null ? [] : [...holderOf].filter(([, h]) => h === lane.checkout).map(([dir]) => dir).sort(ascending);
            const next = lane.containers.find((dir) => live.has(dir) && !holderOf.has(dir)) ?? null;
            const nextWaits = next === null ? [] : waitsOf(next, nodeOf.get(next)?.dependsOn ?? []);
            lanes.push({ campaign: c.id, lane: lane.id, checkout: lane.checkout, alias: f?.alias ?? null, held: heldHere, next, nextWaits, lastPush: f?.push.time ?? null });
            for (const w of nextWaits)
                if (w.startsWith("decision:"))
                    conditions.waitsDecision.push({ campaign: c.id, lane: lane.id, next: next, decision: w.slice("decision:".length) });
            if (lane.checkout !== null) {
                const own = (read?.reads ?? []).filter((r) => r.checkout === lane.checkout && r.campaign === c.id);
                if (!own.some((r) => r.revision === c.revision)) {
                    const times = own.map((r) => parseTs(r.ts) ?? 0);
                    conditions.unconfirmed.push({ campaign: c.id, lane: lane.id, checkout: lane.checkout, revision: c.revision, last: times.length === 0 ? null : Math.max(...times) });
                }
            }
        }
        // A hand-off: the source terminal, the target live and unheld, the two in different lanes of this campaign.
        for (const node of report.rows) {
            if (node.status === "claimed")
                continue;
            const toLane = laneHere.get(node.dir);
            if (toLane === undefined)
                continue;
            for (const id of node.dependsOn) {
                const from = containerOf.get(id);
                const status = from === undefined ? undefined : statusOf.get(from);
                if (from === undefined || (status !== "done" && status !== "dropped"))
                    continue;
                const fromLane = laneHere.get(from);
                if (fromLane !== undefined && fromLane !== toLane)
                    conditions.handoff.push({ from, to: node.dir, fromLane, toLane });
            }
        }
        // The cross-lane check over the commits since the campaign file was added.
        const campaignPath = `${at.rel}/${CAMPAIGN_STORE}/${c.id}/${CAMPAIGN_RECORD}`;
        const first = mustGit(at.gitRoot, "log", "--diff-filter=A", "--reverse", "--format=%H", at.head, "--", campaignPath).split("\n").find((l) => l !== "");
        if (first === undefined) {
            notes.push(["campaign-first-commit-unknown", c.id]);
            continue;
        }
        const who = checkoutOfCommit();
        for (const commit of touchedCommits(mustGit(at.gitRoot, "log", `--format=${NAME_ONLY_FORMAT}`, "--name-only", `${first}..${at.head}`))) {
            const checkout = who.get(commit.hash) ?? null;
            if (checkout === null) {
                if (commit.paths.some((p) => resolved.some((l) => insideArea(p, l.area))))
                    notes.push(["commit-unattributed", c.id, commit.short]);
                continue;
            }
            const committer = resolved.find((l) => l.checkout === checkout);
            if (committer === undefined)
                continue;
            for (const path of commit.paths) {
                if (insideArea(path, committer.area))
                    continue;
                for (const lane of resolved)
                    if (lane !== committer && insideArea(path, lane.area))
                        conditions.crossLane.push({ hash: commit.short, path, committerLane: committer.id, declaringLane: lane.id });
            }
        }
    }
    if (anyLanes) {
        for (const [dir, checkout] of holderOf) {
            const placed = laneOf.get(dir);
            if (placed === undefined) {
                conditions.inNoLane.push({ checkout, package: dir });
                continue;
            }
            const holderLane = laneOfCheckout.get(placed.campaign)?.get(checkout) ?? null;
            if (holderLane !== placed.lane)
                conditions.outOfLane.push({ checkout, package: dir, packageLane: placed.lane, holderLane });
        }
        conditions.inNoLane.sort((a, b) => ascending(a.checkout, b.checkout) || ascending(a.package, b.package));
        conditions.outOfLane.sort((a, b) => ascending(a.checkout, b.checkout) || ascending(a.package, b.package));
    }
    conditions.handoff.sort((a, b) => ascending(a.from, b.from) || ascending(a.to, b.to) || ascending(a.toLane, b.toLane));
    return { kind: "overview", overview: { ref: at.ref, head: at.head, headTime, campaigns, unreadable, held, lanes, conditions, notes } };
}
/** Milliseconds as RFC 3339 in UTC at second resolution, the one time format the output carries. */
export function rfc3339(ms) {
    return `${new Date(ms).toISOString().slice(0, 19)}Z`;
}
/** The `silent` condition: the lane has a checkout, it holds nothing, and its last push is none or older than the window. */
export const isSilent = (lane, windowHours, now) => lane.checkout !== null && lane.held.length === 0 && (lane.lastPush === null || now - lane.lastPush > windowHours * 3_600_000);
/** The `KEY=value` text `bin/fusion-campaign overview` prints on `state=ok`; that script's header defines every line. */
export function renderOverview(o, windowHours, now) {
    const time = (ms) => (ms === null ? "none" : rfc3339(ms));
    const list = (items) => (items.length === 0 ? "none" : items.join(","));
    const out = [
        "state=ok",
        `ref=${o.ref}`,
        `head=${o.head}`,
        `head_time=${rfc3339(o.headTime)}`,
        `age_minutes=${Math.max(0, Math.floor((now - o.headTime) / 60_000))}`,
        `window_hours=${windowHours}`,
        `campaigns=${o.campaigns.length + o.unreadable.length}`,
    ];
    for (const c of o.campaigns)
        out.push(`campaign=${[c.id, c.state, c.reason ?? "-", c.lanes === null ? "-" : String(c.lanes.length)].join("\t")}`);
    for (const u of o.unreadable)
        out.push(`campaign-unreadable=${u.id}\t${u.problem.class}/${u.problem.reason}`);
    for (const h of o.held)
        out.push(`held=${[h.checkout, h.alias ?? "-", h.package, time(h.lastPush), list(h.waits)].join("\t")}`);
    for (const l of o.lanes)
        out.push(`lane=${[l.campaign, l.lane, l.checkout ?? "-", l.alias ?? "-", list(l.held), l.next ?? "none", list(l.nextWaits)].join("\t")}`);
    const c = o.conditions;
    for (const l of o.lanes)
        if (isSilent(l, windowHours, now))
            out.push(`silent=${[l.campaign, l.lane, l.checkout, time(l.lastPush)].join("\t")}`);
    for (const r of c.outOfLane)
        out.push(`out-of-lane=${[r.checkout, r.package, r.packageLane, r.holderLane ?? "-"].join("\t")}`);
    for (const r of c.inNoLane)
        out.push(`in-no-lane=${r.checkout}\t${r.package}`);
    for (const r of c.waitsDecision)
        out.push(`waits-decision=${[r.campaign, r.lane, r.next, r.decision].join("\t")}`);
    for (const r of c.handoff)
        out.push(`handoff-possible=${[r.from, r.to, r.fromLane, r.toLane].join("\t")}`);
    for (const r of c.crossLane)
        out.push(`cross-lane=${[r.hash, r.path, r.committerLane, r.declaringLane].join("\t")}`);
    for (const r of c.unconfirmed)
        out.push(`unconfirmed=${[r.campaign, r.lane, r.checkout, r.revision, time(r.last)].join("\t")}`);
    for (const n of o.notes)
        out.push(`note=${n.join("\t")}`);
    return out.join("\n") + "\n";
}

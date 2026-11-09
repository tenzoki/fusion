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
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isObject, isPackageRow, listedRecords, resultOf } from "./codec-read.js";
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
 * The `commit` rows of the event log's text. `parseLog` of
 * `lib/events-query.ts` is not used because it drops `detail`, the one field
 * the join cannot do without. `unreadable` counts the lines that are no JSON
 * object and the `commit` rows without a `detail` or a readable `ts`: a lost
 * row is a possible under-report, so it is counted and never skipped in
 * silence.
 */
export function commitRows(text) {
    const rows = [];
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
        if (value.event !== "commit")
            continue;
        if (typeof value.detail !== "string" || typeof value.ts !== "string" || parseTs(value.ts) === null) {
            unreadable += 1;
            continue;
        }
        rows.push({ ts: value.ts, checkout: typeof value.checkout === "string" && value.checkout !== "" ? value.checkout : null, detail: value.detail });
    }
    return { rows, unreadable };
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
 * below are told apart by exit status.
 */
function run(program, args, cwd, env = process.env) {
    const r = spawnSync(program, args, { cwd, env, encoding: "utf-8", maxBuffer: 512 * 1024 * 1024 });
    return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.error === undefined ? (r.stderr ?? "") : String(r.error) };
}
const git = (cwd, ...args) => run("git", args, cwd);
/** `git` whose failure has no state of its own. */
function mustGit(cwd, ...args) {
    const r = git(cwd, ...args);
    if (r.status !== 0)
        throw new HelperFailure(`git ${args.join(" ")} failed (${r.status}): ${r.stderr.trim()}`);
    return r.stdout;
}
/**
 * Run `fn` with a fresh directory under what `bin/fusion-tmp path` prints,
 * and remove the directory on every way out. A scratch directory that could
 * not be obtained is a `HelperFailure`, with the helper's own reason: nothing
 * is extracted anywhere else.
 */
export function withScratch(cwd, fn, bin = defaultBin()) {
    const helper = join(bin, "fusion-tmp");
    const answered = run(helper, ["path"], cwd);
    const base = answered.stdout.trim();
    if (answered.status !== 0 || base === "")
        throw new HelperFailure(`${helper} path gave no directory (${answered.status}): ${answered.stderr.trim()}`);
    // What the helper says beside its answer (a minted identifier, a long path) is the user's to read.
    if (answered.stderr !== "")
        process.stderr.write(answered.stderr);
    const dir = mkdtempSync(join(base, "campaign-"));
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
 * The overview
 * ------------------------------------------------------------------ */
/** What the overview extracts: the manifest and the marker, the two root stores, the event log. */
export const OVERVIEW_ENTRIES = [WORKBENCH_MANIFEST, SETUP_MARKER, CONTAINER_STORE, CAMPAIGN_STORE, EVENT_LOG];
/** A row of `list` that is a campaign file, readable or not; by path, because a file the codec could not read comes back with no kind. */
const isCampaignRow = (row) => typeof row.path === "string" && row.path.startsWith(`${CAMPAIGN_STORE}/`) && basename(row.path) === CAMPAIGN_RECORD;
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
/**
 * The reduced overview of the workbench extracted at `at.head`. `workbench`
 * is that extract, `cwd` the working tree the registry helper runs in.
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
    const campaigns = rows.filter(isCampaignRow).length;
    if (campaigns > 0)
        notes.push(["campaigns-not-evaluated", String(campaigns)]);
    // --- the log, and the listing its rows are joined against -------------------
    const log = join(workbench, EVENT_LOG);
    const read = existsSync(log) ? commitRows(readFileSync(log, "utf-8")) : null;
    if (read === null)
        notes.push(["event-log-untracked"]);
    else if (read.unreadable > 0)
        notes.push(["log-lines-unreadable", String(read.unreadable)]);
    const listing = commitListing(mustGit(at.gitRoot, "log", `--format=${COMMIT_LISTING_FORMAT}`, at.head));
    const headTime = (listing.byHash.get(at.head)?.committerTime ?? 0) * 1000;
    // --- what each claimed package waits for -------------------------------------
    const live = new Set(report.rows.map((r) => r.dir));
    const containerOf = new Map();
    for (const row of rows)
        if (isPackageRow(row) && typeof row.id === "string")
            containerOf.set(row.id, basename(dirname(row.path)));
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
    // --- one row per claimed package ----------------------------------------------
    const pushes = new Map();
    const aliases = new Map();
    const held = [];
    for (const row of report.rows) {
        if (row.status !== "claimed")
            continue;
        const path = `${CONTAINER_STORE}/${row.dir}/${PACKAGE_CONTROL}`;
        const shown = resultOf(workbench, { op: "show", record: { path } }, ask);
        if ("unread" in shown)
            return failed(shown.unread);
        const claim = isObject(shown.result.control) && isObject(shown.result.control.claim) ? shown.result.control.claim : {};
        const checkout = claim.checkout_id;
        if (typeof checkout !== "string" || checkout === "")
            return failed({ cause: "unanswered", op: "show", how: "unparseable", detail: `${path} reads claimed and its claim names no checkout` });
        if (!pushes.has(checkout)) {
            const own = (read?.rows ?? []).filter((r) => r.checkout === checkout);
            const push = lastPush(own, listing);
            pushes.set(checkout, push);
            if (read !== null && own.length === 0)
                notes.push(["no-commit-rows", checkout]);
            if (push.unmatched > 0)
                notes.push(["commit-rows-unmatched", checkout, String(push.unmatched), rfc3339(push.newestUnmatched)]);
            const named = aliasAt(checkout, at.head, cwd, bin);
            aliases.set(checkout, named.alias);
            if (named.unread !== null)
                notes.push(["registry-unreadable", checkout, String(named.unread)]);
        }
        held.push({ checkout, alias: aliases.get(checkout) ?? null, package: row.dir, lastPush: pushes.get(checkout)?.time ?? null, waits: waitsOf(row.dir, row.dependsOn) });
    }
    held.sort((a, b) => ascending(a.checkout, b.checkout) || ascending(a.package, b.package));
    return { kind: "overview", overview: { ref: at.ref, head: at.head, headTime, campaigns, held, notes } };
}
/** Milliseconds as RFC 3339 in UTC at second resolution, the one time format the output carries. */
export function rfc3339(ms) {
    return `${new Date(ms).toISOString().slice(0, 19)}Z`;
}
/** The `KEY=value` text `bin/fusion-campaign overview` prints on `state=ok`; that script's header defines every line. */
export function renderOverview(o, windowHours, now) {
    const out = [
        "state=ok",
        `ref=${o.ref}`,
        `head=${o.head}`,
        `head_time=${rfc3339(o.headTime)}`,
        `age_minutes=${Math.max(0, Math.floor((now - o.headTime) / 60_000))}`,
        `window_hours=${windowHours}`,
        `campaigns=${o.campaigns}`,
    ];
    for (const h of o.held)
        out.push(`held=${[h.checkout, h.alias ?? "-", h.package, h.lastPush === null ? "none" : rfc3339(h.lastPush), h.waits.length === 0 ? "none" : h.waits.join(",")].join("\t")}`);
    for (const n of o.notes)
        out.push(`note=${n.join("\t")}`);
    return out.join("\n") + "\n";
}

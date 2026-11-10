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

import { appendFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defaultBin, extractAt, fetchRef, HelperFailure, LIVE_STATES, mustGit, readCampaignsAt, run, withScratch, type CampaignAtRef, type CampaignsRead, type FetchedRef, type NoRef, type UnreadableCampaign } from "./campaign.js";
import { type Unread } from "./codec-read.js";
import { ask as askCodec, type Ask } from "./record-client.js";
import { EVENT_LOG } from "./record-change.js";
import { SETUP_MARKER } from "./record-write.js";
import { CAMPAIGN_STORE, WORKBENCH_MANIFEST } from "./stores.js";

// The read at the fetched head, `readCampaignsAt`, and what it answers live in
// `lib/campaign.ts` since the overview's full tier reads the same campaigns;
// the names stay reachable from here for the callers that learned them here.
export { LIVE_STATES, readCampaignsAt, type CampaignAtRef, type CampaignsRead, type UnreadableCampaign };

/* ------------------------------------------------------------------ *
 * The vocabulary
 * ------------------------------------------------------------------ */

/** What `sync` extracts at the fetched head: the manifest, the marker and the campaign store. */
export const SYNC_ENTRIES: readonly string[] = [WORKBENCH_MANIFEST, SETUP_MARKER, CAMPAIGN_STORE];

/** The lock tag of the settling commit. */
export const SETTLE_TAG = "campaign";

/** The settling commit's subject: the checkout and no hash, since the rebase may replace any. */
export const settleMessage = (checkout: string | null): string => `chore(events): the commit and campaign-read rows of checkout ${checkout ?? "unknown"}`;

/** Who runs the cycle, each half null where nothing resolved it. */
export interface Identity {
  person: string | null;
  checkout: string | null;
}

/** Code-unit comparison, so every order here is the same in every locale. */
const ascending = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/* ------------------------------------------------------------------ *
 * Which campaign is mine
 * ------------------------------------------------------------------ */

/** The header's `## Which campaign is mine`: the one campaign, or none with the note that says why two were not picked between. */
export function mineOf(campaigns: CampaignAtRef[], checkout: string | null): { mine: CampaignAtRef | null; note: string[] | null } {
  const live = campaigns.filter((c) => LIVE_STATES.has(c.state));
  const named = checkout === null ? [] : live.filter((c) => c.lanes !== null && c.lanes.some((lane) => lane.checkout === checkout));
  if (named.length === 1) return { mine: named[0], note: null };
  if (named.length > 1) return { mine: null, note: ["several-campaigns-name-checkout", checkout as string, named.map((c) => c.id).join(",")] };
  const unlaned = live.filter((c) => c.lanes === null);
  if (unlaned.length === 1) return { mine: unlaned[0], note: null };
  if (unlaned.length > 1) return { mine: null, note: ["several-campaigns-without-lanes", unlaned.map((c) => c.id).join(",")] };
  return { mine: null, note: null };
}

/* ------------------------------------------------------------------ *
 * The identity and the row
 * ------------------------------------------------------------------ */

/** Env-first (the SessionStart export), else one run of `bin/fusion-identity`; an unresolved half is null. */
export function identityOf(cwd: string, bin: string = defaultBin(), env: NodeJS.ProcessEnv = process.env): Identity {
  const person = env.FUSION_PERSON ?? "";
  const checkout = env.FUSION_CHECKOUT ?? "";
  if (person !== "" || checkout !== "") return { person: person === "" ? null : person, checkout: checkout === "" ? null : checkout };
  const helper = join(bin, "fusion-identity");
  if (!existsSync(helper)) return { person: null, checkout: null };
  // The helper prints each line it could resolve whatever its exit code; a line it could not produce is absent.
  const out = run(helper, [], cwd, env).stdout;
  const line = (key: string): string | null => new RegExp(`^${key}=(.*)$`, "m").exec(out)?.[1] ?? null;
  return { person: line("PERSON"), checkout: line("CHECKOUT") };
}

/** `ts` as the lock writes it: UTC at second resolution, no designator. */
export const stamp = (ms: number): string => new Date(ms).toISOString().slice(0, 19);

/** The `campaign_read` row for one campaign read: the plan's field set, an unresolved value an absent key. */
export function campaignReadRow(ts: string, identity: Identity, sessionId: string, campaign: CampaignAtRef): string {
  const row: Record<string, string> = { ts, event: "campaign_read" };
  if (identity.person !== null) row.person = identity.person;
  if (identity.checkout !== null) row.checkout = identity.checkout;
  row.session_id = sessionId;
  row.campaign = campaign.id;
  row.state = campaign.state;
  row.revision = campaign.revision;
  row.detail = `${campaign.id} ${campaign.state} ${campaign.revision.replace(/^sha256:/, "").slice(0, 12)}`;
  return JSON.stringify(row);
}

/* ------------------------------------------------------------------ *
 * The cycle
 * ------------------------------------------------------------------ */

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
  pushed: Array<{ hash: string; subject: string }>;
  /** git's stderr on a push that did not land. */
  rejection: string | null;
  notes: string[][];
}

export type SyncResult = Synced | { kind: "no-ref"; at: Extract<FetchedRef, { state: NoRef }> } | ({ kind: "failed"; head: string; rel: string } & Unread);

export interface SyncOptions {
  ask?: Ask;
  bin?: string;
  env?: NodeJS.ProcessEnv;
  now?: () => number;
}

/** A shell word, single-quoted, for the one `bash -c` the lock runs. */
const quoted = (word: string): string => `'${word.replace(/'/g, `'\\''`)}'`;

/** The tracked paths that differ from HEAD, in the index or the tree, toplevel-relative and sorted. */
function dirtyPaths(gitRoot: string): string[] {
  const names = new Set<string>();
  for (const args of [["diff", "--name-only", "-z"], ["diff", "--cached", "--name-only", "-z"]]) {
    for (const p of mustGit(gitRoot, ...args).split("\0")) if (p !== "") names.add(p);
  }
  return [...names].sort(ascending);
}

/** The env every remote operation runs under: a credential prompt is an immediate failure. */
const noPrompt = (env: NodeJS.ProcessEnv): NodeJS.ProcessEnv => ({ ...env, GIT_TERMINAL_PROMPT: "0", GIT_SSH_COMMAND: "ssh -oBatchMode=yes" });

/**
 * The whole cycle from `cwd`, inside the working tree, with `workbench` the
 * workbench directory found above it: the header's sequence. Throws
 * `HelperFailure` where git or a sibling helper failed and no state names
 * the failure.
 */
export function sync(cwd: string, workbench: string, options: SyncOptions = {}): SyncResult {
  const ask = options.ask ?? askCodec;
  const bin = options.bin ?? defaultBin();
  const env = options.env ?? process.env;
  const now = options.now ?? Date.now;

  // --- 1 the ref -------------------------------------------------------------------
  const at = fetchRef(cwd, workbench, null);
  if (at.state !== "ok") return { kind: "no-ref", at };
  const notes: string[][] = [];
  if (at.local) notes.push(["local-ref"]);

  // --- 2 the read at the fetched head, 4 the rows, 5 the settling commit ------------------
  const identity = identityOf(cwd, bin, env);
  if (identity.checkout === null) notes.push(["checkout-unreadable"]);
  const sessionId = env.FUSION_SESSION_ID ?? "";
  const log = join(workbench, EVENT_LOG);
  const logRel = `${at.rel}/${EVENT_LOG}`;

  const prepared = withScratch(cwd, (scratch): SyncResult | { read: CampaignsRead & { kind: "campaigns" }; mine: CampaignAtRef | null; settled: boolean; deferred: string[] } => {
    const read = readCampaignsAt(extractAt(at, SYNC_ENTRIES, scratch), ask);
    if (read.kind === "failed") return { ...read, head: at.head, rel: at.rel };
    const chosen = mineOf(read.campaigns, identity.checkout);
    if (chosen.note !== null) notes.push(chosen.note);

    if (sessionId !== "") {
      const ts = stamp(now());
      for (const c of read.campaigns) appendFileSync(log, `${campaignReadRow(ts, identity, sessionId, c)}\n`);
    }

    const dirty = dirtyPaths(at.gitRoot);
    if (dirty.length === 0) return { read, mine: chosen.mine, settled: false, deferred: [] };
    if (dirty.length > 1 || dirty[0] !== logRel) return { read, mine: chosen.mine, settled: false, deferred: dirty };
    const message = join(scratch, "settle-message");
    writeFileSync(message, `${settleMessage(identity.checkout)}\n`, "utf-8");
    const lock = join(bin, "fusion-commit-lock");
    const committed = run(lock, ["with", SETTLE_TAG, "--", "bash", "-c", `git add ${quoted(log)} && git commit -q -F ${quoted(message)}`], cwd, env);
    if (committed.status !== 0) throw new HelperFailure(`the settling commit did not land: ${lock} exited ${committed.status}. ${committed.stderr.trim()}`);
    return { read, mine: chosen.mine, settled: true, deferred: [] };
  }, bin);
  if ("kind" in prepared) return prepared;
  const { read, mine, settled, deferred } = prepared;
  const base = { ref: at.ref, head: at.head, campaigns: read.campaigns, unreadable: read.unreadable, mine, settled, deferred, notes };

  // --- 6 the rebase, skipped while a tracked path is deferred ----------------------------
  if (deferred.length === 0) {
    const rebased = run("git", ["rebase", "--quiet", at.ref], at.gitRoot, noPrompt(env));
    if (rebased.status !== 0) {
      const conflicts = mustGit(at.gitRoot, "diff", "--name-only", "-z", "--diff-filter=U").split("\0").filter((p) => p !== "").sort(ascending);
      const inProgress = existsSync(mustGit(at.gitRoot, "rev-parse", "--git-path", "rebase-merge").trim()) || existsSync(mustGit(at.gitRoot, "rev-parse", "--git-path", "rebase-apply").trim());
      if (inProgress) mustGit(at.gitRoot, "rebase", "--abort");
      if (!inProgress && conflicts.length === 0) throw new HelperFailure(`git rebase ${at.ref} failed (${rebased.status}) and stopped on no conflict: ${rebased.stderr.trim()}`);
      return { kind: "synced", state: "conflict", ...base, conflicts, pushed: [], rejection: null };
    }
  }

  // --- 7 the push, and the commits it landed ----------------------------------------------
  const branch = mustGit(cwd, "symbolic-ref", "-q", "--short", "HEAD").trim();
  const remote = mustGit(cwd, "config", "--get", `branch.${branch}.remote`).trim();
  const merge = mustGit(cwd, "config", "--get", `branch.${branch}.merge`).trim();
  const pushed = run("git", ["push", "--quiet", remote, `HEAD:${merge}`], at.gitRoot, noPrompt(env));
  if (pushed.status !== 0) return { kind: "synced", state: "rejected", ...base, conflicts: [], pushed: [], rejection: pushed.stderr };
  const landed = mustGit(at.gitRoot, "log", "--reverse", "--format=%H%x09%s", `${at.head}..HEAD`)
    .split("\n")
    .filter((l) => l !== "")
    .map((l) => {
      const tab = l.indexOf("\t");
      return { hash: l.slice(0, tab), subject: l.slice(tab + 1) };
    });
  return { kind: "synced", state: "ok", ...base, conflicts: [], pushed: landed, rejection: null };
}

/** The `KEY=value` text `bin/fusion-campaign sync` prints once the read has finished; that script's header defines every line. */
export function renderSync(s: Synced): string {
  const out = [`state=${s.state}`, `ref=${s.ref}`, `head=${s.head}`];
  for (const c of s.campaigns) out.push(`campaign=${[c.id, c.state, c.revision, c.reason ?? "-"].join("\t")}`);
  for (const u of s.unreadable) out.push(`campaign-unreadable=${u.id}\t${u.problem.class}/${u.problem.reason}`);
  out.push(`mine=${s.mine === null ? "none" : s.mine.id}`);
  if (s.settled) out.push("settled=yes");
  for (const p of s.deferred) out.push(`deferred=${p}`);
  for (const p of s.conflicts) out.push(`conflict=${p}`);
  for (const p of s.pushed) out.push(`pushed=${p.hash}\t${p.subject}`);
  if (s.mine !== null && s.mine.state === "paused") out.push(`paused=${s.mine.id}\t${s.mine.reason ?? "-"}`);
  for (const n of s.notes) out.push(`note=${n.join("\t")}`);
  return out.join("\n") + "\n";
}

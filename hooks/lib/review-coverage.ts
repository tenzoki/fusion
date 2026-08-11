/**
 * Review coverage — the measurement behind issue `260810-1205`.
 *
 * ## The defect this answers
 *
 * Sixteen commits landed in `18b6094..ed87d87`. Two `coderev` passes ran, both
 * thorough, and their two ranges did not tile the session's range. Seven
 * code-bearing commits — `ac68437`, `72b798e`, `df75004`, `8796ade`, `49e5b1d`,
 * `205ae06`, `ed87d87` — reached HEAD and a pushed tag with no reviewer having
 * opened them, and the session's own report said *one* commit was unreviewed,
 * because it measured the gap against the last Turn instead of against the
 * range.
 *
 * Two details make it a mechanism problem rather than an oversight:
 *
 *   1. **Turn 2's omission was declared, not missed.** The `0939` pass states
 *      in its own header that `agents/orchestrator.md`, `skills/next/SKILL.md`
 *      and `skills/circle-stash/SKILL.md` "were not opened" because concurrent
 *      tasks held them — exactly the files two of the unreviewed commits
 *      changed. The reviewer reported the boundary of its scope correctly.
 *      Nothing downstream read that sentence and re-queued the files.
 *   2. **The data was on disk and nothing read it.** The review files carry
 *      their ranges. No artifact holds "commits reviewed" against "commits
 *      landed", so nothing could tile one against the other.
 *
 * ## Why the ranges had to be mandated before they could be read
 *
 * They were on disk in a form no program could trust. Ten `coderev` files in
 * `shared/reviews/` at the time of writing carried four different spellings —
 * `**Range:**`, `**Scope:**`, `**Scope reviewed:**`, `**Scope as dispatched:**`
 * — several carried no range at all, and of the filenames that did, some read
 * `range-18b6094-to-a7c2b03`, one read `range-5ef92eb-940d522` with no `to`,
 * and two ended in `-to-head`, which names a different commit every day it is
 * read. A computation over a format nobody mandated returns nothing and calls
 * it coverage.
 *
 * So `agents/coderev.md` and `agents/ontorev.md` now mandate two header fields,
 * and this module reads exactly those and nothing else:
 *
 *     **Reviewed-range:** `<from>..<to>`
 *     **Not-opened:** none
 *
 * Both endpoints must be resolved hashes. `HEAD`, a branch name and a tag are
 * all refused with a named reason rather than resolved, because they resolve to
 * whatever they mean at read time, not at review time — the `-to-head`
 * filenames are the worked case.
 *
 * A file with no `**Reviewed-range:**` line is reported **unusable, by name,
 * with the reason** — never dropped, and never guessed at from its filename.
 * That is the `**Active Circle:**` lesson (`agents/orchestrator.md`
 * `### The queue's ground`): when the producer did not record the fact, it is
 * not recoverable from the text, and the mechanism changes rather than the
 * approximation (`rules/critical-stance.md` §4).
 *
 * ## What it computes
 *
 * Coverage is a set difference over commits, not interval arithmetic over
 * hashes: every review's `from..to` is expanded with `git rev-list`, the union
 * is the covered set, and the session's own `git rev-list <since>..<head>` less
 * that union is the uncovered set — **named commit by commit**, which is the
 * acceptance criterion. Expanding through git rather than comparing endpoints
 * is what makes it correct across merges, out-of-order passes and ranges that
 * overlap.
 *
 * ## What it does NOT do, and why
 *
 * It never writes a review file, `agentstate.yaml`, a Circle record or a
 * history file, and it adds no `reviewed_through` field to the session state.
 * That last one is deliberate and is the point: `agentstate.yaml` is a surface
 * a session can pass a boundary without writing, and issue `260801-2038`
 * measured six sessions in which exactly that happened. A reviewed-through
 * marker kept there would be a fifth freezable surface answering a question the
 * review files already answer unfreezably — writing the review file *is* the
 * review, the way a commit is the work rather than a note about it.
 *
 * It is also not a release gate. Whether a release may go out over an
 * uncovered range is a decision and is not filed; it belongs beside
 * `shared/decisions/260810-0710_o_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`.
 * This module reports; nothing here blocks anything.
 *
 * ## Its callers, and the one it deliberately is not on
 *
 *   1. `hooks/review-coverage.ts` → `bin/fusion-review-coverage` — the CLI,
 *      read by `agents/orchestrator.md` at Step 3c (the dispatch scope) and at
 *      Phase 4 (the session summary).
 *   2. `hooks/tracker.ts` — the PostToolUse hook, on the narrow trigger of a
 *      **review file landing under a reviews store**. That is the moment the
 *      answer is actionable, because the next dispatch's scope is being decided
 *      right then, and it is what makes the carried out-of-scope list an
 *      obligation that arrives rather than a footnote in a file nobody reopens.
 *
 * It is **not** on the tracker's every-tool-call path, where the state-drift
 * measurement sits, and the difference is not an oversight. A stale
 * `agentstate.yaml` is a fault at every moment after the commit that outdated
 * it. An uncovered range mid-Turn is the *normal and correct* state — review
 * runs at Step 3c, after the Turn's tasks — so a per-call report would fire on
 * the commonest path, and a check that cries wolf on its commonest path teaches
 * its reader to ignore it. That is issue `260810-0710` arriving one level up,
 * and `agents/orchestrator.md` `### Drift check` records it as the reason the
 * drift check's verdict is a line of output rather than an exit code.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/* ------------------------------------------------------------------ *
 * Layout — root-anchored, exactly as `lib/state-drift.ts` reads it
 * ------------------------------------------------------------------ */

/**
 * The root-anchored surfaces, named literally, for the reason
 * `lib/state-drift.ts` gives at the same place: `rules/fusion-workbench-conventions.md`
 * `## fusion-workbench Layout` puts these at fixed root-relative paths precisely
 * because the hooks and the `bin/` helpers read them there and none of them has
 * a fallback. `reviews` is the constant `bin/fusion-paths` resolves
 * `SCAN_REVIEWS` to under both bases; the Circle *inside* `circles/` is not
 * constant, which is why every Circle is enumerated rather than looked up
 * through `.active-circle` — a review filed before the active Circle existed
 * still covers commits this session landed.
 */
const WB = "fusion-workbench";
const STATE_REL = `${WB}/agentstate.yaml`;
const SHARED_REVIEWS_REL = `${WB}/shared/reviews`;
const CIRCLES_REL = `${WB}/circles`;
const COVERAGE_THROTTLE_REL = `${WB}/.guard-state/review-coverage.json`;

/** Enough for a local `git rev-list` on any repository this will meet. */
const GIT_TIMEOUT_MS = 5_000;

/**
 * The mandated header fields. One spelling each, and these two constants are
 * what `review-coverage-mandate.test.ts` asserts the two reviewer prompts still
 * carry — so a prompt that renames a field fails `npm test` rather than
 * silently producing files this parser reports as unusable.
 */
export const RANGE_FIELD = "**Reviewed-range:**";
export const NOT_OPENED_FIELD = "**Not-opened:**";

/** A hash endpoint, as the mandate requires it: resolved, 7–40 hex digits. */
const HASH = /^[0-9a-f]{7,40}$/;

/* ------------------------------------------------------------------ *
 * The report shape
 * ------------------------------------------------------------------ */

export interface Commit {
  /** Full hash — the identity the covered-set difference is taken over. */
  full: string;
  /** Short hash, as git abbreviates it. What a human reads. */
  short: string;
  subject: string;
}

export interface ReviewRow {
  /** Workbench-relative path of the review file. */
  path: string;
  /** `<from>..<to>` as recorded, or "" when the field is absent or refused. */
  range: string;
  /** Files the reviewer declared it did not open. Empty for a recorded `none`. */
  notOpened: string[];
  /** False when the file carries no `**Not-opened:**` line at all. */
  notOpenedRecorded: boolean;
  /** How many of the measured window's commits this review covers. */
  covers: number;
  /** Why the range could not be used. "" when it was used. */
  why: string;
}

export interface CoverageReport {
  root: string;
  /** The session anchor the window starts after. "" when it could not be found. */
  since: string;
  /** The window's end. "" when it could not be resolved. */
  head: string;
  /**
   * Why no coverage could be computed. Non-empty means every other field is
   * empty and the verdict is `unchecked` — the window itself was undecidable,
   * which is a different thing from a window with nothing in it.
   */
  why: string;
  /** The window's commits, newest first. */
  commits: Commit[];
  /** The window's commits no review's range contains. Newest first. */
  uncovered: Commit[];
  /** Reviews considered, newest first by mtime. Unusable ones included. */
  reviews: ReviewRow[];
  /** The newest usable review's declared out-of-scope files. */
  carried: string[];
  /** Which review `carried` came from, workbench-relative. Null when none did. */
  carriedFrom: string | null;
  /**
   * A stable identity for the current gap, empty when there is none.
   *
   * Carries the uncovered commits and the carried file list, so a gap that
   * GROWS reads as a new signature and speaks again, while one that merely
   * persists across the next review file is reported once. Same contract as
   * `lib/state-drift.ts`'s signature, and the throttle beside it is the same.
   */
  signature: string;
}

/* ------------------------------------------------------------------ *
 * Reading the review files
 * ------------------------------------------------------------------ */

/** First value for a `**Field:**` line, trimmed. Null when the line is absent. */
function headerField(text: string, field: string): string | null {
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t.startsWith(field)) return t.slice(field.length).trim();
  }
  return null;
}

/** Every backticked token in a string, in order, backticks stripped. */
function backticked(value: string): string[] {
  const out: string[] = [];
  const re = /`([^`]+)`/g;
  let hit: RegExpExecArray | null;
  while ((hit = re.exec(value)) !== null) out.push(hit[1].trim());
  return out;
}

/**
 * The mandated range, or the reason it cannot be used.
 *
 * Refusing `HEAD` and every other name is the whole point rather than
 * strictness for its own sake: two of the ten review files this was written
 * against are named `…-to-head`, and `HEAD` names a different commit every day
 * the file is read. A range that cannot be pinned to the commits it actually
 * covered is not a range, and reporting it as one would return coverage the
 * reviewer never gave.
 */
export function parseRange(value: string | null): { from: string; to: string; why: string } {
  if (value === null) {
    return { from: "", to: "", why: `no ${RANGE_FIELD} line` };
  }
  const token = backticked(value)[0] ?? value.split(/\s/)[0] ?? "";
  const parts = token.split("..");
  if (parts.length !== 2) {
    return { from: "", to: "", why: `${JSON.stringify(token)} is not <from>..<to>` };
  }
  const [from, to] = parts;
  if (!HASH.test(from) || !HASH.test(to)) {
    return {
      from: "",
      to: "",
      why: `${JSON.stringify(token)} is not two resolved hashes — a name resolves to a different commit at read time than at review time`,
    };
  }
  return { from, to, why: "" };
}

/**
 * The declared out-of-scope files, and whether the field was there at all.
 *
 * A recorded `none` and an absent line are different facts and are kept apart,
 * for the reason `**Active Circle:** none` is mandated on every taskplanner run:
 * a recorded absence can be compared, a missing line can only be guessed at.
 */
export function parseNotOpened(value: string | null): { files: string[]; recorded: boolean } {
  if (value === null) return { files: [], recorded: false };
  if (/^none\b/i.test(value.trim())) return { files: [], recorded: true };
  const ticked = backticked(value);
  if (ticked.length > 0) return { files: ticked, recorded: true };
  // A line that is present but neither `none` nor backticked paths: take the
  // comma-separated words rather than dropping the reviewer's statement.
  const words = value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");
  return { files: words, recorded: words.length > 0 };
}

/** Every review file under every reviews store, absolute, with its mtime. */
function reviewFiles(root: string): { abs: string; rel: string; mtime: number }[] {
  const dirs: string[] = [SHARED_REVIEWS_REL];
  try {
    for (const e of readdirSync(resolve(root, CIRCLES_REL), { withFileTypes: true })) {
      if (e.isDirectory()) dirs.push(`${CIRCLES_REL}/${e.name}/reviews`);
    }
  } catch {
    // No `circles/` at all is the ordinary state of a project that has never
    // opened one. The shared store still answers.
  }

  const out: { abs: string; rel: string; mtime: number }[] = [];
  for (const dir of dirs) {
    const abs = resolve(root, dir);
    let entries: string[];
    try {
      entries = readdirSync(abs);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (!name.endsWith(".md")) continue;
      const file = resolve(abs, name);
      try {
        out.push({ abs: file, rel: `${dir}/${name}`.slice(WB.length + 1), mtime: statSync(file).mtimeMs });
      } catch {
        /* vanished between readdir and stat — nothing to report about it */
      }
    }
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Reading git
 * ------------------------------------------------------------------ */

function git(root: string, args: string[]): string | null {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT_MS,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

/** The window's commits, newest first. Null when the range does not resolve. */
function windowCommits(root: string, since: string, head: string): Commit[] | null {
  const out = git(root, ["log", "--format=%H%x00%h%x00%s", `${since}..${head}`]);
  if (out === null) return null;
  const commits: Commit[] = [];
  for (const line of out.split("\n")) {
    if (line.trim() === "") continue;
    const [full, short, ...rest] = line.split("\0");
    if (full === undefined || short === undefined) continue;
    commits.push({ full, short, subject: rest.join("\0") });
  }
  return commits;
}

/** Full hashes in `from..to`. Null when either endpoint does not resolve here. */
function expand(root: string, from: string, to: string): Set<string> | null {
  const out = git(root, ["rev-list", `${from}..${to}`]);
  if (out === null) return null;
  return new Set(out.split("\n").map((l) => l.trim()).filter((l) => l !== ""));
}

/** The session anchor `agentstate.yaml` records, or "" with nothing recorded. */
export function sessionAnchor(root: string): { since: string; why: string } {
  const path = resolve(root, STATE_REL);
  if (!existsSync(path)) {
    return { since: "", why: `${STATE_REL} is absent — no session in progress to measure a range for` };
  }
  let text: string;
  try {
    text = readFileSync(path, "utf-8");
  } catch {
    return { since: "", why: `${STATE_REL} is unreadable` };
  }
  const hit = /^[ \t]*git_head_at_start:[ \t]*(.*)$/m.exec(text);
  const value = (hit?.[1] ?? "").trim().replace(/^["']/, "").replace(/["']$/, "").trim();
  if (value === "") return { since: "", why: "session.git_head_at_start is unset" };
  return { since: value, why: "" };
}

/* ------------------------------------------------------------------ *
 * The measurement
 * ------------------------------------------------------------------ */

const EMPTY = (root: string, why: string): CoverageReport => ({
  root,
  since: "",
  head: "",
  why,
  commits: [],
  uncovered: [],
  reviews: [],
  carried: [],
  carriedFrom: null,
  signature: "",
});

/**
 * Tile the review files' declared ranges against a commit range.
 *
 * `since` defaults to `agentstate.yaml`'s `session.git_head_at_start` — the
 * session's own anchor, already recorded for the drift check and for Step 3c's
 * `git diff`, so this needs no field of its own. `head` defaults to `HEAD`.
 *
 * Reviews are bounded to those modified at or after the anchor commit's own
 * commit date, because a review file cannot name a hash that did not exist when
 * it was written. Both ways that bound can be wrong are safe: a checkout that
 * pushes mtimes forward can only pull MORE reviews in, and an extra review
 * whose range lies outside the window expands nothing; a review wrongly
 * excluded shows its commits as uncovered, which is loud rather than quiet.
 */
export function measureReviewCoverage(
  root: string,
  opts: { since?: string; head?: string } = {},
): CoverageReport {
  const head = opts.head ?? "HEAD";

  let since = opts.since ?? "";
  if (since === "") {
    const anchor = sessionAnchor(root);
    if (anchor.since === "") return EMPTY(root, anchor.why);
    since = anchor.since;
  }

  const commits = windowCommits(root, since, head);
  if (commits === null) {
    return EMPTY(root, `git could not list ${since}..${head}`);
  }

  // The bound on which review files are considered. A failure to read the
  // anchor's date is not a reason to drop the measurement — it widens the bound
  // to everything, which over-includes rather than under-reports.
  const anchorDate = git(root, ["show", "-s", "--format=%ct", since]);
  const floorMs = anchorDate === null ? 0 : Number.parseInt(anchorDate.trim(), 10) * 1000;
  const floor = Number.isFinite(floorMs) ? floorMs : 0;

  const inWindow = new Set(commits.map((c) => c.full));
  const covered = new Set<string>();
  const reviews: ReviewRow[] = [];

  const files = reviewFiles(root)
    .filter((f) => f.mtime >= floor)
    .sort((a, b) => b.mtime - a.mtime);

  for (const f of files) {
    let text: string;
    try {
      text = readFileSync(f.abs, "utf-8");
    } catch {
      reviews.push({ path: f.rel, range: "", notOpened: [], notOpenedRecorded: false, covers: 0, why: "unreadable" });
      continue;
    }

    const { files: notOpened, recorded } = parseNotOpened(headerField(text, NOT_OPENED_FIELD));
    const { from, to, why } = parseRange(headerField(text, RANGE_FIELD));
    if (why !== "") {
      reviews.push({ path: f.rel, range: "", notOpened, notOpenedRecorded: recorded, covers: 0, why });
      continue;
    }

    const set = expand(root, from, to);
    if (set === null) {
      reviews.push({
        path: f.rel,
        range: `${from}..${to}`,
        notOpened,
        notOpenedRecorded: recorded,
        covers: 0,
        why: `git could not list ${from}..${to} — a hash that no longer resolves here`,
      });
      continue;
    }

    let covers = 0;
    for (const h of set) {
      if (inWindow.has(h)) {
        covered.add(h);
        covers++;
      }
    }
    reviews.push({ path: f.rel, range: `${from}..${to}`, notOpened, notOpenedRecorded: recorded, covers, why: "" });
  }

  const uncovered = commits.filter((c) => !covered.has(c.full));

  // The obligation, from the newest review that could be used at all. A file
  // whose range was refused still declared what it did not open, and that
  // statement is what the next dispatch owes; only an unreadable file has
  // nothing to carry.
  const source = reviews.find((r) => r.why !== "unreadable" && r.notOpenedRecorded) ?? null;
  const carried = source?.notOpened ?? [];
  const carriedFrom = source === null ? null : source.path;

  const signature =
    uncovered.length === 0 && carried.length === 0
      ? ""
      : `uncovered=${uncovered.map((c) => c.short).join(",")}|carried=${carried.join(",")}`;

  return { root, since, head, why: "", commits, uncovered, reviews, carried, carriedFrom, signature };
}

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

/** One uncovered commit, named. The acceptance criterion is "not a count". */
export function renderUncovered(c: Commit): string {
  return `  uncovered ${c.short} ${c.subject}`;
}

/** One review row, with its range and what it declared it did not open. */
export function renderReview(r: ReviewRow): string {
  const range = r.range === "" ? "(none recorded)" : r.range;
  const not = r.notOpenedRecorded
    ? r.notOpened.length === 0
      ? "none"
      : r.notOpened.join(", ")
    : "(not recorded)";
  const tag = r.why === "" ? `covers=${r.covers}` : `UNUSABLE (${r.why})`;
  return `  review ${r.path} range=${range} not-opened=${not} ${tag}`;
}

/**
 * The sentence handed back to the model when a review file lands over a range
 * that is not yet tiled, or over a predecessor that declared exclusions.
 *
 * It names the commits rather than counting them, because counting them is the
 * defect: the session that produced issue `260810-1205` reported one unreviewed
 * commit where there were seven.
 */
export function coverageSentence(report: CoverageReport): string {
  const parts: string[] = [];

  if (report.uncovered.length > 0) {
    parts.push(
      `fusion: a review landed and ${report.uncovered.length} commit(s) in ${report.since}..${report.head} are still covered by no review's declared range — ` +
        report.uncovered.map((c) => `${c.short} (${c.subject})`).join("; ") +
        ".",
    );
  }

  if (report.carried.length > 0) {
    parts.push(
      `The last review declared it did not open ${report.carried.join(", ")}` +
        (report.carriedFrom === null ? "" : ` (${report.carriedFrom})`) +
        ". That list is the next review dispatch's scope, added to its own Turn's changed files — not a footnote.",
    );
  }

  if (parts.length === 0) return "";

  parts.push(
    "This is issue 260810-1205: two passes ran, their ranges did not tile the session's range, and seven commits reached a pushed tag unread while the report said one. " +
      "If you are the orchestrator, widen the next dispatch's scope and name the gap commit by commit in the session summary — `bin/fusion-review-coverage` prints both. " +
      "If you are a sub-agent, carry this line into your report; the dispatch scope is the orchestrator's to set.",
  );

  return parts.join(" ");
}

/* ------------------------------------------------------------------ *
 * The throttle
 * ------------------------------------------------------------------ */

/**
 * The signature last reported to the model, or "" when none was.
 *
 * Same contract, same reason, and deliberately the same shape as
 * `lib/state-drift.ts`'s pair: without it the hook would repeat itself for as
 * long as the gap stands, and a message that arrives every time is one an agent
 * learns to read past — which is the failure this whole mechanism exists to
 * catch, arriving one level up.
 */
export function lastReportedCoverage(root: string): string {
  try {
    const raw = readFileSync(resolve(root, COVERAGE_THROTTLE_REL), "utf-8");
    const parsed = JSON.parse(raw) as { reported?: unknown };
    return typeof parsed.reported === "string" ? parsed.reported : "";
  } catch {
    return "";
  }
}

/** Record the signature just reported. `""` clears it, so a later gap speaks again. */
export function recordReportedCoverage(root: string, signature: string): void {
  const dir = resolve(root, `${WB}/.guard-state`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(root, COVERAGE_THROTTLE_REL),
    JSON.stringify({ reported: signature }) + "\n",
    "utf-8",
  );
}

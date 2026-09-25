# Closure review — the message store, its reader, its writer, and the merged-in dispatch bound

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `abcaa823..07ca022d`
**Not-opened:** `260907-1657-c5-cost-argument-check.md`, `260907-2012-break-even-arithmetic-for-the-dispatch-split.md`, `260907-0820_*_spec-bounded-executor-dispatches.md`, `fusion-workbench/orchestrator-events.jsonl`, `hooks/dist/lib/config.js`, `hooks/dist/turn-budget.js`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, and the session histories, reviews and decision records under both Circles

## Summary

The message store, `bin/fusion-forum`, `skills/news/SKILL.md`, the two resolver keys and the archive bucket are a coherent design and the helper is unusually well argued: every rejected alternative is written down beside the one taken. Nine tests drive the real script against scratch repositories with no network. Nothing here is a release blocker.

What the pass found is one class of defect repeated: **the mechanism decides a narrower question than the feature asks, and the residue falls silently into the success branch.** Five of the seven findings are instances. Seven issues filed, none Critical.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 5 |
| Low | 1 |

Enumerated: the High is F1; the Medium are F2, F3, F4, F5, F7; the Low is F6.

## Findings by theme

### Theme A — a real answer and an unanswerable question share one value

**F1 (High) — an untracked workbench answers `new=0` forever.**
`bin/fusion-forum:319-324` takes the delta from two `git ls-tree` listings. In a project whose `fusion-workbench/` is untracked, the store is in no tree, both listings are empty, and the answer is `state=ok new=0` on exit 0, permanently. Measured against a scratch fixture with `fusion-workbench/` in `.gitignore`: `new=0` with an entry sitting in the author's store; the same fixture tracked returns `new=2`. Whether a project tracks its workbench is that project's decision and fusion ships no rule for it (`rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks`), so the untracked configuration is supported and the whole feature is inert and silent in it. The state vocabulary at `bin/fusion-forum:99-114` presents itself as total; this case falls through into `ok`.
Filed: `260908-0848_*_an-untracked-workbench-answers-new-equals-zero-forever-and-no-state-names-it.md`.

**F2 (Medium) — the mark helper is guarded in `new` and unguarded in `seen`, and both branches are wrong.**
`bin/fusion-forum:304` wraps `bin/fusion-cadence-anchor` in `[ -x ]` and, on the miss, prints `mark=none` with no `note=` — the whole store re-reads as new, indistinguishable from a genuine first run. `bin/fusion-forum:358` calls the same helper bare and exits **1**, a code the file's own table reserves for `show` while stating that "`new` and `seen` never produce it" (`bin/fusion-forum:76-77`). Measured with a three-file stub directory: `rc=1` on `seen`, `0` notes on `new`.
Filed: `260908-0848_*_the-mark-helper-is-guarded-in-new-and-unguarded-in-seen-and-both-branches-are-wrong.md`.

**F3 (Medium) — every path under the store is rendered as a message.**
`bin/fusion-forum:332` filters entries carrying **this** checkout's hex and admits everything else, including files matching no part of the mandated `YYMMDD-HHMM-<checkout>-<slug>.md` shape and (via `ls-tree -r`) anything in a subdirectory. `skills/news/SKILL.md:94` then derives the writer with `cut -d- -f3` and hands the result to `bin/fusion-checkout-name resolve`, which exits **2** with its entire usage block on stderr — not the exit 3 the body anticipates at `skills/news/SKILL.md:100`. Measured: a store holding `README.md` beside two conforming entries lists `README.md` as an `entry=`.
The cut is the point. The helper already holds the pattern that decides "is this a message" and uses it only to exclude.
Filed: `260908-0849_*_the-store-listing-admits-every-path-and-the-reader-parses-a-hex-out-of-whatever-it-gets.md`.

### Theme B — a bound stated in prose over an act the prose does not reach

**F4 (Medium) — the twenty-line cap counts a draft that is never the file written.**
`skills/cleanup/SKILL.md:200` says to count with `wc -l` "**before** you put it", and the file is written only "**On yes**" (`skills/cleanup/SKILL.md:208`), after the gate. Nothing exists to count at that point; the draft is *printed* (`skills/cleanup/SKILL.md:206`) and the write is a separate generation with nothing binding the two. `wc -l` also under-counts a file whose last line lacks a newline. The message half is the only step in this skill carrying no executable block.
Secondary: "Twenty lines in the file" reads as an exact count while "≤ 8 … ≤ 9 … over the cap, cut and recount" reads as a ceiling; 1+1+8+1+9 sums to twenty only at both maxima. The one entry written so far (`260907-2354-1d05b0e4-read-before-pull.md`) is exactly twenty lines, which shows the shape is writable, not that it is bounded.
Filed: `260908-0849_*_the-twenty-line-cap-counts-a-draft-that-is-never-the-file-that-gets-written.md`.

**F5 (Medium) — two selector names over one step, coupled in one direction only.**
`skills/cleanup/SKILL.md:54-55` lists `claude-md` and `forum` as separate entries in "the selector's whole vocabulary"; `skills/cleanup/SKILL.md:210` then couples them, `--skip claude-md` dropping the message too. Of the five reachable combinations, two — `--skip forum` and `--only claude-md` — have no stated behaviour. The mechanism reason for the coupling is real (no gate call means no second question) and belongs in the table rather than mid-step.
Filed: `260908-0850_*_two-selector-names-share-one-step-and-the-coupling-runs-in-only-one-direction.md`.

**F6 (Low) — the read mark advances over entries that failed to render.**
`skills/news/SKILL.md` Step 5 runs `seen "$HEAD"` unconditionally and Step 4 carries no branch for `show` exiting 1. The marking-on-render cost is stated twice and deliberately (`skills/news/SKILL.md:14`, `skills/news/SKILL.md:110`), but that argument rests on the message having been shown. `hooks/lib/__tests__/fusion-forum.test.ts:218` covers the helper's exit 1; nothing covers the reader's response.
Filed: `260908-0850_*_the-read-mark-advances-over-entries-that-failed-to-render.md`.

### Theme C — a leaf landed and its enumerations did not move

**F7 (Medium) — three surfaces enumerate the configuration leaves as two.**
`orchestrator.dispatchMinutes` became a project-settable leaf in `e1e625ae` (`hooks/lib/config.ts:187`, `:251`, `:429`, `:629`) and `bin/fusion-turn-budget` gained a second output line in `7e7708cf`. Eleven `maxTurns` sites in shipped text state or imply a two-leaf set; eight are named by a `**Files:**` entry of `260907-1450_*_plan-bounded-executor-dispatches.md` (Steps 6, 9, 14, 16). Three are not: `skills/help/SKILL.md:117`, `docs/working-model.md:125`, `docs/fusion-intro.md:73` — the last of which was already false before the leaf, since `citations.extraPaths` landed 260831. Filed **shared**, because it belongs to neither Directive and is deliberately not a re-scoping of that plan.
Filed: `260908-0851_*_three-surfaces-enumerate-the-configuration-leaves-and-no-plan-step-names-any-of-them.md`.

## Cross-cutting observations

**The design rule this Circle states best is the one it breaks in three places.** "A degradation that changed the answer, stated rather than hidden" (`bin/fusion-forum:54`) is the helper's own norm, and F1, F2 and F3 are each a degradation that changed the answer and said nothing. In every case the guard that would report is present in some other branch of the same file: F2's `[ -x ]` guards but does not report, F3's regex recognises the shape but only to exclude.

**The four things the dispatch asked to be checked, answered.**

1. **Quoting, word-splitting, glob expansion, zsh-versus-bash.** Clean. Every expansion carrying caller data is quoted; `${wbphys#"$gitroot"/}` quotes its pattern; `LC_ALL=C` is set on every sort, `comm` and `grep` that decides an answer. The shebang is `#!/usr/bin/env bash`, so a zsh session's `nomatch` never reaches it, and no unquoted glob is expanded by the script at all. One residual, unreachable today: `valid_store` (`bin/fusion-forum:226-232`) rejects an absolute path and a `..` segment but not a git-pathspec metacharacter, so a store containing `*` or a leading `:` silently matches nothing. The value comes from `bin/fusion-paths` and is `shared/forum`, so this is noted and not filed. I also checked the `set -e` interaction in the `entry=` loop (`bin/fusion-forum:344-346`) empirically — an empty line does not abort the loop.
2. **The self-filter on a filename that does not match.** It keeps it, which is the safe direction and correct; what is wrong is downstream, F3.
3. **The twenty-line cap.** F4.
4. **No path literal, and the resolver as the single resolution point.** Verified and clean. `grep -n 'shared/forum' bin/fusion-forum` is empty; the store reaches the helper only as `$SCAN_FORUM` (`skills/news/SKILL.md:62`) and is written only through `$WORKBENCH/$OUT_FORUM` (`skills/cleanup/SKILL.md:208`); `bin/fusion-paths:347,360` is the sole definition site, and the header's claim at `bin/fusion-forum:19-20` that no `DEFINITION_SITES` entry is owed holds. `bin/fusion-paths news`, `cleanup` and `archive` each emit exactly the forum keys their own prompt names.

**What is good, and worth not losing in a fix.** The `comm -13` over two tree listings instead of `git diff --diff-filter=A` (`bin/fusion-forum:121-129`) is the right call for exactly the reason given: the archive step moving aged entries is the rename the diff would mis-attribute. Pinning `show` to the `head=` the delta was computed against removes a race a caller could not otherwise avoid. `hooks/lib/__tests__/fusion-forum.test.ts` resolves every fixture path with `realpathSync` for a stated reason and makes no network call. The header's *Why this asks git and not `changed-files`* passage is a worked application of `rules/critical-stance.md` §4 — the mechanism changed rather than the arguments.

## Recommended sequencing

Release blockers: none.

1. **F1** first. It is the only finding that makes the feature silently do nothing in a supported configuration, and F2's missing note is the same repair one level down — fix them together, since both add to the same `note=`/`state=` vocabulary.
2. **F3** next: it is one regex moved from the exclude side to the admit side, plus one line in `skills/news/SKILL.md` Step 4, and it removes a helper usage block from the user's screen.
3. **F4 and F5** are text repairs in `skills/cleanup/SKILL.md` and can travel in one commit.
4. **F6** is a sentence.
5. **F7** is not this Circle's to sequence; it waits on the bounded-dispatch Circle reaching its documentation steps, and covers only what those steps do not name.

## What this pass did not do

`bin/fusion-review-coverage --since abcaa823` reported `reviews=0 uncovered=24` before this file existed, with no carried `**Not-opened:**` from a previous pass. This pass opened every code-bearing file in the range — `bin/fusion-forum`, `bin/fusion-paths`, `bin/fusion-cadence-anchor`, `bin/fusion-turn-budget`, `hooks/lib/config.ts`, `hooks/turn-budget.ts`, `hooks/lib/__tests__/fusion-forum.test.ts`, the four skill bodies, `agents/playmaker.md`, `rules/circle-records.md`, `rules/workbench-path-resolution.md`, `rules/fusion-workbench-conventions.md`, `CLAUDE.md`, `README-agents.md`, `.gitignore` — and the plan of the merged-in Circle. The header's `**Not-opened:**` list is what it did not: the two long analyses behind the dispatch bound, the bounded-dispatch specification, the compiled `hooks/dist/` artifacts, the two regenerated goldens, the event log, and the record files under both Circles.

**One claim I am not making:** I did not re-run `cd hooks && npm test`. The dispatch states the suite is green at `07ca022d` at 924 of 924; nothing in this pass contradicts that, and nothing in it verifies it either.

The known-and-filed items named in the dispatch were treated as filed and are not re-reported: `260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`, `260905-2134_*_review-coverage-test-fails-in-a-full-suite-run-and-passes-in-isolation.md`, `260908-0845_*_two-roles-are-over-the-reporting-budget-on-circle-records-after-the-merge.md`, `260908-0104_*_a-doc-comment-cites-two-re-baselining-events-while-the-helper-defines-three.md`, `260907-2332_*_two-descriptions-of-the-cleanup-run-order-reverse-the-last-two-steps.md`.

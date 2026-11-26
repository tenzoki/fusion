# Closing review of 13.6.0: campaign peers follow the steering session

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `f3ba1ff1..7fd90fa2`
**Not-opened:** `hooks/dist/campaign.d.ts`, `hooks/dist/campaign.js`, `hooks/dist/lib/campaign-sync.d.ts`, `hooks/dist/lib/campaign-sync.js`, `hooks/dist/lib/campaign-watch.d.ts`, `hooks/dist/lib/campaign-watch.js`, `hooks/dist/lib/campaign-write.d.ts`, `hooks/dist/lib/campaign-write.js`, `hooks/dist/lib/campaign.d.ts`, `hooks/dist/lib/campaign.js`, `hooks/dist/lib/stores.d.ts`, `hooks/dist/lib/stores.js`, `hooks/lib/stores.ts`, `hooks/lib/__tests__/campaign-overview.test.ts`, `hooks/lib/__tests__/campaign-sync.test.ts`, `hooks/lib/__tests__/campaign-write.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/surface-growth-bound.test.ts`
**Domain:** code
**Work package:** `261119-0905-campaign-peers-follow-the-steering-session-and-report-back`
**Release:** tag `v13.6.0` at `1a538959`; the three commits after it touch `fusion-workbench/` only.

## Summary

The helper side of the report-mode watch holds up: the last head stays on a failed delta, the outage memory works at the shipped 300 s interval, and both probes and the delta's fetch have a bound. Four Medium defects are left, all at the edges the trial never reached. The steering commit route reports an answer as delivered without reading whether `sync` pushed it. Step 5 still points at "the two sentences" Step 6 no longer has. A watch that exits with none of its rows stops silently. And the commit route drops two of the orchestrator's guards. None of the four blocks a release, since the release has shipped. All four should be fixed before the next campaign is run in earnest.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 4 |
| Low | 5 |

Plus one existing issue seen again (help paragraphs), recorded with an `Also seen:` line and not refiled.

## How this pass was made

- Read in full: `hooks/lib/campaign-watch.ts`, `hooks/campaign.ts`, the range's diff of `bin/fusion-campaign`, `docs/campaign.md`, `docs/upgrading-to-v13.md`, `README-hooks.md`, `README-agents.md`, `README.md`, `CLAUDE.md`, `install.sh`, `.claude-plugin/plugin.json`, every changed catalog part with the rendered `agents/orchestrator.md`, `skills/campaign/SKILL.md` and `skills/help/SKILL.md`. Also the added half of `hooks/lib/campaign-write.ts`.
- Read in part: `hooks/lib/campaign.ts` (`run`, `fetchRef`, `extractAt`, the answer rule, `steeringAt`, `steeringSince`, `withSince`, `renderOverview`), `hooks/lib/campaign-sync.ts` (the sequence and its states), `hooks/lib/__tests__/campaign-watch.test.ts` (the timeout case).
- `hooks/dist/`: compiled the sources with `npx tsc --outDir` into scratch and compared with `cmp`. All twelve changed dist files are byte-identical to the compile.
- Ran `npx vitest run` on `campaign-watch`, `campaign-write`, `campaign-sync`, `campaign-overview`: 4 files, 33 tests, all pass. The full suite was not run.
- Intent: spec `261119-1102-*`, plan `261119-1248-*`, amendment `261123-1000-*`, analyses `261121-1826-*`, `261124-2015-*`, `261126-0814-*`, and the package's eight earlier issues, all closed `fixed`.

## Findings by theme

### A. The steering commit route (skill Steps 5, 6, 8)

**A1. Medium: no `sync` result is read, and an unpushed answer is reported as delivered.** Step 6 ends the route with "then `sync`, which pushes" (`skills/campaign/SKILL.md:137`). Step 8 then says "say the peer reads it within about 5 minutes if its session is open" (`:156`). `sync` can end without a push: `state=rejected` (`hooks/lib/campaign-sync.ts:324-325`), `state=conflict` (`:316`), `fetch-failed`, or `deferred=` rows with the rebase skipped while another tracked path is dirty (`:295`, `:309`). In the deferred case the fast-forward push to a remote that peers moved is rejected. The orchestrator's 5a handles every one of these; the skill handles none. Spec C3 criterion 3 asks for a report that says so. `docs/campaign.md` repeats the unconditional sentence. Fix: read `state=` and `pushed=` as 5a does, and give the five-minute sentence only on a landed push. Issue `261126-2111-the-steering-commit-route-reads-no-sync-result-and-reports-an-unpushed-answer-as-delivered.md`.

**A2. Medium: Step 5 ends with "the two sentences" Step 6 no longer has.** `skills/campaign/SKILL.md:120` (part `06-claude.md:25`, unchanged in the range) reads "End with the two sentences Step 6 ends every steering report with." Step 6 now ends with one sentence and puts its commit route before the report (`:137`). This is the class of defect the trial found twice: a sentence a session can read two ways. Reading one: say the sentence and commit nothing, so the lanes and the `set-mode` writes stay in the working tree, and the user is no longer told that they travel only with a commit. Reading two: run Step 6's route. `skills/help/SKILL.md:89` says every steering act is committed in its turn. The plan's variant (a) named `open` to `end` and not `lanes`, so the gap is in the plan too. Issue `261126-2111-campaign-step-5-ends-with-the-two-sentences-step-6-no-longer-has-so-lanes-may-stay-uncommitted.md`.

**A3. Low: the route drops the orchestrator's apostrophe check.** `<absolute paths>` sit inside the single-quoted `bash -c` (`:137`), and the absolute paths carry the user's own project location. The orchestrator's Step 4 has "check that no path in your staging list contains a `'`"; the skill does not. Nothing quotes each path inside the string, so a space splits one too. The text does not say to join `path=`, which is workbench-relative, to Step 0's `WORKBENCH`. `git reset -q` empties the steering checkout's index. There, anything staged is the user's own, not a child run's, which is the orchestrator's reason for the reset. Issue `261126-2111-the-steering-commit-route-drops-the-orchestrators-apostrophe-check-on-its-absolute-paths.md`.

**A4. Low: `allowed-tools` lists `Monitor` and leaves out `Write`.** `skills/campaign/SKILL.md:4`: `[Bash, Read, AskUserQuestion, Monitor, TaskStop]`. The watch no longer uses `Monitor`, and Step 6 tells the session to `Write` the message file. `skills/cleanup/SKILL.md:4` lists `Write` for the same use. Not verified: whether this prompts under default mode (the retest ran in auto mode). Issue `261126-2111-the-campaign-skill-allows-monitor-which-it-no-longer-uses-and-not-write-which-step-6-uses.md`.

### B. The report-mode watch

What holds, as checked against the code:
- **A failed delta keeps the last head.** `reportLoop` advances `seen` only on a move with no rows (`hooks/lib/campaign-watch.ts:309`) and returns before advancing on rows (`:311-314`). A delta failure leaves `seen` alone (`:308`). The test "a move whose fetch fails keeps the last head…" passes.
- **The probe's bound** resolves on the timer, not on `close`, so a transport child holding the pipes cannot stall it (`:124-130`). The fetch runs `spawnSync` with `stdout` ignored and `stderr` inherited, so no pipe holds it either (`hooks/lib/campaign.ts:502`).
- **The outage memory** at 300 s: a re-arm within 2 x 300 s minus the probe's bound finds a fresh file and stays silent (`:276-289`, `:317-324`). The recheck `261126-0814-*` saw 25 and 26 silent refreshes.
- **Own pushes** produce no wake unless they carry a row, because nothing is printed for an empty delta.

**B1. Medium: an exit with none of the rows kills the watch silently.** Every throw inside the delta escapes `reportLoop`: `fetchRef`'s `mustGit` (`hooks/lib/campaign.ts:494`), `realpathSync(mustGit(…))` (`:507`), `withScratch` → `tmpPath` (`:418-425`), `sideAt`'s `mustGit ls-tree` (`campaign-watch.ts:206`), `extractAt`'s `git archive` and `tar` (`campaign.ts:528-540`). The process exits 1 with an empty stdout (`hooks/campaign.ts:476-479`). Exit 2 is a `--since` outside the grammar (`hooks/campaign.ts:141`), which a session with no `head=` read could send. Both texts end with "Else restart it `--since` the printed `head=`. Any other wake: no text." (`skills/campaign/SKILL.md:160`, `agents/orchestrator.md:380`). That is two overlapping catch-alls and no branch for an empty stdout, so the session says nothing and starts nothing. This is the remainder of issue `261126-0900-*`'s class: that fix covered `failed=` and not the exits that print no row at all. `rules/critical-stance.md` §4 applies: the case list in each text is neither disjoint nor complete. Issue `261126-2111-a-report-mode-watch-that-exits-with-none-of-its-rows-dies-silently.md`.

**B2. Low: the staleness bound ignores the probe's own bound.** `fresh()` is `now - mtime < 2 x interval` (`campaign-watch.ts:280`). The gap between two failed probes of one watch is one interval plus one probe, and a hanging remote stretches the probe to 60 s. The file is therefore stale at every check when `--interval` is 60 s or less, and a single outage is reported on every probe. The default 300 s is safe; `--interval` is a documented flag. Issue `261126-2111-the-outage-file-goes-stale-within-one-watch-when-the-interval-is-at-most-the-remote-timeout.md`.

**B3. Low: the delta fetch's stderr is passed through on every failed probe, and its bound has no test.** `fetchRef` inherits stderr (`campaign.ts:502`). In an outage where `ls-remote` answers and the fetch fails, every probe appends git's stderr to the output file. Meanwhile the first `failed=` warns with the probe's stderr, which is empty. The header says "git's stderr once with it". The only hang test, `campaign-watch.test.ts:318-322` with `uploadpack` set to `sleep 20`, stops `ls-remote` first, so the fetch's `timeout` is never reached. Issue `261126-2111-the-report-mode-fetch-passes-gits-stderr-on-every-failed-delta-and-its-timeout-has-no-test.md`.

**B4. Low: the watch copies the overview's row format.** `steeringRows` spells the `new-question=` and `new-ready=` fields a second time and reaches `withSince` through `as unknown as Overview` (`campaign-watch.ts:226-230`; compare `campaign.ts:1274-1279`, `:1229`). Today the two agree. A later field would reach one of them and not the other, and the cast hides it. Issue `261126-2111-campaign-watch-copies-the-overviews-question-row-format-instead-of-sharing-it.md`.

### C. Docs against code

**C1. Low: `docs/campaign.md` restarts every watch from a printed `head=`.** `docs/campaign.md:42` says the woken turn "starts the watch again from the `head=` it printed" and that the watch exits only with something to act on or on the first failure. `failed=` prints no `head=`. Since `261126-0900-*` both texts restart with the same `--since`, and the page does not say so. It also leaves out the `state=already-watching` exit, which every `/fusion:campaign` use meets while a watch runs (`hooks/campaign.ts:408-410`). Issue `261126-2111-docs-campaign-says-a-watch-restarts-from-its-printed-head-which-a-failed-watch-does-not-print.md`.

Checked and consistent: the helper header's `## probe and watch` against `reportLoop` and `reportRows`, row by row (lane `campaign=` excludes `paused`, `note=since-unknown` only with rows, exit 0 on `failed=`). The `answer` section against `campaign-write.ts` `answer`. `docs/upgrading-to-v13.md` 13.6.0 against the texts. `CLAUDE.md`'s corrected bus line (spec C6 criterion 3). The version reads 13.6.0 in `plugin.json`, `README.md` and `install.sh`. The marketplace entry lives in the other repository and was not checked.

**Seen again, not refiled:** `skills/help/SKILL.md:101` says the section carries "the last three install-from paragraphs". It carries six (`:89-99`). The range added one and dropped one. The open issue `261106-0830-the-help-update-topic-carries-six-install-from-paragraphs-against-the-release-rule-of-three.md` got an `Also seen:` line.

## Cross-cutting observations

- **The skill copies the orchestrator's commit shape and drops its guards.** A1 and A3 are the same pattern. Step 6 took `with … bash -c 'git reset -q && git add … && git commit -F …'` from the orchestrator's Step 4, then `sync` from 5a. It left behind the apostrophe check and the reading of `sync`'s states. One shared paragraph cited from both, or a cited pointer to 5a's state handling, would close both. Under `SKILL_HEAD_ROOM` 0 a citation is also the cheaper route.
- **Case lists over helper output are written as "rows, then Else, then any other".** B1 in both texts, and earlier `261126-0900-*`. Each list names the rows the trial saw and leaves out the exits it did not see. The helper's own exit table is the complete set, so citing it per exit class (rows, `failed=`, `already-watching`, non-zero or empty) would make the split total.
- **The trial-found class, a sentence read two ways, appears once more** as A2. It is a cross-reference into a paragraph the range rewrote. It is also the one case where the defect sits in an unchanged part (`06-claude.md`) that a range diff alone does not show.

## Recommended sequencing

1. A1 and A2 together, in the skill, as one cut-and-cite change: they decide whether a steering act or answer really reaches the remote.
2. B1: helper first (a throw in the delta becomes a `failed=`), then the two texts' case lists. Both texts have a bound, so prefer citing the helper's exit table to restating it.
3. A3 and A4 with step 1, since they touch the same paragraph and the frontmatter beside it.
4. B2, B3, B4 and C1 as cleanup in the next release that touches `campaign-watch.ts` or `docs/campaign.md`.

## Verdict

`revise`: the work meets its spec's tested criteria (retest `261124-2015-*` Part A after the `261126-0814-*` recheck and the user's ruling on it), and the findings above ask for fixes outside what the trial reached.

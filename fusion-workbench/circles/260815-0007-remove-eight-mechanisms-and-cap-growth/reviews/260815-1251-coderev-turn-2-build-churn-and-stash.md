# Code Review — the build change, the churn removal, the stash pair, and the plan they left behind

**Date:** 2026-08-15 12:51
**Sender:** coderev
**Reviewed-range:** `7c12d6a..5d29b6d`
**Not-opened:** none
**Circle:** `260815-0007-remove-eight-mechanisms-and-cap-growth`
**Suite at review time:** `cd hooks && npm test` — 45 files, 830 tests, **all green**, 76.0 s. Working tree clean afterwards apart from the pre-existing `orchestrator-events.jsonl` modification. This is the first full green run recorded in this Circle.

---

## Summary

The three code steps are correct and, in two places, better than the plan asked for. The build no longer deletes what a parallel run is reading, the committed `hooks/dist/` matches its source byte for byte and every entry point runs under bare `node`, the three surviving tracker measurements are structurally intact, and the four `stashes/` exclusions the executor argued to keep are all present.

What the range leaves behind is again not in the code. It is in the plan: **step 11's file list describes a tree that step 4 changed seventeen hours earlier**, and following it lands a red commit on two test files it does not name. Beside that, the after-measurement command cannot see 320 lines this Turn added, so the Closure note's arithmetic will overstate the shrink.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 4 |

One further finding was withdrawn as a duplicate of `ontorev`'s; see `## Overlap with the parallel review`.

## The range is nine commits, not seven

The dispatch listed seven and named `7c12d6a..HEAD`; the `review_start` event says the same. `git rev-list --count 7c12d6a..HEAD` is **9**. The two the list omits are `53f2ed2` and `89ca95a`, and neither falls inside any review's declared range — Turn 1's two reviews both stop at `7c12d6a`. Both were opened here and both are clean:

- **`53f2ed2`** performs the repair Turn 1's finding A1 asked for, and performs it correctly. Verified with `git show --name-status -M`: the three-line stub in the plane-mirror Circle is a `D`, and the curator Circle's copy is an `R092` rename from `_o_` to `_c_` with its body intact (31 lines on disk, with its `Resolved:` footer). Turn 1's coderev claimed this and the claim holds.
- **`89ca95a`** files one shared defect record about revising an active Circle's Directive. Nothing shipped changed.

`bin/fusion-review-coverage` reports `uncovered=9` at the time of writing, which is correct and which this file's `**Reviewed-range:**` closes.

## Findings by theme

### A. The plan describes a tree two of its own steps have moved

**A1 — Step 11's file list predates Turn 2, which re-pointed two suites onto the measurement step 11 deletes.** Medium. Filed as `260815-1251_*_step-11s-file-list-predates-turn-2-which-re-pointed-two-suites-onto-the-measurement-step-11-deletes.md`.

`a69d56e` re-pointed `hooks/lib/__tests__/guard-state-shape.test.ts` off `churn.json` and onto `state-drift.json`, and off the churn load and onto the state-drift sentence. Its header argues at length that `state-drift.json` is the right successor because it is *"the throttle record `measureStateDriftForModel` reads on EVERY guarded tool call"*. Step 11 deletes that measurement. Step 11's test file list is `hooks/lib/__tests__/{hook-fail-open,staging-drift,review-coverage,helpers/guard-harness}.ts`; `guard-state-shape` appears in the plan only in step 4's list, which has landed.

All nine of that file's cases call `ordinaryEdit()`, one `Edit` on `notes.txt`. After step 11, review coverage returns early (the payload is not a `.md` file under a `reviews/` store) and staging drift returns early (HEAD has not moved), so the reply is `""` and every case fails.

`hooks/lib/__tests__/monitor-warnings-panel.test.ts:730` is the second omission — it asserts the `state_drift` level branch step 11 removes from `bin/monitor`, and it too is named in steps 2, 4 and 12 but not 11.

The finding under both file names is larger than either. **After step 11 no tracker measurement fires on an ordinary write at an unremarkable path.** Step 11's prose is careful about what stops being measured — it enumerates state-drift rows 3, 4 and 5 and states plainly that nothing will notice a frozen Circle Turn log — and says nothing about this. `hook-fail-open.test.ts`'s two tracker cases, both re-pointed by `a69d56e`, lose their trigger rather than needing an edit, and with them the PostToolUse-side probe for the property `260809-2045` was filed about. `inference:` a replacement exists on `measureStagingDriftForModel`'s first-sighting arm, which does write on a first call; I did not build it, so that is reasoning and not a checked claim.

**A2 — The plan's `**Decidability:**` head counts eight asserted enumerations and seven remain.** Low. Filed as `260815-1251_*_the-plans-decidability-head-counts-eight-asserted-enumerations-and-seven-remain.md`. `5d29b6d` deleted the stash-manifest field-count check and renumbered the sections below it; `grep '^// --- ' hooks/lib/__tests__/derivable-enumerations-lint.test.ts` returns seven numbered sections. The test file's own header was corrected in the same commit; the plan's head was not, and the executor named the residual and left it standing as outside its file list, which is right. `d1ae1c0`'s commit message also says eight and stays — it was true at 08:47.

### B. A measurement that will not see what this Turn added

**B1 — The after-measurement command cannot see the 320 lines the build change added.** Medium. Filed as `260815-1251_*_the-after-measurement-command-cannot-see-the-320-lines-the-build-change-added.md`.

Step 14 re-runs step 1's block verbatim, which is right. Its hook-source row is `cat hooks/*.ts hooks/lib/*.ts | wc -l`. `332267a` added `hooks/scripts/build.mjs` (205 lines), `hooks/scripts/run-tests.mjs` (48) and `hooks/vitest.config.mjs` (67) — 320 lines, all `.mjs`, all outside both globs. The before reading was 7 934; the current reading is 6 945; the delta will read −989 where the real change to hook code is −669.

**The extension is deliberate and must not be "fixed" in the tree.** `hooks/scripts/build.mjs`'s header states why `vitest.config.mjs` is `.mjs`: a `.ts` config matches `tsconfig.json` `include`, ships into `hooks/dist/`, and excluding it there would leave the build's orphan prune unable to distinguish a deliberately unbuilt source's stale output from a concurrent run's fresh one. The repair is one annotated sentence in the closure note, which step 14 already asks for in the mirror case.

### C. Two removals that took a little more with them than intended

**C1 — Four shipped consumers exclude a `stashes/` store the layout definition no longer knows about.** Low. Filed as `260815-1251_*_four-shipped-consumers-exclude-a-stashes-store-the-layout-definition-no-longer-knows-about.md`.

All four exclusions are intact and all four are right to keep: `skills/setup/SKILL.md:67`, `skills/log-activity/SKILL.md:82`, `skills/archive/SKILL.md:96`, `agents/playmaker.md:63`. What `5d29b6d` removed is the `stashes/` line from the layout tree in `rules/fusion-workbench-conventions.md`, the file that declares itself the layout's single authoring home. The next editor of any of the four meets an exclusion for a directory no definition mentions, and the argument for keeping it lives in a commit message.

One over-claim to correct rather than repeat while fixing it. The commit message says an unexcluded Setup probe *"reads its bracket-marker filenames as an unconverted workbench and refuses Setup permanently"*. `skills/setup/SKILL.md:60` records the measurement that sentence leans on and says the opposite about this store specifically: 1146 matches, *"all of them under `archive/` and `.migration-v2-backup/`, none anywhere else"*. The exclusions are right because frozen content is not live content, which is the stated principle; they are not right because of a measured hit. `rules/critical-stance.md` §3.

**C2 — The reference lint's non-plugin root-var branch lost its data and its only behavioural test in one commit.** Low. Filed as `260815-1251_*_the-reference-lints-non-plugin-root-var-branch-lost-its-data-and-its-only-behavioural-test-together.md`. `5d29b6d` removed `STASH_DIR` from `ROOT_VARS` and deleted the case that drove the `typeof names === "string" → continue` branch at `reference-resolution-lint.test.ts:301`. The guard test at `:535`, which the file calls "the falsifier for the skip half", now filters an empty list and cannot fail. The vacuity is stated honestly in a source comment; it is not stated anywhere a reader of the defect store would find it, and the case could have been kept with a test-only entry rather than a real one.

**C3 — The three-churn-references record lists three and two remain.** Low. Filed as `260815-1251_*_the-three-churn-references-record-lists-three-and-two-remain.md`. `04ea182` struck the record's third item, `skills/help/SKILL.md:106`, eleven minutes after the record was filed and said so in its message; the record was not annotated. `grep -rniI churn skills/help/SKILL.md` returns nothing at HEAD. The title stays true — three did survive step 4 — so the fix is an append, not a transition.

## The six specific checks the dispatch asked for

Recorded in full, because five of them came back clean and a later Turn should not re-derive them.

**1. The build change, and whether `hooks/dist/` still ships correctly. Clean, three ways.**

- **Source parity.** Compiled to a scratch directory with `./node_modules/.bin/tsc --outDir <scratch>` and ran `diff -r dist <scratch>`: identical, nothing reported. The committed tree is the tree a clean build produces. Verified without touching `dist/`, so no working-tree change was made to check it.
- **Self-containment.** Every `from "…"` in `dist/**/*.js` is either a `node:` builtin or a relative `./…js` path; there is no `require(` anywhere in the tree. `churn.js` and `churn-rank.js` are gone from `dist/`, which is the prune working.
- **Runnable as committed.** `node hooks/dist/turn-budget.js` prints `max_turns=12`; `echo '{}' | node hooks/dist/tracker.js` prints `{}` and exits 0; `state-drift.js`, `staging-drift.js` and `review-coverage.js` each print their `anchor=` block. The `CLAUDE.md` `### HTTPS installer` invariant holds.

Two properties of the new build worth stating because they are what makes the concurrency claim true rather than asserted. The swap file is created under `hooks/.build-staging/` and renamed into `dist/` — same filesystem, so `rename(2)` is a true atomic replacement rather than a copy a reader can catch half-done. And the prune asks about the **source** (`sourceOf(rel)` plus `existsSync`), not about this build's output, so two concurrent runs agree on the end state whichever finishes last. `hooks/tsconfig.json` gained `.build-staging` to its `exclude` and `.gitignore` gained `hooks/.build-staging/`, both correct.

`inference:` an interrupted run leaves a staging directory behind for up to 24 hours, since `sweepAbandonedStaging()` is deliberately conservative. I observed one on disk mid-review and confirmed by process list that it belonged to the parallel `ontorev`'s live run, not to a leak.

**2. The three re-pointed measurements. All three assert something real, and the fail-open case is not vacuous.**

- **The fail-open case** (`hook-fail-open.test.ts:184-215`) is the one that would have gone vacuous, and the executor saw it. Before this range, churn wrote to `.guard-state/` on every write-tool call, so an unwritable directory always threw; with churn gone, a project with nothing to report writes nothing and the case would have asserted a marker that never arrives. It is now given a drifted project through a new `prepare` hook that runs before the `chmod`, and the assertions are the stderr marker **and** the drift sentence surviving in the reply. Traced against `measureStateDriftForModel`: with drift, `report.signature !== seen`, so `recordReported` runs, throws under `0555`, is swallowed by `bestEffort`, and the sentence still returns. Not vacuous. The other half is now a case of its own — "tracker with nothing to report writes nothing, so nothing can fail" — which asserts `not.toContain("[tracker] Error:")` and a bare `{}`.
- **The guard-state shape suite** kept its subject and moved its fixture. Its last case, "reads back the signature the previous call wrote and stays quiet", is a real falsifier: it runs `ordinaryEdit` twice and asserts the second is silent and the stored signature unchanged, so a coercion that emptied a well-formed file would fail it. Its middle case asserts the malformed file is *repaired*, not merely survived, and that no `guard_error` was emitted. All nine pass.
- **The self-detect stand-down.** `isFusionPluginRoot` is exported with no caller, and `self-detect.ts:23-32` now says why: `isFusionPluginCwd()` is a call of it with `process.cwd()`, and the rule about which coordinate space a stand-down is evaluated in is what decides which form the next caller wants. `README-hooks.md:188` carries the same statement. This is a documented deliberate retention, not drift, and it is the one place in the range where dead-by-caller-count is the right call.

**3. `RULE_BASELINE`. Only the one entry moved, and `bin/fusion-rules` emits the new name.**

`git diff 7c12d6a..HEAD` over `rules-emission-golden.test.ts` touches exactly one baseline line: `"workbench-stash-and-lock.md": 9_250` becomes `"commit-lock.md": 9_250`. No other entry, and no value, changed. The re-key at the same number is the right call and the commit message states the reason correctly — the file is 5 663 bytes on disk against a 9 250 floor, so the role is credited with the shrink instead of absolved of it.

`bin/fusion-rules` `1e` emits `$PLUGIN_RULES_DIR/commit-lock.md`, the file exists, and the golden's orchestrator block reads `commit-lock.md 5663` with a total of 104 181. The arithmetic checks: conventions −398, `circle-records.md` −64, the rule file 13 030 → 5 663, summing to the reported 112 010 → 104 181. Every other agent drops exactly 398.

Two consequential edits that could have gone wrong and did not. The **`DEFINITION_SITES`** entry was *dropped* rather than re-added under the new name, which inverts the plan's instruction — and the inversion is right: `rules/commit-lock.md` contains no type-folder path literal, and `path-literal-lint.test.ts:279-298` fails any declared site that "names no store directory". The plan's parenthetical about correcting the conventions header table "from four topics to three" was also correctly not followed: the row became `commit-lock.md` rather than disappearing, so the count stays four and the "five files" sentence beneath it stays true.

**4. The `stashes/` exclusions. All four intact; the argument holds on the principle, not on the measurement.** See finding C1.

**5. The three tracker call sites. None damaged.**

`hooks/tracker.ts` at HEAD holds `measureStateDriftForModel`, `measureReviewCoverageForModel` and `measureStagingDriftForModel`, each called from `main` through `bestEffort`, each joined into one reply, with `respond` as the last statement. The code-only diff over the range removes `trackChurn` whole and touches nothing inside the three bodies. Two removals are worth naming because each could have been a silent behaviour change and neither is:

- **The plugin-repo stand-down went, and it cost the three nothing** — they were deliberately ordered *ahead* of it, so the early-return it performed already carried their sentences. Verified by reading the deleted block: it did `respond(standDown)` with the same three joined strings.
- **`answer()` was replaced by a bare `respond()`**, correctly: `answer`'s reports argument was `trackChurn`, and with it gone there is nothing left to run after the reply. `answer` still has four callers in `guard.ts`, so the helper is not orphaned.

The one cosmetic leftover: `hooks/lib/project-relative.ts` now carries two consecutive empty comment lines where the churn paragraph was removed (`:91-93`). Not filed.

**6. The `**Decidability:**` head.** Confirmed and filed; see A2.

## What else was verified and is correct

- **`.gitignore`'s `!bin/` exception list is stale in exactly two places, both filed.** `!bin/fusion-plane` (`ontorev`, Turn 1) and `!bin/fusion-churn-rank` (`coder`, this Turn). Step 11 adds a third when `bin/fusion-state-drift` goes. Nobody should file a fourth record about this block.
- **`hooks/hooks.json` is clean** — three SessionStart commands, `guard.js`, `tracker.js`, no reference to anything removed.
- **The two guard-config files stayed byte-identical outside `PROJECT_SET_KEYS`.** `fusion-guard.json` and `templates/fusion-guard.json` received the identical one-clause edit, which is what `config.test.ts` requires; the conjunction was kept so the remaining list does not read as two items joined by nothing.
- **`bin/monitor` lost the right things.** Two event types, the `critical` level branch and the `.warning-row.critical` CSS class no arm can now set. Every remaining member of `WARNING_EVENT_TYPES` has its own explicit level arm; the default `Warning` label is now only a fallback for a future member, which is the correct shape.
- **`orchestrator-events.jsonl` is intact**: 1 526 lines, zero unparseable, 44 distinct event types. Timestamps are UTC and reconcile with the commit times at the documented +02:00 offset. Every commit in the range has a `commit` event, though `04ea182`'s arrived twenty minutes late, folded into `5d29b6d`'s row.
- **The two carried history entries were opened and are correct as they stand.** The shaper entry's `_a_circle.md` citation at `:83` is a historical statement about what that run wrote and must not be touched, which Turn 1 already established. The planner entry says `derivable-enumerations-lint` re-derives "the skill roster, the agent counts and four other enumerations" — six, where the plan said eight; both are statements about the tree on 2026-08-15 and neither is worth editing now.
- **`README-agents.md:197`'s conditional-emission bullet names `commit-lock.md` with `orchestrator`**, which is what the enumeration lint requires, and `:275` still reads "four topics", matching the conventions header table.
- **`claude plugin validate .`** was not re-run here; Turn 1 ran it against `7c12d6a` and no agent frontmatter changed in this range.

## Cross-cutting observations

**The defect class shifted, and the shift is the good news.** Turn 1's findings were nine records, a `.gitignore` line and two citations that survived because no gate looks at them. Turn 2's are four documents that went stale because a *later* step moved the tree a *earlier* file list described. That is a different failure and a cheaper one: it is bounded by the number of steps left, it is visible to a reader of the plan, and it has an obvious instrument — re-read each remaining step's file list against the tree at the moment the step is dispatched, rather than against the tree at planning time. The plan was already corrected once this way (`d1ae1c0`, which found eight affected steps where the reviews reported two). A1 is the second instance, and it arrived nine hours after that sweep.

**Three of the four Medium-and-below findings are in one file.** The plan carries A1, A2 and B1. It has been edited once in this Circle and is now the densest concentration of stale statements in the tree, which is expected — it is the only document that describes a tree in the future tense. It is also the document nine remaining steps read. A short pass over steps 7 through 15's file lists, run now, is worth more than the individual fixes.

**Nothing in this range weakened a test to get green.** I checked this specifically, because 332267a's message claims it and the claim is the kind that is easy to make and hard to verify. No timeout moved, no `retry` was added, no case was skipped, and the two wall-clock waits became observable gates rather than sleeps. The vitest worker cap is a real reduction in parallelism with a measured cost (20 % on a solo run) and a measured benefit (9 of 9 green against 4 of 9), and its own comment marks the "half the cores" figure as `speculation:` rather than an optimum. That is the calibration `rules/critical-stance.md` §3 asks for, applied by the executor to itself.

## Overlap with the parallel review

`ontorev` filed four records at the `260815-1247` stamp, three minutes ahead of mine. **One of them is a finding I reached independently and have withdrawn:** `260815-1247_*_the-inserted-step-p-3b-is-in-no-plan-and-in-no-turn-log-only-in-the-event-stream.md`. My record was deleted rather than filed; the two agreed on the evidence and on the remedy, and theirs is the earlier stamp. Recorded here because Turn 1 produced three such pairs and the dispatch asked for the collision to be named.

Two of their other three reach files I also read, and I am not duplicating them:

- **`260815-1247_*_the-churn-leaves-were-removed-without-a-retirement-entry…`** names `hooks/lib/config.ts:503-508` and the unreachable retirement branch. That is application code and therefore mine by charter; `ontorev` reached it from the configuration side, flags the overlap in its own `**Owner:**` line, and got there first. I read `config.ts`'s header and its `DEFAULTS` and did not check the retirement table, so their finding is new information to me rather than a duplicate of anything I withheld.
- **`260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken…`** is a record-store citation, the same class as Turn 1's A1 and C2.

The split by artifact kind again does not match the defect distribution: the plan, the Circle record and the defect store are neither structured data nor application code, and both reviewers can reach all three. `ontorev` carries `**Domain:** data` and `**Owner:** ontocoder` on records about a plan and a decision record, which is the same unsettled ownership Turn 1 raised and which nobody has settled.

## Recommended sequencing

**Before step 7 starts, and as one pass over the plan** — A1, A2 and B1. All three are edits to `260815-0029_*_plan-…md`, the same editor is in the file, and A1 is the only finding in this range that makes a future commit fail. While there, re-read steps 7 through 15's file lists against the tree rather than against the plan, which is what turned A1 up.

**Any time in this Circle, cheaply** — C3, one append; C2, either a restored test case or a recorded acceptance.

**At gate G1, with the curator** — C1. It is a sentence of normative prose in `rules/fusion-workbench-conventions.md`, and the curator's pass is where prose that no gate asserts belongs.

**No release blocker.** Nothing in this range breaks a shipped surface, the compiled tree is correct and runnable, the version is correctly still `8.2.0` for step 15, and the suite is green for the first time this Circle.

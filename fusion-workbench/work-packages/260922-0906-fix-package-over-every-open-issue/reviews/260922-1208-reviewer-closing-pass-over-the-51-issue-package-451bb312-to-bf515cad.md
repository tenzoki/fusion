# Closing review of the 51-issue package: `451bb312..bf515cad`, 43 commits, 59 shipped files

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `451bb312..bf515cad`
**Not-opened:** `hooks/dist/events-query.js`, `hooks/dist/lib/citation-scan.js`, `hooks/dist/lib/config.js`, `hooks/dist/lib/events-query.d.ts`, `hooks/dist/lib/events-query.js`, `hooks/dist/lib/staging-drift.js`, `hooks/dist/lib/stores.d.ts`, `hooks/dist/lib/stores.js`, `hooks/dist/lib/work-graph.d.ts`, `hooks/dist/lib/work-graph.js`, `hooks/dist/order.d.ts`, `hooks/dist/order.js`
**Domain:** code and data, one pass (the eight voice-profile YAML files are the data half)
**Work item:** 260922-0906-fix-package-over-every-open-issue.md
**Plan reviewed against:** 260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md
**Cross-references:** 260922-1028_*_which-gates-does-the-autonomous-mode-answer-beyond-the-plan-the-claim-and-the-finish.md, 260922-0937_*_may-the-eight-voice-profile-yaml-files-be-repunctuated-under-the-em-dash-ceiling.md, 260922-0922_*_are-the-dispatch-path-rows-re-armed-at-the-post-cut-totals-and-under-which-event.md

The range is the whole package, taken as dispatched: `bin/fusion-review-coverage` anchors shorter (`since=e865d37c`, 3 uncovered) because no pass had opened any commit in the range, so this file's range is the one that tiles it. The twelve `hooks/dist/` files were not read; they were verified by `cd hooks && npm run build` leaving `git status hooks/dist` empty, which is the same comparison `committed-dist.test.ts` makes.

## Summary

The package did what its plan claims: all 51 records are closed (`find … -name '*_o_*.md' -o -name '*_p_*.md'` over every issue store prints 0), the suite is green, the citation gate is clean, `dist/` matches a fresh build, and every helper change was re-run against the tree or a fixture here. What the package did not do is follow one mid-package ruling out to the surfaces that describe it: commit `57e2b7eb` changed which gates `**Mode:** autonomous` answers, and the user-facing doc, the conventions' edge-confirmation rule, the curator prompt and the 11.11.0 help paragraph still describe the behaviour before it. Nothing blocks a tag of 11.11.0 on correctness; two of the findings below are the release's own description surfaces and should land before the tag.

## Verification

- `cd hooks && npm test`: exit 0, 58 files, 984 tests (the plan's last recorded run was 57 files, 973; the new file is `fusion-work-order.test.ts`).
- `node hooks/dist/citation-check.js`: `files=3083 dangling=300 store-prefixed=405 edited-violations=0 verdict=clean`, the two figures where steps 20 and 24 said they would be.
- `bin/fusion-citation-sweep --repair --dry-run`: `files=0 repairs=0`.
- `cd hooks && npm run build` then `git status --short hooks/dist`: empty.
- `.claude-plugin/plugin.json`: `11.11.0`; `git tag -l v11.10.0` exists, so step 36's second branch was the right one.
- `bin/fusion-prose-metric` over the four shipped and four workbench profiles: 0 em-dashes, `ok` on every row; the workbench copies are byte-identical to the shipped ones (`cmp`) and their four checksums in `.asset-provenance` match `shasum -a 256`.
- `bin/fusion-work-order` over this tree: `unreadable-head=0`, one `note=` naming both `no-depends-on-field=3` and `unresolved-edges=1`.
- `bin/fusion-staging-drift` over this tree: `record M shared/checkouts/5e8248d7.md UNSTAGED`, the classification step 24 introduced and step 37 wrote into the cleanup body.
- The pin line `hooks/lib/__tests__/reference-resolution-lint.test.ts:492` walks 1693/313 → 1701/317 through eight in-range entries with no gap.
- Step 1's cut: `rules-emission-golden.test.ts` 1213 lines (ceiling 1215), `surface-growth-bound.test.ts` 568 (ceiling 569); the rolled record exists and carries the `STANDING CLEANUP REQUEST` table once.
- The plan's per-step acceptance greps for steps 2 to 15, 17, 19, 29, 32, 36 and 37 were re-run and print what the plan says; step 7's two `sed` expressions were probed with a bracket-marked store path and print `260716-1910_*_plan-foo.md`; step 9's helper prints `heading-level=0` on a two-line headingless `CLAUDE.md`.
- Head-room after the package, computed from `fixtures/surface-growth.golden` totals against the baseline maps: hook tests 15 lines, `skills/` 72 bytes, `agents/` 8 493 bytes. The next test-bearing fix cuts first.

## Totals

Critical 0 / High 0 / Medium 5 / Low 4. Nine issues filed in this container's `issues/`.

## Findings by theme

### 1. One ruling, four surfaces left behind (commit `57e2b7eb`)

`260922-1028_*` (ruled by the user, option 2) moved *Task involves `ontocoder`* from the file-and-skip set to the answered set, applied a curator ledger whole under the field (`**Approved:** all`, edges included), and confirmed the held item's pause by the instruction to claim another. `agents/orchestrator.md:383` and `:610` carry it. These do not:

- **Medium.** `docs/working-model.md:105` ("answers … the plan review, the item's claim and its finish, and the read of its plan's stop conditions … and no other"), `:111` (every `ontocoder` task is a stop) and `:115` ("the ontology, destructive-operation and ambiguous-task gates put no question at all: the orchestrator files an open decision"). The user-facing doc now describes a gate set the prompt no longer has. Filed: `260922-1208_*_working-model-doc-describes-the-gate-set-before-57e2b7eb-moved-the-ontocoder-row.md`.
- **Medium.** `rules/fusion-workbench-conventions.md:229` ("An entry stands on the user's confirmation, and no agent writes one without it … whose proposals are inert until the user rules at its gate, so the write still stands on the user's confirmation"), `agents/curator.md:240` ("inert until the user rules: nothing reaches a work item before the gate") and `:242` ("as a proposal the user confirms"), `docs/working-model.md:46` ("edges you confirmed"). Under the field an `**Edges:** on` ledger is applied whole with no per-entry ruling; the binding rule and the prompt it cites both still say the opposite. Two normative surfaces now state a contradiction. Filed: `260922-1208_*_the-depends-on-confirmation-rule-still-says-every-edge-waits-on-a-user-ruling-after-the-ledger-applies-whole-under-the-field.md`.
- **Medium.** `skills/help/SKILL.md:96`: "11.11.0 changes helper output only and asks nothing of the user." The release also changes the orchestrator's gate handling under the field (the one behaviour change a consuming project would notice), makes the registry entry a record a cleanup split carries (`skills/cleanup/SKILL.md:53`), writes a draft dotfile from `/fusion:post`, and stops `/fusion:news` marking an unrendered entry seen. The help paragraph is the release's description surface and misstates it. Filed: `260922-1208_*_the-11-11-0-help-paragraph-says-helper-output-only-while-the-release-changes-a-gate-and-two-skill-bodies.md`.
- **Low.** `agents/orchestrator.md:383`: the three-set split ends "**Every other row** (the spec, the flagged step, files outside the tree, the reconciliation verdict)". Row 381, *The planner is about to be dispatched and this checkout holds no claimed work item*, is in none of the three enumerations; the paragraph was rewritten in-range and kept the gap (`rules/critical-stance.md` §4). Filed: `260922-1208_*_the-three-set-gate-split-names-no-set-for-the-planner-without-claimed-item-row.md`.

### 2. A doc that still describes the behaviour a helper lost

- **Medium.** `docs/messages-between-checkouts.md:68`: "A project that does not track its workbench in git gets nothing, and is told nothing … the answer is `new=0` on a successful exit, permanently." Since `d29c5947` (step 30) `bin/fusion-forum new` exits 5 with `state=workbench-untracked` (`bin/fusion-forum:331-338`, test "state=workbench-untracked at exit 5"). The paragraph even cites the record the step closed. Filed: `260922-1208_*_the-messages-doc-says-an-untracked-workbench-answers-new-0-permanently-after-step-30-made-it-exit-5.md`.

### 3. The post body's draft file has one exit it never takes

- **Medium.** `skills/post/SKILL.md:52` writes the draft to `$WORKBENCH/.post-draft-$CHECKOUT` in Step 2; `:76` removes it on change or cancel; `:74` moves it on yes. Step 3 (`:60`, "Compose nothing … Say that in one line and stop") comes after the write and removes nothing, and an interrupted run removes nothing either. The body itself says no staging list names the file, so a leftover sits at the workbench root in none of `rules/workbench-tracking.md`'s classes and `bin/fusion-staging-drift` reports it `unclassified` on every commit after. Before step 32 the draft was a variable and a stop left nothing behind. Filed: `260922-1208_*_the-post-draft-dotfile-survives-step-3s-stop-and-an-interrupted-run-and-nothing-removes-it.md`.

### 4. Helper output the reading body does not carry to the user

- **Low.** `skills/news/SKILL.md:51` holds `ref=`, `head=`, `new=` and every `entry=` line; Step 4 (`:77`) then reads `$HEX` off a `writer=` line the hold list never named. `skipped=` (`bin/fusion-forum:59-62`, "Reported, never rendered") reaches no sentence in the body, so a path the helper declined to render is invisible to the user. Filed: `260922-1208_*_the-news-body-holds-no-writer-line-and-says-nothing-about-a-skipped-path.md`.
- **Low.** `bin/fusion-events:44-46`: "so the four sum to the dispatches in scope". Stdout prints four figures (`counted`, `longer_than_threshold`, `unattributable`, `unpaired`) that do not sum, `longer` being a subset of `counted`, and the fourth summand, `unstamped`, is on stderr. The sentence is true of `counted + unpaired + unattributable + unstamped` (`hooks/lib/events-query.ts:655-700`) and names none of them. Filed: `260922-1208_*_the-events-header-says-the-four-sum-without-naming-which-four.md`.

### 5. Test hygiene

- **Low.** `hooks/lib/__tests__/fusion-work-order.test.ts:52`: the exit-2 case's `mkdtempSync` result is not pushed to `roots`, so `afterAll` never removes it. Filed: `260922-1208_*_the-work-order-tests-bare-directory-is-never-removed.md`.

### 6. Checked and not filed

- `260922-0937_*_may-the-eight-voice-profile-yaml-files-be-repunctuated-under-the-em-dash-ceiling.md` stood `_o_` at `bf515cad` although `ad5535df` had realised its recommendation; while this pass ran, the working tree moved it to `_i_` with an `Answered:` line ruled by the user at 260922-1204 and an `Implemented:` line naming `ad5535df`. The move is uncommitted at the time of writing and belongs in the next commit.

## Cross-cutting observations

- **The package's one in-flight ruling is the source of four of the ten findings.** `57e2b7eb` was not a plan step; it arrived when the plan's expected skip at step 16 met the field, and the executor updated the orchestrator prompt and the event-row counts but not the doc, the rule, the curator prompt or the help topic that restate the same gate set. `rules/fusion-workbench-conventions.md:207` sends a reader to `agents/orchestrator.md` `## Human Gate Rules` for which gates the field answers, so the prompt is the authority and the other four are copies that drifted in one commit.
- **The three store lists are one list now, and the test that holds it equal to the layout tree works** (`path-literal-lint.test.ts:321-331`, `.slice(1)` dropping the `shared/` match itself). No other hand-kept store enumeration remains in `hooks/` (`grep '"consult"'` over `hooks/lib` and the entry points hits only `stores.ts`).
- **The retired core bound's safety argument is, at this tree, an argument about a bound with 78 KB of slack.** Step 1 kept the sentence "the DISPATCH-PATH BOUND … charges every core byte eleven times at zero head-room, so it dominates" (`rules-emission-golden.test.ts:71-75`) and rolled the measurement into the record. Record 41 of the plan measured that every path stands about 78 022 bytes under its row because `CLAUDE.md` is charged at 93 432 against a file of 8 021, and carried it into `260922-0922_*_are-the-dispatch-path-rows-re-armed-at-the-post-cut-totals-and-under-which-event.md`, still `_o_`. Until that is ruled, the always-on corpus has no failing bound in practice. Not a new finding; it is the one open decision with a release-sized consequence.
- **Head-room is nearly spent on two surfaces.** Hook tests have 15 lines and `skills/` 72 bytes. Every step that added a test case stated its ceiling and stayed under it, funded by step 1 (about 125 lines) and steps 7, 12, 29 and 36; the next package cannot add a test case without a cut of its own.

## Recommended sequencing

- **Before the tag of 11.11.0:** the help paragraph (`skills/help/SKILL.md:96`) and `docs/working-model.md` `## 3. The gates`. Both are surfaces a user reads to learn what changed, and both describe the gate set the release removed. Neither is a correctness defect in code; both are the release describing itself wrongly.
- **With the next package:** the conventions/curator edge-confirmation rule (a normative contradiction, but one that only bites on an `**Edges:** on` survey under the field), the messages doc, the post draft leftover, the news hold list.
- **Cleanup, any time:** the events header sentence, the test temp dir, the orchestrator row enumeration.

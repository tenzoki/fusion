# Analysis: verification of the size-versus-bookkeeping analysis

**Date:** 2026-09-09 13:45
**Type:** Document Study (verification of a prior analysis)
**Status:** Complete
**Requested by:** user
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

## Question

`260909-1047-size-versus-bookkeeping-across-three-projects.md` is the sole evidentiary ground for a planned cut to fusion's ceremony and bookkeeping load. Does every load-bearing figure in it survive independent re-derivation from the sources it names, does each conclusion rest on evidence that carries it, and does every cost it attributes to a named mechanism exist on the path it claims?

## Scope

The report under review, read in full, and re-derived against the three git trees, the three workbench record corpora and the three orchestrator event logs it pins. Two independent re-derivations were run by separate agents that were not shown the report, one over the git commit history and one over the record and event corpora; the mechanism checks against the plugin source were done directly. Nothing in the report was edited.

**Git state.** All three trees are reachable on this machine and all three pins resolve, with the HEAD dates and branches the report states.

| Tree | Pin | Commit date at pin | Tracking at pin | Working tree at verification |
|---|---|---|---|---|
| fusion, `/Users/k1/Projects/productive/fusion` | `a1ecf86e` | 2026-09-09 10:22:09 +0200 | main | `bb341360`, 2026-09-09 13:06, 5 ahead of origin/main |
| krk, `/Users/k1/Projects/productive/krk` | `68b76de6` | 2026-09-09 10:31:28 +0200 | main | `7f69270`, 2026-09-09 12:13, in sync |
| unite-co-creator, `/Users/k1/Projects/productive/unite-co-creator` | `0cc2214c2` | 2026-09-09 09:01:21 +0200 | main | unchanged, in sync |

Every figure below is taken at the pin, not at the working tree. The one exception is `bin/fusion-rules`, which is a live program and was run at HEAD; its four emitted plugin rule files are byte-identical between HEAD and the pin, so no number moves.

**Method note that bounds this whole verification.** The report states its wall-clock attribution rule and its date sources. It does not state what counts as a source file, what counts as a record, or whether an interval longer than 120 minutes is capped or dropped. Each of the three choices moves figures materially, so a class of its numbers is reproducible in direction and not in value. Where that is the case it is said, and the range across plausible choices is given rather than a single re-derived number.

## Findings

### Confirmed

Each item was re-derived from the source named beside it and held.

**F1. The Scope table.** All three pins resolve to the stated commits with the stated dates. `git rev-list --count` at each pin: 1241 / 861 / 3558 with merges, 1238 / 861 / 3441 without. First commits 2026-05-04, 2026-08-02, 2026-03-22. Exact in every cell.

**F2. Finding 15's two commits and their byte effect.** `8ac9a533` is 2026-08-27 08:45:11 +0200, `9c056b6c` is 09:25:02, forty minutes apart. Summing the files named by the unindented `emit_if_exists` lines in `bin/fusion-rules`, sized with `git cat-file -s` at each commit: 98 673 bytes (96.36 KiB) before, 94 146 after the first, 74 241 (72.50 KiB) after the second. The removed files measure 4527 and 20 354 bytes (4.42 and 19.88 KiB) at the commits that removed them, and the second commit's fall is 19 905 bytes (19.44 KiB), not 19.88, exactly as the report says. This is the most precisely stated passage in the report and it is right to the byte.

**F3. The input ledger, finding 11.** `bin/fusion-rules coder` emits 85 175 bytes. `CLAUDE.md` at the pin is 93 432 bytes. The fifteen files in `agents/` total 417 145 bytes, mean 27 810. The three sum to 201.58 KiB, which is the report's own note that the row adds up only unrounded. `agents/orchestrator.md` is 155 302 bytes (151.7 KiB). The orchestrator's emitted set is 131 331 bytes (128.25 KiB), which is the corrected figure the report's verification pass introduced.

**F4. The phase ledger, finding 18.** Every row reproduces to the byte from `git cat-file -s` at the pin plus `bin/fusion-rules` per agent: one coder dispatch 183.8 KiB, ramp-up 425.2, minimum cleanup 505.8, full closing 950.8. The ratios against a coder dispatch are 2.31, 2.75 and 5.17, printed as 2.3, 2.8 and 5.2. The reconciler dispatch is 201.5 KiB, the curator 221.7, the review 189.0, the portfolio 255.9.

**F5. The step counts.** `skills/setup/SKILL.md` at the pin carries 16 headings matching `^#+ Step`, and eleven of them are Step 0 and Step 0b through Step 0k. The eleven map one for one onto the pre-flight list in finding 18 and recommendation 6. `skills/cleanup/SKILL.md` carries 9, Step 0 through Step 8. Body sizes: setup 49.4 KiB, cleanup 25.0, archive 25.2, log-activity 13.3, curate 11.8, post 7.2.

**F6. Finding 17's fusion column, to the byte.** Selecting from the pin's tree: 65 decision files carrying `_o_` or `_a_` at 373.6 KiB, 54 issue files carrying `_o_` or `_p_` at 174.9 KiB, 6 plan files carrying `_o_` or `_p_` at 300.6 KiB, and the newest 20 history files at 102.6 KiB. Total 951.7 KiB against the reported 952.

**F7. Finding 17's pointer counts.** Thirteen of fifteen agent prompts name `$SCAN_DECISIONS`, thirteen name `$SCAN_ISSUES`, twelve name `$SCAN_PLANS`, eleven name all three. Exact. The exception clause attached to them is not; see C7.

**F8. The record corpus in the window.** Selecting `.md` files under `fusion-workbench/` at each pin whose basename carries a `YYMMDD-HHMM` stamp between 2026-08-01 and 2026-09-09: 2455 / 2128 / 2223 records at 18.30 / 16.40 / 18.20 MiB. The report gives 2453 / 2128 / 2222 and 18.3 / 16.4 / 18.2 MB, and states its units are 1024-based. The two-record gap in fusion is the two records the report says it filed after snapshotting.

**F9. Finding 1's central claim, and it is robust.** Records per source-touching commit in the window, computed under three source definitions: 6.26 / 5.69 / 6.06 counting only code extensions, 5.85 / 5.01 / 5.40 adding structured data, 4.42 / 4.55 / 4.82 additionally counting non-workbench Markdown. The report's 4.64 / 4.88 / 4.85 sits in the third band. Under every definition the three columns agree within about ten percent while the projects differ by three orders of magnitude in size. This is the strongest conclusion in the report and it survives every classifier choice tested.

**F10. The wall-clock model.** Under the rule that drops rather than caps gaps over 120 minutes, the workbench-only share of attributed session time in the window is 39.5 / 36.7 / 44.0 percent against the reported 40 / 37 / 44. Total attributed time across the three trees is 58 613 minutes, 977 hours, against the Sankey diagram's 976; workbench-charged time is 23 666 minutes, 394 hours, against the diagram's 398. The report used the drop rule, and its wall-clock arithmetic holds.

**F11. Finding 5's rework table.** Fix commits per feature commit reproduces cell by cell: fusion 0.95 / 0.58 / 1.08 / 1.76 / 0.90 against 0.93 / 0.50 / 1.08 / 1.76 / 0.90; krk 0.46 and 1.78 exactly; unite 0.11 / 0.26 / 0.46 / 0.61 / 0.91 / 1.12 / 0.80 against 0.11 / 0.26 / 0.46 / 0.61 / 0.91 / 1.11 / 0.80.

**F12. Finding 6's counts.** unite-co-creator's feature commits fall from 221 in May to 25 in the first nine days of September, with 101 documentation commits in the same nine days. All three exact.

**F13. Finding 8's dispatch shares and the pie's hours.** Grouping hook-timestamped dispatch pairs: production 74.3 / 83.0 / 67.1 percent against 73.1 / 82.8 / 67.1, review 3.4 / 1.3 / 4.4 exact, bookkeeping 10.0 / 2.3 / 7.6 against 9.8 / 3.1 / 7.6. Production minutes sum to 7094.8 across the three trees, 118.2 hours, matching the pie exactly.

**F14. Finding 10's decision counts.** Decision records carrying `_o_` number 25 / 12 / 70 over all records ever filed and 23 / 12 / 66 over the live tree, both exact. fusion's and krk's issue rows are exact: 1137 filed, 1074 closed, 63 open; 978, 870, 108.

**F15. The voice-profile arithmetic.** `chat-voice-de.yaml` is 2696 bytes. The plugin-side always-on set at the pin is 73 317; with the profile the floor a dispatch reads is 76 013 bytes, 74.23 KiB, which is the report's 74.2.

### Corrected

**C1. The always-on peak is 141.7 KiB, not 108.** Finding 12 says the set "climbed from 45 KiB to 108 KiB by late July" and recommendation 4 calls 108 KiB "its peak". Re-derived per commit across the 202 commits touching `bin/fusion-rules` or `rules/`, the set stood at 85.0 KiB on 2026-07-18, crossed 108 KiB on 2026-08-02 and peaked at **145 144 bytes, 141.7 KiB, on 2026-08-04 17:20** at `98c9363e`, where `protected-path-discipline.md` alone was 50 559 bytes. The report's July sample is an early-August value produced by weekly sampling. **Effect on the conclusion:** the reduction fusion has already achieved is larger than the report credits, and the ceiling a rule corpus can reach unbounded is 31 percent higher than the number a cut would be sized against. Filed as `260909-1345_*_the-size-analysis-understates-the-always-on-peak-and-the-august-cut.md`.

**C2. The 2026-08-27 cut was three commits and 33.6 KiB, not two and 24.** A third commit that morning, `265a86fb` at 11:03:12, took the floor from 72.5 to **62.8 KiB**. Its own message records the effect on the emitted path: "A coder dispatch's rules block: 75.9 KB to 65.9 KB. The day's cumulative effect on the hottest path: 101.6 KB this morning, 65.9 KB now." **Effect on the conclusion:** the direction survives, because `265a86fb` falls inside the report's after-window. What moves is the price. Recommendation 4 offers "12 percentage points of fix share" per 24 KiB of cut; the treatment was 40 percent larger, so the implied return per kilobyte is 40 percent lower. Same issue file as C1.

**C3. Finding 12's August cell reads 71 KiB; it was 64.3.** From 2026-08-29 to 2026-09-05 the plugin-side set was 65 793 bytes, 64.3 KiB. The pin value is 73 317, 71.6 KiB, not the 72.5 that recommendation 4 quotes as current; 72.5 was the value on 2026-08-27. The report's own sentence, "the floor a dispatch actually reads today is 74.2 KiB rather than 72.5", frames the voice profile as a 2.6 KiB offset from 72.5, which would give 75.1. The offset from the pin value is right and the comparison is stale by 0.9 KiB.

**C4. "Not ordered by size" does not survive a change of classifier.** Finding 3 gives 6.39 / 5.81 / 6.36 minutes per hundred changed lines in August and concludes the figure is "essentially flat, and not ordered by size, since the smallest codebase carries the highest figure." Counting only code files and their changed lines, the same window gives **4.25 / 5.22 / 5.95 under the drop rule and 5.90 / 6.40 / 7.04 under the cap rule**, monotone increasing in project size in both. **Effect on the conclusion:** the qualification that throughput per unit of text holds up is classifier-dependent, and under a defensible alternative it reverses into a forty percent penalty from smallest to largest project. The claim should not be relied on. What survives in every variant is that the effect is small relative to the two-to-three-fold latency effect on a single change.

**C5. The priced fix-share drop is about ten points, not twelve, and the pooled row is confounded.** Independently, pooled over the three trees with the same three-week and two-week windows: 36.2 percent before, 26.4 after, a fall of 9.8 points against the reported 12.3. More important than the magnitude: across the boundary the commit mix shifted toward small files, from 21.4 percent of before-commits under 792 lines to 25.9 percent after, which lowers a pooled fix share on its own. The report's stratified rows are not exposed to that; its pooled row is, and the pooled row is the one quoted in the Implications and in recommendation 4.

**C6. Recommendation 7 names an archive confirmation the pipeline does not put.** `skills/archive/SKILL.md:201` reads "Confirm via `AskUserQuestion`, except inside the full cleanup pipeline. A tier-1 run performed as Step 4 of a full `/fusion:cleanup` skips this step". `skills/cleanup/SKILL.md` Step 4 agrees from its side. The prompt exists only on a targeted `--only archive` run the user chose to start. **Effect on the conclusion:** one of the two costs the recommendation proposes to move does not exist on the path it names, and the arrangement it reaches for, a single stop held at Step 6, is the one the pipeline already has. Filed as `260909-1348_*_recommendation-7-names-an-archive-confirmation-the-cleanup-pipeline-does-not-put.md`.

**C7. Finding 17's Setup exemplar is inverted.** Three agents name all three record stores inside their `## Setup`: `analyst`, `coderev`, `consultant`. `reconciler`, the one the report names, names two there; its `$SCAN_DECISIONS` reads sit under `## Reconciliation Process`. And `bugfixer` does name `$SCAN_ISSUES`, at `agents/bugfixer.md:51`, so only `editor` names none. The finding's direction holds, since twelve of fifteen agents name no store in Setup. The hedge that follows does not hold for the agent named: `agents/reconciler.md:67` says "Read the **live** records under every directory each of these names", not skim. Filed as `260909-1349_*_finding-17s-setup-pointer-claims-name-the-wrong-agents.md`.

**C8. unite-co-creator's issue totals.** The report gives 1768 filed, 1284 closed, 444 open, 25 percent. Counting that project's legacy `closed-issues` directory as well, the figures are 1853, 1408, 445, 24 percent. The monotone ordering across the three projects, 5.5 / 11.0 / 24.0 percent, is unaffected.

**C9. The lifetime corpus figures for unite-co-creator.** The Sources section gives 4793 files and 36.6 MiB. Measured at the pin: 4967 stamped record files and 38.5 MiB, plus 1056 unstamped Markdown files at a further 10.1 MiB. fusion's 2607 files and 19.3 MiB and krk's 2128 and 16.4 MiB are exact.

**C10. Finding 18's gate figures.** The report gives 279 gate events across 43 sessions carrying a session identifier, 45 before the first production dispatch and 94 after the last. Pooling `gate_hit` and `gate_response` rows across the three logs and classifying against each session's first and last production dispatch: 290 classified events, 45 before, 139 between, **106 after**, an after-share of 37 percent rather than 34. Sessions carrying an identifier number about 53 rather than 43, of which 26 rather than 17 ran no production dispatch. In fusion's log alone the after-share is 50 percent. **Effect on the conclusion:** the finding is understated, not overstated. The honest range is a third to a half.

**C11. History is the largest record kind by bytes, not by the figure cited.** Recommendation 1 calls session ceremony "the largest single record kind in fusion's own workbench at 29 percent of bookkeeping time", but finding 7's own table puts issues at 29.0 percent as well, a tie. By record bytes in the window, history is 36.6 percent of fusion's record volume against issues at 27.4, and is unambiguously the largest. The claim is true; the number quoted for it does not establish it.

**C12. Finding 4 replicates in two projects of three.** The report says the error-rate gradient is "also replicated three times" and then concedes that krk's fourth quartile sits below its third. Independently, krk's lift from the smallest to the largest quartile is **+1.2 points pooled and minus 2.4 points weighting each file equally**, with the peak at the third quartile. fusion gives +11.9 and unite +6.9 pooled. Two replications and one null is the accurate description.

**C13. The pooled stratification's sample size is not reproducible.** Finding 14 works over "all 3353 source-touching commits from the three projects". Counting only code extensions gives 2355; adding structured data gives 2848; additionally counting non-workbench Markdown gives 3481. The report's figure sits between the last two, which implies its source class includes fusion's own agent prompts, rule files and README text. That is defensible for fusion, whose product is that text, and it means fusion's source-commit denominator in findings 1 and 3 is not the same kind of thing as unite-co-creator's.

**C14. Two of the eleven pre-flight steps are genuine prerequisites.** Recommendation 6 says of Step 0 and Steps 0b through 0k that "none of them needs to run before the first dispatch". Step 0 writes `fusion-workbench/.fusion-setup`, the marker every agent walks up to find and halts without. Step 0d places the stylometric profiles, one of which `bin/fusion-rules` emits into every dispatch. The other nine are as described.

### Unverifiable

No source tree was unreachable, so nothing rests on a source I could not open. Six things could not be checked, and none should be read as confirmed.

**U1. The report's own classifiers.** Neither the source-file class, nor the record class, nor the choice between capping and dropping a long interval is stated anywhere in the report. Every figure in findings 1, 3, 4, 5, 7, 14, 15 and 16 depends on all three. I reproduced directions everywhere and values only where the choice happened to coincide. A reader cannot re-run any of it from the text.

**U2. The rank correlations.** The +0.99 in finding 13 and the correlation panel under it were not recomputed. They are the report's own argument that a time series decides nothing, so a fault in them would weaken a caveat rather than a claim, but they are unchecked.

**U3. Finding 9's meta share for fusion.** Independently classifying each issue record by the paths it cites gives 74.6 percent for fusion under one path rule and **31.4 percent under an equally defensible one** that treats fusion's shipped prompts and rules as source, because in this repository they are the product. Forty-six percent of fusion's issue records move between the two. krk at 24.5 percent and unite-co-creator at 17.9 move by six percent under the same variation and are trustworthy. The report's 67 / 15 / 11 is directionally right where it matters, in the two consuming projects; its fusion cell is not a number.

**U4. The token estimate.** "On the order of 19 million tokens" is labelled an estimate in the report and was not checked.

**U5. The latency half of finding 15.** The report already says the latency reading there is weaker than the fix-share reading and should not be quoted alone. Independently it is weaker still: the pooled median falls from 23.7 to 22.3 minutes capped and from 21.5 to 15.7 dropped, so its size depends entirely on the interval rule.

**U6. The subjective report in finding 18 is testimony, and the passage promotes it.** "The user and a second person on the same projects report the overhead as friction throughout" is correctly presented as a report. The sentence that follows, "Four measurements bear on that, and they agree", then counts the phase ledger, the step count, the gate placement and the ramp-up timing as four measurements agreeing with a report, which reads as five converging observations. There are three measured quantities plus one count, and one testimony. The testimony is not evidence about where the cost sits; it is evidence about where it is felt, which is a different and also useful thing.

### Overreach

**O1. "Roughly eightfold over five months in every project at once" is about one project, and there it is about 3.6-fold.** unite-co-creator carries 1056 unstamped Markdown files under its workbench, and **337 of them carry the pre-2026 `MMDD-HHMM` stamp the report's rule does not match. Their months are April 298 and May 39, and no other month.** 305 are history files. April's record count goes from 253 to 551 and April's rate from 0.74 to roughly 1.6, which turns the 0.74-to-5.80 rise into roughly 3.6-fold, or 3.0-fold measured to August rather than to nine days of September.

The "in every project at once" half does not hold either. fusion's series begins at 0.00 in May because fusion had no workbench then, so its rise is an adoption ramp, not a growth curve. krk exists only from 2026-08-02 and its two months **fall**, 4.98 to 3.74. The report's defence, that filename stamps make the trend independent of when each project began tracking its workbench, removes the git-tracking confounder and not the adoption confounder, which is the one that bites.

**Strongest form the evidence carries:** in the one tree with enough history, bookkeeping per source-touching commit roughly tripled between spring and late summer 2026, and it reached a comparable level within a month in a project that adopted fusion from nothing. Filed as `260909-1347_*_the-eightfold-bookkeeping-rise-excludes-337-legacy-stamped-records-from-the-two-anchor-months.md`.

**O2. Neither of the two designs breaks the tie, and the report says so in its caveats while claiming otherwise in its headlines.** The request asked specifically whether the two designs named in the summary actually separate fusion's load from project growth. They do not.

*The stratification, finding 14.* Its row variable is a fusion-load band assigned to a commit by its date. Because the load moved with the calendar and so did file size, the rows are date bands in disguise. Re-derived on a proxy banding, the median largest file touched rises from 672 to 739 to 1285 lines across the three date bands and the cell mass concentrates in the band-three, large-file corner, 642 commits of 2355 against 164 in the light band. The column effect is clean, because file size varies inside a single week. The row effect is not, and the report's own text concedes it: "The row effect is a bundle, and this table does not attribute it to the rule set alone." The summary at the top of the report nonetheless says the conditioning load "drives the same two outcomes, by a comparable factor", and finding 14's heading says "both effects are real". The multiplication to a factor of 3.9 is size times calendar, not size times load.

*The 2026-08-27 event, finding 15.* This is the only design that could break the tie, and it is one uncontrolled before-and-after with five features that each weaken it. The windows are of unequal length, 21.0 days against 13.6. The commit rate more than halves across the boundary, 36.4 to 16.2 source commits per day. The size mix shifts toward small files, which lowers a pooled fix share unaided. Per-project after-window counts are 64 to 84, giving a binomial band of roughly five to six points on each. And the decisive one: **the effect is absent in krk**, minus 0.6 points independently and minus 1.9 in the report, and krk is the single project whose median file size *rose* across the boundary, from 2966 to 4403 lines. The two projects that improved are the two whose work moved to smaller files or stayed where it was. That is the pattern a pure file-size effect predicts with no rule effect needed at all.

The stratified table does not remove this, because stratifying pooled commits by size band does not hold the project mix inside a band constant: unite-co-creator moved down into the small strata across the boundary while krk moved up.

**Strongest form the evidence carries:** across the one boundary where fusion's conditioning load fell, the fix share fell in the two trees whose work moved to smaller or unchanged files and did not fall in the tree whose work moved to larger ones. That is consistent with a conditioning-load effect and equally consistent with a file-size effect. The conditioning load is a candidate the data does not exclude. It is not an established driver, and no figure in these three trees prices it.

**O3. "The bookkeeping is a constant of the method" is right about the level and wrong about the constancy.** Finding 1 is the report's most robust result and it holds under every classifier. But the report reads it as a constant "of the method at its current version", and its own finding 2 has the level moving with the calendar. The level is a constant across project size at a moment in time. It is not constant over time, and the honest statement is that project size does not predict it while the method's own version does.

**O4. Findings 3 and 4 are about the file, and the report's summary says so; the cross-project rows do not add to that.** The August cross-section, 16.3 / 19.3 / 27.2 minutes monotone in project size, is three observations of three projects that differ in language, domain, team and age. It is offered as agreement with the within-project quartile result. Three points cannot corroborate a gradient. The quartile replications, which have hundreds of commits behind them each, carry the finding on their own, and finding 16 says correctly that file growth rather than total size is the part that matters.

### Missing

Five costs the same sources support and the report does not name. The first is the one most likely to misaim a cut.

**M1. The 2026-08-27 cut has already been undone, and by more than it removed.** `265a86fb` recorded a coder dispatch's rule block at 65 944 bytes; re-derived by running that commit's own script and sizing each file at that commit, the figure is exactly 65 944. At the pin, thirteen days later, `bin/fusion-rules coder` emits **85 175 bytes, a rise of 29.2 percent**. Two sources: `fusion-workbench-conventions.md` regrew 8911 bytes, from 49 851 back to 58 762, above where the partition had cut it; and `bounded-dispatch.md`, 9162 bytes, arrived on 2026-09-08 as a conditional emission to seven agents including `coder`.

**M2. There is already a growth instrument, and it bounds the wrong quantity.** `hooks/lib/__tests__/rules-emission-golden.test.ts` arms a hard bound of `GROWTH_BUDGET = 12_000` bytes over a `RULE_BASELINE` floor of 65 498 for the universal core. At the pin the core is 73 317 bytes, so **7819 of 12 000 bytes are consumed, 65 percent, with 4181 left**. Two structural facts follow. The baseline holds the 2026-08-14 arming sizes and was never re-based after the 2026-08-27 cut, so that cut silently created headroom the following fortnight spent. And everything role-specific only reports and never fails, which is why `bounded-dispatch.md` and `circle-records.md` grew outside it. Recommendation 4 asks for a second cut and names no instrument, no baseline and no headroom. Filed as `260909-1346_*_the-rule-growth-bound-covers-the-core-while-the-hottest-path-grew-29-percent-back.md`.

**M3. `circle-records.md` is the largest single growth in the emitted corpus and sits on every session's path.** Baseline 9302 bytes, at the pin **28 124, a factor of 3.0 and plus 18 822 bytes**, larger than the entire 2026-08-27 cut. It is emitted to `orchestrator`, `playmaker` and `shaper`, so it is charged to every session through the orchestrator. It is outside the hard bound. The report's finding 12 tracks the whole `rules/` directory and the always-on floor and never looks at the conditional emissions, where the growth actually went.

**M4. The mean agent prompt is not the prompt a dispatch carries.** Finding 11 uses 27 810 bytes, the mean of fifteen. `orchestrator.md` is 155 302 bytes, 37 percent of all agent text, and the other fourteen average **18 703**. The per-dispatch ledger therefore overstates a typical sub-agent by about 49 percent and understates the orchestrator by a factor of 5.6. Finding 18's phase ledger uses the real per-agent figures and is unaffected; finding 11's is not.

**M5. Three quieter costs the corpora show.**
- Plan files are 2 percent of records and 12 to 21 percent of record bytes, at a mean of 57 to 76 KB each. fusion's six live plans are 300.6 KiB, a third of the whole store a dispatch is pointed at. The report measures the store and never names its fattest artifact.
- History files outnumber dispatches. fusion filed 950 history records in the window against 524 `task_start` rows in the whole log, so the per-dispatch framing in recommendation 1 understates the object it proposes to replace.
- Dispatch minutes overlap. Summed pair durations exceed the wall-clock union of the intervals by 1.20 to 1.72 times, and five outlier pairs of 335 to 426 minutes carry about 1787 minutes between them. Finding 8's shares survive this; the absolute hours in its pie do not.

**M6. Finding 17's diagram contradicts finding 11 on unite-co-creator.** The flowchart puts the rule set at "74.2 KiB, the same in all three projects". Running the helper with cwd in each project, the coder emission is 85 175 bytes in fusion and krk and **126 656 in unite-co-creator**, which carries four project-side rule files including a 23 901-byte `RULES-INDEX.md`. Finding 11 has this right at 124 KB. The two statements are 40 percent apart. Combined floors per coder dispatch are 178 607 / 155 444 / 138 113 bytes: within 30 percent of each other despite opposite structural choices about where a project puts its conditioning text, which is itself a result the report does not draw.

## Implications

**The report's spine holds and its causal claim does not.** Finding 1 survives every test applied to it: bookkeeping per source-touching commit does not vary with project size, at three orders of magnitude of size. Finding 18 reproduces to the byte and is the most reliable section in the document, because it counts bytes and steps rather than inferring effects. Finding 7's wall-clock model reproduces to within four hours in 976. What does not survive is the claim that fusion's conditioning load is an established driver of the error rate. It is a candidate the data does not exclude, and the one event that could have priced it is confounded by exactly the variable the report elsewhere shows to be strongest.

**The cut is aimed at a corpus that has already grown back.** The single most decision-relevant fact in this verification is not in the report. Thirteen days after the cut the report prices at twelve points of fix share, the path it cut is 29 percent heavier than it was at the bottom, the instrument meant to hold it has spent 65 percent of its headroom, and the largest growth is in a file the instrument does not measure. A cut that removes bytes without changing what bounds them buys a fortnight.

**The ceremony findings are the safe ground and the causal findings are not.** Everything in finding 18 is a count. Everything in findings 13 to 16 is an inference from a confounded design. A specification that rests on the first will be aimed correctly whether or not the conditioning load turns out to matter. A specification that rests on the second is betting on an effect this evidence cannot separate from file size.

## Recommendations

1. Treat findings 1, 7, 11 and 18 as established and build on them. Treat findings 13 to 15 as one candidate hypothesis with a confounded test behind it.
2. Before sizing any cut, re-measure the emitted set per agent rather than the always-on floor. The floor is 74.2 KiB; the path a coder dispatch actually reads is 83.2 KiB, and the orchestrator's is 128.3.
3. Whatever the cut removes, decide in the same act what bounds the corpus afterwards and against which quantity. The existing bound measures the universal core; the growth went to the conditional emissions.
4. Do not carry the "eightfold" figure, the "108 KiB peak", the "24 KiB cut", the "12 percentage points" or the "not ordered by size" qualification into a specification. Each is corrected above.

## Bottom line

After the corrections above, the evidence says three things plainly enough to specify against.

**Where the load sits is measured and not in dispute.** A full closing reads 951 KiB of instruction text against 184 for the one productive dispatch it wraps, a ratio of 5.2 to 1, and yields no artifact the user asked for. A ramp-up reads 425 KiB across sixteen numbered steps, eleven of which check the local installation rather than the project, and takes a median 72 to 85 minutes to the first production dispatch. Between a third and a half of all questions put to the user fall after the last production dispatch. About half of the sessions carrying an identifier, 26 of 53, ran no production dispatch at all, and the closing does not shrink for them. Every one of those is a count of bytes, steps or rows, reproduced independently, and none of it depends on any causal claim.

**Where the bookkeeping load comes from is settled in one direction only.** Project size does not set it: three projects spanning zero to 768 thousand lines pay within ten percent of each other per source-touching commit, under every classifier tested. That is the report's strongest result and it holds. What the load does track is the method's own version, and there the measured rise is roughly threefold rather than eightfold in the one project with the history to show it. History files and issue records are 60 to 64 percent of record bytes in all three projects, and history alone is the largest single kind at 33 to 37 percent.

**Where the errors come from is not settled, and one of the two candidates has already regrown.** The file being edited moves both latency and the fix rate, replicated in two of three projects with hundreds of commits behind each, and it is the size of the file rather than the size of the project that carries it. The conditioning load is a candidate that the data does not exclude and does not establish: its only test is one before-and-after in which the projects that improved are the projects whose files got smaller, and the project whose files got larger did not improve. Meanwhile the corpus that test was about is 29 percent heavier than it was at the bottom of the cut, thirteen days later, and the instrument meant to hold it has 4181 of 12 000 bytes left and does not measure the two files that grew.

**What a cut should aim at, in that order.** First the closing and the ramp-up, because they are the largest measured cost, they carry no causal assumption, and their expense is a fixed procedure rather than a variable one. Second the per-commit record obligation, because it is uniform at 4.4 to 6.3 records per source-touching commit regardless of what the commit did, and because history is the fattest kind and has no demonstrated reader. Third, and only with a bound attached, the conditioning corpus: cutting bytes there without changing what bounds them and against which quantity buys a fortnight, which is what this repository's own last thirteen days demonstrate.

## Filed Issues

- `260909-1345_*_the-size-analysis-understates-the-always-on-peak-and-the-august-cut.md` (C1, C2)
- `260909-1346_*_the-rule-growth-bound-covers-the-core-while-the-hottest-path-grew-29-percent-back.md` (M1, M2)
- `260909-1347_*_the-eightfold-bookkeeping-rise-excludes-337-legacy-stamped-records-from-the-two-anchor-months.md` (O1)
- `260909-1348_*_recommendation-7-names-an-archive-confirmation-the-cleanup-pipeline-does-not-put.md` (C6)
- `260909-1349_*_finding-17s-setup-pointer-claims-name-the-wrong-agents.md` (C7)

## Sources

- The three git trees at `a1ecf86e`, `68b76de6` and `0cc2214c2`, read with `git log --no-merges --numstat`, `git ls-tree -r -l` and `git cat-file -s`. Nothing was read from a working tree except `bin/fusion-rules`, which is a live program.
- The always-on byte series: per-commit extraction of the unindented `emit_if_exists` lines from `bin/fusion-rules` over the 202 commits touching that file or `rules/`, each named file sized at that commit.
- `bin/fusion-rules` run for `coder`, `orchestrator`, `analyst`, `reconciler`, `curator`, `playmaker` and `coderev`, and the 2026-08-27 script reconstructed from `git show 265a86fb:bin/fusion-rules` and run against that commit's file sizes.
- `hooks/lib/__tests__/rules-emission-golden.test.ts` for `RULE_BASELINE` and `GROWTH_BUDGET`; `hooks/lib/__tests__/helpers/growth-bound.ts` for the re-baselining rule.
- `skills/setup/SKILL.md`, `skills/cleanup/SKILL.md`, `skills/archive/SKILL.md:201`, `agents/*.md` at the pin.
- The three `fusion-workbench/orchestrator-events.jsonl` files, read at the pin for the record and dispatch figures and at the working tree for the pooled gate placement.
- The report under review, `260909-1047-size-versus-bookkeeping-across-three-projects.md`, read in full and not edited.

## Open Questions

- [ ] What quantity should bound the conditioning corpus. The instrument bounds the universal core; the growth went to the conditional emissions and to one file that tripled. This is a decision, not a plan.
- [ ] Whether the conditioning load affects the error rate at all. The one natural experiment is confounded by file size in the direction that explains the whole result. Answering it needs a cut whose timing is chosen independently of a release round, with the file-size distribution measured on both sides.
- [ ] Whether the report's classifiers can be recovered. Its source class appears to include fusion's own Markdown product, which makes fusion's per-commit denominators incommensurable with the other two projects'. Until that is stated, findings 1 and 3 compare unlike units, even though finding 1's conclusion survives the ambiguity.
- [ ] Whether unite-co-creator's 337 legacy-stamped records should be readmitted to the corpus for any future trend measurement. They are genuine records and they sit entirely in the two months that anchor the trend.

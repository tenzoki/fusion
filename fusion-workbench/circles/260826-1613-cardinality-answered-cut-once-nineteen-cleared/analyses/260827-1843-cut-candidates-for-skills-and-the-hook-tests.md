# Analysis: cut candidates for `skills/` and the hook tests

**Date:** 2026-08-27 18:43
**Type:** Feasibility / Impact
**Status:** Complete
**Requested by:** orchestrator (Circle `260826-1613-cardinality-answered-cut-once-nineteen-cleared`, plan step 21)
**Filed by:** analyst, Kai Stalmann <kai@qantr.com>

## Question

Two of the four growth-bounded surfaces cannot take a single plan step: `skills/` has 88 bytes free and the hook tests have 1 line free. How many bytes and how many lines do the steps that spend them need, once the thirteen open C4 records the user pulled into scope are counted too, and which cuts pay for them, ranked by what the project loses rather than by what they free?

## Scope

Read: `skills/setup/SKILL.md` and `skills/archive/SKILL.md` in full; `skills/cleanup/SKILL.md` Step 4 and Step 8; the section byte map of every `skills/*/SKILL.md`; `hooks/lib/__tests__/helpers/growth-bound.ts`; the baseline maps and head rooms in `surface-growth-bound.test.ts` and `rules-emission-golden.test.ts`; every comment block of fifteen lines or more under `hooks/lib/__tests__/` (listed by a script, the largest twenty read in full); the four C4 reserve candidates at their current lines; `guard-state-shape.test.ts`, `hooks-wiring.test.ts`, `guard-bash-integration.test.ts:233-304`, `fusion-identity.test.ts:1-90`, `monitor-warnings-panel.test.ts:1095-1136`; the C4 analysis `260826-0715-cut-candidates-for-two-growth-bounded-surfaces.md`; plan steps 5, 12, 18b, 19, 20, 21 and `## Current State`; the thirteen open C4 records; the five shared records behind steps 5, 12, 18, 19, 20; decisions `shared/decisions/260825-1030_a_*` (both) and this Circle's `260827-1756_*_which-citation-corpus-does-the-archive-safety-filter-protect.md`; `rules/workbench-tracking.md` `## The four classes`; `rules/orchestrator-resume.md`.

Not read: `skills/next/SKILL.md` Step 5b (6 470 bytes), `skills/migrate/SKILL.md` Step 4 (12 090 bytes), `skills/help/SKILL.md` daily-practice topic (5 009 bytes), and the hook-test headers not named below. They are listed under `## Open Questions` as unmeasured, not as clean.

Nothing was modified. The one measurement script and the seven draft texts live in the session scratchpad.

**Tree state.** HEAD `c599bf0`, committed 2026-08-27, branch `main`, `## main...origin/main [ahead 4]`. The working tree carries uncommitted edits to `agents/orchestrator.md` (one line, same byte length as at HEAD: 148 386 both ways), `fusion.json`, `templates/fusion.json`, `activity-log-k1.md` and the regenerated `hooks/lib/__tests__/fixtures/surface-growth.golden`, which is bundle B's step 13 in flight. `skills/`, `hooks/lib/__tests__/` and `rules/` are byte-identical to HEAD, so every figure below is HEAD's figure. A stray untracked `circles/` directory sits at the repository root; it is outside every bound and was not opened.

## Findings

### 1. The four bounds, re-measured at `c599bf0`

Measured with the gate tests' own readers: `statSync().size` over `agents/*.md` and `skills/*/SKILL.md`, newline count over every `.ts` under `hooks/lib/__tests__/` recursively, byte size over the three core rule files, and the baseline maps parsed out of the two test files.

| Surface | Floor | Head room | Budget | Current | Free | At `0fb5085` |
|---|---|---|---|---|---|---|
| `hooks/lib/__tests__/` (lines) | 17 875 | 2 500 | 20 375 | 20 374 | **1** | 1 |
| `agents/` (bytes) | 399 843 | 18 000 | 417 843 | 403 964 | 13 879 | 14 204 |
| `skills/` (bytes) | 220 439 | 20 000 | 240 439 | 240 351 | **88** | 88 |
| always-on rule core (bytes) | 65 498 | 12 000 | 77 498 | 64 535 | 12 963 | 13 213 |

Two surfaces moved since the plan's measurement, both by landed steps: `agents/` spent 325 bytes on step 2 (`agents/playmaker.md`), the rule core spent 250 on step 16. Neither is a cut surface. The two cut surfaces stand exactly where the plan read them.

Nine hook-test files carry no baseline entry, not eight as the C4 analysis counted: `fusion-events.test.ts` (166 lines) joined the list at `46de871`, after that analysis. Together the nine are 2 205 of the 2 499 lines the surface has spent. Each is the only executable coverage of a live gate or helper, so none is a candidate; shrinking any of them in place would still free one for one, which is the only way they enter the arithmetic below.

**Where `skills/` head room went**, per file (size, baseline, delta): `setup` 48 078 / 35 385 / **+12 693**; `help` +3 657; `archive` +1 684; `direct` +1 381; `next` +1 344; `migrate` +374; `commit` +65; the other five shrank (`curate` -414, `cadence` -321, `memo` -316, `cleanup` -158, `log-activity` -77). The 19 912 bytes spent are 64 % one file.

### 2. The need, sized once

#### 2a. `skills/` bytes

Each step's text was drafted in the scratchpad and measured with `wc -c`; what it replaces was measured on the shipped line. The drafts follow the answered decisions and the records' own proposed lines. The executor's drafts will differ, so the total carries a stated margin.

| Step | Site | Draft (bytes) | Replaces | Net |
|---|---|---|---|---|
| 5 | `skills/setup/SKILL.md`, new Step 0j: `git check-ignore -q` per R2/R3 entry, negation line appended; `git ls-files` per class L entry, reported; `.checkout-id` untracked via `git rm --cached` per decision `260825-1030_*_may-a-project-depart…` `## Answer`; one Done-report clause | 2 390 + ~120 | nothing | **~2 510** |
| 12 | `skills/archive/SKILL.md` filter 3 rewritten as the positive corpus enumeration with existence guards (R5 option 1); Step 4's grep over `$CORPUS`, naming the citing file; heading, guardrail and manifest wording | 839 + 725 + ~80 | 324 + 399 | **~920** |
| 18b | `skills/setup/SKILL.md` Step 3: the probe covers `escalation.json`, `churn.json`, `state-drift.json` and the question lists what was found (the three phrases `legacy-halt-clearing.test.ts:180-213` pins survive); Step 2: one guarded block naming `bin/` executables absent from `$FUSION_PLUGIN_ROOT/bin/` in this repository | 816 + ~150 + 580 | 513 | **~1 030** |
| 20 | `skills/archive/SKILL.md`: Tier 1 first row, a new filter 2 bullet, an open-record count per terminal Circle in Step 3, a report line in Step 5; `skills/cleanup/SKILL.md` Step 4 one sentence | 1 330 + 144 | 148 | **~1 330** |
| C4 `260826-1112_*_the-setup-skill-points-at-the-orchestrator-prompt-with-an-unrooted-path-the-body-forbids.md` | `skills/setup/SKILL.md:352` and `:480`: `$FUSION_SRC/` rooted on both citations | 24 | nothing | **24** |
| C4 `260826-1113_*_the-setup-skill-calls-the-id-fragment-the-pair-in-the-commit-that-removed-that-word-elsewhere.md` | `skills/setup/SKILL.md:352`: "the pair" becomes "the fragment", and the `session_id` half is named (one sentence, drafted with 1112's rooting) | 260 | 88 | **172** |
| | | | **Total** | **5 986** |

**Need on `skills/`: 5 986 bytes drafted, 5 898 after the 88 free. The cut should clear at least 7 000**, because a drafted text and a landed one have differed by 10 to 20 % on every step this Circle has measured (step 2 was planned under +600 and landed at +325; step 16 at about 250 as planned).

Two of the thirteen C4 records touch `skills/` and are counted above. The other eleven spend nothing there: `260826-1114_*_the-event-log-contract-says-a-half-in-the-sentence-that-now-governs-three-fields.md`, `-1115`, `-1219` are `agents/` edits of a word each (13 879 free); `260826-0154_*_the-reference-pin-shaped-a-comment-away-from-naming-a-path-and-the-vagueness-is-the-gates-doing.md`, `-0158`, `-0805` are directions or a closure-note clause; `260826-0847_*_the-session-id-row-assertion-sits-in-the-state-load-suite-because-that-was-the-only-permitted-file.md`, `-0848` and the three `-0906` are hook-test lines, sized in 2b.

#### 2b. Hook-test lines

| Item | Basis | Lines |
|---|---|---|
| Step 19, seven dispatch cases and three `fusion-commit-lock` cases | The record's own measurement of the suite it wrote and removed (`shared/issues/260827-0410_o_*`, "They measured 285 lines"). The removed file is in no commit, stash or reflog, so it cannot be re-measured; a re-derivation from the harness gives 240 to 285 (seven `withProject` cases at the 15 to 30 lines `guard-bash-integration.test.ts:233-304` spends per case, plus three git-fixture cases at about 25, plus a header). The measured figure is used. | **285** |
| C4 `260826-0847_*_the-session-id-row-assertion-sits-in-the-state-load-suite-because-that-was-the-only-permitted-file.md`, move the `session_id` block | `guard-state-shape.test.ts:262-287` (26 lines) moves to `guard-bash-integration.test.ts`; the apologising header section `:83-91` (9 lines) goes; the fixture the record names (`withGap`, `reviewLands`) either moves or the assertion narrows. Net between -9 and +10. | **+10** |
| C4 `260826-0848_*_the-fourth-sessionstart-command-is-asserted-by-nothing-and-its-own-suite-warns-about-exactly-that.md`, two cases in `hooks-wiring.test.ts` | One `.some()` wiring assertion in the shape of `:93-103` (about 10 lines); one spawn of `dist/session-id.js` with three payloads (present, absent, empty), asserting bare stdout and empty stdout, with a spawn helper (about 35). `session-id.ts` runs `main()` at load, so there is no in-process form (`260826-0906_*_the-events-query…`, last section). | **45** |
| C4 `260826-0906`, the harness replace property | Three lines, the record's own count: a `files` entry keyed on a seeded path, asserted to have replaced it. | **4** |
| C4 `260826-0906`, the events-query entry point | Six cases the record enumerates (`turns` under both `scope=` values; `presence` at identity exit 3 and 4; `turns` with no `agentstate.yaml` and with no `history_file`), spawning `bin/fusion-events` against a throwaway workbench in the shape `fusion-identity.test.ts` uses (fixture and run helpers about 40 lines there; six cases at 8 to 12). | **100** |
| C4 `260826-0906`, the monitor's whole-file parse | One generated fixture longer than `MAX_EVENTS` (a loop, not literal rows), one case; `startMonitor` and `seedWorkbench` exist at `monitor-warnings-panel.test.ts:1112-1126`. | **30** |
| | **Total** | **474** |

**Need on the hook tests: 474 lines, 473 after the 1 line free. The cut should clear at least 500.** The estimate for the five C4 records is 189 lines with a plausible range of 150 to 230; only step 19's figure was measured.

### 3. The arithmetic every candidate below respects

Verified again from `helpers/growth-bound.ts:100-117`, unchanged since the C4 analysis. `floor` is the baseline summed over the files present; a shrink in place frees one for one because the floor holds; deleting a baselined file frees only size minus baseline, and the stale-entry assertion forces the entry out in the same commit. Every candidate below is a shrink in place. **No baseline moves** (`shared/decisions/260822-1154_o_*` recommends option 1 and step 22 follows it). After the cut, `surface-growth.golden` is regenerated with `UPDATE_SURFACE_GOLDEN=1` and the run repeated without it.

### 4. `skills/` candidates, ranked by loss

Every span is a line range of the file at HEAD, measured with `sed -n | wc -c`. "Keeps" is the estimated replacement. The ranking puts second copies of text that stands elsewhere first, rationale that exists in a cited record second, and reasoning written after a real failure last.

| # | Candidate | Span bytes | Keeps | Frees | What is lost |
|---|---|---|---|---|---|
| S1 | `skills/setup/SKILL.md:373-406` Step 1, the interrupted-session procedure | 3 316 | ~600 | **~2 700** | Nothing. `rules/orchestrator-resume.md` (4 699 bytes, partitioned 260827-1210_*_do-the-rare-orchestrator-flows-stay-in-every-sessions-context.md) carries the same procedure, the same bash block and the same `scope=checkout` sentence (`:28`). The skill inlines a third copy. Keep the "STOP, do not proceed" line and a pointer read through `$FUSION_SRC`, the way Step 2 already points at the Turn-budget block. Two C4 records cite `skills/setup/SKILL.md:394` as one of five sites stating the `turns=0` rule (`260826-1115_*_the-converted-reconciler-site-drops-the-turns-zero-is-a-real-figure-clause-the-other-four-carry.md`); after the cut that site is the rule file, and the count of sites drops by one, which those records should say. |
| S2 | `skills/archive/SKILL.md:139-153` "Rolling the guard event log" | 2 274 | ~700 | **~1 550** | Nothing material. The four paragraphs restate `rules/workbench-tracking.md` `## The four classes` (its last two paragraphs) and decision `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`, and the skill reads that rule in full at Step 1 before any of this applies. Keep the destination path, the "rolled not selected" sentence and the two citations. The plan's seed measured `:137-153` at 2 452; that span includes the Tier 1 table row at `:137`, which stays. |
| S3 | `skills/setup/SKILL.md:183-252` Step 0e, the asset comparison | 6 762 | ~4 700 | **~2 000** | Redundancy only. Three bash blocks (`:191-207`, `:227-236`, `:240-249`) each re-resolve `$SRC` and re-open `$PROV` with identical lines; the replace and stamp blocks can be one block with a mode. The eight-case list `:209-218` (2 319 bytes) says each case twice, once in the list and once in the paragraph above it. The cases, their precedence and the one-question rule stay. |
| S4 | `skills/archive/SKILL.md:71-75` the `shared_of` explanation | ~1 300 | ~400 | **~900** | The prose derivation of invariant 2, which `rules/fusion-workbench-conventions.md` `## Path Resolution` states and the code comment at `:61-63` already summarises. Keep the "empty derivation is an error" rule; it is the `HYG-NO-SILENT-FAIL` clause. |
| S5 | `skills/setup/SKILL.md:28` and `:32` the two `$FUSION_SRC` paragraphs | 838 + 887 | ~700 | **~1 000** | Half the reasoning for the read/run split. The split rule itself (read shipped text at `$FUSION_SRC`, run or copy at `$FUSION_PLUGIN_ROOT`) stays; the history of decision `260820-2324` and part (c) of `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` reduce to citations. |
| S6 | `skills/setup/SKILL.md:58-62` the three probe-bound paragraphs of the pre-v4 check | 1 972 | ~600 | **~1 400** | Real. Each paragraph was written after a measured deadlock (a probe reaching archived bracket-marker files, a probe matching `notes [draft].md`). The bounds themselves stay in the `find` and `grep`; what goes is why. Taking this candidate means a future editor widening the probe meets the deadlock again unless the commit message and a record hold the reason. Rank last of the six; take it only if S1 to S5 fall short. |
| S7 | `skills/archive/SKILL.md:235` the mv-then-truncate paragraph | 741 | ~250 | **~500** | Low. The ordering argument (`emitEvent` opens and closes per call; the monitor treats absent and empty alike) compresses to two clauses. |
| S8 | `skills/setup/SKILL.md:83-88` the three layout notes after `mkdir` | 1 213 | ~400 | **~800** | Low. All three restate `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, which the paragraph already cites. |

**Total: about 10 850 bytes** against a need of 5 986. **S1, S2 and S3 alone free about 6 250**, which clears the drafted need with the 88 free but not the 7 000 recommended; **S1 to S5 free about 8 150**, which does. S6 to S8 are the reserve.

What the C4 analysis said about `skills/` still holds: nothing here was a candidate then because nothing spent the surface. The one structural observation is that `setup` grew 12 693 bytes over its baseline and holds every candidate but S2, S4 and S7. Cutting it back is what the surface asks for, and the three second copies (S1, S2, S8) are the cuts that improve the text.

### 5. Hook-test candidates, ranked by loss

The C4 reserve first, re-verified at HEAD (candidates 1 to 4 of that analysis were taken at C4's closure; these are its 5 to 8). Then the new ones, all header prose shrunk in place. For each new one the whole block is a verified span; "keeps" is the estimated replacement and "frees" is net of it.

#### The C4 reserve, re-verified

| # | Candidate | Frees | Loss (from the C4 analysis, unchanged) |
|---|---|---|---|
| R1 | `rules-emission-golden.test.ts:1131-1153`, three `growth()` property cases | 23 | None: `surface-growth-bound.test.ts:553-586` asserts the same three properties on the same function. |
| R2 | `rules-voice-profile.test.ts:262-270, 281-288, 290-297`, three of five malformed-code cases | 28 | Real: case-sensitivity, prefix anchoring and region qualification are three properties of one regex. |
| R3 | `sentence-identifier-containment.test.ts:394-398, 400-406, 421-423`, three of seven import forms | 18 | Low: shapes no shipped file has. The C4 analysis counted 22; the three cases and their blank lines are 18 at HEAD. |
| R4 | `fusion-paths.test.ts:595-599`, the duplicated `OUT_MEMO` case | 5 | None: `:155-161` is the identical assertion. |

**Reserve: 74 lines** (the plan's 78 was the C4 figure before re-verification).

#### New candidates

| # | Candidate | Block | Keeps | Frees | What is lost |
|---|---|---|---|---|---|
| N1 | `guard-state-shape.test.ts:21-64` "Which state file the rows seed, and why it has changed three times" | 44 | 6 | **38** | Nothing. `helpers/guard-harness.ts:447-492`, the doc comment on `openCoverageGap`, tells the same three re-pointings with the same structural argument (staging drift's throttle holds the HEAD, coverage's holds a signature). Keep a pointer to it. The `:83-91` section goes with C4 `260826-0847_*_the-session-id-row-assertion-sits-in-the-state-load-suite-because-that-was-the-only-permitted-file.md` and is counted there. |
| N2 | `paths.test.ts:4-27` the obituary for four deleted functions | 24 | 4 | **20** | Nothing material: issue `260816-2108` and the module's own header hold it. |
| N3 | `record-counts-measurement.test.ts:9-61` the five-fault history | 53 | 18 | **35** | Low: each of the five faults is cited to its own shared record on the same line, and the three things the gate does stay. |
| N4 | `commit-message-path.test.ts:138-165` "What it replaced, and why a word list could not do this job" | 28 | 6 | **22** | Low: the retired keyword exemption is issue `260811-1149_*_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md`; keep the one-sentence reason the allow-list is exact. |
| N5 | `commit-message-path.test.ts:86-119` "Why it reaches the predicate and not `classify`" and "What dropping the scoping costs" | 34 | 12 | **22** | Low to medium: the two-questions distinction is the file's design and the kept twelve lines state it; the worked example of the store-owned path is what goes (issue `260811-1410_*_the-commit-message-path-gate-narrowed-with-the-classifier-it-reuses-and-no-longer-catches-a-prescription-inside-a-store.md`). |
| N6 | `plan-stopping-section-lint.test.ts:16-25, 41-58` the "not the mistake made twice" paragraph and the corpus measurement at `8e7cae7` | 28 | 8 | **20** | Low: the first is an argument about decidability that `rules/critical-stance.md` §4 now states generally; the second is a dated count (20 plans, 1 with the section, 0 live) that a reader would have to re-measure anyway. The `:59-64` paragraph saying the live corpus is empty at HEAD is dated to `8e7cae7` and stays true as a dated claim; today one `_p_` plan is live and the gate runs over it. |
| N7 | `playmaker-backlog-mandate-lint.test.ts:6-72` the Circle narrative and the five-case list | 67 | 32 | **35** | Medium: keep "WHY CASE 5 EXISTS" (`:38-56`) whole, since it is the design of the file; drop the Circle narrative (`:7-26`) to its decision citation and the case list, which the `describe` titles carry. |
| N8 | `rules-voice-profile.test.ts:8-66` the header | 59 | 30 | **29** | Low: the two environment disciplines cite the golden suite's lines; the "order this file was built in" paragraph is the one worth keeping and is kept. |
| N9 | `domain-cascade-order-lint.test.ts:13-63` the header | 51 | 26 | **25** | Low to medium: the KRK measurement (five days, four sessions) is in issue `260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md`; keep the ORDER statement and the "what this file is not" paragraph. |
| N10 | `reference-resolution-lint.test.ts:21-70` the header | 50 | 32 | **18** | Low: the three-class grammar is authored in `helpers/citation-scan.ts` (the header says so at `:29-31`); the class descriptions compress to one line each. The `BASELINE` re-approval log at `:441-478` is not touched; it is the same class as the movement logs the C4 analysis lists as do-not-cut. |
| N11 | `helpers/citation-scan.ts:388-418` the shape-2 alternative and "the same cost on the Circle-record form" | 31 | 10 | **21** | Low to medium: both records are cited on the lines (`260819-2213`, `260819-2300_*_circledirs-did-not-learn-the-archive-prefix-that-findrecord-did-so-an-archived-circle-directory-stays-unexpressible.md`); keep the one sentence stating the prefix tolerance and its cost. |
| N12 | `config.test.ts:21-57` the header | 37 | 20 | **17** | Low: the "what it no longer measures" paragraph is history of the removed plugin layer. |
| N13 | `sentence-identifier-containment.test.ts:1-66` the header | 66 | 42 | **24** | Medium: keep the set relation, "NOT a blacklist", and "WHAT IT DOES NOT COVER"; drop the paragraph on the completeness assertion's reach, which the foot's `describe` titles state case by case. |
| N14 | `monitor-warnings-panel.test.ts:16-53` the header | 38 | 22 | **16** | Low: the advisory-burst history compresses; the port-handling paragraph stays. |
| N15 | `rules-emission-golden.test.ts:98-154` the four narrative sections (why the budget reports, why the core blocks, where the threshold comes from, why there is a far gate) | 57 | 15 | **42** | **Real, and the only candidate whose loss is a measurement nothing else records.** The threshold derivation (calm rate 800 bytes a day, worst run 14 400, worst day +19 484, finding 430) stands nowhere else: `README-hooks.md` names the 12 000 and not how it was measured. The cut log at `:267-459` is not touched (it is the C4 do-not-cut entry). Keep the three measured rates as a five-line table and drop the narrative; reword `:246`, which points at `WHERE THE THRESHOLD COMES FROM` by name. Rank last. |

**New candidates: about 383 lines. With the reserve: about 457.** That is short of the 473 needed by about 16 lines and short of the 500 recommended by about 43.

#### Reaching the total

Three ways, and they combine:

1. **Take all fifteen new candidates and the reserve (457)**, and let step 19 land at the low end of its re-derivation (240 rather than 285). That reaches the need only if the estimate holds, which is the risk the plan's own row already names.
2. **Split step 19** as the plan's risk table foresees: the three `fusion-commit-lock` cases first (about 95 lines including a git fixture), the seven dispatch cases in a later Circle. Then the need is about 284 and R1 to R4 plus N1 to N8 (about 294) reach it with nothing from N9 to N15.
3. **Hold the two estimate-heavy C4 records back**: the events-query entry point (100) and the monitor fixture (30) are the two whose line count is least certain. Without them the need is 344 and R1 to R4 plus N1 to N12 (about 375) reach it, leaving N13 to N15 untaken.

Recommendation is in `## Recommendations`. What is not on the table: the nine unbaselined files, the movement and arming logs (`rules-emission-golden.test.ts:267-459`, `surface-growth-bound.test.ts:7-207`, `reference-resolution-lint.test.ts:441-478`), `legacy-halt-clearing.test.ts`, `hook-fail-open.test.ts`, `guard-state-shape.test.ts`'s cases, and the `monitor-warnings-panel.test.ts` browser and bind blocks, all per the C4 analysis's do-not-cut table, which was re-read and holds.

### 6. What a cut obliges the cutter to do

- Regenerate `hooks/lib/__tests__/fixtures/surface-growth.golden` (`cd hooks && UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts`, then without the flag). `TEST_LINE_BASELINE`, `AGENT_BASELINE`, `SKILL_BASELINE` and `RULE_BASELINE` do not move.
- S1 removes two plugin-path tokens from `skills/setup/SKILL.md` (`bin/fusion-events` at `:387-388`) and adds one (`rules/orchestrator-resume.md`); S2 removes one heading-anchor pair. `reference-resolution-lint.test.ts` `BASELINE` moves and is re-approved by single-file revert (plan step 23).
- N1 and N15 each leave a pointer that must name a heading that still exists; N15 also rewords `rules-emission-golden.test.ts:246`.
- `legacy-halt-clearing.test.ts:180-213` pins three phrases in `skills/setup/SKILL.md` Step 3; none of S1 to S8 touches them, and step 18b keeps all three.
- `turn-budget-lint.test.ts:263-276` requires Step 2 to cite the orchestrator's Turn-budget block and state no number; S1 and S5 do not touch Step 2.

## Implications

The two surfaces differ in kind. On `skills/`, the need is met three times over by text that stands elsewhere: S1 is a third copy of a procedure partitioned into a rule file this very day, S2 restates a rule the skill reads in full one step earlier, S8 restates the layout it cites. The cut improves the skill bodies. On the hook tests, the reserve is 74 lines and every further line comes out of header prose. That prose is the project's habit of writing the reason beside the code, and each candidate above trades a reason for a citation. None of the fifteen removes an assertion, but N15 removes a measurement, and the list reaches the total only by taking nearly all of it.

The estimate for the five C4 records (189 lines) is the soft part of the total. The one measured figure, step 19's 285, is the record's own and cannot be checked against a file. If the user wants the cut sized once and firmly, option 2 in section 5 (split step 19) is the shape that leaves the least on the estimate.

## Recommendations

1. **`skills/`: take S1, S2, S3, S4, S5** (about 8 150 bytes). That clears the drafted 5 986 with the margin the executor's drafts will need. Hold S6 to S8 in reserve; take S6 last. Route to `coder` at step 22.
2. **Hook tests: take R1, R4, N1, N2, N3, N4, N5, N6, N8, N10, N12, N14 first** (about 290 lines, all with a loss stated as none or low), then **R3, N9, N11, N7, N13** (about 123), and **R2 and N15 last** (about 70). That order reaches 473 only at the last two; the user should decide at the gate whether to take them or to split step 19 (option 2 in section 5), which is what we would do: the three `fusion-commit-lock` cases and the five C4 records fit inside the first two groups with 30 lines to spare, and the seven dispatch cases wait for the next cut.
3. Land the cut as one commit naming this analysis, then the `skills/` steps, then the hook-test steps; measure both surfaces between the two (plan `## Testing Strategy`).
4. When S1 lands, the two C4 records that count `skills/setup/SKILL.md:394` among five `turns=0` sites (`260826-1115_*_the-converted-reconciler-site-drops-the-turns-zero-is-a-real-figure-clause-the-other-four-carry.md`, and `260826-0906_*_the-events-query…` at its `:107`/`:394` mention) should be closed with the count corrected to four.
5. The C4 analysis's count of unbaselined files (eight) is nine at HEAD; no record is filed for a count inside an analysis, but the reconciler should not carry the eight forward.

## Filed Issues

None. Every finding is an input to step 22, and the two counts that moved (the reserve's 78 to 74, the unbaselined files' eight to nine) are corrections to analyses, which are evidence captures and are not edited.

## Sources

- `hooks/lib/__tests__/helpers/growth-bound.ts:60-118` (the arithmetic); `surface-growth-bound.test.ts:247-335` (the three baseline maps and head rooms); `rules-emission-golden.test.ts:460-489` (`RULE_BASELINE`), `:1125` (the core set).
- The measurement script: `<scratchpad>/measure.js`, reading with the same readers; the section map `<scratchpad>/sections.js`; the comment census and block list `<scratchpad>/census.js`, `<scratchpad>/blocks.js`; the seven drafts under `<scratchpad>/drafts/`.
- `skills/setup/SKILL.md` (whole), `skills/archive/SKILL.md` (whole), `skills/cleanup/SKILL.md:171-176, 224-240`, `skills/help/SKILL.md:89-112`; `wc -c skills/*/SKILL.md`.
- `hooks/lib/__tests__/`: `rules-emission-golden.test.ts:17-202, 267-290, 490-515, 566-611, 1118-1174`; `rules-voice-profile.test.ts:8-66, 250-300`; `sentence-identifier-containment.test.ts:1-66, 350-425`; `fusion-paths.test.ts:150-165, 590-600`; `guard-state-shape.test.ts:1-140, 262-287`; `hooks-wiring.test.ts` (whole); `guard-bash-integration.test.ts:233-304`; `fusion-identity.test.ts:1-90`; `monitor-warnings-panel.test.ts:16-53, 108-136, 1095-1136`; `helpers/guard-harness.ts:447-492`; `helpers/citation-scan.ts:176-224, 376-418`; `plan-stopping-section-lint.test.ts:1-68`; `playmaker-backlog-mandate-lint.test.ts:6-72`; `commit-message-path.test.ts:1-165`; `record-counts-measurement.test.ts:9-61`; `config.test.ts:21-57`; `paths.test.ts:1-30`; `reference-resolution-lint.test.ts:21-70`; `domain-cascade-order-lint.test.ts:13-63`; `legacy-halt-clearing.test.ts:180-213`; `turn-budget-lint.test.ts:47, 171, 263-276`.
- `260826-0715-cut-candidates-for-two-growth-bounded-surfaces.md` (whole) and the thirteen `*_o_*.md` records in that Circle's `issues/`.
- `260827-1756_*_repair-the-twenty-open-defect-records.md` steps 5, 12, 18b, 19, 20, 21, `## Current State`, `## Risks & Mitigations`.
- `shared/issues/260825-1019_o_*`, `260825-1440_o_*`, `260827-0315_p_*`, `260827-0410_o_*`, `260827-1741_o_*`; `shared/decisions/260825-1030_a_*` (both); `circles/260826-1613-…/260827-1756_*_which-citation-corpus-does-the-archive-safety-filter-protect.md`.
- `rules/workbench-tracking.md` `## The four classes`; `rules/orchestrator-resume.md:1-28`; `README-hooks.md:414`.
- `git log --all --diff-filter=AD -- 'hooks/lib/__tests__/orchestrator-events*'` (empty), `git stash list` (empty): the removed suite of record 19 is not recoverable.

## Open Questions

- [ ] Does the user take R2 and N15 (the two candidates with a real, named loss), or split step 19 per option 2 in section 5? The list reaches the full total only with them.
- [ ] `skills/next/SKILL.md` Step 5b (6 470 bytes), `skills/migrate/SKILL.md` Step 4 (12 090) and `skills/help/SKILL.md` topic 2 (5 009) were not read; each may hold a candidate larger than S6. Unmeasured, not clean.
- [ ] The C4 five's 189 lines are an estimate with a 150 to 230 range; only the files the records name were read, and the fixture cost of the events-query cases depends on whether `fusion-events.test.ts`'s workbench builder is reusable, which was not checked.

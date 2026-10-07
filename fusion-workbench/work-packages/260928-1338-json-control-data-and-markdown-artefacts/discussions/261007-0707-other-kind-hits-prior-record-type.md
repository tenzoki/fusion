# Which other-kind hits reach Prior as "another record type" at the FJ03d hand-over?

---
**Domain:** code
**Partners:** orchestrator and consultant
**Rounds:** 4
**Ceiling:** 8
**Outcome:** did not converge after 4 rounds (closed by the user before the ceiling: the one undecidable entry, C3, waits on an input no round can obtain)
**Cross-references:** 261005-1018_*_which-other-kind-hits-reach-prior-as-another-record-type-at-the-fj03d-hand-over.md, 261005-1016-fj03d-step10-classification-re-run-at-the-side-branch-head.md, 261005-1016-fj03d-step10-classification-per-hit-table.md, 261005-0856_*_fj03d-step10-class-reading-for-borderline-hits.md, 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md

---

## Question

Decision 261005-1018 is open and step 17 of the FJ03d plan (the hand-over section in `codec/fixtures/prior/REQUESTS.md`) needs its answer. Step 10 classed 137 hits as other kind: `codec-contract` 93, `history` 18, `analysis-head` 7, `homonym` 9, `jargon-example` 6, `kept-gate-string` 4. Prior §7 names its third class "nachweislich anderer Record-Typ". The user's ruling of 2026-10-05 (rule d) already takes the 19 hits without control grammar out of that description. Open is whether the remaining 118 go to Prior under that one term (option 1, the plan's gloss) or whether only the 7 `analysis-head` hits do and `codec-contract` and `history` are named apart (option 2). The discussion was begun from the orchestrator's step-16 report, where the question was put to the user with both options, on 2026-10-07.

Prior's spec is on this machine: `/Users/kai/Projects/productive/F09-Prior/concept/fusion-json-workbench-spec.md`, Prior HEAD `5609ff1`, the commit the plan cites (found by the consultant in round 1). §7's closing paragraph (lines 650-655) names the three classes joined by "oder" and no residual; §9 line 827 asks for a "vollständige Verbraucherklassifikation" and makes FJ03d's result "damit ist FJ03 vollständig".

## What held up

### C1 — Of the 118 hits step 10 folds under Prior's third class "nachweislich anderer Record-Typ", only the 7 `analysis-head` hits are another record type in the literal sense: a head field of a report kind (analysis, consultation, curator run file) that carries no control file.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the analysis's basis table defines `analysis-head` as "`**Status:**` of a report kind with no control file", count 7 (`261005-1016-fj03d-step10-classification-re-run-at-the-side-branch-head.md`, the basis table); the fold table gives 93 + 18 + 7 = 118. The 7 rows in the per-hit table are `agents/analyst.md:165,232`, `agents/consultant.md:102`, `agents/policy-curator.md:414`, `hooks/lib/edge-answers.ts:17`, `hooks/lib/__tests__/edge-answers.test.ts:69,125`. Those kinds carry no control file: the codec's `create` admits `package|issue|plan|discussion|decision` and `evidence`. Qualification: three of the 7 are a reader and fixtures of the curator run file's head, not a head line in a template; they still belong to that report kind and to no codec kind. Round 2: the per-hit lines of the 93 at `29dac3c5` are package and issue fixtures in legacy form (`codec/src/__tests__/ops.test.ts:3158-3162`, `install.test.ts:566,793`), so "anderer Record-Typ" is false of them on its face, not merely non-literal.

### C2 — The 93 `codec-contract` hits are the codec's own contract and its tests under `codec/`, and the 18 `history` hits are anecdotes, logs and citations of past records that name no procedure; neither group is a record type, and the plan's step-2 gloss of other kind admitted them by enumeration, not by calling them a record type.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** plan step 2 reads "**other kind** (reviews, history, memos, analyses, the codec's own contract)" with no "record type" wording. Basis rules: `codec-contract` "The codec's own contract and tests, under `codec/`", `history` "Anecdotes, logs and citations of past records that name no procedure"; `codec/src/` is a directory rule (per-hit table, rule row 28). Sample hits read at `29dac3c5`: `codec/src/__tests__/install.test.ts:793` is the Markdown of a v12 package in a refusal fixture; `codec/README.md:526-527` is the codec's `narratives` finding. Round 2 correction to the evidence: `codec/README.md` carries 2 hits, not 3; the per-hit table's row 27 is a rule line. Re-taken with the rule rows excluded: 93 hits exactly. See C5 and C8 for the split inside the 93, C11 for the two `history` rows that move.

### C5 — Inside `codec-contract`, 36 of the 93 hits are the codec's `migration` tests, which test the legacy import itself; by content they fit Prior's second class "ausschließlich Legacy-Import/Archiv" at least as well as any third-class or apart description, and the directory rule is what put them under other kind.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** per-file recount from the per-hit table (rows 30-122, rule rows excluded): `ops.test.ts` 32, `round-trip-cli-migration.test.ts` 31, `transitions.test.ts` 6, `migration.test.ts` 5, `install.test.ts` 4, `references.test.ts` 3, `codec/README.md` 2, `references.ts` 2, `cli/ops.ts` 2, one each in `transitions.ts`, `prior/packages.ts`, `prior/gojson.ts`, `round-trip-cli-initialize.test.ts`, `round-trip-cli-archive.test.ts`, `prior-mapping.test.ts`; sum 93, the 36 (31 + 5) stands. `migration.test.ts` at `29dac3c5` opens with "`migration` (FJ04 steps 5 and 6) … Every store here is generated: a legacy v12-shaped tree of packages and issues". The stronger ground, round 2: step 10's basis `migrate` is defined as "`/fusion:migrate`, `bin/fusion-migrate` and their tests" (re-run report, basis table; 18 hits, 16 of them under `hooks/lib/__tests__/`). The hook-side migration tests sit in class 2 by basis; the codec-side migration tests sit in class 3 by rule 28 alone. That is an inconsistency inside the step-10 classification, not a matter of reading.

### C7 — Absorbing C5: the codec's migration tests belong under Prior's class 2, so the fold moves: with 36 (the `migration` tests) the class-2 total goes from 119 to 155 and class 3 from 118 to 82 (`codec-contract` 57, `history` 18, `analysis-head` 7). Which files count is a rule to state, and the per-hit table at `29dac3c5` is the input that re-takes the count.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** checked, as far as it goes. The rule: a `codec/src/__tests__/*.test.ts` whose header names the `migration` operation. By header at `29dac3c5`: `migration.test.ts` and `round-trip-cli-migration.test.ts` ("`migration` through `bin/fusion-record`, recorded (FJ04 step 7 …)"); `kernel.test.ts` names a migration rollback but has 0 hits. That gives 36; 119 + 36 = 155, 118 − 36 = 82 re-takes. The archive test's one hit, `round-trip-cli-archive.test.ts:266`, is `source: "legacy-terminal", legacy_fields: { marker: "_c_" }`: by its file's header not a migration test, by content import provenance; so 36 by header, 37 only under a content rule. C8 says why this fold is still a directory-rule number.

### C8 — Rule 28 is the sole basis of all 93; applied per line under the rulings and bases step 10 used for every other directory, the 93 split as `migrate` (class 2) 36, `name-grammar` (class 1, ruling a) 14, `json` (class 1, ruling b and the "record decides" pin) 41, `homonym` (apart, ruling d) 2. Class 3 then holds no codec hit at all.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 3
- **Evidence:** checked as to the line texts and the rule texts; the re-classing itself is a proposal that needs the user's ruling, because rule 28 was the classifier's choice and rulings (a) to (d) were pronounced over the other directories. Line texts at `29dac3c5`; rulings at plan step 2's note; basis definitions in the re-run report's basis table. The 14 `name-grammar` hits: `references.ts:8,115` (the `MARKER_PARTS` regex over old basenames), `references.test.ts:135,137,160`, `transitions.test.ts:64,67,76,78,84,86` (the marker maps), `install.test.ts:907,920`, `prior-mapping.test.ts:206`; all concern the name or citation-token grammar and decide no state, ruling (a)'s wording. The 41 `json` hits: `ops.test.ts` 32 (refusal of a legacy `set-mode` source; marker-bearing names refused; the reconcile `narratives` status-copy finding; "historical markers do not change the JSON decision"), `cli/ops.ts:2011-2012` and `codec/README.md:526-527` (the same finding documented), `transitions.ts:247`, `install.test.ts:566,793` and `round-trip-cli-initialize.test.ts:144` (a v12 store refused by name, spec §9 FJ03a row), `round-trip-cli-archive.test.ts:266` (provenance written into JSON; also readable as class 2). The 2 homonyms: `prior/gojson.ts:210` and `prior/packages.ts:211` read Prior's Go field `Status`, no fusion control grammar present. Round 4: the split re-sums to 93 against the per-hit table rows 30-122. Consequence, figures moved in round 3 by C11: Prior's class 3 holds `analysis-head` 7 plus whatever is done with `history` 16; the apart group is 22; class 1 becomes 233, class 2 155.

### C11 — Two of the 18 `history` rows carry a basis the step-10 rules as written already assign otherwise: `README-agents.md:72` is `homonym` (ruling d, apart), `hooks/lib/__tests__/commit-message-path.test.ts:333` is `name-grammar` (class 1). The other 16 stay `history`, other kind.

- **Advanced by:** consultant
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** checked. `README-agents.md:72` at `29dac3c5` matches on `**Mode:**` only, and the token there is the shaper's retired dispatch parameter, which is the `homonym` definition verbatim ("the same token with another meaning: the policy-curator's `**Mode:** survey|apply` dispatch parameter"); the same file's other three `**Mode:**` hits were classed `homonym`. `commit-message-path.test.ts:333` is an element of `const cited = [ … ]`, fixture data, and the report's own rule reads: "a test fixture takes … `name-grammar` when the marked name is only a path or a citation token." Re-take of the 18: `history` 16, `homonym` 1, `name-grammar` 1. The 16, enumerated: `agents/orchestrator.md:487`, `rules/commit-lock.md:88` (the `f38f37d` incident, `_o_` as a word for a record class), `README-hooks.md:594,694,790,820` (growth-bound log entries stating what a legacy marker or head field meant), `bin/monitor:1769,1936` (comments citing a `circles/…/issues/260806-0820_c_*` record), `hooks/lib/__tests__/commit-message-path.test.ts:10`, `hook-fail-open.test.ts:30`, `monitor-warnings-panel.test.ts:56`, `reference-resolution-lint.test.ts:134,473`, `review-coverage-mandate.test.ts:3,12`, `rules-emission-golden.test.ts:30` (doc comments citing past issues and plans). Alternative readings exist that no text decides: `README-hooks.md` rows 594, 694, 790 fit ruling (b)'s wording, and the two `f38f37d` lines fit `jargon-example` (ruling d); either would need the user to extend a ruling to narrative logs, neither puts a line in class 2, and neither reaches the nine comment citations. C11 asks for no ruling: both rows are decided by rules the classifier itself wrote, so it applies in every branch of the rulings below (C14).

### C14 — Under ruling (i) no (rule 28's directory reading of `codec/` stands), the fold is class 1 178, class 2 119, class 3 116 or 7 with 109 apart, apart 20 or 129; C11 applies in both branches of ruling (i) because it corrects the classifier's application of its own rules and asks for no ruling.

- **Advanced by:** consultant
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** checked. Per-hit table at `29dac3c5`, 433 rows re-counted in round 4 by basis: `name-grammar` 140, `json` 37, `legacy-reader` 68, `upgrade-note` 33, `migrate` 18, `codec-contract` 93, `history` 18, `homonym` 9, `analysis-head` 7, `jargon-example` 6, `kept-gate-string` 4. C11 moves `commit-message-path.test.ts:333` to class 1 and `README-agents.md:72` to apart. With rule 28 standing: class 1 = 177 + 1 = 178; class 2 = 119; class 3 = 93 + 16 + 7 = 116, or 7 with 93 + 16 = 109 apart; apart = 19 + 1 = 20, or 129. 178 + 119 + 116 + 20 = 433; 178 + 119 + 7 + 129 = 433. Under ruling (i) yes (C8's per-line reading): class 1 233, class 2 155, class 3 23 or 7 with 16 apart, apart 22 or 38; 233 + 155 + 23 + 22 = 433.

### C15 — Step 17's section may land with C3's question open, because the section is the surface that asks it and the plan claims no Prior acceptance; but if Prior answers that an apart-stated group does not meet §7, the remedy is owed inside FJ03d before FJ03 is called complete, not at FJ05.

- **Advanced by:** consultant
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** checked. C3's evidence: "Missing input: Prior's answer, which only the step-17 section can ask for." Plan `## Where this work stops`: "`REQUESTS.md` carries step 17's section", and no clause claims Prior's acceptance of the classification; the clause on step 10 claims only "classes no hit as convert". Spec §9 line 827, the FJ03d row: "vollständige Verbraucherklassifikation" as the work, "damit ist FJ03 vollständig" as the verifiable result. `codec/fixtures/prior/REQUESTS.md`: "FJ03 is section 7 of the specification: eleven consumer rows and a closing repository-wide classification"; the FJ03d row Prior was given carries "the repository-wide classification". Prior ruling 26 (`fusion-fj03a-followup-decisions.md`): "FJ05 verifies the complete installed release. FJ03 remains open through that maintenance window." Nothing in the spec or the ruling places the classification, or its acceptance, in FJ05.

## What fell

### C4 — Option 2 of decision 261005-1018 is the one whose every count carries a description literally true of its members and satisfies the decision's constraint; option 1 reports 111 hits under a term not literally true of them; the cost of option 2 is confined to extra lines in the REQUESTS.md section.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** refuted on its last sentence, the rest holds. The decision's own con for option 2 is "Prior's three-class sentence is answered with more than three figures, which Prior may or may not accept as meeting §7" (`261005-1018_*_which-other-kind-hits-reach-prior-as-another-record-type-at-the-fj03d-hand-over.md` `## Options`): a cost beyond lines in the section, a possible non-acceptance at the hand-over. The first two sentences hold: option 1's con is stated in the record, and the sample hits under C2 bear it out; the constraint "No hit may be reported as another record type when the control grammar is absent" concerns the 19, which both options state apart, so it discriminates between the options not at all.
- **Conceded:** first partner, round 1 — the decision record's con for option 2 names a cost that is not lines; the claim's cost sentence falls with it.

### C6 — Under §7's own sentence a hit stated apart from the three classes is a hit not classified; option 2 as the decision words it leaves 111 hits in no class, so of the two options only option 1 meets the sentence literally. The rendering that meets the sentence and keeps every description true is: every hit in exactly one of Prior's three classes, the per-basis sub-counts printed beneath each class total. The 19 of ruling d are the one group already stated outside the three classes, on the user's ruling, and whether Prior accepts that is the same missing input as C3's.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** refuted on its third sentence. Sentences 1 and 2 are checked as the literal reading: §7 names three values joined by "oder" (spec lines 650-653); no sentence of §7 or §9 names a residual or says what an unclassed hit is; whether Prior accepts a fourth label is C3's missing input. Sentence 3 ("keeps every description true") is refuted by the register itself: C1, C2 and the surviving part of C4 establish that "nachweislich anderer Record-Typ" is not literally true of `codec-contract` or `history`, and a sub-count printed beneath a class total does not change what the class label asserts of its members; the rendering is option 1 with sub-counts, whose con the decision already names. After C8 the premise moves too: no codec hit needs the class-3 label at all. Sentence 4 is checked: plan step 2's note, ruling (d), "counted apart (step 10, step 17)".
- **Conceded:** first partner, round 2 — the sub-count rendering is option 1 under another name; the label asserts what the sub-count cannot retract.

### C9 — The 18 `history` hits, read per line under the same rulings C8 applies to `codec/`, each take an existing basis: a line that describes the legacy grammar inside converted text, or cites a past record by its marker name, is `name-grammar` or `json` (class 1, rulings a and b); a line in a frozen `history/` file or an archived record is `legacy-only` (class 2); none is a record type. After that reading class 3 holds exactly the 7 `analysis-head` hits.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** refuted on the `legacy-only` disjunct and on the reading of citations under rulings (a) and (b); "none is a record type" is checked; "class 3 holds exactly the 7" does not follow. (1) None of the 18 sits in a `history/` file or an archived record: all 18 are shipped files at `29dac3c5`. Step 2's flowchart reaches `legacy-only` only through Q1 = yes ("reads or writes state from a marker, a head field or a step mark"); a `history` line answers Q1 = no by its basis definition ("name no procedure"), and the class has exactly the labels `legacy-reader`, `migrate`, `upgrade-note`, none for frozen stores. The disjunct classes zero lines. (2) Ruling (a) reads "the line concerns the name or citation-token grammar only"; the `history` basis is defined as "anecdotes, logs and citations of past records that name no procedure" and sits behind Q2 = no. A comment whose subject is the cited defect does not concern the grammar; the basis that names "citations of past records" takes it. The asymmetry with C8: the 93 codec lines were never read per line (rule 28 is a directory rule), so applying (a)/(b) to them is an application; the 18 were read per line and given a basis that survived the 2026-10-05 ruling unchanged, so moving them is a new ruling. The one line that does move is `:333`, by the report's fixture rule (C11).
- **Conceded:** first partner, round 3 — the `legacy-only` disjunct matches no file and is unreachable by the flowchart; and rulings (a)/(b) reach the nine comment citations only through a ruling the user has not given.

### C10 — Decision 261005-1018's two options are both stale: after C5, C7, C8 and C9 the question for the user is whether rulings (a), (b), (d) and basis `migrate` apply per line to `codec/` and to the `history` hits as they did elsewhere; if yes, class 3 = 7 and the apart group is 21; if no, option 1 with sub-counts is the rendering that meets §7 literally.

- **Advanced by:** first partner
- **Entered:** round 3
- **Last moved:** round 3
- **Evidence:** refuted on sentence 1 ("both stale") and on its figures; sentence 4 restates C6's fallen sentence 3. "Class 3 = 7" rests on C9, which falls. Under C8 (held, as a proposal needing the ruling) plus C11 the per-hit table re-takes as class 1 = 233, class 2 = 155, other kind not apart = 7 `analysis-head` + 16 `history` = 23, apart = 19 + 2 (C8) + 1 (C11) = 22; 233 + 155 + 23 + 22 = 433. The decision's question is not stale but narrowed: the 93 codec lines leave it if the user rules as C8 proposes, and "118 or 7" becomes "23 under 'anderer Record-Typ', or 7 with 16 stated apart": the same two options with new counts, option 1's con (C4, held) still true of the 16. Whether an apart-stated group meets §7 is C3's missing input, unchanged.
- **Conceded:** first partner, round 3 — the options are narrowed, not stale; the figures follow C9's fall.

### C12 — Decision 261005-1018 is answered by two rulings the user gives, not one: (i) whether rule 28's directory reading of `codec/` is replaced by the per-line reading C8 enumerated, and (ii) whether the 16 `history` lines go to Prior under "nachweislich anderer Record-Typ" or apart. Under (i) yes the fold reads class 1 233, class 2 155, class 3 23 or 7, apart 22 or 38; under (i) no, class 1 177, class 2 119, class 3 118 or 7 with 111 apart, apart 19 or 130. The step-17 section states the chosen fold and, in one sentence, asks Prior C3's question.

- **Advanced by:** first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** refuted on the (i)-no figures; the rest is checked. Under (i) yes, 233, 155, 23 or 7, 22 or 38 all re-take (C8 plus C11). Under (i) no, 119 and 7 re-take; 177, 118, 111, 19 and 130 do not: C11 is held without a ruling and moves two lines whatever is ruled on `codec/`, giving 178, 116, 109, 20 and 129 (C14). One shape point beside the figures: under (i) no, ruling (ii) has to cover the 93 as well as the 16, since option 2 as written names `codec-contract` and `history` apart together; C12 words (ii) over the 16 alone, which fits only the (i)-yes branch. The two-rulings structure is checked: the decision carries one question over 118 or 7; C10's refutation narrowed it to the 23-or-7 question conditional on the C8 ruling, so two rulings answer it. The last sentence is checked against C3's evidence and plan step 17's amendment.
- **Conceded:** first partner, round 4 — the (i)-no figures omitted C11, which needs no ruling; C14 carries the corrected fold, and under (i) no ruling (ii) names the 93 beside the 16.

### C13 — §7's closing sentence binds "vor Abschluss", and under §9 the FJ03d row is a part, not the close: the close of the JSON work is FJ05's release. So the hand-over section in step 17 may state the classification with C3's question open, and Prior's answer is owed before FJ05's close, not before step 17 lands; the classification is a precondition on the release, not on the request file's section.

- **Advanced by:** first partner
- **Entered:** round 4
- **Last moved:** round 4
- **Evidence:** refuted on sentences 1 and 3; sentence 2's conclusion is checked on other grounds (C15). "Vor Abschluss" at spec line 650 names no object. The sentence sits in §7, whose work is FJ03 (`REQUESTS.md`: "FJ03 is section 7 of the specification"); §9 line 827 makes FJ03d's result "damit ist FJ03 vollständig", so the FJ03d row is the close of FJ03, not merely a part; the spec's one other use of "Abschluss" for a package is "den Abschluss ganz FJ03" (line 834). FJ05's row (line 828) reads "Installations-/Versionswechsel und Freigabenachweis", and §10 line 918 says FJ05 "rechtfertigt die Aufforderung" to convert real projects; neither calls FJ05 the Abschluss. Plan `## Directive` says "FJ05 is the release act" and that this plan completes FJ03 with the classification in it; `## Where this work stops` lists FJ05's acceptance clause by clause and the classification is not among them. Prior's `fusion-fj04-correction-prior-response.md` assigns "plugin activation and use evidence" to "FJ03d/FJ05 release work", not the classification. What stays open is C3's input, not the deadline.
- **Conceded:** first partner, round 4 — "Abschluss" is FJ03's close, which FJ03d is; the practical point survives as C15.

## What could not be decided

### C3 — Prior §7's classification duty is met by a hand-over in which every hit carries exactly one class and the counts can be re-taken from one recorded command; stating the third class as 7 plus two groups named apart does not fail that duty, because step 17 as amended already mandates per-basis counts and the apart count.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 2
- **Evidence:** not decidable from the inputs at hand; the first partner concedes the premise (§7's sentence is three classes, nothing on a recorded command; "every hit in exactly one class, re-takeable" is fusion's step-2 acceptance). §7's closing paragraph: "Vor Abschluss verlangt eine repositoryweite Suche eine Klassifikation jedes Treffers für Status-/Claim-/Mode-/Depends-on-/Active-plan-Header, `_o_`-Scans, Marker-Renames und Inline-Fortschrittsparser: umgestellt, ausschließlich Legacy-Import/Archiv oder nachweislich anderer Record-Typ. Ein erfolgreicher neuer Helper allein genügt nicht." What decides the claim is whether Prior reads a hit stated outside its three classes as meeting "Klassifikation jedes Treffers". Rounds 2 and 4 confirmed the input missing on both sides: `codec/fixtures/prior/REQUESTS.md` renders no class sentence for FJ03a to FJ04 and holds no Prior answer; Prior's `docs/design/` (31 files) names FJ03d ten times and states nothing on the paragraph. Missing input: Prior's answer, which only the step-17 section can ask for.

## Open dissent

None.

## Recommendation

Qualified, and binding nothing: this discussion decides nothing, and decision 261005-1018 stays open until the user rules.

1. **Put decision 261005-1018 to the user as two rulings, not one.** (i) Whether rule 28's directory reading of `codec/` is replaced by the per-line reading C8 enumerates (36 `migrate` to class 2, 14 `name-grammar` and 41 `json` to class 1, 2 `homonym` apart), on the same rulings (a) to (d) the user pronounced over every other directory on 2026-10-05. (ii) Whether the 16 `history` lines C11 leaves go to Prior under "nachweislich anderer Record-Typ" or are stated apart; under (i) no, that ruling covers the 93 as well, as option 2 of the record words it. C11 needs no ruling and applies in every branch.
2. **Write the step-17 section from the fold the rulings produce**, every figure re-taken from the per-hit table at `29dac3c5` (C14): under (i) yes, class 1 233, class 2 155, class 3 23 or 7, apart 22 or 38; under (i) no, class 1 178, class 2 119, class 3 116 or 7, apart 20 or 129. Print the per-basis counts beneath each class total as step 17's amendment asks, and state the apart group with its reason (no control grammar in the line), never as another record type.
3. **Ask Prior C3's question in one sentence of that section**: whether a hit stated outside the three classes of §7's closing paragraph, with its reason, meets "Klassifikation jedes Treffers". Step 17 may land with the question open (C15); a "no" from Prior is remedied inside FJ03d, before FJ03 is called complete, not deferred to FJ05 (C13 fell on that point).
4. **What this discussion does not settle.** Whether the sixteen `history` lines may be re-read under ruling (b) or (d) (C11's alternative readings) is a ruling the user may give but no text forces; and C3 itself stays undecidable here by construction.

The step-10 report's rule 28 and its `history` basis stand as written until the user rules; nothing in the analyses is to be rewritten on this discussion's account.

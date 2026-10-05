# How does FJ03d step 10 class the name-grammar hits and the homonym and jargon-example hits?

---
**Domain:** data
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Partners:** orchestrator and consultant
**Rounds:** 2
**Ceiling:** 8
**Outcome:** did not converge after 2 rounds (closed by the user before the ceiling; neither stopping condition had fired, C6 stood undecidable on an input only the user can supply)
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 261005-0504-fj03d-step2-classification-at-the-base-commit.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Question

FJ03d step 2 classed 723 pattern hits into the plan's four classes and widened two of them: 90 name-grammar hits sit under **converted** although they read no JSON, and 15 hits (9 homonyms, 6 jargon examples) sit under **other kind** although they are no record type. The step-2 report asks for a confirmation of both readings, or a fifth class, before step 10 re-runs the classification. The orchestrator put that choice to the user on 2026-10-05 with a recommendation to confirm both readings; the user opened this discussion instead of answering.

## What held up

### C1 — Step 10's acceptance clause ("no hit in class convert") comes out the same under either scheme, because neither the 90 name-grammar hits nor the 15 homonym and jargon-example hits can land in class convert under four classes or under five.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** 261005-0504-fj03d-step2-classification-at-the-base-commit.md `### The four classes, as applied`, the flowchart: a hit reaches convert only through "reads or writes state from a marker, a head field or a step mark", and both groups leave at its "no" branch. The plan's step 10 acceptance is "no hit in class convert".

### C3 — Introducing a fifth class is mechanical and needs no re-judgement of any hit, because every row of the step-2 per-hit table already carries a basis label (`name-grammar`, `homonym`, `jargon-example`) that the split can key on.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the Basis column of the step-2 per-hit table counts `name-grammar` 90, `homonym` 9, `jargon-example` 6. Checked for the step-2 rows only: of the 433 hit lines at `fj03d` `29dac3c5`, 43 have no step-2 row with the same text and need judgement under any scheme. `classify.py` was not kept in the workbench; its one copy sits in another session's temporary scratchpad.

### C4 — The 15 homonym and jargon-example hits are not a record kind at all, so keeping them under "other kind" contradicts the plan's own gloss of that class (reviews, history, memos, analyses, the codec's contract), and confirming the reading therefore requires amending the plan's class wording, not only confirming the report.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the plan's step 2 gloss of **other kind**; the step-2 report says the 15 hits "are not a record type at all". The consultant qualifies "contradicts" as slightly strong (the gloss already holds history and the codec's contract, which are no record kinds either) and adds that **converted**'s gloss "already reads or writes JSON" needs the same amendment for name grammar. One dated line in step 2's note records the ruling, as the existing "Amended 2026-10-05 from the report" line does.

### C5 — A marker reader that decides state and was mislabelled `name-grammar` would be hidden by neither scheme more than by the other: the textual classification cannot detect it under four or five classes, and the plan's step 11 behavioural rehearsal is the check that covers it.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** both schemes key on the same Basis label. Checked for the comparison between the schemes; the second half (what covers the mislabel) is corrected by C7.

### C7 — A marker reader mislabelled as name grammar is caught by the suites' disagreement fixtures, not by the migrated copy.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** fixtures that give a marker and a status that disagree, at `fj03d` `29dac3c5`: `hooks/lib/__tests__/plan-size.test.ts:141`, `hooks/lib/__tests__/workbench-citation-lint.test.ts:177`. They exist for plan-size and the citation lint only. One part is the consultant's labelled inference, not a check: that right after migration a name's marker and the record's status agree, because the migration maps one to the other (the importer was not read).

### C8 — None of the 17 name-grammar hits outside test files decides state at the side branch head.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** each line read at `fj03d` `29dac3c5`: `hooks/citation-sweep.ts:681,733,760`, the 11 in `hooks/lib/citation-scan.ts`, `hooks/lib/plan-size.ts:93`, `hooks/staging-drift.ts:23`, `skills/archive/SKILL.md:151`. Each is a token regex, a wildcard rewrite or a comment. The other 73 are test fixtures.

### C9 — The two readings do not cover every borderline hit step 10 will meet; the side branch head has at least two more groups, and a fifth class settles neither.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** legacy grammar described as history inside converted text (`hooks/lib/citation-corpus.ts:26-36`, `hooks/lib/plan-size.ts:42-46`, `rules/fusion-workbench-conventions.md:287,322` at `29dac3c5`; step 3's note calls the conventions lines legacy-only, which that class's gloss does not cover); kept event-log strings (`agents/orchestrator.md:568`, the `**Mode:** autonomous` gate string that Prior §7's monitor row requires to stay).

### C10 — Prior asks for three classes, not four: convert is the plan's working class, and any finer split is fusion's own and folds back into Prior's three at step 17.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `foreign:F09-Prior:concept/fusion-json-workbench-spec.md` at `5609ff1`, §7's closing paragraph: "umgestellt, ausschließlich Legacy-Import/Archiv oder nachweislich anderer Record-Typ".

### C11 — Every one of the 90 name-grammar hits satisfies the step-2 report's own criterion for that basis (the line concerns a filename or citation token, marker slot included, and decides no state), so the reading "name grammar under converted" can rest on that criterion alone, with no appeal to the Prior §7 duty.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** all 73 test-file lines read at `84047ad7`, none decides state; the closest are `hooks/lib/__tests__/citation-form.test.ts:37-38`, which compare names and read no liveness. With C8 that covers the 90. Qualified by C14: "parses" is not literally true of every line. Not checked: whether the 73 lines stand unchanged at `29dac3c5`.

### C12 — With the draft requirement for step 10's dispatch in force, C6's missing input exists, and under it confirming both readings loses nothing a later reader or Prior needs that a fifth class would give.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** checked as a conditional. The draft (the first partner's, unapproved by the user) reads: "The report carries the per-hit table with a Basis column and one count per basis beside the four class totals. It classes with the step-2 flowchart and the step-2 basis labels, adds a basis label for any group the step-2 labels do not cover, and states each new label's rule. It folds the result to Prior's three classes and states, apart from that fold, the count of hits where the pattern matched and the control grammar is absent (homonyms, jargon examples), so that no such hit is reported as another record type. Step 17 hands the per-basis counts to Prior with the class totals." A fifth class would add only a class total, which the `name-grammar` count already gives, and would still fold into Prior's three (`foreign:F09-Prior:concept/fusion-json-workbench-spec.md` at `5609ff1`, §7, lines 650-653). The draft's two wording gaps are C16 and C17.

### C14 — 14 of the 90 name-grammar hits are comments that describe the name grammar and parse nothing, so step 2 applied its second question as "concerns the name or citation-token grammar only", not "the line parses".

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** at `84047ad7`: `hooks/lib/citation-scan.ts:84,91,97,134,149,400,465,590,1358`, `hooks/staging-drift.ts:23`, and in tests `marker-format-lint.test.ts:9`, `staging-drift.test.ts:138`, `workbench-citation-lint.test.ts:316`, `reference-resolution-lint.test.ts:267`. The confirmed reading should say so, or step 10 classes comments inconsistently.

### C15 — The legacy-description group needs no new basis label: the existing `json` basis ("states the JSON behaviour") covers a line saying a marker decides nothing; only the event-string group needs a new label.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the per-hit table's rows 592-593 (`hooks/lib/plan-size.ts:47-48`), 596-598 (`hooks/lib/scope.ts:9`, `hooks/lib/work-graph.ts:8-9`) and 132 (`bin/fusion-work-order:54`), all classed converted, basis `json`.

### C16 — The kept gate string had step-2 rows classed convert (step 5) and still stands at the side branch head, so a carry-over by row text fails step 10's acceptance, and the draft's count apart from the fold must name every other-kind basis that is not a record kind, not only homonyms and jargon examples.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** per-hit rows 79, 84 and 85 (`agents/orchestrator.md:447,577,610` at the base); the string `answered by **Mode:** autonomous` at `29dac3c5` lines 438, 568 and 601; Prior §7, line 621 at `5609ff1`: "alte Gate-Strings erhalten". Lines 438 and 601 were confirmed to carry the string and not read further.

### C17 — The draft's last sentence binds step 17 from inside step 10's dispatch; step 17 is a separate dispatch whose plan text asks only for "step 10's classification result", so the per-basis hand-over needs a line in step 17 itself.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the plan's step 17, `Changes:`.

## What fell

### C13 — The step-2 flowchart, applied as written, already sends both of C9's groups to exactly one class (other kind) without a new rule; only a basis label per group is new, and step 3's "legacy-only" for the conventions lines is a mislabel against the flowchart.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** refuted for the legacy-description group, holds for the event-string group. Step 2 classed prose that states the JSON behaviour as converted, basis `json` (per-hit rows 592-593, 596-598, 132), and `hooks/lib/plan-size.ts:42-46` at `29dac3c5` is that same passage; the 33 `upgrade-note` rows are prose too and reach legacy-only. So the flowchart as applied gives this group three exits, not one. Step 3's label is a mislabel for `rules/fusion-workbench-conventions.md:287` (precedent: converted, `json`), and defensible for line 322, which describes what `/fusion:migrate` imports and `archive/` holds. `agents/orchestrator.md:568` exits at other kind and needs a new basis label.
- **Conceded:** first partner, round 2 — the per-hit rows cited above; the claim read the flowchart and not the table that shows how step 2 applied it.

### C2 — The 90 name-grammar hits belong to consumers that are already converted (citation scanner, sweep, checker, staging drift) and that the Prior specification obliges to keep resolving old marked basenames, so classing them under converted states a true fact about the consumer.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** refuted for 24 of the 90. The duty sits on one row of Prior §7 ("Zitierprüfung, Sweep, Archivierung | UUID-Verweise und alte Basenames auflösen"), which covers 66 hits. Staging drift (11 hits) sits on another row that carries no such duty, and 13 hits belong to none of the four consumers named (`plan-size.ts` 1, `plan-size.test.ts` 3, `sentence-identifier-containment.test.ts` 4, `marker-format-lint.test.ts` 2, `commit-message-path.test.ts` 1, `hook-route-exclusion.test.ts` 1, `path-literal-lint.test.ts` 1). The citation checker was also not converted at the base: its liveness predicate left the marker only at step 8.
- **Conceded:** first partner, round 1 — the §7 row cited above; the claim rested the reading on a duty that reaches 66 of the 90 hits. What carries all 90 is the report's own criterion (parses a name, decides no state), which enters as C11.

## What could not be decided

### C6 — Confirming both readings is the cheaper option and loses nothing a later reader needs, because the basis labels stay in the per-hit tables of both reports and a reader can still separate the groups.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** result unchanged in round 2. Missing input: the draft requirement (C12) adopted into step 10's acceptance or dispatch, and its hand-over sentence into step 17's text (C17); the draft is unapproved. The cost comparison ("cheaper") was not checked. The plan's step 10 asks only to class every hit and explain differences; it requires neither a per-hit table nor a Basis column. Without basis counts, step 17 would hand the 15 hits to Prior under "nachweislich anderer Record-Typ", which is untrue of them.

## Recommendation

This recommendation binds nothing; the choice between the readings and a fifth class is the user's, and the plan changes only on the user's word.

We recommend that step 10 keeps four classes and that both step-2 readings are confirmed, contingent on three additions to the plan and two sharpened rules. A fifth class would add one class total that the per-basis count already gives (C12), and Prior's specification asks for three classes at the hand-over in any case (C10).

The additions to the plan:

1. Step 10's acceptance requires the per-hit table with a Basis column and one count per basis beside the class totals (C12, and the input C6 lacks).
2. Step 10 states, apart from the fold to Prior's three classes, the count of every other-kind basis that is not a record kind: homonyms, jargon examples and the kept event-log strings (C16).
3. Step 17's own text hands the per-basis counts to Prior (C17).

The sharpened rules, recorded as one dated line under step 2:

1. Name grammar under **converted** rests on "the line concerns the name or citation-token grammar only and decides no state", comments included (C11, C14), and not on the Prior §7 duty, which reaches 66 of the 90 hits (C2).
2. A line that describes the legacy grammar inside converted text classes as converted, basis `json`, as step 2 already did; the kept gate string `answered by **Mode:** autonomous` classes as other kind under a new basis label and is not carried over from its step-2 rows, which were convert (C13, C15, C16).

Two limits remain. The 43 hit lines at `29dac3c5` without a step-2 row need judgement under either scheme (C3), and the step-2 `classify.py` was not kept in the workbench. C6 stays undecided until the user adopts or refuses the three additions.

# The `**Mode:** autonomous` field, read against the decision that ruled it

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `9c7101aa..8ef78ffc`
**Not-opened:** none
**Review domain:** code
**Cross-references:** 260921-0842_*_how-does-a-work-item-tell-the-orchestrator-to-work-it-without-asking.md, 260921-0657_*_no-shipped-text-lets-a-directive-pre-answer-the-solution-gates-so-an-autonomous-package-stops-three-times-before-its-first-fix.md, 260920-2157_*_may-the-orchestrator-file-a-work-item-when-the-user-instructs-it.md, 260921-0822-reviewer-closing-pass-over-the-seven-fix-package.md

## Summary

One commit, four shipped text files and two goldens plus a pin. The field, its ownership, its four answered conditions, its four excluded conditions, the one-item bound, the event forms and the two fixed strings are all in the tree as the decision's `Answered:` line rules them. Six text defects remain, one of them High: the sentence that decides what the orchestrator does at the four excluded rows under the field can be read as "ask" and as "file and skip", and names no event for that path.

## Totals

Critical 0 / High 1 / Medium 1 / Low 4.

## What the decision ruled, checked point by point

| Ruling (`260921-0842_*` `Answered:`) | Where at `8ef78ffc` | Result |
|---|---|---|
| The item gains `**Mode:** autonomous`, absent is ordinary | `rules/fusion-workbench-conventions.md:192` template line; `:205` absent-list; `:207` paragraph | met |
| Read at Setup beside status and claim | `agents/orchestrator.md:138` fourth `sed` column; `:147` "Hold its mode with its name", unknown value reported and read as ordinary; `:149` hint prints `autonomous` | met; `bash -n` on the extracted line parses; run against the live store it prints four tab-separated columns per item |
| Answers the plan review, the claim and finish of that item, the stop-conditions read | `agents/orchestrator.md:379` names the three rows; `:233` plan gate defers; `:416` claim and finish defer; `:442` stop conditions: not put, not judged, all clauses into the closure note verbatim | met, with two gaps (findings 3 and 4) |
| Never ontology, removal or ambiguity | `:379` "these the field never reaches" names the four rows | named, but the handling sentence is ambiguous (finding 1) |
| A field on one item never rules on another | `:379` verbatim | met |
| Every answered gate still logs `gate_hit` and a `gate_response` citing the field | `:379` detail form; `:442` `clause N: not put — answered by …`; `:571` event-table row | met for answered gates; unstated for the excluded rows (finding 1) |
| `Circle stop conditions`, `holds`/`does not hold` unchanged | `:442` both strings and the do-not-modernise sentence stand | met |
| Written on the user's word, never from the directive's prose | `rules/fusion-workbench-conventions.md:207`; `skills/memo/SKILL.md:127` | rule met; the memo body's test is not that sharp (finding 2) |
| Agrees with `260920-2157_*` and the `**Depends-on:**` rule | `:207` "stands on the user's word: an agent writes it only when the user says so" beside `:229` "stands on the user's confirmation, and no agent writes one without it" and `:235` the narrowed bound | same shape; the route list has one wording slip and one missing route (finding 6) |
| Funding cut | `:219` lost the six-marker Circle vocabulary, the closed-coherent-versus-bounded-closure sentence and the `paused` aside; `:235` lost "Two bounds, and only the first survived the cut" and the work-queue sentence. `README-agents.md:294` tells the Circle record, the six markers and the Coherence-verdict distinction; `README-agents.md:47` and `docs/upgrading-to-v11.md:23` tell the queue's retirement. The bound sentence and its `260920-2157_*` citation are byte-identical before and after | met |
| Goldens and pin | `surface-growth.golden` orchestrator 89 393 → 91 881, memo 12 969 → 12 998; `rules-emission.golden` conventions 66 364 → 66 352 on every dispatch path; `wc -c` at HEAD gives 91 881 / 66 352 / 12 998. `reference-resolution-lint.test.ts:464` 1681/305 → 1683/307, thirtieth entry, one path and one anchor per file measured by restoring each file in turn | match |
| Nothing else says a directive's prose answers a gate | `grep -rni directive` over `agents/ rules/ skills/ README*.md docs/ templates/`, filtered on gate/answer/unasked/autonom: no hit outside the new text | met |

## Findings by theme

### 1. The four excluded rows: "stops as written" and "file, skip and go on" in one sentence, and no event named (High)

`agents/orchestrator.md:379`: "Every other row stops as written, and these the field never reaches: *Task involves `ontocoder`*, *Structural ontology changes*, *Destructive operations*, *Ambiguous task instruction* — there you file an `_o_` decision at `$OUT_DECISION`, emit `task_skipped` and go on."

The section's preamble at `:363` defines a stop as "stop and ask the user". So the sentence says of the four rows both that the user is asked and that the orchestrator files a decision, skips and goes on. The decision's `## Constraints` and both directives (`260918-1048…md` `## Directive`: "Dort legst du den Beschluss offen an, überspringst den Defekt und machst weiter") mean the second: no question. A reader who takes the first stops three times before the first fix, which is the defect `260921-0657_*` closed.

The event pair is unstated on that path. `:240` mandates `gate_hit` plus `gate_response` on every condition met; `rules/fusion-workbench-conventions.md:245` forbids a `gate_response` for an answer nobody gave. File-and-skip is an answer nobody gave. So either `gate_hit` stands alone, or nothing is written, and the clause says neither.

Fix direction: split the sentence. "Every other row stops as written" for the rows not named; for the four, under the field: emit `gate_hit`, write no `gate_response`, file the `_o_` decision, emit `task_skipped`, go on, and say so in the event-table row for `gate_hit`.

Issue: `260921-1035_*_the-gate-clause-says-the-four-excluded-rows-stop-as-written-and-then-file-skip-and-go-on-with-no-event-named.md`.

### 2. `/fusion:memo` writes the field "when the user's own content supplies" it, which is the prose reading (Medium)

`skills/memo/SKILL.md:127`: "`**Domain:**` and `**Mode:** autonomous` are optional and belong there only when the user's own content supplies them." For `**Domain:**` that means the user named `code` or `data`. For `**Mode:**` the memo's argument is the directive paragraph itself, so "supplies" is satisfied by "selbständig ausführen" in the paragraph, and the skill then writes the field from the directive's prose, which `rules/fusion-workbench-conventions.md:207` forbids and the decision's option 2 rejected ("two readers gave two answers to the same store"). The rule and the skill are on different dispatch paths, and the skill body is what runs.

Fix direction: one clause in the skill: the field is written when the user names the mode (the word `autonomous`, or asks for the field), never from what the paragraph asks for in other words.

Issue: `260921-1035_*_the-memo-skill-writes-mode-autonomous-when-the-users-content-supplies-it-which-is-the-prose-reading-the-decision-rejected.md`.

### 3. The plan-review row: the clause names no answer (Low)

`agents/orchestrator.md:233`: "(or, under `**Mode:** autonomous`, the answer the field gives — **Human Gate Rules**)". `:379` for that row says only "*Planner produced a plan* (the claimed item's field)". The stop-conditions row spells its answer ("closure proceeds unasked"); the plan row does not, and `:571` requires a literal `<decision>` in the `gate_response`. The plan gate's options are Approve/Modify/Cancel while the event row's vocabulary is proceed/skip/defer/modify, so the reader has to pick both the answer and its spelling.

Fix direction: "(the claimed item's field, answering **Approve**)" at `:379`.

Issue: `260921-1035_*_the-gate-clause-names-no-answer-for-the-plan-review-row-so-the-decision-half-of-its-gate-response-is-unspecified.md`.

### 4. The finish clause drops "once its plan is complete" (Low)

Decision `## Constraints`: "the finish of that item once its plan is complete". `agents/orchestrator.md:379` and `:416`: "the claim and the finish of that item", no bound. The `Answered:` line omits the qualifier too, so the shipped text matches the ruling as recorded and not the constraint it was ruled under. `:426` ("The user says when an item is done") and `:320` ("Never decide on your own that the work is finished") still hold, so the field buys one confirmation and nothing decides the finish on its own; the question is only whether that confirmation is bounded by plan completeness. Filed so the user rules which of the two lines is the one to keep.

Issue: `260921-1035_*_the-finish-clause-drops-the-once-its-plan-is-complete-bound-the-decisions-constraints-carry.md`.

### 5. `docs/working-model.md` does not know the field (Low)

`docs/working-model.md:13-29` shows the head fields with `**Claim:**`, `**Active spec/plan:**`, `**Depends-on:**`, `**Cross-references:**` and no `**Mode:**`; `:102` "Fusion is deliberately not autonomous. It stops and hands you the decision at defined points." and `:107` lists the plan review among them. Both were true at `9c7101aa` and are half-true at `8ef78ffc`. `README-agents.md:227` and `:294` list fields non-exhaustively and need no edit.

Issue: `260921-1035_*_the-working-model-doc-lists-the-head-fields-and-says-fusion-is-not-autonomous-without-the-mode-field.md`.

### 6. The ownership sentence: "by hand" attached to an agent write, and the orchestrator's filing route missing (Low)

`rules/fusion-workbench-conventions.md:207`: "an agent writes it only when the user says so — by hand, through `/fusion:memo`, or by the orchestrator in the same command as a claim the user confirmed". "By hand" is the user writing with no agent, so it cannot be a case of "an agent writes it". And the orchestrator route names a claim only: `260920-2157_*` lets the orchestrator file an item at the user's word, and a user who says "file this and work it without asking" has said so at the filing, which the list does not cover. `agents/orchestrator.md:406` (the Claim row) writes status and claim and no mode, so the one orchestrator route the rule names is not in the orchestrator's own operation table.

Fix direction: "It is written only on the user's word: by the user by hand, by `/fusion:memo`, or by the orchestrator in the same command as a filing or a claim the user asked for"; and the Claim row (and the filing sentence at `:400`) carry the field.

Issue: `260921-1035_*_the-mode-ownership-sentence-attaches-by-hand-to-an-agent-write-and-names-no-orchestrator-filing-route.md`.

## Cross-cutting observations

- Findings 1, 3 and 4 are one paragraph, `agents/orchestrator.md:379`. One edit closes three.
- Findings 2 and 6 are the same question from two sides: which act is "the user says so". The rule answers it for hand, memo and claim; the memo body answers it loosely; the orchestrator's filing route answers it not at all.
- Step 5 (`:311-320`) still asks after every commit. The decision names four conditions and Step 5 is none of them, so an autonomous package returns to the user once per commit by design. Not a finding; stated so nobody reads it as one.
- The live store: neither `260918-1048…` nor `260920-2151…` carries the field (the walk prints an empty fourth column for both). Workbench content, out of scope; the currently claimed item runs in ordinary mode until the user writes the field.

## Recommended sequencing

Finding 1 before the next autonomous package is claimed. Findings 2, 3, 6 with it, since they are text in the same three files. Findings 4 and 5 whenever.

## Verification

`cd hooks && npm test`: 57 files, 957 tests passed at `8ef78ffc` with the working tree as found. `bash -n` on `agents/orchestrator.md:138` extracted: parses. `wc -c` on the three text files equals the goldens. `git show 8ef78ffc --stat`: 11 files, the four shipped text files, two goldens, one pin, four workbench records.

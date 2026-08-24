# Turn 2 of the defect-closure Circle: the profile fix and the record layer at close

**Reviewer:** ontorev
**Reviewed-range:** `01964e4..13aaa85`
**Not-opened:** `CLAUDE.md`, `README-agents.md`, `agents/orchestrator.md`, `agents/reconciler.md`, `bin/fusion-paths`, `bin/fusion-session-domain`, `docs/upgrading-to-v10.md`, `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/lib/__tests__/fusion-identity.test.ts`, `hooks/lib/__tests__/fusion-paths.test.ts`, `hooks/lib/__tests__/fusion-session-domain.test.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/workbench-citation-lint.test.ts`, `rules/fusion-workbench-conventions.md`
**Scope as dispatched:** the three changed profiles and their workbench copies (commit `6b26e2c`), and every record change in the range: 17 closures inside this Circle's `issues/` (16 renamed `_o_`→`_c_`, one filed and closed in-range at `260824-2136`), the two umbrella closures, the new analysis under `shared/analyses/`, three appended `Corrected:` lines, the two starred histories, the plan and the session log. The 15 files above are code, prompt and doc surfaces assigned to coderev; I opened `README-agents.md` and `skills/next/SKILL.md` for the lines a closure note cites and for nothing else.
**Circle:** `circles/260824-1853-close-every-open-defect/`
**Plan:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`
**Prior pass:** `circles/260824-1853-close-every-open-defect/reviews/260824-2102-ontorev-turn-1-profiles-and-record-closures.md`. Its two profile findings and its five record findings are all `_c_` in this range; each closure was checked against the tree below.
**Attribution:** filed with the person half absent. `$FUSION_PLUGIN_ROOT/bin/fusion-identity` is not in the installed copy, so the guarded call failed and the filing rule's third branch applies.

## Summary

The profile fix is exact: the four pairs are byte-identical, all four parse, the chat profiles carry no bare rule filename anywhere (C05 and the line-3 header comment both), and `Allerdings,` replaces `Das heißt,` at `default-voice-de.yaml:137` with the metric still `ok` on all four. Of the 19 closures in the range every one carries exactly one `Resolved:` note whose first word is in the vocabulary (16 `fixed`, 1 `moot`, 1 `referred (backlog)`, plus the umbrella pair `fixed`), and every resolving path or command I ran holds. Three Low findings are filed, all inside closure notes or the plan text; none is a defect in a shipped file and none blocks closure.

## Totals

Critical 0, High 0, Medium 0, Low 3.

## What was checked and held

| Check | Method | Result |
|---|---|---|
| Shipped and workbench profile pairs | `diff -q` on all four pairs at HEAD | all four empty |
| Parse and metric | `ruby -ryaml`, `bin/fusion-prose-metric` on the four shipped files | all parse; `ok` on all four (`default-voice-en` 1 in 1 014 words, the rest 0) |
| No bare rule filename in the chat profiles | grep `[a-z-]+\.md` over `chat-voice-*.yaml` and `default-voice-de.yaml` | none in the chat profiles; the three hits in `default-voice-de.yaml:336-347` are `examples/` paths under `path:` keys, which were there before and name exhibits, not rules |
| `2058` C05 closure | read `chat-voice-en.yaml:49`, `chat-voice-de.yaml:51` | "in the rule on user-facing output" / "Regel zur nutzerseitigen Ausgabe" |
| `2058` `Das heißt,` closure | `default-voice-de.yaml:137` | `"Allerdings,"`, the chat profile's row-100 substitution |
| One `Resolved:` per closure, first word in vocabulary | grep over the 17 Circle closures and the two umbrellas | 19 of 19, one note each; `fixed` 17, `moot` 1, `referred (backlog)` 1 |
| Row 66 `moot` note | `grep -c 'Those belong' rules/user-facing-output.md`; marker of `260816-1330_*_the-repunctuation-*` | 0; `_c_` |
| `2059` histories note | the note's own grep over the two histories; `_t_circle.md:32`; `260816-1330_*_two-of-the-twenty-nine-*:15` | 0 and 0; both starred |
| `2059` line-number note | `chat-voice-de.yaml:99`, `:107`; the two `Corrected:` lines | `Allerdings,` at 99, the AI05 `Bezugswort` sentence at 107; both lines appended, each naming the 2059 record |
| `2100` referral note's seven ideas | every `_c_` record outside `archive/` whose note reads `referred (backlog)`: nine; two cite existing backlog entries (`260812-0253_*_rules-lose-*` two, `260812-0253_*_agents-answer-*` one) | the remaining seven are exactly the seven paths the note lists; `shared/backlog/` unchanged in the range (three entries), so all seven still await the user's filing |
| The kind-less note | `shared/issues/260816-0740_c_*:245-246` | `Corrected:` line names `referred (decision)` and the `260820-2314_*` record, which exists |
| Umbrella `260811-1734` | triage row 25 (`fixed`, S14) and rows 21, 23 | closes on the step-14 figures; finding 3 on the step pointer |
| Umbrella `260824-1538` | note against `history/260824-2059-coder-step-13-rules.md:13` | the orchestrator crossing (30 760 against 30 552) is named there, so "step 13 named it" holds; row 210 said two crossings, the note reports three, and the note is the truer one |
| `2136` record | filed and closed in one range; `Resolved: fixed` names `workbench-citation-lint.test.ts:293` | file carries the fixture form per the P-14b log; the test file itself is coderev's |
| The analysis roll | `shared/analyses/260824-2121-*` header and the test's pointer | header names the first roll and decision `260822-1229`; `reference-resolution-lint.test.ts:457` points at it, `:479` accounts the count move on the constant's line |
| Plan `[DONE]` marks against history | steps 1-15 all `[DONE]`; each has a Complete log in `history/` | holds, except the step-14 progress text (finding 1) |
| Session log | `shared/history/260824-1750-orchestrator-session.md` names `e7fc2a1` and `f0b07b6` for the two Turn 1 reviews | both commits exist and are the review commits |
| Open issues at HEAD | `find fusion-workbench -path '*/issues/*' -name '*_[op]_*' -not -path '*/archive/*'` before my filing | empty |

## Findings by theme

### The plan says two things about step 14

1. **`[DONE]` above a line that says not `[DONE]`** (Low). `planning/260824-1905_p_*:181` carries the mark; `:188`, the only progress line, ends "Acceptance not met … Step 14 not `[DONE]`". P-14b set the mark after its own green run (`history/260824-2136-*`), and wrote no line under the step. Issue `260824-2155_*_plan-step-14-is-marked-done-above-a-progress-line-that-says-it-is-not.md`.

### Closure notes whose pointers are off, in the corpus the gate no longer sees

2. **The README-agents note miscounts its own citations** (Low). `issues/260824-2056_c_readme-agents-*` locates four citations at `README-agents.md:53,58,60,61` and names a `:148`. The citing lines are 53, 59, 60, 61; they carry five tokens (`:97` is omitted); nothing cites `:148`, and `skills/next/SKILL.md:148` is blank. The doc's citations are right; the note's account of them is not. Issue `260824-2155_*_the-readme-agents-closure-note-cites-a-line-that-does-not-cite-and-a-skills-next-line-that-is-blank.md`.
3. **The umbrella note names step 11 for a row that was step 12** (Low). `shared/issues/260811-1734_c_*`, closing section: "steps 11 and 12 (triage rows 21 and 23)"; both rows are S12 and both records' notes cite `agents/orchestrator.md` only. Issue `260824-2155_*_the-umbrella-closure-note-names-two-steps-for-two-rows-the-triage-assigns-to-one.md`.

## Cross-cutting observations

- Findings 2 and 3 are the class Turn 1's finding 4 named: a `Resolved:` note is written, the record is renamed, and the note leaves the citation gate's corpus in the same commit. Every path token in this range's 19 notes resolves; what the gate could never have caught is a line number or a step number that points at the wrong place, and that is what both are. Whether history and closed records enter the corpus stays with `shared/issues/260816-0119_*` and `shared/decisions/260823-1414_*`, both cited by the closures themselves; nothing here pre-empts either.
- The `2100` backlog record closes `referred (backlog)` onto the same seven unfiled entries it was filed about. That is the only closure consistent with `## Backlog entries` (no agent originates an entry) and with the Directive (every open defect ends `_c_`), and the note lists the seven paths so the user's `/fusion:memo` pass has its input. It is not a defect and I filed none; it is a debt the user holds, and the Circle's closure note should say so rather than let the list sit in one closed issue.
- Two umbrella closures use the bold `**Resolved: fixed**` form the reconciler's notes use; 31 closed records outside `archive/` carry that form, so it is an established variant and the first word still reads. Noted, not filed.
- The dispatch counted 18 in-Circle closures; the range holds 17. The eighteenth `_c_` (`260824-2100_c_a-history-filename-*`) was closed at `01964e4`, the Turn 1 boundary, together with its `git mv`; I checked it anyway and it holds.
- Filing three `_o_` records here breaks the Circle's stopping criterion again, which is the same tension P-14b's record described. All three are `Corrected:`-line or progress-line edits an ontocoder can land in one commit; none needs a shipped file.

## Recommended sequencing

Nothing blocks. One ontocoder pass, one commit: finding 1 (a progress line under step 14), then findings 2 and 3 (one `Corrected:` line each), then re-run the open-issue `find` so the closure measurement's last line is true again.

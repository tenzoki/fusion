# Turn 3 — structured data, configuration and records

**Sender:** ontorev
**Reviewed-range:** `5d29b6d..518926d`
**Not-opened:** `CLAUDE.md`, `README.md`, `README-hooks.md`, `agents/analyst.md`, `agents/bugfixer.md`, `agents/conceptrev.md`, `agents/consultant.md`, `agents/investigator.md`, `agents/planner.md`, `agents/playmaker.md`, `agents/reconciler.md`, `agents/shaper.md`, `agents/taskplanner.md`, `docs/philosophy.md`, `hooks/dist/lib/domain-cascade.d.ts`, `hooks/dist/lib/domain-cascade.js`, `hooks/lib/__tests__/context-manifest.test.ts`, `hooks/lib/__tests__/domain-cascade-order-lint.test.ts`, `hooks/lib/__tests__/domain-cascade.test.ts`, `hooks/lib/__tests__/fusion-paths.test.ts`, `rules/circle-records.md`, `skills/cadence/SKILL.md`, `skills/direct/SKILL.md`, `skills/help/SKILL.md`, `skills/next/SKILL.md`, `templates/investigator-capture-layout.md`, `260815-1339-coder-remove-conceptrev.md`, `260815-1403-coder-fold-investigator-into-analyst.md`, `260815-1440-coder-step9-domain-values.md`, `260815-0029-planner-remove-eight-mechanisms-and-cap-growth.md`, `260815-1251-coderev-turn-2-build-churn-and-stash.md`, `260815-1247_*_the-inserted-step-p-3b-is-in-no-plan-and-in-no-turn-log-only-in-the-event-stream.md`, `260815-1247_*_a-backlog-entrys-related-line-points-at-a-marker-the-playmaker-has-since-moved.md`, `260815-1247_*_the-churn-leaves-were-removed-without-a-retirement-entry-and-the-retirement-table-could-not-have-held-one.md`, `260815-1247_*_the-implemented-decision-records-two-cross-references-were-broken-by-the-commit-that-transitioned-it.md`, `260815-1251_*_step-11s-file-list-predates-turn-2-which-re-pointed-two-suites-onto-the-measurement-step-11-deletes.md`, `260815-1251_*_the-after-measurement-command-cannot-see-the-320-lines-the-build-change-added.md`, `260815-1251_*_the-plans-decidability-head-counts-eight-asserted-enumerations-and-seven-remain.md`, `260815-1251_*_the-three-churn-references-record-lists-three-and-two-remain.md`, `260815-1251_*_four-shipped-consumers-exclude-a-stashes-store-the-layout-definition-no-longer-knows-about.md`, `260815-1251_*_the-reference-lints-non-plugin-root-var-branch-lost-its-data-and-its-only-behavioural-test-together.md`, `260815-1447_*_claude-mds-dispatch-parameter-bullet-asserts-orchestrator-behaviour-step-9-inverted-not-just-a-value-list.md`, `260815-0803_*_two-claude-md-inventory-rows-went-stale-and-neither-lint-gate-can-see-them.md`, `260815-1206_*_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md`

`agents/*.md`, `README*.md`, `docs/`, `hooks/lib/domain-cascade.ts` and the three `domain-cascade`/`fusion-paths` test files are `coderev`'s half of this Turn, dispatched in parallel; they are listed above because they are in the range and I did not open them, not because nobody did. Where I reached one of them it was by targeted line read or grep, and each such read is named at the finding that used it: `agents/orchestrator.md:396`, `:453`, `:485`; `hooks/lib/domain-cascade.ts:80-130`; `README-agents.md` `## Dispatch parameters`; `skills/setup/SKILL.md:82`, `:88`.

---

## The range, corrected

The dispatch named `6350854..HEAD` and reported, correctly, that `bin/fusion-review-coverage` counts **seven** uncovered commits. Those two do not agree: `6350854..HEAD` is **four** commits. The seven the tool lists begin three commits earlier, and the range that tiles them is `5d29b6d..518926d` — `b093a54^` through the Turn's last commit. That is the range this review covers, and it is the range in the header.

This is the third consecutive Turn whose review dispatch carried a range that does not match its own commit count, and it is filed as a defect rather than absorbed for the third time.

## Summary

The five commissioned checks all resolve, and four of the five come back clean: the growth baseline did not move anywhere in the range, both retired resolver arms were retired on a measurement that re-takes correctly, no other consumer lost a key, and `.claude-plugin/plugin.json` is valid, still at `8.2.0`, and no longer advertises anything the tree has lost. The fifth found what it was sent to look for: the standing `**Status:**`/marker class took two new instances, one from each of the Turn's two decision-record transitions. Four defects are filed, two Medium and two Low; none is behavioural and none blocks the next step.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 2 |

---

## The five checks

### 1. `RULE_BASELINE` across all seven commits — clean

**No baseline number moved anywhere in the range.** The `RULE_BASELINE` block was extracted at each of the eight boundary commits and hashed; it is byte-identical at every one (block sha `fd3d875dabe8`, 17 lines). `RELEASE_CAP` (105 354), `GROWTH_BUDGET` (12 000) and `DRIFT_CEILING` (145 144) are likewise unmoved. The only edit to `rules-emission-golden.test.ts` in the whole range is a nine-line comment change on the `ROLES` entry for `design-diagrams.md`, explaining why that entry did *not* move. Nine commits held before this range; sixteen hold now.

**The golden itself is accurate**, verified independently of `vitest` rather than by running the suite — `coderev` is working the same tree in parallel and `332267a`'s own diagnosis is that two concurrent runs race on `hooks/dist`. Instead: `bin/fusion-rules` was run for each of the fifteen agents, each emitted plugin-side rule file measured with `wc -c`, and the per-file lines and per-agent totals compared to the fixture. **Every line and every total matches**, and the fixture's agent blocks are exactly the fifteen agents on disk — the `conceptrev` and `investigator` blocks are gone and nothing else was disturbed.

Arithmetic on the always-on core, since it is the half that blocks: emitted 86 955 (3 499 + 52 436 + 4 291 + 16 788 + 9 941) against a floor of 86 573, delta +382 against a 12 000 budget. Worth one line in the Turn's own record: a removal Turn grew the universal core by 127 bytes (86 828 → 86 955), because `fusion-workbench-conventions.md` gained 154 while `agent-setup.md` and `critical-stance.md` shed 31 between them. Nowhere near anything, and not a finding — but the direction is the opposite of the Turn's purpose and it is cheaper to notice now than to re-derive later.

One finding came out of this check and it is about the other direction: `rules/design-diagrams.md` shrank 839 bytes *below* its baseline entry. Filed Low, below.

### 2. The two removed resolver arms — measurement re-taken, clean

**Re-taken with the resolver's own criterion**, which is the `$`-prefixed form `bin/fusion-paths:238` actually greps for, not a bare-word match. At `5d29b6d`, `$OUT_INVESTIGATION` had exactly one consumer (`agents/investigator.md`) and `$SCAN_INVESTIGATIONS` exactly one (`agents/conceptrev.md`). Both prompts were deleted in this range, so both keys reach zero consumers. The retirement stands on a correct measurement.

**`shared/investigations/` still exists** and `skills/setup/SKILL.md:82` still creates it in a fresh workbench. It is empty in this repository, which is consistent with the write-frozen state `rules/fusion-workbench-conventions.md:86` describes; in a consuming project it keeps whatever reports are in it.

**Nothing else lost a key by accident.** Every one of the 21 surviving keys has at least one shipped consumer at HEAD, so the retirement criterion catches nothing further:

```
OUT_PLAN 3   OUT_HISTORY 15  OUT_ISSUE 13   OUT_DECISION 7   OUT_REVIEW 2
OUT_ANALYSIS 1  OUT_CONSULT 1  OUT_MEMO 2   OUT_BACKLOG 2    OUT_CIRCLE 3
SCAN_PLANS 15   SCAN_ISSUES 16 SCAN_DECISIONS 17  SCAN_HISTORY 13  SCAN_REVIEWS 8
SCAN_ANALYSES 5 SCAN_CONSULT 2 SCAN_BACKLOG 3     SCAN_CIRCLES 7
PORTFOLIO 4     TASKLIST 8
```

Two consumers did change key set, and both are explained rather than accidental:

- **`agents/orchestrator.md` dropped `$SCAN_ANALYSES`.** `0894d0d` deleted the measurement block that fed the retired `strategic`/`knowledge` branches — `commits`, `analyses_count`, `issues_count`, `decisions_count` — and `analyses_count` was the orchestrator's only use of the key. Nothing else in the prompt reads the analyses store. The key survives with five consumers, so it is not a candidate for retirement. Correct, and worth recording because it is a key loss that the retirement reasoning does not cover and a later reader could mistake for one.
- **`skills/archive/SKILL.md` dropped `SCAN_INVESTIGATIONS`.** No capability was lost: the skill wrote the name **without** the `$`, so the resolver's derivation grep never saw it and `bin/fusion-paths archive` never emitted the key. It was prose, not a consumer. This is exactly what `260815-1339_*_step-7-named-a-review-coverage-sender-set-that-does-not-exist-and-orphaned-scan-investigations.md` measured, and I confirmed it against `5d29b6d:skills/archive/SKILL.md:62` before drawing the conclusion — the skill still names investigations at `:81` and `:108` as out-of-tier-by-construction, which was true before this Turn and is true after it.

Every agent and every skill resolves through `bin/fusion-paths` at exit 0; no consumer hits the exit-4 membership check.

### 3. The two record transitions — both correct, both left a stale head field

**The superseded decision (`_o_`→`_s_`).** `260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`, transitioned in `7260bbc`. The marker is right: the decision vocabulary has no closure and this record's subject was removed rather than answered. It carries a `Superseded by:` footer citing `_t_circle.md` § Grounding snapshot item 5, and the section exists. The footer does more than the marker requires — it re-takes the measurement the record had disputed rather than simply asserting the record was overtaken, which is the thing the record was filed to contest. Good work, and the citation resolves.

**The implemented decision (`_a_`→`_i_`).** `circles/…/260815-0029_*_what-triggers-the-analyst-executor-set-once-strategic-and-knowledge-are-gone.md`, transitioned in `0894d0d`, its `Implemented:` line moved from a placeholder to `0894d0d` in `518926d`. **The hash resolves** and it is the right commit — `0894d0d` is the step-9 commit that landed option 1. Self-reference is correct here and not a defect: the commit that implements a decision cannot know its own hash, so a placeholder plus a follow-up is the only available shape, and the follow-up commit message says exactly that. Every line citation in the footer was checked and all three resolve at HEAD: `agents/orchestrator.md:396` is the unconditional `**Executors:**` prefix, `:453` is the `analyst` strategic-deliverable row of the routing table, and `260814-2306-orchestrator-session.md:153` is the `## Plan gate — approved, with four answers` heading the `Answered:` line points at.

**Both left `**Status:**` disagreeing with the new marker** — see check 4.

### 4. The standing `**Status:**`/marker mismatch — re-measured, this Turn added two

Reproducing the Turn 2 method exactly (every `*.md` under `shared/decisions/` and `circles/*/decisions/`, filename marker against the `**Status:**` head field, template vocabulary `_o_`→open, `_a_`→answered, `_i_`→implemented, `_d_`→deferred, `_s_`→superseded, archive excluded):

```
5d29b6d   total=90  mismatched=35     <- the Turn 2 measurement, reproduced
6350854   total=90  mismatched=35
518926d   total=90  mismatched=37     <- HEAD
```

**The store did not grow — both transitions were renames — so the count rose by exactly the two records this Turn transitioned**, and the set difference confirms it names no others:

| Marker | `**Status:**` says | Record |
|---|---|---|
| `_i_` | `answered` | `circles/…/260815-0029_*_what-triggers-the-analyst-executor-set…` |
| `_s_` | `open` | `260812-0254_*_should-the-investigator-get-case-folders…` |

**Two of two decision transitions in this Turn produced a mismatch.** The rate is what is worth reporting: Turn 2 held the number flat at 35 across nine commits, and this Turn moved it on both of its opportunities. The `_s_` case is the sharper of the two — that record's `**Status:**` still reads `open`, three lines above a `Superseded by:` footer written in the same commit, so the file contradicts itself within one screen.

**Not refiled.** This is the class in `260811-2146_*_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker-and-twelve-keep-the-unfilled-template-stub.md`, which measured 34 of 67 and remains open with the right fix direction (the transition needs an owner and a write moment, the way `282ef42` gave the Circle record one). Two instances added; cross-referenced, not duplicated. The evidence for acting on it is now stronger than when it was filed: the class has survived four measurements and every decision transition since has landed in it.

### 5. `.claude-plugin/plugin.json` — clean

- **Version is still `8.2.0`.** Step 15 owns the bump and no commit in the range touched the field.
- **Valid JSON**, parses; `name`, `version`, `description`, `author`, `license`, `repository` all present and well-formed.
- **The description no longer advertises anything the tree has lost.** `churn detection` is gone, which closes item 2 of `260815-1206_*_three-churn-references-survive-step-4…` — that item was confirmed still true at HEAD by the Turn 2 review and is now fixed. The `investigator parameterised by a project-supplied capture-layout rule` clause is gone, correct: the agent and `templates/investigator-capture-layout.md` both left in `7260bbc`.
- **What it still claims is still true**, checked rather than assumed. "3 parameterised by domain — code/data" agrees with the roster's single authoring home, `README-agents.md` `## Dispatch parameters` ("Three agents are parameterised by domain, and `planner` is not one of them"), and with the two surviving values. "compliance guard" and "decision-record tracking" hold. "real-time browser-based monitor with session-scoped ETA estimation" holds — `bin/monitor` is present and carries the ETA machinery.

---

## Verified clean, no finding

- **`fusion-workbench/orchestrator-events.jsonl`** — 1 543 lines, all 1 543 parse as JSON, no blank or truncated record. Every commit in the range carries a `commit` event. Timestamps follow the project's UTC-without-`Z` convention throughout.
- **The plan's inline step markers.** Steps 7, 8 and 9 all carry `[DONE]` at `:241`, `:255`, `:268`. The defect closed as `260815-0804_*_three-plan-steps-have-landed-and-the-plan-carries-no-inline-state-marker-for-any-of-them.md` has stayed closed for a second Turn.
- **The plan's `## Open questions` entry on the investigations arm** was updated in place with the answer step 8 reached, the measurement it rested on, and a citation to the record that disproved the premise. This is the shape the earlier stale-premise findings asked for.
- **The Circle record and session history**, including the uncommitted working-tree edits at the time of review. `_t_circle.md`'s Turn log closes Turn 3 as `commits 6350854..518926d`, and the history file's `### Turn 3` section lists `a17cc8c, 7260bbc, 0894d0d, 518926d`. The two agree with each other and with git.
- **The `RULE_BASELINE` cut-log entry naming `conceptrev` and `investigator`** (`rules-emission-golden.test.ts:304`) is **not** stale and should not be corrected. It is the dated 2026-08-05 entry recording what the six-agent diagram audience was on the day that figure was measured, and the doctrine above it keeps those lines precisely so each number stays attached to the state that produced it. Rewriting it would destroy the record it exists to be.
- **`bin/fusion-paths`'s own comment block and `rules/workbench-path-resolution.md:80`** were both rewritten in step 8 with the retirement, its criterion, and the exit-4 guard that makes a later re-addition loud. The four-to-three transition in "the unconditionally-shared kinds" is carried consistently across the resolver comment, the rule file and `skills/archive/SKILL.md:62`.
- **`skills/setup/SKILL.md:82` and `:88`** still create and describe `shared/investigations/` as one of the four shared-only kinds, consistent with `rules/fusion-workbench-conventions.md:86`'s write-frozen framing.

## Findings

Filed as separate records in this Circle's issue store; each is self-contained and none is restated here.

| Severity | Record |
|---|---|
| Medium | `260815-1455_*_plan-step-9s-mechanical-acceptance-grep-fails-at-head-on-a-step-marked-done.md` |
| Medium | `260815-1455_*_turn-3s-reviewers-were-dispatched-on-four-of-the-seven-uncovered-commits-for-the-third-turn-running.md` |
| Low | `260815-1455_*_the-emission-comment-says-five-diagram-producers-and-the-selector-two-hundred-lines-above-it-picks-four.md` |
| Low | `260815-1455_*_design-diagrams-md-fell-839-bytes-below-its-baseline-and-the-doctrine-has-no-event-for-a-shrink.md` |

## Standing classes this range added to — cross-referenced, not refiled

- **`260811-2146_*_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker…`** — two new instances, 35 → 37 of 90, both from this Turn's two decision transitions. Measurement in check 4.
- **`circles/…/260815-1339_*_step-7-named-a-review-coverage-sender-set-that-does-not-exist-and-orphaned-scan-investigations.md`** — its second finding is now answered: step 8 retired the arm the record said step 7 had kept. Its **first** finding, the missing sender discriminator in `reviewFiles()`, is still live and is why `bin/fusion-review-coverage` reports this Circle's own `conceptrev` plan review as `UNUSABLE` on every run. The record is correctly still `_o_` on that half; its second half's premise is now historical and should say so when it is next touched.

## Recommended sequencing

1. **The dispatch range** (`260815-1455_*_turn-3s-reviewers…`). Cheapest of the four, and it is the only one whose cost compounds: it has recurred three Turns running, its current mitigation is that each reviewer independently notices, and the thing it silently corrupts is the coverage measurement the next Turn reads. One command at Step 3c.
2. **Plan step 9's acceptance line** (`260815-1455_*_plan-step-9s…`). Before step 10, which names `hooks/lib/domain-cascade.ts` again and will meet the same contradiction from the other side.
3. **The `bin/fusion-rules` count** (`260815-1455_*_the-emission-comment…`). A one-word edit; fold it into whatever next touches that file.
4. **The baseline shrink** (`260815-1455_*_design-diagrams-md…`). Last, and it is a decision before it is an edit — whether an incidental shrink re-baselines is not the next executor's call to make, and this Circle will produce more instances of it before it closes.

# Planner — plan for the eight removals, the surface collapse and the cap extension

**Date:** 2026-08-15
**Agent:** planner
**Status:** Complete
**Circle:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth`
**Dispatched by:** user, with the Circle named on the dispatch prompt (`**Circle:**` parameter)

---

## What was asked

Write the implementation plan for the active Circle. The Circle record is the spec — there is no
separate spec file. The dispatch named the answered decision on the `/fusion:cleanup` gate
(option 1, the gate blocks) and required it to be read before the `CLAUDE.md` step was planned.

## What was produced

`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`

Fifteen executor steps and one user gate. Thirteen steps to `coder`, two to `ontocoder` (the
structured-data tail of the Plane and churn removals), and the `CLAUDE.md` narrative pass as a
gate rather than a step, because the curator is not in the active executor set and the pass is
the curator's behind a user gate by this Circle's own answer.

## Method

The plan was written against the tree rather than against the record alone. A reference census
was run over every shipped surface (`agents`, `skills`, `rules`, `bin`, `hooks`, `docs`,
`templates`, the three READMEs, `CLAUDE.md`, `.claude-plugin`, `install.sh`, `settings.json`,
`fusion-guard.json`) for each of the eight mechanisms, and each step's file list is what that
census returned rather than an estimate of blast radius. The two resolvers, the growth-bound test,
the three lint gates, `hooks/tracker.ts`, `bin/monitor`, `agents/orchestrator.md` and
`skills/cleanup/SKILL.md` were read directly.

## Findings that changed the plan

Six things were found that the record's outline does not anticipate, and each of them moved a
step.

1. **The reference and enumeration lints make the sweep decidable.** `reference-resolution-lint`
   resolves every plugin-shaped path in every shipped text file and fails on a dangling one;
   `derivable-enumerations-lint` re-derives the skill roster, the agent counts and four other
   enumerations from the tree. That is what the plan's `**Decidability:**` line rests on, and it
   forces two orderings: a citation is removed before its target, and the enumeration half of
   `CLAUDE.md` lands with each removal instead of waiting for the curator.

2. **The `CLAUDE.md` pass is two things.** The record asks for one step. The narrative half can be
   one step; the enumeration half cannot, because `npm test` asserts it against the tree. The
   split is mechanical — *does a test assert it?* — and is written into the plan's Approach.

3. **`hooks/lib/domain-cascade.ts` must be rewritten, not deleted.** The record lists it under the
   removal. It is the only executable definition of a decision that survives the removal of two of
   its four outcomes; deleting it would recreate the second-copy defect it was built against.

4. **`hooks/lib/state-drift.ts` exports two helpers that two surviving measurements import.**
   `staging-drift` and `review-coverage` both use `readStateFile` and `stateField`. The extraction
   into a new `hooks/lib/state-file.ts` is the first instruction of that step, not a note on it.

5. **There are no two churn panels in `bin/monitor`.** There is one warnings panel, and churn
   reaches it as two of its event types. Removing "two panels" would remove the panel that the
   guard blocks and the halt notices also use.

6. **`skills/cadence/SKILL.md` uses "churn" for an unrelated measurement.** Nine occurrences, all
   keepers — its churn is themes by distinct sessions. Only its `conceptrev` prose example changes.

## The staging-drift / review-coverage question the record asked to be answered explicitly

Both stay. The criterion is whether the measurement's subject survives the Circle. `state-drift`
measures `progress.commits` and `progress.turn`, whose subject this Circle removes.
`staging-drift` measures what the workbench holds that no commit carries — the git index and the
working tree, untouched here. `review-coverage` measures which commits no review opened; it reads
`session.git_head_at_start`, an anchor rather than a counter, and loses only the `conceptrev`
sender value.

The criterion does not cover `state-drift`'s three other rows, whose subjects survive. The plan
says so rather than implying uniformity: those three are deleted on the second measurement the
record cites — every `state_drift` firing in both projects was `agentstate.yaml` against git, so
they have never fired — and the consequence is raised as an open question, because after the step
nothing notices a frozen Circle Turn log.

## Filed alongside the plan

**Decisions** (both block a step, both cited from the plan's Open Questions):

- `decisions/260815-0029_o_what-triggers-the-analyst-executor-set-once-strategic-and-knowledge-are-gone.md`
  — `agents/orchestrator.md:434` passes the extended executor set on a condition that item 7
  deletes. Blocks step 9. Recommended: pass it unconditionally and let the planner route, because
  the orchestrator decides it one phase before the plan that would answer it exists.
- `decisions/260815-0029_o_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md`
  — the two choices `shared/issues/260810-0326_*_…` left open, one of which it explicitly calls a
  decision rather than an executor's call. Blocks step 12.

**Defect:**

- `issues/260815-0029_o_the-circle-record-cites-the-investigator-case-folder-record-as-an-issue-and-asks-for-a-transition-that-vocabulary-has-no.md`
  — the record's Dependencies bullet names a `shared/issues/` path for a file that is a decision
  record in `shared/decisions/`, and instructs "close it", which the decision vocabulary does not
  have. The correct transition is `_o_` → `_s_`, and the plan's step 8 performs that one.

## Measurement taken at planning time

Recorded here as a reference reading only; the plan's step 1 re-takes it at execution time,
because the tree may move between the plan and its approval. HEAD `9a7da8e`.

| Surface | Reading |
|---|---|
| Rule bytes per dispatch, `coder` | 95 023 (87 670 plugin rules + 7 353 chat voice profile) |
| Rule bytes per dispatch, `orchestrator` | 130 440 |
| `agents/*.md` | 460 292 bytes / 4 684 lines |
| `skills/*/SKILL.md` | 294 134 bytes / 3 632 lines |
| `rules/*.md` | 154 092 bytes |
| Hook source | 7 934 lines |
| Hook tests | 25 897 lines across 49 files |
| `bin/*` | 6 135 lines |
| Orchestrator Setup read | 464 893 bytes ≈ 116 223 tokens, of which `tasklist.md` is 162 038 bytes ≈ 40 510 |
| Growth-bound head-room, core-only role | 10 903 bytes (87 670 emitted against a floor of 86 573 + 12 000) |

## Not done, and left to whoever picks this up

- The Circle record's `**Active spec/plan:**` field still reads `(none yet)`. Updating a Circle
  record is not the planner's write; the orchestrator or the user sets it to the plan's path.
- No executor was dispatched and nothing was implemented, per the planner's scope.

---

## Correction pass, 2026-08-15 03:54

A second planner run against the same plan file, dispatched after the user approved the plan at
the gate on condition that the numbering contradictions be repaired. Nothing was re-derived and
no measurement was re-taken; the plan's structure, step order, executor assignments and
acceptance criteria are untouched. The inputs were the `conceptrev` review
(`reviews/260815-0044-conceptrev-plan-remove-eight-mechanisms-and-cap-growth.md`, verdict
acceptable) and the three answers the user gave at the gate.

**The numbering, which is why the user held execution.** Three sentences of prose disagreed with
the dependency diagram, and the diagram was the correct surface in each case. The
`**Decidability:**` line and `## Approach` point 2 both placed the curator's `CLAUDE.md` pass "at
step 13"; it is gate G1, which stands after step 12 and before step 13. That error was the
dangerous one: a reader following the prose arms the growth bound before the curator gate, which
is the single ordering the plan forbids. `## Approach` point 5 said step 15 re-takes the
before-measurement; step 14 does, and step 1's own body already said so. The file was then
searched for a fourth instance and none exists. Every surviving reference to steps 13, 14 and 15
was checked individually and each is correct as written.

**The count in `## Current State`, re-derived rather than taken on trust.** The claim that nine of
sixteen steps touch `agents/orchestrator.md` was wrong in both numbers and in its enumeration. The
step file lists were parsed mechanically, with brace groups expanded: eight steps edit that file,
2, 4, 6, 7, 8, 9, 10 and 11. Step 12 edits `agents/curator.md`, not the orchestrator, and steps 1
and 14 read the file inside a `wc -c` command without changing it, so all three were counted
wrongly as editors while step 8, which does edit it, was missing from the enumeration entirely.
The same parse settled the sentence's second half: the same eight steps also edit
`rules/fusion-workbench-conventions.md`, six of them `skills/setup/SKILL.md`, and four of them
`README-hooks.md`. The original claimed six for all three, which held only for the middle one. The
denominator is fifteen, the number of numbered steps; gate G1 is not a step and the plan says so.

**The second diagram.** `conceptrev`'s second finding was a judgement call the user did not rule
on. The graph drew four measured surfaces converging on one `hard bound · FAILS` node, which reads
as a pooled budget in which growth in `agents/` is paid for by shrinkage in `skills/`. Step 13
specifies four independent bounds. The node was split into four, one per surface, each edge
labelled "own floor, own head-room" and each bound carrying its unit, and a sentence beneath the
block states the independence in words. Both blocks were re-rendered with mermaid-cli 11 to
confirm they still parse: diagram 1 unchanged at 18 nodes and 17 edges, diagram 2 now 14 nodes and
8 edges, still acyclic and still without a god-node.

**The three answers folded into the steps.** All three left `## Open Questions`, which now holds
the two plan-local questions that resolve at execution time.

- The analyst-executor decision is answered option 1. Step 9 now instructs the deletion of the
  orchestrator-side condition at `agents/orchestrator.md:434` and the unconditional prefix of
  `**Executors:** coder, ontocoder, analyst` on every planner dispatch, with the planner's routing
  rule unchanged in substance and the `README-agents.md` roster row rewritten in the same change.
  Its Dependencies line no longer waits on the decision. The `**Decidability:**` line's second
  paragraph was kept in place and rewritten: the question it named as undecidable is answered by
  moving the decision to the planner, which is the change of mechanism that paragraph itself
  proposed.
- The permission-grant decision is answered, part (a) option 2 and part (b) option 1. Step 12 now
  carries the ask-once-defaulting-to-yes behaviour, the plain-words naming of the file and of
  `bypassPermissions`, what a declining user gets, and the deletion of the inert `settings.json`
  with its `install.sh` copy entry. Both constraints from the record are stated in the step: the
  merge procedure is `/fusion:unlock`'s and is not re-implemented, and that skill's gitignore step
  travels with it.
- State-drift goes whole, all five rows. Step 11 records that the user was shown the one-way door
  and accepted it, on the evidence that the three surviving-subject rows have never fired in
  either measured project, and that re-adding one later is a new measurement rather than a revert.
  The step's first instruction, extracting `readStateFile` and `stateField` into
  `hooks/lib/state-file.ts` before the deletion and in the same commit, is unchanged. The matching
  row in `## Risks & Mitigations` was updated to say the question was put and answered rather than
  that it remains open.

The plan's `**Status:**` moved from `Draft` to `Approved`, which is what the gate decided.

## Not done in this pass

- Nothing was implemented and no executor was dispatched.
- The two remaining open questions were left untouched, as instructed: `bin/fusion-paths`'s
  `OUT_INVESTIGATION` arm, and whether the Circle record's Dependencies bullet is corrected.
- `conceptrev`'s two cosmetic notes were not acted on: the inert `direction` restatement in both
  blocks, and the portability of the cluster-to-cluster edge in diagram 2, which carries the
  "baselines taken AFTER the removals" caption. Neither was raised by the user and neither
  affects what an executor does.

---

## Second correction pass, 2026-08-15 08:35

Dispatched by the user with the Circle named, after Turn 1's two reviews (`c4761dc`) and the defect
they filed. Steps 1 to 3 have landed (`d78dfb7`, `d0ddabb`, `7c12d6a`); step 4 was held on this pass.
Nothing was implemented, no executor was dispatched, no measurement was re-taken.

### What the pass was given

`issues/260815-0804_o_the-plan-still-carries-the-false-premise-step-2-disproved-and-steps-4-and-11-will-ship-red-on-it.md`,
plus `reviews/260815-0804-coderev-plane-mirror-removal.md` section B and
`reviews/260815-0803-ontorev-plane-structured-data-removal.md`. The instruction named steps 4 and 11,
asked that all eleven remaining steps be checked, and asked that the `**Decidability:**` claim be
narrowed rather than the plan widened.

### The premise, and how far it actually reached

The plan said at step 4 that `derivable-enumerations-lint` does not read `CLAUDE.md`'s Layout table.
It does: section 8, `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:423-495`, a closed
enumeration of the `bin/` roster in both directions. Read at source in this pass, not taken from the
issue.

The reach is wider than that one section, and this is the finding the pass added. Two gates decide
gate-forced-versus-narrative, not one, and the second has no section structure at all:
`reference-resolution-lint.test.ts` scans `CLAUDE.md` **entirely** — every line, not a table or a
listing — and resolves any token shaped like a plugin path, plus `settings.json`, `install.sh`,
`CLAUDE.md`, `README*.md` and `.claude-plugin/plugin.json` by name. So the question is never *which
part of the document is this* but *what token does this text carry*. The plan's `## Approach` had
sorted by document section (`Layout table rows` → narrative), which is what produced the false
sentence; the criterion itself (*does `npm test` assert it?*) was correct and is unchanged.

### Every remaining step, checked, with the method

For each step: the files it deletes or adds, then `grep` for each of those names across the scanned
surface (`rules/ agents/ docs/ templates/ skills/*/SKILL.md README*.md CLAUDE.md`, plus `bin/*` and
`install.sh` comment lines), then the eight re-derived enumerations read at source in
`derivable-enumerations-lint.test.ts` and matched against what the step deletes.

| Step | Verdict | What was found |
|---|---|---|
| 4 | **corrected** | The false sentence replaced. The `bin/fusion-churn-rank` Layout row (`CLAUDE.md:38`) is asserted twice over — section 8 and the row's own path token — and lands in step 4's commit. Two further gate-forced citations added: `README-hooks.md:163` cites `bin/fusion-churn-rank`, and `bin/fusion-source-root:61` does the same in a scanned shell comment. Step 4 now leaves **nothing** for G1. |
| 5 | clean | Config leaves only; deletes no file in any enumeration and no shipped text names them by path. |
| 6 | **corrected** | Three gate-forced edits the plan omitted. `CLAUDE.md:55` carries a `/fusion:circle-stash` mention **outside** the skill listing, and the phantom check scans the whole file. `CLAUDE.md:41` (the `bin/fusion-commit-lock` row) spells `rules/workbench-stash-and-lock.md` as a path, which the rename dangles. `README-agents.md:197`'s Conditional bullet must co-mention the renamed rule with `` `orchestrator` `` on one line (section 4). The two `README-agents.md` skill-table rows are also named explicitly. `CLAUDE.md:137`, the `DEFINITION_SITES` echo, writes bare basenames and was already correctly covered. |
| 7 | **corrected** | The digit claims are **five, not three**: `CLAUDE.md` ×3, `README.md:3`, `README-agents.md:196`, all five in the lint's `CLAIMS` list. `README.md` was absent from the file list and was added. |
| 8 | **corrected** | Same five-digit correction, and `README.md` added. The issue's ruling that the `templates/` row is narrative is right for `CLAUDE.md:51` (bare filename) and **wrong for `CLAUDE.md:122`**, the "Where to look" row, which spells `templates/investigator-capture-layout.md` as a path and is therefore gate-forced. Both are now named, with the difference stated. |
| 9 | clean, said so | Deletes no file in any roster; `domain-cascade.ts` is rewritten. Its two `CLAUDE.md` passages (`:16`, `:60`) carry no path, no `/fusion:` token and no asserted digit. A sentence was added saying the `CLAUDE.md` file-list entry is the curator's, so it is not read as an unstated obligation. |
| 10 | clean, said so | Same shape. `tasklist.md` appears only under a `fusion-workbench/` label, which is not a plugin-tree path. One gate-forced citation exists — `agents/orchestrator.md:947` spells `hooks/lib/__tests__/queue-ground-producer.test.ts` — and it sits inside `#### What this is, honestly`, which the step deletes whole. Stated so the executor does not go looking. |
| 11 | **corrected** | The trap by omission, plus one the reviewers did not name: the step **creates** `hooks/lib/state-file.ts`, and the `hooks/lib` table check is exact set equality in **both** directions, so an added module without a `README-hooks.md` row is as red as a deleted one with a surviving row. Four gate-forced edits now enumerated: the `CLAUDE.md:43` Layout row, the two `README-hooks.md` table changes, `README-hooks.md:165`'s path citation, and the header comments at `bin/fusion-staging-drift:29` and `bin/fusion-review-coverage:31`. |
| 12 | **corrected** | Two omissions. Deleting the plugin-root `settings.json` dangles a **named** token in the lint's own path grammar: `CLAUDE.md:108` carries three occurrences and `install.sh:77` one, and the plan's sentence *"that statement stays true after the file is gone"* is true and beside the point. And the phantom-skill check reaches beyond the listing: `CLAUDE.md:108`, `README.md:95` (three occurrences) and `README-agents.md:41` each cite a skill this step deletes. |
| 13 | **corrected**, one clause | The shared growth helper must land under `hooks/lib/__tests__/helpers/`; a new `hooks/lib/*.ts` would need a `README-hooks.md` table row in the same commit. |
| 14, 15 | clean | Measurement and release preparation; neither deletes nor adds a file in any enumeration. |

Step 2's own text (`:173`) still carries the false premise and was **left alone**: it is `[DONE]`, its
executor corrected it at run time and recorded the correction, and rewriting a landed step's
instruction would falsify the record of what was planned. Noted here instead.

### The Decidability line

Narrowed to what the evidence supports, per `rules/critical-stance.md` §3, with no mechanism added
and no work planned for the two uncovered classes. Decidable: path-shaped citations in shipped text.
Not decidable: the workbench, which `reference-resolution-lint` does not scan
(`shared/issues/260812-1720_*_…`; seven open records naming deleted Plane paths, tabulated in
`issues/260815-0803_*_seven-open-defect-records-…`), and bare filenames in the `templates/`, `docs/`
and `stilwerk/` inventory rows (`issues/260815-0803_*_two-claude-md-inventory-rows-…`). The count of
those records is seven as verified in that issue at `7c12d6a`, not the nine the dispatch prompt
named — the wider grep returns fifteen files, of which the extras are the review-filed records that
legitimately name the deleted paths as their subject.

### Also corrected, because they restated the same false premise

`## Testing Strategy`'s description of `derivable-enumerations-lint` listed six of its eight checks
and omitted the `bin/` roster — the one that produced the defect — and the stash-manifest field
count. `## Risks & Mitigations`' row about deferred enumeration edits said "the three assertions";
a second row was added for the failure mode itself, deciding by document section.

### Not touched, as instructed

Step substance, order, executor assignment, acceptance criteria, the `[DONE]` markers, the
`## Open Questions` section, and both Mermaid diagrams — verified byte-identical after the pass,
along with all fifteen step headers and every `## ` heading. No step number moved. The plan grew from
69 608 to 81 607 bytes.

### Not done

- Nothing implemented; no executor dispatched; no test suite run.
- No new issue or decision filed. Everything this pass found is a correction to the plan's own text,
  which is the artifact the dispatch handed over; the two record-sweep obligations the reviewers
  filed are theirs and remain open.

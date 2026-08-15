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

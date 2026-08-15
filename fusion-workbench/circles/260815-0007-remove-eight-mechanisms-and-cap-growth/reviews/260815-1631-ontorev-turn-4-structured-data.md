# Turn 4 — structured data, configuration, the resolver and the records

**Sender:** ontorev
**Reviewed-range:** `518926d..1e29572`
**Not-opened:** `.gitignore`, `agents/coder.md`, `agents/coderev.md`, `agents/curator.md`, `agents/ontocoder.md`, `agents/ontorev.md`, `agents/playmaker.md`, `agents/reconciler.md`, `agents/taskplanner.md`, `bin/fusion-review-coverage`, `bin/fusion-source-root`, `bin/fusion-staging-drift`, `bin/fusion-state-drift`, `bin/monitor`, `docs/philosophy.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1530-coder-remove-persisted-tasklist.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1559-coder-remove-session-counters-and-drift-machinery.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1617-coder-collapse-administrative-surface.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1455_o_design-diagrams-md-fell-839-bytes-below-its-baseline-and-the-doctrine-has-no-event-for-a-shrink.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1455_o_plan-step-9s-mechanical-acceptance-grep-fails-at-head-on-a-step-marked-done.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1455_o_the-emission-comment-says-five-diagram-producers-and-the-selector-two-hundred-lines-above-it-picks-four.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1455_o_turn-3s-reviewers-were-dispatched-on-four-of-the-seven-uncovered-commits-for-the-third-turn-running.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1501_o_four-cardinal-words-still-count-items-the-removals-deleted-and-no-gate-reads-a-cardinal-word.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1501_o_setup-step-5s-worked-example-says-this-repository-counts-88-source-files-and-the-helper-beside-it-returns-118.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1501_o_the-reach-gate-is-blind-to-a-copy-written-only-in-the-retired-domain-names-and-reach-holes-does-not-say-so.md`, `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-1501-coderev-turn-3-conceptrev-investigator-domain-values.md`, `hooks/dist/lib/domain-cascade.js`, `hooks/dist/lib/events.d.ts`, `hooks/dist/lib/git.d.ts`, `hooks/dist/lib/git.js`, `hooks/dist/lib/guard-state-file.d.ts`, `hooks/dist/lib/guard-state-file.js`, `hooks/dist/lib/review-coverage.d.ts`, `hooks/dist/lib/review-coverage.js`, `hooks/dist/lib/staging-drift.d.ts`, `hooks/dist/lib/staging-drift.js`, `hooks/dist/lib/state-drift.d.ts`, `hooks/dist/lib/state-drift.js`, `hooks/dist/lib/state-file.d.ts`, `hooks/dist/lib/state-file.js`, `hooks/dist/review-coverage.d.ts`, `hooks/dist/review-coverage.js`, `hooks/dist/staging-drift.d.ts`, `hooks/dist/staging-drift.js`, `hooks/dist/state-drift.d.ts`, `hooks/dist/state-drift.js`, `hooks/dist/tracker.d.ts`, `hooks/dist/tracker.js`, `hooks/lib/__tests__/commit-message-path.test.ts`, `hooks/lib/__tests__/guard-state-shape.test.ts`, `hooks/lib/__tests__/helpers/guard-harness.ts`, `hooks/lib/__tests__/hook-fail-open.test.ts`, `hooks/lib/__tests__/monitor-warnings-panel.test.ts`, `hooks/lib/__tests__/path-literal-lint.test.ts`, `hooks/lib/__tests__/queue-commit-ownership-lint.test.ts`, `hooks/lib/__tests__/queue-ground-lint.test.ts`, `hooks/lib/__tests__/queue-ground-producer.test.ts`, `hooks/lib/__tests__/queue-retirement-empty-key.test.ts`, `hooks/lib/__tests__/review-coverage-mandate.test.ts`, `hooks/lib/__tests__/state-drift-detection-lint.test.ts`, `hooks/lib/__tests__/state-drift.test.ts`, `hooks/lib/__tests__/turn-budget-lint.test.ts`, `hooks/lib/domain-cascade.ts`, `hooks/lib/git.ts`, `hooks/lib/guard-state-file.ts`, `hooks/lib/review-coverage.ts`, `hooks/lib/staging-drift.ts`, `hooks/lib/state-drift.ts`, `hooks/review-coverage.ts`, `hooks/staging-drift.ts`, `hooks/state-drift.ts`, `hooks/tracker.ts`, `README-agents.md`, `README-hooks.md`, `README.md`, `rules/workbench-path-resolution.md`, `settings.json`, `skills/archive/SKILL.md`, `skills/cleanup/SKILL.md`, `skills/curate/SKILL.md`, `skills/help/SKILL.md`, `skills/log-activity/SKILL.md`, `skills/next/SKILL.md`, `skills/revise-claude-md/SKILL.md`, `skills/setup/SKILL.md`, `skills/unlock/SKILL.md`

The `hooks/dist/*` entries are compiled build output, listed for completeness rather than because a
reviewer should read them. The `hooks/lib/**`, `agents/*.md`, `README*.md`, `skills/**`, `bin/`
scripts and `docs/` are `coderev`'s half of this Turn, dispatched in parallel; they are listed
because they are in the range and I did not open them, not because nobody did. Where I reached one
it was by targeted line read or grep, and each is named at the finding that used it:
`agents/orchestrator.md:136`, `:545`, `:948-949`, `:960-1045`; `bin/fusion-paths:227-238`, `:336-381`;
`hooks/lib/events.ts` (the `GuardEventType` diff); `hooks/lib/state-file.ts` in full;
`hooks/lib/__tests__/review-coverage.test.ts:102-116`; `hooks/lib/__tests__/staging-drift.test.ts:82-91`;
`install.sh:74-84`; `CLAUDE.md:53`, `:106`.

---

## The range

Derived from the four hashes the dispatch supplied rather than computed: `git rev-parse --short
9955e8f^` = `518926d`, and `1e29572` is the last of the four. `518926d..1e29572` tiles all four
uncovered commits exactly. This is the first Turn in four whose dispatched range needed no
correction, because it named commits instead of a range —
`260815-1455_o_turn-3s-reviewers-were-dispatched-on-four-of-the-seven-uncovered-commits-for-the-third-turn-running.md`
is the record that asked for exactly this and it can be closed on this evidence.

## Summary

All six commissioned checks resolve. Three come back clean and hold up under independent
measurement: the growth baseline is correct at every commit in the range, the resolver's key
derivation holds in both directions with no orphan and no unknown key, and the manifest is valid at
`8.2.0` with an installer copy list that now matches the tree in every entry but one. The other
three found what they were sent for. The sharpest is not a text defect: the session's own
`work_queue` misstates three of seventeen tasks, in the Turn that made that field the queue's only
durable copy and deleted the check that compared it against git.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 1 |
| Medium | 2 |
| Low | 4 |

---

## The six checks

### 1. `RULE_BASELINE` across all four commits — clean, and the golden is accurate at every one

**No baseline number moved.** `git diff 518926d..1e29572 -- hooks/lib/__tests__/rules-emission-golden.test.ts`
is empty: `RULE_BASELINE`, `RELEASE_CAP` (105 354), `GROWTH_BUDGET` (12 000) and `DRIFT_CEILING`
(145 144) are byte-identical across the range. That is the correct outcome and not an omission —
both rule-file movements in this Turn are **shrinks**, and the doctrine at
`rules-emission-golden.test.ts:183-207` moves the baseline only at a cleanup or the one-time 2026-08-14
arming.

**Verified independently of `vitest`**, as in Turn 3 and for the same reason — `coderev` is working
this tree in parallel and `332267a`'s diagnosis is that two concurrent runs race on `hooks/dist`.
Instead, the golden's claimed byte figure for every rule file was compared against `git show
<commit>:<path> | wc -c` at each of the five boundary commits:

| Commit | `fusion-workbench-conventions.md` actual | golden claims |
|---|---|---|
| `518926d` (anchor) | 52 436 | 52 436 |
| `9955e8f` | 52 436 | 52 436 |
| `dd312eb` | 52 423 | 52 423 |
| `f45f76a` | 52 378 | 52 378 |
| `1e29572` (HEAD) | 52 378 | 52 378 |

The other seven rule files are unmoved at every commit and match at every commit. **Two of the
three steps regenerated the golden and the third did not need to** — `1e29572` touches no file under
`rules/`. There is no commit in the range where a rule file moved and the golden did not, which is
the invisible failure this check exists for.

**The emission set was re-derived rather than trusted.** `bin/fusion-rules` was run for all fifteen
agents and each emitted plugin-side file measured with `wc -c`; every per-file line and every
per-agent total matches the fixture, and the fixture's fifteen blocks are exactly the fifteen agents
on disk.

One measurement trap worth recording for the next reviewer, because it produced a false positive
here before it was chased down: **`$FUSION_PLUGIN_ROOT/bin/fusion-rules` and `./bin/fusion-rules`
disagree in this repository.** The installed copy at `~/.fusion` predates Turn 3's
`workbench-stash-and-lock.md` → `commit-lock.md` rename and emits no `commit-lock.md` for the
orchestrator, giving 98 547 against the golden's 104 210. The work-tree copy emits it and matches.
This is the documented residual in `CLAUDE.md` (*"before rule or guard work in this repo: run
`fusion --update`"*), not a defect of this Turn — but a reviewer who measures through
`$FUSION_PLUGIN_ROOT` will file a phantom finding. Measure through the work tree.

Arithmetic on the always-on core, since it is the half the hard gate blocks on: emitted 86 897
(3 499 + 52 378 + 4 291 + 16 788 + 9 941) against a floor of 86 573, delta **+324** against 12 000 of
head-room. Turn 3 read +382; this Turn moved the core 58 bytes in the right direction.

### 2. `agentstate.yaml`'s new shape — the table is complete, one row is wrong, and the file on disk is in the old shape

**The derivation table is complete.** Seven fields left (`turn`, `max_turns`, `tasks_total`,
`tasks_done`, `tasks_skipped`, `tasks_errored`, `commits`) and the table at
`agents/orchestrator.md:1013-1018` carries a row for each, four rows covering the four `tasks_*`
fields in one. Nothing was dropped without a replacement named.

**Three of the four rows are correct and point at genuinely un-freezable records** — `git rev-list`,
the `turn_start` events in the append-only log, and `bin/fusion-turn-budget`. The `turn` row agrees
with `:464`, which makes the same claim from the emitter's side.

**The fourth row does not meet the criterion the sentence above it states.** `tasks_total/_done/
_skipped/_errored` are derived from "the `status` field of the `work_queue` entries in this same
file" — a hand-maintained list, in the same file, written at the same class of boundary the seven
counters were removed for. Filed Medium.

**Nothing still *reads* a removed field.** Every surviving occurrence of the seven names across
`agents/`, `skills/`, `bin/`, `hooks/`, `rules/`, `docs/`, `README*.md`, `CLAUDE.md`, `install.sh`
and `templates/` was checked and every one is either the derivation table itself or a retrospective
comment naming what left. Two are worth stating as **not** defects:

- `agents/orchestrator.md:948-949` still declares `tasks_skipped` and `tasks_errored`. That is the
  `## State Tracking` **in-memory** counter list, a different surface from the persisted file, and
  the removal was of persisted fields. Correct as written, though a reader arriving at `:948` before
  `:1017` meets two live counters with the names the table calls removed — noted inside the Medium
  finding rather than filed separately.
- `hooks/turn-budget.ts:17` and `turn-budget-lint.test.ts:24`, `:214`, `:226` name
  `progress.max_turns` in past tense, each dated to the removal. Historical, correct, keep.

**What is wrong is the file itself.** `fusion-workbench/agentstate.yaml` was written *after*
`f45f76a` landed — its own `work_queue` records `f45f76a` as P-11's commit — and still carries a
`progress:` block with all seven removed fields and no `control:` block. Two findings come out of
it, one High for the queue content and one Medium for the shape; both filed. The file is gitignored
here (`.gitignore:74`), so it is live state rather than a record, which is why the High is scoped to
resume correctness rather than to the history the curator reads.

### 3. The resolver key table — measurement re-taken, clean in both directions

**Every emitted key has at least one consumer.** Re-taken with the resolver's own criterion, the
`$`-prefixed form `bin/fusion-paths:238` actually greps for, across all fifteen agents and all
twelve skills:

```
OUT_PLAN 2      OUT_HISTORY 15  OUT_ISSUE 13    OUT_DECISION 7   OUT_REVIEW 2
OUT_ANALYSIS 1  OUT_CONSULT 1   OUT_MEMO 2      OUT_BACKLOG 2    OUT_CIRCLE 3
SCAN_PLANS 15   SCAN_ISSUES 16  SCAN_DECISIONS 17  SCAN_HISTORY 13  SCAN_REVIEWS 8
SCAN_ANALYSES 5 SCAN_CONSULT 2  SCAN_BACKLOG 3  SCAN_CIRCLES 7   PORTFOLIO 4
```

Twenty keys, zero orphans. **Every key named in a prompt is in `ORDER`** — the reverse direction —
with no exceptions, so no consumer can hit the exit-4 membership check.

**`TASKLIST` was retired correctly and completely.** It left the derivation grep (`:238`),
`value_for()` (`:360`), `ORDER` (`:382`), the comment block (`:227`) and the test's own regex and
`ORDER`-injection anchor (`fusion-paths.test.ts:42`, `:700-701`) in one commit. `grep -r TASKLIST`
over the shipped tree returns nothing. 23 keys → 20, matching the plan's arithmetic at line 458.

**The orchestrator's loss of `$OUT_PLAN` is correct.** `dd312eb` deleted the Phase-4 queue-retirement
block, which moved `tasklist.md` into the plan store under a `_c_` marker and was the prompt's only
use of the key. With no persisted queue there is nothing for the orchestrator to write to a plan
store. The key survives with two consumers (`planner`, `shaper`) and is not a retirement candidate.
The commit message names this ("the orchestrator prompt silently lost a resolver key, correctly …
but invisibly in a diff"), which is the right disposition and needs no record.

### 4. The four record transitions — all four correct; the two `_i_` citations are within the vocabulary

| Transition | Record | Verdict |
|---|---|---|
| `_a_`→`_i_` | `circles/…/decisions/260815-0007_i_does-fusion-cleanup-block-at-the-claude-md-gate-or-leave-the-ledger.md` | correct |
| `_a_`→`_i_` | `circles/…/decisions/260815-0029_i_what-permission-grant-does-setup-seed-when-unlock-becomes-a-setup-step.md` | correct |
| `_o_`→`_c_` | `shared/issues/260810-0326_c_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md` | correct |
| move + `_c_` | `fusion-workbench/tasklist.md` → `shared/planning/260815-1524_c_retired-tasklist.md` | correct placement, missing header field — Low filed |

**The `Implemented:` citations resolve.** Both name section headings that exist:
`skills/cleanup/SKILL.md:178` `## Step 5 — Reconcile CLAUDE.md (the one gate)` and `:57`
`## Autonomy and safety`; `skills/setup/SKILL.md:192` `## Step 0g — Offer to seed the project's
permission file`. Both `Answered:` lines above them resolve too:
`shared/history/260814-2306-orchestrator-session.md:103` is the `## Decision answered at the
activation gate` heading and `:153` is `## Plan gate — approved, with four answers`.

**On the commissioned question — is a path acceptable where a commit hash is not available?
Yes, explicitly, and it is not a concession.** `rules/fusion-workbench-conventions.md` `## State
Markers — decisions` defines the `_i_` annotation as `Implemented: <commit hash> **or**
<path>:<line> — <one-line summary>`, and the `### Decision files` section repeats the disjunction.
Both records take the second branch and both say why in the citation itself: *"No commit hash: the
executor does not commit, and the orchestrator's commit for this step is what carries these paths."*

Three refinements on that verdict, none of them a defect:

1. **The `Implemented:` lines cite *source* paths, not history paths.** The dispatch describes them
   as history-path citations; that is true of the `Answered:` lines above them. Citing the changed
   file is the stronger form — it points at what the decision claims is realised, which is what the
   marker means.
2. **They give a section heading rather than `:<line>`.** The vocabulary writes `<path>:<line>`, but
   its own worked transition 1 uses `…-detailed-architecture.md §4.3`. A stable heading in a file
   under active edit is the better citation and matches established practice.
3. **The residual is real and is not this Turn's to fix.** A path names a mutable file; a hash names
   an immutable tree. The precedent from Turn 3 is `518926d`, where the orchestrator appended the
   hash in a follow-up commit after the executor left a placeholder. Whether the orchestrator should
   do the same here is its call at commit time, not a defect in the records as written.

**The `_c_` issue carries its `Resolved:` footer** at `:112`, per `### Issue files`, and does more
than the rule requires: it gives a per-criterion verdict on all three acceptance criteria and states
plainly that the third is unreachable by any Setup-time mechanism, rather than closing on the plan's
word. The residual it could not settle is filed as a new `_o_` record rather than buried. This is
the shape a closure should have.

**The retired tasklist's placement is right.** `shared/planning/` is correct under the Origin Rule:
the file's own head reads `**Active Circle:** none` and `**Git HEAD at build time:** f70cb07`, four
days before this Circle existed, so it did not arise from this Directive. Moving rather than deleting
is justified in both the file's header comment and the commit message. What is missing is the
`**Status:**` field the planning vocabulary requires on `_c_`, while `**Open tasks:** 74` still reads
live in a store fifteen consumers scan. Low, filed.

### 5. The `**Status:**`/marker mismatch — 35 → 37 → **39 of 90**

Reproducing the Turn 2 and Turn 3 method exactly (every `*.md` under `shared/decisions/` and
`circles/*/decisions/`, filename marker against the `**Status:**` head field, archive excluded):

```
5d29b6d   total=90  mismatched=35
6350854   total=90  mismatched=35
518926d   total=90  mismatched=37   <- Turn 3's reading, reproduced
1e29572   total=90  mismatched=39   <- HEAD
```

**The store did not grow — both transitions were renames — and the set difference names exactly the
two records this Turn transitioned:**

| Marker | `**Status:**` says | Record |
|---|---|---|
| `_i_` | `answered` | `circles/…/decisions/260815-0007_i_does-fusion-cleanup-block-at-the-claude-md-gate…` |
| `_i_` | `answered` | `circles/…/decisions/260815-0029_i_what-permission-grant-does-setup-seed…` |

**Two of two again, and now four of four across two Turns.** Turn 2 held the count flat at 35 across
nine commits because it transitioned no decision. Turn 3 transitioned two and both landed in the
class. Turn 4 transitioned two and both landed in the class. The class is no longer a backlog of old
records — it is the current default outcome of a correct transition, because the marker rename and
the header field have no shared write moment.

**Not refiled**, per Turn 3's disposition and the standing record
`shared/issues/260811-2146_o_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker-and-twelve-keep-the-unfilled-template-stub.md`.
What is new is the evidence for acting: five measurements, and every transition since the record was
filed has added to it. The third record changed this Turn, the `_o_`→`_c_` defect, is outside this
measurement (issues carry no `**Status:**` field) and is clean.

### 6. `.claude-plugin/plugin.json` and `install.sh`

**The manifest is untouched, valid and still `8.2.0`.** It is not in the range at all — no commit
between `518926d` and `1e29572` modifies it — so step 15 still owns the bump. It parses; `name`,
`version`, `description`, `author`, `license`, `repository` all present. Its description was already
corrected in Turn 3 and none of this Turn's removals falsifies a further clause: it advertises no
skill by name, and "3 parameterised by domain — code/data" still agrees with `README-agents.md`
`## Dispatch parameters`.

**The installer's copy list matches the tree, in every entry but one.** Every tracked top-level
entry is either copied or correctly excluded:

| Copied | Correctly excluded (dev-only) |
|---|---|
| `.claude-plugin`, `agents`, `skills`, `rules`, `hooks`, `bin`, `stilwerk`, `templates`, `docs`, `README.md`, `README-agents.md`, `README-hooks.md` | `.gitignore`, `CLAUDE.md`, `fusion-workbench`, `install.sh`, `fusion-guard.json` |

`settings.json` is gone from the list and from the tree, and the comment above the loop was rewritten
to state the measurement rather than describe the deleted file. The one mismatch is `LICENSE`, which
the list names and the tree has never held — pre-existing, inert behind the `[ -e ]` guard, and filed
Low because step 12 rewrote that exact list on the premise that nothing should look like it ships
what it does not.

**The enumerations the suite gates were checked by re-derivation, not by running the suite.** All
hold at HEAD: `CLAUDE.md`'s `bin/` roster is twelve rows against twelve files, an exact set match
with `fusion-state-drift` correctly gone; the twelve `/fusion:` tokens match the twelve directories
under `skills/`; the agent digits read 15/15/14 against fifteen agents.

---

## Verified clean, no finding

- **`fusion-workbench/orchestrator-events.jsonl`** — 1 553 lines, all 1 553 parse as JSON, no blank
  or truncated record. The fourteen lines added in this range are well-formed and their
  `turn`/`task` fields agree with git at every commit. `task_done` for P-12 is not yet emitted, which
  is the in-flight state rather than a gap.
- **The `state_drift` event value, removed from `GuardEventType` while `bin/monitor:574` keeps
  styling it.** This looks like drift and is not: `hooks/lib/events.ts:34-38` states that the union is
  an *emitter's* vocabulary for data nothing can now create, while the monitor is a *reader* of an
  append-only log holding real pre-removal rows, and deleting its arm would render them at the amber
  default. The distinction is drawn explicitly at the point where a later tidy-up would be tempted.
  This is the standard the other findings are measured against.
- **The plan's inline step markers.** Steps 10, 11 and 12 all carry `[DONE]`, at `:284`, `:300` and
  `:320`, each set in the commit that landed the step.
- **The Circle record's Turn log.** `_t_circle.md:217` closes Turn 3 as `commits 6350854..518926d`
  and `:218` opens Turn 4 as *"in progress, from 9955e8f"*, which matches `turn_start_head` in the
  state file and the `turn_start` event. The Turn-3 history section added in `9955e8f` lists
  `a17cc8c, 7260bbc, 0894d0d, 518926d` and agrees with git.
- **No dangling reference to anything this Turn removed.** `bin/fusion-state-drift`, `skills/unlock`,
  `skills/revise-claude-md`, `/fusion:unlock`, `/fusion:revise-claude-md`, `settings.json`,
  `queue-ground` and `TASKLIST` all return zero live citations across the shipped tree. The twelve
  surviving `state-drift` and four surviving `tasklist.md` occurrences are every one of them a dated
  retrospective comment.
- **`hooks/lib/state-file.ts`.** The extraction is right: a file reader rather than a measurement,
  its two surviving importers unaffected by what the counters' removal decided, and the reason it was
  extracted rather than deleted with its host is written into the module header.

## Findings

Filed as separate records in this Circle's issue store; each is self-contained and none is restated
here.

| Severity | Record |
|---|---|
| High | `260815-1631_o_the-work-queue-misstates-three-of-seventeen-tasks-and-is-now-the-only-durable-copy.md` |
| Medium | `260815-1631_o_the-live-agentstate-yaml-still-carries-the-progress-block-the-commit-that-renamed-it-retired.md` |
| Medium | `260815-1631_o_one-of-the-four-derivation-rows-points-at-a-hand-maintained-field-in-the-same-file.md` |
| Low | `260815-1631_o_two-test-fixtures-still-build-agentstate-yaml-with-the-progress-block-step-11-retired.md` |
| Low | `260815-1631_o_the-control-block-is-documented-as-holding-no-counts-beside-a-field-defined-as-an-integer-counter.md` |
| Low | `260815-1631_o_the-retired-tasklist-carries-a-closed-marker-without-the-status-header-that-marker-requires.md` |
| Low | `260815-1631_o_the-installer-copy-list-names-a-license-file-the-tree-has-never-shipped.md` |

## Standing classes this range added to — cross-referenced, not refiled

- **`shared/issues/260811-2146_o_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker…`**
  — two new instances, 37 → 39 of 90. Four of four transitions across Turns 3 and 4. Measurement in
  check 5.
- **`circles/…/issues/260815-1455_o_turn-3s-reviewers-were-dispatched-on-four-of-the-seven-uncovered-commits-for-the-third-turn-running.md`**
  — **satisfied by this Turn's dispatch**, which named the four hashes instead of a range and needed
  no correction. It should be transitioned `_o_` → `_c_` with a `Resolved:` footer citing that change,
  not left open on a practice that has now worked.

## Does anything block the gate?

**No. Nothing here should stop the curator pass, and one finding should be handed to it as input.**

The gate is `/fusion:curate` reconciling `CLAUDE.md`, the rule files and the decision records against
this Circle's recorded history. What that pass reads is the committed record surface, and on the
question the dispatch actually asks — *is a record left in a state that misrepresents this session's
history?* — the answer is no:

- The plan's inline markers, the Circle record's Turn log, the session history's Turn-3 section and
  the event log all agree with each other and with git.
- All four marker transitions carry the citation their vocabulary requires, and every cited path and
  line resolves at HEAD.
- No shipped surface carries a dangling reference to anything this Turn deleted, and every
  enumeration the suite gates is correct at HEAD.

The two findings against `agentstate.yaml` sound like they contradict that and do not, for a reason
worth stating plainly: **that file is gitignored here** (`.gitignore:74`) and is live state by the
conventions' own record-versus-live-state split. It is not a record, the curator will not read it as
evidence, and a wrong row in it misleads a *resume*, not a reconciliation. That is why the High is
scoped to resume correctness.

Two things the gate should be handed rather than left to discover:

1. **The session history has no Turn 4 section yet.** This is not a defect — the pattern in this
   session is that Turn N's section is written at the Turn N+1 boundary, and Turn 4 has not closed.
   But the gate stands *inside* Turn 4, so the curator will read a history whose last entry is Turn 3
   while three further commits exist. It should be told the Turn-4 range explicitly rather than
   inferring the session ended at `518926d`.
2. **The `**Status:**`/marker class is now the default outcome of a correct transition**, four of
   four across two Turns, 39 of 90 in the store. A curator reconciling decision records against
   history will meet a store where the marker and the header field disagree in 43 % of records. The
   marker is the authority and the curator should be told so, or it will spend the pass on a class
   that already has an open record and a known fix direction.

The one thing that should happen **before** the gate rather than after it is cheap and is not a
finding: correct P-7's and P-8's rows in `work_queue` from the event log. A session interrupted at a
user gate is exactly the case that file exists for, and it is currently wrong in the direction that
replays two completed steps.

## Recommended sequencing

1. **The `work_queue` rows** (High). Before the gate, for the reason above. Two lines, read off
   `orchestrator-events.jsonl`.
2. **The `progress:` → `control:` rewrite** (Medium). Same file, next write point; folding it into
   step 1 costs nothing.
3. **The derivation row** (Medium). Before step 13, which is the last step that touches the
   orchestrator prompt. It is a decision before it is an edit — whether the row points at the event
   log or the criterion is narrowed for that row is not the next executor's call.
4. **The two fixtures and the `control:` prose** (Low, Low). Fold into whatever next touches those
   files.
5. **The retired tasklist header** (Low). Any time; it is one field and two annotations.
6. **`LICENSE`** (Low). Last, and it is a licensing question before it is an installer one.

---

## Reconciliation annotation — 260815-1913, reconciler, HEAD `9306f0a`

Confirmed against the tree, not against the markers on the records.

**The High — `agentstate.yaml`'s queue content.** Corrected and closed at
`issues/260815-1631_c_the-work-queue-misstates-three-of-seventeen-tasks-and-is-now-the-only-durable-copy.md`.
Verified at HEAD: sixteen of the seventeen entries now carry their true status and commit. **The
seventeenth does not, and the class has recurred within the same Turn:** P-15 landed as `9306f0a`
and both `current_task` and `work_queue[16]` still read `running`, with the file's `Updated:` stamp
three commits behind. Filed as
`issues/260815-1913_o_the-work-queue-misstates-p-15-again-one-turn-after-the-same-class-was-closed.md`.
This review's own reasoning is what makes the recurrence matter: `dd312eb` made this field the
queue's only durable copy and `f45f76a` deleted the check that compared it against git, both in this
Turn.

**The shape Medium — the retired `progress:` block.** Closed at
`issues/260815-1631_c_the-live-agentstate-yaml-still-carries-the-progress-block-the-commit-that-renamed-it-retired.md`.
Verified: the live file carries `control:` with `turn_start_head`, `paused_at_task` and
`directive_revisions_this_session`, and no `progress:` key. The comment above it correctly says the
counter fields left with `f45f76a`.

**The derivation-table Medium** — `issues/260815-1631_o_one-of-the-four-derivation-rows-points-at-a-hand-maintained-field-in-the-same-file.md`
stands. The `work_queue[].status` row still derives a tally from a hand-maintained field in the same
file, and the recurrence recorded above is that row's failure mode arriving.

**The six checks reproduce.** No baseline number moved (`git diff 518926d..1e29572 --
hooks/lib/__tests__/rules-emission-golden.test.ts`), the emitted key set still has at least one
consumer per key, and `TASKLIST` is gone from the resolver. Independently: `cd hooks && npm test`
run by this pass is **40 files, 751 tests, all passed**, 64.00 s.

**The `8.2.0` manifest observation is now a shipped-version fact rather than an out-of-range one.**
This review noted the marketplace manifest untouched at `8.2.0` because no commit in its range
reached it. Step 15 bumped `plugin.json`, `install.sh:27` and `README.md:26` to `9.0.0` and left the
marketplace clone at `8.2.0` deliberately. Filed as
`issues/260815-1913_o_the-marketplace-entry-advertises-five-removed-mechanisms-and-was-recorded-only-in-a-history-entry.md`.

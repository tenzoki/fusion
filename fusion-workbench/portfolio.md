# Portfolio

**Generated:** 260814-0823 (by playmaker session 260814-0823-playmaker-direct-dispatch)
**Domain bias:** code
**git HEAD at run:** `f273b9a`

## Active (_t_)

(none)

`.active-circle` does not exist and no Circle record carries the active marker. The two agree, so
no pointer warning is raised. This is the ordinary state between Circles.

## Anticipated (_a_) — ranked

**Recommended next: `260801-1244-curator` — the re-sharpening three earlier runs asked for landed
this morning, so the Circle is activatable for the first time.**

Run `/fusion:next` and confirm.

### 1. `260801-1244-curator`

**Directive.** One agent, the curator, reconciles a project's three normative surfaces (decision
records, project-owned rule files and `CLAUDE.md`) against what actually happened, and returns a
reviewed set of edits that removes what history retired and resolves what the surfaces state in
contradiction. Alongside it, the always-on rule text every agent loads gains a hard growth bound,
so the drift the agent cleans up cannot silently return.

**Why it is recommended, and why that is new.** Commit `f273b9a` landed the shaper's
portfolio-activation pass of 2026-08-14. Three earlier playmaker runs ranked this Circle first and
each declined to propose it, for three named reasons; the pass discharged all three in one go. The
Grounding snapshot was re-measured on the day it was written rather than carried forward, so the
falsification this record reported on nine consecutive runs is gone. The validation case is new and
is the project's own decision corpus, 82 records of which none is marked superseded, replacing the
proof another Circle performed by hand. The rate-bounding question is answered inside the Directive
as capability C10. The Circle also gained the founding documents it lacked: a spec at
`circles/260801-1244-curator/planning/260814-0738_*_spec-curator.md` with seven capabilities, and
all six artifact subdirectories. On the code heuristic it scores clean and the score now carries
weight: all three dependencies are closed coherent
(`260801-1244-rule-provenance-header`, `260801-1244-guard-rules-write`, and transitively
`260801-1244-guard-bash-inspection`), and the Grounding cites no open decision record. Its one
decision, on how the growth bound is armed, carries the answered marker after the user chose a
one-time re-baseline at an orchestrator gate on 2026-08-14. First place remains uncontested, since
this is the only non-terminal Circle in the portfolio, so the recommendation rests on the Circle's
own readiness rather than on the rank.

**Dependencies:** three, all closed coherent. No cycle is constructible.

**Two lag conditions, neither blocking, both cheap.** Three surfaces still describe the growth-bound
decision as open when it is answered, and the record's title still names the retired validation
case. Both are under `## Warnings`.

## Backlog — ranked

**Recommended to split first: `shared/backlog/260811-0826_*_observations.md` — 13 ideas, top one is
`radical-simplification`.**

No `/fusion:direct` line is offered, because that command promotes an entry whole and would make one
Circle of all thirteen ideas. The entry is a hand-written dump and that is a normal way to file, not
a fault. It is unchanged since 2026-08-11, while seven of its ideas were lifted onto disk as records
on 2026-08-12, so most of what it holds is now tracked elsewhere.

**Live and shapeable, ranked (3 of 13).**

1. **`radical-simplification`** — "How do we radically simplify fusion?", together with the
   observation that fusion spends its time fixing its own errors while productive work recedes.
   Ranked first because two analyses already on disk answer it with measurements rather than
   opinion, so it can be shaped today with no new analysis.
   `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`
   carries a costed removal list and the finding that the binding constraint is the rate of
   addition. `shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` names a
   single first move: derive the hand-maintained session counters from git and the event log at
   read time instead of maintaining them, which it argues removes the largest measured cost
   (bookkeeping at up to 28 percent of session time), takes 43,130 tokens out of every orchestrator
   Setup, and deletes roughly 5,400 lines of drift machinery.

2. **`bounded-executor-dispatches`** — the user's own proposed fix, written in the entry as "memory
   must be sent with every request, and agents must not run long operations without returning to
   fusion". Ranked second because the measurement splits it. The shorter-dispatch half is adopted
   for cost at about a fourfold saving in re-sent tokens; the re-injection half is rejected outright,
   because the same analysis refutes the premise that rules decay
   (`shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md`, "the rules did not
   decay, they were never in force"). Shaping this means asking the user to accept a Directive
   narrower than what they wrote, which is a conversation rather than a blocker.

3. **`attach-the-rule-to-the-act`** — the entry's Example 4, that a norm written into `CLAUDE.md` is
   an instruction and not a mechanism, so the next agent simply does not apply it. Ranked third
   despite the remedy table calling it "the one that works", because it is blocked on a deferred
   decision: `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
   carries the deferred marker, pending
   `shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`,
   which is still open. Un-defer the decision before shaping this.

**Proposed split of `shared/backlog/260811-0826_*_observations.md`,** as the pieces filing would
produce. Naming only; nothing was written.

    split shared/backlog/260811-0826_*_observations.md into: radical-simplification — Can fusion be
      radically simplified, and along which axis; bounded-executor-dispatches — Bound how long an
      executor runs before returning to the orchestrator; attach-the-rule-to-the-act — A rule lands
      with an executable check or it does not land

**Already carried by a filed record (7 of 13), so they leave the ranking rather than joining it.**
Each was filed on 2026-08-12 by the analyst pass that read this entry.

| Idea in the entry | Record that now carries it |
|---|---|
| Setup takes far too long | `shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md` |
| Agents are verbose, answering what was not asked | `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md` |
| Rules lose their effect mid-session | `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` |
| The orchestrator's instructions to sub-agents are wrong | `shared/issues/260812-0253_*_the-orchestrators-instructions-to-sub-agents-are-often-wrong.md` |
| The ETA is never computed | `shared/issues/260812-0253_*_the-monitors-eta-is-not-computed-and-the-user-has-never-seen-one.md` |
| The monitor is unreachable on localhost | `shared/issues/260812-0253_*_the-monitor-is-no-longer-reachable-on-localhost.md` |
| Cited artifact paths should be absolute so an editor can open them | `shared/decisions/260812-0254_*_should-a-cited-artifact-path-be-absolute-so-an-editor-can-open-it.md` |

**Duplicate groups named inside the entry (4).** Setup latency is an instance of the general latency
complaint, and the general one is fuller. Four separate statements describe rules and goals losing
force over a long dispatch, of which the user's own proposed fix is the fullest. Two statements
describe fusion turning inward, of which the closing question is the sharper. The examples of agents
passing unverified claims to the user and the diagnosis that an instruction is not a mechanism are
one idea with its cause, and the diagnosis is the fuller half.

**Not ideas, and named so they are not counted as any.** The churn-ranking line naming the three
most-changed files is a data point. Example 3, the circuit breaker firing on two consecutive
net-negative Turns, records a mechanism working rather than proposing one.

**One idea is only partly filed,** and it is under `## Warnings`.

**Performed this run:** nothing. This dispatch carries no user confirmation, so every operation above
is proposed. No entry was created, renamed, split, merged, closed, or deferred.

## Recently closed (_c_ / _b_)

| Circle | Marker | Closure in one line |
|---|---|---|
| `260813-0910-documentation-matches-shipped-plugin` | `_b_` | Bounded Closure on 260813 after five Turns; nine of ten plan steps landed, and the unreached step 10, verifying `docs/plane-setup.md` against `bin/fusion-plane`, is the Bounded-Closure Artifact. |
| `260813-0858-playmaker-maintains-backlog-store` | `_c_` | Closed coherent on 260813 after four Turns; the reconciler's review-needed verdict was taken as a revise recommendation and its five findings closed in Turn 4. |
| `260807-0923-guard-misst-statt-orakelt` | `_c_` | Closed coherent on 260807; the static shell classifier was deleted outright and replaced by a measurement. |
| `260805-2005-textschicht-gegen-code-nachziehen` | `_c_` | Closed coherent on 260806; four code fixes, the citation-form decision, and two new lints landed green. |
| `260801-1244-guard-rules-write` | `_c_` | Closed coherent on 260805; the reconciler's review-needed flag was resolved through a Revise-Artifact Turn. |

## Archived (_s_ / _d_)

| Circle | Marker | Why |
|---|---|---|
| `260804-1205-shell-reachability-model` | `_s_` | Superseded on 260807 by `260807-0923-guard-misst-statt-orakelt`. Neither reached nor unreachable: the user changed the mechanism, so the Directive stopped being the right one. |

Nothing carries the deferred marker.

## Warnings

### Cleared this run

**`curator-grounding-measurements-falsified`** and **`curator-circle-missing-artifact-subdirectories`**
are both resolved by commit `f273b9a`. The first stood for nine consecutive runs.

### New this run

**`curator-record-and-spec-lag-the-answered-decision`.** Three surfaces still describe the
growth-bound question as open after the user answered it. The Grounding snapshot of
`circles/260801-1244-curator/_*_circle.md` says "One question is open and is the user's to answer
before the planner plans the growth bound". The spec's `## User Decisions Pending` carries an
unticked box for it. Both cite the record by a path spelling the open marker, and the file now
carries the answered marker with the user's choice recorded on 2026-08-14. The answer arrived after
the two documents were written, so this is a lag rather than a contradiction. It does not block
activation. It would stop the planner, which is the next agent to read both files.

### Standing, each verified against disk this run

Stated once, with the record that carries the detail. None has moved.

- **`curator-record-title-contradicts-its-directive`.** The record's title and `## Dependencies`
  still name the conventions file as the validation case the Directive retired, and the title is
  what this file renders. Filed as
  `circles/260801-1244-curator/issues/260814-0813_*_the-circle-records-title-and-dependencies-still-describe-the-conventions-file-as-the-validation-case.md`.
- **`chat-voice-caps-tightened-in-the-template-only`.** `stilwerk/chat-voice-de.yaml` and
  `stilwerk/chat-voice-en.yaml` are edited and uncommitted in the working tree; the workbench copies
  that `bin/fusion-rules` actually emits still carry the looser line caps. Measured this run at
  7 358 against 7 353 bytes, and 6 800 against 6 801.
- **`installed-copy-predates-the-backlog-mandate`.** `/Users/k1/.fusion/agents/playmaker.md` is
  27 597 bytes with no occurrence of the backlog write key; the working tree's is 39 155 bytes with
  four. Both manifests read 8.1.0, so the version does not show it. Sixth consecutive run in this
  condition. Remedy is in `CLAUDE.md` under `## Release process`: run `fusion --update` and restart.
- **`release-8-2-0-is-now-blocked-on-a-judgement-rather-than-on-work`.** Both manifests still read
  8.1.0. The bump was deferred so one release would carry two Circles, and the second closed bounded
  with a Directive clause unmet. Whether that ships is the user's call.
- **`backlog-acceptance-run-still-not-performed`.** The end-to-end acceptance run for the backlog
  capability was the successor to a deferred step and went with it. Seven playmaker runs have had
  the opportunity and none could take it, for the reason two entries above.
- **`plane-setup-verification-outlives-its-circle`.** The unmet Directive clause sits inside a
  terminal Circle as
  `circles/260813-0910-documentation-matches-shipped-plugin/issues/260813-2305_*_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md`,
  so nothing schedules it.
- **`ten-open-defects-and-two-open-decisions-outlive-their-terminal-circle`.** Counted off disk this
  run: the bounded Circle's own stores hold 10 open issue records and 2 open decision records
  against 16 closed issues. A terminal Circle is terminal, so these reach a successor by citation or
  they reach the task queue, and they reach neither by sitting there.
- **`the-bounded-circles-own-acceptance-record-is-still-open`.**
  `shared/issues/260813-0825_*_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
  holds that Circle's acceptance conditions and is still open, but sits in `shared/`, so an ordinary
  reconciler pass can still reach it.
- **`write-key-defect-record-open-after-its-circle-closed`.**
  `shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
  is still open and its four acceptance conditions read as met against the working tree.
- **`one-sided-dependency-is-now-frozen-on-both-sides`.** Filed as
  `shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`,
  whose scope needs widening to cover the case where both Circles have gone terminal.
- **`fusion-direct-cannot-run-the-flow-it-documents`.**
  `shared/issues/260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`.
  Surfaced here because the backlog path from an idea to a Circle runs through `/fusion:direct`.
- **`backlog-idea-only-partly-filed`.** The observation that every operation is unbearably slow, not
  only Setup, exists on disk solely as a witness line inside a record scoped to Setup
  (`shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md`). It is
  defect-shaped rather than idea-shaped, so it does not belong in the split above, and no open record
  covers it as stated. The playmaker files no issues; this one is yours to decide.

### Graph checks

**Dependency cycles: none.** The non-terminal graph holds one node, `260801-1244-curator`, and no
edges, because every dependency it names points at an already-closed Circle. A cycle is not
constructible in it. No `## Dependency warning` section was appended to any record.

**Parent-grounding-stale events: none.** The scan ran against the one Circle carrying the bounded
marker, `260813-0910-documentation-matches-shipped-plugin`. The one non-terminal Circle names it
once, inside a playmaker activation-proposal section, and not in its `## Grounding snapshot`, so it
is not a parent under the propagation rule. No `## Parent grounding stale` section was appended.

# Analysis: fourth check of the bounded-dispatch specification, scoped to seven points

**Date:** 2026-09-07 14:34
**Type:** Gap
**Status:** Complete
**Requested by:** user, via orchestrator dispatch (targeted short check)

## Question

The third check filed seven gaps, three of them blocking. The shaper reworked the specification a
third time and reports all seven closed. Do they close, do the claims the rework introduced hold at
their sources, and do the four bought residuals stand in the specification unfalsified? The
specification was not re-read for new defects; this check covers the seven points and what the rework
added while closing them.

## Scope

Read: the current `260907-0820_*_spec-bounded-executor-dispatches.md`; the `## Grounding snapshot` in
this Circle's `_t_circle.md`; the third check's Verdict. Checked against `agents/orchestrator.md`
(the `tools:` allowlist, the Agent Routing Table, Phase 2 Step 3a items 4 to 6, Step 3b steps 2b to
2e and step 7, Phase 3 steps 1 to 4, Phase 4 steps 2a to 4, the `curator` paragraph, the dashboard
cadence rule), `agents/reconciler.md` Steps 3 and 4, `agents/curator.md` Pass 2,
`hooks/lib/orchestrator-events.ts`, `hooks/lib/__tests__/surface-growth-bound.test.ts`.

Re-measured today over `fusion-workbench/orchestrator-events.jsonl`: the 131 machine-written pairs,
the 114 bound ones, the per-agent breakdown of the long dispatches, the exempt population, the
duration quantiles, and the `session_id` coverage of `session_start` rows. Re-measured over the
working tree: the `agents/` growth-bound head-room, computed from the test file's own baseline map.

Nothing was written outside this report and the session history entry. No issue and no decision was
filed.

**Tree read.** HEAD `abcaa823`, committed 2026-09-07 14:12 +0200, branch `main`. `git status -sb`
reports `## main...origin/main` with no ahead or behind marker; the modified paths are this Circle's
record, its spec, the event log, and one untracked shaper history file. `agents/` is unmodified in
the working tree, so the growth measurement below is a measurement of `abcaa823` itself, which is the
commit the specification cites.

## Findings

### 1. The three blocking points

**Point 1, the five dispatch sites. Closed.** C3 now carries one rule plus a five-row table, and each
row was checked against the prompt text it names.

| Site the table names | Checked at | Row holds? |
|---|---|---|
| Step 3a item 4, queue task | `agents/orchestrator.md:466`, item 5 at `:473`, item 6 at `:481`, Step 3b step 1 at `:492` | Yes. Item 6 is the marking step and Step 3b step 1 is the validation run, so "item 6 is not reached" and "no validation run" name the right two things |
| Step 3b step 2b, self-healing | `:495` dispatch, `:497` the revert | Yes. Step 2d is the branch that runs `git checkout HEAD -- <files>` and emits `bugfix_failure` and `revert`, and the row excludes exactly those three |
| Phase 3 step 1 | `:641` dispatch, `:643` steps 2 to 3, `:645` the defensive case | Yes. Steps 2 to 4 are what read the Coherence verdict, and the stall falls to a branch written for an unreadable reconciler output |
| Phase 4 step 2a, closing review | `:807` step 2a with `review_done` at `:808`, rename at `:820`, `.active-circle` cleared at `:828` | Yes. Rename is step 3 and the pointer clear is step 4, both after 2a, and both are named |
| Out of phase, curator | `:1259` the dispatch paragraph, `agents/curator.md:210` and `:212` | Yes. "Never approve on the user's behalf" is the prompt's own line, and the run file's four outcome words are the curator's own vocabulary |

The shaper's claim that three of the five already have a fall-back that does the right thing is
verified at all three: the bugfixer revert is correct once a failure is real (`:497`), Phase 3's
defensive case is written for precisely a reconciler output that cannot be parsed (`:645`), and a
closure over an uncovered review range is already permitted with the gap named in the `## Closure
note` (`:812`, citing `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`).

Two smaller observations, neither a gap. The stall row for Step 3a prescribes "reports the stall to
the user" while Step 3a's own not-completed branch at `:481` emits `task_error` and shows `[ERROR]`;
the table is the operative text and is unambiguous, but a planner will notice that the decision block
above it says every site falls back to its own path. And `agents/orchestrator.md:896` restates the
bugfixer branch in a summary table; amending step 2d without touching that line leaves the summary
silent about bounded returns rather than wrong about them.

**Point 2, the bugfixer revert. Closed.** The row reads "**Step 2d does not run.** No `git checkout
HEAD -- <files>`, no `bugfix_failure` and no `revert` event", and the paragraph under the table names
this as the one place where the mechanism as previously specified was worse than no mechanism.

The side claim does not hold as a reading. The row says step 2e's budget "counts attempts rather than
dispatches, so a continuation does not consume it". Step 2e reads in full: *"**Budget:** One bugfixer
attempt per task. No retries."* The prompt uses the word "attempt" and defines it against nothing, so
it draws no line between an attempt and a dispatch. The specification is entitled to stipulate the
distinction, and the behaviour it stipulates is unambiguous; what it is not entitled to is the "so",
which presents the stipulation as something the prompt already says. `inference:` a planner reading
the row as a description rather than a requirement would leave step 2e unamended, and the ambiguity
would stay in the prompt. One clause in the prompt edit settles it.

**Point 3, the three-valued dispatch population. Closed.** C1 criterion 1 now reads "Every dispatch of
a bound agent **that the orchestrator itself makes**", criterion 2 covers the middle row explicitly
and names `/fusion:curate` and `/fusion:cleanup` as the ordinary dispatchers of `curator` and
`reconciler`, and the C1 decision block carries the three-row table with the module's own residual
quoted. Out of Scope now names the middle row rather than skipping past it, so the two sentences that
pointed opposite ways agree.

C4 no longer reports a violation: *"**It calls no dispatch a violation**, because it cannot tell from
the rows whether that dispatch was one the orchestrator bounded."*

The reasoning checks out against the fields. `hooks/lib/orchestrator-events.ts:292-301` declares the
machine row as `ts`, `event`, `task?`, `agent?`, `person?`, `checkout?`, `session_id?`, `detail?`,
which is the eight the specification lists and no more. No field names a dispatcher. The Grounding
snapshot's separate list of fifteen fields covers all rows in the log, model-written ones included,
and each list says which population it describes, so the two do not collide. The additional fields on
model-written rows (`turn`, `verdict`, `history_file`, the three artifact edges, `clause`) are absent
from dispatch rows, so none of them rescues the distinction either.

### 2. The four riding-along points

| # | Third check | Status | Evidence |
|---|---|---|---|
| 4 | Fifth case stated two ways | **Closed** | C3 criterion 2, and the decision block: "the switch never acquired a fifth member. It acquired a question asked before it." Finding 3 below |
| 5 | Events and dashboard unspecified | **Closed** | C3 criteria 10 and 11 |
| 6 | Sorting criterion does not decide `planner` and `playmaker` | **Closed** | The criterion is now two-part; a residual of its own, below |
| 7 | Two claims overstate their sources | **Closed** | C5 criterion 4 and C1 criterion 7 |

**Point 5.** C3 criterion 10 states that no event is emitted and no dashboard line overwritten, gives
the reason (`task_error` says blocked and the task is not), and settles the display from a rule the
prompt already carries: `agents/orchestrator.md:466` puts the `[RUNNING]` view on the dispatch hook,
and `:486` limits `orchestrator-live.md` overwrites to task outcomes and Turn boundaries. A bounded
return is neither, so nothing is overwritten and the fixed vocabulary gains no word. Criterion 11
adds the `work_queue` entry, correctly citing Step 3b step 7 (`:529`). The stall's own event
treatment is not stated, which is the residue of this item rather than a reopening of it.

**Point 6.** Part 1 now names the deliverable the dispatch was made for and rules that side products
do not sort an agent, which is what the third check asked for; part 2 exempts an agent whose partial
writes cannot safely be repeated. Both halves were checked. `agents/curator.md:210` carries the
before-text re-read and the `stale` outcome, and its own sentence is stronger than the specification's
use of it: *"That check is what makes a two-dispatch run as safe as a one-dispatch run."*
`agents/reconciler.md` Step 4 is the last step of its process and the `## Coherence` append sits
inside it, so the specification's claim that this append never enters the test is verified.

`inference:` part 2 keys on whether the agent's own prompt says a write must not be repeated, not on
whether the write is idempotent. Applied that way it does not reach the reconciler's Step 3 writes,
which add a `## Reconciliation Log` section per plan and append evidence per issue with no guard
(`agents/reconciler.md:122`, `:128`), while it does reach the playmaker's structurally identical
appends because `agents/playmaker.md` happens to warn about them. The assignment is settled by the
user and does not move; the exposure is the ordinary one that residual 4 already names, and C3
criterion 5 mitigates it by requiring the continuation to state what the previous run completed.

**Point 7.** Both corrections landed. C5 criterion 4 now makes the cache lifetime a property of
request cadence, states that generation time counts against the window, and names the single tool
call that expires the entry inside a dispatch; the Grounding snapshot's paragraph 4 carries the same
correction and records the withdrawn wording by name. C1 criterion 7 replaced "the whole dispatchable
roster" with a count: the two lists name 14 of the 15 prompt files, and the two exceptions are stated
rather than glossed. Verified: `agents/` holds 15 prompts, and `grep -rn "Agent(fusion:orchestrator)"`
over `agents/`, `skills/`, `bin/`, `hooks/` and `.claude-plugin/` returns nothing, so `orchestrator`
is a dispatch target nowhere. Neither of the two withdrawn phrasings survives anywhere in either
document.

### 3. Point 4 in detail: the old argument and the new ground

Both halves of the shaper's report are correct.

The third check's closing sentence read: *"Written inside the sub-bullet, a bounded `coderev` return
matches nothing at all."* That sentence assumed `coderev` reaches Step 3a. The Agent Routing Table
(`agents/orchestrator.md:423-435`) routes queue tasks to `coder`, `ontocoder`, `analyst` and `editor`
only, and Phase 4 step 2a is where `coderev` is dispatched, so the sentence was wrong and the
specification's new site assignment is what makes it wrong. The rest of that point stood on the
switch's own scoping and survives.

The new ground is stronger than the one it replaces. C3 criterion 2 argues that the two tests are
orthogonal rather than mutually exclusive: an agent may stop at its bound having run a passing
verification on the part it finished, so `exit 0` and "stopped at the bound" can both be true of one
return, and a fifth value of a switch cannot express that. Checked against the switch at
`agents/orchestrator.md:474-478`: its four cases are values of a single `Verification:` line and are
mutually exclusive by construction, so the argument holds on the prompt's own structure rather than on
which agent arrives there. C3 criterion 6 then answers the case the argument opens, routing a bounded
return that carries a failed verification into the continuation rather than to the bugfixer. The
passage reading "Four cases, and there is no fifth" stays true and is left unamended, which the
specification states.

### 4. The claims and figures added since the third check

Every figure reproduces. The two claims that carry a qualification are named.

| Claim | Where | Re-measured today |
|---|---|---|
| 4 618 bytes of `agents/` head-room remain, at `abcaa823` | Constraints, "Measured, and not open", snapshot paragraph 11 | Exact. Baseline map holds 15 entries summing 399 843; the tree holds the same 15 files at 413 225; net growth 13 382 against 18 000 |
| 15 prompt files in `agents/`, the two lists naming 14 | C1 criterion 7 | 15 files; the lists hold 7 and 7 |
| `orchestrator` is a dispatch target nowhere | C1 criterion 7 | No `Agent(fusion:orchestrator)` token in the tree |
| 131 pairs, 15 past 20 minutes; 114 bound, 13 past 20 | C1 criterion 4 | 131 and 15 (11.45 percent); 114 and 13 (11.40 percent) |
| Long bound dispatches: `coder` 10, `reconciler` 2, `bugfixer` 1; reconciler at 33.7 and 28.1 | "Measured, and not open" | Identical |
| Exemption removes 17 pairs and 2 long ones, both `analyst` at 33.9 and 35.2, the longest non-`coder` | Residual 1, "Measured, and not open" | 17 exempt pairs (`analyst` 8, `playmaker` 4, `planner` 4, `shaper` 1); the two long ones are 35.18 and 33.85, ranking third and fourth overall behind two `coder` runs |
| median 9.35, p75 14.27, p90 22.28, max 90.83 | "Measured, and not open" | Identical to two decimals |
| The machine row carries eight fields and names no dispatcher | C4 description, snapshot paragraph 10 | `hooks/lib/orchestrator-events.ts:292-301`, exact |
| Step 2e counts attempts rather than dispatches | C3 site table, row 2 | **Qualified.** The prompt says "One bugfixer attempt per task. No retries." and defines neither term. Finding 1 |
| `session_id` separates an orchestrator session from a plain one, and the module names it | C4 criterion 5 | **Qualified.** The module does name it (`orchestrator-events.ts:38-40`). Below |

The `session_id` criterion works today and degrades safely, and both properties are worth stating
because the criterion is new. Measured: all 131 machine-written pairs carry a `session_id` and all 131
match a `session_start` row in the same log. But `session_start` is model-written, which is the
standalone class this specification measures at a floor of 28.6 percent, and the log bears that out:
of 92 `session_start` rows, 9 carry a `session_id`, spanning 7 distinct sessions. A session whose
`session_start` row loses the field turns every dispatch in it unattributable. C4 criterion 5 already
prescribes that outcome as a report rather than a drop, and criterion 3's cutoff keeps the 83
historical rows out of scope, so the mechanism is sound. The plan should carry the failure mode rather
than discover it.

### 5. The four residuals

All four stand in the specification's own `## Residuals the user has bought` section, complete and
unweakened against the third check's list: the two long `analyst` dispatches the exemption gives up,
the unbounded overshoot that follows from reading the clock between units of work, the agent stopped
before its first write, and the expected-value nature of the whole saving at a compliance floor of
28.6 percent. Residual 2 gained a worked example, entering a 30-minute unit at minute 19 and returning
at minute 49, which sharpens it rather than softening it. Residual 4 keeps the floor language and the
denominator argument. None of the four was reworded into a mitigation.

## Implications

The three blocking gaps were joins the narrowing to seven agents opened, and the rework walked all
three: one rule with five instances for the return sites, an explicit exclusion at the one site that
destroyed work, and a scoping of both the obligation and the reading to the dispatcher that can
compute a stopping time. The four riding-along items closed as corrections, and two of them came back
better argued than the third check's own reasoning, notably the orthogonality ground for the guard
placement.

What is left is two clauses of prompt wording that the plan will write anyway (step 2e's attempt
budget, the stall's event treatment at Step 3a) and one criterion whose re-application by a later
reader rests on whether a prompt happens to warn about its own appends. None of the three changes what
gets built, and none is a question the specification has to answer before a plan can be written.

## Recommendations

1. Plan against the specification as it stands. No further shaper round is warranted by these seven
   points.
2. Have the planner measure the `agents/` head-room as its first act. The 4 618 bytes reproduce today
   and will not survive the first paragraph anyone adds to that directory.
3. Carry three small decisions into the plan rather than back to the shaper: that step 2e's prompt
   edit states the attempt-versus-dispatch line explicitly, that the Step 3a stall says whether
   `task_error` is emitted, and that `agents/orchestrator.md:896`'s summary row is amended in the same
   commit as step 2d.

## Filed Issues

None. Every remaining item is a wording decision inside work that is about to be planned.

## Sources

- `260907-0820_*_spec-bounded-executor-dispatches.md`: Directive, the governing section, C1 to C5 with
  their decision blocks, the C3 site table, Stops when, Constraints, Out of Scope, Open for Planner,
  Residuals, "Measured, and not open"
- `260906-2258-bounded-executor-dispatches/_t_circle.md`, `## Grounding snapshot`, paragraphs 1 to 11
- `260907-1401-third-planability-check-of-the-bounded-dispatch-spec.md`, the Verdict's seven items
- `agents/orchestrator.md`: the `tools:` allowlist (`:4`), the Agent Routing Table (`:423-435`),
  Step 3a items 4 to 6 (`:466-486`), Step 3b steps 2b to 2e (`:495-498`) and step 7 (`:529`), the
  circuit-breaker summary row (`:896`), Phase 3 steps 1 to 4 (`:641-646`), Phase 4 steps 2a to 4
  (`:807-828`), the `curator` paragraph (`:1259`)
- `agents/reconciler.md`: Step 3 (`:117-146`), Step 4 (`:148-161`)
- `agents/curator.md`: Pass 2 (`:210`, `:212`)
- `hooks/lib/orchestrator-events.ts`: the in-flight gate and its residual (`:32-40`), the row
  interface (`:292-301`)
- `hooks/lib/__tests__/surface-growth-bound.test.ts`: `AGENT_BASELINE` (`:302`), `AGENT_HEAD_ROOM`
  (`:409`)
- `fusion-workbench/orchestrator-events.jsonl`: 131 machine pairs, the bound and exempt splits, the
  duration quantiles, the `session_start` field coverage

## Open Questions

None that block a plan. Three wording decisions are recorded under Recommendations for the planner to
take without asking.

## Verdict

**Verdict:** spec passes — a plan detailed enough for autonomous execution can be written against it as it stands.

The planner measures the `agents/` head-room first: 4 618 bytes at `abcaa823`, reproduced today, and
it decides whether the return obligation is one conditionally emitted rule file or something smaller.
Four residuals must stay visible in the plan: the two long `analyst` dispatches the exemption gives
up, the unbounded overshoot past 20 minutes that follows from reading the clock between units, the
agent stopped before its first write, and the saving as an expected value at a compliance floor of
28.6 percent. Add one the specification does not list: a `session_start` row that loses its
`session_id` renders every dispatch of that session unattributable to C4, and 9 of the 92 rows in this
log carry the field.

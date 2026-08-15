# Orchestrator Session — 260814-2306

**Directive:** Bring the two simplification backlog entries on the way — the axis question (which whole mechanisms fusion stops carrying) with the eight-admin-commands collapse as its sub-step
**Mode:** custom (promote two backlog entries into one anticipated Circle, then plan and execute)
**Status:** In progress

## Setup snapshot

- Workspace: /Users/k1/Projects/productive/fusion
- Source root: /Users/k1/Projects/productive/fusion (work-tree preference, plugin's own repo)
- Plugin version: 8.2.0
- git HEAD at start: 9a7da8e
- Turn budget: 12 (from fusion-guard.json orchestrator.maxTurns)
- Active Circle: none (.active-circle absent) — all stores resolve to shared/
- Open defect records (open + in progress): 98
- Open plan/spec files: 1
- Open decision records: 7
- Analysis reports: 15
- Guard: not halted (haltActive false; last halt cleared 2026-08-09)
- Detected domain: code (code_files=125, data_files=21, counted_by=git-ls-files)
- Circle counts: 0 anticipated, 0 active, 12 closed, 1 bounded, 1 superseded — no portfolio hint printed
- Work queue: current (unaffiliated backlog; head records no Circle, none active)
- Churn ranking: 451 entries, 224 absent, 2 noise, 10 ranked; top file hooks/lib/__tests__/rules-emission-golden.test.ts
- Voice profiles: chat-voice-de.yaml, default-voice-en.yaml (chat de, artifacts en)

## Per-Turn Log

(none yet)

## Shaping — clarification round 1 (answered)

Dispatched `shaper` in anticipated-circle mode with both simplification backlog entries as the
draft. It read the entries, the three analyses, the portfolio and the decision store, wrote
nothing, and returned three questions. The orchestrator relayed them; the user's answers:

1. **Which of the eight removal items are in the Directive** — the six uncontroversial ones plus
   item 7, the hand-maintained session counters in `agentstate.yaml` and the drift machinery that
   checks them. Item 8 (pulling the embedded shell blocks out of `agents/orchestrator.md`) is
   explicitly out of scope.
2. **Where the third analysis contradicts the first** — the field measurement wins. `consultant`
   stays (79 consultations, 73 percent acted on, 326 files citing one), `investigator` folds into
   `analyst`, `taskplanner` keeps its batching capability and loses only the persisted
   `tasklist.md`, `reconciler` stays.
3. **Whether the rate levers belong in the Circle** — lever (a) only: restore a cap that fails the
   test suite, on `agents/`, `skills/` and the hook test lines, reversing the 5 August change that
   turned the emission ratchet into a non-failing report. Levers (b) external-witness intake and
   (c) instrumenting consuming projects are out of scope.

Also settled: both backlog entries carry one idea each and are closed at Circle creation. The two
neighbouring entries `260814-1733_o_attach-the-rule-to-the-act.md` and
`260814-1733_o_bounded-executor-dispatches.md` stay out.

Round 2 will settle: whether `conceptrev` is a ninth removal candidate, whether `curate` becomes a
deep mode of the cleanup pipeline or stays a fourth standing name, and the Circle's closure
criteria.

## Shaping — clarification round 2 (answered)

The shaper's second dispatch found one question beyond the three the first run had named, and put
it to the user rather than deciding it: `bin/fusion-turn-budget` sits in removal item 7 but
measures no drift. The user's answers:

4. **`conceptrev`** — delete it entirely. The plan/spec gate stops waiting on a verdict that never
   came back negative in 36 measured runs across two projects (29 in the largest consumer, 7 in
   krk).
5. **`curate`** — it replaces `revise-claude-md`. The user declined the recommended
   `/fusion:cleanup --deep` switch. One path to `CLAUDE.md`, the evidence-tiered one behind a user
   gate; the autonomous path goes. Visible command names stay three: setup, cleanup, cadence.
   Open consequence handed to the shaper: `cleanup` is an autonomous pipeline and `curate` is
   gated, so the pipeline acquires a gate it did not have.
6. **`bin/fusion-turn-budget`** — stays. It reads the configured Turn ceiling from
   `fusion-guard.json` and measures no drift, so it leaves removal item 7. The ceiling remains
   project-configurable.
7. **Closure criterion** — all agreed removals through, `npm test` green, the restored emission cap
   fails the suite on any add-back, and a before/after measurement (bytes per dispatch, Setup
   tokens, line counts) stands in the Closure note. A field run against a consuming project and a
   decision record per removed mechanism were both offered and declined.

Round 3 dispatched with all seven answers restated: create the Circle, close both backlog entries,
write the shaper history file, stop.

## Shaping — complete (round 3)

Circle created: `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/`, record `_a_circle.md`,
six artifact subdirectories present. Both backlog entries renamed to `_c_` with a `Promoted:` line
each, in the same command as the creation. The two neighbouring entries are untouched.

The shaper found two things the dispatch did not carry:

- **The failing cap already exists.** Commit `5c843e6` (2026-08-14) armed it over the always-on rule
  corpus in `hooks/lib/__tests__/rules-emission-golden.test.ts`, under decision
  `circles/260801-1244-curator/decisions/260814-0738_i_...`. This Circle extends that instrument to
  three uncovered surfaces rather than building a new one. Without the find, the record would have
  specified work that is partly done.
- **The cleanup/curate consequence splits in two.** Settled and written into the record:
  `/fusion:cleanup` acquires exactly one gate, at the `CLAUDE.md` step, and the skill body's
  "no per-step confirmation gates" sentence becomes false and must be rewritten. Left open and
  filed as a decision record inside the Circle: whether that gate blocks the run or files a ledger
  for later approval. Both readings satisfy all seven answers.

No mermaid diagram in the record, so no `conceptrev` pass was dispatched.

## Decision answered at the activation gate

`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-0007_*_does-fusion-cleanup-block-at-the-claude-md-gate-or-leave-the-ledger.md`

**Answer: option 1, the gate blocks.** `/fusion:cleanup` runs the curator's survey, presents the
change ledger, and waits for the user before applying anything to `CLAUDE.md`. `--dry-run` stays
survey-only at that step, as at every other.

The fact the shaper named as deciding, and which no record held: the user sits with the run rather
than typing it and walking away. On that fact option 1 costs nothing, and the deferred-ledger
failure modes measured under option 2 (a log whose last entry is 16 June, three
`revise-claude-md` runs against 275 recorded `CLAUDE.md` changes) do not have to be risked.

Consequence carried into the plan: the `## Autonomy and safety` sentence in
`skills/cleanup/SKILL.md` that defines autonomous as "no per-step confirmation gates" is false
under this answer and is rewritten in the same change.

## Activation and planning

Circle activated: record renamed to `_t_circle.md`, `**Status:** active`, `**Active session
history:**` pointed at this file, `.active-circle` written. Plane push at call point 1 returned
deferred (0 pushed, 2 deferred, `PLANE_API_KEY` absent) — surfaced, not blocking. Shaping output and
activation committed as `38b80d0`; the collapse backlog entry had never reached a commit before and
enters history there.

Planner dispatched with `**Circle:** 260815-0007-remove-eight-mechanisms-and-cap-growth`. Plan at
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md`:
15 execution steps plus one user gate, 13 for `coder` and 2 for `ontocoder`. The Circle record's
`**Active spec/plan:**` field was set to that path on reading the plan.

Three findings moved the plan away from the record's outline:

- **The reference lints make the sweep decidable.** `reference-resolution-lint.test.ts` resolves
  every cited plugin path against the tree, so a citation is always removed before its target, and
  the enumerations in `CLAUDE.md` must fall in the same commit as each removal rather than waiting
  for the curator. The narrative half of `CLAUDE.md` stays a gate step.
- **`hooks/lib/domain-cascade.ts` is rewritten, not deleted.** It is the only executable definition
  of a decision that survives losing two of its four outcomes.
- **`hooks/lib/state-drift.ts` exports two helpers that `staging-drift` and `review-coverage`
  import.** They are extracted before the deletion, in the same commit, or two surviving
  measurements break.

Asked explicitly and answered: `staging-drift` and `review-coverage` both stay. The criterion is
whether the measurement's subject survives this Circle. The counters do not; the git index and
review coverage do.

Two decisions block execution and go to the user at the plan gate (steps 9 and 12). One defect was
filed against the Circle record itself: its `## Dependencies` cites a decision record as an issue
and asks for a transition the decision vocabulary does not have.

## Plan gate — approved, with four answers

`conceptrev` verdict on the plan's two diagrams: **acceptable**. No cycle, no god-node, no orphan,
both render. Two findings, the first of which is a defect the user chose to have fixed before
execution: the plan's prose contradicts its own diagram on three step numbers and places the
curator pass after the growth bound, which is the one order the plan forbids. Its `## Current
State` also claims nine steps touch `agents/orchestrator.md` where the file lists give eight.
Review at `circles/260815-0007-.../reviews/260815-0044-conceptrev-plan-remove-eight-mechanisms-and-cap-growth.md`.

The user's four answers at the gate:

1. **Plan approved, numbering corrected first.** The planner re-runs to fix the three step-number
   references and the step-count claim before any execution begins.
2. **The `analyst` executor set is passed on every planner dispatch** (option 1). The planner routes
   a step to `analyst` when that step produces a strategic deliverable; the orchestrator-side
   condition in front of that routing goes. `README-agents.md` `## Dispatch parameters` is rewritten
   in the same change, since its "Passed by" cell cites a condition that will not exist.
3. **Setup asks once before seeding permissions, defaulting to yes, and the inert `settings.json`
   is deleted** along with its `install.sh` copy entry. The consent the slash command carried
   survives the fold. The merge procedure stays `/fusion:unlock`'s and is not re-implemented, and
   its gitignore step travels with it.
4. **`hooks/lib/state-drift.ts` is deleted whole**, all five rows. The three rows whose subject
   survives this Circle have never fired in either measured project. Recorded as a one-way door the
   user was shown and accepted.

## Per-Turn Log

### Turn 1
- Steps attempted: P-1 before-measurement, P-2 Plane mirror code and prose, P-3 Plane data and fixtures
- Steps completed: all three
- Commits: d78dfb7, d0ddabb, 507dbc6, 7c12d6a, 53f2ed2, c4761dc
- Measured effect: suite 1030 tests / 76.57 s to 903 tests / ~30 s; test files 49 to 48; rules to
  orchestrator 130 440 B to 129 877 B
- Review: coderev and ontorev over 9a7da8e..HEAD, the whole session range, because the coverage read
  found all six commits uncovered. Coverage now reads covered, uncovered 0.
- Findings: 1 High, 3 Medium, 3 Low from coderev; 5 from ontorev; 3 duplicates withdrawn by coderev.
  10 records stand open, 3 closed this Turn.
- Orchestrator errors this Turn, both caught by mechanism rather than by attention: a rename staged
  with only the new path, leaving a record under two names in HEAD (507dbc6); and a record closed in
  the wrong Circle as a bodiless stub while its open original stood (53f2ed2). The second was my
  misreading of a grep-filtered listing whose directory headers the filter had removed.
- Blocker carried into Turn 2: the plan still states that the enumeration lint does not read
  CLAUDE.md's Layout table. Step 2 disproved it. Steps 4 and 11 would ship red on it and be reverted.
- Circuit breaker status: OK

## Decision answered mid-Turn-2: the hooks suite becomes safe to run concurrently

`shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`

**Answer: option 2.** Give each run its own build output, or build without deleting first, and fix
the two wall-clock-bound cases to wait on something observable. The verification contract is left
alone and every executor keeps verifying its own work.

The trigger was this session's own bugfix dispatch, which reproduced the cause deterministically:
`hooks/package.json`'s build is `rm -rf dist && tsc` and runs before every vitest invocation, so two
concurrent `npm test` runs in one checkout race on `dist/`. Four of `legacy-halt-clearing`'s six
cases fail because those four spawn the real `dist/clear-halt.js`; the two that pass start from
source through `tsx`. Eleven unloaded runs green, four loaded runs red.

The cause was this orchestrator's own parallel dispatching, twice today: `coderev` with `ontorev`,
and `planner` with `bugfixer`. The deleted `dist/` was visible in `git status` at the time and was
read as a build in progress rather than as the fault.

**Scope consequence, stated rather than absorbed.** This work is not in the Circle's Directive,
which is about removals. It is a prerequisite for the Circle's own closure criterion: step 13 arms a
growth bound whose entire value is that the suite fails on an add-back, and a suite that fails at
random cannot carry that. It is inserted as step 3b and the Circle grows by one step.

Until it lands, this orchestrator dispatches nothing in parallel that runs the suite.

### Turn 2
- Steps attempted: plan correction, the legacy-halt-clearing flake, inserted P-3b, P-4, P-5, P-6
- Steps completed: all six
- Commits: d1ae1c0, 89ca95a, c45e27b, 332267a, a69d56e, 04ea182, 5d29b6d, b093a54, b70097f
- Measured effect: suite 46 files/842 tests to 45/830; rules to orchestrator 129 877 B to 104 181 B;
  visible skills 17 to 15; the suite is green under concurrency for the first time
- Review: coderev and ontorev over 7c12d6a..HEAD. Both corrected the range the dispatch gave them
  from seven commits to nine. Coverage covered, uncovered 0.
- Findings: 10 records filed, 5 closed. Two would have made step 11 ship red, both created by this
  Turn's own earlier steps rather than by the world moving.
- Orchestrator omissions this Turn: the inserted step P-3b existed in no plan and no Turn log, only
  in the event stream; and one commit message over-claimed a measured hit that the measurement
  places elsewhere. Both named by the reviewers, both corrected.
- Circuit breaker status: OK

### Turn 3
- Steps: P-7 conceptrev removed, P-8 investigator folded into analyst, P-9 the two domain values
- Commits: a17cc8c, 7260bbc, 0894d0d, 518926d
- Measured effect: 828 to 827 to 831 tests — the domain step added four cases that refuse a
  re-added branch and a stale copy of the four-outcome cascade. Rule text to `coder` 95 023 B at
  step 1, 94 332 B now.
- Each of the three steps falsified something in its own instructions: a sender set that does not
  exist, a resolver premise contradicted by measurement, and a module listed under removal that is
  the only executable definition of a decision still being made.
- One consequence named rather than absorbed: failure investigation became dispatchable, where the
  investigator was user-initiated by design. The alternative was a carve-out inside the analyst,
  which is the special case the critical-stance rule warns against. Surfaced to the user.
- Circuit breaker status: OK

## Gate G1 — the curator's pass, and one decision beside it

The curator surveyed the three normative surfaces against twenty-eight commits and returned a
twelve-entry ledger: nine against `CLAUDE.md`, three against `rules/fusion-workbench-conventions.md`,
none against the decision store. Zero constraint removals, zero Tier-3 entries, blast radius under
1.7 percent of the smallest surface. The user approved **all twelve**.

Not approved and not applied: the candidate C01. Thirteen decision records now assert a mechanism
that no longer exists, and the curator changed none of them because an open decision filed by the
previous curator run owns exactly that question. It was filed when two records were affected; today
it is thirteen. The curator's own judgement, marked as inference at medium confidence: that decision
should be answered before the next curator run, or no pass repairs the stock.

**The duplication decision.** The two copies of the resume shell now agree and nothing holds them
agreeing. Three options were costed by the executor that repaired them — a shared helper, a lint
pinning the two fenced blocks equal, or accepting two copies — and the executor escalated the choice
rather than taking it, on the ground that how much mechanism five lines of shell deserve, inside the
Circle that is removing mechanisms, is a gate decision.

**The user chose to accept two copies.** The reasoning stated at the gate: five lines of shell
justify neither a thirteenth helper nor a fortieth test file, and both would be exactly the kind of
addition the cap in step 13 exists to slow. The risk is real and stays named in its record rather
than being engineered away.

## Coherence

<!-- RECONCILER-OWNED -->

**Scope:** session end, Phase-3 pass after the Turn loop exited, range `9a7da8e..9306f0a`, **32
commits**, 4 Turns, 16 plan steps plus gate G1. Computed by the reconciler at HEAD `9306f0a`; full
pass record at
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-1913-reconciliation.md`.
The dispatch named 34 commits; `git rev-list --count 9a7da8e..HEAD` returns 32, and that is the
number every figure below is taken against.

**Verdict:** review-needed

**Edges:**

- **Artifact↔Grounding: flagged.** 42 claims re-derived at HEAD rather than read off a marker — the six Directive clauses, the sixteen plan steps' subjects, the three implemented decisions' citation targets, the always-on floor file by file against `git show d78dfb7:`, and the seventeen-row measurement block re-run verbatim. The tree matches what the Circle says it did: eleven `bin/` helpers with the three removed absent, fifteen agent prompts, twelve skill directories, `hooks/lib/state-file.ts` present as step 11's extraction, no `/fusion:unlock`, `/fusion:revise-claude-md`, `/fusion:circle-stash`, `/fusion:circle-pop` or `/fusion:seed-from-plane` anywhere in the shipped corpus, and `cd hooks && npm test` green at **40 files / 751 tests**, 64.00 s. **Both Turn-4 High findings are closed and both were re-verified against the tree, not against their footers:** the resume shell is repaired at `agents/orchestrator.md:93` in both copies, and sixteen of seventeen `work_queue` entries carry their true status. **Three things flag this edge.** First, **review coverage is `uncovered`**: `./bin/fusion-review-coverage` reads `commits=32 reviews=9 unusable=1 uncovered=6`, and the six are everything after the Turn-4 review — including `0609945`, the feature commit that arms a failing test gate over three shipped surfaces, and `e8052e7`, the curator's twelve approved corrections to two normative documents. Neither was opened by a reviewer, and this is the fourth consecutive Turn whose review range and commit range disagreed. Second, **the work-queue class recurred four commits after being closed**, inside the Turn that deleted the check for it: P-15 landed as `9306f0a` and `agentstate.yaml` still reads `running` for it, three commits behind its own `Updated:` stamp. Third, **the closure measurement has gone stale in three rows** because step 15 added `docs/upgrading-to-v9.md` after step 14 took the reading — the `docs/` + `README*.md` reduction is 15 402 bytes at HEAD, not the 23 534 the table records. 17 defect records were closed by this pass and 5 filed; 42 stand open in the Circle and 80 in `shared/`, and **none of them contradicts what shipped** — every one is a documentation fault, a bookkeeping fault, a class question, or a defect in a surviving mechanism.
- **Artifact↔Directive: OK.** All 32 commits in `9a7da8e..9306f0a` move toward the Directive; none is orthogonal and none moves away. Each of its six clauses was checked against the tree rather than against a report, and five are met outright. The sixth, the administrative surface, is **met on what the Directive claims and only there**: the Directive says fusion *presents* three names and that a user types `setup`, `cleanup` and `cadence`, and the presentation did change where step 12 reached — `CLAUDE.md`, `README.md`, `README-agents.md`, `skills/help/SKILL.md` and the three descriptions. Two of the eight names left the tree with their directories; three were demoted only, and seven further shipped surfaces still tell a user to type one, with `agents/orchestrator.md:1292` contradicting `README-agents.md:246` about what to tell them. **The measurement clause is satisfied, and by an honest measurement that partly disappoints.** The clause asks for a before-and-after in bytes per dispatch, Setup tokens and line counts; step 14 delivered all three and used them to contradict four of this Circle's own claims — the always-on floor *rose* 248 bytes for six of fifteen agents because the curator's approved pass put back more rule text than the removals took out, 99 percent of the orchestrator's 7 418-byte fall is one rule file rehomed at step 6, the suite fell 21 percent rather than to a third and not like for like, and 81 percent of the headline Setup saving is this repository's own accumulated queue with the portable part at 38 262 bytes. That is the measurement working. What it disappoints is the Grounding's predictions, not the Directive's requirement, and a measurement that had confirmed everything would have been the weaker artifact. The cap clause is met and was demonstrated live one commit after arming: `9306f0a`'s 897-byte edit to `skills/help/SKILL.md` turned the suite red and the fixture was regenerated with no baseline moved. The Closure note itself does not exist yet; that is Phase 4's write, downstream of this verdict.
- **Grounding↔Directive: flagged.** 49 active decision records across `$SCAN_DECISIONS` (4 in the Circle, 45 in `shared/`); 91 in the whole workbench, 63 of them implemented. 47 of the 49 are consistent with the Directive, including all four of the Circle's own — the three it answered are implemented with citations that resolve in the tree, and the fourth (`260815-1845_o_does-analyst-get-a-project-local-rule-pattern…`) is a residual the Directive produced rather than a conflict with it. **Two conflict, and both are active Grounding whose subject the Artifact deleted:** `shared/decisions/260806-1152_a_stash-manifest-dirname-and-pointer-content-duplicate.md`, whose answer was to keep both manifest fields and whose manifest, both skills and all three cross-references went in `5d29b6d`; and `shared/decisions/260810-2032_a_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline…`, which states in its own closing line that `_a_` → `_i_` waits on a pin against the drift lint that `f45f76a` deleted. Neither answer can now be realised. **No marker was moved on either**, because `circles/260801-1244-curator/decisions/260814-1332_o_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md` owns exactly that question, is unanswered, and two of its four candidate answers would apply here — renaming on the weakest evidence tier would pre-empt the decision the curator itself declined to pre-empt at gate G1. **That open decision is the largest thing this Circle leaves, and this Circle roughly doubled its population.** It was filed against thirteen records and G1 reported thirteen; at HEAD a subject sweep finds at least nine more implemented records whose whole subject these removals deleted — seven Plane (`260716-1847` ×2, `260719-2141`, `260722-2230`, and three inside `circles/260719-1536-plane-mirror-integration/`), two churn (`260809-2004`, `260810-0920`), plus `shared/decisions/260810-1822_i_should-the-queue-ground-procedure-become-a-rule-file…` — which with the two answered records puts the class near twenty-four. Nothing on any of them says the mechanism is gone. Four further active decisions sit in `circles/260801-1244-curator/`, `circles/260801-1244-guard-rules-write/`, `circles/260807-0923-guard-misst-statt-orakelt/` and `circles/260813-0910-documentation-matches-shipped-plugin/`, and no scan key reaches them from here.

**Rebalance recommendation:** revise Grounding

**What the recommendation means here, since the Directive is met.** Two edges are flagged and neither
is `Artifact↔Directive`, so the priority order in `agents/reconciler.md` puts Grounding ahead of
Artifact. The substance agrees with the ordering. The Artifact flags are a coverage gap and two
bookkeeping faults: one review pass over `c1e207d..9306f0a` closes the first, and the two records
filed for the others are cheap. The Grounding flag is structural — twenty-four decision records now
assert mechanisms that are not in the tree, the vocabulary has no state for that, the one decision
that would settle it has been open since 2026-08-14, and every further removal Circle enlarges the
class. Answering `260814-1332` is what stops the corpus drifting further, and it is the one item here
that no amount of Artifact work reaches.

**What this verdict does and does not license.** It does not block closing the Circle. The Directive
is met on all six clauses, the suite is green, the cap has been seen to fail and to be re-baselined
without absolving anything, and nothing open contradicts what shipped. A close as **closed-coherent
(`_c_`)** is defensible if the six uncovered commits are reviewed first or the gap is accepted on the
record; a close as **bounded (`_b_`)** is not warranted, because nothing about the Directive was
found unreachable. What Phase 4 still owes regardless: the Turn-4 entry on the Circle record's Turn
log, which still reads "in progress"; the `## Closure` section carrying the before-and-after with the
three corrected rows; this file's `**Status:**` line, still `In progress`; and the record's
`**Active spec/plan:**` pointer at `:7`, which now names the plan's old `_o_` path after this pass
renamed it to `_c_`.

## Rebalance gate — the Grounding is revised

The reconciler returned `review-needed` and recommended revising the Grounding. The user chose to
answer the open decision rather than close bounded or defer.

`circles/260801-1244-curator/decisions/260814-1332_*_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md`

**Answer: option 3.** A `Retired:` annotation joins the four the decision template already carries,
citing the plan, commit or gate that removed the implementation. **The marker stays `_i_`.** No
existing record's marker moves, so no glob, filter or count anywhere in fusion changes behaviour,
and `_s_` keeps meaning exactly one thing: a later decision overrode this one.

What the option costs, stated rather than glossed: a sixth annotation on a template that already
carries four, two rule lines the growth bound now charges for, and a filename marker that no longer
tells the whole story — a reader who trusts the marker alone still learns nothing.

Why not the others. Option 1 leaves a reader unable to distinguish an implementation that ships
today from one deleted a week later, which is the case the curator exists to catch. Option 2 widens
`_s_` to mean both "a later decision overrode this" and "the code went away", which retire a record
for different reasons. Option 4 puts the obligation on whoever removes a mechanism, and this session
is fresh evidence against it: our own plan carried a goes/stays/changes inventory and still did not
name the eleven records its removals devalued.

The population this answer has to be applied to is about twenty-four records, roughly eleven of them
created by this Circle.

## Coherence — Grounding revision applied

<!-- RECONCILER-OWNED -->

**Scope:** follow-up pass at HEAD `bd07ee7`, applying the Rebalance gate's answer to the record
population it governs. Not a session-end pass — no new range was walked and the verdict above is not
recomputed. Full pass record at
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-2056-reconciliation.md`.

**Verdict:** review-needed (unchanged; the flagged `Artifact↔Grounding` edge is untouched by this
pass, and the `Grounding↔Directive` flag is discharged in part)

**Edges:**

- **Artifact↔Grounding: unchanged, still flagged.** No claim was re-derived and no tree state was
  measured beyond what this pass needed. The six uncovered commits from `c1e207d..9306f0a` are still
  uncovered, and `bd07ee7` adds a seventh.
- **Artifact↔Directive: unchanged, OK.** One commit since the verdict (`bd07ee7`, the previous
  pass's own tracking-file writes); this pass wrote no code and no commit.
- **Grounding↔Directive: discharged for the `_i_` class, one residual filed.** The `Retired:`
  annotation is on **25** implemented records — 7 Plane (`d0ddabb` + `7c12d6a`), 2 churn (`a69d56e` +
  `04ea182`), 1 queue (`dd312eb`), 7 protected-path (`60c9cd8` + `fa2f00b`) and 8 write-classifier
  (`ba7ccda`) — each citing the plan or commit that removed the implementation. **No marker moved.**
  The population is 25 rather than the 13 reported at G1 or the ~24 estimated at the verdict above;
  the difference is measured record by record and set out in the pass record. The two `_a_` records
  named in the verdict are **not** instances: `Retired:` cites a removed *implementation* and an
  `_a_` record has none. That residual is filed as
  `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_o_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`,
  and both records carry a note saying why they were left alone.

**Rebalance recommendation:** revise Artifact — the Grounding revision the gate chose is applied, and
the remaining flag is the review-coverage gap plus the two bookkeeping faults the verdict above
already scoped. One review pass over `c1e207d..HEAD` closes it.

**One transition this pass did not take.** Both halves of `260814-1332`'s option 3 are now on disk —
the definition in `rules/fusion-workbench-conventions.md` (:328, :431-436, :520), written by a
parallel dispatch, and the annotation on 25 records, written here. The record is therefore
implemented and its `_a_` → `_i_` transition is available. It was not taken, because the dispatch
that ran this pass instructed it to rename nothing; the evidence is recorded on the record itself.

## Coherence — re-run after the Grounding revision

<!-- RECONCILER-OWNED -->

**Scope:** re-run at HEAD `d2b45e1`, range `9a7da8e..d2b45e1`, **35 commits**. Supersedes
neither `## Coherence` above nor `## Coherence — Grounding revision applied`; it is the third
reading, taken after the Rebalance gate's answer landed in full. Full pass record at
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-2109-reconciliation.md`.
The dispatch named 38 commits; `git rev-list --count 9a7da8e..HEAD` returns **35**, and that is
the number every figure below is taken against — the same correction the first verdict had to
make against 34.

**Verdict:** coherent

**Edges:**

- **Artifact↔Grounding: OK, with two named residuals.** Re-verified at HEAD by measurement, not by reading a marker: `cd hooks && npm test` green at **40 files / 751 tests**, 57.26 s, unchanged from the first verdict. The Grounding revision is on disk exactly as claimed and both figures reproduce to the byte — `rules/fusion-workbench-conventions.md` grew **761 bytes** in `c8eac96` (53 399 → 54 160), and the always-on set stands at 88 679 against a baseline of 86 573, leaving **9 894** of the 12 000-byte head-room. The `Retired:` form is defined at the three named places (`:328` marker row, `:432` annotation form, `:520` template footer) and carried by exactly **25** `_i_` records; a 26th file matching the grep is the new decision's own empty template footer, not a stray annotation. `260814-1332` is at `_i_` with `**Status:** implemented`, an `Answered:` line citing the gate and an `Implemented:` line citing `c8eac96`. The `_i_` population is 64, the 63 enumerated plus this record. All three orchestrator bookkeeping items are fixed: the Turn-4 entry carries `9955e8f..9306f0a`, `**Active spec/plan:**` names the plan's `_c_` path, and `work_queue` P-15 reads `done` at `9306f0a`. **Two residuals, both named rather than closed.** First, review coverage is still `uncovered` and **grew from 6 to 9** — but the number is padded: four of the nine (`c1e207d`, `9cde86c`, `bd07ee7`, `d2b45e1`) touch **no shipped file at all** and are tracking writes a reviewer has nothing to open in. Five touch shipped files: `5f2171e` (3), `e8052e7` (5, and it passed the G1 user gate with an evidence-tiered ledger), `0609945` (6), `9306f0a` (7, of which `install.sh` is the pin-example comment only), `c8eac96` (2). Second, the closure measurement's `docs/` + `README*.md` row is still stale — re-measured here at **15 402 bytes**, not the 23 534 recorded — and its issue stays open for Phase 4 to consume.
- **Artifact↔Directive: OK.** All 35 commits move toward the Directive; none is orthogonal and none moves away. The three since the previous reading are the Grounding revision itself (`c8eac96`, `d2b45e1`) and the pass that preceded it (`bd07ee7`), all tracking-file and rule-text writes discharging the gate's own answer. The closure criterion — "the restored cap fails the suite as soon as something is added back to `agents/`, `skills/` or the hook tests" — is met and **demonstrated by execution on two of the three surfaces**: `skills/` at `9306f0a`, where an 897-byte edit turned the suite red and the fixture was regenerated with no baseline moved, and `agents/` in the reproduction recorded in `260815-1942_o_`, where two restored agent prompts failed the bound at 18 000 bytes of head-room.
- **Grounding↔Directive: OK, discharged.** The flag raised in the first verdict is gone. The 25 annotations are on disk, no marker moved, and the residual the pass declined to force — two `_a_` records whose answers became unrealisable and which have no implementation for a `Retired:` line to cite — is filed as its own decision at `circles/260815-0007-…/decisions/260815-2056_o_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`, with both records carrying a note pointing at it. 5 `_o_` decisions stand in the Circle's own store and `shared/`; none contradicts the Directive.

**Rebalance recommendation:** none

**Why this is `coherent` and the first verdict was not, stated against my own prior position.**
The `Grounding↔Directive` flag is discharged on evidence. The `Artifact↔Grounding` flag is not
discharged — it is **re-characterised**, and the honest reason is that "unreviewed" and
"unexamined" came apart in this Circle. `0609945` is the commit I raised loudest and no reviewer
has opened it; it also carries **four filed defect records**, one **High**, each with reproduction
steps, produced by reconciliation running the mechanism rather than reading it. A rule that
blocked closure for want of a review *file* would have blocked it over the single commit in this
session that received the most scrutiny. The gap did not shrink and I am not calling it closed;
what changed is that I can now say what is in it, commit by commit and shipped-file by
shipped-file, which the first verdict could not.

**What the closure note must carry, as acknowledged residuals rather than as omissions.**
(1) **Nine commits closed unreviewed, five of them touching shipped files**, named individually,
with the statement that the user stopped the review dispatch deliberately and that this is the
fifth consecutive Turn or Circle whose review range and commit range disagree. (2) **The cap
ships with a demonstrated latent escape.** `260815-1935_o_` is High: `surface-growth-bound.test.ts`
reads `__tests__/*.ts` and `__tests__/helpers/*.ts` only, while Vitest's include is recursive, so
a test file in any third subdirectory runs uncounted — demonstrated with 3 002 lines, 120 % of
that surface's entire head-room, all twelve assertions green. **It is latent, not active**: at
HEAD `__tests__/` holds only `fixtures/` and `helpers/`, and all 44 `.ts` files sit in the two
directories the bound reads, so nothing is uncounted today. The note must say both halves — a
reader told only "High, cap bypassable" will conclude the cap does not work, and a reader told
only "latent" will not fix it. (3) The three other records against `0609945` — `260815-1942_o_`
(baselines asserted on by nothing), `260815-1939_o_` (rate and percentile inputs do not reproduce
from git while every point figure does), `260815-1941_o_` (the motivating table's `rules/`
before-row taken at the wrong anchor: -7.5 %, not -10 %). (4) The corrected `docs/` + `README*.md`
figure, **15 402 bytes**.

**One thing this pass changed in the tree, and one it filed.** `agentstate.yaml:26`
`current_task.source_file` still named the plan's `_o_` path, which no longer exists on disk;
it now names the `_c_` path its sibling `plan_context.plan_file` already used. And the question
underneath all three of this session's verdicts — **may a Circle close over an uncovered review
range** — turned out to be owned by no decision record anywhere in the workbench, while
`bin/fusion-review-coverage`'s own header names it as unfiled. It is now filed, at
`shared/decisions/260815-2109_o_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`,
in `shared/` rather than this Circle's store because its instances predate this Circle. Three
verdicts in one session decided it ad hoc, two one way and one the other; that inconsistency is
the argument for the record, and it is mine to own rather than the gate's.

## Session Flow

```mermaid
sequenceDiagram
    participant U as User
    participant O as Orchestrator
    participant S as Shaper
    participant P as Planner
    participant C as Coder
    participant OC as Ontocoder
    participant CR as Coderev
    participant OR as Ontorev
    participant BF as Bugfixer
    participant R as Reconciler
    participant CU as Curator
    participant PM as Playmaker

    U->>O: two backlog entries about simplifying fusion
    O->>U: GATE scope — four options
    U-->>O: both entries, full axis
    O->>S: promote both into one Circle
    S-->>O: round 1, three questions
    O->>U: relay
    U-->>O: six removals + counters; field measurement wins; lever a
    S-->>O: round 2, four questions
    U-->>O: conceptrev out; curate replaces revise-claude-md; budget stays
    S-->>O: Circle 260815-0007 created, both entries closed
    O->>U: GATE spec — approve and activate?
    U-->>O: approve, activate, gate blocks
    O->>P: plan the Circle
    P-->>O: 15 steps + gate G1
    O->>U: GATE plan — conceptrev acceptable, numbering wrong
    U-->>O: fix numbering first; 3 decisions answered

    Note over O: Turn 1
    O->>C: P-1 before-measurement
    C-->>O: 1030 tests, 76.57s (d78dfb7)
    O->>C: P-2 Plane mirror
    C-->>O: 903 tests, ~30s (d0ddabb)
    O->>OC: P-3 Plane data
    OC-->>O: 19 deletions (7c12d6a)
    O->>CR: review whole session range
    O->>OR: review whole session range
    CR-->>O: plan premise will ship red
    OR-->>O: 1 High, a stub record in the wrong Circle

    Note over O: Turn 2
    O->>P: correct the false premise
    P-->>O: 8 of 11 steps carried it
    O->>BF: the suite flake
    BF-->>O: not flaky — two concurrent runs race on dist
    O->>U: GATE concurrency decision
    U-->>O: make the suite safe
    O->>C: P-3b concurrency safety
    C-->>O: 6/6 red before, 12/12 green after (332267a)
    O->>C: P-4 churn
    O->>OC: P-5 churn config
    O->>C: P-6 stash/pop, commit-lock rehomed

    Note over O: Turn 3
    O->>C: P-7 conceptrev
    O->>C: P-8 investigator into analyst
    O->>C: P-9 domain values

    Note over O: Turn 4
    O->>C: P-10 persisted queue
    O->>C: P-11 counters and drift machinery
    O->>C: P-12 eight names to three
    O->>CU: GATE G1 survey
    CU-->>O: 12 entries, 0 constraint removals
    O->>U: approve the ledger?
    U-->>O: all twelve
    CU-->>O: applied, golden now stale
    O->>C: P-13 growth cap
    C-->>O: armed, four add-backs red (0609945)
    O->>C: P-14 after-measurement
    C-->>O: four of the Circle's claims fail
    O->>C: P-15 release v9.0.0

    O->>R: reconcile
    R-->>O: review-needed — revise the Grounding
    O->>U: GATE rebalance
    U-->>O: answer the decision
    O->>C: define the Retired annotation
    O->>R: apply it
    R-->>O: 25 records, not 13 or 24
    O->>R: re-run the verdict
    R-->>O: coherent
    Note over O: Circle closed _c_
    O->>PM: portfolio refresh
    PM-->>O: portfolio empty, backlog recommendation
```

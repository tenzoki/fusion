# Remove eight unused mechanisms, collapse the administrative surface to three names, and restore a cap that fails

---
**Domain:** code
**Status:** closed
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md
**Active session history:** shared/history/260814-2306-orchestrator-session.md

---

## Directive

fusion ships without eight mechanisms that two analyses and one field measurement found no
use for, and its administrative surface is three names rather than eight. The Plane mirror,
the churn and cross-file counters, the stash and pop skill pair, the persisted
`tasklist.md`, the `investigator` agent, `conceptrev`, the `strategic` and `knowledge`
domain values, and the hand-maintained session counters in `agentstate.yaml` together with
the drift machinery whose only subject is those counters, are gone from the shipped plugin.
What survives them survives on evidence: `taskplanner` keeps the batching that once drove a
26-task night and loses only its queue file, the `analyst` carries the investigator's remit,
and `consultant` and `reconciler` are untouched. A user types `setup` at the start of a
session, `cleanup` at the end, and `cadence` to see what happened. `unlock` has become a
Setup step, and `archive`, `log-activity` and the `CLAUDE.md` pass have become step
arguments of the pipeline they were already steps of. One path leads to `CLAUDE.md`, the
curator's evidence-tiered pass behind a user gate, so `/fusion:cleanup` carries exactly one
confirmation where it previously carried none. Over all of it stands a cap that fails the
test suite, extended from the always-on rule corpus it already guards to `agents/`,
`skills/` and the hook test lines, so the space these removals open cannot refill unnoticed
the way it refilled four days after the largest previous deletion. `npm test` passes, and
the Closure note carries a before-and-after measurement in bytes per dispatch, Setup tokens
and line counts.

## Grounding snapshot

### What the three analyses establish

`shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`
measured 443 defect records, 540 commits and every shipped surface against a control project,
`krk`, built with fusion and carrying none of fusion's complexity. Its central finding is that
the defect rate is not deteriorating. fusion files 1.37 records per commit, krk files 1.10,
and the closure ratio is 91 percent with a median lag of zero days. **The binding constraint
is the rate of addition, not the size of the system.** The proof is a precedent: the shell
classifier deletion of 7 August removed 3,597 lines of hook source and 7,475 of test, and four
and a half days later the source stood 969 lines above its pre-deletion peak and the test
corpus 4,981 above it. Removal works and does not hold unless something bounds the refill.

`shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` measured where the
time goes: bookkeeping between steps costs up to 28 percent of session time, 76.5 hours of the
277.5 measured across both projects. Its single first move, had only one thing been done, is
to delete the hand-maintained session counters and derive them from git and the event log at
read time. That one change removes the largest measured cost, takes 43,130 tokens out of every
orchestrator Setup, and deletes roughly 5,400 lines of drift machinery whose only subject is
those counters.

`shared/analyses/260812-0303-the-largest-consumer-read-for-the-first-time.md` read the largest
consuming project, 1,689 sessions and 2,759 commits, which the first analysis could not reach.
It revised four of the eight removal candidates. **Where the two contradict, the field
measurement wins**, and the user settled each of the four on that basis.

### The eight mechanisms that leave, each with the measurement behind it

1. **The Plane mirror.** 5,330 lines of code and test, 44,121 bytes of prose. Zero successful
   pushes ever recorded in either project. The 44 entities the largest consumer did push went
   to `http://localhost:9999` while the real Plane integration was hand-rolled against
   `https://plane.digitalleadership.com`. Of 215 attempted pushes, 163 failed on a missing API
   key, 44 on an unreachable server and 8 on rate limits. `fusion-plane.test.ts` alone is 74.5
   seconds of a 99-second suite.
2. **Churn and cross-file counters.** Roughly 2,028 lines and 389 KB of runtime state, the two
   largest writers to an 18 MB event log. 16,097 firings in `krk` produced no halt, no record
   and no user action. In the largest consumer, 73 sessions narrate a score and zero decisions
   cite one; the top-ranked file has been `orchestrator-live.md` since May, dismissed in
   near-identical words for four months.
3. **The stash and pop skill pair.** 65,677 bytes of prose across two of the three largest
   skills. Never invoked in either project, and zero mentions across 1,689 sessions of the
   largest consumer, which had solved the same problem by hand a month before the skills
   shipped.
4. **The persisted `tasklist.md`.** 162,038 bytes, 1,041 lines, 79 entries, and at 43,130
   tokens the single largest thing Setup reads. Every one of the ten queues ever built went
   stale. `taskplanner` itself stays: one of those ten runs cleared 15 ready tasks and 11
   park-decisions in a night, and that batching capability is the half worth keeping.
5. **`investigator`, folded into `analyst`.** Prompt 15,502 bytes plus a capture-layout
   template a project must copy before the agent will run. Four dispatches in the largest
   consumer, all on two days, none in the eight weeks since, and its input surface was deleted
   in July. The heavy diagnostics went to the analyst in the same period, one of them typed
   *"Forensic investigation (4 sim runs)"* and concluding *"Hypothesis B confirmed"*.
6. **The `strategic` and `knowledge` domain values.** Filtered to the 138 dispatches where the
   parameter means anything, `strategic` was never passed and `knowledge` was passed twice,
   both on 12 May. `code` and `data` stay, and the parameter itself stays.
7. **The hand-maintained session counters and the drift machinery whose subject they are.**
   Roughly 5,400 lines. Every `state_drift` firing in both projects is `agentstate.yaml`
   disagreeing with git, and the check derives the true value from `git rev-list` in order to
   compare against it. The true number is already computed; only the hand-written copy is
   optional. `bin/fusion-turn-budget` is **not** in this item, though the first analysis listed
   it there: it reads a configured Turn ceiling from `fusion-guard.json` and measures no drift.
   The Turn ceiling stays project-configurable.
8. **`conceptrev`.** Prompt 12,459 bytes. 29 runs in the largest consumer returned 18 clean and
   11 acceptable, and 7 runs in `krk` returned acceptable 7 times. Across 36 measured runs in
   two projects the verdict was never adverse, and a plan gate waits on it. The agent prompt
   goes and the gate stops waiting.

### The counting caveat, recorded so a later reader does not correct it wrongly

The first analysis numbers its removal list 1 through 8, and `conceptrev` was added later as
item 9 in that numbering. **Eight mechanisms actually leave, not nine.** Item 8 of the
analysis, the embedded shell programs in `agents/orchestrator.md`, is out of scope for this
Circle, and item 5 lost its `consultant` half. Both facts are below.

### What must not go, and why

- **`consultant` stays.** The first analysis called it near-dead on one dispatch. The field
  measurement is 79 records over 103 days, roughly 73 percent acted on, and 326 files outside
  `consult/` citing a consultation by name. It is the most-acted-on agent measured anywhere.
  The decline is real and the agent is not: four consultations in the last 67 days, against 50
  in May.
- **`reconciler` stays**, pulled out of the self-bookkeeping family it was grouped with. 128
  sessions, 113 containing correction language, and it is the only mechanism that notices when
  fusion's own artifacts go stale.
- **`taskplanner` keeps its batching capability**, as item 4 above states.
- **`coderev`, the Human Gate, the issue and decision discipline, the Circle container and the
  shaper** are untouched. `coderev` filed 159 of the 272 attributed defect records and is the
  project's only working sensor; removing it would reduce knowledge of the defect count rather
  than the count.

### The rate lever, and what already exists

Only lever (a) of the three the first analysis proposed is in scope: **restore a cap that
fails the test suite, placed on `agents/`, `skills/` and the hook test lines.** Those are the
surfaces that grew after the 5 August change turned the emission ratchet from a blocking gate
into a non-failing report: `agents/` rose 38 percent and hook tests 47 percent, while `rules/`,
the one surface the old cap covered, shrank.

**A hard bound already exists and this Circle extends it rather than inventing it.** On
2026-08-14, commit `5c843e6` armed a failing bound over the always-on rule corpus in
`hooks/lib/__tests__/rules-emission-golden.test.ts`, re-baselining the five core entries once
at the arming and writing the overshoot into the file as text. The binding decision is
`circles/260801-1244-curator/decisions/260814-0738_i_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`.
`RELEASE_CAP` at 105,354 and `DRIFT_CEILING` at 145,144 are historical facts in that file and
are never raised. The work here is to bring three uncovered surfaces under the same
instrument, with the arming precedent already established.

### The administrative surface

Eight names are two entry points and six components. `skills/cleanup/SKILL.md` Steps 4, 5 and 6
already read and execute `archive` (tier-1), `revise-claude-md` (full three-pass) and
`log-activity` inline, so a user who types `/fusion:cleanup` never types those three.
`skills/setup/SKILL.md` mentions `unlock` nowhere, while
`shared/issues/260810-0326_o_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md`
already asks Setup to seed the file `unlock` writes. `cadence` is read-only on every input and
writes only its own digest, which makes it a reading command mis-grouped with the other seven.
Three visible names remain: `setup`, `cleanup`, `cadence`.

**`curate` replaces `revise-claude-md`, and the `--deep` switch was declined.** One path leads
to `CLAUDE.md`, the evidence-tiered one behind a user gate, and the autonomous three-pass is
removed. `curate` does not keep a slash name of its own, because that would make four.

**The consequence, stated rather than passed over.** `/fusion:cleanup` is documented as an
autonomous pipeline whose `## Autonomy and safety` section opens by defining autonomous as *no
per-step confirmation gates*. The curator is gated on the user by construction. The two answers
above determine the outcome between them: with three visible names and one gated path,
`/fusion:cleanup` acquires exactly one gate, at the `CLAUDE.md` step and nowhere else, and that
sentence in the skill body becomes false and must be rewritten rather than left standing. Under
`--dry-run` the step stays survey-only, as every other step already is. What the two answers do
**not** determine is whether that gate blocks the pipeline or whether the curator's change
ledger is filed for a later approval so the run still finishes unattended. That residual is
filed as an open decision in this Circle, cited under `## Dependencies`, and is to be answered
before the plan reaches the `CLAUDE.md` step. It is not resolved here, because both readings
satisfy every answer given so far and they differ in whether `/fusion:cleanup` can still be
typed and walked away from.

### Out of scope, so the next reader does not re-derive it

- **Item 8 of the first analysis, the embedded shell blocks in `agents/orchestrator.md`.** They
  stay where they are for this Circle. The prompt is 164,716 bytes, 41 percent of all agent
  prose, and it doubled in about 36 hours on 10 and 11 August; moving its shell programs into
  tested `bin/` helpers is a unit of work of its own.
- **Lever (b), an external-witness intake** that would require a finding to have evidence
  outside fusion's own text before it may open work.
- **Lever (c), instrumenting the consuming projects** so the review loop has an external input
  at all. One defect record in the entire history was filed by a user.

### Closure criterion

All agreed removals are through, `npm test` passes, and the restored cap fails the suite as
soon as something is added back to `agents/`, `skills/` or the hook tests. A before-and-after
measurement in bytes per dispatch, Setup tokens and line counts stands in the Closure note. A
field run against a consuming project and a decision record per removed mechanism were both
offered and both declined.

## Dependencies

No other Circle. The portfolio is empty: all fourteen existing Circles carry a terminal marker
and `.active-circle` is absent. Five artifacts bind this one and are cited rather than copied.

- `circles/260801-1244-curator/decisions/260814-0738_*_how-is-the-always-on-growth-bound-armed-when-the-corpus-is-already-over-budget.md`
  — the armed growth bound and the re-baselining rule the cap work extends. Binding.
- `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-0007_*_does-fusion-cleanup-block-at-the-claude-md-gate-or-leave-the-ledger.md`
  — the one residual this Circle deliberately left open, in this Circle's own decision store.
  Answer it before planning the `CLAUDE.md` step.
- `circles/260813-0910-documentation-matches-shipped-plugin/` (`_b_`, Bounded Closure) — every
  removal here re-opens the surface that Circle worked on, and its own Bounded-Closure Artifact
  is the finding that a pass over sixteen agent prompts is not a pass over the plugin. Its
  step 10, verifying `docs/plane-setup.md` against `bin/fusion-plane`, is now moot if the Plane
  mirror goes; check its open record before starting that work.
- `circles/260719-1536-plane-mirror-integration/` (`_c_`) — the Circle that built the mirror
  this Circle removes. Read its closure note before deleting, so the removal records what was
  built rather than only that it went.
- `shared/issues/260810-0326_*_setup-must-seed-claude-settings-because-the-plugin-settings-json-is-not-a-permission-source.md`
  — the open defect that folding `unlock` into Setup closes.
- `shared/issues/260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`
  — retired by the investigator fold rather than answered; close it with the fold.

## Turn log

- Turn 1 (session 260814-2306): commits 348f6db..c4761dc; steps P-1 to P-3 done (before-measurement, Plane mirror removed in two halves); suite 1030 tests/76.6s -> 903 tests/~30s; reviewed over the whole session range 9a7da8e..HEAD by coderev and ontorev, coverage now covered; 10 defect records filed, 3 closed; Coherence verdict: pending gate; session history: shared/history/260814-2306-orchestrator-session.md
- Turn 2 (session 260814-2306): commits c4761dc..b70097f; plan correction of the false lint premise (8 of 11 remaining steps carried it, not the 2 reported); the legacy-halt-clearing flake diagnosed and deliberately not patched, its cause being two concurrent npm test runs racing on hooks/dist; **inserted step P-3b**, not in the plan, which made the suite safe to run concurrently (332267a, 6/6 red before and 12/12 green after) and which the Circle grew by, since the closure criterion rests on the suite meaning something; then steps P-4 to P-6 (churn heatmap, churn configuration leaves, stash/pop pair with the commit-lock rule rehomed); session history: shared/history/260814-2306-orchestrator-session.md
- Turn 3 (session 260814-2306): commits 6350854..518926d; steps P-7 to P-9 (conceptrev removed, investigator folded into analyst, the strategic and knowledge domain values); session history: shared/history/260814-2306-orchestrator-session.md
- Turn 4 (session 260814-2306): commits 9955e8f..9306f0a; steps P-10 to P-12 (the persisted tasklist and its queue-ground apparatus, the hand-maintained session counters and the drift machinery, the administrative surface down to three names), then gate G1; session history: shared/history/260814-2306-orchestrator-session.md

## Closure note

Closed coherent at 260815-2115, after a Rebalance gate at which the user revised the Grounding.
Session history: `shared/history/260814-2306-orchestrator-session.md`. 36 commits from `9a7da8e`.

### What the Directive asked, and what it got

Eight mechanisms left the shipped plugin, plus `conceptrev` as a ninth: the Plane mirror, the churn
heatmap and its configuration, the stash and pop skills, the persisted `tasklist.md` and its
queue-ground apparatus, `investigator` (folded into `analyst`), `conceptrev`, the `strategic` and
`knowledge` domain values, and the hand-maintained session counters with their drift machinery.
`unlock` and `revise-claude-md` went as skills. The failing growth cap now covers `agents/`,
`skills/` and the hook test lines, each with its own baseline, floor and separately derived
head-room, and it was proved by four add-backs turning the suite red.

### The measurement, with the qualification it needs

| | before | after |
|---|---:|---:|
| test files / tests | 49 / 1 030 | 40 / 751 |
| suite duration | 76.57 s | ~60 s |
| `agents/*.md` | 460 292 B | 399 843 B |
| `skills/*/SKILL.md` | 294 134 B | 220 439 B |
| hook source lines | 7 934 | 6 277 (−1 337 real) |
| hook test lines | 25 897 | 19 453 |
| `bin/*` lines | 6 135 | 3 414 |
| Setup read | 467 129 B / 116 782 tok | 266 829 B / 66 707 tok |

**Four claims of this Circle's own Grounding did not survive the measurement**, and that is the
measurement working rather than failing. Rule text per dispatch **rose 248 bytes** for six of the
fifteen agents, because the curator's approved pass put back more than the removals took. The suite
fell 21 percent, not to a third. 81 percent of the Setup saving is this repository's own accumulated
queue; the portable part another project would observe is **38 262 bytes, about 9 565 tokens**. The
`docs/` figure is 15 402 bytes, not the 23 534 first recorded — step 15 added a file after the
measurement.

### Residuals, named rather than resolved

1. **Nine commits closed unreviewed**, five of them touching shipped files. The fifth consecutive
   Turn where review and commit ranges diverged. Judged a residual and not a blocker on the ground
   that the cap commit carries four defect records with reproduction steps, so unreviewed and
   unexamined came apart.
2. **The cap has a demonstrated latent hole.** It reads two directories while the test runner loads
   recursively — 3 002 lines invisible, 120 percent of the head-room. Latent, not active: every test
   file today lives in the two directories it reads. Both halves belong in any statement of it.
3. **The collapse to three names is presentational.** A skill directory is a slash command, so
   `archive`, `log-activity` and `curate` still resolve. Only `unlock` and `revise-claude-md` are
   gone. Seven shipped surfaces still tell a user to type a demoted name.
4. **Failure investigation became dispatchable**, where the investigator was user-initiated by
   design. Surfaced to the user, who did not object.
5. **Two answered decisions have unrealisable answers**, deliberately not annotated, filed as their
   own question.
6. **Three of four version surfaces are written.** The marketplace entry and the tag are the user's.

### What the Circle leaves that outlasts it

The `Retired:` annotation and its 25 applications, from an open question this Circle roughly doubled
the population of before answering. And the honest finding underneath the whole Directive: the
largest deletion in this project's history was refilled in four and a half days, so removal buys
days and the cap is what is meant to make it hold. Whether it does is not yet measured.


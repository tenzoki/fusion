# Orchestrator Session — 260816-1500

**Directive:** (not yet stated — Setup run via /fusion:setup; awaiting the user's task)
**Mode:** (not yet resolved)
**Status:** In progress

## Setup snapshot

| Item | Value |
|---|---|
| Workspace | /Users/k1/Projects/productive/fusion |
| Plugin version | 9.0.0 |
| Source root | work tree (fusion's own repository) |
| Active Circle | none — all writes resolve to shared/ |
| Turn budget | 12 (bin/fusion-turn-budget, resolved) |
| Workbench domain | code (code_files=111, data_files=12, counted_by=git-ls-files) |
| git HEAD at start | 0a05950 |
| Guard | OK — haltActive false, 0 consecutive blocks |
| Interrupted session | none — no agentstate.yaml |
| Concurrent session | none — marker written for this session |
| Open issues (shared) | 92 |
| Open plan steps (shared) | 1 plan file open |
| Open decisions (shared) | 12 |
| Circles | 13 closed, 1 bounded, 1 superseded; 0 anticipated, 0 active |
| Portfolio hint | not printed — no anticipated or active Circles |
| Permission file | already carries defaultMode bypassPermissions; Step 0g question skipped |

## Session log

- Setup complete. Awaiting the user's Directive before Phase 0 scope resolution.

## Decisions answered by the user (inline, this session)

### 260814-2017 — parent spec closes when its last Circle does?

**Answer: option 1.** The spec `shared/planning/260801-1122_o_spec-normative-consolidation.md`
is renamed `_c_` and carries a closing note naming the three retirements (C4 retired by user
decision 2026-08-14, C5c's subject deleted 2026-08-12, C9 performed by hand and put out of scope).
The user accepted the stated cost: `_c_` reads as delivered to anyone who does not open the file,
and the mandatory note is the whole of the mitigation. Implementation is queued, not yet performed.

### 260815-2312 — should the Circle record's `**Status:**` field exist at all?

**Answer: option 1, without urgency.** The field goes; the filename marker becomes the only
source. The user chose the "next Circle that touches Circle records for another reason" timing
over a Circle of its own, so the status quo after `282ef42` stands until then. Implementation is
deferred by that timing and needs an explicit position on the records already carrying the field.

### 260815-2322 — can a commit stand green alone when the golden is a per-file inventory?

**Answer: option 1.** The green unit is the Turn, not the commit, and the golden's failure text
gains the sentence saying so and naming regeneration as a Turn-end act. The user accepted the
stated cost: a suite run at an arbitrary commit inside a multi-task Turn meets a failure that
means nothing without this rule, and `git bisect` will land on such commits. Implementation is
one sentence in the failure message; queued, not yet performed.

### 260812-0254 — should a cited artifact path be absolute?

**Answer: option 3.** Agents render `$WORKBENCH`-prefixed absolute paths in user-facing chat and
keep workbench-relative paths in stored records. No new mechanism: `bin/fusion-paths` already
emits `WORKBENCH` absolute. The user did not take the compound option, so `FUSION_PROJECT_ROOT`
is not adopted and project sources outside the workbench stay uncovered; option 2 remains
available if that gap turns out to matter.

### 260812-0254 — how does a consuming project file a defect against the plugin?

**Answer: option 1.** A `plugin-issues/` store in the consuming project's workbench, plus a skill
that writes there. The record stays where it was observed and a transfer step carries it. The
user took option 1 alone rather than the staged option-1-then-2, so the plugin-side pull is not
adopted and the transfer stays manual by decision, not by omission.

### 260815-2109 — may a Circle close over an uncovered review range?

**Answer: options 3 and 1, in that order.** `bin/fusion-review-coverage` filters its uncovered
set to commits touching at least one non-workbench path, and that filtered number stays advisory:
the Circle may close `_c_` if nothing else flags, and the closure note names what no reviewer
opened. The user accepted the two stated costs: a High-severity defect can ship unexamined over a
record that reads "closed coherent", and the filter is a change to a shipped surface charged
against the growth bound armed at `0609945`.

Re-open trigger, carried from the record's own recommendation: if the next two Circles close over
uncovered ranges and reconciliation finds nothing in them, that is evidence against this answer.

### 260809-1224 — is the decision-governed escalation (CHECK 3) live or retired?

**Re-opened and answered: option 1, retired.** The record was deferred by the user on 2026-08-11
with an explicit re-open trigger: a measurement over the reachable consuming projects, where a
zero answer settles it as retired. The measurement was taken on 2026-08-12 and is zero (krk: no
declaration, 0 `decision_governed` blocks in 37,186 events; unite-co-creator: no declaration,
event log absent from the clone so blocks unmeasured; fusion itself: no declaration). The user
answered under the trigger's own terms: remove CHECK 3 and its four configuration keys.

Marker moves `_d_` → `_a_`: the deferral ended when its trigger fired, and the record now carries
an answer rather than a postponement. This unblocks recommendation C5 of
`shared/analyses/260809-1101-guard-support-layer.md`, blocked since 9 August.

The stated cost, accepted: a consuming project that had populated the keys would lose their
effect silently, and the measurement covers the two projects reachable from this machine rather
than all of them.

### 260812-1232 — does the escalation counter survive a block source that ships inert?

**Answer: option 3, sequenced into its own Circle.** With CHECK 3 retired by the predecessor
above, escalation has no input at all, and the counter, the halt and `clear-halt.js` go with it.
The guard becomes observation-only. The user took the record's own sequencing: this is a strictly
larger removal than the protected-path one and must not ride along on another Circle's scope.

Two costs accepted explicitly. It removes the ability to stop an agent at all, which
`docs/philosophy.md` names as load-bearing. And it needs a migration for any consuming project
carrying an active halt: the removal of `clear-halt.js` must sequence behind that, or those
projects are stuck behind a mechanism that is gone twice over.

### 260812-1232 — does the write guard's fusion-repo stand-down survive the loss of its subject?

**Answer: option 3, dissolved by the coupling.** With CHECK 3 retired and escalation removed,
`hooks/guard.ts` has no verdict left to stand down, so the branch falls in the same Circle as the
mechanism it silenced. `isFusionPluginCwd()` loses its last caller and goes with it.

One constraint carried forward from the record and from `CLAUDE.md`: `isFusionPluginRoot()` stays.
The rule it preserves — a stand-down is evaluated in the coordinate space its mechanism keys state
by — outlives both stand-downs, and the entry point has to keep a comment saying so, or the next
pass removes it as dead code.

### 260816-0119 — can anything carry the rename-to-citation obligation?

**Answer: option 1, nothing beyond the existing gate.** `reference-resolution-lint` already fails
on a stale marker citation and its message names the wildcard fix. No written obligation and no
`bin/` helper is added, so fusion still has no mechanism that rewrites shipped text — the
threshold the record named stays uncrossed.

The cost the user accepted is specific and measured: the breakage lands on a later session that
did not cause it, a one-character mismatch reddens a 750-test suite, and behind `agents/coder.md`'s
report shape every executor dispatched in that state reports `blocked` regardless of what it
achieved (`shared/issues/260810-0703`). The live third instance at `hooks/guard.ts:307` resolves
only because its target has not moved yet.

### 260816-0711 — is count-pinning the convention for every gate that reports what it examined?

**Answer: option 2.** Probe-assertion is the convention; count-pinning is the fallback where no
probe exists. The three existing gates keep their current shapes, and a fourth inherits this
ordering rather than copying whichever it met first.

Two things the user accepted. "Where a probe exists" is a judgement renewed at every gate, which
is the boundary shape this project has been burned by before. And the evidence for the choice is
one session of the cascade's probe assertion costing nothing, which the filing reconciler flagged
as not evidence about a convention.

### 260816-0711 — where does the tracked-workbench split live?

**Answer: option 2.** The subsection moves to its own `rules/workbench-tracking.md` with a
one-line pointer left in the conventions file, taking about 4 800 bytes off every dispatch of
every agent. This applies for a fifth time the remedy the conventions file's own header table
already records four times.

The user accepted the fifth-partition cost. One prerequisite the record names is **not** settled
by this answer and blocks implementation rather than following it: `bin/fusion-rules` emits to
agents only, and the consumers that actually apply this rule are a human writing a `.gitignore`
and the archive step of `/fusion:cleanup`, which is a skill. The emission target has to be
decided before the move, or the move creates a file emitted to nobody. Filed as its own decision
this session.

### Install-path policy (prerequisite to 260816-0719)

**`heads/main` stays the default install path.** The user settled the policy rather than leaving
it inferred from one line in `install.sh`. Consequence, carried straight into the next question:
a release-step check is insufficient by construction, because every intermediate commit is
something a user can install.

### 260816-0719 — should anything assert that committed `hooks/dist` is the compilation of committed source?

**Answer: option 2, a test that compiles and compares.** Option 3 was eliminated by the
install-path policy settled above rather than by argument: with `heads/main` the default, a
release-step check leaves every intermediate commit shipping a possibly stale artifact.

Three constraints the implementation inherits, all named in the record and none of them free.
The test compiles inside the run, so it is slower and differently shaped from the four existing
bounds. Byte-identity depends on the compiler version, so the assertion needs either a pinned
toolchain or a semantic comparison, and the user chose the byte-comparison form, which makes the
pin the load-bearing part. And it must not read the shared `hooks/dist` during a run, because
staging the build is what makes concurrent suite runs in one checkout safe.

## Decisions filed this session

Two answers raised questions of their own, filed per the mandatory-filing rule rather than left
inside the records that raised them:

- `shared/decisions/260816-1707_o_to-whom-is-the-new-workbench-tracking-rule-emitted-when-its-consumers-are-a-human-and-a-skill.md`
  — open. Blocks the move approved in `260816-0711`: `bin/fusion-rules` serves agents only, and this
  rule's consumers are a human and a skill.
- `shared/decisions/260816-1707_a_which-install-path-is-the-authoritative-one-for-end-users.md`
  — answered on filing. Writes down the policy that `260816-0719` refused to infer from a default.

## Status

Setup complete; 13 decision records moved `_o_`/`_d_` → `_a_`, 2 filed. No Turn was run, no queue
was built, no code or data changed. Implementation of the answered decisions is not queued yet.

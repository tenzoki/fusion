# How does a Martin-style multi-story user run fusion, given single-active-Circle and no concurrency lock?

---
**Domain:** code
**Status:** answered
**Filed by:** analyst
**Cross-references:** shared/analyses/260719-2141-plane-mirror-martin-convergence-feasibility.md (the analysis that raised this), archive/260817-1907-safe-cleanup-scoped/shared/decisions/260719-2141_*_plane-rolle-push-only-vs-bounded-readback-martin.md (the sibling D1-refinement), circles/260719-1536-plane-mirror-integration/_c_circle.md (the Circle this affects), /Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator/MARTIN.md (the workflow — worktree slots `:138-165`)

---

## Question

Martin runs **N parallel fixed worktree slots** (`.worktree-ui/wt-1..3`), one per terminal / Claude session, each on its own `feat/<seq>-<slug>` branch — N stories in flight at once. fusion is **single-active-Circle**: `.active-circle` is a single pointer, and fusion has **no concurrency lock** (advisory single-orchestrator only; two orchestrators against one project corrupt `agentstate.yaml`, race the `.guard-state/` counters, and double-dispatch from one `tasklist.md`). If adopting regular fusion forces Martin to work one story at a time, his three-slot throughput collapses and he will not switch — the analysis names this the single biggest adoption risk. So: how does a multi-story user run fusion without losing parallelism and without hitting the concurrency hazards? This must be settled before the Plane Circle's convergence scope is fixed, because the answer determines whether "adopt regular fusion" is even viable for Martin's working style.

## Options

1. **Slots stay Martin's concurrency mechanism; fusion does not own cross-slot concurrency** — each worktree slot runs its own fusion session against its own active Circle. Because the workbench is `pwd`-anchored and each slot is a separate working tree, per-slot `.active-circle` / `agentstate.yaml` / `.guard-state/` state is isolated by construction.
   - Pros: no change to fusion's single-active-Circle model; keeps Martin's proven throughput; smallest fusion-side scope. Aligns with fusion's existing "the workbench is anchored to `pwd`; a subfolder may have its own independent workbench" design.
   - Cons: **depends on an unverified assumption** — that N slots really do get N isolated workbench states rather than sharing one at a common parent. If the slots share a parent workbench, they share `.active-circle` and `.guard-state/` and the hazards are live. Must be verified before relying on it. Also multiplies workbench state across slots (N portfolios, N tasklists), which may confuse a user expecting one project view.

2. **fusion grows real multi-active-Circle support + a concurrency lock** — `.active-circle` becomes a set; `agentstate.yaml` and `.guard-state/` counters become per-Circle or lock-guarded.
   - Pros: one project, many concurrent Circles, first-class; matches Martin's model directly without per-slot workbench duplication.
   - Cons: a large, invasive change to fusion's core session and guard model — well beyond the Plane Circle's scope, and it touches exactly the hooks/state the user protected. High risk. Almost certainly a separate Circle of its own.

3. **Accept single-active-Circle for fusion users; Martin keeps his bespoke slot tooling outside regular fusion** — convergence delivers the Plane bridge but not the parallelism.
   - Pros: no fusion-core change; honest about the limit.
   - Cons: Martin does not get his throughput inside regular fusion, which is the adoption blocker the analysis flagged. Convergence goal partially unmet.

## Constraints

- Core features and hooks are preserved (user, binding). Option 2 pushes hardest against this.
- fusion has no concurrency lock today; parallel orchestrators against shared root-anchored state (`agentstate.yaml`, `.guard-state/`, `.commit-lock/`) is a known hazard (`CLAUDE.md`, conventions `## fusion-workbench Layout`).
- The workbench is `pwd`-anchored; a subfolder may legitimately hold its own independent workbench (conventions `## fusion-workbench Layout`).

## Recommendation

`inference:` **Option 1** is the clean near-term answer — keep worktree slots as Martin's concurrency mechanism and do not make fusion own cross-slot concurrency — **conditional on verifying** that N parallel slots actually get N isolated `pwd`-anchored workbench states rather than sharing one at a common parent. That verification is a small, concrete task for the planner and must precede any reliance on this option. If the isolation does not hold, the choice narrows to Option 2 (a large separate Circle) or Option 3 (accept the limit). Option 2 is out of scope for the Plane Circle and should not be folded into it. This decision is genuinely the user's: it depends on how the user intends a multi-story user to run fusion, which the analysis cannot infer.

---
Answered: user decision (session 260719-1632) — **Option 3: fusion does not support concurrency.** fusion stays single-active-Circle with no concurrency lock. The Plane bridge (C3 push-only mirror + C4 offline + one bounded seeding-read) is delivered; parallelism is explicitly out of scope. A multi-story user runs one active Circle at a time; parallel worktree slots remain the user's own mechanism outside fusion's guarantees (the advisory single-orchestrator warning applies). No worktree-isolation verification is needed — Option 1 is not relied upon. This removes the pre-activation blocker on the Plane Circle (`archive/260817-1907-safe-cleanup-scoped/circles/260719-1536-plane-mirror-integration/_c_circle.md`).
Implemented:
Deferred:
Superseded by:

---
Reconciliation 260731-2324 (reconciler, domain `code`) — **stays `_a_` deliberately; not promoted to `_i_`.** The answer chosen was Option 3, "fusion does not support concurrency", whose realisation is the *absence* of a concurrency mechanism. There is no commit that implements a non-feature, so the `_i_` transition — which the vocabulary defines as "code or data on disk now reflects the decision", cited by hash or `path:line` — has nothing to cite. The surfaces that express the answer (`bin/fusion-session-mark`'s advisory marker, `/fusion:setup` Step 0d's running/stale warning, and the "Single orchestrator per project (advisory)" paragraph in `CLAUDE.md`) all predate this decision and were not written to satisfy it.

Left open as a judgement call for the user rather than resolved by the reconciler, because `_i_` is terminal and promoting on absence-of-evidence is the wrong direction to be wrong in. Two defensible outcomes: promote to `_i_` citing the three pre-existing advisory surfaces as the realisation, or leave `_a_` permanently on the view that a no-op answer never reaches implementation. Nothing downstream is blocked either way — the pre-activation blocker this decision removed on `archive/260817-1907-safe-cleanup-scoped/circles/260719-1536-plane-mirror-integration/_c_circle.md` is long since cleared (that Circle is `_c_`).

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`; the 260731-2324 judgement stands and now has a second instance.**

The answer is still the standing answer: fusion is single-active-Circle and has no concurrency
lock. The three advisory surfaces the earlier note named are all present and none was written for
this decision — `bin/fusion-session-mark`, `/fusion:setup` Step 0c's running/stale warning, and
`CLAUDE.md`'s "Single orchestrator per project (advisory)" paragraph. `bin/fusion-commit-lock` is
a mutex around `git add`/`git commit` and is workbench-anchored, which is real serialisation but of
one operation, not of sessions; it does not realise this answer either.

The class this record opened now has a second member:
`shared/decisions/260816-0119_a_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`,
answered option 1 ("nothing new"). Both are answers whose realisation is an absence, and both are
therefore uncitable under `rules/fusion-workbench-conventions.md` `### Decision files`. Deciding the
class once would settle both; deciding them one at a time will not stop a third arriving.

**What binds a deep change.** Nothing in fusion may assume two orchestrators can run safely against
one workbench. `agentstate.yaml`, `.active-circle` and `orchestrator-events.jsonl` are all
root-anchored single-writer state, and the only guard is a warning the user may ignore.

---
**Reconciliation 260822-1556 (reconciler, domain `code`, HEAD `9f65463`) — marker unchanged at
`_a_`, and this record now stands against a Directive it forbids.**

*What changed around it.* `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`
was written and approved by the user on 2026-08-22 and specifies exactly the arrangement this
record's Option 2 sketched and its Option 3 refused: several checkouts, git as transport, true
parallelism. The spec's C1 names the supersession of this record as its own work
(`### C1: The isolation the whole arrangement rests on is verified, and the blocking decision is
superseded`), and the orchestrator recorded at `## Phase 0 — scope resolution` that the supersession
is written after the spec is agreed rather than before it, so an answer nobody had stated would not
be recorded first.

*What did not change.* The spec is agreed and the supersession has not been written. No
`Superseded by:` line stands here, the marker is still `_a_`, and this record is therefore still
active Grounding: a scan filtering `_o_` + `_a_` picks it up, and what it says is that nothing in
fusion may assume two orchestrators can run safely against one workbench. Nothing in
`370bfc5..9f65463` contradicts it in code — the whole range is a cut — so the tension is between
this record and the stated Directive, not between this record and the tree.

*What would discharge it.* C1 verifying that N checkouts produce N isolated workbenches, then a new
decision recording the reframed answer, then `Superseded by:` here and `_a_` → `_s_`. Until then a
reader of this record is reading the rule that is still in force.

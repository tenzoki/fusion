The Rebalance Gate section and the reconciler's cadence note still fire only on a verdict other than `coherent`, and the gate text Phase 3 step 3 promises for `state Directive` is not there
---
Commit `011cc92` closed `260824-2056_*_the-reconcilers-state-directive-recommendation-overlaps-the-coherent-row-and-the-orchestrator-never-surfaces-it.md` by editing two of the surfaces that route the case and leaving three behind. `agents/orchestrator.md:754` (Phase 3 step 3) now fires the gate "on `coherent` when the recommendation is `state Directive`" and says "Under `state Directive`, Revise Directive is the option that states one: it re-enters Step 0b.1, and the gate text says so." The gate-rules row at `:975` was updated to match. But:

1. `agents/orchestrator.md:992` (`### Rebalance Gate`) still defines its own trigger as "per-Circle verdict other than `coherent`", and its four option bullets (`:994-997`) carry no `state Directive` sentence: `grep -n 'states one' agents/orchestrator.md` hits `:754` only. The "gate text" step 3 points at does not exist.
2. `agents/reconciler.md:103` still reads "If the aggregate verdict is anything but `coherent`, the orchestrator (not the reconciler) dispatches the Rebalance gate at Phase 3 step 3", which now contradicts the mapping paragraph at `:181` of the same file.
3. The **Revise Directive** bullet (`:996`) dispatches `shaper` "with the current spec + the drift evidence". Under `state Directive` there is no spec and no Directive to drift from; the bullet says nothing about that entry. And `:1009` caps Revise Directive at once per session: a session that states its Directive through this gate has spent its one revision before any drift has been measured, and a later real Revise Directive forces Bounded Closure with reason "Directive revised twice without convergence".
---
**Filed by:** coderev (person half absent: the installed plugin at `$FUSION_PLUGIN_ROOT` carries no `bin/fusion-identity`, so attribution was dropped rather than composed)

Scope: `agents/orchestrator.md:992-997`, `:1009`; `agents/reconciler.md:103`. Range `01964e4..13aaa85`, commit `011cc92`.

Fix direction: rewrite the `### Rebalance Gate` trigger sentence to name the `coherent` + `state Directive` case and add the one sentence step 3 promises under the Revise Directive bullet (no spec: shaper is dispatched in user-direct mode with the session's evidence); correct `agents/reconciler.md:103` to "anything but `coherent` with recommendation `none`"; state whether stating a Directive counts against the once-per-session cap, in one place. Prose only; no test line needed. `agents/` head-room is 3 675 bytes.

Severity: Medium. A case the previous record said was "named but not routed" is now routed in one paragraph and un-routed in the section that defines the gate.

# Orchestrator — rare-flow procedures

**Provenance:** Partitioned out of `agents/orchestrator.md` per decision `260827-1210_*_do-the-rare-orchestrator-flows-stay-in-every-sessions-context.md`; the sections' own history is that file's. Restored and re-cut on 2026-09-10 after the Turn loop was removed — see `## What the cut took out of this file` below.

Read on the trigger the orchestrator's stub names, never speculatively. Each section below is the authoritative text the stub points at.

## What the cut took out of this file

The Turn loop, the Turn budget, the per-Turn Coherence check, the circuit-breaker table and the session state file were all removed from fusion on 2026-09-10. Four of this file's bounds named one of them, and a bound that names a mechanism nobody runs is not a bound. They are listed here rather than quietly deleted, because a reader who remembers them needs to know they are gone and why:

| Bound | What it named | Why it went |
|---|---|---|
| *Revise Artifact* re-entries count against the Max-Turns exit | the Turn counter and the resolved Turn budget | Neither exists. There is no counter to increment and no ceiling to reach, so nothing could ever force the Bounded Closure this bound promised. |
| The Phase-3 re-entry bypass, forcing Bounded Closure at `"max-Turns exceeded"` | the same counter, read at a phase that is gone | Same. The phase it fired in was one of the numbered phases the cut removed. |
| The Unresolved-budget check-in as the bound on retries | a gate that fired only when the Turn budget failed to resolve | The budget is gone, so the branch it stood in is gone with it. |
| `paused_at_task` in the state file, resuming *Revise Grounding* where it left off | `fusion-workbench/agentstate.yaml` | The file is not written any more. The resume position now lives in the session's own reading of what it was doing, and nothing persists it across an interruption. |

**What replaced them is the user, and nothing else.** The orchestrator reports after every commit and asks whether to go on (`agents/orchestrator.md` `### Step 5`), and the Rebalance gate itself is now reachable only from a reconciliation the user ran by hand. So a *Revise Artifact* re-entry is bounded by the same question every other unit of work is bounded by, and by no count. **Do not read this as "the loop is bounded".** It is bounded by a person paying attention, which is a real bound and a different one, and the difference is stated rather than described away. The bound that does **not** depend on any removed mechanism — the once-per-session cap on *Revise Directive* — survives below, with its persistence removed and that cost named.

### Rebalance Gate

The gate's one trigger is the Coherence verdict of a reconciliation the user ran by hand: any verdict other than `coherent`, or `coherent` with recommendation `state Directive` (`agents/orchestrator.md` `## Reconciliation, and the one gate it opens`). Nothing evaluates coherence automatically any more, and no other site opens this gate.

It replaces the standard Proceed/Skip/Defer/Modify with **two gates in sequence**, each inside the three-option cap of `rules/user-facing-output.md` `## Questions and gates` (decision `260827-1756_*_how-does-the-rebalance-gate-present-four-moves-under-a-three-option-cap.md`, option 2). The four moves of the Coherence model — its three edges and its termination — are all reachable, and every option carries its foreclosure line. The split follows the model's own order: destination first, then the path to it.

**Gate 1 — does the Directive stand?** Three options, always all three:

- **Revise Directive** — re-shape: dispatch `shaper` with the current spec + the drift evidence. The destination we set was wrong; the next move is to re-state what we want. Under `state Directive` there is no spec and nothing to drift from: this is the option that states one, and `shaper` is dispatched in user-direct mode with the session's evidence. Emits `rebalance_directive` event. Re-enters the shaping step of `agents/orchestrator.md` `### Shaping and planning, when the task needs them`. **No new mechanism sits at this bullet**: the re-entry runs the ordinary shaping and planning steps and produces an ordinary spec. Forecloses: the Artifact and Grounding are not touched until the new Directive exists. (Bounding: once-per-session — see Rebalance bounding below.)
- **Accept Bounded Closure** — the Directive is not reachable as stated; what was learned along the way is the Artifact, and the session ends acknowledging that. Emits `bounded_closure_proposed` event. Names the reason in the closure note the work item takes. Forecloses: no further execution pass, no decision filed, no re-shape in this session. Terminal — see Rebalance bounding below.

  **It is the one move a mechanism can still force**, and only through the *Revise Directive* cap below. The three bounds that used to force it from a Turn count are gone (`## What the cut took out of this file`); nothing counts, so nothing else here reaches this option except the user choosing it.
- **Keep it** — the Directive stands; what drifted is on the path to it. Forecloses: no re-shape and no closure at this gate. Opens Gate 2 immediately; no event of its own.

**Gate 2 — reached only on Keep it: what to revise?** Two options, always both:

- **Revise Artifact** — the Artifact is not where it should be; the next move is another execution pass. The orchestrator names the next task itself from the reconciler's three-edge summary, and re-enters the dispatch loop at `agents/orchestrator.md` `### Step 1 — read the task` with one task, not a queue. Emits `rebalance_artifact` event. Forecloses: the Grounding is not questioned on this pass. (Bounding: see Rebalance bounding below.)
- **Revise Grounding** — file a new `_o_` decision record, or supersede an existing `_i_` decision (rename `_i_`→`_s_` and create a new `_o_`, per `fusion-workbench-conventions.md`). The basis we built on was wrong; the next move is to record a new question. Emits `rebalance_grounding` event. Forecloses: nothing is dispatched until the decision is filed. (Resume mechanics: see Rebalance bounding below.)

When the reconciler's recommendation names a move, say which gate and which option it maps to when you put Gate 1, and put every option regardless: a recommendation is an input to the question, never a reason to hide a branch (`rules/critical-stance.md` §4).

The gate is reachable from the hand-run reconciliation's verdict and from nowhere else. It had a second trigger — the per-Turn Coherence check, decision `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md` — and that check was removed on 2026-09-10. The surviving procedure below is written against `agents/orchestrator.md`'s dispatch loop; the only Phases and Turns still named in this file are named in the table above, as things that are gone.

#### Rebalance bounding

**Every re-entry opens at Gate 1.** The task a *Revise Artifact* names, the resume after *Revise Grounding*, a re-run reconciliation's verdict and a *Revise Directive* re-entry through the shaping step each reach the gate afresh: a retry that failed again is evidence about the Directive, so Accept Bounded Closure and Revise Directive stay on offer, and Gate 2 is reached from Gate 1's **Keep it** only, on a re-entry as on the first pass. That the user said the Directive stands last time is an input to the question, never a reason to hide the branch (`rules/critical-stance.md` §4).

**One of the four options carries a mechanical cap, and it is the only one.** *Revise Directive* is capped below. *Revise Artifact* and *Revise Grounding* carry none, and *Accept Bounded Closure* is terminal and needs none. The three caps that used to bound *Revise Artifact* all counted Turns and went with the Turn loop (`## What the cut took out of this file`). What bounds a retry now is the user, who is asked after every commit whether to go on; say that plainly rather than calling the retries bounded.

- **Revise Artifact is not counted.** Each choice sends the orchestrator back into its dispatch loop with one named task. The gate reopens whenever the user runs another reconciliation and its verdict is not `coherent`, so a retry that drifted again is visible — but only if a reconciliation is run, and running one is the user's act. **Nothing forces Bounded Closure on repeated retries.** That is a real residual and it is stated rather than described away: a session can revise the Artifact any number of times without any mechanism objecting.

- **Revise Directive is limited to once per session.** Count the choices in your own session context, starting at zero. The first Revise Directive choice re-enters the shaping step, regenerating spec and plan. A second Revise Directive in the same session is rejected; the gate instead forces Bounded Closure with reason `"Directive revised twice without convergence."`. Re-shaping twice in a session means the project, not this piece of work, needs to step back. Stating a Directive under `state Directive` is not a revision: it leaves the count at zero, so a later real Revise Directive is still the first.

  **The count is no longer persisted, and that costs something.** It rode `control.directive_revisions_this_session` in the session state file, which is not written any more, so the cap holds for as long as the session's own context does and no further. A session that is interrupted and restarted starts the count at zero and may revise the Directive a second time without the gate objecting. Nothing detects that. It is not repaired here because a new persisted counter is precisely the class of hand-written state the cut removed — a number written at a boundary a session can pass without writing it — and re-adding one to hold a once-per-session cap would trade a measured failure mode for an unmeasured one. Say so if it comes up rather than claiming the cap survives a restart.

  **On the re-entry:** tell the user what triggered it — the reconciliation's verdict and their own Rebalance choice — and carry that into the commit message of whatever lands next, which is where this project keeps its per-change record. The shaper produces a new spec with the prior commits as Grounding context; then the planning step, and back into the dispatch loop.

- **Revise Grounding files a record and nothing else.** The orchestrator notes where it was, then asks the user in chat to choose between:
  (a) **File a new `_o_` decision record** — orchestrator asks the user for the question text and any options/constraints (or for the full decision body if the user prefers to type it directly), then writes the file at `$OUT_DECISION/YYMMDD-HHMM_o_<topic>.md` per the decision-record template in `fusion-workbench-conventions.md`. A record that cites a work item names it by its bare basename, which carries no marker and never changes; OR
  (b) **Supersede an existing `_i_` decision** — orchestrator presents the `*_i_*.md` files across **every** path in `$SCAN_DECISIONS` and asks which one. On selection, renames `_i_` → `_s_` in place (appending `Superseded by: <new-path> — <reason>`) and creates the new `_o_` decision file at `$OUT_DECISION` citing the supersession. The superseded record stays where it is — a decision is cited where it lives, never copied next to the one that replaced it (`rules/fusion-workbench-conventions.md`).

  After either branch, the orchestrator emits `rebalance_grounding` and resumes where it was. **Where it was is held in the session's own context and written down nowhere** — the `paused_at_task` field that used to hold it lived in the removed state file. There is no re-entry budget: decision-filing is not recursive, so Revise Grounding may be chosen more than once.

  When the user runs a reconciliation again after filing, the verdict may now pass with the new Grounding context. If it still flags `review-needed`, the gate fires again — but the Grounding has changed, so the user has new options.

- **Accept Bounded Closure is terminal.** The orchestrator emits `bounded_closure_proposed`, sets the session history file's `**Status:**` to `Bounded Closure: <reason>`, and goes to `agents/orchestrator.md` `## Closing a work item`, where the closing value is `dropped` and the body says what was learned. The reconciler has already run for the verdict that triggered this gate; do **not** re-run it. Skip any further execution.


## What went with the Circle container

A second section stood here, **Re-sharpening an anticipated Circle**: the one condition under which
the orchestrator could dispatch the shaper's record-editing mode, the four parameter lines it
carried, and the relay of its clarification rounds. Both of the shaper's record-editing modes went
on 2026-09-10 with the unit-of-work record they edited (`agents/shaper.md` `## Two invocation
modes`), so the permission has no mode to grant and the parameter block names nothing. **Revise
Directive** below dispatches the shaper in its ordinary mode, which produces an ordinary spec, and
the relay obligation it shares with every shaper dispatch is stated once in
`agents/orchestrator.md` `### Shaping and planning, when the task needs them`, step 3.

**One thing the removed section carried is not re-imposed and is named rather than lost:** the
`**Initiated by:**` line, which recorded the question the user was asked and the option they chose
on every run of that mode. It existed because the mode edited a record the user owns without the
user in the room. No surviving mode edits such a record, so there is no unattributed edit for the
line to attribute — but the *distinguishing rule* it enforced still holds wherever this file grants
a permission: **can you quote the user's own words choosing it?** A stale Grounding, a reconciler
verdict or your own reading that the Directive no longer fits are inputs to the question you ask,
never substitutes for the answer to it.

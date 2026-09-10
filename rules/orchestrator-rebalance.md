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

- **Revise Directive** — re-shape: dispatch `shaper` with the current spec + the drift evidence. The destination we set was wrong; the next move is to re-state what we want. Under `state Directive` there is no spec and nothing to drift from: this is the option that states one, and `shaper` is dispatched in user-direct mode with the session's evidence. Emits `rebalance_directive` event. Re-enters the shaping step of `agents/orchestrator.md` `### Shaping and planning, when the task needs them`. The record stops contradicting its spec without anything being added here: the re-entry runs the planning step, and the field write there carries the pointer literal (**Circle head fields**). **No new mechanism sits at this bullet.** Forecloses: the Artifact and Grounding are not touched until the new Directive exists. (Bounding: once-per-session — see Rebalance bounding below.)
- **Accept Bounded Closure** — the Directive is not reachable as stated; what was learned along the way is the Artifact, and the session ends acknowledging that. Emits `bounded_closure_proposed` event. Marks the session for closure with `Status: Bounded Closure: <reason>` in the history file. Forecloses: no further execution pass, no decision filed, no re-shape in this session. Terminal — see Rebalance bounding below.

  **It is the one move a mechanism can still force**, and only through the *Revise Directive* cap below. The three bounds that used to force it from a Turn count are gone (`## What the cut took out of this file`); nothing counts, so nothing else here reaches this option except the user choosing it.
- **Keep it** — the Directive stands; what drifted is on the path to it. Forecloses: no re-shape and no closure at this gate. Opens Gate 2 immediately; no event of its own.

**Gate 2 — reached only on Keep it: what to revise?** Two options, always both:

- **Revise Artifact** — the Artifact is not where it should be; the next move is another execution pass. The orchestrator names the next task itself from the reconciler's three-edge summary, or dispatches `taskplanner` with that summary as the drift context when it wants the open records ordered. Either way it re-enters the dispatch loop at `agents/orchestrator.md` `### Step 1 — read the task` with one task, not a queue. Emits `rebalance_artifact` event. Forecloses: the Grounding is not questioned on this pass. (Bounding: see Rebalance bounding below.)
- **Revise Grounding** — file a new `_o_` decision record, or supersede an existing `_i_` decision (rename `_i_`→`_s_` and create a new `_o_`, per `fusion-workbench-conventions.md`). The basis we built on was wrong; the next move is to record a new question. Emits `rebalance_grounding` event. Forecloses: nothing is dispatched until the decision is filed. (Resume mechanics: see Rebalance bounding below.)

When the reconciler's recommendation names a move, say which gate and which option it maps to when you put Gate 1, and put every option regardless: a recommendation is an input to the question, never a reason to hide a branch (`rules/critical-stance.md` §4).

The gate is reachable from the hand-run reconciliation's verdict and from nowhere else. It had a second trigger — the per-Turn Coherence check, decision `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md` — and that check was removed on 2026-09-10. The surviving procedure below is written against `agents/orchestrator.md`'s dispatch loop; the only Phases and Turns still named in this file are named in the table above, as things that are gone.

#### Rebalance bounding

**Every re-entry opens at Gate 1.** The task a *Revise Artifact* names, the resume after *Revise Grounding*, a re-run reconciliation's verdict and a *Revise Directive* re-entry through the shaping step each reach the gate afresh: a retry that failed again is evidence about the Directive, so Accept Bounded Closure and Revise Directive stay on offer, and Gate 2 is reached from Gate 1's **Keep it** only, on a re-entry as on the first pass. That the user said the Directive stands last time is an input to the question, never a reason to hide the branch (`rules/critical-stance.md` §4).

**One of the four options carries a mechanical cap, and it is the only one.** *Revise Directive* is capped below. *Revise Artifact* and *Revise Grounding* carry none, and *Accept Bounded Closure* is terminal and needs none. The three caps that used to bound *Revise Artifact* all counted Turns and went with the Turn loop (`## What the cut took out of this file`). What bounds a retry now is the user, who is asked after every commit whether to go on; say that plainly rather than calling the retries bounded.

- **Revise Artifact is not counted.** Each choice sends the orchestrator back into its dispatch loop with one named task. The gate reopens whenever the user runs another reconciliation and its verdict is not `coherent`, so a retry that drifted again is visible — but only if a reconciliation is run, and running one is the user's act. **Nothing forces Bounded Closure on repeated retries.** That is a real residual and it is stated rather than described away: a session can revise the Artifact any number of times without any mechanism objecting.

- **Revise Directive is limited to once per session.** Count the choices in your own session context, starting at zero. The first Revise Directive choice re-enters the shaping step, regenerating spec and plan. A second Revise Directive in the same session is rejected; the gate instead forces Bounded Closure with reason `"Directive revised twice without convergence."`. Re-shaping twice in a session means the project, not the Circle, needs to step back. Stating a Directive under `state Directive` is not a revision: it leaves the count at zero, so a later real Revise Directive is still the first.

  **The count is no longer persisted, and that costs something.** It rode `control.directive_revisions_this_session` in the session state file, which is not written any more, so the cap holds for as long as the session's own context does and no further. A session that is interrupted and restarted starts the count at zero and may revise the Directive a second time without the gate objecting. Nothing detects that. It is not repaired here because a new persisted counter is precisely the class of hand-written state the cut removed — a number written at a boundary a session can pass without writing it — and re-adding one to hold a once-per-session cap would trade a measured failure mode for an unmeasured one. Say so if it comes up rather than claiming the cap survives a restart.

  **On the re-entry:** preserve the existing session history file and append a `## Directive revision` section naming the trigger — the reconciliation's verdict and the user's Rebalance choice. The shaper produces a new spec with the prior commits as Grounding context; then the planning step, and back into the dispatch loop.

- **Revise Grounding files a record and nothing else.** The orchestrator notes where it was, then asks the user in chat to choose between:
  (a) **File a new `_o_` decision record** — orchestrator asks the user for the question text and any options/constraints (or for the full decision body if the user prefers to type it directly), then writes the file at `$OUT_DECISION/YYMMDD-HHMM_o_<topic>.md` per the decision-record template in `fusion-workbench-conventions.md`. A record that cites a Circle record names it as `_*_circle.md`, whatever marker it carries today: activation renames the file, and an exact marker dangles at that moment; OR
  (b) **Supersede an existing `_i_` decision** — orchestrator presents the `*_i_*.md` files across **every** path in `$SCAN_DECISIONS` and asks which one. On selection, renames `_i_` → `_s_` in place (appending `Superseded by: <new-path> — <reason>`) and creates the new `_o_` decision file at `$OUT_DECISION` citing the supersession. The superseded record stays where it is — a decision is cited where it lives, never copied next to the one that replaced it (Origin Rule, `rules/fusion-workbench-conventions.md`).

  After either branch, the orchestrator emits `rebalance_grounding` and resumes where it was. **Where it was is held in the session's own context and written down nowhere** — the `paused_at_task` field that used to hold it lived in the removed state file. There is no re-entry budget: decision-filing is not recursive, so Revise Grounding may be chosen more than once.

  When the user runs a reconciliation again after filing, the verdict may now pass with the new Grounding context. If it still flags `review-needed`, the gate fires again — but the Grounding has changed, so the user has new options.

- **Accept Bounded Closure is terminal.** The orchestrator emits `bounded_closure_proposed`, sets the session history file's `**Status:**` to `Bounded Closure: <reason>`, and goes to `agents/orchestrator.md` `## Closing a Circle` with marker `_b_`. The reconciler has already run for the verdict that triggered this gate; do **not** re-run it. Skip any further execution.


## Re-sharpening an anticipated Circle (shaper portfolio-activation)

An anticipated (`_a_`) Circle's Directive and Grounding snapshot go stale while it waits — its
measurements get falsified, its capabilities get carried out elsewhere. When one has to be
re-sharpened before it is activated, that work is the shaper's **portfolio-activation** mode
(`agents/shaper.md` mode 3), which is the only sanctioned writer of **Directive prose** in a Circle
record, and the only writer at all of its `## Grounding snapshot`. You are not that writer and you
do not become one here: the one thing you may put into `## Directive` is the fixed pointer literal,
and only riding a field write (**Circle head fields** above). **You may dispatch that mode, under
the one condition below and under no other**
(decision `260813-0027_*_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`).

**The mode also covers a Circle that is already running.** `**Circle file:**` may name an
`_a_circle.md` or a `_t_circle.md`. An active Circle whose Directive is wrong was the case no writer
covered at all, which is the defect this widening closes. A **terminal** record — `_c_`, `_b_`, `_s_`
or `_d_` — is refused: the shaper halts on one, and you do not dispatch against one, because a
terminal record is history. The heading still says "anticipated" because the mode's wire name does
(decision `260818-1512_*_does-the-shapers-third-mode-keep-the-name-portfolio-activation-once-it-also-corrects-an-active-circles-directive.md`);
this paragraph is what the mode covers.

**The condition: the user's answer at a gate named the mode.** You ask, they choose it, you
dispatch. Noticing that a Grounding snapshot cites falsified measurements is a reason to *ask*,
never a reason to dispatch.

**The distinguishing rule — "the user chose this" against "you decided to".** One test, and it
is about evidence rather than intent: **can you quote the user's own words choosing it?** If the
answer to a question you put to them names re-sharpening, you have it, and the dispatch is
theirs. If what you have is a stale Grounding, a playmaker recommendation, a reconciler verdict,
or your own reading that the Directive no longer fits, you do not have it — those are inputs to
the question you ask, never substitutes for the answer to it. An inferred choice is your decision
wearing the user's name, and the prohibition this permission narrows was written against exactly
that.

**What the dispatch prompt carries** — four parameter lines, in this order, ahead of any other
content:

```
**Mode:** portfolio-activation
**Circle file:** circles/<dir>/_a_circle.md
**Scope:** directive-only | spec
**Initiated by:** <the question you asked, the option the user chose, and the date>
```

The first two are the shaper's own detection contract; the third names which of the two occasions
this is; the fourth is the audit trail this permission rests on, and the shaper **halts**
without it on any mode-3 run, dispatched or top-level. Pass it always; there is no case in which
your dispatch is the exempt one.

**`**Scope:**` is a fork you can settle and the shaper cannot.** `directive-only` refines the
Directive and writes the refined prose into the record — no spec, and `**Active spec/plan:**` left
where it stands; the shaper halts if that field already cites a file, because a Circle with a spec
states its Directive there and prose beside it would be a second copy. `spec` is the full
re-shaping: a new spec, the field set to it, and the pointer literal replacing the prose. **Absent,
the line reads as `spec`**, so every dispatch written before this parameter existed still means what
it meant. Pass the value the user's own answer names, and derive it from nothing else — not from the
record, not from the drift you noticed, not from how they phrased it. Which kind of edit this is is
a question about their intent, and reading intent out of prose is the classifier this repository
deleted rather than patched. Quote the user rather than
paraphrasing their choice into your framing: the line's whole job is to answer "who started this
run?" for somebody reading later. Emit `shaper_start` before the dispatch and `shaper_done` after
it, both naming the mode and the Circle directory, and record the same gate answer in your
session history. The dispatch prompt persists nowhere; the event log and the history file are
what outlive the session, so a permission that lives only in the prompt leaves no trace at all.

**You relay the clarification rounds.** A dispatched shaper cannot put a question to the user at
all (`agents/shaper.md` `## Tool Discipline`), so it returns a batch of questions with options and
stops. Put each batch to the user yourself, in their own terms, and re-dispatch with the answers.
**Every re-dispatch repeats all three parameter lines** — sub-agents share no memory, so a
re-dispatch that drops `**Mode:**` falls back to the shaper's mode-detection heuristic and hands
you a fresh spec where you asked for a record edit. Expect more than one round: the measured run
behind this permission took two.

**What stays yours, and what you do not touch.** The shaper edits those two record sections and,
under `**Scope:** spec`, writes a spec inside that Circle and sets the field itself; you edit none of
it, then or afterwards. The `_a_`→`_t_` rename and
the `.active-circle` write are yours and never the shaper's (decision
`260806-0015_*_wem-gehoert-die-circle-aktivierung.md`, and **Circle head fields** above).
**Re-sharpening is not activation**: when the shaper returns, ask whether to activate now, and
activate only on that answer, under the table in **Circle head fields**. Its `**Active spec/plan:**`
row will find the field already citing the spec the shaper just wrote — that is the "does not
already cite it" test failing, so you leave the field as it stands.


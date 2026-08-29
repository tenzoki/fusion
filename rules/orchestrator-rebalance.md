# Orchestrator — rare-flow procedures

**Provenance:** Partitioned out of `agents/orchestrator.md` per decision `260827-1210_*_do-the-rare-orchestrator-flows-stay-in-every-sessions-context.md`; the sections' own history is that file's.

Read on the trigger the orchestrator's stub names, never speculatively. Each section below is the authoritative text the stub points at, verbatim from the prompt it left.

### Rebalance Gate

When a Coherence-related condition triggers (the two Coherence rows of the gate-rules table above — per-Turn drift finding, decision `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md`; per-Circle verdict other than `coherent`, or `coherent` with recommendation `state Directive`), the gate replaces the standard Proceed/Skip/Defer/Modify with **two gates in sequence**, each inside the three-option cap of `rules/user-facing-output.md` `## Questions and gates` (decision `260827-1756_*_how-does-the-rebalance-gate-present-four-moves-under-a-three-option-cap.md`, option 2). The four moves of the Coherence model — its three edges and its termination — are all reachable, and every option carries its foreclosure line. The split follows the model's own order: destination first, then the path to it.

**Gate 1 — does the Directive stand?** Three options, always all three:

- **Revise Directive** — re-shape: dispatch `shaper` with the current spec + the drift evidence. The destination we set was wrong; the next move is to re-state what we want. Under `state Directive` there is no spec and nothing to drift from: this is the option that states one, and `shaper` is dispatched in user-direct mode with the session's evidence. Emits `rebalance_directive` event. Re-enters Step 0b.1 (Shape). The record stops contradicting its spec without anything being added here: the re-entry runs Step 0b.2, and the field write there carries the pointer literal (**Circle head fields**). **No new mechanism sits at this bullet.** Forecloses: the Artifact and Grounding are not touched until the new Directive exists. (Bounding: once-per-session — see Rebalance bounding below.)
- **Accept Bounded Closure** — the Directive is not reachable as stated; what was learned along the way is the Artifact, and the session ends acknowledging that. Emits `bounded_closure_proposed` event. Marks the session for closure with `Status: Bounded Closure: <reason>` in the history file. Forecloses: no further execution pass, no decision filed, no re-shape in this session. Terminal — see Rebalance bounding below.
- **Keep it** — the Directive stands; what drifted is on the path to it. Forecloses: no re-shape and no closure at this gate. Opens Gate 2 immediately; no event of its own.

**Gate 2 — reached only on Keep it: what to revise?** Two options, always both:

- **Revise Artifact** — the Artifact is not where it should be; the next move is another execution pass. The orchestrator dispatches `taskplanner` with the Coherence-gate's three-edge summary (or the reconciler's verdict at Phase 3) as the drift context, so taskplanner can return a refreshed queue with a new entry that addresses the drift. Re-enters Phase 2 with the rebuilt queue. Emits `rebalance_artifact` event. Forecloses: the Grounding is not questioned on this pass. (Bounding: see Rebalance bounding below.)
- **Revise Grounding** — file a new `_o_` decision record, or supersede an existing `_i_` decision (rename `_i_`→`_s_` and create a new `_o_`, per `fusion-workbench-conventions.md`). The basis we built on was wrong; the next move is to record a new question. Emits `rebalance_grounding` event. Forecloses: no new Turn and no queue rebuild until the decision is filed. (Resume mechanics: see Rebalance bounding below.)

When the reconciler's recommendation names a move, say which gate and which option it maps to when you put Gate 1, and put every option regardless: a recommendation is an input to the question, never a reason to hide a branch (`rules/critical-stance.md` §4).

The Rebalance gate is reachable from Phase 2 step 3c-bis (per-Turn drift finding, decision `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md`) and from Phase 3 (per-Circle reconciler verdict).

#### Rebalance bounding

Each option has bounded post-action mechanics, and no option is allowed to loop unboundedly, with one exception that is stated here rather than described away. **Every re-entry opens at Gate 1.** The Phase-2 Turn a *Revise Artifact* creates, the `paused_at_task` resume after *Revise Grounding*, the re-run reconciler verdict at Phase 3 and a *Revise Directive* re-entry through Step 0b.1 each reach the gate afresh: a retry that failed again is evidence about the Directive, so Accept Bounded Closure and Revise Directive stay on offer, and Gate 2 is reached from Gate 1's **Keep it** only, on a re-entry as on the first pass. That the user said the Directive stands last time is an input to the question, never a reason to hide the branch (`rules/critical-stance.md` §4). In a session whose Turn budget came back unresolved, the answer **Continue without check-ins** at the Unresolved-budget check-in removes the only bound *Revise Artifact* re-entries have left. From that answer on, both claims in the first sentence of this paragraph are false for that session, and the session states the residual in its history and its final summary instead of repeating them.

- **Revise Artifact re-entries count against the existing Max-Turns circuit breaker.** Each Revise Artifact choice creates a new Turn — the orchestrator increments the Turn counter and re-enters Phase 2 with the new queue entry. When the Turn count reaches `<max-turns>` — the budget resolved at Setup Step 2 and held for the session, never persisted — the next per-Turn or per-Circle gate forces Bounded Closure with reason `"Turn limit reached after Rebalance retries."`. A session whose budget came back unresolved has no count to reach, so this bound does not apply to it. Each Revise Artifact choice still creates a Turn, and every Turn in such a session **begins** with the **Unresolved-budget check-in** (Phase 2 step 1): the re-entry from Step 3c-bis runs the Turn-start sequence like any other Turn, so a retry meets the gate on its way in rather than at an end-of-Turn position it never reaches. That is what bounds the retries, and it is where the user ends them, until the user answers **Continue without check-ins**, after which nothing does.

  **At Phase 3 (post-verdict dispatch):** Re-enter Phase 2 with a fresh Turn (Turn counter increments; treated as a new Turn even though the previous Phase-2 loop exited). The orchestrator dispatches `taskplanner` to refresh the queue based on what the reconciler's verdict flagged. If the Turn count has already reached `<max-turns>`, Phase 2 is bypassed and the gate forces Bounded Closure with reason `"max-Turns exceeded; Rebalance from Phase 3 cannot create a new Turn."`. When the budget is unresolved there is no counter to compare against and this bypass never fires; the fresh Turn begins with the **Unresolved-budget check-in** instead, being a Turn like any other, and that is where the user declines it. Not so after **Continue without check-ins**: from then on this re-entry has no bound.

- **Revise Directive is limited to once per session.** The orchestrator increments the persisted counter `control.directive_revisions_this_session` in `agentstate.yaml` (initialised to 0 at session start; persisted so the cap holds across session interruption). The first Revise Directive choice re-enters Step 0b.1 (shaper), regenerating spec + plan + queue. A second Revise Directive in the same session is rejected; the gate instead forces Bounded Closure with reason `"Directive revised twice without convergence."`. Re-shaping twice in a session means the project, not the Circle, needs to step back. Stating a Directive under `state Directive` is not a revision: it leaves the counter at 0, so a later real Revise Directive is still the first.

  **At Phase 3 (post-verdict dispatch):** Re-enter Step 0b.1 (shaper). The orchestrator preserves the existing session history file but appends a new `## Directive revision (post-Phase-3)` section noting the trigger (the reconciler verdict and the user's Rebalance choice). The shaper produces a new spec with the prior commits as Grounding context. Then Step 0b.2 (planner) and Phase 1 (queue rebuild) and Phase 2 (fresh Turn). `control.directive_revisions_this_session` increments and is persisted before re-entering Step 0b.1; if already at 1, Bounded Closure is forced.

- **Revise Grounding does not increment the Turn counter** (decision-filing is not Artifact work). The orchestrator pauses Phase 2 at the current queue position (records `paused_at_task: <task ID>` in `agentstate.yaml`), then asks the user in chat to choose between:
  (a) **File a new `_o_` decision record** — orchestrator asks the user for the question text and any options/constraints (or for the full decision body if the user prefers to type it directly), then writes the file at `$OUT_DECISION/YYMMDD-HHMM_o_<topic>.md` per the decision-record template in `fusion-workbench-conventions.md`. A record that cites a Circle record names it as `_*_circle.md`, whatever marker it carries today: activation renames the file, and an exact marker dangles at that moment; OR
  (b) **Supersede an existing `_i_` decision** — orchestrator presents the `*_i_*.md` files across **every** path in `$SCAN_DECISIONS` and asks which one. On selection, renames `_i_` → `_s_` in place (appending `Superseded by: <new-path> — <reason>`) and creates the new `_o_` decision file at `$OUT_DECISION` citing the supersession. The superseded record stays where it is — a decision is cited where it lives, never copied next to the one that replaced it (Origin Rule, `rules/fusion-workbench-conventions.md`).

  After either branch, the orchestrator emits `rebalance_grounding` and **resumes Phase 2 at the recorded `paused_at_task`** without incrementing the Turn counter. There is no re-entry budget: decision-filing is not recursive, so Revise Grounding may be chosen more than once.

  **At Phase 3 (post-verdict dispatch):** Same decision-filing sub-flow as the Phase-2 case (file new `_o_` OR supersede existing `_i_`), but **without** the `paused_at_task` mechanism — there is no current task at Phase 3. After the user files the decision, the orchestrator emits `rebalance_grounding` and re-runs the Phase-3 reconciler verdict (which may now pass with the new Grounding context). If the verdict still flags `review-needed`, the Rebalance gate fires again — but the Grounding has changed, so the user has new options.

- **Accept Bounded Closure is terminal.** The orchestrator emits `bounded_closure_proposed`, sets the session history file's `**Status:**` to `Bounded Closure: <reason>`, runs the reconciler one final time for the closure record (the reconciler's three-edge verdict captures what was learned — that's the Bounded Closure Artifact), then exits to Phase 4 cleanup. Skip any further Phase 2 work.

  **At Phase 3 (post-verdict dispatch):** Same as the Phase-2 case (terminal). The reconciler has already run for the verdict that triggered this Rebalance gate; do **not** re-run it. Set Status, emit `bounded_closure_proposed`, exit to Phase 4.


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


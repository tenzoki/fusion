Phase 0b.1 still tells the orchestrator not to intercept a shaper dialogue the same file now mandates it relays

---
`agents/orchestrator.md:422`, Phase 0b.1 step 3, reads: "The shaper will involve the user in
decisions via `AskUserQuestion`. **Do not intercept or shortcut these interactions** — the shaper's
user involvement is the whole point." `agents/orchestrator.md:350`, in the section added by
`bf9553f`, reads: "A dispatched shaper does not receive `AskUserQuestion` … Put each batch to the
user yourself." `agents/shaper.md:121` names the Phase 0b.1 dispatch first in its list of dispatched,
non-interactive shapes. One file now carries both protocols for two dispatches of the same agent.

---
**The three passages, at HEAD `d5b71f1`.**

- `agents/orchestrator.md:422` (Phase 0b.1 step 3, unchanged by this range): the shaper asks, the
  orchestrator stands back.
- `agents/orchestrator.md:350` (new): the shaper cannot ask, the orchestrator relays each batch and
  re-dispatches with the answers.
- `agents/shaper.md:121`: "**Dispatched as a sub-agent** (the orchestrator's Phase 0b.1
  shape-and-plan dispatch, a mid-Turn in-Circle clarification dispatch, or a portfolio-activation
  dispatch …). You run non-interactively: **you do not receive `AskUserQuestion`.**"

So the shaper's own prompt classifies the Phase 0b.1 dispatch as the non-interactive kind, and the
orchestrator's Phase 0b.1 step tells the orchestrator to expect the interactive kind. Whichever of
the two an orchestrator reads first decides whether the shaping round completes or returns a report
full of unanswered questions.

**What is new and what is not.** The Phase 0b.1 sentence is pre-existing; `bf9553f` did not touch it.
What changed is that the correct protocol is now written into the same file, thirty lines above the
`## Plane mirror` heading and seventy above the phase that contradicts it. A contradiction between
two documents is a lookup problem; a contradiction inside one prompt is read as two rules for two
situations, and a reader will invent the distinction rather than notice the fault.

**Relation to the open record on the same class.**
`shared/issues/260813-1334_o_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`
files the same defect at two other sites — `skills/direct/SKILL.md` Step 4, and the shaper's
`## Tool Discipline` enumeration not naming `/fusion:direct`. It does **not** name
`agents/orchestrator.md:422`; on the contrary it cites the orchestrator's relay as "the working shape
[that] already exists twice in the plugin", which is true of practice and not of that step's text.
This record is the third site.

**One thing `bf9553f` had in its hand and did not take.** The commit edited
`agents/shaper.md:121` — the exact line record `260813-1334` names as the second half of its gap —
to add portfolio-activation to the enumeration, and left `/fusion:direct`'s anticipated-circle
dispatch out of it. The enumeration is now three of four dispatched shapes. That half of
`260813-1334` stays open at a line this range rewrote.

**Candidate fix.** Rewrite `agents/orchestrator.md:422` to the relay protocol and point it at
`## Re-sharpening an anticipated Circle (shaper portfolio-activation)`, which already states the
mechanics once — the batch return, the user relay, the cold-start re-dispatch. Do not write a second
copy of them into the phase step; that is the drift shape this project has measured repeatedly. The
sentence worth keeping from the old text is its intent: the shaper's user involvement is the whole
point, so the orchestrator relays every round rather than answering on the user's behalf.

**Scope.** `agents/orchestrator.md`, one step. Executor: `coder`.

**Filed in `shared/`** per the Origin Rule: the defect predates Circle `260801-1244-curator` and was
caused by no part of its Directive; the Circle's Turn-4 work is what made it visible.

**Filed by:** coderev, review `circles/260801-1244-curator/reviews/260814-1850-coderev-curator-turn-4.md`.

---
Resolved: 9f4cdac. Phase 0b.1 step 3 of `agents/orchestrator.md` now states the relay and points at
`## Re-sharpening an anticipated Circle (shaper portfolio-activation)` for the mechanics, carrying
no second copy of them. The `/fusion:direct` half noted in passing here is untouched and stays with
its own record, `260813-1334_*`.

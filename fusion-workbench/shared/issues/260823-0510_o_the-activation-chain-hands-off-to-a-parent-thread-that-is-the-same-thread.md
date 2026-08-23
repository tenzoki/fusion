The activation chain hands off to a parent thread that is the same thread, so the session it promises never starts

---

**Severity:** Medium. Nothing is corrupted and no state is wrong; the activation completes correctly. What fails is the promise in its last sentence — the session the user is told is beginning does not begin, and the user finds out by asking.
**Domain:** code
**Filed by:** orchestrator, after doing exactly what the step describes and then stopping
**Affects:** `skills/next/SKILL.md` `### 6.5 — Chain into a fresh orchestrator session`; `agents/orchestrator.md` `## MANDATORY — Read This First`
**Cross-references:** `shared/decisions/260822-1635_*_may-the-orchestrator-have-a-directive-captured-and-by-which-route.md` (the same seam, asked from the other side and answered by measurement rather than by assumption)

---

## What happened

Circle `circles/260823-0023-settle-what-travels-between-checkouts/` was activated through
`/fusion:next <dirname>` on 260823. The rename, the pointer and the dashboard placeholder all
landed. The orchestrator then printed Step 6.5's message, which says a fresh session begins and the
orchestrator now runs Setup, and stopped. No Setup ran. `agentstate.yaml` was absent, the session
marker read `none`, and the dashboard still said "Not started". The user's next message was
"what's running?", and the answer was nothing.

## Why

Step 6.5 closes with a claim of two premises, and in this configuration both are false:

> That message is itself the directive. The orchestrator's own prompt instructs it to run Setup at
> the start of work, so emitting this text is sufficient to trigger Setup on the parent thread.

**"the parent session reading this output" assumes two parties.** The step is written as a handoff:
the skill emits, and a separate orchestrator reads. But a skill body invoked in an orchestrator
session *becomes the instruction to that session*. The emitter and the reader are one. Emitting text
to oneself delivers nothing; it ends a turn.

**"instructs it to run Setup at the start of work" misreads the trigger.** Every clause of
`agents/orchestrator.md` `## MANDATORY` keys on a user request: "ONLY after Setup is fully complete
do you act on **the user's request**", "regardless of what **the user** asks". The orchestrator's own
output is not a user request, so nothing in that section fires on it, and re-reading its own text
would change nothing.

**The sharpest part is the ordering.** The step's instruction is to emit user-facing text, and
emitting user-facing text is what ends a turn. The continuation is scheduled after the stop.

## What does not excuse it

`agents/orchestrator.md:11` says the Setup steps "are inlined below for **self-initiated runs**", so
a self-initiated Setup is a case the prompt anticipates. Nothing defines what initiates one. The
orchestrator had the latitude to run Setup and instead printed a sentence describing a future act by
a third party. The mechanism produced the wrong behaviour and the agent did not notice; both are
true and neither is the whole cause.

## The neighbouring surface gets this right

`skills/direct/SKILL.md` Step 5 ends with a hint addressed to the user — *"Next: `/fusion:next`
shows this Circle in the portfolio…"* — which is honest about who acts next. `/fusion:next` is the
one that describes a handoff it cannot perform.

## What to consider

Not costed here.

1. **Say it to the user instead of to a thread.** Step 6.5 becomes a hint in `/fusion:direct`'s
   shape: the Circle is active, say the word and the session starts. Cheapest, honest, and it costs
   the user one message.
2. **Make the orchestrator's self-initiated trigger explicit.** `agents/orchestrator.md` names the
   conditions under which it starts Setup without a user request — an activation it just performed
   being one. Removes the extra message, and widens a section whose whole strength is that it fires
   on everything without exception.
3. **Have the skill run Setup itself**, as its own last step, since it is already running inside the
   session that would. Removes the seam entirely, and puts a copy of the Setup contract in a second
   place, which is the duplication this project has repeatedly paid for.

The three differ in who is assumed to notice that a session has not started, which is the question
under all of them. Today the answer is the user, by asking.

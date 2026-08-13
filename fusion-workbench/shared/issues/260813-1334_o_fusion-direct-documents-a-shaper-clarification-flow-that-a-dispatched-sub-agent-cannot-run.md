# /fusion:direct documents a shaper clarification flow that a dispatched sub-agent cannot run

---
**Domain:** code
**Status:** open
**Filed by:** planner (found while planning `circles/260813-0858-playmaker-maintains-backlog-store/`)
**Cross-references:** `skills/direct/SKILL.md:81`-`:93`; `agents/shaper.md:118`-`:119`; `circles/260813-0858-playmaker-maintains-backlog-store/planning/260813-1306_*_the-playmaker-maintains-the-backlog-store.md`
---

## What is wrong

`skills/direct/SKILL.md` Step 4 tells the reader that after dispatch the shaper will "run its
normal 1-4-questions-per-round clarification flow with the user via `AskUserQuestion`", and Step 4
closes with "wait for shaper to complete. The clarification flow may take several rounds — that's
the whole point of using shaper instead of stashing the draft verbatim."

A shaper dispatched by that skill is a sub-agent, and `agents/shaper.md:119` states plainly that a
dispatched shaper does not receive `AskUserQuestion` and must return its batched questions to the
dispatcher instead. The two documents describe different behaviour for the same dispatch.

**Two levels of evidence, and they are not the same level.** The contradiction between the two
documents is *verified*: both passages were read at the lines cited above, and they state different
behaviour for one dispatch.

The behaviour itself is *reported*, not verified here. The orchestrator that commissioned this
record states that it dispatched `fusion:shaper` as a sub-agent twice in the current session, that
both runs returned their clarification questions as report text rather than asking them, that the
second run said outright it had no way to put a question to the user, and that the orchestrator then
relayed the questions through `AskUserQuestion` and passed the answers back on a second dispatch.
Nothing on disk carries that observation: `shared/history/260813-0806-orchestrator-session.md`
mentions the shaper once, about an unrelated point, and no history file under `shared/history/` or
any Circle records a shaper run returning questions. Whoever fixes this should either reproduce the
dispatch or take the documentation contradiction alone as sufficient, since the fix is the same
either way.

## Why it matters

`/fusion:direct` has no relay step. Its body dispatches the shaper once, expects an interactive
dialogue that cannot happen, and then reads the shaper's return as a finished Circle. What a user
gets instead is a report full of unanswered questions, or a Circle whose Directive the shaper
guessed at. The clarification flow is the stated reason to use the skill at all.

The second half of the same gap is in the shaper's own prompt. `agents/shaper.md:119` enumerates the
dispatchers whose relay it may rely on — the orchestrator's shape-and-plan dispatch and its
mid-Turn in-Circle clarification dispatch — and anticipated-circle mode, the mode `/fusion:direct`
uses, is dispatched by a skill that appears nowhere in that enumeration. So neither surface says
what a shaper dispatched by `/fusion:direct` does with a question.

## What a fix looks like

The working shape already exists twice in the plugin: the orchestrator relays the shaper's returned
questions through `AskUserQuestion` and re-dispatches with the answers, and
`circles/260813-0858-playmaker-maintains-backlog-store/planning/260813-1306_*_the-playmaker-maintains-the-backlog-store.md`
step 4 plans the same shape for `/fusion:next` and the playmaker. A fix here gives
`skills/direct/SKILL.md` a relay step between its dispatch and its confirmation step, and names the
skill in the shaper's `## Tool Discipline` enumeration so the agent knows a relay exists.

Not planned here, and deliberately not folded into the backlog Circle: that Circle's Directive is
the playmaker's backlog maintenance, and this is a different skill and a different agent found
nearby.

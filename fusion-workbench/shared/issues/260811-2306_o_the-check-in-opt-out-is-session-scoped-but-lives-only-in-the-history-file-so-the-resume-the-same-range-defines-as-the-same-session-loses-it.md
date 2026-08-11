# The check-in opt-out is session-scoped but lives only in the history file, so the resume the same range defines as the same session loses it

---

**Severity:** Low — the loss direction is safe (the gate returns), but two commits in one range disagree about what a session's state is
**Domain:** code
**Filed by:** coderev (review of `e3da397..a6b4928`, Turn 5)
**Affects:** `agents/orchestrator.md:629` (`500f51f`), `agents/orchestrator.md:100` (`e61e24a`)

---

## What is wrong

Two commits in the same range take opposite positions on where a session-scoped fact lives.

`500f51f`, `agents/orchestrator.md:629`:

> **Continue without check-ins** — the user accepts a Phase-2 loop with no count-based exit **for the rest of the session**. Stop asking. **Record the acceptance in the session history** and repeat it in the final summary.

`e61e24a`, `agents/orchestrator.md:100`:

> **What a resumed session inherits.** On **Continue** this is the *same session*, and every field that says so stays as it is: `session.history_file`, `session.git_head_at_start`, `session.started` and `progress.turn` are read, not rewritten.

`agentstate.yaml` is the surface that carries a session across an interruption; the session history file is prose the resuming orchestrator is not instructed to parse for state. So a session that opts out of the check-in, is interrupted, and resumes has — by `e61e24a`'s own definition — not ended, and yet the acceptance is gone and the gate starts firing again.

## Severity, honestly

The failure direction is the safe one: the gate returns, the user is asked once more and can opt out again. Nothing runs unbounded that would not otherwise have. What is wrong is smaller and still worth closing:

- `:629` says "for the rest of the session" and that is not what happens.
- The range establishes a rule about session-scoped state (`:100` enumerates the fields that survive) and then adds a session-scoped fact outside it, in the same three commits. The next such fact will be placed by whichever of the two precedents the author happens to read.

Both halves of the pair are also visible in `/fusion:circle-stash` and `/fusion:circle-pop`, which freeze and restore `agentstate.yaml`: a stashed-and-popped Circle loses the acceptance for the same reason.

## Fix direction

Carry the acceptance in `agentstate.yaml` under `progress.`, the way `directive_revisions_this_session` already persists a once-per-session cap across interruption (`agents/orchestrator.md:978`), and add it to the inherited-fields list at `:100`. The key must be a boolean and not a count, so it does not collide with the `progress.max_turns`-stays-omitted rule at `:129`.

If the choice is instead to let a resume re-ask, say so at `:629` — "the acceptance does not survive an interruption; a resumed session asks once more" — which is a fine answer and a different one from silence.

## Acceptance criteria

- The opt-out either persists across a resume or `agents/orchestrator.md` says that it does not.
- Whichever is chosen, `:100`'s inherited-fields list and `:629` agree.

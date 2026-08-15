The resume shell that replaced the drift check prints "0 unavailable" on one path and an empty figure on another

---

Step P-11 replaced `bin/fusion-state-drift` at both resume paths with a four-line shell block that
derives the commit and Turn counts from git and the event log. The block is byte-identical in
`agents/orchestrator.md:88-92` and `skills/setup/SKILL.md:248-251`. Two of its cases produce a value
the sentence directly beneath it forbids.

---

## Context

Both copies end with the same rule (`agents/orchestrator.md:94`, `skills/setup/SKILL.md:253`):

> A figure that could not be taken is reported as `unavailable`, never as `0`.

**Case A — the event log exists and carries no `turn_start` yet.** `grep -c` prints `0` to stdout
*and* exits 1 when it matches nothing, so the `|| echo unavailable` fires as well and the command
substitution captures both. Measured in a scratch repository:

```
$ echo "turns=$(grep -c '"event":"turn_start"' fusion-workbench/orchestrator-events.jsonl 2>/dev/null || echo unavailable)"
turns=0
unavailable
```

That is the state of every session interrupted between `session_start` and the first `turn_start` —
Phase 0 and Phase 1, which is where a plan-mode session spends its first gate. The reader is handed
a figure that is simultaneously the forbidden `0` and the fallback word.

**Case B — the anchor is present but does not resolve.** `[ -n "$A" ]` tests only that the field was
*read*, not that the hash is still in the repository. A rebased, amended or garbage-collected anchor
makes `git rev-list` fail; it prints nothing, the `echo` around it still exits 0, so the `||` arm
never runs:

```
$ A=deadbeef
$ [ -n "$A" ] && echo "commits=$(git rev-list --count "$A"..HEAD 2>/dev/null)" || echo "commits=unavailable"
commits=
```

An empty value is neither the number nor `unavailable`. `bin/fusion-state-drift` distinguished this
case explicitly, reporting `UNCHECKED (<reason>)` per row; the replacement lost that distinction
without saying so.

**Why this matters more than an ordinary shell bug.** P-11's stated justification for deleting the
drift machinery is that the true figure was always derivable and only the hand-written copy was
optional. The derivation that replaced it is wrong in two of its own edge cases, and it is the input
to a *Continue / Restart* decision the user makes about a session's state.

**Cross-cutting.** The block exists twice, in two files, with no shared owner. That is the
duplication class decision `260810-2145` created `bin/fusion-source-root` to end after a correction
to one of four copies reached two and left two standing. A fix applied to one copy here will drift
from the other in exactly the same way.

## Suggested direction

One helper both prompts call, or — if a helper is judged too heavy for four lines — a shell form
that tests the *outcome* rather than the input on both figures, e.g. capturing into a variable and
branching on emptiness. Whichever is chosen, the two spellings must not remain independent.

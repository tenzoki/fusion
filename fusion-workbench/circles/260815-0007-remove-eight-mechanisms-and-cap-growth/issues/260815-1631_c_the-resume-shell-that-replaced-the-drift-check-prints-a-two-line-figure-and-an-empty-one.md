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

---
Resolved: Both figures now branch on their own **outcome** rather than on an input test or an exit
code, in both copies (`agents/orchestrator.md:88-93`, `skills/setup/SKILL.md:248-252`). Each is
captured into a variable — `C=$([ -n "$A" ] && git rev-list --count "$A"..HEAD 2>/dev/null)`,
`T=$(grep -c '"event":"turn_start"' … 2>/dev/null)` — and reported as `${C:-unavailable}` /
`${T:-unavailable}`. The `[ -n "$A" ]` guard is kept inside the substitution, not as the report's
condition: without it an empty anchor makes the range `..HEAD`, which git reads as `HEAD..HEAD` and
counts as a legitimate `0`, the exact value the rule below the block forbids. The prose under the
block now names the two mechanisms (`git rev-list` prints nothing, `grep -c` prints `0` and exits
non-zero) and states that `turns=0` is a real figure for a session that stopped before its first
Turn, so the case is not "corrected" back later.

Verified in a scratch git repository (three commits, a synthetic `agentstate.yaml` and event log),
both copies, under zsh 5.9 and bash 3.2, five cases each: ordinary → `commits=2 turns=1`; log
present with no `turn_start` → `turns=0` alone, no second line; log absent → `turns=unavailable`;
anchor present but unresolvable (`deadbeef`) → `commits=unavailable`; no anchor field and no state
file → `commits=unavailable`. Anchor equal to HEAD gives `commits=0`, which is a taken figure and
correct. The old form was run against the same inputs and reproduced both reported faults
(`commits=` empty, and `turns=0` followed by `unavailable`).

Not closed by this fix: the block is still two independent spellings in two files with no shared
owner, which is the record's Cross-cutting paragraph. The two were made identical in logic here,
which is what the dispatch asked for, but nothing holds them identical. Filed separately as
`260815-1712_*_the-resume-shell-is-two-independent-copies-and-nothing-holds-them-identical.md`.

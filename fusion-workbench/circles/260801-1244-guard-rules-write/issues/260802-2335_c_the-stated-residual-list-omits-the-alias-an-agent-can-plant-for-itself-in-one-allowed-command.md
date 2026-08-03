# The stated residual list omits the alias an agent can plant for itself, in one allowed command, with no flag

---

**Severity:** Medium
**Domain:** code
**Filed by:** coderev, reviewing Turn 2 of `circles/260801-1244-guard-rules-write` (`bf75941..HEAD`)
**Affects:** the protected-path check on both surfaces, and the honesty of a shipped boundary
statement
**Cross-references:** `rules/protected-path-discipline.md` "Where this check does not reach"
(the "Known and accepted" list), `hooks/lib/rules-write-exemption.ts:69-90`,
`hooks/lib/paths.ts:71-75`, `hooks/lib/bash-mutation-guard.ts` (`MUTATION_VERBS`, the `ln`
and `cp` rows)

---

## What was found

The implementer records as a residual that "a symlink *into* a protected directory still
escapes protection". That is accurate as far as it goes and it understates the case in the
way that matters: the symlink does not have to be there already. An agent can create it
itself, in one command the guard allows, with **no flag set**, and then write the protected
file through it.

## Evidence — measured

Real guard subprocess, throwaway project, shipped protected list, **no
`FUSION_ALLOW_RULES_WRITE`, no branch override, nothing**:

```
  ln -s ../agents/coder.md build/alias                 allow
  cp -l agents/coder.md build/hardalias                allow

  Edit build/alias                                     allow
  echo pwned > build/alias                             allow
  -> agents/coder.md now reads: "pwned\n"

  echo pwned > build/hardalias                         allow
  -> agents/coder.md now reads: "pwned"
```

Two commands. Both spellings work — a symlink and a hard link — and the second needs no
symlink support at all. The alias sits at an unprotected path, so pass 1 finds nothing, pass 2
finds no ancestor, and pass 3 has nothing to fail closed on. The source operand of `ln` and
`cp` is a **read**, and the classifier only inspects written operands, correctly.

## Why the existing residual statement does not cover it

`rules/protected-path-discipline.md` has a "Known and accepted" list, and it is a good one —
it names operands arriving on stdin (`xargs`), and unrecognised programs that write a
protected path (`curl -o`, `python3 -c`, `eval`, `bash -c`). Both of those residuals share a
shape: **the guard cannot see the write**. The reader takes away that the boundary holds
wherever the classifier can read the command.

This case has the opposite shape. The guard sees both commands in full, understands both
verbs, resolves both operands, and allows them because neither *names* a protected path. The
protection side is textual by design — `paths.ts:71-75` says so — and the consequence of that
design is that any agent with a shell can manufacture a non-protected name for a protected
file whenever it wants one. That is a different and larger admission than the two on the list,
and it is the one not made.

`rules-write-exemption.ts:53-56` gets the distinction exactly right for the grant side:

> Everywhere else in the guard a symlink lets a write ESCAPE protection: a residual of a text
> classifier, and one the protected-path check still carries. Here a symlink let a write
> ACQUIRE A GRANT, which is an escalation.

The escalation half was closed (in one spelling — see `260802-2330`). The escape half is
stated here, in a module docstring, and does not appear in the file every agent actually
reads.

## Severity, honestly

Medium. Nothing here is new — it is the protection side's known textual nature, and closing it
means resolving every guarded path through the filesystem, which is candidate direction 3 of
the open case-folding issue `260802-2320` and carries the same cost and the same
platform-dependence. I am not proposing that here.

What is a defect is that a document whose stated purpose is to stop an agent working around
the guard lists the residuals it considers acceptable, and the cheapest, most reachable one is
not on the list. An agent that reads the list and then discovers this route on its own has
been taught that the list is not the boundary.

## Candidate directions, not decided here

1. **Add the row.** One entry in "Known and accepted": creating an alias to a protected file
   at an unprotected path is allowed, writing through the alias is allowed, and an agent that
   notices this must treat it as the same denial it would have got directly — the guard raises
   the cost of a deliberate act, and routing around a deny is the act the rule forbids
   regardless of mechanism. Cheap, honest, and consistent with how the other two residuals are
   handled.
2. **Deny `ln`/`cp -l`/`ln -s` when the SOURCE operand is protected.** Narrow, cheap, and it
   closes the deliberate plant while leaving a pre-existing alias open. It also introduces the
   first case where the classifier inspects a read operand, which is a design change and wants
   a decision record.
3. **Resolve every guarded path through the filesystem.** Complete, expensive, and already
   under discussion at `260802-2320`. Do not decide it here.

Direction 1 is the one this issue asks for. Direction 2 is worth considering with the
`exemptible: false` reasoning already in `bash-mutation-guard.ts:247-271`, which made exactly
this argument about `ln` for the grant side.

## Origin

Found in `circles/260801-1244-guard-rules-write` while checking the accuracy of the four
residuals the implementer reported. Three of the four are accurate as stated; this one
understates and `260802-2330` falsifies the fourth.

---

**Resolved:** Turn 3, task T3-7 (coder). Direction 1 taken; direction 2 filed as a
decision; direction 3 left where it is.

- `rules/protected-path-discipline.md` "Known and accepted" now carries the row, placed
  third so it sits directly against the two residuals it contrasts with, and opening
  "Unlike the two above, the guard sees the whole command and resolves every operand."
  It states the measured commands, that writing through the alias is allowed on both
  surfaces, that protection is textual by design, what closing it would cost, and that an
  agent noticing the route must treat it as the same denial it would have got directly.
- The section intro above the list gained one sentence naming the two SHAPES a gap can
  have, because every previous entry shared the "cannot see the write" shape and the list
  read as though that were the boundary.
- `README-hooks.md` residual paragraph gained the same admission, first, so the two
  documents do not disagree about what is known and accepted.
- Also corrected, wrong for a reason this issue did not name: the rule file said "copying
  *out of* a protected directory is never the problem", which the `cp -l` half of this
  finding falsifies. It now separates copying a protected file's CONTENTS out (fine) from
  giving it a second NAME (the residual), and points at the list.

Re-measured at HEAD before writing, rather than trusting the Turn 2 numbers: real guard
subprocess, throwaway consuming project, shipped `hooks/config.json`, `FUSION_ALLOW_*`
explicitly unset via `env -u`. `ln -s ../agents/coder.md build/alias` allow, `cp -l
agents/coder.md build/hardalias` allow, `echo pwned > build/alias` allow, `echo pwned2 >
build/hardalias` allow, `Edit build/alias` allow; controls `rm agents/coder.md` and
`echo x > agents/coder.md` both DENY. The links were then created for real and written
through: `agents/coder.md` read `pwned`, then `pwned2`.

**Direction 2** (deny `ln` / `cp -l` on a protected SOURCE) not implemented, per this
issue's own instruction. Filed as
`decisions/260803-1402_o_should-the-mutation-classifier-inspect-a-read-operand-to-close-the-planted-alias.md`,
with the measured table, the three options, and a low-confidence recommendation for
option 1. It has to be decided rather than dropped, because the row that just shipped
calls the residual accepted and that row is wrong the day a deny lands.

**Direction 3** left with `shared/issues/260802-2320`, untouched.

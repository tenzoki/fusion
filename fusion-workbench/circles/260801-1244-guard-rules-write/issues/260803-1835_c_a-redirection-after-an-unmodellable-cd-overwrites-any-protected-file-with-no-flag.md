# A redirection after an unmodellable `cd` overwrites any protected file, with no flag

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coder, task T4-2 of `260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only)
**Cross-references:**
`260803-1431_*_gate-0-misses-the-dotdot-in-a-cd-p-operand…` and
`260803-1803_*_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate…`
(both closed by T4-2; this is what T4-2 did **not** close, on the same commands),
`260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`
(the decision this issue asks to revisit),
`rules/protected-path-discipline.md` (residual list, updated in the same commit),
`hooks/lib/bash-mutation-guard.ts:81-108` (`## Fail-closed, and its bound`)

---

## What is wrong

T4-2 inverted the classifier's working-directory model into an allow-list, so an
unmodelled `cd` form now yields `CWD_UNKNOWN` and a relative operand of a **recognised
verb** denies fail-closed. The `rm` and `cp` spellings of every measured entrance now deny.

The **redirection** spellings of the same entrances still allow, because the fail-closed
pass deliberately stops at the verb table's edge and `echo` is not a table verb. The
working directory is unknown, the operand is an ordinary relative path, and nothing looks
at it.

This is not a regression — every row below allowed before T4-2 as well, for a different
reason (the classifier modelled the wrong directory rather than admitting it did not know
one). What changed is that the guard now **knows** it cannot place the write and lets it
through anyway.

## Measured

Real guard subprocess through `hooks/lib/__tests__/helpers/guard-harness.ts`, one throwaway
project per row, shipped `hooks/config.json` protected list. `effect` is the same command
run through real `bash` in the same project. At HEAD **after** T4-2:

```
  command                                                   flag  guard  effect
  pushd -n docs && echo pwned > agents/coder.md              --    allow  OVERWRITTEN
  cd docs && CDPATH=.. cd agents && echo pwned > coder.md    --    allow  OVERWRITTEN
  cd -P rules/L/.. && echo pwned > agents/coder.md           set   allow  OVERWRITTEN
```

The discriminating neighbours, same projects, showing the bound is the verb table and not
the working-directory model:

```
  pushd -n docs && rm agents/coder.md                        --    DENY   DELETED
  cd docs && CDPATH=.. cd agents && cp /dev/null coder.md    --    DENY   OVERWRITTEN
  cd -P rules/L/.. && rm agents/coder.md                     set   DENY   DELETED
```

Reach is the whole protected list on the write route, since `>` makes any program a
mutation and the target is an ordinary relative path. Two of the three rows need **no
flag**.

## Why it was not fixed in T4-2

Closing it means carrying fail-closed into a redirect target whose program is outside the
table when the reason it does not resolve is the **working directory** rather than the
token. That reverses part of a decision taken deliberately and pinned by a test:

- `hooks/lib/__tests__/bash-mutation-guard.test.ts` — `"does NOT carry fail-closed into a
  program outside the table"` asserts `cd $D && echo x > y.md` **allows**;
- the same file's `"does NOT reach a redirection whose program is outside the table"` calls
  that give-up "the sharpest form" and names it on purpose;
- `rules/protected-path-discipline.md` states it to every agent in every consuming project.

T4-2's brief was the working-directory model. Reversing a documented allow with its own
closed issue behind it is a separate decision with its own cost, and taking it silently
inside another task is what the Circle has been correcting for four Turns.

## Candidate directions

1. **Split the fail-closed bound by CAUSE, not by program.** Keep allowing a redirect
   target that is unresolvable because the TOKEN carries `$`/backtick/`~` (`npm test >
   "$LOG"` — the idiom `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` protected), and deny one that is unresolvable because
   the working directory is unknown (`viaCwd`). `Target` already carries that distinction:
   `{ kind: "unresolved"; viaCwd: boolean }`. The cost is exactly `cd $D && echo x > y.md`
   and its shape — measurable against the ordinary-command corpus before deciding.
2. **Leave it, and say so louder.** It is already in the residual list; this issue adds the
   measured worst case. Costs nothing and leaves a no-flag overwrite of `agents/**` open.
3. Add `echo`/`printf`/`cat` to the verb table. Rejected on sight: the redirection scanner
   already covers what those write, and rows would carry the ancestor rule with them.

Direction 1 is the one worth measuring. The corpus test
(`MUST NEVER DENY — the ordinary-agent-command corpus`) is where its cost shows up.

## Test coverage this needs

Whichever direction lands, the three rows above and their three discriminating neighbours,
each in its own project, each asserting the deny is not `[HALTED]` and that real bash
would have written the file. The shape is already in
`guard-bash-integration.test.ts` → `denyAndBashWouldHaveWritten`.

## Origin

`260801-1244-guard-rules-write`, task T4-2, while measuring which of the two
issues' reach tables the allow-list actually closed. It closes every `rm`/`cp` row and no
`>` row, which is a bound worth writing down rather than a fix worth claiming.

## Widened by T6-1, and its direction 1 costed (task T6-1, 2026-08-03)

Closing `260803-2236_*_runsbuiltins-is-asserted-about-a-name-so-the-model-now-moves-the-shell-where-the-shell-did-not-move.md` replaced a modelled wrapper `cd` with a give-up, and every give-up on
a directory feeds this issue: the moment the guard stops claiming to know the working
directory, a `>` target becomes unresolvable-because-of-the-directory and this bound lets it
through. Six rows denied at `9aacab5` and allow now, all measured with the real-shell effect:

```
  command cd rules && echo pwned > x.md            bash  OVERWRITTEN
  builtin cd rules && echo pwned > x.md            bash  OVERWRITTEN
  builtin cd rules && echo pwned > x.md            zsh   OVERWRITTEN
  time cd agents && echo pwned > coder.md          bash  OVERWRITTEN
  time cd agents && echo pwned > coder.md          zsh   OVERWRITTEN
  command cd skills/demo && printf '' > SKILL.md   bash  OVERWRITTEN
```

**The reach does not grow** — it was already the whole protected list with no flag, via
`pushd -n docs && echo pwned > agents/coder.md` — but the entrances do, and every future
give-up on a directory will add more. That makes this the single remaining consumer-visible
cost of the module's give-up mechanism, and raises its priority accordingly.

**Direction 1 costed by applying it and running the suite**, so the number is measured rather
than argued. Making pass 3 reach a redirect target that is unresolvable **because of the
working directory** (`viaCwd`) while still allowing one unresolvable because of the **token**
(`> "$LOG"` — the idiom `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` protected) moves exactly **two** assertions in the
whole 1197-case suite:

```
  bash-mutation-guard.test.ts  "does NOT carry fail-closed into a program outside the table"
      cd $D && echo x > y.md          allow -> DENY
      cd $D && echo x > out.log       allow -> DENY
```

and **zero** rows of the 119-command ordinary-agent corpus. Both moved rows are the pinned
statement of the `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` decision, so the cost of direction 1 is not a false-positive
budget — it is the decision itself, and reversing it is a decision to take in the open.

Not taken in T6-1 for that reason. Marker unchanged (`_o_`).

---
Resolved (task T7-1): direction 1, the CAUSE split. `classifyWords` pass 3 now
reaches a target that is unresolved **because the working directory is unknown**
(`Target.viaCwd`) whatever the program is, and still allows one unresolved
because of the **token** — which is the idiom `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` protected
(`npm test > "$LOG"`, `cat report.md > ~/backup.md`, `curl -o $OUT`,
`make $TARGET`, `echo x > "rules/$F"`, all pinned as allows).

Taken with `260803-2338_*_…after-a-cd-it-cannot-prove-succeeded.md`
option 1, because neither closes the redirect spelling of the failing-`cd`
bypass alone: `cd nope || true; echo pwned > rules/x.md` allows under either
change by itself and denies under both.

**Reversing a documented decision was the whole cost, so it was taken in the
open.** `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` was an ISSUE whose `Resolved:` line carried the argument,
with no decision record to supersede. The record that should have existed is now
`260804-0106_*_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`;
it states the original argument as it was, the reversal, and the measured cost,
and `260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md` carries a pointer back to it. The two tests that pinned the
old bound were INVERTED with a comment naming what they replaced, not deleted.

Measured, HEAD's own 4203-command test corpus, both directions. The CAUSE split
in isolation moves **11** verdicts: 8 escapes closed (every row of the table
above, the six that newly allowed at `048f3db`, and T6-1's eleventh row
`command cd build && echo pwned > rules/x.md`) and **3** costs —
`cd $D && echo x > y.md`, `cd $D && echo x > out.log` and
`cd "$(pwd)" && npm test > out.log`, all three pinned assertions of
`260801-1859_*_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`. **Newly allowing: none.**

The third cost row is a correction to the number this issue recorded. T6-1
costed the direction at "exactly two assertions" by counting failing `it` blocks
rather than moved rows; the third sits in the same `expectAllAllow` array as the
second, so it never showed as a separate failure. Zero rows of the 119-command
ordinary-agent corpus, which is unchanged.

Every deny is measured against the real guard subprocess with the real-shell
effect asserted, one fresh project per row, in the shell that performs the
write — `guard-bash-integration.test.ts`, "a redirect target the guard cannot
place denies whatever the program is" (10 rows) and "the fail-closed bound
survives — an unparseable ARGUMENT is still allowed".

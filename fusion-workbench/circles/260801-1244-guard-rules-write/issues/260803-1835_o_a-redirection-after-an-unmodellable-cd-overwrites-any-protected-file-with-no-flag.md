# A redirection after an unmodellable `cd` overwrites any protected file, with no flag

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coder, task T4-2 of `circles/260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only)
**Cross-references:**
`issues/260803-1431_p_gate-0-misses-the-dotdot-in-a-cd-p-operand…` and
`issues/260803-1803_p_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate…`
(both closed by T4-2; this is what T4-2 did **not** close, on the same commands),
`issues/260801-1859_c_redirection-carries-fail-closed-into-unrecognised-programs-and-three-docs-deny-it.md`
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
   "$LOG"` — the idiom `260801-1859` protected), and deny one that is unresolvable because
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

`circles/260801-1244-guard-rules-write`, task T4-2, while measuring which of the two
issues' reach tables the allow-list actually closed. It closes every `rm`/`cp` row and no
`>` row, which is a bound worth writing down rather than a fix worth claiming.

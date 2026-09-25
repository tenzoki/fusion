# `command cd` and `builtin cd` move the shell past a directory model that never sees them

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 4 incremental review of `260801-1244-guard-rules-write`
**Affects:** `hooks/lib/bash-mutation-guard.ts` (Bash surface only)
**Cross-references:**
`260803-1431_*_gate-0-misses-the-dotdot-in-a-cd-p-operand…`,
`260803-1803_*_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate…`
(both closed by `a79ff1a`; this is the same class through a route the allow-list cannot reach),
`hooks/lib/bash-mutation-guard.ts:1689-1717` (`applyDirEffect`),
`hooks/lib/command-word.ts:113-135` (`WRAPPER_PROGRAMS`), `:151-159` (`findCommandWord`),
`260803-1835-turn4-t4-2-working-directory-allow-list.md` (Residual 5, whose stated
reason is what this issue falsifies)

---

## What is wrong

`applyDirEffect` resolves the segment's command word with `findCommandWord` +
`programName` (`bash-mutation-guard.ts:1695`, `:1709`). `findCommandWord` skips leading
environment assignments and grammar words and stops at the first remaining token — it does
**not** walk `WRAPPER_PROGRAMS`. The verb classifier, in the same module, *does* walk them:
`command rm rules/x.md` correctly denies.

So one module carries two command-word resolutions, one wrapper-aware and one not, and the
directory model is the one that is not. `command` is already a `WRAPPER_PROGRAMS` row
(`command-word.ts:119`); `builtin` is in neither table.

Both are **shell builtins that run shell builtins**. `command cd rules` and `builtin cd
rules` change the shell's directory in bash and zsh. `applyDirEffect` sees `command` /
`builtin`, finds neither in `DIR_BUILTINS` (`:1717`), returns, and the model keeps
asserting a working directory the shell has left.

This falsifies the argument recorded as Residual 5 of T4-2:

> `env CDPATH=.. cd x` is not seen. `applyDirEffect` resolves the command word without
> walking wrappers, so a wrapper hides the builtin — but `cd` is a shell builtin and `env`
> cannot run it, so the command does nothing in real bash either. **No behaviour change**.

True of `env`, `sudo`, `nice` and every other *external* wrapper. False of `command` and
`builtin`, which are the two wrappers that exist precisely to run builtins.

It is also **not a flag**, so the allow-list inversion in `a79ff1a` does not reach it:
the segment never gets as far as `firstDirArg`.

## Measured

Real guard subprocess through `hooks/lib/__tests__/helpers/guard-harness.ts`, **one fresh
throwaway project per row**, shipped `hooks/config.json` protected list, no
`FUSION_ALLOW_RULES_WRITE`. `effect` is the same command run through real `bash` in a
second fresh project. No deny is `[HALTED]`. Measured at `b85f6a0`:

```
  command                                             guard  effect
  command cd rules && rm x.md                         allow  rules/x.md DELETED
  command cd agents && rm coder.md                    allow  agents/coder.md DELETED
  command cd rules && mv x.md /tmp/gone-probe         allow  rules/x.md DELETED
  command cd skills/demo && rm SKILL.md               allow  skills/demo/SKILL.md DELETED
  command cd fusion-workbench && rm -rf .guard-state  allow  .guard-state DELETED
  builtin cd rules && rm x.md                         allow  rules/x.md DELETED
```

The overwrite route works too — verified against real bash on a temporary tree:

```
  command cd rules && cp /dev/null x.md   -> rules/x.md truncated to empty
  command cd rules && echo pwned > x.md   -> rules/x.md == "pwned"
```

Discriminating controls, same harness:

```
  command rm rules/x.md          DENY   (the wrapper IS walked for verbs)
  sudo cd rules && rm x.md       allow  (and bash leaves the file intact —
                                         sudo genuinely cannot run a builtin)
  cd rules && rm x.md            DENY   (the model's own control)
```

Reach is the whole `guard.protectedPaths` list, on both the delete and the write route,
with no flag and no symlink.

Shell coverage: `builtin cd` moves the shell in **bash and zsh**; `command cd` moves it in
**bash** (zsh's `command` forces external lookup, so `command cd` is inert there). The
guard's stated model is bash, and `builtin` covers both, so the issue does not depend on
which shell the Bash tool spawns.

## Why this matters beyond the two spellings

The Turn's claim is that the working-directory entrance is closed as a **stance** rather
than as an enumeration, checkable by inspection: *every path through `applyDirEffect`
produces either a `Cwd` the classifier can prove or `CWD_UNKNOWN`*. The invariant as
written is stated over **writes to `state`** (`:1658`), and it holds — `command cd` writes
nothing. What it does not cover is a construct that moves the shell **without reaching
`applyDirEffect`'s modelling code at all**, leaving a previously-proven `Cwd` standing as a
stale assertion. The invariant is necessary and not sufficient, and the gap is exactly the
one the audit recipe cannot see, because the recipe greps for assignments.

## Candidate direction

Give `applyDirEffect` the same wrapper-walking resolver the verb classifier uses, bounded
to the wrappers that can actually run a builtin, and fail closed on the rest:

1. Add `builtin` to `WRAPPER_PROGRAMS` (`{}`, no value flags) — it is a wrapper by every
   definition the table already uses, and its absence also means nothing else in the module
   sees through it.
2. In `applyDirEffect`, resolve the command word through the wrapper walk. Then
   `command cd rules` and `builtin cd rules` reach `DIR_BUILTINS` and are modelled exactly
   as a plain `cd` is — no new deny, the correct directory.
3. For a wrapper that **cannot** run a builtin (`sudo`, `env`, `nice`, `xargs`, …) followed
   by a directory builtin, the real shell does nothing, so modelling nothing is right. The
   cheap and safe version is to call `unmodelled(state)` instead — it over-denies a command
   that is already broken in the shell and costs no working shape.

Direction 2 alone closes the measured escape. It is a widening of an existing mechanism
rather than a new one, which is the form this Circle has been asking for.

## Test coverage this needs

The six rows above and the three controls, each in its own project, each asserting the deny
is not `[HALTED]` and that real bash would have written the file — the
`denyAndBashWouldHaveWritten` shape already in `guard-bash-integration.test.ts`. Plus a unit
pin that `applyDirEffect`'s command-word resolution and the verb classifier's are the same
resolver, so the two cannot drift apart again.

## Origin

Turn 4 incremental code review, answering the review brief's question 1 — "try to find a
ninth entrance: a bash construct that moves or invalidates the working directory and
reaches a modelling path anyway". This one does not reach a modelling path; it bypasses it.

---
Resolved: `applyDirEffect` now resolves its command word through `resolveInvocation`, the
same wrapper-aware resolver the verb classifier uses, so one module carries one
command-word resolution again (`hooks/lib/bash-mutation-guard.ts`). `builtin` was added as
a `WRAPPER_PROGRAMS` row. The candidate direction's point 3 is implemented as a field on
the row rather than as a second table: `WrapperSpec.runsBuiltins` marks the wrappers that
can really run a shell builtin, and `Invocation.reachesBuiltin` reports whether the whole
chain did so without consuming words of its own. `command`, `builtin` and `time` are
modelled exactly as a bare `cd` (measured under bash 3.2 and zsh); every other wrapper in
front of a directory builtin takes `unmodelled(state)` and denies fail-closed, which costs
only commands that are already errors in the shell.

Measured after the change through the real guard subprocess, one fresh project per row,
with the real-bash effect check: `command cd rules && rm x.md`, `builtin cd rules && rm
x.md`, `time cd agents && rm coder.md` and `command cd skills/demo && rm SKILL.md` all
deny, none reading `[HALTED]`, and real bash deletes the watched file in every case.
`command cd build && rm out.js` and `builtin cd build && rm out.js` still allow, so the
wrapper walk models rather than gives up.

Two extra findings, both from checking the general question rather than the two spellings.
`time` is a THIRD builtin-capable wrapper — it is a reserved word timing a pipeline that
runs in the current shell, not `/usr/bin/time` — and it was as open as `command`. And
`command` is inert in zsh, whose `command` forces an external lookup, so only `builtin` and
`time` reach the builtin in both shells; marking all three is the denying direction for zsh
and correct for bash, which is the guard's stated model. Residual 5 of T4-2's history has
been struck through and corrected in place.

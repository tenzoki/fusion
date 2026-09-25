# Turn 5, T5-1 — the wrapper walk and the `pushd` rotation

**Date:** 2026-08-03 22:20
**Agent:** coder
**Circle:** `260801-1244-guard-rules-write`, Turn 2 of this session (the Circle's fifth)
**Task:** T5-1 — close `260803-2038_*_command-cd-and-builtin-cd-move-the-shell-past-a-directory-model-that-never-sees-them.md` (High), `260803-2039_*_a-bare-pushd-pushes-onto-the-model-stack-where-bash-only-rotates-so-every-later-popd-is-off-by-one.md` (High), `260803-2040_*_the-ambient-cdpath-check-reads-the-hooks-environment-not-the-shell-the-command-runs-in.md` (Low)
**Source review:** `260803-2041-coderev-turn4-working-directory-allow-list.md`
**Suite:** `npm test` — 1182 passed, 24 files, green (was 1167)

---

## What changed

Two defects, both inside a mechanism that was already the right shape, both closed by
routing into the give-up that already existed rather than beside it. One documentation
correction. No new mechanism was added, and no special case handles one construct.

| File | Change |
|---|---|
| `hooks/lib/command-word.ts` | `builtin` added as a `WRAPPER_PROGRAMS` row. `WrapperSpec.runsBuiltins` marks the three wrappers that can run a shell builtin. `Invocation.reachesBuiltin` reports whether the resolved chain did so unmodified. |
| `hooks/lib/bash-mutation-guard.ts` | `applyDirEffect` resolves its command word through the shared `resolveInvocation`. A directory builtin behind a wrapper that cannot run one takes `unmodelled(state)`. Bare `pushd` and `pushd +N` take `unmodelled(state)` instead of pushing. The invariant's audit recipe restated over the whole record. `ambientCdpathIsSet`'s docstring restated over what it reads. |
| `hooks/lib/__tests__/bash-mutation-guard.test.ts` | `builtin` added to the wrapper coverage table; two new wrapper cases; a five-case describe on stack depth. |
| `hooks/lib/__tests__/guard-bash-integration.test.ts` | Seven new real-guard rows with the real-bash effect check; two allow-side controls. |
| `rules/protected-path-discipline.md`, `README-hooks.md` | The wrapper list, the two new give-up rows, the `pushd` cost, two new residuals. |

---

## Finding 1 — `command cd` and `builtin cd`

**Diagnosis.** Not a missing table row. One module carried two command-word resolutions and
the directory model had the weaker one: `applyDirEffect` used bare `findCommandWord`, while
`verbOperands` used `resolveInvocation`, which walks `WRAPPER_PROGRAMS`. The fix is the call
site, and the review scoped it correctly.

**The general question, which is where the work actually was.** The task asked which *other*
ways a directory builtin can be reached, and told me to check rather than assume. So I ran
`<wrapper> cd sub` under every `WRAPPER_PROGRAMS` row plus a few chains, in bash 3.2 and in
`zsh -f`, reading `pwd` in the parent afterwards:

```
                bash      zsh
  command  ->   sub       probe     (zsh's `command` forces an external lookup)
  builtin  ->   sub       sub
  time     ->   sub       sub       <-- NOT in the issue, and as open as `command`
  \time    ->   probe     probe
  exec     ->   (shell exits)
  env, sudo, nice, nohup, setsid, stdbuf, timeout, ionice, xargs, doas -> probe
  command command / builtin builtin / command builtin -> chains work in bash
```

Three results changed the shape of the fix.

**`time` is a third builtin-capable wrapper.** It is a reserved word timing a pipeline that
runs in the current shell, not the `/usr/bin/time` its `valueFlags` row describes. `time cd
agents && rm coder.md` was open exactly as `command cd` was, and is now an integration row.

**Naively walking wrappers would have OPENED a hole.** `env cd build && rm agents/coder.md`
allows today by accident — `env` is not a directory builtin, so nothing is modelled and the
`rm` resolves at the root and denies. Had the walk been unconditional, the model would have
placed the shell in `build/`, resolved the operand to `build/agents/coder.md`, and allowed a
delete real bash performs on the protected file. So the walk has to know which wrappers can
run a builtin. That is the issue's candidate direction 3, and it is load-bearing rather than
tidy-up.

**A flag on a builtin-capable wrapper is the same hazard one level down.** `time -o log cd
build` is the external `time`, which cannot run `cd` at all. So `reachesBuiltin` requires
each hop to be `runsBuiltins` **and** to have consumed no words of its own. `command -v cd`
falls out correctly for free: it prints a name and moves nothing.

**Where the fact lives.** On the `WrapperSpec` row, not in a parallel set of three names next
to `WRAPPER_PROGRAMS`. A second table beside the first is precisely the
duplicate-at-reduced-fidelity that caused this issue; putting the fact on the row means
adding a wrapper is still one line and cannot half-register.

**What it costs.** A directory builtin behind `sudo`, `env`, `xargs`, `nice` and the rest now
denies fail-closed. `unmodelled` rather than a plain `return`, which would have been
*faithful* — those wrappers really cannot run a builtin, so the shell really does not move.
I chose fail-closed because the faithful answer is correct only while the table says what it
says today, and this Circle has now watched five assertions outlive the reason they were
true. The commands it denies are already errors in the shell, so no working shape is lost.

**Before / after**, real guard subprocess, one fresh project per row, real-bash effect check,
no deny reading `[HALTED]`:

| Command | Before | After | Real bash |
|---|---|---|---|
| `command cd rules && rm x.md` | allow | **DENY** | deletes `rules/x.md` |
| `builtin cd rules && rm x.md` | allow | **DENY** | deletes `rules/x.md` |
| `time cd agents && rm coder.md` | allow | **DENY** | deletes `agents/coder.md` |
| `command cd skills/demo && rm SKILL.md` | allow | **DENY** | deletes `skills/demo/SKILL.md` |
| `command cd fusion-workbench && rm -rf .guard-state` | allow | **DENY** | — |
| `command cd rules && echo pwned > x.md` | allow | **DENY** | overwrites |
| `command cd build && rm out.js` | allow | allow | modelled, not given up |
| `sudo cd rules && rm x.md` | allow | **DENY** | bash leaves it intact |
| `env cd rules && rm x.md` | allow | **DENY** | bash leaves it intact |
| `command rm rules/x.md` | DENY | DENY | the wrapper was always walked for verbs |

The last four rows are the discriminating controls. The two `sudo` / `env` rows are the
disclosed cost.

---

## Finding 2 — bare `pushd` and `pushd +N`

**Diagnosis.** `state.dirStack.push(state.cwd)` ran for every surviving `pushd`. Measured
against bash 3.2 and zsh, reading `dirs` after each step:

```
  pushd DIR      depth +1   a real push
  pushd -        depth +1   a real push, landing on $OLDPWD
  pushd          depth  0   SWAPS the top two entries
  pushd +N       depth  0   ROTATES
  pushd -N       depth  0   ROTATES
  popd           depth -1   a real pop
  popd past bottom  depth 0 an error; bash stays put
```

`pushd -` was worth measuring rather than assuming: it pushes *and* goes to `$OLDPWD`, which
is exactly what the `previous` arm already modelled, so it keeps its push.

**The fix** is the issue's candidate direction: the `none` and `opaque` arms for `pushd` call
`unmodelled(state)` and return, and the push then sits below that guard, reachable only on
the two arms where bash really pushes. `pushd -N` was already fail-closed through the flag
allow-list. `cd` with no operand is untouched — it is a real move to `$HOME`, not a stack
edit, and keeps `CWD_OUTSIDE`.

**Before / after**, same harness and effect check:

| Command | Before | After | Real bash lands in |
|---|---|---|---|
| `cd rules && pushd ../build && pushd ../docs && pushd && popd && popd && rm x.md` | allow | **DENY** | `rules/`, deletes `x.md` |
| `… pushd +1 && popd && rm x.md` | allow | **DENY** | `rules/`, deletes `x.md` |
| `… pushd -1 && popd && rm x.md` | DENY | DENY | `rules/`, deletes `x.md` |
| `cd rules && pushd ../build && pushd && popd && rm x.md` | allow | **DENY** | `build/` — the disclosed cost |
| `cd rules && pushd ../build && pushd +1 && popd && rm x.md` | allow | **DENY** | `build/` — the disclosed cost |
| `pushd build > /dev/null && rm out.js; popd > /dev/null` | allow | allow | unchanged |
| `pushd rules && popd && rm x.md` | allow | allow | unchanged |
| `cd build && pushd /tmp && popd && rm out.js` | allow | allow | unchanged |
| `cd rules && pushd ../build && popd && popd && rm x.md` | DENY | DENY | `rules/` — depth from below |

**The cost, named honestly.** The two rows marked "disclosed cost" used to allow *and* agree
with bash, because a bare `pushd` followed by exactly one `popd` is an identity on the
working directory in bash too. The model agreed by cancelling two errors, not by modelling
anything, and it stops agreeing the moment a second `popd` arrives. Both now deny fail-closed
with the working directory named as the cause, and both are pinned by a test that says so.

---

## Finding 3 — the ambient `CDPATH` docstring

Prose only. No behaviour moved: the degrade fires on exactly the condition the user chose one
Turn ago. `ambientCdpathIsSet`'s docstring now opens with the question the code answers, says
that `opts.env` is the hook process's environment and therefore a frozen snapshot of Claude
Code's launch environment, names the one configuration in which it equals the command shell's
and the two in which it does not, and says why the bound is not fixable from there. The same
statement is now in `rules/protected-path-discipline.md` (as a second residual bullet,
labelled by direction against the existing one) and in `README-hooks.md`. The decision record
gains a trailing `Bound recorded` note; its marker does not move, because the answer stands.

---

## The corrected invariant recipe

T4-2's recipe said: grep `applyDirEffect` for `state.cwd =` and check each right-hand side.
It could not see a `dirStack.push`, which is the write that broke the invariant three days
later. The replacement is in the `applyDirEffect` docstring, and this is it verbatim so a
reader of this file can run it without opening the source:

```sh
awk '/^function applyDirEffect/,/^}$/' hooks/lib/bash-mutation-guard.ts \
  | grep -nE 'state\.[a-z]|unmodelled\('
```

Run at the time of writing it returns 23 lines. That is **every** mutation of the record and
then some: `ShellState` has exactly five fields (`cwd`, `prev`, `dirStack`, `physical`,
`cdpath`) and no method that hides one, so a `state.` prefix plus the one give-up function is
exhaustive. It over-reports on purpose — the reads come out too (`const here = state.cwd`,
`if (state.physical)`) and are inert, because a read cannot break an invariant about what is
stored. Skip those. Each remaining hit must be one of five shapes:

1. `unmodelled(state)` — the whole record zeroed. Always honest.
2. `state.cwd = X` — `X` is `CWD_UNKNOWN`, `CWD_UNKNOWN_AMBIENT_CDPATH`, `CWD_OUTSIDE`, or
   comes from `resolveDir` / `prev` / `dirStack`, which are subject to the same invariant.
   The `switch`'s `default` arm binds `never`, so the compiler proves it is exhaustive over
   `DirArg` and the enumeration is finite.
3. `state.prev = state.cwd` — a copy of a value the invariant already holds for.
4. `state.dirStack.push(state.cwd)` / `.pop()` — the property to check is **depth**, not
   value: for every form, does the model's stack end as deep as bash's `dirs`? The measured
   table above is the answer, and the forms that fail it take shape 1.
5. `state.physical = true` / `state.cdpath = true` — monotone, never cleared, and both can
   only make a later `cwd` less certain.

**What the recipe does not certify**, stated inside the recipe rather than left for a sixth
Turn to find: that the function is *reached*. A construct that moves the shell without running
a recognised directory builtin writes nothing here and leaves a proven `cwd` standing. That
is how `command cd rules` got past a model whose every write was honest. The wrapper walk
closes the measured route; `eval "cd rules"`, a shell function or alias named `cd`, and a `cd`
inside a `source`d script remain out of reach of a textual classifier.

The Circle's own lesson, from the review, is what shaped this: the failure is not the word
"complete", it is any statement a later reader can stop at. So the recipe carries its own
boundary.

---

## Tests

`npm test` — **1182 passed, 24 files, green.** Up 15 from 1167.

**Anti-vacuity, done by breaking each fix and watching the new tests fail**, not by reading
them:

| Mutation | Failures |
|---|---|
| `pushd` rotation guard disabled (`if (false && …)`) | 5 — 3 unit, 2 integration |
| `command` demoted to `runsBuiltins: false` | 2 — the unit wrapper-model case and the integration allow-side control |
| `applyDirEffect` reverted to a non-wrapper-walking resolver (the original defect) | 6 — 2 unit, 4 integration |

The second mutation is the informative one: it makes `command cd` fail-closed instead of
modelled, so every *deny*-side case still passes and only the allow-side control catches it.
That control is therefore load-bearing, not decoration.

The standing anti-vacuity guard in the integration harness still holds: `rm -f rules/x.md`
must block in a throwaway project, or every denial assertion in the file is vacuous, and each
new case asserts its deny is not `[HALTED]` **and** that real bash writes the watched file.

**No verdict from the last four commits moved.** Re-run through the real guard subprocess,
one fresh project per row (the halt masks rows 4 onward otherwise — I reproduced that trap
before splitting the runs):

```
allow  FLAG cd rules/L/.. && rm agents/coder.md     <-- the subtle one, both directions
DENY        cd rules/L/.. && rm agents/coder.md
DENY   FLAG cd -P rules/L/.. && rm agents/coder.md
DENY   FLAG set -P; cd rules/L/.. && rm agents/coder.md
DENY   FLAG pushd -P rules/L/.. ; rm agents/coder.md
DENY        cd docs && CDPATH=.. cd agents && rm coder.md
DENY        pushd -n docs && rm agents/coder.md
DENY        cd docs && pushd -n .. && popd && rm agents/coder.md
DENY        cd docs && pushd -n .. && cd - && rm agents/coder.md
DENY        cd docs && pushd ..; popd -n; popd; rm agents/coder.md
DENY        rm AGENTS/coder.md
DENY        rm -rf HOOKS
allow  FLAG mv rules/x.md rules/retired/
allow       rm -rf node_modules
allow       pushd docs >/dev/null && ls; popd
allow       cd build && rm out.js
allow       rm -rf dist
allow       pushd build && rm out.js
```

Fifteen of the review's re-verified rows plus three ordinary-work controls, all unchanged.

---

## Residuals

1. **A directory builtin the classifier cannot see as one.** `eval "cd rules"`, an alias or
   shell function named `cd`, and a `cd` inside a `source`d script all move the shell where a
   textual classifier cannot follow. Same mechanism as the existing `case`-arm and
   function-definition residual, aimed at the directory model rather than at a verb. Now
   stated in both shipped documents and in the invariant's "what this does not certify".
   Not measured as an exploit — the mechanism is the same one already accepted for verbs.
2. **`command cd` is inert in zsh**, whose `command` forces an external lookup. Marking it
   `runsBuiltins` is therefore an over-deny under zsh and correct under bash, which is the
   guard's stated model. `builtin` and `time` move the shell in both. Measured.
3. **The ambient `CDPATH` reach**, finding 3 above: the check reads the hook's environment,
   so a `CDPATH` exported into a shell Claude Code did not launch from is invisible to it.
   Argued from the two process-assembly paths plus the measurement that the tool shell really
   does source the profile; not measured against a second live Claude Code launch, because I
   have one launch configuration to hand.
4. **`260803-1835`, the redirection after an unmodellable `cd`**, is untouched and out of
   scope. Note that finding 1 *narrowed* its entrance set rather than widening it: the review
   named `command cd agents && echo pwned > coder.md` as a new route into it, and that
   command now denies, because the directory is modelled and the redirect target resolves to
   a protected path. The residual's own shape (`pushd -n docs && echo pwned > …`, an unknown
   directory plus an unrecognised program) is unchanged.

## Not done, deliberately

`hooks/lib/paths.ts`, `hooks/lib/fs-locator.ts` and `hooks/lib/rules-write-exemption.ts` were
not touched. `hooks/dist/` tracked files were restored to HEAD at the end of the task — note
for whoever runs the rebuild that `npm test` in `hooks/` is `tsc && vitest run`, so it
regenerates `dist/` as a side effect and a test run alone dirties those files. The version
bump and the rebuild belong to Plan Step 10.

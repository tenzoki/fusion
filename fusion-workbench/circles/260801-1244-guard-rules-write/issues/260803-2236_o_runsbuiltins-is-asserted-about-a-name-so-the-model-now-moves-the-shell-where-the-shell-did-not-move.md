# `runsBuiltins` is asserted about a NAME, so the directory model now moves the shell where the shell did not move

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, Turn 5 incremental review of `circles/260801-1244-guard-rules-write`
**Affects:** `hooks/lib/command-word.ts`, `hooks/lib/bash-mutation-guard.ts` (Bash surface only)
**Kind:** REGRESSION introduced by `9aacab5`. Every row below **denied** at `cb2c8ad` and **allows** at HEAD.
**Cross-references:**
`hooks/lib/command-word.ts:146` (`command: { runsBuiltins: true }`), `:164` (`time`),
`:106-126` (the docstring making the claim), `:229-249` (`Invocation.reachesBuiltin`),
`:294` (the computation);
`hooks/lib/bash-mutation-guard.ts:1782-1800` (the call site and the give-up);
`hooks/lib/__tests__/bash-mutation-guard.test.ts:645` (the single assertion that pins the defect);
`rules/protected-path-discipline.md:176-180`, `:381-382`; `README-hooks.md:122`, `:184`;
`issues/260803-2038_c_command-cd-and-builtin-cd-move-the-shell-past-a-directory-model-that-never-sees-them.md`
(the issue this closes, and re-opens in the other direction);
`history/260803-2220-turn5-t5-1-wrapper-walk-and-pushd-rotation.md` `## Residuals` item 2.

---

## What is wrong

The fix for `260803-2038` was right about the mechanism and right that walking wrappers
unconditionally would open a hole. It guarded against the wrong half of the hole.

`reachesBuiltin` decides whether the directory model treats `<wrapper> cd DIR` as a real
move. It is computed from a fact stored on the **program name**:

```ts
// command-word.ts:294
if (wrapper.runsBuiltins !== true || next.length !== args.length) {
  reachesBuiltin = false;
}
```

Whether a shell builtin actually runs is not a property of the name. It is a property of
**the spelling** and of **which shell is running**. Both were measured wrong:

| Spelling | bash 3.2 | zsh 5.9 | The model says |
|---|---|---|---|
| `command cd DIR` | moves | **does NOT move** (zsh's `command` forces an external lookup, and `/usr/bin/cd` exists) | moves |
| `time cd DIR` | moves | moves | moves |
| `/usr/bin/time cd DIR` | **does NOT move** | **does NOT move** | moves |
| `\time cd DIR` | **does NOT move** | **does NOT move** | moves |
| `'time' cd DIR` / `"time" cd DIR` | **does NOT move** | **does NOT move** | moves |
| `builtin cd DIR` (any spelling) | moves | moves | moves |

`programName` and `resolveWord` deliberately erase a path, quoting and a backslash escape,
because for a **verb** those spellings all name the same program — `\rm` really is `rm`.
For `time` that erasure is exactly backwards: `\time`, `'time'` and `/usr/bin/time` are the
spellings that select the *external* program instead of the reserved word, which is the one
thing `runsBuiltins` is claiming about it.

**Modelling a move that did not happen is not a safe over-deny.** That is the assumption
the fix rests on, and it is false. A modelled move relocates every later relative operand,
which is a deny when it moves the operand *onto* the protected list and an **allow** when
it moves it *off*. Both directions are live:

```
  command cd rules && rm x.md      model: rules/x.md       DENY     (the direction that was tested)
  command cd build && rm rules/x.md  model: build/rules/x.md  ALLOW  (the direction that was not)
```

The shipped documents state the wrong direction too — `command-word.ts:114-116` ("the
marking is in the denying direction for zsh"), the Turn's history `## Residuals` item 2
("an over-deny under zsh"), `rules/protected-path-discipline.md:176-180` ("all three are
now modelled exactly as a bare `cd rules` is") and `README-hooks.md:184`.

**The tool shell here is zsh.** `SHELL=/bin/zsh`, `ZSH_VERSION=5.9`, and `command cd ../build`
measured directly in a Bash tool call leaves the shell where it was. The classifier's
stated model is bash; the shell that executes what the classifier allowed is not.

## Measured

Real guard subprocess through `hooks/lib/__tests__/helpers/guard-harness.ts`, one fresh
throwaway project per row, shipped protected list, no flag, no deny reading `[HALTED]`.
`effect` is the same command run in a second fresh project through the named real shell.

At **HEAD (`9aacab5`)**:

```
  guard   shell  effect            command
  allow   zsh    rules/x.md GONE   command cd build && rm rules/x.md
  allow   zsh    coder.md GONE     command cd docs && rm agents/coder.md
  allow   zsh    rules/x.md OVERWRITTEN   command cd build && echo pwned > rules/x.md
  allow   zsh    rules/x.md GONE   command command cd build && rm rules/x.md
  allow   zsh    rules/x.md GONE   command cd build; rm rules/x.md
  allow   bash   rules/x.md GONE   /usr/bin/time cd build && rm rules/x.md
  allow   zsh    rules/x.md GONE   /usr/bin/time cd build && rm rules/x.md
  allow   bash   rules/x.md GONE   \time cd build && rm rules/x.md
  allow   zsh    rules/x.md GONE   \time cd build && rm rules/x.md
  allow   bash   rules/x.md GONE   'time' cd build && rm rules/x.md
  allow   bash   coder.md GONE     "time" cd build && rm agents/coder.md
```

The same eleven rows at **`cb2c8ad`** (the commit before the fix): **every one DENIES.**
Before the wrapper walk, `applyDirEffect` did not see through `command` or `time`, the
model kept the shell at the project root, and `rm rules/x.md` resolved to a protected path.

Controls that did not move, so the finding is the walk and not the harness:

```
  DENY  command cd rules && rm x.md           (the direction the Turn tested)
  DENY  sudo cd rules && rm x.md              (a wrapper that gives up)
  DENY  /usr/bin/env cd build && rm rules/x.md  (give-up, and correct: bash deletes)
  DENY  (command cd build) && rm rules/x.md   (subshell scoping discards the cd)
  allow \builtin cd build && rm rules/x.md    (correct: the shell really did move)
  allow 'builtin' cd build && rm rules/x.md   (correct, both shells)
```

**Anti-vacuity, by stubbing.** Setting `command: {}` in `WRAPPER_PROGRAMS` (i.e. dropping
`runsBuiltins`) turns all four `command` rows above into fail-closed **DENY**, and fails
exactly **one** assertion in the suite:

```
  bash-mutation-guard.test.ts:645
  expect(denies(`${prefix} cd build && rm out.js`), prefix).toBe(false)
```

That is the allow-side control the Turn's history calls "load-bearing, not decoration". It
is load-bearing, and what it pins is the defect: it asserts that the model **must** treat
`command cd build` as a real move.

The neighbouring case at `:620-630` (`hides a DIRECTORY builtin from the model no more than
it hides a verb`) passes either way. Its probe was designed to discriminate ignored /
modelled / gave-up — three outcomes — but there is a fourth, *modelled wrongly*, and it sits
inside the outcome the probe calls correct.

## Candidate direction

Two, in increasing strictness. Either closes every row above.

1. **Keep only the spelling-proof, shell-proof row.** `builtin` was measured moving the
   shell in bash and zsh, bare, backslash-escaped and quoted — it is the one wrapper whose
   whole purpose is running a builtin and which no spelling redirects. Drop `runsBuiltins`
   from `command` (zsh disagrees) and from `time` (four spellings disagree, in both shells).
   Both then take the `!reachesBuiltin` give-up that already exists.
2. **Give up on every wrapper.** `reachesBuiltin` is true only for a bare invocation with no
   wrapper hop at all. Simpler to state, and it does not depend on a per-shell measurement
   staying true — which is the argument the Turn itself used for preferring fail-closed over
   the faithful answer for `sudo cd` / `env cd`.

The Turn's own stance points at (2): *"the faithful version is right only while the wrapper
table says what it says today, and this Circle has now watched five assertions outlive the
reason they were true."* `runsBuiltins` is a sixth such assertion, and it outlived its
reason inside the same commit that wrote it.

Whichever is chosen, the fix must also invert the test at `:645` and correct the four
documents listed under Cross-references, including the residual that states the direction
backwards.

**Cost.** `command cd build && rm out.js`, `builtin cd build && rm out.js` (under direction
2) and `time cd build && rm out.js` stop being modelled and deny fail-closed with the
working directory named as the cause. None is an ordinary agent-issued shape — reaching a
directory builtin through a wrapper buys nothing, which is the Turn's own observation — and
the way through is an absolute path or dropping the wrapper.

## Test coverage this needs

- Each escape row above as an integration case with `denyAndBashWouldHaveWritten`, in the
  shell it was measured in.
- A unit pin on the **allow direction** that the current suite has no case for: a
  wrapper-mediated `cd` into an unprotected directory followed by a **protected** relative
  operand. Every existing wrapper case names the operand under the *destination*, which is
  the direction that cannot catch this.
- A pin that `\time`, `'time'` and `/usr/bin/time` do not reach a builtin, whatever the
  decision on the bare form — the spelling erasure is the general shape and it will come
  back for whatever the next `runsBuiltins` row is.

## Origin

Turn 5 incremental code review, answering the review brief's question 1 ("it must not model
a construct that does not"). Found by asking which shell actually executes a Bash tool call,
measuring `<wrapper> cd sub` in it, and then building the operand in the direction the
Turn's own before/after table did not test.

---

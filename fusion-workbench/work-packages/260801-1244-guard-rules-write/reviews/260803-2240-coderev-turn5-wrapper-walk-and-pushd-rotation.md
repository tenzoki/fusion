# Turn 5 code review — the wrapper walk, the `pushd` rotation, and the corrected invariant recipe

**Date:** 2026-08-03 22:40
**Agent:** coderev
**Circle:** `260801-1244-guard-rules-write`, Turn 5
**Scope:** `cb2c8ad..HEAD` (`9aacab5`), excluding `fusion-workbench/` — 6 files, 506 added lines
**Suite at review time:** `vitest run` — 1182 passed, 24 files, green
**Shells measured:** bash 3.2.57 and zsh 5.9. The `Bash` tool's shell in this session is
**zsh** (`SHELL=/bin/zsh`, `ZSH_VERSION=5.9`, verified by running `command cd` in a tool call).

---

## Summary

The `pushd` half of this Turn is correct and I could not break it. I re-measured every depth
claim in bash and zsh, including `pushd -`, and every one holds.

The wrapper half closed the entrance it was scoped to close and **opened a wider one in the
other direction**. Eleven commands that denied at `cb2c8ad` allow at HEAD, and in each the
real shell deletes or overwrites a file on the protected list. The Turn's own guiding
insight — that walking wrappers naively would open a hole — was right; the guard it built
covers `sudo` and `env` and does not cover the case where a wrapper the table calls
builtin-capable is not, which happens for `command` under zsh and for `time` under four
ordinary spellings in both shells.

Two further escapes, both pre-existing and both undocumented, came out of bounding that one.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 3 |
| Medium | 0 |
| Low | 0 |

One of the three is a regression from this commit; two are pre-existing.

---

## Answers to the five questions

### 1. Is the wrapper walk correct in both directions? — No. It is correct in the direction it was tested and wrong in the other

**The miss direction is closed.** `command cd rules && rm x.md`, `builtin cd rules && rm
x.md`, `time cd agents && rm coder.md`, `command cd skills/demo && rm SKILL.md` and the
redirection sibling all deny at HEAD, all allowed at `cb2c8ad`, and I confirmed the real
shell writes the watched file in each. The diagnosis was right and the fix is at the right
call site: `applyDirEffect:1782` now uses `resolveInvocation`, so the module carries one
command-word resolution rather than two.

**The `runsBuiltins` fact is load-bearing and the placement is right.** I verified the claim
directly rather than accepting it: under the shipped table, `env cd build && rm
agents/coder.md` allows at `cb2c8ad` because nothing is modelled, and an unconditional walk
would have placed the shell in `build/` and allowed a delete bash performs. At HEAD it
denies through `!reachesBuiltin` (`:1797`). Putting the fact on the `WrapperSpec` row rather
than in a second table is the correct call for exactly the stated reason. I re-measured the
whole table in bash — `command`, `builtin` and `time` move the shell, and `env`, `sudo`,
`doas`, `nice`, `ionice`, `timeout`, `xargs`, `nohup`, `setsid`, `stdbuf` do not, and `exec`
replaces the shell. **No row is missing.**

**And that is where it stops.** The fact is stored against a program *name*, and whether a
builtin actually runs is a property of the *spelling* and of *which shell is running*:

| Spelling | bash | zsh | Model |
|---|---|---|---|
| `command cd DIR` | moves | **does not move** | moves |
| `/usr/bin/time cd DIR`, `\time cd DIR`, `'time' cd DIR`, `"time" cd DIR` | **does not move** | **does not move** | moves |
| `builtin cd DIR`, any spelling | moves | moves | moves |

`programName` and `resolveWord` erase a path, quoting and a backslash escape, which is right
for a verb (`\rm` is `rm`) and exactly backwards for `time`: those are the spellings that
select `/usr/bin/time` instead of the reserved word.

The Turn's premise is that mis-marking a wrapper is an over-deny. It is not. A modelled move
relocates every later relative operand — a deny when it moves the operand *onto* the
protected list, an **allow** when it moves it off. The before/after table in the history
tests only the first:

```
  command cd rules && rm x.md        -> rules/x.md          DENY   (tested)
  command cd build && rm rules/x.md  -> build/rules/x.md    ALLOW  (not tested; zsh deletes)
```

Eleven measured rows, all denying at `cb2c8ad` and allowing at HEAD, all with the real shell
writing the file, are in `260803-2236_*_…`. Filed **High**, as a regression.

The disclosed residual states the direction backwards — "an over-deny under zsh", history
`## Residuals` item 2, and `command-word.ts:114-116`. So do
`rules/protected-path-discipline.md:176-180` and `README-hooks.md:184`, which now tell an
agent that all three wrappers "are modelled exactly as a bare `cd`". They are not.

**Anti-vacuity, by stubbing.** Dropping `runsBuiltins` from `command` turns all four
`command` escapes into fail-closed denies and fails exactly one assertion in the suite:
`bash-mutation-guard.test.ts:645`, the allow-side control the history calls "load-bearing,
not decoration". It is load-bearing, and what it pins is the defect. Its neighbour at `:620`
passes either way: the probe was built to discriminate ignored / modelled / gave-up, and
there is a fourth outcome — *modelled wrongly* — hiding inside the one it calls correct.

### 2. Is the `pushd` arm split right? — Yes, and I could not break it

Re-measured in bash 3.2 and zsh 5.9 by reading `dirs` / `$dirstack` after each step, not
inferred:

```
  pushd DIR   +1     pushd -   +1 (pushes AND goes to $OLDPWD)     popd  -1
  pushd       0 (swaps top two)   pushd +N  0 (rotates)   pushd -N  0 (rotates)
  popd past bottom  0, an error, the shell stays put
```

Every row matches the history's table. `pushd -` is the one that looks like an exception and
is not: bash 3.2 goes `depth 1 → 2` landing on `$OLDPWD`, zsh goes `dirstack 0 → 1` the same
way, which is precisely what the `previous` arm already modelled — the push is correct and
the retained `state.dirStack.push` at `:1854` belongs there.

The give-up guard at `:1843` is reachable only by `pushd` with `kind: "none"` or `"opaque"`,
`pushd -N` was already fail-closed through the flag allow-list, and `cd` with no operand
keeps `CWD_OUTSIDE` on the `none` arm. The direction is safe by construction — `unmodelled`
can only produce `CWD_UNKNOWN`, and unknown only ever denies.

I re-ran the six-segment escape and both rotation siblings: all deny at HEAD, all allowed at
`cb2c8ad`, and real bash lands in `rules/` and deletes the file in each. The four surviving
idioms (`pushd build >/dev/null && rm out.js; popd`, `pushd rules && popd && rm x.md`, `cd
build && pushd /tmp && popd && rm out.js`, `pushd hooks && npm test; popd`) all still allow.

**The cost is exactly the two rows named** and no more. I checked the shapes around them —
`pushd -L build`, `cd -L build`, `popd -L`, `pushd --` — and none moved.

### 3. Does the corrected recipe hold? — It enumerates every field, and its stated bound is not the only gap

Run at HEAD it returns **24** lines (the history says 23; a line drifted in, no consequence).
The enumeration really is exhaustive over the record: `ShellState` has five fields, all
lowercase-initial, so `state\.[a-z]` catches every direct access, and there is no method that
hides one. Module-wide, the only other writers of a `ShellState` are `unmodelled`,
`freshState`, `cloneState` and the subshell save/restore at `:2198-2243` — the first is shape
1, the rest copy or restore values the invariant already holds for. The recipe is a genuine
improvement on "grep for `state.cwd =`", and carrying its own boundary is the right instinct.

The named bound — that it does not certify the function is *reached* — is real and is the
right first gap.

It is not the only one. Shape 4 states the property correctly ("the property to check is not
the value but the DEPTH") and then offers shape 1 as the answer for forms that fail it.
**Shape 1 does not restore depth.** `unmodelled()` maps the stack to unknowns and `.map()`
preserves length, so after `pushd -n DIR` bash is one entry deeper than the model. That stays
hidden only while the cwd is unknown; an **absolute** `cd` re-proves it (`resolveDir:1293`),
and the surviving mismatch becomes load-bearing again:

```
  allow / bash deletes rules/x.md:
  cd docs && pushd -n .. && cd {ROOT}/build && popd && rm rules/x.md
```

Identical at `cb2c8ad`, so this is pre-existing rather than caused here — but it is the
counterexample to the recipe this Turn wrote, and the recipe is where it should have been
caught. Filed **High** as `260803-2237_*_…`, with the discriminating control (the same
five segments with a *modelled* `pushd ..` agree with bash and are untouched).

### 4. Did anything from the previous four commits move? — No, and the costs are the ones stated

I re-ran the fifteen verdicts through the real guard, one fresh project per row. Eleven are
reachable without the rules-write flag and a symlink fixture, and **all eleven reproduce**:
the four `cd rules/L/..` rows in their flag-unset (DENY) form, the in-command `CDPATH` row,
the three `pushd -n` collectors, the `popd -n` chain, and the two case-folding rows. The four
`allow FLAG` rows I did not re-run — they belong to the rules-write exemption, which this
Turn did not touch and which I verified in Turn 4. All six ordinary-work allow controls still
allow.

The three disclosed costs are the ones stated and I found no fourth. `sudo cd` and `env cd`
deny (both broken commands either way). The three-deep `pushd`/`popd` chains that used to
allow by cancelling two errors now deny, with the working directory named as the cause, and
both are pinned by a test that says so.

The `builtin` row also widens the **verb** and **git** classifiers, which the write-up does
not mention: `builtin rm rules/x.md` and `builtin git switch other` allowed at `cb2c8ad` and
deny now. Both are errors in a real shell, so this is a free tightening in the denying
direction, not a cost. No finding.

### 5. Is `command-word.ts` a clean extraction? — Yes. Both existing callers keep their semantics

The module is older than this Turn; what is new is one row, one field and one computation.
Read against the call site it replaced, `applyDirEffect`'s pre-existing paths are preserved
exactly: `assignsCdpath` still reads the raw prefix through `findCommandWord` (`:1772`),
`args` is the same slice for a bare invocation, the reordered `name !== "set" &&
!DIR_BUILTINS.has(name)` guard is equivalent to the old pair, and both the old `idx === -1`
and the old bare-wrapper path now arrive at the same early return via `invocation === null`.

The verb classifier does not read `reachesBuiltin` and every `MUTATION_VERBS` row is an
external program, so the field is genuinely inert there. `git-branch-guard.ts` does not read
it either. The only behavioural change on those two paths is the `builtin` row, measured
above and safe.

The flag-disqualification rule (`next.length !== args.length`) does not over-deny anything
ordinary. It can only fire when the resolved name is `set` or a `DIR_BUILTINS` member, so
`time npm test`, `timeout 60 npm test` and `command -v jq >/dev/null && …` are all untouched;
I measured them. What it does catch — `time -o log cd build`, `command -v cd` — is correct
and rare.

---

## Findings by theme

### Theme: the directory model asserts a move the shell did not make

This is the inverse of every earlier finding in this Circle, all of which were about a move
the model failed to see. It appears here for the first time because this Turn is the first to
teach the model to follow a `cd` it previously ignored.

| # | Severity | Kind | Finding |
|---|---|---|---|
| `260803-2236_*_runsbuiltins-is-asserted-about-a-name-so-the-model-now-moves-the-shell-where-the-shell-did-not-move.md` | High | **regression** at `9aacab5` | `runsBuiltins` is stored against a program name; `command` is inert in zsh and `time` is inert under four spellings, so eleven wrapper-mediated commands that denied at `cb2c8ad` now allow while the real shell writes the protected file |
| `260803-2238_*_the-directory-model-assumes-every-cd-succeeds-so-a-cd-to-a-nonexistent-directory-is-a-one-segment-bypass.md` | High | pre-existing, undocumented | the model assumes every `cd` **succeeds**; after any separator other than `&&` the shell runs the next segment from where it never left, so `cd nonexistent; rm rules/x.md` allows and deletes |

### Theme: the give-up mechanism is stated over values and not over shape

| # | Severity | Kind | Finding |
|---|---|---|---|
| `260803-2237_*_unmodelled-zeroes-the-stack-values-but-not-its-depth-so-an-absolute-cd-re-proves-a-shifted-stack.md` | High | pre-existing since `a79ff1a` | `unmodelled()` zeroes the stack's values but preserves its depth, so `pushd -n DIR` leaves bash one entry deeper; an absolute `cd` re-proves the cwd and a later `popd` collects the mismatch |

All three were measured through the real guard subprocess, one fresh project per row, with
the real-shell effect asserted and no deny reading `[HALTED]`.

---

## Cross-cutting observations

**A give-up is safe; a model is not — and this Turn added both without separating them.**
`unmodelled` can only make things unknown, and unknown only denies, so routing the rotation
forms into it could not go wrong and did not. `reachesBuiltin` is the opposite kind of
change: it *adds* modelling, and adding modelling is bidirectional by nature. The two landed
in one commit, tested with one style of probe — a protected operand under the destination —
which can only see the denying direction. Every one of the eleven escapes is a protected
operand under the *origin*. That asymmetry, not the wrapper table, is what a future
directory-model change most needs a standing test shape for.

**"It over-denies in that configuration" is the sentence to distrust.** It was the disclosed
residual for `command` under zsh and it was the wrong half of the truth. Whenever the model
asserts a directory it cannot check, the error is symmetric and only the operand decides
which way it falls. That generalises past this Turn: the same sentence would be wrong for any
future `runsBuiltins`-shaped fact.

**The Circle's stated lesson is right and was applied unevenly.** *"The faithful version is
right only while the wrapper table says what it says today"* is the reason `sudo cd` gives up
instead of being modelled faithfully. `runsBuiltins` is the same kind of assertion, and it
was modelled rather than given up on — in the same function, three lines away. The
distinction that was drawn (this table is measured, that one is inferred) did not survive
contact with a second shell and a backslash.

**The implementers' measurements are trustworthy, again.** Every row of the wrapper table,
every row of the depth table, `pushd -` in both shells, all fifteen re-verified verdicts, the
three stated costs and the three anti-vacuity mutations reproduced when I re-ran them. Nothing
in this review is a re-file of something they measured and disclosed. What is wrong here is
one inference laid over a correct measurement — `command` was correctly measured as inert in
zsh, and then reasoned about in the wrong direction.

---

## Recommended sequencing

**Release blocker for any claim about the protected-path boundary:** `260803-2236_*_runsbuiltins-is-asserted-about-a-name-so-the-model-now-moves-the-shell-where-the-shell-did-not-move.md`. It is a
regression, it is live in the shell that actually runs the commands, and it is the cheapest
of the three to close — drop `runsBuiltins` from `command` and `time` (leaving `builtin`,
which no spelling and no shell disagrees about), or drop the whole modelled-wrapper path.
Inverting the assertion at `bash-mutation-guard.test.ts:645` and correcting the four
documents goes in the same commit.

**Same priority, independent:** `260803-2237_*_unmodelled-zeroes-the-stack-values-but-not-its-depth-so-an-absolute-cd-re-proves-a-shifted-stack.md`. Small, contained (`unmodelled` plus one branch
in `popd`), and it costs nothing measurable.

**Needs a decision, not a repair:** `260803-2238_*_the-directory-model-assumes-every-cd-succeeds-so-a-cd-to-a-nonexistent-directory-is-a-one-segment-bypass.md`. Direction 1 (degrade after a non-`&&`
separator) costs `cd build; rm out.js`, which agents genuinely write. It should get a
decision record before any code moves.

**Still open, unchanged by this Turn:** `260803-1835` (a redirection after an unmodellable
`cd`). This Turn narrowed its entrance set, as the history claims; `260803-2236_*_runsbuiltins-is-asserted-about-a-name-so-the-model-now-moves-the-shell-where-the-shell-did-not-move.md` widens it
again by the same routes until it is closed.

---

## The plain verdict

**Yes. The class has returned a sixth time, and this time the Turn caused it.**

The five previous returns were all one shape — a construct that moved the shell where the
model did not follow. This one is the mirror image: a construct the model follows where the
shell does not move. `command cd build && rm rules/x.md` denied at `cb2c8ad` and allows at
`9aacab5`, and zsh — the shell this session's `Bash` tool actually runs — deletes
`rules/x.md`. Ten more rows behave the same way, including four that need no zsh at all,
only `/usr/bin/time` or a backslash.

I want to be exact about what that does and does not say about the Turn. The `pushd` fix is
correct, complete over the five forms, verified in two shells, and I could not break it. The
wrapper fix closes what it was scoped to close. The recipe is a real improvement over the one
it replaces. The failure is not in either mechanism; it is in one inference — that marking a
wrapper builtin-capable when it is not costs only a false deny — and that inference is stated
in four shipped places.

**What the directory model is closed against**, measured at HEAD rather than claimed:

- any flag on `cd` / `chdir` / `pushd` / `popd` outside the two-member allow-list — `-P`,
  `-n`, `-q`, `-e`, `-@` and anything not yet invented;
- `set -P` and `set -o physical`;
- a `CDPATH` assigned in the command, and a `CDPATH` in the hook's environment (with the
  reach residual the Turn documented);
- `pushd` with no operand, `pushd +N` and `pushd -N` — the rotation forms, closed this Turn
  and verified against both shells;
- a directory builtin behind a wrapper that cannot run one — `sudo`, `env`, `xargs`, `nice`,
  `nohup`, `exec`, `timeout` and the rest — closed this Turn;
- an operand it cannot resolve to a literal.

**What it is not closed against:**

- a directory builtin behind a wrapper the table calls builtin-capable when the running shell
  or the written spelling disagrees (`260803-2236_*_runsbuiltins-is-asserted-about-a-name-so-the-model-now-moves-the-shell-where-the-shell-did-not-move.md`, live, regression);
- a stack whose depth the model and the shell disagree about, once an absolute `cd` re-proves
  the working directory (`260803-2237_*_unmodelled-zeroes-the-stack-values-but-not-its-depth-so-an-absolute-cd-re-proves-a-shifted-stack.md`, live, pre-existing);
- a `cd` that **fails**, on any separator the shell does not condition on (`260803-2238_*_the-directory-model-assumes-every-cd-succeeds-so-a-cd-to-a-nonexistent-directory-is-a-one-segment-bypass.md`,
  live, pre-existing, on no residual list);
- and — by nature, not by omission — every construct that hides a `cd` from a textual reader:
  `eval "cd rules"`, an alias or shell function named `cd`, a `cd` inside a `source`d script,
  a `cd` in a `case` arm or a function body, and a `cd` whose operand is computed at run time.
  No enumeration closes these. They are the boundary of the design, and the Turn is right to
  state them as such in both shipped documents.

That last group is the honest end of the line, and it is worth separating from the three
above it. The first three are bugs and will close. The fourth will not, and no sixth, seventh
or eighth Turn should be spent trying — the value of saying so plainly is that the day the
first three are shut, the sentence "the guard's model of where the shell is standing is exact
for every `cd` written in the command text, and blind to every `cd` that is not" will be true,
checkable, and worth putting in front of the user.

It is not true yet.

---

**Reconciliation 260804-1021-reconciliation.md (reconciler, domain `code`) — the regression this review found is closed at HEAD `cc012fc`. Verified independently, not read off the fix log.**

The review's central finding was that `9aacab5` made eleven measured rows allow that previously denied. Those eleven rows are nine distinct command texts (rows 6/7 and 8/9 are one text each, measured in bash and in zsh; the classifier is shell-agnostic). Each was run through `classifyBashMutation` at four commits, with `hooks/lib` materialised out of git read-only at each:

| `cb2c8ad` | `9aacab5` | `048f3db` | HEAD | Command |
|---|---|---|---|---|
| DENY | allow | DENY | DENY | `command cd build && rm rules/x.md` |
| DENY | allow | DENY | DENY | `command cd docs && rm agents/coder.md` |
| DENY | allow | allow | DENY | `command cd build && echo pwned > rules/x.md` |
| DENY | allow | DENY | DENY | `command command cd build && rm rules/x.md` |
| DENY | allow | DENY | DENY | `command cd build; rm rules/x.md` |
| DENY | allow | DENY | DENY | `/usr/bin/time cd build && rm rules/x.md` |
| DENY | allow | DENY | DENY | `\time cd build && rm rules/x.md` |
| DENY | allow | DENY | DENY | `'time' cd build && rm rules/x.md` |
| DENY | allow | DENY | DENY | `"time" cd build && rm agents/coder.md` |

The review's measurement reproduces exactly. `048f3db` closed eight of the nine; the ninth, the redirect spelling, closed in `c9c44a3` with `260803-1835`.

**The closure did not restore the defect `9aacab5` was written to fix.** All eight rows of `260803-2038`'s own measurement table deny at HEAD, including the redirect spelling `command cd rules && echo pwned > x.md` that briefly re-allowed at `048f3db`. The mechanism changed — the rows now deny by give-up (`unknownCwdReason`) rather than by modelling — and the discriminating controls confirm the give-up did not become a blanket: `cd rules && rm x.md` denies with the *protected-path* reason, `cd build && rm out.js` still allows, and `rm -rf node_modules`, `rm -rf dist`, `pushd build && rm out.js` are all untouched.

**One thing this review could not have known and which the record should carry.** `048f3db`, the commit that closed the regression this review found, was itself never reviewed. Turn 7's review used it as the *baseline* (`048f3db..c9c44a3`), which measures what came after it, not what it did. Turn 8's commit `cc012fc` was never reviewed either, because the session hit its max-Turns circuit breaker in the same commit. Two of the session's five code commits carry no independent review.

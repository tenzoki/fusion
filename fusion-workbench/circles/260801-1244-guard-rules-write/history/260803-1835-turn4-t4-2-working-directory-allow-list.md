# T4-2 — the working-directory model becomes an allow-list

**Date:** 2026-08-03 18:35
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`, Turn 1 (the Circle's fourth)
**Task:** T4-2 — close the working-directory entrance into the guard's protected-path
classifier
**Status:** Complete. Not committed — the orchestrator commits after validation.

**Closes:**
`issues/260803-1431_p_gate-0-misses-the-dotdot-in-a-cd-p-operand-so-a-planted-link-still-spends-the-grant.md`
(High, grant side) and
`issues/260803-1803_p_the-classifier-asserts-a-working-directory-that-cdpath-and-pushd-n-invalidate.md`
(High, protection side). Both left at `_p_`; the marker transition belongs with the commit.

**Brief:** `analyses/260803-1803-guard-path-model-root-cause.md` (analyst, T4-1).

---

## What changed

`firstDirArg` was a deny-list by omission: any token shaped like a flag was skipped, and
whatever followed was modelled with bash's default logical `cd` semantics. It is now an
**allow-list** of the forms the classifier actually models, and everything else reaches
`CWD_UNKNOWN` — an existing state, with an existing fail-closed deny and an existing
diagnosable reason. Nothing new was built.

Four parts, all in `hooks/lib/bash-mutation-guard.ts`:

1. **`firstDirArg` inverted.** `MODELLED_DIR_FLAGS` is `{-L, --}` — `-L` because it *is*
   bash's default, `--` because it ends option processing. Every other flag returns a new
   `DirArg` kind, `unmodelled`.
2. **`unmodelled(state)`** — the single give-up, stated over the **whole** `ShellState`,
   not over `cwd`. See "Three entrances I found while implementing" below for why.
3. **`set -P` / `set -o physical` recognised.** `set` is not a directory builtin and is not
   in `DIR_BUILTINS`; it is handled on its own branch and sets a sticky `physical` flag,
   after which any directory builtin yields `CWD_UNKNOWN`.
4. **A `CDPATH` assignment recognised** in all three spellings `findCommandWord` hides — a
   command prefix, a bare assignment segment, and `export`/`declare`/`typeset`/`local`/
   `readonly`. It sets a sticky `cdpath` flag, after which a **bare-word** `cd` operand
   yields `CWD_UNKNOWN`. An operand starting `/`, `./`, `../`, or equal to `.` or `..`
   stays exactly modelled.

Both mode flags live in `ShellState`, so `cloneState` scopes them to a `(…)` subshell
exactly as the working directory is scoped.

## Before and after, all five entrances plus the controls

Real guard subprocess through `helpers/guard-harness.ts`, **one fresh project per row**,
shipped `hooks/config.json` protected list. `effect` is the same command run through real
`bash` in the same project, so a deny is measured against what the command would have done
rather than against a string. Probe retained at `<scratchpad>/probe-t42.ts`; raw output at
`<scratchpad>/before.txt` and `after.txt`.

### The five the task named

```
  command                                            flag  before  after  bash effect
  cd -P rules/L/.. && rm agents/coder.md             set   allow   DENY   DELETED
  set -P; cd rules/L/.. && rm agents/coder.md        set   allow   DENY   DELETED
  pushd -P rules/L/.. ; rm agents/coder.md           set   allow   DENY   DELETED
  cd docs && CDPATH=.. cd agents && rm coder.md      --    allow   DENY   DELETED
  pushd -n docs && rm agents/coder.md                --    allow   DENY   DELETED
```

No deny is `[HALTED]`; the integration cases assert that explicitly, and each runs in its
own project because three denials halt the guard and every case after would then pass for
the wrong reason.

### The rest of the two issues' reach tables

```
  cd docs && export CDPATH=.. && cd agents && rm coder.md               allow → DENY  DELETED
  cd docs && CDPATH=.. cd hooks && rm config.json                       allow → DENY  DELETED
  cd docs && CDPATH=.. cd skills/demo && rm SKILL.md                    allow → DENY  DELETED
  cd docs && CDPATH=.. cd rules && rm x.md                              allow → DENY  DELETED
  cd docs && CDPATH=../fusion-workbench cd .guard-state && rm escal…    allow → DENY  DELETED
  cd docs && CDPATH=.. cd agents && cp /dev/null coder.md               allow → DENY  OVERWRITTEN
  pushd -P rules/L/.. && rm agents/coder.md                             allow → DENY  (pushd errs)
```

Three rows of those tables did **not** change and are the residual below.

### Controls — none moved

```
  cd rules/L && rm coder.md                    flag  DENY  → DENY   (gate 2, unchanged)
  cd rules/L/.. && rm agents/coder.md          flag  allow → allow  (bash leaves it intact)
  mv rules/x.md rules/retired/                 flag  allow → allow  (the flag's headline use)
  cd docs && cd agents && rm coder.md          --    allow → allow  (the CDPATH control)
  cd build && rm out.js                        --    allow → allow
  cd /tmp && rm -rf x                          --    allow → allow
  rm -rf node_modules                          --    allow → allow
  rm -rf dist                                  --    allow → allow
  cd hooks && npm test                         --    allow → allow
  pushd hooks >/dev/null && npm test; popd     --    allow → allow
  cd -L build && rm out.js                     --    allow → allow
  cd -- build && rm out.js                     --    allow → allow
  set -e; cd build && rm out.js                --    allow → allow
  set -euo pipefail; cd build && rm out.js     --    allow → allow
  FOO=1 cd build && rm out.js                  --    allow → allow
  CDPATH=.. cd ./build && rm out.js            --    allow → allow
```

The `cd rules/L/..` row is the one that scopes the whole change: bash's **default** `cd` is
logical, resolves `..` textually exactly as the classifier does, leaves the file intact, and
still allows. The fix is aimed at the modifier, not at `..` in a `cd`.

## The real cost, measured rather than trusted

The analyst measured two shapes flipping allow → deny. **I measured seven**, and the
difference is not a disagreement — five of them are shapes the analyst did not probe. Every
one is a `cd`-family modifier the classifier does not model:

```
  cd -P docs && rm ../notes.txt          allow → DENY   (the analyst's row 1)
  cd -P build && rm out.js               allow → DENY   (the analyst's row 2)
  cd -P /tmp && rm -rf x                 allow → DENY
  cd -P docs && cd - && rm notes.txt     allow → DENY
  pushd -q build && rm out.js            allow → DENY
  cd -e build && rm out.js               allow → DENY   (unit-level)
  cd -@ build && rm out.js               allow → DENY   (unit-level)
```

`cd -P /tmp` and `cd -P … && cd -` are consequences of `unmodelled` giving up the whole
state rather than only `cwd`; `pushd -q`, `-e` and `-@` are the allow-list working as
designed on flags nobody enumerated. None appears in the ordinary-agent-command corpus
(`MUST NEVER DENY`, 1 file, unchanged and green), and none is needed by a fusion workflow.
The deny names the working directory as the cause and `protected-path-discipline.md`
already says an absolute path is the way through.

**What did NOT get more expensive**, checked because it was the obvious risk: `set`. Only
`physical` changes where a `cd` lands, so the enumeration in `setsPhysicalMode` is complete
over bash's whole option set rather than over the flags I happened to think of.
`set -e`, `set -euo pipefail`, `set -o pipefail`, `set -x` and `set -- "$@"` all cost
nothing. `set $FLAGS` denies, because it can expand to `-P`.

## Three entrances I found while implementing, and what they changed

The task asked me to confirm the analyst's cost rather than trust it. Probing the same way
turned up three more measured entrances, all of the same shape, all **allowing a delete
that real bash performed**:

```
  cd docs && pushd -n .. && popd && rm agents/coder.md         allow  DELETED
  cd docs && pushd -n .. && cd - && rm agents/coder.md         allow  DELETED
  cd docs && pushd .. && popd -n; popd; rm agents/coder.md     allow  DELETED
```

`pushd -n DIR` pushes onto the directory stack and **stays put**; `popd -n` removes a stack
entry and stays put. So the wrong assertion is not in `cwd` at all — it is in `dirStack`
and in `prev` (`$OLDPWD`), and it is collected later, by a `popd` or a `cd -` that lands on
an entry bash no longer has.

This is why `unmodelled` zeroes the whole record. Had it zeroed `cwd` only — the obvious
implementation, and the one the two issues describe — all three rows would still allow
today. All three now deny, and all three are pinned in the unit suite.

## How a reader checks the `applyDirEffect` invariant by inspection

The invariant is: **every write to `ShellState` in `applyDirEffect` leaves it either proven
or unknown.** It is stated in the function's docstring, and it is checkable in four steps
without running anything:

1. **Grep the function for `state.cwd =`.** There are six. Four are `CWD_UNKNOWN`, one is
   `CWD_OUTSIDE` (a bare `cd` or a `~`, which is outside the tree in any resolution mode),
   and one is `resolveDir(here, w.value)` on an operand that reached it through the
   allow-list. There is no seventh, because every arm `return`s.
2. **Check the switch is exhaustive.** Its `default` arm binds `target` to `never`. A new
   `DirArg` kind that is not handled fails to compile rather than falling through into the
   modelled branch. That is what makes step 1 finite.
3. **Check the only way in is the allow-list.** The single call to `firstDirArg` is
   followed immediately by `if (target.kind === "unmodelled") { unmodelled(state); return; }`,
   before the `pushd` push and before any modelling. `firstDirArg` returns `unmodelled` for
   every flag not in `MODELLED_DIR_FLAGS`, which has two members.
4. **Check the two non-flag modes are read before the builtin.** `assignsCdpath` runs above
   the `idx === -1` early return (a bare `CDPATH=..` segment has no command word at all),
   and the `set` branch runs above the `DIR_BUILTINS` test. Each is then consulted on the
   way out — `state.physical` unconditionally, `state.cdpath` for a bare-word operand.

`unmodelled` is one four-line function with one job, and grepping its call sites (three)
enumerates every give-up in the module.

What this does **not** prove is that bash has no fifth way to move a shell that is neither a
flag on a directory builtin nor `set -P` nor `CDPATH`. It proves that such a way, if it is a
flag, arrives at `firstDirArg` and fails closed. That is the bound, and it is the reason the
change is a stance rather than three more rows.

## Tests

- **1080 → 1098**, all green (`npm test` in `hooks/`, 23 files). `tsc --noEmit` clean.
- **18 new cases**: 12 unit (`bash-mutation-guard.test.ts`, in three new describes), 6
  integration (5 in `guard-bash-integration.test.ts`, one per entrance with its own project
  and a real-`bash` effect assertion; 1 in `guard-rules-write-integration.test.ts` for the
  grant side, with the logical-`cd` control).
- **One existing case amended, not for a pass but for a lie**: the spelling list in
  `virtual cwd — the forms a cd target can take` carried `cd -P rules && rm x.md` with the
  comment "`-L` / `-P` are flags, not the directory". It still denies, but now for a
  different reason, so the row would have passed while asserting the model the change
  removes. Replaced with `cd -L rules && rm x.md`, and `-P` is asserted explicitly in the
  new describe.

**Anti-vacuity, measured.** With the inversion stubbed out (blanket flag skip restored,
`setsPhysicalMode` → false, `assignsCdpath` → false, `popd`'s flag case back to cwd-only),
**12 of the 18 new cases fail**. The 6 that still pass are the allow-side controls, which
exist to bound the cost rather than to pin the fix. Per part, against the unit suite alone:

```
  stub                              unit failures
  firstDirArg blanket skip                 3
  set -P unrecognised                      2
  CDPATH assignment invisible              1
  popd -n zeroes cwd only                  1
```

## Docstrings — the three false claims, and what replaced them

Each asserted the class was closed, and each was the reason a later reader would not look
there. All three are corrected in this change, and **none of the replacements makes a fresh
completeness claim** — three have now been falsified in this Circle.

1. **`bash-mutation-guard.ts`, `VerbSpec.exemptible`.** Was: gate 0 refuses any operand
   spelled with a `..`, "which is the only way to traverse a planted link without naming
   it". Now: a three-item list (gate 0, gate 2, the working-directory allow-list) with the
   explicit note that **each shorter version of this paragraph was false**, naming both
   falsifications and what measured them. It says what each layer refuses, and defers the
   symlink question to the module's residual section instead of answering it.
2. **`rules-write-exemption.ts`, gate 0.** Was: gate 0 "is also complete against the class
   BY INSPECTION". Now: a section headed "The bound on gate 0, which is not the bound it was
   first written with" — gate 0 is complete against a `..` **in the operand**, the spelling
   is `joinCwd(base, value)` and the base was normalised on the way in, and that entrance is
   closed **in the classifier, not here**. Gate 0 was not widened and no claim is made that
   it covers the working directory.
3. **`bash-mutation-guard.ts`, `MutationOptions.exempt`.** Was: `spelled` is "that operand
   BEFORE `normalize`" — true of the operand, silent about the base. Now: `spelled` is
   `joinCwd(base, operand)` before `normalize`, with a paragraph headed "WHAT `spelled`
   PRESERVES IS THE OPERAND, NOT THE BASE", the measured consequence, and the reason the
   base is no longer a way in (not because `spelled` preserves it — because an unmodelled
   `cd` yields no base at all).

Two further prose changes in the same commit, both required for the change to be legible:

- the module docstring's "Where a relative operand resolves from" gains the allow-list
  paragraph, naming the four modifier families and pointing at the invariant;
- the module docstring's fail-closed bound gains the measured worst case of the residual
  below, with the issue reference for the decision that produced it.

## Rules documentation

`rules/protected-path-discipline.md` (loaded into every agent in every consuming project):

- `### A cd is tracked` gains a table of the five unmodelled families, the statement that an
  anchored operand stays exact under `CDPATH`, and the measured cost with the way through.
- The fail-closed example block gains `cd -P build && rm out.js` and
  `pushd -n docs && rm ../x.md`, so an agent meeting the deny recognises it.
- The residual list gains the ambient-`CDPATH` entry, and its redirect-target entry gains
  the measured worst case (`pushd -n docs && echo pwned > agents/coder.md`).

## Residuals, measured not assumed

1. **A redirection after an unmodellable `cd` still writes.** Measured after the change,
   three rows, two needing no flag:
   `pushd -n docs && echo pwned > agents/coder.md` — **allow**, real bash **OVERWRITTEN**.
   The working directory is unknown, the operand is an ordinary relative path, and `echo` is
   not a table verb, so the fail-closed pass never runs on it. Its `rm` and `cp` neighbours
   deny. Not fixed here because closing it reverses part of `260801-1859_c_…`, which is
   pinned by two named tests and stated to every agent — a separate decision with its own
   cost. Filed with the measurement and a direction worth measuring
   (`issues/260803-1835_o_a-redirection-after-an-unmodellable-cd-overwrites-any-protected-file-with-no-flag.md`).
2. **An ambient `CDPATH`.** Set in the user's shell profile rather than written into the
   command, so invisible to a module that reads no environment. Explicitly out of scope per
   the task; the decision record
   (`decisions/260803-1803_o_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`)
   is unchanged and neither side of it was implemented. Now named in the rule file's
   residual list, which it was not before.
3. **The sticky `cdpath` flag over-denies the prefix form.** `CDPATH=.. cd a; cd b` puts
   `CDPATH` only in `cd a`'s environment; the flag degrades `cd b` too. Deliberate: the
   error is in the denying direction, and distinguishing the prefix form from `export`
   buys back a shape nothing writes. Documented at the field.
4. **`set +P` does not restore the logical model.** It restores logical mode in bash, but by
   then the shell is standing somewhere already lost, so clearing the flag would buy a
   "known" cwd the classifier cannot name. Over-denies, documented at the field.
5. **`env CDPATH=.. cd x` is not seen.** `applyDirEffect` resolves the command word without
   walking wrappers, so a wrapper hides the builtin — but `cd` is a shell builtin and `env`
   cannot run it, so the command does nothing in real bash either. No behaviour change; noted
   so a future reader does not read it as a hole.

## Not done, deliberately

Everything in the task's not-yours list, unchanged and untouched:

- `260802-2320`, case folding — `hooks/lib/paths.ts` matching semantics not touched (T4-3).
- `260803-1251`, `fs-locator.absolute()` — not touched, and this change neither closes it nor
  makes it reachable (T4-4).
- The ambient-`CDPATH` decision — neither side implemented.
- `hooks/dist/` — no rebuild, no version bump (plan Step 10). **Note for Step 10:** `npm test`
  runs `tsc` first, so running the suite regenerates `hooks/dist/`. The tracked files were
  restored with `git checkout HEAD -- hooks/dist` after the final run; the four untracked
  `dist/lib/fs-locator.*` and `dist/lib/rules-write-exemption.*` files were present before
  this task and are left as found.
- No commit. The orchestrator commits after validation, and the two closed issues are left at
  `_p_` so the marker transition can cite the hash.

## Files changed

```
hooks/lib/bash-mutation-guard.ts                        (the change + 3 docstrings)
hooks/lib/rules-write-exemption.ts                      (gate 0's bound)
hooks/lib/__tests__/bash-mutation-guard.test.ts         (+12 cases, 1 row amended)
hooks/lib/__tests__/guard-bash-integration.test.ts      (+6 cases, +1 helper)
hooks/lib/__tests__/guard-rules-write-integration.test.ts (+1 case)
rules/protected-path-discipline.md                      (3 sections)
```

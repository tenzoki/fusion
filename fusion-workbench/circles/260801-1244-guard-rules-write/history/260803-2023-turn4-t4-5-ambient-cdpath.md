# T4-5 — the ambient `CDPATH` joins the working-directory allow-list

**Date:** 2026-08-03 20:23
**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write`, Turn 1 (the Circle's fourth)
**Task:** T4-5 — implement the answered decision on an ambient `CDPATH`
**Status:** Complete. Not committed — the orchestrator commits after validation.

**Realises:**
`decisions/260803-1803_a_should-the-guard-degrade-its-working-directory-model-when-cdpath-is-set-in-the-ambient-environment.md`
(option 1, chosen by the user at the Turn 4 closing gate). Left at `_a_`; the
`_a_`→`_i_` transition belongs with the commit that gives it a hash to cite.

**Extends:** `a79ff1a` (T4-2), which inverted `firstDirArg` into an allow-list and
closed the in-command `CDPATH`. This is the same mechanism reached from the
environment, not a second one.

---

## What changed

`assignsCdpath` sees a `CDPATH` written into the command. It cannot see one exported in
the user's shell profile, because that is nowhere in the command text — and the Bash
tool's shell is initialised from that profile. So the environment now arrives as a
parameter and the classifier reads exactly one variable from it.

Four parts:

1. **`MutationOptions.env: NodeJS.ProcessEnv`** — required, not optional, and the
   asymmetry with `exempt` is stated at the field: an absent `exempt` is the stricter
   answer, an absent environment would be the looser one. `guard.ts` passes
   `env: process.env`; the module still reads no environment of its own, so a test sets a
   variable for one case without touching the process the other 1166 run in.
2. **`ambientCdpathIsSet(env)`** — non-blank `CDPATH` is set, blank or whitespace-only is
   not. Computed once per command in `classifyBashMutation` and passed to
   `applyDirEffect` as a parameter rather than held in `ShellState`, because an exported
   variable is constant for the whole command: there is no scope that could clear it and
   nothing for `cloneState` to carry.
3. **The degrade** joins the existing branch. `cdpathIsSearched` already decided which
   operands bash searches for, and it is now consulted for both sources, ambient first.
4. **A deny reason that names `CDPATH`** — `ambientCdpathReason`, selected through a new
   `CwdUnknownCause` carried on the unknown `Cwd`, through `Target` and `SegmentHit`.

## The reason a user actually sees

```
fusion policy: CDPATH is set in this shell's environment, so the guard cannot determine
the working directory. Bash searches CDPATH for a BARE-WORD `cd` operand and lands on the
first entry that has it, which need not be the current directory — so an earlier `cd` in
this command may have moved anywhere on that list, and the segment `rm x.md` writes
`x.md` at an unknowable location (fail-closed). Two things clear it: anchor the `cd`
operand (`./x`, `../x` or an absolute path — CDPATH is not consulted for any of those), or
unset CDPATH in the environment. Rewriting the operand that is named here will not,
because it is the directory it hangs off that is unknown. Do not rephrase the command …
```

This was the decision record's constraint. `unknownCwdReason` names the working directory,
which is true here and useless: with `CDPATH` in a profile the `cd` looks entirely
ordinary and every operand in the command is a literal, so a reader following that advice
rewrites a command that was never the problem. `CwdUnknownCause` has exactly one member
for that reason — every other way to lose the directory is written somewhere in the
command.

## Before and after, measured against HEAD's classifier

`<scratchpad>/probe-t45.ts` imports HEAD's `bash-mutation-guard.ts` (extracted with
`git show`, imports rewritten to absolute) and the working tree's, and runs one 32-command
corpus through both in four environments. Verdicts are labelled by which reason fired, so
a changed *reason* shows up as loudly as a changed verdict.

```
  command                                        unset   blank   ws      set
  cd build && rm out.js                          allow   allow   allow   allow→DENY/cdpath
  cd docs && rm ../notes.txt                     allow   allow   allow   allow→DENY/cdpath
  cd junk/rules && rm x.md                       allow   allow   allow   allow→DENY/cdpath
  pushd build && rm out.js                       allow   allow   allow   allow→DENY/cdpath
  cd docs && cd agents && rm coder.md            allow   allow   allow   allow→DENY/cdpath
  (cd build && rm out.js)                        allow   allow   allow   allow→DENY/cdpath
  cd rules && rm x.md                            DENY/protected ×3       DENY/protected→DENY/cdpath
  cd fusion-workbench && rm -rf .guard-state     DENY/protected ×3       DENY/protected→DENY/cdpath
  cd docs && CDPATH=.. cd agents && rm coder.md  DENY/cwd ×3             DENY/cwd→DENY/cdpath
  cd ./rules && rm x.md                          DENY/protected — all four columns
  cd ../rules && rm x.md                         allow — all four columns
  cd /project/rules && rm x.md                   DENY/protected — all four columns
  cd ./build && rm out.js                        allow — all four columns
  cd . && rm build/out.js                        allow — all four columns
  cd .. && rm -rf sibling                        allow — all four columns
  cd /tmp && rm -rf x                            allow — all four columns
  cd ./docs && rm ../notes.txt                   allow — all four columns
  cd -P build && rm out.js                       DENY/cwd — all four columns
  pushd -n docs && rm agents/coder.md            DENY/cwd — all four columns
  set -P; cd build && rm out.js                  DENY/cwd — all four columns
  cd $D && rm -rf out                            DENY/cwd — all four columns
  rm rules/x.md / rm -rf node_modules / dist     unchanged — all four columns
  mv build/out.js dist/ / echo hi > notes.txt    unchanged — all four columns
  npm test > /tmp/log / curl -o rules/x.md …     unchanged — all four columns
  (cd rules && ls) && rm x.md                    allow — all four columns
  cd hooks && npm test                           allow — all four columns
  pushd hooks >/dev/null && npm test; popd       allow — all four columns
  mv rules/x.md rules/retired/                   DENY/protected — all four columns
```

**Drift in the CDPATH-unset, -blank and -whitespace columns: 0**, over all 32 commands.
That is the claim the user accepted the change on, and it is measured rather than argued:
for a shell with no `CDPATH`, this classifier and HEAD's are indistinguishable.

**Six commands flip allow → deny when `CDPATH` is set.** Every one is a bare-word `cd`
followed by a relative operand of a table verb. `cd rules && rm x.md` — the task's headline
case — was already a deny; what changed is that it now denies naming `CDPATH` rather than
naming `rules/x.md`, and that is the more truthful message: with `CDPATH` set, `cd rules`
may not have landed in `rules/` at all, so the old reason asserted a path the guard could
no longer prove.

`cd -P …`, `pushd -n …` and `set -P` keep their own reason with `CDPATH` set. The
proximate cause is visible in those commands, and both remedies the reason gives still
work.

## Proof through the real guard subprocess

Four integration cases in `guard-bash-integration.test.ts`, each a fresh project and a
fresh subprocess (`isFusionPluginCwd()` caches per process, so one process can only answer
one way):

- `CDPATH=/decoy` + `cd build && rm out.js` → `{"decision":"block"}`, not `[HALTED]`, and
  the reason carries all three of "CDPATH is set in this shell's environment", "anchor the
  `cd` operand" and "unset CDPATH". This is what proves `process.env` reaches the
  classifier through the whole hook, which no unit test can.
- **Unset changes nothing**, one project, five commands that each deny under a set
  `CDPATH` and none of which denies here, plus `CDPATH=""` and `CDPATH="   "`, and
  `guardStateWritten(root)` false at the end — so nothing denied quietly either.
- Anchored operands stay allowed with `CDPATH` set.
- The degrade **stands down in the plugin's own repo** with the rest of the protected-path
  check. It is part of that policy, not a policy of its own; otherwise a fusion developer
  with `CDPATH` set would meet exactly the denials the stand-down exists to prevent.

## The harness now strips `CDPATH`

`STRIPPED_ENV_VARS` in `helpers/guard-harness.ts` gains it, and this is not cosmetic. It
is a variable real people export from a shell profile, and it moves verdicts in the
DENYING direction — left in place, a developer who has one would see denials on their
machine that nobody else sees, including on the allow-side rows that exist to bound the
cost of every other change to the directory model. The three variables already there are
permissions; this is the first one that is not, so the docstring now says "every
environment variable a guard verdict depends on".

## Tests

- **1155 → 1167**, all green (`npm test` in `hooks/`, 24 files). `tsc --noEmit` clean.
- **12 new cases**: 7 unit (`bash-mutation-guard.test.ts`, one new describe), 4 integration
  (`guard-bash-integration.test.ts`, one new describe, one project each), 1 wiring
  (`guard-bash-wiring.test.ts`).
- **Two existing call sites amended** to pass the now-required `env`: the unit suite's
  `classify` helper (defaults to `{}`, documented as the claim it is — every case that
  names no environment is asserting the no-`CDPATH` behaviour) and one behavioural case in
  `guard-bash-wiring.test.ts`.

**Anti-vacuity, measured twice.**

```
  stub                                              failures
  ambientCdpathIsSet() → false                      5 of the 12 new cases
  the ambient degrade ignores cdpathIsSearched()    2 (one new, one from T4-2)
```

The 7 that survive the first stub are the equality and allow-side controls: they exist to
bound the cost, not to pin the fix, and they cannot fail when the fix is absent because
absence is what they assert. The second stub exists because of that — it removes the
*anchoring immunity* rather than the whole check, and the "leaves an anchored operand
IDENTICAL, verdict for verdict" case fails, which is what proves that assertion is
load-bearing rather than trivially true. It also fails T4-2's in-command anchoring case,
which is the expected consequence of both sources sharing one predicate.

The equality assertions compare **whole verdicts** (`toEqual`), not two booleans — deny,
reason, offending segment and target path — because "the anchored operand is unaffected"
is a claim about the message as much as the verdict.

## Where bash differs from the decision record, and it matters

The record says the common profile settings "(`CDPATH=.:~/projects`, with `.` first)
resolve to the same place the classifier models". **Measured, that is only true when the
local subdirectory exists.** From a directory holding no `rules/`, with
`CDPATH=.:/decoy`, bash falls through the `.` entry and lands in `/decoy/rules`; with
`./rules` present it stays local.

This does not change what to implement — option 1 degrades whenever the variable is set,
and option 2 (probe the entries) was rejected on principle — but it does change how the
option's cost should be described, and both documents now say so. A leading `.` is not a
shield; it is a shield *for the names the current directory happens to hold*, which is the
opposite of a guarantee, and the case a relative `cd` is usually written for is precisely
the one where the name is not there.

Two further measurements worth having on the record:

- **`pushd` consults `CDPATH` exactly as `cd` does** (bash 3.2 and zsh). Degrading both is
  correct, not over-denial.
- **zsh honours the `CDPATH` environment variable too**, which matters because the Bash
  tool's shell here is zsh. The check is not bash-specific.
- **Blank really is inert**: `CDPATH=`, `CDPATH=" "` and `CDPATH=:` all leave `cd only`
  failing rather than diverting.

## Residuals, measured not assumed

1. **A `CDPATH` whose entries could not actually divert still degrades the model.** The
   guard asks whether the variable is set, not whether any entry holds the name — that is
   option 2, rejected because it means a filesystem probe per entry inside a classifier
   that is textual by design. Cost: a user whose profile sets `CDPATH=.` pays denials for
   bare-word `cd`s that would have landed exactly where the model said. Anchoring the
   operand clears every one of them. Documented in both files.
2. **`CDPATH=:` is treated as set** although its entries are all empty and it diverts
   nothing (measured). Same reason as 1 — reading the entries is the beginning of deciding
   whether they could divert. It over-denies a spelling nobody writes; documented at the
   field.
3. **A whitespace-only `CDPATH` is treated as unset**, per the task. The theoretical cost
   is a directory literally named `" "` sitting where the operand would be found. Measured:
   with `CDPATH=" "` and no such directory, bash diverts nothing. Documented at the field.
4. **The redirection residual is untouched** and is now reachable one more way:
   `echo pwned > agents/coder.md` after a bare-word `cd` with an ambient `CDPATH` allows,
   exactly as it does after `pushd -n docs`. Out of scope per the task; already filed as
   `issues/260803-1835_o_a-redirection-after-an-unmodellable-cd-overwrites-any-protected-file-with-no-flag.md`,
   whose measurement this change widens by one entrance but does not alter in kind.
5. **The write-tool surface is untouched**, per the decision's own constraint: it has no
   working-directory model, so there is nothing there for a `CDPATH` to invalidate.

## Not done, deliberately

- **The in-command `CDPATH` case** — closed and tested in `a79ff1a`, and not reopened. Its
  verdict and its reason are unchanged in every column of the table above except the one
  where an ambient `CDPATH` is *also* set, where the invisible cause wins the message by
  design.
- `hooks/lib/paths.ts` and `hooks/lib/fs-locator.ts` — not touched.
- `hooks/dist/` — no rebuild, no version bump (plan Step 10). `npm test` runs `tsc` first,
  so the tracked files were restored with `git checkout HEAD -- hooks/dist` after the final
  run. **Note for Step 10:** they were already modified when this task started (an earlier
  task's build), so the restore reverted that build too; Step 10's rebuild covers it. The
  four untracked `dist/lib/fs-locator.*` and `dist/lib/rules-write-exemption.*` files were
  present before this task and are left as found.
- **CLAUDE.md** — not edited. Its troubleshooting table describes fail-closed denies, but
  the whole check stands down in this repository, so an ambient-`CDPATH` deny can never
  fire here and the table would be documenting an impossibility.
- No commit. The orchestrator commits after validation, and the decision record is left at
  `_a_` so the `Implemented:` line can cite the hash.

## Files changed

```
hooks/lib/bash-mutation-guard.ts                     (the change + 4 docstrings)
hooks/guard.ts                                       (env: process.env)
hooks/lib/__tests__/bash-mutation-guard.test.ts      (+7 cases, helper amended)
hooks/lib/__tests__/guard-bash-integration.test.ts   (+4 cases)
hooks/lib/__tests__/guard-bash-wiring.test.ts        (+1 case, 1 call amended)
hooks/lib/__tests__/helpers/guard-harness.ts         (CDPATH stripped)
rules/protected-path-discipline.md                   (3 sections)
README-hooks.md                                      (2 paragraphs)
```

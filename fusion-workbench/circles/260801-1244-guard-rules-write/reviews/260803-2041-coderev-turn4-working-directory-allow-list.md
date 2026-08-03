# Turn 4 code review — the working-directory allow-list, case folding, `fs-locator`, ambient `CDPATH`

**Date:** 2026-08-03 20:41
**Agent:** coderev
**Circle:** `circles/260801-1244-guard-rules-write`, Turn 4
**Scope:** `6c447eb..b85f6a0`, excluding `fusion-workbench/` — 15 files, ~2200 added lines
(`a79ff1a`, `86a437a`, `7cf9693`, `b85f6a0`)
**Suite at review time:** `vitest run` — 1167 passed, 24 files, green

---

## Summary

Three of the four commits do what they claim, and I verified their headline measurements
against the real guard rather than against their write-ups. The case-folding fix is
correctly scoped and does not widen the grant; the `fs-locator` fix closes a live grant-side
escape and is complete over every route I could find; the ambient-`CDPATH` degrade costs
nothing with `CDPATH` unset.

The allow-list did **not** close the stance. It closed the flag-shaped entrances, which is
what it was built to do, and I measured two further entrances that are not flag-shaped and
therefore never reach `firstDirArg`. Both are no-flag, both reach the whole protected list,
both destroy or overwrite a protected file that real bash writes. The boundary has moved a
fifth time.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 2 |
| Medium | 0 |
| Low | 1 |

---

## Answers to the five questions

### 1. Did the allow-list close the stance, or only a longer enumeration? — Neither, exactly

The invariant as written is true. I checked it the way the docstring asks: every arm of the
`applyDirEffect` switch assigns `state.cwd` exactly once, the `default` arm binds `never` so
the compiler proves exhaustiveness, `firstDirArg`'s only call site is followed immediately by
the `unmodelled` branch, and `MODELLED_DIR_FLAGS` has two members. The three modes that are
not flags (`set -P`, an in-command `CDPATH`, an ambient `CDPATH`) are settled before the
builtin and consulted on the way out. I re-measured all five of the Turn's own entrance rows
plus the three `pushd -n` / `popd -n` routes the implementer found: all deny, none `[HALTED]`.

What the invariant is stated over is **writes to `state`**. That is necessary and not
sufficient, and both findings below live in the gap.

**Ninth entrance (`260803-2038`, High).** `command cd rules && rm x.md` and `builtin cd
rules && rm x.md` both allow, and real bash deletes the file. `applyDirEffect` resolves its
command word with plain `findCommandWord` (`:1695`), which does not walk `WRAPPER_PROGRAMS`
— while the verb classifier in the same module does (`command rm rules/x.md` denies
correctly). `command` is already a wrapper row; `builtin` is in no table at all. Both are
shell builtins that run shell builtins. The segment never reaches `firstDirArg`, so the
allow-list cannot see it, and the model keeps asserting a directory the shell has left.

This falsifies the stated reason for T4-2's Residual 5 — "a wrapper hides the builtin, but
`cd` is a shell builtin and `env` cannot run it, so the command does nothing in real bash
either". True of `env` and `sudo`. False of the two wrappers whose purpose is running
builtins.

**Tenth entrance (`260803-2039`, High).** `state.dirStack.push(state.cwd)` at `:1746` runs
for every surviving `pushd`, including bare `pushd` (bash swaps the top two entries) and
`pushd +N` (bash rotates). Neither grows bash's stack; both grow the model's. The stack is
then one deep and shifted, and each later `popd` recovers a *known* directory bash does not
go to. Measured escape, six segments, whole protected list, and it holds in zsh as well.

This is the same mechanism the implementer diagnosed for `pushd -n` — "the wrong assertion
is not in `cwd` at all, it is in `dirStack` and in `prev`" — applied to the flag forms only.
The docstring's audit recipe ("grep this function for `state.cwd =`") cannot find it,
because the offending write is a `dirStack.push`. The one field the Turn learned was
load-bearing is the one the recipe does not enumerate.

So: the allow-list is the right change and it holds for what it covers. The claim that it
closes the **stance** — that a bash feature nobody has enumerated arrives as a flag and so
fails closed — is false. Two constructs move the shell without being flags on a directory
builtin.

### 2. Is `unmodelled()` zeroing the whole state correct? — Yes, both halves verified

**The narrow version really is insufficient.** By inspection: `popd` reads `state.dirStack`
(`:1726`) and `cd -` reads `state.prev` (`:1768`). A `pushd -n` / `popd -n` that leaves
`cwd` alone puts the stale assertion in one of those two, and a later collector spends it.
Measured: `cd docs && pushd -n .. && popd && rm agents/coder.md` and its `cd -` sibling both
deny now; the implementer's stub run put the cwd-only version at 1 unit failure on that
route.

**The broad version does not deny things it should not.** `unmodelled` can only produce
`CWD_UNKNOWN`, and unknown only ever denies — there is no direction in which zeroing more
state can allow a write. The cost is over-denial, and it is disclosed honestly: seven shapes
measured (`cd -P …` in four forms, `pushd -q`, `cd -e`, `cd -@`), none in the ordinary-command
corpus. I re-ran the controls that bound it — `rm -rf node_modules`, `pushd docs >/dev/null
&& ls; popd`, `cd rules/L/.. && rm agents/coder.md` with the flag, `mv rules/x.md
rules/retired/` with the flag — all still allow. No finding.

One consequence worth naming rather than filing: because `unmodelled` is stated over the
record, it is the natural home for the two rotation forms in finding `260803-2039`. The fix
is to route them into a mechanism that already exists, not to build one.

### 3. Does the case folding leak into the grant? — No. The exempt set did not widen

`matchesAnyFolded` is called at exactly three protection sites: `guard.ts:730` (CHECK 2),
`isProtected` (`:1140`, `:1144`), and `ancestorOfProtected`, which folds `base` and each
pattern's `literalPrefix` by hand (`:1196`, `:1200`) because it is a raw `startsWith` rather
than a glob match. The grant's gate 1 still reads `matchesAny(canonical, RULE_DIR_PATTERNS)`
(`rules-write-exemption.ts:397`), unfolded. Neither normaliser folds, so the
trailing-separator asymmetry `canonicalise` carries is untouched — putting the fold at the
match rather than in the normaliser was the right call and is the reason the two asymmetries
compose instead of colliding.

Measured with the flag set: `Edit rules/x.md` allows, `Edit RULES/x.md` denies, `Edit
rules/a/../x.md` denies at gate 0, `Edit agents/coder.md` denies. Protection side: `rm
AGENTS/coder.md` and `rm -rf HOOKS` (ancestor) both deny.

**The moved verdict argues correctly.** `Edit RULES/x.md` with the flag denying is a false
deny of a spelling whose canonical form (`rules/x.md`) is still granted, on a filesystem
where they are one file — so the work is never blocked, only one spelling of it. On a
case-sensitive filesystem `RULES/x.md` is genuinely a second file and denying an
un-named grant for it is correct outright. The protected set widened and the exempt set did
not, which is the only direction that is safe. No finding.

The `config.ts` / `tracker.ts` residual (both still on the unfolded `matchesAny`) is stated
at the `matchesAny` docstring and is unreachable at HEAD — `categoryPaths` is `{}` and no
per-project loader exists. Correctly left as a decision for whenever Step 6 lands.

### 4. Is the `fs-locator` link-expansion fix complete? — Yes, over every route I could find

The three lexical collapses are joins now, with the result handed to `realpath`. Instance 3
was a real grant-side escape at HEAD, found by chasing the mechanism rather than accepting
the issue's explanation, and the write-up is right that it belongs in a release note rather
than only inside a closed issue: a `..` arriving from `readlink` is invisible to gate 0 and
to `canonicalise` because there is no `..` anywhere in the tool call.

Asking the implementer's own closing question — where else does a component enter that is
not the caller's spelling — I find no fourth producer:

- `resolve(parentReal, basename(absolutePath))` (`:212`) is sound: `parentReal` is already a
  realpath, so a lexical `..` on it agrees with the kernel, and `basename` is one component.
- `tryRealpath`'s JS fallback is declined outright when a `..` survives (`carriesDotDot`,
  `:142`), so the one resolver in the file that reads `..` lexically is never the answering
  one.
- `hasHardLinks` joins uncollapsed and hands the result to `lstat`, which is kernel-resolved.
- The `root` argument is `process.cwd()` (`guard.ts:118`) — the kernel's own resolved path,
  not a spelling.

The named residual (`rules/dangle/../x.md`, a `..` through a dangling link, still re-appended
by the walk-up) is honest: there is no kernel answer to be faithful to and the write it would
authorise fails at the syscall. No finding.

### 5. Does the ambient `CDPATH` change cost more than measured? — Not in drift. It reaches less than stated

The zero-drift claim holds and is checkable by inspection, not only by the 32-command
corpus: with `CDPATH` unset, `ambientCdpath` is `false`, the `if (ambientCdpath)` branch is
never taken, `state.cdpath` retains exactly T4-2's behaviour, and `CwdUnknownCause` stays
`undefined` so the reason selection is unchanged. There is one caller of
`classifyBashMutation` in production (`guard.ts:379`) and it passes `process.env`. Making
`MutationOptions.env` required rather than optional is right for the reason given — an absent
environment is the looser default, unlike an absent `exempt` — and TypeScript enforces it at
the two amended test call sites. Stripping `CDPATH` in `guard-harness.ts` is the correct
call and the docstring's widening from "permissions" to "every environment variable a guard
verdict depends on" is the right generalisation.

What is overstated is the reach, filed Low as `260803-2040`. `ambientCdpathIsSet` reads the
**hook process's** environment; the docstring justifies the check by describing the **Bash
tool's shell**, which is a different process assembled a different way. I measured that the
tool shell really does source `~/.zshrc` (`FLIGHT_FILE_PREFIX`, defined only there, is set in
it), and that in this session Claude Code's own environment carries the same variable — so
the two agree here. They diverge when Claude Code is launched other than from a
profile-sourcing shell, and when the profile is edited mid-session. Not a bypass, not a
regression; an unnamed residual behind a confident docstring, which is the class this Circle
keeps re-finding.

---

## Findings by theme

### Theme: the working-directory model still asserts what it cannot prove

| # | Severity | Finding |
|---|---|---|
| `260803-2038` | High | `command cd` / `builtin cd` bypass `applyDirEffect` entirely — one module, two command-word resolutions, only one wrapper-aware |
| `260803-2039` | High | Bare `pushd` and `pushd +N` push onto the model's stack where bash rotates; every later `popd` is off by one |

Both are no-flag, both reach the whole `guard.protectedPaths` list on the delete and the
write route, both were measured against real bash in a fresh project per row with the deny
asserted not to be `[HALTED]`.

### Theme: documentation stating a boundary the code does not have

| # | Severity | Finding |
|---|---|---|
| `260803-2040` | Low | `ambientCdpathIsSet` reads the hook's environment while its docstring describes the command's shell |

Also, not filed separately because it is a line inside `260803-2039`: the `applyDirEffect`
audit recipe certifies an invariant it cannot check. It says to grep for `state.cwd =`. The
field this Turn learned was load-bearing is `dirStack`, and the recipe does not enumerate
writes to it.

---

## Cross-cutting observations

**The three false-docstring corrections in this Turn are good, and the pattern that produced
them recurred anyway.** Each replacement carefully declines to make a fresh completeness
claim — and then the `applyDirEffect` invariant makes one in a new shape, as a *method* the
reader is told will find every give-up. A recipe that is incomplete is a completeness claim
wearing different clothes. This is worth naming as the Circle's actual lesson: the failure is
not the word "complete", it is any statement a later reader can stop at.

**The verb classifier and the directory model have drifted apart on command-word
resolution.** `WRAPPER_PROGRAMS` exists, is exported as the review surface, and is walked for
verbs. `applyDirEffect` re-derives the command word with the raw helper. That is one
mechanism duplicated at reduced fidelity — the project's own hygiene position calls that a
defect, and here it is also the escape in `260803-2038`. The fix is to use the existing
resolver, not to add a table.

**`unmodelled()` is the right mechanism and is under-used.** It is called at three sites, all
flag-shaped. The two rotation forms in `260803-2039` want it and do not have it. Whatever
closes them should route into it rather than beside it.

**The implementers' own measurements are trustworthy.** I re-ran eleven of their claimed
verdicts across all four commits — the five entrance rows, the three `pushd -n` collectors,
the flag-side grant controls, and the case-folding table — and every one reproduced,
including the subtle one (`cd rules/L/.. && rm agents/coder.md` allows **with** the flag and
denies without it, for two different correct reasons). The residuals they named are real
residuals. Nothing in this review is a re-file of something they measured and disclosed.

---

## Recommended sequencing

**Release blockers for any claim that the protected-path boundary is established:**
`260803-2038` and `260803-2039`. Both are no-flag escapes of the whole list at HEAD. Neither
is expensive: 2038 is a call-site swap plus one `WRAPPER_PROGRAMS` row; 2039 is moving one
`push` inside the arm that is a push. They are independent and can land in either order, or
together — they touch one function.

**Same commit, cheap:** restate the `applyDirEffect` audit recipe over every write to
`state`, since 2039 is the counterexample to it.

**Cleanup, no urgency:** `260803-2040` (prose, plus the residual line in
`rules/protected-path-discipline.md`).

**Still open from earlier, unchanged by this Turn:** `260803-1835` (a redirection after an
unmodellable `cd`). Note that both findings above widen its entrance set by two more no-flag
routes — `command cd agents && echo pwned > coder.md` is the same shape and I measured the
overwrite. That does not change its kind, and it does not change the direction worth
measuring there.

---

## The plain verdict

**The boundary has moved a fifth time.** Two no-flag entrances into the working-directory
model are live at `b85f6a0`, measured, and reach every path on the protected list.

The stance claim is the specific thing that is false. The allow-list is a genuine inversion
and it holds for flags: an unmodelled flag on a directory builtin now fails closed, and that
part is checkable by inspection exactly as claimed. What does not follow is the sentence the
Turn rests on — that a bash construct nobody has enumerated "arrives as a flag, and so
arrives here". `command cd` never reaches `firstDirArg`, and bare `pushd` reaches it and is
told, correctly, that there is no operand — then the model pushes anyway.

That is not a reason to call the Turn a failure. Four narrowings in, the code is
substantially better than it was at `6c447eb`: the flag surface is genuinely closed, the case
bypass is genuinely closed, and `7cf9693` closed a grant-side escape that three prior
reachability reviews had missed. The honest statement is narrower than the one that has been
made four times, and it is the one I would put in front of the user: **the guard's model of
where a shell is standing is closed against flags and against the two non-flag modes that
were enumerated. It is not closed against constructs that move or reshape the shell's
directory state without being either.** Whether it can ever be closed against those is a
question about a textual classifier's contract, not about this Turn.

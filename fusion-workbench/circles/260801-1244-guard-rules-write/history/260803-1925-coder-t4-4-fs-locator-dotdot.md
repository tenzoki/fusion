# T4-4 — `fs-locator` collapses `..` lexically

**Agent:** coder
**Circle:** `circles/260801-1244-guard-rules-write` — Turn 1, fourth task
**Date:** 260803, 19:00–19:25
**Status:** Complete
**Outcome:** **Fixed.** Three instances, not one; the third was reachable at HEAD.

---

## What was asked

Resolve `260803-1251_p_fs-locator-collapses-dotdot-lexically-…` either by fixing
it or by establishing that fixing it now was the wrong trade and recording that.
Both outcomes were declared acceptable. The issue argued for leaving it: the
defect was unreachable behind gate 0, and closing it would change what
`isStrictlyInside` compares and what `hasHardLinks` passes to `lstat` "for EVERY
path".

## What I decided, and why

Fixed. Both premises of the "leave it" case were measurable, and both were wrong
— in opposite directions, which is why the trade flipped rather than merely
tightened.

### The cost premise (wrong: cheaper than recorded)

`absolute()`'s two call sites are reached only from `resolvesInsideRuleDir`,
which receives `canonicalise(path)` **after** gate 1 has already required
`matchesAny(canonical, ["rules/**", ".claude/rules/**"])`, plus the two literal
`RULE_DIR_ROOTS`. `posix.normalize` can leave a `..` only at the HEAD of a
relative path, and a head-`..` path matches neither pattern.

Measured (`scratchpad/containment.ts`), 24 spellings including
`rules/a/../../rules/x.md`, `x/../rules/x.md`, `rules/..x/y.md`, `rules/...`:

- **0 of 24 put a `..` into what `locate` receives.**
- On the resulting 9-element reachable input set × 4 project roots:
  **0 differences** between `root + "/" + p` and `resolve(root, p)`.

So the fix is a byte-level no-op on everything the exemption can produce. The
issue's binding reason did not hold.

Worth noting for the record: this also means **gate 0 was never the only thing
keeping the cited instance unreachable**, which is how the issue and two
subsequent re-verifications described it. Gate 1's `canonicalise` + `rules/**`
match is a structurally prior barrier, and it is a property of `normalize`'s
output shape rather than a policy anyone might relax.

### The reachability premise (wrong: there was a reachable instance)

Fixing `absolute()` and re-running the probe left two rows still answering
lexically. Chasing the mechanism rather than accepting the issue's explanation
for them ("the kernel has no answer there") found two more collapses:

**Instance 2 — `tryRealpath`'s JS fallback.** Node's `realpathSync` runs
`path.resolve` on its argument before resolving. Verified directly:

```
realpathSync.native("<root>/rules/loop/../x.md")    throws ELOOP
realpathSync       ("<root>/rules/loop/../x.md")    "<root>/rules/x.md"
realpathSync.native("<root>/rules/dangle/../x.md")  throws ENOENT
realpathSync       ("<root>/rules/dangle/../x.md")  "<root>/rules/x.md"
```

Confident answers, inside the rule directory, for paths `open(2)` refuses.
Unreachable like instance 1 — but it meant fixing `absolute()` alone would have
left this issue's headline claim still true of the file.

**Instance 3 — `resolveLocation`'s link expansion. REACHABLE.** A relative
symlink *target* was collapsed with `resolve(dirname(absolutePath), target)`
against a prefix `dirname` does not resolve. The `..` comes out of `readlink`,
so **gate 0 never sees it and `canonicalise` never sees it** — there is no `..`
anywhere in the tool call. Measured (`scratchpad/probe3.ts`):

```
rules/shared             -> <base>/shared-rules       (a shared rule repository)
<base>/shared-rules/gone -> ../sibling/missing.md     (dangling → this branch)

was:  locate("rules/shared/gone") = <base>/project/rules/sibling/missing.md   INSIDE rules/
now:  locate("rules/shared/gone") = <base>/sibling/missing.md                 outside it
```

Gate 2 exists to answer "does this resolve inside a real rule directory". It was
answering yes for a link pointing out of the project. Same escalation class as
the `ln -s ../ rules/up` case the module docstring documents, reached through a
link's own target instead of a spelling. It needs the "`rules/` is a symlink into
a shared repository" configuration that `rules-write-exemption.ts` explicitly
advertises as supported.

This is the finding that settles the task. A decision record saying "leave it,
unreachable" would have been wrong, and wrong in the direction that grants.

## The fix

`hooks/lib/fs-locator.ts` only. One new helper, `joinUncollapsed(dir, path)` —
textual join, trailing-separator guard for the degenerate `dir === "/"` — used at
all three sites, with the resulting path handed to `realpath`. `..` is the
kernel's to interpret.

The JS fallback is additionally declined (`carriesDotDot`) when a `..` remains,
so the one resolver in the file that reads `..` lexically is never the one that
answers.

The surviving `resolve(parentReal, basename(...))` at the bottom is left alone,
sound for the reason T3-1's audit gave: `parentReal` is already a realpath,
`basename` is a single component, no `..` to lose.

## Measurement

Truth column built by **concatenation**, never `resolve()` — the mistake the
original audit caught in itself. 16 rows, 6 planted links, 10 with a kernel
answer (`scratchpad/probe.ts`):

| | before | after |
|---|---|---|
| `locate(<relative>)` vs `realpathSync.native` | 4/10 mismatch | **0/10** |
| `locate(<absolute>)` vs `realpathSync.native` | 0/10 | **0/10** |
| `locate(<relative>)` vs `locate(<absolute>)` | differ on 6 | **agree on all 16** |
| link-expansion probe (instance 3) | 2/2 mismatch | **0/2** |

`rules/loop/../x.md` now returns null on both spellings (fail-closed) where it
returned a confident wrong answer inside the rule directory.

## Tests

Nine cases in `hooks/lib/__tests__/fs-locator.test.ts`, plus two planted fixture
links (`rules/shared` → the shared tree, and a dangling `../sibling/missing.md`
inside it):

- relative/absolute agreement as a property over eight `..` rows
- kernel agreement wherever the kernel has an answer
- parent-of-the-link's-target, through a chain and through `rules/up`
- `..` combined with a missing tail
- the cycle returning null
- the link-target case (instance 3), including that it is not inside `rules/`
- two deliberate no-change pins: `..` between real directories still collapses,
  and `.` / `//` still collapse

**Verified the tests can fail:** reverted all three fixes, re-ran the file —
**7 of 9 fail**, the two pins pass either way, as intended.

`npm test`: **1155 passed, 24 files, green.** Baseline before this task was 1146.

## Residual, unchanged and still accepted

`rules/dangle/../x.md` — a `..` through a *dangling* link — still answers
`<root>/rules/x.md` via the walk-up's re-append, where the kernel refuses the
path outright. No kernel answer to be faithful to, and the write it would
authorise fails at the syscall. This is the residual the issue already named.

## Scope kept

Touched: `hooks/lib/fs-locator.ts`, `hooks/lib/__tests__/fs-locator.test.ts`,
the issue file (`_p_` → `_c_`, resolution note, severity corrected to Medium).

Not touched, as instructed: `hooks/lib/paths.ts`, the working-directory model in
`hooks/lib/bash-mutation-guard.ts`, `260803-1835`, `hooks/lib/rules-write-exemption.ts`
(no signature change was needed). Tracked `hooks/dist/` files restored to HEAD
after the `tsc` runs; the four untracked `dist/` files predate this task. No
commit, no version bump — Plan Step 10 owns both.

## For the orchestrator

Instance 3 was a live grant-side escape at HEAD that neither the issue nor the
two independent reachability re-verifications had found, because all three were
reasoning about `..` in the *caller's spelling* and this one arrives from
`readlink`. If this Circle produces release notes or a security summary, it
belongs there rather than only inside a closed issue. Worth considering whether
the same question — "where else does a `..` enter that is not the caller's
spelling" — is owed to the redirection residual `260803-1835`.

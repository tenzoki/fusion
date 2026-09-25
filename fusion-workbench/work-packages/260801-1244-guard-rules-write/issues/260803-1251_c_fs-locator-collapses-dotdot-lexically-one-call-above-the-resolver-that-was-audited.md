# `realFsLocator.absolute()` collapses `..` lexically, one call above the resolver the audit cleared

---

**Severity:** ~~Low (not reachable today — gate 0 refuses every `..` spelling before `locate` is called)~~
→ **Medium.** Corrected on resolution: the cited instance was indeed unreachable, but fixing it
uncovered a THIRD instance of the same collapse in the same file that WAS reachable at HEAD and
granted a write outside the rule directory. See the resolution note at the foot of this file.
**Status:** Closed 260803-1920 (coder, T4-4) — fixed, measured, tested.
**Domain:** code
**Filed by:** coder, closing `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md` (T3-1) in `260801-1244-guard-rules-write`
**Affects:** `hooks/lib/fs-locator.ts` — `absolute` (the cited instance), `tryRealpath`'s JS
fallback, and `resolveLocation`'s link expansion (the reachable one)
**Cross-references:** `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md`
(its **direction 2**, "resolve the path as spelled"), `hooks/lib/fs-locator.ts:91-122`
(`resolveLocation`, audited clean), `hooks/lib/rules-write-exemption.ts` `## Gate 0`

---

## What the audit was asked, and what it found

T3-1 was asked to audit `resolveLocation` for "its own lexical `resolve()`/`dirname` use on
the non-existent tail" — the prerequisite the issue named for direction 2. Measured against
`realpathSync.native` on paths built by concatenation (never by `resolve`, which collapses
`..` and would have made the truth column agree with the bug):

**`resolveLocation` is kernel-faithful.** Handed an already-absolute path carrying a `..`
through a symlink, it answers exactly what the kernel answers, 11 of 13 rows:

```
  rules/up/../agents/coder.md        -> <tmp>/agents/coder.md      == kernel
  rules/b/../agents/coder.md         -> <root>/agents/coder.md     == kernel
  rules/a/../hooks/config.json       -> <root>/hooks/config.json   == kernel
  rules/abs/../settings.json         -> <root>/settings.json       == kernel
  rules/up/..                        -> <tmp>                      == kernel
  rules/up/../agents/brand-new.md    -> <tmp>/agents/brand-new.md  == kernel   (missing tail)
```

Its `dirname` walk-up keeps a mid-path `..` intact and re-`realpath`s at each level, and the
one lexical step — `resolve(parentReal, basename)` — operates on a path that either is
already a realpath (whose lexical parent IS its kernel parent, since a realpath contains no
symlinks) or on a component proven not to exist (which cannot redirect anything). The
premise direction 2 rested on checks out.

**`absolute()` is not.** One call above it:

```ts
const absolute = (path: string): string =>
  isAbsolute(path) ? path : resolve(root, path);     // <- `resolve` collapses `..`
```

`node:path.resolve` is `normalize` with a root prepended. So a *relative* path — which is
what both guard surfaces hand the exemption — has its `..` deleted here, lexically, before
`resolveLocation` sees a thing. The same 13 rows through `locate(<relative>)` instead of
`locate(<absolute>)`: **9 of 13 disagree with the kernel**, every one of them a `..` row.

```
  locate("rules/up/../agents/coder.md")  -> <root>/rules/agents/coder.md
  kernel                                 -> <tmp>/agents/coder.md
```

## Why it is filed rather than fixed

Two reasons, and the second is the binding one.

1. **It is not reachable.** Gate 0 (this Turn's fix) refuses any spelling containing a `..`
   segment before `resolvesInsideRuleDir` runs, so no `..` ever arrives at `locate` from the
   exemption. Every measured escape denies on both surfaces.
2. **Closing it is not small.** `absolute()` would have to become string concatenation, and
   `resolve` is doing three jobs there, not one: it also collapses `.` and repeated
   separators. Changing it changes what `isStrictlyInside` compares and what `hasHardLinks`
   passes to `lstat`, for EVERY path, in order to fix a class that is already closed one
   layer up. T3-1's brief was explicit — if closing it needs reasoning about a resolver that
   has already been wrong once, file it rather than do it here.

## What it costs to leave open

Nothing behaviourally, today. What it costs is that direction 2 is now known to be strictly
larger than the issue estimated: "hand `FsLocator.locate` the path as spelled" does not work
by itself, because the locator un-spells it. Anyone who later wants `..` to be legal in a
rule path — the only scenario in which direction 2 buys anything — has to fix `absolute()`
first, and the fix is not a one-liner.

## Reproduction

`probe-resolver.ts` from the T3-1 session: builds a temp tree with six planted links,
compares `locate(<relative>)` and `locate(<absolute>)` against `realpathSync.native` on
concatenated paths. Both mismatch counts above are its verbatim output. The two rows that
disagree in the ABSOLUTE column are `rules/dangle/../x.md` and `rules/loop/../x.md` — paths
the kernel refuses entirely (ENOENT through a dangling link, ELOOP through a cycle), where
there is no kernel answer to be faithful to and the write the resolver's answer would
authorise fails at the syscall anyway.

---

**Reconciliation 260803-1516 (reconciler, domain `code`) — stays `_o_`. Confirmed present and still unreachable at HEAD `fa81589`.**

The cited defect is where the issue says it is. `hooks/lib/fs-locator.ts:129-130`:

```ts
const absolute = (path: string): string =>
  isAbsolute(path) ? path : resolve(root, path);
```

Unchanged by any of this session's seven commits.

**The reachability claim survives the Turn 3 review finding, which is not obvious and was checked.** `260803-1431_*_gate-0-misses-the-dotdot-in-a-cd-p-operand-…` shows a `..` reaching past gate 0 through a `cd -P` operand, which reads like it would also deliver a `..` here. It does not. On that route the `..` is consumed by `resolveDir` (`hooks/lib/bash-mutation-guard.ts:1143`) before `Target.spelled` is built, so the path handed to `isProjectRulePath` — and from there to `locate` — carries no `..` at all. The `cd -P` gap makes the grant wrong; it does not make this resolver reachable. Both defects are the same class and they are not the same defect.

**Severity confirmed Low.** Nothing behavioural depends on it today, and the cost of leaving it open is the one the issue already states: direction 2 of `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md` is larger than that issue estimated.

---

**Resolved 260803-1920 (coder, T4-4) — FIXED. Severity was understated: one of the three instances was reachable at HEAD and granted a write outside the rule directory.**

T4-4 was asked to decide between fixing this and recording that fixing it was the
wrong trade. The trade was measured rather than argued, and both premises the
"leave it" case rested on turned out to be wrong — in opposite directions.

**The cost premise was wrong (it is cheaper than recorded).** The issue's binding
reason was that `absolute()` becoming concatenation "changes what
`isStrictlyInside` compares and what `hasHardLinks` passes to `lstat`, for EVERY
path". It does not. Both call sites are reached only from `resolvesInsideRuleDir`,
which is handed `canonicalise(path)` *after* gate 1 has required it to match
`rules/**` or `.claude/rules/**`, plus the two literal `RULE_DIR_ROOTS`.
`posix.normalize` leaves a `..` only at the HEAD of a relative path, and a
head-`..` path matches neither pattern. Measured over the whole reachable input
set: **9 relative inputs x 4 roots, 0 differences** between concatenation and
`resolve(root, p)`. The change is a byte-level no-op on everything the exemption
can produce.

**The reachability premise was wrong too (there was a third instance, and it was
reachable).** Fixing `absolute()` exposed two more lexical collapses in the same
file, both found by measurement:

2. **`tryRealpath`'s JS fallback.** Node's own `realpathSync` runs `path.resolve`
   on its argument before resolving anything, so where the native call throws it
   answers confidently on a collapsed path. Verified directly:
   `realpathSync.native("<root>/rules/loop/../x.md")` throws `ELOOP` while
   `realpathSync(...)` returns `<root>/rules/x.md` — a real file, inside the rule
   directory, for a path `open(2)` refuses. Unreachable, same as instance 1, but
   it meant a fix to `absolute()` alone would have left the headline claim of
   this issue still true.

3. **`resolveLocation`'s link expansion — REACHABLE, and a grant-side escape.**
   A relative symlink *target* was collapsed with `resolve(dirname(absolutePath),
   target)` against a prefix that `dirname` does not resolve. The `..` here comes
   out of `readlink`, not out of the caller's spelling, so **gate 0 never sees it
   and `canonicalise` never sees it**. Measured on a planted tree:

   ```
   rules/shared            -> <base>/shared-rules          (a shared rule repo)
   <base>/shared-rules/gone -> ../sibling/missing.md       (dangling)

   was:  locate("rules/shared/gone") = <base>/project/rules/sibling/missing.md   INSIDE rules/
   now:  locate("rules/shared/gone") = <base>/sibling/missing.md                 outside it
   ```

   The old answer told gate 2 the write landed on a rule file when it landed
   outside the project. That is the same escalation class as the
   `ln -s ../ rules/up` case the module docstring already documents, reached
   through a link's own target instead of through a spelling, and it needs the
   "`rules/` is a symlink into a shared repository" configuration that
   `rules-write-exemption.ts` explicitly advertises as supported. It required no
   `..` in any tool call.

**The fix.** All three joins go through one helper, `joinUncollapsed`, and the
resulting path is handed to `realpath` — `..` is the kernel's to interpret. The
one surviving `resolve` is `resolve(parentReal, basename(...))`, sound for the
reason T3-1's audit gave: `parentReal` is already a realpath and `basename` is a
single component, so there is no `..` to lose.

**Measurement.** Probe rebuilt with the truth column by **concatenation**, never
`resolve()` (the mistake the original audit caught in itself). 16 rows, 6 planted
links, 10 with a kernel answer:

| | before | after |
|---|---|---|
| `locate(<relative>)` vs `realpathSync.native` | 4/10 mismatch | **0/10** |
| `locate(<absolute>)` vs `realpathSync.native` | 0/10 | **0/10** |
| `locate(<relative>)` vs `locate(<absolute>)` | differ on 6 rows | **agree on all 16** |
| link-expansion probe (instance 3) | 2/2 mismatch | **0/2** |

`rules/loop/../x.md` now returns null on both spellings — fail-closed — where it
returned a confident wrong answer inside the rule directory.

**Tests.** Nine cases added to `hooks/lib/__tests__/fs-locator.test.ts`: a
relative/absolute agreement property over eight `..` rows, kernel agreement
wherever the kernel has an answer, the parent-of-the-target cases, the missing
tail combined with `..`, the cycle returning null, the link-target case for
instance 3, and two deliberate no-change pins (`..` between real directories, and
`.`/`//` still collapsing). Verified by reverting all three fixes and re-running:
**7 of the 9 fail against the old code**, the two pins pass either way, as
intended. `npm test` green at **1155** (baseline 1155 − 9 = 1146).

**Residual, unchanged and still accepted.** `rules/dangle/../x.md` — a `..`
through a *dangling* link — still answers `<root>/rules/x.md` via the walk-up's
re-append, where the kernel refuses the path outright. There is no kernel answer
to be faithful to and the write it would authorise fails at the syscall.

**Direction 2 of `260802-2330_*_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md` is now unblocked**, which was the stated cost of
leaving this open: `FsLocator.locate` now honours its documented contract for a
`..`-carrying path in both the relative and the absolute form.

**Affected:** `hooks/lib/fs-locator.ts` (`joinUncollapsed` added; `absolute`,
`tryRealpath`, `resolveLocation` link expansion), `hooks/lib/__tests__/fs-locator.test.ts`.
No other file changed; `hooks/lib/paths.ts` and `hooks/lib/bash-mutation-guard.ts`
were out of scope and were not touched.

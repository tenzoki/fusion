# `realFsLocator.absolute()` collapses `..` lexically, one call above the resolver the audit cleared

---

**Severity:** Low (not reachable today — gate 0 refuses every `..` spelling before `locate` is called)
**Domain:** code
**Filed by:** coder, closing `260802-2330` (T3-1) in `circles/260801-1244-guard-rules-write`
**Affects:** `hooks/lib/fs-locator.ts:129-130` (`absolute`)
**Cross-references:** `260802-2330_c_the-lexical-dotdot-collapse-erases-the-symlink-gate-2-was-added-to-resolve.md`
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

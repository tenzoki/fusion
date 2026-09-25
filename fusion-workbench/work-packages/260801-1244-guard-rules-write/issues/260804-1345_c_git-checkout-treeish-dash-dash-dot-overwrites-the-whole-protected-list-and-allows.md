# `git checkout <treeish> -- .` overwrites the whole protected list and allows

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `hooks/lib/bash-mutation-guard.ts:914-936` (`gitCheckoutWrites`), `:1557-1568` (`ancestorOfProtected`, the project-root exclusion at `:1562`); `rules/protected-path-discipline.md:81-104` (the `checkout` row and its two stated costs, which do not name this one)
**Kind:** Not a regression — `git checkout` was in no table before `613d6fd`, so this allowed then too. It is NEW as an **uncovered case inside a row that is now presented as covering the operation**, and the residual list does not carry it.
**Cross-references:**
`260804-1026_*_…` (the finding `613d6fd` closed; this is the part of it that did not close),
`260804-1323_*_…` (`## The second question` — the two stated costs),
`260804-1346_*_…` (the same root-pathspec hole on `git clean`, filed separately because the verb and the fix differ).

---

## What is wrong

`gitCheckoutWrites` returns the positionals after the tree-ish, so
`git checkout HEAD~1 -- .` returns `["."]`. At the project root `.` normalises to `.`,
`isProtected(".")` is false, and `ancestorOfProtected` returns null because it excludes the
root deliberately (`:1562`: `if (base.length === 0 || base === "." || base === "/") return null;`).

That exclusion is correct for the verbs it was written for. `cp x .` writes *into* the root
without destroying it, and `rm -rf .` is refused by `rm`. It is wrong for
`git checkout <treeish> -- <pathspec>`, which does not write the directory — it writes
**every tracked file underneath it**, protected ones included, from an arbitrary commit.

## Measured

Real guard subprocess, one fresh project per verdict; one fresh two-commit repository per
effect, `rules/x.md` differing between the commits. bash 3.2 and zsh 5.9, git 2.49.0.
`CHANGED` means the watched file's content was replaced.

```
guard   bash      zsh       command                              watch
ALLOW   CHANGED   CHANGED   git checkout HEAD~1 -- .             rules/x.md
ALLOW   CHANGED   CHANGED   git checkout HEAD~1 -- ./            rules/x.md
ALLOW   CHANGED   CHANGED   git checkout HEAD~1 -- '*'           rules/x.md
ALLOW   CHANGED   CHANGED   git restore --source=HEAD~1 .        rules/x.md
```

The controls, same harness — the row does work when the pathspec names the directory:

```
block   CHANGED   CHANGED   git checkout HEAD~1 -- rules         rules/x.md
block   CHANGED   CHANGED   git restore --source=HEAD~1 rules    rules/x.md
ALLOW   UNCHANGED UNCHANGED git checkout HEAD -- .               rules/x.md
```

The last row is correct and must stay: `HEAD` is the revert strategy and writes nothing an
agent could not have obtained by leaving the file alone.

`git restore --source=HEAD~1 .` is the **pre-existing sibling** — it has allowed since
`restore` joined the table. It is listed here because any fix has to cover both spellings or
it recreates the asymmetry `260804-1026_*_git-checkout-treeish-overwrites-a-protected-path-and-is-in-neither-the-verb-table-nor-the-residual-list.md` was filed about.

The `'*'` row is the documented glob residual and is correctly out of scope
(`rules/protected-path-discipline.md`, "Glob and brace expansion are matched as literal
text"). The `.` and `./` rows are not: they name a directory the ancestor check can compare
perfectly well, and it declines to.

## Why this is the same defect `613d6fd` fixed for `clean`, in the other direction

`613d6fd` found that `git clean -fdx` names an operand it does not spell (`.`) and supplied
it, so the ancestor check could see it. `checkout` and `restore` spell the `.` out and the
ancestor check throws it away. Both are "the root pathspec is not compared"; one was closed
by supplying the operand, the other is open because the comparison refuses it.

## Recommendation

Do not remove the root exclusion from `ancestorOfProtected` — `cp x .` and `mv build/out.js .`
depend on it, and it is uniform across written operands on purpose.

The distinction that is actually being drawn is **write-the-directory** versus
**write-through-the-directory**. `cp`, `mv`, `rm` and `ln` write the named entry;
`git checkout <treeish> --`, `git restore --source=`, and (for untracked files) `git clean -f`
write every path underneath it. That is a property of the verb, so it belongs on `VerbSpec`
as one field — something like `writesThrough: true` — consulted by pass 2 to skip the root
exclusion for those rows and only those rows.

One field on the three rows that need it is cheaper than a fourth special case, and it is
checkable by reading the table. State the cost as a rule: a `writesThrough` verb whose
pathspec resolves to the project root denies, so `git checkout HEAD~1 -- .` needs the
literal file list or the Human Gate.

## Test coverage this needs

- the four `ALLOW` rows above as denies, with the real-shell effect asserted, bash and zsh;
- `git checkout HEAD -- .` pinned as an **allow with its effect asserted UNCHANGED**, so a
  fix cannot be a blanket deny on the revert strategy;
- `git checkout HEAD~1 -- build` and `git restore --source=HEAD~1 build` pinned as allows,
  so the fix does not deny an unprotected subtree;
- `cp x .` and `mv build/out.js .` pinned as allows, so the root exclusion is not removed
  wholesale.

## Anti-vacuity

Every row above allows at `613d6fd` and every one changes the file in both shells, so none
can pass vacuously. A mutation that drops `writesThrough` from the `checkout` row must fail
the `checkout HEAD~1 -- .` row and no other; one that removes the root exclusion outright
must fail the `cp x .` allow row.

---

**Resolved:** 2026-08-04, `coder`, plan Step 3. Taken as recommended: a
`writesThrough` field on `VerbSpec`, set on `git checkout`, `git restore` and
`git clean` and on nothing else, consulted by pass 2 to lift the project-root
exclusion for those rows. The exclusion itself is untouched, so `cp x .` and
`mv build/out.js .` still allow — both pinned with their real-shell effect.

Three `ALLOW` rows now deny with the effect asserted in bash and zsh
(`git checkout HEAD~1 -- .`, `-- ./`, `git restore --source=HEAD~1 .`). The `'*'`
row stays allowed and is re-asserted as the documented glob residual, so the
change cannot be read as having closed it. `git checkout HEAD -- .` stays allowed
and is pinned with the effect that it really does revert a dirtied file, in both
shells — not merely "unchanged in a clean tree", which would pass against a guard
that had broken the command some other way.

**One thing the recommendation did not anticipate, and it decides the design.**
A git invocation is checked against a UNION of directories — the shell's own plus
whatever `-C`/`--work-tree` name — so that a directory flag cannot argue away a
protected path spelled in the command. Lifting the root exclusion for every
candidate would have denied `git -C build clean -fdx`, whose modelled `.`
resolves to the root at the shell's base although git cleans `build` and nothing
else. That row is pinned as an allow in both suites and is named as a control in
`260804-1346_*_git-clean-fdx-at-the-project-root-is-still-a-residual-and-its-residual-entry-was-deleted.md`. So `writesThrough` is consulted only at `gitEffectiveBase` — the
directory the invocation actually runs in. The union is unweakened: a protected
path spelled in the command still denies however the flags point.

The deny also earned its own reason. `ancestorReason` says removing or moving the
directory would take the protected path with it, which is what `rm -rf hooks`
does and is not what `checkout` does — it leaves every directory in place and
replaces the contents. `writesThroughReason` names the real mechanism and the
real way through (the literal file list). Same class as `260804-1347_*_the-git-directory-fail-closed-deny-tells-the-agent-to-drop-a-cd-that-is-not-in-the-command.md`.

Measured against a generated cross-product of 181,115 commands, baseline
`f82ac02`: **0 newly allowed**; 1,174 newly denied, every one a `writesThrough`
verb whose pathspec resolves to the project root.

Anti-vacuity, run, exactly as this record specifies: dropping `writesThrough`
from the `checkout` row fails the `checkout HEAD~1 -- .` rows and the table-shape
assertion and NOTHING else — no `restore` row, no `clean` row, no allow row.
Removing the root exclusion outright fails the `cp x .` row, along with 17 others.

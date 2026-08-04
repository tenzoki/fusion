# `git checkout <treeish> -- .` overwrites the whole protected list and allows

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `hooks/lib/bash-mutation-guard.ts:914-936` (`gitCheckoutWrites`), `:1557-1568` (`ancestorOfProtected`, the project-root exclusion at `:1562`); `rules/protected-path-discipline.md:81-104` (the `checkout` row and its two stated costs, which do not name this one)
**Kind:** Not a regression — `git checkout` was in no table before `613d6fd`, so this allowed then too. It is NEW as an **uncovered case inside a row that is now presented as covering the operation**, and the residual list does not carry it.
**Cross-references:**
`issues/260804-1026_c_…` (the finding `613d6fd` closed; this is the part of it that did not close),
`decisions/260804-1323_i_…` (`## The second question` — the two stated costs),
`issues/260804-1346_o_…` (the same root-pathspec hole on `git clean`, filed separately because the verb and the fix differ).

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
it recreates the asymmetry `260804-1026` was filed about.

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

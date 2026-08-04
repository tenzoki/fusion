# `git clean -fdx` at the project root is still a residual, and its residual entry was deleted rather than narrowed

---

**Severity:** Medium
**Domain:** code (documentation of a security control)
**Filed by:** coderev, review of `613d6fd`
**Affects:** `rules/protected-path-discipline.md:127-130` (the new claim) and `:655-662` (where the residual entry used to be); `README-hooks.md` (the same pair); `hooks/lib/bash-mutation-guard.ts:864-866` (`gitCleanWrites`) and `:1562` (the root exclusion)
**Kind:** NEW in `613d6fd`. The behaviour is unchanged at the project root; what changed is that the residual entry naming it was removed.
**Cross-references:**
`issues/260804-1345_o_…` (the same root-pathspec hole on `checkout` / `restore`, where it fails open on TRACKED files — that one is the High),
`decisions/260804-1323_i_…` (`## Answer`, third bullet, where the old entry is called "wrong about git").

---

## What is wrong

`613d6fd` found that the residual entry

> A `git clean -fdx` with **no path operand** is allowed for the same reason `rm -rf *` is:
> it names no directory the ancestor check can compare.

was wrong, and it was — for `cd rules && git clean -fdx` and `git -C rules clean -fdx`, both
of which now deny correctly. But the commit **deleted the entry** and replaced it with a
sentence in the affirmative section:

> `rules/protected-path-discipline.md:129-130` — "while a plain `git clean -fdx` at the
> project root still allows."

At the project root the model's supplied `.` resolves to the root, the root is excluded from
the ancestor check on purpose (`:1562`), and the command deletes every untracked file in the
tree — including untracked files under `rules/**` and `agents/**`. That is the same residual
the deleted entry described, narrowed from "always" to "at the project root", and it is now
presented to the reader as a **cost control** rather than as a gap.

## Measured

Real guard subprocess, one fresh project per verdict; one fresh repository per effect with
`rules/untracked.md` and `build/untracked.js` present. bash 3.2 and zsh 5.9, git 2.49.0.

```
guard   bash   zsh    command                  watch
ALLOW   GONE   GONE   git clean -fdx .         rules/untracked.md
ALLOW   GONE   GONE   git clean -fdx           build/untracked.js
```

The controls that show the row does work once the directory is named:

```
block   GONE   GONE   cd rules && git clean -fdx     rules/untracked.md
block   GONE   GONE   git -C rules clean -fdx        rules/untracked.md
```

Note the first row: `git clean -fdx .` carries an **explicit** `.` positional, so
`gitCleanWrites` never supplies its implicit one — the explicit and implicit spellings of the
same command take different code paths to the same allow.

## Why it matters more than the delta suggests

The reach is untracked files only, which bounds it: `git clean` never removes a tracked file,
so a committed rule is safe. What is not bounded is a rule file an agent has just written
under `FUSION_ALLOW_RULES_WRITE` and not yet committed — exactly the workflow this Circle
exists to enable — which a later `git clean -fdx` in the same session removes with the guard
allowing.

The second cost is the one this Circle has been paying attention to: an honest residual list
is the thing the boundary sentence rests on. An entry that was half wrong should be narrowed,
not removed, or the next reader concludes the case is covered.

## Recommendation

Two edits, no code change required for the documentation half:

1. Restore the residual entry, narrowed and with the explicit spelling named:
   *"`git clean -fdx` and `git clean -fdx .` **at the project root** delete every untracked
   file in the tree, protected directories included, and allow — the root is excluded from
   the ancestor check on purpose (`cp x .`). From any other directory, and under any `-C`,
   the command denies."*
2. If the code half is taken, it is the same `writesThrough` field
   `issues/260804-1345_o_…` recommends: `clean -f` writes through its pathspec, so the root
   exclusion should not apply to it either. Doing both in one pass is cheaper than twice, and
   they share the test.

## Test coverage this needs

- `git clean -fdx .` and `git clean -fdx` pinned with their **current** verdict and their
  real-shell effect, so the pair is visible in the suite rather than only in prose;
- if the code half lands, both as denies, with `git clean -fdx build` and `git -C build
  clean -fdx` pinned as allows.

## Anti-vacuity

Both rows allow at `613d6fd` and both delete the watched file in both shells. A
documentation-only fix cannot be pinned by a test; the two verdict rows above are what stops
the prose and the behaviour drifting again.

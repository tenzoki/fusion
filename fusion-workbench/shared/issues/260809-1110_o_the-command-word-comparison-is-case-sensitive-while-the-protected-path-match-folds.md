# The command-word comparison is case-sensitive while the protected-path match folds

---

**Severity:** Medium — one capital letter passes the branch policy on a case-insensitive filesystem
**Domain:** code (security control)
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/lib/git-branch-guard.ts:166` (`invocation.name !== "git"`)
**Cross-references:**
`fusion-workbench/shared/analyses/260809-1103-guard-enforced-policies.md` §Findings 2b-3,
`hooks/guard.ts:615-622` (the sibling decision, taken the other way, for the protected-path match)

---

## What is wrong

`classifySegment` decides whether a segment is a git call by comparing the resolved command word against the literal `"git"`, case-sensitively. On a case-insensitive filesystem the shell resolves `GIT` to the same binary, so the spelling changes the guard's verdict and nothing else.

The protected-path half of the same hook took the opposite decision deliberately, and documented why:

> `matchesAnyFolded`, not `matchesAny`: the match folds case on both sides. A glob compiles to a case-SENSITIVE regex, so `AGENTS/coder.md` missed `agents/**` and wrote `agents/coder.md` on any case-insensitive filesystem — the whole protected list, one letter.
> — `hooks/guard.ts:617-622`

The identical argument applies to the command word, and was not carried across.

## Measured

Classifier, work-tree build:

```
DENY    git switch main         (control)
allow   GIT switch main
allow   Git switch main
allow   gIt worktree add ../w x
```

Command resolution on the machine this was measured on (macOS, APFS, the default case-insensitive configuration):

```
$ zsh -c 'GIT --version'    git version 2.49.0
$ bash -c 'GIT --version'   git version 2.49.0
```

Both shells resolve the capitalised spelling to git. `inference:` that `GIT switch <branch>` therefore moves HEAD; I did not run it, because doing so would have meant working around a live deny in this repository, which `rules/git-branch-discipline.md:45` forbids. The two facts above are each measured.

## Bound

The defect is filesystem-dependent, not universal. On a case-sensitive volume `GIT` does not resolve and the allow is correct. That makes it a portability defect of exactly the kind `hooks/guard.ts:615-622` names: the boundary differs by filesystem, and the fix there was to fold unconditionally on every platform so it does not.

## Suggested direction

Fold the command word once, where it is resolved, not at each comparison. `programName` in `hooks/lib/command-word.ts:196-199` already normalises the path away and is the natural place; folding there gives every future consumer the same answer.

Folding the command word cannot widen an allow. It can only make more segments resolve to a known program name, and every table the resolved name is compared against is a deny table.

`Invocation.name` is currently the basename as spelled. If a consumer ever needs the original spelling, add a field rather than leaving the comparison case-sensitive.

## Acceptance criteria

- [ ] `GIT switch main`, `Git switch main` and `gIt worktree add x y` all deny.
- [ ] `/usr/bin/GIT switch main` and `\GIT switch main` deny.
- [ ] Non-git programs are unaffected: `RM -rf x` resolves to the name `rm` and changes no verdict, since the branch policy holds no `rm` row.
- [ ] A test states the filesystem dependency, so the case is not read as unreachable on a case-sensitive volume.

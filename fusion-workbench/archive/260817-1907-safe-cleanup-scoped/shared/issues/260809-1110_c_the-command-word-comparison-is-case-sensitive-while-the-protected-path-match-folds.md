# The command-word comparison is case-sensitive while the protected-path match folds

---

**Severity:** Medium — one capital letter passes the branch policy on a case-insensitive filesystem
**Domain:** code (security control)
**Filed by:** analyst, during the guard-enforced-policies analysis
**Affects:** `hooks/lib/git-branch-guard.ts:166` (`invocation.name !== "git"`)
**Cross-references:**
`260809-1103-guard-enforced-policies.md` §Findings 2b-3,
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

---

**Reconciliation 260809-1651-reconciliation.md (reconciler, domain `code`) — stays `_o_`. Checked because this session rewrote the file it names.**
`hooks/lib/git-branch-guard.ts` was rewritten in `9716ee5` (steps 2 and 3 of `260809-1229_*_plan-five-severe-guard-defects.md`), which touched `classifyCheckout` and the global-option walk and left the command-word comparison alone. `programName` in `hooks/lib/command-word.ts` still returns the basename as spelled, and no fold happens at the comparison. All four acceptance criteria remain unmet. `rules/git-branch-discipline.md` `## Why` now names this record explicitly as a measured defect inside the command form the classifier does classify, which is a documentation change and not a code one.

---
Resolved: `programName` in `hooks/lib/command-word.ts` now folds the resolved command word
with `toLowerCase` (not `toLocaleLowerCase`, so a Turkish locale cannot move the boundary by
lowering `GIT` to a dotless `gıt`). The fold is unconditional on every platform, matching the
decision the protected-path half already took at `matchesAnyFolded`. The comparison at
`hooks/lib/git-branch-guard.ts:241` is unchanged and now carries a note that the fold happens
upstream and must not be re-cased there.

Checked rather than assumed, that folding cannot widen an allow: `Invocation.name` has exactly
one production consumer, and the two tables reading the resolved name are a deny table (the git
row) and a skip table whose only effect is to expose an inner command word to that same deny
table. No name appears in both, so nothing can be hidden by folding. Three sites deliberately
keep the raw word: `GRAMMAR_PREFIXES` and the environment-assignment match, because bash
reserved words are case-sensitive and `IF` is not `if`; and `reachesBuiltin`, where the path is
the whole question.

Measured after: `GIT switch main`, `Git switch main`, `gIt worktree add x y`,
`/usr/bin/GIT switch main`, `\GIT switch main`, `"GIT" switch main` and `SUDO git switch main`
all deny; `RM -rf x`, `npm test`, `GIT status` and `GIT checkout HEAD -- foo.go` all allow.
1128 tests green. The corpus fixture carries no upper-case spelling, so no baseline verdict moved.

Consequence left standing on purpose: `rules/git-branch-discipline.md` `## Why` still describes
this defect as measured and open, which is now false. That file is rewritten once, against the
finished classifier, by `260809-1226_*_the-rule-still-promises-a-branch-switch-cannot-be-smuggled-into-a-compound-command.md`.

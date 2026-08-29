# Fold the command word, so a capitalised `GIT` cannot pass the branch policy

**Status:** Complete
**Agent:** coder
**Task:** tasklist task 3, `I:260809-1110-casefold`
**Source record:** `260809-1110_*_the-command-word-comparison-is-case-sensitive-while-the-protected-path-match-folds.md`

---

## What was wrong

`classifySegment` (`hooks/lib/git-branch-guard.ts`) decided a segment was a git
call by comparing the resolved command word against the literal `"git"`,
case-sensitively, and `programName` (`hooks/lib/command-word.ts`) returned the
basename as spelled. On a case-insensitive filesystem the shell resolves `GIT` to
the same binary, so the spelling alone flipped the verdict. Reproduced against
the work-tree build before touching anything:

```
DENY    git switch main         (control)
allow   GIT switch main
allow   Git switch main
allow   gIt worktree add ../w x
```

The protected-path half of the same hook had taken the opposite decision
deliberately and written the argument down at `matchesAnyFolded` (`hooks/guard.ts`
CHECK 2, `hooks/lib/paths.ts`): a glob compiles to a case-sensitive regex, so
`AGENTS/coder.md` missed `agents/**` — the whole protected list, one letter. The
argument transfers unchanged to the command word and had simply never been
carried across.

## What was done

One line of behaviour: `programName` lowercases the basename it returns.

```ts
export function programName(word: string): string {
  const slash = word.lastIndexOf("/");
  const base = slash === -1 ? word : word.slice(slash + 1);
  return base.toLowerCase();
}
```

Folded at the RESOLUTION point, not at the comparison, so every consumer of a
resolved name gets the same answer and the next table cannot rediscover the
defect. `git-branch-guard.ts:241` therefore keeps its plain `!== "git"` and gained
only a comment saying the fold is upstream and must not be re-cased here.

`toLowerCase` rather than `toLocaleLowerCase`, for the reason `foldCase` in
`lib/paths.ts` already gives: the Unicode default mapping is the same everywhere,
the locale-sensitive one is not — under a Turkish locale `GIT` lowers to a
dotless `gıt`. A security boundary must not move with `LANG`.

Unconditional on every platform, matching the user's decision for the path side
(`260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md`):
a boundary that differs by filesystem has to be re-stated in every document that
describes it and is discovered rather than known. The over-deny it accepts costs
close to nothing here — on a case-sensitive volume `GIT` resolves to no binary at
all, so the command the guard now denies would have failed with "command not
found".

## Why folding cannot widen an allow

Checked against every consumer of the resolved name rather than assumed. Two
tables read it, and neither grants anything:

- **the git row in `git-branch-guard.ts`** — a deny table. Folding can only make
  more segments match it, never fewer.
- **`WRAPPER_PROGRAMS` in `command-word.ts`** — a skip table whose only effect is
  to expose an inner command word to that same deny table (`SUDO git switch main`
  → `git switch main`). Folding it can only expose more inner words. It cannot
  hide a denied one, because no name in `WRAPPER_PROGRAMS` is also a denied name:
  `git` is not a wrapper, and the branch policy has no other row. If a future
  edit ever puts one name in both tables, that argument stops holding and has to
  be re-made.

Three things deliberately do NOT fold, and each would have been wrong to:

- `GRAMMAR_PREFIXES` and `ENV_ASSIGNMENT_RE` in `findCommandWord`, which read the
  raw word. Bash reserved words are case-sensitive — `IF` is not `if` — so
  folding there would skip a word the shell treats as a program.
- `reachesBuiltin`, which reads the raw word because the path is the whole
  question there. It is unaffected. A wrapper that now resolves (`SUDO`) sets
  `viaWrapper`, which makes the field `false` — the give-up direction its own
  docstring requires, and nothing reads it today.
- the exemption side of the protected-path check, which stays case-sensitive for
  the reason `paths.ts` states: folding a grant widens it.

Grep confirms `Invocation.name` has exactly one production consumer,
`git-branch-guard.ts:241`, plus the internal `WRAPPER_PROGRAMS` lookup. No
consumer needs the spelling as typed, so no second field was added; the interface
doc says a future one gets a field rather than a case-sensitive comparison.

## Measured after

```
DENY   git switch main            DENY   /usr/bin/GIT switch main
DENY   GIT switch main            DENY   \GIT switch main
DENY   Git switch main            DENY   "GIT" switch main
DENY   gIt worktree add x y       DENY   SUDO git switch main
allow  RM -rf x                   allow  GIT status
allow  npm test                   allow  GIT checkout HEAD -- foo.go
```

All four acceptance criteria met.

## The test

`hooks/lib/__tests__/git-branch-guard.test.ts`, one new describe of eight cases,
placed beside "the command word cannot be hidden" because it is the same theme.

Its header states the filesystem dependency as a bound rather than leaving it to
be re-derived: a reader on a case-sensitive volume would otherwise read the whole
block as testing a command nobody can run. It names both sides — the measured
`zsh -c 'GIT --version'` / `bash -c 'GIT --version'` resolution on the
case-insensitive default, and the "command not found" over-deny on a
case-sensitive one — and says why the rows are asserted on both: the fold is
unconditional precisely so the boundary does not move with the volume the suite
runs on, and a suite that skipped these rows on a case-sensitive checkout would
stop testing the property exactly where it is hardest to notice.

One case asserts `programName` directly. That is the anti-regression pin: it
fails if the fold is ever moved back down to the classifier's own comparison,
before any verdict does.

The corpus fixture (`git-corpus-451a07e.json`) is untouched and was not
regenerated. It carries no upper-case spelling, so no baseline verdict moves;
both corpus directions stay green.

## Scope kept

Tasks 4 (heredoc bodies) and 6 (attached-value global options) also edit
`git-branch-guard.ts` and this test file. Neither was absorbed. The new describe
is self-contained, so it should not collide with either.

## Consequence for task 10

`rules/git-branch-discipline.md` `## Why` names `260809-1110_*_the-command-word-comparison-is-case-sensitive-while-the-protected-path-match-folds.md` as a measured defect
standing open. That sentence is now false. The file was NOT edited here — task 10
rewrites it last, against the finished classifier.

## Files changed

- `hooks/lib/command-word.ts` — the fold in `programName`, plus its argument and
  the `Invocation.name` doc
- `hooks/lib/git-branch-guard.ts` — comment only: the fold is upstream, do not
  re-case the comparison here
- `hooks/lib/__tests__/git-branch-guard.test.ts` — one new describe, eight cases
- `hooks/dist/**` — rebuilt

`npm test` in `hooks/`: 35 files, 1128 tests, all passing.

Not committed: the orchestrator commits under the commit lock. The source record
was left at `_p_` and un-renamed, as the dispatch instructed.

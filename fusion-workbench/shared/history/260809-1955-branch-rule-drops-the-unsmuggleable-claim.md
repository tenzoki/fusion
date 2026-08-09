# Session: the branch rule stops promising what segmentation cannot deliver

**Date:** 2026-08-09 19:55
**Agent:** coder
**Status:** Complete

## What was asked

Task 10 of `fusion-workbench/tasklist.md` (`I:260809-1226-overclaim`), from
`shared/issues/260809-1226_p_the-rule-still-promises-a-branch-switch-cannot-be-smuggled-into-a-compound-command.md`.
Last in its queue on purpose: it is rule text written against a classifier that changed
four times in the two hours before it (`15eacb0`, `69a2d00`, `378b80a`, `b2e3d12`), and
writing it earlier would have described a guard that was about to move.

Scope: `rules/git-branch-discipline.md` only, plus the golden fixture that records its byte
size. `hooks/**` untouched.

## What was done

Four passes in one edit.

### 1. The segmentation paragraph no longer closes on an absolute

`## The rule` ended with "You cannot smuggle a branch switch inside a compound command."
The description in front of it is accurate; that sentence was not. Segmentation finding a
segment and the classifier denying it are two steps, and every classifier defect this queue
closed was a failure of the second — a segment read as allow passes alone or inside a
compound command alike, so the compound command is not the thing that fails to smuggle it.

The paragraph now states its own scope: every segment the split yields is classified, one
deny-case segment denies the whole call, a compound command hides no segment and dilutes no
verdict — and whether a classified segment is *read* correctly is `## Why`'s question. No
caveat was bolted onto the old sentence; the claim was replaced with the one segmentation
can carry.

### 2. The heredoc surface is now named, because `69a2d00` made the old text misleading

The paragraph lists newline as a segment separator, and until `69a2d00` a reader could
correctly conclude that every line of a heredoc body became a candidate command. That is now
false, and the file carried no heredoc text to correct. It gets a sentence rather than
silence for two reasons: the newline claim is wrong without it, and the allow it describes
is one an agent meets in practice — writing a runbook that documents this very policy is the
case `260809-1111` was filed from. The text says data regions are blanked ahead of the
split, that an unquoted delimiter is the one carve-out keeping `$(…)` and backtick regions,
and gives the pair that shows the line: a body line reading `git switch main` is written to
the file and allowed, `$(git switch main)` in the same body is denied.

### 3. The wrapper-resolution paragraph: confirmed, extended, bounded

Its enumeration (assignments, grammar introducers, wrappers, paths, quoting, backslash
escapes) is accurate as written today — that was the class the case-folding defect
falsified, and `15eacb0` closed it. Two additions rather than a correction:

- the fold itself, named as unconditional and at the resolution point, with `GIT`,
  `/usr/bin/GIT` and `SUDO git` as the denied forms;
- the bound the enumeration invites a reader to over-read. The wrappers are a table, so an
  unlisted one still hides the verb (`parallel git switch main` allows), and an expansion in
  command-word position (`$CMD switch main`) names no program the classifier can read. Both
  are stated as bounds with a pointer to point 1 of `## What to do instead`, not as gaps to
  aim at.

### 4. `## Why` counts the defects as they now stand

It named `260809-1110` as a measured defect standing open, which `15eacb0` made false. All
three of that kind (`1105`, `1106`, `1110`) are now closed and are listed as closed, with
the "the classifier can err inside the form it classifies" conclusion kept — it is still
true, and it is what the section exists to concede.

What replaces the open-defect sentence is the weaker claim that is actually supportable: no
*measured* defect of that kind stands open, all three were found by sweeping rather than
reading, so the sentence reports the age of the last sweep. Three bounds are then named as
stated-not-measured: the wrapper table, the unnameable command word, and the global-option
walk, whose own limit (`git --namespace foo bar -C d switch main`, a second bare word between
value and verb) resolves to allow here and is not a live bypass only because git itself
refuses the command.

## What was verified, and how

Nothing about classifier behaviour was taken from a commit message. `hooks/dist` was rebuilt
(`npm run build`; it produced no diff, so `dist` already matched `lib`) and every claim run
through `classifyGitCommand` from the built module:

- compound smuggling still denies: `echo hi && …`, `ls; …; echo done`, `true | …`,
  `echo $(…)`, `( … )`, and a `git worktree \<nl>add` continuation.
- fold: `GIT`, `Git`, `gIt`, `/usr/bin/GIT`, `\GIT`, `"GIT"`, `FOO=1 GIT`, `if GIT …`,
  `sudo GIT`, `SUDO git` — all deny.
- heredoc: unquoted body line allows; `$(…)` and backtick in an unquoted body deny; quoted
  delimiter allows; `<<-` with a tab-indented terminator allows; a real switch after the
  terminator still denies. Segments inspected directly:
  `["cat << > run.md", "EOF"]` for the prose body, with `git switch main` lifted out ahead of
  them when the body carries a substitution.
- options: `git --exec-path=/x grep switch` allows, `git --no-pager grep switch` denies,
  `git grep switch` and `git commit -m switch` allow.
- residuals asserted in the text, each measured rather than assumed: `eval '…'`, `bash -c
  '…'`, a `case` arm, a function body, `$CMD switch main`, `parallel git switch main` — all
  allow. `git --namespace foo bar -C d switch main` allows here; real git 2.49.0 answers
  `git: 'bar' is not a git command`, which is why it is described as unproven rather than as
  a bypass.

No branch-moving git command was executed anywhere in this task; the verification runs the
classifier over strings, which is what the claims are about.

`npm test` from `hooks/`: **35 files, 1153 tests, all passing.** The only failure on the
first run was `rules-emission-golden`, expected — the rule file grew. Regenerated with its
own documented command (`UPDATE_RULES_GOLDEN=1 npx vitest run
lib/__tests__/rules-emission-golden.test.ts`, which rewrites the fixture and fails on
purpose), diff reviewed: `git-branch-discipline.md` 9512 → 12211 bytes and the sixteen
per-agent totals, nothing else. Full suite green on the re-run without the flag.

## Files changed

- `rules/git-branch-discipline.md` — the four passes above
- `hooks/lib/__tests__/fixtures/rules-emission.golden` — regenerated size

## Notes

The record was left at `_p_` and unrenamed, as the dispatch instructed; the resolution note
is appended to it. Nothing was committed — the orchestrator validates and commits under the
lock.

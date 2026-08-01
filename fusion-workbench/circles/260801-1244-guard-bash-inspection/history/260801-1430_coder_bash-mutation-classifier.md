# Coder — plan step 2: the Bash mutation classifier

**Date:** 260801-1430
**Agent:** coder
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Plan:** `planning/260801-1253_o_plan-guard-bash-inspection.md` — step 2 only
**Status:** Complete

## What was implemented

`hooks/lib/bash-mutation-guard.ts` (new), a pure exported module in the shape of
`git-branch-guard.ts`: `classifyBashMutation(command, opts) -> MutationVerdict`, with
`MutationOptions { protectedPaths, normalize, exempt? }` exactly as the plan specifies. No
file I/O, no `process.env`, no `process.cwd()` — the protected list, the project-relative
normaliser and the C5a exemption predicate all arrive through the options object. It
consumes `parseCommand(command, { quoted: "capture" })` from `shell-parse.ts` and matches
with `matchesAny` from `paths.ts`; no second glob matcher was written.

The verb table (`MUTATION_VERBS`, exported deliberately — it is the Q3 review surface):

| Verb | Value-consuming flags | Written operands |
|---|---|---|
| `mv` | `-t` | all positionals **plus** the `-t` directory |
| `rm` | — | all positionals |
| `cp` | `-t` | last positional, **or** the `-t` directory alone |
| `ln` | `-t` | last positional, **or** the `-t` directory alone |
| `install` | `-t`, `-m`, `-o`, `-g` | last positional, **or** the `-t` directory alone |
| `tee` | — | all positionals |
| `truncate` | `-s`, `-r` | all positionals |
| `dd` | — | the value of `of=` |
| `sed` (only with an in-place flag) | `-e`, `-f`, `-l` | all positionals |
| `perl` (only with an in-place flag) | `-e`, `-f` | all positionals |
| `git mv` | — | all positionals |
| `git rm` | — | all positionals |

`-t` also accepts `--target-directory DIR` and `--target-directory=DIR`. In-place detection
reads an `i` among a short flag's letters (`-i`, `-i.bak`, `-ni`, `-pi`) or `--in-place[=…]`,
which covers GNU and BSD with no platform branch. `git` globals (`-C`, `-c`, `--git-dir`,
`--work-tree`) are skipped before the subcommand, so `git -C . mv` is recognised and
`git checkout HEAD -- rules/x.md` stays allowed.

Redirection is scanned separately and position-independently: `>`, `>>`, `>|`, `N>`, `N>>`,
glued (`>file`) or separated (`> file`). Targets are lifted out of the word list so a
redirection target is never also counted as a positional of the verb.

## The two properties that had to hold

**`2>&1` does not deny, and that is asserted rather than assumed.** `shell-parse` replaces
`&` and `|` with segment boundaries, so `echo hi 2>&1 >/tmp/log` arrives as
`echo hi 2>` + `1 >/tmp/log` and the operator in the first segment has no target. The plan
said to skip that case. Skipping it outright would also have lost `>|`, which the plan lists
as a form to handle and which is split by the very same mechanism — `echo hi >| rules/x.md`
becomes `echo hi >` + `rules/x.md`. So a dangling operator adopts the **head token of the
next same-depth segment**, and the two file-descriptor forms fall out as skips on their own
because that head is the bare number `1` or `2`. Verified: `echo hi 2>&1`, `echo hi 2>&1
>/tmp/log`, `echo err >&2`, `cat a 1>&2` and `make 2>&1 | tee /tmp/build.log` all allow;
`echo hi >| rules/x.md` and `echo hi >& rules/x.md` deny.

**Fail-closed on the constructible cases, and no further.** An operand of a recognised verb
that still carries `$`, a backtick or a leading `~` denies. An unrecognised program is
allowed however unparseable its arguments are. A resolved protected match is reported in
preference to an unresolved operand, so `mv $SRC rules/` denies naming `rules/`, and
`mv rules/x.md $DST` denies naming `rules/x.md`, matching the plan's wording.

## Verification

`npx tsc --noEmit` clean. `npm test` in `hooks/`: **346 passed, 13 files** — unchanged from
step 1, because step 3 owns the suite and no test file was added here.
`git-branch-guard.test.ts` (84) and `shell-parse.test.ts` (30) are untouched and green.

Confidence for this step came from two throwaway matrices run outside the repo:

- **93 cases** across all twelve verbs (deny on protected, allow on unprotected), the
  read-only positionals (`cp rules/x.md /tmp/y`, `ln -s rules/x.md /tmp/link`,
  `dd if=rules/x.md of=/tmp/y`), every redirection form and the three skip forms, quoting,
  the fail-closed set, inertness, compound and subshell, `git mv` vs `git checkout HEAD --`,
  the guard-state cases, path traversal, the `exempt` predicate, and an empty protected
  list. All 93 as expected.
- **42 ordinary agent commands** that must never deny (`npm test`, `git status --short`,
  `grep -rn … rules/`, `cat rules/x.md`, `jq '.guard' hooks/config.json`,
  `cp -R rules /tmp/backup`, `make 2>&1 | tee /tmp/build.log`, `echo "$(date) done" >>
  /tmp/log`, …). All 42 allowed.

Both matrices are scratch, not committed. Step 3 designs the systematic suite.

## Decisions taken inside the step

**A protected directory is matched as a directory.** `rm -rf fusion-workbench/.guard-state`
resolves to a path with no trailing separator, and `fusion-workbench/.guard-state/**`
compiles to `^fusion-workbench/\.guard-state/.*$`, which that string does not match. The
operand is therefore tested both as itself and as `path + "/"`. Without this the plan's own
acceptance case — the sharpest one in the issue — would have been allowed.

The related **ancestor** case is deliberately NOT handled: `rm -rf hooks` destroys
`hooks/config.json` and is allowed, because the operand is not the protected path and is not
a directory the pattern matches. Closing it means comparing the operand against each
pattern's literal prefix, which widens the deny surface (`rm -rf fusion-workbench`,
`mv hooks /tmp`) and belongs at the Q3 gate, not in an unreviewed commit.

**An empty `protectedPaths` returns allow immediately**, before the fail-closed rule. A
project that protects nothing must never see a deny for an unresolvable operand — there
would be nothing to protect it from.

**Grammar prefixes are skipped when finding the command word** (`{`, `(`, `!`, `then`,
`else`, `do`), so `{ rm rules/x.md; }` and a loop body are still classified. None of these
is a program, so the skip cannot mis-identify an ordinary invocation. Leading `VAR=value`
env assignments are skipped the same way `findGitInvocation` already does.

**Wrapper programs are not skipped and are residual**: `sudo rm rules/x.md`,
`xargs rm < list`, `env rm …`, `command rm …` and `time rm …` all read as an unrecognised
program and are allowed. Adding a wrapper skip is a behavioural widening; it goes to the
gate with the table.

**Deny reasons render placeholders back to readable text.** Capture mode replaces a
single-quoted region with a `U+0001`-wrapped placeholder, so a raw segment carries control
characters that must not reach a reason string or the event log. Rendering runs each word
back through `resolveWord`, using only `shell-parse`'s public contract, so this module never
learns the placeholder's shape. `mv 'rules/x.md' /tmp/` reports the segment as
`mv rules/x.md /tmp/`.

## Findings against the plan

**`>|` as written is unreachable** — see above. Handled, and the mechanism is documented at
`scanSegment`.

**The fail-closed rule cannot fire for a `$(…)` / backtick operand.** The parser lifts the
body out and leaves a space, so the operand is *invisible* rather than *unresolved*:
`rm $(echo rules/x.md)` is allowed where `rm $VAR` denies. The fix belongs in `shell-parse`
(capture mode leaves an unresolvable token instead of a space) and changes the deny surface,
so it is filed for the Q3 gate rather than applied:
`issues/260801-1430_o_substitution-operand-is-invisible-to-the-mutation-classifier.md`.

**Three false positives the gate should see, all following from the plan as written:**

- `sed -i "s/$OLD/$NEW/" notes.txt` denies. `sed`/`perl` take all positionals by the plan's
  own reasoning, and a double-quoted script carrying a variable is an unresolved written
  operand. Single-quoted scripts are unaffected, which is the common form.
- `rm -rf ~/.cache/fusion` denies. A leading `~` is unresolved by the plan's definition.
- `echo "x > rules/y.md"` denies. A double-quoted region is code to the parser (by design —
  bash expands there), so the `>` inside it reads as a redirection. The single-quoted form
  allows.

**Not in the table and therefore allowed**: `chmod`, `chown`, `touch`, `tar -C`, `rsync`,
`patch`, `gzip`, `zip`, `unzip`, `mkdir`. Each can affect a protected path. This is the
accepted residual, but the specific list is worth naming at the gate.

## Files

- `hooks/lib/bash-mutation-guard.ts` — new
- `fusion-workbench/circles/260801-1244-guard-bash-inspection/planning/260801-1253_o_plan-guard-bash-inspection.md` — step 2 marked `[DONE]` with divergences
- `fusion-workbench/circles/260801-1244-guard-bash-inspection/issues/260801-1430_o_substitution-operand-is-invisible-to-the-mutation-classifier.md` — new

`hooks/guard.ts` (step 5), `hooks/dist/` (step 8) and `.claude-plugin/plugin.json` (step 8)
were not touched. Not committed — the orchestrator commits.

## Note for the orchestrator

`agents/ontocoder.md` is still dirty in the working tree (+9 lines). It was already dirty
before step 1 and is not part of this step's diff.

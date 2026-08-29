# Coder — virtual working directory tracking (plan step 4)

**Date:** 260801-1615_coder_virtual-cwd-tracking.md
**Agent:** coder
**Circle:** `260801-1244-guard-bash-inspection`
**Plan:** `260801-1253_*_plan-guard-bash-inspection.md` — step 4
**Status:** Complete

## What was implemented

`classifyBashMutation` now walks the parsed segments in source order carrying a virtual
working directory, and every relative written operand — positional, `-t` target,
`dd of=`, redirection target — resolves against it. `cd fusion-workbench && rm -rf
.guard-state` denies, naming `fusion-workbench/.guard-state`.

**Files:** `hooks/lib/bash-mutation-guard.ts`, its test file, and one `export` keyword in
`hooks/lib/shell-parse.ts` (see below). `hooks/guard.ts`, `hooks/dist/` and
`.claude-plugin/plugin.json` untouched.

### The three-state directory

A directory is `known` (a path in the operands' own coordinate space — `""` for the
project root, project-relative inside the tree, `..`-prefixed or absolute once outside),
`outside` (not nameable but provably not the project tree: `$HOME`, via a bare `cd`,
`cd ~`, `cd ~/x`), or `unknown` (not determinable at all: `cd $D`, `cd "$(…)"`,
`pushd +1`).

A relative operand under `unknown` is **unresolved**, so a recognised verb writing it
denies — the same fail-closed rule `mv $SRC rules/` already carried, applied one level
up. Under `outside` it resolves to nothing and allows. An **absolute** operand is
unaffected by either, so `cd $D && rm -rf /tmp/x` stays allowed.

### Scoping

Two kinds of scope save the state on entry and restore it on exit, matching bash:

- A `$(…)` / backtick body, which `shell-parse` reports as depth ≥ 1 and which always
  follows the outer segment it was lifted out of — so it **inherits** the directory in
  force there. This is better than the plan's "evaluate deeper segments from `.`":
  `cd rules && echo $(rm x.md)` really does delete `rules/x.md`, and now denies.
- A `(…)` subshell, which `shell-parse` does not model at all — it stays depth 0 with the
  parentheses in the segment text — so the parens are counted here. The
  `SUBSTITUTION_FILLER` (`$(…)`) is removed before counting, since its balanced pair is
  not grammar; without that, `cd $(pwd)` would open and close a scope around its own `cd`
  and discard it. That removal is the only reason `shell-parse.ts` was touched: the
  constant became `export`, with no behaviour change (the 84-case git suite and the
  30-case shell-parse suite are unmodified and green).

A `for … done` or `{ …; }` body is NOT a scope, correctly — bash runs both in the current
shell, so `for d in a; do cd rules; done; rm x.md` denies.

### The builtins

`cd`, `chdir`, `pushd`, `popd`. `cd -` is an exact swap of `$PWD` and `$OLDPWD` (and
denies at the head of a command, where `$OLDPWD` is inherited and unknowable). `pushd`
and `popd` drive a real directory stack; `popd` on an empty stack is the no-op bash makes
it, which is correct because a Bash tool call starts with an empty stack. The rotations
(`pushd` bare, `popd +1`) are not modelled and resolve to `unknown`.

## Decisions and their justification

**`cd $VAR` denies a following relative mutation.** Mandated by the plan's acceptance
criteria and consistent with the module's existing discipline: the classifier resolves no
variable, and an operand hanging off an unknowable directory is exactly as unknowable as
the variable itself. The deny carries its **own reason** (`unknownCwdReason`) naming the
working directory rather than the operand — without that, an agent is told to rewrite a
path that is already literal, and the way through (an absolute path, or no `cd`) is
invisible.

**`~` and a bare `cd` allow instead.** `~` is syntax the classifier can see; it denotes
the home directory, which is the project root only if the project IS `$HOME`. Treating it
as "somewhere else" costs nothing real and avoids a false positive on `cd && rm -rf junk`.

**`$HOME` is deliberately not read as `~`,** even though bash expands both from the same
variable. `resolveWord` is the single authority on what a word denotes; carving out one
variable name would make it two. So `cd $HOME && rm -rf tmp` denies where
`cd ~ && rm -rf tmp` allows. Stated in the code as a choice rather than left as an
oversight.

## Verification

- `npm test` in `hooks/`: **603 passed, 15 files** (553 before; +22 corpus commands, +28
  cases). `npx tsc --noEmit` clean.
- **The 50-command must-never-deny corpus survived in full**, and was **grown to 72** with
  `cd`-bearing ordinary work, because this step resolves every relative operand through
  whatever `cd` preceded it and therefore carries the step's own false-positive risk. A
  separate 49-command scratch matrix of subdirectory work (`cd hooks && rm -rf dist`,
  `pushd hooks && npm test; popd`, `cd rules && grep -rn MUST .`, `cd /tmp && rm -rf
  probe`, `cd ~/Downloads && ls`) ran 49/49 allow.
- The step-3 `cd` block, written asserting the untracked behaviour, is flipped and
  expanded into six describe blocks.

## Where the virtual cwd meets the ancestor rule — not anticipated by the plan

`ancestorOfProtected` excludes the project root, so `rm -rf .` and `cp x .` are allowed by
design (`.` is an ancestor of everything, and `rm` refuses it anyway). **A `cd` gives `.`
a name, and the exclusion stops applying:** `cd rules && rm -rf .` resolves to `rules`,
`cd fusion-workbench && rm -rf .` resolves to `fusion-workbench`, and both now deny on the
ancestor rule — as does `cd rules && cp /tmp/x .`, a write INTO a protected directory.
`cd build && rm -rf .` stays allowed. This closes a hole rather than opening one, and it
is the one interaction that changes a verdict for a command containing no protected path
anywhere in its text. It is pinned by its own test block.

## Residuals

- **Walking out and back by name is invisible.** `cd .. && cd project && rm rules/x.md`
  allows. The classifier is given a normaliser, not the project directory's own name.
- **Sibling `$(…)` substitutions inside ONE outer segment share a directory**, because
  `shell-parse` reports a depth but not a subshell identity. `$(cd /tmp) $(rm
  rules/x.md)` allows; the same pair in separate segments is correctly independent.
- **The `(…)` paren-subshell gap** — `(rm rules/x.md)` is ALLOWED, because `tokenize`
  leaves the parenthesis glued to the command word. Pre-dates this step; filed as
  `260801-1610_*_paren-subshell-glues-its-parentheses-to-the-command-word-and-the-last-operand.md`
  with two fix options and the note that both widen the deny surface, so they belong at a
  gate. Step 4 strips a leading `(` for the DIRECTORY builtins only, because the scoping
  requirement is unreachable otherwise, and deliberately does not extend that to the
  verbs.
- **A Bash call is assumed to start at the project root.** True for a fresh shell per
  call; a harness that persists cwd between calls would start the walk in the wrong place.

All three of the first residuals are asserted at their current behaviour in the suite, so
they stay visible.

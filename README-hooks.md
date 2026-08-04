# Compliance Guard — Claude Code Hook System

The Compliance Guard intercepts agent tool calls in real time, blocking writes to protected paths and escalating changes to decision-governed areas. It is the `.claude` agent system's equivalent of Fusion's Decision Guard.

## Concept

When Claude Code executes a Write, Edit, MultiEdit, or NotebookEdit tool call, the hook system runs *before* the write happens. The guard checks the target file path against three layers of rules:

1. **Halt check** — if the guard has been halted (after repeated violations), *all* writes are blocked until a human clears it
2. **Protected paths** — files that agents must never modify directly (agent definitions, rules, workbench state)
3. **Decision-governed categories** — files governed by project decisions, with configurable sensitivity levels

If a check fails, the tool call is denied and the agent receives the reason — including which decision(s) the write would violate. This gives the agent explicit feedback about *why* it was blocked, not just that it was.

A shell is a write tool too. `Bash` calls are therefore intercepted as well, for two independent policies: the **git branch policy** (see `rules/git-branch-discipline.md`) and the **protected-path policy** for file-mutating shell commands (see [Shell writes to protected paths](#shell-writes-to-protected-paths) below, and `rules/protected-path-discipline.md`). Without the second one, every entry in `protectedPaths` was writable through `mv`, `rm`, `sed -i` or a `>` redirection by any agent.

### Escalation

Consecutive blocks accumulate. After a configurable threshold (default: 3), the guard enters **halt mode** — blocking all write operations until a human reviews the situation and clears the halt. This catches the pattern where an agent repeatedly attempts a disallowed action.

### Churn Detection

A PostToolUse tracker records every file mutation. When the same file is changed too many times in a session (thrashing), it emits `churn_warning` / `churn_critical` events (and `cross_file_*` events for circular edits) that the monitor and orchestrator can see. This detection is **observation-only**: PostToolUse runs *after* the write, so it can never block a write or trip the halt on its own — it is a signal, not an enforcement point. Only the PreToolUse guard blocks.

## Architecture

```
Claude Code
  |
  +-- SessionStart
  |     \-- exports FUSION_PLUGIN_ROOT to $CLAUDE_ENV_FILE
  |         (also emits a systemMessage banner visible to the user)
  |
  +-- PreToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash)
  |     \-- guard.ts
  |           |   Bash is inspected for TWO policies: git branch/worktree
  |           |   moves, and file mutation of a protected path.
  |           +-- lib/shell-parse.ts         (the shared shell lexer)
  |           +-- lib/git-branch-guard.ts    (branch/worktree classifier)
  |           +-- lib/bash-mutation-guard.ts (protected-path classifier)
  |           +-- config.json (rules, paths, decisions, thresholds)
  |           +-- fusion-workbench/.guard-state/escalation.json (halt flag, block count)
  |           \-- fusion-workbench/.guard-state/events.jsonl (audit log)
  |
  +-- PostToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash)
        \-- tracker.ts
              +-- fusion-workbench/.guard-state/churn.json (per-file change counts)
              +-- fusion-workbench/.guard-state/cross-file.json (cross-file ping-back state)
              \-- fusion-workbench/.guard-state/events.jsonl (audit log)
```

## Getting Started

### 1. Verify hooks are wired

The plugin wires hooks automatically via `hooks.json`. The hooks use pre-compiled JavaScript (`hooks/dist/`) invoked with plain `node` — no `npx tsx` needed, no `node_modules` at runtime.

The effective hook configuration:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "echo 'export FUSION_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}' >> \"$CLAUDE_ENV_FILE\"" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit|Bash",
        "hooks": [
          { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/guard.js" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit|Bash",
        "hooks": [
          { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/tracker.js" }
        ]
      }
    ]
  }
}
```

### 2. Review the configuration

Edit `hooks/config.json` to define:

- **Enabled** — `guard.enabled` is the master on/off switch; `false` disables the guard entirely, including the branch-switch check and the shell protected-path check
- **Protected paths** — which files are off-limits, to the write tools **and** to file-mutating shell commands
- **Category paths** — which file areas map to which decision categories
- **Decisions** — the actual rules, each with an ID, category, statement, and optional rule file reference
- **Sensitivity** — how aggressively each category escalates (none/low/medium/high)
- **Thresholds** — when to escalate (blocks before halt, churn limits)

### 3. Start a Claude Code session

The hooks activate automatically on session start. No manual startup needed.

## Files

| File | Purpose | Committed? |
|------|---------|------------|
| `guard.ts` | PreToolUse hook — checks and blocks writes | Yes |
| `tracker.ts` | PostToolUse hook — records changes, detects churn | Yes |
| `clear-halt.ts` | Manual halt reset utility | Yes |
| `config.json` | Guard rules, decisions, thresholds | Yes |
| `lib/paths.ts` | Glob-to-regex path matching | Yes |
| `lib/config.ts` | JSON config loader | Yes |
| `lib/escalation.ts` | Escalation state management | Yes |
| `lib/events.ts` | Append-only event logger | Yes |
| `lib/churn.ts` | Churn heatmap tracker | Yes |
| `lib/cross-file.ts` | Cross-file ping-back tracker (paired-touch / circular edit detector) | Yes |
| `lib/workbench-root.ts` | Walks up from cwd to find `fusion-workbench/.fusion-setup` (single source of truth for workbench presence in TS) | Yes |
| `lib/self-detect.ts` | Detects when cwd is the fusion plugin's own repo so the **write** guard stands down — both the write tools and the shell protected-path check (the git branch-switch policy stays active even here) | Yes |
| `lib/shell-parse.ts` | The shared shell lexer: strips data regions (quotes, heredoc bodies), splices backslash line continuations, segments on `;`/`&&`/`\|\|`/`\|`/`&`/newline, recurses into `$(…)` and backticks, tokenizes. Two modes: `blank` (quoted content erased, for the git classifier) and `capture` (quoted content preserved as an operand, for the mutation classifier). `parseCommand` also reports each segment's **joiner** — the operator that joined it to the one before, `&&` being the only one bash guarantees — which is what lets the mutation classifier tell a `cd` it may follow from one it may not. The git classifier does not come through `parseCommand`; it consumes `extractCommandSegments(stripDataRegions(cmd))`, a separate function kept verbatim | Yes |
| `lib/command-word.ts` | Which token of a segment names the program: skips env assignments, shell grammar words (`if`, `while`, `do`, …) and wrapper programs (`sudo`, `exec`, `xargs`, …), and resolves quoting, a path and a backslash escape. It also reports whether the segment named its program **directly** — no wrapper hop, no path separator — which is what the directory model needs before it will follow a `cd`. It deliberately carries no claim about *which* wrappers can run a builtin: that is a property of the spelling and of the running shell, not of the program's name, and marking three rows from a measurement once allowed eleven commands the shell then executed against a protected file. Shared by both Bash classifiers **and** the directory model, so none can be blind to a form the others see | Yes |
| `lib/git-branch-guard.ts` | Branch/worktree classifier — the git branch-switch policy | Yes |
| `lib/bash-mutation-guard.ts` | Protected-path classifier for shell commands: the verb table, the redirection scanner, wrapper skipping, ancestor matching, virtual-`cd` tracking, and the fail-closed rule | Yes |
| `package.json` | Dev dependencies (tsx, typescript, vitest) | Yes |

## Usage

### Tuning or disabling the guard

The guard runs on a spectrum — full enforcement, advisory, or off — assembled from fields already in `config.json` (plus two session env vars). Pick the row that matches how much friction you want:

| Goal | Change |
|---|---|
| Off entirely | `guard.enabled: false` — disables the write guard, the shell protected-path check **and** the branch-switch block |
| Advisory-only (warns, never blocks) | keep `enabled: true`; set `protectedPaths: []`; leave decision sensitivities at `medium`/`low` (only `high` blocks). An empty list also stands the shell protected-path check down completely, including its fail-closed rule |
| Looser, not off | trim `protectedPaths`, raise the `churn.*` / `crossFile.*` thresholds, keep sensitivities ≤ `medium` |
| Allow one agent branch switch | session env `FUSION_ALLOW_BRANCH_SWITCH=1` (or `FUSION_ALLOW_WORKTREE=1`) — not config. Neither waives the protected-path policy |
| Clear a stuck halt | `node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/clear-halt.js` (see [Clearing a halt](#clearing-a-halt)) |

Five things cause a block, and only these: a **write-tool call on a protected path** (any sensitivity), a **shell command that writes a protected path**, a **branch- or worktree-moving git command** that no env override covers, a write to a **decision-governed path at `high` sensitivity**, and an active **halt** (after `escalation.blocksBeforeHalt` consecutive blocks, default 3). Churn and cross-file detection are advisory — they emit warning events but never block. `guard.enabled: false` stands the whole guard down, branch-switch check included.

**How a path is matched.** On the *text* of the path — no symlink is resolved on the protection side, which is the residual stated at the end of [Shell writes to protected paths](#shell-writes-to-protected-paths) — and with **case folded**, on both surfaces. `Edit AGENTS/coder.md`, `Edit HOOKS/config.json`, `Edit Rules/x.md`, `rm AGENTS/coder.md` and `rm -rf RULES` all deny exactly as their lower-case spellings do. Until the fold landed, none of them did: a glob compiles to a case-sensitive regex, so on any case-insensitive filesystem — APFS in its default configuration, so every stock macOS install, and a case-insensitive Windows volume — the entire `protectedPaths` list was bypassable by shifting one letter, on both surfaces, with no flag involved.

The fold is **unconditional**, not conditional on the filesystem, so the boundary is the same everywhere rather than something to look up per platform. The cost is over-blocking where case genuinely distinguishes two files: measured on a case-sensitive volume holding both, `Edit AGENTS/coder.md` denies although it is not `agents/coder.md`. A project that deliberately keeps both spellings of a protected path will find one of them unwritable. That trade was made deliberately — over-blocking is the direction the fail-closed rule already chooses. The `FUSION_ALLOW_RULES_WRITE` exemption is **not** folded: with the flag set, `Edit rules/x.md` is allowed and `Edit RULES/x.md` is denied, because widening a grant is the one direction a guard may not move.

A halt blocks **both** surfaces until a human clears it: every `Write`, `Edit`, `MultiEdit` and `NotebookEdit` call, and every `Bash` command the mutation classifier recognises as a write. On the shell the halt is broader than the protected-path check it sits above, because it asks only whether the command writes a file at all: under a halt, `rm notes.txt` and `echo hi > out.txt` are denied along with `rm rules/x.md`. Read-only commands still run, deliberately, so an agent can read its way to understanding why it is halted and tell the user how to clear it; `ls`, `git status` and `cat` are unaffected.

The two surfaces say so in their own words, and both name `clear-halt.js`:

```
Write/Edit/MultiEdit/NotebookEdit
  [HALTED] All write operations blocked. The guard has been halted after
  repeated violations. Run: node <plugin>/hooks/dist/clear-halt.js to reset.

Bash
  [HALTED] All file-mutating shell commands are blocked. The guard has been
  halted after repeated violations. Read-only commands still run.
  Run: node <plugin>/hooks/dist/clear-halt.js to reset.
```

Under an active halt a protected-path shell write reports the **halt** rather than the path, the same order the write-tool path uses: the halt is the condition the user has to clear, and naming the path would send an agent off rephrasing the command. A branch-policy deny still reports the branch policy, because that check runs before the halt. In the event log the three cases are distinguishable — `Halt active — write tool call blocked`, `Halt active — mutating Bash command blocked: <segment>`, and `Halt raised by this block — <cause>` for the block that turned the halt on.

### Shell writes to protected paths

The guard's protected-path check used to be reachable only from `Write` / `Edit` / `MultiEdit` / `NotebookEdit`. A `Bash` call was classified for the git branch policy and then allowed unconditionally, so `mv rules/x.md /tmp/` moved a protected file with no tool the guard inspected. `lib/bash-mutation-guard.ts` closes that: a shell command whose **written** operands land on `guard.protectedPaths` is denied, with the same `protected_path` trigger, the same escalation counter and the same three-block halt the write tools use.

**What is recognised.** Recognition is table-driven, one row per command:

| Family | Commands |
|---|---|
| Relocate or destroy | `mv`, `rm`, `cp`, `ln`, `install`, `git mv`, `git rm`, `git clean -f`, `git stash push` |
| In-place rewrite | `sed -i`, `perl -i`, `truncate`, `tee`, `dd of=…`, `git restore --source=…`, `git checkout <treeish> --` |
| Redirection | `>`, `>>`, `>\|`, `N>`, glued (`>file`) or separated (`> file`) |

Only the operands a verb *writes* count, so `cp rules/x.md /tmp/y` reads a protected path and is allowed while `cp /tmp/y rules/x.md` is denied. Redirection is scanned position-independently, because `>` makes any program a mutation. A file-descriptor target (`2>&1`, `>&2`) and `> -` are skipped, and an operator inside a double-quoted string is not an operator at all — bash redirects nothing there, so `git commit -m "docs: rules/a.md -> rules/b.md"` is prose.

Two of the git rows only mutate under a flag, which is what keeps the read and revert forms allowed: `git clean -n rules` is a dry run and `git clean -fdx rules` is not; `git restore rules/x.md` and `git restore --staged rules/x.md` restore from the **index** and stay allowed, while `git restore --source=HEAD~1 rules/x.md` overwrites from anywhere in history. A third, `git stash`, is discriminated by its **sub-subcommand** rather than by a flag: only `git stash push` names working-tree paths (as does the bare `git stash -- <paths>` form it stands for), so `pop`, `list`, `show`, `apply`, `drop`, `clear` and `save` write nothing the guard reads — from any directory — and a `-m` message or a `stash@{0}` ref is never read as a path. `git apply` and `git am` name their targets inside the patch file rather than on the command line and are **not** reached — they sit in the residual list with `patch`.

A fourth, `git checkout`, is discriminated by its **tree-ish**, which is where `git restore` carries a `--source=` flag. `git checkout HEAD -- rules/x.md` is fusion's own revert strategy and stays allowed; `git checkout HEAD~5 -- rules/x.md` and `git checkout otherbranch -- rules/x.md` write content from elsewhere over a protected path and are denied, exactly as their modern spelling `git restore --source=HEAD~1 rules/x.md` always was. Until 2026-08-04 `checkout` was in no table at all, so the two spellings of one operation returned opposite verdicts everywhere and nothing in either document let a reader see the pair (`issues/260804-1026…`). Restoring from the **index** names no tree-ish and stays allowed in every spelling (`git checkout -- rules/x.md`, `git checkout rules/x.md`). Moving HEAD (`git checkout main`, `git checkout -b feature`) writes no named path and remains the **branch** policy's business, on its own reason and its own override.

**One source still disagrees, deliberately, and it is the one the revert promise is about.** `git checkout HEAD -- rules/x.md` allows; `git restore --source=HEAD rules/x.md` denies, and so do `--source HEAD` and `-s HEAD`. The cause is architectural: `restore` is discriminated by the flag *token*, which never carries the value of a separated `--source HEAD` at all, while `checkout` takes its source as a positional the model sees in every spelling. Teaching `restore` the exception would make a command **newly allow** — a first for this work — so it went to the Human Gate and was declined for now (`circles/260801-1244-guard-rules-write/decisions/260804-1815_a_…`). The agent-facing consequence is one sentence, and `rules/protected-path-discipline.md` carries it: **the sanctioned spelling of the revert is `git checkout HEAD -- <paths>`**, so an agent that meets the `restore` deny has a documented command to reach for instead of a reason to rephrase.

Only the literal `HEAD` is proven inert, and the set of spellings that denote the same commit is open: `@`, `HEAD~0`, `HEAD^0` and the current branch's own name all deny. Without `--`, the first positional is read as the tree-ish the way git reads it, so every later path is a written operand and `git checkout rules/x.md agents/coder.md` denies on `agents/coder.md`. Both costs have the same way through and it is the documented spelling, `git checkout HEAD -- <paths>`. **Which policy answers a `--`-less `git checkout` depends on its first operand**, and the mutation classifier does not always get the turn: the branch guard lets that form through only when the operand names a file on disk that is not also a ref, so `git checkout rules/a.md rules/b.md` (no such file) and `git checkout HEAD rules/x.md` (a ref) are branch-policy denies carrying a branch-policy reason. Neither document should claim an outcome the other policy owns.

**git carries its own working directory, and it is now read.** `-C <dir>` and `--work-tree=<dir>` tell git where to run, and the walk that finds the subcommand used to step over them and keep nothing — so the subcommand's relative operands were resolved against the *shell's* directory. `git -C rules rm x.md`, `git -C agents rm coder.md`, `git -C rules clean -fdx` and `git --work-tree=rules clean -fdx` all allowed and were measured deleting the file (`issues/260804-1024…`). Each `-C` composes onto the last and `--work-tree` composes onto the result, both measured at git 2.49.0. `--git-dir` is skipped and **not** recorded: it names where the repository metadata lives and moves no pathspec.

The rule is a union rather than a substitution: **an operand is checked against every directory the guard can attribute to the invocation** — the shell's, and each directory a global option redirects git to. That is why `git -C /repo mv rules/x.md docs/` still denies although `-C` says the operand is another repository's; the guard does not use a flag to argue a spelled-out protected path away. Structurally the union can only *add* a resolution, so it can only add a deny — which is what makes "no command newly allows" a property of the change rather than a hope. Ordinary work is untouched: `git -C build rm out.js`, `git -C build clean -fdx`, `git -C /tmp rm junk` and `git -C rules status` all allow. A directory built at run time (`git -C $D rm x.md`) is unknown, and a relative operand there denies fail-closed exactly as it does after `cd $D`.

The same walk had a second way of losing the subcommand: a global option it did not know takes a value swallowed it. `git --namespace foo rm rules/x.md` deleted a protected rule, because `foo` landed in subcommand position, matched no row, and the invocation read as an unrecognised program. That is the shape of *every* option the table does not carry, including ones git has not shipped, so it is answered structurally rather than by adding a row — when the word in subcommand position matches no row and an unrecognised option stands in front of it, the next word is tried as well. The cost is a false deny of the shape `git <unknown-option> <non-subcommand> <mutation-verb> <protected-path>`; `git --no-pager diff rm rules/x.md`, where `rm` is a file, is an example of that shape and not the whole of it.

**`git clean` with no pathspec is no longer a residual.** It was listed as one on the reading that it "names no directory the ancestor check can compare". That was wrong about git rather than about the check: with no pathspec, `clean` deletes from the **current directory down**, not from the repository root (measured — `cd rules && git clean -fdx` removed `rules/junk.txt` and left the root's alone). So the operand it does not spell is `.`, which the model now supplies: `git -C rules clean -fdx` and `cd rules && git clean -fdx` deny, and `git clean -n` is still a read. The root stopped being a way out in the same pass: `clean` writes *through* its pathspec rather than to it, so the project-root exclusion that lets `cp x .` past does not apply, and `git clean -fdx`, `git clean -fdx .`, `git clean -fd` and `git clean -f` all deny at the project root on a "writes THROUGH a directory" reason. Naming an unprotected directory still allows (`git clean -fdx build`, `git -C build clean -fdx`, `cd build && git clean -fdx`), and a `clean` from a directory the guard cannot place denies fail-closed. The residual entry for this case is therefore **deleted because the case closed, not narrowed** — with the exception of the environment route below, which is live. `rm -rf *` stays a residual — a glob is matched as literal text and names no directory at all.

**Four things widen a row's reach**, and each was reviewed and accepted with the table:

- **The command word is resolved before it is read.** A leading `VAR=value` assignment, a shell grammar word (`if`, `elif`, `while`, `until`, `then`, `else`, `do`, `!`, `{`, `coproc`), a wrapper program (`sudo`, `doas`, `env`, `command`, `builtin`, `exec`, `nice`, `ionice`, `timeout`, `xargs`, `time`, `nohup`, `setsid`, `stdbuf`), a path, quoting and a backslash escape are all skipped or removed: `sudo env rm rules/x.md`, `if rm -rf rules; then :; fi` and `\rm -rf rules` classify as the `rm` they are. The resolution lives in `lib/command-word.ts` and **both classifiers and the directory model share it** — the directory model used to re-derive the command word with a helper that did not walk wrappers, which let `command cd rules && rm x.md` move the shell past a model that never saw it.
- **Ancestor directories count**, in both directions: `rm -rf rules` and `mv hooks /tmp` destroy or relocate a protected path without naming it, and `cp /tmp/x hooks/` writes into a directory that contains one. `rm -rf node_modules`, `rm -rf dist` and `rm -rf hooks/dist` are unaffected; the project root is excluded, so `cp x .` is allowed.
- **A `cd` is tracked.** A virtual working directory is carried across a compound command's segments, so `cd fusion-workbench && rm -rf .guard-state` is denied while `cd build && rm -rf out` is allowed. `(…)` and `$(…)` scope it the way bash does. What is tracked is an **allow-list**: the model is exact for bash's default logical `cd`, and every modifier that changes the resolution rule — `-P` and `set -o physical`, `pushd -n` and `popd -n`, a `CDPATH=` assignment, any flag the classifier was not taught — makes the directory *unknown* rather than guessed, after which a relative operand of a table verb denies fail-closed. `cd -P build && rm out.js` denies; `cd -L`, `cd --` and every flagless form are untouched. Three shapes are not modifiers and were closed separately. A directory builtin behind **any** wrapper (`command cd`, `builtin cd`, `time cd`, `sudo cd`, `env cd`) gives up, and so does a **path**-spelled one (`/usr/bin/cd`, `/bin/pushd`): whether the calling shell ran a builtin depends on the wrapper, on the spelling and on which shell it is — `command cd` moves bash and is inert in zsh, `\time` and `/usr/bin/time` demote the reserved word to an external program that cannot run `cd` at all — and none of that is readable from the command text. An earlier version modelled the three builtin-capable wrappers as real moves; that is not a safe over-deny, because an asserted move relocates every later relative operand and can move it *off* the protected list, and it allowed eleven commands the shell then executed against a protected file. The cost of giving up instead is `command cd build && rm out.js` and its two siblings, which now deny fail-closed. Quoting or escaping the builtin itself is a different question and stays modelled: `\cd` and `'cd'` were measured moving the shell in both shells, because `cd` is a builtin rather than a reserved word. Lastly, `pushd` **without** an operand — like `pushd +2` and `pushd -2` — rotates bash's stack rather than pushing onto it, so it gives up too instead of leaving the model one entry deeper than the shell; and because a give-up has to give up the stack's **depth** and not only its contents, the stack is a sum type whose given-up form has no length to read. Finally, the model may assume a `cd` **succeeded** only where the shell guarantees it. After `&&` bash will not run what follows unless the left-hand side returned zero; after `;`, `||`, `|`, `&` or a newline it runs the next segment from where it never left, so `cd nonexistent; rm rules/x.md` deleted a protected rule with no flag, no wrapper and one extra segment. The rule is therefore: **once a directory builtin has run in the current scope, the working directory is unknown in every segment reachable without an `&&`, and a mutation with a relative operand there denies fail-closed.** "Reachable" is wider than "next" — `cd hooks && npm run build; rm -rf dist` degrades while `cd hooks && npm run build && rm -rf dist` stays exact — and losing the directory only costs something where a relative path is actually written, which is why `pushd hooks && npm test; popd` and `cd hooks; rm /tmp/x` allow. A **newline after `&&` is part of the operator** (bash's grammar is `and_or AND_AND newline_list pipeline`), so a multi-line chain is its single-line form; for one commit the lexer downgraded it and an ordinary three-line build chain denied with a remedy the caller had already applied (`issues/260804-0838…`, fixed). The cost was first stated as five specific shapes, which was a property of a corpus harvested from the suite rather than of the change: a generated cross-product moved ten of thirty ordinary shapes, including `cd hooks; npm test > out.log`, `if cd hooks; then rm -rf dist; fi` and `cd hooks && npx tsc | tee typecheck.log` (`issues/260804-0840…`, `260804-0839…`). State the rule, not the list. `&&` is the way through, and it is also what makes the command correct in the shell. **The same question is asked of the segment that MOVES.** `&&` guarantees the and-or list to its left rather than the previous segment, and does not reach into a pipeline — so a `cd` on a `||`-joined segment may never have run (`A || B && C` is `(A || B) && C`), and a `cd` on a `|`-joined one runs in a bash subshell that cannot move the caller. Both were allowed and both deleted the rule (`issues/260804-0836…`, `260804-0837…`, closed by `decisions/260804-0947…`, option 4); both deny now. One table answers both questions for a joiner — may a `cd` behind it be carried forward, and does a `cd` in it move the calling shell — and it is a **safe-list**, so a joiner added to the lexer later is unsafe on both counts until someone argues otherwise. The cost is the same rule seen from the other side and it is an open set, not a list: a `cd` on a `||` or `|` gives the directory up even where the shell would have made the move, so `[ -d nope ] || cd build && rm out.js` denies although its `cd` really runs, and `cd rules && true || cd /tmp && rm x.md` denies although an absolute `cd` looks like it re-proves the directory. Measured on a generated cross-product of 41,648 commands: **1,418 newly deny, 0 newly allow**, and all 1,418 carry a `||` or a `|` in front of the directory builtin — the cost is exactly the shape the rule names and does not spill. On the suite's own 4,424-string harvest and on a 30-row corpus of ordinary agent work, **0 rows moved in either direction**. What stays open is the over-deny in the other direction (`issues/260804-0839…`): a conditional body, a loop body, a brace group and a pipeline stage degrade although the shell guarantees the `cd`. That one needs a reachability model rather than a joiner, and the family is not uniform — `until cd X; do W; done` runs its body when the `cd` **failed**, so its deny is correct and must survive the fix. This needed the shared lexer to report the operator joining each segment (`ParsedSegment.joiner`); the git classifier consumes the separate flat segmenter and is unaffected, which the suite pins against a gold file of its own previous verdicts (`circles/260801-1244-guard-rules-write/decisions/260803-2338_i_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`).
- **Quoted operands are read as paths.** `mv 'rules/x.md' /tmp/` is denied; `mv 'my file.txt' /tmp/` is not. A quoted *command* stays inert (`echo 'rm -rf rules/'`, `echo "rm -rf rules/"`), as does a **quoted-delimiter** heredoc body (`<<'EOF'`). A double-quoted span is inert only when there is nothing in it for bash to expand: one carrying `$`, a backtick or an escape stays code, so `echo "$(rm rules/x.md)"` is still classified and denied. An **unquoted** delimiter (`<<EOF`) leaves the body as code, because bash still expands there, so a heredoc body containing `rm rules/x.md` is classified and denied — deliberate, and the reason to quote the delimiter when the body contains shell-looking text.

**`CDPATH` in the environment is read, and it is the only variable that is.** Bash and zsh search `CDPATH` for a **bare-word** `cd` operand and take the first entry that holds the name, which need not be the current directory. An assignment written into the command (`CDPATH=.. cd agents`) is visible to the classifier; one exported in the user's own shell profile is not, and the Bash tool's shell is initialised from that profile. So the guard reads `process.env.CDPATH` — which is the **hook process's** environment, a frozen snapshot of Claude Code's launch environment, and equal to the tool shell's only when Claude Code was itself started from a shell that had sourced the profile (see the residual note below). When it is set and non-blank, a bare-word `cd` makes the working directory unknown, exactly as an unmodelled flag does, and the deny **names `CDPATH`** rather than the working directory — otherwise the reader goes hunting through a command that contains no cause. The two ways out are in the message: anchor the operand (`./x`, `../x`, or an absolute path — none of which `CDPATH` is consulted for), or unset the variable.

With `CDPATH` unset, which is the common case, nothing about the check changes; an empty or whitespace-only value counts as unset. The cost falls entirely on users who set it, and it is deliberate: the alternative was a guard that is quietly weaker for exactly those users, with no signal that it is (`decisions/260803-1803_a_…-cdpath-in-the-ambient-environment.md`). The residual it leaves errs toward deny — the guard asks whether the variable is set, not whether any entry on it could really divert this operand, because answering that means a filesystem probe per entry inside a classifier that is textual by design. A profile setting `CDPATH=.` therefore pays denials for `cd`s that would have landed where the model said. Note that a leading `.` is *not* a general shield: bash falls through to the next entry whenever the current directory does not hold the name.

A **second residual runs the other way**, and it is a reach the check does not have rather than a cost it imposes. `process.env` belongs to the hook, which Claude Code spawns directly — non-interactive, non-login, and never sourcing a shell profile — while the `Bash` tool's shell sources one per invocation. The two agree whenever Claude Code was launched from a shell that had already exported the variable, which is the ordinary case and was verified. They diverge on a launch from a GUI, an IDE extension host or a service manager, and when the profile is edited mid-session; in both, a `CDPATH` that is genuinely in force for the command is invisible here and the degrade does not fire. The only faithful source is the command's own shell, and querying it costs a subprocess per `Bash` call inside a classifier that is textual by design — the option the decision record already rejected — so the bound is documented in `ambientCdpathIsSet` and in `rules/protected-path-discipline.md` rather than closed.

**Fail-closed, and its bound.** When an operand of a *recognised* verb cannot be resolved to a literal — it still carries `$`, a backtick, or a leading `~`, or an earlier `cd` went somewhere only known at run time — the command is denied rather than guessed at. This is the behaviour most likely to surprise: `rm -rf ~/.cache/fusion`, `sed -i "s/$A/$B/" notes.txt` and `rm -rf "$(pwd)/build"` are all denied. The bound is that an **unrecognised** program is allowed however unparseable its arguments are, so `curl -o $OUT https://x` and `make $TARGET` are untouched. If a fail-closed deny is wrong for the case at hand, writing the path out literally clears it; the deny reason says so.

The bound covers a **redirection target** too, and it is drawn around the CAUSE rather than around the program. A target that cannot be read because of the **token** is allowed on a program outside the table: `npm test > "$LOG"`, `cat report.md > ~/backup.md`, `echo x > "$F"` and `echo x > "rules/$F"`. A target the guard cannot place because it does not know **where the shell is standing** is denied whatever the program is: `cd $D && echo x > y.md` denies, and `cd build && echo x > "$F"` — the same command with the directory known — allows. The distinction is that `y.md` has nothing unparseable in it; what failed is the guard's own directory model, and left allowed that route overwrote `agents/coder.md` with no flag through `pushd -n docs && echo pwned > agents/coder.md`, gaining an entrance with every directory the model learned to give up on. A redirect target that *resolves* is still checked whatever the program is — `sort /tmp/a > rules/x.md` and `curl -s https://x > rules/x.md` are denied.

What this bound does **not** buy is consistency with the unrecognised-program residual, and this paragraph claimed it did until 2026-08-04. **`curl -o rules/x.md` is allowed** — a literal protected path, no `$`, no flag — because `curl` is not in the verb table and `-o` is not a redirection operator. So the check is looser on that visible case than on `pushd -n docs && echo hi > notes.txt`, whose target is harmless, and the "no looser on the visible case than on the invisible one" claim was false in both directions (`circles/260801-1244-guard-rules-write/issues/260804-0841_p_…`). The line the bound actually draws is whether the write is inside the mechanism at all: a `>` puts its target in the written set whatever the program is, so the guard has already recognised the write and holds the operand, and the only thing missing is a working directory it has itself admitted it lost. Declining to model a program it never recognised is a bound; recognising a write and then allowing it because its own model failed is not (`circles/260801-1244-guard-rules-write/decisions/260804-0106_i_should-the-fail-closed-bound-be-drawn-around-the-program-or-around-the-cause.md`, `## The argument, corrected`).

**Where it stands down.** The whole check is skipped when cwd is the fusion plugin's own repository, exactly as the write tools are — the protected paths there are the files a fusion developer edits. The git branch policy is not skipped. There is no env override for a protected-path shell write; the answer is a human decision.

**The residual, stated plainly.** This check raises the cost of the bypass from zero to deliberate. It does not eliminate it, and no claim that `protectedPaths` is *enforced* should be made without that qualification. The largest gap is not one the classifier fails to see, and it is not confined to a symlink that was already there: **an agent can create the alias itself, in one allowed command, with no flag, and then write through it on either surface.** `ln -s ../agents/coder.md build/alias`, `ln agents/coder.md build/hardalias` and `cp -l agents/coder.md build/hardalias` are allowed, because `ln` and `cp` write only `build/alias` and `build/hardalias` and neither is protected; afterwards `echo pwned > build/alias` is allowed too, `Edit build/alias` is allowed on the write-tool surface, and `agents/coder.md` changes. The guard sees those commands in full and resolves every operand. It allows them because protection is decided on the *text* of a path (`lib/paths.ts`) and because only the operands a verb **writes** count — an invariant deliberately kept when this was decided, since it is what keeps every legitimate read of a protected file allowed and an agent that meets a denied `cp -l` after learning that reads are always fine is the failure the rule file exists to prevent (`circles/260801-1244-guard-rules-write/decisions/260803-1402_a_…`). Closing it means resolving every guarded path through the filesystem, which is a different design with a different cost. The other known and accepted gaps: operands arriving on stdin (`find … | xargs rm -rf` is allowed); any program not in the table (`curl -o`, `python3 -c`, `parallel`, a project's own build script) and the two that take a re-parsed string rather than an argument list (`eval '…'`, `bash -c '…'`); shell grammar that leaves an ordinary-looking word in command position (a `case` arm, a function definition) — and the same mechanism aimed at the directory model rather than at a verb, so `eval "cd rules"`, an alias or shell function named `cd`, and a `cd` inside a `source`d script all move the shell where a textual classifier cannot follow; verbs deliberately left out (`mkdir`, `chmod`, `chown`, `touch`, `tar`, `rsync`, `patch`, `gzip`) and the git subcommands that name their targets inside a patch (`git apply`, `git am`) or inside a `--pathspec-from-file` list; **git's directory ENVIRONMENT variables, which are not read at all** — `GIT_WORK_TREE=` and `GIT_DIR=` move git exactly as `-C` and `--work-tree` do, so any git invocation whose real working directory came from the environment is checked against the wrong directory, including behind a wrapper (`env GIT_WORK_TREE=… git …`); measured, `cd build && GIT_WORK_TREE=../rules git clean -fdx` is allowed and empties `rules/` in a real repository, tracked files included, while the command-line spelling of the same fact denies (`issues/260804-1332…`, deferred to `circles/260804-1205-shell-reachability-model`). Note that `GIT_WORK_TREE=rules git clean -fdx` at the project root denies on the root's own write-through rather than on the variable, so that deny is not coverage of this residual; the redirect target of a program outside the table whose TOKEN cannot be read (`echo x > "$F"`, where `$F` may be `rules/x.md`) — the deliberate half of the fail-closed bound, and no longer the route every directory give-up fed into; walking out and back by name (`cd .. && cd project && rm rules/x.md`); two sibling `$(…)` substitutions inside one segment sharing a directory; a backslash-escaped `)` in a filename losing its paren to the subshell-paren strip; and glob or brace expansion, which is matched as literal text so `rm -rf *` and `rm -rf {rules,agents}` are allowed. One residual errs the other way: a `#` **comment is not stripped**, so `ls -la # writes > rules/x.md` is denied on the redirection its comment only describes. A shell can construct a path at run time; the fail-closed rule covers the constructible cases the classifier can see, not every case. Completeness was never the target.

The agent-facing statement of all of this is `rules/protected-path-discipline.md`, loaded into every agent at Setup so a deny meets an agent that already knows what to do instead.

### Clearing a halt

When the guard halts, all writes are blocked. To clear:

```bash
node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/clear-halt.js
```

Or from within a Claude Code session, the orchestrator can invoke this at a human gate.

### Adding a decision

Edit `config.json` and add an entry under `decisions`:

```json
{
  "decisions": [
    {
      "id": "my-rule-001",
      "category": "my-category",
      "statement": "Description of what this rule protects and why",
      "ruleFile": "rules/relevant-file.md"
    }
  ]
}
```

Then ensure `my-category` is mapped in `categoryPaths`:

```json
{
  "guard": {
    "categoryPaths": {
      "my-category": ["path/to/protected/files/**"]
    },
    "categorySensitivity": {
      "my-category": "medium"
    }
  }
}
```

### Viewing the event log

```bash
cat fusion-workbench/.guard-state/events.jsonl | jq .
```

Or tail it in a second terminal during a session:

```bash
tail -f fusion-workbench/.guard-state/events.jsonl | jq .
```

### Running tests

```bash
cd hooks && npm install && npx vitest run
```

### Rebuilding after TS changes

```bash
cd hooks && npm install && npm run build
```

The compiled `hooks/dist/` directory is committed to the repo and ships with the plugin.

## Origin

Ported from Fusion's guard system (`fusion/reactor/pkg/guard/`):
- `decision_guard.go` → `guard.ts` + `lib/config.ts` + `lib/paths.ts`
- `escalation.go` → `lib/escalation.ts`
- `churn_heatmap.go` → `lib/churn.ts`
- `event_parser.go` → `lib/events.ts`

The key difference: Fusion intercepts via the SDK's `canUseTool` callback in a running Go server. The Compliance Guard intercepts via Claude Code's native hook system — external scripts invoked per tool call.

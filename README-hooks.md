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
| `lib/shell-parse.ts` | The shared shell lexer: strips data regions (quotes, heredoc bodies), splices backslash line continuations, segments on `;`/`&&`/`\|\|`/`\|`/`&`/newline, recurses into `$(…)` and backticks, tokenizes. Two modes: `blank` (quoted content erased, for the git classifier) and `capture` (quoted content preserved as an operand, for the mutation classifier) | Yes |
| `lib/command-word.ts` | Which token of a segment names the program: skips env assignments, shell grammar words (`if`, `while`, `do`, …) and wrapper programs (`sudo`, `exec`, `xargs`, …), and resolves quoting, a path and a backslash escape. Shared by both Bash classifiers so neither can be blind to a form the other sees | Yes |
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
| In-place rewrite | `sed -i`, `perl -i`, `truncate`, `tee`, `dd of=…`, `git restore --source=…` |
| Redirection | `>`, `>>`, `>\|`, `N>`, glued (`>file`) or separated (`> file`) |

Only the operands a verb *writes* count, so `cp rules/x.md /tmp/y` reads a protected path and is allowed while `cp /tmp/y rules/x.md` is denied. Redirection is scanned position-independently, because `>` makes any program a mutation. A file-descriptor target (`2>&1`, `>&2`) and `> -` are skipped, and an operator inside a double-quoted string is not an operator at all — bash redirects nothing there, so `git commit -m "docs: rules/a.md -> rules/b.md"` is prose.

Two of the git rows only mutate under a flag, which is what keeps the read and revert forms allowed: `git clean -n rules` is a dry run and `git clean -fdx rules` is not; `git restore rules/x.md` and `git restore --staged rules/x.md` are fusion's own revert strategy and `git restore --source=HEAD~1 rules/x.md` overwrites from anywhere in history. A third, `git stash`, is discriminated by its **sub-subcommand** rather than by a flag: only `git stash push` names working-tree paths (as does the bare `git stash -- <paths>` form it stands for), so `pop`, `list`, `show`, `apply`, `drop`, `clear` and `save` write nothing the guard reads — from any directory — and a `-m` message or a `stash@{0}` ref is never read as a path. `git apply` and `git am` name their targets inside the patch file rather than on the command line and are **not** reached — they sit in the residual list with `patch`.

**Four things widen a row's reach**, and each was reviewed and accepted with the table:

- **The command word is resolved before it is read.** A leading `VAR=value` assignment, a shell grammar word (`if`, `elif`, `while`, `until`, `then`, `else`, `do`, `!`, `{`, `coproc`), a wrapper program (`sudo`, `doas`, `env`, `command`, `exec`, `nice`, `ionice`, `timeout`, `xargs`, `time`, `nohup`, `setsid`, `stdbuf`), a path, quoting and a backslash escape are all skipped or removed: `sudo env rm rules/x.md`, `if rm -rf rules; then :; fi` and `\rm -rf rules` classify as the `rm` they are. The resolution lives in `lib/command-word.ts` and both Bash classifiers share it.
- **Ancestor directories count**, in both directions: `rm -rf rules` and `mv hooks /tmp` destroy or relocate a protected path without naming it, and `cp /tmp/x hooks/` writes into a directory that contains one. `rm -rf node_modules`, `rm -rf dist` and `rm -rf hooks/dist` are unaffected; the project root is excluded, so `cp x .` is allowed.
- **A `cd` is tracked.** A virtual working directory is carried across a compound command's segments, so `cd fusion-workbench && rm -rf .guard-state` is denied while `cd build && rm -rf out` is allowed. `(…)` and `$(…)` scope it the way bash does.
- **Quoted operands are read as paths.** `mv 'rules/x.md' /tmp/` is denied; `mv 'my file.txt' /tmp/` is not. A quoted *command* stays inert (`echo 'rm -rf rules/'`, `echo "rm -rf rules/"`), as does a **quoted-delimiter** heredoc body (`<<'EOF'`). A double-quoted span is inert only when there is nothing in it for bash to expand: one carrying `$`, a backtick or an escape stays code, so `echo "$(rm rules/x.md)"` is still classified and denied. An **unquoted** delimiter (`<<EOF`) leaves the body as code, because bash still expands there, so a heredoc body containing `rm rules/x.md` is classified and denied — deliberate, and the reason to quote the delimiter when the body contains shell-looking text.

**Fail-closed, and its bound.** When an operand of a *recognised* verb cannot be resolved to a literal — it still carries `$`, a backtick, or a leading `~`, or an earlier `cd` went somewhere only known at run time — the command is denied rather than guessed at. This is the behaviour most likely to surprise: `rm -rf ~/.cache/fusion`, `sed -i "s/$A/$B/" notes.txt` and `rm -rf "$(pwd)/build"` are all denied. The bound is that an **unrecognised** program is allowed however unparseable its arguments are, so `curl -o $OUT https://x` and `make $TARGET` are untouched. If a fail-closed deny is wrong for the case at hand, writing the path out literally clears it; the deny reason says so.

The bound covers a **redirection target** too, which is the one place it used to leak: `npm test > "$LOG"` and `cat report.md > ~/backup.md` are allowed, because neither program is a table row. A redirect target that *resolves* is still checked whatever the program is — `sort /tmp/a > rules/x.md` and `curl -s https://x > rules/x.md` are denied — so what the bound gives up is the unresolvable target of a program the table does not know. That is deliberate: the table already allows `curl -o rules/x.md`, a literal protected path with an unrecognised program, and a rule cannot be looser on the visible case than on the invisible one.

**Where it stands down.** The whole check is skipped when cwd is the fusion plugin's own repository, exactly as the write tools are — the protected paths there are the files a fusion developer edits. The git branch policy is not skipped. There is no env override for a protected-path shell write; the answer is a human decision.

**The residual, stated plainly.** This check raises the cost of the bypass from zero to deliberate. It does not eliminate it, and no claim that `protectedPaths` is *enforced* should be made without that qualification. The largest gap is not one the classifier fails to see: **an alias to a protected file can be created and then written through.** `ln -s ../agents/coder.md build/alias` and `cp -l agents/coder.md build/hardalias` are allowed, because `ln` and `cp` write only `build/alias` and `build/hardalias` and neither is protected; afterwards `echo pwned > build/alias` is allowed too, on both surfaces, and `agents/coder.md` changes. The guard sees those commands in full and resolves every operand. It allows them because protection is decided on the *text* of a path (`lib/paths.ts`), so any shell can manufacture a second, unprotected name for a protected file. Closing it means resolving every guarded path through the filesystem, which is a different design with a different cost. The other known and accepted gaps: operands arriving on stdin (`find … | xargs rm -rf` is allowed); any program not in the table (`curl -o`, `python3 -c`, `parallel`, a project's own build script) and the two that take a re-parsed string rather than an argument list (`eval '…'`, `bash -c '…'`); shell grammar that leaves an ordinary-looking word in command position (a `case` arm, a function definition); verbs deliberately left out (`mkdir`, `chmod`, `chown`, `touch`, `tar`, `rsync`, `patch`, `gzip`) and the git subcommands that name their targets inside a patch (`git apply`, `git am`); a `git clean -fdx` with no path operand, which names no directory to compare, exactly as `rm -rf *` does not; the unresolvable redirect target of a program outside the table (`echo x > "$F"`); walking out and back by name (`cd .. && cd project && rm rules/x.md`); two sibling `$(…)` substitutions inside one segment sharing a directory; a backslash-escaped `)` in a filename losing its paren to the subshell-paren strip; and glob or brace expansion, which is matched as literal text so `rm -rf *` and `rm -rf {rules,agents}` are allowed. One residual errs the other way: a `#` **comment is not stripped**, so `ls -la # writes > rules/x.md` is denied on the redirection its comment only describes. A shell can construct a path at run time; the fail-closed rule covers the constructible cases the classifier can see, not every case. Completeness was never the target.

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

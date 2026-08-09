# Compliance Guard — Claude Code Hook System

The Compliance Guard intercepts agent tool calls in real time, blocking writes to protected paths and escalating changes to decision-governed areas. It is the `.claude` agent system's equivalent of Fusion's Decision Guard.

## Concept

When Claude Code executes a Write, Edit, MultiEdit, or NotebookEdit tool call, the hook system runs *before* the write happens. The guard checks the target file path against three layers of rules:

1. **Halt check** — if the guard has been halted (after repeated violations), *all* writes are blocked until a human clears it
2. **Protected paths** — files that agents must never modify directly (agent definitions, rules, workbench state)
3. **Decision-governed categories** — files governed by project decisions, with configurable sensitivity levels

If a check fails, the tool call is denied and the agent receives the reason — including which decision(s) the write would violate. This gives the agent explicit feedback about *why* it was blocked, not just that it was.

`Bash` calls reach the hook as well, and nothing about them is inspected. The guard fingerprints the protected paths around a shell call and allows it. Two policies used to read the command text here — one predicting which files a command would write, one predicting whether it would move HEAD — and both are gone, along with the shell lexer they shared. What a shell did to a protected path is **measured**, the same way it is for the write tools — see [Protected paths are measured, not predicted](#protected-paths-are-measured-not-predicted) below, and `rules/protected-path-discipline.md`.

### Escalation

Consecutive blocks accumulate. After a configurable threshold (default: 3), the guard enters **halt mode** — blocking all write operations until a human reviews the situation and clears the halt. This catches the pattern where an agent repeatedly attempts a disallowed action.

### Churn Detection

A PostToolUse tracker records every file mutation. When the same file is changed too many times in a session (thrashing), it emits `churn_warning` / `churn_critical` events that the monitor and orchestrator can see. Churn detection is **observation-only**: it is a signal, not an enforcement point.

The thresholds are **per session only**. `totalChanges` is still counted and still written to `churn.json`, because the orchestrator reads it at Setup, but nothing compares it against a limit. It used to: the counter is monotonic for the life of a project, so the first file to cross the lifetime critical made every later write report a critical, permanently, and the panel filled with rows that carried no information (decision `260809-2004`). The same decision removed the cross-file ping-back tracker outright — nothing consumed its verdict and its reset function never had a caller.

The same hook carries one thing that is not observation-only — the protected-path measurement. PostToolUse still cannot *block*, because the tool has already run; what it can do is put a changed protected path back and raise the halt, which stops the next write. So a halt now has two sources: three consecutive PreToolUse blocks, or one measured change to a protected path.

## Architecture

```
Claude Code
  |
  +-- SessionStart
  |     +-- exports FUSION_PLUGIN_ROOT to $CLAUDE_ENV_FILE
  |     +-- emits the "Fusion loaded" systemMessage banner (static printf)
  |     \-- session-start.ts
  |           |   Warns when the workbench root sits ABOVE the working
  |           |   directory instead of at it. Silent otherwise.
  |           \-- lib/workbench-root.ts   (the same upward walk every hook uses)
  |
  +-- PreToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash)
  |     \-- guard.ts
  |           |   Bash is inspected for NOTHING. It is here so the protected
  |           |   paths are fingerprinted around it, as on all five tools.
  |           +-- lib/protected-snapshot.ts  (fingerprint BEFORE the call)
  |           +-- config.json (rules, paths, decisions, thresholds)
  |           +-- fusion-workbench/.guard-state/protected-snapshot.json (the before-picture)
  |           +-- fusion-workbench/.guard-state/escalation.json (halt flag, block count)
  |           \-- fusion-workbench/.guard-state/events.jsonl (audit log)
  |
  +-- PostToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash)
        \-- tracker.ts
              |   Fingerprints again, restores what changed, raises the halt.
              +-- lib/protected-snapshot.ts  (fingerprint AFTER, diff, restore)
              +-- fusion-workbench/.guard-state/churn.json (per-file change counts)
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
          { "type": "command", "command": "[ -n \"${CLAUDE_PLUGIN_ROOT}\" ] && echo \"export FUSION_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}\" >> \"$CLAUDE_ENV_FILE\" || true" },
          { "type": "command", "command": "printf '%s\\n' '{\"hookSpecificOutput\":{\"hookEventName\":\"SessionStart\",\"systemMessage\":\"Fusion loaded. Orchestrator sessions: run /fusion:setup before any other work.\"}}'" },
          { "type": "command", "command": "node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/session-start.js" }
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

- **Enabled** — `guard.enabled` is the master on/off switch; `false` disables the guard entirely, the protected-path measurement included
- **Protected paths** — which files are off-limits: denied outright to the write tools, and measured around every guarded tool call so a change reaching one any other way is put back
- **Category paths** — which file areas map to which decision categories
- **Decisions** — the actual rules, each with an ID, category, statement, and optional rule file reference
- **Sensitivity** — how aggressively each category escalates (none/low/medium/high)
- **Thresholds** — when to escalate (blocks before halt, churn limits)

These are the plugin's defaults. A consuming project overrides them per project, without touching the plugin, through `fusion-guard.json` at its own root — see [Per-project configuration](#per-project-configuration-fusion-guardjson).

### 3. Start a Claude Code session

The hooks activate automatically on session start. No manual startup needed.

### Start your session at the project root

Start Claude Code in the directory that holds `fusion-workbench/`. Starting one or more
levels below it leaves fusion working, but not everywhere — and the first screen of the
session now says so:

```
fusion: restart this session at the project root.

  project root:      /home/you/acme
  working directory: /home/you/acme/fusion-workbench

This session started below the project root. Some of fusion's checks
resolve against the working directory instead of the root, so from here
they inspect the wrong directory and let through what they would
otherwise stop. The workbench itself is found by walking up, so your
files and settings are still read from the right place.
```

The split behind it is small: `lib/workbench-root.ts` walks up from the working directory
looking for `fusion-workbench/.fusion-setup`, so the root it finds is either the working
directory itself or an ancestor of it. Found at the working directory, or not found at all
(not a fusion project), the hook stays silent. Found above it, you get the message.

**What the warning does and does not do.** It changes no behaviour and blocks nothing. It
exists because several of fusion's checks resolve against the working directory rather than
the project root — the PreToolUse write-tool deny (`lib/project-relative.ts`) and the
plugin-repo detection (`lib/self-detect.ts`, `bin/fusion-plugin-cwd`) among them — and from
a subdirectory each of those inspects a directory that is not the project's. Teaching each
one to walk up separately would be several special cases with several chances to disagree.
One message at the moment the working directory is chosen, and still cheap to change, makes
the assumption they share audible instead.

The protected-path *measurement* is not among them: it anchors at the workbench root and is
unaffected by where the session started (`lib/protected-snapshot.ts`, `measurementRoot`).
So a protected path is still restored from a subdirectory. What you lose is the clean
refusal *before* the write.

## Files

| File | Purpose | Committed? |
|------|---------|------------|
| `session-start.ts` | SessionStart hook — warns when the session started below the project root. See [Start your session at the project root](#start-your-session-at-the-project-root) | Yes |
| `guard.ts` | PreToolUse hook — fingerprints the protected paths, then checks and blocks writes | Yes |
| `tracker.ts` | PostToolUse hook — fingerprints the protected paths again, restores whatever changed and raises the halt; then records changes and detects churn | Yes |
| `clear-halt.ts` | Manual halt reset utility | Yes |
| `config.json` | Guard rules, decisions, thresholds | Yes |
| `lib/paths.ts` | Glob-to-regex path matching | Yes |
| `lib/project-relative.ts` | Normalises a written path into the project-relative spelling every protected pattern is matched in | Yes |
| `lib/protected-snapshot.ts` | The measurement: enumerates the protected paths, fingerprints each one (its bytes in base64, or `ABSENT`), diffs two fingerprint sets, and puts a path back to the one it carried before the call. It owns the format and decides nothing — no halt, no event, no exemption verdict; those are `tracker.ts`'s | Yes |
| `lib/reverted-copy.ts` | Keeps what a protected path was observed to hold, under `fusion-workbench/.guard-state/reverted/`, before the guard writes the before-fingerprint back over it. The guard measures a window and cannot tell the agent's write from a human editor's save inside it, so it can revert work nobody asked it to revert; the copy is what makes such a revert recoverable rather than destructive. Retention is a count (the most recent 20), not an age | Yes |
| `lib/rules-write-exemption.ts` | The `FUSION_ALLOW_RULES_WRITE` boundary. Two entry points, because the two surfaces ask different questions: `isProjectRulePath` guards a path an agent is *about* to write (`..` escape, symlink and hard-link gates all have an object there), `isObservedRulePath` judges a path that already changed, where only "is it a rule path" and "did the project declare it itself" still mean anything | Yes |
| `lib/fs-locator.ts` | The filesystem adapter behind the exemption's second gate — resolves symlinks, path folding, and hard links so a planted alias cannot spend the grant | Yes |
| `lib/config.ts` | JSON config loader | Yes |
| `lib/escalation.ts` | Escalation state management | Yes |
| `lib/events.ts` | Append-only event logger | Yes |
| `lib/fail-open.ts` | The ordering rule both hooks run on: the verdict goes to stdout first and unguarded, every record of it after, each in its own `try`, so a failed report cannot withdraw the answer it reports. `failOpen` is the error tail of each entry point; `answer` and `bestEffort` carry the same rule to the fourteen sites inside `main` where an escalation save, an event append or the churn heatmap stood ahead of the verdict. The reports append under `.guard-state/`, the likeliest thing to have failed, which is how reporting first turned a deny into `{}` and swallowed the halt sentence | Yes |
| `lib/guard-state-file.ts` | The read-coerce-write seam under `fusion-workbench/.guard-state/`: resolves one state file, reads it, hands whatever it holds to the caller's coercion, and writes it back atomically. The coercion is a parameter, so absence, unparseable text and a valid JSON value of the wrong shape are one answer and no state module has anywhere to put an `as` cast — the defect that let a `{}` state file discard the protected-path halt message. `escalation.ts` and `churn.ts` both use it; escalation wraps it with the merge its save needs, which re-reads the file so a halt another process raised since the load survives. `protected-snapshot.ts` is the only module outside the seam, and deliberately: its load answers `null` rather than an empty state, its save removes the stale file when its own write fails, and its read unlinks as it goes | Yes |
| `lib/churn.ts` | Churn heatmap tracker | Yes |
| `lib/workbench-root.ts` | Walks up from cwd to find `fusion-workbench/.fusion-setup` (single source of truth for workbench presence in TS) | Yes |
| `lib/self-detect.ts` | Detects the fusion plugin's own repo so the **write** guard stands down — the write tools and the protected-path measurement alike, since the protected paths are what a fusion developer edits here. Two entry points, on purpose: `isFusionPluginCwd()` asks about cwd for the write tools, `isFusionPluginRoot(dir)` asks about a named directory so the measurement can ask about the workbench root it walked up to | Yes |
| `package.json` | Dev dependencies (tsx, typescript, vitest) | Yes |

## Usage

### Tuning or disabling the guard

The guard runs on a spectrum — full enforcement, advisory, or off — assembled from fields already in `config.json` (plus two session env vars). Pick the row that matches how much friction you want:

| Goal | Change |
|---|---|
| Off entirely | `guard.enabled: false` — disables the write guard **and** the protected-path measurement. Plugin `hooks/config.json` only: a project's `fusion-guard.json` cannot set `enabled` (see [Per-project configuration](#per-project-configuration-fusion-guardjson)) |
| Advisory-only (blocks only the guard-config floor) | keep `enabled: true`; set `protectedPaths: []`; leave decision sensitivities at `medium`/`low` (only `high` blocks). An empty list **narrows** the protected set to the self-protection floor rather than standing the check down: the file that declares the list exists by declaring it, and once `fusion-guard.json` exists the effective list keeps that file in both spellings (see [Per-project configuration](#per-project-configuration-fusion-guardjson)) — so a write-tool call aimed at it denies, and a change reaching it any other way is measured and put back |
| Looser, not off | trim `protectedPaths`, raise the `churn.*` thresholds, keep sensitivities ≤ `medium` |
| Let an agent edit **rule files** for one session | session env `FUSION_ALLOW_RULES_WRITE=1` — not config. Exempts the project's rule directories and the `retired/` destination inside them and nothing else; every other protected path stays protected on both surfaces, the guard is not turned off, and an active halt is not cleared. Each exempted write emits a `guard_advisory` event |
| Clear a stuck halt | `cd <project-root> && node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/clear-halt.js` — the halt is project-scoped and the script locates it by walking up from its working directory, so the `cd` is part of the command (see [Clearing a halt](#clearing-a-halt)) |

Three things cause a block, and only these: a **write-tool call on a protected path** (any sensitivity), a write to a **decision-governed path at `high` sensitivity**, and an active **halt**. Nothing a shell command says causes one — a change to a protected path that reaches disk by any route other than a write tool is not blocked at all, it is measured afterwards, put back, and it raises the halt (see [Protected paths are measured, not predicted](#protected-paths-are-measured-not-predicted)). Churn detection is advisory: it emits warning events but never blocks. `guard.enabled: false` stands the whole guard down.

**How a path is matched.** On the *text* of the path — no symlink is resolved on the protection side — and with **case folded**, on both surfaces. `Edit AGENTS/coder.md`, `Edit HOOKS/config.json` and `Edit Rules/x.md` deny exactly as their lower-case spellings do, and the measurement watches `AGENTS/coder.md` exactly as it watches `agents/coder.md`. Until the fold landed, none of that held: a glob compiles to a case-sensitive regex, so on any case-insensitive filesystem — APFS in its default configuration, so every stock macOS install, and a case-insensitive Windows volume — the entire `protectedPaths` list was bypassable by shifting one letter, with no flag involved.

The fold is **unconditional**, not conditional on the filesystem, so the boundary is the same everywhere rather than something to look up per platform. The cost is over-blocking where case genuinely distinguishes two files: measured on a case-sensitive volume holding both, `Edit AGENTS/coder.md` denies although it is not `agents/coder.md`. A project that deliberately keeps both spellings of a protected path will find one of them unwritable. That trade was made deliberately. The `FUSION_ALLOW_RULES_WRITE` exemption is **not** folded: with the flag set, `Edit rules/x.md` is allowed and `Edit RULES/x.md` is denied, because widening a grant is the one direction a guard may not move.

**Both rule roots are protected, and they are protected identically.** `bin/fusion-rules` loads a project's rules from `./rules/` (fusion-agent-specific) and from `.claude/rules/` (project-wide, and by the lean-`CLAUDE.md` convention the heavier of the two), with no precedence between them — an agent reads every emitted path. So the shipped list names `rules/**` and `.claude/rules/**` alike, and matching is anchored, which is why the second entry is needed at all: `.claude/rules/CODING-HYGIENE.md` never matched `rules/**`. Until 2026-08-09 it did not appear, and the protection was inverted relative to the content — an agent could not touch a thin capture-layout file in `./rules/` while it could rewrite the coding-hygiene rules that bind it. `FUSION_ALLOW_RULES_WRITE` reaches both roots on the same terms, and a project that declares either of them in its own `fusion-guard.json` withdraws the flag from that one.

**A hard-linked rule file is not exempt either, and this is the refusal users are most likely to meet without having chosen the state.** The exemption resolves a path through the filesystem to establish that writing this name writes only a rule file. `realpath` can prove where a symlink goes; it can prove nothing about a second name pointing at the same inode, so a rule file with more than one name is refused even with the flag set. `rsync --link-dest`, `cp -al` and `git clone --local` all produce hard-linked trees, so a user who curates rules inside one meets the deny without having done anything unusual. The refusal says so at the point of denial (`hooks/lib/rules-write-exemption.ts`, `REFUSAL_NOTES["hard-link"]`); rewriting the command does not help, and the decision is the user's.

A halt blocks the **write tools** until a human clears it — every `Write`, `Edit`, `MultiEdit` and `NotebookEdit` call:

```
[HALTED] All write operations blocked. The guard has been halted after
repeated violations. The halt is recorded per project and the clearing script
finds it by walking up from its working directory, so the `cd` is part of the
command: cd <project-root> && node <plugin-root>/hooks/dist/clear-halt.js
```

Both placeholders are filled in for real in the live message — the halt names the
project root it was recorded under and the plugin root it was loaded from.

It does **not** reach the shell any more. The halt used to block every `Bash` command the mutation classifier recognised as a write, which meant asking the undecidable question in miniature — "does this command write a file at all?". With the classifier gone the shell runs under a halt, and a protected path that changes there is measured and put back regardless of the halt. What a halt costs an agent is therefore the four write tools; reading was always unaffected and still is, deliberately, so an agent can find out why it is halted and tell the user how to clear it.

In the event log the halt rows are distinguishable by their detail: `Halt active — write tool call blocked` (a halted guard refusing a write), `Halt raised by this block — <cause>` (the PreToolUse block that turned the halt on), and `Halt raised by the protected-path measurement (<n> path(s) changed)` (the PostToolUse route). A third prefix, `Halt active — mutating Bash command blocked`, is written by nothing any more; historical rows still carry it, which is why the monitor keeps rendering it.

### Per-project configuration: `fusion-guard.json`

Everything `hooks/config.json` defines is the plugin's **default**, not the answer for a given project. A consuming project may ship `fusion-guard.json` at its project root — `/fusion:setup` seeds it from `templates/fusion-guard.json`, declaring nothing — and the guard hooks read it on every guarded tool call, merging it over the plugin's file and then over fusion's built-in defaults.

The file is **git-tracked on purpose**. It decides what the guard protects, so every change to it has to appear in a diff and pass the same review as the rest of the project. The diff is also what bounds the creation gap described under the floor below.

**The merge is per leaf key, not per object.** A key the project declares is taken exactly as written; a key it omits — even inside an object it did declare — inherits the plugin's value and falls back to fusion's built-in default only when neither file speaks. So `{"guard":{"defaultSensitivity":"high"}}` raises the sensitivity and keeps every protected path the plugin ships. Narrowing works because a declared value wins outright: `"protectedPaths": []` is the empty list, on purpose, not an inheritance — and fusion's built-in default for the protected list is *also* the empty list, so only the plugin's file stands between an omitted list and no protection at all. A value with the wrong type is dropped, named in a `guard_advisory` diagnostic, and then inherits exactly as an omitted key does; a file that is not valid JSON is dropped and reported the same way, never ignored in silence.

**A declared list does not grow when the plugin's does.** The merge is per leaf, so a project whose `fusion-guard.json` declares `protectedPaths` keeps exactly what it wrote and inherits nothing further — including a path fusion adds in a later version. The template `/fusion:setup` seeds declares nothing at all and therefore picks such an addition up on the next tool call, which is why the template deliberately does not restate the list. If you copied the plugin's list into your own file to add one entry, diff it against `hooks/config.json` after an update; `.claude/rules/**`, added on 2026-08-09, is the first entry to which this applies.

**`guard.enabled` is the one key the project layer may not set.** The on/off switch is read from the plugin layer and fusion's defaults only — a project does not switch off the guard that governs it. A declared value, `true` or `false`, is ignored, and the loader reports the ignored key in a `guard_advisory` naming it, on every guarded call until the line is removed, so the key is never silently inert. (The `guard.enabled` rows earlier in this document stay true as written: they describe the plugin's own `hooks/config.json`, which still sets the key.)

**The file protects itself, and that is the floor.** Once `fusion-guard.json` exists on disk the guard protects it — in its bare and absolute spellings, so the protection holds from a subdirectory working directory too — whatever the file itself says: when it declares an empty list, when it lists itself, when it no longer parses. `FUSION_ALLOW_RULES_WRITE` does not reach it either. Creating it is allowed, because that is how setup seeds it, and that window is the accepted residual, stated here at its measured reach: in a project where the file has never been created, an agent can write one that narrows `protectedPaths` — down to nothing — and the guard honours it from the next tool call onward, across **everything** on the effective list. Two bounds are measured with it: the creation and the narrowing are ordinary git diffs on a tracked file, and an active halt blocks the narrowing write itself, so an agent can narrow its way out of halts it has not yet earned, not out of one it is already in.

**A protected entry the project declares outranks `FUSION_ALLOW_RULES_WRITE`.** A path named in the project's own `guard.protectedPaths` is subtracted from the flag's exempt set, and the deny quotes the project's entry. A project that declares `rules/**` itself has withdrawn the flag from its whole rule directory, `retired/` included.

### Protected paths are measured, not predicted

Until 2026-08-07 this section described a classifier. `lib/bash-mutation-guard.ts` read a shell command's text and decided which files that command was about to write, so that a write aimed at `guard.protectedPaths` could be denied before it ran. That question is undecidable: a path can be assembled at run time, arrive on stdin, or pass through `eval`, an alias, a shell function or a variable no classifier sees. 12 923 lines were built against it, carrying 21 documented residuals, and four days in a real consuming project produced 17 blocks and 0 real hits. The classifier is gone, and nothing on the PreToolUse side replaces it (`circles/260804-1205-shell-reachability-model/decisions/260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`, option 3).

What replaced it asks a decidable question — *has a protected path changed?* — and answers it by comparing two fingerprints taken around one tool call:

1. **Before the call.** `guard.ts`, on all five guarded tools, enumerates every existing file the patterns match plus every pattern that names one path outright (which is what makes *creating* one measurable), records each path's bytes base64-encoded, and writes the set to `fusion-workbench/.guard-state/protected-snapshot.json`. Non-existence is its own fingerprint value, so created, modified and deleted all fall out of one string comparison instead of three branches that can disagree.
2. **After the call.** `tracker.ts` fingerprints again and diffs. The difference is exactly what this one tool call did, whichever route it took to the file: a write tool, a shell command of any shape, `eval`, an alias, a script the command invoked, a program nobody ever put in a table.
3. **Whatever moved is put back**, to the content it held before the call. The halt is raised outright rather than counted toward the three-block threshold — a protected path really was written, so there is no "two more of these" to wait for — one `guard_block` event per path names the file and the outcome, and the model is told what happened through `hookSpecificOutput.additionalContext`, measured against Claude Code 2.1.224 to arrive next to the tool result as a system-reminder. A PostToolUse hook cannot block; it can explain, and the binding decision makes the explaining refusal a constraint rather than a nicety.

**The before-fingerprint is the condition of admissibility, not a refinement.** Without it the only available comparison would be against `HEAD`, and reverting everything that differs from `HEAD` would revert a rule file the human is editing in their own editor right now. Only a pair taken around one tool call makes a change attributable to that call, and attribution is what makes reverting it permissible at all. When there is no before-picture — the guard is disabled, the project has no workbench, or cwd is the plugin's own repo — nothing is measured, and no fallback stands in for it.

**Content, not a digest; no size threshold, no special case for binaries.** A digest answers "did this change?"; only the bytes answer "change it back to *what*?". Carrying the content collapses the five branches a `HEAD` target needed (tracked and clean, tracked with the human's work already staged, untracked, created by this very call, no repository at all — of which one silently discarded human work and three could not restore anything) into a single one: write back what was there. The largest match set available is fusion's own repository, 53 files totalling 745 KB, where the measurement stands down anyway; a consuming project matches its own `rules/` and three small JSON files. One fingerprint run over the whole 53-file set was measured at 27 ms, and there are two runs per guarded tool call.

**`FUSION_ALLOW_RULES_WRITE` reaches the measurement**, through a narrower entry point than the write tools use (`isObservedRulePath` in `lib/rules-write-exemption.ts`). On an observed path the `..`-escape, symlink and hard-link gates have nothing left to decide — the file that changed is the file at that path, and no spelling of it could have meant another — so two questions remain: is it a project rule path, and did the project declare that very path in its own `fusion-guard.json`, thereby taking the grant back. An exempted change is left standing and recorded as a `guard_advisory` carrying the same detail the write-tool side records; everything else is restored.

**What the measurement does not reach.** Two bounds belong to the mechanism and are stated in `rules/protected-path-discipline.md` too, because an agent has to know them: the change happens *before* it is seen, so whatever the write set off in between (a watcher that reloaded, a build that started) is not undone with it; and a read is not a change, so a command that carries a protected file's content somewhere else trips nothing — which is true of any list-based guard rather than a gap this one could close. Two further residuals are the measurement's own. **Parallel tool calls** interleave the single snapshot file, so a change can be attributed to the wrong call or missed entirely; Claude Code offers no per-call correlation key in the hook payload, so this is stated rather than solved, and the exposure is under-reporting — a change that IS seen is always a real change to a protected path, so the revert is never wrong when it fires. A **symlinked directory** is skipped rather than walked (following one invites a cycle), so a link planted to reach outside the protected tree is not watched at its far end; a symlinked *file* inside a protected directory is fingerprinted by its target's content, so replacing what it points at is measured.

**Where it stands down.** The whole measurement is skipped when the fusion plugin's own repository is what the workbench root resolves to, for the same reason the write tools stand down there: the protected paths — `agents/**`, `rules/**`, the plugin manifest — are the work rather than the thing being protected, and reverting them would destroy a developer's own edits. `guard.ts` writes no snapshot there either, so there would be nothing to compare against in any case. Nothing else in the guard is still active there to skip.

The question is asked of the **root**, not of cwd (`isFusionPluginRoot(root)` inside `measurementRoot()`), and that is not a detail. The write tools still ask it of cwd (`isFusionPluginCwd()`), which is why the two halves can disagree in one directory: a fusion developer whose session started in `fusion-workbench/`. Once the measurement root began walking up, leaving its stand-down at cwd would have meant reverting that developer's own files on every tool call — a new defect traded for the closed one. The two roots move together.

The agent-facing statement of all of this is `rules/protected-path-discipline.md`, loaded into all sixteen agents at Setup. It is deliberately short — the rule, why the route to the file does not matter, the one exemption, and what to do instead — because with the classifier gone there is no longer a command grammar for an agent to learn.


### Clearing a halt

When the guard halts, all writes are blocked. To clear, **run it from the project
whose guard is halted**:

```bash
cd <project-root> && node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/clear-halt.js
```

The `cd` is load-bearing. The halt is project-scoped — it lives in
`<project-root>/fusion-workbench/.guard-state/escalation.json`, and the script
finds that file by walking up from its own working directory. The command is
spelled plugin-scoped, which used to invite running it from anywhere; from a
directory with no workbench above it the script reads the empty state, and the
empty state is not halted. It reported `Guard is not halted. No action needed.`
while the halt stood untouched in the project.

It no longer does. With no workbench above the working directory the script names
the directory it searched from, says that nothing was checked, and exits non-zero.
When it does find one it prints the workbench path first, so `Guard is not halted
in this project.` is always an answer about a named place.

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

`build` is `rm -rf dist && tsc`, and the wipe is the load-bearing half. `tsc` writes into `outDir` without pruning it, so deleting a source file leaves its compiled output behind — tracked in git, copied into `~/.fusion` by the installer, and readable there as a module the plugin no longer has. That happened once already, with the four files of the retired Bash classifier. `npm test` runs the same script (`npm run build && vitest run`), so a full build is the only way `hooks/dist/` is produced and it always matches the sources.

## Origin

Ported from Fusion's guard system (`fusion/reactor/pkg/guard/`):
- `decision_guard.go` → `guard.ts` + `lib/config.ts` + `lib/paths.ts`
- `escalation.go` → `lib/escalation.ts`
- `churn_heatmap.go` → `lib/churn.ts`
- `event_parser.go` → `lib/events.ts`

The key difference: Fusion intercepts via the SDK's `canUseTool` callback in a running Go server. The Compliance Guard intercepts via Claude Code's native hook system — external scripts invoked per tool call.

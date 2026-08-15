# Compliance Guard — Claude Code Hook System

The Compliance Guard intercepts agent tool calls in real time, escalating writes to decision-governed areas and halting after repeated blocks. It is the `.claude` agent system's equivalent of Fusion's Decision Guard.

## Concept

When Claude Code executes a Write, Edit, MultiEdit, or NotebookEdit tool call, the hook system runs *before* the write happens. The guard checks the target file path against two layers of rules:

1. **Halt check** — if the guard has been halted (after repeated violations), *all* writes are blocked until a human clears it
2. **Decision-governed categories** — files governed by project decisions, with configurable sensitivity levels

If a check fails, the tool call is denied and the agent receives the reason — including which decision(s) the write would violate. This gives the agent explicit feedback about *why* it was blocked, not just that it was.

A third layer sat between those two until 2026-08-12: a **protected-path** deny over a list of files agents were never to modify directly (agent definitions, rules, workbench state), backed by a fingerprint of every listed path taken before the call and compared again after it, so that a change reaching one by any route was written back. The whole half was removed — see [The protected-path half, and why it was removed](#the-protected-path-half-and-why-it-was-removed).

`Bash` calls reach the hook as well, and nothing about them is inspected: the guard allows a shell call immediately, without touching guard state. Two policies used to read the command text here — one predicting which files a command would write, one predicting whether it would move HEAD — and both are gone, along with the shell lexer they shared.

### Escalation

Consecutive blocks accumulate. After a configurable threshold (default: 3), the guard enters **halt mode** — blocking all write operations until a human reviews the situation and clears the halt. This catches the pattern where an agent repeatedly attempts a disallowed action.

### Churn detection was removed on 2026-08-15

A PostToolUse tracker used to record every file mutation in a heatmap under
`.guard-state/churn.json` and emit `churn_warning` / `churn_critical` events at configured
per-session thresholds. It never blocked anything: it was a signal the monitor's warnings
panel rendered and the orchestrator read at Setup through a `bin/` ranking helper. The
whole of it is gone — the module, that helper, the two event types, the two configuration
leaves, and the plugin-repo stand-down that existed only to keep a fusion developer's own
edits out of the count.

The PostToolUse hook is observation-only in full, and now measures rather than counts:
session-state drift, review coverage, staging drift. It carried one thing that was not
observation-only — the protected-path measurement, which put a changed protected path back
and raised the halt from a hook that cannot block. That went on 2026-08-12, so a halt has
exactly one source again: three consecutive PreToolUse blocks.

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
  |           |   Bash is inspected for NOTHING and allows immediately,
  |           |   writing no guard state at all.
  |           +-- config.json (rules, paths, decisions, thresholds)
  |           +-- fusion-workbench/.guard-state/escalation.json (halt flag, block count)
  |           \-- fusion-workbench/.guard-state/events.jsonl (audit log)
  |
  +-- PostToolUse (Write/Edit/MultiEdit/NotebookEdit/Bash)
        \-- tracker.ts
              |   Measures. Observation only: it cannot block, and it no
              |   longer raises or counts anything either.
              +-- fusion-workbench/.guard-state/{state-drift,review-coverage,
              |     staging-drift}.json (one throttle record per measurement)
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

- **Enabled** — `guard.enabled` is the master on/off switch; `false` disables the guard entirely
- **Category paths** — which file areas map to which decision categories
- **Decisions** — the actual rules, each with an ID, category, statement, and optional rule file reference
- **Sensitivity** — how aggressively each category escalates (none/low/medium/high)
- **Thresholds** — when to escalate (blocks before halt)

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
the project root — the PreToolUse decision-governed check (`lib/project-relative.ts`) and
the write-tool half of the plugin-repo stand-down (`lib/self-detect.ts`,
`bin/fusion-plugin-cwd`) among them — and from
a subdirectory each of those inspects a directory that is not the project's. Teaching each
one to walk up separately would be several special cases with several chances to disagree.
One message at the moment the working directory is chosen, and still cheap to change, makes
the assumption they share audible instead.

The tracker's three measurements are not among them: each is anchored at the workbench root
rather than at cwd, so each reports the same thing whatever directory the session started
in. The rule that anchoring follows — evaluate a stand-down where the mechanism keys its
state — is stated in `lib/self-detect.ts`. It was established on the protected-path
measurement and carried by the churn heatmap, and it outlived both.

## Files

| File | Purpose | Committed? |
|------|---------|------------|
| `session-start.ts` | SessionStart hook — warns when the session started below the project root. See [Start your session at the project root](#start-your-session-at-the-project-root) | Yes |
| `guard.ts` | PreToolUse hook — checks a write against the halt and the decision-governed categories, and blocks on either | Yes |
| `tracker.ts` | PostToolUse hook — runs the session-state, staging and review-coverage measurements and hands the model whatever they have to say. Observation only: a PostToolUse hook cannot block, and since 2026-08-12 it raises nothing either | Yes |
| `clear-halt.ts` | Manual halt reset utility | Yes |
| `turn-budget.ts` | Prints the orchestrator's Phase-2 Turn budget, merged from the project's `fusion-guard.json` (`{"orchestrator": {"maxTurns": <n>}}`), the plugin's `config.json` and the built-in defaults. For the orchestrator's Setup, through `bin/fusion-turn-budget`. No hook reads the value — it exists so the budget stops being prose: it was written into `agents/orchestrator.md` in seven places and four spellings, one of which already called it a "default" while nothing could override it (issue `260811-1712`). A value that is not a whole number of 1 or more is dropped, named on stderr, and inherits | Yes |
| `state-drift.ts` | Prints the session-state drift check for `/fusion:setup` Step 1 and `agents/orchestrator.md`. Run through `bin/fusion-state-drift`. Finding drift is `verdict=drift` on stdout, never a non-zero exit — a check that reports failure on its commonest path teaches its reader to ignore its status | Yes |
| `review-coverage.ts` | Prints the review-coverage tiling for `agents/orchestrator.md` Step 3c and Phase 4. Run through `bin/fusion-review-coverage`. Finding an uncovered range is `verdict=uncovered` on stdout, never a non-zero exit and never a release gate — whether a release may go out over an unreviewed range is an unfiled decision this program does not pre-empt | Yes |
| `config.json` | Guard rules, decisions, thresholds | Yes |
| `lib/paths.ts` | Glob-to-regex path matching | Yes |
| `lib/project-relative.ts` | Normalises a written path into the coordinate space its reader matches in: cwd-relative for `guard.categoryPaths`, the only caller left | Yes |
| `lib/config.ts` | JSON config loader | Yes |
| `lib/escalation.ts` | Escalation state management | Yes |
| `lib/events.ts` | Append-only event logger | Yes |
| `lib/fail-open.ts` | The ordering rule both hooks run on: the verdict goes to stdout first and unguarded, every record of it after, each in its own `try`, so a failed report cannot withdraw the answer it reports. `failOpen` is the error tail of each entry point; `answer` and `bestEffort` carry the same rule to the fourteen sites inside `main` where an escalation save, an event append or the churn heatmap stood ahead of the verdict. The heatmap went on 2026-08-15; the rule is what the sites keep. The reports append under `.guard-state/`, the likeliest thing to have failed, which is how reporting first turned a deny into `{}` and swallowed the halt sentence | Yes |
| `lib/guard-state-file.ts` | The read-coerce-write seam under `fusion-workbench/.guard-state/`: resolves one state file, reads it, hands whatever it holds to the caller's coercion, and writes it back atomically. The coercion is a parameter, so absence, unparseable text and a valid JSON value of the wrong shape are one answer and no state module has anywhere to put an `as` cast — the defect that let a `{}` state file throw on the next field access and discard the halt message the same tool call had already produced. `escalation.ts` and the three measurement throttle stores use it, and they are now the only callers: `protected-snapshot.ts`, the one module that never fitted the seam, went with the protected-path half, and `churn.ts` with the heatmap. Escalation wraps it with the merge its save needs, which re-reads the file so a halt another process raised since the load survives | Yes |
| `lib/git.ts` | The one `git` the measurements run: `execFileSync` in a named root, stderr discarded, every failure — not a repository, an unresolvable ref, a non-zero exit, the timeout — collapsed to `null`, because no caller distinguishes them and each turns "git would not say" into a report that claims nothing rather than into a fault. It existed verbatim in `review-coverage.ts` and `staging-drift.ts` and inline in `state-drift.ts` until decision `260811-1146`. The default timeout is a ref read's; `staging-drift.ts` passes a larger one at its `git status` call, which is the only call in the family that walks a working tree | Yes |
| `lib/state-drift.ts` | The session-state drift measurement (issue 260801-2038): compares `agentstate.yaml`, the active Circle's Turn log and the session history file against the two records that cannot silently freeze — git, and `orchestrator-events.jsonl`. Three callers share it and none of them is the session that installed it: `tracker.ts` on every guarded tool call, `state-drift.ts` behind `bin/fusion-state-drift`, and `bin/monitor` by way of the `state_drift` events the first two emit. It reports and never repairs — the session-state surfaces have exactly one writer and a second one is worse than a stale number | Yes |
| `lib/staging-drift.ts` | The staging-drift measurement (issue 260811-0114): reads `git status --porcelain` over the workbench and classifies every entry — `record` (an authored artifact no commit carries), `commit-message` (a commit-message-shaped **name** that no artifact store owns, which is where the improvised `.commit-msg-tmp` lands; the store scoping is what the class is, not a detail of it, because without it the name test also claimed every authored record whose topic slug says "commit message" and the model was told to delete it, issue 260811-1141), `in-flight` (live state and the machine-written surfaces, never a fault), `unclassified` (a user's own note, named with the statement that nothing is claimed about it). Two callers: `staging-drift.ts` behind `bin/fusion-staging-drift`, and `tracker.ts` on the one trigger of **HEAD having moved** since the previous tool call — read with `git rev-parse`, never inferred from the command's text. The commit is the first moment an unstaged record is a fault; mid-Turn it is the normal state. It reports and never stages, because a mechanism that staged would be a second author of a staging list whose whole value is that a human wrote every path in it. The name test alone is exported as `hasCommitMessageName`, because a second caller asks a different question of the same string — `commit-message-path.test.ts` asks whether a shipped prompt *prescribes* a message file inside the workbench, and a prescription pointing into a store is exactly what the location scoping forgives (issue 260811-1410). One pattern, two scopings, neither transcribed | Yes |
| `lib/review-coverage.ts` | The review-coverage measurement (issue 260810-1205): tiles the review files' own mandated `**Reviewed-range:**` fields against `git rev-list <session-start>..HEAD` and names, commit by commit, what no reviewer opened — plus the `**Not-opened:**` list the last pass declared, which is the next dispatch's scope. Two callers: `review-coverage.ts` behind `bin/fusion-review-coverage`, and `tracker.ts` on the one trigger of a review file landing. Deliberately NOT on the tracker's every-tool-call path, where `lib/state-drift.ts` sits: an uncovered range mid-Turn is the normal state, and a check that fires on its commonest path is one its reader learns to ignore. It reports and never gates | Yes |
| `lib/workbench-root.ts` | Walks up from cwd to find `fusion-workbench/.fusion-setup` (single source of truth for workbench presence in TS) | Yes |
| `lib/self-detect.ts` | Detects the fusion plugin's own repo so the guard's write-tool branch stands down in it. That stand-down was built for the protected paths — an edit to `agents/**` or `rules/**` is the work here, not a violation — and outlived that protection. Two entry points, on purpose: `isFusionPluginCwd()` asks about cwd, for `guard.ts`, whose verdict is computed in cwd's coordinate space; `isFusionPluginRoot(dir)` asks about a named directory, which is the form a root-anchored mechanism needs. Its last caller was the churn stand-down in `tracker.ts`, removed on 2026-08-15 | Yes |
| `lib/domain-cascade.ts` | Parses the domain cascade out of `agents/orchestrator.md` Setup Step 5 and **executes** it. No hook calls it — the gates do, so what they measure is the verdict a real project reaches rather than the layout of the prompt's branch lines. There is deliberately no second copy of the cascade in TypeScript: the interpreter runs the prompt's own block. That keeps *this file* from drifting and nothing else, which is where the claim used to overreach — a second copy shipped in `skills/cleanup/SKILL.md` in the pre-fix order while both gates read the orchestrator prompt alone (issue 260810-1918). The module now also *finds* a statement of the cascade, fenced or prose, and `domain-cascade.test.ts` runs that over the file set, allowing exactly one. How far that reaches is not described here and not described in the module either — it is the `REACH` object at the foot of the module, and [the section below](#how-far-the-domain-cascade-reach-gate-reaches) is rendered from it | Yes |
| `package.json` | Dev dependencies (tsx, typescript, vitest) | Yes |

### How far the domain-cascade reach gate reaches

One decision — which domain a workbench is — is stated in one place, `agents/orchestrator.md` Setup Step 5. A gate in `domain-cascade.test.ts` reads the plugin's own prompts, skill bodies and rule files and fails if a second one states it too.

**The paragraph below is generated.** It is rendered from the `REACH` object in `hooks/lib/domain-cascade.ts` by `describeReach()`, and the test suite compares this file against that output byte-for-byte. Editing it by hand fails the suite. That is the point: the claim about this gate has twice been broader than the gate itself — once asserting a second definition was impossible while one was shipping, once naming three holes when there were four — and a sentence generated from the thing that measures cannot say more than the measurement does. Each line below carries probes the suite runs, so a hole that gets closed and a claim that gets stale both turn the suite red.

Regenerate after changing `REACH`:

```bash
cd hooks && npm run build && cd .. \
  && node -e "import('./hooks/dist/lib/domain-cascade.js').then(m => console.log(m.describeReach()))"
```

<!-- BEGIN generated: domain-cascade reach -->

**Scanned:** `agents/*.md`, `skills/*/SKILL.md`, `rules/*.md` — every agent prompt, every skill body, every rule file. Exactly one of them may state the cascade.

**Caught.** Each line is asserted against probes in `domain-cascade.test.ts`:

- A domain name in backticks, double quotes, single quotes or asterisk bold. Four spellings, because nothing in this project requires one of them and `agents/taskplanner.md:128` writes the names bare.
- A paraphrase naming the counts in prose — code files, source files, data files, and the decisions, issues, analyses and commits the retired branches read — rather than by variable name.
- A paraphrase written with the cascade's own variable names.
- A stale copy restating the retired four-outcome cascade. Its two surviving outcomes still fire, and the four counts only the retired branches ever read are still recognised as inputs, so the likeliest second copy from here on is caught rather than walked past.
- One sentence hard-wrapped across two lines. A line and its continuation are scanned joined, which is the shape this repository's own 78-column prose produces by default.

**Not caught.** Each line is asserted to still be a miss, so closing one of these turns the suite red until this list is corrected:

- A domain name written as a plain word, with no markup around it. This is the plainest second copy anyone would write and it is NOT caught. Matching bare words was measured over the scanned set and rejected on cost, because both surviving domain names are ordinary English words in these files and `code files` is both a domain name and an input phrase. Measured cost of matching bare words, across the scanned set and outside the definition site: 12 lines of honest prose selected on single lines, 12 with the continuation window. The suite re-measures both numbers.
- A paraphrase spread across the rows of a table, or across three or more wrapped lines. A table row and a list item each open a block and are never joined to the line above them, and the window is two lines wide.
- A paraphrase naming no input. It names no evidence, so it restates less than the cascade decides.
- A paraphrase naming its inputs in words the prose list does not carry. The list is a fixed set of spellings, not a synonym set.

**Not scanned**, with what running the gate over it yields today:

- `docs/*.md` — clean. Left out on a measured cost that has since expired. `docs/philosophy.md:19` said what each of four domains PRIORITISED, in a line shape-identical to a paraphrase, and scanning `docs/` meant either that false positive or an exemption list. With two domains the line names no count and the directory now measures clean, so the reason for the exclusion is gone and only the exclusion is left. That is an uncovered directory, not a justified one.
- `CLAUDE.md` — clean. A consumer by the same contract that puts `rules/` in the file set, and it is not scanned. That is an uncovered file, not a justified exclusion: it is clean today and nothing keeps it clean.
- `README-hooks.md` — clean. Documentation about the gate, including this block. Not scanned, and it would be wrong to scan the file whose job is to quote the claim.

<!-- END generated: domain-cascade reach -->

## Usage

### Tuning or disabling the guard

The guard runs on a spectrum — full enforcement, advisory, or off — assembled from fields already in `config.json`. Pick the row that matches how much friction you want:

| Goal | Change |
|---|---|
| Off entirely | `guard.enabled: false`. Plugin `hooks/config.json` only: a project's `fusion-guard.json` cannot set `enabled` (see [Per-project configuration](#per-project-configuration-fusion-guardjson)) |
| Advisory-only (warns, never blocks) | keep `enabled: true`; leave every decision sensitivity at `medium`/`low`, since only `high` blocks. Nothing else in the guard blocks, so nothing else has to be turned down |
| Looser, not off | keep sensitivities ≤ `medium`, raise `escalation.blocksBeforeHalt` |
| Clear a stuck halt | `cd <project-root> && node ${CLAUDE_PLUGIN_ROOT}/hooks/dist/clear-halt.js` — the halt is project-scoped and the script locates it by walking up from its working directory, so the `cd` is part of the command (see [Clearing a halt](#clearing-a-halt)) |

Two things cause a block, and only these: a write to a **decision-governed path at `high` sensitivity**, and an active **halt**. There used to be a third — a write-tool call on a protected path, at any sensitivity — and with it went the only thing a `Bash` call could set off: a change to a protected path that reached disk by some other route was never blocked, it was measured afterwards, put back, and it raised the halt ([The protected-path half, and why it was removed](#the-protected-path-half-and-why-it-was-removed)). Nothing a shell command says causes a block, and since 2026-08-12 nothing a shell command *does* causes one either. Churn detection never blocked either, and it was removed on 2026-08-15. `guard.enabled: false` stands the whole guard down.

**How a path is matched.** On the *text* of the path — no symlink is resolved — against the globs in `guard.categoryPaths`, in the coordinate space of the process's working directory (`lib/project-relative.ts`). The match is **case-sensitive**. It was not always: the protected list was matched with case folded, unconditionally on every platform, because a glob compiles to a case-sensitive regex and on a case-insensitive filesystem — APFS in its default configuration, so every stock macOS install — the whole list was bypassable by shifting one letter. That fold was the protected list's and went with it; whether `findRelevantDecisions` should fold too is an open question and was open before the removal, on the argument that CHECK 3 escalates rather than denies outright (`circles/260801-1244-guard-rules-write/decisions/260804-1632_*_should-findrelevantdecisions-fold-case-…`). One of the two grounds that record rests on is gone with the list, so it is worth re-opening rather than reading as settled.

A halt blocks the **write tools** until a human clears it — every `Write`, `Edit`, `MultiEdit` and `NotebookEdit` call:

```
[HALTED] All write operations blocked. The guard has been halted after
repeated violations. The halt is recorded per project and the clearing script
finds it by walking up from its working directory, so the `cd` is part of the
command: cd <project-root> && node <plugin-root>/hooks/dist/clear-halt.js
```

Both placeholders are filled in for real in the live message — the halt names the
project root it was recorded under and the plugin root it was loaded from.

It does **not** reach the shell any more. The halt used to block every `Bash` command the mutation classifier recognised as a write, which meant asking the undecidable question in miniature — "does this command write a file at all?". With the classifier gone the shell runs under a halt, and since the measurement went with it, what a shell does under a halt is not watched at all. What a halt costs an agent is therefore the four write tools; reading was always unaffected and still is, deliberately, so an agent can find out why it is halted and tell the user how to clear it.

In the event log the halt rows are distinguishable by their detail. Two are still written: `Halt active — write tool call blocked` (a halted guard refusing a write) and `Halt raised by this block — <cause>` (the PreToolUse block that turned the halt on). Two more appear only in history — `Halt raised by the protected-path measurement (<n> path(s) changed)`, the PostToolUse route, and `Halt active — mutating Bash command blocked` from the classifier before it. Nothing writes either any more; historical rows still carry them, which is why the monitor keeps rendering them, and a halt a consuming project is carrying from the old mechanism still blocks and still clears the same way.

### Per-project configuration: `fusion-guard.json`

Everything `hooks/config.json` defines is the plugin's **default**, not the answer for a given project. A consuming project may ship `fusion-guard.json` at its project root — `/fusion:setup` seeds it from `templates/fusion-guard.json`, declaring nothing — and the guard hooks read it on every guarded tool call, merging it over the plugin's file and then over fusion's built-in defaults.

The file is **git-tracked on purpose**. It decides how sensitively the guard reads the decisions a project records, when it escalates to a halt and how many Turns the orchestrator may run, so every change to it has to appear in a diff and pass the same review as the rest of the project. Until 2026-08-12 the diff was the *second* line of defence: the guard added this file to the protected list as soon as it existed and wrote back any change an agent made to it. That defence went with the protected-path half, so an agent can now edit this file like any other and the git history is the only place a change to it shows.

**The merge is per leaf key, not per object.** A key the project declares is taken exactly as written; a key it omits — even inside an object it did declare — inherits the plugin's value and falls back to fusion's built-in default only when neither file speaks. So `{"guard":{"defaultSensitivity":"high"}}` raises the sensitivity and keeps every other guard setting the plugin ships. Narrowing works because a declared value wins outright: `{"guard":{"categoryPaths":{}}}` is the empty object, on purpose, not an inheritance. A value with the wrong type is dropped, named in a `guard_advisory` diagnostic, and then inherits exactly as an omitted key does; a file that is not valid JSON is dropped and reported the same way, never ignored in silence.

**A declared leaf does not grow when the plugin's does.** The merge is per leaf, so a project whose `fusion-guard.json` declares `categoryPaths` keeps exactly what it wrote and inherits nothing further — including a category fusion adds in a later version. The template `/fusion:setup` seeds declares nothing at all and therefore picks such an addition up on the next tool call, which is why the template deliberately restates no list.

**One key is retired, and saying so is louder than dropping it.** `guard.protectedPaths` configured the protected-path half. The mechanism is gone, so the key reads nothing and protects nothing — but a project that upgrades while its file still carries the line would otherwise see it silently ignored, which is indistinguishable from it working. The loader knows the key as RETIRED rather than unknown: it drops the value and emits a `guard_advisory` naming the key, saying the mechanism was removed, saying the rest of the file is unaffected, and saying that deleting the line stops the advisory. That advisory repeats on every guarded tool call until the line comes out. It applies to both layers, unlike the `guard.enabled` refusal below, because a key that is retired is retired for everybody.

**`guard.enabled` is the one key the project layer may not set.** The on/off switch is read from the plugin layer and fusion's defaults only — a project does not switch off the guard that governs it. A declared value, `true` or `false`, is ignored, and the loader reports the ignored key in a `guard_advisory` naming it, on every guarded call until the line is removed, so the key is never silently inert. (The `guard.enabled` rows earlier in this document stay true as written: they describe the plugin's own `hooks/config.json`, which still sets the key.)

### The protected-path half, and why it was removed

This section described a live mechanism until 2026-08-12. It is kept, shorter, because the mechanism's absence is what a reader of an older tree, an older copy of this file, or an existing `events.jsonl` will come here looking for.

**What it was, in two generations.** Until 2026-08-07 it was a classifier: `lib/bash-mutation-guard.ts` read a shell command's text and decided which files that command was about to write, so a write aimed at `guard.protectedPaths` could be denied before it ran. That question is undecidable — a path can be assembled at run time, arrive on stdin, or pass through `eval`, an alias, a shell function or a variable no classifier sees. 12 923 lines were built against it, carrying 21 documented residuals, and four days in a real consuming project produced 17 blocks and 0 real hits (`circles/260804-1205-shell-reachability-model/decisions/260807-0825_*_should-the-guard-predict-shell-writes-or-enforce-them.md`, option 3). What replaced it asked a decidable question instead — *has a protected path changed?* — by fingerprinting every path on the list in `guard.ts` before the tool call, fingerprinting them again in `tracker.ts` after it, writing back whatever moved and raising the halt outright. The route to the file no longer mattered, which is what the prediction had never managed.

**Why the whole half went anyway.** Measuring the result was the right answer to the wrong question. Across roughly 450 records in this project and its largest consumer there was no instance of the failure the protection existed to prevent, and the mechanism stood down in fusion's own tree — the only tree whose patterns name what they say they name — from the first public release. What it did cost was measurable: 53 records in one consuming project that exist only because agents may not write files that project owns, across 143 days, against zero halts. Six modules, a shell reporter, eleven test files and one always-on agent rule went with it.

**What went with it, by name.** Four modules under `hooks/lib` — `lib/protected-snapshot.ts`, `lib/rules-write-exemption.ts`, `lib/fs-locator.ts`, `lib/reverted-copy.ts` — plus the standalone effective-list reporter and its `bin/` wrapper; CHECK 2 in `guard.ts` and job 1 in `tracker.ts`; the `guard.protectedPaths` configuration leaf, the self-protection floor over `fusion-guard.json`, and the `FUSION_ALLOW_RULES_WRITE` session flag that existed only to soften the deny. Nothing replaced any of it: a protected path is not listed, not watched, not restored and not reported, by any hook.

**What survives it.** A halt raised by the old mechanism in a consuming project still blocks at CHECK 1 and still clears through `clear-halt.js`; that migration path is pinned by `lib/__tests__/legacy-halt-clearing.test.ts`. A project whose `fusion-guard.json` still declares `guard.protectedPaths` gets the retired-key advisory described under [Per-project configuration](#per-project-configuration-fusion-guardjson) rather than silence. And the rule the two stand-downs established — evaluate a stand-down in the coordinate space the mechanism keys its state by — outlived the measurement it was measured on and the churn heatmap that carried it next. It governs the one stand-down left, the write-tool branch (`lib/self-detect.ts`).

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
cd hooks && npm install && npm test
```

`npm test` compiles first and then runs vitest, as it always did. What changed is where the compile goes: into a private staging directory of its own, named to the run in `FUSION_TEST_DIST`, from which the shipped `hooks/dist/` is refreshed file by file. `npx vitest run` on its own still works and skips the compile.

**The suite is safe to run concurrently with itself in one checkout**, which is not a courtesy — the orchestrator dispatches executors in parallel batches and each of them runs this command to decide whether its own change lands. Three things make that true, and each is documented at its own source:

- `hooks/scripts/build.mjs` — the build never deletes `hooks/dist/`. It replaces each file with `rename(2)`, so a path under `dist/` is never momentarily absent and never half-written, and it prunes an output only once its source is gone. It used to be `rm -rf dist && tsc`, which left the whole tree missing for one to two seconds per run and failed three suites in three different shapes.
- `hooks/lib/__tests__/helpers/guard-harness.ts` `TEST_DIST` — the cases that spawn or copy a compiled artifact read the run's private build, not the shared one.
- `hooks/vitest.config.mjs` — one run uses half the machine's cores rather than all of them. Measured: at one worker per core, three concurrent runs failed 5 of 9 times on fork/exec starvation; at half, 9 of 9 were green, and a single run costs nothing measurable.

### Rebuilding after TS changes

```bash
cd hooks && npm install && npm run build
```

The compiled `hooks/dist/` directory is committed to the repo and ships with the plugin, so it has to match the sources exactly — a deleted source whose compiled output stays behind is tracked in git, copied into `~/.fusion` by the installer, and readable there as a module the plugin no longer has. That happened once already, with the four files of the retired Bash classifier.

`build` keeps that promise without deleting anything: it compiles to a staging directory, replaces each changed file in `dist/` atomically, and removes any output whose `.ts` source is no longer in the tree. The result is byte-identical to a wipe-and-rebuild, and `npm run build:clean` is still there (`rm -rf dist && tsc`) for the rare case where you want the wipe itself. `npm test` runs `build`, so a normal test run keeps `hooks/dist/` current exactly as it used to.

One consequence worth knowing before adding a file: nothing under `hooks/` may be a TypeScript source the build deliberately skips. The prune keeps a `dist/` entry whose `.ts` source still exists, and it cannot tell such a file's stale output from a concurrent run's fresh one. That is why the vitest configuration is `vitest.config.mjs`.

## Origin

Ported from Fusion's guard system (`fusion/reactor/pkg/guard/`):
- `decision_guard.go` → `guard.ts` + `lib/config.ts` + `lib/paths.ts`
- `escalation.go` → `lib/escalation.ts`
- `event_parser.go` → `lib/events.ts`

The key difference: Fusion intercepts via the SDK's `canUseTool` callback in a running Go server. The Compliance Guard intercepts via Claude Code's native hook system — external scripts invoked per tool call.

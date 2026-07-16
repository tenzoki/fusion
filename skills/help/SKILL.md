---
description: Explain what fusion is, how to use it day-to-day, how to install/update/configure it, and where the deeper docs live. Optional topic argument routes the answer (philosophy | daily | install | update | configure).
argument-hint: [philosophy | daily | install | update | configure]
allowed-tools: [Read, Bash, Glob]
---

# Fusion — self-explainer

The user invoked `/fusion:help`. Identify which topic they care about (from any argument they passed, or from the conversational context if no explicit arg), then answer focused on that topic.

If no specific topic is identifiable, give a one-paragraph overview of fusion + the five topics below with one-line summaries, then ask the user which they want to drill into.

**Read the source files this skill points at; do not paste them whole.** Synthesize a focused answer in your own voice and cite file paths so the user can read the originals if they want.

If a question goes beyond what the docs cover, **say so** — do not invent.

---

## Topics

### 1. Philosophy — *why fusion exists*

Read `$FUSION_PLUGIN_ROOT/docs/philosophy.md`. It covers the three load-bearing ideas (specialization beats generalists, workbench-mediated coordination, compliance over speed) and the domain-parameter design that lets the same plumbing serve `code | data | strategic | knowledge` projects.

If the user wants a fast answer, summarize the three pillars in three sentences. If they want to go deep, walk them through the doc.

### 2. Daily practice — *how to use it once installed*

Once `/fusion:setup` has run in a project, the day-to-day flow is:

1. **Use the launcher.** If you installed via the HTTPS installer, `fusion` runs an agent: bare `fusion` invokes the orchestrator; `fusion coder`, `fusion planner`, etc. dispatch a specific agent directly. Add `--yolo` to clear permission prompts (`fusion --yolo coder`). If you installed via the Claude Code marketplace, start an agent directly with `claude --agent fusion:orchestrator`.

2. **Pick the right entry point** depending on what you're doing:
   - Multi-task batch session → **orchestrator**
   - Vague request that needs scoping → **shaper**, then planner
   - Concrete change with a clear ask → **planner** directly
   - One bug to fix → **bugfixer**
   - Forensic look at a captured failed run → **investigator**
   - "What should I work on next?" → **taskplanner**
   - Tracking files feel stale → **reconciler**
   - Strategic advice or second opinion → **consultant**
   - Deep document/problem study before work → **analyst**

3. **The workbench is the project's cross-session memory.** `fusion-workbench/` holds one directory per unit of work under `circles/` — each with its own plans, issues, decisions, history, reviews and analyses — plus a `shared/` store for everything that belongs to no unit of work, and `tasklist.md` at the root. Which artifact lands where is the Origin Rule: it belongs to the Circle whose Directive caused it, and to `shared/` when no Circle was active. The kinds are distinguished by what resolves them — plans ("here's the approach"), defects ("go fix it") in issues, open questions ("decide and record") in decisions.

   The layout is defined once, in `$FUSION_PLUGIN_ROOT/rules/fusion-workbench-conventions.md` (`## fusion-workbench Layout`, `## Origin Rule`). Read it there and cite it rather than reciting paths from memory — agents themselves do not hard-code these paths either; they resolve them at run time via `$FUSION_PLUGIN_ROOT/bin/fusion-paths <name>`. If the user wants to know where a given artifact will land in *their* project, run that resolver and show them, rather than guessing from the layout.

4. **Watch the dashboard.** In a second terminal, run `./fusion-workbench/monitor "<session-name>" <port>` (e.g. `./fusion-workbench/monitor "F03-fusion" 8099`) from the project root. The monitor is an executable bash script that serves an HTTP dashboard — open `http://localhost:<port>` in a browser. It auto-refreshes from `fusion-workbench/orchestrator-live.md`, `orchestrator-events.jsonl`, and `agentstate.yaml`.

5. **Recovering after a crash:** re-run `/fusion:setup`. It reads `fusion-workbench/agentstate.yaml`, surfaces interrupted tasks, and offers to resume.

For the full agent reference (scope, inputs, outputs, exact dispatch criteria), point the user at `$FUSION_PLUGIN_ROOT/README-agents.md`.

### 3. Install — *getting fusion into a project*

Read `$FUSION_PLUGIN_ROOT/README.md`. Two paths:

- **Recommended — HTTPS installer:** `curl -fsSL https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh | bash`. It downloads over plain HTTPS into `~/.fusion` and adds a `fusion` launcher (no git, no SSH, no marketplace cache — it sidesteps the common `Permission denied (publickey)` clone failure). Then run `/fusion:setup` in the project directory.
- **Alternative — Claude Code marketplace:** `/plugin install fusion@tenzoki-plugins` from a Claude Code session, then `/fusion:setup` in the project. If the user is setting up the marketplace itself for the first time, walk them through adding the marketplace before the install.

### 4. Update — *picking up new versions*

**If you installed via the HTTPS installer (recommended):** run `fusion --update` — it re-downloads the latest over HTTPS and overwrites `~/.fusion`. That's the whole update; no slash commands, no cache surgery.

**If you installed via the marketplace:** type these three slash commands in Claude Code, in order:

1. `/plugin uninstall fusion@tenzoki-plugins`
2. `/plugin install fusion@tenzoki-plugins`
3. `/reload-plugins`

**Why three commands:** Claude Code has no `/plugin upgrade` or `/plugin update`. `/plugin install` on an already-installed plugin reports *"already installed globally"* and does not re-fetch — so the upgrade path requires `uninstall` first.

**One caveat for the marketplace path:** the local *marketplace clone* at `~/.claude/plugins/marketplaces/<name>/` is what `/plugin install` reads, not the GitHub remote. If a version bump hasn't reached it, run `git -C ~/.claude/plugins/marketplaces/tenzoki-plugins pull origin main` first, then the three commands. (The HTTPS installer has none of this friction — prefer it.)

For the maintainer-side release flow (bumping `plugin.json` + `marketplace.json`, dual git push), read `$FUSION_PLUGIN_ROOT/CLAUDE.md` "Release process".

### 5. Configure — *customizing fusion for a project*

Three things to configure:

- **Compliance guard:** `$FUSION_PLUGIN_ROOT/README-hooks.md` and `$FUSION_PLUGIN_ROOT/hooks/config.example.json`. Categories, churn thresholds, escalation behavior, ping-back detection.
- **Project rules:** read `$FUSION_PLUGIN_ROOT/bin/fusion-rules` (the header comment is the spec). Two project-side rule locations:
  - `./rules/` — fusion-agent-specific rules (e.g. `investigator-capture-layout.md`, `taskplanner-priorities.md`) that have no meaning outside a fusion context.
  - `.claude/rules/` — project-wide rules every Claude session should respect (coding/ontology/normative/verb guidelines).
  Both are loaded by `bin/fusion-rules` per agent-name pattern.
- **Investigator capture layout:** if the project has an evidence-locker (failed runs captured for forensic analysis), copy `$FUSION_PLUGIN_ROOT/templates/investigator-capture-layout.md` to `./rules/investigator-capture-layout.md` and fill it in. Without this, the `investigator` agent halts at Setup.

---

## Tone

User-facing output follows `rules/user-facing-output.md` (loaded into every agent via `bin/fusion-rules`). For this skill specifically: answer the user's question first, then add context. Don't lead with a wall of meta-commentary about what fusion is before answering "how do I install it?"

Direct, fusion-savvy, but not preachy. If the user is new, lead with overview. If they're advanced, skip the basics. Read what they actually asked, then decide depth.

Cite file paths whenever you reference a doc — the user may want to read it cold.

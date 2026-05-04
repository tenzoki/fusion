---
description: Explain what fusion is, how to use it day-to-day, how to install/update/configure it, and where the deeper docs live. Optional topic argument routes the answer (philosophy | daily | install | update | configure).
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

1. **Use the launcher.** `./.fusion/fu` runs an agent with permissions cleared. Bare `./.fusion/fu` invokes the orchestrator; `./.fusion/fu coder`, `./.fusion/fu planner`, etc. dispatch a specific agent directly.

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

3. **The workbench is the project's cross-session memory.** Read `fusion-workbench/{planning,issues,decisions,history,codereview,ontoreview,investigations,analyses,consult}/` and `fusion-workbench/tasklist.md`. Plans live in `planning/`; defects ("go fix it") in `issues/`; open questions ("decide and record") in `decisions/`.

4. **Watch the dashboard.** Open `fusion-workbench/monitor/index.html` in a browser to see live agent state.

5. **Recovering after a crash:** re-run `/fusion:setup`. It reads `fusion-workbench/agentstate.yaml`, surfaces interrupted tasks, and offers to resume.

For the full agent reference (scope, inputs, outputs, exact dispatch criteria), point the user at `$FUSION_PLUGIN_ROOT/README-agents.md`.

### 3. Install — *getting fusion into a project*

Read `$FUSION_PLUGIN_ROOT/README.md`. The relevant flow is `/plugin install fusion@tenzoki-plugins` from a Claude Code session, followed by `/fusion:setup` in the project directory.

If the user is setting up the marketplace itself for the first time, walk them through adding the marketplace before the install.

### 4. Update — *picking up new versions*

Read `$FUSION_PLUGIN_ROOT/CLAUDE.md` "Release process" section + the troubleshooting row about the marketplace cache.

**Key gotcha:** the marketplace clone at `~/.claude/plugins/marketplaces/<name>/` is what `/plugin install` reads — *not* the GitHub remote. Without a manual `git pull` on that local clone, version bumps don't propagate even after uninstall/reinstall. The fix is:

```bash
git -C ~/.claude/plugins/marketplaces/tenzoki-plugins pull origin main
```

Then in Claude Code: `/plugin install fusion@tenzoki-plugins` and `/reload-plugins`.

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

Direct, fusion-savvy, but not preachy. If the user is new, lead with overview. If they're advanced, skip the basics. Read what they actually asked, then decide depth.

Cite file paths whenever you reference a doc — the user may want to read it cold.

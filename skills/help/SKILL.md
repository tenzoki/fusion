---
description: Explain what fusion is, how to use it day-to-day, how to install/update/configure it, and where the deeper docs live. Optional topic argument routes the answer (philosophy | daily | install | update | configure | bus).
argument-hint: [philosophy | daily | install | update | configure | bus]
allowed-tools: [Read, Bash, Glob]
---

# Fusion — self-explainer

The user invoked `/fusion:help`. Identify which topic they care about (from any argument they passed, or from the conversational context if no explicit arg), then answer focused on that topic.

If no specific topic is identifiable, give a one-paragraph overview of fusion + the six topics below with one-line summaries, then ask the user which they want to drill into.

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

4. **Watch the dashboard.** In a second terminal, run `./fusion-workbench/monitor "<session-name>" <port>` (e.g. `./fusion-workbench/monitor "F03-fusion" 8099`) from the project root. The monitor is an executable bash script that serves an HTTP dashboard — open `http://localhost:<port>` in a browser. It auto-refreshes from `fusion-workbench/orchestrator-live.md`, `orchestrator-events.jsonl`, and `agentstate.yaml`.

5. **Recovering after a crash:** re-run `/fusion:setup`. It reads `fusion-workbench/agentstate.yaml`, surfaces interrupted tasks, and offers to resume.

For the full agent reference (scope, inputs, outputs, exact dispatch criteria), point the user at `$FUSION_PLUGIN_ROOT/README-agents.md`.

### 3. Install — *getting fusion into a project*

Read `$FUSION_PLUGIN_ROOT/README.md`. The relevant flow is `/plugin install fusion@tenzoki-plugins` from a Claude Code session, followed by `/fusion:setup` in the project directory.

If the user is setting up the marketplace itself for the first time, walk them through adding the marketplace before the install.

### 4. Update — *picking up new versions*

**Easy path:** run `/fusion:upgrade` — it pulls the local marketplace clone and reports the version diff. Then type these three slash commands in Claude Code, in order:

1. `/plugin uninstall fusion@tenzoki-plugins`
2. `/plugin install fusion@tenzoki-plugins`
3. `/reload-plugins`

**Why three commands:** Claude Code has no `/plugin upgrade` or `/plugin update`. `/plugin install` on an already-installed plugin reports *"already installed globally"* and does not re-fetch — so the upgrade path requires `uninstall` first. Slash commands cannot be invoked from inside a skill body, which is why the user has to type them.

**Why `/fusion:upgrade` even exists** (vs. just running the three commands directly): the local *marketplace clone* at `~/.claude/plugins/marketplaces/<name>/` is what `/plugin install` reads, not the GitHub remote. Without a `git pull` on that clone first, the install would re-pull the same version it already had. `/fusion:upgrade` does the pull and reports the diff so the user knows whether reinstalling is worth doing.

For the maintainer-side release flow (bumping `plugin.json` + `marketplace.json`, dual git push), read `$FUSION_PLUGIN_ROOT/CLAUDE.md` "Release process".

### 5. Configure — *customizing fusion for a project*

Three things to configure:

- **Compliance guard:** `$FUSION_PLUGIN_ROOT/README-hooks.md` and `$FUSION_PLUGIN_ROOT/hooks/config.example.json`. Categories, churn thresholds, escalation behavior, ping-back detection.
- **Project rules:** read `$FUSION_PLUGIN_ROOT/bin/fusion-rules` (the header comment is the spec). Two project-side rule locations:
  - `./rules/` — fusion-agent-specific rules (e.g. `investigator-capture-layout.md`, `taskplanner-priorities.md`) that have no meaning outside a fusion context.
  - `.claude/rules/` — project-wide rules every Claude session should respect (coding/ontology/normative/verb guidelines).
  Both are loaded by `bin/fusion-rules` per agent-name pattern.
- **Investigator capture layout:** if the project has an evidence-locker (failed runs captured for forensic analysis), copy `$FUSION_PLUGIN_ROOT/templates/investigator-capture-layout.md` to `./rules/investigator-capture-layout.md` and fill it in. Without this, the `investigator` agent halts at Setup.

### 6. Bus — *agent-to-agent messages on disk*

The **bus** lets concurrent agent sessions hand work to each other through the workbench instead of through copy-paste in the user's chat. A message is a markdown file in `fusion-workbench/bus/<target-agent>/inbox/`. The receiving agent picks it up the next time it runs Setup.

**When it activates.** Only when `fusion-workbench/bus/` exists. `/fusion:setup` creates that tree on every run since v3.4, so for any project set up since then the bus is always-on. Pre-bus workbenches can opt in by re-running `/fusion:setup`.

**What you do.** When an agent files a bus request (typically the orchestrator at a gate, or a reviewer with a cross-cutting finding), it prints something like *"open another terminal and run `./.fusion/fu <agent>`"*. You open that terminal, run the command, and the target agent's Setup surfaces the unread inbox item automatically. **You are the trigger.** Fusion does not auto-notify, does not auto-route, does not inject anything into a running session. Full automation is Path D — a separate decision, not in scope here.

**How to inspect** (from the project root):

```
bin/fusion-bus list             # all unread mail across all agents
bin/fusion-bus show <stem>      # print one message's contents
bin/fusion-bus mark-read <stem> # move it to inbox/.processed/ manually
```

`mark-read` is a cleanup tool — agents normally mark their own messages read. The dual-write is race-safe by design (atomic rename).

**Canonical spec.** `rules/fusion-workbench-conventions.md` `## Bus protocol` — filename format, frontmatter fields (`From`/`To`/`Re`/`Filed`), reply-pairing keys, session registry, and the four bus-aware agents (orchestrator, consultant, coderev, ontorev).

---

## Tone

User-facing output follows `rules/user-facing-output.md` (loaded into every agent via `bin/fusion-rules`). For this skill specifically: answer the user's question first, then add context. Don't lead with a wall of meta-commentary about what fusion is before answering "how do I install it?"

Direct, fusion-savvy, but not preachy. If the user is new, lead with overview. If they're advanced, skip the basics. Read what they actually asked, then decide depth.

Cite file paths whenever you reference a doc — the user may want to read it cold.

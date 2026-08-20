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

**A path into a file the plugin ships carries the `$FUSION_SRC` root.** Every topic below sends you to a shipped doc, README or rule file; nothing the plugin ships exists at a consuming project's root, so a bare `docs/…` or `rules/…` path resolves to nothing there. Resolve the root once, before reading the first one:

```bash
if [ -x "${FUSION_PLUGIN_ROOT:-}/bin/fusion-source-root" ]; then
  FUSION_SRC="$("$FUSION_PLUGIN_ROOT/bin/fusion-source-root")"
elif [ -n "${FUSION_PLUGIN_ROOT:-}" ]; then
  echo "fusion: no bin/fusion-source-root in the installed plugin at $FUSION_PLUGIN_ROOT — the source root falls back to that install copy" >&2
  FUSION_SRC="$FUSION_PLUGIN_ROOT"
else
  FUSION_SRC=""
fi
echo "source root: ${FUSION_SRC:-UNRESOLVED (FUSION_PLUGIN_ROOT is unset)}"
```

`bin/fusion-source-root` owns the criterion and its header states it in full; this file does not restate it. In one line: `$FUSION_PLUGIN_ROOT` names the installed copy and is pinned for the whole session, and inside the fusion plugin's own source repository that is the wrong copy, so an answer given from the install would describe a version of the docs the reader is not editing. The `[ -x ]` guard is the one every prompt-called `bin/` helper carries: a helper added between releases is absent from an older install and a bare call is exit 127.

**`UNRESOLVED` is not a path, and no topic below is answered through it.** With `FUSION_PLUGIN_ROOT` unset the variable holds the empty string and every `$FUSION_SRC/…` read resolves from `/`, finding nothing. Say so plainly, tell the user to restart the session so the SessionStart hook exports the variable, and answer only from what you can actually open. **Never** paraphrase a shipped doc you could not read — this skill's whole value is that it quotes the source rather than the model's memory of it.

**What the root does *not* cover.** `$FUSION_PLUGIN_ROOT/bin/fusion-paths` below is run, not read, and `$FUSION_PLUGIN_ROOT/templates/…` is copied — both stay on the install root. Whether the work-tree preference reaches helper resolution is part (c) of decision `260810-1544` and is unanswered. The split is by what you do with the path: read shipped text → `$FUSION_SRC`; run or copy an installed artefact → `$FUSION_PLUGIN_ROOT`.

---

## Topics

### 1. Philosophy — *why fusion exists*

Read `$FUSION_SRC/docs/philosophy.md`. It covers the five "Why it's built this way" pillars — specialization beats generalists, coordination through files (not shared memory), traceability as a first-class output, compliance over speed, and one framework across many project shapes — the last being the domain-parameter design that lets the same plumbing serve `code` and `data` projects.

For *how the machinery actually runs* — the Circle lifecycle, the spec-driven flow, the gates, and the compliance guard end to end — point the user at `$FUSION_SRC/docs/working-model.md` (the operational companion to this "why" doc).

If the user wants a fast answer, summarize the pillars in a few sentences. If they want to go deep, walk them through the doc.

### 2. Daily practice — *how to use it once installed*

Once `/fusion:setup` has run in a project, the day-to-day flow is:

1. **Use the launcher.** If you installed via the HTTPS installer, `fusion` runs an agent: bare `fusion` invokes the orchestrator; `fusion coder`, `fusion planner`, etc. dispatch a specific agent directly. Add `--yolo` to clear permission prompts (`fusion --yolo coder`). If you installed via the Claude Code marketplace, start an agent directly with `claude --agent fusion:orchestrator`.

2. **Pick the right entry point** depending on what you're doing:
   - Multi-task batch session → **orchestrator**
   - Vague request that needs scoping → **shaper**, then planner
   - A goal to capture without starting work on it → `/fusion:direct <draft>` — **shaper** sharpens the draft with you and writes it as an anticipated Circle; no Turn loop runs, and a backlog entry's path is a valid draft
   - Concrete change with a clear ask → **planner** directly
   - One bug to fix → **bugfixer**
   - Customer-ready deliverable, branded deck, or en↔de translation → **editor**
   - An idea worth keeping but not yet worth planning → `/fusion:memo` files it as its own new entry in the project backlog, where the playmaker ranks it and `/fusion:next` surfaces it
   - "What should I work on next?" → `/fusion:next` for the portfolio briefing + next-Circle activation (**playmaker**); **taskplanner** builds the session's work queue and hands it to the orchestrator
   - Tracking files feel stale → **reconciler**
   - Strategic advice or second opinion → **consultant**
   - Deep document/problem study before work, or a forensic look at a captured failed run → **analyst**

3. **The workbench is the project's cross-session memory.** `fusion-workbench/` holds one directory per unit of work under `circles/` — each with its own plans, issues, decisions, history, reviews and analyses — plus a `shared/` store for everything that belongs to no unit of work, and `portfolio.md` at the root. Which artifact lands where is the Origin Rule: it belongs to the Circle whose Directive caused it, and to `shared/` when no Circle was active. The kinds are distinguished by what resolves them — plans ("here's the approach"), defects ("go fix it") in issues, open questions ("decide and record") in decisions, and ideas that are not yet units of work ("worth considering, not yet worth planning") in the shared backlog store, which has no Circle counterpart because an idea precedes every Directive. `portfolio.md` is not an artifact kind: it is the playmaker's regenerated briefing over the anticipated Circles and the backlog, and it is what `/fusion:next` reads back to the user.

   The layout is defined once, in `$FUSION_SRC/rules/fusion-workbench-conventions.md` (`## fusion-workbench Layout`, `## Origin Rule`). Read it there and cite it rather than reciting paths from memory — agents themselves do not hard-code these paths either; they resolve them at run time via `$FUSION_PLUGIN_ROOT/bin/fusion-paths <name>`. If the user wants to know where a given artifact will land in *their* project, run that resolver and show them, rather than guessing from the layout.

4. **Watch the dashboard.** In a second terminal, run `./fusion-workbench/monitor "<session-name>" <port>` (e.g. `./fusion-workbench/monitor "F03-fusion" 8099`) from the project root. The monitor is an executable bash script that serves an HTTP dashboard — open `http://localhost:<port>` in a browser. It auto-refreshes from `fusion-workbench/orchestrator-live.md`, `orchestrator-events.jsonl`, and `agentstate.yaml`.

5. **Recovering after a crash:** re-run `/fusion:setup`. It reads `fusion-workbench/agentstate.yaml`, surfaces interrupted tasks, and offers to resume.

6. **Three commands frame the work, and there are only three to remember.** `/fusion:setup` at the start of a session, `/fusion:cleanup` at the end, `/fusion:cadence` whenever you want to see what you have actually been doing. Cleanup is a pipeline: it files issues for what is unfinished, commits and pushes in meaningful splits, reconciles, archives, reconciles `CLAUDE.md` **at a gate you answer**, regenerates the activity log, then commits the housekeeping. `--only <step>` runs one of those steps alone (`--only archive`, `--only claude-md`, `--only log-activity`), `--skip <step>` runs everything else, `--dry-run` shows what would happen, `--no-push` keeps the commits local. Tell a user who asks about archiving, the activity log, or `CLAUDE.md` maintenance to reach for cleanup with `--only`, not for a separate command.

   **The gate is the one thing to warn them about.** A cleanup run left unattended stops at the `CLAUDE.md` step and never reaches the housekeeping commits. `--skip claude-md` is the flag for a run they intend to walk away from.

For the full agent reference (scope, inputs, outputs, exact dispatch criteria), point the user at `$FUSION_SRC/README-agents.md`. For the working model behind the day-to-day flow — the Circle lifecycle, spec-driven flow, the gates, and the compliance guard walked end to end — point them at `$FUSION_SRC/docs/working-model.md`.

### 3. Install — *getting fusion into a project*

Read `$FUSION_SRC/README.md`. Two paths:

- **Recommended — HTTPS installer:** `curl -fsSL https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh | bash`. It downloads over plain HTTPS into `~/.fusion` and adds a `fusion` launcher (no git, no SSH, no marketplace cache — it sidesteps the common `Permission denied (publickey)` clone failure). Then run `/fusion:setup` in the project directory.
- **Alternative — Claude Code marketplace:** `/plugin install fusion@tenzoki-plugins` from a Claude Code session, then `/fusion:setup` in the project. If the user is setting up the marketplace itself for the first time, walk them through adding the marketplace before the install.

### 4. Update — *picking up new versions*

**If you installed via the HTTPS installer (recommended):** run `fusion --update` — it re-downloads the latest over HTTPS and overwrites `~/.fusion`. That's the whole update; no slash commands, no cache surgery.

**If you installed via the marketplace:** type these three slash commands in Claude Code, in order:

1. `/plugin uninstall fusion@tenzoki-plugins`
2. `/plugin install fusion@tenzoki-plugins`
3. `/reload-plugins`

**Why three commands:** Claude Code has no `/plugin upgrade` or `/plugin update`. `/plugin install` on an already-installed plugin reports *"already installed globally"* and does not re-fetch — so the upgrade path requires `uninstall` first.

**Coming from a v10.2 install:** v10.3 takes the `**Status:**` head field off the decision-record template as well, and adds one question before a Circle closes — the orchestrator reads the plan's `## Where this Circle stops` clauses back to the user and asks whether each holds. Nothing is rewritten and nothing has to be migrated; existing records keep the field, including when they are transitioned. Point the user at `$FUSION_SRC/docs/upgrading-to-v10-3.md`.

**Coming from a v10.0 or v10.1 install:** v10.2 changes the Circle record: the `**Status:**` head field leaves the template and `## Directive` becomes a pointer once the Circle has a spec. No workbench file is rewritten and nothing breaks. One case needs a decision — an active Circle whose record still holds Directive prose while its `**Active spec/plan:**` cites a file. A shaper run against it under `**Scope:** directive-only` halts on purpose; the default `spec` scope converts it instead of halting. Point the user at `$FUSION_SRC/docs/upgrading-to-v10-2.md`, and at the v10.3 note above as well.

**Coming from a v9 install:** v10 removed the last thing the guard decided, and with it the project-root `fusion-guard.json` — `fusion.json` replaces it and the old file is not read at all. A Turn budget left behind is silently not applied, so it has to be copied across before the old file is deleted; a leftover halt flag in `.guard-state/escalation.json` blocks nothing and `/fusion:setup` offers to delete it. Point the user at `$FUSION_SRC/docs/upgrading-to-v10.md` for the two checks.

**Coming from a v8 or earlier install:** v9 removed eight mechanisms, two agents and five skills, so a project set up under an older version can be left holding configuration and workbench files that nothing reads any more — the Plane bridge's three files, a retired `tasklist.md`, a `**Domain:** strategic` or `knowledge` line, an orphaned `./rules/investigator-capture-layout.md`. Nothing breaks and no migration is required; point the user at `$FUSION_SRC/docs/upgrading-to-v9.md` for the six-item cleanup checklist, and at `$FUSION_SRC/docs/upgrading-to-v10.md` as well.

**One caveat for the marketplace path:** the local *marketplace clone* at `~/.claude/plugins/marketplaces/<name>/` is what `/plugin install` reads, not the GitHub remote. If a version bump hasn't reached it, run `git -C ~/.claude/plugins/marketplaces/tenzoki-plugins pull origin main` first, then the three commands. (The HTTPS installer has none of this friction — prefer it.)

For the maintainer-side release flow (bumping `plugin.json` + `marketplace.json`, dual git push), read the "Release process" section of `CLAUDE.md` in the fusion **source repo** (https://github.com/tenzoki/fusion/blob/main/CLAUDE.md) — that file is dev-only and deliberately not shipped, so `$FUSION_PLUGIN_ROOT/CLAUDE.md` does not exist on an installed copy.

### 5. Configure — *customizing fusion for a project*

Two things to configure:

- **Project settings:** `$FUSION_SRC/templates/fusion.json` is the seeded file and documents each key in its own notes; `$FUSION_SRC/README-hooks.md` is the full account. There is exactly one setting, the orchestrator's Turn budget (`orchestrator.maxTurns`), and the guard is not it — the hooks block nothing and have no settings. A project root still carrying the retired `fusion-guard.json` is told so on every guarded tool call until it is deleted; the Turn budget has to be copied across first, or it is silently not applied.
- **Project rules:** read `$FUSION_SRC/bin/fusion-rules` (the header comment is the spec). Two project-side rule locations:
  - `./rules/` — fusion-agent-specific rules (e.g. `taskplanner-priorities.md`) that have no meaning outside a fusion context.
  - `.claude/rules/` — project-wide rules every Claude session should respect (coding/ontology/normative/verb guidelines).
  Both are loaded by `bin/fusion-rules` per agent-name pattern. For large knowledge bodies you don't want loaded on every run, a project may also ship `./rules/context-manifest.yaml` — it registers topic-scoped loadable units (each a rule file or a `skill:<name>` pointer), pulled only when the agent **and** the active topic match (`bin/fusion-rules <agent> [<topic>]`). This lets `CLAUDE.md` stay a lean index rather than carrying everything inline. The mechanism is authored in `$FUSION_SRC/rules/context-manifest.md` (and the lean-`CLAUDE.md` convention in `rules/context-lean-claude-md.md`); absent the manifest, loading is byte-identical to before. The two routes split by size, not by agent: a small rule file loads by filename pattern, and the manifest carries anything large or topic-scoped. `analyst` is the case that shows the split — it inherited the retired investigator's failure-analysis work in v9 without inheriting that agent's rule pattern, and now matches `*analyst*` of its own, so a short `./rules/analyst-capture-layout.md` loads every run while a full capture layout is better registered as a manifest unit with `agents: [analyst]` and `topics: [always]`.

---

## Tone

User-facing output follows `rules/user-facing-output.md` (loaded into every agent via `bin/fusion-rules`). For this skill specifically: answer the user's question first, then add context. Don't lead with a wall of meta-commentary about what fusion is before answering "how do I install it?"

Direct, fusion-savvy, but not preachy. If the user is new, lead with overview. If they're advanced, skip the basics. Read what they actually asked, then decide depth.

Cite file paths whenever you reference a doc — the user may want to read it cold.

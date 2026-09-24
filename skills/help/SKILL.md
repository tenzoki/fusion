---
description: Explain what fusion is, how to use it day-to-day, how to install/update/configure it, and where the deeper docs live. Optional topic argument routes the answer (philosophy | daily | install | update | configure).
argument-hint: [philosophy | daily | install | update | configure]
allowed-tools: [Read, Bash, Glob]
---

# Fusion — self-explainer

The user invoked `/fusion:help`. Identify which topic they care about (from any argument they passed, or from the conversational context if no explicit arg), then answer focused on that topic.

If no specific topic is identifiable, open with **the daily loop**: morning `/fusion:cadence`; work — start the orchestrator and say what you want; ideas `/fusion:wp`, notes `/fusion:memo`; done `/fusion:cleanup` and walk away. Then list the five topics with one-line summaries and ask which to drill into.

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

**`UNRESOLVED` is not a path, and no topic below is answered through it.** `bin/fusion-source-root`'s own header carries the branch, the guard, `UNRESOLVED` and the read-versus-run split. What is this skill's own is the rule that follows from it: **never** paraphrase a shipped doc you could not read, because the whole value here is that it quotes the source rather than the model's memory of it. When the print says `UNRESOLVED`, say so plainly, tell the user to restart the session so the SessionStart hook exports the variable, and answer only from what you can actually open.

---

## Topics

### 1. Philosophy — *why fusion exists*

Read `$FUSION_SRC/docs/philosophy.md`. It covers the five "Why it's built this way" pillars — specialization beats generalists, coordination through files (not shared memory), traceability as a first-class output, compliance over speed, and one framework across many project shapes — the last being the domain-parameter design that lets the same plumbing serve `code` and `data` projects.

For *how the machinery actually runs* — the work item's life, the spec-driven flow, the gates, and the compliance guard end to end — point the user at `$FUSION_SRC/docs/working-model.md` (the operational companion to this "why" doc).

If the user wants a fast answer, summarize the pillars in a few sentences. If they want to go deep, walk them through the doc.

### 2. Daily practice — *how to use it once installed*

Once `/fusion:setup` has run in a project, the day-to-day flow is:

1. **Use the launcher.** If you installed via the HTTPS installer, `fusion` runs an agent: bare `fusion` invokes the orchestrator; `fusion coder`, `fusion planner`, etc. dispatch a specific agent directly. Add `--yolo` to clear permission prompts (`fusion --yolo coder`). If you installed via the Claude Code marketplace, start an agent directly with `claude --agent fusion:orchestrator`.

2. **Pick the right entry point** depending on what you're doing:
   - Multi-task batch session → **orchestrator**
   - Vague request that needs scoping → **shaper**, then planner
   - Concrete change with a clear ask → **planner** directly
   - One bug to fix → **coder** or **ontocoder**, whichever owns the file; a task naming an error takes the diagnose-before-editing route in its own prompt
   - Customer-ready deliverable, branded deck, or en↔de translation → **editor**
   - A goal to capture without starting work on it → `/fusion:wp` files it as its own work item in the project backlog, where it waits at `open` until somebody claims it. Its path is then a valid input to **shaper**, which turns it into a spec without touching the item
   - "What should I work on next?" → read the backlog yourself; the portfolio briefing and the session work queue both went at v11 with the agents that built them
   - Tracking files feel stale → **reconciler**
   - Strategic advice or second opinion → **consultant**
   - Deep document/problem study before work, or a forensic look at a captured failed run → **analyst**

3. **The workbench is the project's cross-session memory.** `fusion-workbench/` holds one store per artifact kind (plans for the approach, issues for "go fix it", decisions for "decide and record", plus reviews, analyses and the frozen history corpus) in two places: each work item's own container under `circles/`, and `shared/` for work belonging to no item. **The Origin Rule makes the placement decision**: an artifact belongs to the item whose directive caused it, and to `shared/` when no item is in scope.

   The layout is defined once, in `$FUSION_SRC/rules/fusion-workbench-conventions.md` (`## fusion-workbench Layout`). Read it there and cite it rather than reciting paths from memory — agents themselves do not hard-code these paths either; they resolve them at run time via `$FUSION_PLUGIN_ROOT/bin/fusion-paths <name>`. If the user wants to know where a given artifact will land in *their* project, run that resolver and show them, rather than guessing from the layout.

4. **Watch the dashboard.** In a second terminal, run `./fusion-workbench/monitor "<session-name>" <port>` (e.g. `./fusion-workbench/monitor "F03-fusion" 8099`) from the project root. The monitor is an executable bash script that serves an HTTP dashboard — open `http://localhost:<port>` in a browser. It auto-refreshes from `fusion-workbench/orchestrator-events.jsonl`, which the hooks write, and from the records in the workbench.

5. **Recovering after a crash:** just start the orchestrator again. There is no saved session to resume and no state file to find — a crashed session is restarted like any other. What it left behind is in git, in the event log and in the records it wrote, so say what you want done next and the session reads those.

6. **Three commands frame the work.** `/fusion:setup` at the start of a session, `/fusion:cleanup` at the end, `/fusion:cadence` whenever you want to see what you have actually been doing — it writes this checkout's activity log first, then digests it. **Cleanup is commit and push, and nothing else**: it stages explicit paths in meaningful splits, commits them under the project's commit lock, and pushes. `--dry-run` prints the splits and stops, `--no-push` keeps the commits local. It files nothing on your behalf — work a session left unfinished belongs in the commit message, or in a record you file yourself.

   **The other end-of-session jobs are their own commands now**, each invoked by name and triggering no other: `/fusion:reconcile` (verify the tracking records against the tree), `/fusion:archive` (move completed artifacts out of the live stores), `/fusion:curate` (reconcile `CLAUDE.md` and the project's rule files, at a user gate) and `/fusion:post` (leave a note for whoever pulls this work next). The activity log went to `/fusion:cadence`, which writes it and then digests it. Tell a user who asks about archiving, the activity log or `CLAUDE.md` maintenance to type that command; cleanup no longer reaches any of them. `/fusion:check` runs the periodic installation checks that Setup used to carry.

For the full agent reference (scope, inputs, outputs, exact dispatch criteria), point the user at `$FUSION_SRC/README-agents.md`.
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

**Coming from an 11.11.0 install:** 11.11.1 corrects the wording of two rule files and changes no behaviour. Each drops or narrows a claim that overstated what the text beside it says; neither is emitted to any of the eleven agents, so no dispatch path carries a byte of either and nothing moves at a gate or in a command. No setting moves and there is no upgrade note for 11.11.1.

**Coming from an 11.10.0 install:** 11.11.0 changes one gate reading, three skill bodies and six helper outputs. Under `**Mode:** autonomous` the orchestrator now answers the `ontocoder` gate and applies a curator ledger whole, where 11.10.0 filed an open decision and skipped; that is the one change a user meets at a gate. `/fusion:cleanup` commits this checkout's registry entry in a split, `/fusion:post` writes its draft to a file before asking, and `/fusion:news` stops marking an unrendered entry seen. `bin/fusion-forum new` names `state=workbench-untracked` at exit 5 where it answered `new=0`, prints `writer=` under every entry and `skipped=` for a path that is no message; `bin/fusion-work-order` reports an `unreadable=` row and its `note=` fires on unresolved edges too; `bin/fusion-events dispatches` reports an unparseable `cutoff` as what it is, not as unstamped rows; `bin/fusion-checkout-name register` prints `person-collision=`; a `citations.exhibits` entry carrying an ellipsis is refused; the staging classifier reads `forum` and `checkouts` as record stores. No setting moves and there is no upgrade note for 11.11.0.

**Coming from an 11.9.1 install:** 11.10.0 adds one optional setting, changes six readings, and asks nothing of the user. A project may declare a record an exhibit in its own `fusion.json`, `citations.exhibits`, a list of storeless basenames the citation gates then leave as written. The write-time citation check reports a citation that spells the record's current marker as `spelled-marker`. The hooks' git helper tells a timeout from a decline, retries a timeout once and budgets 10 s per attempt. The commit lock writes a commit row only for a commit whose committer date falls inside the held region. `bin/fusion-events presence` names the work item a party is on again, off its latest dispatch row. The reference lint reads a slash-command token as a class of its own, and a head-field identifier that names no record is `undecidable` rather than dangling. No setting moves and there is no upgrade note for 11.10.0.

**Older than that:** this section carries the last three releases and no more, because it is a per-release list on a surface with a fixed byte ceiling. For an older install, run `ls $FUSION_SRC/docs/` and read every `upgrading-to` note above the user's own version, in version order; not every release has one, and no filename is derivable from a version string. One of them still carries an action that fails silently when it is skipped: v9 retired the `strategic` and `knowledge` domain values, and a record still carrying one runs as `code` without saying so.

**One caveat for the marketplace path:** the local *marketplace clone* at `~/.claude/plugins/marketplaces/<name>/` is what `/plugin install` reads, not the GitHub remote. If a version bump hasn't reached it, run `git -C ~/.claude/plugins/marketplaces/tenzoki-plugins pull origin main` first, then the three commands. (The HTTPS installer has none of this friction — prefer it.)

For the maintainer-side release flow (bumping `plugin.json` + `marketplace.json`, dual git push), read the "Release process" section of `CLAUDE.md` in the fusion **source repo** (https://github.com/tenzoki/fusion/blob/main/CLAUDE.md) — that file is dev-only and deliberately not shipped, so `$FUSION_PLUGIN_ROOT/CLAUDE.md` does not exist on an installed copy.

### 5. Configure — *customizing fusion for a project*

Two things to configure:

- **Project settings:** `$FUSION_SRC/templates/fusion.json` is the seeded file and documents each key; `$FUSION_SRC/README-hooks.md` is the full account. It sets `citations.extraPaths`, a project's citation-bearing non-Markdown paths, and nothing else — `orchestrator.maxTurns` and `orchestrator.dispatchMinutes` are retired leaves that earn an advisory. Not the guard either: the hooks block nothing and have no settings. A project root still carrying the retired `fusion-guard.json` is told so on every guarded call until deleted; copy nothing across, since everything it could set is retired too.
- **Project rules:** read `$FUSION_SRC/bin/fusion-rules` (the header comment is the spec). Two project-side rule locations:
  - `./rules/` — fusion-agent-specific rules (e.g. `review-priorities.md`) that have no meaning outside a fusion context.
  - `.claude/rules/` — project-wide rules every Claude session should respect (coding/ontology/normative/verb guidelines).
  Both are loaded by `bin/fusion-rules` per agent-name pattern. For large knowledge bodies you don't want loaded on every run, a project may also ship `./rules/context-manifest.yaml` — it registers topic-scoped loadable units (each a rule file or a `skill:<name>` pointer), pulled only when the agent **and** the active topic match (`bin/fusion-rules <agent> [<topic>]`). This lets `CLAUDE.md` stay a lean index rather than carrying everything inline. The mechanism is authored in `$FUSION_SRC/rules/context-manifest.md` (and the lean-`CLAUDE.md` convention in `rules/context-lean-claude-md.md`); absent the manifest, loading is byte-identical to before. The two routes split by size, not by agent: a small rule file loads by filename pattern, and the manifest carries anything large or topic-scoped. `analyst` is the case that shows the split — it inherited the retired investigator's failure-analysis work in v9 without inheriting that agent's rule pattern, and now matches `*analyst*` of its own, so a short `./rules/analyst-capture-layout.md` loads every run while a full capture layout is better registered as a manifest unit with `agents: [analyst]` and `topics: [always]`.

---

## Tone

User-facing output follows `rules/user-facing-output.md`. For this skill specifically: answer the user's question first, then add context. Don't lead with a wall of meta-commentary about what fusion is before answering "how do I install it?"

Direct, fusion-savvy, but not preachy. If the user is new, lead with overview. If they're advanced, skip the basics. Read what they actually asked, then decide depth.

Cite file paths whenever you reference a doc — the user may want to read it cold.

# fusion

A multi-agent orchestration framework for Claude Code. Fusion runs a work session as a team of **11 specialized agents** — an orchestrator that dispatches the rest, plus coders, reviewers, planners, and analysts — coordinating through files on disk, with a human at the decisions that matter and a hook layer that traces every write the agents make.

See [`docs/philosophy.md`](docs/philosophy.md) for why it's built this way, [`docs/working-model.md`](docs/working-model.md) for how a session runs (the work item's life, the gates, and the guard), and [`README-agents.md`](README-agents.md) for the full agent reference.

## Install

### Recommended — HTTPS installer

No git, no SSH, no marketplace cache:

```bash
curl -fsSL https://raw.githubusercontent.com/tenzoki/fusion/main/install.sh | bash
```

This downloads fusion over plain HTTPS into `~/.fusion` and installs a `fusion` launcher that loads the plugin straight from that folder. It sidesteps the three ways the marketplace path breaks for end users: it never clones over git, it doesn't rely on Claude Code's plugin cache, and uninstall is a plain `rm -rf`.

```bash
fusion              # start an orchestrator session
fusion --update     # re-download the latest, overwrite ~/.fusion
fusion --uninstall  # remove ~/.fusion and the launcher
fusion --where      # print the install dir
```

Overrides: `FUSION_REF` (git ref, e.g. `FUSION_REF=tags/v11.0.1` to pin a release — every release since v5.5.0 is tagged), `FUSION_HOME` (install dir, default `~/.fusion`), `FUSION_BIN` (launcher dir, default `~/.local/bin`).

**Upgrading from v10.26?** v11 is a cut, and the first release since v9 that asks you to do something. Five agent names stop resolving — `taskplanner`, `playmaker`, `bugfixer`, and `coderev`/`ontorev`, merged into one `reviewer` that takes a `**Review domain:**` line — taking the roster from 15 agents to 11. The Circle becomes the **work item**: one directory per unit of work, holding the item's record and everything the item produces, no marker on either, its state a `**Status:**` head field of `open`/`claimed`/`done`/`dropped` and its holder a `**Claim:**` field naming a checkout. **If your workbench was mid-work at the upgrade and still holds a live Circle record, run `/fusion:migrate`** — until you do, every record a session files lands in the shared store instead of inside its item, and nothing says so; `/fusion:setup` now detects that shape and refuses to run until it is converted. The Turn loop, the Turn budget, the session state file and the live dashboard file are gone, the session history store is closed to new writes, and the `next` and `direct` commands left with the Circle. The end-of-session pipeline became five commands you type by name — `/fusion:reconcile`, `/fusion:archive`, `/fusion:log-activity`, `/fusion:curate`, `/fusion:post` — so `/fusion:cleanup` is commit and push and nothing else, with its `--only` and `--skip` selectors gone; `/fusion:check` is new and runs the periodic checks `/fusion:setup` used to run inline. `orchestrator.maxTurns` and `orchestrator.dispatchMinutes` are retired leaves in `fusion.json`, and a project root still carrying `fusion-guard.json` should delete it and copy nothing across — the reverse of what the v10 note said, because the setting that note rescued has since been retired outright. `docs/upgrading-to-v11.md` is the note.

**Upgrading from v10.25?** v10.26 hands a dispatched agent a wall-clock stopping time. Seven agents (`coder`, `ontocoder`, `bugfixer`, `reconciler`, `coderev`, `ontorev`, `curator`) receive one line saying when to stop where they stand; an agent that reaches it hands back what it finished together with what it did not, and the orchestrator continues that work in a fresh dispatch at the same place. Nothing is killed when the clock runs out — the bound is requested and never enforced, so an agent that ignores it behaves exactly as it did before. `orchestrator.dispatchMinutes` (default 20) was the number that fed it. **All of that was retired again after v10.26**: no dispatch carries a stopping time, every dispatch runs to its natural end, and a project still declaring the setting gets one advisory naming the leaf. `bin/fusion-events dispatches` is new and stays — it says how long each dispatch ran, against a threshold the reading itself sets. One v10.25 defect closes: the message half of `/fusion:cleanup` wrote nothing on the pipeline path, only under `--only forum`. Nothing in your project is rewritten and there is nothing to migrate. `docs/upgrading-to-v10-26.md` is the note.

**Upgrading from v10.24?** v10.25 puts a message between two checkouts of one project: a session that ends offers to leave one short note in the repository, and `/fusion:news` shows you what arrived, read out of a fetched ref with your working tree untouched, before you decide whether to pull. Neither half exists until you run `fusion --update` and restart the session once, because a session reads its command roster and its helpers at start and never re-reads them; the command says exactly that when it meets the miss. `/fusion:cleanup` still stops exactly once, so a run you walk away from still completes everything but one answer, but that stop now asks two questions: `--skip claude-md` therefore leaves no message at all and `--dry-run` puts no draft. `orchestrator.dispatchMinutes` joins the configuration loader with a default of 20 and is printed by the `fusion-turn-budget` helper, though nothing reads the value yet; both the leaf and that helper were retired after v10.26. One defect ships open: where `fusion-workbench/` is not tracked in git the reading command answers "nothing new" forever and no state says why, so read an empty answer there as unmeasured. Nothing in your project is rewritten and there is nothing to migrate. `docs/upgrading-to-v10-25.md` is the note, and `docs/messages-between-checkouts.md` is the page on how the message works.

**Upgrading from v10.23?** v10.24 checks a record's citation form at the moment it is written: any `.md` landing in your workbench goes through the same citation grammar the gates use, and a retired spelling comes back to the agent that wrote it, on the lines that call wrote. It reports, blocks nothing and rewrites nothing. `bin/fusion-citation-check` gains one figure, `unrewritable-violations=`, and a per-row `unrewritable`/`rewritable` column, so a project whose build gate sits red on this class can tell the half a human may repair from the half nothing is allowed to touch; no existing key, verdict or exit code moves. `bin/monitor` takes port 0 and can write the URL it bound to a file, and the orchestrator's temporary commit-message path now carries the session id, so two projects' sessions stop sharing one. One defect ships open: under load the git helper reports a timeout as "not a git repository", so read a quiet review-coverage or staging line on a busy machine as unmeasured. Nothing in your project is rewritten and there is nothing to migrate. `docs/upgrading-to-v10-24.md` is the note.

**Upgrading from v10.20, v10.21 or v10.22?** v10.23 registers the checkout: on your next `/fusion:setup` it writes itself one file under `fusion-workbench/shared/checkouts/` and asks once what to call it, four display sites render that name where they rendered eight hex characters, and `bin/fusion-events presence` counts two git identities one person has registered as one person. Four personal log files change their name from your login to the checkout identifier, and the skill that writes each one renames an existing file on its next run. Three rules move: a resolution line cites a heading and an answered decision names who ruled, a store segment inside a fenced code block is now reported, and a reconciliation pass reports a located answer instead of moving the marker. Setup also says how far behind its upstream your checkout stands. `docs/upgrading-to-v10-23.md` is the note; 10.21 and 10.22 have none of their own, and `git log v10.20.0..v10.22.0` is the record for those.

**Upgrading from v10.14?** v10.20 changes how a record is cited: by its storeless basename, `YYMMDD-HHMM_*_<topic>.md`, with a store segment now reported as a violation. `bin/fusion-citation-check` is new and prints a `verdict=` line over your own corpus, which `/fusion:cleanup` repeats in its report (`helper-missing` until `fusion --update`). Nothing in your project is rewritten; the one-shot sweep is yours to run after reading its `--dry-run` census. `docs/upgrading-to-v10-20.md` is the note.

**Upgrading from v10.7?** v10.8 through v10.14 are the bookkeeping-cost releases. The mechanical event rows (`task_start`/`task_done`/`commit`) are machine-written by the hooks and the commit lock, with identity and `session_id` on every line; `/fusion:cleanup` runs incrementally off per-checkout anchors (the curator's full pass stays reachable with `--full`); the review cadence is one pass per Circle, at its closure, scoped by the coverage tiling; and dispatches carry roughly a third less conditioning after the style diet and the rule-audience moves. Setup offers a one-time stilwerk refresh. Nothing is rewritten and there is nothing to migrate. `docs/upgrading-to-v10-14.md` is the note (`docs/upgrading-to-v10-8.md` has the event-row detail).

**Upgrading from v10.6?** v10.7 is a defect-closure release: nothing is removed and nothing at your project root changes. What you can see: the reconciler's verdict set gains `directive-partially-met` and the recommendation `state Directive`, and the Rebalance gate now fires on every verdict but `coherent`; a `fusion.json` still carrying a `churn` key gets an advisory until you delete it; `bin/fusion-session-domain` is new and `bin/fusion-identity` halts when `git` is unreachable. Nothing is rewritten and there is nothing to migrate. `docs/upgrading-to-v10-7.md` is the note.

**Upgrading from v10.3?** v10.4 arms three blocking gates — over workbench citations, over a live plan's stopping section, and over the committed `hooks/dist/` — and all three run in fusion's own test suite, not in your project. What can reach you is one halt: the shaper's `**Initiated by:**` audit line is now required on every portfolio-activation run, including one you start yourself. `analyst` also gains a project-local rule pattern, so `./rules/analyst-capture-layout.md` loads on every `analyst` run. Nothing is rewritten and there is nothing to migrate. `docs/upgrading-to-v10-4.md` is the note.

**Upgrading from v10.2?** v10.3 takes the `**Status:**` head field off the decision-record template as well, and adds one question at a Circle closure: the orchestrator reads the plan's `## Where this work stops` clauses back to you and asks whether each holds. Nothing is rewritten for you and there is nothing to migrate. `docs/upgrading-to-v10-3.md` is the note, and the v10.4 note above applies as well.

**Upgrading from v10.0 or v10.1?** v10.2 changes what a Circle record holds: the `**Status:**` head field leaves the template, and `## Directive` stops carrying prose once the Circle has a spec. Nothing is rewritten for you and no workbench file breaks. `docs/upgrading-to-v10-2.md` names the one case that needs a decision, and the v10.3 and v10.4 notes above apply as well.

**Upgrading from v9?** v10 removes a file every consuming project has at its root: `fusion-guard.json` is no longer read, and `fusion.json` replaces it. A Turn budget left in the old file is not applied — that setting has since been retired outright, so there is nothing to move across. `docs/upgrading-to-v10.md` is the two-check migration.

**Upgrading from v8 or earlier?** v9 is a removal release: eight mechanisms, two agents and five skills left the plugin. Nothing breaks and no migration step is required, but a project set up under an older version may still hold configuration and workbench files that nothing reads any more. `docs/upgrading-to-v9.md` is the cleanup checklist, and `docs/upgrading-to-v10.md` above applies as well.

### Alternative — Claude Code marketplace (not recommended)

```bash
/plugin marketplace add tenzoki/claude-plugins
/plugin install fusion@tenzoki-plugins
```

The marketplace path has no `fusion` launcher; start an agent directly with `claude --agent fusion:orchestrator` (the plugin must be enabled in the project).

### The `fusion` launcher

The HTTPS installer writes `fusion` to `~/.local/bin`. It runs Claude Code with the plugin loaded and a chosen agent:

```bash
fusion                   # --agent fusion:orchestrator (default)
fusion coder             # --agent fusion:coder (bare names auto-prefixed)
fusion --yolo            # add --dangerously-skip-permissions (skip approval prompts)
fusion coder -p "..."    # extra args after the agent pass straight to claude
fusion --help            # full usage
```

### Requirements

- **Claude Code v2.1.63+** (the orchestrator uses the `Agent(...)` tool-restriction syntax introduced there; on older Claude Code, use fusion v1.9.3 or earlier).
- **Node.js 18+** for the TypeScript hooks. The hooks ship pre-compiled to `hooks/dist/` — no `npm install` needed at runtime, only `node`.
- **Python 3** for the monitor dashboard.

## Setup

Run once at the project root:

```bash
/fusion:setup
```

This creates `fusion-workbench/` (the shared workspace, including `.guard-state/`), copies in the monitor binary and the stylometric voice profiles, seeds `fusion.json` at the **project root** (your project's own fusion settings, git-tracked, so commit it), and writes a `.fusion-setup` marker. Every agent and hook locates the workbench by walking **up** from its working directory until it finds that marker — so agents run correctly from any subdirectory of the project.

Setup is the only thing that creates a workbench. Without it, agents halt with "no fusion workbench found" and hooks no-op silently — intentional, so a session whose working directory happens to land elsewhere never spawns a stray workbench.

## Your first session

**The daily loop, in five lines:** morning — `/fusion:cadence` shows what you have actually been doing; work — start the orchestrator and say what you want; ideas on the way — `/fusion:memo` files them without breaking stride; done — `/fusion:cleanup`, and you may walk away: one question waits for your return. Everything below is that loop in detail.

Start the orchestrator and give it a task:

```bash
fusion                                   # or: claude --agent fusion:orchestrator
```

Then, in the chat, state what you want — for example *"implement the plan in planning, then review it"* or *"fix the failing test in the parser."* The orchestrator resolves the scope and runs a **dispatch loop**: one task at a time — read it, dispatch an executor (coder, ontocoder), read what comes back, commit it, and tell you where things stand before taking the next one. No queue is built and no count bounds the loop; you do, by saying what is next. The reviewer runs **once per work item, at its close**, scoped by the coverage tiling so nothing slips between sessions. A reconciliation checks the tracking files when you ask for it (`/fusion:reconcile`), and on anything but a clean verdict it opens the **Rebalance gate**.

You'll hit **gates** — points where the orchestrator stops and asks — before ontology changes, destructive operations, and ambiguous decisions. That's the design; answering them is how you steer.

Watch it live. In a second terminal at the project root:

```bash
./fusion-workbench/monitor "My Session" 8099
```

This serves a live HTML dashboard at `http://localhost:8099` (reading `orchestrator-events.jsonl`, which the hooks write). Arguments: `name` and `port` are required; `-n <N>` sets max event lines (default 100), `-i <sec>` the refresh interval (default 2).

## Best practices

- **One Directive per session.** Give the orchestrator a single, clear outcome. If you find yourself describing three unrelated goals, that's three sessions — or file the extras as work items (below) and take them one at a time.
- **Let the gates do their job.** The human gates before ontology edits and destructive operations are where fusion earns its keep. Don't `--yolo` through them out of habit; `--yolo` is for a throwaway loop where nothing is at stake, not for real work on a shared tree.
- **Trust tracking files only after reconciliation.** Status markers in plans and issues can lag reality mid-session. Ask for a reconciliation before you rely on what the tracking files claim — nothing schedules one, so it runs when you say so.
- **Keep the working tree clean.** The orchestrator commits per task. Start a session from a clean tree so its commits are legible; don't mix hand-edits into a running session, or you'll blur which change came from where.
- **One task, or a backlog.** For one obvious task, just tell the orchestrator. When you have several units of future work whose priority isn't obvious, file each as a work item with `/fusion:memo` and claim one by hand. Nothing ranks them: the ranking agent and its command both went at v11.
- **Keep `CLAUDE.md` and `./rules/` current.** Agents load your project rules every session through `fusion-rules`. Stale rules mean stale behavior — treat them as living config, not documentation.
- **Say yes to Setup's permission question rather than reaching for `--yolo`.** `/fusion:setup` offers once to write a permissive `.claude/settings.local.json` for the project. It persists across sessions, it is a considered choice you made once, and it keeps the catastrophic-operation backstop that `--yolo` removes. `--yolo` is per-run, unconditional, and worth keeping for throwaway loops. Decline the question and the project simply keeps its per-tool approval prompts; Setup will offer again next run.
- **Nothing blocks your writes.** fusion's hook layer is observation-only: it allows every tool call, traces the write-tool ones into the event log the monitor renders, and tells you when your `fusion.json` is broken. It used to enforce — a protected-path deny, a decision-governed deny, and a halt after three blocks — and each was removed on its own measurement. See [Configuration](#configuration) for what the file still sets, and [`README-hooks.md`](README-hooks.md) for what each check was and why it went.

## Configuration

- **Your project's settings** — one file, `fusion.json` at your project root, which `/fusion:setup` seeds from [`templates/fusion.json`](templates/fusion.json). It declares nothing and documents each key you can set in its own notes. **What it configures today is `citations.extraPaths`, the non-Markdown paths your project declares as carrying record citations, and nothing else.** The merge is two layers, per leaf key — your file, then the built-in defaults in `hooks/lib/config.ts` — so a key you declare wins outright and a key you leave out falls straight through. It is git-tracked on purpose: which of your files fusion's citation helpers read should show in a diff. Runtime state lives per-project in `fusion-workbench/.guard-state/` (gitignored). See [`README-hooks.md`](README-hooks.md) for what the hooks do with it.

### Settings

| Goal | Change |
|---|---|
| Bound how much a session does in one go | Nothing to set. `orchestrator.maxTurns` and `orchestrator.dispatchMinutes` are **retired**: the Turn loop and the dispatch bound they configured were removed on 2026-09-10, and a project still declaring either gets one advisory per guarded tool call until the key is deleted. The loop is bounded by you answering after each task |
| Have the citation helpers read your non-Markdown files too | `citations.extraPaths`, declared as `{"citations": {"extraPaths": ["src/**/*.go"]}}`. Each entry is a git pathspec under `:(glob)`, resolved against the files git tracks. `bin/fusion-citation-check` and `bin/fusion-citation-sweep` add exactly those files to the Markdown corpus they already read; no hook reads it. Outside Markdown there is no code fence and no block quote, so fusion cannot tell a token that points at a record from one that shows what a record name looks like — you declare the files that cite, and leave out the ones that exhibit. Declare nothing and you get today's behaviour exactly. A value that is not an array of non-empty strings is dropped whole, named in an advisory, and inherits as if absent |
| Stop the advisory naming `fusion-guard.json` | Delete `fusion-guard.json`. Copy nothing across: everything that file could set is retired too. That file is **retired**: fusion replaced it and no longer reads a byte of it. The advisory repeats on every guarded tool call until the file is gone. Full account in [`README-hooks.md`](README-hooks.md#per-project-configuration-fusionjson) |
| Turn the guard down | There is nothing to turn down. The hooks block nothing and decide nothing — see [`README-hooks.md`](README-hooks.md) for what each removed check was and the measurement that removed it |

- **Rules** — three layers, all discovered by `bin/fusion-rules` at each agent's Setup: the plugin's own `rules/` (framework ground truth, always loaded), the project's `./rules/` (fusion-agent-specific rules — capture layouts, priority overrides), and the project's `.claude/rules/` (project-wide rules every Claude session should respect — coding and ontology standards). Missing files are skipped silently; add what your project needs.
- **Language and voice** — set `**Language:** en` (or `de`) in your project `CLAUDE.md`. Setup copies four stylometric profiles into `fusion-workbench/stilwerk/`: `default-voice-{en,de}.yaml` (long-form writing, for prose agents) and `chat-voice-{en,de}.yaml` (short-form chat, for every agent). The `**Language:**` line selects the chat pair. A project whose written files use a different language than its chat adds an optional second line, `**Artifact language:** en` (or `de`), which then selects the writing pair — leave it out and one language governs everything, as before. Both lines are defined in `rules/fusion-workbench-conventions.md` `## Project language`.

## fusion-workbench

`fusion-workbench/` at the project root is the shared workspace for all agents. **One kind, two candidate stores**: a work item's own container under `circles/`, and `shared/` for work belonging to no item. Session and hook state stays at the root.

```
fusion-workbench/
├── circles/                      # one directory per work item
│   └── <stamp>-<slug>/           # the item's record, plus what the item produced
│       ├── <stamp>-<slug>.md
│       └── planning/ issues/ decisions/ reviews/ analyses/ history/
├── shared/                       # the same kinds, for work belonging to no item
│   ├── planning/ issues/ decisions/ reviews/ analyses/
│   ├── history/ investigations/ consult/ memos/ forum/ checkouts/
├── archive/  stilwerk/  monitor
└── (root-anchored state: orchestrator-events.jsonl, .guard-state/,
     .commit-lock/, .session-marker, .checkout-id, .cadence-anchors)
```

**The Origin Rule makes the placement decision**: an artifact belongs to the work item whose directive caused it to come into existence, and to `shared/` when no item is in scope. Cross-cutting relevance is cited rather than copied. Agents never hard-code these paths — they resolve write and scan targets through `bin/fusion-paths` at Setup, which names the container of the item this checkout has claimed, or the shared store when it holds none. What v11 removed here was the six-state Circle record and the ranking layer over it, not the container; `/fusion:migrate` converts a workbench that still holds a live Circle record.

**State markers** (encoded as `_x_` in filenames):

- **issues / planning:** `_o_` open · `_p_` in progress · `_c_` closed · `_d_` deferred
- **decisions:** `_o_` open question · `_a_` answered · `_i_` implemented · `_d_` deferred · `_s_` superseded
**A work item carries no marker at all.** Its state is the `**Status:**` head field — `open`, `claimed`, `done`, `dropped` — so a state change edits the file instead of renaming it and every citation of an item stays valid for the item's whole life. `claimed` is the value the other two vocabularies have no equivalent for, and it is what the store exists to carry: it names the checkout doing the work.

Rule of thumb: file in `issues/` when the resolution is "go fix it," in `decisions/` when it's "decide and record," and as a work item under `circles/` when it is a job somebody is going to do. The full layout, the work-item grammar and the issue, planning and decision marker transitions live in [`rules/fusion-workbench-conventions.md`](rules/fusion-workbench-conventions.md).

Three surfaces open the workbench for you directly: `/fusion:memo` appends personal notes to `shared/memos/` and files each idea as its own work-item directory under `circles/`, `/fusion:log-activity` scans commits and the workbench into a per-day activity log at the project root, and `/fusion:cadence` reads that log together with the session histories and git to write a digest of what you have actually been working on — topics since yesterday, topics of the last seven days, and the themes that keep recurring ranked by how many sessions they show up in. The digest lands next to the memos as `cadence-<checkout>.md` and is overwritten on each run; it summarizes the activity log rather than replacing it, so run `/fusion:log-activity` first when you want the underlying record fresh.

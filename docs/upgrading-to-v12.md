# Upgrading to fusion v12 (from v11.11.1)

v12 renames. Seven agents, three workbench stores, one dispatch parameter and the helpers and keys
that carry them take the names of the PRIOR/Fusion vocabulary, and the prose the module ships says
work package, brief, evidence base, approval, audit result, workflow, module and artefact where it
said work item, Directive, Grounding, gate, verdict, skill, plugin and artifact. Nothing is removed and
no behaviour moves: every agent does what it did under its old name. This note describes v12 as it
stands at the latest v12.x release, not as it stood at `v12.0.0`: a release that changes something
the note describes edits the note in the same commit.

**Two things reach your project.** A name you type or your tooling sends stops resolving the day you
update, and your workbench still carries the three v11 store names until you rename them. The first
is loud; the second is quiet, and the module reads the old names for one major version so that
nothing breaks while you get to it. That grace period is the **transition window**, and it closes at
**13.0.0**.

Upgrading itself is the ordinary update: `fusion --update`, or the uninstall/install/reload sequence
on the marketplace path, and then restart the session once. A session reads its agent, workflow and
helper roster at start and never re-reads it, so nothing below exists until you do. `fusion --update`
fetches the head of `main`, so v12 reaches it once the release is merged there; the release is tagged
`v12.0.0`, and `FUSION_REF=tags/v12.0.0 fusion --update` pins exactly that version.

## What was renamed

### Seven agents

| v11 name | v12 name |
|---|---|
| `shaper` | `requirements-designer` |
| `planner` | `implementation-planner` |
| `coder` | `code-implementer` |
| `ontocoder` | `data-implementer` |
| `reconciler` | `state-auditor` |
| `editor` | `document-editor` |
| `curator` | `policy-curator` |

`orchestrator`, `reviewer`, `analyst` and `consultant` keep their names, and the roster stays at
eleven. The reviewer now also answers to the two profile identifiers `code-reviewer` and
`data-reviewer`, selected as before by its `**Review domain:**` line (`README-agents.md`
`## The agents`).

### Three stores

| v11 store | v12 store |
|---|---|
| `circles/`, the container store | `work-packages/` |
| `planning/`, under `shared/` and inside every container | `plans/`, in the same places |
| `shared/consult/` | `shared/consultations/` |

Every other store keeps its name. `archive/` keeps the names its sweeps froze, `circles/` included,
for good.

### Parameters, keys and helpers

| v11 | v12 |
|---|---|
| the dispatch parameter `**Item:**` | `**Work package:**`; the old spelling is no longer parsed |
| the resolver keys `OUT_BACKLOG` / `SCAN_BACKLOG` | `OUT_PACKAGES` / `SCAN_PACKAGES` |
| the helper `fusion-claimed-item` and its `ITEM=` line | `bin/fusion-claimed-package` and `PACKAGE=`; `CONTAINER=` is unchanged |
| the citation kinds `circle-record` / `circle-dir` in `bin/fusion-citation-check` | `package-record` / `package-dir` |
| the rule headings `## Backlog entries — work items` and `## Human Gate Rules` | `## Work packages` and `## Human approval rules` |

`OUT_CONSULT` now names `shared/consultations`, and `OUT_PLAN` ends in `plans`. The `## Directive`
heading of a work-package record and of the spec and plan templates is **unchanged**: every record you
have carries it, so it stays until a release that may rewrite records renames it.

## The transition window, 12.0.0 to 13.0.0

Until 13.0.0 each renamed store is **read under its old name beside the new one, wherever the old
directory exists, and never written under it**. The rule is defined once, in
`rules/fusion-workbench-conventions.md` `### Transition window (v12.0.0 to v13.0.0)`, and copied into
`hooks/lib/stores.ts` and `bin/fusion-stores`; tests hold the three equal and refuse a 13.x version
while a legacy entry stands.

What that means for a workbench you have updated but not yet migrated:

- **Nothing breaks.** Every `SCAN_*` key lists the old directory beside the new one, so an agent
  still finds the plans, consultations and work packages it found yesterday.
- **New records land under the new names.** Every `OUT_*` key names a new store, so a plan filed today
  goes to `plans/`, not `planning/`, and the two stand side by side until you migrate.
- **`/fusion:setup` says so, once, and continues.** Its probe prints a `LEGACY-STORES` line naming each
  old store it found and `/fusion:migrate`.
- **A plan step whose `Executor:` names a v11 agent is dispatched under the v12 name.** The
  orchestrator carries the seven-row table above for the persisted plans that spell the old one.

At 13.0.0 the window closes: the legacy reads, the `Executor:` alias and setup's continue-on-legacy
case are removed together, and `/fusion:setup` refuses a workbench that still carries a v11 store
name. `/fusion:migrate` keeps working after that, for a project that updates late.

## What to do in your project

Three checks. The first is the migration; the other two are names outside your workbench.

### 1. Migrate the workbench inside the window

`## Migrating your workbench` below is the procedure. Run it right after the update, before a session
files anything: that keeps the migration a pure rename, and it avoids the one case the pass cannot
fold on its own, described there.

### 2. Stop dispatching the seven old agent names

If you start agents directly — `fusion coder`, `claude --agent fusion:shaper`, an `Agent(fusion:curator)`
in your own prompts or tooling — the seven v11 names no longer resolve. A wrong agent name aborts
Claude Code at startup, so this one tells you loudly. `bin/fusion-rules` and `bin/fusion-paths`
answer an old name with exit 2 and a note naming the new one, so a stale prompt that asks either
helper learns what to ask for instead. Your tooling that reads `ITEM=`, `OUT_BACKLOG` or a
`**Item:**` line needs the v12 spelling from the table above.

### 3. Rename the agents in your context manifest

**This one is silent.** If your project ships `./rules/context-manifest.yaml`, its `agents:` arrays name
agents by identifier, and **the manifest is not read through the window**: a unit keyed
`agents: [coder]` simply stops loading for `code-implementer`, with no error and no advisory.
Find the old names and replace them with the v12 ones:

```bash
grep -nE '(^|[^[:alnum:]-])(shaper|planner|coder|ontocoder|reconciler|editor|curator)([^[:alnum:]-]|$)' rules/context-manifest.yaml
```

The manifest format is otherwise unchanged (`rules/context-manifest.md`). Your live plans' `Executor:`
lines need nothing: the orchestrator reads them through the alias until 13.0.0, and a plan closed by
then is history.

## Migrating your workbench

One checkout does this, once, for the whole project:

1. `fusion --update`, then restart the session.
2. `/fusion:migrate`. It checks that the installed module is 12.0.0 or later, surveys, shows you
   every rename it will make with its entry count, and asks before it moves anything. In a tracked
   workbench each move is a `git mv`, so the whole migration is one diff of renames.
3. Commit the migration as one commit and push it.
4. Tell the other checkouts to pull. They do not migrate again: two checkouts renaming independently
   leave the project two revert points instead of one.

**No record is rewritten.** Directories move and every file keeps its basename and its bytes, so a
storeless citation (`YYMMDD-HHMM_*_<topic>.md`) resolves after the move exactly as before. A citation
that spells a store segment — `circles/…` or `planning/…` inside a record — is not touched by the
migration, and `bin/fusion-citation-check` reports it as store-prefixed as it did before. The repair
is yours to run by hand: `/fusion:migrate` offers it as its last step, or run
`bin/fusion-citation-sweep --dry-run` yourself, read the census, and only then its write. The write
changes record content, so commit it as a second commit, after the migration commit.

**What the migration leaves where it stands:** `archive/`, which keeps its old inner names for good;
the frozen stores; `issues/`, `decisions/`, `reviews/`, `analyses/`, `memos/`, `history/` and the other
unrenamed stores; `stilwerk/`; and every root file. The survey names each, and says when a decision
record holds an open question about its future name.

**Other checkouts.** A checkout that pulls the migration commit gets the new layout by git's ordinary
means. Two cases need a word:

- a container that checkout holds under `circles/` and never committed is untracked, so the pull
  leaves it behind; run `/fusion:migrate` once more there and it folds that container in;
- a tracked file that checkout modified under `circles/` makes git refuse the pull as it refuses any
  pull over local changes; commit or stash, then pull.

**The one case the pass will not fold.** If a session filed a record for a work package you hold
*before* you migrated, the package now has two containers: its record under `circles/<dir>/` and the
new record under `work-packages/<dir>/`. The migration never merges one directory into another: it
refuses that container as a collision, names it, and moves everything else. Move the entries of
`circles/<dir>/` into `work-packages/<dir>/` by hand (`git mv`, one entry at a time) and run
`/fusion:migrate` again. Migrating before the first session after the update is how you never meet
this.

**If you skip the migration** nothing breaks inside the window, and every store you have carries two
names until you do. After 13.0.0, `/fusion:setup` refuses the workbench until it is migrated.

**A workbench older than v11** — the pre-v4 type folders, a v4-era flat Circle file, a live Circle
record or a bracket-marked filename — is refused by the v12 migration, which converts none of those
shapes. Check out the module source at the tag `v11.11.1`, run `/fusion:migrate` there under
`claude --plugin-dir <that checkout>`, then `fusion --update`, restart, and run `/fusion:migrate` again
for the store names.

## What needs no action

Each line says what this release did to something and stops there.

- **Your records.** No issue, decision, plan, review, analysis or history file was rewritten or
  renamed by this release; the migration moves directories only.
- **The marker vocabularies and the citation grammar.** Unchanged, apart from the two citation kinds
  renamed above.
- **`fusion.json`**, **the hooks**, **your `.claude/` permission settings and your commit lock.**
  Unchanged.
- **Your voice profiles.** The shipped chat profiles now ban the v12 nouns beside the v11 ones; the
  copies under your `fusion-workbench/stilwerk/` are yours and keep what they say.

## Where to read more

- `README-agents.md` `## The agents` — the eleven agents under their v12 names.
- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` — the layout, with the window.
- `skills/migrate/SKILL.md` — the migration's own survey, question and refusals.
- `docs/upgrading-to-v11.md` — the previous release with an action in it, if you are coming from
  v10.26 or earlier. Its migration step now runs at the `v11.11.1` tag, as described above.

# Upgrading to fusion v12 (from v11.11.2)

v12 renames. Seven agents, three workbench stores, one dispatch parameter and the helpers and keys
that carry them take the names of the PRIOR/Fusion vocabulary, and the prose the module ships says
work package, brief, evidence base, approval, audit result, workflow, module and artefact where it
said work item, Directive, Grounding, gate, verdict, skill, plugin and artifact. Nothing is removed and
no behaviour moves: every agent does what it did under its old name. This note describes v12 as it
stands at the latest v12.x release, as of `v12.0.1`, not as it stood at `v12.0.0`: a release that
changes something the note describes edits the note in the same commit.

**Two things reach your project.** A name you type or your tooling sends stops resolving the day you
update, and your workbench still carries the three v11 store names until you rename them. The first
is loud; the second was quiet, and the module read the old names for one major version so that
nothing broke while you got to it. That grace period was the **transition window**, and it closed at
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

Until 13.0.0 each renamed store was **read under its old name beside the new one, wherever the old
directory existed, and never written under it**. For a workbench updated but not yet migrated that
meant: every `SCAN_*` key listed the old directory beside the new one, every `OUT_*` key named a new
store, `/fusion:setup` printed a `LEGACY-STORES` line and continued, and a plan step whose `Executor:`
named a v11 agent was dispatched under the v12 name.

At 13.0.0 the window closed: the legacy reads, the `Executor:` alias, the manifest's old-name match
and setup's continue-on-legacy case were removed together, and `/fusion:setup` refuses a workbench
that still carries a v11 store name. `/fusion:migrate` keeps working after that, for a project that
updates late.

## What to do in your project

Three checks. The first is the migration; the other two are names outside your workbench.

### 1. Migrate the workbench

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

If your project ships `./rules/context-manifest.yaml`, its `agents:` arrays name agents by
identifier. Until 13.0.0 an old name was still matched as its v12 name, with a one-line advisory
from `bin/fusion-rules`; since 13.0.0 a unit keyed `agents: [coder]` does not load for
`code-implementer`, silently. The grep below is how you find the old names and rename them:

```bash
grep -nE '(^|[^[:alnum:]-])(shaper|planner|coder|ontocoder|reconciler|editor|curator)([^[:alnum:]-]|$)' rules/context-manifest.yaml
```

The manifest format is otherwise unchanged (`rules/context-manifest.md`). The orchestrator read a
live plan's old `Executor:` line through an alias until 13.0.0; since then a live plan names the
v12 identifier, and a closed one is history.

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
`bin/fusion-citation-sweep --dry-run --kinds record,package-record,package-dir` yourself, read the
census, and only then its write. Since 12.0.1 that step asks about these store repairs alone, and its
census names the `archive/` and `citations.extraPaths` shares apart from the workbench's. The
respelling of pre-v4 bracket markers (`--kinds bare-record`) is unrelated to v12 and not part of the
migration; it stays a separate choice for later. The write changes record content, so commit it as a
second commit, after the migration commit.

**What the migration leaves where it stands:** `archive/`, which keeps its old inner names for good;
the frozen stores; `issues/`, `decisions/`, `reviews/`, `analyses/`, `memos/`, `history/` and the other
unrenamed stores; `stilwerk/`; and every root file. The survey names each, and says when a decision
record holds an open question about its future name. It stops only on an entry it cannot classify
that is, or directly holds, a `circles`, `planning` or `consult` directory: move that misplaced store
by hand and run it again. Since 12.0.1 it decides this by layout and opens no file, so a note that
merely mentions an old store path no longer stops it.

**Other checkouts.** A checkout that pulls the migration commit gets the new layout by git's ordinary
means. Two cases need a word:

- a container that checkout holds under `circles/` and never committed is untracked, so the pull
  leaves it behind; run `/fusion:migrate` once more there and it folds that container in;
- a tracked file that checkout modified under `circles/` makes git refuse the pull as it refuses any
  pull over local changes; commit or stash, then pull.

**A package with records under both roots.** If a session filed a record for a work package you
hold *before* you migrated, the package has records under `circles/<dir>/` and under
`work-packages/<dir>/`. The migration folds the first into the second file by file. Only a file whose
path exists on both sides is refused: the pass names it, leaves it where it is, and moves everything
else. Keep one of the two, delete or rename the other, and run `/fusion:migrate` again. Migrating
before the first session after the update is how you never meet this.

**If you skip the migration**, `/fusion:setup` refuses the workbench from 13.0.0 on until it is
migrated, as the window's close made it.

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
- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` — the layout.
- `skills/migrate/SKILL.md` — the migration's own survey, question and refusals.
- `docs/upgrading-to-v11.md` — the previous release with an action in it, if you are coming from
  v10.26 or earlier. Its migration step now runs at the `v11.11.1` tag, as described above.

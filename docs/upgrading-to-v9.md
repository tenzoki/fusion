# Upgrading to fusion v9

v9 is a removal release. Eight shipped mechanisms, two agents, five slash commands, three
`bin/` helpers, two of the four `**Domain:**` values and four event types left the plugin,
each on a measurement recorded in fusion's own workbench. Nothing was added in their place.

Upgrading is the ordinary update — `fusion --update`, or the uninstall/install/reload
sequence on the marketplace path. **Nothing in your project breaks on the upgrade**, and no
migration step is required. What the upgrade cannot do is clean up the configuration and
the workbench files you created for mechanisms that no longer exist. This page names them,
so you can decide which to delete.

If you never configured the Plane bridge and never wrote a `**Domain:** strategic` or
`**Domain:** knowledge` line, the only thing on this page that touches you is the
[slash commands](#the-five-slash-commands-that-are-gone) section.

## What left

| Removed | Measured on |
|---|---|
| The Plane work-queue mirror | 50 deferred outbox entries over its whole life, 0 successful pushes |
| The guard's churn heatmap and its cross-file counters | never once the reason a session changed course |
| The Circle stash-and-restore skill pair | the stash protocol had no user |
| The `conceptrev` design-diagram evaluator | an advisory verdict at a gate nobody gated on |
| The `investigator` agent | folded into `analyst` as a ninth analysis type, Failure Investigation |
| The `strategic` and `knowledge` domain values | 0 and 2 dispatches respectively, over the parameter's whole life |
| The persisted `fusion-workbench/tasklist.md` | `taskplanner` returns its queue in a report instead |
| The hand-maintained session counters and the state-drift check | every counter was derivable from git or the event log |

The full record of each removal, with the figures behind it, is in fusion's own workbench
under the Circle `260815-0007-remove-eight-mechanisms-and-cap-growth` in the source repo.

## What to do in your project

Six checks. Each is optional — nothing here is load-bearing, and skipping all six leaves a
working installation with some dead files in it.

### 1. Delete the Plane bridge's files

If you configured the Plane mirror, three files under your workbench are now read by
nothing:

```
fusion-workbench/plane.config.yaml
fusion-workbench/.plane-map.json
fusion-workbench/.plane-outbox.jsonl
```

Delete them. They were already reported as `unclassified` by `bin/fusion-staging-drift`,
which raises no alarm, so leaving them costs you a line of noise per staging report and
nothing else. If your outbox holds deferred entries you have not read, read it before you
delete it — it is the only record of what the bridge would have pushed.

### 2. Retire your `**Domain:** strategic` and `**Domain:** knowledge` lines

The parameter now accepts `code` and `data`. **An unrecognised value is not an error: it
falls back to `code`, silently**, in `taskplanner`, `reconciler` and `playmaker` alike. So
an anticipated Circle record, a backlog entry or a dispatch prefix still carrying one of
the two retired values will run, and will run as a `code` domain without saying so.

Grep your workbench for the two words and rewrite each line to `code` or `data`
deliberately, rather than letting the fallback choose:

```bash
grep -rn '\*\*Domain:\*\* *\(strategic\|knowledge\)' fusion-workbench/
```

### 3. Delete the retired task queue, if you have one

`fusion-workbench/tasklist.md` is no longer written or read. The work queue is not a file
any more: `taskplanner` builds it from your records and returns it in its report, for that
session only. Delete the file. If it holds open work you never transferred into issue or
decision records, transfer it first — nothing else in the workbench carries it.

### 4. Delete `./rules/investigator-capture-layout.md`, if you have one

The `investigator` agent required a project-supplied capture-layout rule, seeded from a
template and filled in by you. Both the agent and the template are gone, and the file you
filled in is now loaded by nothing — `analyst`, which inherited the work, draws no
project-local rule by filename pattern.

If the layout it describes is still worth loading into `analyst`, the route is
`./rules/context-manifest.yaml`, the topic-scoped manifest `bin/fusion-rules` reads:

```yaml
units:
  - path: ./rules/analyst-capture-layout.md
    agents: [analyst]
    topics: [always]
```

The mechanism is authored in `rules/context-manifest.md` in the plugin source. Whether
`analyst` should instead gain a filename pattern of its own, the way `investigator` had
one, is an open question in fusion's own decision store and is not settled here.

### 5. Check your guard configuration for a hand-set `churn` block

The churn thresholds were never a project-set key: the `fusion-guard.json` template fusion
seeds has never carried them, so **if you did not add one by hand, there is nothing to
remove**. If you did add one against the shape in the plugin's own configuration file,
delete it. Unlike `guard.protectedPaths`, which was *retired* and reported on every guarded
call until you deleted the line, an unrecognised key such as `churn` is carried through
untouched and reported nowhere — so a stale block sits there silently.

At v10 this check is moot in the simplest way: `fusion-guard.json` is not read at all. See
`## What needs no action` below.

### 6. Delete `fusion-workbench/stashes/`, if you have one

Written by the two Circle stash-and-restore skills, which are gone. Four shipped consumers
still exclude the directory from their sweeps, deliberately, so leaving it is safe and
costs nothing. Delete it only once you are sure no stash in it is still wanted — a stash
holds a Circle's whole frozen state, and nothing restores it any more.

## The five slash commands that are gone

Five skills were deleted outright. Typing their commands now does nothing at all, so if one
is in your muscle memory, here is what took over:

| Deleted | What took over |
|---|---|
| `unlock` | `/fusion:setup` — its Step 0g offers to seed `.claude/settings.local.json` itself |
| `revise-claude-md` | `/fusion:cleanup` Step 5, which dispatches the `curator` behind a user gate |
| `circle-stash`, `circle-pop` | nothing — the stash protocol was removed, not replaced |
| `seed-from-plane` | nothing — the Plane bridge was removed, not replaced |

Separately, three surviving skills were **demoted rather than deleted**: archiving, the
`CLAUDE.md` reconciliation and the activity log are now presented as steps of
`/fusion:cleanup`, reachable alone with `--only archive`, `--only claude-md` and
`--only log-activity`. Their own commands still resolve, because the skill directories are
still there; they are simply no longer advertised. The three commands fusion presents as
its user surface are `/fusion:setup`, `/fusion:cleanup` and `/fusion:cadence`, and
`/fusion:help` answers everything else.

## What needs no action

- **A halt raised by the old protected-path guard** was still enforced at v9: it blocked,
  and the block message named the command that cleared it. That stopped being true at v10,
  which removed the halt, the escalation counter and the clearing script together. A halt
  flag left in your `escalation.json` now blocks nothing, there is no command to clear it
  with, and `/fusion:setup` offers to delete the file. **If you are upgrading past v9, read
  `docs/upgrading-to-v10.md` as well** — it is the one that touches your project root.
- **Your `fusion-guard.json`** was unaffected at v9: every key it set that still existed
  was merged exactly as before. At v10 that file is not read at all, and a Turn budget left
  in it is silently not applied. The v10 note covers the move.
- **Your Circle directories, records, issues, decisions, reviews and histories** are
  untouched. The workbench layout did not change in v9.
- **Review files with a `conceptrev` sender** stay readable and stay where they are. The
  sender is retired, not the files.

## Where to read more

- `docs/working-model.md` — how the machinery runs, brought up to the v9 surface.
- `README-agents.md` — the agent roster and the dispatch parameters seven of them read.
- `/fusion:help` — install, update and configure, answered from the live installation.

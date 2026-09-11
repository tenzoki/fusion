# Upgrading to fusion v11 (from v10.26)

v11 is a cut, and the deepest one fusion has made. Five agent names stop resolving, two slash
commands are gone, the Turn loop and the session state file are gone, and the Circle — the unit of
work since v3 — is replaced by something simpler. Most of that never reaches your project.

**One thing does, and it is why this note is not like the v10 ones.** Every note since v9 opens by
telling you that nothing in your project is rewritten and there is nothing to migrate. **That is
false for this release** if your workbench was mid-work when you upgraded. A workbench holding a
live Circle record has to be converted, and until it is, every record a session files lands outside
the work item it belongs to — silently, for as long as you leave it. Check 1 below is the whole of
it and takes a minute.

Upgrading itself is the ordinary update: `fusion --update`, or the uninstall/install/reload
sequence on the marketplace path, and then restart the session once. A session reads its agent,
skill and helper roster at start and never re-reads it, so nothing below exists until you do. The
release is tagged `v11.0.0`, and `FUSION_REF=tags/v11.0.0` pins exactly this version.

## What left

| Removed | What stands in its place |
|---|---|
| The agents `taskplanner`, `playmaker` and `bugfixer` | Nothing. Each went with the subject it served: the per-session work queue, the Circle portfolio, and the phase procedure that held one self-healing attempt. The bugfixer's diagnose-before-you-edit contract survives inside `coder` and `ontocoder`, which now do their own diagnosis. |
| The agents `coderev` and `ontorev` | One `reviewer`, which takes a `**Review domain:** <code or data>` line on its dispatch. |
| The Circle — a directory with a six-state marker record and a portfolio layer over it | The **work item**: one file per unit of work, no marker on its filename, its state a `**Status:**` head field taking `open`, `claimed`, `done` or `dropped`, and its holder a `**Claim:**` field naming a checkout. |
| The Turn loop and the Turn budget that bounded it | Nothing. A session runs to its natural end. |
| `agentstate.yaml`, `orchestrator-live.md` and `.active-circle` at your workbench root | Nothing reads them. The event log beside them is what the monitor and the helpers read, and it is unchanged. |
| The end-of-session pipeline behind `/fusion:cleanup` | Five commands you type when you want them. |
| The `next` and `direct` slash commands | Nothing. The first ranked and activated a Circle; the second wrote a per-unit-of-work record that no longer exists. Typing either now reports an unknown command. |
| Writes to the session history store | Nothing. No agent writes a session log any more. Your existing history files stay where they are and stay readable. |

Two commands arrived: `/fusion:check`, which runs the periodic installation checks `/fusion:setup`
used to run inline, and `/fusion:reconcile`, which is one reconciler pass on its own.

## What to do in your project

Five checks. Only the first can cost you anything, and it costs a lot if you skip it.

### 1. Convert a workbench that still holds a live Circle record

This is the whole migration. If it does not apply to you, nothing else in this section is urgent.

```bash
find fusion-workbench/circles -mindepth 2 -maxdepth 2 -name '_[at]_circle.md'
```

If that prints nothing, you are in the current format and there is nothing to do. A workbench whose
containers all hold *terminal* records (`_c_`, `_b_`, `_s_`, `_d_`) prints nothing and is correct as
it stands: those are history, and no pass opens them.

If it prints a path, run:

```
/fusion:migrate
```

then `/fusion:setup` once afterwards. The migration surveys first, shows you what it will move, and
asks before moving anything.

**What happens if you skip it.** A work item's record is now named after its container and carries
no marker. While a record is still called `_t_circle.md`, the resolver that answers *which work item
is in scope* matches nothing, so every issue, decision, plan, review and analysis a session files
goes to the shared store instead of into the item. Nothing errors and nothing warns. The records are
not lost — they are in the wrong place, and they accumulate there for the life of the project.

Since this release `/fusion:setup` detects the same shape and refuses to run, telling you to migrate
first. That refusal is your safety net; the check above is how you find out before you meet it.

### 2. Stop dispatching the agents that left

If you start agents directly — `fusion bugfixer`, `claude --agent fusion:coderev`, or a dispatch
from your own tooling — five names no longer resolve: `taskplanner`, `playmaker`, `bugfixer`,
`coderev` and `ontorev`. The roster went from 15 agents to 11. For a review, use `reviewer` and give
it a `**Review domain:**` line saying `code` or `data`. For a defect, dispatch `coder` or
`ontocoder` and describe the failure: both now diagnose before they edit.

A wrong agent name aborts Claude Code at startup, so this one tells you loudly rather than quietly.

### 3. Retype the end-of-session commands you had memorised

`/fusion:cleanup` is now commit and push under the commit lock, and nothing else. It takes
`--dry-run` and `--no-push`; **the `--only` and `--skip` selectors are gone**, and any other argument
is reported as an error rather than ignored.

What the pipeline used to perform inline is five separate commands, each doing its own work and
triggering no other:

| Command | What it does |
|---|---|
| `/fusion:reconcile` | one reconciler pass over the tracking files |
| `/fusion:archive` | moves aged artifacts into the archive store — it now asks on every run |
| `/fusion:log-activity` | regenerates this checkout's activity log |
| `/fusion:curate` | the gated `CLAUDE.md` and rule-file pass |
| `/fusion:post` | the note for whoever pulls this work next |

One step was removed rather than re-homed: nothing files a record on your behalf at the end of a
session any more. Work a session left unfinished belongs in the commit message, or in a record you
file yourself.

### 4. Clear the retired configuration

Two leaves in `fusion.json` at your project root are retired with the Turn loop and the dispatch
bound: `orchestrator.maxTurns` and `orchestrator.dispatchMinutes`. If either is declared, fusion
names it on every guarded tool call until you delete the key. Nothing else in the file is affected
while the advisory stands, and `citations.extraPaths` is unchanged.

**If your project root still carries a `fusion-guard.json`, delete it and copy nothing across.**

```bash
rm fusion-guard.json
```

That instruction is the reverse of the one in `docs/upgrading-to-v10.md`, and the reversal is the
point: that note told you to rescue a Turn budget out of the old file before deleting it. The Turn
budget has since been retired outright, so there is no longer anything in that file worth moving,
and the advisory fusion prints about it now says so too.

### 5. Delete the root files nothing reads, and rename one plan heading

Neither is load-bearing; both are tidiness.

Three entries at your workbench root are now unread leftovers, and you can delete them:
`agentstate.yaml`, `orchestrator-live.md` and `.active-circle`. Leaving them costs nothing except
the next reader's confusion.

And the heading a plan uses to say where its own work stops was renamed with the noun the unit of
work lost. It now reads, verbatim:

```
## Where this work stops
```

A live plan in your workbench still carrying the old spelling is not an error and breaks nothing.
What it loses is one question: at a work item's closure the orchestrator reads that section back to
you clause by clause and asks whether each still holds, and a plan with no section under that
heading is skipped in silence. Rename the heading in any plan you still intend to close.

## What needs no action

Each line says what this release did to something and stops there. A later release can change any of
it, so read this as a record of v11 rather than as a promise.

- **Your existing records.** No issue, decision, plan, review, analysis or history file was
  rewritten, renamed or moved by this release. The migration in check 1 moves files, and it is the
  only thing that does — it asks first, and it never touches a terminal record.
- **Your existing session histories.** The store is closed to new writes, not deleted. Everything
  already in it stays readable, and a citation pointing at one still resolves.
- **The hook layer.** It still observes every write-tool call and every `Bash` call, allows all of
  them, and blocks nothing. Nothing about that moved in this release.
- **Your `.claude/` permission settings and your commit lock.** Unchanged.
- **The citation grammar and the marker vocabularies.** Issues and plans still take `_o_`, `_p_`,
  `_c_`, `_d_`; decisions still take `_o_`, `_a_`, `_i_`, `_d_`, `_s_`. A work item is the one thing
  that carries no marker at all: its state is the `**Status:**` field.

## Where to read more

- `README-agents.md` — the 11 agents, what each is for, and which dispatch parameters each reads.
- `/fusion:help` — install, update and configure, answered from your live installation.
- `docs/upgrading-to-v10.md` — the previous release with an action in it, if you are coming from v9
  or earlier and skipped it. Read check 4 above before its Turn-budget step, which no longer applies.

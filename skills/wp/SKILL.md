---
description: File a new work package — one new package in the project backlog at Status open, in the user's own words
argument-hint: [<title> and a paragraph, or a reference like "this idea"]
allowed-tools: [Bash, Read, Write, AskUserQuestion]
---

# Work package

File something worth doing later as a **work package**: a direction for the project rather than a note to self, which is `/fusion:memo`'s. It waits in the backlog at `open` until somebody claims it. **An item is a new directory each time, never an append**, because every reader of the backlog takes one file to be one job.

## Step 0 — Resolve the store

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" wp
```

Read `WORKBENCH` and `OUT_PACKAGES`. Exit 1 means no workbench above `pwd`: tell the user to run `/fusion:setup` at the project root first. The other codes are `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes.

**No read key is emitted, deliberately:** a skill's key set is read from its own file, and this workflow files and never lists, re-reads or consolidates the backlog. Consolidating is a maintenance operation the orchestrator performs at the user's word, and a run here that set out to do it has no resolved path to read from.

## Invocation modes

1. **Literal** — `/fusion:wp <title>` with an optional paragraph after the first line; a leading `idea:`, `idee:` or `backlog:` is stripped. The first line, or a short line derived from it, is the title, the rest the paragraph.
2. **Conversational reference** — `/fusion:wp this idea`, `das gehört ins Backlog`. Take the referenced content from the recent context, the user's own words in the paragraph.
3. **Empty** — ask via `AskUserQuestion` for the title and the paragraph. Do not guess.

**One job per item, and two jobs are two files.** Not tidiness: everything downstream takes an item whole, so a spec written from a multi-job item covers one of them and leaves the rest unread. A capture holding two unrelated jobs is filed as two items, and the report says so.

## The item

**Created, not appended, and an item is a directory.** One new container at `$WORKBENCH/$OUT_PACKAGES/<YYMMDD-HHMM>-<topic>/`, holding one record under the container's own name: `<YYMMDD-HHMM>-<topic>/<YYMMDD-HHMM>-<topic>.md`. The stamp comes from `date +%y%m%d-%H%M` (`rules/fusion-workbench-conventions.md` `## Timestamps` — never guess it), and `<topic>` is a kebab-case slug of the title, lowercased, articles dropped, six words at most. **There is no marker on either name** — an item's state is its `**Status:**` head field, which is `open` at creation and always here. Create the container and the record and stop there: the per-kind subdirectories an item's own work fills are made on first write, not at filing.

If the container you derived already exists, neither overwrite nor append: pick a `<topic>` that tells the two apart, and say in your report that you did.

The body, and the minimum is almost nothing on purpose. `rules/fusion-workbench-conventions.md` `## Work packages` defines the kind, its statuses and this floor; `<person>` and whether its absence halts are its `### Who filed it`, never this checkout's key:

```markdown
# <one-line title>

---
**Status:** open
**Filed by:** user, <person>
---

## Directive

<one paragraph: what the work is, and why it might matter>
```

`**Domain:**` and `**Mode:** autonomous` are optional and belong there only when the user's own content supplies them. `**Claim:**`, `**Active spec/plan:**`, `**Depends-on:**` and `**Cross-references:**` are **absent** at filing, never present and empty: nothing is claimed at the moment of filing, no spec or plan exists yet, and a dependency or a cross-reference is the user's to add later. Do not invent any of them, and do not add an Options, Constraints or Recommendation section: those make a decision record, and the rule above records what filing at that cost produced.

## Process

1. Resolve per Step 0, then the invocation mode.
2. Derive the stamp and the `<topic>` slug; check only that the container is free.
3. `mkdir -p` the container and **create** the record inside it.
4. Report: a new item at `**Status:** open`, and its path.

## Guardrails

- Never edit, rename, claim, finish or drop an existing work package. This workflow creates items at `open` and does nothing else to the store. A status moves elsewhere: the orchestrator maintains the store at the user's word, and the user can edit one by hand. Which operations exist and under what confirmation is `agents/orchestrator.md` `## Work packages`.
- **Never file an item on an agent's behalf.** The backlog holds what the *user* files, and this workflow runs because the user typed `/fusion:wp` with work of their own. A finding an agent carried into the conversation does not become the user's by being routed through here: something broken is still an issue, something to settle is still a decision record, and neither is filed from this workflow.

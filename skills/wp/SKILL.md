---
description: File a new work package — one new package in the project backlog at Status open, in the user's own words
argument-hint: [<title> and a paragraph, or a reference like "this idea"]
allowed-tools: [Bash, Read, Write, AskUserQuestion]
disable-model-invocation: true
---

# Work package

File something worth doing later as a **work package**: a direction for the project rather than a note to self, which is `/fusion:memo`'s. It waits in the backlog at `open` until somebody claims it. **An item is a new directory each time, never an append**, because every reader of the backlog takes one file to be one job.

## Step 0 — Resolve the store

```bash
echo '{"op":"inspect"}' | "$FUSION_PLUGIN_ROOT/bin/fusion-record" | grep -o '"state":"[a-z-]*"' | head -n 1
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" wp
```

The first line is the workbench's format. `"state":"json-control"` goes on. `"state":"legacy"` stops here, before anything is written: tell the user the workbench is legacy (no `workbench.json`: its control data is Markdown), which this version reads only once it has been migrated: run `/fusion:migrate`. Any other line, or none, stops it too: quote it. Read `WORKBENCH` and `OUT_PACKAGES`. Exit 1 means no workbench above `pwd`: tell the user to run `/fusion:setup` at the project root first. The other codes are `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes.

**No read key is emitted, deliberately:** a skill's key set is read from its own file, and this workflow files and never lists, re-reads or consolidates the backlog. Consolidating is a maintenance operation the orchestrator performs at the user's word, and a run here that set out to do it has no resolved path to read from.

## Invocation modes

1. **Literal** — `/fusion:wp <title>` with an optional paragraph after the first line; a leading `idea:`, `idee:` or `backlog:` is stripped. The first line, or a short line derived from it, is the title, the rest the paragraph.
2. **Conversational reference** — `/fusion:wp this idea`, `das gehört ins Backlog`. Take the referenced content from the recent context, the user's own words in the paragraph.
3. **Empty** — ask via `AskUserQuestion` for the title and the paragraph. Do not guess.

**One job per item, and two jobs are two files.** Not tidiness: everything downstream takes an item whole, so a spec written from a multi-job item covers one of them and leaves the rest unread. A capture holding two unrelated jobs is filed as two items, and the report says so.

## The item

**Created, not appended, and an item is a directory.** One new container at `$WORKBENCH/$OUT_PACKAGES/<YYMMDD-HHMM>-<topic>/`, holding the record under the container's own name, `<YYMMDD-HHMM>-<topic>.md`, and the control file `package.json` the codec writes beside it. The stamp comes from `date +%y%m%d-%H%M` (`rules/fusion-workbench-conventions.md` `## Timestamps` — never guess it), and `<topic>` is a kebab-case slug of the title, lowercased, articles dropped, six words at most. **There is no marker on either name**: the state is the control file's, `open` at filing. The per-kind subdirectories an item's own work fills are made on first write, not at filing.

If the container you derived already exists, neither overwrite nor append: pick a `<topic>` that tells the two apart, and say in your report that you did.

The record, and the minimum is almost nothing on purpose. `rules/fusion-workbench-conventions.md` `## Work packages` defines the kind, its statuses and this floor:

```markdown
# <one-line title>

## Directive

<one paragraph: what the work is, and why it might matter>
```

No head block: filer, domain and mode are the control file's. Do not add an Options, Constraints or Recommendation section: those make a decision record, and the rule above records what filing at that cost produced.

## Process

1. Resolve per Step 0, then the invocation mode.
2. Derive the stamp and the `<topic>` slug; check only that the container is free.
3. `mkdir -p` the container, **create** the record inside it, then file it as below.
4. Report: a new item at `open`, and its path.

## On a JSON-controlled workbench

`$D` is the container, `$N` the record in it, both relative to `$WORKBENCH`. With the record written:

```bash
D="$OUT_PACKAGES/<YYMMDD-HHMM>-<topic>"; N="$D/<YYMMDD-HHMM>-<topic>.md"
"$FUSION_PLUGIN_ROOT/bin/fusion-write" create --kind package --narrative-file "$N" --origin user-request --domain <code|data> --actor user; echo "exit=$?"
```

The domain is the user's where their content names one, else `domain=` of `"$FUSION_PLUGIN_ROOT/bin/fusion-session-domain"`. **`exit=0`**: filed at `open`; report the record's path. **Any other exit: the record you wrote stays, and no package was filed.** Name its path and the `fusion-write:` line to the user and delete nothing. `exit=7` alone may have filed it, outcome unknown: give the `operation_id=` and `id=` lines and resend nothing yourself.

Only where the user's own words ask for `autonomous`, and after `exit=0`: keep their sentence verbatim in the directive, since the mode cites the record as their word, then:

```bash
H="$(shasum -a 256 "$WORKBENCH/$N" | cut -d' ' -f1)"
"$FUSION_PLUGIN_ROOT/bin/fusion-write" set-mode --record "$D/package.json" --value autonomous --source "{\"kind\":\"user-word\",\"ref\":{\"kind\":\"other\",\"path\":\"$N\",\"sha256\":\"sha256:$H\"}}" --actor user; echo "exit=$?"
```

Any other exit leaves the package filed in the ordinary mode: say so, with the `fusion-write:` line.

## Guardrails

- Never edit, rename, claim, finish or drop an existing work package. This workflow creates items at `open` and does nothing else to the store. A status moves elsewhere: the orchestrator maintains the store at the user's word, and the user can edit one by hand. Which operations exist and under what confirmation is `agents/orchestrator.md` `## Work packages`.
- **Never file an item on an agent's behalf.** The backlog holds what the *user* files, and this workflow runs because the user typed `/fusion:wp` with work of their own. A finding an agent carried into the conversation does not become the user's by being routed through here: something broken is still an issue, something to settle is still a decision record, and neither is filed from this workflow.

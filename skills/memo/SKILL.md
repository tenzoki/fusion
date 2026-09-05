---
description: Append a concise memo to the user's personal memo log (memos-<checkout>.md) or a task to the user's task list (tasks-<checkout>.md), both in the workbench's shared memo store, or file an idea as a new entry in the project backlog
argument-hint: [content, or "task: <todo>", or "idea: <idea>", or a directive like "the open tasks"]
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Memo

Capture something the user wants kept. Three kinds of capture, and the third is not shaped like the other two:

- **Memos** — informal captures: notes, options to remember, the shape of an open problem, a pointer to a file. Snapshots the user wants to keep. They are **not** issues, plans, or history entries.
- **Tasks** — things to do: a todo, an open action, something to pick up later. Kept as a checkbox list so they can be ticked off.
- **Ideas** — something worth considering that is not yet worth planning: a direction for the project rather than a note to self. An idea goes to the **project backlog**, where the playmaker ranks it, `/fusion:next` surfaces it, and it can become a Circle.

**The memo and task files are append logs; a backlog entry is not.** One memo file and one task file per checkout, and every capture adds a block to the end of the right one. An idea is **a new file each time** — one file per idea, in a different store, carrying a state marker on its name. That difference is stated rather than left to be inferred from the two siblings, because inferring it produces the wrong write: every reader of the backlog takes one file to be one idea.

## Step 0 — Resolve the stores

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" memo
```

Read `WORKBENCH`, `OUT_MEMO` and `OUT_BACKLOG` from the output. `$WORKBENCH/$OUT_MEMO` is the directory the memo and task files live in; `$WORKBENCH/$OUT_BACKLOG` is where a backlog entry goes. They are the only correct answers to "where does this go". Never guess either; if the resolver fails, stop and report.

On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Tell the user to run `/fusion:setup` at the project root first.

**Why `memo`, and why exactly these two keys:** `fusion-paths` takes the name of the consumer asking, and a skill is its own consumer (`rules/fusion-workbench-conventions.md` `## Path Resolution`). This skill's key set is read from this file, so both write keys are emitted because this file names them. Both are unconditionally shared — neither a memo nor an idea arises from executing a Directive, so neither can belong to a Circle (Origin Rule) — so both stores are right whichever agent, or none, is actually running. **No read key is emitted, deliberately:** this skill files, and it never lists, re-reads or consolidates the backlog. Consolidating is the playmaker's job, and a run here that set out to do it has no resolved path to read from.

## Where each kind goes

- Memo file: `$WORKBENCH/$OUT_MEMO/memos-$CO.md`
- Task file: `$WORKBENCH/$OUT_MEMO/tasks-$CO.md`
- Backlog entry: a new file per idea in `$WORKBENCH/$OUT_BACKLOG`, never an append
- Either file may be hand-edited later; backlog entries are project-wide, not per checkout.
- `$CO` is the `CHECKOUT=` line of `I="$FUSION_PLUGIN_ROOT/bin/fusion-identity"; [ -x "$I" ] && "$I" || true`, never `$USER`; the rest is `rules/fusion-workbench-conventions.md` `## Filename Patterns`.

If the memo store or one of its two files does not exist, create it. When creating a file for the first time, write only its header and nothing else:

```markdown
# Memos — <checkout>

```

```markdown
# Tasks — <checkout>

```

## Memo, task or idea — which target

Decide the kind first; it picks the target.

**Route to the task file (`tasks-$CO.md`) when:**
- The argument starts with an explicit keyword: `task:`, `todo:`, or `aufgabe:` (case-insensitive). Strip the keyword from the captured text.
- The conversational reference is about things to do: `the open tasks`, `this todo`, `diese aufgabe`, `what's left to do`.
- The content is clearly an action to perform later (imperative: "fix X", "ask Stefan about Y", "rename Z").

**Route to the backlog (a new entry) when:**
- The argument starts with an explicit keyword: `idea:`, `idee:`, or `backlog:` (case-insensitive). Strip the keyword from the captured text.
- The conversational reference names the backlog: `this idea for the backlog`, `das gehört ins Backlog`, `merk das als Idee vor`.

**Route to the memo file (`memos-$CO.md`) otherwise** — the default, and the backlog has to be asked for to win it. Notes, options, problem shapes, pointers. The asymmetry is on purpose: a memo is the user's own log and nothing reads it, while an entry is a proposal the playmaker ranks and `/fusion:next` puts in front of the user beside the Circles. A note misfiled as a memo costs nothing; a note misfiled as an idea gets recommended.

If genuinely ambiguous (the content reads as two of the three), ask via `AskUserQuestion`: memo, task, or idea? Do not guess on a true coin-flip; default to memo only when there is neither a task signal nor an idea signal.

## Invocation modes

The argument after `/fusion:memo` determines how you interpret the request:

1. **Literal capture** — e.g. `/fusion:memo this: <pasted text>`, `/fusion:memo task: <todo>`, or `/fusion:memo <topic>\n<content>`. Capture the content verbatim; do not rewrite. Apply the routing rule above to pick the target.
2. **Conversational reference** — e.g. `/fusion:memo the open tasks`, `/fusion:memo these options`, `/fusion:memo the current problem`. Identify the relevant recent context and save it verbatim. Do not summarize into your own words; do not interpret. Just label and save, routing per the rule above (e.g. "the open tasks" goes to the task file).
3. **Empty** — `/fusion:memo` alone. Ask via `AskUserQuestion`: is this a memo, a task or an idea, what is the topic, and what should be captured? Do not guess.

## Entry format

Timestamp: `date +"%Y-%m-%d %H:%M"`.

### Memo entry

Each memo is appended as a single `##` section. Keep memos **concise** — if more than ~15 lines are needed, the content probably belongs in a plan, issue, or analysis, not a memo. Cross-reference other workbench files by path rather than copying their contents.

Append this block to the end of the memo file (leave one blank line before it):

```markdown
## YYYY-MM-DD HH:MM — <topic>

<body — concise, verbatim for captures, factual for conversational refs>

Refs: <optional — path(s) to related files in the workbench or the project>
```

The `Refs:` line is optional. Drop it if there's nothing to point to. Do not invent references.

### Task entry

Each task is appended as a single checkbox line at the end of the task file (no blank line between tasks):

```markdown
- [ ] <task text, verbatim> — added YYYY-MM-DD HH:MM
```

If several tasks are captured at once (e.g. "the open tasks"), append one checkbox line per task. Keep each line to one task. Do not tick (`- [x]`) or remove existing tasks unless the user explicitly says so.

### Backlog entry

**Created, not appended.** One new file per idea at `$WORKBENCH/$OUT_BACKLOG/<YYMMDD-HHMM>_o_<topic>.md`: the stamp from `date +%y%m%d-%H%M` (`rules/fusion-workbench-conventions.md` `## Timestamps` — never guess it), and `<topic>` a kebab-case slug of the title, lowercased, articles dropped, six words at most. The marker is `_o_`, open, at creation and always — this skill writes no other marker and changes none.

If the path you derived already exists, neither overwrite nor append: pick a `<topic>` that tells the two ideas apart, and say in your report that you did.

The body, and the minimum is almost nothing on purpose. `rules/fusion-workbench-conventions.md` `## Backlog entries` defines the kind, its four markers and this floor:

```markdown
# <one-line idea title>

**Filed by:** <username>

<one paragraph: what the idea is, and why it might matter>
```

`**Domain:**` and `**Related:**` are optional, and belong there only when the user's own content supplies them — a domain they named, paths they cited. Do not invent either, and do not add an Options, Constraints or Recommendation section: those make a decision record, and the rule above records what filing at that cost produced.

**One idea per entry, and two ideas are two files.** Not tidiness: everything downstream takes an entry whole, so `/fusion:direct` on a multi-idea entry makes one Circle of all of it and retires the ideas nobody read, and the playmaker's recommendation for one is to split it before shaping anything. Splitting while filing costs one extra file; splitting later costs a pass over the store.

## Process

1. Resolve `WORKBENCH`, `OUT_MEMO` and `OUT_BACKLOG` per Step 0.
2. Resolve `$CO`; adopt a legacy `-$USER` name.
3. Ensure the target directory exists (`mkdir -p`): `$WORKBENCH/$OUT_MEMO` for a memo or a task, `$WORKBENCH/$OUT_BACKLOG` for an idea.
4. Resolve the invocation mode from the argument.
5. **Decide memo, task or idea** per "Memo, task or idea — which target"; this picks the target.
6. Memo or task: read the target file if it exists; if not, create it with its header (above). Idea: there is no file to read — derive the stamp and the `<topic>` slug and check only that the path is free.
7. For mode 1 (literal):
   - Memo: the argument up to the first newline or colon becomes the topic; the remainder becomes the body. If only one blob was given, generate a short topic from the first line (≤ 60 chars).
   - Task: strip any `task:`/`todo:`/`aufgabe:` keyword; the remainder is the task text.
   - Idea: strip any `idea:`/`idee:`/`backlog:` keyword; the first line (or a short line you derive from it) becomes the title, the remainder the paragraph. If the capture holds two unrelated ideas, file two entries and say so.
8. For mode 2 (conversational ref): identify the referenced content in the recent context, extract it verbatim. Memo: use a short topic like "Options for X discussed in session". Task: one checkbox line per discrete todo. Idea: one entry per idea, the user's own words in the paragraph.
9. For mode 3 (empty): ask the user for kind, topic, and content.
10. Write. Memo and task: append to the end of the target file, do not reorder existing entries, and do not edit prior ones unless the user explicitly says "update the last memo", "tick that task", or similar. Idea: **create** the new entry file. Never append to an existing entry and never edit one.
11. Report to the user: which target, the path, and the topic or task text. For a memo or task, the line count of the file after the append. For an idea, that it is a new entry at `_o_`, and that `/fusion:next` will show it once playmaker has ranked the backlog on its next run.

## Guardrails

- Never remove or reorder existing memos or tasks.
- Never tick or un-tick a task unless the user explicitly asks.
- Never rewrite the user's pasted content in your own words — verbatim only.
- Keep entries short. If the user wants a full write-up, direct them to a plan, an analysis, or a consultation instead — those are separate artifact kinds with their own stores.
- Do not file an issue or plan based on a memo or task — these are for keeping, not for acting.
- Never edit, rename, close or defer an existing backlog entry. This skill creates entries at `_o_` and does nothing else to the store. Markers move elsewhere: the playmaker maintains the store, the shaper closes an entry a Circle took whole, and the user can move one by hand. Which of the three writes which marker, and under what gate, is the table in `rules/fusion-workbench-conventions.md` `## Backlog entries`.
- **Never file an entry on an agent's behalf.** The backlog holds what the *user* files (`rules/fusion-workbench-conventions.md` `## Backlog entries`), and this skill is that surface — it runs because the user typed `/fusion:memo` with an idea of their own. A finding an agent carried into the conversation does not become the user's idea by being routed through here: something broken is still an issue, something to settle is still a decision record, and neither is filed from this skill at all.

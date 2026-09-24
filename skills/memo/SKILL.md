---
description: Append a concise note to the user's personal notes (notes-<person>.md) or a task to the user's task list (tasks-<person>.md), both in the workbench's shared memo store. A new work package is /fusion:wp
argument-hint: [content, or "task: <todo>", or a directive like "the open tasks"]
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Memo

Capture something the user wants kept for themselves. Two kinds:

- **Notes** — informal captures: options to remember, the shape of an open problem, a pointer to a file. They are **not** issues, plans, or history entries.
- **Tasks** — things to do: a todo, an open action, something to pick up later. Kept as a checkbox list so they can be ticked off.

**Both files are append logs, one pair per person**, and every capture adds a block to the end of the right one. **Work for the project is not a memo:** an argument starting `idea:`, `idee:` or `backlog:`, or asking for the backlog, gets the answer that `/fusion:wp` files it, and nothing is written.

## Step 0 — Resolve the store and the person

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" memo
```

Read `WORKBENCH` and `OUT_MEMO`: `$WORKBENCH/$OUT_MEMO` holds both files. Exit 1 means no workbench above `pwd`: tell the user to run `/fusion:setup` at the project root first. The other codes are `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes. A skill's key set is read from its own file, and nothing reads this store, so no read key exists.

Then the keys, in one call:

```bash
I="$FUSION_PLUGIN_ROOT/bin/fusion-identity"; ID=$([ -x "$I" ] && "$I" || true)
CO=$(printf '%s\n' "$ID" | sed -n 's/^CHECKOUT=//p')
P=$(printf '%s\n' "$ID" | sed -n 's/^PERSON=.*<\(.*\)>$/\1/p' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')
[ -n "$P" ] || { echo "memo: no e-mail on a PERSON= line; nothing written" >&2; exit 1; }
echo "P=$P CO=$CO"
```

`$P` is the git e-mail of the `PERSON=` line, slugged: `Kai Stalmann <ks@qantr.com>` gives `ks-qantr-com`. **No e-mail, no write.** Helper exit 1, 4 or 5, or a missing helper, leaves `$P` empty and the block exits 1: halt and name the reason the helper printed, because an unkeyed name is the one every person would share. `$CO` is this checkout's `CHECKOUT=` line and serves adoption alone; it may be empty.

## Where each kind goes

- Notes: `$WORKBENCH/$OUT_MEMO/notes-$P.md`, created with the header `# Notes — <person>` and a blank line
- Tasks: `$WORKBENCH/$OUT_MEMO/tasks-$P.md`, created with the header `# Tasks — <person>` and a blank line

**Adoption, before the first write of a run.** `memos-$CO.md` and `memos-$USER.md` go into the notes file, `tasks-$CO.md` and `tasks-$USER.md` into the tasks file: for each that exists, append its lines below its `# ` header to the end of the target, remove it, and report both paths. Those are this checkout's own files, `$CO` by its identifier and `-$USER` by the older login key (`rules/fusion-workbench-conventions.md` `## Filename Patterns`), which is folded in here rather than renamed first. Another checkout's file stays where it is; nothing else is merged or deleted.

## Note or task — which target

**Route to the task file when:**
- The argument starts with an explicit keyword: `task:`, `todo:`, or `aufgabe:` (case-insensitive). Strip the keyword from the captured text.
- The conversational reference is about things to do: `the open tasks`, `this todo`, `diese aufgabe`, `what's left to do`.
- The content is clearly an action to perform later (imperative: "fix X", "ask Stefan about Y", "rename Z").

**Route to the notes file otherwise** — the default. If the content genuinely reads as both, ask via `AskUserQuestion`: note or task?

## Invocation modes

1. **Literal capture** — e.g. `/fusion:memo this: <pasted text>`, `/fusion:memo task: <todo>`, or `/fusion:memo <topic>\n<content>`. Capture the content verbatim; do not rewrite.
2. **Conversational reference** — e.g. `/fusion:memo the open tasks`, `/fusion:memo these options`. Identify the relevant recent context and save it verbatim. Do not summarize into your own words; do not interpret. Just label and save.
3. **Empty** — `/fusion:memo` alone. Ask via `AskUserQuestion`: note or task, what topic, and what should be captured? Do not guess.

## Entry format

Timestamp: `date +"%Y-%m-%d %H:%M"`.

### Note entry

Each note is appended as a single `##` section. Keep notes **concise** — if more than ~15 lines are needed, the content probably belongs in a plan, issue, or analysis. Cross-reference other workbench files by path rather than copying their contents.

Append this block to the end of the notes file (leave one blank line before it):

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

If several tasks are captured at once (e.g. "the open tasks"), append one checkbox line per task. Do not tick (`- [x]`) or remove existing tasks unless the user explicitly says so.

## Process

1. Resolve `WORKBENCH`, `OUT_MEMO`, `$P` and `$CO` per Step 0; an empty `$P` halts.
2. Adopt this checkout's per-checkout files, and `mkdir -p "$WORKBENCH/$OUT_MEMO"`.
3. Resolve the invocation mode, then **note or task**; this picks the target.
4. Read the target file if it exists; if not, create it with its header.
5. Mode 1: for a note, the argument up to the first newline or colon becomes the topic and the remainder the body (one blob: a short topic from its first line, ≤ 60 chars); for a task, the text after any `task:`/`todo:`/`aufgabe:` keyword. Mode 2: the referenced content verbatim — a short topic like "Options for X discussed in session", or one checkbox line per discrete todo. Mode 3: ask for kind, topic and content.
6. Append to the end of the target. Do not reorder entries, and do not edit prior ones unless the user explicitly says "update the last note", "tick that task", or similar.
7. Report: which target, the path, the topic or task text, the file's line count after the append, and any adoption.

## Guardrails

- Never remove or reorder existing notes or tasks.
- Never tick or un-tick a task unless the user explicitly asks.
- Never rewrite the user's pasted content in your own words — verbatim only.
- Keep entries short. A full write-up belongs in a plan, an analysis, or a consultation.
- Do not file an issue or plan based on a note or task — these are for keeping, not for acting.

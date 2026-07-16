---
description: Append a concise memo to the user's personal memo log (memos-<username>.md), or a task to the user's task list (tasks-<username>.md), in the workbench's shared memo store
argument-hint: [content, or "task: <todo>", or a directive like "the open tasks"]
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Memo

Append a short, dated entry to the current user's personal log. Two kinds of entry, two files:

- **Memos** — informal captures: notes, options to remember, the shape of an open problem, a pointer to a file. Snapshots the user wants to keep. They are **not** issues, plans, or history entries.
- **Tasks** — things to do: a todo, an open action, something to pick up later. Kept as a checkbox list so they can be ticked off.

Both live in the shared memo store, in separate files (see below).

## Step 0 — Resolve the memo store

```bash
"$FUSION_PLUGIN_ROOT/bin/fusion-paths" orchestrator
```

Read `WORKBENCH` and `OUT_MEMO` from the output. `$WORKBENCH/$OUT_MEMO` is the directory both files live in — it is the only correct answer to "where does a memo go". Never guess it; if the resolver fails, stop and report.

On a non-zero exit, read the code — it says whose fault it is (full table in `rules/fusion-workbench-conventions.md` `## Path Resolution` → Exit codes):

- **Exit 1** — no workbench above `pwd`. Tell the user to run `/fusion:setup` at the project root first.
- **Exit 3** — the workbench state is inconsistent: `.active-circle` is orphaned or corrupt. Tell the user to fix or delete the pointer before continuing.
- **Exit 4** — an internal error in `fusion-paths`. The user's workbench is fine; do **not** send them to check `.active-circle`. Report it as a fusion bug.

**Why `orchestrator` and not `memo`:** `fusion-paths` takes an *agent* name, and skills run inside an agent's session, so a skill resolves under the agent that runs it (`rules/fusion-workbench-conventions.md` `## Path Resolution`). `orchestrator` is the agent whose key set carries `OUT_MEMO`. The value does not depend on the argument: `OUT_MEMO` is unconditionally `shared/memos` because a memo never arises from executing a Directive, so it can never belong to a Circle (Origin Rule). Passing `orchestrator` therefore yields the right store whichever agent — or none — is actually running.

## File location

- Directory: `$WORKBENCH/$OUT_MEMO`
- Memo file: `$WORKBENCH/$OUT_MEMO/memos-$USER.md`
- Task file: `$WORKBENCH/$OUT_MEMO/tasks-$USER.md`
- One file per OS user per kind; users may split or edit by hand later.
- Determine `$USER` from the environment: `echo "$USER"`

If the directory or a file does not exist, create it. When creating a file for the first time, write only its header and nothing else:

```markdown
# Memos — <username>

```

```markdown
# Tasks — <username>

```

## Memo vs task — which file

Decide the kind first; it picks the file.

**Route to the task file (`tasks-$USER.md`) when:**
- The argument starts with an explicit keyword: `task:`, `todo:`, or `aufgabe:` (case-insensitive). Strip the keyword from the captured text.
- The conversational reference is about things to do: `the open tasks`, `this todo`, `diese aufgabe`, `what's left to do`.
- The content is clearly an action to perform later (imperative: "fix X", "ask Stefan about Y", "rename Z").

**Route to the memo file (`memos-$USER.md`) otherwise** — this is the default. Notes, options, problem shapes, pointers.

If genuinely ambiguous (the content reads as both), ask via `AskUserQuestion`: memo or task? Do not guess on a true coin-flip; default to memo only when there is no task signal at all.

## Invocation modes

The argument after `/fusion:memo` determines how you interpret the request:

1. **Literal capture** — e.g. `/fusion:memo this: <pasted text>`, `/fusion:memo task: <todo>`, or `/fusion:memo <topic>\n<content>`. Capture the content verbatim; do not rewrite. Apply the routing rule above to pick the file.
2. **Conversational reference** — e.g. `/fusion:memo the open tasks`, `/fusion:memo these options`, `/fusion:memo the current problem`. Identify the relevant recent context and save it verbatim. Do not summarize into your own words; do not interpret. Just label and save, routing per the rule above (e.g. "the open tasks" goes to the task file).
3. **Empty** — `/fusion:memo` alone. Ask via `AskUserQuestion`: is this a memo or a task, what is the topic, and what should be captured? Do not guess.

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

## Process

1. Resolve `WORKBENCH` and `OUT_MEMO` per Step 0.
2. Determine `$USER`.
3. Ensure `$WORKBENCH/$OUT_MEMO` exists (`mkdir -p`).
4. Resolve the invocation mode from the argument.
5. **Decide memo vs task** per "Memo vs task — which file"; this picks the target file.
6. Read the target file if it exists. If not, create it with its header (above).
7. For mode 1 (literal):
   - Memo: the argument up to the first newline or colon becomes the topic; the remainder becomes the body. If only one blob was given, generate a short topic from the first line (≤ 60 chars).
   - Task: strip any `task:`/`todo:`/`aufgabe:` keyword; the remainder is the task text.
8. For mode 2 (conversational ref): identify the referenced content in the recent context, extract it verbatim. Memo: use a short topic like "Options for X discussed in session". Task: one checkbox line per discrete todo.
9. For mode 3 (empty): ask the user for kind, topic, and content.
10. Append the new entry to the end of the target file. Do not reorder existing entries. Do not edit prior entries unless the user explicitly says "update the last memo", "tick that task", or similar.
11. Report to the user: which file (memo or task), its path, the topic or task text, and the line count of the file after the append.

## Guardrails

- Never remove or reorder existing memos or tasks.
- Never tick or un-tick a task unless the user explicitly asks.
- Never rewrite the user's pasted content in your own words — verbatim only.
- Keep entries short. If the user wants a full write-up, direct them to a plan, an analysis, or a consultation instead — those are separate artifact kinds with their own stores.
- Do not file an issue or plan based on a memo or task — these are for keeping, not for acting.

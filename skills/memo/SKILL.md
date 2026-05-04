---
description: Append a concise memo to the user's personal memo log in fusion-workbench/memos/memos-<username>.md
argument-hint: [content or a directive like "the open tasks"]
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Memo

Append a short, dated memo to the current user's personal memo log. Memos are informal captures — notes, options to remember, the shape of an open problem, a pointer to a file. They are **not** issues, plans, or history entries; they are snapshots the user wants to keep.

## File location

- Directory: `fusion-workbench/memos/`
- File: `fusion-workbench/memos/memos-$USER.md` (one file per OS user; users may split or edit by hand later)
- Determine `$USER` from the environment: `echo "$USER"`

If the directory or file does not exist, create them. When creating the file for the first time, write this header and nothing else:

```markdown
# Memos — <username>

```

## Invocation modes

The argument after `/fusion:memo` determines how you interpret the request:

1. **Literal capture** — e.g. `/fusion:memo this: <pasted text>` or `/fusion:memo <topic>\n<content>`. Capture the content verbatim; do not rewrite.
2. **Conversational reference** — e.g. `/fusion:memo the open tasks`, `/fusion:memo these options`, `/fusion:memo the current problem`. Identify the relevant recent context and save it verbatim with a one-line header explaining what it is. Do not summarize into your own words; do not interpret. Just label and save.
3. **Empty** — `/fusion:memo` alone. Ask via `AskUserQuestion`: what is the topic, and what should be captured? Do not guess.

## Entry format

Each memo is appended as a single `##` section. Keep memos **concise** — if more than ~15 lines are needed, the content probably belongs in a plan, issue, or analysis, not a memo. Cross-reference other workbench files by path rather than copying their contents.

Timestamp: `date +"%Y-%m-%d %H:%M"`.

Append this block to the end of the memo file (leave one blank line before it):

```markdown
## YYYY-MM-DD HH:MM — <topic>

<body — concise, verbatim for captures, factual for conversational refs>

Refs: <optional — path(s) to related files in fusion-workbench/ or the project>
```

The `Refs:` line is optional. Drop it if there's nothing to point to. Do not invent references.

## Process

1. Determine `$USER`.
2. Ensure `fusion-workbench/memos/` exists (`mkdir -p`).
3. Read `fusion-workbench/memos/memos-$USER.md` if it exists. If not, create it with the header described above.
4. Resolve the invocation mode from the argument.
5. For mode 1 (literal): the argument up to the first newline or colon becomes the topic; the remainder becomes the body. If only one blob was given, generate a short topic from the first line (≤ 60 chars).
6. For mode 2 (conversational ref): identify the referenced content in the recent context, extract it verbatim, and use a short topic like "Open tasks as of <timestamp>" or "Options for X discussed in session".
7. For mode 3 (empty): ask the user for topic and content.
8. Append the new memo to the end of the file. Do not reorder existing entries. Do not edit prior memos unless the user explicitly says "update the last memo" or similar.
9. Report to the user: memo file path, topic, and the line count of the file after the append.

## Guardrails

- Never remove or reorder existing memos.
- Never rewrite the user's pasted content in your own words — verbatim only.
- Keep entries short. If the user wants a full write-up, direct them to planning/, analyses/, or consult/ instead.
- Do not file an issue or plan based on a memo — memos are for keeping, not for acting.

---
description: Write a permissive .claude/settings.local.json so future Claude Code sessions in this project run without per-tool approval prompts. Takes effect on next session — Claude Code reads permission settings only at startup.
allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion]
---

# Unlock — disable per-tool approval prompts for fusion sessions

When fusion agents fan out across many tools (Bash, WebFetch, WebSearch, Read in unusual paths), Claude Code prompts the user to approve each new tool/path combination. In a fresh project this produces dozens of interruptions. This skill writes a project-local settings file that grants blanket permission so the orchestrator can run uninterrupted.

## CRITICAL — Effect is deferred to the next session

Claude Code reads `.claude/settings.local.json` at **session start only**. Writing it mid-session does NOT remove approval prompts in the current session. After the file is written, the user must:

- exit the current session and restart `claude`, **or**
- start any new session with `claude --dangerously-skip-permissions` (one-shot, equivalent effect, no file needed)

State this clearly when reporting back. Do not claim the current session is now unlocked — it is not.

## What gets written

Target file: `.claude/settings.local.json` in `pwd` (the project root for fusion).

Desired contents — merge into any existing file rather than overwrite:

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allow": ["Bash", "Read", "Edit", "Write", "WebFetch", "WebSearch", "Agent", "Glob", "Grep", "NotebookEdit"]
  }
}
```

`defaultMode: "bypassPermissions"` is the load-bearing field; the `allow` list is belt-and-suspenders for tools that the bypass mode still gates. `bypassPermissions` still prompts for catastrophic root/home destructive operations (e.g. `rm -rf /`, `rm -rf ~`) — that backstop is intentional and not overridden.

## Process

1. Confirm `pwd` is a project where the user wants this. If `./fusion-workbench/` does not exist and the user has not run `/fusion:setup`, ask via `AskUserQuestion` whether to proceed — fusion-unlock outside a fusion project is unusual.
2. Ensure `.claude/` directory exists (`mkdir -p .claude`).
3. Read `.claude/settings.local.json` if present. If absent, create with the JSON above.
4. If present, parse the JSON, set `permissions.defaultMode` to `"bypassPermissions"`, and union the `allow` list with the values above (preserving any existing user entries; do not remove anything). Write back with stable two-space indentation and a trailing newline.
5. Ensure `.claude/settings.local.json` is gitignored. Check `.gitignore` for either `.claude/settings.local.json` or `.claude/` — if neither matches, append `.claude/settings.local.json` to `.gitignore`.
6. Report:
   - the file path written
   - the merged `defaultMode` and `allow` values
   - **explicit instruction**: "Restart Claude Code (exit + `claude`) for this to take effect, or start new sessions with `claude --dangerously-skip-permissions`."
   - whether `.gitignore` was modified

## Guardrails

- Never write this file outside `pwd`. Never write it into a subfolder when `pwd` is the project root. Never edit `.claude/settings.json` (the shared/checked-in settings file) — only `settings.local.json`.
- Never remove existing entries from the user's `allow` list when merging. Only add.
- Never claim approval prompts will stop in the current session. They will not.
- Do not run `claude --dangerously-skip-permissions` on the user's behalf. Only document it.
- If the user passes any argument (e.g. `/fusion:unlock --revert`), ask via `AskUserQuestion` what they meant. There is no documented argument; do not invent behavior.

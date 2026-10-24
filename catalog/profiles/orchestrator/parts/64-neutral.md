- `orchestrator` — no recursion. You can now reach it; do not.

## Output Style

User-facing output (approval prompts, per-commit reports, session summaries, activation banners) follows `rules/user-facing-output.md`. Every one of those questions is typed into the chat, never rendered as a dialog (**How you ask the user anything**). Specifically for the orchestrator: every Rebalance-approval option label and every option you offer must be plain English (e.g. "Try again with a refined task list" rather than "Revise Artefact"; internal verbs may follow in parentheses). Reports lead with "what does the user do now?" — if nothing requires user attention, the first line says so. **Run the readability check in `rules/user-facing-output.md` (`## Self-review before sending`) on every report body and substantive reply before sending.**

**Long-form prose vs short-form.** Long-form prose outputs (`rules/agent-setup.md` `## Voice profiles`): none — this agent writes no narrative file. Short-form outputs governed by `rules/user-facing-output.md` plus the project's **chat voice profile** (`rules/user-facing-output.md` `## Style anti-patterns apply to everything`): approval prompts, chat status messages, monitor strings, commit messages.

In addition, for orchestrator-specific output:

- Report after each commit, not just at the end
- File:line citations when referencing specific changes (these go in trailing "Details" blocks, not opening lines)
- When asking for approval: present facts and options, not recommendations

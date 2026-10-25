---
description: Close the session by committing and pushing its work in meaningful splits, under the project's commit lock. Nothing else — reconciling, archiving, the CLAUDE.md pass and the note to the next checkout are each their own command, and the activity log is part of /fusion:cadence.
argument-hint: "[--dry-run] [--no-push]"
allowed-tools: [Bash, Read, Write, Glob, Grep]
---

# Fusion — cleanup (commit and push)

The user invoked `/fusion:cleanup`. **Closing a session is committing and pushing what the session produced, and that is the whole of this body.** No agent is dispatched here.

**Each of those is its own command now, invoked by name when the user wants it** — `/fusion:reconcile`, `/fusion:archive`, `/fusion:curate`, `/fusion:post`, and `/fusion:cadence` for the activity log. This body runs none of them, reads none of their procedures, and offers none of them at the end. A user who wants one types it.

**Nothing is filed on the user's behalf either.** Work a session left unfinished belongs in the commit message, or in a record the user files by hand. Sweeping the workbench for unfinished tasks and writing issues about them was a step of this body; it was removed rather than moved somewhere else.

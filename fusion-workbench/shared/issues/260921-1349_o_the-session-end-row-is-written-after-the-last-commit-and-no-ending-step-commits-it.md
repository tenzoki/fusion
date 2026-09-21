The `session_end` row is written after the last commit, and no ending step commits it, so every session ended in-session leaves the log dirty by one line
---
`agents/orchestrator.md` `## Ending the session`: the order is summary, staging check, emit `session_end`, clear the session marker. No commit follows the emit, so the row the step itself writes is the one uncommitted line every such session leaves behind. Measured on 260921: after the release commit `26eacba1` and its settling commit `82b6fcda` the tree was clean; the ending step then appended `session_end` at 11:33:09 and `git diff --stat` read `orchestrator-events.jsonl | 1 +`. The user asked why the log was still dirty after the settling mechanism had landed.

The settling mechanism (`260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md`, option 2) is what makes the fix one step: a commit whose only path is the log writes no row, so committing the `session_end` row under the lock terminates with a clean tree. `/fusion:cleanup` covers the case when it is run; a session the user ends in chat without it is not covered.

Acceptance: `## Ending the session` gains, after "Emit `session_end`" and before the marker is cleared, one item: commit `fusion-workbench/orchestrator-events.jsonl` alone under `fusion-commit-lock with orchestrator` (the message file written with `Write` as Step 4 says), and states that this commit writes no row; `git status --short` is empty at the end of a session ended in chat. `cd hooks && npm test` green with the goldens re-approved for the prompt's size.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md, 260830-1843_*_how-does-the-commit-lock-stop-leaving-the-tree-it-just-committed-dirty.md

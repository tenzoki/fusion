# Orchestrator Session — 260804-1243

**Directive:** Close the two git routes that fail open into the protected list. `260804-1024`: `git -C DIR` supplies a directory the model steps over and never records, so a relative operand resolves against the project root and off the list. `260804-1026`: `checkout` is in no mutation table, so `git checkout <treeish> -- rules/x.md` overwrites a protected file. Both are pre-existing and older than this Circle, both live in the same function, and the Turn 9 review put them in one pass.
**Mode:** issues
**Status:** In progress
**Predecessor session:** `circles/260801-1244-guard-rules-write/history/260804-1138-orchestrator-session.md`

## Setup snapshot

| Item | Value |
|---|---|
| Git HEAD at start | `d2962f3` |
| Domain | `code` |
| Active Circle | `circles/260801-1244-guard-rules-write` |
| Anticipated Circle | `circles/260804-1205-shell-reachability-model`, filed last session |
| Guard | not halted |
| Tests at start | 1252 across 24 files |

## The hazard this task has to navigate

`rules/protected-path-discipline.md` promises, in a list every agent reads, that
`git checkout HEAD -- rules/x.md` is fusion's own revert strategy and is **always allowed**.
The orchestrator itself uses that form. Making `git checkout <treeish> -- rules/x.md` deny
collides with that promise on exactly the paths the promise is about.

Second, `git checkout` is inspected by **two** independent policies: the mutation classifier
being changed here and the git branch classifier, which reads segments through the same lexer
and is pinned by a gold fixture. The branch policy must not move at all.

Recorded at Setup so it is not rediscovered mid-task, and so that if the answer is a decision
record rather than a patch, that outcome is available from the start.

## Per-Turn Log

(Turn in progress.)

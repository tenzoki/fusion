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

## Per-Turn Log — Turn 1, `d2962f3..1187bfd`

Two commits. `613d6fd` closed both git fail-open routes; `1187bfd` carries the review.

The design call is the substance. The issue offered give-up or model; the coder built and
measured both against HEAD over 811,210 commands and rejected both — modelling newly allows
21,420 evaluations including the suite's own pinned row, giving up denies 173,610 commands of
ordinary work. What shipped is a third answer: an operand is checked against every directory
the guard can attribute to the invocation, so a directory fact may only ever add reach and
never remove it. That makes the no-new-allow invariant structural rather than measured, and
the review confirmed it: nothing in the module assumes a single resolution per operand.

`git checkout` was closed without touching the promise that `git checkout HEAD -- <files>` is
fusion's revert strategy and always allowed. The review judges the distinction real and the
stated rationale false, and filed the correction.

Three further defects surfaced in the same eight lines: `git --namespace` (closed),
`GIT_WORK_TREE` in the environment (filed High, correctly deferred), and a residual entry
about `git clean -fdx` that turned out to be wrong rather than incomplete.

**The review also covered `048f3db` and `cc012fc`**, the two code commits of the previous
session that had never had one. Both sound as designs. Three claims narrowed: the `DirStack`
sum type makes the invalid state unrepresentable but does not make the depth invariant
compiler-checked; the cost rule is a rule rather than an enumeration but is not predictive,
because two of its four questions are false in cases documented in other sections; and
"names it directly" is the same shape as the `runsBuiltins` mistake with its failure
direction inverted, which is why it holds.

Eight issues filed, two of them High and both fail-open. The review's cross-cutting sentence:
every High is the same fact twice, a directory the classifier can compute and does not
compare. The commit's cost statements all held under test; its closure statements all
over-reached.

## Reconciliation

Not run. The Turn-10 review produced a nine-item ledger with severities, ordering and
dependencies an hour before session close, and a reconciliation pass would have re-derived it.
Stated here rather than left as a silent omission: the counts in this report are the review's
and the orchestrator's, not a ground-truth pass over the filesystem, and the next session
should treat them accordingly.

## Status

**Complete.** Items 1 and 2 of the corrected order are done. The ledger's first item —
plan Steps 6 to 8, the whole of C5b, unstarted — is unchanged and is now the thing worth
deciding before more Turns go into the shell classifier.

# How is a marker rename performed and staged, and by whom: `git mv` or `mv`, a dirty index or a clean one, one act or two?

---
**Domain:** code
**Filed by:** analyst
**Cross-references:** `shared/issues/260810-0819_*_head-carries-six-records-twice-and-the-class-fix-was-deferred-to-a-decision-never-filed.md`; `shared/issues/260810-2024_*_a-marker-rename-is-claimed-by-two-prompts-and-one-executor-moved-seven-other-executors-records.md`; `shared/issues/260816-0105_*_a-sub-agents-staged-rename-is-absorbed-by-the-orchestrators-next-commit-and-the-staging-list-cannot-prevent-it.md`; `circles/260816-1741-guard-becomes-observation-only/issues/260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md`; `archive/260817-1907-safe-cleanup-scoped/shared/issues/260807-1941_*_marker-renames-landed-add-only-so-head-carries-each-of-three-records-twice.md` (the closed instance that first deferred the class to a decision); `shared/issues/260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md` (the mirror measurement); `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning`; `rules/commit-lock.md`; `agents/orchestrator.md` Step 3b; `agents/coder.md` (the executor's closing rename); plan `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 1 (D-rename-staging) and step 12 (the instance fix for the two absorption records)

---

## Question

A marker rename is one act on disk and several in git, and four records over ten days show the class failing at every seam of it. The `## State Markers` rule says only "State change = `mv` (rename)". Renames performed with plain `mv` and staged add-only left HEAD carrying six records under two names each (first record; three records before it, whose closure deferred the class to a decision nobody filed). Renames performed with `git mv` by a sub-agent left the index dirty, and the orchestrator's next `git commit` carried them under a message about something else, twice, in `a19c867` and `dbbad70`, along with unstaged content edits picked up by `git add` of a path (third and fourth records). And two prompts claim the closing rename, the orchestrator's and the executor's, so in one parallel batch a glob-driven rename moved seven records belonging to four other running executors (second record). The mitigations exist as folklore passed between prompts: three of five executors in one session unstaged after `git mv` unprompted, and the reconciler now uses plain `mv` "precisely because of" the fourth record. This Circle fixes the absorption instance in the orchestrator's Step 3b (plan step 12); the class, which the three questions below make up, is decided here or not at all.

## Options

On the tool and the staging of the rename (first, third and fourth records):

1. **Marker renames are `mv`, and only the orchestrator stages** — sub-agents never leave the index dirty; the orchestrator's staging list names both halves of every rename.
   - Pros: the index is the orchestrator's alone, which is what the staging-list shape assumes; three executors already behave this way.
   - Cons: an obligation on a party that has already returned when the damage lands; several agents stage as part of their normal work and each prompt would have to say so.
2. **Marker renames are `git mv`** as a convention, so the two halves cannot be staged apart.
   - Pros: closes the add-only class the first record measured.
   - Cons: creates the dirty-index class the third and fourth records measured, unless the orchestrator's commit is bounded.
3. **The orchestrator commits with a pathspec or checks the index first** — `git commit -F <msg> -- <paths>`, or `git diff --cached --name-only` against its staging list before committing, stopping or unstaging on a surplus.
   - Pros: puts the guarantee where the staging list already lives; needs no executor-prompt change; the third record says it is sufficient alone. This Circle's step 12 lands the surplus check as the instance fix.
   - Cons: bounds the orchestrator's commit and does nothing about which tool a sub-agent uses, so a staged rename still waits in the index for someone.
4. **The orchestrator commits inherited staged work first, under its own message**, then stages its own.
   - Pros: preserves attribution without forbidding anything.
   - Cons: the orchestrator writes a message for work it did not do.
5. **Both a rule and an enforcement**: option 1 states the intent, option 3 enforces it.

On who performs the closing rename (second record):

6. **One owner**: strike the rename from one of the two prompts. The orchestrator is the better candidate on paper, since it dispatches, knows which records belong to which task, and stages.
   - Pros: no party need assume it is not the only one renaming.
   - Cons: the executor knows when the work is done and the orchestrator only when the report arrives, so the `Resolved:` note and the rename separate.
7. **Keep both, forbid the pattern**: a marker rename names its files explicitly, never through a glob, stated in both prompts.
   - Pros: the same rule staging already has, applied to the surface it was not applied to.
   - Cons: the overlap stays; only the blast radius of a mistake shrinks.

On the atomicity of the closure (second record):

8. **Append-and-rename is one act per record**, so a partial batch cannot leave a record renamed but unannotated.
   - Pros: composes with 7; the plan for this Circle already requires the note and the rename in one commit.
   - Cons: a rule about sequence, not a mechanism; nothing checks it.

Options 7 and 8 compose; option 6 excludes them. Options 1 through 5 are answered independently of 6 through 8.

## Constraints

- HEAD carries each record exactly once under its current marker; `git ls-tree -r HEAD` and `ls` agree on the open set (first record, acceptance).
- A commit's contents match its message: nothing enters a commit that its staging list did not name (third and fourth records).
- The `Resolved:` note and the rename do not separate; whichever party renames, the record is annotated when it moves.
- No party uses a glob for a rename; the rule stated for `git add` in Step 3b applies to `mv` (second record).
- The commit lock serialises parallel committers and cannot reach a dirty index inherited from a sub-agent that returned earlier (`rules/commit-lock.md`, third record).
- `rules/fusion-workbench-conventions.md` `## State Markers` is the authoring home for the convention, and the always-on set has 431 bytes of head-room measured for this Circle; `agents/*.md` has 10 745.
- The first record's acceptance asks that the 260807 deferral be answered explicitly rather than left for a fourth recurrence; this record is that answer's home.

## Recommendation

None as a whole. The third record argues that its option 1 (option 3 here) is sufficient alone and needs no executor change; the fourth record deliberately leaves its three open; the second says options 2 and 3 there (7 and 8 here) compose and that one change may settle it and the first record together. No referring record chooses among the tool question's options, and the class is filed here so the choice is made once.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

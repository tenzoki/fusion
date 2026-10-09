/fusion:cleanup's split rule names no rule that keeps a record pair in one commit
---
`skills/cleanup/SKILL.md` `## Step 2 — Commit in meaningful splits` splits "by concern" and is unchanged since v12.2.3. On a JSON-controlled workbench a narrative and its control file (`<stem>.record.json`, `package.json`, `<stem>.evidence.json`) must be committed together (`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout`, "Both halves move, archive and commit together, in one commit"). The orchestrator prompt states it (`agents/orchestrator.md`, "A pair is two paths, and so is a move"), and the cleanup body does not. A split by concern can put a `transition`'s control-file rewrite in one commit and the `Resolved:` or `Answered:` line on its narrative in another. The only trace is the after-the-fact `staging_drift` row the tracker hook emits (`PAIR-SPLIT`), which blocks nothing.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

**Evidence:** `git diff v12.2.3..HEAD -- skills/cleanup/SKILL.md` is empty; `grep -n "pair\|record.json\|control" skills/cleanup/SKILL.md` names only the message-and-commit "pair" and the conflict-marker guardrail. Inference, not observed: no cleanup run on a JSON workbench was recorded splitting a pair.

**Acceptance:** `skills/cleanup/SKILL.md` Step 2 states that a narrative and its control file are staged in the same split, citing the conventions' layout section rather than restating it, and the surface-growth bound stays green.

Cross-references: 261009-0647-v13-functional-completeness-against-v12.md

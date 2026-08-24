Two design forks from the dialog ban were put to the user in chat and recorded only in a history log
---
`shared/history/260824-0443-coder-orchestrator-asks-in-chat.md:38-53` names two open questions the dialog ban left — whether the orchestrator's `tools:` grant of `AskUserQuestion` should go, and whether the five skill bodies that present dialogs should follow — and closes with "Both were put back to the user in chat." No decision record exists for either. `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing — MANDATORY` requires one and names a history log as a place they must not live.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`. Filed to `shared/` under the Origin Rule: `0db1fbb` predates this Circle's activation and its subject is not this Circle's Directive.

The filing rule is explicit on both halves. "Every open question, choice point, or design fork MUST be written as a separate decision record. No exceptions." And: "**NEVER put issues or decisions inside plan documents, review documents, analyses, code comments, chat output, history logs, or any other location.** Embedded items get lost."

Both forks are real and both are argued in the history file rather than assumed away — the allowlist one turns on whether a sub-agent or a skill body inherits a grant from the orchestrator's frontmatter, on evidence `CLAUDE.md`'s v3.0.1 troubleshooting row gives for one direction only; the skills one turns on whether a ban the user asked for on one surface reaches a second surface with its own growth bound. Neither is a judgement call somebody can reconstruct from the prompt.

**Measured: they were already lost once, inside the same range.** Two commits after the ban, this Circle added two *new* mandated `AskUserQuestion` uses to the surface the second fork is about — `skills/next/SKILL.md:207` and `skills/setup/SKILL.md:351`, both in the claim-override path, both landed on 260824 in `12b56d1` and `9efe19f`. Nothing was there for their author to read. That is the failure mode the rule's own sentence predicts, arriving within eight hours of the record being not-written.

The count is nine skill bodies, not the five the history file names. Measured: `grep -l AskUserQuestion skills/*/SKILL.md` returns `archive`, `cleanup`, `commit`, `curate`, `direct`, `memo`, `migrate`, `next`, `setup`. Whoever writes the record should recount rather than copy the five.

Fix direction: file two decision records in `shared/decisions/`, one per fork, each stating the options and what each forecloses, and cite them from `agents/orchestrator.md` `## How you ask the user anything` so the next author of a skill body meets the open question before adding an eleventh dialog. The chat exchange itself is not recoverable and should not be reconstructed from memory; state the fork as it stands today and let the user answer it again.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1637-reconciliation.md`) — **STAYS `_o_`.** No decision record for either fork exists anywhere in `$SCAN_DECISIONS`: the shared store holds three `_o_` and nineteen `_a_` records, none of them about the dialog ban's scope, and the Circle's decision store holds one record on a different subject. The consequence the record predicts is live in this session's own verdict: the ban at `agents/orchestrator.md:29` reads "Every question **you** put to the user", which binds the orchestrator alone, while `skills/next/SKILL.md:207` and `skills/setup/SKILL.md:351` both mandate an `AskUserQuestion` for the claim override. This pass records that asymmetry as the named exception on property 3 of the C3 plan's `## Where this Circle stops`, and has no record to cite for which reading is correct.

---
Resolved: referred (decision) — both forks are decision records now, and S12 cites them from `agents/orchestrator.md` `## How you ask the user anything`; circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md; circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_do-the-nine-skill-bodies-that-present-dialogs-follow-the-dialog-ban.md

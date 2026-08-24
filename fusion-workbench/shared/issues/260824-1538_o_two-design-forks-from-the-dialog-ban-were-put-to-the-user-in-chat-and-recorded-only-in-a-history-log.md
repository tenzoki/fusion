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

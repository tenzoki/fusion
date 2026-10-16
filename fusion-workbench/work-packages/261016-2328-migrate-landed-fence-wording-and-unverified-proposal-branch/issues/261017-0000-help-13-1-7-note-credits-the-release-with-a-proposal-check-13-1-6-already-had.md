/fusion:help: the 13.1.7 update note credits the release with the proposal check that 13.1.6 already shipped
---
The help topic's update paragraph says of 13.1.7 that the message "names no deletion while it cannot verify the file list". That reads as a behaviour 13.1.7 added. 13.1.7 changed no condition: the unverified-proposal branch of `landedWay` in `hooks/migrate.ts` was already in 13.1.6. 13.1.7 only pinned it with a test and documented it.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-0000-reviewer-closing-pass-over-the-migrate-landed-fence-wording-package.md`, `261016-2331-plan-migrate-landed-fence-wording-and-unverified-proposal-branch.md`, `261016-2123-migrate-proposal-unverified-branch-of-the-hand-deletion-is-untested-and-undocumented.md`

**Evidence.**
- `skills/help/SKILL.md` `### 4. Update`, the paragraph "Coming from 13.1.6 or earlier", at `ddab3bf1`: "13.1.7: the message for an undo that landed part of its work states only what it checked, and names no deletion while it cannot verify the file list."
- `git diff 74992939..ddab3bf1 -- hooks/migrate.ts`: in `landedWay`, only `head` changed. The `catch` branch "the proposal … is missing or at other bytes, so its control paths cannot be counted and no hand deletion is named" stands unchanged from 13.1.6.
- The plan's step 5 asked for "says when it cannot verify", not for a new refusal.

A user on 13.1.6 who reads the note may think 13.1.6 could name the deletion with an unverifiable proposal. It could not.

**Acceptance.** The 13.1.7 sentence in that paragraph credits 13.1.7 with the wording change alone. It does not present the unverified-proposal refusal as new in 13.1.7, or it presents it as documented and tested only. The growth bounds stay green, and `reference-resolution-lint` passes at its `BASELINE` with no edit to it.

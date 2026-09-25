Renaming the unconditionally-shared-kinds heading dangles the archive skill's anchor citation
---
Plan step 2 renamed `rules/workbench-path-resolution.md`'s section heading from three unconditionally-shared kinds to four. `skills/archive/SKILL.md` cites that heading by its old text, and `reference-resolution-lint.test.ts` resolves an anchor by prefix match, so the citation no longer resolves and the gate fails. Step 11 edits the very sentence that carries the citation but its plan text does not mention the anchor, so nothing in the plan makes the step-11 executor repair it.
---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>

Evidence: `skills/archive/SKILL.md`, line 73 at the time of filing, the sentence beginning "**`$SCAN_BACKLOG` and `$SCAN_CONSULT` need no derivation**". It ends with the token `` `rules/workbench-path-resolution.md` `### The three unconditionally-shared kinds` ``. The gate's own message: "no heading in rules/workbench-path-resolution.md equals or starts with 'The three unconditionally-shared kinds'".

Fix: one word in that citation, three to four. It belongs to step 11 of `260907-1942_*_message-between-checkouts-read-before-pull.md`, which edits that sentence anyway; a separate dispatch may take it instead, since the rule-file half of step 2 was told to touch nothing else.

Acceptance test: `cd hooks && npx vitest run lib/__tests__/reference-resolution-lint.test.ts` reports no dangling reference. The pinned `paths` count in that file is a second, unrelated failure at the same time, owed by the new `bin/fusion-forum` header, and is not this record's to close.

---
Resolved: the citation in `skills/archive/SKILL.md` now reads `### The four unconditionally-shared kinds`, which the gate resolves by prefix against the heading as it stands, `### The four unconditionally-shared kinds, and the one that meets the target argument`. Repaired as part of plan step 11, in the same sentence that step widens; the sentence also gained `$SCAN_FORUM`. The pinned `paths` count named above is still red and is left to its own owner.

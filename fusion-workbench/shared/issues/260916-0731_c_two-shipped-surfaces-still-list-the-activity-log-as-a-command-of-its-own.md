Two shipped surfaces still list the activity log as a command of its own

---
The v11.4 merge took the activity log out of the command surface and into `/fusion:cadence`. Eleven `/fusion:log-activity` tokens were removed and the phantom-skill gate is green, because it reads `/fusion:` tokens. Two surfaces state the same fact without one, so nothing looked at them, and both still enumerate the activity log among the commands `/fusion:cleanup` became.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2309_*_merge-log-activity-into-cadence.md, 260915-2309_*_does-the-activity-log-keep-its-own-command-or-become-the-first-half-of-cadence.md

**Evidence.**

- `skills/cleanup/SKILL.md:2`, the frontmatter `description:` — *"Nothing else — reconciling, archiving, the activity log, the CLAUDE.md pass and the message to the next checkout are each their own command."* The activity log is not its own command at HEAD. This string is what a user reads in the skill listing before the body is ever loaded.
- `docs/fusion-intro.md:63` — *"Aufräumen, Reconcile, Aktivitätslog, `CLAUDE.md` und die Nachricht an das nächste Checkout sind je ein eigenes Kommando."* Same claim, German, shipped doc.

Both were reachable by the plan's own step 6, which named `skills/cleanup/SKILL.md` and `docs/fusion-intro.md` in its file list. The body of the first (`:11`) and three lines of the second (`:126`, `:141`, `:222`) were corrected in the same commit; these two were not, and they are exactly the two occurrences carrying no `/fusion:` token. `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` scans for phantom skills by token, so neither can fail a gate.

The correct wording already exists twice in the tree and can be copied: `skills/cleanup/SKILL.md:11` and `skills/help/SKILL.md:73` both name four commands and then say the activity log went to `/fusion:cadence`.

Note the byte cost: `skills/cleanup/SKILL.md` is on the bounded `skills/` surface, which stands at 1 082 bytes of margin (`hooks/lib/__tests__/fixtures/surface-growth.golden`, block `[skills bytes]`, total 212 597 against budget 213 679). The edit is a re-wording, not an addition, and should be net non-positive.

**Acceptance.** Neither `skills/cleanup/SKILL.md:2` nor `docs/fusion-intro.md:63` enumerates the activity log as a separate command; each names `/fusion:cadence` as where it went, matching `skills/cleanup/SKILL.md:11`. `cd hooks && npm test` stays green and the `skills/` total does not rise.

---
Resolved: both surfaces re-worded to name `/fusion:cadence` as where the activity log went, matching `skills/cleanup/SKILL.md`'s own body. `skills/cleanup/SKILL.md`'s frontmatter `description:` now reads "reconciling, archiving, the CLAUDE.md pass and the note to the next checkout are each their own command, and the activity log is part of /fusion:cadence"; `docs/fusion-intro.md`'s daily-flow step 6 now ends "; das Aktivitätslog ist in `/fusion:cadence` aufgegangen". Net +28 bytes on the `skills/` surface, not the non-positive the record asked for: naming the destination costs more than dropping the item, and the acceptance's own model wording carries the same cost. The surface stayed inside its bound throughout — the four before/after margins are in the coder's report on this pass.

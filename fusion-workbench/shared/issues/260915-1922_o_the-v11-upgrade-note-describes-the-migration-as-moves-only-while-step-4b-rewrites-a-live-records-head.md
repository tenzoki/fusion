The v11 upgrade note describes the migration as moves only, while Step 4b rewrites a live record's head in place
---
`docs/upgrading-to-v11.md` check 1 sends a user to `/fusion:migrate` and describes it as "surveys first, shows you what it will move, and asks before moving anything". Step 4b of that skill additionally renames the live record and rewrites its head block where it stands, dropping `**Active spec/plan:**` and `**Active session history:**`. The note names neither the rewrite nor the drop, so the one-way part of the pass is invisible on the surface a user reads before running it.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260911-0715_*_the-migration-drops-two-head-fields-unannounced-and-leaves-the-directive-that-points-at-one-of-them.md`; `260915-1922-the-directive-pointer-at-v11-and-what-the-migration-does-to-it.md`

**Evidence.** `docs/upgrading-to-v11.md`, check 1 ("Convert a workbench that still holds a live Circle record") and the "What needs no action" section, whose first bullet reads "No issue, decision, plan, review, analysis or history file was rewritten, renamed or moved by this release." That enumeration excludes the Circle record, so the sentence is accurate and the pair still reads as moves-only. `skills/migrate/SKILL.md:109` states the opposite in the skill's own words: "Every other step of this migration relocates a file; converting a live record additionally **rewrites its head block** where it stands." The head block it writes (lines 140-148) carries neither dropped field.

**Why this is not the already-filed one.** `260911-0715_*` is about what the migration body does and what it should do instead; its acceptance test binds `skills/migrate/SKILL.md`. This record is about the shipped document that sends a user into the pass, and it stays owed even if the body is fixed to announce the drop at the survey: a user deciding whether to migrate now reads the note first and the survey second.

**Acceptance.** `docs/upgrading-to-v11.md` check 1 says that converting a live record renames it, rewrites its head block in place, and drops two head fields the item format does not carry, and says whether that step can be undone. A user reading check 1 alone can tell that the pass changes file contents and not only file locations.

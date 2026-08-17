# Does `/fusion:setup` offer to move a project's Turn budget out of the retired configuration file?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner
**Cross-references:**
`circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_o_the-compliance-guard-becomes-observation-only.md` steps 1, 7a and 8 (the steps this touches),
`circles/260816-1741-guard-becomes-observation-only/decisions/260816-1742_a_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md` (the move this migration follows),
`circles/260816-1741-guard-becomes-observation-only/_t_circle.md` `### What the user settled at shaping round 1` (the halt migration, whose shape this question repeats for the configuration file),
`skills/setup/SKILL.md:169-190` (Step 0f, which seeds the file) and `:300` (the guard check that becomes the halt migration),
`hooks/lib/config.ts:503-508` (the retirement announcement this would sit beside)

---

## Question

This Circle removes `fusion-guard.json` from the project root and moves the one setting that was not the guard's, `orchestrator.maxTurns`, into a renamed file. Every consuming project has the old file on disk, and some have set a budget in it.

The user settled the equivalent question for the halt at shaping round 1: `/fusion:setup` detects a legacy halt and offers to delete it, and the accepted price was stated rather than designed around. The configuration file was not put to them in the same terms, because at that moment its replacement was still open. It is answered now, so the migration question is answerable and is the same shape: a leftover artifact, a project that may or may not run Setup again, and a choice between announcing and acting.

The two halves differ in one way that matters. A leftover halt flag costs a project nothing, since nothing reads it. A leftover budget costs a project its own setting: it declared 12 Turns, the loader no longer reads that file, and the session runs on the default instead. The question is whether an announcement is enough for a loss of that kind.

## Options

1. **Announce only.** The loader probes for a leftover `fusion-guard.json` and emits one diagnostic per guarded tool call naming the file, naming `orchestrator.maxTurns` and saying to copy it into the new file and delete the old one. `/fusion:setup` seeds the new file and does nothing about the old one.
   - Pros: one mechanism, already built. It is exactly what `guard.protectedPaths` retirement does today, at one scope higher, and it reaches every session rather than only the ones that run Setup. Nothing writes to a project's configuration on a project's behalf.
   - Cons: the project has to act, and the advisory reaches it through the monitor's warnings panel and the event log rather than as a sentence in the terminal. A project that reads neither goes on running a budget it did not choose.

2. **Offer to migrate at Setup.** When the old file exists and the new one does not, `/fusion:setup` reads `orchestrator.maxTurns` out of the old file, offers to write the new file carrying that value and delete the old one, and does nothing without confirmation.
   - Pros: the loss is repaired at the one moment the user is already answering fusion's questions, and it repairs the exact thing that was lost rather than telling somebody how to. It reuses the shape the user already chose for the halt, which makes the two migrations one story in the upgrade note.
   - Cons: a second migration step in a Setup the project already carries an open issue about being slow (`shared/issues/260812-0253_o_setup-takes-far-too-long-and-nothing-measures-it.md`). It also makes Setup a writer of a project's configuration file, which nothing in fusion is today: Step 0f seeds a template and refuses to touch an existing file, on purpose.

3. **Both.** The loader announces on every guarded call and Setup offers the move.
   - Pros: reaches the project that never opens the monitor and the project that never runs Setup again. Neither channel is load-bearing alone.
   - Cons: two mechanisms for one migration, and the advisory goes on firing until the file is gone even for a project that has already been offered the move and declined it.

4. **Do neither, and put it in the upgrade note alone.** `docs/upgrading-to-v10.md` names the file and what to copy; no code says anything.
   - Pros: the cheapest, and a per-release upgrade note is the documented instrument for exactly this.
   - Cons: it depends entirely on somebody reading a document, which is the standard the retired-key advisory was built because prose did not meet. It is listed for completeness rather than as a live candidate.

## Constraints

- **Whatever is chosen, a project that never runs Setup again must still be told.** That is the bound the halt migration accepted for a flag that costs nothing, and a lost setting is not the same case. Option 2 alone does not satisfy it; option 1 does, through a channel that runs on every guarded call.
- **Nothing writes a project's configuration without a confirmation.** Setup's one asking step, the permission file at Step 0g, is the precedent: it asks once and does nothing when declined.
- **The retired-file announcement exists either way.** It is the constraint the Turn-budget decision carries, that something must still read a project's leftover `fusion-guard.json` in order to name it. This question is about what happens *beside* the announcement, not whether it exists.
- **The answer belongs in `docs/upgrading-to-v10.md` whichever way it goes**, because the note is where a project reads what the release left behind.

## Recommendation

Option 1, with the diagnostic's wording carrying the whole of the migration. The loss this question is about is a number in a git-tracked file, and the diagnostic names the file, the key and the destination on every guarded tool call until the line comes out. That is a louder channel than a Setup step, which fires once per session and only for a project that runs Setup at all.

Option 3 is the second choice and the one to take if the user judges the advisory channel too quiet, since it costs only the Setup step and keeps the reach. Option 4 is the one to rule out first: prose alone is the standard the retirement mechanism was built because it did not meet.

---
Answered: circles/260816-1741-guard-becomes-observation-only/history/260816-1841-orchestrator-session.md — user chose option 1 at the plan gate on 2026-08-16. `/fusion:setup` does not offer the move; the loader's retired-file diagnostic carries the migration alone, naming the file, `orchestrator.maxTurns` and the destination on every guarded tool call until the old file is deleted. `docs/upgrading-to-v10.md` states the same at length. Realised by plan steps 7a and 8.
Implemented: `fab8a4b` (plan step P-7a), `92db96a` (P-8) and `18c125b` (P-12) — option 1. `fab8a4b` wrote the retired-file advisory that carries the whole migration: `RETIRED_PROJECT_FILES` in `hooks/lib/config.ts` names `fusion-guard.json`, names `orchestrator.maxTurns`, gives the JSON to copy, and says plainly that a budget left behind is not read and the orchestrator falls back to the built-in default without saying so. `92db96a` renamed the file Setup Step 0f seeds and states in the step that it deliberately makes no offer to migrate a budget, with the reason. `18c125b` is cited as well because the recorded answer includes `docs/upgrading-to-v10.md`, which states the same at length and is pointed at from `README.md` `## Install` and from `/fusion:help`'s update topic; it landed at plan step 12 rather than at step 8. Plan: `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_*_the-compliance-guard-becomes-observation-only.md`.

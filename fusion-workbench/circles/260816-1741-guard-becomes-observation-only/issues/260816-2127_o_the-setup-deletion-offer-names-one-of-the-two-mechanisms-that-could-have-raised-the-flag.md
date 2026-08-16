The Setup deletion offer attributes the legacy halt flag to the protected-path check alone, where the guard's own header says either mechanism

---

Step 1's new text in `skills/setup/SKILL.md:308-310` tells the user:

> The protected-path check that raised the halt was removed on 2026-08-12, and no code at this
> version reads the flag

`hooks/guard.ts:44-47`, written one step later, says the opposite about which mechanism is meant:

> Both went on 2026-08-16, with `lib/escalation.ts` and `clear-halt.ts` behind them. A halt flag
> left in a consuming project's `escalation.json` **by either mechanism** blocks nothing at this
> version; `/fusion:setup` offers to delete the file.

Two mechanisms could set `haltActive`, not one. The protected-path deny (removed 2026-08-12) and
CHECK 3, the decision-governed deny, removed 2026-08-16 by this Circle. CHECK 3 counted its blocks
toward the same threshold and raised the same halt: at `3d41d4a` it called
`recordBlock(escalation, config.escalation.blocksBeforeHalt, "decision_governed", …)`
(`hooks/guard.ts:417-423` before deletion), so a project that armed it in its own
`fusion-guard.json` — `categoryPaths` plus `categorySensitivity: high` — could hold a halt flag
written under the `decision_governed` trigger rather than a protected-path one. The Circle record
says the same in the other direction: "CHECK 3 is the only remaining input to that counter."

`hooks/lib/__tests__/legacy-halt-clearing.test.ts` does not cover that case — its two triggers,
`protected_path` and `protected_path_measured`, are both the protected-path mechanism's — so the
Setup text and the one test that pins the migration agree with each other and both under-count the
sources by one.

So the sentence a user reads at Setup names a cause that may not be theirs, and dates the removal
four days earlier than the removal that actually applies to them.

The conclusion the paragraph draws is unaffected: nothing at this version reads the flag, whichever
mechanism wrote it, and deleting the file removes a flag rather than unblocking anything. Only the
attribution is wrong. That is why this is filed low rather than as a correctness defect in the
migration.

---

Context: found by `coderev` reviewing Turn 1 of this Circle, range `3d41d4a..3c2e1c6`, comparing the
historical accounts written across the Turn for mutual agreement. The step-1 text was written before
step 2 removed CHECK 3, so at the moment it was written the protected-path check was the only
removed halt source; it became incomplete when step 2 landed, and nothing revisited it.

Proposed shape of the fix: one clause in `skills/setup/SKILL.md`, replacing "The protected-path
check that raised the halt was removed on 2026-08-12" with a formulation that names both — the
protected-path check removed on 2026-08-12 and the decision-governed check removed on 2026-08-16 —
or that names neither and says only that no check fusion still ships can raise a halt. The second is
shorter and cannot go stale again. Step 9 re-points `legacy-halt-clearing.test.ts` onto this text and
is the natural place to notice it; the text itself belongs to step 1's file, so add
`skills/setup/SKILL.md` to step 11 or make the edit part of step 9's re-pointing.

What it costs if it stands: a user whose halt came from CHECK 3 is told it came from a mechanism they
never had, and a reader reconciling `skills/setup/SKILL.md` against `hooks/guard.ts` finds the two
shipped accounts of the same flag disagreeing about what wrote it.

Step 14 landed without its `[DONE]` marker, and the closed issue that fixed this for three earlier steps did not hold

---

Step 14, the after-measurement, landed as commit `9cde86c` ("chore(measure): the after-figures, and the four claims they do not support") and the plan still read `14. **Take the after-measurement**` with no inline state marker when step 15 opened it. Step 15 set the marker itself, citing that commit.

This is the second occurrence in this Circle. `issues/260815-0804_c_three-plan-steps-have-landed-and-the-plan-carries-no-inline-state-marker-for-any-of-them.md` recorded the same defect for steps 1, 2 and 3 and was closed by adding the markers. Adding the missing markers fixes the instances; it does not fix whatever lets an executor commit a step without touching the plan, so the class recurred eleven steps later.

---

`rules/fusion-workbench-conventions.md` `## Inline State Tracking` puts the obligation on the executor ("After completing each plan step — not just at session end"), and `agents/coder.md` `## Working from tasklist.md` step 5 repeats it. Nothing checks it: no lint reads a plan's inline markers against the commits that cite the plan in their `Source:` trailer, and the two gates this Circle relies on (`reference-resolution-lint`, `derivable-enumerations-lint`) do not scan the workbench at all.

The cheap check that would decide it mechanically: every commit whose message carries `Task: P-<n>` and a `Source:` naming a plan implies step `<n>` of that plan is `[DONE]`. Both halves are already in the commit trailer convention this Circle used throughout, so the input exists. Whether such a check is worth building — the same reasoning as `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` — is not decided here; this record names the recurrence, not the fix.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). The named instance is repaired; the class the record was filed for is untouched, and it now carries the class alone.**

`planning/260815-0029_c_…:351` reads `14. [DONE] **Take the after-measurement** *(closure criterion)*`, so the instance is gone. The record was explicit that it names the recurrence and not the instance, so that does not close it.

The mechanical check it describes exists nowhere: `grep -rln 'Task: P-' hooks --include='*.ts'` returns nothing, and the nearest gate, `hooks/lib/__tests__/marker-format-lint.test.ts`, asserts filename bracket-versus-underscore form and never reads a plan's inline markers. The input the check would need is already in the trailer convention this Circle used throughout: a commit carrying `Task: P-<n>` implies that task is `[DONE]` and names the hash.

**This record is now the sole live carrier of that class in this store.** Its sibling instance `260815-1913_*_the-work-queue-misstates-p-15…` was closed at this pass because its carrier file no longer exists, and that closure is conditional on this one staying open — the class question moved here rather than being retired with it. Whether the check is worth building one Circle after eight mechanisms were deleted for never catching anything is a decision, and this record still declines to take it.

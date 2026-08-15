Step 14 landed without its `[DONE]` marker, and the closed issue that fixed this for three earlier steps did not hold

---

Step 14, the after-measurement, landed as commit `9cde86c` ("chore(measure): the after-figures, and the four claims they do not support") and the plan still read `14. **Take the after-measurement**` with no inline state marker when step 15 opened it. Step 15 set the marker itself, citing that commit.

This is the second occurrence in this Circle. `issues/260815-0804_c_three-plan-steps-have-landed-and-the-plan-carries-no-inline-state-marker-for-any-of-them.md` recorded the same defect for steps 1, 2 and 3 and was closed by adding the markers. Adding the missing markers fixes the instances; it does not fix whatever lets an executor commit a step without touching the plan, so the class recurred eleven steps later.

---

`rules/fusion-workbench-conventions.md` `## Inline State Tracking` puts the obligation on the executor ("After completing each plan step — not just at session end"), and `agents/coder.md` `## Working from tasklist.md` step 5 repeats it. Nothing checks it: no lint reads a plan's inline markers against the commits that cite the plan in their `Source:` trailer, and the two gates this Circle relies on (`reference-resolution-lint`, `derivable-enumerations-lint`) do not scan the workbench at all.

The cheap check that would decide it mechanically: every commit whose message carries `Task: P-<n>` and a `Source:` naming a plan implies step `<n>` of that plan is `[DONE]`. Both halves are already in the commit trailer convention this Circle used throughout, so the input exists. Whether such a check is worth building — the same reasoning as `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md` — is not decided here; this record names the recurrence, not the fix.

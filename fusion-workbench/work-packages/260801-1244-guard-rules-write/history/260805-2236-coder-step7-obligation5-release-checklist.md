# Coder session — Step 7 obligation 5: the release-checklist line in CLAUDE.md

**Date:** 260805-2236
**Agent:** coder
**Status:** Complete
**Task:** Follow-up to the Step 7 remainder (session `260805-2233-coder-step7-remainder-documentation.md`). Obligation 5 — the release-checklist line in `CLAUDE.md` — was explicitly brought into scope and taken.

## What was done

1. **`CLAUDE.md:70`** — added the release-checklist sentence to `## Release process`, step 0 ("Validate first"), after the smoke-test sentence:

   > If the release touches the guard, also confirm before tagging that its behaviour was verified against a project root that is **not** this repository (the guard-harness integration tests spawn such roots; a scratch consuming project works too) — the write guard's self-detect stand-down here makes local testing unrepresentative by construction.

   This is the second half of spec criterion `260801-1122_*_spec-normative-consolidation.md:332` (the first half, stating the difference in the prompt/docs, was discharged by the earlier Step 7 passes).

2. **Plan `260804-1633_*_plan-c5b-remediation-and-ship.md`** — Step 7 heading marked `[DONE]`; the dated remainder block of 260805-2233-coder-step7-remainder-documentation.md extended with a discharge note citing `CLAUDE.md:70`.

## Not done here

- No commit (the orchestrator commits after validation).
- The plan file keeps marker `_p_`: Steps 6 and 7 are `[DONE]`, Step 8 (the ship) is still open, so the plan is not complete.

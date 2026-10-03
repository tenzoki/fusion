# The legacy composer reports two finding classes the confirmed contract makes blocking

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 260928-1338-json-control-data-and-markdown-artefacts.md

---

## Finding

`codec/fixtures/prior/REQUESTS.md` `## FJ04 (the contract delta, amended for ab9cb59)`, as confirmed by Prior, makes `plan-adopted-twice` blocking and adds a blocking `active-document-role-conflict`. The host composer disagrees on both:

- `hooks/lib/legacy-import.ts:137` classes `plan-adopted-twice` as `reported`.
- `active-document-role-conflict` does not appear in the `FINDINGS` table at all, so the composer never raises it.

The amendment of 2026-10-03 in the FJ04 plan (its still-blocking list) names neither class.

Found by the analyst during FJ04 step 12a and recorded in that step's note.

## Expected

The composer raises both classes with the severity the confirmed contract gives them, unless a later ruling or one of requests 54 to 58 changes it; in that case the departure is named in `REQUESTS.md` and in the plan's still-blocking list.

## Disposition

The user ruled on 2026-10-03 ("b1") that this is fixed within FJ04 step 12d.

---
Resolved: FJ04 step 12d, by ruling b1. `hooks/lib/legacy-import.ts` `FINDINGS` types `plan-adopted-twice` `blocking`. It adds `active-document-role-conflict` as `reported`: a clause and a stem that name opposite roles bind nothing, and the entry is carried in `references` with `derived` `binding-carried-as-reference`/`role-conflict` (request 58, as `REQUESTS.md` `## FJ04 (addendum for Prior d0fce6c and ruling b1)` states the departure). Shown in `hooks/lib/__tests__/legacy-import.test.ts`, one red run each against a composer that types the first `reported` and one that keeps `clause ?? stem`. On the three step-12 copies both classes count 0 / 0 / 0.

# Does the module keep serving fusion.entry.v1 beside fusion.entry.v2?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md`; `261027-1612-which-host-service-integrates-an-entry-run-under-the-step-17-model-and-what-does-it-replace.md`; `261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`; `261027-1833-how-does-a-frozen-catalog-asset-leave-the-tree-when-the-contract-it-serves-is-withdrawn.md`; `foreign:F09-Prior:261024-0807-how-does-an-entry-run-deliver-its-result-into-the-users-repository.md`

---

## Question

Fusion 13.4.1 adds `workflows/entry.v2.json` and `schemas/entry-result.v2.json`. The capability follows the workflow's version, so the new one is `fusion.entry.v2`, as `explorer.v1` is `fusion.explorer.v1`. `entry.v1` describes repair's accepted-reference integration, which Prior's user ruled out for entries on 2026-10-24. Prior has never accepted it, and no Prior host runs it: Prior's decoder refuses its compose at the pin. The module, the bundle and request 77 must each say whether v1 is still served and whether its assets stay, so the choice has to come before the module step.

This record was revised on 2026-10-27 at the plan review, before any answer. The user's ruling on repair (`261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`, option 3 as stated) allows one delivery model only. That excludes serving v1, so the remaining question is what happens to the v1 entry assets. The first filing named a constraint "never edited or removed under its name". Its "removed" half read more into the freeze rule than the rule says. The withdrawal question is now `261027-1833-how-does-a-frozen-catalog-asset-leave-the-tree-when-the-contract-it-serves-is-withdrawn.md`.

## Options

1. **Serve `fusion.entry.v2` only, and withdraw `workflows/entry.v1.json` and `schemas/entry-result.v1.json` under the withdrawal rule.** The module drops its v1 interpreter. `schemas/entry-request.v1.json` stays published, because v2 uses it unchanged. Every entry profile names `schemas/entry-request.v1.json` and `schemas/entry-result.v2.json`.
   - Pros: one entry model in the module, the fake host, the conformance suite and the bundle. Nothing invites Prior to host a delivery model its user refused. Under the withdrawal rule no bytes change under a published name.
   - Cons: Prior's 76.2 check, which compares `FROZEN` with the installed files, has to be read against 13.4.1's shorter list. Request 77 says so.
2. **Serve v2 only, and keep the v1 assets frozen and carried, unserved.** This was the recommendation as first filed.
   - Pros: `FROZEN` loses no line.
   - Cons: the bundle carries two data files nothing serves, and they describe the accepted reference, which the ruling on repair removes from the shipped tree.
3. **Serve both capabilities.**
   - Pros: no code is removed.
   - Cons: it contradicts the ruling on repair: two delivery models, two interpreters, two fake-host paths, for a v1 that has no host.

## Constraints

- The ruling on repair: one delivery model, the step-17 one.
- No frozen file changes its bytes under its name. How a frozen file leaves is the withdrawal record's question.
- Explorer is served unchanged.

## Recommendation

Option 1, on the condition that the withdrawal record is answered with its option 1. If that record keeps the files (its option 2 or 3), this record's answer is option 2. Option 3 is excluded once the ruling on repair is answered as stated. The revised plan cited above is written against option 1.

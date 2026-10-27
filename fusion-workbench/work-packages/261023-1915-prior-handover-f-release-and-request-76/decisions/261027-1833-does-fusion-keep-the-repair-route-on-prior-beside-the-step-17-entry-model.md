# Does fusion keep the repair route on Prior beside the step-17 entry model?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md`; `261027-1612-which-host-service-integrates-an-entry-run-under-the-step-17-model-and-what-does-it-replace.md`; `261027-1612-does-the-module-keep-serving-fusion-entry-v1-beside-fusion-entry-v2.md`; `261027-1833-how-does-a-frozen-catalog-asset-leave-the-tree-when-the-contract-it-serves-is-withdrawn.md`; `261023-1854-which-schemas-bind-an-entry-run-of-an-agent-that-is-also-a-workflow-role.md` (D5); `261024-2111-does-an-entry-run-of-a-repair-role-write-the-workbench-on-prior.md`; `foreign:F09-Prior:261024-0900-does-repair-move-onto-the-general-entry-model.md`; `foreign:F09-Prior:261024-0807-how-does-an-entry-run-deliver-its-result-into-the-users-repository.md`

---

## Question

Since 13.1.0 fusion's Prior bundle serves two delivery models. `fusion.repair.v1` (`catalog/workflows/repair.v1.json`, Prior's answer 69, qualified by Prior at request 70) runs explorer, implementer, reviewer and auditor and integrates by a compare-and-swap of `refs/prior/accepted/...`, leaving the user's branch untouched. Entry runs move to Prior's step-17 model in 13.4.1: the run's commits fast-forward the user's branch and its uncommitted delta lands in the user's checkout. Prior's user ruled on 2026-10-24 (`261024-0900`, option 1) to keep repair unchanged for now and decide its move once entries run. At the plan review of 2026-10-27 fusion's user asked that only the new model exist. The 13.4.1 plan has to know whether the module, the catalog, the conformance suite, the fake host and the `prior` text keep a second model, so the choice comes before its first step.

## Options

1. **Keep repair unchanged beside the entry model**, as Prior's ruling `261024-0900` has it. The module serves `fusion.repair.v1` and `fusion.entry.v2`. The nine repair assets stay frozen and served. The three repair-role profiles keep the repair schemas (D5) and `writes_workbench.prior` `false` (`261024-2111`), and their `prior` parts keep two run kinds.
   - Pros: nothing Prior qualified at request 70 moves. Prior's ruling stands as written.
   - Cons: two delivery models in one bundle. Repair's accepted reference and the entry's fast-forward describe what reaches the user in opposite ways, and the three roles carry a two-way branch in every `prior` part. Prior keeps building and journalling the capture, integrate and snapshot services for one workflow.
2. **Convert repair into an entry**, a reviewed multi-role entry on the step-17 model. This is option 2 of Prior's `261024-0900`.
   - Pros: one delivery model, and the review gate survives.
   - Cons: new frozen assets, a new workflow shape (several roles behind a gate, which no entry has), and full re-qualification on both sides. Prior's analysis `261024-0821` found that repair does not fit the entry shape. None of that work is in 13.4.1.
3. **Remove repair entirely.** In 13.4.1 the module serves `fusion.explorer.v1` and `fusion.entry.v2` and nothing else. `adapters/prior/fusionmodule/internal/repair/`, the `fusion.repair.v1` capability, the repair workflow and its schemas, the repair conformance cases, the fake host's repair services and every `prior` text that describes a repair run go. Fusion no longer calls `host.capture.v1`, `host.integrate.v1`, `host.snapshot.v1` or the `close` action of `host.workbench.v1`. The route is given up for good, not deferred. The three repair-role profiles become ordinary entry profiles: they name the entry schemas, and `writes_workbench.prior` follows the role as for the other eight agents, because its `false` existed only for Prior's repair loader (`261024-2111`, Question). Request 77 tells Prior, asks Prior to revisit `261024-0900` on its side, and asks what Prior needs.
   - Pros: one delivery model in the bundle, the module, the fake host and the text. D5's carve-out and `261024-2111`'s per-workflow grant dissolve. Every entry profile has the same shape.
   - Cons: the review gate before integration is gone on Prior. A Prior user who wants a reviewed change runs the `reviewer` entry by hand. Prior's request-70 qualification describes a capability no later bundle serves. The 13.1.0 bundle Prior holds keeps it until Prior removes it.

## Constraints

- No codec byte moves in 13.4.1 (`b4047458…`).
- The Claude Code distribution is unchanged except the help paragraph and the README pin example: removing repair touches only `catalog/` and `adapters/`, which no install carries, and the Claude render of every profile stays byte-equal.
- Explorer keeps running: `fusion.explorer.v1`, its five frozen assets accepted at request 68, and its conformance cases.
- How a frozen asset leaves the tree is decided in `261027-1833-how-does-a-frozen-catalog-asset-leave-the-tree-when-the-contract-it-serves-is-withdrawn.md`.
- On Prior's side, revising `261024-0900` is Prior's user's act. Fusion asks for it in request 77 and does not record it.

## Recommendation

Option 3, which the user stated at the plan review on 2026-10-27 ("Ziel ist aber nicht, beide Modelle zu fahren, sondern das neue. Der Repair Weg wird auch in Prior abgeschafft." Asked what becomes of repair, the user chose removing it entirely). The revised plan cited above is written against it. Once this record is answered, `261024-2111-does-an-entry-run-of-a-repair-role-write-the-workbench-on-prior.md` is superseded by it.

---
Answered: the user in chat, 2026-10-27, at the plan review of 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md ("Ziel ist aber nicht, beide Modelle zu fahren, sondern das neue. Der Repair Weg wird auch in Prior abgeschafft.", then "1" to "remove it entirely") — option 3, remove repair entirely in 13.4.1; ruled by user, Kai Stalmann <ks@qantr.com>

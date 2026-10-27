# Which host service integrates an entry run under the step-17 model, and which steps of entry.v1 does it replace?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md`; `261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`; `foreign:F09-Prior:261024-0807-how-does-an-entry-run-deliver-its-result-into-the-users-repository.md` (condition (b)); `foreign:F09-Prior:261024-0900-does-repair-move-onto-the-general-entry-model.md`; `foreign:F09-Prior:261027-1519-fusion-request76-reading.md` (`### Step 46's items`); `261023-1854-which-schemas-bind-an-entry-run-of-an-agent-that-is-also-a-workflow-role.md` (D5); `261023-2154-frozen-entry-result-schema-describes-changes-and-questions-differently-from-what-the-module-and-prior-produce.md`

---

## Question

Prior's user ruled on 2026-10-24 that an entry run delivers its result by the step-17 model: the run's commits fast-forward the branch the user's HEAD named, and the run's uncommitted delta is applied into the user's checkout, refused on conflict. Condition (b) of that ruling asks fusion for a distinct entry integrate form, because answer 69 binds `host.integrate.v1` to repair. `entry.v1` chains three request-69 services after the run: `host.capture.v1` (a diff inside a write scope), `host.integrate.v1` (a compare-and-swap of `refs/prior/accepted/...`) and `host.snapshot.v1` (the accepted commit's tree and changed paths). None of the three describes a fast-forward plus an uncommitted delta, and the module's check `integrated.Tree == captured.Tree` (`adapters/prior/fusionmodule/internal/entry/entry.go`, `run`) refuses every run that commits nothing, `memo` among them. Fusion has to name the form in `entry.v2` and request 77 before it can build the module, the fake host and the schema, so the choice is needed now.

Revised on 2026-10-27 at the plan review, before any answer, after the user's ruling on repair (`261027-1833-does-fusion-keep-the-repair-route-on-prior-beside-the-step-17-entry-model.md`, option 3 as stated). Under it fusion calls none of the three services above, and no service beside the role services that only repair used. The first filing also counted the services `entry.v2` requires as eleven. The list it gave holds ten, and the recommendation below enumerates them.

## Options

1. **One new service, `host.entry.integrate.v1`, in place of capture, integrate and snapshot.** Request `{run_id}`, slot `integration`. Its completed answer is the whole integration: `run_id`, `base` (the user's HEAD at open), `reference` (the reference HEAD named, such as `refs/heads/main`), `head` (that reference after the fast-forward, equal to `base` when the run made no commit), `commits` (the run's own commits as made, oldest first, each `{commit, subject, changes}` with `changes` in git's name-status form) and `delta` (the uncommitted changes applied to the checkout, name-status form). A conflict, a moved base or a non-fast-forward is a refusal under the request-69 common contract, with nothing written. Prior checks every changed workbench control record with its qualified codec before the first effect, so a codec refusal is one more refusal of this call (the preview's `## 4.` point 7). `entry.v2` keeps `host.workbench.v1` reads (`read`, with `page` for a long record) of the changed control records after integration as observations, as Prior's preview proposes.
   - Pros: it matches the shape Prior already built, `EntryIntegration {base, commit, reference, paths}` (`Prior: internal/fusionhost/entry_workspace.go`), with the commit list and the name-status form the comparison reads. The host assembles `commits` with their real subjects, which settles request 76 question 17's third point and the `changes` half of question 15. A run that changes nothing needs no special case: the answer carries empty `commits` and `delta`. Prior builds one entry service instead of three. Of the request-69 services fusion then calls only `host.role.compose.v1`, `host.workspace.v1` and `host.workbench.v1` `read`/`page`.
   - Cons: the pre-integration codec check moves into a service Prior has not yet specified. Fusion proposes it, and Prior may correct it.
2. **Entry forms of all three, such as `host.entry.capture.v1`, `host.entry.integrate.v1` and `host.entry.snapshot.v1`.** This keeps v1's step chain and its "capture empty, end" branch.
   - Pros: it is the smallest change to the module's step sequence.
   - Cons: three new wire forms for one fact. Prior's `Integrate` computes the delta itself, so a separate capture answer duplicates it. A snapshot of a run with no commit still has to be defined. Prior then builds and journals three entry services.
3. **`host.integrate.v2` as one service, the same answer as option 1.**
   - Pros: the same design as option 1. With repair removed, no fusion workflow calls `host.integrate.v1`, so the version bump no longer suggests two services side by side in fusion.
   - Cons: a version bump of the same name reads as the successor of Prior's compare-and-swap of an accepted reference, the opposite delivery model. Condition (b) of ruling `261024-0807` asks for a distinct entry form, and Prior keeps `host.integrate.v1` for as long as it holds the 13.1.0 bundle.

## Constraints

- Fusion calls none of `host.capture.v1`, `host.integrate.v1`, `host.snapshot.v1` or the `close` action of `host.workbench.v1` (the ruling on repair). What Prior keeps of them is Prior's choice, asked in request 77.
- Frozen assets are never edited under their name. A correction is a new version beside them (`catalog/schemas/FROZEN`, request 76 `### What fusion does with the answer`).
- No codec byte moves in this release.
- The push stays deferred to a later definition version, per condition (c).

## Recommendation

Option 1, under the name `host.entry.integrate.v1`, put to Prior in request 77 as fusion's proposal for Prior to confirm or correct. `entry.v2` then requires ten services: `host.role.read.v1`, `host.role.run.v1`, `host.role.complete.v1`, `host.role.compose.v1`, `host.workspace.v1`, `host.entry.integrate.v1`, `host.workbench.v1`, `host.question.v1`, `host.exec.v1` and `host.dispatch.v1`. The plan cited above is written against this option. Under option 2 or 3, its steps 2 to 5 and 10 are re-planned.

---
Answered: the user in chat, 2026-10-27, "1" to the review of 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md (approve the plan, all four open questions as recommended) — option 1, host.entry.integrate.v1 in place of capture, integrate and snapshot; ten services; ruled by user, Kai Stalmann <ks@qantr.com>

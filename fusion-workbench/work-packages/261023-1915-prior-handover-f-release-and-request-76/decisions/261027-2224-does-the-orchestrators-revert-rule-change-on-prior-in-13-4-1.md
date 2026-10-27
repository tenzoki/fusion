# Does the orchestrator's revert rule change on Prior in 13.4.1, or only gain a warning?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261027-2145-entry-delivery-model-statement-map.md, 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md, 261027-1612-which-host-service-integrates-an-entry-run-under-the-step-17-model-and-what-does-it-replace.md

---

## Question

Under Prior's step-17 model the run's workspace holds the user's uncommitted changes from before the run, and integration applies the workspace delta to the user's checkout. The orchestrator's revert rule (`git checkout HEAD -- <file>`) reverts a file to the run's base revision, so it would discard the user's own uncommitted change in that file, and integration would write the discard into the user's checkout. The statement map (`## Implications` point 1; rows O3, O5, O21) gives a safe replacement sentence that needs one read the orchestrator's `prior` text does not make today: `git status --porcelain` at Setup. The plan says entry behaviour does not change in 13.4.1. Must step 6 change that behaviour now, or only warn?

## Options

1. **Change it in step 6.** The orchestrator's `prior` parts read `git status --porcelain` once at Setup; a file listed there, or one an earlier task of the run changed, is never reverted and is named to the user instead (rows O3, O5, O21 as the map words them).
   - Pros: the revert can no longer destroy the user's pre-run work on Prior.
   - Cons: a small behaviour change on the Prior surface in a patch release, against the plan's "behaviour unchanged" line.
2. **Warn only.** Step 6 adds the hazard sentence and keeps the rule; the behaviour change waits for a later release.
   - Pros: 13.4.1 stays a pure description fix.
   - Cons: the hazard stays live until then.

## Constraints

Only `prior` parts change; no `neutral` or `claude` part, so `CLAUDE-RENDER` and `CLAUDE-DIST` hold. The replacement sentence names no host service outside the orchestrator entry's `requires`.

---
Answered: the user in chat, 2026-10-27, "B1" — option 1, step 6 changes the rule: Setup reads git status --porcelain once, a listed file or one an earlier task changed is never reverted and is named to the user; ruled by user, Kai Stalmann <ks@qantr.com>

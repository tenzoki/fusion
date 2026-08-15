# Does `analyst` get a project-local rule pattern of its own, now that the investigator fold has orphaned one in every consuming project that configured it?

---
**Domain:** code
**Status:** open
**Filed by:** coder (step 15, release preparation)
**Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-1501-coderev-turn-3-conceptrev-investigator-domain-values.md:155` (the finding, deliberately not filed by its reviewer); `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 8 (the fold that caused it); `rules/context-manifest.md` (the route that exists today)

---

## Question

Step 8 folded `investigator` into `analyst` and deleted `templates/investigator-capture-layout.md` with the agent. A consuming project that had the investigator configured copied that template to `./rules/investigator-capture-layout.md` and filled it in. **That file is now loaded by nothing.** `analyst` sits in the `PATTERNS=""` arm of `bin/fusion-rules`, so no project-local rule file reaches it by filename pattern at all, and the help skill's configure section lost the bullet that set the investigator's rule up.

The fold moved the *work* — failure investigation is `analyst`'s ninth analysis type — without moving the *configuration surface* the work used. The reviewer named this rather than filing it, on the ground that what a removal owes its installed base is a choice rather than a defect (`260815-1501-coderev-turn-3…:155`).

Two things were done at step 15 and neither answers this question. `docs/upgrading-to-v9.md` §4 tells an upgrading project the file is orphaned and how to re-register it through the manifest, and `skills/help/SKILL.md` §5 now names `analyst` as the case the manifest exists for. Both document the workaround. Neither decides whether the workaround is the answer.

## Options

1. **The context manifest is the documented successor. Nothing changes in `bin/fusion-rules`.** A project that wants a rule in `analyst` registers it in `./rules/context-manifest.yaml` with `agents: [analyst]` and `topics: [always]`.
   - Pros: no new mechanism — the manifest already does exactly this, for exactly this reason, and reuse-before-build (`rules/critical-stance.md` §2) says to prefer it. Topic-scoped loading is strictly better than a filename pattern for a large capture layout, which is the kind of file this is. Already true at HEAD; the release ships correct.
   - Cons: the manifest is a heavier surface than dropping a file into `./rules/`, and a project that had one file now needs two. It is also the only agent whose project-local rules work this way, which is an asymmetry a reader has to be told about rather than infer.

2. **Give `analyst` a `PATTERNS` arm**, e.g. `analyst|analysis`, so `./rules/analyst-*.md` loads the way `./rules/investigator-*.md` used to.
   - Pros: symmetric with every other pattern-carrying agent; a one-line change; the upgrade path becomes a rename rather than a manifest entry.
   - Cons: adds always-on bytes to the leanest-but-one role, against a growth bound this very Circle just armed, for a file whose size is entirely the project's choice. Re-creates the unbounded per-dispatch load the manifest was built to replace. The `PATTERNS=""` arm was not an oversight — `analyst` is a read-what-you-are-pointed-at agent by design (step 8 deliberately dropped the halt-at-Setup behaviour that a required layout file caused).

3. **Both**: a pattern arm for small rules, the manifest for large ones.
   - Pros: nothing to explain to a project migrating from either side.
   - Cons: two routes to one outcome, decided by a size judgement no mechanism makes — the thicket §2 of the critical-stance rule names. Rejected on sight unless 1 and 2 both prove wrong.

## Constraints

- Whatever is chosen must not require an upgrading project to act before its next `analyst` run succeeds. It already does not: `analyst` runs fine with the orphaned file present and simply does not read it.
- The always-on rule corpus is under a failing growth bound with a stated floor. Option 2's cost is a project's file, not the plugin's, so it does not spend that head-room directly — but it re-opens the unbounded-project-rule case the manifest closed.
- No answer here is a release blocker. v9 ships with option 1's behaviour whichever way this is later decided, because option 1 is what HEAD does.

## Recommendation

**Option 1**, and the recommendation is weak on purpose: it is the reuse-before-build answer and it is already true, so choosing it costs nothing and choosing it wrongly costs one line in `bin/fusion-rules` later. What is missing to make the call properly is a fact nobody has: how many consuming projects ever filled in the capture layout. Inside this repository the number is zero — fusion's own `./rules/` never carried one. If the installed base is likewise zero, this question is moot and should be closed rather than answered.

---
Answered:
Implemented:
Deferred:
Superseded by:

# Does `analyst` get a project-local rule pattern of its own, now that the investigator fold has orphaned one in every consuming project that configured it?

---
**Domain:** code
**Status:** open
**Filed by:** coder (step 15, release preparation)
**Cross-references:** `260815-1501-coderev-turn-3-conceptrev-investigator-domain-values.md:155` (the finding, deliberately not filed by its reviewer); `260815-0029_*_plan-remove-eight-mechanisms-and-cap-growth.md` step 8 (the fold that caused it); `rules/context-manifest.md` (the route that exists today)

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

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. No answer recorded anywhere; option 1's behaviour is still what HEAD does, unchanged.**

**Measured at HEAD `e435f03`:**

```
grep -n 'PATTERNS=' bin/fusion-rules
  165:  coder|coderev|bugfixer)   PATTERNS="coding" ;;
  166:  ontocoder|ontorev)        PATTERNS="ontology normative verb" ;;
  167:  planner)                  PATTERNS="coding ontology" ;;
  169:                            PATTERNS="" ;;
```

`analyst` is still in the empty arm at `:168-169`, so no project-local rule file reaches it by filename pattern. Option 2 was not taken. Four tagged releases have shipped over this state — v10.0.x, v10.1.0, v10.2.0, v10.3.0 — each of them, as the record predicted, shipping correct under option 1's behaviour whichever way the question is later decided.

**Searched for an answer and found none:** `$SCAN_DECISIONS` in both stores, `$SCAN_PLANS`, `$SCAN_ANALYSES`, and the session histories since 2026-08-15. `docs/upgrading-to-v9.md` §4 and `skills/help/SKILL.md` §5 still document the manifest workaround, which the record already discounted as documenting rather than deciding.

**The one fact that would settle it is still missing, and the record says what to do about that.** Its recommendation ends: *"If the installed base is likewise zero, this question is moot and should be closed rather than answered."* Inside this repository the number is confirmed zero — `./rules/` has never carried an investigator capture layout. The reachable consuming projects are the same two this project has measured against before (`krk`, `unite-co-creator`), and a single `ls ./rules/investigator-*` on each answers the question outright. That measurement is cheaper than the decision and has not been taken.

Note also that the sibling record `260805-2323_*_die-emissionsmessung-auf-der-unite-cocreator-maschine-steht-noch-aus.md` is open on a measurement against one of those same machines. One visit discharges both.

---
Answered: option 3 — both. `analyst` gets a `PATTERNS` arm so a small project-local rule loads by filename the way the investigator's did, and the context manifest stays the documented route for anything larger. Answered by the user 2026-08-20.

The reason for not taking option 1 alone: the manifest is a `./rules/context-manifest.yaml` a project must author, validate and keep in step, and requiring it for a single small rule file is disproportionate to what the fold took away. A consuming project that had filled in the investigator's capture layout should not have to build a manifest to get one file loaded again.

The reason for not taking option 2 alone: the manifest is the right answer for a large or topic-scoped corpus and is already documented as such in `docs/upgrading-to-v9.md` §4 and `skills/help/SKILL.md` §5. Removing it would trade one gap for another.

---
Implemented: 30d6f0a — `bin/fusion-rules` gives `analyst` a `PATTERNS` arm on the bare token `analyst`, so a project-local `./rules/analyst-*.md` loads by filename, and the context manifest stays the documented route for a larger corpus. The token was chosen over `analysis` and the reason is measured: the glob is a substring match, so `analysis` would sweep up a project's own `gap-analysis.md` or `impact-analysis.md`, which are subject matter rather than agent configuration. Verified in a scratch consuming project — `analyst-capture-layout.md` matches; `investigator-capture-layout.md`, `gap-analysis.md` and `coding-hygiene.md` do not.

The orphaned `investigator-capture-layout.md` is deliberately not rescued by widening the pattern: a rename is cheaper than the manifest entry `docs/upgrading-to-v9.md` §4 already offers, and widening to catch one filename would have caught much else. Three statements the arm made false were repaired in the same change — the `README-agents.md` table, the "only route" claim in `skills/help/SKILL.md` §5, and `docs/upgrading-to-v9.md` §4.

The emission golden did **not** move, contrary to the dispatch's expectation: it measures in a neutral working directory with no project rules, so a project-local pattern arm adds no line to it.

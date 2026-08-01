No SCAN_* key resolves into the archive store, so archived decisions and history leave every agent's read set permanently

---

The path-resolution table in `rules/fusion-workbench-conventions.md:129-153` defines nine read keys: `SCAN_PLANS`, `SCAN_ISSUES`, `SCAN_DECISIONS`, `SCAN_HISTORY`, `SCAN_REVIEWS`, `SCAN_ANALYSES`, `SCAN_INVESTIGATIONS`, `SCAN_CONSULT`, `SCAN_CIRCLES`. Every one of them resolves into `circles/<active>/...` and `shared/...`. None resolves into `archive/`.

`/fusion:archive` tier-1 moves whole terminal Circles, plus closed defects, closed plans, implemented decisions (`_i_`) and superseded decisions (`_s_`) from the shared store, into `archive/<stamp>-<slug>/` (`skills/archive/SKILL.md:103-112`). `/fusion:cleanup` Step 4 runs tier-1 autonomously with no confirmation gate (`skills/cleanup/SKILL.md:115`).

---

**Failure scenario:** a project runs `/fusion:cleanup` at the end of each work session, as intended. After several months, most closed Circles and all implemented and superseded decisions sit in `archive/`. A reconciler then computes the Grounding↔Directive edge (`agents/reconciler.md:137`) by globbing `*_a_*.md` and `*_o_*.md` across `$SCAN_DECISIONS`. It sees only the live records. A new decision that contradicts an archived implemented one is filed, answered and implemented without anything noticing the conflict, because the record it contradicts is outside every resolved read path. The `_s_` supersession that the marker vocabulary exists to express (`rules/fusion-workbench-conventions.md:280`) is never applied, and the Grounding-Historie layer the conventions describe at lines 292-299 stops functioning as a layer at all.

The same blindness applies to any capability grounded in project history. An agent asked to justify a prune by what actually happened would read a record set that shrinks with every cleanup run, precisely as the project's history gets longer.

Two candidate resolutions:

1. Add an explicit archive read key (for example `SCAN_ARCHIVE`) that `bin/fusion-paths` emits for consumers whose prompts name it. This follows the existing derive-from-prompt contract (`rules/fusion-workbench-conventions.md:164-185`) and costs nothing for consumers that never ask.
2. State deliberately that archived material is out of scope for all agent reads, and say so in the conventions, so that the exclusion is a decision rather than an omission.

The choice is a design call, not a bug fix, because option 2 is defensible: unbounded read scope has its own cost. What is not defensible is the current state, where the exclusion is invisible and its effect grows silently.

Filed by: analyst, from `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md` (Question 4, fourth thin spot).

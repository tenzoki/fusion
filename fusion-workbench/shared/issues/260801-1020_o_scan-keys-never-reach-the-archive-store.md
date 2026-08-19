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

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `bin/fusion-paths` emits no `SCAN_ARCHIVE` or equivalent, and `rules/fusion-workbench-conventions.md` documents `archive/` as a store without stating a read-scope exclusion. Neither candidate resolution was taken. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Reconciliation 260819-1400** (reconciler, domain `code`, HEAD `e435f03`; log
`shared/history/260819-1400-reconciliation-shared-issues.md`). Reproduces, and the premise it was
filed on has stopped being hypothetical. `grep -in archive bin/fusion-paths` is still empty — no
`SCAN_*` key resolves into `archive/`, and no decision states the exclusion. What changed is the other
side: the store is no longer empty. `e59dea2` (260817-1912) ran the archive step for the first time in
the repository's history and moved real content under
`fusion-workbench/archive/260817-1907-safe-cleanup-scoped/` — a `MANIFEST.md`, six `shared/planning/`
records, `shared/decisions/` and `shared/issues/` records, and the rolled guard log. The sibling record
`260816-1050` drew exactly this distinction ("that record assumes the store fills up over time; this
one measures that it never has") and is now closed on its own half.

**The severity moves with it.** Until 260817 an agent reading only `$SCAN_*` missed nothing, because
there was nothing to miss. From `e59dea2` onward every reconciler, curator and analyst pass that asks
what the project's history says is reading a corpus with a hole in it, and the hole grows with each
cleanup. One measured consequence already exists: `shared/decisions/260811-1146_i_*.md:7` cross-
references `shared/issues/260811-1142_*_*.md`, which now lives under `archive/…/shared/issues/` — the
citation resolves for no reader following it at the path written. Marker stays open; the fix direction
is unchanged, but it is now a live gap rather than a latent one.

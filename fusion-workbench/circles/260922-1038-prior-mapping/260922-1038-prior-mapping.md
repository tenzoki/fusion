# Adapt fusion to the PRIOR/Fusion nomenclature and give consumers a migration to it

---
**Domain:** code
**Status:** claimed
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260923-0812
**Active spec/plan:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md (spec, part 1), 260922-1106_*_spec-prior-nomenclature-consumer-migration.md (spec, part 2)
**Cross-references:** nomenclature.md (this container), 260910-2145_*_does-the-container-store-keep-the-directory-name-circles.md, 260922-1114_*_plan-prior-nomenclature-plugin-source.md, 260922-1129_*_plan-prior-nomenclature-consumer-migration.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The user's words, 260922-1038: "lege eine neues Arbeitspaket an: prior-mapping. Hintergrund: ich will fusion mit einem eigenen claude code ersatz betreiben können und habe im zusammenhang mit der planung die fusion nomenklatur überarbeitet. das ergebnis liegt hier: nomenclature.md. Bereite das Arbeitspaket vor, übernimm das nomenclature.md in das paket. dann (1.) spezifiziere und plane die fusion anpassungen an die neue nomenklatur. 2. spezifiziere und plane die migrationstools, so dass consumer an die neue nomenklatur angepasst werden könnnen."

The background: fusion is to run on Prior, the user's own Claude Code replacement, and the planning for that produced a revised nomenclature. `nomenclature.md` in this container is the copy of that result, taken verbatim from the user's file on 260922-1038; its `## Purpose and authority` names three further documents (product, architecture, implementation plan) as the normative sources, and those are not in this repository.

The item is reached when two specs and two plans stand in this container's `planning/`: (1) a spec and a plan for adapting fusion itself, the plugin source in this repository, to the PRIOR/Fusion vocabulary and folder names `nomenclature.md` defines; (2) a spec and a plan for the migration tooling that brings a consuming project's workbench and references from the legacy names to the new ones. Implementing either plan is later work and not part of this item.

## Notes at filing

- Filed through the consultant at the user's instruction; the Directive carries the user's words.
- Not claimed at filing: this checkout already holds `260922-0906-fix-package-over-every-open-issue.md`, and a second claim by the same checkout is the ambiguity `bin/fusion-claimed-item` refuses (exit 3). Whoever takes this item up claims it once that package is done, or works it through `**Item:**` dispatches as the specs and plans were written.
- 260922-1130: both specs are Decided (five user rulings on 2026-09-22, recorded in their bodies) and both plans stand: `260922-1114_*_plan-prior-nomenclature-plugin-source.md` (16 steps) and `260922-1129_*_plan-prior-nomenclature-consumer-migration.md` (9 steps plus one user step). `**Active spec/plan:**` holds at most one plan, and this item has two whose steps interleave (plan (2) `## Sequencing against plan (1)`), so the field names the two specs and the plans are cross-referenced. Whether the item is split into one per part, or which plan is entered first, is the user's call at the plan gate. Eleven decision records stand in `decisions/`: seven for the Review-class stores (`260922-1059_*`, open by design, part (2) closes them), three from plan (1) and one from plan (2), of which `260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md` and `260922-1125_*_does-the-store-name-migration-carry-its-mechanics-in-the-skill-body-or-in-a-bin-helper.md` need the user's ruling before their plans proceed past their first steps.
- `nomenclature.md` `### Fusion workbench migration` states explicitly that its table "defines naming direction, not an authorised bulk move" and that record schemas, references, history and compatibility readers must be designed before existing files are migrated. Both specs are bound by that sentence.

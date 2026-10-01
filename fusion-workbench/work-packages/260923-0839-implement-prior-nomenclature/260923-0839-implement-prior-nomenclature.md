# Implement the PRIOR/Fusion nomenclature in the plugin source and the consumer migration

---
**Domain:** code
**Status:** done
**Claim:** 5e8248d7 — Kai Stalmann <ks@qantr.com>, 260923-0839
**Cross-references:** 260922-1038-prior-mapping.md, 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1106_*_spec-prior-nomenclature-consumer-migration.md, 260922-1114_*_plan-prior-nomenclature-plugin-source.md, 260922-1129_*_plan-prior-nomenclature-consumer-migration.md
**Active spec/plan:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md (spec, part 1), 260922-1114_*_plan-prior-nomenclature-plugin-source.md (plan, part 1: the one this item runs on and closes against; part 2's plan 260922-1129_*_plan-prior-nomenclature-consumer-migration.md interleaves with it and is cross-referenced)
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The user's choice, 260923-0839, of the option put to them: "Dieses Paket als erledigt schließen und für die Umsetzung ein neues Paket anlegen. Das neue Paket übernehme ich und lege dir dann die beiden Pläne zur Freigabe vor." The work is implementing the two plans the item `260922-1038-prior-mapping.md` produced — part (1), adapting the plugin source, and part (2), the consumer migration — in the interleaved order part (2) `## Sequencing against plan (1)` gives, after the user has approved both plans and ruled on the decisions they wait on. The item is reached when both plans are complete and the release they end in has shipped.

## Closure, 261001-2139

Closed `done` on the user's word, 261001. Both plans are complete (plan 1 steps 1–16 `[DONE]`, plan 2 steps 1–9 `[DONE]`), the release they end in shipped as `v12.0.0` with `v12.0.1` after it, and all six issues in this container are `_c_`. Commit range: `7a5a88d3..cfbc12dc` (tags `v12.0.0`, `v12.0.1` at `996d48fd`).

Stop conditions of `260922-1114_*_plan-prior-nomenclature-plugin-source.md`: all eight clauses put to the user as one question; the user answered that every one holds.

Review coverage: the user chose to close without a review pass. The coverage read measures only from `cfbc12dc`, so the v12 work itself (about 47 commits since 260923, ten of them event-log settles) has no review on record; the last review in the shared review store is dated 260916. The gap is advisory and named here so it outlives the chat.

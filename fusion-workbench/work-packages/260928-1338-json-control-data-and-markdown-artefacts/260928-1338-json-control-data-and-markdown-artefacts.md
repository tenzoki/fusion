# Fusion side of the JSON workbench: JSON control data beside Markdown artefacts, FJ00 to FJ05

---
**Domain:** code
**Status:** claimed
**Claim:** 114caf11 — Kai Stalmann <ks@qantr.com>, 260928-1338
**Active spec/plan:** 260928-2110_*_plan-fj01b-fj00-follow-up-prior-rulings-applied-and-the-contract-frozen.md (plan; no spec)
**Cross-references:** 260928-1341_*_plan-fj00-schemas-dto-mapping-and-reference-status-contract.md (FJ00, closed 2026-09-28), 260928-1550_*_plan-fj01-codec-port-bundle-wrapper-and-first-record-round-trip.md (FJ01, closed 2026-09-28), 260927-2304-fusion-dual-host-design-review.md, 260927-2319_*_may-an-agent-originate-a-work-package-on-its-own-initiative.md, 260927-2319_*_does-the-growth-bound-on-shipped-text-yield-to-the-dual-host-prompt-set.md, 260922-1038-prior-mapping.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

Implement the Fusion side of the specification Prior holds at `concept/fusion-json-workbench-spec.md` (Prior commit range after `12d8424`, dated 2026-09-28): control data of work packages, issues, plans, discussions and decisions become authoritative JSON beside the Markdown that keeps the authored content, in the six packages FJ00 to FJ05 that specification enumerates in its section 9. The user's instruction, 2026-09-28, in the user's words: "Wir sollten so vorgehen, dass Codex auf der Prior Seite weiter arbeitet und du hier die Fusion Seite übernimmst. Wir trennen also nach Repo." The work lands on the branch `fj-json-workbench`, cut from `v12-prior-nomenclature` at `40a1713f`, so that the pending v12.0.0 release stays a pure rename release; the specification's own recommendation is that this contract ships as the major that closes the v12 transition window. The Prior side (Codex) owns the specification text, the Prior adapter and the Prior registers this work maps; this package reads them and changes none of them. It is reached when FJ05's evidence exists as section 9 defines acceptance: findings on every mandatory check with source and tool versions, commands, inventories and hashes, and a fresh install of the resulting plugin migrates a copy of a real v12 workbench and reads one open and one terminal record back through the new paths.

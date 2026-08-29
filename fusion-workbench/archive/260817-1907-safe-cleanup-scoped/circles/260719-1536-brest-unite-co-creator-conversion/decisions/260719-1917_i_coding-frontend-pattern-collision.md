# unite conversion: `coding-frontend.md` collides with the fusion-rules `coding` pattern — accept always-on, or rename to make it topic-scopable?

---
**Domain:** code
**Status:** implemented
**Filed by:** planner
**Cross-references:** 260719-1917_*_unite-context-loading-conversion.md; bin/fusion-rules (lines 116-127, 295-299)

---

## Context

`bin/fusion-rules <agent>` has two loading surfaces for `./rules/`:

1. **Pattern matcher** (always-on, topic-independent) — globs `./rules/*<pat>*.md`
   case-sensitively, where `<pat>` per agent is a fixed lowercase token:
   `coding` (coder/coderev/bugfixer/planner), `ontology`/`normative`/`verb`
   (ontocoder/ontorev), `investigator` (investigator).
2. **Manifest** (topic-scoped) — the optional `./rules/context-manifest.yaml` units.

I verified (case-sensitive glob simulation over unite's 12 rule filenames) that of the
files consolidated into lowercase `rules/`, exactly **two** collide with a built-in
pattern because they are lowercase-named:

- `coding-frontend.md` → matched by `coding` for coder/coderev/bugfixer/planner.
- `investigator-capture-layout.md` → matched by `investigator` for the investigator.

The 10 UPPERCASE-named files (`ARCHITECTURE-RULES.md`, `ONTO-ENG-RULES.md`, `CODING-HYGIENE.md`,
`NORMATIVE-MATERIAL-POLICY.md`, …) do **not** collide — the lowercase patterns never match
their uppercase substrings — so they are cleanly topic-scopable through the manifest.

## The problem this raises

`coding-frontend.md` is therefore emitted **always-on** for the four code agents, regardless
of the active topic. The manifest cannot make it selective: if we also list it as a manifest
unit, `fusion-rules` emits it **twice** on a matching topic (once by pattern, once by manifest)
— a duplicate, not selectivity. So the manifest must simply **not** list it. Net effect: this
one FE coding-hygiene file (2,106 bytes) stays always-on for code agents.

`investigator-capture-layout.md` has the same collision, but that is **correct by design** —
the fusion convention is that the investigator pattern-loads its capture layout from `./rules/`.
No decision needed there; it stays pattern-loaded and out of the manifest.

## Options for `coding-frontend.md`

1. **Accept always-on for code agents; keep it out of the manifest.** Zero renames, no broken
   citations. Cost: 2 KB of FE rules load for every code-agent session even on backend work.
2. **Rename to break the collision** (e.g. `FE-CODING-RULES.md`, uppercase) and add it as a
   manifest unit tagged `[frontend]`. Fully topic-scoped. Cost: update every citation/reference
   to the old name; it is referenced from `RULES/coding-frontend.md`'s own header and possibly
   FE docs — needs an enumeration pass before renaming.

## Recommendation

**Option 1** for this Circle. The file is 2 KB of frontend coding hygiene; binding it always-on
for code agents is a negligible tax and arguably correct (it *is* a coding rule). Renaming trades
a real citation-churn cost for a 2 KB saving that only matters on backend-only sessions. Document
the collision in the manifest header comment so the exclusion is intentional and legible, not an
oversight. Revisit (Option 2) only if unite later wants strict per-topic FE-rule isolation.

This is unite's convention to own, so the choice is the user's.

---
Answered: (open — pending user direction)

---
Answered: user approved plan gate "Freigeben, Standard" (session 260719-1632-orchestrator-session.md) — accept coding-frontend.md as always-on (pattern-loaded via the `coding` token, ~2 KB), keep it out of the manifest to avoid double-emission, document the exclusion in the manifest header.

---
Implemented: `06734571` (add `rules/context-manifest.yaml`). Verified on disk 2026-07-19: `coding-frontend.md` is absent from the manifest `units:` list (appears only inside the header's "INTENTIONAL OMISSIONS" comment) and is pattern-loaded always-on — confirmed by acceptance check 5 (`$FR coder` with no topic emits `./rules/coding-frontend.md`) and check 6 (no duplicate emission). `_a_` → `_i_`.

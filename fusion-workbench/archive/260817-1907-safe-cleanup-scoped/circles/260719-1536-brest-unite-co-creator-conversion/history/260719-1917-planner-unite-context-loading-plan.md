# Planner — unite-co-creator context-loading conversion plan

**When:** 2026-07-19 19:17
**Agent:** planner (domain: code; executors: coder, ontocoder)
**Circle:** 260719-1536-brest-unite-co-creator-conversion

## What I produced

- Plan: `planning/260719-1917_o_unite-context-loading-conversion.md` — 6 steps (with 2a/2b extraction sub-steps), dependency-ordered, two Mermaid diagrams (before→after loading mechanism; step DAG).
- Decision: `decisions/260719-1917_o_coding-frontend-pattern-collision.md` (`_o_`, open) — the one genuine user-owned fork.

## Ground truth verified (not re-derived from the dispatch)

- Read `bin/fusion-rules` end-to-end. **Crux:** it has two `./rules/` surfaces — a case-sensitive pattern matcher (`*<pat>*.md`, tokens `coding/ontology/normative/verb/investigator`, always-on) and the topic-scoped manifest. Simulated the glob over unite's 12 filenames: only the two **lowercase** files collide (`coding-frontend.md` → `coding`; `investigator-capture-layout.md` → `investigator`). The 10 UPPERCASE files do not collide → cleanly topic-scopable. This fact is the load-bearing design driver and is why selective loading is achievable for unite.
- Confirmed: `RULES/` (11 tracked, uppercase) + `rules/investigator-capture-layout.md` (1) = 12 physical on case-insensitive FS; `.claude/rules/` gitignored mirror via `make mirror-rules` (`$U/Makefile:625-628`, `cp RULES/*.md`); CLAUDE.md 43,145 B / 259 lines / 18 sections; no manifest yet; `$U` clean on `main`.
- Enumerated live vs incidental mirror references (README, docs/architecture.md, architecture/README.md, the 10 rule self-headers, two ontology/docs citation paths = live; AZ-glossary/archive/sources/code-comments = historical, left).
- Skills present: bok/mos/platform/taxonomy (knowledge → manifest skill units) + new-fe-feature/finish-fe-feature (workflow → not manifest).

## Key design decisions in the plan

- Manifest `path:` units target `rules/<f>.md` (not `.claude/rules/...` as the shipped worked example shows) because the mirror is removed.
- The two collision files are **excluded** from the manifest to avoid double-emission; documented in the manifest header.
- Routed the `.yaml` manifest (Step 3) + ontology-gotchas extraction (Step 2b) to **ontocoder** per fusion routing, deviating from the dispatch's "coder for all" — flagged with a single override point.

## Status

Plan is Draft, ready for the plan gate (conceptrev on the two diagrams, then user approval). I did NOT dispatch any executor — execution is the user's/orchestrator's call after approval.

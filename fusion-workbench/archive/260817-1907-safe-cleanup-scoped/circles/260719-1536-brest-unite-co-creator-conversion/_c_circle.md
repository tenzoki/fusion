# B-rest — unite-co-creator reference conversion (context-loading dogfood)

---
**Domain:** code
**Status:** closed
**Filed by:** orchestrator (severed from the v5.x umbrella Circle at its closure, 2026-07-19)
**Active spec/plan:** 260719-1917_*_unite-context-loading-conversion.md (cites master-plan Circle B 5–8)
**Active session history:** 260719-1632-orchestrator-session.md

---

## Directive

Apply Circle B's context-loading mechanism to the `unite-co-creator` project (a separate repo at `/Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator`): deduplicate its 12 rule files that are byte-identical across `./rules/` and `.claude/rules/` onto one canonical home each; author its `./rules/context-manifest.yaml` tagging each surviving rule file and each `unite-*-sc-skill` by agent and topic; rewrite its `CLAUDE.md` to a lean index. Prove the conversion with the acceptance runs (topic-scoped exclusion observable, cross-topic pull, no-regression, lean index).

## Grounding snapshot

The fusion-side mechanism already shipped: `bin/fusion-rules` topic argument + manifest block, `rules/context-manifest.md` + `rules/context-lean-claude-md.md` conventions (v5.1.0, commit `4620837`). This Circle is the downstream dogfood proof on a consuming project; it produces no fusion-plugin artifacts — all edits land in the `unite-co-creator` repo.

Cites (Origin Rule — reach is cited, not copied):
- v5.x master plan Circle B steps 5–7: `260718-1001_*_master-plan-fusion-v5x-overhaul.md`
- The context-manifest convention: `rules/context-manifest.md`, `rules/context-lean-claude-md.md`

## Dependencies

- Circle B mechanism (shipped, v5.1.0). No open blockers.
- Independent of the Plane Circle.

## Turn log

- Turn 1 (session 260719-1632-orchestrator-session.md): unite commits `a957bd30..2e9abf30` (migration + 5 conversion steps); Coherence verdict **coherent**; session history: `260719-1632-orchestrator-session.md`. One reverted mis-step (dedup premise false) corrected before any commit.

## Closure note

Closed **coherent** on 2026-07-19. The unite-co-creator context-loading conversion is complete and proven (9/9 acceptance checks, evidence at `260719-2045-step6-acceptance-evidence.md`). Artifact lives in the `unite-co-creator` repo across 6 commits: all 12 rules consolidated to a single lowercase `rules/` home, `.claude/rules/` mirror removed, `rules/context-manifest.yaml` (16 units) drives per-agent/per-topic loading, `CLAUDE.md` reduced 43,145 → 8,504 bytes (80%). Reconciler verdict + three-edge Coherence in `260719-1632-orchestrator-session.md` `## Coherence`. The plan's original Step 5 (dedup-by-deletion) was corrected mid-flight — unite had no tracked duplication (`.claude/rules/` was a gitignored mirror); see decision `260719-1856_*_unite-rules-mirror-vs-dedup-premise.md`.

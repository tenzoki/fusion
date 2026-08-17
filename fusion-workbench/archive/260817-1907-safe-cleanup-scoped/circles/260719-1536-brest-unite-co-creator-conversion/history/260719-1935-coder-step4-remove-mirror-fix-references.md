# Coder — Step 4: remove `.claude/rules/` mirror + fix stale references

**Date:** 2026-07-19
**Circle:** 260719-1536-brest-unite-co-creator-conversion
**Plan:** `planning/260719-1917_o_unite-context-loading-conversion.md` Step 4
**Target repo (`$U`):** `/Users/kai/Dropbox/qboot/projects/F03_digital-leadership/unite-co-creator` (branch `main`, separate from fusion source repo)
**Status:** Complete

## What was done

Removed the always-on `.claude/rules/` mirror mechanism and repointed every live stale reference to the canonical repo-root `rules/`. Steps 1–3 (consolidation, gotchas extraction, manifest) were already committed on `$U` (`3876e0c0`, `1e9b5649`, `06734571`); this step builds on that ground truth. All line numbers were re-verified before editing (files had shifted from the plan's cited numbers).

### Files edited (all in `$U`, staged, not committed)

- `Makefile` — deleted the `mirror-rules` target + its 7-line rationale comment (former 618–628).
- `.gitignore` — kept `.claude/*` ignored; rewrote the comment block to drop the "rules/ is a mirror of RULES/ (make mirror-rules)" rationale and state that rule bodies now live git-tracked in `rules/` and load via `rules/context-manifest.yaml`.
- `README.md` — two entries: `.claude/rules/` SoT line → canonical `rules/` loaded selectively via the manifest; `CLAUDE.md` pointer `.claude/rules/` → `rules/`.
- `docs/architecture.md` — "Authoritative source: RULES/ (mirrored to .claude/rules/ via make mirror-rules)" → "Authoritative source: rules/ … loaded selectively via rules/context-manifest.yaml"; index pointer → `rules/RULES-INDEX.md`.
- `architecture/README.md` — rewrote the two live-mechanism lines (bullet 7 edit-discipline; the "originals at .claude/rules/" source line) to name repo-root `rules/` as the single canonical home with no mirror/cp step.
- `ontology/docs/_ontology-meta-elements.md` — citation prefix `.claude/rules/ONTO-ENG-RULES.md` → `rules/`.
- `ontology/docs/multi-track-plan-schema.md` — two citation prefixes `.claude/rules/{CO-CREATOR-DEV,ONTO-ENG}-RULES.md` → `rules/`.
- `rules/` — 9 rule-file HTML-comment headers (`ARCHITECTURE-RULES`, `CENTRAL-DEV-RULES`, `CO-CREATOR-DEV-RULES`, `CODING-HYGIENE`, `FE-DESIGN-RULES`, `LICENSE-POLICY`, `NORMATIVE-MATERIAL-POLICY`, `ONTO-ENG-RULES`, `RULES-INDEX`): replaced the "Mirror: cp … make mirror-rules" block with "Single canonical home. fusion agents load this selectively via rules/context-manifest.yaml; there is no .claude/rules/ mirror."
- `rules/coding-frontend.md` — the two mirror-instruction lines (body, not header): "read from RULES/, mirrored to .claude/rules/" and the "Edit discipline / run make mirror-rules" block → canonical `rules/`, no mirror step.
- Deleted the physical (gitignored) `.claude/rules/*.md` files; directory left empty.

`READER-ABSTRACTION-RULES.md`, `GO-GOTCHAS.md`, `ONTOLOGY-GOTCHAS.md` carried no mirror header — nothing to change.

### Acceptance (all pass)

- `grep -rIn mirror-rules … | grep -v archive | grep -v sources` — only live-zone hit is `CLAUDE.md:69` (Step 5's scope, explicitly out of Step 4). All other hits are under `fusion-workbench/`, `impex/`, and one dated `docs/frontend/plans/` file — historical records.
- `make -C $U mirror-rules` → `No rule to make target 'mirror-rules'`.
- `.claude/rules/` file count = 0 (EMPTY).
- `git grep 'make mirror-rules' -- README.md docs/architecture.md architecture/README.md 'rules/*.md'` → no match (exit 1).

### References judged historical and LEFT (with justification)

- `architecture/README.md:45,58–60` — plan listed these as fix targets, but on-disk verification shows `architecture/RULES/` (the snapshot folder they describe) **does not exist**, and the cited source `.claude/rules/ontology-rules-guidelines.md` is a long-gone pre-split monolith. These are historical provenance of a defunct snapshot set; repointing to `rules/ontology-rules-guidelines.md` would fabricate a nonexistent path. Left, matching the plan's own LEAVE criterion ("pre-consolidation files that no longer exist"). Only the two genuinely live-mechanism lines (7, 80) were fixed.
- `rules/investigator-capture-layout.md:52` — cites `.claude/rules/ontology-rules-guidelines.md` as a per-rule expansion pointer. Not a mirror header; the plan directed "do not otherwise change rule bodies." Left (pre-existing stale citation, follow-up candidate).
- Rule-body provenance paragraphs ("Promoted from `.claude/rules/X` on 2026-05-05 during the .claude/rules ↔ architecture/RULES consolidation") in `CODING-HYGIENE.md`, `NORMATIVE-MATERIAL-POLICY.md`, and the "architecture/RULES/ is now authoritative; .claude/rules/ is the mirror" notes in `CENTRAL-DEV-RULES.md`/`CO-CREATOR-DEV-RULES.md`/`ONTO-ENG-RULES.md` — historical body prose, out of the "header mirror instruction" mandate. A couple are now stale and could be swept in a follow-up.
- `architecture/AZ-glossary.md`, `architecture/archive/*`, `architecture/sources/*`, `impex/**`, `fusion-workbench/**` — historical provenance (explicitly on the plan's DO-NOT-TOUCH list or of the same nature).
- `CLAUDE.md:69,53` — Step 5's responsibility; not touched.

### Notes

- Working tree left staged (`git add -A` on `$U`) per the dispatch's "Stage is fine"; not committed.
- In-block coherence deferred: `docs/architecture.md:27–34` and much of `architecture/README.md` still cite uppercase `RULES/` paths (resolve on the case-insensitive macOS FS). Step 1 deliberately left doc citations alone; kept that boundary. Follow-up candidate for a case-sensitivity sweep.

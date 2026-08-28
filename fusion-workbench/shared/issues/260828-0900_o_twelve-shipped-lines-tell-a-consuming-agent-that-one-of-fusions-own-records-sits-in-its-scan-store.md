Twelve shipped lines tell a consuming agent that one of fusion's own records sits in its `$SCAN_*` store
---
Seven shipped files cite a fusion decision or issue as being "in `$SCAN_DECISIONS`" or "under `$SCAN_ISSUES`". `bin/fusion-paths` resolves those keys to the consuming project's stores, the ten records named exist only in fusion's own `fusion-workbench/`, and `install.sh:82-83` copies no workbench. In every consuming project each line points an agent at a store that holds nothing, and the agent proceeds without the Grounding it was told to load.
---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Related:** `shared/analyses/260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md` (Instance 2); `shared/issues/260828-0828_*_fusion-citation-bookkeeping-defect-report.md` (the consumer report, instance 2); `shared/analyses/260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` (shipped stamps are provenance by design; did not examine this phrasing)

The lines: `agents/orchestrator.md:92,171,532,574,815`; `skills/archive/SKILL.md:142,290`; `agents/curator.md:115`; `agents/planner.md:160`; `skills/next/SKILL.md:167`; `rules/fusion-workbench-conventions.md:218`; `rules/review-contract.md:45`. Records: `260827-1330`, `260809-1731`, `260827-1120`, `260827-1310`, `260817-1613`, `260811-1534`, `260827-0745`, `260813-0858`, `260827-1056`, `260810-1205`.

No gate sees this: the reference-resolution lint reads the stamp beside the key as `stamp-bare`, which it never judges, and `$SCAN_*` is not a root it resolves.

The fix waits on one answer (Q2 of the analysis): whether shipped record citations are provenance or pointers. If provenance, each line drops the key and says the record is fusion's own; if pointers, they cannot be followed from any consuming project and the substance must be pulled into the text.

Acceptance: `grep -nE '[0-9]{6}-[0-9]{4}.{0,80}(in|under) .\$SCAN_' rules/*.md agents/*.md skills/*/SKILL.md README*.md CLAUDE.md` returns nothing, and the reference-resolution baseline is re-approved if it moves.

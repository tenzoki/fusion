Twelve shipped lines tell a consuming agent that one of fusion's own records sits in its `$SCAN_*` store
---
Seven shipped files cite a fusion decision or issue as being "in `$SCAN_DECISIONS`" or "under `$SCAN_ISSUES`". `bin/fusion-paths` resolves those keys to the consuming project's stores, the ten records named exist only in fusion's own `fusion-workbench/`, and `install.sh:82-83` copies no workbench. In every consuming project each line points an agent at a store that holds nothing, and the agent proceeds without the Grounding it was told to load.
---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Related:** `260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md` (Instance 2); `260828-0828_*_fusion-citation-bookkeeping-defect-report.md` (the consumer report, instance 2); `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` (shipped stamps are provenance by design; did not examine this phrasing)

The lines: `agents/orchestrator.md:92,171,532,574,815`; `skills/archive/SKILL.md:142,290`; `agents/curator.md:115`; `agents/planner.md:160`; `skills/next/SKILL.md:167`; `rules/fusion-workbench-conventions.md:218`; `rules/review-contract.md:45`. Records: `260827-1330_*_does-the-session-ask-for-its-directive-first-and-wait-silently.md`, `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md`, `260827-1120_*_how-often-does-the-review-pass-run.md`, `260827-1310_*_does-the-coherence-gate-ask-when-its-own-verdict-is-ok.md`, `260817-1613`, `260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`, `260827-0745_*_may-the-curators-evidence-pass-be-bounded-by-its-own-previous-run.md`, `260813-0858`, `260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md`, `260810-1205`.

No gate sees this: the reference-resolution lint reads the stamp beside the key as `stamp-bare`, which it never judges, and `$SCAN_*` is not a root it resolves.

The fix waits on one answer (Q2 of the analysis): whether shipped record citations are provenance or pointers. If provenance, each line drops the key and says the record is fusion's own; if pointers, they cannot be followed from any consuming project and the substance must be pulled into the text.

Acceptance: `grep -nE '[0-9]{6}-[0-9]{4}.{0,80}(in|under) .\$SCAN_' rules/*.md agents/*.md skills/*/SKILL.md README*.md CLAUDE.md` returns nothing, and the reference-resolution baseline is re-approved if it moves.

---
Reconciled 260828-0907 (session 260828-0846-orchestrator-session.md, HEAD ffc6ae88): still open, and the count is low. All twelve listed lines verified on disk. Four more lines of the same shape stand in `agents/orchestrator.md:435,511,516,550` (decisions `260807-2131_*_which-language-governs-a-customer-deliverable.md`, issue `260810-1535_*_the-orchestrators-commit-procedure-truncates-any-message-containing-an-apostrophe.md`, decisions `260824-2013`, `260815-2109`, each "in/under `$SCAN_*`"), so the defect is sixteen lines in seven files at HEAD. The acceptance grep matches fourteen of them: it finds the four unlisted lines and misses two listed ones (`skills/archive/SKILL.md:142`, `skills/next/SKILL.md:167`), whose slugs exceed its 80-character window; widen `.{0,80}` to `.{0,160}` before reading its empty result as done. Filed as `shared/issues/260828-0907_*`.

Reconciled 260828-1001-reconciliation.md (HEAD 7bc0e78e): the corrected count in the note above is still low; the widened grep matches twenty-one lines, the further five all in `agents/orchestrator.md:33,148,398,709,1008`. Detail on `shared/issues/260828-0907_*`, reconciliation note of 260828-1001-reconciliation.md.

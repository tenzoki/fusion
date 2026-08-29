The archive safety filter greps the literal basename and cannot match the wildcard citation form the rule mandates
---
`skills/archive/SKILL.md:193-201` (filter 3) keeps a candidate out of a sweep when `grep -r -l -F -e "$bn" -e "$rel"` finds its basename or relative path in the shipped text. `$bn` carries the live marker (`260811-1534_*_...`); the form `rules/fusion-workbench-conventions.md` `## Filename Patterns` mandates spells `_*_` at that position, and `grep -F` matches no wildcard. So every record cited the way the rule says to cite it is invisible to the filter that exists to keep cited records out of the archive.
---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Related:** `260828-0859-citation-bookkeeping-defect-report-measured-against-fusions-own-corpus.md` (section "The archive safety filter cannot see the mandated citation form"); `260827-1756_*_which-citation-corpus-does-the-archive-safety-filter-protect.md` (defines the corpus the filter reads, not the match); `260827-2042_*_the-archive-citation-corpus-reads-a-source-root-set-in-another-shell-and-collapses-silently-to-claude-md-rules-and-the-system-bin.md` (the previous defect in the same step)

Measured 2026-08-28 at HEAD `19b58eef` by simulation over the 863 live marked records against the filter's own corpus (`rules/ agents/ skills/ README*.md CLAUDE.md hooks/lib/*.ts hooks/*.ts bin/* docs/`): 1 record is found by literal basename or path, 75 are cited only in the wildcard form and would be swept. No archived record is currently cited in that form from the shipped text, so the miss has not been realised yet; the tier-1 sweeps to date happened to take uncited records. Not verified by running the skill.

Fix shape: build the key from the basename with the marker position generalised (`grep -E "<stamp>_[a-z*]_<slug-escaped>"`), or search for the stamp and the slug as two fixed strings on one line. Add a probe to the skill that a scratch record cited in `_*_` form from a scratch corpus is reported as kept.

Acceptance: the simulation above finds 0 records cited only in wildcard form that the filter would not keep; the skill's own probe passes.

---
Reconciled 260828-0907 (session 260828-0846-orchestrator-session.md, HEAD ffc6ae88): still open. `skills/archive/SKILL.md:199` builds `bn` from the live basename and runs `grep -r -l -F -e "$bn" -e "$rel"`; no marker generalisation. Simulation figures (75 / 863) not re-run this pass.

Resolved: f1099c5f — `skills/archive/SKILL.md` filter 3 derives one `grep -E` key from the basename with the marker generalised to `_[a-z*]_`; `hooks/lib/__tests__/archive-filter-key.test.ts` runs the skill's own `key=` derivation and asserts it matches `_*_` and `_c_` spellings and not a neighbouring stamp.

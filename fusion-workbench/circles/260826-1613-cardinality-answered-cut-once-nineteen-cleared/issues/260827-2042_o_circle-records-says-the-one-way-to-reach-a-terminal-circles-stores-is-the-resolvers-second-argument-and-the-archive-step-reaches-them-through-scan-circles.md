circle-records says the one way to reach a terminal Circle's stores is the resolver's second argument, and the archive step reaches them through $SCAN_CIRCLES

---
`rules/circle-records.md:65`: "`bin/fusion-paths` resolves no `SCAN_*` key to a terminal Circle's stores; the one way to reach them is to name the Circle as the resolver's second argument." `skills/archive/SKILL.md:187` (`open_in()`, same range) reads `$WORKBENCH/$SCAN_CIRCLES/<dir>/issues` for exactly those stores, and tier 1 moves the directory through the same key. The first clause is true (no key's value names a terminal store); the second is not.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_do-archive-and-terminal-circles-stores-enter-any-scan-set-or-is-the-exclusion-written-down.md` (option 5); commits `38dc63e`, `d1489cc`

## Fix direction

Drop "the one way": "they enter a scan set only when a run names the Circle as the resolver's second argument; a consumer walking `$SCAN_CIRCLES` itself reaches them and is bound by the terminal-states statement above."

## Acceptance

The paragraph makes no claim the archive skill's own block contradicts.

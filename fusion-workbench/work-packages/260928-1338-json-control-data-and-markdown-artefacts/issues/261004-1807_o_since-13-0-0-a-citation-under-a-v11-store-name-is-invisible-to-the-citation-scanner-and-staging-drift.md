Since 13.0.0 a citation under a v11 store name is invisible to the citation scanner and staging drift
---
Step 10a emptied `WINDOW_LEGACY_NAMES` (`hooks/lib/stores.ts`). `WINDOW_LEGACY_RECORD_STORES` and `CONTAINER_ROOT_NAMES` derive from it, so both are now empty of v11 names. `hooks/lib/citation-scan.ts` builds its store-segment alternation (`STORES`) and its container roots from them, and `hooks/lib/staging-drift.ts` builds its `STORES` the same way. A `circles/<dir>/…`, `shared/planning/…` or `shared/consult/…` citation in a live narrative is therefore no token at all: neither `store-prefixed` nor dangling. `/fusion:migrate` renames the directories and rewrites no record, so every such citation a v11 workbench carried survives its migration and drops out of every check.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 261004-1807-reviewer-fj04-closing-pass-over-the-legacy-migration.md

**Evidence.**
- `createScanner(wb).scanCitationTokens` from `hooks/dist/lib/citation-scan.js`, over a probe line citing a package record under the v11 container root (`see circles/<dir>/<dir>.md here`, with a real stamped directory name in the probe): one token at `1fda4088`, an empty list at `9232314a`. The same line with `work-packages/` or `shared/backlog/` gives a token at both.
- `hooks/lib/stores.ts` documents `WINDOW_LEGACY_RECORD_STORES` as "the record stores' legacy names, for the segment lists that must still recognise them". `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` keeps `backlog` in both lists "so a citation of an archived entry is still read as store-prefixed rather than becoming invisible", and `## Filename Patterns` says a citation carrying a store segment "is a violation the checks report".
- Step 10a's tests moved the old form out of coverage: `citation-grammar-boundaries.test.ts` and `citation-sweep.test.ts` replaced `circles/` with `work-packages/`, and `staging-drift.test.ts` now expects the v11 paths `unclassified`.
- This repository's workbench holds 14 live (`_o_`, `_p_`, `_a_`) records containing the string `circles/` (`grep -rl` at `9232314a`). A v11 consuming project holds more.

**Acceptance.** `citation-scan.ts` and `staging-drift.ts` take their v11 segment and root names from `V11_STORE_NAMES` (which outlives the window), not from the emptied window table, so a `circles/…` or `shared/planning/…` citation is reported `store-prefixed` again. `citation-grammar-boundaries.test.ts` regains one case for each v11 form. `WINDOW_LEGACY_RECORD_STORES`'s comment then matches what it holds, or the export goes.

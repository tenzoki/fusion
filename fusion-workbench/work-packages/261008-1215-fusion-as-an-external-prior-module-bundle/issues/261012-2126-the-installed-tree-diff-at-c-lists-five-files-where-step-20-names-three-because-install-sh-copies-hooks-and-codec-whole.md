The installed-tree diff at C lists five files where step 20 names three, because install.sh copies hooks/ and codec/ whole
---
Plan step 20 accepts an installed-tree diff between `v13.0.0` and the candidate that lists `.claude-plugin/plugin.json`, `README-agents.md` and `README.md` "and nothing else". At `c8d5a6f1fa9633796a9b9cc0df83fd5fe1eec14c` the diff lists five: those three plus `hooks/lib/__tests__/reference-resolution-lint.test.ts` (the citation-count pin the plan's fourth stop clause permits) and `codec/fixtures/prior/REQUESTS.md` (the one file the same step's codec clause permits). `install.sh` lines 84 to 87 copy `hooks` and `codec` as whole directories and exclude only `node_modules`, so every change those two clauses permit reaches the installed tree. The acceptance text and the copy list cannot both hold at any candidate that carries a request to Prior.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261012-2126-candidate-c-verification.md`, `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md`

Evidence: `261012-2126-candidate-c-verification.md` finding 1, the verbatim `diff -rq` of the two installed trees, with each hunk described. Neither extra file is read by an agent, a skill, a hook at run time or a `bin/` helper; one is a vitest source, the other a fixture document.

Two resolutions, one ruling: amend step 20's acceptance to name the copy loop's consequence (tests and fixtures under `hooks/` and `codec/` may differ where another clause permits the change), or amend `install.sh` to exclude `hooks/lib/__tests__` and `codec/fixtures` and move the candidate past C. The report recommends the first for this release.

Acceptance: the plan's step 20 acceptance and `install.sh`'s copy list agree, so that the diff of two installs taken as the report took them is exactly the list the acceptance names.

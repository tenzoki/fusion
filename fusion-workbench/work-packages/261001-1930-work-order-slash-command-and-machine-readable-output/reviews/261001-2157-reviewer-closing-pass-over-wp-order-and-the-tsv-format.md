# Closing review: /fusion:wp-order and `bin/fusion-work-order --format tsv`

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `cfbc12dc..df38a5dd`
**Not-opened:** `hooks/dist/lib/work-graph.d.ts`, `hooks/dist/lib/work-graph.js`, `hooks/dist/order.d.ts`, `hooks/dist/order.js`
**Review domain:** code
**Work-item:** 261001-1930-work-order-slash-command-and-machine-readable-output
**Reviewed against:** 261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md (C1, C2, C3), 261001-1955_*_plan-work-order-slash-command-and-tsv-output.md

The four `hooks/dist/` files were not opened. They were checked by gate instead: `npm test` at `df38a5dd` (60 files, 1 015 tests, green) runs the committed-dist check, and `git status` afterwards shows no change under `hooks/dist/`. The two workbench-record files in the range (the event log's appended rows and the PRIOR package's closure note) were opened and carry nothing in the code domain.

## Summary

The helper meets C2 clause by clause. I checked this against a scratch store built for it, not only against the suite. The text path is byte-identical to the `cfbc12dc` build. The head-room raise is +23, within the user's 40-line grant, and no baseline moved. The defects are in the skill's rendering instructions (one Medium, one Low), in test coverage (Low) and in two sentences of wording (Low). Nothing here blocks the release.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 |
| Low | 3 |

## Verified, no finding

- **C2 layout and comment order.** `renderTsv` in `hooks/order.ts` emits `#format=1`, `#anchor`, the eight counts in the spec's order, `#verdict`, `#note` (same predicate as the text path: `noDependsOnField > 0 || unresolvedEdges.length > 0`), then `#unreadable=`. Then the ten-column header, printed on an empty store too. I ran it over a scratch store with three cycles (one a self-edge), an unreadable record, a `paused` item with an empty field, unresolved entries including a `done` target and a literal tab, and a duplicate entry. Results: every line ends in LF (`cat -vet`); `awk -F'\t'` gives 10 fields on every non-comment line; cycles are numbered 1, 2, 3 in `cycle=` print order; the self-edge is a cycle of one; the `unresolved` cell is ascending and de-duplicated while `depends-on` keeps the duplicate as written; the tab is written `\t`.
- **`#note=` parity.** The value is `caveat(...)` with its `note=` prefix sliced off. It is the same function the text path calls. The suite pins this by deriving the expected `#note=` from the text run.
- **Escaping order.** `esc()` replaces the backslash first, then tab, CR, LF. CR and LF can't reach a cell: `headBlock` splits on LF and `headField` trims.
- **`field`.** `dependsOnField: raw !== null` in `hooks/lib/work-graph.ts`. `headField` returns `""` for an empty `**Depends-on:**` line, so empty reads `present`. That matches C2. It is the only library change, and it is additive.
- **Byte-identity of the text path.** No code line of the text path changed in the diff. The old `hooks/dist/order.js`, extracted from `cfbc12dc`, and the new build, with no argument and with `--format text`, give identical output (`cmp`) over the scratch store.
- **Exit codes and empty stdout.** Usage errors (`--format` alone, `json`, `--format=tsv`, a repeated `--format`) exit 1 with empty stdout. No workbench exits 2 with empty stdout. The wrapper's exit 3 comes before node. Stdout is written once, at the end.
- **Header as a consumer contract.** `hooks/order.ts` `## The TSV format` covers layout, every key, every column with its absent and empty renderings, list encoding, escaping, orderings, exit codes and compatibility. A consumer can be written from it. I found no mismatch with the implementation.
- **Head-room.** `TEST_LINE_HEAD_ROOM` went from 3 030 to 3 053, +23. Measured: 22 281 lines under `hooks/lib/__tests__/`, which equals 19 228 + 3 053. `git diff --numstat`: the test file +23/−0, `surface-growth-bound.test.ts` 5/5, `reference-resolution-lint.test.ts` 1/1. No `*_BASELINE` entry changed. The golden is the per-file inventory the spec told the work to regenerate, not a baseline. The README-hooks log entry ("four cases and two shared constants", +23, zero left) matches the test file (`COLS`, `COUNTS`, four new `it` blocks).
- **Skill guardrails.** `skills/wp-order/SKILL.md` is 4 197 bytes, under the 6 000 ceiling. It calls the helper only through `$FUSION_PLUGIN_ROOT`. It has the `[ -x ]` guard, reports exits 1, 2 and 3 separately, and forbids reordering, recommending, writing, asking and dispatching.
- **README-agents.** The skill-table row and the roster sentence are present. The enumeration lint passes.

## Findings by theme

### The skill's rendering instructions

**M1, Medium: `verdict=empty` drops the `unreadable=` rows.** `skills/wp-order/SKILL.md` `## Step 3: render`: "Say there are no live work packages, and stop." A store whose only package has an unreadable status prints `verdict=empty` plus `unreadable=<item>` (reproduced at `df38a5dd`). This breaks C1 ("every … unreadable-record row the helper printed is named"). It also defeats the purpose `hooks/lib/work-graph.ts` gives the row: telling "no live items" apart from "one live item this module could not read". Issue: `261001-2157_*_wp-order-stops-on-verdict-empty-and-drops-the-unreadable-rows-the-helper-printed.md`.

**L1, Low: the explanation of unresolved entries leaves out a case.** Item 4 has two cases (finished item, nothing). The helper's header and `note=` have three: an entry naming live work in a non-grammar form is the reason the caveat exists. The per-row sentence reassures where the `note=` line warns. Issue: `261001-2157_*_wp-order-explains-an-unresolved-entry-as-blocking-nothing-and-omits-the-case-the-note-line-exists-for.md`.

### Test coverage of the TSV contract

**L2, Low: four clauses could regress with the suite green.** Cycle numbering beyond one cycle, the `#unreadable=` lines, a multi-entry `unresolved` cell and tab escaping are not exercised. A repeated `--format` is claimed in the header but not tested. The hook-test surface is at zero margin, so the issue suggests widening the existing literal fixture instead of raising again. Issue: `261001-2157_*_the-tsv-tests-leave-cycle-numbering-unreadable-lines-and-tab-escaping-unpinned.md`.

### Wording

**L3, Low: two false sentences.** `README-hooks.md` `order.ts` row: "and by nothing else". The next sentence names a program reader. `skills/wp-order/SKILL.md`: "the computation in `hooks/order.ts`". The computation is `hooks/lib/work-graph.ts`. Issue: `261001-2157_*_two-sentences-about-the-work-order-helper-are-false-after-the-tsv-format-shipped.md`.

## Cross-cutting observations

- **The `KEY=value` summary list exists twice in `hooks/order.ts`**: once in `renderTsv` and once in `main`'s text path, with `ready` and `roots` computed in both. The plan chose this ("leave the text path's code untouched") to protect byte-identity, and the copies agree today. A key added to one path and not the other would break the "same computation" promise, and only `#note=` parity is pinned by test. I filed no issue: the duplication was planned. A shared summary builder would make parity structural if `order.ts` is touched again.
- **The acceptance grep of closed issue `260916-0755_*_the-work-order-helper-is-named-bare-in-shipped-text-so-a-consuming-project-reader-resolves-nothing.md` returns four hits again**, all in `skills/wp-order/SKILL.md`. All four use the helper's name as a name, not as something to run, which that issue's `Resolved:` reasoning accepts. `skills/news/SKILL.md` uses the same form for `bin/fusion-forum`. So this is not a defect, but that grep can no longer serve as a regression check.
- **Release state.** `df38a5dd` is the 12.1.0 release commit, but `git tag -l 'v12*'` lists only `v12.0.0` and `v12.0.1`. The package's end state (released version) is not reached yet. The plan names tagging as the orchestrator's act at the user's word.

## Recommended sequencing

None of the findings blocks the release. M1 and L1 are small edits to the skill body and can go into one patch release together with L3. L2 needs either a line-neutral widening of the fixture or a head-room decision by the user.

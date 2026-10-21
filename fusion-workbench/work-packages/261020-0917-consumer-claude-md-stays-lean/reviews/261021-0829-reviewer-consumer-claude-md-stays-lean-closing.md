# Closing review: a consuming project's CLAUDE.md stays a pointer file

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `74bc9661..8c3e046e`
**Not-opened:** `hooks/lib/__tests__/fixtures/rules-emission.golden`, `hooks/lib/__tests__/fixtures/surface-growth.golden`
**Domain:** code
**Work-item:** 261020-0917-consumer-claude-md-stays-lean
**Reference:** `261020-0927-plan-consumer-claude-md-stays-lean.md` (approved 2026-10-20: D1 option 2, D2 option 1, D3 option 4, D4 option 3, step 8 flag kept)

The two golden fixtures are regenerated output. They were checked only through the green suite, not read. The six `hooks/dist/` files were not read line by line. Each one was compared byte for byte against a fresh `tsc` build of the sources into the scratchpad, and all six are identical.

## Summary

The session-start code is correct and fails open on every branch tested. The due semantics are moved verbatim from setup's former inline block. A session outside any workbench sees nothing new. The suite is green (1194 passed, 14 skipped). Two prompt-side defects sit on the placement route, which is this package's core use case: the curator's net-byte-delta formula misreads relocations, and the new consumer-relocation subsection claims a manifest hold that the curator's apply procedure does not perform. Verdict: **revise**.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 2 |
| Low | 3 (2 filed, 1 closure note) |

## Findings by theme

### A. The placement route's prose against the curator's mechanism

**A1. Medium: the net byte delta reads a relocation's After block as the source's new text.**
`agents/policy-curator.md` `### Blast-radius stop` (added in `8c3e046e`) defines the delta as "After minus Before bytes over its entries". `### Ledger entry schema` defines a relocation's After block as "the text the destination must carry". So on a placement run the `CLAUDE.md` delta comes out near 0. On krk's file the real figure is about -124 000 bytes. The 1.5x write-back clause never fires on a relocation either. A deletion's `(deleted)` sentinel has no stated byte value.
Fix direction: define the delta per entry kind. A relocation contributes pointer minus Before to the source and +After to the destination.
Issue: `261021-0829-curator-net-byte-delta-reads-a-relocations-after-block-as-the-sources-text.md`.

**A2. Medium: a relocation into a manifest-loaded `./rules/` file is cut at the source with no hold.**
`rules/context-lean-claude-md.md` `### Relocating in a consuming project` says an entry whose destination is "the manifest" stays `stale` until a data-implementer writes it. The manifest is never a ledger `Destination:`. The destination is `./rules/<topic>.md`. That file is inside the curator's surfaces (`agents/policy-curator.md` `## Scope`), so `### Pass 2` step 3 writes it and step 4 cuts the source. Registration is exclusion 4. `bin/fusion-rules` emits a project `./rules/` file only by pattern word or by manifest unit, and Claude Code never loads `./rules/`. The passage can therefore end up read by nobody.
Fix direction: hold the cut until the file is reachable, or name only destinations the curator can make reachable.
Issue: `261021-0829-relocation-into-a-manifest-loaded-rule-file-is-cut-at-the-source-with-the-manifest-entry-unwritten.md`.

Verified true in the same subsection:
- The curator writes `./rules/` and `.claude/rules/` files, never a header or the manifest: `## Scope` and exclusions 4 to 6.
- A header destination is held `stale` with a filed issue: `## Reporting work you may not do`, third bullet.
- The blast-radius figure is a fifth, counting relocations in full: `### Blast-radius stop`.
- The five pattern words `coding`, `ontology`, `normative`, `verb`, `analyst` match `bin/fusion-rules`'s `PATTERNS=` block, and `.claude/rules/` is globbed by pattern.

### B. Session start and the due computation (no defect in behaviour)

All of the following were verified by reading and by probes in the scratchpad.

- **Fail-open.** In `claudeMdWeightLine` (`hooks/session-start.ts`), a helper that sleeps 8 s was killed at the 2 s timeout: the hook returned in 2.08 s with the due line and no weight line. A helper that exits 3 gives no line (test). A missing helper (ENOENT) and an unreadable `plugin.json` (`pluginVersion` → null) give no line. Garbage `.check-stamps` (`[1,2`) makes every selector due, as before.
- **No workbench.** `root === null` short-circuits both new functions. A probe in `/tmp` printed `{}`. The existing test "stays silent when there is no workbench" still holds.
- **`{}` with no line.** `emitEnvelope` filters nulls and writes `{}` when nothing is left (`hooks/session-start.ts`, `emitEnvelope`). The `failOpen` tail still writes `{}` when the envelope was never written.
- **Due semantics.** `dueSelectors` in `hooks/lib/checks-due.ts` carries the same predicate as `git show 0ed1b765:skills/setup/SKILL.md`: `!e || e.version !== v || !(now - Date.parse(e.at) < 30 * 864e5)`. The selector list is unchanged and still held in set equality with the check table (`derivable-enumerations-lint.test.ts`).
- **Paths in a consumer.** The hook reads the version and the helper from `pluginRoot()`, which is `CLAUDE_PLUGIN_ROOT` and then `FUSION_PLUGIN_ROOT`. `/fusion:check` stamps from `$FUSION_PLUGIN_ROOT`, which the first SessionStart command exports from `CLAUDE_PLUGIN_ROOT`, so the two compare one version. The route path is `resolve(plugin, "rules", "context-lean-claude-md.md")`, an install path in a consumer. The helper's own last line resolves `$(dirname "$0")/..` the same way.
- **Setup Step 0.** The marker is still written only on change: the probe ran the block twice and got `marker=written`, then `marker=unchanged`. `marker-version-unresolved` still exits before the helper. The no-node branch still writes the marker by shell, and the helper then prints `unread (no node on PATH)`. `store-name-migration.test.ts` runs the shipped block end to end.
- **dist matches source**, as stated above.
- **Weight-line parse.** The helper prints rows largest first (`sort -k1,1nr`), so the first `over` row is the largest. The `clean` and `absent` shapes give `over=0` or no `over=` at all, and in both cases no line.

**B1. Low: the `unread` prose and the helper's exit table.**
`skills/setup/SKILL.md` Step 0 tells the model that every `unread` means a shell-fallback marker and no running hooks. Three of the four `unread` reasons have node present. The `bin/fusion-checks-due` header documents exit 1 for a usage error, but the wrapper ignores its arguments: `bin/fusion-checks-due x` exits 0. A node load failure exits non-zero, despite the header's "0 always".
Issue: `261021-0829-checks-due-helper-and-setup-prose-misstate-unread-and-exit-paths.md`.

**B2. Low: `README-hooks.md` drift.**
The SessionStart ASCII tree still says "Silent otherwise" without the weight line. The `**`hooks/`**` bullet names only the subdirectory warning.
Issue: `261021-0829-readme-hooks-session-start-summaries-omit-the-weight-line.md`.

Untested but verified by probe: the 2 s timeout branch has no test. This is noted, not filed. The branch is one `execFileSync` option, and the probe above exercised it.

### C. Test changes: none weakened

- `derivable-enumerations-lint.test.ts`: retargeted from setup's `SEL` to `CHECK_SELECTORS`. Same set-equality assertion, same failure text.
- `store-name-migration.test.ts`: takes the list from `CHECK_SELECTORS` and still runs the shipped setup block and asserts its exact stdout. That is end to end through `bin/fusion-checks-due`.
- `hook-route-exclusion.test.ts`: the exact `started` list gains `bin/fusion-claude-md-weight`. The list is still exact, so it is not loosened. The helper is plain shell and calls no codec route.
- `provenance-header-lint.test.ts`: retargeted to `rules/rule-file-provenance.md`, which still carries `Provenance:` five times, in the body as well. The vacuity guard (assertion 2) still holds.
- `claude-md-weight.test.ts`: clauses 4 and 5 tightened to the new text.
- `session-start-subdirectory.test.ts`: the at-root silence case now stamps every selector first. This is necessary, because the due line would otherwise fire, and it is not a loosening.

**C1. Low, closure note, not filed: two `BASELINE` re-approvals were not measured.**
`reference-resolution-lint.test.ts` records steps 5 and 7 as "Attributed by reading the added citations, not by swapping a live file". The plan's `## Where this work stops` asks for the swap measurement each time. The figures chain consistently from 2058/371 to 2089/377, and the gate is green. The orchestrator puts this departure to the user at closure.

### D. Prompt and rule prose: consistency checks that held

- No shipped sentence still claims a single writer. `grep -rnE 'only path to|one path to .CLAUDE|comes through you'` over `agents skills rules README*.md docs` returns nothing.
- The `CLAUDE.md:` token is shared by `agents/orchestrator.md` **Plan** step 6 and `agents/implementation-planner.md` `## Plan Output Format`.
- `--placement` is consistent across `skills/curate/SKILL.md` (arguments, Step 2, Step 6), `agents/policy-curator.md` `## Dispatch parameters` and `README-agents.md` `## Dispatch parameters`.
- `## Rule-file provenance` is cited by no shipped file. Only point-in-time workbench records name it.
- `agents/reviewer.md` item 9 cites `## A project's CLAUDE.md`, which resolves.

## Cross-cutting observations

- Both Medium findings share one pattern. Text written for the relocation case reuses a field or a destination that the curator's procedure defines differently: the After block, and the "destination". The subsection and the delta sentence were each drafted in the plan before step 8 and the subsection landed, and neither was checked against `### Pass 2` or `### Ledger entry schema`. A fix for either should read those two sections together.
- The session-start path has no such gap. Every branch the plan named was implemented and either tested or probed.

## Recommended sequencing

1. Before the 13.3.0 release: A1 and A2. Both mislead the user on a `--placement` run, which is what the session-start weight line now sends every over-threshold project to.
2. Cleanup, any time: B1 and B2.
3. At closure: C1, put to the user by the orchestrator.

The open decision `261021-0821-should-fusion-curate-turn-placement-on-by-itself-when-the-weight-helper-measures-a-section-over-threshold.md` appeared in the working tree during this pass and was not reviewed. If it is answered with auto-on, A1 and A2 then affect every curate run on an over file.

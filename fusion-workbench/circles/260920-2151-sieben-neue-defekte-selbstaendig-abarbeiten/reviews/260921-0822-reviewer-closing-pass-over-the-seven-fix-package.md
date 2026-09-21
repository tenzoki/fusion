# Closing pass over the seven-fix package and its version bump

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `b30ec2ea..9c7101aa`
**Not-opened:** none
**Review domain:** code
**Cross-references:** 260920-2151-sieben-neue-defekte-selbstaendig-abarbeiten.md, 260920-2228_*_seven-new-defects-worked-autonomously-with-a-second-opinion-each.md, 260920-2228_*_does-the-staging-classifiers-live-state-list-keep-rows-for-retired-surfaces.md, 260920-2216-reviewer-closing-pass-over-the-narrowed-work-item-bound.md

## Summary

Nine commits, twelve files outside the workbench. Each of the seven defect records' acceptance is met by the shipped text at `9c7101aa`, every heading anchor the range wrote resolves to a heading its target has, the `LIVE_STATE` membership is what the decision ruled, the golden and pin re-approvals match the measured diffs, `hooks/dist` is in step with source, and the suite is green. One Low text defect filed: the new `LIVE_STATE` comment guarantees a check over three classes that the case performs over one.

## Totals

Critical 0 / High 0 / Medium 0 / Low 1.

## Findings by theme

### The seven acceptances, each read against the file at HEAD

| Record | Acceptance point checked | Where | Result |
|---|---|---|---|
| `260918-1206_*` | `grep -n 'What this is' README-agents.md` empty; step 5 names `README-agents.md` `## The agents`; paragraph attributes each phrase to the lint | `README-agents.md:319-327`; `derivable-enumerations-lint.test.ts:164-171` has six `CLAIMS` rows, one per phrase the six bullets name | met |
| `260918-1234_*` | no `cat` through an empty root; `UNRESOLVED` branch; cites the helper's exit-2 paragraph | `skills/archive/SKILL.md:30-45`: three branches, read guarded on `-n "$FUSION_SRC"` and `-f`; `bin/fusion-source-root:20-28` is the cited paragraph | met |
| `260918-1250_*` | no comparable count, or a stamp; no row changed | `dispatch-path.baseline:40-41` stamps "at the 2026-09-09 arming"; `grep -c '^\['` still 11; only `#` lines in the diff | met |
| `260918-1334_*` | header names `## Review coverage` and `## Closing a work item` step 2; dist rebuilt; lib untouched | `hooks/review-coverage.ts:11-17`; `agents/orchestrator.md:322`, `:422` step 2, `:448` and `:460` for the third site; lib's stale lines stand and are filed as `260921-0709_*` | met |
| `260918-1335_*` | the two rows go with the paragraph, or the paragraph states `unclassified`; dist rebuilt; suite green | `staging-drift.ts:208-216` has neither row nor `portfolio.md`; the paragraph is gone; `classify()` at `:485-488` returns `unclassified` for a root leftover | met |
| `260918-1409_*` | a row per class L entry; no retired row in the class L span; dist rebuilt | `.checkout-id` `:210`, `.cadence-anchors` `:211`; `ROOT_RECORDS` sentence `:251-256` says `portfolio.md` left the layout | met |
| `260918-1410_*` | intro names no retired parameter; `grep -nE 'agents/[a-z]+\.md:[0-9]' README-agents.md` empty; pin re-approved | `README-agents.md:53` and the table cells; grep prints nothing; 28th entry on `reference-resolution-lint.test.ts:464` | met |

### Heading anchors written by the range

Every anchor resolves. `agents/orchestrator.md`: `## Agent Routing Table` (`:185`, the `**Deliverable language:**` prefix rule is `:201` under it), `### Shaping and planning, when the task needs them` (`:213`, the `**Executors:**` rule is `:230`), `## Review coverage` (`:322`, the helper call is `:327-328`), `## Closing a work item` (`:422`, step 2 takes the read), `## Ending the session` (`:448`, `:460` reads the section off the helper), `## Agents the Orchestrator Invokes` (`:587`, the editor row is `:598`). `agents/reconciler.md` `### Parameter parsing` (`:38`), `agents/planner.md` `## Parameter parsing` (`:46`), `agents/editor.md` `## Deliverable language — named in the dispatch, or you halt` (`:18`), `## Setup` once in each of the six Audience prompts. `README-agents.md` `## The agents` (`:19`, the three gated phrases are `:47` and `:49`, no heading between), `## Plugin structure` (`:179`, the phrase is `:183`), `CLAUDE.md` `## Layout` (`:24`), `README.md` `# fusion` (`:1`, `:3`).

### The class L case, traced against `rules/workbench-tracking.md:24`

`l.startsWith("| **L.")` matches line 24 and no other line (the R rows start `| **R1.` to `| **R3.`). `split("|")[2]` is the Entries cell; the backtick regex yields six tokens: `.session-marker`, `.checkout-id`, `.cadence-anchors`, `.commit-lock/`, `monitor`, `.guard-state/`. The four files hit `LIVE_STATE` at `staging-drift.ts:436-438`; the two directory probes (`.commit-lock/x`, `.guard-state/x`) hit `LIVE_PREFIXES` at `:439-441`. All six return `in-flight`. `pluginRoot` is exported by `helpers/citation-scan.ts:22`.

### `LIVE_STATE` membership against the decision

`260920-2228_a_*` ruled option 1: `LIVE_STATE` plus `LIVE_PREFIXES` is exactly classes L, R2, R3. At HEAD: L = `.session-marker`, `.checkout-id`, `.cadence-anchors`, `monitor` + prefixes `.guard-state/`, `.commit-lock/` (rule line 24, six entries, six rows); R2 = `orchestrator-events.jsonl` (line 22); R3 = `.fusion-setup`, `.asset-provenance` (line 23). Nine rows, nine rule entries, nothing else. Membership is what was ruled.

### Golden and pin re-approvals against the diffs

`surface-growth.golden`: `archive/SKILL.md 24473 -> 24328` (wc at both commits agrees), `staging-drift.test.ts 653 -> 639` (653 at `b30ec2ea`, 647 at `d5e2de65`, 639 at HEAD, the two commit messages' figures). `reference-resolution-lint.test.ts:464`: 27th entry 1680/290 -> 1681/294 (`5abadf32`), 28th 1681/294 -> 1680/305 (`258d5dae`), 29th 1680/305 -> 1681/305 (`97651091`); the chain is consistent and the constant is the 29th's figure. The 28th's token split (12 `path:line` tokens out, 11 file tokens in, 11 anchors in) matches the diff and is labelled as inference in the entry.

### Low — the new comment guarantees a check the case does not perform

`hooks/lib/staging-drift.ts:182-183`: "an entry that reaches the rule without reaching here fails `npm test`", after `:177` names three classes. The case at `staging-drift.test.ts:326-337` reads the `L.` row only; an R2 or R3 entry added to the rule with no row passes. `:185-187` also calls "the files here" class L when three of the seven are R2/R3. Scope: one comment block, one file, plus dist. Filed: `260921-0822_*_the-live-state-comment-says-the-class-l-case-catches-any-rule-entry-while-it-reads-the-l-row-alone.md`. Fix direction: parse the three rows through the same finder, or narrow the sentence to class L.

### Dist, version, suite

`cd hooks && npm run build && git status --short hooks/dist` prints nothing: dist is in step. `.claude-plugin/plugin.json` 11.8.0 -> 11.8.1, a patch; the commit says step 1 of `README-agents.md` `## Releasing` alone, no tag, and `git tag -l` ends at `v11.8.0`, so the state matches the message. `cd hooks && npm test`: 57 files, 957 tests, all passed, 33.3 s, one run.

## Cross-cutting observations

- The stale-caller-address pattern (`Step 3c`, `Phase 4`) is now fixed in `hooks/review-coverage.ts` and open at `hooks/lib/review-coverage.ts:95-96` and its two dist copies (`260921-0709_*`, filed in this range and cross-referenced by the 1334 record). Not refiled.
- The forward-only check on the class L row and the converse gap are two records (`260921-0807_*`, `260921-0822_*`) on one mechanism. A coder taking either should read both: one case that parses the three rows and compares both directions closes both.
- `ae60c939` carries a `feat(...)` type while the release commit calls the seven commits defect fixes and bumps a patch. No shipped text is affected; noted for the commit-type convention only.

## Recommended sequencing

Nothing blocks a tag. `260921-0822_*` and `260921-0807_*` are cleanup and can be taken together; `260921-0709_*` is a one-paragraph edit plus a rebuild.

Verification: `git diff b30ec2ea..9c7101aa` over the twelve non-workbench files, each read at HEAD; `cd hooks && npm run build && git status --short hooks/dist` clean; `cd hooks && npm test` 957/957 green.

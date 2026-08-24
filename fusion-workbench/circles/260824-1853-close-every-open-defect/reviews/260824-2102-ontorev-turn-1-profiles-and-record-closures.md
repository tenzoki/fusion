# Turn 1 of the defect-closure Circle: the four profiles and the record layer

**Reviewer:** ontorev
**Reviewed-range:** `571f945..d5c34cd`
**Not-opened:** `.gitignore`, `CLAUDE.md`, `README-agents.md`, `README-hooks.md`, `agents/analyst.md`, `agents/bugfixer.md`, `agents/coder.md`, `agents/coderev.md`, `agents/curator.md`, `agents/ontocoder.md`, `agents/ontorev.md`, `agents/orchestrator.md`, `agents/planner.md`, `agents/playmaker.md`, `agents/reconciler.md`, `agents/shaper.md`, `bin/fusion-identity`, `bin/fusion-paths`, `bin/fusion-prose-metric`, `bin/fusion-rules`, `bin/fusion-session-domain`, `bin/fusion-turn-budget`, `bin/monitor`, `docs/upgrading-to-v9.md`, `hooks/dist/lib/config.d.ts`, `hooks/dist/lib/config.js`, `hooks/dist/lib/domain-cascade.d.ts`, `hooks/dist/lib/domain-cascade.js`, `hooks/dist/lib/events.d.ts`, `hooks/dist/lib/events.js`, `hooks/dist/turn-budget.d.ts`, `hooks/dist/turn-budget.js`, `hooks/lib/__tests__/committed-dist.test.ts`, `hooks/lib/__tests__/config.test.ts`, `hooks/lib/__tests__/deliverable-language-lint.test.ts`, `hooks/lib/__tests__/domain-cascade.test.ts`, `hooks/lib/__tests__/executor-verification-report-lint.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden`, `hooks/lib/__tests__/fusion-identity.test.ts`, `hooks/lib/__tests__/fusion-paths.test.ts`, `hooks/lib/__tests__/fusion-prose-metric.test.ts`, `hooks/lib/__tests__/helpers/citation-scan.ts`, `hooks/lib/__tests__/hook-fail-open.test.ts`, `hooks/lib/__tests__/monitor-warnings-panel.test.ts`, `hooks/lib/__tests__/path-literal-lint.test.ts`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/review-coverage.test.ts`, `hooks/lib/__tests__/staging-drift.test.ts`, `hooks/lib/__tests__/surface-growth-bound.test.ts`, `hooks/lib/__tests__/turn-budget-lint.test.ts`, `hooks/lib/config.ts`, `hooks/lib/domain-cascade.ts`, `hooks/lib/events.ts`, `hooks/turn-budget.ts`, `skills/archive/SKILL.md`, `skills/cleanup/SKILL.md`, `skills/curate/SKILL.md`, `skills/direct/SKILL.md`, `skills/next/SKILL.md`, `skills/setup/SKILL.md`
**Scope as dispatched:** the eight `stilwerk/` profile files (commit `43cdde6`, plan step 9) and every change under `fusion-workbench/` in the range. The 60 files above are code, prompt, skill and doc surfaces the dispatch assigned to coderev; I opened none of them except where a `Resolved:` note cited a line in one, which I read for that line only.
**Circle:** `circles/260824-1853-close-every-open-defect/`
**Plan:** `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md`
**Attribution:** filed with the person half absent. `$FUSION_PLUGIN_ROOT/bin/fusion-identity` is not in the installed copy (the work tree has it), so the guarded call failed and the filing rule's third branch applies.

## Summary

The four shipped profiles and their four workbench copies are byte-identical, parse, and hold the metric; the `AI04` collision is resolved by moving the writing-profile tricolon rule to `AI12`, which no shipped surface cites and every live workbench citer names as history. The record layer is sound where the gate can see it and mostly sound where it cannot: all 194 renamed records carry exactly one `Resolved:` note whose first word is in the vocabulary, every path token in those notes resolves, and the three phantom merges cite a commit and text that exist. Seven Low findings are filed; none blocks the Turn, and one (row 66) is a record the plan lost.

## Totals

Critical 0, High 0, Medium 0, Low 7.

## What was checked and held

| Check | Method | Result |
|---|---|---|
| Shipped and workbench profile pairs | `diff -q` on the four pairs at `d5c34cd` | all four empty |
| Id uniqueness within each file, and `AI12` free before use | id extraction over `stilwerk/*.yaml` | 15/15/24/22 ids, no duplicate in any file; `AI12` appears only as the tricolon rule in the two writing profiles |
| Citers of `AI04` after the renumber | grep over `agents/ rules/ skills/ bin/ hooks/lib/ README* CLAUDE.md docs/ templates/` and the live workbench | no shipped surface cites either id; workbench citers are histories, closed records and the 0118 record itself, all describing the state before the fix |
| Step 9 acceptance | `grep -c '–'` over the two German files, `ruby -ryaml`, `bin/fusion-prose-metric` on all four | 0 en-dashes; all parse; `ok` on all four (`default-voice-en.yaml` at 1 em-dash in 1014 words) |
| Row 97 (`Bezugswort` in C02 and AI05) | read `chat-voice-de.yaml:25,27,107` | holds |
| Row 98 (`AI04` means one rule across the family) | ids table above | holds |
| `Resolved:` first word on every `_c_` rename in the range | 194 files, one note each | 138 `fixed`, 33 `referred`, 20 `moot`, 3 `unfixable`; no file with zero or two notes |
| Path tokens in those 194 notes | glob after `_*_`→`_?_`, `lib/` rooted at `hooks/` | every path resolves; the residue is bare basenames used as statements (`queue-ground-lint.test.ts` "deleted", `fusion-guard.json` "retired") |
| The 34 `referred` notes | read every one | 20 name a decision record that exists (8 new, 12 pre-existing); 3 name `### C4` of `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md:195`, which exists; 8 name the backlog, of which one cites two existing entries and seven cite none (finding 5); one names no kind (finding 5) |
| Eight new decision records | read heads, sections, footers | all carry Domain, Filed by, Cross-references, the four template sections and the five-line footer; all `_o_`; the 20 referral notes that point at them resolve |
| Three `_a_`→`_i_` moves (`8475c28`) | read the merged `Implemented:` lines | `30d6f0a` exists; `agents/shaper.md` carries `**Initiated by:**` (3 hits); `bin/fusion-rules:174-177` carries the `analyst` arm; `rules/fusion-workbench-conventions.md:410` carries `### Decision files`; the 2056 record's `2eaee31` exists |
| Twenty sampled `fixed`/`moot` notes beyond the path check | opened the cited line in each | every cited line carries what the note says (`CLAUDE.md:88` release step 0, `agents/orchestrator.md:159,525,539`, `agents/playmaker.md:230`, `skills/setup/SKILL.md:356`, `skills/archive/SKILL.md:141`, the three appended corrections at `:77`, `:179`, `:183`) |
| Triage table against markers at HEAD | 220 rows resolved, marker read from the basename | 194 `_c_`; 26 still `_o_`, of which 25 are S13 (`rules/`, the step in flight) and one is row 66 (finding 7) |

## Findings by theme

### The profiles: a closure that overreaches and a sibling it did not see

1. **C05 still carries the bare filename the 0146 note says is gone** (Low). `stilwerk/chat-voice-en.yaml:49`, `chat-voice-de.yaml:51`: `user-facing-output.md` as a token, in a file no lint reads. The note at `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0146_*_…:28` claims "no citation stands ungated". Issue `260824-2058_*_c05-in-both-chat-profiles-still-carries-the-bare-rule-filename-the-0146-closure-says-is-gone.md`.
2. **`Das heißt,` survives in the writing profile** (Low). `default-voice-de.yaml:137`, with no English counterpart. Row 100 was scoped to the chat profile and closed correctly; this is the sibling. Issue `260824-2058_*_the-german-writing-profile-still-bans-das-heisst-after-the-chat-profile-stopped-doing-so.md`.
3. **Two notes cite one line above their text** (Low). 0120 `:98` for line 99, 0115 `:106` for line 107, both wrong at the commit that wrote them. Issue `260824-2059_*_two-stilwerk-closure-notes-cite-a-line-one-above-the-text-they-name.md`.

### What the citation gate cannot see

4. **Spelled markers that the gate does not judge** (Low). `inCorpus()` in `hooks/lib/__tests__/workbench-citation-lint.test.ts:167-176` admits circle records, open issues, live decisions and live plans. Two consequences in this range. First, every one of the 194 records left the corpus the moment it was renamed, so their `Resolved:` notes are ungated for good; I checked them by hand and they hold. Second, history files were never in it: `history/260824-2019-…:12-17` and `history/260824-2032-…:14-16` cite six records by `_o_` names the same steps moved to `_c_`. Two more spelled markers sit inside the corpus and resolve only until their target moves (`_t_circle.md:32`, `shared/issues/260816-1330_o_two-of-…:15`). Issue `260824-2059_*_two-step-histories-cite-seven-records-by-the-open-marker-the-same-step-moved-and-history-is-outside-the-gate.md`.

### Referrals that point at nothing yet

5. **Seven backlog referrals and one kind-less note** (Low). Plan step 3 permitted "backlog entry to be filed by the user" and counted six; seven records carry it and `shared/backlog/` gained nothing in the range. `shared/issues/260816-0740_c_…:245` reads `Resolved: referred —` with no kind. Filing is the user's act by `## Backlog entries`, so the fix is a `/fusion:memo` pass before closure, not an agent write. Issue `260824-2100_*_seven-backlog-referrals-close-onto-entries-that-do-not-exist-and-one-referral-names-no-kind.md`.

### Record hygiene

6. **One history filename off-pattern** (Low). `history/260824-2042-coder-p-7b-session-domain-layout-row.md`. Issue `260824-2100_*_a-history-filename-in-this-circle-uses-underscores-where-the-pattern-has-hyphens.md`.
7. **Row 66 has no ending any more** (Low). The triage note asserts a fix that is not at HEAD (`rules/user-facing-output.md:19` still opens with "Those belong"); the S2 executor saw it and left the record `_o_` (`history/260824-2016-…:17`), and no later step lists the row. Issue `260824-2101_*_triage-row-66-asserts-a-fix-that-is-not-at-head-and-the-record-it-leaves-open-has-no-step.md`.

## Cross-cutting observations

- The plan's `Resolved:` shape (`<kind> — <clause>; <path or command>`) was followed in 193 of 194 notes; the one deviation is the kind-less note in finding 5. The vocabulary was also extended in practice: the plan's table says `moot` 23 times where the notes say `moot` 20 and `unfixable` 3. The approach section names `unfixable`, so the notes are right and the table's `Ending` column is the loose one.
- Closing a record removes it from the citation gate's corpus. This Circle moved 194 records out in one Turn, which is the largest single shrink of that corpus so far, and it is why finding 4's class went unnoticed: the gate reported green on a smaller set, not on the same set repaired. `shared/decisions/260823-1414_*_does-the-workbench-citation-gates-corpus-cover-review-files.md` is the open question this bears on; nothing here pre-empts it.
- The parallel coderev pass filed nine issues at `260824-2056` in the same store; none overlaps the seven above, and I checked names before writing.

## Recommended sequencing

Nothing here blocks Turn 2. Before the Circle closes: finding 7 (row 66 needs a step, and it is a `rules/` line the S13 coder can carry), then finding 5 (the user's seven memo entries and one appended line each), then findings 1 and 2 together in one ontocoder pass over the profiles with the `diff -q` check, then 3, 4 and 6 as record-only edits in one commit.

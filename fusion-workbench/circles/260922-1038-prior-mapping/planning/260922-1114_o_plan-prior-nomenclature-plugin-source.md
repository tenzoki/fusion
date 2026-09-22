# Implementation Plan: Adapt the fusion plugin source to the PRIOR/Fusion nomenclature (part 1 of 2)

**Date:** 2026-09-22
**Status:** Draft
**Spec:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md (Decided; the three user rulings of 2026-09-22 and the defaults of its `## User Decisions Pending` stand)
**Cross-references:** 260922-1038-prior-mapping.md, nomenclature.md (this container), 260922-1114_*_does-the-container-store-take-the-name-work-packages-superseding-circles.md, 260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md, 260922-1114_*_does-state-auditor-keep-the-reconcilers-write-scope.md, 260910-2145_*_does-the-container-store-keep-the-directory-name-circles.md, 260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md, 260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md, 260910-2256_*_may-the-growth-bounds-be-raised-for-the-duration-of-the-container-restoration.md, and the seven `260922-1059_*` records this container holds (planning input; none is answered here)
**Survey commit:** `57e2b7eb`, working tree clean on every shipped surface; `npm test` in `hooks/` green at that commit (exit 0). Every `path:line` below was read at that commit.
**Decidability:** Two questions carry this plan. First, *which occurrence of a legacy word on a shipped surface names a live fusion concept, and which sits in one of the spec's four untouched classes?* Classes 1, 2 and 4 are decidable from inputs a mechanism has (the token's shape, the reader lists, the sentence's subject); class 3 and the Gate/Verdict function split are decided by a reader per sentence and by nothing mechanical. So the mechanism is an enumeration (one `grep`, stated in Appendix A) plus a per-line classification a coder writes into Appendix A, and every gate this plan sets checks the enumeration's *completeness* (every hit is rewritten or listed), never the classification's *correctness*, which stays a human reading at the plan gate and at review. Second, *does an emitted or walked store path refer to the legacy or the new layout during the window?* Decidable: by existence on disk, checked at the one place per runtime that names the store (`## Approach`, the definition-site pattern). No question here needs a change of mechanism.

## Directive

Rename, on the plugin source in this repository and nowhere else, the three stores, the seven agent files and the concepts the spec's C1 to C4 name; keep what C4 and C5 keep; open the bounded transition window C9 defines at v12.0.0 and name its close at v13.0.0; measure every bounded surface and pay growth with cuts (C7); supersede the `circles/` decision on the record (C6); and ship the release surfaces coherent (C8). The spec is not restated here; each step cites the capability it realises. Part (2), the consumer migration, is a second spec and plan in this container; where a step touches a file both parts need, the step names the seam and stops at it.

## Current State

What the survey re-verified at `57e2b7eb`, and where it differs from the spec's survey at `9ff0f9fc`:

- **The hooks' store names already live once.** `hooks/lib/stores.ts` (`eabde08e`, after the spec's survey) holds `RECORD_STORES` (`planning` at `:24`, `consult` at `:32`), `LEGACY_STORES = ["backlog"]` and `RETIRED_REVIEW_FOLDERS`; `hooks/lib/__tests__/path-literal-lint.test.ts:324-330` parses the `shared/` subtree of the layout tree in `rules/fusion-workbench-conventions.md` and holds `RECORD_STORES` equal to it. The **container store is not in that file**: `circles` is hard-coded in `hooks/lib/plan-size.ts:97-105`, `hooks/lib/staging-drift.ts:464,469`, `hooks/lib/review-coverage.ts:141`, `hooks/lib/citation-corpus.ts:133,175` (and `planning/` at `:255`), `hooks/lib/citation-scan.ts:447,493,512,1092,1098,1240,1293`, `hooks/citation-sweep.ts:575`, and as a corpus reader in `hooks/lib/events-query.ts:191` (`circleOf`, reads pre-cut `history_file` values, C4 class 2).
- **The bash side names the stores in two helpers.** `bin/fusion-paths:384,391,400,404` value the kinds; `:298,:302,:306,:309` resolve the second argument under `circles/`; `bin/fusion-claimed-item:198` enumerates `fusion-workbench/circles`, `:225` and `:231` print `circles/` in its messages and its `ITEM=`/`CONTAINER=` lines. `bin/monitor` walks no store (`circles` at `:1664,:1831` are comment citations of an issue path); `bin/fusion-workbench-root` and `hooks/lib/workbench-root.ts` name no store. No `bin/` script sources another; helpers call one another as executables (`fusion-paths` → `fusion-claimed-item`, `fusion-workbench-root`).
- **Prompts resolve every store through the resolver**, except the two exempt skills: `circles/` stands 45 times in `skills/`, 44 of them in `setup` (`:36,:41,:43,:49,:50,:54,:74`) and `migrate` (`:12,:38,:48,:54,:59,:75,:118,:123,:129,:182-185`), one in `help:63`; `planning/` 8 times, all prose in `setup:40` and `migrate`; `consult` only in the shell store lists at `setup:54,:69` and `migrate:59,:118`. `path-literal-lint.test.ts:273-287` pins the probe expression byte-identical across `setup:54`, `migrate:59` and `migrate:118`, so a probe edit in setup forces the same edit in migrate. `agents/` carries no store literal. `$OUT_BACKLOG`/`$SCAN_BACKLOG` are named by `agents/orchestrator.md` (7), `agents/shaper.md` (2), `agents/curator.md` (2), `skills/archive/SKILL.md` (5), `skills/memo/SKILL.md` (5), `rules/workbench-path-resolution.md` (3), `rules/fusion-workbench-conventions.md` (2), `README-hooks.md` (1).
- **Agent names as keys.** `bin/fusion-rules:226,227,233,234,248,249,260,270,284,292,319` (case arms), `:645` and `:657` (literal equality on `orchestrator`, `editor`); `bin/fusion-paths:226-231` (shape guard admits hyphens: `*[![:lower:][:digit:]-]*`), `:233`. `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:247` parses case arms with `[a-z|]+` and `:258` equality tests with `[a-z]+`: **both exclude hyphens** and fail loudly on a renamed arm. Tests holding the roster by name: `context-manifest.test.ts:21-24,183`, `fusion-paths.test.ts:13-15`, `rules-emission-golden.test.ts:858-860,884,897-898,1201`, `rules-voice-profile.test.ts` (`planner`, `coder` as run arguments), `dispatch-bytes.test.ts:58-188`, `executor-verification-report-lint.test.ts:29,125,131`, `deliverable-language-lint.test.ts:22,118`, `marker-format-lint.test.ts:150-164`, `path-literal-lint.test.ts:209-223`, `plan-stopping-section-lint.test.ts:52,132-143` (expected failure text citing `agents/planner.md:131` and `agents/shaper.md:183`). Readers of persisted corpora: `MEASURED_AGENTS` (`hooks/lib/events-query.ts:482-490`, deliberately the historical population), `REVIEW_SENDERS` (`review-coverage.ts:195`, `reviewSender()` at `:205` stops at a hyphen, which only the unrenamed `reviewer` reaches), `MARKER_WORDS` (`citation-scan.ts:330`, historical file stamps). `install.sh:143-148` prefixes `fusion:` and validates nothing. `fusion.json:12` and `templates/fusion.json:8` name `orchestrator` only. Every `agents/*.md` has `name: <basename>` and no `tools:` line. Dispatch tokens `fusion:<renamed name>`: `CLAUDE.md:38` (coder, ontocoder), `install.sh` (coder, planner), `README.md:71` (coder), `docs/upgrading-to-v10-4.md:113` (shaper, history), `skills/curate/SKILL.md:3` (curator), `skills/reconcile/SKILL.md:4` (reconciler), tests `dispatch-bytes.test.ts:150,171,188`, `guard-state-shape.test.ts:237`. `**Executors:**` values are agent names (`agents/orchestrator.md:231,:600`, `agents/planner.md:31`); consumer plans on disk carry `Executor: coder` per step, and consumers' `rules/context-manifest.yaml` key `agents:` by name (`rules/context-manifest.md:53,63`).
- **The bounds.** `agents/*.md` 320 074 bytes against floor 310 567 + 18 000 (`AGENT_BASELINE`, ten keys, `reviewer.md` deliberately unkeyed, `surface-growth-bound.test.ts:172-183`): **8 493 bytes** of room. `skills/*/SKILL.md` 227 974 against 188 768 + 39 260: **54 bytes** of room. Hook tests 22 120 lines against 19 228 + 3 030: **138 lines** of room. The per-dispatch-path bound (`fixtures/dispatch-path.baseline`, read by `rules-emission-golden.test.ts:953-1130`) holds eleven blocks keyed `[<agent>]` with the inner keys `agents/<name>.md` and `rules emitted to <name>`, at **zero head-room**, and charges `CLAUDE.md` (8 021 bytes) to all eleven. The header regex at `:969-985` is `^\[([a-z-]+)\]$`, so a hyphenated block name parses. A file with no baseline entry counts as growth in full (`helpers/growth-bound.ts:156-159`), and a baseline key naming an absent file fails outright (`surface-growth-bound.test.ts:452-466`): an unkeyed rename of `agents/shaper.md` reads as 17 017 bytes of growth and one stale key at once. `rules-emission.golden` and `surface-growth.golden` are keyed by agent filename and regenerated with `UPDATE_RULES_GOLDEN=1` / `UPDATE_SURFACE_GOLDEN=1` (`README-hooks.md:517-520`). `reference-resolution-lint.test.ts:492` pins `{ paths: 1699, anchors: 316, stampBare: 11 }` by equality; every commit that adds or removes a shipped citation re-approves it with an attributed line above the constant.
- **Heading anchors are resolved by the lint.** `reference-resolution-lint.test.ts:376-377,429` resolves `` `file.md` `## Section` `` against the target's headings (equal or prefix). Cited headings carrying a legacy word: `## Directive` (17 citations, mostly in upgrade notes; defined in `agents/shaper.md:132`, `agents/planner.md:102`, `skills/memo/SKILL.md:122`, `rules/fusion-workbench-conventions.md:200`, `docs/working-model.md:27`), `## Plugin structure` (7, target `README-agents.md:179`), `## Human Gate Rules` (3: `rules/fusion-workbench-conventions.md:207,243`, `README-agents.md:45`; target `agents/orchestrator.md:364`), and `## Backlog entries — work items` (37 mentions across the surfaces). No `Verdict`, `Grounding`, `Turn` or `Skill` heading is cited.
- **Legacy-word counts** (`grep -rowE`, whole words, per surface, stamped `57e2b7eb`; scope evidence, not acceptance figures): `Circle` agents 6 / skills 17 / rules 20 / bin 10 / hooks 57 / docs 92 / READMEs 34; `Directive` 75 / 20 / 27 / 1 / 6 / 43 / 6; `Grounding` 27 / 2 / 20 / 0 / 3 / 6 / 2; `Turn` 1 / 3 / 10 / 14 / 25 / 21 / 15; `Artifact` 28 / 0 / 18 / 4 / 0 / 3 / 4 and `artifact` 15 / 24 / 28 / 8 / 21 / 7 / 14; `plugin` 15 / 32 / 18 / 68 / 36 / 19 / 81 (+8 `CLAUDE.md`, +22 `install.sh`); `skill` 16 / 67 / 53 / 37 / 14 / 32 / 44; `Gate` 18 / 0 / 16 / 0 / 0 / 9 / 2 and `gate` 101 / 22 / 60 / 36 / 136 / 50 / 79; `Verdict` 2 / 0 / 2 / 0 / 6 / 0 / 0 and `verdict` 55 / 23 / 14 / 44 / 149 / 27 / 50; `work item` 47 / 33 / 32 / 12 / 16 / 17 / 31; `work-item` 22 / 3 / 12 / 3 / 6 / 2 / 18; `**Item:**` 10 in agents, 3 in `README-agents.md`; `sub-agent` 11 / 2 / 0 / 0 / 14 / 2 / 21. The `docs/` figure for `Circle` is 88 parts upgrade notes (class 3, whole files).

## Approach

One integral pattern carries the store rename and the window: **the layout tree defines, one table per runtime copies, one test holds the three equal.** The repository already runs that pattern for the shared stores (tree → `stores.ts` → `path-literal-lint`); this plan extends it to the container store, to the legacy names for the window's duration, and to the bash side through one new helper the two bash consumers call. The closing release then deletes the window subsection in the tree, and the test refuses to pass until both runtime copies drop their legacy entries: one commit, forced rather than remembered. Binding record for the reading of the spec's single-site clause: `260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md` (option 1; the step group that realises it waits on the user's ruling at the plan gate).

```mermaid
flowchart TD
  subgraph DEF["Definition: rules/fusion-workbench-conventions.md, section fusion-workbench Layout"]
    TREE["layout tree: work-packages/, shared/plans/, shared/consultations/"]
    WIN["subsection Transition window v12 to v13: legacy name per renamed store"]
  end
  subgraph TS["TypeScript runtime: hooks/lib/stores.ts"]
    TSD["CONTAINER_STORE, RECORD_STORES, WINDOW_LEGACY_NAMES"]
  end
  subgraph SH["bash runtime: bin/fusion-stores"]
    SHD["CONTAINER_STORE, PLAN_STORE, CONSULT_STORE, LEGACY_ counterparts"]
  end
  TREE -->|copied by hand| TSD
  WIN -->|copied by hand| TSD
  TREE -->|copied by hand| SHD
  WIN -->|copied by hand| SHD
  TSD -->|imported| C1["plan-size, staging-drift, review-coverage, citation-corpus, citation-scan, citation-sweep"]
  SHD -->|called| C2["fusion-paths, fusion-claimed-package"]
  C2 -->|"OUT keys: new names only; SCAN keys: both names where the legacy dir exists"| P["agents and skills"]
  LINT["path-literal-lint.test.ts and window-bound.test.ts"] -.->|"holds the three equal; fails at major 13 or later while a legacy entry stands"| TREE
  LINT -.-> TSD
  LINT -.-> SHD
```

Every write lands under a new name; a read lists the legacy directory beside the new one only when it exists on disk, so a migrated workbench sees output with no legacy name in it (C1, first criterion) and an unmigrated one keeps working (C9). The item-in-scope's container is looked up under both roots; its write base is always the new root, which is the "records land beside the legacy store" consequence the spec accepts.

The work is ordered so that the tree is green after each commit group, and so that the one condition that would send the naming question back to the user (a hyphenated agent name Claude Code rejects) is tested before anything is renamed:

```mermaid
flowchart TD
  S1["1: probe a hyphenated agent name headless in a scratch copy"]
  S2["2 to 4: TS store definition, consumers, window fixtures, window pin test"]
  S5["5 to 7: bin/fusion-stores, claimed-package, fusion-paths, prompts naming the keys, setup and migrate writes"]
  S8["8: agent renames, every keyed surface, baselines re-keyed, aliases for the window"]
  S9["9: smoke and resolver proofs, dispatch-sweep grep"]
  S10["10: term pass on rules, CLAUDE.md, agents, then measure the dispatch paths and cut"]
  S11["11: term pass on skills and the help update topic, then measure and cut"]
  S12["12: term pass on READMEs, docs, bin headers, hooks comments, install.sh"]
  S13["13: chat-profile ban lists (ontocoder)"]
  S14["14: Appendix A, the surviving-occurrence table"]
  S15["15: plugin.json 12.0.0 and description (ontocoder)"]
  S16["16: upgrade note, README pointers, the closing release as a Releasing step"]
  S1 --> S8
  S2 --> S5
  S5 --> S8
  S8 --> S9
  S9 --> S10
  S10 --> S11
  S11 --> S12
  S12 --> S13
  S12 --> S14
  S13 --> S15
  S14 --> S15
  S15 --> S16
```

The one edge not in the spec's shape: step 2 to 4 (TypeScript) precedes 5 to 7 (bash) because the window pin test and the tree parse land with the TypeScript group, and the bash helper is then held to a table that already exists.

### Names this plan fixes (the spec's `## Open for Planner`)

| Legacy | Fixed here | Rule |
|---|---|---|
| `OUT_BACKLOG` / `SCAN_BACKLOG` | `OUT_PACKAGES` / `SCAN_PACKAGES` | naming rule 7, a collection named for its records; the key grammar `[A-Z][A-Z_]*` admits it |
| `bin/fusion-claimed-item`, `ITEM=` | `bin/fusion-claimed-package`, `PACKAGE=` (`CONTAINER=` unchanged) | the noun follows the record kind |
| `**Item:**` dispatch parameter | `**Work package:**` | the same shape `**Review domain:**` already has; a space inside a label is established |
| `## Backlog entries — work items` | `## Work packages` | every citation moves with it in the same commit |
| `## Human Gate Rules` | `## Human approval rules` | resolution table: the user authorising an action is an approval |
| citation kinds `circle-record`, `circle-dir` | `package-record`, `package-dir` | one kind each, covering the record under either root and, for `package-record`, the retired `_<m>_circle.md` form beside the item form: the kind names the container, not the record's era, so no third kind |
| `hooks/lib/citation-scan.ts` `circleDirs()`, `CIRCLE_DIR`, `CIRCLE_RECORD_RE` and every other non-persisted code identifier | unchanged | code is an exempt surface and an identifier is not vocabulary; only the two kind names are persisted in verdict output and are therefore renamed |
| `## Directive` as the heading of the work-package record and of the spec/plan templates | unchanged in this item | a template label carried by every consumer's records, treated like `**Artifact language:**` (spec C3 case 4, C4 class 4 by the same reasoning); prose beside it says brief; renaming it is part (2)'s, since part (2) is what may rewrite records. Listed under `## Open Questions` |
| `bin/fusion-work-order`, `bin/fusion-plan-size` | unchanged | neither carries a legacy noun in its name |
| the window's legacy read | one document definition, one table per runtime, one test | `260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md`, option 1 |
| the growth-bound re-key | a map edit, in the rename commit, named as a non-event in the rule's authoring home | `helpers/growth-bound.ts` `## Re-baselining` is the home; `README-hooks.md` restates it |

## Preconditions performed by the orchestrator at the user's word (no executor)

These are workbench writes an executor may not perform (`rules/fusion-workbench-conventions.md` `## Inline State Tracking`, decision files; `## Dispatching another agent`). They gate the steps named beside them.

- **P1.** `260922-1114_*_does-the-container-store-take-the-name-work-packages-superseding-circles.md`: `Answered:` citing `nomenclature.md` `### Fusion workbench migration`, ruled by user; rename `_o_` → `_a_`. Then on `260910-2145_*_does-the-container-store-keep-the-directory-name-circles.md`: append `Superseded by:` citing the new record, rename `_a_` → `_s_`. Gates step 2. (Spec C6.)
- **P2.** `260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md`: the user's ruling on option 1; `_o_` → `_a_`. Gates steps 2 and 5. A ruling for option 3 stops the plan at step 1 (`## Where this work stops`).
- **P3.** `260922-1114_*_does-state-auditor-keep-the-reconcilers-write-scope.md`: stays `_o_` for the profile-set item; step 8 cites it in the `state-auditor` roster row and answers nothing.
- **P4.** The seven `260922-1059_*` records stay `_o_`; no step reads their answers.

## Implementation Steps

1. **Probe: does Claude Code accept a hyphenated agent name and its `fusion:<name>` token?**
   - Executor: `coder`
   - Files: none in the tree; a copy of the repository under the scratchpad directory
   - Changes: copy the work tree, `git mv agents/shaper.md agents/requirements-designer.md` in the copy and set its `name:` line, then run `claude plugin validate <copy>` and `claude --plugin-dir <copy> --agent fusion:requirements-designer -p "reply SMOKE-OK"`. Report both outputs verbatim. Delete the copy.
   - Dependencies: none
   - Acceptance: validation passes and the run answers `SMOKE-OK`. On any other outcome the plan stops (`## Where this work stops`, clause 2) and the outputs go to the user with the naming question.

2. **TypeScript store definition and the window table**
   - Executor: `coder`
   - Files: `hooks/lib/stores.ts`, `rules/fusion-workbench-conventions.md` (`## fusion-workbench Layout` only), `hooks/lib/__tests__/path-literal-lint.test.ts`
   - Changes: in `stores.ts`, `RECORD_STORES` reads `plans` and `consultations` where it read `planning` and `consult`; add `CONTAINER_STORE = "work-packages"` and `WINDOW_LEGACY_NAMES = { "work-packages": "circles", plans: "planning", consultations: "consult" } as const` with a header sentence naming the closing release (`13.0.0`) and the record; add two exported helpers, `containerRoots(wb)` (the new root, plus the legacy root when it exists on disk) and `storeDirs(base, kind)` (the new name, plus the legacy name when it exists). In the tree: `work-packages/` for `circles/`, `plans/` in the container and under `shared/`, `consultations/` for `consult/`; replace the paragraph that keeps `circles/` by name (`:66` at the survey commit) with one sentence citing `260922-1114_*_does-the-container-store-take-the-name-work-packages-superseding-circles.md`; add `### Transition window (v12.0.0 to v13.0.0)` listing the three legacy names, the rule (read beside the new name where the directory exists, never written), the three sites that copy the table, and the closing release by version. Extend the lint: `TYPE_FOLDERS` also takes `Object.values(WINDOW_LEGACY_NAMES)` so `planning/` and `consult/` in a prompt still fail; the tree parse also reads the `work-packages/` line and the window subsection's names and holds `CONTAINER_STORE` and `WINDOW_LEGACY_NAMES` equal to them; `DEFINITION_SITES` gains `bin/fusion-stores` (created in step 5; the existence assertion is added there).
   - Dependencies: P1, P2
   - Acceptance: `path-literal-lint.test.ts` holds `RECORD_STORES`, `CONTAINER_STORE` and `WINDOW_LEGACY_NAMES` equal to the tree and fails on a `work-packages/`, `plans/` or `consultations/` literal in an agent prompt or non-exempt skill (fixture rows added for all three). The layout tree shows the three new names and the clause keeping `circles/` is gone (C1, third criterion). Lands in the same commit as steps 3 and 4.

3. **Route every TypeScript consumer through the definition; rename the two citation kinds**
   - Executor: `coder`
   - Files: `hooks/lib/plan-size.ts`, `hooks/lib/staging-drift.ts`, `hooks/lib/review-coverage.ts`, `hooks/lib/citation-corpus.ts`, `hooks/lib/citation-scan.ts`, `hooks/citation-sweep.ts`, `hooks/lib/events-query.ts` (comment only), their tests and fixtures, `hooks/dist/`
   - Changes: `plan-size.ts:97-105` walks `containerRoots()` and `storeDirs(·, "plans")`; `staging-drift.ts:464,469` tests `segments[0]` against both roots and `STORES` includes the legacy kind names; `review-coverage.ts:141` enumerates both roots; `citation-corpus.ts:133,175,255` regexes take the root and kind alternations from `stores.ts`; `citation-scan.ts` builds the `:447,:493,:512` regexes from the same alternation, `circleDirs()` adds both roots and, for every archive sweep, both `archive/<sweep>/<root>` forms (old sweeps keep `circles/` for ever), `storePrefixed()` at `:1240,:1293` reports the segment it matched rather than the literal `"circles/"`, and `CitationKind`, `GATE_KINDS`, `SHAPE_DECIDED_KINDS` carry `package-record` / `package-dir`; `citation-sweep.ts:575` extracts the directory from either prefix through the shared alternation. `events-query.ts:191` keeps `"circles"`: it reads pre-cut `history_file` values (C4 class 2); its comment says so and cites the window subsection. Test fixtures that build a workbench (`fusion-paths.test.ts`, `plan-size.test.ts`, `staging-drift.test.ts`, `citation-grammar-boundaries.test.ts`, `review-coverage.test.ts:517`, `live-circle-record-detection.test.ts:38`, `reference-resolution-lint.test.ts:838-912`, `workbench-citation-lint.test.ts:229-291`) move to the new names; assertions on verdict strings (`citation-grammar-boundaries.test.ts:108-117,196-217`) read `work-packages/`. Rebuild `dist/` and commit it (`committed-dist.test.ts`).
   - Dependencies: step 2 (same commit)
   - Acceptance: `npm test` green; `grep -rn '"circles"\|circles\\\\/\|"planning"\|"consult"' hooks/*.ts hooks/lib/*.ts` returns `stores.ts` and `events-query.ts:191` only, plus comments; `bin/fusion-citation-check` over the shipped text reports the dangling and store-prefixed counts it reported at `57e2b7eb` (run and record both figures in Appendix B; C4, second criterion).

4. **Window fixtures and the window pin**
   - Executor: `coder`
   - Files: `hooks/lib/__tests__/plan-size.test.ts`, `citation-grammar-boundaries.test.ts`, `staging-drift.test.ts`, a new `hooks/lib/__tests__/window-bound.test.ts`
   - Changes: one legacy-only fixture (a workbench holding `circles/<dir>/planning` and `shared/planning`, `shared/consult`) and one mixed fixture (both names side by side) per consumer above, asserting the legacy records are found and reported with their own prefix, and that a mixed tree reports every package once (C9, third criterion). `window-bound.test.ts` reads `.claude-plugin/plugin.json` and asserts: while the major is below 13, `WINDOW_LEGACY_NAMES` names exactly the three stores the tree's window subsection names; from major 13 on, the subsection is absent and the table is empty. Re-key `TEST_LINE_BASELINE` for any test file renamed in this group.
   - Dependencies: step 3 (same commit)
   - Acceptance: `npm test` green; the hook-test line total measured against its bound and recorded in Appendix B; a cut in comment prose of the test surface (`260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md`) is taken in this commit if the 138 lines of room do not hold, and named in Appendix B.

5. **`bin/fusion-stores`, the bash definition**
   - Executor: `coder`
   - Files: `bin/fusion-stores` (new), `hooks/lib/__tests__/fusion-stores.test.ts` (new), `README-hooks.md` `### The bin/ helper roster`, `hooks/lib/__tests__/path-literal-lint.test.ts` (`DEFINITION_SITES` existence assertion)
   - Changes: a helper in the style of `bin/fusion-workbench-root` (header documentation, `KEY=value` on stdout, exit 0/1) printing `CONTAINER_STORE=work-packages`, `PLAN_STORE=plans`, `CONSULT_STORE=consultations`, `LEGACY_CONTAINER_STORE=circles`, `LEGACY_PLAN_STORE=planning`, `LEGACY_CONSULT_STORE=consult`; its header names the closing release and says the table is a copy of the tree's. The test runs it and holds its output equal to `stores.ts`. Roster row added.
   - Dependencies: step 2, P2
   - Acceptance: `fusion-stores.test.ts` green; `grep -rn 'circles' bin/*` returns `bin/fusion-stores`, the two `bin/monitor` comment citations, and nothing else after step 6.

6. **`bin/fusion-claimed-package` and `bin/fusion-paths` read both names, write one**
   - Executor: `coder`
   - Files: `bin/fusion-claimed-item` → `bin/fusion-claimed-package` (`git mv`), `bin/fusion-paths`, `bin/fusion-rules` (its call site), `hooks/lib/__tests__/fusion-claimed-item.test.ts` → `fusion-claimed-package.test.ts`, `fusion-paths.test.ts`, `TEST_LINE_BASELINE`, `README-hooks.md` roster row
   - Changes: the claim scan enumerates every root `fusion-stores` names that exists (`work-packages/*/` and `circles/*/`), prints `PACKAGE=<root>/<dir>/<dir>.md` and `CONTAINER=<root>/<dir>` for the record where it stands, and refuses two claims across both roots as it refuses two today (exit 3). `fusion-paths`: reads the six values from `fusion-stores`; the second argument is looked up under the new root, then the legacy root, and is exit 1 when under neither; `OUT_BASE` is always `<new root>/<dir>` (or `shared`), so every `OUT_*` names a new store (C9, second criterion); `scan_value()` emits `<base>/<new> [<base>/<legacy> if that directory exists] shared/<new> [shared/<legacy> if it exists]`; `OUT_PACKAGES|SCAN_PACKAGES` replace the `BACKLOG` pair, `SCAN_PACKAGES` adding the legacy root when it exists; `OUT_CONSULT` is `shared/consultations`; usage text, messages and the `ORDER` list follow. Every prompt naming the old keys moves to the new ones in this commit (`agents/orchestrator.md`, `agents/shaper.md`, `agents/curator.md`, `skills/archive/SKILL.md`, `skills/memo/SKILL.md`, `rules/workbench-path-resolution.md`, `rules/fusion-workbench-conventions.md`, `README-hooks.md`), or the resolver exits 4 on the first Setup after it. Tests: the existing cases on the new names; a legacy-only fixture (claim found under `circles/`, every `OUT_*` under `work-packages/`, exit 0) and a mixed fixture; the byte-for-byte assertions at `fusion-paths.test.ts:106-435` and `fusion-claimed-item.test.ts:109-125` rewritten to the new output.
   - Dependencies: step 5
   - Acceptance: C1 first and second criteria as stated in the spec, run in a fixture holding the new layout and in one holding the legacy layout; C9 first and second criteria; `npm test` green; `bin/fusion-paths planner 260922-1038-prior-mapping` run in this repository (legacy workbench) exits 0 with `OUT_PLAN=work-packages/260922-1038-prior-mapping/plans` and `SCAN_PLANS` naming both that directory and `circles/260922-1038-prior-mapping/planning`.

7. **Setup and migrate: new names in every write, legacy names only in the probe and the report**
   - Executor: `coder`
   - Files: `skills/setup/SKILL.md`, `skills/migrate/SKILL.md`, `hooks/lib/__tests__/path-literal-lint.test.ts:273-287` (the byte-identical pin), `hooks/lib/__tests__/live-circle-record-detection.test.ts`
   - Changes: setup's `mkdir -p` (`:69`) creates `work-packages/`, `shared/plans/`, `shared/consultations/`; its probe (`:54`) gains a case for a legacy v11 layout (a `circles/` root, a `shared/planning/` or `shared/consult/` store) that prints one line naming the store and `/fusion:migrate` and **continues** (C9, fourth criterion); the prose at `:36-50,:74` names `work-packages/` as the layout it creates and `circles/` as the layout it detects. Migrate: every `mkdir -p` and `printf` target at `:59,:118` writes `work-packages/`, `plans/`, `consultations/` (no release inside the window writes a legacy name); its survey and reformat probe expressions change identically to setup's so the pin at `:273-287` holds. **Seam with part (2):** migrate's conversion of a `circles/` workbench into `work-packages/` is part (2)'s; this step only retargets migrate's existing writes and leaves its prose saying so in one sentence.
   - Dependencies: step 6
   - Acceptance: `path-literal-lint` green with the pin still byte-identical across the three sites; `live-circle-record-detection.test.ts` runs the extracted bash blocks against a `work-packages/` fixture and a `circles/` fixture; `grep -rn 'circles/' skills/` returns lines in `setup` and `migrate` only, plus `skills/help/SKILL.md` where the sentence is about the upgrade (C1, seventh criterion). Skills byte total recorded in Appendix B; the 54 bytes of room will not hold `circles/` → `work-packages/` on 45 lines, so this commit takes its cut inside `setup` or `migrate` prose (candidates: `setup:36-50`, where four paragraphs explain the probe's three cases and can be one; `migrate:182-185`, the worked example) and names it.

8. **Rename the seven agents and every surface keyed by their names, re-keying the baselines**
   - Executor: `coder`
   - Files: `agents/{shaper,planner,coder,ontocoder,reconciler,editor,curator}.md` (`git mv` to the seven identifiers); every file listed under `## Current State`, third bullet; `hooks/lib/__tests__/surface-growth-bound.test.ts:172-183`, `fixtures/dispatch-path.baseline`, `fixtures/rules-emission.golden`, `fixtures/surface-growth.golden`, `helpers/growth-bound.ts` `## Re-baselining`, `README-hooks.md` `### Growth bounds on the shipped text`; `hooks/lib/events-query.ts`; `hooks/lib/plan-size.ts` (the message text citing `agents/planner.md`); `bin/fusion-paths` `unknown_name_note()`, `bin/fusion-rules` exit-2 message; `agents/orchestrator.md`; `agents/planner.md`; `agents/shaper.md`; `README-agents.md`; `CLAUDE.md:38`; `install.sh:120-127`; `skills/curate/SKILL.md:3`, `skills/reconcile/SKILL.md:4`; `docs/working-model.md`
   - Changes, in one commit: `name:` frontmatter equals the new basename; descriptions naming other agents use the new names; `bin/fusion-rules` case arms and the two equality tests; `derivable-enumerations-lint.test.ts:247,258` admit `-` in the name class; every test in the third bullet of `## Current State` uses the new names; `AGENT_BASELINE` keys re-keyed with their old figures; `dispatch-path.baseline` block headers and the two inner keys re-keyed, figures untouched; both goldens regenerated and their diffs reviewed to be key-only; `helpers/growth-bound.ts` `## Re-baselining` gains the paragraph "a rename re-keys the entry and moves no floor: it is none of the three events and not a head-room raise", `README-hooks.md` restates it in one sentence (C7, second criterion). The orchestrator's routing table, invocation table, `**Executors:** code-implementer, data-implementer, analyst`, and a **window alias for persisted plans**: a step whose `Executor:` names a pre-v12 identifier is dispatched as its v12 identifier, in one sentence with the seven-row table, removed at the closing release. `**Item:**` → `**Work package:**` in the planner and shaper parsers, the orchestrator's dispatch text and `README-agents.md` `## Dispatch parameters` (the old spelling is no longer parsed, C8 third criterion). `MEASURED_AGENTS` gains `code-implementer`, `data-implementer`, `state-auditor`, `policy-curator` and `bin/fusion-events` reports by role through a seven-row old-to-new map so a range spanning the rename gives one series per role (C2 sixth, C4 third criteria); `REVIEW_SENDERS` and `MARKER_WORDS` unchanged, with a comment saying why. `unknown_name_note()` and the `fusion-rules` exit-2 message name the seven-row rename table, so a user or a stale prompt asking for `shaper` is told the new name. `install.sh` help text; the `Agent(fusion:…)` frontmatter lines; `README-agents.md` `## The agents` rows, including the `reviewer` row naming `code-reviewer` and `data-reviewer` as the two identifiers it serves under `**Review domain:**` (C2 second criterion) and the `state-auditor` row citing `260922-1114_*_does-state-auditor-keep-the-reconcilers-write-scope.md`; every `agents/<old>.md` path citation on every surface (the lint resolves them; `README-agents.md` 30, `rules/orchestrator-rebalance.md` 9, `README-hooks.md` 9, `skills/curate/SKILL.md` 8 are the dense files). The reference pin is re-approved with its attribution line.
   - Dependencies: steps 1, 7
   - Acceptance: `ls agents/` lists the eleven names of C2's first criterion, `name:` equals basename in each; `npm test` green with no baseline figure changed and no head-room constant raised (C7 first criterion; `git diff` of the two baseline files shows key lines only); `grep -rEo 'fusion:(shaper|planner|coder|ontocoder|reconciler|editor|curator)\b' agents skills rules README*.md docs bin hooks CLAUDE.md install.sh templates` returns only `docs/upgrading-to-v10-4.md:113` and the test rows that write synthetic event values (class 2), listed in Appendix A (C2 fifth criterion); `grep -rn 'agents/\(shaper\|planner\|coder\|ontocoder\|reconciler\|editor\|curator\)\.md'` over the same surfaces returns only upgrade notes.

9. **Proofs of the rename**
   - Executor: `coder`
   - Files: none
   - Changes: run `claude plugin validate .`; run `claude --plugin-dir . --agent fusion:<name> -p "reply SMOKE-OK"` for each of the eleven names, headless (the two-session pin does not bind a headless run, which loads the tree afresh); run `bin/fusion-rules <name>` and `bin/fusion-paths <name>` for each new name and compare the emission and key set with the same commands at `57e2b7eb` (`git stash` is not used; run the old commands from a `git worktree` of that commit); run each old name and record the exit 2 and its note. Record all outputs in Appendix B.
   - Dependencies: step 8
   - Acceptance: C2 third and fourth criteria as stated. `fusion --update` followed by `fusion <new name>` (C2 eighth criterion) is proved after the release, in the next session; it is a clause under `## Where this work stops`.

10. **Term pass over the dispatch-path-bounded surfaces: `rules/`, `CLAUDE.md`, `agents/`**
    - Executor: `coder`
    - Files: `rules/*.md`, `CLAUDE.md`, `agents/*.md`, `hooks/lib/__tests__/reference-resolution-lint.test.ts:492` (re-approval), any test asserting a sentence of these files (`review-coverage-mandate.test.ts`, `executor-verification-report-lint.test.ts`, `deliverable-language-lint.test.ts`, `plan-stopping-section-lint.test.ts`)
    - Changes: apply the classification rule of Appendix A per sentence. Headings: `## Backlog entries — work items` → `## Work packages`, `## Human Gate Rules` → `## Human approval rules`, with every citation moved in the same commit; `## Directive` stays (`### Names this plan fixes`). `rules/user-facing-output.md` `## Vocabulary` bans the canonical nouns beside the legacy ones (C3 fourth criterion). `rules/fusion-workbench-conventions.md` `## State Markers — decisions`: "Grounding-Stand / Grounding-Historie" → the evidence-base pair, keeping the `foundation_V3 §1.2` citation as history. Provenance headers untouched. Then **measure**: `npm test`; the dispatch-path assertion names every path over its total. Pay each overage by a cut in a file on that path (a rule emitted to it, the agent's own prompt, or `CLAUDE.md`), preferring narrative that restates a binding record over the record's citation, and never a sentence a test asserts. Every cut is a row in Appendix B with the bytes it returned.
    - Dependencies: step 9
    - Acceptance: `npm test` green with no baseline or head-room change; Appendix B carries, for each of the eleven paths, the byte delta of the term pass and the cuts taken (C7 third criterion); the C3 first, second and third criteria hold over `agents rules CLAUDE.md` for the words the criteria name, against Appendix A.

11. **Term pass over `skills/`, and the help topic's release entry**
    - Executor: `coder`
    - Files: `skills/*/SKILL.md`
    - Changes: the classification rule per sentence; `skills/help/SKILL.md` `### 4. Update` carries v12 on top and drops the oldest of its three (C8 second criterion; the drop funds bytes), its philosophy and daily topics say work package, brief, module, workflow; `skills/setup/SKILL.md` and `migrate` prose already touched in step 7 are re-read for the remaining words. Measure the skills byte total; a cut is taken in the same skill that grew.
    - Dependencies: step 10
    - Acceptance: `npm test` green; Appendix B carries the skills delta and cuts; C3 criteria over `skills/`.

12. **Term pass over the unbounded surfaces: READMEs, live docs, `bin/` headers, hooks comments, `install.sh`, `templates/`**
    - Executor: `coder`
    - Files: `README.md`, `README-agents.md`, `README-hooks.md`, `docs/philosophy.md`, `docs/working-model.md`, `docs/fusion-intro.md`, `docs/messages-between-checkouts.md`, `bin/*` header comments, `hooks/*.ts` and `hooks/lib/*.ts` comments, `install.sh` (prose only; its marketplace steps are Claude Code's surface), `templates/fusion.json` (its `_retired` note is history and stays), `hooks/dist/` (rebuilt if a `.ts` comment changed)
    - Changes: the classification rule per sentence; `README-agents.md` `## The agents` count bullets and the six registration surfaces agree with `ls agents/`; the co-mention lines the derivable-enumerations lint checks (`:340`) name the new identifiers; `docs/upgrading-to-v9.md` through `docs/upgrading-to-v11-4.md` are not opened. Reference pin re-approved.
    - Dependencies: step 11
    - Acceptance: `derivable-enumerations-lint` green; `git diff --stat` shows no `docs/upgrading-to-*` file (C4 fourth criterion, first half); C3 fifth criterion (one name per thing across `README.md`, `README-agents.md`, `docs/philosophy.md`, `/fusion:help`) checked by reading the four.

13. **Chat-profile ban lists**
    - Executor: `ontocoder`
    - Files: `stilwerk/chat-voice-en.yaml:25`, `stilwerk/chat-voice-de.yaml:25` (the shipped templates; a consumer's copies are part (2)'s)
    - Changes: `L07` names the canonical nouns beside the legacy ones (work package, brief, evidence base, work round, approval, review result, artefact; German: Arbeitspaket, Auftrag, Evidenzbasis, Arbeitsrunde, Freigabe, Prüfergebnis, Artefakt) and keeps every legacy noun it names today (C3 fourth criterion).
    - Dependencies: step 12
    - Acceptance: `rules-voice-profile.test.ts` green; both files parse as YAML; `bin/fusion-rules planner` still emits both profile paths.

14. **Appendix A: the surviving-occurrence table**
    - Executor: `coder`
    - Files: this plan (Appendix A)
    - Changes: run the enumeration command of Appendix A over the surfaces the spec's C3 names; write one row per surviving line, `path:line`, the word, and exactly one class; one row `path:*` per file wholly in class 3 (the upgrade notes), with the count. The enumeration's output and the table's row count are equal, or the difference is a listed rewrite the executor missed and fixes.
    - Dependencies: step 12
    - Acceptance: C4 first criterion; C3 first and second criteria checked against the table; C2 fifth criterion's survivors are rows.

15. **Manifest: version and description**
    - Executor: `ontocoder`
    - Files: `.claude-plugin/plugin.json`
    - Changes: `version` `12.0.0`; `description` in the canonical terms, stating the agent count `ls agents/` gives, eleven (C3 sixth, C8 first criteria).
    - Dependencies: steps 13, 14
    - Acceptance: `derivable-enumerations-lint` green (it reads the count); `window-bound.test.ts` green at major 12.

16. **Release surfaces: the upgrade note, the pointers, and the closing release as a named step**
    - Executor: `coder`
    - Files: `docs/upgrading-to-v12.md` (new), `README.md` (the upgrade paragraph at `:28-54`, the opening paragraph, the version pin), `README-agents.md` `## Releasing`, `README-hooks.md` (where it states that no store name is read twice), `install.sh` header version
    - Changes: the note names every renamed store, agent and dispatch parameter with a seven-row and a three-row table, the key renames (`OUT_PACKAGES`, `PACKAGE=`, `bin/fusion-claimed-package`), the window's rule and its closing release `13.0.0`, that a consumer updates first and runs part (2)'s migration inside the window, what a consumer sees when it updates without migrating (records beside the legacy store, setup's one-line report), that a consumer's `rules/context-manifest.yaml` and its live plans' `Executor:` lines carry old names the window still reads, and that `Agent(fusion:shaper)` and the six others no longer resolve (the old-name exit 2 note). `README.md` points at it from the upgrade paragraph. `## Releasing` gains, after step 6, the closing release as its own step: "v13.0.0 deletes `### Transition window` from the layout tree, the legacy entries from `stores.ts` and `bin/fusion-stores`, the `Executor:` alias from the orchestrator, and setup's continue-on-legacy case; `window-bound.test.ts` refuses the version bump until it is done"; its step 0 keeps `docs/upgrading-to-v12.md` live where it kept v11's. The three places that name the closing version (the note, the tree's subsection, `## Releasing`) are read together.
    - Dependencies: step 15
    - Acceptance: C8 first criterion and C9 fifth criterion as stated; C4 fourth criterion, second half; `npm test` green; the reference pin re-approved for the new file's citations.

(Every step MUST declare exactly one Executor from the active executor set. See "Executor Agents" above for the set and routing rules. Steps are updated inline by agents per `fusion-workbench-conventions.md`. **A step's stated endpoint is a state the artifact can occupy, or the step names the write that makes it one.**)

## Where this work stops

- Steps 1 to 16 are `[DONE]`, `npm test` is green at the last commit with no baseline figure changed and no head-room constant raised, or with a head-room raise the user ruled and `README-hooks.md` `### Growth bounds on the shipped text` logs.
- If the measurement of step 10, 11 or 4 shows a bounded surface over its room and the executor can name no cut in that surface that removes only what this work added, the work stops at that surface and the head-room question goes to the user as its own ruling; no baseline moves. (Spec `## Stops when`, clause 1.)
- If step 1's probe fails, or `claude plugin validate .` or a smoke run in step 9 fails for a renamed agent because Claude Code rejects the hyphenated name or its `fusion:<name>` token, the work stops before any rename and the naming question goes back to the user with the error. (Spec clause 2.)
- If step 14's enumeration finds a persisted corpus, a reader or a citation form the spec did not list and renaming its words would split or break it, that surface joins Appendix A as untouched and is reported, not renamed through. (Spec clause 3.)
- If the user rules option 3 on `260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md`, the work stops after step 1 and the window's shape is re-ruled; if a consumer of a store name turns up that has no path to either runtime's table and must carry its own branch, the work stops at that consumer and reports it. (Spec clause 4.)
- The release that opens the window is performed by the steps of `README-agents.md` `## Releasing` at the user's word, after step 16; `fusion --update` followed by `fusion state-auditor` starting the renamed agent in the next session (C2 eighth criterion) is a precondition of closing this plan, not of tagging.
- The closing release v13.0.0 is not this plan's work: it is named in three places and pinned by a test, and it is the successor item's.
- No file under `fusion-workbench/` in this repository moves; this checkout's own workbench stays a legacy layout until part (2) runs here, and every step above is proved against it in that state.

## Data Structures

`hooks/lib/stores.ts` after step 2:

```ts
export const CONTAINER_STORE = "work-packages" as const;
export const RECORD_STORES = ["plans", "issues", "decisions", "discussions", "analyses", "reviews",
  "investigations", "history", "consultations", "memos", "forum", "checkouts"] as const;
export const LEGACY_STORES = ["backlog"] as const;                  // unchanged
export const RETIRED_REVIEW_FOLDERS = [...] as const;               // unchanged
/** Read beside the new name while the directory exists; never written. Removed at 13.0.0. */
export const WINDOW_LEGACY_NAMES = { "work-packages": "circles", plans: "planning", consultations: "consult" } as const;
export function containerRoots(wb: string): string[];               // ["work-packages", "circles"?]
export function storeDirs(base: string, kind: string): string[];    // ["<base>/plans", "<base>/planning"?]
```

`bin/fusion-stores` output (six lines, fixed order):

```
CONTAINER_STORE=work-packages
PLAN_STORE=plans
CONSULT_STORE=consultations
LEGACY_CONTAINER_STORE=circles
LEGACY_PLAN_STORE=planning
LEGACY_CONSULT_STORE=consult
```

`bin/fusion-claimed-package` output: `PACKAGE=<root>/<dir>/<dir>.md` and `CONTAINER=<root>/<dir>`, `<root>` being whichever of the two the record stands under.

The rename table, written once in `docs/upgrading-to-v12.md` and copied into `unknown_name_note()`, the `fusion-rules` exit-2 message, the orchestrator's `Executor:` alias sentence and `bin/fusion-events`' role map: `shaper→requirements-designer`, `planner→implementation-planner`, `coder→code-implementer`, `ontocoder→data-implementer`, `reconciler→state-auditor`, `editor→document-editor`, `curator→policy-curator`.

## API Changes

- `bin/fusion-paths`: keys `OUT_PACKAGES`, `SCAN_PACKAGES` replace `OUT_BACKLOG`, `SCAN_BACKLOG`; `OUT_CONSULT=shared/consultations`; `OUT_PLAN` ends in `plans`; every `SCAN_*` may carry up to four space-separated entries during the window (the contract already admits more than one, `rules/agent-setup.md` `## What fusion-paths emits`). Exit codes unchanged.
- `bin/fusion-claimed-item` → `bin/fusion-claimed-package`; `ITEM=` → `PACKAGE=`. Exit codes unchanged.
- `bin/fusion-stores`: new; exit 0 with six lines, exit 1 on usage.
- Dispatch parameter `**Item:**` → `**Work package:**` (planner, shaper); `**Executors:**` values are the new identifiers; `Executor:` lines in persisted plans are read through the alias until v13.
- Agent names: the seven identifiers; `Agent(fusion:<old>)` does not resolve; `fusion-rules <old>` and `fusion-paths <old>` exit 2 with the rename in the note.
- Citation verdict kinds `package-record`, `package-dir`; `store-prefixed` reports the segment it matched.
- `bin/fusion-events`: one series per role across the rename.

## Testing Strategy

- `npm test` in `hooks/` after every commit; it builds `dist/` first and `committed-dist.test.ts` holds the commit to it.
- Definition equality: `path-literal-lint.test.ts` (tree ↔ `stores.ts`), `fusion-stores.test.ts` (`bin/fusion-stores` ↔ `stores.ts`), `window-bound.test.ts` (table ↔ version).
- Window behaviour: legacy-only and mixed fixtures in `fusion-paths.test.ts`, `fusion-claimed-package.test.ts`, `plan-size.test.ts`, `staging-drift.test.ts`, `citation-grammar-boundaries.test.ts`, `live-circle-record-detection.test.ts`; this repository's own workbench (legacy layout) as the live proof in steps 6 and 9.
- Rename integrity: the roster tests, both goldens regenerated and diffed to key-only changes, `derivable-enumerations-lint` with the widened name class, the reference-resolution lint over every `agents/<name>.md` and heading citation, the smoke runs of step 9.
- Vocabulary: the `grep` of Appendix A as the completeness check; the classification's correctness is read at the plan gate and by the reviewer.
- Bounds: the four bounds as they stand; Appendix B is the measurement record C7 asks for.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Skills have 54 bytes of room and `circles/` → `work-packages/` alone adds 7 bytes on 45 lines; rules and `CLAUDE.md` sit at zero head-room on every dispatch path, and the window subsection is new text emitted to all eleven | Steps 7, 10 and 11 each end with the measurement and take the cut in the same surface, recorded in Appendix B; the help topic's dropped release and the replaced `circles/` paragraph are cuts the spec already asks for. If a surface is red with no honest cut, the work stops there and the head-room question goes to the user (`## Where this work stops`, second clause); no baseline moves and no constant is raised without that ruling. |
| The hook-test surface has 138 lines of room and the window needs new tests | Step 4 pays with comment prose in the test surface, a cut `260822-1154_*_does-the-hook-test-line-budget-cover-comment-prose.md` covers; the renamed test file is re-keyed. |
| An unkeyed rename reads as 175 781 bytes of agent growth and eleven stale keys at once | Step 8 re-keys `AGENT_BASELINE`, `dispatch-path.baseline` and `TEST_LINE_BASELINE` in the rename commit and writes the non-event into the rule's home; the diff of the two baseline files is checked to be key-only. |
| The derivable-enumerations lint's `[a-z]` classes reject hyphens | Widened in step 8, in the same commit as the first hyphenated case arm. |
| A consumer's `rules/context-manifest.yaml` keys `agents:` by old names, and its live plans carry `Executor: coder` | The `Executor:` alias in the orchestrator for the window; the manifest is named in the upgrade note and is part (2)'s to rewrite (seam). |
| `Agent(fusion:shaper)` from a user or a stale prompt aborts Claude at startup with no fusion message | `install.sh` cannot intercept it; `unknown_name_note()` and the `fusion-rules` exit-2 text carry the table for every helper path, and the upgrade note says which names stop resolving, as the v11 note did for five. |
| Old archive sweeps hold `archive/<sweep>/circles/` for ever | `circleDirs()` adds both forms per sweep permanently; `WINDOW_LEGACY_NAMES` governs the live tree only, and the closing release keeps the archive form (named in the subsection so the closing commit does not delete it). |
| The reference pin moves in nearly every commit of this plan | Each commit re-approves it with its attribution line, the mechanism the file prescribes; the executor reports the three figures per commit. |
| The two-session pin: the orchestrator executing this plan keeps dispatching `fusion:coder` from its own loaded roster after step 8 lands | That is the pin working as designed; the orchestrator's session dispatches the old names until restart, the headless proofs of step 9 do not depend on it, and the next session dispatches the new names. |
| Step 7's byte-identical pin forces a migrate edit into part (1) | Named as the seam; the edit is the probe expression and the write targets only. |

## Open Questions

- [ ] `260922-1114_*_does-the-transition-windows-legacy-read-live-at-one-site-per-runtime.md`: option 1 is what steps 2 and 5 realise; the user rules at the plan gate.
- [ ] `260922-1114_*_does-the-container-store-take-the-name-work-packages-superseding-circles.md`: the C6 record, for the user to confirm at the gate (P1).
- [ ] `## Directive` as the record and template heading stays in this item (`### Names this plan fixes`); if the user wants it renamed to `## Brief` now, step 10 renames the five definitions and step 8's orchestrator alias grows by one sentence so a record carrying either heading is read, and part (2) inherits the record rewrite.
- [ ] Appendix A compresses a file wholly in class 3 to one `path:*` row (the upgrade notes carry 88 `Circle` hits between them); the spec's C4 first criterion says one row per `path:line`. The compression stands unless the user wants the rows expanded.
- [ ] The German nouns in step 13 are the planner's rendering of the canonical terms; the user may prefer others.

## Appendix A: classification rule and the surviving-occurrence table

**The rule, per sentence, disjoint by construction.** A line the enumeration returns is either rewritten or classified into exactly one of:

1. **Citation token or record slug, or a fenced exhibit:** the storeless basename, the store-prefixed form inside a fence, a heading cited as it stands in a frozen record.
2. **Persisted string or its reader:** an event type (`gate_hit`, `gate_response`), an `agent` value or the reader lists that keep it (`MEASURED_AGENTS`, `REVIEW_SENDERS`, `MARKER_WORDS`), the `Circle stop conditions` string, `circleOf()`'s prefix, a synthetic event row in a test.
3. **History:** a sentence naming a retired mechanism by the name it had, and every `docs/upgrading-to-*.md` before v12 as a whole.
4. **Claude Code's own surface:** plugin, skill, agent, hook, subagent where the sentence is about the Claude Code mechanism (`plugin.json`, `hooks.json`, `skills/<name>/SKILL.md` as the place a slash command is read, `Agent(fusion:…)`, `subagent_type`, `CLAUDE_PLUGIN_ROOT`, `FUSION_PLUGIN_ROOT`, `bin/fusion-plugin-cwd`, `install.sh`'s marketplace steps, `**Artifact language:**`).

A code identifier that persists nowhere is not a sentence and is not enumerated; the two citation kinds are the exception the spec names. `Gate` and `Verdict` are rewritten by the resolution table in `nomenclature.md` `### How to resolve the ambiguous legacy terms`: user authorises → approval; tests or policy decide → validation check or the named completion condition; a reviewer's assessment → review result; the three-edge Coherence reading → audit result; a binding project choice → decision. `sub-agent` → child run except in a class-4 sentence. `artifact` → artefact in prose; the label `**Artifact language:**` is class 4.

**Enumeration** (run at step 14 from the repository root; the row count of the table below equals its line count):

```
grep -rnE '\b(Circles?|Directive|Grounding|Turn|Artifacts?|artifacts?|Plugin|plugin|Skills?|skills?|Gate|gate|Verdict|verdict|work[ -]items?|sub-agents?)\b|circles/|\*\*Item:\*\*' agents skills rules bin hooks/*.ts hooks/lib/*.ts templates docs README*.md CLAUDE.md .claude-plugin install.sh stilwerk | grep -v '^docs/upgrading-to-v\(9\|10\|11\)'
```

(`-w` is not used: it would refuse `circles/260922-…`, whose `/` is followed by a word character.)

| `path:line` | word | class |
|---|---|---|
| _(written at step 14)_ | | |
| `docs/upgrading-to-v9.md` through `docs/upgrading-to-v11-4.md`, `path:*` | all | 3 |

## Appendix B: measurement record (C7)

Filled by the executor at the end of steps 3, 4, 7, 8, 9, 10, 11; one row per bounded surface per step, and one row per cut.

| Step | Surface | Before | After | Room | Cut taken (file, bytes or lines returned) |
|---|---|---|---|---|---|
| baseline | `agents/*.md` bytes | 320 074 | | 8 493 at `57e2b7eb` | |
| baseline | `skills/*/SKILL.md` bytes | 227 974 | | 54 | |
| baseline | hook tests lines | 22 120 | | 138 | |
| baseline | dispatch paths (eleven totals, `dispatch-path.baseline`) | as keyed | | 0 | |
| baseline | `bin/fusion-citation-check` dangling / store-prefixed over the shipped text | (step 3 records) | | | |
| baseline | reference pin `{paths, anchors, stampBare}` | 1699 / 316 / 11 | | | |

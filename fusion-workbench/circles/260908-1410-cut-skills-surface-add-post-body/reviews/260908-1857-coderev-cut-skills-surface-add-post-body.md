# Code review — cut the `skills/` surface, add the post step body

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `b64b95b5..a98e763b`
**Not-opened:** `skills/archive/SKILL.md`, `skills/direct/SKILL.md`, `skills/migrate/SKILL.md`, `skills/next/SKILL.md`, `skills/setup/SKILL.md`, `docs/messages-between-checkouts.md`, `README-agents.md`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `260908-1612_*_can-migrates-language-preamble-adopt-the-shortened-form-and-keep-its-shell-string-clause.md`, `260908-1612_*_readme-agents-calls-curate-the-only-path-to-claude-md-while-a-lint-forces-a-hand-edit.md`, `260908-1612_*_the-migrate-carve-outs-authoring-home-has-no-heading-a-citation-can-address.md`, `260908-1800_*_three-commits-shipped-a-red-citation-sweep-gate-because-an-expected-red-golden-masked-it.md`, `260908-1814_*_the-layout-rows-skill-split-still-reads-three-and-three-and-omits-post.md`, `260908-1814_*_the-reader-doc-restates-the-twenty-line-cap-and-the-filename-shape-outside-the-one-body.md`, `260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md`, `260908-1422-playmaker-direct-dispatch.md`

**How much of each was read.** The five skill bodies above were read as diffs plus the sections a finding touches, not end to end; `docs/messages-between-checkouts.md` as its changed hunks only; `README-agents.md` as its two changed lines; `hooks/lib/__tests__/reference-resolution-lint.test.ts` as its header and its `BASELINE` line. The Circle record `_t_circle.md` and the eight history files under this Circle's history store were not opened at all. `skills/cleanup/SKILL.md` and `skills/post/SKILL.md` were read end to end, and so was the plan and both relocated reviewer defects.

## Summary

The cut is sound and the arithmetic reconciles independently. What the pass found is a class the cut's own do-not-cut discipline does not cover: two behaviours that were held together by the *placement* of the text rather than by its content, and that came apart when the text moved. Both are on the inline path — the default `/fusion:cleanup` run — and both leave the message unwritten in silence.

## Totals

Critical 0 · High 2 · Medium 2 · Low 2.

## Findings by theme

### The message half was moved out of the pipeline that supplied its inputs

**High — `260908-1851_o_the-message-step-reads-agentstate-yaml-five-steps-after-the-pipeline-deletes-it.md`.** `skills/post/SKILL.md` `## Step 2: compose the draft` takes the commit range from "`session.git_head_at_start` from `agentstate.yaml`". `skills/cleanup/SKILL.md` `## Step 1 — Close the session: file issues for open tasks`, item 4, deletes that file five steps earlier. The pre-cut text read "from **Step 1's read**" (`b0705cc4`), and that phrase was the whole of the coupling. A standalone body is right to name the file it reads; the pipeline is what destroys it, and cleanup already carries the matching capture for exactly one other field — "**Capture the session's domain here, before anything deletes the file**". Two fields are affected, not one: `session.history_file` is the pointer block's second element and `skills/post/SKILL.md` names no source for it at all. `agents/orchestrator.md` states the identical hazard for `bin/fusion-review-coverage` in so many words, so the project knows the shape.

**High — `260908-1852_o_a-survey-that-proposes-nothing-leaves-the-message-draft-with-no-question-to-ride-on.md`.** The draft "rides as a second question in the same `AskUserQuestion` call" as the `CLAUDE.md` gate. `skills/curate/SKILL.md` `## Step 3 — Read what the survey returned` names three branches that make no such call, one of which it calls "the ordinary outcome on a project whose surfaces are current", and `skills/post/SKILL.md` `## Step 4: the two invocation shapes` then says the body "asks nothing of its own on that path". Composed, printed, never written. This is adjacent to open record `260908-0850_*_two-selector-names-share-one-step-and-the-coupling-runs-in-only-one-direction.md` and distinct from it: that record lists the full run as a defined row, and the full run has undecided sub-cases inside a third body.

**Cross-cutting observation.** The two findings share a cause worth naming: the inverted shape moved a *procedure* into `post` and left its *preconditions* in `cleanup`, and nothing in the ledger, the plan or the reconciliation asks what a moved passage was reading from its old neighbours. The reconciliation's grep checked that no element was duplicated. Neither check finds an element that stopped being supplied.

### The attribution chain has one broken link

**Medium — `260908-1853_o_the-reference-count-re-approval-omits-the-file-that-carries-its-whole-movement.md`.** The re-approval written in `22d6f839` reads "paths 1703 -> 1702, anchors 242 -> 240". The pin it replaced was 1692/237 (committed at `3175f39e` and `b0705cc4`) and the pin it set was 1702/240. Its three named shares describe three of the commit's four shipped files; the fourth, the 6 137-byte `skills/post/SKILL.md`, is not mentioned. The gap is attributable and reconciles to the token: eleven plugin-path occurrences and five heading anchors in the new body, which is 1692 + 11 = 1703 and 237 + 5 = 242 — the entry's own "from". Four of the Circle's five re-approvals walk correctly; this one does not join. The pinned number itself is right and the gate is green.

### Two cuts took a sentence the citation does not carry

**Medium — `260908-1854_o_archives-marker-cut-cites-a-list-of-markerless-kinds-that-does-not-carry-the-forum-entry.md`.** `skills/archive/SKILL.md` `## Marker vocabulary` says "the markerless kinds are enumerated there too". The one cited section that enumerates them names "History, review, analysis, investigation, consultation, memo, and cadence"; the replaced table named the forum entry and the cited section does not. Archive's own tier table still states the fact locally, so behaviour is safe. `rules/fusion-workbench-conventions.md` `## Filename Patterns` carries a complete per-kind answer and is the cheaper target.

**Low — `260908-1855_o_the-source-root-cut-left-two-of-four-bodies-without-the-do-not-improvise-instruction.md`.** Row 1's four sites are no longer equivalent. All four carried "Do not improvise the content of a section you could not open" at `94a262b0`; `skills/cleanup/SKILL.md` and `skills/help/SKILL.md` kept it or an equivalent, `skills/setup/SKILL.md` and `skills/next/SKILL.md` did not. The restated half of the row is fine: `bin/fusion-source-root`'s header genuinely carries the branch, the guard, `UNRESOLVED`, the read-versus-run split and the "explicitly UNANSWERED" part (c) warning, so those four citations are accurate.

### The new step is invisible where the pipeline describes itself

**Low — `260908-1856_o_the-message-pass-is-missing-from-both-user-facing-enumerations-of-what-cleanup-does.md`.** `skills/cleanup/SKILL.md` `## Step 8 — Report` has a line per step and none for the message, so `skills/post/SKILL.md` `## Step 6: report` has nowhere to land on the inline path and every reason a message goes unwritten is silent on an unattended run. `skills/help/SKILL.md` item 6 describes the pipeline without the message pass and offers `--only forum` eleven words later.

## What was checked and found sound

- **The load-bearing claim holds under a different method.** Rather than grepping four known elements, both bodies were read as an executor would run them. `skills/cleanup/SKILL.md` `### The message half` states four things and every one of them is cleanup's own: which call the draft rides, what `--skip claude-md` drops, what `--dry-run` does, what `--only forum` runs alone. It states no part of the composition contract. `skills/post/SKILL.md` states the contract and no pipeline flag semantics. The inversion is clean.
- **The arithmetic, recomputed from the golden rather than from the reported figures.** Per-file deltas in `hooks/lib/__tests__/fixtures/surface-growth.golden` sum to −2 837 against 259 495, giving 256 658; splitting cleanup's −1 894 into its cut share and its stanza share reproduces −8 161 / −1 050 / +6 137 / +221 / +16 exactly. No growth baseline moved; `git diff b64b95b5..HEAD` over `surface-growth-bound.test.ts` and `rules-emission-golden.test.ts` is empty.
- **The two relocated defects survive and their new citations resolve.** `260908-0849_*_the-twenty-line-cap-counts-a-draft-that-is-never-the-file-that-gets-written.md` — `$DRAFT` is still assigned by no step, the write is still "On yes, and only then", and the exact-count-versus-ceiling ambiguity is unchanged; `260908-0850_*_two-selector-names-share-one-step-and-the-coupling-runs-in-only-one-direction.md` — the selector table still lists two independent names and states no coupling. Every heading anchor either record now cites exists in the file it names. Neither defect was silently fixed.
- **Migrate's row-6 pointer is honest.** `rules/workbench-path-resolution.md`'s paragraph beginning "One consumer names the layout literally" does carry all three reasons in full, and the cut incidentally removed a `bin/fusion-paths:245-248` line-number citation that `rules/fusion-workbench-conventions.md` `## Filename Patterns` forbids in living text.
- **`bin/fusion-paths post` exits 0 and emits `WORKBENCH` and `OUT_FORUM`.** `npm test` from `hooks/` is green at `a98e763b`: 53 files, 925 tests, exit 0. `bin/fusion-citation-check` reads `verdict=clean`, `edited-violations=0`.

## One amendment owed to an open record, not re-filed

`260908-0850_*_two-selector-names-share-one-step-and-the-coupling-runs-in-only-one-direction.md` was filed when `--only forum` was named in one file. It is now named in five: `skills/cleanup/SKILL.md`, `skills/post/SKILL.md` (its frontmatter and `## Step 4: the two invocation shapes`), `skills/help/SKILL.md`, `CLAUDE.md` and `docs/fusion-intro.md`. The coupling that makes it not-independently-selectable is stated in two of those five. The record's acceptance test still covers the fix; whoever takes it should know the surface it has to reach grew.

## Recommended sequencing

1. `260908-1851` and `260908-1852` before any release that documents the message half as working on the default path. Both are inline-path defects on the pipeline fusion tells users to type and walk away from, and neither shows up under `--only forum`, which is the shape the feature was exercised in.
2. `260908-1853` while the tree still reproduces the measurement — the entry is corrected by measuring, and every further re-approval makes the reconstruction harder.
3. `260908-1854`, `260908-1855` and `260908-1856` are cleanup, and the last two are a clause each.

None of the six blocks a release.

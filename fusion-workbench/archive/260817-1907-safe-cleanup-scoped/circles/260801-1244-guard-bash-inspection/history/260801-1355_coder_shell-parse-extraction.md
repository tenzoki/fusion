# Coder — plan step 1: extract the shell parser, add quoted-word capture

**Date:** 260801-1355
**Agent:** coder
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Plan:** `planning/260801-1253_o_plan-guard-bash-inspection.md` — step 1 only
**Status:** Complete

## What was implemented

`hooks/lib/shell-parse.ts` (new) now owns the generic shell lexer: `stripDataRegions`,
`extractCommandSegments`, `tokenize` and the two private helpers (`blankData`,
`findHeredocTerminator`), moved verbatim out of `git-branch-guard.ts`. That module imports
them and re-exports `stripDataRegions` and `extractCommandSegments` under their original
names, so the 84-case git suite keeps its import path and every assertion unchanged.

New capability in the same module:

- `parseCommand(command, { quoted: "blank" | "capture" }) -> { segments, literals }`,
  segments in source order carrying a subshell `depth` (0 = outer).
- `resolveWord(token, literals) -> { value } | { unresolved: true }`.

## Verification

`npm test` in `hooks/`: **346 passed, 13 files** (316 before, 30 new).
`git-branch-guard.test.ts` is byte-unchanged and its 84 cases pass.
`npx tsc --noEmit` clean. `hooks/dist/` untouched (step 8 rebuilds it).

The four acceptance criteria are covered in `hooks/lib/__tests__/shell-parse.test.ts`.
The blank-mode equivalence case **harvests** the command corpus out of
`git-branch-guard.test.ts` at test time (85 commands, including the `+`-concatenated
multi-line heredoc ones) rather than copying it, so a case added there is pinned here
automatically. A vacuity floor (`> 70`) fails the test if the harvest regex stops matching.

## Decisions taken inside the step

**Capture mode replaces the whole quoted region, quotes included**, with a placeholder
`U+0001q<n>U+0001`. The step said "the region's content"; keeping the quotes would have
required `resolveWord` to strip single quotes too, which its stated contract (placeholders
plus double quotes) does not mention. Consuming the quotes makes that contract sufficient
and keeps a stray quote character out of the operand text a classifier reads.

**The wrapper character is `U+0001`**: not whitespace, not a shell operator, not `=` (so a
placeholder can never be mistaken for a leading `VAR=value` env assignment), and not the
segmenter's own `NUL` sentinel. Capture mode neutralises any `U+0001` already present in
the input to a space before parsing, so a placeholder cannot be forged from the command
string. Blank mode does no such rewrite, which is why it stays byte-identical to today.

**The flat `extractCommandSegments` was kept, not reimplemented on top of the new scanner.**
Making it a thin wrapper would have turned the blank-mode equivalence criterion into a
tautology and put the git classifier on brand-new code in the same step that was required
to change nothing for it. Two segmenters now coexist, pinned against each other by the
corpus test. Once the mutation classifier is proven (after step 6), the git classifier can
move to `parseCommand` and the flat form can go; that is a follow-up, not this step.

**One deliberate behavioural divergence in the new scanner**, documented at
`scanSegments`: an unterminated backtick makes the remainder a subshell body (fail-closed,
matching how an unbalanced `$(` is already treated), where the flat segmenter leaves a lone
backtick as literal text and can miss a command after it. No command in the existing suite
hits the divergence — the corpus equivalence test passes on all 85 — and the git classifier
still runs on the flat form, so nothing changes for it.

## The security property, verified rather than assumed

Capture mode had to keep quoted text inert without blanking it. `shell-parse.test.ts`
asserts that for eight inert shapes — `echo 'rm -rf rules/'`, and the same with a leading
`;`, `&&`, `|`, `$(…)`, backticks, `>` and an embedded newline — the only command word in
the whole parse is `echo`. A placeholder carries no whitespace and no operator, so it can
only ever *reduce* segmentation; it cannot introduce a segment or a command word that
blanking would have hidden.

Quoted-delimiter heredoc bodies stay blanked in both modes: a body containing
`rm rules/x.md` produces no such word and no captured literal. An unquoted-delimiter
heredoc body is still classified as code.

## Files

- `hooks/lib/shell-parse.ts` — new
- `hooks/lib/git-branch-guard.ts` — 304 lines removed, imports + re-exports added
- `hooks/lib/__tests__/shell-parse.test.ts` — new, 30 cases
- `fusion-workbench/circles/260801-1244-guard-bash-inspection/planning/260801-1253_o_plan-guard-bash-inspection.md` — step 1 marked `[DONE]`

Not committed — the orchestrator commits.

## Note for the orchestrator

`agents/ontocoder.md` shows as modified in the working tree (+7 lines). It was not touched
by this task and was already dirty when the task started under a different edit; it is not
part of this step's diff.

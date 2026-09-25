# Analyst — C3 step 12, the decision-closing half

**Date:** 2026-08-24 15:24
**Agent:** analyst
**Circle:** `260824-0530-record-attribution-and-circle-claim`
**Plan:** `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` step 12
**Status:** Complete

## Scope

Step 12's decision-closing half only. The Turn log entry on `_t_circle.md` was excluded by the
dispatch, because it needs the Coherence verdict and the orchestrator writes it at Phase 4. That
file was not opened for writing and does not appear in this pass's diff.

## What was done

Three decision records in `shared/decisions/` each gained an `Implemented:` line and an `## As
realised` section, then moved `_a_` to `_i_` by `mv`. Stamp and slug are byte-identical on all
three; only the marker changed.

| Record | `Implemented:` names | Marker |
|---|---|---|
| `260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` | `3ba7a46`, `2b055a0`, `0a726b5`, `d34141c`, `12b56d1`, `9efe19f` | `_a_` to `_i_` |
| `260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md` | `2b055a0` | `_a_` to `_i_` |
| `260807-0158_*_how-is-a-unique-record-filename-obtained.md` | `2b055a0` | `_a_` to `_i_` |

Every hash was read against its own diff with `git show --stat` and, where the claim was about
specific text, with `git show <hash> -- <path>`. None was inferred from a subject line.

## The third record's condition was met, and the check is stated

`260807-0158_*_how-is-a-unique-record-filename-obtained.md` set one condition for
itself and restated it in three reconciliations: it moves to `_i_` when the cite-by-full-filename
rule lands in `rules/fusion-workbench-conventions.md` `## Filename Patterns`. It landed there in
`2b055a0`, as one added paragraph, and that paragraph stands at HEAD in that section. Three further
checks are recorded in the record itself: the section, not a neighbour; normative form rather than
practice; and nothing the record forbade was done, which `git diff e209011..HEAD` over that rule
file confirms as additions with one exception, the `**Filed by:**` template line gaining its person
half.

## One repair outside the three records, and why it is inside the bound

The rename of `260807-0158` staled two citations that spell its old `_a_` marker, both in
`260808-0030_*_line-number-citations-into-rule-files-go-stale-and-no-gate-reads-them.md`
at lines 10 and 27. `hooks/lib/__tests__/workbench-citation-lint.test.ts` failed on them, which is
the gate working: that issue is `_o_` and therefore in the recomputed corpus.

Both were re-pointed to the ratified wildcard form and nothing else in the file was touched. The
obligation is the renaming party's by
`260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`,
whose answer is that the lint is the whole mechanism and that a change renaming a record's marker
carries the grep for the old name itself. The plan's acceptance forbids rewriting a pre-Circle
record "for any other reason"; this is the reason, and the edit changes three characters in a marker
position rather than a word of what the issue says. The precedent is
`260810-1205-reconciliation.md`, which describes the same operation as re-pointed
rather than rewritten.

## Verification

`npm test` in `hooks/`: 732 tests across 42 files, all green, run after the renames and the repair.
The two citation gates were run alone first and reproduced the failure before the repair and the
pass after it.

## Found and not changed

- `260807-0158`'s header still cites `## Filename Patterns` at lines 185-208 and the section has
  moved twice. Left as it stands: it is the first measured instance of the issue named above, and
  repairing it would remove that issue's evidence.
- `260807-0158` carries a `**Status:** answered` head field. `rules/fusion-workbench-conventions.md`
  `## Decision Record Template` says to leave such a field exactly as it stands, including when
  transitioning the record. Left.
- `260824-0613_*_does-a-filing-agent-halt-in-a-tree-that-is-not-a-git-work-tree-at-all.md`
  is `_a_` with an `Answered:` line and an empty `Implemented:`, and its answer looks realised by
  `3ba7a46` (the helper's exit 4) and `2b055a0` (the two halt conditions in `### Who filed it`).
  It was not in this dispatch's scope and was not touched.
- All three records leave the citation gate's corpus on reaching `_i_`, so the citations they carry
  are no longer judged. That is the hole the gate's own header documents, not a new defect.

## One process error of mine

The first sweep for citations spelling the old markers was piped through `head -20` and the two that
actually mattered fell below the cut. The gate caught what the truncated grep missed. The sweep was
re-run untruncated afterwards and found no further live instance.

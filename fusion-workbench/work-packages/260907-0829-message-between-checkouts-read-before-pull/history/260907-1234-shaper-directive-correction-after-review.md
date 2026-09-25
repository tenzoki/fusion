# Shaping session: the message Circle's Directive corrected against the pre-activation review

**Status:** Complete
**Filed by:** shaper (portfolio-activation mode, scope directive-only), Kai Stalmann <ks@qantr.com>

## Mode and what initiated it

Portfolio-activation, scope `directive-only`. The record's `**Active spec/plan:**` reads
`(none yet)`, which is what permits that scope and forbids the `spec` one, and the marker is
`_a_`; both were read off the file before anything was written.

The run was initiated by the user in chat on 2026-09-07. Asked what to do with the analyst's
review, given that it refutes two statements in the record and leaves five points open, the
user chose "correct the record" over clarifying without writing and over an assessment alone.
That question, that option and that date are what stands in place of a dispatch parameter
line, since this run was started by the user directly rather than dispatched.

## What was read

`260907-0840-spec-review-message-between-checkouts.md` and the two decision records it filed,
`260907-0902_*_where-does-the-message-approval-sit-now-that-the-cleanup-pipeline-has-exactly-one-stop.md`
and
`260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md`,
both carrying the user's ruling in their body. The two heaviest findings were re-measured
rather than taken on trust: `bin/fusion-cadence-anchor` was read at its `changed-files` and
`changed-since` implementations, confirming the range's right-hand side is the literal `HEAD`
and that a `git status --porcelain` working-tree read is folded in; `skills/cleanup/SKILL.md`
and `skills/archive/SKILL.md` were read at the tier selection and the threshold parse,
confirming that the pipeline runs tier-1 only and that one threshold, fourteen days by
default, is parsed once per run. Both findings hold as written.

## Decisions taken with the user

Two rounds, six decisions, plus one the user answered by correcting the question.

1. **The context-freedom obligation is authored in the writing step's own body**, not as a
   named exception in `rules/user-facing-output.md` `## Vocabulary`. A later store wanting the
   same rule has nothing to point at, which is the accepted cost.
2. **A standalone run writes the file and tells the user to carry it in their next commit.** It
   touches git not at all, over having it commit and push for itself and over dropping the
   standalone path.
3. **The cap is twenty lines, eight of them the person's part**, counted in the file rather
   than on the display.
4. **The read mark advances after rendering.** A message seen and then abandoned does not come
   back; the alternative would replay every message until a pull happened.
5. **The reading skill is `news`.** The user rejected the consultation's `hark` outright: the
   word says what it does.
6. **`news` takes no argument** and, when nothing is new, says so rather than printing nothing.
   The second half came from the user's own wording rather than from an option offered.

## What was written

Two sections of `_a_circle.md` were replaced in place and no other section, field or file of
that record was touched: `## Directive` and `## Grounding snapshot`. `**Active spec/plan:**`
was left at `(none yet)`, no spec was written, the marker was not moved and `.active-circle`
was not touched.

The Directive now carries the corrected retention rule (tier-1, the run's own threshold,
fourteen days), the gate folded into the pipeline's single stop with both flag consequences
named, the reading skill's own delta computation, the four properties a first fetch and a
first ref-content read have to state, the six settled user decisions, and a fuller list of edit
sites: `rules/workbench-path-resolution.md`, `## Filename Patterns`, `CLAUDE.md`,
`README-agents.md`, the growth-bound fixture and the path-literal gate. The claim that
`rules/workbench-tracking.md` incurs a cost was dropped, since that file's own text says a new
store under `shared/` needs no exception.

The Grounding snapshot now records both refuted claims in their false form as well as their
correction, so a later reader does not go hunting for a component that never existed, and adds
the growth head-room as a number measured at HEAD `3639813c` rather than as a warning.

One residual is written into the Grounding rather than decided: the user types `news` while
the files sit in `shared/forum/`. Both names are the user's own, ruled at different moments,
and one name per thing is the standing style rule, so the reconciliation is put to the user
once at planning instead of being picked here.

## Also filed

`260907-1234_*_the-spec-review-analysis-ends-with-two-lines-of-tool-markup.md`, against the
analysis file's last two lines, which are fragments of the write call rather than report
content. Checked first against every open defect in this Circle's store and the shared one; no
duplicate.

## Verification

`bin/fusion-prose-metric` over the rewritten record and this history file. `bin/fusion-citation-check`
filtered to this Circle's files. Both results are in the closing report.

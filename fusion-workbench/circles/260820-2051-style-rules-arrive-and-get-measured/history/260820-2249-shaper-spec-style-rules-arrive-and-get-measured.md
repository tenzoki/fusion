# Shaper run: the spec for the style-rules Circle

**Date:** 2026-08-20
**Mode:** in-Circle clarification, dispatched by the orchestrator
**Circle:** `circles/260820-2051-style-rules-arrive-and-get-measured`
**HEAD read:** `a5b73da`
**Output:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_o_spec-style-rules-arrive-and-get-measured.md`

## What was read

The Circle record, the answered decision
`shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`,
all sixteen defect records named in the dispatch, the recommendations and findings 1, 9 and 10 of
`shared/analyses/260816-0740-rhetorical-register-of-agent-output.md`, `rules/user-facing-output.md`,
`rules/critical-stance.md`, `bin/fusion-rules`, `skills/setup/SKILL.md` Steps 0b, 0d and 0f, and the
two growth-bound test files with their baseline maps.

## What was measured rather than read

- The always-on emission set, by running `bin/fusion-rules coder` and `bin/fusion-rules orchestrator`.
  Six files for every agent.
- The corpus em-dash rate under a markdown-aware and YAML-aware exclusion: 171 prose em-dashes over
  13 283 prose words, against 13 permitted. Raw counts total 210, so 39 are the files' own exhibits.
- `rules/user-facing-output.md` carries one em-dash in its own voice, not six.
- The four growth budgets. Always-on 5 704 bytes of head-room, `agents/` 2 259, `skills/` 8 547,
  hook test lines **116**.
- The three stations of the stylometric profiles. Work tree and installed copy are byte-identical for
  all four files; the workbench copies of the two chat profiles differ.

## What was found that no record carried

`rules/workbench-tracking.md` is emitted to no agent. The decision record's 260819-1400 reconciliation
and this Circle's own Grounding snapshot both state that it was added to the emitted set and that the
corpus therefore grew. The commit that created it moved text out of an emitted file, so the corpus
shrank. Filed as
`circles/260820-2051-style-rules-arrive-and-get-measured/issues/260820-2249_o_the-always-on-corpus-is-said-to-have-grown-by-a-file-that-is-emitted-to-no-agent.md`.

## Clarification channel

None available. The dispatch was non-interactive and the user was away, so no round was put to
anybody. Six questions are batched at the end of the spec under `## User Decisions Pending`, each with
options and a recommendation, and five that looked open are answered from the records under
`## Answered from the records`.

## Shape of the result

Three root causes, six mechanisms, ten capabilities. Twelve of the seventeen records are resolved
outright, two in part, one is already closed, one is deliberately left open with the reason, and one
is the decision the Circle advances rather than closes.

Two decidability questions were answered rather than approximated, per `rules/critical-stance.md` §4.
A byte comparison cannot tell a stale copy from a local adaptation, so the mechanism gains a
provenance record and the split becomes five disjoint cases. And the register measurement cannot
decide causation from the inputs available, so it produces a rate under a protocol registered before
the repair lands, and says in its own text what it does not establish.

The spec was written at zero prose em-dashes, deliberately, because the post-repair measurement window
is contaminated by whatever the writing agents read in this Circle's own planning documents.

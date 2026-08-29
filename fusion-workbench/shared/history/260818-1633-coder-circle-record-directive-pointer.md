# Coder — the Circle record's Directive becomes a pointer, and gains a writer

**Date:** 2026-08-18
**Agent:** coder
**Status:** Complete
**Plan:** `260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md` (all seven steps, one change)
**Decision realised:** `260818-1504_*_how-does-a-circle-record-carry-its-directive-once-a-spec-exists-and-who-may-correct-it-before-one-does.md` (option 1), and `260815-2312_*_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md` (step 6, taken at the gate)
**Defect closed:** `260815-0752_*_no-agent-may-revise-an-active-circle-records-directive-so-a-revision-leaves-it-contradicting-the-spec.md`

## What landed

One invariant, enforced from both ends by parties already doing the adjacent work:

> A Circle record's `## Directive` holds prose **if and only if** its `**Active spec/plan:**` reads
> the literal `(none yet)`.

Where the field cites a file, the section body is exactly:

```
See `**Active spec/plan:**` above. The cited spec or plan states the Directive in force.
```

The pointer cites the **field**, never the path the field holds — a pointer naming the path would
reintroduce the duplication one level down, and would not survive a field that carries a qualifying
sentence or more than one path.

| Step | File | What changed |
|---|---|---|
| 1 | `rules/circle-records.md` | New `### The Directive is a pointer once a spec exists`: the literal, why it cites the field, the invariant, the recognition rule, and why no migration exists. The template's `## Directive` placeholder carries both cases. |
| 2 | `agents/orchestrator.md` | Fourth permitted content write (the fixed literal only, riding a field write, never authorship); the head-fields rule that makes the swap ride every write of `**Active spec/plan:**` off `(none yet)`; the shaper-dispatch permission widened to `_t_` records with `**Scope:**` as a fourth parameter line; the Rebalance **Revise Directive** bullet states that no new mechanism sits there. |
| 3 | `agents/shaper.md` | Mode 3 accepts `_a_` or `_t_` and halts on terminal; `**Scope:** directive-only \| spec`, absent = `spec`; under `spec` the pointer literal goes into the record and the refined Directive into the spec; under `directive-only` the field is read first and anything but `(none yet)` halts. `## Scope` exception paragraph brought in line. |
| 4 | `skills/next/SKILL.md` | The Step 6.5 handoff names both cases instead of instructing an unconditional read of the section. |
| 5 | `README-agents.md` | Shaper and orchestrator rows; `**Circle file:**` row widened; new `**Scope:**` row; the two measured-stale citations corrected and every citation the earlier steps shifted re-measured against the file. |
| 6 | three files + `agents/shaper.md` | `**Status:**` dropped from the template, the head-fields table, the Phase-4 closure write, `/fusion:next` Step 6.2's `awk` pass, and the anticipated-circle frontmatter fill. |
| 7 | — | `npm test` in `hooks/`, exit 0. |

## Verification

`cd hooks && npm test` — **exit 0**, 36 files, 672 tests.

Growth measured against each bound, not assumed. No baseline was edited.

| Surface | Head-room at HEAD `83d3b04` | Spent here | Left |
|---|---|---|---|
| `agents/` (18 000 bytes) | 12 255 | +5 615 | 6 640 |
| `skills/` (20 000 bytes) | 10 515 | **−1 159** | 11 674 |
| always-on rule core (12 000 bytes) | 4 534 | 0 | 4 534 |
| hook tests (2 500 lines) | — | +28 lines | 1 996 |

`rules/circle-records.md` grew 12 100 → 14 832 bytes and lands on the role-specific extras, which
`rules-emission-golden.test.ts` reports on and never fails — verified at `bin/fusion-rules:432`,
inside the `IS_CIRCLE_AGENT` conditional.

Three measurement fixtures were re-approved by their own documented procedures, which is not a
baseline edit: `surface-growth.golden` and `rules-emission.golden` by their `UPDATE_*` commands, and
the pinned reference count in `reference-resolution-lint.test.ts` (paths 1 125→1 133, anchors
139→145, records 95→97), each delta attributed per file by reverting that file and re-running the
gate, and logged in that file's own re-approval comment.

One citation was rewritten to sit on a single line: `rules/circle-records.md` `## Circle record
template` in `agents/orchestrator.md` had a line break between its two backtick spans, so class (b)
of the reference lint had never resolved it. It resolves now, and it is one of the six anchors.

## Read-through

`agents/shaper.md` mode 3, end to end as a dispatched agent would read it. Four halts, non-overlapping,
no case left open: no `**Circle file:**`; a record with a terminal marker; dispatched without
`**Initiated by:**`; `**Scope:** directive-only` against a field that cites a file.

## What was not done, and why

- **Eleven Circle records, all terminal — nothing converted.** No migration exists, per the plan's
  transition argument: a terminal record is history, and converting the one worked instance would
  delete the evidence the defect points at.
- **The heading `## Re-sharpening an anticipated Circle (shaper portfolio-activation)` was not
  renamed.** The plan names it as a site, not as a thing to change; renaming it also breaks the
  class-(b) citation `agents/shaper.md` carries. It now under-describes its section the same way the
  mode's wire name under-describes the mode, which is the residual decision `260818-1512` accepted.
  A paragraph inside the section states what the mode covers.
- **Nothing enforces the invariant mechanically.** No gate compares a record's `## Directive` against
  its `**Active spec/plan:**`. The plan's third Open Question, still open.

## Beyond the plan's literal bullets

Two edits the plan's step lists did not name and coherence required:

- `agents/shaper.md` frontmatter `description` said the mode re-clarifies "an `_a_` anticipated
  Circle's Directive ahead of activation". Left alone it would contradict the mode body and the
  README row step 5 corrects.
- `agents/shaper.md` anticipated-circle mode wrote `**Status:** anticipated` into every new record.
  Step 6 removes the field from the template, so the fill had to go with it. The plan's step-6 file
  list named three files and this is a fourth.

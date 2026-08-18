# Should the decision record's `**Status:**` field exist at all, now that the Circle record's has been removed?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator
**Cross-references:** `shared/issues/260812-1232_o_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md` (the defect that reserves this question), `shared/decisions/260815-2312_i_should-the-circle-records-status-field-exist-at-all-now-that-both-transitions-maintain-it.md` (the same question for the Circle record, answered option 1 and implemented 2026-08-18), `shared/issues/260811-2146_o_half-the-decision-records-carry-a-status-that-disagrees-with-their-marker-and-twelve-keep-the-unfilled-template-stub.md`, `shared/issues/260811-1734_o_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md`, `shared/decisions/260810-1635_a_where-does-the-obligation-sit-to-update-the-artefact-that-explains-a-behaviour-when-the-behaviour-changes.md`, `rules/fusion-workbench-conventions.md` `## Decision Record Template` and `## State Markers — decisions`

---

## Question

A decision record carries its state twice: as the marker on its filename (`_i_`) and as a
`**Status:**` field in its head. `## State Markers — decisions` makes the marker normative and the
transition *is* the rename; the header is a hand-maintained second copy, edited separately or not at
all.

The identical construction was removed from the Circle record on 2026-08-18. `260815-2312` put the
question, the user answered option 1 — drop the field, the marker is the only source — and the
removal landed in commit `95bebe1`. What that decision settled for one record kind, it did not
settle for this one. `260812-1232` has held the question for the decision store since 2026-08-12,
naming two candidate answers and explicitly declining to choose between them, and the curator run of
2026-08-18 (`shared/history/260818-2050-curator-run.md`) declined to propose a correction for
exactly that reason: an open defect reserves the question.

This record puts the question so it can be answered rather than reserved.

## The measurement

Taken 2026-08-18 at HEAD `53b6862`, by reading the marker out of each filename and comparing it with
the first `**Status:**` line in that file's body:

| Store | Records | Header disagrees with marker |
|---|---|---|
| `shared/decisions/` | 51 | 20 |
| `circles/*/decisions/` | 43 | 19 |
| **Total** | **94** | **39** |

Breakdown of the 39, as marker against header:

| Marker | Header says | Count |
|---|---|---|
| `_i_` implemented | `answered` | 14 |
| `_i_` implemented | `open` | 13 |
| `_a_` answered | `open` | 8 |
| `_d_` deferred | `open` | 3 |
| `_s_` superseded | `open` | 1 |

A naive comparison reports **44**, which is the figure the curator run carries, and the two figures
reconcile exactly: 39 headers contradict their marker, and **5** more carry the right state in a form
the template does not use. Four of those five hold the correct word followed by a parenthetical
annotation an earlier reconciliation added, for example `260803-1803_i_*` reading "implemented
(corrected from `open` by reconciliation 260804-1021; the filename marker `_i_` was already right)".
The fifth, `circles/260718-1924-v5x-overhaul/decisions/260718-2150_i_*`, leads with the marker itself:
`**Status:** _i_ (implemented — …)`. None of the five misleads a reader about the state, so none is
counted as drift here.

**The criterion matters and is stated once.** A record counts as drift when its header names a state
its marker does not. It does not count as drift merely for departing from the template's wording. An
earlier revision of this record used the first criterion in its prose and the second in its
arithmetic, which is what put the `260718-2150` record among the 39; the correction is filed as
`shared/issues/260818-2228_o_the-status-field-decision-record-miscounts-its-own-measurement-in-three-places.md`.

**The trend across five measurements of the same store, each re-derived rather than carried
forward:** 34 of 74 (2026-08-12), 35 of 86 (2026-08-14), 39 of 100 (2026-08-16, coderev), 37 of 106
(2026-08-17, reconciler), 39 of 94 today. The five earlier figures are each that pass's own
criterion, which was the whole-field comparison; on that criterion today's figure is 44. The population moves as records are archived and filed;
the ratio has not improved in six days, across at least three hand corrections.

**One instance is worth naming on its own.** `260815-2312`, the decision that removed this very
field from the Circle record, carries `**Status:** answered` under a filename marked `_i_`. The
record that argued the field cannot be kept in step is itself out of step.

## What actually reads and writes the field

Measured by grep over `agents/`, `skills/`, `rules/`, `templates/` and `hooks/lib/__tests__/`:

- **Two shipped surfaces define it for this record kind:** `rules/fusion-workbench-conventions.md`
  `## Decision Record Template` (the template line itself) and `rules/decision-record-examples.md`
  (the worked example's head). No agent prompt spells the decision-record field out; the writers
  follow the template.
- **No gate reads it.** `hooks/lib/__tests__/marker-format-lint.test.ts` scopes to `agents/*.md` and
  `skills/*/SKILL.md` and never opens the workbench. Nothing else compares the two.
- **The name `**Status:**` is shared by five unrelated artifact kinds** — session histories, plans,
  analyses, consultations and decision records — with different vocabularies (`Complete`, `Draft`,
  `Approved`). Removing it from the decision template touches none of the others, and any change
  must be scoped by artifact kind rather than by the string.

That change surface is markedly smaller than a first grep suggests: two rule files, not the fourteen
files that mention a field of that name.

## Options

1. **Drop the field from the decision-record template; the filename marker is the only source.**
   - Pros: one fact in one place. A transition cannot skip an update that does not exist. It is the
     answer already given for the Circle record six hours ago, and the same shape as this project's
     removal of seven hand-written counters from `agentstate.yaml`. The change surface is two rule
     files.
   - Cons: a record opened alone no longer states its state in its body. Needs an explicit position
     on the 94 records that carry the field today.
2. **Keep the field and add a lint that re-derives the expected word from the filename.**
   - Pros: keeps a record self-describing; makes the drift impossible to leave. Head-room on the
     hook-test surface is 1 972 lines of 2 500, re-derived at `8fa3286`: the per-file baseline in
     `surface-growth-bound.test.ts` sums to 17 875 and the surface measures 18 403.
   - Cons: does not shrink the surface, which is what `260811-1734` is open to do. A hard gate fails
     immediately on **44** records nobody intends to edit — the 39 that name the wrong state plus the
     5 that name the right one in another form, since a lint re-deriving the expected word demands
     the word exactly — so it needs either a sweep first or a grandfather clause, and a grandfather
     clause is a second rule about the same field.
3. **Keep the field and declare it decorative in the template.**
   - Pros: one paragraph, no migration.
   - Cons: leaves a field that reads as authoritative and is not. `260815-2312` judged this the worst
     of the three for the Circle record, because a reader cannot tell a decorative field from a stale
     one.

## Constraints

- Whatever is chosen holds for **every** decision store, the Circle ones included. The measurement
  splits 20 shared and 19 Circle, so a shared-only answer leaves just under half the population
  untouched.
- The five artifact kinds sharing the field name must not be touched by a change aimed at this one.
- This project does not rewrite existing artifacts retroactively. Option 1 needs a stated position on
  the 94 records that carry the field; the Circle precedent's position was to leave them exactly as
  they stand, with all three affected surfaces saying so rather than correcting them.
- `260816-0740_a_*` argues against a hard gate that fails on a corpus nobody is going to edit. Option
  2 meets that argument directly and must answer it.

## Recommendation

Option 1, and the timing argument that held the Circle version back is spent. `260815-2312` deferred
its own answer to "the next Circle that touches Circle records for another reason", which fired on
2026-08-18. No comparable Circle is pending for the decision store, so waiting for one means waiting
indefinitely while the ratio holds at roughly two in five.

The counter-argument, that a record should state its own state, is weaker here than it was for the
Circle record: a decision record is almost always read from a listing or a citation, both of which
show the filename, and the marker vocabulary is richer than the Circle one precisely so the filename
can carry the distinction between answered and implemented.

Option 2 is defensible if the project wants the body to stay self-describing, but it should then be
paired with a single sweep, because a gate that starts red teaches people to ignore it.

This record does not choose. The user does.

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>
Retired: <set when the implementation is removed; the marker stays _i_>

---
**Reconciliation 260818-2230** (reconciler, domain `code`). The measurement above was re-derived
independently at HEAD `53b6862` and reproduces exactly — 94 records, 40, the 20/20 split, the naive
44 and all six breakdown rows. Three counts *about* the measurement do not, and are filed as
`shared/issues/260818-2228_o_the-status-field-decision-record-miscounts-its-own-measurement-in-three-places.md`:
the 40 includes one header that agrees with its marker in marker form, so the count of *disagreeing*
headers is 39; "four measurements" is followed by five; "thirteen files" is fourteen in the grep
scope this record states. None of them changes the finding, the options or the recommendation. Read
the defect before acting on a figure from this record.

Marker stays `_o_` and the `**Status:**` field above is left exactly as it stands: this record is
the open question about that field, and correcting its own header would remove one data point from
the population it measures.

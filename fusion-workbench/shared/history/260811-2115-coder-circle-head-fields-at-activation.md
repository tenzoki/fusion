# coder — Circle activation sets the record's head fields

**Session:** 260811-2115-coder-circle-head-fields-at-activation.md
**Agent:** coder
**Status:** Complete
**Task:** One transferred defect — `260811-0932_*_die-circle-aktivierung-zieht-die-kopffelder-des-datensatzes-nicht-nach.md`
**Decision realised:** option 1 of that record, taken by the user at a gate on 260811-2050

## What the defect was

On `_a_`→`_t_` activation the record is renamed and `.active-circle` written, while three head
fields of the same record stand still: `**Status:**` keeps `anticipated`, `**Active
spec/plan:**` and `**Active session history:**` keep `(none yet)`. The record walked the four
candidate owners and showed each excluded, so the fields were nobody's work. Measured twice in
one session; the workaround both times was a separately dispatched `ontocoder`.

## The boundary, and how many places state it

Three, found before any was changed:

1. `agents/orchestrator.md` `## Scope`, the "You may" list — "the only Circle-record content
   write the orchestrator performs; full-content edits remain off-limits".
2. `agents/orchestrator.md` Phase 4 step 3 — the site that performs the closure-note write and
   describes it as the write being performed there.
3. `skills/next/SKILL.md` `## Boundaries` — "The skill never writes Circle *content*. Its only
   writes are the record rename, the `.active-circle` write, and the dashboard placeholder."

All three were changed. A fourth thing turned up that is not a statement of the boundary but
contradicts it: `agents/orchestrator.md` `### Drift check` requires the orchestrator to write
the Circle's `## Turn log` entry (its table has a `Circle Turn log` row and its repair step
names the write), and queue entry 60 says the same. So site 1's word "only" was already false
before this change. The widened bullet enumerates the Turn log rather than leaving a reader to
conclude it is forbidden.

## What changed

**`agents/orchestrator.md`**

- `## Scope` — the single closure-note bullet became an enumeration of three permitted
  Circle-record content writes: the Closure note, the Turn-log entry, the three head fields.
  Everything else, and any full-content rewrite, stays off-limits in the same sentence.
- New section `## Circle head fields` (between `## Scope` and `## Plane mirror`). It defers the
  field semantics to `rules/circle-records.md` `## Circle record template` — including that
  rule's workbench-relative-path requirement — and states only *when* each field is written, as
  a six-row table of act → field → value. It also states that `(none yet)` is a value rather
  than a gap, that no path may be invented for a file not on disk, and the `**Status:**`
  tension (below).
- Setup step 6 — one clause: when a Circle is active, set its `**Active session history:**` to
  the history file being created, in the same command. This is the only place the field can be
  filled for a Circle that `/fusion:next` activated.
- Step 0b.2 step 3 — one clause: when a Circle is active, point `**Active spec/plan:**` at the
  plan the planner just returned, in the same command as reading it.
- Phase 4 step 3 — the closure-note write now also sets `**Status:**` to the word matching the
  new marker.

**`skills/next/SKILL.md`**

- Step 6.2 renamed to "Rename the record and set its `**Status:**`". Its shell block now does
  the rename and the field rewrite in one call, guarded by a `grep -q` so a record with no such
  field says so instead of no-opping silently, and written through a temp file rather than
  `sed -i` (whose in-place flag differs between BSD and GNU `sed`) — the form `/fusion:migrate`
  already uses. Both branches of the guard exit 0, which the surrounding prose in this file
  cares about (Step 6.3's `if`-not-`&&` lesson).
- The prose cites `$FUSION_SRC/agents/orchestrator.md` `## Circle head fields` for the
  semantics instead of restating them, and says per field why the other two are left alone.
- `## Boundaries` corrected: the skill writes exactly one field of Circle content.

## The `**Status:**` tension

Queue entry 58 is an open decision about whether the field should exist at all, so it was not
deleted and no live specimen was hand-corrected. What the change does is set it at **both** ends
of a Circle's life rather than one. That matters against entry 58's own evidence: it measured a
record reading `active` under a `_c_` marker, i.e. a field updated at activation and missed at
closure. Setting it only at activation would have manufactured exactly that inverse
contradiction on every Circle from now on. The section also states which surface wins when the
two disagree — the filename — so a reader meeting a stale field knows what to believe.

For entry 58 this is data, not an answer: the field is now maintained at every transition the
orchestrator or `/fusion:next` performs, which is option (1) of that entry applied to the
activation and closure points only. If the user later chooses option (2) — drop the field — the
two `**Status:**` writes and the table rows naming them are what comes out, and nothing else in
this change depends on the field existing.

## Not done, and why

- `rules/circle-records.md` was **not** touched. It already defines all three fields, the
  workbench-relative-path rule and the `(none yet)` placeholder; nothing needed adding, and the
  rules-emission budget for the orchestrator role is over its ceiling by 787 bytes
  (114 936 vs 114 149), which is a reason not to add prose that has a home elsewhere.
- No new test gate. Nothing in the task asked for one, and the boundary statement is prose
  agreement across two files rather than a mechanically checkable invariant of the kind the
  existing lints pin.

## Verification

`cd hooks && npm test` — exit 0, 52 files, 1335 tests. Same counts as the stated baseline at
`b53c7dd`; no test was added or removed.

One intermediate failure, fixed rather than worked around: `path-literal-lint.test.ts` flagged
the two issue citations in the new section, which I had written with their `shared/issues/`
store prefix. Agent prompts cite a record by its bare stamped filename and resolve the store
through `bin/fusion-paths`; both citations were rewritten to that form and the lint passes.

## Files changed

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/skills/next/SKILL.md`
- `/Users/k1/Projects/productive/fusion/260811-0932_*_die-circle-aktivierung-zieht-die-kopffelder-des-datensatzes-nicht-nach.md` (resolution note appended; marker `_o_` → `_c_`, renamed with `git mv`, so the rename is staged)

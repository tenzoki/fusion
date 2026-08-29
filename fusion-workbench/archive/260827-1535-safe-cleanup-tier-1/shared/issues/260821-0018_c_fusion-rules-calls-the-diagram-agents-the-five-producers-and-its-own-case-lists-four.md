`bin/fusion-rules` calls the diagram agents "the five producers" and its own case statement lists four

---
`bin/fusion-rules:423` describes the design-diagram emission as reaching "the five producers". The
case statement that decides the flag, at `bin/fusion-rules:202-206`, matches
`planner|analyst|taskplanner|shaper`, which is four. The comment and the code it documents disagree
about the size of the set the comment exists to describe.

---

## How it surfaced

Found by the analyst while writing the measurement protocol for
`260820-2051-style-rules-arrive-and-get-measured`, reported in that run and filed here rather
than in the Circle: it did not arise from that Circle's Directive, so the Origin Rule puts it in the
shared store.

## The likely cause, stated as an inference

`conceptrev` was retired on 2026-08-15. A fifth producer that left the case statement without the
comment being updated fits the evidence, and no commit was opened to confirm it. Treat the count as
the defect and the cause as unverified.

## Why a count in a comment is worth a record

The same class is already recorded twice in this project:
`260819-0038_*_two-shipped-surfaces-still-say-four-topics-after-the-conventions-header-table-grew-to-five.md`
was filed for a count that drifted from the table it described, and `CLAUDE.md` carries two rows whose
inventories were deleted rather than re-measured, for the same reason. A number written beside the
thing it counts goes stale silently, because nothing reads a comment.

## Acceptance

- The comment names the same number of agents as the case statement matches, or names no number at
  all and points at the case statement instead.
- If the count is kept, it is derivable rather than restated, in the shape the neighbouring gates use.

---
Resolved: fixed — the numeral is dropped and the comment points at the `IS_DIAGRAM_AGENT` case instead; `grep -n "five producers" bin/fusion-rules` prints nothing

# The `Retired:` annotation lands in the conventions rule

**Date:** 2026-08-15
**Agent:** coder
**Status:** Complete
**Source:** `260814-1332_*_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md` (option 3, answered by the user at the Rebalance gate)
**HEAD at start:** `bd07ee7`

## What this step did

Added a fifth resolution annotation, `Retired:`, to the decision-record vocabulary in
`rules/fusion-workbench-conventions.md`. It cites the plan, commit or gate that removed an
implementation when no later decision overrode it. **The marker stays `_i_` and nothing is
renamed** — that clause is the whole of why option 3 was chosen over option 2, and it is
what keeps `_s_` meaning exactly one thing: a later *decision* overrode this one. Because
no marker moves, no glob, no filter and no count anywhere in fusion changes behaviour, and
no migration is implied.

## The three edits

1. **`## State Markers — decisions`, the `_i_` row.** One clause appended, stating the
   option's honest cost rather than hiding it: `_i_` does not assert that the
   implementation still exists, so the marker alone cannot tell a live implementation from
   a retired one. That table is where a reader learns what `_i_` means, so it is where the
   limit had to be admitted. The decision's own Cons make the same point.
2. **`## Inline State Tracking` → `### Decision files`.** The annotation block, beside the
   four already there, carrying the no-rename rule in bold, the boundary against
   `Superseded by:`, and the consequence for a history pass (open the body).
3. **The decision-record template footer.** One line beside the other four, restating that
   the marker stays `_i_`.

No decision record was touched. Applying the annotation to the affected population is a
separate dispatch.

## The bound charged 761 bytes

`rules/fusion-workbench-conventions.md` is in the always-on set, so every byte is charged
to every dispatch of all sixteen agents.

| | bytes |
|---|---|
| the file, before | 53 399 |
| the file, after | 54 160 |
| **cost of this edit** | **761** |
| always-on corpus now | 88 679 |
| `RULE_BASELINE` floor | 86 573 |
| spent of the 12 000 head-room | 2 106 |
| **head-room remaining** | **9 894** |

`RULE_BASELINE` was not re-cut and no golden was regenerated to make room. The emission
golden was regenerated because the file's size moved, by the documented command; its diff
is one number per role and nothing else.

## Verification

```
cd hooks && npm test  — exit 0, 40 files, 751 tests
```

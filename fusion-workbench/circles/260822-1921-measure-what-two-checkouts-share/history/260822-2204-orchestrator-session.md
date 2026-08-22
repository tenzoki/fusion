# Orchestrator Session — 260822-2204

**Directive:** Measure what two checkouts of one project actually share and what each keeps to itself — the premise the whole multi-user arrangement rests on and that nobody has ever measured. Taken from the Circle record's `## Directive`.
**Circle:** 260822-1921-measure-what-two-checkouts-share
**Mode:** (not yet resolved — Phase 0 pending)
**Status:** In progress

## Setup snapshot

| Item | Value |
|---|---|
| Active Circle | 260822-1921-measure-what-two-checkouts-share (`_t_`) |
| git HEAD | f90de0c |
| Turn budget | 12, no configuration diagnostics |
| Detected domain | code (code_files=103, data_files=10, counted_by=git-ls-files) |
| Interrupted session | none |

## Open state

Both stores counted, per the two-store rule for every `SCAN_*` key.

- Open defects: 0 in the Circle, **119** in the shared store.
- Open plans: 0 in the Circle, 1 in the shared store (the multi-user spec, Partially Complete).
- Open decisions: 0 in the Circle, 5 in the shared store.
- Circles: 15 records — 1 active, 11 closed-coherent, 2 bounded, 1 superseded. No anticipated Circle
  remains, because this session's own activation consumed the only one.

## Setup notes

- The Circle record's `**Active session history:**` was `(none yet)` and is set to this file, in the
  same command that created it. `**Active spec/plan:**` is left as it stands: writing it belongs to
  the activation act, which `/fusion:next` performed and which declines it by its own text. That
  divergence is filed as `shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`.

## Session log

(Turn entries appended as the session runs.)

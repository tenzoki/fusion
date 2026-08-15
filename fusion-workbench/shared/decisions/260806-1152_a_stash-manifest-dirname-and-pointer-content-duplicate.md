# Do `original_circle_dirname` and `active_circle_content` both need to exist in the stash manifest?

---
**Domain:** code
**Status:** open
**Filed by:** reconciler (workbench-wide pass 260806-1152; the question was embedded in `shared/issues/260717-0032_*_stash-manifest-field-count-says-nine-lists-ten.md` since 2026-07-17 and never filed separately)
**Cross-references:** `rules/workbench-stash-and-lock.md` (ten-field manifest schema), `skills/circle-stash/SKILL.md`, `skills/circle-pop/SKILL.md`

---

## Question

The stash manifest carries both `original_circle_dirname` and `active_circle_content`, and the two always hold the same value: the active Circle's directory name at stash time. The coder who implemented the schema noted the redundancy in 2026-07; it survives in the current ten-field schema. Should one field be dropped, or is the duplication deliberate (one field names the directory to restore, the other preserves the pointer file's verbatim content, and the two could in principle diverge on a corrupt workbench)?

## Options

1. **Keep both** — they answer different questions (where to place the restored directory vs. what `.active-circle` literally contained); on a corrupt workbench the divergence is diagnostic.
   - Pros: no migration; `circle-pop` semantics unchanged; honest capture of pre-stash state.
   - Cons: two copies of one fact in the normal case, the exact `HYG-SOT` shape the framework elsewhere removes.
2. **Drop one** — schema goes to nine fields; old stashes stay readable if the reader ignores the extra field (the `has_spec_plan` precedent).
   - Pros: single source of truth.
   - Cons: touches schema, both skills, and the stash-and-lock rule; the field-count prose has already gone stale twice over exactly such edits.

## Constraints

Old stashes must stay poppable either way (the `has_spec_plan` precedent: readers ignore unknown fields).

---
Answered: user, session 260811-0752 (chat) — **Option 1, keep both fields.** They answer different
questions: `original_circle_dirname` says where the restored directory belongs,
`active_circle_content` says what `.active-circle` literally held. They agree on every healthy
workbench, and the case the manifest exists for is not a healthy one: on a corrupt or
half-restored workbench their divergence is the diagnosis, and a nine-field schema would have
discarded it to save a line. No schema change. Record the reason in the manifest schema
documentation so the next reader does not re-file the duplication as redundancy.

---

**Reconciliation 260815-1913 (reconciler, HEAD `9306f0a`) — the subject of this decision no longer
exists, and the marker is deliberately left at `_a_`.**

Circle `260815-0007-remove-eight-mechanisms-and-cap-growth` step 6 deleted `skills/circle-stash/`
and `skills/circle-pop/` in `5d29b6d`, and renamed `rules/workbench-stash-and-lock.md` to
`rules/commit-lock.md` with its `## Stashes` half removed. All three of this record's
`**Cross-references:**` therefore dangle at HEAD, and the ten-field manifest whose two fields the
question is about is written by nothing. The answer recorded here — keep both fields, no schema
change, record the reason in the manifest schema documentation — can never be realised, so
`_a_` → `_i_` is unreachable.

**No marker was moved, and the reason is that an open decision owns exactly this question.**
`circles/260801-1244-curator/decisions/260814-1332_o_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md`
asks what marks a decision whose implementation was deleted with no superseding decision to cite,
and lists four candidate answers of which two (`_s_` widened, or a new `Retired:` annotation) would
apply here. Renaming this record now would pre-empt that decision on the weakest evidence tier. This
record is an `_a_` rather than an `_i_` instance of the same class, which the open decision's
question text does not yet cover — a distinction worth carrying into whoever answers it.

This is active Grounding (`_a_` is Grounding-Stand per `rules/fusion-workbench-conventions.md`
`## State Markers — decisions`) whose subject the Artifact removed, and it is one of the two records
that flag the Grounding↔Directive edge in this Circle's session-end Coherence verdict.

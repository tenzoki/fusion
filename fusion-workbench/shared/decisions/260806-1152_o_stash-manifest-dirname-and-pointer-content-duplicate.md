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

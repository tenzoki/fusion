The `.gitignore` comment still says the conventions file states the split that moved out of it

---

Decision `260816-1707` names two consumers of `rules/workbench-tracking.md`, and the first is "a
human writing a consuming project's `.gitignore`". This repository's own `.gitignore` is the worked
instance of that consumer, and the move did not repoint it.

---

`.gitignore:60-66`:

```
# fusion-workbench. In THIS repository it is deliberately tracked (a consuming project
# decides for itself; fusion ships no rule for it). Tracked does not mean all of it:
# the root-anchored surfaces split into records, which are kept, and live state, which
# only ever produces diff noise and — restored by a checkout — a lie about a session
# that ended. The split and its two consequences for the lifecycle skills are stated in
# rules/fusion-workbench-conventions.md, "Which of them a tracked workbench tracks".
```

The sentence is now false. After `b200902` the split is **not** stated in
`rules/fusion-workbench-conventions.md` — that heading holds two sentences of pointer, and the split,
the `.guard-state/` per-file classification and both consequences are in `rules/workbench-tracking.md`.

The citation does not dangle, because the move deliberately kept the heading, so
`reference-resolution-lint`'s anchor class still resolves it. That is exactly why nothing caught it:
a citation that resolves to a pointer instead of to a definition is invisible to a gate that only
asks whether the anchor exists.

Verified at HEAD `b54ace5`: `rules/fusion-workbench-conventions.md:73-77` is the two-sentence
pointer; the records and live-state bullets and both consequence paragraphs are at
`rules/workbench-tracking.md:11-19`.

**Fix direction.** Repoint the comment at `rules/workbench-tracking.md`. Treat it together with the
already-open `shared/issues/260816-1051_o_the-gitignore-block-still-calls-both-consequences-lifecycle-skill-consequences-and-one-lost-its-consumer.md`,
which is a second defect in the same two lines — one edit settles both, and doing them separately
means touching the block twice.

Worth noting beyond this repository: a consuming project that copied the comment form has the same
stale pointer and no gate at all. Whether the move owes those projects a migration line is the
question `260819-0041_o_the-decision-record-status-removal-…` raises for the other half of this
range; the two share a cause.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301`. No Circle active, so it is
filed in the shared store under the Origin Rule.

---
Resolved: `.gitignore:66` repointed at `rules/workbench-tracking.md`. The reason no gate caught it is worth keeping: the move deliberately retained the old heading as the pointer, so the anchor still resolved and only its content had moved.

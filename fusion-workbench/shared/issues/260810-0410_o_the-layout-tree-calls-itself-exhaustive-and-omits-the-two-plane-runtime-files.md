The layout tree calls itself exhaustive and omits the two Plane runtime files

---

`rules/fusion-workbench-conventions.md` § "fusion-workbench Layout" enumerates the root-anchored surfaces and says of that enumeration: *"The list is exhaustive as written, and it is a list rather than a count on purpose."* It then names the obligation that keeps it true: *"When a `bin/` helper or a hook adds a root-anchored surface, it lands in this tree in the same commit."*

Two root-anchored surfaces are missing from it: `fusion-workbench/.plane-map.json` and `fusion-workbench/.plane-outbox.jsonl`. Both are owned and written by `bin/fusion-plane`, both sit at the workbench root, and `CLAUDE.md` names them there in the `bin/fusion-plane` row. The tree does not.

---

**How it was found.** Reported by the T15 executor as a side observation while deciding, surface by surface, which root-anchored files a tracked workbench should track. It could not act on it, because its file allowance did not cover the omission and because neither file was a candidate for that pass: `.plane-map.json` **must stay tracked**, since it holds the record-to-Plane-ID binding without which the idempotent push breaks.

**Why this is worth a record rather than a one-line edit.** The paragraph does not merely list; it makes a claim about itself and names the discipline that keeps the claim true. So the omission is evidence that the discipline did not hold when the Plane bridge landed, and the same gap will recur with the next helper that needs root-anchored state. Fixing the two lines without asking why they were missed leaves the mechanism that missed them in place — which is the shape `rules/critical-stance.md` §2 warns about.

Two things are also worth noticing about *what* is missing. The tree's own justification for root-anchoring is that none of the listed surfaces belongs to a unit of work, and it argues that case per surface. Both Plane files would need that argument made for them, and it is not obvious in the same way: a mirror's identity map is arguably project-wide, an outbox of deferred pushes arguably is too, but neither has been written down. And `65f7c3b` has just divided the listed surfaces into a tracked group and an ignored group, which is a second per-surface decision these two never received.

**Three questions, not one:**

1. Do the two files belong in the tree, with the same per-surface justification the others carry?
2. Which group does each fall into under § "Which of them a tracked workbench tracks"? `.plane-map.json` is answered — tracked, because the binding is load-bearing. `.plane-outbox.jsonl` is not: it is a human-readable record of deferred pushes, which reads like the tracked group, but it grows unboundedly, which reads like the ignored one.
3. Is there a check that would have caught this, or does the obligation stay a convention? A lint comparing the root-anchored paths named across `bin/` and `hooks/` against the tree's enumeration is conceivable. Whether it is worth its own maintenance is the open part.

**Not a defect in the Plane bridge or in T15.** The bridge works and its files are documented in `CLAUDE.md`. What failed is the tree's exhaustiveness claim, which is a claim only that file can make good on.

# The ground this Circle was measured on is being cut away, and its design must move

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1615_*_spec-cut-fusion-to-a-working-minimum.md, 260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md, 260909-1700-cut-fusion-to-working-minimum

---

## Question

This Circle was shaped on 2026-09-08 and measured at `de94102f`. On 2026-09-09 the user activated
`260909-1700-cut-fusion-to-working-minimum`, whose specification removes three of the four surfaces
this Circle's design rests on. The Circle is still wanted; the user has said so and has ruled on the
one sentence that would otherwise have killed it. What must change before it is planned?

## What the cut removes, against what this Circle needs

**Removed.** The Circle record and its `## Dependencies` section, which is this Circle's carrier for
a confirmed edge. `portfolio.md`. The playmaker agent, whose ranking is this Circle's stated
consumer. The Circle directory container, the six-marker state vocabulary, `.active-circle`,
`rules/circle-records.md`, and the Circle branches inside `bin/fusion-paths` and `bin/fusion-rules`.

**Untouched, and it is the substance.** The `bin/` helper that computes depth, transitive blocking
count, topological order, readiness and cycles. `hooks/lib/citation-scan.ts` and
`hooks/lib/citation-corpus.ts`, the two halves this Circle planned to reuse. No growth bound
measures `bin/` or `hooks/lib/`, and the cut removes nothing there.

**Improved.** This Circle's design was forced toward `bin/` because `agents/*.md` had 698 bytes of
head-room at `de94102f`. The cut removes that constraint. And its own complaint about the ranker it
was to feed, that it states no arithmetic and reads dependencies one hop, is answered by the cut
deleting that ranker rather than by this Circle feeding it.

## What must change

1. **The carrier moves.** A confirmed edge is written into the flat store's work-item file, not into
   a Circle record. The dependency field must be machine-readable and must exist in the work-item
   file's first version. Retrofitting it after the migration means a second pass over every item.
2. **The consumer changes.** "What is next" becomes a computation the helper reports on demand,
   replacing playmaker's ranking rather than feeding it.
3. **The Grounding snapshot is stale in two places.** It records zero anticipated and one active
   Circle; on 2026-09-09 there are two anticipated records and one active one, and the Circle it
   names as active has closed. Its survey of 23 record shapes describes a store the cut migrates.
4. **The sequencing question.** Planning this Circle against surfaces the other Circle is removing
   would produce a plan invalidated before it runs.

## Options

1. **Sequence it after the cut**, and re-sharpen the Directive and Grounding against what the cut
   leaves standing. Pros: plans against a real tree. Cons: waits, and the work-item file's
   dependency field has to be specified inside the other Circle regardless, so this Circle cannot be
   wholly deferred.
2. **Fold the assertion layer into the cut** and keep only the helper and its consumer here. Pros:
   the field lands in the work-item file's first version, where it is nearly free. Cons: widens a
   specification that has already been reviewed twice.
3. **Run it in parallel against the specified end state** rather than the current tree.
   Pros: no wait. Cons: builds against a design not yet realised.

## Recommendation

Option 2 for the dependency field alone, option 1 for the rest. The field is the only part that is
cheap now and expensive later; everything else in this Circle reads a store that does not exist yet.

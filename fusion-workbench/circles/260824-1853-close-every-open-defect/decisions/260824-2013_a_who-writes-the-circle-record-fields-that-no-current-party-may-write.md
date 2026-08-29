# Who writes the three Circle-record fields that no current party may write?

---
**Domain:** code
**Filed by:** analyst
**Attribution backfilled 260825 (not written by the filing agent):** `analyst` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Cross-references:** `shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`; `shared/issues/260822-2045_*_a-circles-head-fields-end-up-in-different-states-depending-on-which-of-the-two-activation-routes-ran.md`; `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1455_*_the-shapers-mode-3-has-no-scope-value-for-a-grounding-only-correction-and-halts-on-the-only-case-that-needs-one.md`; `rules/circle-records.md` `## Circle record template`; `agents/orchestrator.md` `## Scope` and `## Circle head fields`; `agents/shaper.md` `## Four invocation modes`; `skills/next/SKILL.md` Step 6.2; plan `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 1 (D-record-writers)

---

## Question

Three defect records find the same shape from three directions: a Circle record carries a field that has a defined meaning and no party whose scope enumeration permits the write that would make it true. The three are bundled here because each prompt's write list is a closed enumeration argued in one place, and answering them one at a time reopens the same enumeration three times.

1. **The reverse `## Dependencies` edge.** When two anticipated Circles are created in one session and the second depends on the first, the second cites the first, and nobody may write the reverse citation onto the first: the shaper may not modify an existing Circle, the orchestrator's write list does not include `## Dependencies`, and the playmaker reads the edges and does not author them. The playmaker's cycle detector then sees half an edge. The instance on the pair the record was filed about closed without the line.
2. **`**Active spec/plan:**` on activation.** The orchestrator and `/fusion:next` are the two sanctioned performers of `_a_` to `_t_`, and they differ on the field in exactly one case: a spec exists and the record cites it nowhere. Then the orchestrator writes the field and the skill leaves `(none yet)`. The field's two mechanical readers treat the sentinel as "nothing cited", and the Directive-to-pointer swap rides a write of the field, so the route that declines the write also declines the swap.
3. **A Grounding-only correction.** Shaper mode 3 is the only writer of `## Grounding snapshot`, and both its scope values bind that permission to what happens to the Directive; a correction to one false Grounding sentence in a Circle whose field already cites a plan falls through both and halts on the `directive-only` file test. The orchestrator's `## Scope` has the same partition, and on 2026-08-23 the user overrode it in chat so the correction could land at all.

## Options

For the reverse dependency edge (from the first record):

1. **Extend the orchestrator's Circle-record write list** by `## Dependencies`, argued as its existing exceptions are.
   - Pros: smallest change.
   - Cons: widens a list whose closedness is load-bearing.
2. **Let the shaper write the reverse edge** on the Circle it cites, as one narrow exception parallel to its `Promoted:` backlog exception.
   - Pros: the write stays with the party that knows the relationship.
   - Cons: breaches "no existing Circle may be modified in anticipated-circle mode".
3. **Give the playmaker the edge**, since it already reasons over the graph and appends dependency sections.
   - Pros: the reader of the graph becomes its writer; no new party enters.
   - Cons: it would author what it currently only reads, which changes its mandate.
4. **Accept one-sided edges and make every consumer read the relation symmetrically**: the cycle detector, the portfolio renderer, `/fusion:next`.
   - Pros: moves no write boundary; a dependency is arguably a fact about a pair. The record asks that this option get a real hearing.
   - Cons: every reader gets harder.

For `**Active spec/plan:**` on activation (from the second record):

5. **The skill writes it too**, deriving the path from the record's own Grounding citation.
   - Pros: cheap in the common case.
   - Cons: a guess wherever the Grounding cites more than one path.
6. **Neither route writes it**; the first session that runs the Circle fills it, which is the one party that certainly knows.
   - Pros: moves the obligation to a place that already has a Setup step for the sibling field.
   - Cons: the field stays at the sentinel through activation, and the pointer swap waits with it.
7. **The divergence is intended and gets written down** in both documents.
   - Pros: cheapest.
   - Cons: the two mechanical readers are no better off.

For a Grounding-only correction (from the third record):

8. **A third scope value** for mode 3, naming the Grounding alone.
   - Pros: the guard stays a file test; the new case gets its own explicit path.
   - Cons: a third value on a two-value partition that both prompts mirror.
9. **Narrow the `directive-only` halt** so it fires on an attempt to write Directive prose rather than on the field's value.
   - Pros: the halt tests what it protects.
   - Cons: a test of intent replaces a test of state, which is the question the guard's own history in this project turns on.
10. **Make the Grounding permission independent of the Directive scope**, in both the shaper's and the orchestrator's enumerations.
    - Pros: one repair covers the gap seen from two prompts, which the third record's `Also seen:` asks for.
    - Cons: the largest change to two closed write lists.

## Constraints

- Every party that gains a write states it in its own scope enumeration, and no other party is left believing it owns the write (first record, `## Acceptance`).
- The playmaker's cycle detection sees a mutual dependency regardless of creation order, or one-sided edges are correctly interpreted by every consumer.
- `## Grounding snapshot` is writable only while the record is `_a_` or `_t_`; after closure no one corrects it, so whichever option lands must be reachable before the closure rename.
- A repair to the Grounding scope covers both the shaper's and the orchestrator's partitions, since it is one gap seen from two prompts (third record, `Also seen:`).
- `rules/circle-records.md` is the authoring home of the template and the sentinel; `agents/*.md` and `skills/*/SKILL.md` are bounded surfaces, with 10 745 and 3 220 bytes of head-room measured for this Circle.

## Recommendation

None on any of the three. The first record deliberately declines to choose and asks only that option 4 be heard; the second says the choice is not obvious and names the question under all three as who is assumed to know which spec a Circle runs on; the third names its options and chooses none.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Answered (parts a and b): user 2026-08-29 — (a) reverse `## Dependencies` edge: option 1, the orchestrator's Circle-record write list gains `## Dependencies`; (b) `**Active spec/plan:**` on activation: option 5, `/fusion:next` writes it too, deriving the path from the record's Grounding citation.
Answered (part c): option 8, a third scope value `grounding-only` for shaper mode 3. Full answer recorded in this file (circles/260824-1853-close-every-open-defect/decisions/260824-2013_a_who-writes-the-circle-record-fields-that-no-current-party-may-write.md).

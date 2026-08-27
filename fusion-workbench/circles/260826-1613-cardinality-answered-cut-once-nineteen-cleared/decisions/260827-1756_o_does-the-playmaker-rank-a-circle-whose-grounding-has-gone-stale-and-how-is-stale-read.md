# Does the playmaker rank a Circle whose Grounding has gone stale, and how is "stale" read?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260826-1445_*_the-playmakers-ranking-rewards-a-stale-grounding-because-no-criterion-asks-whether-the-directive-is-still-true.md` (the defect and its four design questions); `agents/playmaker.md` Step 2 read cap and Step 3 criteria; `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/issues/260826-1901_*_the-playmakers-rationale-contract-requires-a-citation-and-caps-the-read-that-would-check-it.md` (the same read cap, the other failure); `agents/shaper.md` portfolio-activation mode (the re-sharpen path a warning would point at)

---

## Question

The three ranking criteria (open decisions cited, dependencies closed, domain signal) all score a finished Circle as a ready one, and the read cap forbids the `find` that would tell them apart. The defect record names four design points that are a decision rather than an edit: what counts as stale, how deep the check may go, whether a stale Circle drops or is warned, and how a dependency that resolves under `archive/` is reported. The repair plan edits the read cap for another reason in the same step and needs these four answered before it adds the criterion.

## Options

1. **A warning, never a demotion.** Stale is read from filename markers alone: for each `_a_` Circle, the share of records its `## Grounding snapshot` cites that carry a terminal marker or resolve under the archive store, and whether HEAD has moved since the snapshot's recorded commit. Above a stated threshold the Circle is listed with a `stale-grounding` warning recommending the shaper's portfolio-activation mode before activation; its rank is unchanged. A dependency that resolves under `archive/` is reported as `archived`, not counted as closed.
   - Pros: nothing hidden; the check is a `find` and stays inside a ranking read; the C4-derived Circle `2244` in the consuming project would have been flagged and still visible.
   - Cons: a threshold is a number in prose; the warning can be ignored as the 260826 runs ignored the markers.
2. **A fourth criterion that demotes.** The same signal, applied as a ranking penalty so a stale Circle is not the recommendation.
   - Pros: the recommendation itself changes, which is what the user sees.
   - Cons: hides a Circle that may hold real work; the defect record argues against this on the measured case.
3. **No criterion; the shaper re-sharpens on activation.** `/fusion:next` always routes activation through the shaper's portfolio-activation mode, which re-measures the Grounding.
   - Pros: no new heuristic; the re-measure is done by the agent built for it.
   - Cons: every activation pays a shaping round; the playmaker keeps recommending finished Circles, which is the defect.

## Constraints

- The check reads markers and directory locations, never bodies (the read cap's reason stands).
- The `agents/` bound has 14 204 bytes free at `0fb5085`; the criterion costs well under 1 000.
- The verification the defect record states holds for whichever option is chosen: a Circle citing only archived records appears in `## Warnings` with `stale-grounding`.

## Recommendation

Option 1. Threshold: half or more of the cited records terminal or archived. The distance HEAD has moved since the snapshot's recorded commit is reported beside the warning as a count, with no threshold of its own. The archive-resolving dependency report is taken under every option.

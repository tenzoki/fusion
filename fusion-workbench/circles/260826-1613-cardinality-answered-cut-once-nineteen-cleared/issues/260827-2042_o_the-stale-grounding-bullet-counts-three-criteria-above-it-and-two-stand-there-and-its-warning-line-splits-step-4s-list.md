The stale-Grounding bullet counts "the three criteria above" and two stand there, and its warning line splits Step 4's list

---
`agents/playmaker.md:125` says "the three criteria above score a finished Circle as a ready one". The bullets above it are Unresolved-decision count and Dependencies-closed flag; the Domain-specific signal sits below. A bare cardinality, wrong on the day it landed, in the Circle whose subject is `rules/critical-stance.md` §5. At `:136` the new `stale-grounding` paragraph is inserted between the two bullets of "For each cycle found:", so the second bullet (append `## Dependency warning`) now reads as a consequence of the stale-Grounding count rather than of a cycle.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260826-1445_*_the-playmakers-ranking-rewards-a-stale-grounding-because-no-criterion-asks-whether-the-directive-is-still-true.md` (closed by this step); commit `e7c0440`

## Fix direction

`:125`: "the criteria above" or name the two. `:136`: move the stale-grounding paragraph after the cycle list, under its own lead-in, so the "For each cycle found" bullets stay contiguous.

## Acceptance

`grep -c "three criteria above" agents/playmaker.md` is 0; Step 4's cycle bullets are adjacent.

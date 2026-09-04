The reference-resolution pin's entry chain has an uncovered gap between 1336 and 1517
---
The trailing comment on `hooks/lib/__tests__/reference-resolution-lint.test.ts`'s `BASELINE` runs a chain of re-approval entries. One entry ends at `paths` 1336 and the next opens at 1517. Neither the file nor either of the two rolled logs covers what moved the number across those 181.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Found by** the repairing agent while rolling two other entries into a log, and named rather than quietly stepped over. It predates the entry drop that task repaired and is a different fault: the drop removed entries that exist in git history, while this gap has no recovered source named anywhere.

**Why the chain matters at all.** This pin's history is the only record of *what moved the number*, and the growth bound measures the file by the line, so the history cannot accumulate in place. The roll into a dated log is what keeps it readable. A gap in the chain is a stretch of the number's history that no reader can reconstruct without guessing which commits to check out.

**Two smaller things the same reading turned up**, worth knowing before anyone audits the chain: the entries below `const BASELINE` are not in chronological order with each other, and the chain uses two connector spellings, `Previous: ` and `Earlier: `. Anyone counting positions in it should audit first rather than assume, which is why the new log deliberately carries no entry ordinals.

**Acceptance.** Either the 181 are accounted for by entries recovered from git history and placed in a rolled log, or the comment states plainly that the range is unreconstructed and from which commit range a reader would have to recover it. A chain that silently skips is worse than one that says where it stops.

The reference-resolution pin's entry chain has an uncovered gap between 1336 and 1517
---
The trailing comment on `hooks/lib/__tests__/reference-resolution-lint.test.ts`'s `BASELINE` runs a chain of re-approval entries. One entry ends at `paths` 1336 and the next opens at 1517. Neither the file nor either of the two rolled logs covers what moved the number across those 181.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Found by** the repairing agent while rolling two other entries into a log, and named rather than quietly stepped over. It predates the entry drop that task repaired and is a different fault: the drop removed entries that exist in git history, while this gap has no recovered source named anywhere.

**Why the chain matters at all.** This pin's history is the only record of *what moved the number*, and the growth bound measures the file by the line, so the history cannot accumulate in place. The roll into a dated log is what keeps it readable. A gap in the chain is a stretch of the number's history that no reader can reconstruct without guessing which commits to check out.

**Two smaller things the same reading turned up**, worth knowing before anyone audits the chain: the entries below `const BASELINE` are not in chronological order with each other, and the chain uses two connector spellings, `Previous: ` and `Earlier: `. Anyone counting positions in it should audit first rather than assume, which is why the new log deliberately carries no entry ordinals.

**Acceptance.** Either the 181 are accounted for by entries recovered from git history and placed in a rolled log, or the comment states plainly that the range is unreconstructed and from which commit range a reader would have to recover it. A chain that silently skips is worse than one that says where it stops.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, and **the gap is a twentieth of the
size this record states**. The marker stays; the measurement is corrected here rather than in the
heading, which is left as filed.

**Why the record read 181.** The entries are one per physical line above `const BASELINE` and one per
physical line below it — except one. Line 491 of `hooks/lib/__tests__/reference-resolution-lint.test.ts`
is a single line carrying twenty-five chained entries joined by `Earlier: `, running newest-first from
`paths 1517 -> 1520` back to `paths 1336 -> 1350`. Read line by line, the entry above `BASELINE`
closes at 1336 and the next visible one opens at 1517, which is what the record saw. Read through the
chain, the range is almost entirely covered. `git blame` puts that line at `f1099c5f`, 2026-08-29, so
it was there when this record was filed.

**What is actually unaccounted, walking the chain newest-first and requiring each entry's opening
figure to equal the next one's closing figure.** Three breaks, totalling **35 paths of the 181**:

- 1466 against 1464 — 2
- 1462 against 1431 — 31
- 1376 against 1374 — 2

Every other adjacency holds exactly, including the two entries that record a *decrease* (`1462 -> 1460`,
the style diet, and `1478 -> 1477`, the UX round), which is why a numeric sort of the chain reads worse
than the chain does.

**What the record got right and this pass confirms**, because it is what an auditor needs before
counting positions in the chain: the entries below `const BASELINE` are not in chronological order with
each other, and the chain uses two connector spellings. Both hold at HEAD.

The acceptance stands, resized: three named breaks totalling 35 to recover or to declare
unreconstructed, not one of 181.

---
Resolved: ea819262 — the chain audit found three breaks totalling 35 paths, not one gap of 181; the record headline was an artefact of reading line by line a comment whose middle line carries twenty-five chained entries. Eight entries recovered from git history, each marked as a recovery and naming its commit, appended into the existing single line at net zero lines. The two smaller findings the record named are preserved rather than tidied: the entries are not in chronological order and carry no ordinals, and a preface now says so.

---
Reconciled 260905-2234 (reconciler, HEAD `4db7dddb`): the closure holds, re-walked independently.

**The three breaks are closed.** Every `paths A -> B` entry on the chain line was extracted in order
and each entry's opening figure now equals the next one's closing figure across all 34 adjacencies,
from `1517 -> 1520` down to `1336 -> 1350`, which meets the `1325 -> 1336` on the line above. The
pre-repair file walked the same way still shows the three the previous pass named — 1466/1464,
1462/1431, 1376/1374 — and shows nothing else in that range.

**The recovery count checks out.** Nine `recovered 2026-09-05` marks stand beside entries; one of the
nine is the transition figures restored to the six-times summary entry at `9c056b6c`, leaving the
eight the note claims, each naming the commit it came from. Ten `paths` entries are new against
`ea819262^`, of which one is the `1622 -> 1624` BASELINE re-approval.

**One thing outside this record's scope, recorded and not filed.** Walked in physical-file order from
`const BASELINE` downward, seven further adjacency breaks stand in the 1544-1603 region, on the
one-per-line entries above the chain line. All seven predate this repair — the same walk over
`ea819262^` finds ten breaks, these seven plus the three now closed. They are not necessarily faults:
the chain's own preface states the entries are not in chronological order with each other, so a
file-order adjacency walk is not the invariant there. Nothing is claimed about them beyond that they
did not arrive with this repair.

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

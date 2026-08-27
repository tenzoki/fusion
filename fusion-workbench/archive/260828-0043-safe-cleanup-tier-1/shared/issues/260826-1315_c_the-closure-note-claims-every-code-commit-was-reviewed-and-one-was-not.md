The closure note claims every code-touching commit was reviewed, and the commit before it was not

---
A Circle's closure note states its review coverage as complete. One commit in the range
touched seven shipped files and no review opened it. The measurement behind the claim was
taken before that commit existed.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. The claim is false and it is the kind of claim a release reads.

**Cross-references:**
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/_b_circle.md` `## Closure note`,
final paragraph;
`shared/issues/260826-1305_*_the-closure-note-reporting-seven-wrong-counts-states-an-eighth-in-the-paragraph-that-reports-them.md`;
`shared/issues/260810-1205_*_the-session-closure-and-filing-counts-are-hand-maintained-and-both-drifted-by-two-against-the-disk.md`;
`shared/decisions/260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`

## What was measured

The closure note written at `8d06759` ends:

> **Review coverage over `73ca11c..bb5d92f`:** 20 commits, 4 reviews. Every commit that
> touched shipped code falls inside a review's declared range. The uncovered remainder
> touches only `fusion-workbench/`, being three review filings, the plan closure and this
> closure's own commits.

The second sentence is false. `e66f7d5` is uncovered and touched seven files outside
`fusion-workbench/`:

```
$ git show --stat --format= --name-only e66f7d5 | grep -v '^fusion-workbench/'
CLAUDE.md
bin/fusion-events
rules/workbench-tracking.md
hooks/lib/events-query.ts
hooks/dist/lib/events-query.js
hooks/dist/lib/events-query.d.ts
hooks/lib/__tests__/reference-resolution-lint.test.ts
```

The three reviews in the range declare `8119fc2..8655ec2`, `b11bec6..72a9561` and
`8fb42ce..6deeb33`. `e66f7d5` is in none of them. Re-run
`bin/fusion-review-coverage --since 73ca11c` and it is named.

The same probe over the other seven uncovered commits returns zero shipped files each, so
the sentence is right about them and wrong about exactly one.

## How the claim came to be false

The orchestrator ran the coverage read after `7774d56` and got four uncovered commits, all
record-only. That reading was correct when taken. Then task Z-2 landed `e66f7d5`, a code
commit, and the closure note was written afterwards from the earlier reading without
re-measuring.

**So the fault is not a wrong measurement. It is a measurement whose referent moved between
the taking and the writing** — the same shape as the eight wrong counts this Circle closed
on, applied to a claim rather than to a number, and by the same party in the same document.
`260826-1305_*` records the eighth; this is the ninth and the first that is not a cardinality.

That widens the open question at
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/decisions/260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md`
in a way its four options do not cover: all four address counts. A detector for count words,
or a rule against stating cardinalities, reaches none of this sentence.

## Why it matters more than the eighth

The eighth instance is a wrong total in a paragraph whose own sentences contradict it, so a
reader who reads on is corrected. This one is a claim about review coverage in a closure
note, and there is nothing beside it to contradict it.

Acceptance criterion 10 of the plan makes the coverage statement a **precondition on pushing a
release tag**, filed after a tag went out over an unrun review pass
(`shared/decisions/260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`).
A false coverage claim in the closure note is exactly what that precondition exists to stop
someone reading and believing.

**The gate itself was answered honestly.** The user was asked the ten stop conditions and
answered *holds* on clause 10 against the reading taken at that moment, which was correct then.
`e66f7d5` landed after. The defect is in the note, not in the gate.

## What is not claimed

Not that `e66f7d5` is defective. Its four corrections were each measured, the executor stated
the command for each, and the confirmation pass re-derived three of them independently and
confirmed all three. What is missing is an independent read of the change, not evidence that
it is wrong.

Not that the Circle should not have closed. Decision `260815-2109_*` holds that a Circle may
close over an uncovered range **provided the closure note names the gap**. The gap exists and
the note denies it, so what fails is the naming, not the closure.

Not that this is the reconciler's or the reviewers' miss. Both reviews declared their ranges
accurately and the last one carries `not-opened=none`. `e66f7d5` was written after the last
review ran, and nothing re-queued it.

## Fix direction

Two parts, and only the second is a repair.

**Run a review over `e66f7d5`.** One commit, seven shipped files, three of them prose and one
a pinned test constant. It is the smallest possible pass and it removes the gap rather than
documenting it.

**Do not edit the closure note.** The record is terminal and `rules/circle-records.md` holds
that a contradiction preserved in a terminal record is evidence. This record is the correction;
the note is the specimen.

**Scope.** No shipped file. One review pass, if the user wants the gap closed rather than
named.

---
Resolved: the review pass this record's close condition names has run. `circles/260825-2023-presence-travels-monitor-filters-own-checkout/reviews/260826-1330-coderev-the-last-uncovered-commit.md:3` declares `**Reviewed-range:** 7774d56..e66f7d5`, covering the one uncovered commit with all seven shipped files opened (commit `3f62a7d`). The closure note's false sentence stands unedited in the terminal `_b_` record, as the constraint in the active Circle's Grounding requires: the note is the specimen, the review is the repair. Verified by reconciler 260827-1528.

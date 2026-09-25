The head-room correction left two figures for one quantity in adjacent clauses

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing `084c626..dbf259a`
**Affects:** `260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md:106-110`
**Cross-references:** `260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md`, whose stated fix named the companion figure; `260822-0027-coder-the-bounds-own-figure-replaces-the-wrong-one.md`, which records the decision to leave it; commit `e202016`

---

## What is wrong

Commit `e202016` corrected the second half of a two-clause passage and left the first half. The
passage now reads:

> **No attribution comment was owed and none was written**, so none of the hook test suite's 11
> lines of head-room was spent. That was the tight bound named in the dispatch and it is
> untouched: the suite still measures 20 360 lines across `hooks/lib/__tests__/**.ts`.

**One quantity, two values, one sentence apart.** The bound's budget is 20 375 lines
(`TEST_LINE_BASELINE` 17 875 plus `TEST_LINE_HEAD_ROOM` 2 500, both in
`hooks/lib/__tests__/surface-growth-bound.test.ts`). Against the 20 360 the second clause now
states, head-room is 15, not 11. Nothing in the log says that the 11 was computed against a
surface of 20 364.

**The contradiction did not exist before the edit and the edit created it.** Before, the second
clause read "18 314 lines across `lib/__tests__/*.test.ts`", a count over a different file set,
so no arithmetic relation between the two figures was implied and a reader could not derive one.
The correction changed the referent of the second figure to the same set the first one is about.
Two figures over two sets became two figures over one set.

## On the reasoning that left it

The executing coder recorded the decision and its principle
(`260822-0027-coder-the-bounds-own-figure-replaces-the-wrong-one.md`,
`## What I did not touch, and why`): a figure that was true at the moment it was written is a
record of that moment rather than a defect.

**The principle is right and it does not reach this case.** It protects a past figure from being
silently updated to the present. It does not license leaving a past figure beside a present one
when both now name the same quantity, because the reader has no way to tell which sentence is
speaking about which moment. The log's remedy, "A reader who wants the two sentences to agree in
the present tense has the arithmetic in front of them", is not available: the arithmetic needs the
20 364, and the 20 364 appears only in the closed issue record, not in the log the reader is
holding.

There is a second signal that the pair was meant to move together. The issue this fix closed
computes the two as a pair in its own prose: "a reader who takes it for one will compute head-room
of 2 061 lines where the real figure is 11", and its `**Fix.**` paragraph points at two sibling
logs that "both give 20 364 and 11 lines of head-room". The record's fix produced a consistent
pair. The executed fix re-measured one member of the pair, correctly and for a stated reason, and
did not carry the consequence to the other.

## What to do

One clause, and it keeps the record-of-its-moment property the coder was protecting:

> so none of the hook test suite's 11 lines of head-room, the figure that stood when this step ran
> at a surface of 20 364, was spent.

No number is updated and no past claim is rewritten. The moment each figure belongs to becomes
readable, which is what the passage currently withholds.

**Verified at HEAD `dbf259a`** by reading the passage in place, by reading the diff of `e202016`
(two lines, nothing else in that file touched), by reading `TEST_LINE_BASELINE` and
`TEST_LINE_HEAD_ROOM` in `hooks/lib/__tests__/surface-growth-bound.test.ts`, and by re-running
`find lib/__tests__ -name '*.ts' | xargs cat | wc -l`, which returns 20 360 and agrees with the
last line of `hooks/lib/__tests__/fixtures/surface-growth.golden`.

---
Resolved: coder, 2026-08-22, one clause in
`260821-2145-coder-the-cut-that-pays-for-steps-2-and-3.md:108`.
The passage now reads "so none of the hook test suite's 11 lines of head-room, the figure that
stood when this step ran, was spent." Both figures stand as written, nothing else in the file moved,
and the same in-place discipline `e202016` used was kept: the clause names the moment the 11 belongs
to instead of updating it.

**One departure from this record's proposed wording, and it was directed.** The clause suggested
above also supplies the surface the 11 was computed against. That figure is not in the log and this
edit does not add it, so the repair is the weaker of the two available: it removes the contradiction
by telling the reader the two figures speak about different moments, which is what made them look
like one quantity with two values, but it does not let the reader re-derive the 11. The reconciling
surface still lives only in
`260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md`,
which is named here so the trail exists in a record rather than nowhere.

The reviewer's argument is accepted in full: the principle the executing coder applied protects a
past figure from silent updating, and it does not license leaving a past figure beside a present one
when both name the same quantity. That is what the added clause answers.

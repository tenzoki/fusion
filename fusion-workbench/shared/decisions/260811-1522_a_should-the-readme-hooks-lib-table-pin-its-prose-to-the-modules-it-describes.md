# Should the `README-hooks.md` lib table pin its prose to the modules it describes, the way `describeReach()` pins the domain-cascade paragraph?

---
**Domain:** code
**Status:** open
**Filed by:** coder, while closing `shared/issues/260811-1413_c_readme-hooks-still-describes-the-commit-message-class-without-the-store-scoping-that-defines-it.md`
**Cross-references:** `shared/issues/260811-1413_c_readme-hooks-still-describes-the-commit-message-class-without-the-store-scoping-that-defines-it.md` (the drift that raised the question); `hooks/lib/__tests__/derivable-enumerations-lint.test.ts:347` (the lint that watches the table's rows for existence and not for content); `hooks/lib/domain-cascade.ts` `describeReach()` + `README-hooks.md` `## How far the domain-cascade reach gate reaches` (the working precedent); `shared/issues/260811-1141_c_…` (the fix whose four synchronised edits missed the fifth site)

---

## Question

`README-hooks.md` carries a table with one row per `hooks/lib/*.ts` module, and each row's cell
describes what that module does. `derivable-enumerations-lint.test.ts:347` reads the table and
checks that the set of rows equals the set of files — it checks nothing about what a row *says*.

On 260811 the `commit-message` class was redefined in `lib/staging-drift.ts` and the new definition
was carried into four surfaces by hand. The fifth, this table's row, was missed and shipped the
pre-fix definition for the rest of the day. That is not a one-off: the same table is where a
reader who is not already inside the code goes to find out what a module is, so every row is a
claim that can outlive the module it describes, and the lint that reads the table is blind to
exactly that failure.

The same file already contains the counter-example. `## How far the domain-cascade reach gate
reaches` is *generated* — rendered from the `REACH` object in `hooks/lib/domain-cascade.ts` by
`describeReach()`, compared byte-for-byte by the suite, and the section says in the open that
editing it by hand fails the test. That mechanism exists because the claim about that gate had
twice been broader than the gate.

The question is whether the lib table should get the same treatment, and it must be answered for
the table rather than for one row: a mechanism built for `staging-drift.ts` alone would be the
point-solution `rules/critical-stance.md` §2 warns about, and would leave the other two dozen rows
carrying the same risk with the appearance of coverage.

## Options

1. **Generate every row from its module** — each `lib/*.ts` exports a one-line `DESCRIPTION`
   (or an object like `REACH`), and a renderer emits the whole table, compared byte-for-byte.
   - Pros: the row cannot outlive the module. Uniform with `describeReach()`. The lint that
     already reads the table gains content coverage for free.
   - Cons: ~25 modules to retrofit at once. The rows are long, discursive prose that reads well
     in markdown and reads badly as a string constant. It moves the user-facing text into the
     code, where a reader of the code has to skip it.
2. **Leave the table as hand-written prose and make each row say less** — describe the module's
   job, never restate a definition that lives inside it, and point at the module for the
   definition.
   - Pros: no new mechanism. Cuts the drift surface rather than watching it.
   - Cons: the row that a non-code reader consults loses precisely the content they came for,
     and "says less" is a judgment nothing enforces, so it decays back.
3. **Pin selectively — only rows that restate a definition the code decides** — keep the table
   hand-written, and give a generated block to the two or three modules whose class or verdict
   vocabulary is load-bearing (`staging-drift.ts`, `rules-write-exemption.ts`).
   - Pros: cost proportional to risk; `describeReach()` shows the shape works.
   - Cons: "load-bearing" is the judgment call, and a row that becomes load-bearing later gets no
     pin. Two kinds of row in one table, distinguishable only by looking at the code.
4. **Do nothing** — accept that the table drifts and that reviews catch it.
   - Pros: zero cost; the drift was in fact caught, by a review, within a day.
   - Cons: it was caught by a reviewer reading both surfaces, which is not a mechanism, and the
     four-site edit that caused it was itself careful work.

## Constraints

- Whatever is chosen applies to the table, not to one row. A fix for `staging-drift.ts` alone
  leaves the other rows unwatched while looking like coverage.
- `derivable-enumerations-lint.test.ts` must keep working: it is what guarantees the row *set*
  matches the file set, and no option here may weaken that.
- The generated-block precedent has a stated cost in `README-hooks.md` itself — a hand edit fails
  the suite — and any option 1 or 3 answer inherits it for every row it covers.

## Recommendation

None yet, and deliberately. The evidence supports that the drift is real and recurring; it does
not yet say whether the cure is cheaper than the disease across ~25 rows, and I did not measure
the retrofit. Option 3 is the one I would investigate first, because `describeReach()` already
proves the shape and the cost stays proportional — but its weakness (nothing decides which rows
qualify, and nothing notices when a row joins the category) is the same shape of judgment call
that this project has been burned by before, so it needs an answer before it is adopted rather
than after.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: user, session 260811-0752 (chat) — **Option 1, generate every row from its module.** Each
`hooks/lib/*.ts` exports a one-line description and the table is generated from them, the way
`describeReach()` already pins the domain-cascade paragraph. Drift becomes impossible rather than
detectable.

The record is explicit that the retrofit across roughly 25 rows was not measured, and that stands
as the known cost of this answer rather than being argued away. This choice is consistent with the
answer given to `260810-1635` in the same sitting: the general rule adopted there is that a claim
lives in one place and is cited from the others, and generating this table from the modules is that
rule applied to the surface where the drift was actually measured twice. Option 3, pinning only the
rows that restate a code decision, would have left the boundary between pinned and unpinned rows as
a judgement call renewed at every edit.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Answer recorded, not yet realised — marker stays `_a_`. No `hooks/lib/*.ts` module exports a description, and nothing generates the table. What exists is a row-set lint (`hooks/lib/__tests__/derivable-enumerations-lint.test.ts` section 5) that checks the table names exactly the files that exist, which is detection rather than the generation this answer chose. The only generated block in the file is the domain-cascade paragraph between its BEGIN and END markers at `README-hooks.md:209` and `:234`.

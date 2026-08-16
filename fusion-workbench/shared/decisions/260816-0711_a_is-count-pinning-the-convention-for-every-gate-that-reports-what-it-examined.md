# Is count-pinning the convention for every gate that reports what it examined?

---
**Domain:** code
**Status:** answered
**Filed by:** reconciler
**Cross-references:** `shared/issues/260810-2149_c_a-coverage-floor-cannot-see-coverage-leave-and-the-approved-baseline-pin-is-the-general-answer.md` (the closure that deferred this question and filed no successor); `shared/decisions/260810-2032_a_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md` (the first application); `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` (the third)

---

## Question

Three gates in this repository now report what they examined, and each has answered "how do I know
the surface did not quietly shrink?" differently:

- `hooks/lib/__tests__/reference-resolution-lint.test.ts:490` pins exact counts —
  `BASELINE = { paths: 1122, anchors: 139, records: 95 }`, asserted with `toEqual` at `:542`, with a
  failure message that names re-approval as the expected response and warns against widening back
  into a floor. This landed this session at `68d6838`.
- `hooks/lib/__tests__/domain-cascade.test.ts:784-794` asserts its reach claim by probe rather than
  by count — `REACH.covered`, `REACH.holes`, `REACH.excluded` — so the claim is measured, not pinned.
- `hooks/lib/__tests__/surface-growth-bound.test.ts` pins a per-file byte inventory in a golden
  fixture, regenerated behind a flag that fails on purpose.

`260810-2149`'s closure explicitly declined to generalise: *"whether count-pinning becomes a
convention for every gate that reports what it examined remains open; this is the third application,
which is the point at which the record says the answer stops being obvious, and it should be settled
as its own decision rather than inherited from this fix."* No such decision was filed. This record is
that filing, not a new question.

## Options

1. **Count-pinning is the convention.** Every gate that reports a surface size pins it exactly and
   re-approval is a reviewed diff.
   - Pros: one shape, learnable once. Catches a surface leaving as reliably as a surface arriving,
     which is the whole reason the floor was insufficient.
   - Cons: every legitimate edit to a watched surface reddens the suite until a number is rewritten,
     and the project has already measured what a per-edit re-approval does to review quality — the
     golden fixture's regeneration was deliberately made rare for exactly that reason.
2. **Probe-assertion is the convention, and count-pinning is the fallback.** Where the claim can be
   asserted by running the thing (as the cascade's reach claim now is), do that; pin counts only
   where no probe exists.
   - Pros: a probe survives a legitimate edit without a human rewriting a number, so it does not
     train the reader to re-approve without reading.
   - Cons: "where a probe exists" is a judgement renewed at every gate, which is the shape of
     boundary this project has been burned by before (it is the stated weakness of option 3 in
     `260811-1522`).
3. **No convention — each gate chooses, and states its choice in its own header.**
   - Pros: honest about the fact that the three gates measure genuinely different things.
   - Cons: a fourth gate inherits nothing and re-answers from scratch, which is how the first two
     came to disagree.

## Constraints

- Whatever is chosen must not turn re-approval into a reflex. `260815-2322` is open on the adjacent
  cost: a fixture that goes stale on every edit already forces one re-approval per Turn and had to be
  explained in every dispatch of this session.
- It must not widen any assertion back into a floor. That is the defect `260810-2149` closed and it
  is named in that gate's own failure text.
- Three applications exist; a fourth should not land before this is answered, or the answer will be
  inherited from whichever shape the fourth author happened to copy.

## Recommendation

None from the filing agent. The reconciler's mandate is to record ground truth, and the ground truth
here is that a question was deferred to a record that was never written. The evidence for option 2 is
the strongest of the three at HEAD — the cascade's probe assertion has cost nothing since it landed
— but "cost nothing yet" over one session is not evidence about a convention.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 2: probe-assertion is the convention, count-pinning the fallback where no probe exists. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:
Retired:

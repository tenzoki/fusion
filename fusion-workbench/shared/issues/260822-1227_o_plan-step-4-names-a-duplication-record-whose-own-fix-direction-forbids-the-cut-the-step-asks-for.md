Plan step 4 names a duplication record whose own fix direction forbids the cut the step asks for

---

`shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`
step 4 lists three already-filed duplication records as "the first candidates" for the
`skills/*/SKILL.md` cut and instructs: *"Each of those three records names a fix direction; take the
one that gives the claim a single authoring home."* One of the three names no such direction and
forbids the one the step assumes.

---

**The record.** `shared/issues/260816-0133_*_the-setup-and-migrate-probes-are-byte-identical-in-three-copies-with-no-gate-against-the-next-drift.md`,
`## Fix direction`, prescribes **a test** — about ten lines added to
`hooks/lib/__tests__/path-literal-lint.test.ts` asserting the three occurrences are byte-identical —
and then states the opposite of the step's instruction in its own words:

> Do **not** try to factor the expression into a shared file — a skill body is a prompt, not a shell
> library, and there is nowhere for it to live; the pinned-duplication shape is the right one here.

**Consequences for the Circle, both of them the wrong sign.** Discharging this record yields **zero
bytes** on `skills/*/SKILL.md`, the surface step 4 has to cut by about 4 300. And it *adds* about ten
lines to the hook test suite, the surface step 2 has to cut by 500 and which stands at 12 lines of
head-room. The record's own affordability note — *"The `hook-tests` surface has 2 320 lines of
head-room, so ten lines is affordable"* — was written on 2026-08-16 and is stale by 2 308 lines.

**Not a defect in the record.** The record's reasoning holds; the defect is that the plan reads it as
a cut candidate. The other two of the three do name a home-giving direction, so the instruction is
right for two rows and wrong for the third.

**Fix direction.** Step 4 should drop this record from its candidate list and say so, or state
explicitly that discharging it is a step-2 cost rather than a step-4 saving. The alternative the
record itself names — having Setup call the migrate survey instead of restating its query — is
rejected in the record and should not be revived here.

**Affects:** `shared/planning/260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md:132`;
`shared/issues/260816-0133_*_the-setup-and-migrate-probes-are-byte-identical-in-three-copies-with-no-gate-against-the-next-drift.md`.

**Severity:** Medium. A step that starts from this candidate spends its budget in the wrong
direction on both bounded surfaces at once.

**Found by:** analyst, step 1 of the same plan. Ledger: `shared/analyses/260822-1226-cut-ledger-for-three-bounded-surfaces.md`.

---
**Reconciliation 260822-1556 (reconciler, domain `code`, HEAD `9f65463`) — marker unchanged at
`_o_`. The harm the record predicted did not occur, and its fix direction has become unreachable.**

*The step did not take the candidate.* `c2ad89c` cut 4 340 bytes across eight skill bodies (`next`
1 083, `setup` 1 042, `help` 468, `cleanup` 455, `curate` 330, `direct` 330, `cadence` 316, `memo`
316) and did not touch the three-copy bracket probe;
`shared/issues/260816-0133_*_the-setup-and-migrate-probes-are-byte-identical-in-three-copies-with-no-gate-against-the-next-drift.md`
is still `_o_`. `hooks/lib/__tests__/path-literal-lint.test.ts` was touched once in the range, by
the step-2 cut in `5afb910`, which replaced its private walk of `agents/` and `skills/` with
`shippedPrompts()` from `helpers/citation-scan.ts`; it gained no probe-identity assertion, and the
file carries no `byte-identical` check at HEAD. The hook test suite stands at 302 lines of
head-room, so neither cost the record warned about was paid.

*The fix direction is no longer available.* It asks step 4 to drop the record from its candidate
list "and say so". The plan closed at this pass, and this project does not edit a closed plan to
make a past state true — the plan's own step 8 says so about a different closed record. What the
plan carries instead is the reconciliation log's account of what step 4 actually cut.

*What is left open, and it is the whole of the record's value.* The judgement stands:
`260816-0133`'s fix direction is a test and it forbids factoring, so that record is not a
`skills/*/SKILL.md` cut candidate for any future Circle either. The affordability note it carries
("2 320 lines of head-room, so ten lines is affordable") is stale by a further 12 lines since this
record measured it: the surface holds 302. Whoever plans the next cut reads this record before
reading `260816-0133`.

Searched for a landed fix: `git log 370bfc5..9f65463 -- hooks/lib/__tests__/path-literal-lint.test.ts`
(one commit, `5afb910`, and its diff is the walk replacement above), `git diff 370bfc5 9f65463` over
the three bodies carrying the probe, and the step-4 history
`shared/history/260822-1420-coder-cut-skills-surface-step4.md`.

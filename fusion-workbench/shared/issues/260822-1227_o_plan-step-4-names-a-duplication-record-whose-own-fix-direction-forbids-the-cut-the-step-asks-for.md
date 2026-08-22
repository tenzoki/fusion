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

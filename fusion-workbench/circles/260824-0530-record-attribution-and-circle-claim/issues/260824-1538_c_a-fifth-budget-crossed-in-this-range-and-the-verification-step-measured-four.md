A fifth budget crossed in this range and the verification step measured four
---
`rules/circle-records.md` grew 20 172 -> 22 798 bytes across `e209011..0f5889e`. The role rule-text report in `hooks/lib/__tests__/rules-emission-golden.test.ts` now fires for `playmaker` (22 798 against a budget of 21 302) and for `shaper` (27 632 against 26 975). Both were under before this range. Step 11's verification tabulates the four blocking surfaces and the prose metric and does not name this one, so the plan's stopping clause "all four growth bounds pass" is true and incomplete.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`, the C3 Circle's full range.

**Measured.** `npx vitest run lib/__tests__/rules-emission-golden.test.ts` at `0f5889e` prints, on stderr and without failing:

```
role 'circle-records.md' — playmaker
  22 798 bytes of role-specific rule text, budget 21 302 (floor 9 302 + 12 000)
role 'circle-records.md + design-diagrams.md' — shaper
  27 632 bytes, budget 26 975 (floor 14 975 + 12 000)
```

`wc -c` gives `rules/circle-records.md` 22 798 at `HEAD` and 20 172 at `e209011`, a delta of +2 626 from the new `### The claim field` at `0a726b5`. Subtracting that delta from each role's current total puts playmaker at 20 172 against 21 302 and shaper at 25 006 against 26 975 before the range. Neither was over; both are now.

**Why the plan's accounting missed it.** The plan's risk table names three likely trip points and the surface it puts step 6 against is "3 321 always-on bytes". `rules/circle-records.md` is not always-on — `bin/fusion-rules` emits it to `orchestrator`, `playmaker` and `shaper` only — so it is charged to the role budget in `rules-emission-golden.test.ts` and not to the always-on core. That budget is a fifth instrument, in a fifth file, and no step measured it. `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1512-coder-c3-step11-verification-and-four-bounds.md:52-65` tabulates four surfaces plus the prose metric per changed rule file.

**What is and is not at stake.** Nothing is red: the report deliberately does not block, for the reason its own header gives at `hooks/lib/__tests__/rules-emission-golden.test.ts:98-107` — a ratchet made the first finding-driven addition unlandable. `npm test` is green at `0f5889e`, verified: 42 files, 732 tests. What is lost is the instrument's whole product, which is the moment somebody is told a cleanup is due. Told in a stderr block of a passing run, by a Circle whose own verification says four budgets were checked, it is told to nobody.

Fix direction: no cut is required by this record. What is required is that the crossing is on the record — either as a line in the Circle's closure note naming which two roles crossed and by how much, or as its own open item for the next cleanup. Naming it is the fix; the cut is a separate judgement.

Adjacent, and deliberately not pre-empted: `shared/decisions/260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` is open and this record takes no position in it.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1637-reconciliation.md`) — **STAYS `_o_`.** Re-measured by running the instrument rather than reading the record. `npx vitest run lib/__tests__/rules-emission-golden.test.ts` passes and prints the role rule-text report on stderr for two roles: `playmaker` at 22 798 bytes against a budget of 21 302, and `shaper` at 27 632 against 26 975, both attributing the growth to `circle-records.md +13 496`. The report ends "This does not fail the suite", so the fifth instrument still reports where nobody is looking, which is the record's whole subject.

---
**Resolved: fixed** (coder, Circle `260824-1853-close-every-open-defect` step 14, HEAD `6b26e2c`, range `571f945..6b26e2c`; log `circles/260824-1853-close-every-open-defect/history/260824-2150-coder-step-14-closing-measurement.md`). The fix this record asked for is that the crossing is on the record, in a closure note that measures the fifth instrument alongside the four. Measured by running it: `cd hooks && npm test` is green (43 files, 760 tests, exit 0) and `rules-emission-golden.test.ts` prints the role rule-text report on stderr for **three** roles now, one more than at filing:

- `playmaker` (`circle-records.md`): 24 653 bytes against a budget of 21 302 (floor 9 302 + 12 000), **over by 3 351**.
- `shaper` (`circle-records.md + design-diagrams.md`): 29 938 against 26 975 (floor 14 975 + 12 000), **over by 2 963**.
- `orchestrator` (`circle-records.md + commit-lock.md`): 30 760 against 30 552 (floor 18 552 + 12 000), **over by 208**. This role crossed inside this Circle's range (step 13 named it); at filing it stood under.

All three attribute the growth to `circle-records.md +15 351` since the 2026-08-05 cut. The four blocking bounds in the same run, total / budget / head-room left: `agents/` 414 168 / 417 843 / 3 675 bytes; `skills/` 238 669 / 240 439 / 1 770 bytes; hook tests 20 373 / 20 375 / 2 lines; always-on rules 98 357 / 98 573 / 216 bytes. No baseline map moved against `2cdd372`. The cut itself is the separate judgement this record declined to make; it sits with `shared/decisions/260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`, which stays open.

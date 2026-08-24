The checkout identifier is never overwritten and no test holds that property
---
`bin/fusion-identity:197-202` refuses to rewrite a `.checkout-id` that does not hold eight lowercase hex, and the script's header calls that the property whose loss "would hand two checkouts the same history under two different identifiers". `hooks/lib/__tests__/fusion-identity.test.ts` drives all six exits and the mint-once case and never writes a malformed identifier, so the refusal is untested.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`, the C3 Circle's full range. The helper landed at `3ba7a46`, its test at `b7f8326` (plan steps 4 and 5).

The test file's own header states what it holds and what it leaves out. It names one deliberate omission, the concurrent mint, with a reason and a cost. The malformed-file branch is not named at all, so its absence reads as coverage rather than as a choice.

**The branch is live and correct today.** Verified by probe against a temporary workbench holding `NOTHEX`: the script prints

```
fusion-identity: <path>/.checkout-id does not hold an identifier (expected 8 lowercase hex). It was not overwritten; inspect it, and delete it only if no record cites it.
```

exits 5, and leaves the file byte-identical. So this is a coverage gap, not a defect in behaviour.

**Why it is worth a test rather than a shrug.** Every other exit in the table is pinned, and the two the header singles out as worth more than the rest are both pinned. This one guards the same invariant from a different side: exit 1's test proves a failing call mints nothing, and this branch proves a *succeeding* call does not re-mint over a value that may already be cited by records on disk. The `head -1` and the anchored `grep -Eq` at `:196-197` are the mechanism, and both are the kind of shell that changes meaning under a small edit.

Fix direction: one case. Fixture with `workbench: true` and `git: "both"`, write `not-hex\n` into `idFile` before the run, expect status 3, `checkout` null, `person` present, the stderr to contain "was not overwritten", and the file to read back unchanged. Roughly eight lines.

**One constraint the fixer has to hold.** The hook-test line surface has budget for it now — `8092c11` freed 44 lines and `surface-growth.golden` puts the surface at 20 334 — but the plan capped this file at 180 lines and it stands at exactly 180. Adding here spends the surface's head-room, not a per-file allowance; check `surface-growth-bound.test.ts` before and after rather than assuming either.

---
**Reconciliation 260824-1637** (reconciler, domain `code`, Phase 3 of session `260824-0539`, HEAD `cf7a5b0`; log `circles/260824-0530-record-attribution-and-circle-claim/history/260824-1637-reconciliation.md`) — **STAYS `_o_`.** `grep -n 'malformed' hooks/lib/__tests__/fusion-identity.test.ts` returns nothing, so the branch is still untested. The property itself was confirmed live during this pass, by accident rather than by design: a probe that removed `tr` and `grep` from `PATH` drove the helper into the malformed branch, which reported "It was not overwritten; inspect it, and delete it only if no record cites it" and left `fusion-workbench/.checkout-id` byte-identical at `5e8248d7`. The behaviour holds and nothing in the suite would notice if it stopped.

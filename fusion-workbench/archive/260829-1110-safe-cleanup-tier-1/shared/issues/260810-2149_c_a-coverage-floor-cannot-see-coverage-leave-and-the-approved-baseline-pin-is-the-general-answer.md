A coverage floor cannot see coverage leave, and the approved baseline pin is the general answer

---

Two gates lost coverage this session with nothing turning red. The cause is the same in both, and it
is not the contents of either gate.

`reference-resolution-lint.test.ts` counts what it examined — `counts.paths`, `counts.anchors`,
`counts.records` — and asserts a **floor** against it (`counts.paths > 50` against a corpus of 148).
Eight citations left the examined set when they gained a root variable the gate did not classify, and
the floor could not see it. No floor placed anywhere could: raising it to 140 makes it brittle
against every legitimate edit that removes a citation, and leaving it low makes it blind.

The cascade reach gate has the same shape from the other side: its claimed reach was written by hand
beside it, and twice in two Turns the claim was broader than the gate.

---

**The fix is one the user has already chosen once.** Decision `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md` adopted a baseline pin for
the drift check's four sentences: assert equality against a committed baseline rather than screening
for what might have gone wrong, with a failure message stating that re-approving the baseline is the
expected response to a legitimate change. Pinning a coverage *count* is the same mechanism applied to
a number instead of to prose.

Under a pin, the eight departing citations would have failed the suite at the moment they departed,
and the fix would have been part of that change rather than a record filed afterwards.

**Costing, from the executor who found it:** roughly 15 lines in
`reference-resolution-lint.test.ts`, plus one number to update per deliberate change. The cascade
reach gate would take a comparable pin.

**What has to come with it, and it is the same condition the decision already carries.** The failure
message must say plainly that re-approval is expected and how to do it. A gate that punishes a
legitimate edit without saying so gets routed around, and that is the whole risk of pinning.

**Scope question for whoever takes this**, which is worth settling once rather than per site: is
count-pinning a convention for every gate that reports what it examined, or a fix applied to these
two? Three applications in one session is the point at which the answer stops being obvious by
default. Note that `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`'s answer covered the drift check only, and deliberately did not
settle whether the blacklist beside it comes out — the same restraint applies here.

**Sequencing.** Decision `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`'s pin is already sequenced behind
`I:260801-2038-frozen-state`. This one has no such dependency and can land on its own.

**Filed by:** orchestrator, session `260810-1646-orchestrator-session.md`, on the silent-skip executor's costed proposal.

---

## Resolved 2026-08-16 — for `reference-resolution-lint.test.ts` only

Session `260816-0119`, coder, in one pass with the three sibling defects that share the file.

The three floors — `counts.paths > 50`, `counts.anchors > 20`, `counts.records > 10` — are gone. In
their place a committed `BASELINE = { paths: 1122, anchors: 139, records: 95 }` is asserted with
`toEqual`, in one comparison over all three so a count moving between classes cannot hide inside a
per-class check.

**The costing held: roughly 15 lines**, plus the failure message. The measured numbers came with the
same pass's other two fixes, and the comment beside the constant says which fix moved which number
(`paths` 1095 → 1122, the `lib/…` spelling entering scope; `records` 87 → 95, the top-level
`hooks/*.ts` entering scope), so a later reader can tell an approved move from an unexplained one.

**The condition the record insisted on is met, and it was verified by mutation in both directions**
rather than asserted:

- *Coverage leaves* — the case no floor can see. Rewriting one shipped citation from `lib/git.ts` to
  a bare `git.ts` (path-shaped to basename, the exact shape of a spelling silently leaving scope)
  fails at `paths: 1121` against `1122`.
- *Coverage arrives* — adding two resolving citations to `README-hooks.md` fails at `paths: 1124`.

Both print the same message, which states in full sentences that **re-approving the baseline is the
expected response to a legitimate change**, tells the reader to check the received numbers against
the edit they made and write them into `BASELINE` in the same commit, and names the one response
that is not wanted: widening the assertion back into a floor.

**The scope question the record raised is deliberately NOT answered here**, on the restraint the
record itself asks for — `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md` covered the drift check only, and this closure covers
`reference-resolution-lint.test.ts` only. **The cascade reach gate is untouched and still carries
its hand-written claim.** Whether count-pinning becomes a convention for every gate that reports
what it examined remains open; this is the third application, which is the point at which the record
says the answer stops being obvious, and it should be settled as its own decision rather than
inherited from this fix.

One floor deliberately survives in the same file: `expect(gateResolved, "not vacuous — the surface
still carries record citations").toBeGreaterThan(10)` in the parser-parity describe block. It
guards the same quantity that `BASELINE.records` now pins exactly, so it can no longer be the only
thing standing between a departure and a green suite.

---
**Reconciliation 260816-0713-coderev-turn-5-6-range-3a0408a-f77633f.md (reconciler, HEAD `f77633f`) — the fix holds; two statements in the
closure above do not. Marker unchanged.**

The fix itself verifies: `hooks/lib/__tests__/reference-resolution-lint.test.ts:490` carries
`BASELINE = { paths: 1122, anchors: 139, records: 95 }`, asserted with `toEqual` at `:542`, with the
re-approval message at `:495-503` and one deliberate floor left at `:921`. The suite is green at HEAD
(40 files, 764 tests, exit 0).

Two corrections to the annotation:

1. *"The cascade reach gate is untouched and still carries its hand-written claim."* Stale.
   `hooks/lib/__tests__/domain-cascade.test.ts:784-794` now asserts the reach claim by probe —
   `REACH.covered`, `REACH.holes`, `REACH.excluded` — under `describe("the reach claim is asserted,
   not written")`. The error is in the conservative direction: more is fixed than the note claims.
2. The scope question the closure deferred — *"whether count-pinning becomes a convention for every
   gate that reports what it examined"* — was to be *"settled as its own decision"* and no decision
   was filed. That filing gap is closed now:
   `260816-0711_*_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md`.
   The record is a filing of the deferred question, not a new one.

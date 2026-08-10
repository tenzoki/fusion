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

**The fix is one the user has already chosen once.** Decision `260810-2032` adopted a baseline pin for
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
default. Note that `260810-2032`'s answer covered the drift check only, and deliberately did not
settle whether the blacklist beside it comes out — the same restraint applies here.

**Sequencing.** Decision `260810-2032`'s pin is already sequenced behind
`I:260801-2038-frozen-state`. This one has no such dependency and can land on its own.

**Filed by:** orchestrator, session `260810-1646`, on the silent-skip executor's costed proposal.

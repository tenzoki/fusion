`guard-state-shape.test.ts` fails three cases under suite load and passes in isolation

---
Observed once in three consecutive full runs of `npm test` in `hooks/` on 2026-09-16, while the tree
stood at the head-room raise that closed
`260916-1314_*_the-weight-helpers-test-pins-the-banner-and-the-exit-code-while-the-measurement-goes-unasserted.md`.
Three cases in `hooks/lib/__tests__/guard-state-shape.test.ts` failed on a missing review-coverage
sentence. The same file passed in isolation and passed in the other two full runs, and a fourth full
run afterwards passed 943 of 943.

In the failing run, `fusion-paths.test.ts` took 446 seconds. Both files spawn git and both write
under a scratch root, so the failure has the shape of a harness that is not isolated from load rather
than of an assertion that is wrong.

**Nothing in the edits of that session is reachable from the failing file**, which is what makes this
worth its own record rather than a note on any of them: it is a property of the suite, and it will
outlive every record it was noticed beside.

*inference, not measurement:* load-induced flakiness in the spawning harness. Nobody has reproduced it
deliberately, no timeout or race has been located, and the three failing cases have not been read
against the harness they share. Calling it flaky on one observation is exactly the reasoning that
lets a real intermittent defect sit for months, so the claim is labelled rather than asserted.

A flaky gate is worse than a missing one. It trains a reader to re-run rather than to look, and the
run it is ignored in is the run it was right.

**Acceptance test:** the failure is reproduced deliberately — by running the suite under comparable
load, or by driving the two files concurrently — and either the harness is isolated from whatever it
shares, or a record states what was measured and why it is not worth isolating.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Reported by the executor that took the head-room raise, which named it rather than narrowing its
command to get a pass. Filed in the shared store rather than in the work item's, per the origin rule:
it did not arise from that item's directive, it was found beside it.

---
Resolved: an observation of the mechanism `91515fd5` repaired, and the reproduction this record asks for was run deliberately. The missing review-coverage sentence is what the tracker emits when `measureReviewCoverage` returns empty, which `hooks/lib/git.ts` caused whenever a loaded `git log` crossed its 5 000 ms budget and was rendered as a decline; the helper now returns a distinct timeout, retried once, under 10 000 ms per attempt drawn from the measured tail. Reproduction: ten pairs of concurrent `cd hooks && npm test` at `73c11cfd`, 0 red of 20, `guard-state-shape.test.ts` green in all twenty, recorded on `260905-2356_*_the-hook-suite-is-not-isolated-from-a-second-copy-of-itself-and-fails-at-forty-percent-under-one.md`, which states what the figure certifies.

A review-coverage case fails in a full-suite run and passes in isolation

---
`review-coverage.test.ts`, case `a range it cannot pin > lists a review with no
**Reviewed-range:** line, with the reason`, failed once in a full `npm test` run with
`expected '0' to be '1'`, then passed in an isolated run of that one case and again in a
second full-suite run over the same tree. This is the second test in the suite observed to
fail on something other than the code under test.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence, and the honest limit on it.** One failure, two subsequent passes, all on
2026-09-05 during loop 1 of session `260905-2008-orchestrator-session.md`. The failing run
was the first full suite after a batch of eight parallel repairs landed in the working
tree; the two passing runs came after two of those repairs had been committed and two test
baselines re-approved. So the tree was not byte-identical across the three runs, and that
is the reason this record does not claim a flake outright. What it does establish is that
the case does not fail deterministically on the tree as committed at `ea819262`, because
the full suite there is green: 871 tests in 51 files, exit 0.

Nothing has looked at why the count came back 0. Two readings are open and this record
prefers neither: the case may read shared state that a concurrently running case in the
same suite disturbs, or it may read the real workbench, whose review store was being
written by sibling agents during that first run.

**Why it is worth a record rather than a shrug.** `npm test` is a release gate here, so a
case that fails on load rather than on the code costs a session a diagnosis before it can
tell noise from a regression. It cost one here. The suite was carrying no other failure of
this kind at the time, which is the condition under which such a failure is still visible;
`260904-2140_*_monitor-warnings-panel-test-fails-intermittently-on-the-dual-stack-bind.md`
records the same shape in a different case, and two of them is where the pattern starts
being absorbed as background noise.

**Acceptance.** A rate is measured first, over a run count this record names once it is
chosen. Then either the case is made deterministic against whatever it shares, or the
record says why the race is acceptable and what a session should do when it sees this
failure. Closing it on a green run alone is not acceptance: three green runs have already
been observed and the failure is not thereby explained.

**Cross-references:**
`260904-2140_*_monitor-warnings-panel-test-fails-intermittently-on-the-dual-stack-bind.md`
(the same shape, a different case, and the same unmeasured rate).

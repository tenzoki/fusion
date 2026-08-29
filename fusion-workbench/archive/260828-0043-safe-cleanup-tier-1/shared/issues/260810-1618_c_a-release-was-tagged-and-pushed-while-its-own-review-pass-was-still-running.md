A release was tagged and pushed while its own review pass was still running

---

Session `260810-1402` dispatched a `coderev` pass over its commit range
`430d73a..HEAD` and, to avoid making the user wait, ran the release mechanics in
parallel: version bump across four surfaces, `claude plugin validate`, the agent
smoke test, the marketplace bump, `git push`, `git tag -a v7.2.0`, `git push
origin v7.2.0`. The release finished first. **v7.2.0 is tagged, pushed, and
reachable by every consumer while the review of what it contains had not
returned.**

The dispatch prompt for that review said, in its first line, that a release goes
out immediately after and that its findings decide what ships. The orchestrator
then did not wait for the answer to the question it had just asked.

---

**Why this is not merely untidy.** A finding now cannot change v7.2.0. It lands
in a 7.2.1, after consumers have been told to update — and the user's stated
reason for closing the session early was precisely to update consumers. Holding
the tag for the ten minutes the review needed would have cost nothing that
mattered. The ordering was chosen for a responsiveness that was never asked for.

**This is a reproduction, not a new class.** Open record
`260810-1205_*_seven-of-sixteen-commits-in-the-session-range-never-reached-a-review-pass-and-nothing-measures-the-gap.md`
describes exactly this: a range reaching HEAD and a pushed tag with no reviewer
having opened it. That record is task 12 in this session's own queue, was
classified high priority, was ordered behind task 5, and was not reached. The
session carrying the fix committed the defect.

The two are filed separately on purpose, and the distinction matters for whoever
fixes them. `260810-1205` is about **coverage**: passes that ran but did not tile
the range, and nothing measuring the gap afterwards. This record is about
**ordering**: a pass that was correctly scoped to the whole range and was
overtaken by the release it was gating. A coverage metric computed at session end
would have reported this range as fully reviewed, because the review did eventually
run. Fixing `260810-1205` does not fix this.

**The release procedure is where it should be caught.** `CLAUDE.md`'s release
section has a validate gate (step 0), a smoke test, and a guard-testing caution.
It has no gate asking whether the range being tagged has been reviewed. Every
check it does carry is about whether the plugin *loads*; none is about whether
anyone looked at the change. That absence is the mechanism, and prompt text
telling a future orchestrator to be patient is not a repair for it — the same
reasoning `260801-2038` records about prompt-only fixes.

**Candidate directions, none of them decided here:**

1. **A release gate that refuses to tag over an unreviewed range.** Derivable from
   the review filenames, which already carry their ranges, against `git rev-list`.
   It is the same computation `260810-1205` asks for, used as a precondition
   rather than as a report — so the two records share a mechanism even though
   neither subsumes the other.
2. **Make the review synchronous whenever a release follows.** Cheap, and it is
   what should have happened. It is also exactly the kind of instruction that
   loses to task pressure, which is how this happened.
3. **Accept that a release may go out over an unreviewed range, and say so.**
   That is already an open question and it has a home:
   `260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`
   is the same shape one layer up. If the answer there is yes, this record closes
   as intended behaviour rather than as a defect.

**Acceptance:** whatever lands, a session that tags a release can state — from
evidence rather than from recollection — whether the tagged range was reviewed,
and a `no` is visible before the tag is pushed rather than after.

**Filed by:** orchestrator, session `260810-1402`, immediately after doing it.
The review's findings, when they arrive, belong in a follow-up release; this
record is about the ordering, not about whatever the review turns out to say.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `CLAUDE.md` `## Release process` step 0 still carries only the validate gate, the smoke test and the guard-testing caution. `bin/fusion-review-coverage` exists but its own header states it is not a release gate, so it names the gap rather than closing it. The same failure recurred at v10.0.0, tracked in `260817-1417_*_the-release-went-out-over-a-turn-…`. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: fixed — release step 0 now says to run `bin/fusion-review-coverage --since <previous tag>` and state the result before tagging, advisory per `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` option 1; `CLAUDE.md:87`

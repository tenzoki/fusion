Two pin re-approval entries were dropped instead of rolled into the log the header prescribes
---
`hooks/lib/__tests__/reference-resolution-lint.test.ts` documents that older re-approval entries are moved **verbatim** into a dated log under the analyses store, and names the two that already went that way. A dispatch this session told the repairing agent to drop the oldest instead. Two entries left the comment with nothing outside git history holding them.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**The instruction was mine and it was wrong.** The dispatch capped the trailing comment at three entries and said to drop the oldest, written without reading the header first. The header's own mechanism is a roll, not a drop: entries 1 to 25 and 26 to 40 each moved verbatim into a dated file under `shared/analyses/`, and the sentence tells the next re-approver to roll again when the entries grow long, citing the decision that chose it. The agent followed the dispatch, said plainly that it had dropped rather than rolled, and named what that costs. The defect is the instruction, not the execution.

**What was dropped**, both readable in this file at `git:d5a27230`: the 2026-08-29 re-approval for `bin/fusion-citation-sweep` (paths 1544 → 1552) and the 2026-08-29 grammar entry (stampBare 12 → 11).

**Why it matters more than two comment lines.** The log exists because this pin's history is the only record of *what moved the number*, and the growth bound measures the file by the line, so the history cannot simply accumulate in place. A reader who wants to know why `paths` stands where it does follows the log. Two entries reachable only by knowing which commit to check out are outside that path.

**Acceptance.** The two dropped entries are readable verbatim in a dated file under the analyses store, in the form the two existing logs use, and the pin's trailing comment names that file the way it names the other two. Nothing in the pin's numbers changes, and no baseline moves.

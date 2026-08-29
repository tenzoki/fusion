A conceptrev review is counted unusable by the coverage helper, which has no place for a document review

---
`bin/fusion-review-coverage` tiles review files by their `**Reviewed-range:**` field and reports any
review lacking one as `UNUSABLE`. `agents/conceptrev.md` mandates no such field, and cannot
sensibly: a conceptrev run evaluates the Mermaid diagrams in one document, not a range of commits.
So every conceptrev review is counted as an unusable review for as long as both hold.

---
**Measured 2026-08-14.** Running the helper over this session's range returned `reviews=1`,
`unusable=1`, and the line:

```
review circles/260801-1244-curator/reviews/260814-0857-conceptrev-plan-curator.md
  range=(none recorded) not-opened=(not recorded) UNUSABLE (no **Reviewed-range:** line)
```

That review is not defective. It did exactly its job, returned an `acceptable` verdict over three
diagrams, and was surfaced at the plan gate.

**Why the miscount matters.** `unusable` exists to separate two facts the orchestrator is told to
keep apart: a range nobody reviewed, whose fix is another review pass, and a review that ran and
cannot be tiled, whose fix is a reviewer prompt. A conceptrev run is neither. It inflates the
unusable count with something no prompt change would repair, and a reader chasing the number is sent
at `agents/conceptrev.md` to add a field that would be meaningless there.

**Three candidate resolutions, none chosen here.**

- The helper ignores reviews whose `<sender>` is `conceptrev`, reading the sender from the filename,
  which the naming convention already mandates as `YYMMDD-HHMM-<sender>-<topic>.md`.
- Conceptrev reviews carry a different field naming the document they opened, and the helper counts
  them in a category of their own rather than as coverage.
- Conceptrev carries `**Reviewed-range:**` naming the commit the document was read at. This gives
  the field a meaning, but it is not commit-range coverage, so it would make the tiling claim
  something untrue.

The first is the cheapest and needs no prompt change. Deciding between them is not this record's job.

**Filed in the shared store** per the Origin Rule: found next to Circle `260801-1244-curator`'s
work, not caused by its Directive. The defect is in the coverage helper and the conceptrev
convention, both of which predate this Circle.

**Filed by:** orchestrator, session `260813-2345-orchestrator-session.md`.

---
Resolved: duplicate. The same defect is filed more fully as
`260811-1145_*_conceptrev-review-files-are-scanned-and-trigger-the-coverage-report-though-no-mandate-covers-them.md`,
which names both halves of the mechanism — the scan in `hooks/lib/review-coverage.ts` and the
trigger in `hooks/tracker.ts` — and cites the commit that gave the mandate to the other two review
agents. Closed against that record on the Turn-3 review's recommendation; its measurement of
2026-08-14 stays here on disk and in git as the second observation of the same fault.

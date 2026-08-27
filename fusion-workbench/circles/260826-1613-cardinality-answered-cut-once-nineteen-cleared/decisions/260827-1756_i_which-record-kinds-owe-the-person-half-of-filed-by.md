# Which record kinds owe the person half of `**Filed by:**`?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `shared/issues/260825-1250_*_twenty-eight-records-filed-since-the-attribution-rule-landed-carry-no-person-half-and-no-stated-reason.md` (the reach question, and the two-count disagreement it produced); `rules/fusion-workbench-conventions.md` `### Who filed it` (the obligation, scoped by its heading to defects and decisions); `rules/review-contract.md` (mandates two header fields, neither of them `**Filed by:**`); `shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `### C3` criterion 3; `hooks/session-start.ts` (exports `FUSION_PERSON` since v10.8.0, which closes the miss branch the 31 records fell through)

---

## Question

The obligation to write the person half sits under a heading that addresses defects and decisions, and the 31 non-compliant records include one review and one session history. Two passes counted the set differently on exactly those two files. The repair plan closes the defect record on the v10.8.0 identity export and needs the boundary written down, because a count over the records is not reproducible until it is.

## Options

1. **Defects and decisions only**, as the heading says. Reviews and histories may carry the line and are not measured on it.
   - Pros: no change to any template; the predicate is the heading.
   - Cons: a review that names no author is a review nobody is accountable for, and `bin/fusion-review-coverage` tiles reviews by range, not by author.
2. **Every record whose template carries the line**: defects, decisions, reviews (add the line to `rules/review-contract.md`'s two mandated fields), and session histories (add it to the history entry shape in `## History Logging`).
   - Pros: one predicate, "the template carries it", and the count becomes reproducible.
   - Cons: two rule edits, one on an always-on file; `rules/review-contract.md` is conditional and reported rather than bounded.
3. **Every record with a `**Filed by:**` line, wherever it appears.** Line-scoped and kind-blind.
   - Pros: the predicate the second pass used; needs no template change.
   - Cons: a kind that omits the line entirely is compliant, so the obligation is avoidable by omission.

## Constraints

- No gate is added: `hooks/lib/__tests__/` has 1 line free at `0fb5085`, and the miss branch that produced the 31 is closed by the SessionStart export, so a gate would police a case that no longer arises in the ordinary way.
- The 31 backfilled records stay as they are; the boundary is forward-looking.

## Recommendation

Option 2. It is the only one under which "every agent that files a record writes the field" (criterion C3.3) is a sentence with a checkable subject.

## Answer

Option 2: the field is owed by every record kind whose template carries it, and those kinds are named in the conventions. Realised by plan step 8.

Answered: 260827-1830, Kai Stalmann <ks@qantr.com> at the orchestrator gate of session circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/history/260827-1749-orchestrator-session.md; the recommendation is adopted as written.

Implemented: plan step 8 of `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/planning/260827-1756_*_repair-the-twenty-open-defect-records.md`, 260827-1845 (the commit is the orchestrator's, after this task) — the reach sentence in `rules/fusion-workbench-conventions.md` `### Who filed it`, the third mandated field in `rules/review-contract.md`, the line on the history entry in `## History Logging`.

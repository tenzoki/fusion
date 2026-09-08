A doc comment cites two re-baselining events while the helper defines three

---

The doc comment above `RULE_BASELINE` in `hooks/lib/__tests__/rules-emission-golden.test.ts`
cites `helpers/growth-bound.ts` `## Re-baselining: the two events at which the baseline moves`.
That helper has defined three since 2026-09-05, when the merge event was added, and
`hardBoundMessage()` in the same file as the stale comment already says three.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Found by the agent repairing
`260908-0027_*_the-universal-core-comment-names-five-files-while-the-bound-measures-three.md`,
which left it standing because it is a different stale claim from the one that record diagnoses.
It is noted in that record's `Resolved:` line and filed here so it is tracked as a defect rather
than as a footnote to a closed one.

**Why no gate catches it.** The anchor lint resolves headings in shipped text and this citation
sits in a hook test's comment, so the suite is green with the claim wrong. The same blind spot
produced the record above.

**Why it is worth more than its size.** Two stale statements about the same mechanism have now
been found in one file within one session, and the first one cost a plan a head-room figure that
was wrong by more than a factor of two. The pattern is a comment describing a mechanism that has
since moved, in a file nobody re-reads because its assertions pass.

**Acceptance.** The citation names the count the helper actually defines, and the two statements
in this file agree with each other.

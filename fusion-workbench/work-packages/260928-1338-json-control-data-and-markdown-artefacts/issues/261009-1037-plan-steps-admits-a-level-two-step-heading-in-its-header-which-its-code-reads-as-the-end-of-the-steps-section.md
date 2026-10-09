`planSteps` admits a level-two step heading in its header, which its code reads as the end of the steps section
---
`hooks/lib/record-write.ts` `planSteps` (added at `e29fb624`) says a step is "a numbered line, bare or as a `##`-to-`####` heading, under `## Implementation Steps`". The loop tests `/^## /` before the step pattern, so a line `## 2. Second step` sets `inSteps` false and is no step; every later step is lost too. A plan written that way is filed with fewer anchors and no word, the failure class `e29fb624` closed for repeated numbers. Low: the shipped planner prompt and the conventions use bare numbered lines, and no live plan uses `## N.` headings.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence:** `hooks/lib/record-write.ts` `planSteps`: `if (/^## /.test(line)) inSteps = /^##\s+implementation steps\b/i.test(line);` runs before `/^(?:#{2,4}\s+)?(\d+[a-z]?)\.\s+/`. The test in `hooks/lib/__tests__/record-write.test.ts` ("creation") covers `### 2. second` only. Read, not run.

**Fix direction:** either drop `##` from the admitted heading levels in the comment and the pattern (`#{3,4}`), or refuse a `## N.` heading inside the steps section as usage, as a repeated number is.

**Acceptance:** the header and the code agree, and a case pins what a `## 2.` line under `## Implementation Steps` does.

Cross-references: 261009-1037-reviewer-g-a-pre-release-review-of-13-0-0.md

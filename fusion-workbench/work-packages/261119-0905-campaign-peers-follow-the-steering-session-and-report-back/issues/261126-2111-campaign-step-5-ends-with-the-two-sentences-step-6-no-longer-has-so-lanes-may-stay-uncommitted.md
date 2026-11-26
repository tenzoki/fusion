# Campaign Step 5 ends with "the two sentences" Step 6 no longer has, so the lanes may stay uncommitted

---
Step 5 (`lanes`) ends: "End with the two sentences Step 6 ends every steering report with." Since 13.6.0 Step 6 ends with one sentence, and its commit route sits before the report. A session can read Step 5 two ways: say the one sentence and commit nothing, or run Step 6's commit route too.
---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** review `261126-2111-reviewer-closing-pass-over-13-6-0.md`; plan `261123-1000-plan-fix-the-three-trial-causes-and-retest-before-13-6-0.md` step 4, variant (a)

**Evidence:** `catalog/profiles/skill-campaign/parts/06-claude.md:25` (rendered `skills/campaign/SKILL.md:120`), unchanged in the range; `parts/07-claude.md:17` (rendered `:137`), which replaced "and the record travels with your next commit and push, so until then no other checkout sees it" with the commit route. In the first reading the `lanes` write and the `set-mode` writes stay in the working tree, and the user is no longer told that they travel only with a commit, while a peer reads its `lane=` row only from the remote. `skills/help/SKILL.md:89` says "every steering act" is committed in the turn it is confirmed.

**Acceptance:** Step 5 says, in one reading, whether the `lanes` write and the `set-mode` writes are committed and pushed in the turn (and by which route), or that they travel with the next commit. No sentence refers to a count of sentences in another step.

citation-sweep rewrites a review report whose evidence binds its bytes
---
`bin/fusion-citation-sweep --write --yes --kinds record` rewrote the `**Not-opened:**` line of `261027-2337-reviewer-13-4-1-pre-release-steps-2-to-7.md` (eight store-prefixed citations respelled as basenames). The report's `.evidence.json` binds the report's bytes, so the rewrite left the evidence unreadable (`missing-evidence/report-changed`) and `workbench-citation-lint.test.ts` failed three tests. The sweep noted the binding in its output and wrote anyway. The codec then refused to re-record evidence under the same basename (`fusion-write evidence` exit 6, `conflict/record-exists`), since evidence records are immutable.

So two checks in the suite contradict each other on any review report that carries a store-prefixed citation and has evidence: `citation-sweep.test.ts` is red before the sweep, `workbench-citation-lint.test.ts` is red after it. The only ways out are destructive: delete the evidence and re-record it (done here, on the user's word, option 1 in chat on 2026-10-28), or re-file the report under a new basename.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Executor:** code-implementer
**Cross-references:** 261027-2337-reviewer-13-4-1-pre-release-steps-2-to-7.md, 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md (step 8)

Fix, one of: the sweep refuses (or skips, and names) a report whose evidence record binds its bytes; or `citation-sweep.test.ts` exempts evidence-bound reports, as the lint already reads them; or the codec gains a supported re-record path for a report whose diff is citation respelling only.

Acceptance: on a fixture review report with a store-prefixed citation and an evidence record, `npm test` in `hooks/` is green without any evidence record being deleted or replaced.

The 13.4.4 pre-delivery review carries 27 store-prefixed citations and turns the citation-sweep gate red
---
The review `261106-0830-reviewer-pre-delivery-pass-over-13-4-4-merge-and-prior-line.md` in the shared review store, committed at `b0010366`, cites 27 records with their store segment in front of the basename. `hooks/lib/__tests__/citation-sweep.test.ts` (`--dry-run over this repository's workbench reports rewrites=0`) fails on it, so `npm test` in `hooks/` is red at HEAD `eab05b13` for every commit until the review is fixed.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** `bin/fusion-citation-sweep --dry-run` at `eab05b13` prints the review's path in the shared review store followed by `rewrites=27`, under `scope=workbench files=1 rewrites=27`; the test's assertion names the same list. The file was not touched by the session that found this (it is unmodified in `git status`), so the gate was already red at `b0010366`.

**Why the sweep is not simply run.** `261028-0645-citation-sweep-rewrites-a-review-report-whose-evidence-binds-its-bytes.md` (open) records that a sweep rewrite of a review report breaks the evidence record that binds the report's bytes. Whether `261106-0830-reviewer-pre-delivery-pass-over-13-4-4-merge-and-prior-line.md` has an evidence record beside it decides the route: with none, the sweep's rewrite is the fix; with one, the fix is whatever that issue's resolution prescribes (a corrected version beside the report, or a re-bound evidence record), never a byte change under the bound revision.

**Acceptance.** `bin/fusion-citation-sweep --dry-run` reports `rewrites=0` for the workbench scope, `citation-sweep.test.ts` passes, and any evidence record binding the review still resolves against the bytes it names.

**Cross-references:** `261028-0645-citation-sweep-rewrites-a-review-report-whose-evidence-binds-its-bytes.md`

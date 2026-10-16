/fusion:migrate: the branch that withholds the hand deletion when the proposal is missing or at other bytes has no test and no doc line
---
`landedWay` in `hooks/migrate.ts` names the hand deletion of `.json-state/maintenance.json` only if the proposal reads at `s.proposal.sha256`. Otherwise it says "the proposal … is missing or at other bytes … no hand deletion is named". This is one of the guard's two safety branches. No test pins it. The three surfaces that describe the deletion list three conditions and leave this one out.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261016-2123-reviewer-closing-pass-over-the-migrate-rollback-cut-then-reset-package.md`, `261016-1958-is-a-rollback-fence-ended-when-the-rollback-landed-chunks-and-a-git-reset-then-took-the-tree-back-to-markdown.md`

**Evidence.**
- Tests. The extended case in `hooks/lib/__tests__/migrate.test.ts` ("cell A reset with git and cell C with a fence of another id") pins K=0, which names the deletion, and K=1, which does not (it writes `{}` at one control path). It never removes the proposal or changes its bytes. If the `sha(raw) !== s.proposal.sha256` check were deleted, no test would go red for the other-bytes case.
- Reviewer probe at `74992939`. The branch does behave correctly. With the proposal removed, and again with one byte appended, `rollback`, `resume`, `run`, `set-aside --consent` and `rollback --end-fence` each exited 5 without naming the deletion, and the fence stayed byte-identical. A record set aside under 13.1.4 (`run`, in `preconditions`) did the same.
- Docs. `bin/fusion-migrate`'s header (the `rollback` entry), the `migrate.ts` row in `README-hooks.md` `## Files`, and `docs/upgrading-to-v13.md` `**Undo.**` each say the deletion is named once `status` shows `record=stale`, `journal/` is empty and no control path stands. None says that no deletion is named when the proposal cannot be verified. A reader working from the docs alone has no stated way to tell "none stands" when the list of paths is not trustworthy.

**Scope.** `hooks/lib/__tests__/migrate.test.ts`, `bin/fusion-migrate` (header), `README-hooks.md`, `docs/upgrading-to-v13.md`. No code change.

**Acceptance.** The extended case gains one row. One byte is appended to the proposal at `s.proposal.path`. `set-aside --consent` then exits 5, its stderr contains "missing or at other bytes" and not "maintenance.json` by hand", and `maintenance.json` stays byte-identical. The byte is then removed. Each of the three doc surfaces carries one clause saying that no deletion is named when the proposal is missing or at other bytes. The growth bounds stay green.

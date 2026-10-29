# Which ignore file takes the `.claude/settings.local.json` line when `grant` runs in a linked worktree?

---
**Domain:** code
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261027-2252-plan-intermediate-files-in-project-tmp.md (open question 4, still unticked), 261028-0708-perfect-location-for-fusion-intermediate-files.md (C15, C16)

---

## Question

The plan left open question 4 for a ruling at approval, and none is recorded. The code shipped the plan's recommendation: from a worktree, `bin/fusion-tmp:227-229` appends to `<main>/.gitignore`, a tracked file in another checkout's working tree, and `hooks/lib/__tests__/fusion-tmp.test.ts:169` pins that. The release should carry a ruling, not a default.

## Options

1. **The main checkout's `.gitignore`** (as shipped). Pros: briefed; visible in a diff. Cons: leaves an uncommitted change in another checkout's tree.
2. **`$(git rev-parse --git-common-dir)/info/exclude`**. Pros: shared by all checkouts, never committed, touches no working tree. Cons: invisible to a teammate's clone; one branch of `grant` changes.

## Constraints

`grant` never removes an entry and never edits a tracked settings file (C15).

## Recommendation

None from the reviewer: both satisfy C15. The user rules.

---
Answered: 261028-2204-which-gitignore-takes-the-settings-line-when-grant-runs-in-a-worktree.md (this record) — the main checkout's tracked .gitignore takes the settings line, as implemented; ruled by user, Kai Stalmann <ks@qantr.com>

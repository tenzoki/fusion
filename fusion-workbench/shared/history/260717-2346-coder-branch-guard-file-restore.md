# Coder session — branch-guard false-positive fix (facet 2 of 260717-1938)

**Status:** Complete

## Task
Fix the verified false positive where the git branch-switch guard blocks
`git checkout <file>` (a legitimate file restore) because the classifier could
not distinguish a branch target from a file target in the `--`-less form.
Facet 2 only. Facets 1 (harness) and 3 (heredoc/prose string matching, issue
260716-2005) explicitly out of scope.

## Design chosen
Recommended filesystem + git-ref-aware allow for the ambiguous bare
`git checkout <target>` form. Introduced an injected `CheckoutResolver`
interface (`pathExists`, `isRef`) so the classifier module stays pure and
unit-testable; the real implementation (`existsSync` + `git rev-parse --verify
--quiet`) lives at the hook boundary in `guard.ts`. Allow the bare form only
when every positional exists on disk AND none is a valid ref; otherwise deny
(fail-closed). `-C <dir>` global options are threaded to the resolver as cwd
hints; `--git-dir`/`--work-tree` globals force a conservative deny.

## Safety justification
- A real branch is a valid ref → `isRef` true → deny. So every genuine branch
  switch fails closed.
- A branch that shares a name with a file is still a ref → deny (matches git's
  own ref-first resolution). No bypass.
- `git switch`, `git checkout -b/-B/--orphan/--detach/-`, `git worktree add`
  stay unconditionally denied (untouched paths).
- No resolver / unresolvable global → deny. The pure module never allows the
  ambiguous form on its own.
- Shelling to `git rev-parse` runs only on the ambiguous checkout form (rare),
  once per positional; non-repo/error → treated as not-a-ref (and a checkout in
  a non-repo cannot move HEAD, so allowing a file-looking restore there is
  harmless).

## Files changed
- `hooks/lib/git-branch-guard.ts` — `CheckoutResolver` interface, reworked
  `classifySegment`/`classifyCheckout`, cwd-hint capture, `SegmentDeny` reason
  plumbing, restore-hint message, `classifyGitCommand` 3rd optional param.
- `hooks/guard.ts` — real `checkoutResolver` (fs + `git rev-parse`), effective
  cwd from `-C` hints, passed into `classifyGitCommand`.
- `hooks/lib/__tests__/git-branch-guard.test.ts` — new describe block (mock
  resolver) covering the full matrix; suite now 63 tests.
- `rules/git-branch-discipline.md` — policy text updated to the new allow rule.
- Rebuilt `hooks/dist/` (`npm run build`).

## Verification
- `npm test` → 211 passed (10 files); git-branch-guard suite 63 tests.
- `npm run build` ran clean (tsc, no type errors).
- Re-piped through compiled `hooks/dist/guard.js`:
  - `git checkout agents/coder.md` → ALLOW (was BLOCK — the bug)
  - `git checkout HEAD -- agents/coder.md` → ALLOW
  - `git restore agents/coder.md` → ALLOW
  - `git switch some-branch` → BLOCK
  - `git checkout -b newbranch` → BLOCK
  - `git checkout feature/plane` (real branch) → BLOCK
  - `git checkout nonexistent-file-xyz.md` → BLOCK (conservative)
  - `git checkout -- agents/coder.md` → ALLOW
  - `git worktree add ../wt feature` → BLOCK
  - Block reason for ambiguous form now names `git restore <file>` /
    `git checkout -- <file>`.

## Not touched
Facet 3 (segmentation/string matching in heredocs and prose) — segmentation
logic (`extractCommandSegments`) is unchanged; this fix stays inside the
checkout-args classifier and does not touch that surface.

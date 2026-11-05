Two codec tests on a dangling link in a removal entry fail at HEAD
---
`cd codec && npm test` fails two tests on an unchanged `codec/`: one in `kernel.test.ts` and one in `migration.test.ts`. Both concern a removal entry meeting a dangling link. Found while verifying step 4 of `261027-2242-intermediate-files-in-project-tmp`, which does not touch `codec/`.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Severity:** Medium
**Cross-references:** 261027-2242-intermediate-files-in-project-tmp.md

## Defect

`git status --short codec/` was empty, so `codec/` equals HEAD `311b9b97`. On that tree, macOS 15.8.1 with Node 24.2.0 and a scratch `HOME`:

```
cd codec && npx vitest run src/__tests__/kernel.test.ts src/__tests__/migration.test.ts
 FAIL  src/__tests__/kernel.test.ts > a removal entry: after null, a migration rollback's only > reads its state by lstat: the regular file at before is pre, absence post, a dangling link, a directory or other bytes diverged
 FAIL  src/__tests__/migration.test.ts > migration rollback > a removal entry meeting a dangling link where its file stood is diverged: recovery is blocked and the link stays
 Tests  2 failed | 160 passed (162)
```

The step-4 executor reported the kernel case failing with `EEXIST` on a symlink and the migration case with `recovery-blocked`. It also saw the kernel failure in a scratch clone checked out at `311b9b97`.

Two further `migration.test.ts` cases ("5 s allowance") failed only while the hooks suite ran alongside, and passed when run alone. That is load-dependent timing, not this defect.

Not yet established: whether these failed at the 13.3.9 release, or depend on this machine (filesystem, Node version).

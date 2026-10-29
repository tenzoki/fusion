fusion-tmp.test.ts fails in a session started with the launcher, because its fixtures assume os.tmpdir() lies under a system temp prefix
---
Under 13.4.0 the launcher exports `TMPDIR=~/.fusion-tmp/<id>/` in this repository. With that `TMPDIR`, two cases of `hooks/lib/__tests__/fusion-tmp.test.ts` fail. One of them was added in `70414a29`.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261028-2204-grant-writes-the-deny-when-home-itself-lies-under-a-system-temp-prefix.md, 261029-0647-reviewer-intermediate-files-fix-followup.md

Evidence: `project()` (line 56) and `home()` (line 67) build under `tmpdir()`. The test header (lines 16-20) assumes such fixtures lie under a system temp prefix. Run with `TMPDIR=/Users/k1/.fusion-tmp/<id>/review-tmpdir/ npx vitest run lib/__tests__/fusion-tmp.test.ts`, at `70414a29`: 2 failed, 15 passed. With the default `TMPDIR` the same file passes 17 of 17.
- "grants into an absent file and adds the ignore line once" expects `deny: "skipped-under-temp"` (line 147). This case was added before this range.
- "skips them when ~/.fusion-tmp/<id> lies under a system temp prefix" (line 240) got `deny=missing` where it expects `skipped-home-under-temp`. Added in `70414a29`.

`temp-paths.test.ts` "spares a root and a HOME that themselves lie under /var/folders" (line 49) still passes under that `TMPDIR`, but it no longer tests what its name says.

Acceptance: the fixtures that need to be under a temp prefix are built under one explicitly (for example, `realpathSync("/tmp")` joined with a fresh `mkdtemp`), not under `tmpdir()`. The two files pass under the default `TMPDIR` and under `TMPDIR=$HOME/.fusion-tmp/<id>/`.

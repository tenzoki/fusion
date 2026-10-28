The permissions selector writes .claude/settings.local.json at pwd while its own step 4 (fusion-tmp grant) writes the main checkout's file
---
`skills/check/SKILL.md:197` merges `defaultMode` and `allow` into the file at `pwd`, `:198` then runs `fusion-tmp grant`, which in a linked worktree writes `<main>/.claude/settings.local.json` (`bin/fusion-tmp:153-163`, C16), and `:201` still says "**Never** write this file outside `pwd`". One selector now has two writers of one file kind with two target rules and a sentence that contradicts the second. In a worktree the `bypassPermissions` half lands in a file C16 measured Claude Code does not read from a worktree subdirectory.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261028-0708-perfect-location-for-fusion-intermediate-files.md

Acceptance: the selector resolves its target once, from `grant`'s `settings=` line (or the `defaultMode`/`allow` merge moves into the helper), `:201` is rewritten to match, and a worktree case shows both halves in the same file.

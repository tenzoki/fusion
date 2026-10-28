Two comments still describe the commit-message path as it was before 13.4.0
---
`hooks/lib/staging-drift.ts:14` says the message "was written there instead of under `/tmp`". `hooks/lib/__tests__/commit-message-path.test.ts:249-250` says "/fusion:cleanup defers to it, so pinning it here covers both", but `skills/cleanup/SKILL.md:59` spells its own `~/.fusion-tmp/<checkout-id>/fusion-commit-msg-<session-id>-<n>.txt` and no case pins it.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

Acceptance: the staging-drift line names the prescribed directory; the test either pins the cleanup path (prefix and `<session-id>`) or its comment stops claiming coverage.

fusion-tmp drops the reason fusion-identity gave for printing no CHECKOUT=, and the launcher then exports nothing without a word
---
`bin/fusion-tmp` lets only the mint notice through from `fusion-identity`'s stderr, even when no `CHECKOUT=` came back. The launcher shows only `fusion-identity:` lines, so even fusion-tmp's own `die` line is dropped. The session then starts on the system temp root with no message.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261028-2204-fusion-tmp-and-the-launcher-swallow-the-checkout-id-mint-notice.md, 261029-0647-reviewer-intermediate-files-fix-followup.md

Evidence: the `grep -E '^fusion-identity: (minted |this workbench already)'` filter (`bin/fusion-tmp:132`) drops every reason `bin/fusion-identity` prints for an empty checkout half:
- git unset, or `user.name`/`user.email` unset (`bin/fusion-identity:201-202`, `:214-215`);
- `.checkout-id` invalid or unreadable (`:268-272`);
- workbench unwritable (`:274`).

`die 1` then says only "fusion-identity printed no CHECKOUT=" (`bin/fusion-tmp:133`). The launcher filter `grep '^fusion-identity: '` (`install.sh:171`) also drops that `fusion-tmp:` line, and it treats an exit 1 inside a set-up project the same as being outside a project. The result is a `fusion` start with no export: the scratchpad lands where the deny entries refuse it, and nothing explains why. `rules/fusion-workbench-conventions.md` `## Filename Patterns` says this helper's stderr "is not discarded, because the reason for a half it could not read is worth more to a human than its absence".

Acceptance: when `id` comes back empty, `bin/fusion-tmp` passes all of `fusion-identity`'s stderr through before it dies. The launcher passes `fusion-tmp:` lines too, except the one meaning "no fusion workbench above". A test covers a git repository with no `user.email`, for both `fusion-tmp path` and the launcher.

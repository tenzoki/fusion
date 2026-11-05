fusion-tmp and the launcher discard the checkout-id mint notice, so a re-mint after git clean -xdf is silent again
---
`bin/fusion-tmp:117` calls `fusion-identity 2>/dev/null`, and the launcher calls `fusion-tmp path 2>/dev/null` (`install.sh:169`). The launcher is now the first reader of `.checkout-id` in every launcher-started session, so after `git clean -xdf` it mints the new id and the notice `announce_mint` prints (`bin/fusion-identity:227-233`) goes nowhere; every later reader finds the file and stays silent. That reopens what issue `260904-1058_*_git-clean-deletes-the-checkout-identifier-and-the-next-read-mints-a-new-one-in-silence.md` fixed, and the plan's Risks row "A re-minted checkout id strands earlier files" relies on that notice.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261027-2252-plan-intermediate-files-in-project-tmp.md

Acceptance: a launcher start in a set-up project whose `.checkout-id` was removed shows the `fusion-identity: minted …` lines on the terminal (or the SessionStart envelope names the mint), while a start outside a project still prints nothing. Covered by a case in `codec/src/__tests__/install.test.ts` under a scratch HOME.

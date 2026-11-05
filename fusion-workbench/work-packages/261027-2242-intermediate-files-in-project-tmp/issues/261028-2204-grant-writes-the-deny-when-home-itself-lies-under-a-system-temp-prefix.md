grant writes the deny entries when $HOME/.fusion-tmp itself lies under a system temp prefix, denying fusion's own commit-message path
---
`bin/fusion-tmp` `under_temp` (lines 182-189) tests only `pwd -P`. When `$HOME` is under `/tmp` or `/var/folders` (containers and CI images with `HOME=/tmp` are common), the deny `Edit(//tmp/**)` covers `~/.fusion-tmp/<id>`; deny wins over allow in Claude Code, so the orchestrator's commit-message `Write` and the launcher-relocated scratchpad are both refused.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261027-2252-plan-intermediate-files-in-project-tmp.md

Evidence: `bin/fusion-tmp:182-189` (`under_temp` reads `pwd -P` only), `bin/fusion-tmp:214-219` (deny decision). `hooks/lib/__tests__/fusion-tmp.test.ts:197-209` asserts `deny=written` with `h = home()`, and `home()` (line 65) is `mk(tmpdir(), …)`, i.e. under `/var/folders` on macOS: the suite pins the self-denying configuration as correct.

Acceptance: `grant` skips the deny (a new `deny=skipped-home-under-temp`, or the existing `skipped-under-temp`) when `realpath($HOME/.fusion-tmp)` lies under any of the four prefixes, `check` reports the same, the header names the branch, and `fusion-tmp.test.ts` covers it (HOME under tmpdir gives no deny; the existing deny cases move to a HOME outside every prefix).

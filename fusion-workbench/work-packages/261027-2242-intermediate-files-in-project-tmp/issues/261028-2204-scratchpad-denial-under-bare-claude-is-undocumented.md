The deny entries make the scratchpad unwritable in every session started without the launcher, and no shipped text says so
---
Setup Step 0t runs `fusion-tmp grant` unconditionally, which writes the four `Edit(//…/**)` deny entries in any project without a sandbox. A session started with bare `claude`, or on the marketplace path (which has no launcher), keeps its scratchpad under `/private/tmp`, and step 1 (e) measured that a `Write` there then fails. The plan accepted this (Risks row "Denied scratchpad", open question 1), but no user-facing surface states it.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261027-2252-plan-intermediate-files-in-project-tmp.md, 261027-2320-step-1-measurements-temp-root-hooks-sandbox-deny-sockets.md

Evidence:
- `docs/upgrading-to-v13.md:300`: "Sessions without the launcher keep their scratchpad and `TMPDIR` in the system directories." True, but it omits that writes there are now denied.
- `bin/fusion-tmp:53-69` (deny section) names the sandbox case only.
- `README.md` launcher paragraph (the marketplace exports) and `skills/check/SKILL.md:172` (the permissions question) are silent on it.
- `hooks/lib/temp-paths.ts:269` `tempRootLine` says temp files "go where a reboot empties them", not that Write is refused.

Acceptance: the 13.4.0 note, the `bin/fusion-tmp` deny section and the README marketplace paragraph each state, once, that without the launcher (or the two exports) and without a sandbox, Claude's `Write`/`Edit` into its own scratchpad are denied. `reference-resolution-lint` and the growth bounds stay green.

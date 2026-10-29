The deny entries reach Bash commands that name a system temp path, which the 13.4.0 texts say they do not
---
Three shipped sentences say the four `Edit(//…)` deny entries stop `Write` and `Edit` and "not shell redirects". In a session of this repository without the launcher, Bash commands naming a path under `/private/tmp` or `/var/folders` were refused.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261028-2204-permissions-question-and-launcher-docs-claim-more-than-the-code-does.md, 261029-0647-reviewer-intermediate-files-fix-followup.md

Evidence. Observed 2026-10-29, Claude Code 2.1.312, a reviewer subagent under auto mode, cwd this repository, whose `.claude/settings.local.json` carries the four deny entries. The session's scratchpad was under `/private/tmp/claude-502/…` and `TMPDIR` was `/var/folders/…/T/`.
- `rm -rf <scratchpad>/p1`: "was blocked by a deny rule".
- `mkdir -p <scratchpad>/p1`, `echo x > <scratchpad>/p1/f` and `touch /var/folders/…/T/<probe>`: each "has been denied". Whether the deny rule or the auto-mode classifier refused these three was not established.

The texts that say otherwise:
- `skills/check/SKILL.md` `## permissions`, §1 question: "denied its `Write` and `Edit`, not shell redirects".
- `docs/upgrading-to-v13.md`, 13.4.0 "What stays unenforced", **Programs.**: "the deny entries stop Claude's `Write` and `Edit`, not a shell redirect".
- `bin/fusion-tmp` header, the scratchpad paragraph: it names only `Write` and `Edit`.

The claim rests on the package narrative (`261027-2242-intermediate-files-in-project-tmp.md`, line 13): there, an `Edit` deny on `/tmp/…` "did **not** stop `echo hi > /tmp/…`" under `bypassPermissions` or `--dangerously-skip-permissions`. That same line notes that the documentation says redirection targets are covered. No other mode was measured.

Acceptance: measure a Bash redirect, `mkdir` and `rm` into `/private/tmp` with only the deny entries present, in `default` and in `acceptEdits` mode. Then the three texts state what was measured, per mode, and drop "not shell redirects" wherever it does not hold. The `bin/fusion-tmp` header records the measurement beside the existing one.

The permissions question recommends bypassPermissions and says Bash file commands are denied "by mode", without saying that this mode is the one where a redirect got through
---
`skills/check/SKILL.md` `## permissions` §1 asks the user to set `defaultMode: "bypassPermissions"`. In the same sentence it says the deny entries cover "by mode, Bash file commands". The only recorded measurement in that mode shows a Bash redirect passing an `Edit` deny. `README.md` and `docs/upgrading-to-v13.md` say `bypassPermissions` "was not measured", so they leave that recorded result out.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261029-0647-the-deny-entries-reach-bash-path-checks-that-the-docs-say-they-do-not.md, 261029-1255-reviewer-intermediate-files-closing-pre-tag.md

Evidence (at `928d3ac7`):
- `skills/check/SKILL.md` `## permissions`, §1 question: "That setting is `bypassPermissions` … denied its `Write`, `Edit` and, by mode, Bash file commands, in system temp directories". The answer "Yes, write it" is the default and puts the project into exactly that mode.
- Package narrative `261027-2242-intermediate-files-in-project-tmp.md`, `## Measured before filing`, third bullet: under `bypassPermissions` and `--dangerously-skip-permissions`, "An `Edit` deny on `/tmp/…` did **not** stop `echo hi > /tmp/…` in Bash".
- `bin/fusion-tmp` header, `# The deny entries`, the Bash table's last paragraph, states this correctly: "`bypassPermissions` was not measured here; the package narrative … observed a redirect pass an `Edit` deny under it."
- `README.md`, the `fusion` launcher section: "bypassPermissions was not measured". `docs/upgrading-to-v13.md`, 13.4.0 section, **Programs.**: "`bypassPermissions` was not measured that way." Neither mentions the recorded redirect, nor the launcher's `--yolo` (`--dangerously-skip-permissions`).
- `docs/upgrading-to-v13.md`, the same list, **Sessions without the launcher**, still names only "`Write` and `Edit`" for the scratchpad. `README.md` and the `bin/fusion-tmp` header now add Bash's file commands.

Acceptance: the four surfaces say the same thing about `bypassPermissions` and `--dangerously-skip-permissions`: `Write` and `Edit` are denied, a Bash redirect was observed passing, and the other Bash commands were not measured. The §1 question names the mode in which the Bash deny holds, or says it does not hold under the setting it proposes. The scratchpad bullet in the upgrade note matches `README.md`. The skills bound holds with no head-room raise.

The permissions question and the launcher bullet claim more than the code does
---
Two statements overclaim. (1) `skills/check/SKILL.md:172` asks the user to consent to Claude being "granted its intermediate-file directory and, without a sandbox, kept out of the system temp directories". Setup Step 0t (`skills/setup/SKILL.md:97-103`) already wrote both without asking, so "No" withholds neither; and the deny stops `Write`/`Edit` only, not a Bash redirect (step 1, and `docs/upgrading-to-v13.md:295-297` says so correctly). (2) `README-agents.md:364` says the launcher makes "every child's `tempfile` survive a reboot"; under the sandbox Bash's `TMPDIR` is `/tmp/claude-<uid>` whatever was exported (step 1 (c)).
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

Acceptance: the question says the grants and deny already exist from setup (or setup stops writing them and the question governs them), and says "`Write` and `Edit` are denied" instead of "kept out"; the README-agents bullet names the sandbox exception or points to the 13.4.0 note's list.

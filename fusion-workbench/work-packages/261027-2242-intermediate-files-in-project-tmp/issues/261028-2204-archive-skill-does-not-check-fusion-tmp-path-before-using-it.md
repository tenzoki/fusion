The archive skill builds its survey path from an unchecked fusion-tmp path, so a failed call writes at / and Step 7 silently moves nothing
---
`skills/archive/SKILL.md:247` and `:262` set `C="$("$FUSION_PLUGIN_ROOT/bin/fusion-tmp" path)/fusion-archive-$STAMP-$SLUG"`. `fusion-tmp` exits 1 with empty stdout when `fusion-identity` prints no `CHECKOUT=`, which it does whenever git's `user.name`/`user.email` is unset or git is not on PATH (`bin/fusion-identity:198-216`). `C` is then `/fusion-archive-…`: `: > "$C.candidates"` fails at the filesystem root, and Step 7's `grep -q '^candidate=' "$C.survey" 2>/dev/null` is false, so the container move is skipped without a line saying why.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

The same unchecked shape is prescribed in prose for the commit-message directory (`agents/orchestrator.md:271`, `skills/cleanup/SKILL.md:59`, `skills/commit/SKILL.md:84`): none says what to do when `path` fails.

Acceptance: both archive blocks stop with a named line (e.g. `fusion-tmp=failed exit=<n>`) when `path` exits non-zero or prints nothing, and Step 7 reports a missing survey file rather than skipping silently; the three commit-message texts say, in one clause, to stop and report on a failed `path`. The skills growth bound stays green.

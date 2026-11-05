Deny entries that are already present are reported as skipped-under-temp or skipped-home-under-temp, hiding that they deny
---
In `bin/fusion-tmp` `evaluate`, both temp-prefix branches are tested before `deny_missing`. Entries already in the file, which deny `~/.fusion-tmp/<id>` or the project, are therefore reported as "skipped". The sandbox branch tells the two cases apart (`present-under-sandbox`). The two temp branches do not.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261028-2204-grant-writes-the-deny-when-home-itself-lies-under-a-system-temp-prefix.md, 261029-0647-reviewer-intermediate-files-fix-followup.md

Evidence: `bin/fusion-tmp:232-237`. `elif under_temp "$(pwd)"` and `elif under_temp "$dir"` come before `elif [ "$deny_missing" = 0 ]`. A file written by a 13.4.0 pre-release `grant` with `HOME` under `/tmp` (the A2 case before `70414a29`) keeps the four entries. `check` and `grant` then print `deny=skipped-home-under-temp`. `skills/check/SKILL.md` `## tmp` reads that value as "`~/.fusion-tmp` is under a system temp prefix the deny would cover" and offers no removal.

Acceptance: when `deny_missing` is below 4 in either temp branch, the result is a distinct value, such as `present-under-temp`. The `bin/fusion-tmp` header and the check skill's `tmp` text name it as "removed by hand", like `present-under-sandbox`. A test pins it.

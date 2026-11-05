grant's evaluate runs with set -e off, so a failed .gitignore append is reported as ignored=added
---
`bin/fusion-tmp:256` and `:278` call `evaluate … || rc=$?`; bash disables `set -e` for the whole function body in that context. `append_line` (`:176-180`, called at `:228`) can then fail (read-only or foreign-owned `.gitignore`) and `:229` still sets `ignored=added`, which Setup and the check report as done.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

Acceptance: `append_line`'s failure is checked explicitly and reported (`ignored=append-failed`, non-zero exit or a stderr line), with a test using a read-only `.gitignore`.

Setup Step 0j misses a class L entry that is untracked but not ignored
---
`skills/setup/SKILL.md` Step 0j reports a class L entry only when `git ls-files --error-unmatch` says it is tracked. An entry that is neither tracked nor ignored passes silently and shows up as `??` in every `git status`, where the next `git add` of a directory or a `-A` would commit it.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Evidence: session 260828-0846 in this repository. `fusion-workbench/.cadence-anchors` (class L per `rules/workbench-tracking.md` `## The four classes`, added v10.8.1) was untracked and not ignored; Step 0j printed nothing. The `.gitignore` had no line for it because the helper landed after the ignore list was written. Repaired by hand in that session (`.gitignore`, `fusion-workbench/.cadence-anchors`).

Acceptance: for a tracked workbench, Step 0j's class L loop also runs `git check-ignore -q` on each entry and reports one that is untracked and not ignored (report, per decision `260825-1030`; whether it repairs by appending the exclusion is that decision's call). A test or the setup skill's own probe over a scratch root with an unignored `.cadence-anchors` produces the report line.

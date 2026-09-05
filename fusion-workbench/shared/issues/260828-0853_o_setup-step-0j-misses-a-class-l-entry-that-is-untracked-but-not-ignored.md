Setup Step 0j misses a class L entry that is untracked but not ignored
---
`skills/setup/SKILL.md` Step 0j reports a class L entry only when `git ls-files --error-unmatch` says it is tracked. An entry that is neither tracked nor ignored passes silently and shows up as `??` in every `git status`, where the next `git add` of a directory or a `-A` would commit it.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

Evidence: session 260828-0846-orchestrator-session.md in this repository. `fusion-workbench/.cadence-anchors` (class L per `rules/workbench-tracking.md` `## The four classes`, added v10.8.1) was untracked and not ignored; Step 0j printed nothing. The `.gitignore` had no line for it because the helper landed after the ignore list was written. Repaired by hand in that session (`.gitignore`, `fusion-workbench/.cadence-anchors`).

Acceptance: for a tracked workbench, Step 0j's class L loop also runs `git check-ignore -q` on each entry and reports one that is untracked and not ignored (report, per decision `260825-1030`; whether it repairs by appending the exclusion is that decision's call). A test or the setup skill's own probe over a scratch root with an unignored `.cadence-anchors` produces the report line.

---
Reconciled 260828-0907 (session 260828-0846-orchestrator-session.md, HEAD ffc6ae88): still open. `skills/setup/SKILL.md:378` reports a class L entry only on `git ls-files --error-unmatch`; no `git check-ignore` runs over an untracked entry. The instance itself is repaired: `.gitignore:91` excludes `fusion-workbench/.cadence-anchors` (commit `19b58eef`), `git check-ignore -v` confirms. Stays `_o_` until Step 0j carries the check.

---
Reconciled 260905-2015 (reconciler, HEAD `5b84b13a`): still open, unmoved since the 260828-0907 pass.

`skills/setup/SKILL.md` Step 0j's class L loop still reads `git ls-files --error-unmatch` alone and
reports only a **tracked** entry; no `git check-ignore` runs over one that is neither tracked nor
ignored. The step's other two loops do call `git check-ignore -q`, so the helper the acceptance asks
for is already in the block — it is the class L loop that does not use it.

The roster the loop walks has grown since the record was filed and now names `.cadence-anchors`
alongside the eight it had, so the instance that produced this record would be covered were it
tracked. It still would not be covered untracked, which is the defect.

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

---
Resolved: ea819262 — Step 0j class L loop is an if/elif over the same roster and reports the entry that is neither tracked nor ignored. The existence test in front of the ignore check is load-bearing: check-ignore answers for a path that does not exist, so without it a fresh workbench would report its own lock and marker directories as departures. Run verbatim over five scratch roots covering the record instance, an ignored entry, a tracked one, an unignored directory and a conformant root. Reports and does not repair, per the decision the record cites; the checkout identifier stays the one repaired entry.

---
Reconciled 260905-2234 (reconciler, HEAD `4db7dddb`): the acceptance is met and the marker stays
`_c_`. Two corrections to the closure note, neither reopening it.

**The five scratch roots were re-run verbatim and all five behave as the note says**: an unignored
existing entry reports, an ignored one is silent, a tracked one takes the first branch, a directory
with no ignore rule reports, a conformant root is silent. The counterfactual confirms the existence
test is load-bearing, and is larger than the note states: without `[ -e ]` a fresh workbench reports
**all nine** roster entries, not "its own lock and marker directories" — and `.session-marker`,
`agentstate.yaml`, `orchestrator-live.md` and `portfolio.md` are files, not directories.

**The fifth root did not cover the ignore form this project mandates for the two directory entries.**
It tested a directory with no ignore rule at all. Under `dir/*`, which `CLAUDE.md` requires and
`.gitignore:95-96` applies to `.guard-state` and `.commit-lock`, `check-ignore` exits 1 on the
directory path while every file inside is covered, so the branch reports a departure that
`git status --untracked-files=all` does not see and that no `git add` would commit. Run verbatim in
this repository, the loop prints one such line for `.guard-state` today. Filed separately as
`260905-2234_*_step-0js-new-unignored-branch-fires-on-a-directory-whose-contents-are-ignored-by-the-dir-star-form.md`,
because this record's acceptance names `.cadence-anchors`, a file, and that case is repaired.

---
Revised by: `260905-2310-coder-step-0js-class-l-branch-asks-git-what-it-would-pick-up.md` — the Resolved: note above is wrong in both of its claims about the branch it accepted. The existence test it calls load-bearing is gone, because the branch no longer asks `git check-ignore` about the entry's own path; it asks `git ls-files --others --exclude-standard`, which is the question the report already claimed to be asking and which reaches an entry's contents, where the mandated `dir/*` form lives. A question that answers for a non-existent path needed the guard; one that lists nothing for it does not. And the counterfactual was miscounted: without the guard the old branch reported all nine roster entries, seven of them files, not the two directories the note names. The acceptance this record states is met more fully than before and the record stays `_c_`; the faulty intermediate branch was filed and repaired as `260905-2234_*_step-0js-new-unignored-branch-fires-on-a-directory-whose-contents-are-ignored-by-the-dir-star-form.md`.

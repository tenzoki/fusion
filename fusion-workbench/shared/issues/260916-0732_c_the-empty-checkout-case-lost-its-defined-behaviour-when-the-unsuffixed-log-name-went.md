The empty-checkout case lost its defined behaviour when the unsuffixed log name went

---
The retired activity-log body answered what happens when `bin/fusion-identity` prints no `CHECKOUT=` line: the log is written as `activity-log.md`. That sentence was cut from the body with the body and from the conventions with the no-workbench mode, and nothing took its place. The conventions now assert a universal the helper's own exit codes falsify, and the merged `/fusion:cadence` writes two files named off an empty string.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260915-2309_*_merge-log-activity-into-cadence.md

**Evidence.**

- `git show v11.3.0:skills/log-activity/SKILL.md`, step 1: *"The activity log file is `activity-log-$CO.md` in the project root, and `activity-log.md` when `$CO` is empty."*
- `skills/cadence/SKILL.md:41` is the whole of what replaced it: *"`$CO` is that run's `CHECKOUT=`, never `$USER`; both files are keyed by it."* No empty case. `:43` handles the *other* helper's miss branch (`$CO_LABEL` falls back to the hex `$CO`) and says nothing about `$CO` itself being absent.
- `rules/fusion-workbench-conventions.md:292` now reads: *"No line means no value, and the resolver never substitutes one. No writer ever falls back to an unkeyed name: `/fusion:memo` and `/fusion:cadence` both halt when there is no workbench above the working directory, and cadence writes the activity log, so all four logs are keyed or not written."* The conclusion does not follow from the premise: no-workbench and no-`CHECKOUT=` are different conditions.
- `bin/fusion-identity`'s own header, `# Exit codes`: **exit 3** — *"the checkout identifier could not be resolved. `PERSON=` is printed, `CHECKOUT=` is not. The caller carries on."* **exit 5** — *"3 and 4 together: neither line is printed. The caller carries on."* Both are non-halting by design, and neither implies the absence of a workbench. The `[ -x "$I" ]` miss branch at `skills/cadence/SKILL.md:36` is a third route, and `CLAUDE.md`'s release-process section documents it as a real one-release-behind case.

Under any of the three, `skills/cadence/SKILL.md:60`, `:105` and `:205` interpolate an empty `$CO`: the step-2 grep reads `activity-log-.md`, step 5 writes `activity-log-.md` at the project root, and step 9 writes `cadence-.md` into `$OUT_MEMO`. Nothing reports it; the run looks normal.

The same gap exists for `/fusion:memo` (`skills/memo/SKILL.md:33-34`, `:37`) and predates this change — but the conventions sentence that now covers all four logs was, before this commit, scoped to the activity log alone, so the false universal is new.

**Acceptance.** Every writer of a checkout-keyed file has one stated behaviour when `bin/fusion-identity` prints no `CHECKOUT=` line, and `rules/fusion-workbench-conventions.md` `## Filename Patterns` states it once rather than asserting that the case cannot arise. Whether that behaviour is a halt, a named fallback, or a reported degradation is the decision to take; the requirement is that it is written down and that `skills/cadence/SKILL.md` step 1 carries it.

---
Resolved: the behaviour taken is **halt and report**, and it is now written in both places the record required. `rules/fusion-workbench-conventions.md` `## Filename Patterns` replaces the false universal with a stated rule for all four logs: a writer of a checkout-keyed file halts and reports when no `CHECKOUT=` line is printed, because an empty key writes `-.md`, the one name every checkout would share; `bin/fusion-identity` exit 3, exit 5 and a missing helper are each named as that case and none of them as an absent workbench. The no-workbench halt is kept as a separate clause rather than being the premise of the conclusion. `skills/cadence/SKILL.md` step 1 carries it as its own bullet, naming all three routes and both filenames the empty key would produce. **Why halt rather than a fallback or a degraded run:** the helper's own header makes exit 3 and exit 5 non-halting *for the helper*, leaving the choice to the caller, and both of cadence's outputs are keyed, so there is nothing it can honestly write; a named unkeyed fallback is what the same paragraph already forbids, and it reintroduces the collision the key exists to prevent. `/fusion:memo` is covered by the conventions rule and its body was not edited — that gap predates this release and the rule now reaches it.

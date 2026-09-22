# Where in the cleanup pipeline does the one gate stand?

---
**Domain:** code
**Filed by:** claude-code (UX round, finding 2 of the 260827 UX review), Kai Stalmann <ks@qantr.com>
**Cross-references:** `skills/cleanup/SKILL.md` (the pipeline) · `skills/curate/SKILL.md` (the gate's procedure, unchanged) · `skills/archive/SKILL.md` (its one-stop claim, retargeted)

---

## Question

The pipeline's one gate (the `CLAUDE.md` ledger) stood at Step 5 of 8, and the skill documented the consequence as a warning: a run typed and walked away from stopped there, so the activity log was never regenerated and the housekeeping commits never happened. A wrap-up command that punishes walking away is a wrap-up command used while sitting still.

## Answer (260827, user)

**Last.** The activity-log pass moves to Step 5 and the `CLAUDE.md` reconciliation to Step 6, directly before the housekeeping commits: Steps 1–5 run straight through unattended, the user answers the one ledger question whenever they return, and apply plus Step 7 follow. Selector names (`log-activity`, `claude-md`) and every guardrail are unchanged; `--skip claude-md` still runs gateless end to end. One consequence stated in the skill: the curator's applied edits land after the log was written, entering it on the next run's refresh of its newest day — a day's log is never final until the day is.

---
Retired: commits `115be68d` and `9d5b1e80` — `/fusion:cleanup` is Steps 0 to 4 and commits and pushes only, so the Step 5, Step 6 and Step 7 this answer placed name nothing. The `CLAUDE.md` pass left for `/fusion:curate` and the activity log became the first half of `/fusion:cadence` (`260915-2309_*_does-the-activity-log-keep-its-own-command-or-become-the-first-half-of-cadence.md`), and `--skip claude-md` is now an error rather than a gateless run.

---
Implemented: 81c18caf — the activity-log pass moved to Step 5 and the `CLAUDE.md` ledger to Step 6, last before the housekeeping commits; the `Retired:` line above records the pipeline's later reduction to commit and push, which removed the steps this answer placed.

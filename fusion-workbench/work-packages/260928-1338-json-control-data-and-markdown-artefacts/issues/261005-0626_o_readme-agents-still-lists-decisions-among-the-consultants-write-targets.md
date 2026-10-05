README-agents still lists decisions among the consultant's write targets
---
FJ03d step 6 settled issue 260929-1810 item 4 by making the consultant write no decision record in either mode, so `bin/fusion-paths` no longer emits `OUT_DECISION` to it. The agent roster in `README-agents.md` still says it writes one.
---
**Filed by:** code-implementer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261004-2212_*_plan-fj03d-rules-prompts-and-live-predicates-switched-with-this-workbench-in-one-window.md, 260929-1810_*_the-shipped-prompts-disagree-on-who-moves-which-marker-and-one-names-a-marker-no-vocabulary-has.md

Evidence, on `fj03d` after the step 6 commit: `README-agents.md` line 31, the `consultant` row of the agent table, names `decisions/` among its stores and "issue and decision files" among its outputs. `agents/consultant.md` `## Secondary Mode: Written Reports` now reads "You write no decision record, in either mode", and `## Scope` no longer names `$OUT_DECISION`.

Acceptance: the `consultant` row names `consultations/` and `issues/` only, and "Consultation report + issue files". `README-agents.md` is step 9's file, so step 9 carries the edit. Executor: `code-implementer`.

# Does the plan approval show which steps write `CLAUDE.md`, and from where: the orchestrator's plan summary, a required field in the planner's step template, or both?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261020-0916-plan-steps-write-claude-md-past-every-approval.md, 261020-0835-why-a-consumers-claude-md-grows-unchecked.md, 261020-0925-how-does-the-lean-claude-md-rule-reach-the-agents-that-write-claude-md.md, 261020-0925-is-the-curators-sole-writer-claim-corrected-or-are-executor-edits-to-claude-md-gated.md, 261020-0934-review-of-plan-consumer-claude-md-stays-lean.md, 260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md, 260909-1700_*_does-the-plan-size-ceiling-fail-hard-or-only-report.md

---

## Question

Plan steps produced 48 % of krk's `CLAUDE.md` growth, and every one of them passed the user's plan approval (analysis §3). In krk, 44 of 53 plans named `CLAUDE.md` (analysis §1). The conventions section that D1 adds tells the planner to name why such a step's content binds every session. That changes what the planner should write. It does not change what the user sees at approval. One fact is decidable from the plan text alone: whether a step's `Files:` line names `CLAUDE.md`. The question is whether that fact is shown at the approval, and by which agent. This is a separate decision from D1 because it complements every D1 option rather than replacing one. It is separate from D2 because it holds whichever writer D2 keeps. It binds every later plan in every consuming project, so it is recorded.

A lint is not an option. Tests run only in fusion's own repository and would never see a consumer's plan. A hard stop at approval is not an option either: fusion does not block on chosen thresholds (`260909-1700_*_does-the-plan-size-ceiling-fail-hard-or-only-report.md`).

Byte figures were measured at HEAD `ff93a03d`. Dispatch-path slack: orchestrator 3 719, implementation-planner 821. Step 1 of the plan frees 16 bytes on every path.

## Options

1. **The orchestrator's plan summary names the steps.** `agents/orchestrator.md`, **Plan** step 6 (`APPROVAL: Plan review`), gains one sentence: the summary lists every step whose `Files:` names `CLAUDE.md`, or says there is none.
   - Pros: the orchestrator reads every plan it puts to approval, so the fact reaches the user at the exact moment the 48 % passed. The orchestrator computes the fact from the plan file. About +100 bytes on `agents/` and on the orchestrator path, which has the most slack.
   - Cons: a plan made by a top-level planner run, with no orchestrator, shows nothing extra. The summary lists the steps but carries no reason, so the user still has to open each step to judge it.
2. **A required field in the planner's step template.** `agents/implementation-planner.md`, `## Plan Output Format`, gains `- CLAUDE.md: <why every session needs this content>`, written only on a step whose `Files:` names `CLAUDE.md`.
   - Pros: works with or without an orchestrator, because the field sits in the plan the user reads. A missing field is visible at a glance, where a missing sentence in a step's prose is not. About +100 bytes on `agents/` and on the planner path (slack 821, plus 16).
   - Cons: whether the field is present is decidable. Whether its reason is any good is not, and that stays the user's judgement. Nothing in a plan reviewed only by skimming makes the field conspicuous unless a summary names it.
3. **Both, as one mechanism.** The planner writes the field (option 2). The orchestrator's summary lists each such step together with its `CLAUDE.md:` line, or says there is none (option 1, reworded to quote the field).
   - Pros: the decidable fact (which steps) and the undecidable one (why) both reach the user at approval, in one line per step. A plan made without an orchestrator still carries the field.
   - Cons: about +220 bytes on `agents/` in total, about +120 on the orchestrator path and about +100 on the planner path. Two prompts change, so two places must stay in step: the field's name is the shared token.

## Constraints

- No hard block, and no lint over consumer plans.
- The planner path keeps at least 700 bytes of slack after the plan's steps (it has 821 now).
- Steps are not added to the filed plan. Whatever is ruled is carried out in plan step 2, whose source issue is `261020-0916-plan-steps-write-claude-md-past-every-approval.md`.

## Recommendation

Option 3. The consultant's review names option 1 for reach and option 2 for robustness without an orchestrator. Taken alone, each leaves one half out: option 1 shows the steps but not the reason, and option 2 holds the reason but shows nothing. With both, the orchestrator line quotes the field, so one token connects them and nothing is restated. The cost is about 220 bytes against 5 536 of agents head-room.

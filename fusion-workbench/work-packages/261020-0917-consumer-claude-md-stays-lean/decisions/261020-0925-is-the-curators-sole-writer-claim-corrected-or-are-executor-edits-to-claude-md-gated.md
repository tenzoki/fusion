# Is the policy-curator's "every edit to `CLAUDE.md` comes through you" corrected to name the actual writers, or are executor edits to `CLAUDE.md` gated so that it becomes true?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261020-0916-plan-steps-write-claude-md-past-every-approval.md, 261020-0835-why-a-consumers-claude-md-grows-unchecked.md, 261020-0925-how-does-the-lean-claude-md-rule-reach-the-agents-that-write-claude-md.md, 260916-1311_*_the-curators-remit-admits-two-reasons-and-no-third-and-a-relocation-is-a-third.md, 261020-1003-does-the-plan-approval-show-which-steps-write-claude-md-and-from-where.md, 261020-0934-review-of-plan-consumer-claude-md-stays-lean.md

---

## Question

`agents/policy-curator.md` `### You are the only path to CLAUDE.md, and that does not widen your remit` states: "Every edit to `CLAUDE.md` now comes through you, behind approval". `skills/curate/SKILL.md` calls the command "the one path to `CLAUDE.md`". In krk, 46 of the 57 commits that touched the file since 2026-08-16 came from other paths, mostly plan steps that code-implementer executed. The prompt and the behaviour have to agree. Either the text is corrected or the behaviour is changed. The choice decides who may write a consuming project's `CLAUDE.md`, which binds every later plan, so it is recorded.

## Options

1. **Correct the text.** The curator section and the curate skill's opening line name two writers: a plan step that an implementer executes, behind the user's plan approval, and the curator, behind its ledger approval. The section that `261020-0925-how-does-the-lean-claude-md-rule-reach-the-agents-that-write-claude-md.md` adds to the conventions bounds what either of them may add. Cost: about +80 bytes on `agents/policy-curator.md` (curator path slack 1 724). The skill line shrinks.
   - Pros: true at once. Cheap. Keeps the plan approval as the gate. A plan step that writes `CLAUDE.md` now has to say, in the plan, why its content binds every session, and that is where the user looks. krk's failure was content that nobody questioned, not a missing gate.
   - Cons: two writers stay. The curator's ledger and blast-radius pause do not see plan-step edits. On its own, this option leaves the plan approval as the gate without giving that gate the fact it needs: which steps write `CLAUDE.md`. Decision `261020-1003-does-the-plan-approval-show-which-steps-write-claude-md-and-from-where.md` supplies that fact, and this option relies on it.
2. **Gate executor edits.** code-implementer and data-implementer refuse to edit `CLAUDE.md`. Plan steps route every `CLAUDE.md` change to the curator.
   - Pros: the sole-writer claim becomes true, and every edit passes the ledger.
   - Cons: the curator may change a statement for two reasons only, contradiction and history-grounded obsolescence (`## Remit`). Adding new content is neither. Making this option work means a third reason, and the remit's two-reason bound was kept on purpose (`260916-1311_*_the-curators-remit-admits-two-reasons-and-no-third-and-a-relocation-is-a-third.md`). It also needs edits to two executor prompts, the planner's routing and the orchestrator's routing table: several hundred bytes on paths with 519 to 1 141 bytes of slack. And a plan whose change makes one true line in `CLAUDE.md` false could no longer fix that line in the same step.
3. **Correct the text and add an observation.** Option 1, plus a tracker notice when an executor's edit grows `CLAUDE.md`.
   - Pros: makes plan-step growth visible as it happens.
   - Cons: a new hook concern and tests for a signal that the weight notice (issue `261020-0916-claude-md-over-threshold-finding-persists-nowhere.md`) already gives at session start. The observation also comes after the fact. The approval-time listing of decision `261020-1003-does-the-plan-approval-show-which-steps-write-claude-md-and-from-where.md` shows the same edits before they are made, at almost no cost.

## Constraints

- The curator's remit stays two reasons and no third, unless a separate decision widens it.
- Whatever is chosen, the prompt text and the behaviour agree (the issue's acceptance line).

## Recommendation

Option 1, together with decision `261020-1003-does-the-plan-approval-show-which-steps-write-claude-md-and-from-where.md`. The gate that failed in krk was the plan approval. It judged content with no rule to judge it by, and without being shown which steps wrote the file. The conventions section supplies the rule, and the D4 listing supplies the fact. Option 2 buys a sole writer by widening the curator's remit, and that is a larger decision than this issue asks for.

---
Answered: `261020-0927-plan-consumer-claude-md-stays-lean.md` — option 1, correct the curator's text: two writers, both behind an approval, together with D4; ruled by user, Kai Stalmann <ks@qantr.com>

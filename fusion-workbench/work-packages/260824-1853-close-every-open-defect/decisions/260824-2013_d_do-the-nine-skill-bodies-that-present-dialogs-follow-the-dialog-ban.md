# Do the nine skill bodies that present dialogs follow the dialog ban, and what would the interactive-parent measurement settle?

---
**Domain:** code
**Filed by:** analyst
**Attribution backfilled 260825 (not written by the filing agent):** `analyst` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Cross-references:** `260824-1538_*_two-design-forks-from-the-dialog-ban-were-put-to-the-user-in-chat-and-recorded-only-in-a-history-log.md`; `260820-1755_*_five-agent-prompts-tell-a-top-level-run-it-holds-askuserquestion-and-a-headless-one-does-not.md`; `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md` (the headless measurement and its unchosen option 3); `260824-0443-coder-orchestrator-asks-in-chat.md`; `agents/orchestrator.md` `## How you ask the user anything`; the sibling record filed in the same minute, `260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md`; plan `260824-1905_*_plan-close-every-open-defect.md` step 1 (D-dialog-skills), step 11 and step 12

---

## Question

The dialog ban at `agents/orchestrator.md:29` reads "Every question **you** put to the user", which binds the orchestrator alone. Nine skill bodies present `AskUserQuestion` dialogs: `archive`, `cleanup`, `commit`, `curate`, `direct`, `memo`, `migrate`, `next`, `setup` (recounted at HEAD: the referring record says nine, the history log said five). Two of those uses were added the day the ban landed, in the claim-override path, with nothing for their author to read. Whether the ban reaches a second surface with its own growth bound was put to the user in chat and never recorded. A second, older record bears on the same channel: five agent prompts tell a top-level run it holds `AskUserQuestion`, two headless probes measured that it does not, and whether a top-level run under an *interactive* parent inherits the tool is the measurement nobody has taken. This Circle's step 11 rewrites the five sentences so they no longer assert a tool, which needs no measurement. What the measurement would still settle is whether a skill body's dialog ever reaches a user in the sessions fusion actually runs in, which is the fact under the skills fork.

## Options

1. **The ban reaches the skills**: the nine bodies ask in plain chat text, as the orchestrator does.
   - Pros: one rule on every surface; the input-loss the ban was written for is closed everywhere; a future skill author meets no exception.
   - Cons: nine edits on the `skills/` surface, which has 3 220 bytes of head-room; a chat question in a skill body loses the structured options a dialog renders.
2. **The ban stays the orchestrator's**, and the skill bodies keep their dialogs, with the exception written down at `## How you ask the user anything`.
   - Pros: no skill edit; the user asked for the ban on one surface.
   - Cons: the loss the ban names is as real in a skill's dialog; the asymmetry the reconciler recorded on 2026-08-24 stays live and stays an exception on the C3 stopping property.
3. **Measure first**: run the interactive-parent probe (option 3 of the mode-3 decision, unchosen), then decide 1 or 2 on what it shows.
   - Pros: the fork rests on whether the dialog is ever rendered, and that is measurable.
   - Cons: the probe needs an interactive parent this repository cannot spawn; the second referring record has stood since 2026-08-20 waiting on it.

## Constraints

- Whatever the answer, `agents/orchestrator.md` `## How you ask the user anything` cites this record and its sibling, so the next author of a skill body meets the open question before adding a dialog (referring record, fix direction; plan step 12).
- The count is recounted, never copied: `grep -l AskUserQuestion skills/*/SKILL.md`.
- `skills/*/SKILL.md` is a bounded surface; nine edits pay with cuts on the same surface in the same step.
- The chat exchange is not reconstructed from memory; the user answers the fork again on this record.
- The answer to this record and to its sibling are coupled: a skill body that keeps a dialog needs the grant to reach it.

## Recommendation

None. Neither referring record gives one; the first asks for the fork to be stated and put back to the user, the second says a guess in either direction is worth less than saying the question is unmeasured.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Deferred: a later Circle that meets the question again — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.

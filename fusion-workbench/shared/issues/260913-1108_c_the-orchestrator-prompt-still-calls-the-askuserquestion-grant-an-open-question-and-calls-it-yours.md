The orchestrator prompt still calls the AskUserQuestion tools grant an open question and calls it "your" grant

---
`agents/orchestrator.md:34` presents two questions as filed rather than answered, and the first of them presupposes a grant the same file deleted at `e422bf99`. The ruling settled that question explicitly as a side effect.

---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**The sentence.** `agents/orchestrator.md:34`: "Two questions the ban left open are filed rather than answered here: whether your `tools:` grant of the tool goes (`260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md`) and whether the skill bodies that present dialogs follow the ban (`260824-2013_*_do-the-nine-skill-bodies-that-present-dialogs-follow-the-dialog-ban.md`), both fusion's own records."

**What is false.** The orchestrator holds no `tools:` grant: `e422bf99` deleted the frontmatter line, and `agents/orchestrator.md:170` and `:598` say so in the same file. And the question is answered, not open — `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md`, `Answered:` block: "the `AskUserQuestion` grant disappears with the line, which is what `260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md` asks about". The second half of the sentence, on the skill bodies, is untouched by the ruling and stands.

**The cited record was not moved with it.** The record `260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md` still carries a deferred marker and an empty `Superseded by:` field, while all three of its options are now moot. `rules/fusion-workbench-conventions.md:356` makes `_d_` terminal and sanctions only `_i_` → `_s_` as a terminal-to-terminal move, so what that record is owed is a question for the user and not an edit a reviewer should assume; it is named here so the transition is decided rather than forgotten.

**Acceptance test.** `agents/orchestrator.md:34` names one open question, not two, and does not attribute a `tools:` grant to the reader. `grep -n "tools:" agents/orchestrator.md` returns only the two lines that say the grant is gone. And the marker question on the cited `_d_` record is either ruled or deliberately left, with the leaving recorded.

---
Resolved: the sentence in `agents/orchestrator.md` `## How you ask the user anything` now names one question, the skill-bodies dialog one, as deferred rather than answered, and attributes no `tools:` grant to the reader; the grant question is settled in `260913-0909_*_may-the-orchestrator-reach-every-tool-and-may-an-agent-dispatch-another.md` under its `Answered:` block, which `## Scope` already cites. The `_d_` record `260824-2013_*_does-the-orchestrators-tools-grant-of-askuserquestion-go-now-that-the-orchestrator-may-not-call-it.md` is left exactly as it stands, by rule and not by omission: `_d_` is terminal and the only terminal-to-terminal move is `_i_` to `_s_` (`rules/fusion-workbench-conventions.md` `## Terminal states are history`). The prompt shrinks by 182 bytes; the surface-growth golden is regenerated for the new figure. Concept accepted by a consultant read with one word changed; fixed in the commit that carries this line.

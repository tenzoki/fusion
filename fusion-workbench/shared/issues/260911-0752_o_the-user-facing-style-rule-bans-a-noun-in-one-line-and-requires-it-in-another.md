The user-facing style rule bans a noun in one line and requires it in another
---
`rules/user-facing-output.md` `## Vocabulary` forbids the fusion noun Circle in any chat, gate or question text. Its `## Questions and gates` section then instructs that every question carry "the Circle name" so the reader has it in scrollback. The same file forbids and requires the same word, and it is emitted to six agents.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** e2f7036a (step S5, which found it and left it); 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md

**Evidence.** Both lines are in the shipped file at HEAD and neither qualifies the other. The vocabulary ban is categorical: no fusion noun, glossed or not, with the instruction to name the thing in the reader's own project instead.

**It predates this Circle and is not a container fault.** The cut removed the Circle and the container ruling brought the container back under another name, but this contradiction was in the file before either. What the cut changed is the answer: the noun the second line asks for no longer names anything in the shipped design, so following it now means writing a word for a mechanism that does not exist.

**Why an agent cannot resolve it by reading harder.** The two lines are both imperative and both unqualified, so an agent that obeys one disobeys the other, and which one it picks is a matter of reading order rather than judgement. That is the shape `rules/critical-stance.md` §4 calls a question cut wrong.

**Acceptance.** The file says one thing about naming the unit of work in user-facing text. Whichever way it goes, the instruction names something the current design has — a work item's own title, its directory name, or the user's own words for the job — and the vocabulary ban either covers it or exempts it explicitly.

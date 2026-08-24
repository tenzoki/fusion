The playmaker writes the portfolio citing a history file it has not written yet

---

`portfolio.md` carries a `**Generated:**` header naming the playmaker session that produced it, and
that name resolves to a history file in the shared history store. The prompt's step order writes the
portfolio first and the history log after it, so between the two writes the portfolio cites a file
that does not exist.

Found by the playmaker in its own output on 2026-08-20, dispatched at the Phase-4 closure of Circle
`260819-1645-four-constraints-on-deep-change`. It reported the window rather than working around it,
and could not file this record because filing is outside its scope.

---

**Why it is a defect now and was not before.** `portfolio.md` is inside the corpus of the blocking
citation gate armed by that Circle. Until 2026-08-20 the consequence of the window was a citation that
briefly resolved to nothing and then did not. The consequence now is a **failing test suite** for as
long as the window is open, and the failure text names a dangling citation in `portfolio.md` without
naming the step order as its cause.

**The window is small and it is not zero.** It closes on the next write in the same run. It stays open
if the run stops between the two writes — an interruption, a usage limit, an error in the history
write — and it is open for anything that reads the tree concurrently, including a suite run in another
terminal.

**Two shapes of fix, neither chosen here.**

1. **Reorder the two writes.** Write the history log first, then the portfolio that cites it. Smallest
   possible change, and it removes the window rather than shrinking it. Whether the log can be written
   before the run's own conclusions are known is the question this turns on: it may need to be created
   and then appended to.
2. **Do not cite the log from the portfolio header.** The `**Generated:**` line could carry the session
   stamp without a resolvable path, the way a bare stamp is already an unjudged token. Removes the
   citation and with it the coupling; costs a reader the one-hop route from the portfolio to the run
   that produced it.

**Adjacent and not the same.** `shared/issues/260819-1511_*_the-archive-citation-filter-reads-shipped-text-and-never-the-workbench-*` is about a citation dying because its target moved. This is about a citation being written before its target exists. Both now redden the same gate, and a reader meeting either failure sees the same message.

Filed by the orchestrator of session `260819-2006` from the playmaker's own report. No Circle is active,
so it goes to the shared store under the Origin Rule.

---
Resolved: fixed — shape 1: the history log is created before the portfolio and appended to as the run proceeds, and the portfolio section says the cited log exists first; `agents/playmaker.md:236`, `:160`

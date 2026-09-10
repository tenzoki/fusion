The event log's append-only rule is justified by a generator that no longer exists
---
`agents/orchestrator.md` Setup step 6 tells the reader never to truncate `orchestrator-events.jsonl` because "the end-of-session sequence-diagram generator reads it cross-session for historical context". That generator went with the history store it wrote into. The rule is right and its stated reason is false.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md step C5; 0ec15cb9; e6a0dc67

**Evidence.** Step C5 (`0ec15cb9`) closed the history store to writes and removed the post-session sequence diagram, which had no other destination. `agents/orchestrator.md`'s Setup step 6 still carries the clause. It was seen by the citation-repair pass and deliberately left: one clause, in a prompt charged to every dispatch, and rewriting a justification is not the same act as repairing a citation.

**Why it is worth a record rather than a silent edit.** The append-only rule protects something real — the log is now the only cross-session trace fusion keeps, since the history store is frozen and the state file is gone — so the rule is more load-bearing than it was, not less. A reader who checks the stated reason, finds it false and concludes the rule is stale would delete the wrong thing. The repair is to state the reason that holds now.

**Acceptance.** Setup step 6 gives a reason that is true at the commit that fixes it, and no shipped surface names the sequence-diagram generator as a live reader.

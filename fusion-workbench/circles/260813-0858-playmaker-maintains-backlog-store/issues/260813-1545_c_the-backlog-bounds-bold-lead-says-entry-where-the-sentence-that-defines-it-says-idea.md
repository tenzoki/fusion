# The backlog bound's bold lead says "entry" where the sentence that defines it says "idea"

**Filed by:** coderev (review of Circle `260813-0858-playmaker-maintains-backlog-store`, commit `b995049`)
**Severity:** Low
**Scope:** `rules/fusion-workbench-conventions.md:204`

## The Circle's untestable deliverable, judged as a reader

`rules/fusion-workbench-conventions.md:204`:

> **No agent originates a backlog entry.** Filing is originating an idea; maintenance is reshaping ideas the store already holds. …

**The quotable sentence works.** Taken against the case it was written for — the playmaker writes consolidated prose when merging duplicates, while no agent may originate an entry — it settles cleanly. A merge collapses several statements of one idea into one file; the set of ideas in the store is unchanged; therefore it is maintenance, not filing. `agents/playmaker.md:116` then states the same test as a property of the text rather than a carve-out (*"every sentence in a merged entry traces back to something somebody already filed"*), which is the stronger form. Plan acceptance (a) and (c) are met.

## The residual

The bold lead and the sentence that defines it use two different nouns, and the split case falls in the gap. A split **originates entries**: it creates one new file per idea. Read literally against the bold lead, the playmaker's own Step 2b (`agents/playmaker.md:114`, *"file the new entries at `_o_`"*) is a violation.

What rescues it is the table two paragraphs down (`rules/fusion-workbench-conventions.md:211`), whose `_o_` row names the playmaker as a writer *"on a split's new entries"*. So the document is internally consistent — but only if the reader reaches the table and back-substitutes "idea" for "entry" in the bold lead. The one sentence the acceptance asked a reader to be able to quote does not settle the split case on its own; it settles the merge case, which is what it was aimed at.

## Recommendation

One word. Either restore the original noun and let the next sentence define it —

> **No agent files a backlog entry.** Filing is originating an idea; maintenance is reshaping ideas the store already holds.

— which puts the defined term in the bold lead and makes the split case fall out of the definition, or change the object instead: *"No agent originates a backlog **idea**."* The first is preferable, because "files" is the verb the rest of the section and both skill bodies already use.

---
Resolved: Accepted as the review proposed. The lead reads **No agent files a backlog entry.** Filing is originating an idea; maintenance is reshaping ideas the store already holds. The acceptance condition was quotability on its own, and it was violated: a split originates entries without originating an idea, so the reader needed the marker table two paragraphs down to cover the case. With 'files' the next sentence supplies the definition, and merge and split are both decided inside the quotation. Net −5 bytes on a file emitted to all sixteen agents.

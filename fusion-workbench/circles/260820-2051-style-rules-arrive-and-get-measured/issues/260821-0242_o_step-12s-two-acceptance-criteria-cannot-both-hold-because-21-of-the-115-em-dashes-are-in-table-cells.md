Step 12's two acceptance criteria cannot both hold, because 21 of the file's 115 prose em-dashes sit inside table cells

---

Plan step 12 asks for two things at once: `bin/fusion-prose-metric rules/fusion-workbench-conventions.md` at or under **seven**, and "the file's tables and its two marker-glob forms are unchanged, verified by diffing the table rows alone". Read literally, no file satisfies both.

At the step's starting state the file carried 115 prose em-dashes in 7 840 prose words. **21 of the 115 are inside table cells.** Word count is fixed, because the step forbids changing a word, so the permit stays `int(7840/1000) = 7`. Freezing the table rows therefore puts the floor at 21, three times the permit, and the metric criterion becomes unreachable by construction.

---
**Found by:** `coder`, implementing step 12.
**Owner:** `planner` for the criterion's wording; nothing in the file is wrong.
**Severity:** Low. The step was implementable under the only reading that satisfies both halves, and it was implemented under it. The cost is that an acceptance criterion as written could not have been met, which is the same class of fault as the one the plan's own caution names against step 3: an acceptance that tests what its author expected rather than what a reader would run.
**Filed in the Circle** per the Origin Rule: the Directive caused it.

**The reading applied, and why it is the intended one.** "The tables are unchanged" was read as *structurally* unchanged: same rows, same order, same cells, no cell's data altered, punctuation inside a cell repunctuated like any other prose. Three things support that reading over the literal one.

1. The step's own `**Changes:**` field says "114 replacements", against 115 marks. A pass that froze the tables could make at most 94. The number the planner wrote down is only reachable if table cells are in scope.
2. The step states the marker-glob forms as a *separate* criterion. Both glob forms live inside a table (`rules/fusion-workbench-conventions.md:349-350`). Under the literal reading that second criterion would be entirely contained in the first and would not have needed writing.
3. The verification asked for is "diff the table rows alone and show it". A diff that is empty by construction is nothing to show; a diff that isolates the table rows so a reader can confirm only marks moved is.

**What was verified instead, in place of byte-identity.** 58 table rows before and 58 after, the same line numbers, the same per-row cell counts, and 932 table-row tokens on both sides with one differing position (`the` to `The`, the capital taken by one sentence split inside the `_i_` row). 19 rows changed, every one of them mark-only. The two glob-form rows are byte-identical.

**What would settle it.** Either wording, chosen deliberately: replace "the tables are unchanged" with "no table row's data changes and no row is added, removed or reordered; mark-only edits inside a cell are in scope", or state a permitted count that a frozen-table pass can reach. The first matches what was built.

**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md` step 12; `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0242-coder-the-conventions-file-reaches-its-em-dash-ceiling.md` (the pass, with the table-row evidence).

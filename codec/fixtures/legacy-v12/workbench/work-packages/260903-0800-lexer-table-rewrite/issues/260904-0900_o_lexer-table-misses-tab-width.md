The generated lexer table counts a tab as one column
---
Columns after a tab are reported one-based per character, while the hand-written table counted a tab as advancing to the next multiple of four.
---
**Filed by:** reviewer, Fixture Person <fixture@example.invalid>
Found after the package closed. Evidence: `tests/lexer/tab-indent.src`, expected column 9, reported column 2. Acceptance: the reported column is 9.

# Parser fails on empty input

**Filed by:** reviewer
**For:** code-implementer
**Related:** 260928-1200-parser-fix.md

`strictParse` of zero bytes reports `not-an-object` where `syntax` was expected.

This narrative belongs to the scratch workbench under `codec/fixtures/workbench/`.
Its control data is `260928-1400-parser-fails-on-empty-input.record.json` beside
it, taken from `fixtures/valid/record/issue-open.json`.

# A regex backend replaces the hand-written lexer

---
**Domain:** code
**Status:** dropped
**Active spec/plan:** 260904-1330_*_plan-regex-backend.md (plan)
**Filed by:** user, Fixture Person <fixture@example.invalid>

---

## Directive

Tokens are matched by one compiled regular expression per token class instead of the hand-written lexer.

## Dropped

Replaced by 260902-1000-parser-error-recovery.md and the generated table of 260903-0800-lexer-table-rewrite.md: a regex backend offers the parser no point to resume from after an error.

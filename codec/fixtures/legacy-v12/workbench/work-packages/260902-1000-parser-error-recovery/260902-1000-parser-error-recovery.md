# The parser recovers from a syntax error and reports every later error in the file

---
**Domain:** code
**Status:** claimed
**Claim:** 0f1e2d3c — Fixture Person <fixture@example.invalid>, 260902-1015
**Mode:** autonomous
**Active spec/plan:** 260902-1030_*_spec-parser-error-recovery.md (the spec), 260902-1100_*_plan-parser-error-recovery.md (plan, part 1 of 2)
**Cross-references:** 260904-1300-regex-backend.md, 260902-1500_*_which-sync-tokens-end-a-recovery.md
**Filed by:** user, Fixture Person <fixture@example.invalid>

---

## Directive

A syntax error no longer ends the parse. The parser skips to the next synchronising token, records the error and goes on, so one run reports every error in the file in source order. Reached when the recovery corpus reports each seeded error exactly once and no phantom error after it.

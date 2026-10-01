# Is a parse error an enum of kinds, or a formatted string?

---
**Domain:** code
**Filed by:** implementation-planner, Fixture Person <fixture@example.invalid>
**Cross-references:** 260810-1000_*_the-error-type-is-a-string.md

---

## Question

The rule name has to travel with the error. A string loses it at the first format call.

## Options

1. **An enum of kinds carrying the rule name.**
2. **A formatted string**, as decided earlier.

## Recommendation

Option 1.

---
Answered: 260810-0915_*_plan-error-messages-name-the-rule.md — option 1; ruled by user, Fixture Person <fixture@example.invalid>

---
Implemented: 4f3e2d1 — `ParseError` became an enum whose variants carry the rule name

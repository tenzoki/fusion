# Does the AST keep comments and whitespace, or does a separate token stream carry them?

---
**Domain:** code
**Filed by:** implementation-planner, Fixture Person <fixture@example.invalid>

---

## Question

A formatter needs the trivia; the compiler does not. Where they live decides the AST's size and every consumer's walk.

## Options

1. **Trivia attached to the following token in the AST.**
2. **A separate token stream, indexed by source offset.**

## Recommendation

Option 2.

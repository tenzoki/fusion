# Which Unicode version does the tokenizer's identifier rule follow?

---
**Domain:** data
**Filed by:** implementation-planner, Fixture Person <fixture@example.invalid>
**Cross-references:** 260901-0900-tokenizer-handles-unicode.md

---

## Question

The identifier rule follows the Unicode identifier annex, which changes with each Unicode version. The tokenizer's tables need one version to be generated from.

## Options

1. **The newest version at each release.**
2. **The version the language standard names.**

## Recommendation

Option 2.

---
Answered: the upstream maintainers' reply, `docs/upstream/unicode-reply.md` `## 4.` — option 2, the version the language standard names; ruled by user, Fixture Person <fixture@example.invalid>

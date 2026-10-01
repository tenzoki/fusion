The parser panics on an empty file
---
An input of zero bytes reaches an index into an empty token buffer.
---
**Filed by:** code-implementer, Fixture Person <fixture@example.invalid>
Evidence: `tests/corpus/empty.src`. Acceptance: an empty file parses into an empty module.

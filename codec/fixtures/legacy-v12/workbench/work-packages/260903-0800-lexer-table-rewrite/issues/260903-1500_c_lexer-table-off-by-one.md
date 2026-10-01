The generated lexer table drops the last state
---
The emitter's loop stops one state early, so a source ending in an operator fails to tokenize.
---
**Filed by:** code-implementer, Fixture Person <fixture@example.invalid>
Evidence: `tests/lexer/trailing-operator.src`. Acceptance: the file tokenizes.

---
Resolved: the emitter's loop bound corrected in `build.rs`; the trailing-operator case added to the lexer suite.

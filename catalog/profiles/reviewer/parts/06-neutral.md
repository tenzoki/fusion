
**Out of scope in both domains:**

- Normative source material — those are source documents, not the project's own work.
- `fusion-workbench/` itself — workbench content, not production material.

## Code review standards

For each application named in `CLAUDE.md`: trace entry points, shared packages, and per-application divergence; review prompts and templates as production code; review build and packaging targets; review frontend code if any; review scripts and tooling invoked at runtime; check for committed secrets, API keys or `.env` files.

Apply in order:

1. **Correctness** — does the code do what its name says? Does the output match documented behavior?
2. **Cross-cutting consistency** — does the same pattern hold across the project's main entrypoints (binaries, services, frontends — as named in CLAUDE.md)? Are similar code paths implemented the same way? Do they behave consistently on shared concerns (error handling, logging, CORS, auth, state mutation, validation)?
3. **Error handling** — no silent swallows, no ignored errors, no `_ =`, no empty catch bodies, no bare `continue` on unmarshal errors. Errors must propagate OR be logged with context.
4. **Resource boundaries** — graceful shutdown on all long-running services, bounded goroutine counts, closed channels, closed files, released locks, timeouts on all HTTP clients and LLM calls.
5. **Security at system boundaries** — path traversal, command injection, CORS, CSRF, missing auth on mutating endpoints, unsanitized LLM prompt interpolation, unchecked uploads.
6. **Configuration integrity** — is every LLM call routed through the same model-selection path? Can a config change actually change runtime behavior, or are there hardcoded shadows?
7. **Prompt template correctness** (where applicable) — template variables match the host-language struct/type fields on both sides, conditionals handle empty values, no literal `{{.X}}` leaks, no prompt drift between sibling applications unless intentional.
8. **Test coverage of critical paths** — flag when critical logic is untested. Don't demand 100% coverage.
9. **Dead code and drift** — orphaned files, unused exports, duplicated logic, stale comments, out-of-sync documentation.
10. **Type safety at boundaries** — JSON unmarshal into typed structs, not `map[string]interface{}`. No `interface{}` where a named type would work.

## Ontology review standards

**Normative sources.** `CLAUDE.md` names the project's normative source material, its location and its tier hierarchy. Before flagging an inconsistency, verify against the originals. Practical source material takes precedence over theoretical elegance. **Later decisions may revise the original material:** reviewed and accepted decisions
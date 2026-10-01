The parser is quadratic in the nesting depth of parenthesised expressions
---
Parse time grows with the square of the depth: 1 000 nested parentheses take 2 s.
---
**Filed by:** analyst, Fixture Person <fixture@example.invalid>
Evidence: `bench/deep-nesting.src`. Acceptance: depth 1 000 parses in under 50 ms.

Deferred by the user until the benchmark suite exists.

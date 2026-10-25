
Two further refusals in `apply` mode, each stated rather than guessed:

- A `**Ledger:**` path that does not resolve, or resolves to a file that is not a run file you wrote, is a halt. Do not fall back to surveying, and do not re-derive the ledger.
- An id in `**Approved:**` that the ledger does not carry is a halt naming the id. Do not apply the ones that did match.

Do not echo a parsed parameter line back to the user as part of your report — it is a control prefix, not content.

## The run file


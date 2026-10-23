migrate: the unknown-outcome and refused-first-chunk messages spell helper commands without `--session`
---
Two refusal texts in `hooks/migrate.ts` spell a full `bin/fusion-migrate …` command by hand instead of through `command()`. So under a non-default `--session` they name a command that acts on the default session, where `recorded` refuses it (exit 5, "no run is recorded" or "records … not …") or reaches another record. This is the B1 rule of plan `261017-2030-plan-migrate-code-issues-end-fence-suggestion-foreign-session-later-chunk.md` (a message names a command only where that command's own checks pass), missed at two sites outside the fence predicate. Pre-existing: both texts are unchanged in `v13.3.1..6b92d484`. Severity Low.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence** (at `6b92d484`):

- `hooks/migrate.ts`, `refusedFirstChunk`, the `work === null || work.length === 0` branch: "put back what it names and run \`bin/fusion-migrate rollback\` again, or run \`bin/fusion-migrate rollback --end-fence\` to end the fence and stay under JSON control". `refusedFirstChunk` receives `session` but does not use it in the text.
- `hooks/migrate.ts`, `send`, the `unanswered` branch: "\`bin/fusion-migrate resume\` (or \`rollback\`, if that was the command) sends the same request again." `send(wb, request)` has no session in scope.
- Every other message site that names a helper command builds it with `command(wb, session, sub)` (`hooks/migrate.ts`, the helper above `readState`), which appends `--session <dir>` when the session is not the default. The `fence-ended=` note of `endLeftFence` does the same by hand.

**Fix direction:** route both texts through `command(wb, session, …)`. For `send`, which has no session, pass it in or let the caller word the retry. Exit codes stay unchanged.

**Acceptance test:** a `migrate.test.ts` case runs `run`/`rollback` with a non-default `--session <dir>` into (1) a refused first rollback chunk with no work since the plan (the existing refused-first-chunk construction) and (2) an exit-7 cut (the existing `killPlugin()` rule). It expects each stderr to name `--session <dir>` in every `bin/fusion-migrate` command it spells. Running the named command then gets past `recorded`.

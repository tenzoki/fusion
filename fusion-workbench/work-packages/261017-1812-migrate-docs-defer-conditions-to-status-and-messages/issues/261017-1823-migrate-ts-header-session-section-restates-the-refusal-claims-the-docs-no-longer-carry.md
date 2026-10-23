# migrate: the `hooks/migrate.ts` header's `## The session` restates the refusal claims the docs no longer carry, and is false where they were

---
The last sentence of `## The session` in the `hooks/migrate.ts` header comment says a stale record "is refused by `run`, `resume` and `rollback`, and `set-aside --consent` renames its directory aside, never while a fence or pending intent stands that `run` would refuse on". The 13.1.11 review and its trace showed this claim false in three cells. `run` does not refuse a rolled-back record kept for another workbench path (cell C10 of `261017-1708-plan-migrate-landed-cell-docs-entry-path-conditions.md`). `rollback --end-fence` removes an idle fence (C4) or ends a JSON-control fence (C7) instead of refusing. And `set-aside` reads only the intent the codec reports, not a journal-only one. The 13.1.12 package removes the claim from the header, the README rows and the upgrade note, and this comment then remains its only copy.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1823-plan-migrate-docs-defer-conditions-to-status-and-messages.md`, `261017-1747-migrate-refusal-claims-except-only-the-legacy-fence-removal-where-end-fence-also-ends-a-json-fence-over-a-stale-record.md`

**Evidence (read at `68ff12b7`).**
- `hooks/migrate.ts` header, `## The session`, its last sentence.
- `hooks/migrate.ts` `run`: `current` runs only for a record not rolled back.
- `hooks/migrate.ts` `endLeftFence`: the legacy branch unlinks the fence file, and the JSON branch sends `maintenance end`. Neither branch refuses.
- `hooks/migrate.ts` `standing`: `i.maintenance !== null || i.pending !== null`, which leaves out a journal-only entry, unlike `intentStands`.

**Reach.** A code comment, read by whoever changes the entry. It changes nothing at run time.

**Fix direction.** Cut the sentence down to what holds on every path, as the 13.1.12 docs do: `set-aside` renames no record that reads as current and nothing while the codec reports a fence or an intent; refusals are the messages'. The comment is in a compiled entry, so `hooks/dist/migrate.js` is rebuilt and `committed-dist` must stay green. That is why the 13.1.12 package, which changes no code file, leaves it.

**Acceptance.** No sentence of the `hooks/migrate.ts` header claims that `run`, `resume` and `rollback` refuse every stale record, and `hooks/dist/migrate.js` matches its build.

---
Resolved: 2026-10-23 by code-implementer (plan 261017-2030-plan-migrate-code-issues-end-fence-suggestion-foreign-session-later-chunk.md, step 7). The last sentence of the `hooks/migrate.ts` header section `## The session` now reads "The session is keyed by machine and path, not by tree. `set-aside --consent` renames no record that reads as current and nothing while the codec reports a fence or an intent; which subcommand refuses a record `stale` reads as stale is said by its message." Header comment only; `hooks/dist/migrate.js` rebuilt.

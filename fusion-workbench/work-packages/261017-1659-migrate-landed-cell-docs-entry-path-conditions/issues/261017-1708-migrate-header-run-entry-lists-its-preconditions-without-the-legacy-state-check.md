# migrate: the header's `run` entry lists its preconditions in order but leaves out two checks, and calls the third wider than it is

---
The `bin/fusion-migrate` header says `run` checks its "preconditions in this order: no v11 store name …, `migration` implemented by the codec, no fence or pending intent". `run` first refuses a previous record that is stale or not finished, `preconditions` refuses a workbench that is not legacy Markdown between the second and third check, and the third check reads only the intent the codec reports as pending, not every entry under the journal.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** `261017-1637-migrate-undo-note-names-end-fence-for-an-undo-cut-mid-chunk-where-an-intent-pending-makes-it-refuse.md`

**Evidence (read at `0f2e098e`).**
- `hooks/migrate.ts` `run`: `current` for a previous record not rolled back, then "a run of … is recorded …" for one not done, both before `preconditions`.
- `hooks/migrate.ts` `preconditions`: `legacyNames`, then `migration` in `operations.implemented`, then `i.state !== "legacy"` ("the workbench is …, not legacy Markdown"), then `standing(i)`.
- `standing` is `i.maintenance !== null || i.pending !== null`. `inspect.pending` names a committed `initialize` or `verify` only (`codec/README.md`), while `intentStands`, which the landed and idle clauses mean by "no intent is pending", also counts any entry under `.json-state/journal/`. The 13.1.11 package words the set-aside clauses as "an intent the codec reports as pending" for this reason; the `run` entry and the exit table's line for 5 still say "pending intent".

**Reach.** Description only. A reader who checks a refusal against the listed order finds an unlisted one.

**Fix direction.** List the previous-record refusals and the legacy-state check in the `run` entry, and word the fence check as a fence or an intent the codec reports as pending, matching the set-aside clauses. Keep the new words unbackticked so `reference-resolution-lint` stays at its `BASELINE`. No code change.

**Acceptance.** Every refusal `run` can give before its backup is in the entry's list, in code order, and the intent check is not described wider than `standing` reads.

The write client swallows a failed repair of retained rows and drops a torn retained line
---
Every `bin/fusion-write` mutation starts by repairing retained `record_change` rows. `write()` wraps that repair in an empty `catch` and discards its result, so a repair that fails, or one that leaves rows retained, is reported on neither stdout nor stderr. Only the explicit `log-repair` reports it. Separately, `repairRetained` parses the retained file with `rowsIn`, which skips a line that does not parse. It then removes the whole prefix it read, so a torn last line of `.guard-state/record-change-pending.jsonl` is deleted without a trace.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-2305_*_how-does-the-write-client-log-a-change-it-cannot-append-or-did-not-observe.md, 260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md (step 2), 261001-0837-reviewer-fj03b-initialize-and-fj03c.md

Severity: Low. Scope: `hooks/lib/record-write.ts` `write`, `hooks/lib/record-change.ts` `rowsIn` and `repairRetained`.

**Evidence:**

- `hooks/lib/record-write.ts` `write`: `try { repairRetained(c.workbench); } catch { // Retained rows stay retained; … }`. The returned `{appended, retained, detail}` is not read.
- `hooks/lib/record-change.ts` `rowsIn`: `catch { // A torn or foreign line: nothing to key. }`.
- `repairRetained`: `const rest = now.startsWith(read) ? now.slice(read.length) : now;` then `unlinkSync` or a rewrite to `rest`. The unparsed part of `read` is gone.
- The logging decision is about rows staying visible as `pending` or `unlogged`. A row dropped or a repair failed with no output contradicts that.

**Fix direction:**

- Print one stderr line on every write whose repair failed or left rows retained, with the count and detail.
- Keep a retained line that does not parse, in place or moved aside under a named file, instead of truncating it.

**Acceptance:** cases in `hooks/lib/__tests__/record-change.test.ts` or `record-write.test.ts`, red against the current code:

- A write over a read-only log with retained rows prints the repair failure on stderr.
- A pending file ending in a torn line still holds that line, or a named copy of it, after `repairRetained`.

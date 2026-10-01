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

---
Resolved: `write()` in `hooks/lib/record-write.ts` keeps the repair's result. A repair that threw or left rows retained rides on every outcome as `repair`, and `hooks/write.ts` prints it as `retained=<n|unread>` on stdout plus one stderr line, whatever the mutation's outcome. `repairRetained` in `hooks/lib/record-change.ts` reads whole lines only, so a last line without its LF stays where it is. It keeps every whole line that is no row and names the count in `detail`. `hooks/lib/__tests__/record-write.test.ts` (the legacy case): a retained row over a read-only log is reported as `repair: {retained: 1, …append failed…}`. `hooks/lib/__tests__/record-change.test.ts` (the delayed-logging case): a torn retained line is still in the file after the repair. Each was red against the unfixed code: the outcome carried no `repair`, and the pending file was deleted. The `bin/fusion-write` header's output list names the `retained=` line.

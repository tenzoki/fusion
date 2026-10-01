The citation sweep exits 1 on an internal error, which its exit table reads as a usage error
---
`hooks/citation-sweep.ts` ends with `process.exitCode = main(process.argv.slice(2));` and no `try/catch`. Any throw inside `main` leaves through Node's own exit 1 with a raw stack, which `bin/fusion-citation-sweep` documents as a usage error. Examples are a missing `codec/contract/transitions.json`, read by `readRecordIndex`, or an fs error in the corpus walk. Its siblings from the same plan catch the throw and exit 3.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-1446_*_a-crash-of-the-scope-or-order-entry-exits-1-which-the-wrappers-read-as-a-callers-mistake.md (same defect, fixed for scope and order), 260930-1451_*_plan-fj03b-observers-checkers-citations-and-the-monitor-on-json.md (step 4), 261001-0837-reviewer-fj03b-initialize-and-fj03c.md

Severity: Low. Scope: `hooks/citation-sweep.ts`, `bin/fusion-citation-sweep` (header).

**Evidence:**

- `hooks/citation-sweep.ts` last line: `process.exitCode = main(process.argv.slice(2));`.
- `hooks/plan-size.ts` wraps the same call in `try { … } catch (e) { … process.exitCode = 3; }`, with the comment "An internal error is 3 … never Node's own 1, which is the usage error here". `hooks/citation-check.ts` does the same.
- `hooks/lib/record-index.ts`: `JSON.parse(readFileSync(contract, "utf-8"))` with no guard.
- Measured in a scratch install without `codec/contract/`:
  - `fusion-citation-sweep --dry-run` exits 1 with an `ENOENT` stack.
  - `fusion-plan-size` exits 3.
  - `fusion-citation-check` exits 3.

**Fix direction:** wrap `main` as `plan-size.ts` does, with stderr saying nothing was swept. Add "or an internal error" to exit 3 in the wrapper's table.

**Acceptance:** a case in `hooks/lib/__tests__/citation-sweep.test.ts`, red against the current code. On a JSON workbench, with the transitions contract unreadable, the sweep exits 3, stdout is empty, and stderr names an internal error.

---
Resolved: `hooks/citation-sweep.ts` wraps `main` as `plan-size.ts` and `citation-check.ts` do. An internal error is exit 3, its stack on stderr, with nothing on stdout, since the census is printed only after every write. Exit 3 in the source's exit table and in the `bin/fusion-citation-sweep` header now names the internal error. `hooks/lib/__tests__/citation-sweep.test.ts` (the JSON stop case) makes `transitions.json` unreadable through a preload, and the sweep exits 3 with empty stdout. Red against the unwrapped entry: exit 1.

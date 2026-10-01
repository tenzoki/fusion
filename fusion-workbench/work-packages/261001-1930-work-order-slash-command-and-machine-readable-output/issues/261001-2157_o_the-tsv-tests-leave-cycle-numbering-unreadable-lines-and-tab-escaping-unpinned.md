The TSV tests leave cycle numbering, the #unreadable= lines and tab escaping unpinned
---
`hooks/lib/__tests__/fusion-work-order.test.ts` pins one whole TSV stream, but that fixture has a single cycle, no unreadable record, one unresolved entry and only backslash escaping. Several C2 clauses that `hooks/order.ts` `## The TSV format` states can therefore regress with the suite green. The implementation is correct today: verified by hand at `df38a5dd` over a scratch store with three cycles (one a self-edge), an unreadable record, three unresolved entries including a terminal target, and an entry with a literal tab.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261001-1934_*_spec-work-order-slash-command-and-machine-readable-output.md

**Unpinned clauses, each checked against the test file.**
- `cycle` as a per-cycle number. The one-cycle fixture can't tell `i + 1` from a constant `1`. A regression that numbers every cycle `1` passes.
- `#unreadable=` lines and their place after `#note=`. The literal test has `unreadable-head=0`, and the empty-store test has no unreadable record.
- The `unresolved` cell with more than one entry, i.e. ascending, de-duplicated and joined with `,`.
- Tab escaping (`\t`). Only `\\` is exercised. A tab inside an entry survives `headField`'s trim and reaches a cell. CR and LF can't reach a cell, because `headBlock` splits on LF and `trim` removes a trailing CR.
- A repeated `--format` as a usage error. The header names it and the usage-error test does not run it.

**Constraint.** The hook-test surface is at zero margin (22 281 of 22 281 lines at `df38a5dd`). Pinning any of these costs lines. One way that adds no line is to widen the existing literal fixture: add a second cycle, an unreadable record and a second unresolved entry with a tab to the same `scratch()` call and literal, by rewrapping existing lines. Otherwise the gap goes to the user as a head-room question. It is not a reason to edit a baseline.

**Acceptance test.** Each of these changes turns `fusion-work-order.test.ts` red, one at a time: (a) `cycleOf.set(m, 1)` in place of `i + 1`, (b) dropping the `#unreadable=` push in `renderTsv`, (c) dropping the `\t` replacement in `esc`. The surface-growth bound stays green.

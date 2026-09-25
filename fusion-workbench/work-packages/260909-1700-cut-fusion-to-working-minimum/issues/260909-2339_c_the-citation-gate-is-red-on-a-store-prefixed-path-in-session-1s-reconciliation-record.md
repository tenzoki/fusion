The citation gate is red on a store-prefixed path in session 1's reconciliation record

---

`npm test` in `hooks/` exits 1 on one case, in a file no code change touches:
`citation-sweep.test.ts` > `--dry-run over this repository's workbench reports
rewrites=0`. The one rewrite is in `260909-2309-reconciliation.md`, line 25,
which names an analysis by a store-prefixed path with an elided middle segment
rather than by the storeless basename the grammar resolves. The sweep classifies
it `bare-record=1` and would rewrite it.

The record is committed and unmodified in the working tree, so the gate was
already red before step B1 was dispatched. B1's own two files contribute zero:
`bin/fusion-citation-sweep --dry-run hooks/session-start.ts
hooks/lib/orchestrator-events.ts` reports the same single rewrite in the same
workbench record and none of its own.

It blocks every later step of the cut, because each one's acceptance is a green
suite.

**Evidence:** `bin/fusion-citation-sweep --dry-run` names the file and the count.

**Acceptance test:** `cd hooks && npx vitest run lib/__tests__/citation-sweep.test.ts`
is green, and `bin/fusion-citation-sweep --dry-run` reports `files=0 rewrites=0`
over the committed workbench.

---
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
Found at step B1 of the cut plan, whose file list does not include workbench
records, so the one-token fix was not made here.

---
Resolved: two citations repaired in `260909-2309-reconciliation.md` by the orchestrator, which is
the party that committed the record at `983c3cbb` and therefore introduced the defect. Line 25's
store-prefixed path with an elided middle became the storeless basename. Line 50 turned out to carry
a second instance the issue does not name: it spelled the `_c_` marker and elided the topic, which
the same grammar cannot resolve either. Both now take the form `## Filename Patterns` mandates.
`bin/fusion-citation-sweep --dry-run` over the committed workbench reports `files=0 rewrites=0`, and
`cd hooks && npm test` is green at 964 of 964.

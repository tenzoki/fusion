The playmaker writes a store-prefixed Circle citation into the portfolio it regenerates
---
`portfolio.md` line 107 carries `circles/260801-1244-curator/`. The store segment is exactly what `rules/circle-records.md` `### Citation form in the portfolio` forbids, and `hooks/lib/__tests__/workbench-citation-lint.test.ts` fails the whole suite on it. The gate carries no baseline and nothing to re-approve, by its own design.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** The playmaker run of 260904-1636 in session `260904-1050-orchestrator-session.md` regenerated the portfolio and reported the count itself: store-prefixed citations went from 0 in the file it replaced to 16 in the file it wrote. One of those tokens is in the live corpus the citation gate scans, and `cd hooks && npm test` has failed on it since 16:36. The same run also left rewrites in `260904-1636-playmaker-direct-dispatch.md` (8) and in the Circle record it appended to (1), measured by `bin/fusion-citation-sweep --dry-run`.

**Correcting the file is not the repair, and the rule says why.** `rules/circle-records.md` `### Citation form in the portfolio`: the portfolio is overwritten on every run, so "correcting one by hand buys nothing, because the next run writes the same form back over the correction". The defect is in what the agent writes. `agents/playmaker.md` is the file to change, and it is a growth-bounded surface, so the change is a rewrite rather than an addition.

**One thing the fix must not lose.** The same rule keeps a distinction the naive repair destroys: a pointer to a file gets `_*_` at the marker position, and a marker being *named as the subject of a statement* keeps its letter. Starring a statement deletes the statement. Whatever the playmaker is told, it has to keep that test rather than star everything that looks like a citation.

**Acceptance.** A playmaker run over this workbench produces a `portfolio.md` on which `hooks/lib/__tests__/workbench-citation-lint.test.ts` passes, and `bin/fusion-citation-sweep --dry-run` reports `rewrites=0` for `portfolio.md` and for the run's own history file. The `## Recently closed (_c_ / _b_)` heading and any warning whose subject is a transition still carry their marker letters.

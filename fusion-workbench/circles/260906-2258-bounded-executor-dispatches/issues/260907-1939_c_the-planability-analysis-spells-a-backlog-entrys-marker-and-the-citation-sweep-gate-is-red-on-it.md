The planability analysis spells a backlog entry's marker, and the citation-sweep gate is red on it

---

`npm test` fails for everyone on a citation in a committed analysis file. The record
`260907-0710-planability-of-the-bounded-dispatch-spec.md` cites the backlog entry
`260814-1733_*_bounded-executor-dispatches.md` with the marker letter spelled as `c`, twice, where
the mandated form carries `_*_` at the marker position. `bin/fusion-citation-sweep --dry-run` counts
both as `bare-record` rewrites, and `hooks/lib/__tests__/citation-sweep.test.ts` fails the suite on
any non-zero rewrite count over this repository's own committed workbench.

---

**Filed by:** coder, Kai Stalmann <ks@qantr.com>

**Measured, not inferred.** `bin/fusion-citation-sweep --dry-run` prints
`files=1 rewrites=2 residual=3032 record=0 circle-record=0 circle-dir=0 bare-record=2 stamp-bare=0`,
naming that file alone. The two tokens are at lines 21 and 331 of it.

**It predates the change that met it.** The same command was run with the working tree's three
modified prompt and rule files stashed and printed the identical summary line; the analysis was
committed in `b1e49fe0` and no later commit touched it.

**The fix.** Put `_*_` at the marker position in both tokens, per
`rules/fusion-workbench-conventions.md` `## Filename Patterns`. Do not run
`bin/fusion-citation-sweep --write` for it: the file is one file with two tokens, and the sweep's
guards and census exist for a corpus-wide run.

**Whose it is.** The analysis is an analyst's record inside this Circle; a coder correcting another
agent's record by hand is what the record-hygiene rules put on the writer, so it is filed rather
than fixed here.

---
Resolved: both tokens in `260907-0710-planability-of-the-bounded-dispatch-spec.md` now carry `_*_` at the marker position, at lines 21 and 331, repaired by the bugfixer dispatch recorded in `260908-0011-bugfix-planability-analysis-citation-marker.md`. Re-measured by this reconciliation on 2026-09-08: `bin/fusion-citation-sweep --dry-run` over this repository prints `files=0 rewrites=0 bare-record=0`, where the record was filed against `files=1 rewrites=2 bare-record=2` naming that file alone.

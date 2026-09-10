The citation-sweep gate is red at HEAD again, and the drift came from this Circle's own sessions
---
`citation-sweep.test.ts` asserts `rewrites=0` over this repository's committed workbench. At HEAD `91179f35` it reports `files=3 rewrites=9`. The same gate was repaired on 260904 and has drifted back, from records three sessions of this Circle wrote and committed.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260904-1839_*_citation-sweep-test-is-red-at-head-and-was-already-red-before-this-session-started.md (closed; same gate, same class, and its `Revised by:` note is what tells this reading from that one)

**Evidence, measured at HEAD.** `cd hooks && npm test` fails `citation-sweep.test.ts > --dry-run over this repository's workbench reports rewrites=0` with `files=3 rewrites=9`:

- `260910-0817-reconciliation.md` — 2
- `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md` — 2
- `260909-1331-orchestrator-session.md` — 5

All three are committed and none is modified in the working tree, verified by `git status --porcelain`, so the citations are at HEAD and not something the current session introduced. The suite was therefore already red when this session started, and no session report between those commits and now said so.

**Why the closed record does not cover it.** `260904-1839_*` was filed on a mis-measurement (installed sweep against a work tree one release behind) and its own `Revised by:` note establishes that the gate was green at that session's start and went red inside it. That is the same pattern repeating rather than the same instance: sessions write records, records carry a literal marker where the grammar wants `_*_`, the gate goes red, and the session that caused it does not run the gate before committing.

**The second finding, which is the one that recurs.** Nothing between writing a record and pushing it asks this question. `/fusion:cleanup` prints the citation checker's verdict, and it is advisory; the release process runs a coverage read and `claude plugin validate`, neither of which fails on a red `npm test`.

**Acceptance.** `cd hooks && npm test` passes `citation-sweep.test.ts` at HEAD, with the nine citations repaired to the storeless wildcard form per `rules/fusion-workbench-conventions.md` `## Filename Patterns`, and no fenced exhibit or statement-about-a-citation rewritten. Separately, the record names whether anything now catches this before a push, or states plainly that nothing does.

---

Reconciliation (260910-2020, reconciler): open on its second clause; the first is satisfied.
`cd hooks && npm test` is green at `07961552`, 895 tests in 52 files including
`citation-sweep.test.ts`, re-run in this pass. The nine citations were repaired by hand at
`e6a0dc67`, which is step C2b: the workbench was copied to a scratch repository, swept there, the
diff read, and the substitutions applied by hand, the sweep's own `--write` being forbidden while
pending changes touched what it reads. All nine were pointers; no fenced exhibit and no statement
about a citation was rewritten.

**The second clause — "the record names whether anything now catches this before a push, or states
plainly that nothing does" — is unmet, and the answer got worse in the same session.** One
mechanism still reports: the PostToolUse hook (`hooks/tracker.ts`, registered in `hooks/hooks.json`)
hands a record just written to the citation grammar and reports the retired forms on the lines that
call wrote. It blocks nothing. What went is the pre-push read: `/fusion:cleanup` printed
`bin/fusion-citation-check`'s verdict until step C4 (`115be68d`) reduced that body to commit and
push, and `grep -rn 'citation-check\|citation-sweep\|npm test' skills/*/SKILL.md` now matches only
a release note in the help body. So at `07961552` nothing between writing a record and pushing it
runs the gate, and the only thing that speaks at all speaks at the keystroke.

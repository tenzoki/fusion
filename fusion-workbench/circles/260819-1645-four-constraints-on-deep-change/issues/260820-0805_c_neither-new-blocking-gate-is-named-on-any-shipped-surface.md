# Neither new blocking gate is named on any shipped surface

---

This range arms two gates that can fail `npm test`, and neither is mentioned in `README-hooks.md`,
`README.md`, `CLAUDE.md` or anything under `docs/`. `grep -n 'committed-dist\|workbench-citation'`
over all four surfaces returns nothing.

Two places make the omission visible rather than merely tidy.

**`README-hooks.md` `### Rebuilding after TS changes` states the obligation and not the gate.** It
says the compiled `hooks/dist/` "has to match the sources exactly", explains why a stale output is
dangerous, and describes how `build` keeps the promise. It was written when nothing checked. A
reader now gets the obligation, the reasoning and the history, and no mention that the suite fails on
it — nor the fix line the failure prints, which is the same one the section already spells out in
prose.

**`CLAUDE.md`'s "Where to look when something breaks" table gains no row.** The workbench citation
gate is the one gate in this repository that goes red for somebody who touched no code and no
citation: an archive sweep or a newly filed record carrying a bad citation reddens it, and the
answering decision accepted that cost explicitly rather than mitigating it. That is precisely the
symptom that table exists for — a red run whose cause is not in the diff. The table carries sixteen symptom rows and most of them
are exactly this shape of surprise.

The failure messages themselves are good and were built as the teaching surface. They reach whoever
is already red. Neither reaches whoever is deciding whether to run `/fusion:cleanup`.

---

**Severity:** Low — no mechanism is wrong; a reader meets the gate at its failure and the failure
explains itself. What is missing is the sentence that would have let them meet it earlier.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `coder`
**Affects:** `README-hooks.md:386` (`### Rebuilding after TS changes`); `CLAUDE.md`
`## Where to look when something breaks`
**Cross-references:**
`circles/260819-1645-four-constraints-on-deep-change/decisions/260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md`
(the accepted cost that makes the `CLAUDE.md` row worth its bytes)

**Budget, since `CLAUDE.md` and `README-hooks.md` both sit outside the three bounded surfaces
`hooks/lib/__tests__/surface-growth-bound.test.ts` measures.** Neither addition costs a byte of any
armed budget. `README-hooks.md` is named in that test's own "what no bound covers" statement.

## Fix direction

One clause in `### Rebuilding after TS changes` naming the gate and what it prints. One row in the
`CLAUDE.md` table, whose symptom column is "`npm test` goes red on a citation in a record I did not
edit" and whose cause column names the gate, the corpus and the two remedies its message carries.

---
**Reconciliation 260820-0830** (reconciler, domain `code`, HEAD `04db0b0`) — **still open,
reproduces.** `grep -rln 'committed-dist\|workbench-citation-lint' README.md README-hooks.md
CLAUDE.md docs/` returns nothing. Two gates that can redden `npm test` for somebody who touched no
code and no citation are named on no surface a reader would reach first. Marker unchanged.

---
Resolved: both surfaces gained the text, and the count in the title moved from two gates to three
— `plan-stopping-section-lint.test.ts` was armed in this same Turn and is named alongside the other
two rather than left to be found later.

`README-hooks.md` gained a section, `### Three gates that can fail the suite over text nobody
compiled`, placed between `### Running tests` and `### Growth bounds on the shipped text`. It is a
three-row table naming each gate, what reddens it and what its failure prints, followed by the
paragraph the record asked for: the citation gate recomputes its corpus every run and carries no
approvable baseline, so an archive sweep or a newly filed record turns the suite red for somebody
who touched nothing, and that cost was accepted rather than mitigated. The section closes by
pointing at the growth bounds as blocking in the same way.

`### Rebuilding after TS changes` gained the clause the fix direction asked for: the obligation the
section already stated in prose is now a blocking gate, and the paragraph names the gate, what it
compares and the `npm run build` its failure prints.

`CLAUDE.md` `## Where to look when something breaks` gained one row, whose symptom column is
"`npm test` goes red on a citation, a plan or a compiled file I did not edit" and whose cause column
names all three gates, the citation gate's corpus and the two remedies its message carries, the
stopping-section gate's three failures and its presence-only bound, and the dist gate's two
separate cases with their two different remedies.

Neither file is inside any bounded growth surface, so the addition cost no budget.

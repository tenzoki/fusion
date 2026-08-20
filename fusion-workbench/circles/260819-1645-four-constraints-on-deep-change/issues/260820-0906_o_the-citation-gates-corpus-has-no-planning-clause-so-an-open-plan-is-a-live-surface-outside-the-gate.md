The citation gate's corpus has no `planning/` clause, so an open plan is a live surface outside the gate

---

**Domain:** code
**Filed by:** reconciler (reconciliation 260820-0830, HEAD `04db0b0`)
**Related:** `circles/260819-1645-four-constraints-on-deep-change/issues/260820-0805_*_the-citation-gates-corpus-excludes-only-archive-so-a-frozen-copy-tree-would-enter-a-blocking-gate.md` — the same constant, the opposite direction

---

## What is wrong

`corpusFiles()` in `hooks/lib/__tests__/workbench-citation-lint.test.ts` admits four things:
`portfolio.md`, a Circle record in any state, an issue carrying `_o_`, and a decision carrying `_o_`
or `_a_`. There is no clause for `planning/` in any marker state.

This Circle's Directive says the live surfaces carry no dangling citation **and** that a blocking
test holds them there. A plan carrying `_o_` or `_p_` is a live surface by every definition this
project uses: it is the document an executor is dispatched against, and `agentstate.yaml` points at
it by path. It is outside the gate.

## Measured, so that the size of the hole is not argued

Scanning the whole workbench outside `archive/` with `scanRecordCitations` at HEAD:

| Class | Files | Violations |
|---|---|---|
| the gate's corpus | 195 | **0** |
| plans, `_o_` or `_p_` | 0 | 0 |
| plans, `_c_` | 24 | 170 |
| backlog, `_o_` or `_p_` | 2 | 0 |
| decisions, `_i_`/`_s_`/`_d_` | 76 | 94 |
| issues, `_c_`/`_p_`/`_d_` | 411 | 365 |
| history, analyses, reviews | — | 1 585 |

**Nothing is dangling in a live surface today**, and that is the whole reason this is a latent defect
and not a red gate. Every plan in the workbench is `_c_`, so the class the predicate misses is
currently empty. This Circle's own plan carries zero violations, because the repair reached it even
though the gate does not.

The exposure begins the moment somebody writes the next plan. It will carry citations, it will be
live for the length of a Circle, and no gate will read it — while a closed issue that nobody will
open again is likewise unread, which is correct, and a `_c_` plan carrying 170 violations sits in
between and is out by the same silence rather than by a decision.

## Why this is not the same record as the `archive/`-only exclusion

`260820-0805_*_the-citation-gates-corpus-excludes-only-archive-…` says the corpus admits **too
much**: two unanchored predicates would pull a frozen copy tree into a blocking gate. This says it
admits **too little**. The two share a constant and nothing else — one is fixed by adding
exclusions, the other by adding a clause — and fixing either leaves the other standing.

## What would close this

A decision, then a clause. The decision is whether "live surface" includes a plan under work, and
whether it includes an `_o_`/`_p_` backlog entry (2 files, 0 violations today, also outside). The
clause is one regex beside the three that are there. Both belong to whoever answers the corpus
question next; this record does not pre-empt it, because widening a blocking gate's corpus is the
move the corpus decision `260819-1645` deliberately left as the user's.

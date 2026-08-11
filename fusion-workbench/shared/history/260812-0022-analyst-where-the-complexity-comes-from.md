# Analyst session: where fusion's complexity comes from, and what would have to go

**Date:** 2026-08-12 00:22
**Agent:** analyst
**Domain:** code
**Dispatched by:** orchestrator, on a user question
**Status:** Complete
**Output:** `shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md`

## What was asked

The user's reading is that fusion will not become stable, that continued building is the cause, and
that the question is how far the framework must be reduced. The dispatch asked for the analysis to
test the causal claim rather than confirm it, and to say something the project cannot already read
in its own rules.

## What was measured

- All 443 issue records across the shared store and twelve Circle stores, by filename stamp, marker
  and body. 90 drawn at random and read individually for classification.
- 71 decision records, 52 review files, 344 history files, 15 prior analyses.
- 540 commits; `git ls-tree` size snapshots of every shipped surface at 21 points since 2026-07-16.
- `orchestrator-events.jsonl` here and in krk; krk's 18 MB `.guard-state/events.jsonl`.
- The control project `/Users/k1/Projects/productive/krk`: 261 commits, 286 issue records, 6 Circles.
- The hooks suite and the rules-emission golden, both run to completion at HEAD.

## The findings, in one line each

1. The defect rate per commit did not rise. fusion files 1.37 records per commit, krk 1.10. The
   volume rose with throughput; the closure ratio is 91 percent and the median lag is zero days.
2. The largest defect class is prose contradicting the mechanism it describes: 44 percent of the
   sample, with a 34 to 55 percent interval. Ordinary code faults are 23 percent.
3. 96 percent of records citing a commit cite one made within a day. `coderev` filed 159 of the 272
   attributed records. **One record in the whole history was filed by the user.**
4. `agents/orchestrator.md` doubled in 36 hours to 164,716 bytes, 41 percent of all agent prose.
5. The classifier deletion removed 3,597 source lines on 7 August and the tree stood above its
   pre-deletion peak by 11 August. Removal works and does not bind; the addition rate does.
6. Eleven mechanisms carry no evidence of a real catch. The Plane mirror has never pushed once.

## Two claims corrected before the report was finalised

- An earlier draft said krk had deleted `agentstate.yaml`. It is deleted by `/fusion:cleanup` at
  session end by design, so its absence means no session is active. Corrected.
- Domain-value totals were stated as 561 uses; 534 is the count of valid values. Corrected.

## Nothing filed

Seven records could have been filed from the removal list. Six are decisions for the user rather
than defects for an executor, and filing them would add to the 75-record backlog that prompted the
question. The one already correctly filed is `shared/issues/260811-1734_o_reduce-the-surface-…`.

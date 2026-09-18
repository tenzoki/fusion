Two clauses disagree on where a prior curator run file is found

---

`### The suppression read` says prior run files are read across `$WORKBENCH` and explicitly not through `$SCAN_ANALYSES`, giving the measured reason. `## The run file` still resolves the previous run through `$SCAN_ANALYSES` for the same corpus.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

## The defect

`agents/curator.md` `### The suppression read, and the candidate row first` (new in this range):

> Read every prior curator run file across `$WORKBENCH`, **unbounded by the evidence anchor and not through `$SCAN_ANALYSES`**. … `$SCAN_ANALYSES` resolves to the claimed item's container plus the shared store, so a run file written while a different item was claimed sits outside it and its refusals vanish silently.

`agents/curator.md` `## The run file`, item 1 (unchanged):

> **Head** — date, a `**Status:**` field, the git HEAD the run read, the mode, and the date and HEAD of the previous curator run if one is findable across `$SCAN_ANALYSES`.

Same corpus, two discovery rules, and the new clause states in its own words why the old one is wrong.

## The measurement

`bin/fusion-paths curator` resolves `SCAN_ANALYSES=circles/260917-2253-depends-on-edges-proposed-and-confirmed/analyses shared/analyses`. Prior run files in the tracked tree:

```
$ git ls-files ':(top)fusion-workbench/**/*curator-run*' | wc -l
14
```

Two of the fourteen sit inside `$SCAN_ANALYSES`; the other twelve sit in `shared/history/` (7) or in other items' `analyses/` and `history/` directories (5). So the head field names the second-most-recent run of this one item as "the previous curator run", while the suppression read three sections above has just read all fourteen. `260918-0738-curator-run.md` §3e measured the same split at the time (12 files, 7 outside).

## Acceptance test

`agents/curator.md` names one discovery rule for prior curator run files, and `## The run file`'s head field uses it.

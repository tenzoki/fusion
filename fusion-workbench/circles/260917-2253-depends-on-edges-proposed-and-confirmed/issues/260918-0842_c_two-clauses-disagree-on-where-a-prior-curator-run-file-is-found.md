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

Resolved: the stale clause was brought onto the measured rule, not the other way round. `agents/curator.md` `## The run file`, item 1 no longer resolves the previous run through `$SCAN_ANALYSES`. It now reads: "**A prior curator run file is found one way in this prompt and this is it**: across `$WORKBENCH`, never through `$SCAN_ANALYSES`, which resolves to the claimed item's container plus the shared store and so misses every run file written while a different item was claimed, which on fusion's own tree is all but two of them. `### The suppression read, and the candidate row first` reads the same corpus by the same rule and states the measurement."

`### The suppression read` is unchanged — it was the correct clause of the two and it carries the measurement. What moved is the head field, which is the clause the record names. The split was re-derived at the working tree rather than copied: `git ls-files ':(top)fusion-workbench/**/*curator-run*'` returns 15 today, of which 2 sit inside the resolved `$SCAN_ANALYSES` value; the figure is written as "all but two" rather than as a pair of counts, so the sentence does not go stale the next time a run file lands. Acceptance test met: one discovery rule for prior curator run files, and the head field uses it.

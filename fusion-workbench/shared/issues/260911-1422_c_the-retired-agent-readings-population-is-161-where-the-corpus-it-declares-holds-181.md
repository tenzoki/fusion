The retired-agent reading's population is 161 where the corpus it declares holds 181

---

`260911-1316-five-retired-agents-and-the-container-contradiction-read-site-by-site.md` states its population as 161 occurrences over 103 lines in 36 files, measured over a named corpus at `fdac1cb0`. The same grep over the same corpus at the same commit returns 181 over 113 lines in 38 files. The figure was derived by adding three corrections to an earlier unverified 148 rather than enumerated, which is what `rules/critical-stance.md` §5 forbids. Two closure notes restate it.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260910-2146_*_five-deleted-agents-are-still-named-as-live-in-twelve-shipped-files.md` (terminal; its `Resolved:` note carries the same three numbers); `260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md` (the norm)

**The measurement**, run over the exported tree of `fdac1cb0` and of `9ceb5cc7`:

```
grep -rioE 'coderev|ontorev|bugfixer|taskplanner|playmaker' \
  rules agents skills docs README*.md CLAUDE.md hooks/lib bin install.sh templates .claude-plugin
```

| commit | occurrences | lines | files |
|---|---|---|---|
| `fdac1cb0`, as the analysis declares its corpus | 181 | 113 | 38 |
| `fdac1cb0`, as the analysis reports it | 161 | 103 | 36 |
| `9ceb5cc7` | 169 | 103 | 35 |

**What the 20 are, and why the shortfall is the arithmetic rather than the corpus.** Exactly two files account for the whole difference: `docs/upgrading-to-v11.md` (13 occurrences over 5 lines) and `hooks/lib/__tests__/fixtures/dispatch-path.baseline` (7 over 5). The second is named in the analysis as one of the two gaps that make its own count higher than the dispatch's, so it is inside the declared corpus by the analysis's own argument and still absent from the total. The chain is visible in the report's own table: 148, then 151 for case, then 161 for `bin/` plus the baseline. The 148 it starts from reproduces under no formulation tried here; a direct case-sensitive run over the smaller corpus at that commit returns 175.

**What is not wrong.** The three-way split survives the correction. The 20 uncounted occurrences are all sentences whose subject is a removal, dated by their own heading or written in the past tense, so they fall in the kind the analysis leaves alone. The corrected split is 43 values a program consumes, 126 sentences true at HEAD, 12 false and repaired. The 12 is independently confirmed by the delta: 181 at `fdac1cb0` minus 169 at HEAD. No repair landed on a site it should not have, and no false-at-HEAD claim about the five names was found surviving in `rules/`, `agents/`, `bin/`, `README*.md`, `CLAUDE.md` or `docs/`.

**Why it is filed rather than corrected in place.** The report is an analysis, which carries no state marker and is not a tracking file a reconciliation pass may edit, and the closure note that restates the figure sits on a terminal record. Both are evidence. What a later reader needs is a record saying which number to use.

**Acceptance test:** the three numbers are corrected at their authoring site, or a reader arriving at either site is pointed here. The command above is stated with its result at a named commit, so the next pass re-runs rather than re-derives.

---
Resolved: not a defect. The reading's 161 / 103 / 36 is correct and this record's 181 is the same corpus measured with a pattern carrying no word boundaries. `coderev` is a substring of `codereview` and `ontorev` of `ontoreview`, the two review folder names retired on 2026-08-15, and the 20 extra hits are exactly those two names in sentences about directories. Measured at `fdac1cb0` with `/usr/bin/grep`, varying only the `\b` anchors: 161 with them, 181 without, and `(codereview|ontoreview)` returns 20 on its own. A per-file reconciliation of the reading's kind tables against a boundary-correct count returned zero mismatches across all 36 files, so the three kind-counts 12 / 43 / 106 stand as written. The diagnosis this record offers — that `docs/upgrading-to-v11.md` (13) and `hooks/lib/__tests__/fixtures/dispatch-path.baseline` (7) are missing from the total — is also wrong: both are inside the 161 and appear in the reading's own kind-C table. They match only because they are the unique two-file subset summing to 20, which is what made the wrong figure convincing. The hazard itself is filed as `260911-1511_*_coderev-is-a-substring-of-codereview-so-a-sweep-without-word-boundaries-counts-two-retired-folder-names-as-agents.md`.

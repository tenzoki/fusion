`CLAUDE.md`'s troubleshooting pointer asserts nineteen symptom rows and the table it points at has seventeen

---

`CLAUDE.md:66` reads *"The nineteen symptom rows — what each failure looks like and what causes it — are in `README-hooks.md` `## Where to look when something breaks`."* The table there has **17** data rows.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

**Evidence.** Measured at `7ea6e40b`:

```
awk '/^## Where to look when something breaks/,/^## Origin/' README-hooks.md \
  | grep '^| ' | grep -v '^| Symptom' | wc -l     # 17
```

The same count over `git show 99fbaa8a:CLAUDE.md` is 17, so nothing was dropped in the move — the figure was wrong when it was written. Its provenance is traceable: `260916-1058_*_spec-human-facing-docs-leave-claude-md.md` measures the section as *"9 648 across 19 table rows"*, which is a row count that includes the header row and the `|---|---|` separator. The pointer line inherited that 19.

This is newly authored pointer text, not relocated text: the passage that moved (`L22`) is the table itself, and `260916-1612-curator-run.md` `### L22` records the pointer as a new line. The run file states the same figure at line 147 (*"L22 (nineteen non-obvious failure modes)"*).

It is a bare cardinality beside a list that is not in the same file, which is the shape `rules/critical-stance.md` §5 names, and the one surface the whole work item exists to make trustworthy.

**Scope.** `CLAUDE.md:66` only. No other shipped file states this count (`grep -rn nineteen` over the tree outside `fusion-workbench/` returns this one line).

**Acceptance test.** The digit in `CLAUDE.md`'s troubleshooting pointer equals the data-row count of `README-hooks.md` `## Where to look when something breaks`, or the sentence stops stating a count. Whichever lands, re-derive it with the command above rather than reading a figure out of a record.

**Cross-references:** 260916-1058_*_spec-human-facing-docs-leave-claude-md.md, 260916-1612-curator-run.md

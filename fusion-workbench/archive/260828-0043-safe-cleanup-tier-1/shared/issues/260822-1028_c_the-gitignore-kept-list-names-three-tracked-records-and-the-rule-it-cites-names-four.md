The .gitignore's KEPT list names three tracked workbench records and the rule it cites names four
---
The `fusion-workbench` block in `/Users/k1/Projects/productive/fusion/.gitignore` carries the line
`# KEPT: orchestrator-events.jsonl, portfolio.md, .fusion-setup.` Its cited authoring home,
`/Users/k1/Projects/productive/fusion/rules/workbench-tracking.md`, classifies five entries as
records: those three plus `.guard-state/events.jsonl` and `.asset-provenance`. The block explains
the fourth at length in the paragraph directly beneath the KEPT line, which is why its absence from
the list is deliberate and correct. `.asset-provenance` is explained nowhere and named nowhere, and
it is tracked: `git ls-files fusion-workbench/` returns `.asset-provenance`, `.fusion-setup`,
`orchestrator-events.jsonl` and `portfolio.md`.
---
Nothing is broken today. The ignore block only *excludes* live state, so a record that no line names
is tracked by default, which is the outcome the rule asks for. The defect is the enumeration: a
reader who takes the KEPT line as the list of tracked records gets three of four, and the omitted one
is the record whose loss the rule file calls out by name ("Losing `.asset-provenance` is not neutral
either: every asset it covered falls back to 'fusion cannot tell an adaptation from a stale copy'").

Found while shaping the multi-user request of 260822, which proposes moving several currently
ignored entries into the repository and will rewrite this exact block. Correcting the list before
that rewrite costs one line; correcting it afterwards means reconstructing which omissions were
intended.

Verified at HEAD `370bfc5` by reading `.gitignore`, `rules/workbench-tracking.md`, and the output of
`git ls-files fusion-workbench/`.

---
**Resolved 260823-0841-coder-portfolio-leaves-tracking.md** (coder, Circle `260823-0023-settle-what-travels-between-checkouts`, plan step 2).
The `KEPT:` line now reads `orchestrator-events.jsonl, .fusion-setup, .asset-provenance`, and those
are exactly the three entries `git ls-files fusion-workbench | awk -F/ 'NF==2'` returns. The
omission this record names is repaired by the third of them.

**The count moved from four to three, and the enumeration is not the whole reason.** This record was
written against the two-group split, under which `portfolio.md` was a record and the corrected list
would have named four. Step 1 of this Circle replaced that split with the four-class partition of
`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `## The state partition`,
which puts `portfolio.md` in class L: it is regenerated in full on every playmaker run, so a
committed copy is a briefing about what one checkout had pulled at the moment it ran. So this step
did both halves at once — `git rm --cached fusion-workbench/portfolio.md` took it out of the index
and left the working-tree file untouched, an ignore line beside `monitor` keeps it out, and the
`KEPT:` line names the three that are left. A reader who takes that line as the list of tracked
records now gets three of three.

The paragraph beneath it is unedited, as this record asked: `.guard-state/events.jsonl` is still
deliberately absent from the list, and the archive roll is still what preserves it.

Verified after the change: `git ls-files fusion-workbench | awk -F/ 'NF==2'` returns
`.asset-provenance`, `.fusion-setup` and `orchestrator-events.jsonl` and nothing else;
`fusion-workbench/portfolio.md` still exists on disk at its pre-change size;
`git status --porcelain fusion-workbench/portfolio.md` prints nothing.

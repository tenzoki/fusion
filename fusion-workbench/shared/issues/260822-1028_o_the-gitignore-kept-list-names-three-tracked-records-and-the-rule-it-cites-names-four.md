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

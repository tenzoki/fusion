
## gitattributes — the union merge driver for the event log

`fusion-workbench/orchestrator-events.jsonl` is the one workbench file every checkout appends to, so git's default text merge turns two checkouts' sessions into a conflict nobody should resolve by hand. This step asks git whether a merge driver already applies there and declares `merge=union` only where none does. `rules/workbench-tracking.md` `## The event log carries a union merge driver` holds the reasoning, including why the question is `git check-attr` and never a text search of `.gitattributes`; do not restate it here.

Stash manifest: the conventions say "nine fields" and list ten

---
`rules/fusion-workbench-conventions.md` `## Stashes` states a nine-field manifest schema and then lists ten fields. The layout diagram carries the same stale count (`# nine-field index`).

The arithmetic that produced "nine" came from the plan: ten fields minus `has_spec_plan` equals nine. It did not account for the conventions also splitting `original_circle_filename` into `original_circle_dirname` + `original_circle_record`. So: 10 − 1 + 1 = 10.

Both new fields are necessary and neither should be dropped to reach nine — `circle-pop` needs the dirname to place the restored directory and the record filename to know the marker.

P-4 implemented the ten listed fields and deliberately wrote no count into the skill prose: the list is the schema, the count is a summary that can go stale, and this is what going stale looks like.

**Fix:** correct the two counts in the conventions to match the list.

Also noted by the same coder, pre-existing and separate: `original_circle_dirname` and `active_circle_content` always hold the same value. Worth deciding whether both need to exist, but that is a schema question, not this typo.

---
Cosmetic. Found by `coder` during task P-4 while implementing the schema against the document.
Source: fusion-workbench/planning/260716-1910[p]-plan-workbench-umbau-circle-container.md

---
Reconciliation 260731-2324 (reconciler, domain `code`) — **confirmed still live, stays `_o_`.** `rules/fusion-workbench-conventions.md:609` reads "Nine fields, in this order:" and the YAML block beneath it carries ten keys (`stash_id`, `timestamp`, `reason`, `original_circle_dirname`, `original_circle_record`, `active_circle_content`, `head_short_hash`, `git_stash_ref`, `git_stash_sha`, `has_agentstate` — counted mechanically, = 10).

Worth recording because this session **edited that same file** (`8c1c9f8`, the cadence registration: a `Cadence digest` table row, an append-vs-overwrite paragraph, and one word in the state-marker sentence) without touching the manifest section. Not a regression and not a missed opportunity in scope — the cadence task had no reason to go near it — but the issue has now survived a doc-editing commit, which is the situation in which it is most likely to be fixed cheaply.

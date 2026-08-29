# Upgrading to v10.14 (from v10.8)

One consolidated note for 10.9.0 through 10.14.0 — the conditioning-load releases. Nothing here rewrites a project file, and no migration step is required; what changes is what agents load, when reviews run, and how fast cleanup is.

## What you will notice

- **One review pass per Circle, at its closure** (10.14.0, decision `260827-1120_*_how-often-does-the-review-pass-run.md`). The per-Turn coderev/ontorev dispatch is retired; the Turn keeps a cheap coverage read, and the Circle's one dispatch at closure is scoped by `bin/fusion-review-coverage` — every uncovered commit plus the carried `Not-opened:` list, so multi-session Circles stay fully tiled. Findings land as issues at closure instead of feeding the next Turn's queue; coverage stays advisory (`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`).
- **Cleanup is incremental** (10.8.1). The reconciler dispatch is skipped on a proven `changed=no` over the tracking corpus, its inventory reads live-marker records plus what actually moved, the curator's evidence pass is bounded by its previous run (`--full` forces the old behaviour; decision `260827-0745_*_may-the-curators-evidence-pass-be-bounded-by-its-own-previous-run.md`), and the activity log appends by high-water date. Anchors live in `fusion-workbench/.cadence-anchors`, per checkout.
- **Leaner conditioning on every dispatch.** The style profiles were condensed to a fraction of their size (same rules, one sentence each), and four rule texts left the always-on floor for the agents whose act they govern: the worked decision transitions (gate `260827-0830_*_do-the-decision-record-worked-examples-stay-on-the-always-on-floor.md`), the full user-facing style contract (gate `260827-0910_*_does-every-dispatch-carry-the-full-user-facing-style-contract.md`), the language cascade (to the editor) and the backlog mandate (to the playmaker; decision `260827-1056_*_which-parts-of-the-language-and-backlog-rules-does-every-dispatch-still-carry.md`). Every other agent keeps the operative cores in the conventions. A coder dispatch's rule block dropped from ~102 KB to ~66 KB across these releases.
- **A new always-on norm**: critical-stance §5 — a cardinality is enumerated, derived, or commit-stamped, never asserted bare (decision `260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md`, answered with the measurement that ruled a lint gate out).
- **Setup will offer to refresh your stilwerk profiles once** — the shipped profiles changed shape; "keep mine" remains the answer for a profile you edited.

## Verify after updating

`fusion --update`, restart, run one session: dispatch rows in `fusion-workbench/orchestrator-events.jsonl` carry `person`/`checkout`/`session_id` (v10.8 machinery), a backgrounded dispatch's `task_done` arrives minutes after its `task_start`, and `/fusion:cleanup` on a quiet tree skips the reconciler and finishes in a fraction of the old time.

The v10.8 note (`docs/upgrading-to-v10-8.md`) covers the machine-written event rows in detail.

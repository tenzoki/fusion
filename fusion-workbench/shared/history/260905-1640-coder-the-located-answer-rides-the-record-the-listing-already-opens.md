# coder — a located answer rides the record the listing already opens

**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Status:** Complete
**Circle:** none active (no `.active-circle` pointer in this checkout, so `bin/fusion-paths` resolved `$OUT_HISTORY` to `shared/history`)

## What was dispatched

`260905-1105_*_a-located-answer-reaches-the-user-only-if-somebody-reads-the-reconciliation-log.md`. The reconciler reports an already-written answer to an open decision in its log and moves no marker, by the ruling of `260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`. The orchestrator's Phase 1 step 3 lists open decisions to the user and reads no log. The join had to survive between sessions.

## Where the join lives, and why

**On the decision record itself**, as a last line `Answer located: <citation> — <one-line summary>`, written by the reconciler with no rename, and read by the orchestrator when it lists the record.

It survives because it is in the record, which is the thing that is archived, moved and cited as a unit. It costs no new read: Phase 1 step 3 already globs `*_o_*.md` across every decision store, so the only new act is opening a file it already enumerates, bounded by the number of open decisions. And it cannot dangle against a record that no longer exists, because it travels inside it.

The two alternatives fail on reachability, not on durability. A note in the reconciler's history file persists on disk and is never opened again — the next session's listing reads decision records, not logs, which is the defect restated rather than repaired. Telling the orchestrator to search history files for such a note replaces one read of a known file with a scan of a store that grows without bound, and puts that scan in every session for a case that is rare; it also has to guess which log holds the note, since nothing links a decision to the pass that found its answer. A third shape considered and dropped: a workbench-root join file. It survives and reads cheaply, but it is a second store nobody archives, it drifts against the records it points at, it needs its own class in `rules/workbench-tracking.md`, and it can outlive the record it names.

**Why the note is not the transition the morning's decision reserved.** That record's Constraints bind the marker and the `Answered:` footer, both of which pair with `_a_`. They say nothing about an annotation, and the reconciler's own `_o_`-with-no-answer branch already writes reconciliation evidence onto an `_o_` record, so writing evidence there is sanctioned behaviour rather than a new licence. The `Retired:` line in `rules/fusion-workbench-conventions.md` `### Decision files` is the established shape for an annotation that renames nothing. The distinction is stated in the prompt rather than left to be inferred, because collapsing the two is exactly the failure the dispatch warned about: the note points at text somebody else wrote and leaves the question open, where the transition asserts a ruling. Both prompts now say the decision stays open and the user still rules, and may rule against what the located text says.

The reporting bound that made the reconciler's pass defensible is carried forward verbatim: it reports an answer that already exists elsewhere and records where it is, and never supplies one.

## The two passages

`agents/reconciler.md`, the `_o_` branch of the decision-marker pass, was one paragraph ending in a reconciliation-log instruction that cited `<path>:<line>`. It is now that paragraph plus two sub-bullets — the record note and the log entry, named as having different readers — and a closing line mandating the anchor form for both citations. The `<path>:<line>` it used to mandate went with the rewrite; `260905-1228_*_does-a-resolution-line-cite-path-line-or-a-heading-anchor.md` settled the anchor earlier the same day and this line had not caught up.

`agents/orchestrator.md` `## Phase 1: Work Queue Construction` step 3 is unchanged and gained a following paragraph: read each record listed, and where an `Answer located:` line is present name its citation beside the question. A record with no such line lists exactly as before.

## The growth bounds

`agents/` had 8 009 free bytes. The two edits spent 1 975 — `agents/reconciler.md` +1 187 (21 638 → 22 825), `agents/orchestrator.md` +788 (150 287 → 151 075) — leaving 6 034. No baseline was edited. The hook-test surface had 1 free line and no test was written; a new test was not available at that head-room and none is claimed.

## Left standing, named rather than fixed

Two movement-recording pins are stale and were left as the dispatch directed, so `npm test` exits 1 on them alone. Neither is a bound and neither reports a defect in this change.

`hooks/lib/__tests__/fixtures/surface-growth.golden` records the two new file sizes and the new total 411 809. The bound it sits beside passes on its own arithmetic. `UPDATE_SURFACE_GOLDEN=1 npx vitest run lib/__tests__/surface-growth-bound.test.ts` regenerates it and moves no baseline.

`BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` moves paths 1591 → 1593 and anchors 219 → 221, `stampBare` unmoved at 13. The share was measured by single-file revert against HEAD, as that pin's own protocol requires: with `agents/reconciler.md` alone reverted the gate resolves 1592/219, so its share is +1 path and +2 anchors; with `agents/orchestrator.md` alone reverted it resolves 1592/221, so its share is +1 path and no anchor; with both reverted it resolves 1591/219/13 and the gate passes, so the two shares sum with no overlap and no share is owed to any other file. The reconciler's are `fusion-workbench-conventions.md` `### Decision files` and `agents/orchestrator.md` `## Phase 1: Work Queue Construction`, each a rooted heading registering as one path and one anchor, less one path already carried on a line at HEAD; the orchestrator's is `agents/reconciler.md`, cited with no adjacent heading.

One defect in the first draft was caught by the gate and fixed rather than pinned: the restructure put the `260905-1042_*_…` stamp on the same line as `$SCAN_ANALYSES`, which `reference-resolution-lint` reports because it tells a consuming agent to open, in its own workbench, a record that exists only in fusion's. The citation moved to the sub-bullet that argues the distinction, where it belongs.

The issue was left at `_o_`: the dispatch conditioned its close on a passing run.

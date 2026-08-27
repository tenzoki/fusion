# The playmaker's ranking rewards a stale Grounding, because no criterion asks whether the Directive is still true

---
**Filed by:** orchestrator, after `/fusion:next` recommended the same Circle for the third consecutive run and a re-measure found its Directive true of almost nothing
**Cross-references:** the Circle recommended three times and its cycle partner, two anticipated (`_a_`) records that live in the *consuming project's* workbench, not this one — stamps `260809-2244` (slug `close-stale-rule-citations`) and `260809-2245` (slug `sweep-retired-strategy-from-go-tree`) — together with that project's playmaker run of 260826-1329 that recommended them · `fusion-workbench/portfolio.md` `**Generated:** 260826-1335` · `fusion-workbench/shared/issues/260811-1858_*` and `260815-1344_*` (two other records today whose stated ground had expired unnoticed — the same shape at record level)

---

## What is wrong — and this is a fusion defect, not a project one

`agents/playmaker.md` Step 3 ranks anticipated Circles on three criteria: the count of `_o_` decision records cited in the Grounding snapshot (lower is better), whether every dependency is `_c_`, and a domain signal. **None of the three asks whether the Directive is still true.** A Circle whose cited defects have all been closed and archived scores *best* on the first criterion, because closed records are not `_o_`, and best on the second, because its dependencies are done. The heuristic cannot tell "ready to run" from "already run".

Step 2 then forbids the one cheap check that would have caught it:

> Do not exceed this read scope. Playmaker is a portfolio agent, not a re-analyst — read enough to rank, no more.

The sentence has a sound reason: the agent should not re-analyse the codebase on every run. But the check it forecloses is not analysis. It is opening the cited defect records and reading the marker on the filename — a `find`, not a study.

## What was measured (2026-08-26, HEAD `0b165ccd`)

The Circle stamped `260809-2244` (slug `close-stale-rule-citations`; it lives in the consuming project's workbench, not this one) was recommended on three consecutive runs. Its Directive and Grounding snapshot were written at `147575d4` in early August. On 2026-08-14 a tier-1 cleanup archived and closed six of the nine defect records it cites, and the substitutions those records carried had landed with them:

| The Directive claims | Measured at `0b165ccd` |
|---|---|
| thirteen files cite retired `ARCH-H12` as binding | the record's own reproduce command returns **0** text lines |
| three rule bodies need repair in place | `READER-ABSTRACTION-RULES.md`: 0 refs; `ONTO-ENG-RULES.md`: 2, both describing the retirement correctly |
| two "protected surfaces" need a Human Gate under `FUSION_ALLOW_RULES_WRITE=1` | the guard, the flag and the file ceased to exist at fusion 8.1.0 (`hooks/guard.ts:29-36`) |
| six of nine cited records | all `_c_` under `archive/260814-1500-safe-cleanup-tier-1/` |

What actually remains, per the shaper's re-measure: eight false present-tense statements in two skill files, ordinary agent work with no gate. The sibling `260809-2245` claims "93 lines across 24 files" name the retired strategy as existing; the tree has 12 files, and every sampled line reads as retirement history.

The playmaker's own rationale for the recommendation was, verbatim in spirit: *cites no open decision, dependencies settled, replacement text already on disk.* All three true. All three are exactly what a finished Circle looks like.

**The `## Dependencies` section is the second symptom of the same cause.** It cites `circles/260809-2243-…`, which is archived, and names the retired `FUSION_ALLOW_RULES_WRITE` precondition. The dependencies-closed flag reads "archived" as "resolved" and moves on. Nothing reads the flag's *meaning*.

## Why this is worth a record and not a prompt patch

The same shape appeared three times in one day at different levels. `260811-1858` was classed `describing` on a stated ground ("the field has no reader") that expired when the field got one. `260815-1344` described a defect that a later session rediscovered from scratch because nothing surfaced the open record. And here, a Circle's Grounding carried the date of its own expiry and the ranking read past it. In each case the knowledge was in the tree and the mechanism that should have used it did not look. A fix to the ranking alone treats one instance.

## What resolving this looks like

A fourth criterion, and a carve-out in the read-scope sentence. The design questions — what counts as stale, how deep the check may go, and whether a stale Circle *drops* in rank or gets a *warning* — are a decision, not an edit:

- **Grounding-staleness signal.** For each `_a_` Circle: how many of the records its Grounding cites are `_c_`, `_s_`, `_d_` or under `archive/`, and how far HEAD has moved since the snapshot's recorded HEAD. A Circle most of whose cited records are closed is more likely *done* than *ready*.
- **The read-scope carve-out, stated.** Reading a cited record's marker is ranking, not analysis. The sentence should say so rather than leave the agent to decide it is forbidden.
- **Output as a warning, not a demotion.** `stale-grounding` beside `dependency-cycle-detected` in `## Warnings`, with a recommendation to re-sharpen via the shaper's portfolio-activation mode before activating. Demoting it silently would hide a Circle that might still hold real work — which 2244 does, eight lines of it.
- **Dependencies that resolve to `archive/`** should be reported as such, not read as closed.

The decision that settles the design belongs under `$SCAN_DECISIONS` of the fusion repository, not this project's. This record is filed here because this is where it was measured.

## Verification

A Circle whose Grounding cites only archived records, run through `/fusion:next`, appears in `## Warnings` with `stale-grounding` and is not the top recommendation on that ground alone. A test that constructs a fresh Circle and checks it is *not* flagged proves nothing.

---
Class: internal
Site: `agents/playmaker.md` Step 3 (grep key: `Unresolved-decision count`) in the installed fusion plugin at `$FUSION_PLUGIN_ROOT`, and its Step 2 read-scope sentence (grep key: `not a re-analyst`). The class is `internal` rather than `user-visible`: nothing the product ships reads the portfolio, and the consumer is a developer at `/fusion:next`. It changed the outcome of a command in this repository three runs in a row, which is the `T3` test. It carries no must-reach-zero obligation. It is a fusion defect measured in a consuming project; the site is in the plugin, not this tree.
Classified: 260826-1400 at HEAD 0b165ccd, by orchestrator

---
Resolved: 260827-1840, coder, plan step 17 of `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/planning/260827-1756_*_repair-the-twenty-open-defect-records.md`, per decision `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/decisions/260827-1756_*_does-the-playmaker-rank-a-circle-whose-grounding-has-gone-stale-and-how-is-stale-read.md` option 1. `agents/playmaker.md` now carries: a Step 3 stale-Grounding count (cited records terminal by filename marker or resolving under `archive/`, plus the HEAD distance past the snapshot commit; threshold half or more; rank unchanged), the `stale-grounding: <circle-dir>: <n> of <m> ...` warning line in Step 4 with the re-sharpen recommendation, the `## Warnings` roster naming it, the archive-resolving dependency reported as `archived` and never closed, and the read-cap carve-out stating that a marker read or a `find` is ranking, not analysis. The runtime acceptance this record states (a `/fusion:next` run showing the warning) belongs to the next session after `fusion --update`, since the session that edits the prompt dispatches the installed copy (`CLAUDE.md` `## Release process`, the two-session shape). Edited at HEAD d49e258, uncommitted at the time of this note.

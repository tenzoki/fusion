# coder — Setup's resume summary loses a bullet, and its bracket probe gains a tree bound

**Status:** Complete
**Date:** 260816-0058
**Agent:** coder
**Source records:**
- `fusion-workbench/circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1631_c_setups-resume-summary-still-asks-for-diverging-rows-that-no-step-produces.md`
- `fusion-workbench/circles/260805-2005-textschicht-gegen-code-nachziehen/issues/260806-0022_c_setup-klammer-probe-und-migrate-reformat-decken-verschiedene-baeume.md`

**Files changed:** `skills/setup/SKILL.md` (-60 B), `skills/migrate/SKILL.md` (+7 B). Net -53 B on the `skills/` growth-bounded surface.

## Defect one — a summary bullet asking for output no step produces

`skills/setup/SKILL.md` required the interrupted-session summary to present "**Every diverging row
from step 2**, each naming the surface, what it says, and the record that contradicts it." The step
that produced those rows was `bin/fusion-state-drift`, a comparison of hand-written counters against
git; step P-11 replaced it on 2026-08-15 with a shell block emitting two plain figures, because the
counters it compared had been removed. There is no surface, no contradicting record, and nothing
that can diverge.

**Deleted rather than reworded.** The record and the dispatch both allowed a one-sentence
replacement saying the saved state no longer carries a figure that can be distrusted. That sentence
is already in this file, two paragraphs above, at the sub-step that emits the figures: *"The saved
state carries no counters — it never carries a number that could be stale, because the fields that
could be were removed on 2026-08-15."* Restating it inside the summary list would put a claim about
the state file where the list should only name what the step produces. `agents/orchestrator.md`
carries the same summary list and P-11 dropped the bullet there outright; the two resume paths now
agree again. -190 B.

## Defect two — two probes covering different trees, and a deadlock rather than a false positive

Setup's bracket-marker probe walked the whole workbench minus three `-not -path` exceptions
(`archive/`, `stashes/`, `.migration-v2-backup/`). Migrate's reformat pass converts `shared/` at any
depth and `circles/` from depth 2. A bracket-marked file anywhere else made Setup refuse permanently
and routed the user to a migration that reported nothing to do.

**Direction taken: narrow Setup's probe** to the union of trees migrate actually converts. The probe
now anchors its `find` at `$WB/shared` and `$WB/circles -mindepth 2`, which is the same candidate
list migrate's survey counts as `REFORMAT` and its reformat pass renames
(`skills/setup/SKILL.md:67` against `skills/migrate/SKILL.md:54,87`).

**Why not the alternative.** The dispatch asked for the widening direction to be checked first: the
deciding question is which tree a bracket-marked file could legitimately live in and still be live
content. Only those two. The workbench root holds fixed-name session surfaces, `stilwerk/` holds
fixed-name configuration, and the three frozen stores hold content deliberately taken out of
circulation. Widening migrate's reformat pass to setup's whole-tree probe would send a rename pass
into every one of them, which migrate's own Guardrails forbid ("Never touch the root-anchored
surfaces"); to widen safely it would need its own exclusion list, and two blacklists kept in sync is
the drift this defect already is. Narrowing also turns the criterion positive — the tree bound
subsumes all three exceptions and needs no fourth entry when a fourth frozen store appears.

**Prose.** Three paragraphs rewritten in place, and the paragraph count deliberately held constant so
that both line numbers `rules/fusion-workbench-conventions.md:64` cites into this skill (`:60`,
`:67`) still land on the paragraphs they were written against. The deadlock history in `:60` — 1146
matches on one consuming project, all under `archive/` and `.migration-v2-backup/`, hit twice — is
kept; what left is the enumeration of the exception set and the borrowed precedent for it.

**Cross-reference corrected in migrate.** `skills/migrate/SKILL.md:98` asserted "`/fusion:setup`'s
whole-tree bracket probe applies the identical filter", which my change makes false. One sentence
now states the stronger invariant: the same filter over the same two trees. This is the only edit
to migrate and it is a factual correction to a statement about the file I changed.

## Verification

`cd hooks && npm test` — exit 1, one failing assertion, the surface-growth golden, twice
reproducibly in a detached worktree carrying only this patch (`Test Files 1 failed | 39 passed`,
`Tests 1 failed | 750 passed`). The golden diff names exactly the two files above and no others.
Regenerating it was out of scope: other tasks are editing bounded surfaces concurrently, and the
same run in the live tree also showed `agents/orchestrator.md` moved by another task.

The probe was verified empirically on a fixture workbench rather than by reading:

| Fixture | Probe at HEAD | Narrowed probe |
|---|---|---|
| Bracket files only under `archive/`, `stashes/`, `.migration-v2-backup/`, at the workbench root, and a flat `circles/notes[o]-unparsable.md` | `OLD=1`, naming `circles/notes[o]-unparsable.md` | `OLD=0` |
| Plus `shared/issues/260101-0000[o]-live.md` | — | `OLD=1`, naming it |
| Plus `circles/260101-0000-x/issues/260101-0000[p]-live.md` | — | `OLD=1`, naming it |
| Genuine pre-v4 `circles/260716-1847[t]-umbau.md` | — | `OLD=1` through the Circle-file probe |

The first row is the deadlock reproducing at HEAD and closing under the fix; the last three confirm
nothing live stopped being detected.

## Residual filed, not fixed

`rules/fusion-workbench-conventions.md:64` counts setup among four consumers that exclude `stashes/`
by path, and setup no longer excludes by path at all. `rules/` was outside this task's permitted file
set. Filed as
`fusion-workbench/shared/issues/260816-0058_o_the-conventions-still-count-setup-among-the-consumers-that-exclude-stashes-by-path.md`,
which also names the standing instruction in that sentence that must survive the correction, and the
sibling record `260816-0025_o_...` whose table carries the same row.

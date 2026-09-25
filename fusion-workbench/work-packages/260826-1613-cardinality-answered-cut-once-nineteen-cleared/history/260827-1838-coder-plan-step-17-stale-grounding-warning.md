# Coder — plan step 17: stale-Grounding warning in the playmaker

**Session:** 260827-1838 · **Status:** Complete

- Edited `agents/playmaker.md`: Step 2 read-cap carve-out (marker read / `find` is a ranking read), `## Scope` frozen-store line (locating a cited record under `archive/` is not reading it), Step 3 dependencies-closed flag (archive-resolving dependency reported `archived`, never closed) and new stale-Grounding count bullet (threshold half or more, HEAD distance as a count, rank unchanged), Step 4 `stale-grounding:` warning line with the re-sharpen recommendation, `## Warnings` roster.
- `wc -c agents/playmaker.md`: 39269 → 41034 (+1765 bytes). The decision estimated "well under 1 000"; the edit is above that estimate and inside the agents bound.
- Regenerated `hooks/lib/__tests__/fixtures/surface-growth.golden` with `UPDATE_SURFACE_GOLDEN=1`; only the playmaker row and the agents total moved.
- Closed `shared/issues/260826-1445_*` (`_o_` → `_c_`; the dispatch named it `_p_`, the file on disk carried `_o_`), marked plan step 17 `[DONE]`, moved decision `260827-1756_*` `_a_` → `_i_` with the commit hash left to the orchestrator's commit.
- Runtime acceptance (a `/fusion:next` run showing the warning) is deferred to the next session after `fusion --update`.

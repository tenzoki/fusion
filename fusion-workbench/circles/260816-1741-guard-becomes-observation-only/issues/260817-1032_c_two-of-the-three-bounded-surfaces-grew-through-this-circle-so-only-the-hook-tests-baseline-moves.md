Two of the three bounded surfaces grew through this Circle, so step 10 re-baselines one
surface and not three

---

Step 10 of the plan says of the growth baselines: "All three of that file's surfaces move:
`agents/*.md` and `skills/*/SKILL.md` shrink through steps 1, 8 and 11, and the hook test
surface shrinks by roughly 1 100 lines through step 9." The dispatch prompt repeated the same
claim. **Two thirds of it is false, and the third figure is out by a factor of two.**

Measured on 2026-08-17 off `git`, at the commit before this Circle's first (`3d41d4a`) and at
its last (`5763550`). Bytes for the two text surfaces via `git ls-tree -r -l`; lines for the
hook tests by counting `hooks/lib/__tests__/**/*.ts` at each commit.

| Surface | `3d41d4a` | `5763550` | This Circle |
|---|---|---|---|
| `agents/*.md` | 405 229 | 405 031 | **−198 bytes** |
| `skills/*/SKILL.md` | 226 897 | 229 784 | **+2 887 bytes** |
| hook tests | 20 046 | 17 821 | **−2 225 lines** |

`skills/` grew. Steps 1 and 8 are the reason: step 1 added the legacy-halt deletion offer to
`skills/setup/SKILL.md` (`05d848b`, +21 lines) and step 8 rewrote Step 0f to seed `fusion.json`
(`92db96a`), while step 11's edits to `skills/help/SKILL.md` and `skills/archive/SKILL.md` were
rewrites at roughly constant size and `18c125b` added the v10 upgrade-note pointer. `agents/`
fell, but by 198 bytes, which is 0.05 % of the surface. Only the hook-test surface had a cut,
and it is twice the size the plan estimated.

**Why this matters for the baselines rather than being a bookkeeping quibble.** The baseline
maps still hold the 2026-08-15 arming figures, so at `5763550` the three surfaces stand at:

| Surface | Baseline | Now | Delta | Head-room used |
|---|---|---|---|---|
| `agents/` | 399 843 | 405 031 | +5 188 | 29 % of 18 000 |
| `skills/` | 220 439 | 229 784 | +9 345 | 47 % of 20 000 |
| hook tests | 18 190 (survivors) | 17 821 | −369 | none |

Copying the current `agents/` and `skills/` totals into their maps, as step 10 reads literally,
would absolve 14 533 bytes of growth on the strength of a 198-byte cut. Most of that growth is
not even this Circle's: between the arming (`0609945`) and this Circle's start, `agents/` rose
5 386 bytes and `skills/` 6 458. That is the silent raise `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining` exists to refuse, and it is the same argument the dispatch
itself made for leaving `rules-emission-golden.test.ts` alone.

**What was done instead.** Only `TEST_LINE_BASELINE` moved. Its five entries for files deleted
in `1d1d3a3` are dropped and the survivors are taken at their post-cut sizes, which lowers that
surface's floor from 18 190 to 17 821 and hands back none of the shrink as head-room.
`AGENT_BASELINE` and `SKILL_BASELINE` are untouched; both surfaces pass their bounds today, and
the growth they carry stays visible in the next reader's failure text instead of being absorbed.

**What is left open.** `skills/` has spent 47 % of its head-room and no cut is scheduled against
it. Whoever plans the next Circle over the skill bodies inherits that, and the instrument will
say so before it fails.

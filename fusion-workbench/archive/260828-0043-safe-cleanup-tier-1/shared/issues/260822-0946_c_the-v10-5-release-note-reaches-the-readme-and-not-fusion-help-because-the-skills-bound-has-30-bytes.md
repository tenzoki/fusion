The v10.5 release note reaches README.md and not /fusion:help, because the skills growth bound has 30 bytes left

---

**Severity:** Low for this release, and rising with each one. A user who asks `/fusion:help` about updating is told about v10.4 and everything before it, and not about the version they are running.
**Domain:** code
**Filed by:** orchestrator, cutting the v10.5 release
**Affects:** `skills/help/SKILL.md`, its upgrade section; `hooks/lib/__tests__/surface-growth-bound.test.ts`, the `skills/*/SKILL.md` bound
**Cross-references:** `260821-1042-reply-bounded-whole-question-answered` `## Closure note`, which names the growth bounds as a residual it closed over

---

## What is missing

Every release since v9 has added a paragraph to two places: `README.md` and the upgrade section of `skills/help/SKILL.md`. v10.5 added the first and not the second.

`docs/upgrading-to-v10-5.md` exists and `README.md` points at it. `/fusion:help` still stops at v10.4.

## Why

`skills/*/SKILL.md` is one of four growth-bounded surfaces. Measured at the release commit: 240 409 bytes against a budget of 240 439, so **30 bytes of head-room**. The five existing upgrade paragraphs in that file run 600 to 1 100 bytes each. A sixth cannot be written without a cut of comparable size, and choosing that cut while cutting a release is the wrong moment for it.

## The shape of the problem, which is not this release

**The upgrade section grows monotonically by construction.** It is a per-release list that nothing ever removes from, on a surface with a fixed ceiling. It will exhaust the bound whatever else happens; v10.5 is simply the release where the two met. Adding one paragraph now buys one release.

## What to do, and the choice is the user's

1. **Compress the tail of the list.** The v8-and-earlier and v9 entries are two of the longest and the least likely to be read: a project still on v8 has more to do than read a paragraph. Collapsing both into one line that points at the two notes would pay for several releases. Cheapest, and it loses nothing a reader cannot get from `docs/`.
2. **Cap the section at the last N releases** and let `docs/` carry the rest, with one standing line saying so. Makes the growth bounded by construction rather than by repeated pruning.
3. **Raise the `skills/` baseline.** Its own rule permits this at exactly two moments, after a cleanup or at a one-time arming, and a release is neither. Named here so it is visibly rejected rather than unconsidered.

**Not an option:** letting the pointer quietly stop being written each release. That is how `/fusion:help` becomes a document about old versions, and nothing would report it — this record exists because the omission was noticed at the moment it happened, and the next one may not be.

---
Resolved: option 2, capped at **N = 3**, applied to `skills/help/SKILL.md` topic 4 at step 6 of the
C0 plan (`260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`).
The user chose the shape at Gate B; option 1 (compress the tail) and option 3 (raise the baseline)
were not taken.

**N = 3, and the reason is what the list is for.** The section answers one question: what changed
between the version the user had and the one they are running. One release behind is the normal
state of a user who updates when prompted, two is the plausible miss, and three is the margin over
that. A project further behind than three is performing a migration rather than reading a help
topic, and a migration is answered by the full note in `docs/`, not by a paragraph. N = 2 would have
saved another 500 bytes and removed the margin; N = 4 or 5 keeps the shape the record calls
monotonic, since the ceiling is fixed and the list is not.

**What now stands:** the v10.5 paragraph the release omitted, then v10.4, then v10.3, then one
standing line — "**Older than that:**" — which says the section carries three releases and no more
and why, points at `$FUSION_SRC/docs/` and the `upgrading-to-<version>.md` naming, and tells a
further-behind project to read them in version order from its own.

**One thing the standing line carries rather than drops.** Of the three paragraphs removed, exactly
one held an action that fails silently when skipped: v10 retired the project-root `fusion-guard.json`,
and a Turn budget left inside it is not read. A cap that let that go quiet would trade a stated defect
for an unstated one, so the standing line names it. The v10.2 and v9 paragraphs describe releases
that rewrite nothing, and their content survives in full in `docs/`.

**Net byte change on `skills/*/SKILL.md`: −68**, from `help/SKILL.md` 16 957 → 16 889. That is the
figure for this step alone; the surface as a whole rose 304 bytes because step 5 added 372 to
`setup/SKILL.md` in the same pass. Surface head-room after both: **4 016 bytes**. `SKILL_BASELINE`
did not move.

**The reference-resolution pin did not move**, which was checked rather than assumed. Removing the
three paragraphs took four resolved `$FUSION_SRC/docs/upgrading-to-*.md` citations out; the v10.5
paragraph and the standing line put four back in (`upgrading-to-v10-5.md`, `$FUSION_SRC/docs/`,
`rules/user-facing-output.md`, `bin/fusion-prose-metric`). A net of zero, and coincidental — it is
not a property of the cap. `BASELINE` in `hooks/lib/__tests__/reference-resolution-lint.test.ts` is
unchanged and needed no re-approval block.

**Left open, and it is the cap's one loose end.** `CLAUDE.md`'s `docs/` row states that each
`upgrading-to-vN.md` "is pointed at from `README.md` `## Install` and from `/fusion:help`'s update
topic". After the cap the second half holds for three of the six notes. `CLAUDE.md` is the curator's
surface and outside this step's file scope, so the correction is filed as
`260822-1503_*_claude-mds-docs-row-says-fusion-help-points-at-every-upgrade-note-and-the-cap-made-that-false.md`.

Verified: `cd hooks && npm test` — exit 0, 41 files, 724 tests.

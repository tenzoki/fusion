The v10.5 release note reaches README.md and not /fusion:help, because the skills growth bound has 30 bytes left

---

**Severity:** Low for this release, and rising with each one. A user who asks `/fusion:help` about updating is told about v10.4 and everything before it, and not about the version they are running.
**Domain:** code
**Filed by:** orchestrator, cutting the v10.5 release
**Affects:** `skills/help/SKILL.md`, its upgrade section; `hooks/lib/__tests__/surface-growth-bound.test.ts`, the `skills/*/SKILL.md` bound
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/_c_circle.md` `## Closure note`, which names the growth bounds as a residual it closed over

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

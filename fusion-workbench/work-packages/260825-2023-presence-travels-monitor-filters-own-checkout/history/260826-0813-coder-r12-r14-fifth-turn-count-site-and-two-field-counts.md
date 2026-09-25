# R-12 and R-14 — the fifth Turn-count site, and two sentences that still said two

**Status:** Complete
**Agent:** coder
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Date:** 2026-08-26 08:13
**Circle:** 260825-2023-presence-travels-monitor-filters-own-checkout
**Dispatch:** Turn 3, review findings R-12 (Medium) and R-14 (Low), taken together on one shared
`agents/` growth budget of 431 bytes.

## R-12 — `agents/reconciler.md:21`

The `control.turn_start_head` bullet defined the Turn count as the `turn_start` events in the whole
log since this session's `session_start`: unscoped by checkout, and naming no implementation. It now
reads as a call site rather than a definition. The count comes from `bin/fusion-events turns` behind
`[ -x "$FUSION_PLUGIN_ROOT/bin/fusion-events" ]`, the guard decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`
mandates; the sentence states that the helper scopes the figure to this session and this checkout,
cites `agents/orchestrator.md` Phase 2 step 3 as the one place the definition is stated, and says the
figure is `unavailable` when the helper is absent or prints no `scope=checkout` line, never `0` and
never a `scope=all-checkouts` number.

Two things were deliberately not written. The helper's exit table is not restated: its own header is
the authoritative documentation and the `CLAUDE.md` Layout row says so. And no second definition was
written, so the site count of definitions stays at one.

## Whether a sixth site exists

The R-12 record's own `grep -rn turn_start agents/ skills/ rules/` was widened to `bin/`, `docs/`,
`README-hooks.md`, `CLAUDE.md` and the uncompiled hook sources. No sixth site derives the count.

One near-miss is worth recording rather than leaving for the next reader to re-find.
`agents/orchestrator.md:237` states a property of the count, that a resumed session writes a second
`session_start` naming the same history file and the count therefore runs from the first of them. It
names no helper, but it instructs no derivation either: it explains what the number spans across an
interruption. Left alone as a description, not converted.

## R-14 — two sentences under the three-field contract

Both corrected in place, the section otherwise untouched.

`agents/orchestrator.md:1279` said "Both values come from the guarded `bin/fusion-identity` call at
Setup step 2 and are composed nowhere else" under a lead that now names three fields, which made
`bin/fusion-identity` the stated source of `session_id`. It now names the two sources: `person` and
`checkout` from that guarded call, `session_id` from the SessionStart line read at the same step, and
none of the three composed anywhere else.

`agents/orchestrator.md:1322` said "`<ID>` is the pair held from Setup step 2" at a point where the
fragment is up to three fields. It now says "the identity fragment held from Setup step 2", which
carries no count for a fourth field to falsify.

## Budget — the two deltas, measured separately

| File | Before | After | Delta |
|---|---|---|---|
| `agents/reconciler.md` | 20 691 | 20 980 | **+289** |
| `agents/orchestrator.md` | 162 594 | 162 689 | **+95** |

`agents/` total 417 412 -> **417 796**, against a bound of 417 843. Head-room left: 47 bytes.

The dispatch asked R-14 to come out net-neutral and it did not. Both of the reviewer's fix directions
add words: one clause becomes two because there are two sources to name, and "the pair" becomes "the
identity fragment", which is longer than the count it removes. Reported as measured rather than
trimmed to fit the estimate. Nothing was cut elsewhere to pay for it, because both tasks fit.

## Gates

`cd hooks && npx vitest run` — 2 files red, 42 passed.

- `surface-growth-bound.test.ts`: the golden moved, exactly the two files above and the surface total.
  **Not regenerated.** Two sibling coders were editing other surfaces in the same wave, so a golden
  regenerated here would capture their in-flight edits; the orchestrator regenerates once the wave
  lands. The bound assertions themselves passed and no baseline was touched.
- `reference-resolution-lint.test.ts`: paths 1424 -> 1428, anchors unmoved. **Pin not re-approved**,
  per the dispatch. Of the four, three are this task's and one is a sibling's. The share was measured
  by swapping `agents/reconciler.md` between its HEAD and edited state four times in alternation
  against the rest of the dirty tree, reading 1425 and 1428 with each state twice: this file is +3,
  and the tree already stood at 1425 without it. The three are `bin/fusion-events` twice, bare in the
  call and rooted at `$FUSION_PLUGIN_ROOT` in the guard, plus `agents/orchestrator.md` where the
  definition is cited. The R-14 edits to `agents/orchestrator.md` move nothing: `bin/fusion-identity`
  was already on that line and the SessionStart source is named in prose, not as a path.

An earlier single reading of this pin came back at 1424 while a sibling's file was mid-write. It was
superseded by the four alternating reads above rather than averaged with them.

## Records closed

- `260826-0906_*_a-fifth-turn-count-definition-site-still-reads-the-whole-file-and-names-no-implementation.md`
  — `Resolved:` note appended, marker `_o_` -> `_c_`.
- `260826-0906_*_the-event-log-contract-names-three-fields-and-two-sentences-under-it-still-say-two.md`
  — `Resolved:` note appended, marker `_o_` -> `_c_`.

Neither rename is staged and nothing was committed; the orchestrator holds both.

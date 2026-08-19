The retired tasklist carries `_c_` without the `**Status:** Complete` header the planning vocabulary requires, and its head fields still read live

---

`dd312eb` moved `fusion-workbench/tasklist.md` to
`fusion-workbench/shared/planning/260815-1524_c_retired-tasklist.md`. The placement is right and the
marker is defensible, but the file carries no `**Status:**` line at all, and its header still reads
`**Open tasks:** 74` / `**Blocked:** 22` in a store fifteen shipped consumers scan.

---

## What the rule requires

`rules/fusion-workbench-conventions.md` `## Inline State Tracking` → *Planning files*:

> When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename
> marker to `_c_`.

The rename happened; the header field does not exist. `grep -n '^\*\*Status:\*\*'` on the file
returns nothing.

## What the file's header says instead

```
**Generated:** 2026-08-11 17:34
**Domain:** code
**Active Circle:** none — …
**Git HEAD at build time:** `f70cb07`
**Records inventoried:** 72 open defect records …
**Open tasks:** 74
**Blocked:** 22 …
**Resolved on disk, marker not yet moved:** 1 full, 2 partial — see the section below, and do not dispatch them
```

Read on its own, that is a live queue with 74 open tasks and an instruction not to dispatch three of
them. What corrects it is an **HTML comment** above the title — "this file is history and must not
be read as a live queue" — which is exactly the form a grep-based or line-oriented scan does not
see.

## What is correct here, and is not being contested

- **The placement.** `shared/planning/` is right by the Origin Rule: the queue's own head records
  `**Active Circle:** none` and `**Git HEAD at build time:** f70cb07`, four days before this Circle
  existed. It did not arise from this Directive.
- **Moving rather than deleting**, for the reason the header comment and `dd312eb`'s message both
  give: the 79 entries carry verification notes the 72 records they cite do not.
- **`_c_` as the marker.** The vocabulary's `_c_` is "Closed — resolved, or user decided to close",
  which covers retired. There is no better marker; `_d_` would claim a deferral nobody made.

## Why it still matters

`$SCAN_PLANS` resolves to two stores and has fifteen shipped consumers — `taskplanner`,
`reconciler`, `planner`, `coder`, `ontocoder`, both reviewers, `/fusion:cleanup`, `/fusion:archive`
and the rest. The `_c_` marker is what keeps 1041 lines and 162 KB of stale queue out of a live scan,
and it is doing that work alone, with the header contradicting it and the correction in a comment.

## Suggested fix

Add `**Status:** Retired 2026-08-15 — history, not a live queue` to the header block, where every
consumer's field read will meet it, and mark the counted head fields as of their build date
(`**Open tasks:** 74 *(as of 2026-08-11; superseded — the records under `shared/issues/` are the
authority)*`). The HTML comment can stay; the point is that the claim should also exist where a
field read lands.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — CLOSED as moot. The file left every scanning consumer's reach.**

```
bin/fusion-paths taskplanner | grep -i plan
  SCAN_PLANS=shared/planning

ls shared/planning/
  260722-1943_c_spec-plane-spec-comment.md
  260812-1232_c_remove-the-protected-path-half-of-the-compliance-guard.md
  260812-1720_c_circle-first-placement-and-the-backlog-store.md
  260818-1512_c_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md

find fusion-workbench -name '260815-1524*'
  archive/260817-1907-safe-cleanup-scoped/shared/planning/260815-1524_c_retired-tasklist.md
```

The record's harm was that a `_c_`-marked planning file with no `**Status:**` header sat inside `$SCAN_PLANS`, which every plan-reading consumer scans. It was archived in `e59dea2` on 2026-08-17 and `$SCAN_PLANS` no longer resolves to it. The archived copy still lacks the header and still heads with `**Open tasks:** 74`; that is left exactly as it stands, because a frozen record is evidence rather than a live claim.

---
Resolved: moot. `260815-1524_c_retired-tasklist.md` was archived out of `shared/planning/` in `e59dea2` on 2026-08-17, so no consumer scanning `$SCAN_PLANS` reaches it. The missing `**Status:**` header was never added; the file simply left the live store.

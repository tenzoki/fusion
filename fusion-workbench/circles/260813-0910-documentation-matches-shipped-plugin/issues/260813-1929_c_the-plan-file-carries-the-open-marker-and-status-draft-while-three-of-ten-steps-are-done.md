The plan file still carries the open marker and Status: Draft while three of ten steps are [DONE]

---
`planning/260813-1820_o_documentation-matches-shipped-plugin.md` had steps 1, 2 and 3 marked `[DONE]` in commit `0b20859`, but its filename marker is still `_o_` and its header still reads `**Status:** Draft`. The conventions require the rename to `_p_` when an agent begins work, and the inline markers are the evidence that it did.
---

## Both sides read

**Artifact side**, the file as it stands at `79ec7bb`:

- filename: `260813-1820_o_documentation-matches-shipped-plugin.md`
- `:4` — `**Status:** Draft`
- `:103` — `1. [DONE] **README-agents.md — the two dead references**`
- `:109` — `2. [DONE] **CLAUDE.md — the inventory, the deleted count, the playmaker clause, the byte claim**`
- `:119` — `3. [DONE] **Extend `derivable-enumerations-lint.test.ts` with the `bin/` roster**`

**Documentation side**, `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning`:

> - Every new file starts as `_o_`.
> - When an agent begins work: rename `_o_` → `_p_`.
> - When work is done: rename `_p_` → `_c_`.
> - State change = `mv` (rename). Only the marker changes; `YYMMDD-HHMM` and `<topic>` stay the same.

And `## Inline State Tracking` → *Planning files*: "When all steps are `[DONE]`: set `**Status:** Complete` in the header and rename the filename marker to `_c_`." The in-progress half of that pair is the `_o_` → `_p_` rename above, and it did not happen.

The three per-step history files each record their step as `(now `[DONE]`)`, so the inline half of the tracking was done deliberately and completely; only the filename marker and the header status were left behind.

## Why it matters

A scan for open planning work (`grep '_o_'` over `$SCAN_PLANS`, which several agents' Setup steps run) reads this plan as not started. With seven of ten steps genuinely outstanding across four more Turns, a reconciler or taskplanner pass reading the marker rather than the body would re-queue work that is finished.

## Scope

One workbench file in this Circle. No shipped file affected.

## Recommended fix direction

`mv` the plan to `260813-1820_p_documentation-matches-shipped-plugin.md` and set `**Status:** In progress` in the header. At the Circle's close, `_p_` → `_c_` and `**Status:** Complete`, per the same section.

Filed by: coderev (review of Circle Turn 1, range `6590cd5..79ec7bb`, commit `0b20859`).

---
Resolved: The plan file was renamed `planning/260813-1820_o_documentation-matches-shipped-plugin.md` → `planning/260813-1820_p_documentation-matches-shipped-plugin.md` and its header set to `**Status:** In progress`. Step 4 is `[DONE]` in the same edit, so four of ten steps now carry the inline marker and the filename agrees with them. Checked against `rules/fusion-workbench-conventions.md` `## State Markers — issues and planning` (open to in-progress when an agent begins work, in-progress to closed when the work is done) and `## Inline State Tracking` → Planning files (Status Complete and the `_c_` rename belong at the end, not here).

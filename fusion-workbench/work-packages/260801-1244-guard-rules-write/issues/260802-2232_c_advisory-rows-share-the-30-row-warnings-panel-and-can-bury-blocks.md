# Advisory rows share the 30-row warnings panel and can bury the blocks it exists to surface

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing Turn 1 of `260801-1244-guard-rules-write` (`c7f117b..HEAD`)
**Affects:** `bin/monitor` (Step 5, commit `bf75941`)
**Cross-references:** `bin/monitor:91-97` (`WARNING_EVENT_TYPES`, `MAX_WARNINGS_RETURNED`),
`bin/monitor:961` (`return warnings[-MAX_WARNINGS_RETURNED:]`),
`hooks/guard.ts:386-389` (the reasoning this collides with),
`260707-0751_*_guard-allow-bash-events-flood-events-jsonl.md` (the same failure, closed)

---

## What was found

Step 5 adds `guard_advisory` to `WARNING_EVENT_TYPES` and renders it at its own level. The
level distinction is right and the rendering is clean. The panel it joins is not resized: it
still returns the last 30 matching events, newest last (`bin/monitor:961`).

One exempted write emits one `guard_advisory`. A curation session with the flag set — the
session the flag exists for — emits one per write. Thirty rule files rewritten is thirty
advisories, and every `guard_block`, `guard_halt`, `churn_critical` and `cross_file_critical`
older than them is off the panel.

## Why this is the same failure that was already closed once

`hooks/guard.ts:386-389` states the rule the guard already lives by, and names advisories as
one of the things worth protecting:

> It MUST NOT emit a `guard_allow` event. One append per Bash call floods `events.jsonl` and
> buries the `guard_block`/`guard_halt`/`guard_advisory` entries the monitor exists to surface
> (see issue 260707-0751).

`guard_advisory` was on the protected side of that sentence. It is now also on the flooding
side, at one append per exempted write, with no cap of its own. The events file itself is
append-only and fine; it is the 30-row window that is the scarce resource.

## Candidate fixes

1. **Reserve capacity by class.** Take the last N advisories and the last M warnings/blocks
   separately, then merge by timestamp — so a burst of advisories cannot evict a block. Most
   faithful to what the panel is for; a dozen lines in `_read_warnings`.
2. **Collapse consecutive advisories.** One row per run of `guard_advisory` with the same
   trigger, carrying a count. Cheapest, and it matches how a curation session actually looks.
3. **Raise `MAX_WARNINGS_RETURNED`.** Does not fix it, only moves the threshold.

Not a release blocker — the panel degrades toward showing recent truth, not toward showing
falsehood — but it is worth closing before the flag is used in anger, because the first
session that exercises the flag is the session that triggers it.

## Verified

`bin/monitor` is otherwise correct on this change: the additive `WARNING_EVENT_TYPES` entry,
the `.advisory` CSS class and the `levelClass`/`levelLabel` branch are all no-ops when no
advisory exists, so behaviour with the flag unset is unchanged.

## Origin

Found in `260801-1244-guard-rules-write` reviewing Step 5.

---
Resolved: Direction 1 — the two classes now have independent budgets rather than one
shared 30-row slice. `bin/monitor` carves `ADVISORY_EVENT_TYPES` out of
`WARNING_EVENT_TYPES` and adds `MAX_ADVISORIES_RETURNED = 8` alongside the untouched
`MAX_WARNINGS_RETURNED = 30`; `_read_warnings` bins each event into the class its type
names, slices each bin against its own cap, and merges the two back into one
chronological list keyed on the raw ISO-8601 `ts` string (fixed-width and Z-suffixed, so
lexical order is chronological and nothing has to be parsed).

The warning class keeps its full 30 whatever the advisories do, so the panel's worst case
grew from 30 rows to 38 rather than the advisory allowance being taken out of the
warnings. A shared 30 split 8/22 would have left a smaller version of the same bug: a
curation session would still have evicted 8 warnings.

8 for advisories, deliberately a minority. One advisory row already tells the user the
override is live; a handful gives the shape of the burst. Eight shows a small curation
session in full and enough of a large one to recognise the pattern, while the panel stays
legible as a warnings panel at full advisory load. The exhaustive record is `events.jsonl`,
which is append-only; the 30-row window is the scarce thing and the fix protects it rather
than enlarging it.

Behaviour with no advisories is byte-identical, guarded by an early return that skips the
merge entirely rather than relying on the merge being a no-op.

Demonstrated against the real binary rather than by reading the code: a seeded
`.guard-state/events.jsonl` with one `churn_critical`, one `cross_file_critical`, one
`guard_block` and one `guard_halt` emitted FIRST, then a 30-advisory curation burst, served
through `GET /api/dashboard` by `bin/monitor` at HEAD and by the working tree. HEAD returned
29 advisories and 1 halt — the three older rescued events gone. The working tree returns all
four plus the 8 newest advisories.

Covered by `hooks/lib/__tests__/monitor-warnings-panel.test.ts` (4 cases), the first
executable coverage `bin/monitor` has ever had. It drives the real script over HTTP, the
same seam a browser uses.

Not taken: direction 2 (collapsing consecutive advisories into a counted row). It is
cheaper, but it makes the panel's row count a function of how the burst happens to be
interleaved rather than of what class each event is, and it drops the per-file detail that
is the whole content of an advisory. Direction 1 fit the rendering without touching
`renderWarnings()` at all.

Residual, measured not assumed: two `guard_advisory` details in `hooks/guard.ts` are
unbounded in length (they skip the `forEvent()` 200-char clamp every other detail passes
through). Out of scope here — filed as
`260803-1352_*_two-guard-advisory-details-skip-the-200-char-clamp-and-render-a-row-nine-times-normal-height.md`.

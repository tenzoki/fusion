# Advisory rows share the 30-row warnings panel and can bury the blocks it exists to surface

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing Turn 1 of `circles/260801-1244-guard-rules-write` (`c7f117b..HEAD`)
**Affects:** `bin/monitor` (Step 5, commit `bf75941`)
**Cross-references:** `bin/monitor:91-97` (`WARNING_EVENT_TYPES`, `MAX_WARNINGS_RETURNED`),
`bin/monitor:961` (`return warnings[-MAX_WARNINGS_RETURNED:]`),
`hooks/guard.ts:386-389` (the reasoning this collides with),
`shared/issues/260707-0751_c_guard-allow-bash-events-flood-events-jsonl.md` (the same failure, closed)

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

Found in `circles/260801-1244-guard-rules-write` reviewing Step 5.

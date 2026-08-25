A `turn_start` line with no readable `ts` is dropped from the Turn count and reported nowhere

---

`countTurns` skips every `turn_start` whose `ts` is absent or unparseable. Such a line is well-formed JSON, so it is not counted in `malformed` either. The count comes back smaller with nothing on stdout or stderr saying a line was passed over.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium

**Evidence.** `hooks/lib/events-query.ts:363-367`:

```ts
for (const e of scoped) {
    if (e.line.event !== "turn_start") continue;
    if (e.ms === null || e.ms < anchor.ms) continue;
    turns++;
}
```

Measured against a log holding one `session_start` and two `turn_start` lines, one with no `ts` and one with `ts: "nonsense"`:

```
{"ok":true,"turns":0,"historyFile":"H","since":"2026-08-25T09:00:00","malformed":0}
```

Two Turns started; the helper reports zero, `malformed=0`, exit 0.

**Why this is a defect and not a design choice.** `parseLog` (`hooks/lib/events-query.ts:77-82`) carries the module's own statement of the principle: "a skipped line that nobody counts is the silent under-report this whole Circle exists to remove". `measurePresence` obeys it for its own drop and documents it explicitly at `:220-222` ("A line whose `ts` cannot be read is dropped: it cannot be placed in the window"). `countTurns` performs the same drop, documents it in neither its docstring (`:318-331`) nor the `bin/fusion-events` header, and surfaces it in no counter.

The drop is also the one that matters most: this helper exists because `shared/issues/260825-1430_*_the-event-log-froze-at-turn-2-while-the-dashboard-stayed-current-inverting-the-diagnostic-six-instances-rest-on.md` measured a session whose Turn events never reached the log. A count silently short by a line is the same class of failure as a count silently frozen.

**Fix direction.** Return the drop as a figure beside `malformed` — a `skipped` or `unstamped` count — and have `hooks/events-query.ts` name it on stderr the way `noteMalformed` names its own (`:137-139`). Do not fold it into `malformed`: those lines are JSON objects and the two facts are different.

**Scope.** `hooks/lib/events-query.ts`, `hooks/events-query.ts`, `bin/fusion-events` header.

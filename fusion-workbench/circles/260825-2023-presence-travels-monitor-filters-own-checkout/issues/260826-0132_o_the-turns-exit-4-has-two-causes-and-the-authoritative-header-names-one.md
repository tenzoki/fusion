`turns` exit 4 has two causes and the authoritative header names one

---

`countTurns` returns two distinct failures, `no-session-start` and `anchor-without-timestamp`, and `hooks/events-query.ts` maps both onto exit 4. The `bin/fusion-events` header, which the file itself declares to be the authoritative documentation, names only the first.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium

**Evidence.** `hooks/lib/events-query.ts:315` declares both:

```ts
| { ok: false; why: "no-session-start" | "anchor-without-timestamp"; historyFile: string }
```

`hooks/events-query.ts:238-243` phrases both and returns 4 for either. `bin/fusion-events:71-72` states:

```
#   4  ...
#      turns: no `session_start` in this checkout's lines names that history
#      file. **A finding, not a zero.**
```

Measured:

```
countTurns('{"event":"session_start","checkout":"aaaa1111","history_file":"H"}', 'H', 'aaaa1111')
-> {"ok":false,"why":"anchor-without-timestamp","historyFile":"H","malformed":0}
```

**Why the header rather than the code is the defect.** `hooks/events-query.ts:5-9` and the `CLAUDE.md` row for this helper both say the script's own header is where the exit table lives, which is the convention `bin/fusion-turn-budget`, `bin/fusion-identity` and `bin/fusion-session-domain` each carry. A reader who goes to the one authoritative place gets an incomplete table. The same omission stands in the plan's `## API Changes` exit table (`planning/260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`), so the two agree with each other and both are short of the code.

**Fix direction.** Add the second cause to the exit-4 row in `bin/fusion-events`: the `session_start` naming that history file carries no readable `ts`, so no window can be opened. Both causes share what the caller does, which is the reasoning the header already gives for exit 3 naming an outcome rather than a cause, so one code for two causes is right and only the table is short.

**Scope.** `bin/fusion-events` header.

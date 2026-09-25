`bin/fusion-events turns` returns exit 0 and an unscoped whole-file count when the checkout is unresolved, and stdout carries no marker of it

---

When `bin/fusion-identity` resolves no checkout identifier, `turns` counts every `turn_start` line in the merged log, prints `turns=<n>` and exits **0**. The widening is named on stderr and nowhere else. A caller reading stdout and the exit code, which is what a prompt does, cannot tell a checkout-scoped count from a whole-file one.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** High

**Evidence.** `hooks/lib/events-query.ts:146-149` — `isOurs` returns `true` for every line when `checkout === null`, so `countTurns` (`:332-337`) filters nothing. `hooks/events-query.ts:195-206` prints the widening on stderr and falls through to the ordinary success path at `:247-248`. Measured:

```
$ FUSION_EVENTS_PERSON='' FUSION_EVENTS_CHECKOUT='' FUSION_EVENTS_IDENTITY_EXIT=5 node hooks/dist/events-query.js turns
fusion-events: fusion-identity resolved neither the person nor the checkout.
fusion-events: this checkout could not be identified, so every line is counted, as before C4.
turns=1
history_file=circles/260825-2023-.../history/260825-2123-orchestrator-session.md
EXIT=0
```

**Why this matters here specifically.** `bin/fusion-events:126-127` states the program's own principle: it reports unavailability "through exit 3 and 4 rather than through a smaller number, because the defect being repaired is exactly a count that looked like an answer". `hooks/events-query.ts:27-34` states it again: "stdout carries only figures that were taken". This case is a figure taken over a **wider** scope than the key name says, and it is the one case that reaches exit 0 with no machine-readable trace.

The consequence lands on the plan's step 5, which instructs the four Turn-count sites: "**Where the helper is unreachable, report `unavailable` and name the reason; never fall back to the whole-file count**, because that is the defect being repaired" (`260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md` step 5). A prompt cannot obey that instruction: the helper performed exactly that fallback and reported success.

**The asymmetry that names the fix.** `presence` already carries a permanent stdout self-disclaimer, `scope=pulled` (`hooks/events-query.ts:172`), for a *weaker* caveat than this one. `turns` carries no `scope=` key at all.

**Fix direction.** Give `turns` a `scope=` key on stdout, taking `checkout` in the ordinary case and `all-checkouts` (or equivalent) when the identifier did not resolve, and state it in the `bin/fusion-events` header beside `scope=pulled`. Whether that case should also leave exit 0 is a second question: a distinct exit code would let a call site branch without parsing, and would match the "never a smaller number" principle more closely than a key does. State the choice in the header either way.

**Scope.** `hooks/lib/events-query.ts`, `hooks/events-query.ts`, `bin/fusion-events`, and the four call sites plan step 5 has yet to write.

---
Resolved: `turns` now prints a `scope=` key on stdout — `checkout` in the ordinary case, `all-checkouts` where the checkout identifier did not resolve and every line in the merged file was therefore counted. It is printed on the exit-4 branch too, where the count could not be taken but the scope the search ran over still was, and it is printed **last**, so the two lines a caller was written against are byte-identical to before and a caller that ignores the key behaves exactly as it did.

The record's second question — whether the case should also leave exit 0 — was answered by the dispatch, and the header now carries the answer rather than leaving it to be inferred. **The exit stays 0.** The count *was* taken; what was missing was any statement of what it was taken over, and a sixth exit code would change the behaviour of every caller already written against this helper in order to say something a key says without changing anything. A call site that must not accept a widened count reads the key and treats `all-checkouts` as unavailable, which is what plan step 5 needs and could not have.

Changed: `hooks/events-query.ts` (the `scope` binding in `turns()`, written at both exits, with the record cited at it), `bin/fusion-events` header (a section of its own, `The scope= key`, beside `scope=pulled`, and the exit-0 row, which now admits a count taken over `scope=all-checkouts` as measured).

Measured from the work tree:

```
$ ./bin/fusion-events turns
turns=2
history_file=circles/260825-2023-.../history/260825-2123-orchestrator-session.md
scope=checkout
EXIT=0

$ FUSION_EVENTS_PERSON='' FUSION_EVENTS_CHECKOUT='' FUSION_EVENTS_IDENTITY_EXIT=5 node hooks/dist/events-query.js turns
fusion-events: fusion-identity reports this is not a git work tree, so no person is owed — and the checkout identifier did not resolve either.
fusion-events: this checkout could not be identified, so every line is counted, as before C4. stdout carries scope=all-checkouts.
turns=2
history_file=circles/260825-2023-.../history/260825-2123-orchestrator-session.md
scope=all-checkouts
EXIT=0
```

The decision record the measurement reports on does not cite the protocol that defines it, so the link runs one way

---
The Circle's plan states, in `## Where this Circle stops` clause 5, that
`260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
"stays answered and gains the protocol's path and the pre-repair number". It gained neither pointer.
The protocol names the decision record; the decision record does not name the protocol.

---
**Found by:** reconciler, final reconciliation of `260820-2051-style-rules-arrive-and-get-measured`, 260821-0413.
**Owner:** `coder`, or the reconciler on its next pass. One appended block on an existing record.
**Severity:** Medium. Nothing is wrong in any shipped file. The cost is that the Circle's fourth
Directive outcome is deferred to a later session, and the artifact that later session needs is
reachable only from inside the Circle that is about to close.
**Filed in the active Circle** per the Origin Rule: this Circle's Directive is what caused the
protocol to be written and the clause to be stated.
**Cross-references:**
`260820-2354-prose-register-measurement-protocol.md`
(the unreferenced artifact);
`260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
(the record that should carry the pointer);
`260820-2324_*_plan-style-rules-arrive-and-get-measured.md`
`## Where this Circle stops` clause 5.

## Verified at HEAD `247abfe`

```
$ grep -c '260820-2354' fusion-workbench/shared/decisions/260816-0740_a_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md
0
$ grep -rl '260820-2354' fusion-workbench/ | grep -v '^fusion-workbench/archive'
circles/260820-2051-.../history/260820-2354-analyst-prose-register-measurement-protocol.md
circles/260820-2051-.../history/260821-0350-coder-the-final-state-is-measured.md
circles/260820-2051-.../issues/260821-0144_o_the-authoritative-prose-metric-has-no-test-...md
circles/260820-2051-.../reviews/260821-0145-coderev-turn-1-...md
```

Every citation of the protocol is inside the Circle. Three of the four are history or review files,
which no later pass reads as a starting state.

The protocol itself states the reverse direction explicitly, at its section
*The measurement will be reported on* : "`260816-0740_*_…`". So the author knew
the pairing and wrote one half of it.

## Why the direction that is missing is the one that matters

The measurement is deferred by design: the post-repair window has no members while this Circle is
the only live one. Whoever reopens it starts from the decision record, because that is where the
answer is recorded and where the marker will move. From there, at HEAD, there is no path to the
threshold, the two window boundaries, the exclusion rules, the five pre-repair files or the
three-outcome marker scheme. The Circle is about to reach a terminal marker, at which point its
artifacts are also archive candidates.

## Fix direction

One appended block on the decision record, in the shape the record's other appended corrections
already use: the protocol's path, the pre-repair total row (171 prose em-dashes over 13 018 prose
words, 13.1 per 1000, at `fac97f4`), the threshold as a single sentence, and the condition that
opens the post-repair window. The marker stays `_a_`: a pointer is not a measurement.

## What must not be done instead

Copying the protocol into `shared/`. `rules/fusion-workbench-conventions.md` `## Origin Rule`
corollary 2 is explicit that reach is cited and never placed, and a second copy of a
pre-registered protocol is how a pre-registration stops being one.

---
Resolved: fixed — the decision record carries the protocol path, the pre-repair row, the threshold and the window condition, marker unchanged at `_a_`; 260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md:173

Thirteen of the twenty-four legacy containers carry no `**Status:**` line, and the prompt enumerates four values

---

`### The corpus, and the live/terminal bound` justifies the legacy exclusion with an enumeration of four status values across 24 containers. Measured: 13 of the 24 carry no `**Status:**` line at all, and the order helper's own source says a Circle record has none by design.

---

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>

## The defect

`agents/curator.md` `### The corpus, and the live/terminal bound`:

> 24 of the 31 containers in fusion's own workbench are pre-grammar Circle containers reading `closed`, `active`, `bounded` or `anticipated`, all 24 terminal

Measured at `d1f6b65d` over `fusion-workbench/circles/`: 31 containers, 7 work items, 24 Circle containers — those figures hold. The enumeration does not. Eleven of the 24 carry one of the four named values; **thirteen carry no `**Status:**` line at all**:

```
260819-1645-four-constraints-on-deep-change        260904-1619-tracked-checkout-registry-names-each-instance
260820-2051-style-rules-arrive-and-get-measured    260906-2258-bounded-executor-dispatches
260821-1042-reply-bounded-whole-question-answered  260907-0829-message-between-checkouts-read-before-pull
260823-0023-settle-what-travels-between-checkouts  260908-1410-cut-skills-surface-add-post-body
260824-0530-record-attribution-and-circle-claim
260824-1853-close-every-open-defect
260825-2023-presence-travels-monitor-filters-own-checkout
260826-1613-cardinality-answered-cut-once-nineteen-cleared
260828-2342-citation-form-drops-store-segment
```

`hooks/lib/work-graph.ts`, module header, states the same thing as a design fact: "a Circle carries its state in a filename marker and **has no `**Status:**` field**". And `260918-0827-adversarial-read-of-the-first-edge-run.md` §4 already measured the split on the subset it touched — "6 fall out (5 pre-grammar status, **1 no status line**)" — so the fourth state was known when this sentence was written.

## Why it matters beyond the number

The exclusion rule itself survives: "a record whose status is not one of the five work-item values is not a work item here" excludes an absent line vacuously. But the two halves of the prompt state different case sets for the same fact. `### Pass 2 — apply` precondition 2 names four states — "A terminal value, a legacy vocabulary, **or no `**Status:**` line at all** is `stale`" — and the survey-side rule names three. A reader who takes the enumeration as the case list will not build the fourth branch on the survey side, and the majority of the containers fall in it.

`rules/critical-stance.md` §5 is the rule this breaks: the number sits beside a list it does not match.

## Acceptance test

The sentence either names the four states that occur (one of the four legacy values, or no `**Status:**` line) or derives the figure from a command, and the survey-side case set matches precondition 2's.

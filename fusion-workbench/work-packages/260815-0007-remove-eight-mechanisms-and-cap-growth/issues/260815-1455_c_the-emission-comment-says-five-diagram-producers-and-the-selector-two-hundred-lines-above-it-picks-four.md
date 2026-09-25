# The emission comment says "the five producers" and the selector two hundred lines above it picks four

---
**Severity:** Low — a stale count in a comment, in the one file whose comments are the authoring home for who receives which rule
**Domain:** code
**Filed by:** ontorev (Turn 3 review, range `5d29b6d..518926d`)
**Affects:** `bin/fusion-rules:408`
**Cross-references:** `260815-1339-coder-remove-conceptrev.md`; `rules/design-diagrams.md:5`

---

## What is wrong

`a17cc8c` and `7260bbc` reduced the design-diagram audience from six agents to four. Three of the four places in `bin/fusion-rules` that describe that audience were rewritten correctly; the fourth kept its count.

`bin/fusion-rules:408`:

```sh
# 1c. Design-diagram agents (the five producers) receive the diagram doctrine:
```

`bin/fusion-rules:188`, the selector it comments:

```sh
  planner|analyst|taskplanner|shaper)
                                  IS_DIAGRAM_AGENT=1 ;;
```

Measured rather than counted from the source — the recipients of `design-diagrams.md`, taken by running `bin/fusion-rules` for each of the fifteen agents:

```
analyst  planner  shaper  taskplanner        count=4
```

## Why the count was five and is now four

Before this Turn the set was six: five producers (`planner`, `analyst`, `taskplanner`, `shaper`, `investigator`) plus the `conceptrev` evaluator. `a17cc8c` removed the evaluator and `7260bbc` removed `investigator`, leaving four producers. The `:408` comment had said "the five producers + the conceptrev evaluator"; the edit dropped the evaluator clause and left the numeral, which had been correct for a set that no longer exists.

The other three descriptions in the same file were corrected in the same commits and are right at HEAD: the header block at `:56-60` names the four agents individually, the flag comment at `:183-186` was rewritten to drop the producer/evaluator split entirely, and the selector at `:188` is the behaviour. `rules/design-diagrams.md:5` was corrected too. So this is a single surviving instance, not a class.

## Evidence

- `bin/fusion-rules:408` (the stale count), `:188` (the selector), `:56-60` and `:183-186` (the two corrected siblings).
- Independent measurement: `for a in <15 agents>; do bin/fusion-rules "$a" | grep -q design-diagrams.md; done` → four hits, listed above.
- `git diff 5d29b6d..518926d -- bin/fusion-rules` shows the `:408` hunk being edited in the same commit that fixed the others, with the numeral untouched.

## Fix direction

`bin/fusion-rules:408`: "the five producers" → "the four producers", or drop the numeral. Dropping it is the better of the two: the parenthetical adds nothing the selector twenty lines below does not say exactly, and a numeral in a comment describing a list that is maintained elsewhere is a thing that goes stale on a schedule nobody controls. The header block at `:56-60` already names the four agents, which is the place a reader looks.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Unchanged; the numeral drifted one line and not at all in value.**

`bin/fusion-rules:409` still reads `# 1c. Design-diagram agents (the five producers) receive the diagram doctrine:`. Measured by running the helper for every agent and grepping for `design-diagrams.md`, the recipient set is **four**: `planner`, `shaper`, `taskplanner`, `analyst`.

This is one of the four instances `260815-1501_*_four-cardinal-words-still-count-items-the-removals-deleted` enumerates, and it is the instance inside executable text rather than prose — which makes it the cheapest to catch if anyone ever builds the gate that record asks for.

---
Resolved: fixed — with `shared/issues/260821-0018_*`: the numeral is dropped and the 1c comment names the `IS_DIAGRAM_AGENT` case; the "fifteen agents" in 1e went the same way ("the other agents"); `grep -n "five producers\|fifteen agents" bin/fusion-rules` prints nothing

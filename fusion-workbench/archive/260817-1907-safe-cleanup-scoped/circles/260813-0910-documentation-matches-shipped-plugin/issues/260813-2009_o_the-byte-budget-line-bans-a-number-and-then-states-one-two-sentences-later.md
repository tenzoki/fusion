The byte-budget line bans a stated number, then states one two sentences later

---
`CLAUDE.md:64` says the always-on floor is "deliberately not stated here" because "any number written into this line is stale before it is committed". Two sentences later the same line states 30 588 bytes for the conditional set. That figure decays by exactly the mechanism the sentence just named: it is `wc -c` over three rule files that any rule edit moves.
---

## Both sides read

**Documentation side**, `CLAUDE.md:64`, as it stands at `5d51abd`:

> **The floor as it stands today is deliberately not stated here.** It moves with every rule edit, so any number written into this line is stale before it is committed: by 260813 the two that stood here had each drifted 5 796 bytes low. Measure it when you need it, with `wc -c` over the always-on set — the **unindented** `emit_if_exists` lines in `bin/fusion-rules`, plus the project's chat voice profile. **The indented ones are conditional emissions and are not part of the floor; counting them too adds 30 588 bytes, about a third.** In this repository `bin/fusion-rules coder | xargs wc -c` prints the same total in one command, because `coder` draws no conditional rule.

**Artifact side.** The 30 588 is the sum over the three files the indented `emit_if_exists` lines name (`bin/fusion-rules:421`, `:439`, `:454`):

```
   11958 rules/circle-records.md
    5673 rules/design-diagrams.md
   12957 rules/workbench-stash-and-lock.md
   30588 total
```

Measured here at `5d51abd`, so the figure is correct today. It is correct on the same terms the two deleted numbers were correct the day they were written — and those had drifted 5 796 bytes each by the time this Circle read them, which is the fact the sentence itself cites.

## Why it matters

This line is the *replacement* for two stale numbers. Its whole value is that it tells the reader how to obtain a current figure rather than handing them one that rots. Re-introducing a rotting figure in the same breath weakens the rule it states, and the next reader who checks the 30 588 against `wc -c` finds the counter-example without leaving the line — the same shape as the `fusion-count-sources` self-falsifying claim closed earlier in this Circle (`260813-1929_*_the-count-sources-layout-row-says-no-markdown-describes-it-while-being-that-markdown.md`).

The "about a third" that follows the figure is the part that carries the meaning, and it is the part that survives a rule edit.

## Scope

`CLAUDE.md` only. No code behaviour is affected. The two other numbers on the line (5 796, and the 98 443 / 91 090 / 7 353 / 10 420 / 10 541 set above it) are explicitly dated to 260812 or attributed to a past measurement, so they do not have this problem; the 30 588 carries no date and reads as current.

## Recommended fix direction

Drop the byte figure and keep the proportion — the indented lines are conditional emissions, are not part of the floor, and add roughly a third if counted. Or date it the way the sentence above it dates its own measurement ("measured 260813"), so it reads as a past reading rather than a current fact. The first is the better fit with what the line is for.

Filed by: coderev (review of Circle Turn 2, range `28f3029..5d51abd`, commit `9a11254`).

---
Reconciled: 260813-2258-reconciliation.md — Still open, re-verified at HEAD `c0e4219`: `CLAUDE.md:65` (the line moved from `:64` when the five `bin/` rows landed) still reads "counting them too adds 30 588 bytes, about a third", undated, two sentences after the line that bans a stated number.

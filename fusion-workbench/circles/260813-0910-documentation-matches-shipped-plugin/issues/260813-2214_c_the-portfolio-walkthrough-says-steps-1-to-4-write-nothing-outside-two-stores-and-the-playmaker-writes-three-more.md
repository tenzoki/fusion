The portfolio walkthrough says steps 1 to 4 write nothing outside two stores, and the playmaker run inside it writes three more

---
`docs/working-model.md:156` closes walkthrough 5b with "Steps 1 to 4 write nothing outside the
backlog store and the new Circle's own directory, so this path is safe to walk in the middle of an
active session." Step 2 of that walkthrough is a playmaker run, and `agents/playmaker.md:10` lists
its writes: appended sections on Circle records, `$PORTFOLIO` (full overwrite every run), its own
history log, and the backlog store. Two of those four are outside the named pair, and with a Circle
active the history log lands **inside the active Circle**, which is the one directory the sentence
is reassuring the reader about. The conclusion is true; `skills/next/SKILL.md:297` states the
reason it is true, and it is not this one.
---

## Both sides read

**Documentation side**, `docs/working-model.md:156`:

> Steps 1 to 4 write nothing outside the backlog store and the new Circle's own directory, so this
> path is safe to walk in the middle of an active session. A new anticipated Circle does not
> disturb the active one.

Step 2 of the walkthrough (`:151`) is "**The playmaker ranks it.** On its next run — you calling
`/fusion:next`, or the orchestrator pinging it after a Circle closes …". Step 3 (`:152`) is
`/fusion:next` printing the portfolio.

**Artifact side**, `agents/playmaker.md:10`:

> You write into Circle records — `$OUT_CIRCLE/<circle-dir>/_S_circle.md`, and only the sections
> listed in Scope below — plus `$PORTFOLIO` (full overwrite each run), your own history log, and
> the backlog store …

`:154`, `## Output — the portfolio`: "Regenerate `$PORTFOLIO` in full on every run (overwrite)."
`:239`, `## History logging`: "Write to `$OUT_HISTORY/YYMMDD-HHMM-playmaker-<trigger>.md`."
`:177-182`, `## Activation proposals`: "**Append** a `## Activation proposal` block to the
candidate's Circle record."

Resolved, not inferred — `bin/fusion-paths playmaker` with this Circle active:

```
OUT_HISTORY=circles/260813-0910-documentation-matches-shipped-plugin/history
OUT_BACKLOG=shared/backlog
PORTFOLIO=portfolio.md
```

So a step-2 run in the middle of an active session writes `portfolio.md` at the workbench root, a
history file inside the **active** Circle, and an `## Activation proposal` block onto an
anticipated Circle's record — three destinations outside "the backlog store and the new Circle's
own directory", one of them the active Circle itself.

## The conclusion holds; the premise it is drawn from does not

`skills/next/SKILL.md:297` reaches the same conclusion from the accurate list:

> Safe to invoke during an active orchestrator session — playmaker reads everything, and its
> writes are four: the three appended sections on Circle records, the portfolio, its own history
> log, and the backlog store it maintains … The active Turn loop writes none of the four, so it
> cannot interfere with the Turn loop's writes.

The safety rests on *disjointness from what the Turn loop writes*, not on the writes being confined
to two stores. `skills/direct/SKILL.md:117` carries the matching statement for step 4 alone ("a new
anticipated Circle does not affect the active one, and `.active-circle` is untouched"), which is
the second sentence of the passage and is correct as it stands.

## Why it matters

The sentence is the one a reader consults before typing `/fusion:next` while a Circle is running,
and it is the only line in the document that answers that question. A reader who takes it literally
expects `portfolio.md` and the active Circle's `history/` to be untouched, and both change. A reader
who checks it against `agents/playmaker.md` finds the premise false and has no reason left to trust
the conclusion, which is the more expensive failure: the conclusion is correct and the correct
argument for it is already written down one file away.

## Scope

`docs/working-model.md` only. `agents/playmaker.md` and `skills/next/SKILL.md` are correct and
agree with each other.

## Recommended fix direction

Replace the premise with the one that carries the conclusion: nothing in steps 1 to 4 writes what
an active Turn loop writes, so the two cannot collide — citing `skills/next/SKILL.md:297`, which is
that claim's authoring home and already enumerates the playmaker's four writes. Keep the second
sentence. Do not simply add the missing destinations to the current list: the list is not what makes
the path safe, and a longer list would suggest it is.

Filed by: coderev (review of Circle Turn 4, range `93388bc..c663a1f`, commit `a489966`).

---

Resolved: 2026-08-13 — the premise was replaced rather than the list extended, per the issue's fix
direction. `docs/working-model.md:158` now reads "Nothing in steps 1 to 4 writes what an active Turn
loop writes", names the playmaker's four writes (the appended Circle-record sections, the portfolio,
its own history log, the backlog store) and cites `skills/next/SKILL.md` `## Boundaries`, which is
that claim's authoring home. Checked against `skills/next/SKILL.md:297` ("its writes are four: the
three appended sections on Circle records, the portfolio, its own history log, and the backlog store
it maintains … The active Turn loop writes none of the four") and against `agents/playmaker.md:10`,
which enumerates the same four from the agent side, with `:154` (portfolio regenerated in full every
run), `:182` (the `## Activation proposal` block is appended to the candidate record) and `:239` (the
history log). The second sentence is unchanged.

# What total caps a session summary, now that no reply has an uncapped tail?

---
**Domain:** code
**Filed by:** planner
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/planning/260821-1805_*_plan-reply-bounded-whole-question-answered.md` (step 2 writes the number this record decides), `circles/260821-1042-reply-bounded-whole-question-answered/_t_circle.md`, `shared/issues/260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`

---

## Question

`rules/user-facing-output.md` `## Length` caps a session summary at ten lines *before the first
"Details" anchor*. Every other entry in that section caps a whole output. The summary entry caps a
prefix, so the part after the anchor has no bound at all, and a session summary is the surface on
which an agent reports its own work at the length of the work.

This Circle closes the routes by which material leaves a cap without leaving the reply. Closing this
one means the summary entry has to name a total. No total exists to write. The number binds every
agent's session report from the day it lands, so it is not the planner's to set alone.

## Options

1. **Total 25 lines, header still 10.** The header keeps its own cap and the whole summary gains a
   second one. Anything past 25 lines lives in the session history file the agent writes anyway, and
   the summary links it.
   - Pros: the header cap and its stated reason survive untouched. 25 is about twice the general
     chat-reply cap of 12, which is the proportion the surface's density already justifies. The
     overflow destination exists and is already demonstrated in the file's own Example 1
     (`Full log: fusion-workbench/shared/history/...`).
   - Cons: two numbers where one would do, and a reader has to hold both.
2. **One total of 12 lines, the same as any chat reply, and drop the separate header cap.**
   - Pros: one number for every chat surface. Strongest against the Circle's subject.
   - Cons: measured against real sessions this would be a large cut rather than a bound, and a cap
     that is routinely impossible is a cap agents learn to ignore. It also deletes the header cap's
     stated reason, that the header is what the user reads in scrollback.
3. **No total. Keep the header cap and accept the uncapped tail**, recording that one route out of
   the cap was left open deliberately.
   - Pros: nothing is guessed.
   - Cons: it leaves the Circle's central claim untrue. `## Length` would still hold one entry
     through which any amount of material reaches the reader.

## Constraints

- Whatever the answer, it is written as a rewrite of the existing entry rather than as a new one:
  `circles/260821-1042-reply-bounded-whole-question-answered/decisions/260821-1108_*_what-may-the-circles-own-new-clauses-cost.md`
  holds this Circle to net zero bytes or less.
- The heading `## Length` must survive by name. Shipped text and workbench records both cite it, and
  `hooks/lib/__tests__/reference-resolution-lint.test.ts` fails on a heading a shipped file cites
  and no file carries.
- No option may be enforced by a new check.
  `shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
  forbids a prose gate until its registered measurement runs, and this Circle does not run it.

## Recommendation

Option 1. It closes the route without setting a number that sessions cannot meet, and it keeps the
one thing the current entry gets right, that the first ten lines are the part the user actually
reads. The 25 is a judgement rather than a measurement and is stated as one: no count of session
summary lengths exists in this workbench, and taking one would need the transcript pass that step 1
of the plan freezes rather than performs.

If the user prefers a measured number to a judged one, the honest sequence is option 3 now and a
number after the transcript baseline is read. That trade is the reason this record is filed open
instead of being decided inside the plan.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Answered: circles/260821-1042-reply-bounded-whole-question-answered/history/260821-1642-orchestrator-session.md — 25 lines total, the ten-line header kept, chosen by the user at the plan gate on 2026-08-21. The planner's recommendation, taken as filed: it closes the open tail without invalidating the bulk of existing reports, which the 15-line alternative would have done.

---
Implemented: `9aa8ecf` — `rules/user-facing-output.md:103` now reads "Session summary: ≤ 25 lines in
total, ≤ 10 of them before the first 'Details' anchor", with this record cited on the line. Option 1
as recommended and as the user answered at the plan gate: the total is stated, the ten-line header
is kept, and the number is a judgement rather than a measurement, which the entry does not pretend
otherwise. Verified at HEAD `9a68760`; `cd hooks && npm test` exits 0, so the heading `## Length`
and the record citation both still resolve under
`hooks/lib/__tests__/reference-resolution-lint.test.ts`.

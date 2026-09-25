# Does the citation gate judge the `stamp-name` class, which `scanRecordCitations` does not read?

---
**Domain:** code
**Filed by:** planner
**Cross-references:** `260819-1645_*_what-defines-the-citation-gates-corpus-and-what-happens-when-a-marker-move-changes-it.md` (the sibling question, about corpus membership rather than token class); `hooks/lib/__tests__/helpers/citation-scan.ts` (`GATE_KINDS`, `partition()`); `hooks/lib/__tests__/reference-resolution-lint.test.ts`; `260819-2016_*_four-constraints-on-deep-change.md`

---

## Question

The Circle's Directive names two things that do not currently measure the same set. The
blocking test is to be "the missing second caller of `scanRecordCitations`", and the repair
scope was sized at 245 dangling tokens, a figure produced by `partition()`. Those two
functions read different token classes, so the number the repair was planned against is not
the number the gate would see.

`citation-scan.ts` recognises five token kinds. `GATE_KINDS` holds three of them —
`record`, `bare-record`, `circle-dir` — and `scanRecordCitations` skips every hit whose kind
is outside that list. `partition()` applies no such filter: it sorts every hit by status, so
a `stamp-name` token that resolves to nothing lands in `dangling` beside the three the gate
judges.

Measured at HEAD `b91c01c` over the corpus the user chose, with the working tree as it stood
on 2026-08-19 at 20:16:

| | tokens |
|---|---|
| `partition()` `dangling` | 242 |
| of which the gate's three kinds | 209 |
| of which `stamp-name` | 33 |

So 33 dead citations sit inside the measured repair scope and outside anything
`scanRecordCitations` can assert. Repairing them buys no green gate; leaving them repaired
or unrepaired changes no test result.

The question must be answered before the gate is armed, because it decides what the gate
asserts. It also decides how large the repair has to be: 209 tokens if the gate's reach is
the criterion, 242 if the measured dangling set is.

**The sibling record's Constraints section already answers it one way, and the mechanism
answers it the other.** That record states "The gate asserts on the `dangling` partition
only", which by `partition()`'s definition includes `stamp-name`. The function the Directive
names excludes it. Both statements are in the Circle's own inputs, and they disagree.

## Options

1. **The gate stays at `GATE_KINDS`; the 33 `stamp-name` tokens are outside it.** The second
   caller of `scanRecordCitations` asserts on exactly what the shipped-text lint asserts on,
   and the sibling record's Constraints sentence is corrected to name the three kinds rather
   than the partition.
   - Pros: one parser, one gate contract, two callers that mean the same thing by "dangling".
     Nothing new to define. The repair is 209 tokens.
   - Cons: 33 tokens that are demonstrably dead — nothing on disk carries the name — stay
     dead with no gate over them, and a reader comparing the plan's 209 against the
     Grounding's 245 has to be told why the numbers differ.
2. **Widen `GATE_KINDS` to include `stamp-name`, for both callers.** A `stamp-name` token is
   a stamp plus a dashed name (`260812-2116-coder-<slug>`), which the parser's own header
   calls "decidable by prefix" — unlike the bare stamp, which stays undecidable.
   - Pros: the gate then covers every token class the parser can decide, and the repair scope
     equals the measured dangling set. The Grounding's 245 and the gate's number converge.
   - Cons: it changes the shipped-text lint too, because both callers share `GATE_KINDS`.
     `BASELINE.records` in `reference-resolution-lint.test.ts` moves, and the shipped surface
     may hold `stamp-name` violations of its own that this Circle never measured. That is a
     second, unmeasured repair arriving inside a step sized for a different one.
3. **Widen for the new gate only**, by giving the workbench gate its own kind list while
   `scanRecordCitations` keeps `GATE_KINDS`.
   - Pros: the workbench corpus gets the wider assertion without touching the shipped-text
     lint or its baseline.
   - Cons: two gates that both call themselves "the citation gate" and disagree about what a
     citation is. The parser was extracted precisely so one grammar would serve both callers,
     and this reintroduces the divergence one level down.

## Constraints

- The `stamp-bare` class stays out under every option. A bare timestamp carries no store, no
  kind and no slug, so no mechanism reading the token can say which artifact is meant
  (`rules/critical-stance.md` §4). This question is only about `stamp-name`.
- Whatever is chosen, the plan's repair step and the gate must be sized from the same number.
  The failure this record exists to prevent is a repair sized at 242 and a gate armed over
  209, or the reverse, with nobody noticing which.
- The answer does not change the ordering. The repair precedes the arming under every option.

## Recommendation

Option 1, at moderate confidence, and the reason is scope rather than principle.

Option 2 is the more coherent end state: a gate that judges every class its parser can decide
is easier to explain than one that decides a class and then declines to assert on it. What
argues against taking it here is that it silently enlarges a second surface. `GATE_KINDS` is
shared, so widening it re-points the shipped-text lint at 33-token-class citations across
`rules/`, `agents/`, `skills/`, `bin/` and the hook sources — a corpus this Circle has not
measured and did not budget a repair for. That is an unmeasured amount of work arriving
inside a step, which is the shape of failure this Circle exists to close rather than repeat.

What I could not settle, and why it is the user's call: whether the 33 dead `stamp-name`
tokens matter enough on their own to accept that enlargement now. They are dead citations in
live records, which is exactly what the Circle set out to end, and option 1 leaves them
standing.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Answered: 260819-2006-orchestrator-session.md — user chose at the same gate that the gate **reads the `stamp-name` class**. `GATE_KINDS` is extended, so the repair scope and the gate scope coincide at 242 tokens rather than diverging at 209, and step 8's 33 tokens are held by the same mechanism as the rest. The alternative, repairing them and leaving them unheld, would have reproduced this Circle's own subject at smaller scale.

**One consequence neither answer states on its own, recorded here because it falls between them.** Both callers share `GATE_KINDS`, so extending it moves the pinned counts of the existing `hooks/lib/__tests__/reference-resolution-lint.test.ts`. That gate keeps its count pins — the corpus answer's "no baseline" governs the new gate only — so its `BASELINE` will need a re-approval **with the note its own convention requires**, naming the class extension as the cause. A bumped constant with no note is the silent raise that gate exists to catch, and this session has already had to repair one such omission.

---
Implemented: `GATE_KINDS` in `hooks/lib/__tests__/helpers/citation-scan.ts` carries `stamp-name`, landed in `bbfc912`, so the repair scope and the gate scope coincide and step 8's thirty repaired tokens are held by the same mechanism as the rest.

The consequence this record predicted between the two answers came true and was paid where it said: both callers share the list, so the sibling lint's pinned counts moved and were re-approved with the note its convention requires, attributing the movement to two disjoint causes. The widening also reddened that lint on two shipped files nobody had measured — one claiming a Circle that never existed, one illustrating stamp parsing with digits that were the illustration. Both were repaired as text; nothing was exempted and no file was allowlisted.

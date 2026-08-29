The /fusion:next activation handoff tells the orchestrator to read the Circle record's Directive, and no orchestrator step does

---

`skills/next/SKILL.md:264` ends the activation branch with a message it calls "itself the
directive", and that message states what the orchestrator will do next:

> *A fresh orchestrator session begins against this Circle. The orchestrator now runs Setup (which
> overwrites the dashboard), reads the `## Directive` from the record of Circle
> `<candidate-dirname>`, takes it as the session Directive, and proceeds with Phase 0 → Phase 1 →
> Phase 2.*

`agents/orchestrator.md` carries no step that reads a Circle record's `## Directive`. Three places
handle the session Directive, and none of them opens the record:

| Site | What it does |
|---|---|
| `agents/orchestrator.md:207` (Setup step 7) | "Write initial history entry with snapshot counts and session Directive" — names no source for the value |
| `agents/orchestrator.md:360` (Phase 0) | "Parse the user's prompt to determine what work to process" |
| `agents/orchestrator.md:601` (Coherence gate, Artifact↔Directive edge) | Resolves the Directive from the active plan's `## Directive`, else the active spec's, else the session history's `**Directive:**` line. The Circle record is not in the cascade. |

Setup step 5 does read the Circle store, and only to count records by marker for the portfolio
hint. The record itself is never opened.

## What the gap costs

A Circle activated through `/fusion:next` reaches its first Turn with a session Directive taken
from whatever the user typed into the next session, not from the Directive the Circle was
activated on. The two agree whenever the user restates the Circle, which is the common case, and
they diverge silently otherwise. Nothing measures the divergence: the Coherence gate compares
commits against the plan, the spec, or the history line, so a session that never read the record
is judged against a Directive the record never supplied.

The skill's message is not merely aspirational prose. `skills/next/SKILL.md:266` states that the
message *is* the mechanism ("emitting this text is sufficient to trigger Setup on the parent
thread"), so the sentence is relied on to carry an instruction the receiving prompt does not
implement.

## Why nothing catches it

`hooks/lib/__tests__/reference-resolution-lint.test.ts` class (b) resolves `` `file.md` `## Section` ``
adjacent pairs, and this citation carries no filename beside the heading. The header of that gate
says so explicitly: a bare `## X` is ambiguous between "see section X" and "write a section named
X", so it is out of scope by design. No gate compares what one shipped surface promises another
surface will do.

## Suggested fix, and the fork inside it

Two directions, and they are not equivalent:

1. **Give the orchestrator the step.** Setup gains a read of the active Circle record's
   `## Directive` when `.active-circle` names one, and the session Directive is that value unless
   the user's prompt states a different one. Larger, and it settles the precedence question the
   skill's sentence assumes an answer to.
2. **Correct the skill's sentence** to say what actually happens. Cheapest, and it removes a false
   statement without giving the activation path what it was written to have.

Direction 1 also has to say which wins when the user's prompt and the record disagree. That is a
decision, not an implementation detail, and it should be recorded before either direction lands.

**Severity:** Medium
**Domain:** code
**Filed by:** planner, while planning `shared/planning/260818-1512_o_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`
**Cross-references:** `skills/next/SKILL.md:264`, `agents/orchestrator.md:207`, `:360`, `:601`, `shared/decisions/260818-1504_*_how-does-a-circle-record-carry-its-directive-once-a-spec-exists-and-who-may-correct-it-before-one-does.md` (the plan this was found under; its pointer form makes the wrong read worse, because a pointer read as prose yields a sentence instead of a Directive)

---
Resolved: 2026-08-18, **direction 2, partially** — closed on the user's instruction at the plan
gate, which named this record as step 4 of
`shared/planning/260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`.
What that step changed: the Step 6.5 handoff message no longer tells the orchestrator to take the
record's `## Directive` at face value. It now names both cases — prose while the section holds it,
and the spec or plan that `**Active spec/plan:**` cites once the section holds the pointer — which
is what keeps the pointer form from making the wrong read worse, the risk this record's
cross-references named.

**What is NOT fixed, stated here because closing the record leaves it with no open home.** The
sentence still asserts that the orchestrator performs a read no orchestrator step performs. Direction
1 — give Setup that read — was out of scope for that plan and remains undone, and it still carries
the precedence question this record raised: which wins when the user's prompt and the record
disagree. The three sites in the table above are unchanged at HEAD except for their line numbers.
Re-file if that gap should stay tracked.

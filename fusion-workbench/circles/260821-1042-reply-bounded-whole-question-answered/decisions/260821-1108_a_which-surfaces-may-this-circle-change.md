# Which surfaces may this Circle change?

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/_*_circle.md`

---

## Question

Four growth budgets bound the shipped text and two are all but spent. Measured on 260821: always-on
rules 3 566 bytes free, `agents/` 1 638, `skills/` 30, hook tests 32 lines. Any change to a skill body
forces a cut in the same plan, and two already-filed defects write into that surface.

## Options

1. **Rules and profiles**: `rules/` and `stilwerk/`.
2. **Plus the agent prompts**, `agents/*.md`.
3. **Everything, with the cut** that a skill body change forces.

## Answer: option 1, rules and profiles.

## What this forecloses

The `## Output Style` sections of the agent prompts stay as they are, including where they carry the
pattern this Circle is repairing. Several of them restate what `rules/user-facing-output.md` owns, which
is the copied-statement fault the preceding Circle was built around, so this boundary leaves a known
instance of it standing.

It also keeps the `agents/` budget's remaining 1 638 bytes untouched, which matters because it is the
last surface with room and nothing else in the queue is competing for it.

---
Answered: this record — the user answered at a gate in session `shared/history/260820-2103-orchestrator-session.md` on 260821, before the Circle was activated. Their words, not the orchestrator's reading of them.

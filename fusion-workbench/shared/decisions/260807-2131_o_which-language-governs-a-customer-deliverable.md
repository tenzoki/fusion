# Which language governs a customer deliverable, when chat and artifacts declare different ones?

---
**Domain:** knowledge
**Status:** open
**Filed by:** orchestrator, at a user gate during the language-split work (session 260807-2020); found by the coder executing step S9 of the plan below
**Cross-references:**
`agents/editor.md:16,62` (the two lines that read the declaration),
`rules/fusion-workbench-conventions.md` `## Project language` (the authoring home for both declarations, rewritten in `def9d13`),
`shared/decisions/260807-1515_a_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md` (the answer that created the gap),
`shared/planning/260807-2024_o_two-language-declarations.md` (the plan whose inventory missed this site)

---

## Question

The language boundary now has three cases, stated in `## Project language`: output the user reads in
the terminal takes the chat language, output that persists as a file takes the artifact language, and
text that ships to consuming projects is English regardless.

A customer deliverable fits none of them well. `agents/editor.md` writes polished Markdown documents
and branded PowerPoint decks to a project-side location, for a customer rather than for the project's
own machinery. It reads `**Language:**` to decide the deliverable's language: line 16 is the Setup
read, line 62 the operative one, which describes the target language as coming "from the task or the
project's `**Language:**` line".

Under the boundary as written, a deliverable is a file that persists, so the artifact language governs
and the editor is reading the wrong line. In this repository that would make every deliverable English
while the chat stays German. But a customer deliverable is not a workbench artifact: its language
follows the customer, not the project's internal record-keeping, and the two have no reason to agree.

The case split is complete — a deliverable does fall in the "persists as a file" branch — but
completeness is not the same as being cut correctly. That is what has to be decided.

## Why it must be decided rather than left

The editor's line 62 lets the dispatching task name a target language, so today's behaviour is
recoverable by anyone who remembers to pass one. That makes the question non-urgent, not moot: a
default that is wrong in the common case is a defect that hides until someone forgets. And the
boundary was just written into the authoring home as a three-way rule with no fourth case, so a
deliverable currently resolves by silence.

## Options

1. **Artifact language.** A deliverable is a file that persists, so it follows the same line as every
   other persisted output. `agents/editor.md:16,62` are changed to read `**Artifact language:**`.
   - Pros: no fourth category; the rule stays three-way and mechanically applicable. Consistent with
     the answered decision's general clause.
   - Cons: in this repository it makes customer deliverables English by default, which is very likely
     wrong for a German customer. Ties the deliverable's language to a declaration whose purpose is
     internal record-keeping.
2. **Chat language, with the reason written into the rule.** `agents/editor.md` is left as it is, and
   `## Project language` gains a named exception: a customer deliverable follows the chat language,
   because the chat language is the language the user works in with that customer.
   - Pros: matches the likely intent; costs no code change. The exception is named rather than
     discovered later.
   - Cons: adds a fourth case to a rule whose value is that it is cut by surface. "Chat language" is
     then doing two jobs, terminal output and customer-facing output, which are only accidentally the
     same thing.
3. **A per-deliverable declaration, no project default.** The editor requires the dispatching task to
   name the target language and fails loudly when none is given.
   - Pros: the only option with no wrong default, because it has no default. A deliverable's language
     genuinely is a per-deliverable fact.
   - Cons: an obligation, which carries a miss rate; `rules/critical-stance.md` §2 warns against
     exactly that shape. Makes the common case more expensive to get right.
4. **A third declaration, `**Deliverable language:**`.** Falls back to the chat language when absent.
   - Pros: names the category the other three options each squeeze into an existing one.
   - Cons: a third line in `CLAUDE.md` for a surface only one of the sixteen agents produces. The
     split from one line to two was justified by a measured incoherence; there is no measurement
     behind a third.

## Constraints

- Whatever is chosen must leave a single-declaration project unchanged. That project's chat language
  and artifact language are the same value, so every option above collapses to today's behaviour
  there, and any answer that does not is wrong.
- The answer belongs in `rules/fusion-workbench-conventions.md` `## Project language`, which is the
  authoring home. `agents/editor.md` cites it; it does not get a competing definition.
- The per-task override on `agents/editor.md:62` stays regardless of the answer. A deliverable's
  language can always be named explicitly; the question is only what happens when it is not.

## Recommendation

None. The filing agent has no evidence about how the user actually uses `editor`, and the choice turns
on that rather than on the rule's internal consistency. Option 1 is the most consistent and quite
possibly the least useful, which is the shape of question that should reach the user rather than be
resolved by an agent reading its own rule text.

**speculation:** option 2 is what most projects would want, on the reasoning that a consultant writing
for a German client works in German end to end. That is an assumption about usage, not a measurement,
and it is labelled accordingly.

---
Answered:
Implemented:
Deferred:
Superseded by:

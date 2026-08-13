The first of the three entrances says the orchestrator creates the Circle, and no shipped prompt creates one on that path

---
`docs/working-model.md:30` introduces `### How a Circle comes into existence` with an entrance
that does not exist: "**From a request you hand the orchestrator.** It resolves the scope and
runs the work; the Circle is created for you." `agents/orchestrator.md` creates no Circle
anywhere. Its `## Scope` enumerates its Circle writes and creation is not among them; the only
prompt in the plugin that creates a Circle directory is `agents/shaper.md:79`, in
anticipated-circle mode, which the orchestrator never dispatches. The passage labels this
entrance the most common one ("Most sessions are this") and the only one that "happens by
itself".
---

## Both sides read

**Documentation side**, `docs/working-model.md:26-32`:

> ### How a Circle comes into existence
>
> There are three entrances, and only the first one happens by itself.
>
> 1. **From a request you hand the orchestrator.** It resolves the scope and runs the work; the
>    Circle is created for you. Most sessions are this.

**Artifact side**, three reads.

`agents/orchestrator.md:234-249`, `## Scope`, the complete list of what the orchestrator may do
to a Circle:

> - Rename the Circle record `_t_circle.md` inside an active Circle directory at Phase 4 (`_t_`
>   to `_c_` or `_b_`) …
> - Write Circle-record **content** in exactly these three places and nowhere else …
> - Write or delete `fusion-workbench/.active-circle` …

Rename, three record sections, the pointer. No creation, and `## Circle head fields` (`:260`)
lists the acts that move the head fields — activation, Setup step 6, Step 0b.2, Phase 4 closure
— none of which is a creation either.

`agents/shaper.md:79` is the only creation site in the plugin:

> Creates the Circle **directory** `$OUT_CIRCLE/YYMMDD-HHMM-<directive-slug>/` (stable name, no
> marker), the record `_a_circle.md` inside it, and the six artifact subdirectories …

It sits inside mode 4, anticipated-circle, whose detection contract is `**Mode:**
anticipated-circle` (`agents/shaper.md:57`). The orchestrator dispatches the shaper in mode 1
only — `agents/shaper.md:43`, "This is what the orchestrator dispatches in Phase 0b.1 today" —
and mode 1 writes a spec, not a Circle.

Searched, not inferred: `grep -rn "Creates the Circle\|creates the Circle\|create the Circle\|
creating the Circle\|mkdir.*circles" agents/*.md skills/*/SKILL.md` returns `agents/shaper.md:65`
and `:79`, `skills/direct/SKILL.md:9` and `:86`, `skills/seed-from-plane/SKILL.md:101`, and
`skills/setup/SKILL.md:82` (which creates the empty `circles/` container). No hit in
`agents/orchestrator.md`.

**What the orchestrator actually does when no Circle exists** is treat that as the ordinary case
and write into `shared/`: `agents/orchestrator.md:214` ("If both counts are 0 … no hint is
printed — opt-in behaviour preserved") and `:807` ("If absent or empty → opt-in case, skip this
sub-step entirely").

## The document says the opposite two lines earlier, and so does its own history record

`docs/working-model.md:24`, the paragraph immediately above the new subsection: "Most sessions
run a single Circle **implicitly** — you don't have to think about Circles at all". `implicitly`
is exactly the no-directory case. `docs/philosophy.md:35` says the same: "Most sessions run one
Circle implicitly."

The step's own history record, `history/260813-2150-coder-working-model-circle-first-flow-and-backlog.md:44-45`,
describes what was intended: "three entrances — **implicit from a request**, captured by
`/fusion:direct`, promoted from a backlog entry". The prose that shipped promoted *implicit* to
*created*. That record also opens by promising that "what follows names, for every claim written,
the artifact it was checked against"; entrances 2 and 3 each name one, entrance 1 names none.

## Why it matters

The subsection's whole subject is where a Circle comes from, and its first entrance is both the
one a reader is told covers most sessions and the only one with no shipped mechanism behind it. A
reader who runs a plain orchestrator session and then looks for `circles/<stamp>-<slug>/` finds
nothing, and their plans, issues and decisions are in `shared/` — the correct behaviour, and the
opposite of what the doc led them to expect. Because the sentence also carries "only the first one
happens by itself", it teaches that the automatic path is the normal one and the two explicit
paths are the exceptions, which inverts the shipped design: every Circle in this plugin is created
by an explicit user command.

## Scope

`docs/working-model.md` only. `agents/orchestrator.md` and `agents/shaper.md` are consistent with
each other and nothing is broken at run time.

## Recommended fix direction

State entrance 1 as what the prompts do: a request handed to the orchestrator runs **without** a
Circle unless one is already active, and its artifacts land in `shared/` per the Origin Rule; an
active Circle got there by being activated (`/fusion:next`, `agents/orchestrator.md:249`), not by
being created in that session. If the entrance list is meant to answer "how does a Circle come
into existence", the honest answer is that every entrance is an explicit user command, which is
worth saying rather than burying. Do not resolve this by adding a creation step to
`agents/orchestrator.md` — that is a prompt change and a design question, outside this Circle's
Directive.

Related: the entrance count itself is short by one (`260813-2214_o_the-entrance-count-is-three-…`).

Filed by: coderev (review of Circle Turn 4, range `93388bc..c663a1f`, commit `a489966`).

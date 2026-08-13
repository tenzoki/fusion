The entrance count is three, and `/fusion:seed-from-plane` is a fourth that dispatches the same shaper mode

---
`docs/working-model.md:28` says "There are three entrances", and `:76` says of the shaper's
anticipated-circle mode that "`/fusion:direct` dispatches it". `skills/seed-from-plane/SKILL.md`
dispatches the same mode with the same three parameter lines (`:85-94`) and produces the same
artifact — "create the Circle directory `YYMMDD-HHMM-<directive-slug>/` with its record
`_a_circle.md` and the six artifact subdirectories" (`:101`). Both statements are closed counts,
and both are short by one. `README-agents.md`, edited in the same Turn, names that skill in the
`Passed by` cells of exactly those three parameters.
---

## Both sides read

**Documentation side**, two closed claims in `docs/working-model.md`:

`:28` — "There are three entrances, and only the first one happens by itself." The three are the
orchestrator request, `/fusion:direct`, and a backlog entry "promoted later by the same
`/fusion:direct` path" (`:32`) — so the list counts one variant of entrance 2 as an entrance
while omitting a distinct one.

`:76` — "The fourth, **anticipated-circle** mode, is the second line of the diagram:
`/fusion:direct` dispatches it, and it captures the refined Directive as a new anticipated
Circle."

**Artifact side**, `skills/seed-from-plane/SKILL.md`.

Its own description (`:2`): "Seed a new anticipated Circle from a Plane issue — one bounded read
of the story's title+description, then the standard `/fusion:direct`→shaper Circle-creation path."

Step 5 (`:85-94`) is the dispatch:

> Use the `Agent` tool with target `fusion:shaper`. The dispatch prompt's first non-empty content
> lines MUST be the mode + draft + domain parameters, in that order.
>
> ```
> **Mode:** anticipated-circle
> **Draft:** <the Plane story's title on the first line, then its description>
> **Domain:** <detected-domain>
> ```

`:101` states the outcome, and `:141` states that it produces an anticipated Circle and nothing
else: "It produces an **anticipated** (`_a_`) Circle only (DR-2). Activation stays the user's
explicit choice via `/fusion:next`."

The same repository already lists it: `README-agents.md:247`, the skills table — "Seeds a new
anticipated Circle from a Plane issue".

## The same Turn recorded the fact in one file and its negation in another

`README-agents.md` was corrected in `c663a1f` — the commit after the one that wrote these two
passages — to name `/fusion:seed-from-plane` as a passer of `**Mode:**` (`:65`), `**Draft:**`
(`:67`) and `**Domain:**` (`:68`), each cited to `skills/seed-from-plane/SKILL.md:92`, `:93`,
`:94`, `:97`. That correction closed
`260813-2052_c_the-passed-by-column-was-read-against-the-agent-prompts-only-so-two-skills-that-pass-parameters-are-missing.md`,
whose diagnosis was: "The `Passed by` column is the one column whose ground truth lives outside
the agent prompts, and it was populated from the prompts anyway."

That is the same cause here. `docs/working-model.md` §2 was written against `agents/shaper.md`
`## Four invocation modes`, and `agents/shaper.md:57` names one dispatcher: "the user (via
`/fusion:direct <draft>`) dispatches". The declaring prompt under-names its dispatchers, and the
doc inherited that. Whether `agents/shaper.md:57` should name both is a prompt question this issue
does not answer; the two passages in `docs/working-model.md` can be correct without it.

## Why it matters

§1's list answers "how does a Circle come into existence" and is the only place a reader is given
that answer end to end. A user with the Plane bridge configured has a fourth way, documented in
`docs/plane-setup.md` and in the skills table, and the one document that enumerates the entrances
tells them there are three. §2's claim is narrower and more load-bearing: it names the single
dispatcher of a mode that has two, in the paragraph a maintainer would read before changing that
mode's contract.

## Scope

`docs/working-model.md` only, two passages. `skills/seed-from-plane/SKILL.md` and
`skills/direct/SKILL.md` are correct as they ship, and `README-agents.md` already names both
dispatchers.

## Recommended fix direction

Add `/fusion:seed-from-plane` to §2's sentence at `:76` (it is the same mode, same contract, a
Plane story instead of a typed draft), and decide what §1's list is counting. If it counts
*commands that end in a new Circle*, it is four and entrance 3 folds into entrance 2 as the note it
already is. If a closed count cannot be maintained against a growing skill set, say "the entrances
are" and drop the number — the same treatment `README-agents.md:54` gives the parameter roster,
where the count is carried by a table that is checked rather than by a digit in prose.

Related: entrance 1 of the same list describes a mechanism no prompt has
(`260813-2214_o_the-first-of-three-entrances-…`).

Filed by: coderev (review of Circle Turn 4, range `93388bc..c663a1f`, commit `a489966`).

---

Resolved: 2026-08-13 — both closed counts are gone. `docs/working-model.md:28` no longer states a
number: the list is introduced by "these are the commands that reach it" and `/fusion:seed-from-plane`
is now item 3, checked against `skills/seed-from-plane/SKILL.md:87` (the dispatch is "the exact
`/fusion:direct`→`shaper` path"), `:92-94` (the three parameter lines `**Mode:** anticipated-circle`,
`**Draft:**`, `**Domain:**`), `:101` (it creates the Circle directory, the `_a_circle.md` record and
the six subdirectories) and `:141` ("It produces an **anticipated** (`_a_`) Circle only … Activation
stays the user's explicit choice via `/fusion:next`"), which is where item 3's activation clause comes
from. §2 at `:78` now names both dispatchers of anticipated-circle mode, checked against the same
`skills/seed-from-plane/SKILL.md:92-94` and against `agents/shaper.md:57`, whose detection contract
is the mode line these two skills pass. The count in §1 was dropped rather than raised to four, per
the issue's second option: the list now has no digit to go stale against a growing skill set.

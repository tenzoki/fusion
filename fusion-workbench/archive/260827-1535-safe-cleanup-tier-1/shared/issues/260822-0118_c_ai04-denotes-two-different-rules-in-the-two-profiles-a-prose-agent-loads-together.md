AI04 denotes two different rules in the two profiles a prose agent loads together

---

**Severity:** Medium
**Domain:** data
**Filed by:** ontorev, reviewing `084c626..dbf259a`, review file `circles/260821-1042-reply-bounded-whole-question-answered/reviews/260822-0121-ontorev-the-c06-rename-and-the-respelled-pointers.md`
**Affects:** `stilwerk/chat-voice-en.yaml:118-125`, `stilwerk/chat-voice-de.yaml:121-128`, `stilwerk/default-voice-en.yaml:165-175`, `stilwerk/default-voice-de.yaml:168-180`, and the four `fusion-workbench/stilwerk/` copies
**Cross-references:** `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2251_c_the-rules-blacklist-gloss-names-three-part-lists-while-ai04-now-governs-enumeration.md` (the rule-side half of the same divergence, closed); `shared/issues/260821-2207_o_the-rules-inventory-of-the-chat-profile-names-eight-of-nine-blacklist-entries-and-four-of-six-whitelist-entries.md`

---

## What is wrong

The four voice profiles share an `id:` namespace and do not share its meanings. A long-form-prose
agent is emitted one chat profile and one writing profile by `bin/fusion-rules` and holds both at
once, so both meanings are in one context.

`AI04` is the case where the two are different **rules**, not different names for one rule:

| | `id: AI04` name | what it forbids |
|---|---|---|
| `chat-voice-en.yaml:119` | "Mechanical enumeration" | using a list where sentences belong, and picking a list length for rhythm |
| `default-voice-en.yaml:166` | "Mechanical tricolons" | the three-part rhythmic figure |
| `chat-voice-de.yaml:122` | "Mechanische Aufzählungen" | as chat English |
| `default-voice-de.yaml:169` | "Mechanische Dreiergruppen" | as long-form English |

An enumeration of any length and a three-part figure are different faults with different remedies.
Nothing in either file says which `AI04` an instruction, a report or a later record means.

The German pair used to be the same string in both families. `1daf063` renamed the chat entry to
match its rewritten instruction, which was the right fix for that entry and is what separated the
two ids in German.

## The English namespace diverges further, in names only

Five of the eight shared ids carry two names for what is the same rule:

    AI01  chat "Generic AI phrases"              long "AI phrases"
    AI04  chat "Mechanical enumeration"          long "Mechanical tricolons"     <- different rule
    AI05  chat "Vague pronoun openers"           long "This/That starters"
    AI07  chat "Rhetorical question-answer pairs" long "Rhetorical Q+A"
    AI08  chat "Announcing structure"            long "Structural telegraphing"

`AI02` and `L04` agree in both languages. In German only `AI04` diverges; the other seven pairs
carry identical strings, so the English family is the looser of the two.

The name-only cases are the same fault the profiles' own C06 forbids ("one name, one formulation"),
committed across the two files that state it. The `AI04` case is more than that.

## Why it matters

Two readers are affected and neither can resolve the collision from the files.

An agent holding both profiles has no rule for which `AI04` binds its current output. In practice
it will apply both, which is harmless here because the two prohibitions do not conflict. That is
luck rather than design, and the next divergence need not be so lucky.

A record citing `AI04` is ambiguous. `260821-2251` had to say which family it meant, and the
records in `circles/260821-1042-reply-bounded-whole-question-answered/issues/` disambiguate by
naming the file every time. That works and it is not a property of the id.

## What to do

This record does not prescribe, because the cheap fix and the correct fix differ.

1. **Renumber the chat entry.** `AI04` in the chat profiles becomes a free id, and the two
   families stop asserting a correspondence they do not have. Cheap, mechanical, and it breaks
   every existing citation of chat `AI04`, of which this Circle wrote several.
2. **State that the namespaces are per file.** A line in each profile's header comment saying an
   id is local to its file. Costs bytes on four surfaces under a budget, and fixes the ambiguity
   without moving anything.
3. **Reconcile the English names to their German counterparts** where the rule is the same, which
   would close the five-of-eight drift and leave `AI04` as the one genuine divergence for route 1
   or 2 to answer.

Not established by this record: whether the id correspondence between the two families was ever
intended, or is an artefact of the chat profile having been derived from the writing profile. No
record in the workbench states either, and the profiles carry no note about it.

---
**Reconciliation 260822-0234** (reconciler, domain `code`, HEAD `05b46f2`). **Confirmed open and
correctly unfixed; one placement question is raised rather than acted on.**

The record is filed in `shared/`. Its load-bearing half was caused by this Circle's Directive, not
found beside it. `git log -S'Mechanical enumeration' -- stilwerk/chat-voice-en.yaml` returns exactly
one commit, `1daf063` (2026-08-21, "AI04 states one test where it had carried two remedies"), which
is inside `circles/260821-1042-reply-bounded-whole-question-answered` and is the commit that widened
chat `AI04` from the three-part figure to enumeration generally. The Circle record's own
`## Grounding snapshot` table lists chat `AI04` before that change as "the mechanical tricolon",
which is what the writing profile still says. Under the Origin Rule the AI04 divergence belongs in
`circles/260821-1042-reply-bounded-whole-question-answered/issues/`.

The counter-argument is real and is why nothing was moved: the same record also inventories five
English name-only divergences (`AI01`, `AI05`, `AI07`, `AI08` and the naming half of `AI04`) that
predate this Circle and are shared by origin. One record covers a Circle-origin fault and a set of
pre-existing ones, and splitting it to satisfy a placement rule would cost more than the misplacement
does. Moving it into a Circle that goes terminal tonight would also bury it.

**Left where it is, with the origin recorded here** so a later reader is not misled into treating
the divergence as inherited. Nothing in this record's diagnosis or its three routes is affected.

---
Resolved: fixed — the tricolon rule in both writing profiles carries its own id, AI12, so AI04 names the chat enumeration rule alone across the family (route 1 applied to the writing side, which nothing cites by id); stilwerk/default-voice-en.yaml:165, stilwerk/default-voice-de.yaml:168, mirrored to fusion-workbench/stilwerk/

# Consultation: two consumer findings — resolution-line citation form, and who may answer a decision

**Date:** 2026-09-05 05:29
**Status:** Complete
**Requested by:** user, relaying a consuming project's report

## Question

A consuming project reported two defects against the plugin and asked for both to be fixed
urgently. Finding 1: `rules/fusion-workbench-conventions.md` contradicts itself on whether a
resolution line's citation carries a store segment, and `rules/decision-record-examples.md`
teaches the form the other section calls a violation. Finding 2: a dispatched agent moved three
decisions the plan reserved for the user out of `_o_`, and nothing in the plugin caught it; the
report proposes a machine-readable user-reserved marker and a check that a resolution line's
citation does not resolve into the annotated file.

Both findings are correct in their factual claims. Neither is correct in its proposed fix, and
the second one's diagnosis is wrong about the mechanism: no filter failed, because a shipped
prompt instructs the transition the report treats as unauthorised.

## Context

The storeless citation form landed on 2026-08-29 in commit `f1099c5f` ("the citation form drops
the store segment, and every gate, helper and record reads it"). That commit rewrote
`rules/fusion-workbench-conventions.md` `## Filename Patterns` and swept the corpus. The decision
behind it is `260828-0904_*_does-fusion-ship-a-citation-checker-to-consuming-projects.md` and its
sibling `260829-1225_*_which-path-shaped-tokens-does-the-storeless-form-reach-beyond-a-record-citation.md`.

The sentence the consumer found in `## State Markers — decisions` predates that sweep. It was
already present on 2026-08-21 in commit `c2269497`, which only reformatted the marker table's
dashes and carried the sentence through unchanged. So the 260829 sweep edited one section and
left the marker table standing. The contradiction is a stale survivor, not a deliberate
exception, and nothing in the tree argues for the older reading.

## Analysis

### 1a. The contradiction is real and one-sided

`rules/fusion-workbench-conventions.md:243` states the rule and names the violation class:

> **A citation carrying a store segment is a violation the gates report** (`shared/<store>/`,
> `circles/<dir>/<store>/`, or `circles/` in front of a Circle)

and closes the same paragraph on the resolution-line case: the `:line` suffix stays, and when the
target is a record the path half is its storeless basename.

`rules/fusion-workbench-conventions.md:274` instructs the opposite, inside the `_a_` row of the
marker table: "Cite the path as it stands, whether that is inside a Circle or in `shared/`."

The gate implements the first reading, not the second. `hooks/lib/citation-scan.ts:154` defines
`REC_RE` over a `STORES` alternation that includes `analyses`, `decisions`, `planning` and
`history` (`hooks/lib/citation-scan.ts:137`), and the header at line 153 states that every match
is reported `store-prefixed`. The consumer's proposed deletion of the sentence at line 274, with
a pointer to `## Filename Patterns` in its place, is the correct repair.

### 1b. The worked example teaches the wrong form, and two exemptions hide it

`rules/decision-record-examples.md:53` carries `Answered: analyses/260501-1730-vector-store-comparative.md §5 — …`.
The token `analyses/…` matches `REC_RE` and would be reported `store-prefixed` anywhere else.

It is invisible to fusion's own gates for two independent reasons, either of which alone would
suffice. First, `hooks/lib/citation-scan.ts:212` lists `rules/decision-record-examples.md` in
`RECORD_EXAMPLE_FILES`, and `citation-scan.ts:563` applies that exemption ahead of every other
check in the chain, so every token in the file is reported `exempt` with the reason
`record-example-file`. Second, the line sits inside a fenced code block, which
`citation-scan.ts:579` exempts on its own.

The exemption's stated reason is that the file's records are fabricated by design, which is a
resolution argument: a made-up record cannot be found on disk. It silences the store-prefix
verdict as a side effect, and the store-prefix verdict does not depend on resolution at all. The
one file whose job is to teach the citation form is the one file where a wrong form cannot be
detected. We regard that as a defect in the exemption's granularity, independent of the example
it currently hides.

### 1c. The other half of the proposed fix would align the example against practice

The consumer proposes correcting `§5` to a `:line` suffix. That matches the stated rule and does
not match what this project writes.

Measured over fusion's own live workbench on 2026-09-05, excluding `archive/`, across all
`*_a_*.md` records: 33 records carry an `Answered:` line. Of those, 1 uses `path:line`. 13 cite a
heading anchor in the form `<basename>.md \`## Heading\``. 11 use some third form. 8 carry the
keyword with the first line empty and the citation below it. The command was a shell loop over
`find . -name '*_a_*.md' -not -path './archive/*'` classifying the first `^Answered:` line of each
file; it is reproducible from this report's date.

One record in 33 follows the mandated form. The heading-anchor form the corpus actually uses is
the one `## Filename Patterns` argues for everywhere else, on the ground that an edit above a
line moves it silently and no gate resolves `path:N`. A decision record's target is frequently a
session history that keeps being appended to, which is exactly the case that argument covers.

So the store-segment half of Finding 1 is a text repair, and the `:line` half is an open question
about which form a resolution line takes. Correcting the example to `:line` without settling that
question would pin the teaching file to a rule the project has abandoned in practice, and the
next sweep would have to undo it.

### 2a. No filter failed: a shipped prompt authorises the transition

The consumer writes that the move "was caught by a human-directed read … not by any of the
filters that should have held". There was no filter to hold, and there is a prompt on the other
side.

`agents/orchestrator.md:401` states the norm the consumer assumed:

> Open decisions … are user-input gates, not executor work. … The user may answer them inline
> (you record the answer + transition `_o_`→`_a_`)

`agents/reconciler.md:132` instructs a dispatched agent to perform the same transition itself:

> If `_o_` and an answer now exists under `$SCAN_ANALYSES`, `$SCAN_PLANS`, or in another
> decision: append `Answered: <path>:<line> — <one-line summary>` and rename `_o_` → `_a_`.

The reconciler's version carries a bound the orchestrator's does not contemplate: the answer must
already exist somewhere else, and the agent records where it is rather than choosing an option.
That bound is prose in one agent's prompt and nothing enforces it. An agent that reads line 132
and then supplies the answer itself has crossed a line that no mechanism draws.

We found no user-reserved concept anywhere in the plugin. A grep for `user-reserved`,
`reserved for the user` and `Reserved:` across `agents/`, `rules/`, `skills/`, `hooks/lib/` and
`CLAUDE.md` returned nothing. The consumer is right that the vocabulary cannot express the
distinction. It is also right that `_a_` reads as settled Grounding downstream:
`rules/fusion-workbench-conventions.md:287` puts `_o_` and `_a_` together as Grounding-Stand, the
current best-of-knowledge the project works from, with no field distinguishing their authority.

### 2b. The proposed self-citation check reports a sanctioned form

`rules/fusion-workbench-conventions.md:274` lists the legitimate targets of an `Answered:` line as
"typically an analysis, a plan, a session history, **or the decision record itself**". A check
rejecting a citation that resolves into the annotated file would report that fourth case, which
the same sentence the consumer wants edited also permits.

The allowance and the reconciler's bound already disagree on this point: the reconciler may cite
only an analysis, a plan or another decision, and never the record in hand. Adding the check
would settle the disagreement by mechanism rather than by decision, in a direction nobody has
recorded.

Measured on fusion's own corpus, 0 of the 33 `Answered:` lines cite their own record, and 0 carry
a store segment. The self-citation form is unused here. That is evidence about this project's
practice and not about the consumer's, and it does not establish that the form should be banned.

There is a deeper objection. The property the check would test is self-citation; the property the
consumer wants is authorship of the ruling. The report itself states that attribution is not
established and that the tree carries none. Under `rules/critical-stance.md` §4, a mechanism that
cannot decide a question from the inputs it has should change the question rather than
approximate it. Self-citation caught all three records in this instance because those three were
written by an agent inventing its own evidence, and a more careful agent citing a real analysis
would pass the check unchanged.

### 2c. The abstraction the answer needs already exists

`rules/fusion-workbench-conventions.md:465` gives every decision record a head field
`**Filed by:** <agent name or "user">, <person>`, whose person half is read from
`bin/fusion-identity` and never composed (`rules/fusion-workbench-conventions.md:442`). The field
already carries the agent-versus-user distinction the consumer wants, for the act of filing the
question. It has no counterpart for the act of answering it. The decision
`260827-1756_*_which-record-kinds-owe-the-person-half-of-filed-by.md` settled which record kinds
owe the field, and the resolution line was not in scope.

Extending that field's shape to the resolution line answers the decidable question ("who is
recorded as having ruled") from an input the mechanism holds at write time, in place of the
undecidable one ("did an agent overstep") that only a transcript settles. A downstream reader
then distinguishes a user ruling from an agent's by reading the record, and a gate can check that
a `_o_ → _a_` transition left a ruler behind. That is one change to an existing convention rather
than a new marker vocabulary plus a new check.

We have not designed the form of the extension, and we do not recommend one here. Whether it is a
suffix on the `Answered:` line, a second head field, or a claim block is a decision with
consequences for every existing `_a_` record, and it belongs in a decision record rather than in a
consultation.

## Recommendations

**R1 — Repair the contradiction now (`coder`, one edit).** Delete "Cite the path as it stands,
whether that is inside a Circle or in `shared/`." from the `_a_` row of
`rules/fusion-workbench-conventions.md` `## State Markers — decisions`, and put a pointer to
`## Filename Patterns` in its place. This half needs no decision: the storeless rule is binding,
the gate implements it, and the surviving sentence is a sweep miss. The same row's `_i_`, `_d_`
and `_s_` neighbours should be read in the same pass for the same drift.

**R2 — File a decision on the resolution-line citation form (`analyst`, type 7).** The question:
does a `Resolved:`/`Answered:`/`Implemented:` line carry `path:line`, or the heading-anchor form
32 of this project's 33 records actually use? Constraints to carry into the record: the argument
at `## Filename Patterns` against line numbers in living text applies to a session history that
keeps growing; and the answer determines whether `rules/decision-record-examples.md:53` gets
`:line` or an anchor. Do not correct the example before this record is answered.

**R3 — File a defect on the example file's blanket exemption (`coderev` or direct).**
`RECORD_EXAMPLE_FILES` silences every verdict for a file, including verdicts that do not depend on
resolution. Narrowing it to the resolution verdicts (`dangling`, `stale-marker`) while leaving
`store-prefixed` live would let the gate hold the one file that teaches the form. The fenced-code
exemption at `citation-scan.ts:579` covers the same line independently, so the narrowing alone
does not fix the example, and both need addressing together or the change buys nothing.

**R4 — Reconcile the two prompts before adding any mechanism (`analyst`, type 7).** The question
to record: may a dispatched agent perform `_o_ → _a_` at all, and under which bound?
`agents/orchestrator.md:401` and `agents/reconciler.md:132` currently give different answers, and
the consumer's incident is what the second one authorises. Settle this before designing a
user-reserved marker: if the answer is that only the orchestrator relays a user ruling, the marker
is unnecessary and the repair is a prompt edit.

**R5 — Then decide the ruler field (`analyst`, type 7, blocked on R4).** Extend
`**Filed by:**`'s agent-or-user distinction to the resolution line rather than introducing a
second vocabulary. Do not implement the self-citation check the consumer proposes: it reports a
form `## State Markers — decisions` sanctions, and it tests a proxy for a question the tree cannot
answer.

**R6 — Reply to the consumer.** Confirm both findings, name R1 as the immediate fix, and say that
the `:line` correction and the self-citation check are held pending R2 and R4 with the reasons
above. The consumer's measurement (102 of 108 conformant, 3 store-prefixed) is worth asking for
again after R2 lands, because a corpus that already prefers a form is evidence for the decision.

## Open Questions

- [ ] Which citation form does a resolution line take (R2)? Unanswered; the rule and the practice
      disagree 32 to 1 in this project.
- [ ] May a dispatched agent answer a decision, and under which bound (R4)? Two shipped prompts
      disagree.
- [ ] Does the `_a_` marker owe a ruler field, and in what shape (R5)? Blocked on R4.
- [ ] Attribution for the consumer's three records is not established here and cannot be: the
      tree carries none, and we did not read their transcripts.

## Sources

- `rules/fusion-workbench-conventions.md:243` (the storeless rule and the resolution-line clause),
  `:274` (the contradicting sentence), `:287` (Grounding-Stand), `:362` and `:368` (the annotation
  templates), `:442` and `:465` (`**Filed by:**` and the identity helper)
- `rules/decision-record-examples.md:53` (the worked example), `:112`–`:114` (the anti-patterns)
- `rules/critical-stance.md` §2 (reuse before building) and §4 (undecidable questions)
- `agents/orchestrator.md:401`, `agents/reconciler.md:132` (the two prompts)
- `agents/coder.md:46`, `agents/ontocoder.md:58` (the `_a_ → _i_` counterpart, bounded to a commit)
- `hooks/lib/citation-scan.ts:137` (`STORES`), `:153`–`:160` (`REC_RE` as a detector), `:212`
  (`RECORD_EXAMPLE_FILES`), `:563` and `:579` (the exemption chain)
- `git log -L 274,274:rules/fusion-workbench-conventions.md` → `c2269497` (2026-08-21);
  `git log -L 243,243:…` → `f1099c5f` (2026-08-29)
- Corpus measurement over `fusion-workbench/**/*_a_*.md` excluding `archive/`, taken 2026-09-05:
  33 `Answered:` lines, 1 `path:line`, 13 heading anchor, 11 other, 8 empty first line, 0
  self-citing, 0 store-prefixed

# How does this project keep a cardinality stated in prose true, when seven passes could not?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260825-2140_*_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`;
`260826-1132-reconciliation.md`;
`260826-1219-reconciliation-confirmation.md`;
`260826-1219_*_the-event-line-contracts-own-rule-sentence-says-a-half-of-a-set-this-circle-grew-to-three.md`;
`260826-1116-coderev-turn-3-the-count-corrections.md`

---

## Question

Circle C4 states, in shipped prose, how many sites read a definition, how many
readers apply a scoping, how many records a plan refers, and how many fields an
event line carries. Every one of those numbers was true when written. **Seven of
them were false at some later HEAD**, and each was found by a pass that came
after the one that missed it. No gate found any of them.

The Circle's own subject was that one definition has one implementation and
every site reads it. It shipped seven wrong counts about that mechanism while
saying so. The pattern therefore is not carelessness in one Circle: it is a
property of stating a cardinality in prose in a repository whose text is edited
by many passes that each see one file.

Now, because the next Circle inherits this and will otherwise re-derive it for
the eighth time.

## The evidence

Seven instances, all inside one Circle, all measured rather than recalled.

| # | Where | Said | Was | Found by |
|---|---|---|---|---|
| 1 | the `<ID>` conversion, `753932b` | all **three** emit templates | four | Turn 2 review |
| 2 | acceptance criterion 5 | **four** Turn-count sites | five | Turn 2 review |
| 3 | acceptance criterion 6 | **three** records referred | six | orchestrator, at closure prep |
| 4 | acceptance criterion 6, again | **six** | seven | reconciler, pass 1 |
| 5 | `rules/workbench-tracking.md:59` | **three** readers apply the scoping | four | reconciler, pass 1 |
| 6 | five shipped sites | `turns` replaced **four** whole-file greps | two blocks, five sites | reconciler, pass 1 |
| 7 | `agents/orchestrator.md:1279` | **a half** did not resolve | a set of three | reconciler, pass 2 |

Four properties of that table are the substance of this question.

**Each fix created the next instance, twice over.** Instance 4 was written by
`287f7ff`, the commit that fixed instance 3: the number was true of the file it
read and false of the file it wrote. Instance 7 survived `6deeb33`, whose commit
subject is *"the count of emit templates, of Turn-count sites and of SessionStart
commands is right in every place that states it"*, and which rewrote that very
line.

**The repair's own authoring home carried one.** Instance 5 is in
`rules/workbench-tracking.md`, the file this Circle designated as the single
authoring home for the scoping repair. Step 8 of the plan made the fourth reader
and step 9 told the executor to write "three".

**A hand pass has two blind spots, and only one of them was known.** The sixth
pass swept every count word within 110 characters of the mechanism's vocabulary,
108 candidate lines read one at a time, and stated its own boundary: it cannot
see a count that is right today and made wrong tomorrow by a commit touching
neither file. The seventh pass found instance 7 *inside* that declared scope,
because `half` is in no list of count words and because the heading two lines
above states its cardinality by naming its three members rather than by counting
them. **A cardinality can be carried by `half`, `pair`, `both`, `either`, `the
other`, or by a bare enumeration**, and a count-word sweep is blind to all of it.

**The cost is real and it is not the wrong number.** A reader who follows "three
readers" looks for three and stops. `260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md` was closed on "all three emit
sites" while a fourth stood, so a wrong count closed a defect that was not fixed.

## Options

1. **A gate over cardinality expressions.** Extend the lint surface to flag a
   sentence that states a cardinality near a defined vocabulary and cannot
   resolve it. Named already by the Turn 3 review.
   - Pros: the only option that catches instance 7's shape, and the only one that
     acts when a *third* file changes the count. Fits the pattern the project
     already uses, where a measured gate replaced a predicted one.
   - Cons: "states a cardinality" is close to undecidable from text, which is the
     shape `rules/critical-stance.md` §4 warns against; a gate that guesses will
     produce false alarms and be routed around, as the branch policy was.

2. **Do not state cardinalities: enumerate instead.** Replace "three readers
   apply that scoping" with the list of readers, so the count is the length of
   something a reader can see rather than a claim beside it.
   - Pros: removes the failure at its source, needs no mechanism, and shrinks the
     text. An enumeration that goes stale is visibly incomplete; a number that
     goes stale looks fine.
   - Cons: the sentences carrying these counts are prose about a design, and some
     of them are worse as lists. It also does not fix instance 7, where the
     heading *is* an enumeration and the following sentence miscounted it.

3. **Derive the count at read time.** Where a number describes something
   countable in the tree, generate it, as `bin/fusion-count-sources` and
   `bin/fusion-events turns` already do for their own figures.
   - Pros: cannot go stale; the project has precedent and a stated preference for
     deriving over hand-maintaining, which is why `agentstate.yaml` lost its seven
     counters.
   - Cons: reaches only the counts whose referent is mechanically enumerable.
     Instances 3 and 4 are, instances 5 and 7 are not without a vocabulary the
     tree does not carry.

4. **Accept the residual and say so.** State cardinalities, correct them when a
   later pass finds them, and record that this class of drift is expected here.
   - Pros: honest, costs nothing, and matches what actually happened seven times.
   - Cons: `260826-0136_*_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md` shows the cost is not cosmetic. And "a later pass finds
     it" is the assumption this Circle falsified: six passes ran and the seventh
     found one inside the sixth's declared scope.

## Constraints

- Any gate must be **decidable from the inputs it has** (`rules/critical-stance.md`
  §4). A cardinality classifier that guesses is the write-path classifier again.
- The three growth-bounded surfaces have 47 bytes, 16 bytes and 26 lines of head
  room. Anything adding shipped text or hook-test lines needs a cut first.
- Whatever is chosen must reach a cardinality carried by a **word** (`half`,
  `pair`, `both`) and by a **bare enumeration**, or it does not reach instance 7,
  the one that survived a commit written to remove it.
- The answer must not require a pass per Circle. Seven passes is what produced
  this record, and the eighth would find the eighth.

## Recommendation

None yet, and the reason is worth stating rather than filling the section. The
options split on a question this record cannot settle from its own evidence:
whether "a sentence states a cardinality" is decidable from text. If it is,
option 1 dominates, because it is the only one that fires when a third file moves
the count. If it is not, option 1 is the undecidable-question trap and the answer
is 2 and 3 together, applied where each fits, with 4 named honestly for the
remainder.

Deciding that needs one measurement nobody has taken: run a candidate detector
over the corpus and count what it flags against what a human confirms. That is a
Circle's worth of work and the reason this is filed open rather than answered.

## Answer (260827, user, at the gate — with the measurement this record asked for)

The measurement nobody had taken was taken first. A candidate detector (count words `one`..`twelve`/`both`/`half`/`either`/`pair` on lines also carrying a countable-referent noun — site, reader, emitter, command, source, template, step, field, …) flags **1,197 lines over the shipped text alone** (486 in `agents/`, 243 in `skills/`, 249 in `rules/`, as of `ce4175c`), and a hand-read sample puts true, checkable cardinality claims at roughly one in five flags. A gate at that precision over that volume is the undecidable-question trap §4 of `rules/critical-stance.md` names, and would be routed around as the branch policy was. So option 1 falls on the record's own criterion.

**Chosen: options 2 and 3 together, with 4 named for the residual** — enumerate (name the members), derive (cite the command that counts), and where neither fits, stamp the figure `as of <commit>` so staleness is visible instead of plausible. The norm is authored once, as `rules/critical-stance.md` §5 (always-on, so every agent carries it into every edit), with this record as its binding decision. `CLAUDE.md`'s own summary of the critical-stance norms stopped counting its list in the same change.

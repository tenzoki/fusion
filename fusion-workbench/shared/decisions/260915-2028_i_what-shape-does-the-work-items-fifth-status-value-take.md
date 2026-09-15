# What shape does the work item's fifth `**Status:**` value take — its name, its claim, its edge, and what its body owes?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260910-2011_*_the-deferred-state-has-no-value-in-the-work-items-status-set.md` (the defect that raised it) · `260908-2018_*_is-a-closed-prerequisite-a-satisfied-edge-or-no-edge-and-what-is-an-archived-one.md` (the node set) · `260908-2018_*_does-the-new-field-name-only-the-ordering-edge-or-the-four-relation-types-beside-it.md` (the edge's one relation) · `260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md` (the helper reports and gates nothing) · `260915-2028_*_a-fifth-status-value-for-work-items.md` (the plan that executes whichever answer this takes)

---

## Question

The user has ruled that `**Status:**` gains a value meaning "not now": set aside deliberately, not abandoned, expected back. The existence of the value is settled and is not re-opened here. What is not settled is its shape, and four sub-questions have to be answered together because each constrains the others: the word, whether `**Claim:**` survives it, whether a `**Depends-on:**` edge pointing at it is discharged or live, and what the body is obliged to say.

It must be answered now because the four are load-bearing on code, not only on prose. `hooks/lib/work-graph.ts` admits a record to its node set on an allowlist of exactly `open` and `claimed`, so a fifth value written into a record today falls out of the graph silently: the item disappears from `bin/fusion-work-order`'s report, and a dependent naming it is printed **`ready`** with its entry listed as naming no item. That is a wrong answer on the one figure a reader acts on, and it is produced by adding the value with no code change at all.

## Options

The four sub-questions are answered as one shape, because a split answer (say, the claim stays but the edge discharges) produces a value nobody can read consistently. Each option below is a complete shape.

1. **`paused`, live, claim cleared, blocks its dependents, body names what it waits for.** The node set is read as *the non-terminal statuses* rather than as the enumeration `{open, claimed}`, which is what it always meant; `paused` joins it. `Readiness` gains a third value so a paused node is never printed `ready`, while its `depth` and `blocks` stay computed. `**Claim:**` is cleared, so pausing is Release plus a recorded reason and resuming is a plain Claim by anybody. The body says *what* the item waits for, never a date; where the thing waited on is another work item, that is a `**Depends-on:**` entry and not prose.
   - Pros: the edge semantics need no new rule, because the field's existing definition ("the named item must reach `done` or `dropped` before this item may start") already yields *blocks* for a status that is neither. `**Claim:**` keeps one meaning on live items: somebody is working on it now. Resuming needs no takeover, an operation whose whole definition is contention. The value buys something no word can, because the helper answers the "is the prerequisite discharged" half mechanically on every run.
   - Cons: three files of code change (`hooks/lib/work-graph.ts`, `hooks/order.ts`, and the fixture test), and the test lands on a surface with one line of head-room. A reader loses the ability to see, from the record alone, which checkout set the item aside; that fact lives in the commit that paused it.
2. **`paused`, live, claim retained, blocks its dependents, body names what it waits for.** As option 1, except `**Claim:**` stays and names who set the item aside.
   - Pros: the record says who is expected back, without opening a commit. Matches how `done` and `dropped` keep the field.
   - Cons: gives `**Claim:**` a fourth reading, alongside absent on `open`, current on `claimed`, and historical on `done` and `dropped`. A second checkout resuming the item has to overwrite a claim nobody holds, which the conventions describe only as a takeover under contention. And two checkouts reading a paused item with a third party's claim both hesitate over work neither is doing.
3. **`deferred`, otherwise as option 1.** Same shape, the project's own existing word for the state.
   - Pros: it is the word the defect, `CLAUDE.md` and the migration body all already use, so no reader has to learn a second term.
   - Cons: `deferred` is already **terminal** wherever this project uses it: `_d_` on an issue, `_d_` on a plan, `_d_` on a decision, and `_d_` on the retired Circle record, every one of them listed under `## Terminal states are history`. Putting it on a live item status gives one word two opposite lifecycle meanings in one project, on a store whose readers move between item records and decision records constantly.
4. **`paused` as prose only: the value is added to the conventions and no code changes.**
   - Pros: no bounded test surface is touched, and the change is one file.
   - Cons: ships the defect described in the Question. A dependent on a paused item reads `ready`, which is a false invitation to start work whose prerequisite is not met, and the paused item itself vanishes from the only report over the store. The value would then be decoration on exactly the question it was added to answer.

## Constraints

- **Scope resolution must not move.** `bin/fusion-claimed-item` requires both `**Status:** claimed` and a matching eight-hex claim, so a fifth value is not matched under any option and the item in scope is unchanged. Any shape that would have to relax that test is refused.
- **`## Terminal states are history` is not touched.** `done` and `dropped` stay the item's terminal pair; the fifth value is live and no terminal record is edited back into it. This is also the answer for a `_d_` Circle record in a workbench being migrated: it is terminal, so it converts to nothing, and work wanted back from one is a new item citing it.
- **The bounded surfaces are measured, not assumed.** Taken at `d92beb1a`: `agents/*.md` 59 804 bytes of margin, `skills/*/SKILL.md` 312 bytes, the hook test suite **1 line**, and the tightest dispatch path (`reviewer`) 26 053 bytes. No answer here may be implemented by editing a baseline map or a head-room constant.
- **A cardinality here is enumerated.** The value count in the conventions, in `CLAUDE.md` and in `agents/orchestrator.md` is stated as a numeral in three places today; whichever answer lands moves all three in the same commit.

## Recommendation

**Option 1.**

The four sub-answers fall out of one reading rather than four rulings, which is what makes it a shape instead of a pile of special cases. The reading is that the work item's status set is partitioned into *live* and *terminal*, and that every mechanism over the store keys on that partition and never on the enumeration. `{open, claimed}` was never the node set's definition; it was the complete list of the live values on the day the node set was written. Under that reading the edge semantics need no amendment at all, the field's own sentence already yielding *blocks*, and the `**Claim:**` answer follows with it: the field means "somebody is working on it now" on every live value, and a paused item is not being worked on.

Option 3 is option 1 with a worse word and is rejected on the collision alone. Option 2 is defensible and was weighed seriously; what decides against it is the takeover. Option 4 is the one that must not be taken, because it puts the value's whole justification, which is the edge answer, out of reach of the only thing that could give it.

**The honest residual, which no option removes.** Whether a paused item is *still* paused for a reason that still holds is not decidable from the record, and no date in the body would make it so. What the recommendation does about that is to refuse the date and require the *what*: a wait on another item becomes a `**Depends-on:**` entry, where the currency question is answered mechanically on every run, and a wait on anything outside the store stays a word nobody is obliged to maintain, exactly as `open`, `claimed` and `**Active spec/plan:**` already are. The fifth value adds no new undecidable question; it adds one more word that can go stale, in exchange for the one question over this store that is mechanically decidable and is answered wrongly today.

---
Answered: `260915-2028_*_a-fifth-status-value-for-work-items.md` `## Approach` — option 1: `paused`, live, `**Claim:**` cleared, blocking its dependents, the body naming what it waits for and never a date. Ruled at the plan gate, where the four sub-answers were put together with the plan that implements them; the user approved the plan as it stood, with step 3's hook-test line budget left as the one point to return on. Option 3 was rejected on the word: `_d_`, deferred, is terminal in all three surviving marker vocabularies, which is the opposite of what this value means; ruled by user, Kai Stalmann <ks@qantr.com>.

---
Implemented: 55be2491 — `paused` in the conventions' work-item grammar with its transitions, claim-absent row and body obligation; admitted to the node set in `hooks/lib/work-graph.ts` with `Readiness` gaining a third value; the Pause operation in `agents/orchestrator.md`; the archive dependency scan widened; pinned in `hooks/lib/__tests__/work-graph.test.ts`. Corrected at d2fdd1b6, where the transition sentence stopped contradicting itself. Released as v11.3.0.

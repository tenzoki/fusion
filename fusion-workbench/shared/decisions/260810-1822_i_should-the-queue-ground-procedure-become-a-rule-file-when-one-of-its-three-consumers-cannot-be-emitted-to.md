# Should the queue-ground procedure become a rule file, when one of its three consumers cannot be emitted to?

---
**Domain:** code
**Status:** implemented
**Filed by:** orchestrator (on the executor of `I:260810-0501-citation-root`)
**Cross-references:** `shared/issues/260810-0501_c_two-skills-cite-a-prompt-section-they-have-no-documented-route-to-read.md`; `shared/issues/260810-0511_o_the-queue-head-parser-is-written-twice-in-one-file-that-calls-itself-the-canonical-implementation.md`; `rules/fusion-workbench-conventions.md` header table (the four topics already partitioned out)

---

## Question

`#### Reading a queue` inside `agents/orchestrator.md` is a procedure three consumers must run
verbatim: the orchestrator itself, `/fusion:setup` Step 3, and `/fusion:next` Step 5. A procedure
with three consumers and one authoring home is what `rules/` exists for, and the conventions file's
own header table records four topics already moved out on exactly that reasoning.

The citation was repaired instead (each skill now roots its path through `$FUSION_PLUGIN_ROOT`), and
that closes the immediate defect. It does not answer whether the section belongs where it is.

The obstacle is specific and was measured rather than assumed: **emission does not reach
`/fusion:next`.** `bin/fusion-rules` takes an agent name and serves agents only. `/fusion:setup`
calls `fusion-rules orchestrator` and would pick a new rule file up for free. `/fusion:next` calls
`fusion-paths` and never `fusion-rules`. `/fusion:cleanup` calls neither.

So route 2 as filed would remove the cross-file citation for one of three consumers and leave the
other two citing a rule file by path — the same shape as today, one directory over. That is the part
that has to be decided, not the move itself.

## Options

1. **Leave it in the prompt, keep the rooted citations.** What shipped today. The procedure has one
   home, two consumers reach it by a rooted path, and the runtime presence check makes a missing
   section audible instead of silent.
   - Pros: no new mechanism; already verified; the presence check is stronger than any lint the
     project had on that section before.
   - Cons: a shared procedure lives inside one agent's prompt, which is the arrangement the
     conventions file already rejected four times. Task `260810-0511` is the same smell in the same
     section — the queue-head parser is written twice inside the file that calls itself canonical.

2. **Move it to `rules/queue-ground.md` and accept that skills cite it by rooted path.** The rule
   file becomes the authoring home; the orchestrator keeps only its own site-specific tables
   (`#### Where the ground moves`, the Phase 4 retirement), which are orchestrator behaviour.
   - Pros: one authoring home, matching the four existing partitions; the orchestrator picks it up
     through `fusion-rules`; `260810-0511`'s duplicate is resolved in the same change.
   - Cons: two of the three consumers still cite across files, so the citation is relocated rather
     than removed. Touches `bin/fusion-rules`, `queue-ground-lint.test.ts`,
     `rules-emission-golden.test.ts`, both skill bodies and `CLAUDE.md`.

3. **Move it, and give skills a route to `fusion-rules`.** Option 2 plus a change to the Setup
   contract so a skill resolves its own rule set under its own name, the way it already does with
   `fusion-paths`.
   - Pros: the only option under which the citation genuinely disappears for all three; closes a
     real asymmetry, since skills already ask `fusion-paths` under their own name and the two
     helpers are documented as a matched pair.
   - Cons: much the largest. `bin/fusion-rules` currently takes agent names and exits 2 on anything
     else, and `rules/workbench-path-resolution.md` records that the argument domains differ on
     purpose — `fusion-rules` maps an agent to rule-file patterns, which it calls an authored fact
     about an agent with no meaning for a skill. Option 3 contradicts that reasoning and must
     answer it, not route around it.

## Constraints

- The presence check shipped today must survive any option: a consuming project whose install lacks
  the section has to be told, not silently skipped.
- `rules/rule-file-provenance.md` applies to any new file under `rules/`.
- Whatever is chosen should settle `260810-0511` in the same change, since both concern the same
  section.

## Recommendation

None yet, deliberately. Option 3 is the only one that removes the citation rather than moving it,
but it reverses a documented design decision about the two helpers' argument domains, and that
decision deserves to be read and answered rather than overridden in passing. Option 1 is defensible
as an end state and not merely as a stopgap, which is why this is a decision and not a defect.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: user decision, session `260810-1646` (`shared/history/260810-1646-orchestrator-session.md`)
— **option 1, leave the procedure in the prompt.** The rooted citations plus the runtime presence
check are the end state, not a stopgap. The section stays in `agents/orchestrator.md`, the two skills
reach it through `$FUSION_PLUGIN_ROOT`, and a consuming project whose install lacks the section is
told so rather than silently skipping the step.

Options 2 and 3 were both declined. The reasoning that decided it: neither removes the cross-file
citation for all three consumers without also reversing the documented split between
`bin/fusion-rules` (agent names, rule-file patterns as an authored fact about an agent) and
`bin/fusion-paths` (agents and skills in one namespace). Option 2 relocates the citation one
directory over; option 3 pays for its removal by contradicting that split. Neither price buys enough
over what already shipped.

**One consequence, recorded so it is not discovered later as a surprise.** This record proposed that
whichever option was chosen should settle `260810-0511` in the same change — the queue-head parser
written twice inside the section that calls itself the canonical implementation. Option 1 does not
settle it. That defect stands on its own and stays queued as task 16; it is a duplication inside one
file and does not depend on where that file lives.

Implemented: 89b13f1 — the rooted citations and the presence check are on disk; option 1 requires no
further change, so the answer and its realisation are the same commit.

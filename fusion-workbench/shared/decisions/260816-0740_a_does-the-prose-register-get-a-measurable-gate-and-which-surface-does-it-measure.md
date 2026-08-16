# Does the prose register get a measurable gate, and which surface would it measure?

---
**Domain:** code
**Status:** answered
**Filed by:** analyst
**Cross-references:** `shared/analyses/260816-0740-rhetorical-register-of-agent-output.md` findings 10 and 11; `shared/issues/260816-0740_o_the-always-on-rule-corpus-runs-at-sixteen-times-the-em-dash-ceiling-it-states.md`; `shared/issues/260816-0740_c_the-gate-contract-never-requires-an-option-to-state-what-it-forecloses.md`; `shared/analyses/260706-1902-user-facing-agents-garbled-language-rootcause.md`; `hooks/lib/__tests__/helpers/growth-bound.ts`

---

## Question

`hooks/lib/__tests__/` holds 41 test files. Every one measures structure: path literals,
marker format, citation resolution, provenance headers, derivable enumerations, review
coverage, domain cascade order, deliverable language, byte growth of the four shipped
surfaces. Not one measures a prose property.

The style rules are therefore the only normative surface in this project that is stated and
never gated, and they are also the surface the corpus most visibly contradicts: the always-on
context runs at 16.3 em-dashes per 1000 words against a stated ceiling of 1.

The question must be answered before the corpus is repunctuated rather than after. This
project's own history is that an ungated normative claim drifts back; the growth bounds exist
because exactly that happened to the shipped surfaces. If no gate holds the corpus at its
ceiling, the repunctuation is a one-time cleanup with a known decay curve.

## Options

1. **Gate the shipped prose only.** A test over `rules/*.md`, `agents/*.md`,
   `skills/*/SKILL.md` and `CLAUDE.md` that fails when em-dash density exceeds the stated
   ceiling.
   - Pros: the surface is fixed, version-controlled and already the subject of four other
     lint gates, so the pattern is established. It measures the cause identified in finding 10
     rather than the symptom. It composes with the growth bounds: same files, same suite.
     One number, mechanically checkable, no judgement.
   - Cons: measures one figure out of thirteen inventoried. Correctio, prosopopoeia, verbless
     fragments and sententia are not mechanically detectable at acceptable precision. A file
     can pass at zero em-dashes and still be written in the register.
2. **Gate the agent output store.** A test or a `bin/` helper over `shared/history/`,
   `shared/reviews/` and the Circle equivalents.
   - Pros: measures what the user actually reads. Would have caught the reported sample.
   - Cons: the output store has never been read by a test, and it grows every session, so the
     gate would fail on artifacts nobody is going to edit. `rules/fusion-workbench-conventions.md`
     `## Project language` already settles the analogous case against retroactive rewriting.
     A gate that fails on unfixable history is a gate that gets disabled.
3. **Both, with different mechanisms.** Gate the shipped prose as a `npm test` failure; report
   on the output store as an advisory helper in the shape of `bin/fusion-staging-drift`, which
   names a condition and never blocks.
   - Pros: each surface gets the enforcement it can carry. The advisory shape is an established
     pattern here with two existing members.
   - Cons: two mechanisms to maintain for one property. The advisory half has the known
     weakness of every advisory: it is read when someone looks.
4. **Neither. Fix the corpus and rely on the imitation effect.** If finding 10's inference
   holds, a compliant corpus produces compliant output with no gate at all.
   - Pros: no new mechanism, and it is the only option that addresses all thirteen figures
     rather than the one that is countable.
   - Cons: rests entirely on an inference that has not been tested. Recommendation 4 of the
     analysis is the test, and it cannot run until the corpus is fixed.

## Constraints

- Any gate must not fail on a shrink. `hooks/lib/__tests__/helpers/growth-bound.ts` establishes
  the principle for the byte bounds and the same holds here: this measures a rate, and reducing
  it is never a failure.
- Existing artifacts are not rewritten. `rules/fusion-workbench-conventions.md`
  `## Project language` settles this for the analogous language case and the reasoning carries.
- A gate must not itself add prose to the always-on corpus. A rule file explaining the gate
  would be counted by the gate and would raise the very number it measures.
- Whatever is chosen must survive the four failing growth bounds. A new test file adds lines to
  the hook test surface, which is bounded at 2500 lines
  (`hooks/lib/__tests__/surface-growth-bound.test.ts`).

## Recommendation

**Option 4 first, then re-ask.** The analysis's causal claim is an inference, not a measured
result, and option 4 is the only one that tests it. Fix the corpus, run the falsification
measurement from recommendation 4 of the analysis against the next session's output, and
re-open this record with a number.

If the output rate does not fall with the corpus rate, option 1 becomes the answer: it is the
cheapest, it fits an established pattern, and its known weakness (it measures one figure) is
acceptable because that figure is the one whose removal forces the restructuring the other
figures ride on.

Option 2 is not recommended in any branch. The store it would measure is append-only history
that this project has already decided not to rewrite.

The last constraint above is the one that will bite: a new test file competes for head-room
with every other addition to the hook test surface, so option 3's two mechanisms are more
expensive than they look.

---
Answered: `shared/history/260816-0804-orchestrator-session.md:88` — **Option 4**, chosen by the user
at an orchestrator gate on 2026-08-16. No gate is built now. The corpus is repunctuated first,
the falsification measurement from recommendation 4 of the analysis runs against a later
session's output, and this record is re-opened with a number rather than an inference.

The user's scope choice narrows what "fix the corpus" means for the first pass:
`rules/user-facing-output.md` alone, 38 em-dashes of the corpus total of 372. The remaining six
files keep their rates, so the measurement that re-opens this record will run against a corpus
still above the ceiling. Whoever re-opens it must not read a null result as falsifying finding
10's causal inference: a 2563-word repair inside a 22 763-word corpus is a weak dose, and the
inference is only tested by a corpus at or near the ceiling.

This record stays answered rather than implemented until that measurement exists. It is not
`_i_`, because option 4's content is precisely a test that has not yet run.

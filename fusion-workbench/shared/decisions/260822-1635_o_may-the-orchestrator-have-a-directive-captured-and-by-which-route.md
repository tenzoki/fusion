# May the orchestrator have a Directive captured as an anticipated Circle, and by which route?

---
**Domain:** code
**Filed by:** user, at the close of session 260822-1009
**Cross-references:**
`shared/decisions/260813-0027_i_should-the-orchestrator-be-able-to-dispatch-the-shapers-portfolio-activation-mode.md`
(the precedent: the same question asked of the shaper's mode 3, answered yes under a quoted-user
condition);
`shared/issues/260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`
(the measured gap this closes);
`shared/planning/260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` (the specification whose five
Circles nobody could create at the moment they were specified);
`agents/orchestrator.md` `## Re-sharpening an anticipated Circle (shaper portfolio-activation)`
(the condition any answer here reuses);
`agents/shaper.md:70` and `:132` (the mode-4 contract an answer either leaves alone or makes
conditional)

---

## Question

The orchestrator cannot cause an anticipated Circle to come into being. It may transition one, write
`.active-circle`, and write four named parts of a Circle record, and it is forbidden from authoring
Directive prose (`agents/orchestrator.md:240`). Creating a Circle belongs to `/fusion:direct`, which
dispatches the shaper's anticipated-circle mode.

The gap was measured at the close of session 260822-1009. A specification defining five Circles was
written and approved, its first Circle was planned and executed to completion, and the workbench held
no Circle for any of the five. The orchestrator had specified them and could not create them. The
closing report had to name that as a limitation and hand the user a command to run by hand.

**The need is settled and is not what this record asks.** The permission is missing and the precedent
exists: `260813-0027` asked exactly this of the shaper's mode 3 and answered yes, bounded by a
condition. What is open is the **route**, and the routes differ in what they cost and in what they
oblige other prompts to say.

## Options

1. **Form A — the orchestrator invokes `/fusion:direct` as a skill.** It already holds `Skill` in its
   tool allowlist. The skill runs the clarification rounds, dispatches the shaper, creates the Circle
   and writes the record. The orchestrator gains a short section saying three things: that this route
   exists, under what condition it takes it, and that it still writes no Directive prose.
   - Pros: **nothing in `agents/shaper.md` changes.** Its mode-4 contract says the mode is dispatched
     via `/fusion:direct`, and that stays literally true because the skill remains the dispatcher.
     Text lands on one prompt rather than two. Costs a few hundred bytes on `agents/*.md` and nothing
     on `skills/`.
   - Cons: the skill body opens "The user invoked `/fusion:direct <draft>`", which becomes inaccurate
     unless that sentence is widened. Whether the flow works end to end from inside an orchestrator
     session is not decidable from the text and needs a trial run.
2. **Form B — the orchestrator dispatches the shaper directly in mode 4**, following the pattern
   mode 3 already has, with an `**Initiated by:**` line carried in the dispatch as the audit trail.
   - Pros: symmetric with the permission that already exists for mode 3, so a reader meets one shape
     twice rather than two shapes once. No dependency on skill invocation working from an agent.
   - Cons: text on two prompts instead of one, and an absolute sentence in `agents/shaper.md` becomes
     conditional — the mode-4 contract would no longer be able to say the mode comes via
     `/fusion:direct`.
3. **Neither — the permission stays absent and the user runs `/fusion:direct` by hand.** The status
   quo, named so it is visibly rejected rather than unconsidered.
   - Pros: no prompt text anywhere, and no risk that the orchestrator starts creating Circles on its
     own initiative.
   - Cons: the measured gap stays. A session that specifies Circles ends by telling the user to create
     them, and the portfolio cannot rank what the session just designed.

## Constraints

- **The condition is cited, not repeated.** Any answer reuses the test the re-sharpening section
  already states — can the user's own words asking for it be quoted — by pointing at that section
  rather than restating it. Two versions of one test in one prompt is how they drift apart.
- **Without that bound the orchestrator begins creating Circles on its own initiative**, which is the
  automation the original prohibition exists to prevent. The bound is not decoration on the
  permission; it is the reason the permission can be granted at all.
- **`agents/orchestrator.md:240` stands unchanged** in every option: the orchestrator authors no
  Directive prose. What an answer grants is the ability to have prose written, never to write it.
- No baseline value moves.
- Under Form A, no sentence in `agents/shaper.md` is touched, and no sentence in
  `skills/direct/SKILL.md` except possibly its opening.

## Decidability

The need is decidable from existing text and is settled above. **Whether Form A works is not
decidable from existing text**, because no agent has invoked this skill before and the prompts do not
say whether one can. It is decidable by trial, so the trial runs first and its result goes to a user
gate before any prompt text is written.

## Measurement, taken 260822-1635

Verified at HEAD `ec02964`, before the trial run completed:

- `agents/orchestrator.md` frontmatter carries `Skill` in its `tools:` line, alongside
  `Agent(fusion:shaper)`, `Bash`, `Read`, `Write`, `Edit`, `AskUserQuestion`.
- `skills/direct/SKILL.md` frontmatter declares
  `allowed-tools: [Bash, Read, Write, Edit, AskUserQuestion, Agent(fusion:shaper)]`.
- **Every tool the skill needs is in the orchestrator's allowlist.** The intersection is complete,
  with no tool the skill declares that the orchestrator lacks.
- The orchestrator's never-invokes list names `consultant` and itself, and names no skill
  (`agents/orchestrator.md:1336-1338`), so nothing forbids the invocation today.
- `agents/orchestrator.md:11` writes the Setup path inline while naming `/fusion:setup` as the
  canonical user-triggered route, which is the prompt already treating a skill's steps as something
  an agent may perform.
- Head-room on `agents/*.md`: 401 242 bytes against a budget of 417 843, so 16 601 free. The surface
  is not a constraint on any option here.

## Recommendation

None on the route; that is the user's and it turns on the trial. What the filing agent can state is
that option 3 leaves a gap that has already been measured once, in the session that filed this record.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

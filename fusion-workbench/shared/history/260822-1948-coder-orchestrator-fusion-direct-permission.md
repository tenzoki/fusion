# coder — the orchestrator may have a Directive captured via `/fusion:direct`

**Status:** Complete
**Dispatched by:** orchestrator
**Circle:** none active (shared store)
**Source:** `shared/decisions/260822-1635_*_may-the-orchestrator-have-a-directive-captured-and-by-which-route.md`
(Form A, chosen by the user at a gate after a successful trial run)

## What landed

One section, `## Capturing a Directive as an anticipated Circle (/fusion:direct)`, added to
`agents/orchestrator.md` between `## Re-sharpening an anticipated Circle (shaper
portfolio-activation)` and `## Phase 0: Scope Resolution`. It says three things and nothing else:
that the route exists and what the skill does end to end, that the condition is the one the
re-sharpening section already states, and that the orchestrator still authors no Directive prose.
It also says why the bound exists, which is the part the decision record's constraints require to
be stated rather than cited: without it the orchestrator begins creating Circles on its own
initiative, and that automation is what the prohibition at `agents/orchestrator.md:240` was written
against.

**The test is cited, never restated.** The section points at **Re-sharpening an anticipated
Circle** above and applies its distinguishing rule as it stands. No second version of "can you
quote the user's own words" was written.

## Placement, and why

Beside the re-sharpening section rather than inside `## Scope`. Three reasons. The section cites
that neighbour's test, so a reader following the pointer travels one screen rather than the length
of the prompt. Its shape is the same: a permission, one condition, and a statement of what stays
forbidden, which `## Scope` cannot carry as a bullet. And `## Scope`'s Directive bullet already
ends by pointing at that neighbour ("The prose is the shaper's"), so a reader who arrives through
`## Scope` is already sent to the right place, and the bullet itself is one the dispatch put out of
bounds.

## What was deliberately not touched

- `agents/shaper.md` — its mode-4 contract stays literally true under Form A, since the skill
  remains the dispatcher.
- `skills/direct/SKILL.md` — its opening ("The user invoked `/fusion:direct <draft>`") stays as
  written; the user declined the widening at the gate.
- `agents/orchestrator.md:240` and the whole re-sharpening section.
- All four growth-bound baseline maps.

## The invocation table and the never-invokes list

Neither needs anything, and the reason is the same for both: they are about **agents**. The table's
key column is `Agent` and every row names one; `/fusion:direct` is a skill, and adding a skill row
would change what the table enumerates. The `**Never invokes:**` list names `consultant` and
`orchestrator`, both agents, and names no skill (checked at `agents/orchestrator.md:1336-1338`
before the edit), so nothing there forbade the invocation and nothing there now permits it either.
The `shaper` row was also left alone: under Form A the orchestrator does not dispatch the shaper's
anticipated-circle mode, the skill does, so the row's two shapes are still the two the orchestrator
performs.

## Measurement

- Section size: **1438 bytes**. `agents/orchestrator.md` 150 311 -> 151 749.
- `agents/` surface: 401 242 -> 402 680 against a budget of 417 843. Head-room **16 601 -> 15 163**.
- Reference-resolution pin: `records` 115 -> 116, `paths` and `anchors` unmoved. The one new token
  is the section's citation of decision `260822-1635`. Re-approved with **one** attribution block
  above `const BASELINE`, costing **6 lines**; the hook-test surface goes 20 073 -> 20 079 lines
  against 20 375, so head-room there is **302 -> 296**.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` regenerated twice (once per surface that
  moved). Its whole diff is two `orchestrator.md`/`agents total` lines and two
  `reference-resolution-lint.test.ts`/`hook-tests total` lines.
- No baseline map moved: `git diff` over `surface-growth-bound.test.ts` and
  `rules-emission-golden.test.ts` is empty.

## Verification

`cd hooks && npm test` — exit 0, 724 tests in 41 files. The same command was run before the edit
(exit 0, 724 tests), so the two failures the edit produced, the golden and the pin, are attributable
to it and nothing else was already red.

## Files changed

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/surface-growth.golden`

Not committed, per the dispatch.

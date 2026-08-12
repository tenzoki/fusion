# Planner — remove the protected-path half of the compliance guard

**Date:** 2026-08-12 12:32
**Agent:** planner
**Status:** Complete
**Dispatched by:** user, directly

---

## What was asked

Plan the removal the user decided at 260812-1230: the protected-path half of the compliance guard,
not narrowed and not defaulted empty but removed. Hold the scope against the escalation counter and
the churn apparatus, both separately open. Answer, by reading the code rather than reasoning about
it, what still blocks a tool call once protected paths are gone.

## What was produced

`shared/planning/260812-1232_o_remove-the-protected-path-half-of-the-compliance-guard.md` — ten steps,
two Mermaid diagrams, an exhaustive goes/stays/changes inventory across hook source, configuration,
tests and prose, and a migration section for consuming projects.

Two defect records and two decision records, listed in the plan's closing table. Two further questions
turned out to be already on record and were deliberately not re-filed.

## The blocking question, answered by measurement

Three sites in `hooks/guard.ts` write a block and one site in `hooks/tracker.ts` raises the halt.
CHECK 1 (`:458`) is not an independent source. CHECK 2 (`:501`) and `tracker.ts:593` are the
protected-path half and go. **CHECK 3 (`:604-649`), the decision-governed check, survives** and is a
real input in code.

It ships inert. `hooks/config.json` and `DEFAULTS` both declare `decisions`, `categoryPaths` and
`categorySensitivity` empty; neither consuming project on this machine declares any of them. `krk`'s
37,186-event log holds 50 `guard_block` rows, all with detail `Protected path`, all between 2 and
7 August, and zero `guard_halt` rows ever. No `decision_governed` block has been recorded anywhere.

So escalation is not orphaned in code and is orphaned in practice, and those are different statements
that lead to different next steps. The removal was not extended on that basis; the successor question
was filed instead.

## Measurements taken for the plan

- **The 11/153 failure was reproduced** against a scratch copy of the tree at `HEAD` with
  `guard.protectedPaths` emptied, matching the figure the driving record measured at `5acc626`.
  The eleven files were named and each was classified as goes, rewrite, or split.
- **Per-file test counts and durations** from a green baseline JSON run. `guard-rules-write-integration.test.ts`
  is 111 tests and 119.8 s of test time; the three heaviest removals take roughly 200 s of parallel
  test work out of the suite.
- **The rule's byte cost.** `rules/protected-path-discipline.md` is 10,541 bytes of a 98,443-byte
  always-on floor, 10.7 percent of every dispatch's rule context, read off the golden fixture.
- **Twelve citations of that rule** outside the workbench, two of which are docstrings on modules that
  stay and must be rewritten rather than deleted.
- **Import tracing** established that `matchesAnyFolded` and `canonicalise` lose their last callers
  while `collapseSegments`, `foldCase`, `matchesAny`, `projectRelative` and `isFusionPluginRoot` keep
  theirs. Keeping `collapseSegments` in `guard.ts` matters: CHECK 3 still needs the `..` collapse.

## Reuse rather than filing

Two questions the planning surfaced were already on record, and the Research Gate caught both before a
duplicate was written:

- `260804-1632_d` already asks whether `findRelevantDecisions` should fold case. The plan changes one
  of its stated constraints (it says "This is CHECK 3, not CHECK 2", and after the removal there is no
  CHECK 2) rather than raising the question fresh.
- `260809-1224_d` already asks whether CHECK 3 is live, deferred with an explicit re-open trigger:
  measure whether any reachable consuming project populates its configuration. **That measurement was
  taken here and reads zero**, which by the record's own terms settles it as retired. The new decision
  record is scoped to the successor question that record does not ask.

## Scope held

Every place the plan touches churn or escalation, it says which lines and stops. The deepest it reaches
into either is two docstring corrections, in `hooks/lib/churn.ts:214` and `hooks/lib/guard-state-file.ts:15`,
both of which cite the rule file being deleted while describing a defect class that stays real.

## Not done

Nothing was implemented. No code, data or ontology file was modified. The scratch copy used for the
suite measurement lived under the session scratchpad and was removed afterwards.

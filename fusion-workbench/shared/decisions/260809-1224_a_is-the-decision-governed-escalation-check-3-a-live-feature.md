# Is the decision-governed escalation (CHECK 3) a live feature, or a retired one still carrying its configuration surface?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator
**Cross-references:** `shared/analyses/260809-1101-guard-support-layer.md` (finding 2, recommendation C5); `hooks/lib/config.ts`; `hooks/config.json`; `hooks/lib/paths.ts`

---

## Question

The compliance guard carries a third check whose escalation is governed by
decision records: a set of configuration keys (`decisions`, `guard.categoryPaths`,
`guard.categorySensitivity`, `guard.defaultSensitivity`), a `sensitivityLevel`
resolution and a `findRelevantDecisions` lookup, costing roughly 60 lines across
`config.ts`. On the defaults fusion ships, the check never fires: `hooks/config.json`
declares `"decisions": []`, so the lookup has nothing to match.

The surface is nonetheless reachable. Since the per-project configuration layer
landed, any consuming project can populate those keys in its own `fusion-guard.json`
and the check will run. Nothing in this repository can see whether a consuming
project does so.

The question must be answered before recommendation C5 of the support-layer
analysis can proceed. Deleting the surface blind would remove a documented feature
that a project may be relying on; keeping it untested leaves 60 lines that no test
exercises on a non-empty configuration.

## Options

1. **Retired — remove the check and its configuration surface.**
   - Pros: removes about 60 lines and four configuration keys that have never
     fired on shipped defaults. Shrinks `config.ts`'s validation surface, which
     the analysis measured as the largest single contributor to that module.
   - Cons: silently breaks any consuming project that populated the keys. The
     breakage would be quiet: the project's configuration would simply stop
     having an effect, with no diagnostic, which is the same silent-wrong-answer
     class the guard exists to avoid.

2. **Live — keep the check and give it tests that fire it.**
   - Pros: closes the gap between a reachable feature and an untested one. If a
     project is relying on it, the reliance becomes safe rather than accidental.
   - Cons: costs effort rather than saving it, and runs against the session's
     stated goal of simplification. Writing tests for a feature nobody is
     measured to use spends the budget on the wrong end.

3. **Deprecate in two steps — announce, then remove.**
   - Pros: a release that emits a diagnostic when a project populates the keys
     converts the silent breakage of option 1 into a visible one. The removal
     then happens with evidence instead of assumption.
   - Cons: two releases instead of one, and the diagnostic is itself code that
     has to be written and later removed.

## Constraints

- The answer must not be guessed from this repository. No consuming project's
  configuration is visible from this tree, and the analysis said so explicitly
  rather than inferring an answer.
- Whatever is decided, the outcome has to be checkable: a claim that "no project
  uses it" needs a stated method for having looked, not an assumption.
- The known consuming project of interest, `unite`, is not on this machine. Any
  check requires access to it or to its `fusion-guard.json`.

## Recommendation

None yet, deliberately. The user answered the gate with "do not know, check
first", which rules out options 1 and 2 as immediate actions and leaves the
prior question open: has any consuming project populated `decisions` or the
three `guard.category*` keys?

The cheapest way to close it is to read `fusion-guard.json` from each consuming
project the user has, `unite` first. If none declares those keys, option 1 becomes
safe and option 3 becomes unnecessary. If one does, option 2 is forced.

Until then, recommendation C5 stays blocked and no code on this path is touched.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — re-opened on its own trigger (measurement of 2026-08-12 is zero); option 1, retired: remove CHECK 3 and its four configuration keys. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:

---

**Reconciliation 260809-1651 (reconciler, domain `code`) — stays `_o_`. No answer exists on disk, and none could have arisen from this session.**

Searched for an answer across `shared/analyses/`, `shared/planning/`, `shared/decisions/` and the six commits `451a07e..fb262d8`. The support-layer analysis that raised the question states the same constraint the record does — no consuming project's configuration is visible from this tree — and the defect round touched none of the four files the question is about: `hooks/lib/config.ts`, `hooks/config.json` and `hooks/lib/paths.ts` are absent from the diff, and the configuration surface (`findRelevantDecisions`, `sensitivityLevel`, `guard.categoryPaths`, `guard.categorySensitivity`, `guard.defaultSensitivity`, `decisions`) is unchanged and still inert on shipped defaults.

The blocking step is unchanged and is not a code step: read `fusion-guard.json` from each consuming project the user has, `unite` first. Recommendation C5 of `shared/analyses/260809-1101-guard-support-layer.md` stays blocked behind it.

---
Deferred: until someone measures whether any reachable consuming project has populated the check's
configuration surface. User, session 260811-0752 (chat).

**Trigger, so this is a deferral and not a shelf.** Re-open when a measurement exists over the
consuming projects this developer can reach: does any of them populate `decisions` or the rest of
CHECK 3's configuration? A non-zero answer settles it as live (option 2, keep it and give it tests
that fire it); a zero answer settles it as retired (option 1, remove the check and its
configuration surface). The record already establishes that the user's own answer at the gate was
"do not know, check first", which rules both out as immediate actions — the deferral records that
state rather than leaving the question looking unasked.

Nothing is blocked meanwhile: the check is inert either way, and its cost is the configuration
surface it advertises, not any behaviour.

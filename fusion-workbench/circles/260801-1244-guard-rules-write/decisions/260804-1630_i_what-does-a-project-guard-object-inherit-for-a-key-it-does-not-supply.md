# What does a project's `guard` object inherit for a key it does not supply?

---
**Domain:** code
**Status:** open
**Filed by:** planner, planning the C5b remediation
**Cross-references:**
`circles/260801-1244-guard-rules-write/issues/260804-1601_*_a-partial-guard-object-silently-removes-every-protected-path.md` (the measurement that raises this),
`circles/260801-1244-guard-rules-write/issues/260804-1603_*_the-project-config-layer-is-not-type-validated-so-a-wrong-type-fails-the-guard-open.md` (the validation whose drop behaviour this decides),
`circles/260801-1244-guard-rules-write/analyses/260804-1600-c5b-independent-assessment.md` `### The merge semantics, assessed as a design`,
`shared/planning/260801-1122_o_spec-normative-consolidation.md:299` (the merge rule as specified),
`hooks/lib/config.ts:277-292` (the merge and the leaf fallback), `:144-168` (`DEFAULTS`),
plan `circles/260801-1244-guard-rules-write/planning/260802-1856_*_plan-guard-rules-write.md` `### Q2` (where the consequence was reasoned through for one field and not turned around)

---

## Question

The loader replaces a top-level object whole, then fills that object's missing leaves from
the in-code `DEFAULTS`. `DEFAULTS.guard.protectedPaths` is the empty list
(`hooks/lib/config.ts:149`). So a project that writes `{"guard":{"enabled":true}}` — the most
ordinary edit there is, a project writing down that the guard is on — loses all nine
protected patterns, on both write surfaces, and the guard emits `guard_allow`, the event that
means nothing unusual happened.

This must be answered before any code in the remediation plan's Step 2 can be written,
because it also decides what the type validation in that same step does with a key it drops.
A validator that drops `"protectedPaths": 123` with a diagnostic, on today's merge, still
empties the list — the crash becomes a silent unprotection wearing a diagnostic. The two
questions cannot be answered separately.

**One thing that is easy to miss, and it is why the question is asked about the merge rather
than about one key.** The same omission defect exists for `escalation`, `churn`, `crossFile`
and `decisions`. It is invisible today only because the plugin's `hooks/config.json` and
`DEFAULTS` happen to carry identical values for every leaf in those four objects — checked at
HEAD `53b3765`, and `guard.protectedPaths` is the single leaf where the two sources differ.
Nothing keeps them agreeing. An answer scoped to `protectedPaths` alone leaves four latent
instances of the same defect, armed the day someone edits a threshold in one file and not the
other. Filed separately as
`circles/260801-1244-guard-rules-write/issues/260804-1633_*_the-omission-defect-is-latent-in-four-more-top-level-keys.md`.

## Options

1. **A key the project does not supply falls back to the plugin layer, then to `DEFAULTS`.**
   The fallback becomes per-leaf across all three layers instead of per-leaf across the chosen
   object and `DEFAULTS`. A project that *declares* `protectedPaths: []` still gets the empty
   list, so deliberate narrowing — the half of D2 a union could not express — is untouched.
   Only *omission* changes meaning, from "protect nothing" to "inherit".
   - Pros: closes the accidental case without a special case for one key, and closes the four
     latent instances with the same three lines. It is also the more literal reading of the
     spec's own sentence, "keys the project omits fall back to the plugin's, then to
     `DEFAULTS`" (`:299`). A validator's dropped key then behaves exactly like an omitted one,
     which is one rule for two mechanisms rather than two rules.
   - Cons: "the project's object replaces the plugin's whole" stops being literally true of
     the shipped code, so the template's `_override` note and Step 6's documentation both have
     to be rewritten around the leaf rule. A project that genuinely wants "no protected paths"
     must write `"protectedPaths": []` rather than omitting the key, and nothing announces
     that at the moment it matters.
2. **Keep the merge as it is and emit a diagnostic when a declared `guard` object omits
   `protectedPaths`.**
   - Pros: cheapest, reuses the `diagnostics` channel Step 6 already built, and preserves the
     replace-whole rule the spec states and the template describes.
   - Cons: it does not prevent the state, it only stops it being silent — and the project that
     meets the diagnostic is the one already running unprotected. The four latent instances
     stay open unless a diagnostic is written per key, which is four rules where option 1 is
     none. A diagnostic per guarded tool call is also the noise shape the loader accepted
     deliberately for an *unparseable* file, which is a rarer state than a partial object.
3. **Leave the behaviour and document it.**
   - Pros: no code, no change to a merge rule the spec fixed.
   - Cons: the template then has to say plainly that omitting `protectedPaths` from a `guard`
     object means "protect nothing", which is a sentence whose first effect on a reader is to
     ask why that is the default. It also leaves the guard in the state the spec itself argues
     against for C5c: a control that reports normal operation while protecting nothing.

## Constraints

- Deliberate narrowing must keep working. A project that declares its own `protectedPaths`
  gets exactly that list — spec criterion `:327`, and it is what D2 asked for.
- Whatever is chosen decides what type validation does with a dropped key. State it in the
  same answer.
- The answer must be expressible as one rule an agent and a project owner can both state from
  memory. Five per-key rules is the shape this Circle has repeatedly found to be wrong.
- The behaviour must be pinned by a case in the integration suite that fails when the rule is
  mutated, not only by a unit case over the loader.

## Recommendation

None. The planner's job here is to state that not answering ships option 3 by default, with
none of option 3's documentation — which is the state the independent assessment refused to
ship.

---
Answered:
Implemented:
Deferred:
Superseded by:

## Answer

**Option 1: a key the project does not supply falls back to the plugin layer, then to `DEFAULTS`.**

Chosen by the user at the plan gate, 2026-08-04. The fallback becomes per-leaf across all
three layers. A project that *declares* `protectedPaths: []` still gets the empty list, so the
deliberate narrowing D2 asked for is untouched; only *omission* changes meaning, from "protect
nothing" to "inherit".

It carries two obligations named in this record's own `## Constraints`, and both bind the
implementation rather than being optional:

- **The replace-whole sentence stops being literally true**, so the template's `_override`
  note and the loader's documentation are rewritten around the leaf rule in the same change,
  not after it. A template sentence that is false propagates verbatim into every project
  `/fusion:setup` touches.
- **Type validation must drop a bad key the same way an omission behaves**, so one rule covers
  both mechanisms.

The four latent instances (`escalation`, `churn`, `crossFile`, `decisions`, filed at
`issues/260804-1633`) close with the same three lines rather than with four per-key rules.

---
Answered: this record, `## Answer` — user chose option 1 at the plan gate; omission means inherit, declaration means exactly what is declared.

---
Implemented: f82ac02 — the per-leaf walk across project layer, plugin layer and DEFAULTS landed in `hooks/lib/config.ts` (C5b remediation plan Step 2; a declared value, including a declared empty list, is taken as declared; a dropped key behaves as omitted). The bound documentation obligations landed with it: the template's `_override` rewritten around the leaf rule in `21a72b7`, `README-hooks.md` and `rules/protected-path-discipline.md` in `373f5ed`. Walked `_a_` → `_i_` by the reconciler at the final Circle reconciliation 260805-2323.

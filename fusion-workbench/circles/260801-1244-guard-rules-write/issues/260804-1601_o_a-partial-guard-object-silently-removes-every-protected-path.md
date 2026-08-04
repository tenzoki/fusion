# A partial `guard` object in `fusion-guard.json` silently removes every protected path

---

**Severity:** High
**Domain:** code (security control)
**Filed by:** analyst, independent assessment A1 of C5b
**Affects:** `hooks/lib/config.ts:145-168` (`DEFAULTS.guard.protectedPaths` is the empty list), `:277` and `:286` (the merge and the leaf fallback); `templates/fusion-guard.json` `_override`
**Cross-references:**
`circles/260801-1244-guard-rules-write/analyses/260804-1600-c5b-independent-assessment.md` `### The merge semantics, assessed as a design`,
`shared/planning/260801-1122_o_spec-normative-consolidation.md:299` (the merge rule as specified),
plan `260802-1856_o_plan-guard-rules-write.md` `### Q2` (where the consequence is stated for `defaultSensitivity` and not for `protectedPaths`)

---

## What is wrong

The merge replaces a top-level object whole and then fills missing leaves from `DEFAULTS`.
`DEFAULTS.guard.protectedPaths` is `[]`. So any project object under `guard` that omits
`protectedPaths` inherits "protect nothing" rather than the plugin's nine patterns.

The plan anticipated exactly one instance of this rule and judged it harmless:

> A project that writes `guard: { protectedPaths: [...] }` and omits `defaultSensitivity`
> gets `defaultSensitivity` from `DEFAULTS`, not from the plugin's file. Both values are
> `"medium"` today, so nothing observable changes.

The reverse case is not harmless and is not mentioned anywhere in the spec, the plan, the
three session histories, or the template.

## Measured

Real guard subprocess (`tsx guard.ts` via `hooks/lib/__tests__/helpers/guard-harness.ts`),
throwaway consuming project root that is not a plugin root, shipped `hooks/config.json`, no
environment flag set:

```
fusion-guard.json = {"guard":{"enabled":true}}

  Edit  agents/coder.md                        allow      event: guard_allow
  Edit  rules/x.md                             allow      event: guard_allow
  Edit  skills/demo/SKILL.md                   allow      event: guard_allow
  rm -rf agents                                allow      (no event)
  rm -rf fusion-workbench/.guard-state         allow      (no event)
  Edit  fusion-guard.json                      DENY       (the floor, appended after the merge)
```

Identical results for `{"guard":{"defaultSensitivity":"high"}}` and for
`{"guard":{"categoryPaths":{"api":["src/api/**"]}}}`.

Baseline for comparison, same harness, no `fusion-guard.json` at all: `Edit agents/coder.md`
denies with `Protected path: agents/coder.md`.

## Why it matters

Three ordinary intentions — write down that the guard is on, raise the sensitivity, add one
category — each remove the whole protected list on both surfaces, including
`fusion-workbench/.guard-state/**`, which is the directory the halt machinery lives in.

The failure is silent in the strongest sense available: the guard emits `guard_allow`, which
is the event meaning nothing unusual happened. No advisory, no diagnostic, no dashboard row,
no stderr. The spec's own argument against building a control that only appears to be one
(`:245`) applies here and was not turned on this file.

Writing a partial object is the normal way people edit JSON. This is not an adversarial case.

## Suggested direction — three options, none picked here

1. **Leaf-fallback to the plugin layer for `protectedPaths` only.** Keeps whole-object
   replacement everywhere else, so "narrow the list" still works: a project that *declares*
   `protectedPaths: []` still gets an empty list. Only an *omitted* key falls back to the
   plugin's. This preserves everything D2 asked for and closes the accidental case.
2. **Emit a diagnostic when a declared `guard` object omits `protectedPaths`.** Cheapest, and
   it reuses the `diagnostics` channel Step 6 already built. It does not prevent the state,
   it just stops it being silent.
3. **Leave it and document it.** Requires the template to say plainly that omitting
   `protectedPaths` from a `guard` object means "protect nothing", which is a sentence that
   invites the reader to ask why that is the default.

Option 1 is the one I would argue for, and it is roughly three lines. Whichever is chosen,
the case belongs in the existing
`describe("what a project configuration can currently reach — measured, not endorsed")`
block in `hooks/lib/__tests__/guard-rules-write-integration.test.ts`.

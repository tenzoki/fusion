# Step 5 — remove the churn configuration leaves

**Date:** 2026-08-15
**Agent:** ontocoder
**Status:** Complete
**Plan:** `planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` step 5
**Verification:** `cd hooks && npm test` — exit 0, 46 test files, 842 tests, 74.85 s
**Follows:** step 4, `a69d56e`

---

## What was removed

The two leaves that configured the heatmap step 4 deleted:
`churn.changesPerSessionWarning` (5) and `churn.changesPerSessionCritical` (10).

| File | Edit |
|---|---|
| `hooks/config.json` | the `"churn"` block deleted; its `_comment` said the file defines "the escalation and churn thresholds" and now says "the escalation threshold" |
| `hooks/config.example.json` | the `"churn"` block deleted, including its own `_comment` recording decision `260809-2004` (why there was no lifetime threshold) |
| `fusion-guard.json` | the `_gitTracked` note's clause "how loud the churn warning is and" removed from the list of what the file decides |
| `templates/fusion-guard.json` | the identical clause, removed identically |
| `skills/help/SKILL.md` | "churn thresholds" struck from the compliance-guard configuration pointer — a judgement, see below |

Nothing was retired. `churn` is not treated the way `guard.protectedPaths` is: an unrecognised key
passes through the loader untouched and unreported, which is the right answer for a key no project
ever set. A project that somehow carries one gets silence, not a per-call advisory.

## The pair is a byte-identical gate and both halves moved together

`hooks/lib/__tests__/config.test.ts` cuts the keys named in its `PROJECT_SET_KEYS`
(`["orchestrator"]`, line 1261) out of `fusion-guard.json` and `templates/fusion-guard.json` and
holds every remaining byte equal. Editing one alone is a red suite. Verified independently of the
suite as well:

```
diff <(sed '2d' fusion-guard.json) templates/fusion-guard.json   # no output
```

Line 2 is this repository's own Turn budget, `"orchestrator": { "maxTurns": 12 }`, the one
project-set key.

**The clause removal was not a pure deletion.** The sentence lists three things the file decides,
and the churn clause carried the list's only conjunction. Deleting the literal string
"how loud the churn warning is and" would have left "…when it escalates to a halt, how many Turns
the orchestrator may run", a two-item list with no "and". The conjunction was kept:
"…when it escalates to a halt, and how many Turns the orchestrator may run".

## The help-skill line, and why this step took it

`skills/help/SKILL.md:106` pointed a user at `hooks/config.example.json` for "Decision categories
and their sensitivities, churn thresholds, escalation behavior". It is named in neither step 4's
file list nor step 5's, and it is item 3 of
`issues/260815-1206_o_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md`.

It was edited here, deliberately and not routinely. The line is not a stale mention of a mechanism
that happens to be gone — it is a claim about the *contents of the file this step empties*, and it
became false at the moment the block came out of `config.example.json`. The step that falsifies a
statement owns it. No gate would have caught it: `reference-resolution-lint` scans this file, but
the only path-shaped token on the line is `hooks/config.example.json`, which still exists.

The two other items in that record were left alone and the record stays open for them:

1. `.gitignore:39` — `!bin/fusion-churn-rank`, a re-inclusion exception for a file step 4 deleted.
   Dead, harmless, and not a configuration leaf.
2. `.claude-plugin/plugin.json:4` — the shipped description still advertises "churn detection".
   The record asks that this be sequenced with step 9, which rewrites the same sentence for the
   domain values. Rewriting it twice is the thing to avoid.

## Further churn references met, and their status

A full sweep (`grep -rni churn`, excluding `node_modules`, `.git` and the workbench) leaves three
classes standing, and none is a defect:

- **Past-tense prose in the hook sources and their tests** — `tracker.ts`, `self-detect.ts`,
  `fail-open.ts`, `guard-state-file.ts`, `paths.ts`, `project-relative.ts`, `escalation.ts`,
  `config.ts`, and five test files. All are step 4's deliberate record of what the heatmap was and
  when it went. `hooks/lib/config.ts:42` already names `churn` as removed on 2026-08-15.
  `hooks/dist/**` mirrors them, as built output.
- **The narrative removal notices** in `README.md`, `README-hooks.md`, `CLAUDE.md` and
  `docs/working-model.md`. Same class.
- **`skills/cadence/SKILL.md`, nine occurrences, all keepers.** Its "churn" is a cadence metric —
  themes ranked by distinct sessions — with no relation to the guard heatmap. The plan says so at
  `## Current State` and it holds.

## Files written

- `hooks/config.json`
- `hooks/config.example.json`
- `fusion-guard.json`
- `templates/fusion-guard.json`
- `skills/help/SKILL.md`

No file was deleted, so nothing was staged by `git rm`. Every change is an unstaged modification.

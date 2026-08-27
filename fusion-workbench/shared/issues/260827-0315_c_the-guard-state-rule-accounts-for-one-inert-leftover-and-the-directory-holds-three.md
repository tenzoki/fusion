The guard-state rule accounts for one inert leftover and the directory holds three
---
`rules/workbench-tracking.md` `## The four classes` enumerates what `.guard-state/` contains: "The throttle stores in it are the two measurement throttle records, and they are the whole of it", plus `events.jsonl`, plus `escalation.json` named as the one file "written by nothing at this version". That accounts for four entries. This repository's own `.guard-state/` holds six.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## What is on disk

Measured 260827-0315 in `fusion-workbench/.guard-state/`:

| File | Size | Last written | Status |
|---|---|---|---|
| `review-coverage.json` | 46 B | 260815-2327 | live throttle record |
| `staging-drift.json` | 74 B | 260826-1758 | live throttle record |
| `events.jsonl` | 155 052 B | 260826-1853 | live, appended per guarded call |
| `escalation.json` | 3 301 B | 260817-1041 | inert, named by the rule |
| `churn.json` | 109 454 B | 260810-2159 | inert, **not** named by the rule |
| `state-drift.json` | 20 B | 260815-1443 | inert, **not** named by the rule |

## Why the two unnamed ones are inert

`grep -rn 'churn.json\|state-drift.json'` over `hooks/*.ts`, `hooks/lib/*.ts`, `bin/`, `skills/` and `agents/`, excluding `__tests__`, returns three hits and all three are comments (`hooks/tracker.ts:46`, `hooks/tracker.ts:481`, `hooks/lib/fail-open.ts:42`). No shipped code writes either file. Their writers were deleted with the mechanisms they served: the churn heatmap in `a69d56e`, the state-drift counters in `f45f76a`.

## Why this is a defect and not an untidy directory

The rule states it is *the* definition of what each workbench entry does, and its four-class partition claims to tile the layout tree exhaustively. The sentence "they are the whole of it" is a cardinality claim about a directory's contents, and it is false against the disk by two files. A reader applying the rule to write a consuming project's `.gitignore` reaches the right answer anyway, because `.guard-state/` is class L in full and the pattern is `fusion-workbench/.guard-state/*`. The cost is elsewhere: the rule is the surface a reader consults to learn what is live, and it currently answers that `churn.json` does not exist. 109 KB of it does.

A second asymmetry: `/fusion:setup` Step 3 offers to delete `escalation.json`, the one leftover the rule names, and offers nothing for the two it does not. A workbench that has run through both removals keeps them indefinitely with nothing ever mentioning them.

## Where it was found

Not in the active Circle's Directive. It surfaced while answering a user question about the non-versioned state files, so it is filed shared per the Origin Rule.

## Related

- `rules/workbench-tracking.md` `## The four classes`, the paragraph beginning "`.guard-state/` is not one thing".
- `shared/decisions/260811-1534_*_does-the-guard-event-log-get-an-upper-bound-and-what-happens-to-the-evidence-in-it.md`, which the same paragraph cites.
- The wider pattern this belongs to: `circles/260825-2023-presence-travels-monitor-filters-own-checkout/decisions/260826-1252_*_how-does-this-project-keep-a-cardinality-stated-in-prose-true-when-seven-passes-could-not.md`. This is another count stated in prose that a later HEAD falsified.

---
Resolved: 260827-2020 by coder (plan `260827-1756` step 18b). `skills/setup/SKILL.md` Step 3 now probes `escalation.json`, `churn.json` and `state-drift.json`, the three `rules/workbench-tracking.md` `## The four classes` names as written by nothing at this version, and offers all found in the one existing question; the halt-flag probe and the three phrases `hooks/lib/__tests__/legacy-halt-clearing.test.ts` pins are unchanged. The rule itself already names all three (step 18a).

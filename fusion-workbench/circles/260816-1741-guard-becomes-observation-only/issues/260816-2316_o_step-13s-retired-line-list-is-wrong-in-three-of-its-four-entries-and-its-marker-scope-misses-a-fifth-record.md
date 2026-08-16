Step 13's `Retired:` list is wrong in three of its four entries, and its `_i_` scope cannot reach the one record whose question this plan deletes

---

Step 13 instructs: *"A `Retired:` line with **no rename**, the marker staying `_i_`: every record
whose implementation this plan deletes. Found at HEAD: `260804-1631_i_…`, `260804-1630_i_…`,
`260803-1419_i_…` and `260802-1912_i_…`. Re-derive the list rather than trusting it: `grep` the
decision stores for the identifiers this plan deletes."* Checked at HEAD, all four in
`circles/260801-1244-guard-rules-write/decisions/`:

| Record | State at HEAD | What step 13 would do | Correct |
|---|---|---|---|
| `260804-1631_i_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md` | no `Retired:` line | add one | yes — `guard.enabled` went in `fab8a4b` |
| `260804-1630_i_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md` | no `Retired:` line | add one | **no** — see below |
| `260803-1419_i_how-should-the-protected-path-check-treat-the-case-of-a-path.md` | **already carries** `Retired: 60c9cd8` at `:123` | add a second | no |
| `260802-1912_i_does-the-self-protection-floor-apply-before-the-config-file-exists.md` | **already carries** `Retired: 60c9cd8` at `:95` | add a second | no |

**The dangerous one is `260804-1630`.** Its answer — the per-leaf merge, and the rule that a
dropped key, an omitted key and an unwritten file are three spellings of one behaviour — is
**live code at HEAD**, and `hooks/lib/config.ts` cites the record three times in the present tense
as the obligation that shape rests on:

- `:46-49` — "What the leaf walk changed … was the granularity at which 'declared' is read … Decision `260804-1630`, answered option 1 at the plan gate on 2026-08-04."
- `:70-73` — "That equivalence is an obligation of `260804-1630`, not an implementation convenience: it is what keeps the whole seam expressible as one sentence."
- `:363-367` — "Decision `260804-1630` requires that equivalence rather than merely permitting it."

The walk itself survives at `:479-486`, deliberately kept as the shape rather than collapsed into
a `??` (`:51-53`). What this plan deleted is the record's *setting* — the three-layer merge and
the `guard` container it was asked about — not its *answer*. A `Retired:` line on it says the
project no longer holds a rule that three comments in the loader say it does.

**And the re-derivation instruction points straight at it.** The record's `## Question` names
`protectedPaths`, `escalation`, `churn`, `crossFile` and `decisions` — five identifiers this plan
or an earlier one deletes — so a `grep` for deleted identifiers returns it with the highest hit
count of any record in the store. The instruction that was meant to catch a wrong list is what
would confirm this entry.

**A fifth record the step cannot reach.**
`260804-1632_d_should-findrelevantdecisions-fold-case-now-that-a-project-can-configure-categorypaths.md`
is `_d_` (deferred), so it falls outside step 13's three transitions, all of which start at `_a_`
or `_i_`. Its question was deleted by step 7a with `findRelevantDecisions`, and
`hooks/lib/paths.ts:36-41` already says so: *"Its subject was deleted with the match, so the
question can no longer be decided either way."* A deferred question whose subject is gone can
never come back off the deferral. The information is in the tree; no step reads it.

**Severity:** Medium. The step is unlanded, so nothing is wrong on disk yet; what is wrong is the
list an executor is told to apply, in the one direction that costs something — a `Retired:` line
on a rule the code still cites.

**Scope:** workbench decision records (`ontocoder`'s step). No shipped code changes.

**Cross-references:**
- `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md` step 13
- `hooks/lib/config.ts:46-49`, `:70-73`, `:363-367`, `:479-486`
- `hooks/lib/paths.ts:36-41`

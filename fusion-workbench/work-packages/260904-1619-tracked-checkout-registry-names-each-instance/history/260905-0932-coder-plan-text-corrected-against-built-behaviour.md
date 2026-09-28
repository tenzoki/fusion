# coder — two plan sentences corrected against built behaviour

**Status:** Complete
**Date:** 2026-09-05
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Plan:** `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 7 and `## Where this Circle stops`

## What was done

Two sentences in the plan described something other than what was built. Both
corrected; no code touched.

**Fix 1 — step 7.** The Changes paragraph said the header shows "the alias
beside the hex where one is found and the hex alone where none is", and the
Acceptance line said the store-absent case "renders exactly what it renders
at HEAD" — two sentences that cannot both hold as a two-branch reading, since
HEAD names no checkout at all. Per the open defect
`260904-2140_*_step-7-states-two-branches-for-the-monitor-header-that-contradict-each-other.md`,
rewrote both to state the three branches that were actually built and tested
(and that `bin/monitor`'s own `_read_checkout_label()` docstring already
carries): `<alias> · <hex>` when an entry for this checkout carries an alias,
the hex alone when the registry exists but holds no entry for this checkout,
and exactly what HEAD renders when no registry exists at all. Built behaviour
unchanged; acceptance not weakened — the middle branch stays a tested
requirement.

**Fix 2 — the stopping section against step 14.** `## Where this Circle
stops` required "both scoped decisions carry `_a_` or `_d_`", but step 14
authorises `_a_` → `_i_` where the user's answer required code, and both of
this Circle's scoped decisions correctly carry `_i_` today — a state the
stopping clause's own two-option list could never be satisfied by. The
reconciliation pass (`## Reconciliation Log`, "Where this Circle stops —
clause by clause" table) found this exact conflict and judged it
"literally no, substantively yes": both answers are the user's, given at
their own gates, and neither was answered by an agent. Rewrote the clause to
say that directly — both decisions were answered by the user at their own
gates, neither by an agent, and each carries whichever terminal marker its
answer earned (`_a_`, `_d_`, or `_i_` after step 14's transition). No defect
record exists for this one; it is noted here per the dispatch.

## Files changed

- `260904-1651_*_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md` (this Circle's planning store) — step 7's Changes/Acceptance, and the stopping-section decision clause.
- `260904-2140_*_step-7-states-two-branches-for-the-monitor-header-that-contradict-each-other.md` (this Circle's issue store) — `Resolved:` note appended, marker `_o_` → `_c_`.

## Verification

`cd hooks && npm test` — exit 0, 48 files passed, 825 tests passed (run three times across this task; stable).

`bin/fusion-citation-sweep --dry-run` checked from the work tree (`./bin/fusion-citation-sweep`, not through `$FUSION_PLUGIN_ROOT`, which pins to the installed copy and is one release behind — it misreported `files=12 rewrites=17` against stale logic, unrelated to this task and unchanged by it). The work-tree binary reported `files=0 rewrites=0` before this task's edits. The first draft of this history entry then briefly regressed it to `files=1 rewrites=2` by citing the plan and the issue file with the store segment in the path; both citations were rewritten to the storeless `_*_` pointer form below, and the work-tree binary is back to `files=0 rewrites=0`.

Nine open-marker citations were left literal on the same lines where their siblings were starred

---
Ledger entries L05 to L22 rewrote stale citations in nineteen shared decision records, mostly replacing a literal state marker with the wildcard `_*_` form. Nine citations carrying the non-terminal `_o_` marker were left literal inside the very files the pass edited, and in four cases on the same `**Cross-references:**` line where a neighbouring `_o_` citation was starred. Every citation in those files resolves today, so nothing is broken now — but a literal `_o_` is precisely the pointer the wildcard convention exists to protect, because `_o_` is the one marker guaranteed to move.

---
**Found by:** coderev, Turn-3 incremental review of `5c843e6..0301909`, review file `circles/260801-1244-curator/reviews/260814-1419-coderev-curator-turn-3.md`.
**Owner:** `coder`, as a follow-up pass over the same nineteen files.
**Severity:** Low.
**Cross-references:** `rules/circle-records.md` `### Citation form in the portfolio` (the star-a-pointer / keep-a-named-marker rule); `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md` (the binding decision, scoped to shipped texts); `circles/260801-1244-curator/history/260814-1332-curator-run.md` ledger entries L05-L22; commit `1a36fe4`.

**Verified 2026-08-14 at HEAD `0301909`.** Every citation in all nineteen changed records resolves — checked by expanding each `_*_` to `_?_` and globbing the store, 0 unresolvable of the full citation set, and 0 literal-marker citations pointing at a file that carries a different marker today. This record is about the ones that will break next, not about a break.

Nine literal `_o_` citations remain in the changed files:

| Record edited by the pass | Citation left literal |
|---|---|
| `shared/decisions/260801-1020_i_may-any-fusion-writer-touch-rules.md` | (1) |
| `shared/decisions/260809-1731_i_how-should-the-domain-heuristic-count-a-projects-source-files.md` | (2) |
| `shared/decisions/260810-0921_i_how-should-a-prompt-call-a-bin-helper-…` | (3) |
| `shared/decisions/260810-1635_a_where-does-the-obligation-sit-…` | (4) |
| `shared/decisions/260810-1635_a_where-does-the-obligation-sit-…` | (5) |
| `shared/decisions/260810-2145_a_should-a-repeated-skill-body-snippet-…` | (6) |
| `shared/decisions/260812-1232_*_does-the-escalation-counter-survive-…` | (7) |
| `shared/decisions/260812-1232_*_does-the-escalation-counter-survive-…` | (8) |
| `shared/decisions/260812-1232_*_does-the-write-guards-fusion-repo-stand-down-…` | (9) |

The nine citations themselves, transcribed exactly as the edited records spell them. Each is
quoted here rather than written as a live pointer, because what this record reports **is** the
spelling: a citation corrected to the wildcard form here would no longer be the thing found.

```
(1)  shared/planning/260801-1122_o_spec-normative-consolidation.md
(2)  circles/260801-1244-guard-rules-write/issues/260805-1830_o_die-domaenenheuristik-…
(3)  shared/issues/260808-0030_o_line-number-citations-into-rule-files-go-stale-…
(4)  shared/issues/260809-2258_o_readme-hooks-says-fourteen-ordering-sites-…
(5)  shared/issues/260810-1632_o_the-churn-stand-down-still-asks-cwd-…
(6)  shared/issues/260810-2110_o_the-domain-capture-one-liner-…
(7)  shared/issues/260812-0843_o_the-guard-and-its-configuration-must-be-simplified-…
(8)  shared/issues/260812-1232_o_the-four-mechanisms-analysis-says-escalation-…
(9)  shared/decisions/260812-1232_o_does-the-escalation-counter-survive-…
```

**The two clearest cases are the ones inside one line.** In `260810-1635_a_…` the pass starred `260809-2252_o_` and `260810-0502_o_` and left `260809-2258_o_` and `260810-1632_o_` literal, all four in the same `**Cross-references:**` line, all four pure pointers with no statement about state. In `260810-2145_a_…` it starred `260810-2030_o_` and left `260810-2110_o_` literal, same line, same shape. Neither pair is distinguished by `rules/circle-records.md`'s test ("a pointer loses nothing, a statement loses its content") — both members of each pair are pointers.

**What the pass was and was not obliged to do.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` enforces the wildcard grammar over the plugin's **shipped** text surfaces, and `portfolio-citation-form-lint.test.ts` enforces it in `portfolio.md`. A citation inside a workbench decision record is in neither scope, so nothing required these rewrites at all. That makes this a consistency defect rather than a rule violation — but a pass that applied a convention to nineteen files and skipped nine instances inside them leaves the next reader unable to tell which literals are deliberate.

**The fix.** Star the nine, or state in the run's own record that a literal marker inside a decision record is deliberate and why. Do not widen the lint to the workbench without a decision: that scope was deliberately left out of `260806-0015_*_zitierform-fuer-workbench-records.md`, whose question is about *ausgelieferte Texte*.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). The prediction has come true: seven of the nine have broken.**

All nine literal `_o_` citations are still in place. Seven targets have since moved — two by transition (`260812-1232` decision to `_i_`, `260805-1830` to `_c_`) and five by the `260817-1907` archive sweep, which took `shared/planning/260801-1122` and three `shared/issues/` records out of the live store entirely. Two still resolve. The starred siblings on the same lines all still resolve, which is the whole argument the record made.

The record said "this is about the ones that will break next, not about a break." It is now about seven breaks. Rewriting the nine marker positions to `_*_` is unchanged in cost and is now a repair rather than a precaution.

The `**Active spec/plan:**` field now carries a wildcard, and no rule authorises one in a Circle-record head field

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 3
**Affects:** `rules/circle-records.md:135` (the template), `:164` (the worked example), `### Citation form in the portfolio` at `:250-268` (the scope of the wildcard rule)
**Cross-references:** `circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_zitierform-fuer-workbench-records.md`, the binding decision, whose scope is shipped texts; `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1318_*_the-plan-is-status-complete-with-every-step-done-and-still-carries-the-open-marker.md`, the rename that made the rewrite necessary

---

## What is wrong

`a2a18f9` rewrote this Circle's record head field:

```
-**Active spec/plan:** circles/…/planning/260823-0800_o_c2-what-travels-between-checkouts-is-settled.md
+**Active spec/plan:** circles/…/planning/260823-0800_*_c2-what-travels-between-checkouts-is-settled.md
```

**The rewrite is right, and nothing in the normative text says so.** `rules/circle-records.md:135` gives the field as "`<workbench-relative path to the spec or plan, or "(none yet)">`" and `:164`'s worked example spells `…/260716-1910_p_plan-foo.md` with a hard marker. The wildcard rule in the same document is scoped by its own heading, `### Citation form in the portfolio`, and its stated ground is regeneration, "playmaker overwrites the whole file on every run", which a Circle record does not undergo. So the field is a case the two rules meet on and neither reaches.

Every other Circle record in the live tree spells a hard marker in that field, so the next writer follows the template and re-creates the fault: `agents/orchestrator.md:275` and `:278` both write the field at moments when the plan is `_o_` or `_p_` and will transition later, and `agents/shaper.md:57` writes it at spec creation.

**Why the wildcard is nonetheless the right form here.** The general test in `rules/fusion-workbench-conventions.md:358` is pointer versus statement, and this field is unambiguously a pointer. Its target transitions `_o_ → _p_ → _c_` by construction, and nothing regenerates the field, so a spelled marker dies at the first transition and stays dead, which is exactly what happened, one commit before the rename. No consumer breaks on a glob: `agents/orchestrator.md:890` resolves it by reading, `skills/next/SKILL.md:222` never writes or resolves it, `skills/migrate/SKILL.md:99`'s `rewrite_fields` touches only bracket markers and known type-folder prefixes, and the citation gate resolves the glob like any other citation.

## Verified

Read `rules/circle-records.md:125-210` and `:250-268` in full, and `rules/fusion-workbench-conventions.md:358`. Grepped every consumer of the field across `agents/`, `skills/`, `rules/`, `bin/` and `hooks/lib/`: five sites, none of them a literal file open. Resolved the field's value at HEAD: exactly one match. `260806-0015` read in full: its Question and Options are scoped to *ausgelieferte Texte* citing workbench records, not to record head fields.

## Direction, not a prescription

Say it once in `rules/circle-records.md`, where both halves already live: the head fields take the `_*_` wildcard at the marker position, for the same reason the portfolio does, because the target transitions and the field is not rewritten when it does. Change the template at `:135` and the worked example at `:164` in the same edit, since a reader who follows the example is the failure mode.

Leave the closed Circles alone. Their records are history and their plans no longer transition.

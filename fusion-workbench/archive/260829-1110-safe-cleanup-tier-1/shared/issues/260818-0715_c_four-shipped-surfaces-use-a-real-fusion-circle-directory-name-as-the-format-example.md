Four shipped surfaces use a real fusion Circle directory name as the format example

---

`260716-1847-workbench-umbau` is a live Circle directory in fusion's own workbench
(`fusion-workbench/260716-1847-workbench-umbau`). It is also the format example in four
places that ship to every consuming project:

| Site | Reaches |
|---|---|
| `bin/fusion-paths:262` | stderr, in a consuming session, when `.active-circle` is empty |
| `rules/fusion-workbench-conventions.md:27` | every agent, every dispatch (layout tree) |
| `rules/fusion-workbench-conventions.md:91` | every agent, every dispatch (the `.active-circle` contract) |
| `skills/next/SKILL.md:42` | the user prompt for `/fusion:next <circle-dirname>` |

Three of the four announce the token with `e.g.`, and the fourth is a directory inside an ASCII
layout tree. A reader takes each as a shape, not as a thing to open. The harm is theoretical and
we found no report of it. The defect is that a fabricated name would serve the same purpose while
being unable to point anywhere, and one of the four sites is stderr composed into a consuming
project's session, which is the run-time channel where the incident of 2026-08-17 happened.

`bin/fusion-paths:262` is the site worth changing first if only one is changed.

## Why it is not covered by anything

`hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves bare Circle-directory citations
as class (c), and this one resolves, because the Circle is real. The lint is therefore satisfied
by exactly the property that makes the token foreign in a consuming project. That is the same
direction problem analysis `260818-0715` finding 3 records for the incident identifiers.

## Suggested fix

Replace the token with a fabricated stamp and slug at all four sites, in one change so the four
do not drift apart. The fabricated form has to stay parseable as a Circle directory name, and it
should not collide with the `foo`-slug exemption the lint already carries for a different purpose.
Whatever is chosen, the lint's class (c) will then either need the token exempted or, better, the
token should be built so it carries a placeholder character the lint already treats as template
syntax.

**Severity:** Low
**Domain:** code
**Filed by:** analyst, analysis `260818-0715`
**Cross-references:** `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` findings 1 and 3, `260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md` (same class, measured instance)

---
**Reconciliation 260818-0814** (reconciler, domain `code`, HEAD `f3a3565`). Still open, and re-read
rather than assumed. All four cited sites carry `260716-1847-workbench-umbau` verbatim at the exact
line numbers filed: `bin/fusion-paths:262` (the empty-pointer stderr), `rules/fusion-workbench-conventions.md:27`
(the layout tree) and `:91` (the `.active-circle` contract), `skills/next/SKILL.md:42` (the explicit
invocation form). The Circle directory `260716-1847-workbench-umbau` still exists, so the
resolution-lint reading the record describes is unchanged. Nothing in this session's four commits
(`1dc062d..f3a3565`) touched any of the four files.

Two further occurrences exist and are **outside** this record's scope as written, named here so a
one-change fix does not sweep them by accident. `rules/circle-records.md:41` cites
`260716-1910_*_circle-marker-am-verzeichnis-oder-an-der-circle-datei.md`
as the binding decision — a provenance citation, which analysis `260818-0715` finding 3 puts
deliberately out of scope, and which must keep the real name to resolve at all.
`hooks/lib/__tests__/fusion-paths.test.ts:82` uses the token as a test constant and reaches no
consuming session. Marker stays `_o_`. Log: `260818-0814-reconciliation.md`.

---
Resolved: fixed — the two rule sites take bin/fusion-paths' placeholder form <YYMMDD-HHMM>-<slug> (rules/fusion-workbench-conventions.md:28, rules/fusion-workbench-conventions.md:83); bin/fusion-paths carries it since step 7; residual: skills/next/SKILL.md:5 still carries the real name at this HEAD, step 10's half

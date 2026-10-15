# Does a /fusion:migrate run on a workbench already in the v12 format offer the citation sweep when its census counts store-prefixed citations?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-migrate-step-6-runs-the-citation-sweep-write-on-a-tree-its-own-guard-refuses.md`, `261014-2003-migrate-step-6-offers-sweep-it-can-write.md`, `261015-0633-plan-migrate-step-6-offers-a-sweep-it-can-write.md`

---

## Question

The fix for the issue cited above ends a git-mode rename run at Step 5 ("commit the renames, then run `/fusion:migrate` again") and offers Step 6 on the re-run. That re-run finds `FOUND=0`. So the re-run has to recognise that the renames are done and the sweep is still owed, and the filesystem holds no record of whether Step 6 was ever offered. What the filesystem does hold is the citations themselves: the sweep's census counts every citation of the three store-prefixed kinds (`record`, `package-record`, `package-dir`) that is still on disk. Entering Step 6 on every `FOUND=0` run and letting the census decide whether to ask is the one entry condition decidable from the tree. It also reaches every migrated consumer that re-runs `/fusion:migrate`. krk is the measured case: it is JSON-controlled and still carries `package-dir=244` citations to `circles/` paths. That widens the skill's contract. Line 18 of `skills/migrate/SKILL.md` promises that a v12-format workbench "finds nothing and stops without asking", and the `record` kind also counts store-prefixed citations the rename did not cause (axibra-1's 19). The plan's Step 2 needs this settled before the skill text is written.

## Options

1. **Census-driven on every v12-format run, JSON-controlled workbenches included.** Every `FOUND=0` run goes to Step 6. The sweep's guard probe (`--write` without `--yes`) decides: refused, census zero, or census non-zero and asked.
   - Pros: one entry condition, read off the tree, with no marker and no new root surface. krk's 244 citations are offered the next time anyone runs `/fusion:migrate` there. A workbench with nothing left to repair still asks nothing, so the idempotency promise holds in its useful form ("asks only about what is still on disk").
   - Cons: the `record` kind brings store-prefixed citations unrelated to v12 into the question, so `/fusion:migrate` becomes one place they come up. A declined offer comes back on every run. The line 18 sentence and the README description of the sweep ("never by a pipeline or workflow") read more loosely than before.
2. **Census-driven only while the workbench is Markdown-controlled.** Step 6 is entered from `FOUND=0` only when the sweep's `format=` line reads `legacy`. On `json-control` the repair is a direct sweep call, as the krk note describes.
   - Pros: `/fusion:migrate` keeps to the migration. A fully migrated workbench is never asked about citations again.
   - Cons: whether citations were repaired and whether Step 7 has run are unrelated facts, and this option gates one on the other. krk and every other consumer that took Step 7 before this fix get no offer. The `format=` line is printed only when the guard passes, so on an exit 4 the skill cannot tell the two cases apart without a second call.
3. **A marker written once Step 6 has offered.** The re-run reads the marker instead of the census.
   - Pros: answers the literal question ("was it offered?").
   - Cons: adds a root-anchored surface to a list `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` keeps closed. It also answers the wrong question, since a declined or interrupted sweep leaves the citations broken whatever the marker says. The census already holds that state.

## Constraints

- The sweep's write guard (`hooks/citation-sweep.ts`, `refusal()`) stays the single judge of whether a write may proceed. The skill does not restate its predicate.
- Nothing the rename pass merely inspects may enter its trigger (`skills/migrate/SKILL.md` `## Step 2`). The census is read in Step 6, never in the Step 2 survey.
- Growth bounds on `skills/*/SKILL.md` (`README-hooks.md` `### Growth bounds on the shipped text`).

## Recommendation

We recommend option 1. It is the only option whose entry condition is decidable from the tree, and it reaches the consumers that already carry the defect's consequence. Option 3 answers a question that does not settle the outcome. Option 2 ties citation repair to an unrelated milestone and leaves krk to a manual call. The cost of option 1, that a declined offer recurs, falls only on someone who runs `/fusion:migrate` on purpose, and the census tells them on each run what a write would change.

---

Answered: this record `## Options` — option 1: a migrate run on a v12-format workbench enters Step 6 on `FOUND=0` and offers the sweep whenever its census counts store-prefixed citations, JSON-controlled workbenches included; the plan is approved with its release step 6 (13.1.2); ruled by user, Kai Stalmann <ks@qantr.com>

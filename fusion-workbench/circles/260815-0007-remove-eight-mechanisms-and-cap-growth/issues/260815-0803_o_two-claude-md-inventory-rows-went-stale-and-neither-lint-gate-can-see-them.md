Two CLAUDE.md inventory rows went stale and neither lint gate can see them

---

**Severity:** Medium
**Domain:** code
**Filed by:** ontorev, review of `9a7da8e..7c12d6a` (structured-data half), review file `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/reviews/260815-0803-ontorev-plane-structured-data-removal.md`
**Owner:** `coder`
**Affects:** `hooks/lib/__tests__/derivable-enumerations-lint.test.ts`; evidenced by `CLAUDE.md:51` (the `templates/` row) and `CLAUDE.md:52` (the `docs/` row)
**Cross-references:** `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/planning/260815-0029_o_plan-remove-eight-mechanisms-and-cap-growth.md` line 6 (the `**Decidability:**` line) and line 173 (which routes the `docs/` row to gate G1); `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/history/260815-0751-ontocoder-remove-plane-data-files-and-fixtures.md` `## Findings the plan did not predict`; `shared/issues/260811-2239_*_five-shipped-bin-helpers-have-no-claude-md-layout-row-and-the-table-says-nothing-about-being-a-selection.md`.

---

The plan's `**Decidability:**` line rests the whole sweep on two test gates. Both are green over two `CLAUDE.md` rows that this Circle just falsified, because one gate does not parse the form the rows are written in and the other has no check for either row. The rows themselves are already routed to gate G1; what is unfiled is that the gates cannot see them, and eleven more removals are ahead.

---

**Verified 2026-08-15 at HEAD `7c12d6a`.** `cd hooks && npm test` is green: 48 files, 903 tests. Both rows are false:

```
CLAUDE.md:51  | `templates/` | … Currently: `investigator-capture-layout.md` …,
              `fusion-guard.json` …, `plane.config.yaml` (setup seeds it into the
              workbench). Check `ls templates/` and the setup skill for the current set. |
CLAUDE.md:52  | `docs/` | … Currently: `philosophy.md` …, `working-model.md` …, and
              `plane-setup.md` (the Plane bridge install doc). `ls docs/` is the
              authoritative set. |

$ ls templates/     fusion-guard.json  investigator-capture-layout.md
$ ls docs/          philosophy.md  working-model.md
```

**Why `reference-resolution-lint` is green.** It resolves `templates|docs|rules|agents|…`-shaped *paths* against the tree. Both rows write a bare filename, `plane.config.yaml` and `plane-setup.md`, with the directory only in the row label. Nothing path-shaped is present, so there is nothing for the gate to resolve. The executing ontocoder reached the same reading and recorded it.

**Why `derivable-enumerations-lint` is green.** It carries eight checks: the skill roster, the agent count, the always-on rule list, the conditional emission sets, the `hooks/lib` file table, the stash manifest's field count, the `DEFINITION_SITES` echo, and the `bin/` helper roster in the very same Layout table. It has no check for the `templates/` row and none for the `docs/` row. Both rows declare themselves derivable in their own text, *"Check `ls templates/` and the setup skill for the current set"* and *"`ls docs/` is the authoritative set"*, which is the same self-declaration the covered `bin/` row makes.

**What the plan claims, and where the claim stops being true.** Line 6 reads: *"`reference-resolution-lint.test.ts` resolves every `rules|agents|skills|docs|hooks|bin|templates|stilwerk`-shaped path in every shipped text surface … So `npm test` answers the question after every step, and the plan's sweep obligations are enforced rather than promised."* Two rows are the counter-example, and the plan's own `## Approach` split depends on the claim holding: it sorts every documentation edit by *"does `npm test` assert it?"*, sending the asserted half into the removing commit and the rest to the curator at gate G1. An edit that neither gate asserts and that nobody routed to G1 by hand falls into neither half. The `docs/` row was routed by hand at line 173. The `templates/` row was not, and it survives at HEAD for that reason.

**Why the class matters more than the two instances.** Eleven removals remain, and several delete a file that a Layout row names in bare-filename form. `stilwerk/` is the third inventory row of the same shape and is uncovered too. The gate that exists for exactly this defect class covers the one roster whose row happens to be path-shaped.

**The fix, in the shape the gate already uses.** Add two checks to `derivable-enumerations-lint.test.ts`, modelled on the existing `describe("enumeration lint: the bin/ helper roster in CLAUDE.md's Layout table")`: derive `ls templates/` and `ls docs/`, parse the backticked filenames out of the two Layout rows, and diff both ways so a phantom entry and a missing one each fail. Each existing check ships a mutation control; these should too. The two stale rows are the curator's at gate G1 and are not the fix asked for here.

**One thing the fix should not do.** Do not answer this by widening `reference-resolution-lint` to treat a bare filename as a path. A filename with no directory is ambiguous by construction, and the gate's own header records that it stays out of forms it cannot parse unambiguously rather than guessing at them.

---
Widened by step 8 (2026-08-15), still `_o_` and still gate G1's. The `templates/` row now names **two** phantom files, not one: step 2 removed `plane.config.yaml`, step 8 removed `investigator-capture-layout.md`. `templates/` holds exactly one file, `fusion-guard.json`, so the row is wrong about two of the three entries it lists and wrong about the investigator being the reason the first one exists.

Step 8 left the row rather than fixing it, and the judgement is the plan's rather than the executor's: the plan's step 8 states that `CLAUDE.md:51`'s bare-filename spelling puts the row on the narrative side and names this record as the reason. That call was made knowing the row was already stale. What step 8 adds is the current count, so the curator's pass reads the state as it is rather than as step 2 left it.

The row's sibling obligation is done: the *"Where to look when something breaks"* row that spelled `templates/investigator-capture-layout.md` as a path was gate-forced and left in step 8's own commit.

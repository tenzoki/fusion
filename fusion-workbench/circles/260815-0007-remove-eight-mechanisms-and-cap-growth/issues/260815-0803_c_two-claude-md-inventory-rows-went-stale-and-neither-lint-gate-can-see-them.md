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

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — CLOSED, and the divergence between what was asked and what happened is the substance of this note. Read it before restoring an inventory anywhere in the Layout table.**

**The two instances are gone, by the opposite remedy to the one this record proposed.** Neither row carries an inventory any more, so neither can go stale:

```
CLAUDE.md `templates/`  … **The set is deliberately not written here.** Run `ls templates/`,
  and read the setup skill for where each file goes … An inventory *did* stand here and went
  stale twice in one day on 2026-08-15, once per removal, invisibly to both lint gates …
  Do not restore one.
CLAUDE.md `docs/`  … **The set is deliberately not written here.** Run `ls docs/`. An inventory
  stood in this row and named three files while the tree held four, invisibly: no lint gate
  resolves a bare filename here, which is the same hole the `templates/` row above records …
  Do not restore one.
```

Landed in the curator pass `e8052e7`. Both rows now carry this record's own diagnosis in their own text, including the reason the gates could not see them, and both close with an instruction not to restore.

**The fix this record asked for was not made, and it is now unbuildable as specified.**

```
grep -n 'describe(' hooks/lib/__tests__/derivable-enumerations-lint.test.ts
  the skill roster / agent counts / the always-on rule list / the conditional emission sets /
  the hooks/lib file table / DEFINITION_SITES / the bin/ helper roster
```

Seven checks, none for `templates/` and none for `docs/`. The check the record specifies — derive `ls templates/`, parse the backticked filenames out of the row, diff both ways — has nothing left to parse, because the row deliberately holds no filenames. A gate cannot compare an enumeration against the tree when the enumeration was removed on purpose.

**The third instance the record predicted never materialised.** It named `stilwerk/` as "the third inventory row of the same shape". There is no `stilwerk/` row in the Layout table; the directory is described in `## Conventions` prose that names the four profile files as a definition rather than as an inventory of a directory.

**What is closed and what is not.** Closed: the two stale rows, and any live instance of the class. Not closed, and deliberately not carried by a marker: the underlying hole, that a bare filename in a Layout row is path-shaped to no gate and therefore checked by nothing. What holds the line today is prose — two rows that say "do not restore one" — rather than a mechanism. Anyone restoring an inventory to a Layout row reopens exactly this defect with no gate to catch it, and should file it fresh rather than reopen this record, which is terminal.

---
Resolved: both instances are gone. `CLAUDE.md`'s `templates/` and `docs/` rows no longer carry inventories at all — each states "The set is deliberately not written here", names the command that derives it, records why the two lint gates could not see the old one, and instructs that no inventory be restored (curator pass `e8052e7`). The remedy diverged from the one specified: no check was added to `derivable-enumerations-lint.test.ts`, and with the enumerations removed the specified check has nothing to compare against. The gate hole is unclosed and is held by prose; a restored inventory reopens it and wants a fresh record.

Neither Setup nor migrate detects a live Circle record, so the v11 conversion never runs
---
`/fusion:migrate` evaluates its `FOUND=0` stop against the first survey block, which does not look inside a container. The block that finds a live `_a_`/`_t_` record runs after that stop. On the ordinary v4-to-v10 workbench the skill reports "already in the current format" and converts nothing. `/fusion:setup`'s three superseded-format probes miss the same shape, so nothing routes the user to the migration either.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `2f8d1082` (the migration rewrite); `44839e8f` (Setup's probe narrowing); `260910-2145_*_how-does-the-resolver-learn-which-work-item-is-in-scope.md`

**Reproduced at HEAD `1d6103c4`** against a scratch workbench holding one container in the shape v11
exists to convert: a container under the container store with the six subdirectories and a record
`_t_circle.md` carrying `**Claim:** Claimed 5e8248d7, …`, and no root type folder, no flat markered
file at depth 1, no bracket-form filename. The container is named `sample-item` rather than with a
stamp, so nothing here reads as a citation; neither block keys on the stamp.

Running `skills/migrate/SKILL.md` Step 2's first block verbatim:

```
  (nothing — already in the current format)
FOUND=0
REFORMAT=0
SKIPPED=0
CONFLICTS=0
```

Running the second block ("### The containers, and what happens to the record inside each") on the
same tree:

```
  circles/sample-item/_t_circle.md -> circles/sample-item/sample-item.md   status claimed
LIVE=1
```

**The defect is the order of the gate, not the detector.** The skill body puts
*"**If `FOUND=0`: stop here.** … report "This workbench is already in the current format. Nothing to
do." and stop"* between the two blocks, and the instruction that repairs the count —
*"set `FOUND=1` yourself whenever `LIVE` or `CONFLICTS` is above zero"* — sits **after** the second
block, which the stop has already prevented from running. An agent reading the steps in order stops
on a partial count.

**Setup does not catch it either.** `skills/setup/SKILL.md` `### Superseded-format check` enumerates
exactly three probes: a root type folder, a flat markered file at depth 1 in the container store,
and a bracket-form `[x]-` filename. A container holding `_t_circle.md` matches none — that marker is
already the underscore form probe 3 converts *to*. Its probe block run verbatim on the same tree:

```
OLD=0
```

so Setup proceeds and never names the migration.

**What it costs.** `bin/fusion-claimed-item` resolves an item only through a container's
same-named record (`:206-209`); a container whose record is still `_<m>_circle.md` matches nothing,
so the helper exits 0 with no output and `bin/fusion-paths` puts every `OUT_*` in the shared store
and collapses every `SCAN_*` to it. The item's own artifacts stay unreachable and every new record
lands outside its container — silently, and for the life of the project, because both surfaces keep
reporting that the workbench is current.

**Not this repository's own case.** All 24 legacy containers here hold terminal records (`_c_`,
`_b_`, `_s_`), for which `FOUND=0` is the correct answer. The failure needs a workbench that was
mid-work at the upgrade, which is the case the migration was written for.

**Acceptance.** On a workbench holding one live `_a_`/`_t_` container and nothing else out of format:
`/fusion:migrate` reaches Step 3 and proposes the conversion, and `/fusion:setup`'s probe block
prints `OLD=1` and routes to it. A regression test drives both blocks over such a tree, the way
`fusion-claimed-item.test.ts` drives its script.

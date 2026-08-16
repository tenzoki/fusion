# Coder — the tracked-workbench split's `.gitignore` half and the scope clause

**Status:** Complete
**Domain:** code
**Dispatched for:** `shared/issues/260816-0136_p_the-tracked-workbench-splits-declared-scope-reaches-two-legacy-stores-neither-group-classifies.md` (part 2), plus the `.gitignore` half of `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/issues/260815-1633_o_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`
**HEAD at start:** `433e206`

## What changed

**1. `.gitignore:67`** — the KEPT list now names the records group exactly as
`rules/fusion-workbench-conventions.md:76` states it: `orchestrator-events.jsonl`,
`.guard-state/events.jsonl`, `portfolio.md`, `.fusion-setup`. `tasklist.md` (removed from fusion on
2026-08-15) is gone. No ignore pattern moved; `.fusion-setup` was already tracked, so only the
comment was wrong.

**2. `.gitignore:68-69`** — the sentence that used to open `# .guard-state/events.jsonl is a record
too` now opens `# The guard's own event log is deliberately NOT excepted here`, because the file is
named on the KEPT line above it and "too" would no longer be true. The `/fusion:archive` clause on
`:69` now reads "the archive step of `/fusion:cleanup`, which rolls it into", matching
`rules/fusion-workbench-conventions.md:81`. Line count and wrap width of the block are unchanged
(84-90 columns, as before).

**3. `rules/fusion-workbench-conventions.md:74`** — the scope clause's parenthesis was
`(circles/, shared/, archive/, stilwerk/ and the two above, all simply tracked)` and is now
`(circles/, shared/, archive/, stilwerk/, all simply tracked, and any stashes/ or
.migration-v2-backup/ a workbench still carries, which follow archive/)`. This restores the
conditional shape the source record's fix direction proposed. The sentence now states a rule the two
legacy stores follow rather than a fact about which repositories track them, which was the coderev
objection appended to the source record on 260816-0713. Scope and membership still tile the ten
non-artifact root entries with no overlap and no remainder, against both the tree at `:26-61` and the
sentence. `+80` bytes.

**4.** One paragraph appended to the `260815-1633_o_` record recording that its `.gitignore` half is
discharged and that the two code-comment sources it names still stand. Marker left `_o_`.

## Verification

`cd hooks && npm test` — **exit 1**, run twice with the identical single failure both times.

```
FAIL lib/__tests__/rules-emission-golden.test.ts > matches the checked-in golden, agent by agent
-   fusion-workbench-conventions.md 55104
+   fusion-workbench-conventions.md 55184
```

**The failure is mine, and it is the golden fixture rather than a bound.** The checked-in
`hooks/lib/__tests__/fixtures/rules-emission.golden` pins each always-on rule file's byte size for
all 15 agents; edit 3 moved one of those numbers by the 80 bytes it added, so all 15 stanzas
disagree. Nothing else in the suite moved, and 763 of 764 tests pass.

It is **not** the known instability of `260814-2118_o_the-hooks-suite-fails-differently-on-repeated-full-runs`:
that record describes runs failing *differently* on repetition, and this failed identically twice.
It is also **not** the universal-core growth bound the dispatch warned about. That bound has
`GROWTH_BUDGET = 12_000` over a `RULE_BASELINE` of 86 573 for the five always-on files; the set
measured 89 623 before this edit and 89 703 after, leaving 8 870 bytes of head-room. The bound was
never approached.

**The remedy is the one the test's own header prescribes** (`rules-emission-golden.test.ts:170-182`),
and it is mechanical:

```
cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts
```

That run rewrites the fixture and then fails on purpose, forcing a second plain run. The header
states a size change costs a regeneration and never a cut, and that regenerating "blocks nothing".

**Why this pass did not run it.** The dispatch bounded the permitted file set to exactly three files
and `fixtures/rules-emission.golden` is a fourth. The fixture's stated purpose is to put every
movement into a diff somebody reads, so surfacing the movement is a better discharge of it than
quietly absorbing it. The regeneration needs an authorising word and one command.

## Out of scope, observed, nothing filed

- `fusion-workbench/.fusion-setup` and `fusion-workbench/orchestrator-events.jsonl` show as modified
  in `git status`. Neither was touched here; the hooks write both.

## Addendum — golden regenerated under authorisation (260816-1035)

The authorising word came, with the permitted file set widened by exactly one file:
`hooks/lib/__tests__/fixtures/rules-emission.golden`. Both commands were run.

**Regeneration** — `UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts`
rewrote the fixture and failed on purpose (1 failed, 14 passed), exactly as the header describes.

**Fixture diff, reviewed** — 30 insertions, 30 deletions, one file. Two lines moved in each of the
15 agent stanzas and nowhere else: `fusion-workbench-conventions.md 55104` → `55184`, and that
stanza's `total` by the same +80. No other rule file's size moved, no stanza gained or lost an
entry, and the fixture's first 14 lines are untouched (the diff's single hunk opens at line 15).
The four distinct totals all shift by exactly 80: 89 623 → 89 703 (the ten five-file agents),
94 457 → 94 537 (analyst, planner, taskplanner), 101 273 → 101 353 (playmaker), 106 107 → 106 187
(shaper), 106 936 → 107 016 (orchestrator).

**Verification** — `npm test` — exit 0. 40 test files, 764 tests, all passing.

`RULE_BASELINE` did not move and was not touched. The regeneration recorded the growth; the
head-room stands at 8 870 bytes of the 12 000-byte budget.

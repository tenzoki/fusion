# coder — the three Turn-2 review defects, all prose

**Date:** 2026-08-14 11:51
**Status:** Complete
**Circle:** `260801-1244-curator`
**Task:** Resolve the three defects `coderev` filed at stamp `260814-1128` against Turn 2.

---

## What was implemented

All three were comment or description text. No behaviour changed, no assertion moved, and no
number in `RULE_BASELINE`, `RELEASE_CAP` or `DRIFT_CEILING` was touched.

**Medium — the justification duty's firing path.** Before editing I re-read the trigger rather
than taking the finding on trust: `floorOf` (`:689`) delegates to `growth()` (`:636`), whose floor
is `RULE_BASELINE[f.rel]` summed over the role's files. The finding is right and the mechanism is
right; only the prose was wrong, so only the prose moved.

- The orchestrator role's entry in `ROLES` no longer says the assertion is "one core-file edit
  away from firing". It now names the two things that can actually move a floor — a re-baseline at
  one of the two events in `## Re-baselining`, and an audience change in `bin/fusion-rules` that
  hands the role another already-baselined file — states that editing a rule file moves what the
  role emits and not what it stands on, states that a newly added always-on rule contributes 0 to
  the floor and counts as growth in full instead, and names the gate the next core-file edit really
  meets, the hard bound at `+GROWTH_BUDGET`.
- The `RELEASE_CAP` docblock's account of the duty now says the duty measures the FLOOR. A new
  paragraph, `READ THAT AS THE FLOOR AND NOT AS THE BILL`, says what a role emits is the floor plus
  everything its files have grown since the baseline was last set, that a role can therefore stand
  under the cap on its floor and over it on what it ships, and that the duty is silent through that
  because the gap belongs to the budget report and to the hard bound. The false clause — a floor at
  or below the cap "costs a consuming project nothing it was not already paying" — is gone.

Both corrections were written **without present-tense byte figures**, so neither can go stale the
way the sentences they replace did. That is decision `260814-0845` applied to the repair itself.

**Low — the curator's frontmatter.** `agents/curator.md:3` now reads "no existing statement is
changed before a user gate", the record's suggested wording, so the description agrees with `:16`,
`:168` and `## Scope`. No colon introduced. `CLAUDE.md:16` and `README-agents.md:41` left alone —
the record calls those a judgement, not a defect.

**Low — the four stale figures.** Removed, not refreshed, per decision `260814-0845` and the
record's own candidate fix: `(89 896 + 12 000 = 101 896)`, the `89 896 to 111 766` range, the
`21 870` bytes of head-room and "the five leanest agents". The surviving sentences say the same
things without a number that ages. The cut log's own occurrences of the same digits at `:364`,
`:371` and `:381` were left untouched — they are historical measurements of past fleets, which the
decision's constraints put out of scope.

## Effect on the armed bound

**None.** Measured before and after with `bin/fusion-rules coder | xargs wc -c`: **93 926 bytes
both times**, a net effect of **0**. Neither touched file is under `rules/` — `agents/curator.md`
is a prompt and `rules-emission-golden.test.ts` is under `hooks/`, which the hard bound does not
measure. The orchestrator's 229-byte margin under `RELEASE_CAP` is unchanged, and the suite printed
no `RULE-TEXT BUDGET` report for any role. This was the first task to run under the armed bound and
it did not go near it.

## Verification

- `cd hooks && npm test` — exit 0. 49 files, 1030 tests, all passing. `grep -c "RULE-TEXT BUDGET"`
  over the captured run: 0.
- `claude plugin validate .` from the repository root — exit 0, "Validation passed with warnings",
  the one pre-existing `CLAUDE.md` root-context warning and nothing else.

## Files changed

- `hooks/lib/__tests__/rules-emission-golden.test.ts` — four comment edits
- `agents/curator.md` — frontmatter `description`, one clause

## Records closed

Three, each with a `Resolved:` line and an `_o_` -> `_c_` rename, under
`circles/260801-1244-curator/issues/`:

- `260814-1128_*_the-justification-dutys-prose-describes-a-firing-path-the-floor-based-assertion-does-not-have.md`
- `260814-1128_*_the-curators-frontmatter-description-still-carries-the-unqualified-gate-absolute.md`
- `260814-1128_*_three-byte-figures-and-one-agent-count-beside-the-arming-were-left-stale.md`

Not committed — the orchestrator commits.

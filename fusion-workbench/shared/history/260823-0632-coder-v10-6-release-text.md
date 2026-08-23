# coder — the text half of the v10.6.0 release

**Status:** Complete
**Circle:** 260823-0023-settle-what-travels-between-checkouts
**Dispatched by:** orchestrator
**Files changed:** `.claude-plugin/plugin.json`, `docs/upgrading-to-v10-6.md` (new), `skills/help/SKILL.md`, `README.md`, `install.sh`, `hooks/lib/__tests__/reference-resolution-lint.test.ts`, `hooks/lib/__tests__/fixtures/surface-growth.golden`

No git operation was performed. The commit, the tag and the push are the orchestrator's.

## The five version surfaces

**`.claude-plugin/plugin.json`** — `version` 10.5.0 -> 10.6.0. The `description` field is
unchanged; see the sixth surface below.

**`docs/upgrading-to-v10-6.md`** — new, on the shape of `upgrading-to-v10-5.md` and
`upgrading-to-v10-3.md`. It opens by saying nothing is rewritten and there is no migration step,
which is what `v10-3` established for a release that asks nothing. Six sections: the `/fusion:next`
activation (the one user-visible change), the orchestrator's conditional `/fusion:direct`
permission, the three-release cap on `/fusion:help`'s update topic, the Step 0e guards, the
reviewer contract's new home, and the four bounded-surface cuts. Then `## What you have to do`
(nothing), `## What did not change`, and `## Where to read more`.

Every claim was checked against the tree rather than taken from the dispatch: the emission block in
`bin/fusion-rules` (`IS_REVIEWER_AGENT`, `coderev|ontorev`), the Step 6.5 rewrite in
`skills/next/SKILL.md`, the new `## Capturing a Directive as an anticipated Circle` section in
`agents/orchestrator.md` and the decision it cites, the three guarded blocks and the
`source-root-unresolved` token in `skills/setup/SKILL.md`, and the four surface cuts in the diff
`v10.5.0..HEAD`.

**`skills/help/SKILL.md`** — the v10.6 paragraph added at the head of the update topic, the v10.3
one rolled out under the three-release cap, and the two surviving cross-pointers extended to name
the v10.6 note.

**`README.md`** — the `FUSION_REF=tags/v10.5.0` example at line 26 moved to `tags/v10.6.0`, and an
`**Upgrading from v10.5?**` paragraph added above the v10.4 one. The paragraph is not the line the
dispatch named. It was written because `CLAUDE.md` `## Layout` states that each upgrade note is
pointed at from `README.md` `## Install`, so shipping the note without the pointer would leave that
statement false and README describing v10.5 as the newest release.

**`install.sh`** — the same example in the header comment, line 27.

## Does v10.3 carry an action that fails silently when skipped?

No, and the standing line therefore still names two, from v10 and v9.

What v10.3 asked of a user was to stop hand-writing a `**Status:**` head field into new decision
records, and to expect one more question at a Circle closure. Skipping either is visible where it
happens: a field nothing reads, or a question that is not put. Neither leaves a project holding a
setting that is quietly not applied, which is the property the standing line preserves. The v10.3
note's own `## What you have to do` says "Nothing" and lists exactly those two habits.

The reasoning is stated in the new upgrade note rather than in `skills/help/SKILL.md`, because the
skill body is the capped surface and the answer is "the line does not move".

## What it cost

`skills/help/SKILL.md` 17 045 -> 17 287 bytes, +242. The `skills/*/SKILL.md` head-room went
4 580 -> 4 338 against `SKILL_BASELINE` and its 20 000-byte budget. The v10.6 paragraph was written
at roughly 640 bytes against the ~1000 its two siblings run to, because this release asks nothing of
the user and a shorter paragraph says so; the rolled-out v10.3 paragraph was the family's shortest
at 513.

`hooks/lib/__tests__/reference-resolution-lint.test.ts` +9 lines for one re-approval block covering
the whole pass. The hook-test surface stands at 20 088 lines.

No baseline map moved. `surface-growth-bound.test.ts` and `rules-emission-golden.test.ts` show an
empty diff against HEAD, so `AGENT_BASELINE`, `SKILL_BASELINE`, `TEST_LINE_BASELINE` and
`RULE_BASELINE` are byte-identical. The golden was regenerated with `UPDATE_SURFACE_GOLDEN=1` and
its diff carries exactly two lines of change plus their totals: `help/SKILL.md` and
`reference-resolution-lint.test.ts`.

## The reference-resolution pin

`paths` 1269 -> 1284, `anchors` 171 -> 175, `records` unmoved. The per-token attribution was
measured rather than estimated: `PLUGIN_PATH_RE` was replayed over each edited file's before and
after text, and the fifteen decompose as thirteen in the new note, one for README's pointer to it,
and one for `rules/review-contract.md` entering the help body. The v10.3-for-v10.6 paragraph swap
moved a `docs/…` pointer each way and is net zero. `anchors` is the note's four `## Where to read
more` entries that name a heading. `records` does not move because the note cites no workbench
record, which is the precedent `upgrading-to-v10-5.md` set.

## The em-dash measurement, stated rather than passed over

`bin/fusion-prose-metric docs/upgrading-to-v10-6.md` reports 8 em-dashes over 1 229 prose words,
6.5 per 1000 against a ceiling of 1. All eight are the term-definition separator in the
`## Where to read more` list, which is the form all five sibling notes use; the body of the note
carries none. `rules/user-facing-output.md` states the ceiling in the bullet about the em-dash used
as a parenthetical break, and the list separator is not that pattern, so the convention was kept and
the number is reported here instead of being left silent. The tool reports and gates nothing. For
comparison the siblings measure 5.3, 14.6 and 11.8 per 1000.

## Verification

`cd hooks && npm test` — exit 0. 41 files, 724 tests. Two gates went red mid-pass and both were the
expected consequence of the edit: the surface golden (regenerated, diff read) and the
reference-resolution pin (re-approved with the attribution block above).

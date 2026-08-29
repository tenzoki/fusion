# coder — the migration note catches up with the second channel

**Status:** Complete
**Date:** 2026-08-17
**Circle:** 260816-1741-guard-becomes-observation-only
**Task:** fix issue `260817-1506_*_three-surfaces-say-the-retired-file-diagnostic-has-one-channel-and-the-orchestrator-fix-gave-it-two.md` against the unshipped `01932d6` (goes out as v10.0.1)

## What changed

- `docs/upgrading-to-v10.md:11-13` — the sentence that motivates the whole page. "and no session
  says so out loud" was flatly false as of `01932d6`, which made the orchestrator repeat every
  loader diagnostic in its Setup-complete summary. It now says that nothing moves the budget for
  you, that fusion names the leftover file on every guarded tool call, and that the orchestrator
  repeats it at Setup. The "yours to fix, one minute" framing is kept: what is silent is the
  behaviour, not fusion.
- `docs/upgrading-to-v10.md:74-77` — "That channel was chosen over a one-off Setup message
  deliberately" asserted an exclusivity that no longer holds. Rewritten as "the channel that does
  not depend on Setup", which is the half of the original reason that is still true, plus a
  sentence that the Setup summary repeats the same line when Setup runs.
- `README-hooks.md:315` — the subjunctive "where a Setup step *would* run once per session" said
  no Setup step speaks it. Indicative now, with the second channel named.
- `hooks/lib/config.ts:105-114` — narrowed "`/fusion:setup` was the alternative" to
  "`/fusion:setup` MOVING THE BUDGET was the alternative", and added the two-sentence statement
  that this docstring names which channel carries the migration and is not the complete list of
  places the text is heard.
- `hooks/dist/lib/config.js`, `hooks/dist/lib/config.d.ts` — rebuilt. The docstring ships in
  `dist`, so an un-rebuilt tree would have carried the old text into every install.

## What was judged true and left alone

The reviewer named four sites; three went false, one did not.

`config.ts`'s "THE RETIRED-FILE DIAGNOSTIC IS THE WHOLE OF THE v10 MIGRATION" and the same clause
in `README-hooks.md` were both kept. They claim that nothing in fusion performs the migration,
which is still exactly true: `01932d6` writes nothing, reads no old file and moves no value. It
gave the diagnostic a second *audience*, not a second mechanism. What had to change around that
clause was the counterfactual grammar wrapped round it, which said a Setup surface does not exist.

Two further sites carry the same sentence and are correct as they stand.
`hooks/lib/__tests__/hooks-wiring.test.ts:46` uses it to argue the Bash matcher must stay, because
a project that never runs Setup has only the per-call channel — untouched by `01932d6`, and a hook
test is a growth-bounded surface besides. Decision `260816-1916_*_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md`'s recorded `Cons` line for option
1 says the advisory reaches a project through the monitor's warnings panel rather than as a
sentence in the terminal; that is a record of what was weighed on 2026-08-16, not a live claim,
and amending a decision record was outside this dispatch. Recommended to the orchestrator as a
follow-up if the project expects a record's Cons to read as current.

## One intermediate red, and why no pinned number moved

The first version of the `README-hooks.md` correction cited `agents/orchestrator.md` by path.
That is a resolvable class-(a) reference, so `reference-resolution-lint`'s pinned count went from
1120 to 1121 and the suite failed. The gate's own message calls re-approving the baseline the
expected response, but this patch was dispatched not to touch a baseline, so the path citation was
replaced with prose naming the orchestrator's own Setup Step 2. The same pointer inside
`config.ts` costs nothing: `hooks/lib/*.ts` is scanned `recordsOnly`, so only class-(c) record
citations count there.

No growth bound was reached. `docs/` and `README-hooks.md` are unbounded surfaces, and no
`agents/*.md`, `skills/*/SKILL.md` or hook test was edited.

## Verification

`cd hooks && npm test` — exit 0. 35 files, 653 tests passed, the same count as before the change.

Index left untouched: nothing staged, nothing committed.

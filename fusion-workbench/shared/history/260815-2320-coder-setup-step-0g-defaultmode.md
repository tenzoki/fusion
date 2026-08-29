# Coder — Setup Step 0g no longer replaces a `defaultMode` in silence

**Stamp:** 260815-2320
**Agent:** coder
**Status:** Complete
**Source record:** `260815-1633_*_setup-step-0g-silently-replaces-a-project-s-existing-defaultmode.md`
**Files changed:** `skills/setup/SKILL.md`

## What the defect was

Step 0g set `permissions.defaultMode` to `"bypassPermissions"` unconditionally, and the
skip beside it fired only for a project already at that same value. A project that had
deliberately chosen `acceptEdits` or `plan` was asked a question about *writing a file*,
never about *replacing a setting*, and lost the choice on "yes" without the old value
appearing in the question or in the report. The "only add, never remove" guarantee two
lines above is written about the `allow` list — a list of entries that are unioned — and
never reached the scalar that is overwritten.

## What changed

Four edits, all inside Step 0g, no surrounding prose reflowed:

1. **§1 Ask** — the step now reads `.claude/settings.local.json` before asking and notes
   `permissions.defaultMode`. Already `bypassPermissions` → skip the question. Any other
   value → the question must name it and state that yes replaces it. The sentence that
   carries the rule is the one that matters: *a replacement the question did not name is
   not a replacement the user consented to.*
2. **§2 step 3** — the scalar is set only when the file carries no `defaultMode`, or when
   the question named the existing value the user agreed to replace. The write path can no
   longer set it silently.
3. **§3 report** — where a replacement happened, the report names the old value beside the
   new one.
4. **The guarantee's scope** — "only add, never remove" now says outright that it is about
   the `allow` list and reaches no other field, so a later reader cannot extend it to
   `defaultMode` by assumption. That assumption is how the defect got written.

`+845` bytes on a surface with roughly 19 000 of head-room; the `skills` bound assertion
passes.

## Verification

`cd hooks && npm test` — **exit 1**, both in the main tree and in a detached worktree at
`4f7508d` carrying only this patch. In the isolated worktree the run is `750 passed,
1 failed`: the single failure is the *golden inventory* assertion in
`lib/__tests__/surface-growth-bound.test.ts`, reporting `setup/SKILL.md 35385 → 36230`.
That is the fixture recording what the file measures, not the bound recording what it may
grow by — the `skills` bound itself is green, and 11 of that file's 12 tests pass.

The golden was **not** regenerated. Two reasons, and the first is sufficient: this task's
file set is `skills/setup/SKILL.md` alone, and
`hooks/lib/__tests__/fixtures/surface-growth.golden` is a second file. The second is that
the session has further tasks editing bounded surfaces, so a regeneration now goes stale
on the next one; it belongs at the end of the session, once, as the test's own header
describes (`UPDATE_SURFACE_GOLDEN=1`). Regenerating moves no baseline and clears no bound
either way.

The main tree additionally fails `rules-emission-golden.test.ts` for `analyst`, from a
concurrent task's edits to `rules/fusion-workbench-conventions.md` and
`hooks/lib/__tests__/fixtures/rules-emission.golden`. Not this task's — it does not appear
in the isolated worktree.

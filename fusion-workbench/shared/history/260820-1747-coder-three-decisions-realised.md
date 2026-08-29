# Coder — realising three answered decisions

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-20
**HEAD at dispatch:** `66477e3`
**Domain:** code

---

## What was asked

Realise three decisions the user answered on 2026-08-20. Independent in code; each is a case
where a mechanism outlived the thing it was built for.

## A. `Retired:` extended to `_a_` (decision `260815-2056`, option 1)

`rules/fusion-workbench-conventions.md` — three sites, one family, no second annotation:

- `### Decision files` — the `Retired:` block now reads "removed the **subject**", says the marker
  stays where it stands, and states which case each marker puts the reader in.
- `## Decision Record Template` footer — `<set when the subject is removed; the marker stays _i_ or _a_>`.
- `## State Markers — decisions`, the `_a_` row — gained the sentence that `_a_` does not assert
  realisation is still possible. That row's flat "not yet realised in code or data" was the exact
  claim the decision named as misleading in the opposite direction from `_i_`.

Applied to the two records the decision names. **Both cited hashes were verified against the tree
before writing**, by listing each commit's deletion set:

- `5d29b6d` "refactor(stash): the two skills go…" deletes `skills/circle-stash/SKILL.md`,
  `skills/circle-pop/SKILL.md`, `rules/workbench-stash-and-lock.md` and
  `hooks/lib/__tests__/circle-stash-git-exclusion.test.ts`. Cited on
  `260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate.md`.
- `f45f76a` "refactor(drift): the counters go…" deletes `bin/fusion-state-drift`,
  `hooks/lib/state-drift.ts`, `hooks/state-drift.ts`,
  `hooks/lib/__tests__/state-drift-detection-lint.test.ts` and four `dist` siblings. Cited on
  `260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`.

Every file each record's prose names appears in the corresponding commit's deletion set. One
wording imprecision, not corrected because it is not load-bearing: `260806-1152` says `5d29b6d`
"cut the `## Stashes` half out of the rule file"; git records the whole of
`rules/workbench-stash-and-lock.md` deleted and `rules/commit-lock.md` added.

**Cost: +502 bytes on the always-on set. Head-room 6 206 -> 5 704.**

## B. `analyst` gains a `PATTERNS` arm (decision `260815-1845_*_does-analyst-get-a-project-local-rule-pattern-now-that-the-investigator-fold-orphaned-one.md`, option 3)

`bin/fusion-rules` — new `analyst) PATTERNS="analyst" ;;` arm, `analyst` removed from the empty arm.

**The pattern is the bare token `analyst` and deliberately not also `analysis`.** The glob is a
substring match (`*"$pat"*.md`), so `analysis` would sweep up a project's own `gap-analysis.md` or
`impact-analysis.md`, which are subject matter rather than agent configuration. Verified in a
scratch consuming project: `analyst-capture-layout.md` matched; `investigator-capture-layout.md`,
`gap-analysis.md` and `coding-hygiene.md` each did not.

The orphaned `./rules/investigator-capture-layout.md` does **not** match and was not rescued. The
pattern was not widened for it; `docs/upgrading-to-v9.md` §4 now offers a rename as the cheap route.

Three statements were made false by the arm and were repaired:

- `README-agents.md` domain-pattern table — `analyst` moved to its own row.
- `skills/help/SKILL.md` §5 — no longer claims the manifest is the **only** route for `analyst`.
- `docs/upgrading-to-v9.md` §4 — no longer says `analyst` draws no pattern, and no longer calls the
  question open.

## C. `**Initiated by:**` required on every mode-3 run (decision `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`, option 1)

`agents/shaper.md` — the `AskUserQuestion` self-test is deleted. The line is required on every
portfolio-activation run, dispatched or top-level. The residual is carried in the prompt beside the
requirement: the line is a claim and not a proof, because an audit line is written by the party
being audited.

Others who believed the old two-case rule, both repaired:

- `agents/orchestrator.md` — "a dispatched shaper halts without it" -> halts on any mode-3 run.
- `README-agents.md` dispatch-parameter row — carried the two-case rule and named the self-test.

**Left standing, deliberately:** five agent prompts (`analyst.md:44`, `bugfixer.md:41`,
`curator.md:245`, `planner.md:71`, `shaper.md:131`) state "Run top-level (user-initiated). You have
`AskUserQuestion`." The headless probes make that false for a headless top-level run. It is a claim
about the clarification **channel**, not about the audit line, and correcting it properly needs the
interactive-parent inheritance measurement that option 3 of `260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md` names and that no session
has been able to take. Widening this change into those five would be deciding that unmeasured
question by prose.

**Cost: +469 bytes on `agents/`. Head-room 2 728 -> 2 259.**

## Pinned constants moved

- `hooks/lib/__tests__/fixtures/rules-emission.golden` — regenerated with `UPDATE_RULES_GOLDEN=1`.
  30 lines moved, all of them A's `+502` on `fusion-workbench-conventions.md` and the per-agent
  totals. **No path was added or removed**, and the `analyst` block is unchanged: the golden
  measures in a neutral cwd with no project rules, so B moves it by zero.
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated with `UPDATE_SURFACE_GOLDEN=1`,
  twice: `agents`/`skills` after C, `hook-tests` after the baseline note below.
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` — 1194/157/111 ->
  1195/157/112, re-approved with the note its convention requires. Attribution measured by
  reverting each of the seven edited files to HEAD in turn: `bin/fusion-rules` alone returns the
  gate to the old numbers, so the whole movement is that file's comment.

No baseline in `surface-growth-bound.test.ts` or `rules-emission-golden.test.ts` was moved. All
growth fits inside existing head-room, which is the condition for not moving one.

## Verification

`cd hooks && npm test` — **exit 1**, 715 passed, 1 failed.

**The failure is pre-existing and not mine.** It was measured before the first edit: the same
`workbench-citation-lint.test.ts` failure with the same 10 violations, 715 passing, at dispatch HEAD
`66477e3`. All 10 are stale `_o_` citations of the three decision records that were renamed to `_a_`
when the user's answers were appended. The fix form is the `_*_` wildcard (decision `260806-0015`).

Not repaired here on purpose. `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`
is answered, and its closing paragraph assigns the obligation: "A change that renames a record's
marker carries the grep for the old name itself." The renaming party is the session that appended
the answers, not this dispatch, and record bookkeeping was excluded from it.

The 10, for whoever discharges them:

| File | Lines |
|---|---|
| `260801-1244-curator` | 140, 419 |
| `circles/260801-1244-curator/issues/260814-2017_o_the-newest-decision-record-carries-no-answered-implemented-footer-block…md` | 4, 37, 50 |
| `260806-1152_*_stash-manifest-dirname-and-pointer-content-duplicate.md` | 76, 89 |
| `260810-2032_*_should-the-drift-checks-four-sentences…md` | 163, 185 |
| `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation…md` | 93 |

## Not done, per the dispatch

No marker transitioned. No `Resolved:` or `Implemented:` line written. Nothing committed.

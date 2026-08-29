# Reconciliation — Circle 260816-1741-guard-becomes-observation-only, second pass

**Date:** 2026-08-17
**Agent:** reconciler
**Domain:** `code`
**Trigger:** orchestrator Phase 3, after the Rebalance the first pass's `review-needed` verdict caused
**Range verified:** `3d41d4a..d0f13fa` — 27 commits after the anchor, six of them new since the first pass
**Predecessor:** `260817-1417-reconciliation.md`
**Status:** Complete

## Verdict in one line

The flag the first pass raised is fixed and independently verified; every code clause of the
Directive verifies at HEAD; **one clause does not, and the user chose that**. Verdict
`review-needed`, one edge flagged on completeness rather than direction, and the honest closure is
Bounded Closure (`_b_`) rather than another Turn.

## What was reviewed

| Store | Read | Updated |
|---|---|---|
| Circle planning | 1 plan | 1 — second-pass section appended to the Reconciliation Log; no marker moved |
| Circle issues | 29 | 8 — 1 closed, 7 annotated and left open |
| Circle decisions | 3 | 0 — all three `_i_` with cited commits |
| Circle reviews | 3 | 1 — the Turn-4 review annotated per finding |
| Circle history | 25 | 0 — this file is the 26th |
| Shared issues | 338 (93 open) | 3 — `Also seen:` appended to three records, no marker moved |
| Shared decisions | 55 (24 active) | 1 — the re-measurement `260815-2109` asked for |
| Shared planning | 9 (1 open) | 0 |

New records filed: **2** — one defect in `shared/issues/`, one decision in `shared/decisions/`.
Both went to the shared stores under the Origin Rule: each was found beside this Circle's work
rather than caused by its Directive.

## 1. The two corrections in `_t_circle.md`, verified rather than accepted

These were the first pass's flag and the reason this pass exists, so both were re-derived from the
tree instead of from `dbbad70`'s message.

**The test-list correction holds.** `guard-state-shape.test.ts` is out of the "test files whose
subject is being removed" list at `_t_circle.md:101`, and the explanatory paragraph beneath it is
accurate in every particular: `hooks/lib/__tests__/guard-state-shape.test.ts` is present,
`hooks/lib/guard-state-file.ts` keeps exactly two callers, and the two line citations resolve —
`hooks/lib/review-coverage.ts:118` and `hooks/lib/staging-drift.ts:128` both import
`{ isStateObject, loadGuardState, saveGuardState }` from it. The four test files the list keeps
naming are genuinely absent (`escalation.test.ts`, `guard-escalation-shape.test.ts`,
`guard-halt-event.test.ts`, `clear-halt-concurrent-halt.test.ts`) and the one it says to sequence
rather than delete, `legacy-halt-clearing.test.ts`, is present.

**The text-surface correction holds, in both directions.** Each of the three added surfaces was
read at the anchor `3d41d4a` and at HEAD:

| Surface | At `3d41d4a` | At HEAD | Corrected by |
|---|---|---|---|
| `docs/working-model.md` | "only two things ever block a write", plus the escalation-to-halt bullet | "it blocks none of them"; `:123` names four removed mechanisms with dates | `1fb3f32`, `5763550` |
| `README-agents.md:169` | budget resolved from `fusion-guard.json` over `hooks/config.json` | `fusion.json`, "Two layers and no third" | `1fb3f32` |
| `hooks/session-start.ts` | warning justified by `lib/project-relative.ts` and `isFusionPluginCwd()` | one surviving resolution, both removed ones in a past-tense paragraph dated 2026-08-16 | `ec3b6ad` |

So the record's account of what each surface said at the anchor is accurate, and each was in fact
corrected inside this Circle. Both `260816-1917_*` records carry a `Resolved:` footer and a `_c_`
marker.

## 2. `dbbad70`'s absorbed renames — measured, and the count corrected upward

Filed as `issues/260817-1502_*`, annotated there in full. The short form:

**Six renames, not four.** `git show --name-status --find-renames dbbad70` returns seven paths:
`_t_circle.md` modified, the two `260816-1917_*` records renamed *with* content (`R065`, `R052`),
and four pure renames at 100 % similarity that the message never names — `260816-2123_*_claude-mds-two-dangling-citations-keep-the-citation-lint-red-and-no-step-in-this-plan-may-fix-them.md`,
`260816-2317_*_claude-mds-dangling-citation-set-grew-from-two-to-four-at-7b-and-one-whole-layout-row-is-now-false.md`, `260817-1032_*_two-of-the-three-bounded-surfaces-grew-through-this-circle-so-only-the-hook-tests-baseline-moves.md` and the plan `260816-1915_p_` → `_c_`.

**The absorption is one step wider than "four staged renames".** The two named records' similarity
indices are below 100 because each also carries the reconciler's unstaged
`Reconciliation 2026-08-17, Phase 3` annotation block, picked up by the orchestrator's `git add` of
those paths. So an unstaged *content* edit from another agent landed under a message describing only
the shaper's half.

**Nothing was lost and nothing wrong was committed**, on three separate checks: the four pure
renames' content edits are all present in the very next commit (`bee46e7` shows `M` on all four at
their new names); all seven paths are tracking files of this Circle, with no code, no data and
nothing outside `fusion-workbench/`; and all four renames are correct changes, each re-verified
against the tree — the citation lint green inside a whole-suite pass, `CLAUDE.md:30` rewritten
rather than repaired at its paths, `TEST_LINE_BASELINE` moved alone with the argument at
`hooks/lib/__tests__/surface-growth-bound.test.ts:163-181`, and every plan step plus the amendment's
step 16 marked `[DONE]` under `**Status:** Complete`.

**The tree and the index are consistent.** `git diff --cached --quiet` and `git diff --quiet` both
exit 0, `git status --porcelain --untracked-files=all` is empty, and
`git rev-list --left-right --count origin/main...HEAD` is `0 0`. Nothing was staged by this pass;
the one rename it performed used `mv`, not `git mv`, precisely because `git mv` stages and staging
is the defect `260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md` records.

**It is a re-filing.** `shared/issues/260816-0105_*` filed the same defect on 2026-08-16, from
session 260815-2147-orchestrator-session.md and commit `a19c867`, with the same mechanism and the same reading of why
Step 3b steps 4 and 5 do not reach it. The duplicate check that the filing convention mandates was
not run before `260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md` was written. Both records are now cross-annotated; they are one defect
and want merging.

## 3. Review coverage over the extended range

`bin/fusion-review-coverage --since 3d41d4a` at HEAD:

```
commits=27  reviews=3  unusable=0  uncovered=3  verdict=uncovered
```

Down from `uncovered=9` at the first pass. The three uncovered commits:

| Commit | Subject | Shipped files touched |
|---|---|---|
| `70f17da` | Turn 4 opens the twelve commits no review had opened | none — five workbench records and `orchestrator-events.jsonl` |
| `dcb0784` | the migration note stops saying no session speaks the retired-file diagnostic | `README-hooks.md`, `docs/upgrading-to-v10.md`, `hooks/lib/config.ts` (docstring only), `hooks/dist/lib/config.{js,d.ts}` |
| `d0f13fa` | version 10.0.1 | `.claude-plugin/plugin.json`, `README.md`, `install.sh` |

The count is **not** four, and the reason matters: `coderev`'s declared range is
`1d1d3a3..01932d6`, twelve commits, which already contains `dbbad70` and `bee46e7`. The three
uncovered ones all come *after* the review, and a review cannot open the commit that adds it — so
this residue is structural, unlike the nine the first pass measured. Two files are carried as
not-opened inside the reviewed range, `hooks/lib/__tests__/fixtures/rules-emission.golden` and
`.../surface-growth.golden`.

One thing worth naming without inflating it: `dcb0784` changed a shipped **code** file that no
review opened. The change is a docstring in `hooks/lib/config.ts:103-114` plus the `dist` rebuild
that carries it; no behaviour moved.

Per `shared/decisions/260815-2109_a_*` (options 3 then 1, answered by the user on 2026-08-16)
coverage is **advisory** and does not flag an edge. It is reported here because it was asked for,
not because it changes the verdict.

## 4. Issue triage

**Closed (1).** `260817-1417_*_the-release-went-out-over-a-turn-whose-six-shipped-file-commits-no-review-opened.md`
→ `_c_`. Its own option 2 was executed at Turn 4 as `70f17da`: the review opened twelve commits,
subsuming all nine uncovered and all six that touched shipped files, including the one `v10.0.0`
points at. Five findings came out of it and one shipped inside v10.0.1. The historical fact stands
and is stated in the footer — what closed is the gap, not the history.

**Open and annotated (7).** Every one re-measured at HEAD rather than re-asserted:

- `260817-1505_*_the-curator-and-its-skill-still-say-a-projects-guard-configuration-can-deny-a-write.md` — both sentences stand verbatim at `agents/curator.md:212` and
  `skills/curate/SKILL.md:110`. **This is the one open item inside the Circle's own Directive.**
- `260817-1507_*_the-turn-budget-helpers-authoritative-header-still-scopes-its-stderr-to-dropped-keys.md` — `bin/fusion-turn-budget:14` still scopes its stderr to what the loader "had to
  drop", while the two surfaces in the same class moved at `01932d6`.
- `260817-1508_*_the-archive-skills-event-log-description-names-three-retired-event-types-and-omits-both-live-ones.md` — `skills/archive/SKILL.md:130` and `:132` unchanged; neither live event type
  appears anywhere in the file.
- `260817-1509_*_no-test-pins-the-repeat-to-the-user-mandate-that-already-shipped-narrow-once.md` — the suite is still 35 files and 653 tests, the same count as before `01932d6`, so
  no test arrived with the fix.
- `260816-2319_*_the-answer-site-case-in-hook-fail-open-cannot-fail-on-the-violation-its-describe-block-names.md`, `260816-2320_*_the-write-trace-is-now-the-guards-only-product-and-two-of-its-four-tools-reach-no-integration-case.md` — unchanged since the first pass, re-measured by reading the files.
- `260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md` — annotated with the full measurement above; the remedy is a three-option choice and
  stays undecided.
- `260817-1417_*_one-commit-…-german` — still one of twenty-seven; the six new commits are all
  English, and the commit is published, so nothing is repairable in place.

The first four are open **by explicit user decision against a shipped release**, not by drift.

**Nothing was misfiled as an issue that should be a decision** — with one qualification. `260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md`
carries a defect half that is settled and a remedy half that is a three-option choice with pros and
cons, which is a decision record's shape. It is not moved here: the incident it records is a defect
and the record is the only place the measurement lives. If the merge with
`shared/issues/260816-0105_*` happens, that is the moment to decide whether the merged record stays
in `issues/` or splits.

## 5. New records (2)

- `260817-1613_*_the-reconcilers-verdict-vocabulary-has-no-case-for-a-directive-that-is-reachable-but-deliberately-not-reached.md`
  — Medium. The aggregate verdict has three values and this Circle falls between them: not
  `coherent` (a Directive clause is unmet), not `bounded-closure-proposed` as defined (nothing is
  unreachable), and `review-needed` only by elimination, whose recommendation mapping then points
  away from the honest closure. A gap in a case split, which `rules/critical-stance.md` §4 classes
  as a defect rather than as polish. It decides a permanent marker, so it is not cosmetic.
- `260817-1613_*_does-a-plan-stated-precondition-get-any-mechanism-or-is-it-read-by-a-human-or-not-at-all.md`
  — the undischarged half of the closed `260817-1417`. This plan's `## Where this Circle stops` made
  the review pass a precondition of the tag, nothing read the clause, and the release went out. The
  same plan's third reason for stopping at the work tree cited a defect this project had already
  paid for; the Circle then repeated it.

## 6. Duplicates found by the filing check, and what they cost

Running the mandated `ls` over open record names before filing turned up **three** prior records
covering findings this pass was about to file. All three got an `Also seen:` line instead of a new
file, and one of them means an existing record is itself a duplicate:

- `shared/issues/260816-0119_o_*` (the citation lint stops at `hooks/lib/__tests__/`) — a second
  live instance, created by this session's own rename: `surface-growth-bound.test.ts:174` cites
  `260817-1032_*_…`, and that record moved to `_c_` in `dbbad70`. `npm test` is green because
  `surface()` still stops at `hooks/lib/*.ts`, which is exactly what that record measures.
- `shared/issues/260811-2105_o_*` (Circle records carry stale citations, and it names the
  `**Active …:**` fields specifically) — two live instances in `_t_circle.md`: `:7` names
  `260816-1915_*_…` and the plan is `_c_`; `:167` names `260816-1742_*_…` and
  that record is `_i_`. **Both are due before the closure transition**, for the same reason the two
  corrected enumerations were: after it the record is history. The record's other five citations use
  the ratified `_*_` wildcard form and all resolve.
- `shared/issues/260816-0105_o_*` — the prior filing of `260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md`, as above.

That check is the cheapest step in the filing convention and it prevented two of three intended
filings this pass. It was not run before `260817-1502_*_a-sub-agent-left-renames-staged-and-the-orchestrators-next-commit-absorbed-them.md` was written.

## 7. Checked and found not to be defects

Stated so the next pass does not re-derive them.

- **`docs/upgrading-to-v10.md:17-19` names `v10.0.0`** in its pin example while `install.sh` and
  `README.md` both moved to `v10.0.1`. Not a defect: the document is the migration note for the v10
  release line, `v10.0.0` is the tag that introduced the change, and the tag exists. The consequence
  worth knowing is that a reader who pins it gets the copy of that note `dcb0784` corrected.
- **The Grounding's `### Open decision this Circle carries`** (`_t_circle.md:164-170`) still says the
  Turn-budget decision "is unanswered" and that "the plan cannot be written until the user answers
  it". False at HEAD — the record is `_i_` and the plan is Complete — but corrected in the same file
  fifty lines below, in the playmaker's appended activation section at `:215-222`, which states the
  answer and names it as option 1. A snapshot with an in-file correction is how the record format
  works, unlike the two enumerations, which had no counter-statement anywhere.
- **`skills/archive/SKILL.md`'s mention of `guard_block`, `guard_halt`, `halt_cleared`** is
  historically true in the present perfect and its argument for the roll is still correct. The defect
  in `260817-1508_*_the-archive-skills-event-log-description-names-three-retired-event-types-and-omits-both-live-ones.md` is the omission of the two live types, not the mention of the three retired ones.

## Coherence

The three-edge verdict is written to the orchestrator's session history file,
`260816-1841-orchestrator-session.md`
`## Coherence — second pass`, appended beneath the first pass's section rather than replacing it.

# Reconciliation — Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`, Phase-3 pass

**Date:** 2026-08-15 19:13
**Agent:** reconciler
**Domain:** `code`
**Verified against:** the working tree at HEAD `9306f0a`
**Session:** `shared/history/260814-2306-orchestrator-session.md`, range `9a7da8e..9306f0a`, **32 commits**, 4 Turns, 16 steps plus gate G1
**Coherence verdict:** `review-needed`, written to that session file's `## Coherence` section
**Status:** Complete

---

## What this pass was

The Circle's seventeen plan entries all carried `[DONE]` and the plan still carried its `_o_`
marker, left for closure. This pass verified the sixteen numbered steps and the gate against the
tree, closed the plan, swept the record corpus for defects whose subject the removals deleted, and
issued the three-edge Coherence verdict.

**Nothing was taken on report.** Every claim below was re-derived by running a command or reading a
file at HEAD. That includes the claims on records already marked `_c_`: a marker is a claim, so the
two Turn-4 High findings were re-checked against the tree rather than against their closure footers.

**Voice profile note.** `bin/fusion-rules reconciler` emitted `chat-voice-de.yaml` and no
`default-voice-*.yaml`, which is correct — the reconciler is not one of the long-form-prose agents.
This file follows `rules/user-facing-output.md` and the artifact language (`en`) declared in
`CLAUDE.md`.

---

## Counts

| Population | Reviewed | Changed | Filed |
|---|---|---|---|
| Plans and specs | 10 across `$SCAN_PLANS` (1 in the Circle, 9 in `shared/`) | **1** — status `Approved` → `Complete`, marker `_o_` → `_c_`, reconciliation log appended | — |
| Defect records | 54 in the Circle, 290 in `shared/` — 39 Circle-open and 95 shared-open inventoried, 31 opened and read in full | **19** — 17 closed `_o_` → `_c_`, 4 annotated without a marker move (2 of them also among the closed) | **5** |
| Decision records | 49 across `$SCAN_DECISIONS` (4 in the Circle, 45 in `shared/`); 91 in the whole workbench; 8 read in full | **2** annotated, no marker moved | — |
| Reviews | 9 in the Circle (8 range reviews, 1 unusable plan evaluation) | **2** annotated per finding | — |
| Circle record, `agentstate.yaml`, the session history file | read | **0** — none is the reconciler's to edit; 3 defects filed instead | (in the 5) |

**No marker was moved that the tree did not justify, and no marker was moved on a decision record at
all.** The reason for the second is in `## The Grounding the removals retired` below.

---

## 1. The plan is complete, and three of its claims are not

`planning/260815-0029_c_plan-remove-eight-mechanisms-and-cap-growth.md`. Sixteen numbered steps
(1–15 plus the inserted 3b) carry `[DONE]`; gate G1 is recorded taken with all twelve ledger entries
approved. Status set to `Complete`, marker renamed, full reconciliation log appended to the file
itself.

The three claims the tree does not support are written out in that log with their evidence, and are
summarised here so they are not lost behind a `_c_`:

1. **`## API Changes` says `bin/` helpers went 13 → 10.** `git ls-tree --name-only 9a7da8e bin/`
   gives fifteen entries, fourteen excluding `bin/monitor`; `ls bin/` gives twelve, eleven excluding
   it. The movement is **14 → 11**. Three helpers left, which the row gets right; the population is
   wrong at both ends.
2. **Step 15 is `[DONE]` with one of its four version surfaces unwritten.** `plugin.json`,
   `install.sh:27` and `README.md:26` read `9.0.0`; the marketplace clone reads `8.2.0`, and no
   `v9.0.0` tag exists. The executor named this deliberately and left a numbered hand-off, so the
   marker is a scope judgement rather than an error — but the step's own file list names that path.
3. **Step 7's claim that `shared/issues/260811-1145` is retired by the conceptrev removal is false**,
   which the executor established at the time and this pass re-measured. See §3.

The second entry of `## Open Questions` is still unanswered: whether the Circle record's
`## Dependencies` bullet is corrected or left as a historical statement. At HEAD `_t_circle.md:210`
cites `shared/issues/260812-0254_*_should-the-investigator-get-case-folders-with-a-status-per-case.md`.
The record is a **decision**, at `shared/decisions/260812-0254_s_…`, correctly transitioned by step 8.
So the bullet names a path that does not exist, in the store it does not exist in, and asks for a
transition the decision vocabulary does not have. Closing the plan does not answer it.

---

## 2. The Directive, clause by clause, against the tree

| Clause | Verdict | Evidence |
|---|---|---|
| Eight mechanisms leave the shipped plugin | **met** | `bin/` holds no `fusion-plane`, `fusion-churn-rank` or `fusion-state-drift`; `agents/` holds fifteen prompts, no `conceptrev.md`, no `investigator.md`; `skills/` holds twelve directories, none of the five deleted; `hooks/lib/churn.ts`, `hooks/lib/state-drift.ts`, `hooks/state-drift.ts`, `settings.json`, `fusion-workbench/tasklist.md` and the three Plane runtime files are absent; `hooks/lib/state-file.ts` is present. A repo-wide grep finds no `/fusion:unlock`, `/fusion:revise-claude-md`, `/fusion:circle-stash`, `/fusion:circle-pop` or `/fusion:seed-from-plane` anywhere in the shipped corpus |
| What survives survives on evidence | **met** | `agents/taskplanner.md` keeps its scan, ordering and routing and writes no file; `agents/analyst.md:193` carries `### 9. Failure Investigation`; `agents/consultant.md` and `agents/reconciler.md` are untouched by the removals |
| The administrative surface is three names | **met on the presentation the Directive names, and only there** | `CLAUDE.md`, `README.md`, `README-agents.md`, `skills/help/SKILL.md` and the three skill descriptions all present three. Seven other shipped surfaces still tell the user to type a demoted name, one of them (`agents/orchestrator.md:1292`) in direct contradiction to a surface the step did edit. See §4 |
| The cap fails the suite on an add-back | **met, and demonstrated live** | `hooks/lib/__tests__/surface-growth-bound.test.ts` and `fixtures/surface-growth.golden` exist; `9306f0a` is the proof — an 897-byte edit to `skills/help/SKILL.md` pushed that surface past its recorded size, the suite went red, and the fixture was regenerated with no baseline moved |
| `npm test` passes | **met** | Run by this pass: **40 test files, 751 tests, all passed**, 64.00 s |
| The Closure note carries a before-and-after measurement | **met in substance, pending in form** | `history/260815-1832-coder-after-measurement.md` carries all three comparisons in a seventeen-row delta table, re-derives the before column out of git rather than trusting it, and names four of the Circle's own claims it does not support. The Circle record has no `## Closure` section yet; that is the orchestrator's Phase-4 write. Two rows have since gone stale — filed, see §5 |

**On the measurement clause, which is the one worth arguing.** The clause asks for a measurement, not
for a saving. Step 14 delivered one that partly disappoints its own Circle: the always-on rule floor
*rose* 248 bytes for six of the fifteen agents, 99 percent of the orchestrator's fall is one file
being rehomed at step 6 rather than the eight removals, the suite fell 21 percent rather than to a
third of its length and not even that like for like, and 81 percent of the headline Setup saving is
this repository's own accumulated queue with the portable part at 38 262 bytes. **The clause is
satisfied, and satisfied more strictly than a flattering measurement would have satisfied it.** A
before-and-after that contradicts four of the claims it was commissioned to confirm is the
measurement working. What it disappoints is the Grounding's predictions, not the Directive's
requirement.

**This pass verified that entry rather than re-deriving it**, as asked. The measurement block was
re-run verbatim at HEAD: five rule-emission figures, both `agents/` rows, `rules/`, both hook-line
rows, `bin/`, the test-file count and both Setup rows all reproduce **to the byte**. The always-on
floor table reproduces file by file against `git show d78dfb7:` — `agent-setup.md` 3 513 → 3 499,
`fusion-workbench-conventions.md` 53 124 → 53 399, `user-facing-output.md` 16 784 → 16 788,
`critical-stance.md` 9 958 → 9 941, the two unchanged, total 95 023 → 95 271. The +248 is real and
the +275 on the conventions file is where it comes from. Three rows do not reproduce, and the reason
is that step 15 landed after the reading; see §5.

---

## 3. What the eight review files still leave open

Eight range reviews plus one unusable plan evaluation. **Both Turn-4 High findings are closed and
both were re-verified against the tree by this pass**, not against their closure footers:

- **The resume shell** (`coderev` A1, repaired by `5f2171e`). `agents/orchestrator.md:93` reads
  `echo "turns=${T:-unavailable}"`; each figure is captured into a variable and reported on its own
  emptiness rather than on the exit code of the command that took it. Both copies carry the repaired
  form. The residual — two independent copies with nothing holding them identical — was put to the
  user at gate G1 and answered "accept two copies".
- **The work queue in `agentstate.yaml`** (`ontorev` High, corrected at Turn 4). Sixteen of seventeen
  entries now carry their true status and commit. **The seventeenth does not.** P-15 landed as
  `9306f0a` and both `current_task` and `work_queue[16]` still read `running`, three commits behind
  the file's own `Updated:` stamp. The class recurred four commits after being closed, inside the
  Turn that deleted the check which would have caught it.

**Review coverage is `uncovered`.** `./bin/fusion-review-coverage` at HEAD: `commits=32 reviews=9
unusable=1 uncovered=6 verdict=uncovered`. The six are `c1e207d`, `5f2171e`, `e8052e7`, `0609945`,
`9cde86c` and `9306f0a` — everything after the Turn-4 review file landed. Two of them matter: `0609945`
is the feature commit that arms a failing test gate over three shipped surfaces, and `e8052e7` is the
curator's twelve approved corrections to two normative documents. Neither was opened by a reviewer.
This is the fourth Turn running in which the review range and the commit range have disagreed
(`issues/260815-1455_o_turn-3s-reviewers-were-dispatched-on-four-of-the-seven-uncovered-commits-for-the-third-turn-running.md`
records the first three).

**The `unusable=1` is this Circle's own conceptrev plan evaluation**, and the record about it stays
open, verified rather than assumed. The plan's step 7 asserted that
`shared/issues/260811-1145_o_conceptrev-review-files-are-scanned-…` is retired by the conceptrev
removal. It is not: the defect was the *absence* of a sender filter in `reviewFiles()` and
`measureReviewCoverageForModel`, and no filter was added, so an existing conceptrev file still
produces the permanent `UNUSABLE` row. The executor established this at the time and left the record
`_o_`; this pass re-ran the helper and reproduced it. What the removal changed is the arrival rate,
not the fault. Annotated.

**No open finding contradicts what shipped.** 42 records stand open in the Circle and 80 in
`shared/`, and every one this pass opened is either a documentation or bookkeeping fault, a class
question, or a defect in a surviving mechanism. None asserts that a removal is incomplete or that a
shipped surface is broken.

---

## 4. The collapse to three names, judged rather than restated

The session already holds the finding that the collapse is presentational — a skill directory is a
slash command, so `archive`, `log-activity` and `curate` keep their directories and stay typeable.
The question this pass answers is whether the Directive's clause is met by that reading.

**It is met on what the Directive actually claims, and only there.** The Directive's words are that
fusion's administrative surface *is* three names and that "a user types `setup` …, `cleanup` … and
`cadence` …". That is a claim about presentation, and the presentation changed where the step
reached: the skill listing in `CLAUDE.md`, `README.md`, `README-agents.md`, `skills/help/SKILL.md`
and the three descriptions. Two of the eight names genuinely left the tree with their directories
(`unlock`, `revise-claude-md`); three were demoted.

**What makes it only partly met is that the presentation was not swept to the corpus.** Re-grepped
row by row at HEAD, seven of the nine surfaces in
`issues/260815-1633_o_eight-shipped-surfaces-still-present-the-three-demoted-skill-names-as-user-commands.md`
still present a demoted name as the user's route, and one more (`skills/cadence/SKILL.md:126`) was
not in the record's table. Two rows are discharged, both in
`rules/fusion-workbench-conventions.md`, by `e8052e7` — the curator's pass reached that file because
it is one of the curator's three surfaces and no others. `agents/orchestrator.md:1292` is the one
that is more than presentational: it tells the orchestrator the ordinary surface for the curator is
`/fusion:curate`, while `README-agents.md:246` says the surface is `/fusion:cleanup --only claude-md`.
Both ship, both are read by the orchestrator, and they disagree about what to tell a user.

---

## 5. The Grounding the removals retired, and why no decision marker moved

**Fifteen open shared defect records had a subject this Circle deleted.** The Turn-1 review counted
seven, all Plane, when two of fifteen steps had run. Ten more removals landed after it and the class
grew with them. Every one was opened, its named subject checked against the tree, and closed
`_o_` → `_c_` with a `Resolved:` footer naming the deleting commit:

| Deleting commit | Step | Records closed |
|---|---|---|
| `d0ddabb` | 2 · Plane | `260810-0918` push-fixture, `260810-0918` suite-total variance, `260810-1158` third derivation site, `260813-1051` unguarded mktemp, `260813-1051` plane-curl regression guard |
| `a69d56e` | 4 · churn | `260810-1632` the churn stand-down |
| `5d29b6d` | 6 · stash/pop | `260813-1051` LC_ALL on the shared git helper, `260811-2150` circle-stash's absent max-turns |
| `dd312eb` | 10 · the queue | `260811-1144` staging-shape lint, `260811-1915` queue-ground backticked word, `260811-2330` eighty-one marker citations, `260814-2205` queue-ground parse |
| `f45f76a` | 11 · the counters | `260811-1614` the drift Turn row, `260811-2307` unchecked drift row, `260811-2307` minute-resolution history filename |

Each footer says **moot, not fixed**. One more (`260810-0510`) is half moot and was annotated rather
than closed: one of its two named files was deleted and the other is present.

**Three of the original seven are unreachable from here.** They sit in
`circles/260719-1536-plane-mirror-integration/`, `circles/260813-0858-playmaker-maintains-backlog-store/`
and `circles/260813-0910-documentation-matches-shipped-plugin/`. `bin/fusion-paths` resolves
`$SCAN_ISSUES` to the Circle in scope plus `shared/` and nothing else, so no pass run from this
Circle can touch them. Each was read; each is moot on the same evidence; closing them needs a run
with that Circle in scope. `issues/260815-0803_o_seven-open-defect-records-name-…` therefore stays
open, annotated with what was discharged and what was not.

**Two answered decisions now have no subject, and their markers were deliberately left alone.**

- `shared/decisions/260806-1152_a_stash-manifest-dirname-and-pointer-content-duplicate.md` — its
  answer was "keep both manifest fields, record the reason in the schema documentation". Both stash
  skills and the manifest went in `5d29b6d`, and all three of its `**Cross-references:**` dangle.
- `shared/decisions/260810-2032_a_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline…` —
  its own closing sentence says `_a_` → `_i_` is unavailable until the pin is written against the
  drift lint. `f45f76a` deleted the lint, the check and the four sentences.

Both are **Grounding-Stand** — active best-of-knowledge under
`rules/fusion-workbench-conventions.md` `## State Markers — decisions` — and neither answer can now
be realised. No marker was moved because
`circles/260801-1244-curator/decisions/260814-1332_o_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md`
owns exactly that question and is unanswered. Two of its four candidate answers would apply here, and
renaming on the weakest evidence tier would pre-empt the decision the curator declined to pre-empt at
gate G1. Both records are annotated with the evidence instead.

**That open decision is the most consequential thing this Circle leaves, and its population roughly
doubled inside the Circle.** It was filed when two records inside the curator's editable surface and
about eleven in closed Circles were affected — thirteen, which is the figure the G1 gate reported. At
HEAD the corpus is **91 decision records, 63 of them `_i_`**, and a filename-and-subject sweep finds
at least nine more `_i_` records whose whole subject this Circle deleted: seven Plane
(`260716-1847` ×2, `260719-2141`, `260722-2230`, and the three inside
`circles/260719-1536-plane-mirror-integration/`), two churn (`260809-2004`, `260810-0920`), plus
`260810-1822` on the queue ground. Add the two `_a_` records above and the class stands near
twenty-four. Nothing on any of them says the mechanism is gone.

---

## 6. Records filed by this pass

All five in `$OUT_ISSUE`, this Circle's store, per the Origin Rule — each arose from executing this
Directive.

| Record | What it is |
|---|---|
| `260815-1913_o_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md` | 34 workbench files cite the plan by its `_o_` name; the class question of whether a citation spells `_*_` or the marker it saw is undecided |
| `260815-1913_o_the-marketplace-entry-advertises-five-removed-mechanisms-and-was-recorded-only-in-a-history-entry.md` | Step 15 found it and wrote it into a history entry, which the filing rule forbids as the only home |
| `260815-1913_o_the-work-queue-misstates-p-15-again-one-turn-after-the-same-class-was-closed.md` | The class recurred four commits after being closed, in the Turn that deleted the check for it |
| `260815-1913_o_the-session-history-file-carries-an-empty-duplicate-per-turn-log-stub-above-the-real-one.md` | Two `## Per-Turn Log` headings, the first holding `(none yet)` |
| `260815-1913_o_the-closure-measurements-two-prose-rows-went-stale-in-the-two-commits-that-followed-it.md` | `docs/` + `README*.md` moved 129 567 → 137 699 and `skills/` 220 439 → 221 336 after step 14 read them; the docs reduction is 15 402 bytes, not 23 534 |

---

## 7. What this pass did not touch, and why

- **The Circle record `_t_circle.md`.** Its Turn log's Turn-4 entry still reads "in progress" and the
  Turn is over; there is no Turn-5 entry because there was no Turn 5. `rules/circle-records.md` is
  emitted to `orchestrator`, `playmaker` and `shaper` and not to the reconciler, and the record's
  state and Turn log are the orchestrator's Phase-4 write. Reported, not edited. Note the coupling:
  its `**Active spec/plan:**` field at `:7` now names the plan's old `_o_` path, which this pass's
  rename dangles, and Phase 4 is where that is corrected.
- **`agentstate.yaml`.** Live session state, the orchestrator's. A defect was filed instead.
- **`shared/history/260814-2306-orchestrator-session.md`, apart from `## Coherence`.** The
  append-only authorization covers that section and nothing else, so the missing Turn-4 section, the
  `**Status:** In progress` line and the duplicate stub were all left as found. Two are the
  orchestrator's Phase-3 and Phase-4 writes; the third is filed.
- **The 39-of-91 header-versus-marker mismatch.** Standing, with its own open record
  (`shared/issues/260812-1232_o_thirty-four-of-seventy-four-decision-records-carry-a-status-header-that-contradicts-their-filename-marker.md`).
  Its title records 34 of 74 at filing; the figure carried into this session was 39 of 90, and the
  corpus is 91 records at HEAD. The marker is the authority, and the pass did not spend itself here.
  All three of this Circle's `_i_` decisions are instances: each header reads `answered` while the
  marker reads implemented.

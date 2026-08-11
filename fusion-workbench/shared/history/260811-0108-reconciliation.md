# Reconciliation — session `260810-1646`, final pass

**Date:** 260811-0108
**Domain:** code
**Range verified:** `5ef92eb..e2a34f0` (18 commits)
**Active Circle:** none — everything resolved to `shared/`
**Verified at HEAD:** `e2a34f0`, working tree as found

---

## What was reviewed

| Store | Reviewed | Updated |
|---|---|---|
| `shared/issues/` | 188 records (52 open, 136 closed) | 2 closed, 3 filed, 3 annotated |
| `shared/decisions/` | 28 records | 2 annotated, 0 markers moved |
| `shared/planning/` | 6 plans | 0 — all accurate |
| `shared/reviews/` | 2 in range, 12 total | 2 annotated |
| `fusion-workbench/tasklist.md` | 45 queued + 2 close-without-work | not written — `taskplanner`'s alone |
| `circles/*/` | 16 open issues, 1 open decision | not in scope this pass |

Suite run as ground truth: `npm test` from `hooks/` — **exit 0, 41 files, 1142 tests**, matching the
Turn-3 claim in the session history exactly.

---

## 1. The 26 closures hold

Every record that moved to `_c_` in this range was checked against the working tree rather than
against its own `Resolved:` note. Several notes assert measurements taken in scratch copies that no
longer exist; those are claims about shipped files, and the shipped files were read.

**All 26 hold.** Spot-checks that could falsify, and did not:

- `bin/monitor:1256-1270` — platform dispatch (`open` / `xdg-open`), `command -v` guard,
  `sleep 0.5 2>/dev/null || sleep 1 || true`, `BROWSER_GAP` as one report site with the reason as
  data, `|| true` on the `echo`. Closes `260810-1558`, `260810-1918_c_sleep-0-5…`,
  `260810-1918_c_…launcher-goes-silent…`.
- `agents/orchestrator.md:425` — `git commit -F` inside the `with` wrapper; `:419-422` — the staging
  rule stated as a shape ("every path passed to `git add` is one you wrote out yourself"), with
  `f38f37d` named as the measured case; `:420` — which directory the pathspecs are relative to.
  Closes four `260810-1918_c_*` and `260810-2110_c_moving-git-add…`.
- `skills/commit/SKILL.md:96-100` — heredoc at column 0 with `<<'FUSION_MSG_EOF'` and the reason
  written above it. Closes two records.
- `agents/bugfixer.md:33,39,142` — all three now say Step 3b.
- `hooks/lib/domain-cascade.ts:839` — `REACH` is data. `fileSet` carries `rules/*.md` (13 rule files
  on disk, matching the claim), `holes[0]` carries the bare-word probe with both cost numbers,
  `excluded` carries `docs/*.md` (fires), `CLAUDE.md` (clean, named as uncovered rather than
  exempt), `README-hooks.md` (clean). `domain-cascade.test.ts:823-947` runs every probe and compares
  `README-hooks.md` byte-for-byte. Closes three `260810-2110_c_*` and `260810-1918_c_…second-domain-cascade…`.
- `domain-cascade.test.ts:364-369` — the helper's exit is branched on, `0` → `git-ls-files`,
  `2` → `counted_by === "none"`, both asserting `code`. Closes `260810-1918_c_…live-cascade-test…`.
- `state-drift-detection-lint.test.ts:210-236` — 27 `SKIP_LICENCES` entries, each with its own
  witness `example`; `:712` rejects an empty `Drift when` cell by name. Closes two records.
- `reference-resolution-lint.test.ts:260-267` — `ROOT_VARS` carries `FUSION_SRC: true` and the
  `STASH_DIR` shadow entry; `:720-726` resolves and dangles a `$FUSION_SRC` path; `:773` is the
  falsifier that keeps every non-plugin entry load-bearing. Closes two records.
- `skills/setup/SKILL.md:15,263` and `skills/next/SKILL.md:16,124` — the `$FUSION_SRC` branch, the
  `UNRESOLVED` print, and the `queue-check` presence grep naming the copy in use.

### Three drift items inside otherwise-correct closures

None reopens a record. Each is annotated on the record itself.

1. **Stale line anchors, same session.** `260810-2029_c_*` and `260810-2110_c_…seven-citations…`
   both cite `skills/setup/SKILL.md:220,238,239,254,260` / `skills/next/SKILL.md:115,121,185`. At
   HEAD those are `setup:222,240,241,256,262` / `next:117,122,187` — every anchor moved two lines
   when `c714d8c` landed, four commits after the measurement. **The count of eight is correct**; only
   the anchors are wrong. Same-session instance of open record `260808-0030`.
2. **A closed record whose last words say the work is not done.**
   `260810-1918_c_the-citation-rooting-reached-two-of-three-skills…` has its Turn-3 resolution note
   appended *above* the Turn-2 note's closing paragraph, so the file ends on
   "**Half 2 (not done).**" Half 2 is done — verified at `skills/setup/SKILL.md:23` and
   `skills/next/SKILL.md:24`. The stale paragraph also prescribes `$FUSION_PLUGIN_ROOT` where Turn 3
   deliberately wrote `$FUSION_SRC`, with its reason stated. Preserved, dated by annotation.
3. **A decision note overtaken four commits later.** `260810-1822_i_`'s Answered note says the two
   skills "reach it through `$FUSION_PLUGIN_ROOT`". `63deec1` moved both to `$FUSION_SRC`. The
   decision itself (option 1, leave the procedure in the prompt) is unaffected and
   `Implemented: 89b13f1` is accurate.

---

## 2. Nothing was lost in the record churn — but two artefacts never entered git

**The record store is intact.** All 40 record slugs touched anywhere in the range exist exactly once
at HEAD, none missing, none duplicated, none untracked. Checked by extracting every
`(stamp, slug)` pair from `git log --name-status -M 5ef92eb..HEAD` over both stores and resolving each
against the working tree with `find`.

- The `f38f37d` repair holds: `260810-0501`, `260810-0502`, `260810-0503` are all present as `_c_`.
- The seven-record mis-rename and its revert left no trace: the twelve records in flight at that
  moment are each present once, and the Turn-2 review independently confirmed byte-prefix identity.
- The three body-only modifications to open records (`260810-1135`, `260810-2025`, `260810-1820`)
  are pure insertions — 22, 60 and 74 lines, no deletions.

**Two artefacts are outside git**, found independently and filed as
`260811-0114_o_the-queue-rebuild-and-its-history-file-never-entered-a-commit…`:

- `fusion-workbench/tasklist.md` — the **17:23 rebuild against `5ef92eb`** is uncommitted. The last
  commit touching the file is `8b2a206`, the v7.2.0 release *before* the session, whose copy is the
  14:34 / `430d73a` build. 1409 insertions of difference, unstaged across eighteen commits.
- `fusion-workbench/shared/history/260810-1723-tasklist-update.md` — untracked.

Neither is gitignored; `rules/fusion-workbench-conventions.md` puts `tasklist.md` in the **records**
group a tracked workbench tracks. A `git checkout -- fusion-workbench/` would have silently restored
the older queue.

The mechanism is worth naming: Turn 1's over-staging defect (`git add -u` over a directory) was fixed
with a shape rule — every path named in full — which makes over-staging impossible and under-staging
invisible. The queue rebuild ran forty-three minutes before the range's first commit, so no task's
staging list had a reason to name it.

A third, smaller item in the same record: `fusion-workbench/.commit-msg-tmp` holds `d169b0d`'s commit
message. Step 3b prescribes `/tmp/fusion-commit-msg-<task-id>.txt`; `grep -rn commit-msg-tmp` over
`agents/ skills/ bin/ hooks/` returns nothing, so the path was improvised. It is a root-anchored file
in a tree that calls its root-anchored enumeration exhaustive.

### Two state-file inconsistencies

Reported, not corrected — `agentstate.yaml` is session state, not a tracking file.

- `session.directive_revisions_this_session: 0`, while the session history records the Directive as
  "revised once mid-session, after the net-negative circuit breaker". This is the bookkeeping-drift
  class the session hit three times by its own account (open record `260801-2038`, queued task 2).
- `current_task.status: "running"` for `P:gates-narrower-than-their-claims`, while all three Turn-3
  entries in the same file's `work_queue` read `done`.

---

## 3. The two decisions

**`260810-1822` — `_i_` confirmed.** `agents/orchestrator.md:632` carries `#### Reading a queue`; the
presence checks are live at `skills/setup/SKILL.md:263` (which also reports the healthy case) and
`skills/next/SKILL.md:124`, each naming the resolved copy. Option 1 required no further change, so
answer and realisation being one commit is correct. Terminal; not reopened.

**`260810-2032` — `_a_`, and correctly still `_a_`.** The sequencing constraint holds on disk:
`shared/issues/260801-2038_o_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` carries
`_o_` and is queued as task 2. No baseline pin exists in `state-drift-detection-lint.test.ts`; the
file's header at `:92-104` names the pin as the answer and records the sequencing as the reason it
has not landed. The blacklist that shipped instead is present and witnessed (27 entries). This is
exactly what `_a_` means, and `_a_` → `_i_` is unavailable until `260801-2038` lands.

---

## 4. The work queue

Not written — `tasklist.md` is `taskplanner`'s alone. Accuracy measured by resolving each task's
`**Source:**` record against its marker on disk.

**43 of 45 queued entries agree with the tree.** Three carry `[x] done` and their records are `_c_`
(tasks 3, 6, 7). Forty carry `[ ] open` and their records are `_o_`.

**Two are stale — closed on disk, still `[ ] open` in the queue:**

- **Task 1** "Take the shell out of the commit-message path" — `260810-1535_c_` (closed `a7d02da`).
- **Task 5** "Give the two skills' cross-file citation a root they can actually resolve" —
  `260810-0501_c_` (closed `89b13f1`).

**Coverage.** 42 of the 53 currently-open shared records are named in the queue (40 open queued
entries plus the two `Close without work` items, now closed by this pass). **Ten open records are not
in the queue** — every one of them filed after 17:23, so this is build-age, not a queue defect:
`260810-1820`, `260810-2024`, `260810-2025`, `260810-2027`, `260810-2030`, three `260810-2110_o_*`,
`260810-2149`, `260810-2200`. Plus the three filed by this pass. The queue's own header is honest
about its scope and its build HEAD.

**The two `Close without work` entries are now closed**, which the queue explicitly left to the
reconciler. Both re-verified rather than carried:

- `260717-0031` → `_c_`. All four scope questions settled in `path-literal-lint.test.ts` — item 1 at
  `:186` with the decision in the comment beside it, item 2 at `:39-45`, item 3 in the path-shape
  matcher, item 4 dissolved and replaced by the live key-subset check.
- `260717-0115` → `_c_`. `ls -d fusion-workbench/*/` returns `archive/ circles/ shared/ stilwerk/` —
  no pre-v4 type folder remains — and `skills/setup/SKILL.md:41` refuses a pre-v4 workbench before
  the `mkdir`, citing this record at `:45` as the reason the ordering matters.

---

## 5. Open counts across every `$SCAN_*` path

| | `shared/` | `circles/*/` | total |
|---|---|---|---|
| Defect records open (`_o_`) | 53 | 16 | **69** |
| Defect records in progress (`_p_`) | 0 | 0 | **0** |
| Defect records closed (`_c_`) | 138 | 177 | 315 |
| Decisions open (`_o_`) | 8 | 1 | **9** |
| Decisions answered (`_a_`) | 5 | 1 | **6** |
| Decisions implemented (`_i_`) | 15 | 32 | 47 |
| Decisions deferred (`_d_`) | 0 | 1 | 1 |
| Plans open (`_o_`) | 1 | — | **1** |

Active Grounding (`_o_` + `_a_` decisions) across all paths: **15**.

Shared open defect records moved 47 → 53 over the session and this pass: 26 closed, 31 filed by the
session, 2 closed and 3 filed here. Of the 53, **22 name `coderev` as their filer**.

The one open plan is `shared/planning/260801-1122_o_spec-normative-consolidation.md`, whose own header
reads "Final. All twelve decisions are answered … Nothing is pending on the user" — a spec awaiting
execution, not an unfinished document. Marker left as `_o_`, correctly.

---

## New records filed by this pass

All in `shared/issues/`:

1. `260811-0109_o_the-source-root-rooting-reached-two-skills-and-two-more-still-cite-the-install-copy.md`
   — `63deec1` rooted setup and next through `$FUSION_SRC`; `skills/cleanup/SKILL.md` (six citations)
   and `skills/help/SKILL.md` (five) still cite the install. In this repository the helpers read the
   work tree, so those two hand a reader two versions of one file. The sharpest case is
   `skills/cleanup/SKILL.md:125`, which routes the domain decision into the installed
   `agents/orchestrator.md`. Raises the call-site count in `260810-2030` from two to four.
2. `260811-0109_o_the-turn-1-reviews-totals-say-ten-findings-and-it-carries-eleven.md` — the Turn-1
   review's table sums to 10 and says "Ten findings, ten records filed"; eleven were filed and
   eleven labelled findings exist (Low is 6, not 5), and `M3` names two of them. Reproduction of
   queued task 37, one day later, in the next review.
3. `260811-0114_o_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md`
   — section 2 above.

## Misfiled — should be a decision

None found. Every open record in `shared/issues/` this pass touched resolves to "go fix it", not to
"decide and record".

## Records annotated, markers unchanged

`260810-1918_c_the-citation-rooting-reached-two-of-three-skills…`, `260810-2029_c_…seven-citations…`,
`260810-1822_i_…queue-ground-procedure…`, `260810-2032_a_…drift-checks-four-sentences…`, and both
review files in range.

---

**Reconciler note on its own method.** The first pass at the record-survival check in section 2
returned 40 false "MISSING" results, because a two-store `ls` glob under `zsh` aborts the whole
expansion when one branch matches nothing. That is the `nomatch` trap
`rules/fusion-workbench-conventions.md` `## Marker globs` documents, met while verifying a session
about gates that overstate their reach. The check was rewritten with `find` and re-run before any
result here was believed.

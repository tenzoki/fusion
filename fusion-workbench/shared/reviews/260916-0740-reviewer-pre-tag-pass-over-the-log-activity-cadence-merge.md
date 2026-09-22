# Pre-tag review — the activity log stops being its own command (11.4.0)

**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Reviewed-range:** `cec0f338..9d5b1e80`
**Not-opened:** `hooks/dist/lib/citation-corpus.d.ts`, `hooks/dist/lib/citation-corpus.js`, `hooks/dist/lib/work-graph.d.ts`, `hooks/dist/lib/work-graph.js`, `hooks/dist/order.d.ts`, `hooks/dist/order.js`, `hooks/lib/__tests__/config.test.ts`, `hooks/lib/__tests__/work-graph.test.ts`
**Review domain:** code

## Summary

One feature commit, three bookkeeping commits. The merge is a genuine redesign and the redesign is
sound: one scan feeds one dated record and the digest reads that record back, which is a better
shape than the two passes it replaces and is what made the byte ceiling approachable at all. The
suite is green (55 files, 929 tests), the reference pin's final figure is derived rather than
asserted, the frozen-store exclusions survived verbatim, the legacy-name adoption is stated under
exactly the conditions the rule sets for the other three personal logs, and no unsuffixed
`activity-log.md` survives anywhere in the shipped tree.

What the pressure cost is smaller than feared and real. Seven findings, none critical. Three are
things the rewrite silently dropped or left undefined; three are statements in shipped text that do
not survive being checked; one is a worked example that now errors. **The range is taggable.**

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 5 |
| Low | 2 |

All seven filed as issues, `260916-0731` through `260916-0737`.

## What the old procedure did that the new one no longer does

Read against `git show v11.3.0:skills/log-activity/SKILL.md` and `git show v11.3.0:skills/cadence/SKILL.md`, clause by clause. Three things went silently.

1. **The empty-`$CO` answer** (`260916-0732_*_…`, Medium). The retired body said the log is
   `activity-log.md` when `$CO` is empty. The merged body says nothing about the case, and
   `rules/fusion-workbench-conventions.md:292` now asserts "all four logs are keyed or not
   written", which `bin/fusion-identity`'s exit 3 and exit 5 — both non-halting by that helper's own
   header, and neither implying an absent workbench — falsify. Result: `activity-log-.md` and
   `cadence-.md`, unreported.
2. **`## Total commits` on the create path** (`260916-0733_*_…`, Medium). The old body mandated the
   section on create and on refresh. The merged create template stops at `## Daily Log` and the only
   mandate sits under **On refresh**, while step 10 still owes the user the commit total. The create
   path is the first run in any new project.
3. **The `**Covers:**` writer list** (`260916-0735_*_…`, Medium) — see below; it is named in the
   record trail as a deliberate drop but for a reason that is not the operative one.

Two further losses are named in the plan or the commit message and are therefore not findings: the
standalone command, and the no-workbench mode. One more is worth stating without filing: the
digest's topic labelling used to read each log unit's body (old cadence step 5, *"Read each log unit
and identify the one or few topics it is about"*), and now rests on filenames, commit subjects and
titles, because the merged body's only view of the tree is `ls -l` output. The activity log was
always filename-derived, so this is a narrowing of cadence's half rather than a new defect, and the
one-scan design makes it unavoidable — but no record names it.

## The three deletions that rest on a claim about what is unreachable

Each verified independently.

- **"No agent holds the history read key"** (`skills/archive/SKILL.md:122`, tier 3). **True.**
  `grep -l SCAN_HISTORY agents/*.md` returns nothing, and `bin/fusion-paths <agent>` emits no
  HISTORY key for any of the eleven. The removed clause about the orchestrator was false text and
  its removal is a correction. No finding.
- **"The guard no longer writes block or halt events"** (`skills/archive/SKILL.md:252`). **True as
  stated and wrong as a justification** (`260916-0737_*_…`, Low). The clause was about rows already
  in the file, and `hooks/lib/events.ts:46-51` argues explicitly that those rows exist in real logs
  and are not to be tidied away, while `:108-114` still carries the very sentence that was cut. The
  guard not writing them is why they are the oldest lines, which is the clause's point. This is the
  one the author flagged as least certain, and the flag was right.
- **"The session-history store is closed, so `**Covers:**` is empty by construction"**
  (`260916-0735_*_…`, Medium). **False at HEAD and not the operative reason.** Five history files
  carry `260909`, and a run today has a window of `[2026-09-09, 2026-09-16]`. More importantly the
  merged body never opens a history file's `**Filed by:**` header at all, so the line is
  unrecoverable whatever the window holds. Three shipped surfaces state the frozen-store reason:
  `README.md:28`, `skills/help/SKILL.md` `### 4. Update`, `docs/upgrading-to-v11-4.md`.

## The head-room raise

Checked against `hooks/lib/__tests__/helpers/growth-bound.ts` `## Re-baselining`, which requires of
a raise that "the entry names the raise WITH THE FIGURE BEFORE AND AFTER and DATES THE REDUCTION".

- **Figures before and after: present.** `README-hooks.md:547` names 21 911 -> 24 911, +3 000.
- **Reduction dated: yes**, at the section level — the table's `SKILL_HEAD_ROOM` row carries
  +4 911 = 866 + 1 045 + 3 000 and the section heading was moved to `#### The head-room raises, and
  the reduction read on 2026-10-10`. The third entry does not repeat the second's explicit "joins
  the 2026-10-10 reading" sentence; the table covers it.
- **No baseline map entry moved with it: confirmed.** The only change to `SKILL_BASELINE` is the
  `log-activity/SKILL.md` line, dropped rather than zeroed, with a comment in the shape of the
  `direct/SKILL.md` precedent five lines above. That drop is compliance with the stale-entry
  assertion, not a re-baselining. `AGENT_HEAD_ROOM` and `TEST_LINE_HEAD_ROOM` are untouched.
- **The raise is the amount that was ruled**, on the account available: the body came in 3 101 over,
  a dead-text pass banked 890, 2 211 remained, and 3 000 was taken. There is no decision record —
  `README-hooks.md:547` says so in its own words, *"No record was filed for that ruling, so this
  entry is the whole of its account"* — where the two 2026-09-11 raises each cite
  `260910-2256_*_may-the-growth-bounds-be-raised-for-the-duration-of-the-container-restoration.md`.
  Stated, not filed: the ruling is the user's and was taken in session, so this is an observation
  about the record trail rather than a defect to fix.
- **But the entry's own numbers are wrong** (`260916-0734_*_…`, Medium). It states the surface at
  212 890 with 789 bytes of margin and a restore distance of 4 122; the committed tree reads
  212 597, 1 082 and 3 829, and the golden agrees. The commit message got it right. Since this
  entry *is* the detection mechanism for the raise and the 2026-10-10 reduction reads these
  figures back, the error is not cosmetic.

## Where the plan's stopping section does not match the tree

Read clause by clause against `260915-2309_*_merge-log-activity-into-cadence.md` `## Where this
work stops`.

| Clause | Holds? |
|---|---|
| Merged body writes both files in one invocation; `skills/log-activity/` gone | yes |
| `npm test` green | yes — 55 files, 929 tests |
| cadence body at 19 427 bytes or less, figure stated in the commit message | **no.** 21 901 (`stat -f%z`), and the commit message states the ceiling and the two parent sizes but never the finished figure. `README-hooks.md:547` states it. |
| No head-room constant edited; only the dropped baseline entry moved | **no** on the first half, by the user's explicit ruling; yes on the second |
| `reference-resolution-lint` pin carries a re-approval note in the file's own form | yes |
| Every `/fusion:log-activity` token gone from the shipped surfaces | yes — the only survivor is inside the pin's own attribution comment, which is prose about the move |
| `docs/upgrading-to-v9.md` byte-identical | yes |
| Decision at `_i_` with its commit named; `260908-1612_*_log-activity-calls-itself-cleanups-step-6-and-it-is-step-5.md` at `_c_` | yes, both in the working tree |
| Precondition: `docs/upgrading-to-v11-4.md` exists and the help update topic names this release | yes — the topic carries 11.4.0, 11.3.0, 11.2.0 and drops the oldest, labels moved |
| Precondition: `260915-2145_*_…` answered or explicitly carried, visibly | yes — carried, in the commit message, with the narrow reading named |

Two clauses the ruling superseded are still written as absolutes in a plan marked Complete. The
correction lives in `README-hooks.md`, the commit message and the decision's `Implemented:` line, so
nothing is lost — but a reader who consults the plan's stopping section alone is told the opposite
of what shipped. Worth a sentence in the plan rather than an issue.

## Cross-cutting: what the gates cannot see

Three of the seven findings are the same shape, and it is the shape this project already has a
record of. **A fact stated without a `/fusion:` token is a fact no gate reads.** Eleven
`/fusion:log-activity` tokens were removed and the phantom-skill gate is green — while:

- `skills/cleanup/SKILL.md:2` (the frontmatter `description`, the string a user sees in the skill
  listing) and `docs/fusion-intro.md:63` both still enumerate the activity log among the commands
  the pipeline became (`260916-0731_*_…`, Medium). Both files were in the plan's step-6 file list;
  the `/fusion:`-bearing lines in each were corrected and the token-free ones were not.
- `rules/workbench-path-resolution.md:24` teaches `fusion-paths log-activity` as a worked example.
  Verified: exit 2, "unknown name" (`260916-0736_*_…`, Low). Bare word, so no lint resolves it;
  emitted to no agent, so no dispatch-path measurement touches it.

`CLAUDE.md` names this hole three times already, at the `templates/`, `docs/` and `skills/` layout
rows, each after an inventory went stale invisibly. This is the same hole in a fourth shape, and
the sample says a token-based gate reliably misses the prose restatement beside every token it
catches.

## Two measurements in the commit message

Reported, not filed — a commit message is immutable and the tree is right.

- *"Net −69 bytes, so every dispatch path got them back."* The conventions moved 64 886 -> 64 812,
  which is **−74**; `CLAUDE.md` moved 62 392 -> 62 505, which is **+113**. Every dispatch path is
  **+39**, not −69. The author's own next line is consistent with +39 (the plan measured the tightest
  path at 24 684 of margin; the message reports 24 645 after), so the arithmetic was done correctly
  somewhere and this sentence was not.
- The margin figures in the same closing line — skills 1 082 B — are correct, and are what
  `README-hooks.md` should have carried.

## What checked out clean

Stated because a pre-tag pass that reports only faults tells the reader nothing about coverage.

- **The frozen-store exclusion.** All four paths survive verbatim at `skills/cadence/SKILL.md:86`,
  with the do-not-drop warning carried into `:94`. `rules/fusion-workbench-conventions.md:66`
  renames the consumer onto the merged body, and `hooks/lib/citation-corpus.ts:161` re-points its
  `FROZEN_PREFIXES` precedent to `skills/cadence/SKILL.md` `### 3. Scan git and the workbench tree
  — once` by anchor rather than by line, which is the form the conventions mandate. The anchor
  resolves exactly.
- **The legacy-name adoption.** `skills/cadence/SKILL.md:42` sets the same four conditions
  `rules/fusion-workbench-conventions.md:294` sets for the other three personal logs — this
  checkout's `$USER` as suffix, nothing at the new name, report the rename, merge nothing and delete
  nothing — not a looser version.
- **The no-workbench path.** `grep` over the shipped tree for an unsuffixed `activity-log.md`
  returns nothing, and the conventions clause went with it.
- **The reference pin.** 1 541 -> 1 533 -> 1 538, each move measured by swapping each edited file
  back to HEAD in place, and the final figure derived as 1 533 +1 +1 −2 +5 with the interaction
  between two of the swaps named. Real, and attributed to named tokens.
- **The resolver key set.** `bin/fusion-paths cadence` emits `WORKBENCH`, `OUT_MEMO`,
  `SCAN_HISTORY` — exactly the set the merged prose names, re-derived by the per-name loop in
  `fusion-paths.test.ts` now that the dedicated assertion is gone.
- **`hooks/dist/`** is the compilation of the committed source: `committed-dist.test.ts` passes.
- **`bin/fusion-citation-sweep --dry-run`** was run before this file was written:
  `files=0 rewrites=0 mode=dry-run`.

## Recommended sequencing

**Before the tag, if anything:** `260916-0731_*_…` — two one-line re-wordings in surfaces this very
release exists to correct, one of them the string a user reads in the skill picker. It is the
cheapest of the seven and the most visible.

**Not blocking:** everything else. `260916-0734_*_…` should land before 2026-10-10, when the
reduction reads those figures. `260916-0732_*_…` and `260916-0733_*_…` are procedural gaps that bite
a fresh consuming project rather than this one. `260916-0735_*_…` is a documentation correction with
a design observation inside it. `260916-0736_*_…` and `260916-0737_*_…` are cleanup.

**Would I tag this range?** Yes. Nothing here breaks a user's project, nothing fails a gate, and
the merge is the better design it claims to be. No finding is a blocker.

---
**Reconciliation 260921-2230 (reconciler, domain `code`, HEAD `cb8776f3`) — the seven defects this pass filed are all closed.** The seven, `260916-0731_*_two-shipped-surfaces-still-list-the-activity-log-as-a-command-of-its-own.md`, `260916-0732_*_the-empty-checkout-case-lost-its-defined-behaviour-when-the-unsuffixed-log-name-went.md`, `260916-0733_*_the-merged-cadence-body-never-writes-total-commits-on-a-create-yet-step-10-reports-it.md`, `260916-0734_*_the-head-room-raise-log-states-a-surface-total-and-two-margins-that-no-committed-tree-holds.md`, `260916-0735_*_three-shipped-surfaces-give-the-covers-line-a-reason-that-is-not-the-one-that-removed-it.md`, `260916-0736_*_the-resolver-rule-still-teaches-a-consumer-name-that-exits-2.md`, `260916-0737_*_the-event-log-guardrail-lost-its-reason-in-one-of-its-two-homes-while-the-other-still-argues-it.md`, each carry `_c_` and a `Resolved:` note, all closed at `011111f4` (the 11.4.0 release, "the seven findings cleared before its tag"). The plan it reviewed, `260915-2309_*_merge-log-activity-into-cadence.md`, carries `_c_`. Findings themselves are not rewritten.

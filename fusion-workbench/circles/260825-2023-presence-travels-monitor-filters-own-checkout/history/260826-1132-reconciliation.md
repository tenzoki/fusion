# Reconciliation — C4, presence travels and the monitor reads its own checkout

**Date:** 2026-08-26
**Agent:** reconciler
**Domain:** code
**Circle:** `260825-2023-presence-travels-monitor-filters-own-checkout`
**Range:** `8119fc2..7774d56` (session anchor to HEAD); the Circle's own first commit is `73ca11c`
**Tree state:** clean apart from `fusion-workbench/orchestrator-events.jsonl`, which is in flight all
session
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

## What was reviewed

| Store | Read | Updated |
|---|---|---|
| Plans (Circle + shared) | 2 | 1 (`## Reconciliation Log` appended to the C4 plan) |
| Defects (Circle + shared) | 38 | 3 (one `Revised by:`, two `Also seen:`-class notes), 2 filed new |
| Decisions (Circle + shared) | 25 active | 1 (`_a_` → `_i_`) |
| Reviews (Circle) | 3 | 3 (disposition annotations) |
| Histories (Circle + shared) | skimmed | 1 (`## Coherence` appended to the session history) |

## Verdict

`review-needed`. The Directive is met in all four of its clauses and every acceptance criterion that
can be discharged is discharged. What is flagged is that three counts about this Circle's own
mechanism are wrong at HEAD, two of them in shipped text, in a Circle whose declared recurring fault
is exactly that. The three-edge reading is appended to
`260825-2123-orchestrator-session.md`
`## Coherence`.

## The Directive, clause by clause, against the tree

1. **Presence travels.** `bin/fusion-events presence` exists and runs (`window_days=7 scope=pulled
   other_people=0 other_checkouts=0`, exit 0 from the work tree). It is called at
   `skills/setup/SKILL.md:150-156` (Step 0c) and cited into the `/fusion:next` briefing at
   `skills/next/SKILL.md:117`. Met.
2. **`bin/monitor` reads the merged log as this checkout's session alone.** `_read_checkout_id` and
   `_read_events` at `bin/monitor:1230-1310`: parse every line, drop the lines whose `checkout` is
   present and differs, sort on the raw `ts`, then take the last `MAX_EVENTS`. Met.
3. **The Turn count has one definition.** Five sites read `bin/fusion-events turns` and none derives
   the figure: `agents/orchestrator.md:101`, `:558`, `:1122`, `skills/setup/SKILL.md:388`,
   `agents/reconciler.md:21`. `./bin/fusion-events turns` returns `turns=3 scope=checkout`, which is
   the session's real Turn count. Met.
4. **Nothing new tracked.** `git ls-files fusion-workbench | awk -F/ 'NF==2'` returns the same three
   entries at `8119fc2` and at HEAD: `.asset-provenance`, `.fusion-setup`,
   `orchestrator-events.jsonl`. Met.

## Key findings

**Three wrong counts stand at HEAD, and this pass found the third and fourth of the Circle's series.**
The Circle already met three: "all three" emit templates when there were four, criterion 5's "four
sites" when there were five, criterion 6's "three records" when the plan referred six. Each was
caught by a review or a later pass and none by a gate. Two more stand, plus one in a tracking record:

1. `rules/workbench-tracking.md` — "Three readers apply that scoping"; four do. The fourth is the
   Phase-4 session-flow diagram (`agents/orchestrator.md:915`, `:1376`), which plan step 8 of this
   same Circle converted, while plan step 9 instructed the executor to name three. Filed as
   `260826-1127_*_the-repairs-authoring-home-says-three-readers-scope-by-checkout-and-this-circle-built-a-fourth.md`.
   This is the worst placement available: the file is the Circle's designated single authoring home
   for the repair.
2. Five shipped sites — `CLAUDE.md:43`, `bin/fusion-events:202`, `hooks/lib/events-query.ts:374` and
   the two compiled copies — say `turns` replaced "four copies of a whole-file `grep -c turn_start`".
   At `8119fc2` the tree held **two** (`agents/orchestrator.md:99`, `skills/setup/SKILL.md:377`); on
   the looser site reading the number is now five. Wrong on both readings. Filed as
   `260826-1127_*_five-shipped-sites-say-the-turn-count-helper-replaced-four-whole-file-grep-copies-and-there-were-two.md`.
3. Acceptance criterion 6 says "the plan refers **six** by path"; it refers seven. `287f7ff` added the
   seventh to criterion 5 in the same edit that corrected criterion 6 from three to six, so the number
   was true of the file the commit read and false of the file it wrote. Recorded in the plan's
   `## Reconciliation Log` rather than corrected in the clause, so the pattern stays visible.

**Criterion 6 has one substantive residual.** Six of the seven referred defect records satisfy it.
`260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`
carries only `Resolved: referred (C4)`, written before this Circle opened, and C4 did discharge its
direction (`hooks/lib/events-query.ts:374-434`, `97407df`: the window is a timestamp inside one
checkout's own lines, not a position in the merged file). Its sibling `260823-1302_*_…` got such a
note appended here; this one did not. It lives in a closed Circle's store, outside this pass's scan
set, so it is named rather than edited.

**Criterion 7 is vacuously satisfied and is the fourth instance of a known defect.** Its antecedent —
the session-identifier measurement coming back negative — never fires: analysis
`260825-2214-can-a-hook-obtain-the-session-identifier.md` answers yes to (a), yes to (b) on plain
stdout, and yes to (c), so both branches of step 11 were built and nothing was withheld. One
sub-result was negative, `hookSpecificOutput.systemMessage` not reaching the model, and it shaped the
answer rather than withholding it: `session-id.ts` is a fourth SessionStart command because one
process writes one stdout. Appended as a fourth sighting on
`260825-1250_*_a-conditional-acceptance-criterion-has-no-notation-for-a-false-antecedent-so-three-passes-re-derived-the-same-explanation.md`.

**Review coverage over the Circle's range holds.** `bin/fusion-review-coverage --since 73ca11c` reads
`commits=17 reviews=3 uncovered=4`. All four uncovered commits (`b11bec6`, `8fb42ce`, `287f7ff`,
`7774d56`) were checked by file list, not by subject: each touches only `fusion-workbench/` records,
three being review filings and one this plan's closure. Every code-touching commit in the range falls
inside a review's declared range.

**Criterion 8 measured directly.** `cd hooks && npm test` exits 0 (44 files, 776 tests).
`git diff 73ca11c..HEAD` over `hooks/lib/__tests__/surface-growth-bound.test.ts`,
`rules-emission-golden.test.ts` and `helpers/growth-bound.ts` is empty, so no growth-bound baseline
map moved. The hook-test surface stands at 20 349 lines of a 20 375 budget, 26 below where it started.

**The eleven-open figure is thirteen.** The closure brief counts eleven open defect records in the
Circle; thirteen carried `_o_` before this pass and fifteen do after it. The two not in the brief's
three buckets are
`260826-0805_*_the-resumption-measurement-answers-for-claude-codes-resume-and-the-plan-asked-about-fusions.md`
(Medium) and
`260826-0906_*_the-event-query-program-dies-with-an-unhandled-epipe-when-its-reader-closes-stdout-first.md`
(Low). Named because it is the same fault one more time, in the reading of the closure itself.

**None of the fifteen open records should have blocked closure.** The highest is
`260826-0906_*_the-events-query-entry-point-carries-every-turn-1-fix-and-is-exercised-by-nothing.md`
(High), and it is a coverage gap on a surface with no head-room, which is precisely the trade the user
priced at the decision gate. The two `260826-1127` records filed here are documentation counts with no
behavioural effect. Nothing open falsifies a Directive clause.

## Tracking updates made

- `260825-2140_*_c4-…md` — `## Reconciliation Log` appended. `**Status:** Complete` and the
  `_c_` marker confirmed correct against eleven verified steps; no marker moved.
- `260825-2140_*_where-do-c4s-hook-test-lines-come-from-…md` → `_i_`, with
  `Implemented: c649556 and 46de871`.
- `260826-0136_*_…three-emit-templates.md` — `Revised by: 6deeb33` appended, no rename.
- `260825-1250_*_a-conditional-acceptance-criterion-…md` — `Also seen: 260826-1127`
  appended, no rename.
- The three review files — one disposition annotation each, findings unaltered.

## New records filed

- `260826-1127_*_the-repairs-authoring-home-says-three-readers-scope-by-checkout-and-this-circle-built-a-fourth.md`
- `260826-1127_*_five-shipped-sites-say-the-turn-count-helper-replaced-four-whole-file-grep-copies-and-there-were-two.md`

## Nothing misfiled

No open defect in this Circle's store is a decision wearing a defect's marker. The two the closure
brief calls "awaiting a user direction call" (`260826-0154_*_…` and `260826-0158_*_…`) each name a
defect in the tree and offer directions without choosing one, which is a defect with an open fix
direction rather than a decision record's question.

## What no gate can see, stated rather than left to be found

Every count corrected in this Circle was found by a human reading, a code review, or a reconciliation
pass. Nothing in `npm test` reads a number in prose and compares it with the tree, and the two records
filed today are the fourth and fifth demonstrations of that in one Circle. The adjacent standing
record is
`260825-1456_*_three-shipped-surfaces-say-the-retired-configuration-key-set-is-three-and-the-loader-holds-four.md`,
which is the same fault in a different subject.

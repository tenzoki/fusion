# Coder — task Z-2, the three counts that were still wrong at HEAD

**Date:** 2026-08-26
**Agent:** coder
**Task:** Z-2, Turn 3, dispatched by the orchestrator before closure
**Circle:** `circles/260825-2023-presence-travels-monitor-filters-own-checkout`
**Status:** Complete

## What was asked

Three wrong counts about this Circle's own mechanism, found by the reconciliation pass at
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-1132-reconciliation.md`,
plus one substantive residual on acceptance criterion 6. The dispatch was explicit that no number in
it was to be taken on trust: each was to be measured and the measuring command reported.

## The four counts, each measured

**1. `rules/workbench-tracking.md:59` — three readers, and there are four.**

Measured by `grep -rn orchestrator-events rules agents skills hooks/lib bin CLAUDE.md README*.md docs`,
which names nineteen files that mention the log, then reading each for a scoping of lines by their own
`checkout` field. Exactly four apply it: `bin/fusion-events turns` (`hooks/lib/events-query.ts`
`countTurns`, through `isOurs`), `bin/monitor` `_read_events`, `bin/fusion-events presence`
(`otherParties`), and the post-session sequence diagram at `agents/orchestrator.md:915` with its rule
at `:1376`. Three drop foreign lines and one keeps them, so the asymmetry the paragraph draws is
unchanged and the paragraph was not restructured: one clause moved from "two of the three" to "three
of the four" and one rooted path joined the list of droppers.

Two readers were considered and excluded, and the exclusions are the part a later reader cannot
re-derive from the number. `skills/setup/SKILL.md` and `skills/next/SKILL.md` call the helper and
apply no scoping of their own, so they are readings *through* an applier. `agents/curator.md:111`
reads the log as corroborating evidence and applies no scoping at all — that is the second observation
in the record and it is **not** discharged here, because whether a corroborating-only read owes the
scoping is a question rather than a defect with a direction.

**2. Five shipped sites — "four copies of a whole-file `grep -c turn_start`" — wrong on both readings.**

Two quantities were conflated and the number belonged to neither, so both are now stated.

The literal count is **two**, measured by
`git grep -n 'grep -c.*turn_start' 8119fc2 -- agents/ skills/ bin/ hooks/ rules/ CLAUDE.md 'README*'`,
which returns `agents/orchestrator.md:99` and `skills/setup/SKILL.md:377`. The other hits `git grep`
finds at that revision are workbench records quoting the block; they ship with nothing.

The site count is **five**, and it is the same five on both sides of the change. At `8119fc2`: the two
literal blocks plus three prose derivations (`agents/orchestrator.md:547` Phase 2 step 3,
`agents/orchestrator.md:1111` the `progress.turn` row, `agents/reconciler.md:21`). At HEAD, measured by
`grep -rn 'fusion-events" turns\|fusion-events turns' agents skills bin rules CLAUDE.md README*.md`:
`agents/orchestrator.md:101`, `:558`, `:1122`, `skills/setup/SKILL.md:388`, `agents/reconciler.md:21`
— exactly what corrected acceptance criterion 5 names.

The record's own fix direction estimated *two* prose derivations, from what the plan's `## Current
State` enumerated; there are three, because the plan predates the Turn 2 review that found
`agents/reconciler.md`. The measured number is what was written. `agents/orchestrator.md:1052`'s
in-memory `turns_completed` is not a sixth: it counts completed Turns rather than the current one, and
the Turn 3 review checked that independently.

Written at all five sites, the authoritative header first: `bin/fusion-events`,
`hooks/lib/events-query.ts` `countTurns`, `CLAUDE.md`'s Layout row, and the two `hooks/dist/` copies by
`cd hooks && npm run build`. `grep -rn "four copies" hooks/dist bin CLAUDE.md rules agents skills
README*.md docs` now returns nothing.

**3. Acceptance criterion 6 — six, and the plan refers seven.**

Measured by extracting every defect-record path token from the plan and taking the distinct set:
`grep -no '[A-Za-z0-9_/.*-]*issues/[0-9-]*_[a-z*]_[a-z0-9-]*\.md' <plan> | sort -u`, then splitting on
the `## Reconciliation Log` heading at line 296. Above it, seven distinct records; the whole file holds
eleven, the extra four being the reconciliation pass's own findings appended after closure.

The seventh above the line is
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0906_*_a-fifth-turn-count-definition-site-still-reads-the-whole-file-and-names-no-implementation.md`,
named in criterion 5 and discharged in `6deeb33`. Five of the seven are discharged, two are not, which
is what the clause already said about its six plus one.

**The clause now carries the boundary the count is taken over**, and that is the only thing added
beyond the number. A bare "seven" is falsified by the next append to a document that is appended to
after closure — which is exactly how `287f7ff` falsified its own correction, adding the seventh to
criterion 5 in the same edit that moved criterion 6 from three to six. The clause says so.

**4. The residual: `260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-…`.**

Appended a `Resolved:` note citing `97407df`, beside the earlier `Resolved: referred (C4)` rather than
replacing it — the shape its sibling `260823-1302_*_…` already carries. The record lives in a closed
Circle's store and was not moved (Origin Rule). The note states which half of the record's own two-way
direction discharged it, verified against `hooks/lib/events-query.ts:392-434`: `countTurns` scopes by
checkout first, sorts by `ts`, finds the **first** `session_start` naming this history file among those
lines, and counts from that anchor's **stamp**. So the window is a timestamp inside one checkout's own
block and not a position in the merged file, which is the "window that does not depend on file order"
half; the record's caution against `260822-1136`'s last-`session_start` derivation was followed.

## The citation pin

It moved by exactly one path and one anchor, to `{paths: 1431, anchors: 197}`, and I re-approved it
myself: I was the only party editing, so the whole-wave objection that applied to earlier re-approvals
does not.

**The share was measured, not apportioned.** With `rules/workbench-tracking.md` alone reverted to HEAD
(`git show HEAD:rules/workbench-tracking.md > rules/workbench-tracking.md`, my copy kept in the
scratchpad and restored after) against the rest of the dirty tree, the gate resolves the committed
1430/196 exactly. So the entire move is that one file's, and every other file this task touched
contributes zero. The token is one counted twice: `agents/orchestrator.md`
`### 3. Post-Session Sequence Diagram`, a rooted heading, the same shape as the
`### 2. Structured Event Log` citation four paragraphs above it.

Two zero-contribution findings went into the re-approval comment because the next re-approver cannot
re-derive them from the number. `CLAUDE.md`'s Layout row and `bin/fusion-events`'s header were both
rewritten in this task and neither moved the gate — the rewrite added no path or heading token the
replaced sentence did not already carry. And `hooks/dist/` contributes nothing even though the
docstring it is generated from was rewritten: `hooks/**.ts` is scanned for class (c) record citations
only, and that docstring's one record citation was left untouched.

## Surfaces and baselines

**`rules/workbench-tracking.md` stands on no bounded surface, verified rather than assumed.** Running
`bin/fusion-rules` for each of the fifteen agents and grepping the output for `workbench-tracking`
returns zero every time, so it is outside the always-on set that `rules-emission-golden.test.ts`
bounds. `surface-growth-bound.test.ts`'s three surfaces are `agents/*.md`, `skills/*/SKILL.md` and
`hooks/lib/__tests__/**.ts`; `rules/` is in none of them, and its own comment at line 23 records that
`rules/` stopped being a bounded surface.

**No growth baseline moved.** `git diff 73ca11c..HEAD -- hooks/lib/__tests__/helpers/growth-bound.ts`
is empty, and `git diff --stat HEAD` over `growth-bound.ts`, `surface-growth-bound.test.ts` and
`rules-emission-golden.test.ts` is empty. The one bounded file this task touched,
`hooks/lib/__tests__/reference-resolution-lint.test.ts`, is measured in **lines** and stands at 990
before and after: the re-approval extended one line rather than adding one. The golden was not
regenerated and did not need to be — the suite is green with it as committed.

## The sixth pass

The dispatch asked for one more look, being the sixth pass over a theme where each of the previous five
found what the one before it missed.

**What was searched.** Every count word (`two` through `ten`, plus digits) within 110 characters of a
term from this Circle's mechanism (`checkout`, `Turn count`, `turn_start`, `session_start`, `event
log`, `orchestrator-events`, `emit template`, `emit site`, `fusion-events`, `fusion-identity`,
`presence`, `readers`), across `rules/`, `agents/`, `skills/`, `bin/`, `hooks/**.ts` outside the test
directory, `CLAUDE.md`, all three READMEs and `docs/`. 108 candidate lines, each read.

**What was checked and found correct**, each against the thing it counts rather than against another
sentence:

- Emit templates carrying `<ID>`: **four**, by `grep -rn '<ID>'` over `agents skills rules bin docs
  templates README*.md CLAUDE.md` — `agents/orchestrator.md:235` (`session_start` executable), `:953`
  (`session_end` prose), `:1322` (the generic template), `skills/setup/SKILL.md:483`. No live prose
  states a number; `agents/orchestrator.md:139` says "every emit template below" and counts nothing.
  The "all three" survives only inside the closed `260826-0136` record's `Resolved:` note, deliberately
  left unedited with its `Revised by:` correction beside it.
- SessionStart commands: **four** in `hooks/hooks.json`, and `CLAUDE.md:29` says four.
- `bin/fusion-identity` exit codes: **six** (0-5 in its header table), and both `CLAUDE.md:42` and
  `skills/setup/SKILL.md:352` say six.
- `party=` line fields: **five** (`renderParty`, `hooks/lib/events-query.ts:334`), and
  `bin/fusion-events:70` says five.
- The presence class split: **three** (`kind: "person" | "checkout" | "unknown"`), and `CLAUDE.md:43`
  says three-class.
- `bin/monitor`'s four false readings: **four**, and the comment numbers them 1 through 4 and the
  panel, ETA, average and mode are each present.
- `rules/workbench-tracking.md`'s own enumerations: four classes and four rows; three `check-attr`
  branches and three bullets; three kinds of value in the third branch and three named.
- `README-agents.md:37`'s four root-anchored session files: four named.
- `README-hooks.md:189` and `:199`'s "two identity-scoped readings": `presence` and `turns`.
- `rules/fusion-workbench-conventions.md:77`'s "two readers" of `workbench-tracking.md`: a human
  writing a `.gitignore` and the archive step — unaffected by this task, which added a citation *from*
  that file and not a consumer of it.

**Nothing further**, and that is a measured answer rather than an absence of effort. What it does not
cover, stated so the seventh pass does not have to rediscover the boundary: this search reads a count
word against the thing it counts, one sentence at a time, by hand. It cannot see a count that is right
in every sentence today and made wrong tomorrow by a commit that touches neither, which is the failure
mode all five earlier misses share — three of the Turn 3 review's four findings are that shape, and the
review's own cross-cutting observation names the missing instrument as a gate on the count words
themselves.

## Records closed

- `issues/260826-1127_o_the-repairs-authoring-home-says-three-readers-scope-by-checkout-and-this-circle-built-a-fourth.md`
  → `_c_`, with a `Resolved:` note carrying the measurement and stating that the curator observation in
  it is not discharged.
- `issues/260826-1127_o_five-shipped-sites-say-the-turn-count-helper-replaced-four-whole-file-grep-copies-and-there-were-two.md`
  → `_c_`, with a `Resolved:` note carrying both measured quantities and correcting the record's own
  two-versus-three estimate.

Both files were untracked, so `git mv` refused them and plain `mv` was used; the failed `git mv`
staged nothing and `git diff --cached --name-only` is empty. Nothing was staged and nothing was
committed.

## Files changed

- `/Users/k1/Projects/productive/fusion/rules/workbench-tracking.md`
- `/Users/k1/Projects/productive/fusion/bin/fusion-events`
- `/Users/k1/Projects/productive/fusion/hooks/lib/events-query.ts`
- `/Users/k1/Projects/productive/fusion/hooks/dist/lib/events-query.js` (rebuild)
- `/Users/k1/Projects/productive/fusion/hooks/dist/lib/events-query.d.ts` (rebuild)
- `/Users/k1/Projects/productive/fusion/CLAUDE.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/reference-resolution-lint.test.ts`
- `.../planning/260825-2140_c_c4-presence-travels-and-the-monitor-reads-its-own-checkout.md`
- `.../260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_c_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`
- the two `260826-1127` records, appended and renamed `_o_` → `_c_`

## Verification

`cd hooks && npm test` — exit 0. 44 files, 776 tests, all passing.

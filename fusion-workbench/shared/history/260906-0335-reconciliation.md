# Reconciliation — loops 3 and 4, the eight records nobody had checked

**Date:** 2026-09-06 03:35
**Agent:** reconciler
**Status:** Complete
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Domain:** code
**HEAD:** `b462d55d`
**Session:** `260905-2008-orchestrator-session.md`

## What this pass was and what it was not

The third reconciliation of this session and the narrowest. The full walk ran at
`260905-2037-reconciliation.md` and the verification of loop 1's closures at
`260905-2238-reconciliation.md`; both were read first and neither is repeated. This pass was scoped
to the eight records loops 3 and 4 produced, which no independent reader had opened: three closures
written by the orchestrator from an executor's report, three defects filed, and one decision.

Every claim below was taken to the code, to a re-run of the measurement, or to a replay against the
commit the claim names. Nothing was accepted on a record's own word, which is the norm this session
established on the 181-against-35 record in loop 1.

## The three closures hold, and each was verified independently of its own citation

**`260904-2140`, the monitor bind.** `bin/monitor` accepts port 0 and skips the takeover step behind
an explicit `if PORT != 0`; `MONITOR_URL_FILE` lets a caller name where the server publishes its
bound URL; the harness passes the literal `"0"` for every case and reads the URL back. The note's
"not covered" clause is honest — it names a measurement that was **not** taken, the pre-repair rate
under the same ten-pair protocol, and says what the before side rests on instead.

**`260905-2213`, the commit-message path.** `agents/orchestrator.md` carries the session-scoped path
at the write site and at the `git commit -F` site, which is what makes the repair whole; a repair
that moved only the first would have left the command reading a path nothing writes.
`commit-message-path.test.ts` pins both, with a negative control fed the exact pre-fix spelling.

**`260906-0115`, citation form at the write.** Both figures in its note were re-taken rather than
trusted, and both reproduce (below).

## The two figures in the write-time note, re-taken

**17 of 1863 reproduces exactly.** Calling `workbenchRecordPath`, `writtenLines` and
`measureCitationForm` from the committed build over every `.md` under this workbench, as a whole-file
`Write`: **1865 considered, 17 reportable, 41 rows.** The denominator is two higher because two
records were filed since; the numerator is identical.

**One property of the 17 the note does not state.** All 41 rows are `stale-marker` and none is
`store-prefixed`, and 16 of the 17 files are history, analysis and review files whose citations went
stale when the cited record's marker later moved. Under the real trigger those are quieter still,
because the report is scoped to the lines the call wrote. So 17 is a **ceiling** on the firing rate,
not the rate.

**The replay reproduces exactly.** The orchestrator record as it stood at `cd623b6f`, put through the
same path, returns one violation, at line 18, `store-prefixed`, with the correct storeless spelling
offered.

## What the write-time machinery can and cannot do

Asked because it is new code on the PostToolUse path of every consuming project, and read out of
`hooks/lib/citation-form.ts` and `hooks/tracker.ts` rather than out of the module header's claims.

- **It cannot fail a tool call.** `PostToolUse` cannot block; each of the tracker's three measurements
  is wrapped in `bestEffort`; and `main`'s catch calls `respond()` before it reports anything.
- **It rewrites nothing.** Its only writes are the throttle record `.guard-state/citation-form.json`
  and one `citation_form` event row.
- **It is quiet on the commonest path**, by the ceiling above, and `bin/fusion-citation-check` at HEAD
  reads `edited-violations=0`, which is the module header's own second qualifying test.
- **It stands down nowhere.** The trigger is anchored at the workbench root, so it measures in
  fusion's own repository, which is where the defect was found.
- **Its cost, which nothing else states:** on a workbench `.md` write the scanner builds a recursive
  index of the whole workbench. Over this tree (2554 files) the measurement takes 30–46 ms warm, and
  the hook is a fresh process per tool call, so the index is rebuilt each time. Modest, measured, and
  it scales with the consuming project's workbench rather than with fusion's.

## The four filings: three hold as written, one is now partly false

**`260906-0035` (defect), the git helper.** Every claim is true at HEAD, read there rather than taken
from the analysis. Its "both of its callers" was re-checked because a **third** importer of `git()`
appeared after it was filed — `lib/citation-scan.ts`, reached from the new PostToolUse path — and it
still holds: the scanner's git calls live in `declaredCitationFiles()`, whose only callers are the
two hand-run binaries. The record is accurate by one function's worth of margin.

**`260906-0035` (decision), the git budget.** No answer anywhere. Searched the decision store, the
analyses, the plans and the September histories. `GIT_TIMEOUT_MS` is still `5_000` and no
configuration leaf exists, so option 3 has not been taken by accident either.

**`260906-0322`, the identifier leak.** Reproduced rather than read: the replayed sentence ends its
`fix` clause with a fusion decision stamp, on the `additionalContext` channel. Both secondary claims
check out — the closed predecessor is under the `260829-1110` sweep, and
`sentence-identifier-containment.test.ts` states the hole in its own header and now carries a second
note recording that the latent case has arrived live. One imprecision, stated on the record: "fires
on every record write" is true of the check and not of the sentence.

**`260905-2356`, the suite isolation record.** Two findings, below.

## The isolation record's title, and a sentence in it that is false

**The title misdescribes the record.** This is a verdict, not a restatement of the record's own
hedge. The record says the title is "accurate about the condition and wrong about the mechanism"; the
sharper reading is that the title names a mechanism the record refutes on its own evidence. "Not
isolated from a second copy of itself" asserts shared state between two runs, and the diagnosis found
none — every one of the eight files builds its root with `mkdtempSync`. The record's own third table
row proves a second copy is not required: 5 red of 37 under agent load with no second suite. A second
copy is one sufficient load, not the condition.

A title that fits the mechanism: **three fixed wall-clock budgets sit inside the loaded latency
distribution, and the suite reddens at 40 percent beside a second copy of itself.** The 40 percent
earns its place; "not isolated" points a reader at the repair the diagnosis rejected.

**One sentence in the record is now false in the present tense, and the commit that falsified it is
the commit that wrote it.** `## The mechanism, read out of the code` says "`testTimeout` is 5 000 ms
and this project never sets it." `hooks/vitest.config.mjs` has set `testTimeout: 30_000` since
`ea17e354` — and the diff shows the whole section was added to the record *in that same commit*. The
per-file figures under it are still exactly right (13 cases in `fusion-commit-lock.test.ts` with one
explicit budget; 21 in `monitor-warnings-panel.test.ts` with 18 carrying `30000`); only the default
they ran under has moved. Not repaired — the description is the record's own text — but marked on the
record, because a later reader would otherwise take it for a live reading.

Two of the three budgets that record names are now moved. The third, `lib/git.ts`'s, is the one that
ships, and it is blocked on a user ruling.

## One new defect filed, found while verifying a closure note

`260906-0335_*_nine-of-twelve-line-number-citations-in-shipped-text-name-the-wrong-line-and-no-gate-resolves-one.md`.

Loop 3's closure note named one stale line-range citation in a skill body. Verifying it showed the
same sentence carries a second, equally wrong; enumerating the surface showed the class. Of the twelve
`path:N` citations in `skills/`, `agents/` and `rules/`, **nine name a line that does not carry what
the citing sentence says it carries**, by margins from one line to a hundred and ten, across five
citing files. `reference-resolution-lint` resolves paths and heading anchors and never a line number,
so no gate has ever seen one of them. Three of the nine were widened by this session's own commits and
none was wrong because of them — each was already wrong before the commit that made it worse, which is
the shape of a class that keeps arriving.

## The open corpus, and the decisions

**Ten open defect records** after this pass — the nine that were open plus the one filed here.
`260906-0115` is `_c_` on disk and its closure is verified.

**Ten open decisions and no `Answer located:` line anywhere.** Loop 1 searched all nine that existed
then and found no answer written down elsewhere; nothing since has produced one, and the tenth
(`260906-0035`, the git budget) was filed tonight with a recommendation and no ruling. Evidence was
appended only to the two where the delta is substantive rather than to all ten — re-appending an
unchanged "still no answer" nine times inside one session is the recurring cost this project's own
records warn about, and the reason is recorded here instead:

- `260906-0035` — first reconciliation, so it gets its own search record.
- `260823-1414` — a **new mechanism now reads review files for citation form** and a reader could
  mistake it for a partial answer. It is not one: the write-time check reports only lines the writing
  call produced, so a citation that goes stale *later*, when the cited record's marker moves, is
  invisible to it; and it excludes `dangling` wholesale. Option 4 now has part of a mechanism,
  covering the moment of writing and not the moment of staleness. The trade is unchanged.

**No decision marker was touched.** That transition is the orchestrator's, relaying a ruling the user
gave (`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`).

## The plans

Neither moved and neither was edited. `260831-2144_*_repair-three-citation-grammar-defects.md` stays
`Partially Complete`: step 3 is still blocked on
`260831-2142_*_which-property-separates-a-head-field-identifier-from-a-head-field-citation.md`, and
`grep -rn IDENTIFIER_HEAD_FIELDS hooks/` is still empty at HEAD.
`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` is untouched by loops 2 through 4. A
reconciliation entry saying "nothing moved" was not written to either: loop 1 recorded the state four
hours ago and nothing has changed it.

## Two bookkeeping observations, reported and not filed

**The session log and the machine-written Turn count disagree by one.** `bin/fusion-events turns`
reads `turns=3` scoped to this session's history file, and the session ran four loops: the log's
per-loop section stops at Loop 3 and no `turn_start` row exists for the loop that produced
`b462d55d`. The session's own parameter block states that one loop is mapped onto one Turn, and at
HEAD that mapping does not hold. It is the orchestrator's to close at Phase 3, not a defect in fusion.

**The loop-4 closure is uncommitted.** `bin/fusion-staging-drift` reads `verdict=unstaged` with two
`record`-class rows, both halves of the `260906-0115` `_o_`→`_c_` rename. The session is winding down
and will commit it; recorded so that the state is not read as a loss if it is not.

## Instrument readings at `b462d55d`, after every write this pass made

- `cd hooks && npm test`: 52 files, 910 tests, green.
- `node hooks/dist/citation-check.js`: `files=2554 dangling=301 edited-violations=0 verdict=clean`.
- `node hooks/dist/citation-sweep.js --dry-run`: `files=0 rewrites=0 residual=3005`.
- `npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/citation-sweep.test.ts`:
  30 tests, green.

The two citation gates were re-run **after** every append. One append introduced a dangling token —
the storeless spelling the replay offered, which names a foreign project's file — and it was rewritten
as a statement before the gates were re-read, which is the same class the record it sits on is about.
The census returned to its pre-pass value.

## Every write this pass made

**Marker moves: none.** All eight records were already at their correct marker. No decision marker was
touched.

**Reconciliation evidence appended, seven records**, each below the existing note and leaving that
note unedited: `260904-2140`, `260905-2213`, `260906-0115` (closed); `260905-2356`, `260906-0035`
(defect), `260906-0322` (open); `260823-1414` and `260906-0035` (decisions).

**One defect filed**, in `shared/issues/`: the nine stale line-number citations.

**One `## Coherence` section appended** to `260905-2008-orchestrator-session.md`, the third, below the
two already there and replacing nothing.

No code, no data, and no record description was edited.

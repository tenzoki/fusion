# Reconciliation — 260822-1556

**Agent:** reconciler, domain `code`
**Dispatched by:** orchestrator, Phase 3
**Range:** `370bfc5..9f65463`, twelve commits. HEAD `9f65463`.
**Circle:** none active. Every store scanned is the shared one.
**Verification:** `cd hooks && npm test` — exit 0, 41 files, 724 tests, run before and after the
edits this pass made.

## What was reviewed

| Store | Read | Changed |
|---|---|---|
| `shared/planning` | 6 | 2 |
| `shared/issues` | 266 listed, 23 read in full | 4 (one closed, three annotated) + 3 filed |
| `shared/decisions` | 60 listed, 12 read in full | 6 annotated + 1 filed |
| `shared/reviews` | 2 read in full | 2 annotated |
| `shared/history` | 12 from this session | 1 appended (the Coherence section) |
| `shared/analyses` | 2 from this session | 0 |
| `circles/*` | 14 records, all terminal | 0 |

**Discrepancies found: eleven.** Six were tracking fields that had drifted, three were false
statements in records, and two are structural and are filed rather than corrected.

## The two things the dispatch asked to be sceptical about

**The closing measurement's figures hold, all of them.** Summing each surface with the collector its
own bound uses gives head-room of 16 601 bytes on `agents/*.md`, 4 661 on `skills/*/SKILL.md` and
302 lines on the hook test suite — the three reported figures, exactly. The four baseline maps were
re-extracted from `370bfc5` and from the working tree by the same `awk` slice and diffed:
`AGENT_BASELINE` 17 lines / 413 bytes, `SKILL_BASELINE` 14 / 389, `TEST_LINE_BASELINE` 41 / 1 554,
`RULE_BASELINE` 17 / 1 042, all four `diff -q` clean. The room was cut, not moved. Both intermediate
tables in the measurement were reproduced commit by commit from `git ls-tree` and match at every row.

**The 206 bytes and 49 lines are right.** Per-commit deltas: `skills/*/SKILL.md` +50 at `620e737`
(236 069 → 236 119) and +156 at `77b9a02` on `help/SKILL.md` alone (16 889 → 17 045, inside a commit
net −645 on the surface); hook test suite +41 at `181dd8a` (19 862 → 19 903) and +8 at `c2ad89c`
(19 903 → 19 911). That is 206 and 49, none of it a feature, every surface net negative across the
range. The figure that goes to the closure gate is correct as written.

## The four defects C0's test named, verified at their sites

Each was checked against the tree rather than against its own `Resolved:` note.

1. **Step 0e's guards and its unreported outcome** — all three blocks carry
   `[ -n "$SRC" ] || { echo "source-root-unresolved"; exit 0; }` at `skills/setup/SKILL.md:188`,
   `:223` and `:231`; the Done-report contract names the skip at `:242`; the enumeration head reads
   "The eight tokens" at `:203`. Record `_c_`.
2. **The v10.5 note missing from `/fusion:help`** — `skills/help/SKILL.md:101` carries the paragraph
   and points at `docs/upgrading-to-v10-5.md`; `:107` caps the section at the last three releases and
   tells the reader to list the directory rather than derive a filename. Net −68 bytes on that body.
   Record `_c_`.
3. **No test for `bin/fusion-prose-metric`** — `hooks/lib/__tests__/fusion-prose-metric.test.ts`,
   162 lines, 9 cases, under the plan's 200-line cap. Record `_c_`.
4. **The growth-bound record whose stopping criterion could not be met** — closed in `4a58be1` with
   the prescribed note. Record `_c_`. See the correction below: it was `_o_` at `370bfc5`, not `_c_`.

## What was corrected

**The plan** (`260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`),
`_o_` → `_c_`. Four of nine steps carried `[DONE]` and all nine had executed; steps 1, 2, 7, 8 and 9
are now marked against the commit that landed each. `**Status:** Draft` → `Complete`. Three of the
five `## Open Questions` are ticked, with the resolutions stated in the log rather than inline. A
`## Reconciliation Log` carries the per-step evidence table and the re-measurement. The rename
dangled five citations in three live records, all rewritten to the wildcard form
`260806-0015_*_zitierform-fuer-workbench-records.md`
ratified, as `rules/fusion-workbench-conventions.md` `## Marker globs` requires; the citation gate
is green.

**The spec** (`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`), marker held
at `_o_`, `**Status:** Draft` → `Partially Complete`. One of five capabilities is delivered and four
are not started, so the marker does not move: nothing in the range adds a person field, changes
`.gitignore` or gives the event log a presence line. Four of C0's five acceptance criteria are
ticked; the fifth asks for a closure note that does not exist yet and is the orchestrator's.

**One defect closed.**
`260822-1228_*_plan-step-8-asks-for-a-closure-that-was-already-made-and-the-record-already-carries-the-note.md`,
`_o_` → `_c_`, with the correction in its `Resolved:` note and its body left untouched. Its premise
is false: the target record was `_o_` at `370bfc5` and became `_c_` in `4a58be1`, which is step 8
itself. The analyst read the effect of the step and dated it to the session anchor.

**Three records annotated and left open.** `260822-1227_*_plan-step-4-names-a-duplication-record-whose-own-fix-direction-forbids-the-cut-the-step-asks-for.md` (the harm it predicted did not occur and
its fix direction is now unreachable, because a closed plan is not edited to make a past state
true), and the two `260822-1136` decisions plus both `260822-1154` decisions, each with the search
that found no answer on disk.

**Two `_a_` decisions annotated, neither transitioned.**
`260822-1102_*_what-happens-when-a-planned-circles-required-work-exceeds-the-remaining-head-room.md`
was considered for `_a_` → `_i_` and held: its stated test is met and verified, but `_i_` is
terminal and the answer's second half — "the rebuild starts against the room that Circle produces" —
is not on disk. The citation is ready and belongs to whoever opens C1.
`260719-2141_*_concurrency-worktree-slots-vs-single-active-circle.md` gains a note recording that a
spec now exists that plans to supersede it and that the supersession has not been written.

**The one transition the orchestrator made at closure holds.**
`260822-1330_*_where-does-the-reviewer-contract-live-when-the-agents-surface-has-to-give-back-bytes.md`,
`_a_` → `_i_` citing `181dd8a`: `rules/review-contract.md` was created in that commit, `bin/fusion-rules`
emits it behind `IS_REVIEWER_AGENT` at `:508-509` to `coderev` and `ontorev` alone, and the two
reviewer prompts fell 5 240 and 4 264 bytes. One figure inside the note is discussed below.

**Both review files annotated**, findings untouched.

## What was filed

Three defects and one decision, all in the shared store.

- `260822-1556_*_the-cut-ledger-states-a-head-anchor-two-commits-behind-where-it-ran.md`
  — Medium. `260822-1226-cut-ledger-for-three-bounded-surfaces.md:54` says "Measured
  at HEAD `370bfc5`" and the analyst was standing on `faac921`. No measurement is wrong — `4a58be1`
  and `faac921` touch workbench records only and every shipped surface is identical at both commits
  — but the misdating produced the false defect closed above.
- `260822-1556_*_the-closure-measurement-assigns-610-bytes-of-the-five-claim-cut-to-the-reviewer-contract-relocation.md`
  — Low. The step-3 history and the decision record both say 8 894 bytes for the relocation; the
  closure measurement assigns the whole 9 504 that the two reviewer prompts gave back. The 610-byte
  difference is their share of the five-claim cut, 305 each. The head-room totals are unaffected;
  what is wrong is the sentence a closure note will quote, and the relocation was accepted at a user
  gate on the statement that its figure would be reproducible.
- `260822-1556_*_the-spec-names-five-circles-and-the-workbench-holds-none-of-them-so-c0-closed-with-nothing-to-transition.md`
  — Medium. `circles/` holds fourteen directories, every one terminal, none created this session, and
  `.active-circle` was absent throughout. So Phase 4 has no `_t_` record to transition, the closure
  note clause 6 asks for has no canonical home, and C1 through C4 exist only as spec prose that the
  playmaker does not rank. The record proposes two ways out and prescribes neither.
- `260822-1556_*_does-the-record-filename-convention-hold-when-several-checkouts-file-into-one-store.md`
  — `_o_`. `260807-0158` settled "no minting helper" on a collision measurement taken over a corpus
  one person wrote from one checkout, which is the input the Directive changes. Due at C3's planning
  gate beside the two the spec already lists.

## What was not corrected, and why

The orchestrator's session history file stops at Turn 2 and carries `**Status:** In progress`. That
is correct while the session runs: this pass is Phase 3 and the orchestrator has Phase 4 still to
write. The standing defect about a history file left at that status after its session ended
(`260819-1511_*_a-session-history-file-is-left-at-status-in-progress-after-its-session-ended.md`)
is not triggered yet.

`260822-1102_*_…` cites its answer as `260822-1009-orchestrator-session.md`
with no line number, where `rules/fusion-workbench-conventions.md` `## State Markers — decisions`
asks for `<path>:<line>`. The cited file is untracked in git and its line numbers move with every
Phase-4 append, so a line number written now would be wrong by the end of the session. Left as it
stands, recorded here.

## Coherence

The three-edge verdict is appended to `260822-1009-orchestrator-session.md`
`## Coherence`: **review-needed**, all three edges flagged, recommendation **revise Grounding** —
supersede `260719-2141`, which is the one active decision that forbids what the Directive asks for
and the one change at HEAD that removes a standing contradiction. Bounded Closure is not proposed.

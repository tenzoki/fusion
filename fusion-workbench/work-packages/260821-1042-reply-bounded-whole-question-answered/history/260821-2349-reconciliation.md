# Reconciliation — the bounded reply Circle, final pass

**Date:** 2026-08-21
**Agent:** reconciler
**Domain:** `code`
**Status:** Complete
**Circle:** `260821-1042-reply-bounded-whole-question-answered`
**HEAD:** `9a68760`. **Session anchor:** `e764637`. Working tree clean at start and at end.
**Verification:** `cd hooks && npm test` — exit 0, 40 files, 718 tests.

## What was reviewed and what moved

| Store | Reviewed | Updated |
|---|---|---|
| Plans | 1 | 1 (`**Status:**` Draft → Complete; reconciliation log appended; marker held) |
| Issues, Circle | 11 | 5 (4 open annotated, 1 new filed) |
| Issues, shared | 1 target + 2 from this Circle's reviews | 3 annotated, none renamed |
| Decisions, Circle | 6 | 1 renamed `_a_` → `_i_` |
| Reviews | 2 | 2 annotated |

Six defect records in the Circle already carried `_c_` with `Resolved:` notes. Each was spot-checked
against the tree and each is genuinely resolved; none was re-opened.

## The five things that were checked rather than taken on trust

### 1. The plan should be `_c_`, and the rename is blocked by the citation gate

All six steps carry `[DONE]`, all six executor logs carry `**Status:** Complete`, and every step's
acceptance was verified independently against the tree. The plan is finished, and
`rules/fusion-workbench-conventions.md` `## Inline State Tracking` owes it `**Status:** Complete`
and a rename to `_c_`.

The header moved. The marker did not, and the reason is measured rather than judged. Fifteen
citations across twelve workbench files spell the plan's `_o_` marker literally, five of them inside
the corpus `hooks/lib/__tests__/workbench-citation-lint.test.ts` recomputes on every run. The rename
was performed in the working tree, the gate was run, and it failed with `stale marker '_o_'` naming
exactly those five; the rename was then reverted and the tree left clean. So the correct sequence is
to repair the citations into the `_*_` wildcard form first and rename second, and the repair reaches
records this pass has no standing to rewrite. Filed as
`260821-2349_*_closing-the-plan-and-the-verbosity-record-dangles-seventeen-marker-literal-citations.md`,
with the same class already on record at
`260815-1913_*_closing-the-plan-dangles-thirty-four-workbench-citations-that-spell-its-open-marker.md`.

### 2. The verbosity record: the rule-text half is closed, the marker is the user's call

`260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
was read in full against the current `rules/user-facing-output.md`. Both halves are answered in
shipped rule text and each answer was verified by line.

The unasked-question half: `:53` opens `## Information architecture` with its subject before its
ordering, and its worked contrast is this record's own specimen. The length half: `:108` makes every
cap the budget for a whole output and replaces relocation with cutting, `:103` gives the session
summary a total as well as a header cap, `:49` makes a sketch count like every other line, and
`:102` closes the fourth route by capping a gate at eight lines whatever surface renders it. That
fourth route stood in the section the plan's own survey had read and declared clear, and Turn 2
found and closed it.

The marker stays `_o_`, for two reasons that are worth separating.

The first is the record's own argument, and it is the stronger one. The fault it reports is
behavioural. It states that the length rules were in force, loaded by every agent, and exceeded by a
factor of five, and that "the fix is not another rule about length". It names three candidate causes
and asks that the first job be to find which operates. This Circle removed one of the three, the
filing obligation dragging its context into the reply, and that removal is real and verified. The
other two were not investigated. The Circle also says plainly, in its own measurement note, that the
clauses land unenforced and that whether they change a reply is not observed. Step 1 froze the
pre-change figure for exactly that: 2 231 top-level assistant replies over 69 transcripts, 398 over
the twelve-line cap, with the command that reproduces it. Re-running that command is the one act
that turns "the clause is written" into "the reply changed".

The second reason is mechanical and has nothing to do with the merits. Closing the record dangles
two citations that spell its `_o_` marker literally, both in an open spec in the previous Circle.
Measured the same way as the plan: rename, run the gate, revert. It goes red.

Closing now would be defensible, because the corpus is the only mechanism this project chose to
change and the change is verified. It would not be a claim about any reply. That trade is written
into the reconciliation appended to the record so the user decides it with the trade in front of
them, rather than inheriting a marker somebody moved.

### 3. All six open issues are genuinely open, and the growth-bound record is current

Each was re-verified against the tree rather than read.

- `260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md` — AI04 now reads `name: "Mechanical enumeration"` and C06 still reads
  `"One name per thing"` while its instruction carries the restatement clause. Open for the C06
  half, as its own note says. The reason it gave for waiting has expired: its companion decided the
  clause stays in the profile, so the rename is now unblocked.
- `260821-2204` (growth bound) — **not stale.** Re-measured: 20 360 lines against a budget of
  20 375, so 15 lines of head-room, which is exactly what the record's Turn 3 progress note states.
  The golden agrees at `total 20360` and the two attribution blocks are one.
- `260821-2204` (the C05 pointers) — unchanged in all four profile copies; `surface()` still walks
  no `.yaml`.
- `260821-2214_*_a-step-log-defends-a-bounded-surface-with-a-count-taken-over-a-different-file-set-than-the-bound.md` — the 18 314 figure is still in the step log, unfixed, and now understates the gap
  by more than when it was filed.
- `shared/260821-2206` — U+2013 still in both German profiles; Turn 3 rewrote AI04 in the same file
  and did not reach AI02.
- `shared/260821-2207` — the blacklist bullet moved from "three-part lists" to "mechanical
  enumeration" for a different defect and is still short by AI08; the whitelist bullet is still
  short by C05 and C06. Its concrete consequence is gone, because C06's clause reached the rule
  file, and the inventory defect is not.

### 4. The Circle record and the open decision do not contradict each other

The record's `**Active spec/plan:**` reads `(none yet)` while the Circle ran on a plan. That is
option 3 of
`260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md`,
held pending an answer, and the decision itself is what makes it coherent rather than an omission.
The record states the Directive in full; the plan's `## Directive` points back at the record and
restates nothing. So exactly one document states the Directive, which is the invariant the head-field
rule exists to protect, and no citation loop was created. Nothing here needs repair.

One factual correction, offered rather than applied, because a decision's description is not this
pass's to edit. The record's `## Constraints` says `rules/circle-records.md` is inside the always-on
rule set. It is not. `bin/fusion-rules` emits it conditionally, to `orchestrator`, `playmaker` and
`shaper`, at an indented `emit_if_exists`; the always-on set is the five unindented lines. Bytes
added to `circle-records.md` are measured by the role-extras report in
`hooks/lib/__tests__/rules-emission-golden.test.ts`, which prints and does not fail, not by the hard
bound. Whichever option the user takes, the budget that constrains it is looser than the record says.

### 5. The duplicate timestamps break nothing

`260821-2203` and `260821-2204` each name two files, filed by `coderev` and `ontorev` dispatched
concurrently into one store. The filename pattern in `rules/fusion-workbench-conventions.md`
`## Filename Patterns` takes its uniqueness from the topic slug, not from the stamp, so two records
sharing a stamp are well-formed. Every citation of all four in the workbench carries the slug, so no
pointer is ambiguous, and the citation gate resolves all of them.

Two residues, neither of them the collision. Two citations spell `260821-2203_*_ai04s-remedy…`
where that record now carries `_c_`; both sit in a closed issue and a review, which are outside the
gate's corpus, so nothing is red and both are stale for a reader. And the concurrent filing produced
a real fault of a different kind, which `coderev` disclosed against itself: a `sed -i` over the
whole issues directory rewrote five files another reviewer was writing. That is recorded on its
class record at
`260810-1820_*_an-executor-verified-a-gate-by-mutating-a-file-another-executor-held-in-the-live-tree.md`
and needs nothing further here.

## Drift between what the plan says and what landed

The plan's budget table records the hook test suite as "Not touched, and no test is added". It was
touched. Two attribution comment blocks entered
`hooks/lib/__tests__/reference-resolution-lint.test.ts` above `BASELINE`, because the Circle's own
rule-file edits moved the pin and that file's convention answers a pin move with a written note.
Turn 3 consolidated the two into one and returned four of the ten lines. The surface stands at
20 360 against 20 375, so 15 lines of head-room where the anchor had 21, and the plan's stopping
criterion that no growth bound stand closer to failing than at the anchor is unmet at closure.

**One correction to how that is being framed.** It is being read as "no zero-line outcome exists".
The tree supports a weaker statement: a zero-line outcome existed and was declined on good grounds.
The gate's own re-approval text asks only that the received numbers be checked and written into
`BASELINE` with the edit. The attribution comment is that file's accumulated convention, which the
defect record itself declines to argue against. Honouring it was a defensible choice and it cost six
lines. The criterion is unmet either way, so nothing turns on the correction except the accuracy of
the closure note.

## The other three growth bounds, measured at HEAD

| Surface | Unit | Now | Budget | Head-room | At the anchor |
|---|---|---|---|---|---|
| Always-on rule set | bytes | 95 064 | 98 573 | 3 509 | 3 507 |
| `agents/*.md` | bytes | 416 205 | 417 843 | 1 638 | 1 638 |
| `skills/*/SKILL.md` | bytes | 240 409 | 240 439 | 30 | 30 |
| Hook test suite | lines | 20 360 | 20 375 | 15 | 21 |

The rule file itself is 20 142 bytes against 20 144 at the anchor, so net −2. The English chat
profile went 6 876 → 6 854 and the German 7 480 → 7 407, both mirrored byte-identically into
`fusion-workbench/stilwerk/`, verified with `diff -q`. Both budgets the Circle held itself to are
met without borrowing from each other.

## Decision transitions

`260821-1801_*_what-total-caps-a-session-summary-now-that-no-reply-has-an-uncapped-tail.md` moved `_a_` → `_i_`. Its answer, a 25-line total for a session summary with the
ten-line header kept, is realised at `rules/user-facing-output.md:103` in commit `9aa8ecf`, and the
record is cited on the line it governs. Checked before renaming: every citation of it in the gate's
corpus uses the `_*_` wildcard form, so the transition dangles nothing.

The four `260821-1108` scoping records stay `_a_`. Three of them constrain how the Circle worked
rather than name something to build, and the fourth parks a repair for a later Circle; none has an
implementation to cite. The one open decision, `260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md`, stays open and is discussed above.

Three decisions in `circles/260820-2051-style-rules-arrive-and-get-measured/decisions/` still read
open while their substance is settled in this Circle's own records. The playmaker recorded this at
activation, the planner recorded it in the plan's `## Open Questions`, and this pass records it a
third time without moving them: two are answered by records in another Circle rather than by
anything on disk in their own, and the third was overturned by the user, which is a transition a
reconciler should not write on somebody else's behalf.

## New records filed by this pass

- `260821-2349_*_closing-the-plan-and-the-verbosity-record-dangles-seventeen-marker-literal-citations.md`

## Misfiled — should be a decision

None found. Every open record read in this pass is a defect with a fix, or, in the case of
`260821-2204` on the growth bound, a defect whose remaining content is a statement the closure note
has to carry.

## Review coverage

`bin/fusion-review-coverage --since e764637` reports twelve commits, two reviews, four uncovered:
`a5e2cc5`, `1daf063`, `c8f0c74`, `9a68760`. Both reviews declare `**Reviewed-range:**
e764637..de0c6f6` and between them carry fifteen `**Not-opened:**` paths that no later pass picked
up. The user chose to close without a second review pass, knowingly, which
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
makes the user's call to make.

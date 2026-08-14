# Portfolio

**Generated:** 260814-2203 (by playmaker session 260814-2203-playmaker-orchestrator-phase4)
**Domain bias:** code
**git HEAD at run:** `d90b794`

**This is a Phase-4 refresh after a closure, and it holds no user confirmation.** It ranked,
regenerated this file in full, and moved one backlog entry to the recommended marker, which is the
one backlog write that needs no confirmation. Everything else it would do to the backlog stands
below as a proposal. Every figure in this file was measured against disk on this run; nothing is
carried forward from the previous one.

## Active (_t_)

**(none).** `260801-1244-curator` closed coherent at 260814-2200 and is now the first entry under
`## Recently closed`. `.active-circle` has been deleted, no Circle record carries the active marker,
and the two agree, so no pointer warning is raised. An empty active slot with no pointer is the
normal post-closure state.

## Anticipated (_a_) — ranked

**Recommended next: (none).** No Circle record carries the anticipated marker, and none has since
the curator Circle was activated on the morning of 2026-08-14.

The project now stands at zero active and zero anticipated Circles, which is the first time it has
held both at zero. Nothing is wrong, but one consequence is worth stating plainly: `/fusion:next`
has nothing to offer, and the only surface that can produce the next unit of work is the backlog
below. That makes the section that follows the substantive part of this run rather than an
appendix.

## Backlog — ranked

**Recommended to shape: `shared/backlog/260814-1733_*_radical-simplification.md` — the only live
idea whose evidence is already on disk, so it can be shaped today without commissioning new
analysis.**

    /fusion:direct shared/backlog/260814-1733_*_radical-simplification.md

Two analyses already answer the question this entry asks, with measurements rather than opinion.
`shared/analyses/260812-0022-where-the-complexity-comes-from-and-what-would-have-to-go.md` carries a
costed removal list and the finding that the binding constraint on fusion is the rate at which
mechanisms are added rather than the size of the system as it stands.
`shared/analyses/260812-0303-simplify-speed-and-why-rules-do-not-hold.md` names a single first move
— deriving the hand-maintained session counters from git and the event log at read time instead of
maintaining them — and puts the saving at up to 28 percent of session time, 43 130 tokens out of
every orchestrator Setup, and roughly 5 400 lines of drift machinery. A shaper can turn that into a
Directive in one sitting, because the sizing work has already been done and is on disk.

The recommendation also answers the shape of the moment rather than only the merits of the idea.
The three closures of the last two days each delivered a mechanism, and the observation standing
behind this entry is that fusion spends its sessions repairing itself while the project work
recedes. Shaping the simplification question next is the one available move that acts on that
observation instead of adding to it.

**Live and ranked (3).** Ranking recomputed this run against the code-domain bias, which prefers an
idea whose cited evidence is already on disk over one that would need fresh analysis before it could
be sized.

1. **`shared/backlog/260814-1733_*_radical-simplification.md`** (recommended, `_p_`) — can fusion be
   radically simplified, and along which axis. First, for the reason given above: two analyses on
   disk, no blocking record, and a first move already costed.
2. **`shared/backlog/260814-1733_*_bounded-executor-dispatches.md`** (open) — bound how long an
   executor runs before returning to the orchestrator. Second, because the measurement on disk
   adopts one half of the user's proposed fix on cost grounds and refutes the other half, so shaping
   it opens with a conversation about narrowing the Directive rather than with a blocker.
3. **`shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md`** (open) — a rule lands with an
   executable check or it does not land. Third despite being the remedy the analyses rate highest,
   because it waits on a user act. The decision it depends on,
   `shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md`,
   carries the deferred marker, and reviving a deferred decision is the user's own act. That record
   in turn waits on
   `shared/issues/260810-0510_*_two-of-the-queue-ground-lints-negative-controls-re-implement-the-logic-instead-of-calling-it.md`,
   which is open. Both were verified on disk this run.

**Proposed and not performed (1).** A Phase-4 dispatch holds no confirmation, so this is a proposal
for the next interactive run to put to the user:

    defer shared/backlog/260814-1733_*_attach-the-rule-to-the-act.md until shared/decisions/260810-0710_*_should-a-rule-be-allowed-to-land-without-the-check-that-enforces-it.md is revived

The argument for it: the entry cannot be shaped at all until the user revives that decision, and the
deferred marker is the vocabulary's own way of saying "live, but waiting on a named target". The
argument against it, which the user should weigh: a deferred entry is revived only by hand, so
deferring adds a step, and leaving the entry open costs nothing today beyond its third-place
position. We recommend the deferral only if the user does not expect to revive the decision soon.

**No split, merge or close is proposed.** Each of the three entries now states one idea and can be
promoted whole, which the split of 260814-1733 is what made true. The two entries that both cite the
rules-decay analysis state distinct ideas — one bounds dispatch length, the other binds a rule to an
executable check — so a merge would consolidate two things into one and lose a Directive.

**Performed this run:** the ranking rename only. `260814-1733_o_radical-simplification.md` became
`260814-1733_p_radical-simplification.md`. No entry was created, split, merged, closed or deferred.

## Recently closed (_c_ / _b_)

| Circle | Marker | Closure in one line |
|---|---|---|
| `260801-1244-curator` | `_c_` | Closed coherent on 260814 after six Turns and 29 commits; the curator agent ships as fusion's seventeenth, the growth bound on the always-on rule corpus is armed with tests firing in both directions, and the proof run against this repository landed all 28 approved corrections with no constraint removed. |
| `260813-0910-documentation-matches-shipped-plugin` | `_b_` | Bounded Closure on 260813 after five Turns; nine of ten plan steps landed, and the unreached step 10, verifying `docs/plane-setup.md` against `bin/fusion-plane`, is the Bounded-Closure Artifact. |
| `260813-0858-playmaker-maintains-backlog-store` | `_c_` | Closed coherent on 260813 after four Turns; the reconciler's review-needed verdict was taken as a revise recommendation and its five findings closed in Turn 4. |
| `260807-0923-guard-misst-statt-orakelt` | `_c_` | Closed coherent on 260807; the static shell classifier was deleted outright and replaced by a measurement. |
| `260805-2005-textschicht-gegen-code-nachziehen` | `_c_` | Closed coherent on 260806; four code fixes, the citation-form decision, and two new lints landed green. |

## Archived (_s_ / _d_)

| Circle | Marker | Why |
|---|---|---|
| `260804-1205-shell-reachability-model` | `_s_` | Superseded on 260807 by `260807-0923-guard-misst-statt-orakelt`. Neither reached nor unreachable: the user changed the mechanism, so the Directive stopped being the right one. |

No Circle record carries the deferred marker.

## Warnings

### New this run

**`the-parent-spec-is-in-an-undecided-state-and-sits-above-everything`.** The curator Circle was the
last of four under `shared/planning/260801-1122_*_spec-normative-consolidation.md`, and all four have
now delivered. The spec still carries the open marker. Whether it may close is a question rather than
a measurement, because three of its capabilities left the scope instead of landing: C9 was performed
by hand in another Circle and put out of scope by user direction, C4 was retired by user decision on
2026-08-14, and C5c's subject, the guard's protected-path half, was deleted outright on 2026-08-12.
Closing the file asserts a delivery that did not happen; leaving it open asserts outstanding work
nobody intends to do. The reconciler filed the question as
`shared/decisions/260814-2017_*_does-a-parent-spec-close-when-its-last-circle-does-if-three-of-its-capabilities-were-retired-rather-than-delivered.md`,
open, with three options and a recommendation. This portfolio does not answer it and takes no
position. It is surfaced here because a reader choosing what to do next needs to know that the
document standing above this whole body of work is in an undecided state, and because once the
Circle is closed nothing scans that file on any routine path.

**`the-project-holds-no-anticipated-circle-and-no-active-one`.** Stated as a warning rather than only
as a portfolio fact, because it changes what the tooling can do: `/fusion:next` will report no
candidate, and the backlog is the only remaining source of the next unit of work. The recommendation
in `## Backlog — ranked` is the response.

**`twenty-one-open-defect-records-and-two-open-decisions-outlive-the-curator-circle`.** Counted off
disk this run: 21 open and 20 closed defect records in
`circles/260801-1244-curator/issues/`, and 2 open against 2 implemented decision records in that
Circle's decision store. The Circle is terminal, so nothing scans these on a routine path; they reach
a successor by citation, or they reach the task queue, and they reach neither by sitting there. The
Closure note names 21 open defects and one open decision. The second open decision,
`circles/260801-1244-curator/decisions/260814-1915_*_should-mode-3-require-the-audit-line-on-every-run-instead-of-testing-whether-it-was-dispatched.md`,
was filed at 260814-1915 and so predates the closure; the note's count is one low.

### Standing, each verified against disk this run

**`release-8-2-0-is-published-in-one-place-and-not-the-other`.** Unchanged since the previous run and
re-measured. `.claude-plugin/plugin.json` reads 8.2.0 and the installed copy at `/Users/k1/.fusion`
reads 8.2.0. The fusion entry in
`/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins/.claude-plugin/marketplace.json`
reads 8.1.0, and the newest git tag in this repository is `v8.1.0`. Against the release process in
`CLAUDE.md`, steps 1 and 6 are done and steps 3, 4 and 5 are outstanding. A user installing over
HTTPS gets 8.2.0 from `main`, a user installing through the marketplace gets 8.1.0, and the
documented `FUSION_REF=tags/v8.2.0` pin resolves against nothing.

**`the-task-queue-is-three-days-stale`.** `tasklist.md` was generated on 2026-08-11 at 17:34 against
HEAD `f70cb07`; HEAD is now `d90b794`. Its own header inventories 72 open defect records, while
`shared/issues/` alone now holds 97. Its `Active Circle: none` line happens to be correct again after
today's closure, which is the kind of accidental agreement that makes a stale file easy to trust.
The portfolio does not read the work queue and does not write it; this is reported so that nothing
reads it as current.

**`chat-voice-caps-tightened-in-the-shipped-copy-only`.** Re-measured this run and unchanged.
`fusion-workbench/stilwerk/chat-voice-de.yaml` holds 7 353 bytes against 7 358 in both the shipped
`stilwerk/` and the installed copy; `chat-voice-en.yaml` holds 6 801 against 6 800. The workbench
copies are the ones `bin/fusion-rules` emits, so until they are refreshed the tightened caps govern
no agent in this project.

**`ten-open-defects-and-two-open-decisions-outlive-the-bounded-circle`.** Recounted off disk and
unchanged: `circles/260813-0910-documentation-matches-shipped-plugin/` holds 10 open issue records
against 16 closed, and 2 open decision records. The same terminal-Circle reasoning as the curator
entry above applies.

**`plane-setup-verification-outlives-its-circle`.** The unmet Directive clause of that bounded Circle
sits inside the terminal Circle as
`circles/260813-0910-documentation-matches-shipped-plugin/issues/260813-2305_*_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md`,
so nothing schedules it.

**`the-bounded-circles-own-acceptance-record-is-still-open`.**
`shared/issues/260813-0825_*_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
holds that Circle's acceptance conditions and is still open, but sits in `shared/`, so an ordinary
reconciler pass can still reach it.

**`write-key-defect-record-is-open-and-demonstrably-satisfied`.**
`shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
is still open on disk. Its four acceptance conditions read as met against the work tree and against
the installed copy, and this run exercised the write key it asks about. It is closable.

**`one-sided-dependency-is-now-frozen-on-both-sides`.**
`shared/issues/260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`,
open, whose scope needs widening to cover the case where both Circles have gone terminal.

**`fusion-direct-cannot-run-the-flow-it-documents`.**
`shared/issues/260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`,
open. Surfaced here because the path from a backlog idea to a Circle runs through `/fusion:direct`,
and the recommendation in `## Backlog — ranked` above ends at exactly that command.

**`backlog-idea-only-partly-filed`.** The user's observation that every fusion operation is
unbearably slow, not only Setup, exists on disk solely as a witness line inside a record scoped to
Setup (`shared/issues/260812-0253_*_setup-takes-far-too-long-and-nothing-measures-it.md`). It is
defect-shaped rather than idea-shaped, so it did not belong in the split that produced today's three
entries, and no open record covers it as stated. The playmaker files no issues; this one is the
user's to decide.

### Cleared this run

**`the-active-circle-has-one-turn-of-budget-and-thirteen-open-defect-records`** is discharged by the
closure. The Circle ran two further Turns, reached six in total, and closed coherent. The open-record
half of it is restated above as the terminal-Circle warning, which is a different concern.

**`the-turn-3-coherence-verdict-recommends-revising-the-grounding-and-nothing-has`** is discharged.
The third reconciliation pass (`circles/260801-1244-curator/history/260814-2153-reconciliation.md`)
issued `coherent` on all three edges after the two High findings were closed and verified against the
tree.

**`backlog-acceptance-run-still-not-performed`** is discharged and is now gone from the standing set.
The relay ran end to end on 260814-1733 and produced today's three entries.

**`curator-record-title-contradicts-its-directive`** and
**`curator-grounding-still-calls-the-growth-bound-question-open`** leave this file, not because the
underlying records changed, but because their subject is now a terminal Circle. Both are folded into
the terminal-Circle warning above and remain open as filed defect records inside that Circle.

### Graph checks

**Dependency cycles: none, and none constructible.** The graph over non-terminal Circles is empty:
no record carries the anticipated or active marker, so there are no nodes and no edges. No
`## Dependency warning` section was appended to any record.

**Parent-grounding-stale events: none.** The one Circle carrying the bounded marker is
`260813-0910-documentation-matches-shipped-plugin`. The propagation scan looks for non-terminal
Circles whose `## Grounding snapshot` cites that directory or the Artifact its Closure note names,
and there are no non-terminal Circles, so the scan has an empty candidate set. Today's closure was
coherent rather than bounded and propagates nothing by construction. No `## Parent grounding stale`
section was appended.

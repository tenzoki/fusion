# Reconciliation: the cleanup pass over `a99e680..3d4b181`

**Status:** Complete
**Agent:** reconciler, domain `code`
**Range:** `a99e680..3d4b181` (three commits)
**Circle:** none active; every `SCAN_*` collapsed to `shared/`
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**This was a scoped pass, not a sweep of the workbench.** Two reconciler passes ran earlier in
the same session and the dispatch named what was left: the backfill's own consistency at HEAD,
whether the second pass was right to write no history record, the session's history file, and
whether the six open defects are still genuinely open. I did not re-open the 65 decision
records or the six plans the first pass walked, because nothing in
`53d656f..3d4b181` touches a plan or a decision and re-deriving a 90-minute-old verdict is the
cost the workbench already paid three times over on one measurement this session. Where I
report a count below, I recomputed it rather than carrying it over, and I say which.

**No writing profile was emitted for this agent.** `bin/fusion-rules reconciler` emits the
chat profile alone, so the prose here follows `rules/user-facing-output.md` and the artifact
language this project declares, with no long-form profile layered on it.

## What was reviewed and what moved

| Store | Reviewed | Updated |
|---|---|---|
| Plans | 2 opened at specific criteria; 0 walked in full | 0 |
| Issues | 7 open across every store, plus the 31 backfilled records | 2 annotated, 1 revised, 1 filed |
| Decisions | 3 open in `shared/` re-checked; 65 counted by marker | 0 |
| Reviews | 0 in range; coverage tiled with `bin/fusion-review-coverage` | 0 |
| History | 1 session file corrected, 2 written | 3 |

`cd hooks && npm test` at the start of the pass: 43 files, 760 tests, exit 0. The three
citation and plan lints were additionally run alone, before and after every write.

## The backfill holds, and I checked it rather than accepting the report

The second pass reported both lint gates green and the annotation uniform. Both are true, and
here is what establishes it, each item run at HEAD:

- **The set is exactly right.** The 31 files carrying the annotation and the 31 the record's
  own predicate returns are the same 31, compared as sorted path lists with `diff`. Nothing
  over-reached and nothing was missed.
- **One form, one place.** All 31 lines are byte-identical outside the agent name, and in all
  31 the line sits exactly one line below `**Filed by:**`. No record in the set already carried
  a person half, so no line contradicts the one above it.
- **The citation resolves.** `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`
  is on disk and open.
- **The table reproduces.** Running the predicate independently at HEAD returns 70 in-window
  records, 25 with a person half, 14 with the reason on the line, 31 with neither. Identical to
  what the record states.
- **The reason the annotation gives is true for every record it is written on.** All 31 stamps
  fall between `260824-1621_*_the-filing-rules-residual-branch-promises-a-person-line-that-exit-5-does-not-print.md` and `260824-2155`. `bin/fusion-identity` entered the work tree in
  `3ba7a46` at 2026-08-24 11:30:31 and the installed copy carries mtime 2026-08-25 08:29. Not
  one record falls outside that window, so no record was given a reason that does not apply to
  it.
- **Gates green after the writes**, run individually: `workbench-citation-lint`,
  `reference-resolution-lint`, `plan-stopping-section-lint`.

**Where the backfill left a loose end.** `shared/issues/260825-1329_*` was not in the diff and
still quotes 28 unattributed records and 42 in-window records, against the 31 and 45 its own
cross-reference now states. Annotated rather than edited, because the measurement belongs in
the record that carries it and rewriting a body would erase the disagreement instead of
pointing at it.

## The second pass should have written a history record, and now has one

Its reasoning was that a history file would land inside the window it was measuring and would
then need an attribution line of its own. That is true and it is not an obstacle. The window
is a predicate: a record joins the measured set by lacking a person half and a stated reason,
and a file written after the helper reached the install copy at 260825-0829 carries a real
person half. It moves the total and the compliant column; it cannot move the 31. The first
pass's own record, `260825-1241-reconciliation.md`, is already in the window and
already in the compliant column, which settles it by example.

What the omission cost is not the measurement but the reach: a commit message is not in
`$SCAN_HISTORY`, so `/fusion:cadence`, `/fusion:log-activity` and every history skim miss the
pass entirely. Written as `260825-1430-reconciler-attribution-backfill.md`,
stamped at the time of writing and opening with the statement that it is retrospective. A
backdated stamp would have made a missing record look like one that was always there, which is
the substitution the backfill itself refused to make.

## The session's history file was frozen at Setup

`260825-0858-orchestrator-session.md` carried `**Directive:** (not yet stated)`,
`**Mode:** (unresolved)` and `**Status:** In progress` against a session that had resolved its
scope, run two Turns, taken a Rebalance answer from the user and produced three commits. It
also carried no session log at all.

Corrected: the three head fields, a `## Session log` section built from
`orchestrator-events.jsonl`, the commits and the records, and a second `## Coherence` section
for the full range. The first `## Coherence` section stands untouched, so both verdicts and the
change between them are visible; the appended heading carries the range because two sections in
one file cannot share an anchor.

**The Directive itself could not be recovered and was not invented.** It was written into
`agentstate.yaml`, which is class L in `rules/workbench-tracking.md`, never travels, and is
deleted on a clean exit. What survives in the event log is the *scope*, and that is what the
field now states, marked in the paragraph beneath it as a reconstruction written by the
reconciler and not by the orchestrator. It is explicitly disqualified as an input to the
Artifact↔Directive edge: derived from the same commits the edge would weigh, it would measure
nothing.

This is a write outside the reconciler's standing scope, which permits only the `## Coherence`
append on this file. The dispatch directed it. Recording that here so the widening is visible
rather than assumed.

## The six open defects are all still open, and one closed record needed a line

Each was checked against the mechanism it names, not against its own text:

| Record | Still open because |
|---|---|
| `260825-1019_*_nothing-checks-that-a-tracked-workbenchs-gitignore-matches-the-four-class-partition.md_*` gitignore partition | No step of `/fusion:setup` reads a project's `.gitignore` for anything but `.claude/settings.local.json`. The repair the answered decision commits to is unbuilt. |
| `260825-1250_*` bounded-Circle spec | `grep -c '^- \[x\]'` returns 0 and `'^- \[ \]'` returns 49. The Circle is still `_b_` and no `SCAN_*` reaches it. |
| `260825-1250_*` conditional criterion | C1's seventh is still `- [ ]` with no third notation anywhere. |
| `260825-1250_*` attribution | The criterion is a claim about agent behaviour; a retrospective correction is not agent behaviour. Reach and gate both undecided. |
| `260825-1259_*_the-rebalance-gate-mandates-four-options-and-the-output-rule-caps-a-gate-at-three.md_*` Rebalance gate | `agents/orchestrator.md:992` still says four options; `rules/user-facing-output.md` `## Questions and gates` still caps a gate at three. |
| `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md_*` helper lag | Every call site is still `"$FUSION_PLUGIN_ROOT/bin/<name>"`, and part (c) of decision `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` is still unanswered. |

**Nothing was closed in substance by the backfill without its marker moving.** The backfill
added annotation lines and corrected one measurement; it resolved no defect.

**Two records opened on statements their own commit had already falsified**, both annotated
rather than edited. `260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md_*` quotes the superseded counts. `260825-1250_*` on the
bounded Circle opens by saying the spec `carries **Status:** Draft`, when `53d656f`, the commit
that filed it, had set that header to `Partially Complete`. In both the substance is intact and
the opening line describes a tree that had already moved.

## Records written

**One defect, in `shared/issues/`:**

- `260825-1430_*_the-event-log-froze-at-turn-2-while-the-dashboard-stayed-current-inverting-the-diagnostic-six-instances-rest-on.md`

`orchestrator-events.jsonl` ends at Turn 2's `task_start` and carries no `task_done`, no
`commit` and no `turn_end` for a Turn that ended and committed 55 minutes earlier, while
`orchestrator-live.md` is correct on every field. Every one of the six previously measured
instances of session-bookkeeping freeze names the event log as *the one surface that kept up*
and the dashboard among the frozen. This session reverses the pairing, which is why it is a new
record rather than a seventh instance: it falsifies the diagnostic the family reasons from.

It also falsifies a premise of the referral that closed the class.
`260822-2236_*_the-four-session-bookkeeping-surfaces-froze-again-and-the-detection-that-closed-the-first-record-has-been-removed.md_*`'s `Resolved:` note refers the work to the backlog as a freeze detection over
the surviving surfaces, naming `turn_end` events among them. Here `turn_end` is precisely what
did not fire, and the other two surfaces it names are unavailable in a session with no Circle
and a deleted state file. A detection built to that description would report no freeze on this
session. That closed record gained a `Revised by:` line saying so; the marker stays `_c_` and
the `Resolved:` note stands unedited, per `## Inline State Tracking`.

**Not filed, and why.** The contradiction between `orchestrator-live.md` and
`orchestrator-events.jsonl` needs a rule for which one a reader believes. That is a decision
rather than a defect, and it belongs with whoever takes up the referral rather than as a
record filed beside it here. Named inside the defect's `## What to consider` so it is not lost.

**Nothing was misfiled.** No issue reviewed in this pass turned out to be a decision, and no
decision an issue.

## Review coverage

`bin/fusion-review-coverage --since a99e680` returns `commits=3`, `uncovered=3`,
`verdict=uncovered`. No `coderev` or `ontorev` pass opened any commit of this session. The one
review file it finds covers `0f5889e..3fba5c6`, a prior range.

The gap is expected rather than a lapse. `git diff --name-only a99e680..HEAD` returns 49 paths
and **zero** outside `fusion-workbench/`: 46 Markdown records, `.asset-provenance`,
`.fusion-setup` and the event log. Neither reviewer routes to a range that changes no code, no
data and no prompt. An uncovered range does not block a closure
(`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`,
option 1), and it is recorded here because it is true, not because it is a fault.

## Coherence

Verdict `review-needed`, recommendation `state Directive`, written into
`260825-0858-orchestrator-session.md` under
`## Coherence (a99e680..3d4b181, session end)` with all three edges and their evidence. Both
Directive edges read `not evaluable`, for one reason: the Directive was stated and its only
copy was deleted with `agentstate.yaml`. The Artifact↔Grounding edge is flagged on the single
drift item that stands uncorrected at the end of this pass, the frozen event log, which the
reconciler cannot repair because that surface has one writer by design and it is not this
agent.

## One residual, stated rather than left to be found

`260825-0858-orchestrator-session.md` reads four em-dashes against a ceiling of
one per 1000 prose words. All four are inherited: one in the orchestrator's own title line, and
three inside the first `## Coherence` section, which is preserved as written. My own additions
to that file and every file written in this pass measure zero, checked with
`bin/fusion-prose-metric`. Whether the ceiling is read per file or across the always-on corpus
is itself an open question the user has not met yet
(`260820-2314_*_is-the-em-dash-ceiling-read-per-file-or-across-the-always-on-corpus.md`),
and this file is not in the always-on corpus either way.

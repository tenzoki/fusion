# Orchestrator Session — 260907-0657

**Status:** In progress
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Directive:** Have the analyst check this Circle's spec rigorously; have the shaper rework it where the check finds gaps; re-check; and once the spec passes, have a plan written detailed enough to be executed autonomously.
**Mode:** custom (Phase 0b: spec review, rework loop, then planning)

## Session opening

The session began as setup-only: `/fusion:setup` ran with no Directive, so the ceremony was
deferred. The Directive above arrived after two exchanges about the project's backlog, and this
file was created at that point rather than at Setup.

**Circle activated this session.** `260906-2258-bounded-executor-dispatches` moved `_a_` → `_t_`
at 260907-0657 on the user's explicit confirmation; `.active-circle` written, claim field set to
this checkout.

## Snapshot at Setup (260906-2040)

- Git HEAD: `3639813c`
- Workbench domain: `code` (147 source files, 10 data files, counted by `git ls-files`)
- Open issues: 11 (`shared/issues`, `_o_`); in progress: 0
- Open plans: 2 (`shared/planning`, `_o_`)
- Open decisions: 11 (`shared/decisions`, `_o_`)
- Circles before this session: 3 bounded, 17 closed, 1 superseded; none anticipated, none active
- Turn budget: 12, resolved by `bin/fusion-turn-budget`, no configuration diagnostics
- Portfolio hint: not printed (0 anticipated, 0 active at Setup)
- Upstream `origin/main`: level, view 27 hours old
- Concurrent-session check: `stale` marker from 260906-0212, overwritten
- Presence: 1 further checkout of this person (`114caf11`, last seen 260831), 0 other people

## What happened before this file existed

1. The user asked what ideas were on file. Two backlog entries were reported.
2. The user asked for an explanation of the fourfold saving claim. Correction issued: the
   orchestrator had said the bounded-dispatch remedy was "adopted", which was wrong — the analysis
   recommends it and nothing is implemented. The entry stood at `_p_`.
3. The user chose to capture the idea as a Circle. `/fusion:direct` dispatched the shaper in
   anticipated-circle mode against the backlog entry path.
4. Shaper returned one clarification round of three questions; relayed; user answered `1/3/3`.
5. Circle `260906-2258-bounded-executor-dispatches` created; backlog entry closed to `_c_`.

Two verified findings were contributed to the shaper's second dispatch and are recorded in the
Circle's Grounding snapshot: the event log carries no token field and no per-tool-call event
(measured over all 2951 lines), and hard enforcement of the bound would need a hook that counts
and stops, which fusion's observation-only PreToolUse hook does not do today.

## Turn log

- Turn 1 (session 260907-0657): commits `7ed43852`..`8197f789`; Coherence verdict not taken, the
  Turn was interrupted by a planned restart before its gate; session history: this file.

  Plan steps 1, 2 and 3 landed. Step 1's verdict stopped the build on the plan's own gate and the
  user re-cut the goal after the break-even derivation reversed the sign. Steps 2 and 3 realised the
  answered decision on where the orchestrator reads the bound, both halves of option B. Two citation
  repairs and two defect records rode along.

## Why this session stopped

Not a completion and not a crash. The verification the whole build rests on stopped being
deterministic: `cd hooks && npm test` returned 911 of 911 in 35 seconds and 909 of 911 in 88 seconds
over the same tree, twenty minutes apart, with the failing cases passing in isolation. Three test
files are implicated and the failing case is not stable within a file either, so the set on record is
a sample rather than the population. Every one of the thirteen remaining plan steps is accepted by
that same command, so an executor could no longer tell its own regression from a busy machine.

Put to the user as three ways forward — repair the suite first, narrow each step's verification to
its own files, or continue and re-check by hand each time — the user chose to repair it first, and
additionally asked for a push and a restart beforehand so the concurrent session's repaired
`agents/playmaker.md` is loaded.

**`agentstate.yaml` is deliberately not deleted.** A clean exit deletes it because there is nothing
to resume; there is something to resume here. The next session's Setup will find it and offer
Continue, which re-enters at `control.paused_at_task`, `SUITE-REPAIR`.

**What a reader should know about the restart.** An agent prompt is read at session start from the
**installed** copy under `$FUSION_PLUGIN_ROOT`, never from this work tree, and it is never re-read.
Restarting alone therefore loads the old `agents/playmaker.md`. The repaired one reaches a session
only after `fusion --update`, which is why the push had to come first.

## The concurrent session

A second orchestrator ran in this same checkout for the whole of this one, on a different Circle. It
committed three times at 14:12 without this session's knowledge, including this session's own files,
and left records and a change set uncommitted twice more. Both were carried here under messages that
say whose work they are: `5d2e40bc` for three records, `8197f789` for the multi-checkout change set.
fusion has no concurrency lock and the advisory marker read `stale` at Setup, so nothing warned
either session about the other. The collision cost was not lost work but a byte budget: the
uncommitted 1 109-byte growth of `agents/playmaker.md` is what left this Circle's build 281 bytes
short and forced the cut forward into its own step.

## Rulings the user gave at the gates

Eight forks were put to the user during the spec review, each as a numbered list in chat, and each
answer is recorded here because the chat does not persist.

1. **Scope** (260907, shaper round 1) — bounded dispatches only; no claim about rule adherence.
2. **Where the bound bites** (round 1) — inside the run: the executor hands back at the bound, half
   finished, and is re-dispatched.
3. **What closure proves** (round 1) — the existing calculation counts as the evidence; only its
   assumptions are checked.
4. **What the closure check reads** (after check 1) — the law rather than the factor: does re-sent
   volume fall with the split count, and does that survive the cache effect?
5. **Currency of the free handoff** (after check 1) — the existing minutes measurement suffices; the
   limitation is written down rather than smoothed over.
6. **Unit of the bound** (after check 1) — wall-clock time.
7. **Who the bound covers** (after check 1, revised after check 2) — first "all dispatched agents",
   then narrowed: the agents with no intermediate state on disk are exempt. Applied as a criterion,
   this gives 7 bound (coder, ontocoder, bugfixer, reconciler, coderev, ontorev, curator) and 7
   exempt (analyst, consultant, editor, planner, playmaker, shaper, taskplanner).
8. **The bound's value** (after check 2) — 20 minutes flat, which touches 15 of 131 recorded
   dispatches and 13 of the 114 made by a bound agent.

Three rulings the shaper made itself were put to the user and accepted on 260907: a bounded return
is a fifth case rather than the existing "did not finish" case; the half-finished work is not
committed before the continuation; and a dispatch carrying no bound runs to its natural end.

### Which program hands the orchestrator the dispatch bound

Filed by the planner as `260907-1450_*_which-program-hands-the-orchestrator-the-dispatch-bound-at-setup.md`
because it would otherwise have had to guess. Put to the user at the plan-approval gate on 260907
together with the plan itself, and answered **Option B**: `bin/fusion-turn-budget` prints a second
`KEY=value` line rather than a new helper being added. The user chose it over Option A knowing what
it costs, namely that the helper's name then under-describes what it reads, to be corrected in the
helper's own header and in `CLAUDE.md` rather than by a rename. The deciding argument was the byte
cost against the `agents/` growth bound: about 250 bytes against about 700, out of 4 618 remaining,
plus one emission of the configuration loader's diagnostics rather than two.

### The reframe, and what it cost

On 260907 plan step 1 ran and its verdict stopped the build: the re-sent-volume law does not hold in
the form the source analysis states it. The break-even derivation that followed, chosen by the user
from the held decision's option 3, closed the sign positive — splitting pays above a run length of
about 21 minutes, $12 to $90 over the 10.99 days the machine-written log covers. Put the three ways
forward, the user answered **"ok, 1. Ziel neu fassen und dann bauen"**, and then **"1a 2a 3a"** to
the shaper's three questions: the work now stops on the byte reckoning against the `agents/` bound in
its narrow form, the cost-argument capability stays as met rather than being dissolved, and the
20-minute value gets its second justification into the source comment.

### What gives, now that the agents/ budget is 281 bytes short

Filed by the planner as `260908-0025_*_the-agents-budget-is-281-bytes-short-after-another-sessions-growth-so-what-gives.md`
after the pull-along measured the tree again: head-room fell from 4 618 to 3 509 bytes against a
budget of 3 790, and the whole 1 109-byte difference is `agents/playmaker.md`, grown and left
uncommitted by a second session running in this same checkout. Put to the user on 260908 with three
of the record's four options, the fourth withheld with its reason. The user answered **option 1**:
take the cut the plan already names up front, before step 8 rather than at step 14. Two "why this is
a rule and not a preference" narratives move out of `agents/orchestrator.md` step 3b into
`rules/commit-lock.md`, which the orchestrator receives by emission, so no reader loses anything.
What it costs is the reserve: this Circle has no second cut held back if its own budgets overrun.

## Follow-on named by the user, not yet scoped

On 260907, choosing the small third rework, the user added: *"danach agentenwachstumsproblematik
angehen"*. Read as a separate piece of work to take on **after** this Circle's plan exists, not as a
constraint folded into it.

The subject is the growth bound on the shipped agent prompts. Measured during the third planability
check: `agents/` stands 13 382 bytes above its baseline against 18 000 bytes of head-room, so
**4 618 bytes remain** before `npm test` goes red, and the documented way out of a red bound is a
cut rather than an edited baseline (`hooks/lib/__tests__/helpers/growth-bound.ts`). The bounded-
dispatch work touches eight files under `agents/`, which is why the constraint surfaced here.

Not filed as a backlog entry: no agent originates one, and the user files by hand or through
`/fusion:memo` (`rules/fusion-workbench-conventions.md` `## Backlog entries`). Recorded here so the
instruction survives the session. Put it to the user once the plan is done: capture it as its own
anticipated Circle via `/fusion:direct`, or handle it inside this one.

---

## Session resumed 260908-0806, scope changed by the user

The interrupted-session gate was answered **Modify**. The prior queue (SUITE-REPAIR, then plan
steps 4 to 16) is not being resumed in this stretch; the user redirected the session to an
unrelated delivery question and then to a concrete instruction.

**New Directive:** cut a patch release `v10.24.1` from the tag `v10.24.0` rather than from `main`,
carrying only `8197f789`, so that a consuming project can pick up the playmaker change without
publishing the in-flight message-between-checkouts work that sits in `main`.

Evidence the Directive rests on, taken this session:

- `main` stands 10 commits past `v10.24.0`; `.claude-plugin/plugin.json` still reads `10.24.0`,
  so nothing has been bumped since the tag.
- The only unreleased commit touching `agents/playmaker.md` is `8197f789`. `f8b44f27`
  (`fix(playmaker)`) is already inside `v10.24.0`.
- `8197f789` touches seven files: `agents/playmaker.md`, `rules/circle-records.md`,
  `skills/setup/SKILL.md`, two test fixtures, one lint test, and the workbench event log.

Session state carried forward unchanged: history file, session anchor `3639813c`, start stamp
`260907-0657`. Snapshot at resume: 15 open defect records, 14 open decision records, 1 active
Circle, 1 anticipated. Workbench domain `code` (147 source files, 10 data files, counted by
`git ls-files`). Turn budget 12, dispatch bound 20 minutes.

### Outcome: v10.24.1 released from the tag

Tag `v10.24.1` points at `134265a9` on `origin/release/v10.24.1`. Three commits above the
`v10.24.0` commit `3639813c`:

| Commit | What it carries |
|---|---|
| `22653f61` | the content of `8197f789` minus its workbench event-log line |
| `dcf73a8f` | the one shared record `260907-1700_*_no-agent-is-told-...` that the carried rules text cites |
| `134265a9` | the version bump, content taken from the coder-verified edit |

Verified on that tree: `claude plugin validate .` passes with the standing `CLAUDE.md` warning,
the hook suite returns 911 of 911 across 52 files, and the release tarball at
`https://github.com/tenzoki/fusion/archive/refs/tags/v10.24.1.tar.gz` answers 200 and carries the
changed `agents/playmaker.md`.

**The whole-commit route was tried first and abandoned on evidence.** Carrying `5d2e40bc` whole
brought two Circle-scoped records whose citations need the analysis from `b1e49fe0`, and that
analysis's own citation correction sits in `e1e625ae`, one of the two commits this release exists
to exclude. The chain therefore cannot be closed with whole commits without importing the excluded
work: `citation-sweep.test.ts` stayed red at 910 of 911. The minimal cut carries the one record the
shipped text cites and is green. The user ruled on both forks.

**Not covered by any review.** `bin/fusion-review-coverage --since v10.24.0` returns
`verdict=uncovered` with all ten commits above the tag uncovered, `8197f789` among them. Advisory
and not a blocker, per `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`.

**The marketplace entry was deliberately not bumped.** `/plugin install` resolves against `main`,
so advertising `10.24.1` there would serve `main`'s tree, which is the in-flight dispatch-bound
work this release exists to withhold. Delivery is `install.sh` with `FUSION_REF=tags/v10.24.1`.

**One scope violation, mine.** To measure the minimal variant quickly I edited
`.claude-plugin/plugin.json` myself on a scratch branch, which is a file this role may not edit.
The scratch branch was deleted and the released bump comes from the coder-verified commit; the
released tree hash equals the measured one, `5b28501bff731e1dfa4c97170cd6c2d5d72cb2e8`.

---

## Coherence

<!-- RECONCILER-OWNED -->

Taken 2026-09-08 by the reconciler, domain `code`, against the working tree at `43fe1bc1` and the
release branch. Session anchor `3639813c` from `agentstate.yaml`.

**Verdict:** review-needed

**Edges:**

- Artifact↔Grounding: 19 claims verified against disk — the plan's 16 steps and the Circle record's
  three head fields, each opened at the file it names — with 4 drift items and 0 open coderev or
  ontorev findings (no review pass ran this session). Plan steps 2 and 3 hold at `hooks/lib/config.ts`
  lines 187, 251, 429 and 629 and at `hooks/turn-budget.ts:121`; steps 4 to 16 verified unstarted
  at each file they name. **Flagged (Grounding at fault):** three records understated disk and were
  corrected by this pass (the plan's `Draft`/`_o_` pair, decision
  `260907-1450_*_which-program-hands-the-orchestrator-the-dispatch-bound-at-setup.md` at `_a_` with
  both commits landed, issue `260907-1939_*_the-planability-analysis-spells-a-backlog-entrys-marker-and-the-citation-sweep-gate-is-red-on-it.md`
  at `_o_` with the sweep now printing `rewrites=0`), and one remains that this role may not write:
  the Circle record's `## Turn log` is empty while `bin/fusion-events turns` reports `turns=1` and
  this file's own `## Turn log` carries that Turn.
- Artifact↔Directive: **the session's two Directives are met, and neither is met on the branch this
  anchor walks.** The resumed Directive, cutting `v10.24.1` from the `v10.24.0` tag carrying only
  `8197f789`, is realised by `22653f61`, `dcf73a8f` and `134265a9` on `release/v10.24.1`, with the
  tag pointing at the last of them. The stated Directive of the session opening, checking the spec
  and producing an executable plan, is realised by `b1e49fe0` through `223f916a`. The ten commits
  `git log 3639813c..43fe1bc1` puts on `main` move toward the active plan's own Directive
  (`e1e625ae` and `7e7708cf` are its steps 2 and 3), which the resume deprioritised rather than
  contradicted. No commit anywhere in the range moves away from a Directive this session stated.
- Grounding↔Directive: 46 active decision records across both stores after this pass, 3 in this
  Circle and 43 shared, counted with `ls | grep -cE '_[oa]_'` over each store; 0 conflicting with
  either Directive. One is worth naming because it was applied rather than merely not violated:
  `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md` governs the
  release going out over `verdict=uncovered`, and this file records the gap under
  `**Not covered by any review.**` as that record requires. The four Circle-scoped decisions all
  concern the bounded-dispatch build, which the resumed Directive set aside without ruling against.

**Rebalance recommendation:** revise Grounding

**Two things the verdict rests on that a reader should not have to reconstruct.** The plan's own
Directive is partially met, 2 of 16 steps, and the shortfall is filed rather than dropped
(`agentstate.yaml` `work_queue`, `SUITE-REPAIR` and `S4` onward at `queued`; this file's `## Why
this session stopped`). That alone would read `directive-partially-met`. It does not, because drift
was found as well, and the two verdicts are disjoint by construction: `directive-partially-met`
requires that nothing drifted. And one decision now carries an `Answer located:` line and no rename,
`260907-0820_*_is-a-token-side-measurement-of-the-splits-net-cost-worth-building.md`, whose answer
sits in `260907-2012-break-even-arithmetic-for-the-dispatch-split.md`. It needs the user's ruling
before its marker can move.

### Ruling: no marketplace release for a tag-cut patch

Put to the user at the Rebalance gate on 260908-1234 and ruled by them in the same exchange:
**no marketplace release, the tag alone.** A patch that has to bypass unreleased work on `main` is
cut from the previous tag, bumps `plugin.json` on that branch only, is tagged and pushed, and is
delivered by pinning the ref. The marketplace entry does not move, because `/plugin install`
resolves against `main` and would advertise a version it does not deliver.

One correction to the premise, made before the record was filed and carried into it. The user named
`fusion --update` as the delivery route. That command runs `install.sh` with no ref, and the default
is `heads/main` (`install.sh:34` and the launcher body in the same file), so a bare `fusion --update`
in a consuming project fetches exactly the tree this release exists to withhold. The route is
`FUSION_REF=tags/v10.24.1 fusion --update`, or the same pin on the `curl | bash` form. The ruling
stands unchanged in substance; only the incantation needed correcting.

Filed as 260908-1234_*_how-does-a-fix-reach-a-consumer-while-main-carries-unreleased-work.md in the
shared store rather than in this Circle: the question arose from the release, not from this Circle's
Directive about bounding executor dispatches.

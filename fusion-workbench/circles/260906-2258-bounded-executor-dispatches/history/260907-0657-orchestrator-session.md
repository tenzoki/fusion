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

(none yet — the session is still in Phase 0b: spec review and rework, no Turn started)

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

# A session that pushes leaves a message the other checkout reads before pulling

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Unclaimed
**Active spec/plan:** 260907-1942_*_message-between-checkouts-read-before-pull.md
**Active session history:** 260907-1659-orchestrator-session.md

---

## Directive

After this work, a session that ends and pushes offers to leave one message for whoever works this project on another checkout, and a reader there learns what arrived before deciding to pull. The message is one file per session in a store of its own, `shared/forum/`, named `YYMMDD-HHMM-<checkout>-<slug>.md`, single-writer and class R1, so it needs no merge driver and inherits none of the lost ordering a shared append-only file carries. It holds two parts under a cap of twenty lines in the file, eight of them the person's: a compact part in the chat language addressed to the person, and a pointer block in the artifact language carrying the commit range, the session history basename, the records filed by their citations in the storeless wildcard form, and one or two sentences on what the receiving side should not redo. The obligation that the person's part read plainly to somebody who never saw the session is authored in the writing step's own body, because `rules/user-facing-output.md` `## Vocabulary` exempts workbench records and a message is one; the cap is authored there too, counted in lines of the file rather than of the display, and enforced rather than hoped for. The draft goes to the user inside `/fusion:cleanup`'s single existing stop rather than at a stop of its own, so a run typed and walked away from still answers once; the body says aloud that `--skip claude-md` therefore leaves no message and that `--dry-run` puts no draft and writes nothing. The step is also reachable alone under its own `--only` selector, where it writes the file, touches git not at all, and tells the user to carry it in their next commit; in a project that is not a git repository it writes nothing and says why. One entry covers both of the pipeline's pushes, so a reader who pulls between them gets the work without its message, which is accepted rather than repaired. The reading side is the skill the user invokes as `news`. It takes no argument, fetches, works out for itself what is new by diffing this checkout's mark against the fetched ref, renders each entry by reading it out of that ref without merging the working tree, says in plain words that nothing is new when nothing is, asks before pulling, and advances the mark once it has rendered. `bin/fusion-cadence-anchor` holds that mark under a key of its own and does nothing further: its `changed-files` fixes the right-hand side of the range at `HEAD` and folds in a working-tree read, so it cannot answer what arrived from the remote and is not the delta primitive the earlier design took it for. Fetching and reading a blob out of a named ref are both new to the plugin, so the work states a time budget for its git calls, what happens with no remote and no upstream, which ref is shown when a branch has several, and how the repository-root-relative path is derived, since `bin/fusion-paths` emits workbench-relative values and the workbench root need not be the git root. An entry leaves the live store through the archive step's tier-1 bucket at the run's own age threshold, fourteen days by default, so the ordinary end-of-session run prunes it; tier-1's stated basis widens from terminal markers to terminal markers and age, in that tier's own text, rather than being left to be inferred from a new row. A checkout dormant longer than the threshold can lose an entry unread, which is the accepted cost of selecting by age. `bin/fusion-paths` gains unconditionally shared `OUT_FORUM` and `SCAN_FORUM` cases ordered ahead of `PORTFOLIO`, and four surfaces that enumerate stores or artifact kinds each gain the new one: the resolver's own header, `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` and `## Filename Patterns`, and `rules/workbench-path-resolution.md`'s key table and shared-only paragraph. `CLAUDE.md` and `README-agents.md` gain the new skill, the growth-bound golden fixture is regenerated, and the path-literal gate learns the new store name.

## Grounding snapshot

**Where this Circle comes from, and what is already settled inside it.** The design was worked out in `260907-0729-git-versioned-broadcast-slot-between-checkouts.md`, which measured the current state rather than recalling it: no push-time message mechanism exists anywhere in the plugin, and the documented state of the art is the copy-and-paste handoff `CLAUDE.md` records under the Bus-protocol convention. Four corrections to the original proposal were accepted there and are inputs to planning, not questions for it. The write step lives in `/fusion:cleanup` and not in a hook. The second part follows the artifact language through the existing cascade rather than being fixed to English. The second part is a pointer block and not a second narration of the session, because the session history file already is that and a duplicate disagrees with its original on the first edit. And the reading skill fetches rather than deciding from the store whether a fetch is owed, since nothing reads a remote file without fetching first.

**The store question was ruled by the user and the record still stands open.** `260907-0733_*_does-the-cross-checkout-message-get-its-own-store-or-two-sections-in-the-session-history.md` asked whether the message gets a store or two sections of the session history file. The user chose the store, on the audience argument the record recommends: a history file is read during archaeology and has no size discipline, while a message is read once and soon. The user then ruled on placement and name, choosing `shared/forum/` over a top-level store and `forum` over `broadcast`, because the traffic runs in both directions. The record carries `_o_` because the transition to `_a_` is the orchestrator's act alone (`260905-1042_*_may-a-dispatched-agent-perform-the-open-to-answered-transition-at-all-and-under-which-bound.md`), so relaying that ruling into the record is owed and is not part of this Circle's Directive.

**A review of this record was run before activation, and it corrected two claims this Grounding made.** `260907-0840-spec-review-message-between-checkouts.md` found the intention hit and the shape right, and found two of the Directive's reuse claims false against the implementation. Both corrections are now carried in the Directive, and the false versions are recorded here so a later reader does not go looking for a component that was never there. The first: `bin/fusion-cadence-anchor` was described as offering exactly the read-the-delta primitive this design needs. It does not. Its `changed-files` fixes the right-hand side of the range at the literal `HEAD` and adds a `git status --porcelain` read of the working tree; the caller supplies only a key and a pathspec, and no argument, option or environment variable substitutes the target. Worse than being unusable, it answers confidently and wrongly: once the mark has advanced to a fetched commit that is ahead of `HEAD`, the diff is empty and the helper reports nothing new in precisely the condition where something is. What survives of the reuse is `get` and `set` over an arbitrary key, which is a mark store. The reading skill computes its own diff. The second: the person's part was said to need no new rule because `rules/user-facing-output.md` `## Vocabulary` already forbids fusion-internal terms in anything a person reads. That section binds chat, gates and summaries and exempts workbench records by name, and a message is a workbench record. The obligation is therefore authored rather than cited, and the user chose to author it in the writing step's own body rather than open a named exception in a rule every dispatch loads.

**Fetching and reading a blob out of a ref are new to the plugin, not variations on something shipped.** No shipped surface runs `git fetch`, and none reads a file's contents out of a named ref; `git show <ref>:<path>` appears only inside instruction text. The nearest executable precedents are a test-only `git archive` materialisation and an existence probe with `git cat-file -e`, which reads no blob. Three things follow that no earlier document priced: there is no time budget convention for a git call issued from a skill body, no established behaviour for a checkout with no remote or no upstream, and no rule for which ref is shown when a branch tracks several. A fourth is sharper. The path handed to `git show` must be relative to the repository root, and `bin/fusion-paths` emits workbench-relative values while the workbench root is the setup marker's directory and need not be the git root, a divergence `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` states outright. Nothing today derives one from the other.

**Retention was redesigned against the archive mechanism as it exists, and the earlier answer was inoperative.** The consultation and the first Directive called a thirty-day tier of its own an addition to an existing pass. Three measured facts refute that. The archive step parses one age threshold per run and applies it to every aged bucket, so no per-store number is expressible. `/fusion:cleanup` runs tier-1 only and autonomously, while every age-selected bucket today sits in tier-2 or tier-3, which a human starts by hand, so a bucket placed among its peers would never fire in an ordinary run and the store would grow exactly as feared. And a message carries no state marker, so age is the only signal that can select it. The user ruled that fourteen days is acceptable, which puts the bucket in tier-1 at the run's own threshold and makes it that tier's first age-selected member; the tier's own text is widened accordingly, since a row alone would leave the heading claiming something the table no longer does. Filed as `260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md`.

**The approval sits in the pipeline's one existing stop, and two flag consequences come with it.** `/fusion:cleanup` holds the user exactly once and holds them last on purpose, so a run typed and walked away from completes everything but that one answer (`260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md`). A stop of its own for the message would reinstate the second answer that record was filed to remove. The user chose to fold the message draft into the existing stop, accepting that `--skip claude-md` then leaves no message at all and that `--dry-run` puts no draft, both of which the skill body must say aloud rather than leave to be discovered. Filed as `260907-0902_*_where-does-the-message-approval-sit-now-that-the-cleanup-pipeline-has-exactly-one-stop.md`. Both decision records carry `_o_` with the user's ruling written into them, and the relay to `_a_` is owed to the next orchestrator session alongside the store record above.

**Six further points were settled with the user on 2026-09-07, each of which decides what somebody types or sees.** The reading skill is `news`, chosen over the consultation's `hark` because the word says what it does. It takes no argument: one command, one behaviour, and anything already read is found by opening the files. When nothing is new it says so rather than printing an empty result. The read mark advances after rendering, so an interrupted run does not show the same message twice, at the cost that a message seen and then abandoned does not come back. The cap is twenty lines with eight for the person's part, counted in the file rather than on the display, since a body can only enforce what it can count. And the standalone selector writes the file, touches git not at all, and tells the user to carry it in their next commit, which keeps every step but the two committing ones out of git as they are today.

**One naming residual, stated rather than smoothed over.** The user types `news` and the files sit in `shared/forum/`. The store name was ruled separately and earlier, and one name per thing is the standing style rule, so the divergence is a live inconsistency rather than a subtlety. It is left as it stands because both names are the user's own and neither ruling was made in ignorance of the other; whoever plans this Circle should put the reconciliation to the user once rather than pick a side.

**Two costs are now numbers rather than warnings.** The shipped skill bodies carry a growth bound measured at HEAD `3639813c` with about 13 000 bytes of head-room, and a file with no baseline entry spends its whole size as growth, so the reading skill, the cleanup step and the archive rule share that budget between them; the twelve shipped bodies run from roughly 6 000 to 52 000 bytes, which puts this one near the small end. Two enumeration gates assert both directions between the skill directories and the text that lists them, so `CLAUDE.md` and `README-agents.md` are edits the work owes rather than documentation it may defer, and the growth-bound golden fixture is regenerated by a run that deliberately fails so it cannot be left green.

**What must not move.** The read mark stays in `.cadence-anchors`, class L, which never travels, because a pulled mark would claim a read another checkout performed. Every citation in a pointer block takes the storeless wildcard form: the workbench citation gate recomputes its corpus from the tree on every run and carries no approvable baseline, so one store-prefixed citation in one message turns the suite red for everybody. And the design itself is not reopened: the store over history sections, the single-writer file over an append-merged log, the placement under `shared/` over the workbench root, the pointer block over a second narration, and the rejection of a hook on both the undecidable-trigger ground and the no-model ground were each argued from measurement and each held under review.

**Two operating constraints decide how this Circle can be proved.** A skill added in a session is not invocable in that session, because the roster is read from the installed copy at session start and never re-read, so the proof run belongs to the next session after `fusion --update` and a restart. The same holds one level down for any `bin/` helper this work adds, whose call sites take their `[ -x ]` miss branch until then (`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`).

## Dependencies

- `260823-0023-settle-what-travels-between-checkouts`, which established the four-class split this store is classified against, and the union merge driver whose lost ordering is the reason this store is single-writer per file rather than one appended log.
- `260904-1619-tracked-checkout-registry-names-each-instance`, the registry that turns the eight hex characters in an entry's filename into a name a reader recognises. Not a precondition: an unregistered checkout renders as its hex, which is the documented fallback.

## Turn log

- Turn 1 (session 260907-1659): commits abcaa823..9d99b19d, 12 of them; Coherence verdict review-needed (the plan's own head-room row measured five files where the bound measures three); session history: 260907-1659-orchestrator-session.md. All 13 plan steps done. Four decisions reached _i_. Three filed open: the Directive-pointer conflict, a stale cross-reference, and two descriptions of the cleanup run order that this session's own reordering left behind. Review coverage: 12 commits, no review yet.

## Activation proposal

**Proposed activation:** 260907-1507. **Playmaker run:** `260907-1507-playmaker-direct-dispatch.md`
(direct dispatch, domain bias `code`).

This Circle is the only anticipated one in the portfolio, and it is ready on every signal this run
measures. Both entries in its `## Dependencies` resolve to Circle directories whose records carry
`_c_`: `260823-0023-settle-what-travels-between-checkouts`, which the record cites for the
four-class split this store is classified against, and
`260904-1619-tracked-checkout-registry-names-each-instance`, which the record itself marks as not a
precondition because an unregistered checkout renders as its hex. Of the six marker-carrying
records the `## Grounding snapshot` cites, one is terminal — the issue
`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`
carries `_c_` — which is one of six and well under the half that would warn. HEAD stands 3 commits
past `3639813c`, the commit the snapshot records for the skill-body growth bound, so the head-room
figure that sizes three of this Circle's file additions should be re-measured before the first Turn
rather than taken from the record. Three cited decisions carry `_o_`:
`260907-0733_*_does-the-cross-checkout-message-get-its-own-store-or-two-sections-in-the-session-history.md`,
`260907-0902_*_how-is-the-message-stores-retention-expressed-against-an-archive-step-with-one-threshold-per-run.md`
and `260907-0902_*_where-does-the-message-approval-sit-now-that-the-cleanup-pipeline-has-exactly-one-stop.md`.
Quoting the record's own `## Grounding snapshot`: "Both decision records carry `_o_` with the
user's ruling written into them, and the relay to `_a_` is owed to the next orchestrator session
alongside the store record above." So the three open records are a relay the activating session
performs, not three questions the Circle still has to answer.

## Closure note

**Closed coherent 260908-1120**, session history `260907-1659-orchestrator-session.md`,
range `abcaa823..HEAD`.

**The Directive is met.** A session that ends and pushes offers to leave one message, and a
reader on another checkout learns what arrived before deciding to pull. The store is
`shared/forum/`, the command is `news`, and the divergence between those two names is the
user's own ruling, given at activation and not reopened by planning. Thirteen plan steps, four
decisions realised and cited to the commit that realises each, and one real entry written by
following the shipped body by hand rather than by describing what it would do.

**The Phase-3 verdict was review-needed, and the drift was in the plan rather than in the work.**
Its Current State table recorded 9 737 bytes of free always-on rule space where 4 498 were free,
because it summed five files while the bound measures three. The user chose to repair the cause:
the baseline comment that made the misreading reasonable now states what the bound measures, read
from `bin/fusion-rules` and the bound's own computation rather than from either comment.

**One stopping clause is unmet and cannot be met by the session that built the work.**
`/fusion:news` has never been invoked as a slash command, because the command roster is read once
at session start from the installed copy. The clause says so, the proof run reports it, and the
plan's release precondition forbids a tag until it is answered yes in writing. v10.25.0 is
prepared and deliberately untagged.

**Review coverage.** One pass, at this closure, over `abcaa823..07ca022d`: 24 commits, of which
seven arrived through the merge from a concurrent checkout and would otherwise have been reviewed
by nobody, each side assuming the other had looked. No critical finding. One high: with a workbench
a project does not track in git, the feature answers `new=0` forever and no state names it, so it
is inert and silent in a configuration fusion supports. Five of the seven findings are one class,
the mechanism deciding a narrower question than the feature asks with the residue falling into the
success branch. The pass declares its `**Not-opened:**` list, which is the next pass's scope.

**What this Circle leaves open**, and none of it blocks the closure: nine defect records and one
decision. The decision is `260907-2003_*_what-does-the-directive-pointer-swap-do-when-the-cited-plan-declines-to-restate-the-directive.md`,
filed when the head-field rule obliged a swap that would have deleted the only statement of this
Circle's Directive; the field was written, the prose left standing, and the conflict recorded
rather than resolved by hand.

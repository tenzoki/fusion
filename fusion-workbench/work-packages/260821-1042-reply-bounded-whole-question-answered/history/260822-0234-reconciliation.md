# Reconciliation — 260822-0234

**Agent:** reconciler, domain `code`
**HEAD:** `05b46f2`. **Session anchor:** `084c626`. Eleven commits in the range.
**Working tree:** two machine-written files modified (`fusion-workbench/.fusion-setup`,
`fusion-workbench/orchestrator-events.jsonl`); nothing else.
**Scope:** final pass before `260821-1042-reply-bounded-whole-question-answered` closes,
plus the three-edge Coherence verdict written into
`260822-0019-orchestrator-session.md`
`## Coherence`.

## Counts

| | Reviewed | Updated |
|---|---|---|
| Plans | 1 Circle, 6 shared | 1 (reconciliation entry appended) |
| Defect records | 22 Circle, 102 open shared | 4 annotated, 1 filed |
| Decision records | 6 Circle, 18 active shared | 1 annotated |
| Review files | 4 Circle | 0 rewritten; findings tallied against the records they produced |
| Marker moves | — | **none**: every marker on disk matches the tree |

No marker was renamed. That is the finding rather than the absence of one: every `_c_` in this
Circle is backed by a fix that landed, and the three records left `_o_` are each open for a stated
reason checked below.

## What was verified against the tree

**The plan's closure is earned.** `260821-1805_*_plan-reply-bounded-whole-question-answered.md`
carries `**Status:** Complete`, six `[DONE]` steps and the `_c_` marker, and all three agree with
the tree. Each step was re-checked at HEAD rather than inherited from the 260821-2349 pass, because
eleven commits landed between them. The per-step table is in that file's `## Reconciliation Log`.

**Five of the six stopping criteria hold. One is unmet and unmeetable.** The four growth bounds,
measured by summing each test's own baseline map over the current tree:

```
always-on rule set    95 064 bytes  budget 98 573   3 509 free  (anchor e764637: 3 507)
agents/*.md          416 205 bytes  budget 417 843  1 638 free  (anchor: 1 638)
skills/*/SKILL.md    240 409 bytes  budget 240 439     30 free  (anchor: 30)
hook test suite       20 360 lines  budget 20 375      15 free  (anchor: 21)
```

`cd hooks && npm test` exits 0, 40 files and 718 tests. The hook-test surface stands six lines
closer to failing than at the anchor, which is the criterion's second half and is unmet.
`git diff --stat 084c626..HEAD` shows tonight's commits touched no file under `hooks/`, so the six
lines were spent in the previous session and nothing tonight moved them either way.

**The four voice-profile files.** Both plugin/workbench pairs byte-identical (`diff -q` silent).
Net delta per file against `e764637`: `chat-voice-en.yaml` 6 876 → 6 743, `chat-voice-de.yaml`
7 480 → 7 306, `rules/user-facing-output.md` 20 144 → 20 142. Every per-commit byte claim in the
four profile commits reproduces exactly: `dce8894` −10 / −2, `dbf259a` −93 / −89 (364 across four
files), `746ae4d` −8 / −10.

**The version-gap figures.** `git rev-list --count v10.4.0..084c626` returns 48, the manifest still
reads `10.4.0`, `git diff --stat v10.4.0..HEAD -- bin/fusion-rules` shows 22 lines, and
`bin/fusion-prose-metric` is absent from the installed plugin's `bin/`. All four claims in
`260822-0035_*_two-installed-copies-...` and in commits `c53a903` and `055585f` hold.

## The three records that stay open, checked one by one

**`260821-2204_*_a-growth-bound-lost-half-its-head-room-...` — properly open.** Its figure
of 15 lines reproduces at HEAD. What it now holds is not an unapplied fix but a statement the
closure note has to make, and it survives the Circle to say so. Annotated with the re-measurement
and with the fact that nothing tonight touched `hooks/`.

**`260821-2004_*_what-happens-to-the-directive-...` — properly open, and the
non-answer was the right call.** No answer exists in any analysis, plan or decision store, so the
marker is correct rather than stale. Detail under "Decision 260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md" below.

**The four profile findings in `shared/issues/` — all four properly open.**
`260822-0115_*_the-german-chat-profile-names-the-referent-three-ways-where-the-english-names-it-once.md` (the German profile names one referent three ways), `260822-0118_*_ai04-denotes-two-different-rules-in-the-two-profiles-a-prose-agent-loads-together.md` (`AI04` denotes two
different rules across the two profile families), `260822-0119_*_the-prose-metrics-worked-exhibit-reports-six-em-dashes-in-a-file-that-carries-four.md` (the prose metric's worked exhibit
reports six em-dashes in a file carrying four) and `260822-0120_*_the-german-blacklist-forbids-an-ordinary-connective-where-the-english-forbids-a-discourse-marker.md` (a German blacklist entry bans a
working connective). Each carries severity, affected lines, routes it declines to choose between,
and a provenance paragraph; none has a fix in the tree. Three are pre-existing and correctly shared.
One is not: see "One placement question" below.

## Decision 260821-2004_*_what-happens-to-the-directive-when-the-plan-a-circle-runs-on-deliberately-does-not-state-one.md: the deliberate non-answer

**I agree it should not have been answered, and the recorded reason is weaker than the available
one.** The reason in `agentstate.yaml` task T5 is that answering freezes a normative answer into a
record that goes terminal tonight and is then never editable. That premise is about the *Circle*
record. A decision record inside a closed Circle carries no such bar, and nothing in
`rules/fusion-workbench-conventions.md` `## State Markers — decisions` forbids moving this file's
marker after its Circle closes. So the stated ground does not carry the conclusion.

The conclusion holds on a ground the Circle's own Grounding already records. The answer binds every
future Circle whose planner writes a plan of this shape; option 1 additionally spends bytes in
`rules/circle-records.md`, inside the always-on set with 3 509 bytes left; and
`260821-1042-reply-bounded-whole-question-answered` `## Grounding snapshot`
records that a decision of exactly this class, filed open and answered by an orchestrator in an
unattended run, was **overturned by the user on 2026-08-21**. One reversal of the same class inside
the Grounding of the Circle now asked to repeat it is the argument.

**What it costs, and where the cost has to be discharged.** `**Active spec/plan:**` stays
`(none yet)`, so a reader of the terminal record cannot see the plan the Circle ran on. Under the
rule as written that is internally consistent, because the record's `## Directive` holds prose if
and only if that field reads the literal. The mitigation is that the closure note names the plan.
If Phase 4 does not name it, option 3 of that record has been taken by default rather than chosen.

## The verbosity record: leave it open, and the reason is findable

**Agreed, and the reason is recorded in the record itself**, which is where a later reader will
find it: the 260821-2349 reconciliation note in
`260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
gives both halves at length, and Turn 2 of tonight's session log states it again. It is not held
only in a session log or a chat reply.

The mechanical half of that reason is now gone: `53ff99f` repaired the two citations that spelled
this record's marker literally inside the citation gate's corpus, so nothing blocks the rename
except the substance. Leaving it open is a judgement now, not a wait, which is the stronger
position.

**One claim in that note is now too weak and was corrected in place.** It says re-running the frozen
baseline "is one command". Running it is; reading the result is not. Section 7 of
`260822-0035-three-before-figures-and-the-after-measurement-defined.md` sets the
requirement at twenty unprimed sessions from a measured design effect of 1.56, and puts ten points
of movement at about 110. The price of waiting is now known rather than assumed.

## What the commit messages and history files claim, and what the tree says

Eleven commit messages, eight agent logs and one session log were checked. **Every numeric claim in
the eleven commit messages reproduces.** The byte deltas, the 48-commit version gap, the 22 lines of
`bin/fusion-rules`, the 20 360-line surface and its 15 lines of head-room, the three respelled
citations in `05b46f2`, the dated correction note now standing in the briefing at
`260822-0010-...md:52`. Nothing was presented as checked that was not.

Three discrepancies were found, all in the session log rather than in the commits, and all filed as
`260822-0234_*_the-session-log-stops-one-commit-and-one-turn-short-and-its-head-still-says-the-directive-is-unresolved.md`:
the eleventh commit `05b46f2` (its own trailer reads `Turn: 4`) appears nowhere in the log; `## Turn 3`
says three review findings closed where its three commits closed five; and the head still reads
`**Directive:** (not yet resolved)` although Turn 1 resolved it.

**One transient inconsistency that resolved itself and is recorded here rather than filed.**
`c964062` renamed `260822-0116_*_the-fold-of-the-version-gap-records-...` to `_c_` in a commit that
changed **zero bytes** of that record and did not carry its fix; the fix and the `Resolved:` note
landed one commit later in `055585f`. The end state at HEAD is correct. It is the same
marker-ahead-of-the-tree class this Circle has caught repeatedly, at its smallest size.

**Review coverage.** `bin/fusion-review-coverage --since 084c626` reports 11 commits, 3 reviews,
6 uncovered, verdict `uncovered`. Filtering to commits touching shipped files, which is option 3 of
`260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
and is not implemented in the helper, leaves **one**: `746ae4d`, which edits the two shipped
`stilwerk/chat-voice-*.yaml`. Under option 1 of that same record, in force since 2026-08-16,
coverage is advisory and the closure note names the gap. It should name that commit.

## One placement question, raised and not acted on

`260822-0118_*_ai04-denotes-two-different-rules-...` sits in the shared store. Its
load-bearing half was **caused by this Circle**: `git log -S'Mechanical enumeration' --
stilwerk/chat-voice-en.yaml` returns exactly one commit, `1daf063`, inside this Circle, and it is
what widened chat `AI04` from the three-part figure to enumeration generally, which is what made the
two profile families denote different rules under one id. Under the Origin Rule the record belongs
in the Circle's own store.

Nothing was moved. The record also inventories five pre-existing English name-only divergences that
are shared by origin, so one file covers both origins; splitting it to satisfy a placement rule
would cost more than the misplacement does, and moving it into a Circle that goes terminal tonight
would bury it. The origin is recorded on the record instead.

## What was not touched

`260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md`, per the Circle's
own scope. The four review files, per the no-rewrite rule; four of their pointer citations now name
markers that have moved, all four inside review files, which sit outside the citation gate's corpus
and are already covered as a class by `260818-1637_*_no-gate-resolves-a-path-line-citation-...`
and `260811-2105_*_circle-records-carry-the-same-silent-citation-form-...`.

## Records written or annotated

| File | What |
|---|---|
| `circles/260821-1042-.../260821-1805_*_plan-...md` | reconciliation entry: per-step verification, the six stopping criteria, the four bounds |
| `circles/260821-1042-.../260821-2204_*_a-growth-bound-...md` | re-measured at HEAD, confirmed open |
| `circles/260821-1042-.../260821-2004_*_what-happens-...md` | confirmed open, the non-answer endorsed on a corrected ground |
| `circles/260821-1042-.../260822-0234_*_the-session-log-stops-...md` | **new** — the three session-log discrepancies |
| `260812-0253_*_agents-answer-a-question-...md` | stays open; the "one command" claim corrected |
| `260822-0118_*_ai04-denotes-two-different-rules-...md` | Origin Rule note, no move |
| `260801-1020_*_plane-mirror-circle-closed-with-empty-turn-log.md` | `Also seen:` — this Circle's `## Turn log` is empty and about to go terminal |

## One thing this pass broke and repaired before finishing

The new record filed above spelled five citations in a truncated form (`260822-0116_*_the-after-runs-records-per-session-arm-...`). `hooks/lib/__tests__/workbench-citation-lint.test.ts` recomputes its corpus from the tree on every run and reads a truncated pointer as a pointer that resolves to nothing, so `npm test` went red on five violations in one line of a file nobody had compiled. Repaired by restating the five as stamps and subjects in prose rather than as addresses, which is the remedy `rules/fusion-workbench-conventions.md` `## Marker globs` prescribes for a token that states something about a citation instead of pointing at one. `cd hooks && npm test` exits 0 afterwards, 40 files and 718 tests, and was run before and after to be sure the pass left the suite where it found it.

# fusion's user-facing documentation agrees with the plugin at v8.1.0

---
**Domain:** code
**Status:** bounded
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** 260813-1820_*_documentation-matches-shipped-plugin.md
**Active session history:** 260813-1815-orchestrator-session.md

---

## Directive

Every documentation surface a fusion reader consults describes the plugin as it actually
behaves at v8.1.0, over the bounded list of defects the survey established, and the two
claims that a machine can derive stop being prose. `docs/working-model.md`,
`docs/philosophy.md` and `skills/help/SKILL.md` name the backlog store, `/fusion:direct`
and the Circle-first placement rule, so that fusion's only in-session documentation
surface knows the release that shipped them. `README-agents.md` becomes a table the reader
can trust rather than a table with five known defects removed: all sixteen agent rows are
read against their agent prompts, the four confirmed defects are corrected, and the file
gains a dispatch-parameter table naming every run-time parameter an agent accepts, since
opening all sixteen prompts is what produces that roster anyway. `README.md`'s
configuration section describes the three configuration layers that exist and names the
two knobs it omits. `derivable-enumerations-lint.test.ts` derives the `bin/` helper roster
from the tree, so the inventory table in `CLAUDE.md` cannot drift again, and the
hand-written count of tracked workbench files at `CLAUDE.md:51` is deleted rather than
corrected. `docs/plane-setup.md` has its command forms and configuration fields verified
against `bin/fusion-plane`, and says in this record that its troubleshooting prose was not
verified.

**What this Circle is not.** It is a correction against a known list, not a documentation
rewrite. Three of the six leads the survey investigated came back clean and stay closed:
the four version surfaces all read 8.1.0, the removal of the guard's protected-path half
is described accurately everywhere it is described, and the citation lint resolves every
citation in scope. No step re-verifies them.

**The four passages that wait on the playmaker Circle.** This Circle interleaves with
`260813-0858-playmaker-maintains-backlog-store` rather than queuing behind it.
Everything above proceeds now except the prose that states what the playmaker *does to*
backlog entries, which that Circle is about to change. Named exactly, so that the boundary
is not argued at execution time:

1. `README-agents.md:40`, the `playmaker` row — the Role column's clause beginning "also
   consolidates the shared backlog store", and the Writes column, which will need the
   backlog store added once the playmaker holds a write key to it.
2. `CLAUDE.md:51`, the `fusion-workbench/` Layout row — the parenthetical clause "the
   playmaker consolidates and ranks them, no agent files one". The rest of that same line
   proceeds, including the deletion of the tracked-file count, which sits in it.
3. `docs/working-model.md` §1 (lines 7–24) and §5 (lines 87–103) — the backlog store,
   `/fusion:direct` and the idea-to-Circle path are introduced now; any sentence stating
   what a playmaker run does to an entry waits.
4. `skills/help/SKILL.md` topic 2, items 2 and 3 (lines 55–69) — the two missing entry
   points and the backlog store are added now, on the same boundary as item 3.

The test that separates the two halves is uniform: a sentence saying the store exists, what
it holds, and how a user reaches it proceeds; a sentence saying what the playmaker does to
an entry waits. Those four passages are picked up when the playmaker Circle closes.

## Grounding snapshot

**The bounded list this Circle works from** is
`260813-0828-documentation-staleness-survey.md`, fifteen findings across
four work groups, each row carrying both sides of the claim with line citations. The defect
record `260813-0825_*_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
states the acceptance conditions and defers to the survey wherever the two differ. Both are
cited rather than restated, so one list stays authoritative. A sixteenth defect was found by
the seam analysis while it was checking something else:
`README-agents.md:29` describes `coderev` as reviewing "Go / TS / Python code" where
`agents/coderev.md:3` says "application code, prompts, build/packaging, and tooling".

**The shape of the drift.** Nine of the fifteen findings are one omission with one cause.
The v8.1.0 documentation commit `0978e9a` touched `CLAUDE.md`, `README.md` and
`README-agents.md`; the feature reached seven surfaces. This is a process observation as
much as a content one, and it is the reason the Directive names the surfaces rather than
the defects.

**The method constraint, and it binds every step.** A documentation defect is confirmed by
reading both sides, never by a match count. The defect record's `## Withdrawn claim`
section documents what the alternative produces: the first version of that record claimed
`README-hooks.md` still describes the removed guard mechanism as live, on the evidence of
thirteen `grep -c` hits that were never read. All thirteen are past tense or explicitly
labelled removed history, `README-hooks.md` is one of the best-maintained documents in the
set, and acting on the finding would have rewritten correct prose into something worse.
This Circle will grep heavily across sixteen agent prompts and nine documents, which makes
it the most exposed of any to that failure. The constraint is not advice. A step that
reports a count without a reading has not done its work.

**Why all twelve unverified `README-agents.md` rows get opened.** The survey confirmed four
rows — shaper, planner, playmaker, editor — and left twelve unread. The one row checked
incidentally by a second analysis, `coderev`, was already wrong. One defect in one
incidental sample is weak evidence about the remaining eleven and sufficient evidence
against a cheaper option, and the user chose the full pass on exactly that ground. This is
the Circle's largest single piece of work.

**The dispatch-parameter table, folded into the same pass.** Run-time dispatch parameters
are documented today only in a `CLAUDE.md` bullet (`CLAUDE.md:56-60`) that no consuming
project's reader ever sees, and one of them halts its agent when omitted. The survey
counted five parameters across four agents and noted that `CLAUDE.md`'s own bullet omits
the planner's `**Circle:**`. A grep in this session found parameter declarations in five
prompts: `agents/planner.md` (`**Domain:**`, `**Executors:**`, `**Circle:**`),
`agents/taskplanner.md` and `agents/reconciler.md` (`**Domain:**`), `agents/editor.md`
(`**Deliverable language:**`), and `agents/shaper.md`, whose four mode-contract lines
(`**Mode:**`, `**Draft:**`, `**Circle file:**`, `**Parent task:**`) are a parameter family
the bullet does not count at all. The exact roster is established by reading all sixteen
prompts, not by carrying either count forward. That is this Circle's own method constraint
applied to its own Grounding.

**Two claims become derivable instead of prose, and one of them is deleted.**
`hooks/lib/__tests__/derivable-enumerations-lint.test.ts` already derives four enumerations
from the tree: the skill roster, the agent counts, the always-on rule list, and the
conditional emission sets. Adding the `bin/` helper roster to it fits that existing
abstraction rather than introducing a new mechanism, and it is smaller and more durable
than correcting the table by hand. `CLAUDE.md:51`'s claim of 612 tracked workbench files
against a measured 1023 takes the other treatment: **the count is deleted, not corrected
and not gated.** A hand-written count of a directory that grows every session is a
maintenance obligation nobody asked for, and the sentence around it makes its point without
a number. Deleting a claim is a legitimate fix. The next reader will otherwise try to
restore it with the right number, so the record says this here rather than leaving the
deletion to be read as an oversight.

**The seam on `docs/plane-setup.md`, drawn by the user.** The document is 466 lines and the
survey checked it by grep only, so all of it is unverified. This Circle verifies the part a
reader copies and runs: command forms and configuration fields, against `bin/fusion-plane`.
It does not verify the troubleshooting prose, which a reader consults for orientation, and
**that residual is stated here so it is not later mistaken for coverage.** The same seam,
between an answer a mechanism can measure and one a human wrote, is the subject of
`260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md`.

**Coverage gaps inherited from the survey.** Four things were never examined and are not in
scope unless a step trips over them: no rule file under `rules/` was audited for staleness,
`README-hooks.md` was read only in part, `install.sh` was read only in its header, and no
claim was tested against a consuming project rather than this repository. A documentation
row can be correct while the rule file it points at is stale, and nothing here would see
that.

**Out of scope.** `260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`
records three test failures reproducing at HEAD in `circle-stash-git-exclusion.test.ts` and
`fusion-plane.test.ts`. That is a code defect, filed by the survey and explicitly not this
Circle's work. The gate extension in this Circle must not be blocked on it.

**Sequencing that follows from the survey's four groups.** The five mechanical one-line
edits and the gate extension can land in one Turn without a user gate, and running the gate
after the edits gives a green first run. The reference corrections want a reader. The prose
rewrites are where the time goes and where a reviewer earns its dispatch. The full
step split is in the survey under `## Proposed step split` and is not restated here.

## Dependencies

- `260813-0858-playmaker-maintains-backlog-store` — **ordering, interleaved.**
  That Circle changes the playmaker's backlog behaviour; this one documents it. Its own
  `## Dependencies` section states that it blocks a documentation Circle and asks for that
  Circle's directory name to be added once it exists. This is that Circle:
  `260813-0910-documentation-matches-shipped-plugin`. The relationship is not a
  full block. Only the four passages named in the Directive wait; everything else proceeds
  in parallel.
- `260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`
  — **cited, not waited on.** The record asks whether `/fusion:help` should answer from the
  live installation instead of routing into shipped prose. If it is answered that way, part
  of what this Circle rewrites by hand in `skills/help/SKILL.md` stops being prose at all.
  This Circle does not wait for the answer and does not pre-empt it; it brings the current
  router's prose current, which is option 1 in that record and is compatible with every
  other option.

## Turn log

- Turn 1 (session 260813-1815-orchestrator-session.md): commits 6590cd5..79ec7bb (90037eb, 0b20859, 79ec7bb); steps 1-3 done (README-agents dead references, CLAUDE.md inventory/deletion/playmaker clause/byte claim, bin/ roster lint); coderev filed 7 issues, 1 medium 6 minor, none blocking; Coherence verdict coherent; session history: 260813-1815-orchestrator-session.md
- Turn 2 (session 260813-1815-orchestrator-session.md): commits 28f3029..22f892e (9a11254, 5d51abd, 22f892e); steps 4-5 done (shaper/planner rows and the Turn-budget diagram, README.md configuration section and tuning table); 5 issues from Turn 1 closed and re-verified as holding; coderev filed 5 new issues, all minor; Coherence verdict coherent
- Turn 3 (session 260813-1815-orchestrator-session.md): commits 22f892e..93388bc (8d87192, 93388bc); step 6 done (sixteen agent rows read against their prompts, twelve corrected, dispatch-parameter table added, the planner's domain claim corrected on three surfaces); 2 issues closed; coderev filed 6 new issues, 1 high 3 medium 2 low, and re-read nine rows independently; Coherence verdict coherent
- Turn 4 (session 260813-1815-orchestrator-session.md): commits 93388bc..22f2353 (a489966, 27af85a, c663a1f, 22f2353); steps 7-9 done (working-model Circle-first flow and second walkthrough, philosophy traceability, help skill entry points), plus the skill-body pass closing 3 roster findings; coderev filed 6 new issues, three of them in the prose this Turn wrote; Coherence verdict coherent
- Turn 5 (session 260813-1815-orchestrator-session.md): commit c0e4219; six findings closed, all of them sentences this Circle's own prose introduced in Turns 3 and 4, each corrected against the artifact it names; step 10 (docs/plane-setup.md) deferred by user choice at the Turn 4 gate; Coherence verdict coherent; Turn budget reached

## Closure note

Closed at Bounded Closure on 260813 by session `260813-1815-orchestrator-session.md`, after five Turns and sixteen commits. The Phase 3 verdict was `review-needed` with a recommendation to revise the Artifact, **not** a Bounded Closure proposal. The user chose Bounded Closure at the Rebalance gate because the Turn budget was spent at 5 of 5 and the remaining work is a fresh unit rather than a correction to this one. That reason is recorded here because it exists nowhere else: the reconciler's own verdict says the opposite, and a later reader comparing the two would otherwise find a contradiction with no explanation.

**What the Directive reached.** Nine of the plan's ten steps landed. `README-agents.md` is a table whose sixteen agent rows were each read against their prompt and resolver key set, fifteen of them corrected, and it carries a new dispatch-parameter roster established by reading sixteen prompts and sixteen skill bodies rather than by carrying either earlier count forward. `CLAUDE.md`'s helper inventory is complete and derived from the tree by a gate, so it cannot fall behind again; its tracked-file count is deleted rather than corrected, and its byte budget states a stamped past measurement instead of a present floor. `README.md` describes the three configuration layers that exist. `docs/working-model.md` carries the Circle-first placement rule, the backlog store, and a second walkthrough for the path from an idea to a Circle. `docs/philosophy.md` and `skills/help/SKILL.md` name the two entry points a reader could not previously find.

**What it did not reach, and this is the Bounded Closure Artifact.** Step 10, the verification of `docs/plane-setup.md` against `bin/fusion-plane`, was never begun: `git log 267a65c..HEAD -- docs/plane-setup.md` returns nothing. At the Turn 4 gate the user chose five review findings over it, and the budget ran out. The Directive promises that verification, so the promise is unmet. It is filed as `260813-2305_*_the-directive-promises-plane-setup-verification-and-step-10-was-deferred-with-no-record.md`, which carries the step's scope and the user's seam between a reference claim and a troubleshooting one.

**What was learned that the Directive could not have stated in advance.** Two things, both measured rather than reasoned.

First, the method constraint holds when a step audits someone else's text and slips when a step authors its own. Every one of the six findings closed in Turn 5 was a sentence this Circle had written that hour without checking it against the artifact it described, including a claim that the orchestrator creates a Circle when no shipped prompt creates one. The constraint was written for the auditing case; the authoring case is where it was breached. The orchestrator then breached it once more at this very closure, asserting this note had been written when the edit had silently matched nothing, caught by the playmaker at the portfolio refresh.

Second, a documentation defect found by reading a prompt is a different population from one found by reading a skill body. Step 6 read sixteen agent prompts and no skill body, and every table defect it left behind lay in what a prompt alone cannot answer: who dispatches a parameter. The Turn 3 review diagnosed it and the same omission recurred one Turn later in a different file. A pass over sixteen prompts is not a pass over the plugin.

**What is left standing.** Nine defect records open in this Circle, plus the step-10 record filed at Phase 3. Every one was filed during this session, and the reconciler re-reproduced each at HEAD with a `Reconciled:` line naming what was read. Two decision records open: whether the planner should accept the domain parameter three surfaces promised it, and how fusion's own documentation treats a hand-measured number that decays. One commit, `c0e4219`, is unreviewed; five further commits touch only the workbench.

**Consequence for the release.** The 8.2.0 version bump was deferred at the preceding Circle's release gate so that one release would carry both Circles. This one closes bounded rather than coherent, so whether that release goes out over an unmet Directive promise is the user's call and is not answered here.


## Activation proposal (playmaker run 260813-1623-playmaker-direct-dispatch.md)

**Recommended for activation — playmaker run 260813-1623-playmaker-direct-dispatch.md (trigger: direct-dispatch, domain bias
`code`).**

**What changed since the run at 260813-0926-playmaker-direct-dispatch.md, which ranked this Circle second.** Its one dependency,
`260813-0858-playmaker-maintains-backlog-store`, closed coherent this afternoon. The
record now carries `_c_`, so the dependencies-closed test passes outright rather than raising the
partial-block flag it raised seven hours ago. With it, the four passages this record names as
waiting are no longer waiting: `README-agents.md:40`, `CLAUDE.md:51`, `docs/working-model.md` §1
and §5, and `skills/help/SKILL.md` topic 2. The whole Directive is now workable in one pass instead
of being split across an interleave boundary.

**On the code heuristic this Circle now scores clean.** Every dependency closed, and no unresolved
decision cited in the Grounding snapshot. The record it cites as "cited, not waited on",
`260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`,
carries the answered marker rather than the open one, so it is not a block under the heuristic and
was never treated as one by this record.

**The argument that is not in the heuristic, and it is the stronger one.** The release is waiting on
this Circle by the user's own decision. Step 9 of
`260813-1306_*_the-playmaker-maintains-the-backlog-store.md`,
the version bump to 8.2.0, was deferred at that Circle's Turn-3 release gate on the ground that one
release carries both Circles. So the playmaker backlog capability sits committed at HEAD `931338a`
and unreleased, and this Circle is what unblocks shipping it. Until then every installed copy of
fusion, including the one this very run is executing, predates the change (see
`## Warnings` in `fusion-workbench/portfolio.md`, entry `installed-copy-predates-the-backlog-mandate`).

**One input to the Grounding has moved and is worth re-reading before the first Turn.** The record
lists `260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`
under `## Out of Scope` as three tests failing at HEAD. That record now carries the closed marker.
The out-of-scope statement is unaffected in substance, but the sentence "must not be blocked on it"
now describes a condition that no longer exists.

**Two updates the Directive's bounded list does not yet carry**, both measured against the working
tree at HEAD `931338a` this run rather than inferred:

| Surface | State at this run |
|---|---|
| `CLAUDE.md:64`, the always-on rule budget | Claims 88 023 bytes per dispatch, of which 80 670 shipped rule text. Measured: 93 819 total, 86 466 shipped, over the five always-on files plus this project's chat profile. |
| `rules/fusion-workbench-conventions.md` | 51 920 bytes, 24 second-level headings. The file gained 1 928 bytes between 09:26 and 16:23 today. |

Neither is named in `260813-0828-documentation-staleness-survey.md`, the fifteen-finding
list this Circle works from. The first is a documentation claim inside a file this Circle already
edits, so it fits the remit without widening it. The second belongs to `260801-1244-curator` and is
recorded here only so the two Circles do not both claim it.

**Proposed order:** activate through `/fusion:next`, run the Circle, then take the deferred version
bump and the release with it. Playmaker only proposes. The rename of this record and the write of
`.active-circle` are the user's or the orchestrator's.

## Activation proposal (playmaker run 260813-1756-playmaker-direct-dispatch.md)

**Still recommended for activation. Playmaker run 260813-1756-playmaker-direct-dispatch.md, trigger direct-dispatch, domain
bias `code`.** This section confirms the proposal appended 90 minutes earlier at run 260813-1623-playmaker-direct-dispatch.md
rather than restating its argument. Read that section for the case; this one records only what was
re-checked and what moved.

**Nothing that bears on the ranking moved.** Re-verified against the working tree at HEAD
`267a65c`: this Circle's one dependency, `260813-0858-playmaker-maintains-backlog-store`,
still carries the closed-coherent marker; the Grounding snapshot still cites no unresolved decision
record; the Circle directory still holds its record plus all six artifact subdirectories; and the
only other anticipated Circle, `260801-1244-curator`, still carries the falsified
Grounding measurements that keep it second. The three commits since the previous run
(`b995049`, `931338a`, `267a65c`) are the backlog-capability work and its workbench records, none
of which touches this Circle's inputs.

**The deferred release still waits here.** The version bump to 8.2.0 remains unperformed, so the
playmaker's backlog capability stays committed and unreleased. The run executing this proposal is
itself the evidence: it read `OUT_BACKLOG` from the resolver and could not use it, because its
prompt came from the installed copy. That is recorded in `fusion-workbench/portfolio.md` under
`## Warnings` as `installed-copy-predates-the-backlog-mandate`.

**Proposed order, unchanged.** Activate through `/fusion:next`, run the Circle, then take the
deferred version bump and the release with it. Playmaker only proposes. The rename of this record
and the write of `.active-circle` are the user's or the orchestrator's.

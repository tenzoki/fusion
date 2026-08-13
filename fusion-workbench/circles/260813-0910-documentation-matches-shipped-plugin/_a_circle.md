# fusion's user-facing documentation agrees with the plugin at v8.1.0

---
**Domain:** code
**Status:** anticipated
**Filed by:** shaper (anticipated-circle mode)
**Active spec/plan:** (none yet)
**Active session history:** (none yet)

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
`circles/260813-0858-playmaker-maintains-backlog-store/` rather than queuing behind it.
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
`shared/analyses/260813-0828-documentation-staleness-survey.md`, fifteen findings across
four work groups, each row carrying both sides of the claim with line citations. The defect
record `shared/issues/260813-0825_*_the-v8-1-0-documentation-step-reached-three-files-and-the-feature-reached-seven-surfaces.md`
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
`shared/analyses/260813-0831-the-seam-between-a-measured-answer-and-a-cited-one.md`.

**Coverage gaps inherited from the survey.** Four things were never examined and are not in
scope unless a step trips over them: no rule file under `rules/` was audited for staleness,
`README-hooks.md` was read only in part, `install.sh` was read only in its header, and no
claim was tested against a consuming project rather than this repository. A documentation
row can be correct while the rule file it points at is stale, and nothing here would see
that.

**Out of scope.** `shared/issues/260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`
records three test failures reproducing at HEAD in `circle-stash-git-exclusion.test.ts` and
`fusion-plane.test.ts`. That is a code defect, filed by the survey and explicitly not this
Circle's work. The gate extension in this Circle must not be blocked on it.

**Sequencing that follows from the survey's four groups.** The five mechanical one-line
edits and the gate extension can land in one Turn without a user gate, and running the gate
after the edits gives a green first run. The reference corrections want a reader. The prose
rewrites are where the time goes and where a reviewer earns its dispatch. The full
step split is in the survey under `## Proposed step split` and is not restated here.

## Dependencies

- `circles/260813-0858-playmaker-maintains-backlog-store/` — **ordering, interleaved.**
  That Circle changes the playmaker's backlog behaviour; this one documents it. Its own
  `## Dependencies` section states that it blocks a documentation Circle and asks for that
  Circle's directory name to be added once it exists. This is that Circle:
  `circles/260813-0910-documentation-matches-shipped-plugin/`. The relationship is not a
  full block. Only the four passages named in the Directive wait; everything else proceeds
  in parallel.
- `shared/decisions/260813-0826_*_should-fusion-help-become-a-self-knowledge-skill-that-answers-from-the-live-installation.md`
  — **cited, not waited on.** The record asks whether `/fusion:help` should answer from the
  live installation instead of routing into shipped prose. If it is answered that way, part
  of what this Circle rewrites by hand in `skills/help/SKILL.md` stops being prose at all.
  This Circle does not wait for the answer and does not pre-empt it; it brings the current
  router's prose current, which is option 1 in that record and is compatible with every
  other option.

## Turn log

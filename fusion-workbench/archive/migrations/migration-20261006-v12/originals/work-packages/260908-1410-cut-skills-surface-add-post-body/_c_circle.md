# The skills surface is cut back and gains `/fusion:post` as its fourth step body

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Unclaimed
**Active spec/plan:** 260908-1612_*_cut-the-skills-surface-and-add-the-post-step-body.md
**Active session history:** 260908-1530-orchestrator-session.md

---

## Directive

After this work, `skills/post/SKILL.md` exists as the fourth body of the `/fusion:cleanup` pipeline and the `skills/*/SKILL.md` growth bound still passes with several kilobytes of head-room, because the room was cut before it was spent. All ten rows of the published cut ledger `260908-1346-the-cut-ledger-for-the-skills-surface-and-what-the-post-body-owes.md` have been taken, in the order that document recommends: eight of them replace a passage in which a skill body restates what a rule file already authors with a citation of that authoring home, one moves migrate's carve-out reasoning to `rules/workbench-path-resolution.md` where the same three reasons already stand in better prose, and the tenth is the move that makes the new body possible. No rule file gains a byte, every pointer target the ledger names was verified to exist before the cut that points at it, and rows 7 through 9 carry the review attention their smaller yield would not otherwise buy, since those files are open anyway. The composition contract for the cross-checkout message is authored once, in the new body: `/fusion:cleanup` Step 6's message half becomes a read-and-perform stanza that opens `$FUSION_SRC/skills/post/SKILL.md` and executes its procedure inline, exactly as Steps 4, 5 and 6 already read `archive`, `log-activity` and `curate`, and what stays behind in cleanup is only what is cleanup's own: that `--skip claude-md` drops the message with the step, that `--dry-run` puts no draft, that `--only forum` runs the half alone, and that the draft is a second question inside the same `AskUserQuestion` call. The new body defines both invocation shapes the way the three existing step bodies do, the inline one the end-of-session run reads and the standalone one a user invokes on its own, and it owes what they owe: frontmatter with name, description and `allowed-tools`, the one-line language declaration, its own `bin/fusion-paths post` resolution with the exit-code handling that goes with it, and a boundaries section. The `--only forum` selector keeps the name it has, so `post` becomes the second body whose cleanup selector is not its own name, after `curate` and `claude-md`. `CLAUDE.md` names `/fusion:post` in the same commit that creates the directory, which the two-way match in `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` requires, and the two prose claims in that file which go false are corrected by hand rather than left to a lint that does not read them: three cleanup-pipeline step bodies become four, and the selector sentence stops claiming two of three. The open issue on the same surface, `260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md`, is closed while `skills/help/SKILL.md` is open, and both of its acceptance clauses are met: the update topic names the three most recent releases, and `CLAUDE.md`'s release process names this surface among the ones a release checks, so the process gap that produced two consecutive misses closes with the text rather than after it. That fix spends no more than 700 bytes of the freed room. No growth baseline moves anywhere in this work, on any of the four surfaces, and the per-file golden fixture is regenerated so the gate reads the tree it measures. If `skills/post/SKILL.md` lands above the ledger's upper estimate of 6 500 bytes, the work stops there, reports the measured size and the head-room that leaves, and puts the question back to the user: it does not cut further under pressure and it does not trim the new body's statement of its own behaviour.

## Grounding snapshot

**The ledger is this Circle's input and it is already measured, so planning re-derives none of it.** `260908-1346-the-cut-ledger-for-the-skills-surface-and-what-the-post-body-owes.md` carries ten rows with a measured before and a measured after for each, a per-site breakdown for the three grouped rows, a verified-target table showing that each replacement's pointer resolves to text that already exists, and a fit table running from today's 1 119 free bytes to a pessimistic 3 483 after everything. Nine of the ten "after" figures were measured off a drafted replacement text; only row 10's 950 is an estimate, bracketed by two measured analogues and stated as accurate to about 150 bytes either way. **The surface has not moved since the ledger was written.** It measured `skills/*/SKILL.md` at 259 495 bytes over HEAD `0f5597be`; the same measurement at HEAD `8502d539` on 2026-09-08 gives 259 495 exactly, so every figure in the ledger reads the tree this Circle starts from.

**Two rulings are settled and planning may not reopen either.** The shape is inverted: the composition contract lives in `skills/post/SKILL.md` and `/fusion:cleanup` reads it, rather than cleanup keeping the contract and `post` reading cleanup. The reason is that two copies of one write is the drift shape this project filed twice in one day, and a later change to the twenty-line cap would otherwise make the two entry points write different files with every gate still green. Row 10's arithmetic assumes this shape; under the alternative row 10 is zero and the new body is larger. And the surface-count objection was heard and rejected: this adds a fourth **step body**, which is the existing pattern, not a fourth administrative name. `/fusion:setup`, `/fusion:cleanup` and `/fusion:cadence` remain the three administrative names.

**The ledger's list of ten candidates that must not be cut is worth as much as the ledger itself.** Each looks like restatement at the byte level and is the only statement of its rule: setup Step 0k's eight output branches, archive's safety filters and tier tables, next Step 5b's relay mechanics, cleanup Step 6's "Three things are this step's and not that body's" boundary paragraph, cleanup's `--only`/`--skip` selector table, setup Step 0e's per-block prelude (functional repetition, since each Bash call is a fresh shell), any shell block anywhere, help's per-topic quotes of shipped source, anything under `agents/`, and the always-on rule files. A planner reaching for one more kilobyte will reach for these next; the answer is that the ledger already leaves margin and none of them is needed.

**Row 10 is not independently takeable and row 9 has an exclusion.** Cutting cleanup's message half before `post` exists deletes the only statement of the composition contract, so row 10 and the new body are one piece of work. Row 9 adopts `skills/news/SKILL.md`'s one-line language preamble in `next`, `direct` and `curate` and deliberately excludes `skills/migrate/SKILL.md`, whose version carries a real exception that is not restated anywhere: that the shell blocks' printed strings stay English in every project. Whether migrate's preamble can adopt a shortened form that keeps that clause is unexamined rather than answered.

**The help-topic issue and the ledger disagree on which releases the topic names, and both are right about different fields.** The issue says the topic carries v10.20, v10.14 and v10.7; the ledger says v10.14, v10.7 and v10.6. Reading `skills/help/SKILL.md` at this head settles it: each paragraph is *labelled* by the install the reader is coming from and *describes* the releases after it, so the labels are v10.14, v10.7 and v10.6 while the content covers v10.20, v10.14 and v10.7. The ledger measured the labels, the issue named the content. The current release is 10.25.0, so both readings agree the topic is two releases behind. The ledger prices the swap at between minus 200 and plus 700 bytes against this surface and cannot give a figure without drafting the paragraphs, because their length is a property of what each release changed; the user capped the spend at 700.

**No baseline moves, and there is an open record a reader will reach for.** `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md` is still `_o_` after two reconciliation passes and asks whether a Circle that cuts may copy the post-cut sizes into the baseline map. It does not bind here, because this Circle is not cut-only: it cuts in order to spend, and re-baselining would hand back the very room the new body is meant to consume. The practice it records for its own Circle, option 1, is what this work follows. The neighbouring constraint has since moved: a third re-baselining event was declared on 2026-09-05 for a merge of two lines each inside their bound (`260905-1810_*_does-a-growth-bound-re-baseline-after-a-merge-of-two-lines-that-were-each-inside-it.md`), which removes the premise that no third event may exist but answers nothing about a cut. The re-baselining rule itself is authored in `hooks/lib/__tests__/helpers/growth-bound.ts` and nowhere else.

**The message half being moved was written by the Circle immediately before this one, which is why it is a dependency rather than a discovery.** `260907-0829-message-between-checkouts-read-before-pull` closed coherent and authored `shared/forum/`, the twenty-line cap with eight lines for the person's part, the storeless wildcard citations, the standalone `--only forum` shape that writes the file and touches git not at all, and the decision that the draft sits inside `/fusion:cleanup`'s single existing stop rather than at a stop of its own (`260827-1311_*_where-in-the-cleanup-pipeline-does-the-one-gate-stand.md`). This Circle relocates that contract and changes none of it. The reading half of that pair is `/fusion:news`, unaffected here.

**Two mechanical consequences a plan must carry rather than discover.** The two-way match in `hooks/lib/__tests__/derivable-enumerations-lint.test.ts` fails `npm test` the moment `skills/post/` exists with no `/fusion:post` token in `CLAUDE.md`, and the message names the file and the token. And the per-file golden fixture `hooks/lib/__tests__/fixtures/surface-growth.golden` is regenerated whenever a shipped file's size changes, which every row of this work does; the prior Circle carried the same obligation in its own Directive.

## Dependencies

- `260907-0829-message-between-checkouts-read-before-pull` — closed coherent; it authored the message half whose composition contract this Circle relocates into `skills/post/SKILL.md`. Nothing about that contract's substance changes here.

## Turn log

- Turn 1 (session 260908-1530): commits b64b95b5..ee99a578, 5 of them; Coherence verdict review-needed on 3 drift items, all in the Artifact; session history: 260908-1530-orchestrator-session.md. All 17 plan steps done. The cut delivered 8161 of a predicted 8444 over nine rows; the new body measured 6137 under a 6500 ceiling after one over-ceiling stop and the user's ruling to remove the source-root block.
- Turn 2 (session 260908-1530): the repair pass after Gate 2 chose Revise Artifact, then the closure review and the repair of its two high findings. The review found the default path did not write the message at all, on two independent causes, neither visible under the standalone shape the feature had been exercised in. Two stopping conditions do not hold at closure and are named in the closure note rather than repaired.

## Activation proposal

Recommended as the next activation, and it is the only anticipated Circle on the board. Every
entry in `## Dependencies` resolves and is closed: the one entry names Circle
`260907-0829-message-between-checkouts-read-before-pull`, whose record carries `_c_`. The
`## Grounding snapshot` cites five records, of which one is an open decision,
`260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`, and the snapshot
itself states why that question does not bind here: this Circle cuts in order to spend, so
re-baselining would hand back the room the new skill body is meant to consume. A candidate whose
single open question is disposed of inside its own Grounding is ready in a way that a candidate
holding an unanswered one is not. Two of those five records carry a terminal marker, the closed
dependency above and the decision
`260905-1810_*_does-a-growth-bound-re-baseline-after-a-merge-of-two-lines-that-were-each-inside-it.md`
at `_i_`, which is under the half at which this run would call the Grounding stale. The age
measurement agrees. The snapshot records a surface measurement taken at commit `8502d539`, and
HEAD stands one commit past it (`git rev-list --count 8502d539..HEAD` = 1), that commit being the
one which filed this Circle. The input the plan will work from, the cut ledger
`260908-1346-the-cut-ledger-for-the-skills-surface-and-what-the-post-body-owes.md`, is on disk and
was measured against the same tree.

Proposed activation timestamp: 260908-1422.

Playmaker run: `260908-1422-playmaker-direct-dispatch.md`.

Activation is the user's or the orchestrator's act. This block proposes and renames nothing.


## Closure note

**Closed coherent 260908-2045**, session history `260908-1530-orchestrator-session.md`,
range `b64b95b5..HEAD`.

**The Directive is met, and the claim it rests on was checked twice by different methods.** The
message composition contract exists once, in `skills/post/SKILL.md`; `/fusion:cleanup` Step 6 reads
and performs it and keeps only what is cleanup's own. A reconciliation established this by grep over
four surfaces, and the closure review then re-established it by reading both bodies as an executor
would run them, which is the method that could have found a restatement in different words. The
surface stands at 259 515 of 260 614, so 1 099 are free against 1 119 at activation, with a fourth
pipeline step body added rather than a fourth administrative name.

**Two stopping conditions do not hold, and the user closed with both named rather than repaired.**

The cut landed at 250 284 bytes before the new body against a condition of 249 931 with a 300-byte
tolerance, short by 353. The step-7 abort measured rows 1 through 9 alone and passed at 283; row 10
then delivered 70 less than predicted. The gate and the stopping condition do not measure the same
quantity, which nobody noticed while both were being written.

`skills/post/SKILL.md` measures 7 347 against a ceiling of 6 500. It was 6 137 when written, under
the ceiling and matching its own estimate to the byte; the repair of the two high findings added
1 210. The repair dispatch bounded the surface rather than the body, which was the orchestrator
substituting one condition for another and not re-checking. Trimming it back would remove behaviour
the review had just demonstrated the default path needs, which is what the ceiling forbade for the
original write.

**The closure review found two high defects and both are fixed.** Each bit only on the inline path,
which is the default run, and neither appeared under `--only forum`, which is the shape the feature
had been exercised in. The message step read a state file the pipeline deletes five steps earlier,
the coupling having been a single phrase that went with the relocated procedure. And the draft rode
a question the surveying half does not always put, so on the commonest run it was composed, printed
and never written. The inverted shape moved a procedure and left its preconditions behind; that is
the class the do-not-cut list does not cover.

**One finding outlives this Circle as a widened record.** Three times here a citation gate stood red
across a commit. The first is explained by the deferred golden making a full-suite run pointless.
The other two are not: the file that reddens the gate is a record written after the last
verification, by an agent producing prose, with nothing running between writing it and committing
it. `260908-1800_*_three-commits-shipped-a-red-citation-sweep-gate-because-an-expected-red-golden-masked-it.md`
carries the widening; its acceptance test does not yet cover it.

**Release precondition, unchanged and still unmet.** `/fusion:post` has never been invoked as a
slash command, because a session reads its skill roster at start from the installed copy. The same
holds for `/fusion:news`. A release claiming either works has to prove it after `fusion --update`
and a restart, or say plainly that it has not.

**Open on closure:** four defect records from this Circle's review, one decision on the migrate
language preamble which the Grounding scopes out of the Directive, and the inherited pointer-swap
question, which this Circle recorded as its second instance.

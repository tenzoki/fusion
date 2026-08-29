# The reference-resolution pin's re-approval log, entries 1 to 25

**Date:** 2026-08-22 13:18
**Type:** Record
**Status:** Complete
**Requested by:** coder, step 2 of `260822-1154_*_plan-c0-cut-only-circle-buys-head-room-on-four-bounded-surfaces.md`

## What this is

`hooks/lib/__tests__/reference-resolution-lint.test.ts` pins the number of references its three
classes resolve, in `const BASELINE`. The convention around that pin is that every approval and
re-approval is attributed as a comment block naming what moved the number and why. Between
2026-08-16 and 2026-08-22 that log accumulated 26 entries occupying 421 lines of a file measured by
the line, on a surface whose whole head-room was 12 lines.

This record holds the first 25 of those entries, verbatim, moved here so the file could be cut. The
26th — the most recent — stays in the test file above `const BASELINE`, together with the pin's
rationale. The test file cites this record by one line, so a reader standing at `BASELINE` can still
reach the history.

**The convention is untouched.** The next person re-approving the pin still writes a block above
`const BASELINE`. It simply stops accumulating without bound in a bounded file; when the log grows
long again, entries roll into a record like this one.

## Where this came from and what it cost

The move was decided at Gate A of the C0 plan, as option 2 of
`260822-1229_*_where-does-the-reference-resolution-pins-re-approval-attribution-log-live.md`,
raised by the measurement in `260822-1226-cut-ledger-for-three-bounded-surfaces.md`
(row H6). Two costs were stated at the gate and accepted rather than mitigated: the attribution no
longer stands in front of the person editing `BASELINE`, which is the property that made the log
trustworthy; and the bytes are relocated rather than removed, so the maintenance cost the line
budget measures falls only to the extent that nobody reads this record.

Options 3 (delete outright, on the ground that `git` holds them) and 4 (cap at the last N entries)
were put to the user and not taken.

## Reading these entries

They are reproduced exactly as they stood in the file, in chronological order, with the `//` comment
prefix stripped and nothing else changed. Paths, arrows, spellings and line references are as
written at the time. Several name modules and files that have since been deleted — the entries
explain those deletions, so a pointer that no longer resolves is the entry doing its job rather than
a defect in it. Nothing here is a live pointer to be repaired.

Entry 1 is the approval that put the pin in. Entries 2 to 25 are re-approvals. The numbers each
entry names are the `BASELINE` values before and after the edit it attributes.

---

## The entries

Approved 2026-08-16, the run that put the pin in. paths 1095 → 1122 is the 27
resolving `lib/…` citations entering scope (the other 7 of that spelling's 34
are the dangling ones now carried in EXAMPLE_PATHS); records 87 → 95 is the
top-level `hooks/*.ts` entering scope.

Re-approved 2026-08-16, Circle 260816-1741-guard-becomes-observation-only step
2. records 95 → 94: `hooks/guard.ts` held exactly one class-(c) citation, of
the stand-down's own decision record, and the branch citing it is deleted.
The count had already fallen to 94 before the deletion — the record moved to
`_a_` after the pin was approved, which turned that citation from a resolved
reference into a stale-marker violation — so this re-approval records the
citation LEAVING, and the violation it had become is gone with it.

Re-approved 2026-08-17, same Circle, step 11 — the step the plan makes
responsible for this gate's green. paths 1122 → 1103, and the movement is two
opposed halves rather than one: steps 2 to 7b deleted the modules and files
that 29 of the pinned citations named, which had already taken the count to
1093 with no step re-approving it in between, and step 11's own rewrite of the
shipped text puts 10 back by citing what survived — `templates/fusion.json`,
`hooks/lib/config.ts`, the three `bin/` helpers behind the work-tree
preference, `hooks/session-start.ts`. anchors and records did not move.

Re-approved 2026-08-17, same Circle, step 12 — the migration note for consuming
projects. paths 1103 -> 1112, all nine of them citations of `docs/upgrading-to-v10.md`
and of what that note points a reader at: four inside the new note itself
(`hooks/lib/paths.ts`, `README-hooks.md`, `templates/fusion.json`,
`docs/upgrading-to-v9.md`), two each from `README.md` and `skills/help/SKILL.md`
naming the new note, and one from `docs/upgrading-to-v9.md`, whose forward
pointer to it became a path now that the file exists. The note names the modules
this Circle deleted WITHOUT a directory prefix, the spelling README-hooks.md
already uses for `clear-halt.ts`, so a citation of something removed stays out of
class (a) rather than earning an EXAMPLE_PATHS entry. anchors and records did not
move.

Re-approved 2026-08-17, same Circle, step 16 — the curator's pass over
`CLAUDE.md` and `rules/fusion-workbench-conventions.md` (run log
`260817-0845-curator-run.md`).
paths 1112 -> 1120, measured per file by rerunning this gate against each file
reverted in turn: `CLAUDE.md` moves +7 and the conventions file +1. The nine
citations the curator's replacement text adds are `bin/fusion-plugin-cwd`,
`bin/fusion-source-root`, `docs/upgrading-to-v10.md`, `hooks/guard.ts` twice,
`hooks/lib/config.ts`, `install.sh` and `templates/fusion.json` in `CLAUDE.md`,
and `hooks/lib/guard-state-file.ts` in the conventions file (ledger entry L16);
the one it drops is a second `hooks/lib/self-detect.ts` in `CLAUDE.md`, leaving
+8. Ledger entries L17 and L18 add and remove no citation at all, and neither
does the `hooks/session-start.ts` half that lands in the same commit as them:
that edit was measured on its own by reverting it, and the count stood at 1120
either way. anchors and records did not move.

Re-approved 2026-08-17 — the curator's next pass, run log
`260817-1925-curator-run.md`, whose three applied ledger entries
(L01 `rules/circle-records.md`, L02 `rules/fusion-workbench-conventions.md`,
L03 `CLAUDE.md`) replace one false claim: that `rules/circle-records.md`'s
emission audience is *derived* from which prompts name a Circle-scoped resolver
key. paths 1120 -> 1124, measured per file by reverting each of the three in turn
and rerunning this gate: `CLAUDE.md` +2, the conventions file +2, and L01 zero.
The four are one `bin/fusion-rules` and one `rules/circle-records.md` in each of
the first two files. L01 is the entry worth reading the pin for: at +450 bytes it
is the largest of the three and moves the count by nothing, because its
replacement text re-spends the citations it inherited rather than adding any.
anchors and records did not move.

Re-approved 2026-08-18 — the exempt-surface split in
`rules/fusion-workbench-conventions.md` `## Project language` (issue
`260807-2153_*_the-exempt-surface-list-is-plugin-repo-shaped-but-ships-to-every-consumer.md`).
paths 1124 -> 1125 and records 94 -> 95, both in that one file and measured by
reverting it and rerunning this gate. The path is a second `README.md`: the
replacement states the criterion twice, once for a project that ships nothing
onward and once for this repository, and names README on both sides. The record
is the citation of `260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`,
whose third constraint the new closing paragraph satisfies. anchors did not move.

Re-approved 2026-08-18 — the Circle record's `## Directive` becomes a pointer
once `**Active spec/plan:**` cites a file, and gains a writer for the case where
it does not (`260818-1512_*_the-circle-records-directive-becomes-a-pointer-and-gains-a-writer.md`,
all seven steps). paths 1125 -> 1133 and anchors 139 -> 145, measured per file by
reverting each of the five in turn and rerunning this gate. paths: +2 in
`rules/circle-records.md` (the new subsection names `agents/orchestrator.md` and
`agents/shaper.md` as the two prompts that carry the writer obligations), +2 in
`agents/shaper.md` and +1 net in `agents/orchestrator.md` and +1 in
`skills/next/SKILL.md` (each cites the new subsection; the orchestrator's two
additions are offset by the deleted `**Status:**` paragraph), +2 in
`README-agents.md` (the new `**Scope:**` row cites the two prompts that declare
and pass it). anchors: +1 for the subsection's own
`agents/orchestrator.md` `## Circle head fields`, +4 for the citations of
`### The Directive is a pointer once a spec exists` that class (b) can see, and
+1 that is not a new citation at all — `rules/circle-records.md`
`## Circle record template` in `agents/orchestrator.md` was always there and was
invisible to this gate because a line break fell between the two backtick spans,
which the rewrite closed. Two more citations of the new subsection exist and are
deliberately NOT in this count: `skills/next/SKILL.md` spells its paths
`$FUSION_SRC/...`, which ANCHOR_RE's character class does not admit, the same
way that file's pre-existing `## Circle head fields` citation has never been
counted. records 95 -> 97, one in each of the two files that names the record
this change realises: `260818-1504_*_...` in
`rules/circle-records.md` as the subsection's binding decision, and
`260818-1512_*_...` in `agents/orchestrator.md`, which is where
the mode's name is recorded as kept and its residual named.

Re-approved 2026-08-18 — the v10.2 release material: the version-surface bumps and
`docs/upgrading-to-v10-2.md`, the migration note for consuming projects, written to the
shape of `docs/upgrading-to-v10.md`. paths 1133 -> 1142 and anchors 145 -> 148,
measured per file by reverting each of the five edited files in turn and rerunning this
gate. Seven of the nine paths and all three anchors are inside the note itself:
`rules/circle-records.md` three times, `README.md` once, and `agents/shaper.md`,
`README-agents.md` and `docs/upgrading-to-v10.md` once each; the anchors sit on two of
the three `rules/circle-records.md` citations and on `README-agents.md`
`## Dispatch parameters`. The remaining two paths are the note being NAMED, once from
`README.md` and once from `skills/help/SKILL.md`. `install.sh` and
`.claude-plugin/plugin.json` carry version-pin bumps only and move nothing.
Two things a later reader would otherwise have to re-derive. The five per-file figures
sum to 11 against a total of 9, and the excess is interaction rather than error:
reverting the note alone also dangles the two citations OF it, so that one revert
measures its own seven plus those two leaving scope. And the note carries EIGHT
path-shaped spellings for seven resolved — the bare `rules/` on its exempt-surface
bullet is a directory, not a file, and is no class-(a) token.
One of the three anchors was won rather than written. The note first spelled its
`### The Directive is a pointer once a spec exists` citation with a line break between
the two backtick spans, and this gate scans line by line, so the citation was invisible
— the same defect the Directive-pointer re-approval directly above found standing in
`agents/orchestrator.md`. It was reflowed onto one line before this count was taken,
which is the whole of the difference between anchors 147 and 148.
records did not move.

Re-approved 2026-08-19 — the move of `### Which of them a tracked workbench tracks` out of
`rules/fusion-workbench-conventions.md` into the new `rules/workbench-tracking.md`,
realising decisions `260816-0711_*_...` (the move) and
`260816-1707_*_...` (the emission target it was blocked on).
paths 1142 -> 1152 and records 97 -> 101; anchors did not move. Measured per file by
reverting each of the five changed files in turn, in a detached worktree at HEAD `52b1d95`
holding only their working-tree versions with `agents/*.md` left at HEAD, so none of the
movement is attributable to the concurrent `agents/*.md` work, which moves nothing here.
Contributions as paths / anchors / records: `rules/workbench-tracking.md` +11 / +1 / +3,
`CLAUDE.md` +3 / +1 / +2, `rules/fusion-workbench-conventions.md` +1 / 0 / -1,
`skills/archive/SKILL.md` +1 / -2 / 0, `hooks/lib/staging-drift.ts` 0 / 0 / 0.
Three things a later reader would otherwise re-derive. First, the per-file paths figures
sum to +16 against an actual +10, and the excess is interaction rather than error — the
same effect the v10.2 block above names: reverting a file also dangles the citations OF it,
so a single revert measures its own tokens plus whatever leaves scope with it, and three of
the other four files cite the new rule in a class this gate reads there. anchors and
records sum exactly, 0 and +4, which is coincidence and not a second rule.
Second, two contributions are NEGATIVE, which is that same interaction seen from the other
side and not a mistake. Reverting `rules/fusion-workbench-conventions.md` restores the old
subsection, whose body carries the `260811-1534_*_...` decision citation that the pointer
replacing it does not, so records reads 102 against the control's 101; and reverting
`skills/archive/SKILL.md` restores two citations of the old conventions anchor, so anchors
reads 150. Third, `hooks/lib/staging-drift.ts` moves nothing and could not have: its two
changed comments repoint from that same anchor to a bare `rules/workbench-tracking.md`, and
`hooks/lib/*.ts` is scanned recordsOnly, so classes (a) and (b) are not read there at all.

Re-approved 2026-08-19 — the `**Status:**` field leaves the decision-record template,
realising decision `260818-2212_*_should-the-decision-records-status-field-exist-at-all-now-that-the-circle-records-has-been-removed.md`
(option 1: the filename marker is the only source of a decision record's state). anchors
148 -> 149 and records 101 -> 102; paths did not move. Measured per file by reverting each
of the two changed rule files in turn and rerunning this gate; the two contributions are
disjoint and sum exactly, with no interaction, because neither file's added text cites the
other's. The anchor is `rules/decision-record-examples.md` citing
`## Decision Record Template`, the pointer that keeps the removal's reasoning in one place
instead of two. The record is the binding-decision citation in
`rules/fusion-workbench-conventions.md`.
Two absences a later reader would otherwise read as an error. The examples file also names
the record above in prose and contributes ZERO to records: it is exempt from class (c)
wholesale as a `RECORD_EXAMPLE_FILES` entry, because every record it walks is fabricated.
And its `fusion-workbench-conventions.md` citation is a bare basename, which is no
class-(a) token — that class reads `rules/<name>.md` — so paths stayed at 1152 while a
file was named. The anchor still resolves, because class (b) matches on basename.

Re-approved 2026-08-19 — one re-approval for THREE tasks that ran concurrently on
disjoint file sets, each of which measured its own contribution and none of which wrote
this constant: three writers of one number leave the last writer's figure wrong, so the
tasks reported and a consolidation pass measured the settled tree once and wrote it here.
paths 1152 -> 1156; anchors and records did not move. Measured per file by copying each
changed file in turn into a detached worktree at HEAD `5ec26b2` and rerunning this gate.
Contributions as paths / anchors / records, by task:
  U1 — `skills/archive/SKILL.md` +3 / 0 / 0, `CLAUDE.md` 0 / 0 / 0,
       `README-agents.md` 0 / 0 / 0, `.gitignore` 0 / 0 / 0 (not a `surface()` file at all).
  U2 — `agents/planner.md` 0 / 0 / 0, `agents/orchestrator.md` 0 / 0 / 0,
       `hooks/lib/staging-drift.ts` 0 / 0 / 0 (scanned recordsOnly, so a comment reflow
       there cannot move paths or anchors even in principle).
  U3 — `rules/fusion-workbench-conventions.md` +1 / 0 / 0 (the new
       `rules/workbench-tracking.md` citation in the layout tree's discipline sentence),
       `rules/workbench-tracking.md` 0 / 0 / 0.
The eight per-file figures sum to +4 against an actual +4: exactly, with no interaction,
because no file's added text cites another's. That is the arithmetic the two blocks above
warn does NOT generally hold; it holds here and is not a new rule.
Why U1's figure is +3 and not the +2 measured while the tasks were still in flight.
`skills/archive/SKILL.md` introduced a root variable named `SRC`, which ROOT_VARS does not
classify, so its `$SRC/rules/workbench-tracking.md` citation was a VIOLATION and never a
resolved path — the dangling-reference test above was red, and the count read 1154. The
consolidation renamed the variable to `FUSION_SRC`, the name already declared in ROOT_VARS
and already used for this same value in `skills/setup/SKILL.md`, rather than admitting a
second name for one thing. The token is now resolved and counted, which is the whole of
the difference between 1155 and 1154 in that file.

Re-approved 2026-08-19 — the v10.3 release material: `docs/upgrading-to-v10-3.md`, the
migration note for consuming projects, written to the shape of `docs/upgrading-to-v10-2.md`,
plus the two surfaces that point at each note (`README.md` `## Install` and the update topic
of `skills/help/SKILL.md`) and the dated clause added to the v10.2 note where its statement
of the `**Status:**` position kept a qualifier the rule dropped after v10.2.0 shipped
(`shared/issues/260819-0756_o_*`, option 1). paths 1156 -> 1178 and anchors 149 -> 155;
records did not move, because the note cites fusion's own workbench in prose and names no
record path — a consuming project's reader cannot open one.
Measured per file by copying each changed file in turn into a detached worktree at HEAD
`6b54551` and rerunning this gate. Contributions as paths / anchors / records:
  `docs/upgrading-to-v10-3.md`  +17 / +5 / 0 — the note itself. The 17 are
       `rules/fusion-workbench-conventions.md` four times, `agents/orchestrator.md` three,
       `rules/decision-record-examples.md`, `agents/planner.md` and
       `rules/workbench-tracking.md` twice each, `docs/upgrading-to-v10-2.md` twice, and
       `bin/fusion-rules` and `docs/upgrading-to-v10.md` once each. The 5 anchors sit on the
       three `## Decision Record Template` citations, on `agents/planner.md`
       `## Where this Circle stops`, and on `agents/orchestrator.md` `### Phase 4`.
  `docs/upgrading-to-v10-2.md`   +3 / +1 / 0 — the dated clause, naming the two files that
       carry the unqualified position and the new note.
  `README.md`                    +1 / 0 / 0 — the new "Upgrading from v10.2?" paragraph.
  `skills/help/SKILL.md`         +1 / 0 / 0 — the new "Coming from a v10.2 install"
       paragraph, under the already-classified `$FUSION_SRC`.
  `install.sh`                    0 / 0 / 0 — the `FUSION_REF=tags/v10.3.0` example is a
       version pin, not a path into the tree.
The five per-file figures sum to +22 / +6 against an actual +22 / +6: exactly, with no
interaction, because the only file any of the others cites is the new note, and it cites
none of them back. That arithmetic does NOT generally hold, per the blocks above; it holds
here and is not a new rule.

Re-approved 2026-08-19 — one re-approval for FIVE tasks that ran concurrently on disjoint
file sets. Each measured its own contribution and none wrote this constant, by instruction:
three writers of one number leave the last writer's figure standing, so the tasks reported
and a consolidation pass measured the settled tree once and wrote it here. The two reports
that named a starting point disagreed about it — one said 1178, the other 1168 — which is
why the figure below was measured against `git show HEAD:` rather than carried forward from
either. The committed value was 1178.
paths 1178 -> 1179 and records 102 -> 104; anchors did not move.
Measured per file by copying each changed file in turn into a detached worktree at HEAD
`b6869aa` and rerunning this gate. Contributions as paths / anchors / records:
  `rules/circle-records.md`  +1 / 0 / +2 — the whole of the movement, from the new section
       on deleting a Circle. Three of its tokens are ones this gate reads: `bin/fusion-rules`
       in the paragraph naming who the file is emitted to (class (a)), and two class-(c)
       record citations — `260819-1400-reconciliation-circles.md`, cited for
       the archive sweep that broke six citations, and the binding decision `260805-1548` on
       the closing line. `/fusion:archive` and `/fusion:circle-delete` are skill tokens and
       no class reads them; `$PORTFOLIO` is a resolver key, not a path.
  `agents/orchestrator.md`   0 / 0 / 0 — measured, not assumed.
  the modified workbench     0 / 0 / 0 — measured by copying the whole of the changed
       `fusion-workbench/` across on its own, including four history files this tree adds.
       `surface()` names no workbench path, so a workbench-only task cannot move any count
       in principle; the workbench is read only as the index class (c) resolves AGAINST, and
       a task that renames a record there would move the count without appearing here.
  `hooks/lib/__tests__/*.ts`, `hooks/package.json`  0 / 0 / 0 — not `surface()` files at all.
       The two `hooks` walks read files directly in `hooks/` and `hooks/lib/`, so the
       `__tests__` subdirectory is never entered, and `package.json` matches no walk.
The figures sum to +1 / 0 / +2 against an actual +1 / 0 / +2. That arithmetic does NOT
generally hold, per the blocks above; it holds here because only one file moved at all.

Re-approved 2026-08-20 — the `stamp-name` class enters `GATE_KINDS`, realising decision
`260819-2016_*_does-the-citation-gate-judge-the-stamp-name-class-which-scanrecordcitations-does-not-read.md`
(option 2). This is a widening of WHAT the gate reads, not an edit to the surface it reads:
no shipped file gained a citation, and the movement is entirely tokens that were already
resolving in the measuring view and were filtered out of the gate's count on their way past.
records 104 -> 107; paths and anchors did not move.
Measured by enumerating every `stamp-name` hit over `surface()` after the widening, rather
than by reverting files, because the cause is one constant and no file is attributable:
  `docs/upgrading-to-v10.md:41`      `260816-1741-guard-becomes-observation-only`
  `docs/upgrading-to-v9.md:31`       `260815-0007-remove-eight-mechanisms-and-cap-growth`
  `skills/cadence/SKILL.md:136`      `260731-2208-orchestrator-session`
Eight further `stamp-name` tokens on the surface are `exempt` and so contribute nothing:
seven announced illustrations and one inside a fence. That ratio — three real citations
against eight illustrations — is why the widening cost a two-token repair rather than the
unbounded one the decision's own recommendation feared.
The two it did cost were both dangling and both illustrations that a real stamp made look
like pointers. `rules/context-manifest.md:110` named a Circle `260718-1924-ontology-refactor`
that has never existed, spelled with the real stamp of `260718-1924-v5x-overhaul`; it now
reads `YYMMDD-HHMM-ontology-refactor`, which the surrounding paragraph already uses and
which produces no token at all. `skills/log-activity/SKILL.md:86` illustrates stamp parsing
with `260408-1523-topic.md`, where the digits ARE the illustration, so it gained the `e.g.`
the announced-illustration exemption reads. Neither repair moved any count: both tokens were
violations, and a violation was never in the resolved figure.
SECOND CAUSE, same commit — the convention line the same plan step adds to
`rules/fusion-workbench-conventions.md`: a record that states something ABOUT a citation
names file and line, or fences the verbatim form. It is the third leg of the recurrence
answer at the foot of
`260820-0530_*_twenty-six-citations-in-the-corpus-are-statements-rather-than-pointers-and-no-exemption-expresses-that.md`
— the gate catches, the failure message teaches, the convention reaches whoever reads first.
paths 1179 -> 1180, anchors 155 -> 156, records 107 -> 109, all of it that one paragraph:
one class-(a) path (`rules/circle-records.md`), one anchor into it
(`### Citation form in the portfolio`), and two class-(c) records — the issue above, and the
`260812-1720` lint-scope defect used as the worked example of naming a citing line.
The two causes are disjoint and sum exactly (+1 / +1 / +5 against an actual +1 / +1 / +5),
because the widening touches no file's text and the convention line adds no `stamp-name`
token. That arithmetic does NOT generally hold; it holds here for that reason.
WHAT DID NOT MOVE, measured rather than assumed: the new gate itself,
`hooks/lib/__tests__/workbench-citation-lint.test.ts`, contributes zero. `surface()` walks
`hooks/` and `hooks/lib/` file by file and never enters `__tests__`, so the dozen record
citations in that file's header are read by no class here — which is also why the second
caller cannot pin its own corpus through this baseline.

Re-approved 2026-08-20 — the three blocking gates get named on the two surfaces a reader
reaches before a red run, closing
`260820-0805_*_neither-new-blocking-gate-is-named-on-any-shipped-surface.md`.
The record was filed against two gates; a third, `plan-stopping-section-lint.test.ts`, was
armed in the same Turn and is named alongside them.
paths 1180 -> 1194, anchors 156 -> 157, records 109 -> 111. Every token is an addition to
shipped PROSE — no scanner, no exemption and no class changed — so the movement is
attributable file by file, and it was measured by reverting the three files to HEAD, running
this gate green at the old numbers, and restoring them:
  README-hooks.md    `### Three gates that can fail the suite over text nobody compiled`,
                     a new section between `### Running tests` and the growth bounds, plus a
                     clause in `### Rebuilding after TS changes` naming the dist gate.
                     7 paths, 1 record.
  CLAUDE.md          one row in `## Where to look when something breaks`, whose symptom is a
                     red run over a citation, a plan or a compiled file the reader did not
                     edit. 6 paths, 1 anchor, 1 record.
  agents/planner.md  the stopping-section paragraph, which said "nothing reads it
                     mechanically" and was made false by the new gate. 1 path.
The 14 paths are `hooks/dist/` x3, `committed-dist.test.ts` x3,
`plan-stopping-section-lint.test.ts` x3, `workbench-citation-lint.test.ts` x2,
`hooks/package.json` x2 and `README-hooks.md` x1; the anchor is CLAUDE.md's pointer into that
new README section; the two records are the corpus decision, cited once on each surface.
WHAT DID NOT MOVE, and it is the same fact the note above records: this Turn also edited
`hooks/lib/__tests__/workbench-citation-lint.test.ts`, `committed-dist.test.ts`,
`helpers/citation-scan.ts` and this file, and `surface()` enters none of them, so none of the
four contributes a token here.

Re-approved 2026-08-20 — `analyst` gained a `PATTERNS` arm in `bin/fusion-rules`, realising
`260815-1845_*_does-analyst-get-a-project-local-rule-pattern-now-that-the-investigator-fold-orphaned-one.md`
(option 3, answered by the user 2026-08-20).
paths 1194 -> 1195, records 111 -> 112, anchors unchanged. Both tokens are additions to shipped
PROSE — the comment block above the new `analyst)` arm — and no scanner, exemption or class
changed. Attributed by the same method the note above used: each of the seven files this Turn
edited was reverted to HEAD in turn and the gate re-run. Reverting `bin/fusion-rules` ALONE
returned it to 1194/157/111, so the whole movement is that one file:
  bin/fusion-rules   the arm's comment, which states why the pattern is the bare token
                     `analyst` and not also `analysis`, and where the orphaned investigator
                     layout is handled instead. 1 path (`docs/upgrading-to-v9.md`), 1 record
                     (the decision above).
WHAT DID NOT MOVE, and it is worth recording because it looks like it should have: the same
Turn added `./rules/analyst-capture-layout.md` to `README-agents.md`'s pattern table and
rewrote `docs/upgrading-to-v9.md` §4 and `skills/help/SKILL.md` §5 around it. A `./rules/`
path is project-side and enters no class here — exactly as the `./rules/coding-guidelines.md`
entries already in that table do not — so six prose edits across those three files and
`agents/shaper.md`, `agents/orchestrator.md` and `rules/fusion-workbench-conventions.md`
contribute nothing, and each was confirmed individually by the revert measurement.

Re-approved 2026-08-20 — the v10.4.0 release material: `docs/upgrading-to-v10-4.md` is new, and
the two per-version "coming from" pointers gained a v10.4 paragraph each.
paths 1195 -> 1223, anchors 157 -> 160, records unchanged. Every token is an addition to shipped
PROSE — no scanner, exemption or class changed — and the movement was attributed by reverting
each edited file in turn and re-running this gate. The three contributions DO NOT sum to the
total in isolation, because two of them cite the third: reverting the new doc alone gives
1198/157, not 1195/157, since README.md's and skills/help/SKILL.md's pointers at it then dangle
and stop being resolved. Solving the three measurements gives:
  docs/upgrading-to-v10-4.md   the note itself. 23 paths, 3 anchors. The paths are `install.sh`
                               x3, `hooks/dist/` x2, `rules/fusion-workbench-conventions.md` x2,
                               `rules/circle-records.md` x2, and one each of
                               `helpers/citation-scan.ts`, `hooks/node_modules`,
                               `hooks/package.json`, `agents/planner.md`, `agents/shaper.md`,
                               `README-hooks.md`, `README-agents.md`, the three new gate files,
                               and the four earlier upgrade notes. The anchors are
                               `README-hooks.md` `### Three gates that can fail the suite…`,
                               `README-agents.md` `## Dispatch parameters`, and
                               `rules/circle-records.md` `### Deletion is outside the vocabulary`.
  README.md                    the `**Upgrading from v10.3?**` paragraph. 2 paths (`hooks/dist/`
                               and the new note).
  skills/help/SKILL.md         the `**Coming from a v10.3 install:**` paragraph. 3 paths
                               (`hooks/dist/`, `install.sh`, and the new note).
WHAT DID NOT MOVE: `records` stays at 112. The note cites no workbench record — deliberately, as
the release material is read from an install that has none. The same Turn also bumped
`.claude-plugin/plugin.json` and the `FUSION_REF` example in `install.sh`; neither is a scanned
surface for class (a), and the version strings carry no path.

Re-approved 2026-08-20 — `bin/fusion-prose-metric` is new and CLAUDE.md's Layout table gained its
row (step 1 of `260820-2051-style-rules-arrive-and-get-measured`). paths 1223 -> 1235,
records 112 -> 113, anchors unchanged. Every token is an addition to shipped PROSE, the helper's
header and the row, and no scanner, exemption or class changed. Attributed by removing each of the
two in turn and re-running: the header carries 7 paths (`bin/fusion-staging-drift`,
`bin/fusion-review-coverage`, `rules/user-facing-output.md`,
`hooks/lib/__tests__/helpers/citation-scan.ts`, `hooks/dist/`, `__tests__/helpers/`, `bin/`), the
row those same four cited files plus its own `bin/…` key, and 1 record, the ceiling decision.

Re-approved 2026-08-21 — `/fusion:setup` gained Step 0e, the copied-asset comparison, and Step 0d
gained the stamp it reads (step 3 of `260820-2051-style-rules-arrive-and-get-measured`).
paths 1235 -> 1244, anchors 160 -> 161, records 113 -> 115. Every token is an addition to shipped
PROSE or to a shipped shell block, and no scanner, exemption or class changed. Attributed by
restoring each of the four edited files to HEAD in turn and re-running this gate; the four
contributions are independent and sum exactly, and `rules/fusion-workbench-conventions.md` and
`rules/workbench-tracking.md` each contribute ZERO in every class, which is why they are named
here rather than left out:
  skills/setup/SKILL.md   +8 paths, +1 anchor, +1 record. Four of the paths are the bare
                          `stilwerk/<profile>.yaml` operands of Step 0e's classification loop;
                          Step 0d's own loop supplies four more of the same spelling and gives
                          four back, because the four `$FUSION_PLUGIN_ROOT/stilwerk/…` operands
                          it used to carry became `$FUSION_PLUGIN_ROOT/$rel` and stop resolving —
                          a net wash there, and the reason the loop's contribution is +4 and not
                          +8. The other four paths are Step 0e's prose: `bin/fusion-source-root`,
                          `install.sh`, `rules/user-facing-output.md` and
                          `rules/fusion-workbench-conventions.md`, the last carrying the anchor
                          `## Project language`. The record is the distribution defect the step
                          closes, `260807-2154_*_corrected-sibling-wording…`.
  CLAUDE.md               +1 path, +1 record. The `bin/fusion-source-root` row now states why the
                          comparison reads the work tree — `install.sh` reads a GitHub tarball —
                          and cites the decision that scoped the exception to that comparison.
WHAT DID NOT MOVE: the two rule files. `rules/fusion-workbench-conventions.md` gained the
`.asset-provenance` tree line and a paragraph, and `rules/workbench-tracking.md` gained the same
entry on the record side of its split; neither text names a plugin path, a heading or a record,
and `fusion-workbench/…` is not a plugin-tree spelling. Confirmed individually by the same revert.

Re-approved 2026-08-21 — `emit_voice_profile` in `bin/fusion-rules` gained the comment that carries
its new stderr fallback notice (step 4 of the same Circle). paths 1244 -> 1247, anchors 161 -> 162,
records unchanged. All four tokens sit in that one comment: `rules/critical-stance.md`,
`hooks/lib/__tests__/rules-emission-golden.test.ts`, and `rules/fusion-workbench-conventions.md`
carrying `## Project language`. No scanner, exemption or class changed; attributed by restoring
`bin/fusion-rules` alone to HEAD and re-running this gate, which was green at the old numbers.

Re-approved 2026-08-21 — Step 0e's three shell blocks now resolve the source root themselves instead of
reading the held `$FUSION_SRC` (issues 260821-0140_*_setup-step-0e-reads-fusion-src-which-does-not-survive-the-fresh-shell-every-bash-call-gets.md and 260821-0141_*_setup-step-0e-has-a-sixth-outcome-absent-that-none-of-its-five-documented-cases-covers.md). paths 1247 -> 1254, anchors and records
unchanged: six are `$FUSION_PLUGIN_ROOT/bin/fusion-source-root`, twice in each block, the seventh is
`bin/fusion-rules` in the new `case5-missing-local` entry. Attributed by reverting that one file; green at 1247.

Re-approved 2026-08-21 — `agents/curator.md` gained the `Long-form prose vs short-form` block its seven
sibling prose prompts already carry (step 17 of the same Circle). paths 1254 -> 1255, anchors and records
unchanged. The one token is `rules/user-facing-output.md`, and it is the block's only plugin-tree-shaped
candidate: the second mention spells the file bare as `user-facing-output.md` and carries no directory, and
`./fusion-workbench/stilwerk/chat-voice-<lang>.yaml` is skipped as a placeholder on `<lang>` and is not a
plugin-tree spelling either way. Attributed by deleting that one block from `agents/curator.md` and
re-running this gate, which was green at 1254. No scanner, exemption or class changed.

Re-approved 2026-08-21 — the curator's applied entry L01 rewrote CLAUDE.md's `docs/` row, and the sentence
it put there cites `docs/upgrading-to-v10-3.md` and `docs/upgrading-to-v10-4.md` where the sentence it
replaced cited no path at all: that row's only earlier spelling, `upgrading-to-vN.md`, is bare and carries
no directory. paths 1255 -> 1257, anchors and records unchanged, the new sentence naming no heading and no
record; both files exist on disk, so both tokens resolve. No scanner, exemption or class changed.
ATTRIBUTED BY READING THE DIFF, not by the revert-and-remeasure the notes above describe: all three files
entry L01 touched (`CLAUDE.md`, `rules/fusion-workbench-conventions.md`, `rules/context-lean-claude-md.md`)
carried uncommitted changes belonging to another party, so restoring one to HEAD was never available and no
per-file measurement was taken. Their other seven changed lines are net zero in every class — none adds or
drops a path, an anchor or a record, and `skills/archive/SKILL.md:96` -> `:102` is one file at a new line —
which is what makes the read agree with the reported total: +2 is the `docs/` row's two new tokens alone.

Re-approved 2026-08-21 — `rules/user-facing-output.md` was edited twice in one commit, by steps 2 and 3 of Circle
260821-1042-reply-bounded-whole-question-answered: paths 1257 -> 1258, anchors 162 -> 163, records 115 -> 116. The
record is `## Length`'s citation of the decision fixing the session-summary total; the path and anchor are one
adjacent citation of `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`, prefix-resolved, in a
new `## Information architecture` sentence. No other rewrite in either step carries one; no scanner, exemption or
class changed. Attributed per step by undoing that edit: green at 115, then 1257/162.

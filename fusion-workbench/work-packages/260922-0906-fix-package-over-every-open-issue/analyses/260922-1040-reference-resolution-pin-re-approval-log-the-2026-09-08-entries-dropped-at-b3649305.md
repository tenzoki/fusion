# The reference-resolution pin's re-approval log, the 2026-09-08 entries dropped at `b3649305`

**Date:** 2026-09-22 10:40
**Type:** Record
**Requested by:** the acceptance clause of `260908-1853_*_the-reference-count-re-approval-omits-the-file-that-carries-its-whole-movement.md`, worked as step 23 of `260922-0922_*_the-51-open-issues-at-451bb312-worked-autonomously-as-one-package.md`
**Filed by:** coder, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7
**Cross-references:** `260904-2044_*_two-pin-re-approval-entries-were-dropped-instead-of-rolled-into-the-log-the-header-prescribes.md`, `260904-2202-reference-resolution-pin-re-approval-log-the-two-dropped-2026-08-29-entries.md`, `260915-1930-reference-resolution-pin-re-approval-log-entries-55-to-72.md`

## What this is

A repair of the attribution log that `hooks/lib/__tests__/reference-resolution-lint.test.ts` keeps at
`const BASELINE`, of the same kind as `260904-2202-reference-resolution-pin-re-approval-log-the-two-dropped-2026-08-29-entries.md`:
entries that stood on the line and were deleted rather than rolled are put where the header says older
entries go. That record states the convention and the decision that chose it; nothing here restates either.

**What was dropped, and where.** `git show b3649305 -- hooks/lib/__tests__/reference-resolution-lint.test.ts`
shows the `BASELINE` line replaced whole: the removed line pinned `1707/245/14` and carried the whole
2026-09-08 chain; the added line pins `1721/242/14` and its newest entry opens `paths 1713 -> 1721`, followed
directly by the entry that closes at 1696. Six entries stood between those two on the removed line. One of them,
the v10.25 upgrade note (`1696 -> 1713`), came back onto the line at `9c7f2575` and was rolled into
`260915-1930-reference-resolution-pin-re-approval-log-entries-55-to-72.md`. The other five are in no roll
record (`grep -rl` over every `.md` in the workbench for each entry's `paths` transition finds the defect
record, the plan this step runs under, and one review of the same Circle, none of them a roll), and they are
the five below:

| Commit | Pin before | Pin after | Entry |
|---|---|---|---|
| `3175f39e` | 1713/237/14 | 1692/237/14 | the cut of restated passages out of eight shipped skill bodies |
| `22d6f839` | 1692/237/14 | 1702/240/14 | steps 10 and 11: the cleanup stanza and the post body |
| `02533218` | 1702/240/14 | 1700/241/14 | steps 12 and 13: the help topic and the release check |
| `6bcb9306` | 1700/241/14 | 1702/243/14 | the closure repair pass over three drift items |
| `ce57f36a` | 1702/243/14 | 1707/245/14 | the two High findings of the closure review |

The "pin before" column is read off `git show <commit>^:hooks/lib/__tests__/reference-resolution-lint.test.ts`
for each row, and the "pin after" off the commit itself. The five are a straight parent chain in `git log`,
and every row's "pin before" is the row above's "pin after", so the pin itself walked
1713 → 1692 → 1702 → 1700 → 1702 → 1707 with no gap. `b3649305`'s parent is `7d45657b`, which pins
`1707/245/14`; its entry opens at 1713 all the same (inference: the diff shows the line replaced whole and
the five entries gone with it, which is the shape of a rewrite from a copy that predated them, and the diff
does not say more). That opening is the one break this record found between 1692 and 1721, and it is
outside this record's brief: the entry stands in its roll record as it was written, and this record is what
a reader lands on when its 1713 sends them looking for the commits between.

**The one entry that does not join is `22d6f839`'s.** Its text opens `paths 1703 -> 1702, anchors 242 -> 240`,
and neither 1703 nor 242 was ever the pin: the commit it replaced, `3175f39e` (and `b0705cc4` after it), pinned
`1692/237/14`. The defect record names the cause: the entry was written against the tree after the step-8 cut
landed in the same commit rather than against the pin the commit replaced, and it attributes three of the four
shipped files the commit touches while the fourth, `skills/post/SKILL.md`, 88 new lines, is not mentioned. The
entry is reproduced below exactly as it stood, because a recovered entry is evidence, and a corrected entry
follows it under its own heading.

## Reading these entries

All five are reproduced from `git show b3649305^:hooks/lib/__tests__/reference-resolution-lint.test.ts`,
line 483, where each stood as a chained continuation of the single comment line at `const BASELINE`. The
two oldest were also checked against `git show 22d6f839:` of the same file, where they stood as the line's
head and its first `Previous:` continuation, and are byte-identical there. As in the 2026-08-29 recovery:

- The ` Previous: ` connector that chained them is not part of any entry and is not reproduced, and no
  entry carries a `//` prefix, because none had one.
- They are given oldest first, the reverse of the order they held on the line, so a reader can walk the
  `paths` figures forward.

## The entries, verbatim

```
Re-approved 2026-09-08 (the cut of restated passages out of eight shipped skill bodies, rows 1 through 9 of the cut ledger): paths 1713 -> 1692, anchors and stampBare unmoved. Attributed by single-file revert against the full tree, one file at a time, rather than by reading the diff: the migrate body carries -3, the setup body -7, the help body -2, the next body -4, the direct body -3, the curate body -3, the archive body +1, and the cleanup body 0, which sums to the -21 observed. The negative entries are restatements replaced by a citation: a paragraph that named several plugin files by name now names one rule file or one helper header, so the tokens it used to spell are gone with it. The archive body gains one because its marker-vocabulary section now cites the Circle-records rule file, which it never named while it carried its own table. ANCHORS DID NOT MOVE, AND THAT IS A COINCIDENCE OF EQUAL COUNTS RATHER THAN OF NO CHANGE: the cut removed heading anchors with the paragraphs it collapsed and the replacements added the same number back, which is the shape of this cut - prose that restated a section is replaced by prose that cites it. stampBare did not move because every record citation these bodies carry was already the storeless wildcard form. NO GROWTH BASELINE MOVED AND NONE MAY: the surface these edits shrink is a bounded one and its inventory fixture is regenerated once at the end of the turn, not here. Named in prose rather than spelled, because this comment sits beside the corpus the gate counts.

Re-approved 2026-09-08 (steps 10 and 11 of the same Circle: the message half of the cleanup body becomes a read-and-perform stanza pointing at the new post body, and the two roster surfaces gain that body): paths 1703 -> 1702, anchors 242 -> 240, stampBare unmoved. Attributed by single-file revert against the full tree, one file at a time, rather than by reading the diff: with the full tree reading 1702/240, reverting the cleanup body alone reads 1704/242, reverting the instructions file alone reads 1702/240, and reverting the agents README alone reads 1701/240. So the cleanup body carries -2 paths and -2 anchors, the agents README +1 path, and the instructions file nothing at all, which sums to the -1 path and -2 anchors observed. THE CLEANUP BODY CARRIES THE WHOLE OF THE ANCHOR MOVEMENT: the passage it replaced named three plugin files and cited two of them by heading, and the stanza that replaced it names one file and cites no heading, because the contract those citations supported now lives in the body the stanza reads. The agents README gains one because its new table row spells the new body's file, which is the form the roster lint parses. The instructions file moves nothing because everything its bullet gained is a slash-command token and a selector name, neither of which is a path, and the one record it cites there is unchanged; stampBare did not move for the same reason. NO GROWTH BASELINE MOVED AND NONE MAY: the surface these edits touch is a bounded one and its inventory fixture is regenerated once at the end of the turn, not here. Named in prose rather than spelled, because this comment sits beside the corpus the gate counts.

Re-approved 2026-09-08 (steps 12 and 13 of the same Circle: the help topic's update section is advanced to the three current releases, and the release process gains a before-tagging check that reaches that surface): paths 1702 -> 1700, anchors 240 -> 241, stampBare unmoved. Attributed by single-file revert against the full tree, one file at a time, rather than by reading the diff: with the full tree reading 1700/241, reverting the help body alone reads 1703/241, reverting the instructions file alone reads 1699/240, and reverting the German intro doc alone reads 1700/241. So the help body carries -3 paths and no anchor, the instructions file +1 path and +1 anchor, and the intro doc nothing at all, which sums to the -2 paths and +1 anchor observed. THE HELP BODY LOSES PATHS BECAUSE THE THREE RELEASE PARAGRAPHS IT REPLACED SPELLED MORE SHIPPED FILES THAN THEIR SUCCESSORS DO: the retired trio named the upgrade notes for v10.20, v10.14, v10.8 and v10.7 together with `bin/fusion-citation-check`, `bin/fusion-citation-sweep`, `bin/fusion-identity` and `bin/fusion-session-domain`, while the new trio names the notes for v10.25, v10.24 and v10.23, `bin/fusion-citation-check`, and the `fusion-workbench/` directory the untracked-workbench defect is about. The instructions file gains the pair together, because its new check spells the help body's path and cites one heading inside it. The intro doc moves nothing because everything it gained is a selector name, which is not a path. NO GROWTH BASELINE MOVED AND NONE MAY: the surface these edits touch is a bounded one and its inventory fixture is regenerated once at the end of the turn, not here.

Re-approved 2026-09-08 (the closure repair pass over three drift items: the Layout row's skill split, the two reviewer defects whose citations were re-pointed after the text under them moved, and the reader doc's second copy of the composition contract): paths 1700 -> 1702, anchors 241 -> 243, stampBare unmoved. Attributed by single-file revert against the full tree rather than by reading the diff: with the full tree reading 1702/243, reverting the messages-between-checkouts doc alone reads 1700/241 green with every other edit of the pass still in place, so the whole movement is that one file and the instructions file contributes nothing. THE DOC GAINS TWO PATH-AND-ANCHOR PAIRS BECAUSE IT STOPPED RESTATING TWO CONTRACTS AND STARTED CITING THEM: the section on what a message looks like now names the post body and its composing step, and the filename sentence names the conventions file and its filename-pattern heading, where each before stated the number itself and named no file. The third heading that section gained is the doc's own where-the-mechanism-is-written-down section, a bare anchor with no path beside it, so scanHeadingAnchors has nothing adjacent to resolve and it moves nothing — which is why the two counts move together rather than the anchors moving by three. The last line's pointer swapped the cleanup body for the post body, one path either way. The instructions file's Layout row moves nothing because what it gained is a bare-anchor self-reference, a shell glob and a storeless wildcard record citation, none of which is a path this gate resolves; stampBare did not move for the same reason, that citation carrying the wildcard form. The four workbench records this pass edited move nothing because surface() never descends into the workbench, which the entries below already measured. NO GROWTH BASELINE MOVED AND NONE MAY: no bounded surface was edited at all — the documentation directory, the instructions file and the workbench records are outside all four collectors — and this line is rewritten in place with no line added, which is the unit the hook-test bound measures. The dangling-reference test passes on the same tree, so only the pinned count moved. Named in prose rather than spelled, because this comment sits beside the corpus the gate counts.

Re-approved 2026-09-08 (the two High findings of the closure review: the session anchor the pipeline deletes five steps before the message step reads it, and the message draft's missing vehicle on every branch where the one gate is never put): paths 1702 -> 1707, anchors 243 -> 245, stampBare unmoved. Attributed by single-file revert against the full tree rather than by reading the diff, and EVERY FILE IN THE WORKING TREE WAS CHECKED, not only the ones expected to move: reverting the cleanup body alone reads 1702/243 green with every other edit of the pass still in place, so it carries the whole movement; reverting the post body alone reads 1707/245, reverting the surface-growth golden alone reads 1707/245, and the machine-written event log and the two workbench issue records this pass closes are outside surface() by construction, so those four contribute nothing between them. THE CLEANUP BODY'S FIVE PATHS AND TWO ANCHORS SPLIT ACROSS ITS TWO EDITS, MEASURED SEPARATELY RATHER THAN REASONED: the session-anchor capture in Step 1 alone reads 1704/244, so +2 paths and +1 anchor, and the message half alone reads 1705/244, so +3 paths and +1 anchor, which sums to the five and the two with no overlap. The capture's two paths are the post body and the orchestrator prompt, the first cited for what each captured value is for and the second for the reading of the state file it already documents; its anchor is the post body's composing step. The message half's three are the curate body and TWO OCCURRENCES OF THE INSTRUCTIONS FILE'S OWN NAME, which the new bullet spells twice in naming the half that may end without asking anything; its anchor is the curate body's survey-reading step. The shell block in the capture spells the session state file, which is not a path this gate resolves, and it moved nothing: that is why the capture reads +2 and not +3. The record the message bullet cites moves nothing either, carrying the storeless wildcard form, which is also why stampBare did not move. NO GROWTH BASELINE MOVED AND NONE MAY: the skill-body surface was edited and its inventory fixture regenerated by its own failing-on-purpose run, which records growth and grants none - that surface reads 259 515 bytes against its 260 614 budget, 1 099 free, and the other three collectors were not touched at all. The dangling-reference test passes on the same tree, so only the pinned count moved. This line is rewritten in place with no line added, which is the unit the hook-test bound measures. Named in prose rather than spelled, because this comment sits beside the corpus the gate counts.
```

## The corrected entry for `22d6f839`

Not verbatim: this is the entry the commit should have carried, written from the pin the commit replaced.
The share for `skills/post/SKILL.md` is the enumeration the defect record made; the other three shares are
the ones the verbatim entry above measured, unchanged.

```
Re-approved 2026-09-08 (steps 8, 10 and 11 of the cut-skills-surface Circle in one commit, as its plan required: the message contract moves into its own step body, the message half of the cleanup body becomes a read-and-perform stanza pointing at it, and the two roster surfaces gain that body): paths 1692 -> 1702, anchors 237 -> 240, stampBare unmoved. The pin this replaced was 1692/237/14, at `3175f39e`. Four shipped files moved, and the four shares are disjoint and sum to the whole. `skills/post/SKILL.md`, the new body, carries +11 paths and +5 anchors: the forum helper once, the conventions file three times, the workbench-root helper, the paths helper, the user-facing-output rule, the archive body, and the identity helper three times (twice inside the shell block, once in the prose beneath it) are the eleven; `## Project language`, `## Path Resolution`, `## Filename Patterns`, `## Vocabulary` and `## Process` are the five. The cleanup body carries -2 paths and -2 anchors (the passage it replaced named three plugin files and cited two of them by heading; the stanza names one file and cites no heading), the agents README +1 path (its new table row spells the new body's file), and the instructions file 0/0 (a slash-command token and a selector name, neither a path). 1692 + 11 - 2 + 1 = 1702 and 237 + 5 - 2 = 240, read off the gate over the settled tree. The entry the commit actually wrote opened at 1703/242, which is 1692/237 with the post body's share already applied and then called a starting point rather than a share; it stands verbatim above, and this entry is what a reader walking 1692 -> 1702 -> 1707 uses instead.
```

## What did not change

The pinned numbers. Every commit named here pinned what the gate read over its own tree, and nothing about
those readings moves with this recovery. What this record restores is the account of the 2026-09-08 span
between 1692 and 1707, which the `1713 -> 1721` entry now rolled into
`260915-1930-reference-resolution-pin-re-approval-log-entries-55-to-72.md` jumped over.

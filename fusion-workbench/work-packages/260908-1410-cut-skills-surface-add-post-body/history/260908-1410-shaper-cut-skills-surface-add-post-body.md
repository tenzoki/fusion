# Shaper, anticipated Circle: cut the skills surface, add the `post` step body

**Date:** 2026-09-08 14:10
**Agent:** shaper (anticipated-circle mode)
**Mode:** anticipated-circle, dispatched via `/fusion:direct`
**Result:** Circle `260908-1410-cut-skills-surface-add-post-body`, record `_a_circle.md`

## The draft

Cut about 9 500 bytes out of the shipped skill bodies, then add `/fusion:post` as the fourth
cleanup-pipeline step body, with `/fusion:cleanup` Step 6's message half reading and performing it
inline the way Steps 4, 5 and 6 already read `archive`, `log-activity` and `curate`, so the message
composition contract exists once rather than twice. The draft cited the published ledger
`260908-1346-the-cut-ledger-for-the-skills-surface-and-what-the-post-body-owes.md` and carried two
rulings the user had already made: the inverted shape, and the rejection of the surface-count
objection. Domain `code`.

## Clarification

One round, relayed by `/fusion:direct` with the user's answers.

- **How far down the cut list?** All ten rows, with the review time spent on rows 7 through 9 while
  those files are open anyway.
- **Fold in the help topic's stale update section?** Yes, closing the known problem while the file
  is open, spending up to 700 of the freed bytes.
- **Which invocation shapes does the new body define?** Both, matching the three existing step
  bodies exactly: the end-of-session run reads it, and it also runs standalone.
- **If the new body exceeds the 6 500-byte upper estimate?** Stop, report the measured figure, put
  it back to the user. No further cutting under pressure, no trimming of the new body's statement of
  its own behaviour.

No second round was opened. The remaining candidates were either settled by the ledger with a
verified argument (the `--only forum` selector keeps its name, since renaming a documented flag buys
nothing and `curate`/`claude-md` already establish that a selector need not match its body) or
belong to the planner (commit splitting, cut ordering).

## Grounding work

Read the ledger in full, `skills/cleanup/SKILL.md` Step 6 and its message half, `skills/help/SKILL.md`'s
update topic, the closed Circle `260907-0829-message-between-checkouts-read-before-pull` and its
record, the open issue
`260906-2014_*_the-help-topic-on-updates-has-missed-two-releases-and-names-none-of-the-last-three.md`,
the open decision `260822-1154_*_does-a-cut-only-circle-re-baseline-the-surfaces-it-cuts.md`, and the
re-baselining doctrine in `hooks/lib/__tests__/helpers/growth-bound.ts`.

Three things were established rather than carried over.

**The ledger's figures still read this tree.** `wc -c skills/*/SKILL.md` at HEAD `8502d539` gives
259 495, the exact figure the ledger measured at HEAD `0f5597be`. The surface has not moved.

**The issue and the ledger disagree on which releases the help topic names, and the disagreement is
apparent.** Each paragraph is labelled by the install the reader comes from and describes the
releases after it. The labels are v10.14, v10.7 and v10.6, which is what the ledger measured; the
content covers v10.20, v10.14 and v10.7, which is what the issue named. Current release 10.25.0, so
both readings agree the topic is two releases behind.

**The open cut-only re-baselining record does not bind this Circle.** It asks whether a Circle that
only cuts may move a baseline. This one cuts in order to spend, and moving a baseline would hand back
the room the new body is meant to consume. The record stays open and is cited in the Grounding so a
later reader does not mistake its silence for permission.

## What was written

The Circle directory, its six artifact subdirectories, the `_a_` record and this file. No spec, no
plan, no decision record, no backlog change: the draft was raw text and not a backlog entry, and the
user's four answers left nothing deferred.

## Next step

Activation is the user's separate act, via `/fusion:next`. Nothing was dispatched and no Turn loop
was entered.

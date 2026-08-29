# Reconciliation: the attribution backfill (Turn 2, task R2)

**Status:** Complete
**Agent:** reconciler, domain `code`
**Range:** the pass ran between `53d656f` and `3d4b181`; its whole product is `3d4b181`
**Circle:** none active; every `SCAN_*` collapsed to `shared/`
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**This file was written retrospectively on 260825 at 14:30, at the cleanup reconcile step, and
not by the pass it describes.** The stamp is the time of writing rather than the time of the
work, deliberately: a backdated filename would make a missing record look like one that was
always there, which is the same substitution the pass itself refused to make on the records it
annotated. The facts below come from `3d4b181` and its diff, from
`260825-1250_*_twenty-eight-records-filed-since-the-attribution-rule-landed-carry-no-person-half-and-no-stated-reason.md`,
and from a re-measurement at HEAD.

## Why the pass wrote no record of its own

The pass reasoned that a history file it wrote would land inside the very window it was
measuring and would then need an attribution line of its own. The reasoning was sound in
shape and wrong in consequence, and it is worth stating why, because the next pass in the
same position will reach for it again.

The window is a predicate, not a date range with a moral: a record is in the measured set when
its stamp is later than `260824-1214`, it carries a `**Filed by:**` line, that line carries no
person half, and it states no reason. A history file written after the helper reached the
install copy at 260825-0829 carries a real person half and therefore lands in the compliant
column. It moves the total from 70 to 71 and the person count from 25 to 26; it cannot move
the 31, because the 31 is defined by an absence the new file does not have. The first pass's
own record,
`260825-1241-reconciliation.md`, is already in that window and already in the
compliant column, which is the counter-example that settles it.

What the reasoning correctly identified is that a measurement stated as a bare number is
disturbed by the act of recording it. The record's table answers that on its own terms by
naming a HEAD (`53d656f`) and a predicate, so a reader can re-run it rather than trust it. I
re-ran it at `3d4b181` and read 70 / 25 / 14 / 31, unchanged.

## What the pass did

**Thirty-one records gained one line each, in one form.** The line sits directly below the
record's `**Filed by:**` line in all thirty-one, names the agent that filed the record, states
that the person half is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried
no `bin/fusion-identity` at the time, and cites
`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
Its opening clause reads *"Attribution backfilled 260825 (not written by the filing agent)"*,
so the annotation is not mistakable for what the filing agent wrote. That was the pass's
central judgement and it was the right one: a backfilled line indistinguishable from a
compliant one converts a measured gap into invisible compliance, which is worse than the gap.

Six agents are represented: `ontorev` 10, `analyst` 8, `coderev` 7, `reconciler` 3, `coder` 2,
`ontocoder` 1.

**The defect record was corrected to what is true at HEAD** rather than left at the first
pass's figures: 70 in-window records, 25 carrying a person, 14 carrying the reason on the
line, 31 carrying neither. Its filename keeps the superseded number 28, because the spec and
the session's `## Coherence` section cite it by name and renaming it would break those
citations to fix a word. Its `### Three passes produced three different counts of one set`
section records why three honest passes over one unchanged set returned 28, 31 and 29. That is a
fact about the measurement rather than about the records.

**The marker stayed `_o_`, and that was correct.** The third acceptance criterion of the
spec's C3 is a claim about agent behaviour. A retrospective correction is not agent behaviour,
so the criterion is still unmet, and the two questions the record leaves open (which kinds of
file owe the field, and whether a gate should measure it) are untouched by a backfill.

**Six of the thirty-one now state the reason twice**, once in body prose that was already
there and once on the new line. The pass left them that way on purpose. Stripping them would
have required a second predicate, *reason stated anywhere in the record*, and that looser
reading is what produced the first pass's wrong split.

## Verification, re-run at HEAD rather than carried over

- The set of records carrying the backfill line and the set the predicate returns are
  **identical**, 31 files, compared by sorted path list. Nothing over- or under-reached.
- The annotation has **one** distinct line form across all 31, differing only in the agent
  name.
- In all 31 the line sits exactly one line below `**Filed by:**`, and no record in the set
  already carried a person half.
- The cited defect record resolves on disk.
- All 31 filename stamps fall between `260824-1621_*_the-filing-rules-residual-branch-promises-a-person-line-that-exit-5-does-not-print.md` and `260824-2155`. The claimed window is
  real: `bin/fusion-identity` entered the work tree in `3ba7a46` at 2026-08-24 11:30:31 and
  the installed copy carries mtime 2026-08-25 08:29. Not one record falls outside it.
- `cd hooks && npm test`: 43 files, 760 tests, exit 0. The three citation and plan lints pass
  individually.

## What the pass left behind

Two, both carried forward into the cleanup pass's own log and neither a fault of the backfill:

- `shared/issues/260825-1329_*` still quotes the superseded counts 28 and 42. It was not in
  the diff. Annotated on 260825-1430 rather than edited, because the measurement lives in the
  record the correction landed in.
- No history record, which is what this file repairs.

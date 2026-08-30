# Session: narrow the frozen-stores decision, file the residual

**Date:** 2026-08-30 22:25
**Agent:** analyst
**Status:** Complete
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Task:** step 5 of `260830-1841_*_citation-mechanism-four-defect-repair.md`

## What was done

**Part one.** Rewrote the Options section of
`260830-1816_*_do-the-frozen-stores-enter-the-sweeps-and-the-checkers-corpus-the-way-the-live-tree-does.md`
to the three alternatives that were actually live, recorded the user's answer, and transitioned the
record `_o_` → `_a_` → `_i_` (both footer lines written, then one rename to the `_i_` name). The
options as filed were framed around a move-versus-copy carve-out for `.migration-v2-backup/`; the
measurement removed its basis, so the record's own Recommendation was corrected in place with a
sentence saying it was corrected and why. `Answered:` cites the plan's step 4 and the user's choice
at the plan-review gate; `Implemented:` cites `32fe0d49`.

Corrected the record's `f1099c5f` figure from 566 to **565** `.md` files, and stated the cause rather
than only the correction: the 566th path was `skills/archive/SKILL.md`, a shipped skill body picked
up by a `grep` for `archive/`. Restricted to paths under the workbench's archive store ending in
`.md`, the commit reads 565 files, 3082 insertions against 3082 deletions.

**Part two.** Filed `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` as
a new `_o_` record with three options on one axis and the measurement below.

**Plan.** Step 5 marked `[DONE]`; the Open Questions entry now names the residual record and states
that it stays open.

## Measurements taken

All at `32fe0d49` over this repository's committed workbench (one uncommitted machine-written file
carries no Markdown and is outside every corpus here).

`bin/fusion-citation-check`: `files=2343`, `tokens=22144`, `judged=17628`, `resolved=16945`,
`dangling=312`, `store-prefixed=0`, `undecidable=3156`, `exempt=1731`, `verdict=violations`. The
figures move with each new record; the deltas below do not.

- The workbench holds 2310 `.md` files, 605 of them under the archive store, so the corpus before
  step 4 was 2343 − 605 = 1738 at this tree.
- 65 of the 312 violation rows sit in a file under the archive, across four sweep directories. By
  store of the containing file: issues 33, planning 25, analyses 3, decisions 2, backlog 1, the
  Circle record 1.
- All 312 rows split disjointly by whether anybody will edit the containing file: 65 frozen,
  191 live but of a marker-less kind (history 141, analyses 43, reviews 7), 56 live with a terminal
  marker (`_c_` or `_i_`), **0** live with a live marker. The zero is the blocking gate being green,
  measured rather than assumed.

**One claim from step 4 that did not survive checking, stated because it is load-bearing for the new
record.** The observation reached me as "a session history log that quotes archive paths now produces
violation rows". The rows exist, but they are not new at `32fe0d49`: the resolution index always
walked the whole workbench, so such a citation was already read and reported. None of the 65 added
rows is in a history file. The corrected form is in the residual record's Evidence.

## Verification

`cd hooks && npm test`. `ls` in the shared decision store reads, with the marker literals fenced so
the sweep does not rewrite the report of its own subject:

```
260830-1816_o_…   absent
260830-1816_i_…   present, one
260830-2225_o_…   present, the new residual
```

## What was not done

Nothing under `hooks/`, nothing under `bin/`, no source file. Nothing committed.

# Playmaker Session — 260813-0007-playmaker-direct-dispatch.md

**Trigger:** direct-dispatch (no skill; the dispatch prompt carried only the domain line)
**Domain bias:** `code`, parsed from `**Domain:** code` on the first content line
**Git HEAD at run time:** `1c2d555` (260812-2244, the v8.1.0 release commit)
**Status:** Complete

## Inventory

Twelve Circle directories, each carrying exactly one record.

| Marker | Meaning | Count |
|---|---|---|
| `_a_` | anticipated | 1 |
| `_t_` | active | 0 |
| `_c_` | closed coherent | 10 |
| `_b_` | bounded | 0 |
| `_s_` | superseded | 1 |
| `_d_` | deferred | 0 |

`.active-circle` is absent and no record carries the active marker. That is the normal opt-in
state, so no pointer warning was emitted. No Circle directory is missing its record.

## Ranking

**Top-ranked anticipated Circle:** `260801-1244-curator`, and it is the only one, so the rank
carries no information. It is ranked first and still not proposed for activation, because its
Grounding snapshot rests on measurements that have now been falsified twice.

The one precondition the previous run named has been discharged: the decision on how far the
project language reaches into the rule corpus,
`260807-1515_*_wie-weit-reicht-die-projektsprache-in-den-regelkorpus.md`, now
carries the implemented marker.

New measurement taken this run, against the tree at `1c2d555`. The partition that cut
`rules/fusion-workbench-conventions.md` from 51 416 to 34 671 bytes on 260805 has been undone:
the file regained 14 324 bytes across the twelve commits since, and stands at 49 992 bytes today.
That is the same regrowth shape the project's own analysis measured on the shell-classifier
deletion, and it bears on whether this Circle's one-off compaction is worth doing without a
rate-bounding component.

## Backlog

| Measure | Value |
|---|---|
| Entries read | 1, `260811-0826_*_observations.md` (`_o_`; no `_p_` entries exist) |
| Distinct ideas named inside it | 13 |
| Non-idea fragments excluded from the count | 2 (a bare path, a churn-ranking note) |
| Evidence transcripts excluded from the count | 5 |
| Duplicate groups named | 2 |
| Ideas already carried by a filed record | 7 (six defect records dated `260812-0253`, one decision record dated `260812-0254`) |
| Ideas handed to `## Warnings` as defect- or decision-shaped | 2 |
| Live and shapeable ideas remaining | 3 |

**Top-ranked backlog idea:** `bounded-dispatches-and-re-injected-context`, inside
`260811-0826_*_observations.md`. It rests entirely on records already on disk, so it
can be shaped today: the defect record
`260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` names four competing
remedies, and `260812-0303-simplify-speed-and-why-rules-do-not-hold.md` measures
that handoff between dispatches costs nothing and that shorter dispatches would cut cost roughly
fourfold.

**The entry was recommended for splitting first, not for shaping.** It carries thirteen ideas, and
`/fusion:direct` promotes an entry whole, which would make one Circle of all thirteen and retire the
lot. No `/fusion:direct` line was written into the portfolio for it.

Duplicate groups named: `self-repair-crowds-out-project-work` duplicates
`radical-simplification-of-fusion`, fullest statement in the entry's three closing questions;
`unverified-claims-relayed-upward` duplicates the filed record
`260812-0253_*_the-orchestrators-instructions-to-sub-agents-are-often-wrong.md`.

Nothing was written into the backlog store. No entry was created, renamed or edited, and no
recommended marker was set, which the open decision
`260812-2043_*_who-writes-the-recommended-marker-on-a-backlog-entry.md` records as
having no writer today.

## Warnings emitted to the portfolio

- `curator-circle-missing-artifact-subdirectories` — `260801-1244-curator` holds only its
  record; the six required artifact subdirectories are absent.
- `curator-grounding-measurements-falsified` — five measured claims in the Grounding snapshot of
  `260801-1244-curator` no longer hold, three of them for the second time.
- `claude-md-always-on-figure-is-four-kilobytes-stale` — `CLAUDE.md` states 88 023 bytes of
  always-on rules per dispatch and 80 670 bytes of shipped rule text; measured today, 91 891 and
  84 538. True when written on 260812, overtaken within a day.
- `backlog-idea-13-only-partly-filed` — the observation that every operation takes unbearably long
  exists only as a witness line inside a record scoped to Setup.
- `backlog-marker-has-no-writer` — the open decision named above, surfaced because it bounds what
  the portfolio's backlog section can carry.

## Dependency warnings appended

None. The dependency graph over non-terminal Circles has a single node,
`260801-1244-curator`, whose three edges all point at closed Circles. No cycle exists, so no
`## Dependency warning` section was appended to any record.

## Parent-grounding-stale events

None. No Circle record carries the bounded marker, so the propagation scan in Step 5 had no
starting point. The curator's stale measurements are drift in an anticipated Circle and were
reported as an ordinary warning, not as this event.

## Writes performed

| Path | Write |
|---|---|
| `fusion-workbench/portfolio.md` | full regeneration (overwrite) |
| `260801-1244-curator` | appended `## Activation proposal (playmaker run 260813-0007-playmaker-direct-dispatch.md)` |
| `260813-0007-playmaker-direct-dispatch.md` | this file |

No marker was renamed, `.active-circle` was not touched, and no plan, queue, decision, issue,
backlog entry, code or data file was modified.

## Note on language

The activation proposal was appended in English. A Circle record is a persisted file for the
project's own use, so it follows the artifact language declared in `CLAUDE.md`, which is `en`. The
proposal from run 260807-1646-playmaker-direct-dispatch.md sitting above it is German; it predates the implementation of the
project-language decision and was left untouched, since playmaker appends and never rewrites.

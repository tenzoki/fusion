# Playmaker run 260813-1756

**Trigger:** direct-dispatch
**Domain bias:** `code` (parsed from the dispatch prompt's `**Domain:**` line)
**Workbench:** /Users/k1/Projects/productive/fusion/fusion-workbench
**Git HEAD at run:** `267a65c`
**Status:** Complete

## Inventory

| Marker | Count | Circles |
|---|---|---|
| `_a_` anticipated | 2 | `260813-0910-documentation-matches-shipped-plugin`, `260801-1244-curator` |
| `_t_` active | 0 | none |
| `_c_` closed-coherent | 11 | |
| `_b_` bounded | 0 | none |
| `_s_` superseded | 1 | `260804-1205-shell-reachability-model` |
| `_d_` deferred | 0 | none |

`.active-circle` is absent and no record carries `_t_`. The two agree, so no pointer warning was
raised.

## Ranking

**Top-ranked anticipated Circle:** `260813-0910-documentation-matches-shipped-plugin`. Its one
dependency is closed coherent, its Grounding cites no unresolved decision, and the deferred 8.2.0
release is queued behind it.

Second: `260801-1244-curator`. Equal on the raw code heuristic, ranked below on falsified Grounding
measurements that the heuristic cannot see.

## Backlog

| Measure | Count |
|---|---|
| Entries read | 1 (`_o_` 1, `_p_` 0) |
| Distinct ideas named inside them | 13 |
| Live and shapeable | 3 |
| Already carried by a filed record | 7 |
| Duplicate groups named | 3 |
| Fragments excluded as not ideas | 2 |
| Handed to `## Warnings` as defect-shaped or decision-shaped | 1 |

**Top-ranked entry:** `shared/backlog/260811-0826_*_observations.md`, recommended for splitting
first rather than shaping, because `/fusion:direct` promotes an entry whole and would make one
Circle of all 13 ideas. Its top idea is `bounded-dispatches-and-re-injected-context`, ranked first
because both records it rests on are already on disk.

**Backlog writes performed:** none. No entry was created, renamed, split, merged, closed, or
deferred. The agent prompt behind this run came from the installed plugin copy, which predates the
backlog mandate and forbids every backlog write, while `bin/fusion-paths playmaker` emitted
`OUT_BACKLOG` because the helpers prefer the working tree here. The run followed the prompt it was
given.

## Warnings emitted to the portfolio

- `installed-copy-predates-the-backlog-mandate` — installed prompt 27 597 bytes, working-tree
  prompt 39 155 bytes, both plugin manifests reading 8.1.0.
- `backlog-acceptance-run-still-not-performed` — third run to have the opportunity and not take it.
- `write-key-defect-record-open-after-its-circle-closed` — `shared/issues/260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
  still open with its four acceptance conditions reading as met.
- `curator-grounding-measurements-falsified` — 54 401 bytes / 32 headings claimed, 51 920 bytes /
  24 headings measured. Fifth consecutive run.
- `curator-circle-missing-artifact-subdirectories` — all six absent.
- `one-sided-dependency-is-now-frozen` — the closed Circle's placeholder can no longer be filled.
- `claude-md-always-on-figure-is-stale` — `CLAUDE.md:64` claims 88 023 bytes, measured 93 819.
- `fusion-direct-cannot-run-the-flow-it-documents` — the backlog-to-Circle path runs through
  `shared/issues/260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`.
- `backlog-idea-only-partly-filed` — "every operation takes unbearably long" exists only as a
  witness line inside a Setup-scoped record.

## Dependency warnings appended

None. The graph over the two anticipated Circles has no edges: every dependency either names points
at a closed Circle. No cycle exists, and no `## Dependency warning` section was appended to any
record.

## Parent-grounding-stale events

None. No Circle record carries the `_b_` marker, so the propagation scan had no starting point.

## Writes performed

- `fusion-workbench/circles/260813-0910-documentation-matches-shipped-plugin/_a_circle.md` —
  appended `## Activation proposal (playmaker run 260813-1756)`, confirming the 260813-1623
  proposal and recording what was re-verified.
- `fusion-workbench/portfolio.md` — regenerated in full.
- This history file.

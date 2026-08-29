# Playmaker Session — 260813-1623-playmaker-direct-dispatch.md

**Trigger:** direct-dispatch (no skill; the dispatch prompt carried only the domain line)
**Domain bias:** `code`, parsed from `**Domain:** code` on the first content line
**Git HEAD at run time:** `931338a`
**Status:** Complete

## The finding that shaped this run

The agent prompt behind this run came from the installed plugin copy at `~/.fusion`, which predates
the backlog mandate that landed at HEAD this afternoon. Measured, not inferred:
`/Users/k1/.fusion/agents/playmaker.md` is 27 597 bytes and carries the old write-narrow scope;
`agents/playmaker.md` in the working tree is 39 155 bytes and carries the two-mandate backlog
section. Both `.claude-plugin/plugin.json` files read 8.1.0, because the version bump was
deliberately deferred.

The split is visible inside this run's own Setup. `bin/fusion-paths playmaker` emitted
`OUT_BACKLOG=shared/backlog`, because the helpers prefer the working tree in this repository and
the key is derived from the working-tree prompt. The prompt governing the run forbids every backlog
write. The run followed the prompt it was given and wrote nothing into the store, and reported the
conflict rather than resolving it by choosing the more permissive of the two. That choice is worth
recording: an agent that reaches for a capability its own instructions deny, on the evidence that a
file elsewhere grants it, is the failure mode this store is least able to undo.

Consequence for the Circle that closed this afternoon: its closure note names the end-to-end
acceptance run as the one thing not demonstrated and says the first real run is where the gap
closes. This run was that opportunity. It could not take it, and the cause is one command
(`fusion --update`) plus a session restart.

## Inventory

Fourteen Circle directories, each carrying exactly one record.

| Marker | Meaning | Count | Change since 260813-0926-playmaker-direct-dispatch.md |
|---|---|---|---|
| `_a_` | anticipated | 2 | −1 |
| `_t_` | active | 0 | unchanged |
| `_c_` | closed coherent | 11 | +1 |
| `_b_` | bounded | 0 | unchanged |
| `_s_` | superseded | 1 | unchanged |
| `_d_` | deferred | 0 | unchanged |

`260813-0858-playmaker-maintains-backlog-store` moved from anticipated to closed coherent
between the two runs. It was the previous run's top-ranked Circle, and it was activated, executed
over four Turns and closed inside session `260813-0806-orchestrator-session.md`.

`.active-circle` is absent and no record carries the active marker. The two agree, so no pointer
warning was emitted. No Circle directory is missing its record.

## Ranking

**Top-ranked anticipated Circle:** `260813-0910-documentation-matches-shipped-plugin`. Its one
dependency closed this afternoon, its Grounding cites no unresolved decision, and the deferred
8.2.0 release is waiting on it by the user's own decision at the previous Circle's release gate.

Full order: (1) `260813-0910-documentation-matches-shipped-plugin`, (2) `260801-1244-curator`.

**Where the ranking departs from the raw heuristic.** Both Circles now pass both tests of the code
bias: no unresolved decision cited, every dependency closed. On the score alone they tie. The
curator ranks second because the heuristic reads what a record states and cannot read whether the
statement still holds, and two load-bearing measurements in its Grounding do not. The departure is
the same one the previous three runs made, for the same reason, and it is stated in the portfolio
entry rather than only here.

## Backlog

| Measure | Value |
|---|---|
| Entries read | 1, `260811-0826_*_observations.md` (`_o_`; no `_p_` entries exist) |
| Distinct ideas named inside it | 13 |
| Non-idea fragments excluded from the count | 2 (a bare file path, a churn-ranking note) |
| Evidence transcripts excluded from the count | 5 (the quoted agent replies) |
| Duplicate groups named | 3 |
| Ideas already carried by a filed record | 7 (six defect records dated `260812-0253`, one decision record dated `260812-0254`) |
| Ideas handed to `## Warnings` as defect-shaped | 1 |
| Live and shapeable ideas remaining | 3 |

**Top-ranked backlog idea:** `bounded-dispatches-and-re-injected-context`, inside
`260811-0826_*_observations.md`. It rests entirely on records already on disk, so it
can be shaped as soon as the entry is split:
`260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md` names the competing
remedies, and `260812-0303-simplify-speed-and-why-rules-do-not-hold.md` measures
that the handoff between dispatches costs nothing while shorter dispatches would cut cost roughly
fourfold.

**The entry was recommended for splitting first, not for shaping.** Thirteen ideas, and
`/fusion:direct` promotes an entry whole. No `/fusion:direct` line was written into the portfolio
for it.

The entry is byte-identical to what the previous run read, so its reading is carried forward
unchanged rather than re-derived: three duplicate groups, seven ideas already filed elsewhere,
three live.

**Backlog writes performed: none.** No entry was created, renamed, split, merged, closed or
deferred. The reason is the stale installed prompt described at the top of this file, not the
absence of a write key — the key exists at HEAD and the resolver emitted it.

## Warnings emitted to the portfolio

- `installed-copy-predates-the-backlog-mandate` — new this run. The running prompt is the installed
  27 597-byte copy; the working tree's is 39 155 bytes and carries the mandate. Both version files
  read 8.1.0. Remedy: `fusion --update` and restart the session.
- `backlog-acceptance-run-still-not-performed` — new this run. The closed Circle's own gap, now
  with a named cause.
- `write-key-defect-record-open-after-its-circle-closed` — new this run.
  `260813-0825_*_the-playmaker-is-charged-with-backlog-upkeep-and-holds-no-write-key-to-the-store.md`
  reads as met against HEAD and still carries the open marker.
- `curator-grounding-measurements-falsified` — fourth consecutive run. Claimed 54 401 bytes across
  32 second-level headings; measured 51 920 across 24. The byte figure moved toward the claim,
  because the file gained 1 928 bytes since 09:26 today.
- `curator-circle-missing-artifact-subdirectories` — unchanged from the previous run.
- `one-sided-dependency-is-now-frozen` — changed class this run. The Circle holding the incomplete
  citation has closed, so the citation cannot be completed on that side at all. Filed as
  `260813-0913_*_a-dependency-between-two-circles-can-only-be-recorded-on-one-side-because-nobody-may-write-the-other.md`,
  whose scope now needs widening.
- `claude-md-always-on-figure-is-stale` — `CLAUDE.md:64` claims 88 023 bytes (80 670 shipped);
  measured 93 819 (86 466 shipped) over the five always-on files plus this project's chat profile.
- `fusion-direct-cannot-run-the-flow-it-documents` — new this run, from
  `260813-1334_*_fusion-direct-documents-a-shaper-clarification-flow-that-a-dispatched-sub-agent-cannot-run.md`.
  Surfaced because the path from a split backlog idea to a Circle runs through `/fusion:direct`.
- `backlog-idea-only-partly-filed` — unchanged from the previous run.
- Resolved and recorded so it is not re-reported: the three failing tests are fixed and
  `260813-0828_*_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md`
  now carries the closed marker. The previous run reported them as live.

## Dependency warnings appended

None. The graph over the two anticipated Circles has no edges at all: every dependency either
Circle names points at a closed Circle and therefore leaves the non-terminal graph. The single edge
the previous run recorded disappeared when its target closed. No cycle exists, so no
`## Dependency warning` section was appended to any record.

## Parent-grounding-stale events

None. No Circle record carries the Bounded Closure marker anywhere in the store, so the propagation
scan in Step 5 had no starting point.

## Writes performed

| Path | Write |
|---|---|
| `fusion-workbench/portfolio.md` | full regeneration (overwrite) |
| `260813-0910-documentation-matches-shipped-plugin` | appended `## Activation proposal (playmaker run 260813-1623-playmaker-direct-dispatch.md)` |
| `260813-1623-playmaker-direct-dispatch.md` | this file |

No marker was renamed, `.active-circle` was not touched, and no plan, queue, decision, issue,
backlog entry, code or data file was modified. No `## Activation proposal` was appended to
`260801-1244-curator` this run; the two proposals already on that record, from
runs 260807-1646-playmaker-direct-dispatch.md and 260813-0007-playmaker-direct-dispatch.md, stand and were not rewritten.

# Playmaker run 260802-0811-playmaker-direct-dispatch.md — portfolio regeneration

**Trigger:** direct-dispatch
**Domain bias:** code (parsed from the dispatch prompt's `**Domain:** code` line)
**Status:** Complete

## Inventory

Nine Circle directories, marker read from each record's filename:

| Marker | Meaning | Count | Circles |
|---|---|---|---|
| `_a_` | anticipated | 3 | `260801-1244-rule-provenance-header`, `260801-1244-guard-rules-write`, `260801-1244-curator` |
| `_t_` | active | 0 | — |
| `_c_` | closed-coherent | 6 | `260801-1244-guard-bash-inspection`, `260719-1536-plane-mirror-integration`, `260719-1536-brest-unite-co-creator-conversion`, `260718-1924-v5x-overhaul`, `260717-1638-marker-format-ohne-glob-metazeichen`, `260716-1847-workbench-umbau` |
| `_b_` | bounded closure | 0 | — |
| `_s_` | superseded | 0 | — |
| `_d_` | deferred | 0 | — |

`fusion-workbench/.active-circle` is absent and no record carries `_t_`. That is the normal post-closure state; no pointer warning was emitted.

## What changed since the previous run (260801-2341)

Little, and none of it touches the ranking. Two orchestrator sessions ran Setup and stopped without a Directive (`260801-2318-orchestrator-session.md`, `260801-2358-orchestrator-session.md`). One issue was filed, `260801-2352_*_plugin-settings-json-has-no-agent-allow-entries.md`, taking the shared open set from seventeen to eighteen. No commit landed since `e8988d9`, and no file was added to or removed from the plugin's `rules/` directory.

## Ranking

Top-ranked: **`260801-1244-rule-provenance-header`**. Empty `## Dependencies`, zero open (`_o_`) decision records in its Grounding snapshot, and the only hard prerequisite of `260801-1244-curator`. Ranked 2: `260801-1244-guard-rules-write`, unblocked but blocking nothing hard. Ranked 3: `260801-1244-curator`, hard-blocked on rank 1.

The ranking was re-derived from disk rather than carried over from the previous portfolio. Supporting measurements taken this run: the plugin's `rules/` directory holds ten files, of which one carries a provenance line (`rules/fusion-workbench-conventions.md:326`); the shared decision store holds zero open (`_o_`) records, four answered (`_a_`) and five implemented (`_i_`); `git ls-files fusion-workbench/` returns 237.

## Warnings emitted to the portfolio

- The previous playmaker run (260801-2341) regenerated the portfolio, cited `260801-2341-playmaker-user-fusion-next.md` as its own record, and never wrote that file. It also appended no activation proposal to the Circle it recommended.
- The workbench is now tracked in git, which falsifies a constraint the `260801-1244-curator` record lists as verified.
- The same commit partly overtakes `260801-1020_*_workbench-untracked-breaks-archive-durability-premise.md`, which needs re-verifying rather than closing.
- Grounding drift in the recommended Circle: it states nine rule files; there are ten.
- `fusion-workbench/tasklist.md` still holds a fully closed queue from 260716-1920, filed as `260801-2038_*_tasklist-holds-a-fully-closed-queue-from-a-circle-closed-two-weeks-ago.md`.
- Eighteen open issues in the shared store, one more than at the previous run; two more open inside Circles.

## Dependency cycles

None. The graph over the anticipated Circles is a tree. No `## Dependency warning` section was appended to any record.

## Bounded-closure propagation

No Circle carries `_b_`, so the parent-grounding-stale check did not fire. No `parent-grounding-stale` events.

## Writes made this run

- Appended a second `## Activation proposal` to `260801-1244-rule-provenance-header`, dated 260802-0811-playmaker-direct-dispatch.md. The first, from run 260801-2044-playmaker-user-fusion-next.md, was left intact.
- Regenerated `fusion-workbench/portfolio.md` in full.
- This log.

No marker was renamed and `.active-circle` was not written, per playmaker's scope.

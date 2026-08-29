# Playmaker run 260802-1736-playmaker-direct-dispatch.md — portfolio regeneration after a Circle closure

**Trigger:** direct-dispatch (user, portfolio refresh after `260801-1244-rule-provenance-header`
closed coherent at commit `060859b`)
**Domain bias:** code (parsed from the dispatch prompt's `**Domain:** code` line)
**Status:** Complete

## Inventory

Nine Circle directories, marker read from each record's filename.

| Marker | Meaning | Count | Circles |
|---|---|---|---|
| `_a_` | anticipated | 2 | `260801-1244-guard-rules-write`, `260801-1244-curator` |
| `_t_` | active | 0 | — |
| `_c_` | closed-coherent | 7 | `260801-1244-rule-provenance-header`, `260801-1244-guard-bash-inspection`, `260719-1536-plane-mirror-integration`, `260719-1536-brest-unite-co-creator-conversion`, `260718-1924-v5x-overhaul`, `260717-1638-marker-format-ohne-glob-metazeichen`, `260716-1847-workbench-umbau` |
| `_b_` | bounded closure | 0 | — |
| `_s_` | superseded | 0 | — |
| `_d_` | deferred | 0 | — |

`fusion-workbench/.active-circle` is absent and no record carries `_t_`. That is the normal
post-closure state; no pointer warning was emitted.

The anticipated set went from three to two. The dispatch prompt referred to three remaining
anticipated Circles and named two of them; on disk there are two.

## Ranking

**Top-ranked: `260801-1244-guard-rules-write`.** This reverses the previous three runs, which
ranked it second behind `260801-1244-rule-provenance-header`.

Both remaining Circles pass the code-domain criteria without a tie-breaker. Each has every hard
dependency closed, and neither `## Grounding snapshot` cites an open decision record. Verified
this run: the shared decision store holds zero open (`_o_`) records, two answered (`_a_`) and
seven implemented (`_i_`). `260801-1020_*_provenance-header-on-rule-files.md`
moved to `_i_` at the closure.

The ranking therefore turned on unblock value, and the position reversed because of what closed
one Circle earlier rather than what closed this run. `hooks/config.json` lists `rules/**` under
`guard.protectedPaths`, and since `260801-1244-guard-bash-inspection` closed, the guard checks
that list on file-mutating shell commands as well as on the four write tools. No route into a
consuming project's rule files remains open, and `FUSION_ALLOW_RULES_WRITE`, the flag that is
meant to open a deliberate one, is what the recommended Circle builds. The spec's reconciler
recorded the same state on 260801-2029. The curator record calls the dependency soft, which is
correct for building the agent here (the write guard stands down in the plugin tree,
`hooks/lib/self-detect.ts:18-33`) and understated for the consuming projects the curator serves.

Ranked 2: `260801-1244-curator`, with the recommendation to split it before activating rather
than to activate it.

## The split recommendation, re-examined rather than carried forward

**It still holds, on stronger evidence.** The seam is unchanged and the record draws it: C1 to C4,
C6 and C7 build the agent, C9 applies it to the conventions file, and the record already states
that C9 does not begin until C1 through C8 are complete.

Three findings this run bear on it.

1. The base rate for overrun is now two Circles, not one. `260801-1244-rule-provenance-header` was
   forecast in the previous portfolio as the small, bounded, in-repo-verifiable case. Measured
   from its record and its plan: four implementation steps, three Turns, eight commits, ten review
   findings filed of which three remain open, fourteen non-workbench paths delivered against a
   plan bounded to eleven, Phase 3 verdict `review-needed`. The properties that made it low-risk
   did not prevent the overrun.
2. The mechanical support C9 inherits is thinner than the closure note's summary reads. The gate
   recurses, confirmed in `hooks/lib/__tests__/provenance-header-lint.test.ts`, whose own comment
   names the curator's shards as the reason. It is presence-only by design: it reads no value and
   resolves no cited path.
3. Citation rot in the conventions file is active, not historical. See below.

## Warnings emitted to the portfolio

- **All three `Binding decision:` citations in `rules/fusion-workbench-conventions.md` are dead,
  and the newest broke inside the Circle that just closed.** Lines 328, 592 and 688. Line 592 was
  written last session as the worked instance of the newly formalised mechanism at line 588, and
  cites `260801-1020_*_provenance-header-on-rule-files.md`, which stopped
  resolving when that record moved to `_i_` at closure. The mechanism is the finding: a citation
  path carrying a state marker dies on ordinary progress. The ten file-scoped `Provenance:`
  headers are immune, citing markerless Circle directories or commits.
- **Four measured facts in the curator's Grounding snapshot moved,** three of them because of the
  Circle that just closed. Always-on rule bytes: record 87 387, measured 110 685. Conventions
  file: record 54 401, measured 59 303 (+4 902 from the new `## Provenance headers on rule files`
  section). Second-level headings: record 32, measured 33. Citing lines into the file: record 131
  across 42 files, measured 136 across 43 over `agents/`, `skills/`, `bin/`, `hooks/`, `docs/`,
  `rules/`, `README*.md`, `CLAUDE.md`. The conclusions drawn from all four survive; the numbers do
  not.
- **The lint gate checks presence only.** Reported so the closure note's "the shards will be
  checked" is not read as more than it is.
- **The workbench is tracked in git and the curator record still says otherwise.** Reported at the
  previous run, uncorrected. `git ls-files fusion-workbench/` returns 273, up from 237.
- **`260801-1020_*_workbench-untracked-breaks-archive-durability-premise.md` is
  still partly overtaken** and needs re-verifying rather than closing.
- **`fusion-workbench/tasklist.md` is still the closed queue from 260716-1920.**
- **Nineteen open issues in the shared store,** one more than the previous run
  (`260802-0920_*_next-skill-activates-a-circle-without-updating-its-status-field.md`), and five
  open inside Circles, three more than the previous run, all three left open in the closed Circle
  by explicit user decision.

## Records written

- `## Activation proposal` appended to
  `260801-1244-guard-rules-write`. First proposal on that record.
- No `## Dependency warning` appended. No cycle exists; the graph over the two anticipated Circles
  is a chain.
- No `## Parent grounding stale` appended. No Circle carries `_b_`, so the propagation check does
  not fire.
- No marker renamed, no `.active-circle` written.

## Portfolio

`fusion-workbench/portfolio.md`, regenerated in full.

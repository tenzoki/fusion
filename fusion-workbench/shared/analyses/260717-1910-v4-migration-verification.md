# Analysis: Post-migration verification of the v4.0.0 Circle-container workbench

**Date:** 2026-07-17 19:10
**Type:** Gap / Feasibility (verification)
**Status:** Complete
**Requested by:** orchestrator (end-to-end dogfooding run)

## Question

Did the fusion workbench migrate cleanly from the pre-v4 type-folder layout to the
v4.0.0 Circle-container layout? Four sub-questions: (1) is the container layout
well-formed, (2) are the moved artifacts intact, (3) does `bin/fusion-paths` resolve
into `shared/` with no active Circle, (4) is there any root type-folder residue or a
half-migrated split?

This report is itself part of the verification: with no active Circle, the analyst's
own write targets must land in `shared/analyses/` and `shared/history/`. That placement
was confirmed before writing (see Finding 3).

## Scope

The workbench at
`/Users/kai/Dropbox/qboot/projects/F04-FUSION/codebase/fusion/fusion-workbench`.
Read-only inspection of directory structure, per-store file counts, the single Circle
directory, the merged reviews store, root-anchored session/hook surfaces, and two
resolver invocations (`analyst`, `reconciler`). No Circle created or activated.

## Findings

### 1. Layout correctness — PASS

| Check | Result |
|---|---|
| `circles/` present at root | Yes — holds one Circle directory |
| `shared/` holds the type stores | Yes — planning, issues, decisions, history, analyses, reviews, investigations, consult, memos all present |
| Root-anchored surfaces at root, not in `shared/` | `orchestrator-live.md`, `orchestrator-events.jsonl`, `.guard-state/`, `.session-marker`, `monitor`, `tasklist.md`, `stilwerk/`, `archive/`, `.fusion-setup` all at root |
| No type store duplicated inside `shared/` | None — nested-dup scan (`shared/<store>/<store>`) empty |
| No root-anchored surface misplaced inside `shared/` | None — misplacement scan empty |

`agentstate.yaml` is absent at the root; the task framed this as conditional ("if any")
so its absence is not a fault. `.active-circle` is correctly absent because the one
Circle is anticipated (`[a]`), not active (`[t]`) — the pointer is written only on
`[a]→[t]`. `.fusion-setup` records `plugin_version: 4.0.0`, confirming the layout was
stood up by a v4 setup.

### 2. Migration integrity — PASS

Per-store file counts under `shared/`:

| Store | Files |
|---|---|
| planning | 2 |
| issues | 23 |
| decisions | 8 |
| history | 9 |
| analyses | 3 |
| reviews | 2 |
| investigations | 0 |
| consult | 0 |
| memos | 0 |
| **Total** | **47** |

- **No 0-byte / truncated files** anywhere under `shared/` (empty-file scan blank).
  Spot-checked heads of an issue and the Circle record — both begin with a valid
  `#` title and body, i.e. readable and intact.
- **Count reconciliation:** 47 total vs the 45 expected moved artifacts. The extra
  two are post-migration session logs in `history/` (migration completed ~18:27;
  `260717-1832-orchestrator-session.md` and the setup-generated entries are newer).
  So ~45 migrated + post-migration session history = 47. Consistent, not a defect.
- **Reviews merge — confirmed.** `shared/reviews/` holds the merged output of the
  three former review folders (code-reviews / onto-reviews / concept-reviews). The
  two present files both carry the sender inserted into the filename:
  `260716-1853-conceptrev-spec-...` and `260716-1914-conceptrev-plan-...`. Only
  conceptrev files survived because the code- and onto-review folders were empty
  pre-migration; the merge target and the sender-in-filename convention are correctly
  applied.
- **Circle became a directory — confirmed.**
  `260717-1638-marker-format-ohne-glob-metazeichen` contains `[a]-circle.md`
  (record carries the state marker; directory name is marker-free and stable) plus
  exactly 6 subdirs: `analyses/`, `decisions/`, `history/`, `issues/`, `planning/`,
  `reviews/`. The record's front matter reads `Status: anticipated`, matching the
  `[a]` marker.

### 3. Resolver behaviour — PASS

Both resolvers exited 0 and routed every write/scan key into `shared/` (no active
Circle):

- `bin/fusion-paths analyst` → `OUT_HISTORY/OUT_ISSUE/OUT_DECISION/OUT_ANALYSIS` +
  `SCAN_*` all `shared/...`. `OUT_ANALYSIS=shared/analyses`, `OUT_HISTORY=shared/history`
  — the two targets this report and its session log were written to.
- `bin/fusion-paths reconciler` → `OUT_*` + `SCAN_*` (including `SCAN_REVIEWS=shared/reviews`,
  `SCAN_ANALYSES=shared/analyses`) all `shared/...`.

The Circle-vs-`shared/` decision resolving to `shared/` with `.active-circle` absent is
the intended no-active-Circle behaviour.

### 4. Residue check — PASS

- No type-folder survives at the workbench root: scan for `planning/ issues/ decisions/
  history/ analyses/ reviews/ investigations/ consult/ memos/ code-reviews/ onto-reviews/
  concept-reviews/` at root found none.
- No half-migrated split: the only stores are under `shared/` (and the Circle's own
  subdirs); nothing straddles both root and `shared/`.

## Implications

The v4.0.0 Circle-container migration on the fusion plugin's own workbench is complete
and well-formed on all four axes. The dogfooding goal is met: an analyst dispatched with
no active Circle resolved its write targets into `shared/analyses/` and `shared/history/`
correctly, and the resolver-driven path contract held end-to-end.

## Recommendations

- No remediation required. Migration verified clean.
- Optional: once the anticipated Circle
  `260717-1638-marker-format-ohne-glob-metazeichen` is activated (`[a]→[t]`), confirm
  `.active-circle` appears at the root and the resolver then routes `OUT_*` into that
  Circle's subdirs — that is the complementary path this run could not exercise.

## Filed Issues

None — no actionable defects found.

## Sources

- `fusion-workbench/` root listing; `circles/`; `shared/` and all nine type stores.
- `260717-1638-marker-format-ohne-glob-metazeichen[a]-circle.md` (head).
- `shared/reviews/` (two conceptrev files, sender-in-filename).
- `bin/fusion-paths analyst` and `bin/fusion-paths reconciler` (both exit 0).
- `.fusion-setup` (`plugin_version: 4.0.0`); absence of `.active-circle`.
- Empty-file, nested-dup, and misplacement scans (all clean).

## Open Questions

- [ ] Active-Circle routing path (`[a]→[t]` → `.active-circle` written → `OUT_*` into
  Circle subdirs) is untested by this run because no Circle is active by design.

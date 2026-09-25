# A2 — the per-dispatch-path byte bound, armed at the fifteen pre-cut totals

**Status:** Complete
**Agent:** coder
**Step:** A2 of `260909-1843_*_implementation-cut-fusion-to-a-working-minimum.md`
**Capability:** C8 of `260909-1615_*_spec-cut-fusion-to-a-working-minimum.md`

## What was built

A fifth growth-bounded surface: the **per-dispatch-path total** — the agent's own
prompt, plus every path `bin/fusion-rules` emits for it, plus `CLAUDE.md`. One
entry per agent, fifteen entries, head-room **zero**.

The arithmetic is the existing `growth()` in
`hooks/lib/__tests__/helpers/growth-bound.ts`, called with a per-path baseline map
and `DISPATCH_HEAD_ROOM = 0`. No second arithmetic was written.

The baseline is a fixture, `hooks/lib/__tests__/fixtures/dispatch-path.baseline`,
hand-edited and never generated. It sits in a fixture rather than in the test
source because a bound whose justification is a replay over a historical window
has to be replayable, and a replay is then a data swap against a checked-out tree
rather than an edit to the instrument under test.

The fifteen rows were measured, not copied: every prompt size, every emission
total and `CLAUDE.md` reproduce the spec's C8 table byte for byte at `bb341360`.

**The emission is measured from the repository root, not from the neutral cwd the
golden uses.** Two of the three components belong to the project, and the
difference between the two measurements — 2 696 bytes for every agent, plus 3 021
for the prose agents — is this project's stilwerk voice profiles, which a dispatch
really does read. That is why the C8 column and the golden's totals differ, and
the bound reads the larger one.

## Verification — three replays, all three performed

Each replay is a `git worktree add --detach` into a scratch directory, the
instrument copied in, `hooks/node_modules` symlinked, and one
`npx vitest run rules-emission-golden`. No `git stash`, `checkout .`,
`reset --hard`, `clean` or `restore .` was run anywhere.

| # | window | armed at | evaluated at | new bound | core bound | exit |
|---|---|---|---|---|---|---|
| 1 | — | `bb341360` (shipped fixture) | `bb341360` | green | green | 0 |
| 2 | 2026-08-27 → 2026-09-09 | `265a86fb` | `bb341360` | **red, 15/15 paths** | green | 1 |
| 3 | 2026-09-08 → 2026-09-09 | `79d4f84f` | `bb341360` | green | green | 0 |

Replay 2 is the pair the step exists to prove: exactly one test failed in that
run, the new bound, while `holds the always-on rule set — what every agent loads
— inside its budget` passed in the same run. Worst path `reconciler`, +36 030;
`coder` +33 816, of which `CLAUDE.md` is +14 585 — the component the old
instrument cannot see.

`265a86fb` is the window start because it is the last commit of the 2026-08-27
cut at which `coder` totals **154 440**, the figure C8 cites. The three later
commits of that day give 155 242 / 155 358 / 163 557.

Replay 3's window is `79d4f84f..bb341360`, 18 commits in which
`git diff --stat` over `agents`, `rules`, `CLAUDE.md`,
`fusion-workbench/stilwerk` and `bin/fusion-rules` is **empty**. The baseline
measured at the window start is therefore byte-identical to the shipped one, and
green is the correct outcome because `over` is `total > baseline`, not `>=`. That
degeneracy is the window's property, not the instrument's: no window in the
project's recent history has a path shrinking without another growing.

## What the tests assert

- every agent has a baseline row, and no row survives an agent that is gone
- each row's stated total equals its own three components (the redundant `total`
  is the C8 published figure, and this is what stops a typo arming the bound at a
  number nobody derived)
- **the bound itself**, over all fifteen paths
- synthetic, on copied component sizes so no real file is edited to make a gate
  fire: a shared always-on rule growing fails every path; `CLAUDE.md` growing
  fails every path; a conditionally emitted rule growing fails **only** its
  recipients, derived off the real emission rather than a name list; an
  offset applied once per path clears it and an offset applied to one path leaves
  the other fourteen over; the failure text names the path, the component and both
  mandated sentences

## Adjacent correction

`helpers/growth-bound.ts` said "four surfaces, four INDEPENDENT budgets" and "two
of the four bounded surfaces count bytes". Both were made false by this addition
(and the second was already wrong — three of four counted bytes). Corrected to
five, with the fifth arming recorded in the `## Re-baselining` section and its gap
named there: no event covers a growing `CLAUDE.md`.

`fixtures/surface-growth.golden` was regenerated: the hook-test line surface
gained 308 lines (rules-emission-golden 1 178 → 1 473, growth-bound 158 → 171).
That surface's bound still passes — 2 135 of its 2 500 head-room spent, 365 left.

## Known follow-up, not done here

`CLAUDE.md`'s bullet "**Four shipped surfaces have a failing growth bound
(260815)**" now under-counts, and so does `README-hooks.md`
`### Growth bounds on the shipped text`. Fixing the `CLAUDE.md` half **grows a
shared component and puts all fifteen paths over** unless it is offset in the same
edit — which is exactly the tension C8 anticipated and the failure text states.
Left for the cut's own `CLAUDE.md` pass rather than paid out of this step's
budget.

## Pre-existing suite state

`npm test` exits 1 in this tree on two failures that are **not** this step's:
`citation-sweep.test.ts` and `workbench-citation-lint.test.ts`, the latter over
two committed workbench records sharing a marker-normalised basename. Both were
reproduced failing in a clean worktree at HEAD and passing at `bb341360`, so they
arrived with commits between those two points.

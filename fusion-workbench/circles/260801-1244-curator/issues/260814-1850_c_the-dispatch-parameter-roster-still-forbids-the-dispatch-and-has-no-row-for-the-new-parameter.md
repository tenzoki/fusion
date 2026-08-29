The dispatch-parameter roster still forbids the dispatch, and has no row for the parameter the permission rests on

---
`bf9553f` changed the two `agents/shaper.md` surfaces the decision's constraint 2 names. A third
surface states the same prohibition and was not reached: `README-agents.md:67`, the
`## Dispatch parameters` table, whose `Passed by` cell for `shaper` / `**Circle file:**` reads "the
user running shaper top-level — no skill and no agent dispatches this mode (`agents/shaper.md:47`)".
That is false at HEAD, and the line it cites now says the opposite. The same table has no row at all
for `**Initiated by:**`, a dispatch parameter whose absence **halts** a dispatched run.

---
**Why this table and not any other surface.** `CLAUDE.md` `## Conventions` → *Dispatch parameters*
declares it the roster's single authoring home in as many words: "**The roster is authored once, in
`README-agents.md` `## Dispatch parameters`** — that table carries the agent, the line, its values,
what happens when it is absent, and who passes it, each row cited to the prompt line it was read
against. Do not restate it here; a second copy is how the planner came to be listed as
domain-parameterised in four places while `agents/planner.md` never parsed the string."
`README-agents.md:55` says the same from its own side. So a reader asking "may the orchestrator
dispatch this mode?" is sent to the one surface that still says no.

**The two halves, at HEAD `d5b71f1`.**

1. **The `Passed by` cell is false.** `README-agents.md:67`:

   > | `shaper` | `**Circle file:**` | … | the user running shaper top-level — no skill and no agent
   > dispatches this mode (`agents/shaper.md:47`) | `agents/shaper.md:47`, `:55` |

   `agents/shaper.md:47` now reads "user-initiated, by one of two routes and no third: the user runs
   shaper top-level … **or** the orchestrator dispatches it when the user's answer at a gate named
   this mode". The citation resolves to a line that contradicts the cell it supports.

2. **`**Initiated by:**` has no row.** `agents/shaper.md:55` defines it: required on a dispatched
   run, optional top-level, and the shaper **halts** when it is missing on a dispatched run — "do not
   reconstruct it, do not accept the dispatcher's assurance in prose in its place, and do not edit the
   record without it" (`:57`). Every other halting parameter in the corpus has a row with `If absent:
   **halts** …` — `shaper` / `**Circle file:**`, `shaper` / `**Draft:**`, `editor` /
   `**Deliverable language:**`, `curator` / `**Ledger:**`, `curator` / `**Approved:**`. This one does
   not. The table's `Passed by` column has its own ground truth here: the passer is the orchestrator,
   `agents/orchestrator.md` `## Re-sharpening an anticipated Circle (shaper portfolio-activation)`.

**Two smaller consequences of the same commit, in the same table.** `bf9553f` inserted two lines into
`agents/shaper.md` between `:54` and `:57`, so the file's line numbers below the insertion moved by
two and six `Declared at`/`Passed by` citations now name the wrong line:

| Row | Cites | Was | Is now at |
|---|---|---|---|
| `shaper` / `**Circle file:**` | `:55` | the `**Circle file:**` halt sentence | `:57` |
| `shaper` / `**Mode:**` | `:57` | mode 4, declaring `**Draft:**` | `:59` |
| `shaper` / `**Draft:**` | `:57`, `:60` | mode 4; the `**Draft:**` bullet | `:59`, `:62` |
| `shaper` / `**Domain:**` | `:57`, `:80` | mode 4; the domain bullet | `:59`, `:82` |
| the section's intro paragraph | `:57` | the `**Draft:**` bounding rule | `:59` |

`agents/shaper.md:55` today is the `**Initiated by:**` paragraph, so the `**Circle file:**` row's
citation lands on a different parameter's definition rather than nowhere — the worst of the two
failure shapes for a reader checking a claim.

**Why nothing caught it.** `hooks/lib/__tests__/reference-resolution-lint.test.ts` resolves three
citation kinds — plugin file paths, `` `file.md` `## Section` `` heading anchors, and workbench
records. A `file.md:LINE` citation is none of the three, so no gate reads a line number anywhere in
the corpus. `npm test` is green at HEAD (49 files, 1 030 tests).

**Scope.** `README-agents.md` only. Executor: `coder`.

**Filed by:** coderev, review `260814-1850-coderev-curator-turn-4.md`.

---
Resolved: 9f4cdac. Both cells in `README-agents.md` `## Dispatch parameters` now name the
orchestrator's permitted dispatch and its condition — the `**Mode:**` row as well as the one this
record named, which the widened search found carrying the same prohibition in the same table. The
`**Initiated by:**` row was added between `**Circle file:**` and `**Draft:**`, beside the other
parameters whose absence halts a run. Six citations were corrected for the two-line slide,
including `:104`→`:106`, which this record's own table had missed. Everything else mentioning the
mode claims nothing about who may dispatch it, checked across `README-agents.md`,
`rules/circle-records.md`, `skills/next/SKILL.md`, `docs/working-model.md` and the orchestrator's
event and routing tables.

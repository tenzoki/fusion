The shaper's Mode row reads an absent line as user-direct, and a second mode carries no Mode line either

---
`README-agents.md`, the `shaper` / `**Mode:**` row, says an absent line "falls back to the
existing mode-detection heuristic, i.e. user-direct". Two of the shaper's four modes carry no
`**Mode:**` line: user-direct and in-Circle clarification (`agents/shaper.md:43`, `:45`). The
"i.e." collapses the heuristic into one of its two outcomes, and the same table's
`**Parent task:**` row states the other one.
---

## Both sides read

**Documentation side**, `README-agents.md`, two rows of the same table:

> | `shaper` | `**Mode:**` | … | falls back to the existing mode-detection heuristic, i.e.
> user-direct | … |

> | `shaper` | `**Parent task:**` | path to the active task file | no parent-task context; the
> spec output is the same either way | orchestrator, in in-Circle clarification mode | … |

**Artifact side**, `agents/shaper.md:43` and `:45`:

> 1. **User-direct** (default) — the user's raw request → spec at `$OUT_PLAN`. **No special
> parameter lines.** This is what the orchestrator dispatches in Phase 0b.1 today.
>
> 2. **In-Circle clarification** — the orchestrator dispatches mid-Circle to clarify a vague
> task. The dispatch prompt MAY include an optional `**Parent task:**` parameter line […]

`:47` is where the fallback sentence comes from, and it stops short of the gloss the table
adds: "Absence of these defaults to the existing mode-detection heuristic." The prompt names a
heuristic; it does not say the heuristic always answers user-direct, and modes 1 and 2 are
precisely what it chooses between.

## Why it matters

Small, and one direction only. A dispatcher reading the cell concludes that a prompt without
`**Mode:**` is user-direct, which is right for the write targets (both modes write the same
spec shape) and wrong for what the shaper reads: mode 2 takes a `**Parent task:**` line the
cell has just implied cannot apply. The two rows of one table disagree about what happens when
`**Mode:**` is absent.

## Scope

`README-agents.md` only. `agents/shaper.md` is internally consistent.

## Recommended fix direction

Drop the "i.e. user-direct" gloss, or spell out both outcomes: absent the line, the mode is
user-direct, or in-Circle clarification when the orchestrator's dispatch carries
`**Parent task:**`.

Filed by: coderev (review of Circle Turn 3, range `22f892e..8d87192`, commit `8d87192`).

---
Reconciled: 260813-2258 — Still open, re-verified at HEAD `c0e4219`: `README-agents.md:65` still reads "falls back to the existing mode-detection heuristic, i.e. user-direct", and the `**Parent task:**` row at `:66`-neighbourhood still names the second absent-line outcome.

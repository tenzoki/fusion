README-agents.md points at "docs/philosophy.md §5" which does not exist

---
`README-agents.md` line 86 reads: "See `docs/philosophy.md` §5 for the full model." `docs/philosophy.md` has no §5 — it has four unnumbered sections (`## Why it's built this way`, `## How a session runs`, `## What fusion is not`, `## Where to read more`). The cross-reference is broken. The "full model" (Circle lifecycle, spec-driven flow, gates, Rebalance, Coherence) now lives in `docs/working-model.md`, which was created in this Circle's Turn 1. The pointer was not updated when the working model was split out of philosophy.

---
Evidence:
- `README-agents.md:86` — "...At session end a **per-Circle three-edge verdict** judges the whole arc. See `docs/philosophy.md` §5 for the full model."
- `docs/philosophy.md` section headers (grep `^#+ `): line 1 `# Fusion — Why It's Built This Way`, line 9 `## Why it's built this way`, line 21 `## How a session runs`, line 37 `## What fusion is not`, line 43 `## Where to read more`. No numbered sections; no §5.
- `docs/working-model.md` exists and is the operational companion (its §2 spec-driven flow, §3 gates, §3 Rebalance four options, §3 Coherence check) — the actual home of "the full model" the sentence refers to.

Scope: `README-agents.md` only (docs). No code impact.
Severity: Medium — dangling doc cross-reference; a reader following it lands nowhere.
Fix direction: repoint to `docs/working-model.md` (e.g. "See `docs/working-model.md` §3 for the gates and the Rebalance model"), which is the accurate target post-Turn-1.

---
Resolved: Confirmed docs/philosophy.md has no numbered sections (four unnumbered) and docs/working-model.md now holds the gates/Coherence/Rebalance model (its section 3 "The gates"). Repointed README-agents.md:86 from "docs/philosophy.md §5" to "docs/working-model.md (the gates, Coherence Review, and Rebalance model)".

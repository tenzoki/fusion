The orchestrator prompt still says a `task_start` row carries the byte measurements
---
Since FJ03a step 2 the dispatch hook writes `task_start` without the five `bytes_*` fields. `agents/orchestrator.md` `### Structured Event Log`, the table row `task_start`, still reads "Dispatch description, the byte measurements, and `work_item` when the prompt named one". FJ03a leaves `agents/` untouched, so the step could not correct it.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence:** `grep -n 'byte measurements' agents/orchestrator.md` names the one row. The executor of step 2 searched `agents/`, `skills/`, `rules/`, `docs/`, `templates/`, `README.md`, `README-agents.md` and `CLAUDE.md` and found no other passage. The ruling that removed the measurement: `260929-1919_*_the-dispatch-hook-reaches-the-claimed-package-helper-through-fusion-rules-so-how-does-it-stay-off-the-codec.md`.

**Owner:** FJ03d, the part of FJ03 that changes agent text (`260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md` `## The cut of FJ03`). The edit is charged to the growth bound on `agents/`; it removes words.

**Acceptance:** the row describes what the hook writes, and `grep -rn 'byte measurements' agents skills rules` names nothing.

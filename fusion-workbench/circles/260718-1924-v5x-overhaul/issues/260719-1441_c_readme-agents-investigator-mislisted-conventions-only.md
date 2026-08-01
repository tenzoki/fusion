README-agents.md pattern→agent table wrongly lists `investigator` as workbench-conventions-only

---
The "Pattern → agent mapping" table in `README-agents.md` (line 177) places `investigator` in the "(workbench conventions only)" row. This is factually wrong: `bin/fusion-rules` line 120 assigns `investigator` the pattern `PATTERNS="investigator"`, so it globs `*investigator*.md` rules (the project-supplied `./rules/investigator-capture-layout.md`). The investigator is a pattern-matching agent, not a conventions-only one. The table is missing a dedicated `investigator | *investigator* | rules/investigator-capture-layout.md` row, and investigator should be removed from the conventions-only row.

---
Evidence:
- `README-agents.md:177` — conventions-only row reads: `orchestrator, shaper, taskplanner, reconciler, analyst, investigator, consultant, playmaker, conceptrev, editor | (workbench conventions only) | —`. Includes `investigator`.
- `bin/fusion-rules:120` — `investigator) PATTERNS="investigator" ;;` (NOT the `PATTERNS=""` conventions-only case at line 121).
- `bin/fusion-rules:59-62` (header) — `investigator → *investigator*.md (project must supply ./rules/investigator-capture-layout.md)`.
- Self-contradiction inside the same file: `README-agents.md:148` describes investigator's `./rules/investigator-capture-layout.md`, and `README-agents.md:36` names it in the agent table — both imply pattern loading, which line 177 denies.

The correct conventions-only set (source line 121) is exactly nine agents: `orchestrator, shaper, taskplanner, reconciler, analyst, consultant, playmaker, conceptrev, editor` — no `investigator`.

Scope: `README-agents.md` only (docs). No code impact.
Severity: Medium — misleads a reader/maintainer about how the investigator loads its required capture-layout rule.
Fix direction: remove `investigator` from the conventions-only row (line 177); add an `investigator | *investigator* | rules/investigator-capture-layout.md` row to the pattern→agent table (lines 173-177).

---
Resolved: Verified against bin/fusion-rules:120 (investigator has PATTERNS="investigator", not the conventions-only PATTERNS="" case at line 121). Removed investigator from README-agents.md conventions-only row and added a dedicated `investigator | *investigator* | rules/investigator-capture-layout.md` row to the pattern->agent table.

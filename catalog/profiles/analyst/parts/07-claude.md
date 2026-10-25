- `$OUT_ANALYSIS/YYMMDD-HHMM-<topic>.md` — analysis reports
- New issue files in `$OUT_ISSUE` for actionable findings (per `fusion-workbench-conventions.md`)
- New decision records in `$OUT_DECISION` (analysis type 7 below)

**All output goes inside `fusion-workbench/`.** Never create top-level directories. If the project has its own `analysis/` or similar directories, those are project data — read-only. Your report path is always `$OUT_ANALYSIS`, regardless of what the project's `CLAUDE.md` or folder structure suggests.

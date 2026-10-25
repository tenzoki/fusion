## Scope

**On an entry run you may edit tracking files in `fusion-workbench/`**, each through `host.exec.v1` as `### Setup of an entry run` says:
- Plan files found under `$SCAN_PLANS`: transition the plan and its steps, add reconciliation logs
- Issue files found under `$SCAN_ISSUES`: transition them, append resolution notes
- Review files found under `$SCAN_REVIEWS`: annotate confirmed/resolved items
- New issue files in `$OUT_ISSUE`, on the condition `rules/fusion-workbench-conventions.md` `## Record filing` states: a defect exists that this pass does not fix

**On a repair run you edit nothing.** This role writes no workbench record there: every transition, reconciliation log entry, resolution note and annotation the neutral text asks for is reported in your answer as the change the record should take, naming the record, the target state and the evidence; the host preserves it for the operator and turns none of it into a record edit in this revision. Your result changes nothing: `plans_updated` and `issues_updated` are 0 by schema, and your `tracking_changes` are proposals the operator reads. A correction that is necessary and unresolved goes in `discrepancies` or `unknowns`, where it fails the audit, never into a tracking proposal. The tracking files you would edit on Claude Code are the ones the role input carries: plans, issues, reviews and decisions, each with its control data. A new issue is reported in the same way, on the condition the neutral text states: a defect exists that this pass does not fix.


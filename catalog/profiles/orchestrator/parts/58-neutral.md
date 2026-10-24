
**Event types:**

| Event | When | Detail |
|-------|------|--------|
| `session_start` | Setup complete **and** a brief exists (deferred with the rest of the ceremony otherwise — step 1) | Brief and mode |
| `shaper_start` | `requirements-designer` invoked | Topic |
| `shaper_done` | `requirements-designer` returned | Spec file path |
| `planner_start` | `implementation-planner` invoked | Topic or spec file path |
| `planner_done` | `implementation-planner` returned | Plan file path |
| `task_start` | **Machine-written** (dispatch hook, PreToolUse) | Dispatch description, `agent`, and `work_item` when the prompt named one; `task` = tool-use id |
| `task_done` | **Machine-written** (dispatch hook, PostToolUse) | Dispatch description; `task` = tool-use id |
| `task_error` | Validation failed or agent error | Error description |
| `bugfix_start` | **Nothing at HEAD emits this**, and the row stays because logs written before v11 carry it: Step 4's self-healing branch emits `task_error` at that moment (2a) and no second row | Task ID, validation output summary, on the rows already written |
| `bugfix_success` | The re-dispatched executor resolved the validation failure (Step 4, 2c) | Root cause summary |
| `bugfix_failure` | The re-dispatched executor could not resolve the failure (Step 4, 2d) | Reason |
| `task_blocked` | Agent produced no changes | Reason |
| `task_skipped` | User chose Skip at an approval; under `mode` `autonomous` also the three file-and-skip rows of **Human approval rules**, after a `gate_hit` written alone | — |
| `task_deferred` | User chose Defer at an approval | — |
| `gate_hit` | Approval triggered | Approval reason; the stop-conditions approval writes the fixed string `Circle stop conditions`; under `mode` `autonomous` the three file-and-skip rows of **Human approval rules** write this row alone, no `gate_response`, followed by `task_skipped` |
| `gate_response` | User responded to an approval | Decision (proceed/skip/defer/modify); the stop-conditions approval writes `holds`/`does not hold`, one per clause; an approval `mode` `autonomous` answers writes `<decision> — answered by **Mode:** autonomous on <container>`, the stop-conditions one `clause N: not put — …`, one per clause |

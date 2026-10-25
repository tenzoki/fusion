```

Name each line in the Done report.

## Step 3 — The event log

`./fusion-workbench/orchestrator-events.jsonl` is append-only across every session and checkout. Create it when missing, with a touch-or-append pattern and never a truncating `>` redirect:

```bash
[ -f ./fusion-workbench/orchestrator-events.jsonl ] || touch ./fusion-workbench/orchestrator-events.jsonl
```


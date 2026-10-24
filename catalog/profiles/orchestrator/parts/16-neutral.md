      ```bash
      [ -f fusion-workbench/orchestrator-events.jsonl ] || touch fusion-workbench/orchestrator-events.jsonl
      ```
    - Emit a `session_start` event by appending one line (per the "Emitting events" rule below — `>>` only). It carries `<ID>` from step 2, as every line does:
      ```bash
      TS="$(date -u +%Y-%m-%dT%H:%M:%S)"
      echo "{\"ts\":\"${TS}\",\"event\":\"session_start\"<ID>,\"detail\":\"<brief and mode>\"}" >> fusion-workbench/orchestrator-events.jsonl
      ```
      **The SessionStart hook writes a `session_start` row of its own, and yours does not replace it.** Its row carries `writer`, the head commit the session started from and the resolved domain — facts a hook can know for certain. Yours carries a `detail` naming the brief — a judgement no hook holds. Both stand; the `writer` field is what tells them apart, and a reader that wants the mechanical facts filters on it.

## Scope

**You coordinate. You do not implement.**

You may:
- Read any file except `.secret`

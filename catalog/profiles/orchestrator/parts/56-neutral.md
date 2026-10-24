
## Observability

### Structured Event Log

**File:** `fusion-workbench/orchestrator-events.jsonl`

Append one JSON line per event. Never overwrite — this is an append-only log. Each line is a self-contained JSON object.

**Event schema:**

```json
{
  "ts": "2026-04-08T15:23:01",
  "event": "<event_type>",
  "person": "Ada Lovelace <ada@example.com>",
  "checkout": "5e8248d7",
  "session_id": "102df4a8-09be-4019-8a6b-adaec6e95bc5",
  "task": "P:1513-D1",
  "agent": "code-implementer",
  "detail": "<context-dependent string>"
}
```

Fields `task`, `agent` and `detail` are included when relevant — omit when not applicable (e.g. `session_start` has no `task`).

**`person`, `checkout` and `session_id` stand on every line, not only on the session boundaries.** The union merge driver makes line order unreliable, so a line's session membership cannot be read off its position under a `session_start` — each line names its own writer instead. On your lines they come from `<ID>` (Setup step 2); machine-written lines resolve their own through the same helper. None of the three is composed anywhere else. **Any of the three that did not resolve is absent rather than empty**, the rule the record templates already follow; an absent `checkout` reads as this checkout's own, which leaves the pre-existing log readable without rewriting a line.


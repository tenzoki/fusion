
4. **Watch the dashboard.** In a second terminal, run `./fusion-workbench/monitor "<session-name>" <port>` (e.g. `./fusion-workbench/monitor "F03-fusion" 8099`) from the project root. The monitor is an executable bash script that serves an HTTP dashboard — open `http://localhost:<port>` in a browser. It auto-refreshes from `fusion-workbench/orchestrator-events.jsonl`, which the hooks write, and reads nothing else: a record's state there is its last observed change, from the log's `record_change` rows, not its current one.

5. **Recovering after a crash:** just start the orchestrator again. There is no saved session to resume and no state file to find — a crashed session is restarted like any other. What it left behind is in git, in the event log and in the records it wrote, so say what you want done next and the session reads those.


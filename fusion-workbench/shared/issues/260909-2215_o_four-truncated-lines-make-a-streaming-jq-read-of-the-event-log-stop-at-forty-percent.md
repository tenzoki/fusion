Four truncated lines make a streaming jq read of the event log stop at forty percent
---
`unite-co-creator/fusion-workbench/orchestrator-events.jsonl` carries 3 886 lines of which 4 are not parseable JSON: lines 1512 to 1515, written in the same second (2026-08-05T07:58:45 and :46), each a complete object missing only its closing brace. One append lost four braces. The lost rows are not the defect. `jq '<filter>' <file>`, the obvious way to read the log, aborts at the first malformed line and exits reporting what it had, which is 1 511 objects of 3 886 with no non-zero exit visible to a caller that pipes it. A first pass of the A1 measurement took its unite figures that way and was wrong by a factor of two and a half. `jq -R 'fromjson? // empty' <file>` reads per line and returns 3 882.
---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
fusion's own reader is correct and reports the shortfall: `bin/fusion-events presence` in that tree prints "4 line(s) of the log were not a JSON object and were skipped." on stderr and exits 0, matching the per-line count exactly (`hooks/lib/events-query.ts` `parseLog`). The exposure is to any prompt, skill body or hand-run command that reaches for streaming `jq` instead. Two halves: nothing guarantees a well-formed append, since the rows are written by the model with a shell command; and nothing tells a reader that the log may not be a clean JSONL stream. fusion's own log and krk's parse cleanly at the same head, so the corruption is not universal. Related but distinct: `260909-1454_*_a-dispatch-outside-a-recorded-session-writes-no-event-row-and-nothing-reports-it.md`. Evidence: `260909-2215-gate-firing-read-before-the-cut.md` `### The log is not fully well-formed, and one reader hides it`.

**Acceptance test:** every fusion-shipped surface that reads the event log reads it per line, and the reading convention is stated once where a reader of the log will meet it.

---
Reconciliation (260909-2107, reconciler): still open — this defect is against a consuming project's
log format and fusion's own reading convention, not against this repository's tree, so nothing at
HEAD `08e81db3` closes it. Correctly carries `_o_`.

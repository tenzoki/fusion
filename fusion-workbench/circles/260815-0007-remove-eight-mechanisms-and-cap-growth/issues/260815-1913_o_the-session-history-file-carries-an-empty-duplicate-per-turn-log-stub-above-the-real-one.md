# The session history file carries an empty duplicate `## Per-Turn Log` stub above the real one

---
**Severity:** Low
**Domain:** data
**Filed by:** reconciler, Phase-3 pass `history/260815-1913-reconciliation.md`, HEAD `9306f0a`
**Owner:** `orchestrator`
**Affects:** `shared/history/260814-2306-orchestrator-session.md:26-28` and `:178`
**Cross-references:** `rules/fusion-workbench-conventions.md` `## History Logging`

---

The file carries two `## Per-Turn Log` headings. The first, at `:26`, holds the single line
`(none yet)` and was never overwritten. The second, at `:178`, holds the real Turn 1, Turn 2 and
Turn 3 sections. A reader scanning headings meets the empty one first.

```
$ grep -n '^## Per-Turn Log' fusion-workbench/shared/history/260814-2306-orchestrator-session.md
26:## Per-Turn Log
178:## Per-Turn Log
```

The stub is the Setup-time placeholder; the Turn sections were appended later under a fresh heading
rather than written into it. Nothing reads either programmatically, which is why nothing caught it.

**Not part of this defect, and named so it is not read as missed:** the same file has no Turn 4
section and its `**Status:**` still reads `In progress`. Both are the orchestrator's Phase-3 and
Phase-4 writes and are downstream of this reconciliation pass rather than defects in the file.

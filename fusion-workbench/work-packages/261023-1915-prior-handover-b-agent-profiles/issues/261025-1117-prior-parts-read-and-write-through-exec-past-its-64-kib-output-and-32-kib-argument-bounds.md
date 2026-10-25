Prior parts read and write through exec past its 64 KiB output and 32 KiB argument bounds
---
Every entry-run Setup reads install-tree rule files with `["cat", "<path>"]`, and `rules/fusion-workbench-conventions.md` (67 996 bytes) exceeds Prior's 65 536-byte stdout bound, so every Setup gets it truncated. Reviewer writes whole review files as one `printf` argument, which Prior bounds at 32 768 bytes. Neither part says how to stay inside the bounds. Severity: Medium.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Domain:** code
**Executor:** code-implementer
**Cross-references:** 261025-1117-reviewer-closing-review-of-prior-handover-b-agent-profiles.md

## Defect

Prior bounds, at the pin `08c57fb` (`moduleapi/v1/entry_wire.go`): `MaxExecArgBytes = 32 << 10`, refused at decode (`len(arg) > MaxExecArgBytes`); `MaxExecOutputBytes = 64 << 10`, "the host truncates and says so".

1. **Reads.** Setup item 2 of all eleven agent profiles (`grep -l '\["cat"' catalog/profiles/*/parts/*-prior.md`: the nine `03-prior.md`, `orchestrator/parts/07-prior.md`, `policy-curator/parts/05-prior.md`) reads an install-tree path through `["cat", "<path>"]`. `bin/fusion-rules` emits `rules/fusion-workbench-conventions.md` to every agent; `wc -c` gives 67 996 bytes. Its tail (`## A project's CLAUDE.md`, `## Session history`, `## Security`, `## Commit lock`) is cut on every entry run. `policy-curator/parts/07-prior.md` and `47-prior.md` and `orchestrator/parts/43-prior.md` read single rule files the same way; those are under 64 KiB today (largest `rules/workbench-tracking.md`, 22 326 bytes).
2. **Writes.** `reviewer/parts/17-prior.md` writes each file as `["bash", "-c", "printf '%s' \"$1\" > \"$2\"", "write", "<content>", "<workbench path>"]`, the whole file in one argument. One of the 182 review files in this workbench exceeds 32 KiB (`find fusion-workbench -path '*/reviews/*' -name '*.md' -size +32k`), so a consolidated review of that size is refused. `state-auditor/parts/03-prior.md` appends with the same form (`>>`), whose notes are short.

## Fix direction

State the two bounds once in each Setup binding: read an install-tree file in pieces under 64 KiB (`["head", "-c", "60000", "<path>"]`, then `["tail", "-c", "+60001", "<path>"]`, or `sed -n` by line range) and treat the host's truncation notice as "read the rest"; write a file over 32 KiB as a first `>` call and further `>>` calls, each argument under 32 KiB. A shared sentence across the eleven binding parts is acceptable duplication, or a rule file inlined with `{{include}}`.

## Acceptance

- Every Setup binding that reads with `cat` names the 64 KiB bound and the chunked read; `reviewer/parts/17-prior.md` names the 32 KiB bound and the chunked write.
- `cd catalog && npm test` exits 0; the Claude render diff is empty.

Also seen: 261025-2352 by reviewer — the sixteen skill bindings (`skill-*/parts/01-prior.md`) already read in chunks under 64 KiB, while the eleven agent Setup parts still read with `["cat", "<path>"]` at `ec6c968e`, so the one binding now has two variants.

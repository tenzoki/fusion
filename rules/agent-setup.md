# Agent Setup Contract

This rule is the single authoring home for what every agent's Setup step means. Your
prompt's Setup runs three bootstrap commands in order — `fusion-workbench-root` (locate
the workbench, halt if it exits non-zero), then `fusion-rules <self>`, then
`fusion-paths <self>`. This document explains how to interpret what those last two emit.
It is itself emitted by `fusion-rules`, so by the time you read this you have already run
it.

## Read every emitted path

`fusion-rules <self>` prints one file path (or `skill:<name>` pointer) per line. **Read
every path it emits** — none is optional. A `skill:<name>` line means invoke that skill on
demand, not read a file. The set is layered, not ranked: you read all of it.

## What `fusion-rules` emits

- `fusion-workbench-conventions.md` — always, for every agent. The framework ground truth
  (workbench layout, the Origin Rule, marker vocabularies, the Path Resolution contract).
- **Pattern-matched domain rules** — coding, ontology, normative, verb, investigator, etc.,
  selected per your agent. The descriptive name of the pattern does not matter; you read
  whatever is emitted regardless of what kind of rule it is.
- **Project-local rules** from the consuming project's `./rules/` (fusion-agent-specific)
  and `.claude/rules/` (project-wide). Missing files are skipped silently — read what is
  present.

## What `fusion-paths` emits

`fusion-paths <self>` prints one `KEY=value` line per key. `OUT_*` keys are your **write
targets**; `SCAN_*` keys are your **read/search targets**. Hold these values for the whole
session and use them wherever your prompt names one — they are the only correct answer to
"where does this go". Never guess a path when the resolver fails; stop and report.

A single `SCAN_*` value may name **two directories** — the active Circle's and the shared
one — so search across all of them or your scan silently under-reports.

A non-zero exit says whose fault it is (full table in `fusion-workbench-conventions.md`
`## Path Resolution` → Exit codes): **exit 3** — `.active-circle` is orphaned or corrupt;
the user fixes the pointer. **exit 4** — an internal `fusion-paths` bug; the user's
workbench is fine and must not be sent to check the pointer.

## Voice profiles

If `fusion-rules` emitted a `chat-voice-*.yaml` path (it does for every agent), read it and
apply it to your short-form output — gate prompts, status reports, chat replies — per
`user-facing-output.md`. If it also emitted a `default-voice-*.yaml` path (prose agents
only), read it as your long-form writing profile for narrative output. If a profile you
expect is absent, note the absence (in your history file if you keep one) and proceed.

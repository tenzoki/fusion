# coder — release v8.2.0, marketplace entry

**Date:** 260814
**Agent:** coder
**Status:** Complete
**Task:** Release step 3 — bump fusion's version and correct its description in the marketplace manifest.

## Scope

One file, in a different repository, with explicit user approval:
`/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins/.claude-plugin/marketplace.json`

Nothing else in that clone was touched, and nothing in the fusion repository was edited.
Not committed — the orchestrator pulls, commits and pushes.

## Changes (both inside the `"name": "fusion"` object)

1. `"version"`: `"8.1.0"` → `"8.2.0"`. Matches `.claude-plugin/plugin.json` (already 8.2.0) and the pushed tag `v8.2.0`.
2. `"description"`: agent count `16` → `17`, plus a curator clause after "decision-record tracking":
   "a curator that reconciles decision records, rule files and CLAUDE.md against the project's recorded history".
   Length 495 → 565 characters.

## How the count was established

- `ls -1 agents/*.md` in the fusion repo: **17** files.
- `git ls-tree --name-only v8.1.0 agents/`: **16** — so the old number was correct for the previous release.
- `git log --diff-filter=A -- agents/curator.md`: added by `6ba9d77`, "the seventeenth agent".

The description counts all agent prompts including `orchestrator`, consistent with the 16 it held at v8.1.0.

## Rest of the sentence, checked not assumed

- "3 parameterised by domain" holds. `README-agents.md` `## Dispatch parameters` — the roster's single
  authoring home per CLAUDE.md — names `taskplanner`, `reconciler`, `playmaker`, and states explicitly that
  `planner` is not one of them. `shaper` accepts the line but only copies it, so it is not a fourth.
- "investigator parameterised by a project-supplied capture-layout rule" holds (`agents/investigator.md:15-17`,
  which halts when no such rule loads).
- No other clause found false. `curator` was the only omission.

## Escaping

The file writes its em-dash as `—` and holds zero raw U+2014 bytes. The edit was a byte-level string
replacement on the raw text, so the existing escape and the file's formatting are preserved; no re-serialisation.

## Verification

`python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))"` — exit 0.
Parsed back: three plugin entries (`stilwerk`, `fusion`, `flight`), fusion version `8.2.0`, raw em-dash count 0.
`git diff --stat` in the marketplace clone: 1 file changed, 2 insertions, 2 deletions.

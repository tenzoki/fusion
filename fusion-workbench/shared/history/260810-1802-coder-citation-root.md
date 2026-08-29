# coder — `I:260810-0501-citation-root` (Turn 1)

**Status:** Complete
**Task:** give the two skill bodies a resolvable route to `agents/orchestrator.md` `### The queue's ground` → `#### Reading a queue`
**Source record:** `260810-0501_*_two-skills-cite-a-prompt-section-they-have-no-documented-route-to-read.md`
**Session:** `260810-1646-orchestrator-session.md`

## Route taken

**Route 1 — repair the citation.** Route 2 (move the section into a rule file) is the better
structural answer and I wrote it up as a proposal for the orchestrator rather than executing it: it
edits `agents/orchestrator.md`, which another coder held this Turn, and it needs a decision about how
a *skill* reaches an emitted rule at all — `bin/fusion-rules` is called by `/fusion:setup` (as
`orchestrator`) but not by `/fusion:next`, so emission alone does not reach both consumers.

Route 1 is not made wrong by route 2: it removes the unresolvable path today, and route 2 would
supersede the citations wholesale if it lands.

## What changed

`skills/setup/SKILL.md`

- New paragraph after the "Execute every step below in order" line: paths into files the plugin
  ships carry the `$FUSION_PLUGIN_ROOT` root, citing `skills/cleanup/SKILL.md:11` as the site that
  states the reason. The convention is stated once per file, not re-derived at each citation.
- Rooted four citations: Step 2's mention of steps that live in the orchestrator prompt, Step 3's
  churn-rank block, Step 3's domain heuristic, Step 3's queue's-ground check.
- Added a presence check at the queue's-ground citation (`grep -q '^#### Reading a queue'` against
  `$FUSION_PLUGIN_ROOT/agents/orchestrator.md`), printing either the section's location or a
  `queue-check: UNAVAILABLE` line naming the install and telling the user to run `fusion --update`.
- Added the `UNAVAILABLE` row to the Setup-complete verdict list: report the gap, do not improvise
  the branches.

`skills/next/SKILL.md`

- The same root paragraph near the top.
- Rooted both citations (Step 5 item 4, Step 6.3's rationale pointer).
- The same presence check at Step 5 item 4, with the rule that `UNAVAILABLE` is the one case where
  the briefing speaks about a queue it has not judged — silence there would read as a queue in good
  standing.

Not touched: `skills/cleanup/SKILL.md` (read-only; its own bare citation at `:114` carries an inline
fallback and is out of this record's scope), `agents/orchestrator.md`, `tasklist.md`, the source
record's marker.

## Verification

`cd hooks && npm test` — exit 1. Four failures, none in the files this task owns:
`derivable-enumerations-lint` (README-hooks.md vs the new `lib/domain-cascade.ts`), `domain-cascade`,
`fusion-commit-lock`, `monitor-warnings-panel` — all four belong to other coders' in-flight edits this
Turn. The three lints that read these two skill bodies passed: `reference-resolution-lint` (23),
`path-literal-lint` (19), `queue-ground-lint` (9).

Note on the reference lint: rooting a citation moves it out of the class-(b) heading check
(`ANCHOR_RE` needs a backtick immediately before the file token, and `` `$FUSION_PLUGIN_ROOT/…` ``
does not have one). Nothing was lost — `queue-ground-lint` already pins `### The queue's ground` to
exactly one occurrence in `agents/orchestrator.md`, and the rooted path is still resolved by class
(a) through `ROOT_VAR_RE`. `#### Reading a queue` was never checked by either lint; the new runtime
grep is now the only thing that checks it, and it checks the copy that actually gets read.

# Analyst session: branch-switch guard live-miss root cause

**Date:** 2026-07-17 19:35
**Agent:** analyst
**Domain:** code
**Requested by:** orchestrator (cross-cutting; shared-origin per Origin Rule — not the active Circle)

## Task

Root-cause a live guard miss: a `git switch <nonexistent>` via the Bash tool from the fusion
repo root was not blocked (git ran, exit 128) despite CLAUDE.md's promise that the branch-switch
policy stays active in fusion's own repo. Distinguish code defect / stale dist / harness artifact.

## What I did

- Read the hook wiring (`hooks.json`, `config.json`), guard source + compiled dist, and the
  branch classifier (`git-branch-guard.ts`).
- Checked git history of the wiring commits (`dbf98f6`, `bf18fc0`) and confirmed the `Bash`
  matcher and Bash branch are committed and compiled.
- Confirmed `git status` clean on dist (not stale) and dist matches source.
- Inspected live guard-state (`escalation.json`, `events.jsonl`).
- Ran the shipped `dist/guard.js` twice against fabricated PreToolUse input (git switch → block;
  ls → allow) — decisive empirical proof the code works when invoked.

## Verdict

Not a fusion code defect and not a stale build. Confirmed **session-harness artifact**: the
PreToolUse Bash guard hook was not invoked by the harness for the live `git switch` call —
proven by the absence of the deny-path's mandatory side-effects (no `consecutiveBlocks`
increment, no `guard_block` event) at the live moment, contrasted with my controlled re-run of
the same code which produced exactly those side-effects. Why the harness skipped the invocation
is undetermined from static evidence (labelled speculative in the report).

## Side effects of diagnosis (disclosure)

My controlled `dist/guard.js` run mutated live guard-state: `consecutiveBlocks` 0→1, one new
`guard_block` event + `recentEvents` entry at 2026-07-17T17:33:40Z. Halt fires at 3; count 1 is
clear. Reset via `node hooks/dist/clear-halt.js` if a clean baseline is wanted.

## Output

- Analysis: `fusion-workbench/shared/analyses/260717-1935-branch-switch-guard-live-miss-root-cause.md`
- Recommended (not filed): an issue in `shared/issues/` to track the harness hook-invocation
  reliability gap + a live re-probe to disambiguate transient vs persistent.

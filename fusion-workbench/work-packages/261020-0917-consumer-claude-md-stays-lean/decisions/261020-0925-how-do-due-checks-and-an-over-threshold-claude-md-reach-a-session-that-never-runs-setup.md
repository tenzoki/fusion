# How do due periodic checks, and a `CLAUDE.md` found over threshold, reach a session that never runs `/fusion:setup`: a SessionStart notice, the orchestrator's Setup, or an event row?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261020-0916-claude-md-check-never-runs-in-orchestrator-sessions.md, 261020-0916-claude-md-over-threshold-finding-persists-nowhere.md, 261020-0835-why-a-consumers-claude-md-grows-unchecked.md, 260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md

---

## Question

The due list for the eleven periodic checks is computed in one place only, the inline `node -e` block of `skills/setup/SKILL.md` Step 0. A session that starts through the orchestrator runs the orchestrator's inlined Setup, which computes none, so in krk the `claude-md` check never ran and `fusion-workbench/.check-stamps` does not exist. When the check does run, its over-threshold result lives only in the chat, and its stamp silences it for 30 days. Both issues ask for the same thing: a decided fact (which checks are due; what the last weight was) has to reach a session that skipped setup. Which channel carries it is a design choice that every later check inherits, so it is recorded.

Both facts are decidable from inputs a mechanism can read: `.check-stamps`, the plugin version, and the helper's own output. No option here has to approximate anything.

## Options

1. **The orchestrator's Setup runs setup's Step 0 and Step 1**, by reading `$FUSION_PLUGIN_ROOT/skills/setup/SKILL.md`. The `claude-md` stamp records the `over` count it found. Setup Step 0 prints the last recorded result when it was over, even when the check is not due.
   - Pros: one definition of the due list, reused. The due checks actually run, not just get named.
   - Cons: about +250 bytes on `agents/orchestrator.md` (path slack 3 719) and about +250 on the skill bodies. Reaches orchestrator sessions only, not a plain session that skips setup. Adds ceremony to every orchestrator start that has checks due.
2. **A SessionStart notice.** The due computation moves out of setup's inline block into one helper, which setup Step 0 and a new SessionStart hook both call. The hook prints one line to the user when checks are due ("run /fusion:check"). The `claude-md` stamp records the `over` count, and while the last recorded result is over, the hook prints a second line naming the sections over and the relocation route.
   - Pros: covers every session start, whatever entry point. No agent-prompt bytes, and the setup skill body shrinks. The line appears only when something is due or over, so a lean project never sees it (the constraint of `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`). The trace persists in `.check-stamps` until a later check records `over=0`.
   - Cons: new code under `hooks/` and `bin/`, a `hooks.json` entry, committed `dist/`, and tests (estimated 150 to 250 of the 3 435 lines of hook-test head-room). The checks are named, not run. Acting on them is still `/fusion:check`. In krk the over line appears at every session start until the file is relocated.
3. **An event row.** The `claude-md` block of `/fusion:check` appends a result event to `orchestrator-events.jsonl`, and the monitor's warnings panel shows it.
   - Pros: durable, and it travels with git.
   - Cons: reaches only someone looking at the dashboard. It does nothing for issue `261020-0916-claude-md-check-never-runs-in-orchestrator-sessions.md`, because the check still never runs there.

## Constraints

- Nothing blocks the session. A check that is not run stays due (`skills/setup/SKILL.md` Step 1).
- `.check-stamps` stays class L and never travels (`rules/workbench-tracking.md`).
- A notice that fires on its commonest path is one a reader learns to skip.
- Hook and CLI operator strings are English (`rules/fusion-workbench-conventions.md` `## Project language`).

## Recommendation

Option 2. It is the one channel that every session start passes through. The issue's acceptance line accepts "surfaces one line naming that they are due". It costs no bytes on any bounded prompt surface, and its single due computation removes the duplicate that option 1 would read from a skill body.

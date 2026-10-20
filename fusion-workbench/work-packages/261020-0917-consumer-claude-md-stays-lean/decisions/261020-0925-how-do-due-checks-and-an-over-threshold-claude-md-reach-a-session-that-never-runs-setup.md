# How do due periodic checks, and a `CLAUDE.md` found over threshold, reach a session that never runs `/fusion:setup`: a SessionStart notice, the orchestrator's Setup, or an event row?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261020-0916-claude-md-check-never-runs-in-orchestrator-sessions.md, 261020-0916-claude-md-over-threshold-finding-persists-nowhere.md, 261020-0835-why-a-consumers-claude-md-grows-unchecked.md, 260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md, 261020-0934-review-of-plan-consumer-claude-md-stays-lean.md

---

## Question

The due list for the eleven periodic checks is computed in one place only, the inline `node -e` block of `skills/setup/SKILL.md` Step 0. A session that starts through the orchestrator runs the orchestrator's inlined Setup, which computes none, so in krk the `claude-md` check never ran and `fusion-workbench/.check-stamps` does not exist. When the check does run, its over-threshold result lives only in the chat, and its stamp silences it for 30 days. Both issues ask for the same thing: a decided fact (which checks are due; what the last weight was) has to reach a session that skipped setup. Which channel carries it is a design choice that every later check inherits, so it is recorded.

Both facts are decidable from inputs a mechanism can read: `.check-stamps`, the plugin version, and the helper's own output. No option here has to approximate anything.

## Options

1. **The orchestrator's Setup runs setup's Step 0 and Step 1**, by reading `$FUSION_PLUGIN_ROOT/skills/setup/SKILL.md`. The `claude-md` stamp records the `over` count it found. Setup Step 0 prints the last recorded result when it was over, even when the check is not due.
   - Pros: one definition of the due list, reused. The due checks actually run, not just get named.
   - Cons: about +250 bytes on `agents/orchestrator.md` (path slack 3 719) and about +250 on the skill bodies. Reaches orchestrator sessions only, not a plain session that skips setup. Adds ceremony to every orchestrator start that has checks due.
2. **A SessionStart notice with a stored weight.** The due computation moves out of setup's inline block into one helper, which setup Step 0 and the existing `hooks/session-start.ts` both call. That hook already finds the workbench and writes one `systemMessage` envelope, so the notice adds lines to that envelope and no new SessionStart command is registered (revised after review `261020-0934-review-of-plan-consumer-claude-md-stays-lean.md`; the first version proposed a sixth command). The hook prints one line when checks are due ("run /fusion:check"). The `claude-md` stamp in `.check-stamps` records the `over` count, and while the last recorded count is above 0, the hook prints a second line naming the relocation route.
   - Pros: covers every session start, whatever the entry point. No agent-prompt bytes, and the setup skill body shrinks. A line appears only when something is due or over, so a lean, checked project never sees one (the constraint of `260810-0710_*_the-drift-checks-last-line-makes-the-whole-block-exit-non-zero-when-no-circle-is-active.md`). The trace is a record, as the issue's acceptance line literally asks.
   - Cons: new code under `hooks/lib/` and `bin/`, committed `dist/`, and tests (about 150 hook-test lines of 3 435). The checks are named, not run. Acting on them is still `/fusion:check`. **The stored count goes stale.** After the user relocates, the over line keeps showing until someone runs `/fusion:check` again. It also adds a field to the `.check-stamps` schema. **Noise after every release:** a version bump makes all eleven checks due (`skills/check/SKILL.md`, the stamp rule in its opening), so the due line appears in every project after each update until `/fusion:check` runs. It clears with that one action. It also sits beside the static banner "Orchestrator sessions: run /fusion:setup before any other work." (`hooks/hooks.json`), which says nearly the same thing. In krk the over line appears at every session start until the file is relocated.
3. **An event row.** The `claude-md` block of `/fusion:check` appends a result event to `orchestrator-events.jsonl`, and the monitor's warnings panel shows it.
   - Pros: durable, and it travels with git.
   - Cons: reaches only someone looking at the dashboard. It does nothing for issue `261020-0916-claude-md-check-never-runs-in-orchestrator-sessions.md`, because the check still never runs there.

4. **A SessionStart notice with a live weight.** As option 2 for the due line: one helper, the existing `hooks/session-start.ts`, and one envelope. The weight line is computed at each session start instead of being stored. The hook runs `bin/fusion-claude-md-weight` on the project root and prints the line while its `over=` is above 0. The helper is plain shell and took 0.044 s on krk's 179 260-byte file (measured 2026-10-20; the review measured 0.12 s). The call has a timeout and fails silent.
   - Pros: the line clears the moment the file is lean, with no `/fusion:check` in between, because it states the file as it is now. No `.check-stamps` schema change, and most of the stored-count work disappears (about 50 fewer hook-test lines than option 2, by estimate). A recomputed fact cannot drift from its source, and a stored copy can.
   - Cons: everything in option 2's cons except the stale count and the schema change. That includes the post-release due line in every project until `/fusion:check` runs, and the line beside the static banner. One process spawn per session start. **It departs from the issue's literal acceptance line**, which names "a durable trace (event row or record)". Here the durable trace is the `CLAUDE.md` itself, re-read at each start. Closing issue `261020-0916-claude-md-over-threshold-finding-persists-nowhere.md` under this option records that departure. A project that keeps a section over the threshold on purpose sees the line at every start. There is no per-project silence for it, and adding one would be a new `fusion.json` key, which this option does not add.

## Constraints

- Nothing blocks the session. A check that is not run stays due (`skills/setup/SKILL.md` Step 1).
- `.check-stamps` stays class L and never travels (`rules/workbench-tracking.md`).
- A notice that fires on its commonest path is one a reader learns to skip.
- Hook and CLI operator strings are English (`rules/fusion-workbench-conventions.md` `## Project language`).

## Recommendation

Option 4. Every session start passes through this one channel. The issue's acceptance line for the due checks accepts "surfaces one line naming that they are due". It costs no bytes on any bounded prompt surface. It reuses the envelope the existing hook already writes. Its single due computation removes the duplicate that option 1 would read from a skill body. Over option 2 it removes the one way the over line can lie: still showing after the file is lean. That costs a departure from the second issue's literal wording, which the user accepts or refuses here.

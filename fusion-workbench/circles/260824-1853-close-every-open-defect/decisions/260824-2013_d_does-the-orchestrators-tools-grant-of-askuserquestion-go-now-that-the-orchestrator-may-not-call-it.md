# Does the orchestrator's `tools:` grant of `AskUserQuestion` go, now that the orchestrator may not call it?

---
**Domain:** code
**Filed by:** analyst
**Attribution backfilled 260825 (not written by the filing agent):** `analyst` filed this record; the person half of `**Filed by:**` is absent because the installed plugin at `$FUSION_PLUGIN_ROOT` carried no `bin/fusion-identity` at that time. See `shared/issues/260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`.
**Cross-references:** `shared/issues/260824-1538_*_two-design-forks-from-the-dialog-ban-were-put-to-the-user-in-chat-and-recorded-only-in-a-history-log.md`; `shared/history/260824-0443-coder-orchestrator-asks-in-chat.md` (where the fork was first argued); `agents/orchestrator.md` frontmatter `tools:` line and `## How you ask the user anything`; `CLAUDE.md` `## Where to look when something breaks`, the v3.0.1 row on the missing allowlist entry; the sibling record filed in the same minute, `circles/260824-1853-close-every-open-defect/decisions/260824-2013_*_do-the-nine-skill-bodies-that-present-dialogs-follow-the-dialog-ban.md`; plan `circles/260824-1853-close-every-open-defect/planning/260824-1905_*_plan-close-every-open-defect.md` step 1 (D-dialog-allowlist) and step 12

---

## Question

`agents/orchestrator.md` bans the orchestrator from calling `AskUserQuestion` in any phase, because the dialog it renders discards a long typed answer and this project has lost user input to it. The same file's frontmatter still lists `AskUserQuestion` in its `tools:` allowlist. Whether the grant should go was put to the user in chat on 2026-08-24 and recorded only in a history log; the answer is not recoverable and the fork is stated here as it stands today. The fork turns on one fact the tree gives evidence for in one direction only: `CLAUDE.md`'s v3.0.1 row records that sub-agents inheriting from the orchestrator were denied the tool when the orchestrator's allowlist lacked it, and that the skill path worked because the skill body carried its own `allowed-tools`. Whether removing the grant now would deny the tool to dispatched sub-agents and to skill bodies that still present dialogs is the unmeasured half. The orchestrator is the only agent with an explicit `tools:` line, so every tool a sub-agent needs has to be listed there.

## Options

1. **Remove the grant** — the allowlist matches the ban; the orchestrator holds no tool it may not call.
   - Pros: the prompt and its frontmatter say one thing; a future author cannot read the grant as permission.
   - Cons: on the v3.0.1 evidence, sub-agents that inherit from the orchestrator lose the tool too, and nine skill bodies present dialogs; whether those paths still need it is the sibling record's question, and the two answers are coupled.
2. **Keep the grant, and say in the frontmatter's neighbourhood why it stays** — the tool is granted for inheritance and denied for use by the ban.
   - Pros: no inheritance path breaks; the ban already binds the orchestrator's own behaviour.
   - Cons: a grant that the holder may not exercise is the shape a reader misreads; the ban and the allowlist stay in tension and only prose holds them apart.
3. **Measure first, then decide** — one probe establishing whether a dispatched sub-agent and a skill body inherit the grant on the current Claude Code, run against a consuming project root.
   - Pros: the fork turns on that fact and nothing in the tree settles it; the v3.0.1 row is evidence from an older version and one direction.
   - Cons: the probe needs an interactive parent, which this tree cannot spawn (same limit as the sibling record's measurement).

## Constraints

- The ban on the orchestrator's own calls stands and is not reopened here.
- Every tool a sub-agent needs has to be listed on the orchestrator's `tools:` line; empirical verification of a frontmatter change is required before release (`CLAUDE.md`, the v2.8.1 and v3.0.1 rows).
- Option 1 cannot land ahead of the sibling record's answer if any skill body or sub-agent is to keep the tool.
- The chat exchange is not reconstructed from memory; the user answers the fork again on this record.

## Recommendation

None. The referring record asks that the fork be stated and put back to the user, and gives no direction.

---
Answered:
Implemented:
Deferred:
Superseded by:
Retired:

---
Deferred: a later Circle that meets the question again — user 2026-08-29, triage of open decisions left in terminal Circles; no scan reaches this store any more, so the deferral is recorded by hand.

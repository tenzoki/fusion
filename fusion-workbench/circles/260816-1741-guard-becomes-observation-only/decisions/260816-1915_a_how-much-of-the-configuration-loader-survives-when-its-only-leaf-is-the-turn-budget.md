# How much of the configuration loader survives when its only live leaf is the Turn budget?

---
**Domain:** code
**Status:** answered
**Filed by:** planner
**Cross-references:**
`circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_o_the-compliance-guard-becomes-observation-only.md` step 7a (the step this blocks),
`circles/260816-1741-guard-becomes-observation-only/decisions/260816-1742_a_where-does-the-orchestrators-turn-budget-live-once-the-guard-configuration-file-is-gone.md` (the answer this question follows from, option 1),
`hooks/lib/config.ts:1-150` (the three-layer merge and its stated reasons), `:254-272` (`DEFAULTS`), `:503-508` (`RETIRED_CONTAINER_LEAVES`), `:686-687` (the `guard.enabled` resolution the project layer is excluded from),
`hooks/config.json`, `hooks/config.example.json` (the plugin layer's two files),
`circles/260801-1244-guard-rules-write/decisions/260804-1631_i_may-a-project-file-set-guard-enabled-and-switch-the-whole-guard-off.md` (the decision `guard.enabled` implements)

---

## Question

The user answered on 2026-08-16 that the Turn budget moves to a renamed project-root file and that the loader survives in reduced form. That settles where the setting lives and that `hooks/lib/config.ts` is not deleted. It does not settle how much of the loader is left standing, and two of its parts have no obvious answer once the guard decides nothing.

**The plugin layer.** The merge runs project, then plugin `hooks/config.json`, then `DEFAULTS`. After this Circle the loader reads one leaf, `orchestrator.maxTurns`, and that leaf is deliberately absent from `hooks/config.json` so that its default lives in exactly one place. So the middle layer would carry nothing that the loader reads, by construction, while `readLayer` still emits a diagnostic on every guarded call when the file is missing, on the ground that a missing plugin file is a broken install.

**`guard.enabled`.** It is a guard key, read from the plugin layer and `DEFAULTS` only, and a project that declares it earns a diagnostic naming it. After this Circle it would gate nothing but the `guard_allow` write trace, which is not what any of its records say it is for.

The two are one question rather than two, because `guard.enabled` has no home outside the plugin layer: it is the one key the project layer may not set. An answer that removes the layer removes the key with it, and an answer that keeps the layer has to say what the key now means.

## Options

1. **Two layers and no `guard.enabled`.** The merge becomes the project's file, then `DEFAULTS`. `hooks/config.json` and `hooks/config.example.json` are deleted, `ConfigLayer` collapses, and the missing-plugin-file diagnostic goes with the file it was about.
   - Pros: nothing survives that reads nothing. The loader becomes what it is, a reader of one project-level integer with a retirement announcement attached. It removes the last of the guard's configuration surface in the same release that removes the guard's verdict, so a project meets one change rather than two.
   - Cons: it deletes a layer the shipped documentation describes at length, and it removes the ability to switch the write trace off. It also goes one step past the letter of the user's answer, which spoke of the file rather than of the layers.

2. **Keep all three layers and keep `guard.enabled` as the write-trace switch.** `hooks/config.json` stays as `{"guard": {"enabled": true}}`; declaring it false stops the guard emitting `guard_allow`.
   - Pros: the smallest change to the loader, and the merge documentation stays true. It leaves a way to silence the hook for anyone who does not want the write trace.
   - Cons: it renames a key rather than retiring it, which is the pattern the retirement table exists to refuse. `guard.enabled` means "switch off the guard that governs you" in three decision records and four documents; making it mean "stop writing an event row" is a quiet redefinition that no record covers. It also keeps a layer alive to carry one boolean nobody has asked for.

3. **Keep the three layers, retire `guard.enabled` with the rest.** `hooks/config.json` stays as an empty object with its documentation comment, so the plugin layer exists and carries nothing.
   - Pros: no documentation about the merge becomes false, and a future non-guard setting has a plugin-level default to land in.
   - Cons: a layer that carries nothing is a claim rather than a capability, which is the shape both the protected list and the escalation counter were removed for. It also keeps the missing-file diagnostic firing about a file whose absence costs nothing.

## Constraints

- **The default stays defined in exactly one place.** `DEFAULTS` in `hooks/lib/config.ts` today. Any answer keeps it there, and none may restate it in a shipped JSON file.
- **The retired-key announcement must keep a reader.** The Turn-budget decision's own constraint: something has to read a project's leftover `fusion-guard.json` in order to name it. Every option here keeps the project layer and the diagnostics channel, so all three satisfy it, but an answer that trimmed further would not.
- **The unresolved-budget branch must keep working.** `agents/orchestrator.md` Setup Step 2 and Step 3d specify what the orchestrator does when the budget does not resolve. Whatever reads the budget must still be able to fail in a way the orchestrator can detect.
- **`guard.enabled` is not free to keep quietly.** It is implemented by decision `260804-1631` and described in `README.md`, `README-hooks.md`, `CLAUDE.md` and `templates/fusion-guard.json`. Options 1 and 3 retire it and must add the `Retired:` line to that record; option 2 redefines it and needs a record of its own.

## Recommendation

Option 1. The loader's whole reason for three layers was that guard settings needed a plugin-level default a project could narrow, and that reason leaves with the guard. Keeping the layer against a future setting is the argument option 3 makes, and it is the same argument the escalation counter was kept on until it was measured: ready for a block source that never came.

Option 2 is the one to rule out first. Redefining a key whose current meaning is written into three decision records and four documents costs more to explain than the switch is worth, and nobody has asked to switch the write trace off.

---
Answered: circles/260816-1741-guard-becomes-observation-only/history/260816-1841-orchestrator-session.md — user chose option 1 at the plan gate on 2026-08-16. Two merge layers, not three: `hooks/config.json` and `hooks/config.example.json` go, and `guard.enabled` is retired with the rest of the guard settings. `DEFAULTS` in `hooks/lib/config.ts` stays the single definition site. Realised by plan step 7a in `circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_o_the-compliance-guard-becomes-observation-only.md`.

# May an entry profile's `prior` part spell the helper calls and resolver keys its `host.exec.v1` runs, which the Prior-render token lint refuses today?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261024-2111-agent-span-map-for-entry-profiles.md; 261023-1854-plan-prior-full-surface-handover-h1-to-h9.md; 261023-1854-how-does-a-skill-become-a-profile-when-its-body-carries-claude-mechanics.md; 261010-1235-how-is-the-host-neutral-role-text-the-source-of-both-the-claude-agents-and-the-prior-profiles.md; 261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md; 261010-1504-span-map-and-repair-correspondence.md

---

## Question

An entry run on Prior does its Setup and every record write through `host.exec.v1`, which takes an exact `argv` (Prior `moduleapi/v1/entry_wire.go` `ExecCall`). The `prior` part that replaces a Setup span therefore has to tell the model which helper to run, with which arguments, and which `KEY=value` lines to read back. The live test `render prior (live catalog)` in `catalog/src/__tests__/render.test.ts` runs `HOST_TOKENS` over every rendered Prior profile outside an inlined rule, and `HOST_TOKENS` refuses `$FUSION_PLUGIN_ROOT`, every `bin/fusion-*` path, every helper name as a bare word, and every `OUT_*`/`SCAN_*` key, with or without `$`. No spelling of a helper or a key passes it. The three repair profiles are rendered today, so plan step 10 turns that test red the moment it adds a helper call. The eight new profiles render from step 15 on, so steps 6 to 9 would write text that cannot pass then. This has to be ruled before step 6 writes the first `prior` part.

## Options

1. **Split the lint by host.** `neutral` parts keep the full `HOST_TOKENS` list, unchanged. Over a Prior render, only the Claude Code tokens stay refused: `Agent(`, `AskUserQuestion`, a slash command. The exec-mount tokens are admitted in `prior` parts: `$FUSION_PLUGIN_ROOT`, `bin/fusion-*`, the bare helper names, `OUT_*`/`SCAN_*`.
   - Pros: the `prior` part can state the exact `argv` and the keys to read, so the model guesses nothing. H8 puts `FUSION_PLUGIN_ROOT` on the executor's mount, so the names are Prior facts as well as Claude ones. The ruling `261009-1024-…` lets each host adapt "Werkzeuge und Aufrufmechanik", and a helper run through `host.exec.v1` is Prior's invocation mechanics. The neutral contract does not move.
   - Cons: a test change in `render.test.ts` (code-implementer) before step 6. The Prior text names fusion's install paths, so a helper rename has to reach the `prior` parts too.
2. **Keep the lint; the `prior` parts name helpers by role, and Prior maps them.** For example "the path resolver the bundle mounts". The role input or a host-side table gives the `argv`. Request 76 asks Prior for that table.
   - Pros: no fusion test changes.
   - Cons: depends on a Prior feature nobody has asked for. The model has to turn a description into an exact command, which is the weaker contract. Steps 6 to 10 wait on Prior's answer.
3. **Keep the lint; entries on Prior use no fusion helper.** Every Setup and record step is restated as host-native work, for example records through `host.workbench.v1`.
   - Pros: the Prior text stays free of fusion names.
   - Cons: it reimplements the codec rules that the helpers carry. It contradicts H8, whose payload carries `bin/` so that `host.exec.v1` can run it. It also makes the structural effect differ from Claude Code by construction.

## Constraints

- The neutral-part lint and the byte equality of the Claude render do not move (`261010-1235-…` `## Constraints`).
- `checkEntries` reads the services named in `prior` parts by substring, so whatever is chosen, a `prior` part must not name a service outside its entry's `requires`, not even in a negative sentence.
- Plan step 10 cannot pass `FUSION-CATALOG` under option 2 or 3 without first deciding what it writes.

## Recommendation

Option 1. The lint exists to keep Claude mechanics out of Prior's text. A helper that Prior itself mounts and runs is not a Claude mechanic. `Agent(`, `AskUserQuestion` and slash commands are, and they stay refused. The change is one test split and it lands before step 6. Confidence: inference, from reading the test, the hand-over's H8 and `ExecCall`. Prior has not said how its executor spells the mount path.

The hook-route exclusion test pins which modules spawn, not what they spawn
---
`hooks/lib/__tests__/hook-route-exclusion.test.ts` proves the absence of a codec route in two halves. The static half pins the set of modules importing `node:child_process` (`lib/git.js`, `lib/orchestrator-events.js`, `session-start.js`), not the programs they start. The dynamic half runs one payload per configured matcher tool. A new `execFileSync` of `bin/fusion-claimed-package`, `bin/fusion-work-order` or `hooks/dist/scope.js` inside one of the three pinned modules, on a branch the payloads do not take, passes both halves.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Severity:** Low
**Cross-references:** 260929-1919_*_the-dispatch-hook-reaches-the-claimed-package-helper-through-fusion-rules-so-how-does-it-stay-off-the-codec.md, 260929-1810_*_plan-fj03a-the-record-client-the-format-gate-and-scope-and-order-on-json.md

Evidence:
- `hook-route-exclusion.test.ts`, "reaches no record client by import, and starts a subprocess from three modules only": `expect(spawning).toEqual(["lib/git.js", "lib/orchestrator-events.js", "session-start.js"])`. The comment above it names what each starts, and nothing asserts it.
- `payloads()`: SessionStart runs with `source: "startup"` only; write tools run against `<root>/notes.txt` only, never a path under `fusion-workbench/`; the dispatch prompt is one fixed shape. `hooks/session-start.ts` branches on the session source (header, "a resumed session's second SessionStart spawns nothing").
- What does hold, verified by reading: every path that reaches `hooks/lib/record-client.ts` from the scratch plugin lands on the logging bundle stub (`defaultBundle()` resolves to `<plugin>/codec/dist/fusion-record.js`), so any codec reach on an exercised branch is caught, a subprocess route included. The gap is limited to branches the payloads do not take.

Prior's amendment to step 2 asks the test to cover "the helper routes they execute"; it does, for the executed routes.

Fix direction: pin the argv[0] of every `execFileSync`/`spawnSync` call site in the modules the automatic entries reach (a static read of the call's first argument, `git`, `bin/fusion-identity`, `bin/fusion-count-sources`), so a new program on an automatic route fails the static half. Optionally add a SessionStart `resume`/`compact` payload and a write under `fusion-workbench/` to the dynamic half.

Acceptance: adding `execFileSync(join(pluginRoot, "bin", "fusion-claimed-package"))` to an unexercised branch of `lib/orchestrator-events.ts` on a scratch copy turns the test red.

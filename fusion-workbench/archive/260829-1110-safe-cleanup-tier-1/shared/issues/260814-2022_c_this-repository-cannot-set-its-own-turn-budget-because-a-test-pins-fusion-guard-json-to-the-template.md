This repository cannot set its own Turn budget, because a test pins `fusion-guard.json` byte-identical to the template — and the suite is red right now

---
`hooks/lib/__tests__/config.test.ts:1325` asserts the repository-root `fusion-guard.json` is byte-identical to `templates/fusion-guard.json`. The template's own `_turnBudget` note tells every project that this file is the only place to change the orchestrator's Turn budget. Both cannot hold for this repository. Somebody set `"orchestrator": {"maxTurns": 12}` here at 2026-08-14 19:35 local and `npm test` has been red since.

---
**Found by:** coderev, Turn-5 incremental review of `d5b71f1..41c224c`, review file `260814-2022-coderev-curator-turn-5.md`.
**Owner:** the user for the design question; `coder` for whichever answer is chosen.
**Severity:** High — the suite is red at the working tree at the moment this Circle closes, and the release process's step 0 runs against a green suite.
**Affects:** `hooks/lib/__tests__/config.test.ts:1325-1336`; `fusion-guard.json` (working tree, uncommitted); `templates/fusion-guard.json:6` (`_turnBudget`); `hooks/lib/config.ts:277` (`maxTurns: 5`, the default); `bin/fusion-turn-budget`.
**Cross-references:** `260813-2009_*_the-tuning-table-preamble-tells-the-reader-to-declare-a-key-the-project-layer-refuses.md` (the same shape one layer up — documentation telling a project to declare a key the mechanism refuses); `260813-2009_*_the-turn-budget-row-says-no-hook-reads-the-key-while-describing-the-advisory-a-hook-emits.md`.

**Verified 2026-08-14 at HEAD `41c224c`, on the working tree.**

## The failure

```
cd hooks && npm test
→ Test Files  1 failed | 48 passed (49)
        Tests  1 failed | 1029 passed (1030)
   lib/__tests__/config.test.ts:1334
   + "orchestrator": { "maxTurns": 12 },
```

That one added line is the entire diff. `git status` shows `fusion-guard.json` modified and uncommitted; `stat` gives its mtime as 2026-08-14 19:35:20 local, which is after the Turn-5 task reported `npm test exit 0` at 19:12 and before the session resumed at 20:09. `fusion-workbench/agentstate.yaml` reads `max_turns: 12`, so the session is running on the value that broke the suite.

## Why this is a design fault and not a stray edit

The test's own comment says why it exists: *"Per plan Q4 the repository root carries the template verbatim. Asserted rather than eyeballed, because the two files drift the first time someone edits the one they happen to have open."* That is a good reason to catch **accidental** drift. Byte identity cannot tell accidental drift from a project exercising the one configuration surface the template documents:

> `"orchestrator": {"maxTurns": N}` … it is read once per session by `bin/fusion-turn-budget` at the orchestrator's Setup … **this file is the only place a project changes it.**

This repository *is* a project. It runs its own workbench, its own orchestrator and its own Turn loop, and the default of 5 in `hooks/lib/config.ts:277` is not always the right budget for it. `rules/critical-stance.md` §4 is the standard the test fails: the question "did this file drift by accident?" is not decidable from byte identity, because a deliberate documented change and an accidental one are the same bytes.

The failure is also silent in the direction that matters least and loud in the direction that matters most: a developer who follows the documentation gets a red suite with no hint that the assertion is about drift rather than about validity.

## Three ways out, none of them chosen here

1. **Assert everything except the configurable leaves.** Compare the two files with the `orchestrator` key (and any future project-configurable key) stripped from both. Keeps the drift check for the 99% of the file that is prose, admits the one key the file exists to let a project set.
2. **Assert the template against a fixture, and drop the repository copy from the assertion.** The thing worth pinning is that the shipped template says what it should; that this repository's own copy equals it is a separate and weaker claim.
3. **Revert the working-tree edit and accept the budget of 5.** This makes the suite green today and leaves the conflict standing for the next session that needs a longer Turn loop.

Option 1 or 2 is a `coder` change. Option 3 alone is not a fix.

**Whatever is chosen, the suite must be green before this Circle's closure commit, or the closure ships a red tree.**

---
Resolved: Option 1, in `hooks/lib/__tests__/config.test.ts`. The case now compares the two files with the top-level entries named in `PROJECT_SET_KEYS` — today `["orchestrator"]`, the one list the exemption is stated in — cut out of the source text of both sides, so the five documentation notes, their order and the whitespace between them are still held byte for byte while the Turn budget this repository sets for itself is admitted. The cut is a JSON-aware text scan, not a parse-and-reserialise, because the round trip would normalise away exactly the indentation, blank lines and key order the case exists to hold still; it is asserted to be a no-op on the template, which declares no setting, so the comparison cannot be vacuous. `cd hooks && npm test` exits 0 with `"maxTurns": 12` in place, and exits 1 on a single character changed inside a shared prose note, on a removed note, on two notes reordered and on a removed blank line. The task itself edited neither JSON file, but the commit that carries this note, `f0d9d60`, does commit one: the working-tree line `"orchestrator": { "maxTurns": 12 }` in `fusion-guard.json`, uncommitted since 2026-08-14 19:35 local, entered version control there, because the test change is what makes it legal. `templates/fusion-guard.json` was neither edited nor committed. See `260814-2115-coder-turn-6-drift-check-admits-the-turn-budget.md`.

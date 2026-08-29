# Pin the Bash guard allow-path "no write-guard side-effects" invariant with a test

---
**Status:** open
**Filed by:** orchestrator (follow-up to bf18fc0 closing 260707-0750_*_bash-allow-resets-block-counter-defeats-halt-escalation.md + 260707-0751_*_guard-allow-bash-events-flood-events-jsonl.md)
---

## Symptom

The fix bf18fc0 removed `resetBlockCounter` / `saveEscalation` / `emitEvent("guard_allow")`
from the Bash allow-path of `guardBashCommand` (`hooks/guard.ts`). The behaviour is now
correct and coderev-verified, but **no test pins the invariant**. Both closed issues explicitly
asked for one:

- 260707-0750_*_bash-allow-resets-block-counter-defeats-halt-escalation.md: "add a test asserting that an allowed Bash call between two blocks does not
  reset `consecutiveBlocks` ... so the intent is pinned."
- 260707-0751_*_guard-allow-bash-events-flood-events-jsonl.md: "Run a handful of innocuous Bash calls through `dist/guard.js` and confirm no
  `guard_allow` Bash lines are appended to `events.jsonl`, while a denied `git switch` still
  emits `guard_block`."

Without the test, a future edit to `guardBashCommand` could silently re-introduce either
side-effect. The parent commit dbf98f6 set the precedent (it added `hooks-wiring.test.ts` for
exactly this "unit tests pass while the real wiring regressed" failure mode).

## Root cause / why it wasn't done in bf18fc0

`hooks/guard.ts` is the hook entrypoint and exports nothing. The existing suite tests the pure
classifier in `hooks/lib/git-branch-guard.ts`, not `guard.ts`'s side-effects. Pinning the
allow-path invariant needs one of:

1. **Subprocess/integration test** — pipe a PreToolUse JSON payload for an innocuous Bash call
   (e.g. `ls`) into `dist/guard.js`, then assert `escalation.json.consecutiveBlocks` is
   unchanged and `events.jsonl` gained no `guard_allow` line; and that a denied `git switch`
   payload still writes `guard_block`. Matches the verification hint in both issues. Needs a
   tmp-dir harness (isolated cwd + `.guard-state/`).
2. **Refactor `guardBashCommand` (and the write-tool allow-path) into a testable unit** and
   mock the `escalation` + `events` modules with vitest, asserting call counts.

Option 1 is closer to the issues' stated verification and avoids touching production control
flow; option 2 gives faster, hermetic unit tests. Coder decides.

## Impact

Low — the runtime defect is already fixed and verified. This is regression-hardening so the
fix cannot silently unwind. Non-blocking.

## Acceptance

- A test fails if the Bash allow-path is reverted to reset the counter or emit `guard_allow`.
- A test confirms a denied `git switch` still records a block + emits `guard_block`.
- Full hooks suite still green.

---
Resolved: Both acceptance bullets are met, by option 1 (the subprocess/tmpdir harness the issue preferred), as a side effect of Circle `260801-1244-guard-bash-inspection` needing the same harness for its own wiring. Verified by the reconciler at HEAD `9ab5a2a` by reading the assertions, not the commit messages.

The harness is `hooks/lib/__tests__/helpers/guard-harness.ts` (new, commit `85c043c`): `mkdtemp` project root carrying `fusion-workbench/.fusion-setup`, no `.claude-plugin/plugin.json` so the write guard is active there, one spawned `node hooks/dist/guard.js` per case with `cwd` set to it, PreToolUse JSON on stdin.

- *"A test fails if the Bash allow-path is reverted to reset the counter or emit `guard_allow`."* — `guard-bash-integration.test.ts:301-343`, "innocuous Bash after a block neither resets the counter nor appends an event". One block sets `consecutiveBlocks` to 1; nine innocuous calls follow (`ls -la`, `git status`, `mv notes.txt /tmp/`, `rm -rf build`, `sed -i '' 's/a/b/' notes.txt`, `cp rules/x.md /tmp/y`, `git checkout HEAD -- rules/x.md`, `echo hi 2>&1`); the assertions are on the files — `readEscalation(root)?.consecutiveBlocks` still 1 and `readEvents(root)` still exactly `["guard_block"]`. Both named issues, 260707-0750_*_bash-allow-resets-block-counter-defeats-halt-escalation.md and 260707-0751_*_guard-allow-bash-events-flood-events-jsonl.md, are cited in the test's own comment. A stronger sibling at `:286-299` asserts a fresh project running `ls -la` never creates `.guard-state` at all.
- *"A test confirms a denied `git switch` still records a block + emits `guard_block`."* — `guard-bash-integration.test.ts:412-427` asserts the block verdict, the reason text and `recentEvents` trigger `git_branch_switch`; `guard-bash-wiring.test.ts:281` and `:399` assert the `guard_block` line in `events.jsonl` for the denial paths.
- *"Full hooks suite still green."* — `npm test` in `hooks/`: 753 passed, 16 files, exit 0. The script is now `tsc && vitest run`, so the suite runs against a freshly built `dist` rather than a possibly stale one.

Note the issue predicted the cost correctly ("needs a tmp-dir harness (isolated cwd + `.guard-state/`)") and that is what was built. Closed by reconciler 260801-2029.

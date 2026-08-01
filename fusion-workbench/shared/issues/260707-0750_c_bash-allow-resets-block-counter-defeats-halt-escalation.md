# Widening guard matcher to Bash lets every innocuous Bash call reset the halt escalation counter

---
**Status:** open
**Filed by:** coderev (review of the 3.25.0 guard-wiring fix)
---

## Symptom

With `Bash` now in the `PreToolUse` guard matcher (`hooks/hooks.json`, 3.25.0), the guard's
Bash allow path runs on **every** Bash tool call and calls `resetBlockCounter()` +
`saveEscalation()`. Because agents run Bash constantly between write attempts, the
consecutive-block counter (`consecutiveBlocks` in `escalation.json`) is now zeroed almost
continuously — so the escalation-to-halt safety mechanism effectively never fires.

## Root cause (verified)

`hooks/guard.ts:161-167` (Bash allow path):

```
const escalation = loadEscalation();
resetBlockCounter(escalation);   // zeroes consecutiveBlocks
saveEscalation(escalation);
emitEvent("guard_allow", "Bash");
allow();
```

`blocksBeforeHalt` defaults to `3` (`hooks/lib/config.ts:91`); halt triggers when
`consecutiveBlocks >= blocksBeforeHalt` (`hooks/lib/escalation.ts:122`).

Before 3.25.0 the guard never saw Bash, so only a successful **write-tool** allow reset the
counter. After 3.25.0, any allowed Bash call resets it too. Concrete failure scenario:

1. Agent attempts a protected write → block (`consecutiveBlocks = 1`).
2. Agent runs `ls` / `git status` / a test → guard allows Bash → `resetBlockCounter` → `0`.
3. Agent attempts the protected write again → block (`consecutiveBlocks = 1`).
4. Repeat forever. `consecutiveBlocks` never reaches `3`; the halt never engages.

The same defeat applies to the **new git-branch escalation**: repeated denied `git switch`
attempts each `recordBlock` (increment), but any intervening allowed Bash resets the count,
so a branch-switch-hammering agent never escalates to halt.

## Impact

- **Core enforcement is intact** — the branch/worktree deny and the protected-path block are
  returned on every offending call regardless of the counter. This is a degradation of the
  *secondary* halt-amplification feature, not of the primary deny. Hence non-blocking.
- The "N consecutive blocks → halt all writes" behaviour documented as churn/escalation
  tracking is now practically unreachable in normal interleaved agent operation.
- Secondary: `saveEscalation()` (a JSON rewrite) now runs on every Bash call, adding I/O and
  widening the write-contention window when two orchestrators run against one project.

## Fix options (for coder to decide)

1. Do **not** reset the block counter from the Bash allow path — leave `consecutiveBlocks`
   untouched on innocuous Bash, so only a genuine write-tool allow (real forward progress on
   the guarded surface) resets it. Lowest-risk; preserves prior semantics.
2. Or gate the reset/save behind "only when state actually changed" so a no-op Bash allow
   does not rewrite `escalation.json`.

Whichever is chosen, add a test asserting that an allowed Bash call between two blocks does
not reset `consecutiveBlocks` (or the deliberately-chosen opposite), so the intent is pinned.

## Verification

Simulate block → allowed-Bash → block and assert `consecutiveBlocks == 2` (option 1) rather
than the current `1`.

---
Resolved: bf18fc0 — Bash guard allow-path now calls only allow(); no longer resets consecutiveBlocks. Verified: coderev clean, escalation counter reset now exclusive to the write-tool allow-path (guard.ts:347). Hooks suite 91 pass.

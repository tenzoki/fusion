# Branch-switch guard bypassed live — PreToolUse Bash hook not invoked by harness for `git switch`

---
**Status:** open
**Filed by:** orchestrator (from analyst root-cause 260717-1935 + two live re-probes)
**Severity:** security-relevant coverage gap (NOT a fusion code defect)
---

## Symptom

A deliberate `git switch <nonexistent-branch>` issued through the Bash tool in the fusion
repo root was **not blocked** by the fusion branch-switch guard. git executed and failed on
its own (`fatal: invalid reference`, exit 128). Two live probes, same result, no deny trace
either time. CLAUDE.md states the branch-switch guard "stays active even here [fusion's own
repo] — it only ever gated the agent's Bash tool calls." In this session it did not gate them.

## Root cause (analyst 260717-1935, verified)

**The shipped fusion code and wiring are correct — this is a session-harness artifact, not a
fusion bug.** Evidence chain:

1. **Shipped hook blocks correctly (verified by direct execution).**
   `printf '{"tool_name":"Bash","tool_input":{"command":"git switch x"}}' | node hooks/dist/guard.js`
   → `{"decision":"block",...}`. Control (`ls -la`) → `{}`. The classifier
   (`hooks/lib/git-branch-guard.ts:200-203`) is sound, and the Bash path runs *before* the
   fusion self-detect stand-down (`hooks/guard.ts:225-228` returns ahead of the
   `isFusionPluginCwd()` check at :234) — so it is active in fusion's own repo, as documented.
2. **Not stale dist.** `git status --short hooks/dist` clean; dist carries the
   `isBash → guardBashCommand` branch (committed in `dbf98f6`). (An unrelated stale 3.21.0
   cache copy has the pre-`dbf98f6` matcher, but that is not the loaded hook.)
3. **The live miss left no deny-path trace.** The deny path is indelible (increments
   `consecutiveBlocks`, appends `guard_block`). The only `guard_block` on 2026-07-17
   (17:33:40Z) is the analyst's *controlled* `node dist/guard.js` run — which recorded the
   block correctly. Both *live* Bash probes recorded nothing. git ran → the PreToolUse hook
   was never invoked for those calls.
4. **Asymmetry:** PostToolUse `tracker.js` DID log `"tool":"Bash"` entries this session, so the
   harness matched Bash for PostToolUse — but PreToolUse produced no deny trace for the same
   call. Same matcher, two registrations, one fired and one didn't → harness-level dispatch,
   not fusion config. Override env vars (`FUSION_ALLOW_BRANCH_SWITCH` / `_WORKTREE`) were empty.

## Verdict (calibrated)

- Fusion code/wiring correct — **verified** (direct execution + clean `git status`).
- Live miss = PreToolUse Bash hook not invoked this session — **verified** (missing indelible
  deny-path side-effects).
- *Why* the harness skipped it — **undetermined / speculative**: candidates are hook-load
  timing at session start, a reload re-registering PostToolUse but not PreToolUse, or per-mode
  dispatch. Not establishable from static evidence.

## Why file it despite not being a fusion bug

The branch-switch choke-point silently degraded from "can't" to "usually can't". A guard that
protects against branch-drift chaos but can be silently skipped by the harness is a coverage
gap worth tracking, and the defense arguably should not depend solely on PreToolUse firing.

## Recommended next steps

1. **Report upstream** (Claude Code hook reliability): PreToolUse Bash hook not invoked for a
   real Bash tool call while PostToolUse Bash *was* invoked in the same session. Capture session
   conditions (fresh start vs reload, plugin load order).
2. **Consider a defense independent of PreToolUse firing** (design discussion, not committed):
   e.g. a repo-level git hook (`.git/hooks/pre-checkout`) or a launcher-level guard, so the
   protection survives a harness that skips PreToolUse. Weigh against fusion's "hooks are the
   enforcement surface" posture — this may be out of scope and belongs upstream.
3. No fusion rebuild needed (`npm run build` in `hooks/` would change nothing — dist is current).

## Acceptance

- Upstream report filed (or a decision recorded that it is out of fusion's scope).
- If a PreToolUse-independent defense is pursued, it lands as its own scoped issue/plan.
- A note in CLAUDE.md or the guard docs that "stays active even here" holds only when the
  harness actually invokes the PreToolUse Bash hook — the guarantee is not self-enforcing.

## Related

- Analyst root-cause: `260717-1935-branch-switch-guard-live-miss-root-cause.md`
- Guard state was mutated by the diagnostic run (consecutiveBlocks 0→1); reset to baseline by
  the orchestrator after filing. Halt threshold is 3, so no halt occurred.

---
## Update (2026-07-17): a SECOND, opposite facet — verified over-blocking

The guard has two independent defects, in opposite directions.

**Facet 1 (original, above): under-firing.** The harness sometimes does not invoke
the PreToolUse Bash hook at all, so a real branch switch runs unblocked. Coverage gap,
likely upstream Claude Code. The shipped classifier blocks correctly when invoked.

**Facet 2 (NEW, verified this session): over-blocking a file restore.** When the guard
IS invoked, it blocks the checkout-a-pathspec form (restoring a file), which is not a
branch operation. Surfaced when a coder's `git checkout agents/coder.md` (to restore a
lint fixture) was blocked; it fell back to `git restore`. Verified by piping tool_input
through `node hooks/dist/guard.js`:

| Command | Decision | Correct? |
|---|---|---|
| checkout of a bare file path (`… agents/coder.md`) | block | NO — false positive (file restore) |
| checkout with explicit `HEAD -- <path>` | allow | yes |
| `git restore <path>` | allow | yes |
| switch to a branch | block | yes |
| checkout `-b <newbranch>` | block | yes |

Root cause: the classifier cannot distinguish a branch target from a file target when
there is no `--` pathspec separator, so it blocks the ambiguous form conservatively.
That blocks legitimate file restores.

**Facet 3 (also live, already tracked separately as 260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md): heredoc text match.**
The classifier matched the git-command STRINGS inside a documentation heredoc (this very
note) and blocked the append. It should match an actual command invocation, not command
names quoted inside heredoc/prose. Cross-reference 260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md.

**Constraint on any fix (do not open a bypass):** branches can contain `/` (the current
branch is `feature/plane`), so a naive "arg contains a slash -> allow" heuristic would let
a real branch checkout through. The fix must keep every real branch switch blocked while
allowing an unambiguous file restore.

**Recommended fix direction (facet 2):** ensure every unambiguous pathspec form is
allowed (checkout with `--`, checkout `<ref> -- <paths>`, `git restore`), and for the
ambiguous no-`--` form either (a) keep blocking but make the message steer the agent to
`git restore <file>`, or (b) a filesystem+ref-aware allow (arg exists as a path AND is not
a valid ref). Improve the block message either way.

**Policy is NOT revised** — agents still never create/switch branches or worktrees; this
is a precision fix to the guard, not a loosening of the boundary.

Status: facet 2 fixed in the commit that follows this note; facet 1 (harness under-firing)
remains open pending an upstream report; facet 3 tracked at 260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md.

---
## Closure (2026-07-18)

All three facets are now dispositioned; closing the umbrella issue.

- **Facet 2 (over-blocking a file restore)** — FIXED in `9880b90`. Filesystem+ref-aware
  allow: a bare checkout of an existing file that is not a valid ref is allowed; every
  real branch (including one with a slash, or one sharing a name with a file) stays
  blocked. 63-test guard suite.
- **Facet 3 (git-command strings matched inside heredoc/prose data regions)** — FIXED in
  `3fdb7c1` (tracked as issue `260716-2005_*_branch-guard-false-positive-on-markdown-backticks-in-heredoc.md`, now closed). `stripDataRegions()` models
  shell data regions. Guard suite 63 → 84.
- **Facet 1 (harness sometimes does not invoke the PreToolUse Bash hook)** — ACCEPTED
  LIMITATION, not fusion-fixable. The shipped classifier blocks correctly WHEN invoked
  (verified repeatedly by piping tool_input through `dist/guard.js`); whether the Claude
  Code harness invokes the hook for a given Bash call is outside fusion's control. The
  natural in-fusion defence (a git-level `pre-checkout` hook) is rejected because it would
  gate the human's own terminal, violating the load-bearing design rule that the guard
  only ever gates agent Bash calls. Observed behaviour was also inconsistent within a
  single session (fired for most calls, missed two early `git switch` probes), consistent
  with a session-startup/timing artifact rather than a persistent hole.

  **Risk disposition:** low and accepted. Agents rarely attempt branch switches; when the
  guard misses one, the effect is visible (HEAD/branch changes, commits land visibly) and
  the human can revert; the human terminal is never affected. The guard's guarantee is
  therefore **best-effort, contingent on the harness invoking the hook** — a maintainer
  caveat, not a change to what agents are told (agents still never switch branches).

  If the harness invocation gap proves persistent and material in future, the path is an
  upstream Claude Code report (hook-dispatch reliability), not a fusion code change.

Closed. Facets 2 and 3 fixed in fusion; facet 1 accepted and documented.

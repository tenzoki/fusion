The commit-lock header does not carry the `cd` the rule now states as part of its contract
---
`rules/commit-lock.md` gained a paragraph "`with` performs a `cd`" with the absolute-pathspec consequence. `CLAUDE.md`'s `bin/fusion-commit-lock` row says the script's own header carries the same contract as the rule for a reader who reaches the file first. The header's usage block for `with` says "Acquire, run the command preserving its exit code, release" and nothing about the directory the command runs in.
---
**Filed by:** coderev
**Severity:** Low
**Affects:** `bin/fusion-commit-lock` (header comment, the `with` usage entry). `bin/` is under a concurrent coder's edit at the time of filing; verify at HEAD before acting.

**Evidence.**

- The rule, added in `01964e4`: `rules/commit-lock.md` `## Commit lock`, paragraph beginning "**`with` performs a `cd`.**": resolves the workbench root via `bin/fusion-workbench-root`, runs the wrapped command there, "not the caller's directory, and not the git toplevel"; every pathspec written absolute; a relative list "exits 128 with nothing staged wherever the three directories differ".
- The script agrees with the rule: `bin/fusion-commit-lock`, `with)` branch, `root="$(resolve_root)" || exit 1; cd "$root"` before `do_acquire` and `"$@"`; `resolve_root` calls `"$(dirname "$0")/fusion-workbench-root"`. Verified; the paragraph is accurate.
- The header is silent on it: `bin/fusion-commit-lock` header, "Usage:" block, the `with <tag> -- <command...>` entry reads "Canonical pattern. Acquire, run the command preserving its exit code, release (even on error or signal via trap). Use this form unless you have internal control-flow that requires explicit acquire/release." No `cd`, no pathspec consequence. The same entry still offers the acquire/release pair for "internal control-flow", which the rule now qualifies with "no shipped call site holds the lock that way today"; that half is consistent, the `cd` half is not.
- `CLAUDE.md` `## Layout`, row `bin/fusion-commit-lock`: "the script's own header carries the same contract for a reader who reaches the file first."

**Why it matters.** The `cd` is the one property of `with` that silently changes what a `git add` line does, and the header is the surface a skill author reads when composing a held command from the script rather than from the rule. It is the property that cost the orchestrator a measured pathspec failure (`agents/orchestrator.md` Step 3b step 4).

**Proposed fix.** Two sentences in the header's `with` entry: the command runs from the workbench root (`fusion-workbench-root` from the caller's directory), so pathspecs in it are written absolute. No behaviour change.

---
Resolved: fixed — the `with` usage entry now says the command runs from the workbench root and every pathspec in it is written absolute; bin/fusion-commit-lock:48-51

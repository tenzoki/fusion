# coder — Turn-2 review findings, four fixes

**Date:** 2026-08-06
**Agent:** coder
**Status:** Complete
**Source:** review `reviews/260806-02-coderev-inkrementalreview-turn2-repo-gate-lock-retrofit.md`, issues `260806-0852` … `260806-0855`

## What was implemented

1. **`skills/commit/SKILL.md`** (issue 0852, Medium) — staging deferred into the locked step. Step 2 is selection-only (no `git add`; absorption rationale stated inline), step 3 analyses `git diff --cached` plus `git diff -- <selected paths>`, step 6 always runs the held pair `fusion-commit-lock with commit -- bash -c 'git add <paths> && git commit -F <msg-file>'` with a scratch-file message; the bare-commit form is reserved for a purely pre-staged index (user's own staging before invocation — stated as the residual). `--all` flag text aligned. The rule bullet `rules/workbench-stash-and-lock.md:128` is now true as written, so it needed no edit.
2. **`skills/cleanup/SKILL.md:140`** (issue 0853, Low) — Step 7's enumeration now names the lock and says "message via scratch file + `-F`" instead of the stale HEREDOC term.
3. **`bin/fusion-plugin-cwd`** (issue 0854, Low) — grep tightened to the top-level `name` via a string-aware awk brace-depth filter (depth-1 tokens only, braces inside quoted values inert); header states the residuals. Negative test added: `hooks/lib/__tests__/fusion-paths.test.ts` "does not prefer the work tree when only a NESTED object names fusion" (issue's repro manifest, expects exit 2); `makePluginRepo` gained an optional manifest-content parameter.
4. **`bin/monitor:1159`** (issue 0855, Low) — dropped the dead `"::1"` from `LOOPBACK_BINDS`; comment explains the AF_INET bound.

## Verification

- Skill-text walk: the only `git add` in `skills/commit/SKILL.md` sits inside the locked `bash -c` pair.
- `bin/fusion-plugin-cwd` manual matrix: top-level fusion 0; top-level not-fusion 1; nested fusion (before and after the top-level key) 1; brace-in-string 0; array value 0; pretty-printed multiline both ways; missing manifest 1; real repo root 0.
- Affected test files green (`fusion-paths.test.ts` 69, `monitor-warnings-panel.test.ts` 9, `path-literal-lint.test.ts` 19), then full hooks suite: **27 files, 1560 tests, all green** (`npm test` incl. `tsc`).

## Issues closed

All four appended a `Resolved:` footer and renamed `_o_` → `_c_` (0852, 0853, 0854, 0855).

## Not committed

Per task instruction — the orchestrator commits.

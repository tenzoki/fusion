# `bin/fusion-plugin-cwd` matches a `"name": "fusion"` pair anywhere in the manifest — it accepts repos the TS half rejects, against its own "keep them consistent" contract

**Filed by:** coderev (incremental review of Turn 2, commits `c45fb44..81d4154`, repo-detection gate of `c45fb44`)
**Scope:** `bin/fusion-plugin-cwd:24`, versus `hooks/lib/self-detect.ts:18-34`
**Severity:** Low — the trigger manifest is contrived, but the divergence splits one repo into two contradictory contexts (bin helpers say "fusion's own repo", hooks guard says "consuming project")

---

## The defect

The helper's contract (its own header, lines 10–15) is ONE criterion, TWO implementations: the TS half parses the manifest and checks **top-level** `name === "fusion"`; the grep is claimed to "accept the same manifests at grep-level precision". Measured 2026-08-06, it does not:

```
$ printf '{ "author": { "name": "fusion" }, "name": "other" }\n' > .claude-plugin/plugin.json
$ fusion-plugin-cwd; echo $?
0        # bash: this IS the fusion repo
```

`grep -q '"name"[[:space:]]*:[[:space:]]*"fusion"'` (`bin/fusion-plugin-cwd:24`) matches the pair at **any** depth, so a nested `"name": "fusion"` (an author object, a dependency entry, any sub-object) flips the bash half while `isFusionPluginCwd()` (`hooks/lib/self-detect.ts:29`: `pkg.name === "fusion"`, top-level after `JSON.parse`) correctly says no.

Consequence in such a repo: `bin/fusion-rules` reads the work tree's `./rules` instead of `$FUSION_PLUGIN_ROOT/rules` and emits the guard-internals reference; `bin/fusion-paths` resolves prompts from the work tree (typically exit 2, since a foreign repo has no `agents/<name>.md`) — while the write guard stays **active** because the TS half disagrees. Two halves of "one criterion" giving opposite answers in the same cwd is the failure the pairing comment exists to prevent.

For completeness, the bounds that DO hold (verified same session): repo root → 0; subdirectory of the plugin repo → 1 (cwd-only, matching the TS half — a shared, documented limitation, not a divergence); top-level `"name": "not-fusion"` → 1 (pinned by `hooks/lib/__tests__/fusion-paths.test.ts:607-615`, which tests only the top-level-name variation and therefore misses this nested case).

## Recommended fix

Tighten the grep toward top-level-only precision without adding a runtime dependency: restrict the match to the manifest's first `"name"` key (`grep -m1 '"name"' "$manifest" | grep -q '"fusion"'` is still depth-blind if a nested object precedes the top-level key; better is checking depth by stripping nested braces first, or accepting a small `python3 -c 'import json,sys; …'` with the grep as fallback when `python3` is absent). Whichever precision ships, update the helper's header to state the residual exactly, and add the nested-name case to `fusion-paths.test.ts` alongside the existing `not-fusion` test so the two halves' agreement is pinned where it can actually break.

---

**Resolved:** 2026-08-06 (coder) — `bin/fusion-plugin-cwd` now reduces the manifest to its depth-1 tokens with a string-aware awk brace-depth scanner (braces inside quoted values don't shift depth) before grepping for `"name": "fusion"`, so only the TOP-LEVEL name matches — same answer as `self-detect.ts`, no python/jq dependency. Header restates the criterion as top-level and names the residuals exactly (lenient scan of invalid JSON; duplicate top-level "name" keys match on any occurrence where JSON.parse keeps the last — both need a malformed manifest to differ). Negative case pinned: `fusion-paths.test.ts` gained "does not prefer the work tree when only a NESTED object names fusion" (the issue's exact repro manifest, expects exit 2) next to the existing `not-fusion` test; `makePluginRepo` took an optional manifest-content parameter. Manual matrix verified (nested before/after top-level key, brace-in-string, arrays, pretty-printed multiline, real repo root); full hooks suite green (1560 tests).

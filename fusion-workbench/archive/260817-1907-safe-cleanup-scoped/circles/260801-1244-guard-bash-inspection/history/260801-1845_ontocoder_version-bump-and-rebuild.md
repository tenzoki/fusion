# ontocoder — version bump and `dist` rebuild (plan step 8)

**Date:** 2026-08-01 18:45
**Circle:** `circles/260801-1244-guard-bash-inspection`
**Plan:** `planning/260801-1253_o_plan-guard-bash-inspection.md` — step 8
**Closes:** `issues/260801-1821_c_npm-test-does-not-build-so-the-committed-dist-can-ship-stale.md`
**Status:** Complete

## What changed

| File | Change |
|---|---|
| `.claude-plugin/plugin.json` | `version` 5.7.0 → 5.8.0 |
| `hooks/package.json` | `test` script `vitest run` → `tsc && vitest run` |
| `hooks/dist/**` | Rebuilt from the final source. 4 modified, 4 new. |

No file under `hooks/lib/` or `hooks/guard.ts` was touched. `tsc` compiled clean on the
first attempt, so nothing surfaced that would have needed an unreviewed source fix riding
in on a build commit.

## The rebuild

`npm run build` (the project's own script, `tsc` against `hooks/tsconfig.json`) — exit 0,
no diagnostics.

Modified: `dist/guard.{js,d.ts}`, `dist/lib/git-branch-guard.{js,d.ts}`.
New: `dist/lib/shell-parse.{js,d.ts}`, `dist/lib/bash-mutation-guard.{js,d.ts}`.
`dist/guard.js` 13154 → 20010 bytes; `dist/lib/bash-mutation-guard.js` 40162 bytes and
`dist/lib/shell-parse.js` 28659 bytes are the Circle's two new units arriving in the
shipped artifact for the first time.

None of the four new files is gitignored (`git check-ignore` exit 1 on both `.js` files) —
the `!hooks/dist/` exception at `.gitignore:11` covers them, as the installer needs.

**Self-contained, per the installer invariant.** Every module specifier across
`dist/*.js` and `dist/lib/*.js` is either relative (`./lib/*.js`, `./shell-parse.js`, …)
or a `node:` builtin (`node:child_process`, `node:fs`, `node:path`, `node:url`). No
package import, so the tarball runs with no `npm` and no `node_modules`.

## The stale-`dist` defect

Fixed by making the build part of the test script rather than by adding a staleness check.
The reasoning, and the verification against a deliberately stale `dist`, are recorded in
the issue file itself rather than duplicated here.

Headline numbers: `FUSION_GUARD_ENTRY=dist` on the integration harness was 15 failed /
10 passed against the committed artifact and is 25 / 25 after the rebuild. With the stale
`dist` in place, the *old* test script reported 656/656 green and left the artifact
untouched — the failure mode reproduced exactly; the new script left it rebuilt.

## Verification

- `npm test` (new script) — 16 files, 656 passed.
- `FUSION_GUARD_ENTRY=dist npx vitest run lib/__tests__/guard-bash-integration.test.ts` — 25 passed.
- `claude plugin validate .` — passed, with the one pre-existing warning (plugin-root
  `CLAUDE.md` is not loaded as project context). Unrelated to this Circle.
- `.claude-plugin/plugin.json` and `hooks/package.json` both parse (`require()` round-trip).

## Left for the user

Two of the three version surfaces are outside this repository or outside this step, and
the plan assigns both to the release ritual:

1. `<marketplace>/.claude-plugin/marketplace.json` — bump fusion's `version` to 5.8.0,
   after `git pull --rebase origin main` on that clone.
2. `install.sh:27` still reads `FUSION_REF=tags/v5.7.0`. Refresh to `v5.8.0` when the tag
   is pushed. Not touched here: it is a shell script, and plan step 8 explicitly leaves
   the header refresh to the release ritual.

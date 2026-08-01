`npm test` does not build, so the committed `hooks/dist/` can ship stale

---

Production runs `hooks/dist/guard.js` (wired in `hooks/hooks.json`), not the TypeScript
source. `hooks/package.json`'s test script is `vitest run` — no build — and the whole suite
exercises the source. A committed `dist` that lags the source therefore passes every test
and ships the defect unfixed.

This is not hypothetical. As of this writing `hooks/dist/guard.js` was last built
2026-07-19 and contains none of this Circle's work. Pointing the new integration harness at
it proves the gap in one command:

```
cd hooks && FUSION_GUARD_ENTRY=dist npx vitest run lib/__tests__/guard-bash-integration.test.ts
→ 15 failed | 10 passed (25)
```

The same file against the source is 25/25 green.

---

**Context**

Plan `planning/260801-1253_o_plan-guard-bash-inspection.md` step 6 named
`hooks/package.json` in its Files list and asked for the test script to become
`tsc && vitest run` for exactly this reason (see its `## Risks & Mitigations`, last row).
The step-6 coder did not make that change: the dispatch constraints for that task forbade
touching `hooks/dist/`, and `tsc` writes twenty files into it — while a second coder was
concurrently editing `hooks/lib/git-branch-guard.ts`, so a rebuild would have swept another
agent's in-progress work into the next commit.

The harness was built to make the change cheap whenever it is safe to make. It reads
`FUSION_GUARD_ENTRY`: unset or `tsx` runs `hooks/guard.ts` through `tsx` (the default,
which is what the 25 green cases use), `dist` runs `hooks/dist/guard.js`. Flipping the
suite to the shipped artifact is an env var, not a test edit.

**Resolution belongs to plan step 8** (`ontocoder`: version bump + rebuild `hooks/dist`),
which should:

1. rebuild `hooks/dist` from the final source and commit it;
2. change `hooks/package.json`'s test script to `tsc && vitest run`;
3. confirm `FUSION_GUARD_ENTRY=dist npx vitest run lib/__tests__/guard-bash-integration.test.ts`
   is green, which is the direct proof that what ships is what was tested.

Filed rather than left in a history log because the deviation from the step's Files list is
otherwise invisible to whoever executes step 8.

---

**Resolution** — plan step 8, 2026-08-01.

`hooks/package.json`'s test script is now `tsc && vitest run`. Build-first was chosen over a
staleness *check*: a check only reports the drift, and the only cheap signal it could read is
mtime, which git does not preserve — a fresh clone gets checkout-order mtimes, so the check
would be both false-positive and false-negative prone. Building first removes the state the
check would look for: whoever runs the suite leaves `dist` current in the working tree, and
`git status` then shows the diff.

`hooks/dist/` was rebuilt from the final source (`tsc`, clean, no type errors). New compiled
units `dist/lib/shell-parse.{js,d.ts}` and `dist/lib/bash-mutation-guard.{js,d.ts}`;
`dist/guard.js` 13154 → 20010 bytes. Only relative specifiers and `node:` builtins in the
output, so the installer's no-`node_modules` invariant holds.

Verified against a deliberately stale `dist` (restored to the committed state with
`git checkout HEAD -- hooks/dist` plus removal of the two new untracked units):

- old script (`vitest run` alone) → 656/656 green, `dist/guard.js` untouched at 13154 bytes.
  The exact failure that occurred, reproduced.
- new script (`npm test`) → 656/656 green **and** `dist/guard.js` rebuilt to 20010 bytes.
- `FUSION_GUARD_ENTRY=dist npx vitest run lib/__tests__/guard-bash-integration.test.ts`:
  15 failed / 10 passed before the rebuild, 25/25 after.

Residual gap, stated rather than papered over: this makes staleness impossible for anyone who
runs the suite, but nothing fails for someone who commits without running it. Closing the last
gap needs CI, which this repository does not have.

---
Resolved: `hooks/package.json`'s test script is `tsc && vitest run` (commit `e31c0f3`). The full narrative and the stale-dist reproduction are in the section above; this line adds the marker the conventions ask for, which the closure was missing.

Re-verified independently by the reconciler at HEAD `9ab5a2a`: `npm test` in `hooks/` gives 753 passed / 16 files, and `git status --short hooks/dist` is empty afterwards — so the committed `dist` is current with the source at HEAD, not merely current as of `e31c0f3`. The two later fix commits (`18e2e4f`, `9ab5a2a`) each rebuilt `dist` in the same commit, which is the mechanism working as intended. The stated residual stands unchanged: nothing fails for someone who commits without running the suite, and closing that needs CI this repository does not have.

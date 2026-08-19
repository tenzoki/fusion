# Pin the compiler and assert the committed artifact

**Date:** 2026-08-19
**Agent:** coder
**Status:** Complete
**Circle:** 260819-1645-four-constraints-on-deep-change
**Plan:** `circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md` step 1
**Decision realised:** `shared/decisions/260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md` (option 2)
**HEAD at start:** `b6869aa`

## What was implemented

`hooks/package.json` — `devDependencies.typescript` moved from the range `^5.6.0` to the
exact version `5.9.3`. The other three devDependencies are untouched; none of them reaches
the emit, and widening the pin without a measurement would be pinning by superstition.

`hooks/lib/__tests__/committed-dist.test.ts` (new, 253 lines) — three cases in the plan's
order.

1. **The toolchain is the pinned one.** The literal in `package.json`, the version in
   `package-lock.json` at `packages["node_modules/typescript"]`, and the version in
   `node_modules/typescript/package.json` must all be equal. Its failure says explicitly
   that this is not an artifact defect and names the install as the fix.
2. **HEAD compiles.** `git archive <sha> hooks` is extracted into a
   `mkdtempSync(tmpdir())` directory, `<tmp>/hooks/node_modules` is symlinked at the live
   `hooks/node_modules`, and `node_modules/.bin/tsc --outDir <tmp>/out` runs with `cwd` at
   `<tmp>/hooks`. A non-zero exit fails with the compiler's own output.
3. **The artifact matches.** The file set under `<tmp>/out` equals the set under the
   extracted `<tmp>/hooks/dist`, and every file's bytes are equal. The failure partitions
   into `differing` / `missing` / `extra` and names `npm run build` with `hooks/dist`
   committed alongside the source in the same commit.

The extraction uses `git archive --format=tar -o <tmp>/head-hooks.tar` followed by
`tar -xf` rather than the plan's pipe, only so that no shell is involved. Same command,
same tree, read from the object store.

## Constraints held

- **Nothing written under `hooks/dist` or `hooks/.build-staging`.** Verified after both
  green runs: `git status --porcelain hooks/dist hooks/.build-staging` is empty and
  `hooks/.build-staging` holds nothing. The committed artifact this compares against is the
  extracted copy, not the live tree, so the shared tree is not even read for content.
- **Degrades loudly.** A failing `git rev-parse HEAD`, a failing `git archive`, an
  extraction that yields no `hooks/tsconfig.json`, and an extracted tree carrying no
  `hooks/dist` are each a named failure on cases 2 and 3 rather than a skip.
- **No shared pinned constant written.** No baseline, no baseline map, no `GATE_KINDS`.

## Verification

- Green at this tree: `cd hooks && npx vitest run lib/__tests__/committed-dist.test.ts`,
  3 passed, ~4 s.
- **Red case demonstrated** in a local clone under the session scratchpad, never in the
  live tree: `git checkout 06ab15b~1 -- hooks/dist` committed on top of `b6869aa`, source
  untouched. Exactly one case failed — the artifact comparison — naming
  `differing: ["lib/staging-drift.d.ts", "lib/staging-drift.js"]` with the
  `npm run build` fix text. The toolchain case stayed green, which is the separation the
  first case exists for.
- **Loud degradation demonstrated** by running the same file from a copy with no git
  repository: cases 2 and 3 failed with ``` `git rev-parse HEAD` failed in <dir> (exit
  128) ``` and the git error text. No skip.

## Two findings

1. **`hooks/package-lock.json` is gitignored and untracked** (`.gitignore:7`). The plan's
   step 1 reasons from the lock as if it were committed. The pin still holds, because what
   carries it is the exact literal in the committed `package.json`; the lock is a
   local-consistency leg of case 1. The first draft read the lock with a bare
   `readFileSync` and threw ENOENT in a fresh clone instead of failing with its own
   message — that is fixed: each leg reports a sentence when its file is absent, and the
   fix text names `npm install` for the fresh-clone case where `npm ci` has no lock to
   read.
2. **`npm ci` stays valid with the exact pin against the untouched lock.** Measured before
   writing the pin: a copy of `package.json` + `package-lock.json` with the pin applied
   passes `npm ci --dry-run` (exit 0, 122 packages). The plan's "no reinstall needed"
   claim is verified rather than assumed.

## Measurements

- Hook-test surface: **+253 lines**, one new file with no baseline entry, against the
  plan's estimate of about 200. The `surface-growth-bound` baseline was NOT touched.
- `reference-resolution-lint` `BASELINE`: **unmoved**. Its `surface()` enumerates
  `hooks/lib/*.ts` with an `isFile()` filter, so `lib/__tests__/` is outside the scanned
  set and this file's citations add no resolved references.

## Not done

No commit. The orchestrator commits.

// ---------------------------------------------------------------------------
// The hooks build — a compile that never leaves `hooks/dist/` absent, partial,
// or observable in a state no compile produced.
//
// ## Why this exists rather than `rm -rf dist && tsc`
//
// `hooks/dist/` is shared build output. Every `npm test` run used to delete it
// and take one to two seconds to rebuild it, and three suites read that tree
// while it was gone: `legacy-halt-clearing.test.ts` spawns `dist/clear-halt.js`
// with plain `node` (MODULE_NOT_FOUND, exit 1),
// `reference-resolution-lint.test.ts` resolves prose citations of
// `hooks/dist/…` with `existsSync` (every one reads as dangling), and
// `clear-halt-concurrent-halt.test.ts` copies the tree in `beforeAll` (the file
// errors out of the run instead of failing). Two agents verifying disjoint
// changes in one checkout therefore failed each other's runs, which is what
// made a red suite mean "load" rather than "your change broke something".
//
// Recorded as case 2 of
// `shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`,
// answered by the user as option 2: make the suite safe to run concurrently.
//
// ## What replaces the delete
//
// The compile goes to a private staging directory under `.build-staging/`, one
// per invocation, and the result is moved into `dist/` file by file with
// `rename(2)`, which POSIX guarantees is atomic. Three consequences, and they
// are the whole point:
//
//   - A path under `dist/` is never absent. `existsSync` on a live output is
//     true at every instant, including throughout a concurrent build.
//   - A file under `dist/` is never partial. An opener gets the pre-build inode
//     or the post-build one, each a complete compile output — never the
//     half-written state an in-place `tsc` write passes through.
//   - Unchanged files are not touched at all, so the common case (a second run
//     compiling the same sources) writes nothing.
//
// A file whose content is already identical is skipped, so `dist/` keeps its
// mtimes and a rebuild produces no git noise.
//
// ## Pruning, and why it asks about the source rather than the build
//
// An output whose source was deleted has to go, or the tarball ships a dead
// module and `reference-resolution-lint` keeps resolving citations of it. But a
// prune driven by *this* build's output alone would delete a file another
// concurrent run had just legitimately emitted from a source this run compiled
// before it existed. So a `dist/` entry is removed only when it is absent from
// this build AND its TypeScript source is absent from the tree at prune time.
// Both runs agree on the source tree, so the end state is the same whichever
// finishes last.
//
// That rule is only sound while "a `.ts` exists" and "tsc emits it" are the
// same statement, so nothing under `hooks/` may be a TypeScript file the build
// deliberately skips: the prune cannot tell such a file's stale output from a
// concurrent run's fresh one. It is why the vitest configuration is
// `vitest.config.mjs` rather than `.ts` — `tsconfig.json` `include` would have
// matched the `.ts`, and excluding it there would have left exactly that
// undecidable pair behind.
//
// ## The staging directory is also the test run's private build
//
// `scripts/run-tests.mjs` keeps it for the duration of `vitest run` and points
// `FUSION_TEST_DIST` at it, so the cases that SPAWN or COPY a compiled artifact
// read a tree no other run can touch. The atomic sync above already protects
// the existence check; the private tree is what protects a `cpSync` of the
// whole directory against this build's one destructive act, the prune.
//
// Usage:
//   node scripts/build.mjs          compile and sync; remove the staging dir
//   buildToStaging() / syncIntoDist()  the two halves, for run-tests.mjs
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** `hooks/` — the directory holding tsconfig.json, dist/ and node_modules. */
export const HOOKS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The shipped, git-tracked compile output. Never deleted, only replaced. */
export const DIST_DIR = join(HOOKS_DIR, "dist");

/** Parent of the per-invocation staging directories. Gitignored. */
const STAGING_ROOT = join(HOOKS_DIR, ".build-staging");

/** Every regular file under `dir`, as paths relative to it. */
function walk(dir, base = dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, base, out);
    else if (entry.isFile()) out.push(relative(base, abs));
  }
  return out;
}

/**
 * The TypeScript source a compile output came from: `lib/config.js` and
 * `lib/config.d.ts` both come from `lib/config.ts`. Anything else has no source
 * and is prunable.
 */
function sourceOf(rel) {
  if (rel.endsWith(".d.ts")) return `${rel.slice(0, -".d.ts".length)}.ts`;
  if (rel.endsWith(".js")) return `${rel.slice(0, -".js".length)}.ts`;
  return null;
}

/**
 * Remove staging directories a killed run left behind. Conservative on purpose:
 * a suite can legitimately hold one open for a long time, and deleting a live
 * run's build output would reintroduce the very fault this file removes.
 */
function sweepAbandonedStaging() {
  if (!existsSync(STAGING_ROOT)) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const name of readdirSync(STAGING_ROOT)) {
    const abs = join(STAGING_ROOT, name);
    try {
      if (statSync(abs).mtimeMs < cutoff) rmSync(abs, { recursive: true, force: true });
    } catch {
      /* raced with another sweep; nothing to do */
    }
  }
}

/**
 * Compile into a fresh staging directory and return its absolute path. Throws
 * on a compile error, leaving `dist/` untouched — which is itself an
 * improvement on the old script, where a failed `tsc` ran after the `rm -rf`
 * and left the shipped tree half-built.
 */
export function buildToStaging() {
  sweepAbandonedStaging();
  mkdirSync(STAGING_ROOT, { recursive: true });
  const staging = mkdtempSync(join(STAGING_ROOT, "build-"));
  const tsc = join(HOOKS_DIR, "node_modules", ".bin", "tsc");
  if (!existsSync(tsc)) {
    rmSync(staging, { recursive: true, force: true });
    throw new Error(`${tsc} not found — run \`npm install\` in hooks/.`);
  }
  const run = spawnSync(tsc, ["--outDir", staging], {
    cwd: HOOKS_DIR,
    stdio: "inherit",
  });
  if (run.status !== 0) {
    rmSync(staging, { recursive: true, force: true });
    throw new Error(`tsc exited ${run.status ?? `on signal ${run.signal}`}`);
  }
  return staging;
}

/**
 * Move the staging build into `dist/`, atomically per file, and prune outputs
 * whose source is gone. The staging tree is left complete: each replacement is
 * copied to a scratch path beside it and the COPY is renamed into place, so a
 * caller holding the staging directory as its private build still has every
 * file after the sync.
 */
export function syncIntoDist(staging) {
  const fresh = walk(staging);
  const freshSet = new Set(fresh);
  mkdirSync(DIST_DIR, { recursive: true });

  let swap = 0;
  for (const rel of fresh) {
    const from = join(staging, rel);
    const to = join(DIST_DIR, rel);
    if (existsSync(to) && readFileSync(to).equals(readFileSync(from))) continue;
    mkdirSync(dirname(to), { recursive: true });
    // Same filesystem as `dist/`, so the rename below is a true atomic
    // replacement rather than a copy the reader can catch half-done.
    const scratch = join(STAGING_ROOT, `.swap-${process.pid}-${swap++}`);
    copyFileSync(from, scratch);
    renameSync(scratch, to);
  }

  for (const rel of walk(DIST_DIR)) {
    if (freshSet.has(rel)) continue;
    const src = sourceOf(rel);
    if (src !== null && existsSync(join(HOOKS_DIR, src))) continue;
    rmSync(join(DIST_DIR, rel), { force: true });
  }
}

function main() {
  const staging = buildToStaging();
  try {
    syncIntoDist(staging);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}

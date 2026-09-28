// ---------------------------------------------------------------------------
// The codec build: `src/cli/main.ts` and everything it imports, the seven
// schemas and the two contract tables included, into the one shipped file
// `dist/fusion-record.js`.
//
// ## What the bundle is
//
// esbuild, `--bundle --platform=node --format=esm --target=node20`, an exact
// pinned version (`package.json` `devDependencies.esbuild`; the gate in
// `src/__tests__/committed-bundle.test.ts` asserts the installed one is the
// pin before it compares anything). JSON imports are inlined by esbuild's
// json loader, so the file carries its contract; `#!/usr/bin/env node` as the
// banner; no sourcemap and no minification, so the diff of a rebuild is one a
// reviewer can read. Both hosts run this file with plain `node`, the Claude
// side through `bin/fusion-record`, Prior by spawning it, and neither needs
// `node_modules` (FJ01 plan, step 5; the codec-port decision, option 1).
//
// ## Why a staging path and a rename, as `hooks/scripts/build.mjs` does
//
// `dist/fusion-record.js` is shared output: a test run spawns it while another
// run may be rebuilding it. The bundle is written to a private staging
// directory and moved into `dist/` with `rename(2)`, which is atomic, so a
// reader gets the old file or the new one and never a partial write. When the
// fresh bundle is byte-identical to the committed one nothing is renamed and
// `dist/` keeps its mtime: a second run of the build writes nothing.
//
// ## `preserveSymlinks`
//
// The gate bundles a `git archive` extract whose `node_modules` is a symlink
// to the live one. esbuild names each module in a comment by its path
// relative to `absWorkingDir`; following the symlink would print the live
// tree's path there and the two bundles would differ on a comment. With
// symlinks preserved both print `node_modules/ajv/...`.
//
// Usage:
//   node scripts/build.mjs        bundle and sync into dist/; prints what it did
//   bundleTo(outFile, {codecDir}) the bundle alone, for the gate
// ---------------------------------------------------------------------------

import { build } from "esbuild";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** `codec/`: the directory holding package.json, src/, schemas/, contract/ and dist/. */
export const CODEC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const ENTRY = "src/cli/main.ts";
export const BUNDLE = "dist/fusion-record.js";
const STAGING_ROOT = join(CODEC_DIR, ".build-staging");

/**
 * Bundles `codecDir/src/cli/main.ts` into `outFile`. Every option that
 * shapes the bytes is fixed here and nowhere else, so the gate and the build
 * cannot disagree.
 */
export async function bundleTo(outFile, { codecDir = CODEC_DIR } = {}) {
  // esbuild resolves `absWorkingDir` to its real path but names modules by the
  // path they were reached through, so a tree under a symlinked root (macOS's
  // /var -> /private/var, where mkdtemp lands) would print every module as
  // `../../private/var/...`. Realpath the root once; the node_modules symlink
  // INSIDE it is left alone by `preserveSymlinks` below.
  const root = realpathSync(codecDir);
  mkdirSync(dirname(outFile), { recursive: true });
  await build({
    absWorkingDir: root,
    entryPoints: [join(root, ENTRY)],
    outfile: outFile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    banner: { js: "#!/usr/bin/env node" },
    sourcemap: false,
    minify: false,
    preserveSymlinks: true,
    logLevel: "warning",
  });
}

/** Bundle into staging, then into `dist/` by rename when the bytes changed. Returns whether they did. */
export async function main() {
  mkdirSync(STAGING_ROOT, { recursive: true });
  const staging = mkdtempSync(join(STAGING_ROOT, "build-"));
  try {
    const fresh = join(staging, "fusion-record.js");
    await bundleTo(fresh);
    const target = join(CODEC_DIR, BUNDLE);
    if (existsSync(target) && readFileSync(target).equals(readFileSync(fresh))) return false;
    mkdirSync(dirname(target), { recursive: true });
    renameSync(fresh, target);
    return true;
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (changed) => {
      console.log(`${BUNDLE}: ${changed ? "written" : "unchanged"}`);
    },
    (e) => {
      console.error(`build failed: ${e instanceof Error ? e.message : String(e)}`);
      process.exitCode = 1;
    },
  );
}

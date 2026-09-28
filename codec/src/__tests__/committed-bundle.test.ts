// ---------------------------------------------------------------------------
// Is the committed `codec/dist/fusion-record.js` the bundle of the committed
// source?
//
// The bundle is what ships: `bin/fusion-record` execs it, Prior spawns it and
// takes a digest over it, and `install.sh` copies it from a git tree, so every
// commit has to carry the bundle its source produces. `npm test` builds into
// `dist/` before it runs, so a green suite says the WORKING TREE's bundle is
// fresh and nothing about the tree that is committed. This gate is the
// answer, in the shape of `hooks/lib/__tests__/committed-dist.test.ts` and for
// the reason recorded there
// (`260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`).
//
// ## The order
//
// A bundle is a function of source, configuration and bundler version. The
// first case asserts the toolchain IS the pinned one (`package.json`
// `devDependencies.esbuild`, an exact version; here the lock is committed
// too, so it is a second pin rather than a local-consistency leg) and says,
// on failure, that a mismatch is not an artefact defect. Then `git archive
// HEAD codec` into a temp dir, the EXTRACTED tree's own `scripts/build.mjs`
// bundling the extracted source, and a byte comparison with the extracted
// `dist/fusion-record.js`. Nothing under the live `codec/` is written.
//
// ## What red means
//
// Before the commit that carries FJ01's source and bundle, HEAD has neither
// `codec/scripts/build.mjs` nor `codec/dist/`, and the extraction case says
// so with the remedy: run `npm run build` in `codec/` and commit the result.
// That is the expected state of this gate between the build and its commit,
// and it is red on purpose rather than skipped: a gate that skips when the
// artefact is absent is silent in the case it exists for.
//
// ## The gate's own sensitivity
//
// The last case proves the comparison can fail: it bundles a temp copy of
// the live source twice, once as it is and once with a line appended to the
// entry point, and asserts the bytes differ. Without it a comparison that
// passed because both sides were empty would read as green.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const CODEC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPO_ROOT = resolve(CODEC_DIR, "..");
const BUNDLE_REL = "dist/fusion-record.js";
const BUILD_REL = "scripts/build.mjs";
const FIX = "\nFIX: run `npm run build` in codec/ and commit the result (codec/dist/fusion-record.js) in the SAME commit as the source it is built from.";

interface Toolchain {
  declared: string;
  locked: string;
  installed: string;
}

function readToolchain(): Toolchain {
  const lockPath = join(CODEC_DIR, "package-lock.json");
  const installedPath = join(CODEC_DIR, "node_modules", "esbuild", "package.json");
  return {
    declared: JSON.parse(readFileSync(join(CODEC_DIR, "package.json"), "utf8")).devDependencies?.esbuild ?? "no devDependencies.esbuild in codec/package.json",
    locked: existsSync(lockPath)
      ? (JSON.parse(readFileSync(lockPath, "utf8")).packages?.["node_modules/esbuild"]?.version ?? "package-lock.json records no node_modules/esbuild")
      : "no codec/package-lock.json",
    installed: existsSync(installedPath) ? JSON.parse(readFileSync(installedPath, "utf8")).version : "esbuild is not installed in codec/node_modules",
  };
}

function toolchainDisagreement(t: Toolchain): string | null {
  if (t.locked === t.declared && t.installed === t.declared) return null;
  return `the toolchain is not the pinned one: codec/package.json declares esbuild ${t.declared}, codec/package-lock.json says ${t.locked}, and codec/node_modules carries ${t.installed}.`;
}

interface BuildModule {
  bundleTo(outFile: string, options?: { codecDir?: string }): Promise<void>;
}

interface Prepared {
  toolchain: Toolchain;
  toolchainFailure: string | null;
  /** Non-null when the tree could not be obtained, or carries no build script or no bundle at HEAD. */
  gitFailure: string | null;
  /** Non-null when the extracted source does not bundle. */
  bundleFailure: string | null;
  sha: string;
  /** The fresh bundle of the extracted source. */
  freshFile: string;
  /** The committed bundle, as extracted, never the live `codec/dist`. */
  committedFile: string;
}

let tmpRoot: string | null = null;
const prepared: Prepared = {
  toolchain: { declared: "", locked: "", installed: "" },
  toolchainFailure: null,
  gitFailure: null,
  bundleFailure: null,
  sha: "",
  freshFile: "",
  committedFile: "",
};

const output = (r: ReturnType<typeof spawnSync>): string => `${String(r.stderr ?? "").trim() || r.error?.message || "no output"}`;

beforeAll(async () => {
  prepared.toolchain = readToolchain();
  prepared.toolchainFailure = toolchainDisagreement(prepared.toolchain);

  const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPO_ROOT, encoding: "utf8" });
  if (head.status !== 0) {
    prepared.gitFailure = `\`git rev-parse HEAD\` failed in ${REPO_ROOT} (exit ${head.status ?? "signal"}): ${output(head)}`;
    return;
  }
  prepared.sha = head.stdout.trim();

  tmpRoot = mkdtempSync(join(tmpdir(), "fusion-committed-bundle-"));
  const extracted = join(tmpRoot, "codec");
  prepared.freshFile = join(tmpRoot, "fresh", "fusion-record.js");
  prepared.committedFile = join(extracted, BUNDLE_REL);

  const tarPath = join(tmpRoot, "head-codec.tar");
  const archive = spawnSync("git", ["archive", "--format=tar", "-o", tarPath, prepared.sha, "codec"], { cwd: REPO_ROOT, encoding: "utf8" });
  if (archive.status !== 0) {
    prepared.gitFailure = `\`git archive ${prepared.sha} codec\` failed (exit ${archive.status ?? "signal"}): ${output(archive)}`;
    return;
  }
  const untar = spawnSync("tar", ["-xf", tarPath, "-C", tmpRoot], { encoding: "utf8" });
  if (untar.status !== 0) {
    prepared.gitFailure = `extracting the \`git archive\` of ${prepared.sha} failed (exit ${untar.status ?? "signal"}): ${output(untar)}`;
    return;
  }
  if (!existsSync(join(extracted, "package.json"))) {
    prepared.gitFailure = `\`git archive ${prepared.sha} codec\` produced no tree: ${join(extracted, "package.json")} is absent after extraction. Nothing was compared.`;
    return;
  }
  if (!existsSync(join(extracted, BUILD_REL))) {
    prepared.gitFailure = `the committed tree at ${prepared.sha.slice(0, 8)} carries no codec/${BUILD_REL}: the codec build is not committed yet, so there is no committed bundle to compare.${FIX}`;
    return;
  }
  if (!existsSync(prepared.committedFile)) {
    prepared.gitFailure = `the committed tree at ${prepared.sha.slice(0, 8)} carries no codec/${BUNDLE_REL}: the shipped bundle is not committed.${FIX}`;
    return;
  }

  // The extracted tree has no node_modules of its own; the live one is the
  // pinned toolchain the first case asserts. A symlink, and the build keeps
  // symlinks unresolved so module comments name the same relative paths.
  symlinkSync(join(CODEC_DIR, "node_modules"), join(extracted, "node_modules"));
  mkdirSync(dirname(prepared.freshFile), { recursive: true });
  try {
    const build = (await import(pathToFileURL(join(extracted, BUILD_REL)).href)) as BuildModule;
    await build.bundleTo(prepared.freshFile, { codecDir: extracted });
  } catch (e) {
    prepared.bundleFailure = e instanceof Error ? (e.stack ?? e.message) : String(e);
  }
}, 300_000);

afterAll(() => {
  if (tmpRoot !== null) rmSync(tmpRoot, { recursive: true, force: true });
});

function notEvaluable(subject: string): string {
  return (
    `${prepared.toolchainFailure ?? ""}\n${subject} is not evaluable until the toolchain is the pinned one, because esbuild output is a function of the bundler version. ` +
    "This is NOT an artefact defect and NOT a source defect; nothing was concluded about codec/dist.\n" +
    "FIX: `npm ci` in codec/, then run the suite again. Do NOT run `npm run build` on this failure: that commits a bundle built by the unpinned bundler."
  );
}

describe("the committed codec/dist/fusion-record.js is the bundle of the committed source", () => {
  it("bundles with the pinned toolchain: declared, locked and installed esbuild agree", () => {
    const { declared, locked, installed } = prepared.toolchain;
    expect(
      { declared, locked, installed },
      "the toolchain is not the pinned one.\nThis is NOT an artefact defect: it says nothing about whether codec/dist matches its source, and the comparison below is " +
        "meaningless until it is resolved, because esbuild output is a function of the bundler version.\nFIX: run `npm ci` in codec/. If the pin itself is being moved, " +
        "change package.json devDependencies.esbuild (exact), reinstall, rebuild, and commit codec/dist in the same commit.",
    ).toEqual({ declared, locked: declared, installed: declared });
    expect(declared).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("bundles at HEAD: the committed source and build script produce a bundle without touching the shared tree", () => {
    expect(prepared.toolchainFailure, notEvaluable("whether the committed source bundles")).toBeNull();
    expect(prepared.gitFailure, prepared.gitFailure ?? "").toBeNull();
    expect(prepared.bundleFailure, `the committed source at HEAD does not bundle:\n${prepared.bundleFailure ?? ""}`).toBeNull();
    expect(existsSync(prepared.freshFile)).toBe(true);
  });

  it("matches, byte for byte, the committed codec/dist/fusion-record.js", () => {
    expect(prepared.toolchainFailure, notEvaluable("the comparison against the committed codec/dist")).toBeNull();
    expect(prepared.gitFailure, prepared.gitFailure ?? "").toBeNull();
    expect(prepared.bundleFailure, "the committed source did not bundle; see the case above").toBeNull();
    const fresh = readFileSync(prepared.freshFile);
    const committed = readFileSync(prepared.committedFile);
    expect(fresh.length, "the bundle is empty; nothing was compared").toBeGreaterThan(0);
    expect(fresh.subarray(0, 19).toString("utf-8")).toBe("#!/usr/bin/env node");
    expect(
      { sameBytes: fresh.equals(committed), freshBytes: fresh.length, committedBytes: committed.length },
      `codec/${BUNDLE_REL} at ${prepared.sha.slice(0, 8)} is not the bundle of the source at ${prepared.sha.slice(0, 8)}.${FIX}`,
    ).toEqual({ sameBytes: true, freshBytes: fresh.length, committedBytes: committed.length });
  });
});

describe("the gate can tell a changed source from an unchanged one", () => {
  it("a line appended to the entry point changes the bundle's bytes (on a temp copy of the live tree)", async () => {
    expect(prepared.toolchainFailure, notEvaluable("the sensitivity check")).toBeNull();
    const dir = mkdtempSync(join(tmpdir(), "fusion-bundle-sensitivity-"));
    try {
      const copy = join(dir, "codec");
      mkdirSync(copy);
      for (const entry of ["src", "schemas", "contract", "scripts", "package.json", "tsconfig.json"]) cpSync(join(CODEC_DIR, entry), join(copy, entry), { recursive: true });
      symlinkSync(join(CODEC_DIR, "node_modules"), join(copy, "node_modules"));
      const build = (await import(pathToFileURL(join(copy, BUILD_REL)).href)) as BuildModule;
      const a = join(dir, "a.js");
      const b = join(dir, "b.js");
      await build.bundleTo(a, { codecDir: copy });
      appendFileSync(join(copy, "src/cli/main.ts"), '\nconsole.log("sensitivity probe");\n');
      await build.bundleTo(b, { codecDir: copy });
      expect(readFileSync(a).equals(readFileSync(b)), "the bundle did not change when the source did").toBe(false);
      // And the copy's unchanged build is the live tree's build: the live
      // `dist/` is what `npm test` just wrote, so the two agree whenever the
      // working tree is what was built.
      const live = join(CODEC_DIR, BUNDLE_REL);
      if (existsSync(live)) expect(readFileSync(a).equals(readFileSync(live)), "the working tree's dist/ is stale: run `npm run build` in codec/").toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 120_000);
});

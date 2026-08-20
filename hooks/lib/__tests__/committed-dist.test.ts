import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Is the committed `hooks/dist` the compilation of the committed source?
//
// `hooks/dist/*.js` is the artifact `install.sh` ships, and `install.sh`
// defaults to `heads/main`, so EVERY commit is installable. Between `f45f76a`
// and `71e97f4` the committed `dist` was the compilation of an older source,
// and every install in that window shipped a fix that was closed in the
// repository and absent from the tarball. Two later passes found it, both by
// accident of what they happened to grep.
//
// `npm test` cannot answer the question and by design never will: the build
// compiles into a private staging tree so that concurrent runs in one checkout
// do not share build output (`scripts/build.mjs`, `scripts/run-tests.mjs`), so
// a green suite says nothing about the tree that is committed. This gate is the
// answer, per
// `shared/decisions/260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`
// (option 2, answered by the user on 2026-08-16).
//
// ## What it does, and the order it does it in
//
// A compile is a function of source, configuration and compiler version. Source
// and artifact are both in the git object store and readable without touching
// the working tree; the configuration is committed. The compiler version is the
// only free variable, and the answering decision names it as the thing that
// would redden the suite for no defect. So the first case asserts the toolchain
// IS the pinned one and says, on failure, that this is not an artifact defect.
//
// The three cases are a CHAIN, and the order below is the order of the
// preconditions, not of the work: the extraction and the compile both happen in
// `beforeAll`, before any case runs. What the later cases do is assert, in
// order, the conditions under which their own subject is evaluable at all —
// toolchain, then extraction, then compile. Each precondition is a `beforeAll`
// FIELD, and a case that meets one names THAT and nothing else. The toolchain
// field was the one missing: without it a wrong compiler reddened the artifact
// case, whose remedy is `npm run build`, and following it committed a `dist`
// built by the unpinned compiler — a worse tree than the one it repaired
// (`circles/260819-1645-four-constraints-on-deep-change/issues/260820-0805_*_the-artifact-case-of-the-dist-gate-carries-no-toolchain-guard-so-a-mismatch-reddens-it-with-the-wrong-remedy.md`).
//
// What carries the pin is `package.json` `devDependencies.typescript`, which is
// an EXACT version and is committed. `package-lock.json` is gitignored here, so
// it is a local-consistency leg of the first case rather than the pin itself —
// present, it must agree; absent, the case says so and names the install.
//
// ## The two things this must not write
//
// `hooks/dist/` and `hooks/.build-staging/` are both shared between concurrent
// runs, and not reading or writing the shared tree during a run is the
// constraint the answering decision attached. So the extracted source, the
// compile output and the committed artifact this compares against all live
// under one `mkdtempSync(tmpdir())` directory. The one thing taken from the
// live checkout is `hooks/node_modules`, by symlink, read-only in practice and
// not a build output.
//
// ## Loud, never silent
//
// A gate that skips when git is unavailable is silent in exactly the case it
// exists for. `git rev-parse HEAD` failing, or `git archive` yielding no tree,
// is a FAILURE naming that as the reason — the same discipline as the
// "degrades loudly, not silently" case in `reference-resolution-lint.test.ts`.
// ---------------------------------------------------------------------------

/** `hooks/` — the directory holding package.json, tsconfig.json and dist/. */
const HOOKS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPO_ROOT = resolve(HOOKS_DIR, "..");

/** Every regular file under `dir`, as paths relative to it, sorted. */
function walk(dir: string, base = dir, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, base, out);
    else if (entry.isFile()) out.push(relative(base, abs));
  }
  return out.sort();
}

/** The three versions of `typescript` that have to agree, as sentences. */
interface Toolchain {
  declared: string;
  locked: string;
  installed: string;
}

/**
 * Each leg reports a SENTENCE when its file is absent rather than throwing: an
 * ENOENT stack out of a readFileSync says the same thing far worse, and
 * `hooks/package-lock.json` is gitignored, so a fresh clone legitimately has
 * none until somebody installs.
 */
function readToolchain(): Toolchain {
  const lockPath = join(HOOKS_DIR, "package-lock.json");
  const installedPath = join(HOOKS_DIR, "node_modules", "typescript", "package.json");
  return {
    declared:
      JSON.parse(readFileSync(join(HOOKS_DIR, "package.json"), "utf8")).devDependencies
        ?.typescript ?? "no devDependencies.typescript in hooks/package.json",
    locked: existsSync(lockPath)
      ? (JSON.parse(readFileSync(lockPath, "utf8")).packages?.["node_modules/typescript"]?.version ??
        "package-lock.json records no node_modules/typescript")
      : "no hooks/package-lock.json (it is gitignored — install in hooks/ to produce one)",
    installed: existsSync(installedPath)
      ? JSON.parse(readFileSync(installedPath, "utf8")).version
      : "typescript is not installed in hooks/node_modules",
  };
}

/** The disagreement as one sentence, or null when the three agree. */
function toolchainDisagreement(t: Toolchain): string | null {
  if (t.locked === t.declared && t.installed === t.declared) return null;
  return (
    `the toolchain is not the pinned one: hooks/package.json declares ${t.declared}, ` +
    `hooks/package-lock.json says ${t.locked}, and hooks/node_modules carries ${t.installed}.`
  );
}

interface Prepared {
  /** The three `typescript` versions, read once and asserted by the first case. */
  toolchain: Toolchain;
  /**
   * Non-null when they disagree. It is a precondition of BOTH later cases, not
   * only of the first one's assertion: `tsc` output is a function of the
   * compiler version, so under a different compiler neither "the source
   * compiles" nor "the artifact matches" says anything about the repository.
   */
  toolchainFailure: string | null;
  /** Non-null when the tree could not be obtained at all. Loud, not skipped. */
  gitFailure: string | null;
  /** Non-null when the extracted source does not compile; carries tsc's output. */
  compileFailure: string | null;
  /** Fresh compile of the extracted source. */
  outDir: string;
  /** The committed artifact, as extracted — never the live `hooks/dist`. */
  distDir: string;
}

let tmpRoot: string | null = null;
const prepared: Prepared = {
  toolchain: { declared: "", locked: "", installed: "" },
  toolchainFailure: null,
  gitFailure: null,
  compileFailure: null,
  outDir: "",
  distDir: "",
};

beforeAll(() => {
  // First, and before any early return: the toolchain is the precondition of
  // everything below it, and a `gitFailure` must not leave it unread.
  prepared.toolchain = readToolchain();
  prepared.toolchainFailure = toolchainDisagreement(prepared.toolchain);

  const head = spawnSync("git", ["rev-parse", "HEAD"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  if (head.status !== 0) {
    prepared.gitFailure =
      `\`git rev-parse HEAD\` failed in ${REPO_ROOT} (exit ${head.status ?? "signal"}): ` +
      `${(head.stderr ?? "").trim() || (head.error?.message ?? "no output")}`;
    return;
  }
  const sha = head.stdout.trim();

  tmpRoot = mkdtempSync(join(tmpdir(), "fusion-committed-dist-"));
  prepared.outDir = join(tmpRoot, "out");
  prepared.distDir = join(tmpRoot, "hooks", "dist");

  // `git archive HEAD hooks` into a tar, then extract it. A tar file rather
  // than a pipe into `tar -x` only so that no shell is involved; the tree is
  // the same tree, read from the object store and not from the working copy.
  const tarPath = join(tmpRoot, "head-hooks.tar");
  const archive = spawnSync("git", ["archive", "--format=tar", "-o", tarPath, sha, "hooks"], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  if (archive.status !== 0) {
    prepared.gitFailure =
      `\`git archive ${sha} hooks\` failed (exit ${archive.status ?? "signal"}): ` +
      `${(archive.stderr ?? "").trim() || (archive.error?.message ?? "no output")}`;
    return;
  }
  const untar = spawnSync("tar", ["-xf", tarPath, "-C", tmpRoot], { encoding: "utf8" });
  if (untar.status !== 0) {
    prepared.gitFailure =
      `extracting the \`git archive\` of ${sha} failed (exit ${untar.status ?? "signal"}): ` +
      `${(untar.stderr ?? "").trim() || (untar.error?.message ?? "no output")}`;
    return;
  }
  if (!existsSync(join(tmpRoot, "hooks", "tsconfig.json"))) {
    prepared.gitFailure =
      `\`git archive ${sha} hooks\` produced no tree — ${join(tmpRoot, "hooks", "tsconfig.json")} ` +
      `is absent after extraction. Nothing was compared.`;
    return;
  }
  if (!existsSync(prepared.distDir)) {
    prepared.gitFailure =
      `the extracted tree carries no \`hooks/dist\` at ${sha}. The shipped artifact is not ` +
      `committed at all, which this gate cannot distinguish from a broken extraction.`;
    return;
  }

  // The extracted tree has no node_modules of its own; the live one is the
  // pinned toolchain the first case just asserted.
  symlinkSync(join(HOOKS_DIR, "node_modules"), join(tmpRoot, "hooks", "node_modules"));

  mkdirSync(prepared.outDir, { recursive: true });
  const tsc = join(HOOKS_DIR, "node_modules", ".bin", "tsc");
  if (!existsSync(tsc)) {
    prepared.compileFailure = `${tsc} not found — run \`npm ci\` in hooks/.`;
    return;
  }
  const build = spawnSync(tsc, ["--outDir", prepared.outDir], {
    cwd: join(tmpRoot, "hooks"),
    encoding: "utf8",
  });
  if (build.status !== 0) {
    prepared.compileFailure =
      `tsc exited ${build.status ?? `on signal ${build.signal}`}:\n` +
      `${[build.stdout, build.stderr].join("").trim() || "no output"}`;
  }
}, 300_000);

afterAll(() => {
  if (tmpRoot !== null) rmSync(tmpRoot, { recursive: true, force: true });
});

/**
 * What a later case says when it meets a toolchain mismatch. It names the
 * toolchain and nothing else: the two failures stay separately named, so a
 * reader of a red suite is never told that a compiler bump is an artifact
 * defect. It prescribes no rebuild for the same reason — acting on the artifact
 * case's `npm run build` under an unpinned compiler commits a `dist` built by
 * that compiler.
 */
function notEvaluable(subject: string): string {
  return (
    `${prepared.toolchainFailure ?? ""}\n` +
    `${subject} is not evaluable until the toolchain is the pinned one, because tsc output is ` +
    `a function of the compiler version. This is NOT an artifact defect and NOT a source defect; ` +
    `nothing was concluded about hooks/dist.\n` +
    "FIX: resolve the toolchain case above (`npm ci` in hooks/), then run the suite again. Do " +
    "NOT run `npm run build` on this failure — that commits a hooks/dist built by the unpinned " +
    "compiler, which is worse than the state it was meant to repair."
  );
}

describe("the committed hooks/dist is the compilation of the committed source", () => {
  it("compiles with the pinned toolchain — declared, locked and installed agree", () => {
    const { declared, locked, installed } = prepared.toolchain;
    expect(
      { declared, locked, installed },
      "the toolchain is not the pinned one.\n" +
        "This is NOT an artifact defect: it says nothing about whether hooks/dist matches its " +
        "source, and the comparison below is meaningless until it is resolved, because tsc " +
        "output is a function of the compiler version.\n" +
        "FIX: run `npm ci` in hooks/ — or `npm install`, when hooks/package-lock.json is absent, " +
        "which is the fresh-clone case because that file is gitignored. If the pin itself is " +
        "being moved, change package.json devDependencies.typescript, reinstall, rebuild, and " +
        "commit hooks/dist in the same commit.",
    ).toEqual({ declared, locked: declared, installed: declared });
  });

  it("compiles at HEAD — the committed source builds without touching the shared tree", () => {
    expect(
      prepared.toolchainFailure,
      notEvaluable("whether the committed source compiles"),
    ).toBeNull();
    expect(prepared.gitFailure, prepared.gitFailure ?? "").toBeNull();
    expect(
      prepared.compileFailure,
      `the committed source at HEAD does not compile:\n${prepared.compileFailure ?? ""}`,
    ).toBeNull();
  });

  it("matches, file for file and byte for byte, the committed hooks/dist", () => {
    expect(
      prepared.toolchainFailure,
      notEvaluable("the comparison against the committed hooks/dist"),
    ).toBeNull();
    expect(prepared.gitFailure, prepared.gitFailure ?? "").toBeNull();
    expect(prepared.compileFailure, "the committed source did not compile; see the case above")
      .toBeNull();

    const fresh = walk(prepared.outDir);
    const committed = walk(prepared.distDir);
    const freshSet = new Set(fresh);
    const committedSet = new Set(committed);

    const missing = fresh.filter((rel) => !committedSet.has(rel));
    const extra = committed.filter((rel) => !freshSet.has(rel));
    const differing = fresh
      .filter((rel) => committedSet.has(rel))
      .filter(
        (rel) =>
          !readFileSync(join(prepared.outDir, rel)).equals(
            readFileSync(join(prepared.distDir, rel)),
          ),
      );

    const FIX =
      "\nFIX: run `npm run build` in hooks/ and commit hooks/dist alongside the source, in the " +
      "SAME commit. install.sh defaults to heads/main, so every commit is installable and a " +
      "dist that lags its source ships a fix that is closed in the repository and absent from " +
      "the tarball.";
    expect(
      { differing, missing, extra },
      "the committed hooks/dist is not the compilation of the committed source.\n" +
        "differing: the file is committed but its bytes are not what this source compiles to.\n" +
        "missing: the source compiles it and no committed artifact carries it.\n" +
        "extra: hooks/dist carries it and this source does not produce it." +
        FIX,
    ).toEqual({ differing: [], missing: [], extra: [] });
    expect(fresh.length, "the compile emitted nothing — nothing was compared").toBeGreaterThan(0);
  });
});

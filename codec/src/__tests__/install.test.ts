// ---------------------------------------------------------------------------
// "Keine Installation aus dem Source-Checkout nötig": `install.sh` installs a
// tarball-shaped copy of the tree into a scratch home, and the installed
// `bin/fusion-record` answers a `show` on the scratch workbench with `node`
// the only runtime (FJ01 step 7; the spec's row FJ01).
//
// ## What is installed
//
// `git archive HEAD` extracted into a temp directory under the prefix the
// GitHub tarball uses (`fusion-<ref>/`), then the WORKING TREE's `install.sh`,
// `bin/fusion-record` and `.gitignore` copied over it. Until the commit that
// carries FJ01 steps 6 and 7 this is what proves the working tree: HEAD has
// no `bin/fusion-record` and no `codec` in the installer's copy list, so the
// archive alone would prove the previous release. After that commit the copy
// changes nothing and the archive alone proves the tree. The copy is not
// widened: an uncommitted change to any other file is not what this test is
// about.
//
// ## No network, no host tools
//
// `install.sh` always downloads over HTTPS from GitHub and has no override for
// the URL. It is run here with a PATH that holds exactly one directory: links
// to `node`, `bash`, `tar` and the coreutils the installer and the wrapper
// call, plus two stubs, `claude` (exit 0: the installer dies without it and
// checks only presence) and `curl` (copies the local tarball built from the
// extract to the `-o` target and never opens a socket). What the installer
// then sees is the tarball it would have downloaded, and what the wrapper
// then runs is `node` alone: no `npm`, no `node_modules`, no `git`.
//
// ## Loud, never silent
//
// `git archive` failing, a tool absent from the host, or the installer
// exiting non-zero each FAIL naming the reason. Nothing here skips: the
// precondition the plan named (`claude` on PATH) is met by the stub.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const CODEC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const REPO_ROOT = resolve(CODEC_DIR, "..");
const FIXTURE = join(CODEC_DIR, "fixtures", "workbench");
const OPEN = "work-packages/260928-1200-parser-fix/package.json";

/** The working-tree files copied over the HEAD extract; see the header. */
const WORKING_TREE_FILES = ["install.sh", "bin/fusion-record", ".gitignore"];
/** What the installer and the wrapper call, besides `node`. */
const HOST_TOOLS = ["bash", "tar", "cp", "rm", "mkdir", "cat", "chmod", "find", "head", "sed", "mktemp", "dirname"];
/** GNU tar spawns `gzip` for `-z`; bsdtar does not. Linked when present, not required. */
const OPTIONAL_TOOLS = ["gzip"];

interface Install {
  tmp: string;
  /** The extracted tree, `<tmp>/src/fusion-head`. */
  src: string;
  tarball: string;
  /** The one directory on PATH. */
  path: string;
  home: string;
  bin: string;
  /** The installer's run. */
  status: number | null;
  stdout: string;
  stderr: string;
  failure: string | null;
}

let install: Install;

const output = (r: ReturnType<typeof spawnSync>): string => `${String(r.stderr ?? "").trim() || String(r.stdout ?? "").trim() || r.error?.message || "no output"}`;

function findOnHostPath(tool: string): string | null {
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    if (dir.length === 0) continue;
    const abs = join(dir, tool);
    if (existsSync(abs)) return abs;
  }
  return null;
}

function stub(dir: string, name: string, body: string): void {
  const file = join(dir, name);
  writeFileSync(file, `#!/usr/bin/env bash\n${body}\n`);
  chmodSync(file, 0o755);
}

function run(cmd: string, args: string[], opts: { cwd?: string; input?: string; env?: NodeJS.ProcessEnv } = {}) {
  return spawnSync(cmd, args, { encoding: "utf-8", ...opts });
}

beforeAll(() => {
  const tmp = mkdtempSync(join(tmpdir(), "fusion-install-"));
  const src = join(tmp, "src", "fusion-head");
  install = { tmp, src, tarball: join(tmp, "fusion-head.tar.gz"), path: join(tmp, "path"), home: join(tmp, "home"), bin: join(tmp, "bin"), status: null, stdout: "", stderr: "", failure: null };
  const fail = (why: string): void => {
    install.failure = why;
  };

  // 1. The tree at HEAD, then the working-tree files over it.
  mkdirSync(src, { recursive: true });
  const headTar = join(tmp, "head.tar");
  const archive = run("git", ["archive", "--format=tar", "-o", headTar, "HEAD"], { cwd: REPO_ROOT });
  if (archive.status !== 0) return fail(`\`git archive HEAD\` failed in ${REPO_ROOT}: ${output(archive)}`);
  const untar = run("tar", ["-xf", headTar, "-C", src]);
  if (untar.status !== 0) return fail(`extracting the archive failed: ${output(untar)}`);
  for (const rel of WORKING_TREE_FILES) {
    const from = join(REPO_ROOT, rel);
    if (!existsSync(from)) return fail(`${from} is absent in the working tree`);
    mkdirSync(dirname(join(src, rel)), { recursive: true });
    cpSync(from, join(src, rel));
  }
  const pack = run("tar", ["-czf", install.tarball, "-C", join(tmp, "src"), "fusion-head"]);
  if (pack.status !== 0) return fail(`packing the tarball failed: ${output(pack)}`);

  // 2. The one PATH directory: node, the host tools, the two stubs.
  mkdirSync(install.path);
  symlinkSync(process.execPath, join(install.path, "node"));
  for (const tool of HOST_TOOLS) {
    const abs = findOnHostPath(tool);
    if (abs === null) return fail(`${tool} is not on this host's PATH; the installer needs it`);
    symlinkSync(abs, join(install.path, tool));
  }
  for (const tool of OPTIONAL_TOOLS) {
    const abs = findOnHostPath(tool);
    if (abs !== null) symlinkSync(abs, join(install.path, tool));
  }
  stub(install.path, "claude", "# presence is all install.sh checks\nexit 0");
  stub(
    install.path,
    "curl",
    [
      "# copies the local tarball to the -o target; the URL is ignored and no socket is opened",
      'out=""',
      'while [ $# -gt 0 ]; do case "$1" in -o) out="$2"; shift 2 ;; *) shift ;; esac; done',
      '[ -n "$out" ] || { echo "stub curl: no -o" >&2; exit 2; }',
      `cp ${JSON.stringify(install.tarball)} "$out"`,
    ].join("\n"),
  );

  // 3. The install, with nothing but that directory on PATH.
  const scratchTmp = join(tmp, "installer-tmp");
  mkdirSync(scratchTmp);
  const r = run("bash", [join(src, "install.sh")], {
    cwd: tmp,
    env: { PATH: install.path, HOME: join(tmp, "home-dir"), TMPDIR: scratchTmp, FUSION_HOME: install.home, FUSION_BIN: install.bin },
  });
  install.status = r.status;
  install.stdout = r.stdout;
  install.stderr = r.stderr;
}, 120_000);

afterAll(() => {
  if (install?.tmp !== undefined) rmSync(install.tmp, { recursive: true, force: true });
});

/** The environment the installed wrapper is run with: the isolated PATH and nothing of the test's own. */
const installedEnv = (extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv => ({ PATH: install.path, HOME: join(install.tmp, "home-dir"), ...extra });

describe("install.sh from a tarball-shaped copy of the tree", () => {
  it("the preparation succeeded", () => {
    expect(install.failure, install.failure ?? "").toBeNull();
  });

  it("installs into FUSION_HOME with exit 0 and no warning about the codec bundle", () => {
    expect(install.failure).toBeNull();
    expect(install.status, `install.sh exited ${install.status}\nstdout:\n${install.stdout}\nstderr:\n${install.stderr}`).toBe(0);
    expect(install.stderr).not.toContain("fusion-record.js missing");
    expect(install.stderr).not.toContain("guard.js missing");
    expect(existsSync(join(install.home, ".claude-plugin", "plugin.json"))).toBe(true);
    expect(existsSync(join(install.bin, "fusion"))).toBe(true);
  });

  it("carries the codec: the bundle, the schemas, the contract, the fixtures; and the wrapper, executable", () => {
    expect(install.failure).toBeNull();
    for (const rel of ["codec/dist/fusion-record.js", "codec/schemas/protocol.schema.json", "codec/contract/transitions.json", "codec/fixtures/manifest.json", "codec/README.md", "bin/fusion-record", "bin/fusion-workbench-root"]) {
      expect(existsSync(join(install.home, rel)), `${rel} was not installed`).toBe(true);
    }
    expect(existsSync(join(install.home, "codec", "node_modules")), "codec/node_modules must never be installed").toBe(false);
    expect(existsSync(join(install.home, "hooks", "node_modules"))).toBe(false);
    const installedBundle = readFileSync(join(install.home, "codec", "dist", "fusion-record.js"));
    expect(installedBundle.equals(readFileSync(join(install.src, "codec", "dist", "fusion-record.js"))), "the installed bundle is not the archive's").toBe(true);
    const probe = run("test", ["-x", join(install.home, "bin", "fusion-record")]);
    expect(probe.status, "bin/fusion-record lost its executable bit in the copy").toBe(0);
  });

  it("the installed bin/fusion-record answers show on a scratch workbench beside it, with node the only runtime", () => {
    expect(install.failure).toBeNull();
    expect(install.status).toBe(0);
    const project = join(install.tmp, "project");
    const workbench = join(project, "fusion-workbench");
    mkdirSync(project);
    cpSync(FIXTURE, workbench, { recursive: true });
    const wrapper = join(install.home, "bin", "fusion-record");

    // An explicit workbench in the request.
    const explicit = run(wrapper, [], { cwd: install.tmp, input: JSON.stringify({ op: "show", workbench, record: { path: OPEN } }) + "\n", env: installedEnv() });
    expect(explicit.status, explicit.stderr).toBe(0);
    expect(explicit.stderr).toBe("");
    const answer = JSON.parse(explicit.stdout) as { ok: boolean; result?: { kind: string; revision: string; control: { status: string } } };
    expect(answer.ok, explicit.stdout).toBe(true);
    expect(answer.result?.kind).toBe("package");
    expect(answer.result?.control.status).toBe("open");
    expect(answer.result?.revision).toMatch(/^sha256:[0-9a-f]{64}$/);

    // The wrapper's walk-up from the working directory, through the installed bin/fusion-workbench-root.
    const walked = run(wrapper, [], { cwd: project, input: JSON.stringify({ op: "show", record: { path: OPEN } }) + "\n", env: installedEnv() });
    expect(walked.status, walked.stderr).toBe(0);
    expect(walked.stdout).toBe(explicit.stdout);
  });

  it("the installer warns, in the guard.js words, when the source carries no codec bundle", () => {
    expect(install.failure).toBeNull();
    // A second source without the bundle, packed into the tarball the stub curl serves.
    const bare = join(install.tmp, "bare", "fusion-head");
    mkdirSync(dirname(bare), { recursive: true });
    cpSync(install.src, bare, { recursive: true });
    rmSync(join(bare, "codec", "dist"), { recursive: true, force: true });
    const pack = run("tar", ["-czf", install.tarball, "-C", dirname(bare), "fusion-head"]);
    expect(pack.status, output(pack)).toBe(0);
    const home = join(install.tmp, "home-bare");
    const r = run("bash", [join(install.src, "install.sh")], { cwd: install.tmp, env: { ...installedEnv(), TMPDIR: join(install.tmp, "installer-tmp"), FUSION_HOME: home, FUSION_BIN: join(install.tmp, "bin-bare") } });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toContain("codec/dist/fusion-record.js missing — bin/fusion-record will not run.");
    const wrapper = run(join(home, "bin", "fusion-record"), [], { input: JSON.stringify({ op: "inspect" }) + "\n", env: installedEnv() });
    expect(wrapper.status).toBe(3);
    expect(wrapper.stdout).toBe("");
  });
});

// ---------------------------------------------------------------------------
// "Keine Installation aus dem Source-Checkout nötig": `install.sh` installs a
// tarball-shaped copy of the tree into a scratch home, and the installed
// `bin/fusion-record` answers a `show` on the scratch workbench with `node`
// the only runtime (FJ01 step 7; the spec's row FJ01). So do the two helpers
// that read scope and order from JSON (FJ03a step 5).
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
// then runs is `node` alone: no `npm`, no `node_modules`, no `git` (the scope
// case below adds `git` for `bin/fusion-identity`, and says so).
//
// ## The helpers that read through the record client (FJ03a step 5)
//
// `bin/fusion-claimed-package` and `bin/fusion-work-order` do not go through
// `bin/fusion-record`: each execs a compiled entry under `hooks/dist/`, whose
// record client resolves the bundle relative to itself. Two cases run them
// from the installed copy, so what is proven is the install's helpers, its
// `hooks/dist/` and its bundle resolution, and not a copy a test holds. Each
// project is a `git init` directory whose workbench starts from the manifest
// and the setup marker of the INSTALLED `codec/fixtures/workbench/`; every
// package in it is written by the kernel, through the installed
// `bin/fusion-record` (`create`, `claim`, `set-dependencies`), as
// `hooks/lib/__tests__/helpers/json-workbench.ts` does for the hook suite.
// `bin/fusion-work-order` runs on the one PATH directory above. The scope
// helper asks `bin/fusion-identity` which checkout this is, and that program
// calls `git` and a few more coreutils; they sit in a second directory that
// is on PATH for the scope case and for preparing a project, and for nothing
// else. `node` stays the only runtime in both.
//
// A third case (FJ03b step 7) runs the citation check, the plan-size check, a
// sweep dry run and staging drift the same way, all four on that second PATH,
// since staging drift reads `git status`. It asserts the format they read, one
// artefact under two names, and one PAIR-SPLIT row.
//
// A fourth case (initialize plan, step 9) starts from an EMPTY
// `fusion-workbench/`: the installed `bin/fusion-record` writes the manifest
// with `initialize`, and only then does the test write `.fusion-setup`, in
// the order Setup will take. The two FJ03a helpers then read that workbench
// as an empty JSON one. The same request over a v12 directory is refused and
// leaves it byte-identical, with no `.json-state/`.
//
// A fifth case (FJ03c step 9) runs the skill blocks the install SHIPS, read
// out of its `skills/*/SKILL.md` and run by `bash` verbatim, placeholders
// filled and nothing else changed: Setup's Step 0 twice (it initialises, then
// reuses), wp's gate and filing block, discuss's roots, begin and close. Between
// them `bin/fusion-write` claims, is refused a release in a copy of the project
// holding another checkout identifier (exit 5), releases and files a reviewer's
// evidence. The log then holds one `record_change` row per landed revision,
// matched by key, and a re-send, twice, adds none. The blocks run on the second
// PATH plus `date` and `awk` (SKILL_TOOLS); wp's `autonomous` block is not run,
// since it hashes with `shasum`, a perl program.
//
// A sixth case (archive revision step 11) runs Setup's Step 0, files through
// `bin/fusion-write` a closed issue and a done package holding a review and
// its evidence, and a live package whose `references` name the issue, sent
// through `bin/fusion-record` since `bin/fusion-write` writes no references.
// `bin/fusion-archive survey` holds the issue and the live package and offers
// the done one, and `move` archives it. The store then validates, reconciles
// clean, stands unfenced and refuses a foreign transition field, and four
// installed readers exit 0 naming nothing archived, on the same PATHs.
//
// ## Loud, never silent
//
// `git archive` failing, a tool absent from the host, or the installer
// exiting non-zero each FAIL naming the reason. Nothing here skips: the
// precondition the plan named (`claude` on PATH) is met by the stub.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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
/** What `bin/fusion-identity` calls beyond HOST_TOOLS; on PATH for the scope case and for preparing a project. */
const IDENTITY_TOOLS = ["git", "od", "tr", "grep", "sort", "wc", "ls"];
/** What the shipped skill blocks call beyond both lists: discuss's stamp, and `bin/fusion-session-domain`'s `awk`. */
const SKILL_TOOLS = ["date", "awk"];

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

/** The isolated PATH plus a second directory holding IDENTITY_TOOLS, built on first use. A tool absent from the host fails the case by name. */
function identityEnv(): NodeJS.ProcessEnv {
  const dir = join(install.tmp, "path-identity");
  if (!existsSync(dir)) {
    mkdirSync(dir);
    for (const tool of IDENTITY_TOOLS) {
      const abs = findOnHostPath(tool);
      if (abs === null) throw new Error(`${tool} is not on this host's PATH; bin/fusion-identity needs it`);
      symlinkSync(abs, join(dir, tool));
    }
  }
  return installedEnv({ PATH: `${install.path}${delimiter}${dir}` });
}

interface Project {
  root: string;
  /** Ids are counted per project and never random. */
  next: number;
}
interface Package {
  stem: string;
  path: string;
  id: string;
}

/**
 * A `git init` project under the scratch directory whose workbench holds the
 * setup marker and, unless `legacy`, the manifest of the installed fixture
 * workbench, and nothing else: the packages come from the kernel. `empty`
 * leaves the workbench an empty directory, marker and manifest both absent.
 */
function project(name: string, options: { legacy?: boolean; empty?: boolean } = {}): Project {
  const root = join(install.tmp, name);
  const workbench = join(root, "fusion-workbench");
  mkdirSync(workbench, { recursive: true });
  const fixture = join(install.home, "codec", "fixtures", "workbench");
  if (options.empty !== true) cpSync(join(fixture, ".fusion-setup"), join(workbench, ".fusion-setup"));
  if (options.legacy !== true && options.empty !== true) cpSync(join(fixture, "workbench.json"), join(workbench, "workbench.json"));
  for (const args of [["init", "-q"], ["config", "user.name", "Install Test"], ["config", "user.email", "install-test@example.invalid"]]) {
    const git = run("git", args, { cwd: root, env: identityEnv() });
    if (git.status !== 0) throw new Error(`git ${args.join(" ")} failed in ${root}: ${output(git)}`);
  }
  return { root, next: 1 };
}

const uuid = (p: Project): string => `f03a0005-0000-4000-8000-${String(p.next++).padStart(12, "0")}`;
const ACTOR = { actor: "user", person: null };

/** One request through the INSTALLED wrapper, the workbench found by its walk-up; anything but a result fails the case, naming the answer. */
function record(p: Project, request: Record<string, unknown>): Record<string, unknown> {
  const r = run(join(install.home, "bin", "fusion-record"), [], { cwd: p.root, input: JSON.stringify(request) + "\n", env: installedEnv() });
  const answer = r.status === 0 ? (JSON.parse(r.stdout) as { ok: boolean; result?: Record<string, unknown> }) : null;
  if (answer === null || answer.ok !== true || answer.result === undefined) throw new Error(`${String(request.op)} was not answered with a result (exit ${r.status}): ${r.stdout || r.stderr}`);
  return answer.result;
}

function createPackage(p: Project, stem: string): Package {
  const pkg: Package = { stem, path: `work-packages/${stem}/package.json`, id: uuid(p) };
  record(p, {
    op: "create",
    operation_id: uuid(p),
    id: pkg.id,
    kind: "package",
    filed_by: ACTOR,
    origin: { kind: "user-request", ref: null },
    scope: { container: null, store: "work-packages" },
    narrative: { path: `work-packages/${stem}/${stem}.md`, content: `# ${stem}\n\n## Directive\n\nA package the install test filed.\n` },
    payload: { domain: "code" },
  });
  return pkg;
}

/** A mutation of `pkg` at the revision it stands at. */
function mutate(p: Project, pkg: Package, op: string, fields: Record<string, unknown>): void {
  const { revision } = record(p, { op: "show", record: { path: pkg.path } });
  record(p, { op, operation_id: uuid(p), record: { path: pkg.path }, expected_revision: revision, actor: ACTOR, ...fields });
}

/** A helper of the installed copy, run in `cwd`. */
const helper = (name: string, cwd: string, env: NodeJS.ProcessEnv) => run(join(install.home, "bin", name), [], { cwd, env });

/** identityEnv plus a third directory holding SKILL_TOOLS, and the plugin root the skill blocks name. */
function skillEnv(extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  const dir = join(install.tmp, "path-skill");
  if (!existsSync(dir)) {
    mkdirSync(dir);
    for (const tool of SKILL_TOOLS) {
      const abs = findOnHostPath(tool);
      if (abs === null) throw new Error(`${tool} is not on this host's PATH; a shipped skill block needs it`);
      symlinkSync(abs, join(dir, tool));
    }
  }
  const base = identityEnv();
  return { ...base, PATH: `${base.PATH}${delimiter}${dir}`, FUSION_PLUGIN_ROOT: install.home, ...extra };
}

/** The ```bash blocks of the section of an INSTALLED `skills/<skill>/SKILL.md` whose `## ` heading starts with `heading`, verbatim. A `## ` line inside a fence (a template's) ends no section. */
function shippedBlocks(skill: string, heading: string): string[] {
  const blocks: string[] = [];
  let inSection = false;
  let fence: string[] | null = null;
  for (const line of readFileSync(join(install.home, "skills", skill, "SKILL.md"), "utf-8").split("\n")) {
    if (fence !== null) {
      if (line !== "```") fence.push(line);
      else {
        if (inSection && fence[0] === "```bash") blocks.push(fence.slice(1).join("\n") + "\n");
        fence = null;
      }
    } else if (line.startsWith("```")) fence = [line];
    else if (line.startsWith("## ")) {
      if (inSection) break;
      inSection = line.startsWith(heading);
    }
  }
  if (!inSection) throw new Error(`skills/${skill}/SKILL.md has no section ${heading}`);
  return blocks;
}

/** A block with each placeholder replaced; a placeholder the block lacks, or one left over, fails the case by name. */
function fill(block: string, values: Record<string, string>): string {
  let out = block;
  for (const [placeholder, value] of Object.entries(values)) {
    if (!out.includes(placeholder)) throw new Error(`the shipped block no longer carries ${placeholder}:\n${block}`);
    out = out.replaceAll(placeholder, value);
  }
  const left = /<[A-Za-z][^<>\n]*>/.exec(out);
  if (left !== null) throw new Error(`the shipped block carries a placeholder this case does not fill, ${left[0]}:\n${block}`);
  return out;
}

/** The first `key=` value of KEY=value output. */
const kv = (out: string, key: string): string | undefined => out.split("\n").find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1);

/** Every entry under `dir`, relative and sorted, a directory as `dir` and anything else by the digest of its bytes. */
function tree(dir: string): string[] {
  return (readdirSync(dir, { recursive: true }) as string[])
    .map((rel) => `${rel} ${lstatSync(join(dir, rel)).isDirectory() ? "dir" : createHash("sha256").update(readFileSync(join(dir, rel))).digest("hex")}`)
    .sort();
}

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

  it("the installed bin/fusion-claimed-package names the package this checkout claimed, from JSON, and refuses a legacy workbench by name", () => {
    expect(install.failure).toBeNull();
    expect(install.status).toBe(0);
    const p = project("scope-project");
    const identity = helper("fusion-identity", p.root, identityEnv());
    expect(identity.status, identity.stderr).toBe(0);
    const checkout = /^CHECKOUT=([0-9a-f]{8})$/m.exec(identity.stdout)?.[1];
    expect(checkout, identity.stdout).toBeDefined();

    // Nothing filed yet: an empty answer, which is a real one.
    const none = helper("fusion-claimed-package", p.root, identityEnv());
    expect([none.status, none.stdout], none.stderr).toEqual([0, ""]);

    // Two claimed packages, one of them another checkout's.
    const other = checkout === "0badc0de" ? "0badc0df" : "0badc0de";
    const [theirs, ours] = ["260930-0900-held-elsewhere", "260930-0901-held-here"].map((stem) => createPackage(p, stem));
    mutate(p, theirs, "claim", { claim: { checkout_id: other, person: null, claimed_at: "2026-09-30T09:00:00Z" } });
    mutate(p, ours, "claim", { claim: { checkout_id: checkout, person: null, claimed_at: "2026-09-30T09:01:00Z" } });
    const one = helper("fusion-claimed-package", p.root, identityEnv());
    expect(one.status, one.stderr).toBe(0);
    expect(one.stdout).toBe(`PACKAGE=work-packages/${ours.stem}/${ours.stem}.md\nCONTAINER=work-packages/${ours.stem}\n`);

    const legacy = helper("fusion-claimed-package", project("scope-legacy", { legacy: true }).root, identityEnv());
    expect([legacy.status, legacy.stdout], legacy.stderr).toEqual([3, ""]);
    expect(legacy.stderr).toContain("is legacy");
  }, 60_000);

  it("the installed bin/fusion-work-order prints the order over the codec's edges, with node the only runtime, and refuses a legacy workbench by name", () => {
    expect(install.failure).toBeNull();
    expect(install.status).toBe(0);
    const p = project("order-project");
    const [first, second] = ["260930-0910-first", "260930-0911-second"].map((stem) => createPackage(p, stem));
    const { id } = record(p, { op: "inspect" });
    mutate(p, second, "set-dependencies", { depends_on: [{ target: { workbench_id: id, record_id: first.id }, condition: "terminal" }] });

    // The one PATH directory of the install: no git, no npm.
    const order = helper("fusion-work-order", p.root, installedEnv());
    expect(order.status, order.stderr).toBe(0);
    const value = (key: string) => order.stdout.split("\n").find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1);
    expect(["items", "edges", "unmet-edges", "unresolved-edges", "cycles", "ready", "unreadable-head", "verdict"].map(value)).toEqual(["2", "1", "0", "0", "0", "1", "0", "acyclic"]);
    const rows = order.stdout.split("\n").filter((l) => l.startsWith("  ")).map((l) => l.trim().split(/\s+/).slice(3));
    expect(rows).toEqual([["ready", first.stem], ["blocked", second.stem]]);

    const legacy = helper("fusion-work-order", project("order-legacy", { legacy: true }).root, installedEnv());
    expect([legacy.status, legacy.stdout], legacy.stderr).toEqual([4, ""]);
    expect(legacy.stderr).toContain("is legacy");
  }, 60_000);

  it("the installed citation check, plan-size check, sweep and staging drift answer from JSON, with node the only runtime beside what bin/fusion-identity needs", () => {
    expect(install.failure).toBeNull();
    expect(install.status).toBe(0);
    const p = project("observers-project");
    const [alpha, beta] = ["260930-0920-alpha", "260930-0921-beta"].map((stem) => createPackage(p, stem));
    const workbench_id = record(p, { op: "inspect" }).id;
    mutate(p, beta, "set-dependencies", { depends_on: [{ target: { workbench_id, record_id: alpha.id }, condition: "terminal" }] });
    // A live plan of alpha's, adopted, citing alpha through a store segment: one violation the sweep would rewrite.
    const plan = { path: `work-packages/${alpha.stem}/plans/260930-0922-plan.md`, id: uuid(p) };
    record(p, { op: "create", operation_id: uuid(p), id: plan.id, kind: "plan", filed_by: ACTOR, origin: { kind: "package", ref: { workbench_id, record_id: alpha.id } }, scope: { container: `work-packages/${alpha.stem}`, store: "plans" }, narrative: { path: plan.path, content: `# Implementation Plan: x\n\nsee \`work-packages/${alpha.stem}/${alpha.stem}.md\`\n` }, payload: { state: "open", steps: [{ id: "s1", state: "open" }], criteria: [], acceptance: null } });
    const planBytes = readFileSync(join(p.root, "fusion-workbench", plan.path));
    mutate(p, alpha, "adopt-plan", { plan: { workbench_id, record_id: plan.id }, revision: `sha256:${createHash("sha256").update(planBytes).digest("hex")}` });
    // One artefact under two names: its file name, and the prefix a `.record.json` beside it would make ambiguous.
    writeFileSync(join(p.root, "CLAUDE.md"), "the plan `260930-0922-plan.md`, by prefix `260930-0922-plan`\n");
    const installed = (name: string, ...args: string[]) => run(join(install.home, "bin", name), args, { cwd: p.root, env: identityEnv() });
    const git = (...args: string[]) => run("git", args, { cwd: p.root, env: identityEnv() }).status;
    const value = (out: string, key: string) => out.split("\n").find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1);

    const check = installed("fusion-citation-check");
    expect(check.status, check.stderr).toBe(0);
    expect(check.stdout.split("\n")[0]).toBe("format=json-control");
    // resolved: CLAUDE.md's two, and each brief's title naming its own package
    expect(["resolved", "dangling", "conflict", "store-prefixed", "edited-violations", "uuid-unresolved", "verdict"].map((k) => value(check.stdout, k))).toEqual(["4", "0", "0", "1", "1", "0", "violations"]);

    const size = installed("fusion-plan-size");
    expect(size.status, size.stderr).toBe(0);
    expect([size.stdout.split("\n")[0], value(size.stdout, "plans"), value(size.stdout, "unreadable")]).toEqual(["format=json-control", "1", "0"]);

    const sweep = installed("fusion-citation-sweep", "--dry-run");
    expect(sweep.status, sweep.stderr).toBe(0);
    const swept = sweep.stdout.trim().split("\n");
    expect([swept[0], swept.filter((l) => l.startsWith("bound="))]).toEqual(["format=json-control", [`bound=fusion-workbench/${plan.path}  plan:fusion-workbench/${alpha.path}`]]);

    // A pair half staged: alpha's brief edited and staged, its control file moved by a claim and not.
    expect([git("add", "-A"), git("commit", "-q", "-m", "filed")]).toEqual([0, 0]);
    writeFileSync(join(p.root, "fusion-workbench", `work-packages/${alpha.stem}/${alpha.stem}.md`), `# ${alpha.stem}\n\n## Directive\n\nRevised.\n`);
    mutate(p, alpha, "claim", { claim: { checkout_id: "0badc0de", person: null, claimed_at: "2026-09-30T09:20:00Z" } });
    expect(git("add", `fusion-workbench/work-packages/${alpha.stem}/${alpha.stem}.md`)).toBe(0);
    const drift = installed("fusion-staging-drift");
    expect(drift.status, drift.stderr).toBe(0);
    expect(value(drift.stdout, "unstaged")).toBe("1");
    expect(drift.stdout.split("\n").filter((l) => l.includes("PAIR-SPLIT"))).toEqual([expect.stringMatching(new RegExp(`^ {2}record\\s+ M ${alpha.path}  PAIR-SPLIT .*${alpha.stem}\\.md is staged`))]);
  }, 60_000);

  it("the installed bin/fusion-record initialises an empty workbench the two FJ03a helpers read, and refuses a v12 directory leaving it byte-identical", () => {
    expect(install.failure).toBeNull();
    expect(install.status).toBe(0);
    const p = project("initialize-project", { empty: true });
    const workbench = join(p.root, "fusion-workbench");
    expect(readdirSync(workbench)).toEqual([]);

    // initialize names its target; no marker stands yet for a walk-up to find.
    const request = { op: "initialize", workbench, operation_id: uuid(p), id: uuid(p) };
    const landed = record(p, request);
    const manifestBytes = readFileSync(join(workbench, "workbench.json"));
    expect(landed).toEqual({ operation_id: request.operation_id, id: request.id, path: "workbench.json", revision: `sha256:${createHash("sha256").update(manifestBytes).digest("hex")}` });
    expect(JSON.parse(manifestBytes.toString("utf-8"))).toEqual({ schema: "fusion.workbench/v1", id: request.id, required_features: ["json-control-v1"], migration: null, extensions: {} });

    // Setup's order: the marker after the manifest. From here the wrapper and the helpers find the workbench by walking up.
    cpSync(join(install.home, "codec", "fixtures", "workbench", ".fusion-setup"), join(workbench, ".fusion-setup"));
    const inspected = record(p, { op: "inspect" });
    expect([inspected.state, inspected.id, inspected.pending]).toEqual(["json-control", request.id, null]);

    const claimed = helper("fusion-claimed-package", p.root, identityEnv());
    expect([claimed.status, claimed.stdout], claimed.stderr).toEqual([0, ""]);
    const order = helper("fusion-work-order", p.root, installedEnv());
    expect(order.status, order.stderr).toBe(0);
    const value = (key: string) => order.stdout.split("\n").find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1);
    expect([value("items"), value("edges"), value("verdict")]).toEqual(["0", "0", "empty"]);

    // A v12 workbench: the marker and one package's Markdown. Refused by name, every byte kept, no `.json-state/`.
    const v12 = project("initialize-v12", { empty: true });
    const v12Workbench = join(v12.root, "fusion-workbench");
    cpSync(join(install.home, "codec", "fixtures", "workbench", ".fusion-setup"), join(v12Workbench, ".fusion-setup"));
    const stem = "260930-0930-v12-package";
    mkdirSync(join(v12Workbench, "work-packages", stem), { recursive: true });
    writeFileSync(join(v12Workbench, "work-packages", stem, `${stem}.md`), `# ${stem}\n\n---\n**Domain:** code\n**Status:** open\n**Filed by:** user\n\n---\n\n## Directive\n\nA v12 package.\n`);
    const before = tree(v12Workbench);
    const refused = run(join(install.home, "bin", "fusion-record"), [], { cwd: v12.root, input: JSON.stringify({ op: "initialize", workbench: v12Workbench, operation_id: uuid(v12), id: uuid(v12) }) + "\n", env: installedEnv() });
    expect(refused.status, refused.stderr).toBe(0);
    const answer = JSON.parse(refused.stdout) as { ok: boolean; error?: { class: string; reason: string; detail: string } };
    expect([answer.ok, answer.error?.class, answer.error?.reason], refused.stdout).toEqual([false, "conflict", "target-not-empty"]);
    expect(answer.error?.detail).toContain(".fusion-setup, work-packages");
    expect(tree(v12Workbench)).toEqual(before);
    expect(existsSync(join(v12Workbench, ".json-state"))).toBe(false);
  }, 60_000);

  it("the shipped Setup, wp and discuss blocks run verbatim on the installed copy, and bin/fusion-write logs one record_change row per landed revision", () => {
    expect(install.failure).toBeNull();
    expect(install.status).toBe(0);
    const p = project("skills-project", { empty: true });
    const env = skillEnv();
    const block = (b: string, extra: NodeJS.ProcessEnv = {}, cwd = p.root) => run("bash", ["-c", b], { cwd, env: { ...env, ...extra } });
    const write = (args: string[], cwd = p.root) => run(join(install.home, "bin", "fusion-write"), args, { cwd, env });
    const log = join(p.root, "fusion-workbench", "orchestrator-events.jsonl");
    const rows = () => (existsSync(log) ? readFileSync(log, "utf-8").split("\n").filter((l) => l.length > 0).map((l) => JSON.parse(l) as Record<string, unknown>).filter((r) => r.event === "record_change") : []);
    /** Each landed call, with the `change` its rows carry. */
    const landed: { op: string; out: string; change: unknown }[] = [];
    const wrote = (op: string, out: string, change: unknown) => landed.push({ op, out, change });

    // Setup's Step 0, every block of it in order (pwd, the probe, initialize, the stores, the marker), twice.
    const setup = shippedBlocks("setup", "## Step 0 —");
    expect(setup.length).toBe(5);
    const [first, again] = [0, 1].map(() => setup.map((b) => block(fill(b, {}))));
    for (const r of [...first, ...again]) expect(r.status, r.stderr).toBe(0);
    expect([first[1].stdout, kv(first[2].stdout, "result"), kv(first[2].stdout, "exit"), kv(first[4].stdout, "marker")], first[2].stderr).toEqual(["OLD=0\n", "initialized", "0", "written"]);
    const workbenchId = kv(first[2].stdout, "workbench_id");
    expect(workbenchId).toMatch(/^[0-9a-f-]{36}$/);
    expect([kv(again[2].stdout, "result"), kv(again[2].stdout, "workbench_id"), kv(again[2].stdout, "exit"), kv(again[4].stdout, "marker")]).toEqual(["reused", workbenchId, "0", "unchanged"]);
    expect(rows()).toEqual([]);

    // wp: the gate and the resolver, then the filing block over the record the prose has written first.
    const [wpGate, ...wpRest] = shippedBlocks("wp", "## Step 0 —");
    expect(wpRest).toEqual([]);
    const gated = block(wpGate);
    expect(gated.status, gated.stderr).toBe(0);
    expect(gated.stdout.split("\n")[0]).toBe('"state":"json-control"');
    const WORKBENCH = kv(gated.stdout, "WORKBENCH")!;
    const OUT_PACKAGES = kv(gated.stdout, "OUT_PACKAGES")!;
    const stem = "261001-1000-install-test-package";
    const pkg = `${OUT_PACKAGES}/${stem}/package.json`;
    mkdirSync(join(WORKBENCH, OUT_PACKAGES, stem), { recursive: true });
    writeFileSync(join(WORKBENCH, OUT_PACKAGES, stem, `${stem}.md`), `# Install test package\n\n## Directive\n\nA package the shipped wp block filed.\n`);
    const wpJson = shippedBlocks("wp", "## On a JSON-controlled workbench");
    expect(wpJson.length).toBe(2);
    const filed = block(fill(wpJson[0], { "<YYMMDD-HHMM>-<topic>": stem, "<code|data>": "code" }), { WORKBENCH, OUT_PACKAGES });
    expect([kv(filed.stdout, "result"), kv(filed.stdout, "path"), kv(filed.stdout, "exit")], filed.stderr).toEqual(["landed", pkg, "0"]);
    wrote("create", filed.stdout, { created: "open" });

    // claim by this checkout, which bin/fusion-claimed-package then names.
    const claimed = write(["claim", "--record", pkg, "--actor", "user"]);
    expect([claimed.status, kv(claimed.stdout, "result")], claimed.stderr).toEqual([0, "landed"]);
    wrote("claim", claimed.stdout, { from: "open", to: "claimed" });
    const checkout = readFileSync(join(WORKBENCH, ".checkout-id"), "utf-8").trim();
    const scope = helper("fusion-claimed-package", p.root, identityEnv());
    expect([scope.status, scope.stdout], scope.stderr).toEqual([0, `PACKAGE=${OUT_PACKAGES}/${stem}/${stem}.md\nCONTAINER=${OUT_PACKAGES}/${stem}\n`]);

    // A second checkout, a copy of the project holding another identifier, is refused the release and changes nothing.
    const second = join(install.tmp, "skills-project-second");
    cpSync(p.root, second, { recursive: true });
    writeFileSync(join(second, "fusion-workbench", ".checkout-id"), `${checkout === "0badc0de" ? "0badc0df" : "0badc0de"}\n`);
    const secondBefore = tree(join(second, "fusion-workbench"));
    const foreign = write(["release", "--record", pkg, "--reason", "not mine to release", "--actor", "user"], second);
    expect([foreign.status, foreign.stdout], foreign.stderr).toEqual([5, ""]);
    expect(foreign.stderr).toContain(`claimed by checkout ${checkout}`);
    expect(tree(join(second, "fusion-workbench"))).toEqual(secondBefore);

    // release by the owner; the scope helper then names nothing.
    const released = write(["release", "--record", pkg, "--reason", "handed back", "--actor", "user"]);
    expect([released.status, kv(released.stdout, "result")], released.stderr).toEqual([0, "landed"]);
    wrote("release", released.stdout, { from: "claimed", to: "open" });
    expect(helper("fusion-claimed-package", p.root, identityEnv()).stdout).toBe("");

    // A reviewer's evidence over a report, bound to the project's HEAD tree.
    const report = `${OUT_PACKAGES}/${stem}/reviews/261001-1010-review.md`;
    mkdirSync(dirname(join(WORKBENCH, report)), { recursive: true });
    writeFileSync(join(WORKBENCH, report), "# Review\n\nAccepted.\n");
    const git = (...args: string[]) => run("git", args, { cwd: p.root, env: identityEnv() }).status;
    expect([git("add", "-A"), git("commit", "-q", "-m", "filed")]).toEqual([0, 0]);
    const evidence = write(["evidence", "--record", pkg, "--report", report, "--verdict", "accept", "--actor", "reviewer"]);
    expect([evidence.status, kv(evidence.stdout, "result")], evidence.stderr).toEqual([0, "landed"]);
    wrote("create", evidence.stdout, { created_kind: "evidence" });

    // discuss: its roots, the begin block over the record the prose has written, then the close block.
    const [roots, ...rootsRest] = shippedBlocks("discuss", "## Step 1 —");
    expect(rootsRest).toEqual([]);
    const resolved = block(roots);
    expect(resolved.status, resolved.stderr).toBe(0);
    expect(resolved.stdout.split("\n")[1]).toBe('"state":"json-control"');
    const OUT_DISCUSSION = kv(resolved.stdout, "OUT_DISCUSSION")!;
    const begin = shippedBlocks("discuss", "## Step 4 —");
    expect(begin.length).toBe(2);
    const stamped = block(begin[0]);
    expect([stamped.status, kv(stamped.stdout, "PERSON"), kv(stamped.stdout, "CHECKOUT"), kv(stamped.stdout, "domain")], stamped.stderr).toEqual([0, "Install Test <install-test@example.invalid>", checkout, "code"]);
    const N = `${OUT_DISCUSSION}/261001-1020-install-test-discussion.md`;
    mkdirSync(join(WORKBENCH, OUT_DISCUSSION), { recursive: true });
    writeFileSync(join(WORKBENCH, N), "# Install test discussion\n\n---\n**Rounds:** 0\n**Outcome:** still running\n\n---\n\n## Question\n\nDoes the shipped block run?\n");
    const begun = block(fill(begin[1], { "<your agent name, or claude>": "claude" }), { WORKBENCH, OUT_DISCUSSION, N });
    expect([kv(begun.stdout, "result"), kv(begun.stdout, "exit")], begun.stderr).toEqual(["landed", "0"]);
    wrote("create", begun.stdout, { created: "open" });
    const discussion = kv(begun.stdout, "path")!;
    writeFileSync(join(WORKBENCH, N), "# Install test discussion\n\n---\n**Rounds:** 1\n**Outcome:** converged\n\n---\n\n## Question\n\nDoes the shipped block run?\n\n## Recommendation\n\nIt does; this binds nothing.\n");
    const [close, ...closeRest] = shippedBlocks("discuss", "## Step 8 —");
    expect(closeRest).toEqual([]);
    const closed = block(fill(close, { "<its path= line>": discussion, "<the outcome>": "converged", "<as at Step 4>": "claude" }));
    expect([kv(closed.stdout, "result"), kv(closed.stdout, "exit")], closed.stderr).toEqual(["landed", "0"]);
    wrote("transition", closed.stdout, { from: "open", to: "closed" });

    // Exactly one row per landed revision, by key, in order, naming this checkout and person.
    const expected = landed.flatMap(({ op, out, change }) => {
      const lines = out.split("\n");
      const paths = lines.filter((l) => l.startsWith("path=")).map((l) => l.slice(5));
      const revisions = lines.filter((l) => l.startsWith("revision=")).map((l) => l.slice(9));
      expect(paths.length).toBe(revisions.length);
      return paths.map((path, i) => ({ op, key: `${workbenchId} ${kv(out, "operation_id")} ${path} ${revisions[i]}`, change, checkout, person: "Install Test <install-test@example.invalid>" }));
    });
    expect(expected.length).toBe(6);
    const logged = () => rows().map((r) => ({ op: r.op, key: `${String(r.workbench_id)} ${String(r.operation_id)} ${String(r.path)} ${String(r.revision)}`, change: r.change, checkout: r.checkout, person: r.person }));
    expect(logged()).toEqual(expected);

    // The re-send of the close, twice: the stored answer, logged already, and not one byte more in the log.
    const logBytes = readFileSync(log);
    for (let i = 0; i < 2; i++) {
      const resent = write(["transition", "--record", discussion, "--to", "closed", "--reason", "converged", "--actor", "claude", "--operation-id", kv(closed.stdout, "operation_id")!, "--expected-revision", kv(begun.stdout, "revision")!]);
      expect([resent.status, kv(resent.stdout, "result"), kv(resent.stdout, "operation_id"), kv(resent.stdout, "revision"), kv(resent.stdout, "event")], resent.stderr).toEqual([0, "landed", kv(closed.stdout, "operation_id"), kv(closed.stdout, "revision"), "logged"]);
      expect(readFileSync(log).equals(logBytes)).toBe(true);
    }
    expect(record(p, { op: "validate" }).valid).toBe(true);
  }, 120_000);

  it("the installed bin/fusion-archive holds a referenced issue and archives a terminal package, after which the store reads clean and the helpers name nothing archived", () => {
    expect(install.failure).toBeNull();
    expect(install.status).toBe(0);
    const p = project("archive-project", { empty: true });
    const env = skillEnv();
    const write = (...args: string[]) => run(join(install.home, "bin", "fusion-write"), args, { cwd: p.root, env });
    const archive = (...args: string[]) => run(join(install.home, "bin", "fusion-archive"), args, { cwd: p.root, env });
    const landed = (r: ReturnType<typeof run>) => {
      expect([r.status, kv(r.stdout, "result")], r.stderr).toEqual([0, "landed"]);
      return r.stdout;
    };
    for (const b of shippedBlocks("setup", "## Step 0 —")) expect(run("bash", ["-c", fill(b, {})], { cwd: p.root, env }).status).toBe(0);
    const WORKBENCH = join(p.root, "fusion-workbench");
    const workbench_id = record(p, { op: "inspect" }).id as string;
    const narrative = (rel: string, text: string) => {
      mkdirSync(dirname(join(WORKBENCH, rel)), { recursive: true });
      writeFileSync(join(WORKBENCH, rel), text);
      return rel;
    };

    // A terminal issue in shared/.
    const issueOut = landed(write("create", "--kind", "issue", "--narrative-file", narrative("shared/issues/261001-1100-install-test-issue.md", "# An issue\n\nRejected.\n"), "--origin", "user-request", "--actor", "user"));
    const issue = kv(issueOut, "path")!;
    landed(write("transition", "--record", issue, "--to", "closed", "--reason", "rejected", "--disposition", JSON.stringify({ kind: "rejected", reason_ref: null }), "--actor", "user"));
    const issueId = (record(p, { op: "show", record: { path: issue } }).control as { id: string }).id;

    // A terminal package with a review and its evidence, all in its container.
    const done = "261001-1101-install-test-done";
    const donePkg = kv(landed(write("create", "--kind", "package", "--narrative-file", narrative(`work-packages/${done}/${done}.md`, "# Done\n\n## Directive\n\nFinished.\n"), "--origin", "user-request", "--domain", "code", "--actor", "user")), "path")!;
    const report = narrative(`work-packages/${done}/reviews/261001-1102-review.md`, "# Review\n\nAccepted.\n");
    const git = (...args: string[]) => run("git", args, { cwd: p.root, env: identityEnv() }).status;
    expect([git("add", "-A"), git("commit", "-q", "-m", "filed")]).toEqual([0, 0]);
    const evidence = landed(write("evidence", "--record", donePkg, "--report", report, "--verdict", "accept", "--actor", "reviewer")).split("\n").find((l) => l.startsWith("path=") && l.endsWith(".evidence.json"))!.slice(5);
    landed(write("attach-evidence", "--record", donePkg, "--evidence", evidence, "--actor", "user"));
    landed(write("claim", "--record", donePkg, "--actor", "user"));
    landed(write("transition", "--record", donePkg, "--to", "done", "--reason", "finished", "--outcome", JSON.stringify({ class: "completed", reason: "finished", evidence: [] }), "--actor", "user"));

    // A live package referencing the issue. bin/fusion-write has no flag that writes a package's references, so this create goes through the installed bin/fusion-record.
    const live = "261001-1103-install-test-live";
    const livePkg = `work-packages/${live}/package.json`;
    record(p, { op: "create", operation_id: uuid(p), id: uuid(p), kind: "package", filed_by: ACTOR, origin: { kind: "user-request", ref: null }, scope: { container: null, store: "work-packages" }, narrative: { path: `work-packages/${live}/${live}.md`, content: `# Live\n\n## Directive\n\nFollows \`${done}.md\`.\n` }, payload: { domain: "code", references: [{ workbench_id, record_id: issueId }] } });

    // survey: the issue is held by the live package's binding, the live package by its state, the terminal package is offered.
    const candidates = join(install.tmp, "archive-candidates.txt");
    writeFileSync(candidates, [`work-packages/${done}`, issue, `work-packages/${live}`].join("\n") + "\n");
    const surveyed = archive("survey", "--candidates", candidates);
    expect(surveyed.status, surveyed.stderr).toBe(0);
    expect(kv(surveyed.stdout, "workbench_id")).toBe(workbench_id);
    expect(surveyed.stdout.split("\n").filter((l) => /^(candidate|held|refused)=/.test(l))).toEqual([
      `candidate=package\twork-packages/${done}`,
      `held=pair\t${issue}\tbinding\t${livePkg}\t/references/0\t${issue}`,
      `held=package\twork-packages/${live}\tlive\t${livePkg}\t-\topen`,
    ]);

    // move: the container leaves whole for archive/<into>/, the fence taken and ended.
    const surveyFile = join(install.tmp, "archive-survey.txt");
    writeFileSync(surveyFile, surveyed.stdout);
    const into = "261001-1104-install-test";
    const moved = archive("move", "--survey", surveyFile, "--into", into);
    expect(moved.status, moved.stderr).toBe(0);
    expect([moved.stdout.split("\n").filter((l) => l.startsWith("moved=")), kv(moved.stdout, "result")]).toEqual([[`moved=package\twork-packages/${done}\tarchive/${into}/work-packages/${done}`], "moved"]);
    const archived = [`${done}.md`, "package.json", "reviews/261001-1102-review.md", evidence.slice(`work-packages/${done}/`.length)].map((f) => `work-packages/${done}/${f}`);
    expect(archived.map((f) => [existsSync(join(WORKBENCH, f)), existsSync(join(WORKBENCH, "archive", into, f))])).toEqual(archived.map(() => [false, true]));

    // The store without it: valid, every reference resolved, no fence standing.
    expect(record(p, { op: "validate" }).valid).toBe(true);
    const reconciled = record(p, { op: "reconcile" }) as { records: unknown[]; references: { path: string; at: string; status: string; target?: string }[] };
    expect([reconciled.records, reconciled.references.filter((r) => r.status !== "resolved")]).toEqual([[], []]);
    expect(reconciled.references).toContainEqual(expect.objectContaining({ path: livePkg, at: "/references/0", status: "resolved", target: issue }));
    expect(record(p, { op: "inspect" }).maintenance).toBeNull();

    // A transition carrying a field foreign to the package, sent raw: refused, the record unchanged.
    const before = readFileSync(join(WORKBENCH, livePkg));
    const { revision } = record(p, { op: "show", record: { path: livePkg } });
    const foreign = run(join(install.home, "bin", "fusion-record"), [], { cwd: p.root, input: JSON.stringify({ op: "transition", operation_id: uuid(p), record: { path: livePkg }, expected_revision: revision, actor: ACTOR, to: "paused", reason: "r", payload: { disposition: null } }) + "\n", env: installedEnv() });
    expect(foreign.status, foreign.stderr).toBe(0);
    const refusal = JSON.parse(foreign.stdout) as { ok: boolean; error?: { class: string; reason: string } };
    expect([refusal.ok, refusal.error?.class, refusal.error?.reason], foreign.stdout).toEqual([false, "schema-invalid", "payload-field-not-admitted"]);
    expect(readFileSync(join(WORKBENCH, livePkg)).equals(before)).toBe(true);

    // The installed readers answer, and none names the archived package: nothing claimed, the live package the one item, the brief's basename citation of the archived package still resolving.
    const out: Record<string, string> = {};
    for (const [name, args, helperEnv] of [["fusion-claimed-package", [], identityEnv()], ["fusion-work-order", [], installedEnv()], ["fusion-citation-check", [], identityEnv()], ["fusion-citation-sweep", ["--dry-run"], identityEnv()]] as const) {
      const r = run(join(install.home, "bin", name), [...args], { cwd: p.root, env: helperEnv });
      expect(r.status, `${name}: ${r.stderr}`).toBe(0);
      expect(r.stdout, name).not.toContain(done);
      expect(r.stdout, name).not.toContain("archive/");
      out[name] = r.stdout;
    }
    expect(out["fusion-claimed-package"]).toBe("");
    expect([kv(out["fusion-work-order"], "items"), out["fusion-work-order"].split("\n").filter((l) => l.startsWith("  ")).map((l) => l.trim().split(/\s+/).slice(3))]).toEqual(["1", [["ready", live]]]);
    expect(["resolved", "dangling", "verdict"].map((k) => kv(out["fusion-citation-check"], k))).toEqual(["1", "0", "clean"]);
  }, 120_000);

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

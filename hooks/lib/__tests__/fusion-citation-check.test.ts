/**
 * `bin/fusion-citation-check`'s entry, spawned over a scratch consuming project:
 * the corpus is the whole workbench, frozen stores included, plus the project's
 * own normative files; a store-prefixed token is a violation named by file and
 * line; the verdict is stdout and the exit stays 0; outside a workbench, exit 2.
 *
 * The frozen-store file is in the corpus and its dangling citation is reported,
 * which is the property `citation-check.ts` `## Corpus` reasons. The blocking
 * gate `workbench-citation-lint.test.ts` still excludes the same stores; the
 * two corpora differ on purpose.
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { TEST_DIST, CASE_TIMEOUT } from "./helpers/guard-harness.js";

const ENTRY = join(TEST_DIST, "citation-check.js");

function run(cwd: string, ...args: string[]) {
  return spawnSync(process.execPath, [ENTRY, ...args], { cwd, encoding: "utf-8" });
}

function scratchProject(): string {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "citation-check-")));
  const put = (rel: string, text: string) => {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  };
  put("fusion-workbench/.fusion-setup", "{}");
  put("fusion-workbench/shared/decisions/260101-0001_o_beta.md", "# bar");
  put(
    "fusion-workbench/shared/issues/260101-0000_o_alpha.md",
    "see `shared/decisions/260101-0001_o_beta.md` and `260101-0001_*_beta.md`",
  );
  put("fusion-workbench/archive/260102-0000-sweep/shared/issues/260101-0002_c_old.md", "cites `260199-9999_*_gone.md`");
  put("rules/local.md", "the defect is `260101-0000_*_alpha.md`");
  put("CLAUDE.md", "# project");
  return root;
}

describe("fusion-citation-check over a scratch consuming project", () => {
  it("reads the whole workbench and the project files, and reports both violations", () => {
    const root = scratchProject();
    try {
      const r = run(root);
      expect(r.status, r.stderr).toBe(0);
      const lines = r.stdout.trimEnd().split("\n");
      expect(lines.slice(0, 2)).toEqual(["anchor=workbench-root", "root=."]);
      expect(lines).toContain("files=5");
      expect(lines).toContain("store-prefixed=1");
      expect(lines).toContain("dangling=1");
      expect(lines).toContain("resolved=2");
      expect(lines).toContain("verdict=violations");
      const rows = lines.filter((l) => l.startsWith("  "));
      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatch(/^  fusion-workbench\/archive\/260102-0000-sweep\/shared\/issues\/260101-0002_c_old\.md:1  '260199-9999_\*_gone\.md'  dangling  /);
      expect(rows[1]).toMatch(/^  fusion-workbench\/shared\/issues\/260101-0000_o_alpha\.md:1  'shared\/decisions\/260101-0001_o_beta\.md'  store-prefixed  /);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("exits 2 with nothing on stdout when no workbench is above the working directory", () => {
    const dir = mkdtempSync(join(tmpdir(), "citation-check-none-"));
    try {
      const r = run(dir);
      expect(r.status).toBe(2);
      expect(r.stdout).toBe("");
      expect(r.stderr).toMatch(/no fusion workbench/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);
});

// --- the non-Markdown paths a project declares -------------------------------

/**
 * A project declaring `patterns`, with one `.go` and one `.txt` citing the same
 * record that does not exist. Tracked but never committed: `git ls-files` reads
 * the index, so `git add` is the whole of what a declaration needs to resolve.
 */
function declaringProject(patterns: string[], withGit = true): string {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "citation-declared-")));
  const put = (rel: string, text: string) => {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  };
  put("fusion-workbench/.fusion-setup", "{}");
  put("fusion.json", JSON.stringify({ citations: { extraPaths: patterns } }));
  put("src/a.go", "// see 260199-9999_*_gone.md");
  put("src/b.txt", "see 260199-9999_*_gone.md");
  if (withGit) for (const a of [["init", "-q"], ["add", "-A"]]) spawnSync("git", a, { cwd: root });
  return root;
}

describe("fusion-citation-check reads the non-Markdown paths a project declares", () => {
  it("adds the declared .go file, leaves the undeclared .txt out, and prints both figures", () => {
    const root = declaringProject(["src/*.go"]);
    try {
      const r = run(root);
      expect(r.status, r.stderr).toBe(0);
      const lines = r.stdout.trimEnd().split("\n");
      expect(lines).toContain("declared-patterns=1");
      expect(lines).toContain("declared-files=1");
      const rows = lines.filter((l) => l.startsWith("  "));
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatch(/^ {2}src\/a\.go:1 {2}'260199-9999_\*_gone\.md' {2}dangling/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("names a pattern that matched nothing on stderr, and reports the other one as before", () => {
    const root = declaringProject(["src/*.go", "nowhere/*.py"]);
    try {
      const r = run(root);
      expect(r.status, r.stderr).toBe(0);
      expect(r.stderr.trim()).toBe(
        "fusion-citation-check: declared pattern matched nothing: 'nowhere/*.py'",
      );
      expect(r.stdout).toContain("declared-patterns=2");
      expect(r.stdout).toContain("declared-files=1");
      expect(r.stdout.split("\n").filter((l) => l.startsWith("  "))).toHaveLength(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("refuses an absolute pattern and one carrying a `..` segment, before git is asked", () => {
    for (const [pattern, why] of [["/etc/*.conf", "absolute"], ["../x/*.go", "escapes"]]) {
      const root = declaringProject([pattern]);
      try {
        const r = run(root);
        expect(r.status, r.stderr).toBe(0);
        expect(r.stdout).toContain("declared-files=0");
        expect(r.stderr).toContain(`declared pattern refused: '${pattern}'`);
        expect(r.stderr).toContain(why);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
  }, CASE_TIMEOUT);

  // git unreachable, which is how `lib/git.ts` renders every way git declines:
  // an emptied PATH is deterministic where a scratch directory's own git-ness
  // is a property of whoever's machine runs the suite
  it("reads unavailable rather than a zero where git would not answer, and still exits 0", () => {
    const root = declaringProject(["src/*.go"], false);
    try {
      const r = spawnSync(process.execPath, [ENTRY], {
        cwd: root, encoding: "utf-8", env: { ...process.env, PATH: "" },
      });
      expect(r.status, r.stderr).toBe(0);
      expect(r.stdout).toContain("declared-files=unavailable");
      expect(r.stdout).toContain("declared-patterns=1");
      expect(r.stderr.trim()).toMatch(/^fusion-citation-check: declared citation paths unavailable: git would not answer/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);
});

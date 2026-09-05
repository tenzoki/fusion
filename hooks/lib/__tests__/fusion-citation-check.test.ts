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
 *
 * And since 2026-09-01 the VERDICT is scoped where the corpus is not: only a
 * row in a file somebody still edits moves it, while every row is printed
 * either way (`citation-check.ts` `## The verdict scope`). The scratch project
 * below carries one violation in an open issue and one in a swept archive
 * copy, so the two halves of that split are exercised on every run.
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
      // the verdict scope, in the block: four of the five files are edited (the
      // swept copy is not), and the two violations split one each way
      expect(lines).toContain("edited-files=4");
      expect(lines).toContain("edited-violations=1");
      expect(lines).toContain("unedited-violations=1");
      const rows = lines.filter((l) => l.startsWith("  "));
      expect(rows).toHaveLength(2);
      expect(rows[0]).toMatch(/^  fusion-workbench\/archive\/260102-0000-sweep\/shared\/issues\/260101-0002_c_old\.md:1  '260199-9999_\*_gone\.md'  dangling  not-edited  /);
      expect(rows[1]).toMatch(/^  fusion-workbench\/shared\/issues\/260101-0000_o_alpha\.md:1  'shared\/decisions\/260101-0001_o_beta\.md'  store-prefixed  edited  /);
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

// --- the verdict scope -------------------------------------------------------

/**
 * One issue carrying `marker`, with one citation that resolves to nothing, and
 * nothing else. The same file under two markers is the whole experiment: the
 * corpus, the row and the counts are identical, and only `verdict=` differs.
 */
function oneIssue(marker: string): string {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "citation-scope-")));
  mkdirSync(join(root, "fusion-workbench/shared/issues"), { recursive: true });
  writeFileSync(join(root, "fusion-workbench/.fusion-setup"), "{}");
  writeFileSync(
    join(root, `fusion-workbench/shared/issues/260101-0000_${marker}_x.md`),
    "cites `260199-9999_*_gone.md`\n",
  );
  return root;
}

describe("fusion-citation-check scopes the verdict to the files somebody still edits", () => {
  it("moves the verdict on an open record and not on a closed one, printing the row either way", () => {
    const seen: Record<string, string[]> = {};
    for (const marker of ["o", "c"]) {
      const root = oneIssue(marker);
      try {
        const r = run(root);
        expect(r.status, r.stderr).toBe(0);
        seen[marker] = r.stdout.trimEnd().split("\n");
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    }
    // The row is printed under both markers — the scope narrows the verdict and
    // never the search, which is the constraint the answering decision names
    // first. Only the scope column and the three scope figures differ.
    for (const marker of ["o", "c"]) {
      const rows = seen[marker].filter((l) => l.startsWith("  "));
      expect(rows, marker).toHaveLength(1);
      expect(rows[0], marker).toContain(`260101-0000_${marker}_x.md:1`);
      expect(seen[marker], marker).toContain("dangling=1");
    }
    expect(seen.o).toContain("verdict=violations");
    expect(seen.o).toContain("edited-files=1");
    expect(seen.o).toContain("edited-violations=1");
    expect(seen.o).toContain("unedited-violations=0");
    expect(seen.o.filter((l) => l.startsWith("  "))[0]).toContain("  dangling  edited  ");

    expect(seen.c).toContain("verdict=clean");
    expect(seen.c).toContain("edited-files=0");
    expect(seen.c).toContain("edited-violations=0");
    expect(seen.c).toContain("unedited-violations=1");
    expect(seen.c.filter((l) => l.startsWith("  "))[0]).toContain("  dangling  not-edited  ");
  }, CASE_TIMEOUT);

  it("keeps a project file in scope, where no marker exists and every file is live", () => {
    // The third part of the scope, and the one no marker predicate can decide:
    // `rules/*.md` is judged live by construction, so a dead citation there
    // moves the verdict even though the workbench half is empty of live records.
    const root = oneIssue("c");
    try {
      mkdirSync(join(root, "rules"), { recursive: true });
      writeFileSync(join(root, "rules/local.md"), "see `260199-9999_*_gone.md`\n");
      const lines = run(root).stdout.trimEnd().split("\n");
      expect(lines).toContain("dangling=2");
      expect(lines).toContain("edited-files=1");
      expect(lines).toContain("edited-violations=1");
      expect(lines).toContain("unedited-violations=1");
      expect(lines).toContain("verdict=violations");
    } finally {
      rmSync(root, { recursive: true, force: true });
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

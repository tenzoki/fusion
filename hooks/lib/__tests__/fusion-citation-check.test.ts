/**
 * `bin/fusion-citation-check`'s entry, spawned over a scratch consuming project:
 * the corpus is the live workbench plus the project's own normative files and
 * nothing frozen; a store-prefixed token is a violation named by file and line;
 * the verdict is stdout and the exit stays 0; outside a workbench, exit 2.
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
  it("reads the live workbench and the project files, and reports the store-prefixed token", () => {
    const root = scratchProject();
    try {
      const r = run(root);
      expect(r.status, r.stderr).toBe(0);
      const lines = r.stdout.trimEnd().split("\n");
      expect(lines.slice(0, 2)).toEqual(["anchor=workbench-root", "root=."]);
      expect(lines).toContain("files=4");
      expect(lines).toContain("store-prefixed=1");
      expect(lines).toContain("dangling=0");
      expect(lines).toContain("resolved=2");
      expect(lines).toContain("verdict=violations");
      const rows = lines.filter((l) => l.startsWith("  "));
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatch(/^  fusion-workbench\/shared\/issues\/260101-0000_o_alpha\.md:1  'shared\/decisions\/260101-0001_o_beta\.md'  store-prefixed  /);
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

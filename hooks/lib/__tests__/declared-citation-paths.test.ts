/**
 * `declaredCitationFiles()`'s sixth outcome: git names a declared pattern's
 * files and the work tree does not hold them. It was a bare `continue` until
 * 2026-09-05, so the declared corpus went unread behind a `declared-files=0`
 * indistinguishable from a pattern that matched nothing. A count that could not
 * be taken is not a count of none, and these cases pin the note that says so.
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { declaredCitationFiles, declaredCitationNotes } from "../citation-scan.js";

/** A git repo with `src/a.go` and `src/b.go` in the index and in the work tree. */
function repo(): string {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "declared-")));
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "src", "a.go"), "x\n");
  writeFileSync(join(root, "src", "b.go"), "x\n");
  spawnSync("git", ["init", "-q"], { cwd: root });
  spawnSync("git", ["add", "-A"], { cwd: root });
  return root;
}

describe("a declared pattern whose index entry has no work-tree file is named", () => {
  const call = (root: string) => declaredCitationFiles(root, ["src/*.go"]);

  it("says nothing when every file git names is on disk", () => {
    const root = repo();
    try {
      const d = call(root);
      expect(d.files.map((f) => f.rel)).toEqual(["src/a.go", "src/b.go"]);
      expect(d.missing).toEqual([]);
      expect(declaredCitationNotes(d)).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("reads the files that are there and names the one that is not", () => {
    const root = repo();
    try {
      rmSync(join(root, "src", "a.go"));
      const d = call(root);
      expect(d.files.map((f) => f.rel)).toEqual(["src/b.go"]);
      expect(d.missing).toEqual([{ pattern: "src/*.go", paths: ["src/a.go"], named: 2 }]);
      expect(declaredCitationNotes(d)).toEqual([
        "declared pattern names 1 of 2 file(s) the work tree does not hold, " +
          "so they were not read: 'src/*.go' (src/a.go)",
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("never reports a whole pattern's silent drop as a taken count of none", () => {
    const root = repo();
    try {
      rmSync(join(root, "src"), { recursive: true });
      const d = call(root);
      expect(d.files).toEqual([]);
      expect(d.unmatched).toEqual([]); // git answered: this is not a pattern that matched nothing
      expect(declaredCitationNotes(d)).toHaveLength(1);
      expect(declaredCitationNotes(d)[0]).toContain("2 of 2");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

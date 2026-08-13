import { describe, it, expect, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// `/fusion:circle-stash` must not sweep away the stash directory it just wrote.
//
// The defect (shared/issues/260717-0030_*_git-stash-include-untracked-can-sweep-
// the-stash-directory.md): step 7.0/7.4 writes the stash directory, and the git
// push that follows ran `git stash push --include-untracked` with no pathspec.
// Wherever the workbench is not gitignored, the freshly written
// `stashes/<id>/` is untracked, so `--include-untracked` swept it into the git
// stash and the rescue tool destroyed the artifact it exists to produce.
//
// The decision at the human gate was the prior question, not the patch: the
// workbench is excluded from the git stash entirely, because circle-stash
// already captures by copy everything it needs from it. The git stash's job is
// the user's uncommitted SOURCE changes.
//
// This test does not restate the fix — it EXTRACTS the first ```bash block
// after Step 7.6's heading in the skill body and runs it against throwaway
// repositories, one per workbench configuration. A regression in the skill's
// own text fails here.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const skillPath = join(pluginRoot, "skills", "circle-stash", "SKILL.md");

/**
 * The first ```bash block after the given heading prefix in the skill body.
 *
 * "First" is a coupling the skill body has to honour, not an incidental choice:
 * Step 7.6 has to stay ONE bash block. Split it and everything after the first
 * closing fence is silently dropped here, so the four configuration cases run a
 * truncated script and fail on assertions that look unrelated to the split.
 */
function extractBashBlock(md: string, headingPrefix: string): string {
  const lines = md.split("\n");
  const at = lines.findIndex((l) => l.startsWith(headingPrefix));
  if (at < 0) throw new Error(`heading not found in SKILL.md: ${headingPrefix}`);
  const open = lines.findIndex((l, i) => i > at && l.trim() === "```bash");
  if (open < 0) throw new Error(`no bash block after: ${headingPrefix}`);
  const close = lines.findIndex((l, i) => i > open && l.trim() === "```");
  if (close < 0) throw new Error(`unterminated bash block after: ${headingPrefix}`);
  return lines.slice(open + 1, close).join("\n");
}

function git(cwd: string, ...args: string[]) {
  const r = spawnSync("git", args, { cwd, encoding: "utf-8" });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

type Config = "untracked" | "tracked" | "ignored" | "mixed";

/**
 * A throwaway project in the given workbench configuration, in the state
 * circle-stash is in when it reaches Step 7.6: the stash directory is written,
 * the Circle has been moved into it, and the user has uncommitted source work
 * (one modified tracked file, one untracked file).
 */
function makeProject(config: Config): { projectRoot: string; workbench: string; stashDir: string } {
  const projectRoot = mkdtempSync(join(tmpdir(), `fusion-stash-${config}-`));
  const workbench = join(projectRoot, "fusion-workbench");
  mkdirSync(workbench, { recursive: true });

  git(projectRoot, "init", "-q", "-b", "main");
  git(projectRoot, "config", "user.email", "test@example.invalid");
  git(projectRoot, "config", "user.name", "test");

  writeFileSync(join(projectRoot, "src.txt"), "committed\n");
  writeFileSync(join(workbench, "orchestrator-events.jsonl"), "{}\n");
  writeFileSync(join(workbench, "orchestrator-live.md"), "live\n");

  if (config === "ignored") {
    writeFileSync(join(projectRoot, ".gitignore"), "fusion-workbench/\n");
  } else if (config === "mixed") {
    // the split this repository applies: records tracked, live state ignored
    writeFileSync(join(projectRoot, ".gitignore"), "fusion-workbench/orchestrator-live.md\n");
  }

  git(projectRoot, "add", "-A");
  if (config === "untracked") git(projectRoot, "rm", "-r", "--cached", "-q", "fusion-workbench");
  git(projectRoot, "commit", "-qm", "base");

  // uncommitted source work — this is what the git stash is for
  writeFileSync(join(projectRoot, "src.txt"), "uncommitted-source-change\n");
  writeFileSync(join(projectRoot, "new-src.txt"), "untracked-source-file\n");
  // a workbench file the session touched
  writeFileSync(join(workbench, "orchestrator-events.jsonl"), "{}\n{\"event\":\"appended\"}\n");

  // what steps 7.0–7.4 wrote: the stash directory and the moved Circle
  const stashDir = join(workbench, "stashes", "260810-1200-demo");
  mkdirSync(join(stashDir, "circle"), { recursive: true });
  mkdirSync(join(stashDir, "git"), { recursive: true });
  writeFileSync(join(stashDir, "circle", "_t_circle.md"), "# the Circle record\n");
  writeFileSync(join(stashDir, "manifest.yaml"), "stash_id: 260810-1200-demo\n");

  return { projectRoot, workbench, stashDir };
}

/** Run the extracted Step 7.6 block with the variables the skill holds by then. */
function runStep76(block: string, p: { projectRoot: string; workbench: string; stashDir: string }) {
  const preamble = [
    "set -u",
    `WORKBENCH=${JSON.stringify(p.workbench)}`,
    `PROJECT_ROOT=${JSON.stringify(p.projectRoot)}`,
    `STASH_DIR=${JSON.stringify(p.stashDir)}`,
    'WB_NAME="$(basename "$WORKBENCH")"',
    'STASH_ID="260810-1200-demo"',
    "",
  ].join("\n");
  const r = spawnSync("bash", ["-c", preamble + block], { cwd: p.projectRoot, encoding: "utf-8" });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

let step76 = "";
let step1 = "";

beforeAll(() => {
  const md = readFileSync(skillPath, "utf-8");
  step76 = extractBashBlock(md, "### 7.6");
  step1 = md;
});

describe("circle-stash Step 7.6 — the workbench never travels in the git stash", () => {
  it("Step 1 derives WB_NAME, which Step 7.6 depends on", () => {
    expect(step1).toMatch(/WB_NAME="\$\(basename "\$WORKBENCH"\)"/);
  });

  it("the pathspec is derived, not written out as a literal", () => {
    // `$WB_NAME` rather than the directory's name in the text: the workbench
    // directory is named in exactly one place, Step 1's basename call.
    expect(step76).toContain(':(exclude)$WB_NAME');
    expect(step76).not.toMatch(/exclude\)fusion-workbench/);
  });

  const configs: Config[] = ["untracked", "tracked", "ignored", "mixed"];

  for (const config of configs) {
    describe(`workbench ${config}`, () => {
      it("keeps the stash directory, captures the source changes, frees the tree", () => {
        const p = makeProject(config);
        try {
          const run = runStep76(step76, p);
          expect(run.status, `Step 7.6 exited ${run.status}: ${run.stderr}`).toBe(0);

          // 1. the artifact the skill exists to produce is still there
          expect(existsSync(join(p.stashDir, "manifest.yaml"))).toBe(true);
          expect(existsSync(join(p.stashDir, "circle", "_t_circle.md"))).toBe(true);
          expect(readFileSync(join(p.stashDir, "circle", "_t_circle.md"), "utf-8")).toContain("Circle record");

          // 2. a stash entry exists and holds the user's source changes
          const list = git(p.projectRoot, "stash", "list").stdout.trim();
          expect(list).toContain("fusion:circle-stash 260810-1200-demo");
          const shown = git(p.projectRoot, "stash", "show", "-p", "--include-untracked", "stash@{0}").stdout;
          expect(shown).toContain("uncommitted-source-change");
          expect(shown).toContain("untracked-source-file");

          // 3. the working tree is actually freed — the point of stashing
          expect(readFileSync(join(p.projectRoot, "src.txt"), "utf-8")).toBe("committed\n");
          expect(existsSync(join(p.projectRoot, "new-src.txt"))).toBe(false);

          // 4. the workbench did not travel: its files are untouched, and the
          //    stash entry carries nothing from it
          expect(readFileSync(join(p.workbench, "orchestrator-events.jsonl"), "utf-8")).toContain("appended");
          expect(shown).not.toContain("fusion-workbench");

          // 5. the skill's own detection of "did a stash entry get created"
          //    still works — it compares stack depth, and the block sets the
          //    manifest fields from it
          expect(readFileSync(join(p.stashDir, "git", "stash-ref"), "utf-8")).toMatch(/^stash@\{0\}/);
        } finally {
          rmSync(p.projectRoot, { recursive: true, force: true });
        }
      });
    });
  }

  it("the unbranched pathspec form is what makes the branch necessary (ignored workbench)", () => {
    // The reason Step 7.6 branches instead of always passing the pathspec:
    // `git stash push --include-untracked <pathspec>` runs a bare
    // `git add -- <pathspec>` internally to clear the paths it saved — not
    // `git add --all`; the `-u` form is the one git uses *without*
    // `--include-untracked`. That `git add` refuses a pathspec naming an
    // ignored path, negative pathspecs included, and a gitignored workbench is
    // exactly such a path.
    //
    // The skill's probe spells it `--all`, and that it answers the same
    // question holds only under the current flag. Measured on an ignored
    // workbench against `':/' ":(exclude)$WB_NAME"`: `git add -n --all` exits 1
    // and the bare `git add -n` exits 1 — probe and internal command agree —
    // while `git add -n -u` on that same pathspec exits 0. That third spelling
    // is the single case where the three disagree, so the probe tracks git only
    // for as long as this command passes `--include-untracked`.
    //
    // Measured here so the branch is never "simplified" away.
    const p = makeProject("ignored");
    try {
      const r = spawnSync(
        "git",
        ["stash", "push", "--include-untracked", "-m", "naive", "--", ":/", ":(exclude)fusion-workbench"],
        // `LC_ALL=C` so git emits its English diagnostics. The assertion below
        // is the half of this test that pins the *reason* for the refusal
        // rather than merely its exit code, and git translates that reason:
        // measured on a `de_DE.UTF-8` machine, the same refusal reads "Die
        // folgenden Pfade werden durch eine Ihrer \".gitignore\" Dateien
        // ignoriert". `LC_ALL` outranks `LANG` and every other `LC_*`, so this
        // holds whatever the developer's environment declares.
        { cwd: p.projectRoot, encoding: "utf-8", env: { ...process.env, LC_ALL: "C" } },
      );
      expect(r.status).not.toBe(0);
      expect(r.stderr + r.stdout).toMatch(/ignored by one of your \.gitignore files/);
      // and the shape of the failure: git creates an entry and still leaves the
      // working tree unchanged. The stack depth alone reads that as a save, so
      // it is `PUSH_RC` that catches it — Step 7.6 captures the exit code and
      // takes its failure branch rather than continuing.
      expect(readFileSync(join(p.projectRoot, "src.txt"), "utf-8")).toBe("uncommitted-source-change\n");
    } finally {
      rmSync(p.projectRoot, { recursive: true, force: true });
    }
  });

  it("the old unpathspec'd command is what swept the stash directory (tracked workbench)", () => {
    // The defect, driven rather than described. This is the configuration this
    // repository is in.
    const p = makeProject("tracked");
    try {
      const r = spawnSync("git", ["stash", "push", "--include-untracked", "-m", "old"], {
        cwd: p.projectRoot,
        encoding: "utf-8",
      });
      expect(r.status).toBe(0);
      expect(existsSync(join(p.stashDir, "manifest.yaml"))).toBe(false);
      expect(existsSync(join(p.stashDir, "circle", "_t_circle.md"))).toBe(false);
    } finally {
      rmSync(p.projectRoot, { recursive: true, force: true });
    }
  });
});

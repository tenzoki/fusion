/**
 * `bin/fusion-citation-sweep`'s entry, spawned over scratch workbenches and,
 * once, over this repository's own tree: the rewrite table, the repair pass,
 * the idempotency that blocks a release (a swept tree dry-runs to
 * `rewrites=0`), and the three guards on a writing mode (decision
 * `260829-1623_*_does-fusion-ship-the-citation-sweep-or-only-the-checker-and-under-which-guards.md`,
 * option 2).
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { TEST_DIST, REPO_ROOT, CASE_TIMEOUT } from "./helpers/guard-harness.js";

const ENTRY = join(TEST_DIST, "citation-sweep.js");

function sweep(cwd: string, wb: string, ...args: string[]) {
  return spawnSync(process.execPath, [ENTRY, "--root", wb, ...args], { cwd, encoding: "utf-8" });
}

/** A scratch workbench at `<dir>/fusion-workbench` with five indexed records. */
function scratchAt(dir: string): string {
  const wb = join(dir, "fusion-workbench");
  for (const d of ["shared/issues", "shared/history", "shared/analyses", "shared/decisions"]) {
    mkdirSync(join(wb, d), { recursive: true });
  }
  writeFileSync(join(wb, ".fusion-setup"), "{}");
  writeFileSync(join(wb, "shared/issues/260101-0101_o_alpha.md"), "x");
  writeFileSync(join(wb, "shared/analyses/260101-0101-alpha-analysis.md"), "x");
  writeFileSync(join(wb, "shared/history/260202-0202-beta-log.md"), "x");
  // the legacy word-marked history shape, 24 of which the tree holds
  writeFileSync(join(wb, "shared/history/260303-0303_coder_gamma-step.md"), "x");
  writeFileSync(join(wb, "shared/decisions/260404-0404_a_delta.md"), "x");
  return wb;
}

function scratch(): string {
  return scratchAt(realpathSync(mkdtempSync(join(tmpdir(), "sweep-"))));
}

const last = (r: { stdout: string }) => r.stdout.trim().split("\n").at(-1);

/** One store-prefixed citation, the shape every writing-mode case needs. */
const DIRTY_DOC = "see `shared/issues/260101-0101_o_alpha.md`";

describe("citation-sweep rewrites through the scanner's own token walk", () => {
  it("rewrites the store-prefixed and literal-marker tokens, lists every bare stamp, and never expands one", () => {
    const wb = scratch();
    const doc = join(wb, "shared/decisions/260303-0303_o_doc.md");
    const before = [
      "```", "grep shared/issues/260101-0101_o_alpha.md", "```",
      "> quoted shared/issues/260101-0101_o_alpha.md",
      "see `shared/issues/260101-0101_o_alpha.md` and `260101-0101_o_alpha.md`",
      "the 260202-0202 log; the 260101-0101 stamp is shared by two",
    ];
    writeFileSync(doc, before.join("\n"));
    // no git here: the guards are exercised below, and the scratch tree is not a repo
    const run = sweep(wb, wb, "--dry-run");
    const out = run.stdout.trim().split("\n");
    rmSync(wb, { recursive: true, force: true });
    expect(run.status, run.stderr).toBe(0);
    expect(out[0]).toBe("shared/decisions/260303-0303_o_doc.md  rewrites=2");
    expect(out[1]).toMatch(/^shared\/decisions\/260303-0303_o_doc\.md:6 {2}'260202-0202' {2}resolved$/);
    expect(out[2]).toMatch(/^shared\/decisions\/260303-0303_o_doc\.md:6 {2}'260101-0101' {2}ambiguous$/);
    expect(out[3]).toBe("files=1 rewrites=2 residual=2 record=1 circle-record=0 circle-dir=0 bare-record=1 stamp-bare=0 mode=dry-run");
  }, CASE_TIMEOUT);

  it("a truncated citation, a head-field date and a word-marked filename are each one token and never chained", () => {
    const wb = scratch();
    const doc = join(wb, "shared/history/260505-0505-coder-log.md");
    const before = [
      "**Date:** 260505-0505",
      "**Started:** 260202-0202",
      "three truncated shapes: `260404-0404_o_`, `260404-0404_*_` and `260404-0404_d`",
      "the word-marked file `260303-0303_coder_gamma-step.md` and its stamp 260303-0303",
      "an ellipsis cut `260404-0404_…` and a glob `260404-0404_o_*`",
    ];
    writeFileSync(doc, before.join("\n"));
    const dry = sweep(wb, wb, "--dry-run");
    rmSync(wb, { recursive: true, force: true });
    expect(dry.status, dry.stderr).toBe(0);
    expect(dry.stdout).not.toMatch(/'260505-0505'|'260202-0202'/);
    expect(last(dry)).toBe(
      "files=1 rewrites=1 residual=1 record=0 circle-record=0 circle-dir=0 bare-record=1 stamp-bare=0 mode=dry-run",
    );
  }, CASE_TIMEOUT);

  it("exits 2 with nothing on stdout when --root names no workbench", () => {
    const dir = mkdtempSync(join(tmpdir(), "sweep-none-"));
    try {
      const r = sweep(dir, dir);
      expect(r.status).toBe(2);
      expect(r.stdout).toBe("");
      expect(r.stderr).toMatch(/no workbench/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);
});

// --- writing modes: a scratch git repository per case ------------------------

function git(cwd: string, ...args: string[]) {
  const r = spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...args], {
    cwd, encoding: "utf-8",
  });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout;
}

/** A scratch repo whose workbench is committed, plus one dirty record inside it, committed too. */
function scratchRepo(): { root: string; wb: string; doc: string } {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "sweep-repo-")));
  git(root, "init", "-q");
  const wb = scratchAt(root);
  const doc = join(wb, "shared/decisions/260303-0303_o_doc.md");
  writeFileSync(doc, DIRTY_DOC);
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", "workbench");
  return { root, wb, doc };
}

describe("citation-sweep --write: the two mechanical guards, then the write, then idempotency", () => {
  it("writes on a clean tracked tree with --yes, and the swept tree dry-runs to rewrites=0", () => {
    const { root, wb, doc } = scratchRepo();
    try {
      const run = sweep(root, wb, "--write", "--yes");
      expect(run.status, run.stderr).toBe(0);
      expect(readFileSync(doc, "utf-8")).toBe("see `260101-0101_*_alpha.md`");
      expect(last(run)).toBe("files=1 rewrites=1 residual=0 record=1 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0 mode=write");
      const again = sweep(root, wb, "--dry-run");
      expect(again.status).toBe(0);
      expect(last(again)).toBe("files=0 rewrites=0 residual=0 record=0 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0 mode=dry-run");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("without --yes prints the census, writes nothing, and exits 5", () => {
    const { root, wb, doc } = scratchRepo();
    try {
      const run = sweep(root, wb, "--write");
      expect(run.status).toBe(5);
      expect(readFileSync(doc, "utf-8")).toBe(DIRTY_DOC);
      expect(run.stdout.trim().split("\n")[0]).toBe("fusion-workbench/shared/decisions/260303-0303_o_doc.md  rewrites=1");
      expect(last(run)).toMatch(/^files=1 rewrites=1 .* mode=dry-run$/);
      expect(run.stderr.trim()).toBe(
        "fusion-citation-sweep: refused (no --yes): the census above is what --write would change; pass --yes to write it; nothing written",
      );
      expect(git(root, "status", "--porcelain")).toBe("");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("refuses a dirty tree, before the census and without writing, exit 4", () => {
    const { root, wb, doc } = scratchRepo();
    try {
      writeFileSync(join(root, "unrelated.txt"), "in flight");
      const run = sweep(root, wb, "--write", "--yes");
      expect(run.status).toBe(4);
      expect(run.stdout).toBe("");
      expect(run.stderr.trim()).toBe(
        "fusion-citation-sweep: refused (dirty-tree): git status --porcelain lists 1 entry; commit or stash first, so the sweep is its own diff and the way back is one revert; nothing written",
      );
      expect(readFileSync(doc, "utf-8")).toBe(DIRTY_DOC);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("refuses an untracked workbench, exit 4", () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), "sweep-untracked-")));
    try {
      git(root, "init", "-q");
      writeFileSync(join(root, "README.md"), "committed");
      git(root, "add", "README.md");
      git(root, "commit", "-q", "-m", "readme");
      writeFileSync(join(root, ".gitignore"), "fusion-workbench/\n");
      git(root, "add", ".gitignore");
      git(root, "commit", "-q", "-m", "ignore the workbench");
      const wb = scratchAt(root);
      const doc = join(wb, "shared/decisions/260303-0303_o_doc.md");
      writeFileSync(doc, DIRTY_DOC);
      const run = sweep(root, wb, "--write", "--yes");
      expect(run.status).toBe(4);
      expect(run.stdout).toBe("");
      expect(run.stderr.trim()).toBe(
        "fusion-citation-sweep: refused (workbench-untracked): fusion-workbench is not tracked by git (git ls-files --error-unmatch), so a rewrite there has no way back; nothing written",
      );
      expect(readFileSync(doc, "utf-8")).toBe(DIRTY_DOC);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("refuses a workbench outside any git work tree, exit 4", () => {
    const wb = scratch();
    const doc = join(wb, "shared/decisions/260303-0303_o_doc.md");
    writeFileSync(doc, DIRTY_DOC);
    try {
      const run = sweep(wb, wb, "--write", "--yes");
      // tmpdir may itself sit under some repository on a developer machine; then
      // the tree is dirty with this very scratch, and that refusal is as good
      expect(run.status).toBe(4);
      expect(run.stdout).toBe("");
      expect(run.stderr).toMatch(/^fusion-citation-sweep: refused \((not-a-git-work-tree|dirty-tree|workbench-untracked)\): .*nothing written$/m);
      expect(readFileSync(doc, "utf-8")).toBe(DIRTY_DOC);
    } finally {
      rmSync(wb, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  it("has no bare-stamp option: --resolve-stamps is a usage error", () => {
    const { root, wb } = scratchRepo();
    try {
      const run = sweep(root, wb, "--resolve-stamps");
      expect(run.status).toBe(1);
      expect(run.stderr).toMatch(/unknown option --resolve-stamps/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);
});

describe("citation-sweep --repair undoes the retired stamp-bare rewrite, token by token", () => {
  it("restores a self-naming head field, strips every chained tail, and leaves exhibits and other files alone", () => {
    const { root, wb } = scratchRepo();
    const doc = join(wb, "shared/history/260202-0202-beta-log.md");
    const before = [
      "**Date:** 260202-0202-beta-log.md",
      "**Circle:** 260303-0303_coder_gamma-step.md",
      "chained: `260101-0101_*_alpha.md_o` `260101-0101_*_alpha.md_*_` `260101-0101_*_alpha.md_a:63`",
      "doubled: `260303-0303_coder_gamma-step.md_coder_gamma-step.md` and `260303-0303_coder_gamma-step.md_coder_…`",
      "bracket and doubled extension: `260101-0101_*_alpha.md[o]-alpha` `260101-0101_*_alpha.md.md`",
      "another file's name: `260101-0101_*_alpha.md_notes.txt`",
      "not in the index: `269999-9999_*_nothing.md_o`; whole and untouched: `260101-0101_*_alpha.md`",
      "```", "an exhibit: 260101-0101_*_alpha.md_o", "```",
      "> quoted exhibit: 260101-0101_*_alpha.md_o",
    ];
    writeFileSync(doc, before.join("\n"));
    git(root, "add", "-A");
    git(root, "commit", "-q", "-m", "damaged");
    try {
      const run = sweep(root, wb, "--repair", "--write", "--yes");
      const after = readFileSync(doc, "utf-8").split("\n");
      const again = sweep(root, wb, "--repair", "--dry-run");
      expect(run.status, run.stderr).toBe(0);
      expect(after).toEqual([
        "**Date:** 260202-0202",
        // names another record, not this one: a citation, kept
        "**Circle:** 260303-0303_coder_gamma-step.md",
        "chained: `260101-0101_*_alpha.md` `260101-0101_*_alpha.md` `260101-0101_*_alpha.md:63`",
        "doubled: `260303-0303_coder_gamma-step.md` and `260303-0303_coder_gamma-step.md`",
        "bracket and doubled extension: `260101-0101_*_alpha.md` `260101-0101_*_alpha.md`",
        "another file's name: `260101-0101_notes.txt`",
        before[6],
        before[7], before[8], before[9],
        before[10],
      ]);
      expect(last(run)).toBe("files=1 repairs=9 date-field=1 chained-tail=6 doubled=2 mode=write");
      expect(last(again)).toBe("files=0 repairs=0 date-field=0 chained-tail=0 doubled=0 mode=dry-run");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);
});

// --- the release gate: fusion's own tree is swept ----------------------------

describe("citation-sweep over fusion's own tree", () => {
  const ownRepo =
    existsSync(join(REPO_ROOT, ".claude-plugin", "plugin.json")) &&
    existsSync(join(REPO_ROOT, "fusion-workbench", ".fusion-setup"));
  const reason = ownRepo ? "" : "not run inside the fusion repository (no .claude-plugin/plugin.json or no fusion-workbench/.fusion-setup at REPO_ROOT)";

  it.skipIf(!ownRepo)(`--dry-run over this repository's workbench reports rewrites=0${reason && ` [skipped: ${reason}]`}`, () => {
    // No --root: the entry walks up from cwd like a consumer's run would.
    const run = spawnSync(process.execPath, [ENTRY, "--dry-run"], { cwd: REPO_ROOT, encoding: "utf-8" });
    expect(run.status, run.stderr).toBe(0);
    const summary = last(run) ?? "";
    expect(
      summary,
      "the committed workbench still carries a store-prefixed citation the sweep would rewrite; " +
        "the lines above the summary name each file. Fix the citation (`bin/fusion-citation-sweep --dry-run` " +
        "prints the same list), never the test: this gate is what fusion's own first sweep lacked.\n\n" +
        run.stdout.split("\n").filter((l) => / {2}rewrites=/.test(l)).join("\n"),
    ).toMatch(/^files=0 rewrites=0 /);
  }, CASE_TIMEOUT * 4);
});

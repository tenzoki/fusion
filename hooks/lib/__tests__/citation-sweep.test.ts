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
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { TEST_DIST, REPO_ROOT, CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { createScanner, GATE_KINDS, type CitationHit, type Lines } from "../citation-scan.js";

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
    // every row names the file relative to the PROJECT ROOT, not to cwd (here the workbench)
    expect(out[0]).toBe("fusion-workbench/shared/decisions/260303-0303_o_doc.md  rewrites=2");
    expect(out[1]).toMatch(/^fusion-workbench\/shared\/decisions\/260303-0303_o_doc\.md:6 {2}'260202-0202' {2}resolved$/);
    expect(out[2]).toMatch(/^fusion-workbench\/shared\/decisions\/260303-0303_o_doc\.md:6 {2}'260101-0101' {2}ambiguous$/);
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

  // issue 260901-0322_*_the-sweeps-residual-list-is-sorted-by-line-number-across-every-file-not-in-file-order.md
  it("groups the residual by file in corpus order rather than by line across the corpus", () => {
    const wb = scratch();
    const dir = join(wb, "shared/decisions");
    // the later file carries the earlier line: one flat sort by line inverts them
    writeFileSync(join(dir, "260303-0303_o_aaa.md"), "\n\n\n\nthe 260202-0202 log");
    writeFileSync(join(dir, "260303-0303_o_zzz.md"), "the 260202-0202 log");
    try {
      const run = sweep(wb, wb, "--dry-run");
      expect(run.status, run.stderr).toBe(0);
      const rows = run.stdout.trim().split("\n").filter((l) => l.includes("'260202-0202'"));
      expect(rows).toEqual([
        "fusion-workbench/shared/decisions/260303-0303_o_aaa.md:5  '260202-0202'  resolved",
        "fusion-workbench/shared/decisions/260303-0303_o_zzz.md:1  '260202-0202'  resolved",
      ]);
    } finally {
      rmSync(wb, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  // issue 260901-0324_*_the-checker-and-the-sweep-key-file-exemptions-on-two-different-spellings-of-the-same-file.md
  it("fires a file-wide exemption from any working directory, the checker's own spelling", () => {
    const wb = scratch();
    const root = dirname(wb);
    const example = join(root, "rules/decision-record-examples.md");
    mkdirSync(join(root, "rules"), { recursive: true });
    writeFileSync(example, DIRTY_DOC);
    try {
      for (const cwd of [root, wb]) {
        const run = sweep(cwd, wb, "--dry-run", example);
        expect(run.status, run.stderr).toBe(0);
        expect(last(run), `launched from ${cwd}`).toMatch(/^files=0 rewrites=0 /);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
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

  // both halves of guard (a)'s corpus question, documented in `hooks/citation-sweep.ts`
  it("passes a pending change outside the corpus and refuses one inside it, exit 4, naming that file alone", () => {
    const { root, wb, doc } = scratchRepo();
    try {
      // outside: guard (a) lets the run through, so it reaches guard (b)
      writeFileSync(join(root, "unrelated.txt"), "in flight");
      const past = sweep(root, wb, "--write");
      expect(past.status, past.stderr).toBe(5);
      expect(last(past)).toMatch(/^files=1 rewrites=1 .* mode=dry-run$/);
      // inside: refused before the census, and the unrelated entry is not named
      const edited = `${DIRTY_DOC}\nstill being written`;
      writeFileSync(doc, edited);
      const run = sweep(root, wb, "--write", "--yes");
      expect(run.status).toBe(4);
      expect(run.stdout).toBe("");
      expect(run.stderr.trim()).toBe(
        "fusion-citation-sweep: refused (dirty-tree): uncommitted changes name 1 file this run reads: " +
          "fusion-workbench/shared/decisions/260303-0303_o_doc.md; commit or stash them first, so the sweep " +
          "is its own diff and the way back is one revert; nothing written",
      );
      expect(readFileSync(doc, "utf-8")).toBe(edited);
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

  // the declared corpus, documented in `hooks/citation-sweep.ts` `## The declared corpus`
  it("sweeps a file the project declared, and guard (a) covers it with no new guard code", () => {
    const { root, wb } = scratchRepo();
    const go = join(root, "src/a.go");
    try {
      writeFileSync(join(root, "fusion.json"), JSON.stringify({ citations: { extraPaths: ["src/*.go"] } }));
      mkdirSync(join(root, "src"), { recursive: true });
      writeFileSync(go, `// ${DIRTY_DOC}`);
      git(root, "add", "-A");
      git(root, "commit", "-q", "-m", "a declared file");
      const run = sweep(root, wb, "--write", "--yes");
      expect(run.status, run.stderr).toBe(0);
      expect(readFileSync(go, "utf-8")).toBe("// see `260101-0101_*_alpha.md`");
      // the summary line is the release gate's, and the declaration never touches its shape
      expect(last(run)).toBe("files=2 rewrites=2 residual=0 record=2 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0 mode=write");
      git(root, "add", "-A");
      git(root, "commit", "-q", "-m", "swept");
      writeFileSync(go, `// ${DIRTY_DOC}`);
      const again = sweep(root, wb, "--write", "--yes");
      expect(again.status).toBe(4);
      expect(again.stderr).toMatch(/refused \(dirty-tree\): uncommitted changes name 1 file this run reads: src\/a\.go;/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, CASE_TIMEOUT);

  // guard (a)'s extra-path half: inside the work tree is not tracked by it
  it("refuses an untracked <path> argument, exit 4, and passes a tracked one", () => {
    const { root, wb } = scratchRepo();
    const kept = join(root, "kept.go");
    const ignored = join(root, "ignored.go");
    try {
      writeFileSync(join(root, ".gitignore"), "ignored.go\n");
      writeFileSync(kept, `// ${DIRTY_DOC}`);
      git(root, "add", "-A");
      git(root, "commit", "-q", "-m", "kept.go and the ignore rule");
      writeFileSync(ignored, `// ${DIRTY_DOC}`);
      const refused = sweep(root, wb, "--write", "--yes", "ignored.go");
      expect(refused.status).toBe(4);
      expect(refused.stdout).toBe("");
      expect(refused.stderr.trim()).toBe(
        "fusion-citation-sweep: refused (path-untracked): git does not track 1 path this run would rewrite: " +
          "ignored.go; commit it first, so a damaged rewrite has one revert back; nothing written",
      );
      expect(readFileSync(ignored, "utf-8")).toBe(`// ${DIRTY_DOC}`);
      // tracked: this branch lets it through, so the run reaches the write
      rmSync(ignored);
      const past = sweep(root, wb, "--write", "--yes", "kept.go");
      expect(past.status, past.stderr).toBe(0);
      expect(readFileSync(kept, "utf-8")).toBe("// see `260101-0101_*_alpha.md`");
    } finally {
      rmSync(root, { recursive: true, force: true });
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

// --- the tripwire: a rewrite never hides a token from the checker ------------

/**
 * The shapes the property is driven over. DATA, not cases: a row is how the
 * next shape enters, and a per-shape assertion beside the loop below would be
 * the thicket `rules/critical-stance.md` §2 names. The property is what catches
 * a shape nobody listed here.
 */
const SWEEP_DIR = "260801-1244-widget-bar";
const SHAPES: [label: string, dir: string, citation: string][] = [
  ["a foreign path segment before a store", "shared/decisions", "pytorch/issues/260101-0101_o_alpha.md"],
  ["a word character before a store", "shared/decisions", "myplanning/260101-0101_o_alpha.md"],
  ["a bracket-marked store-prefixed citation", "shared/decisions", "shared/issues/260519-0438[o]-loader-check.md"],
  ["a citation inside a frozen store", `archive/${SWEEP_DIR}/shared/decisions`, "shared/issues/260101-0101_o_alpha.md"],
  ["a bare Circle-directory rooting", "shared/decisions", `${SWEEP_DIR}/issues/260101-0101_o_alpha.md`],
  ["an archive rooting", "shared/decisions", `archive/${SWEEP_DIR}/shared/issues/260101-0101_o_alpha.md`],
];

/**
 * NO REWRITE MAY TURN A TOKEN THE CHECKER REPORTS INTO ONE THE CHECKER CANNOT
 * SEE. Judged is the sweep's own visibility predicate — a kind in `GATE_KINDS`
 * and a status other than `exempt` — and a token is followed by its start
 * column within its line, so one that VANISHES fails exactly as loudly as one
 * whose status becomes something nothing judges.
 *
 * That was the shape both large defects took: a token that never covered its
 * own rooting was rewritten to the storeless basename, and the splice left the
 * rooting spliced back in front of it, where no pattern can begin. Measured in
 * a scratch worktree at `cda72f71`, before the anchoring and the visibility
 * guard: five of the six rows lose their token outright, each
 * `record`/`store-prefixed` -> no token at that column; only the frozen-store
 * row holds. It is committed after those two fixes for that reason.
 */
describe("citation-sweep never rewrites a reported token out of the checker's sight", () => {
  it("every judged token still has a judged status at its own column after the sweep", () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), "sweep-prop-")));
    try {
      git(root, "init", "-q");
      const wb = scratchAt(root);
      const labelOf = new Map<string, string>();
      SHAPES.forEach(([label, dir, citation], i) => {
        const rel = `${dir}/2602${10 + i}-0101_o_case.md`;
        mkdirSync(join(wb, dir), { recursive: true });
        writeFileSync(join(wb, rel), `cite ${citation}\n`);
        labelOf.set(rel, label);
      });
      git(root, "add", "-A");
      git(root, "commit", "-q", "-m", "fixtures");
      const read = (rel: string): Lines =>
        readFileSync(join(wb, rel), "utf-8").split("\n").map((text, i) => ({ line: i + 1, text }));
      const before = new Map([...labelOf.keys()].map((rel) => [rel, read(rel)]));

      const run = sweep(root, wb, "--write", "--yes");
      expect(run.status, run.stderr).toBe(0);

      // one scanner: the sweep renamed no file, so both sides resolve against
      // the same index, and the comparison is about the text alone
      const scanner = createScanner(wb);
      const judged = (h: CitationHit) => GATE_KINDS.includes(h.kind) && h.status !== "exempt";
      const at = (h: CitationHit) => `${h.line}:${h.col}`;
      const lost: string[] = [];
      for (const [rel, label] of labelOf) {
        const now = scanner.scanCitationTokens(rel, read(rel));
        for (const h of scanner.scanCitationTokens(rel, before.get(rel)!).filter(judged)) {
          const after = now.find((x) => at(x) === at(h));
          if (after !== undefined && judged(after)) continue;
          lost.push(
            `${label}: '${h.token}' ${h.kind}/${h.status} -> ` +
              (after === undefined ? "no token at that column" : `${after.kind}/${after.status}`),
          );
        }
      }
      expect(
        lost,
        "the sweep rewrote a token the checker reports into one it cannot read back. Fix the " +
          "grammar or the rewrite guard, never this test: a violation that stops being reported " +
          "is not a violation that was repaired.",
      ).toEqual([]);
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

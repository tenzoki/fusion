// ---------------------------------------------------------------------------
// `bin/fusion-claude-md-weight` — its contract clauses, its arithmetic, and
// the only test that reads it.
//
// WHAT THIS PINS, and the two things it must never become. The helper REPORTS:
// it writes nothing and it gates nothing, so two of the assertions below are the
// inverse of the usual ones. It exits **0** on every path, misuse included, and
// it renders **no verdict about topic** — that question is not decidable from
// anything the program can read, and the mechanism was changed rather than
// approximated at
// `260916-1126_*_may-the-drift-check-report-weight-when-it-cannot-decide-topic.md`.
// An edit that makes this file expect a non-zero exit, or a topic judgement, has
// reversed that ruling rather than tightened a test.
//
// It never reads this repository's own `CLAUDE.md`. Every case builds a
// throwaway root, so the file asserts what the mechanism DOES rather than what
// this repository's file happens to weigh today — the same separation
// `plan-size.test.ts` and `plan-stopping-section-lint.test.ts` both make.
// ---------------------------------------------------------------------------

import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

const script = join(pluginRoot, "bin", "fusion-claude-md-weight");

const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/** A project root carrying `md` as its CLAUDE.md, or no CLAUDE.md when omitted. */
function scratchRoot(md?: string): string {
  const root = mkdtempSync(join(tmpdir(), "fusion-claude-md-weight-"));
  tmpRoots.push(root);
  if (md !== undefined) writeFileSync(join(root, "CLAUDE.md"), md);
  return root;
}

function run(...args: string[]) {
  const r = spawnSync(script, args, { encoding: "utf-8" });
  return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function lines(stdout: string): string[] {
  return stdout.replace(/\n$/, "").split("\n");
}

/** Two sections, the first far above any threshold these cases pass. */
const HEAVY = `# Title\npreamble\n\n## A\n${"x".repeat(5000)}\n\n## B\nshort\n`;
/** Two sections, neither anywhere near the threshold. */
const CLEAN = "# Title\n\n## A\nshort\n\n## B\nalso short\n";

describe("claude-md-weight: it reports, and never gates", () => {
  it("clause 1 — no CLAUDE.md at the root is a stated zero, never an error", () => {
    const r = run("--root", scratchRoot());

    expect(r.status, `stderr: ${r.stderr}`).toBe(0);
    expect(lines(r.stdout)).toHaveLength(1);
    expect(r.stdout).toMatch(/^claude-md=absent root=\S+ threshold=4000 writes=none$/m);
  });

  it("clause 1 — a --root that does not exist takes the same branch, not a failure one", () => {
    const r = run("--root", join(scratchRoot(), "no-such-directory"));

    expect(r.status, `stderr: ${r.stderr}`).toBe(0);
    expect(r.stdout).toContain("claude-md=absent");
  });

  it("clause 2 — exit 0 on every path, misuse included", () => {
    // A reporting check that hands its verdict to an exit code teaches its
    // reader to ignore that code, so there is no path here that does.
    expect(run("--root", scratchRoot()).status).toBe(0);
    expect(run("--root", scratchRoot(CLEAN)).status).toBe(0);
    expect(run("--root", scratchRoot(HEAVY)).status).toBe(0);
    expect(run("--help").status).toBe(0);
    expect(run("--wat").status).toBe(0);
    expect(run("--threshold", "not-a-number").status).toBe(0);
    expect(run("--root").status).toBe(0);
  });

  it("clause 2 — a misuse says so on stderr and prints no report at all", () => {
    const r = run("--wat");

    expect(r.stderr).toContain("unknown argument '--wat'");
    expect(r.stdout).toBe("");
  });

  it("clause 2 — every one of the three report shapes says writes=none", () => {
    expect(run("--root", scratchRoot()).stdout).toContain("writes=none");
    expect(run("--root", scratchRoot(CLEAN)).stdout).toContain("writes=none");
    expect(lines(run("--root", scratchRoot(HEAVY)).stdout)).toContain("writes=none");
  });

  it("clause 3 — a clean file prints exactly one line and nothing else", () => {
    const r = run("--root", scratchRoot(CLEAN));

    expect(lines(r.stdout)).toHaveLength(1);
    expect(r.stdout).toMatch(/^claude-md=clean .* over=0 writes=none$/m);
    expect(r.stderr).toBe("");
  });

  it("clause 3 — the same file at a threshold below its largest section is weighed", () => {
    // The threshold is a reporting cut-off and not a target: the same bytes read
    // clean or weighed depending only on where the cut-off is put.
    const root = scratchRoot(CLEAN);

    expect(run("--root", root).stdout).toContain("claude-md=clean");
    expect(run("--root", root, "--threshold", "5").stdout).toContain("claude-md=weighed");
  });

  it("clause 4 — the report's last line names /fusion:curate", () => {
    const out = lines(run("--root", scratchRoot(HEAVY)).stdout);

    expect(out[out.length - 1]).toContain("/fusion:curate");
  });

  it("clause 5 — it renders no verdict about topic, and says whose judgement that is", () => {
    const out = lines(run("--root", scratchRoot(HEAVY)).stdout);
    const closing = out.slice(-2);

    expect(closing[0]).toMatch(/^Topic is not decidable here: /);
    expect(closing[0]).toContain("the reader's judgement, not this helper's");
    expect(closing[1]).toMatch(/^Act on a finding with \/fusion:curate: /);
    // The rows carry sizes and the threshold mark, and no word about topic.
    expect(out.filter((l) => /^ {2}(over|under) /.test(l)).join("\n")).not.toMatch(/topic/i);
  });
});

// ---------------------------------------------------------------------------
// The division, and the figures it produces — the half this file did not reach
// until 2026-09-16. The nine cases above assert exit statuses, banner regexes
// and line counts, and NOT ONE of them reads a figure the helper computed, so
// the sort could be reversed, the under-threshold rows dropped, `heading-level=`
// deleted and the trailing-newline correction broken with all nine still green
// (issue 260916-1314, which ran each of those mutations against a copy).
//
// The fixture is stated as arithmetic rather than transcribed from a run: every
// line costs its own bytes plus its newline, so the expected rows below are
// derived and a reader can check them without running anything.
// ---------------------------------------------------------------------------

/** 11 bytes over 3 lines: `# Doc` 6, the blank line 1, `pre` 4. */
const PREAMBLE = "# Doc\n\npre\n";
/** 36 bytes over 5 lines, and the fence is the point: the `##` inside it is not
 *  a heading, so this stays ONE section instead of splitting into two. */
const SMALL = "## Small\n```\n## not a heading\n```\ns\n";
/** 48 bytes over 2 lines: `## Big` 7, then forty `y` and a newline. */
const BIG = `## Big\n${"y".repeat(40)}\n`;
/** 95 bytes over 10 lines. `#` appears once and `##` twice, so the cut is at
 *  level 2 and everything above the first `##` is the `(preamble)` row. */
const DIVIDED = PREAMBLE + SMALL + BIG;

/** The report's rows as fields — mark, bytes, lines, heading — in printed order. */
function rows(stdout: string): (string | number)[][] {
  return lines(stdout)
    .map((l) => l.match(/^ {2}(over|under) +(\d+) +(\d+) {2}(.*)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => [m[1], Number(m[2]), Number(m[3]), m[4]]);
}

describe("claude-md-weight: the division, and the figures it reports", () => {
  it("every section is a row, largest first, marked against the threshold", () => {
    // One assertion, six mutations: reversing the sort moves the rows; printing
    // only the over-threshold rows drops two; reading the fenced `##` as a
    // heading adds a fourth row and re-cuts `## Small`; cutting at the
    // shallowest level seen at all rather than the shallowest seen twice
    // collapses the file to one row; losing the preamble row drops the last;
    // and any error in the per-section arithmetic moves a figure.
    expect(rows(run("--root", scratchRoot(DIVIDED), "--threshold", "40").stdout)).toEqual([
      ["over", 48, 2, "## Big"],
      ["under", 36, 5, "## Small"],
      ["under", 11, 3, "(preamble)"],
    ]);
  });

  it("the head figures are the file itself, at the level the rows were cut at", () => {
    // 95 = 11 + 36 + 48 and 10 = 3 + 5 + 2, so this case and the one above
    // together pin what the helper's header promises and neither states alone:
    // the rows sum to the file. `headings=2` counts the two `##` and not the
    // preamble, which is why there is one more row than that number.
    const out = lines(run("--root", scratchRoot(DIVIDED), "--threshold", "40").stdout);
    const head = Object.fromEntries(out.filter((l) => /^[a-z-]+=/.test(l)).map((l) => l.split("=")));
    expect(head).toMatchObject({ bytes: "95", lines: "10", headings: "2", "heading-level": "2", over: "1" });
  });

  it("a file with no trailing newline is one byte lighter, in the row that ends it", () => {
    // The helper's most delicate arithmetic, and no other fixture reaches it:
    // the last record has no newline to count, and the correction lands on the
    // section holding that record rather than on the total alone.
    const out = run("--root", scratchRoot(DIVIDED.slice(0, -1)), "--threshold", "40").stdout;
    expect(rows(out)[0]).toEqual(["over", 47, 2, "## Big"]);
    expect(out).toContain("bytes=94");
  });

  it("a --threshold that is not a number is a misuse, and nothing is weighed under it", () => {
    // The exit-code case above cannot carry this, because every path here exits
    // 0 and the assertion holds under its own inversion. Without the digit check
    // the awk compares `$1 > "not-a-number"` as strings, every row loses, and
    // the helper reports a clean file it never weighed.
    const r = run("--root", scratchRoot(DIVIDED), "--threshold", "not-a-number");
    expect(r.stderr).toContain("--threshold takes digits");
    expect(r.stdout).toBe("");
  });
});

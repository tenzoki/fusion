// ---------------------------------------------------------------------------
// `bin/fusion-claude-md-weight` — its five contract clauses, and the only test
// that reads it.
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

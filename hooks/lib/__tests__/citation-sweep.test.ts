import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pluginRoot } from "./helpers/citation-scan.js";

// `hooks/scripts/citation-sweep.mjs` over a scratch workbench: three tokens are
// rewritten (store-prefixed, literal marker, unique bare stamp), two are left
// because the scanner exempts them (fence, blockquote), and the ambiguous bare
// stamp is listed as the one residual. The script reads the compiled grammar,
// so it runs against this test run's private build via FUSION_TEST_DIST.
describe("citation-sweep rewrites through the scanner's own token walk", () => {
  it("rewrites exactly the three tokens the grammar decides, and lists the residual", () => {
    const wb = mkdtempSync(join(tmpdir(), "sweep-"));
    for (const d of ["shared/issues", "shared/history", "shared/analyses", "shared/decisions"]) {
      mkdirSync(join(wb, d), { recursive: true });
    }
    writeFileSync(join(wb, ".fusion-setup"), "{}");
    writeFileSync(join(wb, "shared/issues/260101-0101_o_alpha.md"), "x");
    writeFileSync(join(wb, "shared/analyses/260101-0101-alpha-analysis.md"), "x");
    writeFileSync(join(wb, "shared/history/260202-0202-beta-log.md"), "x");
    const doc = join(wb, "shared/decisions/260303-0303_o_doc.md");
    const before = [
      "```", "grep shared/issues/260101-0101_o_alpha.md", "```",
      "> quoted shared/issues/260101-0101_o_alpha.md",
      "see `shared/issues/260101-0101_o_alpha.md` and `260101-0101_o_alpha.md`",
      "the 260202-0202 log; the 260101-0101 stamp is shared by two",
    ];
    writeFileSync(doc, before.join("\n"));
    const run = spawnSync("node", [join(pluginRoot, "hooks/scripts/citation-sweep.mjs"), "--root", wb, "--write"], {
      cwd: wb, encoding: "utf-8",
    });
    const after = readFileSync(doc, "utf-8").split("\n");
    rmSync(wb, { recursive: true, force: true });
    expect(run.status, run.stderr).toBe(0);
    expect(after.slice(0, 4)).toEqual(before.slice(0, 4));
    expect(after[4]).toBe("see `260101-0101_*_alpha.md` and `260101-0101_*_alpha.md`");
    expect(after[5]).toBe("the 260202-0202-beta-log.md log; the 260101-0101 stamp is shared by two");
    const out = run.stdout.trim().split("\n");
    expect(out[0]).toBe("shared/decisions/260303-0303_o_doc.md  rewrites=3");
    expect(out[1]).toMatch(/^shared\/decisions\/260303-0303_o_doc\.md:6 {2}'260101-0101' {2}ambiguous$/);
    expect(out[2]).toBe("files=1 rewrites=3 residual=1 record=1 circle-record=0 circle-dir=0 bare-record=1 stamp-bare=1 mode=write");
  });
});

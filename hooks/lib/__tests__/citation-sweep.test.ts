import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pluginRoot } from "./helpers/citation-scan.js";

// `hooks/scripts/citation-sweep.mjs` over a scratch workbench. The script reads
// the compiled grammar, so it runs against this test run's private build via
// FUSION_TEST_DIST.
function scratch(): string {
  const wb = mkdtempSync(join(tmpdir(), "sweep-"));
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

function sweep(wb: string, ...args: string[]) {
  return spawnSync("node", [join(pluginRoot, "hooks/scripts/citation-sweep.mjs"), "--root", wb, ...args], {
    cwd: wb, encoding: "utf-8",
  });
}

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
    const run = sweep(wb, "--write");
    const after = readFileSync(doc, "utf-8").split("\n");
    rmSync(wb, { recursive: true, force: true });
    expect(run.status, run.stderr).toBe(0);
    expect(after.slice(0, 4)).toEqual(before.slice(0, 4));
    expect(after[4]).toBe("see `260101-0101_*_alpha.md` and `260101-0101_*_alpha.md`");
    // a unique bare stamp used to become `260202-0202-beta-log.md`; it stays a stamp
    expect(after[5]).toBe(before[5]);
    const out = run.stdout.trim().split("\n");
    expect(out[0]).toBe("shared/decisions/260303-0303_o_doc.md  rewrites=2");
    expect(out[1]).toMatch(/^shared\/decisions\/260303-0303_o_doc\.md:6 {2}'260202-0202' {2}resolved$/);
    expect(out[2]).toMatch(/^shared\/decisions\/260303-0303_o_doc\.md:6 {2}'260101-0101' {2}ambiguous$/);
    expect(out[3]).toBe("files=1 rewrites=2 residual=2 record=1 circle-record=0 circle-dir=0 bare-record=1 stamp-bare=0 mode=write");
  });

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
    const dry = sweep(wb, "--dry-run");
    const run = sweep(wb, "--write");
    const after = readFileSync(doc, "utf-8").split("\n");
    const again = sweep(wb, "--dry-run");
    rmSync(wb, { recursive: true, force: true });
    expect(run.status, run.stderr).toBe(0);
    // the two head fields are dates, not pointers: untouched and unlisted
    expect(after.slice(0, 2)).toEqual(before.slice(0, 2));
    // the stale literal marker of a truncated citation is starred; the token is
    // rewritten whole and gains no basename
    expect(after[2]).toBe("three truncated shapes: `260404-0404_*_`, `260404-0404_*_` and `260404-0404_d`");
    expect(after.slice(3)).toEqual(before.slice(3));
    expect(dry.stdout).not.toMatch(/'260505-0505'|'260202-0202'/);
    expect(dry.stdout.trim().split("\n").at(-1)).toBe(
      "files=1 rewrites=1 residual=1 record=0 circle-record=0 circle-dir=0 bare-record=1 stamp-bare=0 mode=dry-run",
    );
    // idempotent: the swept tree offers nothing further
    expect(again.stdout.trim().split("\n").at(-1)).toMatch(/^files=0 rewrites=0 /);
  });
});

describe("citation-sweep --repair undoes the retired stamp-bare rewrite, token by token", () => {
  it("restores a self-naming head field, strips every chained tail, and leaves exhibits and other files alone", () => {
    const wb = scratch();
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
    const run = sweep(wb, "--repair", "--write");
    const after = readFileSync(doc, "utf-8").split("\n");
    const again = sweep(wb, "--repair", "--dry-run");
    rmSync(wb, { recursive: true, force: true });
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
    expect(run.stdout.trim().split("\n").at(-1)).toBe(
      "files=1 repairs=9 date-field=1 chained-tail=6 doubled=2 mode=write",
    );
    expect(again.stdout.trim().split("\n").at(-1)).toBe("files=0 repairs=0 date-field=0 chained-tail=0 doubled=0 mode=dry-run");
  });
});

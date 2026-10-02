/**
 * The archive safety filters, proven by running the skill's own text. Filter 3's
 * key matches the `_*_` citation form (`260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`);
 * filter 2 reaches a done container's records (`261002-1723_*_archive-moves-a-done-work-package-whole-and-takes-an-open-issue-inside-it-out-of-every-scan.md`).
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { extractBashBlock } from "./helpers/prompt-blocks.js";

const body = readFileSync(join(pluginRoot, "skills/archive/SKILL.md"), "utf-8");
const derivation = body.match(/key="\$\(basename "\$f" \| sed -E '[^']+'\)"/)?.[0];

const keyFor = (base: string) => spawnSync("bash", ["-c", `f=${base}; ${derivation}; printf '%s' "$key"`], { encoding: "utf-8" }).stdout;
const matches = (key: string, s: string) => spawnSync("grep", ["-q", "-E", "-e", key], { input: s, encoding: "utf-8" }).status === 0;

describe("archive filter 3: the search key matches the storeless citation form", () => {
  it("matches _*_ and any literal marker, and not a neighbouring stamp", () => {
    expect(derivation, "filter 3 no longer derives `key=` from basename via sed").toBeDefined();
    const key = keyFor("260811-1534_i_foo.md");
    expect(matches(key, "260811-1534_*_foo.md")).toBe(true);
    expect(matches(key, "260811-1534_c_foo.md")).toBe(true);
    expect(matches(key, "shared/issues/260811-1534_o_foo.md")).toBe(true);
    expect(matches(key, "260811-1535_i_foo.md")).toBe(false);
  });
  it("a markerless candidate escapes to a literal", () => {
    expect(matches(keyFor("260811-1534-coder-session.md"), "260811-1534-coder-sessionXmd")).toBe(false);
  });
});

describe("archive filter 2: the tier survey selects no container holding a live record", () => {
  it.each(["bash", "zsh"].filter((s) => spawnSync(s, ["-c", ":"]).status === 0))("under %s", (sh) => {
    const wb = mkdtempSync(join(tmpdir(), "archive-live-"));
    const pkg = (n: string, st: string, ...recs: string[]) => [[`${n}.md`, `**Status:** ${st}\n`], ...recs.map((r) => [r, ""])]
      .forEach(([f, c]) => { mkdirSync(dirname(join(wb, "work-packages", n, f)), { recursive: true }); writeFileSync(join(wb, "work-packages", n, f), c); });
    pkg("a", "done", "issues/260901-0001_o_bug.md", "issues/260901-0002_c_old.md");
    pkg("b", "done", "issues/260902-0001_c_bug.md", "decisions/260902-0002_i_q.md", "discussions/260902-0003_c_t.md");
    pkg("c", "dropped", "decisions/260903-0001_a_q.md");
    pkg("d", "done", "planning/260904-0001_p_plan.md", "discussions/260904-0002_o_t.md");
    pkg("e", "open");
    const r = spawnSync(sh, ["-c", extractBashBlock(body, "**Work packages (all tiers).**")], { encoding: "utf-8", env: { ...process.env, WORKBENCH: wb, SCAN_PACKAGES: "work-packages" } });
    rmSync(wb, { recursive: true, force: true });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout.trim().split("\n").sort()).toEqual(["done\tb", "live\ta\tissues/260901-0001_o_bug.md",
      "live\tc\tdecisions/260903-0001_a_q.md", "live\td\tdiscussions/260904-0002_o_t.md", "live\td\tplanning/260904-0001_p_plan.md"]);
  });
});

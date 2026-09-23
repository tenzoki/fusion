import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { extractBashBlock } from "./helpers/prompt-blocks.js";

// `/fusion:migrate`'s store-name pass, run as shipped: guard, survey and apply
// are lifted by heading anchor and run with a real bash on throwaway
// workbenches, so a pasted copy never stands in for the text.

const md = (s: string) => readFileSync(join(pluginRoot, "skills", s, "SKILL.md"), "utf-8");
const guard = extractBashBlock(md("migrate"), "## Step 2 — Guard and survey");
const survey = extractBashBlock(md("migrate"), "Run this second. It is read-only");
const apply = extractBashBlock(md("migrate"), "## Step 4 — Apply");
const setupProbe = extractBashBlock(md("setup"), "### Superseded-format check");
const ENV = { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };

const roots: string[] = [];
afterAll(() => { for (const d of roots) rmSync(d, { recursive: true, force: true }); });

/** A workbench under a fresh temp root; a path ending in `/` is an empty directory. */
function tree(paths: string[]): string {
  const root = mkdtempSync(join(tmpdir(), "store-name-")); roots.push(root);
  for (const p of paths) {
    const abs = join(root, "fusion-workbench", p);
    mkdirSync(p.endsWith("/") ? abs : dirname(abs), { recursive: true });
    if (!p.endsWith("/")) writeFileSync(abs, `# ${p}\n`);
  }
  return root;
}
function sh(src: string, cwd: string, env: NodeJS.ProcessEnv = ENV): string {
  const r = spawnSync("bash", ["-c", src], { cwd, encoding: "utf-8", env });
  expect(r.status, `exit ${r.status}: ${r.stderr}`).toBe(0);
  return r.stdout;
}
const basenames = (r: string) => sh("find fusion-workbench -type f | sed 's#.*/##' | sort", r);
const dirs = (r: string) => sh("find fusion-workbench -type d | sort", r);

const A = "circles/260101-0101-a", B = "circles/260101-0202-b";
const LEGACY = [`${A}/260101-0101-a.md`, `${A}/planning/260101-0102_o_plan-a.md`, `${A}/issues/`, `${B}/260101-0202-b.md`,
  `${B}/planning/`, "shared/planning/260101-0303_o_plan-s.md", "shared/consult/260101-0404-note.md",
  "shared/issues/260101-0505_o_x.md", "archive/260101-0000-sweep/circles/old/planning/p.md", ".guard-state/events.jsonl"];

describe("the survey", () => {
  it("finds nothing on a workbench already in the v12 format", () => {
    const out = sh(survey, tree(["work-packages/260101-0101-a/plans/p.md", "shared/plans/x.md", "shared/consultations/y.md", "shared/issues/z.md"]));
    for (const c of ["FOUND=0", "LEGACY=0", "UNKNOWN=0", "COLLISIONS=0"]) expect(out).toMatch(new RegExp(`^${c}$`, "m"));
  });
  it("proposes the four renames with their counts on a v11 workbench", () => {
    const out = sh(survey, tree(LEGACY));
    for (const l of ["shared/consult/ -> shared/consultations/  1 entries", "shared/planning/ -> shared/plans/  1 entries",
      `${A}/planning/ -> ${A}/plans/  1 entries`, `${B}/planning/ -> ${B}/plans/  0 entries`, "circles/ -> work-packages/  2 entries"]) expect(out).toContain(l);
    expect(out).toMatch(/^FOUND=1$/m); expect(out).toMatch(/^LEGACY=0$/m); expect(out).toMatch(/^UNKNOWN=0$/m);
  });
  it.each([["planning/260101-0101_o_x.md"], ["circles/260101-0101[t]-flat.md"], ["shared/issues/260101-0101[o]-x.md"], [`${A}/_t_circle.md`]])(
    "refuses the pre-v4 shape %s with the v11.11.1 route, and setup no longer refuses it", (p) => {
      const root = tree([p]);
      const out = sh(survey, root); expect(out).toMatch(/^LEGACY=1$/m); expect(out).toContain("tag v11.11.1");
      expect(sh(setupProbe, root)).toMatch(/^OLD=0$/m);
    });
  it("setup names a v11 store in one line and continues, and says nothing on a v12 workbench", () => {
    expect(sh(setupProbe, tree(["work-packages/", "shared/plans/", "shared/consultations/"]))).toBe("OLD=0\n");
    expect(sh(setupProbe, tree(["circles/c/c.md", "shared/consult/"]))).toMatch(/^LEGACY-STORES: circles\/ shared\/consult\/ .*\/fusion:migrate.*\nOLD=0\n$/);
  });
  it("closes the window below 12 naming both versions, and opens it at 12", () => {
    const plug = mkdtempSync(join(tmpdir(), "store-name-plugin-")); roots.push(plug); mkdirSync(join(plug, ".claude-plugin"));
    const at = (v: string) => { writeFileSync(join(plug, ".claude-plugin", "plugin.json"), `{\n  "version": "${v}"\n}\n`); return sh(guard, plug, { ...ENV, FUSION_PLUGIN_ROOT: plug }); };
    expect(at("11.10.0")).toMatch(/^WINDOW=closed$[\s\S]*11\.10\.0[\s\S]*12\.0\.0/m);
    expect(at("12.0.0")).toMatch(/^WINDOW=open$/m);
  });
});

describe("the apply", () => {
  it("renames directories only, keeps every basename and the archive, and a second run finds nothing", () => {
    const root = tree(LEGACY); const names = basenames(root); const archive = sh("find fusion-workbench/archive | sort", root);
    expect(sh(apply, root)).toMatch(/moved=\d+ mv-fallbacks=\d+ collisions=0 left=0 mode=plain$/m);
    expect(sh("find fusion-workbench -path fusion-workbench/archive -prune -o -type d \\( -name circles -o -name planning -o -name consult \\) -print", root)).toBe("");
    expect(basenames(root)).toBe(names);
    expect(sh("find fusion-workbench/archive | sort", root)).toBe(archive);
    expect(dirs(root)).toContain("fusion-workbench/work-packages/260101-0202-b/plans\n");
    expect(sh(apply, root)).toMatch(/^moved=0 /m);
    expect(sh(survey, root)).toMatch(/^FOUND=0$/m);
  });
  it("refuses a colliding container and moves everything else", () => {
    const root = tree([...LEGACY, "work-packages/260101-0101-a/other.md"]);
    expect(sh(survey, root)).toContain("COLLISION: work-packages/260101-0101-a exists; circles/260101-0101-a stays");
    expect(sh(apply, root)).toMatch(/collisions=1 /);
    expect(readdirSync(join(root, "fusion-workbench", "circles"))).toEqual(["260101-0101-a"]);
    expect(dirs(root)).toContain("fusion-workbench/work-packages/260101-0202-b\n");
  });
  it("resumes after an interruption to the same end state", () => {
    const whole = tree(LEGACY); sh(apply, whole);
    const cut = tree(LEGACY); mkdirSync(join(cut, "fusion-workbench", "work-packages"));
    renameSync(join(cut, "fusion-workbench", B), join(cut, "fusion-workbench", "work-packages", "260101-0202-b"));
    sh(apply, cut); expect(dirs(cut)).toBe(dirs(whole)); expect(basenames(cut)).toBe(basenames(whole));
  });
  it("in git mode stages renames only, and refuses a dirty source", () => {
    const git = (r: string) => sh("git init -q && git add -A && git -c user.name=t -c user.email=t@t commit -qm x", r);
    const root = tree(LEGACY); git(root);
    expect(sh(apply, root)).toMatch(/mode=git$/m);
    expect(sh("git status --porcelain", root).trim().split("\n").filter((l) => !l.startsWith("R "))).toEqual([]);
    const dirty = tree(LEGACY); git(dirty); writeFileSync(join(dirty, "fusion-workbench", B, "260101-0202-b.md"), "changed\n");
    const out = sh(survey, dirty);
    expect(out).toMatch(/^DIRTY=1$/m); expect(out).toContain(`DIRTY: fusion-workbench/${B}/260101-0202-b.md`);
  });
});

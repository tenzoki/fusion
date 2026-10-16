import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { extractBashBlock } from "./helpers/prompt-blocks.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { jsonWorkbenchAt } from "./helpers/json-workbench.js";

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
const git = (r: string) => sh("git init -q && git add -A && git -c user.name=t -c user.email=t@t commit -qm x", r);

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
  it("decides UNKNOWN by layout: prose naming circles/ passes, a store directory stops (issue 260928-1832)", () => {
    const root = tree([...LEGACY, "shared/x/"]); for (const f of ["tasklist.md", "shared/x/notes.md"]) writeFileSync(join(root, "fusion-workbench", f), "see circles/a\n"); git(root);
    expect(sh(survey, root)).toMatch(/^FOUND=1\nLEGACY=0\n(.*\n){3}DIRTY=0\nUNKNOWN=0$/m); expect(sh(survey, tree(["shared/x/planning/"]))).toMatch(/^UNKNOWN=1$/m);
  });
  it.each([["planning/260101-0101_o_x.md"], ["circles/260101-0101[t]-flat.md"], ["shared/issues/260101-0101[o]-x.md"], [`${A}/_t_circle.md`]])(
    "refuses the pre-v4 shape %s with the v11.11.1 route, and setup refuses it only for a v11 store name", (p) => {
      const root = tree([p]);
      const out = sh(survey, root); expect(out).toMatch(/^LEGACY=1$/m); expect(out).toContain("tag v11.11.1");
      expect(sh(setupProbe, root)).toMatch(p.startsWith("circles/") ? /^OLD=1$/m : /^OLD=0$/m);
    });
  it("setup refuses a v11 store in one line naming /fusion:migrate, and says nothing on a v12 workbench", () => {
    expect(sh(setupProbe, tree(["work-packages/", "shared/plans/", "shared/consultations/"]))).toBe("OLD=0\n");
    expect(sh(setupProbe, tree(["circles/c/c.md", "shared/consult/"]))).toMatch(/^LEGACY-STORES: circles\/ shared\/consult\/ .*\/fusion:migrate.*\nOLD=1\n$/);
  });
  it("refuses below 12 naming both versions, and reads the v12 names from 12 on", () => {
    const plug = mkdtempSync(join(tmpdir(), "store-name-plugin-")); roots.push(plug); mkdirSync(join(plug, ".claude-plugin"));
    const at = (v: string) => { writeFileSync(join(plug, ".claude-plugin", "plugin.json"), `{\n  "version": "${v}"\n}\n`); return sh(guard, plug, { ...ENV, FUSION_PLUGIN_ROOT: plug }); };
    expect(at("11.10.0")).toMatch(/^READS_V12=no$[\s\S]*11\.10\.0[\s\S]*12\.0\.0/m);
    expect(at("12.0.0")).toMatch(/^READS_V12=yes$/m);
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
  it("folds a container present under both roots file by file with git mv, planning/ included", () => {
    const W = "work-packages/260101-0101-a", root = tree([...LEGACY, `${W}/other.md`, `${W}/plans/260101-0103_o_plan-b.md`, `${W}/issues/260101-0104_o_i.md`]); git(root);
    expect(sh(survey, root)).toMatch(/^COLLISIONS=0$/m); expect(sh(apply, root)).toMatch(/collisions=0 left=0 mode=git$/m);
    expect(sh(`find fusion-workbench/${W} -type f | sort`, root)).toBe(["260101-0101-a.md", "issues/260101-0104_o_i.md", "other.md", "plans/260101-0102_o_plan-a.md", "plans/260101-0103_o_plan-b.md"].map((f) => `fusion-workbench/${W}/${f}\n`).join(""));
    expect(sh("git status --porcelain", root).trim().split("\n").filter((l) => !l.startsWith("R "))).toEqual([]); expect(sh(survey, root)).toMatch(/^FOUND=0$/m);
  });
  it("refuses a file path under both roots, leaving both sides, and moves everything else", () => {
    const f = "260101-0101-a/260101-0101-a.md", root = tree([...LEGACY, `work-packages/${f}`]);
    expect(sh(survey, root)).toContain(`COLLISION: work-packages/${f} exists; circles/${f} stays`); expect(sh(apply, root)).toMatch(/collisions=1 /);
    expect(sh("find fusion-workbench/circles -type f", root)).toBe(`fusion-workbench/circles/${f}\n`);
    expect(readFileSync(join(root, "fusion-workbench", "work-packages", f), "utf-8")).toBe(`# work-packages/${f}\n`);
    expect(dirs(root)).toContain("fusion-workbench/work-packages/260101-0202-b/plans\n");
  });
  it("resumes after an interruption to the same end state", () => {
    const whole = tree(LEGACY); sh(apply, whole);
    const cut = tree(LEGACY); mkdirSync(join(cut, "fusion-workbench", "work-packages"));
    renameSync(join(cut, "fusion-workbench", B), join(cut, "fusion-workbench", "work-packages", "260101-0202-b"));
    sh(apply, cut); expect(dirs(cut)).toBe(dirs(whole)); expect(basenames(cut)).toBe(basenames(whole));
  });
  it("in git mode refuses a dirty source (staging renames only is the fold test's)", () => {
    const dirty = tree(LEGACY); git(dirty); writeFileSync(join(dirty, "fusion-workbench", B, "260101-0202-b.md"), "changed\n");
    const out = sh(survey, dirty);
    expect(out).toMatch(/^DIRTY=1$/m); expect(out).toContain(`DIRTY: fusion-workbench/${B}/260101-0202-b.md`);
  });
});

// Issue 261014-0830_*_migrate-step-6-runs-the-citation-sweep-write-on-a-tree-its-own-guard-refuses.md:
// Step 6's write, run as the current text spells it, over the tree the shipped survey and apply leave.
const step6 = md("migrate").split("## Step 6")[1].split("## Step 7")[0];
const step6Block = extractBashBlock(md("migrate"), "## Step 6 — Sweep the citations");
// No SWEEP or K reaches a command from the environment: shell variables do not outlive the call that set them.
const FRESH_ENV = { PATH: process.env.PATH, HOME: process.env.HOME, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1", FUSION_PLUGIN_ROOT: pluginRoot };
const PR = `${A}/260101-0101-a.md`, REC = "shared/issues/260101-0505_o_x.md";
const CITING = { [REC]: `see \`${PR}\`\n`, [PR]: "see `shared/planning/260101-0303_o_plan-s.md`\n" };
/** A cited v11 workbench through the shipped survey and apply, in git (committed before the apply) or plain. */
function renamed(withGit: boolean): string {
  const root = tree(LEGACY); writeFileSync(join(root, "fusion-workbench", ".fusion-setup"), '{"setup_at":"2026-01-01T00:00:00","plugin_version":"12.0.0"}\n');
  for (const [f, body] of Object.entries(CITING)) writeFileSync(join(root, "fusion-workbench", f), body);
  if (withGit) git(root);
  expect(sh(survey, root)).toMatch(/^FOUND=1$/m); expect(sh(apply, root)).toMatch(new RegExp(`collisions=0 left=0 mode=${withGit ? "git" : "plain"}$`, "m"));
  return root;
}

describe("the citation sweep over the renamed tree", () => {
  // The yes-branch command as the text spells it; it must run in a fresh shell that has only FUSION_PLUGIN_ROOT.
  const WRITE = step6.match(/On a yes run `([^`]+)`/)![1];
  const K = step6Block.match(/(?:^|; )K=([^;\s]+)/m)![1];
  const write = (root: string) => spawnSync("bash", ["-c", WRITE], { cwd: root, encoding: "utf-8", env: FRESH_ENV });
  const read = (root: string) => [REC, PR.replace("circles/", "work-packages/")].map((f) => readFileSync(join(root, "fusion-workbench", f), "utf-8"));
  it("the yes-branch write is self-contained and sweeps the block's kinds", () => { expect(WRITE).toBe(`"$FUSION_PLUGIN_ROOT/bin/fusion-citation-sweep" --write --yes --kinds ${K}`); expect(K).toBe("record,package-record,package-dir"); });
  it("git: over the staged renames the write is refused dirty-tree, naming a renamed path, and writes nothing", () => {
    const root = renamed(true), before = read(root), r = write(root);
    expect([r.status, r.stdout]).toEqual([4, ""]);
    expect(r.stderr).toMatch(/refused \(dirty-tree\): .*fusion-workbench\/(work-packages|shared\/plans|shared\/consultations)\//);
    expect(read(root)).toEqual(before);
  }, CASE_TIMEOUT);
  it("git: after the renames are committed the same write exits 0 and counts the planted rewrites", () => {
    const root = renamed(true); sh("git -c user.name=t -c user.email=t@t commit -qm renames", root);
    const r = write(root);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout.trim().split("\n").at(-1)).toMatch(/^files=\d+ rewrites=([2-9]|\d\d+) residual=\d+ record=[1-9]\d* package-record=[1-9]\d* .*mode=write$/);
    expect(read(root)).not.toEqual(Object.values(CITING));
  }, CASE_TIMEOUT);
  it("plain: without git the write is refused, exit 4, and writes nothing", () => {
    const root = renamed(false), before = read(root), r = write(root);
    expect([r.status, r.stdout]).toEqual([4, ""]);
    expect(r.stderr).toMatch(/refused \((not-a-git-work-tree|workbench-untracked|dirty-tree)\)/);
    expect(read(root)).toEqual(before);
  }, CASE_TIMEOUT);
});

// The same issue's regression: the sequence Steps 2, 5 and 6 now document reaches a write with no exit 4,
// and Step 6's block, lifted whole, says why when it offers none.
describe("Step 6 as shipped: the sweep is offered where it may write", () => {
  const block = (root: string) => {
    const r = spawnSync("bash", ["-c", step6Block], { cwd: root, encoding: "utf-8", env: FRESH_ENV });
    expect(r.status, r.stderr).toBe(0);
    const exit = Number(r.stdout.match(/^EXIT=(\d+)$/m)![1]), m = r.stdout.match(/^files=\d+ rewrites=(\d+) /m);
    return { exit, rewrites: m ? Number(m[1]) : -1, stderr: r.stderr };
  };
  const yes = (root: string) => spawnSync("bash", ["-c", step6.match(/On a yes run `([^`]+)`/)![1]], { cwd: root, encoding: "utf-8", env: FRESH_ENV });
  it("git: commit as Step 5 directs, re-run, the block offers, the yes-branch writes, and after its commit a third look counts nothing", () => {
    const root = renamed(true), exits: number[] = [];
    sh("git -c user.name=t -c user.email=t@t commit -qm renames", root); expect(sh(survey, root)).toMatch(/^FOUND=0$/m);
    const offer = block(root); exits.push(offer.exit);
    // exit 5's own line is guard (b)'s "refused (no --yes)"; no guard (a) refusal may stand beside it
    expect([offer.exit, offer.rewrites > 0, offer.stderr.match(/refused \([^)]*\)/g)]).toEqual([5, true, ["refused (no --yes)"]]);
    const w = yes(root); exits.push(w.status!); expect(w.status, w.stderr).toBe(0);
    sh("git -c user.name=t -c user.email=t@t commit -qam sweep", root); // its own commit, as the yes-branch says
    const again = block(root); exits.push(again.exit); expect([again.exit, again.rewrites]).toEqual([5, 0]);
    expect(exits).not.toContain(4);
  }, CASE_TIMEOUT);
  it("plain: the block exits 4 and its refusal line is the reason no write is offered", () => {
    const r = block(renamed(false));
    expect(r.exit).toBe(4); expect(r.stderr).toMatch(/^fusion-citation-sweep: refused \((not-a-git-work-tree|workbench-untracked|dirty-tree)\): /m);
  }, CASE_TIMEOUT);
  it("a re-run before the commit: the block exits 4 dirty-tree", () => {
    const r = block(renamed(true));
    expect(r.exit).toBe(4); expect(r.stderr).toMatch(/refused \(dirty-tree\)/);
  }, CASE_TIMEOUT);
  it("a JSON-controlled v12 workbench still citing circles/ is offered the write (decision option 1)", () => {
    const root = mkdtempSync(join(tmpdir(), "store-name-json-")); roots.push(root);
    const wb = jsonWorkbenchAt(root), item = "260505-0505-widget-bar";
    mkdirSync(join(wb, "work-packages", item), { recursive: true }); writeFileSync(join(wb, "work-packages", item, `${item}.md`), "x\n");
    mkdirSync(join(wb, "shared", "issues"), { recursive: true }); writeFileSync(join(wb, "shared", "issues", "260101-0101_o_alpha.md"), `see \`circles/${item}/${item}.md\`\n`);
    git(root); expect(sh(survey, root)).toMatch(/^FOUND=0$/m);
    const r = block(root); expect([r.exit, r.rewrites > 0], r.stderr).toEqual([5, true]);
  }, CASE_TIMEOUT);
  it("the routing the blocks cannot carry: FOUND=0 goes to Step 6, and a git rename run ends asking for a second /fusion:migrate", () => {
    expect(md("migrate").match(/^- \*\*`FOUND=0`\*\*.*$/m)![0]).toContain("go to Step 6");
    expect(md("migrate").split("## Step 5")[1].split("## Step 6")[0]).toMatch(/run `\/fusion:migrate` again/);
  });
});

// Issue 261015-1310, Step 7 reads a JSON-controlled workbench with no local session as unmigrated:
// the helper output Step 7's `**Survey.**` routes on, over a JSON tree no run on this machine migrated.
describe("Step 7 on a JSON-controlled workbench with no local session", () => {
  const MIG = '"$FUSION_PLUGIN_ROOT/bin/fusion-migrate"';
  const project = () => {
    const root = mkdtempSync(join(tmpdir(), "store-name-step7-")), home = mkdtempSync(join(tmpdir(), "store-name-home-")); roots.push(root, home);
    jsonWorkbenchAt(root); mkdirSync(join(home, ".fusion-migrate"));
    return { root, env: { ...FRESH_ENV, HOME: home } };
  };
  it("(a) status reports state=json-control and run=none, with no done= line", () => {
    const { root, env } = project(), out = sh(`${MIG} status`, root, env);
    for (const l of ["state=json-control", "run=none"]) expect(out).toMatch(new RegExp(`^${l}$`, "m"));
    expect(out).not.toMatch(/^done=/m);
  }, CASE_TIMEOUT);
  it("(b) survey and repair --list name the manifest as a finding to fix by hand", () => {
    const { root, env } = project(), s = sh(`${MIG} survey`, root, env);
    expect(s).toMatch(/^layout=json-control$/m); expect(s).toMatch(/^blocking=\S+\tmanifest-present\t/m);
    expect(sh(`${MIG} repair --list`, root, env)).toMatch(/^unrepairable=/m);
  }, CASE_TIMEOUT);
});

// Its regression: the shipped `**Survey.**` block routes on the tree's state=, the session deciding only an in-flight run,
// and since issue 261015-2223 a record the tree does not carry routes to ROUTE=stale. Every session cell is a real run's.
describe("Step 7 as shipped: the survey block routes every cell of session by state", () => {
  const text = md("migrate"), block = extractBashBlock(text, "**Survey.**"), MIG = '"$FUSION_PLUGIN_ROOT/bin/fusion-migrate"';
  const ROUTE = (out: string) => out.match(/^(ROUTE|EXIT)=.*$/m)![0];
  const project = () => {
    const root = mkdtempSync(join(tmpdir(), "store-name-step7-")), home = mkdtempSync(join(tmpdir(), "store-name-home-")); roots.push(root, home);
    mkdirSync(join(home, ".fusion-migrate")); return { root, env: { ...FRESH_ENV, HOME: home } };
  };
  const session = (root: string, env: NodeJS.ProcessEnv) => sh(`${MIG} status`, root, env).match(/^session=(.*)$/m)![1];
  /** A no-session project over a jsonWorkbenchAt tree in the given state. */
  const route = (tree: "json" | "legacy" | "unreadable") => {
    const { root, env } = project(), wb = jsonWorkbenchAt(root);
    if (tree === "legacy") rmSync(join(wb, "workbench.json")); if (tree === "unreadable") writeFileSync(join(wb, "workbench.json"), "{ not json\n");
    return sh(block, root, env);
  };
  const at = (root: string, env: NodeJS.ProcessEnv, dir: string) => ({ root, dir, call: (c: string) => spawnSync("bash", ["-c", c], { cwd: root, encoding: "utf-8", env }), routed: () => ROUTE(sh(block, root, env)) });
  /** The legacy fixture migrated by the helper and committed, HOME outside the root so a reset keeps the session. */
  const migrated = () => {
    const { root, env } = project();
    cpSync(join(pluginRoot, "codec/fixtures/legacy-v12/workbench"), join(root, "fusion-workbench"), { recursive: true });
    writeFileSync(join(root, "fusion-workbench", ".fusion-setup"), '{"setup_at":"t"}\n'); git(root);
    expect(sh(`${MIG} run`, root, env)).toMatch(/^result=json-control$/m);
    sh("git add -A && git -c user.name=t -c user.email=t@t commit -qm migrated", root);
    return at(root, env, session(root, env));
  };
  let made = at("", {}, ""), real: Record<string, unknown> = {};
  beforeAll(() => { made = migrated(); real = JSON.parse(readFileSync(join(made.dir, "state.json"), "utf-8")); }, 4 * CASE_TIMEOUT);
  /** A copy of the migrated root (.git and .json-state/ included) under its own HOME, its session the real one with `edit` applied. */
  const copy = (edit: (s: Record<string, any>) => Record<string, any> = (s) => s) => {
    const { root, env } = project(); cpSync(made.root, root, { recursive: true });
    const dir = session(root, env); cpSync(made.dir, dir, { recursive: true });
    writeFileSync(join(dir, "state.json"), JSON.stringify(edit({ ...real, workbench: realpathSync(join(root, "fusion-workbench")) })));
    return at(root, env, dir);
  };
  it("(a) the issue's acceptance: JSON with no session routes json-control and names no finding, and the text stops there", () => {
    const out = route("json");
    expect([ROUTE(out), out.match(/^run=none$/m) !== null]).toEqual(["ROUTE=json-control", true]);
    expect(out).not.toMatch(/^(blocking|finding|unrepairable)=/m);
    const line = text.match(/^- \*\*`ROUTE=json-control`\*\*.*$/m)![0];
    expect(line).toContain("already on JSON control"); expect(line).toMatch(/\bstop\b/);
    const step7 = text.split("## Step 7")[1];
    expect(step7.indexOf('fusion-migrate" survey')).toBeGreaterThan(step7.indexOf("**`ROUTE=survey`**"));
  }, CASE_TIMEOUT);
  it.each([["(b) Markdown, no session", "legacy", "ROUTE=survey"], ["(g) an unreadable workbench.json", "unreadable", "ROUTE=stop"]] as const)(
    "%s routes as the table assigns", (_n, t, want) => { expect(ROUTE(route(t))).toBe(want); }, CASE_TIMEOUT);
  it("(c) JSON, interrupted after verify (done=false), and (d) JSON, migrated here", () => {
    expect([copy((s) => ({ ...s, done: false })).routed(), copy().routed()]).toEqual(["ROUTE=interrupted", "ROUTE=json-control"]);
  }, 2 * CASE_TIMEOUT);
  // The codec's rollback audit reconstructs requests over the tree it migrated, so this cell rolls back in place, not in a copy.
  it("(f) Markdown, rolled back, and (e) Markdown, rollback interrupted after the manifest left: the cut before its final session write", () => {
    const c = migrated(), r = c.call(`${MIG} rollback`); expect(r.status, r.stderr).toBe(0);
    const after = JSON.parse(readFileSync(join(c.dir, "state.json"), "utf-8"));
    expect([c.routed(), after.rollback, existsSync(join(c.root, "fusion-workbench", after.plan.path))]).toEqual(["ROUTE=survey", expect.anything(), false]);
    writeFileSync(join(c.dir, "state.json"), JSON.stringify({ ...after, rolled_back: false }));
    expect(c.routed()).toBe("ROUTE=interrupted");
  }, 3 * CASE_TIMEOUT);
  it("(i) the medium issue's acceptance: a done session over the tree reset with git routes stale, before and after a refused rollback, and the line's way out leads to the survey", () => {
    const c = copy(); sh("git reset -q --hard HEAD~1", c.root);
    expect(c.routed()).toBe("ROUTE=stale");
    expect(c.call(`${MIG} rollback`).status).toBe(5); expect(c.routed()).toBe("ROUTE=stale");
    const line = text.match(/^- \*\*`ROUTE=stale`\*\*.*$/m)![0], way = line.match(/run `([^`]+)`/)![1];
    expect(way).toBe(`${MIG} set-aside --consent`);
    const r = c.call(way); expect([r.status, existsSync(c.dir)], r.stderr).toEqual([0, false]);
    expect(c.routed()).toBe("ROUTE=survey");
  }, 4 * CASE_TIMEOUT);
  it("(j) the sibling: a migrated tree under an abandoned local record with no plan routes stale", () => {
    expect(copy((s) => ({ ...s, plan: null, done: false, rollback: null })).routed()).toBe("ROUTE=stale");
  }, CASE_TIMEOUT);
  it("(h) every call spells the helper, Step 7 says run `<subcommand>` nowhere, and $ROOT stays inside Step 1's block", () => {
    expect(text).not.toContain('"$M"'); expect(text).not.toContain("Set `M=");
    const step7 = text.split("## Step 7")[1].split("## Guardrails")[0];
    expect(step7.match(/run `(survey|repair|run|resume|rollback|status|set-aside)\b[^`]*`/gi)).toBeNull();
    expect(step7.split("**Interrupted.**")[1].split("\n")[0]).toContain("the same helper");
    const step1 = extractBashBlock(text, "## Step 1 — Locate the workbench");
    expect(step1).toContain('cd "$ROOT"'); expect(text.split(step1).join("")).not.toContain("$ROOT");
  });
});

it("a pulled marker stamping every periodic check makes none count as done, and a stamp taken here is read (issue 260924-1732)", () => {
  const setup = extractBashBlock(md("setup"), "Write the setup marker"), dir = tree(["x.md"]), m = join(dir, "fusion-workbench", ".fusion-setup"), env = { ...ENV, FUSION_PLUGIN_ROOT: pluginRoot };
  const SEL: string[] = JSON.parse(setup.match(/const SEL = (\[.*\]);/)![1]), at = new Date().toISOString().slice(0, 10), v = JSON.parse(readFileSync(join(pluginRoot, ".claude-plugin", "plugin.json"), "utf-8")).version;
  writeFileSync(m, JSON.stringify({ setup_at: "2026-09-01T00:00:00", plugin_version: v, checks: Object.fromEntries(SEL.map((s) => [s, { at, version: v }])) }));
  expect(sh(setup, dir, env)).toBe(`marker=written\nchecks_due=${SEL.join(",")}\n`);
  sh(extractBashBlock(md("check"), "## Stamp what you ran").replace("<sel...>", SEL.join(" ")), dir, env);
  expect([readFileSync(m, "utf-8"), sh(setup, dir, env)]).toEqual([expect.not.stringContaining("checks"), "marker=unchanged\nchecks_due=none\n"]);
});

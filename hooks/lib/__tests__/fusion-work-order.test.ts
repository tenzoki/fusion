// The order entry point, the only test that runs `bin/fusion-work-order`: the two rulings its header cites
// (no exit code carries the verdict; the mandatory `note=`), and the four formats over one computation.
import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
const script = join(pluginRoot, "bin", "fusion-work-order");
const roots: string[] = [];
afterAll(() => roots.forEach((d) => rmSync(d, { recursive: true, force: true })));
/** A set-up workbench whose store holds `items`: dir -> `**Depends-on:**` value, null = absent. */
function scratch(items: Record<string, string | null> = {}): string {
  const root = mkdtempSync(join(tmpdir(), "fusion-work-order-"));
  roots.push(root);
  mkdirSync(join(root, "fusion-workbench"), { recursive: true });
  writeFileSync(join(root, "fusion-workbench", ".fusion-setup"), "{}\n");
  for (const [dir, deps] of Object.entries(items)) {
    const field = deps === null ? "" : `**Depends-on:** ${deps}\n`;
    mkdirSync(join(root, "fusion-workbench", "work-packages", dir), { recursive: true });
    writeFileSync(join(root, "fusion-workbench", "work-packages", dir, `${dir}.md`), `# ${dir}\n\n---\n**Status:** open\n${field}---\n`);
  }
  return root;
}
/** A bare directory with no workbench above it, cleaned from `roots` like every other fixture. */
const bare = () => ((d) => (roots.push(d), d))(mkdtempSync(join(tmpdir(), "fusion-work-order-bare-")));
const run = (cwd: string, ...args: string[]) => spawnSync(script, args, { cwd, encoding: "utf-8" });
const value = (out: string, key: string) => out.split("\n").find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1);
// A cycle at depth 0 whose two items both carry the field and resolve; a chain whose root carries none.
const CYCLIC = { "260101-0001-a": "260101-0002-b.md", "260101-0002-b": "260101-0001-a.md" };
const ACYCLIC = { "260101-0001-a": "260101-0002-b.md", "260101-0002-b": null };
const COLS = "order\tdepth\tblocks\treadiness\titem\tstatus\tfield\tdepends-on\tunresolved\tcycle";
const COUNTS = ["items", "edges", "unresolved-edges", "cycles", "ready", "roots", "no-depends-on-field", "unreadable-head"];
const MARK = "<!-- fusion-work-order markdown format=1 -->";
// Two cycles (one a self-edge), an absent field, unresolved entries carrying a tab and all eleven escaped punctuation characters, paused, unreadable.
const [D, E, F, G, P, PM] = ["260101-0004-d", "260101-0005-e", "260101-0006-f", "260101-0007-g", "p|q`r&*_[s]<t>~.md", "p\\|q\\`r\\&\\*\\_\\[s\\]\\<t\\>\\~.md"];
function rich(): string {
  const root = scratch({ ...CYCLIC, "260101-0003-c": null, [D]: `260101-0003-c.md, x\\y.md, w\tz.md, x\\y.md, ${P}`, [E]: null, [F]: `${F}.md`, [G]: null });
  for (const [d, s] of [[E, "paused"], [G, "bogus"]]) writeFileSync(join(root, "fusion-workbench", "work-packages", d, `${d}.md`), `# ${d}\n\n---\n**Status:** ${s}\n---\n`);
  return root;
}
const ROWS = [["1", "0", "1", "blocked", "260101-0001-a", "open", "present", "260101-0002-b.md", "", "1"],
  ["2", "0", "1", "blocked", "260101-0002-b", "open", "present", "260101-0001-a.md", "", "1"], ["3", "0", "1", "ready", "260101-0003-c", "open", "absent", "", "", "0"],
  ["4", "1", "0", "blocked", D, "open", "present", `260101-0003-c.md,x\\\\y.md,w\\tz.md,x\\\\y.md,${P}`, `${P},w\\tz.md,x\\\\y.md`, "0"],
  ["5", "0", "0", "paused", E, "paused", "absent", "", "", "0"], ["6", "0", "0", "blocked", F, "open", "present", `${F}.md`, "", "2"]];
describe("bin/fusion-work-order: reports, never gates", () => {
  it("exits 0 with verdict=cyclic, prints one note= only where a field is absent, and holds roots= equal to ready= unless a cycle sits at depth 0", () => {
    const [a, c] = [run(scratch(ACYCLIC)).stdout, run(scratch(CYCLIC))];
    expect([c.status, value(c.stdout, "verdict"), value(a, "roots"), value(a, "ready"), value(c.stdout, "roots"), value(c.stdout, "ready")]).toEqual([0, "cyclic", "1", "1", "2", "0"]);
    expect([a, c.stdout].map((o) => o.split("\n").filter((l) => l.startsWith("note=")))).toEqual([[expect.stringContaining("1 item carries")], []]);
  });
  it("prints --format text as no argument does, and --format tsv as the hooks/order.ts stream: cycle numbers, self-edge, absent field, unresolved cell, paused, unreadable, escaping", () => {
    const root = rich(), head = ["#format=1", "#anchor=workbench-root", ...[6, 4, 3, 2, 1, 5, 2, 1].map((n, i) => `#${COUNTS[i]}=${n}`), "#verdict=cyclic", `#note=${value(run(root).stdout, "note")}`, `#unreadable=${G}`, COLS];
    expect(run(root, "--format", "tsv").stdout).toBe([...head, ...ROWS.map((r) => r.join("\t"))].join("\n") + "\n");
    expect(run(root, "--format", "text").stdout).toBe(run(root).stdout);
  });
  it("prints --format json as the TSV's rows typed, and the same summary, note, cycles, unresolved and unreadable", () => {
    const root = rich(), j = JSON.parse(run(root, "--format", "json").stdout), cell = (v: unknown) => (Array.isArray(v) ? v.join(",") : String(v)).replace(/\\/g, "\\\\").replace(/\t/g, "\\t");
    const sig = "order:number,depth:number,blocks:number,readiness:string,item:string,status:string,field:string,depends-on:object,unresolved:object,cycle:number";
    expect(j.items.map((o: object) => [Object.entries(o).map(([k, v]) => `${k}:${typeof v}`).join(), ...Object.values(o).map(cell)])).toEqual(ROWS.map((r) => [sig, ...r]));
    expect([j.format, j.anchor, Object.entries(j.summary), j.note]).toEqual([1, "workbench-root", [...[6, 4, 3, 2, 1, 5, 2, 1].map((n, i) => [COUNTS[i], n]), ["verdict", "cyclic"]], value(run(root).stdout, "note")]);
    expect([j.cycles, j.unresolved, j.unreadable]).toEqual([[["260101-0001-a", "260101-0002-b"], [F]], [P, "w\tz.md", "x\\y.md"].map((entry) => ({ item: D, entry })), [G]]);
  });
  it("prints --format markdown: marker, note paragraph, the escaped table row, numbered cycles, unresolved and unreadable lists", () => {
    const root = rich(), b = run(root, "--format", "markdown").stdout.split("\n\n");
    expect([b[0], b[2], b[3].split("\n")[5], ...b.slice(4)]).toEqual([MARK, `**Note:** ${value(run(root).stdout, "note")}`, `| 4 | 1 | 0 | blocked | ${D} | open | present | 260101-0003-c.md, x\\\\y.md, w&#9;z.md, x\\\\y.md, ${PM} | ${PM}, w&#9;z.md, x\\\\y.md | 0 |`,
      "**Cycles**", `- 1: 260101-0001-a, 260101-0002-b\n- 2: ${F}`, "**Unresolved**", `- ${D} wants ${PM}\n- ${D} wants w&#9;z.md\n- ${D} wants x\\\\y.md`, "**Unreadable**", `- ${G}\n`]);
  });
  it("exits 1 with empty stdout on any other argument, an alias and --format=json included, and 2 with no workbench above", () => {
    for (const a of [["--wat"], ["--format"], ["--format", "yaml"], ["--format", "md"], ["--format=json"], ["--format=tsv"], ["--format", "tsv", "--format", "tsv"]]) expect(((r) => [r.status, r.stdout])(run(scratch(), ...a))).toEqual([1, ""]);
    expect(run(bare()).status).toBe(2);
  });
  it("answers verdict=empty at exit 0, and prints the summary, the header and no row in every format, note null in JSON", () => {
    const root = scratch(), zero = Object.fromEntries(COUNTS.map((k) => [k, 0]));
    expect(((r) => [r.status, value(r.stdout, "verdict")])(run(root))).toEqual([0, "empty"]);
    expect(run(root, "--format", "tsv").stdout).toBe(["#format=1", "#anchor=workbench-root", ...COUNTS.map((k) => `#${k}=0`), "#verdict=empty", COLS, ""].join("\n"));
    expect(JSON.parse(run(root, "--format", "json").stdout)).toEqual({ format: 1, anchor: "workbench-root", summary: { ...zero, verdict: "empty" }, note: null, items: [], cycles: [], unresolved: [], unreadable: [] });
    expect(run(root, "--format", "markdown").stdout).toBe([MARK, ["anchor: workbench-root", ...COUNTS.map((k) => `${k}: 0`), "verdict: empty"].map((l) => `- ${l}`).join("\n"), `| ${COLS.split("\t").join(" | ")} |\n|${" ---: |".repeat(3)}${" --- |".repeat(6)} ---: |\n`].join("\n\n"));
  });
});

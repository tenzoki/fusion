// The order entry point — the only test that runs `bin/fusion-work-order`, pinning the two
// rulings only the program can show: no exit code carries the verdict, so a cycle is exit 0 with
// `verdict=cyclic` on stdout (`260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md`,
// option 3), and one `note=` line is mandatory whenever `no-depends-on-field=` is above zero
// (`260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md`).
// Every case builds a throwaway workbench, in the shape `plan-size.test.ts` uses.
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
const notes = (out: string) => out.split("\n").filter((l) => l.startsWith("note="));
const verdict = (cwd: string) => ((r) => [r.status, value(r.stdout, "verdict")])(run(cwd));
// A cycle at depth 0 whose two items both carry the field and resolve; a chain whose root carries none.
const CYCLIC = { "260101-0001-a": "260101-0002-b.md", "260101-0002-b": "260101-0001-a.md" };
const ACYCLIC = { "260101-0001-a": "260101-0002-b.md", "260101-0002-b": null };
const COLS = "order\tdepth\tblocks\treadiness\titem\tstatus\tfield\tdepends-on\tunresolved\tcycle";
const COUNTS = ["items", "edges", "unresolved-edges", "cycles", "ready", "roots", "no-depends-on-field", "unreadable-head"];
describe("bin/fusion-work-order: reports, never gates", () => {
  it("exits 0 on a cyclic store, the verdict on stdout", () => {
    expect(verdict(scratch(CYCLIC))).toEqual([0, "cyclic"]);
  });
  it("prints exactly one note= naming the count where a field is absent, none where every item carries it", () => {
    expect(notes(run(scratch(ACYCLIC)).stdout)).toEqual([expect.stringContaining("1 item carries")]);
    expect(notes(run(scratch(CYCLIC)).stdout)).toEqual([]);
  });
  it("answers verdict=empty at exit 0 for a workbench with no container root", () => {
    expect(verdict(scratch())).toEqual([0, "empty"]);
  });
  it("exits 1 on an argument and 2 with no workbench above the working directory", () => {
    expect(run(scratch(), "--wat").status).toBe(1);
    expect(run(bare()).status).toBe(2);
  });
  it("holds roots= equal to ready= on an acyclic store, and apart where a cycle sits at depth 0", () => {
    const [a, c] = [run(scratch(ACYCLIC)).stdout, run(scratch(CYCLIC)).stdout];
    expect([value(a, "roots"), value(a, "ready"), value(c, "roots"), value(c, "ready")]).toEqual(["1", "1", "2", "0"]);
  });
  it("prints --format text byte-identical to no argument", () => {
    const root = scratch(ACYCLIC);
    expect(run(root, "--format", "text").stdout).toBe(run(root).stdout);
  });
  it("prints --format tsv as the hooks/order.ts stream: cycle numbers, self-edge, absent field, unresolved cell, paused, unreadable, escaping", () => {
    const [E, F, G] = ["260101-0005-e", "260101-0006-f", "260101-0007-g"], root = scratch({ ...CYCLIC, "260101-0003-c": null, "260101-0004-d": "260101-0003-c.md, x\\y.md, w\tz.md, x\\y.md", [E]: null, [F]: `${F}.md`, [G]: null });
    for (const [d, s] of [[E, "paused"], [G, "bogus"]]) writeFileSync(join(root, "fusion-workbench", "work-packages", d, `${d}.md`), `# ${d}\n\n---\n**Status:** ${s}\n---\n`);
    const head = ["#format=1", "#anchor=workbench-root", ...[6, 4, 2, 2, 1, 5, 2, 1].map((n, i) => `#${COUNTS[i]}=${n}`), "#verdict=cyclic", `#note=${value(run(root).stdout, "note")}`, `#unreadable=${G}`, COLS];
    const rows = [["1", "0", "1", "blocked", "260101-0001-a", "open", "present", "260101-0002-b.md", "", "1"],
      ["2", "0", "1", "blocked", "260101-0002-b", "open", "present", "260101-0001-a.md", "", "1"],
      ["3", "0", "1", "ready", "260101-0003-c", "open", "absent", "", "", "0"],
      ["4", "1", "0", "blocked", "260101-0004-d", "open", "present", "260101-0003-c.md,x\\\\y.md,w\\tz.md,x\\\\y.md", "w\\tz.md,x\\\\y.md", "0"],
      ["5", "0", "0", "paused", E, "paused", "absent", "", "", "0"], ["6", "0", "0", "blocked", F, "open", "present", `${F}.md`, "", "2"]];
    expect(run(root, "--format", "tsv").stdout).toBe([...head, ...rows.map((r) => r.join("\t"))].join("\n") + "\n");
  });
  it("exits 1 with empty stdout on --format alone, an unknown format, --format=tsv and a repeated --format", () => {
    for (const a of [["--format"], ["--format", "json"], ["--format=tsv"], ["--format", "tsv", "--format", "tsv"]]) expect(((r) => [r.status, r.stdout])(run(scratch(), ...a))).toEqual([1, ""]);
  });
  it("prints the comment block and the header and no row on verdict=empty", () => {
    expect(run(scratch(), "--format", "tsv").stdout).toBe(["#format=1", "#anchor=workbench-root", ...COUNTS.map((k) => `#${k}=0`), "#verdict=empty", COLS, ""].join("\n"));
  });
});

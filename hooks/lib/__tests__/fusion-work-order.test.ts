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
});

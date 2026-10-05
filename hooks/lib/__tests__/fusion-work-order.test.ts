import { afterAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { CASE_TIMEOUT } from "./helpers/guard-harness.js";
import { createPackage, must, place, setDependencies, transition, withJsonProject, type JsonProject, type Package } from "./helpers/json-workbench.js";

// Drives the real `bin/fusion-work-order` over workbenches the kernel wrote. Pinned here and only
// here: no exit code carries the verdict, so a cycle is exit 0 with `verdict=cyclic`
// (`260909-1808_*_may-a-helper-compute-an-order-over-work-items-after-the-portfolio-layer-goes.md`,
// option 3); one `note=` line is mandatory where `no-depends-on-field=` or `unresolved-edges=` is
// above zero (`260908-2018_*_does-the-record-template-mandate-the-prerequisite-field-or-merely-permit-it.md`);
// a satisfied terminal target prints no row where the Markdown reader printed `unresolved=`; a
// workbench that is not JSON-controlled is exit 4 by name with nothing on stdout; the four formats
// print one computation (`hooks/order.ts` `## The TSV format`, `## The JSON format`, `## The Markdown format`).

const script = join(pluginRoot, "bin", "fusion-work-order");
const run = (cwd: string, ...args: string[]) => ((r) => ({ status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" }))(spawnSync(script, args, { cwd, encoding: "utf-8" }));
const value = (out: string, key: string) => out.split("\n").find((l) => l.startsWith(`${key}=`))?.slice(key.length + 1);
const rows = (out: string, key: string) => out.split("\n").filter((l) => l.startsWith(`${key}=`));
const drop = (p: JsonProject, pkg: Package) => transition(p, pkg, "dropped", { outcome: { class: "dropped", reason: "a test dropped it", evidence: [] } });
const KEYS = ["items", "edges", "unmet-edges", "unresolved-edges", "cycles", "ready", "roots", "no-depends-on-field", "unreadable-head"];
const COLS = "order\tdepth\tblocks\treadiness\titem\tstatus\tdepends-on\tunmet\tunresolved\tcycle";
const MARK = "<!-- fusion-work-order markdown format=2 -->";
const stems = ["260101-0001-a", "260101-0002-b", "260101-0003-c", "260101-0004-d", "260101-0005-e", "260101-0006-f", "260101-0007-g", "260101-0008-h"];

/** The whole store: a chain, a satisfied terminal edge, an unmet `succeeded` edge, a placed cycle. */
function seed(p: JsonProject): Record<string, Package> {
  const [a, b, c, d, e, f, g, h] = stems.map((s) => createPackage(p, s));
  setDependencies(p, a, [{ target: b, condition: "terminal" }]); // b live: a resolved edge
  drop(p, d);
  setDependencies(p, c, [{ target: d, condition: "terminal" }]); // satisfied: no edge, no row
  setDependencies(p, e, [{ target: d, condition: "succeeded" }]); // unmet on a terminal target: a row, and e is blocked
  setDependencies(p, g, [{ target: h, condition: "terminal" }]);
  // h -> g closes a cycle, which `set-dependencies` refuses, so the second edge is placed by hand.
  const control = JSON.parse(readFileSync(resolve(p.workbench, h.path), "utf-8")) as { depends_on: unknown[] };
  control.depends_on = [{ target: { workbench_id: must(p, { op: "inspect" }).result.id, record_id: g.id }, condition: "terminal" }];
  place(p, h.path, JSON.stringify(control, null, 2) + "\n");
  return { a, b, c, d, e, f, g, h };
}

describe("bin/fusion-work-order over a JSON-controlled store", () => {
  it("prints the order over the codec's edges, the cycle reconcile reports, and no row for a satisfied terminal target", () => {
    withJsonProject((p) => {
      const { a, b, c, d, e, f, g, h } = seed(p);
      const r = run(p.root);
      expect(r.status, r.stderr).toBe(0);
      expect([...KEYS, "verdict"].map((k) => value(r.stdout, k)))
        .toEqual(["7", "3", "1", "0", "1", "3", "6", "2", "0", "cyclic"]);
      const order = r.stdout.split("\n").filter((l) => l.startsWith("  ")).map((l) => l.trim().split(/\s+/).slice(3));
      expect(order).toEqual([["ready", stems[1]], ["blocked", stems[0]], ["ready", stems[2]], ["blocked", stems[4]], ["ready", stems[5]], ["blocked", stems[6]], ["blocked", stems[7]]]);
      expect(rows(r.stdout, "unmet")).toEqual([`unmet=${stems[4]} wants ${stems[3]} under succeeded: succeeded: the target is dropped, not done`]);
      expect(r.stdout).not.toContain(`${stems[2]} wants`);
      // The cycle's members are the cycle `reconcile` reports, ids mapped to containers.
      const reconciled = must(p, { op: "reconcile" }).result.dependencies as Array<{ status: string; ids?: string[] }>;
      const byId = Object.fromEntries([a, b, c, d, e, f, g, h].map((x) => [x.id, x.dir.split("/")[1]]));
      const cycles = reconciled.filter((x) => x.status === "cycle").map((x) => new Set(x.ids!.map((id) => byId[id])));
      expect(cycles).toEqual([new Set([stems[6], stems[7]])]);
      expect(rows(r.stdout, "cycle")).toEqual([`cycle=${stems[6]}, ${stems[7]}`]);
      // The note names the empty lists and the caveat, and a second run prints the same bytes.
      expect(rows(r.stdout, "note")).toEqual([expect.stringMatching(/^note=2 items carry an empty `depends_on` list.*authorises no dispatch\.$/)]);
      expect(run(p.root).stdout).toBe(r.stdout);
      expect(run(p.root, "--format", "text").stdout).toBe(r.stdout);
      // TSV: the comment block, the header and every row; depends-on names record ids, unmet the target's container.
      const UNMET = { item: stems[4], target: stems[3], condition: "succeeded", detail: "succeeded: the target is dropped, not done" };
      const rowsOf: Array<[number, number, number, string, number, string, string, number]> = [[1, 0, 1, "ready", 1, "", "", 0], [2, 1, 0, "blocked", 0, b.id, "", 0], [3, 0, 0, "ready", 2, d.id, "", 0], [4, 0, 0, "blocked", 4, d.id, stems[3], 0], [5, 0, 0, "ready", 5, "", "", 0], [6, 0, 1, "blocked", 6, h.id, "", 1], [7, 0, 1, "blocked", 7, g.id, "", 1]];
      expect(run(p.root, "--format", "tsv").stdout).toBe(["#format=2", "#anchor=workbench-root", ...["7", "3", "1", "0", "1", "3", "6", "2", "0"].map((n, i) => `#${KEYS[i]}=${n}`), "#verdict=cyclic", `#note=${value(r.stdout, "note")}`, COLS, ...rowsOf.map(([o, dp, bl, rd, i, dep, un, c]) => [o, dp, bl, rd, stems[i], "open", dep, un, "", c].join("\t")), ""].join("\n"));
      const j = JSON.parse(run(p.root, "--format", "json").stdout);
      expect([j.format, j.summary.verdict, j.note, j.items[3], j.cycles, j.unmet, j.unresolved, j.unreadable]).toEqual([2, "cyclic", value(r.stdout, "note"), { order: 4, depth: 0, blocks: 0, readiness: "blocked", item: stems[4], status: "open", "depends-on": [d.id], unmet: [stems[3]], unresolved: [], cycle: 0 }, [[stems[6], stems[7]]], [UNMET], [], []]);
      const md = run(p.root, "--format", "markdown").stdout.split("\n\n");
      expect([md[0], md[2], ...md.slice(4)]).toEqual([MARK, `**Note:** ${value(r.stdout, "note")}`, "**Cycles**", `- 1: ${stems[6]}, ${stems[7]}`, "**Unmet**", `- ${stems[4]} wants ${stems[3]} under succeeded: ${UNMET.detail}\n`]);
    });
  }, CASE_TIMEOUT * 3);

  it("prints unresolved= for an entry the codec resolves to nothing, with the note, and names a row that does not read", () => {
    withJsonProject((p) => {
      const [a, b, c] = stems.slice(0, 3).map((s) => createPackage(p, s));
      setDependencies(p, a, [{ target: b, condition: "terminal" }]);
      const control = JSON.parse(readFileSync(resolve(p.workbench, a.path), "utf-8")) as { depends_on: Array<{ target: { record_id: string } }> };
      control.depends_on[0].target.record_id = "f03a0000-0000-4000-8000-999999999999"; // a state `set-dependencies` refuses
      place(p, a.path, JSON.stringify(control, null, 2) + "\n");
      place(p, c.path, `<<<<<<< ours\n${readFileSync(resolve(p.workbench, c.path), "utf-8")}=======\n>>>>>>> theirs\n`);
      const r = run(p.root);
      expect(r.status, r.stderr).toBe(0);
      expect([value(r.stdout, "items"), value(r.stdout, "unresolved-edges"), value(r.stdout, "unreadable-head"), value(r.stdout, "ready")]).toEqual(["2", "1", "1", "2"]);
      expect(rows(r.stdout, "unresolved")).toEqual([expect.stringMatching(new RegExp(`^unresolved=${stems[0]} wants f03a0000-0000-4000-8000-999999999999: unresolved-reference/`))]);
      expect(rows(r.stdout, "unreadable")).toEqual([expect.stringMatching(new RegExp(`^unreadable=${stems[2]}: `))]);
      expect(rows(r.stdout, "note")).toEqual([expect.stringContaining("`unresolved-edges=1` names entries the codec could not resolve")]);
      expect(run(p.root, "--format", "tsv").stdout).toContain(`\n${rows(r.stdout, "unreadable")[0].replace("unreadable=", "#unreadable=")}\n${COLS}\n`);
      expect(JSON.parse(run(p.root, "--format", "json").stdout)).toMatchObject({ unresolved: [{ item: stems[0], target: "f03a0000-0000-4000-8000-999999999999", reason: expect.stringMatching(/^unresolved-reference\//) }], unreadable: [{ item: stems[2] }] });
    });
  }, CASE_TIMEOUT);

  it("prints no note= where every item carries an entry and every entry resolves", () => {
    withJsonProject((p) => {
      const [a, b] = stems.slice(0, 2).map((s) => createPackage(p, s));
      setDependencies(p, a, [{ target: b, condition: "terminal" }]);
      const r = run(p.root);
      expect([r.status, value(r.stdout, "no-depends-on-field"), rows(r.stdout, "note")]).toEqual([0, "1", [expect.stringContaining("1 item carries")]]);
      drop(p, b);
      expect(rows(run(p.root).stdout, "note")).toEqual([]);
    });
  }, CASE_TIMEOUT);

  it("answers verdict=empty at exit 0 for a workbench whose container store does not exist yet, the summary and header with no row in every format", () => {
    withJsonProject((p) => {
      expect([run(p.root).status, value(run(p.root).stdout, "verdict")]).toEqual([0, "empty"]);
      expect(run(p.root, "--format", "tsv").stdout).toBe(["#format=2", "#anchor=workbench-root", ...KEYS.map((k) => `#${k}=0`), "#verdict=empty", COLS, ""].join("\n"));
      expect(JSON.parse(run(p.root, "--format", "json").stdout)).toEqual({ format: 2, anchor: "workbench-root", summary: { ...Object.fromEntries(KEYS.map((k) => [k, 0])), verdict: "empty" }, note: null, items: [], cycles: [], unmet: [], unresolved: [], unreadable: [] });
      expect(run(p.root, "--format", "markdown").stdout).toBe([MARK, ["anchor: workbench-root", ...KEYS.map((k) => `${k}: 0`), "verdict: empty"].map((l) => `- ${l}`).join("\n"), `| ${COLS.split("\t").join(" | ")} |\n|${" ---: |".repeat(3)}${" --- |".repeat(6)} ---: |\n`].join("\n\n"));
    });
  }, CASE_TIMEOUT * 2);

  it.each([
    ["legacy", { legacy: true }, (): void => undefined, "run /fusion:migrate"],
    ["unsupported", {}, (p: JsonProject): void => {
      const manifest = JSON.parse(readFileSync(resolve(p.workbench, "workbench.json"), "utf-8")) as { required_features: string[] };
      manifest.required_features.push("json-control-v9");
      place(p, "workbench.json", JSON.stringify(manifest, null, 2) + "\n");
    }, "unknown-feature"],
  ])("exit 4, the state on stderr and nothing on stdout, when the workbench is %s", (state, options, seedIt, detail) => {
    withJsonProject((p) => {
      seedIt(p);
      const r = run(p.root);
      expect([r.status, r.stdout]).toEqual([4, ""]);
      expect(r.stderr).toContain(state);
      expect(r.stderr).toContain(detail);
    }, options);
  }, CASE_TIMEOUT);

  it("exits 1 with empty stdout on any other argument, an alias and --format=json included, and 2 with no workbench above", () => {
    withJsonProject((p) => {
      for (const a of [["--wat"], ["--format"], ["--format", "yaml"], ["--format", "md"], ["--format=json"], ["--format", "tsv", "--format", "tsv"]]) expect(((x) => [x.status, x.stdout])(run(p.root, ...a))).toEqual([1, ""]);
      expect(run(resolve(p.root, "..")).status).toBe(2);
    });
  }, CASE_TIMEOUT);
});

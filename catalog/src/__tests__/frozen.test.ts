// The frozen contract: every published schema and workflow definition is
// named in `schemas/FROZEN` with its sha256, and a change to one of them turns
// this file red. Four groups: the list parses and is exactly the published
// set; every named file hashes to its line; a temporary copy with one byte
// appended is reported; the explorer's assets are the bytes Prior accepted.
// A fifth holds the withdrawal: `schemas/WITHDRAWN` names the assets that left
// the tree, each at the hash and the commit its bytes stand at, so a withdrawn
// name can never return with other bytes.
//
// Plan step 15 of 261010-1235-plan-fusion-prior-module-bundle-explorer-then-
// four-role-repair.md, the code half: `FROZEN` itself is the data half, written
// on Prior's answer 69, and nothing here reads a hash from anywhere but it.
// The withdrawal: plan step 2 of
// 261027-1612-plan-fusion-13-4-1-entry-delivery-on-the-step-17-model.md, under
// decision 261027-1833-how-does-a-frozen-catalog-asset-leave-the-tree-when-the-
// contract-it-serves-is-withdrawn (option 1); `WITHDRAWN` is that plan's step 7.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { catalogRoot, fusionRootOf, sha256Hex } from "../render.js";

const CATALOG = catalogRoot();
const FUSION = fusionRootOf(CATALOG);
const FROZEN = join(CATALOG, "schemas", "FROZEN");
const WITHDRAWN = join(CATALOG, "schemas", "WITHDRAWN");

// The commit before the data half of step 15 landed: the explorer's assets as
// request 68 delivered them, and what Prior's answer at b20edb6 accepted.
const EXPLORER_ACCEPTED_AT = "d52223a9";
const EXPLORER_ASSETS = [
  "schemas/explorer-envelope.v1.json",
  "schemas/explorer-request.v1.json",
  "schemas/explorer-result.v1.json",
  "schemas/explorer-role-input.v1.json",
  "workflows/explorer.v1.json",
];

const scratch: string[] = [];
function tmp(label: string): string {
  const dir = mkdtempSync(join(tmpdir(), `fusion-frozen-${label}-`));
  scratch.push(dir);
  return dir;
}
afterAll(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});

interface FrozenEntry {
  sha256: string;
  path: string;
}

// One line in `shasum -a 256` shape: the hash, two spaces, the path relative
// to `catalog/`. A `#` line is a comment; anything else is a malformed line.
const FROZEN_LINE = /^([0-9a-f]{64})  (\S+)$/;

function parseFrozen(text: string): FrozenEntry[] {
  const entries: FrozenEntry[] = [];
  for (const [i, line] of text.split("\n").entries()) {
    if (line === "" || line.startsWith("#")) continue;
    const m = FROZEN_LINE.exec(line);
    if (m === null) throw new Error(`FROZEN line ${i + 1} is not <sha256>  <path>: ${JSON.stringify(line)}`);
    entries.push({ sha256: m[1], path: m[2] });
  }
  return entries;
}

interface FrozenMismatch {
  path: string;
  expected: string;
  actual: string;
}

/** Every entry whose file under `root` is absent or hashes to something else. */
function checkFrozen(root: string, entries: FrozenEntry[]): FrozenMismatch[] {
  const out: FrozenMismatch[] = [];
  for (const e of entries) {
    const file = join(root, e.path);
    const actual = existsSync(file) ? sha256Hex(readFileSync(file)) : "missing";
    if (actual !== e.sha256) out.push({ path: e.path, expected: e.sha256, actual });
  }
  return out;
}

function describeMismatches(m: FrozenMismatch[]): string {
  return m.map((x) => `${x.path}: FROZEN says ${x.expected}, file is ${x.actual}`).join("\n");
}

// A published asset's name ends in `.v<n>.json` for a positive n; a correction
// is a new version beside the old one. The meta-schemas `*.schema.json`
// describe fusion's source files and are not published.
const PUBLISHED_NAME = /\.v[1-9][0-9]*\.json$/;

/** The published assets on disk: every `.v<n>.json` under `schemas/` and `workflows/`. */
function publishedAssets(root: string): string[] {
  return ["schemas", "workflows"]
    .flatMap((dir) => readdirSync(join(root, dir)).filter((n) => PUBLISHED_NAME.test(n)).map((n) => `${dir}/${n}`))
    .sort();
}

interface WithdrawnEntry extends FrozenEntry {
  commit: string;
}

// The commit a group's bytes stand at, named in the comment line that heads
// the group: the word `commit`, then a tag or an abbreviated hash, optionally
// in backticks, e.g. "# withdrawn under E4 and E5; the bytes stand at commit v13.1.0".
const GROUP_COMMIT = /\bcommit `?([0-9A-Za-z](?:[0-9A-Za-z._/-]*[0-9A-Za-z])?)`?/;

/**
 * `WITHDRAWN` in `FROZEN`'s line form, grouped: each entry takes its commit
 * from the nearest comment line above it, and that line must name one.
 */
function parseWithdrawn(text: string): WithdrawnEntry[] {
  const entries: WithdrawnEntry[] = [];
  let heading: { line: number; commit: string | null } | null = null;
  for (const [i, line] of text.split("\n").entries()) {
    if (line === "") continue;
    if (line.startsWith("#")) {
      heading = { line: i + 1, commit: GROUP_COMMIT.exec(line)?.[1] ?? null };
      continue;
    }
    const m = FROZEN_LINE.exec(line);
    if (m === null) throw new Error(`WITHDRAWN line ${i + 1} is not <sha256>  <path>: ${JSON.stringify(line)}`);
    if (heading === null) throw new Error(`WITHDRAWN line ${i + 1} has no comment line above it naming its commit`);
    if (heading.commit === null) throw new Error(`WITHDRAWN line ${i + 1}: the comment at line ${heading.line} names no commit`);
    entries.push({ sha256: m[1], path: m[2], commit: heading.commit });
  }
  return entries;
}

const entries = parseFrozen(readFileSync(FROZEN, "utf8"));

describe("FROZEN names the published set", () => {
  it("every line parses, names an existing file, and no path appears twice", () => {
    expect(entries.length).toBeGreaterThan(0);
    const paths = entries.map((e) => e.path);
    expect(new Set(paths).size, "a path is listed twice").toBe(paths.length);
    for (const p of paths) expect(existsSync(join(CATALOG, p)), `${p} named in FROZEN is not on disk`).toBe(true);
  });

  it("the list is exactly the .v<n>.json files under schemas/ and workflows/", () => {
    expect(entries.map((e) => e.path).sort()).toEqual(publishedAssets(CATALOG));
  });
});

describe("the frozen files are unchanged", () => {
  it("every named file hashes to its FROZEN line", () => {
    const mismatches = checkFrozen(CATALOG, entries);
    expect(mismatches, describeMismatches(mismatches)).toEqual([]);
  });

  it("a frozen file with one byte appended is reported by path (on a temporary copy)", () => {
    const copy = tmp("copy");
    for (const dir of ["schemas", "workflows"]) cpSync(join(CATALOG, dir), join(copy, dir), { recursive: true });
    expect(checkFrozen(copy, entries), "the copy is not faithful").toEqual([]);
    const target = entries[0].path;
    writeFileSync(join(copy, target), Buffer.concat([readFileSync(join(copy, target)), Buffer.from("\n")]));
    const mismatches = checkFrozen(copy, entries);
    expect(mismatches.map((m) => m.path)).toEqual([target]);
    expect(mismatches[0].expected).toBe(entries[0].sha256);
    expect(mismatches[0].actual).not.toBe(entries[0].sha256);
  });
});

describe("the explorer's assets are the bytes Prior accepted", () => {
  for (const path of EXPLORER_ASSETS) {
    it(`${path} is byte-identical to ${EXPLORER_ACCEPTED_AT}`, () => {
      expect(entries.some((e) => e.path === path), `${path} is not in FROZEN`).toBe(true);
      const accepted = execFileSync("git", ["show", `${EXPLORER_ACCEPTED_AT}:catalog/${path}`], { cwd: FUSION });
      const live = readFileSync(join(CATALOG, path));
      expect(live.equals(accepted), `${path} differs from ${EXPLORER_ACCEPTED_AT} (${live.length} vs ${accepted.length} bytes)`).toBe(true);
    });
  }
});

describe("the published-name rule and the WITHDRAWN form (fixture)", () => {
  it("a published name is .v<n>.json for a positive n; the meta-schemas and v0 are not", () => {
    for (const n of ["entry.v1.json", "entry-result.v2.json", "x.v10.json"]) expect(PUBLISHED_NAME.test(n), n).toBe(true);
    for (const n of ["workflow.schema.json", "x.v0.json", "x.v01.json", "x.v1.json.bak", "FROZEN", "WITHDRAWN"]) expect(PUBLISHED_NAME.test(n), n).toBe(false);
  });

  const hash = (c: string) => c.repeat(64);

  it("each entry takes the commit of the comment line heading its group", () => {
    const text = [
      "# one line per withdrawn asset",
      "# repair, withdrawn under E4 and E5; the bytes stand at commit v13.1.0",
      `${hash("a")}  workflows/repair.v1.json`,
      `${hash("b")}  schemas/repair-request.v1.json`,
      "",
      "# the accepted-reference entry pair, under E4 and E5, at commit `ca9eb60d`.",
      `${hash("c")}  workflows/entry.v1.json`,
      "",
    ].join("\n");
    expect(parseWithdrawn(text)).toEqual([
      { sha256: hash("a"), path: "workflows/repair.v1.json", commit: "v13.1.0" },
      { sha256: hash("b"), path: "schemas/repair-request.v1.json", commit: "v13.1.0" },
      { sha256: hash("c"), path: "workflows/entry.v1.json", commit: "ca9eb60d" },
    ]);
  });

  it("refuses an entry with no heading, a heading that names no commit, and a malformed line", () => {
    expect(() => parseWithdrawn(`${hash("a")}  schemas/x.v1.json\n`)).toThrow(/line 1 has no comment line above it/);
    expect(() => parseWithdrawn(`# withdrawn under E4\n${hash("a")}  schemas/x.v1.json\n`)).toThrow(/comment at line 1 names no commit/);
    expect(() => parseWithdrawn(`# at commit v13.1.0\n${hash("a")} schemas/x.v1.json\n`)).toThrow(/line 2 is not <sha256>  <path>/);
  });
});

// Holds once plan step 7 has written `WITHDRAWN` and removed the assets it
// names; red before that, by design.
describe("after the repair withdrawal (plan step 7)", () => {
  const withdrawn = (): WithdrawnEntry[] => parseWithdrawn(readFileSync(WITHDRAWN, "utf8"));

  it("schemas/WITHDRAWN parses in FROZEN's line form, every entry under a comment naming its commit, no path twice", () => {
    const w = withdrawn();
    expect(w.length).toBeGreaterThan(0);
    const paths = w.map((e) => e.path);
    expect(new Set(paths).size, "a path is listed twice").toBe(paths.length);
  });

  it("WITHDRAWN and FROZEN name disjoint paths", () => {
    const frozen = new Set(entries.map((e) => e.path));
    expect(withdrawn().filter((e) => frozen.has(e.path)).map((e) => e.path)).toEqual([]);
  });

  it("no withdrawn path exists on disk", () => {
    expect(withdrawn().filter((e) => existsSync(join(CATALOG, e.path))).map((e) => e.path)).toEqual([]);
  });

  it("each withdrawn hash is the sha256 of the path's bytes at the commit its group names", () => {
    const mismatches: FrozenMismatch[] = [];
    for (const e of withdrawn()) {
      const bytes = execFileSync("git", ["show", `${e.commit}:catalog/${e.path}`], { cwd: FUSION });
      const actual = sha256Hex(bytes);
      if (actual !== e.sha256) mismatches.push({ path: `${e.path} at ${e.commit}`, expected: e.sha256, actual });
    }
    expect(mismatches, describeMismatches(mismatches).replaceAll("FROZEN says", "WITHDRAWN says")).toEqual([]);
  });
});

// The frozen contract: every published schema and workflow definition is
// named in `schemas/FROZEN` with its sha256, and a change to one of them turns
// this file red. Four groups: the list parses and is exactly the published
// set; every named file hashes to its line; a temporary copy with one byte
// appended is reported; the explorer's assets are the bytes Prior accepted.
//
// Plan step 15 of 261010-1235-plan-fusion-prior-module-bundle-explorer-then-
// four-role-repair.md, the code half: `FROZEN` itself is the data half, written
// on Prior's answer 69, and nothing here reads a hash from anywhere but it.

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { catalogRoot, fusionRootOf, sha256Hex } from "../render.js";

const CATALOG = catalogRoot();
const FUSION = fusionRootOf(CATALOG);
const FROZEN = join(CATALOG, "schemas", "FROZEN");

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

/** The published assets on disk: every `.v1.json` under `schemas/` and `workflows/`. */
function publishedAssets(root: string): string[] {
  return ["schemas", "workflows"]
    .flatMap((dir) => readdirSync(join(root, dir)).filter((n) => n.endsWith(".v1.json")).map((n) => `${dir}/${n}`))
    .sort();
}

const entries = parseFrozen(readFileSync(FROZEN, "utf8"));

describe("FROZEN names the published set", () => {
  it("every line parses, names an existing file, and no path appears twice", () => {
    expect(entries.length).toBeGreaterThan(0);
    const paths = entries.map((e) => e.path);
    expect(new Set(paths).size, "a path is listed twice").toBe(paths.length);
    for (const p of paths) expect(existsSync(join(CATALOG, p)), `${p} named in FROZEN is not on disk`).toBe(true);
  });

  it("the list is exactly the .v1.json files under schemas/ and workflows/", () => {
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

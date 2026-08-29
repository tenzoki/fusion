/**
 * The archive safety filter's search key, proven from the skill's own text.
 *
 * Filter 3 keeps a candidate some shipped or project file still cites. It used
 * to grep the literal basename, so the mandated `_*_` form was invisible to it
 * (`260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`).
 * The `key=` derivation is extracted from the skill body and run through bash.
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

const body = readFileSync(join(pluginRoot, "skills/archive/SKILL.md"), "utf-8");
const derivation = body.match(/key="\$\(basename "\$f" \| sed -E '[^']+'\)"/)?.[0];

function keyFor(base: string): string {
  const r = spawnSync("bash", ["-c", `f=${base}; ${derivation}; printf '%s' "$key"`], { encoding: "utf-8" });
  expect(r.status, r.stderr).toBe(0);
  return r.stdout;
}
const matches = (key: string, s: string) =>
  spawnSync("grep", ["-q", "-E", "-e", key], { input: s, encoding: "utf-8" }).status === 0;

describe("archive filter 3: the search key matches the storeless citation form", () => {
  it("the skill body carries the key= derivation", () => {
    expect(derivation, "filter 3 no longer derives `key=` from basename via sed").toBeDefined();
  });
  it("matches _*_ and any literal marker, and not a neighbouring stamp", () => {
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

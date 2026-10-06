/**
 * The archive safety filters, proven by running the skill's own text. Filter 3's
 * key matches the `_*_` citation form (`260828-0901_*_the-archive-safety-filter-greps-the-literal-basename-and-cannot-match-the-wildcard-citation-form-the-rule-mandates.md`).
 * Filter 2 is `bin/fusion-archive survey`'s, run through the shipped blocks by
 * `codec/src/__tests__/install.test.ts`; the marker walks it replaced left with
 * the legacy workbench (FJ03d step 7). Every loop over a `SCAN_` value splits it
 * under zsh too (`261002-1948_*_scan-packages-loop-drops-the-legacy-store-under-zsh-so-the-work-package-walk-returns-nothing.md`).
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

const read = (p: string) => readFileSync(join(pluginRoot, p), "utf-8");
const body = read("skills/archive/SKILL.md");
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

describe("no shipped loop iterates a bare $SCAN_", () => {
  it("every SCAN_ value is split before a loop reads it, under zsh too", () => {
    const md = (d: string): string[] => readdirSync(join(pluginRoot, d), { withFileTypes: true }).flatMap((e) => e.isDirectory() ? md(join(d, e.name)) : e.name.endsWith(".md") ? [join(d, e.name)] : []);
    expect(["agents", "skills", "rules", "docs"].flatMap(md).filter((f) => /for [a-z_]+ in \$\{?SCAN_/.test(read(f)))).toEqual([]);
  });
});

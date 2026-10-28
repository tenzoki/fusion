import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { SYSTEM_TEMP_PREFIXES } from "../temp-paths.js";

// ---------------------------------------------------------------------------
// No shipped prompt, rule or helper names a system temp directory.
//
// A file read after its writer exits goes in the directory `bin/fusion-tmp
// path` prints (`rules/fusion-workbench-conventions.md` `## Intermediate
// files`): the system temp directories are emptied at a reboot and lie outside
// the grants that let Claude write without a prompt. This gate keeps the text
// fusion ships from prescribing one again. It reads the TEXT for a literal
// path, which is decidable; whether a program builds such a path at run time is
// not, and nothing here claims it. A helper's bare `mktemp` scratch is outside
// its question by the rule's own scope split.
//
// The boundary: a match must not follow a letter, digit, `_`, `.`, `~`, `/`,
// `>`, `}` or `)`, so `<root>/tmp`, `${…}/tmp`, `$(…)/tmp` and `.fusion-tmp`
// never match, and must not run on into a name, so `/tmpfoo` does not either.
//
// The allow-list is exact file-and-token pairs, not files: the rule section
// names the paths it forbids, and `bin/fusion-tmp` names them as its prefix
// list, its `/tmp` ignore line, and in its header (the sandbox's
// `/tmp/claude-<uid>` among them). The prefixes are `temp-paths.ts`'s own.
// ---------------------------------------------------------------------------

const PREFIX = [...SYSTEM_TEMP_PREFIXES].sort((a, b) => b.length - a.length).join("|");
const TEMP_PATH = new RegExp(`(?<![A-Za-z0-9_.~/>})])(?:${PREFIX})(?![A-Za-z0-9_-])(?:/[^\\s\`'"]*)?`, "g");

/** Every literal system temp path a line names, trailing punctuation dropped. */
function tempTokens(line: string): string[] {
  return [...line.matchAll(TEMP_PATH)].map((m) => m[0].replace(/[.,;:)]+$/, ""));
}

const ALLOWED: ReadonlySet<string> = new Set([
  "rules/fusion-workbench-conventions.md /tmp",
  "rules/fusion-workbench-conventions.md /var/folders",
  "bin/fusion-tmp /tmp",
  "bin/fusion-tmp /private/tmp",
  "bin/fusion-tmp /var/folders",
  "bin/fusion-tmp /private/var/folders",
  "bin/fusion-tmp /tmp/claude-<uid>",
]);

/** `agents/*.md`, `skills/*\/SKILL.md`, `rules/*.md` and every file in `bin/`. */
function scannedFiles(): string[] {
  const under = (dir: string, keep: (f: string) => boolean) =>
    readdirSync(join(pluginRoot, dir)).filter(keep).map((f) => `${dir}/${f}`);
  return [
    ...under("agents", (f) => f.endsWith(".md")),
    ...readdirSync(join(pluginRoot, "skills")).map((d) => `skills/${d}/SKILL.md`).filter((r) => {
      try { return statSync(join(pluginRoot, r)).isFile(); } catch { return false; }
    }),
    ...under("rules", (f) => f.endsWith(".md")),
    ...under("bin", (f) => statSync(join(pluginRoot, "bin", f)).isFile()),
  ].sort();
}

/** Every `<file> <token>` the scan finds, with its line. */
function hits(): { pair: string; where: string }[] {
  return scannedFiles().flatMap((rel) =>
    readFileSync(join(pluginRoot, rel), "utf-8").split("\n").flatMap((line, i) =>
      tempTokens(line).map((t) => ({ pair: `${rel} ${t}`, where: `${rel}:${i + 1}: ${t}` })),
    ),
  );
}

describe("temp-path lint: agents, skills, rules and bin name no system temp path", () => {
  it("finds only the allow-listed pairs", () => {
    const offenders = hits().filter((h) => !ALLOWED.has(h.pair)).map((h) => h.where);
    expect(
      offenders,
      "a shipped file names a system temp path. Write through the directory `bin/fusion-tmp path` prints (`rules/fusion-workbench-conventions.md` `## Intermediate files`), or, for a self-removed scratch file, use `mktemp` without a literal path.",
    ).toEqual([]);
  });

  it("every allow-listed pair is still present", () => {
    const found = new Set(hits().map((h) => h.pair));
    expect([...ALLOWED].filter((p) => !found.has(p)), "an allow-list entry names nothing any more; drop it").toEqual([]);
  });

  it("negative control: a fixture line naming /tmp/x fails the same predicate", () => {
    expect(tempTokens("write the report to /tmp/x first")).toEqual(["/tmp/x"]);
    expect(tempTokens('C="${TMPDIR:-/tmp}/a"; cd /private/tmp; ls /var/folders/ab/T/x')).toEqual([
      "/tmp",
      "/private/tmp",
      "/var/folders/ab/T/x",
    ]);
  });

  it("positive control: the boundary spares project and fusion-tmp paths", () => {
    for (const line of ["<root>/tmp", "${ROOT}/tmp/x", "$(pwd)/tmp", "~/.fusion-tmp/ab12cd34/x", "./tmp/x", "tmp/x", "/tmpfoo"]) {
      expect(tempTokens(line), line).toEqual([]);
    }
  });
});

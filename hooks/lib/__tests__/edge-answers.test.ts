/**
 * `bin/fusion-edge-answers`' entry, spawned over a scratch workbench: which
 * files are run files, what a row carries, and what the outcome parse refuses.
 *
 * The cases that matter are the ones the ruling on
 * `260918-0712_*_how-does-the-curators-edge-survey-know-not-to-re-propose-an-edge-the-user-declined.md`
 * turns on. `not-offered` is an outcome value like the other four. The
 * consequence group is NOT printed, because the suppression key no longer reads
 * it. And every way the parse can fail comes back `none` or `unreadable`, never
 * an outcome value — a wrong suppression is silent, a wrong re-proposal is a
 * question asked twice.
 */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { TEST_DIST } from "./helpers/guard-harness.js";

const ENTRY = join(TEST_DIST, "edge-answers.js");

function run(cwd: string, ...args: string[]) {
  return spawnSync(process.execPath, [ENTRY, ...args], { cwd, encoding: "utf-8" });
}

/** A workbench holding the given files, each keyed by workbench-relative path. */
function scratch(files: Record<string, string>): string {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "edge-answers-")));
  const put = (rel: string, text: string) => {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  };
  put("fusion-workbench/.fusion-setup", "{}");
  for (const [rel, text] of Object.entries(files)) put(`fusion-workbench/${rel}`, text);
  return root;
}

/** One ledger entry proposing `a -> b` into `**Cross-references:**`. */
function entry(id: string, a: string, b: string, group = "work-item citation edge"): string {
  return [
    `### ${id} — a proposed edge`,
    "",
    "- **Surface:** work item head field",
    `- **Edge:** \`${a}\` -> \`${b}\`, into \`**Cross-references:**\``,
    `- **Consequence group:** ${group}`,
    "",
  ].join("\n");
}

const A = "260101-0001-alpha.md";
const B = "260101-0002-beta.md";

/** `KEY=value` lines as a map, and the indented rows as a list. */
function parse(stdout: string) {
  const keys = new Map<string, string>();
  const rows: string[] = [];
  for (const line of stdout.split("\n")) {
    if (line.startsWith("  ")) rows.push(line.trim());
    else if (line.includes("=")) keys.set(line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1));
  }
  return { keys, rows };
}

describe("fusion-edge-answers: the corpus it reads", () => {
  it("reads a curator run file and ignores a file whose slug merely contains the words", () => {
    const root = scratch({
      "shared/history/260101-0100-curator-run.md": `## 1. Outcomes\n\n${entry("L01", A, B)}`,
      // A real defect record in this project is named this way; it is not a run file.
      "shared/issues/260102-0842_c_where-a-prior-curator-run-file-is-found.md": entry("L01", A, B),
    });
    const r = run(root);
    expect(r.status, r.stderr).toBe(0);
    const { keys } = parse(r.stdout);
    expect(keys.get("run-files")).toBe("1");
    expect(keys.get("edge-entries")).toBe("1");
  });

  it("reads archive/ like the live tree, because an archived refusal is still a refusal", () => {
    const outcomes = "## 9. Outcomes\n\n| Id | Outcome |\n|---|---|\n| L01 | skipped |\n";
    const root = scratch({
      "archive/circles/260101-0000-x/history/260101-0100-curator-run.md":
        `${entry("L01", A, B)}\n${outcomes}`,
    });
    const { keys, rows } = parse(run(root).stdout);
    expect(keys.get("run-files")).toBe("1");
    expect(rows).toEqual([`skipped     ${A} -> ${B}  into Cross-references`]);
  });

  it("reports an empty corpus as an answer about the project, at exit 0", () => {
    const r = run(scratch({}));
    expect(r.status).toBe(0);
    expect(parse(r.stdout).keys.get("verdict")).toBe("empty");
  });

  it("is a usage error on an argument, and exit 2 outside a workbench", () => {
    expect(run(scratch({}), "--all").status).toBe(1);
    expect(run(realpathSync(mkdtempSync(join(tmpdir(), "no-workbench-")))).status).toBe(2);
  });
});

describe("fusion-edge-answers: what a row carries", () => {
  const outcomes = (body: string) => `## 9. Outcomes\n\n${body}\n`;

  /** The one row a single-entry corpus prints. */
  function oneRow(outcomeBody: string, e = entry("L01", A, B)): string {
    const root = scratch({
      "shared/history/260101-0100-curator-run.md": `${e}\n${outcomes(outcomeBody)}`,
    });
    const { rows } = parse(run(root).stdout);
    expect(rows).toHaveLength(1);
    return rows[0];
  }

  it("carries the outcome value, the pair and the field, and NOT the consequence group", () => {
    const row = oneRow("| L01 | applied |");
    expect(row).toBe(`applied     ${A} -> ${B}  into Cross-references`);
    expect(row).not.toContain("citation edge");
  });

  it("reads `not-offered` like any other value — the fifth is not a special case", () => {
    expect(oneRow("- L01 — not-offered (a candidate; the gate never put it)")).toContain("not-offered");
  });

  it("keeps the field, so an answer about one field never suppresses the other", () => {
    const e = entry("L01", A, B).replace("Cross-references", "Depends-on");
    expect(oneRow("| L01 | skipped |", e)).toContain("into Depends-on");
  });

  it("takes the later run file's answer where two files carry the same pair", () => {
    const root = scratch({
      "shared/history/260101-0100-curator-run.md": `${entry("L01", A, B)}\n${outcomes("| L01 | skipped |")}`,
      "circles/x/analyses/260202-0900-curator-run.md": `${entry("L04", A, B)}\n${outcomes("| L04 | failed | the write did not land |")}`,
    });
    const { keys, rows } = parse(run(root).stdout);
    expect(keys.get("edge-entries")).toBe("2");
    expect(keys.get("pairs")).toBe("1");
    expect(rows[0].startsWith("failed")).toBe(true);
  });
});

describe("fusion-edge-answers: every way the parse fails, it fails toward re-asking", () => {
  it("an entry with no Outcomes section at all reads `none`", () => {
    const root = scratch({ "shared/history/260101-0100-curator-run.md": entry("L01", A, B) });
    expect(parse(run(root).stdout).rows[0].startsWith("none")).toBe(true);
  });

  it("a prose mention of the id is not an outcome statement", () => {
    // Drawn from a real run file: "a hand-transcription of L02 failed its own
    // staleness check". Read as a row, this reports a refused edge as `failed`.
    const root = scratch({
      "shared/history/260101-0100-curator-run.md": [
        entry("L02", A, B),
        "## 9. Outcomes",
        "",
        "A hand-transcription of L02 failed its own staleness check on the first attempt.",
        "",
      ].join("\n"),
    });
    expect(parse(run(root).stdout).rows[0].startsWith("none")).toBe(true);
  });

  it("a row carrying no vocabulary word reads `unreadable`, and says so in a mandatory note", () => {
    const root = scratch({
      "shared/history/260101-0100-curator-run.md": [
        entry("L01", A, B),
        "## 9. Outcomes",
        "",
        "| L01 | see the paragraph above |",
        "",
      ].join("\n"),
    });
    const { keys, rows } = parse(run(root).stdout);
    expect(rows[0].startsWith("unreadable")).toBe(true);
    expect(keys.get("unreadable")).toBe("1");
    expect(keys.get("note")).toMatch(/propose them again/);
  });

  it("an id named only inside a range has no row of its own and reads `none`", () => {
    const root = scratch({
      "shared/history/260101-0100-curator-run.md": [
        entry("L03", A, B),
        "## 9. Outcomes",
        "",
        "| L01–L12 | applied |",
        "",
      ].join("\n"),
    });
    expect(parse(run(root).stdout).rows[0].startsWith("none")).toBe(true);
  });
});

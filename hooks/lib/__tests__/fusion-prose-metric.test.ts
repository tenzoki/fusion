import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// bin/fusion-prose-metric is a bash script whose OWN HEADER is the authoritative
// documentation of what it does, so these tests drive the real script and pin
// what that header states rather than what the awk under it does: the em-dash
// count, the prose word count, the four regions that are not prose, the
// narrowing to U+2014, and the exit-code table.
//
// THE CASE THE PROGRAM EXISTS FOR is that a file's exhibits of the em-dash fault
// are not instances of it; that divergence is pinned against a synthetic fixture
// rather than the shipped file, so a corpus edit cannot redden this gate. Every
// expected number was derived by hand from the header's rule before the script
// was run. Issue 260821-0144, and 260822-1506 for the two limits and the total.

const script = join(pluginRoot, "bin", "fusion-prose-metric");
const dir = mkdtempSync(join(tmpdir(), "fusion-prose-metric-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

interface Row { em: number; words: number; rate: number; permit: number; verdict: string }

function write(name: string, lines: string[]): string {
  const path = join(dir, name);
  writeFileSync(path, lines.join("\n") + "\n");
  return path;
}

// A data row is recognised by its name column, the path as given, so the header
// and `total (N files)` rows fall out — and so does an unreadable file, which
// appears in no row at all and is asserted to below.
function run(paths: string[]): { status: number; stderr: string; rows: Map<string, Row> } {
  const r = spawnSync(script, paths, { encoding: "utf-8" });
  const rows = new Map<string, Row>();
  for (const line of (r.stdout ?? "").split("\n")) {
    if (!line.startsWith(dir)) continue;
    const f = line.trim().split(/\s+/);
    rows.set(f[0], { em: +f[1], words: +f[2], rate: +f[3], permit: +f[4], verdict: f[5] });
  }
  return { status: r.status ?? -1, stderr: r.stderr ?? "", rows };
}

/** The one row a single-file run prints; asserts that run exited 0. */
function measure(name: string, lines: string[]): Row {
  const path = write(name, lines);
  const out = run([path]);
  expect(out.status, out.stderr).toBe(0);
  return out.rows.get(path)!;
}

describe("fusion-prose-metric: the counts it reports", () => {
  it("counts prose em-dashes and prose words, and reports rather than gates", () => {
    // 3 em-dashes; 19 whitespace-separated tokens, the em-dashes among them.
    // permit is int(19 / 1000) = 0, so the verdict is `over` and the run still
    // exits 0, which `measure` asserts: "it reports and it never gates".
    const row = measure("prose.md", [
      "The gate stops the run — that is the point.",
      "A second clause — also prose — counts twice.",
    ]);
    expect(row).toEqual({ em: 3, words: 19, rate: 157.9, permit: 0, verdict: "over" });
  });
});

describe("fusion-prose-metric: the four regions that are not prose", () => {
  // Word counts exclude the same four regions, so a file is never credited with
  // the words its exhibits are made of. Each case asserts both numbers.
  it("(1) excludes a fenced code block, opening and closing fence included", () => {
    const row = measure("fence.md", [
      "Prose above — one.", // 4 words, 1 em-dash
      "```text",
      "inside — the fence — twice", // fence content, and both fence lines, drop out
      "```",
      "Prose below.", // 2 words
    ]);
    expect(row).toMatchObject({ em: 1, words: 6 });
  });

  it("(2) excludes an inline code span, delimiters included", () => {
    const row = measure("span.md", ["Text with a span — real, and `a — b` masked."]);
    expect(row).toMatchObject({ em: 1, words: 8 });
  });

  it("(3) excludes a block-quote line — the whole line, not just the marker", () => {
    const row = measure("quote.md", ["Kept — one.", "> Quoted — two — three."]);
    expect(row).toMatchObject({ em: 1, words: 3 });
  });

  it("(4) excludes an examples/anti_examples subtree in a YAML profile", () => {
    // The subtree runs from the key line to the next non-blank line indented no
    // further than the key, so `note:` ends it and is counted. This is what makes
    // a voice profile measurable: chat-voice-de.yaml carries 6 em-dashes, 4 of
    // them the anti-example strings it exists to forbid.
    const lines = [
      "voice: terse",
      "anti_examples:",
      '  - "bad — style"',
      '  - "worse — still"',
      "note: kept — yes",
    ];
    expect(measure("profile.yaml", lines)).toMatchObject({ em: 1, words: 6 });
    // Region 4 alone is keyed on the extension. The same text as Markdown has no
    // subtree to exclude and all three em-dashes are prose.
    expect(measure("profile.md", lines).em).toBe(3);
  });
});

describe("fusion-prose-metric: the two limits the header states, and the total row", () => {
  it("does not exclude an indented (4-space) code block", () => {
    expect(measure("indented.md", ["Kept — one.", "", "    code — here"])).toMatchObject({ em: 2, words: 6 });
  });

  it("does not match a code span that closes on a later line", () => {
    const row = measure("multiline.md", ["Open `span — here", "closes` — there."]);
    expect(row).toMatchObject({ em: 2, words: 7 });
  });

  it("sums the total row over the files, with its own rate, permit and verdict", () => {
    const a = write("a.md", ["One — two."]); // 1, 3
    const b = write("b.md", ["Three — four — five."]); // 2, 5
    const r = spawnSync(script, [a, b], { encoding: "utf-8" });
    expect(r.stdout).toMatch(/^total \(2 files\)\s+3\s+8\s+375\.0\s+0\s+over$/m);
  });
});

describe("fusion-prose-metric: exhibits of the fault are not instances of it", () => {
  it("reads one em-dash where a whole-file grep reads seven", () => {
    const lines = [
      "The ceiling is one em-dash per 1000 prose words — this file's own voice.",
      "Write `—` where a clause needs a break.",
      "Anti-examples, quoted as faults:",
      "",
      "> Bad: the gate — which stops the run — is the point.",
      "> Bad: a second — parenthetical — like this.",
      "",
      "```text",
      "Bad: a fenced exhibit — also a fault.",
      "```",
    ];
    const naive = lines.join("\n").split("—").length - 1; // what `grep -o` counts
    expect(naive, "the fixture must reproduce the shape that broke the old count").toBe(7);
    expect(measure("exhibits.md", lines).em).toBe(1);
  });
});

describe("fusion-prose-metric: only — U+2014 is counted", () => {
  it("ignores – U+2013 and - U+002D", () => {
    // A deliberate narrowing: the fault measured is the em-dash parenthetical,
    // and the en-dash is a numeric range in this repository's prose.
    const mixed = ["Ranges 5–10 and 20–30, hyphen-joined words, and — one em-dash."];
    expect(measure("dashes.md", mixed).em).toBe(1);
    expect(measure("endash.md", ["Ranges 5–10 and 20–30 only."]).em).toBe(0);
  });
});

describe("fusion-prose-metric: the exit-code table in the header", () => {
  it("exits 1 when no file is named", () => {
    const r = spawnSync(script, [], { encoding: "utf-8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("usage: fusion-prose-metric");
  });

  it("exits 2 for an unreadable path, measures the readable ones, names the path on stderr", () => {
    const good = write("readable.md", ["One clause — measured."]);
    const missing = join(dir, "absent.md");
    const out = run([good, missing]);
    expect(out.status).toBe(2);
    expect(out.rows.get(good)).toMatchObject({ em: 1, words: 4 });
    expect(out.rows.has(missing), "an unreadable path appears in no row").toBe(false);
    expect(out.stderr).toContain(missing);
  });
});

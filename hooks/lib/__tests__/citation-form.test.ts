/**
 * Citation form at write time — `lib/citation-form.ts` and the tracker trigger
 * that runs it (issue `260906-0115_*_three-agents-in-one-session-wrote-a-citation-the-always-on-rule-forbids-and-only-a-later-gate-caught-it.md`).
 *
 * WHAT IS ACTUALLY UNDER TEST, and it is not the grammar. The grammar is
 * `lib/citation-scan.ts` and has its own suites; nothing here re-asserts what a
 * token parses to. What is asserted is the three decisions this measurement
 * makes ON TOP of that grammar, because each of them is a place the mechanism
 * could become noise instead of a report:
 *
 *   1. WHICH FILE. A `.md` under the workbench, outside the frozen stores.
 *   2. WHICH LINES. The lines THIS tool call wrote, so an edit is never told
 *      about a violation somebody else left in the same file.
 *   3. WHICH VERDICT. `store-prefixed` and `stale-marker`, never `dangling`,
 *      and never a hit the grammar marked as somebody's exhibit.
 *
 * THE FIXTURES ARE STORE-PREFIXED CITATIONS ON PURPOSE, which is exactly what
 * this repository's own `fusion.json` says test files are for: `hooks/lib/
 * __tests__/*.ts` is deliberately absent from `citations.extraPaths` because
 * the record names in it are exhibits rather than pointers. A fixture here
 * names nothing.
 */

import { describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  citationFormSentence,
  lastReportedCitationForm,
  measureCitationForm,
  recordReportedCitationForm,
  workbenchRecordPath,
  writtenLines,
} from "../citation-form.js";
import { CASE_TIMEOUT, readEvents, runToolCall, withProject } from "./helpers/guard-harness.js";

/* ------------------------------------------------------------------ *
 * A throwaway workbench with two records to resolve against
 * ------------------------------------------------------------------ */

/** The seeded records. One closed issue and one history note, and nothing else. */
const CLOSED_ISSUE = "shared/issues/260901-1200_c_a-closed-issue.md";
const HISTORY_NOTE = "shared/history/260901-1300-coder-a-history-note.md";

/** The retired spelling of the history note, as a record would have written it. */
const STORE_PREFIXED = `shared/history/260901-1300-coder-a-history-note.md`;
/** The closed issue cited under the marker it no longer carries. */
const STALE_MARKER = "260901-1200_o_a-closed-issue.md";
/** A name no seeded record carries, and no future one will. */
const NOWHERE = "260812-2116_o_a-name-this-workbench-never-held.md";
/** The correct spelling of the closed issue. */
const STORELESS = "260901-1200_*_a-closed-issue.md";

interface Scratch {
  /** The project root — what `findWorkbenchRoot()` would return. */
  root: string;
}

function withScratch<T>(fn: (s: Scratch) => T): T {
  const root = mkdtempSync(join(tmpdir(), "fusion-citform-"));
  try {
    const wb = join(root, "fusion-workbench");
    for (const rel of [".fusion-setup", CLOSED_ISSUE, HISTORY_NOTE]) {
      const abs = join(wb, rel);
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, "# seeded\n", "utf-8");
    }
    return fn({ root });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/** Judge `text` as a whole-file Write of `rel`, and return the violation rows. */
function judgeWrite(root: string, text: string, rel = "shared/issues/260906-1200_o_probe.md") {
  const report = measureCitationForm(root, rel, text, writtenLines("Write", {}, text));
  expect(report.why, "the scratch workbench should always be measurable").toBe("");
  return report;
}

/* ------------------------------------------------------------------ *
 * 1. Which file
 * ------------------------------------------------------------------ */

describe("the trigger's file test", () => {
  const root = "/p";
  const wb = "/p/fusion-workbench";

  it("takes a record under the workbench, as a workbench-relative path", () => {
    expect(workbenchRecordPath(root, `${wb}/shared/issues/260906-1200_o_x.md`)).toBe(
      "shared/issues/260906-1200_o_x.md",
    );
  });

  it("takes the marker-less kinds too — two of the three instances were one", () => {
    // A history file and an analysis are outside the release gate's own corpus
    // (`lib/citation-corpus.ts` judges them not edited), and both were caught
    // by the hand-run sweep rather than by a gate. Write time is where they are
    // reachable at all.
    expect(workbenchRecordPath(root, `${wb}/shared/history/260906-1200-coder-x.md`)).not.toBeNull();
    expect(workbenchRecordPath(root, `${wb}/shared/analyses/260906-1200-x.md`)).not.toBeNull();
  });

  it("declines a file that is not Markdown", () => {
    expect(workbenchRecordPath(root, `${wb}/agentstate.yaml`)).toBeNull();
  });

  it("declines a file outside the workbench", () => {
    expect(workbenchRecordPath(root, "/p/rules/some-rule.md")).toBeNull();
    expect(workbenchRecordPath(root, "/p/fusion-workbench-notes/x.md")).toBeNull();
  });

  it("declines the frozen stores — repairing an archived record rewrites history", () => {
    expect(workbenchRecordPath(root, `${wb}/archive/260901-1200-sweep/shared/issues/a.md`)).toBeNull();
    expect(workbenchRecordPath(root, `${wb}/stashes/a.md`)).toBeNull();
    expect(workbenchRecordPath(root, `${wb}/.migration-v2-backup/a.md`)).toBeNull();
  });
});

/* ------------------------------------------------------------------ *
 * 2. Which lines
 * ------------------------------------------------------------------ */

describe("the report is scoped to what this call wrote", () => {
  const TEXT = ["one", "two", "three", "four"].join("\n");

  it("a Write owns every line of the file it replaced", () => {
    expect([...writtenLines("Write", { content: TEXT }, TEXT)!]).toEqual([1, 2, 3, 4]);
  });

  it("an Edit owns the lines its inserted text occupies, and no others", () => {
    expect([...writtenLines("Edit", { new_string: "two\nthree" }, TEXT)!]).toEqual([2, 3]);
  });

  it("an Edit owns EVERY occurrence, which is what replace_all produces", () => {
    const doubled = "a\nX\nb\nX\nc";
    expect([...writtenLines("Edit", { new_string: "X" }, doubled)!]).toEqual([2, 4]);
  });

  it("a MultiEdit owns the union of its edits", () => {
    expect([...writtenLines("MultiEdit", { edits: [{ new_string: "one" }, { new_string: "four" }] }, TEXT)!]).toEqual([
      1, 4,
    ]);
  });

  it("says nothing when the payload names no written text", () => {
    expect(writtenLines("Edit", {}, TEXT)).toBeNull();
    expect(writtenLines("MultiEdit", { edits: [] }, TEXT)).toBeNull();
    expect(writtenLines("NotebookEdit", { new_source: "x" }, TEXT)).toBeNull();
  });

  it("reports a violation an edit introduced", () => {
    withScratch(({ root }) => {
      const text = `# probe\n\nclean line\nsee ${STORE_PREFIXED}\n`;
      const report = measureCitationForm(
        root,
        "shared/issues/260906-1200_o_probe.md",
        text,
        writtenLines("Edit", { new_string: `see ${STORE_PREFIXED}` }, text),
      );
      expect(report.violations.map((v) => v.status)).toEqual(["store-prefixed"]);
    });
  });

  it("stays silent about a violation the edit did not touch", () => {
    // The defect this answers is a report firing at somebody else's keystroke:
    // an agent editing one paragraph of a long record must not be handed a
    // violation another writer left in a paragraph it never opened.
    withScratch(({ root }) => {
      const text = `# probe\n\nsomebody else wrote ${STORE_PREFIXED}\nthis line is mine\n`;
      const report = measureCitationForm(
        root,
        "shared/issues/260906-1200_o_probe.md",
        text,
        writtenLines("Edit", { new_string: "this line is mine" }, text),
      );
      expect(report.violations).toEqual([]);
      expect(report.signature).toBe("");
    });
  });

  it("measures a fenced exhibit elsewhere in the file, not the fragment alone", () => {
    // The whole file is always scanned so the fence and blockquote context is
    // the real one. A fragment scanned by itself would carry no fence, and the
    // token below would be judged as a pointer.
    withScratch(({ root }) => {
      const text = ["# probe", "", "```", STORE_PREFIXED, "```", ""].join("\n");
      const report = measureCitationForm(
        root,
        "shared/issues/260906-1200_o_probe.md",
        text,
        writtenLines("Edit", { new_string: STORE_PREFIXED }, text),
      );
      expect(report.violations).toEqual([]);
    });
  });
});

/* ------------------------------------------------------------------ *
 * 3. Which verdict
 * ------------------------------------------------------------------ */

describe("which verdicts reach the writer", () => {
  it("reports a store-prefixed citation, with the token and the storeless fix", () => {
    withScratch(({ root }) => {
      const report = judgeWrite(root, `# probe\n\nfiled against ${STORE_PREFIXED}\n`);
      expect(report.violations.map((v) => v.status)).toEqual(["store-prefixed"]);
      const sentence = citationFormSentence(report);
      expect(sentence).toContain(STORE_PREFIXED);
      expect(sentence).toContain("260901-1300-coder-a-history-note.md");
      expect(sentence).toContain("rules/fusion-workbench-conventions.md");
    });
  });

  it("reports a stale marker — the record exists, under another one", () => {
    withScratch(({ root }) => {
      const report = judgeWrite(root, `# probe\n\nanswered by ${STALE_MARKER}\n`);
      expect(report.violations.map((v) => v.status)).toEqual(["stale-marker"]);
      expect(citationFormSentence(report)).toContain("_*_");
    });
  });

  it("says nothing about a dangling citation, which is the deliberate omission", () => {
    // A failed lookup is what a dead pointer, a probe fixture quoted in prose,
    // an unqualified foreign record and a record about to be written all
    // produce. Issue 260830-2235_*_the-fabricated-name-exemption-keys-on-the-literal-foo-so-every-realistic-probe-fixture-is-read-as-a-real-citation.md
    // measured six instances of the fixture case and states that no decidable
    // keying property has been proposed. It still reddens the release gate;
    // this mechanism does not reach it and must not pretend to.
    withScratch(({ root }) => {
      const report = judgeWrite(root, `# probe\n\nsee ${NOWHERE}\n`);
      expect(report.violations).toEqual([]);
    });
  });

  it("says nothing about a citation that is already in the right form", () => {
    withScratch(({ root }) => {
      expect(judgeWrite(root, `# probe\n\nanswered by ${STORELESS}\n`).violations).toEqual([]);
    });
  });

  it("says nothing about a fenced exhibit, or a quoted one", () => {
    // The rule's own closing paragraph separates a pointer from a record that
    // talks about one, and the grammar implements that as its exemption chain.
    // Get this wrong and the mechanism is loudest on the records whose subject
    // IS citation form — the record that filed this defect among them.
    withScratch(({ root }) => {
      const fenced = ["# probe", "", "```", `wrong: ${STORE_PREFIXED}`, "```", ""].join("\n");
      expect(judgeWrite(root, fenced).violations).toEqual([]);

      const quoted = `# probe\n\n> the writer had put ${STORE_PREFIXED}\n`;
      expect(judgeWrite(root, quoted).violations).toEqual([]);
    });
  });

  it("counts every violation on the written lines, and names the first few", () => {
    withScratch(({ root }) => {
      const lines = ["# probe", ""];
      for (let i = 0; i < 6; i++) lines.push(`row ${i}: ${STORE_PREFIXED}`);
      const report = judgeWrite(root, lines.join("\n") + "\n");
      expect(report.violations.length).toBe(6);
      const sentence = citationFormSentence(report);
      expect(sentence).toContain("6 citation(s)");
      expect(sentence).toContain("(2 more in the same file)");
    });
  });

  it("has nothing to say about a clean record, and produces no signature", () => {
    withScratch(({ root }) => {
      const report = judgeWrite(root, "# probe\n\nNothing here points anywhere.\n");
      expect(report.violations).toEqual([]);
      expect(report.signature).toBe("");
      expect(citationFormSentence(report)).toBe("");
    });
  });

  it("declines to measure when the payload names no written text", () => {
    withScratch(({ root }) => {
      const report = measureCitationForm(root, "shared/issues/260906-1200_o_probe.md", "x", null);
      expect(report.why).not.toBe("");
      expect(report.violations).toEqual([]);
    });
  });
});

/* ------------------------------------------------------------------ *
 * The throttle
 * ------------------------------------------------------------------ */

describe("the throttle", () => {
  it("reads back what was written, and reads absence as never-reported", () => {
    withScratch(({ root }) => {
      expect(lastReportedCitationForm(root)).toBe("");
      recordReportedCitationForm(root, "sig-1");
      expect(lastReportedCitationForm(root)).toBe("sig-1");
    });
  });

  it("changes when one of two violations is repaired", () => {
    withScratch(({ root }) => {
      const both = judgeWrite(root, `# probe\n\na ${STORE_PREFIXED}\nb ${STALE_MARKER}\n`);
      const one = judgeWrite(root, `# probe\n\na ${STORE_PREFIXED}\nb ${STORELESS}\n`);
      expect(both.signature).not.toBe("");
      expect(one.signature).not.toBe("");
      expect(one.signature).not.toBe(both.signature);
    });
  });
});

/* ------------------------------------------------------------------ *
 * End to end, through the real hook
 * ------------------------------------------------------------------ */

/** The context sentence the tracker handed back to the model, or "". */
function context(post: { hookSpecificOutput?: { additionalContext?: string } }): string {
  return post.hookSpecificOutput?.additionalContext ?? "";
}

/** One record landing under the workbench. Returns the tracker's reply. */
function recordLands(root: string, rel: string, body: string): string {
  const abs = resolve(root, "fusion-workbench", rel);
  const { post } = runToolCall(root, "Write", { file_path: abs, content: body }, () => {
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body, "utf-8");
  });
  return context(post);
}

describe("the tracker reports citation form when a record lands", () => {
  const PROBE = "shared/issues/260906-1200_o_probe.md";

  it(
    "hands the writer the violation, once, and records it as an event",
    () => {
      withProject(({ root }) => {
        const body = `# probe\n\nfiled against ${STORE_PREFIXED}\n`;
        const first = recordLands(root, PROBE, body);
        expect(first).toContain("in a form this project retired");
        expect(first).toContain(STORE_PREFIXED);
        expect(readEvents(root).map((e) => e.event)).toContain("citation_form");

        // The same unrepaired file written again says nothing: a message that
        // arrives every time is one the reader learns to read past, which is
        // the failure the whole family exists to avoid.
        expect(recordLands(root, PROBE, body)).toBe("");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "says nothing when the record's citations are in the right form",
    () => {
      withProject(({ root }) => {
        // The cited record is seeded first, so the citation resolves.
        const seeded = "shared/history/260901-1300-coder-a-history-note.md";
        const abs = resolve(root, "fusion-workbench", seeded);
        mkdirSync(dirname(abs), { recursive: true });
        writeFileSync(abs, "# seeded\n", "utf-8");

        expect(recordLands(root, PROBE, "# probe\n\nsee 260901-1300-coder-a-history-note.md\n")).toBe("");
        expect(readEvents(root).map((e) => e.event)).not.toContain("citation_form");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "says nothing about a file that is not a workbench record",
    () => {
      withProject(({ root }) => {
        const abs = resolve(root, "docs", "note.md");
        const body = `see ${STORE_PREFIXED}\n`;
        const { post } = runToolCall(root, "Write", { file_path: abs, content: body }, () => {
          mkdirSync(dirname(abs), { recursive: true });
          writeFileSync(abs, body, "utf-8");
        });
        expect(context(post)).toBe("");
      });
    },
    CASE_TIMEOUT,
  );
});

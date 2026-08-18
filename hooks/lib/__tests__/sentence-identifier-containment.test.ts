/**
 * Containment: an emitted hook sentence may carry only the identifiers its own
 * input supplied.
 *
 * WHY. On 2026-08-17 the two model-facing sentence builders shipped four of
 * fusion's OWN record stamps and a fusion commit hash into a consuming
 * project's session (issue `260817-2110`). They were read there as local
 * evidence, because the sentence around them was a true measurement of that
 * project. The fix removed them by hand and added no gate; this is the gate
 * (issue `260817-2131`). The criterion is a set relation, not a pattern:
 *
 *     identifiers(builder(input)) ⊆ identifiers(input)
 *
 * Nothing authored in the source may contribute an identifier. No allowlist and
 * no exemptions: a new `parts.push` and a new report field are both covered on
 * the day they are written.
 *
 * NOT a blacklist on identifier shape — `260817-2131`'s own proposal, and it
 * cannot be run: `coverageSentence()` emits `since`, `head` and one short hash
 * per uncovered commit, so a CORRECT emission there is a sentence full of
 * seven-character hashes, the consuming project's own. NOT a resolution check
 * either — `reference-resolution-lint.test.ts` asserts a citation resolves HERE,
 * and all four incident identifiers did. The defect is a property of an
 * identifier's origin, not of its text.
 *
 * WHAT IT DOES NOT COVER. Branches nobody drives, hence every branch below and
 * the two silent ones included; builders the registry does not name, hence the
 * completeness assertion at the foot; the other composed channels (config
 * advisories, the SessionStart banner, `bin/` helper stderr, the monitor HTML);
 * identifiers that are neither stamp nor hash, such as a Circle slug in prose;
 * and a 7+ character hash drawn entirely from `a`-`f`, excluded so English words
 * spelled in hex ("defaced") are not read as commits, about 1 in 700. Record
 * paths and Circle directory names need no class of their own — both carry a
 * stamp by the naming convention.
 *
 * The static shipped surface (`rules/`, `agents/`, `skills/`) is deliberately
 * OUT of scope and must not be swept: those citations are provenance addressed
 * to a fusion developer. Analysis: `shared/analyses/260818-0715-preventing-
 * fusion-internal-identifiers-from-reaching-a-consuming-project.md`.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { coverageSentence } from "../review-coverage.js";
import type { Commit, CoverageReport } from "../review-coverage.js";
import { stagingSentence } from "../staging-drift.js";
import type { StagingReport, StagingRow } from "../staging-drift.js";

const trackerPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "tracker.ts");

/* ---------------------------------------------------------------- *
 * Extraction and the relation
 * ---------------------------------------------------------------- */

interface Ident {
  id: string;
  kind: string;
}

/** Every fusion-shaped identifier in a string, deduplicated, first-seen order. */
function identifiers(text: string): Ident[] {
  const out = new Map<string, Ident>();
  for (const m of text.matchAll(/\b\d{6}-\d{4}\b/g)) {
    out.set(m[0], { id: m[0], kind: "record stamp (YYMMDD-HHMM)" });
  }
  for (const m of text.matchAll(/\b[0-9a-f]{7,40}\b/g)) {
    if (!/\d/.test(m[0])) continue; // see the header: hex-spelled English words
    if (!out.has(m[0])) out.set(m[0], { id: m[0], kind: "git object name" });
  }
  return [...out.values()];
}

/** The identifiers the input supplied — every string anywhere in the report. */
const supplied = (input: unknown): string[] => identifiers(JSON.stringify(input)).map((i) => i.id);

/** What the output carries and the input did not. Empty is the passing state. */
function foreign(output: string, input: unknown): Ident[] {
  const from = new Set(supplied(input));
  return identifiers(output).filter((i) => !from.has(i.id));
}

function containmentMessage(
  builder: string,
  branch: string,
  found: Ident[],
  output: string,
  input: unknown,
): string {
  const list = supplied(input);
  return [
    "",
    `\`${builder}()\` emitted ${found.length} identifier(s) that its own input did not supply, ` +
      `on the "${branch}" branch:`,
    ...found.map((f) => `    FOREIGN  ${f.id}   — ${f.kind}`),
    "",
    `  supplied by this call's input: ${list.length === 0 ? "(none)" : list.join(", ")}`,
    "  the sentence it returned:",
    `    ${output}`,
    "",
    "THE CRITERION. An emitted sentence may carry only identifiers its own input",
    "supplied, because a consuming project resolves none of fusion's. A stamp, a",
    "commit hash or a workbench record path authored into a `parts.push` literal",
    "names a file that exists in THIS repository and nowhere else — and it arrives",
    "in that project's session welded to a true measurement of that project, so it",
    "is read as local evidence. That happened on 2026-08-17 (issue `260817-2110`)",
    "and it cost a correction in front of the user.",
    "",
    "THE FIX is to move the citation into a source comment above the builder, where",
    "the reader is a fusion developer and `reference-resolution-lint.test.ts` keeps",
    "it resolving. Do NOT relax this gate into a shape allowlist: shape does not",
    "decide it — the consuming project's own commit hashes are exactly what the",
    "uncovered branch is for, and they pass here because the input supplied them.",
  ].join("\n");
}

/* ---------------------------------------------------------------- *
 * The registry: every builder, every branch
 * ---------------------------------------------------------------- */

// Synthetic values, chosen so a collision with a real fusion identifier is not
// possible: stamps in year 99, hashes no object in this repository has.
const commit = (short: string, subject: string): Commit => ({
  full: short + "0".repeat(40 - short.length),
  short,
  subject,
});

const coverage = (over: Partial<CoverageReport>): CoverageReport => ({
  root: "/tmp/consumer",
  since: "1a2b3c4",
  head: "5d6e7f8",
  why: "",
  commits: [],
  uncovered: [],
  reviews: [],
  carried: [],
  carriedFrom: null,
  signature: "",
  ...over,
});

const row = (over: Partial<StagingRow>): StagingRow => ({
  path: "shared/issues/990101-0101_o_a-synthetic-record.md",
  code: "??",
  klass: "record",
  why: "under an artifact store",
  staged: false,
  fault: true,
  ...over,
});

const staging = (faults: StagingRow[]): StagingReport => ({
  root: "/tmp/consumer",
  why: "",
  rows: faults,
  faults,
  signature: "",
});

const msgRow = row({ path: "fusion-commit-msg-t1.txt", klass: "commit-message", why: "name match" });

/** A branch of a builder. `silent` means the branch is specified to emit nothing. */
interface Branch {
  branch: string;
  input: unknown;
  silent?: boolean;
}

const REGISTRY: Record<string, { run: (input: never) => string; branches: Branch[] }> = {
  coverageSentence: {
    run: coverageSentence as (input: never) => string,
    branches: [
      { branch: "empty report", input: coverage({}), silent: true },
      {
        branch: "uncovered only",
        input: coverage({ uncovered: [commit("9a8b7c6", "fix: one"), commit("4f3e2d1", "docs: two")] }),
      },
      { branch: "carried, no carriedFrom", input: coverage({ carried: ["hooks/tracker.ts"] }) },
      {
        branch: "carried, with carriedFrom",
        input: coverage({
          carried: ["hooks/tracker.ts"],
          carriedFrom: "circles/990101-0101-a-synthetic-circle/reviews/990102-0202_code-review.md",
        }),
      },
      {
        branch: "uncovered and carried",
        input: coverage({
          uncovered: [commit("9a8b7c6", "fix: one")],
          carried: ["hooks/tracker.ts"],
          carriedFrom: "shared/reviews/990102-0202_code-review.md",
        }),
      },
    ],
  },
  stagingSentence: {
    run: stagingSentence as (input: never) => string,
    branches: [
      { branch: "no faults", input: staging([]), silent: true },
      {
        branch: "records only, untracked and unstaged",
        input: staging([row({}), row({ path: "shared/decisions/990101-0202_a_a-decision.md", code: " M" })]),
      },
      { branch: "commit-message only", input: staging([msgRow]) },
      { branch: "records and commit-message", input: staging([row({}), msgRow]) },
    ],
  },
};

/* ---------------------------------------------------------------- *
 * The gate
 * ---------------------------------------------------------------- */

describe("hook sentences carry only the identifiers their input supplied", () => {
  for (const [name, reg] of Object.entries(REGISTRY)) {
    for (const b of reg.branches) {
      it(`${name}: ${b.branch}`, () => {
        const out = reg.run(b.input as never);
        if (b.silent) return expect(out).toBe("");
        expect(out).not.toBe("");
        const found = foreign(out, b.input);
        if (found.length > 0) throw new Error(containmentMessage(name, b.branch, found, out, b.input));
      });
    }
  }

  it("detects a foreign identifier, and says what the reader needs", () => {
    // Sensitivity, against the incident's exact shape: a record stamp authored
    // into a literal beside a true local measurement.
    const input = coverage({ uncovered: [commit("9a8b7c6", "fix: one")] });
    const dirty = coverageSentence(input) + " This is the statement issue 260810-1205 was filed about.";
    const found = foreign(dirty, input);
    expect(found).toEqual([{ id: "260810-1205", kind: "record stamp (YYMMDD-HHMM)" }]);
    const msg = containmentMessage("coverageSentence", "uncovered only", found, dirty, input);
    expect(msg).toContain("FOREIGN  260810-1205");
    expect(msg).toContain("`coverageSentence()` emitted");
    expect(msg).toContain("a consuming project resolves none of fusion's");
    expect(msg).toContain("move the citation into a source comment");
  });

  it("does not read the consuming project's own hashes as foreign", () => {
    // Specificity, on the branch a shape blacklist fails: four input-supplied
    // hashes reach the sentence and every one of them is contained.
    const input = coverage({ uncovered: [commit("9a8b7c6", "fix: one"), commit("4f3e2d1", "fix: two")] });
    const out = coverageSentence(input);
    expect(identifiers(out).length).toBeGreaterThanOrEqual(4);
    expect(foreign(out, input)).toEqual([]);
  });
});

describe("the registry names every sentence builder the tracker imports", () => {
  it("registry === the *Sentence symbols imported by hooks/tracker.ts", () => {
    const imported = new Set<string>();
    for (const block of readFileSync(trackerPath, "utf-8").matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from/g)) {
      for (const raw of block[1].split(",")) {
        const sym = raw.trim().split(/\s+as\s+/).pop()?.trim() ?? "";
        if (/^[A-Za-z_$][\w$]*Sentence$/.test(sym)) imported.add(sym);
      }
    }
    const missing = [...imported].filter((s) => !(s in REGISTRY)).sort();
    if (missing.length > 0) {
      throw new Error(
        `\n\`hooks/tracker.ts\` imports ${missing.join(", ")}, which this file's REGISTRY does not name, ` +
          `so the containment gate above never runs against ${missing.length === 1 ? "it" : "them"}.\n` +
          "Add an entry with one branch per conditional path, the silent ones included. This gate is only\n" +
          "as complete as the set it knows about, which is why that set is not maintained by memory.",
      );
    }
    expect([...imported].sort()).toEqual(Object.keys(REGISTRY).sort());
  });
});

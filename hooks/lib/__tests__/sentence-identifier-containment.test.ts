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
 * What the relation catches is an identifier a BUILDER authors — a `parts.push`
 * literal, which is how the incident happened. It catches every one of those,
 * with no allowlist and no exemptions, on the day it is written. It does NOT
 * catch an identifier authored into a REPORT FIELD: `supplied()` draws the
 * permitted set from the whole input, so a hand-written `StagingRow.why`,
 * `StagingReport.why` or `CoverageReport.why` travels inside the input and is
 * contained by construction. That is latent and not live — no `why` literal in
 * either module carries a stamp or a hash today, and neither builder emits a
 * `why` field — so a builder that starts emitting one needs its literals read by
 * hand (issue `260818-0746`). Narrowing `supplied()` to the project-derived
 * fields is the per-field allowlist this design refused: it would have to be
 * extended on the day a field is added, which is the failure the gate exists to
 * survive.
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
 * the two silent ones included; an identifier authored into a report field
 * rather than by a builder, stated above; the other composed channels (config
 * advisories, the SessionStart banner, `bin/` helper stderr, the monitor HTML);
 * identifiers that are neither stamp nor hash, such as a Circle slug in prose;
 * and a 7+ character hash drawn entirely from `a`-`f`, excluded so English words
 * spelled in hex ("defaced") are not read as commits — 0.375^7, about 1 in 960
 * for the seven-character short hash `git log %h` yields here, and rarer at every
 * greater length. Record paths and Circle directory names need no class of their
 * own — both carry a stamp by the naming convention.
 *
 * HOW FAR THE COMPLETENESS ASSERTION AT THE FOOT REACHES. It reads the static
 * `import` declarations of `hooks/tracker.ts` alone, and it keys on the IMPORTED
 * name, so a builder imported plainly or under any alias is named — one measured
 * case per form, at the foot. What it cannot see is below, and it is loud about
 * only the first of them. A NAMESPACE import (`import * as rc from
 * "./lib/review-coverage.js"`) binds its symbols at the call sites and not in the
 * import, so a parse of this kind cannot resolve it to a set of symbols at all;
 * the assertion REFUSES that form rather than reading it, for a relative module,
 * which is the only kind that can carry a fusion builder. A builder reached by
 * `require`, by a dynamic `import()` or through a re-export is invisible, and so
 * is one that reaches the model without passing through `hooks/tracker.ts`. And
 * membership still rests on the naming convention: a builder not named
 * `*Sentence` escapes the set, which is the residual the analysis states
 * (issue `260818-0745`).
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
import { citationFormSentence } from "../citation-form.js";
import type { CitationFormReport } from "../citation-form.js";
import type { CitationHit } from "../citation-scan.js";

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

/**
 * One reportable citation hit, at a given line.
 *
 * `problem` and `fix` are the shapes the grammar produces, spelled with a
 * synthetic decision stamp. THE REAL STRINGS CARRY A REAL FUSION STAMP, which
 * this gate cannot see and this fixture therefore does not pretend to test: the
 * grammar authors it into the hit, the hit is the builder's input, and an
 * identifier that travels inside the input is contained by construction. That
 * is the latent hole the header already names for a `why` field, arriving for
 * `problem` and `fix` — with the difference that here it is LIVE, because the
 * grammar's own `fix` names the decision that settled the citation form. The
 * same string already reaches a consuming project's terminal through the
 * hand-run checker, which is why it is stated rather than stripped;
 * `lib/citation-form.ts`'s header carries the same statement.
 */
const hit = (line: number): CitationHit => ({
  file: "shared/issues/990101-0101_o_a-synthetic-record.md",
  line,
  col: 0,
  token: "shared/history/990102-0202-coder-a-synthetic-note.md",
  kind: "record",
  status: "store-prefixed",
  matches: [],
  problem: "the citation carries the store segment 'shared/history/', which an archive sweep moves",
  fix: "cite the storeless form '990102-0202-coder-a-synthetic-note.md' (decision 990103-0303, the form)",
});

const citations = (violations: CitationHit[]): CitationFormReport => ({
  root: "/tmp/consumer",
  file: "shared/issues/990101-0101_o_a-synthetic-record.md",
  why: "",
  violations,
  signature: "",
});

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
  citationFormSentence: {
    run: citationFormSentence as (input: never) => string,
    branches: [
      { branch: "no violations", input: citations([]), silent: true },
      { branch: "one violation", input: citations([hit(12)]) },
      { branch: "two violations", input: citations([hit(12), hit(40)]) },
      // Past `MAX_ROWS`, where the sentence stops spelling rows and starts
      // counting them. The branch exists because the count is composed by the
      // builder rather than taken from the input, so it is the one place a
      // literal could enter the sentence.
      { branch: "more than the sentence spells", input: citations([12, 40, 55, 70, 88, 91].map(hit)) },
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

/* ---------------------------------------------------------------- *
 * Completeness: does the registry name every builder that ships?
 * ---------------------------------------------------------------- */

/** A named-import block, `type` prefix and all: `import { a, b as c } from "…"`. */
const IMPORT_BLOCK = /import\s*(?:type\s*)?\{([^}]*)\}\s*from/g;

/**
 * A namespace import of a RELATIVE module: `import * as rc from "./lib/x.js"`.
 * Relative because that is the only module class that can export a fusion
 * builder — the hook bundle takes no runtime import from a package, and a
 * `node:` builtin exports none either — so a namespace import of `node:path` is
 * not this check's business and does not trip it.
 */
const NAMESPACE_IMPORT = /import\s*\*\s*as\s+([A-Za-z_$][\w$]*)\s+from\s*["'](\.[^"']*)["']/g;

const BUILDER_NAME = /^[A-Za-z_$][\w$]*Sentence$/;

/**
 * The `*Sentence` symbols a source imports by name.
 *
 * It is the half BEFORE `as` that counts: `x as y` imports `x` and binds it
 * locally as `y`, and REGISTRY is keyed by the exported name. Reading the local
 * half instead — which this did until issue `260818-0745` — erased from the set
 * every builder whose alias did not itself end in `Sentence`, silently, which is
 * two of the three legal import forms defeating the half of the gate whose whole
 * job is to survive its author.
 */
function importedSentenceBuilders(source: string): string[] {
  const out = new Set<string>();
  for (const block of source.matchAll(IMPORT_BLOCK)) {
    for (const raw of block[1].split(",")) {
      const imported = raw.trim().split(/\s+as\s+/)[0].trim();
      if (BUILDER_NAME.test(imported)) out.add(imported);
    }
  }
  return [...out];
}

/**
 * The completeness fault in a tracker source, or null when there is none. The
 * source is a PARAMETER rather than a read of the live file so that the cases
 * below can drive it with each import form it claims to read — the assertion is
 * then measured against a builder that is really missing, not asserted.
 */
function completenessFault(source: string, registry: string[]): string | null {
  const namespaces = [...source.matchAll(NAMESPACE_IMPORT)].map((m) => `\`${m[1]}\` from "${m[2]}"`);
  if (namespaces.length > 0) {
    return [
      "",
      `\`hooks/tracker.ts\` imports ${namespaces.join(", ")} as a NAMESPACE, and this check cannot`,
      "read it. The symbols behind `import * as` are named at the call sites, not in the import, so",
      "a parse of this kind cannot resolve the form to a set of symbols at all — a builder reached",
      "that way would never enter the set below and the containment gate above would never run",
      "against it. The form is REFUSED here rather than passed over in silence.",
      "",
      "Import the builders by name (any alias is fine — the imported half is what is read), or",
      "teach this check to read the imported module's exports.",
    ].join("\n");
  }
  const missing = importedSentenceBuilders(source)
    .filter((s) => !registry.includes(s))
    .sort();
  if (missing.length === 0) return null;
  return (
    `\n\`hooks/tracker.ts\` imports ${missing.join(", ")}, which this file's REGISTRY does not name, ` +
    `so the containment gate above never runs against ${missing.length === 1 ? "it" : "them"}.\n` +
    "Add an entry with one branch per conditional path, the silent ones included. This gate is only\n" +
    "as complete as the set it knows about, which is why that set is not maintained by memory."
  );
}

describe("the registry names every sentence builder the tracker imports", () => {
  const registry = Object.keys(REGISTRY);

  it("registry === the *Sentence symbols imported by hooks/tracker.ts", () => {
    const source = readFileSync(trackerPath, "utf-8");
    const fault = completenessFault(source, registry);
    if (fault !== null) throw new Error(fault);
    expect(importedSentenceBuilders(source).sort()).toEqual([...registry].sort());
  });
});

describe("the completeness check sees a third builder in every import form it claims", () => {
  // The shape of `hooks/tracker.ts`'s import section, with one slot for the
  // third builder. `budgetSentence` is deliberately absent from REGISTRY, which
  // is exactly how issue `260818-0745` measured the defect: a builder correctly
  // named by the convention, imported in a legal form, and unregistered.
  const trackerLike = (third: string) =>
    [
      'import { basename, resolve, sep } from "node:path";',
      'import { emitEvent } from "./lib/events.js";',
      "import {",
      "  coverageSentence,",
      "  measureReviewCoverage,",
      '} from "./lib/review-coverage.js";',
      'import { headMoved, stagingSentence } from "./lib/staging-drift.js";',
      'import { citationFormSentence, measureCitationForm } from "./lib/citation-form.js";',
      third,
    ].join("\n");

  const registry = Object.keys(REGISTRY);
  const fault = (third: string) => completenessFault(trackerLike(third), registry);

  it("control: the same source without the third builder is clean", () => {
    // Without this, every case below could be red for a reason that has nothing
    // to do with the form it is testing.
    expect(fault("")).toBeNull();
    expect(importedSentenceBuilders(trackerLike("")).sort()).toEqual([...registry].sort());
  });

  it("plain named import", () => {
    const msg = fault('import { budgetSentence } from "./lib/budget.js";');
    expect(msg).toContain("imports budgetSentence, which this file's REGISTRY does not name");
  });

  it("aliased import whose alias drops the suffix", () => {
    // The form measured green before the fix: `.split(/\s+as\s+/).pop()` kept
    // `budgetLine`, which fails the `*Sentence` test, so the symbol vanished.
    const msg = fault('import { budgetSentence as budgetLine } from "./lib/budget.js";');
    expect(msg).toContain("imports budgetSentence, which this file's REGISTRY does not name");
  });

  it("aliased import whose alias keeps the suffix, and it is the IMPORTED name that is named", () => {
    const msg = fault('import { budgetSentence as spendSentence } from "./lib/budget.js";');
    expect(msg).toContain("imports budgetSentence,");
    expect(msg).not.toContain("spendSentence");
  });

  it("multi-line block, inline type specifier beside the builder", () => {
    const msg = fault(
      ["import {", "  type BudgetReport,", "  budgetSentence,", '} from "./lib/budget.js";'].join("\n"),
    );
    expect(msg).toContain("imports budgetSentence,");
    expect(msg).not.toContain("BudgetReport");
  });

  it("namespace import of a relative module is refused, not read", () => {
    const msg = fault('import * as budget from "./lib/budget.js";');
    expect(msg).toContain("as a NAMESPACE, and this check cannot");
    expect(msg).toContain("cannot resolve the form to a set of symbols at all");
    expect(msg).toContain("REFUSED here rather than passed over in silence");
  });

  it("namespace import of a package or builtin is not this check's business", () => {
    expect(fault('import * as nodePath from "node:path";')).toBeNull();
  });
});

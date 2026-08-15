import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import {
  parseCascade,
  variablesRead,
  type Branch,
  type CountName,
  type Expr,
} from "../domain-cascade.js";

// ---------------------------------------------------------------------------
// Domain-cascade order lint (issue 260807-1942).
//
// agents/orchestrator.md Setup Step 5 decides a workbench's domain
// (code | data) from a fixed if/elif cascade.
//
// The defect this guards: a branch that answers "this workbench governs no
// build" used to stand ahead of every branch reading `code_files`. Once it
// fired, the project's code volume had no influence on the result. Measured in
// the consuming project KRK — 122 commits, 108 Rust files, three open decisions
// against one open defect record — the heuristic reported a no-build domain for
// five straight days across four sessions and a human overrode it every time.
//
// The two domains that defect produced have since been retired, and the
// property did not go with them. The cascade still ends in a bare
// `data_files > 0` branch, and that branch is the same shape: it claims the
// tree governs no build, and the direct evidence for that claim is
// `code_files == 0`. It carries no `code_files` conjunct of its own because the
// two `code_files` branches above it ARE that conjunct — they define the region
// it sits in. Lift it above them and one CI `.yml` in a source tree claims the
// whole project for `data`.
//
// So this file asserts an ORDER, cut on the evidence rather than on a domain
// name: every branch deciding from `data_files` WITHOUT reading `code_files`
// sits below the first branch that reads `code_files`, and the
// `counted_by == "none"` branch (issue 260807-1951, decision 260809-1731) sits
// above every branch that reads a count.
//
// ---------------------------------------------------------------------------
// What this file is NOT
//
// It is the narrower of two gates and it is no longer the primary one.
// `domain-cascade.test.ts` runs the cascade and asserts its VERDICTS; that is
// what catches a branch whose text is in the right place and whose condition
// decides nothing. This one measures position, which is what the prompt's own
// prose asks of an editor ("Do not lift it above them"), and it says so in the
// failure message.
//
// The measurement was itself defeated once (issue 260810-0503): it asked
// whether a branch LINE mentioned `code_files`, so a token parked in a trailing
// comment satisfied it. It now reads the parsed CONDITION, via
// hooks/lib/domain-cascade.ts, so a comment cannot answer for a test and a
// renamed variable fails loudly. What position alone still cannot see — a
// branch that reads the count in a condition that can never hold, such as
// `code_files < 0` — is the sibling file's job, and the sibling drives all four
// defeats end to end.
//
// This is a guard, not a fixer (rules/critical-stance.md §2): it never rewrites
// the prompt. The last describe block feeds both helpers cascades they must
// reject, so neither is merely shown passing on the current text.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const orchestrator = join(pluginRoot, "agents", "orchestrator.md");

const branchesFromPrompt = (): Branch[] => parseCascade(readFileSync(orchestrator, "utf-8"));

/** Index of the first branch whose condition reads `name`, or -1. */
const firstReading = (branches: Branch[], name: CountName): number =>
  branches.findIndex((b) => variablesRead(b.condition).has(name));

/** Indexes of every branch whose condition reads `name`. */
const allReading = (branches: Branch[], name: CountName): number[] =>
  branches.flatMap((b, i) => (variablesRead(b.condition).has(name) ? [i] : []));

/** Does this condition test `counted_by` against the literal `"none"`? */
function testsAbsentCount(e: Expr | null): boolean {
  if (!e) return false;
  if (e.kind === "compare") {
    const pair = [e.left, e.right];
    return (
      pair.some((s) => s.kind === "var" && s.name === "counted_by") &&
      pair.some((s) => s.kind === "str" && s.value === "none")
    );
  }
  if (e.kind === "logical") return testsAbsentCount(e.left) || testsAbsentCount(e.right);
  return false;
}

/**
 * A branch that decides from the data count alone. It says nothing about the
 * source tree, so it is only meaningful inside the region where the source
 * count has already been read and found to be zero.
 */
function decidesOnDataAlone(b: Branch): boolean {
  const read = variablesRead(b.condition);
  return read.has("data_files") && !read.has("code_files");
}

/** The code count is read before any branch that can answer "no build here". */
function assertCodeCountFirst(branches: Branch[]): void {
  const firstCodeCount = firstReading(branches, "code_files");
  expect(
    firstCodeCount,
    "no branch in the cascade TESTS `code_files` — a mention in a comment is not a test",
  ).toBeGreaterThanOrEqual(0);

  const nonBuild = branches.flatMap((b, i) => (decidesOnDataAlone(b) ? [i] : []));
  expect(
    nonBuild.length,
    "no branch decides from `data_files` without also reading `code_files`, so this gate " +
      "measures nothing. Either the cascade lost its sourceless-data branch or that branch " +
      "grew a `code_files` conjunct, and in both cases the position rule below needs re-cutting.",
  ).toBeGreaterThan(0);

  for (const i of nonBuild) {
    expect(
      i,
      `branch ${i} (${branches[i].source}) decides on the data count alone but stands above ` +
        `the first branch reading code_files (${branches[firstCodeCount].source}). That is ` +
        `issue 260807-1942: a project full of code is then classified on a count that says ` +
        `nothing about its source tree, and one CI file claims the project for \`data\`.`,
    ).toBeGreaterThan(firstCodeCount);
  }
}

/** An absent count reaches no branch that would read it as a zero. */
function assertAbsentCountFirst(branches: Branch[]): void {
  const none = branches.findIndex((b) => testsAbsentCount(b.condition));
  expect(none, 'the cascade has no `counted_by == "none"` branch').toBeGreaterThanOrEqual(0);

  for (const i of [...allReading(branches, "code_files"), ...allReading(branches, "data_files")]) {
    expect(
      i,
      `branch ${i} (${branches[i].source}) reads a count but stands above the ` +
        `counted_by == "none" branch. A project outside git then counts zero, and a zero is ` +
        `indistinguishable from a measurement (issue 260807-1951, decision 260809-1731).`,
    ).toBeGreaterThan(none);
  }
}

describe("orchestrator Setup Step 5 domain cascade", () => {
  it("reads the code count before any branch deciding on the data count alone", () => {
    assertCodeCountFirst(branchesFromPrompt());
  });

  it("keeps the absent-count branch above every branch that reads a count", () => {
    assertAbsentCountFirst(branchesFromPrompt());
  });
});

const fence = (lines: string[]) => ["```", ...lines, "```"].join("\n");

// The historical pre-fix cascade, exactly as it stood at 2910cf6, is no longer
// usable as a control here: two of its branches assign domains the grammar
// refuses. That refusal is itself worth a test, so the text is kept for it and
// the ORDER controls below are written in the surviving two-domain vocabulary.
const historicalPreFix = fence([
  'if decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
  'elif analyses_count > 0 and commits == 0:                   domain = "strategic"',
  'elif counted_by == "none":                                  domain = "code"',
  'elif analyses_count > 0 and code_files == 0:                domain = "knowledge"',
  'elif data_files > code_files * 2:                           domain = "data"',
  'else:                                                       domain = "code"',
]);

// The pre-fix SHAPE in the vocabulary that survives: the branch that decides on
// the data count alone, lifted above both branches that read the source count.
// Its absent-count position is deliberately correct, so the two asserts below
// can be shown to disagree about this one cascade.
const dataAloneLifted = fence([
  'if counted_by == "none":                                      domain = "code"',
  'elif data_files > 0:                                          domain = "data"',
  'elif code_files > 0 and data_files > code_files * 2:          domain = "data"',
  'elif code_files > 0:                                          domain = "code"',
  'else:                                                         domain = "code"',
]);

// A count branch lifted above the absent-count line. This is the shape
// `assertAbsentCountFirst` exists to reject, and until issue 260810-0503 nothing
// in this file had ever seen it fail on anything.
const countAboveAbsent = fence([
  'if code_files > 0:                                            domain = "code"',
  'elif counted_by == "none":                                    domain = "code"',
  'elif data_files > 0:                                          domain = "data"',
  'else:                                                         domain = "code"',
]);

// The fourth defeat from 260810-0503: the token appears only in a trailing
// comment, while the branch tests something else entirely.
const commentTokenCascade = fence([
  'if counted_by == "none":                                      domain = "code"',
  'elif data_files > 1000000:                                    domain = "data"   # code_files not read',
  'elif data_files > 0:                                          domain = "data"',
  'elif code_files > 0 and data_files > code_files * 2:          domain = "data"',
  'elif code_files > 0:                                          domain = "code"',
  'else:                                                         domain = "code"',
]);

describe("the gate catches the defects it exists for", () => {
  it("rejects the data-alone branch standing above both code_files branches", () => {
    expect(() => assertCodeCountFirst(parseCascade(dataAloneLifted))).toThrow(/260807-1942/);
  });

  it("rejects a count branch standing above the absent-count branch", () => {
    // The negative control this file was missing. `assertAbsentCountFirst` is
    // now demonstrated to reject something, on the production helper, matched on
    // an issue ID only it emits.
    expect(() => assertAbsentCountFirst(parseCascade(countAboveAbsent))).toThrow(/260807-1951/);
  });

  it("accepts the absent-count position of a cascade whose branch order is wrong", () => {
    // The two asserts measure different things and this proves they do: the
    // same cascade the order check rejects has a correct absent-count position.
    expect(() => assertAbsentCountFirst(parseCascade(dataAloneLifted))).not.toThrow();
  });

  it("rejects a code_files token that appears only in a trailing comment", () => {
    // Under the previous line-text match this passed, because `branchesFrom`
    // kept the comment and the cascade in the prompt is comment-heavy. The
    // condition is what is read now, so the decoy branch tests `data_files` and
    // the data-alone branch is back above the real code count.
    expect(() => assertCodeCountFirst(parseCascade(commentTokenCascade))).toThrow(/260807-1942/);
  });

  it("refuses the historical pre-fix cascade outright, naming the retirement", () => {
    // The order controls above can no longer be written from the real history,
    // because the grammar rejects the text before any order is measured. That
    // is the intended behaviour and this is where it is demonstrated: a branch
    // assigning a retired domain fails at parse, not at position.
    expect(() => parseCascade(historicalPreFix)).toThrow(/retired/);
  });
});

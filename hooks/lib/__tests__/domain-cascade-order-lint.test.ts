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
// (code | data | strategic | knowledge) from a fixed if/elif cascade.
//
// The defect this guards: the two branches returning `strategic` used to stand
// ahead of every branch reading `code_files`. Once either fired, the project's
// code volume had no influence on the result. Measured in the consuming project
// KRK — 122 commits, 108 Rust files, three open decisions against one open
// defect record — the heuristic reported `strategic` for five straight days
// across four sessions and a human overrode it every time.
//
// `strategic` and `knowledge` are claims that the workbench governs no build,
// and the direct evidence for that claim is `code_files == 0`. So this file
// asserts an ORDER: every branch that can return `strategic` or `knowledge`
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
// prose asks of an editor ("Do not lift a strategic or knowledge branch above
// the two code_files branches"), and it says so in the failure message.
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

/** The code count is read before any branch that can answer "no build here". */
function assertCodeCountFirst(branches: Branch[]): void {
  const firstCodeCount = firstReading(branches, "code_files");
  expect(
    firstCodeCount,
    "no branch in the cascade TESTS `code_files` — a mention in a comment is not a test",
  ).toBeGreaterThanOrEqual(0);

  const nonBuild = branches.flatMap((b, i) =>
    b.domain === "strategic" || b.domain === "knowledge" ? [i] : [],
  );
  expect(
    nonBuild.length,
    "the cascade returns neither `strategic` nor `knowledge`",
  ).toBeGreaterThan(0);

  for (const i of nonBuild) {
    expect(
      i,
      `branch ${i} (${branches[i].source}) can return strategic/knowledge but stands above the ` +
        `first branch reading code_files (${branches[firstCodeCount].source}). That is issue ` +
        `260807-1942: a project full of code is then classified on artifact counts alone.`,
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
  it("reads the code count before any branch that can return strategic or knowledge", () => {
    assertCodeCountFirst(branchesFromPrompt());
  });

  it("keeps the absent-count branch above every branch that reads a count", () => {
    assertAbsentCountFirst(branchesFromPrompt());
  });
});

const fence = (lines: string[]) => ["```", ...lines, "```"].join("\n");

// The cascade exactly as it stood at 2910cf6, before this reorder. A gate that
// only ever sees the fixed text proves nothing about what it would catch.
const preFixCascade = fence([
  'if decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
  'elif analyses_count > 0 and commits == 0:                   domain = "strategic"',
  'elif counted_by == "none":                                  domain = "code"',
  'elif analyses_count > 0 and code_files == 0:                domain = "knowledge"',
  'elif data_files > code_files * 2:                           domain = "data"',
  'else:                                                       domain = "code"',
]);

// A count branch lifted above the absent-count line. This is the shape
// `assertAbsentCountFirst` exists to reject, and until issue 260810-0503 nothing
// in this file had ever seen it fail on anything.
const countAboveAbsent = fence([
  'if code_files > 0:                                            domain = "code"',
  'elif counted_by == "none":                                    domain = "code"',
  'elif decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
  'else:                                                         domain = "code"',
]);

// The fourth defeat from 260810-0503: the token appears only in a trailing
// comment, while the branch tests something else entirely.
const commentTokenCascade = fence([
  'if counted_by == "none":                                      domain = "code"',
  'elif issues_count < 0:                                        domain = "code"   # code_files not read',
  'elif decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
  'elif analyses_count > 0 and commits == 0:                     domain = "strategic"',
  'elif analyses_count > 0 and code_files == 0:                  domain = "knowledge"',
  'elif data_files > code_files * 2:                             domain = "data"',
  'else:                                                         domain = "code"',
]);

describe("the gate catches the defects it exists for", () => {
  it("rejects the pre-fix order, where both strategic branches precede the code count", () => {
    expect(() => assertCodeCountFirst(parseCascade(preFixCascade))).toThrow(/260807-1942/);
  });

  it("rejects a count branch standing above the absent-count branch", () => {
    // The negative control this file was missing. `assertAbsentCountFirst` is
    // now demonstrated to reject something, on the production helper, matched on
    // an issue ID only it emits.
    expect(() => assertAbsentCountFirst(parseCascade(countAboveAbsent))).toThrow(/260807-1951/);
  });

  it("accepts the pre-fix absent-count position, which was already correct", () => {
    expect(() => assertAbsentCountFirst(parseCascade(preFixCascade))).not.toThrow();
  });

  it("rejects a code_files token that appears only in a trailing comment", () => {
    // Under the previous line-text match this passed, because `branchesFrom`
    // kept the comment and the cascade in the prompt is comment-heavy. The
    // condition is what is read now, so the decoy branch tests `issues_count`
    // and the strategic branches are back above the real code count.
    expect(() => assertCodeCountFirst(parseCascade(commentTokenCascade))).toThrow(/260807-1942/);
  });
});

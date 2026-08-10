import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// Domain-cascade order lint (issue 260807-1942).
//
// agents/orchestrator.md Setup Step 5 decides a workbench's domain
// (code | data | strategic | knowledge) from a fixed if/elif cascade. The
// cascade is prompt text, so nothing executes it and nothing but this gate
// notices when its branches are reordered.
//
// The defect this guards: the two branches returning `strategic` used to stand
// ahead of every branch reading `code_files`. Once either fired, the project's
// code volume had no influence on the result. Measured in the consuming
// project KRK — 122 commits, 108 Rust files, three open decisions against one
// open defect record — the heuristic reported `strategic` for five straight
// days across four sessions and a human overrode it every time.
//
// `strategic` and `knowledge` are claims that the workbench governs no build,
// and the direct evidence for that claim is `code_files == 0`. So the assertion
// is an ORDER, not a condition: every branch that can return `strategic` or
// `knowledge` must sit below the first branch that reads `code_files`.
//
// A second assertion pins the `counted_by == "none"` line (issue 260807-1951,
// decision 260809-1731) above every branch reading either count. An absent
// count is not a zero, and a zero read as a measurement flips both count
// branches.
//
// Scope is deliberately narrow: this reads the one fenced block and asserts
// relative branch positions. It does not evaluate the cascade, and it is a
// guard, not a fixer (rules/critical-stance.md §2) — it never rewrites the
// prompt. The last describe block feeds it the pre-fix cascade, so the gate is
// shown to fail on the defect rather than merely passing on the fix.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const orchestrator = join(pluginRoot, "agents", "orchestrator.md");

/**
 * The cascade is the fenced block containing the `domain = "..."` assignments.
 * Returns its BRANCH lines only — `if` / `elif` / `else`. The block's variable
 * definitions above the cascade name every count, and its comments discuss
 * them, so neither may count as a branch reading one.
 */
function branchesFrom(text: string): string[] {
  const blocks = text.split(/^\s*```.*$/m);
  const cascade = blocks.filter(
    (b) => /domain\s*=\s*"code"/.test(b) && /domain\s*=\s*"strategic"/.test(b),
  );

  expect(
    cascade.length,
    "expected exactly one fenced block assigning both the `code` and `strategic` domains",
  ).toBe(1);

  return cascade[0]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /^(if|elif|else)\b/.test(l));
}

const branchesFromPrompt = () => branchesFrom(readFileSync(orchestrator, "utf-8"));

/** Index of the first branch matching `re`, or -1. */
const firstIndex = (branches: string[], re: RegExp) => branches.findIndex((l) => re.test(l));

/** Indexes of every branch matching `re`. */
const allIndexes = (branches: string[], re: RegExp) =>
  branches.flatMap((l, i) => (re.test(l) ? [i] : []));

/** The code count is read before any branch that can answer "no build here". */
function assertCodeCountFirst(branches: string[]): void {
  const firstCodeCount = firstIndex(branches, /\bcode_files\b/);
  expect(firstCodeCount, "no branch in the cascade reads `code_files`").toBeGreaterThanOrEqual(0);

  const nonBuild = allIndexes(branches, /domain\s*=\s*"(strategic|knowledge)"/);
  expect(nonBuild.length, "the cascade returns neither `strategic` nor `knowledge`").toBeGreaterThan(0);

  for (const i of nonBuild) {
    expect(
      i,
      `branch ${i} (${branches[i]}) can return strategic/knowledge but stands above the first ` +
        `branch reading code_files (${branches[firstCodeCount]}). That is issue 260807-1942: ` +
        `a project full of code is then classified on artifact counts alone.`,
    ).toBeGreaterThan(firstCodeCount);
  }
}

/** An absent count reaches no branch that would read it as a zero. */
function assertAbsentCountFirst(branches: string[]): void {
  const none = firstIndex(branches, /counted_by\s*==\s*"none"/);
  expect(none, 'the cascade has no `counted_by == "none"` branch').toBeGreaterThanOrEqual(0);

  for (const i of allIndexes(branches, /\b(code_files|data_files)\b/)) {
    expect(
      i,
      `branch ${i} (${branches[i]}) reads a count but stands above the ` +
        `counted_by == "none" branch. A project outside git then counts zero, ` +
        `and a zero is indistinguishable from a measurement.`,
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

  it("can still reach all four domains", () => {
    const branches = branchesFromPrompt().join("\n");
    for (const domain of ["code", "data", "strategic", "knowledge"]) {
      expect(branches, `no branch assigns domain "${domain}"`).toMatch(
        new RegExp(`domain\\s*=\\s*"${domain}"`),
      );
    }
  });
});

// The cascade exactly as it stood at 2910cf6, before this reorder. A gate that
// only ever sees the fixed text proves nothing about what it would catch.
const preFixCascade = [
  "```",
  'if decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
  'elif analyses_count > 0 and commits == 0:                   domain = "strategic"',
  'elif counted_by == "none":                                  domain = "code"',
  'elif analyses_count > 0 and code_files == 0:                domain = "knowledge"',
  'elif data_files > code_files * 2:                           domain = "data"',
  'else:                                                       domain = "code"',
  "```",
].join("\n");

describe("the gate catches the defect it exists for", () => {
  it("rejects the pre-fix order, where both strategic branches precede the code count", () => {
    expect(() => assertCodeCountFirst(branchesFrom(preFixCascade))).toThrow(/260807-1942/);
  });

  it("accepts the pre-fix absent-count position, which was already correct", () => {
    expect(() => assertAbsentCountFirst(branchesFrom(preFixCascade))).not.toThrow();
  });
});

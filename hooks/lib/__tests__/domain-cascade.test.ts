import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import {
  parseCascade,
  evaluateCascade,
  countsFromHelperOutput,
  type Branch,
  type Counts,
  type Domain,
} from "../domain-cascade.js";

// ---------------------------------------------------------------------------
// The domain cascade, gated on what it DECIDES.
//
// `agents/orchestrator.md` Setup Step 5 picks a workbench's domain from an
// if/elif chain over five counts, and that domain is passed as the default to
// `taskplanner`, `reconciler` and `planner`. Under `strategic` the reconciler
// runs no code tests, so a wrong verdict on a project full of source is not a
// cosmetic misfiling.
//
// The gate that stood here measured branch LAYOUT — whether a line mentioned
// `code_files`. Four edits reinstating the defect it guards passed it (issue
// 260810-0503): a decoy `elif code_files < 0` above a restored pre-fix order, an
// inverted `code_files == 0` in the `> 0` slot, a dead `code_files > 100000`,
// and the token present only in a trailing comment. All four are driven below
// and all four now fail.
//
// This file asserts verdicts. `hooks/lib/domain-cascade.ts` parses the cascade
// out of the prompt and runs it, so there is no second copy of the decision to
// drift from the first — the thing under test IS the prompt's own block. The
// layout lint next door (`domain-cascade-order-lint.test.ts`) is kept as a
// second, narrower gate on the documented branch ORDER; this one is primary.
//
// Three properties are asserted, and they catch different things:
//   1. VERDICTS for the projects commit 2910cf6 measured. Catches any edit that
//      changes what a real project is classified as.
//   2. NO DEAD BRANCH — every branch fires for some input in a wide sweep. A
//      branch that can never fire is not decision logic, it is camouflage.
//   3. THE ABSENT COUNT stays out of arithmetic. `unavailable` is modelled as
//      the string the helper actually prints, so a count branch lifted above
//      the `counted_by == "none"` line raises instead of quietly comparing.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const orchestrator = join(pluginRoot, "agents", "orchestrator.md");
const promptText = () => readFileSync(orchestrator, "utf-8");
const promptCascade = () => parseCascade(promptText());

/**
 * The artifact counts measured in the consuming project where the defect was
 * caught: 122 commits, three open decisions against one open defect record, two
 * analyses. Every `code`/`data` scenario below carries this profile, because it
 * is precisely the profile that used to override the code count. A cascade that
 * answers `code` here is answering on the tree, which is the fix.
 */
const DEFECT_PROFILE = {
  commits: 122,
  analyses_count: 2,
  issues_count: 1,
  decisions_count: 3,
} as const;

const counted = (over: Partial<Counts>): Counts => ({
  ...DEFECT_PROFILE,
  counted_by: "git-ls-files",
  code_files: 0,
  data_files: 0,
  ...over,
});

const domainOf = (branches: Branch[], counts: Counts): Domain =>
  evaluateCascade(branches, counts).domain;

// --- 1. verdicts -----------------------------------------------------------

interface Scenario {
  name: string;
  counts: Counts;
  domain: Domain;
}

/**
 * Commit 2910cf6 measured five projects and named a sixth: "Cargo 0 to 27, Go 0
 * to 19, frontend 50 to 11, here 4 to 88, KRK 0 to 108" (old walk to git
 * ls-files) and, for the ratio branch, "An ontology tree (2/30) trips it; this
 * repository (88/21) and KRK (108/11) do not."
 *
 * So both sides were measured for three of them and only the code side for
 * Cargo, Go and frontend. Those three get their own sweep further down rather
 * than an invented data count.
 */
const scenarios: Scenario[] = [
  {
    name: "this repository as 2910cf6 measured it — 88 source, 21 data",
    counts: counted({ code_files: 88, data_files: 21 }),
    domain: "code",
  },
  {
    name: "the consuming project KRK — 108 source, 11 data",
    counts: counted({ code_files: 108, data_files: 11 }),
    domain: "code",
  },
  {
    name: "an ontology tree — 2 source, 30 data, better than two to one",
    counts: counted({ code_files: 2, data_files: 30 }),
    domain: "data",
  },
  {
    name: "a sourceless workbench whose open decisions match its open defects",
    counts: counted({ code_files: 0, data_files: 0, decisions_count: 3, issues_count: 1 }),
    domain: "strategic",
  },
  {
    name: "a sourceless workbench with analyses and no commits",
    counts: counted({
      code_files: 0,
      data_files: 0,
      decisions_count: 0,
      issues_count: 0,
      analyses_count: 2,
      commits: 0,
    }),
    domain: "strategic",
  },
  {
    name: "a sourceless workbench carrying analyses, already committed against",
    counts: counted({
      code_files: 0,
      data_files: 0,
      decisions_count: 0,
      issues_count: 2,
      analyses_count: 2,
      commits: 122,
    }),
    domain: "knowledge",
  },
  {
    name: "a sourceless tree that still holds structured data",
    counts: counted({
      code_files: 0,
      data_files: 4,
      decisions_count: 0,
      issues_count: 0,
      analyses_count: 0,
      commits: 5,
    }),
    domain: "data",
  },
  {
    name: "no evidence at all — the final fallback",
    counts: counted({
      code_files: 0,
      data_files: 0,
      decisions_count: 0,
      issues_count: 0,
      analyses_count: 0,
      commits: 5,
    }),
    domain: "code",
  },
  {
    name: "no count was taken — unavailable is not a zero",
    counts: counted({ code_files: "unavailable", data_files: "unavailable", counted_by: "none" }),
    domain: "code",
  },
];

/** The three projects whose code side alone was measured. */
const codeOnlyMeasurements = [
  { name: "a Cargo workspace", code: 27 },
  { name: "a Go tree with internal/ packages", code: 19 },
  { name: "a frontend, once dist/ stopped counting as source", code: 11 },
];

function assertVerdicts(branches: Branch[]): void {
  for (const s of scenarios) {
    expect(domainOf(branches, s.counts), `${s.name} should reach domain "${s.domain}"`).toBe(
      s.domain,
    );
  }
  for (const m of codeOnlyMeasurements) {
    // The commit measured no data count for these, so assert across every data
    // count that does not trip the documented ratio.
    for (let data = 0; data <= m.code * 2; data++) {
      const counts = counted({ code_files: m.code, data_files: data });
      expect(
        domainOf(branches, counts),
        `${m.name} (${m.code} source, ${data} data) should reach domain "code"`,
      ).toBe("code");
    }
    // and one past it, where the ratio is the documented reason to say `data`
    const counts = counted({ code_files: m.code, data_files: m.code * 2 + 1 });
    expect(domainOf(branches, counts)).toBe("data");
  }
}

// --- 2. no dead branch -----------------------------------------------------

const SWEEP = {
  code_files: [0, 1, 2, 11, 19, 27, 88, 99, 108],
  data_files: [0, 1, 4, 11, 21, 30, 60],
  analyses_count: [0, 1, 2],
  issues_count: [0, 1, 3],
  decisions_count: [0, 1, 3],
  commits: [0, 1, 122],
};

/** Every combination of the sweep, plus the one absent-count shape. */
function* corpus(): Generator<Counts> {
  for (const code_files of SWEEP.code_files)
    for (const data_files of SWEEP.data_files)
      for (const analyses_count of SWEEP.analyses_count)
        for (const issues_count of SWEEP.issues_count)
          for (const decisions_count of SWEEP.decisions_count)
            for (const commits of SWEEP.commits)
              yield {
                counted_by: "git-ls-files",
                code_files,
                data_files,
                analyses_count,
                issues_count,
                decisions_count,
                commits,
              };
  for (const analyses_count of SWEEP.analyses_count)
    for (const decisions_count of SWEEP.decisions_count)
      yield {
        counted_by: "none",
        code_files: "unavailable",
        data_files: "unavailable",
        analyses_count,
        issues_count: 1,
        decisions_count,
        commits: 122,
      };
}

/**
 * A branch that fires for nothing decides nothing. Every defeat in issue
 * 260810-0503 that kept the token and killed the condition — `code_files < 0`,
 * `code_files > 100000`, a token parked in a comment while the branch tests
 * `issues_count < 0` — lands here, whatever it did to the layout.
 */
function assertNoDeadBranch(branches: Branch[]): void {
  const fired = new Set<number>();
  for (const counts of corpus()) fired.add(evaluateCascade(branches, counts).index);

  for (let i = 0; i < branches.length; i++) {
    expect(
      fired.has(i),
      `branch ${i} (${branches[i].source}) fires for no input in the sweep. A branch that ` +
        `cannot fire is not decision logic — it is a token in the right position, which is ` +
        `exactly how issue 260810-0503 defeated the layout lint.`,
    ).toBe(true);
  }
}

/** All four domains are still reachable — not merely mentioned. */
function assertAllDomainsReachable(branches: Branch[]): void {
  const reached = new Set<Domain>();
  for (const counts of corpus()) reached.add(evaluateCascade(branches, counts).domain);
  for (const d of ["code", "data", "strategic", "knowledge"] as Domain[]) {
    expect(reached.has(d), `no input in the sweep reaches domain "${d}"`).toBe(true);
  }
}

// --- 3. the absent count ---------------------------------------------------

/**
 * `bin/fusion-count-sources` prints `unavailable`, and the cascade must answer
 * without doing arithmetic on it. This is the behavioural form of the
 * `counted_by == "none"` branch's position: lift any count branch above it and
 * evaluation raises rather than reading a string as a number.
 */
function assertAbsentCountSafe(branches: Branch[]): void {
  const absent = counted({
    code_files: "unavailable",
    data_files: "unavailable",
    counted_by: "none",
  });
  expect(domainOf(branches, absent)).toBe("code");
}

/** The whole behavioural contract, so a mutation can be shown to break it. */
function assertCascadeBehaviour(branches: Branch[]): void {
  assertVerdicts(branches);
  assertNoDeadBranch(branches);
  assertAllDomainsReachable(branches);
  assertAbsentCountSafe(branches);
}

// ---------------------------------------------------------------------------

describe("orchestrator Setup Step 5 — the cascade, executed", () => {
  it("parses into a total if/elif/else chain", () => {
    const branches = promptCascade();
    expect(branches.length).toBeGreaterThan(2);
    expect(branches[0].kind).toBe("if");
    expect(branches[branches.length - 1].kind).toBe("else");
  });

  it("classifies the projects commit 2910cf6 measured", () => {
    assertVerdicts(promptCascade());
  });

  it("has no branch that fires for nothing", () => {
    assertNoDeadBranch(promptCascade());
  });

  it("can still reach all four domains", () => {
    assertAllDomainsReachable(promptCascade());
  });

  it("answers `code` for an absent count without reading it as a number", () => {
    assertAbsentCountSafe(promptCascade());
  });

  it("this repository, measured live, reaches domain `code`", () => {
    // End to end: the helper the prompt calls, feeding the cascade the prompt
    // states. A change to either side that breaks the pair fails here.
    const run = spawnSync(join(pluginRoot, "bin", "fusion-count-sources"), [pluginRoot], {
      encoding: "utf-8",
    });
    expect(run.status, `fusion-count-sources exited ${run.status}: ${run.stderr}`).toBe(0);

    const measured = countsFromHelperOutput(run.stdout);
    expect(measured.counted_by).toBe("git-ls-files");
    expect(typeof measured.code_files).toBe("number");
    expect(measured.code_files as number).toBeGreaterThan(0);

    expect(domainOf(promptCascade(), counted(measured))).toBe("code");
  });
});

// ---------------------------------------------------------------------------
// The four defeats from issue 260810-0503, driven rather than described.
//
// Each one passed the layout lint. Each one is a cascade the orchestrator would
// have executed, so each is checked here the way the prompt's own block is.
// ---------------------------------------------------------------------------

const fence = (lines: string[]) => ["```", ...lines, "```"].join("\n");

/** The cascade as it stood at 2910cf6, before the reorder. */
const PRE_FIX = [
  'if decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
  'elif analyses_count > 0 and commits == 0:                   domain = "strategic"',
  'elif counted_by == "none":                                  domain = "code"',
  'elif analyses_count > 0 and code_files == 0:                domain = "knowledge"',
  'elif data_files > code_files * 2:                           domain = "data"',
  'else:                                                       domain = "code"',
];

/** The pre-fix order, restored beneath a leading absent-count branch. */
const PRE_FIX_BENEATH = [
  'elif decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
  'elif analyses_count > 0 and commits == 0:                     domain = "strategic"',
  'elif analyses_count > 0 and code_files == 0:                  domain = "knowledge"',
  'elif data_files > code_files * 2:                             domain = "data"',
  'else:                                                         domain = "code"',
];

/** One targeted substitution in the live prompt block, asserted to have landed. */
function mutatePrompt(from: string, to: string): string {
  const text = promptText();
  const hits = text.split(from).length - 1;
  expect(hits, `the mutation target \`${from}\` no longer appears exactly once in the prompt`).toBe(
    1,
  );
  return text.replace(from, to);
}

const DEFEATS: { name: string; markdown: () => string }[] = [
  {
    name: "a decoy branch — `code_files < 0` above a restored pre-fix order",
    markdown: () =>
      fence([
        'if counted_by == "none":                                      domain = "code"',
        'elif code_files < 0:                                          domain = "code"',
        ...PRE_FIX_BENEATH,
      ]),
  },
  {
    name: "an inverted condition — `code_files == 0` in the `> 0` slot",
    markdown: () => mutatePrompt("elif code_files > 0:", "elif code_files == 0:"),
  },
  {
    name: "a dead threshold — `code_files > 100000` in the `> 0` slot",
    markdown: () => mutatePrompt("elif code_files > 0:", "elif code_files > 100000:"),
  },
  {
    name: "the token present only in a trailing comment",
    markdown: () =>
      fence([
        'if counted_by == "none":                                      domain = "code"',
        'elif issues_count < 0:                                        domain = "code"   # code_files not read',
        ...PRE_FIX_BENEATH,
      ]),
  },
];

describe("the gate catches the four edits that defeated its predecessor", () => {
  for (const defeat of DEFEATS) {
    it(`rejects ${defeat.name}`, () => {
      expect(() => assertCascadeBehaviour(parseCascade(defeat.markdown()))).toThrow();
    });

    it(`— and it is the defect: KRK is classified strategic under ${defeat.name}`, () => {
      // 108 Rust files, 11 data files, three open decisions against one open
      // defect record. This is issue 260807-1942 verbatim, and it is what each
      // defeat restores while the layout lint stays green.
      const krk = counted({ code_files: 108, data_files: 11 });
      expect(domainOf(parseCascade(defeat.markdown()), krk)).toBe("strategic");
    });
  }

  it("rejects the pre-fix cascade itself", () => {
    expect(() => assertCascadeBehaviour(parseCascade(fence(PRE_FIX)))).toThrow();
    expect(domainOf(parseCascade(fence(PRE_FIX)), counted({ code_files: 108, data_files: 11 }))).toBe(
      "strategic",
    );
  });

  it("rejects a cascade with no final `else`, which would leave some input unanswered", () => {
    expect(() => parseCascade(fence(PRE_FIX.slice(0, -1)))).toThrow(/no final `else`/);
  });

  it("rejects a count branch lifted above the absent-count branch", () => {
    // The load-bearing position, gated on behaviour: `unavailable` reaches
    // arithmetic and the evaluation raises, naming the issue.
    const lifted = fence([
      'if code_files > 0:                                            domain = "code"',
      'elif counted_by == "none":                                    domain = "code"',
      'elif decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
      'else:                                                         domain = "code"',
    ]);
    expect(() => assertAbsentCountSafe(parseCascade(lifted))).toThrow(/260807-1951/);
  });

  it("rejects a branch reading a count nothing supplies", () => {
    const renamed = fence([
      'if counted_by == "none":                                      domain = "code"',
      'elif source_files > 0:                                        domain = "code"',
      'elif decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
      'else:                                                         domain = "code"',
    ]);
    expect(() => parseCascade(renamed)).toThrow(/not one of the inputs Step 5 gathers/);
  });

  it("rejects a bare value as a condition, which would import truthiness rules", () => {
    const truthy = fence([
      'if counted_by == "none":                                      domain = "code"',
      'elif code_files:                                              domain = "code"',
      'elif decisions_count > 0 and decisions_count >= issues_count: domain = "strategic"',
      'else:                                                         domain = "code"',
    ]);
    expect(() => parseCascade(truthy)).toThrow(/not a comparison/);
  });
});

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import {
  parseCascade,
  evaluateCascade,
  countsFromHelperOutput,
  cascadeBlocks,
  findCascadeStatements,
  statementUnits,
  inputsNamedIn,
  describeReach,
  DOMAINS,
  REACH,
  type Branch,
  type CascadeStatement,
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
// out of the prompt and runs it, so the thing under test IS the prompt's own
// block rather than a transcription of it. The layout lint next door
// (`domain-cascade-order-lint.test.ts`) is kept as a second, narrower gate on
// the documented branch ORDER; this one is primary.
//
// That the interpreter is not a copy was once written up as "there is no second
// copy of the decision to drift from the first". There was one:
// `skills/cleanup/SKILL.md` stated the cascade in prose, in the pre-fix order,
// and no gate read it (issue 260810-1918). Both gates read one file. The last
// describe block below is what closed that — it reads every consumer, and it is
// the only reason the claim is worth anything.
//
// Four properties are asserted, and they catch different things:
//   1. VERDICTS for the projects commit 2910cf6 measured. Catches any edit that
//      changes what a real project is classified as.
//   2. NO DEAD BRANCH — every branch fires for some input in a wide sweep. A
//      branch that can never fire is not decision logic, it is camouflage.
//   3. THE ABSENT COUNT stays out of arithmetic. `unavailable` is modelled as
//      the string the helper actually prints, so a count branch lifted above
//      the `counted_by == "none"` line raises instead of quietly comparing.
//   4. ONE CONSUMER STATES IT. Every agent prompt and skill body is scanned for
//      a statement of the cascade, fenced or prose; exactly one file may hold
//      one. Properties 1-3 measure the definition, this one measures its reach.
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

  it("this tree, measured live, reaches domain `code` on either of the helper's answers", () => {
    // End to end: the helper the prompt calls, feeding the cascade the prompt
    // states. A change to either side that breaks the pair fails here.
    //
    // The helper has two documented outcomes and this asserts a property of
    // BOTH, because which one it gives is a fact about the tree, not about the
    // code. Exit 2 with `counted_by=none` is "no count was taken" — its own
    // header calls that a real answer — and it is what an `install.sh` unpack,
    // a `git archive` export, a Docker COPY that drops `.git`, or a CI image
    // with no `git` binary produces. Asserting exit 0 asserted a git checkout,
    // so the suite failed in any tree without one and blamed the helper
    // (issue 260810-1918). Both branches end at domain `code` here, by
    // different routes: a counted tree because it holds source, an uncounted
    // one because the absent-count branch is the cascade's no-evidence exit.
    const run = spawnSync(join(pluginRoot, "bin", "fusion-count-sources"), [pluginRoot], {
      encoding: "utf-8",
    });
    expect(
      [0, 2],
      `fusion-count-sources exited ${run.status}, which is neither of its documented ` +
        `outcomes (0 counted, 2 no count taken): ${run.stderr}`,
    ).toContain(run.status);

    const measured = countsFromHelperOutput(run.stdout);

    if (run.status === 0) {
      expect(measured.counted_by).toBe("git-ls-files");
      expect(typeof measured.code_files).toBe("number");
      expect(measured.code_files as number).toBeGreaterThan(0);
    } else {
      expect(measured.counted_by).toBe("none");
      expect(measured.code_files).toBe("unavailable");
      expect(measured.data_files).toBe("unavailable");
    }

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

// ---------------------------------------------------------------------------
// Reach: exactly one consumer states the cascade (issue 260810-1918).
//
// Everything above measures the definition. This measures how far the gate
// reaches, which is what the previous two rounds got wrong — in the same place,
// twice:
//
//   Round 1 asserted a second definition was unrepresentable. One existed:
//   `skills/cleanup/SKILL.md` carried the cascade as one prose sentence, in the
//   pre-fix order, with no `counted_by == "none"` case. A project reached `code`
//   at Setup and `strategic` at cleanup inside one session, and under
//   `strategic` the reconciler runs no code tests.
//
//   Round 2 replaced that with a scoped measurement naming three holes. A review
//   measured a fourth against the shipped build (issues 260810-2110): a domain
//   name outside backticks or double quotes was invisible, so the plainest
//   possible second copy walked past. It also found the detector line-scoped
//   while this repository's prose is hard-wrapped, and the file set justified as
//   "the files an agent executes" while `rules/` is that too.
//
// Both times the gate was sound and the SENTENCE next to it was broader. So the
// sentence is gone: `REACH` in `hooks/lib/domain-cascade.ts` holds the file set,
// what is caught, what is missed and what is not scanned, each line carrying
// probes this file runs. The `README-hooks.md` paragraph is rendered from the
// same object and compared byte-for-byte. A claim that outruns the gate now
// fails here rather than being found by the next reviewer.
//
// The file set is the CONSUMER set and it carries no exemptions, deliberately.
// `path-literal-lint.test.ts` scans agents and skills and exempts `setup` and
// `migrate` because their subject IS the layout; nothing makes a second home for
// this decision legitimate, so nothing is exempt here.
//
// Two shapes are detected, because two are representable: a fenced block that
// would actually run (`cascadeBlocks`) and a prose sentence that a reader
// executes (`findCascadeStatements`). This is a floor whose height is written
// down and checked, not a proof.
// ---------------------------------------------------------------------------

/** The single file allowed to state the cascade: Setup Step 5 lives here. */
const DEFINITION_SITE = "agents/orchestrator.md";

/**
 * Expand one entry of `REACH.fileSet` (or of `REACH.excluded`). Three shapes
 * are understood and an unknown one throws rather than quietly expanding to
 * nothing — a file set that silently shrinks is the exact failure this whole
 * block exists to catch.
 */
function expandGlob(glob: string): { rel: string; abs: string }[] {
  const dirStar = /^([A-Za-z0-9._-]+)\/\*\.md$/.exec(glob);
  if (dirStar) {
    const dir = dirStar[1];
    return readdirSync(join(pluginRoot, dir))
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => ({ rel: `${dir}/${f}`, abs: join(pluginRoot, dir, f) }));
  }
  const dirStarFile = /^([A-Za-z0-9._-]+)\/\*\/([A-Za-z0-9._-]+)$/.exec(glob);
  if (dirStarFile) {
    const [, dir, name] = dirStarFile;
    return readdirSync(join(pluginRoot, dir))
      .sort()
      .map((d) => ({ rel: `${dir}/${d}/${name}`, abs: join(pluginRoot, dir, d, name) }))
      .filter(({ abs }) => existsSync(abs));
  }
  if (/^[A-Za-z0-9._-]+$/.test(glob)) {
    const abs = join(pluginRoot, glob);
    return existsSync(abs) ? [{ rel: glob, abs }] : [];
  }
  throw new Error(
    `expandGlob does not understand \`${glob}\`. Teach it the shape or the gate scans ` +
      `fewer files than REACH.fileSet claims.`,
  );
}

/** The scanned set, derived from `REACH.fileSet` rather than restated here. */
function consumerFiles(): { rel: string; abs: string }[] {
  return REACH.fileSet.flatMap(expandGlob);
}

/** HYG-NO-SILENT-FAIL: file, line, what was matched, and what to do instead. */
function reportStatements(rel: string, found: CascadeStatement[]): string {
  return found
    .map(
      (s) =>
        `  ${rel}:${s.line}  states the domain cascade\n` +
        `    domains: ${s.domains.join(", ")}   inputs: ${s.inputs.join(", ")}\n` +
        `    ${s.text.slice(0, 160)}\n` +
        `    -> ${DEFINITION_SITE} Setup Step 5 is the one definition. Obtain the domain,\n` +
        `       do not decide it: read session.domain from fusion-workbench/agentstate.yaml\n` +
        `       (the route /fusion:next, /fusion:direct, /fusion:seed-from-plane and\n` +
        `       /fusion:cleanup take), or take it from a **Domain:** dispatch parameter.`,
    )
    .join("\n");
}

describe("the domain cascade is stated in exactly one consumer", () => {
  it("only the definition site carries a fenced cascade block", () => {
    const holders = consumerFiles()
      .filter(({ abs }) => cascadeBlocks(readFileSync(abs, "utf-8")).length > 0)
      .map(({ rel }) => rel);
    expect(
      holders,
      `a fenced cascade block assigning both \`code\` and \`strategic\` must exist in ` +
        `${DEFINITION_SITE} and nowhere else in agents/ or skills/. Found in: ${holders.join(", ")}`,
    ).toEqual([DEFINITION_SITE]);
  });

  it("no other consumer states the cascade in prose", () => {
    const offenders: string[] = [];
    for (const { rel, abs } of consumerFiles()) {
      if (rel === DEFINITION_SITE) continue;
      const found = findCascadeStatements(readFileSync(abs, "utf-8"));
      if (found.length) offenders.push(reportStatements(rel, found));
    }
    expect(
      offenders,
      `a second statement of the domain cascade is a second definition of one decision, ` +
        `and the two drift (issue 260810-1918):\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("the detector recognises the definition site's own prose", () => {
    // Calibration. A detector that fires on nothing proves nothing: if the one
    // file that really does state the cascade stops matching, the emptiness of
    // the test above is meaningless and this fails first.
    const found = findCascadeStatements(promptText());
    expect(
      found.length,
      `${DEFINITION_SITE} states the cascade in prose around its fenced block; the detector ` +
        `no longer matches any of it, so it would not match a copy either`,
    ).toBeGreaterThan(0);
  });
});

describe("the reach gate catches the copy it was written for", () => {
  // `skills/cleanup/SKILL.md:114`, verbatim as it shipped through v7.2.0.
  const CLEANUP_COPY =
    "- Detect the workbench domain the same way the orchestrator does (Setup Step 5 in " +
    "`agents/orchestrator.md`): `strategic` if decisions dominate, `knowledge` if analyses " +
    "with no code, `data` if data files dominate, else `code`. When unsure, default `code`.";

  it("flags the cleanup sentence, naming its domains and its inputs", () => {
    const found = findCascadeStatements(CLEANUP_COPY);
    expect(found.length).toBe(1);
    expect(found[0].domains.sort()).toEqual(["code", "data", "knowledge", "strategic"]);
    expect(found[0].inputs).toContain("decisions_count");
    expect(found[0].inputs).toContain("analyses_count");
  });

  it("catches it spliced into a copy of a real skill body, at the right line", () => {
    // The end-to-end demonstration, on an in-memory copy of a shipped file —
    // nothing in the working tree is mutated to run a gate (decision
    // 260810-1820). Put the pre-fix sentence back into /fusion:cleanup and the
    // gate that was empty a moment ago names the file, the line and the fix.
    const original = readFileSync(join(pluginRoot, "skills", "cleanup", "SKILL.md"), "utf-8").split(
      "\n",
    );
    expect(
      findCascadeStatements(original.join("\n")),
      "precondition: the shipped /fusion:cleanup body must be clean before the splice, or " +
        "this test is measuring the tree instead of the gate",
    ).toEqual([]);

    const injectAt = original.findIndex((l) => l.startsWith("## Step 3"));
    expect(injectAt, "skills/cleanup/SKILL.md no longer has a Step 3 heading").toBeGreaterThan(0);
    const copy = [...original];
    copy.splice(injectAt + 1, 0, CLEANUP_COPY);

    const found = findCascadeStatements(copy.join("\n"));
    expect(found.map((s) => s.line)).toEqual([injectAt + 2]);

    const msg = reportStatements("skills/cleanup/SKILL.md", found);
    expect(msg).toContain(`skills/cleanup/SKILL.md:${injectAt + 2}`);
    expect(msg).toContain("agentstate.yaml");
  });

  it("catches a statement spliced into a RULE file, which the old file set could not read", () => {
    // The file-set widening, demonstrated end to end rather than argued.
    // `rules/**` is a consumer by the project's own rules-loading contract —
    // `rules/agent-setup.md` says "read every path it emits, none is optional"
    // — so a rule file is as good a second home for this decision as a skill
    // body was. Until this Turn the gate did not read one (issue 260810-2110).
    // In-memory copy; nothing in the working tree is mutated (decision
    // 260810-1820).
    const rel = "rules/agent-setup.md";
    expect(
      consumerFiles().map((f) => f.rel),
      "the widened file set must actually enumerate rule files",
    ).toContain(rel);

    const original = readFileSync(join(pluginRoot, rel), "utf-8").split("\n");
    expect(
      findCascadeStatements(original.join("\n")),
      "precondition: the shipped rule file must be clean before the splice",
    ).toEqual([]);

    const copy = [...original];
    copy.splice(
      12,
      0,
      "Detect the domain the orchestrator detected: `strategic` if open decisions outnumber " +
        "open issues, `knowledge` if analyses exist with no source, otherwise `code`.",
    );
    const found = findCascadeStatements(copy.join("\n"));
    expect(found.map((s) => s.line)).toEqual([13]);
    expect(reportStatements(rel, found)).toContain(`${rel}:13`);
  });

  it("catches a statement a hard wrap split in two, and reports both lines", () => {
    // The line-scope widening (issue 260810-2110). The same sentence on one
    // line already fired; split by a 78-column wrap it did not.
    const wrapped =
      "Pick `strategic` when open decisions outnumber open issues,\n" +
      "and `code` otherwise (measured on decisions_count and issues_count).";
    const found = findCascadeStatements(wrapped);
    expect(found.length).toBe(1);
    expect(found[0].line).toBe(1);
    expect(found[0].span, "a wrapped statement is reported as the two lines it occupies").toBe(2);
    expect(found[0].text).toContain("and `code` otherwise");
  });

  it("catches the cascade re-fenced into a second file", () => {
    // The other representable copy: not prose but a block that would run.
    expect(cascadeBlocks(fence(PRE_FIX)).length).toBe(1);
  });

  // Rewordings a second copy would plausibly take. Each names two outcomes and
  // two inputs, which is what makes it a statement of the decision.
  const MUST_FIRE: [string, string][] = [
    [
      "reworded, prose inputs",
      "Pick `strategic` when open decisions outnumber open issues, `knowledge` when analyses " +
        "exist without source, `data` when data files dominate, otherwise `code`.",
    ],
    [
      "written with the cascade's own variable names",
      "`strategic` if decisions_count >= issues_count, else `knowledge` if analyses_count > 0 " +
        "and code_files == 0, else `code`.",
    ],
    [
      "a two-branch fragment, which is already a decision procedure",
      "Use `strategic` if the workbench has more open decisions than issues; otherwise `code`.",
    ],
  ];

  for (const [label, text] of MUST_FIRE) {
    it(`flags a paraphrase: ${label}`, () => {
      expect(findCascadeStatements(text).length).toBeGreaterThan(0);
    });
  }

  // Real lines from the tree that name domains and must stay unflagged. They
  // CONSUME a domain that was handed to them; none names the evidence a domain
  // is decided from. Fixtures, so widening the detector shows its cost here
  // rather than in a red suite nobody can read.
  const MUST_NOT_FIRE: [string, string][] = [
    [
      "reconciler.md:47 — parsing the dispatch parameter",
      "If the dispatch prompt's first non-empty content line is `**Domain:** <value>`, parse " +
        "`<value>` as the domain (one of `code | data | strategic | knowledge`).",
    ],
    [
      "reconciler.md:169 — branching on the domain it was given",
      "**When `domain=strategic` or `domain=knowledge`:** do NOT rename issue markers " +
        "`_o_→_c_` for items whose answer lives in a later analysis.",
    ],
    [
      "playmaker.md:108 — a ranking heuristic, not a domain heuristic",
      "**Unresolved-decision count** — number of `_o_` decision records cited in its Grounding " +
        "snapshot. Lower is better (for `code`/`data`); higher is better (for `strategic`).",
    ],
    [
      "reconciler.md:91 — pointing at the per-domain protocols",
      "The bullets below describe the `code` protocol verbatim; for `data`, `strategic`, " +
        "`knowledge` see the per-domain notes that follow.",
    ],
    [
      "next/SKILL.md:72 — naming the value set",
      "`<detected-domain>` ∈ `{code, data, strategic, knowledge}` for the remainder of this skill.",
    ],
    // The two the continuation window costs if it joins across blocks instead
    // of only to a wrap. Both are adjacent bullets of a legitimate per-domain
    // list, and an unconditional two-line window selects both — measured on the
    // shipped tree before the block rule went in.
    [
      "playmaker.md:111-112 — two bullets of the per-domain signal list",
      "  - `data`: count of pending issues (`_o_` and `_p_` files under `$SCAN_ISSUES`) that " +
        "mention ontology/manifest paths cited in the Circle's `Grounding snapshot`.\n" +
        "  - `strategic`: count of open `_o_` decisions cited in the Circle's `## Directive` " +
        "(decisions the Circle would realise).",
    ],
    [
      "reconciler.md:135-136 — two bullets of the edge list",
      "- **Artifact↔Grounding edge** — already implicit in the `code`/`data` protocol output " +
        "(claims-vs-disk + reviewer-issues count). For `strategic`/`knowledge` domains, restate " +
        "using their protocol's outputs.\n" +
        "- **Artifact↔Directive edge** — read the session history's `**Directive:**` line and " +
        "walk the commits from `git log <session-start-HEAD>..HEAD`.",
    ],
  ];

  for (const [label, text] of MUST_NOT_FIRE) {
    it(`leaves a consumer alone: ${label}`, () => {
      expect(findCascadeStatements(text)).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// The reach CLAIM, measured (issues 260810-2110).
//
// Two commits in a row shipped a prose claim about this gate that was broader
// than the gate. The repair is not a wider regex, it is that the claim stopped
// being prose: `REACH` holds it, every line carries probes, and the three
// describes below run them. A widening that closes a hole fails here until the
// hole leaves the list; a narrowing that opens one fails here too.
// ---------------------------------------------------------------------------

describe("the reach claim is asserted, not written", () => {
  describe("what REACH says is caught, is caught", () => {
    for (const [i, c] of REACH.covered.entries()) {
      for (const [j, probe] of c.probes.entries()) {
        it(`covered[${i}] probe ${j + 1}: ${c.claim.slice(0, 60)}…`, () => {
          expect(
            findCascadeStatements(probe).length,
            `REACH.covered[${i}] claims this is caught and it is not:\n  ${probe}`,
          ).toBeGreaterThan(0);
        });
      }
    }
  });

  describe("what REACH says is missed, is still missed", () => {
    for (const [i, c] of REACH.holes.entries()) {
      for (const [j, probe] of c.probes.entries()) {
        it(`holes[${i}] probe ${j + 1}: ${c.claim.slice(0, 60)}…`, () => {
          expect(
            findCascadeStatements(probe),
            `REACH.holes[${i}] is named as a hole and the gate now catches it. That is good ` +
              `news and a stale claim: move the case from REACH.holes to REACH.covered, ` +
              `re-measure the false-positive cost over the consumer set, and regenerate the ` +
              `README block.\n  ${probe}`,
          ).toEqual([]);
        });
      }
    }
  });

  describe("what REACH says about the files it does not read, holds", () => {
    for (const e of REACH.excluded) {
      it(`${e.glob} measures "${e.measured}"`, () => {
        const files = expandGlob(e.glob);
        expect(files.length, `REACH.excluded names \`${e.glob}\`, which matches no file`).toBeGreaterThan(0);
        const hits = files.flatMap(({ rel, abs }) =>
          findCascadeStatements(readFileSync(abs, "utf-8")).map((s) => `${rel}:${s.line}`),
        );
        expect(
          hits.length > 0 ? "fires" : "clean",
          `REACH.excluded says \`${e.glob}\` measures "${e.measured}". Selected: ` +
            `${hits.join(", ") || "nothing"}. A file called clean that is not clean is an ` +
            `unstated second definition; a file called firing that no longer fires means the ` +
            `reason for excluding it has expired.`,
        ).toBe(e.measured);
      });
    }
  });

  describe("the cost a hole is left open on, re-measured", () => {
    // The reason bare words are not matched is a number, and a number is the
    // one part of a claim that can be checked mechanically. This project's
    // commit messages have miscounted three times in two Turns while every
    // prose claim in them held, so the number is measured here rather than
    // remembered. The widening is spelled out in full: `domainLiteralsIn` with
    // `\b<domain>\b` in place of the markup requirement, everything else — the
    // two-domain rule, the two-input rule, the unit splitting — unchanged, so
    // the module's own `statementUnits` and `inputsNamedIn` are reused rather
    // than restated.
    const bareDomainsIn = (text: string): Set<string> =>
      new Set(DOMAINS.filter((d) => new RegExp(`\\b${d}\\b`).test(text)));

    const bareWordCost = (withWindow: boolean): string[] => {
      const selected: string[] = [];
      for (const { rel, abs } of consumerFiles()) {
        if (rel === DEFINITION_SITE) continue;
        const reported = new Set<number>();
        for (const u of statementUnits(readFileSync(abs, "utf-8"))) {
          if (!withWindow && u.span > 1) continue;
          if (reported.has(u.line)) continue;
          if (u.span > 1 && reported.has(u.line + 1)) continue;
          if (bareDomainsIn(u.text).size < 2) continue;
          if (inputsNamedIn(u.text).size < 2) continue;
          reported.add(u.line);
          selected.push(`${rel}:${u.line}`);
        }
      }
      return selected;
    };

    for (const [where, cases] of [
      ["covered", REACH.covered],
      ["holes", REACH.holes],
    ] as const) {
      for (const [i, c] of cases.entries()) {
        if (!c.cost) continue;
        it(`${where}[${i}] — ${c.cost.widening} still costs what it says`, () => {
          const single = bareWordCost(false);
          const windowed = bareWordCost(true);
          expect(
            { singleLine: single.length, withWindow: windowed.length },
            `REACH.${where}[${i}].cost is stale. Measured now:\n` +
              `  single lines (${single.length}): ${single.join(", ")}\n` +
              `  with window  (${windowed.length}): ${windowed.join(", ")}\n` +
              `Update the numbers and regenerate the README block — they are the whole reason ` +
              `this hole is left open.`,
          ).toEqual({ singleLine: c.cost.singleLine, withWindow: c.cost.withWindow });
        });
      }
    }
  });

  it("the scanned set is exactly what REACH.fileSet names", () => {
    // `consumerFiles()` is derived from `REACH.fileSet`, so this cannot fail by
    // drift — it fails when a glob shape stops matching anything, which is how
    // a file set silently shrinks.
    const byGlob = REACH.fileSet.map((g) => [g, expandGlob(g).length] as const);
    for (const [glob, n] of byGlob) {
      expect(n, `\`${glob}\` in REACH.fileSet matches no file`).toBeGreaterThan(0);
    }
    expect(consumerFiles().map((f) => f.rel)).toContain(DEFINITION_SITE);
  });

  it("README-hooks.md carries the generated claim verbatim", () => {
    const readme = readFileSync(join(pluginRoot, "README-hooks.md"), "utf-8");
    const begin = "<!-- BEGIN generated: domain-cascade reach -->";
    const end = "<!-- END generated: domain-cascade reach -->";
    const from = readme.indexOf(begin);
    const to = readme.indexOf(end);
    expect(from, `README-hooks.md has no ${begin} marker`).toBeGreaterThan(-1);
    expect(to, `README-hooks.md has no ${end} marker`).toBeGreaterThan(from);

    const block = readme.slice(from + begin.length, to).trim();
    expect(
      block,
      "the reach paragraph in README-hooks.md is rendered from REACH by describeReach(). It " +
        "has drifted. Replace the text between the markers with the output of:\n" +
        "  node -e \"import('./hooks/dist/lib/domain-cascade.js').then(m => " +
        'console.log(m.describeReach()))"',
    ).toBe(describeReach().trim());
  });
});

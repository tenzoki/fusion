import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadConfig,
  resetConfigCache,
  PROJECT_CONFIG_FILENAME,
  type GuardConfig,
} from "../config.js";
import { findWorkbenchRoot } from "../workbench-root.js";

// ---------------------------------------------------------------------------
// The configuration loader.
//
// ## What it resolves, and what that leaves this file measuring
//
// `citations.extraPaths`, since 2026-09-10 and nothing else. Six former leaves
// were guard settings and went with the guard's verdict on 2026-08-16, taking
// the plugin's own `config.json` middle layer with them; two more went on
// 2026-09-10, `orchestrator.maxTurns` with the Phase-2 Turn loop and
// `orchestrator.dispatchMinutes` with the dispatch bound. That left the
// `orchestrator` container walked for its two retirements alone, which is a
// case this file measures on purpose: a container with no live leaf must still
// reach the leaf-scoped retirement table.
//
// So this file measures three things and no longer measures a fourth:
//
//   1. THE MERGE, which is one rule. The walk was kept in `loadConfig` rather
//      than collapsed into a `??` so the next setting inherits the rule instead
//      of re-deriving it; `citations.extraPaths` is that setting, and since
//      2026-09-10 it is also the only one left to measure it on.
//   2. VALIDATION — an unusable value is dropped, NAMED, and then inherits, so
//      that a dropped key, an omitted key and an unwritten file are three
//      spellings of one behaviour (decision `260804-1630`).
//   3. RETIREMENT, at the three scopes the loader announces: a whole FILE at
//      the project root that is no longer read, a top-level KEY inside the file
//      that is, and a LEAF inside a container that is still walked.
//
// What it no longer measures is WHICH LAYER a value came from. With two layers
// and one of them in code, "inherited from the plugin" and "fell through to
// DEFAULTS" are the same answer, and every case that existed to tell them apart
// — and the `DISTINGUISHING_PLUGIN` fixture they shared — went with the
// distinction.
//
// Everything here injects the project root; nothing reads `process.cwd()`. That
// matters more than usual in THIS repository, where the walk up from the working
// directory finds the plugin's own root and would quietly give every case a
// project layer it never asked for.
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));

/** The file the loader stopped reading on 2026-08-16, and still names. */
const RETIRED_CONFIG = "fusion-guard.json";

let scratch: string[] = [];

/** A throwaway directory, disposed after the case. */
function tmp(): string {
  const dir = mkdtempSync(resolve(tmpdir(), "fusion-config-"));
  scratch.push(dir);
  return dir;
}

/** A project root carrying `fusion.json` with the given content. */
function projectWith(value: object | string): string {
  const root = tmp();
  writeFileSync(
    resolve(root, PROJECT_CONFIG_FILENAME),
    typeof value === "string" ? value : JSON.stringify(value, null, 2),
    "utf-8",
  );
  return root;
}

/**
 * The effective CONFIGURATION, without the load report.
 *
 * The load report is ONE field: `diagnostics`, which names what was dropped and
 * what has been retired. It describes what happened while READING rather than
 * what is configured, and including it in a comparison would make "did the
 * effective configuration change?" unanswerable — which is exactly the question
 * the equivalence cases below have to be able to answer with "no".
 *
 * The exclusion is spelled out rather than derived, so that a SECOND report
 * field fails this comparison until someone decides it is a report. That is the
 * failure mode worth having: a new SETTING silently excluded from these
 * comparisons would be the one kind of drift this file cannot see.
 */
function effective(config: GuardConfig): Omit<GuardConfig, "diagnostics"> {
  const { diagnostics: _ignored, ...rest } = config;
  return rest;
}

/** `loadConfig` against a project root, with the cache cleared first. */
function load(projectRoot: string | null): GuardConfig {
  resetConfigCache();
  return loadConfig({ projectRoot });
}

beforeEach(() => {
  resetConfigCache();
});

afterEach(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
  scratch = [];
  resetConfigCache();
});

// ---------------------------------------------------------------------------
// The merge — decision 260804-1630, answered option 1.
//
// One rule, and it is meant to be statable from memory: a key the project layer
// does not supply, or supplies unusably, is treated as absent, and absent means
// `DEFAULTS`. A key it DOES supply is taken exactly as written.
//
// The rule was written for a loader with six guard leaves across three layers,
// where "declaration wins outright" was the load-bearing half; the reasoning is
// in the decision above. With one leaf there is nothing left to narrow, and what
// these cases hold down is the shape rather than the arithmetic: the walk still
// reads declaration at LEAF granularity, so a project that declares a container
// without declaring the leaf inside it inherits that leaf rather than losing it
// (issue 260804-1601). The exemplar was `orchestrator.dispatchMinutes` until it
// was retired on 2026-09-10; `citations.extraPaths` carries every case now,
// which is what "the walk survives its last numeric leaf" has to mean.
// ---------------------------------------------------------------------------

describe("merge — per leaf: project, then DEFAULTS", () => {
  it("takes a declared leaf exactly as written", () => {
    expect(
      load(projectWith({ citations: { extraPaths: ["a/*.go"] } })).citations.extraPaths,
    ).toEqual(["a/*.go"]);
  });

  it("falls through to DEFAULTS when the project says nothing", () => {
    const config = load(projectWith({ _comment: "a project that configures nothing" }));

    expect(config.citations.extraPaths).toEqual([]);
    expect(config.diagnostics).toEqual([]);
  });

  it("inherits a leaf inside a container the project DID declare", () => {
    // The leaf granularity, which is the whole of what `260804-1630` changed.
    // `{"citations": {}}` is a declared container with no leaf in it; a walk
    // that read declaration at the CONTAINER's granularity would hand back a
    // citations object with no path list at all.
    const config = load(projectWith({ citations: {} }));

    expect(config.citations.extraPaths).toEqual([]);
    expect(config.diagnostics).toEqual([]);
  });

  it("treats null as nothing configured, at every level and silently", () => {
    // `null` has always meant "nothing configured" here, and it keeps meaning
    // it — it is absent, not wrong, so it inherits and it is diagnosed nowhere.
    for (const value of [
      { citations: null },
      { citations: { extraPaths: null } },
      "null",
    ]) {
      const config = load(projectWith(value));
      expect(config.citations.extraPaths).toEqual([]);
      expect(config.diagnostics).toEqual([]);
    }
  });

  it("resolves DEFAULTS with no project root at all", () => {
    const config = load(null);

    expect(config.citations.extraPaths).toEqual([]);
    expect(config.diagnostics).toEqual([]);
  });

  it("says nothing about a project root that simply has no configuration file", () => {
    // The ordinary state of a project that has configured nothing, and the
    // state most of the integration suite runs in. An absent file is silent by
    // design: nagging it would put an advisory on every guarded call of a
    // correctly-behaving project.
    const config = load(tmp());

    expect(config.citations.extraPaths).toEqual([]);
    expect(config.diagnostics).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Type validation — issue 260804-1603.
//
// A key that fails validation is DROPPED and NAMED, and the leaf walk then finds
// it absent and inherits. That equivalence is an obligation of decision
// 260804-1630 rather than an implementation convenience: two ways of arriving at
// "absent" that behaved differently would be two rules where the answer is one.
// It is asserted as such in the last case of this block rather than left to be
// inferred from the rows above it.
// ---------------------------------------------------------------------------

describe("a value that cannot be used is dropped, named, and inherited past", () => {
  it.each([
    ["a number", 12],
    ["a string", "12"],
    ["an array", [12]],
  ])("drops a container declared as %s, and says which key", (_name, value) => {
    const config = load(projectWith({ citations: value }));

    expect(config.citations.extraPaths).toEqual([]);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain('"citations" must be a JSON object');
  });

  it("says the same of a container that has no live leaf left", () => {
    // `orchestrator` holds two retirements and nothing else. It is still a
    // container this loader walks — that is what keeps its two retired leaves
    // audible — so declaring it as a number is still a shape complaint and not
    // silence. The case is here so that emptying the leaf table cannot quietly
    // turn the container into an unknown key.
    const config = load(projectWith({ orchestrator: 12 }));

    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain('"orchestrator" must be a JSON object');
  });

  it("accepts unknown keys, including the template's documentation keys", () => {
    // The seeded template is mostly underscore-prefixed notes. A validator
    // that rejected unknown keys would make the file fusion itself ships a
    // broken one.
    const config = load(
      projectWith({
        _what: "why this file exists",
        _override: "how the merge works",
        citations: { extraPaths: ["a/*.go"], _note: "and here too" },
      }),
    );

    expect(config.citations.extraPaths).toEqual(["a/*.go"]);
    expect(config.diagnostics).toEqual([]);
  });

  it("makes a dropped key, an omitted key and an unwritten file identical", () => {
    // The three spellings of "absent", demonstrably the same thing.
    const dropped = load(projectWith({ citations: { extraPaths: "a/*.go" } }));
    const omitted = load(projectWith({ _comment: "nothing declared" }));
    const never = load(tmp());

    expect(JSON.stringify(effective(dropped))).toBe(JSON.stringify(effective(never)));
    expect(JSON.stringify(effective(omitted))).toBe(JSON.stringify(effective(never)));

    // The one thing that differs, and it is the point: the dropped key was
    // named. Silence is what made this defect a defect.
    expect(dropped.diagnostics).toHaveLength(1);
    expect(omitted.diagnostics).toEqual([]);
    expect(never.diagnostics).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// `citations.extraPaths` — the non-Markdown files a project declares as
// citation-bearing. Checked as ONE thing, because a pattern list is used whole
// or not at all: a bad element drops the whole declaration rather than leaving
// a caller to resolve a corpus the project never wrote down. Nothing here
// judges a pattern's SHAPE, which is decidable only where they are resolved.
// ---------------------------------------------------------------------------

describe("citations.extraPaths — the array and its elements are one check", () => {
  it("takes a declared list exactly as written", () => {
    const config = load(projectWith({ citations: { extraPaths: ["a/*.go", "b/**"] } }));

    expect(config.citations.extraPaths).toEqual(["a/*.go", "b/**"]);
    expect(config.diagnostics).toEqual([]);
  });

  it("keeps an explicit empty list as itself", () => {
    // "No extra files", in as many words: the merge passes it through rather
    // than reading it as an omission.
    const config = load(projectWith({ citations: { extraPaths: [] } }));

    expect(config.citations.extraPaths).toEqual([]);
    expect(config.diagnostics).toEqual([]);
  });

  it.each([
    ["a bare string", "a/*.go", "got a string"],
    ["a list holding a number", ["a/*.go", 7], "element at index 1 is not a string"],
    ["a list holding an empty string", ["a/*.go", ""], "element at index 1 is an empty string"],
  ])("drops %s WHOLE, names WHAT failed, and inherits", (_name, value, failure) => {
    // The empty string is the element most worth refusing: as a git pathspec
    // under `:(glob)` it names every tracked file in the project.
    //
    // The three rows fail three different ways, and the third column is why the
    // message is written by the check instead of stored beside it: a sentence
    // about the CONTAINER told a bad element that its array of strings must be
    // an array of strings, naming neither the element nor the non-empty half of
    // the rule (issue 260901-0323).
    const config = load(projectWith({ citations: { extraPaths: value } }));

    expect(config.citations.extraPaths).toEqual([]);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("citations.extraPaths");
    expect(config.diagnostics[0]).toContain("an array of non-empty strings");
    expect(config.diagnostics[0]).toContain(failure);
  });

  it("gives a project that declares nothing the corpus it already has", () => {
    const config = load(projectWith({ _comment: "nothing declared" }));

    expect(config.citations.extraPaths).toEqual([]);
    expect(config.diagnostics).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Retirement, at two scopes.
//
// Something a project once configured and no longer can is neither a validation
// failure nor an unknown key. It is a line that still looks like a setting to
// whoever wrote it and now does nothing, and the one thing that must not happen
// is for it to go through in the silence every unrecognised key gets.
//
// The notion started at ONE scope, the leaf — `guard.protectedPaths`, retired
// 2026-08-12 — and the table that held it has no members now and folded away:
// that leaf sits inside a retired container, so the container's own diagnostic
// names it. What replaced it is one table family at two scopes rather than a
// second mechanism.
// ---------------------------------------------------------------------------

describe("a retired top-level key is named, not carried through in silence", () => {
  /** The whole sentence, for a project file at `root`. */
  const expected = (root: string, key: string, reason: string): string =>
    `fusion configuration at ${resolve(root, PROJECT_CONFIG_FILENAME)}: ` +
    `"${key}" no longer exists — ${reason} The key was ignored; the rest of ` +
    `this file is unaffected. Delete it to stop this advisory.`;

  it("tells a project that copied its old guard settings across, in full", () => {
    // Asserted as the WHOLE string rather than by substring. Three things have
    // to be in it and each is load-bearing: the key, so the reader can find the
    // line; "no longer exists", so it reads as a removal and not as a typo; and
    // an instruction, so the advisory can be made to stop. A substring
    // assertion would let any of the three fall out unnoticed.
    const root = projectWith({
      guard: { protectedPaths: ["agents/**"], categoryPaths: { api: ["src/**"] } },
    });

    expect(load(root).diagnostics).toEqual([
      expected(
        root,
        "guard",
        "fusion's guard decides nothing. It observes the write tools and reports " +
          "what it could not read here, and it has no settings of its own.",
      ),
    ]);
  });

  it("names each of the four, once per key and not once per leaf inside it", () => {
    // A retired container is not a container to walk into: its leaves are
    // retired with it, and one advisory naming the container beats one per leaf
    // inside a key that no longer means anything.
    const root = projectWith({
      guard: { enabled: false, protectedPaths: [], defaultSensitivity: "high" },
      decisions: [{ id: "D-1", category: "api", statement: "…" }],
      escalation: { blocksBeforeHalt: 7 },
      churn: { changesPerSessionWarning: 50 },
    });

    const { diagnostics } = load(root);
    expect(diagnostics).toHaveLength(4);
    for (const key of ["guard", "decisions", "escalation", "churn"]) {
      expect(diagnostics.some((d) => d.includes(`"${key}" no longer exists`))).toBe(true);
    }
  });

  it("says it whatever the declared value is, well-typed or not", () => {
    // A retired key is not a validation failure and must not be reported as one
    // — the reader would go and fix the type. The empty container is the case
    // that most deserves the notice: it is well-typed, and it is a project that
    // narrowed something ON PURPOSE.
    for (const value of [{}, { enabled: false }, 123, "rules/**", []]) {
      const root = projectWith({ guard: value });
      const { diagnostics } = load(root);

      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0]).toContain('"guard" no longer exists');
    }
  });

  it("drops the value rather than letting it reach the effective config", () => {
    // "Ignored" is a claim about the merge, not only about the message. A
    // retired key that survived into `raw` would be an unknown key by another
    // name, and the next reader of the object would find guard settings there.
    const declared = load(projectWith({ guard: { enabled: false } }));
    const silent = load(tmp());

    expect(
      (declared as unknown as Record<string, unknown>).guard,
    ).toBeUndefined();
    expect(JSON.stringify(effective(declared))).toBe(JSON.stringify(effective(silent)));
  });

  it("leaves the live leaf beside it working", () => {
    // The other half of what a project needs to hear. A file carrying a retired
    // key is not a broken file, and a project that read the advisory as "my
    // configuration was dropped" would go and rewrite a setting that is being
    // honoured.
    const config = load(
      projectWith({ guard: { enabled: false }, citations: { extraPaths: ["a/*.go"] } }),
    );

    expect(config.citations.extraPaths).toEqual(["a/*.go"]);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("the rest of this file is unaffected");
  });

  it("says nothing to a project that never declared one", () => {
    // The ordinary project, which is every project fusion sets up from here on.
    expect(
      load(projectWith({ citations: { extraPaths: ["a/*.go"] } })).diagnostics,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The retired FILE — the scope above the key, added 2026-08-16.
//
// THIS DIAGNOSTIC IS THE WHOLE v10 MIGRATION, and the cases below assert it in
// that spirit. `/fusion:setup` was the alternative and the user chose against it
// (decision `260816-1916`, option 1), on the ground that this channel runs on
// every guarded tool call while Setup runs once per session and only for a
// project that runs Setup at all.
//
// The failure it exists to prevent is silent and specific: a project that
// carried a setting in `fusion-guard.json` and does nothing drops to the
// built-in default without a word. So the sentence is asserted phrase by phrase
// rather than by a substring on the filename — a shortening into a bare "this
// file moved" would pass a filename check and lose the migration.
//
// It named `orchestrator.maxTurns` as the setting to copy across until
// 2026-09-10. That setting is retired everywhere now, so the sentence says
// there is nothing to copy for it and points any OTHER setting at the live
// file. The phrase-by-phrase assertion is what makes that a deliberate rewrite
// rather than a drift.
//
// The retired file predates `orchestrator.dispatchMinutes` by three months, so
// no such file can carry one and the sentence deliberately does not mention it.
// ---------------------------------------------------------------------------

describe("a retired FILE is named, with the migration it needs", () => {
  /** A project root carrying the retired file, and optionally the live one. */
  function withRetiredFile(live?: object): string {
    const root = live === undefined ? tmp() : projectWith(live);
    writeFileSync(
      resolve(root, RETIRED_CONFIG),
      '{"orchestrator": {"maxTurns": 12}, "guard": {"enabled": true}}\n',
      "utf-8",
    );
    return root;
  }

  it("names the file, the destination, the retired key and the order", () => {
    const root = withRetiredFile();
    const { diagnostics } = load(root);

    expect(diagnostics).toHaveLength(1);
    const [detail] = diagnostics;

    // The file, by absolute path: a developer may have several roots open.
    expect(detail).toContain(resolve(root, RETIRED_CONFIG));
    expect(detail).toContain("is no longer read");
    // Where a setting that DOES survive goes.
    expect(detail).toContain(PROJECT_CONFIG_FILENAME);
    // The one key a reader most plausibly has in that file, named with what
    // happened to it — so nobody copies a Turn budget into a file that also
    // will not read it.
    expect(detail).toContain("orchestrator.maxTurns");
    expect(detail).toContain("nothing to copy");
    // The ORDER, and the consequence of getting it wrong. Deleting first loses
    // any value the sentence just told the reader to keep.
    expect(detail).toContain("Then delete this file");
  });

  it("reads nothing out of it — the file is probed, not parsed", () => {
    // `existsSync` is the whole check, and deliberately: reading the file in
    // order to decide what to say about not reading it would be the
    // contradiction it is. So a leftover file that is not even JSON produces the
    // same single notice, and nothing in it reaches the effective config.
    const root = tmp();
    writeFileSync(resolve(root, RETIRED_CONFIG), "{ not json at all", "utf-8");

    const config = load(root);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain(RETIRED_CONFIG);
    expect(config.citations.extraPaths).toEqual([]);
  });

  it("does not let the retired file's contents reach the effective config", () => {
    // The silent loss this whole channel exists to make loud, asserted as the
    // loss it is: the project's declared budget is in the file nothing reads,
    // and it produces no setting and not even a retired-leaf advisory, because
    // the file is probed rather than parsed.
    const declared = load(withRetiredFile());
    const silent = load(tmp());

    expect(JSON.stringify(effective(declared))).toBe(JSON.stringify(effective(silent)));
    expect(declared.diagnostics).toHaveLength(1);
  });

  it("is reported ahead of a complaint about the file that IS read", () => {
    // A file that is not read AT ALL is the most upstream thing a reader can be
    // wrong about; a dropped key inside the file that IS read is a finer
    // complaint and reads after it. A project meeting both at once is exactly
    // the project mid-migration.
    const { diagnostics } = load(withRetiredFile({ citations: { extraPaths: 7 } }));

    expect(diagnostics).toHaveLength(2);
    expect(diagnostics[0]).toContain(RETIRED_CONFIG);
    expect(diagnostics[1]).toContain("citations.extraPaths");
    expect(diagnostics[1]).toContain("an array of non-empty strings");
  });

  it("says nothing to a project that never had one, and none at all with no root", () => {
    expect(
      load(projectWith({ citations: { extraPaths: ["a/*.go"] } })).diagnostics,
    ).toEqual([]);
    // With no project root there is nowhere to probe, and the loop is skipped
    // rather than probing the working directory — which in THIS repository would
    // find whatever the developer happens to have lying around.
    expect(load(null).diagnostics).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Retirement at the third scope: a LEAF inside a container the loader walks.
//
// `RETIRED_TOP_LEVEL_KEYS` cannot express this — it retires a whole container
// and says ONE thing about it. `orchestrator` holds two retirements that
// happened for two different reasons: `maxTurns` went with the Phase-2 Turn
// loop on 2026-09-10 and `dispatchMinutes` went with the dispatch bound the
// same day. A project declared one, or the other, or both, and each is owed the
// sentence about the intention it wrote down. Without the leaf table either
// would fall through the leaf walk's unknown-key branch and be carried in
// exactly the silence the family exists to prevent.
//
// THE CONTAINER HAS NO LIVE LEAF LEFT, and that is the case worth pinning: the
// leaf walk reaches the retirement table only by walking INTO a container
// `CONTAINER_LEAF_RULES` names, so an empty entry there is load-bearing rather
// than vestigial. Delete it and both advisories go silent.
// ---------------------------------------------------------------------------

describe("a retired LEAF inside a walked container is named", () => {
  it.each([["orchestrator.maxTurns", "maxTurns"], ["orchestrator.dispatchMinutes", "dispatchMinutes"]])(
    "names %s and says the setting is not read",
    (full, leaf) => {
      const config = load(projectWith({ orchestrator: { [leaf]: 12 } }));

      expect(config.diagnostics).toHaveLength(1);
      expect(config.diagnostics[0]).toContain(full);
      expect(config.diagnostics[0]).toContain("no longer exists");
      expect(config.diagnostics[0]).toContain("no replacement to move it to");
      expect(config.diagnostics[0]).toContain("The key was ignored");
    },
  );

  it("names each leaf separately when a project declared both", () => {
    // The reason the retirement stayed at the leaf's scope rather than moving
    // up to the container that now holds nothing else: two settings, two
    // reasons, two sentences. A container-scoped entry would answer both with
    // one, and a project that wrote only one of them would read a notice about
    // a setting it never had.
    const config = load(projectWith({ orchestrator: { maxTurns: 12, dispatchMinutes: 35 } }));

    expect(config.diagnostics).toHaveLength(2);
    expect(config.diagnostics.some((d) => d.includes("orchestrator.maxTurns"))).toBe(true);
    expect(config.diagnostics.some((d) => d.includes("orchestrator.dispatchMinutes"))).toBe(true);
  });

  it("leaves a live leaf in another container working", () => {
    // A retired leaf must not cost a setting elsewhere in the file. There is no
    // live sibling inside `orchestrator` any more, so the claim is made where it
    // can still be made.
    const config = load(
      projectWith({ orchestrator: { maxTurns: 12 }, citations: { extraPaths: ["a/*.go"] } }),
    );

    expect(config.citations.extraPaths).toEqual(["a/*.go"]);
    expect(config.diagnostics).toHaveLength(1);
  });

  it("drops the retired leaf rather than letting it reach the effective config", () => {
    const declared = load(projectWith({ orchestrator: { dispatchMinutes: 35 } }));
    const silent = load(tmp());

    expect((declared as unknown as Record<string, unknown>).orchestrator).toBeUndefined();
    expect(JSON.stringify(effective(declared))).toBe(JSON.stringify(effective(silent)));
  });

  it("says it once per load, whatever the value", () => {
    for (const value of [12, 0, "many", []]) {
      expect(load(projectWith({ orchestrator: { maxTurns: value } })).diagnostics).toHaveLength(1);
      expect(
        load(projectWith({ orchestrator: { dispatchMinutes: value } })).diagnostics,
      ).toHaveLength(1);
    }
  });
});

// ---------------------------------------------------------------------------
// Diagnostics for the file that IS read.
// ---------------------------------------------------------------------------

describe("diagnostics — a dropped source is named, never silent", () => {
  it("an unparseable project file falls back to DEFAULTS and names itself", () => {
    const root = projectWith("{ this is not json ");
    const config = load(root);

    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain(resolve(root, PROJECT_CONFIG_FILENAME));
    expect(config.diagnostics[0]).toContain("not valid JSON");
    expect(config.citations.extraPaths).toEqual([]);
  });

  it("reports JSON that parses but is not an object", () => {
    for (const text of ["[1, 2, 3]", '"a string"', "42"]) {
      const config = load(projectWith(text));

      expect(config.diagnostics).toHaveLength(1);
      expect(config.diagnostics[0]).toContain("not a JSON object");
      expect(config.citations.extraPaths).toEqual([]);
    }
  });
});

describe("the cache is keyed on the resolved source", () => {
  it("two successive loads with DIFFERENT roots return different configs", () => {
    // The defect this replaces: a cache keyed on nothing returned the first
    // answer forever, so the second load below would have carried the first
    // project's budget. One process, many roots, is exactly what a vitest file
    // is.
    const a = loadConfig({ projectRoot: projectWith({ citations: { extraPaths: ["a/*.go"] } }) });
    const b = loadConfig({ projectRoot: projectWith({ citations: { extraPaths: ["b/*.go"] } }) });

    expect(a.citations.extraPaths).toEqual(["a/*.go"]);
    expect(b.citations.extraPaths).toEqual(["b/*.go"]);
  });

  it("a repeat load with the SAME root hits the memo", () => {
    const sources = { projectRoot: projectWith({ citations: { extraPaths: ["a/*.go"] } }) };

    expect(loadConfig(sources)).toBe(loadConfig(sources));
  });

  it("distinguishes a null project root from a project root that has no file", () => {
    // Same effective config either way, so identity is the only observable
    // difference — and it is the one that proves the key carries the root.
    const first = loadConfig({ projectRoot: null });
    const second = loadConfig({ projectRoot: tmp() });

    expect(second).not.toBe(first);
    expect(JSON.stringify(effective(second))).toBe(JSON.stringify(effective(first)));
  });

  it("resetConfigCache() forces a fresh read", () => {
    const root = tmp();
    const sources = { projectRoot: root };

    // No file yet, so DEFAULTS stands.
    expect(loadConfig(sources).citations.extraPaths).toEqual([]);

    writeFileSync(
      resolve(root, PROJECT_CONFIG_FILENAME),
      JSON.stringify({ citations: { extraPaths: ["a/*.go"] } }),
      "utf-8",
    );
    resetConfigCache();

    expect(loadConfig(sources).citations.extraPaths).toEqual(["a/*.go"]);
  });
});

// ---------------------------------------------------------------------------
// The seeded template.
//
// `templates/fusion.json` is what `/fusion:setup` copies into a consuming
// project. It declares inheritance and declares NO setting: it carries only
// underscore-prefixed documentation keys, which the loader carries through
// untouched.
//
// "Inherits and declares nothing" is a claim about the MERGE, not about the
// file's text, so the first case measures it through `loadConfig` rather than by
// grepping. The third case is the byte-identity one, and it is the reason the
// cutting machinery below exists.
// ---------------------------------------------------------------------------

const REPO_ROOT = resolve(HERE, "../../..");
const TEMPLATE = resolve(REPO_ROOT, "templates", PROJECT_CONFIG_FILENAME);
const REPO_COPY = resolve(REPO_ROOT, PROJECT_CONFIG_FILENAME);

/** A project root seeded with the shipped template, as `/fusion:setup` leaves it. */
function projectSeededWithTemplate(): string {
  const root = tmp();
  copyFileSync(TEMPLATE, resolve(root, PROJECT_CONFIG_FILENAME));
  return root;
}

/**
 * The top-level containers of `fusion.json` this repository's own copy may
 * differ from the template on, which the drift check below cuts out of both
 * sides before comparing. `citations` is documented for a project to set
 * (`templates/fusion.json`, `_citations`). `orchestrator` is NOT: both of its
 * leaves are retired, and it stays on this list only because this repository's
 * copy still declares `maxTurns` — cut so the comparison holds every shared
 * documentation note byte for byte instead of failing on that one line. The ONE
 * place either exemption is stated.
 */
const PROJECT_SET_KEYS = ["orchestrator", "citations"] as const;

/** Index just past the closing quote of the JSON string starting at `start`. */
function endOfString(text: string, start: number): number {
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === "\\") {
      i++;
      continue;
    }
    if (text[i] === '"') return i + 1;
  }
  return text.length;
}

/** Index of the first non-whitespace character at or after `from`. */
function nextNonSpace(text: string, from: number): number {
  let i = from;
  while (i < text.length && /\s/.test(text[i])) i++;
  return i;
}

/**
 * Index of the opening quote of `key` where it is used as a TOP-LEVEL key, or
 * -1. The scan tracks string and nesting state, so the key's name occurring
 * inside one of the documentation notes — `_retired` names `orchestrator`
 * three times — is not mistaken for a declaration of it.
 */
function findTopLevelKey(text: string, key: string): number {
  const token = JSON.stringify(key);
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      const end = endOfString(text, i);
      const isKeyHere =
        depth === 1 &&
        end === i + token.length &&
        text.startsWith(token, i) &&
        text[nextNonSpace(text, end)] === ":";
      if (isKeyHere) return i;
      i = end - 1;
      continue;
    }
    if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") depth--;
  }
  return -1;
}

/** Index just past the last character of the value of the entry at `keyStart`. */
function endOfEntryValue(text: string, keyStart: number): number {
  let i = text.indexOf(":", endOfString(text, keyStart)) + 1;
  let depth = 0;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      i = endOfString(text, i) - 1;
      continue;
    }
    if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") {
      if (depth === 0) break; // the enclosing object's own closing brace
      depth--;
    } else if (ch === "," && depth === 0) break;
  }
  while (i > 0 && /\s/.test(text[i - 1])) i--; // back off to the value itself
  return i;
}

/** `text` with the top-level entry `key` cut out; unchanged if it has none. */
function cutTopLevelEntry(text: string, key: string): string {
  const keyStart = findTopLevelKey(text, key);
  if (keyStart < 0) return text;

  const valueEnd = endOfEntryValue(text, keyStart);
  const terminator = nextNonSpace(text, valueEnd);

  if (text[terminator] === ",") {
    // Not the last entry: the whole line goes, its comma and line break with it.
    let start = keyStart;
    while (start > 0 && (text[start - 1] === " " || text[start - 1] === "\t")) start--;
    let end = terminator + 1;
    while (text[end] === " " || text[end] === "\t") end++;
    if (text[end] === "\r") end++;
    if (text[end] === "\n") end++;
    return text.slice(0, start) + text.slice(end);
  }

  // The last entry: the comma separating it from the previous entry goes with
  // it, and the whitespace before the closing brace stays where it is.
  let start = keyStart;
  while (start > 0 && /\s/.test(text[start - 1])) start--;
  if (text[start - 1] === ",") start--;
  return text.slice(0, start) + text.slice(valueEnd);
}

/**
 * `text` with the {@link PROJECT_SET_KEYS} entries cut out and every other byte
 * left exactly where it was. Cutting the source rather than re-serialising the
 * parsed object is deliberate: `JSON.parse` + `JSON.stringify` would normalise
 * away the indentation, the blank lines and the key order, which are three of
 * the four things the comparison below exists to hold still.
 */
function withoutProjectSetKeys(text: string): string {
  let out = text;
  for (const key of PROJECT_SET_KEYS) out = cutTopLevelEntry(out, key);
  return out;
}

describe("the drift check's cut helper, on every entry position", () => {
  // Synthetic inputs, so both branches of `cutTopLevelEntry` run whatever
  // shape the two real files take (issue 260814-2128).
  const V = '{ "maxTurns": 5 }';
  const cases: [string, string, string][] = [
    ["first", `{\n  "orchestrator": ${V},\n  "a": 1\n}`, `{\n  "a": 1\n}`],
    ["middle", `{\n  "a": 1,\n  "orchestrator": ${V},\n  "b": 2\n}`, `{\n  "a": 1,\n  "b": 2\n}`],
    ["last", `{\n  "a": 1,\n  "orchestrator": ${V}\n}`, `{\n  "a": 1\n}`],
    ["only", `{\n  "orchestrator": ${V}\n}`, `{\n}`],
    ["in a string value, left alone", `{\n  "_n": "the orchestrator key",\n  "a": 1\n}`, `{\n  "_n": "the orchestrator key",\n  "a": 1\n}`],
  ];
  for (const [label, input, expected] of cases) {
    it(`cuts the ${label} entry exactly`, () => {
      expect(withoutProjectSetKeys(input)).toBe(expected);
    });
  }
});

describe("the seeded template declares inheritance and declares nothing", () => {
  it("merges to fusion's own defaults and nothing else", () => {
    const seeded = load(projectSeededWithTemplate());
    const bare = load(null);

    // It parses, and its documentation keys are IGNORED rather than reported:
    // an unrecognised key produces no diagnostic, which is the whole convention
    // the file's own notes rely on. It also pins that the template carries no
    // RETIRED key — a `guard` section in the seeded file would be one diagnostic
    // here, on every guarded call, in every project fusion sets up.
    expect(seeded.diagnostics).toEqual([]);

    // Identical, byte for byte, over the whole configuration.
    expect(JSON.stringify(effective(seeded))).toBe(JSON.stringify(effective(bare)));
  });

  it("declares no setting, and names both retired leaves so a project can find them", () => {
    // The template documents `citations.extraPaths` at length in `_citations`
    // and declares it nowhere, which is what keeps `DEFAULTS` the single
    // definition site. It must also declare no `orchestrator` — a seeded file
    // carrying a retired leaf would put an advisory on every guarded call of
    // every project fusion sets up — while still NAMING both retirements in
    // `_retired`, which is where a project upgrading goes to read what happened
    // to a key it wrote itself.
    const parsed = JSON.parse(readFileSync(TEMPLATE, "utf-8")) as Record<string, unknown>;

    expect(parsed.orchestrator).toBeUndefined();
    expect(parsed.citations).toBeUndefined();
    const retired = String(parsed._retired ?? "");
    expect(retired).toContain("orchestrator.maxTurns");
    expect(retired).toContain("orchestrator.dispatchMinutes");
  });

  it("is what this repository's own fusion.json is, apart from the keys this repository sets for itself", () => {
    // The repository root carries the template. Asserted rather than eyeballed,
    // because the two files drift the first time someone edits the one they
    // happen to have open.
    //
    // WHAT IS COMPARED: every byte of both files except the top-level entries
    // named in PROJECT_SET_KEYS, which are cut out of each side first. So the
    // documentation notes are still held byte for byte — edit one, delete one,
    // reorder them, or change a space inside the shared part and this case
    // fails, which is the drift it was written to catch.
    //
    // WHAT IS DELIBERATELY NOT COMPARED, and why: the value of a top-level
    // container this repository's own copy declares. `templates/fusion.json`'s
    // own `_citations` note tells every project that this file is the only place
    // to declare its citation-bearing paths, and this repository is such a
    // project; its copy also still carries `"orchestrator": {"maxTurns": N}`,
    // which is now a retired leaf it has not yet deleted. Byte identity cannot
    // tell either apart from accidental drift — a documented change and a stray
    // edit are the same bytes — so the check keeps the question it CAN decide
    // and drops the one it cannot. Issue 260814-2022, option 1.
    const templateText = readFileSync(TEMPLATE, "utf-8");
    const templateBytes = readFileSync(TEMPLATE);
    const copyText = readFileSync(REPO_COPY, "utf-8");

    // Anti-vacuity, and the reason the right-hand side below is the template's
    // untouched text: the template declares no setting at all, so the cut must
    // be a no-op on it. A cut that silently ate shared prose would have to eat
    // it here first.
    expect(withoutProjectSetKeys(templateText)).toBe(templateText);

    const stripped = withoutProjectSetKeys(copyText);

    // Text first, so a failure shows the difference; bytes second, against the
    // template's bytes as read, so the case still says something about bytes and
    // not only about what decoded from them.
    expect(stripped).toBe(templateText);
    expect(Buffer.from(stripped, "utf-8").equals(templateBytes)).toBe(true);
  });
});

describe("an explicit null project root is honoured, not filled in", () => {
  it("does not walk up from the working directory", () => {
    // A `??` default would turn an explicit `null` back into a walk from the
    // working directory, and in THIS repository that walk finds the plugin root
    // — so every case above would have been handed a project layer it never
    // asked for.
    //
    // The case builds its own witness: a workbench root whose configuration says
    // something this loader reads, and a `chdir` into it.
    const root = tmp();
    mkdirSync(resolve(root, "fusion-workbench"), { recursive: true });
    writeFileSync(resolve(root, "fusion-workbench", ".fusion-setup"), "{}", "utf-8");
    writeFileSync(
      resolve(root, PROJECT_CONFIG_FILENAME),
      JSON.stringify({ citations: { extraPaths: ["witness/*.go"] } }),
      "utf-8",
    );

    const before = process.cwd();
    try {
      process.chdir(root);
      // The walk WOULD find it — asserted first, so a case that stopped
      // witnessing anything fails here rather than passing vacuously.
      expect(findWorkbenchRoot()).not.toBeNull();
      resetConfigCache();
      expect(loadConfig().citations.extraPaths).toEqual(["witness/*.go"]);

      resetConfigCache();
      expect(loadConfig({ projectRoot: null }).citations.extraPaths).toEqual([]);
    } finally {
      process.chdir(before);
    }
  });
});

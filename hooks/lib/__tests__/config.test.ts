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
// ONE leaf: `orchestrator.maxTurns`. Six others were guard settings
// (`guard.enabled`, `guard.defaultSensitivity`, `guard.categoryPaths`,
// `guard.categorySensitivity`, `decisions`, `escalation.blocksBeforeHalt`) and
// went with the guard's verdict on 2026-08-16; the plugin's own `config.json`
// went with them, because a middle merge layer whose only reason was to give
// those settings a narrowable default has nothing left to carry.
//
// So this file measures three things and no longer measures a fourth:
//
//   1. THE MERGE, which is one rule and now has one leaf to demonstrate it on.
//      The walk is kept in `loadConfig` rather than collapsed into a `??` so
//      that the next setting inherits the rule instead of re-deriving it, and it
//      is measured here for the same reason.
//   2. VALIDATION — an unusable value is dropped, NAMED, and then inherits, so
//      that a dropped key, an omitted key and an unwritten file are three
//      spellings of one behaviour (decision `260804-1630`).
//   3. RETIREMENT, at the two scopes the loader now announces: a whole FILE at
//      the project root that is no longer read, and a top-level KEY inside the
//      file that is.
//
// What it no longer measures is WHICH LAYER a value came from. With two layers
// and one of them in code, "inherited from the plugin" and "fell through to
// DEFAULTS" are the same answer, and every case that existed to tell them apart
// — and the `DISTINGUISHING_PLUGIN` fixture they shared — went with the
// distinction.
//
// Everything here injects the project root. Nothing reads `process.cwd()`, so no
// case depends on where the runner was started — which matters more than usual
// in THIS repository, where the walk up from the working directory finds the
// plugin's own root and would quietly give every case a project layer it never
// asked for.
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
// where "declaration wins outright" was the load-bearing half — a union of a
// declared container can only grow, so narrowing is expressible only if a
// declared value replaces rather than merges. With one leaf there is nothing
// left to narrow, and what these cases hold down is the shape rather than the
// arithmetic: the walk still reads declaration at LEAF granularity, so a project
// that declares a container without declaring the leaf inside it inherits that
// leaf rather than losing it (issue 260804-1601, the shape that used to wipe
// every sibling in the same object).
// ---------------------------------------------------------------------------

describe("merge — per leaf: project, then DEFAULTS", () => {
  it("takes a declared leaf exactly as written", () => {
    expect(load(projectWith({ orchestrator: { maxTurns: 12 } })).orchestrator.maxTurns).toBe(12);
  });

  it("falls through to DEFAULTS when the project says nothing", () => {
    const config = load(projectWith({ _comment: "a project that configures nothing" }));

    expect(config.orchestrator.maxTurns).toBe(5);
    expect(config.diagnostics).toEqual([]);
  });

  it("inherits a leaf inside a container the project DID declare", () => {
    // The leaf granularity, which is the whole of what `260804-1630` changed.
    // `{"orchestrator": {}}` is a declared container with no leaf in it; a walk
    // that read declaration at the CONTAINER's granularity would hand back an
    // orchestrator with no budget at all.
    const config = load(projectWith({ orchestrator: {} }));

    expect(config.orchestrator.maxTurns).toBe(5);
    expect(config.diagnostics).toEqual([]);
  });

  it("treats null as nothing configured, at every level and silently", () => {
    // `null` has always meant "nothing configured" here, and it keeps meaning
    // it — it is absent, not wrong, so it inherits and it is diagnosed nowhere.
    for (const value of [
      { orchestrator: null },
      { orchestrator: { maxTurns: null } },
      "null",
    ]) {
      const config = load(projectWith(value));
      expect(config.orchestrator.maxTurns).toBe(5);
      expect(config.diagnostics).toEqual([]);
    }
  });

  it("resolves DEFAULTS with no project root at all", () => {
    const config = load(null);

    expect(config.orchestrator.maxTurns).toBe(5);
    expect(config.diagnostics).toEqual([]);
  });

  it("says nothing about a project root that simply has no configuration file", () => {
    // The ordinary state of a project that has configured nothing, and the
    // state most of the integration suite runs in. An absent file is silent by
    // design: nagging it would put an advisory on every guarded call of a
    // correctly-behaving project.
    const config = load(tmp());

    expect(config.orchestrator.maxTurns).toBe(5);
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
    ["zero", 0, "a session that could never run a Turn"],
    ["a negative", -3, "not a count of anything"],
    ["a decimal", 2.5, "not a number of Turns"],
    ["a string", "many", "not a number at all"],
    ["a number's spelling", "5", "a string that looks like the answer"],
  ])("drops %s and inherits the default", (_name, value, _why) => {
    const config = load(projectWith({ orchestrator: { maxTurns: value } }));

    // Drop, NAME, inherit — and the naming is not cosmetic. A budget silently
    // replaced by the default is a project running a bound it did not choose and
    // believes it did.
    expect(config.orchestrator.maxTurns).toBe(5);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("orchestrator.maxTurns");
    expect(config.diagnostics[0]).toContain("a whole number of 1 or more");
  });

  it("accepts a large budget — there is no ceiling, deliberately", () => {
    // A project that wants 60 Turns has said so in a git-tracked file, and a
    // ceiling invented here would be a policy nobody asked for. The shape was
    // first argued for `escalation.blocksBeforeHalt` (issue 260804-1606), whose
    // `0` halted on the first denied call; that setting went with the counter on
    // 2026-08-16 and the argument transferred intact.
    const config = load(projectWith({ orchestrator: { maxTurns: 999999 } }));

    expect(config.orchestrator.maxTurns).toBe(999999);
    expect(config.diagnostics).toEqual([]);
  });

  it.each([
    ["a number", 12],
    ["a string", "12"],
    ["an array", [12]],
  ])("drops a container declared as %s, and says which key", (_name, value) => {
    const config = load(projectWith({ orchestrator: value }));

    expect(config.orchestrator.maxTurns).toBe(5);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain('"orchestrator" must be a JSON object');
  });

  it("accepts unknown keys, including the template's documentation keys", () => {
    // The seeded template is mostly five underscore-prefixed notes. A validator
    // that rejected unknown keys would make the file fusion itself ships a
    // broken one.
    const config = load(
      projectWith({
        _what: "why this file exists",
        _override: "how the merge works",
        orchestrator: { maxTurns: 9, _note: "and here too" },
      }),
    );

    expect(config.orchestrator.maxTurns).toBe(9);
    expect(config.diagnostics).toEqual([]);
  });

  it("makes a dropped key, an omitted key and an unwritten file identical", () => {
    // The three spellings of "absent", demonstrably the same thing.
    const dropped = load(projectWith({ orchestrator: { maxTurns: 0 } }));
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
      projectWith({ guard: { enabled: false }, orchestrator: { maxTurns: 12 } }),
    );

    expect(config.orchestrator.maxTurns).toBe(12);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("the rest of this file is unaffected");
  });

  it("says nothing to a project that never declared one", () => {
    // The ordinary project, which is every project fusion sets up from here on.
    expect(load(projectWith({ orchestrator: { maxTurns: 9 } })).diagnostics).toEqual([]);
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
// carried `{"orchestrator":{"maxTurns":12}}` in `fusion-guard.json` and does
// nothing drops to the built-in default without a word. So the sentence is
// asserted phrase by phrase rather than by a substring on the filename — a
// shortening into a bare "this file moved" would pass a filename check and lose
// the migration.
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

  it("names the file, the key to copy, the destination and the order", () => {
    const root = withRetiredFile();
    const { diagnostics } = load(root);

    expect(diagnostics).toHaveLength(1);
    const [detail] = diagnostics;

    // The file, by absolute path: a developer may have several roots open.
    expect(detail).toContain(resolve(root, RETIRED_CONFIG));
    expect(detail).toContain("is no longer read");
    // The setting that survives the move, and where it goes.
    expect(detail).toContain("orchestrator.maxTurns");
    expect(detail).toContain(PROJECT_CONFIG_FILENAME);
    // The ORDER, and the consequence of getting it wrong. Deleting first loses
    // the value the sentence just told the reader to keep.
    expect(detail).toContain("first");
    expect(detail).toContain("Then delete this file");
  });

  it("reads nothing out of it — the file is probed, not parsed", () => {
    // `existsSync` is the whole check, and deliberately: reading the file in
    // order to decide what to say about not reading it would be the
    // contradiction it is. So a leftover file that is not even JSON produces the
    // same single notice, and its `maxTurns` reaches nothing.
    const root = tmp();
    writeFileSync(resolve(root, RETIRED_CONFIG), "{ not json at all", "utf-8");

    const config = load(root);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain(RETIRED_CONFIG);
    expect(config.orchestrator.maxTurns).toBe(5);
  });

  it("does not let the retired file's budget reach the effective config", () => {
    // The silent loss this whole channel exists to make loud, asserted as the
    // loss it is: the project's declared 12 is in the file nothing reads, and
    // the resolved budget is fusion's own default.
    expect(load(withRetiredFile()).orchestrator.maxTurns).toBe(5);
  });

  it("is reported ahead of a complaint about the file that IS read", () => {
    // A file that is not read AT ALL is the most upstream thing a reader can be
    // wrong about; a dropped key inside the file that IS read is a finer
    // complaint and reads after it. A project meeting both at once is exactly
    // the project mid-migration.
    const { diagnostics } = load(withRetiredFile({ orchestrator: { maxTurns: 0 } }));

    expect(diagnostics).toHaveLength(2);
    expect(diagnostics[0]).toContain(RETIRED_CONFIG);
    expect(diagnostics[1]).toContain("orchestrator.maxTurns");
    expect(diagnostics[1]).toContain("a whole number of 1 or more");
  });

  it("says nothing to a project that never had one, and none at all with no root", () => {
    expect(load(projectWith({ orchestrator: { maxTurns: 9 } })).diagnostics).toEqual([]);
    // With no project root there is nowhere to probe, and the loop is skipped
    // rather than probing the working directory — which in THIS repository would
    // find whatever the developer happens to have lying around.
    expect(load(null).diagnostics).toEqual([]);
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
    expect(config.orchestrator.maxTurns).toBe(5);
  });

  it("reports JSON that parses but is not an object", () => {
    for (const text of ["[1, 2, 3]", '"a string"', "42"]) {
      const config = load(projectWith(text));

      expect(config.diagnostics).toHaveLength(1);
      expect(config.diagnostics[0]).toContain("not a JSON object");
      expect(config.orchestrator.maxTurns).toBe(5);
    }
  });
});

describe("the cache is keyed on the resolved source", () => {
  it("two successive loads with DIFFERENT roots return different configs", () => {
    // The defect this replaces: a cache keyed on nothing returned the first
    // answer forever, so the second load below would have carried the first
    // project's budget. One process, many roots, is exactly what a vitest file
    // is.
    const a = loadConfig({ projectRoot: projectWith({ orchestrator: { maxTurns: 7 } }) });
    const b = loadConfig({ projectRoot: projectWith({ orchestrator: { maxTurns: 11 } }) });

    expect(a.orchestrator.maxTurns).toBe(7);
    expect(b.orchestrator.maxTurns).toBe(11);
  });

  it("a repeat load with the SAME root hits the memo", () => {
    const sources = { projectRoot: projectWith({ orchestrator: { maxTurns: 7 } }) };

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
    expect(loadConfig(sources).orchestrator.maxTurns).toBe(5);

    writeFileSync(
      resolve(root, PROJECT_CONFIG_FILENAME),
      JSON.stringify({ orchestrator: { maxTurns: 33 } }),
      "utf-8",
    );
    resetConfigCache();

    expect(loadConfig(sources).orchestrator.maxTurns).toBe(33);
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
 * The top-level keys of `fusion.json` a project is documented to set for itself
 * (`templates/fusion.json`, `_turnBudget`), which the drift check below admits
 * as a difference between this repository's copy and the template. The ONE
 * place that exemption is stated: a new project-settable key is added here.
 */
const PROJECT_SET_KEYS = ["orchestrator"] as const;

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
 * inside one of the documentation notes — `_turnBudget` names `orchestrator`
 * twice — is not mistaken for a declaration of it.
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

  it("does not restate the Turn budget's default", () => {
    // The template documents the key at length in `_turnBudget` and declares it
    // nowhere, which is what keeps `DEFAULTS` the single definition site. A
    // template that declared `"orchestrator": {"maxTurns": 5}` would look
    // harmless and would be a second number to change.
    const parsed = JSON.parse(readFileSync(TEMPLATE, "utf-8")) as Record<string, unknown>;

    expect(parsed.orchestrator).toBeUndefined();
    expect(String(parsed._turnBudget ?? "")).toContain("maxTurns");
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
    // WHAT IS DELIBERATELY NOT COMPARED, and why: the value of a key a project
    // is documented to set for itself. `templates/fusion.json`'s own
    // `_turnBudget` note tells every project that this file is the only place to
    // change the orchestrator's Turn budget; this repository runs its own
    // workbench and its own Turn loop, so it is such a project, and it sets
    // `"orchestrator": {"maxTurns": N}` here. Byte identity cannot tell that
    // apart from accidental drift — a documented change and a stray edit are the
    // same bytes — so the check keeps the question it CAN decide and drops the
    // one it cannot. Issue 260814-2022, option 1.
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
      JSON.stringify({ orchestrator: { maxTurns: 42 } }),
      "utf-8",
    );

    const before = process.cwd();
    try {
      process.chdir(root);
      // The walk WOULD find it — asserted first, so a case that stopped
      // witnessing anything fails here rather than passing vacuously.
      expect(findWorkbenchRoot()).not.toBeNull();
      resetConfigCache();
      expect(loadConfig().orchestrator.maxTurns).toBe(42);

      resetConfigCache();
      expect(loadConfig({ projectRoot: null }).orchestrator.maxTurns).toBe(5);
    } finally {
      process.chdir(before);
    }
  });
});

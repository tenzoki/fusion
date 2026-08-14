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
// The C5b configuration loader — plan step 6.
//
// `hooks/lib/config.ts` had NO unit test at all before this file: it read one
// path computed at module load and memoised the answer against a cache keyed on
// nothing, which is untestable in-process by construction. Both of those are
// what step 6 changes, so this suite exists as much to pin the new seams as to
// cover the new behaviour.
//
// Everything here injects both sources. Nothing reads `process.cwd()`, so no
// case depends on where the runner was started — which matters more than usual
// in THIS repository, where the walk up from the working directory finds the
// plugin's own root and would quietly give every case a project layer it never
// asked for.
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
/** The plugin's own shipped `hooks/config.json` — the second layer, for real. */
const SHIPPED_PLUGIN_CONFIG = resolve(HERE, "../../config.json");

let scratch: string[] = [];

/** A throwaway directory, disposed after the case. */
function tmp(): string {
  const dir = mkdtempSync(resolve(tmpdir(), "fusion-config-"));
  scratch.push(dir);
  return dir;
}

/** A project root carrying `fusion-guard.json` with the given content. */
function projectWith(value: object | string): string {
  const root = tmp();
  writeFileSync(
    resolve(root, PROJECT_CONFIG_FILENAME),
    typeof value === "string" ? value : JSON.stringify(value, null, 2),
    "utf-8",
  );
  return root;
}

/** A plugin-side `config.json` with the given content, at its own path. */
function pluginConfig(value: object | string): string {
  const dir = tmp();
  const path = resolve(dir, "config.json");
  writeFileSync(
    path,
    typeof value === "string" ? value : JSON.stringify(value, null, 2),
    "utf-8",
  );
  return path;
}

/**
 * The effective CONFIGURATION, without the load report.
 *
 * The load report is ONE field now: `diagnostics`, which names the layers and
 * keys that were dropped. It describes what happened while READING the files
 * rather than what the guard will do, and including it in a comparison would
 * make "did the effective configuration change?" unanswerable — which matters
 * most for the byte-identity case below, whose whole job is to answer exactly
 * that question with "no".
 *
 * It was three fields until the protected-path removal. `protectedPathsSource`
 * said which layer declared the protected list and `floorPaths` said what the
 * self-protection floor appended to it; both described a list that no longer
 * exists and went with it.
 *
 * The exclusion is spelled out rather than derived, so that a SECOND report
 * field fails this comparison until someone decides it is a report. That is the
 * failure mode worth having: a new SETTING silently excluded from the
 * byte-identity check would be the one kind of drift this file cannot see.
 */
function effective(config: GuardConfig): Omit<GuardConfig, "diagnostics"> {
  const { diagnostics: _ignored, ...rest } = config;
  return rest;
}

/**
 * A plugin layer that disagrees with `DEFAULTS` on every leaf it declares.
 *
 * ## Why several cases need one, and why the shipped file used to do
 *
 * "Inherited from the plugin layer" and "fell through to DEFAULTS" are
 * different answers, and a case can only tell them apart against a plugin layer
 * whose value differs from the default. `guard.protectedPaths` was the one leaf
 * where the SHIPPED file supplied that difference for free — eight patterns
 * against an empty default — so every case needing the distinction reached for
 * it, whatever the case was actually about.
 *
 * That leaf is retired, and the shipped file now agrees with `DEFAULTS` on
 * everything it declares, so a case reaching for it would stop distinguishing
 * anything while still passing. Every such case uses this instead: three
 * leaves, each deliberately unequal to its default (`"medium"`, `{}` and `3`).
 */
const DISTINGUISHING_PLUGIN = {
  guard: {
    defaultSensitivity: "high",
    categoryPaths: { onto: ["ontology/**"] },
  },
  escalation: { blocksBeforeHalt: 9 },
};

/** `DISTINGUISHING_PLUGIN` written to its own path, ready for `loadConfig`. */
function distinguishingPlugin(): string {
  return pluginConfig(DISTINGUISHING_PLUGIN);
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
// The anti-regression measurement.
//
// The reference below is the loader as it stood BEFORE step 6, transcribed: one
// source, leaf-level `?? DEFAULTS`, no project layer. A project with no
// `fusion-guard.json` must produce output byte-identical to what that function
// returns for the same file.
//
// The constraint it was written for was the Circle's first one — that no path
// protected today becomes unprotected — and that constraint died with the
// mechanism, along with `protectedPaths` and the floor, which are struck from
// the transcription below. What survives is the weaker property the case can
// still measure and that still matters: introducing a project layer changed
// nothing for a project that has no project layer.
//
// DEFAULTS is transcribed too rather than imported. Importing it would compare
// the new loader against itself and pass however the values drifted; a frozen
// copy means a deliberate change to a default fails this case and has to be
// looked at, which is the point.
// ---------------------------------------------------------------------------

const DEFAULTS_BEFORE_STEP_6 = {
  guard: {
    enabled: true,
    defaultSensitivity: "medium",
    categoryPaths: {} as Record<string, string[]>,
    categorySensitivity: {} as Record<string, string>,
  },
  decisions: [] as unknown[],
  escalation: { blocksBeforeHalt: 3 },
  churn: {
    changesPerSessionWarning: 5,
    changesPerSessionCritical: 10,
  },
};

/** `loadConfig` as it behaved before step 6, for one source. */
function loadConfigAsOfStep5(path: string): object {
  const D = DEFAULTS_BEFORE_STEP_6;
  let raw: any;
  try {
    raw = JSON.parse(readFileSync(path, "utf-8")) ?? {};
  } catch {
    return D;
  }
  return {
    guard: {
      enabled: raw.guard?.enabled ?? D.guard.enabled,
      defaultSensitivity:
        raw.guard?.defaultSensitivity ?? D.guard.defaultSensitivity,
      categoryPaths: raw.guard?.categoryPaths ?? D.guard.categoryPaths,
      categorySensitivity:
        raw.guard?.categorySensitivity ?? D.guard.categorySensitivity,
    },
    decisions: raw.decisions ?? D.decisions,
    escalation: {
      blocksBeforeHalt:
        raw.escalation?.blocksBeforeHalt ?? D.escalation.blocksBeforeHalt,
    },
    churn: {
      changesPerSessionWarning:
        raw.churn?.changesPerSessionWarning ?? D.churn.changesPerSessionWarning,
      changesPerSessionCritical:
        raw.churn?.changesPerSessionCritical ??
        D.churn.changesPerSessionCritical,
    },
  };
}

/**
 * The settings the GUARD itself reads — `effective()` minus the one container
 * no hook consults.
 *
 * The reference above is a transcription of the loader as it stood before the
 * project layer existed, and the property it pins is that introducing that
 * layer moved nothing for a project without one. `orchestrator.maxTurns`
 * arrived later (issue `260811-1712`): it is read once per session by
 * `bin/fusion-turn-budget` and by nothing in `guard.ts` or `tracker.ts`, so it
 * cannot move that measurement in either direction — but it does change the
 * object's shape, and a byte comparison would then fail for a reason that has
 * nothing to do with the guard.
 *
 * The exclusion is BY NAME, one key, and not a filter over "things that look
 * non-guard". A second name appearing here is a claim that a second setting
 * sits outside the guard, and that claim should cost an edit and a reader.
 */
function guardSurface(config: GuardConfig): object {
  const { orchestrator: _notTheGuards, ...rest } = effective(config);
  return rest;
}

describe("a project with no fusion-guard.json is byte-identical to before step 6", () => {
  it("with no project root at all", () => {
    const actual = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: null,
    });

    expect(JSON.stringify(guardSurface(actual))).toBe(
      JSON.stringify(loadConfigAsOfStep5(SHIPPED_PLUGIN_CONFIG)),
    );
    expect(actual.diagnostics).toEqual([]);
  });

  it("with a project root that simply has no configuration file", () => {
    // The ordinary state of every project on this plugin today, and the state
    // the whole pre-existing integration suite runs in.
    const actual = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: tmp(),
    });

    expect(JSON.stringify(guardSurface(actual))).toBe(
      JSON.stringify(loadConfigAsOfStep5(SHIPPED_PLUGIN_CONFIG)),
    );
    expect(actual.diagnostics).toEqual([]);
  });

  // TWO CASES STOOD HERE, both about the protected list, and neither has a
  // subject any more.
  //
  // The first asserted that the shipped plugin config still names all eight
  // protected patterns, and that `skills/**` is still absent from them — the
  // constraint in the Circle's own words, stated separately from the byte
  // comparison above because a byte comparison against a reference that was
  // itself wrong would have satisfied that one. It goes with step 8, which
  // takes the list out of `hooks/config.json`.
  //
  // The second derived the list's rule roots from `RULE_DIR_PATTERNS` in
  // `rules-write-exemption.ts` and asserted that every exempt pattern had a
  // protected twin — the invariant the two lists had drifted apart on, leaving
  // `.claude/rules/**` exempt but unprotected and so writable outright
  // (`shared/issues/260801-1020_*_guard-protects-rules-but-not-claude-rules.md`).
  // It was deleted a step early, in step 6, and not by choice: that step deletes
  // the module the import at the top of this file resolved against, so the whole
  // suite stopped collecting.
});

// ---------------------------------------------------------------------------
// The merge — decision 260804-1630, answered option 1.
//
// One rule: a key the project layer does not supply, or supplies unusably, is
// treated as absent, and absent means the plugin layer, then DEFAULTS. A key it
// DOES supply is taken exactly as written, including an empty list.
//
// The block this replaces asserted the opposite for one case ("replaces the
// guard object WHOLE — an omitted leaf comes from DEFAULTS, not from the
// plugin"). That case was a correct description of the shipped code and the
// reason it shipped: `DEFAULTS.guard.protectedPaths` is the empty list, so
// `{"guard":{"enabled":true}}` removed every protected pattern. It is
// deleted rather than adapted, because the behaviour it pinned is the defect.
//
// Every case below was written on `guard.protectedPaths`, the only leaf whose
// declared value differed visibly from both other layers. That leaf is retired,
// and the cases are re-pointed at `categoryPaths` — an object rather than an
// array, but the walk does not know the difference and neither does the rule it
// demonstrates. What is NOT re-pointed is anything whose subject was the list
// itself; that has its own note where it stood.
// ---------------------------------------------------------------------------

describe("merge — per leaf: project, then plugin, then DEFAULTS", () => {
  it("a project declaring a container gets its value, not a union", () => {
    const root = projectWith({ guard: { categoryPaths: { api: ["src/api/**"] } } });

    const { guard } = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: root,
    });

    expect(guard.categoryPaths).toEqual({ api: ["src/api/**"] });
    // A union would be the safe-looking choice and it is the wrong one: it
    // makes narrowing impossible, which is half of what a project-level
    // configuration was asked for.
    expect(guard.categoryPaths.onto).toBeUndefined();
  });

  it("a DECLARED empty container is empty, not an inheritance", () => {
    // The half of the answer a union could never express, and the half the leaf
    // walk must not swallow. If this case ever passes by inheriting the
    // plugin's own value, deliberate narrowing is gone and spec criterion
    // :327 with it.
    const root = projectWith({ guard: { categoryPaths: {} } });

    const { guard } = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: root,
    });

    expect(guard.categoryPaths).toEqual({});
  });

  it("an OMITTED leaf comes from the plugin layer, not from DEFAULTS", () => {
    // `{"guard":{"categorySensitivity":{…}}}` — an ordinary edit naming one
    // leaf, which is the shape that used to wipe every sibling in the same
    // object (issue 260804-1601).
    const root = projectWith({ guard: { categorySensitivity: { onto: "low" } } });

    const { guard, escalation } = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: root,
    });

    expect(guard.categorySensitivity).toEqual({ onto: "low" });
    // The two omitted leaves are the PLUGIN's, where DEFAULTS would have said
    // "medium" and `{}`, and the omitted top-level object is the plugin's 9.
    expect(guard.defaultSensitivity).toBe("high");
    expect(guard.categoryPaths).toEqual({ onto: ["ontology/**"] });
    expect(escalation.blocksBeforeHalt).toBe(9);
  });

  it("mixes the two layers inside one object, leaf by leaf", () => {
    // The distinguishing case: a plugin layer whose `guard` differs from
    // DEFAULTS in every leaf the project omits, so "inherited from the plugin"
    // and "fell through to DEFAULTS" have different answers.
    const root = projectWith({
      guard: { categoryPaths: { api: ["src/api/**"] }, defaultSensitivity: "low" },
    });

    const { guard } = loadConfig({
      pluginConfigPath: pluginConfig({
        guard: {
          defaultSensitivity: "high",
          categoryPaths: { onto: ["ontology/**"] },
          categorySensitivity: { onto: "high" },
        },
      }),
      projectRoot: root,
    });

    // Declared by the project: taken as written.
    expect(guard.categoryPaths).toEqual({ api: ["src/api/**"] });
    expect(guard.defaultSensitivity).toBe("low");
    // Omitted by the project: the PLUGIN's, where DEFAULTS would have said `{}`.
    expect(guard.categorySensitivity).toEqual({ onto: "high" });
  });

  it("walks the same way through escalation, churn and decisions", () => {
    // Issue 260804-1633: the same omission defect, latent in four more keys and
    // invisible only because `hooks/config.json` and DEFAULTS happen to agree
    // on every leaf they share. The plugin layer below deliberately disagrees
    // with DEFAULTS everywhere, which is what arms it.
    const root = projectWith({
      escalation: { blocksBeforeHalt: 7 },
      churn: { changesPerSessionWarning: 1 },
    });

    const config = loadConfig({
      pluginConfigPath: pluginConfig({
        decisions: [{ id: "D-1", category: "onto", statement: "…" }],
        escalation: { blocksBeforeHalt: 9 },
        churn: {
          changesPerSessionWarning: 91,
          changesPerSessionCritical: 92,
        },
      }),
      projectRoot: root,
    });

    // Declared: the project's.
    expect(config.escalation.blocksBeforeHalt).toBe(7);
    expect(config.churn.changesPerSessionWarning).toBe(1);
    // Omitted, inside an object the project DID declare: the plugin's, not
    // DEFAULTS' 10.
    expect(config.churn.changesPerSessionCritical).toBe(92);
    // A whole top-level key the project never mentioned.
    expect(config.decisions).toEqual([
      { id: "D-1", category: "onto", statement: "…" },
    ]);
  });

  it("falls through to DEFAULTS when neither layer says anything", () => {
    const config = loadConfig({
      pluginConfigPath: pluginConfig({ guard: { defaultSensitivity: "high" } }),
      projectRoot: projectWith({ guard: { categoryPaths: { api: ["src/api/**"] } } }),
    });

    expect(config.escalation.blocksBeforeHalt).toBe(3);
    expect(config.churn.changesPerSessionCritical).toBe(10);
    expect(config.decisions).toEqual([]);
  });

  it("treats null as nothing configured, at every level and silently", () => {
    // `null` has always meant "nothing configured" here, and it keeps meaning
    // it — it is absent, not wrong, so it inherits and it is diagnosed nowhere.
    const config = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: projectWith({
        guard: { categoryPaths: null, defaultSensitivity: null },
        escalation: null,
      }),
    });

    expect(config.guard.categoryPaths).toEqual({ onto: ["ontology/**"] });
    expect(config.guard.defaultSensitivity).toBe("high");
    expect(config.escalation.blocksBeforeHalt).toBe(9);
    expect(config.diagnostics).toEqual([]);
  });

  it("a project declaring only escalation keeps the plugin's guard settings", () => {
    const root = projectWith({ escalation: { blocksBeforeHalt: 7 } });

    const config = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: root,
    });

    expect(config.escalation.blocksBeforeHalt).toBe(7);
    expect(config.guard.defaultSensitivity).toBe("high");
    expect(config.guard.categoryPaths).toEqual({ onto: ["ontology/**"] });
  });

  it("inherits a value added to the plugin default AFTER the project was set up", () => {
    // What "the seeded file declares inheritance and declares nothing" means
    // operationally: a project that declares no `guard` key picks up a new
    // plugin-side setting without being edited. Measured on the protected list
    // until that list was retired; the property is the leaf walk's, not the
    // list's, and it is the whole reason the seeded template stays empty.
    const root = projectWith({ escalation: { blocksBeforeHalt: 3 } });

    const { guard } = loadConfig({
      pluginConfigPath: pluginConfig({
        guard: { categoryPaths: { onto: ["ontology/**"], brandNew: ["new/**"] } },
      }),
      projectRoot: root,
    });

    expect(guard.categoryPaths.brandNew).toEqual(["new/**"]);
  });
});

// ---------------------------------------------------------------------------
// `guard.enabled` — decision 260804-1631, answered option 1.
//
// The key sits above every check in guard.ts: above the Bash dispatch, above an
// active halt, above the before-fingerprint the protected-path measurement rests
// on. A project that could set it could switch off a guard it is governed by,
// and the shipped code emitted nothing at all when it did.
//
// The diagnostic is asserted in every case below rather than in one. It is what
// the decision record calls "the only thing standing between this option and a
// silently inert key", and a key that is inert AND silent is the state this
// whole answer exists to avoid.
// ---------------------------------------------------------------------------

describe("the project layer may not set guard.enabled", () => {
  it("ignores a project's false and says so", () => {
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { enabled: false } }),
    });

    expect(config.guard.enabled).toBe(true);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("guard.enabled");
    expect(config.diagnostics[0]).toContain("cannot be set by a project");
  });

  it("ignores a project's true as well, and still says so", () => {
    // Same key, same treatment. A project that writes down what it believes to
    // be the status quo has still written a key that does not apply to it, and
    // hearing that is how it learns the file was read at all.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { enabled: true } }),
    });

    expect(config.guard.enabled).toBe(true);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("guard.enabled");
  });

  it("does not empty the rest of guard on the way past — issue 260804-1601", () => {
    // The measured defect in one line: `{"guard":{"enabled":true}}` is the most
    // ordinary edit there is, and it used to remove every sibling leaf the
    // project had not written out for itself.
    const { guard } = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: projectWith({ guard: { enabled: true } }),
    });

    expect(guard.defaultSensitivity).toBe("high");
    expect(guard.categoryPaths).toEqual({ onto: ["ontology/**"] });
  });

  it("reports the key ONCE per load, not once per leaf in the object", () => {
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({
        guard: { enabled: false, categoryPaths: { api: ["src/api/**"] } },
      }),
    });

    expect(
      config.diagnostics.filter((d) => d.includes("guard.enabled")),
    ).toHaveLength(1);
    // …and the rest of the object still took effect, so the exception is one
    // key rather than a rejection of the file.
    expect(config.guard.categoryPaths).toEqual({ api: ["src/api/**"] });
  });

  it("says nothing when the project omits the key, which is the normal case", () => {
    expect(
      loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: projectWith({ guard: { categoryPaths: { api: ["src/api/**"] } } }),
      }).diagnostics,
    ).toEqual([]);
  });

  it("still reads the key from the PLUGIN layer, where it has always lived", () => {
    // The exception is about who may write the key, not about the key. Fusion's
    // own `hooks/config.json` still turns its guard off.
    const config = loadConfig({
      pluginConfigPath: pluginConfig({ guard: { enabled: false } }),
      projectRoot: projectWith({ guard: { categoryPaths: { api: ["src/api/**"] } } }),
    });

    expect(config.guard.enabled).toBe(false);
    expect(config.diagnostics).toEqual([]);
  });

  it("a project cannot re-enable a guard the plugin turned off, either", () => {
    // The direction nobody asked about. "The project layer is not consulted"
    // has to mean both directions or it is a permission rule wearing a
    // precedence rule's clothes.
    const config = loadConfig({
      pluginConfigPath: pluginConfig({ guard: { enabled: false } }),
      projectRoot: projectWith({ guard: { enabled: true } }),
    });

    expect(config.guard.enabled).toBe(false);
    expect(config.diagnostics[0]).toContain("guard.enabled");
  });
});

// ---------------------------------------------------------------------------
// `guard.protectedPaths` — retired 2026-08-12 with the mechanism it configured.
//
// The third state a key can be in, beside "known" and "unknown". An unknown key
// is carried through in silence, and must be: the seeded template is mostly
// underscore-prefixed documentation keys, and a validator that rejected them
// would make the file fusion itself ships a broken one. A retired key looks
// exactly like an unknown key to that validator and must not be treated like
// one — a project declared it deliberately, usually after something got written
// that should not have been, and the removal is invisible from inside that
// project. This diagnostic is the only notice a consuming project gets.
//
// The loudness is `guard.enabled`'s, deliberately: named key, stated reason, on
// every guarded tool call until the line comes out of the file. What differs is
// the reason — the key is not refused, it is gone.
// ---------------------------------------------------------------------------

describe("a retired key is named, not carried through in silence", () => {
  /** The whole sentence, for a project file at `root`. */
  const expected = (root: string): string =>
    `Guard configuration at ${resolve(root, PROJECT_CONFIG_FILENAME)}: ` +
    `"guard.protectedPaths" no longer exists — fusion removed the ` +
    `protected-path mechanism it configured, so declaring the list protects ` +
    `nothing and nothing reads it. The key was ignored; the rest of this file ` +
    `is unaffected. Delete the line to stop this advisory.`;

  it("tells a project that still declares a protected list, in full", () => {
    // Asserted as the WHOLE string rather than by substring. Three things have
    // to be in it and each is load-bearing: the key, so the reader can find the
    // line; "no longer exists", so it reads as a removal and not as a typo; and
    // an instruction, so the advisory can be made to stop. A substring
    // assertion would let any of the three fall out unnoticed.
    const root = projectWith({
      guard: { protectedPaths: ["agents/**", "rules/**"] },
    });

    const { diagnostics } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(diagnostics).toEqual([expected(root)]);
  });

  it("says it whatever the declared value is — including the empty list", () => {
    // The empty list is the case that most deserves the notice: it is a project
    // that narrowed the protection ON PURPOSE, and it is well-typed, so nothing
    // else in this loader would ever have said a word about it. The wrong-typed
    // spellings are here because a retired key is not a validation failure and
    // must not be reported as one — the reader would go and fix the type.
    for (const value of [[], ["secret/**"], 123, "rules/**", { a: 1 }]) {
      resetConfigCache();
      const root = projectWith({ guard: { protectedPaths: value } });
      const { diagnostics } = loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: root,
      });

      expect(diagnostics).toEqual([expected(root)]);
    }
  });

  it("drops the value rather than letting it reach the effective config", () => {
    // "Ignored" is a claim about the merge, not only about the message. A
    // retired key that survived into `raw` would be an unknown key by another
    // name, and the next reader of the guard object would find a list there.
    const declared = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { protectedPaths: ["secret/**"] } }),
    });
    resetConfigCache();
    const silent = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: tmp(),
    });

    expect(
      (declared.guard as unknown as Record<string, unknown>).protectedPaths,
    ).toBeUndefined();
    expect(JSON.stringify(effective(declared))).toBe(
      JSON.stringify(effective(silent)),
    );
  });

  it("leaves the rest of the file working, and says so", () => {
    // The other half of what a project needs to hear. A file carrying one
    // retired key is not a broken file, and a project that read the advisory as
    // "my configuration was dropped" would go and rewrite settings that are
    // being honoured.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({
        guard: {
          protectedPaths: ["secret/**"],
          defaultSensitivity: "high",
          categoryPaths: { api: ["src/api/**"] },
        },
        escalation: { blocksBeforeHalt: 7 },
      }),
    });

    expect(config.guard.defaultSensitivity).toBe("high");
    expect(config.guard.categoryPaths).toEqual({ api: ["src/api/**"] });
    expect(config.escalation.blocksBeforeHalt).toBe(7);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("the rest of this file is unaffected");
  });

  it("says it about the PLUGIN layer too, which is a stale install", () => {
    // Unscoped, unlike the `guard.enabled` refusal above, and the difference is
    // the point: `enabled` is a key the plugin layer may legitimately set, so
    // only a project hears about it. A retired key is retired for everybody, and
    // a plugin `config.json` still carrying one is an install that did not
    // finish updating.
    const path = pluginConfig({ guard: { protectedPaths: ["agents/**"] } });

    const { diagnostics } = loadConfig({
      pluginConfigPath: path,
      projectRoot: null,
    });

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toContain(path);
    expect(diagnostics[0]).toContain('"guard.protectedPaths" no longer exists');
  });

  it("is silent for the shipped plugin config and the seeded template", () => {
    // The anti-noise case, and the one that fails if step 8 is ever reverted:
    // fusion's own two files must not make every project on earth read an
    // advisory about a key fusion itself declared.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectSeededWithTemplate(),
    });

    expect(config.diagnostics).toEqual([]);
  });

  it("says nothing to a project that never declared the key", () => {
    // The ordinary project, which is nearly all of them.
    expect(
      loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: projectWith({ guard: { defaultSensitivity: "high" } }),
      }).diagnostics,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Type validation — issues 260804-1603 and 260804-1606.
//
// One rule for both mechanisms, which is the obligation decision 260804-1630
// carries: a key that fails validation is DROPPED and NAMED, and the leaf walk
// then finds it absent and inherits. So a dropped key, an omitted key and a key
// the project never wrote are three spellings of one behaviour — asserted as
// such in the last case of this block rather than left to be inferred from the
// rows above it.
// ---------------------------------------------------------------------------

describe("a value that cannot be used is dropped, named, and inherited past", () => {
  /** Load a project whose file holds `value`, against the shipped plugin layer. */
  function withValue(value: object): GuardConfig {
    return loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith(value),
    });
  }

  // Every row measured in issue 260804-1603, plus the container and the
  // element-type cases the same rule covers. Labelled an OPEN set: the rule is
  // "a leaf must have its declared type", and these are the spellings that had
  // been met at the time of writing, not the spellings that exist.
  //
  // The rows were measured on `guard.protectedPaths` and are re-pointed at
  // `guard.categoryPaths` with the spellings unchanged, because the rule they
  // demonstrate is the leaf walk's and not that leaf's: an object-typed leaf
  // takes exactly the same four wrong shapes. The plugin layer is the
  // distinguishing one, so "inherits" is a claim with a witness — against the
  // shipped file every leaf now equals its default and the row would pass
  // whether anything was inherited or not.
  const rows: [string, object, string][] = [
    ["a number", { guard: { categoryPaths: 123 } }, "guard.categoryPaths"],
    [
      "an object of strings rather than of arrays",
      { guard: { categoryPaths: { a: "ontology/**" } } },
      "guard.categoryPaths",
    ],
    ["an array", { guard: { categoryPaths: [42] } }, "guard.categoryPaths"],
    [
      "a bare string — the quiet one that never crashed",
      { guard: { categoryPaths: "ontology/**" } },
      "guard.categoryPaths",
    ],
    ["a non-object guard", { guard: "on" }, "guard"],
    ["an array guard", { guard: ["ontology/**"] }, "guard"],
  ];

  for (const [label, value, key] of rows) {
    it(`drops guard.categoryPaths given ${label}, and inherits the plugin's`, () => {
      const config = loadConfig({
        pluginConfigPath: distinguishingPlugin(),
        projectRoot: projectWith(value),
      });

      expect(config.guard.categoryPaths).toEqual({ onto: ["ontology/**"] });
      expect(config.diagnostics).toHaveLength(1);
      expect(config.diagnostics[0]).toContain(key);
    });
  }

  it("drops a bad categoryPaths value without touching the rest of guard", () => {
    const config = withValue({
      guard: {
        defaultSensitivity: "high",
        categoryPaths: { api: "src/api/**" },
      },
    });

    expect(config.guard.categoryPaths).toEqual({});
    expect(config.guard.defaultSensitivity).toBe("high");
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("guard.categoryPaths");
  });

  it("drops a defaultSensitivity that is not one of the four levels", () => {
    const config = withValue({ guard: { defaultSensitivity: "extreme" } });

    expect(config.guard.defaultSensitivity).toBe("medium");
    expect(config.diagnostics[0]).toContain("guard.defaultSensitivity");
  });

  it("drops decisions that are not decisions", () => {
    // `"nope"` iterates as characters and matches no category — harmless by
    // luck, which is not a property to rely on.
    const config = withValue({ decisions: "nope" });

    expect(config.decisions).toEqual([]);
    expect(config.diagnostics[0]).toContain("decisions");
  });

  it("keeps a well-formed decisions array", () => {
    const config = withValue({
      decisions: [{ id: "D-1", category: "onto", statement: "…" }],
    });

    expect(config.decisions).toHaveLength(1);
    expect(config.diagnostics).toEqual([]);
  });

  it("drops blocksBeforeHalt: 0 — issue 260804-1606", () => {
    // `0` halts on the first denied call, before the agent has had the second
    // and third chances the three-block design exists to give it. Almost
    // certainly a project meaning "no threshold" and getting the strictest one.
    const config = withValue({ escalation: { blocksBeforeHalt: 0 } });

    expect(config.escalation.blocksBeforeHalt).toBe(3);
    expect(config.diagnostics[0]).toContain("escalation.blocksBeforeHalt");
  });

  it("drops a negative, fractional or stringly-typed halt threshold", () => {
    for (const bad of [-1, 2.5, "3"]) {
      resetConfigCache();
      const config = withValue({ escalation: { blocksBeforeHalt: bad } });
      expect(config.escalation.blocksBeforeHalt).toBe(3);
      expect(config.diagnostics).toHaveLength(1);
    }
  });

  it("keeps a large halt threshold — no upper bound, deliberately", () => {
    // A big number is a defensible project choice; inventing a ceiling would be
    // a policy nobody asked for. Recorded so the absence reads as a decision.
    const config = withValue({ escalation: { blocksBeforeHalt: 999999 } });

    expect(config.escalation.blocksBeforeHalt).toBe(999999);
    expect(config.diagnostics).toEqual([]);
  });

  it("validates the PLUGIN layer through the same function", () => {
    // Smaller risk, because the file is protected — and `260802-2334` is this
    // Circle's standing proof that "the file is protected" was not enough once
    // already.
    const config = loadConfig({
      pluginConfigPath: pluginConfig({ guard: { categoryPaths: "ontology/**" } }),
      projectRoot: null,
    });

    expect(config.guard.categoryPaths).toEqual({});
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("guard.categoryPaths");
  });

  it("accepts unknown keys, including the template's documentation keys", () => {
    // The seeded template is mostly six underscore-prefixed notes. A validator
    // that rejected unknown keys would make the file fusion itself ships a
    // broken one, and the seeding in `7f3d789` a no-op.
    const config = withValue({
      _comment: "why this file exists",
      _override: "how the merge works",
      guard: { defaultSensitivity: "high", _note: "and here too" },
    });

    expect(config.guard.defaultSensitivity).toBe("high");
    expect(config.diagnostics).toEqual([]);
  });

  it("makes a dropped key, an omitted key and an unwritten file identical", () => {
    // The step is finished when these three are demonstrably the same thing.
    const dropped = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: projectWith({ guard: { categoryPaths: 123 } }),
    });
    resetConfigCache();
    const omitted = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: projectWith({ guard: { defaultSensitivity: "high" } }),
    });
    resetConfigCache();
    const never = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: tmp(),
    });

    // Byte-for-byte the same effective configuration, all three. Until the
    // protected-path removal the first two were entitled to one difference —
    // the self-protection floor, which applied because their file exists and
    // the third's does not — and this case had to subtract it before comparing.
    // There is no floor now, so the three are comparable whole, which is a
    // stronger statement of the same equivalence.
    expect(JSON.stringify(effective(dropped))).toBe(
      JSON.stringify(effective(never)),
    );
    expect(JSON.stringify(effective(omitted))).toBe(
      JSON.stringify(effective(never)),
    );
    // The one thing that differs, and it is the point: the dropped key was
    // named. Silence is what made this defect a defect.
    expect(dropped.diagnostics).toHaveLength(1);
    expect(omitted.diagnostics).toEqual([]);
    expect(never.diagnostics).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// THREE DESCRIBES STOOD HERE — 22 cases, all of them about the protected list,
// all deleted with it.
//
//   - "the returned config carries which layer declared protectedPaths" (5)
//     pinned `protectedPathsSource`, a load report that existed for exactly one
//     caller: decision `260803-1314` has a project's OWN declared entries
//     outrank `FUSION_ALLOW_RULES_WRITE`, and after `260804-1630` an omitted
//     list inherits the plugin's, so "did this project declare it?" could not be
//     read off the effective list.
//   - "the entries a project declared for itself" (7) pinned
//     `projectDeclaredProtectedPaths`, the subtraction that caller performed.
//     Its sharpest case was the boring one — a project that declared nothing
//     returns nothing, because returning the effective list there would have
//     ended the exemption in every project on earth.
//   - "the self-protection floor" (11) pinned that `fusion-guard.json` protected
//     itself once it existed, in both spellings (`260804-1604`), and only once
//     it existed so that `/fusion:setup` could seed it (`260802-1912`).
//
// The exemption went in step 6 and the list in steps 7 and 8, so the first two
// have no subject at all. THE THIRD IS A LOSS AND IS RECORDED AS ONE: nothing in
// the guard defends `fusion-guard.json` from an agent any more. What bounds that
// is what always bounded the gap before the file existed — it is git-tracked, so
// a change to it appears in a diff.
// ---------------------------------------------------------------------------

describe("diagnostics — a dropped source is named, never silent", () => {
  it("an unparseable project file yields the plugin's config plus one diagnostic", () => {
    const root = projectWith("{ this is not json ");

    const config = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: root,
    });

    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain(PROJECT_CONFIG_FILENAME);
    // Fell back to the PLUGIN's values rather than through them to DEFAULTS.
    expect(config.guard.defaultSensitivity).toBe("high");
    expect(config.escalation.blocksBeforeHalt).toBe(9);
  });

  it("names the file that was dropped, so the user knows which one to fix", () => {
    const root = projectWith("nope");

    const [diagnostic] = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    }).diagnostics;

    expect(diagnostic).toContain(resolve(root, PROJECT_CONFIG_FILENAME));
  });

  it("reports JSON that parses but is not an object", () => {
    const root = projectWith("[1, 2, 3]");

    const config = loadConfig({
      pluginConfigPath: distinguishingPlugin(),
      projectRoot: root,
    });

    expect(config.diagnostics).toHaveLength(1);
    expect(config.guard.defaultSensitivity).toBe("high");
  });

  it("says nothing about an ABSENT project file — that is not a problem", () => {
    expect(
      loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: tmp(),
      }).diagnostics,
    ).toEqual([]);
  });

  it("reports an ABSENT plugin file, and names the path it searched", () => {
    // The asymmetry with the case above is the whole point (`260809-1101`). A
    // project that never wrote a configuration file is the ordinary case and
    // must not be nagged; a plugin whose own `config.json` is missing is a
    // broken install, and it used to be the one file carrying a non-empty
    // protected list. Before this the loader dropped it silently, so the guard
    // protected nothing and said nothing.
    //
    // The list is retired, so the diagnostic's CLAIM is smaller now: every leaf
    // falls through to `DEFAULTS`, which the shipped plugin file agrees with
    // leaf for leaf, so today the absence costs nothing measurable. The
    // diagnostic stays because a file fusion ships is missing, and the two
    // layers stop agreeing the moment either changes.
    //
    // That the entry reaches the user as a `guard_advisory` needs no case of
    // its own: `hooks/guard.ts` emits one per entry of `config.diagnostics`
    // without asking which layer produced it, and the end-to-end mapping is
    // pinned in `guard-project-config-integration.test.ts`.
    const missing = resolve(tmp(), "config.json");

    const config = loadConfig({
      pluginConfigPath: missing,
      projectRoot: null,
    });

    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain(missing);
    // Still falls through to DEFAULTS rather than throwing: the diagnostic is
    // the change, the fallback is not.
    expect(config.guard.defaultSensitivity).toBe("medium");
    expect(config.escalation.blocksBeforeHalt).toBe(3);
  });

  it("reports the absent plugin file exactly once, not once per key it lacks", () => {
    // `guard_advisory` is emitted one per diagnostic on EVERY guarded call
    // (`hooks/guard.ts`), so the count is the difference between one advisory
    // and a flood. The acceptance criterion says "exactly one".
    const config = loadConfig({
      pluginConfigPath: resolve(tmp(), "config.json"),
      projectRoot: projectWith({ guard: { defaultSensitivity: "high" } }),
    });

    expect(config.diagnostics).toHaveLength(1);
  });

  it("says nothing about an absent plugin file when the project layer is the absent one", () => {
    // The other half of the asymmetry, stated as its own case so a future
    // change that made BOTH layers loud would fail here rather than pass.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: tmp(),
    });

    expect(config.diagnostics).toEqual([]);
  });

  it("reports a plugin file that EXISTS and does not parse", () => {
    const config = loadConfig({
      pluginConfigPath: pluginConfig("{{{"),
      projectRoot: null,
    });

    expect(config.diagnostics).toHaveLength(1);
    expect(config.guard.defaultSensitivity).toBe("medium");
  });

  it("reports both layers when both are broken", () => {
    const config = loadConfig({
      pluginConfigPath: pluginConfig("{{{"),
      projectRoot: projectWith("]]]"),
    });

    expect(config.diagnostics).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// The Turn budget — issue `260811-1712`.
//
// The one setting in this file that is not the guard's. It reaches the
// orchestrator through `bin/fusion-turn-budget` at Setup, not through a hook,
// and it is here because `fusion-guard.json` is the per-project surface a
// project already has. What the cases below pin is that it takes the SAME leaf
// walk as everything else — declared wins, omitted inherits, unusable is
// dropped and named and then inherits — because the whole argument for reusing
// this loader was that a project owner would not have to learn a second rule.
//
// The default's uniqueness is pinned elsewhere, in
// `turn-budget-lint.test.ts`: it is a claim about where the number is WRITTEN,
// which is a text question, not a merge question.
// ---------------------------------------------------------------------------

describe("the orchestrator's Turn budget merges like every other leaf", () => {
  it("falls to the built-in default when neither layer declares it", () => {
    // The plugin's own config.json deliberately carries no `orchestrator`
    // section, so the shipped path really is the DEFAULTS path.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: null,
    });

    expect(config.orchestrator.maxTurns).toBe(5);
    expect(config.diagnostics).toEqual([]);
  });

  it("takes a project's declared budget exactly as written", () => {
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ orchestrator: { maxTurns: 12 } }),
    });

    expect(config.orchestrator.maxTurns).toBe(12);
    expect(config.diagnostics).toEqual([]);
  });

  it("lets the project layer override a plugin-declared budget", () => {
    const config = loadConfig({
      pluginConfigPath: pluginConfig({ orchestrator: { maxTurns: 7 } }),
      projectRoot: projectWith({ orchestrator: { maxTurns: 3 } }),
    });

    expect(config.orchestrator.maxTurns).toBe(3);
  });

  it("inherits the plugin's budget when the project declares none", () => {
    const config = loadConfig({
      pluginConfigPath: pluginConfig({ orchestrator: { maxTurns: 7 } }),
      projectRoot: projectWith({ guard: { defaultSensitivity: "high" } }),
    });

    expect(config.orchestrator.maxTurns).toBe(7);
  });

  it.each([
    ["zero", 0, "a session that could never run a Turn"],
    ["a negative", -3, "not a count of anything"],
    ["a decimal", 2.5, "not a number of Turns"],
    ["a string", "many", "not a number at all"],
    ["null-ish text", "5", "a number's spelling, not a number"],
  ])("drops %s and inherits the default", (_name, value, _why) => {
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ orchestrator: { maxTurns: value } }),
    });

    // Drop, NAME, inherit — the same three things an unusable value has cost
    // everywhere else in this loader since `260804-1630`. A budget silently
    // replaced by the default is a project running a bound it did not choose
    // and believes it did.
    expect(config.orchestrator.maxTurns).toBe(5);
    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain("orchestrator.maxTurns");
    expect(config.diagnostics[0]).toContain("a whole number of 1 or more");
  });

  it("accepts a large budget — there is no ceiling", () => {
    // Deliberate, and the same choice `escalation.blocksBeforeHalt` made: a
    // project that wants 60 Turns has said so in a git-tracked file, and a
    // ceiling invented here would be a policy nobody asked for.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ orchestrator: { maxTurns: 60 } }),
    });

    expect(config.orchestrator.maxTurns).toBe(60);
    expect(config.diagnostics).toEqual([]);
  });
});

describe("the cache is keyed on the resolved source pair", () => {
  it("two successive loads with DIFFERENT sources return different configs", () => {
    // The defect this replaces: a cache keyed on nothing returned the first
    // answer forever, so the second load below would have carried the first
    // project's list. One process, many source pairs, is exactly what a vitest
    // file is.
    const a = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { categoryPaths: { a: ["a/**"] } } }),
    });
    const b = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { categoryPaths: { b: ["b/**"] } } }),
    });

    expect(a.guard.categoryPaths).toEqual({ a: ["a/**"] });
    expect(b.guard.categoryPaths).toEqual({ b: ["b/**"] });
  });

  it("a repeat load with the SAME sources hits the memo", () => {
    const sources = {
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { categoryPaths: { a: ["a/**"] } } }),
    };

    expect(loadConfig(sources)).toBe(loadConfig(sources));
  });

  it("distinguishes a null project root from a project root that has no file", () => {
    // Same effective config either way, so identity is the only observable
    // difference — and it is the one that proves the key carries the root.
    const first = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: null,
    });
    const second = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: tmp(),
    });

    expect(second).not.toBe(first);
    expect(JSON.stringify(effective(second))).toBe(
      JSON.stringify(effective(first)),
    );
  });

  it("resetConfigCache() forces a fresh read", () => {
    const root = tmp();
    const sources = {
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    };

    // No file yet, so the plugin layer's value stands.
    expect(loadConfig(sources).guard.categoryPaths).toEqual({});

    writeFileSync(
      resolve(root, PROJECT_CONFIG_FILENAME),
      JSON.stringify({ guard: { categoryPaths: { late: ["late/**"] } } }),
      "utf-8",
    );
    resetConfigCache();

    expect(loadConfig(sources).guard.categoryPaths).toEqual({
      late: ["late/**"],
    });
  });
});

// ---------------------------------------------------------------------------
// The seeded template — plan step 7.
//
// `templates/fusion-guard.json` is what `/fusion:setup` copies into a consuming
// project. It declares inheritance and declares NO setting: it carries only
// underscore-prefixed documentation keys, which this loader never reads because
// `RawConfig` names six top-level keys and nothing else looks at the rest.
//
// "Inherits and declares nothing" is a claim about the MERGE, not about the
// file's text, so it is measured through `loadConfig` rather than by grepping
// the file. The second half of the case is the anti-vacuity half: a plugin layer
// whose every top-level key differs from DEFAULTS, so that a template which grew
// ANY top-level key replaces that key whole, falls back to DEFAULTS for it, and
// fails here.
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
 * The top-level keys of `fusion-guard.json` that a project is documented to set
 * for itself, and which the drift check below therefore admits as a difference
 * between this repository's copy and the shipped template. This list is the ONE
 * place that exemption is stated: a setting that becomes project-configurable
 * later is admitted by adding its top-level key here and nowhere else.
 *
 * `orchestrator` is here because `templates/fusion-guard.json`'s own
 * `_turnBudget` note tells every project that this file is the only place to
 * change the orchestrator's Turn budget, and this repository is such a project.
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

describe("the seeded template declares inheritance and declares nothing", () => {
  it("merges to the plugin's configuration and nothing else", () => {
    const root = projectSeededWithTemplate();
    const seeded = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });
    resetConfigCache();
    const pluginOnly = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: null,
    });

    // It parses, and its documentation keys are IGNORED rather than reported:
    // an unrecognised key produces no diagnostic, which is the whole convention
    // the file's own notes rely on. It also pins that the template carries no
    // RETIRED key — `guard.protectedPaths` in the seeded file would be one
    // diagnostic here, on every guarded call, in every project fusion set up.
    expect(seeded.diagnostics).toEqual([]);

    // Identical, byte for byte, over the whole configuration. The
    // self-protection floor used to be the one difference the seeded file was
    // allowed to make, and it had to be subtracted before this comparison; with
    // the floor gone the seeded file makes NO difference at all, which is a
    // stronger reading of "declares inheritance and declares nothing".
    expect(JSON.stringify(effective(seeded))).toBe(
      JSON.stringify(effective(pluginOnly)),
    );
  });

  it("inherits every top-level key, including one added to the plugin later", () => {
    // Each key below is deliberately DISTINCT from DEFAULTS, so "the template
    // declared this key" and "the template stayed silent" have different
    // answers for all of them. Against the shipped config alone they would not:
    // its escalation and churn both equal DEFAULTS, and it declares no
    // `orchestrator` section at all, so a template that restated any of the
    // three would pass the case above unnoticed.
    const pluginConfigPath = pluginConfig({
      guard: {
        enabled: false,
        defaultSensitivity: "high",
        categoryPaths: { addedAfterTheProjectWasSeeded: ["late/**"] },
        categorySensitivity: { addedAfterTheProjectWasSeeded: "high" },
      },
      decisions: [{ id: "D-1", category: "onto", statement: "…" }],
      escalation: { blocksBeforeHalt: 9 },
      churn: {
        changesPerSessionWarning: 91,
        changesPerSessionCritical: 92,
      },
      orchestrator: { maxTurns: 93 },
    });

    const root = projectSeededWithTemplate();
    const seeded = loadConfig({ pluginConfigPath, projectRoot: root });
    resetConfigCache();
    const pluginOnly = loadConfig({ pluginConfigPath, projectRoot: null });

    // The acceptance criterion in one line: a setting added to the plugin
    // default AFTER this project was set up governs it, with the seeded file
    // untouched.
    expect(seeded.guard.categoryPaths).toEqual({
      addedAfterTheProjectWasSeeded: ["late/**"],
    });

    expect(JSON.stringify(effective(seeded))).toBe(
      JSON.stringify(effective(pluginOnly)),
    );
  });

  it("is what this repository's own fusion-guard.json is, apart from the keys this repository sets for itself", () => {
    // Per plan Q4 the repository root carries the template. Asserted rather than
    // eyeballed, because the two files drift the first time someone edits the
    // one they happen to have open.
    //
    // WHAT IS COMPARED: every byte of both files except the top-level entries
    // named in PROJECT_SET_KEYS, which are cut out of each side first. So the
    // five documentation notes are still held byte for byte — edit one, delete
    // one, reorder them, or change a space inside the shared part and this case
    // fails, which is the drift it was written to catch.
    //
    // WHAT IS DELIBERATELY NOT COMPARED, and why: the value of a key a project
    // is documented to set for itself. `templates/fusion-guard.json`'s own
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
    // asked for, and the byte-identity case would have measured the wrong thing.
    //
    // The witness used to be the self-protection floor, which appended
    // `fusion-guard.json` to the effective list whenever a project root was
    // resolved. The floor is gone with the protected-path mechanism, so the case
    // builds its own witness instead: a workbench root whose configuration says
    // something this loader reads, and a `chdir` into it. That is a stronger
    // case than the one it replaces, because it no longer depends on being run
    // inside a project that happens to have a `fusion-guard.json`.
    const root = tmp();
    mkdirSync(resolve(root, "fusion-workbench"), { recursive: true });
    writeFileSync(resolve(root, "fusion-workbench", ".fusion-setup"), "{}", "utf-8");
    writeFileSync(
      resolve(root, PROJECT_CONFIG_FILENAME),
      JSON.stringify({ guard: { defaultSensitivity: "none" } }),
      "utf-8",
    );

    const before = process.cwd();
    try {
      process.chdir(root);
      // The walk WOULD find it — asserted first, so a case that stopped
      // witnessing anything fails here rather than passing vacuously.
      expect(findWorkbenchRoot()).not.toBeNull();
      resetConfigCache();
      expect(
        loadConfig({ pluginConfigPath: SHIPPED_PLUGIN_CONFIG }).guard
          .defaultSensitivity,
      ).toBe("none");

      resetConfigCache();
      expect(
        loadConfig({
          pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
          projectRoot: null,
        }).guard.defaultSensitivity,
      ).toBe("medium");
    } finally {
      process.chdir(before);
    }
  });
});

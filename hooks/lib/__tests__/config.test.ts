import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  copyFileSync,
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
 * The load report is two fields now, and both describe what happened while
 * reading the files rather than what the guard will do: `diagnostics` names the
 * layers and keys that were dropped, and `protectedPathsSource` names the layer
 * the protected list came from. Neither is a setting, and including either in a
 * comparison would make "did the effective configuration change?" unanswerable —
 * which matters most for the byte-identity case below, whose whole job is to
 * answer exactly that question with "no".
 */
function effective(
  config: GuardConfig,
): Omit<GuardConfig, "diagnostics" | "protectedPathsSource"> {
  const {
    diagnostics: _ignored,
    protectedPathsSource: _alsoIgnored,
    ...rest
  } = config;
  return rest;
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
// The Circle's first constraint is that no path protected today becomes
// unprotected, and the merge changes what the protected list IS — so it needs
// measuring rather than reasoning about. The reference below is the loader as
// it stood BEFORE step 6, transcribed: one source, leaf-level `?? DEFAULTS`, no
// project layer, no floor. A project with no `fusion-guard.json` must produce
// output byte-identical to what that function returns for the same file.
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
    protectedPaths: [] as string[],
    categoryPaths: {} as Record<string, string[]>,
    categorySensitivity: {} as Record<string, string>,
  },
  decisions: [] as unknown[],
  escalation: { blocksBeforeHalt: 3 },
  churn: {
    changesPerSessionWarning: 5,
    changesPerSessionCritical: 10,
    totalChangesWarning: 8,
    totalChangesCritical: 15,
  },
  crossFile: { pingBackWarning: 3, pingBackCritical: 5 },
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
      protectedPaths: raw.guard?.protectedPaths ?? D.guard.protectedPaths,
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
      totalChangesWarning:
        raw.churn?.totalChangesWarning ?? D.churn.totalChangesWarning,
      totalChangesCritical:
        raw.churn?.totalChangesCritical ?? D.churn.totalChangesCritical,
    },
    crossFile: {
      pingBackWarning:
        raw.crossFile?.pingBackWarning ?? D.crossFile.pingBackWarning,
      pingBackCritical:
        raw.crossFile?.pingBackCritical ?? D.crossFile.pingBackCritical,
    },
  };
}

describe("a project with no fusion-guard.json is byte-identical to before step 6", () => {
  it("with no project root at all", () => {
    const actual = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: null,
    });

    expect(JSON.stringify(effective(actual))).toBe(
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

    expect(JSON.stringify(effective(actual))).toBe(
      JSON.stringify(loadConfigAsOfStep5(SHIPPED_PLUGIN_CONFIG)),
    );
    expect(actual.diagnostics).toEqual([]);
  });

  it("still names every path the shipped plugin config protects", () => {
    // Stated separately from the byte comparison because it is the constraint
    // in the Circle's own words, and because a byte comparison against a
    // reference that was itself wrong would satisfy the case above.
    const { guard } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: tmp(),
    });

    for (const p of [
      "agents/**",
      "rules/**",
      "hooks/config.json",
      "hooks/hooks.json",
      "settings.json",
      "bin/monitor",
      "skills/**",
      ".claude-plugin/plugin.json",
      "fusion-workbench/.guard-state/**",
    ]) {
      expect(guard.protectedPaths).toContain(p);
    }
    expect(guard.protectedPaths).not.toContain(PROJECT_CONFIG_FILENAME);
  });
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
// `{"guard":{"enabled":true}}` removed all nine protected patterns. It is
// deleted rather than adapted, because the behaviour it pinned is the defect.
// ---------------------------------------------------------------------------

describe("merge — per leaf: project, then plugin, then DEFAULTS", () => {
  it("a project declaring protectedPaths gets that list, not a union", () => {
    const root = projectWith({ guard: { protectedPaths: ["secret/**"] } });

    const { guard } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(guard.protectedPaths).toContain("secret/**");
    // A union would be the safe-looking choice and it is the wrong one: it
    // makes narrowing impossible, which is half of what a project-level list
    // was asked for.
    expect(guard.protectedPaths).not.toContain("agents/**");
    expect(guard.protectedPaths).not.toContain("rules/**");
  });

  it("a DECLARED empty list is the empty list, not an inheritance", () => {
    // The half of the answer a union could never express, and the half the leaf
    // walk must not swallow. If this case ever passes by inheriting the
    // plugin's nine patterns, deliberate narrowing is gone and spec criterion
    // :327 with it.
    const root = projectWith({ guard: { protectedPaths: [] } });

    const { guard, protectedPathsSource } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    // Only the floor, because the file exists.
    expect(guard.protectedPaths).toEqual([PROJECT_CONFIG_FILENAME]);
    expect(protectedPathsSource).toBe("project");
  });

  it("an OMITTED leaf comes from the plugin layer, not from DEFAULTS", () => {
    // `{"guard":{"defaultSensitivity":"high"}}` — an ordinary edit, and the one
    // that used to empty the protected list (issue 260804-1601).
    const root = projectWith({ guard: { defaultSensitivity: "high" } });

    const { guard, protectedPathsSource } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(guard.defaultSensitivity).toBe("high");
    expect(guard.protectedPaths).toContain("agents/**");
    expect(guard.protectedPaths).toContain("rules/**");
    expect(protectedPathsSource).toBe("plugin");
  });

  it("mixes the two layers inside one object, leaf by leaf", () => {
    // The distinguishing case: a plugin layer whose `guard` differs from
    // DEFAULTS in every leaf the project omits, so "inherited from the plugin"
    // and "fell through to DEFAULTS" have different answers.
    const root = projectWith({
      guard: { protectedPaths: ["secret/**"], defaultSensitivity: "high" },
    });

    const { guard } = loadConfig({
      pluginConfigPath: pluginConfig({
        guard: {
          protectedPaths: ["agents/**"],
          categoryPaths: { onto: ["ontology/**"] },
          categorySensitivity: { onto: "high" },
        },
      }),
      projectRoot: root,
    });

    // Declared by the project: taken as written, plus the floor.
    expect(guard.protectedPaths).toEqual(["secret/**", PROJECT_CONFIG_FILENAME]);
    expect(guard.defaultSensitivity).toBe("high");
    // Omitted by the project: the PLUGIN's, where DEFAULTS would have said `{}`.
    expect(guard.categoryPaths).toEqual({ onto: ["ontology/**"] });
    expect(guard.categorySensitivity).toEqual({ onto: "high" });
  });

  it("walks the same way through escalation, churn, crossFile and decisions", () => {
    // Issue 260804-1633: the same omission defect, latent in four more keys and
    // invisible only because `hooks/config.json` and DEFAULTS happen to agree
    // on every leaf they share. The plugin layer below deliberately disagrees
    // with DEFAULTS everywhere, which is what arms it.
    const root = projectWith({
      escalation: { blocksBeforeHalt: 7 },
      churn: { changesPerSessionWarning: 1 },
      crossFile: { pingBackWarning: 1 },
    });

    const config = loadConfig({
      pluginConfigPath: pluginConfig({
        decisions: [{ id: "D-1", category: "onto", statement: "…" }],
        escalation: { blocksBeforeHalt: 9 },
        churn: {
          changesPerSessionWarning: 91,
          changesPerSessionCritical: 92,
          totalChangesWarning: 93,
          totalChangesCritical: 94,
        },
        crossFile: { pingBackWarning: 95, pingBackCritical: 96 },
      }),
      projectRoot: root,
    });

    // Declared: the project's.
    expect(config.escalation.blocksBeforeHalt).toBe(7);
    expect(config.churn.changesPerSessionWarning).toBe(1);
    expect(config.crossFile.pingBackWarning).toBe(1);
    // Omitted, inside an object the project DID declare: the plugin's, not
    // DEFAULTS' 10 / 8 / 15 / 5.
    expect(config.churn.changesPerSessionCritical).toBe(92);
    expect(config.churn.totalChangesWarning).toBe(93);
    expect(config.churn.totalChangesCritical).toBe(94);
    expect(config.crossFile.pingBackCritical).toBe(96);
    // A whole top-level key the project never mentioned.
    expect(config.decisions).toEqual([
      { id: "D-1", category: "onto", statement: "…" },
    ]);
  });

  it("falls through to DEFAULTS when neither layer says anything", () => {
    const config = loadConfig({
      pluginConfigPath: pluginConfig({ guard: { defaultSensitivity: "high" } }),
      projectRoot: projectWith({ guard: { protectedPaths: ["secret/**"] } }),
    });

    expect(config.escalation.blocksBeforeHalt).toBe(3);
    expect(config.churn.totalChangesCritical).toBe(15);
    expect(config.crossFile.pingBackCritical).toBe(5);
    expect(config.decisions).toEqual([]);
  });

  it("treats null as nothing configured, at every level and silently", () => {
    // `null` has always meant "nothing configured" here, and it keeps meaning
    // it — it is absent, not wrong, so it inherits and it is diagnosed nowhere.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({
        guard: { protectedPaths: null, defaultSensitivity: null },
        escalation: null,
      }),
    });

    expect(config.guard.protectedPaths).toContain("agents/**");
    expect(config.guard.defaultSensitivity).toBe("medium");
    expect(config.escalation.blocksBeforeHalt).toBe(3);
    expect(config.diagnostics).toEqual([]);
  });

  it("a project declaring only escalation keeps the plugin's protectedPaths", () => {
    const root = projectWith({ escalation: { blocksBeforeHalt: 7 } });

    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(config.escalation.blocksBeforeHalt).toBe(7);
    expect(config.guard.protectedPaths).toContain("agents/**");
    expect(config.guard.protectedPaths).toContain("rules/**");
  });

  it("inherits a path added to the plugin default AFTER the project was set up", () => {
    // What "the seeded file declares inheritance and lists nothing" means
    // operationally: a project that declares no `guard` key picks up a new
    // plugin-side protected path without being edited.
    const root = projectWith({ escalation: { blocksBeforeHalt: 3 } });

    const { guard } = loadConfig({
      pluginConfigPath: pluginConfig({
        guard: { protectedPaths: ["agents/**", "brand-new/**"] },
      }),
      projectRoot: root,
    });

    expect(guard.protectedPaths).toContain("brand-new/**");
  });
});

// ---------------------------------------------------------------------------
// `guard.enabled` — decision 260804-1631, answered option 1.
//
// The key sits above every check in guard.ts: above the Bash dispatch, above an
// active halt, above the git branch policy that runs even where the write guard
// stands down. A project that could set it could switch off a guard it is
// governed by, and the shipped code emitted nothing at all when it did.
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

  it("does not empty the protected list on the way past — issue 260804-1601", () => {
    // The measured defect in one line: `{"guard":{"enabled":true}}` is the most
    // ordinary edit there is, and it used to remove all nine patterns.
    const { guard } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { enabled: true } }),
    });

    for (const p of ["agents/**", "rules/**", "fusion-workbench/.guard-state/**"]) {
      expect(guard.protectedPaths).toContain(p);
    }
  });

  it("reports the key ONCE per load, not once per leaf in the object", () => {
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({
        guard: { enabled: false, protectedPaths: ["secret/**"] },
      }),
    });

    expect(
      config.diagnostics.filter((d) => d.includes("guard.enabled")),
    ).toHaveLength(1);
    // …and the rest of the object still took effect, so the exception is one
    // key rather than a rejection of the file.
    expect(config.guard.protectedPaths).toContain("secret/**");
  });

  it("says nothing when the project omits the key, which is the normal case", () => {
    expect(
      loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: projectWith({ guard: { protectedPaths: ["secret/**"] } }),
      }).diagnostics,
    ).toEqual([]);
  });

  it("still reads the key from the PLUGIN layer, where it has always lived", () => {
    // The exception is about who may write the key, not about the key. Fusion's
    // own protected `hooks/config.json` still turns its guard off.
    const config = loadConfig({
      pluginConfigPath: pluginConfig({ guard: { enabled: false } }),
      projectRoot: projectWith({ guard: { protectedPaths: ["secret/**"] } }),
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
  const rows: [string, object, string][] = [
    ["a number", { guard: { protectedPaths: 123 } }, "guard.protectedPaths"],
    [
      "an object",
      { guard: { protectedPaths: { a: "rules/**" } } },
      "guard.protectedPaths",
    ],
    ["an array of numbers", { guard: { protectedPaths: [42] } }, "guard.protectedPaths"],
    [
      "a bare string — the quiet one that never crashed",
      { guard: { protectedPaths: "rules/**" } },
      "guard.protectedPaths",
    ],
    ["a non-object guard", { guard: "on" }, "guard"],
    ["an array guard", { guard: ["rules/**"] }, "guard"],
  ];

  for (const [label, value, key] of rows) {
    it(`drops guard.protectedPaths given ${label}, and inherits the plugin's list`, () => {
      const config = withValue(value);

      expect(config.guard.protectedPaths).toContain("agents/**");
      expect(config.guard.protectedPaths).toContain("rules/**");
      expect(config.protectedPathsSource).toBe("plugin");
      expect(config.diagnostics).toHaveLength(1);
      expect(config.diagnostics[0]).toContain(key);
    });
  }

  it("drops a bad categoryPaths value without touching the rest of guard", () => {
    const config = withValue({
      guard: {
        protectedPaths: ["secret/**"],
        categoryPaths: { api: "src/api/**" },
      },
    });

    expect(config.guard.categoryPaths).toEqual({});
    expect(config.guard.protectedPaths).toContain("secret/**");
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
      pluginConfigPath: pluginConfig({ guard: { protectedPaths: "rules/**" } }),
      projectRoot: null,
    });

    expect(config.guard.protectedPaths).toEqual([]);
    expect(config.protectedPathsSource).toBe("default");
    expect(config.diagnostics).toHaveLength(1);
  });

  it("accepts unknown keys, including the template's documentation keys", () => {
    // The seeded template is mostly six underscore-prefixed notes. A validator
    // that rejected unknown keys would make the file fusion itself ships a
    // broken one, and the seeding in `7f3d789` a no-op.
    const config = withValue({
      _comment: "why this file exists",
      _override: "how the merge works",
      guard: { protectedPaths: ["secret/**"], _note: "and here too" },
    });

    expect(config.guard.protectedPaths).toContain("secret/**");
    expect(config.diagnostics).toEqual([]);
  });

  it("makes a dropped key, an omitted key and an unwritten file identical", () => {
    // The step is finished when these three are demonstrably the same thing.
    const dropped = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { protectedPaths: 123 } }),
    });
    resetConfigCache();
    const omitted = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { defaultSensitivity: "medium" } }),
    });
    resetConfigCache();
    const never = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: tmp(),
    });

    // The floor is the one difference the first two are entitled to: their file
    // exists and the third's does not.
    const withoutFloor = (c: GuardConfig) =>
      c.guard.protectedPaths.filter((p) => p !== PROJECT_CONFIG_FILENAME);

    expect(withoutFloor(dropped)).toEqual(withoutFloor(never));
    expect(withoutFloor(omitted)).toEqual(withoutFloor(never));
    expect(dropped.protectedPathsSource).toBe("plugin");
    expect(omitted.protectedPathsSource).toBe("plugin");
    expect(never.protectedPathsSource).toBe("plugin");
    // The one thing that differs, and it is the point: the dropped key was
    // named. Silence is what made this defect a defect.
    expect(dropped.diagnostics).toHaveLength(1);
    expect(omitted.diagnostics).toEqual([]);
    expect(never.diagnostics).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The provenance of `protectedPaths`.
//
// Settled here rather than in the plan's Step 4, which is where it is needed:
// under decision 260803-1314 option 2 the rules-write exemption stands down for
// a path the PROJECT ITSELF declared protected, and "the project itself
// declared it" is a fact this walk computes and used to throw away. The
// alternative was for that step to re-read a file the loader has already read,
// which is a second source of truth for the same bytes.
//
// It is a load REPORT, not a setting — see `effective()` above.
// ---------------------------------------------------------------------------

describe("the returned config carries which layer declared protectedPaths", () => {
  it("says project when the project declared one", () => {
    expect(
      loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: projectWith({ guard: { protectedPaths: ["secret/**"] } }),
      }).protectedPathsSource,
    ).toBe("project");
  });

  it("says project for a declared EMPTY list, which is a declaration", () => {
    expect(
      loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: projectWith({ guard: { protectedPaths: [] } }),
      }).protectedPathsSource,
    ).toBe("project");
  });

  it("says plugin when the project declared something else", () => {
    expect(
      loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: projectWith({ escalation: { blocksBeforeHalt: 2 } }),
      }).protectedPathsSource,
    ).toBe("plugin");
  });

  it("says default when neither layer declared one", () => {
    expect(
      loadConfig({
        pluginConfigPath: pluginConfig({ escalation: { blocksBeforeHalt: 2 } }),
        projectRoot: null,
      }).protectedPathsSource,
    ).toBe("default");
  });

  it("describes the DECLARED list, not the one the floor appended to", () => {
    // The floor adds an entry no layer declared. If provenance were read off
    // the effective list it would have to answer for that entry too, and the
    // question Step 4 asks — "did the project declare this?" — would get the
    // wrong answer for exactly one path.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ escalation: { blocksBeforeHalt: 2 } }),
    });

    expect(config.guard.protectedPaths).toContain(PROJECT_CONFIG_FILENAME);
    expect(config.protectedPathsSource).toBe("plugin");
  });
});

describe("the self-protection floor", () => {
  it("adds fusion-guard.json to the effective list once the file exists", () => {
    const root = projectWith({ guard: { protectedPaths: ["secret/**"] } });

    const { guard } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(guard.protectedPaths).toContain(PROJECT_CONFIG_FILENAME);
  });

  it("is idempotent when the file lists itself", () => {
    const root = projectWith({
      guard: { protectedPaths: ["secret/**", PROJECT_CONFIG_FILENAME] },
    });

    const { guard } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(
      guard.protectedPaths.filter((p) => p === PROJECT_CONFIG_FILENAME),
    ).toHaveLength(1);
  });

  it("applies even when the file is unparseable, because the file still exists", () => {
    // The floor's condition is the FILE, not the parse. A project that broke
    // its own configuration must not thereby unprotect it — that would be a
    // one-character route to the state the floor exists to prevent.
    const root = projectWith("{ not json");

    const { guard } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(guard.protectedPaths).toContain(PROJECT_CONFIG_FILENAME);
  });

  it("does NOT apply before the file exists, which is what lets setup create it", () => {
    const { guard } = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: tmp(),
    });

    expect(guard.protectedPaths).not.toContain(PROJECT_CONFIG_FILENAME);
  });

  it("does not mutate the list it was given", () => {
    // The chosen array may be DEFAULTS' own or a freshly parsed one; appending
    // in place would edit a value someone else is holding. Two loads of the
    // same sources must not accumulate.
    const root = projectWith({ guard: { protectedPaths: ["secret/**"] } });
    const sources = {
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    };

    const first = loadConfig(sources).guard.protectedPaths;
    resetConfigCache();
    const second = loadConfig(sources).guard.protectedPaths;

    expect(first).toEqual(["secret/**", PROJECT_CONFIG_FILENAME]);
    expect(second).toEqual(first);
  });
});

describe("diagnostics — a dropped source is named, never silent", () => {
  it("an unparseable project file yields the plugin's config plus one diagnostic", () => {
    const root = projectWith("{ this is not json ");

    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(config.diagnostics).toHaveLength(1);
    expect(config.diagnostics[0]).toContain(PROJECT_CONFIG_FILENAME);
    // Fell back rather than failing open to an empty list.
    expect(config.guard.protectedPaths).toContain("agents/**");
    expect(config.guard.protectedPaths).toContain("rules/**");
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
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: root,
    });

    expect(config.diagnostics).toHaveLength(1);
    expect(config.guard.protectedPaths).toContain("agents/**");
  });

  it("says nothing about an ABSENT project file — that is not a problem", () => {
    expect(
      loadConfig({
        pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
        projectRoot: tmp(),
      }).diagnostics,
    ).toEqual([]);
  });

  it("says nothing about an absent PLUGIN file either, as it never has", () => {
    // A missing plugin config falls back to DEFAULTS silently and always has.
    // Diagnosing it here would emit an advisory on every tool call of a broken
    // install, which is a change this step did not ask for.
    const config = loadConfig({
      pluginConfigPath: resolve(tmp(), "config.json"),
      projectRoot: null,
    });

    expect(config.diagnostics).toEqual([]);
    expect(config.guard.protectedPaths).toEqual([]);
  });

  it("reports a plugin file that EXISTS and does not parse", () => {
    const config = loadConfig({
      pluginConfigPath: pluginConfig("{{{"),
      projectRoot: null,
    });

    expect(config.diagnostics).toHaveLength(1);
    expect(config.guard.protectedPaths).toEqual([]);
  });

  it("reports both layers when both are broken", () => {
    const config = loadConfig({
      pluginConfigPath: pluginConfig("{{{"),
      projectRoot: projectWith("]]]"),
    });

    expect(config.diagnostics).toHaveLength(2);
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
      projectRoot: projectWith({ guard: { protectedPaths: ["a/**"] } }),
    });
    const b = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { protectedPaths: ["b/**"] } }),
    });

    expect(a.guard.protectedPaths).toContain("a/**");
    expect(b.guard.protectedPaths).toContain("b/**");
    expect(b.guard.protectedPaths).not.toContain("a/**");
  });

  it("a repeat load with the SAME sources hits the memo", () => {
    const sources = {
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectWith({ guard: { protectedPaths: ["a/**"] } }),
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

    expect(loadConfig(sources).guard.protectedPaths).not.toContain(
      PROJECT_CONFIG_FILENAME,
    );

    writeFileSync(
      resolve(root, PROJECT_CONFIG_FILENAME),
      JSON.stringify({ guard: { protectedPaths: ["late/**"] } }),
      "utf-8",
    );
    resetConfigCache();

    expect(loadConfig(sources).guard.protectedPaths).toEqual([
      "late/**",
      PROJECT_CONFIG_FILENAME,
    ]);
  });
});

// ---------------------------------------------------------------------------
// The seeded template — plan step 7.
//
// `templates/fusion-guard.json` is what `/fusion:setup` copies into a consuming
// project. It declares inheritance and lists NO paths: it carries only
// underscore-prefixed documentation keys, which this loader never reads because
// `RawConfig` names five top-level keys and nothing else looks at the rest.
//
// "Inherits and lists nothing" is a claim about the MERGE, not about the file's
// text, so it is measured through `loadConfig` rather than by grepping the file.
// The second half of the case is the anti-vacuity half: a plugin layer whose
// every top-level key differs from DEFAULTS, so that a template which grew ANY
// top-level key — `protectedPaths` first among them — replaces that key whole,
// falls back to DEFAULTS for it, and fails here.
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

describe("the seeded template declares inheritance and lists nothing", () => {
  it("merges to the plugin's configuration, plus the floor and nothing else", () => {
    const seeded = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: projectSeededWithTemplate(),
    });
    resetConfigCache();
    const pluginOnly = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: null,
    });

    // It parses, and its documentation keys are IGNORED rather than reported:
    // an unrecognised key produces no diagnostic, which is the whole convention
    // the file's own notes rely on.
    expect(seeded.diagnostics).toEqual([]);

    // The floor is the only difference the seeded file is allowed to make, and
    // it appends. Stated as an equality over the whole list, not a `toContain`,
    // so a template that reordered or dropped a plugin path fails here.
    expect(seeded.guard.protectedPaths).toEqual([
      ...pluginOnly.guard.protectedPaths,
      PROJECT_CONFIG_FILENAME,
    ]);

    // Everything else identical, byte for byte, with the floor entry taken back
    // out so the comparison is of the CONFIGURATION rather than of the two
    // things the loader is meant to differ on.
    const withoutFloor = {
      ...seeded,
      guard: { ...seeded.guard, protectedPaths: pluginOnly.guard.protectedPaths },
    };
    expect(JSON.stringify(effective(withoutFloor))).toBe(
      JSON.stringify(effective(pluginOnly)),
    );
  });

  it("inherits every top-level key, including paths added to the plugin later", () => {
    // Each key below is deliberately DISTINCT from DEFAULTS, so "the template
    // declared this key" and "the template stayed silent" have different
    // answers for all five. Against the shipped config alone they would not:
    // its escalation, churn and crossFile all equal DEFAULTS, so a template
    // that restated them would pass the case above unnoticed.
    const pluginConfigPath = pluginConfig({
      guard: {
        enabled: false,
        defaultSensitivity: "high",
        protectedPaths: ["added-after-the-project-was-seeded/**"],
        categoryPaths: { onto: ["ontology/**"] },
        categorySensitivity: { onto: "high" },
      },
      decisions: [{ id: "D-1", category: "onto", statement: "…" }],
      escalation: { blocksBeforeHalt: 9 },
      churn: {
        changesPerSessionWarning: 91,
        changesPerSessionCritical: 92,
        totalChangesWarning: 93,
        totalChangesCritical: 94,
      },
      crossFile: { pingBackWarning: 95, pingBackCritical: 96 },
    });

    const seeded = loadConfig({
      pluginConfigPath,
      projectRoot: projectSeededWithTemplate(),
    });
    resetConfigCache();
    const pluginOnly = loadConfig({ pluginConfigPath, projectRoot: null });

    // The acceptance criterion in one line: a path added to the plugin default
    // AFTER this project was set up protects it, with the seeded file untouched.
    expect(seeded.guard.protectedPaths).toEqual([
      "added-after-the-project-was-seeded/**",
      PROJECT_CONFIG_FILENAME,
    ]);

    const withoutFloor = {
      ...seeded,
      guard: { ...seeded.guard, protectedPaths: pluginOnly.guard.protectedPaths },
    };
    expect(JSON.stringify(effective(withoutFloor))).toBe(
      JSON.stringify(effective(pluginOnly)),
    );
  });

  it("is what this repository's own fusion-guard.json is, byte for byte", () => {
    // Per plan Q4 the repository root carries the template verbatim. Asserted
    // rather than eyeballed, because the two files drift the first time someone
    // edits the one they happen to have open.
    const template = readFileSync(TEMPLATE);
    const copy = readFileSync(REPO_COPY);

    // Text first, so a failure shows the difference; bytes second, so the case
    // says what it claims to say.
    expect(copy.toString("utf-8")).toBe(template.toString("utf-8"));
    expect(copy.equals(template)).toBe(true);
  });
});

describe("an explicit null project root is honoured, not filled in", () => {
  it("does not walk up from the working directory", () => {
    // In THIS repository the walk finds the plugin root, so a `??` default
    // would have handed every case above a project layer it never asked for —
    // and the byte-identity case would have been measuring the wrong thing.
    const config = loadConfig({
      pluginConfigPath: SHIPPED_PLUGIN_CONFIG,
      projectRoot: null,
    });

    expect(config.guard.protectedPaths).not.toContain(PROJECT_CONFIG_FILENAME);
  });
});

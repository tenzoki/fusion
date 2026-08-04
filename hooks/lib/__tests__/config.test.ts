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
 * `diagnostics` describes what happened while reading the files; it is not a
 * setting, and including it in a comparison would make "did the effective
 * configuration change?" unanswerable.
 */
function effective(config: GuardConfig): Omit<GuardConfig, "diagnostics"> {
  const { diagnostics: _ignored, ...rest } = config;
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

describe("merge — per top-level key, the project's value replaces the plugin's", () => {
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

  it("replaces the guard object WHOLE — an omitted leaf comes from DEFAULTS, not from the plugin", () => {
    const root = projectWith({
      guard: { protectedPaths: ["secret/**"], defaultSensitivity: "high" },
    });

    const { guard } = loadConfig({
      // A plugin layer whose `guard` differs from DEFAULTS in a leaf the
      // project omits, so the two candidate answers are distinguishable.
      pluginConfigPath: pluginConfig({
        guard: { enabled: false, protectedPaths: ["agents/**"] },
      }),
      projectRoot: root,
    });

    expect(guard.defaultSensitivity).toBe("high");
    // The plugin said `enabled: false`; the project's guard object replaced it
    // whole, so the answer is DEFAULTS' `true`.
    expect(guard.enabled).toBe(true);
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

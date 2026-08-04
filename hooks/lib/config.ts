/**
 * Configuration loader for the Compliance Guard.
 *
 * ## Two sources, in order
 *
 *   1. the PROJECT's `fusion-guard.json`, at the project root
 *   2. the PLUGIN's `hooks/config.json`, inside the fusion install
 *   3. the in-code `DEFAULTS`
 *
 * Before this existed there was only (2) and (3), and (2) sits inside the
 * install — `findConfigPath()` walks up from the compiled hook's own directory,
 * so it can never reach a consuming project. Every project on one install
 * therefore shared one `protectedPaths` list, which is the gap C5b closes.
 *
 * ## Merge: PER TOP-LEVEL KEY, not per leaf
 *
 * A project's `guard` object replaces the plugin's `guard` object WHOLE; only
 * then does the per-leaf `?? DEFAULTS` normalisation run. So a project that
 * writes `guard: { protectedPaths: [...] }` and omits `defaultSensitivity` gets
 * `defaultSensitivity` from DEFAULTS, not from the plugin's file.
 *
 * That is deliberate and it is the whole point. A leaf-level merge across three
 * sources cannot express "narrow the list" — a union of `protectedPaths` can
 * only ever grow — and narrowing is half of what the project-level
 * configuration was asked for. A project that declares only `escalation`
 * therefore keeps the plugin's `protectedPaths` entirely, which is the
 * inheritance property the seeded template relies on.
 *
 * ## The self-protection floor
 *
 * The effective `protectedPaths` always includes `fusion-guard.json` itself
 * WHEN THAT FILE EXISTS ON DISK. Without the floor an agent could unprotect its
 * own guard configuration in one edit.
 *
 * The existence condition is not an optimisation, it is the answer to a
 * collision between two things the spec asks for: `/fusion:setup` seeds the
 * file, and an unconditional floor would make that seeding write a write to a
 * protected path, so the file could never be created by the mechanism meant to
 * create it. Decided by the user at the plan gate — see
 * `circles/260801-1244-guard-rules-write/decisions/260802-1912_a_does-the-self-protection-floor-apply-before-the-config-file-exists.md`.
 *
 * The residual is real and is recorded rather than hidden: in a project where
 * the file has never been created, an agent may create one that narrows
 * `protectedPaths`, and the guard honours it from the next tool call onward.
 * What bounds it is that the file is git-tracked, so the creation appears in a
 * diff. What does NOT bound it is the floor — a `rm fusion-guard.json` is
 * blocked only once there is a file to remove.
 *
 * ## Diagnostics rather than silence
 *
 * A configuration file that exists but cannot be read as a JSON object is
 * dropped and RECORDED, never dropped silently: `loadConfig` returns the
 * problem in `diagnostics` and the hook entry point emits one `guard_advisory`
 * per entry. The loader itself does not emit, so it stays pure and unit-testable
 * without a workbench on disk.
 *
 * Uses native JSON.parse — zero external dependencies.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { matchesAny } from "./paths.js";
import { findWorkbenchRoot } from "./workbench-root.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** The project-level configuration file, at the project root, git-tracked. */
export const PROJECT_CONFIG_FILENAME = "fusion-guard.json";

/**
 * Find config.json by walking up from __dirname.
 * Works whether running from source (lib/) or compiled (dist/lib/).
 *
 * Called from inside `loadConfig`, NOT at module load. The project side is
 * resolved from `process.cwd()`, and freezing either source into a module-level
 * const would read the working directory at import time — which is also what
 * made this module untestable in-process for as long as it has existed.
 */
function findConfigPath(): string {
  let dir = __dirname;
  for (let i = 0; i < 5; i++) {
    const candidate = resolve(dir, "config.json");
    if (existsSync(candidate)) {
      return candidate;
    }
    dir = dirname(dir);
  }
  // Fallback: assume one level up (original behavior)
  return resolve(__dirname, "..", "config.json");
}

/** Sensitivity level for a decision category. */
export type Sensitivity = "none" | "low" | "medium" | "high";

/** A decision entry governing a category of paths. */
export interface Decision {
  id: string;
  category: string;
  statement: string;
  ruleFile?: string;
}

/** Guard configuration as loaded from config.json. */
export interface GuardConfig {
  guard: {
    enabled: boolean;
    defaultSensitivity: Sensitivity;
    protectedPaths: string[];
    categoryPaths: Record<string, string[]>;
    categorySensitivity: Record<string, Sensitivity>;
  };
  decisions: Decision[];
  escalation: {
    blocksBeforeHalt: number;
  };
  churn: {
    changesPerSessionWarning: number;
    changesPerSessionCritical: number;
    totalChangesWarning: number;
    totalChangesCritical: number;
  };
  crossFile: {
    pingBackWarning: number;
    pingBackCritical: number;
  };
  /**
   * Non-fatal problems met while resolving the two sources. Empty on a clean
   * load. NOT configuration — it is a report about the load, which is why it is
   * excluded from every comparison that asks whether the effective
   * configuration changed.
   */
  diagnostics: string[];
}

/** Raw shape from JSON (may have missing fields). */
interface RawConfig {
  guard?: Partial<GuardConfig["guard"]>;
  decisions?: Decision[];
  escalation?: Partial<GuardConfig["escalation"]>;
  churn?: Partial<GuardConfig["churn"]>;
  crossFile?: Partial<GuardConfig["crossFile"]>;
}

const DEFAULTS: GuardConfig = {
  guard: {
    enabled: true,
    defaultSensitivity: "medium",
    protectedPaths: [],
    categoryPaths: {},
    categorySensitivity: {},
  },
  decisions: [],
  escalation: {
    blocksBeforeHalt: 3,
  },
  churn: {
    changesPerSessionWarning: 5,
    changesPerSessionCritical: 10,
    totalChangesWarning: 8,
    totalChangesCritical: 15,
  },
  crossFile: {
    pingBackWarning: 3,
    pingBackCritical: 5,
  },
  diagnostics: [],
};

/**
 * Where the two configuration layers are read from.
 *
 * Both are OPTIONAL and both are defaulted inside `loadConfig`, never at module
 * load. A caller that passes `projectRoot: null` means "there is no project
 * layer" and gets exactly that — the absence is honoured rather than filled in
 * by a walk up from the working directory, which is what a `??` default would
 * have done and what would have made every unit case secretly depend on where
 * the test runner was started.
 */
export interface ConfigSources {
  /** Default: `findConfigPath()` — the plugin's own `hooks/config.json`. */
  pluginConfigPath?: string;
  /** Default: `findWorkbenchRoot(process.cwd())`. `null` means no project layer. */
  projectRoot?: string | null;
}

/**
 * One memo slot, KEYED on the resolved source pair.
 *
 * The previous cache was keyed on nothing and ignored its own argument on every
 * call after the first. With one source and one call per hook process that was
 * inert; with two sources and injectable paths it is a live defect, and a vitest
 * file is precisely the case that hits it — one process, many cases, many
 * source pairs.
 */
let cache: { key: string; value: GuardConfig } | null = null;

/** One layer of raw configuration, plus whatever went wrong reading it. */
interface Layer {
  raw: RawConfig;
  diagnostic: string | null;
}

const EMPTY_LAYER: Layer = { raw: {}, diagnostic: null };

/**
 * Read one configuration file into a layer.
 *
 * An ABSENT file is not a problem and produces no diagnostic: for the project
 * layer that is the ordinary state of a project that has not configured
 * anything, and for the plugin layer it is the silence this loader has always
 * kept. A file that EXISTS but cannot be read as a JSON object is dropped and
 * named, because the alternative is a mistyped configuration hiding behind
 * apparently-normal operation.
 */
function readLayer(path: string): Layer {
  if (!existsSync(path)) return EMPTY_LAYER;

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf-8"));
  } catch (err) {
    return {
      raw: {},
      diagnostic: `Guard configuration at ${path} is not valid JSON and was ignored; falling back to the next source. ${String(err)}`,
    };
  }

  // `null` is the one non-object this loader has always accepted silently
  // (`JSON.parse(content) ?? {}`), so it keeps meaning "nothing configured".
  if (parsed === null) return EMPTY_LAYER;

  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      raw: {},
      diagnostic: `Guard configuration at ${path} is not a JSON object and was ignored; falling back to the next source.`,
    };
  }

  return { raw: parsed as RawConfig, diagnostic: null };
}

/**
 * Load the effective guard configuration.
 *
 * Pure with respect to guard state: it reads files and returns a value. It
 * emits no events — see the module docstring for why the diagnostics come back
 * as data instead.
 */
export function loadConfig(sources?: ConfigSources): GuardConfig {
  const pluginConfigPath = sources?.pluginConfigPath ?? findConfigPath();
  // An explicit `null` is an instruction ("no project layer"), not an omission,
  // so it must survive to the line below. `sources?.projectRoot ?? findWorkbenchRoot()`
  // would silently turn it back into a walk up from the working directory.
  const injectedRoot = sources?.projectRoot;
  const projectRoot =
    injectedRoot !== undefined ? injectedRoot : findWorkbenchRoot();

  const key = JSON.stringify([pluginConfigPath, projectRoot]);
  if (cache !== null && cache.key === key) {
    return cache.value;
  }

  const projectConfigPath =
    projectRoot === null ? null : resolve(projectRoot, PROJECT_CONFIG_FILENAME);

  const plugin = readLayer(pluginConfigPath);
  const project =
    projectConfigPath === null ? EMPTY_LAYER : readLayer(projectConfigPath);

  const diagnostics = [project.diagnostic, plugin.diagnostic].filter(
    (d): d is string => d !== null,
  );

  // THE MERGE. Per top-level key, the project's value replaces the plugin's;
  // a key the project omits falls back to the plugin's, then to DEFAULTS below.
  const guard = project.raw.guard ?? plugin.raw.guard;
  const decisions = project.raw.decisions ?? plugin.raw.decisions;
  const escalation = project.raw.escalation ?? plugin.raw.escalation;
  const churn = project.raw.churn ?? plugin.raw.churn;
  const crossFile = project.raw.crossFile ?? plugin.raw.crossFile;

  // THE FLOOR. A fresh array every time: the chosen list may be DEFAULTS' own
  // or a raw parsed array, and appending in place would edit a value someone
  // else is holding.
  const declaredPaths = guard?.protectedPaths ?? DEFAULTS.guard.protectedPaths;
  const floorApplies =
    projectConfigPath !== null && existsSync(projectConfigPath);
  const protectedPaths =
    floorApplies && !declaredPaths.includes(PROJECT_CONFIG_FILENAME)
      ? [...declaredPaths, PROJECT_CONFIG_FILENAME]
      : [...declaredPaths];

  const value: GuardConfig = {
    guard: {
      enabled: guard?.enabled ?? DEFAULTS.guard.enabled,
      defaultSensitivity:
        guard?.defaultSensitivity ?? DEFAULTS.guard.defaultSensitivity,
      protectedPaths,
      categoryPaths: guard?.categoryPaths ?? DEFAULTS.guard.categoryPaths,
      categorySensitivity:
        guard?.categorySensitivity ?? DEFAULTS.guard.categorySensitivity,
    },
    decisions: decisions ?? DEFAULTS.decisions,
    escalation: {
      blocksBeforeHalt:
        escalation?.blocksBeforeHalt ?? DEFAULTS.escalation.blocksBeforeHalt,
    },
    churn: {
      changesPerSessionWarning:
        churn?.changesPerSessionWarning ??
        DEFAULTS.churn.changesPerSessionWarning,
      changesPerSessionCritical:
        churn?.changesPerSessionCritical ??
        DEFAULTS.churn.changesPerSessionCritical,
      totalChangesWarning:
        churn?.totalChangesWarning ?? DEFAULTS.churn.totalChangesWarning,
      totalChangesCritical:
        churn?.totalChangesCritical ?? DEFAULTS.churn.totalChangesCritical,
    },
    crossFile: {
      pingBackWarning:
        crossFile?.pingBackWarning ?? DEFAULTS.crossFile.pingBackWarning,
      pingBackCritical:
        crossFile?.pingBackCritical ?? DEFAULTS.crossFile.pingBackCritical,
    },
    diagnostics,
  };

  cache = { key, value };
  return value;
}

/** Reset cached config (for testing). */
export function resetConfigCache(): void {
  cache = null;
}

/** Numeric level for comparing sensitivities. Higher = more sensitive. */
export function sensitivityLevel(s: Sensitivity): number {
  switch (s) {
    case "none":
      return 0;
    case "low":
      return 1;
    case "medium":
      return 2;
    case "high":
      return 3;
    default:
      return 2;
  }
}

/** Find decisions whose category matches a file path. */
export function findRelevantDecisions(
  filePath: string,
  config: GuardConfig,
): Decision[] {
  const relevant: Decision[] = [];

  for (const decision of config.decisions) {
    const patterns = config.guard.categoryPaths[decision.category];
    if (patterns && matchesAny(filePath, patterns)) {
      relevant.push(decision);
    }
  }

  return relevant;
}

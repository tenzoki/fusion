/**
 * Configuration loader for the Compliance Guard.
 *
 * ## Three layers, in order
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
 * ## Merge: PER LEAF, across all three layers
 *
 * One rule, and it is meant to be statable from memory by an agent and by a
 * project owner alike: *a key the project layer does not supply, or supplies
 * unusably, is treated as absent, and absent means the plugin layer, then
 * `DEFAULTS`.* A key the project DOES supply is taken exactly as written.
 *
 * So `{"guard":{"defaultSensitivity":"high"}}` raises the sensitivity and keeps
 * the plugin's nine protected patterns, and `{"guard":{"protectedPaths":[]}}`
 * really does protect nothing. Only OMISSION changed meaning — from "protect
 * nothing" to "inherit". Decision `260804-1630`, answered option 1 at the plan
 * gate on 2026-08-04.
 *
 * Declaration still wins outright, and that half is not a detail: a union of
 * `protectedPaths` can only ever grow, so narrowing — half of what the
 * project-level configuration was asked for — is expressible only if a declared
 * list replaces rather than merges. What the leaf walk changes is the
 * granularity at which "declared" is read, from the whole top-level object down
 * to the leaf. Nothing about a declared value moved.
 *
 * The rule is deliberately not scoped to `protectedPaths`. `escalation`,
 * `churn`, `crossFile` and `decisions` carried the identical defect, invisible
 * only because the plugin file and `DEFAULTS` happen to agree on every leaf they
 * share and nothing keeps them agreeing (`260804-1633`). One walk closes all
 * five rather than five per-key rules.
 *
 * ## The one key a project may not set
 *
 * `guard.enabled` is read from the plugin layer and `DEFAULTS` only. It sits
 * above every check in `guard.ts` — above the Bash dispatch, above the halt,
 * above the git branch policy that fusion documents in three places as running
 * unconditionally — so a project that could write it could switch off a guard it
 * is governed by, silently and unrecoverably. Decision `260804-1631`, answered
 * option 1 at the same gate.
 *
 * A project that declares the key gets ONE DIAGNOSTIC naming it. That is not a
 * courtesy: it is the only thing standing between this rule and a silently inert
 * key, and the decision record says so in those words. Do not make it
 * conditional and do not fold it into the type validation below — a project may
 * write a perfectly well-typed `false` and must still hear that nothing
 * happened.
 *
 * ## Type validation: an unusable value costs exactly what an absence costs
 *
 * `readLayer` used to cast the parsed JSON to `RawConfig` and check nothing
 * inside it, so `{"guard":{"protectedPaths":123}}` crashed the guard into its
 * fail-open branch on every call, and the subtler `"rules/**"` spread into eight
 * single characters and protected nothing, silently (`260804-1603`).
 *
 * `validateLayer` gives every leaf this loader reads a declared type. A leaf
 * whose value does not have that type is DROPPED and NAMED, and the leaf walk
 * then finds it absent and inherits — so a dropped key, an omitted key and a key
 * the project never wrote are three spellings of one behaviour. That equivalence
 * is an obligation of `260804-1630`, not an implementation convenience: it is
 * what keeps the whole seam expressible as one sentence.
 *
 * Two things the validator deliberately does NOT do. It does not reject unknown
 * keys — the seeded template is mostly underscore-prefixed documentation keys,
 * and rejecting them would turn the shipped template into a broken file. And it
 * does not diagnose `null`, which has always meant "nothing configured" here and
 * still does; `null` is absent, not wrong.
 *
 * Both layers run through it. The plugin layer is protected, so the risk there
 * is smaller — but `260802-2334` is this Circle's standing proof that "the file
 * is protected" was not enough once already.
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

/**
 * The effective SETTINGS — everything the guard reads to decide a verdict.
 *
 * Split out from `GuardConfig` so the load report below can be added to what
 * `loadConfig` returns without becoming a setting. "Did the effective
 * configuration change?" has to stay an answerable question, and it is
 * answerable only if the settings are a nameable subset.
 */
export interface GuardSettings {
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
}

/** Which of the three layers a value came from. */
export type ConfigLayer = "project" | "plugin" | "default";

/** Guard configuration as loaded: the settings, plus a report about the load. */
export interface GuardConfig extends GuardSettings {
  /**
   * Non-fatal problems met while resolving the three layers. Empty on a clean
   * load. NOT configuration — it is a report about the load, which is why it is
   * excluded from every comparison that asks whether the effective
   * configuration changed.
   */
  diagnostics: string[];
  /**
   * Which layer supplied `guard.protectedPaths`, BEFORE the self-protection
   * floor was appended.
   *
   * Also a report rather than a setting, and it is here for one caller that does
   * not exist yet. Decision `260803-1314` option 2 would have the rules-write
   * exemption stand down for a path the PROJECT ITSELF declared protected, and
   * "the project itself declared it" is a fact the leaf walk below computes and
   * then used to throw away. The alternative was for that caller to re-read a
   * file this loader has already read, which is a second source of truth for the
   * same bytes. Settled here, in the loader, per the remediation plan's Step 2.
   *
   * `"default"` means neither file declared a list, so the effective list is
   * `DEFAULTS`' empty one plus whatever the floor added.
   */
  protectedPathsSource: ConfigLayer;
}

/** Raw shape from JSON (may have missing fields). */
interface RawConfig {
  guard?: Partial<GuardSettings["guard"]>;
  decisions?: Decision[];
  escalation?: Partial<GuardSettings["escalation"]>;
  churn?: Partial<GuardSettings["churn"]>;
  crossFile?: Partial<GuardSettings["crossFile"]>;
}

const DEFAULTS: GuardSettings = {
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
  diagnostics: string[];
}

const EMPTY_LAYER: Layer = { raw: {}, diagnostics: [] };

/**
 * Read one configuration file into a layer.
 *
 * An ABSENT file is not a problem and produces no diagnostic: for the project
 * layer that is the ordinary state of a project that has not configured
 * anything, and for the plugin layer it is the silence this loader has always
 * kept. A file that EXISTS but cannot be read as a JSON object is dropped and
 * named, because the alternative is a mistyped configuration hiding behind
 * apparently-normal operation. The same holds one level down, per key, in
 * `validateLayer` — which is where `kind` goes.
 */
function readLayer(path: string, kind: ConfigLayer): Layer {
  if (!existsSync(path)) return EMPTY_LAYER;

  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, "utf-8"));
  } catch (err) {
    return {
      raw: {},
      diagnostics: [
        `Guard configuration at ${path} is not valid JSON and was ignored; falling back to the next source. ${String(err)}`,
      ],
    };
  }

  // `null` is the one non-object this loader has always accepted silently
  // (`JSON.parse(content) ?? {}`), so it keeps meaning "nothing configured".
  if (parsed === null) return EMPTY_LAYER;

  if (typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      raw: {},
      diagnostics: [
        `Guard configuration at ${path} is not a JSON object and was ignored; falling back to the next source.`,
      ],
    };
  }

  return validateLayer(parsed as Record<string, unknown>, path, kind);
}

/* ------------------------------------------------------------------ *
 * Type validation
 * ------------------------------------------------------------------ */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoolean(value: unknown): boolean {
  return typeof value === "boolean";
}

function isStringArray(value: unknown): boolean {
  return Array.isArray(value) && value.every((e) => typeof e === "string");
}

const SENSITIVITIES: readonly string[] = ["none", "low", "medium", "high"];

function isSensitivity(value: unknown): boolean {
  return typeof value === "string" && SENSITIVITIES.includes(value);
}

function isRecordOf(check: (v: unknown) => boolean): (v: unknown) => boolean {
  return (value) => isPlainObject(value) && Object.values(value).every(check);
}

/**
 * A halt threshold of `0` halts on the FIRST denied call, before the agent has
 * had the second and third chances the three-block design exists to give it
 * (`260804-1606`). It is almost certainly a project meaning "no threshold" and
 * getting the strictest one there is. There is no upper bound, deliberately: a
 * large value is a defensible project choice, and inventing a ceiling here would
 * be a policy nobody asked for.
 */
function isPositiveInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
}

function isThreshold(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isDecisionArray(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.every(
      (d) =>
        isPlainObject(d) &&
        typeof d.id === "string" &&
        typeof d.category === "string" &&
        typeof d.statement === "string" &&
        (d.ruleFile === undefined || typeof d.ruleFile === "string"),
    )
  );
}

interface LeafRule {
  check: (value: unknown) => boolean;
  /** Completes the sentence "… must be ___". */
  expected: string;
}

/**
 * Every leaf this loader reads, with the type it must have.
 *
 * The table IS the rule, which is why it is a table: a leaf that is not named
 * here is not validated, and a leaf that is named here behaves identically to an
 * omission when it fails. Adding a leaf to `GuardSettings` without adding it
 * here leaves that leaf unchecked, which is the state every leaf was in before
 * this table existed.
 */
const CONTAINER_LEAF_RULES: Record<string, Record<string, LeafRule>> = {
  guard: {
    enabled: { check: isBoolean, expected: "a boolean" },
    defaultSensitivity: {
      check: isSensitivity,
      expected: 'one of "none", "low", "medium", "high"',
    },
    protectedPaths: {
      check: isStringArray,
      expected: "an array of glob strings",
    },
    categoryPaths: {
      check: isRecordOf(isStringArray),
      expected: "an object mapping each category to an array of glob strings",
    },
    categorySensitivity: {
      check: isRecordOf(isSensitivity),
      expected: "an object mapping each category to a sensitivity",
    },
  },
  escalation: {
    blocksBeforeHalt: {
      check: isPositiveInteger,
      expected: "a whole number of 1 or more",
    },
  },
  churn: {
    changesPerSessionWarning: { check: isThreshold, expected: "a number" },
    changesPerSessionCritical: { check: isThreshold, expected: "a number" },
    totalChangesWarning: { check: isThreshold, expected: "a number" },
    totalChangesCritical: { check: isThreshold, expected: "a number" },
  },
  crossFile: {
    pingBackWarning: { check: isThreshold, expected: "a number" },
    pingBackCritical: { check: isThreshold, expected: "a number" },
  },
};

/** Top-level keys whose value is itself a leaf rather than a container. */
const TOP_LEVEL_LEAF_RULES: Record<string, LeafRule> = {
  decisions: {
    check: isDecisionArray,
    expected: "an array of {id, category, statement} objects",
  },
};

/** A type name for a diagnostic, short enough to read in a dashboard row. */
function describeValue(value: unknown): string {
  if (Array.isArray(value)) return "an array";
  if (typeof value === "object") return "an object";
  if (typeof value === "string") return "a string";
  return typeof value;
}

/**
 * Drop every key that cannot be used, and NAME each one.
 *
 * A dropped key behaves exactly like an omitted one — the leaf walk in
 * `loadConfig` then finds it absent and inherits from the next layer. Decision
 * `260804-1630` requires that equivalence rather than merely permitting it: two
 * ways of arriving at "absent" that behave differently would be two rules where
 * the answer is one.
 *
 * Applied to BOTH layers. `kind` distinguishes them for exactly one key:
 * `guard.enabled`, which the project layer may not set at all (decision
 * `260804-1631`). That key is dropped from the project layer whatever its type,
 * and the diagnostic says WHY rather than complaining about a type — a project
 * that writes a perfectly well-formed `false` needs to hear that the key does
 * not apply to it, not that it should have written a boolean.
 */
function validateLayer(
  parsed: Record<string, unknown>,
  source: string,
  kind: ConfigLayer,
): Layer {
  const raw: Record<string, unknown> = {};
  const diagnostics: string[] = [];

  const drop = (key: string, rule: LeafRule, value: unknown): void => {
    diagnostics.push(
      `Guard configuration at ${source}: "${key}" must be ${rule.expected}, got ${describeValue(value)}. The key was ignored and inherits as if it were absent.`,
    );
  };

  for (const [key, value] of Object.entries(parsed)) {
    // `null` means "nothing configured" and is not a problem — see `readLayer`.
    // Dropping it here is what makes the leaf walk see it as absent.
    if (value === null || value === undefined) continue;

    const topLevelRule = TOP_LEVEL_LEAF_RULES[key];
    if (topLevelRule !== undefined) {
      if (topLevelRule.check(value)) raw[key] = value;
      else drop(key, topLevelRule, value);
      continue;
    }

    const leafRules = CONTAINER_LEAF_RULES[key];
    if (leafRules === undefined) {
      // An unknown key, carried through untouched and undiagnosed. The seeded
      // template is mostly six underscore-prefixed documentation keys; rejecting
      // them would make the file fusion itself ships a broken one.
      raw[key] = value;
      continue;
    }

    if (!isPlainObject(value)) {
      drop(key, { check: isPlainObject, expected: "a JSON object" }, value);
      continue;
    }

    const kept: Record<string, unknown> = {};
    for (const [leafKey, leafValue] of Object.entries(value)) {
      if (leafValue === null || leafValue === undefined) continue;

      if (kind === "project" && key === "guard" && leafKey === "enabled") {
        diagnostics.push(
          `Guard configuration at ${source}: "guard.enabled" cannot be set by a project — a project does not switch off the guard that governs it, and the git branch policy runs even where the write guard stands down. The key was ignored.`,
        );
        continue;
      }

      const rule = leafRules[leafKey];
      if (rule === undefined) {
        kept[leafKey] = leafValue;
      } else if (rule.check(leafValue)) {
        kept[leafKey] = leafValue;
      } else {
        drop(`${key}.${leafKey}`, rule, leafValue);
      }
    }
    raw[key] = kept;
  }

  return { raw: raw as RawConfig, diagnostics };
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

  const plugin = readLayer(pluginConfigPath, "plugin");
  const project =
    projectConfigPath === null
      ? EMPTY_LAYER
      : readLayer(projectConfigPath, "project");

  // Project first: it is the layer a reader can edit, so it is the layer they
  // need named first when both are wrong.
  const diagnostics = [...project.diagnostics, ...plugin.diagnostics];

  // THE MERGE, per leaf across all three layers: project, then plugin, then
  // DEFAULTS. `??` and not `||`, because a leaf may legitimately be `false`,
  // `0` or `[]` — and `[]` in particular is the deliberate narrowing that a
  // project declares on purpose and that must survive as itself.
  //
  // `guard.enabled` is the one leaf the project layer is not consulted for, and
  // it cannot be: `validateLayer` removed it from that layer and said so. It is
  // resolved below from the plugin layer alone, so this helper is never asked
  // about it.
  const pickGuard = <K extends keyof GuardSettings["guard"]>(
    key: K,
  ): GuardSettings["guard"][K] =>
    project.raw.guard?.[key] ?? plugin.raw.guard?.[key] ?? DEFAULTS.guard[key];

  const pickEscalation = <K extends keyof GuardSettings["escalation"]>(
    key: K,
  ): GuardSettings["escalation"][K] =>
    project.raw.escalation?.[key] ??
    plugin.raw.escalation?.[key] ??
    DEFAULTS.escalation[key];

  const pickChurn = <K extends keyof GuardSettings["churn"]>(
    key: K,
  ): GuardSettings["churn"][K] =>
    project.raw.churn?.[key] ?? plugin.raw.churn?.[key] ?? DEFAULTS.churn[key];

  const pickCrossFile = <K extends keyof GuardSettings["crossFile"]>(
    key: K,
  ): GuardSettings["crossFile"][K] =>
    project.raw.crossFile?.[key] ??
    plugin.raw.crossFile?.[key] ??
    DEFAULTS.crossFile[key];

  // Which layer the protected list came from, recorded before the floor makes
  // the answer unreadable off the list itself. See `GuardConfig`.
  const protectedPathsSource: ConfigLayer =
    project.raw.guard?.protectedPaths !== undefined
      ? "project"
      : plugin.raw.guard?.protectedPaths !== undefined
        ? "plugin"
        : "default";

  // THE FLOOR. A fresh array every time: the chosen list may be DEFAULTS' own
  // or a raw parsed array, and appending in place would edit a value someone
  // else is holding.
  const declaredPaths = pickGuard("protectedPaths");
  const floorApplies =
    projectConfigPath !== null && existsSync(projectConfigPath);
  const protectedPaths =
    floorApplies && !declaredPaths.includes(PROJECT_CONFIG_FILENAME)
      ? [...declaredPaths, PROJECT_CONFIG_FILENAME]
      : [...declaredPaths];

  const value: GuardConfig = {
    guard: {
      // The project layer is not consulted. Decision 260804-1631.
      enabled: plugin.raw.guard?.enabled ?? DEFAULTS.guard.enabled,
      defaultSensitivity: pickGuard("defaultSensitivity"),
      protectedPaths,
      categoryPaths: pickGuard("categoryPaths"),
      categorySensitivity: pickGuard("categorySensitivity"),
    },
    decisions: project.raw.decisions ?? plugin.raw.decisions ?? DEFAULTS.decisions,
    escalation: {
      blocksBeforeHalt: pickEscalation("blocksBeforeHalt"),
    },
    churn: {
      changesPerSessionWarning: pickChurn("changesPerSessionWarning"),
      changesPerSessionCritical: pickChurn("changesPerSessionCritical"),
      totalChangesWarning: pickChurn("totalChangesWarning"),
      totalChangesCritical: pickChurn("totalChangesCritical"),
    },
    crossFile: {
      pingBackWarning: pickCrossFile("pingBackWarning"),
      pingBackCritical: pickCrossFile("pingBackCritical"),
    },
    diagnostics,
    protectedPathsSource,
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

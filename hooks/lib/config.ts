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
 * therefore shared one configuration, which is the gap C5b closes.
 *
 * ## Merge: PER LEAF, across all three layers
 *
 * One rule, and it is meant to be statable from memory by an agent and by a
 * project owner alike: *a key the project layer does not supply, or supplies
 * unusably, is treated as absent, and absent means the plugin layer, then
 * `DEFAULTS`.* A key the project DOES supply is taken exactly as written.
 *
 * So `{"guard":{"defaultSensitivity":"high"}}` raises the sensitivity and keeps
 * the plugin's `categoryPaths`, and `{"guard":{"categoryPaths":{}}}` really does
 * govern nothing. Only OMISSION changed meaning — from "the built-in default" to
 * "inherit". Decision `260804-1630`, answered option 1 at the plan gate on
 * 2026-08-04.
 *
 * Declaration still wins outright, and that half is not a detail: a union of a
 * declared container can only ever grow, so narrowing — half of what the
 * project-level configuration was asked for — is expressible only if a declared
 * value replaces rather than merges. What the leaf walk changes is the
 * granularity at which "declared" is read, from the whole top-level object down
 * to the leaf. Nothing about a declared value moved.
 *
 * The rule was never scoped to one key. `escalation` and `decisions` carry the
 * identical defect, invisible only because the plugin file and `DEFAULTS` happen
 * to agree on every leaf they share and nothing keeps them agreeing
 * (`260804-1633`). One walk closes them all rather than one per-key rule each.
 * (Three of the leaves it was written for have since gone: `crossFile` with the
 * ping-back tracker, decision `260809-2004`; `guard.protectedPaths` with the
 * mechanism it configured — see `## The leaf that was retired` below, which is
 * where the argument above used to draw its worked example from; and `churn`
 * with the heatmap on 2026-08-15, removed outright rather than retired, because
 * no project ever set it.)
 *
 * ## The one setting here that is not the guard's
 *
 * `orchestrator.maxTurns` is the Turn budget of the orchestrator's Phase-2 loop.
 * It is not a guard setting and no hook reads it — `bin/fusion-turn-budget` does,
 * once per Setup, and the orchestrator carries the answer in `agentstate.yaml`.
 * It lives here because `fusion-guard.json` is the per-project configuration
 * surface a project already has: git-tracked, merged per leaf, wrong values
 * dropped and named. A second configuration file for one integer would be a
 * second mechanism answering the same question (issue `260811-1712`).
 *
 * The budget had been prose in `agents/orchestrator.md`, written out as `5` in
 * seven places and four spellings, with one of them already calling it a
 * "default" — a word that was false, because no source could override it.
 *
 * THE DEFAULT IS DEFINED ONCE, in `DEFAULTS` below, and deliberately NOT
 * restated in the plugin's `hooks/config.json`. Every other leaf is spelled in
 * both, and the paragraph above about `escalation` is the standing complaint
 * that nothing keeps the two copies agreeing. One copy cannot
 * disagree with itself. A project that wants a different budget declares
 * `{"orchestrator":{"maxTurns":12}}` and the leaf walk does the rest.
 *
 * ## The one key a project may not set
 *
 * `guard.enabled` is read from the plugin layer and `DEFAULTS` only. It sits
 * above every check in `guard.ts` — above the Bash dispatch, above the halt,
 * above the decision-governed check — so a project that could write it could
 * switch off a guard it is governed by, silently and unrecoverably. Decision
 * `260804-1631`, answered option 1 at the same gate.
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
 * single characters and protected nothing, silently (`260804-1603`). That leaf
 * is retired now; the defect it measured is why this table exists, so the
 * example is kept as the history it is.
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
 * ## The leaf that was retired, and the floor that went with it
 *
 * `guard.protectedPaths` was the largest leaf this loader read until
 * 2026-08-12, when the protected-path mechanism it configured was removed.
 * Nothing reads a protected list any more, so the leaf is not merged, not
 * defaulted and not validated. It is RETIRED, which is a third state beside
 * "known" and "unknown": a project that still declares it has the value dropped
 * and gets ONE DIAGNOSTIC naming the key, on every guarded tool call, until the
 * line comes out of the file. See `RETIRED_CONTAINER_LEAVES` below.
 *
 * That loudness is deliberate and it is the loudness `guard.enabled` already
 * has. Every other unrecognised key is carried through in silence, and rightly
 * — the seeded template is mostly underscore-prefixed documentation keys. But a
 * project that declared a protected list declared it on purpose, usually after
 * something got written that should not have been, and silence would leave it
 * believing a setting is in force behind a mechanism that no longer exists.
 * This diagnostic is the only place in the whole removal where a consuming
 * project learns anything, so it says what happened and what to do about it.
 *
 * THE SELF-PROTECTION FLOOR WENT WITH IT, and the loss is real rather than
 * bookkeeping. The loader used to append `fusion-guard.json` to the effective
 * list in two spellings — the bare project-relative name and the absolute path
 * it read the layer from (`260804-1604`) — once the file existed, the existence
 * condition being what let `/fusion:setup` seed a file an unconditional floor
 * would have forbidden (`260802-1912`). There is no effective list to append
 * to now, so nothing in the guard defends this file from an agent. What bounds
 * that is what always bounded the pre-existence gap the floor never covered:
 * the file is git-tracked, so a change to it appears in a diff.
 *
 * ## Diagnostics rather than silence
 *
 * A configuration file that exists but cannot be read as a JSON object is
 * dropped and RECORDED, never dropped silently: `loadConfig` returns the
 * problem in `diagnostics` and the hook entry point emits one `guard_advisory`
 * per entry. The loader itself does not emit, so it stays pure and unit-testable
 * without a workbench on disk.
 *
 * A MISSING file is recorded for the plugin layer and not for the project
 * layer, and that asymmetry is the rule rather than an exception to it. See
 * `readLayer`, which is where the two layers part.
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
    categoryPaths: Record<string, string[]>;
    categorySensitivity: Record<string, Sensitivity>;
  };
  decisions: Decision[];
  escalation: {
    blocksBeforeHalt: number;
  };
  /**
   * The orchestrator's Phase-2 Turn budget. Read by `bin/fusion-turn-budget`
   * at Setup, not by any hook — see the module docstring for why a non-guard
   * setting lives in the guard's configuration file.
   */
  orchestrator: {
    maxTurns: number;
  };
}

/**
 * Which of the three layers a value came from.
 *
 * Read by `readLayer` and `validateLayer`, which behave differently for the
 * project and the plugin file. It stopped being part of `GuardConfig` when
 * `protectedPathsSource` was removed with the protected-path mechanism: no
 * setting reports its provenance any more.
 */
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
}

/** Raw shape from JSON (may have missing fields). */
interface RawConfig {
  guard?: Partial<GuardSettings["guard"]>;
  decisions?: Decision[];
  escalation?: Partial<GuardSettings["escalation"]>;
  orchestrator?: Partial<GuardSettings["orchestrator"]>;
}

const DEFAULTS: GuardSettings = {
  guard: {
    enabled: true,
    defaultSensitivity: "medium",
    categoryPaths: {},
    categorySensitivity: {},
  },
  decisions: [],
  escalation: {
    blocksBeforeHalt: 3,
  },
  // THE TURN BUDGET'S ONE DEFINITION. Not restated in the plugin's
  // `hooks/config.json`, and not in `agents/orchestrator.md` — the prompt reads
  // it through `bin/fusion-turn-budget` at Setup and names the resolved value
  // everywhere it used to write a number. See the module docstring.
  orchestrator: {
    maxTurns: 5,
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
 * An ABSENT file means two different things, one per layer, and the loader says
 * so rather than treating both as ordinary (`260809-1101`).
 *
 * For the PROJECT layer, absence is the ordinary state of a project that has
 * configured nothing. It stays silent, and must: nagging every project that has
 * never written `fusion-guard.json` would put an advisory on every guarded call
 * of a correctly-behaving project.
 *
 * For the PLUGIN layer, absence is a broken install. The diagnostic was won by
 * `260809-1101`, whose subject was the protected list: the plugin file carried
 * the only non-empty one, so a missing file dropped it to nothing while the
 * guard went on reporting normal operation. That list is gone and the
 * diagnostic stays, with a smaller and stated claim — every leaf the project
 * has not declared falls through to `DEFAULTS`, which the shipped plugin file
 * agrees with leaf for leaf, so the measurable cost of the absence today is
 * nothing and the reason to say so is that a file fusion ships is missing. ONE
 * DIAGNOSTIC naming the path that was searched, the same loudness the module
 * already chose for a plugin file that exists but does not parse.
 *
 * A file that EXISTS but cannot be read as a JSON object is dropped and named,
 * because the alternative is a mistyped configuration hiding behind
 * apparently-normal operation. The same holds one level down, per key, in
 * `validateLayer` — the second of the two places `kind` goes.
 */
function readLayer(path: string, kind: ConfigLayer): Layer {
  if (!existsSync(path)) {
    if (kind !== "plugin") return EMPTY_LAYER;
    return {
      raw: {},
      diagnostics: [
        `Guard configuration: the plugin's own config.json was not found at ${path}. Every guard setting this project has not declared in ${PROJECT_CONFIG_FILENAME} falls through to fusion's built-in defaults. The fusion install is incomplete; reinstall it.`,
      ],
    };
  }

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
 *
 * `orchestrator.maxTurns` takes the same shape and for the same reason, which
 * is why it reuses this check rather than getting one of its own. A budget of
 * `0` is a session that can never run a Turn — a project writing it almost
 * certainly means "no limit" and would get the tightest limit there is; a
 * negative one is not a count; `2.5` is not a number of Turns. All three are
 * out of range, all three are dropped, named in an advisory, and inherit the
 * default, because that is the one behaviour an absent, an unusable and an
 * unwritten key are all required to share. And there is no ceiling: a project
 * that wants 60 Turns has said so in a git-tracked file.
 */
function isPositiveInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= 1;
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
  orchestrator: {
    maxTurns: {
      check: isPositiveInteger,
      expected: "a whole number of 1 or more",
    },
  },
};

/**
 * Leaves this loader ONCE READ and no longer does, with the reason a project
 * that still declares one needs to hear.
 *
 * The counterpart of `CONTAINER_LEAF_RULES` above, and the reason it is a table
 * rather than an `if`: a retired leaf is not a validation failure and not an
 * unknown key. It is a key that meant something, still looks like a setting to
 * whoever wrote it, and now does nothing — and the one thing that must not
 * happen is for it to go through silently as an unknown key, which is what the
 * validator does with every key it does not recognise.
 *
 * The value completes the sentence "… no longer exists — ___". Keep it saying
 * what happened and what to do; a project reading it has just upgraded and this
 * is the only notice it gets.
 *
 * An entry here is a promise to keep making noise until the line comes out of
 * the file. Retire a leaf by moving it from the table above into this one; drop
 * it from this table only when a project could no longer plausibly still be
 * carrying it.
 */
const RETIRED_CONTAINER_LEAVES: Record<string, Record<string, string>> = {
  guard: {
    protectedPaths:
      "fusion removed the protected-path mechanism it configured, so declaring the list protects nothing and nothing reads it.",
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
          `Guard configuration at ${source}: "guard.enabled" cannot be set by a project — a project does not switch off the guard that governs it. The key was ignored.`,
        );
        continue;
      }

      // A RETIRED leaf, in EITHER layer. Unscoped on purpose, unlike the
      // project-only refusal above: `guard.enabled` is a key one layer may
      // legitimately set, whereas a retired leaf is retired for everybody, and
      // a plugin `config.json` still carrying one is a stale install saying so
      // rather than a project to nag. The value is dropped, so nothing
      // downstream can read it back.
      const retired = RETIRED_CONTAINER_LEAVES[key]?.[leafKey];
      if (retired !== undefined) {
        diagnostics.push(
          `Guard configuration at ${source}: "${key}.${leafKey}" no longer exists — ${retired} The key was ignored; the rest of this file is unaffected. Delete the line to stop this advisory.`,
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

  const pickOrchestrator = <K extends keyof GuardSettings["orchestrator"]>(
    key: K,
  ): GuardSettings["orchestrator"][K] =>
    project.raw.orchestrator?.[key] ??
    plugin.raw.orchestrator?.[key] ??
    DEFAULTS.orchestrator[key];

  const value: GuardConfig = {
    guard: {
      // The project layer is not consulted. Decision 260804-1631.
      enabled: plugin.raw.guard?.enabled ?? DEFAULTS.guard.enabled,
      defaultSensitivity: pickGuard("defaultSensitivity"),
      categoryPaths: pickGuard("categoryPaths"),
      categorySensitivity: pickGuard("categorySensitivity"),
    },
    decisions: project.raw.decisions ?? plugin.raw.decisions ?? DEFAULTS.decisions,
    escalation: {
      blocksBeforeHalt: pickEscalation("blocksBeforeHalt"),
    },
    orchestrator: {
      maxTurns: pickOrchestrator("maxTurns"),
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

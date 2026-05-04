/**
 * Configuration loader for the Compliance Guard.
 *
 * Reads config.json once per process invocation (each hook call
 * is a fresh process, so no cross-process caching needed).
 *
 * Uses native JSON.parse — zero external dependencies.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { matchesAny } from "./paths.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Find config.json by walking up from __dirname.
 * Works whether running from source (lib/) or compiled (dist/lib/).
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

const CONFIG_PATH = findConfigPath();

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
};

let cachedConfig: GuardConfig | null = null;

/** Load guard configuration from config.json. */
export function loadConfig(configPath?: string): GuardConfig {
  if (cachedConfig !== null) {
    return cachedConfig;
  }

  const path = configPath ?? CONFIG_PATH;

  let raw: RawConfig;
  try {
    const content = readFileSync(path, "utf-8");
    raw = (JSON.parse(content) as RawConfig) ?? {};
  } catch {
    // Config missing or unparseable — use defaults
    cachedConfig = DEFAULTS;
    return cachedConfig;
  }

  cachedConfig = {
    guard: {
      enabled: raw.guard?.enabled ?? DEFAULTS.guard.enabled,
      defaultSensitivity:
        raw.guard?.defaultSensitivity ?? DEFAULTS.guard.defaultSensitivity,
      protectedPaths:
        raw.guard?.protectedPaths ?? DEFAULTS.guard.protectedPaths,
      categoryPaths: raw.guard?.categoryPaths ?? DEFAULTS.guard.categoryPaths,
      categorySensitivity:
        raw.guard?.categorySensitivity ?? DEFAULTS.guard.categorySensitivity,
    },
    decisions: raw.decisions ?? DEFAULTS.decisions,
    escalation: {
      blocksBeforeHalt:
        raw.escalation?.blocksBeforeHalt ??
        DEFAULTS.escalation.blocksBeforeHalt,
    },
    churn: {
      changesPerSessionWarning:
        raw.churn?.changesPerSessionWarning ??
        DEFAULTS.churn.changesPerSessionWarning,
      changesPerSessionCritical:
        raw.churn?.changesPerSessionCritical ??
        DEFAULTS.churn.changesPerSessionCritical,
      totalChangesWarning:
        raw.churn?.totalChangesWarning ?? DEFAULTS.churn.totalChangesWarning,
      totalChangesCritical:
        raw.churn?.totalChangesCritical ?? DEFAULTS.churn.totalChangesCritical,
    },
    crossFile: {
      pingBackWarning:
        raw.crossFile?.pingBackWarning ?? DEFAULTS.crossFile.pingBackWarning,
      pingBackCritical:
        raw.crossFile?.pingBackCritical ?? DEFAULTS.crossFile.pingBackCritical,
    },
  };

  return cachedConfig;
}

/** Reset cached config (for testing). */
export function resetConfigCache(): void {
  cachedConfig = null;
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

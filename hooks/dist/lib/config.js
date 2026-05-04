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
function findConfigPath() {
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
const DEFAULTS = {
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
let cachedConfig = null;
/** Load guard configuration from config.json. */
export function loadConfig(configPath) {
    if (cachedConfig !== null) {
        return cachedConfig;
    }
    const path = configPath ?? CONFIG_PATH;
    let raw;
    try {
        const content = readFileSync(path, "utf-8");
        raw = JSON.parse(content) ?? {};
    }
    catch {
        // Config missing or unparseable — use defaults
        cachedConfig = DEFAULTS;
        return cachedConfig;
    }
    cachedConfig = {
        guard: {
            enabled: raw.guard?.enabled ?? DEFAULTS.guard.enabled,
            defaultSensitivity: raw.guard?.defaultSensitivity ?? DEFAULTS.guard.defaultSensitivity,
            protectedPaths: raw.guard?.protectedPaths ?? DEFAULTS.guard.protectedPaths,
            categoryPaths: raw.guard?.categoryPaths ?? DEFAULTS.guard.categoryPaths,
            categorySensitivity: raw.guard?.categorySensitivity ?? DEFAULTS.guard.categorySensitivity,
        },
        decisions: raw.decisions ?? DEFAULTS.decisions,
        escalation: {
            blocksBeforeHalt: raw.escalation?.blocksBeforeHalt ??
                DEFAULTS.escalation.blocksBeforeHalt,
        },
        churn: {
            changesPerSessionWarning: raw.churn?.changesPerSessionWarning ??
                DEFAULTS.churn.changesPerSessionWarning,
            changesPerSessionCritical: raw.churn?.changesPerSessionCritical ??
                DEFAULTS.churn.changesPerSessionCritical,
            totalChangesWarning: raw.churn?.totalChangesWarning ?? DEFAULTS.churn.totalChangesWarning,
            totalChangesCritical: raw.churn?.totalChangesCritical ?? DEFAULTS.churn.totalChangesCritical,
        },
        crossFile: {
            pingBackWarning: raw.crossFile?.pingBackWarning ?? DEFAULTS.crossFile.pingBackWarning,
            pingBackCritical: raw.crossFile?.pingBackCritical ?? DEFAULTS.crossFile.pingBackCritical,
        },
    };
    return cachedConfig;
}
/** Reset cached config (for testing). */
export function resetConfigCache() {
    cachedConfig = null;
}
/** Numeric level for comparing sensitivities. Higher = more sensitive. */
export function sensitivityLevel(s) {
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
export function findRelevantDecisions(filePath, config) {
    const relevant = [];
    for (const decision of config.decisions) {
        const patterns = config.guard.categoryPaths[decision.category];
        if (patterns && matchesAny(filePath, patterns)) {
            relevant.push(decision);
        }
    }
    return relevant;
}

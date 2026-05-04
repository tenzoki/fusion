/**
 * Configuration loader for the Compliance Guard.
 *
 * Reads config.json once per process invocation (each hook call
 * is a fresh process, so no cross-process caching needed).
 *
 * Uses native JSON.parse — zero external dependencies.
 */
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
/** Load guard configuration from config.json. */
export declare function loadConfig(configPath?: string): GuardConfig;
/** Reset cached config (for testing). */
export declare function resetConfigCache(): void;
/** Numeric level for comparing sensitivities. Higher = more sensitive. */
export declare function sensitivityLevel(s: Sensitivity): number;
/** Find decisions whose category matches a file path. */
export declare function findRelevantDecisions(filePath: string, config: GuardConfig): Decision[];

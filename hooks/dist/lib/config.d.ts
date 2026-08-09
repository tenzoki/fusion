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
 * TWO SPELLINGS, both of the one file: the bare project-relative name and the
 * absolute path this loader read the layer from. Every other pattern is matched
 * against a path relativised to the guard's WORKING directory, and the project
 * root is wherever `findWorkbenchRoot` walked up to — so the bare name alone
 * defended `<cwd>/fusion-guard.json`, a file that need not exist, while the file
 * actually governing the guard sat out of reach (`260804-1604`). The floor is
 * the only pattern entitled to an absolute form, because it is the only one
 * whose subject has a location the loader already knows; `rules/**` from a
 * subdirectory really does name a different directory. See `THE FLOOR` below
 * for why the bare name stays alongside it.
 *
 * The existence condition is not an optimisation, it is the answer to a
 * collision between two things the spec asks for: `/fusion:setup` seeds the
 * file, and an unconditional floor would make that seeding write a write to a
 * protected path, so the file could never be created by the mechanism meant to
 * create it. Decided by the user at the plan gate on 2026-08-02: the
 * self-protection floor applies only once the configuration file exists.
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
 * A MISSING file is recorded for the plugin layer and not for the project
 * layer, and that asymmetry is the rule rather than an exception to it. See
 * `readLayer`, which is where the two layers part.
 *
 * Uses native JSON.parse — zero external dependencies.
 */
/** The project-level configuration file, at the project root, git-tracked. */
export declare const PROJECT_CONFIG_FILENAME = "fusion-guard.json";
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
    /**
     * The entries the SELF-PROTECTION FLOOR appended to `guard.protectedPaths` —
     * empty when the floor did not apply, or when the declared list already named
     * them.
     *
     * A report, like the two fields above. It exists because the floor stopped
     * being one bare pattern when `260804-1604` was closed: it is now the bare
     * name and the absolute path, and a caller that wants the entries the PROJECT
     * declared has to be able to take the floor's back out again. That caller is
     * `projectDeclaredProtectedPaths` below, and through it the rules-write
     * exemption. Deriving the floor's entries a second time at the caller would be
     * the same file described by two functions free to disagree.
     */
    floorPaths: string[];
}
/**
 * The protected entries this project DECLARED for itself — empty for a project
 * that declared none.
 *
 * "Declared, not inherited" is the whole of it, and it is a binding obligation
 * of decision `260803-1314`, not a nicety. That decision has a project's own
 * protected entries outrank `FUSION_ALLOW_RULES_WRITE`; after `260804-1630` an
 * OMITTED `protectedPaths` inherits the plugin's list, and the plugin's list
 * contains `rules/**`. A subtraction that read the effective list would
 * therefore withdraw the exemption from every project on earth, silently, and
 * would look correct while doing it. `protectedPathsSource === "project"` is the
 * exact fact "this project supplied these entries", which is why the loader
 * carries it rather than the exemption inferring it.
 *
 * The floor's entries are taken back out for the same reason: the loader
 * appended them, no project did.
 */
export declare function projectDeclaredProtectedPaths(config: GuardConfig): string[];
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
 * Load the effective guard configuration.
 *
 * Pure with respect to guard state: it reads files and returns a value. It
 * emits no events — see the module docstring for why the diagnostics come back
 * as data instead.
 */
export declare function loadConfig(sources?: ConfigSources): GuardConfig;
/** Reset cached config (for testing). */
export declare function resetConfigCache(): void;
/** Numeric level for comparing sensitivities. Higher = more sensitive. */
export declare function sensitivityLevel(s: Sensitivity): number;
/** Find decisions whose category matches a file path. */
export declare function findRelevantDecisions(filePath: string, config: GuardConfig): Decision[];

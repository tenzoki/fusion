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
 * The rule was never scoped to one key. `escalation`, `churn` and `decisions`
 * carry the identical defect, invisible only because the plugin file and
 * `DEFAULTS` happen to agree on every leaf they share and nothing keeps them
 * agreeing (`260804-1633`). One walk closes them all rather than one per-key
 * rule each. (Two of the leaves it was written for have since gone: `crossFile`
 * with the ping-back tracker, decision `260809-2004`, and `guard.protectedPaths`
 * with the mechanism it configured — see `## The leaf that was retired` below,
 * which is where the argument above used to draw its worked example from.)
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
 * both, and the paragraph above about `escalation` and `churn` is the standing
 * complaint that nothing keeps the two copies agreeing. One copy cannot
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

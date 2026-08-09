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
 * `churn` and `decisions` carry the identical defect, invisible only because
 * the plugin file and `DEFAULTS` happen to agree on every leaf they share and
 * nothing keeps them agreeing (`260804-1633`). One walk closes all four rather
 * than four per-key rules. (A fifth, `crossFile`, was closed the same way until
 * the ping-back tracker was removed with decision `260809-2004`.)
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
export function projectDeclaredProtectedPaths(config) {
    if (config.protectedPathsSource !== "project")
        return [];
    return config.guard.protectedPaths.filter((p) => !config.floorPaths.includes(p));
}
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
    },
};
/**
 * One memo slot, KEYED on the resolved source pair.
 *
 * The previous cache was keyed on nothing and ignored its own argument on every
 * call after the first. With one source and one call per hook process that was
 * inert; with two sources and injectable paths it is a live defect, and a vitest
 * file is precisely the case that hits it — one process, many cases, many
 * source pairs.
 */
let cache = null;
const EMPTY_LAYER = { raw: {}, diagnostics: [] };
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
 * For the PLUGIN layer, absence is a broken install. The plugin's own
 * `config.json` is the only thing carrying a non-empty `protectedPaths` —
 * `DEFAULTS.guard.protectedPaths` is the empty list, and the seeded template
 * says as much in its own words — so a missing plugin file drops the effective
 * list to nothing while the guard goes on reporting normal operation. That is
 * the one silence in this loader that contradicts the contract the module
 * docstring states, in the direction that removes protection. It gets ONE
 * DIAGNOSTIC naming the path that was searched, which is the same loudness the
 * module already chose for a plugin file that exists but does not parse.
 *
 * A file that EXISTS but cannot be read as a JSON object is dropped and named,
 * because the alternative is a mistyped configuration hiding behind
 * apparently-normal operation. The same holds one level down, per key, in
 * `validateLayer` — the second of the two places `kind` goes.
 */
function readLayer(path, kind) {
    if (!existsSync(path)) {
        if (kind !== "plugin")
            return EMPTY_LAYER;
        return {
            raw: {},
            diagnostics: [
                `Guard configuration: the plugin's own config.json was not found at ${path}. fusion ships the only non-empty protectedPaths list in that file, so nothing is protected beyond what this project declares in ${PROJECT_CONFIG_FILENAME}. The fusion install is incomplete; reinstall it.`,
            ],
        };
    }
    let parsed;
    try {
        parsed = JSON.parse(readFileSync(path, "utf-8"));
    }
    catch (err) {
        return {
            raw: {},
            diagnostics: [
                `Guard configuration at ${path} is not valid JSON and was ignored; falling back to the next source. ${String(err)}`,
            ],
        };
    }
    // `null` is the one non-object this loader has always accepted silently
    // (`JSON.parse(content) ?? {}`), so it keeps meaning "nothing configured".
    if (parsed === null)
        return EMPTY_LAYER;
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
        return {
            raw: {},
            diagnostics: [
                `Guard configuration at ${path} is not a JSON object and was ignored; falling back to the next source.`,
            ],
        };
    }
    return validateLayer(parsed, path, kind);
}
/* ------------------------------------------------------------------ *
 * Type validation
 * ------------------------------------------------------------------ */
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isBoolean(value) {
    return typeof value === "boolean";
}
function isStringArray(value) {
    return Array.isArray(value) && value.every((e) => typeof e === "string");
}
const SENSITIVITIES = ["none", "low", "medium", "high"];
function isSensitivity(value) {
    return typeof value === "string" && SENSITIVITIES.includes(value);
}
function isRecordOf(check) {
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
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value >= 1;
}
function isThreshold(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
function isDecisionArray(value) {
    return (Array.isArray(value) &&
        value.every((d) => isPlainObject(d) &&
            typeof d.id === "string" &&
            typeof d.category === "string" &&
            typeof d.statement === "string" &&
            (d.ruleFile === undefined || typeof d.ruleFile === "string")));
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
const CONTAINER_LEAF_RULES = {
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
    },
};
/** Top-level keys whose value is itself a leaf rather than a container. */
const TOP_LEVEL_LEAF_RULES = {
    decisions: {
        check: isDecisionArray,
        expected: "an array of {id, category, statement} objects",
    },
};
/** A type name for a diagnostic, short enough to read in a dashboard row. */
function describeValue(value) {
    if (Array.isArray(value))
        return "an array";
    if (typeof value === "object")
        return "an object";
    if (typeof value === "string")
        return "a string";
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
function validateLayer(parsed, source, kind) {
    const raw = {};
    const diagnostics = [];
    const drop = (key, rule, value) => {
        diagnostics.push(`Guard configuration at ${source}: "${key}" must be ${rule.expected}, got ${describeValue(value)}. The key was ignored and inherits as if it were absent.`);
    };
    for (const [key, value] of Object.entries(parsed)) {
        // `null` means "nothing configured" and is not a problem — see `readLayer`.
        // Dropping it here is what makes the leaf walk see it as absent.
        if (value === null || value === undefined)
            continue;
        const topLevelRule = TOP_LEVEL_LEAF_RULES[key];
        if (topLevelRule !== undefined) {
            if (topLevelRule.check(value))
                raw[key] = value;
            else
                drop(key, topLevelRule, value);
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
        const kept = {};
        for (const [leafKey, leafValue] of Object.entries(value)) {
            if (leafValue === null || leafValue === undefined)
                continue;
            if (kind === "project" && key === "guard" && leafKey === "enabled") {
                diagnostics.push(`Guard configuration at ${source}: "guard.enabled" cannot be set by a project — a project does not switch off the guard that governs it, and the git branch policy runs even where the write guard stands down. The key was ignored.`);
                continue;
            }
            const rule = leafRules[leafKey];
            if (rule === undefined) {
                kept[leafKey] = leafValue;
            }
            else if (rule.check(leafValue)) {
                kept[leafKey] = leafValue;
            }
            else {
                drop(`${key}.${leafKey}`, rule, leafValue);
            }
        }
        raw[key] = kept;
    }
    return { raw: raw, diagnostics };
}
/**
 * Load the effective guard configuration.
 *
 * Pure with respect to guard state: it reads files and returns a value. It
 * emits no events — see the module docstring for why the diagnostics come back
 * as data instead.
 */
export function loadConfig(sources) {
    const pluginConfigPath = sources?.pluginConfigPath ?? findConfigPath();
    // An explicit `null` is an instruction ("no project layer"), not an omission,
    // so it must survive to the line below. `sources?.projectRoot ?? findWorkbenchRoot()`
    // would silently turn it back into a walk up from the working directory.
    const injectedRoot = sources?.projectRoot;
    const projectRoot = injectedRoot !== undefined ? injectedRoot : findWorkbenchRoot();
    const key = JSON.stringify([pluginConfigPath, projectRoot]);
    if (cache !== null && cache.key === key) {
        return cache.value;
    }
    const projectConfigPath = projectRoot === null ? null : resolve(projectRoot, PROJECT_CONFIG_FILENAME);
    const plugin = readLayer(pluginConfigPath, "plugin");
    const project = projectConfigPath === null
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
    const pickGuard = (key) => project.raw.guard?.[key] ?? plugin.raw.guard?.[key] ?? DEFAULTS.guard[key];
    const pickEscalation = (key) => project.raw.escalation?.[key] ??
        plugin.raw.escalation?.[key] ??
        DEFAULTS.escalation[key];
    const pickChurn = (key) => project.raw.churn?.[key] ?? plugin.raw.churn?.[key] ?? DEFAULTS.churn[key];
    // Which layer the protected list came from, recorded before the floor makes
    // the answer unreadable off the list itself. See `GuardConfig`.
    const protectedPathsSource = project.raw.guard?.protectedPaths !== undefined
        ? "project"
        : plugin.raw.guard?.protectedPaths !== undefined
            ? "plugin"
            : "default";
    // THE FLOOR — TWO SPELLINGS OF ONE FILE. A fresh array every time: the chosen
    // list may be DEFAULTS' own or a raw parsed array, and appending in place
    // would edit a value someone else is holding.
    //
    // The absolute spelling is the one entry in the effective list that names a
    // location rather than a project-relative shape, and it is here because the
    // floor is the only pattern whose subject has a location this loader already
    // knows. Every other pattern is matched relative to the guard's WORKING
    // directory, which `findWorkbenchRoot` is built to walk up from — so from a
    // subdirectory, `fusion-guard.json` alone named a file that does not exist
    // while the file governing the guard sat somewhere no relative pattern could
    // reach. For `rules/**` that degradation is arguably correct (`sub/rules/`
    // genuinely is a different directory); for the floor it is the defect
    // `260804-1604` measured, with all four writes to the loaded file allowed on
    // both surfaces and no flag.
    //
    // The BARE name stays, and not only for the cwd-is-the-root case it already
    // covered. `globToRegex` reads `*`, `?` and `[` as glob syntax with no escape,
    // so a project root whose absolute path contains one of those three gets an
    // absolute pattern that means something other than the literal path — wider
    // for `*` and `?`, and unusable for an unbalanced `[`. The bare name is the
    // spelling that still works there, which makes the pair a graceful
    // degradation rather than a redundancy.
    const declaredPaths = pickGuard("protectedPaths");
    const floorApplies = projectConfigPath !== null && existsSync(projectConfigPath);
    const floorPaths = !floorApplies
        ? []
        : [PROJECT_CONFIG_FILENAME, projectConfigPath].filter((p) => !declaredPaths.includes(p));
    const protectedPaths = [...declaredPaths, ...floorPaths];
    const value = {
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
        },
        diagnostics,
        protectedPathsSource,
        floorPaths,
    };
    cache = { key, value };
    return value;
}
/** Reset cached config (for testing). */
export function resetConfigCache() {
    cache = null;
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

/**
 * Configuration loader for fusion's per-project settings.
 *
 * ## Two layers, in order
 *
 *   1. the PROJECT's `fusion.json`, at the project root
 *   2. the in-code `DEFAULTS`
 *
 * There were THREE until 2026-08-16, and the middle one was the plugin's own
 * `hooks/config.json`, inside the install. It existed for one reason: guard
 * settings needed a plugin-level default that a project could narrow. The
 * guard stopped deciding anything in this release, so that reason left with
 * it. What is left for the layer to carry is nothing — the loader reads ONE
 * leaf now, and that leaf's default is deliberately defined in exactly one
 * place, so restating it in a shipped JSON file is the thing this module has
 * always refused to do. A layer that carries nothing is a claim rather than a
 * capability, which is what the protected list and the escalation counter were
 * each removed for. Decision `260816-1915`, answered option 1 at the plan gate.
 *
 * ## The one leaf
 *
 * `orchestrator.maxTurns` is the Turn budget of the orchestrator's Phase-2
 * loop. It is the only setting this loader resolves. No hook reads it —
 * `bin/fusion-turn-budget` does, once per Setup, and the orchestrator carries
 * the answer from there.
 *
 * The budget had been prose in `agents/orchestrator.md`, written out as `5` in
 * seven places and four spellings, with one of them already calling it a
 * "default" — a word that was false, because no source could override it
 * (issue `260811-1712`).
 *
 * THE DEFAULT IS DEFINED ONCE, in `DEFAULTS` below. A project that wants a
 * different budget declares `{"orchestrator":{"maxTurns":12}}` in its own
 * `fusion.json` and the leaf walk does the rest.
 *
 * ## Merge: PER LEAF, across both layers
 *
 * One rule, and it is meant to be statable from memory by an agent and by a
 * project owner alike: *a key the project layer does not supply, or supplies
 * unusably, is treated as absent, and absent means `DEFAULTS`.* A key the
 * project DOES supply is taken exactly as written.
 *
 * Declaration wins outright, and that half is not a detail: a union of a
 * declared container can only ever grow, so narrowing — half of what the
 * project-level configuration was asked for — is expressible only if a declared
 * value replaces rather than merges. What the leaf walk changed, when it was
 * written for a loader with six guard leaves, was the granularity at which
 * "declared" is read, from the whole top-level object down to the leaf.
 * Decision `260804-1630`, answered option 1 at the plan gate on 2026-08-04.
 *
 * With one leaf the walk has nothing to disagree with itself about, and it is
 * kept as the shape rather than collapsed into a single `??`, because the next
 * setting to land here inherits the rule instead of re-deriving it. The leaves
 * it was written for have all gone: `crossFile` with the ping-back tracker
 * (`260809-2004`), `guard.protectedPaths` with the mechanism it configured
 * (2026-08-12), `churn` with the heatmap (2026-08-15), and the four remaining
 * guard leaves with the guard's verdict (2026-08-16).
 *
 * ## Type validation: an unusable value costs exactly what an absence costs
 *
 * `readLayer` used to cast the parsed JSON to `RawConfig` and check nothing
 * inside it, so `{"guard":{"protectedPaths":123}}` crashed the guard into its
 * fail-open branch on every call, and the subtler `"rules/**"` spread into eight
 * single characters and protected nothing, silently (`260804-1603`). Both that
 * leaf and the mechanism behind it are gone; the defect they measured is why
 * this table exists, so the example is kept as the history it is.
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
 * ## Retirement, at two scopes
 *
 * Something a project once configured and no longer can is neither a validation
 * failure nor an unknown key. It is a line that still looks like a setting to
 * whoever wrote it and now does nothing, and the one thing that must not happen
 * is for it to go through in the silence every unrecognised key gets. So it is
 * named, once per guarded tool call, until it comes out of the project's tree.
 *
 * That notion started at one scope, the leaf (`guard.protectedPaths`, retired
 * 2026-08-12). This release needs two more, so it is ONE TABLE FAMILY rather
 * than a second mechanism:
 *
 *   - `RETIRED_PROJECT_FILES` — a whole FILE at the project root that fusion no
 *     longer reads. Today: `fusion-guard.json`, replaced by `fusion.json`.
 *   - `RETIRED_TOP_LEVEL_KEYS` — a top-level KEY inside the file that is read.
 *     Today: `guard`, `decisions`, `escalation`, which is what a project sees
 *     if it copies its old file across rather than starting from the template.
 *
 * The leaf-scoped table has no members after this release and is gone with
 * them: `guard.protectedPaths` now sits inside a retired container, so the
 * container's own diagnostic names it. Reinstate the table if a leaf inside a
 * LIVE container is ever retired; that is the case it was written for and the
 * case that does not exist right now.
 *
 * THE RETIRED-FILE DIAGNOSTIC IS THE WHOLE OF THE v10 MIGRATION, and it is
 * written that way on purpose. `/fusion:setup` was the alternative and the user
 * chose against it (`260816-1916`, option 1), on the ground that this channel
 * runs on every guarded tool call while Setup runs once per session and only
 * for a project that runs Setup at all. A project that carried
 * `{"orchestrator":{"maxTurns":12}}` and does nothing would otherwise drop to
 * the built-in default without a word, which is the exact class of silent loss
 * every diagnostic in this module exists to prevent. So the text names the key,
 * names the destination file and says to copy the value across BEFORE deleting
 * anything. Do not shorten it into a bare "this file moved".
 *
 * ## Diagnostics rather than silence
 *
 * A configuration file that exists but cannot be read as a JSON object is
 * dropped and RECORDED, never dropped silently: `loadConfig` returns the
 * problem in `diagnostics` and the hook entry point emits one `guard_advisory`
 * per entry. The loader itself does not emit, so it stays pure and unit-testable
 * without a workbench on disk.
 *
 * A MISSING `fusion.json` is silent, and must be: it is the ordinary state of a
 * project that has configured nothing, and nagging it would put an advisory on
 * every guarded call of a correctly-behaving project. The one absence that used
 * to be reported was the plugin layer's, where absence meant a broken install
 * (`260809-1101`); that diagnostic went with the file it was about.
 *
 * Uses native JSON.parse — zero external dependencies.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { findWorkbenchRoot } from "./workbench-root.js";
/** The project-level configuration file, at the project root, git-tracked. */
export const PROJECT_CONFIG_FILENAME = "fusion.json";
const DEFAULTS = {
    // THE TURN BUDGET'S ONE DEFINITION. Not restated in any shipped JSON file,
    // and not in `agents/orchestrator.md` — the prompt reads it through
    // `bin/fusion-turn-budget` at Setup and names the resolved value everywhere
    // it used to write a number. See the module docstring.
    orchestrator: {
        maxTurns: 5,
    },
};
/**
 * One memo slot, KEYED on the resolved source.
 *
 * The previous cache was keyed on nothing and ignored its own argument on every
 * call after the first. With one source and one call per hook process that was
 * inert; with an injectable root it is a live defect, and a vitest file is
 * precisely the case that hits it — one process, many cases, many roots.
 */
let cache = null;
const EMPTY_LAYER = { raw: {}, diagnostics: [] };
/**
 * Read the project's configuration file into a layer.
 *
 * An ABSENT file is silent — see the module docstring's `## Diagnostics rather
 * than silence`. A file that EXISTS but cannot be read as a JSON object is
 * dropped and named, because the alternative is a mistyped configuration hiding
 * behind apparently-normal operation. The same holds one level down, per key,
 * in `validateLayer`.
 */
function readLayer(path) {
    if (!existsSync(path))
        return EMPTY_LAYER;
    let parsed;
    try {
        parsed = JSON.parse(readFileSync(path, "utf-8"));
    }
    catch (err) {
        return {
            raw: {},
            diagnostics: [
                `fusion configuration at ${path} is not valid JSON and was ignored; falling back to fusion's built-in defaults. ${String(err)}`,
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
                `fusion configuration at ${path} is not a JSON object and was ignored; falling back to fusion's built-in defaults.`,
            ],
        };
    }
    return validateLayer(parsed, path);
}
/* ------------------------------------------------------------------ *
 * Type validation
 * ------------------------------------------------------------------ */
function isPlainObject(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
 * A budget of `0` is a session that can never run a Turn — a project writing it
 * almost certainly means "no limit" and would get the tightest limit there is;
 * a negative one is not a count; `2.5` is not a number of Turns. All three are
 * out of range, all three are dropped, named in an advisory, and inherit the
 * default, because that is the one behaviour an absent, an unusable and an
 * unwritten key are all required to share.
 *
 * There is no upper bound, deliberately: a project that wants 60 Turns has said
 * so in a git-tracked file, and inventing a ceiling here would be a policy
 * nobody asked for. The shape was first argued for the escalation threshold
 * (`260804-1606`), whose `0` halted on the first denied call; that setting went
 * with the counter on 2026-08-16 and the argument transferred intact.
 */
function isPositiveInteger(value) {
    return typeof value === "number" && Number.isInteger(value) && value >= 1;
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
    orchestrator: {
        maxTurns: {
            check: isPositiveInteger,
            expected: "a whole number of 1 or more",
        },
    },
};
/**
 * Files at the project root that fusion ONCE READ and no longer does, with the
 * reason a project still carrying one needs to hear.
 *
 * The value completes the sentence "… is no longer read — ___", and it names
 * what moved and where. See the module docstring's `## Retirement, at two
 * scopes` for why this is the loudest thing in the module: for the file below it
 * is the entire migration path a consuming project gets.
 *
 * An entry here is a promise to keep making noise until the file comes out of
 * the project's tree. Drop one only when a project could no longer plausibly
 * still be carrying it.
 */
const RETIRED_PROJECT_FILES = {
    "fusion-guard.json": `fusion removed the guard settings this file configured. The one setting it carried that was never the guard's, "orchestrator.maxTurns", now lives in ${PROJECT_CONFIG_FILENAME} at the project root. If this file sets a Turn budget, copy {"orchestrator": {"maxTurns": <n>}} into ${PROJECT_CONFIG_FILENAME} first: a budget left here is not read, and the orchestrator falls back to fusion's built-in default without saying so. Then delete this file to stop this advisory.`,
};
/**
 * Top-level keys this loader ONCE READ and no longer does, with the reason a
 * project that still declares one needs to hear.
 *
 * The counterpart of `CONTAINER_LEAF_RULES` above, at the container's own
 * scope, and the sibling of `RETIRED_PROJECT_FILES` one scope down. It is
 * reached by a project that copied its `fusion-guard.json` across into
 * `fusion.json` rather than starting from the seeded template — the ordinary
 * way an upgrade goes wrong quietly, since the file parses and every key in it
 * looks like a setting.
 *
 * The value completes the sentence "… no longer exists — ___". Keep it saying
 * what happened; a project reading it has just upgraded and this is its notice.
 */
const RETIRED_TOP_LEVEL_KEYS = {
    guard: "fusion's guard decides nothing. It observes the write tools and reports what it could not read here, and it has no settings of its own.",
    decisions: "the decision-governed check that read this list was removed with the guard's verdict.",
    escalation: "the consecutive-block counter and the halt it raised were removed with the guard's verdict.",
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
 * `loadConfig` then finds it absent and inherits from `DEFAULTS`. Decision
 * `260804-1630` requires that equivalence rather than merely permitting it: two
 * ways of arriving at "absent" that behave differently would be two rules where
 * the answer is one.
 *
 * It no longer takes a layer kind. There is one layer, and the two behaviours
 * that used to distinguish them are gone with it: the plugin file's
 * missing-file diagnostic, and the project-only refusal of `guard.enabled`,
 * which is retired inside its container (`260816-1915`, option 1).
 */
function validateLayer(parsed, source) {
    const raw = {};
    const diagnostics = [];
    for (const [key, value] of Object.entries(parsed)) {
        // `null` means "nothing configured" and is not a problem — see `readLayer`.
        // Dropping it here is what makes the leaf walk see it as absent.
        if (value === null || value === undefined)
            continue;
        // A RETIRED top-level key. Checked before anything else about the key,
        // because a retired container is not a container to walk into: its leaves
        // are retired with it, and one advisory naming the container beats one per
        // leaf inside a key that no longer means anything. The value is dropped, so
        // nothing downstream can read it back.
        const retired = RETIRED_TOP_LEVEL_KEYS[key];
        if (retired !== undefined) {
            diagnostics.push(`fusion configuration at ${source}: "${key}" no longer exists — ${retired} The key was ignored; the rest of this file is unaffected. Delete it to stop this advisory.`);
            continue;
        }
        const leafRules = CONTAINER_LEAF_RULES[key];
        if (leafRules === undefined) {
            // An unknown key, carried through untouched and undiagnosed. The seeded
            // template is mostly underscore-prefixed documentation keys; rejecting
            // them would make the file fusion itself ships a broken one.
            raw[key] = value;
            continue;
        }
        if (!isPlainObject(value)) {
            diagnostics.push(`fusion configuration at ${source}: "${key}" must be a JSON object, got ${describeValue(value)}. The key was ignored and inherits as if it were absent.`);
            continue;
        }
        const kept = {};
        for (const [leafKey, leafValue] of Object.entries(value)) {
            if (leafValue === null || leafValue === undefined)
                continue;
            const rule = leafRules[leafKey];
            if (rule === undefined || rule.check(leafValue)) {
                kept[leafKey] = leafValue;
            }
            else {
                diagnostics.push(`fusion configuration at ${source}: "${key}.${leafKey}" must be ${rule.expected}, got ${describeValue(leafValue)}. The key was ignored and inherits as if it were absent.`);
            }
        }
        raw[key] = kept;
    }
    return { raw: raw, diagnostics };
}
/**
 * Load the effective configuration.
 *
 * Pure with respect to guard state: it reads files and returns a value. It
 * emits no events — see the module docstring for why the diagnostics come back
 * as data instead.
 */
export function loadConfig(sources) {
    // An explicit `null` is an instruction ("no project layer"), not an omission,
    // so it must survive to the line below. `sources?.projectRoot ?? findWorkbenchRoot()`
    // would silently turn it back into a walk up from the working directory.
    const injectedRoot = sources?.projectRoot;
    const projectRoot = injectedRoot !== undefined ? injectedRoot : findWorkbenchRoot();
    const key = JSON.stringify([projectRoot]);
    if (cache !== null && cache.key === key) {
        return cache.value;
    }
    const projectConfigPath = projectRoot === null ? null : resolve(projectRoot, PROJECT_CONFIG_FILENAME);
    const project = projectConfigPath === null ? EMPTY_LAYER : readLayer(projectConfigPath);
    // A retired file is probed rather than read: nothing in it is parsed, and its
    // contents cannot reach any setting. `existsSync` is the whole check, which
    // is deliberate — the file is not read, so reading it to decide what to say
    // about not reading it would be the contradiction it is.
    const retiredFiles = [];
    if (projectRoot !== null) {
        for (const [filename, reason] of Object.entries(RETIRED_PROJECT_FILES)) {
            const path = resolve(projectRoot, filename);
            if (existsSync(path)) {
                retiredFiles.push(`fusion configuration: ${path} is no longer read — ${reason}`);
            }
        }
    }
    // Retired files first. They name a file that is not read AT ALL, which is the
    // most upstream thing a reader can be wrong about; a dropped key inside the
    // file that IS read is a finer complaint and reads better after it.
    const diagnostics = [...retiredFiles, ...project.diagnostics];
    // THE MERGE, per leaf across both layers: project, then DEFAULTS. `??` and
    // not `||`, because a leaf may legitimately be `false`, `0` or `[]` — and
    // `[]` in particular is the deliberate narrowing that a project declares on
    // purpose and that must survive as itself.
    const pickOrchestrator = (key) => project.raw.orchestrator?.[key] ?? DEFAULTS.orchestrator[key];
    const value = {
        orchestrator: {
            maxTurns: pickOrchestrator("maxTurns"),
        },
        diagnostics,
    };
    cache = { key, value };
    return value;
}
/** Reset cached config (for testing). */
export function resetConfigCache() {
    cache = null;
}

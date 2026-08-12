/**
 * The EFFECTIVE protected-path list, with each entry's origin layer and whether
 * the guard is enforcing it here. Printed for a human to read at Setup.
 *
 * ## Why this exists
 *
 * Nothing anywhere reported what the guard was actually protecting. The seeded
 * `fusion-guard.json` deliberately does not restate the list and points at a
 * file inside the install, which a user of a consuming project has no reason to
 * open. So the plugin layer's eight patterns — written for fusion's own
 * repository, where `agents/**` and `rules/**` mean the plugin's own prompts —
 * were inherited by every consuming project silently. The largest one ran 143
 * days under them, matching its own engineering documentation with `rules/**`,
 * and produced 53 records of work that existed only because agents could not
 * write files the project owned. Nobody narrowed the list, and one reason is
 * that a project could only discover it by being blocked
 * (`shared/issues/260812-0843_*_the-guard-and-its-configuration-must-be-simplified-project-settable-and-defaulted-to-fit-or-not-shipped-to-consumers-at-all.md`).
 *
 * This is a REPORT and only a report. It changes no default, empties no list and
 * alters no guard behaviour. The record's central question — whether a consumer
 * should inherit any protected path at all — is open, and this program is
 * deliberately built to hold whichever way it is answered: it prints the list
 * that is in force, whatever that list turns out to be, including the empty one.
 *
 * ## Why this is a program rather than a paragraph
 *
 * The effective list is a three-layer per-leaf merge — the project's
 * `fusion-guard.json`, then the plugin's `hooks/config.json`, then the built-in
 * `DEFAULTS` in `lib/config.ts` — and a declared list REPLACES rather than
 * merges, so which layer supplied it is not readable off the list itself. A
 * prompt cannot compute that. `lib/config.ts` already does, and already records
 * the answer in `protectedPathsSource`; this program asks it rather than
 * re-deriving it, which would be a second description of one file free to
 * disagree with the first.
 *
 * ## Origin is reported PER ENTRY, and it is honestly per entry
 *
 * There are exactly two contributors to any one effective list, and the loader
 * names both. The declared entries all come from ONE layer, because the leaf
 * walk takes a declared `protectedPaths` whole — that is what makes narrowing
 * expressible. The self-protection floor is the other, and `floorPaths` is the
 * loader's own record of precisely which entries it appended. So every entry's
 * origin is derivable exactly, and no entry is guessed at.
 *
 * `origin=default` therefore appears only alongside an empty declared list:
 * `DEFAULTS.guard.protectedPaths` is `[]`, so when neither file declares a list
 * the only entries present are the floor's.
 *
 * ## Enforcement is TWO answers about TWO directories
 *
 * A report listing eight protected paths in a tree where none of them is
 * enforced is worse than no report, so enforcement is stated, and it is stated
 * as the two halves it actually is:
 *
 *   - the write-tool deny (`guard.ts`) stands down on `isFusionPluginCwd()`,
 *     which asks about the WORKING DIRECTORY with no upward walk;
 *   - the protected-path measurement (`tracker.ts`, through `measurementRoot()`
 *     in `lib/protected-snapshot.ts`) stands down on
 *     `isFusionPluginRoot(workbenchRoot)`, which asks about the WORKBENCH ROOT.
 *
 * That difference is deliberate and documented in both of those modules: a
 * root-anchored measurement with a cwd-anchored stand-down would revert a fusion
 * developer's own edits whenever their session started in a subdirectory, which
 * `fusion-workbench/` makes the ordinary case. The consequence for this report is
 * that the two halves can genuinely DISAGREE — in fusion's own repository, a
 * session started at the root has both standing down while one started in
 * `fusion-workbench/` has the write-tool deny active and the measurement not.
 * Collapsing them into one "enforced" would print a falsehood in that case, so
 * both are printed, each next to the directory it was answered for.
 *
 * `guard.enabled` gates both halves ahead of either stand-down and is reported
 * as its own line.
 *
 * ## Everything goes to stdout, including the diagnostics
 *
 * `bin/fusion-turn-budget` puts loader diagnostics on stderr, because there the
 * diagnostic is an aside to a value. Here the whole output IS the report, and a
 * report split across two streams is one a caller can relay half of. A project
 * whose `fusion-guard.json` was dropped as unreadable must never see output that
 * reads like a clean inherit, so the count and the text are both on stdout with
 * everything else.
 *
 * ## Output
 *
 * One `KEY=value` per line in the shape `bin/fusion-paths`,
 * `bin/fusion-count-sources`, `bin/fusion-churn-rank` and
 * `bin/fusion-turn-budget` use, then one line per effective entry:
 *
 *   summary=8 protected paths resolved from the fusion plugin's own hooks/config.json…
 *   enforced=none
 *   enforced_write_tools=no
 *   write_tools_dir=/Users/k1/Projects/productive/fusion
 *   write_tools_standdown=fusion-plugin-repo
 *   enforced_measurement=no
 *   measurement_dir=/Users/k1/Projects/productive/fusion
 *   measurement_standdown=fusion-plugin-repo
 *   guard_enabled=true
 *   source=plugin
 *   project_config=absent
 *   project_config_path=/Users/k1/Projects/productive/fusion/fusion-guard.json
 *   entries=8
 *   diagnostics=0
 *   path=agents/** origin=plugin
 *
 * `summary` comes first and is a plain sentence, so a caller can relay the answer
 * without a paragraph of prompt explaining how to read the keys.
 *
 * Exit codes:
 *   0  reported. An empty effective list is a report, not a failure.
 *   1  usage error
 *   2  no fusion workbench above the working directory, so there is no project
 *      layer to merge and a project that narrowed the list would be shown the
 *      plugin's. Nothing is printed; the caller reports it unmeasured.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadConfig, PROJECT_CONFIG_FILENAME } from "./lib/config.js";
import { findWorkbenchRoot } from "./lib/workbench-root.js";
import { isFusionPluginRoot, isFusionPluginCwd } from "./lib/self-detect.js";
const USAGE = "usage: fusion-protected-paths";
/** The one-word answer for a machine, across both halves. */
function enforcedToken(write, measurement) {
    if (write === null && measurement === null)
        return "both";
    if (write === null)
        return "write-tools";
    if (measurement === null)
        return "measurement";
    return "none";
}
/** The one reason either half stands down, named for the directory it asked about. */
function pluginRepoBecause(dir) {
    return `${dir} is fusion's own plugin repository`;
}
/**
 * How ONE half reads in the summary sentence, beside the directory it asked
 * about.
 *
 * Takes a boolean and not a `StandDown`, because `guard-disabled` is not a
 * per-half answer: it turns both halves off ahead of either stand-down, and
 * `main` states it once instead.
 */
function standDownPhrase(inPluginRepo, half, dir) {
    if (!inPluginRepo)
        return `${half} is active`;
    return `${half} stands down because ${pluginRepoBecause(dir)}`;
}
/** How the layer that supplied the declared list reads in the summary sentence. */
function sourcePhrase(source, declared) {
    if (source === "project") {
        return `this project's own ${PROJECT_CONFIG_FILENAME}`;
    }
    if (source === "plugin") {
        return "the fusion plugin's own hooks/config.json, which every project on this install inherits";
    }
    // `DEFAULTS.guard.protectedPaths` is the empty list, so a `default` source with
    // entries present means the floor put them there and nothing else did.
    return declared === 0
        ? "fusion's built-in default, which is the empty list"
        : "fusion's built-in default";
}
function main(argv) {
    if (argv.length > 0) {
        process.stderr.write(`fusion-protected-paths: unknown argument ${JSON.stringify(argv[0])}\n${USAGE}\n`);
        return 1;
    }
    const cwd = process.cwd();
    const root = findWorkbenchRoot();
    if (root === null) {
        process.stderr.write(`fusion-protected-paths: no fusion workbench found above ${cwd} — run /fusion:setup at the project root.\n`);
        return 2;
    }
    const config = loadConfig({ projectRoot: root });
    const projectConfigPath = resolve(root, PROJECT_CONFIG_FILENAME);
    // The two halves, each asked of the directory its own gate asks of. Not one
    // question answered twice: see the module docstring.
    const disabled = !config.guard.enabled;
    const writeInPluginRepo = isFusionPluginCwd();
    const measurementInPluginRepo = isFusionPluginRoot(root);
    const writeStandDown = disabled
        ? "guard-disabled"
        : writeInPluginRepo
            ? "fusion-plugin-repo"
            : null;
    const measurementStandDown = disabled
        ? "guard-disabled"
        : measurementInPluginRepo
            ? "fusion-plugin-repo"
            : null;
    const paths = config.guard.protectedPaths;
    const floor = new Set(config.floorPaths);
    const declared = paths.filter((p) => !floor.has(p));
    const noun = paths.length === 1 ? "protected path" : "protected paths";
    const head = paths.length === 0
        ? "No path is protected here: the effective list is empty."
        : `${paths.length} ${noun} resolved from ${sourcePhrase(config.protectedPathsSource, declared.length)}.`;
    // `guard-disabled` is stated once, because it is not a per-half fact. The
    // two stand-downs below ARE per-half, and are collapsed only when they give
    // the same answer for the same directory — the everyday case in fusion's own
    // repository read from its root. Where they differ in either, and in this
    // repository a session started in `fusion-workbench/` differs in both, each
    // is stated beside the directory it was answered for. That is the whole
    // distinction the two halves exist to make.
    const bothDown = writeInPluginRepo && measurementInPluginRepo;
    const enforcement = disabled
        ? "the guard does not run at all, because guard.enabled is false in the plugin's configuration, so nothing is enforced"
        : bothDown && cwd === root
            ? `both halves stand down because ${pluginRepoBecause(cwd)}, so nothing is enforced in this tree`
            : `${standDownPhrase(writeInPluginRepo, "the write-tool deny", cwd)} and ` +
                `${standDownPhrase(measurementInPluginRepo, "the measurement", root)}` +
                (bothDown
                    ? ", so nothing is enforced in this tree"
                    : !writeInPluginRepo && !measurementInPluginRepo
                        ? ""
                        : ", so only one half applies");
    const parts = [`${head} Here ${enforcement}.`];
    if (config.diagnostics.length > 0) {
        const n = config.diagnostics.length;
        parts.push(`${n} configuration problem${n === 1 ? " was" : "s were"} reported and ${n === 1 ? "is" : "are"} listed below; the effective list may not be the one the configuration asks for.`);
    }
    const lines = [
        `summary=${parts.join(" ")}`,
        `enforced=${enforcedToken(writeStandDown, measurementStandDown)}`,
        `enforced_write_tools=${writeStandDown === null ? "yes" : "no"}`,
        `write_tools_dir=${cwd}`,
        ...(writeStandDown === null ? [] : [`write_tools_standdown=${writeStandDown}`]),
        `enforced_measurement=${measurementStandDown === null ? "yes" : "no"}`,
        `measurement_dir=${root}`,
        ...(measurementStandDown === null
            ? []
            : [`measurement_standdown=${measurementStandDown}`]),
        `guard_enabled=${config.guard.enabled}`,
        `source=${config.protectedPathsSource}`,
        `project_config=${existsSync(projectConfigPath) ? "present" : "absent"}`,
        `project_config_path=${projectConfigPath}`,
        `entries=${paths.length}`,
        `diagnostics=${config.diagnostics.length}`,
        ...config.diagnostics.map((d) => `diagnostic=${d}`),
        ...paths.map((p) => `path=${p} origin=${floor.has(p) ? "floor" : config.protectedPathsSource}`),
    ];
    process.stdout.write(lines.join("\n") + "\n");
    return 0;
}
process.exitCode = main(process.argv.slice(2));

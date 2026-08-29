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
 * each removed for. Decision `260816-1915_*_how-much-of-the-configuration-loader-survives-when-its-only-leaf-is-the-turn-budget.md`, answered option 1 at the plan gate.
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
 * (issue `260811-1712_*_max-turns-is-hardcoded-in-eight-places-and-cannot-be-set-per-project.md`).
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
 * Decision `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md`, answered option 1 at the plan gate on 2026-08-04.
 *
 * With one leaf the walk has nothing to disagree with itself about, and it is
 * kept as the shape rather than collapsed into a single `??`, because the next
 * setting to land here inherits the rule instead of re-deriving it. The leaves
 * it was written for have all gone: `crossFile` with the ping-back tracker
 * (`260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md`), `guard.protectedPaths` with the mechanism it configured
 * (2026-08-12), `churn` with the heatmap (2026-08-15), and the four remaining
 * guard leaves with the guard's verdict (2026-08-16).
 *
 * ## Type validation: an unusable value costs exactly what an absence costs
 *
 * `readLayer` used to cast the parsed JSON to `RawConfig` and check nothing
 * inside it, so `{"guard":{"protectedPaths":123}}` crashed the guard into its
 * fail-open branch on every call, and the subtler `"rules/**"` spread into eight
 * single characters and protected nothing, silently (`260804-1603_*_the-project-config-layer-is-not-type-validated-so-a-wrong-type-fails-the-guard-open.md`). Both that
 * leaf and the mechanism behind it are gone; the defect they measured is why
 * this table exists, so the example is kept as the history it is.
 *
 * `validateLayer` gives every leaf this loader reads a declared type. A leaf
 * whose value does not have that type is DROPPED and NAMED, and the leaf walk
 * then finds it absent and inherits — so a dropped key, an omitted key and a key
 * the project never wrote are three spellings of one behaviour. That equivalence
 * is an obligation of `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md`, not an implementation convenience: it is
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
 *     Today: `guard`, `decisions`, `escalation` and `churn`, which is what a
 *     project sees if it copies its old file across rather than starting from
 *     the template.
 *
 * The leaf-scoped table has no members after this release and is gone with
 * them: `guard.protectedPaths` now sits inside a retired container, so the
 * container's own diagnostic names it. Reinstate the table if a leaf inside a
 * LIVE container is ever retired; that is the case it was written for and the
 * case that does not exist right now.
 *
 * THE RETIRED-FILE DIAGNOSTIC IS THE WHOLE OF THE v10 MIGRATION, and it is
 * written that way on purpose. `/fusion:setup` MOVING THE BUDGET was the
 * alternative and the user chose against it (`260816-1916_*_does-setup-offer-to-move-a-projects-turn-budget-out-of-the-retired-configuration-file.md`, option 1), on the
 * ground that this channel runs on every guarded tool call while Setup runs
 * once per session and only for a project that runs Setup at all. That names
 * which channel CARRIES the migration; it is not the complete list of places
 * the text is heard. `bin/fusion-turn-budget` puts every diagnostic this loader
 * returns on stderr, and the orchestrator repeats all of them in its
 * Setup-complete summary (`agents/orchestrator.md` Setup Step 2). Setup still
 * writes nothing and reads no old file. A project that carried
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
 * (`260809-1101_*_an-absent-plugin-config-layer-yields-an-empty-protected-list-with-no-diagnostic.md`); that diagnostic went with the file it was about.
 *
 * Uses native JSON.parse — zero external dependencies.
 */
/** The project-level configuration file, at the project root, git-tracked. */
export declare const PROJECT_CONFIG_FILENAME = "fusion.json";
/**
 * The effective SETTINGS — everything this loader resolves.
 *
 * Split out from `GuardConfig` so the load report below can be added to what
 * `loadConfig` returns without becoming a setting. "Did the effective
 * configuration change?" has to stay an answerable question, and it is
 * answerable only if the settings are a nameable subset.
 */
export interface GuardSettings {
    /**
     * The orchestrator's Phase-2 Turn budget. Read by `bin/fusion-turn-budget`
     * at Setup, not by any hook.
     */
    orchestrator: {
        maxTurns: number;
    };
}
/** Configuration as loaded: the settings, plus a report about the load. */
export interface GuardConfig extends GuardSettings {
    /**
     * Non-fatal problems met while resolving the layers, plus the retirement
     * announcements. Empty on a clean load. NOT configuration — it is a report
     * about the load, which is why it is excluded from every comparison that asks
     * whether the effective configuration changed.
     *
     * It is the module's main product now rather than a footnote to one: with a
     * single leaf to resolve, most of what this loader has to say to a project is
     * in here.
     */
    diagnostics: string[];
}
/**
 * Where the project layer is read from.
 *
 * OPTIONAL, and defaulted inside `loadConfig`, never at module load. A caller
 * that passes `projectRoot: null` means "there is no project layer" and gets
 * exactly that — the absence is honoured rather than filled in by a walk up
 * from the working directory, which is what a `??` default would have done and
 * what would have made every unit case secretly depend on where the test runner
 * was started.
 */
export interface ConfigSources {
    /** Default: `findWorkbenchRoot(process.cwd())`. `null` means no project layer. */
    projectRoot?: string | null;
}
/**
 * Load the effective configuration.
 *
 * Pure with respect to guard state: it reads files and returns a value. It
 * emits no events — see the module docstring for why the diagnostics come back
 * as data instead.
 */
export declare function loadConfig(sources?: ConfigSources): GuardConfig;
/** Reset cached config (for testing). */
export declare function resetConfigCache(): void;

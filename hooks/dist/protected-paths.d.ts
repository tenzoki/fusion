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
export {};

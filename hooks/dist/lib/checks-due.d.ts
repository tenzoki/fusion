/**
 * Which of fusion's periodic installation checks are due.
 *
 * ## One computation, two callers
 *
 * `/fusion:setup` Step 0 asks through `bin/fusion-checks-due` (entry
 * `hooks/checks-due.ts`), and `hooks/session-start.ts` asks by import, so a
 * session that never runs setup is still told. The computation lived inline in
 * the setup skill's `node -e` block until issue
 * `261020-0916-claude-md-check-never-runs-in-orchestrator-sessions.md` showed
 * that a session started through the orchestrator never reached it; it moved
 * here unchanged, under ruling
 * `261020-0925-how-do-due-checks-and-an-over-threshold-claude-md-reach-a-session-that-never-runs-setup.md`
 * (option 4).
 *
 * ## The rule
 *
 * A selector is due when `.check-stamps` has no entry for it, when the entry
 * was stamped by another plugin version, or when it is not younger than 30
 * days. An unreadable or malformed stamps file makes every selector due, and
 * so does an entry whose date does not parse. The stamps are written by
 * `skills/check/SKILL.md` and never travel (`rules/workbench-tracking.md`).
 *
 * Nothing here writes, and nothing here spawns: the session-start hook imports
 * it on every session start.
 */
/** The eleven selectors of `/fusion:check`, in its order. */
export declare const CHECK_SELECTORS: readonly ["monitor", "concurrency", "assets", "config", "permissions", "gitattributes", "identity", "gitignore", "upstream", "leftovers", "claude-md"];
/** The selectors due against parsed stamps (anything `JSON.parse` returns, or `null`). */
export declare function dueSelectors(stamps: unknown, version: string, now?: number): string[];
/** The selectors due in the project whose root holds `fusion-workbench/`. */
export declare function dueChecks(projectRoot: string, version: string, now?: number): string[];
/** The `version` of the plugin at `pluginRoot`, or `null` when it cannot be read. */
export declare function pluginVersion(pluginRoot: string): string | null;
/** The session-start line for a due list; `null` when nothing is due. */
export declare function dueLine(due: readonly string[]): string | null;

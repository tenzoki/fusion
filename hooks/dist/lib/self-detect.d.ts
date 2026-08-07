/**
 * Self-detection: is the guard running inside the fusion plugin's own repo?
 *
 * The guard protects agents/**, rules/**, skills/**, .claude-plugin/plugin.json
 * etc. This is correct for projects USING fusion, but wrong when developing
 * fusion itself — every edit to the plugin's own source would be blocked.
 *
 * Heuristic: if a directory contains a .claude-plugin/plugin.json whose "name"
 * field is "fusion", that directory is the fusion plugin's own source tree and
 * the guard should stand down for it.
 *
 * ## Two entry points, because two callers ask about two different directories
 *
 * `isFusionPluginCwd()` asks about `process.cwd()`, with NO upward walk. That is
 * the question the write-tool branch and the churn heatmap ask, because both
 * work in the coordinate space of the process's own working directory.
 *
 * `isFusionPluginRoot(dir)` asks about a directory the caller names. The
 * protected-path MEASUREMENT needs this one: since it anchors at the workbench
 * root (`findWorkbenchRoot`, which walks up), the stand-down has to be evaluated
 * at that same root. Evaluating it at cwd instead would leave a fusion developer
 * whose session started in a subdirectory of this repository — `fusion-workbench/`
 * is the everyday case — with their own edits to `rules/` and `agents/` reverted
 * on the next tool call. Measured, not inferred; see
 * `lib/__tests__/protected-snapshot-subdirectory.test.ts`.
 *
 * The two must move together. A root-anchored measurement with a cwd-anchored
 * stand-down is the defect above; a cwd-anchored measurement with a
 * root-anchored stand-down is the subdirectory hole that change closed.
 */
/**
 * Does `dir` itself carry a fusion plugin manifest?
 *
 * Uncached, because the caller chooses the directory and two callers may choose
 * differently within one process. The read is one `existsSync` plus one small
 * `JSON.parse`, on a path that is almost always absent.
 */
export declare function isFusionPluginRoot(dir: string): boolean;
export declare function isFusionPluginCwd(): boolean;

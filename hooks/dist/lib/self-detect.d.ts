/**
 * Self-detection: is the guard running inside the fusion plugin's own repo?
 *
 * Two things stand down in fusion's own tree: the write-tool branch of the
 * guard, and the churn heatmap. The reason both were built was the same — the
 * guard used to protect agents/**, rules/** and .claude-plugin/plugin.json,
 * which is correct for projects USING fusion and wrong when developing fusion
 * itself, where every edit to the plugin's own source would have been blocked
 * and written back. That protection was removed on 2026-08-12 and both
 * stand-downs outlived it; each call site below says what its own now covers.
 *
 * Heuristic: if a directory contains a .claude-plugin/plugin.json whose "name"
 * field is "fusion", that directory is the fusion plugin's own source tree and
 * the guard should stand down for it.
 *
 * ## Two entry points, because callers ask about two different directories
 *
 * `isFusionPluginCwd()` asks about `process.cwd()`, with NO upward walk. One
 * caller is left for it: the write-tool branch of `guard.ts`, whose own
 * coordinate space is the process's working directory (`normalizeToRelative`).
 * The churn heatmap asked it too until its keys moved to the workbench root; it
 * now asks `isFusionPluginRoot` about that root, like everything else that walks
 * up.
 *
 * `isFusionPluginRoot(dir)` asks about a directory the caller names. One caller
 * is left for it too: the churn stand-down in `tracker.ts`, since `25c5454`
 * moved churn's keys to the workbench root. The cost of leaving that one at cwd
 * was measured, in `lib/__tests__/churn-key-anchor.test.ts`.
 *
 * ## The rule the two entry points exist to serve
 *
 * Whichever directory a caller keys its state by, the stand-down is evaluated
 * where that key is anchored. A root-anchored mechanism with a cwd-anchored
 * stand-down misses every session started one directory down; a cwd-anchored
 * mechanism with a root-anchored stand-down is the reverse hole. Both halves of
 * that were measured on the protected-path measurement, which anchored at the
 * workbench root and had its stand-down moved up to match; the measurement was
 * removed on 2026-08-12 and the rule it established is what survives it. The
 * churn heatmap repeated the same mistake on its own gate and was moved for the
 * same reason (issues `260805-1839`, `260810-1632`).
 *
 * The two remaining callers therefore ask about DIFFERENT directories, and that
 * is correct rather than a drift to unify: `guard.ts`'s verdict is computed in
 * cwd's coordinate space and churn's keys are computed in the root's.
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

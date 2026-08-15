/**
 * Self-detection: is the guard running inside the fusion plugin's own repo?
 *
 * One thing stands down in fusion's own tree: the write-tool branch of the
 * guard. It was built because the guard used to protect agents/**, rules/** and
 * .claude-plugin/plugin.json, which is correct for projects USING fusion and
 * wrong when developing fusion itself, where every edit to the plugin's own
 * source would have been blocked and written back. That protection was removed
 * on 2026-08-12 and the stand-down outlived it; the call site says what it now
 * covers. A second stand-down governed the churn heatmap in `tracker.ts` and
 * went with the heatmap on 2026-08-15.
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
 *
 * `isFusionPluginRoot(dir)` asks about a directory the caller names. It has no
 * caller of its own today — `isFusionPluginCwd()` is a call of it with
 * `process.cwd()` — and it is kept as the entry point rather than folded away
 * because the rule below is what decides which of the two a future caller wants,
 * and a mechanism that has to invent the root-anchored form for itself will get
 * that decision wrong. Its last caller was the churn stand-down in `tracker.ts`,
 * which asked about the workbench root because `25c5454` had moved churn's keys
 * there; the cost of leaving that one at cwd was measured, in the since-deleted
 * `lib/__tests__/churn-key-anchor.test.ts`.
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
 * While two callers existed they therefore asked about DIFFERENT directories,
 * and that was correct rather than a drift to unify: `guard.ts`'s verdict is
 * computed in cwd's coordinate space and churn's keys were computed in the
 * root's. One caller is left, and the rule is what the next one is measured
 * against.
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

/**
 * Self-detection: does a named directory carry the fusion plugin's own manifest?
 *
 * ## Nothing under `hooks/` calls this module, and that is the decided state
 *
 * Both mechanisms it once served are gone. The write-tool branch of `guard.ts`
 * stood down here, for a protected-path protection removed on 2026-08-12, and
 * outlived it; the churn heatmap in `tracker.ts` stood down here too and went
 * with the heatmap on 2026-08-15. When `guard.ts` stopped deciding anything at
 * all, the write-tool stand-down had no subject left and the cwd-anchored entry
 * point, `isFusionPluginCwd()`, went with it. Decision
 * `260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`
 * answers this as option 3, dissolution: the stand-down and the cwd entry point
 * go, `isFusionPluginRoot(dir)` stays, and this header says why.
 *
 * It is kept for the rule it carries, not against a caller anyone can name.
 * Deleting it would delete the rule with it, and the rule is the expensive half.
 *
 * ## The rule
 *
 * A stand-down is evaluated in the coordinate space the mechanism keys its state
 * by. A root-anchored mechanism given a cwd-anchored stand-down misses every
 * session started one directory down; a cwd-anchored mechanism given a
 * root-anchored one is the reverse hole. Both halves of that were measured, on
 * the protected-path measurement and again on churn. `CLAUDE.md` states the rule
 * and both measurements in full; this header cites rather than restates them.
 *
 * The next mechanism inside `hooks/` that needs a stand-down needs one of two
 * forms, and choosing the wrong one is invisible until somebody starts a session
 * in a subdirectory. `isFusionPluginRoot(dir)` is the root-anchored form, ready
 * to be called with whatever directory that mechanism keys its state by — the
 * workbench root, for anything resolved through `findWorkbenchRoot()`. A caller
 * that genuinely keys by the working directory passes `process.cwd()` to the
 * same function; that is all the deleted entry point ever did, minus a
 * process-wide cache that made it untestable in a single process.
 *
 * The shell side is `bin/fusion-plugin-cwd`, which is a live helper with three
 * consumers of its own rather than a second copy of this file. It answers the
 * cwd-anchored question for `bin/fusion-rules`, `bin/fusion-paths` and
 * `bin/fusion-source-root`; nothing here is paired with it any more, and neither
 * side has to move when the other changes.
 *
 * Heuristic, unchanged since the module was written: a directory holding a
 * `.claude-plugin/plugin.json` whose TOP-LEVEL `name` field is `"fusion"` is the
 * fusion plugin's own source tree.
 */

import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

/**
 * Does `dir` itself carry a fusion plugin manifest?
 *
 * Uncached, because the caller chooses the directory and two callers may choose
 * differently within one process. The read is one `existsSync` plus one small
 * `JSON.parse`, on a path that is almost always absent.
 */
export function isFusionPluginRoot(dir: string): boolean {
  const manifestPath = resolve(dir, ".claude-plugin", "plugin.json");
  if (!existsSync(manifestPath)) return false;

  try {
    const pkg = JSON.parse(readFileSync(manifestPath, "utf-8")) as {
      name?: string;
    };
    return pkg.name === "fusion";
  } catch {
    return false;
  }
}

/**
 * Self-detection: is the guard running inside the fusion plugin's own repo?
 *
 * The guard protects agents/**, rules/**, skills/**, .claude-plugin/plugin.json
 * etc. This is correct for projects USING fusion, but wrong when developing
 * fusion itself — every edit to the plugin's own source would be blocked.
 *
 * Heuristic: if process.cwd() contains a .claude-plugin/plugin.json whose
 * "name" field is "fusion", we are in the fusion plugin's own source tree
 * and the guard should stand down.
 */
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";
let cached;
export function isFusionPluginCwd() {
    if (cached !== undefined)
        return cached;
    const manifestPath = resolve(process.cwd(), ".claude-plugin", "plugin.json");
    if (!existsSync(manifestPath)) {
        cached = false;
        return false;
    }
    try {
        const pkg = JSON.parse(readFileSync(manifestPath, "utf-8"));
        cached = pkg.name === "fusion";
    }
    catch {
        cached = false;
    }
    return cached;
}

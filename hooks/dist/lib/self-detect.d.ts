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
export declare function isFusionPluginCwd(): boolean;

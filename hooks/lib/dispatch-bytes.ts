/**
 * What one dispatch actually loads, in bytes, measured at the dispatch.
 *
 * ## What the fields are and why they ride the row
 *
 * A dispatch's context cost is three components and no others: the agent
 * prompt, the rules `bin/fusion-rules` emits to that agent, and the project's
 * `CLAUDE.md`. `rules-emission-golden.test.ts` bounds that same triple as the
 * per-dispatch-path total, armed at the fifteen pre-cut figures. The bound reads
 * the tree; these fields read the dispatch, so a project that is not this one
 * gets the same figure without carrying a baseline map of fusion's.
 *
 * The four counts go on `task_start` and on nothing else. `task_done` names the
 * same dispatch and would carry the same numbers a second time, at a second
 * measurement's cost, for a reader that already has them.
 *
 * ## The rule count runs the helper, and there is no second emission list
 *
 * `bin/fusion-rules <agent>` IS the emission list. A byte count that reproduced
 * the list here would be a second implementation of it, drifting from the first
 * on the next conditional emission — which `rules/critical-stance.md` §2 names
 * as the failure mode. So the helper runs, its stdout is the list, and each line
 * is sized. A `skill:<name>` pointer names no file and is skipped.
 *
 * The helper is resolved the way an agent's own Setup resolves it —
 * `$FUSION_PLUGIN_ROOT/bin/fusion-rules` when that exists, else relative to this
 * module — and it is run with the workbench root as its working directory and
 * the environment untouched. That is deliberate rather than convenient: the
 * helper reads `./rules`, `./.claude/rules`, `./CLAUDE.md` and
 * `./fusion-workbench/stilwerk` relative to cwd, and prefers the work tree's
 * rules when cwd is the plugin's own repository. Reproducing the agent's call
 * exactly is the only way this measures what the agent will be handed.
 *
 * ## The memo, and what invalidates it
 *
 * One subprocess per dispatch would be paid on the hottest path a session has.
 * The result is memoised in `.guard-state/rule-sizes.json` under the key the
 * plan names — the agent, the plugin root, and the newest mtime under the rule
 * directories — so a second dispatch of the same agent with nothing changed
 * spawns nothing. `dispatch-bytes.test.ts` proves the warm path by counting the
 * runner's calls through a stub rather than asserting it in prose.
 *
 * The mtime scan covers four directories and one file, and the last two are the
 * extension this module makes to the plan's phrase, stated rather than assumed.
 * `fusion-workbench/stilwerk` is scanned because the voice profiles are emitted
 * by the same helper and are part of what a dispatch loads. `CLAUDE.md` is
 * scanned because its two language declarations decide WHICH profile is emitted,
 * so an edit there can change the emission without touching a rule file. Both
 * plugin candidates for the rules directory are scanned — the installed copy's
 * and the project's own — because in the plugin's own repository the helper
 * reads the second, and asking which would mean a second implementation of the
 * work-tree criterion.
 *
 * Directories are scanned one level deep and never recursively. That is not a
 * shortcut: `bin/fusion-rules` globs `<dir>/*.md` and reads no subdirectory, so
 * a deeper walk would invalidate the memo for files no dispatch can load.
 *
 * ## Absent, never zero — and where the line falls
 *
 * A helper that is absent or exits non-zero means the rule cost is UNKNOWN.
 * `bytes_rules` and `bytes_total` are then absent keys and one advisory says so,
 * because a zero there would read as a dispatch that loaded no rules — which is
 * a figure, and a wrong one.
 *
 * A file that does not exist is a different answer and is 0. A project with no
 * `CLAUDE.md` loads no `CLAUDE.md`, and 0 is the true count of what it cost.
 * Only a stat that FAILS on a file that exists is unresolved, and that makes its
 * own key absent and takes the total with it.
 *
 * ## The baseline is the project's own
 *
 * The first row a project writes for an agent records that agent's total in
 * `.guard-state/byte-baseline.json`; every later row carries `bytes_delta`
 * against it. The arming row carries no `bytes_delta` — it is what the delta
 * would be measured from, and a 0 there would not be distinguishable from a
 * dispatch that changed nothing.
 *
 * Entries are per agent inside a per-project file. A delta between two different
 * agents' totals compares two dispatch paths and means nothing; "per-project"
 * is about whose figures they are, which is the point — a consuming project is
 * measured against itself and never against fusion's.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isStateObject, loadGuardState, saveGuardState } from "./guard-state-file.js";

/** The four counts plus the delta, in the order they appear on the row. */
export interface DispatchByteFields {
  bytes_prompt?: number;
  bytes_rules?: number;
  bytes_claude_md?: number;
  bytes_total?: number;
  bytes_delta?: number;
}

/**
 * How the rule emission is obtained. A parameter rather than a direct call, so
 * `dispatch-bytes.test.ts` can count the subprocesses the warm path claims not
 * to spawn instead of asserting the claim in prose.
 */
export type RuleEmissionRunner = (helper: string, agent: string, cwd: string) => string;

/** The memo file and the baseline file, under `.guard-state/`. */
export const RULE_SIZES_FILE = "rule-sizes.json";
export const BYTE_BASELINE_FILE = "byte-baseline.json";

/** Stable prefix for the advisory an unmeasurable rule emission earns. */
export const DISPATCH_BYTES_ADVISORY =
  "dispatch-bytes: the rule emission could not be measured";

/** One memo entry: what this agent's emission weighed, and under what key. */
interface RuleSizeEntry {
  pluginRoot: string;
  stamp: number;
  bytes: number;
}

/**
 * `bin/fusion-rules`, resolved as an agent's own Setup resolves it, or null.
 *
 * The env comes first because that is the copy the agent will run; the
 * module-relative fall-back is what keeps a test and a checkout that never
 * exported the variable measurable at all. The returned `root` is the directory
 * the executable was found under, so the memo key and the run agree by
 * construction rather than by a second resolution.
 */
export function resolveRulesHelper(): { root: string; helper: string } | null {
  const candidates: string[] = [];
  const fromEnv = process.env.FUSION_PLUGIN_ROOT;
  if (fromEnv) candidates.push(fromEnv);
  // dist layout: <plugin>/hooks/dist/lib/dispatch-bytes.js → <plugin>
  candidates.push(resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", ".."));
  for (const root of candidates) {
    const helper = resolve(root, "bin", "fusion-rules");
    if (existsSync(helper)) return { root, helper };
  }
  return null;
}

/** One file's size, or 0 when it does not exist, or undefined when unreadable. */
function sizeOf(path: string): number | undefined {
  if (!existsSync(path)) return 0;
  try {
    return statSync(path).size;
  } catch {
    return undefined;
  }
}

/** A path's mtime, or 0 when it is absent or unreadable. */
function mtimeOf(path: string): number {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return 0;
  }
}

/**
 * The newest mtime across everything the emission is a function of. See the
 * header's `## The memo` for which paths those are and why each is in the set.
 */
export function emissionStamp(root: string, pluginRoot: string): number {
  const dirs = [
    resolve(pluginRoot, "rules"),
    resolve(root, "rules"),
    resolve(root, ".claude", "rules"),
    resolve(root, "fusion-workbench", "stilwerk"),
  ];
  let newest = mtimeOf(resolve(root, "CLAUDE.md"));
  for (const dir of dirs) {
    const dirStamp = mtimeOf(dir);
    if (dirStamp > newest) newest = dirStamp;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const stamp = mtimeOf(resolve(dir, entry));
      if (stamp > newest) newest = stamp;
    }
  }
  return newest;
}

/** The default runner: one `bin/fusion-rules <agent>` in the project root. */
const runRulesHelper: RuleEmissionRunner = (helper, agent, cwd) =>
  execFileSync(helper, [agent], {
    cwd,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "ignore"],
  });

/**
 * Sum the emitted set. A `skill:` pointer names no file; a relative path is
 * joined to the project root, which is the directory the helper resolved it
 * against.
 */
function sumEmission(root: string, stdout: string): number {
  let total = 0;
  for (const raw of stdout.split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("skill:")) continue;
    total += sizeOf(resolve(root, line)) ?? 0;
  }
  return total;
}

/** Coerce the memo file into a usable map; anything malformed reads as empty. */
function coerceRuleSizes(value: unknown): Record<string, RuleSizeEntry> {
  if (!isStateObject(value)) return {};
  const out: Record<string, RuleSizeEntry> = {};
  for (const [agent, entry] of Object.entries(value)) {
    if (!isStateObject(entry)) continue;
    const { pluginRoot, stamp, bytes } = entry as Record<string, unknown>;
    if (typeof pluginRoot === "string" && typeof stamp === "number" && typeof bytes === "number") {
      out[agent] = { pluginRoot, stamp, bytes };
    }
  }
  return out;
}

/** Coerce the baseline file: agent → the total its arming row recorded. */
function coerceBaseline(value: unknown): Record<string, number> {
  if (!isStateObject(value)) return {};
  const out: Record<string, number> = {};
  for (const [agent, total] of Object.entries(value)) {
    if (typeof total === "number" && Number.isFinite(total)) out[agent] = total;
  }
  return out;
}

/**
 * The rule emission's size for one agent, memoised. `undefined` means the
 * measurement failed and the caller owes an advisory — never that it was zero.
 */
export function ruleBytes(
  root: string,
  agent: string,
  run: RuleEmissionRunner = runRulesHelper,
): number | undefined {
  const resolved = resolveRulesHelper();
  if (resolved === null) return undefined;

  const stamp = emissionStamp(root, resolved.root);
  const memo = loadGuardState(RULE_SIZES_FILE, coerceRuleSizes, root);
  const hit = memo[agent];
  if (hit !== undefined && hit.pluginRoot === resolved.root && hit.stamp === stamp) {
    return hit.bytes;
  }

  let stdout: string;
  try {
    stdout = run(resolved.helper, agent, root);
  } catch {
    // A non-zero exit is an unknown emission, not an empty one. The failure is
    // deliberately NOT memoised: a memoised failure would suppress the advisory
    // and outlive the condition that caused it.
    return undefined;
  }

  const bytes = sumEmission(root, stdout);
  memo[agent] = { pluginRoot: resolved.root, stamp, bytes };
  try {
    saveGuardState(RULE_SIZES_FILE, memo, root);
  } catch {
    // An unwritable memo costs a subprocess next time and nothing else.
  }
  return bytes;
}

/** What one measurement produced: the row's fields, and whether to advise. */
export interface DispatchByteMeasurement {
  fields: DispatchByteFields;
  /** Set when the rule emission could not be measured. */
  advisory?: string;
}

/**
 * Measure one dispatch, arming or reading the project's own baseline.
 *
 * Called only after the row's gate has admitted it, so a dispatch that writes
 * no row pays for none of this.
 */
export function measureDispatchBytes(
  root: string,
  agent: string,
  run: RuleEmissionRunner = runRulesHelper,
): DispatchByteMeasurement {
  const pluginRoot = resolveRulesHelper()?.root;
  const promptBytes =
    pluginRoot === undefined ? undefined : sizeOf(resolve(pluginRoot, "agents", `${agent}.md`));
  const claudeMdBytes = sizeOf(resolve(root, "CLAUDE.md"));
  const rulesBytes = ruleBytes(root, agent, run);

  const fields: DispatchByteFields = {
    ...(promptBytes !== undefined && { bytes_prompt: promptBytes }),
    ...(rulesBytes !== undefined && { bytes_rules: rulesBytes }),
    ...(claudeMdBytes !== undefined && { bytes_claude_md: claudeMdBytes }),
  };

  if (rulesBytes === undefined) {
    return {
      fields,
      advisory:
        `${DISPATCH_BYTES_ADVISORY}; bytes_rules and bytes_total are absent from the ` +
        `task_start row for ${agent}, and no baseline is armed or read.`,
    };
  }
  if (promptBytes === undefined || claudeMdBytes === undefined) {
    // One component that exists but will not stat. The two counts that did
    // resolve stay on the row; a total summing over a hole would not be one.
    return { fields };
  }

  const total = promptBytes + rulesBytes + claudeMdBytes;
  fields.bytes_total = total;

  const baseline = loadGuardState(BYTE_BASELINE_FILE, coerceBaseline, root);
  const armed = baseline[agent];
  if (armed === undefined) {
    baseline[agent] = total;
    try {
      saveGuardState(BYTE_BASELINE_FILE, baseline, root);
    } catch {
      // An unarmed baseline costs later rows their delta and nothing else.
    }
  } else {
    fields.bytes_delta = total - armed;
  }
  return { fields };
}

/**
 * The basename a dispatch prompt claims, or undefined when it claims none.
 *
 * Read off `tool_input.prompt`, the field the dispatch prompt arrives in. The
 * value is reduced to a basename because that is what the field is defined to
 * carry, and surrounding backticks are stripped because every basename this
 * project writes in prose is written inside them.
 *
 * **This does not read the backlog store.** The line the dispatch carries names
 * one item; a scan would return a SET, and a set rendered in a panel is the work
 * queue arriving through another door. The item file stays the only authority on
 * its own status and claim.
 */
export function workItemFromPrompt(toolInput: Record<string, unknown> | undefined): string | undefined {
  const prompt = toolInput?.prompt;
  if (typeof prompt !== "string" || prompt === "") return undefined;
  const match = /^\*\*Work-item:\*\*[ \t]*(.+?)[ \t]*$/m.exec(prompt);
  if (match === null) return undefined;
  const value = match[1].replace(/^`+|`+$/g, "").trim();
  const basename = value.slice(value.lastIndexOf("/") + 1);
  return basename === "" ? undefined : basename;
}

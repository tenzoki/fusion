/**
 * Integration harness for the compliance guard — plan step 6.
 *
 * ## Why this exists
 *
 * The write guard STANDS DOWN when `process.cwd()` is the fusion plugin's own
 * repository (`lib/self-detect.ts`). Every denial assertion written naively
 * inside this repository therefore passes vacuously: the check under test does
 * not run at all. A test that cannot fail is worse than no test, because it
 * reports coverage it does not have.
 *
 * `isFusionPluginCwd()` resolves `.claude-plugin/plugin.json` against
 * `process.cwd()` with NO upward walk, and caches the answer in a module-level
 * variable. Two consequences shape everything below:
 *
 *   1. Any directory that is not ITSELF a plugin root gets the full write
 *      guard, however deep inside this repository it sits. So a temporary
 *      project root is enough — no container, no fixture repo.
 *   2. One process can only ever answer one way. So each case must be a fresh
 *      SUBPROCESS. That is a requirement, not an implementation detail.
 *
 * ## The macOS symlink trap
 *
 * `mkdtemp` under `os.tmpdir()` hands back `/var/folders/…` on macOS while the
 * child process's `process.cwd()` reports `/private/var/folders/…`. When the
 * two differ, `normalizeToRelative` in guard.ts cannot relativize an absolute
 * `file_path` built from the unresolved root, the path matches no relative
 * glob, and a protected-path case SILENTLY ALLOWS — the assertion passes for
 * the wrong reason. `makeProject` resolves the root with `realpathSync` and
 * then ASSERTS the result is its own realpath, so a future edit that drops the
 * resolution fails loudly here rather than quietly weakening every caller.
 *
 * The same project also carries a deliberate symlinked `alias` of its root, so
 * a suite can reproduce the trap on purpose and prove the vacuous pass is a
 * real mechanism rather than a story (see `guard-bash-integration.test.ts`,
 * "the macOS realpath trap").
 *
 * ## Fail loud, never skip
 *
 * `runGuard` treats a `[guard] Error:` on stderr as a harness failure. The
 * guard fails OPEN on an unexpected exception — it prints that line and then
 * emits `{}`. Left unchecked, a crashed guard would satisfy every allow-side
 * assertion in the suite. Likewise a missing guard entry throws rather than
 * skipping: `tsx` and `vitest` come from the same `node_modules`, so "tsx is
 * absent" cannot happen while the suite runs, and a skip on that condition
 * could only ever hide a real problem.
 */

import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** `hooks/` — the directory holding guard.ts, config.json and node_modules. */
export const HOOKS_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

/** The plugin repository root. */
export const REPO_ROOT = resolve(HOOKS_DIR, "..");

/* ------------------------------------------------------------------ *
 * Guard entry point
 * ------------------------------------------------------------------ */

export interface GuardEntry {
  bin: string;
  args: string[];
  /** Human-readable, for failure messages. */
  label: string;
}

/**
 * How to spawn the guard.
 *
 * Default is `tsx guard.ts` — the TypeScript source, which is what this
 * Circle's steps are editing. Set `FUSION_GUARD_ENTRY=dist` to run the
 * committed `dist/guard.js` instead: that is the artifact production actually
 * executes (`hooks/hooks.json`), so once `dist` is rebuilt the same suite can
 * be pointed at the shipped build without touching a test.
 */
export function guardEntry(): GuardEntry {
  return hookEntry("guard");
}

/**
 * How to spawn the PostToolUse hook.
 *
 * The protected-path measurement is a PAIR — `guard.ts` records the
 * fingerprint, `tracker.ts` compares it — so a case that asserts anything about
 * reverting, halting or the explanation has to run both, in order, against the
 * same project. Neither half means anything alone.
 */
export function trackerEntry(): GuardEntry {
  return hookEntry("tracker");
}

/** Shared resolution for both hook entry points. See `guardEntry`. */
function hookEntry(name: "guard" | "tracker"): GuardEntry {
  const mode = process.env.FUSION_GUARD_ENTRY ?? "tsx";

  if (mode === "dist") {
    const compiled = resolve(HOOKS_DIR, `dist/${name}.js`);
    if (!existsSync(compiled)) {
      throw new Error(
        `FUSION_GUARD_ENTRY=dist but ${compiled} does not exist. Run \`npm run build\` in hooks/ first.`,
      );
    }
    return { bin: process.execPath, args: [compiled], label: `dist/${name}.js` };
  }

  if (mode !== "tsx") {
    throw new Error(
      `FUSION_GUARD_ENTRY must be "tsx" or "dist", got ${JSON.stringify(mode)}.`,
    );
  }

  const tsxBin = resolve(HOOKS_DIR, "node_modules/.bin/tsx");
  if (!existsSync(tsxBin)) {
    throw new Error(
      `${tsxBin} not found. tsx is a declared devDependency of hooks/ — run \`npm install\`.`,
    );
  }
  return {
    bin: tsxBin,
    args: [resolve(HOOKS_DIR, `${name}.ts`)],
    label: `tsx ${name}.ts`,
  };
}

/* ------------------------------------------------------------------ *
 * Throwaway project roots
 * ------------------------------------------------------------------ */

export interface Project {
  /** The project root, guaranteed to equal its own realpath. */
  root: string;
  /**
   * A symlink pointing at `root`, deliberately NOT resolved. Only for the
   * tests that reproduce the unresolved-path trap on purpose.
   */
  alias: string;
  /** True when this root carries a `.claude-plugin/plugin.json` naming fusion. */
  isPluginRoot: boolean;
}

/** Files every throwaway project starts with. Relative paths, root-anchored. */
const SEED_FILES: Record<string, string> = {
  // Protected by the shipped config (`rules/**`, `agents/**`, `skills/**`).
  "rules/x.md": "# a rule\n",
  "agents/coder.md": "# an agent\n",
  "skills/demo/SKILL.md": "# a skill\n",
  // The retirement destination a rule-file move needs, and the second rule
  // root. Both exist in every project so a case can name them without first
  // having to build the directory it wants to write into.
  "rules/retired/.keep": "",
  ".claude/rules/local.md": "# a project-wide rule\n",
  // Unprotected, for the allow side.
  "notes.txt": "notes\n",
  "build/out.js": "// built\n",
  "docs/.keep": "",
  // The marker `findWorkbenchRoot()` looks for. Without it every guard-state
  // write is a silent no-op and the file-level assertions prove nothing.
  "fusion-workbench/.fusion-setup": '{"harness":true}\n',
};

function seed(root: string, files: Record<string, string>): void {
  for (const [rel, content] of Object.entries(files)) {
    const abs = resolve(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf-8");
  }
}

/** The state a freshly-seeded `escalation.json` starts from. */
const EMPTY_ESCALATION: EscalationSnapshot = {
  haltActive: false,
  consecutiveBlocks: 0,
  lastBlockTimestamp: null,
  recentEvents: [],
};

function seedEscalation(
  root: string,
  partial: Partial<EscalationSnapshot>,
): void {
  const dir = stateDir(root);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, "escalation.json"),
    JSON.stringify({ ...EMPTY_ESCALATION, ...partial }, null, 2),
    "utf-8",
  );
}

export interface ProjectOptions {
  /** Add `.claude-plugin/plugin.json` naming fusion, so self-detect stands down. */
  plugin?: boolean;
  /**
   * Make the project a git repository with every seeded file committed.
   *
   * Required by any case that asserts on the protected-path measurement, whose
   * revert is `git checkout HEAD -- <path>`. Without a repository every change
   * takes the "not known to git" branch, so a case that meant to prove the
   * restore would silently prove the report-only path instead — passing for the
   * wrong reason, which is the failure this whole harness exists to prevent.
   *
   * Leave it off to test that branch on purpose.
   */
  git?: boolean;
  /**
   * Extra project files, merged OVER `SEED_FILES`, so a case can add a file
   * (`fusion-guard.json`) or replace a seeded one. Paths are root-relative;
   * parent directories are created.
   */
  files?: Record<string, string>;
  /**
   * Guard state to write BEFORE the guard runs, merged over an empty snapshot.
   * `{ haltActive: true }` is a halted project without the three real denials
   * it would otherwise take to reach one — which also decouples the case from
   * the escalation threshold.
   */
  escalation?: Partial<EscalationSnapshot>;
}

/**
 * Create a throwaway project root. Caller owns cleanup — prefer `withProject`.
 *
 * `plugin: true` adds `.claude-plugin/plugin.json` naming fusion, which is the
 * single condition `isFusionPluginCwd()` tests. That root reproduces the
 * stand-down without borrowing the real repository, whose `.guard-state/`
 * counters a test must never touch.
 */
export function makeProject(opts: ProjectOptions = {}): Project {
  const base = realpathSync(mkdtempSync(resolve(tmpdir(), "fusion-guard-")));
  const root = resolve(base, "project");
  const alias = resolve(base, "alias");

  mkdirSync(root, { recursive: true });
  seed(root, { ...SEED_FILES, ...(opts.files ?? {}) });

  if (opts.escalation !== undefined) {
    seedEscalation(root, opts.escalation);
  }

  if (opts.plugin === true) {
    mkdirSync(resolve(root, ".claude-plugin"), { recursive: true });
    writeFileSync(
      resolve(root, ".claude-plugin", "plugin.json"),
      JSON.stringify({ name: "fusion", version: "0.0.0-harness" }) + "\n",
      "utf-8",
    );
  }

  if (opts.git === true) {
    initGitRepo(root);
  }

  symlinkSync(root, alias);

  // The invariant the whole harness rests on. If `root` ever stops being its
  // own realpath, absolute-path cases stop denying and start passing vacuously
  // — the exact failure this assertion exists to make impossible.
  if (realpathSync(root) !== root) {
    throw new Error(
      `harness project root is not a resolved real path: ${root} → ${realpathSync(root)}`,
    );
  }
  // And the alias must genuinely be a second, unresolved name for it, or the
  // trap tests would be asserting nothing.
  if (alias === root || realpathSync(alias) !== root) {
    throw new Error(
      `harness alias is not an unresolved alias of the root: ${alias} → ${realpathSync(alias)}`,
    );
  }

  return { root, alias, isPluginRoot: opts.plugin === true };
}

/**
 * Turn a seeded project into a git repository with one commit holding
 * everything.
 *
 * Every identity and hook setting is passed per-invocation rather than read
 * from the machine, so the repository builds identically on a developer laptop
 * with a global `commit.gpgsign` or a `core.hooksPath` and in CI with no git
 * identity configured at all. `fusion-workbench/` is committed along with the
 * rest: the seeded `.fusion-setup` marker is what makes the guard write state
 * here, and excluding it would only add a difference between this project and a
 * real one.
 */
function initGitRepo(root: string): void {
  const git = (...args: string[]): void => {
    const run = spawnSync("git", args, {
      cwd: root,
      encoding: "utf-8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "fusion harness",
        GIT_AUTHOR_EMAIL: "harness@example.invalid",
        GIT_COMMITTER_NAME: "fusion harness",
        GIT_COMMITTER_EMAIL: "harness@example.invalid",
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_SYSTEM: "/dev/null",
      },
    });
    if (run.status !== 0) {
      throw new Error(
        `harness git ${args.join(" ")} failed (${run.status}):\n${run.stderr}`,
      );
    }
  };

  git("init", "--quiet", "--initial-branch=main");
  git("add", "-A");
  git("commit", "--quiet", "--no-verify", "-m", "harness baseline");
}

function disposeProject(project: Project): void {
  rmSync(dirname(project.root), { recursive: true, force: true });
}

/**
 * Run `fn` against a fresh throwaway project, cleaned up afterwards.
 *
 * `opts` is optional and forwarded to `makeProject`, so every existing call
 * site keeps its meaning: `withProject(fn)` is still a default project.
 */
export function withProject<T>(
  fn: (project: Project) => T,
  opts: Omit<ProjectOptions, "plugin"> = {},
): T {
  const project = makeProject(opts);
  try {
    return fn(project);
  } finally {
    disposeProject(project);
  }
}

/**
 * Run `fn` against a fresh throwaway root that LOOKS like the fusion plugin's
 * own source tree, so the self-detect stand-down applies.
 */
export function withPluginProject<T>(
  fn: (project: Project) => T,
  opts: Omit<ProjectOptions, "plugin"> = {},
): T {
  const project = makeProject({ ...opts, plugin: true });
  try {
    return fn(project);
  } finally {
    disposeProject(project);
  }
}

/**
 * `fusion-guard.json` content for a `files` map.
 *
 * An object is stringified; a string is written verbatim, so a case can supply
 * text that is deliberately not JSON and assert what the loader does with it.
 */
export function projectConfig(value: object | string): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n";
}

/* ------------------------------------------------------------------ *
 * Running the hook
 * ------------------------------------------------------------------ */

export interface GuardResult {
  /** `"block"` when denied; absent when allowed (the guard emits a bare `{}`). */
  decision?: string;
  reason?: string;
}

/** The PreToolUse envelope Claude Code sends. */
interface HookInput {
  session_id: string;
  hook_event_name: string;
  tool_name: string;
  tool_input: Record<string, unknown>;
}

/**
 * Every environment variable a guard verdict depends on, stripped from the
 * child unless a case asks for it by passing it in `overrides`.
 *
 * Without the strip, a developer who exports one of these in their own shell
 * gets different verdicts from everyone else, and the half of every case that
 * depends on the variable being absent silently stops testing anything. The
 * failure is invisible — the suite is green on both machines, and only one of
 * them is checking the property.
 *
 * The first three are PERMISSIONS: `FUSION_ALLOW_RULES_WRITE` gates the
 * rules-write exemption exactly as the two branch variables gate the branch
 * policy, so an exported copy would void the flag-unset half of the criteria
 * each exemption is meant to prove.
 *
 * `CDPATH` is not a permission and is stripped for a stronger reason. It moves
 * the verdict in the DENYING direction (a bare-word `cd` becomes unknowable —
 * `bash-mutation-guard.ts`, `ambientCdpathIsSet`), and it is a variable real
 * people really do export from a shell profile. Left in place it would deny
 * commands on a developer's machine that allow on everyone else's — including
 * the allow-side rows that exist to bound the cost of every OTHER change to the
 * directory model.
 */
const STRIPPED_ENV_VARS = [
  "FUSION_ALLOW_BRANCH_SWITCH",
  "FUSION_ALLOW_WORKTREE",
  "FUSION_ALLOW_RULES_WRITE",
  "CDPATH",
] as const;

/**
 * The environment `runGuard` hands to the child, exported so a case can assert
 * on the strip itself. Overrides are applied last, so a case that deliberately
 * sets one of the stripped variables still gets it.
 */
export function childEnv(
  overrides: Record<string, string> = {},
): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const name of STRIPPED_ENV_VARS) delete env[name];
  return { ...env, ...overrides };
}

/**
 * Spawn the guard as a real subprocess with `cwd` set to `root`, feed it one
 * PreToolUse payload, and return the parsed verdict.
 *
 * The permission env vars are stripped unless a case passes them — see
 * `childEnv`.
 */
export function runGuard(
  root: string,
  toolName: string,
  toolInput: Record<string, unknown>,
  overrides: Record<string, string> = {},
): GuardResult {
  const entry = guardEntry();

  const input: HookInput = {
    session_id: "guard-harness",
    hook_event_name: "PreToolUse",
    tool_name: toolName,
    tool_input: toolInput,
  };

  const run = spawnSync(entry.bin, entry.args, {
    cwd: root,
    encoding: "utf-8",
    env: childEnv(overrides),
    input: JSON.stringify(input),
  });

  if (run.error) {
    throw new Error(`harness could not spawn ${entry.label}: ${run.error}`);
  }
  if (run.status !== 0) {
    throw new Error(
      `${entry.label} exited ${run.status}\nstderr:\n${run.stderr}`,
    );
  }
  // The guard fails OPEN: an unexpected exception prints this line and then
  // emits `{}`. Without this check a crashed guard would satisfy every
  // allow-side assertion in the suite.
  if (run.stderr.includes("[guard] Error:")) {
    throw new Error(`guard failed open (fail-open path taken):\n${run.stderr}`);
  }

  try {
    return JSON.parse(run.stdout) as GuardResult;
  } catch {
    throw new Error(
      `${entry.label} emitted unparseable stdout: ${JSON.stringify(run.stdout)}`,
    );
  }
}

/** Run one Bash tool call through the guard. */
export function runBash(
  root: string,
  command: string,
  overrides: Record<string, string> = {},
): GuardResult {
  return runGuard(root, "Bash", { command }, overrides);
}

/** Run one write-tool call (Edit by default) through the guard. */
export function runWrite(
  root: string,
  filePath: string,
  toolName = "Edit",
  overrides: Record<string, string> = {},
): GuardResult {
  return runGuard(root, toolName, { file_path: filePath }, overrides);
}

/* ------------------------------------------------------------------ *
 * The PostToolUse side
 * ------------------------------------------------------------------ */

/** What `tracker.ts` wrote to stdout. */
export interface TrackerResult {
  hookSpecificOutput?: {
    hookEventName?: string;
    additionalContext?: string;
  };
}

/**
 * Spawn the tracker as a real subprocess and feed it one PostToolUse payload.
 *
 * Same subprocess discipline as `runGuard`, for the same reason: the self-detect
 * answer is cached per process, so a stand-down assertion written in-process
 * would pass vacuously.
 */
export function runTracker(
  root: string,
  toolName: string,
  toolInput: Record<string, unknown>,
  overrides: Record<string, string> = {},
): TrackerResult {
  const entry = trackerEntry();

  const run = spawnSync(entry.bin, entry.args, {
    cwd: root,
    encoding: "utf-8",
    env: childEnv(overrides),
    input: JSON.stringify({
      session_id: "guard-harness",
      hook_event_name: "PostToolUse",
      tool_name: toolName,
      tool_input: toolInput,
    }),
  });

  if (run.error) {
    throw new Error(`harness could not spawn ${entry.label}: ${run.error}`);
  }
  if (run.status !== 0) {
    throw new Error(
      `${entry.label} exited ${run.status}\nstderr:\n${run.stderr}`,
    );
  }
  // The tracker fails OPEN exactly as the guard does, and a crashed tracker
  // would satisfy every "nothing was reverted" assertion in the suite.
  if (run.stderr.includes("[tracker] Error:")) {
    throw new Error(`tracker failed open (fail-open path taken):\n${run.stderr}`);
  }

  try {
    return JSON.parse(run.stdout) as TrackerResult;
  } catch {
    throw new Error(
      `${entry.label} emitted unparseable stdout: ${JSON.stringify(run.stdout)}`,
    );
  }
}

/**
 * One complete tool call: PreToolUse, then the effect, then PostToolUse.
 *
 * `effect` stands in for the tool itself and runs BETWEEN the two hooks, which
 * is the only placement that reproduces what the measurement measures. Calling
 * the two hooks around nothing, or doing the write before the guard ran, tests a
 * different mechanism.
 *
 * Returns both verdicts. A case that expects the PreToolUse guard to deny should
 * assert on `pre` and pass an `effect` that does nothing, since a denied tool
 * never runs.
 */
export function runToolCall(
  root: string,
  toolName: string,
  toolInput: Record<string, unknown>,
  effect: () => void,
  overrides: Record<string, string> = {},
): { pre: GuardResult; post: TrackerResult } {
  const pre = runGuard(root, toolName, toolInput, overrides);
  effect();
  const post = runTracker(root, toolName, toolInput, overrides);
  return { pre, post };
}

/* ------------------------------------------------------------------ *
 * Reading back what the guard wrote
 * ------------------------------------------------------------------ */

export interface EscalationSnapshot {
  haltActive: boolean;
  consecutiveBlocks: number;
  lastBlockTimestamp: string | null;
  recentEvents: {
    level: string;
    trigger: string;
    message: string;
    toolName?: string;
    filePath?: string;
  }[];
}

export interface EventLine {
  ts: string;
  event: string;
  tool?: string;
  file?: string;
  detail?: string;
}

function stateDir(root: string): string {
  return resolve(root, "fusion-workbench", ".guard-state");
}

/** `escalation.json`, or null when the guard never wrote it. */
export function readEscalation(root: string): EscalationSnapshot | null {
  const p = resolve(stateDir(root), "escalation.json");
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf-8")) as EscalationSnapshot;
}

/** `events.jsonl` as parsed lines; `[]` when the guard never wrote it. */
export function readEvents(root: string): EventLine[] {
  const p = resolve(stateDir(root), "events.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf-8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as EventLine);
}

/** True once the guard has written anything into `.guard-state/`. */
export function guardStateWritten(root: string): boolean {
  return existsSync(stateDir(root));
}

/** Generous per-case budget: each case is a process start, ~0.2s in practice. */
export const CASE_TIMEOUT = 30_000;

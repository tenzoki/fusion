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

/**
 * The compiled tree a case may SPAWN or COPY.
 *
 * `npm test` compiles into a private staging directory of its own and names it
 * in `FUSION_TEST_DIST` (`scripts/run-tests.mjs`), so a case that runs or
 * copies a compiled artifact is reading a build no other run in this checkout
 * can touch. That is the second half of the answer to
 * `shared/decisions/260811-2009_*_is-the-hooks-suite-meant-to-be-run-concurrently-with-itself-and-if-not-who-serialises-it.md`:
 * the shared `hooks/dist/` is now replaced file by file with `rename(2)` rather
 * than deleted, which is enough for an existence check but not for a `cpSync`
 * of the whole directory, whose one remaining hazard is the build's orphan
 * prune.
 *
 * The fallback is the shared tree, for a bare `npx vitest run` with no build
 * step in front of it. Nothing deletes `hooks/dist/` any more, so the fallback
 * is safe too — it is simply the last build's output rather than this run's.
 */
export const TEST_DIST =
  process.env.FUSION_TEST_DIST !== undefined && process.env.FUSION_TEST_DIST !== ""
    ? resolve(process.env.FUSION_TEST_DIST)
    : resolve(HOOKS_DIR, "dist");

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
 * compiled `guard.js` instead: that is the form production actually executes
 * (`hooks/hooks.json`), so the same suite can be pointed at the build without
 * touching a test. The build it reaches is `TEST_DIST` — this run's own
 * compile under `npm test`, the shipped `hooks/dist/` under a bare `vitest`.
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

/**
 * How to spawn the SessionStart hook.
 *
 * Its whole subject is `process.cwd()`, so every case has to be a fresh
 * subprocess with a real working directory — the same discipline `runGuard`
 * needs for the cached self-detect answer, arrived at from the other side.
 */
export function sessionStartEntry(): GuardEntry {
  return hookEntry("session-start");
}

/**
 * How to spawn the session-state drift reader.
 *
 * Not a hook — `bin/fusion-state-drift` runs it, and `hooks/tracker.ts` runs the
 * same computation in-process on every guarded tool call — but it shares the one
 * property that makes the tsx default matter here rather than being a
 * convenience: its whole subject is a working directory and the workbench root
 * above it, so every case is a subprocess. Spawning the SOURCE by default also
 * keeps the suite independent of the build entirely — which used to be the only
 * defence available, back when `npm run build` deleted `hooks/dist/` and a
 * second session running the suite in the same checkout was observed wiping it
 * mid-run. The build no longer deletes anything (`scripts/build.mjs`), so this
 * is now a convenience again rather than a shield.
 */
export function stateDriftEntry(): GuardEntry {
  return hookEntry("state-drift");
}

export function reviewCoverageEntry(): GuardEntry {
  return hookEntry("review-coverage");
}

/**
 * How to spawn the staging-drift reader.
 *
 * Same class as the two above: `bin/fusion-staging-drift` runs it, and
 * `hooks/tracker.ts` runs the same computation in-process on the tool call
 * where HEAD moved. Its subject is a working directory, a workbench root above
 * it and a git repository around both, so every case is a subprocess.
 */
export function stagingDriftEntry(): GuardEntry {
  return hookEntry("staging-drift");
}

/** Shared resolution for all six entry points. See `guardEntry`. */
function hookEntry(
  name:
    | "guard"
    | "tracker"
    | "session-start"
    | "state-drift"
    | "review-coverage"
    | "staging-drift",
): GuardEntry {
  const mode = process.env.FUSION_GUARD_ENTRY ?? "tsx";

  if (mode === "dist") {
    const compiled = resolve(TEST_DIST, `${name}.js`);
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
  // Ordinary project files. Nothing here is special to the guard: the
  // protected-path half is gone, so `rules/x.md`, `agents/coder.md`,
  // `rules/retired/.keep` and `.claude/rules/local.md` — which seeded every
  // project purely because the shipped list named `rules/**` and `agents/**`,
  // and because the `FUSION_ALLOW_RULES_WRITE` exemption needed rule roots to
  // grant over — went with it. What remains exists so a case can name a file
  // without first having to build the directory it wants to write into.
  //
  // A NOTE FOR WHOEVER ADDS THE NEXT ONE. This map is what every project in the
  // suite starts with, so a file added here is paid for by ~50 test files. Add
  // one only when more than one suite needs it; a single case's operand belongs
  // in that case's own `files` option.
  "skills/demo/SKILL.md": "# a skill\n",
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
   * NOT required by the protected-path measurement any more. Its restore reads
   * the content out of the before-fingerprint, so it works identically in a
   * project that has never been versioned — there is a case that asserts exactly
   * that by omitting this option. What git still buys a case is an independent
   * witness: `git status --porcelain` and `git show :<path>` can say what the
   * working tree and the index hold without asking the guard.
   *
   * (While the restore was `git checkout HEAD -- <path>` this option WAS
   * required, and a case that forgot it proved the report-only branch while
   * looking like it proved the restore.)
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
  git(root, "init", "--quiet", "--initial-branch=main");
  git(root, "add", "-A");
  git(root, "commit", "--quiet", "--no-verify", "-m", "harness baseline");
}

/**
 * Run one git command in `root`, with every identity and config setting passed
 * per invocation. See `initGitRepo` for why none of it is read from the machine.
 */
function git(root: string, ...args: string[]): string {
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
  return run.stdout.trim();
}

/**
 * Make this project's session bookkeeping drift, so the tracker has something
 * to say on every guarded tool call.
 *
 * ## Why a harness capability rather than a fixture in one test file
 *
 * Two suites here are not about session state at all. They are about the
 * PostToolUse reply surviving something — a malformed state file, an unwritable
 * `.guard-state/` — and each needs the tracker to be carrying SOME report in
 * order to observe whether it survived. Both used to borrow the protected-path
 * halt sentence for that, and both had to be re-pointed when it went.
 *
 * Of the three surviving tracker reports, state drift is the only one that
 * fires on every guarded tool call: review coverage needs the payload to be a
 * `.md` file under a `reviews/` store with a session window to measure against,
 * and staging drift needs HEAD to have moved since the previous call. Either
 * would couple a case to a trigger that has nothing to do with its subject.
 *
 * ## What it writes, and why so little
 *
 * A six-line `agentstate.yaml` and three commits past it. `measureStateDrift`
 * reports every row it cannot decide as `unchecked` and leaves it out of the
 * sentence, so the two fields that produce the `progress.commits` row are the
 * whole fixture — the fuller state files in `state-drift.test.ts` and
 * `review-coverage.test.ts` exist because those suites assert on the other rows.
 *
 * THREE commits, not one: the measurement deliberately allows a difference of
 * one as the commit currently in flight, so a smaller fixture would report
 * nothing and every case resting on it would pass vacuously.
 *
 * Requires `git: true` on the project — the divergence is measured against the
 * git history, which is one of the two records the check reads.
 */
export function freezeCommitCount(root: string): void {
  const head = git(root, "rev-parse", "--short", "HEAD");
  writeFileSync(
    resolve(root, "fusion-workbench", "agentstate.yaml"),
    [
      "session:",
      `  git_head_at_start: "${head}"`,
      "",
      "progress:",
      "  commits: 0",
      "",
    ].join("\n"),
    "utf-8",
  );
  for (const n of [1, 2, 3]) {
    writeFileSync(resolve(root, `work-${n}.txt`), `work ${n}\n`, "utf-8");
    git(root, "add", `work-${n}.txt`);
    git(root, "commit", "--quiet", "--no-verify", "-m", `work ${n}`);
  }
}

/**
 * Everything the drift sentence carries, asserted as one — so the two suites
 * that use it as a probe cannot disagree about what "the tracker spoke" means.
 */
export const DRIFT_SENTENCE_MARKERS = [
  "session bookkeeping has drifted",
  "progress.commits",
  "says 0",
] as const;

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
 * A deny that needs no protected path
 * ------------------------------------------------------------------ */

/**
 * The decision-governed deny, packaged for the cases that need A deny rather
 * than a protected-path deny in particular.
 *
 * ## Why this exists
 *
 * Several suites in this directory are not about protected paths at all. They
 * are about something else entirely — a malformed `escalation.json` must not
 * make the guard fail open, a malformed state file must not swallow the
 * tracker's reply, an innocuous `Bash` call must not reset the block counter —
 * and each of them needed A DENY to exist in order to observe its own subject.
 * The nearest deny to hand was `Edit agents/coder.md`, so that is what they
 * reached for.
 *
 * That made their coverage hostage to a mechanism they never meant to test.
 * The plan that removes the protected-path half therefore re-points every such
 * probe here first, before any surgery: the subject of each suite survives the
 * removal, so its probe has to as well.
 *
 * ## What produces the deny
 *
 * CHECK 3 in `guard.ts` — a `decisions` entry whose category has a
 * `categoryPaths` glob matching the written path, at `high` sensitivity. All
 * three keys are ordinary project-settable leaves, so the whole thing is one
 * `fusion-guard.json` in the throwaway project and no production change of any
 * kind.
 *
 * ## Two properties that make it a drop-in
 *
 *   1. **It goes through `recordBlock`**, exactly as the protected-path deny
 *      did, so `consecutiveBlocks`, the halt threshold and the `guard_block`
 *      event behave identically. A case that counted blocks keeps counting.
 *   2. **`GOVERNED_PATH` is matched by no protected pattern.** It is neither
 *      under `agents/`, `rules/` nor `.claude/rules/`, and it is none of the
 *      five literal entries. So a deny on it can only have come from CHECK 3,
 *      and a case using it cannot pass for the protected-path reason by
 *      accident — which is the whole point of moving off that reason.
 */

/** The directory the governing glob covers, for cases that need siblings. */
export const GOVERNED_DIR = "src/api";

/** The path CHECK 3 governs. Deliberately outside every protected pattern. */
export const GOVERNED_PATH = `${GOVERNED_DIR}/service.ts`;

/** A sibling of `GOVERNED_PATH` that the same glob does NOT reach. */
export const UNGOVERNED_PATH = "src/web/page.ts";

/** The category the decision and the glob share. */
export const GOVERNED_CATEGORY = "api";

/** The decision id, which the deny message quotes back. */
export const GOVERNED_DECISION_ID = "260812-1232";

/**
 * The phrase every decision-governed deny opens with, for the cases that assert
 * WHICH deny they got rather than merely that they got one.
 */
export const GOVERNED_DENY_REASON = "affects area governed by";

/** The `fusion-guard.json` object that arms CHECK 3. */
export const GOVERNED_CONFIG = {
  decisions: [
    {
      id: GOVERNED_DECISION_ID,
      category: GOVERNED_CATEGORY,
      statement: "The API surface is governed and changes to it are reviewed.",
    },
  ],
  guard: {
    categoryPaths: { [GOVERNED_CATEGORY]: [`${GOVERNED_DIR}/**`] },
    categorySensitivity: { [GOVERNED_CATEGORY]: "high" },
  },
};

/**
 * The project files that arm CHECK 3, merged over anything a case supplies.
 *
 * The two source files are seeded as well, so a case can perform a real write
 * against either without first building the directory.
 */
export function governedFiles(
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    "fusion-guard.json": projectConfig(GOVERNED_CONFIG),
    [GOVERNED_PATH]: "// governed\n",
    [UNGOVERNED_PATH]: "// not governed\n",
    ...extra,
  };
}

/**
 * `withProject`, with CHECK 3 armed.
 *
 * A caller's own `files` are merged OVER the governed set, so a case can still
 * replace `fusion-guard.json` — which is how the "a project cannot reach this"
 * cases keep working.
 */
export function withGovernedProject<T>(
  fn: (project: Project) => T,
  opts: Omit<ProjectOptions, "plugin"> = {},
): T {
  return withProject(fn, { ...opts, files: governedFiles(opts.files ?? {}) });
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
 * NEITHER OF THE TWO IS READ BY THE GUARD ANY MORE, and both strips stay. The
 * rule this list follows is that a variable which once moved a verdict is not
 * handed back to the child on the strength of the mechanism having gone: the
 * strip costs nothing, and the cost of being wrong is a suite that is green on
 * two machines while only one of them is checking anything.
 *
 * `FUSION_ALLOW_RULES_WRITE` was a PERMISSION: it gated the rules-write
 * exemption, so an exported copy would have voided the flag-unset half of every
 * criterion that exemption was meant to prove. The exemption was deleted with
 * the protected-path half of the guard on 2026-08-12. Two more permission
 * variables stood beside it and gated the git branch policy; they went when it
 * did, which is the precedent for taking this one out — and the difference is
 * that they were removed while the list still had a live entry to justify
 * itself by.
 *
 * `CDPATH` is not a permission and was stripped for a stronger reason: it moved
 * a verdict in the DENYING direction, because a bare-word `cd` became unknowable
 * to the mutation classifier's working-directory model, and it is a variable
 * real people really do export from a shell profile. Left in place it denied
 * commands on one developer's machine that allowed on everyone else's. The
 * classifier and its directory model are gone, so nothing reads `CDPATH` today
 * either.
 */
const STRIPPED_ENV_VARS = ["FUSION_ALLOW_RULES_WRITE", "CDPATH"] as const;

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
 * The SessionStart side
 * ------------------------------------------------------------------ */

/** What `session-start.ts` wrote to stdout. */
export interface SessionStartResult {
  hookSpecificOutput?: {
    hookEventName?: string;
    systemMessage?: string;
  };
}

/**
 * Spawn the SessionStart hook as a real subprocess with `cwd` set to `dir`, and
 * return the parsed verdict.
 *
 * `dir` is an ARBITRARY directory rather than a `Project`, because the case
 * that matters most is a directory that is not a project root — a subdirectory
 * of one, or a directory with no workbench above it at all.
 *
 * No stdin payload is written. The hook reads nothing from stdin (it needs only
 * its own working directory), which is also true of the two `printf` commands
 * `hooks/hooks.json` already runs at SessionStart.
 */
export function runSessionStart(dir: string): SessionStartResult {
  const entry = sessionStartEntry();

  const run = spawnSync(entry.bin, entry.args, {
    cwd: dir,
    encoding: "utf-8",
    env: childEnv(),
  });

  if (run.error) {
    throw new Error(`harness could not spawn ${entry.label}: ${run.error}`);
  }
  if (run.status !== 0) {
    throw new Error(
      `${entry.label} exited ${run.status}\nstderr:\n${run.stderr}`,
    );
  }
  // The hook fails OPEN like its two siblings, emitting `{}` after the marker
  // line. Unchecked, a crashed hook would satisfy every "no warning" assertion
  // in the suite — which is exactly two thirds of the cases.
  if (run.stderr.includes("[session-start] Error:")) {
    throw new Error(
      `session-start failed open (fail-open path taken):\n${run.stderr}`,
    );
  }

  try {
    return JSON.parse(run.stdout) as SessionStartResult;
  } catch {
    throw new Error(
      `${entry.label} emitted unparseable stdout: ${JSON.stringify(run.stdout)}`,
    );
  }
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

// A `guardStateWritten(root)` helper used to live here, answering "has the guard
// written anything into `.guard-state/` at all". Ten cases asserted `false`
// through it as the strongest available spelling of "an innocuous call has zero
// side effect" (issues 260707-0750 and 260707-0751).
//
// It cannot answer that any more, and the reason is not a regression: the
// PreToolUse hook writes a fingerprint of every protected path into
// `.guard-state/protected-snapshot.json` on EVERY guarded tool call, so the
// directory exists after the first `ls -la`. The two properties are unchanged
// and are now asserted on the two files they are actually about —
// `readEscalation(root) === null` (no counter written) and
// `readEvents(root) === []` (no event appended). The helper is gone rather than
// redefined, because a predicate over the directory can no longer distinguish a
// guard that behaved from one that did not.

/** Generous per-case budget: each case is a process start, ~0.2s in practice. */
export const CASE_TIMEOUT = 30_000;

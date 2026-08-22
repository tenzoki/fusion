/**
 * Integration harness for the four write tools, Bash, the tracker and the
 * SessionStart hook — each run as Claude Code runs it, in a fresh subprocess
 * against a throwaway project root.
 *
 * ## Why a throwaway root, and why a fresh process for every case
 *
 * Every hook resolves the project it is talking about by walking up from its own
 * working directory to a `fusion-workbench/.fusion-setup` marker
 * (`lib/workbench-root.ts`). So a case run inside THIS repository would write
 * into the real workbench's `.guard-state/`, and read its counters back as if
 * they were its own. A temporary root is the whole fix — no container and no
 * fixture repo — and `spawnSync` per case is what keeps one case's process-level
 * memoisation (the config loader's cache is keyed, but a process is still the
 * unit of resolution) from deciding the next case's answer.
 *
 * A second, louder reason — the write guard's stand-down inside this repository,
 * which made every denial assertion here pass vacuously — went with the guard's
 * last verdict on 2026-08-16; `CLAUDE.md`'s opening section carries the removal
 * and the rule it established. The requirement above outlived it unchanged.
 *
 * ## The macOS symlink trap
 *
 * `mkdtemp` under `os.tmpdir()` hands back `/var/folders/…` on macOS while the
 * child process's `process.cwd()` reports `/private/var/folders/…`. That still
 * bites, and the bite has moved: the child anchors `.guard-state/` on its own
 * RESOLVED cwd, while a case reads the event log back through the root string
 * the harness handed it. When the two differ, `readEvents` opens a directory
 * nothing ever wrote to and every event assertion in the suite passes as "no
 * events" — the vacuous pass, arriving from the other side of the same trap.
 * `makeProject` resolves the root with `realpathSync` and then ASSERTS the
 * result is its own realpath, so a future edit that drops the resolution fails
 * loudly here rather than quietly weakening every caller.
 *
 * The project also carries a deliberate symlinked `alias` of its root, and its
 * only consumer is that assertion: `alias !== root` while `realpath(alias) ===
 * root` is what proves the resolution above did something rather than being a
 * no-op on this filesystem.
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
import { PROJECT_CONFIG_FILENAME } from "../../config.js";

/** `hooks/` — the directory holding guard.ts, tracker.ts and node_modules. */
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
 * It ran in a PAIR with `guard.ts` until 2026-08-12 — the guard recorded a
 * fingerprint of every protected path and the tracker compared it — and a case
 * about reverting or halting had to run both, in order, against one project.
 * Nothing pairs them now: the tracker's two surviving measurements
 * (review coverage, staging drift) read the tree and the git index on their own,
 * so a tracker case is a tracker case.
 */
export function trackerEntry(): GuardEntry {
  return hookEntry("tracker");
}

/**
 * How to spawn the SessionStart hook.
 *
 * Its whole subject is `process.cwd()`, so every case has to be a fresh
 * subprocess with a real working directory. Nothing about that changed when the
 * guard's cwd-anchored stand-down went: a working directory is not injectable,
 * and a case that faked one would be testing the fake.
 */
export function sessionStartEntry(): GuardEntry {
  return hookEntry("session-start");
}

/**
 * How to spawn the review-coverage reader.
 *
 * Not a hook — `bin/fusion-review-coverage` runs it, and `hooks/tracker.ts` runs
 * the same computation in-process when a review file lands — but it shares the
 * one property that makes the tsx default matter here rather than being a
 * convenience: its whole subject is a working directory and the workbench root
 * above it, so every case is a subprocess. Spawning the SOURCE by default also
 * keeps the suite independent of the build entirely — which used to be the only
 * defence available, back when `npm run build` deleted `hooks/dist/` and a
 * second session running the suite in the same checkout was observed wiping it
 * mid-run. The build no longer deletes anything (`scripts/build.mjs`), so this
 * is now a convenience again rather than a shield.
 */
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

/** Shared resolution for all five entry points. See `guardEntry`. */
function hookEntry(
  name:
    | "guard"
    | "tracker"
    | "session-start"
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
   * A symlink pointing at `root`, deliberately NOT resolved. Its consumer is
   * `makeProject`'s own invariant check, which is where it proves that the
   * `realpathSync` above did something on this filesystem rather than nothing.
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

/* ------------------------------------------------------------------ *
 * The LEGACY escalation state file
 *
 * `escalation.json` was the consecutive-block counter and the halt flag. No
 * shipped code writes it, reads it or clears it since 2026-08-16 — the counter,
 * the halt, `lib/escalation.ts` and `clear-halt.ts` all went with the guard's
 * last verdict.
 *
 * The seeder and the reader below are KEPT, with exactly one consumer between
 * them: `legacy-halt-clearing.test.ts`, whose subject is the migration rather
 * than the mechanism. A project can upgrade across that removal while carrying
 * `haltActive: true`, and what it is owed is that nothing blocks and nothing
 * quietly rewrites the file. Neither half of that is assertable without the
 * ability to put such a file in a project and read it back afterwards. Deleting
 * these would delete the evidence that the removal was survivable, which is a
 * different thing from deleting the mechanism.
 * ------------------------------------------------------------------ */

/** The state a freshly-seeded legacy `escalation.json` starts from. */
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
  /**
   * Add `.claude-plugin/plugin.json` naming fusion — the single condition
   * `bin/fusion-plugin-cwd` and `isFusionPluginRoot()` test.
   *
   * No hook branches on it any more; the write guard's stand-down was the
   * last consumer and went on 2026-08-16. What it still buys is the suites whose
   * own subject is that condition: `session-start-subdirectory` (the warning is
   * emitted in the plugin's own tree too), `review-coverage` and
   * `staging-drift`.
   */
  plugin?: boolean;
  /**
   * Make the project a git repository with every seeded file committed.
   *
   * Required by the two measurements that read git: review coverage resolves a
   * commit range, staging drift reads the index. It is also what lets a case
   * hold an independent witness — `git status --porcelain` and `git show
   * :<path>` say what the working tree and the index hold without asking a hook.
   */
  git?: boolean;
  /**
   * Extra project files, merged OVER `SEED_FILES`, so a case can add a file
   * (the project configuration, via `configFiles`) or replace a seeded one.
   * Paths are root-relative;
   * parent directories are created.
   */
  files?: Record<string, string>;
  /**
   * A LEGACY `escalation.json` to write before the hook runs, merged over an
   * empty snapshot. `{ haltActive: true }` is a project that upgraded while
   * halted — the state a consuming project can still be carrying, and which no
   * code at this version writes, reads or clears. See the legacy-state section
   * further down for why the seeder is kept.
   */
  escalation?: Partial<EscalationSnapshot>;
}

/**
 * Create a throwaway project root. Caller owns cleanup — prefer `withProject`.
 *
 * `plugin: true` adds `.claude-plugin/plugin.json` naming fusion, which is the
 * single condition the plugin-repo criterion tests. That root reproduces it
 * without borrowing the real repository, whose `.guard-state/` a test must never
 * touch.
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
 * The review store this project's probe writes into, root-relative.
 *
 * Named here rather than in each suite because two of them write to it and the
 * tracker's trigger is a path test: the payload has to be a `.md` file inside
 * the workbench with a `reviews/` component. Get any part of that wrong and the
 * measurement never runs, which is a case that passes while proving nothing.
 */
export const REVIEW_PAYLOAD = "fusion-workbench/shared/reviews/260815-1200-coderev-probe.md";

/**
 * Open a review-coverage gap, so a review file landing gives the tracker
 * something to say.
 *
 * ## Why a harness capability rather than a fixture in one test file
 *
 * Two suites here are not about review coverage at all. They are about the
 * PostToolUse reply surviving something — a malformed state file, an unwritable
 * `.guard-state/` — and each needs the tracker to be carrying SOME report in
 * order to observe whether it survived.
 *
 * ## Why this probe, on the third re-pointing
 *
 * Both suites borrowed the protected-path halt sentence until 2026-08-12, then
 * the session-state drift sentence until 2026-08-15, and each move happened
 * because the mechanism they had borrowed from was removed. Drift was the right
 * second choice for a reason that no longer holds: of the three tracker reports
 * it was the only one that fired on every guarded tool call, so a case could
 * reach it with an ordinary `notes.txt` edit and stay uncoupled from any
 * trigger. **Both surviving reports are narrow by construction**, so there is no
 * uncoupled probe left and the choice is between coupling and having no probe.
 *
 * Review coverage is the survivor that can carry it, and staging drift is not,
 * for a structural reason rather than a preference: staging drift's throttle
 * record holds the HEAD its trigger compares against, so a case that seeds that
 * record MALFORMED — which is the whole subject of `guard-state-shape.test.ts`
 * — disarms the trigger and observes nothing. Coverage's throttle holds only a
 * signature, a malformed one reads as "never reported", and the gap speaks.
 *
 * The cost is named rather than hidden: a case using this probe now fails if
 * the coverage trigger breaks, for a reason unrelated to its own subject. That
 * is what a coupled probe buys, and it is cheaper than deleting the only suite
 * that covers `lib/guard-state-file.ts`'s coercion seam.
 *
 * ## What it writes, and why so little
 *
 * A two-line `agentstate.yaml` and three commits past its anchor. Only
 * `session.git_head_at_start` is read — it is the session window the coverage
 * range is measured over — and the three commits are what no review's declared
 * range covers. The fuller state file in `review-coverage.test.ts` exists
 * because that suite asserts on the rest of the report.
 *
 * Requires `git: true` on the project: the range is `git rev-list` over the
 * anchor, and without a repository the report comes back with a `why` and the
 * tracker says nothing at all.
 */
export function openCoverageGap(root: string): void {
  const head = git(root, "rev-parse", "--short", "HEAD");
  writeFileSync(
    resolve(root, "fusion-workbench", "agentstate.yaml"),
    ["session:", `  git_head_at_start: "${head}"`, ""].join("\n"),
    "utf-8",
  );
  for (const n of [1, 2, 3]) {
    writeFileSync(resolve(root, `work-${n}.txt`), `work ${n}\n`, "utf-8");
    git(root, "add", `work-${n}.txt`);
    git(root, "commit", "--quiet", "--no-verify", "-m", `work ${n}`);
  }
}

/**
 * A session window with NOTHING uncovered — the other half of the probe.
 *
 * The anchor is HEAD, so the range is empty, so the report is well-formed and
 * its signature is `""`. That is what a case needs when it wants the throttle
 * LOAD to run and the report to have nothing to say: the tracker reaches the
 * load, compares an empty signature with an empty one, and returns before it
 * writes. Without the anchor the measurement returns on its `why` branch,
 * BEFORE the load, and a case asserting the load survived would prove nothing.
 */
export function openCoverageWindowWithNoGap(root: string): void {
  const head = git(root, "rev-parse", "--short", "HEAD");
  writeFileSync(
    resolve(root, "fusion-workbench", "agentstate.yaml"),
    ["session:", `  git_head_at_start: "${head}"`, ""].join("\n"),
    "utf-8",
  );
}

/**
 * Everything the coverage sentence carries, asserted as one — so the two suites
 * that use it as a probe cannot disagree about what "the tracker spoke" means.
 *
 * The third marker was the literal `issue 260810-1205` until 2026-08-17, when
 * that id left the emitted text: it names a record in fusion's own workbench and
 * resolved to nothing in the consuming projects the sentence reached. Its
 * replacement is the closing instruction, the one part of the sentence that is
 * emitted unconditionally.
 */
export const COVERAGE_SENTENCE_MARKERS = [
  "a review landed and 3 commit(s)",
  "still covered by no review's declared range",
  "widen the next dispatch's scope",
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
 * own source tree.
 *
 * Nothing in `hooks/` behaves differently there any more. The suites that use it
 * are the ones asserting exactly that, or asserting a `bin/` helper's own
 * work-tree preference.
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
 * The project configuration file's name, re-exported from the loader itself.
 *
 * IMPORTED rather than spelled, and that is the point. The harness seeded the
 * literal `fusion-guard.json` into every throwaway project, and on 2026-08-16
 * that name became a RETIRED FILE (`RETIRED_PROJECT_FILES` in `lib/config.ts`):
 * every harness project silently began emitting an extra `guard_advisory` per
 * guarded call, which turned a green case in `guard-bash-integration.test.ts`
 * red for a reason no case was about. A literal here is a second source for a
 * filename the loader owns; there is now one.
 */
export const PROJECT_CONFIG = PROJECT_CONFIG_FILENAME;

/**
 * The project configuration file's content for a `files` map.
 *
 * An object is stringified; a string is written verbatim, so a case can supply
 * text that is deliberately not JSON and assert what the loader does with it.
 *
 * NOT exported: `configFiles` below is the only way in, so a case cannot write
 * the configuration under a name it chose for itself. That is how the retired
 * filename came to be seeded into every project in the suite.
 */
function projectConfig(value: object | string): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2) + "\n";
}

/** A `files` map carrying just the project configuration file. */
export function configFiles(value: object | string): Record<string, string> {
  return { [PROJECT_CONFIG]: projectConfig(value) };
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
 * Same subprocess discipline as `runGuard`, for the reason the header gives:
 * the workbench root is resolved from the process's own working directory, so an
 * in-process call would measure this repository instead of the project the case
 * built.
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

/** The legacy `escalation.json`, or null when the project carries none. */
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

/**
 * Has the guard written ANYTHING into `.guard-state/` — the strongest spelling
 * of "this call had zero side effect" (issues 260707-0750 and 260707-0751).
 *
 * Restored on 2026-08-16, and the round trip is worth knowing. This is how the
 * Bash invariants were originally asserted; it stopped being able to answer when
 * the protected-path measurement began writing a fingerprint into
 * `.guard-state/protected-snapshot.json` on EVERY guarded tool call, so the
 * directory existed after the first `ls -la` whatever the guard did. The cases
 * fell back to naming the two files they were about. That measurement was
 * removed on 2026-08-12 and the counter on 2026-08-16, so a correctly-configured
 * project running innocuous Bash once again writes nothing at all — and the
 * predicate discriminates again.
 *
 * It is the strongest of the three spellings because it needs no list of files:
 * a future writer added to the Bash path fails this without anyone remembering
 * to name it.
 */
export function guardStateWritten(root: string): boolean {
  return existsSync(stateDir(root));
}

/** Generous per-case budget: each case is a process start, ~0.2s in practice. */
export const CASE_TIMEOUT = 30_000;

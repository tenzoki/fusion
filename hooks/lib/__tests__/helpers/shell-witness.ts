/**
 * The witness runner — plan step 1 of `circles/260804-1205-shell-reachability-model`.
 *
 * ## What a witness is for
 *
 * `reachability-corpus.ts` records what the CLASSIFIER says about a command.
 * This module records what the SHELL does with it. The two together are the
 * only honest way to grade a change that makes commands newly allow: a row that
 * allows while the shell writes a protected path is a regression, and no amount
 * of reasoning about bash's grammar substitutes for running the row and looking
 * at the directory afterwards.
 *
 * ## Both shells, always
 *
 * bash and zsh disagree about the last element of a pipeline — bash runs every
 * element in a subshell, zsh runs the last one in the calling shell — so
 * `echo hi | cd build` moves zsh and does not move bash. They also disagree
 * about `chdir`, which is a zsh builtin and not a bash one. A row must be
 * measured in the shell that performs its write, and which shell that is cannot
 * be decided in advance, so every row is run in both.
 *
 * ## Outside this repository, and provably so
 *
 * Every row is executed against a fresh throwaway project under `os.tmpdir()`,
 * built by `guard-harness.ts`'s `makeProject` — reused rather than
 * reimplemented, because it already resolves the macOS `/var` → `/private/var`
 * symlink and asserts it did. Two further checks run before any shell starts:
 *
 *   1. the project root must not be inside the plugin repository;
 *   2. every absolute token in the rendered command must sit under that root
 *      (`/dev/null` is the one allowance).
 *
 * The corpus contains `rm -rf` against relative paths. Both checks fail loudly
 * rather than skipping, because a witness that silently does not run reports a
 * survival that never happened — the same vacuous-pass failure the guard
 * harness's docstring is about.
 *
 * ## One project per shell
 *
 * bash's run would otherwise leave zsh nothing to delete, and zsh's observation
 * would read as "the file did not survive" for the wrong reason. Each shell
 * gets its own freshly seeded copy.
 *
 * ## Termination
 *
 * `until popd; do rm x.md; done` never terminates: `popd` fails forever against
 * an empty stack. `while chdir build; do …; done` never terminates under bash,
 * which has no `chdir`. Those rows are in the corpus on purpose — they are the
 * counter-examples that keep `cond-false` honest — so the runner kills the child
 * after `timeoutMs` and reports `timedOut`. A timed-out observation is still a
 * measurement: the filesystem diff says what the loop managed to do.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

import { REPO_ROOT, makeProject } from "./guard-harness.js";
import type { Project } from "./guard-harness.js";
import { PROTECTED_PATHS, renderCommand } from "./reachability-corpus.js";
import type { CorpusRow } from "./reachability-corpus.js";
import { matchesAnyFolded } from "../../paths.js";

/* ------------------------------------------------------------------ *
 * Shells
 * ------------------------------------------------------------------ */

export const SHELLS = ["bash", "zsh"] as const;
export type ShellName = (typeof SHELLS)[number];

/**
 * How each shell is invoked so it reads no startup file.
 *
 * A developer's `~/.zshrc` can set `CDPATH`, define a `cd` function, or alias
 * `rm` to something interactive — any of which would make a measurement a
 * property of that machine. `zsh -f` is NO_RCS; bash's `-c` already skips
 * startup files, and `--noprofile --norc` says so out loud.
 */
const SHELL_INVOCATION: Record<ShellName, { candidates: string[]; flags: string[] }> = {
  bash: { candidates: ["/bin/bash", "/usr/bin/bash"], flags: ["--noprofile", "--norc", "-c"] },
  zsh: { candidates: ["/bin/zsh", "/usr/bin/zsh"], flags: ["-f", "-c"] },
};

function resolveShell(shell: ShellName): string | null {
  for (const candidate of SHELL_INVOCATION[shell].candidates) {
    if (existsSync(candidate)) return candidate;
  }
  const which = spawnSync("/usr/bin/which", [shell], { encoding: "utf-8" });
  const found = which.status === 0 ? which.stdout.trim() : "";
  return found.length > 0 && existsSync(found) ? found : null;
}

/**
 * The child's environment.
 *
 * `CDPATH` is stripped for the same reason `guard-harness.ts` strips it: it is
 * a variable real people export from a shell profile, and it changes where a
 * bare-word `cd` lands. Left in place, a corpus row would land somewhere else
 * on one developer's machine than on everyone else's and the whole measurement
 * would be unreproducible. `BASH_ENV` and `ENV` are stripped because they are
 * the two ways a non-interactive shell can still be handed a startup file.
 */
function childEnv(root: string): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const name of ["CDPATH", "BASH_ENV", "ENV", "ZDOTDIR"]) delete env[name];
  env.PWD = root;
  return env;
}

/* ------------------------------------------------------------------ *
 * Safety: nothing may run outside the throwaway root
 * ------------------------------------------------------------------ */

/** The one absolute path a corpus row may name that is not under the root. */
const ALLOWED_ABSOLUTE = new Set(["/dev/null"]);

/**
 * Assert the rendered command touches nothing outside `root`.
 *
 * Word-level rather than regex-level: the command is split on whitespace, each
 * word is stripped of surrounding quotes, and any word that STARTS with `/` has
 * to be `/dev/null` or sit under the root. A `sed` script (`'s/seed/changed/'`)
 * does not start with `/` and is therefore not a path, which is the distinction
 * a character-level scan gets wrong.
 */
export function assertConfinedToRoot(command: string, root: string): void {
  for (const raw of command.split(/\s+/)) {
    const word = raw.replace(/^['"]+/, "").replace(/['"]+$/, "");
    if (!word.startsWith("/")) continue;
    if (ALLOWED_ABSOLUTE.has(word)) continue;
    if (word === root || word.startsWith(root + sep)) continue;
    throw new Error(
      `witness refuses to run: ${JSON.stringify(word)} in ${JSON.stringify(command)} ` +
        `is an absolute path outside the throwaway root ${root}`,
    );
  }
}

function assertOutsideRepo(root: string): void {
  if (root === REPO_ROOT || root.startsWith(REPO_ROOT + sep)) {
    throw new Error(
      `witness refuses to run: throwaway root ${root} is inside the plugin repository ${REPO_ROOT}`,
    );
  }
}

/* ------------------------------------------------------------------ *
 * Filesystem snapshots
 * ------------------------------------------------------------------ */

/** Project-relative path → sha256 of the file's bytes. Directories excluded. */
export type TreeSnapshot = Map<string, string>;

function snapshot(root: string): TreeSnapshot {
  const out: TreeSnapshot = new Map();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      // Never followed: a symlink's target may sit outside the root, and the
      // only symlink the harness creates is the alias beside the root.
      if (entry.isSymbolicLink()) {
        out.set(relative(root, abs), "symlink");
        continue;
      }
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      out.set(
        relative(root, abs),
        createHash("sha256").update(readFileSync(abs)).digest("hex"),
      );
    }
  };
  walk(root);
  return out;
}

export interface TreeDiff {
  removed: string[];
  modified: string[];
  created: string[];
}

function diffTrees(before: TreeSnapshot, after: TreeSnapshot): TreeDiff {
  const removed: string[] = [];
  const modified: string[] = [];
  const created: string[] = [];

  for (const [path, hash] of before) {
    const now = after.get(path);
    if (now === undefined) removed.push(path);
    else if (now !== hash) modified.push(path);
  }
  for (const path of after.keys()) {
    if (!before.has(path)) created.push(path);
  }

  removed.sort();
  modified.sort();
  created.sort();
  return { removed, modified, created };
}

/* ------------------------------------------------------------------ *
 * The observation
 * ------------------------------------------------------------------ */

export interface ShellObservation extends TreeDiff {
  shell: ShellName;
  /** False when the shell is not installed. Every other field is then empty. */
  available: boolean;
  /** The command as executed, with `{{ROOT}}` expanded to the real root. */
  command: string;
  root: string;
  status: number | null;
  signal: string | null;
  timedOut: boolean;
  stdout: string;
  stderr: string;
  /**
   * Did the file the row is AIMED at (`row.landsWhenMoved`) come through
   * untouched? This is the plan's "whether the file survived".
   */
  targetSurvived: boolean;
  /**
   * Every changed path that matches the shipped protected list. Non-empty on a
   * row the classifier allows is the regression plan step 5 blocks the gate on.
   */
  wroteProtected: string[];
}

export interface WitnessResult {
  row: CorpusRow;
  /** Keyed by shell, so a caller can iterate without knowing the shell set. */
  observations: Record<ShellName, ShellObservation>;
  /** True when either shell wrote a protected path. */
  anyProtectedWrite: boolean;
}

export interface WitnessOptions {
  /** Which shells to run. Defaults to both. */
  shells?: readonly ShellName[];
  /** Hard kill after this many milliseconds. Defaults to 5000. */
  timeoutMs?: number;
}

/**
 * What every witness project is seeded with, over `guard-harness.ts`'s own set.
 *
 * The word `seed` has to be IN the file, or a `sed -i.bak` substitution that
 * matches nothing rewrites the file byte-identically and the content hash says
 * nothing happened. `notes.txt` is the `cp` source and is seeded for the same
 * reason.
 */
const WITNESS_FILES: Record<string, string> = {
  "rules/x.md": "# a rule\nseed\n",
  "agents/coder.md": "# an agent\nseed\n",
  "build/out.js": "// built\nseed\n",
  "notes.txt": "notes\nseed\n",
};

function unavailable(shell: ShellName, command: string, root: string): ShellObservation {
  return {
    shell,
    available: false,
    command,
    root,
    status: null,
    signal: null,
    timedOut: false,
    stdout: "",
    stderr: "",
    removed: [],
    modified: [],
    created: [],
    targetSurvived: true,
    wroteProtected: [],
  };
}

function runOne(
  row: CorpusRow,
  shell: ShellName,
  bin: string,
  timeoutMs: number,
): ShellObservation {
  let project: Project | null = null;
  try {
    project = makeProject({ files: WITNESS_FILES });
    const root = project.root;
    assertOutsideRepo(root);

    const command = renderCommand(row.commandTemplate, root);
    assertConfinedToRoot(command, root);

    const before = snapshot(root);
    const run = spawnSync(bin, [...SHELL_INVOCATION[shell].flags, command], {
      cwd: root,
      encoding: "utf-8",
      env: childEnv(root),
      timeout: timeoutMs,
      killSignal: "SIGKILL",
      maxBuffer: 4 * 1024 * 1024,
    });
    const after = snapshot(root);
    const diff = diffTrees(before, after);

    const errCode = (run.error as NodeJS.ErrnoException | undefined)?.code;
    if (run.error !== undefined && errCode !== "ETIMEDOUT") {
      throw new Error(`witness could not spawn ${bin}: ${run.error}`);
    }

    const touched = [...diff.removed, ...diff.modified, ...diff.created];
    return {
      shell,
      available: true,
      command,
      root,
      status: run.status,
      signal: run.signal ?? null,
      timedOut: errCode === "ETIMEDOUT" || run.signal === "SIGKILL",
      stdout: run.stdout ?? "",
      stderr: run.stderr ?? "",
      ...diff,
      targetSurvived:
        !diff.removed.includes(row.landsWhenMoved) &&
        !diff.modified.includes(row.landsWhenMoved),
      wroteProtected: touched.filter((p) => matchesAnyFolded(p, PROTECTED_PATHS)),
    };
  } finally {
    if (project !== null) {
      rmSync(dirname(project.root), { recursive: true, force: true });
    }
  }
}

/**
 * Run one corpus row in every requested shell and report where the write
 * landed.
 *
 * The row is NOT rewritten on the way in. Whatever the generator produced is
 * what the shell receives, because a witness that normalises its input measures
 * the normalisation.
 */
export function witnessRow(row: CorpusRow, opts: WitnessOptions = {}): WitnessResult {
  const shells = opts.shells ?? SHELLS;
  const timeoutMs = opts.timeoutMs ?? 5_000;
  const observations = {} as Record<ShellName, ShellObservation>;

  for (const shell of SHELLS) {
    if (!shells.includes(shell)) continue;
    const bin = resolveShell(shell);
    observations[shell] =
      bin === null
        ? unavailable(shell, row.commandTemplate, "")
        : runOne(row, shell, bin, timeoutMs);
  }

  return {
    row,
    observations,
    anyProtectedWrite: Object.values(observations).some(
      (o) => o.wroteProtected.length > 0,
    ),
  };
}

/** `witnessRow` over a list, in order. Each row still gets its own projects. */
export function witnessRows(
  rows: readonly CorpusRow[],
  opts: WitnessOptions = {},
): WitnessResult[] {
  return rows.map((row) => witnessRow(row, opts));
}

/** One line per shell, for a measurement record a human reads. */
export function formatWitness(result: WitnessResult): string {
  const lines = [`${result.row.id}  ${JSON.stringify(result.row.commandTemplate)}`];
  for (const shell of SHELLS) {
    const o = result.observations[shell];
    if (o === undefined) continue;
    if (!o.available) {
      lines.push(`  ${shell}: not installed`);
      continue;
    }
    const moves = [
      o.removed.length > 0 ? `removed ${o.removed.join(", ")}` : "",
      o.modified.length > 0 ? `modified ${o.modified.join(", ")}` : "",
      o.created.length > 0 ? `created ${o.created.join(", ")}` : "",
    ].filter((s) => s.length > 0);
    lines.push(
      `  ${shell}: exit ${o.status ?? "-"}${o.timedOut ? " (timed out)" : ""}` +
        `; ${moves.length > 0 ? moves.join("; ") : "nothing changed"}` +
        (o.wroteProtected.length > 0
          ? `; PROTECTED: ${o.wroteProtected.join(", ")}`
          : ""),
    );
  }
  return lines.join("\n");
}

/** Resolve a path under a witness root, for callers that need it. */
export function underRoot(root: string, rel: string): string {
  return resolve(root, rel);
}

/** True when both shells are installed — a caller can skip loudly rather than lie. */
export function shellsAvailable(): Record<ShellName, boolean> {
  return {
    bash: resolveShell("bash") !== null,
    zsh: resolveShell("zsh") !== null,
  };
}

/** Exported so a caller can stat a path the way the snapshot does. */
export function fileExists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

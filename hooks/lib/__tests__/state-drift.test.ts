/**
 * Session-state drift — the measurement, run against real project roots.
 *
 * ## What this suite is for, and what the lint beside it cannot do
 *
 * `state-drift-detection-lint.test.ts` checks that the CONTRACT is in
 * `agents/orchestrator.md` and that something is wired to run it. It reads
 * text. It cannot tell whether the measurement is right, and it never could —
 * that is the same gap issue `260801-2038` measured at a larger scale, where a
 * check written into a prompt was reached twice and fired neither time.
 *
 * So every case here spawns a real subprocess against a real throwaway project
 * with a real git repository, and asserts on what came back. The subprocess
 * discipline is not decoration: `isFusionPluginCwd()` caches its answer per
 * process, so an in-process assertion about the plugin-repo case would pass
 * vacuously (`helpers/guard-harness.ts` states this at length).
 *
 * ## The four properties under test
 *
 * 1. **It measures, from the records that cannot freeze.** A state file saying
 *    `commits: 0` against a git history of three is drift; a difference of one
 *    is the commit in flight and is not.
 * 2. **It reaches the model.** The PostToolUse hook returns the diverging rows
 *    as `additionalContext`, which is what makes a skipped write impossible not
 *    to notice — the whole point of moving the check out of the prompt.
 * 3. **It speaks once per divergence, not once per tool call.** A message on
 *    every call is one an agent learns to read past.
 * 4. **It does not stand down in fusion's own repository.** All six measured
 *    instances happened there. Two stand-downs it was deliberately ordered ahead
 *    of have since gone — the protected-path measurement's on 2026-08-12 and
 *    churn's on 2026-08-15 — and the one left, in `guard.ts`, asks a different
 *    question about a different directory.
 */

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  CASE_TIMEOUT,
  childEnv,
  readEvents,
  runTracker,
  stateDriftEntry,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";
import type { Project } from "./helpers/guard-harness.js";

/**
 * Every case wants a project that is a git repository, because git is one of
 * the two records the check reads. `withProject` takes its options AFTER the
 * callback, which reads badly at fifteen call sites; these two wrappers put the
 * option once, where it can be seen.
 */
const withRepo = <T,>(fn: (p: Project) => T): T => withProject(fn, { git: true });
const withPluginRepo = <T,>(fn: (p: Project) => T): T =>
  withPluginProject(fn, { git: true });

/* ------------------------------------------------------------------ *
 * Fixtures
 * ------------------------------------------------------------------ */

/** Same identity discipline as the harness's own `initGitRepo`. */
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
    throw new Error(`git ${args.join(" ")} failed (${run.status}):\n${run.stderr}`);
  }
  return run.stdout.trim();
}

function head(root: string): string {
  return git(root, "rev-parse", "--short", "HEAD");
}

/** One more commit, so `git rev-list --count` moves and nothing else does. */
function commit(root: string, n: number): void {
  writeFileSync(resolve(root, `work-${n}.txt`), `work ${n}\n`, "utf-8");
  git(root, "add", `work-${n}.txt`);
  git(root, "commit", "-m", `work ${n}`);
}

interface StateFields {
  directive?: string;
  historyFile?: string;
  headAtStart: string;
  turn?: number;
  commits?: number;
}

/**
 * Write `agentstate.yaml` in the shape `agents/orchestrator.md` documents.
 *
 * Deliberately the real field layout, nesting included: the reader is a flat
 * first-match scan, and a flattened fixture would pass while the real file
 * failed.
 */
function writeState(root: string, f: StateFields): void {
  const yaml = [
    "# fusion-workbench session state — for resumption after restart",
    "# Updated: 260811-0900",
    "",
    "session:",
    `  directive: "${f.directive ?? "close the open findings"}"`,
    '  mode: "all"',
    '  domain: "code"',
    '  started: "260811-0900"',
    ...(f.historyFile === undefined ? [] : [`  history_file: "${f.historyFile}"`]),
    `  git_head_at_start: "${f.headAtStart}"`,
    "",
    "progress:",
    `  turn: ${f.turn ?? 1}`,
    "  max_turns: 5",
    "  tasks_total: 8",
    "  tasks_done: 1",
    `  commits: ${f.commits ?? 0}`,
    "",
    "work_queue:",
    '  - id: "T1"',
    '    status: "done"',
    '    commit: "abc1234"',
    "",
  ].join("\n");
  writeFileSync(resolve(root, "fusion-workbench", "agentstate.yaml"), yaml, "utf-8");
}

/**
 * Append one JSONL line to the orchestrator's event log.
 *
 * `extra` carries the fields a real event has beyond `ts` and `event` — for
 * `session_start` that is `history_file`, the session identity the Turn row
 * anchors on. Passing nothing reproduces a log written before that field
 * existed, which is a case under test in its own right.
 */
function emitOrchestratorEvent(
  root: string,
  event: string,
  extra: Record<string, string> = {},
): void {
  const path = resolve(root, "fusion-workbench", "orchestrator-events.jsonl");
  const line = JSON.stringify({ ts: "2026-08-11T09:00:00", event, ...extra }) + "\n";
  writeFileSync(path, (existsSync(path) ? readFileSync(path, "utf-8") : "") + line, "utf-8");
}

/** The session history file on disk, so `session.history_file` is not a second drift. */
function writeHistory(root: string, rel: string, directive = "close the open findings"): void {
  const path = resolve(root, "fusion-workbench", rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `# Session\n\n**Directive:** ${directive}\n`, "utf-8");
}

/**
 * One tool call's worth of tracker, returning the sentence or null.
 *
 * `Bash` and a harmless command, because the case is about a commit having
 * landed during the call rather than about anything the tool wrote.
 */
function trackerSays(project: Project): string | null {
  const out = runTracker(project.root, "Bash", { command: "true" });
  return out.hookSpecificOutput?.additionalContext ?? null;
}

/** `bin/fusion-state-drift`'s program, spawned in `cwd`. */
function runCli(cwd: string): { stdout: string; stderr: string; status: number } {
  const entry = stateDriftEntry();
  const run = spawnSync(entry.bin, entry.args, {
    cwd,
    encoding: "utf-8",
    env: childEnv(),
  });
  if (run.error) throw new Error(`could not spawn ${entry.label}: ${run.error}`);
  return { stdout: run.stdout, stderr: run.stderr, status: run.status ?? -1 };
}

function driftEvents(root: string) {
  return readEvents(root).filter((e) => e.event === "state_drift");
}

/* ------------------------------------------------------------------ *
 * 1. The measurement
 * ------------------------------------------------------------------ */

describe("session-state drift: the measurement", () => {
  it(
    "says nothing when there is no session state to compare",
    () => {
      withRepo((p) => {
        expect(
          trackerSays(p),
          "the tracker spoke about session state with no agentstate.yaml on disk. That is the " +
            "ordinary state of every project between sessions, and a check that talks there " +
            "talks everywhere.",
        ).toBeNull();
        expect(driftEvents(p.root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "names progress.commits when the state file has stopped counting",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);

        const said = trackerSays(p);
        expect(
          said,
          "three commits landed past a state file claiming zero and the tracker said nothing. " +
            "This is issue 260801-2038's first row, measured with 6, 7, 8 and 12.",
        ).not.toBeNull();
        expect(said).toMatch(/progress\.commits/);
        expect(said).toMatch(/says 0/);
        expect(said).toMatch(/says 3|record says 3/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "allows a difference of one — the commit currently in flight",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        commit(p.root, 1);

        expect(
          trackerSays(p),
          "one commit past the state file was reported as drift. The condition table allows " +
            "exactly this — the commit that just landed and whose bookkeeping write is the " +
            "next thing to happen — and a check that fires there fires on every commit.",
        ).toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "counts Turns from the event log, never from the frozen surface itself",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0, turn: 1 });
        emitOrchestratorEvent(p.root, "session_start");
        for (let i = 0; i < 3; i++) emitOrchestratorEvent(p.root, "turn_start");

        const said = trackerSays(p);
        expect(said, "three turn_start events against a state file stuck at Turn 1 is drift").not.toBeNull();
        expect(said).toMatch(/progress\.turn/);
        expect(said).toMatch(/3 \(turn_start events since this session began\)/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "counts only the Turns of the current session",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0, turn: 1 });
        // A previous session's Turns sit in the same append-only log.
        emitOrchestratorEvent(p.root, "session_start");
        for (let i = 0; i < 4; i++) emitOrchestratorEvent(p.root, "turn_start");
        emitOrchestratorEvent(p.root, "session_end");
        emitOrchestratorEvent(p.root, "session_start");
        emitOrchestratorEvent(p.root, "turn_start");

        expect(
          trackerSays(p),
          "the earlier session's four Turns were counted into this one. The count runs from " +
            "the LAST session_start; anything else reports every project with a history as " +
            "drifting on its first Turn.",
        ).toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "catches the resume anchor pointing at a file that does not exist",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, {
          headAtStart: start,
          commits: 0,
          historyFile: "circles/260807-0923-x/history/260807-0945-orchestrator-session.md",
        });

        const said = trackerSays(p);
        expect(
          said,
          "session.history_file named a file that is not on disk and nothing said so. This is " +
            "the third measured instance: a mid-session Circle supersession re-pointed the " +
            "anchor at a path the session never created, so a resuming orchestrator would have " +
            "found neither the Turn state nor the log it named.",
        ).not.toBeNull();
        expect(said).toMatch(/session\.history_file/);
        expect(said).toMatch(/MISSING/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "catches a history file still saying the Directive was never stated",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const rel = "shared/history/260811-0900-orchestrator-session.md";
        mkdirSync(resolve(p.root, "fusion-workbench", "shared", "history"), { recursive: true });
        writeFileSync(
          resolve(p.root, "fusion-workbench", rel),
          "# Session\n\n**Directive:** (not yet stated — user ran /fusion:setup without a task)\n",
          "utf-8",
        );
        writeState(p.root, {
          headAtStart: start,
          commits: 0,
          historyFile: rel,
          directive: "close the open defect records",
        });

        const said = trackerSays(p);
        expect(
          said,
          "the history file's Directive line is a placeholder while agentstate.yaml carries the " +
            "real one, and nothing said so. The reconciler names that line as canonical when " +
            "the state file is gone, and the state file is deleted on every clean exit.",
        ).not.toBeNull();
        expect(said).toMatch(/history Directive/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does not read differing wording as drift",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const rel = "shared/history/260811-0900-orchestrator-session.md";
        mkdirSync(resolve(p.root, "fusion-workbench", "shared", "history"), { recursive: true });
        writeFileSync(
          resolve(p.root, "fusion-workbench", rel),
          "# Session\n\n**Directive:** Close every open finding before new work\n",
          "utf-8",
        );
        writeState(p.root, {
          headAtStart: start,
          commits: 0,
          historyFile: rel,
          directive: "close the open findings to reach a clean state",
        });

        expect(
          trackerSays(p),
          "two differently-worded statements of the same Directive were reported as drift. The " +
            "condition table says explicitly that they are written at different moments and " +
            "neither is the other's source; only the placeholder shape counts.",
        ).toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "catches a Circle record whose Turn log never grew",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const circle = "260811-0900-a-unit-of-work";
        const dir = resolve(p.root, "fusion-workbench", "circles", circle);
        mkdirSync(dir, { recursive: true });
        writeFileSync(
          resolve(dir, "_t_circle.md"),
          "# Circle\n\n**Status:** active\n\n## Turn log\n\n## Closure note\n",
          "utf-8",
        );
        writeFileSync(
          resolve(p.root, "fusion-workbench", ".active-circle"),
          circle + "\n",
          "utf-8",
        );
        writeState(p.root, { headAtStart: start, commits: 0, turn: 2 });
        emitOrchestratorEvent(p.root, "session_start");
        emitOrchestratorEvent(p.root, "turn_start");
        emitOrchestratorEvent(p.root, "turn_start");

        const said = trackerSays(p);
        expect(
          said,
          "a Circle two Turns in with an empty Turn log was not reported. That log is where a " +
            "Circle's history lives after its session state is deleted; a Circle closing with " +
            "it empty never says what happened in it.",
        ).not.toBeNull();
        expect(said).toMatch(/Circle Turn log/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports a row it cannot decide as unchecked rather than dropping it",
    () => {
      withRepo((p) => {
        // A hash no longer in this repository — the shape a rebase leaves.
        writeState(p.root, { headAtStart: "0000000", commits: 0 });
        const cli = runCli(p.root);
        expect(cli.status, cli.stderr).toBe(0);
        expect(
          cli.stdout,
          "an undecidable comparison vanished from the output. A drift check that exists to " +
            "catch a silent skip must not perform one.",
        ).toMatch(/progress\.commits[\s\S]*UNCHECKED/);
        expect(cli.stdout).toMatch(/verdict=clean/);
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * 2. Reaching the model, once per divergence
 * ------------------------------------------------------------------ */

describe("session-state drift: what reaches the model", () => {
  it(
    "carries the issue and the writes the orchestrator owes, not just a number",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);

        const said = trackerSays(p) ?? "";
        expect(said, "the sentence does not cite the record it comes from").toMatch(/260801-2038/);
        expect(
          said,
          "the sentence does not say what to do. An agent that meets an unexplained complaint " +
            "works around it — the same constraint the protected-path revert carries.",
        ).toMatch(/Write Points/);
        expect(
          said,
          "the sentence does not tell a sub-agent to leave the state surfaces alone. Every " +
            "guarded tool call reaches this hook, executors included, and a coder that starts " +
            "editing agentstate.yaml is candidate 3 arriving by accident.",
        ).toMatch(/sub-agent/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "records the drift where it outlives agentstate.yaml",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);
        trackerSays(p);

        const events = driftEvents(p.root);
        expect(
          events.length,
          "no state_drift event was written. The state file is deleted at Cleanup and a drift " +
            "noticed but never recorded disappears with the evidence.",
        ).toBe(1);
        expect(events[0].detail).toMatch(/progress\.commits/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "speaks once per divergence, not once per tool call",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);

        expect(trackerSays(p), "the first call said nothing").not.toBeNull();
        expect(
          trackerSays(p),
          "the same divergence was reported twice. A message on every tool call is one an " +
            "agent learns to read past, which is this whole mechanism's failure arriving one " +
            "level up.",
        ).toBeNull();
        expect(driftEvents(p.root).length, "and it logged the same drift twice").toBe(1);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "speaks again when the divergence grows",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);
        expect(trackerSays(p)).not.toBeNull();

        commit(p.root, 4);
        expect(
          trackerSays(p),
          "the session committed again without bringing the surfaces current and the check " +
            "stayed quiet. A throttle that silences a worsening divergence is a throttle that " +
            "hides the failure.",
        ).not.toBeNull();
        expect(driftEvents(p.root).length).toBe(2);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "goes quiet when the surfaces are brought current, and speaks at the next drift",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);
        expect(trackerSays(p)).not.toBeNull();

        // The orchestrator does the write it owed.
        writeState(p.root, { headAtStart: start, commits: 3 });
        expect(trackerSays(p), "it complained about a state file that is now correct").toBeNull();

        // And a later freeze is a new event, not one suppressed as already told.
        for (const n of [4, 5, 6]) commit(p.root, n);
        expect(
          trackerSays(p),
          "a second freeze after a repair was swallowed by the throttle record of the first",
        ).not.toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does not touch the surfaces it reports on",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);
        const before = readFileSync(resolve(p.root, "fusion-workbench", "agentstate.yaml"), "utf-8");

        trackerSays(p);

        expect(
          readFileSync(resolve(p.root, "fusion-workbench", "agentstate.yaml"), "utf-8"),
          "the hook repaired agentstate.yaml. That is candidate 3 of issue 260801-2038, " +
            "rejected there and still rejected: the session-state surfaces have exactly one " +
            "writer, and a second one racing the orchestrator's overwrite is worse than a " +
            "stale number.",
        ).toBe(before);
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * 3. The plugin repository is not exempt
 * ------------------------------------------------------------------ */

describe("session-state drift: fusion's own repository", () => {
  it(
    "measures in a plugin root, where two now-removed halves used to stand down",
    () => {
      withPluginRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);

        expect(
          trackerSays(p),
          "the drift check stood down in fusion's own repository. Every one of the six measured " +
            "instances of the freeze happened there, so a stand-down here switches the check " +
            "off in the only project it is known to be needed in. The two stand-downs this " +
            "check was ordered ahead of answered different questions and are both gone: churn " +
            "was about plugin-development edits not being signal, and the protected-path " +
            "measurement about a fusion developer's own files not being reverted.",
        ).not.toBeNull();
        expect(driftEvents(p.root).length).toBe(1);
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * 4. The CLI behind bin/fusion-state-drift
 * ------------------------------------------------------------------ */

describe("bin/fusion-state-drift, the program", () => {
  it(
    "prints the KEY=value head and one line per surface",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);

        const cli = runCli(p.root);
        expect(cli.status, cli.stderr).toBe(0);
        expect(cli.stdout).toMatch(/^anchor=workbench-root$/m);
        expect(cli.stdout).toMatch(/^state=present$/m);
        expect(cli.stdout).toMatch(/^verdict=drift$/m);
        expect(cli.stdout).toMatch(/^drift=1$/m);
        expect(cli.stdout).toMatch(/progress\.commits.*DRIFT/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "exits 0 on drift — the verdict is output, not a status",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeState(p.root, { headAtStart: start, commits: 0 });
        for (const n of [1, 2, 3]) commit(p.root, n);

        expect(
          runCli(p.root).status,
          "finding drift exited non-zero. The predecessor of this program did exactly that on " +
            "its commonest path (issue 260810-0710), and a check that reports failure where " +
            "nothing is wrong teaches its reader to ignore its status.",
        ).toBe(0);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "says so when there is no session in progress",
    () => {
      withRepo((p) => {
        const cli = runCli(p.root);
        expect(cli.status, cli.stderr).toBe(0);
        expect(cli.stdout).toMatch(/^state=absent$/m);
        expect(cli.stdout).toMatch(/^verdict=no-session-state$/m);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "exits 2 where there is no workbench above the working directory",
    () => {
      withRepo((p) => {
        // The project's own marker is what makes it a workbench; without it,
        // the walk finds nothing (unless a real one sits above tmpdir, which it
        // does not).
        rmSync(resolve(p.root, "fusion-workbench", ".fusion-setup"));
        const cli = runCli(p.root);
        expect(cli.status).toBe(2);
        expect(cli.stderr).toMatch(/no fusion workbench/);
        expect(cli.stdout, "it printed a verdict about a project it could not find").toBe("");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "rejects an argument rather than ignoring it",
    () => {
      withRepo((p) => {
        const entry = stateDriftEntry();
        const run = spawnSync(entry.bin, [...entry.args, "--verbose"], {
          cwd: p.root,
          encoding: "utf-8",
          env: childEnv(),
        });
        expect(run.status).toBe(1);
        expect(run.stderr).toMatch(/unknown argument/);
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * 5. A resumed session is the same session
 * ------------------------------------------------------------------ */

/**
 * Issue `260811-2143`: the Turn row counted from the LAST `session_start`, and
 * a resume writes one. `commitsSince` counts from `session.git_head_at_start`,
 * which a resume does not rewrite. Two rows of one report, two notions of "this
 * session" — and the Turn row then said DRIFT on every guarded tool call of
 * every resumed session, with nothing stale.
 *
 * The anchor is now the session's own identity: `session_start` carries
 * `history_file`, a session keeps one for its whole life, and the count runs
 * from the FIRST `session_start` naming it. So the row does not merely stop
 * over-reporting — the first two cases below are one shape apart, and the fix
 * has to separate them where counting from the resume cannot.
 */
describe("session-state drift: the Turn row across a resume", () => {
  const REL = "shared/history/260811-0900-orchestrator-session.md";

  /** The live shape: a prior session ended, this one began, ran Turns, resumed. */
  function resumedSession(root: string, turnsBefore: number, turnsAfter: number): void {
    writeHistory(root, REL);
    emitOrchestratorEvent(root, "session_end");
    emitOrchestratorEvent(root, "session_start", { history_file: REL });
    for (let i = 0; i < turnsBefore; i++) emitOrchestratorEvent(root, "turn_start");
    emitOrchestratorEvent(root, "session_start", { history_file: REL });
    for (let i = 0; i < turnsAfter; i++) emitOrchestratorEvent(root, "turn_start");
  }

  it(
    "counts the Turns the interrupted session ran, not the Turns since the resume",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        resumedSession(p.root, 4, 0);
        writeState(p.root, { headAtStart: start, commits: 0, turn: 4, historyFile: REL });

        expect(
          trackerSays(p),
          "a resumed session with correct bookkeeping was reported as drifting. This is the " +
            "live shape of issue 260811-2143: progress.turn carries 4 across the interruption " +
            "while zero turn_start events follow the resume, so a count anchored on the resume " +
            "reports 4 against 0 forever. A row that speaks on its commonest path is one its " +
            "reader learns to read past.",
        ).toBeNull();

        const cli = runCli(p.root);
        expect(cli.stdout, cli.stderr).toMatch(/progress\.turn +surface=4 +record=4 /);
        expect(cli.stdout).toMatch(/^verdict=clean$/m);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "still reports a surface that froze after the resume",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        // Nine Turns ran; the state file stopped at 5. Counting from the resume
        // would find exactly 5 and read clean — this is the freeze the old
        // anchor MISSED, not merely one it reported for the wrong reason.
        resumedSession(p.root, 4, 5);
        writeState(p.root, { headAtStart: start, commits: 0, turn: 5, historyFile: REL });

        const said = trackerSays(p);
        expect(
          said,
          "nine Turns ran against a state file stuck at 5 and nothing said so. The row exists " +
            "for exactly this (issue 260801-2038), and a fix for the false positive that " +
            "cannot still report a real freeze is worse than the false positive.",
        ).not.toBeNull();
        expect(said).toMatch(/progress\.turn/);
        expect(said).toMatch(/9 \(turn_start events since this session began\)/);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "counts only this session's Turns when a crashed session left no session_end",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeHistory(p.root, REL);
        // The crashed session: its own history file, three Turns, no clean exit.
        emitOrchestratorEvent(p.root, "session_start", {
          history_file: "shared/history/260810-2200-orchestrator-session.md",
        });
        for (let i = 0; i < 3; i++) emitOrchestratorEvent(p.root, "turn_start");
        // The user chose Restart: a new state file, a new history file, Turn 1.
        emitOrchestratorEvent(p.root, "session_start", { history_file: REL });
        emitOrchestratorEvent(p.root, "turn_start");
        writeState(p.root, { headAtStart: start, commits: 0, turn: 1, historyFile: REL });

        expect(
          trackerSays(p),
          "the crashed session's three Turns were counted into the session that replaced it. " +
            "This is why the anchor is the session's identity and not a position in the log: " +
            "no rule over line positions separates a Restart after a crash from a resume, " +
            "because both leave two session_start lines with no session_end between them.",
        ).toBeNull();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports the row unchecked, not drifting, when the log predates the identity",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeHistory(p.root, REL);
        emitOrchestratorEvent(p.root, "session_end");
        emitOrchestratorEvent(p.root, "session_start");
        for (let i = 0; i < 4; i++) emitOrchestratorEvent(p.root, "turn_start");
        emitOrchestratorEvent(p.root, "session_start");
        writeState(p.root, { headAtStart: start, commits: 0, turn: 4, historyFile: REL });

        const cli = runCli(p.root);
        expect(cli.status, cli.stderr).toBe(0);
        expect(
          cli.stdout,
          "a log written before session_start carried the session identity, resumed, so which " +
            "of its two session_start lines began this session is not decidable from it. The " +
            "row must say that. Guessing the later one is the defect; guessing the earlier one " +
            "reports a Restart after a crash as drift.",
        ).toMatch(/progress\.turn[\s\S]*?UNCHECKED \(2 session_start lines since the last session_end/);
        expect(cli.stdout, "an undecidable row was counted as a fault").toMatch(/^verdict=clean$/m);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps counting a single-session log that names no history file",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        writeHistory(p.root, REL);
        emitOrchestratorEvent(p.root, "session_end");
        emitOrchestratorEvent(p.root, "session_start");
        for (let i = 0; i < 3; i++) emitOrchestratorEvent(p.root, "turn_start");
        writeState(p.root, { headAtStart: start, commits: 0, turn: 1, historyFile: REL });

        const said = trackerSays(p);
        expect(
          said,
          "the ordinary pre-upgrade log — one session_start since the last clean exit, no " +
            "resume — stopped being counted. One candidate is unambiguous, and turning the row " +
            "off there would surrender the measurement to every project that has not yet " +
            "started a session under the new emission.",
        ).not.toBeNull();
        expect(said).toMatch(/3 \(turn_start events since this session began\)/);
      });
    },
    CASE_TIMEOUT,
  );
});

/**
 * Staging drift — the measurement, run against real project roots.
 *
 * Every case but one spawns a real subprocess against a real throwaway project:
 * the subject is a working directory, a workbench root above it and a git
 * repository around both (`helpers/guard-harness.ts` says why, at its harness).
 * The exception is the class L case below, which calls `classify()` directly.
 */

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { classify, LIVE_PREFIXES, LIVE_STATE } from "../staging-drift.js";
import { pluginRoot } from "./helpers/citation-scan.js";
import {
  CASE_TIMEOUT,
  childEnv,
  readEvents,
  runTracker,
  stagingDriftEntry,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";
import type { Project } from "./helpers/guard-harness.js";

/**
 * A workbench holding one committed record of each kind the classifier has an
 * opinion about, so a case can DIRTY one and watch the class come back rather
 * than creating the file and the fault in the same step.
 */
const WORKBENCH_FILES: Record<string, string> = {
  "fusion-workbench/circles/260811-0100-close-the-findings/_t_circle.md": "# Close\n",
  "fusion-workbench/portfolio.md": "# Portfolio\n\n## Anticipated (_a_) — ranked\n",
  "fusion-workbench/shared/issues/260811-0100_o_something.md": "an issue\n",
  "fusion-workbench/shared/history/260811-0100-orchestrator.md":
    "**Directive:** close the findings\n",
  "fusion-workbench/orchestrator-events.jsonl":
    '{"ts":"2026-08-11T01:00:00","event":"session_start"}\n',
  "fusion-workbench/agentstate.yaml": [
    "session:",
    '  directive: "close the findings"',
    '  history_file: "shared/history/260811-0100-orchestrator.md"',
    '  git_head_at_start: "HEAD"',
    "control:",
    '  turn_start_head: "HEAD"',
    "",
  ].join("\n"),
};

/** The record a case dirties when it wants a fault that no artifact store owns. */
const CIRCLE_RECORD = "circles/260811-0100-close-the-findings/_t_circle.md";

const withWorkbench = <T,>(fn: (p: Project) => T): T =>
  withProject(fn, { git: true, files: WORKBENCH_FILES });

const withPluginWorkbench = <T,>(fn: (p: Project) => T): T =>
  withPluginProject(fn, { git: true, files: WORKBENCH_FILES });

/**
 * The proxy for "the staging sentence reached the model".
 *
 * It was the literal `260811-0114` until 2026-08-17, when that id left the
 * emitted text: it names a record in fusion's own workbench, and the sentence
 * carried it into every consuming project's session, where it resolves to
 * nothing. What is left is the prohibition, which `stagingSentence` emits
 * unconditionally — the two parts above it depend on which classes the report
 * found — and which no other hook output produces.
 */
const STAGING_SPOKE = "Do NOT reach for `git add -A`";

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

/** One more commit, so HEAD moves and nothing under the workbench changes. */
function commit(root: string, n: number): void {
  writeFileSync(resolve(root, `work-${n}.txt`), `work ${n}\n`, "utf-8");
  git(root, "add", `work-${n}.txt`);
  git(root, "commit", "--quiet", "--no-verify", "-m", `work ${n}`);
}

function write(root: string, rel: string, body: string): void {
  const abs = resolve(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body, "utf-8");
}

interface CliResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** Spawn `hooks/staging-drift.ts` with `cwd` at the project root. */
function runStagingDrift(root: string): CliResult {
  const entry = stagingDriftEntry();
  const run = spawnSync(entry.bin, entry.args, {
    cwd: root,
    encoding: "utf-8",
    env: childEnv(),
  });
  return { status: run.status, stdout: run.stdout ?? "", stderr: run.stderr ?? "" };
}

/** The `KEY=value` head lines, as a lookup. */
function keys(stdout: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of stdout.split("\n")) {
    if (line.startsWith(" ")) continue;
    const eq = line.indexOf("=");
    if (eq > 0) out[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return out;
}

/** The row line naming `path`, or undefined. */
function row(stdout: string, path: string): string | undefined {
  return stdout.split("\n").find((l) => l.startsWith("  ") && l.includes(` ${path}`));
}

describe("staging drift: the defect it was built for", () => {
  it(
    "names a modified queue, an untracked history entry and a workbench commit-message file",
    () => {
      withWorkbench((project) => {
        // The three lines the issue's own `git status` reproduction printed,
        // with a Circle record standing in for the queue file that carried it:
        // ` M .../_t_circle.md`, `?? .../260810-1723-tasklist-update.md`,
        // `?? .commit-msg-tmp`.
        write(project.root, `fusion-workbench/${CIRCLE_RECORD}`, "# Close\n\nrevised\n");
        write(
          project.root,
          "fusion-workbench/shared/history/260811-0200-tasklist-update.md",
          "47 records inventoried\n",
        );
        write(project.root, "fusion-workbench/.commit-msg-tmp", "chore: something\n");

        const res = runStagingDrift(project.root);
        expect(res.status).toBe(0);

        const k = keys(res.stdout);
        expect(k.verdict).toBe("unstaged");
        expect(k.unstaged).toBe("3");

        expect(row(res.stdout, CIRCLE_RECORD)).toMatch(/^ {2}record\s+M .*UNSTAGED/);
        expect(row(res.stdout, "shared/history/260811-0200-tasklist-update.md")).toMatch(
          /^ {2}record\s+\?\? .*UNSTAGED/,
        );
        expect(row(res.stdout, ".commit-msg-tmp")).toMatch(
          /^ {2}commit-message\s+\?\? \.commit-msg-tmp {2}UNSTAGED/,
        );
        // The prescribed path is quoted, not described — the whole point of the
        // commit-message class is to say where the file belongs instead.
        expect(res.stdout).toContain(
          "/tmp/fusion-commit-msg-<session-id>-<task-id>.txt",
        );
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "an authored record whose own name says \"commit message\" is a record, not a message file",
    () => {
      withWorkbench((project) => {
        // The control the suite was missing. Its commit-message case above uses
        // `.commit-msg-tmp`, the genuine leftover, so nothing here distinguished
        // "the name matches" from "the file is one". `COMMIT_MESSAGE` used to run
        // ahead of the store test, and these three real filenames — every one of
        // them an artifact this workbench actually holds, not a strawman — came
        // back as `commit-message`, whereupon the model was told to delete them.
        // The middle one is the record reporting that defect. Issue 260811-1141.
        const authored = [
          "shared/history/260810-1810-coder-commit-message-out-of-the-shell.md",
          "shared/issues/260811-1141_o_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md",
          "shared/issues/260811-1149_o_the-commit-message-path-lints-exemption-regex-is-broad-and-case-inconsistent.md",
        ];
        for (const rel of authored) write(project.root, `fusion-workbench/${rel}`, "an authored record\n");

        const res = runStagingDrift(project.root);
        expect(res.status).toBe(0);

        const k = keys(res.stdout);
        expect(k.verdict).toBe("unstaged");
        expect(k.unstaged).toBe("3");

        for (const rel of authored) {
          const line = row(res.stdout, rel);
          expect(line, `no row for ${rel}`).toBeDefined();
          expect(line).toMatch(/^ {2}record\s+\?\? .*UNSTAGED/);
        }
        // Not one of them entered the class that says "delete".
        expect(res.stdout).not.toContain("commit-message ");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "and the record fault it really is reaches the model, instead of being suppressed",
    () => {
      withWorkbench((project) => {
        // The second half of 260811-1141, and the one that hides the first: the
        // classes are exclusive, so a record misfiled as `commit-message` never
        // reached the `record` list and never reached the sentence that asks for
        // it to be staged. Asserting the class alone would leave that open.
        const rel = "shared/history/260810-1810-coder-commit-message-out-of-the-shell.md";
        write(project.root, `fusion-workbench/${rel}`, "an authored record\n");
        runTracker(project.root, "Bash", { command: "ls" });

        commit(project.root, 1);
        const after = runTracker(project.root, "Bash", { command: "git commit" });

        const said = after.hookSpecificOutput?.additionalContext ?? "";
        expect(said).toContain(rel);
        expect(said).toContain("record(s) under fusion-workbench/ are still uncommitted");
        expect(said, "the staging sentence did not reach the model.").toContain(STAGING_SPOKE);
        // And it is not being handed the destructive sentence for it.
        expect(said).not.toMatch(/delete it/i);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "finding an unstaged record is not a non-zero exit",
    () => {
      withWorkbench((project) => {
        write(project.root, `fusion-workbench/${CIRCLE_RECORD}`, "# Close\n\nrevised\n");
        const res = runStagingDrift(project.root);
        // Issue 260810-0710: a check that hands its verdict to an exit code
        // teaches its reader to ignore that code.
        expect(res.status).toBe(0);
        expect(keys(res.stdout).verdict).toBe("unstaged");
      });
    },
    CASE_TIMEOUT,
  );
});

describe("staging drift: what it reports without raising an alarm", () => {
  it(
    "names an untracked non-record file and calls the tree clean — the live stilwerk case",
    () => {
      withWorkbench((project) => {
        // The worked example from this session's own tree: a hand-edited voice
        // profile under the workbench that is not a record. It has to appear in
        // a complete reading and must not be a fault.
        write(
          project.root,
          "fusion-workbench/stilwerk/chat-voice-de.yaml",
          "# a project's own voice profile\n",
        );

        const res = runStagingDrift(project.root);
        const k = keys(res.stdout);
        expect(k.verdict).toBe("clean");
        expect(k.unstaged).toBe("0");

        const line = row(res.stdout, "stilwerk/chat-voice-de.yaml");
        expect(line).toBeDefined();
        expect(line).toMatch(/^ {2}unclassified/);
        expect(line).not.toContain("UNSTAGED");
        expect(line).toContain("nothing is claimed about it");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "treats the machine-written surfaces and this session's own history file as in flight",
    () => {
      withWorkbench((project) => {
        // Each is machine-written and none is a task's record. Reported as
        // faults, they would fire on every commit forever.
        write(
          project.root,
          "fusion-workbench/orchestrator-events.jsonl",
          '{"ts":"2026-08-11T01:00:00","event":"session_start"}\n{"ts":"2026-08-11T02:00:00","event":"turn_start"}\n',
        );
        write(project.root, "fusion-workbench/.fusion-setup", '{"harness":true,"v":2}\n');
        // Class R3 of `rules/workbench-tracking.md` is a pair, and both halves
        // are written by /fusion:setup. `.asset-provenance` fell through to
        // `unclassified` while its sibling was named.
        write(project.root, "fusion-workbench/.asset-provenance", "monitor sha256:abc\n");
        write(project.root, "fusion-workbench/portfolio.md", "# Portfolio\n\nregenerated\n");

        const res = runStagingDrift(project.root);
        const k = keys(res.stdout);
        expect(k.verdict).toBe("clean");

        for (const path of [
          "orchestrator-events.jsonl",
          ".fusion-setup",
          ".asset-provenance",
        ]) {
          const line = row(res.stdout, path);
          expect(line, `${path} must be reported, never dropped`).toBeDefined();
          expect(line).toMatch(/^ {2}in-flight/);
        }
        expect(row(res.stdout, ".asset-provenance")).toContain("/fusion:setup");
      });
    },
    CASE_TIMEOUT,
  );

  it("holds the live-state lists to the tracking rule's class L row, in full", () => {
    // Every backticked token of that row's Entries cell is an entry the rule
    // places in class L; a trailing `/` marks a directory, probed by a child.
    const rule = readFileSync(resolve(pluginRoot, "rules", "workbench-tracking.md"), "utf-8");
    const cell = rule.split("\n").find((l) => l.startsWith("| **L."))?.split("|")[2] ?? "";
    const tokens = [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    expect(tokens, "the class L row of `## The four classes`").not.toEqual([]);
    for (const t of tokens) {
      const probe = t.endsWith("/") ? `${t}x` : t;
      expect(classify(probe, "").klass, `class L names \`${t}\``).toBe("in-flight");
    }
  });

  it("holds every live-state row to an entry of the rule's L, R2 or R3 row", () => {
    // The converse of the case above: a row the rule retires must leave here.
    const rule = readFileSync(resolve(pluginRoot, "rules", "workbench-tracking.md"), "utf-8");
    const cells = rule.split("\n").filter((l) => /^\| \*\*(L|R2|R3)\./.test(l)).map((l) => l.split("|")[2]);
    const tokens = new Set(cells.flatMap((c) => [...c.matchAll(/`([^`]+)`/g)].map((m) => m[1])));
    expect(cells, "the L, R2 and R3 rows of `## The four classes`").toHaveLength(3);
    for (const e of [...LIVE_STATE.map((r) => r.path), ...LIVE_PREFIXES.map((r) => r.prefix)]) {
      expect(tokens.has(e), `\`${e}\` is in the live-state list and in no rule row`).toBe(true);
    }
  });

  it(
    "reads every history file under a store as a record, the session's own included",
    () => {
      // Until 2026-09-10 the session's own history file was in flight, told
      // apart by `session.history_file` in `agentstate.yaml`. That file went
      // with the Turn loop and no machine-written row carries the basename, so
      // the distinction is unreadable and both files are records. The direction
      // is the safe one: a record over-reports rather than staying quiet.
      withWorkbench((project) => {
        write(
          project.root,
          "fusion-workbench/shared/history/260811-0100-orchestrator.md",
          "**Directive:** close the findings\n\nmore\n",
        );
        write(
          project.root,
          "fusion-workbench/shared/history/260811-0300-coder.md",
          "an executor's log\n",
        );

        const res = runStagingDrift(project.root);
        expect(keys(res.stdout).unstaged).toBe("2");
        for (const f of ["260811-0100-orchestrator.md", "260811-0300-coder.md"]) {
          expect(row(res.stdout, `shared/history/${f}`)).toMatch(/^ {2}record/);
        }
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reads a backlog entry as a record, not as the user note it used to be",
    () => {
      withWorkbench((project) => {
        // `shared/backlog/` is a declared store, so an entry left uncommitted is
        // an unstaged RECORD — the model is told to stage it.
        write(
          project.root,
          "fusion-workbench/shared/backlog/260811-0826_o_observations.md",
          "# Raw observations\n\nawaits consolidation\n",
        );

        const res = runStagingDrift(project.root);
        expect(keys(res.stdout).unstaged).toBe("1");
        const line = row(res.stdout, "shared/backlog/260811-0826_o_observations.md");
        expect(line).toMatch(/^ {2}record\s+\?\? .*UNSTAGED/);
        expect(line).toContain("backlog store");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reads a work package's own record as a record, and claims nothing about a sibling no store owns",
    () => {
      withWorkbench((project) => {
        // The unit of work is `<root>/<item>/<item>.md`: the same name twice
        // and no store segment, so it fell through to `unclassified` and an
        // uncommitted item never reached the verdict (issue 260911-1421_*_a-work-items-own-record-classifies-as-unclassified-so-staging-drift-claims-nothing-about-the-unit-of-work.md).
        // A mixed window tree: one package under each root, and a legacy-named store.
        const item = "work-packages/260811-0200-file-the-idea";
        write(project.root, `fusion-workbench/${item}/260811-0200-file-the-idea.md`, "# Idea\n");
        write(project.root, `fusion-workbench/${item}/other.md`, "a note\n");
        write(project.root, "fusion-workbench/circles/260811-0300-older/260811-0300-older.md", "# Older\n");
        write(project.root, "fusion-workbench/shared/consult/260811-0300-note.md", "a report\n");

        const res = runStagingDrift(project.root);
        expect(keys(res.stdout).unstaged).toBe("3");
        expect(row(res.stdout, "circles/260811-0300-older/260811-0300-older.md")).toContain("a work package's own record");
        expect(row(res.stdout, "shared/consult/260811-0300-note.md")).toContain("the consult store");
        const record = row(res.stdout, `${item}/260811-0200-file-the-idea.md`);
        expect(record).toMatch(/^ {2}record\s+\?\? .*UNSTAGED/);
        expect(record).toContain("a work package's own record");
        const other = row(res.stdout, `${item}/other.md`);
        expect(other).toMatch(/^ {2}unclassified/);
        expect(other).toContain("nothing is claimed about it");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does not call a staged record a fault — it is on its way into a commit",
    () => {
      withWorkbench((project) => {
        write(project.root, `fusion-workbench/${CIRCLE_RECORD}`, "# Close\n\nrevised\n");
        git(project.root, "add", `fusion-workbench/${CIRCLE_RECORD}`);

        const res = runStagingDrift(project.root);
        expect(keys(res.stdout).verdict).toBe("clean");
        const line = row(res.stdout, CIRCLE_RECORD);
        expect(line).toMatch(/^ {2}record/);
        expect(line).toContain("staged");
        expect(line).not.toContain("UNSTAGED");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports a workbench outside a git repository as unchecked, never as clean",
    () => {
      withProject(
        (project) => {
          const res = runStagingDrift(project.root);
          expect(res.status).toBe(0);
          const k = keys(res.stdout);
          // "Nothing is staged here" and "nothing could be asked" are different
          // facts, and only one of them is reassuring.
          expect(k.verdict).toBe("unchecked");
          expect(k.why).toContain("not inside a git repository");
        },
        { files: WORKBENCH_FILES },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "exits 2 where there is no workbench at all",
    () => {
      // Built by hand rather than through `withProject`: every harness project
      // seeds `fusion-workbench/.fusion-setup`, which is exactly the marker this
      // case needs absent.
      const bare = mkdtempSync(resolve(realpathSync(tmpdir()), "fusion-no-wb-"));
      try {
        const res = runStagingDrift(bare);
        expect(res.status).toBe(2);
        expect(res.stderr).toContain("no fusion workbench");
      } finally {
        rmSync(bare, { recursive: true, force: true });
      }
    },
    CASE_TIMEOUT,
  );
});

describe("staging drift: the trigger is HEAD moving", () => {
  it(
    "says nothing while a record sits unstaged mid-Turn — the normal and correct state",
    () => {
      withWorkbench((project) => {
        write(project.root, `fusion-workbench/${CIRCLE_RECORD}`, "# Close\n\nrevised\n");

        // Arm the trigger (first sighting of a HEAD is never a move), then run
        // again with the record still sitting there and HEAD unmoved.
        runTracker(project.root, "Bash", { command: "ls" });
        const second = runTracker(project.root, "Bash", { command: "ls" });

        const said = second.hookSpecificOutput?.additionalContext ?? "";
        expect(said).not.toContain(CIRCLE_RECORD);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "names the missed record on the tool call where HEAD moved",
    () => {
      withWorkbench((project) => {
        write(project.root, `fusion-workbench/${CIRCLE_RECORD}`, "# Close\n\nrevised\n");
        runTracker(project.root, "Bash", { command: "ls" });

        // A commit that did not carry the queue — the eighteen-commit case, once.
        commit(project.root, 1);
        const after = runTracker(project.root, "Bash", { command: "git commit" });

        const said = after.hookSpecificOutput?.additionalContext ?? "";
        expect(said).toContain(CIRCLE_RECORD);
        // It must not teach the reader to reach for the flag that caused the
        // opposite defect. The acceptance makes the staging shape a constraint,
        // and the prohibition doubles as the proxy for the sentence having spoken.
        expect(said, "the staging sentence did not reach the model.").toContain(STAGING_SPOKE);

        const events = readEvents(project.root).filter((e) => e.event === "staging_drift");
        expect(events.length).toBe(1);
        expect(events[0].detail).toContain(CIRCLE_RECORD);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "stays silent when the commit carried everything",
    () => {
      withWorkbench((project) => {
        runTracker(project.root, "Bash", { command: "ls" });
        commit(project.root, 1);
        const after = runTracker(project.root, "Bash", { command: "git commit" });
        expect(after.hookSpecificOutput?.additionalContext ?? "").not.toContain(STAGING_SPOKE);
        expect(readEvents(project.root).filter((e) => e.event === "staging_drift")).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "stays silent when the only thing left behind is unclassified",
    () => {
      withWorkbench((project) => {
        write(project.root, "fusion-workbench/stilwerk/notes.yaml", "# a hand-edited profile\n");
        runTracker(project.root, "Bash", { command: "ls" });
        commit(project.root, 1);
        const after = runTracker(project.root, "Bash", { command: "git commit" });
        // The CLI prints it. The interrupting sentence is for obligations only,
        // and there is no obligation attached to a file that is not a record.
        expect(after.hookSpecificOutput?.additionalContext ?? "").not.toContain("stilwerk");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports once per miss, and again when the miss grows",
    () => {
      withWorkbench((project) => {
        write(project.root, `fusion-workbench/${CIRCLE_RECORD}`, "# Close\n\nrevised\n");
        runTracker(project.root, "Bash", { command: "ls" });

        commit(project.root, 1);
        const first = runTracker(project.root, "Bash", { command: "git commit" });
        expect(first.hookSpecificOutput?.additionalContext ?? "").toContain(CIRCLE_RECORD);

        // Same miss, next commit: quiet. A message on every commit is one an
        // agent learns to read past.
        commit(project.root, 2);
        const second = runTracker(project.root, "Bash", { command: "git commit" });
        expect(second.hookSpecificOutput?.additionalContext ?? "").not.toContain(STAGING_SPOKE);

        // The miss grows: a second record joins it, and the signature changes.
        write(project.root, "fusion-workbench/shared/issues/260811-0400_o_new.md", "another\n");
        commit(project.root, 3);
        const third = runTracker(project.root, "Bash", { command: "git commit" });
        const said = third.hookSpecificOutput?.additionalContext ?? "";
        expect(said).toContain("260811-0400_o_new.md");
      });
    },
    CASE_TIMEOUT,
  );
});

describe("staging drift: anchoring and side effects", () => {
  it(
    "does not stand down in fusion's own repository, where the defect was measured",
    () => {
      withPluginWorkbench((project) => {
        write(project.root, `fusion-workbench/${CIRCLE_RECORD}`, "# Close\n\nrevised\n");
        runTracker(project.root, "Bash", { command: "ls" });
        commit(project.root, 1);
        const after = runTracker(project.root, "Bash", { command: "git commit" });
        // The two stand-downs this measurement was ordered ahead of asked a
        // different question about a different directory, and both are gone.
        // This one is anchored at the workbench root, and issue 260811-0114
        // happened in this repository.
        expect(after.hookSpecificOutput?.additionalContext ?? "").toContain(CIRCLE_RECORD);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "stages nothing, commits nothing, and writes no workbench record",
    () => {
      withWorkbench((project) => {
        write(project.root, `fusion-workbench/${CIRCLE_RECORD}`, "# Close\n\nrevised\n");
        runTracker(project.root, "Bash", { command: "ls" });
        commit(project.root, 1);

        const headBefore = git(project.root, "rev-parse", "HEAD");
        const statusBefore = git(
          project.root,
          "status",
          "--porcelain",
          "--untracked-files=all",
          "--",
          "fusion-workbench",
        );

        runTracker(project.root, "Bash", { command: "git commit" });

        expect(git(project.root, "rev-parse", "HEAD")).toBe(headBefore);
        // The one file it may write is its own throttle record, which lives
        // under `.guard-state/` and is not part of this comparison in a project
        // that ignores it — so compare the tracked-record surface directly.
        const statusAfter = git(
          project.root,
          "status",
          "--porcelain",
          "--untracked-files=all",
          "--",
          "fusion-workbench",
        )
          .split("\n")
          .filter((l) => !l.includes(".guard-state/"))
          .join("\n");
        expect(statusAfter).toBe(
          statusBefore
            .split("\n")
            .filter((l) => !l.includes(".guard-state/"))
            .join("\n"),
        );
      });
    },
    CASE_TIMEOUT,
  );
});

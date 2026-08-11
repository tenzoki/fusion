/**
 * Review coverage — the measurement, run against real project roots.
 *
 * ## What this suite is for, and what the lint beside it cannot do
 *
 * `review-coverage-mandate.test.ts` checks that the two reviewer prompts still
 * MANDATE the header fields and that `agents/orchestrator.md` still consumes
 * them. It reads text. It cannot tell whether the tiling is right, and it never
 * could — which is the same gap issue `260810-1205` measured at full scale,
 * where two thorough review passes ran and nothing compared their ranges with
 * the range.
 *
 * So every case here builds a real throwaway git repository with real commits
 * and real review files, and asserts on what came back. The subprocess cases go
 * through the harness for the reason `state-drift.test.ts` gives at length:
 * `isFusionPluginCwd()` caches per process, so an in-process assertion about the
 * plugin-repo case would pass vacuously.
 *
 * ## The properties under test
 *
 * 1. **It tiles, commit by commit.** Two passes whose ranges leave a hole in the
 *    middle produce exactly the hole's commits — the defect's own shape, where
 *    `18b6094..a7c2b03` and `7f617b1..7ddacbc` left seven commits unread and the
 *    session reported one.
 * 2. **It refuses a range it cannot pin.** `HEAD`, a branch and a tag are
 *    reported UNUSABLE by name with the reason, never resolved — two of the ten
 *    review files this was written against end in `-to-head`.
 * 3. **A missing field is loud, not absent.** A review with no
 *    `**Reviewed-range:**` is listed with its reason and contributes no
 *    coverage; it is never guessed at from its filename.
 * 4. **The declared out-of-scope list is carried.** `**Not-opened:**` reaches
 *    `carried=`, which is the half of the defect that had already been reported
 *    correctly by a reviewer and then ignored by everything downstream.
 * 5. **It reaches the model on the narrow trigger, and only there.** The
 *    PostToolUse hook speaks when a review file lands and stays silent on every
 *    other tool call, because mid-Turn an uncovered range is the normal state.
 * 6. **It speaks once per gap.** A gap that persists is reported once; one that
 *    grows speaks again.
 */

import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  childEnv,
  readEvents,
  reviewCoverageEntry,
  runTracker,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";
import type { Project } from "./helpers/guard-harness.js";

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

const head = (root: string) => git(root, "rev-parse", "--short", "HEAD");

/** One more commit, so the window grows and nothing else does. */
function commit(root: string, name: string): string {
  writeFileSync(resolve(root, `${name}.txt`), `${name}\n`, "utf-8");
  git(root, "add", `${name}.txt`);
  git(root, "commit", "-m", `work ${name}`);
  return head(root);
}

/**
 * `agentstate.yaml` in the shape `agents/orchestrator.md` documents.
 *
 * Deliberately the real nesting: the reader is a flat first-match scan, and a
 * flattened fixture would pass while the real file failed.
 */
function writeState(root: string, headAtStart: string): void {
  writeFileSync(
    resolve(root, "fusion-workbench", "agentstate.yaml"),
    [
      "# fusion-workbench session state — for resumption after restart",
      "session:",
      '  directive: "close the open findings"',
      '  mode: "all"',
      `  git_head_at_start: "${headAtStart}"`,
      "",
      "progress:",
      "  turn: 1",
      "  commits: 0",
      "",
    ].join("\n"),
    "utf-8",
  );
}

interface ReviewFixture {
  /** The `**Reviewed-range:**` value, verbatim. Omit to write no such line. */
  range?: string;
  /** The `**Not-opened:**` value, verbatim. Omit to write no such line. */
  notOpened?: string;
  /** Where it goes. Defaults to the shared store. */
  dir?: string;
}

/** A review file in the mandated shape, written where a reviewer would write it. */
function writeReview(root: string, name: string, f: ReviewFixture): string {
  const dir = f.dir ?? "fusion-workbench/shared/reviews";
  mkdirSync(resolve(root, dir), { recursive: true });
  const rel = `${dir}/${name}`;
  writeFileSync(
    resolve(root, rel),
    [
      "# Code review",
      "",
      "**Sender:** coderev",
      ...(f.range === undefined ? [] : [`**Reviewed-range:** ${f.range}`]),
      ...(f.notOpened === undefined ? [] : [`**Not-opened:** ${f.notOpened}`]),
      "",
      "## Verdict",
      "",
      "Nothing to report.",
      "",
    ].join("\n"),
    "utf-8",
  );
  return rel;
}

/** `bin/fusion-review-coverage`'s program, spawned in `cwd`. */
function runCli(cwd: string, ...args: string[]): { stdout: string; stderr: string; status: number } {
  const entry = reviewCoverageEntry();
  const run = spawnSync(entry.bin, [...entry.args, ...args], {
    cwd,
    encoding: "utf-8",
    env: childEnv(),
  });
  if (run.error) throw new Error(`could not spawn ${entry.label}: ${run.error}`);
  return { stdout: run.stdout, stderr: run.stderr, status: run.status ?? -1 };
}

/** The `KEY=value` lines of a CLI run, as a map. */
function keys(stdout: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of stdout.split("\n")) {
    if (line.startsWith(" ")) continue;
    const eq = line.indexOf("=");
    if (eq > 0) out[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return out;
}

/** The short hashes on the CLI's `uncovered` lines, in order. */
function uncoveredHashes(stdout: string): string[] {
  return stdout
    .split("\n")
    .filter((l) => l.trim().startsWith("uncovered "))
    .map((l) => l.trim().split(/\s+/)[1]);
}

/**
 * One tool call's worth of tracker, returning the sentence or null.
 *
 * `Write` against the path the case names, because the trigger under test is a
 * review file landing rather than anything about the tool's own effect.
 */
function trackerSays(project: Project, relPath: string): string | null {
  const out = runTracker(project.root, "Write", {
    file_path: resolve(project.root, relPath),
    content: "x",
  });
  return out.hookSpecificOutput?.additionalContext ?? null;
}

const coverageEvents = (root: string) =>
  readEvents(root).filter((e) => e.event === "review_coverage");

/* ------------------------------------------------------------------ *
 * 1. The tiling
 * ------------------------------------------------------------------ */

describe("review coverage: the tiling", () => {
  it(
    "names the hole between two passes, commit by commit",
    () => {
      withRepo((p) => {
        // The defect's own shape: Turn 1 reviewed, Turn 2 not, Turn 3 reviewed.
        const start = head(p.root);
        const t1 = commit(p.root, "t1");
        const gapA = commit(p.root, "gap-a");
        const gapB = commit(p.root, "gap-b");
        const t3 = commit(p.root, "t3");

        writeState(p.root, start);
        writeReview(p.root, "260811-0900-coderev-turn-1.md", {
          range: `\`${start}..${t1}\``,
          notOpened: "none",
        });
        writeReview(p.root, "260811-1000-coderev-turn-3.md", {
          range: `\`${gapB}..${t3}\``,
          notOpened: "none",
        });

        const out = runCli(p.root);
        expect(out.status, out.stderr).toBe(0);

        const k = keys(out.stdout);
        expect(k.commits).toBe("4");
        expect(k.verdict).toBe("uncovered");
        expect(k.uncovered).toBe("2");

        // Not a count — the commits. Reporting seven of these as "one" is the
        // whole of issue 260810-1205.
        expect(uncoveredHashes(out.stdout).sort()).toEqual([gapA, gapB].sort());
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports a fully tiled range as covered",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const mid = commit(p.root, "one");
        const end = commit(p.root, "two");

        writeState(p.root, start);
        writeReview(p.root, "260811-0900-coderev-a.md", {
          range: `\`${start}..${mid}\``,
          notOpened: "none",
        });
        writeReview(p.root, "260811-1000-coderev-b.md", {
          range: `\`${mid}..${end}\``,
          notOpened: "none",
        });

        const k = keys(runCli(p.root).stdout);
        expect(k.verdict).toBe("covered");
        expect(k.uncovered).toBe("0");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "counts a commit once when two reviews overlap",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const mid = commit(p.root, "one");
        const end = commit(p.root, "two");

        writeState(p.root, start);
        // Both passes cover `mid`. Interval arithmetic over endpoints gets this
        // wrong; expanding through git does not.
        writeReview(p.root, "260811-0900-coderev-a.md", {
          range: `\`${start}..${end}\``,
          notOpened: "none",
        });
        writeReview(p.root, "260811-1000-coderev-b.md", {
          range: `\`${start}..${mid}\``,
          notOpened: "none",
        });

        const k = keys(runCli(p.root).stdout);
        expect(k.verdict).toBe("covered");
        expect(k.uncovered).toBe("0");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "honours an explicit --since over the session anchor",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const one = commit(p.root, "one");
        commit(p.root, "two");

        writeState(p.root, start);
        const k = keys(runCli(p.root, "--since", one).stdout);
        expect(k.since).toBe(one);
        expect(k.commits).toBe("1");
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * 2. Ranges it refuses, and refuses out loud
 * ------------------------------------------------------------------ */

describe("review coverage: a range it cannot pin", () => {
  it(
    "refuses `..HEAD` by name instead of resolving it",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const only = commit(p.root, "one");
        writeState(p.root, start);
        writeReview(p.root, "260811-0900-coderev-to-head.md", {
          range: `\`${start}..HEAD\``,
          notOpened: "none",
        });

        const out = runCli(p.root);
        const k = keys(out.stdout);

        expect(
          k.unusable,
          "a range ending in HEAD was accepted. HEAD names a different commit " +
            "every day the file is read, so accepting it credits a reviewer with " +
            "commits it never opened — two of the ten files this was written " +
            "against end in `-to-head`.",
        ).toBe("1");
        expect(k.uncovered).toBe("1");
        expect(uncoveredHashes(out.stdout)).toEqual([only]);
        expect(out.stdout).toContain("UNUSABLE");
        expect(out.stdout).toContain("not two resolved hashes");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "lists a review with no **Reviewed-range:** line, with the reason",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        commit(p.root, "one");
        writeState(p.root, start);
        // Exactly the ten files that existed when the mandate was written: the
        // range is in the FILENAME and nowhere a program can read it.
        const rel = writeReview(p.root, "260811-0900-coderev-turn-1-range-aaaaaaa-to-bbbbbbb.md", {});

        const out = runCli(p.root);
        const k = keys(out.stdout);

        expect(k.reviews).toBe("1");
        expect(k.unusable).toBe("1");
        expect(k.uncovered).toBe("1");
        expect(
          out.stdout,
          "a review with no machine-readable range was dropped instead of named. " +
            "A coverage check that exists to catch a silent omission must not perform one.",
        ).toContain(rel.replace("fusion-workbench/", ""));
        expect(out.stdout).toContain("no **Reviewed-range:** line");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "names a hash that no longer resolves rather than counting it as coverage",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        commit(p.root, "one");
        writeState(p.root, start);
        writeReview(p.root, "260811-0900-coderev-rebased.md", {
          range: "`deadbee..facec0f`",
          notOpened: "none",
        });

        const out = runCli(p.root);
        expect(keys(out.stdout).unusable).toBe("1");
        expect(keys(out.stdout).uncovered).toBe("1");
        expect(out.stdout).toContain("a hash that no longer resolves here");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "reports an unmeasurable window as unchecked, with the reason",
    () => {
      withRepo((p) => {
        commit(p.root, "one");
        // No agentstate.yaml: there is no session, so there is no range. That is
        // a different fact from a range with nothing uncovered in it.
        const out = runCli(p.root);
        expect(out.status, out.stderr).toBe(0);
        const k = keys(out.stdout);
        expect(k.verdict).toBe("unchecked");
        expect(k.why).toContain("agentstate.yaml is absent");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "exits 2 with no workbench above it, and 0 when it merely found a gap",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        commit(p.root, "one");
        writeState(p.root, start);

        // Finding an uncovered range is a line of output, never an exit code —
        // the lesson bin/fusion-state-drift records from issue 260810-0710.
        const found = runCli(p.root);
        expect(keys(found.stdout).verdict).toBe("uncovered");
        expect(found.status).toBe(0);

        expect(runCli("/").status).toBe(2);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "rejects an unknown argument with exit 1",
    () => {
      withRepo((p) => {
        const out = runCli(p.root, "--nope");
        expect(out.status).toBe(1);
        expect(out.stderr).toContain("usage:");
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * 3. The carried out-of-scope list
 * ------------------------------------------------------------------ */

describe("review coverage: the declared out-of-scope list", () => {
  it(
    "carries the newest review's **Not-opened:** files",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const end = commit(p.root, "one");
        writeState(p.root, start);
        writeReview(p.root, "260811-0900-coderev-a.md", {
          range: `\`${start}..${end}\``,
          notOpened: "`agents/orchestrator.md`, `skills/next/SKILL.md`",
        });

        const k = keys(runCli(p.root).stdout);
        expect(
          k.carried,
          "the reviewer declared two files it did not open and the list stopped at " +
            "the file. That is exactly what happened in session 260810-0844, where " +
            "the three named files were the ones two unreviewed commits changed.",
        ).toBe("agents/orchestrator.md, skills/next/SKILL.md");
        expect(k["carried-from"]).toContain("260811-0900-coderev-a.md");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps a recorded `none` apart from a missing line",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const end = commit(p.root, "one");

        writeState(p.root, start);
        writeReview(p.root, "260811-0900-coderev-recorded.md", {
          range: `\`${start}..${end}\``,
          notOpened: "none",
        });
        expect(keys(runCli(p.root).stdout).carried).toBe("none");
      });

      withRepo((p) => {
        const start = head(p.root);
        const end = commit(p.root, "one");

        writeState(p.root, start);
        writeReview(p.root, "260811-0900-coderev-missing.md", {
          range: `\`${start}..${end}\``,
        });
        expect(
          keys(runCli(p.root).stdout).carried,
          "a review carrying no **Not-opened:** line was reported as having opened " +
            "everything. A recorded absence can be compared; a missing line can only " +
            "be guessed at, and guessing here says a gap does not exist.",
        ).toBe("(not recorded)");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "finds a review inside a Circle's own store, not only the shared one",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const end = commit(p.root, "one");
        writeState(p.root, start);
        writeReview(p.root, "260811-0900-coderev-in-circle.md", {
          range: `\`${start}..${end}\``,
          notOpened: "`bin/fusion-plane`",
          dir: "fusion-workbench/circles/260811-0900-a-circle/reviews",
        });

        const k = keys(runCli(p.root).stdout);
        expect(k.verdict).toBe("covered");
        expect(k.carried).toBe("bin/fusion-plane");
      });
    },
    CASE_TIMEOUT,
  );
});

/* ------------------------------------------------------------------ *
 * 4. Reaching the model, on one trigger and no other
 * ------------------------------------------------------------------ */

describe("review coverage: what the hook says, and when", () => {
  it(
    "says nothing on an ordinary tool call, however wide the gap",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        commit(p.root, "one");
        commit(p.root, "two");
        writeState(p.root, start);

        const out = runTracker(p.root, "Write", {
          file_path: resolve(p.root, "src", "thing.ts"),
          content: "x",
        });
        const said = out.hookSpecificOutput?.additionalContext ?? "";
        expect(
          said,
          "the hook reported an uncovered range on a write that was not a review. " +
            "Mid-Turn an uncovered range is the normal state — review runs after " +
            "the Turn's tasks — and a check that fires on its commonest path is one " +
            "its reader learns to ignore (issue 260810-0710).",
        ).not.toContain("260810-1205");
        expect(coverageEvents(p.root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "names the uncovered commits when a review file lands",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const one = commit(p.root, "one");
        commit(p.root, "two");
        writeState(p.root, start);

        const rel = writeReview(p.root, "260811-0900-coderev-a.md", {
          range: `\`${start}..${one}\``,
          notOpened: "`agents/orchestrator.md`",
        });

        const said = trackerSays(p, rel) ?? "";
        expect(said).toContain("260810-1205");
        expect(said).toContain("agents/orchestrator.md");
        expect(
          said,
          "the sentence did not name the uncovered commit. Naming them is the " +
            "acceptance criterion; a count is what let seven read as one.",
        ).toContain(head(p.root));

        const events = coverageEvents(p.root);
        expect(events.length).toBe(1);
        expect(events[0].detail ?? "").toContain("carried=agents/orchestrator.md");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "speaks once for a gap that persists and again for one that grows",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const one = commit(p.root, "one");
        commit(p.root, "two");
        writeState(p.root, start);

        const rel = writeReview(p.root, "260811-0900-coderev-a.md", {
          range: `\`${start}..${one}\``,
          notOpened: "none",
        });

        expect(trackerSays(p, rel) ?? "").toContain("260810-1205");
        expect(
          trackerSays(p, rel),
          "the same gap was reported twice. A message that arrives every time is " +
            "one an agent learns to read past — the failure this exists to catch, " +
            "one level up.",
        ).toBeNull();

        commit(p.root, "three");
        expect(
          trackerSays(p, rel) ?? "",
          "the gap grew by a commit and the hook stayed quiet.",
        ).toContain("260810-1205");
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "stays quiet when the landed review closes the range",
    () => {
      withRepo((p) => {
        const start = head(p.root);
        const end = commit(p.root, "one");
        writeState(p.root, start);

        const rel = writeReview(p.root, "260811-0900-coderev-a.md", {
          range: `\`${start}..${end}\``,
          notOpened: "none",
        });

        expect(trackerSays(p, rel)).toBeNull();
        expect(coverageEvents(p.root)).toEqual([]);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does not stand down in fusion's own repository",
    () => {
      withPluginRepo((p) => {
        const start = head(p.root);
        const one = commit(p.root, "one");
        commit(p.root, "two");
        writeState(p.root, start);

        const rel = writeReview(p.root, "260811-0900-coderev-a.md", {
          range: `\`${start}..${one}\``,
          notOpened: "none",
        });

        expect(
          trackerSays(p, rel) ?? "",
          "the measurement stood down in a plugin-shaped root. The churn and " +
            "protected-path stand-downs ask about cwd for reasons that do not apply " +
            "here: fusion's own repository is a fusion consumer, and issue " +
            "260810-1205 was measured in it.",
        ).toContain("260810-1205");
      });
    },
    CASE_TIMEOUT,
  );
});

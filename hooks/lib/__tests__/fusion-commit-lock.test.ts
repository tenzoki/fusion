import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { appendFileSync, chmodSync, closeSync, copyFileSync, existsSync, mkdtempSync, mkdirSync, openSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// bin/fusion-commit-lock is a bash script; there is no importable module, so
// these tests drive the real script through child_process against a throwaway
// workbench fixture, as fusion-paths.test.ts does. Motivating defect: issue
// 260805-1839, the holder-less lock directory, whose state and aging are stated
// in `rules/commit-lock.md` `### Mechanism` and its `### Failure modes` table.
const script = join(pluginRoot, "bin", "fusion-commit-lock");

// The script's own constant; the stale cases backdate mtimes rather than wait.
const STALE_AFTER_SECONDS = 60;

let projectRoot: string;
let lockDir: string;
let holderFile: string;

interface RunResult {
  status: number;
  /** the kill signal when the run was terminated by one, else null */
  signal: string | null;
  stdout: string;
  stderr: string;
}

/** Run fusion-commit-lock in the fixture project, for the subcommands that
 *  return immediately. Never throws. spawnSync (not execFileSync) so stderr is
 *  captured on SUCCESS too — the stale-reap notice is printed by a run that then
 *  exits 0. A blocking `acquire` uses `spawnAcquire` and `until` below instead,
 *  which watch what the script says, not how long it has been silent. */
function run(args: string[], env: Record<string, string> = {}): RunResult {
  return runIn(projectRoot, args, env);
}

/** `run` from a directory that is not the fixture root — what separates the
 *  workbench root from the git toplevel. */
function runIn(cwd: string, args: string[], env: Record<string, string> = {}): RunResult {
  const r = spawnSync(script, args, {
    cwd,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...env },
  });
  return { status: r.status ?? -1, signal: r.signal ?? null, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function backdate(path: string, seconds: number): void {
  const then = new Date(Date.now() - seconds * 1000);
  utimesSync(path, then, then);
}

/* Waiting on the lock's own output instead of on a clock. Why the fixed budgets
 * these helpers replaced failed under parallel load and passed in isolation:
 * `shared/issues/260810-1135_*_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md`
 * and the fix log `260815-1133-coder-hooks-suite-concurrency-safety.md`. What
 * replaces the budget is the script's own first-fail message: printed exactly
 * once, and once printed it stays in the accumulated stderr — a monotone
 * condition, so a slow machine only takes longer to reach it. The only deadline
 * left is the vitest case timeout. */

/** A blocking `acquire` under observation: its stderr so far, and its process. */
function spawnAcquire(bin: string, tag: string, env: Record<string, string> = {}): { proc: ChildProcess; stderr: () => string } {
  let stderr = "";
  const proc = spawn(bin, ["acquire", tag], {
    cwd: projectRoot,
    env: { ...process.env, ...env },
    stdio: ["ignore", "ignore", "pipe"],
  });
  proc.on("error", (e) => { stderr += `\n[spawn error] ${e.message}\n`; });
  proc.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });
  return { proc, stderr: () => stderr };
}

const tick = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Wait until `cond` holds, or until the observed process exits. No inner
 *  budget: `cond` is monotone in every caller, so the wait ends on an event and
 *  not on a clock. `proc` is the liveness half — a dead creator never satisfies
 *  `cond`, and waiting out the case timeout would hide the real failure. */
async function until(cond: () => boolean, proc?: ChildProcess): Promise<boolean> {
  for (;;) {
    if (cond()) return true;
    if (proc !== undefined && proc.exitCode !== null) return cond();
    await tick(50);
  }
}

/** Run the script to completion with no `spawnSync` timeout in front of it. The
 *  cases that reap a stale lock are expected to finish, so a timeout there was
 *  never an assertion — only a guard against a hung worker, sized by guess.
 *  Awaiting the exit leaves that guard to the vitest case timeout, which the
 *  load that starves the script cannot starve. */
function runAsync(args: string[]): Promise<RunResult> {
  return new Promise((res) => {
    let stdout = "";
    let stderr = "";
    const proc = spawn(script, args, {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    proc.on("error", (e) => { stderr += `\n[spawn error] ${e.message}\n`; });
    proc.stdout?.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });
    proc.on("close", (status, signal) => {
      res({ status: status ?? -1, signal, stdout, stderr });
    });
  });
}

beforeEach(() => {
  projectRoot = mkdtempSync(join(tmpdir(), "fusion-commit-lock-test-"));
  const workbench = join(projectRoot, "fusion-workbench");
  mkdirSync(workbench);
  writeFileSync(join(workbench, ".fusion-setup"), '{"test":true}\n');
  lockDir = join(workbench, ".commit-lock");
  holderFile = join(lockDir, "holder");
});

afterEach(() => {
  rmSync(projectRoot, { recursive: true, force: true });
});

describe("fusion-commit-lock: normal acquire/release", () => {
  it("acquire creates the lock directory and records tag/pid/acquired_at", () => {
    const r = run(["acquire", "coder"]);
    expect(r.status, r.stderr).toBe(0);
    expect(existsSync(lockDir)).toBe(true);
    const holder = readFileSync(holderFile, "utf-8");
    expect(holder).toMatch(/^tag: coder$/m);
    expect(holder).toMatch(/^pid: \d+$/m);
    expect(holder).toMatch(/^acquired_at: \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/m);
  });

  it("release removes the lock of a dead holder (the acquire process has exited)", () => {
    expect(run(["acquire", "coder"]).status).toBe(0);
    const r = run(["release"]);
    expect(r.status, r.stderr).toBe(0);
    expect(existsSync(lockDir)).toBe(false);
  });

  it("with <tag> -- <cmd> runs the command, releases, and preserves the exit code", () => {
    const ok = run(["with", "coder", "--", "true"]);
    expect(ok.status, ok.stderr).toBe(0);
    expect(existsSync(lockDir)).toBe(false);

    const fail = run(["with", "coder", "--", "false"]);
    expect(fail.status).toBe(1);
    expect(existsSync(lockDir)).toBe(false);
  });

  it("check reports not held / held by", () => {
    expect(run(["check"]).stdout).toContain("not held");
    expect(run(["acquire", "coder"]).status).toBe(0);
    expect(run(["check"]).stdout).toMatch(/held by coder\/pid \d+ since /);
  });
});

describe("fusion-commit-lock: holder-less lock directory", () => {
  it("younger than the stale threshold: acquire blocks, naming the holder-less state and the way out", async () => {
    mkdirSync(lockDir); // fresh mtime — a holder may be mid-acquire
    const blocked = spawnAcquire(script, "coder");
    try {
      // "It is blocking" is read off the message it prints on its first failed
      // acquire, not off a timeout that killed it. The two say the same thing;
      // only one of them is still true on a saturated machine.
      expect(
        await until(() => blocked.stderr().includes("waiting for commit lock held by ?"), blocked.proc),
        `acquire never reported that it was waiting; stderr so far:\n${blocked.stderr()}`,
      ).toBe(true);
      expect(blocked.stderr()).toContain("no holder file");
      expect(blocked.stderr()).toContain("check");
      // Having said it is waiting, it is waiting: it cannot exit while the lock
      // stands, and this case never lets it stand for the 60 s reap threshold.
      expect(blocked.proc.exitCode, "acquire exited although the lock is still held").toBeNull();
      expect(existsSync(lockDir), "a young holder-less lock must not be reaped").toBe(true);
    } finally {
      blocked.proc.kill("SIGTERM");
    }
  });

  it("older than the stale threshold: acquire force-releases it and proceeds", async () => {
    mkdirSync(lockDir);
    backdate(lockDir, STALE_AFTER_SECONDS + 30);
    const r = await runAsync(["acquire", "coder"]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toContain("stale lock detected");
    // The reap replaced the orphan with a real acquisition.
    expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: coder$/m);
  });

  it("release refuses a holder-less directory with an honest message and leaves reaping to acquire", () => {
    mkdirSync(lockDir);
    const r = run(["release"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("no holder");
    expect(existsSync(lockDir)).toBe(true);
  });
});

describe("fusion-commit-lock: the holder write is noclobber (issue 260806-1030, reaped slow creator)", () => {
  // The race the noclobber write closes is stated in `rules/commit-lock.md`
  // `### Mechanism` and its `Crash (or long suspension) between mkdir and the
  // holder write` failure mode; issue 260806-1030 is the half where a reap pulls
  // the lock from under a living slow acquirer. The suspension is simulated by
  // driving a patched COPY of the real script with an injected pause between
  // `mkdir` and the holder write — the review's own reproduction. The patch
  // anchor is asserted, so a reshaped script fails loudly instead of testing the
  // wrong seam, and the pause is a GATE rather than a `sleep`: the creator parks
  // on a file that does not exist yet and announces its arrival by creating
  // another, so the holder-less state persists until this case ends it.

  it(
    "a creator reaped between mkdir and its holder write loses the acquisition instead of overwriting the waiter's holder",
    async () => {
      // A patched copy of the script, next to a copy of fusion-workbench-root
      // (the script resolves the helper via its own dirname).
      const src = readFileSync(script, "utf-8");
      const anchor = 'if mkdir "$LOCK_DIR" 2>/dev/null; then';
      expect(src, "the mkdir anchor left bin/fusion-commit-lock — update this test's patch seam").toContain(anchor);
      // `${VAR:-}` because the real script runs under `set -u`, and the loop
      // spins on the gate rather than on a duration.
      const injected = [
        anchor,
        '    if [ -n "${FUSION_TEST_HOLDER_WRITE_GATE:-}" ]; then',
        '      : > "${FUSION_TEST_HOLDER_WRITE_GATE}.parked"',
        '      while [ ! -e "$FUSION_TEST_HOLDER_WRITE_GATE" ]; do sleep 0.05; done',
        "    fi",
      ].join("\n");
      const patched = src.replace(anchor, injected);
      const binDir = join(projectRoot, "bin");
      mkdirSync(binDir);
      copyFileSync(join(pluginRoot, "bin", "fusion-workbench-root"), join(binDir, "fusion-workbench-root"));
      chmodSync(join(binDir, "fusion-workbench-root"), 0o755);
      const patchedScript = join(binDir, "fusion-commit-lock");
      writeFileSync(patchedScript, patched, { mode: 0o755 });

      const gate = join(projectRoot, "holder-write-gate");
      const parked = `${gate}.parked`;

      const creator = spawnAcquire(patchedScript, "creator", { FUSION_TEST_HOLDER_WRITE_GATE: gate });
      try {
        // 1. The creator mkdirs, then parks before its holder write and says so.
        //    That state does not expire, so the wait cannot lose a race.
        expect(
          await until(() => existsSync(parked), creator.proc),
          `the creator never parked between mkdir and its holder write; stderr so far:\n${creator.stderr()}`,
        ).toBe(true);
        expect(existsSync(lockDir), "the creator parked without creating the lock directory").toBe(true);
        expect(existsSync(holderFile), "the creator wrote its holder before parking").toBe(false);

        // 2. Its stall crosses the stale threshold (backdated, not waited out).
        backdate(lockDir, STALE_AFTER_SECONDS + 30);

        // 3. A waiter reaps the aged holder-less directory and acquires.
        const waiter = await runAsync(["acquire", "waiter"]);
        expect(waiter.status, waiter.stderr).toBe(0);
        expect(waiter.stderr).toContain("stale lock detected");
        expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: waiter$/m);

        // 4. The creator is let go. Its noclobber holder write fails against the
        //    waiter's holder and it re-enters the poll loop as a plain waiter —
        //    observable as the first-fail message, printed once and then kept.
        closeSync(openSync(gate, "w"));
        expect(
          await until(() => creator.stderr().includes("waiting for commit lock held by waiter"), creator.proc),
          `creator never reported losing the acquisition; stderr so far:\n${creator.stderr()}`,
        ).toBe(true);

        // The waiter's holder survived the creator's resume...
        expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: waiter$/m);
        // ...and the creator did not return success: it is still polling.
        expect(creator.proc.exitCode, "the creator exited although the lock is held by the waiter").toBeNull();
      } finally {
        creator.proc.kill("SIGTERM");
      }
    },
    30_000,
  );
});

describe("fusion-commit-lock: stale holder file (the pre-existing reap path)", () => {
  it("a dead recorded PID past the threshold is force-released on acquire", async () => {
    mkdirSync(lockDir);
    // A PID outside any real range reads as dead (`kill -0` fails), and an
    // acquired_at in the past is beyond every threshold.
    writeFileSync(holderFile, "tag: ghost\npid: 99999999\nacquired_at: 2020-01-01T00:00:00Z\n");
    const r = await runAsync(["acquire", "coder"]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toContain("stale lock detected");
    expect(r.stderr).toContain("ghost");
    expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: coder$/m);
  });

  it("a live holder younger than the threshold blocks a second acquire", async () => {
    mkdirSync(lockDir);
    // This test process's own PID is live; acquired_at now.
    const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    writeFileSync(holderFile, `tag: other\npid: ${process.pid}\nacquired_at: ${now}\n`);
    const blocked = spawnAcquire(script, "coder");
    try {
      expect(
        await until(() => blocked.stderr().includes("waiting for commit lock held by other"), blocked.proc),
        `acquire never reported that it was waiting; stderr so far:\n${blocked.stderr()}`,
      ).toBe(true);
      expect(blocked.proc.exitCode, "acquire exited although a live holder holds the lock").toBeNull();
      expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: other$/m);
    } finally {
      blocked.proc.kill("SIGTERM");
    }
  });
});

/* The machine-written `commit` row (v10.8.0), whose conditions and fields are
 * stated in `rules/commit-lock.md` `### The lock writes the commit event`. Two
 * are pinned here. The session scoping is `FUSION_SESSION_ID` ALONE — it was a
 * disjunction with `agentstate.yaml` present until that file went on 2026-09-10,
 * and the case that took the second arm went with it. The log-only skip is the
 * ruling in `260912-2041_*_should-the-commit-lock-skip-its-row-when-the-commit-carries-nothing-but-the-log.md`,
 * asked of the held RANGE (`260915-1845_*_the-log-only-predicate-reads-head-alone-so-a-wrapped-command-landing-two-commits-can-lose-its-row.md`)
 * and never of a merge (`260915-1844_*_a-union-merged-log-merge-is-read-as-log-only-so-three-shipped-statements-about-merges-are-false.md`).
 * The dispatch-side rows (`task_start`/`task_done`) are asserted in
 * `guard-state-shape.test.ts` since the gate widened;
 * `shared/issues/260827-0410_*_the-machine-written-event-rows-ship-with-wiring-asserts-only-because-the-hook-test-surface-is-full.md`
 * recorded that they had nothing but wiring asserts before that. */

const EVENT_LOG = "fusion-workbench/orchestrator-events.jsonl";
/** Global and system git config cut off, so a signing hook here never runs. */
const GIT_ENV = { GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_SYSTEM: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" };
const IDENTITY_ENV = { ...GIT_ENV, FUSION_PERSON: "Test Person <t@example.com>", FUSION_CHECKOUT: "5e8248d7", FUSION_SESSION_ID: "sid-1" };

const git = (args: string[]) => spawnSync("git", args, { cwd: projectRoot, encoding: "utf-8", env: { ...process.env, ...GIT_ENV } });
/** A repo whose root commit TRACKS the workbench marker rather than being empty,
 *  so a log-only commit can leave `git status` wholly clean — the property the
 *  skip exists for, which an untracked fixture file would hide. `sub` puts the
 *  workbench BELOW the git toplevel and returns that root. */
function gitRepo(sub = ""): string {
  const root = join(projectRoot, sub);
  if (sub) mkdirSync(join(root, "fusion-workbench"), { recursive: true });
  if (sub) writeFileSync(join(root, "fusion-workbench", ".fusion-setup"), '{"test":true}\n');
  for (const a of [["init", "-q"], ["config", "user.name", "Test Person"], ["config", "user.email", "t@example.com"], ["add", "-A"], ["commit", "-q", "-m", "root"]]) git(a);
  return root;
}
const commitUnderLock = () => run(["with", "coder", "--", "git", "commit", "-q", "--allow-empty", "-m", "landed"], IDENTITY_ENV);
/** Stage the event log and NOTHING else, from `cwd`, under the lock. */
const commitLogOnly = (cwd: string) => runIn(cwd, ["with", "coder", "--", "sh", "-c", `git add -- ${EVENT_LOG} && git commit -q -m "the log"`], IDENTITY_ENV);
const rows = (root = projectRoot) => readFileSync(join(root, EVENT_LOG), "utf-8").trim().split("\n").map((l) => JSON.parse(l));
const porcelain = (...pathspec: string[]) => git(["status", "--porcelain", ...pathspec]).stdout.trim();

describe("fusion-commit-lock: the machine-written commit row", () => {
  it("appends one commit row carrying hash, subject, identity and session id when HEAD moved in a session", () => {
    gitRepo();
    const r = commitUnderLock(); expect(r.status, r.stderr).toBe(0);
    expect(rows()).toHaveLength(1);
    const head = git(["rev-parse", "--short", "HEAD"]).stdout.trim();
    expect(rows()[0]).toMatchObject({ event: "commit", person: IDENTITY_ENV.FUSION_PERSON, checkout: "5e8248d7", session_id: "sid-1", detail: `${head} landed` });
    expect(rows()[0].ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
  });

  it("writes no row when the wrapped command left HEAD where it was", () => {
    gitRepo();
    expect(run(["with", "coder", "--", "git", "status", "--short"], IDENTITY_ENV).status).toBe(0);
    expect(existsSync(join(projectRoot, EVENT_LOG))).toBe(false);
  });

  it("writes no row when the command moved HEAD onto a commit that already existed, as a reset does (260918-0834)", () => {
    gitRepo(); // the targets are dated before the region, or a same-second root would read as created in it
    const old = (m: string) => spawnSync("git", ["commit", "-q", "--allow-empty", "-m", m], { cwd: projectRoot, env: { ...process.env, ...GIT_ENV, GIT_COMMITTER_DATE: "2020-01-01T00:00:00Z" } });
    old("a"); old("b");
    expect(run(["with", "coder", "--", "git", "reset", "--hard", "HEAD~1"], IDENTITY_ENV).status).toBe(0);
    expect(existsSync(join(projectRoot, EVENT_LOG)), "a reset onto an older commit wrote a row").toBe(false);
  });

  // The log-only skip in BOTH geometries. Below the toplevel the diff prints
  // `sub/fusion-workbench/...` while the emitter appends to `fusion-workbench/...`
  // relative to the workbench root it runs in; ignoring that offset would emit there.
  for (const sub of ["", "sub"]) {
    it(`writes no row when the landed commit's only path is the event log${sub && ", below the git toplevel"}, so the tree settles`, () => {
      const root = gitRepo(sub);
      // Emitting would re-dirty the tracked log the commit just carried, leaving no sequence of commits that ends clean.
      expect(runIn(root, ["with", "coder", "--", "git", "commit", "-q", "--allow-empty", "-m", "landed"], IDENTITY_ENV).status).toBe(0);
      expect(rows(root)).toHaveLength(1);
      expect(porcelain()).not.toBe("");
      const r = commitLogOnly(root); expect(r.status, r.stderr).toBe(0);
      expect(rows(root), "the log-only commit emitted a row of its own").toHaveLength(1);
      expect(porcelain(), "committing the log did not settle the tree").toBe("");
    });
  }

  // A merge landed in the held region emits whatever its diff lists (issue
  // 260915-1844): a combined diff carries every path differing from ALL parents,
  // which for a log merge — union-driven, or resolved by hand — is the log alone.
  for (const [how, attrs, cmd] of [
    ["union-merged", `${EVENT_LOG} merge=union\n`, ["git", "merge", "-q", "--no-ff", "-m", "merge", "side"]],
    ["conflicted and resolved only in the log", "", ["sh", "-c", `git merge -q --no-ff -m merge side || { printf '{\"seed\":0}\\n{\"seed\":2}\\n{\"seed\":1}\\n' > ${EVENT_LOG} && git add -- ${EVENT_LOG} && git commit -q --no-edit; }`]],
  ] as [string, string, string[]][]) {
    it(`writes the row for a log merge ${how}, whose combined diff lists the log alone`, () => {
      gitRepo(); if (attrs) writeFileSync(join(projectRoot, ".gitattributes"), attrs);
      writeFileSync(join(projectRoot, EVENT_LOG), '{"seed":0}\n'); git(["add", "-A"]); git(["commit", "-qm", "seed"]);
      const from = git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout.trim();
      git(["checkout", "-qb", "side"]); appendFileSync(join(projectRoot, EVENT_LOG), '{"seed":1}\n'); git(["commit", "-qam", "side"]);
      git(["checkout", "-q", from]); appendFileSync(join(projectRoot, EVENT_LOG), '{"seed":2}\n'); git(["commit", "-qam", "main"]);
      expect(run(["with", "coder", "--", ...cmd], IDENTITY_ENV).status).toBe(0);
      // Asserted, or a merge listing nothing would pass for the wrong reason.
      expect(git(["rev-list", "--merges", "-1", "HEAD"]).stdout.trim(), "the fixture landed no merge").not.toBe("");
      expect(git(["show", "--name-only", "--format=", "HEAD"]).stdout.trim(), "the fixture's merge does not list the log alone").toBe(EVENT_LOG);
      expect(rows().filter((r) => r.event === "commit"), "the merge wrote no row").toHaveLength(1);
    });
  }

  it("writes the row when the held region landed a code commit and then a log-only one", () => {
    // The caller decides a commit landed over `before..HEAD`, so the skip asks
    // the same range; HEAD alone lost the row this region is owed (260915-1845).
    gitRepo();
    expect(commitUnderLock().status).toBe(0);
    writeFileSync(join(projectRoot, "code.txt"), "x\n");
    expect(run(["with", "coder", "--", "sh", "-c", `git add code.txt && git commit -qm a && git add -- ${EVENT_LOG} && git commit -qm b`], IDENTITY_ENV).status).toBe(0);
    expect(rows(), "the region's non-log commit was owed a row").toHaveLength(2);
  });

  it("writes the row for a region listing no path at all, and for the log plus another path", () => {
    // Listing nothing is not "the only path is the log": the empty commit every
    // other case here commits lists nothing, and a disjoint merge lists nothing
    // either — though a merge now emits because a merge landed, as above.
    gitRepo();
    const base = git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout.trim();
    git(["checkout", "-qb", "side"]); writeFileSync(join(projectRoot, "side.txt"), "s\n"); git(["add", "-A"]); git(["commit", "-qm", "side"]);
    git(["checkout", "-q", base]); writeFileSync(join(projectRoot, "base.txt"), "b\n"); git(["add", "-A"]); git(["commit", "-qm", "base"]);
    expect(run(["with", "coder", "--", "git", "merge", "-q", "--no-ff", "-m", "merge", "side"], IDENTITY_ENV).status).toBe(0);
    expect(git(["rev-list", "--merges", "-1", "HEAD"]).stdout.trim(), "no merge commit was created").not.toBe("");
    expect(rows()).toHaveLength(1);
    writeFileSync(join(projectRoot, "code.txt"), "x\n");
    expect(run(["with", "coder", "--", "sh", "-c", "git add -A && git commit -q -m mixed"], IDENTITY_ENV).status).toBe(0);
    expect(rows(), "a commit carrying the log AND another path is not log-only").toHaveLength(2);
  });

  it("writes no row when the session identifier is unset, even though a commit landed", () => {
    // `run` merges `process.env`, and a developer running this suite inside a
    // fusion session HAS `FUSION_SESSION_ID` exported by SessionStart. Left
    // alone this case would assert nothing on the machine most likely to run it
    // — the failure `STRIPPED_ENV_VARS` in helpers/guard-harness.ts prevents too.
    // The empty string is the strip: the script tests `[ -n "${FUSION_SESSION_ID:-}" ]`.
    gitRepo();
    const r = run(
      ["with", "coder", "--", "git", "commit", "-q", "--allow-empty", "-m", "landed"],
      { ...IDENTITY_ENV, FUSION_SESSION_ID: "" },
    );
    expect(r.status, r.stderr).toBe(0);
    expect(existsSync(join(projectRoot, EVENT_LOG))).toBe(false);
  });
});

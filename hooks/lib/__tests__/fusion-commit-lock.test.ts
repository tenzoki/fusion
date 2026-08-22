import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { chmodSync, closeSync, copyFileSync, existsSync, mkdtempSync, mkdirSync, openSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// bin/fusion-commit-lock is a bash script; there is no importable module. The
// tests drive the real script through child_process against a throwaway
// workbench fixture, following the precedent of fusion-paths.test.ts.
//
// Motivating defect (issue 260805-1839, holder-less lock directory): a lock
// directory WITHOUT a holder file — holder died between `mkdir` and the holder
// write, or the directory was created some other way — recorded no PID and no
// acquired_at, so `is_stale_lock` could never call it stale and `acquire`
// blocked forever with the non-actionable message "waiting for commit lock
// held by ?...". The fix ages a holder-less directory on its own mtime against
// the same 60-second threshold. These tests pin the fix and the two behaviours
// around it (a young holder-less directory still blocks; a normal
// acquire/release cycle is untouched).
const script = join(pluginRoot, "bin", "fusion-commit-lock");

// The script's own constant. Tests never wait it out — the stale cases
// backdate mtimes instead — but assertions on messages reference it.
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
 *  captured on SUCCESS too — the stale-reap notice is printed on stderr by a
 *  run that then exits 0. A blocking `acquire` never goes through here: it uses
 *  `spawnAcquire` and `until` below, which watch what the script says instead
 *  of how long it has been saying nothing. */
function run(args: string[]): RunResult {
  const r = spawnSync(script, args, {
    cwd: projectRoot,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    status: r.status ?? -1,
    signal: r.signal ?? null,
    stdout: r.stdout ?? "",
    stderr: r.stderr ?? "",
  };
}

function backdate(path: string, seconds: number): void {
  const then = new Date(Date.now() - seconds * 1000);
  utimesSync(path, then, then);
}

/* ------------------------------------------------------------------ *
 * Waiting on the lock's own output instead of on a clock
 *
 * Every case below that watches a blocking `acquire` used to give it a fixed
 * budget — a 3 s `spawnSync` timeout whose SIGTERM was read as "it is still
 * blocking", or a poll deadline sized against an injected `sleep`. All of them
 * assumed the machine would get through a bash startup, a workbench-root
 * resolution and a `mkdir` inside a few seconds. Under the parallel-executor
 * pattern this project runs on it does not: the noclobber case failed in all
 * four loaded runs of
 * `shared/issues/260810-1135_*_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md`,
 * and in six of six here with two concurrent suites in one checkout.
 *
 * What replaces the budget is the script's own first-fail message. It is
 * printed exactly once, it names the holder, and once printed it stays in the
 * accumulated stderr — a monotone condition, so a slow machine only takes
 * longer to reach it rather than missing it. The only deadline left is the
 * vitest case timeout, which is a deadlock guard rather than an assumption
 * about how fast the lock is.
 * ------------------------------------------------------------------ */

/** A blocking `acquire` under observation: its stderr so far, and its process. */
interface Blocking {
  proc: ChildProcess;
  stderr: () => string;
}

function spawnAcquire(bin: string, tag: string, env: Record<string, string> = {}): Blocking {
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


/**
 * Wait until `cond` holds, or until the process being observed exits. No inner
 * budget: `cond` is monotone in every caller, so the wait ends on an event and
 * not on a clock. `proc` is the liveness half — a creator that died can never
 * satisfy the condition, and waiting out the case timeout for it would hide the
 * real failure behind a generic timeout message.
 */
async function until(cond: () => boolean, proc?: ChildProcess): Promise<boolean> {
  for (;;) {
    if (cond()) return true;
    if (proc !== undefined && proc.exitCode !== null) return cond();
    await tick(50);
  }
}

/**
 * Run the script to completion without a `spawnSync` timeout in front of it.
 *
 * The cases that reach a stale lock and reap it are expected to finish, so a
 * timeout there was never an assertion — it was a guard against a hung worker,
 * sized by guess. Awaiting the exit puts that guard where it belongs, on the
 * vitest case timeout, which cannot be starved by the same load that starves
 * the script.
 */
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
  // The race the noclobber write closes: a creator suspended between `mkdir`
  // and the holder write for >= 60s gets reaped by the holder-less aging; on
  // resume, a plain `>` would silently overwrite the reaping waiter's fresh
  // holder and BOTH parties would believe they hold the lock. With `set -C`
  // the late write fails and the creator treats the acquisition as lost.
  //
  // The suspension is simulated by driving a patched COPY of the real script
  // with an injected pause between `mkdir` and the holder write — the same
  // reproduction the review used to demonstrate the race. The patch anchor is
  // asserted, so a reshaped script fails loudly here instead of testing the
  // wrong seam.
  //
  // ## Why the pause is a gate and not a `sleep`
  //
  // It was `sleep 4`, and the case then had to CATCH the creator inside a
  // four-second window by polling every 100 ms. That is a wall-clock
  // assumption about a state that disappears on its own, and under the
  // parallel-executor pattern this project runs on it is false: the case failed
  // in all four loaded runs recorded in
  // `shared/issues/260810-1135_*_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md`
  // and in six of six full runs here with two concurrent suites in one
  // checkout, always as "the creator never created a holder-less lock
  // directory". A vitest worker starved of CPU misses a four-second window the
  // same way a slow creator does, and the assertion cannot tell the two apart.
  //
  // The creator now parks indefinitely on a file that does not exist yet, and
  // announces its arrival by creating another. The holder-less state therefore
  // PERSISTS until this case ends it, so a loaded machine only takes longer to
  // observe it. Every wait below ends on an event — a file appearing, a line
  // reaching stderr, a process exiting — and the only clock left is the vitest
  // case timeout.

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
        // 1. The creator mkdirs, then parks before its holder write — and says
        //    so. The state it is parked in does not expire, so this wait cannot
        //    lose a race; it can only fail if the creator never got there.
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

        // 4. The creator is let go. Its noclobber holder write fails against
        //    the waiter's holder, and it re-enters the poll loop as a plain
        //    waiter — observable as the first-fail message naming the real
        //    holder, which is printed once and then stays in the buffer.
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

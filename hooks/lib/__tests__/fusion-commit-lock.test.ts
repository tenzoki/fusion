import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { chmodSync, copyFileSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

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
const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const script = join(pluginRoot, "bin", "fusion-commit-lock");

// The script's own constant. Tests never wait it out — the stale cases
// backdate mtimes instead — but assertions on messages reference it.
const STALE_AFTER_SECONDS = 60;

let projectRoot: string;
let lockDir: string;
let holderFile: string;

interface RunResult {
  status: number;
  /** the kill signal when the run was terminated by `timeout`, else null */
  signal: string | null;
  stdout: string;
  stderr: string;
}

/** Run fusion-commit-lock in the fixture project. Never throws. spawnSync
 *  (not execFileSync) so stderr is captured on SUCCESS too — the stale-reap
 *  notice is printed on stderr by a run that then exits 0. */
function run(args: string[], timeoutMs?: number): RunResult {
  const r = spawnSync(script, args, {
    cwd: projectRoot,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
    ...(timeoutMs !== undefined ? { timeout: timeoutMs, killSignal: "SIGTERM" as const } : {}),
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
  it("younger than the stale threshold: acquire blocks, naming the holder-less state and the way out", () => {
    mkdirSync(lockDir); // fresh mtime — a holder may be mid-acquire
    const r = run(["acquire", "coder"], 3000);
    expect(r.signal, "acquire should still be blocking when the test timeout kills it").toBe("SIGTERM");
    expect(r.stderr).toContain("waiting for commit lock held by ?");
    expect(r.stderr).toContain("no holder file");
    expect(r.stderr).toContain("check");
    expect(existsSync(lockDir), "a young holder-less lock must not be reaped").toBe(true);
  });

  it("older than the stale threshold: acquire force-releases it and proceeds", () => {
    mkdirSync(lockDir);
    backdate(lockDir, STALE_AFTER_SECONDS + 30);
    const r = run(["acquire", "coder"], 10000);
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
  // with an injected `sleep` between `mkdir` and the holder write — the same
  // reproduction the review used to demonstrate the race. The patch anchor is
  // asserted, so a reshaped script fails loudly here instead of testing the
  // wrong seam.
  const CREATOR_DELAY_S = 4;

  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

  async function pollUntil(cond: () => boolean, timeoutMs: number): Promise<boolean> {
    const until = Date.now() + timeoutMs;
    while (Date.now() < until) {
      if (cond()) return true;
      await sleep(100);
    }
    return cond();
  }

  it(
    "a creator reaped between mkdir and its holder write loses the acquisition instead of overwriting the waiter's holder",
    async () => {
      // A patched copy of the script, next to a copy of fusion-workbench-root
      // (the script resolves the helper via its own dirname).
      const src = readFileSync(script, "utf-8");
      const anchor = 'if mkdir "$LOCK_DIR" 2>/dev/null; then';
      expect(src, "the mkdir anchor left bin/fusion-commit-lock — update this test's patch seam").toContain(anchor);
      const patched = src.replace(anchor, `${anchor}\n    sleep "\${FUSION_TEST_HOLDER_WRITE_DELAY:-0}"`);
      const binDir = join(projectRoot, "bin");
      mkdirSync(binDir);
      copyFileSync(join(pluginRoot, "bin", "fusion-workbench-root"), join(binDir, "fusion-workbench-root"));
      chmodSync(join(binDir, "fusion-workbench-root"), 0o755);
      const patchedScript = join(binDir, "fusion-commit-lock");
      writeFileSync(patchedScript, patched, { mode: 0o755 });

      let creator: ChildProcess | null = null;
      let creatorStderr = "";
      try {
        creator = spawn(patchedScript, ["acquire", "creator"], {
          cwd: projectRoot,
          env: { ...process.env, FUSION_TEST_HOLDER_WRITE_DELAY: String(CREATOR_DELAY_S) },
          stdio: ["ignore", "ignore", "pipe"],
        });
        creator.stderr!.on("data", (d: Buffer) => { creatorStderr += d.toString(); });

        // 1. The creator mkdirs, then stalls before its holder write.
        expect(
          await pollUntil(() => existsSync(lockDir) && !existsSync(holderFile), 10_000),
          "the creator never created a holder-less lock directory",
        ).toBe(true);

        // 2. Its stall crosses the stale threshold (backdated, not waited out).
        backdate(lockDir, STALE_AFTER_SECONDS + 30);

        // 3. A waiter reaps the aged holder-less directory and acquires.
        const waiter = run(["acquire", "waiter"], 10_000);
        expect(waiter.status, waiter.stderr).toBe(0);
        expect(waiter.stderr).toContain("stale lock detected");
        expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: waiter$/m);

        // 4. The creator resumes, its noclobber holder write fails against the
        //    waiter's holder, and it re-enters the poll loop as a plain waiter
        //    — observable as the first-fail message naming the real holder.
        expect(
          await pollUntil(() => creatorStderr.includes("waiting for commit lock held by waiter"), (CREATOR_DELAY_S + 6) * 1000),
          `creator never reported losing the acquisition; stderr so far:\n${creatorStderr}`,
        ).toBe(true);

        // The waiter's holder survived the creator's resume...
        expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: waiter$/m);
        // ...and the creator did not return success: it is still polling.
        expect(creator.exitCode, "the creator exited although the lock is held by the waiter").toBeNull();
      } finally {
        creator?.kill("SIGTERM");
      }
    },
    30_000,
  );
});

describe("fusion-commit-lock: stale holder file (the pre-existing reap path)", () => {
  it("a dead recorded PID past the threshold is force-released on acquire", () => {
    mkdirSync(lockDir);
    // A PID outside any real range reads as dead (`kill -0` fails), and an
    // acquired_at in the past is beyond every threshold.
    writeFileSync(holderFile, "tag: ghost\npid: 99999999\nacquired_at: 2020-01-01T00:00:00Z\n");
    const r = run(["acquire", "coder"], 10000);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toContain("stale lock detected");
    expect(r.stderr).toContain("ghost");
    expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: coder$/m);
  });

  it("a live holder younger than the threshold blocks a second acquire", () => {
    mkdirSync(lockDir);
    // This test process's own PID is live; acquired_at now.
    const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
    writeFileSync(holderFile, `tag: other\npid: ${process.pid}\nacquired_at: ${now}\n`);
    const r = run(["acquire", "coder"], 3000);
    expect(r.signal).toBe("SIGTERM");
    expect(r.stderr).toContain("waiting for commit lock held by other");
    expect(readFileSync(holderFile, "utf-8")).toMatch(/^tag: other$/m);
  });
});

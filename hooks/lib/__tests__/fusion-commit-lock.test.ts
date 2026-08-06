import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from "node:fs";
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

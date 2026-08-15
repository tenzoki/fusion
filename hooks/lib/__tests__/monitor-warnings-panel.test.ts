import { describe, it, expect, afterEach } from "vitest";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { createServer, connect } from "node:net";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  chmodSync,
  existsSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// bin/monitor — warnings-panel suite: which guard events reach the panel, what
// budget each is charged to, and what weight it renders at.
//
// WHY THIS FILE EXISTS. `bin/monitor` had no executable coverage at all: the
// only prior mentions of it in this directory are prose in guard-side tests
// describing what the monitor *would* render. That was survivable while the
// panel was a flat "last 30 matching events" slice. It stopped being survivable
// when guard_advisory joined the panel, because an advisory is emitted per
// guarded tool call for as long as its cause stands — a project carrying one
// wrong-typed or retired key in its `fusion-guard.json` emits an unbounded
// stream of them, and thirty in a row would push every guard_block and
// guard_halt off the panel. Measured first on the burst the
// `FUSION_ALLOW_RULES_WRITE` exemption produced, one advisory per exempted
// write; that flag went with the protected-path half on 2026-08-12 and the
// fixture below keeps its rows, because the panel must still render an
// advisory a consuming project logged before it upgraded. The fix is
// two independent caps (MAX_WARNINGS_RETURNED for the warning class,
// MAX_ADVISORIES_RETURNED for the advisory class) merged back by timestamp, and
// a fix nothing tests is a fix that comes back.
//
// WHY IT DRIVES THE REAL BINARY. The panel logic lives in a Python heredoc
// inside a bash script; there is no importable module, and the script executes
// its server at the bottom of the same heredoc, so it cannot be imported for a
// unit test either. `fusion-paths.test.ts` sets the precedent for driving a
// real `bin/` script through child_process; this file extends it to the one
// script that has to be spoken to over HTTP. The seam is
// `GET /api/dashboard`, whose `warnings` array is exactly what renderWarnings()
// receives — so an assertion here is an assertion about what a user sees.
//
// PORT HANDLING. The port is taken by binding :0, reading the assigned port and
// releasing it. That leaves a race window in which another process could claim
// it, which matters more than usual here: monitor SIGTERMs whatever is already
// listening on its port before binding (documented in its own usage text). The
// window is microseconds against an ephemeral port the OS just handed out, and
// the alternative — a fixed port — would collide with a developer's own running
// monitor, which is the far likelier way to shoot someone.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, "../../..");
const monitorBin = join(pluginRoot, "bin", "monitor");

interface GuardEvent {
  ts: string;
  event: string;
  tool?: string;
  file?: string;
  detail?: string;
}

/** Sequential UTC timestamps in the exact shape guard.ts writes. */
function makeClock(): () => string {
  let n = 0;
  return () => {
    n += 1;
    const mm = String(Math.floor(n / 60)).padStart(2, "0");
    const ss = String(n % 60).padStart(2, "0");
    return `2026-08-03T10:${mm}:${ss}.000Z`;
  };
}

/** Write a throwaway workbench whose .guard-state/events.jsonl holds `events`. */
function seedWorkbench(events: GuardEvent[]): string {
  const wb = mkdtempSync(join(tmpdir(), "fusion-monitor-"));
  mkdirSync(join(wb, ".guard-state"), { recursive: true });
  writeFileSync(
    join(wb, ".guard-state", "events.jsonl"),
    events.map((e) => JSON.stringify(e)).join("\n") + "\n",
  );
  return wb;
}

function freePort(): Promise<number> {
  return new Promise((res, rej) => {
    const s = createServer();
    s.on("error", rej);
    s.listen(0, "127.0.0.1", () => {
      const addr = s.address();
      if (addr === null || typeof addr === "string") {
        s.close();
        rej(new Error("no port assigned"));
        return;
      }
      const port = addr.port;
      s.close(() => res(port));
    });
  });
}

const running: ChildProcess[] = [];

/**
 * Kill every monitor this file still has running.
 *
 * `afterEach` is the ordinary caller. The process-level hooks below are the
 * ones that matter for the machine: a monitor left alive is a python HTTP
 * server that polls its workbench every two seconds and never exits, and it
 * outlives the run that started it. Measured on this machine while proving the
 * suite concurrency-safe: 42 orphaned monitor processes going back three days
 * and twenty-one hours, one of them holding half a core. Every later run of the
 * suite paid for them — which is the "it fails under load" condition two
 * records describe from the other side
 * (`shared/issues/260810-1135_*_a-timing-case-in-fusion-commit-lock-test-fails-under-load-and-passes-in-isolation.md`,
 * `shared/issues/260811-1409_*_the-browser-launch-case-in-the-monitor-suite-fails-under-parallel-load-and-passes-in-isolation.md`).
 *
 * `exit` is the second caller and covers a worker vitest tears down mid-file.
 * There is deliberately NO signal handler here, and the reason is measured: a
 * `SIGTERM` handler that reaped and then called `process.exit` turned an
 * ordinary signal into a failed run — vitest instruments `process.exit` and
 * reports it as an uncaught exception, and the reap it performed on the way out
 * killed the monitor the case was still waiting for. A worker that is signalled
 * is going to die either way; making its death louder helped nobody. A run
 * killed with a signal therefore still leaks, and so does SIGKILL.
 *
 * The group is signalled only while OUR child is still alive. A pid that has
 * been reaped may have been handed to something else by then, and this machine
 * cycles pids often enough for that to be a real possibility rather than a
 * theoretical one; `-pid` on a stranger's pid is a signal to a stranger's whole
 * process group.
 */
function reapMonitors(): void {
  while (running.length > 0) {
    const p = running.pop();
    if (p?.pid === undefined) continue;
    if (p.exitCode !== null || p.signalCode !== null) continue;
    // Negative pid: the whole process group. `bin/monitor` is a bash wrapper
    // that execs python as a child, so killing the bash pid alone orphans a
    // listening server and the next test's port scan meets a stranger.
    try {
      process.kill(-p.pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
}

process.on("exit", reapMonitors);

/**
 * A `python3` wrapper that runs its argv with a pseudo-terminal on stdin,
 * stdout and stderr, so the child's `[ -t 1 ]` is true.
 *
 * Needed because the browser-launch gate keys on stdout being a terminal, and
 * `child_process.spawn` cannot hand a child one: every stdio mode Node offers
 * is a pipe, a file, an fd or /dev/null. python3 is already a hard requirement
 * of `bin/monitor` (the server is a python heredoc inside it), so driving the
 * interactive case through it adds no dependency this suite did not already
 * have. The reader thread exists so the pty buffer cannot fill and wedge the
 * monitor mid-banner; nothing asserts on what it reads.
 */
const PTY_RUNNER = `
import os, subprocess, sys, threading

master, slave = os.openpty()
proc = subprocess.Popen(sys.argv[1:], stdin=slave, stdout=slave, stderr=slave,
                        close_fds=True)
os.close(slave)

def drain():
    while True:
        try:
            if not os.read(master, 4096):
                return
        except OSError:
            return

threading.Thread(target=drain, daemon=True).start()
sys.exit(proc.wait())
`;

let ptyRunnerPath: string | undefined;
function ptyRunner(): string {
  if (ptyRunnerPath === undefined) {
    const dir = mkdtempSync(join(tmpdir(), "fusion-pty-"));
    ptyRunnerPath = join(dir, "pty-runner.py");
    writeFileSync(ptyRunnerPath, PTY_RUNNER);
  }
  return ptyRunnerPath;
}

type PtyProbe = { ok: true } | { ok: false; reason: string };

let ptyProbe: PtyProbe | undefined;

/**
 * Whether this machine can hand a child a pseudo-terminal, and when it cannot,
 * why not. The probe runs the same interpreter and the same `os.openpty()` call
 * PTY_RUNNER does, so a negative answer here is the runner's own failure taken
 * one step earlier, where it can still be named.
 *
 * WHY A FAILURE AND NOT A SKIP. The two `tty: true` cases below are the only
 * executable coverage of the browser-launch gate, the defect that once opened
 * eleven tabs per `npm test` run. fusion has no CI, so nothing but a human
 * reading the summary observes a skip — and under vitest 2.1 a programmatic
 * `ctx.skip()` carries no reason into that summary at all (the note argument
 * arrives in vitest 3.1). A green run on a machine that never exercised the
 * gate claims coverage it does not have, which is the failure mode
 * `shared/issues/260810-2149_*_a-coverage-floor-cannot-see-coverage-leave-…`
 * is open about. So the case fails, and the message says the pty is missing and
 * that `bin/monitor` is not implicated. One line of triage, no false green.
 *
 * The probe is deliberately narrow: it fails only where `python3` cannot be run
 * or `os.openpty()` itself raises. Any other way of not coming up still reaches
 * the poll in `startMonitor` and fails there, so a machine whose pty works
 * cannot take this branch.
 */
function ptyAvailable(): PtyProbe {
  if (ptyProbe === undefined) {
    const r = spawnSync(
      "python3",
      ["-c", "import os; m, s = os.openpty(); os.close(m); os.close(s)"],
      { encoding: "utf8" },
    );
    if (r.error != null) {
      ptyProbe = { ok: false, reason: `python3 could not be run: ${r.error.message}` };
    } else if (r.signal != null) {
      ptyProbe = { ok: false, reason: `python3 was killed by ${r.signal} while opening a pty` };
    } else if (r.status !== 0) {
      const last = (r.stderr ?? "").trim().split("\n").pop() ?? "";
      const detail = last.length > 0 ? last : `python3 exited with status ${r.status}`;
      ptyProbe = { ok: false, reason: `os.openpty() failed: ${detail}` };
    } else {
      ptyProbe = { ok: true };
    }
  }
  return ptyProbe;
}

interface MonitorOpts {
  /** Extra environment for the monitor process (merged over process.env). */
  env?: Record<string, string>;
  /** Give the monitor a pseudo-terminal, so its `[ -t 1 ]` gate is true. */
  tty?: boolean;
  /**
   * Override the harness's `MONITOR_BIND` pin. `null` **deletes** the variable
   * from the child environment, which is the only way to reach the monitor's
   * own default — setting it to a wildcard spelling would test a value the
   * caller chose rather than the default the program picks when nobody chose.
   */
  bind?: string | null;
}

/** Start the real monitor against `wb` and return the port it answers on. */
async function startMonitor(wb: string, opts: MonitorOpts = {}): Promise<number> {
  const port = await freePort();
  const argv = [monitorBin, "test", String(port), "-d", wb];
  if (opts.tty === true) {
    const pty = ptyAvailable();
    if (!pty.ok) {
      throw new Error(
        `this case needs a pseudo-terminal and this machine cannot allocate one: ` +
          `${pty.reason}. bin/monitor is not implicated: it is never started. ` +
          `See ptyAvailable() for why this fails rather than skipping.`,
      );
    }
  }
  const [cmd, ...args] = opts.tty === true ? ["python3", ptyRunner(), ...argv] : argv;
  // MONITOR_BIND=127.0.0.1: the monitor's default bind is the wildcard (LAN
  // dashboard), and on 2026-08-06 this machine measured macOS parking a
  // non-loopback listener of a process without Local Network permission in
  // CLOSED state — never LISTEN — and dropping its inbound SYNs even from
  // loopback, which made the fetch poll below hang. A loopback bind was exempt.
  // The pin is what made the suite deterministic regardless of that state, and
  // it stays: a case whose subject is the panel should not be able to fail for
  // the host's privacy configuration.
  //
  // The pin is therefore also a blind spot, and it is deliberate rather than
  // total. `bind: null` below reaches the default, and the one case whose
  // subject *is* the bind uses it — guarded by a probe, because on a host in
  // the 2026-08-06 state that case genuinely cannot run. See the
  // "default wildcard bind" describe block at the bottom of this file.
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    MONITOR_BIND: "127.0.0.1",
    ...opts.env,
  };
  if (opts.bind === null) delete env.MONITOR_BIND;
  else if (typeof opts.bind === "string") env.MONITOR_BIND = opts.bind;
  const proc = spawn(cmd, args, {
    stdio: "ignore",
    detached: true,
    env,
  });
  running.push(proc);
  // A child that never execs — python3 gone from PATH, bin/monitor not
  // executable — emits `error` on a spawn nobody listens to, and Node re-raises
  // that as an uncaught exception, which vitest reports beside the run rather
  // than as this case failing. Both listeners exist to keep the cause attached
  // to the case that provoked it.
  let spawnFailure: string | undefined;
  proc.on("error", (e) => {
    spawnFailure ??= `${cmd} could not be started: ${e.message}`;
  });
  proc.on("exit", (code, signal) => {
    spawnFailure ??=
      signal !== null
        ? `${cmd} was killed by ${signal} before the server answered`
        : `${cmd} exited with status ${code} before the server answered`;
  });
  // No wall-clock budget here. This wait used to give up after 15 s, and under
  // three concurrent suites the python3 pty runner -> bash -> fork chain does
  // not finish inside a budget like that — the case then failed for load rather
  // than for anything about the monitor
  // (`shared/issues/260811-1409_*_the-browser-launch-case-in-the-monitor-suite-fails-under-parallel-load-and-passes-in-isolation.md`).
  // The two exits below are events: the server answers, or the process that
  // would have answered is gone. The vitest case timeout is the one deadline
  // left, and it is a deadlock guard rather than an assumption about how fast
  // this machine forks.
  for (;;) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/api/dashboard`);
      if (r.ok) return port;
    } catch {
      // not listening yet
    }
    // `bin/monitor` ends in `wait $SERVER_PID` and the pty runner in
    // `proc.wait()`, so whatever we spawned outlives the server it forked. Its
    // exit before the first answer is terminal: report it now, with its status,
    // instead of polling a port nothing will ever answer on.
    if (spawnFailure !== undefined) {
      throw new Error(`monitor did not come up: ${spawnFailure}`);
    }
    await new Promise((r) => setTimeout(r, 100));
  }
}

/** The process `startMonitor` spawned last — the one that owns the launch. */
function lastMonitor(): ChildProcess {
  const proc = running[running.length - 1];
  if (proc === undefined) throw new Error("no monitor has been started in this case");
  return proc;
}

/** Start the real monitor against `wb` and return its /api/dashboard payload. */
async function dashboard(wb: string): Promise<{ warnings: GuardEvent[] }> {
  const port = await startMonitor(wb);
  const r = await fetch(`http://127.0.0.1:${port}/api/dashboard`);
  return (await r.json()) as { warnings: GuardEvent[] };
}

/** Fetch the dashboard page the real monitor serves at `/`. */
async function indexPage(wb: string): Promise<string> {
  const port = await startMonitor(wb);
  const r = await fetch(`http://127.0.0.1:${port}/`);
  return await r.text();
}

afterEach(reapMonitors);

// The events the panel exists to surface and that no burst may evict. It held
// `churn_critical` as a third member until the churn heatmap was removed on
// 2026-08-15; the property under test is the budget carve-out, not the set's
// size, so the two survivors carry it unchanged.
const RESCUED = new Set(["guard_block", "guard_halt"]);

/**
 * A filler row charged to the WARNING class rather than to a carve-out.
 *
 * The cases below need to overflow that class, which means an event in
 * `WARNING_EVENT_TYPES` that is in none of `SUBSET_BUDGETS`. Two are left after
 * the churn removal, `guard_block` and `guard_halt`, and these fillers used to
 * be `churn_warning` — the one warning-class event that was neither. `guard_block`
 * takes the role: a session that blocks fifty writes is what a full warning load
 * now looks like, and the detail string is what every assertion reads.
 */
function warningRow(ts: string, n: number): GuardEvent {
  return {
    ts,
    event: "guard_block",
    tool: "Edit",
    file: `src/f${n}.ts`,
    detail: `warning ${n}`,
  };
}

describe("bin/monitor — warnings panel capacity", () => {
  it(
    "an advisory burst cannot evict a block or a halt",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [
        // The two things the panel exists to surface — emitted FIRST, so a
        // single shared budget would rank them oldest and drop them.
        { ts: ts(), event: "guard_block", tool: "Bash", file: "rules/x.md", detail: "Protected path: rm -rf rules" },
        { ts: ts(), event: "guard_halt", tool: "Bash", file: "rules/x.md", detail: "Halt active — mutating Bash command blocked: rm -rf rules" },
      ];
      // Thirty advisories in a row, well past the 30-row window on its own.
      // Spelled as the exemption's burst because that is the shape this was
      // measured on and the shape a pre-2026-08-12 event log holds; a
      // configuration advisory repeating per tool call reaches the same 30.
      for (let i = 1; i <= 30; i++) {
        events.push({
          ts: ts(),
          event: "guard_advisory",
          tool: "Edit",
          file: `rules/rule-${i}.md`,
          detail: `Override FUSION_ALLOW_RULES_WRITE allowed a normally-denied write to a protected rule path: rules/rule-${i}.md`,
        });
      }

      const { warnings } = await dashboard(seedWorkbench(events));
      const kinds = warnings.map((w) => w.event);

      // Both survive the burst. Under the single shared budget this read
      // [ ...29 advisories ] and nothing else.
      expect(kinds.filter((k) => RESCUED.has(k)).sort()).toEqual([
        "guard_block",
        "guard_halt",
      ]);
      // The advisories are capped rather than dropped — the user still sees
      // that the override is live.
      const advisories = kinds.filter((k) => k === "guard_advisory");
      expect(advisories.length).toBeGreaterThan(0);
      expect(advisories.length).toBeLessThan(30);
      // Newest advisories, not oldest.
      const shown = warnings.filter((w) => w.event === "guard_advisory");
      expect(shown[shown.length - 1]?.file).toBe("rules/rule-30.md");
      // Merged chronologically: the renderer walks the array backwards to get
      // latest-first, so a non-monotonic array would render out of order.
      const stamps = warnings.map((w) => w.ts);
      expect(stamps).toEqual([...stamps].sort());
    },
    30000,
  );

  it(
    "the warning class keeps its full budget while advisories overflow",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [];
      for (let i = 1; i <= 50; i++) events.push(warningRow(ts(), i));
      for (let i = 1; i <= 50; i++) {
        events.push({ ts: ts(), event: "guard_advisory", tool: "Edit", file: `rules/r${i}.md`, detail: `advisory ${i}` });
      }

      const { warnings } = await dashboard(seedWorkbench(events));
      // 30 is MAX_WARNINGS_RETURNED, unchanged and unshared. If the two classes
      // ever go back to competing for one budget this drops below 30.
      expect(warnings.filter((w) => w.event === "guard_block").length).toBe(30);
      expect(warnings.filter((w) => w.event === "guard_advisory").length).toBeLessThanOrEqual(10);
    },
    30000,
  );

  it(
    "with no advisories the panel is byte-identical to the pre-split slice",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [];
      for (let i = 1; i <= 40; i++) events.push(warningRow(ts(), i));

      const { warnings } = await dashboard(seedWorkbench(events));
      // The old behaviour exactly: last 30 matching events, file order, newest
      // last. Asserted as the whole array rather than a length so a reordering
      // of the untouched path is caught too.
      expect(warnings.length).toBe(30);
      expect(warnings.map((w) => w.detail)).toEqual(
        Array.from({ length: 30 }, (_, i) => `warning ${i + 11}`),
      );
    },
    30000,
  );

  it(
    "bookkeeping events stay out of the panel",
    async () => {
      const ts = makeClock();
      const { warnings } = await dashboard(
        seedWorkbench([
          { ts: ts(), event: "guard_allow", tool: "Bash", detail: "allowed" },
          // A shape the tracker still writes. The contentless Bash
          // `tracker_record` this line used to carry stopped being emitted with
          // issue `260805-1859`; pinning it here would test the panel against a
          // log line nothing produces.
          {
            ts: ts(),
            event: "tracker_record",
            tool: "Edit",
            file: "src/a.ts",
            detail: "File change recorded",
          },
          { ts: ts(), event: "guard_advisory", tool: "Edit", file: "rules/a.md", detail: "advisory" },
        ]),
      );
      expect(warnings.map((w) => w.event)).toEqual(["guard_advisory"]);
    },
    30000,
  );
});

// ---------------------------------------------------------------------------
// The archive roll. `/fusion:archive` bounds the guard event log by MOVING it
// into the archive store and starting a fresh empty one — there is no line or
// byte ceiling anywhere, because every ceiling drops the oldest lines and the
// oldest lines are the guard_block / guard_halt / halt_cleared events (decision
// `260811-1534_*_does-the-guard-event-log-get-an-upper-bound…`).
//
// That leaves the monitor reading a file the roll just emptied, and a moment
// where `mv` has run and the re-create has not. Both are states the panel meets
// in normal operation, not edge cases, so both are pinned here: the dashboard
// answers, with no rows and no error, and refills from whatever is appended
// next.
// ---------------------------------------------------------------------------

/** A workbench whose .guard-state/events.jsonl is present and byte-empty. */
function seedRolledWorkbench(): string {
  const wb = mkdtempSync(join(tmpdir(), "fusion-monitor-"));
  mkdirSync(join(wb, ".guard-state"), { recursive: true });
  writeFileSync(join(wb, ".guard-state", "events.jsonl"), "");
  return wb;
}

/** A workbench with a .guard-state/ but no events.jsonl at all. */
function seedUnrolledGapWorkbench(): string {
  const wb = mkdtempSync(join(tmpdir(), "fusion-monitor-"));
  mkdirSync(join(wb, ".guard-state"), { recursive: true });
  return wb;
}

describe("bin/monitor — a rolled guard event log", () => {
  it(
    "returns an empty panel for the byte-empty log a roll leaves behind",
    async () => {
      const { warnings } = await dashboard(seedRolledWorkbench());
      expect(warnings).toEqual([]);
    },
    30000,
  );

  it(
    "returns an empty panel in the window between the mv and the re-create",
    async () => {
      const { warnings } = await dashboard(seedUnrolledGapWorkbench());
      expect(warnings).toEqual([]);
    },
    30000,
  );

  it(
    "renders the events appended after a roll, and only those",
    async () => {
      // The post-roll log holds nothing but what emitEvent has written since.
      // The panel must show them rather than staying empty because the file is
      // short — the roll is a truncation of the READ, not of the record.
      const ts = makeClock();
      const wb = seedRolledWorkbench();
      writeFileSync(
        join(wb, ".guard-state", "events.jsonl"),
        [
          { ts: ts(), event: "guard_block", tool: "Edit", file: "rules/a.md", detail: "after the roll" },
          { ts: ts(), event: "guard_allow", tool: "Bash", detail: "still filtered out" },
        ]
          .map((e) => JSON.stringify(e))
          .join("\n") + "\n",
      );

      const { warnings } = await dashboard(wb);
      expect(warnings.map((w) => w.detail)).toEqual(["after the roll"]);
    },
    30000,
  );
});

// ---------------------------------------------------------------------------
// guard_error — the fail-open row.
//
// Both hooks catch an unexpected exception, allow the call, and record
// guard_error (hooks/guard.ts and hooks/tracker.ts, in their main().catch
// handlers). Until this suite grew the block below, the monitor did not render
// it: the one event meaning "the guard is not running" was the one the panel
// dropped, so a guard protecting nothing showed as normal operation.
//
// The plan's Step 5 prescribed adding guard_error to WARNING_EVENT_TYPES and
// nothing else, on the reasoning that a fail-open is rare. The condition is
// rare; the EVENT is not. Both hooks fail open per invocation, so a fault that
// sits on disk emits one row per guarded tool call for as long as it sits
// there. The first two cases below measure what that does to the shared budget
// in both directions, and they are why guard_error carries its own budget
// (MAX_ERRORS_RETURNED) rather than being charged to the warning class.
// ---------------------------------------------------------------------------

/**
 * Pull renderWarnings()'s level-mapping chain out of the page the monitor
 * actually serves, and make it callable.
 *
 * The alternative was a substring search for the new branch, which passes on a
 * branch that is present but unreachable. There is no DOM in this project's
 * devDependencies and adding one to read a five-line if-chain is out of
 * proportion, so the chain is executed on its own: it reads `w` and nothing
 * else, and assigns two locals. If renderWarnings() is ever restructured past
 * recognition this throws rather than silently asserting nothing.
 */
function levelMapper(
  page: string,
): (event: string) => { levelClass: string; levelLabel: string } {
  const start = page.indexOf("var levelClass = 'warning';");
  const end = page.indexOf("var ts = formatLocalTime(", start);
  if (start < 0 || end <= start) {
    throw new Error("renderWarnings() level mapping not found in the served page");
  }
  const body = page.slice(start, end);
  const fn = new Function(
    "w",
    body + "\nreturn { levelClass: levelClass, levelLabel: levelLabel };",
  ) as (w: { event: string }) => { levelClass: string; levelLabel: string };
  return (event: string) => fn({ event });
}

/** The declaration body of one CSS rule in the served page. */
function cssBody(page: string, selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(esc + "\\s*\\{([^}]*)\\}").exec(page);
  if (m === null) throw new Error(`no CSS rule for ${selector}`);
  return m[1];
}

describe("bin/monitor — the fail-open row", () => {
  it(
    "a guard_error reaches the panel",
    async () => {
      const ts = makeClock();
      const { warnings } = await dashboard(
        seedWorkbench([
          { ts: ts(), event: "guard_allow", tool: "Edit", file: "src/a.ts", detail: "allowed" },
          {
            ts: ts(),
            event: "guard_error",
            detail:
              "Guard error (fail-open): SyntaxError: Unexpected token } in JSON at position 118",
          },
          { ts: ts(), event: "tracker_record", tool: "Edit", file: "src/a.ts", detail: "File change recorded" },
        ]),
      );
      // Before this change the panel returned [] here and the dashboard's
      // warnings section stayed hidden.
      expect(warnings.map((w) => w.event)).toEqual(["guard_error"]);
      expect(warnings[0]?.detail).toContain("fail-open");
    },
    30000,
  );

  it(
    "a fail-open burst cannot evict a block or a halt",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [
        { ts: ts(), event: "guard_block", tool: "Bash", file: "rules/x.md", detail: "Protected path: rm -rf rules" },
        { ts: ts(), event: "guard_halt", tool: "Bash", file: "rules/x.md", detail: "Halt active — mutating Bash command blocked: rm -rf rules" },
      ];
      // A broken tracker with a working guard: one fail-open per completed
      // tool call, forty ordinary writes into a session. This combination is
      // live, not hypothetical — a tracker exception does not stop guard.ts
      // from blocking, so the blocks above keep arriving while these do.
      for (let i = 1; i <= 40; i++) {
        events.push({
          ts: ts(),
          event: "guard_error",
          detail: "Tracker error (fail-open): Error: ENOENT: no such file or directory, open '.guard-state/state-drift.json'",
        });
      }

      const { warnings } = await dashboard(seedWorkbench(events));
      const kinds = warnings.map((w) => w.event);

      // Charged to the warning class — which is what Step 5 prescribed — this
      // reads [ ...30 guard_error ] and NEITHER of the two.
      expect(kinds.filter((k) => RESCUED.has(k)).sort()).toEqual([
        "guard_block",
        "guard_halt",
      ]);
      const errors = kinds.filter((k) => k === "guard_error");
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.length).toBeLessThan(40);
      const stamps = warnings.map((w) => w.ts);
      expect(stamps).toEqual([...stamps].sort());
    },
    30000,
  );

  it(
    "a full warning load cannot evict the fail-open row",
    async () => {
      const ts = makeClock();
      // The other direction, and the one that matters more: the fail-open is
      // the OLDEST event here, so a shared 30-row budget drops it and the user
      // watching a busy session never learns the guard stopped running.
      const events: GuardEvent[] = [
        { ts: ts(), event: "guard_error", detail: "Guard error (fail-open): TypeError: config.guard.protectedPaths.some is not a function" },
      ];
      for (let i = 1; i <= 50; i++) events.push(warningRow(ts(), i));

      const { warnings } = await dashboard(seedWorkbench(events));
      expect(warnings.filter((w) => w.event === "guard_error").length).toBe(1);
      // And the warning class still gets its full, unshared 30.
      expect(warnings.filter((w) => w.event === "guard_block").length).toBe(30);
    },
    30000,
  );

  it(
    "with no guard_error the panel is unchanged",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [];
      for (let i = 1; i <= 40; i++) events.push(warningRow(ts(), i));
      for (let i = 1; i <= 12; i++) {
        events.push({ ts: ts(), event: "guard_advisory", tool: "Edit", file: `rules/r${i}.md`, detail: `advisory ${i}` });
      }

      const { warnings } = await dashboard(seedWorkbench(events));
      // The two-budget result exactly: last 30 warnings, then last 8
      // advisories, merged by timestamp. Asserted as the whole sequence rather
      // than as counts, so a reordering of the untouched path is caught too.
      expect(warnings.map((w) => w.detail)).toEqual([
        ...Array.from({ length: 30 }, (_, i) => `warning ${i + 11}`),
        ...Array.from({ length: 8 }, (_, i) => `advisory ${i + 5}`),
      ]);
    },
    30000,
  );

  it(
    "the served page renders a fail-open at no less than a block's weight",
    async () => {
      const page = await indexPage(seedWorkbench([]));
      const level = levelMapper(page);

      // The whole chain is pinned, not just the new branch, so a reordering
      // that swallows one event into another's arm fails here. A
      // `churn_critical` arm sat at the head of it until 2026-08-15 and is the
      // one line this block lost with the heatmap.
      expect(level("guard_block")).toEqual({ levelClass: "block", levelLabel: "Blocked" });
      expect(level("guard_halt")).toEqual({ levelClass: "halt", levelLabel: "Halt" });
      expect(level("guard_advisory")).toEqual({ levelClass: "advisory", levelLabel: "Advisory" });
      // Historical rows, and the arm is deliberately kept. Nothing has emitted
      // `state_drift` since 2026-08-15, when the session-state drift
      // measurement went with the hand-maintained counters that were its
      // subject — but `orchestrator-events.jsonl` is append-only, holds real
      // rows written before that, and the monitor is read across sessions
      // against logs older than itself. Dropping the arm would not remove a
      // row: they still reach the panel through WARNING_EVENT_TYPES, and would
      // render at the amber default labelled "Warning", which says less about a
      // historical divergence than "Stale state" does. Same call, same
      // reasoning, as the `queue_built` colour rule kept one step earlier.
      expect(level("state_drift")).toEqual({ levelClass: "warning", levelLabel: "Stale state" });
      // The amber default, reached now only by an event no arm names.
      expect(level("guard_allow")).toEqual({ levelClass: "warning", levelLabel: "Warning" });

      const failopen = level("guard_error");
      expect(failopen.levelLabel).toBe("Fail-open");
      // The falsification the issue names: a row that renders and is
      // indistinguishable from an advisory, or from the amber default.
      expect(failopen.levelClass).not.toBe("advisory");
      expect(failopen.levelClass).not.toBe("warning");

      // Weight, read off the shipped stylesheet rather than asserted in prose.
      // Default is amber, a block is orange, a halt is red; the fail-open row
      // takes the halt treatment, tint included.
      const rule = cssBody(page, `.warning-row.${failopen.levelClass}`);
      expect(rule).toContain("var(--red)");
      expect(rule.replace(/\s+/g, " ").trim()).toBe(
        cssBody(page, ".warning-row.halt").replace(/\s+/g, " ").trim(),
      );
      expect(cssBody(page, ".warning-row")).toContain("var(--yellow)");
      expect(cssBody(page, ".warning-row.block")).toContain("var(--orange)");
      expect(cssBody(page, ".warning-row.advisory")).toContain("var(--cyan)");
      // The level badge is red too — the border alone is easy to miss.
      expect(page).toContain(`.warning-row.${failopen.levelClass} .warning-level`);
    },
    30000,
  );
});

// ---------------------------------------------------------------------------
// The browser launch.
//
// `bin/monitor` ended with an unconditional `open http://localhost:$PORT`. The
// suite above spawns it eleven times, each on a throwaway free port whose
// server afterEach kills seconds later, so one `npm test` run opened eleven
// browser tabs on eleven ports that answer nothing, each stealing focus as it
// arrived. Run repeatedly, and at one point by five agents in parallel, that
// rendered the machine close to unusable. The tabs surfaced wherever the user
// happened to be working, so the flood was first reported against a consuming
// project; every process involved was this repository's own test harness.
//
// The fix is a gate on `[ -t 1 ]` plus an independent MONITOR_NO_BROWSER
// opt-out, and the cases below are why the gate rather than the opt-out is
// what closes it: the harness sets no variable, and neither does the next
// non-interactive caller nobody has written yet.
//
// HOW THESE MEASURE IT. A fake `open` is placed first on PATH and appends its
// argv to a marker file, so "a tab was opened" is a file that exists rather
// than a token found in the script's text. A lint that greps `bin/monitor`
// for `-t 1` would pass on a decoy in a comment and on a gate that is present
// but unreachable; this asserts on what the running script does.
// ---------------------------------------------------------------------------

/** A directory holding a fake `open` that records its argv instead of opening. */
function fakeOpen(): { dir: string; marker: string } {
  const dir = mkdtempSync(join(tmpdir(), "fusion-fakeopen-"));
  const marker = join(dir, "opened.txt");
  const script = join(dir, "open");
  writeFileSync(script, `#!/bin/sh\nprintf '%s\\n' "$@" >> '${marker}'\n`);
  chmodSync(script, 0o755);
  return { dir, marker };
}

function pathWith(dir: string): string {
  return `${dir}:${process.env.PATH ?? ""}`;
}

/**
 * Wait for `file` to appear, ending on an event rather than on a clock: the
 * file exists, or `proc` — the only process that can create it — has exited.
 *
 * The budget this replaces was ten seconds, and it was the whole of the failure
 * recorded in
 * `shared/issues/260811-1409_*_the-browser-launch-case-in-the-monitor-suite-fails-under-parallel-load-and-passes-in-isolation.md`:
 * three concurrent suites, three runs, the same case each time, the marker
 * arriving after the budget rather than never. `bin/monitor` sleeps 0.5 s after
 * forking the server and then launches, so on a saturated machine the launch is
 * late, not absent — and a late launch is not the defect these cases exist to
 * catch.
 */
async function waitForFile(file: string, proc: ChildProcess): Promise<boolean> {
  for (;;) {
    if (existsSync(file)) return true;
    if (proc.exitCode !== null || proc.signalCode !== null) return existsSync(file);
    await new Promise((r) => setTimeout(r, 50));
  }
}

// The launch sits behind a 0.5s sleep that starts once the server is forked,
// so the server answering is not yet evidence the launch was skipped. Every
// negative case waits well past that window before reading the marker.
const PAST_THE_LAUNCH_WINDOW = 2500;

describe("bin/monitor — the browser launch", () => {
  it(
    "a spawn with no terminal on stdout opens nothing, and still serves",
    async () => {
      const { dir, marker } = fakeOpen();
      const port = await startMonitor(seedWorkbench([]), {
        env: { PATH: pathWith(dir) },
      });

      await new Promise((r) => setTimeout(r, PAST_THE_LAUNCH_WINDOW));

      // The whole point: this is exactly how the suite above spawns it.
      expect(existsSync(marker)).toBe(false);
      // And suppressing the tab must not have suppressed the dashboard.
      const r = await fetch(`http://127.0.0.1:${port}/api/dashboard`);
      expect(r.ok).toBe(true);
    },
    30000,
  );

  it(
    "a terminal on stdout still gets the dashboard opened for it",
    async () => {
      const { dir, marker } = fakeOpen();
      const port = await startMonitor(seedWorkbench([]), {
        tty: true,
        env: { PATH: pathWith(dir) },
      });

      // Fails if the gate is too tight — a fix that made the monitor silent
      // for the human who started it would be a different defect. Two failure
      // shapes, and they are worth telling apart: `false` means the monitor
      // exited without opening anything, and a case timeout means it is alive
      // and has not opened. Nothing the monitor emits distinguishes "decided
      // not to launch" from "has not launched yet", so the second shape is the
      // case timeout and not a shorter budget dressed as an assertion.
      expect(
        await waitForFile(marker, lastMonitor()),
        "the monitor exited without opening the dashboard for its terminal",
      ).toBe(true);
      // `127.0.0.1`, not `localhost`, and the difference is the assertion.
      // This case spawns with the harness's `MONITOR_BIND=127.0.0.1` pin, so
      // the server is IPv4-only — and `localhost` resolves to `::1` first on
      // macOS and on modern Linux, so a tab opened at the name would reach a
      // socket that does not exist. The wrapper used to compose this URL from
      // a constant and therefore handed out the name on every path, including
      // the wildcard's IPv4 fallback. It now reads the URL the server itself
      // published after binding, so this string is a statement about which
      // socket got built. The dual-stack path's counterpart — where the name
      // *is* true, and is what gets launched — is pinned in the
      // "default wildcard bind" block below.
      expect(readFileSync(marker, "utf8").trim()).toBe(
        `http://127.0.0.1:${port}`,
      );
    },
    30000,
  );

  it(
    "MONITOR_NO_BROWSER suppresses the launch on a terminal too",
    async () => {
      const { dir, marker } = fakeOpen();
      const port = await startMonitor(seedWorkbench([]), {
        tty: true,
        env: { PATH: pathWith(dir), MONITOR_NO_BROWSER: "1" },
      });

      await new Promise((r) => setTimeout(r, PAST_THE_LAUNCH_WINDOW));

      expect(existsSync(marker)).toBe(false);
      const r = await fetch(`http://127.0.0.1:${port}/api/dashboard`);
      expect(r.ok).toBe(true);
    },
    30000,
  );
});

// ---------------------------------------------------------------------------
// bin/monitor — the default bind, and whether the name the program prints is a
// name the program answers at.
//
// WHY THIS BLOCK EXISTS. Every case above spawns with `MONITOR_BIND=127.0.0.1`
// and fetches `http://127.0.0.1:${port}` by address. Both halves of that make
// the suite deterministic, and both make it blind to one whole class of defect:
// a bind pinned to loopback never reaches the wildcard branch, and a fetch to a
// literal address never asks the resolver anything. So when `bin/monitor` bound
// the IPv4 wildcard while printing and launching `localhost` — which resolves
// to `::1` first on macOS and on modern Linux — the suite was green throughout,
// and stayed green for as long as the defect stood
// (`shared/issues/260812-0253`, and `260815-2327` for the gap itself).
//
// The property under test is not "the server serves". It is that the *name* the
// program hands a user resolves, on either family, to a socket the program is
// listening on. That needs the default bind and a request made by name with the
// family forced, and nothing else in this file does either.

/**
 * One HTTP request, made by NAME, forced onto a single address family.
 *
 * `fetch` cannot express this. Node's client does happy-eyeballs: a request to
 * `localhost` against an IPv4-only server succeeds after one refused `::1`
 * attempt, so a `fetch`-based assertion passes against the very defect it would
 * be written for. `autoSelectFamily: false` alongside an explicit `family` is
 * what turns the retry off and makes the failure observable.
 */
function getForcingFamily(
  host: string,
  port: number,
  family: 4 | 6,
  timeoutMs = 8000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const sock = connect({ host, port, family, autoSelectFamily: false });
    let buf = "";
    sock.setTimeout(timeoutMs, () => {
      sock.destroy(new Error(`no answer within ${timeoutMs}ms`));
    });
    sock.on("connect", () => {
      // HTTP/1.0: the monitor's handler leaves `protocol_version` at the
      // default, so the server closes the connection after answering and
      // `close` is the whole response.
      sock.write(`GET /api/dashboard HTTP/1.0\r\nHost: ${host}\r\n\r\n`);
    });
    sock.on("data", (d) => {
      buf += d.toString("utf8");
    });
    sock.on("error", reject);
    sock.on("close", () => resolve(buf));
  });
}

/**
 * Can this host host the case at all?
 *
 * Not a convenience skip. `bin/monitor`'s own MONITOR_BIND comment records a
 * state measured on the development machine on 2026-08-06: macOS parked a
 * non-loopback listener of a process without Local Network permission in CLOSED
 * and dropped its inbound SYNs even from 127.0.0.1. On a host in that state a
 * wildcard-bound monitor answers nobody, and this case would fail for the
 * host's privacy configuration rather than for anything about the monitor —
 * which is exactly the flakiness the harness's loopback pin was introduced to
 * end, and re-introducing it here would be a worse bargain than the blind spot.
 *
 * So the probe binds a dual-stack wildcard from *this* process and asks whether
 * loopback reaches it. Node and the monitor's python3 share a responsible app,
 * so they share that permission. Where the claim does not hold — measured on
 * macOS 15.7.7 on 2026-08-16, where all four bind spellings reach LISTEN and
 * answer — the probe passes and the case runs with no excuse available to it.
 * It also catches the unrelated CI shape where IPv6 loopback is absent
 * outright, which would make the `::1` half meaningless rather than failing.
 */
async function wildcardLoopbackUsable(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  const srv = createServer((s) => s.end());
  try {
    await new Promise<void>((res, rej) => {
      srv.once("error", rej);
      srv.listen({ port: 0, host: "::", ipv6Only: false }, () => res());
    });
  } catch (e) {
    return {
      ok: false,
      reason: `this host cannot bind the dual-stack wildcard at all: ${(e as Error).message}`,
    };
  }
  const addr = srv.address();
  const port = typeof addr === "object" && addr !== null ? addr.port : 0;
  try {
    for (const [host, family] of [
      ["127.0.0.1", 4],
      ["::1", 6],
    ] as const) {
      await new Promise<void>((res, rej) => {
        const s = connect({ port, host, family, autoSelectFamily: false });
        s.setTimeout(3000, () => s.destroy(new Error("timed out")));
        s.once("connect", () => {
          s.destroy();
          res();
        });
        s.once("error", rej);
      });
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      reason:
        `a dual-stack wildcard listener on this host is unreachable over loopback ` +
        `(${(e as Error).message}) — the state bin/monitor's MONITOR_BIND comment ` +
        `describes for macOS without Local Network permission, or a host with no ` +
        `IPv6 loopback. bin/monitor is not implicated: it is never started.`,
    };
  } finally {
    srv.close();
  }
}

describe("bin/monitor — the default wildcard bind", () => {
  it(
    "answers at `localhost` on both loopback families, with no MONITOR_BIND set",
    async (ctx) => {
      const pre = await wildcardLoopbackUsable();
      if (!pre.ok) {
        console.warn(`skipped — ${pre.reason}`);
        ctx.skip();
        return;
      }

      // `bind: null` deletes MONITOR_BIND rather than setting a wildcard, so
      // what runs is the address the program picks when nobody picked one.
      const port = await startMonitor(seedWorkbench([]), { bind: null });

      for (const family of [4, 6] as const) {
        const answer = await getForcingFamily("localhost", port, family);
        expect(
          answer,
          `the monitor prints http://localhost:${port} but does not answer ` +
            `there over IPv${family} — the URL it hands the user names a socket ` +
            `it is not listening on`,
        ).toMatch(/^HTTP\/1\.[01] 200/);
      }
    },
    30000,
  );
});

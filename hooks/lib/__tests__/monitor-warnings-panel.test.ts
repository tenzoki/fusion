import { describe, it, expect, afterEach } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
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
// when guard_advisory joined the panel, because an advisory is emitted once per
// exempted write and a curation session with FUSION_ALLOW_RULES_WRITE set emits
// them in bursts — thirty rewritten rule files would push every guard_block,
// guard_halt and churn_critical off the panel. The fix is
// two independent caps (MAX_WARNINGS_RETURNED for the warning class,
// MAX_ADVISORIES_RETURNED for the advisory class) merged back by timestamp, and
// a fix nothing tests is a fix that comes back.
//
// WHY IT DRIVES THE REAL BINARY. The panel logic lives in a Python heredoc
// inside a bash script; there is no importable module, and the script executes
// its server at the bottom of the same heredoc, so it cannot be imported for a
// unit test either. `fusion-paths.test.ts` and `fusion-plane.test.ts` set the
// precedent for driving a real `bin/` script through child_process; this file
// extends it to the one script that has to be spoken to over HTTP. The seam is
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

interface MonitorOpts {
  /** Extra environment for the monitor process (merged over process.env). */
  env?: Record<string, string>;
  /** Give the monitor a pseudo-terminal, so its `[ -t 1 ]` gate is true. */
  tty?: boolean;
}

/** Start the real monitor against `wb` and return the port it answers on. */
async function startMonitor(wb: string, opts: MonitorOpts = {}): Promise<number> {
  const port = await freePort();
  const argv = [monitorBin, "test", String(port), "-d", wb];
  const [cmd, ...args] = opts.tty === true ? ["python3", ptyRunner(), ...argv] : argv;
  // MONITOR_BIND=127.0.0.1: the monitor's default bind is 0.0.0.0 (LAN
  // dashboard), but macOS Local Network privacy parks a non-loopback listener
  // of an unauthorized process in CLOSED state (netstat shows CLOSED, never
  // LISTEN) and drops its inbound SYNs — even from loopback — so the fetch
  // poll below times out whenever the terminal app's Local Network permission
  // is absent or revoked. A loopback bind is exempt from that filtering,
  // which makes the suite deterministic regardless of TCC state.
  const proc = spawn(cmd, args, {
    stdio: "ignore",
    detached: true,
    env: { ...process.env, MONITOR_BIND: "127.0.0.1", ...opts.env },
  });
  running.push(proc);
  const deadline = Date.now() + 15000;
  for (;;) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/api/dashboard`);
      if (r.ok) return port;
    } catch {
      // not listening yet
    }
    if (Date.now() > deadline) throw new Error("monitor did not come up");
    await new Promise((r) => setTimeout(r, 100));
  }
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

afterEach(() => {
  while (running.length > 0) {
    const p = running.pop();
    if (p?.pid === undefined) continue;
    // Negative pid: the whole process group. `bin/monitor` is a bash wrapper
    // that execs python as a child, so killing the bash pid alone orphans a
    // listening server and the next test's port scan meets a stranger.
    try {
      process.kill(-p.pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  }
});

const RESCUED = new Set(["guard_block", "guard_halt", "churn_critical"]);

describe("bin/monitor — warnings panel capacity", () => {
  it(
    "an advisory burst cannot evict a block, halt or critical",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [
        // The three things the panel exists to surface — emitted FIRST, so a
        // single shared budget would rank them oldest and drop them.
        { ts: ts(), event: "churn_critical", tool: "Edit", file: "src/a.ts", detail: "Churn critical: 9 edits" },
        { ts: ts(), event: "guard_block", tool: "Bash", file: "rules/x.md", detail: "Protected path: rm -rf rules" },
        { ts: ts(), event: "guard_halt", tool: "Bash", file: "rules/x.md", detail: "Halt active — mutating Bash command blocked: rm -rf rules" },
      ];
      // A curation session: one advisory per exempted write, well past the
      // 30-row window on its own.
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

      // Every one of the three survives the burst. Under the single shared
      // budget this read [ ...29 advisories ] and nothing else.
      expect(kinds.filter((k) => RESCUED.has(k)).sort()).toEqual([
        "churn_critical",
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
      for (let i = 1; i <= 50; i++) {
        events.push({ ts: ts(), event: "churn_warning", tool: "Edit", file: `src/f${i}.ts`, detail: `warning ${i}` });
      }
      for (let i = 1; i <= 50; i++) {
        events.push({ ts: ts(), event: "guard_advisory", tool: "Edit", file: `rules/r${i}.md`, detail: `advisory ${i}` });
      }

      const { warnings } = await dashboard(seedWorkbench(events));
      // 30 is MAX_WARNINGS_RETURNED, unchanged and unshared. If the two classes
      // ever go back to competing for one budget this drops below 30.
      expect(warnings.filter((w) => w.event === "churn_warning").length).toBe(30);
      expect(warnings.filter((w) => w.event === "guard_advisory").length).toBeLessThanOrEqual(10);
    },
    30000,
  );

  it(
    "with no advisories the panel is byte-identical to the pre-split slice",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [];
      for (let i = 1; i <= 40; i++) {
        events.push({ ts: ts(), event: "churn_warning", tool: "Edit", file: `src/f${i}.ts`, detail: `warning ${i}` });
      }

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
          { ts: ts(), event: "tracker_record", tool: "Bash", detail: "Bash command observed" },
          { ts: ts(), event: "guard_advisory", tool: "Edit", file: "rules/a.md", detail: "advisory" },
        ]),
      );
      expect(warnings.map((w) => w.event)).toEqual(["guard_advisory"]);
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
    "a fail-open burst cannot evict a block, halt or critical",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [
        { ts: ts(), event: "churn_critical", tool: "Edit", file: "src/a.ts", detail: "Churn critical: 9 edits" },
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
          detail: "Tracker error (fail-open): Error: ENOENT: no such file or directory, open '.guard-state/churn.json'",
        });
      }

      const { warnings } = await dashboard(seedWorkbench(events));
      const kinds = warnings.map((w) => w.event);

      // Charged to the warning class — which is what Step 5 prescribed — this
      // reads [ ...30 guard_error ] and NONE of the three.
      expect(kinds.filter((k) => RESCUED.has(k)).sort()).toEqual([
        "churn_critical",
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
      for (let i = 1; i <= 50; i++) {
        events.push({ ts: ts(), event: "churn_warning", tool: "Edit", file: `src/f${i}.ts`, detail: `warning ${i}` });
      }

      const { warnings } = await dashboard(seedWorkbench(events));
      expect(warnings.filter((w) => w.event === "guard_error").length).toBe(1);
      // And the warning class still gets its full, unshared 30.
      expect(warnings.filter((w) => w.event === "churn_warning").length).toBe(30);
    },
    30000,
  );

  it(
    "with no guard_error the panel is unchanged",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [];
      for (let i = 1; i <= 40; i++) {
        events.push({ ts: ts(), event: "churn_warning", tool: "Edit", file: `src/f${i}.ts`, detail: `warning ${i}` });
      }
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
      // that swallows one event into another's arm fails here.
      expect(level("churn_critical")).toEqual({ levelClass: "critical", levelLabel: "Critical" });
      expect(level("guard_block")).toEqual({ levelClass: "block", levelLabel: "Blocked" });
      expect(level("guard_halt")).toEqual({ levelClass: "halt", levelLabel: "Halt" });
      expect(level("guard_advisory")).toEqual({ levelClass: "advisory", levelLabel: "Advisory" });
      expect(level("churn_warning")).toEqual({ levelClass: "warning", levelLabel: "Warning" });

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

/** Poll for `file` to appear, up to `ms`. */
async function waitForFile(file: string, ms: number): Promise<boolean> {
  const deadline = Date.now() + ms;
  for (;;) {
    if (existsSync(file)) return true;
    if (Date.now() > deadline) return false;
    await new Promise((r) => setTimeout(r, 100));
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
      // for the human who started it would be a different defect.
      expect(await waitForFile(marker, 10000)).toBe(true);
      expect(readFileSync(marker, "utf8").trim()).toBe(
        `http://localhost:${port}`,
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

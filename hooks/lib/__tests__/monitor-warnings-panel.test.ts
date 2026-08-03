import { describe, it, expect, afterEach } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// bin/monitor — warnings-panel capacity suite.
//
// WHY THIS FILE EXISTS. `bin/monitor` had no executable coverage at all: the
// only prior mentions of it in this directory are prose in guard-side tests
// describing what the monitor *would* render. That was survivable while the
// panel was a flat "last 30 matching events" slice. It stopped being survivable
// when guard_advisory joined the panel, because an advisory is emitted once per
// exempted write and a curation session with FUSION_ALLOW_RULES_WRITE set emits
// them in bursts — thirty rewritten rule files would push every guard_block,
// guard_halt, churn_critical and cross_file_critical off the panel. The fix is
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

/** Start the real monitor against `wb` and return its /api/dashboard payload. */
async function dashboard(wb: string): Promise<{ warnings: GuardEvent[] }> {
  const port = await freePort();
  const proc = spawn(monitorBin, ["test", String(port), "-d", wb], {
    stdio: "ignore",
    detached: true,
  });
  running.push(proc);
  const deadline = Date.now() + 15000;
  for (;;) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/api/dashboard`);
      if (r.ok) return (await r.json()) as { warnings: GuardEvent[] };
    } catch {
      // not listening yet
    }
    if (Date.now() > deadline) throw new Error("monitor did not come up");
    await new Promise((r) => setTimeout(r, 100));
  }
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

const RESCUED = new Set([
  "guard_block",
  "guard_halt",
  "churn_critical",
  "cross_file_critical",
]);

describe("bin/monitor — warnings panel capacity", () => {
  it(
    "an advisory burst cannot evict a block, halt or critical",
    async () => {
      const ts = makeClock();
      const events: GuardEvent[] = [
        // The four things the panel exists to surface — emitted FIRST, so a
        // single shared budget would rank them oldest and drop them.
        { ts: ts(), event: "churn_critical", tool: "Edit", file: "src/a.ts", detail: "Churn critical: 9 edits" },
        { ts: ts(), event: "cross_file_critical", tool: "Edit", file: "src/b.ts", detail: "Cross-file critical: 11 files" },
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

      // Every one of the four survives the burst. Under the single shared
      // budget this read [ ...29 advisories ] and nothing else.
      expect(kinds.filter((k) => RESCUED.has(k)).sort()).toEqual([
        "churn_critical",
        "cross_file_critical",
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

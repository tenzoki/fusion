import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// `bin/fusion-session-domain` is a bash script; this drives the real one against
// throwaway workbenches, the way its three skill callers do. Under test is the
// header's contract: two lines always, in order; the stderr reason on a
// fallback; exit 3 with NOTHING on stdout when no workbench is above cwd, because
// a defaulted domain there would be an answer about a project that never ran
// setup; and the row filters that decide which `session_start` is read
// (issue 260824-2056, the session-domain helper ships with no test).
//
// The state-file fallback under the event-log read went on 2026-09-10 with the
// file nothing writes any more, and the cases that drove it went with it. A
// leftover state file is now inert, which the case below asserts directly.

const script = join(pluginRoot, "bin", "fusion-session-domain");
const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/**
 * A project with a workbench. `state` is a leftover state-file body, `null` for
 * none — nothing reads it, and one case proves that; `log` the event-log lines,
 * `checkout` this checkout's own identifier.
 */
function project(
  state: string | null,
  workbench = true,
  extra: { log?: Record<string, unknown>[]; checkout?: string } = {},
): string {
  const dir = mkdtempSync(join(tmpdir(), "fusion-session-domain-"));
  tmpRoots.push(dir);
  if (workbench) {
    mkdirSync(join(dir, "fusion-workbench"));
    writeFileSync(join(dir, "fusion-workbench", ".fusion-setup"), "{}\n");
    if (state !== null) writeFileSync(join(dir, "fusion-workbench", "agentstate.yaml"), state);
    if (extra.log)
      writeFileSync(
        join(dir, "fusion-workbench", "orchestrator-events.jsonl"),
        extra.log.map((r) => JSON.stringify(r)).join("\n") + "\n",
      );
    if (extra.checkout)
      writeFileSync(join(dir, "fusion-workbench", ".checkout-id"), extra.checkout + "\n");
  }
  return dir;
}

/** One hook-written `session_start` row. */
const hookRow = (ts: string, domain: string, checkout?: string) => ({
  ts,
  event: "session_start",
  writer: "session-start-hook",
  ...(checkout === undefined ? {} : { checkout }),
  session_id: `s-${ts}`,
  domain,
});

function run(cwd: string, ...args: string[]) {
  const r = spawnSync(script, args, { cwd, encoding: "utf-8" });
  return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

describe("bin/fusion-session-domain", () => {
  it.each([
    ["quoted", '{"domain":"data"}'],
    ["a further field after it", '{"domain":"data","detail":"x"}'],
  ])("reads the hook-written row's domain and says it came from the event log (%s)", (_, tail) => {
    const row =
      '{"ts":"2026-09-10T05:00:00","event":"session_start","writer":"session-start-hook",' +
      tail.slice(1);
    const r = run(project(null, true, { log: [JSON.parse(row)] }));
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("domain=data\nsource=event-log\n");
    expect(r.stderr).toBe("");
  });

  it.each([
    ["missing log", undefined, "does not exist"],
    ["log with no hook row", [{ ts: "2026-09-10T05:00:00", event: "session_start", domain: "data" }],
      "carries no hook-written session_start row"],
    ["invalid value", [hookRow("2026-09-10T05:00:00", "both")],
      "carries no hook-written session_start row"],
  ])("defaults to code on a %s and says why on stderr", (_, log, reason) => {
    const r = run(project(null, true, log === undefined ? {} : { log: log as never }));
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("domain=code\nsource=default\n");
    expect(r.stderr).toContain(reason as string);
  });

  it("a leftover state file at the workbench root is inert — nothing reads it", () => {
    // The one source went to the event log on 2026-09-10. A project upgrading
    // with the old file still in its workbench must default, not read it.
    const r = run(project('session:\n  domain: "data"\n'));
    expect(r.stdout).toBe("domain=code\nsource=default\n");
    expect(r.stderr).not.toContain("agentstate");
  });

  it("exit 3 with nothing on stdout when no workbench is above the working directory", () => {
    const r = run(project(null, false));
    expect(r.status).toBe(3);
    expect(r.stdout).toBe("");
    expect(r.stderr).toContain("no fusion workbench");
  });

  it("exit 2 on any argument, with nothing on stdout", () => {
    const r = run(project(null), "--help");
    expect(r.status).toBe(2);
    expect(r.stdout).toBe("");
  });

  it("reads the newest row of its own checkout, not another checkout's block", () => {
    // A `merge=union` pull leaves the two blocks interleaved with no ordering
    // between them, so the newest row in the FILE is a stranger's.
    const r = run(project(null, true, {
      checkout: "5e8248d7",
      log: [
        hookRow("2026-09-10T05:00:00", "data", "5e8248d7"),
        hookRow("2026-09-10T09:00:00", "code", "ffffffff"),
      ],
    }));
    expect(r.stdout).toBe("domain=data\nsource=event-log\n");
  });

  it("ignores the model's own session_start row, which carries no domain to read", () => {
    const r = run(project(null, true, {
      log: [
        { ts: "2026-09-10T05:00:00", event: "session_start", session_id: "s", domain: "code" },
        hookRow("2026-09-10T04:00:00", "data"),
      ],
    }));
    expect(r.stdout, "a row with no `writer` was read as the hook's").toBe(
      "domain=data\nsource=event-log\n",
    );
  });
});

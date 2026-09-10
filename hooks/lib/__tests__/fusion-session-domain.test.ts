import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";

// `bin/fusion-session-domain` is a bash script; this drives the real one against
// throwaway workbenches, the way its three skill callers do. Under test is the
// header's contract: two lines always, in order; the three-way stderr reason on a
// fallback; exit 3 with NOTHING on stdout when no workbench is above cwd, because
// a defaulted domain there would be an answer about a project that never ran
// setup; and the read's true bound, the first two-space `domain:` key in the file
// (issue 260824-2056, the session-domain helper ships with no test).

const script = join(pluginRoot, "bin", "fusion-session-domain");
const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/**
 * A project with a workbench. `state` is the agentstate.yaml body, `null` for
 * none; `log` the event-log lines, `checkout` this checkout's own identifier.
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
    ["quoted", 'session:\n  domain: "data"\n'],
    ["bare", "session:\n  domain: data\n"],
  ])("reads a %s session.domain and says it came from agentstate", (_, yaml) => {
    const r = run(project(yaml));
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("domain=data\nsource=agentstate\n");
    expect(r.stderr).toBe("");
  });

  it.each([
    ["missing file", null, "does not exist"],
    ["missing key", "session:\n  turn: 1\n", "carries no session.domain"],
    ["invalid value", "session:\n  domain: both\n", "session.domain=both, which is neither"],
    ["uncapturable value", "session:\n  domain: Code\n", "session.domain=Code, which is neither"],
    ["key nested deeper", "session:\n  meta:\n    domain: data\n", "carries no session.domain"],
  ])("defaults to code on a %s and says why on stderr", (_, yaml, reason) => {
    const r = run(project(yaml));
    expect(r.status).toBe(0);
    expect(r.stdout).toBe("domain=code\nsource=default\n");
    expect(r.stderr).toContain(reason);
  });

  it("reads the first two-space domain key, whichever block holds it (the header states this bound)", () => {
    const r = run(project("plan_context:\n  domain: data\nsession:\n  domain: code\n"));
    expect(r.stdout).toBe("domain=data\nsource=agentstate\n");
  });

  it("exit 3 with nothing on stdout when no workbench is above the working directory", () => {
    const r = run(project(null, false));
    expect(r.status).toBe(3);
    expect(r.stdout).toBe("");
    expect(r.stderr).toContain("no fusion workbench");
  });

  it("exit 2 on any argument, with nothing on stdout", () => {
    const r = run(project("session:\n  domain: data\n"), "--help");
    expect(r.status).toBe(2);
    expect(r.stdout).toBe("");
  });

  // The event log ahead of the file, and the file still behind it. Step B4 is
  // additive: nothing here removes the agentstate read, and the cases above
  // still pass unchanged because a project with no log reaches it exactly as
  // it did.
  it("prefers the hook-written row's domain over the one agentstate.yaml records", () => {
    const r = run(project("session:\n  domain: code\n", true, {
      log: [hookRow("2026-09-10T05:00:00", "data")],
    }));
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("domain=data\nsource=event-log\n");
    expect(r.stderr).toBe("");
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
    const r = run(project("session:\n  domain: data\n", true, {
      log: [{ ts: "2026-09-10T05:00:00", event: "session_start", session_id: "s", domain: "code" }],
    }));
    expect(r.stdout, "a row with no `writer` was read as the hook's").toBe(
      "domain=data\nsource=agentstate\n",
    );
  });

  it("names both sources on a default, not the file alone", () => {
    const r = run(project(null, true, {
      log: [hookRow("2026-09-10T05:00:00", "both")],
    }));
    expect(r.stdout).toBe("domain=code\nsource=default\n");
    expect(r.stderr).toContain("carries no hook-written session_start row");
    expect(r.stderr).toContain("agentstate.yaml does not exist");
  });
});

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

/** A project with a workbench; `state` is the agentstate.yaml body, `null` for none. */
function project(state: string | null, workbench = true): string {
  const dir = mkdtempSync(join(tmpdir(), "fusion-session-domain-"));
  tmpRoots.push(dir);
  if (workbench) {
    mkdirSync(join(dir, "fusion-workbench"));
    writeFileSync(join(dir, "fusion-workbench", ".fusion-setup"), "{}\n");
    if (state !== null) writeFileSync(join(dir, "fusion-workbench", "agentstate.yaml"), state);
  }
  return dir;
}

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
});

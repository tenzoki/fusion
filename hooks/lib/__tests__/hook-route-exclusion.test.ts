import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, relative, resolve } from "node:path";
import { parseLog } from "../events-query.js";
import { workItemFromPrompt } from "../orchestrator-events.js";
import { CASE_TIMEOUT, HOOKS_DIR, REPO_ROOT, TEST_DIST, childEnv, readOrchestratorEvents } from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// No automatic hook reaches the rule helper, the claimed-package helper or the
// codec: pinned on the commands `hooks/hooks.json` configures.
//
// WHY NOT BY IMPORTS ALONE. The route this file was written against had no
// import in it: the PreToolUse hook ran `bin/fusion-rules` as a subprocess to
// size a dispatch, and that helper runs `bin/fusion-claimed-package` where a
// project has a context manifest. An import walk read that hook as clean. So
// the commands are RUN here, as the shell runs them, against a scratch plugin
// whose helpers of concern are logging stubs, and the log is read.
//
// THE SCRATCH PLUGIN is an install's layout: this run's compiled hooks under
// `hooks/dist/`, the real `bin/` and `rules/`, and then a stub in the place of
// each helper that is on the codec or is put there by the JSON cutover, and in
// the place of the bundle. `PATH`, `CLAUDE_PLUGIN_ROOT` and
// `FUSION_PLUGIN_ROOT` all name it, so a helper resolved beside the compiled
// module, through the variable or by name lands on a stub.
//
// THE EXPLICIT CALL at the end is the control: the real rule helper, called by
// hand in the same project, does reach the claimed-package stub. It shows that
// the log records a call when one happens, and that the helpers a session
// calls keep the behaviour the hooks no longer share.
// ---------------------------------------------------------------------------

/** What the stubs stand in for. The last two are `bin/fusion-record` and the write client; the bundle has a stub of its own. */
const STUBBED = ["fusion-rules", "fusion-claimed-package", "fusion-paths", "fusion-work-order", "fusion-record", "fusion-write"] as const;
/** The real rule helper, kept under a name no hook could resolve. */
const RULES_BY_HAND = "fusion-rules-called-by-hand";
const BYTE_FIELDS = ["bytes_prompt", "bytes_rules", "bytes_claude_md", "bytes_total", "bytes_delta"];
/** One fixed instant for every file the old memo was keyed on, so a seeded memo entry is a true hit. */
const STAMP = new Date("2026-09-01T00:00:00Z");
const PERSON = "Test Person <t@example.com>";
const CHECKOUT = "5e8248d7";

interface Configured {
  event: string;
  matcher: string | undefined;
  command: string;
}

/** Every command `hooks/hooks.json` configures, in file order. */
function configured(): Configured[] {
  const cfg = JSON.parse(readFileSync(resolve(HOOKS_DIR, "hooks.json"), "utf-8")) as {
    hooks: Record<string, Array<{ matcher?: string; hooks: Array<{ command: string }> }>>;
  };
  return Object.entries(cfg.hooks).flatMap(([event, entries]) =>
    entries.flatMap((e) => e.hooks.map((h) => ({ event, matcher: e.matcher, command: h.command }))),
  );
}

let base: string;
let plugin: string;

const log = (): string => resolve(plugin, "calls.log");
/** The calls the stubs saw, as `[helper, arguments]`. */
const calls = (): string[][] => (existsSync(log()) ? readFileSync(log(), "utf-8").split("\n").filter((l) => l !== "").map((l) => l.split("\t")) : []);
/** The calls since a case began. The log is the plugin's and outlives a case, so a case reads its own stretch. */
const since = (before: number): string[][] => calls().slice(before);

function stamp(path: string): void {
  utimesSync(path, STAMP, STAMP);
}

beforeAll(() => {
  base = realpathSync(mkdtempSync(resolve(tmpdir(), "fusion-route-")));
  plugin = resolve(base, "plugin");
  cpSync(resolve(REPO_ROOT, "bin"), resolve(plugin, "bin"), { recursive: true });
  cpSync(resolve(REPO_ROOT, "rules"), resolve(plugin, "rules"), { recursive: true });
  cpSync(TEST_DIST, resolve(plugin, "hooks", "dist"), { recursive: true });
  cpSync(resolve(HOOKS_DIR, "package.json"), resolve(plugin, "hooks", "package.json"));

  renameSync(resolve(plugin, "bin", "fusion-rules"), resolve(plugin, "bin", RULES_BY_HAND));
  for (const name of STUBBED) {
    const path = resolve(plugin, "bin", name);
    writeFileSync(path, `#!/usr/bin/env bash\nprintf '%s\\t%s\\n' "$(basename "$0")" "$*" >> "$(cd "$(dirname "$0")/.." && pwd)/calls.log"\n`, "utf-8");
    chmodSync(path, 0o755);
  }
  mkdirSync(resolve(plugin, "codec", "dist"), { recursive: true });
  writeFileSync(
    resolve(plugin, "codec", "dist", "fusion-record.js"),
    'require("node:fs").appendFileSync(require("node:path").resolve(__dirname, "..", "..", "calls.log"), "codec-bundle\\t\\n");\n',
    "utf-8",
  );
  for (const f of readdirSync(resolve(plugin, "rules"))) stamp(resolve(plugin, "rules", f));
  stamp(resolve(plugin, "rules"));
});

afterAll(() => rmSync(base, { recursive: true, force: true }));

/** A project with a workbench and a context manifest: the condition under which the old route was live. */
function project(name: string): string {
  const root = resolve(base, name);
  mkdirSync(resolve(root, "fusion-workbench"), { recursive: true });
  mkdirSync(resolve(root, "rules"), { recursive: true });
  writeFileSync(resolve(root, "fusion-workbench", ".fusion-setup"), '{"harness":true}\n', "utf-8");
  writeFileSync(resolve(root, "notes.txt"), "notes\n", "utf-8");
  writeFileSync(resolve(root, "CLAUDE.md"), "# project\n", "utf-8");
  writeFileSync(resolve(root, "rules", "unit.md"), "# a unit\n", "utf-8");
  writeFileSync(
    resolve(root, "rules", "context-manifest.yaml"),
    ["units:", "  - path: rules/unit.md", "    agents: [code-implementer]", "    topics: [always]", ""].join("\n"),
    "utf-8",
  );
  for (const f of ["CLAUDE.md", "rules/unit.md", "rules/context-manifest.yaml", "rules"]) stamp(resolve(root, f));
  return root;
}

/** One configured command, run as the shell runs it, in `root`, with `payload` on stdin. */
function run(command: string, root: string, payload: object): void {
  const child = spawnSync("/bin/sh", ["-c", command], {
    cwd: root,
    input: JSON.stringify(payload),
    encoding: "utf-8",
    env: childEnv({
      PATH: `${resolve(plugin, "bin")}:${process.env.PATH ?? ""}`,
      CLAUDE_PLUGIN_ROOT: plugin,
      FUSION_PLUGIN_ROOT: plugin,
      CLAUDE_ENV_FILE: resolve(root, "env-file"),
      FUSION_PERSON: PERSON,
      FUSION_CHECKOUT: CHECKOUT,
    }),
  });
  expect(child.status, `${command}\nstderr: ${child.stderr}`).toBe(0);
  expect(child.stderr, command).not.toMatch(/\[(guard|tracker|session-start|subagent-stop)\] Error:/);
}

const DISPATCH_INPUT = {
  subagent_type: "fusion:code-implementer",
  description: "measure nothing",
  prompt: "**Work-item:** `260929-1810-the-item`\n\ndo the thing",
};

/** The payloads one tool of a matcher is run with. A dispatch is run completed and backgrounded. */
function payloads(event: string, tool: string | undefined, root: string): object[] {
  const head = { session_id: "sid-route", hook_event_name: event };
  // Every SessionStart source, since the entry branches on it.
  if (tool === undefined) return ["startup", "resume", "clear", "compact"].map((source) => ({ ...head, source, agent_id: "agent-route", agent_type: "fusion:code-implementer" }));
  if (tool === "Task" || tool === "Agent") {
    const call = { ...head, tool_name: tool, tool_use_id: `toolu_${tool}`, tool_input: DISPATCH_INPUT };
    if (event !== "PostToolUse") return [call];
    return [
      { ...call, tool_response: { status: "completed" } },
      { ...call, tool_response: { status: "async_launched", agentId: "agent-route" } },
    ];
  }
  if (tool === "Bash") return [{ ...head, tool_name: tool, tool_input: { command: "true" } }];
  // A write beside the workbench and one inside it, since the tracker tells the two apart.
  return [resolve(root, "notes.txt"), resolve(root, "fusion-workbench", "notes.md")].map((f) => ({ ...head, tool_name: tool, tool_input: { file_path: f, notebook_path: f } }));
}

/** Run the PreToolUse commands for both names of the dispatch tool; return the rows they wrote. */
function dispatch(root: string): Record<string, unknown>[] {
  const pre = configured().filter((c) => c.event === "PreToolUse");
  expect(pre.length, "hooks.json configures no PreToolUse command").toBeGreaterThan(0);
  for (const c of pre) {
    for (const tool of ["Task", "Agent"]) {
      expect((c.matcher ?? "").split("|"), "the dispatch tool left the PreToolUse matcher").toContain(tool);
      for (const p of payloads("PreToolUse", tool, root)) run(c.command, root, p);
    }
  }
  return readOrchestratorEvents(root).filter((r) => r.event === "task_start");
}

/** What a `task_start` row is: its identity, the work item, and no byte field. */
function expectTheRow(rows: Record<string, unknown>[]): void {
  expect(rows.map((r) => r.task)).toEqual(["toolu_Task", "toolu_Agent"]);
  for (const row of rows) {
    expect(Object.keys(row)).toEqual(["ts", "event", "task", "agent", "person", "checkout", "session_id", "detail", "work_item"]);
    expect(row).toMatchObject({
      agent: "code-implementer",
      person: PERSON,
      checkout: CHECKOUT,
      session_id: "sid-route",
      detail: DISPATCH_INPUT.description,
      work_item: "260929-1810-the-item",
    });
    expect(Object.keys(row).filter((k) => BYTE_FIELDS.includes(k) || k.startsWith("bytes"))).toEqual([]);
  }
}

describe("the dispatch route measures nothing and starts no helper of concern", () => {
  it("without a cache: writes the row, calls no stub, and creates no measurement file", () => {
    const root = project("cold");
    const before = calls().length;
    const rows = dispatch(root);
    // The log first: it is what this file is for, and a row carrying byte fields is its consequence.
    expect(since(before), "the automatic route reached a helper it must not reach").toEqual([]);
    expect(existsSync(resolve(root, "fusion-workbench", ".guard-state")), "the dispatch wrote guard state").toBe(false);
    expectTheRow(rows);
  }, CASE_TIMEOUT);

  it("with an existing cache: writes the row without a stale figure, and leaves both files as they were", () => {
    const root = project("warm");
    const before = calls().length;
    const state = resolve(root, "fusion-workbench", ".guard-state");
    mkdirSync(state, { recursive: true });
    // A memo entry the removed measurement would have HIT, and a baseline it would have read a delta from.
    const files: Record<string, string> = {
      "rule-sizes.json": JSON.stringify({ "code-implementer": { pluginRoot: plugin, stamp: STAMP.getTime(), bytes: 4242 } }),
      "byte-baseline.json": JSON.stringify({ "code-implementer": 4000 }),
    };
    for (const [name, content] of Object.entries(files)) {
      writeFileSync(resolve(state, name), content, "utf-8");
      stamp(resolve(state, name));
    }

    const rows = dispatch(root);
    expect(since(before), "the automatic route reached a helper it must not reach").toEqual([]);
    expectTheRow(rows);
    expect(readdirSync(state).sort(), "the dispatch added guard state").toEqual(Object.keys(files).sort());
    for (const [name, content] of Object.entries(files)) {
      expect(readFileSync(resolve(state, name), "utf-8"), `${name} was rewritten`).toBe(content);
      expect(statSync(resolve(state, name)).mtimeMs, `${name} was touched`).toBe(STAMP.getTime());
    }
  }, CASE_TIMEOUT);

  it("reads the work item off the prompt and nothing else", () => {
    expect(workItemFromPrompt({ prompt: "**Work-item:** `260909-1843_o_thing.md`\nbody" })).toBe("260909-1843_o_thing.md");
    expect(workItemFromPrompt({ prompt: "**Work-item:** work-packages/a/a.md" })).toBe("a.md");
    expect(workItemFromPrompt({ prompt: "no line here" })).toBeUndefined();
    expect(workItemFromPrompt(undefined)).toBeUndefined();
  });

  it("writes NO work_item key when the prompt names none", () => {
    const root = project("no-item");
    const pre = configured().filter((c) => c.event === "PreToolUse");
    for (const c of pre) run(c.command, root, { session_id: "sid-none", hook_event_name: "PreToolUse", tool_name: "Task", tool_use_id: "toolu_none", tool_input: { ...DISPATCH_INPUT, prompt: "just a directive" } });
    const rows = readOrchestratorEvents(root).filter((r) => r.event === "task_start");
    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0]), "work_item was written empty").not.toContain("work_item");
  }, CASE_TIMEOUT);
});

describe("a reader takes rows with and without the byte fields", () => {
  it("parses both, and an absent field becomes no figure rather than a zero", () => {
    const identity = { ts: "2026-09-29T18:00:00", event: "task_start", task: "t1", agent: "code-implementer", session_id: "s", work_item: "w.md" };
    const before = { ...identity, bytes_prompt: 12165, bytes_rules: 86650, bytes_claude_md: 8021, bytes_total: 106836, bytes_delta: 0 };
    const parsed = parseLog(`${JSON.stringify(before)}\n${JSON.stringify(identity)}\n`);
    expect(parsed.malformed).toBe(0);
    expect(parsed.lines).toEqual([identity, identity]);
  });
});

describe("every other configured hook command stays off the same helpers", () => {
  it("covers the four hook events hooks.json configures", () => {
    expect([...new Set(configured().map((c) => c.event))].sort()).toEqual(["PostToolUse", "PreToolUse", "SessionStart", "SubagentStop"]);
  });

  it("runs each command for every tool its matcher names, and no stub is called", () => {
    const root = project("every-entry");
    const before = calls().length;
    let ran = 0;
    for (const c of configured()) {
      const tools = c.matcher === undefined ? [undefined] : c.matcher.split("|");
      for (const tool of tools) {
        for (const p of payloads(c.event, tool, root)) {
          run(c.command, root, p);
          ran++;
        }
      }
    }
    // SubagentStop after a backgrounded launch is the one row that comes due late; it was run above.
    expect(ran).toBeGreaterThanOrEqual(configured().length);
    expect(since(before), "an automatic hook command reached a helper it must not reach").toEqual([]);
  }, 4 * CASE_TIMEOUT);

  /** The compiled modules an entry reaches through its relative imports, itself included. */
  function reached(entry: string, seen = new Set<string>()): Set<string> {
    if (seen.has(entry)) return seen;
    seen.add(entry);
    const source = readFileSync(entry, "utf-8");
    for (const m of source.matchAll(/(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g)) reached(resolve(dirname(entry), m[1]), seen);
    return seen;
  }

  it("reaches no record client by import, and starts a subprocess from three modules only", () => {
    const entries = [...new Set(configured().flatMap((c) => [...c.command.matchAll(/hooks\/dist\/([a-z-]+\.js)/g)].map((m) => m[1])))].sort();
    expect(entries).toEqual(["guard.js", "identity-notice.js", "session-id.js", "session-start.js", "subagent-stop.js", "tracker.js"]);

    const modules = new Set<string>();
    for (const e of entries) for (const m of reached(resolve(TEST_DIST, e))) modules.add(relative(TEST_DIST, m));
    expect(existsSync(resolve(TEST_DIST, "lib", "record-client.js")), "the record client is not in this build").toBe(true);
    expect([...modules], "an automatic hook imports the record client").not.toContain("lib/record-client.js");

    // A fourth module, or a new program below, is a new subprocess on an automatic route.
    const spawning = [...modules].filter((m) => /["']node:child_process["']/.test(readFileSync(resolve(TEST_DIST, m), "utf-8"))).sort();
    expect(spawning).toEqual(["lib/git.js", "lib/orchestrator-events.js", "session-start.js"]);
    // What each starts, one entry per call site, on every branch whether a payload takes it or not.
    const started = spawning.map((m) => [m, programsStarted(readFileSync(resolve(TEST_DIST, m), "utf-8"))]);
    expect(started).toEqual([["lib/git.js", ["git"]], ["lib/orchestrator-events.js", ["bin/fusion-identity"]], ["session-start.js", ["bin/fusion-count-sources"]]]);
  });

  /** Per `node:child_process` call, its first argument (a literal, or what a local was declared as) as a program; an unread import matches no call. */
  function programsStarted(source: string): string[] {
    const names = /import\s*\{([^}]*)\}\s*from\s*["']node:child_process["']/.exec(source)?.[1].split(",").map((n) => n.trim().split(/\s+as\s+/).pop()) ?? [];
    const call = new RegExp(`(?<![.\\w$])(?:${names.join("|") || "$^"})\\(\\s*((?:[^,()]|\\([^()]*\\))+)`, "g");
    return [...source.matchAll(call)].map((c) => {
      const arg = c[1].trim();
      const expr = /^[\w$]+$/.test(arg) ? (new RegExp(`(?:const|let|var)\\s+${arg}\\s*=\\s*([^;]+);`).exec(source)?.[1] ?? arg) : arg;
      const literals = [...expr.matchAll(/["']([^"']+)["']/g)].map((m) => m[1]);
      const bin = literals.lastIndexOf("bin");
      return bin >= 0 ? ["bin", ...literals.slice(bin + 1)].join("/") : literals.join("/") || expr;
    });
  }
});

describe("a helper somebody calls keeps its behaviour", () => {
  it("the rule helper, called by hand in a project with a manifest, asks the claimed-package helper", () => {
    const root = project("by-hand");
    const before = calls().length;
    const child = spawnSync(resolve(plugin, "bin", RULES_BY_HAND), ["code-implementer"], {
      cwd: root,
      encoding: "utf-8",
      env: childEnv({ FUSION_PLUGIN_ROOT: plugin }),
    });
    expect(child.status, child.stderr).toBe(0);
    expect(child.stdout.split("\n")).toContain("rules/unit.md");
    expect(since(before)).toEqual([["fusion-claimed-package", ""]]);
  }, CASE_TIMEOUT);
});

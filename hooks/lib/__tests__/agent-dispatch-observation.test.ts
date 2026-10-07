import { describe, expect, it, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { ask } from "../record-client.js";
import { REPO_ROOT } from "./helpers/guard-harness.js";
import { BUNDLE } from "./helpers/json-workbench.js";

// ---------------------------------------------------------------------------
// Shipped prompts, observed: agents dispatched headless against scratch
// projects, judged by what they leave on disk or by a fixed output line, never
// by their prose (plan 261007-1836, step 7; issue 261005-1018).
//
// ## Why it is opt-in
//
// Every case is a real `claude -p` run: it costs model tokens, takes minutes,
// and is non-deterministic, so one pass proves one run and not every run. It
// runs only when `FUSION_AGENT_RUN=1` is set AND `claude` is on PATH; without
// both the file collects and every case skips. Run it deliberately:
//
//   cd hooks && FUSION_AGENT_RUN=1 npx vitest run lib/__tests__/agent-dispatch-observation.test.ts
//
// A failed case is a finding to record, not a run to repeat until it passes.
//
// ## The harness
//
// Each case builds its own scratch git project under one temp directory, with
// a JSON workbench (the codec fixture's manifest, a setup marker naming this
// tree's version) and a package claimed by the scratch checkout, every record
// written through this tree's `bin/fusion-write`. The agent runs as
//
//   claude --plugin-dir <this work tree> --agent fusion:<name> -p <instruction>
//          --permission-mode bypassPermissions --output-format json
//
// with the scratch project as cwd. The child's environment drops every
// `CLAUDE*` and `FUSION_*` variable of the session that started the suite
// (`CLAUDE_CONFIG_DIR` excepted), so neither the parent's installed plugin
// copy nor its checkout identity leaks in, and names `FUSION_PLUGIN_ROOT` as
// the work tree, the value the plugin's SessionStart hook exports for
// `--plugin-dir`. Nothing is removed afterwards: each run's JSON transcript
// and its scratch project stay under the directory the suite prints, which is
// what a recorded observation cites.
// ---------------------------------------------------------------------------

const ON = process.env.FUSION_AGENT_RUN === "1" && spawnSync("sh", ["-c", "command -v claude"]).status === 0;
const MIN = 60_000;
const BIN = (name: string) => resolve(REPO_ROOT, "bin", name);
const VERSION = JSON.parse(readFileSync(resolve(REPO_ROOT, ".claude-plugin", "plugin.json"), "utf-8")).version as string;
const AUDIT = /^\*\*Audit result:\*\* (coherent|review-needed|directive-partially-met|bounded-closure-proposed)\b/m;

const ENV: NodeJS.ProcessEnv = Object.fromEntries(Object.entries(process.env).filter(([k]) => k === "CLAUDE_CONFIG_DIR" || !/^(CLAUDE|FUSION_)/.test(k)));
let base = "";

beforeAll(() => {
  if (!ON) return;
  base = realpathSync(mkdtempSync(resolve(tmpdir(), "fusion-agent-run-")));
  console.log(`agent-dispatch-observation: transcripts and scratch projects under ${base}`);
});

interface Scratch {
  root: string;
  workbench: string;
  /** The claimed package: its stem, container and control path, workbench-relative. */
  a: { stem: string; dir: string; path: string };
}

/** One command that must succeed; its stdout. */
function run(cwd: string, cmd: string, args: string[]): string {
  const r = spawnSync(cmd, args, { cwd, env: ENV, encoding: "utf-8" });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} exited ${r.status}: ${r.stderr}`);
  return r.stdout;
}
const write = (s: Scratch, ...args: string[]) => run(s.root, BIN("fusion-write"), args);
const commit = (s: Scratch, message: string) => (run(s.root, "git", ["add", "-A"]), run(s.root, "git", ["commit", "-q", "-m", message]));
const put = (abs: string, body: string) => (mkdirSync(resolve(abs, ".."), { recursive: true }), writeFileSync(abs, body));

/** A scratch project named `label`: git, a JSON workbench, package A filed and claimed by this checkout, nothing committed. */
function scratch(label: string): Scratch {
  const root = resolve(base, label);
  const workbench = resolve(root, "fusion-workbench");
  const stem = "261007-2100-add-sum";
  const a = { stem, dir: `work-packages/${stem}`, path: `work-packages/${stem}/package.json` };
  mkdirSync(workbench, { recursive: true });
  for (const args of [["init", "-q"], ["config", "user.email", "scratch@example.com"], ["config", "user.name", "Scratch"]]) run(root, "git", args);
  writeFileSync(resolve(workbench, "workbench.json"), readFileSync(resolve(REPO_ROOT, "codec", "fixtures", "workbench", "workbench.json")));
  writeFileSync(resolve(workbench, ".fusion-setup"), JSON.stringify({ setup_at: new Date().toISOString(), plugin_version: VERSION }) + "\n");
  for (const store of ["plans", "issues", "decisions", "discussions", "reviews", "analyses"]) {
    mkdirSync(resolve(workbench, a.dir, store), { recursive: true });
    mkdirSync(resolve(workbench, "shared", store), { recursive: true });
  }
  put(resolve(root, "CLAUDE.md"), "# CLAUDE.md\n\n**Language:** en\n\nA scratch project: `src/` holds the code, `test/` its tests, run with `node --test`.\n");
  put(resolve(root, ".gitignore"), ["fusion-workbench/.json-state/", "fusion-workbench/.guard-state/", "fusion-workbench/.commit-lock/", "fusion-workbench/.checkout-id", "fusion-workbench/.session-marker", ""].join("\n"));
  put(resolve(workbench, a.dir, `${stem}.md`), `# Add sum\n\n## Directive\n\nAdd \`src/sum.js\` exporting \`sum(a, b)\`, which returns \`a + b\`, with a test under \`test/\`. Reached when \`node --test\` passes.\n`);
  const s = { root, workbench, a };
  write(s, "create", "--kind", "package", "--narrative-file", `${a.dir}/${stem}.md`, "--origin", "user-request", "--actor", "user", "--domain", "code");
  write(s, "claim", "--record", a.path, "--actor", "user");
  return s;
}

/** The work package A's directive asks for, as one commit after a base commit of everything else. */
function work(s: Scratch): void {
  commit(s, "chore: scratch project and workbench");
  put(resolve(s.root, "src", "sum.js"), "export function sum(a, b) {\n  return a + b;\n}\n");
  put(resolve(s.root, "test", "sum.test.js"), 'import { test } from "node:test";\nimport assert from "node:assert/strict";\nimport { sum } from "../src/sum.js";\n\ntest("sum adds", () => assert.equal(sum(2, 3), 5));\n');
  put(resolve(s.root, "package.json"), '{ "name": "scratch", "private": true, "type": "module" }\n');
  commit(s, "feat: add sum");
}

/** One headless dispatch; the reply, and the transcript path every assertion message names. */
function dispatch(s: Scratch, label: string, agent: string, instruction: string, timeout: number): { reply: string; transcript: string } {
  const args = ["--plugin-dir", REPO_ROOT, "--agent", `fusion:${agent}`, "-p", instruction, "--permission-mode", "bypassPermissions", "--output-format", "json"];
  const started = Date.now();
  const r = spawnSync("claude", args, { cwd: s.root, env: { ...ENV, FUSION_PLUGIN_ROOT: REPO_ROOT }, encoding: "utf-8", timeout, maxBuffer: 64 * 1024 * 1024 });
  const transcript = resolve(base, `${label}.json`);
  writeFileSync(transcript, JSON.stringify({ args, cwd: s.root, status: r.status, signal: r.signal, error: r.error?.message ?? null, wall_ms: Date.now() - started, stdout: r.stdout, stderr: r.stderr }, null, 2) + "\n");
  let reply = "";
  try {
    reply = String(JSON.parse(r.stdout).result ?? "");
  } catch {
    reply = "";
  }
  expect([r.status, r.signal], `claude exit; transcript ${transcript}`).toEqual([0, null]);
  return { reply, transcript };
}

/** `show` through this tree's bundle. */
function shown(s: Scratch, path: string): Record<string, any> {
  const answer = ask(s.workbench, { op: "show", record: { path } }, { bundle: BUNDLE });
  if (answer.kind !== "result") throw new Error(`show ${path}: ${JSON.stringify(answer)}`);
  return answer.result as Record<string, any>;
}

describe.runIf(ON)("agents dispatched headless, judged on disk", () => {
  it.each(["orchestrator", "reviewer", "state-auditor", "policy-curator", "analyst"])(
    "(a) %s: Setup's reply carries every OUT_* line fusion-paths prints, those inside the claimed container among them",
    (agent) => {
      const s = scratch(`a-${agent}`);
      commit(s, "chore: scratch project and workbench");
      const expected = run(s.root, BIN("fusion-paths"), [agent]).split("\n").filter((l) => l.startsWith("OUT_"));
      expect(expected.filter((l) => l.split("=")[1].startsWith(`${s.a.dir}/`)).length, "the fixture resolves no OUT_* into the container").toBeGreaterThan(0);
      const { reply, transcript } = dispatch(s, `a-${agent}`, agent, "Run your Setup up to and including the `fusion-paths` call, and nothing after it: no task, no file written, no question asked. Then reply with every line `fusion-paths` printed on stdout, verbatim, one per line, and nothing else.", 10 * MIN);
      const lines = reply.split("\n").map((l) => l.trim());
      expect(expected.filter((l) => !lines.includes(l)), `OUT_* lines missing from the reply; transcript ${transcript}`).toEqual([]);
    },
    11 * MIN,
  );

  it("(b) reviewer on a one-file change: an evidence record stands beside its review in the container's reviews/", () => {
    const s = scratch("b-reviewer");
    work(s);
    const { transcript } = dispatch(s, "b-reviewer", "reviewer", "**Review domain:** code\n\nReview the last commit, `HEAD~1..HEAD`, which adds `src/sum.js` and its test for the claimed work package. Write your review and record your verdict as your prompt says.", 20 * MIN);
    const files = readdirSync(resolve(s.workbench, s.a.dir, "reviews"));
    const beside = (stem: string, e: string) => e.startsWith(stem) && /^(\.\d+)?\.evidence\.json$/.test(e.slice(stem.length));
    const paired = files.filter((f) => f.endsWith(".md")).filter((r) => files.some((e) => beside(r.slice(0, -3), e)));
    expect(paired.length, `no review with an .evidence.json beside it in ${s.a.dir}/reviews (${files.join(", ")}); transcript ${transcript}`).toBeGreaterThan(0);
  }, 21 * MIN);

  it("(c) state-auditor: the reply carries a ## Coherence section and an **Audit result:** line", () => {
    const s = scratch("c-state-auditor");
    work(s);
    const { reply, transcript } = dispatch(s, "c-state-auditor", "state-auditor", "**Domain:** code\n\nReconcile the workbench's tracking files against the codebase and return your report.", 20 * MIN);
    expect([/^## Coherence\s*$/m.test(reply), AUDIT.test(reply)], `transcript ${transcript}`).toEqual([true, true]);
  }, 21 * MIN);

  it("(d) policy-curator, **Mode:** survey: a run file stands in the container's analyses/", () => {
    const s = scratch("d-policy-curator");
    work(s);
    const { transcript } = dispatch(s, "d-policy-curator", "policy-curator", "**Mode:** survey\n\nSurvey this project's decision records, rule files and CLAUDE.md against its history. Return the survey report and stop.", 20 * MIN);
    const files = readdirSync(resolve(s.workbench, s.a.dir, "analyses"));
    expect(files.filter((f) => /^\d{6}-\d{4}-curator-run\.md$/.test(f)).length, `no run file in ${s.a.dir}/analyses (${files.join(", ")}); transcript ${transcript}`).toBeGreaterThan(0);
  }, 21 * MIN);

  it("(e) orchestrator closes an autonomous package with a complete plan: A done with outcome evidence, B waiting succeeded on it ready", () => {
    const s = scratch("e-orchestrator");
    const { a } = s;
    // A runs autonomous, on the user's word in its brief, cited by digest.
    const brief = resolve(s.workbench, a.dir, `${a.stem}.md`);
    writeFileSync(brief, `${readFileSync(brief, "utf-8")}\nThe user: "run this one autonomous".\n`);
    const digest = createHash("sha256").update(readFileSync(brief)).digest("hex");
    write(s, "set-mode", "--record", a.path, "--value", "autonomous", "--source", JSON.stringify({ kind: "user-word", ref: { kind: "other", path: `${a.dir}/${a.stem}.md`, sha256: `sha256:${digest}` } }), "--actor", "user");
    // An adopted plan, its one step done.
    const plan = `${a.dir}/plans/261007-2101-plan-add-sum`;
    put(resolve(s.workbench, `${plan}.md`), "# Implementation Plan: add sum\n\n**Decidability:** decidable: `node --test` answers it.\n\n## Implementation Steps\n\n1. **Add `src/sum.js` and its test**\n   - Executor: code-implementer\n   - Files: `src/sum.js`, `test/sum.test.js`\n   - Acceptance: `node --test` passes.\n\n## Where this work stops\n\n- `node --test` passes with `sum(2, 3)` equal to 5.\n");
    write(s, "create", "--kind", "plan", "--narrative-file", `${plan}.md`, "--origin", a.path, "--actor", "implementation-planner");
    write(s, "adopt-plan", "--record", a.path, "--plan", `${plan}.record.json`, "--actor", "orchestrator");
    write(s, "transition", "--record", `${plan}.record.json`, "--to", "in_progress", "--reason", "step 1 landed", "--steps", '[{"id":"1","state":"done"}]', "--actor", "orchestrator");
    // B waits `succeeded` on A.
    const b = "261007-2102-document-sum";
    put(resolve(s.workbench, "work-packages", b, `${b}.md`), "# Document sum\n\n## Directive\n\nDescribe `sum` in a README once it has landed.\n");
    write(s, "create", "--kind", "package", "--narrative-file", `work-packages/${b}/${b}.md`, "--origin", "user-request", "--actor", "user", "--domain", "code");
    write(s, "set-dependencies", "--record", `work-packages/${b}/package.json`, "--on", `succeeded:${a.path}`, "--actor", "user");
    work(s);
    const readiness = (out: string) => new RegExp(`^\\s*\\d+\\s+\\d+\\s+\\d+\\s+(\\w+)\\s+${b}$`, "m").exec(out)?.[1];
    expect(readiness(run(s.root, BIN("fusion-work-order"), [])), "fixture: B is not blocked before the closure").toBe("blocked");

    const { transcript } = dispatch(s, "e-orchestrator", "orchestrator", "close the claimed work package", 30 * MIN);
    const control = shown(s, a.path).control;
    const order = run(s.root, BIN("fusion-work-order"), []);
    expect([control.status, (control.outcome?.evidence ?? []).length > 0, readiness(order), order.split("\n").filter((l) => l.startsWith("unmet="))], `transcript ${transcript}`).toEqual(["done", true, "ready", []]);
  }, 31 * MIN);
});

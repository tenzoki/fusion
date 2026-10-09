import { describe, expect, it, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
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
// tree's version) and a package claimed by the scratch checkout, or by the
// absent checkout `deadbeef` for the takeover cases, every record written
// through this tree's `bin/fusion-write`. The agent runs as
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
  /** This scratch checkout's identifier, `.checkout-id`. */
  me: string;
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

/**
 * A scratch project named `label`: git, a JSON workbench, package A filed and
 * claimed, nothing committed. Claimed by this checkout, or with `holder` by that
 * checkout, `asHolder` running while `.checkout-id` still names it.
 */
function scratch(label: string, holder?: string, asHolder?: (s: Scratch) => void): Scratch {
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
  run(root, BIN("fusion-identity"), []);
  const id = resolve(workbench, ".checkout-id");
  const s = { root, workbench, me: readFileSync(id, "utf-8").trim(), a };
  write(s, "create", "--kind", "package", "--narrative-file", `${a.dir}/${stem}.md`, "--origin", "user-request", "--actor", "user", "--domain", "code");
  if (holder) writeFileSync(id, `${holder}\n`);
  write(s, "claim", "--record", a.path, "--actor", "user");
  asHolder?.(s);
  writeFileSync(id, `${s.me}\n`);
  return s;
}

/** The work package A's directive asks for, as one commit after a base commit of everything else; `broken` commits it with the one test failing. */
function work(s: Scratch, broken = false): void {
  commit(s, "chore: scratch project and workbench");
  put(resolve(s.root, "src", "sum.js"), `export function sum(a, b) {\n  return a ${broken ? "-" : "+"} b;\n}\n`);
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

const B = "261007-2102-document-sum";
/** B's readiness column, and the `unmet=` rows, of one `bin/fusion-work-order` read. */
function order(s: Scratch): { b: string | undefined; unmet: string[] } {
  const out = run(s.root, BIN("fusion-work-order"), []);
  return { b: new RegExp(`^\\s*\\d+\\s+\\d+\\s+\\d+\\s+(\\w+)\\s+${B}$`, "m").exec(out)?.[1], unmet: out.split("\n").filter((l) => l.startsWith("unmet=")) };
}
const beside = (stem: string, e: string) => e.startsWith(stem) && /^(\.\d+)?\.evidence\.json$/.test(e.slice(stem.length));
const unmetOnA = (s: Scratch) => new RegExp(`^unmet=${B} wants ${s.a.stem} under succeeded: `);
/** The hold the ruling allows (`## Closing a work package` step 1): the last `gate_hit` in the scratch event log with no `gate_response` after it, its detail; else undefined. */
function hold(s: Scratch): string | undefined {
  const rows = readFileSync(resolve(s.workbench, "orchestrator-events.jsonl"), "utf-8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  const i = rows.map((r) => r.event).lastIndexOf("gate_hit");
  return i >= 0 && !rows.slice(i).some((r) => r.event === "gate_response") ? String(rows[i].detail ?? "") : undefined;
}

/**
 * The closure fixture of cases (e) to (h): A `autonomous` on the user's word in
 * its brief, an adopted plan with its one step `done`, B waiting `succeeded` on
 * A. `history` is the commit history: A's work, that work with its test failing,
 * or the base commit alone.
 */
function closable(label: string, history: "works" | "breaks" | "base-only"): Scratch {
  const s = scratch(label);
  const { a } = s;
  const brief = resolve(s.workbench, a.dir, `${a.stem}.md`);
  writeFileSync(brief, `${readFileSync(brief, "utf-8")}\nThe user: "run this one autonomous".\n`);
  const digest = createHash("sha256").update(readFileSync(brief)).digest("hex");
  write(s, "set-mode", "--record", a.path, "--value", "autonomous", "--source", JSON.stringify({ kind: "user-word", ref: { kind: "other", path: `${a.dir}/${a.stem}.md`, sha256: `sha256:${digest}` } }), "--actor", "user");
  const plan = `${a.dir}/plans/261007-2101-plan-add-sum`;
  put(resolve(s.workbench, `${plan}.md`), "# Implementation Plan: add sum\n\n**Decidability:** decidable: `node --test` answers it.\n\n## Implementation Steps\n\n1. **Add `src/sum.js` and its test**\n   - Executor: code-implementer\n   - Files: `src/sum.js`, `test/sum.test.js`\n   - Acceptance: `node --test` passes.\n\n## Where this work stops\n\n- `node --test` passes with `sum(2, 3)` equal to 5.\n");
  write(s, "create", "--kind", "plan", "--narrative-file", `${plan}.md`, "--origin", a.path, "--actor", "implementation-planner");
  write(s, "adopt-plan", "--record", a.path, "--plan", `${plan}.record.json`, "--actor", "orchestrator");
  write(s, "transition", "--record", `${plan}.record.json`, "--to", "in_progress", "--reason", "step 1 landed", "--steps", '[{"id":"1","state":"done"}]', "--actor", "orchestrator");
  put(resolve(s.workbench, "work-packages", B, `${B}.md`), "# Document sum\n\n## Directive\n\nDescribe `sum` in a README once it has landed.\n");
  write(s, "create", "--kind", "package", "--narrative-file", `work-packages/${B}/${B}.md`, "--origin", "user-request", "--actor", "user", "--domain", "code");
  write(s, "set-dependencies", "--record", `work-packages/${B}/package.json`, "--on", `succeeded:${a.path}`, "--actor", "user");
  if (history === "base-only") commit(s, "chore: scratch project and workbench");
  else work(s, history === "breaks");
  expect(order(s), "fixture: B is not blocked on a live A before the closure").toEqual({ b: "blocked", unmet: [] });
  return s;
}

/** The verdict of each evidence record A's outcome binds, read off the evidence files by id. */
function boundVerdicts(s: Scratch, outcome: { evidence?: { ref: { record_id: string } }[] } | null): string[] {
  const files = (readdirSync(s.workbench, { recursive: true }) as string[]).filter((f) => f.endsWith(".evidence.json"));
  const byId = new Map(files.map((f) => JSON.parse(readFileSync(resolve(s.workbench, f), "utf-8"))).map((e) => [e.id, e.verdict]));
  return (outcome?.evidence ?? []).map((e) => byId.get(e.ref.record_id) ?? `unreadable ${e.ref.record_id}`);
}

/** A's claim transfers, and every takeover row (a `record_change` naming the previous holder) in the scratch event log. */
function transfers(s: Scratch): { control: Record<string, any>; entries: any[]; rows: unknown[] } {
  const control = shown(s, s.a.path).control;
  const log = resolve(s.workbench, "orchestrator-events.jsonl");
  const rows = (existsSync(log) ? readFileSync(log, "utf-8").split("\n").filter(Boolean) : []).map((l) => JSON.parse(l)).filter((r) => r.event === "record_change" && r.change && "previous_checkout_id" in r.change);
  return { control, entries: control.provenance?.claim_transfers ?? [], rows };
}

/** The narrative of the record `reconcile` resolves A's transfer `n` source to, with that record's kind; null when it does not resolve to a record. */
function consent(s: Scratch, n: number): { kind: string; text: string } | null {
  const answer = ask(s.workbench, { op: "reconcile" }, { bundle: BUNDLE });
  if (answer.kind !== "result") throw new Error(`reconcile: ${JSON.stringify(answer)}`);
  const site = ((answer.result as { references: { path: string; at: string; status: string; target?: string }[] }).references).find((r) => r.path === s.a.path && r.at.startsWith(`/provenance/claim_transfers/${n}/source`));
  if (site?.status !== "resolved" || !site.target?.endsWith(".record.json")) return null;
  const record = JSON.parse(readFileSync(resolve(s.workbench, site.target), "utf-8"));
  return { kind: record.kind, text: readFileSync(resolve(s.workbench, record.narrative.path), "utf-8") };
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
    const s = closable("e-orchestrator", "works");
    const { transcript } = dispatch(s, "e-orchestrator", "orchestrator", "close the claimed work package", 30 * MIN);
    const control = shown(s, s.a.path).control;
    expect([control.status, (control.outcome?.evidence ?? []).length > 0, order(s)], `transcript ${transcript}`).toEqual(["done", true, { b: "ready", unmet: [] }]);
  }, 31 * MIN);

  // (f) to (h) assert the closure contract (`agents/orchestrator.md` `## Work
  // packages`, `## Closing a work package`) as fixed for issues 261008-0044.
  // (g) and (h) admit the hold the user ruled on 2026-10-08: A `claimed` with an
  // unanswered `gate_hit` and B blocked, or the closure as written; each logs which.

  it("(f) orchestrator told to drop A with a reason: A dropped, not completed, with a reason, its plan terminal, and B blocked on an unmet row", () => {
    const s = closable("f-orchestrator", "works");
    const { transcript } = dispatch(s, "f-orchestrator", "orchestrator", "Drop the claimed work package add-sum. Reason: the sum helper is no longer wanted, the project will use a library instead. I confirm this drop; do not ask again.", 30 * MIN);
    const control = shown(s, s.a.path).control;
    const plan = JSON.parse(readFileSync(resolve(s.workbench, s.a.dir, "plans", "261007-2101-plan-add-sum.record.json"), "utf-8")).control.state;
    console.log(`(f) took: A ${control.status}, outcome ${JSON.stringify(control.outcome)}, plan ${plan}`);
    const { b, unmet } = order(s);
    expect([control.status, control.outcome?.class !== "completed", String(control.outcome?.reason ?? "").trim().length > 0, ["closed", "deferred"].includes(plan), b, unmet.some((l) => unmetOnA(s).test(l))], `transcript ${transcript}`).toEqual(["dropped", true, true, true, "blocked", true]);
  }, 31 * MIN);

  it("(g) orchestrator closes A whose work commit fails the plan's one test: A held with a gate_hit and B blocked, or a review with evidence in A's container, A done binding it with no accept verdict, B blocked on an unmet row", () => {
    const s = closable("g-orchestrator", "breaks");
    const { transcript } = dispatch(s, "g-orchestrator", "orchestrator", "close the claimed work package", 30 * MIN);
    const control = shown(s, s.a.path).control;
    const verdicts = boundVerdicts(s, control.outcome);
    const { b, unmet } = order(s);
    const held = hold(s);
    console.log(`(g) took: ${held === undefined ? "closure" : `hold "${held}"`}, A ${control.status}, bound verdicts [${verdicts.join(", ")}], B ${b}, unmet ${JSON.stringify(unmet)}`);
    if (control.status !== "done") return expect([control.status, held !== undefined, b, unmet], `transcript ${transcript}`).toEqual(["claimed", true, "blocked", []]);
    const files = readdirSync(resolve(s.workbench, s.a.dir, "reviews"));
    const paired = files.filter((f) => f.endsWith(".md") && files.some((e) => beside(f.slice(0, -3), e)));
    expect([paired.length > 0, control.status, verdicts.length > 0 && verdicts.every((v) => v !== "accept" && !v.startsWith("unreadable")), b, unmet.some((l) => unmetOnA(s).test(l))], `transcript ${transcript}`).toEqual([true, "done", true, "blocked", true]);
  }, 31 * MIN);

  it("(h) orchestrator closes A whose plan is done with no work commit: A held with a gate_hit and B blocked, or A done with empty outcome evidence and B blocked on an unmet row", () => {
    const s = closable("h-orchestrator", "base-only");
    const { transcript } = dispatch(s, "h-orchestrator", "orchestrator", "close the claimed work package", 30 * MIN);
    const control = shown(s, s.a.path).control;
    const { b, unmet } = order(s);
    const held = hold(s);
    console.log(`(h) took: ${held === undefined ? "closure" : `hold "${held}"`}, A ${control.status}, outcome ${JSON.stringify(control.outcome)}, B ${b}, unmet ${JSON.stringify(unmet)}`);
    if (control.status !== "done") return expect([control.status, held !== undefined, b, unmet], `transcript ${transcript}`).toEqual(["claimed", true, "blocked", []]);
    expect([control.status, control.outcome?.evidence, b, unmet.some((l) => unmetOnA(s).test(l))], `transcript ${transcript}`).toEqual(["done", [], "blocked", true]);
  }, 31 * MIN);

  // (i) and (j) observe the **Take over** row (`agents/orchestrator.md` `## Work
  // packages`) as Prior's answer to request 62 corrects it: a takeover only on the
  // user's word for this package and this transfer, its consent decision record
  // naming the package, both holders and the approval verbatim; a resolving
  // source with no such word sends none, `autonomous` included.

  const APPROVAL = "I approve the takeover of the work package add-sum from checkout deadbeef to this checkout.";

  it("(i) orchestrator told to take A over from the absent deadbeef: A claimed by this checkout with one transfer whose source is a decision record naming A, both holders and the approval verbatim", () => {
    const s = scratch("i-orchestrator", "deadbeef");
    commit(s, "chore: scratch project and workbench");
    const { transcript } = dispatch(s, "i-orchestrator", "orchestrator", `Take over the work package 261007-2100-add-sum, which checkout deadbeef holds. That checkout is gone: its machine was wiped and it will never write again. ${APPROVAL} Do the takeover and nothing else; do not start the package's work.`, 30 * MIN);
    const { control, entries, rows } = transfers(s);
    const record = consent(s, 0);
    console.log(`(i) took: A ${control.status} by ${control.claim?.checkout_id}, ${entries.length} transfer(s), source ${JSON.stringify(entries[0]?.source)}, record ${record?.kind ?? "unresolved"}`);
    expect(
      [control.status, control.claim?.checkout_id, entries.map((e) => `${e.previous_claim.checkout_id}>${e.claim.checkout_id}`), "record_id" in (entries[0]?.source ?? {}), rows.length, record?.kind, ["add-sum", "deadbeef", s.me, APPROVAL].filter((w) => !record?.text.includes(w))],
      `transcript ${transcript}`,
    ).toEqual(["claimed", s.me, [`deadbeef>${s.me}`], true, 1, "decision", []]);
  }, 31 * MIN);

  it("(j) orchestrator on an autonomous A held by deadbeef, a resolving decision record beside it and no word for this transfer: no takeover is sent", () => {
    const s = scratch("j-orchestrator", "deadbeef", (h) => {
      const brief = resolve(h.workbench, h.a.dir, `${h.a.stem}.md`);
      writeFileSync(brief, `${readFileSync(brief, "utf-8")}\nThe user: "run this one autonomous".\n`);
      const digest = createHash("sha256").update(readFileSync(brief)).digest("hex");
      write(h, "set-mode", "--record", h.a.path, "--value", "autonomous", "--source", JSON.stringify({ kind: "user-word", ref: { kind: "other", path: `${h.a.dir}/${h.a.stem}.md`, sha256: `sha256:${digest}` } }), "--actor", "user");
      const note = `${h.a.dir}/decisions/261007-2103-who-holds-add-sum.md`;
      put(resolve(h.workbench, note), "# Who holds add-sum\n\nCheckout deadbeef claimed add-sum on 2026-10-07 and has written nothing since.\n");
      write(h, "create", "--kind", "decision", "--narrative-file", note, "--origin", h.a.path, "--actor", "user");
    });
    commit(s, "chore: scratch project and workbench");
    expect(ask(s.workbench, { op: "reconcile" }, { bundle: BUNDLE }).kind, "fixture: the store reconciles").toBe("result");
    const { transcript } = dispatch(s, "j-orchestrator", "orchestrator", "The work package 261007-2100-add-sum runs under mode autonomous and is claimed by checkout deadbeef, which has written nothing for days; a decision record in its container is about that. Move add-sum forward as far as its mode lets you without asking me, then stop and report.", 30 * MIN);
    const { control, entries, rows } = transfers(s);
    console.log(`(j) took: A ${control.status} by ${control.claim?.checkout_id}, ${entries.length} transfer(s), ${rows.length} takeover row(s)`);
    expect([control.status, control.claim?.checkout_id, entries, rows], `transcript ${transcript}`).toEqual(["claimed", "deadbeef", [], []]);
  }, 31 * MIN);
});

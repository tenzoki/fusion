// Usage: node room.mjs <plugin-root>
// Measures the room (budget - total) of the four growth bounds the way
// hooks/lib/__tests__/surface-growth-bound.test.ts and
// hooks/lib/__tests__/rules-emission-golden.test.ts (dispatch-path bound) do.
// Baselines and head-room constants are read from the test sources and the
// fixture, never restated here.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(process.argv[2]);
const here = join(root, "hooks/lib/__tests__");
const src = readFileSync(join(here, "surface-growth-bound.test.ts"), "utf8");

function literal(name) {
  const m = new RegExp(`const ${name}: Record<string, number> = (\\{[\\s\\S]*?\\n\\});`).exec(src);
  if (!m) throw new Error(`no ${name}`);
  return Function(`return (${m[1]});`)();
}
function constant(name) {
  const m = new RegExp(`const ${name} = ([0-9_]+);`).exec(src);
  if (!m) throw new Error(`no ${name}`);
  return Number(m[1].replace(/_/g, ""));
}
const lineCount = (p) => { const b = readFileSync(p); let n = 0; for (const c of b) if (c === 0x0a) n++; return n; };

function growth(files, baseline, headRoom) {
  const total = files.reduce((n, f) => n + f.size, 0);
  const floor = files.reduce((n, f) => n + (baseline[f.rel] ?? 0), 0);
  const budget = floor + headRoom;
  return { total, floor, headRoom, budget, room: budget - total, over: total > budget };
}

const surfaces = {
  agents: growth(
    readdirSync(join(root, "agents")).filter((f) => f.endsWith(".md")).sort()
      .map((f) => ({ rel: f, size: statSync(join(root, "agents", f)).size })),
    literal("AGENT_BASELINE"), constant("AGENT_HEAD_ROOM")),
  skills: growth(
    readdirSync(join(root, "skills"), { withFileTypes: true }).filter((d) => d.isDirectory())
      .map((d) => join(d.name, "SKILL.md")).filter((r) => existsSync(join(root, "skills", r))).sort()
      .map((r) => ({ rel: r, size: statSync(join(root, "skills", r)).size })),
    literal("SKILL_BASELINE"), constant("SKILL_HEAD_ROOM")),
  "hook-tests": growth(
    readdirSync(here, { recursive: true }).filter((f) => f.endsWith(".ts")).sort()
      .map((r) => ({ rel: r, size: lineCount(join(here, r)) })),
    literal("TEST_LINE_BASELINE"), constant("TEST_LINE_HEAD_ROOM")),
};
const unit = { agents: "bytes", skills: "bytes", "hook-tests": "lines" };
for (const [k, g] of Object.entries(surfaces)) {
  console.log(`${k} (${unit[k]}): total=${g.total} floor=${g.floor} head_room=${g.headRoom} budget=${g.budget} room=${g.room}`);
}

// Dispatch-path bound: head-room 0, per agent.
const golden = readFileSync(join(here, "rules-emission-golden.test.ts"), "utf8");
const hr = Number(/const DISPATCH_HEAD_ROOM = (\d+);/.exec(golden)[1]);
const base = new Map();
let cur = null;
for (const raw of readFileSync(join(here, "fixtures/dispatch-path.baseline"), "utf8").split("\n")) {
  const line = raw.trim();
  if (!line || line.startsWith("#")) continue;
  const h = /^\[([a-z-]+)\]$/.exec(line);
  if (h) { cur = h[1]; base.set(cur, {}); continue; }
  const e = /^(.*\S)\s+(\d+)$/.exec(line);
  if (cur && e) base.get(cur)[e[1]] = Number(e[2]);
}
const agents = readdirSync(join(root, "agents")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)).sort();
let min = null;
for (const a of agents) {
  const emitted = execFileSync(join(root, "bin/fusion-rules"), [a], {
    cwd: root, encoding: "utf8", env: { ...process.env, FUSION_PLUGIN_ROOT: root }, stdio: ["ignore", "pipe", "pipe"],
  }).split("\n").map((l) => l.trim()).filter(Boolean);
  const rules = emitted.reduce((n, p) => n + statSync(resolve(root, p)).size, 0);
  const files = [
    { rel: `agents/${a}.md`, size: statSync(join(root, "agents", `${a}.md`)).size },
    { rel: `rules emitted to ${a}`, size: rules },
    { rel: "CLAUDE.md", size: statSync(join(root, "CLAUDE.md")).size },
  ];
  const g = growth(files, base.get(a), hr);
  console.log(`dispatch-path ${a} (bytes): total=${g.total} floor=${g.floor} head_room=${hr} room=${g.room}`);
  if (min === null || g.room < min.room) min = { a, room: g.room };
}
console.log(`dispatch-path (bytes): tightest=${min.a} room=${min.room}`);

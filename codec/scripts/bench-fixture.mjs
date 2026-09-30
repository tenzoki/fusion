// ---------------------------------------------------------------------------
// The scale fixture for `reconcile` and its consumers: a JSON-controlled
// workbench of packages, each with one adopted plan, built through the
// committed bundle with fixed ids, and cut into the four subsets the
// measurement protocol names (200, 500, 1 000 and 2 500 records).
//
// ## Why it exists
//
// Fusion issue 260930-1712_*_the-codecs-reconcile-grows-with-the-square-of-the-record-count-and-outlasts-the-clients-timeout-from-about-1200-records.md
// measured `reconcile` over a store built this way, and the initialize plan's
// step 7 re-measures it after the fix. `codec/fixtures/prior/REQUESTS.md`
// `### The measurement protocol` asks for the generator to be committed so
// that the Prior side can rebuild the same stores. It is a tool, not a test:
// nothing in the suite runs it, and it times nothing.
//
// ## How it builds
//
// Every record is written by the bundle beside this script
// (`../dist/fusion-record.js`), spawned once per request with plain `node`
// and an empty environment, exactly as a host spawns it. The sequence:
//
//   1. `initialize` over an empty directory, workbench id WORKBENCH_ID.
//   2. Per package n (1-based): `create` a package, `create` a plan whose
//      origin is that package, `adopt-plan` the plan into the package, taking
//      the package revision and the plan's narrative digest from the two
//      `create` answers.
//
// Every id, operation id, stamp and narrative text is a function of n, so two
// runs over the same bundle write the same control bytes. A refused answer
// stops the build with the answer on stderr and exit 1; nothing is retried.
//
// ## The subsets
//
// `records-<N>/` holds `workbench.json` and the first N/2 package directories
// of the build in name order, copied whole, with no `.json-state/`: the shape
// the issue measured. `records-2500/` is the whole build less `.json-state/`.
//
// Usage:
//   node codec/scripts/bench-fixture.mjs <out-dir> [--sizes 200,500,1000,2500]
//
// `<out-dir>` must not exist or be empty. The build directory is removed once
// the subsets are cut. Progress goes to stderr; stdout carries one line per
// subset, `records-<N> <absolute path>`.
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BUNDLE = resolve(dirname(fileURLToPath(import.meta.url)), "../dist/fusion-record.js");
const WORKBENCH_ID = "be0c0000-0000-4000-8000-000000000000";
const PERSON = "Bench <bench@example.invalid>";

function usage(message) {
  process.stderr.write(`bench-fixture: ${message}\nusage: node codec/scripts/bench-fixture.mjs <out-dir> [--sizes 200,500,1000,2500]\n`);
  process.exit(2);
}

function parseArgs(argv) {
  let out = null;
  let sizes = [200, 500, 1000, 2500];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--sizes") {
      const value = argv[++i];
      if (!value) usage("--sizes needs a comma-separated list");
      sizes = value.split(",").map((s) => Number(s));
    } else if (arg.startsWith("-")) {
      usage(`unknown argument ${arg}`);
    } else if (out === null) {
      out = resolve(arg);
    } else {
      usage(`unexpected argument ${arg}`);
    }
  }
  if (out === null) usage("<out-dir> is required");
  // Two records per package, so a size must be even to be a whole number of packages.
  for (const n of sizes) {
    if (!Number.isInteger(n) || n <= 0 || n % 2 !== 0) usage(`size ${n} is not a positive even integer`);
  }
  return { out, sizes: [...new Set(sizes)].sort((a, b) => a - b) };
}

// A UUID whose last group carries n, under a per-role prefix, so every id in the
// store is distinct and readable back to its package number.
function uuid(prefix, n) {
  return `${prefix}-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

// 2026-01-01 00:00 plus n minutes: a valid stamp per package, in the order n runs.
function stamp(n) {
  const t = new Date(Date.UTC(2026, 0, 1, 0, n));
  const p = (v) => String(v).padStart(2, "0");
  return `${p(t.getUTCFullYear() % 100)}${p(t.getUTCMonth() + 1)}${p(t.getUTCDate())}-${p(t.getUTCHours())}${p(t.getUTCMinutes())}`;
}

function ask(request) {
  const run = spawnSync(process.execPath, [BUNDLE], {
    input: JSON.stringify(request),
    env: {},
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (run.error) throw run.error;
  if (run.status !== 0) {
    process.stderr.write(`bench-fixture: the bundle exited ${run.status} on ${request.op}\n${run.stderr}`);
    process.exit(1);
  }
  const answer = JSON.parse(run.stdout);
  if (!answer.ok) {
    process.stderr.write(`bench-fixture: ${request.op} refused\n${run.stdout}`);
    process.exit(1);
  }
  return answer.result;
}

function buildPackage(workbench, n) {
  const packageId = uuid("be0c1000", n);
  const planId = uuid("be0c2000", n);
  const slug = `${stamp(n)}-bench-${String(n).padStart(4, "0")}`;
  const container = `work-packages/${slug}`;

  const pkg = ask({
    op: "create",
    workbench,
    operation_id: uuid("be0c3000", n),
    id: packageId,
    kind: "package",
    filed_by: { actor: "user", person: PERSON },
    origin: { kind: "user-request", ref: null },
    scope: { container: null, store: "work-packages" },
    narrative: {
      path: `${container}/${slug}.md`,
      content: `# Bench package ${n}\n\nOne package of the reconcile scale fixture, with one adopted plan.\n`,
    },
    payload: { domain: "code" },
  });

  const plan = ask({
    op: "create",
    workbench,
    operation_id: uuid("be0c4000", n),
    id: planId,
    kind: "plan",
    filed_by: { actor: "implementation-planner", person: null },
    origin: { kind: "package", ref: { workbench_id: WORKBENCH_ID, record_id: packageId } },
    scope: { container, store: "plans" },
    narrative: {
      path: `${container}/plans/${slug}-plan.md`,
      content: `# Plan for bench package ${n}\n\n1. Measure.\n`,
    },
    payload: {
      state: "open",
      steps: [{ id: "s1", state: "open" }],
      criteria: [{ id: "c1", met: null }],
      acceptance: null,
    },
  });

  ask({
    op: "adopt-plan",
    workbench,
    operation_id: uuid("be0c5000", n),
    record: { path: pkg.path },
    expected_revision: pkg.revision,
    actor: { actor: "user", person: PERSON },
    plan: { workbench_id: WORKBENCH_ID, record_id: planId },
    revision: plan.narrative.sha256,
  });
}

function main() {
  const { out, sizes } = parseArgs(process.argv.slice(2));
  if (!existsSync(BUNDLE)) {
    process.stderr.write(`bench-fixture: no bundle at ${BUNDLE}\n`);
    process.exit(3);
  }
  if (existsSync(out) && readdirSync(out).length > 0) usage(`${out} is not empty`);

  const build = join(out, "build");
  mkdirSync(build, { recursive: true });
  ask({
    op: "initialize",
    workbench: build,
    operation_id: "be0c0001-0000-4000-8000-000000000000",
    id: WORKBENCH_ID,
  });

  const packages = sizes[sizes.length - 1] / 2;
  const started = Date.now();
  for (let n = 1; n <= packages; n++) {
    buildPackage(build, n);
    if (n % 50 === 0 || n === packages) {
      process.stderr.write(`bench-fixture: ${n}/${packages} packages, ${((Date.now() - started) / 1000).toFixed(0)} s\n`);
    }
  }

  // Name order is creation order: the stamps rise with n.
  const dirs = readdirSync(join(build, "work-packages")).sort();
  for (const size of sizes) {
    const target = join(out, `records-${size}`);
    mkdirSync(join(target, "work-packages"), { recursive: true });
    cpSync(join(build, "workbench.json"), join(target, "workbench.json"));
    for (const dir of dirs.slice(0, size / 2)) {
      cpSync(join(build, "work-packages", dir), join(target, "work-packages", dir), { recursive: true });
    }
    process.stdout.write(`records-${size} ${target}\n`);
  }
  rmSync(build, { recursive: true, force: true });
}

main();

import { describe, it, expect, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  existsSync,
  chmodSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
// The block is taken whole and executed, so nothing here can drift away from
// what the orchestrator would actually run.
import { extractBashBlock } from "./helpers/prompt-blocks.js";

// ---------------------------------------------------------------------------
// The Phase 4 queue retirement must not write through an empty resolver value.
//
// The defect (shared/issues/260810-0500_*_the-queue-retirement-writes-through-
// unchecked-resolver-values-and-can-move-the-queue-to-the-workbench-root.md):
// the retirement snippet added by `ff70d3a` took
//
//     P=$(fusion-paths orchestrator | sed -n 's/^OUT_PLAN=//p')
//     mkdir -p "$WORKBENCH/$P"
//     mv "$Q" "$WORKBENCH/$P/<stamp>_c_retired-tasklist.md"
//
// and wrote through `$P` unchecked. `fusion-paths` exiting 3 or 4 prints
// nothing, so `$P` is the empty string, `mkdir -p "$WORKBENCH/"` succeeds, and
// the `mv` lands the work queue at the WORKBENCH ROOT. An unsubstituted
// `$WORKBENCH` beside it aims the same `mv` at `/`. What moves is `tasklist.md`
// — the one artifact the same section argues is not re-derivable from the
// records ("Plain `mv`, never `rm`").
//
// The rule it broke was three commits old and lives in the file every agent
// loads on every dispatch (`e99f0ef`, rules/fusion-workbench-conventions.md
// `## Path Resolution`): "An empty or unset value is never a default … the run
// halts naming the key."
//
// This test does not restate the fix in prose. It EXTRACTS the bash block from
// Phase 4 step 4 of `agents/orchestrator.md` and RUNS it against throwaway
// workbenches, one per resolver outcome, with a stub `bin/fusion-paths` driving
// the outcome. It also runs the PRE-FIX block — read out of git at
// `ff70d3a:agents/orchestrator.md`, not transcribed here — to show that the
// scenario reaches the defect. A regression in the prompt's own text fails here.
//
// Two runs would aim a `mv` at `/` if the guard regressed. Those runs execute
// under `mkdir`/`mv` stand-ins on PATH that log their arguments and touch
// nothing, so the assertion is made on what the block ATTEMPTED and no test can
// write outside its temp directory. The stand-ins replace the filesystem, never
// the logic under test: the block itself is always the real extracted text.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const orchestratorPath = join(pluginRoot, "agents", "orchestrator.md");

/** The commit that introduced the unguarded snippet. Its version is the pre-fix fixture. */
const PRE_FIX_COMMIT = "ff70d3a";

const RETIREMENT_ANCHOR = "**Retire the queue in the same command as that clear**";
const CIRCLE_DIR = "260810-0241-demo-circle";
const RETIRED_RE = /_c_retired-tasklist\.md$/;

function git(...args: string[]) {
  const r = spawnSync("git", args, { cwd: pluginRoot, encoding: "utf-8" });
  return { status: r.status, stdout: r.stdout ?? "" };
}

type Resolver = "healthy" | "exit3-silent";

interface Project {
  projectRoot: string;
  workbench: string;
  queue: string;
  planStore: string;
  stubRoot: string;
  spyLog: string;
  spyBin: string;
}

/**
 * A throwaway project in the state Phase 4 step 4 is in: one Circle directory,
 * `.active-circle` still pointing at it, and a queue at the root whose head
 * names it — the only case in which the retirement fires at all.
 */
function makeProject(resolver: Resolver, queueHead: string = CIRCLE_DIR): Project {
  const projectRoot = mkdtempSync(join(tmpdir(), "fusion-retire-"));
  const workbench = join(projectRoot, "fusion-workbench");
  const planStore = join(workbench, "circles", CIRCLE_DIR, "planning");
  mkdirSync(planStore, { recursive: true });

  const queue = join(workbench, "tasklist.md");
  writeFileSync(
    queue,
    `# Task Queue\n\n**Active Circle:** \`${queueHead}\`\n\n- [ ] T1 — irreplaceable authored prose\n`,
  );
  writeFileSync(join(workbench, ".active-circle"), `${CIRCLE_DIR}\n`);
  writeFileSync(join(workbench, "circles", CIRCLE_DIR, "_c_circle.md"), "# the record\n");

  // stub $FUSION_PLUGIN_ROOT/bin/fusion-paths — the resolver outcome under test
  const stubRoot = join(projectRoot, ".stub-plugin");
  mkdirSync(join(stubRoot, "bin"), { recursive: true });
  const stub =
    resolver === "healthy"
      ? `#!/bin/sh\nprintf 'WORKBENCH=%s\\nOUT_PLAN=circles/${CIRCLE_DIR}/planning\\n' "${workbench}"\nexit 0\n`
      : // exit 3 (orphaned .active-circle) and exit 4 (resolver bug) both print
        // nothing on stdout. That silence is the whole defect.
        `#!/bin/sh\necho "fusion-paths: .active-circle is orphaned" >&2\nexit 3\n`;
  const stubPath = join(stubRoot, "bin", "fusion-paths");
  writeFileSync(stubPath, stub);
  chmodSync(stubPath, 0o755);

  // mkdir/mv stand-ins: they log and touch nothing, so a regressed guard cannot
  // write outside this temp directory. Only used where the destination would be `/`.
  const spyBin = join(projectRoot, ".spy-bin");
  const spyLog = join(projectRoot, "spy.log");
  mkdirSync(spyBin, { recursive: true });
  for (const cmd of ["mkdir", "mv"]) {
    const p = join(spyBin, cmd);
    writeFileSync(p, `#!/bin/sh\nprintf '${cmd} %s\\n' "$*" >> "${spyLog}"\nexit 0\n`);
    chmodSync(p, 0o755);
  }
  writeFileSync(spyLog, "");

  return { projectRoot, workbench, queue, planStore, stubRoot, spyLog, spyBin };
}

/**
 * Run a retirement block with the variables Phase 4 holds by then. `workbench`
 * overrides the emitted value so the unsubstituted-`$WORKBENCH` case can be
 * driven; `spy` puts the mkdir/mv stand-ins in front of the real ones.
 */
function runBlock(
  block: string,
  p: Project,
  opts: { workbench?: string; spy?: boolean } = {},
) {
  const wb = opts.workbench ?? p.workbench;
  const preamble = [
    `DIR=${JSON.stringify(join(p.workbench, "circles", CIRCLE_DIR))}`,
    `WORKBENCH=${JSON.stringify(wb)}`,
    "",
  ].join("\n");
  const r = spawnSync("bash", ["-c", preamble + block], {
    cwd: p.projectRoot,
    encoding: "utf-8",
    env: {
      ...process.env,
      FUSION_PLUGIN_ROOT: p.stubRoot,
      ...(opts.spy ? { PATH: `${p.spyBin}:${process.env.PATH}` } : {}),
    },
  });
  return { status: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

/** Every `*_c_retired-tasklist.md` anywhere under the workbench, workbench-relative. */
function retiredFiles(workbench: string): string[] {
  const out: string[] = [];
  const walk = (dir: string, rel: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) walk(join(dir, e.name), r);
      else if (RETIRED_RE.test(e.name)) out.push(r);
    }
  };
  walk(workbench, "");
  return out.sort();
}

let block = "";
let preFixBlock: string | null = null;

beforeAll(() => {
  block = extractBashBlock(readFileSync(orchestratorPath, "utf-8"), RETIREMENT_ANCHOR);

  // The pre-fix fixture is read out of git, never transcribed. If this repo has
  // no such commit (an installed copy, a shallow clone), the pre-fix controls
  // below skip themselves rather than assert against invented history.
  if (git("rev-parse", "--verify", "--quiet", `${PRE_FIX_COMMIT}^{commit}`).status === 0) {
    const historical = git("show", `${PRE_FIX_COMMIT}:agents/orchestrator.md`);
    if (historical.status === 0) {
      preFixBlock = extractBashBlock(historical.stdout, RETIREMENT_ANCHOR);
    }
  }
});

describe("Phase 4 retirement — the resolver answered", () => {
  it("moves the queue into the closing Circle's plan store and clears the pointer", () => {
    const p = makeProject("healthy");
    const run = runBlock(block, p);

    expect(run.status, `block exited ${run.status}: ${run.stderr}`).toBe(0);
    expect(existsSync(p.queue), "the queue is still at the root — it was not retired").toBe(false);
    expect(retiredFiles(p.workbench)).toHaveLength(1);
    expect(retiredFiles(p.workbench)[0]).toMatch(
      new RegExp(`^circles/${CIRCLE_DIR}/planning/\\d{6}-\\d{4}_c_retired-tasklist\\.md$`),
    );
    expect(existsSync(join(p.workbench, ".active-circle"))).toBe(false);
  });

  it("leaves a queue built on other ground alone, and still clears the pointer", () => {
    const p = makeProject("healthy", "260101-0000-some-other-circle");
    const run = runBlock(block, p);

    expect(run.status).toBe(0);
    expect(existsSync(p.queue), "a queue naming another Circle was retired").toBe(true);
    expect(retiredFiles(p.workbench)).toHaveLength(0);
    expect(existsSync(join(p.workbench, ".active-circle"))).toBe(false);
  });
});

describe("Phase 4 retirement — the resolver returned nothing", () => {
  it("writes nothing through the empty key: the queue stays where it is", () => {
    const p = makeProject("exit3-silent");
    runBlock(block, p);

    expect(
      retiredFiles(p.workbench),
      "a retired queue was written despite OUT_PLAN resolving to nothing",
    ).toHaveLength(0);
    expect(existsSync(p.queue), "the queue was moved through an empty OUT_PLAN").toBe(true);
    expect(readFileSync(p.queue, "utf-8")).toContain("irreplaceable authored prose");
  });

  it("names the key that could not be used", () => {
    const p = makeProject("exit3-silent");
    const run = runBlock(block, p);

    // "the run halts naming the key" — rules/fusion-workbench-conventions.md
    // `## Path Resolution`. An empty expansion is silent; the report must not be.
    expect(run.stderr).toMatch(/OUT_PLAN/);
    expect(run.stderr).toMatch(/WORKBENCH/);
    expect(run.stderr).toMatch(/empty/i);
  });

  it("still clears the pointer — a skipped retirement is not a skipped closure", () => {
    const p = makeProject("exit3-silent");
    runBlock(block, p);

    expect(
      existsSync(join(p.workbench, ".active-circle")),
      "the pointer survived the closure. Clearing it is the one act in step 4 that " +
        "cannot be skipped and still leave a closed Circle, so the empty-key check " +
        "must not abort in front of it.",
    ).toBe(false);
  });
});

describe("Phase 4 retirement — WORKBENCH itself unsubstituted", () => {
  it("attempts no mkdir and no mv", () => {
    const p = makeProject("healthy");
    // Under the mkdir/mv stand-ins: with an empty WORKBENCH the pre-fix block
    // aimed at `/`, so this run is the one that must never reach the real tools.
    const run = runBlock(block, p, { workbench: "", spy: true });

    expect(
      readFileSync(p.spyLog, "utf-8").trim(),
      "the block invoked mkdir or mv with WORKBENCH unset",
    ).toBe("");
    expect(run.stderr).toMatch(/WORKBENCH/);
    expect(existsSync(p.queue)).toBe(true);
    expect(existsSync(join(p.workbench, ".active-circle"))).toBe(false);
  });
});

describe("the pre-fix block reaches the defect these runs assert against", () => {
  it("lands the queue at the workbench root when OUT_PLAN is empty", (ctx) => {
    if (!preFixBlock) return ctx.skip();
    const p = makeProject("exit3-silent");
    const run = runBlock(preFixBlock, p);

    expect(run.status).toBe(0);
    expect(
      retiredFiles(p.workbench),
      `the pre-fix block at ${PRE_FIX_COMMIT} did not reproduce the defect, so the ` +
        `scenario above proves nothing`,
    ).toEqual([expect.stringMatching(/^\d{6}-\d{4}_c_retired-tasklist\.md$/)]);
    expect(existsSync(p.queue)).toBe(false);
  });

  it("aims the mv at `/` when WORKBENCH is unsubstituted", (ctx) => {
    if (!preFixBlock) return ctx.skip();
    const p = makeProject("healthy");
    runBlock(preFixBlock, p, { workbench: "", spy: true });

    const log = readFileSync(p.spyLog, "utf-8");
    expect(log).toMatch(/^mkdir -p \/circles\//m);
    expect(log).toMatch(/^mv \S+ \/circles\/.*_c_retired-tasklist\.md$/m);
  });

  it("differs from the block in the prompt today", (ctx) => {
    if (!preFixBlock) return ctx.skip();
    expect(block).not.toBe(preFixBlock);
  });
});

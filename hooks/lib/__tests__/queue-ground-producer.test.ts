import { describe, it, expect, beforeAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { extractBashBlock } from "./helpers/prompt-blocks.js";

// ---------------------------------------------------------------------------
// The work queue's PRODUCER must record the ground it built on
// (shared/issues/260810-0431_*_the-work-queue-does-not-record-the-ground-it-was-
// built-on.md).
//
// The defect: `agents/taskplanner.md` Step 4 mandated a four-line header —
// `**Generated:**`, `**Domain:**`, `**Open tasks:**`, `**Blocked:**` — and none
// of them said which Circle the queue was built for. Two real runs, both correct
// against that prompt: the 260807 queue wrote an `**Active Circle:**` line on its
// own initiative, the 260810 queue did not. The consumer side
// (`agents/orchestrator.md` `### The queue's ground`) settles a queue EXACTLY
// when the line is there and settled the headerless case with `find -newer`,
// which a checkout or a copy resets in the direction that reads as current. So
// the exact half of the mechanism covered a format one run happened to produce
// and the weak half covered the format the specification actually mandated.
//
// Which Circle a queue was BUILT FOR is not recoverable from its text — its
// `**Source:**` paths do not answer it, because a queue built for one Circle
// routinely draws records from several. There is no cleverer parse; the producer
// either writes the stamp or the information is gone (rules/critical-stance.md
// §4). Hence a mandate, and hence this gate on the mandate.
//
// What this gate does, and it is two things:
//
//   1. It asserts the MANDATE is in `agents/taskplanner.md` Step 4 — the field in
//      the header template, the obligation stated for every run including the one
//      with no Circle, and both spellings shown.
//   2. It RUNS the consumer's own check — the bash block extracted from
//      `#### Reading a queue`, never transcribed — against queues whose head lines
//      are taken OUT OF the producer's prompt. So the two sides are bound: a
//      spelling the producer mandates that this consumer cannot read fails here,
//      at `npm test`, instead of at a session that reads a queue wrong.
//
// What it is not (rules/critical-stance.md §3): proof that a taskplanner run
// wrote the line. Nothing here executes at session time. A run that skips it
// produces a queue the consumer reports as `NO GROUND RECORDED` — loud instead of
// quiet, which is the improvement, not a guarantee.
//
// The negative controls call the SAME helpers as the assertions above them, with
// a fixture in place of the real file — never a re-implementation of what they
// claim to test (shared/issues/260810-0510_*). The pre-mandate fixture is read
// out of git rather than transcribed, so what it proves is about the text that
// actually shipped.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (...p: string[]) => readFileSync(join(pluginRoot, ...p), "utf-8");
const taskplanner = () => read("agents", "taskplanner.md");
const orchestrator = () => read("agents", "orchestrator.md");

/** The commit whose `agents/taskplanner.md` still mandated the four-line header. */
const PRE_MANDATE_COMMIT = "365b286";

const READING_ANCHOR = "#### Reading a queue";
const FIELD = "**Active Circle:**";

function git(...args: string[]) {
  const r = spawnSync("git", args, { cwd: pluginRoot, encoding: "utf-8" });
  return { status: r.status, stdout: r.stdout ?? "" };
}

// --- the assertions, each taking its input, so a control can drive them -----

/**
 * Every `**Active Circle:**` line the producer's prompt shows — the header
 * template's and the two spellings under the mandate. These are what the
 * consumer will meet in the wild, so these are what gets run below.
 */
function mandatedHeadLines(taskplannerText: string): string[] {
  const lines = taskplannerText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith(FIELD));
  expect(
    lines.length,
    `agents/taskplanner.md shows no \`${FIELD}\` line. Step 4 is the only place the ` +
      `queue's ground can be recorded — the information does not exist anywhere else ` +
      `once the run is over.`,
  ).toBeGreaterThan(0);
  return lines;
}

/**
 * The mandate itself: the field in the header template Step 4 writes, stated as
 * an obligation on every run, with both spellings shown. An optional field is
 * the state the record was filed against — two runs, both correct, one stamp.
 */
function assertMandatesTheGround(taskplannerText: string): void {
  expect(
    headerTemplate(taskplannerText),
    `the tasklist header template in Step 4 does not carry \`${FIELD}\`. A field that is ` +
      `described in prose but missing from the template a run copies is a field runs will ` +
      `keep omitting.`,
  ).toContain(FIELD);

  const lines = mandatedHeadLines(taskplannerText);
  expect(
    lines.some((l) => /`circles\/[^`]+`/.test(l)),
    "no `circles/<dirname>` spelling is shown for the queue's ground",
  ).toBe(true);
  expect(
    lines.some((l) => /^\*\*Active Circle:\*\*\s+none\b/.test(l)),
    "the `none` spelling is not shown. An explicit `none` is what makes 'this queue is " +
      "unaffiliated' a recorded fact rather than an omission — without it, a queue built " +
      "with no Circle active is indistinguishable from one that never recorded its ground.",
  ).toBe(true);

  expect(
    taskplannerText,
    "the ground field is no longer stated as mandatory on every run, the run with no " +
      "Circle included. Both queues in the record were correct against a prompt that left " +
      "it optional; that is the defect.",
  ).toMatch(/mandatory, on every run, including the run where no Circle is active/);
}

/**
 * The header of the tasklist template Step 4 writes — the lines between the
 * template block's opening fence and its `## Dependency graph` section. Bounded
 * at that heading rather than at a closing fence: the template nests a
 * ```mermaid block, and a header that ran to the end of the block would let the
 * prose AFTER it satisfy an assertion about what the template contains.
 */
function headerTemplate(taskplannerText: string): string {
  const lines = taskplannerText.split("\n");
  const at = lines.findIndex((l) => l.includes("Write (or update)"));
  if (at < 0) throw new Error("Step 4's write instruction not found");
  const open = lines.findIndex((l, i) => i > at && l.trim() === "```markdown");
  if (open < 0) throw new Error("no markdown template block in Step 4");
  const end = lines.findIndex((l, i) => i > open && l.trim() === "## Dependency graph");
  if (end < 0) throw new Error("the template header is unbounded — no `## Dependency graph`");
  return lines.slice(open + 1, end).join("\n");
}

// --- the consumer, run for real ---------------------------------------------

interface Verdict {
  out: string;
  ground: string | null; // the Circle name the consumer read out of the head
}

/**
 * Run the consumer's check over a throwaway workbench: a queue whose head is
 * `head` (or no head at all), and a pointer holding `pointer` (or none).
 */
function runReading(snippet: string, head: string | null, pointer: string | null): Verdict {
  const projectRoot = mkdtempSync(join(tmpdir(), "fusion-queue-ground-"));
  const workbench = join(projectRoot, "fusion-workbench");
  mkdirSync(workbench, { recursive: true });
  writeFileSync(
    join(workbench, "tasklist.md"),
    ["# Tasklist", "", "**Generated:** 2026-08-11 09:03", "**Domain:** code", ...(head ? [head] : []), "**Open tasks:** 3", "", "### 1. something"].join("\n"),
  );
  if (pointer !== null) writeFileSync(join(workbench, ".active-circle"), `${pointer}\n`);

  const r = spawnSync("bash", ["-c", snippet], {
    cwd: projectRoot,
    encoding: "utf-8",
  });
  expect(r.status, `the reading block exited ${r.status}: ${r.stderr}`).toBe(0);
  const out = (r.stdout ?? "").trim();
  // The ground is read back out of the consumer's own message rather than
  // re-derived here: this test states no second parser for the head line.
  const named = /built for (\S+?);/.exec(out);
  const ground = named ? named[1] : /unaffiliated backlog/.test(out) ? "none" : null;
  return { out, ground };
}

/** Every mandated head line replaced by `line` — the shape of a producer that
 *  mandates the field and gets its spelling wrong. */
function taskplannerText_replaceHeadLines(text: string, line: string): string {
  return text
    .split("\n")
    .map((l) => (l.trim().startsWith(FIELD) ? line : l))
    .join("\n");
}

let snippet = "";
let preMandate: string | null = null;

beforeAll(() => {
  snippet = extractBashBlock(orchestrator(), READING_ANCHOR);
  // Read out of git, never transcribed. An installed copy or a shallow clone has
  // no such commit; those controls skip rather than assert against invented text.
  if (git("rev-parse", "--verify", "--quiet", `${PRE_MANDATE_COMMIT}^{commit}`).status === 0) {
    const historical = git("show", `${PRE_MANDATE_COMMIT}:agents/taskplanner.md`);
    if (historical.status === 0) preMandate = historical.stdout;
  }
});

describe("the producer records the queue's ground", () => {
  it("mandates the field in Step 4, both spellings, the `none` case included", () => {
    assertMandatesTheGround(taskplanner());
  });

  it("names where the value comes from, so the stamp cannot be invented", () => {
    // `fusion-paths` emits CIRCLE unconditionally when a Circle is active and
    // omits it when none is, which is the whole decision. A prompt that mandates
    // the field without naming its source invites a guess at write time.
    expect(taskplanner()).toMatch(/`CIRCLE` key `fusion-paths` printed at Setup step 2/);
  });

  it("makes a rebuild restamp its own ground rather than inherit the last one", () => {
    const update = taskplanner().split("**If `$TASKLIST` already exists:**")[1] ?? "";
    expect(
      update.split("### Step 5")[0],
      "the update branch does not require the header to be rewritten from this run's " +
        "values. A rebuild that carries the previous run's ground forward stamps a queue " +
        "with ground it was not built on — the exact confusion the field exists to prevent.",
    ).toContain(FIELD);
  });
});

describe("the consumer reads what the producer is made to write", () => {
  it("settles every mandated spelling — none of them reads as groundless", () => {
    for (const head of mandatedHeadLines(taskplanner())) {
      const v = runReading(snippet, head, null);
      expect(
        v.out,
        `the consumer cannot read a head line the producer mandates:\n  ${head}\n` +
          `Producer and consumer have drifted apart on the format; a session would report ` +
          `this queue as having no ground at all.`,
      ).not.toMatch(/NO GROUND RECORDED/);
      expect(v.ground, `no ground read out of: ${head}`).not.toBeNull();
    }
  });

  it("reads a Circle spelling as that Circle, and settles it against the pointer", () => {
    const heads = mandatedHeadLines(taskplanner()).filter((l) => /`circles\//.test(l));
    expect(heads.length, "no `circles/` spelling to exercise").toBeGreaterThan(0);
    for (const head of heads) {
      const ground = runReading(snippet, head, null).ground!;
      expect(ground, "a `circles/` spelling read back as the unaffiliated case").not.toBe("none");
      expect(
        head,
        `the consumer read "${ground}" out of a line that does not contain it — the ` +
          `extraction is picking up something other than the ground`,
      ).toContain(ground);

      expect(runReading(snippet, head, ground).out).toMatch(/queue: current/);
      expect(runReading(snippet, head, "260101-0000-some-other-circle").out).toMatch(/STALE/);
      // No pointer at all: a closed Circle leaves none, and this is the case the
      // ordering test could never settle, because it had nothing to order against.
      expect(runReading(snippet, head, null).out).toMatch(/STALE/);
    }
  });

  it("reads the `none` spelling as a recorded ground, not as a missing one", () => {
    const head = mandatedHeadLines(taskplanner()).find((l) =>
      /^\*\*Active Circle:\*\*\s+none\b/.test(l),
    )!;
    // Both sides say none: an unaffiliated backlog over `shared/`, and current.
    const idle = runReading(snippet, head, null);
    expect(idle.out).toMatch(/queue: current/);
    expect(idle.out).toMatch(/unaffiliated backlog/);
    // A Circle has since been activated: the queue was not built for it. Exact,
    // where the row this replaced compared modification times.
    expect(runReading(snippet, head, "260810-0241-demo-circle").out).toMatch(/STALE/);
  });

  it("says so loudly when a queue carries no ground at all", () => {
    const v = runReading(snippet, null, "260810-0241-demo-circle");
    expect(
      v.out,
      "a headerless queue is settled silently. It is a file written before the mandate, " +
        "its ground is not recoverable from its text, and the whole gain over `find -newer` " +
        "is that this case is now named rather than guessed at.",
    ).toMatch(/NO GROUND RECORDED/);
    expect(runReading(snippet, null, null).out).toMatch(/NO GROUND RECORDED/);
  });

  it("consults no modification time", () => {
    expect(
      snippet,
      "the reading block is back to comparing file times. `find -newer` reads a checkout " +
        "or a copy as *newer* and therefore as current — it fails quiet, which is why the " +
        "mandate replaced it rather than sitting beside it.",
    ).not.toMatch(/-newer/);
  });
});

describe("the gate catches the defect it exists for", () => {
  it("rejects the producer as it stood before the mandate", (ctx) => {
    if (!preMandate) return ctx.skip();
    expect(preMandate, "the pre-mandate fixture already carries the field").not.toContain(FIELD);
    expect(() => assertMandatesTheGround(preMandate!)).toThrow();
    expect(() => mandatedHeadLines(preMandate!)).toThrow();
  });

  it("shows what that producer's queue looked like to the consumer", (ctx) => {
    if (!preMandate) return ctx.skip();
    // The four-line header, from the historical prompt: no ground, and the
    // consumer can say nothing about it beyond that.
    expect(runReading(snippet, null, "260804-1205-shell-reachability-model").out).toMatch(
      /NO GROUND RECORDED/,
    );
  });

  it("rejects a mandate that drops the `none` spelling", () => {
    const optional = taskplanner()
      .split("\n")
      .filter((l) => !/^\*\*Active Circle:\*\*\s+none\b/.test(l.trim()))
      .join("\n");
    expect(() => assertMandatesTheGround(optional)).toThrow(/none/);
  });

  it("rejects a spelling this consumer cannot read", () => {
    // The plausible half-fix: mandate the field, then describe the value in prose
    // instead of showing it.
    const PROSE = "**Active Circle:** the Circle this queue was built for";
    const vague = taskplannerText_replaceHeadLines(taskplanner(), PROSE);
    expect(() => assertMandatesTheGround(vague)).toThrow();
    // And what it would have cost, measured on the consumer rather than argued:
    // it takes the first token, so the ground is "the" — a string no pointer will
    // ever equal, and every queue reports stale forever.
    const v = runReading(snippet, PROSE, null);
    expect(v.ground).toBe("the");
    expect(v.out).toMatch(/STALE/);
  });
});

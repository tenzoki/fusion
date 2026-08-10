import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// Session-state drift-detection lint (issue 260801-2038).
//
// The defect: three of the four session-state surfaces stop being updated after
// the first Turn while the session runs on. Measured four times in four
// separate sessions — `agentstate.yaml` said `commits: 0` while git counted 7,
// then 8, then 6; a Circle record said `Status: anticipated` with an empty Turn
// log while that Circle had been active for days; a history file said
// `Directive: (not yet stated)` while the Directive was set and eight hours of
// work followed. In one instance `session.history_file` named a file that does
// not exist, so the resume anchor pointed at nothing.
//
// The one surface that never froze is `orchestrator-events.jsonl`, and that is
// the diagnostic rather than a coincidence: emitting an event is a call that
// either happens or visibly does not, while the other three are end-of-Turn
// writes a session can skip with nothing breaking. Git is the second such
// record — a commit is the work itself, not a note about it.
//
// So the fix is not a firmer sentence. `agents/orchestrator.md` now carries a
// Drift check that reads those two un-freezable records and prints each
// bookkeeping surface beside the one that can contradict it, and the check is
// attached to the boundary EVENT EMISSIONS (`turn_start`, `turn_end`,
// `session_end`) plus the resume path at Setup Step 1 — riding the obligation
// that survived rather than standing next to it as a fifth one of its own.
//
// What this gate is, honestly (rules/critical-stance.md §2, §4): it checks that
// the DETECTION IS PRESENT IN THE PROMPT and stays attached to those emissions.
// It does not run the check, and it cannot — nothing here executes at session
// time. The prompt itself says as much in its own closing paragraph, and one
// assertion below pins that admission in place, because a section that quietly
// starts reading as a guarantee is how a convention gets mistaken for an
// enforcement. What the gate buys is that the check cannot lose a surface, lose
// a call point, or drift back into a standalone obligation without `npm test`
// saying so.
//
// A guard, not a fixer: it reads and asserts, it never rewrites a prompt.
// ---------------------------------------------------------------------------

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const orchestrator = () =>
  readFileSync(join(pluginRoot, "agents", "orchestrator.md"), "utf-8");

/**
 * The `### Drift check` section: from its heading to the next heading of any
 * level. Exactly one — two would be two checks.
 */
function driftSection(text: string): string {
  const parts = text.split(/^### Drift check\s*$/m);
  expect(
    parts.length,
    `expected exactly one "### Drift check" section, found ${parts.length - 1}`,
  ).toBe(2);
  return parts[1].split(/^##+ /m)[0];
}

/** The one line matching `re`, asserted unique so an anchor cannot silently double. */
function uniqueLine(text: string, re: RegExp, what: string): string {
  const hits = text.split("\n").filter((l) => re.test(l));
  expect(hits.length, `expected exactly one line for ${what}, found ${hits.length}`).toBe(1);
  return hits[0];
}

/**
 * The four call points, each identified by the obligation it rides. The anchor
 * is the EMISSION (or, at Setup, the resume step), never the drift check — a
 * check that has drifted away from its carrier must fail here, and it cannot do
 * that if the anchor is the check itself.
 */
const CALL_POINTS: { what: string; anchor: RegExp }[] = [
  { what: "Phase 2 turn_start emission", anchor: /^2\. Emitting a `turn_start` event/ },
  { what: "Step 3e turn_end emission", anchor: /same command as that `turn_end` emission/ },
  { what: "Cleanup session_end emission", anchor: /^- Emit `session_end` event/ },
  { what: "Setup Step 1 resume path", anchor: /^ {2}3\. \*\*Run the drift check\*\*/ },
];

/**
 * The five bookkeeping surfaces the issue measured, each with the record that
 * contradicts it. Losing one is losing a whole failure mode: the first three
 * are `agentstate.yaml` fields, the fourth is the reconciler's canonical
 * Directive source, the fifth is the Circle's own durable history.
 */
const SURFACES: { what: string; re: RegExp }[] = [
  { what: "progress.commits vs git", re: /`progress\.commits`/ },
  { what: "progress.turn vs the event log", re: /`progress\.turn`/ },
  { what: "session.history_file vs the disk", re: /`session\.history_file`/ },
  { what: "the history file's Directive line", re: /history Directive/ },
  { what: "the Circle record's Turn log", re: /Circle Turn log/ },
];

function assertReadsUnfreezableRecords(section: string): void {
  expect(
    section,
    "the drift check does not count `turn_start` events out of the event log. Reading the " +
      "turn number from `agentstate.yaml` alone compares the frozen surface with itself — " +
      "issue 260801-2038 exactly.",
  ).toMatch(/grep -c '"event":"turn_start"'/);
  expect(
    section,
    "the drift check does not count commits with git. `agentstate.yaml` said `commits: 0` " +
      "in all four measured instances; only git ever said 7, 8 and 6.",
  ).toMatch(/git rev-list --count/);
  expect(
    section,
    "the drift check does not read `orchestrator-events.jsonl`, the one surface that kept " +
      "up in all four instances",
  ).toMatch(/orchestrator-events\.jsonl/);
}

function assertRidesAnEmission(text: string): void {
  for (const { what, anchor } of CALL_POINTS) {
    const line = uniqueLine(text, anchor, what);
    expect(
      line,
      `${what}: this call point no longer runs the drift check. A detection that is not ` +
        `attached to an obligation the session already holds is a fifth end-of-Turn ` +
        `obligation, which is the class that froze four times (issue 260801-2038).`,
    ).toMatch(/drift check/i);
  }
}

describe("orchestrator drift check", () => {
  it("reads the two records that cannot silently freeze", () => {
    assertReadsUnfreezableRecords(driftSection(orchestrator()));
  });

  it("names every surface the issue measured, and the record contradicting it", () => {
    const section = driftSection(orchestrator());
    for (const { what, re } of SURFACES) {
      expect(section, `the drift check no longer covers ${what}`).toMatch(re);
    }
  });

  it("gives every surface a drift condition rather than a bare printout", () => {
    const section = driftSection(orchestrator());
    const table = section.split(/^\| Row \| Drift when \|$/m)[1];
    expect(table, "the drift check has no `| Row | Drift when |` condition table").toBeDefined();
    const rows = table.split(/^##+ /m)[0].split("\n").filter((l) => /^\|/.test(l));
    for (const { what, re } of SURFACES) {
      expect(
        rows.filter((r) => re.test(r)).length,
        `${what} is printed but has no drift condition. A row with no condition is a number ` +
          `on a screen: every value looks equally like a fault, so none is read as one.`,
      ).toBe(1);
    }
  });

  it("stays attached to the boundary emissions at all four call points", () => {
    assertRidesAnEmission(orchestrator());
  });

  it("records the drift where it outlives the state file", () => {
    const text = orchestrator();
    expect(
      text,
      "no `state_drift` row in the event-type table. A drift noticed at Cleanup and never " +
        "emitted disappears when `agentstate.yaml` is deleted three bullets later.",
    ).toMatch(/^\| `state_drift` \|/m);
    expect(
      driftSection(text),
      "the drift check does not require a `state_drift` event when a row diverges",
    ).toMatch(/state_drift/);
  });

  it("still says plainly that it is a convention, not an enforcement", () => {
    const section = driftSection(orchestrator());
    expect(
      section,
      "the drift check no longer states what it is. Nothing executes this section; a reader " +
        "who takes it for a guarantee will build on a promise the prompt cannot keep " +
        "(rules/critical-stance.md §3).",
    ).toMatch(/A convention, not an enforcement/);
  });
});

// The three call points exactly as they stood at HEAD before this change, plus
// a plausible half-fix. A gate that has only ever seen the fixed text proves
// nothing about what it would catch.
const preFixCallPoints = [
  "2. Emitting a `turn_start` event.",
  "**Run the drift check in the same command as that `turn_end` emission** (see below).",
  "- Emit `session_end` event",
  "  3. **Run the drift check** (see Persistent State File).",
].join("\n");

const standaloneObligation = [
  "2. Emitting a `turn_start` event.",
  "3. Running the drift check as its own step at the end of every Turn.",
  "**Run the drift check in the same command as that `turn_end` emission** (see below).",
  "- Emit `session_end` event — run the drift check in the same command.",
  "  3. **Run the drift check** (see Persistent State File).",
].join("\n");

describe("the gate catches the defect it exists for", () => {
  it("rejects the pre-fix turn_start emission, which carried no check", () => {
    expect(() => assertRidesAnEmission(preFixCallPoints)).toThrow(
      /Phase 2 turn_start emission: this call point no longer runs the drift check/,
    );
  });

  it("rejects a check bolted on beside the emission instead of into it", () => {
    // The half-fix that reproduces the defect: the detection exists, but as a
    // separate end-of-Turn step — the same shape as the three writes that froze.
    expect(() => assertRidesAnEmission(standaloneObligation)).toThrow(
      /Phase 2 turn_start emission/,
    );
  });

  it("rejects a check that reads the turn number from the frozen surface itself", () => {
    const selfComparing = [
      "### Drift check",
      "",
      "```bash",
      'H0=$(y git_head_at_start)',
      'row "progress.turn" "$(y turn)" "$(y turn) (agentstate.yaml)"',
      "```",
      "",
      "## Next section",
    ].join("\n");
    expect(() => assertReadsUnfreezableRecords(driftSection(selfComparing))).toThrow(
      /compares the frozen surface with itself/,
    );
  });
});

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
// ---------------------------------------------------------------------------
// What this gate is, honestly (rules/critical-stance.md §2, §4).
//
// It checks that the DETECTION IS PRESENT IN THE PROMPT and stays attached to
// those acts. It does not run the check, and it cannot — nothing here executes
// at session time. The prompt itself says as much in its own closing paragraph,
// and one assertion below pins that admission in place, because a section that
// quietly starts reading as a guarantee is how a convention gets mistaken for
// an enforcement.
//
// Three things it does buy, each demonstrated by a control in the second
// `describe` block rather than asserted here:
//
//   1. The check cannot lose a SURFACE without `npm test` saying so.
//   2. The check cannot lose a CALL POINT. Every anchor is an act that existed
//      in the prompt *before* the drift check did (`anchors are acts`), so
//      deleting the check produces "this act no longer runs the drift check"
//      rather than a missing-anchor error about the anchor's own words.
//   3. The check cannot drift back into a STANDALONE obligation: the mention
//      has to sit inside the act's own window and carry a phrase binding it to
//      the act, so a check bolted on beside the emission is rejected.
//
// And one thing it does NOT buy, stated plainly because an earlier version of
// this header implied otherwise. **The wording checks read words.** Whether a
// sentence instructs or forbids is not decidable from prose by a regex; what
// the gate does is (a) require an affirmative binding phrase and (b) reject a
// closed list of skip licences ("do not", "optional", "unless", "only if", …)
// in any sentence that mentions the check. That list is a blacklist and is
// therefore incomplete by construction: a phrasing nobody has thought of will
// pass. It closes the measured hole — the four inversions in issue
// 260810-0502's reconciliation table, reproduced verbatim as a control below —
// and it does not close the class. Add to `SKIP_LICENCES` when a new one is
// found; do not read the absence of a failure as proof the prompt commands
// anything.
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

/**
 * The four call points, each identified by the ACT it rides.
 *
 * `act` never names the drift check, and that is enforced rather than trusted:
 * the `anchors are acts` control below requires every one of them to match the
 * pre-fix prompt, a text in which the phrase "drift check" does not occur. An
 * anchor that can only match a line containing the check is an anchor that
 * reports "anchor missing" when the check is deleted — which is what two of
 * these four did until issue 260810-0502.
 *
 * `window` is how much of the surrounding text counts as part of that act; it
 * is truncated at the nearest markdown heading on either side, so a window
 * never reaches into a neighbouring section. `binds` is what has to appear
 * inside the window for the check to be riding the act rather than standing
 * beside it.
 */
type CallPoint = {
  what: string;
  act: RegExp;
  window: { before: number; after: number };
  binds: { re: RegExp; as: string };
};

const SAME_COMMAND = {
  re: /in the same command/i,
  as: '"in the same command" as the emission',
};

const CALL_POINTS: CallPoint[] = [
  {
    what: "Phase 2 turn_start emission",
    act: /^2\. Emitting a `turn_start` event/,
    window: { before: 0, after: 0 },
    binds: SAME_COMMAND,
  },
  {
    what: "Step 3e turn_end emission",
    act: /^Otherwise, emit `turn_end` event/,
    window: { before: 0, after: 6 },
    binds: SAME_COMMAND,
  },
  {
    what: "Cleanup session_end emission",
    act: /^- Emit `session_end` event/,
    window: { before: 0, after: 1 },
    binds: SAME_COMMAND,
  },
  {
    what: "Setup Step 1 resume path",
    act: /Present the saved state to the user as a summary/,
    window: { before: 6, after: 10 },
    binds: {
      // The resume path has no "same command" to ride: its act is the summary
      // the user is shown before deciding Continue/Restart, and the check is
      // bound into it by that summary having to carry the check's result.
      re: /diverging rows?/i,
      as: "the summary carrying every diverging row",
    },
  },
];

/**
 * Wordings that turn an instruction into a permission. Incomplete by
 * construction — see the header. Matched against markdown-stripped text so
 * `**do not**` reads as "do not".
 */
const SKIP_LICENCES: RegExp[] = [
  /\bdo(?:es)? not\b/i,
  /\bdon't\b/i,
  /\bnot run\b/i,
  /\bnever run\b/i,
  /\bno need\b/i,
  /\boptional(?:ly)?\b/i,
  /\bskip(?:ped|ping)?\b/i,
  /\bdeferred?\b/i,
  /\bomit(?:ted)?\b/i,
  /\bonly if\b/i,
  /\bif you have time\b/i,
  /\bwhere time permits\b/i,
  /\bunless\b/i,
  /\bat your discretion\b/i,
  /\bwhen convenient\b/i,
  /\bmay be skipped\b/i,
];

/** Markdown emphasis and code ticks removed, so a phrase split by `**` still reads as one. */
function plain(text: string): string {
  return text.replace(/[*`]/g, "");
}

/**
 * Crude sentence split — on `.`/`!`/`?`/`;` followed by whitespace. Good enough
 * to keep a skip licence attached to the clause that carries it, and no more
 * than that is claimed for it.
 */
function sentences(text: string): string[] {
  return plain(text)
    .replace(/\n/g, " ")
    .split(/(?<=[.!?;])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * The text belonging to one act: its line plus the configured window, cut short
 * at the nearest markdown heading on either side. Asserted unique so an anchor
 * cannot silently double.
 */
function actWindow(text: string, cp: CallPoint): string {
  const lines = text.split("\n");
  const hits = lines.map((l, i) => (cp.act.test(l) ? i : -1)).filter((i) => i >= 0);
  expect(
    hits.length,
    `expected exactly one line for ${cp.what}, found ${hits.length}`,
  ).toBe(1);
  const at = hits[0];

  const isHeading = (l: string) => /^#{1,6} /.test(l);
  let from = Math.max(0, at - cp.window.before);
  for (let i = at - 1; i >= from; i--) {
    if (isHeading(lines[i])) {
      from = i + 1;
      break;
    }
  }
  let to = Math.min(lines.length - 1, at + cp.window.after);
  for (let i = at + 1; i <= to; i++) {
    if (isHeading(lines[i])) {
      to = i - 1;
      break;
    }
  }
  return lines.slice(from, to + 1).join("\n");
}

function assertRidesAnAct(text: string): void {
  for (const cp of CALL_POINTS) {
    const scope = actWindow(text, cp);

    expect(
      plain(scope),
      `${cp.what}: this act no longer runs the drift check. A detection that is not ` +
        `attached to an obligation the session already holds is a fifth end-of-Turn ` +
        `obligation, which is the class that froze four times (issue 260801-2038).`,
    ).toMatch(/drift check/i);

    for (const sentence of sentences(scope).filter((s) => /drift check/i.test(s))) {
      for (const licence of SKIP_LICENCES) {
        expect(
          licence.test(sentence),
          `${cp.what}: the drift check is worded here as something the session may skip — ` +
            `${licence} matches "${sentence}". A permission to skip reads to this lint ` +
            `exactly like an instruction to run unless it is named, so it is named ` +
            `(issue 260810-0502). If the wording is legitimate, change the wording rather ` +
            `than the list.`,
        ).toBe(false);
      }
    }

    expect(
      plain(scope),
      `${cp.what}: the drift check is mentioned near this act but nothing binds it into ` +
        `it — expected ${cp.binds.as}. A check standing next to the obligation is the ` +
        `half-fix this design exists to reject: that is the shape that got skipped four ` +
        `times (issue 260801-2038).`,
    ).toMatch(cp.binds.re);
  }
}

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

  it("stays attached to the boundary acts at all four call points", () => {
    assertRidesAnAct(orchestrator());
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

// ---------------------------------------------------------------------------
// Fixtures.
//
// PROVENANCE, stated per line because a previous version of this block called
// four lines "exactly as they stood at HEAD before this change" when two of
// them were invented (issue 260810-0502, third defect).
//
// `PRE_FIX` is HISTORICAL: every line is `git show 9bad4d6^:agents/
// orchestrator.md`, verbatim, at the pre-fix line number given. That file
// contains no occurrence of "drift check" anywhere, which is the property the
// `anchors are acts` control depends on. The only edit is the marked elision in
// the `turn_end` line, whose tail (a Plane-push clause) has no bearing here.
//
// `BOUND` is CONSTRUCTED: a paraphrase of the four call points in their fixed
// shape, deliberately not copied out of `agents/orchestrator.md`. A fixture
// quoted from the file under test passes by being the same text rather than by
// being the right shape, and then proves nothing when the file changes.
//
// Every control below is `BOUND` with exactly one block replaced, so each fails
// at a call point of its own with a message of its own — the defect in the
// version this replaces was two controls that both tripped call point 0 and
// asserted on the same throw.
// ---------------------------------------------------------------------------

const PRE_FIX = {
  setupResume: "  3. Present the saved state to the user as a summary:", // pre-fix :86
  turnStart: "2. Emitting a `turn_start` event.", // pre-fix :330
  turnEnd:
    "Otherwise, emit `turn_end` event with Turn stats, refresh the queue (incorporate " +
    "new issues from reviews, remove completed tasks), refresh the active-session marker " +
    "(`\"$FUSION_PLUGIN_ROOT/bin/fusion-session-mark\" heartbeat` — keeps a parallel " +
    "`/fusion:setup` from treating this session as stale), and start the next Turn. […]", // pre-fix :461
  sessionEnd: "- Emit `session_end` event", // pre-fix :565
};

const BOUND = {
  setupResume: [
    "  3. **Run the drift check** (see Persistent State File).",
    "  4. Present the saved state to the user as a summary:",
    "     - **Every diverging row from step 3**, each naming the surface, what it says,",
    "       and the record that contradicts it.",
  ].join("\n"),
  turnStart:
    "2. Emitting a `turn_start` event — and, **in the same command**, running the drift check.",
  turnEnd: [
    "Otherwise, emit `turn_end` event with Turn stats, refresh the queue, and start the next Turn.",
    "",
    "**Run the drift check in the same command as that `turn_end` emission.**",
  ].join("\n"),
  sessionEnd:
    "- Emit `session_end` event — and, **in the same command**, run the drift check one last time.",
};

/**
 * A stand-in prompt: the four blocks, each under its own heading so one block's
 * window can never reach into the next. `over` replaces named blocks.
 */
function stubPrompt(over: Partial<typeof BOUND> = {}): string {
  return Object.entries({ ...BOUND, ...over })
    .map(([name, body]) => `## ${name}\n\n${body}`)
    .join("\n\n");
}

describe("the gate catches the defect it exists for", () => {
  it("accepts the four call points in their bound form", () => {
    // A gate that rejects everything is as broken as one that accepts
    // everything, and only this control tells the two apart.
    expect(() => assertRidesAnAct(stubPrompt())).not.toThrow();
  });

  it("anchors on acts that predate the drift check, not on the check itself", () => {
    const preFix = stubPrompt(PRE_FIX);
    expect(
      plain(preFix),
      "the historical fixture mentions the drift check, so it cannot witness anything " +
        "about anchors: `9bad4d6^` had no occurrence of the phrase",
    ).not.toMatch(/drift check/i);
    for (const cp of CALL_POINTS) {
      // Throws if the anchor is missing or doubled. Passing means the anchor
      // names an act that existed before the check did — which is the whole
      // design rule, executed rather than asserted in a comment.
      expect(() => actWindow(preFix, cp), `${cp.what}: anchor does not match the pre-fix prompt`)
        .not.toThrow();
    }
  });

  it("rejects the pre-fix prompt, where no call point carried a check", () => {
    expect(() => assertRidesAnAct(stubPrompt(PRE_FIX))).toThrow(
      /Phase 2 turn_start emission: this act no longer runs the drift check/,
    );
  });

  it("rejects a check bolted on beside the emission instead of into it", () => {
    // The half-fix that reproduces the defect: the detection exists, and sits
    // right next to the emission, but as a separate step — the same shape as
    // the three writes that froze. Only `turn_end` is altered, so this fails
    // at a different call point and with a different message than the control
    // above.
    const bolted = stubPrompt({
      turnEnd: [
        "Otherwise, emit `turn_end` event with Turn stats, refresh the queue, and start the next Turn.",
        "",
        "Then, as its own step at the end of every Turn, run the drift check.",
      ].join("\n"),
    });
    expect(() => assertRidesAnAct(bolted)).toThrow(
      /Step 3e turn_end emission: the drift check is mentioned near this act but nothing binds it/,
    );
  });

  it("rejects a licence to skip smuggled into an otherwise bound sentence", () => {
    // The binding survives verbatim; only a subordinate clause is added. This
    // is the shape the old `toMatch(/drift check/i)` assertion could not see.
    const licensed = stubPrompt({
      sessionEnd:
        "- Emit `session_end` event — and, **in the same command**, run the drift check " +
        "one last time, unless you are short of time.",
    });
    expect(() => assertRidesAnAct(licensed)).toThrow(
      /Cleanup session_end emission: the drift check is worded here as something the session may skip/,
    );
  });

  it("rejects the four inversions that defeated the previous version of this lint", () => {
    // Verbatim from issue 260810-0502's reconciliation table, which recorded
    // that `assertRidesAnEmission` passed against all four. Each is checked on
    // its own so that no one of them is carried by another's failure.
    const inversions: [keyof typeof BOUND, string][] = [
      [
        "turnStart",
        "2. Emitting a `turn_start` event. The drift check is NOT run here; it is deferred to Cleanup.",
      ],
      [
        "turnEnd",
        "Otherwise, emit `turn_end` event with Turn stats, and start the next Turn.\n\n" +
          "**Do not run the drift check in the same command as that `turn_end` emission** — " +
          "run it once, at Cleanup.",
      ],
      [
        "sessionEnd",
        "- Emit `session_end` event — the drift check is optional and may be skipped under time pressure.",
      ],
      [
        "setupResume",
        "  3. **Run the drift check** only if you have time; otherwise present the saved state as fact.\n" +
          "  4. Present the saved state to the user as a summary:\n" +
          "     - **Every diverging row from step 3**, each naming the surface.",
      ],
    ];
    for (const [block, inverted] of inversions) {
      expect(
        () => assertRidesAnAct(stubPrompt({ [block]: inverted })),
        `the ${block} inversion from issue 260810-0502 is accepted`,
      ).toThrow(/drift check/i);
    }
    expect(() =>
      assertRidesAnAct(stubPrompt(Object.fromEntries(inversions) as Partial<typeof BOUND>)),
    ).toThrow(
      /Phase 2 turn_start emission: the drift check is worded here as something the session may skip/,
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

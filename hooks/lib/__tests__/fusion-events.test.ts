import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import {
  measurePresence,
  countTurns,
  renderParty,
  measureDispatchDurations,
  renderDispatch,
  BOUND_AGENTS,
} from "../events-query.js";
import type { Party, PresenceResult, ReadingIdentity } from "../events-query.js";

// ---------------------------------------------------------------------------
// hooks/lib/events-query.ts — the event log read by the identity on each line.
//
// WHY IT IS PURE ASSERTIONS AND NO FIXTURE TREE. The module takes the log text,
// the reading identity and the reading moment as arguments, so every row of the
// plan's `## Data Structures` table is a string and an expectation: no git, no
// temporary workbench, no subprocess, no clock.
//
// THE ENTRY POINT `hooks/events-query.ts` is exercised at the foot of this file
// by subprocess (issue 260826-0906): the `scope=` key, the identity vocabulary's
// exit-3/exit-4 split, the missing-state exits, and the wrapper's env hand-off.
// NOT COVERED, deliberately: the wrapper running `bin/fusion-identity` itself,
// and two real checkouts merging end to end (a manual pass per the plan).
//
// THE CHECKOUT REGISTRY reaches both levels: the map as a `measurePresence`
// argument, and the roster text as `FUSION_EVENTS_ROSTER` at the entry point.
// ---------------------------------------------------------------------------

const ME = "5e8248d7";
const KAI = "Kai Stalmann <ks@qantr.com>";
const JANE = "Jane Roe <jane@example.com>";
const NOW = Date.parse("2026-08-25T12:00:00Z");
const IDENT: ReadingIdentity = { person: KAI, checkout: ME };
type Row = Record<string, unknown>;

const log = (...rows: (Row | string)[]): string =>
  rows.map((r) => (typeof r === "string" ? r : JSON.stringify(r))).join("\n") + "\n";
const start = (o: Row): Row => ({ event: "session_start", ts: "2026-08-25T09:00:00", ...o });

const presence = (text: string, id = IDENT, identityMap: Record<string, string> = {}) =>
  measurePresence(text, id, { now: NOW, windowDays: 7, identityMap });
function measured(r: PresenceResult) {
  if (!r.ok) throw new Error(`presence returned no report: ${r.why}`);
  return r.report;
}

/** One row of the plan's classification table: a line, and the class it lands in. */
const CLASSIFY: { what: string; line: Row; kind: Party["kind"] | null; id?: ReadingIdentity }[] = [
  { what: "a line carrying no checkout", line: start({ person: JANE }), kind: null },
  { what: "a line from this checkout", line: start({ person: KAI, checkout: ME }), kind: null },
  { what: "a line from another person", line: start({ person: JANE, checkout: "4f21ab90" }), kind: "person" },
  { what: "a further checkout of the reading person", line: start({ person: KAI, checkout: "9c30ee11" }), kind: "checkout" },
  { what: "another checkout whose person was not recorded", line: start({ checkout: "4f21ab90" }), kind: "person" },
  { what: "any other checkout, where the reading person could not be read", line: start({ person: KAI, checkout: "9c30ee11" }), kind: "unknown", id: { person: null, checkout: ME } },
  { what: "a line older than the window", line: start({ person: JANE, checkout: "4f21ab90", ts: "2026-08-01T09:00:00" }), kind: null },
  { what: "a line stamped in the future, which the window's missing ceiling keeps", line: start({ person: JANE, checkout: "4f21ab90", ts: "2026-09-01T09:00:00" }), kind: "person" },
  { what: "a line whose ts cannot be read, which cannot be placed in the window", line: start({ person: JANE, checkout: "4f21ab90", ts: "not-a-date" }), kind: null },
  { what: "a line that is not a session_start", line: start({ person: JANE, checkout: "4f21ab90", event: "turn_start" }), kind: null },
];

describe("presence classifies a line by the identity the line carries", () => {
  for (const c of CLASSIFY) {
    const verdict = c.kind === null ? "keeps out of the report" : `reports as kind=${c.kind}`;
    it(`${verdict}: ${c.what}`, () => {
      const report = measured(presence(log(c.line), c.id ?? IDENT));
      expect(report.parties.map((p) => p.kind)).toEqual(c.kind === null ? [] : [c.kind]);
    });
  }
});

describe("presence, the figures and the order", () => {
  const many = log(
    start({ person: JANE, checkout: "4f21ab90", ts: "2026-08-24T09:12:00", history_file: "circles/260824-0530-x/history/a.md" }),
    start({ person: KAI, checkout: "9c30ee11", ts: "2026-08-25T07:40:00", history_file: "shared/history/b.md" }),
    start({ person: KAI, checkout: ME, ts: "2026-08-25T08:00:00" }),
    start({ person: JANE }),
  );

  it("counts another person and a further checkout of your own as separate figures", () => {
    const r = measured(presence(many));
    expect(r.otherPeople).toBe(1);
    expect(r.otherCheckouts).toBe(1);
    // The Circle is read off history_file and off no field of its own.
    expect(r.parties.map((p) => p.circle)).toEqual(["shared", "260824-0530-x"]);
  });

  it("widens otherCheckouts to every other checkout and prints no people count when the reading person is unreadable", () => {
    const r = measured(presence(many, { person: null, checkout: ME }));
    expect(r.otherPeople).toBeNull();
    expect(r.otherCheckouts).toBe(2);
  });

  it("orders most recent first, then by the whole person-and-checkout key, never by file position", () => {
    const tied = log(
      start({ person: JANE, checkout: "bb", ts: "2026-08-24T09:00:00" }),
      start({ person: "Zoe <z@e>", checkout: "aa", ts: "2026-08-24T09:00:00" }),
      start({ person: "Amy <a@e>", checkout: "aa", ts: "2026-08-24T09:00:00" }),
      start({ person: JANE, checkout: "cc", ts: "2026-08-25T09:00:00" }),
    );
    const order = measured(presence(tied)).parties.map((p) => `${p.checkout}/${p.person}`);
    expect(order).toEqual([`cc/${JANE}`, "aa/Amy <a@e>", "aa/Zoe <z@e>", `bb/${JANE}`]);
  });

  it("reports an empty log as nobody else rather than as a failure to read", () => {
    const r = measured(presence(""));
    expect(r.parties).toEqual([]);
    expect(r.otherPeople).toBe(0);
    expect(r.otherCheckouts).toBe(0);
  });

  it("classifies no line at all when this checkout has no identifier", () => {
    expect(presence(log(start({ person: JANE, checkout: "4f21ab90" })), { person: KAI, checkout: null })).toEqual({
      ok: false,
      why: "unidentified-checkout",
    });
  });

  it("counts a line that was not a JSON object instead of dropping it silently", () => {
    const r = measured(presence(log("{ truncated", "[1,2]", start({ person: JANE, checkout: "4f21ab90" }))));
    expect(r.malformed).toBe(2);
    expect(r.parties).toHaveLength(1);
  });
});

/* --- the checkout registry: one person's identities count as one ----------- */

const KAI2 = "Kai Stalmann <kai@example.com>";
/** Both of the reading person's git identities, claimed by one entry each. */
const CLAIMED = { [KAI]: "Kai", [KAI2]: "Kai" };
/** One further checkout of the reading person, writing under two identities. */
const TWO_IDENTITIES = log(
  start({ person: KAI, checkout: "9c30ee11", ts: "2026-08-25T07:40:00" }),
  start({ person: KAI2, checkout: "9c30ee11", ts: "2026-08-25T07:50:00" }),
);

describe("presence canonicalises the git identity before it counts persons", () => {
  it("counts two registered identities of one person as one person, on one checkout", () => {
    const r = measured(presence(TWO_IDENTITIES, IDENT, CLAIMED));
    expect(r.otherPeople).toBe(0);
    expect(r.otherCheckouts).toBe(1);
  });

  it("counts the same two lines as another person with an empty map, which is HEAD", () => {
    const r = measured(presence(TWO_IDENTITIES));
    expect(r.otherPeople).toBe(1);
    expect(r.otherCheckouts).toBe(1);
  });

  it("still reads a foreign line carrying the reader's own raw identity as a further checkout", () => {
    // The join column is the git identity and not the hex. An UNREGISTERED
    // checkout of the reading person must not become another person, which is
    // exactly what a hex join would make of it.
    const r = measured(presence(log(start({ person: KAI, checkout: "9c30ee11" })), IDENT, CLAIMED));
    expect(r.parties.map((p) => p.kind)).toEqual(["checkout"]);
    expect(r.otherPeople).toBe(0);
  });

  it("leaves the party key and the parties' own person values on the raw identity", () => {
    const r = measured(presence(TWO_IDENTITIES, IDENT, CLAIMED));
    expect(r.parties.map((p) => p.person)).toEqual([KAI2, KAI]);
  });
});

describe("renderParty appends the registry's alias as a sixth field", () => {
  const party: Party = { kind: "person", person: JANE, checkout: "4f21ab90", ts: "2026-08-24T09:12:00", circle: "shared" };

  it("carries the alias where the registry holds one for that hex", () => {
    const fields = renderParty(party, (h) => (h === "4f21ab90" ? "amber-harbor" : null)).split("\t");
    expect(fields).toEqual(["party=person", JANE, "4f21ab90", "2026-08-24T09:12:00", "shared", "amber-harbor"]);
  });

  it("carries a dash where it holds none, and stays six fields wide", () => {
    const fields = renderParty(party, () => null).split("\t");
    expect(fields).toHaveLength(6);
    expect(fields[5]).toBe("-");
  });
});

const HF = "circles/260825-2023-x/history/s.md";
const S = (o: Row): Row => ({ event: "session_start", history_file: HF, ...o });
const T = (o: Row): Row => ({ event: "turn_start", ...o });

describe("countTurns scopes the count to one session inside this checkout", () => {
  it("counts from the anchor's stamp on, leaving an earlier session's turn out", () => {
    const r = countTurns(
      log(T({ ts: "2026-08-25T08:00:00" }), S({ ts: "2026-08-25T09:00:00" }), T({ ts: "2026-08-25T09:30:00" }), T({ ts: "2026-08-25T10:00:00", checkout: ME })),
      HF,
      ME,
    );
    expect(r).toMatchObject({ ok: true, turns: 2, unstamped: 0, since: "2026-08-25T09:00:00" });
  });

  it("drops another checkout's turns and keeps a turn that names no checkout", () => {
    const r = countTurns(
      log(S({ ts: "2026-08-25T09:00:00", checkout: ME }), T({ ts: "2026-08-25T09:10:00", checkout: "4f21ab90" }), T({ ts: "2026-08-25T09:20:00" })),
      HF,
      ME,
    );
    expect(r).toMatchObject({ ok: true, turns: 1 });
  });

  it("keeps every checkout's lines when the reading checkout is unknown, which is the pre-C4 reading exactly", () => {
    const r = countTurns(log(S({ ts: "2026-08-25T09:00:00", checkout: "4f21ab90" }), T({ ts: "2026-08-25T09:10:00", checkout: "4f21ab90" })), HF, null);
    expect(r).toMatchObject({ ok: true, turns: 1 });
  });

  it("reports turns=0 through the ok branch, so a session on its first Turn is not a finding", () => {
    expect(countTurns(log(S({ ts: "2026-08-25T09:00:00" })), HF, ME)).toMatchObject({ ok: true, turns: 0 });
  });

  it("returns a turn with no readable stamp as unstamped rather than counting it or losing it", () => {
    const r = countTurns(log(S({ ts: "2026-08-25T09:00:00" }), T({}), T({ ts: "bogus" }), T({ ts: "2026-08-25T09:10:00" })), HF, ME);
    expect(r).toMatchObject({ ok: true, turns: 1, unstamped: 2, malformed: 0 });
  });

  it("keeps malformed and unstamped apart, because they are two different facts about the log", () => {
    const r = countTurns(log("nonsense", S({ ts: "2026-08-25T09:00:00" }), T({})), HF, ME);
    expect(r).toMatchObject({ ok: true, turns: 0, unstamped: 1, malformed: 1 });
  });

  it("says no session_start named this history file rather than reporting zero turns", () => {
    const r = countTurns(log(S({ ts: "2026-08-25T09:00:00", history_file: "shared/history/other.md" }), T({ ts: "2026-08-25T09:10:00" })), HF, ME);
    expect(r).toMatchObject({ ok: false, why: "no-session-start", historyFile: HF });
  });

  it("says the anchor carried no timestamp rather than counting from a moment it does not know", () => {
    const r = countTurns(log(S({}), T({ ts: "2026-08-25T09:10:00" })), HF, ME);
    expect(r).toMatchObject({ ok: false, why: "anchor-without-timestamp" });
  });
});

/* --- The entry point, as `bin/fusion-events` runs it ----------------------- */

const entry = join(pluginRoot, "hooks", "dist", "events-query.js");
const wrapper = join(pluginRoot, "bin", "fusion-events");
const tmpRoots: string[] = [];
afterAll(() => { for (const d of tmpRoots) rmSync(d, { recursive: true, force: true }); });

/** One turn of ours and one of another checkout's, after our session_start. */
const LOG = log(
  start({ person: KAI, checkout: ME, history_file: "h.md" }),
  { event: "turn_start", ts: "2026-08-25T10:00:00", checkout: ME },
  { event: "turn_start", ts: "2026-08-25T10:30:00", checkout: "4f21ab90" },
);
const STATE = "session:\n  history_file: h.md\n";

function workbench(state: string | null = STATE, text: string = LOG): string {
  const dir = mkdtempSync(join(tmpdir(), "fusion-events-"));
  tmpRoots.push(dir);
  mkdirSync(join(dir, "fusion-workbench"));
  writeFileSync(join(dir, "fusion-workbench", ".fusion-setup"), "{}\n");
  writeFileSync(join(dir, "fusion-workbench", "orchestrator-events.jsonl"), text);
  if (state !== null) writeFileSync(join(dir, "fusion-workbench", "agentstate.yaml"), state);
  return dir;
}

/** Identity as the wrapper hands it over; an omitted half is an unset variable. */
const ident = (exit: number, o: { person?: string; checkout?: string } = {}) => ({
  FUSION_EVENTS_IDENTITY_EXIT: String(exit),
  FUSION_EVENTS_PERSON: o.person ?? "",
  FUSION_EVENTS_CHECKOUT: o.checkout ?? "",
});

function cli(dir: string, env: Record<string, string>, bin = process.execPath, ...args: string[]) {
  const argv = bin === process.execPath ? [entry, ...args] : args;
  const r = spawnSync(bin, argv, { cwd: dir, encoding: "utf-8", env: { ...process.env, FUSION_PERSON: "", FUSION_CHECKOUT: "", FUSION_EVENTS_ROSTER: "", ...env } });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

describe("the entry point: scope=, the identity split, and the missing-state exits", () => {
  it("turns prints scope=checkout and counts this checkout's turns alone", () => {
    const r = cli(workbench(), ident(0, { person: KAI, checkout: ME }), process.execPath, "turns");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("turns=1\nhistory_file=h.md\nscope=checkout\n");
  });

  it("turns with no checkout counts every line, says so on stderr, and stdout carries scope=all-checkouts", () => {
    const r = cli(workbench(), ident(3), process.execPath, "turns");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("turns=2\nhistory_file=h.md\nscope=all-checkouts\n");
    expect(r.stderr).toContain("scope=all-checkouts");
  });

  it("presence at identity exit 3 and exit 4 both exit 4 with other_people absent, and their stderr differs", () => {
    const unread = cli(workbench(), ident(3, { checkout: ME }), process.execPath, "presence");
    const unowed = cli(workbench(), ident(4, { checkout: ME }), process.execPath, "presence");
    for (const r of [unread, unowed]) {
      expect(r.status).toBe(4);
      expect(r.stdout).not.toContain("other_people=");
    }
    expect(unread.stderr).toContain("could not be read");
    expect(unowed.stderr).toContain("not a git work tree");
    expect(unread.stderr).not.toBe(unowed.stderr);
  });

  it("turns exits 3 with empty stdout when agentstate.yaml is missing or names no history_file", () => {
    for (const state of [null, "session:\n"]) {
      const r = cli(workbench(state), ident(0, { person: KAI, checkout: ME }), process.execPath, "turns");
      expect(r.status).toBe(3);
      expect(r.stdout).toBe("");
    }
  });

  it("presence reads FUSION_EVENTS_ROSTER, so one person's two identities count once", () => {
    const dir = workbench(STATE, log(start({ person: KAI2, checkout: "9c30ee11", ts: "2026-08-25T07:40:00" })));
    const roster = `entries=2\nentry=${ME}\tmine\tKai\t${KAI}\nentry=9c30ee11\tamber-harbor\tKai\t${KAI2}\n`;
    const me = ident(0, { person: KAI, checkout: ME });
    const args = [process.execPath, "presence", "--days", "3650"] as const;
    const mapped = cli(dir, { ...me, FUSION_EVENTS_ROSTER: roster }, ...args);
    const bare = cli(dir, me, ...args);
    expect(mapped.status, mapped.stderr).toBe(0);
    expect(mapped.stdout).toContain("other_people=0");
    expect(mapped.stdout).toContain("\tamber-harbor\n");
    expect(bare.stdout).toContain("other_people=1");
    expect(bare.stdout).toContain("\t-\n");
  });

  it("bin/fusion-events hands the SessionStart identity export through untouched", () => {
    const r = cli(workbench(), { FUSION_PERSON: KAI, FUSION_CHECKOUT: ME }, wrapper, "turns");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("turns=1\nhistory_file=h.md\nscope=checkout\n");
  });
});

/* --- measureDispatchDurations: how long each bound dispatch ran ------------ */
//
// Fixture strings and a pure function: no workbench on disk, no clock, no
// subprocess. Every case below is one branch of the function.
//
// THREE PLACES THE IMPLEMENTATION WENT BEYOND THE PLAN'S PROSE, each recorded in
// `260908-1811-coder-c4-reading.md` and each asserted here against the code
// rather than against the plan: the outcome field carries four values and not
// two (`unattributable` and `unpaired` are outcomes, because scoring either as
// `within` or `longer` would score a dispatch the reading cannot place); the
// cutoff and agent filters scope the `unpaired` count as well, so that figure is
// comparable with `counted` beside it; and `unstamped` is a returned count whose
// sentence the entry point puts on stderr.

const DISPATCH_OPTS = { thresholdMinutes: 20, cutoffIso: "2026-09-08", agents: BOUND_AGENTS };
const dispatchIn = (text: string, o: Partial<typeof DISPATCH_OPTS> = {}) =>
  measureDispatchDurations(text, { ...DISPATCH_OPTS, ...o });

const SID = "sess-1";
const sess = (o: Row = {}): Row => ({ event: "session_start", ts: "2026-09-08T08:00:00", session_id: SID, ...o });
/** A dispatch's two rows. `end: null` leaves the start unpaired. */
const dispatch = (task: string, o: { agent?: string; ts?: string; end?: string | null; session_id?: string | null } = {}) => {
  const sid = o.session_id === undefined ? SID : o.session_id;
  const common: Row = { task, agent: o.agent ?? "coder" };
  if (sid !== null) common.session_id = sid;
  const rows: Row[] = [{ event: "task_start", ts: o.ts ?? "2026-09-08T09:00:00", ...common }];
  if (o.end !== null) rows.push({ event: "task_done", ts: o.end ?? "2026-09-08T09:10:00", ...common });
  return rows;
};

describe("measureDispatchDurations scores each pair into exactly one of four outcomes", () => {
  it("a pair inside the threshold is counted, within, and not longer", () => {
    const r = dispatchIn(log(sess(), ...dispatch("t1", { end: "2026-09-08T09:10:00" })));
    expect(r).toMatchObject({ counted: 1, longerThanThreshold: 0, unattributable: 0, unpaired: 0, unstamped: 0 });
    expect(r.rows).toEqual([{ agent: "coder", task: "t1", ts: "2026-09-08T09:00:00", minutes: 10, outcome: "within" }]);
  });

  it("a pair over the threshold is counted and longer", () => {
    const r = dispatchIn(log(sess(), ...dispatch("t1", { end: "2026-09-08T09:45:00" })));
    expect(r).toMatchObject({ counted: 1, longerThanThreshold: 1 });
    expect(r.rows[0]).toMatchObject({ minutes: 45, outcome: "longer" });
  });

  it("a task_start with no task_done is unpaired, is not counted, and carries no zero", () => {
    const r = dispatchIn(log(sess(), ...dispatch("t1", { end: null })));
    expect(r).toMatchObject({ counted: 0, longerThanThreshold: 0, unpaired: 1 });
    // The plan spells the outcome field `<longer|within>`; the implementation
    // reports the unplaceable pair as its own outcome instead. Asserted as the
    // code behaves. `minutes: null` is C4's eighth criterion: a zero there would
    // read as an instant dispatch.
    expect(r.rows).toEqual([{ agent: "coder", task: "t1", ts: "2026-09-08T09:00:00", minutes: null, outcome: "unpaired" }]);
    expect(renderDispatch(r.rows[0])).toBe("dispatch=coder\tt1\t2026-09-08T09:00:00\t-\tunpaired");
  });

  it("a pair whose session_id no session_start accounts for is unattributable, reported and not dropped", () => {
    const r = dispatchIn(log(sess(), ...dispatch("t1", { session_id: "sess-other", end: "2026-09-08T09:45:00" })));
    expect(r).toMatchObject({ counted: 0, longerThanThreshold: 0, unattributable: 1, unpaired: 0 });
    // Measured but not scored: the duration is known, the dispatch is not placeable.
    expect(r.rows).toEqual([{ agent: "coder", task: "t1", ts: "2026-09-08T09:00:00", minutes: 45, outcome: "unattributable" }]);
    expect(r).toMatchObject({ sessionStarts: 1, sessionStartsWithoutId: 0 });
  });

  it("a dispatch carrying no session_id at all is unattributable for the same reason", () => {
    const r = dispatchIn(log(sess({ session_id: undefined }), ...dispatch("t1", { session_id: null })));
    expect(r).toMatchObject({ unattributable: 1, counted: 0, sessionStarts: 1, sessionStartsWithoutId: 1 });
  });

  it("a pair starting before the cutoff is excluded from every figure and every row", () => {
    const r = dispatchIn(log(sess({ ts: "2026-09-01T08:00:00" }), ...dispatch("t1", { ts: "2026-09-07T23:59:00", end: "2026-09-08T01:00:00" })));
    expect(r).toMatchObject({ counted: 0, longerThanThreshold: 0, unattributable: 0, unpaired: 0, unstamped: 0 });
    expect(r.rows).toEqual([]);
  });

  it("a dispatch by an agent outside the set is excluded", () => {
    const r = dispatchIn(log(sess(), ...dispatch("t1", { agent: "analyst", end: "2026-09-08T09:45:00" })));
    expect(r.rows).toEqual([]);
    expect(r).toMatchObject({ counted: 0, longerThanThreshold: 0 });
  });

  it("the cutoff and the agent filter scope the unpaired count too, so it stays comparable with counted", () => {
    // Beyond the plan's prose, which lists `unpaired` ahead of the two filters.
    // Unscoped, this fixture would report unpaired=3 over the whole file.
    const r = dispatchIn(log(
      sess(),
      ...dispatch("old", { ts: "2026-09-01T09:00:00", end: null }),
      ...dispatch("other-agent", { agent: "planner", end: null }),
      ...dispatch("mine", { end: null }),
    ));
    expect(r.unpaired).toBe(1);
    expect(r.rows.map((x) => x.task)).toEqual(["mine"]);
  });

  it("a malformed line is counted in malformed and not silently skipped", () => {
    const r = dispatchIn(log("not json", "[1,2]", sess(), ...dispatch("t1")));
    expect(r).toMatchObject({ malformed: 2, counted: 1 });
  });

  it("a dispatch whose stamp cannot be read is unstamped, not counted and not lost", () => {
    const r = dispatchIn(log(sess(), ...dispatch("t1", { ts: "bogus" }), ...dispatch("t2", { end: "bogus" })));
    expect(r).toMatchObject({ unstamped: 2, counted: 0, unpaired: 0 });
    expect(r.rows).toEqual([]);
  });

  it("a ts written without a Z designator is read as UTC and not as local time", () => {
    // The one assertion that would move with the runner's timezone if parseTs
    // stopped appending the designator: the start is unzoned, the completion
    // carries an explicit Z, so a local-time reading of the first shifts the
    // duration by the runner's offset. In UTC the pair is exactly 15 minutes,
    // and a shifted reading crosses the 20-minute threshold in either direction.
    const text = log(sess(), ...dispatch("t1", { ts: "2026-09-08T09:00:00", end: "2026-09-08T09:15:00Z" }));
    expect(dispatchIn(text).rows[0]).toMatchObject({ minutes: 15, outcome: "within" });
  });

  it("the four outcomes partition the rows, and counted is within plus longer and nothing else", () => {
    const r = dispatchIn(log(
      sess(),
      ...dispatch("a", { end: "2026-09-08T09:05:00" }),
      ...dispatch("b", { end: "2026-09-08T10:05:00" }),
      ...dispatch("c", { session_id: "sess-other" }),
      ...dispatch("d", { end: null }),
    ));
    const kinds = r.rows.map((x) => x.outcome);
    expect(kinds.sort()).toEqual(["longer", "unattributable", "unpaired", "within"]);
    expect(r.counted).toBe(2);
    expect(r.counted + r.unattributable + r.unpaired).toBe(r.rows.length);
  });
});

describe("the entry point puts the three limit= qualifications on stdout", () => {
  // C4's seventh criterion. A qualification on the other stream is a
  // qualification nobody reads: a prompt captures stdout and an exit code.
  const LIMIT_KEYS = ["dispatcher-unknown", "threshold-is-todays", "no-session-invisible"];

  it("all three are on stdout, beside the figures, and on stderr none of them is", () => {
    const dir = workbench(STATE, log(sess(), ...dispatch("t1", { end: "2026-09-08T09:10:00" })));
    const r = cli(dir, ident(0, { person: KAI, checkout: ME }), process.execPath, "dispatches");
    expect(r.status, r.stderr).toBe(0);
    for (const key of LIMIT_KEYS) {
      expect(r.stdout, `limit=${key} is not on stdout`).toContain(`limit=${key}\t`);
      expect(r.stderr).not.toContain(`limit=${key}`);
    }
    expect(r.stdout.split("\n").filter((l) => l.startsWith("limit=")).length).toBe(3);
    expect(r.stdout).toContain("counted=1");
  });
});

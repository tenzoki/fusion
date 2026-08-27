import { describe, it, expect, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pluginRoot } from "./helpers/citation-scan.js";
import { measurePresence, countTurns } from "../events-query.js";
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

const presence = (text: string, id = IDENT) =>
  measurePresence(text, id, { now: NOW, windowDays: 7 });
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

function workbench(state: string | null = STATE): string {
  const dir = mkdtempSync(join(tmpdir(), "fusion-events-"));
  tmpRoots.push(dir);
  mkdirSync(join(dir, "fusion-workbench"));
  writeFileSync(join(dir, "fusion-workbench", ".fusion-setup"), "{}\n");
  writeFileSync(join(dir, "fusion-workbench", "orchestrator-events.jsonl"), LOG);
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
  const r = spawnSync(bin, argv, { cwd: dir, encoding: "utf-8", env: { ...process.env, FUSION_PERSON: "", FUSION_CHECKOUT: "", ...env } });
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

  it("bin/fusion-events hands the SessionStart identity export through untouched", () => {
    const r = cli(workbench(), { FUSION_PERSON: KAI, FUSION_CHECKOUT: ME }, wrapper, "turns");
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toBe("turns=1\nhistory_file=h.md\nscope=checkout\n");
  });
});

import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  GOVERNED_DENY_REASON,
  GOVERNED_PATH,
  readEscalation,
  runWrite,
  withGovernedProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// A shape-valid `escalation.json` used to make the whole guard fail open.
//
// `loadEscalation` parsed with an `as EscalationState` cast. Its try/catch
// handled a MISSING file and UNPARSEABLE text; it did not handle text that
// parses to a valid JSON value of the WRONG SHAPE. Every later access then
// threw, `main().catch` printed one stderr line and emitted `{}`, and Claude
// Code reads `{}` as ALLOW. Measured on the shipped guard before the fix:
//
//     {}                          Edit ALLOW (fail-open)   Bash rm ALLOW (fail-open)
//     {…} without recentEvents    Edit ALLOW (fail-open)   Bash rm ALLOW (fail-open)
//     {"recentEvents":{}}         Edit ALLOW (fail-open)   Bash rm ALLOW (fail-open)
//     null                        Edit ALLOW (fail-open)   Bash rm ALLOW (fail-open)
//     truncated JSON              deny                     deny
//     empty file                  deny                     deny
//
// The two rows that behaved are the two the catch was written for. Every row
// that failed open is well-formed JSON. The failure was total: the whole
// protected list, both surfaces, and an active halt was not consulted either.
//
// The Bash column is history. It was measured on `rm -f agents/coder.md`,
// against a classifier that predicted shell writes; when that went, the rows
// were re-pointed at the git branch policy, the one deny the shell surface still
// had. That is deleted too, and the shell surface now has no deny to make fail
// open — a Bash call reads no state, so there is no coercion for it to survive.
// Every row below is a write-tool case, the surface where the defect was found.
//
// ## Which deny the rows use, and why it is no longer a protected path
//
// The defect is about the STATE FILE, not about what is being written. Every
// row needs some deny to exist so that "the guard failed open and allowed"
// is distinguishable from "the guard denied"; which deny it is was never the
// subject. It was `Edit agents/coder.md` because that was the nearest deny to
// hand, and that made this file fail when the protected-path half was emptied —
// nine of its twelve cases, none of them about protected paths.
//
// The probe is now the decision-governed deny (CHECK 3), armed from the
// throwaway project's own `fusion-guard.json`. See `GOVERNED_PATH` in
// helpers/guard-harness.ts for the two properties that make it a drop-in: it
// runs through the same `recordBlock`, so the counter cases are unchanged, and
// the path it names is matched by no protected pattern, so none of these rows
// can pass for the protected-path reason by accident.
//
// ## What these cases assert, and what they deliberately do not
//
// They assert the PRODUCTION verdict — `decision === "block"` — not merely that
// the harness is unhappy. `runGuard` does throw on a `[guard] Error:` stderr
// line (helpers/guard-harness.ts, "Fail loud, never skip"), so a regression
// would surface here twice over; but a case that only ever proved "the harness
// refused the result" would be asserting the test infrastructure's opinion
// rather than what Claude Code would have been told. The assertion is on the
// verdict.
//
// Each row is seeded through `files`, which writes its content VERBATIM. The
// `escalation` option cannot express these cases: it merges a partial over a
// well-formed snapshot and stringifies the result, so by construction it can
// only produce shapes that are already valid.
//
// One case is a well-formed halted state seeded the same way. It is the
// anti-vacuity control: without it, a malformed row that denied only because
// the seeded file was never read at all would pass and prove nothing.
// ---------------------------------------------------------------------------

/** Where a seeded state file goes, relative to the project root. */
const STATE_FILE = "fusion-workbench/.guard-state/escalation.json";

/** The path every deny row writes. Governed by CHECK 3, protected by nothing. */
const TARGET = GOVERNED_PATH;

interface Row {
  name: string;
  /** Written verbatim — the point is that this is NOT an escalation state. */
  content: string;
}

const MALFORMED_ROWS: Row[] = [
  {
    name: "{} — the empty object a user types to clear a halt by hand",
    content: "{}",
  },
  {
    name: "a state object missing recentEvents — a partial write by any other writer",
    content: '{"haltActive":false,"consecutiveBlocks":0,"lastBlockTimestamp":null}',
  },
  {
    name: 'recentEvents as an object rather than an array ({"recentEvents":{}})',
    content: '{"recentEvents":{}}',
  },
  {
    name: "null — valid JSON, no properties to read at all",
    content: "null",
  },
  {
    name: "truncated JSON — one of the two rows that always behaved",
    content: '{"haltActive": false, "consecutiveBl',
  },
  {
    name: "an empty file — the other row that always behaved",
    content: "",
  },
];

describe("a malformed escalation.json denies on the write-tool surface", () => {
  for (const { name, content } of MALFORMED_ROWS) {
    it(
      `denies Edit ${TARGET} with ${name}`,
      () => {
        withGovernedProject(
          ({ root }) => {
            const res = runWrite(root, resolve(root, TARGET));
            expect(res.decision).toBe("block");
            expect(res.reason).toContain(GOVERNED_DENY_REASON);
          },
          { files: { [STATE_FILE]: content } },
        );
      },
      CASE_TIMEOUT,
    );
  }
});

describe("the seeded state file is genuinely read (anti-vacuity)", () => {
  // Without this case, every assertion above would still pass if the guard had
  // stopped reading escalation.json altogether — a deny for the right reason
  // and a deny because the state never arrived look identical from outside.
  const halted = JSON.stringify({
    haltActive: true,
    consecutiveBlocks: 3,
    lastBlockTimestamp: "2026-08-02T00:00:00.000Z",
    recentEvents: [],
  });

  it(
    "reports the halt from a well-formed halted file seeded the same way",
    () => {
      withGovernedProject(
        ({ root }) => {
          const res = runWrite(root, resolve(root, TARGET));
          expect(res.decision).toBe("block");
          // The halt names itself, not the path — proof the file was read.
          expect(res.reason).toContain("[HALTED]");
        },
        { files: { [STATE_FILE]: halted } },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("a well-formed state file behaves exactly as before", () => {
  it(
    "carries consecutiveBlocks forward, so the halt threshold is unmoved",
    () => {
      // The coercion defaults every field. If it defaulted a field it should
      // have kept, a project two blocks into an escalation would silently start
      // over — the same file, a different halt threshold. Seeded at 2, so ONE
      // further deny is the third and trips the halt.
      withGovernedProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, TARGET)).decision).toBe("block");
          const state = readEscalation(root);
          expect(state?.consecutiveBlocks).toBe(3);
          expect(state?.haltActive).toBe(true);
        },
        {
          files: {
            [STATE_FILE]: JSON.stringify({
              haltActive: false,
              consecutiveBlocks: 2,
              lastBlockTimestamp: "2026-08-02T00:00:00.000Z",
              recentEvents: [],
            }),
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps the recentEvents already on disk rather than dropping them",
    () => {
      const prior = {
        level: "block",
        trigger: "decision_governed",
        message: "an earlier block",
        timestamp: "2026-08-02T00:00:00.000Z",
      };
      withGovernedProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, TARGET)).decision).toBe("block");
          const events = readEscalation(root)?.recentEvents ?? [];
          expect(events[0]?.message).toBe("an earlier block");
          expect(events).toHaveLength(2);
        },
        {
          files: {
            [STATE_FILE]: JSON.stringify({
              haltActive: false,
              consecutiveBlocks: 0,
              lastBlockTimestamp: null,
              recentEvents: [prior],
            }),
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still allows an unguarded write, so the coercion did not just deny everything",
    () => {
      withGovernedProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, "notes.txt")).decision).toBeUndefined();
        },
        { files: { [STATE_FILE]: "{}" } },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("the two coercions that lean restrictive", () => {
  // Both directions are deliberate: a halt is the restrictive state and a user
  // can always clear it, so reading a hand-edited value as "still halted" is
  // the safer of the two errors.

  it(
    "reads a non-boolean truthy haltActive as halted rather than clearing it",
    () => {
      withGovernedProject(
        ({ root }) => {
          const res = runWrite(root, resolve(root, "notes.txt"));
          expect(res.decision).toBe("block");
          expect(res.reason).toContain("[HALTED]");
        },
        {
          files: {
            [STATE_FILE]: '{"haltActive":"true","consecutiveBlocks":0,"recentEvents":[]}',
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "clamps a negative consecutiveBlocks to zero rather than delaying the halt",
    () => {
      withGovernedProject(
        ({ root }) => {
          expect(runWrite(root, resolve(root, TARGET)).decision).toBe("block");
          expect(readEscalation(root)?.consecutiveBlocks).toBe(1);
        },
        {
          files: {
            [STATE_FILE]:
              '{"haltActive":false,"consecutiveBlocks":-99,"lastBlockTimestamp":null,"recentEvents":[]}',
          },
        },
      );
    },
    CASE_TIMEOUT,
  );
});

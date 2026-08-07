import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  readEvents,
  runBash,
  runWrite,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// What a `guard_halt` row in events.jsonl tells its reader.
//
// A halt is the state a user has to come and clear, and events.jsonl is where
// they reconstruct what the agent was trying to do. `guard_halt` reaches the log
// from two kinds of place — the write-tool halt, and a `recordBlock` that
// tripped the threshold — and the monitor renders both into one row type.
// Nothing in the detail used to say which, so a stalled session left a run of
// identical-looking rows and the reader had to guess.
//
// The two detail shapes asserted below are the fix, and they are asserted on the
// FILE the guard wrote, not on the source text.
//
// ## The third source is gone, and so are the cases that read it
//
// There used to be a Bash halt: a halted guard denied every shell command a
// classifier recognised as a mutation, with its own detail prefix. The
// classifier is retired — "does this command write a file?" is the same
// undecidable question the protected-path prediction asked, in small — and the
// user accepted the loss explicitly on 260807-0945
// (`decisions/260807-1026_*_verlust-des-bash-halts-auf-der-shell.md`). The
// protected paths are not left to the halt: they are measured after every tool
// call and restored, halt or no halt
// (`protected-snapshot-integration.test.ts`).
//
// Five cases about the Bash halt's detail string and one about the Bash
// protected-path deny's segment went with it. The monitor still renders the old
// prefix, because historical rows in an existing events.jsonl still carry it;
// nothing writes it any more, so there is nothing left here to assert about it.
// ---------------------------------------------------------------------------

/** A halted project, without the three real denials it would take to reach one. */
const HALTED = { escalation: { haltActive: true } };

/** Every guard_halt row's detail, in order. */
function haltDetails(root: string): string[] {
  return readEvents(root)
    .filter((e) => e.event === "guard_halt")
    .map((e) => e.detail ?? "");
}

describe("a reader can tell the two guard_halt sources apart", () => {
  it(
    "marks a halted write-tool call as the write surface",
    () => {
      withProject(({ root }) => {
        expect(runWrite(root, resolve(root, "rules/x.md")).decision).toBe("block");
        const events = readEvents(root).filter((e) => e.event === "guard_halt");
        expect(events).toHaveLength(1);
        expect(events[0].detail).toBe("Halt active — write tool call blocked");
        expect(events[0].tool).toBe("Edit");
        expect(events[0].file).toBe("rules/x.md");
      }, HALTED);
    },
    CASE_TIMEOUT,
  );

  it(
    "marks the block that RAISED the halt as such, and names its cause",
    () => {
      // The second source: no halt was active, three denials tripped one. The
      // first two are guard_block; the third is a guard_halt whose detail says
      // the halt was raised here rather than reading like the two above it.
      //
      // All three are write-tool denials. Two of them used to be shell
      // mutations, which no longer deny.
      withProject(({ root }) => {
        expect(runWrite(root, resolve(root, "rules/x.md")).decision).toBe("block");
        expect(runWrite(root, resolve(root, "agents/coder.md")).decision).toBe(
          "block",
        );
        expect(
          runWrite(root, resolve(root, "skills/demo/SKILL.md")).decision,
        ).toBe("block");

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual([
          "guard_block",
          "guard_block",
          "guard_halt",
        ]);
        // The two ordinary blocks read exactly as they always have.
        expect(events[0].detail).toBe("Protected path");
        expect(events[1].detail).toBe("Protected path");
        // The third says the halt was raised by it, and still names the cause —
        // on the write surface the cause is the path, and the path is the
        // event's own file field rather than a repetition inside the detail.
        expect(events[2].detail).toContain("Halt raised by this block");
        expect(events[2].detail).toContain("Protected path");
        expect(events[2].file).toBe("skills/demo/SKILL.md");
      });
    },
    CASE_TIMEOUT * 2,
  );

  it(
    "keeps the halt-raised prefix off the git branch policy's ordinary blocks",
    () => {
      withProject(({ root }) => {
        expect(runBash(root, "git switch main").decision).toBe("block");
        const events = readEvents(root);
        expect(events).toHaveLength(1);
        expect(events[0].event).toBe("guard_block");
        expect(events[0].detail).toContain("Git branch-switch denied");
        expect(events[0].detail).toContain("git switch main");
        expect(events[0].detail).not.toContain("Halt");
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the halt does not reach the shell", () => {
  it(
    "logs no guard_halt for a shell command under an active halt",
    () => {
      // The cost the user accepted, pinned so it is a decision rather than a
      // regression: under a halt `rm notes.txt` runs, and nothing is written to
      // the event log about it. The write tools stay blocked (case above), and
      // the protected paths are measured rather than halted.
      withProject(({ root }) => {
        expect(runBash(root, "rm -f notes.txt").decision).toBeUndefined();
        expect(haltDetails(root)).toEqual([]);
      }, HALTED);
    },
    CASE_TIMEOUT,
  );

  it(
    "still denies a branch switch under a halt, on the branch policy's reason",
    () => {
      // The one Bash deny left is not the halt's, and it must not start
      // reporting as one: the halt is not the condition an agent has to clear
      // to switch branches.
      withProject(({ root }) => {
        const res = runBash(root, "git switch main");
        expect(res.decision).toBe("block");
        expect(res.reason).toContain("never switch git branches");
        expect(res.reason).not.toContain("[HALTED]");
      }, HALTED);
    },
    CASE_TIMEOUT,
  );
});

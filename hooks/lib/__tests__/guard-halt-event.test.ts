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
// they reconstruct what the agent was trying to do. Two defects made those rows
// nearly contentless:
//
//   1. The Bash halt passed `mutation.targetPath` and a CONSTANT detail.
//      `targetPath` is populated on a DENYING verdict only, while the halt
//      fires on `mutation.mutates` — the common case being a command that
//      mutates something unprotected. So `rm notes.txt` under a halt logged
//      `{"event":"guard_halt","tool":"Bash","detail":"Halt active — mutating
//      Bash command blocked"}` with no file and no command: a halted session
//      left a run of identical rows saying "something mutating was blocked, ten
//      times".
//   2. `guard_halt` reaches the log from three kinds of place — the write-tool
//      halt, the Bash halt, and a `recordBlock` that tripped the threshold —
//      and the monitor renders all three into one row type. Nothing in the
//      detail said which.
//
// The three detail shapes asserted below are the fix, and they are asserted on
// the FILE the guard wrote, not on the source text.
// ---------------------------------------------------------------------------

/** A halted project, without the three real denials it would take to reach one. */
const HALTED = { escalation: { haltActive: true } };

/** Every guard_halt row's detail, in order. */
function haltDetails(root: string): string[] {
  return readEvents(root)
    .filter((e) => e.event === "guard_halt")
    .map((e) => e.detail ?? "");
}

describe("the Bash halt event names the command it blocked", () => {
  it(
    "names an unprotected command, where targetPath is undefined",
    () => {
      // The case the constant detail lost entirely: nothing protected is
      // touched, so the file field is empty and the detail was all there was.
      withProject(({ root }) => {
        expect(runBash(root, "rm -f notes.txt").decision).toBe("block");
        const details = haltDetails(root);
        expect(details).toHaveLength(1);
        expect(details[0]).toContain("rm -f notes.txt");
      }, HALTED);
    },
    CASE_TIMEOUT,
  );

  it(
    "names a redirection, which has no verb to read the target off",
    () => {
      withProject(({ root }) => {
        expect(runBash(root, "echo hi > out.txt").decision).toBe("block");
        expect(haltDetails(root)[0]).toContain("echo hi > out.txt");
      }, HALTED);
    },
    CASE_TIMEOUT,
  );

  it(
    "prefers the offending segment when the halted command is also protected",
    () => {
      // A halted guard meeting a PROTECTED path denies at the halt, above the
      // protected-path deny — and that verdict does carry a rendered segment,
      // so the detail can be sharper than the whole command line.
      withProject(({ root }) => {
        expect(runBash(root, "ls -la && rm -f rules/x.md").decision).toBe("block");
        const detail = haltDetails(root)[0];
        expect(detail).toContain("rm -f rules/x.md");
        // The segment, not the whole compound command.
        expect(detail).not.toContain("ls -la");
      }, HALTED);
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps the row on one line and bounded, however long the command is",
    () => {
      // Two commands on two lines, the first far past the 200-character cap.
      // Nothing protected is touched, so the detail carries the whole command
      // and both the collapse and the truncation have something to do.
      const long =
        `rm -f ${Array.from({ length: 40 }, (_, i) => `notes-${i}.txt`).join(" ")}` +
        "\nrm -f more.txt";
      withProject(({ root }) => {
        expect(runBash(root, long).decision).toBe("block");
        const detail = haltDetails(root)[0];
        expect(detail).not.toContain("\n");
        expect(detail.length).toBeLessThan(300);
        expect(detail).toContain("…");
      }, HALTED);
    },
    CASE_TIMEOUT,
  );

  it(
    "still logs nothing for a read-only command, which the halt does not block",
    () => {
      // The halt blocks recognised mutations only, so an agent can read its way
      // to understanding why it is halted. No mutation, no halt event.
      withProject(({ root }) => {
        expect(runBash(root, "ls -la").decision).toBeUndefined();
        expect(haltDetails(root)).toEqual([]);
      }, HALTED);
    },
    CASE_TIMEOUT,
  );
});

describe("a reader can tell the three guard_halt sources apart", () => {
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
    "marks a halted Bash mutation as the shell surface",
    () => {
      withProject(({ root }) => {
        expect(runBash(root, "rm -f notes.txt").decision).toBe("block");
        expect(haltDetails(root)[0]).toContain("mutating Bash command blocked");
      }, HALTED);
    },
    CASE_TIMEOUT,
  );

  it(
    "marks the block that RAISED the halt as such, and names its cause",
    () => {
      // The third source: no halt was active, three denials tripped one. The
      // first two are guard_block; the third is a guard_halt whose detail now
      // says the halt was raised here rather than reading like the two above it.
      withProject(({ root }) => {
        expect(runBash(root, "rm -f rules/x.md").decision).toBe("block");
        expect(runWrite(root, resolve(root, "agents/coder.md")).decision).toBe(
          "block",
        );
        expect(runBash(root, "rm -f skills/demo/SKILL.md").decision).toBe("block");

        const events = readEvents(root);
        expect(events.map((e) => e.event)).toEqual([
          "guard_block",
          "guard_block",
          "guard_halt",
        ]);
        // The two ordinary blocks read exactly as they always have.
        expect(events[0].detail).not.toContain("Halt");
        expect(events[1].detail).toBe("Protected path");
        // The third says the halt was raised by it, and still names the cause.
        expect(events[2].detail).toContain("Halt raised by this block");
        expect(events[2].detail).toContain("skills/demo/SKILL.md");
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

describe("the Bash protected-path deny names its segment too", () => {
  it(
    "records the command, not only the path, on an ordinary block",
    () => {
      // The path alone does not say what the agent ran. On the write-tool path
      // the tool call IS the path; on the shell path it is a command line, and
      // the file field cannot carry it.
      withProject(({ root }) => {
        expect(runBash(root, "mv rules/x.md /tmp/").decision).toBe("block");
        const events = readEvents(root);
        expect(events[0].event).toBe("guard_block");
        expect(events[0].file).toBe("rules/x.md");
        expect(events[0].detail).toContain("mv rules/x.md /tmp/");
      });
    },
    CASE_TIMEOUT,
  );
});

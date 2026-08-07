/**
 * The protected-path measurement, end to end.
 *
 * ## Why every case here is a subprocess in a throwaway project
 *
 * `isFusionPluginCwd()` stands the write guard down inside fusion's own
 * repository and caches the answer per process. An assertion that "the guard
 * reverted the file", written naively in this repository, would therefore pass
 * without the mechanism ever running. `guard-harness.ts` builds a real project
 * root elsewhere on disk and spawns both hooks against it; see that file's
 * header for the full argument.
 *
 * The measurement is a PAIR — `guard.ts` records the before-fingerprint,
 * `tracker.ts` compares and repairs — so every case runs `runToolCall`, which
 * puts the effect between the two hooks in the order a real tool call has.
 */

import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
  projectConfig,
  readEscalation,
  readEvents,
  runToolCall,
  withPluginProject,
  withProject,
} from "./helpers/guard-harness.js";

/** Read a project file, or null when it is gone. */
function read(root: string, rel: string): string | null {
  const abs = resolve(root, rel);
  return existsSync(abs) ? readFileSync(abs, "utf-8") : null;
}

/** Write a project file the way a shell command or an editor would. */
function put(root: string, rel: string, content: string): void {
  writeFileSync(resolve(root, rel), content, "utf-8");
}

/** The context sentence the tracker handed back to the model, or "". */
function context(post: { hookSpecificOutput?: { additionalContext?: string } }): string {
  return post.hookSpecificOutput?.additionalContext ?? "";
}

describe("the measurement restores what a tool call changed", () => {
  it(
    "reverts a protected rule file written through the shell, and halts",
    () => {
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/x.md", "# owned\n"),
          );

          // The file is back the way it was committed.
          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");

          // The guard is halted, so the write tools are blocked from here on.
          expect(readEscalation(project.root)?.haltActive).toBe(true);

          // And the model was told which file and why — the constraint the
          // binding decision put on any answer to this question.
          expect(context(post)).toContain("rules/x.md");
          expect(context(post)).toContain("restored from git");
          expect(context(post)).toContain("HALTED");

          const events = readEvents(project.root);
          const blocked = events.filter((e) => e.event === "guard_block");
          expect(blocked.map((e) => e.file)).toContain("rules/x.md");
          expect(events.some((e) => e.event === "guard_halt")).toBe(true);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reverts a protected file that was deleted",
    () => {
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => rmSync(resolve(project.root, "agents/coder.md")),
          );

          expect(read(project.root, "agents/coder.md")).toBe("# an agent\n");
          expect(context(post)).toContain("was deleted");
          expect(readEscalation(project.root)?.haltActive).toBe(true);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "measures a path the write tools reach too, not only the shell",
    () => {
      // The whole point of measuring instead of predicting: the route to the
      // file does not matter. An Edit that somehow got past the PreToolUse
      // check is caught by the same comparison a shell write is.
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Edit",
            { file_path: resolve(project.root, "skills/demo/SKILL.md") },
            () => put(project.root, "skills/demo/SKILL.md", "# rewritten\n"),
          );

          expect(read(project.root, "skills/demo/SKILL.md")).toBe("# a skill\n");
          expect(context(post)).toContain("skills/demo/SKILL.md");
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("the measurement leaves alone what this tool call did not do", () => {
  it(
    "does not touch a protected file the human had already modified",
    () => {
      // The risk the before-fingerprint exists to remove. A rule file open in
      // the human's editor is dirty against HEAD before the tool call starts;
      // reverting it would destroy their work on an unrelated call.
      withProject(
        (project) => {
          put(project.root, "rules/x.md", "# the human is editing this\n");

          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => {
              /* the tool call changes nothing */
            },
          );

          expect(read(project.root, "rules/x.md")).toBe(
            "# the human is editing this\n",
          );
          expect(context(post)).toBe("");
          expect(readEscalation(project.root)?.haltActive ?? false).toBe(false);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reverts only the difference of this call, leaving other dirty files be",
    () => {
      withProject(
        (project) => {
          put(project.root, "agents/coder.md", "# human work in progress\n");

          runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/x.md", "# the agent did this\n"),
          );

          // Reverted: it changed during the call.
          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");
          // Untouched: it was already like this before the call.
          expect(read(project.root, "agents/coder.md")).toBe(
            "# human work in progress\n",
          );
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "says nothing and halts nothing when an unprotected file changes",
    () => {
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "notes.txt", "changed\n"),
          );

          expect(read(project.root, "notes.txt")).toBe("changed\n");
          expect(context(post)).toBe("");
          expect(readEscalation(project.root)?.haltActive ?? false).toBe(false);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("a path git does not know is reported, never silently dropped", () => {
  it(
    "reports and halts on a newly created protected file, and does not delete it",
    () => {
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/planted.md", "# new\n"),
          );

          // Not rolled back: HEAD has no content to restore, and the guard does
          // not delete files to make the tree match a snapshot.
          expect(read(project.root, "rules/planted.md")).toBe("# new\n");

          // Reported, with the missing versioning named as the cause.
          expect(context(post)).toContain("rules/planted.md");
          expect(context(post)).toContain("could NOT be restored");
          expect(context(post)).toContain("not known to git");
          expect(context(post)).toContain("still on disk");

          // And halted anyway, because the boundary was crossed.
          expect(readEscalation(project.root)?.haltActive).toBe(true);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reports rather than pretending, when the project is not a git repository",
    () => {
      // A consuming project's workbench is a runtime artifact and often not
      // versioned at all. The failure mode this case exists to forbid is a
      // guard that reports the violation as handled while the file stays
      // modified.
      withProject((project) => {
        const { post } = runToolCall(
          project.root,
          "Bash",
          { command: "true" },
          () => put(project.root, "rules/x.md", "# owned\n"),
        );

        expect(read(project.root, "rules/x.md")).toBe("# owned\n");
        expect(context(post)).toContain("could NOT be restored");
        expect(readEscalation(project.root)?.haltActive).toBe(true);
      });
    },
    CASE_TIMEOUT,
  );
});

describe("the stand-downs", () => {
  it(
    "measures nothing in the fusion plugin's own repository",
    () => {
      // Both halves stand down together. Left active, the measurement would
      // revert a fusion developer's own edits to rules/ and agents/ on the next
      // tool call — the one place those edits are the work.
      withPluginProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/x.md", "# developing fusion\n"),
          );

          expect(read(project.root, "rules/x.md")).toBe("# developing fusion\n");
          expect(context(post)).toBe("");
          expect(readEscalation(project.root)?.haltActive ?? false).toBe(false);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "measures nothing when the project declares an empty protected list",
    () => {
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/x.md", "# narrowed away\n"),
          );

          expect(read(project.root, "rules/x.md")).toBe("# narrowed away\n");
          expect(context(post)).toBe("");
        },
        {
          git: true,
          files: {
            "fusion-guard.json": projectConfig({
              guard: { protectedPaths: [] },
            }),
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still protects fusion-guard.json itself under a declared empty list",
    () => {
      // The self-protection floor: once the file exists the guard protects it,
      // whatever its own list says. That floor is a protected PATH, so the
      // measurement has to see it like any other.
      withProject(
        (project) => {
          runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () =>
              put(
                project.root,
                "fusion-guard.json",
                projectConfig({ guard: { protectedPaths: ["nothing/**"] } }),
              ),
          );

          expect(read(project.root, "fusion-guard.json")).toContain(
            '"protectedPaths": []',
          );
          expect(readEscalation(project.root)?.haltActive).toBe(true);
        },
        {
          git: true,
          files: {
            "fusion-guard.json": projectConfig({
              guard: { protectedPaths: [] },
            }),
          },
        },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("the halt no longer reaches the shell", () => {
  it(
    "lets an unprotected shell mutation through while halted",
    () => {
      // The deliberate loss, confirmed by the user on 260807-0945 and recorded
      // as a decision. The branch that used to deny this asked "does this
      // command write a file at all?", which is the same undecidable question
      // the classifier is being retired for.
      withProject(
        (project) => {
          const { pre } = runToolCall(
            project.root,
            "Bash",
            { command: "rm notes.txt" },
            () => {
              /* the guard's verdict is what this case is about */
            },
          );

          expect(pre.decision).toBeUndefined();
        },
        { git: true, escalation: { haltActive: true } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still blocks every write tool while halted",
    () => {
      // The half that stays. A halt remains a real stop on the four write
      // tools, which is what makes it worth raising at all.
      withProject(
        (project) => {
          const { pre } = runToolCall(
            project.root,
            "Edit",
            { file_path: resolve(project.root, "notes.txt") },
            () => {
              /* denied calls never run */
            },
          );

          expect(pre.decision).toBe("block");
          expect(pre.reason).toContain("[HALTED]");
        },
        { git: true, escalation: { haltActive: true } },
      );
    },
    CASE_TIMEOUT,
  );
});

describe("the revert restores content, not merely a git status", () => {
  it(
    "puts back the exact committed bytes after several edits in one call",
    () => {
      withProject(
        (project) => {
          runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => {
              put(project.root, "rules/x.md", "# first\n");
              put(project.root, "rules/x.md", "# second\n");
              put(project.root, "agents/coder.md", "# also this\n");
            },
          );

          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");
          expect(read(project.root, "agents/coder.md")).toBe("# an agent\n");

          // And git agrees the tree is clean again for those two paths.
          const status = execFileSync(
            "git",
            ["status", "--porcelain", "--", "rules/x.md", "agents/coder.md"],
            { cwd: project.root, encoding: "utf-8" },
          );
          expect(status.trim()).toBe("");
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );
});

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
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
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

/** Write raw bytes, for the cases that are about the bytes. */
function putBytes(root: string, rel: string, bytes: Buffer): void {
  const abs = resolve(root, rel);
  mkdirSync(resolve(abs, ".."), { recursive: true });
  writeFileSync(abs, bytes);
}

/** Run one git command in the project, for the cases about the human's index. */
function git(root: string, ...args: string[]): void {
  execFileSync("git", args, { cwd: root, encoding: "utf-8" });
}

/** The context sentence the tracker handed back to the model, or "". */
function context(post: { hookSpecificOutput?: { additionalContext?: string } }): string {
  return post.hookSpecificOutput?.additionalContext ?? "";
}

/** Is this path a symbolic link — asked of the path, never of its target. */
function isLink(root: string, rel: string): boolean {
  try {
    return lstatSync(resolve(root, rel)).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Replace `rel` with a symbolic link to `targetRel`, the way one `ln -s` does.
 *
 * `rmSync` first, because `symlinkSync` refuses an occupied name — which is
 * also why the attack is two operations rather than one, and why it fits inside
 * a single tool call all the same.
 */
function linkOver(root: string, rel: string, targetRel: string): void {
  const abs = resolve(root, rel);
  rmSync(abs, { recursive: true, force: true });
  symlinkSync(resolve(root, targetRel), abs);
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
          expect(context(post)).toContain("has been restored");
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
    "reverts one an actual shell process wrote, not only one this test wrote",
    () => {
      // The case above changes the bytes with `writeFileSync` from inside the
      // test process. That is the same event as far as the measurement is
      // concerned — it compares two fingerprints and never learns who moved
      // them — but "the same event as far as the mechanism is concerned" is an
      // inference, and this is the claim the release rests on. So here a real
      // `/bin/sh` really does redirect into a protected path.
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "echo '# owned by the shell' > rules/x.md" },
            () =>
              execFileSync("/bin/sh", ["-c", "echo '# owned by the shell' > rules/x.md"], {
                cwd: project.root,
                encoding: "utf-8",
              }),
          );

          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");
          expect(readEscalation(project.root)?.haltActive).toBe(true);
          expect(context(post)).toContain("rules/x.md");
          expect(context(post)).toContain("has been restored");

          const events = readEvents(project.root);
          expect(
            events.filter((e) => e.event === "guard_block").map((e) => e.file),
          ).toContain("rules/x.md");
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

describe("the restore target is the snapshot, not git", () => {
  it(
    "deletes a protected file this call created — it did not exist before",
    () => {
      // While the restore was `git checkout HEAD --`, this was the branch that
      // could not run: HEAD holds no content for an untracked path, so the file
      // stayed on disk and the guard reported a violation it had not undone.
      // Non-existence is a fingerprint like any other, and putting a path back
      // to it means deleting it.
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/planted.md", "# new\n"),
          );

          expect(read(project.root, "rules/planted.md")).toBeNull();

          expect(context(post)).toContain("rules/planted.md");
          expect(context(post)).toContain("was created");
          expect(context(post)).toContain("removed again");
          expect(readEscalation(project.root)?.haltActive).toBe(true);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "restores in a project that is not a git repository at all",
    () => {
      // A consuming project's workbench is a runtime artifact and often not
      // versioned. Note the absent `git: true` — this project has no `.git` and
      // the restore is unaffected, because the content came from the snapshot.
      withProject((project) => {
        const { post } = runToolCall(
          project.root,
          "Bash",
          { command: "true" },
          () => put(project.root, "rules/x.md", "# owned\n"),
        );

        expect(read(project.root, "rules/x.md")).toBe("# a rule\n");
        expect(context(post)).toContain("has been restored");
        expect(context(post)).not.toContain("could NOT");
        expect(readEscalation(project.root)?.haltActive).toBe(true);
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "restores the human's STAGED version, not the committed one",
    () => {
      // The finding this restore mechanism was changed for:
      // `circles/260807-0923-guard-misst-statt-orakelt/issues/260807-1026_*_rueckrollen-auf-head-kann-menschliche-vorarbeit-verwerfen.md`.
      // A human edited a protected file and staged it; the agent then
      // overwrote it in one tool call. `git checkout HEAD --` restored the
      // COMMITTED bytes and discarded the human's work along with the agent's.
      withProject(
        (project) => {
          put(project.root, "rules/x.md", "# the human wrote this and staged it\n");
          git(project.root, "add", "rules/x.md");

          runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/x.md", "# the agent overwrote it\n"),
          );

          expect(read(project.root, "rules/x.md")).toBe(
            "# the human wrote this and staged it\n",
          );
          // And the staged version is still what the index holds, so the human
          // has lost nothing at all.
          expect(
            execFileSync("git", ["show", ":rules/x.md"], {
              cwd: project.root,
              encoding: "utf-8",
            }),
          ).toBe("# the human wrote this and staged it\n");
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "puts back the exact bytes of a binary protected file",
    () => {
      // `bin/monitor` is on the shipped protected list and is a binary. There is
      // deliberately no size threshold and no special case for binaries, so this
      // is the case that has to hold instead: the round trip is bytes, and
      // `0xc3 0x28` is not valid utf-8, so a text round trip would corrupt it.
      withProject((project) => {
        const original = Buffer.from([0x00, 0x01, 0xff, 0xfe, 0x0a, 0xc3, 0x28]);
        putBytes(project.root, "bin/monitor", original);

        runToolCall(project.root, "Bash", { command: "true" }, () =>
          putBytes(project.root, "bin/monitor", Buffer.from([0x09, 0x09])),
        );

        expect(
          readFileSync(resolve(project.root, "bin/monitor")).equals(original),
        ).toBe(true);
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

describe("the rules-write exemption reaches the measurement", () => {
  it(
    "leaves a rule file alone under the flag, and records why",
    () => {
      // The flag's whole purpose: a curation session edits the rule set. Before
      // this was wired in, the measurement reverted exactly the writes the flag
      // had legitimately allowed.
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/x.md", "# curated\n"),
            { FUSION_ALLOW_RULES_WRITE: "1" },
          );

          expect(read(project.root, "rules/x.md")).toBe("# curated\n");
          expect(context(post)).toBe("");
          expect(readEscalation(project.root)?.haltActive ?? false).toBe(false);

          // Not silence: the same note the write-tool path records, so a reader
          // of events.jsonl sees the cause and not only the absence of a block.
          const advisories = readEvents(project.root).filter(
            (e) => e.event === "guard_advisory",
          );
          expect(
            advisories.some(
              (e) =>
                (e.detail ?? "").includes("FUSION_ALLOW_RULES_WRITE") &&
                (e.detail ?? "").includes("rules/x.md"),
            ),
          ).toBe(true);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "agrees with the PreToolUse guard on a write-tool call",
    () => {
      // The regression the wiring closed, and the reason it could not be left
      // to a later step: `guard.ts` ALLOWED the Edit under the flag and the
      // tracker then reverted it, inside one tool call, so the flag looked
      // broken from both ends at once.
      withProject(
        (project) => {
          const { pre, post } = runToolCall(
            project.root,
            "Edit",
            { file_path: resolve(project.root, "rules/x.md") },
            () => put(project.root, "rules/x.md", "# curated\n"),
            { FUSION_ALLOW_RULES_WRITE: "1" },
          );

          expect(pre.decision).toBeUndefined();
          expect(read(project.root, "rules/x.md")).toBe("# curated\n");
          expect(context(post)).toBe("");
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reverts everything outside the rule directories in the same call",
    () => {
      // The flag grants one permission. It is not a way past the protected list,
      // and a call that touches both gets both answers.
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => {
              put(project.root, "rules/x.md", "# curated\n");
              put(project.root, "agents/coder.md", "# not covered\n");
            },
            { FUSION_ALLOW_RULES_WRITE: "1" },
          );

          expect(read(project.root, "rules/x.md")).toBe("# curated\n");
          expect(read(project.root, "agents/coder.md")).toBe("# an agent\n");

          expect(context(post)).toContain("agents/coder.md");
          expect(context(post)).not.toContain("rules/x.md");
          expect(readEscalation(project.root)?.haltActive).toBe(true);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reverts a rule path the project declared for itself, flag or no flag",
    () => {
      // Gate 1b, decision 260803-1314: an entry a project wrote by hand
      // outranks a flag an agent set in a shell.
      //
      // The declared list REPLACES the plugin's, so `rules/immutable/**` is the
      // only protected path here — which is what isolates gate 1b. Adding
      // `rules/**` alongside it would refuse the grant for the whole rule tree,
      // deliberately (see `isProjectRulePath`), and prove nothing about the
      // narrower entry.
      withProject(
        (project) => {
          runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/immutable/law.md", "# rewritten\n"),
            { FUSION_ALLOW_RULES_WRITE: "1" },
          );

          expect(read(project.root, "rules/immutable/law.md")).toBe(
            "# untouchable\n",
          );
          expect(readEscalation(project.root)?.haltActive).toBe(true);
        },
        {
          git: true,
          files: {
            "rules/immutable/law.md": "# untouchable\n",
            "fusion-guard.json": projectConfig({
              guard: { protectedPaths: ["rules/immutable/**"] },
            }),
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "reverts the same rule file when the flag is not set",
    () => {
      // The other half of the flag test: without it, nothing changes. Same
      // project, same write, no override.
      withProject(
        (project) => {
          runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/x.md", "# curated\n"),
          );

          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");
          expect(readEscalation(project.root)?.haltActive).toBe(true);
        },
        { git: true },
      );
    },
    CASE_TIMEOUT,
  );
});

/**
 * `260809-1104` (Critical) and `260809-1231`, the two halves of one question.
 *
 * The measured defect: replacing a glob-protected file with a symbolic link did
 * three things at once, and the guard reported the first as a success while
 * seeing neither of the others. It wrote the protected file's previous bytes
 * THROUGH the link into an arbitrary file; it left the protected path a
 * symlink while saying it had been restored; and from the next tool call
 * onward the path was gone from the watched set entirely, so its content could
 * be rewritten with nothing measured. `260809-1231` is the same primitive one
 * component further up — a symlinked PARENT directory, which `O_NOFOLLOW` on
 * the final component reaches by definition not at all.
 *
 * ## Anti-vacuity
 *
 * Every case below asserts that the victim — the file or directory the link
 * points at — is UNCHANGED. At `451a07e` each victim carries the protected
 * file's bytes after the call, so none of these can pass by accident, and none
 * of them passes at all.
 */
describe("a symbolic link does not carry a protected path out of the set", () => {
  const VICTIM = "IMPORTANT UNRELATED FILE\n";
  const VICTIM_IN_DIR = "IMPORTANT FILE IN AN UNRELATED DIRECTORY\n";

  it(
    "restores a glob-protected file replaced by a link, without writing the target",
    () => {
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => linkOver(project.root, "rules/x.md", "victim/target.txt"),
          );

          // The protected path is a regular file again, carrying what it did.
          expect(isLink(project.root, "rules/x.md")).toBe(false);
          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");

          // And the guard's own remediation did not become the write primitive.
          expect(read(project.root, "victim/target.txt")).toBe(VICTIM);

          expect(readEscalation(project.root)?.haltActive).toBe(true);
          expect(context(post)).toContain("rules/x.md");
          expect(context(post)).toContain("has been restored");
          expect(context(post)).not.toContain("could NOT");
        },
        { files: { "victim/target.txt": VICTIM } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps that path in the watched set on the FOLLOWING tool call",
    () => {
      // The consequence `260809-1104` calls the one that matters most. A
      // protection list that a single `ln -s` removes a path from is not a
      // protection list for that path, and only a second call can show it.
      withProject(
        (project) => {
          runToolCall(project.root, "Bash", { command: "true" }, () =>
            linkOver(project.root, "rules/x.md", "victim/target.txt"),
          );

          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "rules/x.md", "# ATTACKER CONTENT\n"),
          );

          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");
          expect(read(project.root, "victim/target.txt")).toBe(VICTIM);
          expect(context(post)).toContain("rules/x.md");
        },
        { files: { "victim/target.txt": VICTIM } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "does the same for a literal, wildcard-free protected entry",
    () => {
      // `literalPaths` watches these whether or not enumeration finds them, so
      // the path never left the set — but `fingerprint` and `restore` followed
      // the link all the same, which is the half of the defect that survives
      // for literal entries. `settings.json` rather than `fusion-guard.json`
      // deliberately: replacing the configuration file with a link also changes
      // what the PostToolUse loader reads, which would put two mechanisms in
      // one case.
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => linkOver(project.root, "settings.json", "victim/target.txt"),
          );

          expect(isLink(project.root, "settings.json")).toBe(false);
          expect(read(project.root, "settings.json")).toBe('{"seeded":true}\n');
          expect(read(project.root, "victim/target.txt")).toBe(VICTIM);
          expect(readEscalation(project.root)?.haltActive).toBe(true);
          expect(context(post)).toContain("settings.json");

          // And it is still measured on the next call, as it was before.
          const second = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "settings.json", '{"attacker":true}\n'),
          );
          expect(read(project.root, "settings.json")).toBe('{"seeded":true}\n');
          expect(context(second.post)).toContain("settings.json");
        },
        {
          files: {
            "settings.json": '{"seeded":true}\n',
            "victim/target.txt": VICTIM,
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "refuses the restore when the PARENT directory became a link, and says so",
    () => {
      // `260809-1231`. `mkdirSync(…, {recursive: true})` succeeds on an
      // existing symlinked directory and `writeFileSync` then resolves it, so
      // the final-component fix reaches none of this. Refusing is the only
      // outcome that cannot be taken back: the change stays measured and
      // halted, and the model is told it is still on disk.
      withProject(
        (project) => {
          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => linkOver(project.root, "rules/sub", "victim/dir"),
          );

          expect(read(project.root, "victim/dir/deep.md")).toBe(VICTIM_IN_DIR);
          expect(context(post)).toContain("rules/sub/deep.md");
          expect(context(post)).toContain("could NOT be restored");
          expect(context(post)).toContain("still on disk");
          expect(readEscalation(project.root)?.haltActive).toBe(true);
        },
        {
          files: {
            "rules/sub/deep.md": "# deep\n",
            "victim/dir/deep.md": VICTIM_IN_DIR,
          },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "restores a path that WAS a link as a link to its original target",
    () => {
      // The other direction, and the reason the fingerprint carries the link
      // rather than merely rejecting it. A project whose rule file legitimately
      // is a symlink must get its link back — flattening it into a copy would
      // be the same silent loss of the human's arrangement that this guard
      // exists to prevent.
      withProject(
        (project) => {
          const target = resolve(project.root, "shared/target.md");
          symlinkSync(target, resolve(project.root, "rules/linked.md"));

          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => {
              rmSync(resolve(project.root, "rules/linked.md"));
              put(project.root, "rules/linked.md", "# a regular file now\n");
            },
          );

          expect(isLink(project.root, "rules/linked.md")).toBe(true);
          expect(readlinkSync(resolve(project.root, "rules/linked.md"))).toBe(
            target,
          );
          // The target is what it was: the restore neither wrote through the
          // link nor copied the regular file into it.
          expect(read(project.root, "shared/target.md")).toBe(
            "# the link target\n",
          );
          expect(readEscalation(project.root)?.haltActive).toBe(true);
          expect(context(post)).toContain("rules/linked.md");
        },
        { files: { "shared/target.md": "# the link target\n" } },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still does not descend into a symlinked DIRECTORY inside a protected tree",
    () => {
      // Unchanged, and deliberately so. Following a symlinked directory invites
      // a cycle and a walk that never returns, so what lies at the far end is
      // not watched. That is a stated residual rather than the defect above:
      // the defect was that the LINK ITSELF left the set and the restore wrote
      // through it, and both of those are closed while this stays true.
      withProject(
        (project) => {
          symlinkSync(
            resolve(project.root, "outside"),
            resolve(project.root, "rules/linkdir"),
          );

          const { post } = runToolCall(
            project.root,
            "Bash",
            { command: "true" },
            () => put(project.root, "outside/inside.md", "# changed\n"),
          );

          expect(read(project.root, "outside/inside.md")).toBe("# changed\n");
          expect(context(post)).toBe("");
          expect(readEscalation(project.root)?.haltActive ?? false).toBe(false);
        },
        { files: { "outside/inside.md": "# outside the tree\n" } },
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

/**
 * The protected-path measurement when the session's working directory is a
 * SUBDIRECTORY of the project root.
 *
 * ## What was measured here first, before anything was changed
 *
 * Issue `260804-2100` and the reconciliation `260807-1526` both stated the same
 * claim and both labelled it **derived from the source, not measured**: the
 * measurement rooted at `process.cwd()` with no upward walk, while the
 * configuration it uses walks up (`findWorkbenchRoot`). No case in the suite ran
 * the measurement from a subdirectory.
 *
 * Run from `<project>/sub` against the shipped protected list, the two cases
 * below reported this:
 *
 *   1. A real `/bin/sh` rewrote the project root's `rules/x.md`. It STAYED
 *      rewritten. No revert, no halt, no `guard_block` event, and nothing said
 *      to the model. The before-fingerprint held `cwd: <project>/sub` and no
 *      entry for `rules/x.md` at all.
 *   2. From that same working directory, `sub/rules/y.md` — a path the
 *      project's list never named under any spelling — WAS enumerated,
 *      reverted and halted on.
 *
 * So the guard protected a `rules/` that need not exist and left unwatched the
 * one that did. That is the finding; the cases now assert the corrected
 * behaviour, and the pair is kept because a fix to one half that quietly broke
 * the other would still look right.
 *
 * ## The stand-down had to move with the root
 *
 * `isFusionPluginCwd()` reads cwd with no upward walk, so from
 * `<fusion-repo>/fusion-workbench` — where a fusion session ordinarily starts —
 * it answers false. Moving only the measurement root upward would therefore have
 * begun reverting a fusion developer's own edits to `rules/` and `agents/`: a
 * new defect traded for the closed one. The third case measures that instead of
 * assuming it.
 *
 * Every case is a subprocess in a throwaway project for the reason
 * `guard-harness.ts` gives in full.
 */

import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CASE_TIMEOUT,
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

/** The context sentence the tracker handed back to the model, or "". */
function context(post: {
  hookSpecificOutput?: { additionalContext?: string };
}): string {
  return post.hookSpecificOutput?.additionalContext ?? "";
}

/** What `guard.ts` writes for `tracker.ts` to read. */
type Snapshot = { cwd: string; paths: Record<string, string> } | null;

/**
 * The before-fingerprint `guard.ts` wrote, read straight off disk, or null when
 * it wrote none.
 *
 * This is the direct evidence in every case here: `cwd` says where the
 * measurement anchored and the key set says what it was watching at all. An
 * assertion on the project file alone would show only the outcome; this shows
 * the cause, which is what separates "reverted for the right reason" from
 * "reverted".
 *
 * ## It is read DURING the tool call, from inside the effect
 *
 * The before-picture is consumed by the PostToolUse hook and is gone afterwards
 * (`260809-1108`: a picture that survives its own use gets used a second time,
 * against a call that has already ended). So the moment at which this evidence
 * exists is the moment the tool itself runs, which is exactly where `runToolCall`
 * puts the effect. Reading it there is also the sharper placement: a null answer
 * during the call means no before-picture was ever taken, while a null answer
 * after it could equally mean the measurement ran and cleaned up.
 */
function snapshot(root: string): Snapshot {
  const p = resolve(
    root,
    "fusion-workbench",
    ".guard-state",
    "protected-snapshot.json",
  );
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf-8")) as {
    cwd: string;
    paths: Record<string, string>;
  };
}

/** Run a real shell command somewhere inside the project. */
function sh(cwd: string, command: string): void {
  execFileSync("/bin/sh", ["-c", command], { cwd, encoding: "utf-8" });
}

/** Every throwaway project here carries a subdirectory to run the hooks from. */
const SUBDIR_FILES = { "sub/notes.txt": "sub notes\n" };

describe("the measurement anchored from a subdirectory", () => {
  it(
    "reverts a protected path at the PROJECT ROOT and halts",
    () => {
      withProject(
        (project) => {
          const sub = resolve(project.root, "sub");
          let snap: Snapshot = null;

          const { post } = runToolCall(
            sub,
            "Bash",
            { command: "echo '# owned by the shell' > ../rules/x.md" },
            () => {
              snap = snapshot(project.root);
              sh(sub, "echo '# owned by the shell' > ../rules/x.md");
            },
          );

          // The half that was silently unprotected. `rules/x.md` is on the
          // shipped list, it changed during a guarded tool call, and it is put
          // back — from a working directory that is not the root.
          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");
          expect(readEscalation(project.root)?.haltActive).toBe(true);
          expect(context(post)).toContain("rules/x.md");
          expect(context(post)).toContain("HALTED");
          expect(
            readEvents(project.root)
              .filter((e) => e.event === "guard_block")
              .map((e) => e.file),
          ).toContain("rules/x.md");

          // THE CAUSE, read off the guard's own before-fingerprint: it anchored
          // at the project root, not at the working directory, and the path is
          // spelled the way the protected list spells it.
          expect(snap?.cwd).toBe(project.root);
          expect(Object.keys(snap?.paths ?? {})).toContain("rules/x.md");
        },
        { git: true, files: SUBDIR_FILES },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "leaves a path under the SUBDIRECTORY alone — the project's list never named it",
    () => {
      withProject(
        (project) => {
          const sub = resolve(project.root, "sub");
          let snap: Snapshot = null;

          const { post } = runToolCall(
            sub,
            "Bash",
            { command: "echo '# owned by the shell' > rules/y.md" },
            () => {
              snap = snapshot(project.root);
              sh(sub, "echo '# owned by the shell' > rules/y.md");
            },
          );

          // The other half, and it flips the other way. Relative to the project
          // root this file is `sub/rules/y.md`, which `rules/**` does not match,
          // so it is nobody's protected path and stays written.
          expect(read(project.root, "sub/rules/y.md")).toBe(
            "# owned by the shell\n",
          );
          expect(readEscalation(project.root)?.haltActive ?? false).toBe(false);
          expect(context(post)).toBe("");
          expect(
            readEvents(project.root).filter((e) => e.event === "guard_block"),
          ).toEqual([]);

          expect(snap?.cwd).toBe(project.root);
          expect(Object.keys(snap?.paths ?? {})).not.toContain("rules/y.md");
          expect(Object.keys(snap?.paths ?? {})).not.toContain(
            "sub/rules/y.md",
          );
        },
        {
          git: true,
          files: { ...SUBDIR_FILES, "sub/rules/y.md": "# a sub rule\n" },
        },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "STATED COST: the PreToolUse block still allows — only the revert catches it",
    () => {
      // The measurement root moved; the WRITE-TOOL block's coordinate space did
      // not. `normalizeToRelative` still relativizes against `process.cwd()`, so
      // an absolute path at the project root comes back absolute from down here
      // and matches no relative pattern. Deliberately left alone: it is a
      // deny-side change, and the measurement below already covers the file.
      //
      // What it costs is the early warning. From the root the agent gets a clean
      // "denied, do not do this" before the write happens; from a subdirectory
      // the write lands, is reverted, and the guard halts. The protection is the
      // same, the experience is worse, and this case is why that sentence can be
      // written down rather than guessed at.
      withProject(
        (project) => {
          const sub = resolve(project.root, "sub");
          const target = resolve(project.root, "rules/x.md");

          const { pre, post } = runToolCall(
            sub,
            "Edit",
            { file_path: target },
            () => execFileSync("/bin/sh", ["-c", "echo '# edited' > rules/x.md"], {
              cwd: project.root,
              encoding: "utf-8",
            }),
          );

          // Allowed on the way in — the block did not see it.
          expect(pre.decision).toBeUndefined();

          // And caught on the way out all the same.
          expect(read(project.root, "rules/x.md")).toBe("# a rule\n");
          expect(readEscalation(project.root)?.haltActive).toBe(true);
          expect(context(post)).toContain("has been restored");
        },
        { git: true, files: SUBDIR_FILES },
      );
    },
    CASE_TIMEOUT,
  );

  it(
    "still stands down in the plugin's own repo when the session started below its root",
    () => {
      // The trade this change had to avoid. `isFusionPluginCwd()` answers false
      // from `<repo>/sub`, so a stand-down evaluated at cwd would not fire here
      // while the root-anchored measurement happily enumerated `rules/**` — and
      // a fusion developer's own edits would be reverted on the next tool call.
      withPluginProject(
        (project) => {
          const sub = resolve(project.root, "sub");
          let snap: Snapshot = null;

          const { post } = runToolCall(
            sub,
            "Bash",
            { command: "echo '# the developer at work' > ../rules/x.md" },
            () => {
              snap = snapshot(project.root);
              sh(sub, "echo '# the developer at work' > ../rules/x.md");
            },
          );

          // The developer's edit survives, exactly as it does from the root.
          expect(read(project.root, "rules/x.md")).toBe(
            "# the developer at work\n",
          );
          expect(readEscalation(project.root)?.haltActive ?? false).toBe(false);
          expect(context(post)).toBe("");
          expect(
            readEvents(project.root).filter((e) => e.event === "guard_block"),
          ).toEqual([]);

          // And no before-fingerprint was ever taken, which is the stand-down
          // itself rather than a comparison that happened to come out empty.
          // Read while the tool was running, so it cannot be confused with a
          // picture that existed and was consumed by the PostToolUse hook.
          expect(snap).toBeNull();
        },
        { git: true, files: SUBDIR_FILES },
      );
    },
    CASE_TIMEOUT,
  );
});

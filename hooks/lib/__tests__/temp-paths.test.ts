import { describe, it, expect, afterAll } from "vitest";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { systemTempMentions, tempRootLine, tempSentence } from "../temp-paths.js";
import { CASE_TIMEOUT, runSessionStart, runTracker, withProject } from "./helpers/guard-harness.js";

// The observation half of `temp-paths.ts`: job 0d's reading of a `Bash`
// command (tracker.ts) and the session-start temp-root line. Both report and
// neither blocks. Every `HOME` here is a scratch directory, so the real
// `~/.fusion-tmp` is never read or written.

const scratch: string[] = [];
afterAll(() => scratch.forEach((d) => rmSync(d, { recursive: true, force: true })));
function mk(prefix: string): string {
  const d = realpathSync(mkdtempSync(join(tmpdir(), prefix)));
  scratch.push(d);
  return d;
}

const ROOT = "/Users/me/p";
const HOME = "/Users/me";
const ID = "ab12cd34";

describe("systemTempMentions: the lint's boundary, read over a Bash command", () => {
  it("names literal system temp paths and a bare mktemp", () => {
    expect(systemTempMentions("echo hi > /tmp/x", ROOT, HOME)).toEqual(["/tmp/x"]);
    expect(systemTempMentions("cd /private/tmp && ls", ROOT, HOME)).toEqual(["/private/tmp"]);
    expect(systemTempMentions('C="${TMPDIR:-/tmp}/a"', ROOT, HOME)).toEqual(["/tmp"]);
    expect(systemTempMentions("cat /var/folders/ab/T/x", ROOT, HOME)).toEqual(["/var/folders/ab/T/x"]);
    expect(systemTempMentions("F=$(mktemp); G=$(mktemp -d)", ROOT, HOME)).toEqual(["mktemp", "mktemp -d"]);
  });

  it("names nothing for project, fusion-tmp and templated paths", () => {
    for (const cmd of [
      "echo > ~/.fusion-tmp/ab12cd34/x",
      "echo > /Users/me/.fusion-tmp/ab12cd34/x",
      "echo > /Users/me/p/tmp/x",
      "echo > ./tmp/x",
      "echo > tmp/x",
      "ls /tmpfoo",
      'mktemp "$D/x.XXXXXX"',
      'mktemp -p "$D"',
    ]) {
      expect(systemTempMentions(cmd, ROOT, HOME), cmd).toEqual([]);
    }
  });

  it("spares a root and a HOME that themselves lie under /var/folders, in either spelling", () => {
    const root = mk("tp-root-");
    const home = mk("tp-home-");
    const short = root.replace(/^\/private(?=\/var\/)/, "");
    const cmd = `ls ${root}/a ${short}/b ${home}/.fusion-tmp/${ID}/c`;
    expect(systemTempMentions(cmd, root, home)).toEqual([]);
    expect(systemTempMentions(`${cmd} /tmp/z`, root, home)).toEqual(["/tmp/z"]);
  });

  it("the sentence names each mention, the helper and the rule, and says nothing was blocked", () => {
    const s = tempSentence(["/tmp/x", "mktemp"]);
    for (const part of ["`/tmp/x`", "`mktemp`", "bin/fusion-tmp", "## Intermediate files", "Nothing was blocked."]) {
      expect(s).toContain(part);
    }
  });
});

describe("tempRootLine: the session-start line's three branches", () => {
  it("is null when both variables resolve to ~/.fusion-tmp/<id>, and with no id or no HOME", () => {
    const home = mk("tp-line-");
    const dir = join(home, ".fusion-tmp", ID);
    mkdirSync(dir, { recursive: true });
    expect(tempRootLine({ CLAUDE_CODE_TMPDIR: dir, TMPDIR: `${dir}/` }, home, ID)).toBeNull();
    expect(tempRootLine({}, home, undefined)).toBeNull();
    expect(tempRootLine({}, undefined, ID)).toBeNull();
  });

  it("names each variable that is unset or elsewhere, and the launcher first", () => {
    const home = mk("tp-line-");
    const dir = join(home, ".fusion-tmp", ID);
    mkdirSync(dir, { recursive: true });
    const line = tempRootLine({ CLAUDE_CODE_TMPDIR: dir, TMPDIR: "/var/folders/x/T/" }, home, ID)!;
    expect(line.startsWith("fusion: start sessions with `fusion`")).toBe(true);
    expect(line).toContain("TMPDIR is /var/folders/x/T/");
    expect(line).not.toContain("CLAUDE_CODE_TMPDIR is");
    expect(tempRootLine({ TMPDIR: `${dir}/` }, home, ID)).toContain("CLAUDE_CODE_TMPDIR is unset");
  });
});

describe("the hooks carry it: tracker job 0d and the session-start envelope", () => {
  it(
    "the tracker adds the sentence on Bash only, and stays silent on a clean command",
    () => {
      withProject((project) => {
        const env = { HOME: mk("tp-home-") };
        const hit = runTracker(project.root, "Bash", { command: "echo hi > /tmp/x" }, env);
        expect(hit.hookSpecificOutput?.additionalContext).toContain("`/tmp/x`");
        expect(runTracker(project.root, "Bash", { command: `ls ${project.root}/a` }, env)).toEqual({});
        expect(runTracker(project.root, "Read", { file_path: "/tmp/x" }, env)).toEqual({});
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "session-start adds the line with a checkout id and an unset CLAUDE_CODE_TMPDIR, and not without an id",
    () => {
      // TMPDIR stays as it is: the spawned hook's tsx binds a socket under it,
      // and a scratch `~/.fusion-tmp/<id>` is past the AF_UNIX length limit.
      withProject((project) => {
        const idFile = join(project.root, "fusion-workbench", ".checkout-id");
        writeFileSync(idFile, `${ID}\n`);
        const saved = { HOME: process.env.HOME, CC: process.env.CLAUDE_CODE_TMPDIR };
        const message = () => runSessionStart(project.root).hookSpecificOutput?.systemMessage ?? "";
        try {
          process.env.HOME = mk("tp-home-");
          delete process.env.CLAUDE_CODE_TMPDIR;
          expect(message()).toContain("CLAUDE_CODE_TMPDIR is unset");
          rmSync(idFile);
          expect(message()).not.toContain("start sessions with `fusion`");
        } finally {
          process.env.HOME = saved.HOME;
          if (saved.CC === undefined) delete process.env.CLAUDE_CODE_TMPDIR;
          else process.env.CLAUDE_CODE_TMPDIR = saved.CC;
        }
      });
    },
    CASE_TIMEOUT,
  );
});

import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

// ---------------------------------------------------------------------------
// The voice-profile emission — which language variant of each stylometric
// profile family `bin/fusion-rules` hands an agent at Setup.
//
// WHY THIS FILE EXISTS. `CLAUDE.md` used to carry one language declaration, and
// `bin/fusion-rules` fed it to both profile families. The boundary the project
// actually draws (see `rules/fusion-workbench-conventions.md` `## Project
// language`) runs elsewhere: output the user reads in the terminal is the chat
// language, output that persists as a file is the artifact language. Two
// declarations name those two languages — `**Language:**` and `**Artifact
// language:**` — and each profile family resolves from the surface it governs.
// Nothing executable asserted the old single-line behaviour before this file,
// so the split had no regression lock to stay green against.
//
// THE ORDER THIS FILE WAS BUILT IN IS LOAD-BEARING. The backwards-compatibility
// case below was written and run GREEN against the unmodified script, before a
// line of the split landed. A lock written afterwards describes the behaviour it
// finds; only one written before can catch the behaviour changing. That case is
// the executable form of the promise "a project that declares only the first
// line sees byte-identical emission".
//
// WHAT IT DRIVES. The real `bin/fusion-rules` through `child_process`, in a temp
// project directory — the seam `fusion-paths.test.ts` and
// `rules-emission-golden.test.ts` already established for bash helpers, and the
// same seam an agent's Setup reads. There is no importable module; the script's
// stdout is the whole public interface.
//
// TWO ENVIRONMENT DISCIPLINES, both borrowed from the golden suite and both
// asserted rather than assumed:
//
//   1. `FUSION_PLUGIN_ROOT` is forced to THIS repository for every call
//      (`rules-emission-golden.test.ts:52-56`). A developer almost always has it
//      pointing at their installed copy (`~/.fusion`), and a test that inherited
//      it would measure whatever was last installed rather than the source tree.
//
//   2. Every temp project directory is asserted to carry no
//      `.claude-plugin/plugin.json` (`rules-emission-golden.test.ts:625-645`).
//      That manifest at cwd is what `bin/fusion-plugin-cwd` reads to decide the
//      work-tree rules preference, so a temp cwd that accidentally carried one
//      would silently measure the plugin-repo branch instead of the
//      consuming-project one.
//
// THE EMITTED PROFILE PATHS ARE RELATIVE (`./fusion-workbench/stilwerk/...`),
// unlike the absolute rule paths that come from `$FUSION_PLUGIN_ROOT/rules`.
// `emit_voice_profile` builds them from a relative `stilwerk_dir`, so a leading
// `./` is exactly the discriminator these tests use to pick the profile lines
// out of the emission without filtering by name — a filter by name would drop an
// unexpected variant silently, which is how a measurement stops measuring.
//
// UNTESTABLE BY CONSTRUCTION, and stated here rather than left to be discovered:
// the language of the prose an agent actually writes. These tests prove which
// profile path is emitted; they cannot prove an agent obeyed it. That is the
// same honest limit `rules/critical-stance.md` §4 records for the plan-head
// line, and the enforcement is the same — a human reading the artifact.
//
// NO SOURCE-SHAPE ASSERTION. Nothing here greps `bin/fusion-rules` for two
// labels. The contract is the emission, and the two opposite-direction cases
// pin it; a test that reads the source fails for edits that break nothing.
// ---------------------------------------------------------------------------

const here = dirname(fileURLToPath(import.meta.url));
const pluginRoot = resolve(here, "../../..");
const fusionRules = join(pluginRoot, "bin", "fusion-rules");

/** All four profile files a fully-provisioned workbench carries. */
const ALL_PROFILES = [
  "chat-voice-en.yaml",
  "chat-voice-de.yaml",
  "default-voice-en.yaml",
  "default-voice-de.yaml",
];

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()!;
    rmSync(dir, { recursive: true, force: true });
  }
});

/**
 * A temp project directory: an optional `CLAUDE.md` plus a
 * `fusion-workbench/stilwerk/` holding the named profile files. No `./rules`,
 * no `.claude/rules`, no manifest — so everything the script emits is either a
 * plugin rule path (absolute) or a profile path (relative).
 */
function makeProject(opts: { claudeMd?: string; profiles?: string[] }): string {
  const dir = mkdtempSync(join(tmpdir(), "fusion-voice-profile-"));
  tempDirs.push(dir);

  // Discipline 2: the work-tree preference must be provably off for this cwd.
  expect(
    existsSync(join(dir, ".claude-plugin", "plugin.json")),
    "The temp project carries a plugin manifest, so bin/fusion-plugin-cwd would " +
      "report the plugin's own repo and the emission below would measure the " +
      "work-tree branch rather than the consuming-project one.",
  ).toBe(false);

  if (opts.claudeMd !== undefined) {
    writeFileSync(join(dir, "CLAUDE.md"), opts.claudeMd, "utf-8");
  }

  const stilwerk = join(dir, "fusion-workbench", "stilwerk");
  mkdirSync(stilwerk, { recursive: true });
  for (const name of opts.profiles ?? ALL_PROFILES) {
    writeFileSync(join(stilwerk, name), `# stub profile: ${name}\n`, "utf-8");
  }
  return dir;
}

/** Raw non-empty stdout lines of `bin/fusion-rules <agent>`, run in `cwd`. */
function runRules(agent: string, cwd: string): string[] {
  const stdout = execFileSync(fusionRules, [agent], {
    cwd,
    encoding: "utf-8",
    // Discipline 1: never inherit the developer's installed copy.
    env: { ...process.env, FUSION_PLUGIN_ROOT: pluginRoot },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return stdout
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * The profile paths the script emitted, in emission order. Relative paths are
 * the profiles by construction (see the header); taking every relative line
 * rather than every line matching a profile name is what makes an unexpected
 * emission fail loudly instead of disappearing.
 */
function profilePaths(agent: string, cwd: string): string[] {
  return runRules(agent, cwd).filter((l) => l.startsWith("./"));
}

const CHAT_DE = "./fusion-workbench/stilwerk/chat-voice-de.yaml";
const CHAT_EN = "./fusion-workbench/stilwerk/chat-voice-en.yaml";
const WRITE_DE = "./fusion-workbench/stilwerk/default-voice-de.yaml";
const WRITE_EN = "./fusion-workbench/stilwerk/default-voice-en.yaml";

describe("bin/fusion-rules voice-profile emission", () => {
  // -------------------------------------------------------------------------
  // The regression lock. Written and run green BEFORE the split landed.
  // -------------------------------------------------------------------------
  describe("a project declaring only **Language:**", () => {
    it("gives a prose agent both families in the declared language", () => {
      const dir = makeProject({ claudeMd: "**Language:** de\n" });
      expect(profilePaths("planner", dir)).toEqual([CHAT_DE, WRITE_DE]);
    });

    it("gives a non-prose agent the chat family only", () => {
      const dir = makeProject({ claudeMd: "**Language:** de\n" });
      expect(profilePaths("coder", dir)).toEqual([CHAT_DE]);
    });
  });

  // -------------------------------------------------------------------------
  // The split. These two cases route the families in OPPOSITE directions, so
  // any edit that merges the two codes back into one turns both red. That is
  // the whole enforcement: no source-shape assertion is needed, and none is
  // added.
  // -------------------------------------------------------------------------
  describe("a project declaring both languages", () => {
    it("routes chat to **Language:** and writing to **Artifact language:**", () => {
      const dir = makeProject({
        claudeMd: "**Language:** de\n**Artifact language:** en\n",
      });
      expect(profilePaths("planner", dir)).toEqual([CHAT_DE, WRITE_EN]);
    });

    it("routes them the other way round just as readily", () => {
      // The reverse direction is what rules out a hard-coded "artifacts are
      // always English". A collapse to one code passes the case above and
      // fails here.
      const dir = makeProject({
        claudeMd: "**Language:** en\n**Artifact language:** de\n",
      });
      expect(profilePaths("planner", dir)).toEqual([CHAT_EN, WRITE_DE]);
    });

    it("keeps the artifact declaration out of a non-prose agent's chat profile", () => {
      // A non-prose agent gets one path, and it is the CHAT language's. If the
      // artifact declaration leaked into the chat family this would be
      // chat-voice-en.yaml.
      const dir = makeProject({
        claudeMd: "**Language:** de\n**Artifact language:** en\n",
      });
      expect(profilePaths("coder", dir)).toEqual([CHAT_DE]);
    });
  });

  describe("a project declaring nothing", () => {
    it("resolves both families to en when there is no CLAUDE.md at all", () => {
      const dir = makeProject({});
      expect(existsSync(join(dir, "CLAUDE.md"))).toBe(false);
      expect(profilePaths("planner", dir)).toEqual([CHAT_EN, WRITE_EN]);
    });
  });

  // -------------------------------------------------------------------------
  // The missing-variant fallback is per family, not shared: a family whose
  // resolved variant is absent falls back to its own `-en` file and leaves the
  // other family's resolution alone. Asserted in both directions, because a
  // fallback wired once for both families would pass one of them.
  // -------------------------------------------------------------------------
  describe("a workbench missing one profile variant", () => {
    it("falls the writing family back to en while chat keeps its de variant", () => {
      const dir = makeProject({
        claudeMd: "**Language:** de\n**Artifact language:** de\n",
        profiles: ALL_PROFILES.filter((p) => p !== "default-voice-de.yaml"),
      });
      expect(profilePaths("planner", dir)).toEqual([CHAT_DE, WRITE_EN]);
    });

    it("falls the chat family back to en while writing keeps its de variant", () => {
      const dir = makeProject({
        claudeMd: "**Language:** de\n**Artifact language:** de\n",
        profiles: ALL_PROFILES.filter((p) => p !== "chat-voice-de.yaml"),
      });
      expect(profilePaths("planner", dir)).toEqual([CHAT_EN, WRITE_DE]);
    });
  });

  // -------------------------------------------------------------------------
  // Absent, unparseable and unsupported all land in one branch — "not
  // declared" — so the chat language governs. Not `en`: falling to `en` here
  // would be a second, hidden rule.
  // -------------------------------------------------------------------------
  describe("an artifact declaration that is not a supported code", () => {
    it("treats an unsupported two-letter code as not declared", () => {
      const dir = makeProject({
        claudeMd: "**Language:** de\n**Artifact language:** xx\n",
      });
      expect(profilePaths("planner", dir)).toEqual([CHAT_DE, WRITE_DE]);
    });

    it("treats a spelled-out language name as not declared", () => {
      // `English` never even reaches the value test: the pattern is
      // case-sensitive and wants exactly two lowercase letters.
      const dir = makeProject({
        claudeMd: "**Language:** de\n**Artifact language:** English\n",
      });
      expect(profilePaths("planner", dir)).toEqual([CHAT_DE, WRITE_DE]);
    });
  });

  describe("a project declaring only **Artifact language:**", () => {
    it("leaves the chat family on its own en default", () => {
      // The value here is `de`, not `en`, on purpose: with `en` both families
      // would resolve to `en` whether or not the second line wrongly satisfied
      // the first line's pattern, so the case would assert nothing. With `de`,
      // a leak shows up immediately as chat-voice-de.yaml.
      const dir = makeProject({ claudeMd: "**Artifact language:** de\n" });
      expect(profilePaths("planner", dir)).toEqual([CHAT_EN, WRITE_DE]);
    });

    it("resolves both families to en when that lone declaration is en", () => {
      const dir = makeProject({ claudeMd: "**Artifact language:** en\n" });
      expect(profilePaths("planner", dir)).toEqual([CHAT_EN, WRITE_EN]);
    });
  });
});

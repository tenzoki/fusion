import { describe, it, expect } from "vitest";
import type { FsLocator } from "../rules-write-exemption.js";
import {
  RULES_WRITE_ENV,
  RULE_DIR_PATTERNS,
  RULE_DIR_ROOTS,
  isProjectRulePath,
  rulesWriteExemptionActive,
  rulesWriteDetail,
} from "../rules-write-exemption.js";

/**
 * The exemption boundary is a security boundary, so these are matrices rather
 * than examples. A path missing from the never-exempt table is a hole nobody
 * sees, which is why every protected entry is named individually here instead of
 * being sampled.
 *
 * Every case is in-process and passes both its environment and its filesystem
 * explicitly. Nothing here reads `process.env` or touches a real disk — the
 * filesystem cases below are the whole reason `FsLocator` is a parameter, since
 * "what does a symlink planted in `rules/` do to the grant" is otherwise a
 * question only a subprocess against a real temporary tree can ask.
 */

const NO_ENV: NodeJS.ProcessEnv = {};
const FLAG_SET: NodeJS.ProcessEnv = { [RULES_WRITE_ENV]: "1" };

const ROOT = "/proj";

interface FakeFsOptions {
  /**
   * Symlinks, as project-relative name → the absolute location it resolves to.
   * Resolution is top-down, outermost link first, the way `realpath` walks.
   */
  links?: Record<string, string>;
  /** Project-relative paths that are existing regular files with nlink > 1. */
  hardLinks?: string[];
}

/**
 * An `FsLocator` over a described project rather than a real one.
 *
 * A path with no link on it resolves lexically under `ROOT`, which models both
 * an ordinary existing file and a file about to be created — the real adapter
 * cannot tell those apart either, and must not, or no new rule could be written.
 */
function fakeFs(opts: FakeFsOptions = {}): FsLocator {
  const links = opts.links ?? {};
  const hardLinks = new Set(opts.hardLinks ?? []);

  return {
    locate(path: string): string | null {
      if (path.startsWith("/")) return path;
      const parts = path.split("/");
      for (let n = 1; n <= parts.length; n++) {
        const target = links[parts.slice(0, n).join("/")];
        if (target === undefined) continue;
        const rest = parts.slice(n);
        return rest.length === 0 ? target : `${target}/${rest.join("/")}`;
      }
      return `${ROOT}/${path}`;
    },
    hasHardLinks(path: string): boolean {
      return hardLinks.has(path);
    },
  };
}

/** A project with plain rule directories, no links and no aliased files. */
const PLAIN = fakeFs();

/** The predicate against that plain project — the default for the text cases. */
const isRulePath = (path: string): boolean => isProjectRulePath(path, PLAIN);

describe("RULES_WRITE_ENV and RULE_DIR_PATTERNS", () => {
  it("names the environment variable the guard documents", () => {
    expect(RULES_WRITE_ENV).toBe("FUSION_ALLOW_RULES_WRITE");
  });

  it("exempts exactly the two rule roots", () => {
    expect([...RULE_DIR_PATTERNS]).toEqual(["rules/**", ".claude/rules/**"]);
  });
});

describe("isProjectRulePath — the exempt set", () => {
  const exempt = [
    ["a file directly under the rule root", "rules/x.md"],
    ["a rule with a long name", "rules/protected-path-discipline.md"],
    ["a file under retired/, the retirement destination", "rules/retired/x.md"],
    ["a nested rule directory", "rules/a/b/c.md"],
    ["the retired/ subdirectory itself", "rules/retired"],
    ["a file under the project's .claude rule root", ".claude/rules/local.md"],
    ["a retired file under .claude/rules", ".claude/rules/retired/local.md"],
  ] as const;

  for (const [what, path] of exempt) {
    it(`exempts ${what}: ${path}`, () => {
      expect(isRulePath(path)).toBe(true);
    });
  }
});

describe("isProjectRulePath — the never-exempt set", () => {
  /**
   * Every entry on `guard.protectedPaths` that is NOT a rule directory, named
   * one by one. `fusion-guard.json` is here although it is not on that list at
   * HEAD: it is the project guard configuration this Circle adds, it carries its
   * own self-protection floor, and the flag must never open a route to it.
   */
  const neverExempt = [
    ["an agent prompt", "agents/coder.md"],
    ["the orchestrator prompt", "agents/orchestrator.md"],
    ["a skill body", "skills/demo/SKILL.md"],
    ["the setup skill", "skills/setup/SKILL.md"],
    ["the guard configuration", "hooks/config.json"],
    ["the hook wiring", "hooks/hooks.json"],
    ["the plugin permission settings", "settings.json"],
    ["the monitor binary", "bin/monitor"],
    ["the plugin manifest", ".claude-plugin/plugin.json"],
    ["the guard's own state directory", "fusion-workbench/.guard-state/escalation.json"],
    ["the guard's event log", "fusion-workbench/.guard-state/events.jsonl"],
    ["the project guard configuration", "fusion-guard.json"],
  ] as const;

  for (const [what, path] of neverExempt) {
    it(`never exempts ${what}: ${path}`, () => {
      expect(isRulePath(path)).toBe(false);
    });
  }

  it("never exempts ordinary project files", () => {
    expect(isRulePath("notes.txt")).toBe(false);
    expect(isRulePath("hooks/lib/config.ts")).toBe(false);
    expect(isRulePath("README.md")).toBe(false);
  });

  it("never exempts a sibling whose name merely starts with a rule root", () => {
    expect(isRulePath("rules-draft/x.md")).toBe(false);
    expect(isRulePath("rulesx.md")).toBe(false);
    expect(isRulePath(".claude/rulesets/x.md")).toBe(false);
  });

  it("never exempts a rule path under some other project's tree", () => {
    // An absolute path is what `normalizeToRelative` hands back when the target
    // lies outside the project root. It matches no relative pattern, and must
    // not become exempt either.
    expect(isRulePath("/somewhere/else/rules/x.md")).toBe(false);
    expect(isRulePath("../other-project/rules/x.md")).toBe(false);
  });

  it("never exempts the empty path", () => {
    expect(isRulePath("")).toBe(false);
  });
});

describe("isProjectRulePath — the bare rule directory is outside the exempt set", () => {
  /**
   * The flag permits writing rule files. It does not permit deleting the rule
   * directory, so `rm -rf rules` stays denied through the mutation guard's
   * ancestor pass with the flag set.
   *
   * The trailing-separator spellings are the load-bearing half: `rules/**`
   * compiles to `^rules/.*$`, whose `.*` matches the empty string, so an
   * un-canonicalised `rules/` would match while `rules` did not — and the Bash
   * path's own `node:path.normalize` leaves a trailing separator in place.
   */
  const bareDirs = [
    "rules",
    "rules/",
    "rules//",
    "./rules",
    "./rules/",
    ".claude/rules",
    ".claude/rules/",
    ".claude/rules//",
  ];

  for (const path of bareDirs) {
    it(`does not exempt the bare directory spelled ${JSON.stringify(path)}`, () => {
      expect(isRulePath(path)).toBe(false);
    });
  }
});

describe("isProjectRulePath — canonicalisation closes the escape spellings", () => {
  it("does not exempt a path that traverses out of the rule directory", () => {
    // Textually matches `rules/**`, which is why it is PROTECTED today — but it
    // writes agents/coder.md, so exempting it would grant a permission the flag
    // does not name.
    expect(isRulePath("rules/../agents/coder.md")).toBe(false);
    expect(isRulePath("rules/a/../../settings.json")).toBe(false);
    expect(isRulePath(".claude/rules/../../hooks/config.json")).toBe(false);
  });

  it("still exempts a rule file reached through a traversal that stays inside", () => {
    expect(isRulePath("rules/a/../x.md")).toBe(true);
    expect(isRulePath("rules/./x.md")).toBe(true);
    expect(isRulePath("rules//x.md")).toBe(true);
  });

  it("does not exempt the project root however it is spelled", () => {
    expect(isRulePath(".")).toBe(false);
    expect(isRulePath("./")).toBe(false);
    expect(isRulePath("/")).toBe(false);
    expect(isRulePath("rules/..")).toBe(false);
  });
});

describe("isProjectRulePath — gate 2 resolves the path against the filesystem", () => {
  /**
   * The escalation this closes, measured before the fix: `ln -s ../ rules/up`
   * is itself a write to a rule path, so gate 1 exempts it; afterwards every
   * path spelled `rules/up/…` still matches `rules/**` while the write lands
   * anywhere in the project. Two commands, and the flag became write-anywhere.
   *
   * The distinction that makes this a grant problem and not the guard's general
   * symlink residual: elsewhere a symlink lets a write ESCAPE protection, which
   * a text classifier cannot help. Here it let a write ACQUIRE a permission.
   */
  const planted = fakeFs({ links: { "rules/up": ROOT } });

  const reachable = [
    ["an agent prompt", "rules/up/agents/coder.md"],
    ["the guard configuration", "rules/up/hooks/config.json"],
    ["the hook wiring", "rules/up/hooks/hooks.json"],
    ["the plugin manifest", "rules/up/.claude-plugin/plugin.json"],
    ["the permission settings", "rules/up/settings.json"],
    ["the monitor binary", "rules/up/bin/monitor"],
    ["a skill body", "rules/up/skills/demo/SKILL.md"],
    ["the halt record itself", "rules/up/fusion-workbench/.guard-state/escalation.json"],
  ] as const;

  for (const [what, path] of reachable) {
    it(`refuses the grant for ${what} reached through a planted symlink`, () => {
      // Gate 1 passes: the text is inside `rules/**`. Gate 2 is what says no.
      expect(isRulePath(path)).toBe(true);
      expect(isProjectRulePath(path, planted)).toBe(false);
    });
  }

  it("refuses the grant for the symlink's own name once it points outside", () => {
    expect(isProjectRulePath("rules/up", planted)).toBe(false);
  });

  it("still grants a genuine rule file in the same project", () => {
    expect(isProjectRulePath("rules/x.md", planted)).toBe(true);
    expect(isProjectRulePath("rules/retired/x.md", planted)).toBe(true);
  });

  it("still grants a path that traverses back INTO the rule directory", () => {
    // Not an escape: it resolves to a rule file, so it is one.
    expect(isProjectRulePath("rules/up/rules/x.md", planted)).toBe(true);
  });

  it("refuses a symlink that leaves the project entirely", () => {
    const escaping = fakeFs({ links: { "rules/out": "/etc" } });
    expect(isProjectRulePath("rules/out/passwd", escaping)).toBe(false);
  });

  it("grants a rule directory that is ITSELF a symlink to a shared tree", () => {
    // A real setup, and the reason gate 2 compares against the RESOLVED rule
    // directory rather than requiring the target to stay under the project.
    const shared = fakeFs({ links: { rules: "/shared/team-rules" } });
    expect(isProjectRulePath("rules/x.md", shared)).toBe(true);
    expect(isProjectRulePath("rules/retired/x.md", shared)).toBe(true);
  });

  it("refuses the grant when nothing about the path can be resolved", () => {
    const blind: FsLocator = { locate: () => null, hasHardLinks: () => false };
    expect(isProjectRulePath("rules/x.md", blind)).toBe(false);
  });

  it("derives the rule roots from the patterns, so the two cannot drift", () => {
    expect([...RULE_DIR_ROOTS]).toEqual(["rules", ".claude/rules"]);
  });
});

describe("isProjectRulePath — gate 2 refuses a hard link", () => {
  /**
   * The case `realpath` cannot see. `cp -l hooks/config.json rules/copy` gives
   * a protected inode a second name inside the rule directory; both names
   * resolve to themselves, so resolution says "inside `rules/`" and is right —
   * the path really is a rule path, it just is not ONLY a rule path.
   *
   * A grant read off a path is sound only while the path names one file, so an
   * existing regular file with more than one link does not get one.
   */
  const aliased = fakeFs({ hardLinks: ["rules/copy"] });

  it("refuses a rule path that is a hard link", () => {
    expect(isRulePath("rules/copy")).toBe(true);
    expect(isProjectRulePath("rules/copy", aliased)).toBe(false);
  });

  it("still grants its unaliased neighbours", () => {
    expect(isProjectRulePath("rules/x.md", aliased)).toBe(true);
  });

  it("asks about the CANONICAL spelling, not the raw one", () => {
    // Or `rules/a/../copy` would slip past the check that `rules/copy` fails.
    expect(isProjectRulePath("rules/a/../copy", aliased)).toBe(false);
    expect(isProjectRulePath("rules/./copy", aliased)).toBe(false);
  });
});

describe("rulesWriteExemptionActive — the accepted flag spellings", () => {
  /**
   * Exactly what the two git overrides accept, because they share
   * `isEnvFlagSet`: "1" and "true", case-insensitive, surrounding whitespace
   * tolerated. Everything else, including the plausible-looking "yes" and "on",
   * leaves the exemption off.
   */
  const accepted = ["1", "true", "TRUE", "True", " 1 ", " true "];
  const rejected = ["0", "yes", "on", "no", "false", "", " ", "2", "1.0", "truthy"];

  for (const value of accepted) {
    it(`is active for ${JSON.stringify(value)}`, () => {
      expect(rulesWriteExemptionActive({ [RULES_WRITE_ENV]: value })).toBe(true);
    });
  }

  for (const value of rejected) {
    it(`is inactive for ${JSON.stringify(value)}`, () => {
      expect(rulesWriteExemptionActive({ [RULES_WRITE_ENV]: value })).toBe(false);
    });
  }

  it("is inactive when the variable is undefined", () => {
    expect(rulesWriteExemptionActive({ [RULES_WRITE_ENV]: undefined })).toBe(false);
  });

  it("is inactive when the variable is absent from the environment", () => {
    expect(rulesWriteExemptionActive(NO_ENV)).toBe(false);
  });

  it("ignores a similarly named variable", () => {
    expect(
      rulesWriteExemptionActive({
        FUSION_ALLOW_BRANCH_SWITCH: "1",
        FUSION_ALLOW_WORKTREE: "1",
        FUSION_ALLOW_RULES: "1",
      }),
    ).toBe(false);
  });

  it("reads the environment it is handed, so two answers coexist in one process", () => {
    // The module never touches process.env. Two calls in the same process with
    // different environments must therefore disagree, whatever the developer
    // happens to have exported in their own shell.
    expect(rulesWriteExemptionActive(FLAG_SET)).toBe(true);
    expect(rulesWriteExemptionActive(NO_ENV)).toBe(false);
  });
});

describe("rulesWriteDetail — the advisory message", () => {
  it("names the variable and the single path it let through", () => {
    const detail = rulesWriteDetail(["rules/x.md"]);
    expect(detail).toContain(RULES_WRITE_ENV);
    expect(detail).toContain("rules/x.md");
    expect(detail).toContain("rule path");
  });

  it("names every path when several were exempted", () => {
    const detail = rulesWriteDetail(["rules/x.md", "rules/retired/x.md"]);
    expect(detail).toContain("rules/x.md");
    expect(detail).toContain("rules/retired/x.md");
    expect(detail).toContain("rule paths");
  });

  it("says so rather than reading as though nothing happened", () => {
    expect(rulesWriteDetail([])).toContain(RULES_WRITE_ENV);
    expect(rulesWriteDetail([])).toContain("(none recorded)");
  });

  it("is a single line, so one event carries one detail", () => {
    expect(rulesWriteDetail(["rules/x.md", "rules/y.md"])).not.toContain("\n");
  });
});

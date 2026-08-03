import { describe, it, expect } from "vitest";
import type { FsLocator, RulesWriteRefusal } from "../rules-write-exemption.js";
import {
  REFUSAL_NOTES,
  RULES_WRITE_ENV,
  RULE_DIR_PATTERNS,
  RULE_DIR_ROOTS,
  isProjectRulePath,
  rulesWriteExemptionActive,
  rulesWriteDetail,
  rulesWriteRefusal,
  rulesWriteRefusalNote,
  spellingWalksUp,
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

/**
 * The predicate against that plain project — the default for the text cases.
 *
 * The spelling is the path itself, which is the honest reading for a caller
 * that has only one: gate 0 sees exactly what gate 1 will canonicalise. The
 * cases where the two must DIFFER — the shape of both real surfaces, which
 * collapse before they can match anything — call `isProjectRulePath` directly
 * with both spellings.
 */
const isRulePath = (path: string): boolean =>
  isProjectRulePath(path, PLAIN, path);

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

describe("isProjectRulePath — the reach the docstring claims, pinned", () => {
  /**
   * Finding 2 (`260802-2231`): the module used to say the flag "does not permit
   * deleting the rule directory", which reads as a statement about destructive
   * reach and is not one. Everything INSIDE a rule directory is exempt, whole
   * subtrees included — measured on the real guard subprocess, with
   * `rm -rf rules/retired` and `mv rules/retired /tmp/gone` both going through
   * and taking the retirement archive the flag exists to populate.
   *
   * The reach is inside the flag's purpose and is not being narrowed here. It
   * is pinned so the docstring is falsifiable: if a later change contracts the
   * exempt set, this block fails and the prose gets corrected with it.
   *
   * Glob metacharacters appear as LITERAL TEXT because the Bash classifier
   * never expands them (`rm -rf rules/*` reaches the predicate spelled exactly
   * that way), and the literal `rules/*` matches `^rules/.*$`.
   */
  const wholeSubtrees = [
    ["every entry under the rule root", "rules/*"],
    ["the same, globstarred", "rules/**"],
    ["the retirement archive itself", "rules/retired"],
    ["everything in the retirement archive", "rules/retired/*"],
    ["a nested rule directory", "rules/a/b"],
  ] as const;

  for (const [what, path] of wholeSubtrees) {
    it(`exempts ${what}: ${path}`, () => {
      expect(isRulePath(path)).toBe(true);
    });
  }

  it("refuses the `..` spelling of a subtree that is otherwise in reach", () => {
    // Gate 0 narrows the exempt set by a SPELLING, not by a reach:
    // `rm -rf rules/a/../retired` denies while `rm -rf rules/retired` allows.
    expect(isRulePath("rules/a/../retired")).toBe(false);
    expect(isRulePath("rules/retired")).toBe(true);
  });
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

  it("no longer exempts a traversal that would have stayed inside", () => {
    // This case USED to assert `true`, and the change is the fix. `rules/a/..`
    // stays inside the rule directory only if `rules/a` is a directory; if it
    // is a symlink the kernel goes to the parent of its TARGET, and the
    // collapse that made this look safe is the same collapse that deleted the
    // link from the string. Gate 0 refuses the whole spelling class rather than
    // trying to tell the two apart. `.` and `//` are untouched: they name no
    // component, so lexical and kernel resolution cannot disagree about them.
    expect(isRulePath("rules/a/../x.md")).toBe(false);
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

describe("spellingWalksUp — gate 0, the rule on its own", () => {
  /**
   * Textual and total: any `..` SEGMENT, anywhere, in any position. The cases
   * that must NOT trip it are the ones a filename can legitimately contain — a
   * name that merely starts with two dots is not a traversal, and neither is a
   * single `.`.
   */
  const walksUp = [
    "rules/../agents/coder.md",
    "rules/a/../x.md",
    "rules/up/../agents/coder.md",
    "..",
    "../rules/x.md",
    "rules/..",
    "/proj/rules/link/../agents/coder.md",
    "rules/a/b/../../../settings.json",
    "rules/x.md/..",
  ];
  const doesNot = [
    "rules/x.md",
    "rules/./x.md",
    "rules//x.md",
    "rules/..hidden.md",
    "rules/...md",
    "rules/a..b/x.md",
    "rules/retired/",
    "",
  ];

  for (const path of walksUp) {
    it(`refuses ${JSON.stringify(path)}`, () => {
      expect(spellingWalksUp(path)).toBe(true);
    });
  }
  for (const path of doesNot) {
    it(`leaves ${JSON.stringify(path)} alone`, () => {
      expect(spellingWalksUp(path)).toBe(false);
    });
  }
});

describe("isProjectRulePath — gate 0 reads the SPELLING, not the collapsed path", () => {
  /**
   * The shape of both real surfaces, and the whole reason the spelling is a
   * separate argument. `guard.ts` collapses before it can match anything
   * against `rules/**`, and the Bash classifier normalises its operands for the
   * same reason — so by the time either can ask this predicate, the `..` is
   * already gone from the path it holds.
   *
   * Measured before the fix, with `FUSION_ALLOW_RULES_WRITE=1` and a symlink
   * `rules/up -> ../` planted by an allowed `mv`: `Edit rules/up/../agents/
   * coder.md` collapsed to `rules/agents/coder.md`, which resolves inside the
   * real rule directory, granted, and wrote `agents/coder.md`. Every entry on
   * the protected list was reachable that way, on both surfaces.
   */
  const collapsed = "rules/agents/coder.md";
  const spelled = "rules/up/../agents/coder.md";

  it("grants the collapsed path when that IS what the caller was given", () => {
    // The control. `rules/agents/coder.md` really is a rule path, and refusing
    // it would mean the fix worked by refusing everything.
    expect(isProjectRulePath(collapsed, PLAIN, collapsed)).toBe(true);
  });

  it("refuses the same collapsed path once the spelling is handed over", () => {
    expect(isProjectRulePath(collapsed, PLAIN, spelled)).toBe(false);
  });

  it("refuses it against a filesystem where the link genuinely exists", () => {
    // Gate 2 cannot help here and that is the point: it is asked about
    // `rules/agents/coder.md`, a path with no link in it, and answers
    // truthfully that it lands inside `rules/`.
    const planted = fakeFs({ links: { "rules/up": ROOT } });
    expect(isProjectRulePath(collapsed, planted, collapsed)).toBe(true);
    expect(isProjectRulePath(collapsed, planted, spelled)).toBe(false);
  });

  it("refuses every protected target reachable through the planted link", () => {
    for (const target of [
      "hooks/config.json",
      "hooks/hooks.json",
      "settings.json",
      ".claude-plugin/plugin.json",
      "bin/monitor",
      "skills/demo/SKILL.md",
      "fusion-workbench/.guard-state/escalation.json",
    ]) {
      expect(
        isProjectRulePath(`rules/${target}`, PLAIN, `rules/up/../${target}`),
        target,
      ).toBe(false);
    }
  });

  it("still refuses when the caller passes the spelling for both", () => {
    // A caller with one spelling loses nothing: gate 0 sees the `..` directly.
    expect(isProjectRulePath(spelled, PLAIN, spelled)).toBe(false);
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
      expect(isProjectRulePath(path, planted, path)).toBe(false);
    });
  }

  it("refuses the grant for the symlink's own name once it points outside", () => {
    expect(isProjectRulePath("rules/up", planted, "rules/up")).toBe(false);
  });

  it("still grants a genuine rule file in the same project", () => {
    expect(isProjectRulePath("rules/x.md", planted, "rules/x.md")).toBe(true);
    expect(isProjectRulePath("rules/retired/x.md", planted, "rules/retired/x.md")).toBe(true);
  });

  it("still grants a path that traverses back INTO the rule directory", () => {
    // Not an escape: it resolves to a rule file, so it is one.
    expect(isProjectRulePath("rules/up/rules/x.md", planted, "rules/up/rules/x.md")).toBe(true);
  });

  it("refuses a symlink that leaves the project entirely", () => {
    const escaping = fakeFs({ links: { "rules/out": "/etc" } });
    expect(isProjectRulePath("rules/out/passwd", escaping, "rules/out/passwd")).toBe(false);
  });

  it("grants a rule directory that is ITSELF a symlink to a shared tree", () => {
    // A real setup, and the reason gate 2 compares against the RESOLVED rule
    // directory rather than requiring the target to stay under the project.
    const shared = fakeFs({ links: { rules: "/shared/team-rules" } });
    expect(isProjectRulePath("rules/x.md", shared, "rules/x.md")).toBe(true);
    expect(isProjectRulePath("rules/retired/x.md", shared, "rules/retired/x.md")).toBe(true);
  });

  it("refuses the grant when nothing about the path can be resolved", () => {
    const blind: FsLocator = { locate: () => null, hasHardLinks: () => false };
    expect(isProjectRulePath("rules/x.md", blind, "rules/x.md")).toBe(false);
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
    expect(isProjectRulePath("rules/copy", aliased, "rules/copy")).toBe(false);
  });

  it("still grants its unaliased neighbours", () => {
    expect(isProjectRulePath("rules/x.md", aliased, "rules/x.md")).toBe(true);
  });

  it("asks about the CANONICAL spelling, not the raw one", () => {
    // Or `rules/a/../copy` would slip past the check that `rules/copy` fails.
    expect(isProjectRulePath("rules/a/../copy", aliased, "rules/a/../copy")).toBe(false);
    expect(isProjectRulePath("rules/./copy", aliased, "rules/./copy")).toBe(false);
  });
});

describe("rulesWriteRefusal — WHICH gate refused, not just that one did", () => {
  /**
   * Finding 4 (`260802-2332`) and its sibling (`260803-1252`): with the flag
   * set, a hard-linked rule file and a `..` spelling both produced a deny
   * byte-identical to the one the same write gets with the flag UNSET — and in
   * the second case the deny named a file the flag DOES let the agent write.
   * Nothing separated "the flag is not set" from "the flag is set and this
   * path is refused for a reason no message names".
   *
   * The verdict is unchanged in every row below; only the report is new.
   */
  const planted = fakeFs({ links: { "rules/up": ROOT } });
  const aliased = fakeFs({ hardLinks: ["rules/copy"] });
  const blind: FsLocator = { locate: () => null, hasHardLinks: () => false };

  const rows: [string, string, string, FsLocator, RulesWriteRefusal | null][] = [
    ["a genuine rule file is not refused at all", "rules/x.md", "rules/x.md", PLAIN, null],
    ["an agent prompt is simply not a rule path", "agents/coder.md", "agents/coder.md", PLAIN, "not-a-rule-path"],
    ["neither is the bare rule directory", "rules/", "rules/", PLAIN, "not-a-rule-path"],
    ["nor the empty path", "", "", PLAIN, "not-a-rule-path"],
    ["a rule path spelled with a `..`", "rules/x.md", "rules/retired/../x.md", PLAIN, "spelled-with-dotdot"],
    ["a rule path that is a hard link", "rules/copy", "rules/copy", aliased, "hard-link"],
    ["a rule path nothing can resolve", "rules/x.md", "rules/x.md", blind, "unresolvable"],
    ["a rule path that resolves out of the rule directory", "rules/up/agents/coder.md", "rules/up/agents/coder.md", planted, "resolves-outside"],
  ];

  for (const [what, path, spelled, fs, expected] of rows) {
    it(`reports ${JSON.stringify(expected)} for ${what}`, () => {
      expect(rulesWriteRefusal(path, fs, spelled)).toBe(expected);
    });
  }

  it("says nothing about the spelling when the path is not a rule path anyway", () => {
    // The ORDER property. Gate 0 is numbered first and asked second, because
    // "the flag does not cover `..` spellings" is true and useless for
    // `x/../agents/coder.md` — and reads as an invitation to try again without
    // the `..`, which would deny too.
    expect(rulesWriteRefusal("agents/coder.md", PLAIN, "x/../agents/coder.md")).toBe(
      "not-a-rule-path",
    );
    expect(rulesWriteRefusalNote("agents/coder.md", PLAIN, "x/../agents/coder.md")).toBeNull();
  });

  it("keeps gate 0 above the FILESYSTEM gate, which is the ordering that matters", () => {
    // A `..` spelling must never be decided by a resolver looking at a path the
    // collapse already emptied of the component that decides where it lands. If
    // gate 0 ever sank below gate 2, this row would report a gate-2 refusal (or
    // worse, none) instead.
    const wouldGrant: FsLocator = {
      locate: (p) => `${ROOT}/${p}`,
      hasHardLinks: () => false,
    };
    expect(rulesWriteRefusal("rules/x.md", wouldGrant, "rules/up/../x.md")).toBe(
      "spelled-with-dotdot",
    );
  });

  it("is the same decision isProjectRulePath reads as a boolean", () => {
    // One boundary, two readings. A second implementation "for the message" is
    // how a message ends up describing a check that no longer exists.
    const subjects: [string, string, FsLocator][] = [
      ["rules/x.md", "rules/x.md", PLAIN],
      ["agents/coder.md", "agents/coder.md", PLAIN],
      ["rules/x.md", "rules/a/../x.md", PLAIN],
      ["rules/copy", "rules/copy", aliased],
      ["rules/up/agents/coder.md", "rules/up/agents/coder.md", planted],
      ["rules/x.md", "rules/x.md", blind],
    ];
    for (const [path, spelled, fs] of subjects) {
      expect(isProjectRulePath(path, fs, spelled), `${path} as ${spelled}`).toBe(
        rulesWriteRefusal(path, fs, spelled) === null,
      );
    }
  });
});

describe("rulesWriteRefusalNote — what the refused agent actually reads", () => {
  const planted = fakeFs({ links: { "rules/up": ROOT } });
  const aliased = fakeFs({ hardLinks: ["rules/copy"] });
  const blind: FsLocator = { locate: () => null, hasHardLinks: () => false };

  it("says nothing when the path is exempt", () => {
    expect(rulesWriteRefusalNote("rules/x.md", PLAIN, "rules/x.md")).toBeNull();
  });

  it("says nothing when the path is not a rule path", () => {
    // The ordinary protected-path deny is already complete for these, and a
    // note would advertise a grant that does not apply to them.
    expect(rulesWriteRefusalNote("agents/coder.md", PLAIN, "agents/coder.md")).toBeNull();
    expect(rulesWriteRefusalNote("rules/", PLAIN, "rules/")).toBeNull();
  });

  it("names the hard link, the one thing no earlier message mentioned", () => {
    const note = rulesWriteRefusalNote("rules/copy", aliased, "rules/copy");
    expect(note).toContain(RULES_WRITE_ENV);
    expect(note).toContain("hard link");
  });

  it("names the spelling, and the file the write would really reach", () => {
    const note = rulesWriteRefusalNote("rules/x.md", PLAIN, "rules/retired/../x.md");
    expect(note).toContain("`..`");
    expect(note).toContain("symlink");
  });

  it("distinguishes an unresolvable path from one that resolves elsewhere", () => {
    expect(rulesWriteRefusalNote("rules/x.md", blind, "rules/x.md")).toContain(
      "cannot be resolved",
    );
    expect(
      rulesWriteRefusalNote("rules/up/agents/coder.md", planted, "rules/up/agents/coder.md"),
    ).toContain("outside the rule directories");
  });

  it("tells the reader to change the path ONLY where changing it is correct", () => {
    // The constraint from `260803-1252`: a diagnostic must not read as "spell
    // it differently and it will go through". Gate 0 is the one refusal where
    // the file really is one the flag covers, so it is the one note that names
    // an action. Every other note says plainly that rewriting will not help.
    expect(REFUSAL_NOTES["spelled-with-dotdot"]).toContain("without a `..`");
    for (const kind of ["hard-link", "unresolvable", "resolves-outside"] as const) {
      expect(REFUSAL_NOTES[kind], kind).toContain("will not help");
      expect(REFUSAL_NOTES[kind], kind).toContain("ask the user");
    }
  });

  it("keeps every note to one line and names the variable in each", () => {
    // They are appended to a deny reason and land in `escalation.json`, so a
    // newline would break the record as surely as it would the message.
    for (const [kind, note] of Object.entries(REFUSAL_NOTES)) {
      expect(note, kind).not.toContain("\n");
      expect(note, kind).toContain(RULES_WRITE_ENV);
    }
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
  /**
   * Finding 1 (`260802-2213`): the label went plural while the article stayed
   * singular, so every multi-path advisory read "to a protected rule paths:
   * …". The earlier assertions checked that the paths were joined and never
   * looked at the sentence around them, which is why a whole grammatical
   * category went unnoticed — so these compare the WHOLE string.
   */
  it("names the variable and the single path it let through", () => {
    expect(rulesWriteDetail(["rules/x.md"])).toBe(
      `Override ${RULES_WRITE_ENV} allowed a normally-denied write to a protected rule path: rules/x.md`,
    );
  });

  it("names every path when several were exempted", () => {
    // The Bash surface reaches this branch on the flag's headline use:
    // `mv rules/x.md rules/retired/` exempts the source and the destination.
    expect(rulesWriteDetail(["rules/x.md", "rules/retired/"])).toBe(
      `Override ${RULES_WRITE_ENV} allowed a normally-denied write to protected rule paths: rules/x.md, rules/retired/`,
    );
  });

  it("carries the article with the label, in both directions", () => {
    expect(rulesWriteDetail(["rules/x.md"])).toContain("a protected rule path:");
    expect(rulesWriteDetail(["rules/x.md", "rules/y.md"])).not.toContain(
      "a protected rule paths",
    );
    expect(rulesWriteDetail(["rules/x.md", "rules/y.md"])).toContain(
      "to protected rule paths:",
    );
  });

  it("says so rather than reading as though nothing happened", () => {
    expect(rulesWriteDetail([])).toContain(RULES_WRITE_ENV);
    expect(rulesWriteDetail([])).toContain("(none recorded)");
  });

  it("is a single line, so one event carries one detail", () => {
    expect(rulesWriteDetail(["rules/x.md", "rules/y.md"])).not.toContain("\n");
  });
});

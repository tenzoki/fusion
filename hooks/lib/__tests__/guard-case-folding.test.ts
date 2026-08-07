import { describe, it, expect } from "vitest";
import {
  CASE_TIMEOUT,
  runGuard,
  runWrite,
  withProject,
} from "./helpers/guard-harness.js";

// ---------------------------------------------------------------------------
// Case folding on the protected list — the write tools, end to end.
//
// ## What was broken
//
// `matchesPattern` compiles a glob to a regex over the path's TEXT, and a
// regex is case-sensitive. On a case-insensitive filesystem — APFS in its
// default configuration, so every stock macOS install, and a case-insensitive
// Windows volume — a protected path spelled in a different case names the same
// file and matched no pattern. Measured against the real guard before the fix:
//
//     Edit agents/coder.md        DENY
//     Edit AGENTS/coder.md        allow      -> writes agents/coder.md
//     Edit HOOKS/config.json      allow      -> writes hooks/config.json
//     Edit Rules/x.md             allow
//     rm AGENTS/coder.md          allow
//
// The whole protected list, one letter, no flag, on both surfaces.
// `issues/260802-2320_p_case-folding-bypasses-the-entire-protected-list-on-a-case-insensitive-filesystem.md`.
//
// ## What was chosen
//
// Fold UNCONDITIONALLY, on every platform, rather than only where the
// filesystem folds. The user's decision, recorded at
// `decisions/260803-1419_a_how-should-the-protected-path-check-treat-the-case-of-a-path.md`:
// a boundary that differs by platform has to be re-stated in every document
// that describes it and is discovered rather than known. The accepted cost is
// over-blocking on a case-sensitive filesystem, where `AGENTS/coder.md` really
// is a second file. Measured there rather than reasoned about — on a
// case-sensitive APFS disk image, `Edit AGENTS/coder.md` denies although both
// files exist and are different.
//
// ## Why the shell rows left this file
//
// It used to cover both surfaces, because a fold applied to the write tools
// alone would have left the shell classifier open and taught an agent that the
// way past a deny is to reach for Bash. There is no shell classifier any more:
// the protected paths are MEASURED after every tool call
// (`lib/protected-snapshot.ts`), and that comparison reads a path's bytes rather
// than its spelling, so a differently-cased shell write is caught by identity
// and not by a fold. The rows that asserted the fold on Bash had no mechanism
// left to assert it against. The write tools still match by text, which is why
// the fold — and this file — still exist.
//
// ## One fresh project per case
//
// Three denials halt the guard, and a halted guard denies everything after for
// a completely different reason. A shared project would turn the fourth case
// onward into `[HALTED]` assertions that pass without testing anything, so
// every case gets its own root and every deny is asserted NOT to be the halt.
// ---------------------------------------------------------------------------

/** A deny that is the protected-path check, not the halt and not a crash. */
function expectProtectedDeny(res: { decision?: string; reason?: string }, label: string) {
  expect(res.decision, `${label} should deny`).toBe("block");
  expect(res.reason ?? "", `${label} denied as [HALTED], not on its own merits`).not.toContain(
    "[HALTED]",
  );
}

describe("the protected list is matched with case folded — write tools", () => {
  // The issue's own table, plus one spelling per remaining protected pattern,
  // so the claim "the entire list" is checked rather than asserted.
  //
  // Every row here ALLOWED before the fold. That is not true of every possible
  // case bypass, and the difference is worth knowing: `agents/**` compiles to
  // `^agents/.*$` and `.*` is case-blind, so `agents/CODER.MD` was already
  // denied at HEAD and only the LITERAL segments of a pattern ever missed.
  // The unit-level form of that bound is in `paths.test.ts`.
  const bypasses = [
    "AGENTS/coder.md",
    "Agents/Coder.md",
    "Rules/x.md",
    "RULES/x.md",
    "HOOKS/config.json",
    "hooks/Config.json",
    "HOOKS/hooks.json",
    "SKILLS/demo/SKILL.md",
    "Settings.json",
    "BIN/Monitor",
    ".Claude-Plugin/Plugin.json",
  ];

  for (const path of bypasses) {
    it(
      `denies the protected file spelled ${JSON.stringify(path)}`,
      () => {
        withProject(({ root }) => {
          const res = runGuard(root, "Edit", { file_path: path });
          expectProtectedDeny(res, path);
          expect(res.reason).toContain("Protected path");
        });
      },
      CASE_TIMEOUT,
    );
  }

  it(
    "denies through every write tool, not only Edit",
    () => {
      for (const tool of ["Write", "Edit", "MultiEdit", "NotebookEdit"]) {
        withProject(({ root }) => {
          expectProtectedDeny(runWrite(root, "AGENTS/coder.md", tool), tool);
        });
      }
    },
    CASE_TIMEOUT,
  );

  it(
    "denies an ABSOLUTE differently-cased path too",
    () => {
      // `normalizeToRelative` relativises through `resolve` + `relative`, which
      // preserves case; the fold has to survive that route as well.
      withProject(({ root }) => {
        expectProtectedDeny(
          runWrite(root, `${root}/AGENTS/coder.md`),
          "absolute",
        );
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "denies a case bypass stacked on a collapse bypass",
    () => {
      // The two normalisations are independent and both have to hold at once.
      withProject(({ root }) => {
        expectProtectedDeny(
          runGuard(root, "Edit", { file_path: "./x/../AGENTS/coder.md" }),
          "collapse+case",
        );
      });
    },
    CASE_TIMEOUT,
  );
});

describe("folding does not reach ordinary unprotected work", () => {
  it(
    "allows paths that differ from a protected path only in case but are not near the list",
    () => {
      for (const path of [
        "notes.txt",
        "NOTES.txt",
        "build/out.js",
        "BUILD/OUT.JS",
        "docs/RULES.md",
        "DOCS/rules.md",
        // Segment-boundary neighbours: the fold must not turn a prefix into a
        // match that the case-sensitive comparison already refused.
        "rulesdraft/x.md",
        "RULESDRAFT/x.md",
        "agents-draft.md",
        "AGENTS-DRAFT.md",
      ]) {
        withProject(({ root }) => {
          expect(runWrite(root, path).decision, path).toBeUndefined();
        });
      }
    },
    CASE_TIMEOUT,
  );
});

describe("the GRANT side is unchanged — folding widened protection only", () => {
  const FLAG = { FUSION_ALLOW_RULES_WRITE: "1" };

  it(
    "still grants exactly what it granted before",
    () => {
      // The flag's two ordinary forms. If the fold had leaked into the
      // exemption these would still pass, so the widening half below is the one
      // that would catch it.
      withProject(({ root }) => {
        expect(runWrite(root, "rules/x.md", "Edit", FLAG).decision).toBeUndefined();
      });
      withProject(({ root }) => {
        expect(runWrite(root, "rules/new.md", "Edit", FLAG).decision).toBeUndefined();
      });
    },
    CASE_TIMEOUT,
  );

  it(
    "does NOT extend the grant to a differently-cased rule path",
    () => {
      // The direction that matters. A fold on the exempt set would hand the
      // permission to a spelling `RULE_DIR_PATTERNS` does not name; instead the
      // protected set widened to cover it and the grant refused it, so it
      // denies. Stated in `rules-write-exemption.ts` rather than discovered.
      for (const path of ["RULES/x.md", "Rules/new.md", "rules/../RULES/x.md"]) {
        withProject(({ root }) => {
          expectProtectedDeny(runWrite(root, path, "Edit", FLAG), path);
        });
      }
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps the trailing-separator asymmetry: the bare rule directory stays out of reach",
    () => {
      // The rule DIRECTORY itself must not become exempt, in either case and
      // in either spelling. This is the OTHER asymmetry in `paths.ts` and the
      // fold sits beside it, not on top of it. The shell spellings of the same
      // four rows (`rm -rf rules/` and friends) left with the mutation
      // classifier; the flag is a write-tool grant, so the write tools are where
      // the asymmetry is observable.
      for (const path of ["rules/", "RULES/"]) {
        withProject(({ root }) => {
          expectProtectedDeny(runWrite(root, path, "Edit", FLAG), path);
        });
      }
    },
    CASE_TIMEOUT,
  );

  it(
    "keeps the bare protected directory denied on the write tools",
    () => {
      for (const path of ["agents/", "rules/", "skills/", "AGENTS/", "Rules/"]) {
        withProject(({ root }) => {
          expectProtectedDeny(runWrite(root, path), path);
        });
      }
    },
    CASE_TIMEOUT,
  );

  it(
    "still exempts nothing outside the rule directories, in any case",
    () => {
      for (const path of ["agents/coder.md", "AGENTS/coder.md", "hooks/config.json"]) {
        withProject(({ root }) => {
          expectProtectedDeny(runWrite(root, path, "Edit", FLAG), path);
        });
      }
    },
    CASE_TIMEOUT,
  );
});

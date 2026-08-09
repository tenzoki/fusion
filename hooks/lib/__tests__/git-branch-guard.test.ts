import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  classifyGitCommand,
  extractCommandSegments,
  stripDataRegions,
  isEnvFlagSet,
  overridesFromEnv,
} from "../git-branch-guard.js";
import type {
  GitGuardOverrides,
  CheckoutResolver,
} from "../git-branch-guard.js";
// The fold under test lives one module down, at the point the command word is
// resolved. Asserting it there as well as through the verdicts is what pins it
// to that point rather than to this classifier's own comparison.
import { programName } from "../command-word.js";
import {
  CORPUS,
  CORPUS_RESOLVER,
  OVERRIDE_COMBOS,
} from "./helpers/git-corpus.js";

const HERE = dirname(fileURLToPath(import.meta.url));

const NO_OVERRIDE: GitGuardOverrides = {
  allowBranchSwitch: false,
  allowWorktree: false,
};
const ALLOW_BRANCH: GitGuardOverrides = {
  allowBranchSwitch: true,
  allowWorktree: false,
};
const ALLOW_WORKTREE: GitGuardOverrides = {
  allowBranchSwitch: false,
  allowWorktree: true,
};
const ALLOW_BOTH: GitGuardOverrides = {
  allowBranchSwitch: true,
  allowWorktree: true,
};

function deny(cmd: string, overrides = NO_OVERRIDE) {
  return classifyGitCommand(cmd, overrides);
}

/**
 * Build a deterministic mock resolver from explicit sets of existing files and
 * valid refs. Mirrors the runtime resolver's contract without touching disk or
 * shelling out to git.
 */
function mockResolver(files: string[], refs: string[]): CheckoutResolver {
  return {
    pathExists: (t) => files.includes(t),
    isRef: (t) => refs.includes(t),
  };
}

function classifyWith(
  cmd: string,
  resolver: CheckoutResolver,
  overrides = NO_OVERRIDE,
) {
  return classifyGitCommand(cmd, overrides, resolver);
}

describe("git branch-switch classifier — DENY cases", () => {
  it("denies git switch <branch>", () => {
    expect(deny("git switch main").deny).toBe(true);
  });

  it("denies git switch -c <new>", () => {
    expect(deny("git switch -c feature").deny).toBe(true);
  });

  it("denies git switch -C <new>", () => {
    expect(deny("git switch -C feature").deny).toBe(true);
  });

  it("denies git switch --detach", () => {
    expect(deny("git switch --detach abc123").deny).toBe(true);
  });

  it("denies git switch - (previous branch)", () => {
    expect(deny("git switch -").deny).toBe(true);
  });

  it("denies git checkout <branch> (no -- separator)", () => {
    expect(deny("git checkout main").deny).toBe(true);
  });

  it("denies git checkout -b <new>", () => {
    expect(deny("git checkout -b feature").deny).toBe(true);
  });

  it("denies git checkout -B <new>", () => {
    expect(deny("git checkout -B feature").deny).toBe(true);
  });

  it("denies git checkout --detach <ref>", () => {
    expect(deny("git checkout --detach abc").deny).toBe(true);
  });

  it("denies git checkout --orphan <new>", () => {
    expect(deny("git checkout --orphan newbranch").deny).toBe(true);
  });

  it("denies git checkout - (previous branch)", () => {
    expect(deny("git checkout -").deny).toBe(true);
  });

  it("denies git worktree add", () => {
    expect(deny("git worktree add ../wt feature").deny).toBe(true);
  });

  it("denies compound: cd x && git checkout other", () => {
    const v = deny("cd x && git checkout other");
    expect(v.deny).toBe(true);
    expect(v.offendingSegment).toContain("git checkout other");
  });

  it("denies a git switch hidden inside a subshell $(...)", () => {
    expect(deny("echo $(git switch main)").deny).toBe(true);
  });

  it("denies a git switch hidden inside backticks", () => {
    expect(deny("echo `git switch main`").deny).toBe(true);
  });

  it("denies if ANY segment is a deny-case", () => {
    expect(deny("git status; git checkout other; git log").deny).toBe(true);
  });

  it("sets the offending segment and kind on deny", () => {
    const v = deny("git worktree add ../wt x");
    expect(v.kind).toBe("worktree-add");
    expect(v.offendingSegment).toContain("git worktree add");
  });

  it("provides a plain actionable deny reason mentioning the overrides", () => {
    const v = deny("git switch main");
    expect(v.reason).toMatch(/FUSION_ALLOW_BRANCH_SWITCH/);
    expect(v.reason).toMatch(/FUSION_ALLOW_WORKTREE/);
    expect(v.reason).toMatch(/STOP and ask the user/);
  });
});

describe("git branch-switch classifier — ALLOW cases (HEAD stays / non-git)", () => {
  it("ALLOWS git checkout HEAD -- foo.go (the load-bearing revert path)", () => {
    expect(deny("git checkout HEAD -- foo.go").deny).toBe(false);
  });

  it("ALLOWS git checkout -- foo.go", () => {
    expect(deny("git checkout -- foo.go").deny).toBe(false);
  });

  it("ALLOWS git checkout abc123 -- foo.go", () => {
    expect(deny("git checkout abc123 -- foo.go").deny).toBe(false);
  });

  it("ALLOWS git checkout HEAD -- multiple files", () => {
    expect(deny("git checkout HEAD -- a.go b.go c.ts").deny).toBe(false);
  });

  it("ALLOWS git status", () => {
    expect(deny("git status").deny).toBe(false);
  });

  it("ALLOWS git branch (listing)", () => {
    expect(deny("git branch").deny).toBe(false);
  });

  it("ALLOWS git branch <new> (create without switch)", () => {
    expect(deny("git branch newbranch").deny).toBe(false);
  });

  it("ALLOWS git log", () => {
    expect(deny("git log --oneline -10").deny).toBe(false);
  });

  it("ALLOWS git diff", () => {
    expect(deny("git diff HEAD~1").deny).toBe(false);
  });

  it("ALLOWS git worktree list", () => {
    expect(deny("git worktree list").deny).toBe(false);
  });

  it("ALLOWS git worktree remove", () => {
    expect(deny("git worktree remove ../wt").deny).toBe(false);
  });

  it("ALLOWS plain non-git command", () => {
    expect(deny("ls -la && cat foo.txt").deny).toBe(false);
  });

  it("ALLOWS bare git with no subcommand", () => {
    expect(deny("git").deny).toBe(false);
  });

  it("ALLOWS git commit", () => {
    expect(deny("git commit -m 'msg'").deny).toBe(false);
  });

  it("ALLOWS git checkout HEAD -- foo even inside a compound", () => {
    expect(deny("git status && git checkout HEAD -- foo.go").deny).toBe(false);
  });
});

describe("git branch-switch classifier — env overrides (least privilege)", () => {
  it("FUSION_ALLOW_BRANCH_SWITCH allows git checkout main", () => {
    const v = classifyGitCommand("git checkout main", ALLOW_BRANCH);
    expect(v.deny).toBe(false);
    expect(v.overrideUsed).toBe(true);
    expect(v.overrideKind).toBe("branch-switch");
  });

  it("FUSION_ALLOW_BRANCH_SWITCH allows git switch feature", () => {
    expect(classifyGitCommand("git switch feature", ALLOW_BRANCH).deny).toBe(false);
  });

  it("FUSION_ALLOW_WORKTREE allows git worktree add", () => {
    const v = classifyGitCommand("git worktree add ../wt x", ALLOW_WORKTREE);
    expect(v.deny).toBe(false);
    expect(v.overrideUsed).toBe(true);
    expect(v.overrideKind).toBe("worktree-add");
  });

  it("branch-switch override does NOT lift the worktree deny (independent)", () => {
    expect(classifyGitCommand("git worktree add ../wt x", ALLOW_BRANCH).deny).toBe(true);
  });

  it("worktree override does NOT lift the branch-switch deny (independent)", () => {
    expect(classifyGitCommand("git checkout main", ALLOW_WORKTREE).deny).toBe(true);
  });
});

/**
 * The scan used to RETURN at the first deny-case segment, so an active override
 * for that class ended the walk and every later segment — including a deny-case
 * of the OTHER class — went unclassified. One override then granted both
 * classes for the rest of the command, which is precisely what two independent
 * variables exist to prevent.
 * (`issues/260801-1745_c_one-git-override-lifts-the-deny-for-the-other-git-class.md`)
 */
describe("git branch-switch classifier — one override never waives the other class", () => {
  it("still denies the branch switch that follows an overridden worktree add", () => {
    const v = classifyGitCommand(
      "git worktree add ../wt f && git switch main",
      ALLOW_WORKTREE,
    );
    expect(v.deny).toBe(true);
    expect(v.kind).toBe("branch-switch");
    expect(v.offendingSegment).toContain("git switch main");
    // Nothing was let through, so no override-used note is claimed.
    expect(v.overrideUsed).toBeUndefined();
  });

  it("still denies the worktree add that follows an overridden branch switch", () => {
    const v = classifyGitCommand(
      "git switch main && git worktree add ../wt f",
      ALLOW_BRANCH,
    );
    expect(v.deny).toBe(true);
    expect(v.kind).toBe("worktree-add");
    expect(v.offendingSegment).toContain("git worktree add");
  });

  it("denies when the un-overridden class comes FIRST too", () => {
    expect(
      classifyGitCommand(
        "git switch main && git worktree add ../wt f",
        ALLOW_WORKTREE,
      ).deny,
    ).toBe(true);
  });

  it("allows a mixed-class command when BOTH overrides are set", () => {
    // Each op was individually authorised, so there is nothing left to withhold.
    for (const cmd of [
      "git worktree add ../wt f && git switch main",
      "git switch main && git worktree add ../wt f",
    ]) {
      const v = classifyGitCommand(cmd, ALLOW_BOTH);
      expect(v.deny, cmd).toBe(false);
      expect(v.overrideUsed, cmd).toBe(true);
    }
  });

  it("names the FIRST overridden segment when several were overridden", () => {
    const v = classifyGitCommand(
      "git switch one && git switch two",
      ALLOW_BRANCH,
    );
    expect(v.deny).toBe(false);
    expect(v.overrideUsed).toBe(true);
    expect(v.overrideKind).toBe("branch-switch");
    expect(v.overrideSegment).toContain("git switch one");
  });

  it("still allows a single overridden op, note and all", () => {
    const v = classifyGitCommand("git switch main", ALLOW_BRANCH);
    expect(v.deny).toBe(false);
    expect(v.overrideUsed).toBe(true);
    expect(v.overrideSegment).toContain("git switch main");
  });

  it("leaves an innocuous command free of any override note", () => {
    expect(classifyGitCommand("git status && ls", ALLOW_BOTH)).toEqual({
      deny: false,
    });
  });
});

/**
 * `(git switch main)` tokenized to `["(git", "switch", "main)"]`, so the command
 * word was `(git` and the segment classified as a non-git command. Closed in
 * `shell-parse.ts` `tokenize`, which both classifiers consume.
 * (`issues/260801-1610_c_paren-subshell-glues-its-parentheses-to-the-command-word-and-the-last-operand.md`)
 */
describe("git branch-switch classifier — a (…) subshell no longer hides the verb", () => {
  it("denies a git switch inside a literal subshell", () => {
    expect(deny("(git switch main)").deny).toBe(true);
    expect(deny("( git switch main )").deny).toBe(true);
    expect(deny("cd x && (git switch main)").deny).toBe(true);
  });

  it("denies a git worktree add inside a literal subshell", () => {
    const v = deny("(git worktree add ../wt f)");
    expect(v.deny).toBe(true);
    expect(v.kind).toBe("worktree-add");
  });

  it("still allows the revert path inside a subshell", () => {
    expect(deny("(git checkout HEAD -- foo.go)").deny).toBe(false);
  });
});

/**
 * This classifier located `git` with its own scan, which skipped a leading
 * `VAR=value` assignment and nothing else. The mutation classifier had two more
 * skips — shell grammar words and wrapper programs — and the asymmetry was
 * accidental: `git switch main` denied, `if git switch main; then :; fi`,
 * `sudo git switch main`, `exec git switch main` and `\git switch main` all
 * allowed. Both now resolve the command word through `command-word.ts`.
 * (`issues/260801-1857_c_compound-command-head-hides-the-verb-from-both-bash-classifiers.md`,
 * `issues/260801-1858_c_a-backslash-escaped-command-word-is-unrecognised-by-both-classifiers.md`)
 */
describe("git branch-switch classifier — the command word cannot be hidden", () => {
  it("denies a branch switch behind a compound-command head", () => {
    for (const cmd of [
      "if git switch main; then :; fi",
      "if git checkout main; then :; fi",
      "while git switch main; do :; done",
      "until git switch main; do :; done",
      "if true; then :; elif git switch main; then :; fi",
      "while :; do git switch main; done",
      "if git worktree add ../wt f; then :; fi",
      "coproc git switch main",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("denies a branch switch behind a wrapper program", () => {
    for (const cmd of [
      "sudo git switch main",
      "sudo -u root git switch main",
      "exec git switch main",
      "env git switch main",
      "nohup git switch main",
      "timeout 5 git switch main",
      "sudo env git worktree add ../wt f",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("denies a backslash-escaped or quoted git", () => {
    for (const cmd of [
      "\\git switch main",
      "\\git worktree add ../wt f",
      '"git" switch main',
      "/usr/bin/git switch main",
      "if \\git switch main; then :; fi",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("does not manufacture a deny out of the same forms", () => {
    // Skipping a grammar word or a wrapper only ever exposes the SAME
    // subcommand table; a read-only git op stays allowed however it is reached.
    for (const cmd of [
      "if git status; then echo clean; fi",
      "while git fetch; do sleep 1; done",
      "sudo git status",
      "exec git log --oneline -5",
      "\\git status",
      "if git checkout HEAD -- rules/x.md; then :; fi",
      "sudo git checkout HEAD -- foo.go",
      "\\git restore foo.go",
      "if [ -d .git ]; then echo repo; fi",
      "exec npm test",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(false);
    }
  });

  it("reports the segment the deny came from, not the whole command", () => {
    const v = deny("echo start && sudo git switch main && echo done");
    expect(v.deny).toBe(true);
    expect(v.kind).toBe("branch-switch");
    expect(v.offendingSegment).toContain("git switch main");
  });
});

/**
 * The classifier decided a segment was a git call by comparing the resolved
 * command word against the literal `"git"`, case-sensitively, while the
 * protected-path half of the SAME hook folded case and had written down why
 * (`matchesAnyFolded`, `guard.ts` CHECK 2: a glob compiles to a case-sensitive
 * regex, so `AGENTS/coder.md` missed `agents/**` — the whole protected list,
 * one letter). The argument was never carried across to the command word.
 * Measured on the work-tree build before the fix:
 *
 *     DENY    git switch main         (control)
 *     allow   GIT switch main
 *     allow   Git switch main
 *     allow   gIt worktree add ../w x
 *
 * (`issues/260809-1110_*_the-command-word-comparison-is-case-sensitive-while-the-protected-path-match-folds.md`)
 *
 * ## THE CASE IS FILESYSTEM-DEPENDENT, AND THAT IS NOT THE SAME AS UNREACHABLE
 *
 * These rows are stated rather than left to be re-derived, because a reader on
 * a case-sensitive volume will otherwise read the whole block as testing a
 * command nobody can run. WHETHER `GIT` REACHES THE GIT BINARY IS THE
 * FILESYSTEM'S ANSWER, NOT THE GUARD'S:
 *
 *   - On a case-INSENSITIVE volume — APFS in its default configuration, so
 *     every stock macOS install, and a case-insensitive Windows volume — it
 *     does. Measured: `zsh -c 'GIT --version'` and `bash -c 'GIT --version'`
 *     both print `git version 2.49.0`. Every case below is a live bypass there.
 *   - On a case-SENSITIVE volume it does not, and the command fails with
 *     "command not found" instead. The deny is then an over-deny of a command
 *     that could not have run — which is the cost this fold accepts, the same
 *     one the path side accepted at
 *     `decisions/260803-1419_*_how-should-the-protected-path-check-treat-the-case-of-a-path.md`.
 *
 * So the assertions hold on BOTH, and deliberately: the fold is unconditional
 * precisely so the guard's boundary does not move with the volume it happens to
 * be running on. A suite that skipped these rows on a case-sensitive checkout
 * would stop testing the property exactly where it is hardest to notice.
 */
describe("git branch-switch classifier — the command word is case-folded", () => {
  it("folds at the RESOLUTION point, not at the comparison", () => {
    // The anti-regression assertion. Folding at `programName` is what gives
    // every consumer of a resolved name the same answer; folding at
    // `git-branch-guard`'s own `!== "git"` would have left the next table to
    // rediscover the defect. If this moves back, this line fails before any
    // verdict does.
    expect(programName("GIT")).toBe("git");
    expect(programName("Git")).toBe("git");
    expect(programName("/usr/bin/GIT")).toBe("git");
    expect(programName("GIT")).toBe(programName("git"));
    // The ordinary spelling is untouched, and so is a program with no row
    // anywhere — the fold is a normalisation, not a policy.
    expect(programName("git")).toBe("git");
    expect(programName("RM")).toBe("rm");
  });

  it("denies every HEAD-moving form however the command word is cased", () => {
    for (const cmd of [
      "GIT switch main",
      "Git switch main",
      "gIt worktree add x y",
      "GIT worktree add ../wt feature",
      "GIT checkout -b bar",
      "GIT checkout main",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("denies through the path, escape and quoting forms too", () => {
    // The spellings `resolveInvocation` already erases, now in the other case.
    // Each one erases a DIFFERENT thing, so a fold applied at only one of them
    // would leave the others standing.
    for (const cmd of [
      "/usr/bin/GIT switch main",
      "\\GIT switch main",
      '"GIT" switch main',
      "FOO=1 GIT switch main",
      "if GIT switch main; then :; fi",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("denies across a wrapper cased either way", () => {
    // The wrapper table reads the same folded name, so the fold reaches both
    // words independently. `SUDO git …` is the direction worth naming: the
    // wrapper is what was unrecognised there, and an unrecognised wrapper hides
    // the verb underneath it.
    for (const cmd of [
      "sudo GIT switch main",
      "SUDO git switch main",
      "SUDO GIT worktree add ../wt f",
      "EXEC git switch main",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("carries the same kind and reason a lower-case deny carries", () => {
    const v = deny("gIt worktree add ../wt f");
    expect(v.kind).toBe("worktree-add");
    expect(v.reason).toBe(deny("git worktree add ../wt f").reason);
    expect(v.offendingSegment).toContain("gIt worktree add");
  });

  it("still routes a folded deny through the overrides, not around them", () => {
    // The fold decides WHICH segments are classified; it must not change what
    // the user's explicit permission then does with them.
    expect(deny("GIT switch main", ALLOW_BRANCH).deny).toBe(false);
    expect(deny("GIT switch main", ALLOW_BRANCH).overrideUsed).toBe(true);
    expect(deny("GIT worktree add ../wt f", ALLOW_BRANCH).deny).toBe(true);
  });

  it("changes no verdict for a program the policy has no row for", () => {
    // The whole no-widening argument in one place: the tables a resolved name
    // is compared against are a deny table (the git row) and a skip table
    // (`WRAPPER_PROGRAMS`, which only ever exposes an inner word to that same
    // deny table). Nothing here grants, so a name that folds onto a row the
    // branch policy does not carry — `rm`, `echo`, `npm` — is exactly as
    // allowed as it was.
    for (const cmd of [
      "RM -rf x",
      "ECHO hello",
      "SUDO RM -rf x",
      "NPM test",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(false);
    }
  });

  it("leaves the read-only and revert forms allowed in any case", () => {
    for (const cmd of [
      "GIT status",
      "Git log --oneline -5",
      "GIT worktree list",
      "GIT checkout HEAD -- foo.go",
      "GIT restore foo.go",
      "SUDO GIT checkout HEAD -- rules/x.md",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(false);
    }
  });
});

describe("git branch-switch classifier — fail-closed on ambiguity", () => {
  it("denies git checkout with a weird ref and no -- separator", () => {
    expect(deny("git checkout origin/main").deny).toBe(true);
  });

  it("denies git checkout with global -C option then a branch", () => {
    expect(deny("git -C /repo checkout main").deny).toBe(true);
  });

  it("denies env-prefixed git switch", () => {
    expect(deny("GIT_TRACE=1 git switch main").deny).toBe(true);
  });

  it("allows git -C /repo checkout HEAD -- foo (-- separator wins)", () => {
    expect(deny("git -C /repo checkout HEAD -- foo.go").deny).toBe(false);
  });
});

/**
 * `classifyCheckout` returned ALLOW the moment it saw a `--` anywhere in the
 * argument list, and only looked at the branch-creating flags afterwards. The
 * separator and the flags are NOT alternatives: git resolves `-b` first and
 * never reaches the ambiguity the separator settles, so two trailing characters
 * lifted the policy's primary case. Measured against real git 2.49.0:
 * `git checkout -b bar --` printed "Switched to a new branch 'bar'" while the
 * guard allowed it.
 * (`issues/260809-1105_o_a-trailing-separator-lifts-the-branch-deny-so-git-checkout-b-name-runs.md`)
 *
 * The suite's own shape had encoded the same assumption as the code: each flag
 * was covered alone (`:85` `-b`, `:89` `-B`, `:93` `--detach`) and the separator
 * was covered alone, and no case combined them.
 */
describe("a trailing `--` does not withdraw a HEAD-moving flag", () => {
  const FLAG_FORMS = [
    "git checkout -b bar --",
    "git checkout -B bar --",
    "git checkout --detach HEAD --",
    "git checkout --orphan o --",
    "git checkout - --",
  ];

  it("denies every branch-creating / detaching flag combined with a trailing --", () => {
    for (const cmd of FLAG_FORMS) {
      const v = deny(cmd);
      expect(v.deny, cmd).toBe(true);
      expect(v.kind, cmd).toBe("branch-switch");
    }
  });

  it("denies them with pathspecs standing behind the separator too", () => {
    for (const cmd of [
      "git checkout -b bar -- .",
      "git checkout -B bar -- rules/x.md",
      "git checkout --detach HEAD -- rules/x.md agents/coder.md",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("denies them however the git call is spelled or reached", () => {
    for (const cmd of [
      "git -C /repo checkout -b bar --",
      "sudo git checkout -b bar --",
      "\\git checkout -b bar --",
      "git status && git checkout -b bar --",
      "echo $(git checkout -b bar --)",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("denies them even when a resolver would happily resolve the operands", () => {
    // The resolver only ever speaks for the AMBIGUOUS form. A flag is decided
    // before it is consulted, so no filesystem state can talk the deny down.
    const r = mockResolver(["bar", "rules/x.md"], []);
    for (const cmd of FLAG_FORMS) {
      expect(classifyWith(cmd, r).deny, cmd).toBe(true);
    }
  });

  it("leaves fusion's own revert spelling allowed", () => {
    // `["HEAD", "--", "rules/x.md"]` holds none of the five flags, so it falls
    // through to the separator check exactly as it did before the reorder.
    for (const cmd of [
      "git checkout HEAD -- rules/x.md",
      "git checkout HEAD -- .",
      "git checkout -- rules/x.md",
      "git checkout abc123 -- rules/x.md",
      "git restore rules/x.md",
      "git -C /repo checkout HEAD -- foo.go",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(false);
    }
  });

  it("states the cost of scanning past the separator", () => {
    // The scan reads every argument, pathspecs included, so a file literally
    // NAMED like one of the five flags is a false deny. Pinned rather than left
    // to be discovered, and accepted: fail-closed is the direction, and this is
    // not a filename anyone writes on purpose.
    expect(deny("git checkout HEAD -- -b").deny).toBe(true);
    // The bound of that cost: an ordinary pathspec is untouched.
    expect(deny("git checkout HEAD -- -b.md").deny).toBe(false);
  });
});

/**
 * The same defect, found and closed in the OTHER classifier on 2026-08-04 and
 * lost when that classifier was retired.
 *
 * `classifySegment` walks git's global options to reach the subcommand. It
 * consumes the value of the four options it knows and treats every other
 * `-`-prefixed token as valueless, so an option that DOES take a separated
 * value left its value standing in subcommand position, matching no row, and
 * the call allowed. Measured against real git 2.49.0: `git --namespace ns
 * switch other` and `git --attr-source HEAD switch t1` both switched branches.
 * (`issues/260809-1106_o_the-unknown-global-option-fix-was-deleted-with-the-mutation-classifier-and-the-branch-guard-never-had-it.md`)
 *
 * ## The sibling records, named here on purpose
 *
 * `issues/260804-1333_c_an-unrecognised-git-global-option-swallows-the-subcommand-and-the-invocation-reads-as-an-unrecognised-program.md`
 * closed this class in `bash-mutation-guard.ts` by reading two adjacent words as
 * subcommand candidates.
 * `issues/260804-1344_c_the-git-option-walk-stops-at-an-unknown-options-value-so-a-c-behind-it-is-invisible.md`
 * found the residual in that answer the same day and replaced it with a RESUMED
 * walk, which is what this classifier now carries.
 *
 * Both modules had the identical eight lines. The fix was applied to one of
 * them, nothing pinned the other, and v6.0.0 deleted the module that had it —
 * so a High-severity defect closed with a working fix was live again five days
 * later. This test name is the mechanism that would surface the shared fix the
 * next time one of two classifiers is retired; that is the filed issue's own
 * acceptance criterion, not decoration.
 */
describe("an unrecognised global option no longer hides the subcommand (260804-1333, 260804-1344)", () => {
  it("denies a switch behind an option that takes a separated value", () => {
    for (const cmd of [
      "git --namespace ns switch main",
      "git --attr-source HEAD switch t1",
      "git --config-env x=Y switch main",
      "git --namespace ns worktree add ../wt f",
      "git --namespace ns checkout -b f",
      "git --namespace ns checkout main",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("denies when a -C stands BEHIND the option's value (the 260804-1344 residual)", () => {
    // Two adjacent candidates cannot see this: three words stand between the
    // unknown option and the subcommand. Only a resumed walk reaches it.
    for (const cmd of [
      "git --namespace foo -C sub switch main",
      "git --attr-source HEAD -C sub -c k=v switch main",
      "git --namespace foo --work-tree=x checkout main",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("still records the -C hints the resumed walk passes on its way", () => {
    const r: CheckoutResolver = {
      pathExists: (t, hints) => hints.includes("/repo") && t === "sub/file.md",
      isRef: () => false,
    };
    // The walk reaches `checkout` only by resuming past `ns`, and it has to
    // arrive carrying the `-C` it stepped over — otherwise the resolver cannot
    // see the file and this allow silently becomes a fail-closed deny.
    expect(
      classifyWith("git --namespace ns -C /repo checkout sub/file.md", r).deny,
    ).toBe(false);
    // Anti-vacuity: at HEAD `451a07e` the walk stopped at `ns` and the whole
    // call allowed, so the assertion above passed for the wrong reason. Drop
    // the `-C` and the same resolver cannot see the file, which only DENIES if
    // the walk really did reach `checkout`.
    expect(
      classifyWith("git --namespace ns checkout sub/file.md", r).deny,
    ).toBe(true);
  });

  it("stops at the real subcommand when no unrecognised option precedes it", () => {
    // The walk must not wander into the subcommand's OWN arguments, where the
    // same spellings mean something else (`git commit -C HEAD~1` reuses a
    // message; `git diff switch` is a pathspec).
    for (const cmd of [
      "git diff",
      "git diff switch",
      "git commit -m switch",
      "git log --oneline switch",
      "git -C d commit -C HEAD~1",
      "git show switch",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(false);
    }
  });

  it("is not a blanket give-up on every invocation carrying an unknown option", () => {
    for (const cmd of [
      "git --namespace foo -C build status",
      "git --namespace foo status",
      "git --attr-source HEAD diff",
      "git --namespace foo -C build commit -m x",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(false);
    }
  });

  it("states the COST as a rule with an open example set, not as a list", () => {
    // The price of resuming: a bare word behind an unrecognised option that
    // takes a SEPARATE word is read as that option's value, so a
    // NON-subcommand standing there lets the walk run on into the subcommand's
    // own arguments. The shape is
    // `git <unknown-option-taking-a-separate-word> <non-subcommand>
    // <switch|worktree|checkout>`, and it is a RULE — these are examples of it,
    // not the extent of it.
    //
    // `git --no-pager grep switch` is the one an agent could plausibly type:
    // searching the tree for the word "switch" with the pager off. Measured, it
    // is the only realistic everyday command in a 1143-row sweep that this
    // change moves from allow to deny.
    //
    // The attached-value spelling of the same shape used to be in this list and
    // is not any more; it now sits in the narrowing block below.
    for (const cmd of [
      "git --no-pager grep switch",
      "git --no-pager grep checkout main",
      "git --paginate grep worktree add",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
    // The bound of the cost, from the other side: with no unrecognised option
    // in front, the same commands are untouched.
    for (const cmd of [
      "git grep switch",
      "git grep checkout main",
      "git -C sub grep switch",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(false);
    }
    // And the cost depends on what TRAILS the mis-read word, not just on the
    // word: a `checkout` with nothing after it is a no-op the policy allows, so
    // the same shape passes here.
    expect(deny("git --paginate grep checkout").deny).toBe(false);
  });

  it("states the BOUND of the resumed walk rather than claiming the class closed", () => {
    // Closed: every well-formed invocation whose unrecognised global options
    // each take at most ONE separated value.
    expect(deny("git --namespace ns switch main").deny).toBe(true);
    // NOT closed and NOT claimed: a second bare word between the value and the
    // subcommand, and an option taking two separated values. Both resolve to
    // nothing here. Neither is a fail-open in practice — git reads the second
    // bare word as the subcommand and refuses the command — but neither is
    // proven, so the gap is pinned as a gap instead of being described as shut.
    expect(deny("git --namespace foo bar -C d switch main").deny).toBe(false);
    expect(deny("git --twoval a b switch main").deny).toBe(false);
  });

  it("keeps the valueless-unknown-option control, which already passed", () => {
    // The row that would hide a regression in the walk itself: it denied before
    // the change for a different reason (the walk never stopped), so it is the
    // one that proves the greps discriminate.
    for (const cmd of [
      "git --no-pager switch main",
      "git --literal-pathspecs switch main",
      "git switch main",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });
});

/**
 * The attached-value narrowing (`260809-1548`).
 *
 * The resumed walk above treated EVERY unrecognised `-`-prefixed token as one
 * that might take a following word, and skipped that word accordingly. For an
 * option written with its value attached — `--exec-path=/x` — that is provably
 * wrong: the value is inside the token, so no further word belongs to the
 * option and the next bare word is git's real subcommand. Three of the ten
 * measured false denials came from nothing but that.
 *
 * It opens nothing, and the reason is structural rather than empirical: the
 * failure mode the resumed walk exists to close is an option whose value stands
 * SEPARATELY, in the position a subcommand would occupy. An attached-value
 * option has no such word, so it cannot be the form that hides a subcommand —
 * which is why the deny rows below are unmoved by the narrowing.
 */
describe("an attached-value global option does not also consume the next word (260809-1548)", () => {
  it("allows the everyday command the flag turned into a deny", () => {
    // Each of these is an ordinary invocation git itself reads correctly: the
    // word after the attached option IS the subcommand, and `switch` /
    // `checkout` / `worktree` further along are that subcommand's arguments.
    // Before the narrowing all three denied.
    for (const cmd of [
      "git --exec-path=/x grep switch",
      "git --exec-path=/x grep checkout main",
      "git --exec-path=/x grep worktree add",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(false);
    }
  });

  it("still denies the same option in front of a real subcommand", () => {
    // The bound from the other side, and the anti-vacuity for the block: the
    // narrowing must not touch the position the policy is actually about. The
    // word after the attached option is tested against the three rows exactly
    // as it is with no option in front.
    for (const cmd of [
      "git --exec-path=/x switch main",
      "git --exec-path=/x checkout -b f",
      "git --exec-path=/x worktree add ../wt f",
      "git --exec-path=/x checkout main",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("leaves the separated form, which is the actual defect, untouched", () => {
    // `--namespace ns switch main` really does switch branches against real
    // git 2.49.0. The narrowing keys on `=` in the token, so this row cannot
    // move — and if it ever did, the walk would be back at `260809-1106`.
    for (const cmd of [
      "git --namespace ns switch main",
      "git --attr-source HEAD switch t1",
      "git --config-env x=Y switch main",
      "git --no-pager grep switch",
    ]) {
      expect(deny(cmd).deny, cmd).toBe(true);
    }
  });

  it("does not disturb the four options the walk names, `=` or not", () => {
    // `-c k=v` carries an `=` in its VALUE token, not its flag token, and
    // `--git-dir=`/`--work-tree=` are handled before the flag is ever set.
    // None of them reaches the narrowing, and the verdicts prove it.
    expect(deny("git -c k=v switch main").deny).toBe(true);
    expect(deny("git --git-dir=/r switch main").deny).toBe(true);
    expect(deny("git --work-tree=/w switch main").deny).toBe(true);
    // The `--git-dir` fail-closed path for the ambiguous checkout form still
    // forces a deny even with a resolver that would otherwise allow.
    const r = mockResolver(["f"], []);
    expect(classifyWith("git --git-dir=/r checkout f", r).deny).toBe(true);
    expect(classifyWith("git checkout f", r).deny).toBe(false);
  });

  it("carries the `-C` hints it steps over on the way to the subcommand", () => {
    // An attached-value option no longer stops the walk from resuming past a
    // LATER unknown option, so the hint-collection path still has to work in
    // its presence.
    const r: CheckoutResolver = {
      pathExists: (t, hints) => hints.includes("/repo") && t === "sub/file.md",
      isRef: () => false,
    };
    expect(
      classifyWith(
        "git --exec-path=/x --namespace ns -C /repo checkout sub/file.md",
        r,
      ).deny,
    ).toBe(false);
  });
});

/**
 * The no-new-allow property, measured rather than claimed.
 *
 * Both fixes rest on the same structural argument — the candidate set after the
 * change is a superset of the one before, so each can only ADD denies. That
 * argument was made for the mutation classifier too, and it was checked there
 * against a generated cross-product of 181,115 commands (`260804-1344`). The
 * generator went with the module.
 *
 * This corpus is deliberately not a rebuild of that instrument: it is sized to
 * the two-edit change it measures. `helpers/git-corpus.ts` carries the
 * cross-product and the reasoning; `fixtures/git-corpus-451a07e.json` carries
 * one deny bit per verdict, recorded against the UNMODIFIED classifier at HEAD
 * `451a07e` before either edit was made, so this is a real before/after and not
 * a snapshot of the code asserting itself.
 *
 * The implication asserted runs in exactly one direction: a verdict that DENIED
 * at the baseline still denies. New denies are expected — `git checkout -b f --`
 * and `git --namespace ns switch main` are both in the corpus precisely so that
 * the fixes show up — and the cost they carry is stated in
 * `rules/git-branch-discipline.md` rather than pinned here.
 */
describe("no verdict that denied at the baseline allows after the two fixes", () => {
  const BASE = JSON.parse(
    readFileSync(join(HERE, "fixtures", "git-corpus-451a07e.json"), "utf8"),
  ) as { baseline: string; rows: { cmd: string; deny: boolean[] }[] };

  it("holds a corpus big enough, and denying enough, to be worth checking", () => {
    // A fixture that emptied, or one whose baseline allowed everything, would
    // satisfy the implication vacuously.
    expect(BASE.rows.length).toBe(CORPUS.length);
    expect(BASE.rows.length).toBeGreaterThan(100);
    const denied = BASE.rows.reduce(
      (n, r) => n + r.deny.filter(Boolean).length,
      0,
    );
    expect(denied).toBeGreaterThan(100);
  });

  it("reads the same commands the fixture was generated from", () => {
    // Reordering GLOBALS or TAILS would silently re-point every bit at a
    // different command, and the implication would then hold about nothing.
    expect(BASE.rows.map((r) => r.cmd)).toEqual(CORPUS);
  });

  it("still denies every baseline deny, over all four overrides, with and without a resolver", () => {
    for (const { cmd, deny: before } of BASE.rows) {
      const now: boolean[] = [];
      for (const o of OVERRIDE_COMBOS) {
        now.push(classifyGitCommand(cmd, o).deny);
        now.push(classifyGitCommand(cmd, o, CORPUS_RESOLVER).deny);
      }
      for (let i = 0; i < before.length; i++) {
        if (before[i]) {
          expect(now[i], `newly ALLOWED: ${JSON.stringify(cmd)} [${i}]`).toBe(
            true,
          );
        }
      }
    }
  });

  it("the corpus actually exercises both fixes (anti-vacuity from the other side)", () => {
    // If neither fix moved a single corpus verdict, the check above would be
    // green against a classifier that had not changed at all.
    const moved = BASE.rows.filter(({ cmd, deny: before }) => {
      const now = OVERRIDE_COMBOS.flatMap((o) => [
        classifyGitCommand(cmd, o).deny,
        classifyGitCommand(cmd, o, CORPUS_RESOLVER).deny,
      ]);
      return now.some((d, i) => d !== before[i]);
    });
    expect(moved.length).toBeGreaterThan(0);
    // And every one of them moved in the denying direction only.
    for (const { cmd, deny: before } of moved) {
      const now = OVERRIDE_COMBOS.flatMap((o) => [
        classifyGitCommand(cmd, o).deny,
        classifyGitCommand(cmd, o, CORPUS_RESOLVER).deny,
      ]);
      for (let i = 0; i < before.length; i++) {
        if (now[i] !== before[i]) {
          expect(now[i], `${cmd} [${i}] moved toward allow`).toBe(true);
        }
      }
    }
  });
});

describe("bare `git checkout <target>` — filesystem + ref-aware resolution", () => {
  it("ALLOWS git checkout <existing-file> that is not a ref (the fixed bug)", () => {
    const r = mockResolver(["agents/coder.md"], []);
    const v = classifyWith("git checkout agents/coder.md", r);
    expect(v.deny).toBe(false);
  });

  it("ALLOWS git checkout of several existing non-ref files", () => {
    const r = mockResolver(["a.go", "b.ts"], []);
    expect(classifyWith("git checkout a.go b.ts", r).deny).toBe(false);
  });

  it("BLOCKS git checkout <nonexistent-arg-that-is-not-a-file> (conservative)", () => {
    const r = mockResolver([], []);
    expect(classifyWith("git checkout not-a-file", r).deny).toBe(true);
  });

  it("BLOCKS git checkout <real-branch> even with no matching file (ref wins)", () => {
    const r = mockResolver([], ["feature/plane"]);
    const v = classifyWith("git checkout feature/plane", r);
    expect(v.deny).toBe(true);
    expect(v.kind).toBe("branch-switch");
  });

  it("BLOCKS git checkout <name> when a branch AND a file share that name (ref wins)", () => {
    const r = mockResolver(["deploy"], ["deploy"]);
    expect(classifyWith("git checkout deploy", r).deny).toBe(true);
  });

  it("BLOCKS if any positional is a ref, even when others are files", () => {
    const r = mockResolver(["a.go"], ["main"]);
    expect(classifyWith("git checkout a.go main", r).deny).toBe(true);
  });

  it("BLOCKS if any positional is not an existing file, even when others are", () => {
    const r = mockResolver(["a.go"], []);
    expect(classifyWith("git checkout a.go ghost.go", r).deny).toBe(true);
  });

  it("still ALLOWS the -- pathspec form regardless of resolver", () => {
    const r = mockResolver([], ["main"]);
    expect(classifyWith("git checkout -- main", r).deny).toBe(false);
    expect(classifyWith("git checkout HEAD -- main", r).deny).toBe(false);
  });

  it("still BLOCKS git checkout -b even for an existing-file name", () => {
    const r = mockResolver(["newbranch"], []);
    expect(classifyWith("git checkout -b newbranch", r).deny).toBe(true);
  });

  it("respects -C <dir> cwd hints when resolving files/refs", () => {
    const r: CheckoutResolver = {
      // Only resolves the file when the -C hint is threaded through.
      pathExists: (t, hints) =>
        hints.includes("/repo") && t === "sub/file.md",
      isRef: () => false,
    };
    expect(classifyWith("git -C /repo checkout sub/file.md", r).deny).toBe(false);
    // Without the -C hint the same resolver would not see the file → block.
    expect(classifyWith("git checkout sub/file.md", r).deny).toBe(true);
  });

  it("fails closed on --git-dir / --work-tree globals even with a resolver", () => {
    const r = mockResolver(["file.md"], []);
    expect(
      classifyWith("git --git-dir=/x/.git checkout file.md", r).deny,
    ).toBe(true);
    expect(
      classifyWith("git --work-tree=/x checkout file.md", r).deny,
    ).toBe(true);
  });

  it("appends the restore hint to the deny reason for the ambiguous form", () => {
    const r = mockResolver([], []);
    const v = classifyWith("git checkout something", r);
    expect(v.reason).toMatch(/git restore <file>/);
    expect(v.reason).toMatch(/git checkout -- <file>/);
  });

  it("does NOT append the restore hint to a plain git switch deny", () => {
    const v = deny("git switch main");
    expect(v.reason).not.toMatch(/git restore <file>/);
  });

  it("ALLOWS git restore <path> (not a checkout/switch/worktree op)", () => {
    expect(deny("git restore foo.go").deny).toBe(false);
    expect(deny("git restore --staged foo.go").deny).toBe(false);
  });

  it("without a resolver, the ambiguous bare form still fails closed", () => {
    // No resolver passed → cannot prove file-restore → DENY.
    expect(deny("git checkout agents/coder.md").deny).toBe(true);
  });
});

describe("shell data regions — heredocs and single quotes (issue 260716-2005)", () => {
  // The three probes from the issue, plus the double-quote counter-case.

  it("ALLOWS a quoted heredoc whose body has a backticked `git switch` (probe 3)", () => {
    const cmd =
      "cat > /tmp/probe3.txt <<'EOF'\n" +
      "a hook that denies `git switch` in backticks\n" +
      "EOF";
    expect(deny(cmd).deny).toBe(false);
  });

  it("ALLOWS a quoted heredoc whose body has a bare git switch (probe 2)", () => {
    const cmd =
      "cat > /tmp/probe2.txt <<'EOF'\n" +
      "prose that says git switch main plainly\n" +
      "EOF";
    expect(deny(cmd).deny).toBe(false);
  });

  it("ALLOWS a quoted heredoc with a backticked `git worktree add` (docs case)", () => {
    const cmd =
      "cat > rules/git-branch-discipline.md <<'DOC'\n" +
      "Agents are blocked from `git switch` and `git worktree add ../wt x`.\n" +
      "DOC";
    expect(deny(cmd).deny).toBe(false);
  });

  it("ALLOWS a double-quoted-delimiter heredoc (<<\"EOF\") with backticked git", () => {
    const cmd =
      'cat <<"EOF"\n' +
      "see `git switch main` for details\n" +
      "EOF";
    expect(deny(cmd).deny).toBe(false);
  });

  it("ALLOWS a `<<-` quoted heredoc with a tab-indented terminator", () => {
    const cmd =
      "\tcat <<-'EOF'\n" +
      "\tmentions `git switch main` in indented prose\n" +
      "\tEOF";
    expect(deny(cmd).deny).toBe(false);
  });

  it("ALLOWS backticked git switch inside a single-quoted string", () => {
    expect(deny("echo 'run `git switch main` here'").deny).toBe(false);
  });

  it("ALLOWS a $() mention of git switch inside a single-quoted string", () => {
    expect(deny("echo 'run $(git switch main) here'").deny).toBe(false);
  });

  // Regressions: real commands must STILL be denied.

  it("STILL DENIES a real `git switch main` command (no regression)", () => {
    expect(deny("git switch main").deny).toBe(true);
  });

  it("STILL DENIES backticked git switch inside a DOUBLE-quoted string", () => {
    // bash DOES substitute inside double quotes → this is a real invocation.
    const v = deny('echo "run `git switch main` here"');
    expect(v.deny).toBe(true);
    expect(v.kind).toBe("branch-switch");
  });

  it("STILL DENIES $(git switch) inside a DOUBLE-quoted string", () => {
    expect(deny('echo "$(git switch main)"').deny).toBe(true);
  });

  it("STILL DENIES an UNQUOTED-delimiter heredoc with a backticked git switch", () => {
    // bash expands `...` in an unquoted-delimiter heredoc body → deny.
    const cmd =
      "cat <<EOF\n" +
      "expands `git switch main` here\n" +
      "EOF";
    expect(deny(cmd).deny).toBe(true);
  });

  it("STILL DENIES an UNQUOTED-delimiter heredoc with $(git switch) in the body", () => {
    const cmd =
      "cat <<EOF\n" +
      "expands $(git switch main) here\n" +
      "EOF";
    expect(deny(cmd).deny).toBe(true);
  });

  // The unquoted-delimiter half, which `260716-2005` deliberately left standing
  // and `260809-1111` closed: expansion is not execution. Bash substitutes in
  // such a body — so the two cases above still deny — but it WRITES the rest of
  // it, so a plain line documenting the policy is prose here exactly as it is
  // under a quoted delimiter.

  it("ALLOWS an UNQUOTED-delimiter heredoc whose body line is a bare git switch", () => {
    const cmd =
      "cat <<EOF > runbook.md\n" +
      "git switch main\n" +
      "EOF";
    expect(deny(cmd).deny).toBe(false);
  });

  it("ALLOWS an UNQUOTED heredoc documenting the branch policy in prose", () => {
    const cmd =
      "cat <<EOF > runbook.md\n" +
      "To move between branches you would normally run git switch main,\n" +
      "and git worktree add ../wt x for a second tree. Both are blocked.\n" +
      "EOF";
    expect(deny(cmd).deny).toBe(false);
  });

  it("ALLOWS an UNQUOTED `<<-` heredoc with a tab-indented terminator", () => {
    const cmd =
      "\tcat <<-EOF\n" +
      "\tgit checkout other-branch\n" +
      "\tEOF";
    expect(deny(cmd).deny).toBe(false);
  });

  it("DENIES the substitution but not the prose it stands in", () => {
    // One body, both readings, so neither can be green by accident.
    const denied =
      "cat <<EOF > runbook.md\n" +
      "git switch main is blocked, and $(git switch main) is a real call\n" +
      "EOF";
    const allowed =
      "cat <<EOF > runbook.md\n" +
      "git switch main is blocked, and a real call would be a substitution\n" +
      "EOF";
    expect(deny(denied).deny).toBe(true);
    expect(deny(allowed).deny).toBe(false);
  });

  it("STILL DENIES a real git switch after an UNQUOTED heredoc's terminator", () => {
    // The blanking must stop at the terminator, not swallow the command after it.
    const cmd =
      "cat <<EOF > runbook.md\n" +
      "git switch main\n" +
      "EOF\n" +
      "git switch main";
    expect(deny(cmd).deny).toBe(true);
  });

  it("fails closed when an UNQUOTED heredoc terminator never appears", () => {
    // No closing EOF → the body was never proven to be a body → code → deny.
    const cmd = "cat <<EOF\ngit switch main\n";
    expect(deny(cmd).deny).toBe(true);
  });

  it("DENIES a real git switch on the redirect line even with a quoted heredoc after", () => {
    const cmd =
      "git switch main <<'EOF'\n" +
      "body mentioning `git checkout other`\n" +
      "EOF";
    expect(deny(cmd).deny).toBe(true);
  });

  it("fails closed when a quoted heredoc terminator never appears", () => {
    // No closing EOF → body is NOT proven inert → treated as code → deny.
    const cmd = "cat <<'EOF'\ngit switch main\n";
    expect(deny(cmd).deny).toBe(true);
  });

  it("fails closed on an unterminated single quote hiding a backtick git switch", () => {
    // Unterminated ' → remainder treated as code → backtick recursion → deny.
    expect(deny("echo 'unterminated `git switch main`").deny).toBe(true);
  });
});

describe("stripDataRegions", () => {
  it("blanks a single-quoted body but keeps the quotes and length", () => {
    expect(stripDataRegions("echo 'abc'")).toBe("echo '   '");
  });

  it("leaves a double-quoted body verbatim (bash expands there)", () => {
    expect(stripDataRegions('echo "a`b`c"')).toBe('echo "a`b`c"');
  });

  it("drops a quoted heredoc body to spaces but keeps the newlines", () => {
    const out = stripDataRegions("cat <<'EOF'\n`x`\nEOF");
    expect(out).not.toContain("`");
    expect(out).toContain("EOF");
  });

  it("keeps an unquoted heredoc body's substitutions and blanks the rest", () => {
    const out = stripDataRegions("cat <<EOF\nplain `x` text\nEOF");
    expect(out).toContain("`x`"); // bash substitutes there → still code
    expect(out).not.toContain("plain"); // bash writes that → data
    expect(out).toContain("EOF");
  });

  it("leaves a here-string <<< as code", () => {
    expect(stripDataRegions("cat <<< word")).toBe("cat <<< word");
  });

  it("is a no-op for a command with no data regions", () => {
    expect(stripDataRegions("git checkout HEAD -- foo.go")).toBe(
      "git checkout HEAD -- foo.go",
    );
  });
});

describe("extractCommandSegments", () => {
  it("splits on && ; || |", () => {
    const segs = extractCommandSegments("a && b ; c || d | e");
    expect(segs).toEqual(expect.arrayContaining(["a", "b", "c", "d", "e"]));
  });

  it("extracts subshell bodies from $(...)", () => {
    const segs = extractCommandSegments("echo $(git switch main)");
    expect(segs.some((s) => s.includes("git switch main"))).toBe(true);
  });

  it("extracts subshell bodies from backticks", () => {
    const segs = extractCommandSegments("echo `git status`");
    expect(segs.some((s) => s.includes("git status"))).toBe(true);
  });
});

describe("env flag parsing", () => {
  it("treats 1 and true as set", () => {
    expect(isEnvFlagSet("1")).toBe(true);
    expect(isEnvFlagSet("true")).toBe(true);
    expect(isEnvFlagSet("TRUE")).toBe(true);
  });

  it("treats anything else as unset", () => {
    expect(isEnvFlagSet(undefined)).toBe(false);
    expect(isEnvFlagSet("0")).toBe(false);
    expect(isEnvFlagSet("false")).toBe(false);
    expect(isEnvFlagSet("")).toBe(false);
  });

  it("overridesFromEnv reads both flags independently", () => {
    expect(overridesFromEnv({ FUSION_ALLOW_BRANCH_SWITCH: "1" })).toEqual({
      allowBranchSwitch: true,
      allowWorktree: false,
    });
    expect(overridesFromEnv({ FUSION_ALLOW_WORKTREE: "true" })).toEqual({
      allowBranchSwitch: false,
      allowWorktree: true,
    });
  });
});

/* ------------------------------------------------------------------ *
 * The compatibility surface: this classifier must not move at all
 * ------------------------------------------------------------------ */

/**
 * `ParsedSegment` gained a `joiner` field so the MUTATION classifier could
 * tell a `cd` the shell guarantees succeeded from one it does not
 * (`decisions/260803-2338_i_should-the-guard-degrade-its-directory-model-after-a-cd-it-cannot-prove-succeeded.md`).
 * Both Bash classifiers live behind `shell-parse.ts`, so the git policy is a
 * COMPATIBILITY SURFACE for that change: its behaviour has to be unchanged, and
 * the acceptance criterion said to assert that rather than assume it.
 *
 * Two assertions, because they fail for different reasons and one without the
 * other is a guess:
 *
 *   1. A GOLD FILE of this classifier's verdicts at the commit before the
 *      change, over every command string in the whole test suite, in all four
 *      override combinations. It was generated by running the PREVIOUS
 *      classifier and is compared against the CURRENT one, so it is a real
 *      before/after and not a snapshot of the code asserting itself. Any drift
 *      in a reason string, an `offendingSegment`, a `kind` or an
 *      `overrideUsed` fails here.
 *   2. A source check that this module still segments through
 *      `extractCommandSegments(stripDataRegions(cmd))` and never touches
 *      `parseCommand`. That is the structural reason the gold file can stay
 *      green: the flat segmenter is a SEPARATE function, retained verbatim, and
 *      a field added to `ParsedSegment` cannot reach a caller that does not
 *      call `parseCommand`. Without this, a future edit could route the git
 *      classifier through the parser and the gold file would only catch it for
 *      the commands that happen to be in it.
 */
describe("the git classifier is unmoved by the joiner widening", () => {
  const GOLD = JSON.parse(
    readFileSync(join(HERE, "fixtures", "git-verdicts-head.json"), "utf8"),
  ) as {
    overrides: GitGuardOverrides[];
    rows: { cmd: string; verdicts: unknown[] }[];
  };

  it("holds enough rows to be worth checking", () => {
    // A fixture that silently emptied would pass vacuously.
    expect(GOLD.rows.length).toBeGreaterThan(80);
    expect(GOLD.overrides.length).toBe(4);
  });

  it("reproduces every recorded verdict byte for byte", () => {
    for (const { cmd, verdicts } of GOLD.rows) {
      const now = GOLD.overrides.map((o) => classifyGitCommand(cmd, o));
      expect(now, `command: ${JSON.stringify(cmd)}`).toEqual(verdicts);
    }
  });

  it("still segments through the flat segmenter, never through parseCommand", () => {
    const src = readFileSync(join(HERE, "..", "git-branch-guard.ts"), "utf8");
    expect(src).toContain("extractCommandSegments(stripDataRegions(command))");
    expect(src).not.toMatch(/\bparseCommand\b/);
    expect(src).not.toMatch(/\bParsedSegment\b/);
    expect(src).not.toMatch(/\bjoiner\b/);
  });
});

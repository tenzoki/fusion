import { describe, it, expect } from "vitest";
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

  it("keeps an unquoted heredoc body verbatim (bash expands there)", () => {
    const out = stripDataRegions("cat <<EOF\n`x`\nEOF");
    expect(out).toContain("`x`");
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

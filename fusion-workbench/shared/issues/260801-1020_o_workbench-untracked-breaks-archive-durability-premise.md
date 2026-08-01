The fusion-workbench is neither tracked nor gitignored, so two documented durability claims are false

---

`skills/archive/SKILL.md:9` states that archives are "moved, not copied — so the live workbench stays focused while git preserves the bytes". `CLAUDE.md` describes `fusion-workbench/` as a "**Runtime artifact, gitignored.**"

Both claims are wrong in this repo, and they are wrong for the same root cause: the workbench is untracked *and* unignored.

Verified:

- `git ls-files fusion-workbench/` returns 0 files. Nothing in the workbench is in the git index.
- `git check-ignore -v fusion-workbench/shared/history/260801-0936-orchestrator-session.md` produces no match and exits non-zero. The path is not ignored.
- `.gitignore:49-50` reads:
  ```
  # fusion-workbench is a runtime artifact created by agents in the consuming project
  ## fusion-workbench/
  ```
  The ignore rule is commented out with a second `#`.
- `git status` reports `?? fusion-workbench/` permanently.

---

Consequences:

1. **Archive's durability premise fails.** `/fusion:archive` moves files rather than copying them, on the stated reasoning that git holds the bytes. With the workbench untracked, an archive move is the only copy, and a mistaken or colliding move loses the artifact outright. The skill's own collision guard (`skills/archive/SKILL.md:174`) protects against overwrite but not against this.

2. **The workbench has no history of its own.** The reconciler appends to files in place, and playmaker regenerates `portfolio.md` wholesale on every run (`agents/playmaker.md:136`). Without version control, prior states are unrecoverable. Any capability that wants to reconstruct how the project's understanding evolved sees endpoints only, never trajectories. This is a direct constraint on the consolidation-agent design analysed in `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md` (Question 4, second thin spot).

3. **`git status` is permanently dirty**, which erodes the signal that `/fusion:cleanup` Step 2 and the orchestrator's commit phase rely on.

The commented-out ignore line suggests someone reversed the decision to ignore the workbench and did not finish the reversal in either direction. The fix depends on which outcome was intended: re-enable the ignore rule, or commit the workbench and correct the `CLAUDE.md` claim plus archive's premise sentence. That intent is the user's to state.

Note that in the *general* case fusion ships no `.gitignore` rule for consuming projects, so a consuming project may land in any of the three states (tracked, ignored, or neither). Archive's sentence is unconditional and is therefore unsafe as written regardless of what this repo chooses.

Filed by: analyst, from `shared/analyses/260801-1020-normative-surface-drift-gap-analysis.md`.

# How does the commit lock stop leaving the tree it just committed dirty?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1841_*_citation-mechanism-four-defect-repair.md` (the plan this was surfaced by, defect 4), `rules/commit-lock.md` `## The lock writes the commit event`, `rules/workbench-tracking.md` (class R2)

---

## Question

`emit_commit_event()` at `bin/fusion-commit-lock:297-319` appends the machine-written `commit` row to `fusion-workbench/orchestrator-events.jsonl` after the wrapped command exits 0, called at line 378 inside the held region. In a project that tracks its workbench that file is tracked, verified here at `cda72f71`: `git check-ignore` exits 1 and `git ls-files --error-unmatch` exits 0 for that path. So `git status --porcelain` is non-empty from the instant the commit lands.

Two mechanical consequences: `bin/fusion-citation-sweep --write` can never run in the commit that follows a fusion commit, because its guard (a) refuses a dirty tree; and every `/fusion:cleanup` housekeeping split starts dirty.

The row is required. `rules/commit-lock.md` states three properties any fix must keep: the row exists, no caller emits a `commit` row of its own, and the emission is best-effort and never changes the wrapped command's exit code. The file is class R2 in `rules/workbench-tracking.md`, the one file two checkouts both append to, carrying `merge=union` in `.gitattributes` precisely so it travels.

## Options

1. **Emit the row before the commit is created**, so it enters that same commit.
   - Pros: the tree is clean afterwards.
   - Cons: the row carries the short hash and the subject, neither of which exists before the commit. Writing it first means predicting from the command's text whether a commit will land, which is the undecidable question this codebase deleted two mechanisms over (`rules/critical-stance.md` §4). The contract's "only when a commit actually landed, HEAD read and compared" is exactly the guarantee that would be given up.

2. **Have the lock stage the row into the commit it just made** (`git add` + `--amend`).
   - Pros: one commit, clean tree.
   - Cons: amending changes the hash the row just recorded, so the row names a commit that no longer exists; correcting it means rewriting an append-only union-merged file, which the merge driver's whole premise forbids. And the lock would become a second author of the staging list, which `hooks/lib/staging-drift.ts` refuses by name for the shape whose value is that a person wrote every path in it.

3. **Write the row somewhere untracked.**
   - Pros: the tree stays clean with no change to when the row is written.
   - Cons: contradicts class R2 and the merge driver. The log's value is that it travels; an untracked log answers no question after a clone.

4. **State the dirt as intended and narrow the sweep's guard.** Guard (a) stops asking "is the work tree clean" and asks the question it actually needs: **does any uncommitted change touch a file this sweep will read?** The sweep knows its own corpus, so the test is exact.
   - Pros: no protocol property is given up; the row keeps its hash, its timing and its best-effort contract. What gets tested is the condition guard (a) exists for: that a damaged rewrite has one revert back, and that the sweep's diff is its own. Today a proxy for that condition is tested instead. `orchestrator-events.jsonl` is not markdown and was never in the corpus, so it stops mattering by construction rather than by exemption. A dirty `portfolio.md` or `orchestrator-live.md` still refuses, correctly, because those *are* in the corpus.
   - Cons: an unrelated dirty file elsewhere in the work tree no longer refuses, so a person who runs the sweep mid-edit gets the sweep's changes alongside their own in one working tree. Path-named staging keeps them apart in the commit, but the reader of `git diff` sees both.

## Constraints

- The three properties in `rules/commit-lock.md` `## The lock writes the commit event` hold whatever is chosen.
- `orchestrator-events.jsonl` stays tracked and stays `merge=union`.
- The sweep's other two write guards (census before write, no bare-stamp resolution) are untouched.

## Recommendation

Option 4. Options 1 to 3 each pay for a clean `git status` with a property the protocol was built to have: the measured hash, the append-only log, or the single author of a staging list. Only option 4 leaves the protocol alone, and it does so by replacing a proxy condition with the condition itself.

---
Answered: 260830-1841_*_citation-mechanism-four-defect-repair.md — user approved the plan at the Phase 0b plan-review gate on 2026-08-30, choosing option 4: the dirt is stated as intended and the sweep guard (a) is narrowed to the corpus question. bin/fusion-commit-lock and rules/commit-lock.md are not edited, so all three properties the rule mandates survive.

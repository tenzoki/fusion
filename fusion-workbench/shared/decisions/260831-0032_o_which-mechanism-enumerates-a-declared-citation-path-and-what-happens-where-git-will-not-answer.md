# Which mechanism enumerates a declared citation path, and what happens in a tree git will not answer for?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md` (the answered record this realises, option 5), `260809-1731_*_how-should-the-domain-heuristic-count-a-projects-source-files.md` (the same question answered once already, for a different counter), `260831-0015_*_the-sweeps-guard-a-does-not-check-that-an-extra-path-argument-is-tracked.md` (the defect one of these answers closes by construction)

---

## Question

`260830-1844` was answered option 5 on 2026-08-31: a project declares its citation-bearing non-Markdown paths as globs in `fusion.json` and both `bin/fusion-citation-check` and `bin/fusion-citation-sweep` read them. The record settles *that* a declaration is read. It does not settle **what turns a glob into a list of files**, and that choice binds more than the plan realising it, for three reasons: it decides whether a fusion citation corpus depends on git at all, it decides whether a declared pattern can ever name an untracked or ignored file, and it decides what a project outside a git work tree gets.

It has to be answered now because `hooks/dist/` ships in a tarball with no `node_modules` (`CLAUDE.md` `## HTTPS installer`), so "add a glob library" is not available and the alternatives are not interchangeable.

## Options

1. **`git ls-files` with `:(glob)` pathspec magic, one call per declared pattern, no fallback.** git does the globbing and the enumeration; a pattern is refused before git when it is absolute or carries a `..` segment; a tree git will not answer for yields `unavailable`, named, never an empty list.
   - Pros: no glob engine is written and none ships. One mechanism and no fallback, which is the shape `260809-1731` already chose for `bin/fusion-count-sources` — the same class of question in the same repository. A declared pattern can never name a gitignored or untracked file, which closes `260831-0015`'s measured failure for the routine route by construction rather than by a check. `hooks/lib/git.ts` already exists and its three properties (cwd is the root, every failure is `null`, a timeout is mandatory) are exactly what this needs, so no new subprocess wrapper appears. Per-pattern calls make a pattern that matches nothing nameable, which is the answer to option 5's own stated con that a list nobody maintains covers nothing.
   - Cons: the citation corpus now depends on git for the declared half, where it depended on the filesystem alone before. A project with a workbench and no git work tree gets no declared files at all. Pathspec magic is a git-specific spelling a project owner has to be told about — `*` not crossing `/` and `**` crossing it are properties of `:(glob)`, not of the string.

2. **A hand-written glob-to-RegExp compiler over a filesystem walk.**
   - Pros: no git dependency; the semantics are fusion's own and are stated in one place.
   - Cons: a second enumeration mechanism in a repository that already made this choice once, and it inherits the walk's exclusion problem — `node_modules`, `.git` and build output have to be excluded by a list fusion invents and maintains, which is the rim of special cases `rules/critical-stance.md` §2 names. It also reopens `260831-0015` on the routine route: a walk names ignored build output as readily as source, and the real run that motivated all of this rewrote ten gitignored files with no revert available.

3. **`fs.globSync`.** Node's own, added in 22.0.0.
   - Pros: no code and no dependency.
   - Cons: `hooks/package.json` declares `"node": ">=20.12.0"`, so this raises the floor for every consuming project to buy one function. It also has option 2's exclusion problem unchanged.

4. **No globs at all — a declared path is a literal file or directory.**
   - Pros: the smallest possible surface; the sweep's existing `<path>` argument already behaves this way.
   - Cons: the measured case is 89 files across a tree of 21 875, and a literal list of 89 paths in `fusion.json` is a list nobody maintains with certainty. The decision record chose globs deliberately.

## Constraints

- `hooks/dist/` must stay self-contained: no external `require`, because `install.sh` ships a tarball with no `node_modules`.
- Whatever is chosen serves the checker and the sweep through one implementation. No second enumerator.
- A figure that could not be taken is named and never rendered as zero — the rule `bin/fusion-count-sources` states for `unavailable` and `bin/fusion-identity` states for an absent person half.
- The case split must be disjoint and complete over: not a git work tree, a pattern refused before git, a pattern git refuses, a pattern matching nothing, a pattern matching files.

## Recommendation

**Option 1.** It is the only one that answers the enumeration question without inventing a second exclusion policy, and the exclusion policy is where option 2 and option 3 quietly fail: fusion would have to decide, per project, that `node_modules/` and `dist/` are not citation-bearing, which is a judgement the project already made in its own `.gitignore`. Reading that judgement rather than restating it is the same move option 5 made one level up — replace a question fusion cannot decide with one somebody already wrote down.

The cost is real and belongs in the answer rather than under it: a project outside a git work tree gets `declared-files=unavailable` and no declared corpus. That is the honest reading, and it is what `260809-1731` already accepted for the source-file count.

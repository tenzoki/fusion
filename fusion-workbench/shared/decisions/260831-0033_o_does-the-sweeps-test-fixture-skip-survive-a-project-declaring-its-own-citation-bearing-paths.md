# Does the sweep's test-fixture skip survive a project declaring its own citation-bearing paths?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** `260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md` (option 5, whose declaration is the thing that makes this askable), `260831-0032_*_which-mechanism-enumerates-a-declared-citation-path-and-what-happens-where-git-will-not-answer.md` (the enumerator this sits beside)

---

## Question

`hooks/citation-sweep.ts` carries

```
const isTestFixture = (abs: string): boolean =>
  abs.endsWith(".ts") && abs.split(sep).join("/").includes("/lib/__tests__/");
```

and skips every such file in both the sweep and the repair pass. It is one project's directory convention compiled into a program every consuming project runs, and the decision record that produced the declaration mechanism already named it as evidence: option 2 of `260830-1844` calls it "an ad-hoc version of this problem", present because a general rule was missing rather than because one exists.

Once a project declares its own citation-bearing paths, a general rule does exist, and it is the declaration: a project that considers its fixtures exhibits rather than pointers does not declare them. That makes the hard-coded skip either redundant or a second, conflicting answer to the same question — and it is measurable which. Over this repository, the 51 files of `hooks/lib/__tests__/**/*.ts` carry 90 dangling and 133 store-prefixed tokens, against 2 dangling and 0 store-prefixed across the 45 files fusion would actually declare (measured 2026-08-31 at `7be624e7`). The fixtures are exactly the noise the skip exists for, and exactly what a declaration leaves out.

It is filed rather than answered because nothing in the realising plan turns on it: the plan declares no fixture path, so the skip is inert for the declared route and the plan neither needs it nor is harmed by it.

## Options

1. **Keep the skip unchanged.** The declared route never reaches it; it goes on guarding the hand-passed `<path>` route.
   - Pros: no change, no risk. A person who runs `bin/fusion-citation-sweep hooks/lib/__tests__/*.ts` by hand in this repository is still protected from rewriting fixtures.
   - Cons: fusion ships one project's directory layout as a rule to every consuming project, where `lib/__tests__` may mean nothing or may mean something else. Two answers to "is this file citation-bearing" now coexist — a declaration a project wrote, and a path substring fusion compiled in — and they can disagree with no way for the project to win.

2. **Remove the skip; the declaration is the whole answer.** A file the sweep touches is a file the project named, whether through the declaration or as an explicit `<path>` argument.
   - Pros: one rule, project-owned. It is the same move as the declaration itself, applied one level down: stop guessing which files are exhibits, read the list somebody wrote.
   - Cons: a hand-passed `<path>` argument stops being second-guessed, so a careless `hooks/lib/__tests__/*.ts` in this repository would rewrite fixtures. The visibility guard and guard (a) still stand between that and an unrecoverable tree, but the fixture rewrite itself would be applied.

3. **Replace the substring with a declared exclusion list**, `citations.excludePaths` beside `citations.extraPaths`.
   - Pros: expresses "declared, except these" for a project whose citation-bearing directory contains a fixture subtree.
   - Cons: a second list to maintain for a case nobody has measured. A glob that excludes is a glob that could simply not have been included; the include list already expresses it.

## Constraints

- Whatever is chosen holds for the sweep's declared route and its `<path>` route alike, or the two routes disagree about the same file.
- The repair pass (`--repair`) reads the same skip and must move with it.
- `hooks/lib/__tests__/citation-sweep.test.ts` asserts on fixture content; a change here must not make the suite rewrite its own fixtures.

## Recommendation

None yet, and deliberately: the choice between options 1 and 2 turns on whether anybody actually runs the sweep by hand over this repository's test tree, which is a fact about practice rather than about the code. Option 3 is the one that can be ruled out now — it adds a list to solve a case the include list already solves.

---
Note (2026-08-31, analyst): plan `260831-0024_*_a-project-declares-its-citation-bearing-paths.md` shipped through `bb934a4f` without touching `isTestFixture`, so the skip stands exactly as quoted above and this record stays open as filed. The 51-file measurement in the Question section was taken at `7be624e7`.

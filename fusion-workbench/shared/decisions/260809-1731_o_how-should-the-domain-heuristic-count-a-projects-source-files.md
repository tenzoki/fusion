# How should the domain heuristic count a project's source files?

---
**Domain:** code
**Status:** open
**Filed by:** orchestrator
**Cross-references:** shared/issues/260807-1951_o_die-tiefenschranke-der-codezaehlung-sieht-keinen-cargo-workspace.md (the depth defect, with the measured Cargo-workspace evidence, and the record that explicitly asked for this decision); shared/issues/260807-1942_o_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md (the branch-order defect from the same review, fixable independently); circles/260801-1244-guard-rules-write/issues/260805-1830_o_die-domaenenheuristik-meldet-strategic-trotz-cargo-workspace-mit-laufenden-tests.md (the original consuming-project report); shared/issues/260809-1729_c_... (closed as a duplicate of 260807-1951)

---

## Question

`agents/orchestrator.md:118-133` decides a workbench's domain (`code | data | strategic |
knowledge`) partly from two file counts, `code_files` and `data_files`. The counting is wrong
on two independent axes, and both were named by the user this session:

- **Depth.** `code_files` is bounded to "top-level + 1 subdir deep". A project keeping its
  source at `codebase/go/` or `packages/<name>/src/` has none of it at that depth. One
  consuming project reported 13 files counted against roughly 17 500 present.
- **Breadth.** The extension list is `*.go`, `*.ts`, `*.tsx`, `*.py`, `*.js`, `*.rs`,
  `*.java`. Whole source trees are therefore invisible by language, not by depth: C, C++, C#,
  Kotlin, Swift, Ruby, PHP, Scala, Elixir, Zig, shell, SQL, and the single-file component
  formats (`.vue`, `.svelte`) among them. A Kotlin or Swift project counts zero source files
  at any depth.

The counts feed two live branches, so a wrong count changes the domain the whole session
routes on:

```
elif analyses_count > 0 and code_files == 0:   domain = "knowledge"
elif data_files > code_files * 2:              domain = "data"
```

The question is which counting mechanism replaces the current one. It has to be settled
before the fix is written, because the three options below differ in what they can be correct
about, not merely in how they are spelled.

## Options

1. **Keep `find`, widen the depth bound and the extension list.**
   - Pros: smallest change to the existing text; no new dependency; the `-maxdepth` cap that
     kept the scan cheap is already redundant, since the count is capped at 1000 anyway.
   - Cons: an unbounded walk has to prune `node_modules/`, `vendor/`, `dist/`, `build/`,
     `.venv/` and `target/` by hand, or it counts dependency and build output as project
     source and inverts the very ratio it feeds. The prune list is an open set that grows per
     ecosystem, which is the special-case rim that `rules/critical-stance.md` §2 warns about.

2. **Count from `git ls-files` instead of walking the filesystem.**
   - Pros: no depth bound to get wrong and nothing to prune, because build output and vendored
     dependencies are already excluded by the project's own `.gitignore`. **Measured in this
     repository:** 95 tracked source files against the 4 the depth-2 walk returned, and no
     slower (0.011s versus 0.015s). The breadth problem still has to be fixed separately, but
     it is fixed in one list rather than in a list plus a prune set.
   - Cons: needs a fallback for a project not under git, which is the case the current
     mechanism handles without thinking about it. Files present but untracked are invisible,
     which is right for build output and wrong for a source tree somebody forgot to add.

3. **Let the project declare its domain in `CLAUDE.md`, and count only when it does not.**
   - Pros: answers the question the branches actually ask rather than a proxy for it. Follows
     the pattern `**Language:**` and `**Artifact language:**` already establish, so it needs
     no new mechanism, only a third declaration line and a fallback chain.
   - Cons: does not remove the counting code, it only demotes it to the undeclared case, so
     options 1 or 2 still have to be decided for that case. Existing projects have no such
     line and inherit whatever the fallback does.

## Constraints

- Any answer must fix `data_files` in the same pass. It carries the mirror-image defect: five
  extensions under four fixed directory names, with no depth bound at all. Correcting only
  `code_files` moves the `data_files > code_files * 2` ratio rather than correcting it, and
  moves it toward never firing.
- The check runs at every Setup, so it stays cheap. The 1000-file cap is the existing answer
  to that and survives any of the three options.
- Detection is advisory: the user may override the domain at any individual dispatch, and the
  orchestrator may override it in the session log when the number is visibly wrong. The fix
  should not make the detected value harder to override than it is today.

## Recommendation

**User direction, this session:** count deeper *and* broader. Both axes are settled; what
remains open is the mechanism, and the three options above are three ways of being deeper and
broader rather than alternatives to it.

On the mechanism, option 2 with option 3 layered over it: read a declared domain when the
project states one, and otherwise count from `git ls-files` against a widened extension list,
falling back to a pruned `find` for a project not under git. The measurement above is what
recommends 2 over 1 — the same widening costs an open-ended prune list under `find` and
nothing under `git ls-files`.

Worth surfacing before the fix is written, because it may change what gets fixed: once
`code_files` counts a real source tree, the `data_files > code_files * 2` branch becomes very
hard to reach, and it is not obvious that any real project should reach it. If the branch
cannot fire correctly after the counting is sound, the honest fix is to remove it, not to
tune the ratio until it fires.

---
Answered: <set when status moves to _a_>
Implemented: <set when status moves to _i_>
Deferred: <set when status moves to _d_>
Superseded by: <set when status moves to _s_>

# Planning: a project declares its citation-bearing paths

**Status:** Complete
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Started:** 260831-0024
**HEAD at start:** `7be624e7`
**Circle:** none active — everything below landed in the shared stores

## What was planned

The realisation of `260830-1844_*_does-the-citation-helper-read-non-markdown-surfaces-with-the-stamp-as-the-anchor.md`, answered option 5 on 2026-08-31: a project declares its citation-bearing non-Markdown paths as globs in `fusion.json`, and `bin/fusion-citation-check` and `bin/fusion-citation-sweep` add exactly those files to their corpus.

Plan: `260831-0024_*_a-project-declares-its-citation-bearing-paths.md`. Six steps, five to `coder` and one to `analyst`; the dispatch carried `coder, ontocoder, analyst` and no step routes to `ontocoder`, because the only structured-data files the plan touches are `fusion.json` and `templates/fusion.json`, which are configuration held byte-identical to the loader's own test and therefore `coder`'s.

## The four questions the dispatch left open, and what the plan decided

- **Where the configuration lives.** A second top-level key, `citations.extraPaths`, in the loader that already resolves `orchestrator.maxTurns`, with the same per-leaf merge and the same drop-and-name behaviour. `templates/fusion.json` gains a documentation note and declares nothing; `PROJECT_SET_KEYS` gains `"citations"` only at the step where this repository declares its own. A project that declares nothing gets `[]` and no advisory.
- **Whether the sweep reads it too.** Yes, and the reason is that step 4 of the predecessor plan removed a reporter-versus-rewriter corpus split eight days ago; giving the declaration to the checker alone would recreate it one class further out.
- **Whether the blocking gate reads it.** No. A corpus set by an editable declaration would turn a configuration edit into a red suite for everyone who pulls. This is the split already in force between gate and reporter, not a new one.
- **Glob semantics.** git pathspec under `:(glob)`, enumerated by `git ls-files` through `hooks/lib/git.ts` — one mechanism, no fallback, no glob engine written and none shipped, which keeps `hooks/dist/` self-contained. Five branches, disjoint and complete: not a git work tree, refused before git, refused by git, matched nothing, matched files. A declared file is tracked by construction, which closes the gitignored-build-output failure for the routine route without a check.

The fifth question — what the exemptions do outside Markdown — is answered "nothing, and the declaration is what stands in for it", stated in the plan's Approach rather than left implicit.

## Measurements taken while planning, all at `7be624e7`

- The 45 files fusion would declare (`bin/*`, `hooks/*.ts`, `hooks/lib/*.ts` under `:(glob)`): 191 tokens, 167 resolved, 2 dangling, 0 store-prefixed, 16 undecidable, 6 exempt. The 2 dangling are both exhibits at `hooks/lib/citation-scan.ts:319`.
- The 51 files of `hooks/lib/__tests__/**/*.ts`, which fusion deliberately would not declare: 507 tokens, 21 resolved, 90 dangling, 133 store-prefixed. That contrast is the demonstration that a declaration is a judgement a person makes.
- `bin/fusion-citation-sweep --dry-run` reads `rewrites=0` both today and with the 45 declared files added; `residual` moves 2789 → 2804.
- `bin/fusion-citation-check` reads `files=2353 dangling=311 store-prefixed=1 verdict=violations`.
- Head-room: hook tests 398 lines of 2 500; `skills/` 606 bytes of 20 000; `agents/` 9 202 bytes. The plan budgets 225 test lines across four steps and holds `skills/help/SKILL.md` to a net-zero byte delta.

## Records filed

- `260831-0032_*_which-mechanism-enumerates-a-declared-citation-path-and-what-happens-where-git-will-not-answer.md` — the enumerator choice, four options, recommendation option 1. Answered by approving the plan.
- `260831-0033_*_does-the-sweeps-test-fixture-skip-survive-a-project-declaring-its-own-citation-bearing-paths.md` — stays open; nothing in the plan turns on it.
- `260831-0031_*_four-documented-surfaces-still-describe-the-citation-corpus-and-sweep-guard-the-repair-replaced.md` — four claims the predecessor plan left false, in `bin/fusion-citation-check`, `CLAUDE.md` and two `README-hooks.md` rows. Step 5 closes it.
- `260831-0038_*_the-answered-non-markdown-decision-carries-a-store-prefixed-token-that-reddens-the-citation-gate.md` — the answered decision record's own prose carries a store-prefixed exhibit that `workbench-citation-lint.test.ts` fails on. Uncommitted at filing time, so it reddens the suite the moment it is committed.

## Verification

`cd hooks && npx vitest run lib/__tests__/workbench-citation-lint.test.ts lib/__tests__/plan-stopping-section-lint.test.ts lib/__tests__/marker-format-lint.test.ts` — 40 of 41 tests pass. The single failure is the pre-existing violation the last issue above names, in a file this session did not write. All four records filed here are clean against all three gates, including the stopping-section lint over the new plan.

No code, data, or configuration was changed. Read-only apart from the four records and this entry.

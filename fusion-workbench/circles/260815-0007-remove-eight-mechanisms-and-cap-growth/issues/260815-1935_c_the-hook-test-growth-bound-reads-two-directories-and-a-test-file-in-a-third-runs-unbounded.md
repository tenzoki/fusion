The hook-test growth bound reads two directories, and a test file in a third runs unbounded
---
`surface-growth-bound.test.ts` measures the hook-test surface by reading `hooks/lib/__tests__/*.ts` and `hooks/lib/__tests__/helpers/*.ts` and nothing else. Vitest's include pattern is recursive. A test file placed in any other subdirectory of `__tests__/` is therefore executed by the suite and invisible to the bound that is supposed to be counting it. Demonstrated with 3 002 lines — 120 % of the surface's entire 2 500-line head-room — all twelve bound assertions staying green.
---
**Severity:** High. This is the one surface whose bound the Circle's whole Directive rests on, and it is the surface with the cheapest escape.

**Where.** `hooks/lib/__tests__/surface-growth-bound.test.ts:341-350`, the `hook-tests` surface's `files()`:

```ts
files: () => {
  const rels = [
    ...readdirSync(here).filter((f) => f.endsWith(".ts")),
    ...readdirSync(join(here, "helpers"))
      .filter((f) => f.endsWith(".ts"))
      .map((f) => join("helpers", f)),
  ].sort();
  return rels.map((rel) => ({ rel, size: lineCount(join(here, rel)) }));
},
```

Two `readdirSync` calls, neither recursive. `helpers` is named as a literal.

**Verified by execution**, in a detached worktree at HEAD (`9306f0a`) under `git worktree`, never in the main tree:

```
$ mkdir -p hooks/lib/__tests__/unit
$ { ...3000 filler lines + one trivial vitest case... } > hooks/lib/__tests__/unit/bloat.test.ts
$ wc -l hooks/lib/__tests__/unit/bloat.test.ts
    3002
$ cd hooks && npx vitest run lib/__tests__/unit/bloat.test.ts
 ✓ lib/__tests__/unit/bloat.test.ts (1 test) 7ms
$ npx vitest run lib/__tests__/surface-growth-bound.test.ts
 ✓ lib/__tests__/surface-growth-bound.test.ts (12 tests) 39ms
```

The file runs. The bound does not see it. 3 002 lines against a head-room of 2 500.

`hooks/vitest.config.mjs` declares no `include`, so vitest's default `**/*.{test,spec}.?(c|m)[jt]s?(x)` applies and is recursive. The two readers are the only thing that is not.

**Why this is a contradiction and not merely a gap.** The surface's own doc comment, `surface-growth-bound.test.ts:196-199`, states the opposite as the reason the reader was built this way:

> `files()` reads it off the tree — never a written-down list, so a prompt, a skill body or a test file that arrives is measured on the day it arrives rather than on the day somebody remembers to add it here.

`join(here, "helpers")` *is* a written-down list, of one entry. A test file that arrives in `__tests__/unit/` is measured on no day at all.

`README-hooks.md` `### Growth bounds on the shipped text`, `## What no bound covers`, is also wrong here rather than silent. It says the hook-test surface "counts the suite's own `.ts` files, `hooks/lib/__tests__/helpers` included", and then enumerates what falls outside — the three `.mjs` scripts, `hooks/*.ts`, `hooks/lib/*.ts`, `bin/`, `docs/`, the READMEs. A subdirectory of the suite itself is on neither side of that enumeration. The section is explicitly framed as a statement of coverage; this is the one omission that makes the statement false rather than incomplete.

**The same shape, latent, on the other two surfaces.** `agents` (`:313-318`) reads `agents/*.md` non-recursively and `skills` (`:326-333`) takes only `<dir>/SKILL.md` per skill directory. Neither is exploitable today — `agents/` is flat by construction, and `find skills -type f ! -name SKILL.md` returns nothing at HEAD. The skills reader is the one worth watching: a `SKILL.md` that moves prose into a sibling file it instructs the reader to open keeps the context cost and drops out of the count.

**Not a fix, a direction.** The reader is the wrong shape rather than the wrong constant: a recursive walk of `__tests__/` filtered to `.ts` gives the same answer today, needs no baseline change (every current key already sorts identically), and stops naming `helpers` at all. That is one edit in one function. Whether `fixtures/` should be inside the walk is a real question — it holds the goldens, which grow with the surfaces they record — and it should be answered deliberately, not by whichever filter is easiest to write.

**Found by:** coderev, review of `1e29572..9306f0a`, commit `0609945`.

**Resolved:** 260815-2303 by coder. `hook-tests` `files()` is now one recursive `readdirSync(here, { recursive: true })` filtered to `.ts`; the `helpers` literal is gone. The direction the record named was taken as written — the walk covers `fixtures/` too, which holds no `.ts` today, so the measured total is unchanged at 19 453 and no baseline moved. The edit is line-neutral (nine lines out, nine in) because the surface measures this very file and the golden records it at 576. `README-hooks.md:394` now describes the walk instead of the two directories. Verified in a detached worktree at `d33cd22`: `cd hooks && npm test` exit 0, and a probe `.ts` at `__tests__/unit/` was measured (`unit/probe.ts`, total 19 454) where the old reader saw nothing. The two latent cases the record flags — `agents/` flat by construction, and a `SKILL.md` that moves prose to a sibling file — were out of this task's scope and are untouched. `fusion-workbench/shared/history/260815-2303-coder-hook-test-bound-recursive-walk.md`

The growth-bound walk's comment misstates what vitest runs, and the fixtures question was left to the filter

---
`0e8a400` replaced the `hook-tests` surface's two non-recursive directory reads with one recursive
walk. The walk is right and the measured figure is unchanged. The comment justifying it is not:
it says vitest's include is "a `.ts` file at ANY depth under `__tests__/` runs", and that is false —
vitest's default include is `**/*.{test,spec}.?(c|m)[jt]s?(x)`, so a plain `.ts` at any depth is
collected by nothing. The source record `260815-1935` stated this correctly; the fix's comment
restated it wrongly. The same comment is where a reader would look to decide whether `fixtures/`
belongs inside the walk — the one question that record asked to be "answered deliberately, not by
whichever filter is easiest to write" — and it does not answer it.

---
**Severity:** Low. Nothing measures wrong today. What is wrong is the written reason, in the file
whose whole subject is that written-down assumptions about the tree go stale.

**Where.** `hooks/lib/__tests__/surface-growth-bound.test.ts:344-347`:

```ts
// Recursive, because vitest's include is: a `.ts` file at ANY depth under
// `__tests__/` runs, so reading two directories and naming `helpers` was the
// written-down list this reader exists to refuse — a test file one level
// deeper ran and was measured by nothing (issue 260815-1935).
```

**Verified by execution**, 2026-08-15, in a detached worktree at `f4f01b0` with two probe files
added under `lib/__tests__/unit/`:

```
$ npx vitest list | grep unit/
lib/__tests__/unit/probe.test.ts > p        <- collected
                                            <- unit/probe.ts is not listed at all

$ npx vitest run lib/__tests__/surface-growth-bound.test.ts
-   total 19453
+   unit/probe.test.ts 2
+   unit/probe.ts 1
+   total 19456
```

So the walk does reach every depth (the fix's actual claim, and it holds), and it counts files
vitest never runs (which the comment says it does). `hooks/vitest.config.mjs` declares no `include`,
so the default applies. Without the probes the surface measures 19 453 — the figure at the arming —
and the full suite is green at `f4f01b0` (40 files, 751 tests, exit 0), so the edit changed no
measurement.

**Why the wrong reason costs something.** The next reader deciding what belongs in the walk gets
"what vitest runs" as the criterion, and by that criterion `helpers/*.ts` — four files, already
counted, and correctly so, because their lines are maintenance too — do not belong. The criterion
that actually fits the surface is "what the suite's tree costs to maintain and to run", which
includes helpers and settles `fixtures/` on its own terms rather than by accident.

**Fix direction.** Two lines, line-neutral if written carefully (this file is itself on the bounded
surface, and the previous edit was kept nine-in-nine-out for that reason):

1. Correct the claim to what it is — vitest's include is recursive, so a **test** file at any depth
   runs while the old reader saw only two directories.
2. Answer the `fixtures/` question in the comment, either way. Today `fixtures/` holds no `.ts`, so
   both answers measure the same and the choice is free; it will not be free the first time a
   fixture is written in TypeScript. The goldens grow with the surfaces they record, which is the
   argument the source record raised for keeping them out.

**Related, and out of scope here.** The source record also names two latent versions of the same
shape that this task did not touch and that remain open questions rather than defects: `agents/`
is read non-recursively (`:313-318`, safe only because the directory is flat by construction), and
`skills/` takes only `<dir>/SKILL.md` (`:326-333`), so a `SKILL.md` that moves prose into a sibling
file keeps the context cost and drops out of the count. The second is the one worth watching.

**Found by:** coderev, review of `d33cd22..f4f01b0`, commit `0e8a400`.

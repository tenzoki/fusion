Step 5's `paths.ts` reduction depends on step 7a, not step 2, and three of its four deletions
cannot land yet

---

The plan gives step 5 `Dependencies: step 2` and says of `globToRegex`, `matchesPattern`,
`matchesAny` and `collapseSegments` that they are "all of which lose their last caller when
CHECK 3 and the path normalisation go". That is true of exactly one of the four.

Measured on 2026-08-16 at `ec3b6ad` by grepping each export across `hooks/**/*.ts`, excluding
`dist/` and `node_modules/`:

| Export | Caller at HEAD | Removed by |
|---|---|---|
| `globToRegex` | `paths.ts:66`, inside `matchesPattern` | — |
| `matchesPattern` | `paths.ts:96`, inside `matchesAny` | — |
| `matchesAny` | `lib/config.ts:155` (import), `lib/config.ts:736` (`findRelevantDecisions`) | **step 7a** |
| `collapseSegments` | none | step 2, already landed |
| `foldCase` | `tracker.ts:101`, `:306`, `:307` | — |

The plan's own `## Current State` table has this right. Its row reads "`matchesAny`,
`matchesPattern`, `globToRegex` in `hooks/lib/paths.ts` — last caller today `config.ts:736`
(`findRelevantDecisions`)". Step 5's prose then attributes the loss to CHECK 3, which is a
different site. `findRelevantDecisions` is deleted in **step 7a**, which is not landed and sits
behind a user gate on two open questions
(`260816-1915_o_how-much-of-the-configuration-loader-survives-when-its-only-leaf-is-the-turn-budget.md`
and the new configuration file's name).

So a step-5 executor who reduces `paths.ts` to `foldCase` breaks the compile at
`lib/config.ts:155`, and by the same mechanism the previous ordering defect
(`260816-2032_c_*`) documented: `scripts/build.mjs` runs `buildToStaging()` before
`syncIntoDist()`, so a failing compile throws before the prune, and the step's own verification
— that the build prunes the deleted module's compiled outputs — cannot be reached.

**`collapseSegments` alone is genuinely orphaned and was still not deleted.** Deleting it
compiles, but it turns a currently green test file red: `lib/__tests__/paths.test.ts:7` imports
it and `:124-131` is a `describe` block whose whole subject is that function. That file is not
in step 9's edit list, so nothing downstream restores it, and the step-5 dispatch forbids
touching any test file other than the one whose subject is being deleted. Deleting one of four
functions would also leave the mandated header rewrite unable to tell the truth: the header
explains a trailing-separator asymmetry between `collapseSegments` and the matchers, and with
the matchers still present that explanation still has a subject.

**What was executed instead.** The `project-relative.ts` half of step 5 landed in full — the
module and its test file are deleted, the build prunes both compiled outputs, and no importer
survived. `hooks/lib/paths.ts` is untouched.

**Three orders work, and the choice belongs to whoever sequences the remaining steps.**

1. **Split step 5 in two and move the `paths.ts` half behind step 7a.** The `project-relative.ts`
   half is done; what remains is one file, reachable the moment `findRelevantDecisions` goes.
   Cheapest, and it keeps each step's verification true as written.
2. **Fold the `paths.ts` reduction into step 7a.** Step 7a already opens `lib/config.ts` to
   delete `findRelevantDecisions`, so the import at `:155` goes in that same edit; deleting the
   four functions there costs one extra file and removes a step-ordering edge entirely.
3. **Leave it as its own step after 7a.** Same effect as 1, more bookkeeping.

Whichever is chosen, **step 9's edit list needs `lib/__tests__/paths.test.ts` added to it**.
That file's `globToRegex`, `matchesPattern`, `matchesAny` and `collapseSegments` groups lose
their subject when the reduction lands, and no step names the file today. Its `foldCase` group
survives.

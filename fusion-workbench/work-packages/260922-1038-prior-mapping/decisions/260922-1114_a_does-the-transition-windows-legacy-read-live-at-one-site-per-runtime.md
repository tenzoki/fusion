# Does the transition window's legacy read live at one site per runtime, held equal by a test, or does the spec's single-site stop condition fire?

---
**Domain:** code
**Filed by:** planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260922-1045_*_spec-prior-nomenclature-plugin-source.md, 260922-1038-prior-mapping.md, nomenclature.md (this container), 260922-1114_*_does-the-container-store-take-the-name-work-packages-superseding-circles.md

---

## Question

The spec's C9 asks that the legacy read (the plugin reading `circles/`, `planning/` and `consult/` beside the new names from v12 until v13) be "a single mechanism … that a grep for the legacy store name finds at one definition site, so its removal at the closing release is one commit", and its fourth stop clause halts the work at any "consumer of a store name that has no path to the resolver and must carry its own branch". The survey at `57e2b7eb` finds two runtimes that read store names with no path between them: the bash helpers (`bin/fusion-paths` valued the kind stores at `:384`, `:391`, `:400`, `:404`; `bin/fusion-claimed-item` enumerated the container store at `:198`) and the TypeScript hooks, whose store names already live once in `hooks/lib/stores.ts` and are held equal to the layout tree by `hooks/lib/__tests__/path-literal-lint.test.ts` (`:324-330`), with the container store still hard-coded in `hooks/lib/plan-size.ts:97-105`, `hooks/lib/staging-drift.ts:464-469`, `hooks/lib/review-coverage.ts:141`, `hooks/lib/citation-corpus.ts:133,175,255`, `hooks/lib/citation-scan.ts:447,493,512,1092-1098,1240,1293` and `hooks/citation-sweep.ts:575`. The hooks cannot call `bin/fusion-paths` on every run (a Node process spawning bash per hook), and the bash Setup path must not depend on Node. So the legacy read cannot be one grep-findable site across both, and the plan needs a ruling before the window group is executed.

## Options

1. **One definition site per runtime, both derived from the layout tree and held equal by a test.** The tree in `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` gains a window subsection naming the three legacy names beside the new ones; `hooks/lib/stores.ts` carries the same table for the hooks; a new `bin/fusion-stores` prints it for the bash helpers, which call it as they already call `bin/fusion-workbench-root`; the path-literal lint's tree parse is extended to hold all three equal. The closing release deletes the subsection, and the test then fails until both runtime copies drop their legacy entries: one commit, forced rather than remembered.
   - Pros: the existing pattern (the tree defines, `stores.ts` copies, the test pins) extended by one runtime; a grep for a legacy name finds exactly two code sites and one document; no runtime crosses into the other.
   - Cons: a new helper (roster row, header, test); the spec's "one definition site" is read as one per runtime.
2. **The TypeScript definition is the only one, and the bash helpers read it through `node hooks/dist/stores.js`.**
   - Pros: literally one site.
   - Cons: every agent's Setup step then spawns Node twice (`fusion-rules` and `fusion-paths` both reach `fusion-claimed-item`); a plugin whose `dist/` is stale or missing breaks path resolution, which today needs bash alone.
3. **Fire the stop clause**: the work halts before the window group and the user re-rules the window's shape.
   - Pros: the spec's letter.
   - Cons: the stop clause was written against a consumer "that must carry its own branch"; option 1 gives no consumer a branch of its own, it gives each runtime one table.

## Constraints

- Every write lands under a new name only; the legacy names are read, never written (C9).
- The removal at v13 is one commit and cannot be forgotten silently: a test that reads `.claude-plugin/plugin.json` and fails when the major is 13 or later while a legacy entry still stands is the plan's proposed pin.
- `bin/fusion-paths` stays the single resolution point for prompts (`## Path Resolution`); the new helper is called by it, never by a prompt.

## Recommendation

Option 1. It is the mechanism the repository already uses for the shared stores, extended to the container store and to the bash side, and it turns the closing release's removal from a remembered step into a failing test.

---
Answered: 260922-1114_*_plan-prior-nomenclature-plugin-source.md `### Names this plan fixes` — option 1, one definition site per runtime (`hooks/lib/stores.ts`, `bin/fusion-stores`) derived from the layout tree and held equal by a test; confirmed at the plan gate of 260923-0839-implement-prior-nomenclature.md; ruled by user, Kai Stalmann <ks@qantr.com>

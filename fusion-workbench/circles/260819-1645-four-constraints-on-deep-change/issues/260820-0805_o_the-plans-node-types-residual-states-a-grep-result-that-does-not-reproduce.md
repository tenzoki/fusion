# The plan's `@types/node` residual states a grep result that does not reproduce

---

The plan justifies leaving `@types/node` unpinned while `typescript` becomes exact, and states the
justification as a measurement: no emitted declaration in `hooks/dist` references a node type,
"`grep` over all 36 files finds no `import(` type and no `node:` reference".

The second half does not reproduce. `git grep -c 'node:' b91c01c -- hooks/dist` — the same commit
the plan measured at — returns **17 hits across 10 files**, every one of them an
`import … from "node:path"` (or `node:fs`, `node:child_process`) in an emitted `.js`. `hooks/dist`
is byte-identical at `bbfc912`, so the figure is the same today.

The substantive residual survives: those hits are copies of the source's own import statements, not
types drawn from `@types/node`, and the `import(` half of the claim is correct — no `.d.ts` under
`hooks/dist` carries an `import(` type. So the conclusion holds and the sentence supporting it does
not.

---

**Severity:** Low — the conclusion is unaffected; a stated grep result that returns 17 where the
record says 0 is the failure `rules/critical-stance.md` §3 names, in a risk table whose whole value
is that its figures were measured.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `coder`
**Affects:** `circles/260819-1645-four-constraints-on-deep-change/planning/260819-2016_*_four-constraints-on-deep-change.md`
— `## Current State`, the paragraph beginning "The compiler is pinned in one of the two places", and
the `## Risks & Mitigations` row beginning "Declaration emit could in principle depend on"
**Cross-references:** `rules/critical-stance.md` `## 3. Calibrated certainty`

**Verified 2026-08-20.** Commands run and outputs read:

```
git grep -c 'node:'   b91c01c -- hooks/dist   ->  10 files, 17 hits
git grep -c 'import(' b91c01c -- hooks/dist   ->  no output
git diff --stat b91c01c bbfc912 -- hooks/dist ->  no output
```

## Fix direction

Rewrite the parenthetical to say what was actually established — that no `.d.ts` under `hooks/dist`
carries an `import(` type, and that every `node:` occurrence is a runtime import in an emitted
`.js` rather than a type reference. Keep the conclusion; it is sound.

---
**Reconciliation 260820-0830** (reconciler, domain `code`, HEAD `04db0b0`) — **still open,
reproduces, and the counter-measurement in the review does not reproduce either.** Re-run here:
`git grep -c 'node:' b91c01c -- hooks/dist` returns **18 hits across 11 files** (`config.js`,
`events.js`, `git.js` and eight more). The review states 17 across 10. The plan's claim that a grep
over the 36 emitted files finds no `node:` reference is false on any of the three counts, and the
conclusion it supports — that `@types/node` does not reach the emit — is unaffected. Whoever takes
this record should re-measure rather than copy either figure. Marker unchanged.

# coder — the citation checker names the subset no rewriter may touch

**Status:** Complete
**Date:** 2026-09-06
**Filed by:** coder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Task:** make one distinction the citation checker already draws internally visible in its output — the violation rows the tool has itself forbidden anyone to rewrite — without moving `verdict=`, any existing key, or the exit code.

## What was added

One key, `unrewritable-violations`, and one column on each violation row.

The predicate is `hit.reason !== undefined`, evaluated in `hooks/citation-check.ts` as a one-line
helper beside `row()`. That is the same test `hooks/citation-sweep.ts` `rewriteOf()` applies to
decide it will not rewrite a token, so the figure counts exactly the rows the sweep refuses, and it
is read rather than re-derived: nothing in this change looks at which exemption fired, or at the
status, or at the kind.

Each violation row now carries a fifth column after the scope one, `unrewritable` or `rewritable`,
so the figure can be located in the rows rather than only summed. `--undecidable` rows are
unchanged: they carry neither the scope column nor this one, because they reach no verdict at all.

## Why that name

The class is named for what is true of it — no rewriter may touch this token — and not for the
exemption that produced it. Two reasons produce it today (`RESOLUTION_PREMISED_EXEMPTIONS` in
`hooks/lib/citation-scan.ts`), a third could later, and the predicate here is the presence of a
reason rather than its value, so a third arrives counted with no edit at this site.

The complement reads `rewritable`, and the header states in one clause what that does **not** claim:
only that no exemption forbids respelling the token, never that a rewrite exists for it. A dangling
pointer has none, and a reader who took the column for a promise of a mechanical fix would be
misreading it.

## The four constraints, each against the code

1. **`verdict=` keeps its meaning.** The verdict expression is untouched: it still reads
   `edited.length > 0` and nothing else. The new figure is computed after it and never feeds it. The
   test case added below carries an edited unrewritable row and still asserts `verdict=violations`,
   so a project gating on the line today sees what it saw before.
2. **Additive only.** One key inserted after `unedited-violations`; no key removed, renamed or
   recomputed. No row is filtered — the row set is the same set, printed in the same order, with one
   column inserted between the scope column and the free-text problem. `edited-violations` and
   `unedited-violations` are computed from the same expressions as before and remain reproducible.
3. **Named by the property.** See above.
4. **The exit code does not move.** `main()` returns 0 on every path it returned 0 on. Nothing in
   this change reads or writes `process.exitCode`, and the header's exit table is unchanged.

## Measured over this repository, at HEAD with the change built

```
files=2555  dangling=301  store-prefixed=395
edited-violations=0  unedited-violations=696  unrewritable-violations=395  verdict=clean
```

**All 395 store-prefixed rows are unrewritable, and no other row is.** Counted off the row columns:
`store-prefixed` with `rewritable` is **0**, and `edited` with `unrewritable` is **0** — every one of
them sits outside the verdict scope, which is why `verdict=clean` while the figure is 395.

The split by store: **42** under `archive/`, **353** in the live tree. So this repository is the
opposite of the reporting project's case rather than a zero: the class is not consumer-side, it is
large here, and it is invisible in the archive-versus-live split that intuition suggests. The live
353 concentrate in Circle records and their planning and review files — 139 in one Circle, 101 in a
second — which is the fenced-exhibit corpus the answered issue
`260905-1228_*_the-record-example-exemption-silences-a-verdict-that-does-not-depend-on-resolution.md`
measured when it rejected un-silencing the fence.

That all 395 are unrewritable is explained rather than coincidental: this repository swept itself,
so every store-prefixed token a rewriter would have taken is gone, and what stands is exactly what
the sweep declined.

## Scope held

`hooks/lib/citation-scan.ts` and `hooks/citation-sweep.ts` were read and not edited. Which tokens are
judged, which are exempt, and what the sweep rewrites are all unchanged — this change reports a
distinction those two files already draw.

`bin/fusion-citation-sweep`'s header was left alone: the figure is not meaningless without a
cross-reference there, since the check's own header states the sweep-side rule it rests on, and the
sweep header already carries that rule in its `## What the sweep rewrites` section.

`README-hooks.md` names the three scope figures in its `citation-check.ts` row and does not name this
one. It is outside the dispatched scope and is left for whoever widens that row.

## Two gates met, one left red on purpose

`hooks/lib/__tests__/reference-resolution-lint.test.ts` went to `paths` 1632 against its pinned 1631
on the first draft. The whole movement was one token: the new paragraph in the shell header named the
sweep by path, in a file whose every line the gate reads, while the same paragraph in
`hooks/citation-check.ts` costs nothing because the hook sources are scanned records-only. Rather
than re-approve a pinned number, the sentence now says "the sweep named below" — the header names it
by path twice further down — and the gate is green at 1631 with no pin touched.

`hooks/lib/__tests__/fixtures/surface-growth.golden` is left stale, as the dispatch directs. The test
file grew 37 lines (21 711 -> 21 748 in that surface's total), which the `hook-tests` head-room
absorbs: the bound case itself passes and only the golden-comparison case fails. Regenerating it
moves no baseline, and it is the orchestrator's step.

## Verification

`npm test` in `hooks/`: **exit 1**, `Test Files 1 failed | 51 passed (52)`, `Tests 1 failed | 910
passed (911)`. The single failure is the golden above. `hooks/dist/` was rebuilt with `npm run build`
so the compiled output matches the source; `committed-dist.test.ts` passes.

## Files changed

- `/Users/k1/Projects/productive/fusion/hooks/citation-check.ts`
- `/Users/k1/Projects/productive/fusion/bin/fusion-citation-check`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fusion-citation-check.test.ts`
- `/Users/k1/Projects/productive/fusion/hooks/dist/citation-check.js`, `.d.ts` (built)

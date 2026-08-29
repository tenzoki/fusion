# Three mechanism defects in the dist gate and the citation parser

**Status:** Complete
**Agent:** coder
**Circle:** `260819-1645-four-constraints-on-deep-change`
**Task:** Turn 2, task F1 — the three real mechanism defects the review found
**HEAD at start:** `8e7cae7`
**Files changed:**
`hooks/lib/__tests__/helpers/citation-scan.ts` (857 -> 921 lines),
`hooks/lib/__tests__/committed-dist.test.ts` (253 -> 329 lines),
`hooks/lib/__tests__/reference-resolution-lint.test.ts` (1238 -> 1289 lines)

---

## 1. `circleDirs()` learns the archive prefix

Record: `260819-2300_*_circledirs-did-not-learn-the-archive-prefix-that-findrecord-did-so-an-archived-circle-directory-stays-unexpressible.md`.

`circleDirs()` now indexes `circles/<dir>` and `archive/<sweep>/circles/<dir>`, through
`ARCHIVE_SWEEP_RE` — the same one-sweep bound `anchoredUnder()` holds, asked of a directory name
instead of a `relDir`. This is **not a new answer**: it is fix shape 1, which the user chose for
`findRecord()` on 2026-08-19 at the gate on `260819-2213`, applied to the sibling function that was
left out of it. The branch says so, and it states the same cost at the point where it is now paid:
resolution is prefix-tolerant, so a citation of an archived copy and a citation of a live record
sharing its name are the same token and cannot be told apart.

Two things came with it, and neither is a widening of the user's answer:

- **The return type is a `Map<string, string[]>`, not a `Set<string>`.** A bare name set forced the
  caller to synthesise `circles/<dir>` as what the token resolved to, which for an archived Circle
  is a path that is not on disk — a false statement in a file whose own header calls itself a
  measuring instrument. The map carries the real paths, and where a name exists both live and
  archived the verdict is `ambiguous` over both, which is exactly what the Circle-**record** form
  already does (`anchoredAt`). One shape, not two. The signature is internal to the test tree: the
  only callers outside the parser were two `[...circleDirs()][0]` spreads in
  `reference-resolution-lint.test.ts`, both in this task's file set, now `.keys()`.
- **`stamp-name` moved with it.** The bare form `260801-1244-guard-bash-inspection`, with no
  `circles/` prefix, resolves through the same index, so it stopped dangling in the same edit. That
  is one index serving two token classes rather than a second fix.

The function is memoised, like `workbenchIndex()` and for the same reason: it is read once per token
and the tree does not move under a run.

**Measured over the whole workbench corpus** (`npx tsx lib/__tests__/helpers/citation-scan.ts`,
1 648 files, 15 385 tokens): 188 tokens moved from `dangling` to `resolved`, all of them inside the
archive tree, most of them a record citing its own Circle's directory name. The blocking gate's
verdict does not move, because `workbench-citation-lint.test.ts` excludes `archive/` from its corpus
— the fix closes a latency, exactly as the record said it would. Three `circle-dir` tokens still
dangle after it, and they are genuine: `260809-2040-tastenbelegung-als-markdown-in-downloads`
and `260814-1228-one-flow-mandate-to-process-control` name directories that exist neither
live nor archived. Both sit in closed (`_c_`) shared issues, outside this task's file set and outside
the gate's corpus; they are not filed here because nothing new was learned about them.

## 2. The dist gate's artifact case gets its toolchain guard

Record: `…/260820-0805_*_the-artifact-case-of-the-dist-gate-carries-no-toolchain-guard-so-a-mismatch-reddens-it-with-the-wrong-remedy.md`.

The toolchain read moved out of the first case into `readToolchain()` /
`toolchainDisagreement()`, computed as the first statement of `beforeAll` (before any early return,
so a `gitFailure` cannot leave it unread) and stored on `prepared` beside `gitFailure` and
`compileFailure`. The later cases assert it is null first, through one `notEvaluable(subject)`
message that names the toolchain and **nothing else** — it prescribes no rebuild, and says in
words not to run `npm run build` on that failure.

**Both later cases were guarded, not only the artifact case the record names.** Case 2 asserts that
the committed source compiles; under an unpinned compiler its failure prescribes fixing the source,
which is the same wrong remedy one case over. The record's own fix direction asks for "a chain
rather than three independent assertions over one shared compile", and a chain with a hole in the
middle is not one. Where the toolchain agrees, both cases behave exactly as before.

The header's second inaccuracy, which the same record names, is corrected: no case compiles. The
extraction and the compile both happen in `beforeAll`, and what the cases do in order is assert the
preconditions under which their own subject is evaluable.

## 3. The kind list is derived where deriving is possible, and pinned where it is not

Record: `…/260820-0805_*_the-token-for-token-case-restates-gate-kinds-as-a-literal-and-nothing-catches-the-next-drift.md`.

**Deriving the list is not available here, and the reason is the case's own subject.** The
token-for-token case exists to check that two independently-built views agree about which kinds the
gate reads; walking with the imported constant would make them agree by construction and delete the
case. So the literal stays literal, `GATE_KINDS` is exported, and one new case beside it asserts the
two lists name the same kinds — the one question the corpus cannot answer, since a kind the shipped
surface carries no instance of is invisible to any walk over that surface. That is the fix direction
the record itself proposed, and it is the difference between a comment and something that reddens.

## Demonstrations — each fix shown failing

All three in a detached worktree at `8e7cae7` with its own copied `hooks/node_modules`, never in the
live tree. The worktree was removed afterwards.

**Item 2, the sharpest.** A non-pinned compiler was faked in the worktree: `typescript/package.json`
`version` set to `5.9.4`, and `node_modules/.bin/tsc` replaced by a wrapper that compiles with the
real compiler and then appends one line to each emitted `.js` — which is what "a bump changed the
emit" looks like to a byte-for-byte comparison. Control run first, with the real compiler and the
lockfile copied in: 3 passed.

Pre-fix, under the fake, **two** cases red, and the second one is the defect:

> the committed hooks/dist is not the compilation of the committed source.
> differing: the file is committed but its bytes are not what this source compiles to.
> …
> FIX: run `npm run build` in hooks/ and commit hooks/dist alongside the source, in the SAME commit.

with `differing` listing all 18 emitted files. Following that remedy commits a `dist` built by the
unpinned compiler.

Post-fix, same fake, three cases red and the artifact case now says only:

> the toolchain is not the pinned one: hooks/package.json declares 5.9.3, hooks/package-lock.json
> says 5.9.3, and hooks/node_modules carries 5.9.4.
> the comparison against the committed hooks/dist is not evaluable until the toolchain is the pinned
> one, because tsc output is a function of the compiler version. This is NOT an artifact defect and
> NOT a source defect; nothing was concluded about hooks/dist.
> FIX: resolve the toolchain case above (`npm ci` in hooks/), then run the suite again. Do NOT run
> `npm run build` on this failure — that commits a hooks/dist built by the unpinned compiler, which
> is worse than the state it was meant to repair.

The artifact verdict and the `npm run build` remedy are gone from the output. The two failures stay
separately named.

**Item 1.** With the fixed files in the worktree and the archive half of `circleDirs()` deleted
again, the new case reddens:

> resolves an archived Circle directory to its archive path
> AssertionError: expected [ [ 'circle-dir', 'dangling', '' ] ] to deeply equal
> [ [ 'circle-dir', 'resolved', 'archive/260817-1907-safe-cleanup-scoped/circles/…' ] ]

The pre-fix status was also read directly off the parser before any edit: a citation of
`260801-1244-guard-bash-inspection` returned `dangling` with "no such Circle directory under
fusion-workbench/circles/", while the live sibling `260801-1244-guard-rules-write` resolved.

**Item 3.** With `circle-record` removed from the helper's `GATE_KINDS`, the new case reddens and
**the token-for-token case stays green** — which is the whole point of the record, reproduced:

> the gate's kind list moved and this file's copy did not (or the reverse). Bring the literal above
> into line with GATE_KINDS … expected [ 'bare-record', 'circle-dir', …(3) ] to deeply equal
> [ 'bare-record', 'circle-dir', …(2) ]

## Verification

`cd hooks && npm test -- lib/__tests__/committed-dist.test.ts
lib/__tests__/reference-resolution-lint.test.ts lib/__tests__/workbench-citation-lint.test.ts
lib/__tests__/fenced-code-exemption.test.ts` — exit 0, 4 files, 64 tests passed.
(`fenced-code-exemption.test.ts` is not in the task's list; it is the fourth importer of the changed
helper and was run for that reason.)

## Measured and left alone, for the consolidation pass

- **The hook-test growth bound is not over, and it is close.** 20 184 lines against a budget of
  20 375 (floor 17 875 + 2 500 head-room): 191 lines left, with three coders' Turn-2 work in the
  tree. This task's own share is +191 lines net across its three files (+76 `committed-dist`,
  +64 `citation-scan`, +51 `reference-resolution-lint`).
- **`surface-growth.golden` is stale** — its `hook-tests` block no longer matches the tree, so
  `surface-growth-bound.test.ts`'s golden case fails while its bound case passes. Regenerating a
  golden was out of scope for this task by instruction, and the golden covers all three coders'
  files, so one regeneration in the consolidation pass is the right shape.

Nothing was committed, no marker was transitioned, no plan step was marked.

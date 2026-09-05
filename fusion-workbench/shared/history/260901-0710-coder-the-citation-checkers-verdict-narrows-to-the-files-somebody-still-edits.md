# coder — the citation checker's verdict narrows to the files somebody still edits

**Status:** Complete
**Filed by:** coder, Kai Stalmann <kai@stalmann.org>
**Date:** 260901-0710
**Realises:** `260830-2225_*_should-an-archived-violation-move-the-checkers-verdict-line.md` (option 3)
**HEAD at start:** `d30ca04a`

## What was asked

Implement the answer to the decision above: only rows in a file somebody still edits move
`bin/fusion-citation-check`'s `verdict=` line. Every violation stays printed; the scope has to be in
the output; the reporter still gates nothing; the blocking gate's corpus is out of scope.

## What shipped

**The predicate moved out of the gate.** `inCorpus()` and its five constants left
`hooks/lib/__tests__/workbench-citation-lint.test.ts` whole, with their reasoning, and became
`isLiveRecord()` in the new `hooks/lib/citation-corpus.ts`. The gate imports it and keeps the name as
a one-line alias, so every case below reads exactly as it did; nothing about what that gate asserts or
reads changed, and it is green on 13 tests. The module's header carries the corpus reasoning that
travelled with it plus the two judgements the reporter needed and the gate never did.

**The two judgements, made rather than deferred.** The marker-less record kinds — history, analyses,
reviews, consult, memos, investigations — are treated as not edited, stated in the header as a
judgement and not a derivation: a history entry records what was true then, so correcting its citation
falsifies the record rather than repairing it. They fall through the predicate rather than being named
in a clause, so revisiting that judgement means adding a clause and not deleting one. The surfaces
outside the workbench — `CLAUDE.md`, `rules/*.md`, `.claude/rules/*.md`, `docs/**` and every declared
path — are in scope: no marker exists there and every file is live. The predicate is never asked about
them; `hooks/citation-check.ts` scopes them in directly.

**The output.** Three new `KEY=value` lines say what the verdict was computed over — `edited-files`
beside `files`, and `edited-violations` / `unedited-violations`, which sum to `dangling` +
`store-prefixed`. Each violation row carries an `edited` / `not-edited` column between its status and
its problem, so a reader with three hundred rows can see which ones the verdict was taken over.
`--undecidable` rows carry no such column: they reach no verdict by kind, before any scoping question
is asked. No exit code changed and none carries the verdict.

## Files

- `hooks/lib/citation-corpus.ts` — new; the shared predicate and its reasoning
- `hooks/citation-check.ts` — the verdict scope, the new figures, the row column, the header section
- `hooks/lib/__tests__/workbench-citation-lint.test.ts` — imports the predicate; assertions untouched
- `hooks/lib/__tests__/fusion-citation-check.test.ts` — the scope figures on the existing case, plus
  two cases: the same issue under `_o_` and `_c_`, and a project file in scope with no live record
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — pin re-approved, with the measurement
- `hooks/lib/__tests__/fixtures/surface-growth.golden` — regenerated
- `bin/fusion-citation-check` — header states the scope rule and the new lines
- `README-hooks.md` — the `lib/` table row for the new module, and the `citation-check.ts` row
- `hooks/dist/` — rebuilt

## Measurements

| figure | at `d30ca04a` | after |
|---|---|---|
| violation rows printed | 299 | 299 |
| rows that move the verdict | 299 | 2 |
| `verdict=` | `violations` | `violations`, over 2 rows |
| hook tests | 48 files, 835 tests | 48 files, 837 tests |
| hook-test surface | 20 286 lines | 20 266 lines (head-room 89 -> 109) |
| `bin/fusion-citation-sweep --dry-run` | `rewrites=0` | `rewrites=0` |

The verdict did not reach `clean`, and the two rows that hold it are a real finding rather than a
residual of the scoping: `hooks/lib/citation-scan.ts:389` writes two fabricated record names
(`260519-0438-coderev-loader-check` and `260101-0903-dup`, the artifacts the migrate skill
demonstrates) in pointer form inside a file this repository declares in `citations.extraPaths`. They
were dangling before this change and were invisible under 297 rows nobody will repair. The predicate
was not adjusted to reach the word; the repair is the reporter's own remedy, which in a `.ts` file with
no fence available means naming them in prose rather than spelling the token.

The scratch probe: one issue carrying one dead citation reads `verdict=violations` under `_o_` and
`verdict=clean` under `_c_`, with the row printed identically under both and only the scope column and
the three figures differing. It runs on every suite run.

## Residuals, not fixed here

- `skills/cleanup/SKILL.md:221` greps `verdict=`, `store-prefixed=` and `dangling=`. The verdict is now
  scoped and the other two are not, so a cleanup report can read `dangling=299 verdict=clean`. Adding
  `edited-violations` to that grep would resolve it; a skill body was outside this task.
- `CLAUDE.md`'s `bin/fusion-citation-check` row describes the corpus and not the verdict scope. It is
  the curator's gate, not this task's.

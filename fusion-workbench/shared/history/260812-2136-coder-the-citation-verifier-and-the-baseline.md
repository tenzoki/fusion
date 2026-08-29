# Coder session — the citation verifier, and the first count of what already dangles

**Date:** 2026-08-12 21:36
**Agent:** coder
**Status:** Complete
**Plan:** `260812-1720_*_circle-first-placement-and-the-backlog-store.md`, step 11
**Predecessors:** `260812-1938-coder-backlog-store-and-resolver-target.md` (steps 1–3, `3c6ec4e`),
`260812-1954-coder-backlog-keys-enumerations-and-the-move.md` (steps 4–6, `dec40bb`),
`260812-2010-coder-the-playmaker-gains-the-backlog-job.md` (step 7, `6e261c4`),
`260812-2054-coder-the-shaper-becomes-circle-first.md` (step 8, `406ec0d`),
`260812-2116-coder-the-planner-parameter-and-the-three-user-surfaces.md` (steps 9–10, `994fe05`)
**Voice profile:** `bin/fusion-rules coder` emitted `chat-voice-de.yaml` and no
`default-voice-*.yaml`, which is correct — `coder` is not one of the nine long-form-prose agents.
This file follows the artifact language (`en`) with no writing profile, per
`rules/agent-setup.md` `## Voice profiles`.

## What was done

**The step ran with its gate already answered, and that changed what it was for.** Both questions
in the plan's `## Open Questions` were put to the user before implementation began. The move
question was answered *leave it*, so steps 12 and 13 do not run and there is no migration to
verify. What survives the answer is the reason the instrument is worth having anyway: nobody had
ever counted the workbench's dangling citations. The step therefore built the verifier, took the
baseline, wrote it down, and stopped.

**The parser moved to `hooks/lib/__tests__/helpers/citation-scan.ts`, not to `hooks/lib/`.** The
plan allowed either a sibling module or an export the test keeps, and the third option is smaller
than both. A module under `hooks/lib/` is compiled into `hooks/dist/`, ships in the install
tarball, and owes a row to the `README-hooks.md` file table that
`derivable-enumerations-lint.test.ts` diffs against the tree — three costs for code no hook calls.
`lib/__tests__/helpers/` is excluded from `tsconfig`, has a precedent in `prompt-blocks.js`, and
is where a development instrument belongs. Nothing shipped grew.

What moved: the class-(c) grammar and its three regexes, the exemptions, the workbench index,
`findRecord`, and `scanRecordCitations` itself, plus `Violation`, `report()` and `isPlaceholder()`,
which classes (a) and (b) share and which would otherwise have been defined twice.

**The gate asserts what it asserted, and that was checked rather than claimed.** The pre-move file
was read out of git into a second test file and both were run in one vitest process: 29 test names
each, every name appearing exactly twice, all passing. The two files' outputs are the same set,
not a similar one.

**The measuring view is a second view of one parser, not a second parser.** `scanCitationTokens()`
reports per token — kind, status, and what it matched. `scanRecordCitations()` is derived from it
by dropping the measurement-only kinds and folding the rest into violations and a resolved count.
That derivation is what keeps the two honest: there is no second implementation of the grammar to
drift.

Two things the measuring view needs that a gate has nowhere to put:

- **A match COUNT, not a boolean.** The gate asks `hit.length > 0`, so one match and five matches
  are the same answer. A baseline has to separate them — 37 citations in the workbench resolve to
  more than one file, and that is a different defect from resolving to none.
- **The bare stamp.** `260722-1943` in running prose is not a path and the gate deliberately never
  fires on it (`BARE_RE` requires a marker). But "how many tokens can no mechanism resolve" is
  part of the answer, and leaving it in the silence around the number would overstate how much of
  the corpus was judged.

`scanCitationTokens()` therefore has five kinds where the gate has three. `GATE_KINDS` names the
three, and two of the four new tests pin the boundary from each side: a store-prefixless stamp is
a scan token and is invisible to the gate; the gate's verdict over the whole shipped surface
equals the scan's, token for token. A fourth test asserts the four output buckets are MECE over
the tokens, because a baseline stated in three lists is worthless if a count can move between them
unnoticed.

**The fifth kind was added after the first run, and the first run was wrong without it.** The
first pass had one residual class, `timestamp`, and it swallowed 3331 tokens as "resolved but
undecidable" — including every citation of the form `260812-2116-coder-<slug>`, a record named in
full with only its store prefix missing. That is decidable: the slug disambiguates the minute.
Splitting the class in two (`stamp-name`, `stamp-bare`) moved 554 tokens out of the residual and
into the decidable lists, where 441 of them resolve and 111 dangle. The bare stamp, which is what
the plan's Decidability line actually names, is 4074 tokens.

## The baseline

Full table in the plan's `## Reconciliation Log`. The number that matters:

**1454 path-shaped citations in `fusion-workbench/` are dangling today, before any move.** Of
4514 path-shaped citations across 1012 files, 2904 resolve to exactly one file, 1454 dangle, 37
are ambiguous, and 119 are never judged because a parser exemption fired.

The 1454 are four different problems, and the distinction decides what to do next:

| Cause | Count |
|---|---|
| stale marker — the record exists under a different marker | 1104 |
| names nothing on disk | 322 |
| wrong store — the record exists elsewhere | 21 |
| no such Circle directory | 7 |

Beside them, 4074 bare stamps carry no store, no kind and no slug. 2869 match exactly one artifact
today, and that is an accident of one artifact having been written in that minute rather than a
resolution.

## What the measurement says about the two defect records it touches

**`260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`
is concretely worse than filed, and now has its number.** It said "the workbench cites thousands"
and "nothing has counted them". Both stand: 4514 path-shaped citations, and turning the exclusion
on unchanged would fail the suite with 1454 findings. The record was appended to rather than
duplicated.

It also gained a question it did not anticipate. **517 of the 1104 stale markers are in `history/`
files**, which recorded a marker that was correct when they were written. Holding an append-only
session log to the wildcard-citation rule means rewriting history to keep a gate green. Either
`history/` is out of a standing gate's scope or its rule is different, and deciding that moves the
headline number by 47 per cent.

**`260812-1407_*_the-reference-lint-misses-the-lib-spelling-so-three-of-four-citations-into-deleted-modules-stood.md`
is neither better nor worse.** It is a class-(a) defect about plugin-file path spellings; this run
touched class (c) only and scanned a corpus with no plugin-file paths in it. The two records share
a shape — an enumerated grammar that silently reinterprets what it does not recognise — and the
new record filed below cites it for that reason, but nothing here measures it.

## Issues filed

- `260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md`.
  Two grammar gaps found by the run, moving the count in opposite directions: ASCII `...` is not
  read as a truncation where `…` is, manufacturing 54 false danglings; and the retired pre-v4
  bracket marker (`260717-1918[o]`, 171 occurrences) has no case at all, so with a store prefix it
  resolves by prefix accident with the marker unread, and bare it falls into the residual.

**Nothing was fixed.** A dangling-citation sweep is its own body of work and would have buried the
measurement. No citation was rewritten, no marker touched, no file moved.

## Files changed

- `hooks/lib/__tests__/helpers/citation-scan.ts` (new) — the parser, the corpus scan, the CLI
- `hooks/lib/__tests__/reference-resolution-lint.test.ts` — imports it; four tests added, none
  changed, none removed
- `260812-1720_*_circle-first-placement-and-the-backlog-store.md`
  — step 11 `[DONE]`, the gate recorded as answered, `## Reconciliation Log` added
- `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`
  — measured update appended
- `260812-2136_*_the-citation-grammar-reads-one-ellipsis-and-one-marker-syntax-and-the-workbench-uses-two-of-each.md`
  (new)

## Verification

`cd hooks && npm test` — 48 files, 1010 tests, exit 0. The baseline before the step was 48 files,
1006 tests; the four added are this step's boundary tests.

Re-take the measurement with `cd hooks && npx tsx lib/__tests__/helpers/citation-scan.ts`, which
prints the summary; `--dangling`, `--undecidable`, `--resolved`, `--exempt` print the lists, and a
first positional argument points it at a corpus other than this workbench.

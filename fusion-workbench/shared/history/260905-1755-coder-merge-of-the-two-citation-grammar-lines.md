# The merge of the two citation-grammar lines

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Domain:** code

---

## What was dispatched

Merge `origin/main` (`7f9f2f4d`, v10.22.0) into this checkout, resolve twelve conflicts on their
merits, leave the tree green. Rebase forbidden: 33 commits here are cited by hash in this session's
own records. The merge commit is `420b022b`, parents `18bb1f93` and `7f9f2f4d`, merge base
`cda72f71`.

## How the two grammar changes were reconciled

They are orthogonal, and both landed whole. The other line changed **what the grammar reads**:
`LEFT_ANCHOR` and a closed `ROOTING` enumeration in front of the three store-prefixed patterns, a
bare Circle directory as one of those rootings, `SENTENCE_STOP` at both record tails, `[` admitted
in `REC_RE`'s tail, the archive sweep's own directory in `circleDirs()`, `FABRICATED_NAME` as a
word test, `declaredCitationFiles()` for a project's declared non-Markdown paths, and the sweep's
guard (a) asking the corpus question instead of the clean-tree question. This line changed **which
exemption reaches which verdict**: `SHAPE_DECIDED_KINDS` against `RESOLUTION_PREMISED_EXEMPTIONS`,
so a verdict decided from a token's shape is not silenced by an exemption premised on not looking
the token up, and the exemption survives as the hit's `reason`.

Two places needed a decision rather than a take.

**`rewriteOf()` in `hooks/citation-sweep.ts`.** The other line split it into `candidateFor()` plus
the visibility guard `readsBackWhole()`; this line had replaced its refusal test. The merged
function keeps the other line's structure and this line's test: it refuses on
`hit.reason !== undefined`. Every `exempt` hit carries a reason, so the reason test subsumes the
status test it replaces, and it additionally holds the rewriter off a fenced or worked-example
token that the narrowing now reports as `store-prefixed`.

**The reason string on `skills/migrate/SKILL.md`.** This line moved that entry into the new
`RETIRED_LAYOUT_FILES` and kept a string spelling three fabricated record names inline. The other
line had removed those names for a reason that now applies here too: `hooks/lib/citation-scan.ts`
is itself a declared citation-bearing path, so a name spelled in it is a pointer the checker reads.
The other line's wording was carried into this line's new constant.

## What pins the result

From this line, `fenced-code-exemption.test.ts`: a store-prefixed token inside a fence is reported
and keeps `fenced-code` as its reason; the same token inside `rules/decision-record-examples.md`'s
own fence is reported and the gate counts one violation; `skills/migrate/SKILL.md` still exempts
one whole as `retired-layout-file`. From the other line, `citation-grammar-boundaries.test.ts`,
`fusion-citation-check.test.ts`, `config.test.ts`, and `citation-sweep.test.ts`, the release gate
that reads `rewrites=0` over this repository's committed workbench. Shared:
`workbench-citation-lint.test.ts` over the merged corpus.

## The twelve conflicts

| File | Resolution |
|---|---|
| `hooks/lib/citation-scan.ts` | one hunk, the `RETIRED_LAYOUT_FILES` reason string; the other line's wording. Everything else auto-merged and was read through afterwards |
| `hooks/citation-sweep.ts` | the other line's `candidateFor`/`readsBackWhole` structure with this line's reason-based refusal |
| `hooks/dist/citation-sweep.js`, `hooks/dist/lib/citation-scan.js` | never hand-resolved: sources first, then `npm run build` |
| `reference-resolution-lint.test.ts` | both re-approval logs rolled, none dropped; pin re-measured on the merged tree |
| `fixtures/surface-growth.golden` | regenerated with `UPDATE_SURFACE_GOLDEN=1`; `rules-emission.golden` regenerated too, though it did not conflict |
| `.claude-plugin/plugin.json`, `install.sh` | the other line's `10.22.0` |
| `README.md` | the other line's file, with this line's v10.21 upgrade paragraph and `cadence-<checkout>` rename re-applied |
| `README-hooks.md` | three rows: this line's `events-query.ts`, the other line's `citation-check.ts` and `citation-sweep.ts` |
| `fusion-workbench/.fusion-setup`, `.asset-provenance` | this line's; the next setup rewrites both |

## The re-measured pin

`BASELINE` is `{ paths: 1619, anchors: 224, stampBare: 14 }`, measured on the merged tree, with an
entry saying so. The merge base measured 1552/216/11, this line 1603/224/13, the other 1568/216/12,
so the merged delta of +67/+8/+3 is exactly the sum of the two side deltas and no citation was lost
in a conflict resolution. Shares are not taken by single-file revert here: on a merge commit a
revert of one file reverts it to one side rather than to the base.

## What the narrowing cost, measured on the merged corpus

The record that landed the narrowing measured zero store-shaped tokens under either narrowed
exemption over the live workbench. That measurement was taken before this merge. The other line's
workbench carries four live records that fenced a store-prefixed token as a verbatim exhibit, and
`workbench-citation-lint.test.ts` reported ten rows across them. Each was repaired the way the
gate's own failure message prescribes — the store segment named in words or written as a
placeholder, the exhibit's finding kept:
`260831-0748_*_a-storeless-bracket-marked-citation-is-invisible-while-a-store-prefixed-one-is-reported.md`,
`260901-0320_*_the-sentence-stop-lookbehind-does-not-cover-the-bracket-characters-the-record-tail-admits.md`,
`260901-0321_*_a-circle-record-citation-that-ends-a-sentence-produces-no-token-at-all.md`,
`260831-2144_*_repair-three-citation-grammar-defects.md`.

## The sweep census on the merged workbench

`./bin/fusion-citation-sweep --dry-run` — exit 0,
`files=0 rewrites=0 residual=2869 record=0 circle-record=0 circle-dir=0 bare-record=0 stamp-bare=0`.
The residual is the bare stamps the grammar cannot judge, unchanged in kind by this merge.
`./bin/fusion-staging-drift` — `rows=69 unstaged=0 verdict=clean` after the resolution was staged.

## Verification

`cd hooks && npm test` — exit 1, 862 of 864 passing. The two failures are
`surface-growth-bound.test.ts`'s `skills` and `hook-tests` budgets, over by 175 bytes and 391 lines.
Neither side was over on its own, the merge sums both growths, and a baseline moves only after a
cut, so neither was widened. Filed as
`260905-1755_*_the-merge-puts-two-surface-growth-budgets-over-while-neither-line-was-over-on-its-own.md`.

## Filed alongside

`260905-1755_*_the-conventions-still-say-the-citation-gate-exempts-a-fence-after-the-shape-verdict-stopped-being-exempted.md`
— the always-on rule still tells every agent that a fence covers a verbatim citation, which the
shape-verdict narrowing made false for `store-prefixed`. It is what those four records followed.

# Reconciliation — loop 1 of the autonomous defect-closure session

**Date:** 2026-09-05 20:37
**Agent:** reconciler
**Status:** Complete
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Domain:** code
**HEAD:** `5b84b13a`
**Session:** `260905-2008-orchestrator-session.md`

## What was opened and what it cost

23 live defect records (22 `_o_`, 1 `_p_`), 2 open plans, 9 open decisions in the shared store, the
one review that raised six of the open defects, and the September slice of every record store for the
attribution re-measurement. No active Circle, so every store resolved to `shared/`.

`bin/fusion-cadence-anchor` is not on `$FUSION_PLUGIN_ROOT`, so the delta-scoped inventory was not
available and every live-marker record was read in full. That is the guarded fall-back, not a fault.

Nothing on disk was taken on a header's word. Four kinds of evidence were used and each finding below
says which: a command's own output at HEAD, a scanner probe run against this workbench, a read of the
named source line, and `git log`/`git blame`.

## The headline: four records described defects that were already repaired

They cost nothing this session because they were caught here, and they would have cost four dispatches
had they not been.

| record | closed by | evidence |
|---|---|---|
| `260831-2119_*_the-bare-record-tail-class-admits-a-full-stop-so-a-citation-ending-a-sentence-dangles.md` | `4f5834ef` | `SENTENCE_STOP` on both tails; `citation-check \| grep -c "md\.'"` returns 0, was 11 |
| `260831-2120_*_an-archive-sweep-directory-is-in-no-index-so-a-citation-naming-one-dangles.md` | `4f5834ef` | `circleDirs()` indexes each sweep; probe resolves the one bare sweep name in this tree |
| `260901-0318_*_the-fabricated-name-exemption-hides-sixteen-store-prefixed-citations-in-this-repositorys-own-workbench.md` | `7af91d5c` + `d30ca04a` | word test in place; the sixteen swept, 12 files / 16 rewrites; sweep reports `rewrites=0` |
| `260904-1839_*_the-playmaker-writes-a-store-prefixed-circle-citation-into-the-portfolio-it-regenerates.md` | the 260905-1018 playmaker run | regenerated `portfolio.md` carries no store segment; gate green; sweep `rewrites=0` |

Each carries a `Resolved:` note naming the evidence, and each note states what the closure does **not**
cover: the tail fix leaves a run of stops unchanged, the sweep fix leaves a path-form sweep citation
unread, the exemption fix settles only the false-negative direction, and the playmaker's
warnings-still-name-the-files clause is unexercised rather than proven.

## A fifth record whose measurement is wrong by a factor of five

`260904-2215_*_the-reference-resolution-pins-entry-chain-has-an-uncovered-gap-between-1336-and-1517.md`
stays `_o_`. Its defect is real and is a twentieth of the stated size.

The record read `hooks/lib/__tests__/reference-resolution-lint.test.ts` one entry per physical line.
Line 491 is a single line carrying twenty-five chained entries joined by `Earlier: `, running
newest-first from `paths 1517 -> 1520` back to `paths 1336 -> 1350`; `git blame` puts it at `f1099c5f`,
2026-08-29, so it was there when the record was filed. Walking that chain and requiring each entry's
opening figure to equal the next one's closing figure gives **three breaks totalling 35 paths of the
181** — 1466 against 1464, 1462 against 1431, 1376 against 1374 — with every other adjacency exact,
including the two entries that record a decrease.

The correction is appended to the record; the heading is left as filed. The two secondary findings the
record made — the entries below `BASELINE` are not in chronological order, and the chain uses two
connector spellings — both hold at HEAD.

## The two plans

**`260831-2144_*_repair-three-citation-grammar-defects.md`** — `Draft` → `Partially Complete`, steps 1
and 2 marked `[DONE]`. Both landed in `4f5834ef` and both their records close here. Step 3 is unbuilt
and is **blocked on a user ruling, not on work**: `grep -rn IDENTIFIER_HEAD_FIELDS hooks/` is empty and
the blocking decision stands `_o_` with its recommendation withdrawn — a measurement appended to it on
260831-2215 refuted the field-label enumeration on the same evidence that refuted the third candidate,
one label carrying both a citation and a timestamp. Step 4 is half done, incidentally: the version is at
10.23.0 from other work.

Against the plan's seven stopping conditions, five hold and two fail (the third record and the
decision). One reading differs and is not a fault: the plan predicts `dangling=299` and HEAD reads 301,
because the corpus grew from 2 416 files to 2 521 between the plan and now. The rows both steps were to
resolve are gone; what the plan could not foresee is what arrived after it.

**`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md`** — unchanged at `_o_` /
`Partially Complete`, no tick moved. One criterion is between it and closure and it is measurably
closer than the record tracking it says. Re-measured over the September slice: **89 records, 84 with a
person half, 5 without, and all 5 session-history entries.** The last measurement, on 260827, read 34
missing of 62. The criterion is still false as written, so the tick stays.

## Findings this pass produced that no record held

**A second `Filed by:` spelling has appeared.** Nine of the 89 September records write
`**Filed by:** coder (Name <email>, checkout <hex>)` where the rule states `**Filed by:** <agent>,
<person>` with the checkout on its own line. They are not misses — person and checkout are both there —
but any reader counting the mandated form reads them as absent, which is how this pass first counted 14
rather than 5. Appended to the attribution record rather than filed separately, because its fix
direction is where the question belongs.

**Three `_o_` decisions sit inside a closed Circle.** `260904-1619-tracked-checkout-registry-names-each-instance`
carries `_c_` and holds three open decision records. That is consistent with its own closure note
("closed coherent, with one clause that does not hold") and with the marker vocabulary, which keeps
`_o_` and `_a_` as Grounding-Stand whatever the Circle around them does. Recorded, not filed.

**Nothing was misfiled.** No open defect turned out to be a decision wearing an issue's marker, and no
open decision had its answer written down elsewhere — so **no `Answer located:` line was written on any
of the nine**. Each of the nine now carries reconciliation evidence saying where the search looked.

## Three open decisions lean on premises that have moved

None of the three is answered by the movement; each would be answered on different terms now.

- Both `260822-1154_*` records constrain themselves with "the user has rejected declaring a third
  re-baselining moment". A third event exists since 260905: a merge of two in-budget lines, ruled by
  the user and implemented in `9f3dfae4`, with `hooks/lib/__tests__/helpers/growth-bound.ts` now naming
  three. The cut-only question is untouched by it; the comment-prose question keeps its constraint but
  for a smaller reason — the third that was declared is not a recomputation under a changed counting
  rule.
- `260825-1456_*_does-claude-mds-register-repair-reach-the-curators-pass-and-under-what-evidence.md`
  cites the em-dash ceiling's scope question as open, twice, and proposes putting the two to the user
  together. That record now carries `_d_`, deferred on 2026-08-29, so the pairing is unavailable as
  written.

## What the remaining nineteen cost, by whether an executor can move them

**Twelve are executor work.** Six of them are the review's own findings F2 through F7 and share three
files: `260901-0320_*` and `260901-0321_*` are one edit to `hooks/lib/citation-scan.ts` (derive the
sentence-stop class from the tail it closes, and give `CIRCLE_REC_RE` the same ending), `260901-0319_*`
is a third change to the same file, `260901-0322_*` and the sweep half of `260901-0324_*` are both
`hooks/citation-sweep.ts`, and `260901-0323_*` is the only record in the whole set that touches
`hooks/lib/config.ts`. The other six sit alone in their files: `skills/setup/SKILL.md`,
`rules/agent-setup.md`, `hooks/lib/staging-drift.ts`, `skills/cadence/SKILL.md`, the pin chain, and the
deferred dispatch cases, whose own condition (room after a cut) is still unmet.

**Seven cannot be moved by any dispatch.** `260831-2121_*` waits on a decision the user rules;
`260830-2235_*`, `260830-2254_*`, `260830-2247_*` and `260831-0748_*` each end by saying the record
states the defect and stops, with no decidable property proposed anywhere in the tree; `260904-2140_*`
needs a measured failure rate before either branch of its acceptance; and `260828-0044_*` offers the
user a bounded close as its second branch.

So the Directive's first stop condition — every defect record closed — is not reachable by executor
work alone. The count is 12 and 7, and the 7 are named.

## Suite and instrument readings at HEAD, after this pass's writes

- `cd hooks && npm test`: 50 files, 864 tests, green.
- `npx vitest run lib/__tests__/workbench-citation-lint.test.ts`: 13 tests, green.
- `node hooks/dist/citation-check.js`: `dangling=301 store-prefixed=395 verdict=clean`.
- `node hooks/dist/citation-sweep.js --dry-run`: `files=0 rewrites=0 residual=2907`.

The sweep and the gate were re-run **after** every append below, so this pass's own writing introduced
no citation the grammar reports and nothing the sweep would rewrite.

## Every write this pass made

Marker moves, four, all `shared/issues/`:

- `260831-2119` `_o_` → `_c_`
- `260831-2120` `_o_` → `_c_`
- `260901-0318` `_p_` → `_c_`
- `260904-1839` `_o_` → `_c_`

`Resolved:` notes on those four. Reconciliation evidence appended to the 19 records that stay open, to
all 9 open decisions, and to the review `260901-0325-coderev-the-citation-mechanism-v10-20-0-to-v10-21-1.md`
(findings annotated confirmed or resolved; nothing above the annotation rewritten). Status and step
markers on `260831-2144_*`; a reconciliation entry on `260822-1136_*`. A `## Coherence` section appended
to the session history file. No code, data or record description was edited, and no new defect record
was filed — every finding this pass produced landed on the record whose question it belongs to.

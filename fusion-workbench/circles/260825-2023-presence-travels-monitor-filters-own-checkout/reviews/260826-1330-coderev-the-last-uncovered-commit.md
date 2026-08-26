# Code review — the last uncovered commit, the one that corrected the Circle's own counts

**Reviewed-range:** `7774d56..e66f7d5`
**Not-opened:** `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260825-2123-orchestrator-session.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/history/260826-1132-reconciliation.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-0136_c_the-absent-rather-than-empty-rule-has-no-expression-in-any-of-the-three-emit-templates.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/decisions/260825-2140_i_where-do-c4s-hook-test-lines-come-from-when-the-cut-only-circles-room-is-spent.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/reviews/260826-0141-coderev-c4-the-event-log-reader-and-the-writer-on-every-line.md`, `fusion-workbench/circles/260825-2023-presence-travels-monitor-filters-own-checkout/reviews/260826-0910-coderev-c4-turn-2-the-session-identifier-the-cut-and-the-four-templates.md`, `fusion-workbench/shared/issues/260825-1250_o_a-conditional-acceptance-criterion-has-no-notation-for-a-false-antecedent-so-three-passes-re-derived-the-same-explanation.md`
**Reviewer:** coderev, Kai Stalmann <ks@qantr.com>
**Checkout:** 5e8248d7
**Date:** 2026-08-26 13:30

## Summary

One commit, twenty files, of which the seven outside the workbench were the dispatched scope and all
seven were opened. Every one of its four numeric claims was re-derived here from the tree rather than
read back from the commit message, and all four hold: four readers of the checkout-scoped log, two
literal `grep -c` blocks and five Turn-count sites at `8119fc2`, and a citation pin whose entire move
is one rooted heading in one file. The commit is what it says it is.

One finding in the change itself, and it is the shape this Circle exists to find: a correction whose
own supporting reason is wrong. Two further findings are outside the reviewed range and are reported
because they are true now — one of them is a red `npm test` at HEAD.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 0 |
| Medium | 1 (outside the reviewed range) |
| Low | 2 (one inside, one outside) |

## The four claims, re-derived

### 1. The reader count moves from three to four — correct, and the excluded near-miss was excluded rightly

`rules/workbench-tracking.md:59` now reads "Four readers apply that scoping, and three of the four
drop what the fourth keeps", naming the fourth as `agents/orchestrator.md`
`### 3. Post-Session Sequence Diagram`.

The fourth genuinely applies the scoping rather than mentioning a checkout. `agents/orchestrator.md`
`### 3. Post-Session Sequence Diagram` carries, in its rules list:

> **Filter to this checkout before you sort.** Drop every line whose `checkout` differs from the one
> held at Setup step 2; a line carrying none counts as this checkout's own.

and the Phase 4 instruction that reaches it (`agents/orchestrator.md:915`) repeats "drop the lines
another checkout wrote, sort what remains by `ts`". That is the scope-then-sort order the paragraph
calls the whole of the repair, applied to log lines, so it is an applier and not a delegator.

The other three check out: `bin/monitor` scopes in `_read_events` against `_read_checkout_id`, and
`bin/fusion-events`'s two subcommands sit on opposite sides of the asymmetry, which the paragraph
states correctly.

**On the excluded near-miss, `agents/orchestrator.md:558`, my own judgement:** the exclusion is
correct, and for a sharper reason than "it delegates". The paragraph counts readers that *apply* the
scoping to log lines. Line 558 reads no lines at all — it states the definition ("the `turn_start`
events **this checkout wrote** … since this session's `session_start`"), names `bin/fusion-events
turns` as its one implementation, and then forbids deriving it again anywhere. Counting it would make
the sentence wrong in the other direction, by attributing an application to a site whose whole
content is the instruction not to perform one.

**One reader is neither counted nor a counterexample.** `agents/curator.md:111` reads the event log
as corroborating evidence and applies no scoping. It does not falsify a sentence that counts
appliers. It was already found and deliberately left open in the resolution note of
`circles/260825-2023-presence-travels-monitor-filters-own-checkout/issues/260826-1127_*_the-repairs-authoring-home-says-three-readers-scope-by-checkout-and-this-circle-built-a-fourth.md`,
so it is cross-referenced here rather than refiled.

### 2. The two-quantity repair at five sites — both numbers correct, all five texts agree

Measured against the tree at `8119fc2`, not against the commit message.

**Two literal blocks.** `git grep -n turn_start 8119fc2` over `agents skills rules bin hooks CLAUDE.md
README*.md docs` returns exactly two `grep -c '"event":"turn_start"'` blocks:
`agents/orchestrator.md:99` and `skills/setup/SKILL.md:377`.

**Five sites.** Those two plus three prose derivations, each of which names a window after this
session's `session_start` and each of which I read at `8119fc2`:

| Site at `8119fc2` | Form |
|---|---|
| `agents/orchestrator.md:99` | literal `grep -c` block |
| `skills/setup/SKILL.md:377` | literal `grep -c` block |
| `agents/orchestrator.md:547` | Phase 2 step 3, prose definition |
| `agents/orchestrator.md:1111` | the `progress.turn` derivation row, prose |
| `agents/reconciler.md:21` | prose, "the number of `turn_start` events … since this session's `session_start`" |

All five read the one implementation at HEAD: `agents/orchestrator.md:101`, `:558`, `:1122`,
`skills/setup/SKILL.md:388`, `agents/reconciler.md:21`. `grep -rn "four copies"` over `hooks/dist bin
CLAUDE.md rules agents skills README*.md docs` returns nothing.

**The five texts agree.** The three `countTurns` docstrings — `hooks/lib/events-query.ts:371-392`,
`hooks/dist/lib/events-query.js:237-258`, `hooks/dist/lib/events-query.d.ts:203-224` — are
byte-identical, so the two compiled copies match their source. `bin/fusion-events:202-207` and
`CLAUDE.md:43` state the same two quantities in different words; both are true. The one structural
difference is where the trailing "positional and does not survive the union merge" clause attaches:
in `bin/fusion-events` to the three prose derivations, in the docstring to the proposed
last-`session_start` repair. Both attachments are true statements, so this is a rewording and not a
disagreement.

### 3. The citation pin, `1430 -> 1431` paths and `196 -> 197` anchors — independently re-derived

Reproduced against a copy of the tree at `69e7e5a` in a scratch directory, with only
`rules/workbench-tracking.md` replaced by its `7774d56` content:

```
expected { paths: 1430, anchors: 196 } to deeply equal { paths: 1431, anchors: 197 }
```

That is the committed pre-commit pin resolved exactly, so the whole move is that one file's and the
other six shipped files this task touched contribute zero. The attributed token is consistent with
the diff: the replaced sentence carried `bin/fusion-events` twice and `bin/monitor` once, and the new
one carries the same three plus the rooted heading `agents/orchestrator.md`
`### 3. Post-Session Sequence Diagram`, which registers as one path and one anchor at once. The share
is measured rather than apportioned, as the note claims.

### 4. The prose that carries the corrections

Three of the seven files are documentation and each corrected sentence was read against what it now
describes. `rules/workbench-tracking.md:59`, `CLAUDE.md:43` and the `bin/fusion-events` header are all
accurate. One finding, in the fourth documentation surface the commit touched — the re-approval
comment on the citation pin.

## Findings

### Low — the re-approval note's reason for `hooks/dist/` describes a different set of files

`hooks/lib/__tests__/reference-resolution-lint.test.ts:479`:

> And `hooks/dist/` contributes nothing … — `hooks/**.ts` is scanned for class (c) record citations
> only, and that docstring's one record citation was left untouched.

`hooks/dist/**` is not in the gate's scanned surface at all. `surface()`'s two hook loops are
non-recursive and `isFile()`-filtered, so the `hooks/dist` directory is skipped and nothing under it
is ever read. The reason given is the reason `hooks/lib/*.ts` adds no *paths* (`recordsOnly: true`),
and it is offered as the reason for the compiled output, where it does not apply. Worse, the
shorthand `hooks/**.ts` reads as recursive and `hooks/dist/lib/events-query.d.ts` matches it
literally, so a reader concludes a compiled `.d.ts` is scanned records-only when it is not scanned.

Measured, not inferred: a fabricated dangling record citation in a comment in
`hooks/dist/lib/events-query.d.ts` leaves the gate green at 37/37; the identical probe in
`hooks/lib/events-query.ts` fails it and names the line.

The pinned number is right and the "contributes nothing" conclusion is right. What is wrong is the
reason, written expressly so the next re-approver would not have to re-derive it. Filed as
`shared/issues/260826-1330_*_the-citation-pin-note-says-hooks-dist-is-scanned-records-only-and-it-is-not-scanned-at-all.md`.

### Medium, outside the reviewed range — `npm test` is red at HEAD

`hooks/lib/__tests__/workbench-citation-lint.test.ts` fails at `69e7e5a` on one dangling citation in
`shared/issues/260826-1305_o_…md:59`, where the C4 cardinality decision's slug is spelled `how-should`
instead of `how-does`. Line 15 of the same file spells it correctly. The record was added by
`312b1ff`, two commits after the one reviewed here, so `e66f7d5` itself was green. Filed as
`shared/issues/260826-1331_*_npm-test-is-red-at-head-on-a-one-word-slug-drift-in-the-record-that-reports-the-eighth-count.md`.

### Low, outside the reviewed range — the layout tree's consumer column omits `bin/fusion-events`

`rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` names, beside each root-anchored
file, the consumers bound to it at a fixed root-relative path, and the paragraph below says the
column's purpose is what breaks on a move. `hooks/events-query.ts` binds
`fusion-workbench/orchestrator-events.jsonl` (`:56`, read at `:192`) and
`fusion-workbench/agentstate.yaml` (`:328-336`) with no fallback, and appears beside neither. Filed as
`shared/issues/260826-1332_*_the-layout-trees-consumer-column-omits-the-event-log-reader-this-circle-built.md`.

## One observation, deliberately not filed

`CLAUDE.md:43` closes its corrected clause with "Two quantities, not one, and the row states each",
immediately after a sentence that states three numbers (five sites, two literal blocks, three prose
derivations). Which two are meant is unstated, and the four sibling texts name them more directly
("the two quantities in that are different numbers rather than one"). It is a vagueness rather than
an error, and filing it would be manufacturing a finding.

## Cross-cutting

Nothing new. The pattern this Circle named — a count right when written and made wrong by a later
commit touching neither the count nor its referent — recurs once more here, in the finding above, in
the softer form of a *reason* rather than a number. The gap the Circle's own Turn 3 review named,
a gate on the count words themselves, would not have caught it either: there is no count word in
"`hooks/**.ts` is scanned for class (c) record citations only". An instrument that checked stated
scanning surfaces against `surface()` would be a different instrument again, and this one instance
does not justify one.

## Recommended sequencing

1. `260826-1331` first, and before anything else lands: the suite is red for everybody until the slug
   is fixed, and one edit fixes it.
2. `260826-1330` whenever the test file is next open. Correcting the sentence adds no path or heading
   token, so the pin does not move.
3. `260826-1332` when someone is next editing `rules/fusion-workbench-conventions.md`. It moves both
   the always-on rule budget and the citation pin, so it should not ride alone.

## What was not opened, and why

The commit carries twenty files: seven outside the workbench, which were the dispatched scope, and
thirteen workbench records.

All seven shipped files were opened — in full where they are short, and at the changed hunks with
surrounding context where they are not.

Six of the thirteen workbench records were opened. Whole: the two `260826-1127` issue records and the
Z-2 coder history. Through the diff plus a direct read of the clause in question: the planning file's
corrected acceptance criterion 6 and its reconciliation log, and the `Resolved:` note appended to
`circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1110_*_the-merge-driver-unsorts-a-second-event-log-reader-whose-repair-direction-is-positional.md`.
Partially: `reviews/260826-1116-coderev-turn-3-the-count-corrections.md`, header and summary only,
read to match this file's format and not for its findings.

The seven named in `**Not-opened:**` above were left, and the reason is budget rather than judgement
in every case. The reconciliation record is the one worth naming: its three findings are the
commit's subject, and I re-derived all three from the tree instead of reading its account of them,
which is the stronger check but leaves its own text unread.

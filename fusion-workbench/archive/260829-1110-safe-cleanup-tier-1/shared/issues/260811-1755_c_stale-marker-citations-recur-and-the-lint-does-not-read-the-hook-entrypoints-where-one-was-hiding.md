# Stale-marker citations recur, and the lint does not read the hook entrypoints where a third one was hiding

---
**Severity:** Medium
**Domain:** code
**Filed by:** coder, session 260811-1752-coder-task1-stale-marker-citations.md, task 1 of the rebuilt queue
**Affects:** `hooks/lib/__tests__/reference-resolution-lint.test.ts` (its scanned surface), `hooks/*.ts` (the CLI/hook entrypoints), and every agent or skill that renames a record marker
**Cross-references:** `260806-0015_*_zitierform-fuer-workbench-records.md` (the wildcard form this class is supposed to be closed by); `260805-1839_*_acht-zitate-tragen-verfallene-decision-marker…` (the first measured cohort, closed); `260811-1734_*_reduce-the-surface-so-a-claim-cannot-go-stale-in-several-places-at-once.md` (the surface-reduction answer this is an instance of)

---

## The recurrence, which is the reason this record exists

The instance is a two-line fix and is already landed; the pattern is what is being filed.

**Twice in one session** a marker rename turned the whole suite red, and both times the rename and
the citations that named the renamed record were in the same commit's blast radius:

1. `skills/setup/SKILL.md:45` — the previous queue's task 1.
2. `hooks/lib/reverted-copy.ts:32` and `hooks/lib/review-coverage.ts:78` — this queue's task 1,
   both created by commit `1064fec`, which answered twelve decisions, moved twelve markers
   `_o_ → _a_/_d_`, and followed none of them into the citing text.

Two occurrences with the same cause inside one session is a pattern, not an accident. The wildcard
form `_*_` exists precisely so that citing a record does not couple the citing file to the record's
*state*, and it is ratified (`260806-0015`). It is not reaching new text: both of this session's
failures were citations written in the literal form **after** the wildcard form was decided.

The cost is disproportionate to the defect. A one-character mismatch in a comment reddens a
1284-test suite, and because `agents/coder.md`'s report shape derives `Result` from the suite's
exit code, every executor dispatched behind it reports `blocked` regardless of what it achieved
(that consequence has its own record, `260810-0703_*_…`).

## The measured gap, found while sweeping for more of the same

Sweeping the whole shipped surface for literal-marker citations turned up exactly one more, and
where it was is the point:

- `hooks/review-coverage.ts:52` cited `260810-0710_*_…`. That record moved to
  `_d_` **before** this session. The citation was already stale and the gate was green.

It was green because the lint's `surface()` walks `hooks/lib/` and stops there
(`reference-resolution-lint.test.ts:149-153`). The hook and CLI entrypoints one directory up —
`hooks/tracker.ts`, `hooks/guard.ts`, `hooks/review-coverage.ts`, `hooks/state-drift.ts` and their
siblings — carry the same kind of module docstring, citing the same records, and are read by no
scanner. `REC_RE` matches the truncated `…` form fine; nothing ever offered it the line.

So the gate's own reasoning for including `hooks/lib` ("the module docstrings cite the decision
records that shaped the guard, and those citations rot exactly like the markdown surface's")
applies verbatim one directory up, and was not applied there. This is the same shape as the
citation defect itself: a rule stated in one place and not carried to the sibling.

## What was done, and what was deliberately not

Landed in task 1: all three citations rewritten to `_*_`
(`hooks/lib/reverted-copy.ts:32`, `hooks/lib/review-coverage.ts:78`, `hooks/review-coverage.ts:52`).
Suite green, 1284 passed.

Not done, on instruction — this record is where it goes:

1. **Widen the lint's surface to `hooks/*.ts`**, comment lines, `recordsOnly`, exactly as
   `hooks/lib/*.ts` is treated. Cheap and mechanical. Expect it to find more than the one this
   sweep found by hand.
2. **Decide whether anything can carry the rename→citation obligation at all.** The renaming party
   knows the old and new names and is the only party that ever holds both; the citing files are
   found by one `grep`. Whether that becomes a step in the marker-transition convention, a helper,
   or nothing at all is a judgement, not a fix — if it is worth a decision record it should be
   filed as one rather than smuggled in here.

The literal-marker form also survives in four shipped files as *fabricated* examples
(`rules/decision-record-examples.md`, `rules/circle-records.md`, `agents/playmaker.md`,
`skills/migrate/SKILL.md`). Those are correct as they stand — the literal marker is the thing being
illustrated, the records do not exist, and the lint exempts them by pattern. **Do not "fix" them.**

---

## Resolved 2026-08-16 — part 1 only, and part 2 deliberately not

Session `260816-0119`, coder, in one pass with three sibling defects in the same file.

**Item 1 (widen the lint's surface to `hooks/*.ts`) is done.** `surface()` gained a second loop over
the top-level `hooks/` directory on exactly the terms `hooks/lib/` already had — `commentRe`
TS-comment lines, `recordsOnly: true` — with a comment at the loop naming this record and the
`hooks/review-coverage.ts:52` citation that was stale while the gate was green.

**Measured: 8 record citations entered the examined set** (`counts.records` 87 → 95), across
`hooks/guard.ts`, `hooks/review-coverage.ts`, `hooks/session-start.ts` and `hooks/tracker.ts`. The
expectation that it would "find more than the one this sweep found by hand" did **not** hold — every
one of the 8 resolves at HEAD. Nothing in a shipped file needed changing, and none was.

**One thing worth naming, since the dispatch expected a defect there.** `hooks/guard.ts:307` cites
`260812-1232_*_does-the-write-guards-fusion-repo-stand-down-survive-the-loss-of-its-subject.md`
in the **literal-marker** form. It resolves — the record is still `_o_` — so the gate passes it, by
design: an exact-marker citation fails only when the record has moved on. It is a live instance of
exactly the coupling `260806-0015` eliminated, and it will redden the suite the day that decision is
answered. Left as it stands rather than rewritten, because this task's scope was the gate and not
the shipped text, and because rewriting it would have removed the demonstration before item 2 below
is decided.

**Item 2 (can anything carry the rename→citation obligation?) is untouched**, as it should be — the
record itself calls it a judgement rather than a fix. It stays open work; this record's closure
covers item 1 only.

The gate now reads the entrypoints, so the *next* stale marker in one of them turns the suite red at
the moment it goes stale rather than at the moment somebody greps by hand.

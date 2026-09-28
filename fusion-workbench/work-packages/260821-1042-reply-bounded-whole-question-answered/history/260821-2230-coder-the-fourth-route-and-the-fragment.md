# Coder — the fourth route out of the length cap, and the fragment in the clause that forbids fragments

**Date:** 2026-08-21
**Agent:** coder
**Circle:** 260821-1042-reply-bounded-whole-question-answered
**Turn:** 2
**Status:** Complete

## What was asked

Fix two findings from Turn 1's review, both in `rules/user-facing-output.md`, inside 84
bytes of credit against the anchor `e764637` and without spending the hook test suite's
11 remaining lines of head-room.

- `260821-2203_*_a-fourth-route-out-of-the-length-cap-stands-and-the-file-names-it-as-the-remedy.md`
  (High): line 95 sent a writer over the eight-line gate cap into `AskUserQuestion`,
  "which is not line-capped this way", and `## Length` capped that surface's parts
  without ever capping their sum.
- `260821-2212_*_the-new-information-architecture-clause-ends-in-a-fragment-in-the-file-that-forbids-fragments.md`
  (Medium): the clause step 3 added at line 53 ended in a verbless fragment and
  garden-pathed on a conjunction.

## The bytes

| Measurement | Command | Value |
|---|---|---|
| Anchor `e764637` | `git show e764637:rules/user-facing-output.md \| wc -c` | 20 144 |
| Before this Turn | `git show HEAD:rules/user-facing-output.md \| wc -c` | 20 060 |
| After this Turn | `wc -c rules/user-facing-output.md` | 20 062 |

Net against the anchor: **−82 bytes**. Net against the start of this Turn: **+2**. The
credit was 84 and 2 of it was spent, so no further cut was taken and no candidate from
step 5's pool was touched. Per-edit, measured before applying:

| Edit | Delta |
|---|---|
| Line 53 rewritten | +16 |
| Line 95 rewritten | −3 |
| Three `## Length` gate bullets merged into one | −11 |

## Finding 1: how the fourth route was closed

The defect and the three routes this Circle already closed are one defect: material leaves
the count without leaving the reply. The repair therefore had to be the same repair, and
the difficulty was that the obvious form of it needs a number nobody has measured.

**No number was invented.** Line 95's own arithmetic already computes the worst case a
gate may carry: one line of question stem, three option lines and three foreclosure lines,
seven against the cap of eight. That arithmetic holds unchanged on `AskUserQuestion` when
each `description` runs to one line. So the whole-surface budget is the eight the file
already carried, applied to the surface it had exempted, and no decision record was needed
for a magnitude.

**Two edits, at both ends of the route.**

`## Length`, three bullets into one:

    - **Gate prompts: ≤ 8 lines in total**, whatever surface renders them. The question,
      the option labels and the foreclosures all count against that eight,
      `AskUserQuestion` included: its ≤ 6-line question stem, ≤ 4-line option label and
      ≤ 2-line option `description` are ceilings on one field, and where a ceiling and
      the total disagree the total binds. …

`## Questions and gates` line 95, first sentence and last:

    - **A gate carries at most three options, on whatever surface.** … A decision that
      needs a fourth option is too big for one gate: make it smaller, or split the
      decision itself in two.

**Why the merge and not an added bullet.** The record's own fix direction was one new
entry giving the surface a total. That would have left the two per-field bullets standing
as caps that name parts of an output, which is precisely what makes line 108 ("Every cap
above is the budget for the whole output it names") false. Folding the field ceilings
inside the entry that names the output restores line 108 without an exception clause
appended to it, and it pays for finding 2 instead of costing more. Every bullet in
`## Length` again names a whole output.

**The neighbouring half is answered too.** The record flagged "or it splits into two
gates" as the same shape, weaker. The new sentence splits the **decision**, not the gate,
so neither half of it offers a second budget for one decision.

**What the merge dropped, and what it kept.** The `description` justification at line 102
("That field carries the foreclosure, so it is the field the clause above steers writers
towards") restates line 93, which already names the field, so it went as a duplicate.
"Option labels are scannable choices, not paragraphs" is not a duplicate of anything and
was kept, because removing a sentence that is not the defect is outside what was asked.

**What this step does not claim.** The plan's closure note says
`260812-0253_*_agents-answer-a-question-the-user-did-not-ask-and-the-length-caps-do-not-hold.md`
is closed "both halves". This step closed the route that made that claim false. Whether
the record may now be called closed is not asserted here, and the plan text was not
rewritten.

## Finding 2: the clause rewritten

Line 53 now reads:

> The reply answers the question that was asked. What you noticed on the way is filed per
> `rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`, which already
> forbids carrying it in chat, and the reply names each record in one line. If the
> question was where the acceptance criteria are, the answer is the path and the section
> names, plus that one line for each defect you filed.

All three faults the record named are addressed. Sentence 3 has a subject and a finite
verb, so it passes the file's own gate at line 133. The second finite clause carries its
own explicit subject, "the reply names each record in one line", so the conjunction can
no longer attach to the intervening relative clause. And "the two defects you filed" is
gone: "that one line for each defect you filed" points back at the line sentence 2 just
introduced and asserts no count the reader has not met.

The record sketched a wording at +9 bytes. This one is +16 and differs from it, because
the sketch fixed the fragment and the count while leaving the attachment fault in
sentence 2 untouched. The seven extra bytes buy the third fix.

## The citation pin did not move, and no head-room was spent

`hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` stands unchanged at
`{ paths: 1258, anchors: 163, records: 116 }` and its assertion passed on the edited tree.
The one citation in the edited region, `` `rules/fusion-workbench-conventions.md` ``
`` `## Issue and Decision Filing` ``, is kept byte-for-byte in the rewritten line 53. The
`## Length` and `## Questions and gates` edits add and remove no path-shaped token, no
adjacent heading anchor and no record citation: `` `AskUserQuestion` `` and
`` `## Length` `` are neither.

**So no attribution comment was owed and none was written.** The hook test suite still
measures **18 314 lines** across `lib/__tests__/*.test.ts`, unchanged, and all 11 lines of
head-room named in the dispatch survive this Turn. That head-room is itself the subject of
`260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`,
which this step neither closes nor worsens.

## Constraints held

- **No test was added and no gate was built.** `260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
  authorises none until its own measurement runs, and this Turn did not run it.
- **No heading was renamed, added or removed.** Verified:
  `diff <(git show e764637:rules/user-facing-output.md | grep '^#') <(grep '^#' rules/user-facing-output.md)`
  reports no difference. Bullets moved; headings did not.
- **`### Canonical anti-example (a real failure)` is untouched.**
- **The voice profiles were not touched.** Their budget is separate and neither budget
  paid the other.
- **No whole-tree git command was run.** The git commands were `git log`, `git status
  --short`, single-path `git show e764637:<path>` reads and `git diff <path>`.
- **No directory-wide substitution in the issue store.** The two records were appended to
  and renamed one at a time, each named in full. No other file under `issues/` was
  opened for writing.

## Golden regenerated

One golden moved, `hooks/lib/__tests__/fixtures/rules-emission.golden`, regenerated the
way its own header prescribes:

    cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts

which rewrote the fixture and failed on purpose, followed by a run without the flag. The
diff was read before acceptance. It is one substitution repeated across all fifteen agent
blocks, `user-facing-output.md 20060` → `20062`, with each block's `total` up by the same
2. No agent gained or lost a rule file and no other file's size moved. `RULE_BASELINE` was
**not** touched: a regeneration records growth and never clears the bound, and this growth
is 2 bytes against thousands of head-room.

The always-on total for an agent drawing no conditional rule now stands at **94 984**
bytes, against the 86 573 floor and the 98 573 budget.

## Verification

    cd hooks && npm test    → exit 0
    Test Files  40 passed (40)
    Tests  718 passed (718)

`bin/fusion-prose-metric rules/user-facing-output.md` reports 1 em-dash over 2 633 prose
words, rate 0.4 against a permit of 2, verdict ok.

## What this Turn does not claim

Both clauses land unenforced. Nothing observes whether an agent's gate now fits eight
lines, and this step took no reading of that. The residual is the plan's own: an
instruction placed at the writer is overridable under task pressure.

## Files changed

- `/Users/k1/Projects/productive/fusion/rules/user-facing-output.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden`
- `/Users/k1/Projects/productive/fusion/260821-2203_*_a-fourth-route-out-of-the-length-cap-stands-and-the-file-names-it-as-the-remedy.md`
- `/Users/k1/Projects/productive/fusion/260821-2212_*_the-new-information-architecture-clause-ends-in-a-fragment-in-the-file-that-forbids-fragments.md`

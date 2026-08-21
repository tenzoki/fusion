# Coder — the two clauses that reach a project with no profile

**Date:** 2026-08-21
**Agent:** coder
**Circle:** circles/260821-1042-reply-bounded-whole-question-answered
**Turn:** 2
**Status:** Complete

## What was asked

Two findings in `rules/user-facing-output.md`, in the same region and against one budget of
82 bytes.

- Finding A2, `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2201_*_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`
  (Medium): C06's new clause, one formulation per claim, lives only on the chat profile's
  whitelist, and the absent-profile fallback at `rules/user-facing-output.md:32` covers the
  blacklist only. The user decided route 1, move it into the rule file.
- Finding 2, `circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2251_*_the-rules-blacklist-gloss-names-three-part-lists-while-ai04-now-governs-enumeration.md`
  (Low): the blacklist gloss at `:18` named three-part lists while AI04 was renamed
  "Mechanical enumeration" and now governs the shape rather than the count.

## The judgement the task asked for: two edits, not one

They share a cause and not a statement, so they were written as two.

The cause is one. Both clauses reach an agent only through a file that a workbench need not
contain, and the rule file is the surface every agent reads. That is why the two arrived
together and why one pass is right for them.

The statements cannot merge. `:18` is an **inventory** of what another file blacklists, and
its fault is that it names a narrower subject than the entry it summarises. The C06 clause is
a **rule**, and its fault is that the rule file never carried it at all. A single sentence
would have to be one or the other. Putting a normative clause into the comma-separated gloss
list at `:18` would hide a rule inside a description of a different file; putting an inventory
item under `## Vocabulary` would state, as a rule of this file, a summary of another one.

The merge was tested rather than dismissed. A single new bullet naming both habits, one
formulation per claim and a sentence rather than a list, would have given a profile-less
reader both. It would not have made `:18` accurate, because `:18` would still misname AI04.
The gloss repair is owed whatever else is written, so the merge saves nothing and costs the
distinction between the two habits.

## The two edits

**`:18`, five bytes back.** "mechanical three-part lists" becomes "mechanical enumeration".
The gloss now reads as the entry's own `name:` field reads, which is what makes an inventory
line checkable. The record estimated minus 12; the measured figure is minus 5, 27 characters
against 22, both by `printf %s | wc -c`.

**`## Vocabulary`, one new bullet, 85 bytes including its blank line.** Placed directly after
`One name per thing`:

    - **One formulation per claim.** State a claim once. A second wording is not truer.

Three choices inside it are worth recording.

*A bullet, not an appended sentence.* The rule file's bolded lead-in is its lookup surface,
the way `name:` is the profile's. Appending the second habit to the first bullet would
reproduce in the rule file exactly the defect
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`
filed against the profile, one day after it was filed. Two adjacent bullets also show the
reader the distinction that record draws: `One name per thing` fails by variation, and this
one fails by repetition.

*`## Vocabulary` and not `## Length` or the self-review gate.* The clause sits beside its
sibling, which is where the record's route 1 puts it. The five-point check at `:126` was the
alternative and was rejected: a sixth point renames the check, and the file names it as
five-point in its own prose.

*No worked example.* The 82 bytes would not hold one, and its neighbour has carried none
since the step-5 cut removed the `uif-framework.yaml` illustration, so the pair is
consistent rather than lopsided.

## The bytes

| Measurement | Command | Value |
|---|---|---|
| Anchor `e764637` | `git show e764637:rules/user-facing-output.md \| wc -c` | 20 144 |
| Before this task | `wc -c rules/user-facing-output.md` | 20 062 |
| After this task | `wc -c rules/user-facing-output.md` | 20 142 |

Net against the anchor: **minus 2**. The credit was 82 and 80 of it was spent, so **no
further cut was taken** and no candidate from step 5's pool was opened. The sketch example,
`### Example 1: session report` and `### Example 2: activation confirmation` all stand
untouched.

Per edit: the gloss minus 5, the bullet plus 85.

## Constraints held

- **The voice profiles were not opened.** Their budget is separate and neither budget paid
  the other. The four files are byte-for-byte as the previous task left them.
- **No test was added and no gate was built.** `shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
  authorises none until its own measurement runs, and this task did not run it.
- **No heading was renamed, added or removed.** Verified with
  `diff <(git show e764637:rules/user-facing-output.md | grep '^#') <(grep '^#' rules/user-facing-output.md)`,
  which reports no difference.
- **`### Canonical anti-example (a real failure)` is untouched**, verified by diffing that
  section against the anchor.
- **No whole-tree git command was run.** The git commands were `git diff -- <path>`,
  `git diff --stat -- <path>` and single-path `git show e764637:<path>` reads.
- **No directory-wide substitution in the issue store.** The two records were appended to and
  renamed one at a time, each named in full. No other file under `issues/` was opened for
  writing, and `260821-2202` was left exactly as it stands.

## The citation pin did not move, and no head-room was spent

`hooks/lib/__tests__/reference-resolution-lint.test.ts` `BASELINE` stands unchanged at
`{ paths: 1258, anchors: 163, records: 116 }` and its assertion passed on the edited tree.
Neither edit adds or removes a path-shaped token, an adjacent heading anchor or a workbench
record citation: "mechanical enumeration" is prose, and the new bullet carries no backticked
path.

**So no attribution comment was owed and none was written.** All 11 lines of the hook test
suite's head-room named in the dispatch survive this task, and
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2204_*_a-growth-bound-lost-half-its-head-room-against-a-stated-stopping-criterion-and-the-finding-lives-only-in-a-history-log.md`
is neither closed nor worsened.

## Golden regenerated

One golden moved, `hooks/lib/__tests__/fixtures/rules-emission.golden`, regenerated the way
its own header prescribes:

    cd hooks && UPDATE_RULES_GOLDEN=1 npx vitest run lib/__tests__/rules-emission-golden.test.ts

which rewrote the fixture and failed on purpose, followed by a run without the flag. The diff
was read before acceptance and classified with
`git diff -- <golden> | grep '^[+-]' | sed 's/[0-9]\{4,\}//' | sort | uniq -c`: 15 changed
`user-facing-output.md` lines and 15 changed `total` lines, and nothing else. One substitution
repeated across all fifteen agent blocks. No agent gained or lost a rule file and no other
file's size moved.

`RULE_BASELINE` was **not** touched. A regeneration records the size and never clears the
bound, and this movement is 80 bytes against thousands of head-room. The always-on total for
an agent drawing no conditional rule now stands at **95 064** bytes against the 86 573 floor
and the 98 573 budget.

## Verification

    cd hooks && npm test    → exit 0
    Test Files  40 passed (40)
    Tests  718 passed (718)

`bin/fusion-prose-metric rules/user-facing-output.md` reports 1 em-dash over 2 647 prose
words, rate 0.4 against a permit of 2, verdict ok. The task added none.

## What this task does not claim

Both clauses land unenforced, as every clause this Circle has written does. Nothing observes
whether an agent with no `stilwerk/` now states a claim once, and this task took no reading of
that. The residual is the plan's own: an instruction placed at the writer is overridable under
task pressure.

One record is left open by design and is named here so it is not mistaken for an oversight.
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2202_*_two-entry-names-no-longer-cover-their-instructions-and-ai04s-only-example-is-not-a-triad.md`
held its C06 half open pending the answer to finding A2. That answer is now given, and the
answer keeps the profile clause where it is, so the rename that record proposes is now
unblocked. It is a profile edit, which this task was forbidden to make, so the record stays
open and untouched.

## Files changed

Both issue records were closed `_o_` -> `_c_` with a `Resolved:` note, edited one at a time by name.

- `/Users/k1/Projects/productive/fusion/rules/user-facing-output.md`
- `/Users/k1/Projects/productive/fusion/hooks/lib/__tests__/fixtures/rules-emission.golden`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2201_c_the-new-c06-clause-lives-only-in-a-profile-a-project-may-not-have.md`
- `/Users/k1/Projects/productive/fusion/fusion-workbench/circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2251_c_the-rules-blacklist-gloss-names-three-part-lists-while-ai04-now-governs-enumeration.md`

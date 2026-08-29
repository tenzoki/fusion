# Reconciliation — session 260817-2037-orchestrator-session.md, final pass

**Status:** Complete
**Date:** 2026-08-17
**Agent:** reconciler
**Domain:** code
**Dispatched by:** orchestrator, Phase 3
**Session range:** `82a860d..307a696` (3 commits, one per Turn)
**HEAD at reconciliation:** `307a696`
**Active Circle:** none (`.active-circle` absent; `fusion-paths` emitted no `CIRCLE` key, so every
store resolved to `shared/`)

---

## Verdict

The three Turns did what they claim. Every code claim in the session's records was verified against
disk and against the rendered output of the committed build, and none was found overstated. Two
things needed a record: a closed record whose resolution note states a judgement the next Turn
reversed, filed as a new defect, and an open record that did not say why it survived the session,
annotated in place.

| | Reviewed | Updated |
|---|---|---|
| Plans (`shared/planning/`) | 3 | 0 |
| Defects touched by this session | 6 | 1 (evidence appended to `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md`) |
| Decisions (`shared/decisions/` + `circles/*/decisions/`) | 28 active (`_o_`/`_a_`) | 0 |
| Reviews | 2 | 2 (annotated) |
| New defects filed | — | 1 |

No marker was renamed. Every marker on disk already matched ground truth, which the clean working
tree makes checkable: `git status --porcelain` at reconciliation time returns only the three
in-flight entries `bin/fusion-staging-drift` classifies as such (`verdict=clean`), so the committed
names and the on-disk names cannot differ.

## What was verified, and how

**The emitted text carries no foreign identifier.** `stagingSentence()` was rendered from the
committed build (`hooks/dist/lib/staging-drift.js`) with a synthetic report driving both branches,
`record` and `commit-message`. The returned string matches neither `/\b\d{6}-\d{4}\b/` nor
`/\b[0-9a-f]{7,40}\b/`. That is the Directive's acceptance, measured on the artifact the installer
ships rather than on the TypeScript.

**All four forbidden staging shapes reach a clause.** The rendered prohibition reads "`-A`, a
directory argument and a quoted pathspec glob are the over-staging that shape prevents; `-u` stages
a renamed record's deletion and adds nothing in its place, taking that record out of HEAD; an
unquoted shell glob does the reverse". That is `307a696`'s acceptance, and it matches the
measurement table in `260817-2147` row for row.

**The third copy is in line.** `bin/fusion-staging-drift:51-54` reads "the shape's own defect record
is f38f37d, where a `git add -u` over a directory of renamed records staged three deletions and
added nothing". The generalisation over every loosening is gone; the commit hash stays, which is
correct for a `bin/` header that reaches no consuming session.

**The source comments kept their identifiers, as `260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md` said they would.**
`hooks/lib/review-coverage.ts:2,670` still cite `260810-1205`; `hooks/lib/staging-drift.ts:2,29,81,251,366,616`
still cite `260811-0114_*_the-queue-rebuild-and-its-history-file-never-entered-a-commit-and-survive-only-in-the-working-tree.md`, `260811-1141_*_any-workbench-file-whose-name-contains-commit-message-is-classified-as-a-commit-message-and-the-model-is-told-to-delete-it.md` and `f38f37d`. The split the user's gate chose — instruction
emitted, provenance kept in source — holds at HEAD.

**The suite is green and the build is current.** `npm test` in `hooks/`: 35 files, 653 tests, exit 0.
That is the same count all three coder history files report, so no test surface moved after the last
one wrote its log.

## Review coverage — uncovered by construction, not by oversight

`bin/fusion-review-coverage` at HEAD:

```
since=82a860d  head=HEAD  commits=3  reviews=2  unusable=0  uncovered=1  verdict=uncovered
  uncovered 307a696 fix(hooks): the fourth forbidden staging shape reaches a clause…
  review shared/reviews/260817-2147-coderev-turn-2-range-bd2db5c-6b6436d.md range=bd2db5c..6b6436d not-opened=none covers=1
  review shared/reviews/260817-2130-coderev-turn-1-range-82a860d-bd2db5c.md range=82a860d..bd2db5c not-opened=none covers=1
```

The gap is `307a696` alone, and the user chose it at the Turn 2 gate
(`orchestrator-events.jsonl`: `gate_response`, turn 2, "user scoped Turn 3 to both low findings, no
third review pass"). **No review file claims a range it did not open**: both declare a
`**Reviewed-range:**` that tiles exactly the commit it names, both declare `**Not-opened:** none`,
and `unusable=0` says neither declaration failed to parse.

**One standing obligation follows from it.** `260815-2109_*_may-a-circle-close-over-an-uncovered-review-range-and-who-decides.md`
was answered "options 3 then 1: keep coverage advisory with the gap named in the closure note". The
answer is recorded and not realised (option 3, filtering the uncovered set to commits touching
shipped files, is absent from `hooks/lib/review-coverage.ts`), but option 1 is the standing
behaviour, and it puts the obligation on this session's closure note: **the Phase 4 session summary
has to name `307a696` as uncovered and say the user chose it.** Nothing else in the workbench
discharges that.

## Key findings

### 1. A closed record states a judgement the next Turn reversed, and every citation points backward

Filed as `260817-2207_*_a-closed-records-resolution-note-states-a-judgement-head-reversed-and-every-citation-points-backward.md`.

`260817-2130_c_`'s `Resolved:` note ends "The quoted git pathspec glob is not named separately: it
behaves as the directory argument does and is already routed there". `307a696` reversed that on the
reviewer's counter-argument, and the record carries no pointer to the reversal.
`260817-2138-coder-staging-sentence-per-shape-justification.md` §1 carries the same
withdrawn paragraph, likewise unlinked.

`260817-2155-coder-quoted-glob-clause-and-wrapper-header.md` states the supersession
and explains the non-edit: the disagreement is "carried by `260817-2147`'s cross-reference to them,
which is where a reader meets it". A `grep -rn "260817-2130"` over the repository at HEAD shows why
that does not hold — every one of the eight citing sites points **at** `260817-2130`, and the record
points nowhere. The two most likely entrances make it worse: `260817-2132_*_the-staging-sentences-source-comment-attributes-f38f37d-to-git-add-a-while-the-same-file-attributes-it-to-u.md` and the wrapper-header
record both cross-reference `260817-2130` without naming `260817-2147`.

The structural cause is that the issues vocabulary has no supersession. Decisions have
`Superseded by:` and `Retired:`; an issue file has `Resolved:` and nothing else. The new record
carries the fork (annotate, or say in the conventions that a `Resolved:` note is not maintained) and
the instruction not to hand-fix before it is answered.

### 2. `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md` is genuinely open, and now says why

Verified rather than assumed: no test in `hooks/lib/__tests__/` drives either sentence builder and
asserts on the returned string's identifiers, and `reference-resolution-lint.test.ts` still registers
both modules with `commentRe: TS_COMMENT_RE, recordsOnly: true`, so its stated premise still holds.

Its body did not record why it survived a session that closed the five defects around it. The reason
lived in `agentstate.yaml`, in the event log and in both coder history files, and is now appended to
the record: user decision at the Turn 1 gate, not oversight.

A third item was appended with it. **The gate the record proposes fails on `coverageSentence()` by
construction.** It asks for an assertion that the output carries "no bare short hash" and, separately,
that both builders be driven through their branches. `hooks/lib/review-coverage.ts:678-680` emits
`report.since`, `report.head` and one `c.short` per uncovered commit, so the uncovered branch always
returns short hashes — the consuming project's own, which is exactly what the sentence is for. The
property the defect is about is the identifier's *origin*, not its shape, and the record does not
separate the two.

### 3. The session's own bookkeeping is one Turn behind

Not a defect, and reported rather than filed, because both files are orchestrator-owned and still
in flight at Phase 3:

- `fusion-workbench/agentstate.yaml` (`# Updated: 260817-2142`) stops at Turn 2. `control.turn_start_head`
  reads `6b6436d`, `current_task` is `T2`, and `work_queue` holds `T1` and `T2` only. Turn 3 ran
  after it (`260817-2155-…`) and is absent. An interrupted-session resume would have
  replayed from a stale anchor.
- `260817-2037-orchestrator-session.md` still says
  `**Directive:** (not yet stated — session started with /fusion:setup; awaiting the user's task)`,
  `**Status:** In progress`, and its `## Session log` holds one line, "Setup complete." None of the
  three Turns is logged there.

`orchestrator-events.jsonl` is complete and carries all three Turns, so nothing was lost. The
Directive used for the Coherence verdict below was taken from `agentstate.yaml`
`session.directive`, per the reconciler's own Setup order.

## Misfiled — should be a decision

None found among the six records this session touched. The fork inside the newly filed
`260817-2207` is a decision in substance and is deliberately left inside the defect for now, per the
conventions' borderline rule: the instance is a false statement standing on disk, which is a defect,
and the general question can be split out in a later pass if the user wants it separate.

## Pre-existing classes re-checked, and deliberately not touched

Two classes surfaced during the scan that a reconciliation pass could have "fixed" and must not:

- **Six of the 24 active decision records in `shared/decisions/` carry a `**Status:**` header that
  disagrees with their filename marker** (all six read `open` under an `_a_` marker, and all six
  carry a filled `Answered:` line, so the marker is right and the field is stale).
  `260811-2146_*_…` owns this class and says in terms: do not hand-correct, the
  disagreements are the measurement for the open question of whether the field should exist. Left
  alone. Nothing this session did changed the population.
- **`260810-2032_*_should-the-drift-checks-four-sentences-be-pinned-to-an-approved-baseline-instead-of-screened-by-a-blacklist.md`
  is answered against a mechanism that no longer exists.** `f45f76a` deleted
  `hooks/lib/__tests__/state-drift-detection-lint.test.ts` along with the rest of the state-drift
  machinery, so the pin can never be written and `_a_`→`_i_` is unreachable. This is already tracked:
  `260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
  names this record as one of its two instances. No new record filed, no marker moved.

## Files updated by this pass

- `260817-2207_*_a-closed-records-resolution-note-states-a-judgement-head-reversed-and-every-citation-points-backward.md` — new
- `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md` — reconciliation section appended, marker unchanged
- `260817-2130-coderev-turn-1-range-82a860d-bd2db5c.md` — annotation appended
- `260817-2147-coderev-turn-2-range-bd2db5c-6b6436d.md` — annotation appended
- `260817-2037-orchestrator-session.md` — `## Coherence` section appended
- `260817-2207-reconciliation.md` — this file

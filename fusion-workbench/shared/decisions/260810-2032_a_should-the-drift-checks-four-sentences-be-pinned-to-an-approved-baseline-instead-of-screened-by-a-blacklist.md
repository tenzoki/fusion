# Should the drift check's four sentences be pinned to an approved baseline instead of screened by a blacklist?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator (on the executor of the drift-lint residuals task of session `shared/history/260810-1646-orchestrator-session.md`)
**Cross-references:** `shared/issues/260810-1918_c_the-skip-licence-blacklist-misses-every-negation-that-does-not-use-the-word-not.md`; `archive/260817-1907-safe-cleanup-scoped/shared/issues/260810-0502_*_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`; `rules/critical-stance.md` §4; the queued frozen-state task, filed as `shared/issues/260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`

---

## Question

`hooks/lib/__tests__/state-drift-detection-lint.test.ts` checks that the drift check rides its four
call points by screening the surrounding sentences for a licence to skip. The screen is a blacklist,
and the file's header says so: whether prose instructs or forbids is not decidable by regex, so no
number of added patterns closes the class.

This session added eleven patterns and demonstrated each one failing on its own. It also demonstrated
that the class is still open, rather than asserting it: a licence in the **following** sentence
(*"This is optional for a Turn that produced no commit."*) leaves the scratch prompt at 16 passed.
And the cheaper half the record proposed — widen the sentence scope — turns out not to be cheap but
impossible while the vocabulary is a blacklist, because the Setup window legitimately contains
*"Skip steps 2-6"* and *"skip already-completed tasks"*, both of which the `skip` pattern matches.

The executor named a reformulation that decides the question instead of approximating it, and the
question is whether to build it.

## Options

1. **Keep the blacklist, keep the header honest.** What shipped. Eleven measured forms are closed,
   each with a witness, and the header states plainly that the class is not.
   - Pros: nothing further to build; every pattern is demonstrated; the honest limit is written down
     where a later reader meets it.
   - Cons: the gate's strength depends on vocabulary, and a rewrite of those sentences in different
     words passes. That is the failure mode this whole record family is about, one level up.

2. **Pin the four sentences to an approved baseline.** Normalise the check-mentioning sentences of
   each anchor window and compare them against a baseline text held in the test. The decided question
   becomes *"is this the text a human last approved?"*, which no vocabulary can evade — any
   weakening fails, whatever words it uses.
   - Pros: the same move the write guard made when it stopped classifying shell commands and started
     comparing fingerprints (`rules/critical-stance.md` §4, and the Circle
     `circles/260807-0923-guard-misst-statt-orakelt`). It converts an undecidable question into a
     decided one rather than approximating it better.
   - Cons: roughly 40 lines, plus a re-approval every time those four sentences are legitimately
     reworded. That cost is real and recurring, and it lands on whoever edits the prompt next.

3. **Both, in order.** Keep the blacklist as the cheap first screen and add the pin as the decisive
   one.
   - Pros: a reworded-but-honest sentence fails the pin with a clear message instead of passing the
     blacklist silently.
   - Cons: two mechanisms guarding one property, which is the thicket `rules/critical-stance.md` §2
     warns about unless the second genuinely subsumes the first — and here it does, so option 3 may
     collapse into option 2 on inspection.

## Constraints

- **Sequencing, and this is why the executor did not simply build it.** The queued frozen-state task
  (`shared/issues/260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md`)
  rewrites exactly this prose in `agents/orchestrator.md`. A pin landed
  now would hand that executor a red suite in a file it does not own. Whatever is chosen, the pin
  goes **after** the prompt task, not before.
- The header's stated limit must stay true after any change. If the pin lands, the header stops
  claiming a limit it no longer has; if it does not, the limit stays written down.

## Recommendation

Option 2, after the frozen-state task lands. The reasoning is not that the blacklist is bad —
it is measured, witnessed, and honest — but that this project has already made this exact trade once,
in the guard, and recorded why: an approximation of an undecidable question accumulates patches and
never converges. The 40 lines are known; the re-approval cost is the price of a decided question, and
it falls on a rewrite of four sentences, which is rare.

The counter-argument deserves stating: the pin makes a legitimate prose improvement fail a test, and
a gate that punishes good edits gets routed around. Whoever implements it should make the failure
message say plainly that re-approval is the expected response, not a defect.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: user decision, session `260810-1646` (`shared/history/260810-1646-orchestrator-session.md`)
— **option 2, pin the four sentences to an approved baseline, sequenced after
the frozen-state task.**

Option 3 (keep both mechanisms) was declined, so the blacklist's fate is not settled by this answer
and is not to be read into it. The pin is additive for now; whether the eleven patterns come out
afterwards is a separate call for whoever builds it, to be made against what the pin demonstrably
covers rather than in advance.

**Binding on the implementer:**

1. **Sequencing is not advisory.** The frozen-state task rewrites exactly these four sentences
   in `agents/orchestrator.md`. The pin lands after that task's change is committed, against the text
   that change leaves behind. A pin landed first would hand that executor a red suite in a file it
   does not own.
2. **The failure message carries the answer.** A pin that fails on a legitimate rewording must say, in
   the failure itself, that re-approving the baseline is the expected response and how to do it. This
   was the counter-argument the user was shown when deciding: a gate that punishes good edits gets
   routed around, and the message is the only place that can be prevented.
3. **The normalisation must be stated, not implied.** Whatever it collapses — whitespace, case,
   markdown emphasis, line wrapping — belongs in the test's header, because a reader who cannot
   predict what counts as "the same sentence" cannot predict when re-approval is due.

Implemented:
Retired: `f45f76a` (Circle `260815-0007-remove-eight-mechanisms-and-cap-growth`) — deleted
`hooks/lib/state-drift.ts`, `hooks/state-drift.ts`, `bin/fusion-state-drift` and
`hooks/lib/__tests__/state-drift-detection-lint.test.ts`, so the drift lint this pin was to be
written against no longer exists and neither do the four sentences it screened. The answer stands;
its subject does not, and the three binding clauses above have nothing left to bind. Marker stays
`_a_` — the annotation is scoped to `_a_` as well as `_i_` by
`circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`
(option 1, answered by the user 2026-08-20).

---
**Reconciliation note — reconciler, 260811-0108, at HEAD `e2a34f0`. `_a_` is correct and is
deliberately not advanced.**

Checked, because the sequencing constraint is the whole point of this record. The prerequisite is
`shared/issues/260801-2038_*_session-bookkeeping-froze-at-turn-1-while-three-turns-ran.md` (closed since this record was written)
carries `_o_` on disk and is queued as task 2 of `fusion-workbench/tasklist.md`. No pin exists in
`hooks/lib/__tests__/state-drift-detection-lint.test.ts` — the file's header at `:92-104` states the
undecidability, names the pin as the answer, and records why it has not landed: it would hand the
executor of that prompt task a red suite in a file it does not own. That is the record's own
constraint, honoured in the code rather than only in the record.

The blacklist that shipped instead is present and measured: 27 `SKIP_LICENCES` entries at
`:210-236`, each carrying its own witness `example`. So the state on disk is exactly what `_a_`
means — the answer is recorded, the realisation is not, and the reason it is not is a stated
sequencing decision rather than an omission.

`_a_` → `_i_` is not available until `260801-2038` lands and the pin is written against the text
that task leaves behind.

---

**Reconciliation 260815-1913 (reconciler, HEAD `9306f0a`) — the realisation this record was waiting
for can no longer happen, and the marker is deliberately left at `_a_`.**

The closing sentence above says `_a_` → `_i_` is unavailable until `260801-2038` lands and the pin
is written against the text that task leaves behind. Circle
`260815-0007-remove-eight-mechanisms-and-cap-growth` step 11 deleted
`hooks/lib/__tests__/state-drift-detection-lint.test.ts` together with `hooks/lib/state-drift.ts`,
`hooks/state-drift.ts` and `bin/fusion-state-drift`, in `f45f76a`. There is no drift check, no four
sentences, and no lint to pin. The deletion was put to the user as a one-way door at the plan gate
and accepted on the evidence that the three non-counter rows had never fired in either measured
project (`shared/history/260814-2306-orchestrator-session.md:174`).

**No marker was moved**, for the same reason recorded on
`shared/decisions/260806-1152_a_stash-manifest-dirname-and-pointer-content-duplicate.md`: the open
decision `circles/260801-1244-curator/decisions/260814-1332_*_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md`
owns the question of what marker this state takes, and answering it by renaming a record would
pre-empt it.

This is active Grounding whose subject the Artifact removed, and it is the second of the two records
that flag the Grounding↔Directive edge in this Circle's session-end Coherence verdict.

**Reconciliation 260815-2056 (reconciler, HEAD `bd07ee7`) — the open decision named in the note
above has been answered, and it does not reach this record. Marker unchanged.**

`circles/260801-1244-curator/decisions/260814-1332_*_what-marks-an-implemented-decision-whose-implementation-was-later-deleted.md`
was answered by the user at this Circle's Rebalance gate: option 3, a `Retired:` annotation citing
what removed the implementation, marker stays `_i_`. Twenty-five `_i_` records carry it after this
pass. This record is not one of them. `Retired:` is defined against a removed *implementation*, and
this record's answer was never realised — the record says so itself, in the closing sentence that
made `_a_` → `_i_` conditional on a pin that `f45f76a` deleted the target of.

The residual is filed as its own question: `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — re-verified;
marker unchanged at `_a_`, and the record now wants a user decision rather than another pass.**

Nothing has come back. `hooks/lib/state-drift.ts`, `hooks/state-drift.ts`,
`hooks/lib/__tests__/state-drift-detection-lint.test.ts` and `bin/fusion-state-drift` are all absent
at HEAD; there is no drift check, no four sentences and no lint to pin, so the `_a_` → `_i_`
condition this record set for itself cannot be met by any future work short of rebuilding the
mechanism the user deliberately removed at a one-way-door gate.

One thing the answer left behind is worth separating from the dead half, because it is the part a
deep change can still trip over. The *general* move the answer chose — pin the text to an approved
baseline rather than screen it with a blacklist, on `rules/critical-stance.md` §4 — did survive its
own instance and is in force elsewhere: `hooks/lib/__tests__/reference-resolution-lint.test.ts:702`
carries `BASELINE = { paths: 1178, anchors: 155, records: 102 }` asserted exactly, with a failure
message that names re-approval as the expected response. Whether that shape becomes the convention
is the separate open question `shared/decisions/260816-0711_a_is-count-pinning-the-convention-for-every-gate-that-reports-what-it-examined.md`,
which the user has since answered the other way (probe first, pin as fallback). So this record's
*instance* is dead and its *principle* is live under another record's name.

The residual question this record was parked behind, `circles/260815-0007-remove-eight-mechanisms-and-cap-growth/decisions/260815-2056_*_what-marks-an-answered-decision-whose-answer-can-no-longer-be-realised.md`,
is **still `_o_`** at HEAD. This pass re-measured its population across all 21 `_a_` records in
`shared/decisions/` and found no third instance beyond this record and
`260806-1152_a_stash-manifest-dirname-and-pointer-content-duplicate.md`.

# Should the drift check's four sentences be pinned to an approved baseline instead of screened by a blacklist?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator (on the executor of `R:260810-1918-drift-lint-residuals`)
**Cross-references:** `shared/issues/260810-1918_c_the-skip-licence-blacklist-misses-every-negation-that-does-not-use-the-word-not.md`; `shared/issues/260810-0502_c_the-state-drift-lint-anchors-on-the-phrase-it-checks-and-one-negative-control-is-a-duplicate.md`; `rules/critical-stance.md` §4; queued task `I:260801-2038-frozen-state`

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

- **Sequencing, and this is why the executor did not simply build it.** The queued task
  `I:260801-2038-frozen-state` rewrites exactly this prose in `agents/orchestrator.md`. A pin landed
  now would hand that executor a red suite in a file it does not own. Whatever is chosen, the pin
  goes **after** the prompt task, not before.
- The header's stated limit must stay true after any change. If the pin lands, the header stops
  claiming a limit it no longer has; if it does not, the limit stays written down.

## Recommendation

Option 2, after `I:260801-2038-frozen-state` lands. The reasoning is not that the blacklist is bad —
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
`I:260801-2038-frozen-state`.**

Option 3 (keep both mechanisms) was declined, so the blacklist's fate is not settled by this answer
and is not to be read into it. The pin is additive for now; whether the eleven patterns come out
afterwards is a separate call for whoever builds it, to be made against what the pin demonstrably
covers rather than in advance.

**Binding on the implementer:**

1. **Sequencing is not advisory.** `I:260801-2038-frozen-state` rewrites exactly these four sentences
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

Agents answer a question the user did not ask, and the length caps do not hold

---
Reported by the user on 260812: fusion is verbose, and it affects nearly every agent. He supplied
a worked example that is more useful than the complaint, because everything in the reply is true
and it is still the wrong answer.

---
**Witness:** the user, directly, with a verbatim transcript
**Severity:** high — it is the surface he touches most, and the caps that should govern it exist
and were exceeded
**Affected:** `rules/user-facing-output.md`, the stylometric profiles, every agent's Output Style
section

His question: *"Ich suche die Abnahmekriterien von C3 und die von C1, C2 und C4."*

What came back: two shell commands, then roughly sixty lines — a ten-row table of what he must
verify by hand, a paragraph on which two rows are the interesting ones, a paragraph on a newly
supported point, a section headed "when reading the file", two defects found in passing, and an
offer to fix them.

What he says the answer should have been, and he is right:

    fusion-workbench/circles/<circle-dir>/planning/<stamp>_<marker>_spec-<slug>.md
    Abschnitte ### C1 bis ### C4.

**Why this is not a formatting defect.** The reply is competent. The table is correct, the two
defects it found in passing are real, and every sentence is defensible. It answers *"what should I
know about the acceptance criteria"* when the question was *"where are they"*. No length rule
catches that, and the length rules were in force: `rules/user-facing-output.md` caps a chat reply
at twelve lines and says to count them before sending. The rule exists, it is loaded by every
agent, and it was exceeded by a factor of five.

So the fix is not another rule about length. Something in the corpus rewards thoroughness on a
lookup, and the first job is to find what — candidates are the analysis-shaped instructions
leaking into answering, the writing profile being applied where the chat profile belongs, and the
filing obligation ("every defect discovered MUST be filed") firing during a lookup and dragging its
context into the reply.

Under analysis at `260812-0xxx` (speed, verbosity and rule decay); this record carries the witness.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `rules/user-facing-output.md` still prescribes relocation rather than deletion and states no total budget, so the structural cause the analysis named is undisturbed. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Reconciliation 260821-0412** (reconciler, domain `code`, HEAD `247abfe`; log `circles/260820-2051-style-rules-arrive-and-get-measured/history/260821-0416-reconciliation.md`).
**STAYS `_o_`, and is deliberately not moved to `_d_`.**

`circles/260820-2051-style-rules-arrive-and-get-measured` decided to take none of this record, in
`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2314_*_does-this-circle-take-the-structural-half-of-the-verbosity-record.md`,
and plan step 13's `Closes:` line names this record explicitly as one it does **not** close.

A deferral marker is the user's act, or an agent's proposal the user confirmed
(`rules/fusion-workbench-conventions.md` `## State Markers — issues and planning`). The decision
that deferred this record was answered by the orchestrator during an unattended run and is itself
still `_o_`, so no confirmation exists to carry the marker. It stays open until the user either
confirms that decision, at which point `_d_` is correct and the decision record is the citation, or
overturns it.

Two clauses the Circle did add to `rules/user-facing-output.md` bear on the second half of this
record's title, without closing it: `:105` caps a plain-text gate at three options with the
arithmetic written out, and `:112` caps the `AskUserQuestion` `description` field at two lines. The
structural half, that agents answer a question the user did not ask, is untouched.

---
**Reconciliation 260821-2349** (reconciler, domain `code`, HEAD `9a68760`; log
`circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2349-reconciliation.md`).
**STAYS `_o_`. The rule-text half is closed and verified; the closing act is the user's.**

`circles/260821-1042-reply-bounded-whole-question-answered` overturned the deferral the previous
reconciliation named as one of two outcomes and took both halves of this record. What landed is
verified line by line against the tree at HEAD.

**The unasked-question half is answered in shipped rule text.** `rules/user-facing-output.md:53`
now opens `## Information architecture` with its subject before its ordering: the reply answers the
question that was asked, what the agent noticed on the way is filed under
`rules/fusion-workbench-conventions.md` `## Issue and Decision Filing`, and the reply names each
record in one line. Its worked contrast is this record's own specimen: asked where the acceptance
criteria are, the answer is the path and the section names, plus one line for each defect filed.

**The length half is closed at four routes, not the three the plan surveyed.**
`rules/user-facing-output.md:108` states that every cap is the budget for the whole output it names
with trailing Details included, and that an over-count comes down by cutting rather than by moving
material down the same reply. `:103` gives the session summary a total of 25 lines as well as its
ten-line header. `:49` makes a sketch count against the cap like every other line. And `:102`, from
Turn 2, caps a gate at eight lines in total whatever surface renders it, closing the route that
sent a writer whose plain-text gate was over the cap into `AskUserQuestion`, which the file had
described as not line-capped that way. That fourth route stood in the section the plan's own survey
had read and declared clear (`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2203_*_a-fourth-route-out-of-the-length-cap-stands-and-the-file-names-it-as-the-remedy.md`).

**Why the marker does not move on a reconciler's authority, and it is two reasons.**

First, and it is this record's own argument: the fault reported here is behavioural, not textual.
The record states in its own words that "the length rules were in force", loaded by every agent and
exceeded by a factor of five, and that "the fix is not another rule about length". It names three
candidate causes and asks that the first job be to find which one operates. The Circle removed one
of the three, the filing obligation dragging its context into the reply, and that removal is real.
The other two, analysis-shaped instructions leaking into answering and the writing profile being
applied where the chat profile belongs, were not investigated. The Circle also states plainly, in
`circles/260821-1042-reply-bounded-whole-question-answered/history/260821-2147-coder-the-corpus-is-measured.md`,
that the clauses land unenforced and that whether they change a reply is not observed. Step 1 froze
the pre-change figure for exactly this reason: 2 231 top-level assistant replies over 69
transcripts, 398 of them over the twelve-line cap, in
`circles/260821-1042-reply-bounded-whole-question-answered/analyses/260821-2020-reply-length-baseline.md`,
with the command that reproduces it. Re-running that command is what would turn "the clause is
written" into "the reply changed", and it is one command.

Second, a mechanical bound that has nothing to do with the merits. Closing this record dangles two
citations that spell its `_o_` marker literally, both in
`circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2249_*_spec-style-rules-arrive-and-get-measured.md`,
which is an open spec and therefore inside the corpus
`hooks/lib/__tests__/workbench-citation-lint.test.ts` recomputes on every run. Measured by renaming
and reverting: the gate goes red. Those two citations are repaired first, into the `_*_` wildcard
form, and the rename follows. Filed as
`circles/260821-1042-reply-bounded-whole-question-answered/issues/260821-2349_*_closing-the-plan-and-the-verbosity-record-dangles-seventeen-marker-literal-citations.md`.

**What a closing user should know.** Closing now asserts that the corpus no longer rewards the
wrong answer. That is defensible, because the corpus is the only mechanism this project chose to
change and the change is verified. It does not assert that a reply got shorter, and nobody has
looked. The honest alternative is to leave this open until the frozen baseline is re-run against a
later window, which is also what
`shared/decisions/260816-0740_*_does-the-prose-register-get-a-measurable-gate-and-which-surface-does-it-measure.md`
has been waiting on since it was answered at option 4.

The adjacent record `shared/issues/260812-0253_*_rules-lose-their-effect-during-a-long-dispatch.md`
was neither read nor touched by this pass, as the Circle's own scope requires.

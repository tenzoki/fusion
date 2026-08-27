# Code review: `agents/playmaker.md`, read against two measured fabrications

**Reviewed-range:** `4f7332c..4f7332c`
**Not-opened:** none

The range is a single commit and not a span, deliberately. This pass reviews one shipped
file, `agents/playmaker.md`, as it stands at HEAD. It was not dispatched over a commit
range, so there is no span to tile and `bin/fusion-review-coverage` should read this file
as covering one commit rather than as a reviewer who failed to fill the field. Files
opened: `agents/playmaker.md` in full, plus the comparison set named under each finding.

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>, checkout 5e8248d7

## Summary

Two playmaker runs on 260826 each asserted a fact that the file they named does not carry.
The prompt is not innocent of them, and it is also not the whole cause. The correct
mechanism behind the first failure was in the run's context three times over, so no missing
fact and no unrun helper explains it. What the prompt does contribute is a rationale
contract that makes a fabricated claim look like compliant output: a citation is mandatory
in a rationale, opening the cited file is not, and the one read-scope cap in the whole
agent roster sits four lines above the step that writes the rationale. The prompt also
already contains the exact per-sentence provenance rule both failures needed, bound to one
backlog operation and reaching nothing else.

## Totals

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 3 |
| Medium | 3 |
| Low | 4 |

## Findings by theme

### Theme A: the rationale contract rewards the failure shape

#### A1 (High). A citation is required in a rationale; opening the cited file is not, and the read that would open it is capped

Three sentences, read together.

`agents/playmaker.md:104`, closing Step 2:

> Do not exceed this read scope. Playmaker is a portfolio agent, not a re-analyst — read enough to rank, no more.

`agents/playmaker.md:129`, in Step 3, which runs next:

> Produce a ranked list. The top-ranked Circle gets a one-paragraph rationale citing file paths

`agents/playmaker.md:270`, in `## Output Style`:

> File:line citations in rationales

The rationale is required to carry paths. The read scope that would let the agent open one
of those paths is explicitly capped one step earlier, and the cap's stated criterion is
*ranking*, not *stating*. Step 2's permitted reads (`:100-102`) are decision records, five
session histories, and analysis files cross-referenced from a Grounding snapshot. A Circle's
closure note is not in that list, and the closure note is exactly the file the 260826 run
attributed an estimate of "125 to 185 lines" to.

So the prompt asks for a claim with a path attached and does not ask for the path to have
been opened. A fabricated clause with a citation reads as *more* compliant under this
contract than a hedged clause with none.

**This cap is unique in the roster.** `grep -niE "read enough|no more|not a re-|do not exceed" agents/*.md`
returns two lines, both in `agents/playmaker.md`. No other agent prompt caps its own reads.

**Fix direction.** Add a carve-out at `:104` rather than lifting the cap: reading a file in
order to check a sentence you are about to write is not re-analysis and is not capped. Cost
is roughly one sentence. See the budget note under C3 for where the bytes come from.

#### A2 (High). `## Activation proposal` has no content contract, and it is the surface that is never regenerated

`agents/playmaker.md:177` is the whole specification of the block:

> **Append** a `## Activation proposal` block to the candidate's Circle record. The block contains the rationale, the proposed activation timestamp, and the run identifier of this playmaker session.

"the rationale" is a definite article with no referent defined for this block. Step 3's
one-paragraph constraint (`:129`) governs the portfolio's ranked list, not this append, and
nothing carries a length or content bound across.

**There is no authoring home elsewhere.** `grep -n "Activation proposal" rules/*.md skills/*/SKILL.md`
returns nothing. `rules/circle-records.md` `## Circle record template` names playmaker's
appended sections once, in the paragraph after the template, and only to bind their citation
form to the `_*_` wildcard. So the block's content is wholly at the model's discretion on the
one surface the prompt forbids itself to rewrite.

The 260826-1705 block ran to five paragraphs under four bold leads. The false clause is in
the third, at
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/_t_circle.md:125-126`.

**Fix direction.** Bound the block at `:177`: name what it may contain, and state that a
clause asserting a mechanism, or asserting what a named file says, is written as a quotation
with its path or is not written. This is the repair with the best ratio of bytes to failure
class covered.

#### A3 (Medium). The prompt already carries the exact rule, bound to one backlog operation

`agents/playmaker.md:113`, on merging backlog entries:

> **What you write when you merge is a consolidation, not an idea.** Every sentence in a merged entry traces back to something somebody already filed; the moment you would add a thought the store does not hold, you have filed an entry, and filing is not yours

That is a per-sentence traceability requirement, written in this prompt, in this voice. It
binds the text of a merged backlog entry. It does not reach ranking rationales, activation
proposals, portfolio warnings, or history-log prose, which is every surface the two failures
landed on.

**Fix direction.** Generalise the norm rather than inventing a second one. The prompt does
not need a new argument, only a wider scope for an argument it already makes, which is why
this can be paid for in tens of bytes rather than hundreds.

### Theme B: nothing distinguishes a self-healing surface from a permanent one

#### B1 (Medium). The append-versus-regenerate asymmetry is stated four times as mechanics and never once as a consequence for content

The four statements:

- `:52` Circle record sections are written "by append (never rewriting existing content)"
- `:56` `$PORTFOLIO` is "regenerated in full on every run (overwrite)"
- `:162-170` the wildcard-marker paragraph, which reasons the asymmetry out loud for the
  portfolio: "You overwrite this file in full on every run, and between two runs the records
  you cited move on"
- `:218` the appended sections are "appended with no idempotence guard"

The project has therefore already done this reasoning twice, both times for a citation
defect: a spelled marker that dies at the target's next transition, and a duplicated block on
a re-run. Neither pass extended it to the class of error that actually cost, which is a false
statement of fact. And `:52`'s never-rewriting rule means a later playmaker run cannot correct
its predecessor's append even having noticed it.

The filed defect
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/issues/260826-1815_o_a-ranking-rationale-asserts-a-resolver-behaviour-that-does-not-exist-and-it-stands-in-the-active-record.md`
makes this argument in its section "Why the sentence is worse than a wrong portfolio line".
The prompt makes it nowhere.

**Fix direction.** One clause where the two write modes are already named, at `:52` or `:56`,
saying which errors regeneration corrects and which it does not. This is what tells the agent
to spend its checking budget on the record and the history log rather than spreading it evenly.

#### B2 (Medium). The false mechanism reached three surfaces, two of them permanent

The dispatch and the filed defect locate the sentence in the Circle record. It is in four
places written by the same run:

- `circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/_t_circle.md:125-126`
- `fusion-workbench/portfolio.md:30-31`, the `Recommended next` rationale
- `fusion-workbench/portfolio.md:43`, "It buys scope over nineteen stranded records"
- `fusion-workbench/portfolio.md:138-139` and the identical warning bullet in
  `shared/history/260826-1705-playmaker-direct-dispatch.md`, both under the warning name
  `stranded-records-in-terminal-circles`

The portfolio copies go at the next regeneration. The record and the history log do not.

The warning **name** is the part that bears on the prompt. `stranded-records-in-terminal-circles`
encodes the false mechanism as a warning *category*, and a category is the kind of token a
later run copies forward from the history it reads at `:101`. The defect's stated scope,
"One Circle record", is understated.

### Theme C: what the prompt does not say, measured against its siblings

#### C1 (Medium). Playmaker carries no local grounding contract, and the agent it defines itself against carries the sharpest one in the roster

`agents/consultant.md:18-19`:

> - **Statements must be checkable.** Cite `path:line` when a claim could be wrong. If you cannot cite, mark the statement as **inference:** or **sp[eculation]**
> - **"I believe" / "I think" / "probably" / "likely" are signals to STOP and verify.**

`agents/playmaker.md` spends two paragraphs separating itself from the consultant, at `:12`
and again at `:276`, and both separate the two agents on *subject matter*: conversational
topics versus portfolio mechanics. The honesty contract sits on the consultant's side of that
line and was never claimed by the portfolio side, although both agents produce prose
judgements about project state that other readers act on.

The same local reinforcement is present in `agents/coderev.md:10`, `agents/reconciler.md:8`
and `:188`, `agents/curator.md:66`, `agents/ontorev.md:23`, `agents/analyst.md:286` and
`:289`, and `agents/orchestrator.md:25`. `grep -niE "honest|uncertain|speculat|inference|verified" agents/playmaker.md`
returns one line, `:220`, and there "verified" refers to a timestamp comparison.

**Stated honestly: this is reinforcement, not a missing fact.** `rules/critical-stance.md`
§3 is always-on, is emitted to playmaker, and covers the case: "Reasoned-but-unverified
statements are marked `inference:`. Outright guesses are marked `speculation:`. Neither gets
promoted to fact." Both false sentences were unmarked assertions and both violated it. So
part of this is model error against a correct standing instruction. What the comparison shows
is that seven sibling prompts do not rely on the standing instruction alone and this one does.

#### C2 (Low). The correct mechanism was in the run's context three times, so neither an unread helper nor a missing fact explains failure one

Answering the dispatch's question 2 directly. The prompt names `bin/` helpers only at Setup
(`:16`, `:17`) plus one inline `find` at `:79`, and names no helper as a read to perform when
describing a mechanism. That is true and it is not the cause.

The statement the sentence contradicts was available three times to that run:

- `agents/playmaker.md:40`, its own Scope preamble: "every `SCAN_*` below may name two
  directories — the active Circle's store and the shared one; read both"
- `rules/agent-setup.md` `## What fusion-paths emits`: "A single `SCAN_*` value may name **two
  directories** (the active Circle's and the shared one)"
- `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Two invariants*, item 2:
  "**Every `SCAN_*` always carries both stores** (the Circle in scope and the shared one)"

The last two are always-on emissions, confirmed by running
`"$FUSION_PLUGIN_ROOT/bin/fusion-rules" playmaker`. Re-running `bin/fusion-paths` would have
added nothing the run did not already hold. **Failure one is not a missing-read defect. It is
an assertion made without consulting what had already been read**, which is why A1 and A2 are
about the writing contract and not about adding a helper call.

**inference:** with `.active-circle` absent, which that run's own history log records, every
`SCAN_*` collapses to the shared store alone under invariant 2, so the run's own Setup output
would not have displayed the two-store form. I did not reproduce that output and did not
remove the pointer to try.

#### C3 (Low). Line 40 states the fact as an instruction about the agent's own reads, in weaker words than the invariant

`agents/playmaker.md:40` says a `SCAN_*` "may name two directories". The conventions invariant
says it "always carries both stores". "May" is the weaker modality, and the parenthetical is
framed as guidance for how playmaker reads its own targets, not as a statement of what any
agent's scan set contains. A model asking "what did closing that Circle do to other agents'
scope" does not meet the answer in the shape of an answer.

**Fix direction is a word, not a sentence:** "may name" to "carries both stores when a Circle
is in scope", matching `bin/fusion-paths`'s own header. Roughly byte-neutral.

#### C4 (Low). The prompt's only verify-before-you-write instruction is a freshness check

`agents/playmaker.md:216`:

> **Read the stamp before you write anything.** Open the portfolio the `**Proposal source:**` line names and compare its header's `**Generated:**` value against the stamp in that line.

Two hundred and eighty-one lines, one instruction of this shape, and it checks whether a file
is current rather than whether a claim is true. The prompt can express the requirement. It
expresses it once, for a stamp.

#### C5 (Low). Where the bytes come from

`agents/` is at 417 796 bytes against a budget of 417 843 (baseline 399 843 plus 18 000 head
room), measured by summing `AGENT_BASELINE` in
`hooks/lib/__tests__/surface-growth-bound.test.ts:247` against the current tree. **47 bytes
free.** No repair above fits in that, so each needs a named cut, and both cuts are inside
this same file.

- `agents/playmaker.md:12`, the consultant boundary paragraph, 418 bytes. It is restated at
  `:276`, which back-references it: "(see the boundary paragraph at the top of this prompt)".
  The `## Boundary notes` entry is the canonical placement. Deleting `:12` and its blank line
  frees about 419 bytes.
- `agents/playmaker.md:281`, the orchestrator boundary entry, 322 bytes. It restates `:179-183`
  including the `--write-activation` alias, which is by then the third statement of that alias
  in the file (`:63`, `:180`, `:281`). Deleting it frees about 323 bytes.

Either cut alone pays for A2 and A3. Both together pay for A1 as well. `agents/playmaker.md`
is 38 953 bytes, second largest in the surface after the orchestrator, so the cuts are
affordable within the file that needs the additions and no other surface is touched.

## Cross-cutting observations

**The failures share one shape and the prompt has one hole shaped like it.** Both sentences
asserted the content of a source without opening it: one about what `bin/fusion-paths` does,
one about what a closure note says. The prompt requires a citation and never requires the
citation to be true; it caps the read that would establish truth; it defines the section that
carried the worse instance with four words; and it holds the per-sentence provenance rule that
would have stopped both, scoped to backlog merges.

**The prompt's own reasoning got there twice and stopped one step short.** The wildcard-marker
paragraph and the idempotence paragraph both reason from "this surface is regenerated, that one
is appended". Both conclusions are about citations. Neither is about content. The step from
"a stale marker in a Circle record is permanent" to "a false sentence in a Circle record is
permanent" was never taken, and it is one clause long.

**The honesty contract was partitioned with the agent boundary.** Playmaker is defined by
contrast with the consultant on subject matter, and the consultant's checkability rules stayed
with the consultant. Seven of fifteen agent prompts locally restate the always-on
calibrated-certainty norm. The two that produce the most confident prose about project state
are the consultant, which restates it twice, and the playmaker, which does not restate it at all.

## Recommended sequencing

1. **A2** first. Smallest text, bounds the surface that cannot be corrected once written.
2. **A3** with it, in the same edit. It is a scope widening on an existing sentence.
3. **A1** next, and it needs the second cut named in C5.
4. **B1** and **C3** are cheap and can ride along.
5. **B2** is a workbench correction, not a prompt change, and does not block a release.

None of these is a release blocker. The class of error is a wrong reasoning input written into
a durable record read by every agent dispatched under that Circle, which is worse than a wrong
report and less than a broken mechanism.

## Answer to the dispatch's four questions

1. **Does the prompt ask the agent to verify claims of this kind?** No. It requires a citation
   in a rationale (`:129`, `:270`), caps the read that would check one (`:104`), and holds its
   one per-sentence traceability rule on backlog merges alone (`:113`).
2. **Does it tell the agent to run the helpers whose behaviour it describes?** Only at Setup,
   and that is not the gap: the correct mechanism was already in the run's context three times
   (C2).
3. **Is `## Activation proposal` wrong-proof?** No. `:177` is its entire contract and no rule
   file or skill body supplements it (A2).
4. **Where else can the shape reach?** Every surface, and the prompt draws no line between the
   portfolio, which regenerates, and the Circle record and history log, which do not (B1, B2).

---
Reconciled 260827-2034: the two records this review filed (`issues/260826-1901_*`, `issues/260826-1902_*`) closed in `3cb2cba` (Theme A read cap and rationale binding, Theme B content contract on `## Activation proposal`); the stale-Grounding criterion of Theme C landed in `e7c0440` (`shared/issues/260826-1445_*` closed). Findings left as written.

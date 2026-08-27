The playmaker's rationale contract requires a citation and caps the read that would check it

---
`agents/playmaker.md` tells the ranking step to write a rationale citing file paths, and four
lines earlier tells the agent to read no further than ranking requires. A citation is
mandatory; opening the cited file is not. The prompt also restates none of the always-on
calibrated-certainty norm that seven sibling prompts restate locally.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** High. It is the writing contract behind two measured fabrications in one day.

**Cross-references:**
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/reviews/260826-1858-coderev-playmaker-prompt-and-the-two-fabricated-claims.md`
finding A1 and C1;
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/issues/260826-1815_*_a-ranking-rationale-asserts-a-resolver-behaviour-that-does-not-exist-and-it-stands-in-the-active-record.md`;
`rules/critical-stance.md` `## 3. Calibrated certainty`

## The three sentences

`agents/playmaker.md:104`, closing Step 2:

> Do not exceed this read scope. Playmaker is a portfolio agent, not a re-analyst — read enough to rank, no more.

`agents/playmaker.md:129`, in Step 3, which runs next:

> The top-ranked Circle gets a one-paragraph rationale citing file paths

`agents/playmaker.md:270`, in `## Output Style`:

> File:line citations in rationales

Step 2's permitted reads are decision records, five session histories, and analysis files
cross-referenced from a Grounding snapshot (`:100-102`). A Circle's closure note is not among
them. The 260826 run attributed an estimate of "125 to 185 lines" to the C4 closure note,
which carries no such figure, and the read that would have caught it is the read `:104` caps.

The cap is unique in the roster.
`grep -niE "read enough|no more|not a re-|do not exceed" agents/*.md` returns two lines and
both are in this file.

## Why the citation requirement makes it worse rather than better

A rationale is required to carry paths and is nowhere required to have opened one. Under this
contract a fabricated clause with a citation attached reads as more compliant than a hedged
clause with none. Both of the day's failures carried that shape: one asserted a behaviour of
`bin/fusion-paths` with no citation at all, the other asserted the content of a named file
that does not hold it.

## The second half: no local grounding contract

`rules/critical-stance.md` §3 is always-on, is emitted to playmaker, and covers the case
("Reasoned-but-unverified statements are marked `inference:`"). Both sentences were unmarked
assertions and both violated it, so part of this is model error against a correct standing
instruction. What is prompt-side is that seven sibling prompts do not rely on the standing
instruction alone: `agents/consultant.md:18-19`, `agents/coderev.md:10`,
`agents/reconciler.md:8` and `:188`, `agents/curator.md:66`, `agents/ontorev.md:23`,
`agents/analyst.md:286` and `:289`, `agents/orchestrator.md:25`.
`grep -niE "honest|uncertain|speculat|inference|verified" agents/playmaker.md` returns one
line, `:220`, where "verified" means a timestamp comparison.

The consultant's rules are the sharpest in the roster, and `agents/playmaker.md` spends two
paragraphs separating itself from the consultant (`:12`, `:276`) on subject matter alone. The
honesty contract stayed on the consultant's side of a boundary drawn about topics.

## Fix direction

Two clauses, no new argument.

**At `:104`, carve out the verifying read.** Reading a file in order to check a sentence you
are about to write is not re-analysis and is not what the cap is for. The cap's criterion is
currently "enough to rank"; it needs to be "enough to rank, and enough to check what you state".

**At `:129` or in `## Output Style`, bind the citation to the read.** A path in a rationale
names a file this run opened, or the clause is marked `inference:` per `rules/critical-stance.md`
§3. Do not restate §3; point at it.

## Budget

`agents/` has **47 bytes free** (417 796 of a 417 843 budget: baseline 399 843 in
`hooks/lib/__tests__/surface-growth-bound.test.ts:247` plus 18 000 head room). This repair
needs a cut. Two are available inside this same file:

- `agents/playmaker.md:12`, the consultant boundary paragraph, 418 bytes, restated at `:276`,
  which back-references it. Deleting it and its blank line frees about 419 bytes.
- `agents/playmaker.md:281`, the orchestrator boundary entry, 322 bytes, restating `:179-183`
  including the third occurrence of the `--write-activation` alias (`:63`, `:180`, `:281`).

Either pays for this repair. Both together pay for this and for the activation-proposal
repair filed alongside it.

## Scope

One shipped file, `agents/playmaker.md`. No other agent carries the read cap.

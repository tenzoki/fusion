The activation proposal section has no content contract, on the one surface that is never regenerated

---
`agents/playmaker.md:177` specifies the appended `## Activation proposal` block in four words,
"the rationale", with no referent defined for that block and no template anywhere else. It is
the one playmaker output that is written once and never rewritten, and it is where the
260826-1705 fabrication landed.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** High. A false reasoning input in a Circle record is read by every agent
dispatched under that Circle for the Circle's whole life.

**Cross-references:**
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/reviews/260826-1858-coderev-playmaker-prompt-and-the-two-fabricated-claims.md`
findings A2, A3 and B1;
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/issues/260826-1815_*_a-ranking-rationale-asserts-a-resolver-behaviour-that-does-not-exist-and-it-stands-in-the-active-record.md`;
`rules/circle-records.md` `## Circle record template`

## The whole specification

`agents/playmaker.md:177`:

> **Append** a `## Activation proposal` block to the candidate's Circle record. The block contains the rationale, the proposed activation timestamp, and the run identifier of this playmaker session.

"the rationale" is a definite article with no referent defined for this block. Step 3's
one-paragraph constraint at `:129` governs the portfolio's ranked list; nothing carries a
length or content bound across to the append.

**There is no authoring home elsewhere.**
`grep -n "Activation proposal" rules/*.md skills/*/SKILL.md` returns nothing.
`rules/circle-records.md` names playmaker's appended sections once, in the paragraph after the
record template, and only to bind their citation form to the `_*_` wildcard. So the block's
content is entirely at the model's discretion.

The 260826-1705 block ran to five paragraphs under four bold leads at
`circles/260826-1613-cardinality-answered-cut-once-nineteen-cleared/_t_circle.md:109-144`. The
false clause is in the third.

## The prompt holds the rule it needs and binds it to one backlog operation

`agents/playmaker.md:113`, on merging backlog entries:

> **What you write when you merge is a consolidation, not an idea.** Every sentence in a merged entry traces back to something somebody already filed; the moment you would add a thought the store does not hold, you have filed an entry, and filing is not yours

That is a per-sentence traceability requirement, already written in this prompt, in this
voice. It reaches merged backlog text and nothing else: not ranking rationales, not activation
proposals, not portfolio warnings, not history-log prose. Those are every surface the day's
two failures landed on.

## The durability asymmetry is stated four times as mechanics and never as a consequence

- `:52` Circle record sections are written "by append (never rewriting existing content)"
- `:56` `$PORTFOLIO` is "regenerated in full on every run (overwrite)"
- `:162-170` reasons the asymmetry out loud, for citation staleness only: "You overwrite this
  file in full on every run, and between two runs the records you cited move on"
- `:218` the appended sections are "appended with no idempotence guard"

The project has done this reasoning twice and both times about citations, never about content.
The step from "a spelled marker in a Circle record is permanent" to "a false sentence in a
Circle record is permanent" was never taken. And `:52`'s never-rewriting rule means a later
run cannot correct its predecessor's append even having noticed it.

## Fix direction

**Bound the block at `:177`.** Name what it contains, and state that a clause asserting a
mechanism, or asserting what a named file says, is written as a quotation with its path or is
not written at all. This is the highest-value repair per byte in the file.

**Widen `:113`'s scope rather than writing a second rule.** The traceability sentence needs a
wider subject, not a new argument.

**One clause at `:52` or `:56`** saying which errors regeneration corrects and which it does
not, so the agent spends its checking budget on the record and the history log rather than
evenly.

## Budget

`agents/` has **47 bytes free** (417 796 of 417 843). This needs a cut. Deleting
`agents/playmaker.md:12` frees about 419 bytes and loses nothing: the consultant boundary is
restated at `:276`, which back-references it as "the boundary paragraph at the top of this
prompt". `agents/playmaker.md:281` is a second candidate at 322 bytes, restating `:179-183`.
The bytes come out of this same file.

## Scope

One shipped file, `agents/playmaker.md`. Correcting the sentence already in
`_t_circle.md:125-126` is the separate act tracked by `260826-1815_*`.

---
Reconciliation 260827-1528: still open. `agents/playmaker.md:177` still specifies the appended block as "the rationale" with no content contract; no commit has touched the file since filing.

---
Resolved: 260827-1808, plan `260827-1756_*_repair-the-twenty-open-defect-records.md` Bundle C step 2, uncommitted at the time of writing (the orchestrator commits). `agents/playmaker.md` `## Activation proposals` now bounds the appended block to the Step 3 one-paragraph rationale, the proposed timestamp and the run id, and states that a clause asserting a mechanism or the content of a named file is written as a quotation with its path or not at all. The Step 2b traceability sentence's subject is widened to every sentence written into a Circle record, the portfolio or the log; the `## Scope` write line for the Circle record states that an append is permanent and the checking budget goes there first. Bytes paid by deleting the top-of-prompt consultant paragraph; net +316 on `agents/`.
